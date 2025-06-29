// Configuration for all services and integrations in Reelizalo

export const config = {
  // App settings
  app: {
    name: 'Reelizalo',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4o',
    maxTokens: 4000,
    temperature: 0.7,
  },

  // Remotion configuration
  remotion: {
    region: process.env.REMOTION_AWS_REGION || 'us-east-1',
    functionName: process.env.REMOTION_LAMBDA_FUNCTION_NAME!,
    bucketName: process.env.REMOTION_S3_BUCKET!,
    compositionId: 'product-video',
    outputFormat: 'mp4' as const,
    codec: 'h264' as const,
    crf: 18,
    fps: 30,
    dimensions: {
      width: 1080,
      height: 1920, // TikTok vertical format
    },
  },

  // Upstash configuration
  upstash: {
    redis: {
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    },
    qstash: {
      url: process.env.QSTASH_URL!,
      token: process.env.QSTASH_TOKEN!,
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
    },
  },

  // Cloudflare R2 configuration
  cloudflare: {
    r2: {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL!,
    },
  },

  // TikTok API configuration
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_ID!,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
    redirectUri: process.env.TIKTOK_REDIRECT_URI!,
    scope: 'user.info.basic,video.upload,video.publish',
    apiUrl: 'https://open-api.tiktok.com',
  },

  // Mercado Pago configuration
  mercadoPago: {
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    publicKey: process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!,
    environment: process.env.MERCADO_PAGO_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox',
    webhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET!,
    currency: 'PEN' as const,
  },

  // Monitoring configuration
  monitoring: {
    highlight: {
      projectId: process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID!,
      environment: process.env.NODE_ENV || 'development',
    },
    sentry: {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    },
  },

  // Rate limiting
  rateLimit: {
    videoGeneration: {
      free: { requests: 5, window: '1d' },
      pro: { requests: 50, window: '1d' },
      enterprise: { requests: 500, window: '1d' },
    },
    api: {
      requests: 100,
      window: '15m',
    },
  },

  // File upload limits
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 5,
  },

  // Video generation settings
  video: {
    maxDuration: 60, // seconds
    minDuration: 15, // seconds
    templates: {
      trendy: {
        transitions: ['fade', 'slide'],
        textStyle: 'modern',
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      },
      professional: {
        transitions: ['fade'],
        textStyle: 'clean',
        colors: ['#2C3E50', '#3498DB', '#E74C3C'],
      },
      playful: {
        transitions: ['bounce', 'zoom'],
        textStyle: 'fun',
        colors: ['#F39C12', '#E67E22', '#9B59B6'],
      },
    },
  },

  // Database settings
  database: {
    connectionPooling: true,
    maxConnections: 20,
    connectionTimeout: 30000, // 30 seconds
  },

  // Cache settings
  cache: {
    ttl: {
      user: 300, // 5 minutes
      product: 600, // 10 minutes
      video: 3600, // 1 hour
      storyboard: 1800, // 30 minutes
    },
  },

  // AI prompt templates
  prompts: {
    storyboard: {
      system: `You are an expert TikTok content creator specialized in product marketing. 
Create engaging video storyboards that convert viewers into customers.
Focus on:
- Hook viewers in the first 3 seconds
- Showcase product benefits clearly  
- Use trending formats and transitions
- Include compelling call-to-action
- Optimize for mobile viewing
- Keep cultural preferences in mind for LATAM audience`,
      
      user: (product: { name: string; description: string; category: string }) => 
        `Create a TikTok video storyboard for this product:
Name: ${product.name}
Description: ${product.description}
Category: ${product.category}

Generate a JSON storyboard with 3-5 scenes, each 3-4 seconds long.
Include scene descriptions, text overlays, transitions, and visual effects.
Make it engaging and conversion-focused for LATAM audience.`,
    },
  },

  // Webhook endpoints
  webhooks: {
    mercadoPago: '/api/webhooks/mercado-pago',
    tiktok: '/api/webhooks/tiktok',
    remotion: '/api/webhooks/remotion',
    qstash: '/api/webhooks/qstash',
  },

  // Feature flags
  features: {
    tiktokAutoPublish: process.env.FEATURE_TIKTOK_AUTO_PUBLISH === 'true',
    aiStoryboardGeneration: process.env.FEATURE_AI_STORYBOARD === 'true',
    videoTemplates: process.env.FEATURE_VIDEO_TEMPLATES === 'true',
    advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
  },
} as const;

// Type-safe environment variable checker
export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'MERCADO_PAGO_ACCESS_TOKEN',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Helper to get configuration with fallbacks
export function getConfig<T extends keyof typeof config>(section: T): typeof config[T] {
  return config[section];
}

// Environment-specific settings
export const isDevelopment = config.app.environment === 'development';
export const isProduction = config.app.environment === 'production';
export const isTest = config.app.environment === 'test'; 