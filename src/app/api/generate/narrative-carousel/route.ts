import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const { intent, theme, contextPrompt, brandColors } = await req.json()

    // Generate narrative structure
    const structure = generateNarrativeStructure(theme, intent)
    
    // Generate corresponding images and texts
    const [images, slideTexts] = await Promise.all([
      generateNarrativeImages(structure, brandColors, contextPrompt),
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

function generateNarrativeStructure(theme: string, intent: string) {
  return [
    {
      type: "Hook",
      description: `Contradiction or attention-grabbing statement about ${theme}`,
      purpose: "Catch attention with relatable struggle"
    },
    {
      type: "Conflicto",
      description: `Personal experience or inner struggle related to ${theme}`,
      purpose: "Build empathy and connection"
    },
    {
      type: "Insight",
      description: `Reframe belief about ${theme} with deeper truth`,
      purpose: "Provide new perspective"
    },
    {
      type: "CTA",
      description: `Soft introduction of SOMA Ring as helpful tool for ${intent}`,
      purpose: "Present solution without being pushy"
    }
  ]
}

async function generateNarrativeImages(structure: any[], colors: string[], contextPrompt: string) {
  const prompts = structure.map((step, idx) => {
    const colorPalette = colors.join(', ')
    return `${contextPrompt} Create an image for slide ${idx + 1} (${step.type}): ${step.description}. Use color palette: ${colorPalette}. Style should be emotional and relatable, not corporate.`
  })
  
  return await generateImages(prompts, contextPrompt)
}

async function generateNarrativeTexts(structure: any[], theme: string, intent: string) {
  const prompts = structure.map((step, idx) => {
    return `Write a short, punchy text for slide ${idx + 1} (${step.type}) about "${theme}" relating to ${intent}. Keep it under 15 words, conversational tone, in Spanish. Purpose: ${step.purpose}`
  })
  
  return await generateTexts(prompts, intent)
}

async function generateImages(prompts: string[], contextPrompt: string) {
  const imagePromises = prompts.map(async (prompt) => {
    const enhancedPrompt = `${contextPrompt} ${prompt}`
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: '1024x1024',
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
      temperature: 0.7,
      max_tokens: 100
    })

    return response.choices[0]?.message?.content?.trim()
  })

  const results = await Promise.all(textPromises)
  return results.filter(text => text) // Remove any undefined results
} 