-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);

-- Students can create reviews for their own bookings
CREATE POLICY "Students can create reviews for their bookings"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = student_id
  AND EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = booking_id 
    AND bookings.student_id = auth.uid()
    AND bookings.status = 'confirmed'
  )
);

-- Students can update their own reviews
CREATE POLICY "Students can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = student_id);

-- Students can delete their own reviews
CREATE POLICY "Students can delete their own reviews"
ON public.reviews
FOR DELETE
USING (auth.uid() = student_id);

-- Create function to update tutor rating
CREATE OR REPLACE FUNCTION public.update_tutor_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tutors
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM public.reviews
    WHERE tutor_id = COALESCE(NEW.tutor_id, OLD.tutor_id)
  )
  WHERE id = COALESCE(NEW.tutor_id, OLD.tutor_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to update tutor rating on review changes
CREATE TRIGGER update_tutor_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_tutor_rating();