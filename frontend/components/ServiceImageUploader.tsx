import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import backend from "@/lib/backend";

interface ServiceImageUploaderProps {
  serviceId: number;
  images: Array<{ id: number; imageUrl: string; displayOrder: number }>;
  onImagesChange: (images: Array<{ id: number; imageUrl: string; displayOrder: number }>) => void;
  onError: (error: string) => void;
  maxImages?: number;
}

export function ServiceImageUploader({
  serviceId,
  images,
  onImagesChange,
  onError,
  maxImages = 5,
}: ServiceImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onError("File size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Image = event.target?.result as string;
          const response = await backend.services.uploadImage({
            serviceId,
            image: base64Image,
          });

          onImagesChange([...images, response]);
        } catch (error) {
          console.error("Upload error:", error);
          onError("Failed to upload image");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File read error:", error);
      onError("Failed to read file");
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    try {
      await backend.services.deleteImage({ serviceId, imageId });
      onImagesChange(images.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error("Delete error:", error);
      onError("Failed to delete image");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative">
            <img
              src={image.imageUrl}
              alt="Service"
              className="w-full h-40 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleDelete(image.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {images.length < maxImages && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Add service image ({images.length}/{maxImages})
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                id="service-image-upload"
              />
              <label htmlFor="service-image-upload">
                <Button type="button" variant="outline" className="cursor-pointer" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
}
