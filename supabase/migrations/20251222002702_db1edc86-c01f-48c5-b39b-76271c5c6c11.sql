-- Add video_url column to tutors table
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS video_url text;