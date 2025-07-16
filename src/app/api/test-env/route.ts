import { NextResponse } from 'next/server'

export async function GET() {
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY
  const hasNodeEnv = !!process.env.NODE_ENV
  
  return NextResponse.json({
    hasOpenAIKey,
    hasNodeEnv,
    nodeEnv: process.env.NODE_ENV,
    openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0
  })
} 