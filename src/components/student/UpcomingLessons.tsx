import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, MessageSquare } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

interface UpcomingLessonsProps {
  lessons: Lesson[];
  loading: boolean;
}

export function UpcomingLessons({ lessons, loading }: UpcomingLessonsProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Próximas Clases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-12 h-12 rounded-full bg-muted" />
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
          <Calendar className="w-5 h-5 text-primary" />
          Próximas Clases
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lessons.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No tienes clases programadas</p>
            <Button onClick={() => navigate("/tutors")} variant="hero">
              Reservar una clase
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={lesson.tutor.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {lesson.tutor.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{lesson.tutor.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {format(parseISO(lesson.lesson_date), "EEE d MMM", { locale: es })} • {lesson.start_time.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="hidden sm:flex">
                    <Video className="w-3 h-3 mr-1" />
                    {lesson.lesson_type === "trial" ? "Prueba" : "Clase"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/messages?tutor=${lesson.tutor.id}`)}
                  >
                    <MessageSquare className="w-4 h-4" />
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
