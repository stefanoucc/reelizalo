import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (prompt.length > 1000) {
      return NextResponse.json({ error: 'Prompt cannot be longer than 1000 characters' }, { status: 400 })
    }

    // Generate image using GPT Image 1
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: '1024x1024',
    })

    // Return the generated image URL
    const imageUrl = response.data?.[0]?.url
    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }
    return NextResponse.json({ url: imageUrl })

  } catch (error) {
    console.error('[Generate Image API Error]', error)
    
    // Handle OpenAI API errors
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
} 