-- Phase 3: Data integrity + campus cohesion

-- 1) Ensure reviews.rating is NUMERIC(3,1) with CHECK 1.0–10.0
ALTER TABLE public.reviews
  ALTER COLUMN rating TYPE numeric(3,1) USING rating::numeric;

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_rating_between_1_10;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_rating_between_1_10 CHECK (rating >= 1.0 AND rating <= 10.0);

-- 2) Indexes for performance
-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_user_created_at ON public.reviews (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_cafe_id ON public.reviews (cafe_id);

-- Cafes by campus
CREATE INDEX IF NOT EXISTS idx_cafes_campus ON public.cafes (campus);

-- Users by college
CREATE INDEX IF NOT EXISTS idx_users_college ON public.users (college);

-- Follows graph + uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS ux_follows_pair ON public.follows (follower_id, followee_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followee ON public.follows (followee_id);

-- Universities: name unique (case-insensitive) and aliases GIN
CREATE UNIQUE INDEX IF NOT EXISTS ux_universities_name_lower ON public.universities ((lower(name)));
CREATE INDEX IF NOT EXISTS idx_universities_aliases_gin ON public.universities USING GIN (aliases);


-- 3) Normalization helpers for campus names
-- Normalize arbitrary input to a canonical universities.name via aliases
CREATE OR REPLACE FUNCTION public.normalize_university_name(input_name text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  normalized text;
BEGIN
  IF input_name IS NULL OR trim(input_name) = '' THEN
    RETURN NULL;
  END IF;

  SELECT u.name INTO normalized
  FROM public.universities u
  WHERE lower(u.name) = lower(input_name)
     OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(u.aliases) a(alias)
          WHERE lower(a.alias) = lower(input_name)
       )
  LIMIT 1;

  RETURN COALESCE(normalized, input_name);
END;
$$;

-- RPC to sync the current user's users.college to the normalized canonical name
CREATE OR REPLACE FUNCTION public.sync_user_college(provided_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  new_value text;
BEGIN
  IF provided_name IS NULL OR trim(provided_name) = '' THEN
    RETURN NULL; -- caller can decide fallback
  END IF;

  new_value := public.normalize_university_name(provided_name);

  UPDATE public.users
  SET college = new_value
  WHERE id = auth.uid();

  RETURN new_value;
END;
$$;


-- 4) Storage: bucket + policies for review photos
-- Create a public bucket for review images
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read of review photos
CREATE POLICY IF NOT EXISTS "Review photos are publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'review-photos');

-- Users can upload to their own folder: {user_id}/...
CREATE POLICY IF NOT EXISTS "Users can upload their own review photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'review-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own photos
CREATE POLICY IF NOT EXISTS "Users can update their own review photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'review-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'review-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own photos
CREATE POLICY IF NOT EXISTS "Users can delete their own review photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'review-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
