import { Link } from "react-router-dom";
import { Globe, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-coral-light flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                Skilled<span className="text-primary">Voice</span>
              </span>
            </div>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed">
              Conectamos estudiantes con tutores expertos de todo el mundo para
              aprender idiomas de forma personalizada y efectiva.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Plataforma</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/tutors"
                  className="text-secondary-foreground/70 hover:text-primary transition-colors text-sm"
                >
                  Encuentra Tutores
                </Link>
              </li>
              <li>
                <Link
                  to="/become-tutor"
                  className="text-secondary-foreground/70 hover:text-primary transition-colors text-sm"
                >
                  Sé un Tutor
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-secondary-foreground/70 hover:text-primary transition-colors text-sm"
                >
                  Cómo Funciona
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-secondary-foreground/70 hover:text-primary transition-colors text-sm"
                >
                  Precios
                </Link>
              </li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Idiomas Populares</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/tutors?lang=english"
                  className="text-secondary-foreground/70 hover:text-primary transition-colors text-sm"
                >
                  Inglés
                </Link>
              </li>
              <li>
                <Link
                  to="/tutors?lang=spanish"
                  className="text-secondary-foreground/70 hover:text-primary transition-colors text-sm"
                >
                  Español
                </Link>
              </li>
              <li>
                <Link
                  to="/tutors?lang=french"
                  className="text-secondary-foreground/70 hover:text-primary transition-colors text-sm"
                >
                  Francés
                </Link>
              </li>
              <li>
                <Link
                  to="/tutors?lang=portuguese"
                  className="text-secondary-foreground/70 hover:text-primary transition-colors text-sm"
                >
                  Portugués
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-secondary-foreground/70 text-sm">
                <Mail className="w-4 h-4" />
                <span>soporte@skilledvoice.com</span>
              </li>
              <li className="flex items-center gap-2 text-secondary-foreground/70 text-sm">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2 text-secondary-foreground/70 text-sm">
                <MapPin className="w-4 h-4" />
                <span>100% Online - Global</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary-foreground/60 text-sm">
            © {new Date().getFullYear()} SkilledVoice. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-secondary-foreground/60 hover:text-primary transition-colors text-sm"
            >
              Privacidad
            </Link>
            <Link
              to="/terms"
              className="text-secondary-foreground/60 hover:text-primary transition-colors text-sm"
            >
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
