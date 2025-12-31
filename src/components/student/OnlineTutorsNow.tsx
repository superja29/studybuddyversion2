import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTutorsOnlineStatus } from "@/hooks/useTutorPresence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Circle, Star, ArrowRight, Zap, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface OnlineTutor {
  id: string;
  name: string;
  avatar_url: string | null;
  rating: number | null;
  hourly_rate: number;
  languages: string[];
  specialties: string[] | null;
}

export function OnlineTutorsNow() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<OnlineTutor[]>([]);
  const [allTutorIds, setAllTutorIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { onlineTutors } = useTutorsOnlineStatus(allTutorIds);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const { data } = await supabase
        .from("tutors")
        .select("id, name, avatar_url, rating, hourly_rate, languages, specialties")
        .order("rating", { ascending: false })
        .limit(20);

      if (data) {
        setTutors(data);
        setAllTutorIds(data.map((t) => t.id));
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
    } finally {
      setLoading(false);
    }
  };

  const onlineTutorsList = tutors.filter((t) => onlineTutors.has(t.id));

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Circle className="h-3 w-3 fill-green-500 text-green-500 animate-pulse" />
            Tutores en línea ahora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-40 shrink-0 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (onlineTutorsList.length === 0) {
    return null; // Don't show if no tutors online
  }

  return (
    <Card className="col-span-full border-green-500/20 bg-gradient-to-r from-green-500/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Tutores en línea ahora
            <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-600 border-green-500/20">
              <Zap className="h-3 w-3 mr-1" />
              {onlineTutorsList.length} disponibles
            </Badge>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/tutors")}
            className="text-muted-foreground hover:text-foreground"
          >
            Ver todos
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Estos tutores están disponibles para una clase ahora mismo
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {onlineTutorsList.slice(0, 8).map((tutor, index) => (
            <motion.div
              key={tutor.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="shrink-0"
            >
              <div className="group flex flex-col items-center p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-200 w-40">
                <button
                  onClick={() => navigate(`/tutor/${tutor.id}`)}
                  className="flex flex-col items-center w-full"
                >
                  <div className="relative mb-3">
                    <Avatar className="h-14 w-14 ring-2 ring-green-500/30 group-hover:ring-green-500/50 transition-all">
                      <AvatarImage src={tutor.avatar_url || undefined} alt={tutor.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {tutor.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-background">
                      <span className="h-2 w-2 rounded-full bg-white"></span>
                    </span>
                  </div>
                  <span className="font-medium text-sm text-foreground text-center line-clamp-1 w-full">
                    {tutor.name.split(" ")[0]}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">
                      {tutor.rating?.toFixed(1) || "5.0"}
                    </span>
                  </div>
                  <span className="text-xs text-primary font-medium mt-1">
                    ${tutor.hourly_rate}/h
                  </span>
                </button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tutor/${tutor.id}?book=true`);
                  }}
                  className="mt-3 w-full h-7 text-xs gap-1"
                >
                  <Calendar className="h-3 w-3" />
                  Reservar
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
