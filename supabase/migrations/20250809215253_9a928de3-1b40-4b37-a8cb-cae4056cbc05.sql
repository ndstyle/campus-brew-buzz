-- Re-run Phase 3 core (without storage policies)

-- 1) Ensure reviews.rating is NUMERIC(3,1) with CHECK 1.0–10.0
ALTER TABLE public.reviews
  ALTER COLUMN rating TYPE numeric(3,1) USING rating::numeric;

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_rating_between_1_10;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_rating_between_1_10 CHECK (rating >= 1.0 AND rating <= 10.0);

-- 2) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_created_at ON public.reviews (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_cafe_id ON public.reviews (cafe_id);
CREATE INDEX IF NOT EXISTS idx_cafes_campus ON public.cafes (campus);
CREATE INDEX IF NOT EXISTS idx_users_college ON public.users (college);
CREATE UNIQUE INDEX IF NOT EXISTS ux_follows_pair ON public.follows (follower_id, followee_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followee ON public.follows (followee_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_universities_name_lower ON public.universities ((lower(name)));
CREATE INDEX IF NOT EXISTS idx_universities_aliases_gin ON public.universities USING GIN (aliases);

-- 3) Normalization helpers for campus names
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
    RETURN NULL;
  END IF;

  new_value := public.normalize_university_name(provided_name);

  UPDATE public.users
  SET college = new_value
  WHERE id = auth.uid();

  RETURN new_value;
END;
$$;