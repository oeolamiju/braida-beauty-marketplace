import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";
import backend from "@/lib/backend";
import { useApiError } from "@/hooks/useApiError";
import { useToast } from "@/components/ui/use-toast";
import { ServiceImageUploader } from "@/components/ServiceImageUploader";

interface Style {
  id: number;
  name: string;
}

interface ServiceFormData {
  title: string;
  category: string;
  subcategory: string;
  description: string;
  basePricePence: string;
  studioPricePence: string;
  mobilePricePence: string;
  durationMinutes: string;
  materialsPolicy: string;
  materialsFee: string;
  materialsDescription: string;
  locationTypes: string[];
  travelFee: string;
  styleIds: number[];
  isActive: boolean;
}

interface ServiceFormProps {
  serviceId?: number;
  mode: "create" | "edit";
}

const CATEGORIES = [
  { value: "hair", label: "Hair" },
  { value: "makeup", label: "Makeup" },
  { value: "gele", label: "Gele" },
  { value: "tailoring", label: "Tailoring" },
];

const MATERIALS_POLICIES = [
  { value: "client_provides", label: "Client Provides" },
  { value: "freelancer_provides", label: "Freelancer Provides" },
  { value: "both", label: "Both" },
];

const LOCATION_TYPES = [
  { value: "client_travels_to_freelancer", label: "Client Travels to Me" },
  { value: "freelancer_travels_to_client", label: "I Travel to Client" },
];

