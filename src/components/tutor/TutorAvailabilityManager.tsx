import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Clock, Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type TutorAvailability = Tables<"tutor_availability">;

interface TutorAvailabilityManagerProps {
  tutorId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

export function TutorAvailabilityManager({ tutorId }: TutorAvailabilityManagerProps) {
  const [availability, setAvailability] = useState<TutorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
  });

  useEffect(() => {
    fetchAvailability();
  }, [tutorId]);

  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from("tutor_availability")
      .select("*")
      .eq("tutor_id", tutorId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching availability:", error);
      toast.error("Error al cargar la disponibilidad");
    } else {
      setAvailability(data || []);
    }
    setLoading(false);
  };

  const addAvailability = async () => {
    if (newSlot.start_time >= newSlot.end_time) {
      toast.error("La hora de inicio debe ser anterior a la hora de fin");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("tutor_availability")
      .insert({
        tutor_id: tutorId,
        day_of_week: newSlot.day_of_week,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding availability:", error);
      toast.error("Error al agregar disponibilidad");
    } else if (data) {
      setAvailability([...availability, data]);
      toast.success("Disponibilidad agregada");
    }
    setSaving(false);
  };

  const deleteAvailability = async (id: string) => {
    const { error } = await supabase
      .from("tutor_availability")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting availability:", error);
      toast.error("Error al eliminar disponibilidad");
    } else {
      setAvailability(availability.filter((a) => a.id !== id));
      toast.success("Disponibilidad eliminada");
    }
  };

  const groupedAvailability = DAYS_OF_WEEK.map((day) => ({
    ...day,
    slots: availability.filter((a) => a.day_of_week === day.value),
  }));

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Agregar Disponibilidad
          </CardTitle>
          <CardDescription>
            Define los horarios en los que estás disponible para dar clases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              value={newSlot.day_of_week.toString()}
              onValueChange={(v) => setNewSlot({ ...newSlot, day_of_week: parseInt(v) })}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Día" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={newSlot.start_time}
              onValueChange={(v) => setNewSlot({ ...newSlot, start_time: v })}
            >
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Desde" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={newSlot.end_time}
              onValueChange={(v) => setNewSlot({ ...newSlot, end_time: v })}
            >
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Hasta" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={addAvailability} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Tu Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availability.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No has configurado tu disponibilidad aún. Agrega horarios arriba.
            </p>
          ) : (
            <div className="space-y-6">
              {groupedAvailability
                .filter((day) => day.slots.length > 0)
                .map((day) => (
                  <div key={day.value}>
                    <h4 className="font-semibold text-foreground mb-3">{day.label}</h4>
                    <div className="flex flex-wrap gap-2">
                      {day.slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-lg"
                        >
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </span>
                          <button
                            onClick={() => deleteAvailability(slot.id)}
                            className="text-destructive hover:text-destructive/80 ml-2"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
