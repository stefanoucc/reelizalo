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

    const systemPrompt = `You are a creative director for SOMA, a wearable wellness brand. Generate single-frame image prompts that evoke biological states and feelings.

VISUAL OBJECTIVE:
Create prompts for images that evoke calmness, depth, or energy using subtle gradients, soft focus, and metaphorical visuals. Avoid busy scenes or storytelling compositions.

VISUAL STYLE:
- Conceptual, modern, and emotionally resonant
- One human figure max — ideally from a distance or partially blurred
- Natural, solid color gradients, or lightly abstracted environments
- Keep to a tight color palette (turquoise blues for calm, deep greens for energy, dark neutrals for sleep)

CORE MESSAGING BY PILLAR:
- Connection → Calm, serene settings; mountains, still lakes; a person alone, centered
- Duality → Contrast in light/shadow or sharp/blurry; physical rest vs. motion  
- Awareness → Vivid yet minimal; motion trails, slow blur, directional movement

TARGET AUDIENCE CUES:
- Athletes → Motion blur, strides, exertion in abstracted gym or urban backgrounds
- Executives → Composed stillness, neutral tones, soft ambient lighting
- High-performers → Sleek minimal visuals implying focus and drive

IMPORTANT: Generate prompts in Spanish that follow this specific visual direction. Keep your response to exactly 100 words or less.`

    const userPrompt = `Generate a cinematic scene prompt for SOMA brand imagery. Consider the brand context: ${JSON.stringify(brandContext)}

${brandContext.layoutSuffix ? `LAYOUT REQUIREMENTS: ${brandContext.layoutSuffix}` : ''}`

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