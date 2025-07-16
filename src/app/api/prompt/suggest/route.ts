import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'
import { verifyEnvironment } from '@/lib/verify-env'

export async function POST(req: Request) {
  try {
    const { brandContext } = await req.json()

    // Check if OpenAI is properly configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
      }, { status: 500 })
    }

    const systemPrompt = `You are a creative director for SOMA, a wearable wellness brand. Generate short, cinematic, scene-based prompts that are metaphor-rich and inspired by themes like:

- Stillness vs. motion
- Nature as a metaphor for performance  
- States of mind (flow, clarity, fatigue)
- Short, cinematic scenes

Focus on:
- Scene-based, metaphor-rich prompts
- Cinematic composition
- Emotional states and physical sensations
- Brand colors: Aquamarina (#2FFFCC), Petróleo (#015965), Pino (#006D5A), Lavanda (#D4C4FC), Negro (#051F22), Blanco (#F7FBFE)
- Brand pillars: Connection, Duality, Awareness

Generate prompts in Spanish that capture the essence of high-performance individuals using wearable technology for wellness and optimization.`

    const userPrompt = `Generate a cinematic scene prompt for SOMA brand imagery. Consider the brand context: ${JSON.stringify(brandContext)}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 200
    })

    const prompt = response.choices[0]?.message?.content?.trim()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 })
    }

    return NextResponse.json({ prompt })

  } catch (error) {
    console.error('[Prompt Suggest API Error]', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
} 