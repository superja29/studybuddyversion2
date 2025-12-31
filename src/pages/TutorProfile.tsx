import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Star, Award, Clock, Video, Heart, MapPin, 
  MessageCircle, Calendar, ChevronLeft, Play,
  GraduationCap, Globe, CheckCircle, Users
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TutorAvailabilityCalendar } from "@/components/tutor/TutorAvailabilityCalendar";
import { TutorReviews } from "@/components/tutor/TutorReviews";
import { BookingWidget } from "@/components/tutor/BookingWidget";
import { useFavorite } from "@/hooks/useFavorite";
import { useAuth } from "@/hooks/useAuth";
import { useTutorOnlineStatus } from "@/hooks/useTutorPresence";
import { supabase } from "@/integrations/supabase/client";

// Mock tutor data - in real app this would come from API
const mockTutor = {
  id: "1",
  name: "María García López",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop",
  country: "España",
  city: "Madrid",
  languages: ["Español", "Inglés", "Francés"],
  nativeLanguage: "Español",
  specialties: ["Conversación", "Gramática", "Preparación DELE", "Español para negocios", "Pronunciación"],
  rating: 4.9,
  totalReviews: 248,
  totalClasses: 1250,
  totalStudents: 89,
  yearsExperience: 8,
  hourlyRate: 25,
  trialRate: 10,
  responseTime: "< 1 hora",
  bio: "¡Hola! Soy María, profesora nativa de español con más de 8 años de experiencia enseñando a estudiantes de todo el mundo. Mi pasión es ayudarte a dominar el español de manera natural y divertida.",
  fullBio: `¡Hola! Soy María, profesora nativa de español con más de 8 años de experiencia enseñando a estudiantes de todo el mundo.

Mi enfoque se centra en la comunicación práctica. Creo firmemente que la mejor manera de aprender un idioma es usándolo, por eso mis clases están diseñadas para que hables desde el primer día.

🎯 Mi metodología:
- Clases personalizadas según tus objetivos y nivel
- Material didáctico propio y actualizado
- Práctica de conversación real con temas que te interesan
- Corrección constructiva de errores
- Tareas opcionales para reforzar lo aprendido

📚 Mi formación:
- Licenciatura en Filología Hispánica (Universidad Complutense de Madrid)
- Máster en Enseñanza de Español como Lengua Extranjera
- Certificación ELE del Instituto Cervantes
- Formación continua en nuevas metodologías pedagógicas

💼 Mi experiencia:
He trabajado con estudiantes de más de 40 países diferentes, desde principiantes absolutos hasta niveles avanzados. También tengo experiencia preparando estudiantes para exámenes oficiales DELE y SIELE, con una tasa de aprobación del 95%.

¡Reserva una clase de prueba y empezamos juntos tu viaje hacia el español!`,
  isVerified: true,
  isTopRated: true,
  hasVideo: true,
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  education: [
    "Máster en ELE - Universidad de Barcelona (2018)",
    "Licenciatura en Filología Hispánica - UCM Madrid (2015)"
  ],
  certifications: [
    "Certificación ELE - Instituto Cervantes",
    "DELE Examiner Certification",
    "TEFL Certificate"
  ]
};

