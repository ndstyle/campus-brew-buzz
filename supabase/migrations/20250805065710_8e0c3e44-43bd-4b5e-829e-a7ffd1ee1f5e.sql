-- Create function to increment user stats when a review is submitted
CREATE OR REPLACE FUNCTION public.increment_user_stats(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update user stats: increment reviews count and places visited
  INSERT INTO public.user_stats (user_id, reviews_count, places_visited)
  VALUES (user_id, 1, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    reviews_count = user_stats.reviews_count + 1,
    places_visited = user_stats.places_visited + (
      -- Only increment places_visited if this is a new cafe for the user
      CASE WHEN EXISTS (
        SELECT 1 FROM public.reviews r2 
        WHERE r2.user_id = user_id 
        AND r2.cafe_id = (
          SELECT cafe_id FROM public.reviews 
          WHERE user_id = increment_user_stats.user_id 
          ORDER BY created_at DESC 
          LIMIT 1
        )
        AND r2.created_at < (
          SELECT created_at FROM public.reviews 
          WHERE user_id = increment_user_stats.user_id 
          ORDER BY created_at DESC 
          LIMIT 1
        )
      ) THEN 0 ELSE 1 END
    ),
    updated_at = now();
END;
$$;