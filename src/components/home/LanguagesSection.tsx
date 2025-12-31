import { motion } from "framer-motion";

const languages = [
  { name: "Inglés", flag: "🇺🇸", tutors: 3420 },
  { name: "Español", flag: "🇪🇸", tutors: 2180 },
  { name: "Francés", flag: "🇫🇷", tutors: 1450 },
  { name: "Alemán", flag: "🇩🇪", tutors: 890 },
  { name: "Italiano", flag: "🇮🇹", tutors: 720 },
  { name: "Portugués", flag: "🇧🇷", tutors: 650 },
  { name: "Chino", flag: "🇨🇳", tutors: 580 },
  { name: "Japonés", flag: "🇯🇵", tutors: 420 },
  { name: "Coreano", flag: "🇰🇷", tutors: 380 },
  { name: "Árabe", flag: "🇸🇦", tutors: 290 },
  { name: "Ruso", flag: "🇷🇺", tutors: 340 },
  { name: "Hindi", flag: "🇮🇳", tutors: 210 },
];

export function LanguagesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Más de <span className="text-gradient">50 idiomas</span> disponibles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desde los más populares hasta los más exóticos, tenemos tutores para
            cada idioma que quieras aprender
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {languages.map((lang, index) => (
            <motion.button
              key={lang.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-border/50 text-left group"
            >
              <span className="text-3xl mb-2 block">{lang.flag}</span>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {lang.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang.tutors.toLocaleString()} tutores
              </p>
            </motion.button>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-muted-foreground"
        >
          Y muchos más... <span className="text-primary font-medium cursor-pointer hover:underline">Ver todos los idiomas →</span>
        </motion.p>
      </div>
    </section>
  );
}
