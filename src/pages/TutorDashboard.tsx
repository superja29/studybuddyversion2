import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TutorAvailabilityManager } from "@/components/tutor/TutorAvailabilityManager";
import { TutorBookingsList } from "@/components/tutor/TutorBookingsList";
import { TutorStats } from "@/components/tutor/TutorStats";
import { TutorImageUpload } from "@/components/tutor/TutorImageUpload";
import { TutorProfileEditor } from "@/components/tutor/TutorProfileEditor";
import { TutorOnboardingWizard } from "@/components/tutor/TutorOnboardingWizard";
import { useTutorPresenceBroadcast } from "@/hooks/useTutorPresence";
import { Clock, BookOpen, Loader2, ImageIcon, UserCog } from "lucide-react";
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

  useEffect(() => {
    if (!loading && !tutor && user) {
      navigate("/student-dashboard");
    }
  }, [loading, tutor, user, navigate]);

  if (!tutor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchTutorProfile();
  };

  if (showOnboarding && tutor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <TutorOnboardingWizard 
            tutorId={tutor.id} 
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

        <Tabs defaultValue="profile" className="mt-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Disponibilidad
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Imágenes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <TutorProfileEditor tutor={tutor} onProfileUpdated={fetchTutorProfile} />
          </TabsContent>

          <TabsContent value="availability" className="mt-6">
            <TutorAvailabilityManager tutorId={tutor.id} />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <TutorBookingsList tutorId={tutor.id} />
          </TabsContent>

          <TabsContent value="images" className="mt-6">
            <TutorImageUpload
              tutorId={tutor.id}
              userId={user!.id}
              currentAvatarUrl={tutor.avatar_url}
              currentCoverUrl={tutor.cover_image_url}
              tutorName={tutor.name}
              onImagesUpdated={fetchTutorProfile}
            />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
