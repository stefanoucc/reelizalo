-- ==============================================
-- 🎬 REELIZALO - Database Schema
-- ==============================================
-- Execute this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- 📊 ENUMS
-- ==============================================

-- Subscription plans
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');

-- Video processing status  
CREATE TYPE video_status AS ENUM ('pending', 'generating', 'completed', 'failed');

-- Product categories
CREATE TYPE product_category AS ENUM (
  'electronics', 'fashion', 'home', 'sports', 'beauty', 
  'automotive', 'books', 'toys', 'food', 'other'
);

-- Content generation types
CREATE TYPE generation_type AS ENUM ('single', 'grid_3', 'grid_6', 'carousel', 'intent_pipeline', 'narrative_carousel');

-- Intent types for SOMA brand
CREATE TYPE intent_type AS ENUM ('sleep', 'focus', 'recovery');

-- ==============================================
-- 👥 USERS TABLE
-- ==============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  subscription_plan subscription_plan DEFAULT 'free',
  subscription_id VARCHAR(255), -- Mercado Pago subscription ID
  credits_remaining INTEGER DEFAULT 5, -- Free tier: 5 videos/month
  total_videos_generated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================
-- 📋 PROJECTS TABLE (NEW)
-- ==============================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  generation_type generation_type NOT NULL,
  intent_type intent_type,
  prompt TEXT NOT NULL,
  context_prompt TEXT,
  narrative_theme TEXT,
  carousel_count INTEGER,
  brand_colors JSONB,
  generated_images JSONB, -- Array of image URLs
  generated_texts JSONB, -- Array of generated text options
  favorite_texts JSONB, -- Array of favorited texts
  canvas_data JSONB, -- Canvas editor state
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================
-- 🎨 GENERATED_CONTENT TABLE (NEW)
-- ==============================================

CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content_type VARCHAR(50) NOT NULL, -- 'image' or 'text'
  content_url TEXT, -- For images
  content_text TEXT, -- For text
  generation_params JSONB, -- Store the parameters used for generation
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================
-- 🛍️ PRODUCTS TABLE
-- ==============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category product_category DEFAULT 'other',
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'PEN', -- Peruvian Soles
  brand VARCHAR(255),
  target_audience TEXT,
  key_benefits TEXT[], -- Array of benefits
  proof_metric VARCHAR(255), -- "95% satisfaction", "1M+ sold", etc.
  discount_code VARCHAR(50),
  landing_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================
-- 🖼️ PRODUCT IMAGES TABLE  
-- ==============================================

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  order_index INTEGER NOT NULL DEFAULT 0, -- Order of images
  upload_id VARCHAR(255) NOT NULL, -- Cloudflare R2 upload ID
  file_size INTEGER, -- Size in bytes
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================
-- 📝 VIDEO STORYBOARDS TABLE
-- ==============================================

CREATE TABLE video_storyboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  scenes JSONB NOT NULL, -- JSON with slide data
  template_id VARCHAR(255) NOT NULL,
  tiktok_caption TEXT,
  tone_check VARCHAR(50) DEFAULT 'OK', -- 'OK' or 'Needs Review'
  status video_status DEFAULT 'pending',
  generated_at TIMESTAMP WITH TIME ZONE,
  ai_tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================
-- 🎬 GENERATED VIDEOS TABLE
-- ==============================================

CREATE TABLE generated_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storyboard_id UUID REFERENCES video_storyboards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT, -- Cloudflare R2 video URL
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  status video_status DEFAULT 'pending',
  remotion_render_id VARCHAR(255), -- Remotion Lambda render ID
  tiktok_video_id VARCHAR(255), -- TikTok video ID after upload
  tiktok_published_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================
-- 💳 USER BILLING TABLE
-- ==============================================

CREATE TABLE user_billing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  mercado_pago_customer_id VARCHAR(255),
  mercado_pago_subscription_id VARCHAR(255),
  plan_name subscription_plan NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PEN',
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, past_due
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================
-- 📊 USAGE ANALYTICS TABLE
-- ==============================================

