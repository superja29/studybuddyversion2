import { useEffect, useState } from "react";
import { format, addDays, startOfDay, isSameDay, isAfter, parseISO, addMinutes, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

type TutorAvailability = Tables<"tutor_availability">;
type Booking = Tables<"bookings">;

interface TutorAvailabilityPickerProps {
  tutorId: string;
  lessonDuration: number;
  onSlotSelect: (date: Date, slot: string) => void;
  selectedDate?: Date;
  selectedSlot?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export function TutorAvailabilityPicker({
  tutorId,
  lessonDuration,
  onSlotSelect,
  selectedDate,
  selectedSlot,
}: TutorAvailabilityPickerProps) {
  const [availability, setAvailability] = useState<TutorAvailability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date | undefined>(selectedDate);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    fetchAvailabilityAndBookings();
  }, [tutorId]);

  useEffect(() => {
    if (currentDate) {
      calculateAvailableSlots(currentDate);
    }
  }, [currentDate, availability, bookings, lessonDuration]);

  const fetchAvailabilityAndBookings = async () => {
    setLoading(true);
    
    // Fetch tutor availability
    const { data: availData, error: availError } = await supabase
      .from("tutor_availability")
      .select("*")
      .eq("tutor_id", tutorId);

    if (availError) {
      console.error("Error fetching availability:", availError);
    } else {
      setAvailability(availData || []);
    }

    // Fetch existing bookings for this tutor (next 60 days)
    const startDate = format(new Date(), "yyyy-MM-dd");
    const endDate = format(addDays(new Date(), 60), "yyyy-MM-dd");
    
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .eq("tutor_id", tutorId)
      .gte("lesson_date", startDate)
      .lte("lesson_date", endDate)
      .in("status", ["pending", "confirmed"]);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
    } else {
      setBookings(bookingsData || []);
    }

    setLoading(false);
  };

  const getDayAvailability = (date: Date): TutorAvailability[] => {
    const dayOfWeek = date.getDay();
    return availability.filter((a) => a.day_of_week === dayOfWeek);
  };

  const isDateAvailable = (date: Date): boolean => {
    if (isAfter(startOfDay(new Date()), startOfDay(date))) {
      return false;
    }
    return getDayAvailability(date).length > 0;
  };

  const calculateAvailableSlots = (date: Date) => {
    const dayAvailability = getDayAvailability(date);
    if (dayAvailability.length === 0) {
      setAvailableSlots([]);
      return;
    }

    const slots: TimeSlot[] = [];
    const dateStr = format(date, "yyyy-MM-dd");
    const dayBookings = bookings.filter((b) => b.lesson_date === dateStr);

    dayAvailability.forEach((avail) => {
      const startTime = parse(avail.start_time, "HH:mm:ss", new Date());
      const endTime = parse(avail.end_time, "HH:mm:ss", new Date());

      let currentSlot = startTime;
      while (addMinutes(currentSlot, lessonDuration) <= endTime) {
        const slotTimeStr = format(currentSlot, "HH:mm");
        const slotEnd = format(addMinutes(currentSlot, lessonDuration), "HH:mm");

        // Check if slot overlaps with any booking
        const isBooked = dayBookings.some((booking) => {
          const bookingStart = booking.start_time.slice(0, 5);
          const bookingEnd = booking.end_time.slice(0, 5);
          return (
            (slotTimeStr >= bookingStart && slotTimeStr < bookingEnd) ||
            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
            (slotTimeStr <= bookingStart && slotEnd >= bookingEnd)
          );
        });

        // Check if it's in the past for today
        let isPast = false;
        if (isSameDay(date, new Date())) {
          const now = new Date();
          const slotDateTime = parse(slotTimeStr, "HH:mm", date);
          isPast = slotDateTime <= now;
        }

        slots.push({
          time: slotTimeStr,
          available: !isBooked && !isPast,
        });

        currentSlot = addMinutes(currentSlot, 30); // 30 min intervals
      }
    });

    // Sort and remove duplicates
    const uniqueSlots = slots.reduce((acc, slot) => {
      const exists = acc.find((s) => s.time === slot.time);
      if (!exists) {
        acc.push(slot);
      } else if (!slot.available) {
        // If any overlap is not available, mark as not available
        exists.available = false;
      }
      return acc;
    }, [] as TimeSlot[]);

    uniqueSlots.sort((a, b) => a.time.localeCompare(b.time));
    setAvailableSlots(uniqueSlots);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setCurrentDate(date);
  };

  const handleSlotSelect = (slot: string) => {
    if (currentDate) {
      onSlotSelect(currentDate, slot);
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

  if (availability.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Este tutor no ha configurado su disponibilidad aún.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Selecciona una fecha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleDateSelect}
            disabled={(date) => !isDateAvailable(date)}
            className="rounded-md border pointer-events-auto"
            locale={es}
          />
        </CardContent>
      </Card>

      {currentDate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horarios disponibles
            </CardTitle>
            <CardDescription>
              {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay horarios disponibles para este día.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedSlot === slot.time && isSameDay(selectedDate || new Date(), currentDate) ? "default" : "outline"}
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => handleSlotSelect(slot.time)}
                    className={cn(
                      "text-sm",
                      !slot.available && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedDate && selectedSlot && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {format(selectedDate, "d MMM", { locale: es })}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedSlot}
                </Badge>
              </div>
              <span className="text-sm font-medium text-primary">
                Seleccionado
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
