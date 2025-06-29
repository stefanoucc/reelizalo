'use client';

import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthForm() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div className="w-full max-w-md mx-auto">
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          style: {
            button: {
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              padding: '0.5rem 1rem',
            },
            input: {
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              padding: '0.5rem 0.75rem',
              border: '1px solid #e2e8f0',
            },
            container: {
              gap: '1rem',
            },
          },
        }}
        theme="light"
        showLinks={true}
        providers={['google']}
        redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`}
      />
    </div>
  );
} 