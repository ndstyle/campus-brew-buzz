-- Fix storage policies creation (no IF NOT EXISTS supported on CREATE POLICY)

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if present to avoid duplicates
DROP POLICY IF EXISTS "Review photos are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own review photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own review photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own review photos" ON storage.objects;

-- Recreate policies
CREATE POLICY "Review photos are publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'review-photos');

CREATE POLICY "Users can upload their own review photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'review-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own review photos"
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

CREATE POLICY "Users can delete their own review photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'review-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);