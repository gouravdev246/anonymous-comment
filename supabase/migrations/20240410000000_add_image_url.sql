-- Add image_url column to comments table
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for comment images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Set up policy to allow public access to image files
CREATE POLICY "Allow public access to images" 
ON storage.objects FOR SELECT 
TO anon
USING (bucket_id = 'public' AND (storage.foldername(name))[1] = 'comment-images');

-- Set up policy to allow anonymous uploads to images
CREATE POLICY "Allow anonymous uploads to images" 
ON storage.objects FOR INSERT 
TO anon
WITH CHECK (bucket_id = 'public' AND (storage.foldername(name))[1] = 'comment-images');

-- Allow anonymous users to update their uploads
CREATE POLICY "Allow anonymous updates to images" 
ON storage.objects FOR UPDATE 
TO anon
USING (bucket_id = 'public' AND (storage.foldername(name))[1] = 'comment-images')
WITH CHECK (bucket_id = 'public' AND (storage.foldername(name))[1] = 'comment-images'); 