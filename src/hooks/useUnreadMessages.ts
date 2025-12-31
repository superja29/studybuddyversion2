import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      // Get all conversations where user is participant
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id, tutor_id, student_id");

      if (!conversations || conversations.length === 0) {
        setUnreadCount(0);
        return;
      }

      // Get tutor profile if user is a tutor
      const { data: tutorProfile } = await supabase
        .from("tutors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      // Filter conversations where user is participant
      const userConversations = conversations.filter(
        (conv) =>
          conv.student_id === user.id ||
          (tutorProfile && conv.tutor_id === tutorProfile.id)
      );

      if (userConversations.length === 0) {
        setUnreadCount(0);
        return;
      }

      const conversationIds = userConversations.map((c) => c.id);

      // Count unread messages (not sent by current user and not read)
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .neq("sender_id", user.id)
        .is("read_at", null);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return unreadCount;
}
