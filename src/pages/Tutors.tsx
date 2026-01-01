import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TutorCard, TutorData } from "@/components/tutor/TutorCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTutorsOnlineStatus } from "@/hooks/useTutorPresence";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
} from "lucide-react";

const languages = ["Todos", "Inglés", "Español", "Francés", "Portugués", "Japonés", "Alemán", "Italiano", "Chino"];
const priceRanges = ["Todos los precios", "$10-20/h", "$20-30/h", "$30+/h"];

export default function Tutors() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch tutors from Supabase
  const { data: allTutors = [] } = useQuery({
    queryKey: ["tutors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tutors")
        .select("*");
      
      if (error) throw error;

      return data.map((t): TutorData => ({
        id: t.id,
        name: t.name,
        avatar: t.avatar_url || "",
        country: t.location || "Unknown",
        languages: t.languages || [],
        specialties: t.specialties || [],
        rating: Number(t.rating) || 0,
        totalReviews: t.total_students || 0,
        totalClasses: t.total_lessons || 0,
        yearsExperience: 1,
        hourlyRate: Number(t.hourly_rate),
        trialRate: Number(t.trial_rate),
        bio: t.bio || "",
        isVerified: t.is_verified || false,
        isTopRated: Number(t.rating) > 4.8,
        hasVideo: !!t.video_url,
      }));
    },
  });

  // Get all tutor IDs for presence tracking
  const tutorIds = useMemo(() => allTutors?.map((t) => t.id) || [], [allTutors]);
  const { onlineTutors, lastOnlineTimes } = useTutorsOnlineStatus(tutorIds);

  const filteredTutors = allTutors.filter((tutor) => {
    const matchesSearch =
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.languages.some((l) =>
        l.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      tutor.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesLanguage =
      selectedLanguage === "Todos" ||
      tutor.languages.includes(selectedLanguage);

    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Encuentra tu tutor <span className="text-gradient">ideal</span>
            </h1>
            <p className="text-muted-foreground">
              {filteredTutors.length} tutores disponibles
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            {/* Search bar */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por idioma, nombre o especialidad..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>

            {/* Language filters */}
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Badge
                  key={lang}
                  variant={selectedLanguage === lang ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => setSelectedLanguage(lang)}
                >
                  {lang}
                </Badge>
              ))}
            </div>

            {/* Extended filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 bg-card rounded-xl border border-border"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Precio por hora
                    </label>
                    <select className="w-full h-10 px-3 rounded-lg border border-border bg-background">
                      {priceRanges.map((range) => (
                        <option key={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      País del tutor
                    </label>
                    <select className="w-full h-10 px-3 rounded-lg border border-border bg-background">
                      <option>Cualquier país</option>
                      <option>Estados Unidos</option>
                      <option>Reino Unido</option>
                      <option>España</option>
                      <option>Francia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Disponibilidad
                    </label>
                    <select className="w-full h-10 px-3 rounded-lg border border-border bg-background">
                      <option>Cualquier hora</option>
                      <option>Mañana (6am-12pm)</option>
                      <option>Tarde (12pm-6pm)</option>
                      <option>Noche (6pm-12am)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Tutors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTutors.map((tutor, index) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                index={index}
                isOnline={onlineTutors.has(tutor.id)}
                lastOnlineAt={lastOnlineTimes[tutor.id] || null}
                onBook={(id) => navigate(`/tutor/${id}`)}
                onViewProfile={(id) => navigate(`/tutor/${id}`)}
              />
            ))}
          </div>

          {filteredTutors.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-xl text-muted-foreground mb-4">
                No se encontraron tutores con esos criterios
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedLanguage("Todos");
              }}>
                Limpiar filtros
              </Button>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
