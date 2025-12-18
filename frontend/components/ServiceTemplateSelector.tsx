import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lightbulb, Clock, Coins, Info, ChevronRight } from "lucide-react";
import backend from "@/lib/backend";

interface ServiceTemplate {
  name: string;
  category: string;
  subcategory: string;
  description: string;
  suggestedDurationMinutes: { min: number; max: number };
  suggestedPricePence: { min: number; max: number };
  materialsPolicy: string;
  suggestedMaterialsFee: number;
  tips: string[];
}

interface ServiceTemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: ServiceTemplate) => void;
  category?: string;
}

export function ServiceTemplateSelector({
  open,
  onClose,
  onSelect,
  category,
}: ServiceTemplateSelectorProps) {
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);

  const categories = [
    { value: "hair", label: "Hair" },
    { value: "makeup", label: "Makeup" },
    { value: "gele", label: "Gele" },
    { value: "tailoring", label: "Tailoring" },
  ];

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, selectedCategory]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await backend.services.getServiceTemplates({
        category: selectedCategory || undefined,
      });
      setTemplates(response.templates);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (pence: number) => `£${(pence / 100).toFixed(0)}`;
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-orange-500" />
            Service Templates
          </DialogTitle>
          <DialogDescription>
            Start with a template and customize it to your style
          </DialogDescription>
        </DialogHeader>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 pb-4 border-b">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("")}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No templates found for this category
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <Card
                  key={template.name}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.name === template.name
                      ? "ring-2 ring-orange-500 bg-orange-50"
                      : ""
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {template.subcategory}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDuration(template.suggestedDurationMinutes.min)} -{" "}
                          {formatDuration(template.suggestedDurationMinutes.max)}
                        </span>
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <Coins className="h-4 w-4" />
                          {formatPrice(template.suggestedPricePence.min)} -{" "}
                          {formatPrice(template.suggestedPricePence.max)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 transition-colors ${
                        selectedTemplate?.name === template.name
                          ? "text-orange-500"
                          : "text-gray-300"
                      }`}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        {selectedTemplate && selectedTemplate.tips.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 text-sm">Tips for this service</p>
                <ul className="mt-1 space-y-1">
                  {selectedTemplate.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-blue-700">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedTemplate}>
            Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

