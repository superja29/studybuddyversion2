import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Shield,
  Clock,
  Wallet,
  Video,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Matching con IA",
    description:
      "Nuestro algoritmo de inteligencia artificial te conecta con el tutor perfecto según tus objetivos, nivel y estilo de aprendizaje.",
  },
  {
    icon: Shield,
    title: "Tutores Verificados",
    description:
      "Todos nuestros tutores pasan por un riguroso proceso de verificación. Solo trabajamos con los mejores profesionales.",
  },
  {
    icon: Clock,
    title: "Horarios Flexibles",
    description:
      "Agenda clases cuando te convenga. Nuestros tutores están disponibles las 24 horas, los 7 días de la semana.",
  },
  {
    icon: Wallet,
    title: "Precios Accesibles",
    description:
      "Encuentra tutores para todos los presupuestos. Ahorra con paquetes de clases y descuentos exclusivos.",
  },
  {
    icon: Video,
    title: "Tecnología de Punta",
    description:
      "Clases en HD con pizarra interactiva, grabaciones automáticas y materiales integrados en la plataforma.",
  },
  {
    icon: BarChart3,
    title: "Seguimiento de Progreso",
    description:
      "Visualiza tu evolución con estadísticas detalladas, reportes de progreso e insights personalizados.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Todo lo que necesitas para{" "}
            <span className="text-gradient">aprender</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Una plataforma completa diseñada para maximizar tu aprendizaje y
            hacer que cada clase cuente
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="elevated" className="h-full group">
                <CardContent className="p-8">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-xl text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
