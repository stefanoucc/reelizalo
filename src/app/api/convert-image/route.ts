import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Invalid image URL provided' }, { status: 400 })
    }

    // Validate that it's a proper URL
    try {
      new URL(imageUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Fetch the image server-side (no CORS restrictions)
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch image: ${response.status}` }, { status: response.status })
    }

    // Get the image as buffer
    const buffer = await response.arrayBuffer()
    
    // Get the content type from response headers
    const contentType = response.headers.get('content-type') || 'image/png'
    
    // Convert to base64
    const base64 = Buffer.from(buffer).toString('base64')
    
    // Create data URL
    const dataUrl = `data:${contentType};base64,${base64}`
    
    return NextResponse.json({ dataUrl })
    
  } catch (error: any) {
    console.error('Error converting image:', error)
    return NextResponse.json({ error: error.message || 'Failed to convert image' }, { status: 500 })
  }
} 