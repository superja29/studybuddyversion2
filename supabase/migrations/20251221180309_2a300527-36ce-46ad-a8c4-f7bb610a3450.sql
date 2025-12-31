-- Create favorite_tutors table
CREATE TABLE public.favorite_tutors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutor_id uuid NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (student_id, tutor_id)
);

-- Enable RLS
ALTER TABLE public.favorite_tutors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own favorites"
ON public.favorite_tutors
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Users can add favorites"
ON public.favorite_tutors
FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can remove favorites"
ON public.favorite_tutors
FOR DELETE
USING (auth.uid() = student_id);