import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addMinutes, parse } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Loader2, CheckCircle, Video } from "lucide-react";

interface BookingFlowProps {
  tutor: {
    id: string;
    name: string;
    avatar_url?: string;
    hourly_rate: number;
    trial_rate?: number;
  };
  selectedDate: Date;
  selectedSlot: string;
  lessonType: "trial" | "regular";
  duration: number;
  onClose: () => void;
}

type BookingStep = "confirm" | "creating" | "success";

const BookingFlow = ({
  tutor,
  selectedDate,
  selectedSlot,
  lessonType,
  duration,
  onClose,
}: BookingFlowProps) => {
  const [step, setStep] = useState<BookingStep>("confirm");
  const [loading, setLoading] = useState(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // For testing, lessons are free
  const price = 0;

  const startTime = selectedSlot;
  const endTime = format(
    addMinutes(parse(selectedSlot, "HH:mm", new Date()), duration),
    "HH:mm"
  );

  const handleConfirmBooking = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para reservar una clase",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);
    setStep("creating");

    try {
      // Get student profile for name
      const { data: studentProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      // Create booking directly (free for testing)
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          tutor_id: tutor.id,
          student_id: user.id,
          lesson_date: format(selectedDate, "yyyy-MM-dd"),
          start_time: startTime,
          end_time: endTime,
          duration_minutes: duration,
          lesson_type: lessonType,
          price: price,
          status: "confirmed",
          payment_status: "completed", // Free for testing
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      console.log("Booking created:", booking);

      // Create Whereby room
      const { data: wherebyData, error: wherebyError } = await supabase.functions.invoke(
        "create-whereby-room",
        {
          body: {
            bookingId: booking.id,
            lessonDate: format(selectedDate, "yyyy-MM-dd"),
            startTime,
            endTime,
            tutorName: tutor.name,
            studentName: studentProfile?.full_name || "Estudiante",
          },
        }
      );

      if (wherebyError) {
        console.error("Error creating Whereby room:", wherebyError);
        // Continue even if Whereby fails - booking is still created
        toast({
          title: "Reserva creada",
          description: "La sala de videollamada se creará antes de la clase.",
        });
      } else {
        console.log("Whereby room created:", wherebyData);
        setRoomUrl(wherebyData.roomUrl);
      }

      setStep("success");
      toast({
        title: "¡Clase reservada!",
        description: "Tu clase ha sido reservada exitosamente.",
      });
    } catch (error: unknown) {
      console.error("Booking error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al crear la reserva";
      toast({
        title: "Error en la reserva",
        description: errorMessage,
        variant: "destructive",
      });
      setStep("confirm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {step === "confirm" && <Calendar className="h-5 w-5" />}
          {step === "creating" && <Loader2 className="h-5 w-5 animate-spin" />}
          {step === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {step === "confirm" && "Confirmar Reserva"}
          {step === "creating" && "Creando clase..."}
          {step === "success" && "¡Clase Reservada!"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === "confirm" && (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={tutor.avatar_url || "/placeholder.svg"}
                  alt={tutor.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{tutor.name}</p>
                  <Badge variant={lessonType === "trial" ? "secondary" : "default"}>
                    {lessonType === "trial" ? "Clase de prueba" : "Clase regular"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(selectedDate, "EEEE, d 'de' MMMM yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {startTime} - {endTime} ({duration} minutos)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span>Videollamada por Whereby</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-green-600 bg-green-100">
                    ¡Gratis para pruebas!
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleConfirmBooking} disabled={loading}>
                Reservar Clase
              </Button>
            </div>
          </>
        )}

        {step === "creating" && (
          <div className="text-center space-y-4 py-6">
            <div className="p-6 bg-muted rounded-lg">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-lg font-medium mb-2">Creando tu clase...</p>
              <p className="text-sm text-muted-foreground">
                Estamos preparando la sala de videollamada.
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-4">
            <div className="p-6 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium mb-2">¡Tu clase está reservada!</p>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "EEEE, d 'de' MMMM")} a las {startTime}
              </p>
              <p className="text-sm text-muted-foreground">con {tutor.name}</p>
            </div>

            {roomUrl && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Video className="h-5 w-5 text-primary" />
                  <span className="font-medium">Enlace de videollamada</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(roomUrl, "_blank")}
                >
                  Abrir sala de Whereby
                </Button>
              </div>
            )}

            <Button onClick={() => navigate("/bookings")} className="w-full">
              Ver Mis Reservas
            </Button>

            <Button variant="outline" onClick={onClose} className="w-full">
              Cerrar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingFlow;
