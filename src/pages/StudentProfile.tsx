import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Save, Globe } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre debe tener menos de 100 caracteres"),
});

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  timezone: string | null;
}

// Common timezones list
const TIMEZONES = [
  { value: "America/New_York", label: "Nueva York (EST/EDT)" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)" },
  { value: "America/Denver", label: "Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "Los Ángeles (PST/PDT)" },
  { value: "America/Mexico_City", label: "Ciudad de México (CST)" },
  { value: "America/Bogota", label: "Bogotá (COT)" },
  { value: "America/Lima", label: "Lima (PET)" },
  { value: "America/Santiago", label: "Santiago (CLT/CLST)" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (ART)" },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT/BRST)" },
  { value: "America/Caracas", label: "Caracas (VET)" },
  { value: "Europe/London", label: "Londres (GMT/BST)" },
  { value: "Europe/Paris", label: "París (CET/CEST)" },
  { value: "Europe/Madrid", label: "Madrid (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlín (CET/CEST)" },
  { value: "Europe/Rome", label: "Roma (CET/CEST)" },
  { value: "Europe/Moscow", label: "Moscú (MSK)" },
  { value: "Asia/Dubai", label: "Dubái (GST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Shanghai", label: "China (CST)" },
  { value: "Asia/Tokyo", label: "Tokio (JST)" },
  { value: "Asia/Seoul", label: "Seúl (KST)" },
  { value: "Australia/Sydney", label: "Sídney (AEST/AEDT)" },
  { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)" },
];

export default function StudentProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [errors, setErrors] = useState<{ fullName?: string }>({});

  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    }

    if (data) {
      setProfile(data);
      setFullName(data.full_name || "");
      // Use saved timezone or fall back to browser detected
      setTimezone(data.timezone || detectedTimezone);
    } else {
      // No profile yet, use browser timezone
      setTimezone(detectedTimezone);
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    const validation = profileSchema.safeParse({ fullName });
    
    if (!validation.success) {
      const fieldErrors: { fullName?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "fullName") {
          fieldErrors.fullName = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    
    setErrors({});
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), timezone })
      .eq("user_id", user!.id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Perfil actualizado",
        description: "Tu información se ha guardado correctamente",
      });
      fetchProfile();
    }

    setSaving(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten imágenes JPG, PNG o WebP",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El tamaño máximo es 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    // Delete old avatar if exists
    if (profile?.avatar_url) {
      const oldPath = profile.avatar_url.split("/avatars/")[1];
      if (oldPath) {
        await supabase.storage.from("avatars").remove([oldPath]);
      }
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({
        title: "Error al subir imagen",
        description: uploadError.message,
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("user_id", user.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la foto de perfil",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil se ha actualizado correctamente",
      });
      fetchProfile();
    }

    setUploading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Mi Perfil</h1>

          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información de perfil y foto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "Usuario"} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Haz clic en el icono de cámara para cambiar tu foto
                </p>
              </div>

              {/* Profile Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    El correo electrónico no se puede cambiar
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona horaria</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="w-full">
                      <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Selecciona tu zona horaria" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                      {/* If user's timezone isn't in the list, show it as an option */}
                      {!TIMEZONES.find(tz => tz.value === timezone) && timezone && (
                        <SelectItem value={timezone}>
                          {timezone}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Detectada: {detectedTimezone}
                  </p>
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}