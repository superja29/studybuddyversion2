import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, Loader2, User, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TutorImageUploadProps {
  tutorId: string;
  userId: string;
  currentAvatarUrl: string | null;
  currentCoverUrl: string | null;
  tutorName: string;
  onImagesUpdated: () => void;
}

export function TutorImageUpload({
  tutorId,
  userId,
  currentAvatarUrl,
  currentCoverUrl,
  tutorName,
  onImagesUpdated,
}: TutorImageUploadProps) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadImage = async (
    file: File,
    type: "avatar" | "cover"
  ): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("tutor-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("tutor-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no puede superar los 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const url = await uploadImage(file, "avatar");

      const { error } = await supabase
        .from("tutors")
        .update({ avatar_url: url })
        .eq("id", tutorId);

      if (error) throw error;

      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada correctamente.",
      });
      onImagesUpdated();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen de portada no puede superar los 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingCover(true);
    try {
      const url = await uploadImage(file, "cover");

      const { error } = await supabase
        .from("tutors")
        .update({ cover_image_url: url })
        .eq("id", tutorId);

      if (error) throw error;

      toast({
        title: "Portada actualizada",
        description: "Tu imagen de portada ha sido actualizada correctamente.",
      });
      onImagesUpdated();
    } catch (error) {
      console.error("Error uploading cover:", error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Imágenes de Perfil
        </CardTitle>
        <CardDescription>
          Sube tu foto de perfil y una imagen de portada para tu página de tutor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cover Image */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Imagen de Portada
          </label>
          <div
            className="relative w-full h-32 bg-muted rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => coverInputRef.current?.click()}
          >
            {currentCoverUrl ? (
              <img
                src={currentCoverUrl}
                alt="Portada"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm">Haz clic para subir una imagen de portada</span>
                <span className="text-xs">Recomendado: 1200x400px (máx. 10MB)</span>
              </div>
            )}
            {uploadingCover && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
          {currentCoverUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
            >
              {uploadingCover ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Cambiar portada
            </Button>
          )}
        </div>

        {/* Avatar */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Foto de Perfil
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage src={currentAvatarUrl || ""} alt={tutorName} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {tutorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-background/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Camera className="w-4 h-4 mr-2" />
                )}
                {currentAvatarUrl ? "Cambiar foto" : "Subir foto"}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG o GIF (máx. 5MB)
              </p>
            </div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}
