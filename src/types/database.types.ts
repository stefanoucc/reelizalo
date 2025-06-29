// Temporary database types - will be replaced with generated Supabase types
// Run: supabase gen types typescript --local > src/types/database.types.ts

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          subscription_plan: 'free' | 'pro' | 'enterprise';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          subscription_plan?: 'free' | 'pro' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          subscription_plan?: 'free' | 'pro' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          category: string;
          price: number | null;
          currency: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          category: string;
          price?: number | null;
          currency?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          category?: string;
          price?: number | null;
          currency?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          order: number;
          upload_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt_text?: string | null;
          order: number;
          upload_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          alt_text?: string | null;
          order?: number;
          upload_id?: string;
          created_at?: string;
        };
      };
      video_storyboards: {
        Row: {
          id: string;
          product_id: string;
          scenes: any; // JSON
          template_id: string;
          status: 'pending' | 'generating' | 'completed' | 'failed';
          generated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          scenes: any;
          template_id: string;
          status?: 'pending' | 'generating' | 'completed' | 'failed';
          generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          scenes?: any;
          template_id?: string;
          status?: 'pending' | 'generating' | 'completed' | 'failed';
          generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      subscription_plan: 'free' | 'pro' | 'enterprise';
      video_status: 'pending' | 'generating' | 'completed' | 'failed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
} 