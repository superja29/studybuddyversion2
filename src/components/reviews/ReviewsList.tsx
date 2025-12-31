import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  student_id: string;
  student_name?: string;
  student_avatar?: string;
}

interface ReviewsListProps {
  tutorId: string;
}

export function ReviewsList({ tutorId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [tutorId]);

  const fetchReviews = async () => {
    // First fetch reviews
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, student_id")
      .eq("tutor_id", tutorId)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      setLoading(false);
      return;
    }

    // Then fetch profiles for each student
    const studentIds = [...new Set(reviewsData?.map(r => r.student_id) || [])];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", studentIds);

    const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

    const enrichedReviews = reviewsData?.map(review => ({
      ...review,
      student_name: profilesMap.get(review.student_id)?.full_name || "Estudiante",
      student_avatar: profilesMap.get(review.student_id)?.avatar_url || undefined,
    })) || [];

    setReviews(enrichedReviews);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Este tutor aún no tiene valoraciones.</p>
        <p className="text-sm mt-1">¡Sé el primero en dejar una!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        return (
          <Card key={review.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={review.student_avatar || ""} />
                  <AvatarFallback>
                    {(review.student_name || "E").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-medium">{review.student_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), "d MMM yyyy", { locale: es })}
                    </span>
                  </div>
                  <div className="flex gap-0.5 my-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
