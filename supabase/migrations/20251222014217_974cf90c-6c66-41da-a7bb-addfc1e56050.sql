-- Add last_online_at column to tutors table
ALTER TABLE public.tutors 
ADD COLUMN IF NOT EXISTS last_online_at timestamp with time zone;