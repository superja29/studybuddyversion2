import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, MessageSquare, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface FavoriteTutorsProps {
  favorites: FavoriteTutor[];
  loading: boolean;
  onRemove: (favoriteId: string) => void;
}

export function FavoriteTutors({ favorites, loading, onRemove }: FavoriteTutorsProps) {
  const navigate = useNavigate();

  const handleRemoveFavorite = async (favoriteId: string) => {
    const { error } = await supabase
      .from("favorite_tutors")
      .delete()
      .eq("id", favoriteId);

    if (error) {
      toast.error("Error al eliminar favorito");
      return;
    }

    toast.success("Tutor eliminado de favoritos");
    onRemove(favoriteId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-coral" />
            Tutores Favoritos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-14 h-14 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-coral" />
          Tutores Favoritos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {favorites.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Aún no tienes tutores favoritos</p>
            <Button onClick={() => navigate("/tutors")} variant="outline">
              Explorar tutores
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {favorites.map((fav, index) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => navigate(`/tutor/${fav.tutor.id}`)}
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={fav.tutor.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {fav.tutor.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{fav.tutor.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span>{fav.tutor.rating?.toFixed(1) || "5.0"}</span>
                      <span>•</span>
                      <span>${fav.tutor.hourly_rate}/h</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {fav.tutor.languages.slice(0, 2).map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/messages?tutor=${fav.tutor.id}`)}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/tutor/${fav.tutor.id}`)}
                  >
                    <Calendar className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveFavorite(fav.id)}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
