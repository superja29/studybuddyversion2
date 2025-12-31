import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { GraduationCap, Globe, DollarSign, MapPin, Loader2, X, Plus, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

const tutorAuthSchema = z.object({
  email: z.string().email("Por favor ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),
  location: z.string().trim().min(2, "La ubicación debe tener al menos 2 caracteres").max(100, "La ubicación no puede exceder 100 caracteres"),
  bio: z.string().trim().min(50, "La biografía debe tener al menos 50 caracteres").max(1000, "La biografía no puede exceder 1000 caracteres"),
  hourlyRate: z.number().min(5, "La tarifa mínima es $5").max(500, "La tarifa máxima es $500"),
  trialRate: z.number().min(0, "La tarifa de prueba no puede ser negativa").max(100, "La tarifa de prueba máxima es $100").optional(),
  languages: z.array(z.string()).min(1, "Debes agregar al menos un idioma"),
  specialties: z.array(z.string()).min(1, "Debes agregar al menos una especialidad"),
});

type TutorAuthFormValues = z.infer<typeof tutorAuthSchema>;

const SUGGESTED_LANGUAGES = [
  "Español", "Inglés", "Francés", "Alemán", "Italiano", 
  "Portugués", "Chino Mandarín", "Japonés", "Coreano", "Árabe"
];

const SUGGESTED_SPECIALTIES = [
  "Conversación", "Gramática", "Negocios", "Preparación de exámenes",
  "Niños", "Principiantes", "Avanzado", "Pronunciación", "Escritura"
];

export default function TutorAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newLanguage, setNewLanguage] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [step, setStep] = useState<"credentials" | "profile">("credentials");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<TutorAuthFormValues>({
    resolver: zodResolver(tutorAuthSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      location: "",
      bio: "",
      hourlyRate: 25,
      trialRate: 5,
      languages: [],
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

  const handleNextStep = async () => {
    const emailValid = await form.trigger("email");
    const passwordValid = await form.trigger("password");
    
    if (emailValid && passwordValid) {
      setStep("profile");
    }
  };

  const onSubmit = async (data: TutorAuthFormValues) => {
    setLoading(true);

    try {
      // 1. Create user account
      const redirectUrl = `${window.location.origin}/`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.name,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast.error("Este email ya está registrado. Por favor inicia sesión.");
          navigate("/auth");
        } else {
          throw authError;
        }
        return;
      }

      if (!authData.user) {
        throw new Error("No se pudo crear la cuenta");
      }

      // 2. Create tutor profile
      const { error: tutorError } = await supabase.from("tutors").insert({
        user_id: authData.user.id,
        name: data.name,
        location: data.location,
        bio: data.bio,
        hourly_rate: data.hourlyRate,
        trial_rate: data.trialRate || null,
        languages: data.languages,
        specialties: data.specialties,
      });

      if (tutorError) throw tutorError;

      // 3. Add tutor role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: "tutor" as const,
      });

      if (roleError && !roleError.message.includes("duplicate")) {
        console.error("Error adding tutor role:", roleError);
      }

      toast.success("¡Cuenta de tutor creada exitosamente!");
      navigate("/tutor-dashboard");
    } catch (error: any) {
      console.error("Error creating tutor account:", error);
      toast.error(error.message || "Error al crear la cuenta de tutor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <Globe className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">SkilledVoice</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Regístrate como Tutor
          </h1>
          <p className="text-muted-foreground">
            Crea tu cuenta y perfil de tutor en un solo paso
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className={`w-3 h-3 rounded-full ${step === "credentials" ? "bg-primary" : "bg-primary/30"}`} />
            <div className={`w-16 h-1 ${step === "profile" ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-3 h-3 rounded-full ${step === "profile" ? "bg-primary" : "bg-muted"}`} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Paso {step === "credentials" ? "1" : "2"} de 2: {step === "credentials" ? "Credenciales" : "Perfil de Tutor"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === "credentials" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Crea tu cuenta
                  </CardTitle>
                  <CardDescription>
                    Ingresa tu email y contraseña para crear tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="tu@ejemplo.com" type="email" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              className="pl-10 pr-10" 
                              placeholder="••••••••" 
                              type={showPassword ? "text" : "password"} 
                              {...field} 
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormDescription>Mínimo 6 caracteres</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="button" className="w-full" onClick={handleNextStep}>
                    Continuar
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/auth" className="text-primary hover:underline">
                      Inicia sesión
                    </Link>
                  </p>
                </CardContent>
              </Card>
            )}

            {step === "profile" && (
              <>
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
                          <FormDescription>Tarifa estándar por una hora de clase</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="trialRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tarifa clase de prueba (USD) - Opcional</FormLabel>
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
                          <FormDescription>Tarifa especial para la primera clase (30 min)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("credentials")}
                  >
                    Atrás
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear cuenta de tutor
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  ¿Prefieres registrarte como estudiante?{" "}
                  <Link to="/auth" className="text-primary hover:underline">
                    Registro de estudiante
                  </Link>
                </p>
              </>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
