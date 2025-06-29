# 🔐 Environment Variables Setup - Reelizalo

## 📋 Variables de Entorno Requeridas

### 🚀 Configuración Básica

1. **Crea tu archivo `.env.local`** en la raíz del proyecto:

```bash
# Copiar desde este archivo
cp docs/ENVIRONMENT_SETUP.md .env.local
```

2. **Variables básicas para desarrollo**:

```env
# ==============================================
# 🌐 APP CONFIGURATION
# ==============================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Reelizalo

# ==============================================
# 🗄️ SUPABASE (Database & Auth)
# ==============================================
# ⭐ REQUERIDO PARA EMPEZAR
# Obtener de: https://supabase.com/dashboard/projects
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==============================================
# 🤖 OPENAI (GPT-4o for Storyboards)
# ==============================================
# ⭐ CRÍTICO PARA GENERACIÓN DE IA
# Obtener de: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx

# ==============================================
# ☁️ CLOUDFLARE R2 (File Storage)
# ==============================================
# 📤 REQUERIDO PARA UPLOADS
# Obtener de: https://dash.cloudflare.com/
CLOUDFLARE_ACCOUNT_ID=a1b2c3d4e5f6g7h8i9j0
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=reelizalo-uploads
CLOUDFLARE_R2_PUBLIC_URL=https://pub-1234567890abcdef.r2.dev

# ==============================================
# 🔴 UPSTASH (Redis & QStash)
# ==============================================
# 🚀 REQUERIDO PARA COLAS
# Obtener de: https://console.upstash.com/
UPSTASH_REDIS_REST_URL=https://amazing-mouse-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXBBBCCCDDDeeefff

# QStash para sistema de colas
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=qstash_xxxxxxxxxxxxxx
QSTASH_CURRENT_SIGNING_KEY=sig_xxxxxxxxxxxxxx
QSTASH_NEXT_SIGNING_KEY=sig_yyyyyyyyyyyyyy

# ==============================================
# 🎬 REMOTION (Video Rendering)
# ==============================================
# 🎥 CONFIGURAR EN SEMANA 3
REMOTION_AWS_REGION=us-east-1
REMOTION_LAMBDA_FUNCTION_NAME=remotion-render-reelizalo
REMOTION_S3_BUCKET=remotion-reelizalo-renders

# ==============================================
# 📱 TIKTOK API (Auto Publishing)
# ==============================================
# 📲 CONFIGURAR EN SEMANA 3
# Obtener de: https://developers.tiktok.com/
TIKTOK_CLIENT_ID=aw1234567890
TIKTOK_CLIENT_SECRET=secret_abcdef1234567890
TIKTOK_REDIRECT_URI=http://localhost:3000/api/auth/tiktok/callback

# ==============================================
# 💳 MERCADO PAGO (LATAM Payments)
# ==============================================
# 💰 CONFIGURAR EN SEMANA 4
# Obtener de: https://www.mercadopago.com.pe/developers/
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-1234567890-abcdef-1234567890-abcdef1234567890
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR-abcdef1234567890-123456-1234567890abcdef-123456789
MERCADO_PAGO_ENVIRONMENT=sandbox
MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret_key

# ==============================================
# 📊 MONITORING & ANALYTICS
# ==============================================
# 🔍 CONFIGURAR EN SEMANA 4
# Highlight.io - Performance monitoring
NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID=your_highlight_project_id

# Sentry - Error tracking
NEXT_PUBLIC_SENTRY_DSN=https://1234567890abcdef@o123456.ingest.sentry.io/123456

# ==============================================
# 🚀 FEATURE FLAGS
# ==============================================
FEATURE_TIKTOK_AUTO_PUBLISH=true
FEATURE_AI_STORYBOARD=true
FEATURE_VIDEO_TEMPLATES=true
FEATURE_ADVANCED_ANALYTICS=false

# ==============================================
# 🔐 SECURITY & ENCRYPTION
# ==============================================
# Generar con: openssl rand -base64 32
NEXTAUTH_SECRET=your_super_secret_key_min_32_characters_long
NEXTAUTH_URL=http://localhost:3000

# JWT para tokens personalizados
JWT_SECRET=another_super_secret_key_for_jwt_tokens

# ==============================================
# 🧪 DEVELOPMENT & TESTING
# ==============================================
DEBUG_MODE=true
LOG_LEVEL=debug
ANALYZE=false
```

## 🏗️ Setup por Fases

### 📅 **Semana 1 - Variables Básicas**
```env
# Solo estas son necesarias para empezar
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 📅 **Semana 2 - Core Features**
```env
# Agregar estas para IA y storage
OPENAI_API_KEY=sk-proj-your-key
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 📅 **Semana 3 - Video & TikTok**
```env
# Video rendering y publicación
REMOTION_LAMBDA_FUNCTION_NAME=your_function
TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_secret
```

### 📅 **Semana 4 - Payments & Monitoring**
```env
# Pagos y monitoring
MERCADO_PAGO_ACCESS_TOKEN=your_mp_token
NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID=your_highlight_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## 🛠️ Cómo Obtener Cada Clave

### 🗄️ **Supabase (REQUERIDO INMEDIATAMENTE)**

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y nuevo proyecto
3. Ve a **Settings > API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 🤖 **OpenAI (REQUERIDO PARA IA)**

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea cuenta y agrega método de pago
3. Ve a **API Keys**
4. Crea nueva key → `OPENAI_API_KEY`
5. **⚠️ Importante**: Guarda $20 USD de crédito mínimo

### ☁️ **Cloudflare R2 (REQUERIDO PARA UPLOADS)**

1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com)
2. Ve a **R2 Object Storage**
3. Crea bucket: `reelizalo-uploads`
4. Ve a **Manage R2 API Tokens**
5. Crea token con permisos de R2

### 🔴 **Upstash (REQUERIDO PARA COLAS)**

1. Ve a [console.upstash.com](https://console.upstash.com)
2. Crea **Redis Database**
3. Copia **REST URL** y **REST Token**
4. Crea **QStash** para colas
5. Copia tokens de QStash

## 🚨 Variables de Desarrollo Temporal

Si quieres empezar rápidamente SIN configurar servicios externos:

```env
# .env.local - SOLO PARA DESARROLLO LOCAL
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Dummies para que no falle la app
NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy_key
OPENAI_API_KEY=dummy_key
CLOUDFLARE_R2_ACCESS_KEY_ID=dummy
CLOUDFLARE_R2_SECRET_ACCESS_KEY=dummy
UPSTASH_REDIS_REST_URL=https://dummy.upstash.io
UPSTASH_REDIS_REST_TOKEN=dummy
```

> ⚠️ **Nota**: Con estas variables dummy, las funciones de IA, database y storage NO funcionarán, pero podrás ver la interfaz.

## 🔍 Verificar Variables

Crea este archivo para verificar que las variables están cargadas:

```typescript
// src/lib/verify-env.ts
export function verifyEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing);
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
}
```

## 📝 .gitignore

Asegúrate de que tu `.gitignore` incluye:

```gitignore
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Environment backup
.env.backup
.env.example.local
```

## 🔐 Seguridad

- ❌ **NUNCA** commitees archivos `.env*` a git
- ✅ **USA** `.env.local` para desarrollo
- ✅ **USA** Vercel/plataforma para production
- ✅ **ROTA** keys si las expones accidentalmente

---

**🆘 ¿Problemas?** Revisa el archivo `docs/DEPENDENCY_MANAGEMENT.md` para troubleshooting. 