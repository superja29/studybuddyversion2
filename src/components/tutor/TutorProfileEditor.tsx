import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Save, X, Plus, User, Video, GraduationCap, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Tutor = Tables<"tutors">;

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  bio: z.string().max(1000, "La biografía no puede superar los 1000 caracteres").optional(),
  location: z.string().max(100, "La ubicación no puede superar los 100 caracteres").optional(),
  hourly_rate: z.coerce.number().min(1, "La tarifa debe ser mayor a 0"),
  trial_rate: z.coerce.number().min(0, "La tarifa de prueba no puede ser negativa").optional(),
  native_language: z.string().optional(),
  video_url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface TutorProfileEditorProps {
  tutor: Tutor;
  onProfileUpdated: () => void;
}

export function TutorProfileEditor({ tutor, onProfileUpdated }: TutorProfileEditorProps) {
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState<string[]>(tutor.languages || []);
  const [specialties, setSpecialties] = useState<string[]>(tutor.specialties || []);
  const [education, setEducation] = useState<string[]>(tutor.education || []);
  const [certifications, setCertifications] = useState<string[]>(tutor.certifications || []);
  const [newLanguage, setNewLanguage] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newEducation, setNewEducation] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: tutor.name,
      bio: tutor.bio || "",
      location: tutor.location || "",
      hourly_rate: Number(tutor.hourly_rate),
      trial_rate: tutor.trial_rate ? Number(tutor.trial_rate) : undefined,
      native_language: tutor.native_language || "",
      video_url: (tutor as any).video_url || "",
    },
  });

  useEffect(() => {
    form.reset({
      name: tutor.name,
      bio: tutor.bio || "",
      location: tutor.location || "",
      hourly_rate: Number(tutor.hourly_rate),
      trial_rate: tutor.trial_rate ? Number(tutor.trial_rate) : undefined,
      native_language: tutor.native_language || "",
      video_url: (tutor as any).video_url || "",
    });
  }, [tutor, form]);

  const addLanguage = () => {
    const lang = newLanguage.trim();
    if (lang && !languages.includes(lang)) {
      setLanguages([...languages, lang]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang));
  };

  const addSpecialty = () => {
    const spec = newSpecialty.trim();
    if (spec && !specialties.includes(spec)) {
      setSpecialties([...specialties, spec]);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (spec: string) => {
    setSpecialties(specialties.filter((s) => s !== spec));
  };

  const addEducation = () => {
    const edu = newEducation.trim();
    if (edu && !education.includes(edu)) {
      setEducation([...education, edu]);
      setNewEducation("");
    }
  };

  const removeEducation = (edu: string) => {
    setEducation(education.filter((e) => e !== edu));
  };

  const addCertification = () => {
    const cert = newCertification.trim();
    if (cert && !certifications.includes(cert)) {
      setCertifications([...certifications, cert]);
      setNewCertification("");
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter((c) => c !== cert));
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true);
    console.log("Submitting profile update:", data);
    try {
      const { error } = await supabase
        .from("tutors")
        .update({
          name: data.name,
          bio: data.bio || null,
          location: data.location || null,
          hourly_rate: data.hourly_rate,
          trial_rate: data.trial_rate || null,
          native_language: data.native_language || null,
          video_url: data.video_url || null,
          languages,
          specialties,
          education,
          certifications,
        })
        .eq("id", tutor.id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Profile updated successfully");
      toast({
        title: "Perfil actualizado",
        description: "Tu información de perfil ha sido guardada correctamente.",
      });
      onProfileUpdated();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Información del Perfil
        </CardTitle>
        <CardDescription>
          Actualiza tu información personal y tarifas para que los estudiantes te conozcan mejor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} />
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
                      <Input placeholder="Ciudad, País" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografía</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cuéntanos sobre ti, tu experiencia y metodología de enseñanza..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/1000 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Languages */}
            <div className="space-y-3">
              <FormLabel>Idiomas que enseñas</FormLabel>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="gap-1">
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Añadir idioma..."
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                />
                <Button type="button" variant="outline" size="icon" onClick={addLanguage}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Specialties */}
            <div className="space-y-3">
              <FormLabel>Especialidades</FormLabel>
              <div className="flex flex-wrap gap-2">
                {specialties.map((spec) => (
                  <Badge key={spec} variant="outline" className="gap-1">
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(spec)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Añadir especialidad..."
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                />
                <Button type="button" variant="outline" size="icon" onClick={addSpecialty}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Rates */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="hourly_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa por hora (€)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trial_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa clase de prueba (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Opcional"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Deja vacío si no ofreces clases de prueba
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Video URL */}
            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video de presentación
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enlace a tu video de YouTube o Vimeo para presentarte a los estudiantes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Education */}
            <div className="space-y-3">
              <FormLabel className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Formación Académica
              </FormLabel>
              <div className="flex flex-wrap gap-2">
                {education.map((edu) => (
                  <Badge key={edu} variant="secondary" className="gap-1">
                    {edu}
                    <button
                      type="button"
                      onClick={() => removeEducation(edu)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: Licenciatura en Filología Inglesa"
                  value={newEducation}
                  onChange={(e) => setNewEducation(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEducation())}
                />
                <Button type="button" variant="outline" size="icon" onClick={addEducation}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-3">
              <FormLabel className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Certificaciones
              </FormLabel>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="gap-1">
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: TEFL Certified, Cambridge CAE"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                />
                <Button type="button" variant="outline" size="icon" onClick={addCertification}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full md:w-auto">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar cambios
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
