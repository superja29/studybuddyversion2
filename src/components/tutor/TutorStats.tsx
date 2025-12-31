import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";

interface TutorStatsProps {
  tutorId: string;
}

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalEarnings: number;
}

export function TutorStats({ tutorId }: TutorStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [tutorId]);

  const fetchStats = async () => {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("tutor_id", tutorId);

    if (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
      return;
    }

    const totalBookings = bookings?.length || 0;
    const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;
    const confirmedBookings = bookings?.filter(b => b.status === "confirmed").length || 0;
    const totalEarnings = bookings
      ?.filter(b => b.payment_status === "completed")
      .reduce((sum, b) => sum + Number(b.price), 0) || 0;

    setStats({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalEarnings,
    });
    setLoading(false);
  };

  const statItems = [
    {
      label: "Total Reservas",
      value: stats.totalBookings,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Pendientes",
      value: stats.pendingBookings,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Confirmadas",
      value: stats.confirmedBookings,
      icon: Users,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Ganancias",
      value: `$${stats.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${item.bgColor}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {loading ? "..." : item.value}
              </p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
