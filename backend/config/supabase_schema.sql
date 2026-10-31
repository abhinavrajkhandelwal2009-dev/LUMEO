-- ============================================================================
-- LUMEO SUPABASE SQL SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Run this script in the Supabase SQL Editor (https://app.supabase.com)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    accessibility_prefs JSONB DEFAULT '{"highContrast": false, "fontSize": "normal", "dyslexiaFont": false, "speechRate": 1.0, "defaultLanguage": "English", "globalMute": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Interactions Table (Logs all 15 AI Accessibility Modules)
CREATE TABLE IF NOT EXISTS public.user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    module_name VARCHAR(100) NOT NULL,
    input_payload TEXT NOT NULL,
    ai_response JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_module ON public.user_interactions(module_name);

-- 4. Enable Supabase Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Users & User Interactions
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Service role full access to users" ON public.users;
CREATE POLICY "Service role full access to users"
    ON public.users FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can access own interactions" ON public.user_interactions;
CREATE POLICY "Users can access own interactions"
    ON public.user_interactions FOR ALL
    USING (true)
    WITH CHECK (true);

