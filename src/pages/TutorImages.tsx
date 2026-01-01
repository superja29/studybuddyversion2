import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TutorImageUpload } from "@/components/tutor/TutorImageUpload";
import { Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Tutor = Tables<"tutors">;

export default function TutorImages() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [tutor, setTutor] = useState<Tutor | null>(null);
    const [loading, setLoading] = useState(true);

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

        if (!data) {
            navigate("/become-tutor");
            return;
        }

        setTutor(data);
        setLoading(false);
    };

    if (authLoading || loading || !tutor) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-24">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Mis Imágenes</h1>
                    <p className="text-muted-foreground mt-2">
                        Actualiza tu foto de perfil y portada.
                    </p>
                </div>

                <div className="max-w-4xl">
                    <TutorImageUpload
                        tutorId={tutor.id}
                        userId={user!.id}
                        currentAvatarUrl={tutor.avatar_url}
                        currentCoverUrl={tutor.cover_image_url}
                        tutorName={tutor.name}
                        onImagesUpdated={fetchTutorProfile}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}
