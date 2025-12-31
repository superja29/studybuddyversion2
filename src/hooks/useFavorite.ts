import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useFavorite(tutorId: string) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const checkFavorite = useCallback(async () => {
    if (!user || !tutorId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("favorite_tutors")
        .select("id")
        .eq("student_id", user.id)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error("Error checking favorite:", error);
    } finally {
      setLoading(false);
    }
  }, [user, tutorId]);

  useEffect(() => {
    checkFavorite();
  }, [checkFavorite]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Inicia sesión para guardar favoritos");
      return;
    }

    setToggling(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorite_tutors")
          .delete()
          .eq("student_id", user.id)
          .eq("tutor_id", tutorId);

        if (error) throw error;
        setIsFavorite(false);
        toast.success("Eliminado de favoritos");
      } else {
        const { error } = await supabase
          .from("favorite_tutors")
          .insert({
            student_id: user.id,
            tutor_id: tutorId,
          });

        if (error) throw error;
        setIsFavorite(true);
        toast.success("Añadido a favoritos");
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast.error("Error al actualizar favoritos");
    } finally {
      setToggling(false);
    }
  };

  return { isFavorite, loading, toggling, toggleFavorite };
}
