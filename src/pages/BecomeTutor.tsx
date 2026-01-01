import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GraduationCap, Globe, DollarSign, MapPin, Loader2, X, Plus, CheckCircle } from "lucide-react";

const tutorFormSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),
  location: z.string().trim().min(2, "La ubicación debe tener al menos 2 caracteres").max(100, "La ubicación no puede exceder 100 caracteres"),
  bio: z.string().trim().min(50, "La biografía debe tener al menos 50 caracteres").max(1000, "La biografía no puede exceder 1000 caracteres"),
  hourlyRate: z.number().min(5, "La tarifa mínima es $5").max(500, "La tarifa máxima es $500"),
  trialRate: z.number().min(0, "La tarifa de prueba no puede ser negativa").max(100, "La tarifa de prueba máxima es $100").optional(),
  languages: z.array(z.string()).min(1, "Debes agregar al menos un idioma"),
  nativeLanguage: z.string().min(2, "Debes indicar tu idioma nativo"),
  specialties: z.array(z.string()).min(1, "Debes agregar al menos una especialidad"),
});

type TutorFormValues = z.infer<typeof tutorFormSchema>;

const SUGGESTED_LANGUAGES = [
  "Español", "Inglés", "Francés", "Alemán", "Italiano",
  "Portugués", "Chino Mandarín", "Japonés", "Coreano", "Árabe"
];

const SUGGESTED_SPECIALTIES = [
  "Conversación", "Gramática", "Negocios", "Preparación de exámenes",
  "Niños", "Principiantes", "Avanzado", "Pronunciación", "Escritura"
];

export default function BecomeTutor() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newLanguage, setNewLanguage] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");

  const form = useForm<TutorFormValues>({
    resolver: zodResolver(tutorFormSchema),
    defaultValues: {
      name: "",
      location: "",
      bio: "",
      hourlyRate: 25,
      trialRate: 5,
      languages: [],
      nativeLanguage: "",
      specialties: [],
    },
  });

  const languages = form.watch("languages");
  const specialties = form.watch("specialties");

  const addLanguage = (lang: string) => {
    const trimmed = lang.trim();
    if (trimmed && !languages.includes(trimmed)) {
      form.setValue("languages", [...languages, trimmed]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (lang: string) => {
    form.setValue("languages", languages.filter((l) => l !== lang));
  };

  const addSpecialty = (spec: string) => {
    const trimmed = spec.trim();
    if (trimmed && !specialties.includes(trimmed)) {
      form.setValue("specialties", [...specialties, trimmed]);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (spec: string) => {
    form.setValue("specialties", specialties.filter((s) => s !== spec));
  };

  const onSubmit = async (data: TutorFormValues) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      // Check if user already has a tutor profile
      const { data: existingTutor } = await supabase
        .from("tutors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingTutor) {
        toast.error("Ya tienes un perfil de tutor registrado");
        navigate("/tutor-dashboard");
        return;
      }

      const { error } = await supabase.rpc("become_tutor", {
        name: data.name,
        location: data.location,
        bio: data.bio,
        hourly_rate: data.hourlyRate,
        trial_rate: data.trialRate || null,
        languages: data.languages,
        specialties: data.specialties,
        native_language: data.nativeLanguage,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("¡Tu perfil de tutor ha sido creado!");
    } catch (error: any) {
      console.error("Error creating tutor profile:", error);
      toast.error(error.message || "Error al crear el perfil de tutor");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <GraduationCap className="w-20 h-20 mx-auto text-primary mb-6" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Conviértete en Tutor
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Comparte tu conocimiento, establece tu horario y gana dinero enseñando a estudiantes de todo el mundo.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <Card className="p-6 text-center">
                <Globe className="w-10 h-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold mb-2">Alcance Global</h3>
                <p className="text-sm text-muted-foreground">Conecta con estudiantes de cualquier parte del mundo</p>
              </Card>
              <Card className="p-6 text-center">
                <DollarSign className="w-10 h-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold mb-2">Tus Tarifas</h3>
                <p className="text-sm text-muted-foreground">Establece tus propios precios y horarios</p>
              </Card>
              <Card className="p-6 text-center">
                <CheckCircle className="w-10 h-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold mb-2">Flexibilidad</h3>
                <p className="text-sm text-muted-foreground">Enseña cuando y desde donde quieras</p>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth/tutor")}>
                <GraduationCap className="w-5 h-5 mr-2" />
                Registrarme como Tutor
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/auth")}>
                Ya tengo cuenta - Iniciar sesión
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
              <CardTitle>¡Registro exitoso!</CardTitle>
              <CardDescription>
                Tu perfil de tutor ha sido creado. Ahora puedes configurar tu disponibilidad.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/tutor-dashboard")}>
                Ir al panel de tutor
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/tutors")}>
                Ver lista de tutores
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <GraduationCap className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Conviértete en Tutor
            </h1>
            <p className="text-muted-foreground">
              Comparte tu conocimiento y ayuda a estudiantes de todo el mundo
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Información básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre como aparecerá en tu perfil" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Ciudad, País" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografía</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Cuéntales a los estudiantes sobre ti, tu experiencia y tu estilo de enseñanza..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/1000 caracteres (mínimo 50)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Languages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Idiomas que enseñas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="languages"
                    render={() => (
                      <FormItem>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {languages.map((lang) => (
                            <Badge key={lang} variant="secondary" className="gap-1 pr-1">
                              {lang}
                              <button
                                type="button"
                                onClick={() => removeLanguage(lang)}
                                className="ml-1 hover:bg-muted rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Input
                            placeholder="Agregar idioma..."
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addLanguage(newLanguage);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => addLanguage(newLanguage)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {SUGGESTED_LANGUAGES.filter((l) => !languages.includes(l)).slice(0, 5).map((lang) => (
                            <Button
                              key={lang}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => addLanguage(lang)}
                            >
                              + {lang}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nativeLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idioma Nativo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Español" {...field} />
                        </FormControl>
                        <FormDescription>
                          El idioma que hablas como lengua materna.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Specialties */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Especialidades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="specialties"
                    render={() => (
                      <FormItem>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {specialties.map((spec) => (
                            <Badge key={spec} variant="secondary" className="gap-1 pr-1">
                              {spec}
                              <button
                                type="button"
                                onClick={() => removeSpecialty(spec)}
                                className="ml-1 hover:bg-muted rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Input
                            placeholder="Agregar especialidad..."
                            value={newSpecialty}
                            onChange={(e) => setNewSpecialty(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addSpecialty(newSpecialty);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => addSpecialty(newSpecialty)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {SUGGESTED_SPECIALTIES.filter((s) => !specialties.includes(s)).slice(0, 5).map((spec) => (
                            <Button
                              key={spec}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => addSpecialty(spec)}
                            >
                              + {spec}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Tarifas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tarifa por hora (USD)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="number"
                              className="pl-10"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Esta es tu tarifa estándar por una hora de clase
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trialRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tarifa de clase de prueba (USD) - Opcional</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="number"
                              className="pl-10"
                              placeholder="0 para gratis"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Una clase introductoria de 30 minutos a precio reducido
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando perfil...
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Registrarme como tutor
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
