import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { MessageSquare, Loader2 } from "lucide-react";

interface SelectedConversation {
  id: string;
  other_name: string;
  other_avatar?: string;
}

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<SelectedConversation | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const initConversation = async () => {
      if (!user) return;

      const tutorId = searchParams.get("tutor");
      if (tutorId) {
        // Check if conversation exists or create one
        const { data: existingConv } = await supabase
          .from("conversations")
          .select("id")
          .eq("student_id", user.id)
          .eq("tutor_id", tutorId)
          .maybeSingle();

        let conversationId = existingConv?.id;

        if (!conversationId) {
          const { data: newConv, error } = await supabase
            .from("conversations")
            .insert({ student_id: user.id, tutor_id: tutorId })
            .select("id")
            .single();

          if (error) {
            console.error("Error creating conversation:", error);
          } else {
            conversationId = newConv.id;
          }
        }

        if (conversationId) {
          // Get tutor info
          const { data: tutorData } = await supabase
            .from("tutors")
            .select("name, avatar_url")
            .eq("id", tutorId)
            .single();

          setSelectedConversation({
            id: conversationId,
            other_name: tutorData?.name || "Tutor",
            other_avatar: tutorData?.avatar_url || undefined,
          });
        }
      }
      setInitializing(false);
    };

    if (user) {
      initConversation();
    }
  }, [user, searchParams]);

  if (authLoading || initializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mensajes</h1>

        <Card className="h-[600px] flex overflow-hidden">
          {/* Conversation list */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Conversaciones
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <ConversationList
                selectedId={selectedConversation?.id}
                onSelect={(conv) =>
                  setSelectedConversation({
                    id: conv.id,
                    other_name: conv.other_name,
                    other_avatar: conv.other_avatar,
                  })
                }
              />
            </div>
          </div>

          {/* Chat window */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation.id}
                otherUserName={selectedConversation.other_name}
                otherUserAvatar={selectedConversation.other_avatar}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona una conversación para empezar</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
