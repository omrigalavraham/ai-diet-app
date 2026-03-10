-- Drop existing tables and types to allow clean reruns
DROP TABLE IF EXISTS public.workout_logs CASCADE;
DROP TABLE IF EXISTS public.weight_logs CASCADE;
DROP TABLE IF EXISTS public.weekly_plans CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.gender_type CASCADE;
DROP TYPE IF EXISTS public.activity_level_type CASCADE;

-- Create custom types for enums (optional, but good for validation)
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE public.activity_level_type AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');

-- Create Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  gender public.gender_type,
  age INTEGER CHECK (age > 0),
  height INTEGER CHECK (height > 0),
  weight NUMERIC(5, 2) CHECK (weight > 0),
  goal_weight NUMERIC(5, 2) CHECK (goal_weight > 0),
  activity_level public.activity_level_type,
  dietary_preferences TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  disliked_foods TEXT[] DEFAULT '{}',
  target_daily_calories INTEGER,
  target_macros JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Weekly Plans Table
CREATE TABLE public.weekly_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  plan_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, start_date) -- Only one plan per user per week start date (optional constraint, good for sanity)
);

-- Create Weight Logs Table
CREATE TABLE public.weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight NUMERIC(5, 2) NOT NULL CHECK (weight > 0),
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date) -- One weigh-in per day per user
);

-- Create Workout Logs Table
CREATE TABLE public.workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  burned_calories INTEGER NOT NULL CHECK (burned_calories >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 0),
  type TEXT DEFAULT '7_minutes',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS)

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING ( auth.uid() = id );

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING ( auth.uid() = id );

-- Weekly Plans Policies
CREATE POLICY "Users can view own weekly plans" 
ON public.weekly_plans FOR SELECT 
TO authenticated 
USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own weekly plans" 
ON public.weekly_plans FOR INSERT 
TO authenticated 
WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own weekly plans" 
ON public.weekly_plans FOR UPDATE 
TO authenticated 
USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete own weekly plans" 
ON public.weekly_plans FOR DELETE
TO authenticated 
USING ( auth.uid() = user_id );

-- Weight Logs Policies
CREATE POLICY "Users can view own weight logs" 
ON public.weight_logs FOR SELECT 
TO authenticated 
USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own weight logs" 
ON public.weight_logs FOR INSERT 
TO authenticated 
WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own weight logs" 
ON public.weight_logs FOR UPDATE 
TO authenticated 
USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete own weight logs" 
ON public.weight_logs FOR DELETE
TO authenticated 
USING ( auth.uid() = user_id );

-- Workout Logs Policies
CREATE POLICY "Users can view own workout logs" 
ON public.workout_logs FOR SELECT 
TO authenticated 
USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own workout logs" 
ON public.workout_logs FOR INSERT 
TO authenticated 
WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own workout logs" 
ON public.workout_logs FOR UPDATE 
TO authenticated 
USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete own workout logs" 
ON public.workout_logs FOR DELETE
TO authenticated 
USING ( auth.uid() = user_id );

-- Create a trigger to automatically update `updated_at` on profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_weekly_plans_updated_at
    BEFORE UPDATE ON public.weekly_plans
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
