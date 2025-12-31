import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Calendar,
  Video,
  Star,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Encuentra tu tutor ideal",
    description:
      "Explora miles de tutores certificados. Usa nuestro sistema de IA para encontrar el match perfecto según tus objetivos y estilo de aprendizaje.",
    color: "bg-primary",
  },
  {
    icon: Calendar,
    title: "Reserva tu clase",
    description:
      "Elige el horario que mejor te convenga. Nuestros tutores tienen disponibilidad flexible para adaptarse a tu agenda.",
    color: "bg-accent",
  },
  {
    icon: Video,
    title: "Aprende en vivo",
    description:
      "Conéctate desde cualquier dispositivo. Clases interactivas con video HD, pizarra digital y materiales personalizados.",
    color: "bg-secondary",
  },
  {
    icon: Star,
    title: "Mide tu progreso",
    description:
      "Recibe feedback detallado después de cada clase. Sigue tu evolución con estadísticas y recomendaciones personalizadas.",
    color: "bg-gold",
  },
];

export function HowItWorks() {
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
            ¿Cómo <span className="text-gradient">funciona</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comenzar a aprender es más fácil de lo que piensas. En solo 4 pasos
            estarás hablando con tu tutor ideal.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-[2px] bg-gradient-to-r from-border to-transparent z-0">
                  <ArrowRight className="absolute -right-2 -top-2 w-5 h-5 text-muted-foreground/50" />
                </div>
              )}

              <Card variant="feature" className="relative z-10 h-full bg-card">
                <CardContent className="p-8 text-center">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-md">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6 mt-4`}
                  >
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-xl text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
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
