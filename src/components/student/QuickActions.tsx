import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Buscar Tutores",
      description: "Encuentra tu próximo profesor",
      icon: Search,
      onClick: () => navigate("/tutors"),
      variant: "hero" as const,
    },
    {
      label: "Mi Perfil",
      description: "Edita tu información",
      icon: User,
      onClick: () => navigate("/student-profile"),
      variant: "outline" as const,
    },
    {
      label: "Mensajes",
      description: "Chatea con tus tutores",
      icon: MessageSquare,
      onClick: () => navigate("/messages"),
      variant: "outline" as const,
    },
    {
      label: "Mis Reservas",
      description: "Ver todas las clases",
      icon: Calendar,
      onClick: () => navigate("/bookings"),
      variant: "outline" as const,
    },
  ];

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant={action.variant}
                className="w-full h-auto py-4 flex flex-col items-center gap-2"
                onClick={action.onClick}
              >
                <action.icon className="w-5 h-5" />
                <div className="text-center">
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs opacity-70 hidden sm:block">{action.description}</p>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
