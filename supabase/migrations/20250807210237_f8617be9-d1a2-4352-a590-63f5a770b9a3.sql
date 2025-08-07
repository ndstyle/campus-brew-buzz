-- Fix rating constraint to allow ratings 1-10 instead of current constraint
-- Drop existing constraint if it exists
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_rating_check;

-- Add new rating constraint that allows 1-10 range
ALTER TABLE public.reviews ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 10);