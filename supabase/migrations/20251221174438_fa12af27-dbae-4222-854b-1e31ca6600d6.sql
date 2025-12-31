-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, tutor_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversation policies
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (
  auth.uid() = student_id 
  OR EXISTS (
    SELECT 1 FROM public.tutors 
    WHERE tutors.id = conversations.tutor_id 
    AND tutors.user_id = auth.uid()
  )
);

CREATE POLICY "Students can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Message policies
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (
      c.student_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.tutors t
        WHERE t.id = c.tutor_id
        AND t.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (
      c.student_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.tutors t
        WHERE t.id = c.tutor_id
        AND t.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can mark messages as read"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (
      c.student_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.tutors t
        WHERE t.id = c.tutor_id
        AND t.user_id = auth.uid()
      )
    )
  )
);

-- Trigger to update conversation updated_at
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;