CREATE TABLE usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action VARCHAR(100) NOT NULL, -- 'video_generated', 'tiktok_published', etc.
  metadata JSONB, -- Additional data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================
-- 📱 TIKTOK ACCOUNTS TABLE
-- ==============================================

CREATE TABLE tiktok_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tiktok_user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  avatar_url TEXT,
  access_token TEXT NOT NULL, -- Encrypted
  refresh_token TEXT, -- Encrypted  
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  UNIQUE(user_id, tiktok_user_id)
);

-- ==============================================
-- 🔧 INDEXES FOR PERFORMANCE
-- ==============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_plan ON users(subscription_plan);

-- Products indexes  
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Product images indexes
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_order ON product_images(product_id, order_index);

-- Video storyboards indexes
CREATE INDEX idx_storyboards_product_id ON video_storyboards(product_id);
CREATE INDEX idx_storyboards_status ON video_storyboards(status);
CREATE INDEX idx_storyboards_created_at ON video_storyboards(created_at DESC);

-- Generated videos indexes
CREATE INDEX idx_videos_user_id ON generated_videos(user_id);
CREATE INDEX idx_videos_status ON generated_videos(status);
CREATE INDEX idx_videos_storyboard_id ON generated_videos(storyboard_id);
CREATE INDEX idx_videos_created_at ON generated_videos(created_at DESC);

-- Analytics indexes
CREATE INDEX idx_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX idx_analytics_action ON usage_analytics(action);
CREATE INDEX idx_analytics_created_at ON usage_analytics(created_at DESC);

-- ==============================================
-- 🔐 ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_storyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_accounts ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON users FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own products" ON products FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own product images" ON product_images FOR ALL 
USING (auth.uid() = (SELECT user_id FROM products WHERE id = product_id));

CREATE POLICY "Users can manage own storyboards" ON video_storyboards FOR ALL
USING (auth.uid() = (SELECT user_id FROM products WHERE id = product_id));

CREATE POLICY "Users can manage own videos" ON generated_videos FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own billing" ON user_billing FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON usage_analytics FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own TikTok accounts" ON tiktok_accounts FOR ALL USING (auth.uid() = user_id);

-- ==============================================
-- ⚡ TRIGGERS FOR AUTO-UPDATING
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables that need auto-updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_storyboards_updated_at BEFORE UPDATE ON video_storyboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON generated_videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON user_billing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tiktok_updated_at BEFORE UPDATE ON tiktok_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 🌱 SEED DATA (Optional)
-- ==============================================

-- Insert sample product categories and templates
INSERT INTO products (id, user_id, name, description, category, price, currency) VALUES
(uuid_generate_v4(), uuid_generate_v4(), 'Sample Product', 'This is a sample product for testing', 'electronics', 99.99, 'PEN')
ON CONFLICT DO NOTHING;

-- ==============================================
-- ✅ VERIFICATION QUERIES
-- ==============================================

-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'products', 'product_images', 'video_storyboards', 'generated_videos', 'user_billing', 'usage_analytics', 'tiktok_accounts');

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'products', 'product_images', 'video_storyboards', 'generated_videos');

COMMENT ON TABLE users IS 'User accounts and subscription info';
COMMENT ON TABLE products IS 'Products uploaded by users for video generation';
COMMENT ON TABLE product_images IS 'Images associated with products';
COMMENT ON TABLE video_storyboards IS 'AI-generated storyboards for videos';
COMMENT ON TABLE generated_videos IS 'Generated videos and TikTok publication info';
COMMENT ON TABLE user_billing IS 'Billing and subscription management';
COMMENT ON TABLE usage_analytics IS 'User action tracking and analytics';
COMMENT ON TABLE tiktok_accounts IS 'Connected TikTok accounts for publishing'; 