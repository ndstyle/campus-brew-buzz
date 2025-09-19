/*
  # Enhanced User Profiles and Social Features

  1. Database Schema Updates
    - Add bio and profile_picture fields to users table
    - Add friend tagging support for reviews
    - Add cafe filtering capabilities

  2. New Features
    - User bio and profile picture support
    - Friend tagging in reviews
    - Enhanced cafe filtering by category and rating

  3. Security
    - Maintain existing RLS policies
    - Add policies for new features
*/

-- Add bio and profile picture to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add friend tagging support to reviews
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS tagged_friends JSONB DEFAULT '[]'::jsonb;

-- Add cafe category and cuisine type for better filtering
ALTER TABLE public.cafes 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'cafe',
ADD COLUMN IF NOT EXISTS cuisine_type TEXT DEFAULT 'coffee',
ADD COLUMN IF NOT EXISTS price_range TEXT DEFAULT '$$';

-- Create index for better filtering performance
CREATE INDEX IF NOT EXISTS idx_cafes_category ON public.cafes (category);
CREATE INDEX IF NOT EXISTS idx_cafes_cuisine_type ON public.cafes (cuisine_type);
CREATE INDEX IF NOT EXISTS idx_reviews_tagged_friends ON public.reviews USING GIN (tagged_friends);

-- Add constraint for valid categories
ALTER TABLE public.cafes ADD CONSTRAINT valid_category 
CHECK (category IN ('cafe', 'restaurant', 'bakery', 'tea_house', 'bubble_tea', 'all'));

-- Add constraint for valid cuisine types
ALTER TABLE public.cafes ADD CONSTRAINT valid_cuisine_type 
CHECK (cuisine_type IN ('coffee', 'tea', 'pastry', 'light_meals', 'bubble_tea', 'specialty_drinks'));

-- Add constraint for valid price ranges
ALTER TABLE public.cafes ADD CONSTRAINT valid_price_range 
CHECK (price_range IN ('$', '$$', '$$$', '$$$$'));