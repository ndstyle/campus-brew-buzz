-- Create function to increment user stats when a review is submitted
CREATE OR REPLACE FUNCTION public.increment_user_stats(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Update user stats: increment reviews count and update timestamp
  INSERT INTO public.user_stats (user_id, reviews_count, updated_at)
  VALUES (user_id, 1, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    reviews_count = user_stats.reviews_count + 1,
    updated_at = now();
END;
$function$