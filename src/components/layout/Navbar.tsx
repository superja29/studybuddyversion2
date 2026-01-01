import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, X, Globe, User, LogOut, Calendar, MessageSquare, LayoutDashboard, CreditCard, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Badge } from "@/components/ui/badge";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<"signin" | "signup">("signin");
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const unreadCount = useUnreadMessages();
  const navigate = useNavigate();
  const [isTutor, setIsTutor] = useState(false);

  useEffect(() => {
    const checkTutorStatus = async () => {
      if (user) {
        const { data } = await supabase
          .from("tutors")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        setIsTutor(!!data);
      } else {
        setIsTutor(false);
      }
    };

    checkTutorStatus();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-coral-light flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl md:text-2xl font-bold text-foreground">
              Skilled<span className="text-primary">Voice</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/tutors"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Encuentra Tutores
            </Link>
            <Link
              to="/become-tutor"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Sé Tutor
            </Link>
            <Link
              to="/how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Cómo Funciona
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Mi Cuenta
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isTutor ? (
                    // Tutor Menu
                    <>
                      <DropdownMenuItem onClick={() => navigate("/tutor-dashboard")}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Mi Panel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/tutor/profile")}>
                        <UserCircle className="w-4 h-4 mr-2" />
                        Mi Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/tutor/availability")}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Disponibilidad
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/tutor/images")}>
                        <User className="w-4 h-4 mr-2" />
                        Imágenes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/messages")} className="relative">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Mensajes
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    // Student Menu
                    <>
                      <DropdownMenuItem onClick={() => navigate("/student-dashboard")}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Mi Panel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/bookings")}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Mis Reservas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/messages")} className="relative">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Mensajes
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </Badge>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/payments")}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Mis Pagos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/student-profile")}>
                        <UserCircle className="w-4 h-4 mr-2" />
                        Mi Perfil
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => { setAuthDialogTab("signin"); setAuthDialogOpen(true); }}>
                  <User className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Button>
                <Button variant="hero" size="sm" onClick={() => { setAuthDialogTab("signup"); setAuthDialogOpen(true); }}>
                  Comenzar Gratis
                </Button>
              </>
            )}
            <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultTab={authDialogTab} />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border py-4"
          >
            <div className="flex flex-col gap-4">
              <Link
                to="/tutors"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Encuentra Tutores
              </Link>
              <Link
                to="/become-tutor"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Sé Tutor
              </Link>
              <Link
                to="/how-it-works"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Cómo Funciona
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Button variant="outline" className="w-full" onClick={() => { setIsOpen(false); navigate("/student-dashboard"); }}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Mi Panel
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => { setIsOpen(false); navigate("/bookings"); }}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Mis Reservas
                    </Button>
                    <Button variant="outline" className="w-full justify-start relative" onClick={() => { setIsOpen(false); navigate("/messages"); }}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Mensajes
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      )}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => { setIsOpen(false); navigate("/payments"); }}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Mis Pagos
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => { setIsOpen(false); navigate("/student-profile"); }}>
                      <UserCircle className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => { setIsOpen(false); handleSignOut(); }}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" onClick={() => { setIsOpen(false); setAuthDialogTab("signin"); setAuthDialogOpen(true); }}>
                      Iniciar Sesión
                    </Button>
                    <Button variant="hero" className="w-full" onClick={() => { setIsOpen(false); setAuthDialogTab("signup"); setAuthDialogOpen(true); }}>
                      Comenzar Gratis
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
