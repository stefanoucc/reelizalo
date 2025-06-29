'use client'

import { Button } from '@/components/ui/button'
import { testOpenAIConnection } from '@/lib/openai/test-connection'
import { TestTube } from 'lucide-react'

export default function OpenAITestButton() {
  return (
    <Button
      variant="outline"
      className="w-full justify-start bg-white hover:bg-blue-100"
      onClick={async () => {
        const result = await testOpenAIConnection()
        if (result.success) {
          alert(
            `✅ Conexión con OpenAI exitosa!\nModelos encontrados: ${result.data.modelCount}\nPrimer modelo: ${result.data.firstModelId}`
          )
        } else {
          alert(`❌ Error en la conexión con OpenAI: ${result.error}`)
        }
      }}
    >
      <TestTube className="h-4 w-4 mr-2" />
      Probar Conexión OpenAI
    </Button>
  )
} 