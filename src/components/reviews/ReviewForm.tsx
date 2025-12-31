import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  bookingId: string;
  tutorId: string;
  studentId: string;
  onReviewSubmitted: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  bookingId,
  tutorId,
  studentId,
  onReviewSubmitted,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona una calificación.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        booking_id: bookingId,
        tutor_id: tutorId,
        student_id: studentId,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "¡Gracias por tu valoración!",
        description: "Tu comentario ha sido publicado correctamente.",
      });
      onReviewSubmitted();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la valoración.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Calificación</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  (hoveredRating || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Comentario (opcional)</label>
        <Textarea
          placeholder="Cuéntanos tu experiencia con este tutor..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">
          {comment.length}/500 caracteres
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={submitting || rating === 0}>
          {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Enviar valoración
        </Button>
      </div>
    </form>
  );
}
