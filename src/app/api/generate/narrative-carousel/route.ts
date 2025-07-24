import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

// Helper function to get image size based on social format
function getImageSizeFromSocialFormat(socialFormat: string): '1024x1024' | '1024x1792' | '1792x1024' {
  const formatSizes: Record<string, '1024x1024' | '1024x1792' | '1792x1024'> = {
    'instagram-post': '1024x1024',     // 1:1
    'instagram-story': '1024x1792',    // 9:16 (closest to)
    'linkedin': '1792x1024',           // 1.91:1 (closest to landscape)
    'twitter': '1792x1024',            // 16:9 (closest to landscape)
    'pinterest': '1024x1792'           // 2:3 (closest to vertical)
  }
  
  return formatSizes[socialFormat] || '1024x1024'
}

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const { intent, theme, contextPrompt, brandColors, socialFormat } = await req.json()

    // Generate narrative structure
    const structure = await generateNarrativeStructure(theme, intent)
    
    // Generate corresponding images and texts
    const [images, slideTexts] = await Promise.all([
      generateNarrativeImages(structure, brandColors, contextPrompt, socialFormat),
      generateNarrativeTexts(structure, theme, intent)
    ])

    return NextResponse.json({
      images,
      slideTexts,
      structure,
      theme,
      intent
    })

  } catch (error: any) {
    console.error('[Narrative Carousel API Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function generateNarrativeStructure(theme: string, intent: string) {
  const systemPrompt = `Eres un estratega creativo para SOMA, una marca de tecnología de bienestar. Tu tarea es generar una estructura narrativa de 4 pasos para un carrusel visual en redes sociales. Recibirás un tema/conflicto central y una intención de usuario. Basado en esto, debes generar una 'descripción' específica y visual para cada una de las cuatro etapas: Hook, Conflicto, Insight y CTA. Estas descripciones guiarán a un generador de imágenes de IA. Responde con un objeto JSON que contenga una clave 'structure', cuyo valor sea un array de objetos. Cada objeto en el array debe tener las claves 'type', 'description' y 'purpose'. Mantén los 'purpose' que se te proporcionan en la estructura base.`
  const userPrompt = `Conflicto Central: "${theme}"\nIntención: "${intent}"\n\nEstructura base a adaptar:
[
    { "type": "Hook", "purpose": "Captar la atención con una lucha relatable" },
    { "type": "Conflicto", "purpose": "Generar empatía y conexión" },
    { "type": "Insight", "purpose": "Ofrecer una nueva perspectiva" },
    { "type": "CTA", "purpose": "Presentar la solución sin ser invasivo" }
]`

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No se pudo generar la estructura narrativa.");
  }

  try {
    const parsedContent = JSON.parse(content);
    const structure = parsedContent.structure; 

    if (!structure || !Array.isArray(structure) || structure.length !== 4) {
        console.error("Invalid structure from LLM:", content);
        throw new Error("La estructura narrativa generada no es válida.");
    }
    
    return structure;
  } catch (error) {
      console.error("Error parsing narrative structure from LLM:", error, "Content:", content);
      throw new Error("Error al procesar la estructura narrativa generada.");
  }
}

async function generateNarrativeImages(structure: any[], colors: string[], contextPrompt: string, socialFormat: string) {
  const prompts = structure.map((step, idx) => {
    return `Crea una imagen para la diapositiva ${idx + 1} (${step.type}): ${step.description}. Usa el color palette: verdes, negros y lavanda.`
  })
  
  return await generateImages(prompts, contextPrompt, socialFormat)
}

async function generateNarrativeTexts(structure: any[], theme: string, intent: string) {
  const prompts = structure.map((step, idx) => {
    return `Write a short, punchy text for slide ${idx + 1} (${step.type}) about "${theme}" relating to ${intent}. Keep it under 15 words, conversational tone, in Spanish. Purpose: ${step.purpose}`
  })
  
  return await generateTexts(prompts, intent)
}

async function generateImages(prompts: string[], contextPrompt: string, socialFormat: string) {
  // Get the appropriate image size based on social format
  const imageSize = getImageSizeFromSocialFormat(socialFormat)
  console.log('[Narrative Carousel] Using image size:', imageSize, 'for social format:', socialFormat)
  
  const imagePromises = prompts.map(async (prompt) => {
    const enhancedPrompt = `${contextPrompt} ${prompt}`
    
    console.log("DALL-E Prompt:", enhancedPrompt);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: imageSize,
    })

    return response.data?.[0]?.url
  })

  const results = await Promise.all(imagePromises)
  return results.filter(url => url) // Remove any undefined results
}

async function generateTexts(prompts: string[], intent: string) {
  const systemPrompt = `Eres un generador de frases para SOMA, una marca de tecnología wearable. Genera frases breves en español (máximo 15 palabras), suaves, directas y reflexivas. Están pensadas para colocarse sobre imágenes minimalistas, sin adornos ni explicaciones.`

  const textPromises = prompts.map(async (prompt) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 100
    })

    return response.choices[0]?.message?.content?.trim()
  })

  const results = await Promise.all(textPromises)
  return results.filter(text => text) // Remove any undefined results
} 