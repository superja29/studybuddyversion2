-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tutors table
CREATE TABLE public.tutors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  avatar_url TEXT,
  cover_image_url TEXT,
  languages TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate DECIMAL(10,2) NOT NULL,
  trial_rate DECIMAL(10,2),
  bio TEXT,
  location TEXT,
  response_time TEXT DEFAULT '< 1 hour',
  total_students INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 5.0,
  specialties TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tutor availability table
CREATE TABLE public.tutor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  lesson_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('trial', 'regular')),
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  paypal_order_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tutors policies (public read)
CREATE POLICY "Anyone can view tutors" ON public.tutors FOR SELECT USING (true);
CREATE POLICY "Tutors can update their own profile" ON public.tutors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Tutors can insert their profile" ON public.tutors FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tutor availability policies
CREATE POLICY "Anyone can view availability" ON public.tutor_availability FOR SELECT USING (true);
CREATE POLICY "Tutors can manage their availability" ON public.tutor_availability FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tutors WHERE tutors.id = tutor_id AND tutors.user_id = auth.uid())
);

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Tutors can view bookings for their lessons" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tutors WHERE tutors.id = tutor_id AND tutors.user_id = auth.uid())
);
CREATE POLICY "Authenticated users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = student_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON public.tutors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample tutor data
INSERT INTO public.tutors (name, avatar_url, languages, hourly_rate, trial_rate, bio, location, response_time, total_students, total_lessons, rating, specialties, is_verified)
VALUES 
  ('María García', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', ARRAY['Spanish', 'English'], 25.00, 5.00, 'Native Spanish speaker with 5+ years of teaching experience. Specialized in conversational Spanish and business communication.', 'Madrid, Spain', '< 1 hour', 156, 1240, 4.9, ARRAY['Conversational', 'Business', 'Grammar'], true),
  ('John Smith', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', ARRAY['English', 'French'], 30.00, 7.00, 'Certified TEFL instructor with experience teaching students from all around the world.', 'London, UK', '< 2 hours', 98, 780, 4.8, ARRAY['IELTS Prep', 'Academic', 'Pronunciation'], true);