export default function ServiceForm({ serviceId, mode }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    category: "",
    subcategory: "",
    description: "",
    basePricePence: "",
    studioPricePence: "",
    mobilePricePence: "",
    durationMinutes: "",
    materialsPolicy: "",
    materialsFee: "",
    materialsDescription: "",
    locationTypes: [],
    travelFee: "",
    styleIds: [],
    isActive: true,
  });
  const [styles, setStyles] = useState<Style[]>([]);
  const [images, setImages] = useState<Array<{ id: number; imageUrl: string; displayOrder: number }>>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [savedServiceId, setSavedServiceId] = useState<number | undefined>(serviceId);
  const { showError } = useApiError();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadStyles();
    if (mode === "edit" && serviceId) {
      loadService();
    }
  }, [mode, serviceId]);

  async function loadStyles() {
    try {
      const response = await backend.styles.list({});
      setStyles(response.styles);
    } catch (error) {
      console.error("Failed to load styles:", error);
      showError(error);
    }
  }

  async function loadService() {
    try {
      const service = await backend.services.get({ id: serviceId! });
      setFormData({
        title: service.title,
        category: service.category,
        subcategory: service.subcategory || "",
        description: service.description || "",
        basePricePence: service.basePricePence ? (service.basePricePence / 100).toFixed(2) : "",
        studioPricePence: service.studioPricePence ? (service.studioPricePence / 100).toFixed(2) : "",
        mobilePricePence: service.mobilePricePence ? (service.mobilePricePence / 100).toFixed(2) : "",
        durationMinutes: service.durationMinutes.toString(),
        materialsPolicy: service.materialsPolicy,
        materialsFee: (service.materialsFee / 100).toFixed(2),
        materialsDescription: service.materialsDescription || "",
        locationTypes: service.locationTypes,
        travelFee: (service.travelFeePence / 100).toFixed(2),
        styleIds: service.styles.map(s => s.id),
        isActive: service.isActive,
      });

      const imagesResponse = await backend.services.listImages({ serviceId: serviceId! });
      setImages(imagesResponse.images);
    } catch (error) {
      console.error("Failed to load service:", error);
      showError(error);
    } finally {
      setLoading(false);
    }
  }

  function toggleStyle(styleId: number) {
    setFormData(prev => ({
      ...prev,
      styleIds: prev.styleIds.includes(styleId)
        ? prev.styleIds.filter(id => id !== styleId)
        : [...prev.styleIds, styleId],
    }));
  }

  function toggleLocationType(locationType: string) {
    setFormData(prev => ({
      ...prev,
      locationTypes: prev.locationTypes.includes(locationType)
        ? prev.locationTypes.filter(type => type !== locationType)
        : [...prev.locationTypes, locationType],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const hasStudio = formData.locationTypes.includes('client_travels_to_freelancer');
      const hasMobile = formData.locationTypes.includes('freelancer_travels_to_client');

      const payload = {
        title: formData.title,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        description: formData.description || undefined,
        basePricePence: formData.basePricePence ? Math.round(parseFloat(formData.basePricePence) * 100) : undefined,
        studioPricePence: hasStudio && formData.studioPricePence ? Math.round(parseFloat(formData.studioPricePence) * 100) : undefined,
        mobilePricePence: hasMobile && formData.mobilePricePence ? Math.round(parseFloat(formData.mobilePricePence) * 100) : undefined,
        durationMinutes: parseInt(formData.durationMinutes),
        materialsPolicy: formData.materialsPolicy,
        materialsFee: formData.materialsFee ? Math.round(parseFloat(formData.materialsFee) * 100) : 0,
        materialsDescription: formData.materialsDescription || undefined,
        locationTypes: formData.locationTypes,
        travelFee: formData.travelFee ? Math.round(parseFloat(formData.travelFee) * 100) : 0,
        styleIds: formData.styleIds,
        isActive: formData.isActive,
      };

      if (mode === "create") {
        const result = await backend.services.create(payload);
        setSavedServiceId(result.id);
        toast({ description: "Service created successfully. You can now add images." });
      } else {
        await backend.services.update({ id: serviceId!, ...payload });
        toast({ description: "Service updated successfully" });
      }

      if (mode === "edit") {
        navigate("/freelancer/services");
      }
    } catch (error) {
      console.error("Failed to save service:", error);
      showError(error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <p>Loading...</p>
      </div>
    );
  }

  const categoryStyles = styles.filter(style => {
    if (!formData.category) return false;
    const styleName = style.name.toLowerCase();
    const category = formData.category.toLowerCase();
    if (category === "hair") return styleName.includes("braid") || styleName.includes("wig") || styleName.includes("loc") || styleName.includes("wash");
    if (category === "makeup") return styleName.includes("makeup") || styleName.includes("glam");
    if (category === "gele") return styleName.includes("gele");
    if (category === "tailoring") return styleName.includes("tailor") || styleName.includes("alteration") || styleName.includes("aso-ebi");
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
      <div className="mb-6 md:mb-8">
        <Button variant="ghost" onClick={() => navigate("/freelancer/services")} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Back to Services</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {mode === "create" ? "Create New Service" : "Edit Service"}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Fill in the details for your service listing
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Knotless Box Braids - Medium Length"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subcategory</label>
              <Input
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="e.g. Box Braids, Cornrows"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-input bg-background rounded-md min-h-24"
              placeholder="Describe your service in detail..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
            <Input
              type="number"
              min="15"
              max="600"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
              placeholder="60"
              required
              className="max-w-xs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Materials Policy *</label>
            <select
              value={formData.materialsPolicy}
              onChange={(e) => setFormData({ ...formData, materialsPolicy: e.target.value })}
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              required
            >
              <option value="">Select policy</option>
              {MATERIALS_POLICIES.map(policy => (
                <option key={policy.value} value={policy.value}>{policy.label}</option>
              ))}
            </select>
          </div>

          {(formData.materialsPolicy === "freelancer_provides" || formData.materialsPolicy === "both") && (
            <div>
              <label className="block text-sm font-medium mb-2">Materials Fee (£)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.materialsFee}
                onChange={(e) => setFormData({ ...formData, materialsFee: e.target.value })}
                placeholder="0.00"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Materials Description</label>
            <textarea
              value={formData.materialsDescription}
              onChange={(e) => setFormData({ ...formData, materialsDescription: e.target.value })}
              className="w-full px-3 py-2 border border-input bg-background rounded-md min-h-16"
              placeholder="Describe what materials are needed or provided..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location Types & Pricing *</label>
            <p className="text-sm text-muted-foreground mb-3">Set different prices for studio and mobile services</p>
            <div className="space-y-4">
              <div className="border border-input rounded-lg p-4">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={formData.locationTypes.includes('client_travels_to_freelancer')}
                    onChange={() => toggleLocationType('client_travels_to_freelancer')}
                    className="rounded border-input"
                  />
                  <span className="text-sm font-medium">Studio Service (Client Travels to Me)</span>
                </label>
                {formData.locationTypes.includes('client_travels_to_freelancer') && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Studio Price (£) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.studioPricePence}
                      onChange={(e) => setFormData({ ...formData, studioPricePence: e.target.value })}
                      placeholder="0.00"
                      required
                      className="max-w-xs"
                    />
                  </div>
                )}
              </div>

              <div className="border border-input rounded-lg p-4">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={formData.locationTypes.includes('freelancer_travels_to_client')}
                    onChange={() => toggleLocationType('freelancer_travels_to_client')}
                    className="rounded border-input"
                  />
                  <span className="text-sm font-medium">Mobile Service (I Travel to Client)</span>
                </label>
                {formData.locationTypes.includes('freelancer_travels_to_client') && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Mobile Price (£) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.mobilePricePence}
                      onChange={(e) => setFormData({ ...formData, mobilePricePence: e.target.value })}
                      placeholder="0.00"
                      required
                      className="max-w-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Style Tags * (select at least one)</label>
            <div className="flex flex-wrap gap-2">
              {categoryStyles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {formData.category ? "No styles available for this category" : "Select a category first"}
                </p>
              ) : (
                categoryStyles.map(style => (
                  <Badge
                    key={style.id}
                    variant={formData.styleIds.includes(style.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStyle(style.id)}
                  >
                    {style.name}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {savedServiceId && (
            <div>
              <label className="block text-sm font-medium mb-2">Service Images</label>
              <ServiceImageUploader
                serviceId={savedServiceId}
                images={images}
                onImagesChange={setImages}
                onError={(error) => toast({ description: error, variant: "destructive" })}
              />
            </div>
          )}

          {mode === "edit" && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-input"
                />
                <span className="text-sm font-medium">Service is active</span>
              </label>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={submitting} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {submitting ? "Saving..." : mode === "create" ? "Create Service" : "Save Changes"}
            </Button>
            {(mode === "edit" || savedServiceId) && (
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/freelancer/services")}
                disabled={submitting}
              >
                {mode === "create" ? "Done" : "Cancel"}
              </Button>
            )}
            {mode === "create" && !savedServiceId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/freelancer/services")}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
}
