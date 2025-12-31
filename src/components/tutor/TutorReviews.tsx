import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Star, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  student_name: string;
  student_avatar?: string;
  rating: number;
  created_at: string;
  comment: string | null;
}

interface TutorReviewsProps {
  tutorId: string;
  rating: number;
  totalReviews: number;
}

export function TutorReviews({ tutorId, rating, totalReviews }: TutorReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [ratingDistribution, setRatingDistribution] = useState<{ stars: number; count: number; percentage: number }[]>([]);

  useEffect(() => {
    fetchReviews();
  }, [tutorId]);

  const fetchReviews = async () => {
    const { data: reviewsData, error } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, student_id")
      .eq("tutor_id", tutorId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false);
      return;
    }

    // Fetch profiles
    const studentIds = [...new Set(reviewsData?.map(r => r.student_id) || [])];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", studentIds);

    const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

    const enrichedReviews = reviewsData?.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      student_name: profilesMap.get(review.student_id)?.full_name || "Estudiante",
      student_avatar: profilesMap.get(review.student_id)?.avatar_url || undefined,
    })) || [];

    setReviews(enrichedReviews);

    // Calculate distribution
    const distribution = [5, 4, 3, 2, 1].map(stars => {
      const count = enrichedReviews.filter(r => r.rating === stars).length;
      const percentage = enrichedReviews.length > 0 ? (count / enrichedReviews.length) * 100 : 0;
      return { stars, count, percentage };
    });
    setRatingDistribution(distribution);
    setLoading(false);
  };

  const handleLoadMore = () => {
    setVisibleReviews(prev => Math.min(prev + 3, reviews.length));
  };

  const renderStars = (count: number, size: "sm" | "md" = "sm") => {
    const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClass,
              star <= count ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            Reseñas de estudiantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <span className="text-5xl font-bold">{rating}</span>
                <div>
                  {renderStars(Math.round(rating), "md")}
                  <p className="text-sm text-muted-foreground mt-1">
                    {reviews.length} reseñas
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ stars, percentage, count }) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm w-3">{stars}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <Card>
          <CardContent className="p-6 space-y-6">
            <AnimatePresence>
              {reviews.slice(0, visibleReviews).map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "pb-6",
                    index < visibleReviews - 1 && "border-b border-border"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.student_avatar} alt={review.student_name} />
                      <AvatarFallback>{review.student_name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium">{review.student_name}</span>
                        {renderStars(review.rating)}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3">
                        {format(new Date(review.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                      
                      {review.comment && (
                        <p className="text-sm text-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {visibleReviews < reviews.length && (
              <Button
                variant="outline"
                onClick={handleLoadMore}
                className="w-full gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                Ver más reseñas
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>Este tutor aún no tiene valoraciones.</p>
            <p className="text-sm mt-1">¡Reserva una clase y sé el primero en dejar una!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
