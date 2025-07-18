import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const { intent, contextPrompt, brandColors, tone } = await req.json()
    
    console.log('[Intent Pipeline] Received request:', { intent, brandColors, tone })

    // Generate 3-4 images based on intent
    const imagePrompts = generateIntentImagePrompts(intent, tone, brandColors)
    const textPrompts = generateIntentTextPrompts(intent, tone)
    
    console.log('[Intent Pipeline] Generated prompts:', { 
      imagePrompts: imagePrompts.length, 
      textPrompts: textPrompts.length 
    })

    // Call OpenAI for images and texts
    const [images, texts] = await Promise.all([
      generateImages(imagePrompts, contextPrompt),
      generateTexts(textPrompts, intent)
    ])
    
    console.log('[Intent Pipeline] Generated results:', { 
      images: images.length, 
      texts: texts.length 
    })

    return NextResponse.json({
      images,
      texts,
      intent,
      tone,
      brandColors
    })

  } catch (error: any) {
    console.error('[Intent Pipeline API Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function generateIntentImagePrompts(intent: string, tone: string, colors: string[]) {
  // Ensure we have safe color access
  const color1 = colors[0] || '#015965'
  const color2 = colors[1] || '#051F22'
  const color3 = colors[2] || '#2FFFCC'
  
  const basePrompts = {
    sleep: [
      `Serene bedroom scene with ${tone} lighting, person in peaceful rest, minimalist design`,
      `Minimalist nighttime environment with ${color1} and ${color2} tones, calming atmosphere`,
      `Close-up of hands holding a sleep tracking device, ${tone} atmosphere, soft lighting`
    ],
    focus: [
      `Person in deep concentration, ${tone} workspace with ${color1} accents, minimalist setup`,
      `Minimalist desk setup with productivity tools, ${tone} lighting, focused environment`,
      `Abstract representation of mental clarity using ${color2} gradients, conceptual design`
    ],
    recovery: [
      `Person in gentle stretching or meditation pose, ${tone} natural setting, peaceful environment`,
      `Balanced lifestyle scene with ${color1} and ${color3} harmony, restorative atmosphere`,
      `Recovery tools and peaceful environment, ${tone} atmosphere, minimalist composition`
    ]
  }
  
  return basePrompts[intent as keyof typeof basePrompts] || basePrompts.sleep
}

function generateIntentTextPrompts(intent: string, tone: string) {
  const textPrompts = {
    sleep: [
      "Generate a short, reflective phrase about the quality of rest over quantity of hours",
      "Create a gentle reminder about the importance of sleep recovery",
      "Write a brief insight about how technology can improve sleep quality"
    ],
    focus: [
      "Generate a phrase about the difference between being busy and being productive",
      "Create a short insight about intentional focus in a distracted world",
      "Write a brief reflection on the power of sustained attention"
    ],
    recovery: [
      "Generate a phrase about the balance between effort and rest",
      "Create a short insight about active recovery and restoration",
      "Write a brief reflection on listening to your body's needs"
    ]
  }
  
  return textPrompts[intent as keyof typeof textPrompts] || textPrompts.sleep
}

async function generateImages(prompts: string[], contextPrompt: string) {
  console.log('[Intent Pipeline] Starting image generation for', prompts.length, 'prompts')
  
  const imagePromises = prompts.map(async (prompt, index) => {
    // Simplify the context prompt to avoid potential issues
    const simplifiedContext = "Minimalist, sophisticated design with SOMA brand colors. No text or typography in the image."
    const enhancedPrompt = `${simplifiedContext} ${prompt}`
    
    // Ensure prompt is not too long (OpenAI has a limit)
    const finalPrompt = enhancedPrompt.length > 1000 ? enhancedPrompt.substring(0, 1000) : enhancedPrompt
    
    console.log(`[Intent Pipeline] Generating image ${index + 1}:`, finalPrompt.substring(0, 100) + '...')
    console.log(`[Intent Pipeline] Prompt length:`, finalPrompt.length, 'characters')
    
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: finalPrompt,
        n: 1,
        size: '1024x1024',
      })

      const imageUrl = response.data?.[0]?.url
      console.log(`[Intent Pipeline] Image ${index + 1} generated:`, !!imageUrl)
      return imageUrl
    } catch (error) {
      console.error(`[Intent Pipeline] Error generating image ${index + 1}:`, error)
      return null
    }
  })

  const results = await Promise.all(imagePromises)
  const filteredResults = results.filter(url => url) // Remove any undefined results
  console.log('[Intent Pipeline] Image generation complete:', filteredResults.length, 'successful out of', prompts.length)
  return filteredResults
}

async function generateTexts(prompts: string[], intent: string) {
  const systemPrompt = `Eres un generador de frases para SOMA, una marca de tecnología wearable. Genera frases breves en español (máximo 4 palabras), suaves, directas y reflexivas. Están pensadas para colocarse sobre imágenes minimalistas, sin adornos ni explicaciones.`

  const textPromises = prompts.map(async (prompt) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 50
    })

    return response.choices[0]?.message?.content?.trim()
  })

  const results = await Promise.all(textPromises)
  return results.filter(text => text) // Remove any undefined results
} 