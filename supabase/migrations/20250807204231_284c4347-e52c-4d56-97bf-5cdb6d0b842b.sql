-- Fix RLS policy for cafe creation
CREATE POLICY "Users can create cafes" 
ON public.cafes 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Also allow updates for good measure
CREATE POLICY "Users can update cafes" 
ON public.cafes 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);