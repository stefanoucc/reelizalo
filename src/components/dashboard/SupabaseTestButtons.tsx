'use client'

import { Button } from '@/components/ui/button'
import {
  testSupabaseConnection,
  testSupabaseAuth,
} from '@/lib/supabase/test-connection'
import { TestTube } from 'lucide-react'

export default function SupabaseTestButtons() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Button
        variant="outline"
        className="w-full justify-start bg-white hover:bg-green-100"
        onClick={async () => {
          const result = await testSupabaseConnection()
          alert(
            result.success ? '✅ Conexión exitosa!' : `❌ Error: ${result.error}`
          )
        }}
      >
        <TestTube className="h-4 w-4 mr-2" />
        Probar Conexión DB
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start bg-white hover:bg-green-100"
        onClick={async () => {
          const result = await testSupabaseAuth()
          alert(
            result.success ? '✅ Auth funcionando!' : `❌ Error: ${result.error}`
          )
        }}
      >
        <TestTube className="h-4 w-4 mr-2" />
        Probar Auth
      </Button>
    </div>
  )
} 