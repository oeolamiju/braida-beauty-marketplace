import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PortfolioItem {
  id: number;
  imageUrl: string;
  caption: string | null;
}

interface PortfolioGalleryProps {
  items: PortfolioItem[];
  editable?: boolean;
  onDelete?: (itemId: number) => void;
}

export function PortfolioGallery({
  items,
  editable = false,
  onDelete,
}: PortfolioGalleryProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
        <p className="text-muted-foreground">No portfolio items yet</p>
        {editable && (
          <p className="text-sm text-muted-foreground mt-2">
            Upload images to showcase your work
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden group relative">
          <img
            src={item.imageUrl}
            alt={item.caption || "Portfolio image"}
            className="w-full h-48 sm:h-56 md:h-64 object-cover"
          />
          {item.caption && (
            <div className="p-3 bg-card">
              <p className="text-sm text-foreground">{item.caption}</p>
            </div>
          )}
          {editable && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(item.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
