import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, Video, Calendar, CheckCircle, ArrowRight, ArrowLeft, GraduationCap, X, Plus } from "lucide-react";
import { TutorAvailabilityManager } from "./TutorAvailabilityManager";

interface TutorOnboardingWizardProps {
  tutorId: string;
  userId: string;
  onComplete: () => void;
}

export function TutorOnboardingWizard({ tutorId, userId, onComplete }: TutorOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [education, setEducation] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newEducation, setNewEducation] = useState("");
  const [newCertification, setNewCertification] = useState("");

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File, type: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('tutor-images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('tutor-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSavePhotos = async () => {
    setSaving(true);
    try {
      const updates: { avatar_url?: string; cover_image_url?: string } = {};

      if (avatarFile) {
        updates.avatar_url = await uploadImage(avatarFile, 'avatars');
      }

      if (coverFile) {
        updates.cover_image_url = await uploadImage(coverFile, 'covers');
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('tutors')
          .update(updates)
          .eq('id', tutorId);

        if (error) throw error;
      }

      toast({
        title: "¡Fotos guardadas!",
        description: "Tus imágenes se han actualizado correctamente.",
      });
      setCurrentStep(2);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVideo = async () => {
    setSaving(true);
    try {
      if (videoUrl) {
        const { error } = await supabase
          .from('tutors')
          .update({ video_url: videoUrl })
          .eq('id', tutorId);

        if (error) throw error;
      }

      toast({
        title: "¡Video guardado!",
        description: "Tu video de presentación se ha guardado correctamente.",
      });
      setCurrentStep(3);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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

  const handleSaveCredentials = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tutors')
        .update({
          education,
          certifications,
        })
        .eq('id', tutorId);

      if (error) throw error;

      toast({
        title: "¡Credenciales guardadas!",
        description: "Tu formación y certificaciones se han guardado correctamente.",
      });
      setCurrentStep(4);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = () => {
    toast({
      title: "¡Perfil completado!",
      description: "Tu perfil de tutor está listo. ¡Buena suerte!",
    });
    onComplete();
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Completa tu perfil</h1>
        <p className="text-muted-foreground">
          Añade más información para que los estudiantes te encuentren
        </p>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Paso {currentStep} de {totalSteps}
          </p>
        </div>
      </div>

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Sube tus fotos
            </CardTitle>
            <CardDescription>
              Añade una foto de perfil y una imagen de portada para destacar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="avatar">Foto de perfil</Label>
              <div className="mt-2 flex items-center gap-4">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="max-w-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cover">Imagen de portada</Label>
              <div className="mt-2">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-32 rounded-lg object-cover mb-2"
                  />
                ) : (
                  <div className="w-full h-32 rounded-lg bg-muted flex items-center justify-center mb-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" disabled>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Omitir
                </Button>
                <Button onClick={handleSavePhotos} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar y continuar"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video de presentación
            </CardTitle>
            <CardDescription>
              Añade un enlace a tu video de YouTube o Vimeo para presentarte a los estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="video">URL del video (YouTube o Vimeo)</Label>
              <Input
                id="video"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Un video de presentación ayuda a los estudiantes a conocerte mejor
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Omitir
                </Button>
                <Button onClick={handleSaveVideo} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar y continuar"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Formación y Certificaciones
            </CardTitle>
            <CardDescription>
              Añade tu formación académica y certificaciones profesionales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Education */}
            <div className="space-y-3">
              <Label>Formación Académica</Label>
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
                  placeholder="Ej: Licenciatura en Filología Inglesa, Universidad de Madrid"
                  value={newEducation}
                  onChange={(e) => setNewEducation(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEducation())}
                />
                <Button type="button" variant="outline" size="icon" onClick={addEducation}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Incluye títulos universitarios, másteres, cursos relevantes, etc.
              </p>
            </div>

            {/* Certifications */}
            <div className="space-y-3">
              <Label>Certificaciones Profesionales</Label>
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
                  placeholder="Ej: TEFL Certified, Cambridge CAE, DELE C2"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                />
                <Button type="button" variant="outline" size="icon" onClick={addCertification}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Añade certificaciones de idiomas, metodología, etc.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(4)}>
                  Omitir
                </Button>
                <Button onClick={handleSaveCredentials} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar y continuar"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configura tu disponibilidad
            </CardTitle>
            <CardDescription>
              Define los horarios en los que puedes dar clases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TutorAvailabilityManager tutorId={tutorId} />

            <div className="flex justify-between pt-6">
              <Button variant="ghost" onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button onClick={handleComplete} className="bg-primary">
                <CheckCircle className="mr-2 h-4 w-4" />
                Completar perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
