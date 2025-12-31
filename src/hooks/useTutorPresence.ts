import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface PresenceState {
  tutorId: string;
  onlineAt: string;
}

// Hook for tutors to broadcast their presence
export function useTutorPresenceBroadcast(tutorId: string | null) {
  const { user } = useAuth();

  const updateLastOnline = useCallback(async () => {
    if (!tutorId) return;
    
    await supabase
      .from("tutors")
      .update({ last_online_at: new Date().toISOString() })
      .eq("id", tutorId);
  }, [tutorId]);

  useEffect(() => {
    if (!user || !tutorId) return;

    const channel = supabase.channel('tutors-online', {
      config: {
        presence: {
          key: tutorId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence synced');
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            tutorId,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    // Update last_online_at periodically while online
    const interval = setInterval(updateLastOnline, 60000); // Every minute

    // Cleanup: update last_online_at when going offline
    const handleBeforeUnload = () => {
      updateLastOnline();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      updateLastOnline();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [user, tutorId, updateLastOnline]);
}

// Hook to check if specific tutors are online and get their last online time
export function useTutorsOnlineStatus(tutorIds: string[]): { onlineTutors: Set<string>; lastOnlineTimes: Record<string, string | null> } {
  const [onlineTutors, setOnlineTutors] = useState<Set<string>>(() => new Set());
  const [lastOnlineTimes, setLastOnlineTimes] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (tutorIds.length === 0) return;

    // Fetch last online times from database
    const fetchLastOnlineTimes = async () => {
      const { data } = await supabase
        .from("tutors")
        .select("id, last_online_at")
        .in("id", tutorIds);
      
      if (data) {
        const times: Record<string, string | null> = {};
        data.forEach((tutor) => {
          times[tutor.id] = tutor.last_online_at;
        });
        setLastOnlineTimes(times);
      }
    };

    fetchLastOnlineTimes();

    const channel = supabase.channel('tutors-online');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>();
        const online = new Set<string>();
        
        Object.keys(state).forEach((key) => {
          if (tutorIds.includes(key)) {
            online.add(key);
          }
        });
        
        setOnlineTutors(online);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tutorIds.join(',')]);

  return { onlineTutors, lastOnlineTimes };
}

// Hook to check if a single tutor is online and get last online time
export function useTutorOnlineStatus(tutorId: string | null) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<string | null>(null);

  useEffect(() => {
    if (!tutorId) return;

    // Fetch last online time from database
    const fetchLastOnlineTime = async () => {
      const { data } = await supabase
        .from("tutors")
        .select("last_online_at")
        .eq("id", tutorId)
        .single();
      
      if (data) {
        setLastOnlineAt(data.last_online_at);
      }
    };

    fetchLastOnlineTime();

    const channel = supabase.channel('tutors-online');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>();
        setIsOnline(tutorId in state);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tutorId]);

  return { isOnline, lastOnlineAt };
}
