import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  student_id: string;
  tutor_id: string;
  updated_at: string;
  other_name: string;
  other_avatar?: string;
  last_message?: string;
  unread_count: number;
}

interface ConversationListProps {
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    // Fetch conversations
    const { data: convData, error: convError } = await supabase
      .from("conversations")
      .select("id, student_id, tutor_id, updated_at")
      .order("updated_at", { ascending: false });

    if (convError) {
      console.error("Error fetching conversations:", convError);
      setLoading(false);
      return;
    }

    // Enrich with tutor/profile info and last message
    const enrichedConversations: Conversation[] = [];

    for (const conv of convData || []) {
      const isStudent = conv.student_id === user.id;

      // Get other user info
      let otherName = "Usuario";
      let otherAvatar: string | undefined;

      if (isStudent) {
        // Get tutor info
        const { data: tutorData } = await supabase
          .from("tutors")
          .select("name, avatar_url")
          .eq("id", conv.tutor_id)
          .single();
        
        otherName = tutorData?.name || "Tutor";
        otherAvatar = tutorData?.avatar_url || undefined;
      } else {
        // Get student profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("user_id", conv.student_id)
          .single();
        
        otherName = profileData?.full_name || "Estudiante";
        otherAvatar = profileData?.avatar_url || undefined;
      }

      // Get last message
      const { data: lastMsgData } = await supabase
        .from("messages")
        .select("content")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get unread count
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .neq("sender_id", user.id)
        .is("read_at", null);

      enrichedConversations.push({
        ...conv,
        other_name: otherName,
        other_avatar: otherAvatar,
        last_message: lastMsgData?.content,
        unread_count: count || 0,
      });
    }

    setConversations(enrichedConversations);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No tienes conversaciones aún.</p>
        <p className="text-sm mt-1">Contacta a un tutor para empezar.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
              selectedId === conv.id
                ? "bg-primary/10"
                : "hover:bg-muted"
            )}
          >
            <div className="relative">
              <Avatar>
                <AvatarImage src={conv.other_avatar} />
                <AvatarFallback>
                  {conv.other_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {conv.unread_count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {conv.unread_count}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">{conv.other_name}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(conv.updated_at), "d MMM", { locale: es })}
                </span>
              </div>
              {conv.last_message && (
                <p className="text-sm text-muted-foreground truncate">
                  {conv.last_message}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
