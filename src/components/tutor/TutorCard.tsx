import { motion } from "framer-motion";
import { Star, Award, Clock, Video, Heart, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorite } from "@/hooks/useFavorite";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { OnlineStatus } from "./OnlineStatus";
export interface TutorData {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  country: string;
  languages: string[];
  specialties: string[];
  rating: number;
  totalReviews: number;
  totalClasses: number;
  yearsExperience: number;
  hourlyRate: number;
  trialRate?: number;
  bio: string;
  isVerified: boolean;
  isTopRated: boolean;
  hasVideo: boolean;
}

interface TutorCardProps {
  tutor: TutorData;
  index?: number;
  onBook?: (tutorId: string) => void;
  onViewProfile?: (tutorIdOrSlug: string) => void;
  isOnline?: boolean;
  lastOnlineAt?: string | null;
}

export function TutorCard({ tutor, index = 0, onBook, onViewProfile, isOnline = false, lastOnlineAt = null }: TutorCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isFavorite, toggling, toggleFavorite } = useFavorite(tutor.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    toggleFavorite();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
    >
      <Card variant="tutor" className="h-full group">
        {/* Top badges */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {tutor.isVerified && (
            <Badge variant="verified" className="gap-1">
              <Award className="w-3 h-3" />
              Verificado
            </Badge>
          )}
          {tutor.isTopRated && (
            <Badge variant="gold" className="gap-1">
              <Star className="w-3 h-3" />
              Top
            </Badge>
          )}
        </div>

        {/* Favorite button */}
        <button
          className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors ${isFavorite ? "text-coral" : ""
            }`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          onClick={handleFavoriteClick}
          disabled={toggling}
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavorite ? "fill-coral text-coral" : "text-muted-foreground hover:text-primary"}`} />
        </button>

        <CardContent className="p-6">
          {/* Avatar & Info */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
              />
              {/* Online indicator */}
              <div className="absolute top-0 right-0">
                <OnlineStatus isOnline={isOnline} lastOnlineAt={lastOnlineAt} variant="dot" />
              </div>
              {tutor.hasVideo && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Video className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{tutor.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{tutor.country}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-gold text-gold" />
                <span className="font-semibold">{tutor.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({tutor.totalReviews} reseñas)
                </span>
              </div>
              {/* Last seen text for offline tutors */}
              {!isOnline && lastOnlineAt && (
                <div className="mt-1">
                  <OnlineStatus isOnline={isOnline} lastOnlineAt={lastOnlineAt} variant="text" />
                </div>
              )}
            </div>
          </div>

          {/* Languages */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Enseña:</p>
            <div className="flex flex-wrap gap-1">
              {tutor.languages.map((lang) => (
                <Badge key={lang} variant="coral" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {tutor.specialties.slice(0, 3).map((spec) => (
                <Badge key={spec} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bio preview */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {tutor.bio}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{tutor.totalClasses} clases</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-muted-foreground" />
              <span>{tutor.yearsExperience}+ años</span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-end justify-between pt-4 border-t border-border">
            <div>
              <p className="text-2xl font-bold text-foreground">
                ${tutor.hourlyRate}
              </p>
              <p className="text-xs text-muted-foreground">por clase</p>
              {tutor.trialRate !== undefined && (
                <p className="text-xs text-primary font-medium mt-1">
                  Prueba: ${tutor.trialRate}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProfile?.(tutor.slug || tutor.id)}
              >
                Ver perfil
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={() => onBook?.(tutor.slug || tutor.id)}
              >
                Reservar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
