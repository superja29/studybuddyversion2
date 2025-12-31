import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, CreditCard, MessageCircle, Zap, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { TutorAvailabilityPicker } from "./TutorAvailabilityPicker";
import BookingFlow from "@/components/booking/BookingFlow";

interface BookingWidgetProps {
  tutor: {
    id: string;
    name: string;
    hourlyRate: number;
    trialRate?: number;
    responseTime: string;
    avatar_url?: string;
  };
}

type LessonDuration = "30" | "60" | "90";
type LessonType = "trial" | "regular";
type BookingStep = "options" | "availability" | "confirm";

export function BookingWidget({ tutor }: BookingWidgetProps) {
  const [lessonType, setLessonType] = useState<LessonType>("regular");
  const [duration, setDuration] = useState<LessonDuration>("60");
  const [bookingStep, setBookingStep] = useState<BookingStep>("options");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const durationOptions = [
    { value: "30", label: "30 min", multiplier: 0.5 },
    { value: "60", label: "60 min", multiplier: 1 },
    { value: "90", label: "90 min", multiplier: 1.5 }
  ];

  const calculatePrice = () => {
    if (lessonType === "trial") {
      return tutor.trialRate || Math.round(tutor.hourlyRate * 0.5);
    }
    const durationOption = durationOptions.find(d => d.value === duration);
    return Math.round(tutor.hourlyRate * (durationOption?.multiplier || 1));
  };

  const price = calculatePrice();
  const effectiveDuration = lessonType === "trial" ? 30 : parseInt(duration);

  const handleBooking = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setShowDialog(true);
    setBookingStep("availability");
  };

  const handleSlotSelect = (date: Date, slot: string) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
  };

  const handleProceedToPayment = () => {
    if (selectedDate && selectedSlot) {
      setBookingStep("confirm");
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setBookingStep("options");
    setSelectedDate(undefined);
    setSelectedSlot(undefined);
  };

  return (
    <>
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Reservar clase</CardTitle>
            {tutor.trialRate && (
              <Badge variant="coral" className="gap-1">
                <Zap className="w-3 h-3" />
                Clase de prueba
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lesson Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de clase</Label>
            <RadioGroup
              value={lessonType}
              onValueChange={(value) => setLessonType(value as LessonType)}
              className="grid grid-cols-2 gap-3"
            >
              {tutor.trialRate && (
                <Label
                  htmlFor="trial"
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                    lessonType === "trial"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value="trial" id="trial" className="sr-only" />
                  <Zap className="w-5 h-5 text-primary mb-2" />
                  <span className="font-medium text-sm">Prueba</span>
                  <span className="text-xs text-muted-foreground">${tutor.trialRate}</span>
                </Label>
              )}
              <Label
                htmlFor="regular"
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                  lessonType === "regular"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                  !tutor.trialRate && "col-span-2"
                )}
              >
                <RadioGroupItem value="regular" id="regular" className="sr-only" />
                <Calendar className="w-5 h-5 text-primary mb-2" />
                <span className="font-medium text-sm">Regular</span>
                <span className="text-xs text-muted-foreground">desde ${tutor.hourlyRate}</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Duration (only for regular lessons) */}
          {lessonType === "regular" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <Label className="text-sm font-medium">Duración</Label>
              <div className="grid grid-cols-3 gap-2">
                {durationOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={duration === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDuration(option.value as LessonDuration)}
                    className="flex flex-col h-auto py-3"
                  >
                    <Clock className="w-4 h-4 mb-1" />
                    <span>{option.label}</span>
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Price Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {lessonType === "trial" ? "Clase de prueba (30 min)" : `Clase de ${duration} min`}
              </span>
              <span className="font-medium">${price}</span>
            </div>
            {lessonType === "trial" && (
              <p className="text-xs text-muted-foreground">
                Conoce al profesor antes de comprometerte
              </p>
            )}
          </div>

          {/* CTA Button */}
          <Button variant="hero" size="lg" className="w-full gap-2" onClick={handleBooking}>
            <Calendar className="w-5 h-5" />
            {user ? "Seleccionar horario" : "Iniciar sesión para reservar"}
          </Button>

          {/* Secondary Action */}
          <Button variant="outline" className="w-full gap-2">
            <MessageCircle className="w-4 h-4" />
            Enviar mensaje
          </Button>

          {/* Trust Indicators */}
          <div className="pt-4 border-t border-border space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CreditCard className="w-4 h-4" />
              <span>Pago seguro con PayPal • Cancelación gratuita</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Responde en {tutor.responseTime}
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {bookingStep === "availability" && (
              <motion.div
                key="availability"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Selecciona fecha y hora
                  </DialogTitle>
                </DialogHeader>
                
                <div className="mt-4">
                  <TutorAvailabilityPicker
                    tutorId={tutor.id}
                    lessonDuration={effectiveDuration}
                    onSlotSelect={handleSlotSelect}
                    selectedDate={selectedDate}
                    selectedSlot={selectedSlot}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1 gap-2" 
                    onClick={handleProceedToPayment}
                    disabled={!selectedDate || !selectedSlot}
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {bookingStep === "confirm" && selectedDate && selectedSlot && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <BookingFlow
                  tutor={{
                    id: tutor.id,
                    name: tutor.name,
                    avatar_url: tutor.avatar_url,
                    hourly_rate: tutor.hourlyRate,
                    trial_rate: tutor.trialRate,
                  }}
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  lessonType={lessonType}
                  duration={effectiveDuration}
                  onClose={handleCloseDialog}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
