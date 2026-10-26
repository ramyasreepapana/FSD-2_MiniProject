-- ==============================================================================
-- BUDGETTRIP SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================
-- Run this SQL in your Supabase project's SQL Editor (Dashboard -> SQL Editor).
-- This script creates the `trips` table and configures Row Level Security (RLS)
-- so users can only access and modify their own saved trips.

-- 1. Create the `trips` table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    origin TEXT NOT NULL,
    origin_location JSONB,
    destination TEXT NOT NULL,
    travelers INTEGER NOT NULL CHECK (travelers > 0),
    duration INTEGER NOT NULL CHECK (duration > 0),
    budget NUMERIC NOT NULL CHECK (budget >= 0),
    travel_style TEXT NOT NULL DEFAULT 'moderate' CHECK (travel_style IN ('budget', 'moderate', 'premium')),
    travel_cost NUMERIC NOT NULL DEFAULT 0,
    accommodation_cost NUMERIC NOT NULL DEFAULT 0,
    food_cost NUMERIC NOT NULL DEFAULT 0,
    transport_cost NUMERIC NOT NULL DEFAULT 0,
    activities_cost NUMERIC NOT NULL DEFAULT 0,
    total_cost NUMERIC NOT NULL DEFAULT 0,
    budget_difference NUMERIC NOT NULL DEFAULT 0,
    budget_status TEXT NOT NULL CHECK (budget_status IN ('within', 'exceeds')),
    ai_summary TEXT,
    ai_suggestions JSONB,
    weather JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1b. Schema migrations for existing databases
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS origin_location JSONB;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS travel_style TEXT DEFAULT 'moderate';
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS ai_suggestions JSONB;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS weather JSONB;

-- 2. Create index on user_id for fast retrieval
CREATE INDEX IF NOT EXISTS trips_user_id_idx ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS trips_created_at_idx ON public.trips(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Users can view ONLY their own trips
CREATE POLICY "Users can view their own trips"
ON public.trips
FOR SELECT
USING (auth.uid() = user_id);

-- 5. RLS Policy: Users can insert their own trips
CREATE POLICY "Users can insert their own trips"
ON public.trips
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. RLS Policy: Users can update their own trips
CREATE POLICY "Users can update their own trips"
ON public.trips
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. RLS Policy: Users can delete their own trips
CREATE POLICY "Users can delete their own trips"
ON public.trips
FOR DELETE
USING (auth.uid() = user_id);
