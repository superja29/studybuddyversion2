import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StudentStats } from "@/components/student/StudentStats";
import { UpcomingLessons } from "@/components/student/UpcomingLessons";
import { FavoriteTutors } from "@/components/student/FavoriteTutors";
import { QuickActions } from "@/components/student/QuickActions";
import { OnlineTutorsNow } from "@/components/student/OnlineTutorsNow";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Lesson {
  id: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  lesson_type: string;
  tutor: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

interface FavoriteTutor {
  id: string;
  tutor: {
    id: string;
    name: string;
    avatar_url: string | null;
    rating: number | null;
    hourly_rate: number;
    languages: string[];
  };
}

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

const StudentDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([]);
  const [favorites, setFavorites] = useState<FavoriteTutor[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalHours: 0,
    averageRating: 5.0,
    completionRate: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .single();
      
      setProfile(profileData);
      // Fetch upcoming lessons
      const today = new Date().toISOString().split("T")[0];
      const { data: lessonsData } = await supabase
        .from("bookings")
        .select(`
          id,
          lesson_date,
          start_time,
          end_time,
          lesson_type,
          tutors:tutor_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq("student_id", user.id)
        .gte("lesson_date", today)
        .in("status", ["confirmed", "pending"])
        .order("lesson_date", { ascending: true })
        .limit(5);

      const formattedLessons = (lessonsData || []).map((lesson: any) => ({
        ...lesson,
        tutor: lesson.tutors,
      }));
      setUpcomingLessons(formattedLessons);

      // Fetch favorite tutors
      const { data: favoritesData } = await supabase
        .from("favorite_tutors")
        .select(`
          id,
          tutors:tutor_id (
            id,
            name,
            avatar_url,
            rating,
            hourly_rate,
            languages
          )
        `)
        .eq("student_id", user.id)
        .limit(6);

      const formattedFavorites = (favoritesData || []).map((fav: any) => ({
        id: fav.id,
        tutor: fav.tutors,
      }));
      setFavorites(formattedFavorites);

      // Calculate stats
      const { data: allBookings } = await supabase
        .from("bookings")
        .select("id, duration_minutes, status")
        .eq("student_id", user.id);

      const confirmedLessons = (allBookings || []).filter(b => b.status === "confirmed");
      const totalMinutes = confirmedLessons.reduce((sum, b) => sum + (b.duration_minutes || 0), 0);
      const completedCount = confirmedLessons.length;
      const totalCount = (allBookings || []).length;

      // Get average rating given by student
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("student_id", user.id);

      const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 5.0;

      setStats({
        totalLessons: completedCount,
        totalHours: Math.round(totalMinutes / 60),
        averageRating: avgRating,
        completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (favoriteId: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-2">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {profile?.full_name
                    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                    : user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  {profile?.full_name ? `Hola, ${profile.full_name.split(" ")[0]}` : "Panel del Estudiante"}
                </h1>
                <p className="text-muted-foreground">
                  Bienvenido de vuelta. Aquí tienes un resumen de tu aprendizaje.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mb-8">
            <StudentStats {...stats} />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions />
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upcoming Lessons */}
            <UpcomingLessons lessons={upcomingLessons} loading={loading} />
            
            {/* Favorite Tutors */}
            <FavoriteTutors
              favorites={favorites}
              loading={loading}
              onRemove={handleRemoveFavorite}
            />

            {/* Online Tutors Now */}
            <OnlineTutorsNow />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
