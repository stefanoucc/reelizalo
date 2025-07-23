'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Download, RefreshCw, Copy } from 'lucide-react'
import CanvasEditor from '@/components/canvas/CanvasEditor'

const layoutOptions = [
  { 
    label: 'Single Post', 
    value: 1, 
    description: 'One standalone square image (1:1) for Instagram.',
    promptSuffix: 'Create a single square image (1:1 aspect ratio) optimized for Instagram feed posts.'
  },
  { 
    label: '3-Post Grid', 
    value: 3, 
    description: 'One wide horizontal image split into 3 square parts. Each part is a separate IG post, but together they form a single cohesive visual.',
    promptSuffix: 'Create a wide horizontal image in a 3:1 aspect ratio (e.g. 3000x1000 px) designed to be split into three equal square parts. Each third will be posted individually on Instagram, but when viewed together in order, they should form a single, seamless, and visually compelling story. Avoid placing central elements on the edges of each third; ensure the composition flows naturally across all three sections.'
  },
  { 
    label: '6-Post Grid (2x3)', 
    value: 6, 
    description: 'A grid made of 6 square posts (2 rows, 3 columns) that together form one large image on the IG profile grid.',
    promptSuffix: 'Create a wide horizontal image in a 3:2 aspect ratio (e.g. 3000x2000 px) designed to be split into six equal square parts arranged in 2 rows of 3 columns. Each square will be posted individually on Instagram, but when viewed together in the profile grid, they should form a single, seamless, and visually compelling story. Avoid placing central elements on the edges of each square; ensure the composition flows naturally across all six sections.'
  },
  { 
    label: 'Carousel (1–5 slides)', 
    value: 'carousel', 
    description: 'Multiple square images for Instagram carousel posts.',
    promptSuffix: 'Create multiple square images (1:1 aspect ratio) optimized for Instagram carousel posts. Each image should be visually connected but can stand alone as individual posts.'
  },
  {
    label: 'Pipeline por Intención',
    value: 'intent-pipeline',
    description: 'Selecciona una intención (Sleep, Focus, Recovery) y genera automáticamente imágenes + textos cohesivos.',
    promptSuffix: 'Create images that align with the selected intent and brand values.'
  },
  {
    label: 'Carrusel Narrativo',
    value: 'narrative-carousel',
    description: 'Historia de 4-5 slides siguiendo el arco: Hook → Conflicto → Insight → CTA suave.',
    promptSuffix: 'Create a narrative sequence of images that tells a story following the hook-conflict-insight-CTA structure.'
  }
]

// Intent options - add this as a new constant
const intentOptions = [
  {
    value: 'sleep',
    label: 'Sleep',
    description: 'Descanso profundo y recuperación nocturna',
    colors: ['#015965', '#051F22', '#D4C4FC'],
    tone: 'calming, restorative, peaceful'
  },
  {
    value: 'focus',
    label: 'Focus',
    description: 'Concentración y productividad inteligente',
    colors: ['#006D5A', '#2FFFCC', '#051F22'],
    tone: 'sharp, clear, intentional'
  },
  {
    value: 'recovery',
    label: 'Recovery',
    description: 'Recuperación activa y balance',
    colors: ['#2FFFCC', '#015965', '#F7FBFE'],
    tone: 'balanced, rejuvenating, harmonious'
  }
]

