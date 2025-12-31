import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TutorAvailabilityCalendarProps {
  tutorId: string;
}

// Mock availability data
const generateMockAvailability = (startDate: Date) => {
  const availability: Record<string, string[]> = {};
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(startDate, i);
    const dateKey = format(date, "yyyy-MM-dd");
    
    // Random availability
    const slots: string[] = [];
    const possibleSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
    
    possibleSlots.forEach(slot => {
      if (Math.random() > 0.4) {
        slots.push(slot);
      }
    });
    
    availability[dateKey] = slots;
  }
  
  return availability;
};

export function TutorAvailabilityCalendar({ tutorId }: TutorAvailabilityCalendarProps) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  const availability = generateMockAvailability(weekStart);
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const goToPreviousWeek = () => {
    setWeekStart(prev => addDays(prev, -7));
    setSelectedDate(null);
    setSelectedSlot(null);
  };
  
  const goToNextWeek = () => {
    setWeekStart(prev => addDays(prev, 7));
    setSelectedDate(null);
    setSelectedSlot(null);
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };
  
  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
  };
  
  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const availableSlots = selectedDateKey ? availability[selectedDateKey] || [] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Disponibilidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-medium">
            {format(weekStart, "d MMM", { locale: es })} - {format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}
          </span>
          <Button variant="ghost" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Day Selector */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const slots = availability[dateKey] || [];
            const hasAvailability = slots.length > 0;
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <button
                key={dateKey}
                onClick={() => hasAvailability && handleDateSelect(day)}
                disabled={!hasAvailability}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg transition-all",
                  hasAvailability ? "hover:bg-muted cursor-pointer" : "opacity-50 cursor-not-allowed",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                  isToday && !isSelected && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <span className="text-xs font-medium uppercase">
                  {format(day, "EEE", { locale: es })}
                </span>
                <span className={cn(
                  "text-lg font-bold mt-1",
                  isSelected && "text-primary-foreground"
                )}>
                  {format(day, "d")}
                </span>
                {hasAvailability && (
                  <span className={cn(
                    "text-xs mt-1",
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {slots.length} horarios
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-border"
          >
            <h4 className="font-medium mb-3">
              Horarios disponibles para {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </h4>
            
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedSlot === slot ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSlotSelect(slot)}
                    className="text-sm"
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No hay horarios disponibles para este día.
              </p>
            )}
            
            {selectedSlot && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Clase seleccionada</p>
                    <p className="text-sm text-muted-foreground">
                      {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })} a las {selectedSlot}
                    </p>
                  </div>
                  <Button variant="hero" size="sm">
                    Reservar
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded ring-2 ring-primary ring-offset-1" />
            <span>Hoy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted" />
            <span>Disponible</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
