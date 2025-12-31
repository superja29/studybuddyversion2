import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Users, Award } from "lucide-react";

const benefits = [
  {
    icon: Globe,
    text: "Acceso a tutores de todo el mundo",
  },
  {
    icon: Users,
    text: "Clases 100% personalizadas",
  },
  {
    icon: Award,
    text: "Garantía de satisfacción",
  },
];

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-navy to-secondary" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-foreground mb-6">
            ¿Listo para empezar tu viaje lingüístico?
          </h2>
          <p className="text-xl text-secondary-foreground/80 mb-8 max-w-2xl mx-auto">
            Únete a miles de estudiantes que ya están alcanzando sus metas.
            Tu primera clase puede ser hoy mismo.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {benefits.map((benefit) => (
              <div
                key={benefit.text}
                className="flex items-center gap-2 text-secondary-foreground/90"
              >
                <benefit.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="gap-2">
              Encuentra tu tutor
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="glass"
              size="xl"
              className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              Sé un tutor
            </Button>
          </div>

          {/* Trust badge */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-sm text-secondary-foreground/60"
          >
            ✓ Sin compromiso · ✓ Cancela cuando quieras · ✓ Primera clase desde $8
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
