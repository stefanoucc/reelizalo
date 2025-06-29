// Base types for the Reelizalo platform

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  price?: number;
  currency?: string;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  order: number;
  upload_id: string;
}

export interface VideoStoryboard {
  id: string;
  product_id: string;
  scenes: Scene[];
  template_id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  generated_at?: string;
}

export interface Scene {
  id: string;
  order: number;
  duration: number; // in seconds
  type: 'product_showcase' | 'text_overlay' | 'call_to_action' | 'transition';
  content: {
    text?: string;
    image_url?: string;
    animation: 'fade' | 'slide' | 'zoom' | 'bounce';
    background_color?: string;
    text_color?: string;
    font_family?: string;
  };
}

export interface GeneratedVideo {
  id: string;
  product_id: string;
  storyboard_id: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  file_size: number;
  status: 'rendering' | 'completed' | 'failed';
  tiktok_published: boolean;
  tiktok_post_id?: string;
  tiktok_url?: string;
  created_at: string;
}

export interface AIPromptResponse {
  storyboard: Omit<VideoStoryboard, 'id' | 'product_id' | 'status'>;
  reasoning: string;
  confidence_score: number;
}

// TikTok API types
export interface TikTokUploadResponse {
  publish_id: string;
  upload_url: string;
  status: 'uploading' | 'processing' | 'published' | 'failed';
}

// Mercado Pago types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: 'PEN' | 'USD';
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  video_limit: number;
}

export interface PaymentResult {
  success: boolean;
  payment_id?: string;
  error_message?: string;
}

// Queue system types
export interface QueueJob {
  id: string;
  type: 'generate_storyboard' | 'render_video' | 'publish_tiktok';
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at?: string;
  error_message?: string;
}

// Form types
export interface ProductUploadForm {
  name: string;
  description: string;
  category: string;
  price?: number;
  currency?: string;
  images: File[];
}

export interface VideoGenerationRequest {
  product_id: string;
  template_preference?: 'trendy' | 'professional' | 'playful';
  target_audience?: 'gen_z' | 'millennials' | 'gen_x' | 'all';
  video_style?: 'fast_paced' | 'calm' | 'energetic';
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export type VideoGenerationStatus = 
  | 'idle'
  | 'uploading_images'
  | 'generating_storyboard'
  | 'rendering_video'
  | 'publishing_tiktok'
  | 'completed'
  | 'failed';

// Component Props types
export interface DashboardStats {
  total_videos: number;
  videos_this_month: number;
  tiktok_views: number;
  subscription_expires_at?: string;
}

// Monitoring types
export interface PerformanceMetric {
  endpoint: string;
  response_time: number;
  status_code: number;
  timestamp: string;
  user_id?: string;
}

export interface ErrorLog {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  user_id?: string;
  request_id?: string;
  timestamp: string;
} 