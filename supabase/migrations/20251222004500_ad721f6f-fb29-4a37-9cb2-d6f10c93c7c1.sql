-- Add education and certifications columns to tutors table
ALTER TABLE public.tutors
ADD COLUMN education text[] DEFAULT '{}'::text[],
ADD COLUMN certifications text[] DEFAULT '{}'::text[];