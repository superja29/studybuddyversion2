import { useState, useMemo } from "react";
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

const allTutors: TutorData[] = [
  {
    id: "1",
    name: "María García",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
    country: "España",
    languages: ["Español", "Inglés"],
    specialties: ["Conversación", "Negocios", "DELE"],
    rating: 4.9,
    totalReviews: 234,
    totalClasses: 1520,
    yearsExperience: 8,
    hourlyRate: 25,
    trialRate: 10,
    bio: "Profesora nativa de español con más de 8 años de experiencia.",
    isVerified: true,
    isTopRated: true,
    hasVideo: true,
  },
  {
    id: "2",
    name: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    country: "Estados Unidos",
    languages: ["Inglés"],
    specialties: ["TOEFL", "IELTS", "Pronunciación"],
    rating: 4.8,
    totalReviews: 189,
    totalClasses: 980,
    yearsExperience: 6,
    hourlyRate: 30,
    trialRate: 15,
    bio: "Tutor certificado de inglés americano. Experto en TOEFL e IELTS.",
    isVerified: true,
    isTopRated: false,
    hasVideo: true,
  },
  {
    id: "3",
    name: "Sophie Dubois",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    country: "Francia",
    languages: ["Francés", "Inglés"],
    specialties: ["Principiantes", "Conversación", "Cultura"],
    rating: 5.0,
    totalReviews: 156,
    totalClasses: 720,
    yearsExperience: 5,
    hourlyRate: 28,
    trialRate: 12,
    bio: "Tutora parisina apasionada por compartir el francés y la cultura.",
    isVerified: true,
    isTopRated: true,
    hasVideo: true,
  },
  {
    id: "4",
    name: "Lucas Oliveira",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    country: "Brasil",
    languages: ["Portugués", "Español"],
    specialties: ["Brasileño", "Conversación", "Música"],
    rating: 4.9,
    totalReviews: 98,
    totalClasses: 450,
    yearsExperience: 4,
    hourlyRate: 20,
    trialRate: 8,
    bio: "Aprende portugués brasileño de forma divertida con música.",
    isVerified: true,
    isTopRated: false,
    hasVideo: true,
  },
  {
    id: "5",
    name: "Yuki Tanaka",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop",
    country: "Japón",
    languages: ["Japonés", "Inglés"],
    specialties: ["JLPT", "Anime/Manga", "Negocios"],
    rating: 4.8,
    totalReviews: 167,
    totalClasses: 890,
    yearsExperience: 7,
    hourlyRate: 32,
    trialRate: 14,
    bio: "Profesora nativa de japonés. Especializada en JLPT y cultura pop.",
    isVerified: true,
    isTopRated: true,
    hasVideo: true,
  },
  {
    id: "6",
    name: "Hans Müller",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
    country: "Alemania",
    languages: ["Alemán", "Inglés"],
    specialties: ["Negocios", "Goethe", "Técnico"],
    rating: 4.7,
    totalReviews: 123,
    totalClasses: 670,
    yearsExperience: 9,
    hourlyRate: 35,
    trialRate: 15,
    bio: "Profesor de alemán especializado en negocios y lenguaje técnico.",
    isVerified: true,
    isTopRated: false,
    hasVideo: true,
  },
  {
    id: "7",
    name: "Isabella Romano",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop",
    country: "Italia",
    languages: ["Italiano", "Español"],
    specialties: ["Conversación", "Cocina", "Arte"],
    rating: 4.9,
    totalReviews: 145,
    totalClasses: 560,
    yearsExperience: 5,
    hourlyRate: 26,
    trialRate: 11,
    bio: "Italiana apasionada por enseñar el idioma a través de la cultura.",
    isVerified: true,
    isTopRated: true,
    hasVideo: true,
  },
  {
    id: "8",
    name: "Chen Wei",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    country: "China",
    languages: ["Chino", "Inglés"],
    specialties: ["HSK", "Mandarín", "Negocios"],
    rating: 4.8,
    totalReviews: 178,
    totalClasses: 920,
    yearsExperience: 8,
    hourlyRate: 28,
    trialRate: 12,
    bio: "Profesor experimentado de chino mandarín para todos los niveles.",
    isVerified: true,
    isTopRated: false,
    hasVideo: true,
  },
];

const languages = ["Todos", "Inglés", "Español", "Francés", "Portugués", "Japonés", "Alemán", "Italiano", "Chino"];
const priceRanges = ["Todos los precios", "$10-20/h", "$20-30/h", "$30+/h"];

export default function Tutors() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);

  // Get all tutor IDs for presence tracking
  const tutorIds = useMemo(() => allTutors.map(t => t.id), []);
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
