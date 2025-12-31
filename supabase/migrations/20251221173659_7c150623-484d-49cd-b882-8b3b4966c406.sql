-- Create storage bucket for tutor images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutor-images', 'tutor-images', true);

-- Create policy for public viewing of tutor images
CREATE POLICY "Anyone can view tutor images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'tutor-images');

-- Create policy for tutors to upload their own images
CREATE POLICY "Tutors can upload their own images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'tutor-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy for tutors to update their own images
CREATE POLICY "Tutors can update their own images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'tutor-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy for tutors to delete their own images
CREATE POLICY "Tutors can delete their own images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'tutor-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);