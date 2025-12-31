import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO, addMinutes, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, User, Loader2, CheckCircle, XCircle, Video, CalendarClock, Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings"> & {
  student_profile?: {
    full_name: string | null;
    email: string | null;
  };
  whereby_host_url?: string | null;
  whereby_room_url?: string | null;
};

interface TutorBookingsListProps {
  tutorId: string;
}

export function TutorBookingsList({ tutorId }: TutorBookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Reschedule state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newTime, setNewTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Cancel confirmation state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [tutorId]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("tutor_id", tutorId)
      .order("lesson_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Error al cargar las reservas");
    } else {
      const bookingsWithProfiles = await Promise.all(
        (data || []).map(async (booking) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", booking.student_id)
            .maybeSingle();
          
          return {
            ...booking,
            student_profile: profile || undefined,
          };
        })
      );
      setBookings(bookingsWithProfiles);
    }
    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    setUpdating(bookingId);
    
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      console.error("Error updating booking:", error);
      toast.error("Error al actualizar la reserva");
    } else {
      setBookings(bookings.map((b) => 
        b.id === bookingId ? { ...b, status } : b
      ));
      toast.success(`Reserva ${status === "confirmed" ? "confirmada" : "cancelada"}`);
    }
    setUpdating(null);
  };

  const fetchAvailableSlots = async (date: Date) => {
    setLoadingSlots(true);
    const dayOfWeek = date.getDay();
    
    const { data: availability } = await supabase
      .from("tutor_availability")
      .select("start_time, end_time")
      .eq("tutor_id", tutorId)
      .eq("day_of_week", dayOfWeek);

    if (!availability || availability.length === 0) {
      setAvailableSlots([]);
      setLoadingSlots(false);
      return;
    }

    // Get existing bookings for the date
    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("tutor_id", tutorId)
      .eq("lesson_date", format(date, "yyyy-MM-dd"))
      .neq("status", "cancelled");

    const bookedTimes = new Set(
      existingBookings?.map((b) => b.start_time.slice(0, 5)) || []
    );

    // Generate slots
    const slots: string[] = [];
    availability.forEach((slot) => {
      const start = parse(slot.start_time, "HH:mm:ss", new Date());
      const end = parse(slot.end_time, "HH:mm:ss", new Date());
      let current = start;

      while (current < end) {
        const timeStr = format(current, "HH:mm");
        if (!bookedTimes.has(timeStr)) {
          slots.push(timeStr);
        }
        current = addMinutes(current, 30);
      }
    });

    setAvailableSlots(slots);
    setLoadingSlots(false);
  };

  const handleOpenReschedule = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewDate(undefined);
    setNewTime("");
    setAvailableSlots([]);
    setRescheduleDialogOpen(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setNewDate(date);
    setNewTime("");
    if (date) {
      fetchAvailableSlots(date);
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !newDate || !newTime) return;

    setUpdating(selectedBooking.id);
    
    const newEndTime = format(
      addMinutes(parse(newTime, "HH:mm", new Date()), selectedBooking.duration_minutes),
      "HH:mm"
    );

    const { error } = await supabase
      .from("bookings")
      .update({
        lesson_date: format(newDate, "yyyy-MM-dd"),
        start_time: newTime,
        end_time: newEndTime,
      })
      .eq("id", selectedBooking.id);

    if (error) {
      console.error("Error rescheduling:", error);
      toast.error("Error al reagendar la clase");
    } else {
      toast.success("Clase reagendada exitosamente");
      fetchBookings();
    }
    
    setUpdating(null);
    setRescheduleDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleOpenCancelDialog = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    
    await updateBookingStatus(bookingToCancel.id, "cancelled");
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus !== "completed") {
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pago pendiente</Badge>;
    }
    
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Confirmada</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>;
      case "completed":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Completada</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Tus Reservas
          </CardTitle>
          <CardDescription>
            Gestiona las reservas de tus estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tienes reservas aún.
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/50 rounded-xl gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {booking.student_profile?.full_name || booking.student_profile?.email || "Estudiante"}
                      </span>
                      {getStatusBadge(booking.status, booking.payment_status)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(parseISO(booking.lesson_date), "EEEE, d 'de' MMMM", { locale: es })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                      </div>
                      <span className="font-medium text-foreground">
                        {Number(booking.price) === 0 ? (
                          <Badge variant="secondary" className="text-green-600 bg-green-100">Gratis</Badge>
                        ) : (
                          `$${Number(booking.price).toFixed(2)}`
                        )}
                      </span>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">
                      {booking.lesson_type === "trial" ? "Clase de prueba" : "Clase regular"} • {booking.duration_minutes} min
                    </Badge>
                    
                    {booking.whereby_host_url && booking.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="default"
                        className="mt-2 bg-primary hover:bg-primary/90"
                        onClick={() => window.open(booking.whereby_host_url!, "_blank")}
                      >
                        <Video className="w-4 h-4 mr-1" />
                        Unirse como Anfitrión
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Actions for pending bookings */}
                    {booking.status === "pending" && booking.payment_status === "completed" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => updateBookingStatus(booking.id, "confirmed")}
                          disabled={updating === booking.id}
                        >
                          {updating === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirmar
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => handleOpenCancelDialog(booking)}
                          disabled={updating === booking.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      </>
                    )}

                    {/* Actions for confirmed bookings */}
                    {booking.status === "confirmed" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReschedule(booking)}
                          disabled={updating === booking.id}
                        >
                          <CalendarClock className="w-4 h-4 mr-1" />
                          Reagendar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => handleOpenCancelDialog(booking)}
                          disabled={updating === booking.id}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5" />
              Reagendar Clase
            </DialogTitle>
            <DialogDescription>
              Selecciona una nueva fecha y hora para la clase con{" "}
              {selectedBooking?.student_profile?.full_name || "el estudiante"}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nueva fecha</Label>
              <CalendarComponent
                mode="single"
                selected={newDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
                className="rounded-md border pointer-events-auto"
              />
            </div>

            {newDate && (
              <div className="space-y-2">
                <Label>Nueva hora</Label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay horarios disponibles para esta fecha.
                  </p>
                ) : (
                  <Select value={newTime} onValueChange={setNewTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un horario" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleReschedule} 
              disabled={!newDate || !newTime || updating === selectedBooking?.id}
            >
              {updating === selectedBooking?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirmar Reagendamiento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta clase?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará la clase programada con{" "}
              {bookingToCancel?.student_profile?.full_name || "el estudiante"} para el{" "}
              {bookingToCancel && format(parseISO(bookingToCancel.lesson_date), "d 'de' MMMM", { locale: es })} a las{" "}
              {bookingToCancel?.start_time.slice(0, 5)}.
              <br /><br />
              El estudiante será notificado de la cancelación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener clase</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, cancelar clase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
