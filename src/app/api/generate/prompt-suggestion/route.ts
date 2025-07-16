import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

export async function POST(req: Request) {
  try {
    const systemPrompt = `You are a creative assistant specializing in generating image prompts for SOMA, a high-performance wearable technology company targeting athletes, executives, and high-performance enthusiasts in Latin America.

Generate concise, creative image prompts (50-100 words) that align with SOMA's brand identity:

BRAND PILLARS:
- Connection: Technology seamlessly integrating with human biology
- Duality: Balance between advanced tech and natural human experience  
- Awareness: Enhanced self-knowledge and conscious optimization

TARGET AUDIENCE:
- Athletes: Professional and amateur athletes seeking performance optimization
- Executives: Business leaders and entrepreneurs focused on high performance
- High-Performance Enthusiasts: Individuals committed to personal optimization

VISUAL IDENTITY:
- Colors: Aquamarina (#2FFFCC), Petróleo (#015965), Pino (#006D5A), Lavanda (#D4C4FC), Negro (#051F22), Blanco (#F7FBFE)
- Feel: Clean, modern, contemplative but dynamic
- Focus: Performance, technology integration, wellness optimization

PRODUCT INTEGRATION:
- Always include SOMA wearable technology (anillo SOMA, wearable SOMA)
- Emphasize biometric monitoring and performance insights
- Show technology as subtle and non-intrusive

Generate one creative prompt that targets athletes, executives, or high-performance individuals, featuring SOMA technology prominently with brand color references. Make it dynamic and achievement-oriented, not passive.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: "Generate a creative image prompt for SOMA that targets athletes, executives, or high-performance individuals, featuring wearable technology and performance optimization with brand color references."
        }
      ],
      max_tokens: 150,
      temperature: 0.8
    })

    const suggestion = response.choices[0]?.message?.content?.trim()
    
    if (!suggestion) {
      return NextResponse.json({ error: 'Failed to generate prompt suggestion' }, { status: 500 })
    }

    return NextResponse.json({ suggestion })

  } catch (error) {
    console.error('[Prompt Suggestion API Error]', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
} 