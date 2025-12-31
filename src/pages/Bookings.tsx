import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, isPast, parseISO, addHours, parse, addMinutes, differenceInHours } from "date-fns";
import { es } from "date-fns/locale";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Loader2, Star, Video, CalendarClock, XCircle, AlertTriangle } from "lucide-react";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { toast } from "sonner";

interface Booking {
  id: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  lesson_type: string;
  price: number;
  status: string;
  payment_status: string;
  tutor_id: string;
  whereby_room_url: string | null;
  tutors: {
    name: string;
    avatar_url: string | null;
  };
  has_review?: boolean;
}

const HOURS_BEFORE_LIMIT = 12;

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Reschedule state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newTime, setNewTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Cancel state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    if (!user) return;

    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        lesson_date,
        start_time,
        end_time,
        duration_minutes,
        lesson_type,
        price,
        status,
        payment_status,
        tutor_id,
        whereby_room_url,
        tutors (
          name,
          avatar_url
        )
      `)
      .eq("student_id", user.id)
      .order("lesson_date", { ascending: false });

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      setLoading(false);
      return;
    }

    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("booking_id")
      .eq("student_id", user.id);

    const reviewedBookingIds = new Set(reviewsData?.map(r => r.booking_id) || []);

    const enrichedBookings = bookingsData?.map(booking => ({
      ...booking,
      has_review: reviewedBookingIds.has(booking.id),
    })) || [];

    setBookings(enrichedBookings as unknown as Booking[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  // Check if booking can be modified (at least 12 hours before)
  const canModifyBooking = (booking: Booking): { canModify: boolean; hoursRemaining: number } => {
    const lessonDateTime = parse(
      `${booking.lesson_date} ${booking.start_time}`,
      "yyyy-MM-dd HH:mm:ss",
      new Date()
    );
    const now = new Date();
    const hoursRemaining = differenceInHours(lessonDateTime, now);
    
    return {
      canModify: hoursRemaining >= HOURS_BEFORE_LIMIT && booking.status === "confirmed",
      hoursRemaining
    };
  };

  const canLeaveReview = (booking: Booking) => {
    const lessonDate = parseISO(booking.lesson_date);
    return (
      booking.status === "confirmed" &&
      booking.payment_status === "completed" &&
      isPast(lessonDate) &&
      !booking.has_review
    );
  };

  const handleReviewClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setReviewDialogOpen(true);
  };

  const handleReviewSubmitted = () => {
    setReviewDialogOpen(false);
    setSelectedBooking(null);
    fetchBookings();
  };

  // Reschedule functions
  const fetchAvailableSlots = async (date: Date, tutorId: string) => {
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

    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("tutor_id", tutorId)
      .eq("lesson_date", format(date, "yyyy-MM-dd"))
      .neq("status", "cancelled");

    const bookedTimes = new Set(
      existingBookings?.map((b) => b.start_time.slice(0, 5)) || []
    );

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
    setBookingToReschedule(booking);
    setNewDate(undefined);
    setNewTime("");
    setAvailableSlots([]);
    setRescheduleDialogOpen(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setNewDate(date);
    setNewTime("");
    if (date && bookingToReschedule) {
      fetchAvailableSlots(date, bookingToReschedule.tutor_id);
    }
  };

  const handleReschedule = async () => {
    if (!bookingToReschedule || !newDate || !newTime) return;

    setUpdating(bookingToReschedule.id);
    
    const newEndTime = format(
      addMinutes(parse(newTime, "HH:mm", new Date()), bookingToReschedule.duration_minutes),
      "HH:mm"
    );

    const { error } = await supabase
      .from("bookings")
      .update({
        lesson_date: format(newDate, "yyyy-MM-dd"),
        start_time: newTime,
        end_time: newEndTime,
      })
      .eq("id", bookingToReschedule.id);

    if (error) {
      console.error("Error rescheduling:", error);
      toast.error("Error al reagendar la clase");
    } else {
      toast.success("Clase reagendada exitosamente");
      fetchBookings();
    }
    
    setUpdating(null);
    setRescheduleDialogOpen(false);
    setBookingToReschedule(null);
  };

  // Cancel functions
  const handleOpenCancelDialog = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    
    setUpdating(bookingToCancel.id);
    
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingToCancel.id);

    if (error) {
      console.error("Error cancelling:", error);
      toast.error("Error al cancelar la clase");
    } else {
      toast.success("Clase cancelada exitosamente");
      fetchBookings();
    }
    
    setUpdating(null);
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === "pending") {
      return <Badge variant="outline">Pago pendiente</Badge>;
    }
    switch (status) {
      case "confirmed":
        return <Badge variant="default">Confirmada</Badge>;
      case "completed":
        return <Badge variant="secondary">Completada</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mis Reservas</h1>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No tienes reservas</h2>
              <p className="text-muted-foreground mb-4">
                Explora tutores y reserva tu primera clase
              </p>
              <Button onClick={() => navigate("/tutors")}>
                Buscar tutores
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const { canModify, hoursRemaining } = canModifyBooking(booking);
              const isUpcoming = !isPast(parseISO(booking.lesson_date)) && booking.status === "confirmed";
              
              return (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <img
                        src={booking.tutors?.avatar_url || "/placeholder.svg"}
                        alt={booking.tutors?.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold">{booking.tutors?.name}</h3>
                          {getStatusBadge(booking.status, booking.payment_status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(booking.lesson_date), "d MMM yyyy", { locale: es })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 items-center">
                          <Badge variant={booking.lesson_type === "trial" ? "secondary" : "outline"}>
                            {booking.lesson_type === "trial" ? "Prueba" : "Regular"} • {booking.duration_minutes} min
                          </Badge>
                          {isUpcoming && !canModify && hoursRemaining > 0 && hoursRemaining < HOURS_BEFORE_LIMIT && (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              No modificable (menos de {HOURS_BEFORE_LIMIT}h)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <p className="text-xl font-bold">
                          {booking.price === 0 ? (
                            <Badge variant="secondary" className="text-green-600 bg-green-100">Gratis</Badge>
                          ) : (
                            `$${booking.price}`
                          )}
                        </p>
                        
                        {/* Video call button */}
                        {booking.whereby_room_url && booking.status === "confirmed" && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => window.open(booking.whereby_room_url!, "_blank")}
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Unirse
                          </Button>
                        )}

                        {/* Reschedule and Cancel buttons for confirmed upcoming bookings */}
                        {canModify && (
                          <div className="flex gap-2">
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
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        )}

                        {/* Review button */}
                        {canLeaveReview(booking) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReviewClick(booking)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Valorar
                          </Button>
                        )}
                        {booking.has_review && (
                          <Badge variant="secondary">Valorado</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Valorar a {selectedBooking?.tutors?.name}</DialogTitle>
              <DialogDescription>
                Comparte tu experiencia para ayudar a otros estudiantes.
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && user && (
              <ReviewForm
                bookingId={selectedBooking.id}
                tutorId={selectedBooking.tutor_id}
                studentId={user.id}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setReviewDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5" />
                Reagendar Clase
              </DialogTitle>
              <DialogDescription>
                Selecciona una nueva fecha y hora para tu clase con {bookingToReschedule?.tutors?.name}.
                <br />
                <span className="text-amber-600 text-xs mt-1 block">
                  Solo puedes reagendar hasta {HOURS_BEFORE_LIMIT} horas antes de la clase.
                </span>
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
                disabled={!newDate || !newTime || updating === bookingToReschedule?.id}
              >
                {updating === bookingToReschedule?.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Confirmar
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
                Estás a punto de cancelar tu clase con {bookingToCancel?.tutors?.name} programada para el{" "}
                {bookingToCancel && format(parseISO(bookingToCancel.lesson_date), "d 'de' MMMM", { locale: es })} a las{" "}
                {bookingToCancel?.start_time.slice(0, 5)}.
                <br /><br />
                <span className="text-amber-600">
                  Solo puedes cancelar hasta {HOURS_BEFORE_LIMIT} horas antes de la clase.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, mantener clase</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmCancel}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {updating === bookingToCancel?.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Sí, cancelar clase
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      <Footer />
    </div>
  );
};

export default Bookings;
