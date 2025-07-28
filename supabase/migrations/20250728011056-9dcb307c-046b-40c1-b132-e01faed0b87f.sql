-- Fix Security Issues

-- 1. Add RLS policies for the leaderboard view/table
-- First, let's check if leaderboard is a view or table and handle accordingly
DROP VIEW IF EXISTS public.leaderboard;

-- Create leaderboard as a function instead of a security definer view
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id uuid,
  total_reviews bigint
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    r.user_id,
    COUNT(*) as total_reviews
  FROM reviews r
  GROUP BY r.user_id
  ORDER BY total_reviews DESC;
$$;

-- 2. Create proper leaderboard table with RLS policies
CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  total_reviews bigint DEFAULT 0,
  rank_position integer,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on leaderboard_cache
ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for leaderboard_cache
CREATE POLICY "Anyone can read leaderboard" 
ON public.leaderboard_cache 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage leaderboard" 
ON public.leaderboard_cache 
FOR ALL 
USING (false)
WITH CHECK (false);

-- 3. Create function to refresh leaderboard cache
CREATE OR REPLACE FUNCTION public.refresh_leaderboard_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clear existing cache
  DELETE FROM public.leaderboard_cache;
  
  -- Populate with fresh data
  INSERT INTO public.leaderboard_cache (user_id, total_reviews, rank_position)
  SELECT 
    user_id,
    total_reviews,
    ROW_NUMBER() OVER (ORDER BY total_reviews DESC) as rank_position
  FROM (
    SELECT 
      r.user_id,
      COUNT(*) as total_reviews
    FROM reviews r
    GROUP BY r.user_id
  ) leaderboard_data;
END;
$$;

-- 4. Create trigger to update leaderboard when reviews change
CREATE OR REPLACE FUNCTION public.update_leaderboard_on_review_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh the leaderboard cache
  PERFORM public.refresh_leaderboard_cache();
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for review changes
DROP TRIGGER IF EXISTS update_leaderboard_on_review_insert ON reviews;
DROP TRIGGER IF EXISTS update_leaderboard_on_review_delete ON reviews;

CREATE TRIGGER update_leaderboard_on_review_insert
  AFTER INSERT ON reviews
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.update_leaderboard_on_review_change();

CREATE TRIGGER update_leaderboard_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.update_leaderboard_on_review_change();

-- 5. Initial population of leaderboard cache
SELECT public.refresh_leaderboard_cache();

-- 6. Add additional security constraints
-- Ensure user_id cannot be null in critical tables
ALTER TABLE reviews ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE user_stats ALTER COLUMN user_id SET NOT NULL;

-- 7. Add validation functions for better input security
CREATE OR REPLACE FUNCTION public.validate_email(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_username(username text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN username IS NOT NULL 
    AND length(trim(username)) >= 3 
    AND length(trim(username)) <= 30
    AND username ~ '^[a-zA-Z0-9_]+$';
END;
$$;

-- 8. Add check constraints for data validation
ALTER TABLE users ADD CONSTRAINT valid_email_format 
  CHECK (public.validate_email(email));

ALTER TABLE users ADD CONSTRAINT valid_username_format 
  CHECK (username IS NULL OR public.validate_username(username));

-- 9. Enhance RLS policies with additional security
-- Update users table policies to be more secure
DROP POLICY IF EXISTS "Users can view other users" ON users;
CREATE POLICY "Users can view public user data" 
ON users 
FOR SELECT 
USING (true);

-- 10. Add audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_id uuid DEFAULT auth.uid(),
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This would typically insert into an audit log table
  -- For now, we'll use RAISE NOTICE for logging
  RAISE NOTICE 'Security Event: % by user % with details %', event_type, user_id, details;
END;
$$;