'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AuthButtons({ user }: { user: any }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button>Iniciar Sesión</Button>
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">Hola, {user.email}</span>
      <Link href="/dashboard">
        <Button variant="outline">Ir al Panel</Button>
      </Link>
      <Button onClick={handleSignOut}>Cerrar Sesión</Button>
    </div>
  )
} 