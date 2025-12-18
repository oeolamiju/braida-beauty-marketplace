import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X, Image as ImageIcon, Star } from "lucide-react";

interface ServiceImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

interface DraggableImageGridProps {
  images: ServiceImage[];
  onReorder: (newOrder: number[]) => void;
  onDelete: (imageId: number) => void;
  disabled?: boolean;
}

export function DraggableImageGrid({
  images,
  onReorder,
  onDelete,
  disabled = false,
}: DraggableImageGridProps) {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, imageId: number) => {
      if (disabled) return;
      setDraggedId(imageId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", imageId.toString());
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, imageId: number) => {
      if (disabled) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverId(imageId);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: number) => {
      if (disabled) return;
      e.preventDefault();
      
      const sourceId = parseInt(e.dataTransfer.getData("text/plain"));
      if (sourceId === targetId) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }

      const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
      const sourceIndex = sortedImages.findIndex((img) => img.id === sourceId);
      const targetIndex = sortedImages.findIndex((img) => img.id === targetId);

      const newOrder = [...sortedImages];
      const [removed] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(targetIndex, 0, removed);

      onReorder(newOrder.map((img) => img.id));
      setDraggedId(null);
      setDragOverId(null);
    },
    [images, onReorder, disabled]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  if (images.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No images uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-3">
        Drag and drop to reorder. First image will be the cover photo.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedImages.map((image, index) => (
          <Card
            key={image.id}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, image.id)}
            onDragOver={(e) => handleDragOver(e, image.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, image.id)}
            onDragEnd={handleDragEnd}
            className={`relative group overflow-hidden transition-all ${
              draggedId === image.id ? "opacity-50 scale-95" : ""
            } ${
              dragOverId === image.id && draggedId !== image.id
                ? "ring-2 ring-orange-500 ring-offset-2"
                : ""
            } ${!disabled ? "cursor-grab active:cursor-grabbing" : ""}`}
          >
            <div className="aspect-square relative">
              <img
                src={image.imageUrl}
                alt={`Service image ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
              
              {/* Cover Photo Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded flex items-center gap-1">
                  <Star className="h-3 w-3" fill="white" />
                  Cover
                </div>
              )}

              {/* Hover Overlay */}
              {!disabled && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-8 w-8 text-white" />
                  </div>
                </div>
              )}

              {/* Delete Button */}
              {!disabled && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(image.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

