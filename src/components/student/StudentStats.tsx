import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface StudentStatsProps {
  totalLessons: number;
  totalHours: number;
  averageRating: number;
  completionRate: number;
}

export function StudentStats({ totalLessons, totalHours, averageRating, completionRate }: StudentStatsProps) {
  const stats = [
    {
      label: "Clases Tomadas",
      value: totalLessons,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Horas de Estudio",
      value: totalHours,
      icon: Clock,
      color: "text-coral",
      bgColor: "bg-coral/10",
    },
    {
      label: "Rating Promedio",
      value: averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Tasa de Completitud",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
