import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploaderProps {
  onUploadComplete: (imageId: string) => void;
  onError: (error: string) => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
}

export function ImageUploader({
  onUploadComplete,
  onError,
  acceptedFormats = "image/jpeg,image/png,image/jpg",
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      onError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setProgress(0);

    try {
      const uploadUrlResponse = await fetch("/api/profiles/portfolio/upload-url", {
        method: "POST",
        credentials: "include",
      });

      if (!uploadUrlResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, imageId } = await uploadUrlResponse.json();

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onUploadComplete(imageId);
          setPreview(null);
          setUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          throw new Error("Upload failed");
        }
      });

      xhr.addEventListener("error", () => {
        throw new Error("Upload failed");
      });

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    } catch (error) {
      console.error("Upload error:", error);
      onError("Failed to upload image");
      setUploading(false);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          {!uploading && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={clearPreview}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm">{progress}%</p>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            Click to upload or drag and drop
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            onChange={handleFileSelect}
            disabled={uploading}
            className="cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