export default function SomaImageGen() {
  const [prompt, setPrompt] = useState('')
  const [layout, setLayout] = useState<number | string>(1)
  const [carouselCount, setCarouselCount] = useState(3)
  const [selectedIntent, setSelectedIntent] = useState<string>('sleep')
  const [narrativeTheme, setNarrativeTheme] = useState<string>('')
  const [intentPipelineResults, setIntentPipelineResults] = useState<any>(null)
  const [narrativeResults, setNarrativeResults] = useState<any>(null)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [promptSuggestion, setPromptSuggestion] = useState('')
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)
  const [contextPrompt, setContextPrompt] = useState(`
      Estilo minimalista y sofisticado, usando los colores de marca SOMA: Petróleo (#015965), Pino (#006D5A), Aquamarina (#2FFFCC), Lavanda (#D4C4FC), Negro (#051F22), Blanco (#F7FBFE). Enfoque en la dualidad entre rendimiento y recuperación inteligente. No incluir ningún tipo de texto, tipografía, letra, número o palabra en la imagen generada. La imagen debe ser completamente visual, sin ningún elemento textual.`.trim())
  
  // Text generation states
  const [generatedTexts, setGeneratedTexts] = useState<string[]>([])
  const [loadingText, setLoadingText] = useState(false)
  const [favoriteTexts, setFavoriteTexts] = useState<string[]>([])

  const [canvasEditorOpen, setCanvasEditorOpen] = useState(false)
  const [selectedImageForCanvas, setSelectedImageForCanvas] = useState<string | null>(null)

  const generateImages = async () => {
    setLoading(true)
    setImages([])
    setGeneratedTexts([])
    setIntentPipelineResults(null)
    setNarrativeResults(null)

    try {
      let endpoint = '/api/generate/images'
      let requestBody: any = { prompt, count: 1, contextPrompt }

      // Handle different layout types
      if (layout === 'intent-pipeline') {
        endpoint = '/api/generate/intent-pipeline'
        requestBody = {
          intent: selectedIntent,
          contextPrompt,
          brandColors: intentOptions.find(opt => opt.value === selectedIntent)?.colors || [],
          tone: intentOptions.find(opt => opt.value === selectedIntent)?.tone || 'balanced'
        }
      } else if (layout === 'narrative-carousel') {
        endpoint = '/api/generate/narrative-carousel'
        requestBody = {
          intent: selectedIntent,
          theme: narrativeTheme,
          contextPrompt,
          brandColors: intentOptions.find(opt => opt.value === selectedIntent)?.colors || []
        }
      } else {
        // Regular generation
        const count = layout === 'carousel' ? carouselCount : (typeof layout === 'number' ? layout : 1)
        requestBody.count = count
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to generate content')
      }

      const result = await res.json()
      
      if (layout === 'intent-pipeline') {
        setIntentPipelineResults(result)
        setImages(result.images || [])
        setGeneratedTexts(result.texts || [])
      } else if (layout === 'narrative-carousel') {
        setNarrativeResults(result)
        setImages(result.images || [])
        setGeneratedTexts(result.slideTexts || [])
      } else {
        setImages(result.urls || [])
      }

    } catch (error: any) {
      alert(`Error: ${error.message}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const generatePromptSuggestion = async () => {
    setLoadingSuggestion(true)

    try {
      // Get the current layout option to include its prompt suffix
      const currentLayout = layoutOptions.find(opt => opt.value === layout)
      const layoutSuffix = currentLayout?.promptSuffix || ''

      const brandContext = {
        introduction: "SOMA merges minimalist design with human vitality. Through wearable rings, we visualize states of being: balance, rest, movement.",
        visualObjective: "Create single-frame images that evoke a feeling or biological state — calmness, depth, energy — using subtle gradients, soft focus, and metaphorical visuals. Avoid busy scenes or storytelling compositions.",
        visualStyle: {
          concept: "Conceptual, modern, and emotionally resonant",
          humanFigure: "Use one human figure max — ideally from a distance or partially blurred",
          backgrounds: "Natural, solid color gradients, or lightly abstracted environments",
          textPlacement: "Central or slightly offset, clean sans-serif font",
          colorTone: "Keep to a tight palette (e.g., turquoise blues for calm, deep greens for energy, dark neutrals for sleep)"
        },
        coreMessaging: {
          connection: "Calm, serene settings; mountains, still lakes; a person alone, centered",
          duality: "Contrast in light/shadow or sharp/blurry; physical rest vs. motion",
          awareness: "Vivid yet minimal; motion trails, slow blur, directional movement"
        },
        targetAudience: {
          athletes: "Motion blur, strides, exertion in abstracted gym or urban backgrounds",
          executives: "Composed stillness, neutral tones, soft ambient lighting",
          highPerformers: "Sleek minimal visuals implying focus and drive"
        },
        colors: {
          aquamarina: "#2FFFCC",
          petroleo: "#015965", 
          pino: "#006D5A",
          lavanda: "#D4C4FC",
          negro: "#051F22",
          blanco: "#F7FBFE"
        },
        contextPrompt: contextPrompt,
        layoutSuffix: layoutSuffix
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

  const generateText = async () => {
    setLoadingText(true)

    try {
      const res = await fetch('/api/generate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          brandContext: contextPrompt,
          favoriteTexts: favoriteTexts 
        })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate text')
      }

      const { texts } = await res.json()
      setGeneratedTexts(texts)
    } catch (error) {
      console.error('Error generating text:', error)
      alert('Error generating text. Please try again.')
    } finally {
      setLoadingText(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Texto copiado al portapapeles')
    } catch (error) {
      console.error('Error copying text:', error)
      alert('Error al copiar el texto')
    }
  }

  const toggleFavorite = (text: string) => {
    if (favoriteTexts.includes(text)) {
      setFavoriteTexts(favoriteTexts.filter(t => t !== text))
      alert('Texto removido de favoritos')
    } else {
      setFavoriteTexts([...favoriteTexts, text])
      alert('Texto agregado a favoritos')
    }
  }

  const removeFavorite = (text: string) => {
    setFavoriteTexts(favoriteTexts.filter(t => t !== text))
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {layoutOptions.map((opt) => (
                  <div
                    key={opt.label}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      layout === opt.value 
                        ? 'border-opacity-100' 
                        : 'border-opacity-50 hover:border-opacity-80'
                    }`}
                    style={{ 
                      borderColor: '#015965',
                      backgroundColor: layout === opt.value ? 'rgba(1, 89, 101, 0.3)' : 'rgba(1, 89, 101, 0.1)',
                    }}
                    onClick={() => setLayout(opt.value)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm" style={{ 
                        color: layout === opt.value ? '#2FFFCC' : '#F7FBFE',
                        fontFamily: 'Saira, sans-serif'
                      }}>
                        {opt.label}
                      </h3>
                      {layout === opt.value && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2FFFCC' }}></div>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ 
                      color: layout === opt.value ? 'rgba(47, 255, 204, 0.8)' : 'rgba(247, 251, 254, 0.7)',
                      fontFamily: 'Manrope, sans-serif'
                    }}>
                      {opt.description}
                    </p>
                  </div>
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

            {/* Intent Selection - Add this after layout options */}
            {(layout === 'intent-pipeline' || layout === 'narrative-carousel') && (
              <div className="space-y-4">
                <label className="block text-lg font-medium" style={{ 
                  color: '#F7FBFE',
                  fontFamily: 'Saira, sans-serif'
                }}>
                  {layout === 'intent-pipeline' ? 'Selecciona la intención' : 'Tema central del conflicto'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {intentOptions.map((intent) => (
                    <div
                      key={intent.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedIntent === intent.value 
                          ? 'border-opacity-100' 
                          : 'border-opacity-50 hover:border-opacity-80'
                      }`}
                      style={{ 
                        borderColor: '#015965',
                        backgroundColor: selectedIntent === intent.value ? 'rgba(1, 89, 101, 0.3)' : 'rgba(1, 89, 101, 0.1)',
                      }}
                      onClick={() => setSelectedIntent(intent.value)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm" style={{ 
                          color: selectedIntent === intent.value ? '#2FFFCC' : '#F7FBFE',
                          fontFamily: 'Saira, sans-serif'
                        }}>
                          {intent.label}
                        </h3>
                        {selectedIntent === intent.value && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2FFFCC' }}></div>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed mb-2" style={{ 
                        color: selectedIntent === intent.value ? 'rgba(47, 255, 204, 0.8)' : 'rgba(247, 251, 254, 0.7)',
                        fontFamily: 'Manrope, sans-serif'
                      }}>
                        {intent.description}
                      </p>
                      <div className="flex gap-1">
                        {intent.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border border-white border-opacity-20"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Narrative Theme Input - Add this for narrative carousel */}
            {layout === 'narrative-carousel' && (
              <div className="space-y-3">
                <label className="block text-lg font-medium" style={{ 
                  color: '#F7FBFE',
                  fontFamily: 'Saira, sans-serif'
                }}>
                  Describe el conflicto o lucha central
                </label>
                <Textarea
                  className="min-h-[80px] border-2 resize-none transition-colors"
                  style={{ 
                    backgroundColor: 'rgba(5, 31, 34, 0.5)',
                    borderColor: '#015965',
                    color: '#F7FBFE'
                  }}
                  placeholder="Ej: Duermo 8 horas pero sigo cansado, siempre ocupado pero no productivo..."
                  value={narrativeTheme}
                  onChange={(e) => setNarrativeTheme(e.target.value)}
                  maxLength={200}
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
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex flex-col justify-end items-end p-3">
                    <a
                      href={src}
                      download={`soma_${
                        layout === 3 ? '3grid' : 
                        layout === 6 ? '6grid' : 
                        layout === 'carousel' ? 'carousel' : 
                        layout === 'intent-pipeline' ? `intent-${selectedIntent}` :
                        layout === 'narrative-carousel' ? 'narrative' :
                        'single'
                      }_${idx + 1}.png`}
                      className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-sm border"
                      style={{ 
                        backgroundColor: 'rgba(1, 89, 101, 0.9)',
                        borderColor: '#2FFFCC'
                      }}
                    >
                      <Download className="w-4 h-4" style={{ color: '#2FFFCC' }} />
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedImageForCanvas(src)
                        setCanvasEditorOpen(true)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-sm border"
                      style={{ 
                        backgroundColor: 'rgba(1, 89, 101, 0.9)',
                        borderColor: '#2FFFCC',
                        color: '#2FFFCC',
                        marginTop: '0.5rem'
                      }}
                    >
                      Editar en Canvas
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TikTok-Style Slideshow Results - Add this after regular image results */}
        {(intentPipelineResults || narrativeResults) && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-wide" style={{ 
              color: '#F7FBFE',
              fontFamily: 'Saira, sans-serif',
              lineHeight: '1.3'
            }}>
              {layout === 'intent-pipeline' ? 'Pipeline por Intención' : 'Carrusel Narrativo'}
            </h2>
            
            {/* Slideshow Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(intentPipelineResults?.images || narrativeResults?.images || []).map((src: string, idx: number) => (
                <div key={idx} className="space-y-3">
                  <div className="aspect-[9/16] rounded-lg overflow-hidden border-2 border-opacity-20 relative" style={{ 
                    backgroundColor: '#015965',
                    borderColor: '#006D5A'
                  }}>
                    <Image 
                      src={src} 
                      alt={`Slide ${idx + 1}`} 
                      width={300} 
                      height={533} 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Text Overlay Preview */}
                    {generatedTexts[idx] && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
                        <div className="text-center">
                          <p className="text-white text-lg font-semibold leading-tight" style={{ 
                            fontFamily: 'Saira, sans-serif',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}>
                            {generatedTexts[idx]}
                          </p>
                          <div className="mt-2 text-xs text-gray-300">
                            Slide {idx + 1}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Slide Actions */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ 
                      color: '#2FFFCC',
                      fontFamily: 'Manrope, sans-serif'
                    }}>
                      {layout === 'narrative-carousel' ? 
                        ['Hook', 'Conflicto', 'Insight', 'CTA', 'Extra'][idx] || `Slide ${idx + 1}` :
                        `Slide ${idx + 1}`
                      }
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generatedTexts[idx] || '')}
                        className="h-8 w-8 p-0 hover:bg-opacity-20"
                        style={{ 
                          color: '#2FFFCC',
                          backgroundColor: 'transparent'
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <a
                        href={src}
                        download={`soma_${layout}_slide_${idx + 1}.png`}
                        className="inline-flex items-center justify-center h-8 w-8 p-0 hover:bg-opacity-20 rounded"
                        style={{ 
                          color: '#2FFFCC',
                          backgroundColor: 'transparent'
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Narrative Structure Preview */}
            {narrativeResults && (
              <div className="border rounded-lg p-6" style={{ 
                backgroundColor: 'rgba(1, 89, 101, 0.2)',
                borderColor: 'rgba(1, 89, 101, 0.4)'
              }}>
                <h3 className="text-lg font-semibold mb-4" style={{ 
                  color: '#2FFFCC',
                  fontFamily: 'Saira, sans-serif'
                }}>
                  Estructura Narrativa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {narrativeResults.structure?.map((step: any, idx: number) => (
                    <div key={idx} className="p-3 rounded" style={{ 
                      backgroundColor: 'rgba(5, 31, 34, 0.3)',
                      border: '1px solid rgba(1, 89, 101, 0.3)'
                    }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ 
                          backgroundColor: '#2FFFCC',
                          color: '#051F22'
                        }}>
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium" style={{ 
                          color: '#2FFFCC',
                          fontFamily: 'Saira, sans-serif'
                        }}>
                          {step.type}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ 
                        color: '#F7FBFE',
                        fontFamily: 'Manrope, sans-serif'
                      }}>
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Canvas Editor Integration */}
        <CanvasEditor
          isOpen={canvasEditorOpen}
          onClose={() => setCanvasEditorOpen(false)}
          selectedImage={selectedImageForCanvas}
          generatedTexts={generatedTexts}
          favoriteTexts={favoriteTexts}
        />
        {/* Text Generation Section */}
        <div className="border rounded-lg p-8 mb-12" style={{ 
          backgroundColor: 'rgba(0, 109, 90, 0.1)',
          borderColor: 'rgba(0, 109, 90, 0.3)'
        }}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-wide mb-2" style={{ 
                color: '#F7FBFE',
                fontFamily: 'Saira, sans-serif',
                lineHeight: '1.3'
              }}>
                Texto sugerido para la imagen
              </h2>
              <p className="text-sm" style={{ 
                color: '#2FFFCC',
                fontFamily: 'Manrope, sans-serif'
              }}>
                Genera frases breves y reflexivas para acompañar tus imágenes
              </p>
            </div>

            {/* Generate Text Button */}
            <Button 
              onClick={generateText} 
              disabled={loadingText}
              className="w-full py-4 text-base font-medium tracking-wide transition-all border-2 hover:opacity-90"
              style={{ 
                backgroundColor: '#015965',
                borderColor: '#015965',
                color: '#F7FBFE',
                fontFamily: 'Manrope, sans-serif'
              }}
            >
              {loadingText ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-opacity-30" style={{ 
                    borderColor: '#2FFFCC',
                    borderTopColor: 'transparent'
                  }}></div>
                  Generando...
                </div>
              ) : (
                'Generar texto'
              )}
            </Button>

            {/* Generated Text Display */}
            {generatedTexts.length > 0 && (
              <div className="border rounded-lg p-6" style={{ 
                backgroundColor: 'rgba(1, 89, 101, 0.2)',
                borderColor: 'rgba(1, 89, 101, 0.4)'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium uppercase tracking-wider" style={{ 
                    color: '#2FFFCC',
                    fontFamily: 'Saira, sans-serif'
                  }}>
                    Textos generados
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={generateText}
                      disabled={loadingText}
                      className="h-8 px-3 hover:bg-opacity-20 text-xs"
                      style={{ 
                        color: '#2FFFCC',
                        backgroundColor: 'transparent',
                        borderColor: '#2FFFCC',
                        border: '1px solid'
                      }}
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${loadingText ? 'animate-spin' : ''}`} />
                      Regenerar
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {generatedTexts.map((text, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ 
                      backgroundColor: 'rgba(5, 31, 34, 0.3)',
                      border: '1px solid rgba(1, 89, 101, 0.3)'
                    }}>
                      <p 
                        className="text-lg font-medium flex-1 text-center"
                        style={{ 
                          color: '#F7FBFE',
                          fontFamily: 'Saira, sans-serif'
                        }}
                      >
                        {text}
                      </p>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(text)}
                          className="h-8 w-8 p-0 hover:bg-opacity-20"
                          style={{ 
                            color: '#2FFFCC',
                            backgroundColor: 'transparent'
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(text)}
                          className="h-8 w-8 p-0 hover:bg-opacity-20"
                          style={{ 
                            color: favoriteTexts.includes(text) ? '#FFD700' : '#2FFFCC',
                            backgroundColor: 'transparent'
                          }}
                        >
                          ★
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {favoriteTexts.length > 0 && (
                  <div className="mt-4 p-4 rounded-lg" style={{ 
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs font-medium" style={{ 
                          color: '#FFD700',
                          fontFamily: 'Saira, sans-serif'
                        }}>
                          FAVORITOS ({favoriteTexts.length})
                        </p>
                        <p className="text-xs mt-1" style={{ 
                          color: 'rgba(255, 215, 0, 0.7)',
                          fontFamily: 'Manrope, sans-serif'
                        }}>
                          Disponibles en el editor de canvas
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFavoriteTexts([])}
                        className="h-6 px-2 text-xs hover:bg-opacity-20"
                        style={{ 
                          color: '#FFD700',
                          backgroundColor: 'transparent',
                          borderColor: '#FFD700',
                          border: '1px solid'
                        }}
                      >
                        Limpiar
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {favoriteTexts.map((text, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded" style={{ 
                          backgroundColor: 'rgba(255, 215, 0, 0.1)',
                          border: '1px solid rgba(255, 215, 0, 0.2)'
                        }}>
                          <p className="text-sm flex-1" style={{ 
                            color: '#F7FBFE',
                            fontFamily: 'Saira, sans-serif'
                          }}>
                            {text}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFavorite(text)}
                            className="h-6 w-6 p-0 hover:bg-opacity-20 ml-2"
                            style={{ 
                              color: '#FFD700',
                              backgroundColor: 'transparent'
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}