-- Add video call URL column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN whereby_room_url TEXT,
ADD COLUMN whereby_host_url TEXT;

-- Add policy for tutors to update bookings (for room URL)
CREATE POLICY "Tutors can update their bookings" 
ON public.bookings 
FOR UPDATE 
USING (EXISTS ( SELECT 1 FROM tutors WHERE tutors.id = bookings.tutor_id AND tutors.user_id = auth.uid()));