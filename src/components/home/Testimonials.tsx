import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Andrea Martínez",
    role: "Estudiante de Inglés",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    content:
      "Increíble plataforma. En 3 meses pasé de nivel B1 a B2. Mi tutor James es fantástico, siempre puntual y con materiales super útiles. ¡100% recomendado!",
    rating: 5,
    language: "Inglés",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    role: "Profesional de Negocios",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    content:
      "Necesitaba mejorar mi francés para presentaciones de trabajo. Sophie entendió exactamente lo que necesitaba y adaptó las clases a mi sector. Ahora me siento mucho más seguro.",
    rating: 5,
    language: "Francés",
  },
  {
    id: 3,
    name: "Emily Thompson",
    role: "Viajera Digital",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    content:
      "Aprender español con María ha sido una experiencia increíble. Sus clases son dinámicas y divertidas. Ya puedo mantener conversaciones fluidas cuando viajo por Latinoamérica.",
    rating: 5,
    language: "Español",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Lo que dicen nuestros{" "}
            <span className="text-gradient">estudiantes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Miles de estudiantes ya han transformado su forma de aprender
            idiomas con SkilledVoice
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="elevated" className="h-full">
                <CardContent className="p-8">
                  {/* Quote icon */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Quote className="w-5 h-5 text-primary" />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-gold text-gold"
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} · {testimonial.language}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
