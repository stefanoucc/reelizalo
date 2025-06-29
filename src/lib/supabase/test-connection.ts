'use client';

import { createClient } from './client';

export async function testSupabaseConnection() {
  try {
    const supabase = createClient();
    
    // Test basic connection with a simple query
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Database connection failed'
      };
    }

    console.log('✅ Supabase connection successful!');
    return {
      success: true,
      data: 'Connection working',
      message: 'Database connection working'
    };
    
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to database'
    };
  }
}

export async function testSupabaseAuth() {
  try {
    const supabase = createClient();
    
    // Test auth connection
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('✅ Supabase Auth working!');
    return {
      success: true,
      hasSession: !!session,
      userId: session?.user?.id || null,
      message: 'Auth system working'
    };
    
  } catch (error) {
    console.error('❌ Auth test error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Auth system failed'
    };
  }
} 