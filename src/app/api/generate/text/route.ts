import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

export async function POST(req: Request) {
  try {
    const { brandContext, favoriteTexts } = await req.json()

    // Check if OpenAI is properly configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
      }, { status: 500 })
    }

    const systemPrompt = `Eres un generador de frases para una marca de tecnología wearable llamada SOMA. La marca transmite calma, sofisticación y conexión con el cuerpo. Inspírate en conceptos como descanso, energía, recuperación, enfoque y movimiento consciente.

Genera frases breves en español (máximo 4 palabras), suaves, directas y reflexivas. Están pensadas para colocarse sobre imágenes minimalistas, sin adornos ni explicaciones.

Evita repetir palabras en frases consecutivas, especialmente términos como "equilibrio", "energía", "salud", etc. Usa verbos o expresiones humanas que evoquen sensación o acción.

Ejemplos:
Llega más lejos  
Descansa profundo  
Mantente estable  
Respira sin prisa  
Conecta contigo mismo

IMPORTANTE: Genera exactamente 3 frases diferentes, una por línea, sin guiones ni símbolos al inicio.`

    let userPrompt = `Genera 3 frases breves y reflexivas para SOMA, considerando el contexto de marca: ${brandContext}`
    
    if (favoriteTexts && favoriteTexts.length > 0) {
      const favoritesList = favoriteTexts.join(', ')
      userPrompt += `\n\nEl usuario tiene estas frases como favoritas: "${favoritesList}". Genera las 3 nuevas frases con un estilo similar pero variado, inspirándote en estos ejemplos.`
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 150
    })

    const content = response.choices[0]?.message?.content?.trim()
    
    if (!content) {
      return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 })
    }

    // Split the response into 3 texts
    const texts = content.split('\n').filter(text => text.trim().length > 0).slice(0, 3)
    
    if (texts.length === 0) {
      return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 })
    }

    return NextResponse.json({ texts })

  } catch (error) {
    console.error('[Text Generation API Error]', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
} 