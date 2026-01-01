import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TutorBookingsList } from "@/components/tutor/TutorBookingsList";
import { TutorStats } from "@/components/tutor/TutorStats";
import { TutorOnboardingWizard } from "@/components/tutor/TutorOnboardingWizard";
import { useTutorPresenceBroadcast } from "@/hooks/useTutorPresence";
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type Tutor = Tables<"tutors">;

export default function TutorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Broadcast presence when tutor is online
  useTutorPresenceBroadcast(tutor?.id || null);

  useEffect(() => {
    if (!loading && !tutor && user) {
      navigate("/student-dashboard");
    }
  }, [loading, tutor, user, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchTutorProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchTutorProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("tutors")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching tutor profile:", error);
    }

    setTutor(data);

    // Check if tutor needs onboarding (no avatar, no availability set)
    if (data && !data.avatar_url) {
      const { count } = await supabase
        .from("tutor_availability")
        .select("*", { count: "exact", head: true })
        .eq("tutor_id", data.id);

      if (count === 0) {
        setShowOnboarding(true);
      }
    }

    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }




  if (!tutor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    await fetchTutorProfile();
    toast.success("¡Tu perfil está completo y visible!");
  };

  if (showOnboarding && tutor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <TutorOnboardingWizard
            tutorId={tutor.id}
            userId={user!.id}
            onComplete={handleOnboardingComplete}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Panel de Tutor
          </h1>
          <p className="text-muted-foreground mt-2">
            Bienvenido, {tutor.name}. Gestiona tu disponibilidad y reservas.
          </p>
        </div>

        <TutorStats tutorId={tutor.id} />

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Próximas Reservas
          </h2>
          <TutorBookingsList tutorId={tutor.id} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
