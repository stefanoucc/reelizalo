'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Download, RefreshCw } from 'lucide-react'

const layoutOptions = [
  { label: 'Single Post', value: 1 },
  { label: '3-Post Grid', value: 3 },
  { label: '6-Post Grid (2x3)', value: 6 },
  { label: 'Carousel (1–5 slides)', value: 'carousel' }
]

export default function SomaImageGen() {
  const [prompt, setPrompt] = useState('')
  const [layout, setLayout] = useState<number | string>(1)
  const [carouselCount, setCarouselCount] = useState(3)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [promptSuggestion, setPromptSuggestion] = useState('')
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)
  const [contextPrompt, setContextPrompt] = useState(`
      Estilo minimalista y sofisticado, usando los colores de marca SOMA: Petróleo (#015965), Pino (#006D5A), Aquamarina (#2FFFCC), Lavanda (#D4C4FC), Negro (#051F22), Blanco (#F7FBFE). Enfoque en la dualidad entre rendimiento y recuperación inteligente.`.trim())

  const generateImages = async () => {
    setLoading(true)
    setImages([])
    const count = layout === 'carousel' ? carouselCount : layout

    try {
      const res = await fetch('/api/generate/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, count, contextPrompt }),
      })

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate images');
      }

      const { urls } = await res.json()
      setImages(urls)
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false)
    }
  }

  const generatePromptSuggestion = async () => {
    setLoadingSuggestion(true)

    try {
      const brandContext = {
        brandEssence: {
          introduction: "SOMA combines advanced technology with human biology, offering intuitive wearable rings that enhance well-being.",
          targetAudience: "Athletes, executives, and high-performance enthusiasts.",
          vision: "Lead the wearable tech market in Latin America.",
          mission: "Create technology that improves and understands health.",
          pillars: "Connection, Duality, Awareness."
        },
        colors: {
          aquamarina: "#2FFFCC",
          petroleo: "#015965", 
          pino: "#006D5A",
          lavanda: "#D4C4FC",
          negro: "#051F22",
          blanco: "#F7FBFE"
        },
        contextPrompt: contextPrompt
      }

      const res = await fetch('/api/prompt/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandContext })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate prompt suggestion')
      }

      const { prompt } = await res.json()
      setPromptSuggestion(prompt)
    } catch (error) {
      console.error('Error generating prompt suggestion:', error)
      // Show error to user instead of fallback
      alert('Error generating prompt suggestion. Please try again.')
    } finally {
      setLoadingSuggestion(false)
    }
  }

  useEffect(() => {
    generatePromptSuggestion()
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#051F22' }}>
      {/* Header */}
      <header className="border-b border-opacity-20" style={{ borderColor: '#006D5A', backgroundColor: '#051F22' }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-center tracking-wide" style={{ 
            color: '#F7FBFE', 
            fontFamily: 'Saira, sans-serif',
            lineHeight: '1.3'
          }}>
            Generador de Imágenes SOMA
          </h1>
                     <p className="text-center mt-3 text-base" style={{ 
             color: '#2FFFCC',
             fontFamily: 'Manrope, sans-serif',
             fontWeight: '400',
             lineHeight: '1.4'
           }}>
             Genera imágenes que capturan la dualidad entre tecnología avanzada y rendimiento humano
           </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Input Section */}
        <div className="border rounded-lg p-8 mb-12" style={{ 
          backgroundColor: 'rgba(0, 109, 90, 0.1)',
          borderColor: 'rgba(0, 109, 90, 0.3)'
        }}>
          <div className="space-y-6">
            

            {/* Context Prompt */}
            <div className="space-y-3">
              <label className="block text-lg font-medium" style={{ 
                color: '#F7FBFE',
                fontFamily: 'Saira, sans-serif'
              }}>
                Contexto de Marca
              </label>
              <Textarea
                className="min-h-[100px] border-2 resize-none transition-colors"
                style={{ 
                  backgroundColor: 'rgba(5, 31, 34, 0.5)',
                  borderColor: '#015965',
                  color: '#F7FBFE'
                }}
                placeholder="Define el contexto de marca para las imágenes generadas..."
                value={contextPrompt}
                onChange={(e) => setContextPrompt(e.target.value)}
                maxLength={500}
              />
              <div className="text-sm text-right" style={{ 
                color: '#2FFFCC',
                fontFamily: 'Manrope, sans-serif'
              }}>
                {contextPrompt.length} / 500
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-3">
              <label className="block text-lg font-medium" style={{ 
                color: '#F7FBFE',
                fontFamily: 'Saira, sans-serif'
              }}>
                Describe tu imagen
              </label>
              <Textarea
                className="min-h-[120px] border-2 resize-none transition-colors"
                style={{ 
                  backgroundColor: 'rgba(5, 31, 34, 0.5)',
                  borderColor: '#015965',
                  color: '#F7FBFE'
                }}
                placeholder="Atleta profesional consultando métricas de rendimiento en su anillo SOMA, tecnología avanzada para alto rendimiento..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={1000}
              />
              <div className="text-sm text-right" style={{ 
                color: '#2FFFCC',
                fontFamily: 'Manrope, sans-serif'
              }}>
                {prompt.length} / 1000
              </div>
            </div>

            {/* Prompt Suggestion */}
            {promptSuggestion && (
              <div className="border rounded-lg p-4" style={{ 
                backgroundColor: 'rgba(1, 89, 101, 0.2)',
                borderColor: 'rgba(1, 89, 101, 0.4)'
              }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium uppercase tracking-wider" style={{ 
                      color: '#2FFFCC',
                      fontFamily: 'Saira, sans-serif'
                    }}>
                      Inspiración
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generatePromptSuggestion}
                    disabled={loadingSuggestion}
                    className="h-8 w-8 p-0 hover:bg-opacity-20"
                    style={{ 
                      color: '#2FFFCC',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingSuggestion ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <p 
                  className="text-base cursor-pointer hover:opacity-80 transition-opacity leading-relaxed"
                  style={{ 
                    color: '#F7FBFE',
                    fontFamily: 'Manrope, sans-serif'
                  }}
                  onClick={() => setPrompt(promptSuggestion)}
                >
                  {promptSuggestion}
                </p>
              </div>
            )}

            {/* Layout Options */}
            <div className="space-y-4">
              <label className="block text-lg font-medium" style={{ 
                color: '#F7FBFE',
                fontFamily: 'Saira, sans-serif'
              }}>
                Formato
              </label>
              <div className="flex flex-wrap gap-3">
                {layoutOptions.map((opt) => (
                  <Button
                    key={opt.label}
                    variant="outline"
                    size="sm"
                    onClick={() => setLayout(opt.value)}
                    className={`text-sm font-medium transition-colors border-2 ${
                      layout === opt.value 
                        ? 'border-opacity-100' 
                        : 'border-opacity-50 hover:border-opacity-80'
                    }`}
                    style={{ 
                      borderColor: '#015965',
                      backgroundColor: layout === opt.value ? 'rgba(1, 89, 101, 0.3)' : 'transparent',
                      color: layout === opt.value ? '#2FFFCC' : '#F7FBFE',
                      fontFamily: 'Manrope, sans-serif'
                    }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Carousel Slider */}
            {layout === 'carousel' && (
              <div className="space-y-3">
                <label className="block text-lg font-medium" style={{ 
                  color: '#F7FBFE',
                  fontFamily: 'Saira, sans-serif'
                }}>
                  Slides: {carouselCount}
                </label>
                <Slider
                  value={[carouselCount]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(val) => setCarouselCount(val[0])}
                  className="w-full"
                />
              </div>
            )}

            {/* Generate Button */}
            <Button 
              onClick={generateImages} 
              disabled={loading || !prompt.trim()}
              className="w-full py-4 text-base font-medium tracking-wide transition-all border-2 hover:opacity-90"
              style={{ 
                backgroundColor: '#015965',
                borderColor: '#015965',
                color: '#F7FBFE',
                fontFamily: 'Manrope, sans-serif'
              }}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-opacity-30" style={{ 
                    borderColor: '#2FFFCC',
                    borderTopColor: 'transparent'
                  }}></div>
                  Generando...
                </div>
              ) : (
                'Generar Imágenes'
              )}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {images.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-wide" style={{ 
              color: '#F7FBFE',
              fontFamily: 'Saira, sans-serif',
              lineHeight: '1.3'
            }}>
              Imágenes generadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((src, idx) => (
                <div key={idx} className="relative group">
                  <div className="aspect-square rounded-sm overflow-hidden border-2 border-opacity-20" style={{ 
                    backgroundColor: '#015965',
                    borderColor: '#006D5A'
                  }}>
                    <Image 
                      src={src} 
                      alt={`Generated ${idx + 1}`} 
                      width={400} 
                      height={400} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                    <a
                      href={src}
                      download={`soma_image_${idx + 1}.png`}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-sm border"
                      style={{ 
                        backgroundColor: 'rgba(1, 89, 101, 0.9)',
                        borderColor: '#2FFFCC'
                      }}
                    >
                      <Download className="w-4 h-4" style={{ color: '#2FFFCC' }} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}