export default function TutorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tutor = mockTutor; // In real app, fetch based on id
  
  // Use the tutor ID from URL params, fallback to mock ID
  const tutorId = id || tutor.id;
  const { isFavorite, toggling, toggleFavorite } = useFavorite(tutorId);
  const { isOnline, lastOnlineAt } = useTutorOnlineStatus(tutorId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img 
          src={tutor.coverImage} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm hover:bg-card"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver
        </Button>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-visible">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative mx-auto md:mx-0">
                      <Avatar className="w-32 h-32 ring-4 ring-background shadow-lg">
                        <AvatarImage src={tutor.avatar} alt={tutor.name} />
                        <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {/* Online indicator */}
                      {isOnline && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" title="En línea" />
                      )}
                      {tutor.hasVideo && (
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md">
                          <Video className="w-5 h-5 text-primary-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                        <h1 className="text-2xl md:text-3xl font-display font-bold">{tutor.name}</h1>
                        {tutor.isVerified && (
                          <Badge variant="verified" className="gap-1">
                            <Award className="w-3 h-3" />
                            Verificado
                          </Badge>
                        )}
                        {tutor.isTopRated && (
                          <Badge variant="gold" className="gap-1">
                            <Star className="w-3 h-3" />
                            Top Rated
                          </Badge>
                        )}
                        {isOnline ? (
                          <Badge variant="outline" className="gap-1 border-emerald-500 text-emerald-600">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            En línea
                          </Badge>
                        ) : lastOnlineAt ? (
                          <Badge variant="outline" className="gap-1 text-muted-foreground">
                            Visto {formatDistanceToNow(new Date(lastOnlineAt), { addSuffix: true, locale: es })}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4" />
                        <span>{tutor.city}, {tutor.country}</span>
                      </div>

                      {/* Stats Row */}
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-gold text-gold" />
                          <span className="font-bold text-lg">{tutor.rating}</span>
                          <span className="text-muted-foreground">({tutor.totalReviews} reseñas)</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{tutor.totalClasses} clases</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{tutor.totalStudents} estudiantes</span>
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <span className="text-sm text-muted-foreground">Enseña:</span>
                        {tutor.languages.map((lang) => (
                          <Badge key={lang} variant="coral">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Quick Actions - Mobile */}
                    <div className="flex gap-2 md:hidden justify-center">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={toggleFavorite}
                        disabled={toggling}
                        className={isFavorite ? "text-coral border-coral" : ""}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite ? "fill-coral" : ""}`} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigate(`/messages?tutor=${tutor.id}`)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Video Introduction */}
            {tutor.hasVideo && tutor.videoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Video className="w-5 h-5 text-primary" />
                      </div>
                      Video de presentación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="aspect-video w-full">
                      <iframe
                        src={tutor.videoUrl}
                        title={`Video de presentación de ${tutor.name}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Tabs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="w-full justify-start bg-muted/50 p-1 h-auto flex-wrap">
                  <TabsTrigger value="about" className="flex-1 sm:flex-none">Sobre mí</TabsTrigger>
                  <TabsTrigger value="availability" className="flex-1 sm:flex-none">Disponibilidad</TabsTrigger>
                  <TabsTrigger value="reviews" className="flex-1 sm:flex-none">Reseñas</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="mt-6 space-y-6">
                  {/* Full Bio */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Acerca de {tutor.name.split(' ')[0]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
                        {tutor.fullBio}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Languages Spoken */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Idiomas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4">
                        {tutor.languages.map((lang, index) => (
                          <div key={lang} className="flex items-center gap-2">
                            <Badge variant={index === 0 ? "coral" : "outline"}>
                              {lang}
                            </Badge>
                            {index === 0 && (
                              <span className="text-xs text-muted-foreground">(Nativo)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Specialties */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        Especialidades
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {tutor.specialties.map((spec) => (
                          <Badge key={spec} variant="outline" className="py-2 px-4">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Education & Certifications */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {tutor.education && tutor.education.length > 0 && (
                      <Card className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-primary" />
                            </div>
                            Formación Académica
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {tutor.education.map((edu, index) => (
                            <motion.div 
                              key={index} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <GraduationCap className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{edu}</p>
                              </div>
                            </motion.div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {tutor.certifications && tutor.certifications.length > 0 && (
                      <Card className="border-l-4 border-l-accent">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <Award className="w-5 h-5 text-accent" />
                            </div>
                            Certificaciones
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {tutor.certifications.map((cert, index) => (
                            <motion.div 
                              key={index} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="group"
                            >
                              <Badge 
                                variant="outline" 
                                className="w-full justify-start gap-2 py-3 px-4 text-sm font-normal hover:bg-accent/10 transition-colors cursor-default"
                              >
                                <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                                <span className="text-foreground">{cert}</span>
                              </Badge>
                            </motion.div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="availability" className="mt-6">
                  <TutorAvailabilityCalendar tutorId={tutor.id} />
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <TutorReviews tutorId={tutor.id} rating={tutor.rating} totalReviews={tutor.totalReviews} />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <BookingWidget 
                  tutor={{
                    id: tutor.id,
                    name: tutor.name,
                    hourlyRate: tutor.hourlyRate,
                    trialRate: tutor.trialRate,
                    responseTime: tutor.responseTime
                  }} 
                />

                {/* Quick Stats Card */}
                <Card className="mt-6">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tiempo de respuesta</span>
                      <span className="text-sm font-medium">{tutor.responseTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Experiencia</span>
                      <span className="text-sm font-medium">{tutor.yearsExperience}+ años</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Clases completadas</span>
                      <span className="text-sm font-medium">{tutor.totalClasses.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Buttons - Desktop */}
                <div className="hidden md:flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    className={`flex-1 gap-2 ${isFavorite ? "text-coral border-coral" : ""}`}
                    onClick={toggleFavorite}
                    disabled={toggling}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? "fill-coral" : ""}`} />
                    {isFavorite ? "Guardado" : "Favorito"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={() => navigate(`/messages?tutor=${tutor.id}`)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Mensaje
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
