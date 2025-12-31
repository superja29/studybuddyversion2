import { motion } from "framer-motion";
import { TutorCard, TutorData } from "@/components/tutor/TutorCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const featuredTutors: TutorData[] = [
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
    bio: "Profesora nativa de español con más de 8 años de experiencia. Especializada en español para negocios y preparación de exámenes DELE.",
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
    bio: "Tutor certificado de inglés americano. Experto en preparación de exámenes TOEFL e IELTS con tasa de aprobación del 95%.",
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
    bio: "¡Bonjour! Soy Sophie, tutora parisina apasionada por compartir el francés y la cultura francesa. Clases dinámicas y personalizadas.",
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
    bio: "Aprende portugués brasileño de forma divertida! Uso música, series y conversación natural para que hables como un nativo.",
    isVerified: true,
    isTopRated: false,
    hasVideo: true,
  },
];

export function FeaturedTutors() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Tutores{" "}
            <span className="text-gradient">destacados</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conoce a algunos de nuestros tutores mejor calificados, listos para
            ayudarte a alcanzar tus metas
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredTutors.map((tutor, index) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              index={index}
              onBook={(id) => console.log("Book tutor:", id)}
              onViewProfile={(id) => console.log("View profile:", id)}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button variant="hero" size="lg" className="gap-2">
            Ver todos los tutores
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
