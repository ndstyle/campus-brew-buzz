-- Remove duplicate rating check constraint to ensure a single active CHECK on reviews.rating
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_rating_check;