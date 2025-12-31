import { motion } from "framer-motion";
import { Search, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-image.jpg";

const languages = [
  "Inglés",
  "Español",
  "Francés",
  "Portugués",
  "Alemán",
  "Italiano",
  "Chino",
  "Japonés",
];

const stats = [
  { value: "10,000+", label: "Tutores Expertos" },
  { value: "50+", label: "Idiomas" },
  { value: "500K+", label: "Clases Completadas" },
  { value: "4.9", label: "Calificación Promedio" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient opacity-60" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <Badge variant="coral" className="mb-6">
              🎤 Plataforma #1 de Tutorías de Idiomas
            </Badge>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight">
              Domina cualquier{" "}
              <span className="text-gradient">idioma</span> con tutores
              expertos
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              Clases personalizadas 1-a-1 con tutores nativos certificados.
              Aprende a tu ritmo, desde cualquier lugar del mundo.
            </p>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto lg:mx-0 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="¿Qué idioma quieres aprender?"
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-border bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <Button variant="hero" size="xl" className="gap-2">
                Buscar Tutores
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Popular languages */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <span className="text-sm text-muted-foreground mr-2">
                Populares:
              </span>
              {languages.slice(0, 5).map((lang) => (
                <Badge
                  key={lang}
                  variant="glass"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Hero Image/Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={heroImage}
                alt="Estudiantes aprendiendo idiomas online"
                className="w-full aspect-[4/3] object-cover"
              />
              
              {/* Video play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-secondary/20">
                <button className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glow hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 ml-1" />
                </button>
              </div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-md rounded-xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                    alt="Tutor"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Sarah M.</p>
                    <p className="text-xs text-muted-foreground">
                      Tutora de Inglés · 5.0 ⭐
                    </p>
                  </div>
                  <Button variant="teal" size="sm">
                    Clase ahora
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute -top-4 -right-4 bg-card shadow-lg rounded-xl p-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium">1,234 tutores online</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center"
            >
              <motion.p
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                className="text-3xl md:text-4xl font-bold text-gradient"
              >
                {stat.value}
              </motion.p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
