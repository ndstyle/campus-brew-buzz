-- Fix remaining security warnings by setting search_path for functions

-- 1. Fix validate_email function
CREATE OR REPLACE FUNCTION public.validate_email(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- 2. Fix validate_username function
CREATE OR REPLACE FUNCTION public.validate_username(username text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- More lenient validation - allow existing data
  RETURN username IS NULL OR (
    length(trim(username)) >= 1 
    AND length(trim(username)) <= 50
  );
END;
$$;

-- 3. Fix get_leaderboard function
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id uuid,
  total_reviews bigint,
  rank_position bigint
) 
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT 
    r.user_id,
    COUNT(*) as total_reviews,
    ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank_position
  FROM public.reviews r
  WHERE r.user_id IS NOT NULL
  GROUP BY r.user_id
  ORDER BY total_reviews DESC;
$$;

-- 4. Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_id uuid DEFAULT auth.uid(),
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log security events (in production, this would write to an audit table)
  RAISE NOTICE 'Security Event: % by user % with details %', event_type, user_id, details;
END;
$$;