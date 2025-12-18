import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Upload, Loader2 } from "lucide-react";
import backend from "@/lib/backend";
import type { ListAllStylesResponse } from "~backend/styles/list_all";
import { useToast } from "@/components/ui/use-toast";

interface Style {
  id: number;
  name: string;
  description: string | null;
  referenceImageUrl: string | null;
  isActive: boolean;
  servicesCount: number;
}

export default function AdminStyles() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    referenceImageUrl: "",
    isActive: true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = async () => {
    try {
      setLoading(true);
      const response: ListAllStylesResponse = await backend.styles.listAll();
      setStyles(response.styles);
    } catch (error: any) {
      console.error("Failed to load styles:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load styles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64String = btoa(String.fromCharCode(...uint8Array));

      const response = await backend.styles.uploadImage({
        fileName: file.name,
        fileData: base64String,
        contentType: file.type,
      });

      setFormData({ ...formData, referenceImageUrl: response.url });
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      if (editingStyle) {
        await backend.styles.update({
          id: editingStyle.id,
          name: formData.name,
          description: formData.description || undefined,
          referenceImageUrl: formData.referenceImageUrl || undefined,
          isActive: formData.isActive,
        });
        toast({
          title: "Success",
          description: "Style updated successfully",
        });
      } else {
        await backend.styles.create({
          name: formData.name,
          description: formData.description || undefined,
          referenceImageUrl: formData.referenceImageUrl || undefined,
        });
        toast({
          title: "Success",
          description: "Style created successfully",
        });
      }
      setShowForm(false);
      setEditingStyle(null);
      setFormData({ name: "", description: "", referenceImageUrl: "", isActive: true });
      loadStyles();
    } catch (error: any) {
      console.error("Failed to save style:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save style",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (style: Style) => {
    setEditingStyle(style);
    setFormData({
      name: style.name,
      description: style.description || "",
      referenceImageUrl: style.referenceImageUrl || "",
      isActive: style.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (style: Style) => {
    if (!confirm(`Are you sure you want to delete "${style.name}"?`)) {
      return;
    }

    try {
      await backend.styles.remove({ id: style.id });
      toast({
        title: "Success",
        description: "Style deleted successfully",
      });
      loadStyles();
    } catch (error: any) {
      console.error("Failed to delete style:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete style",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStyle(null);
    setFormData({ name: "", description: "", referenceImageUrl: "", isActive: true });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Styles Management</h1>
          <p className="text-muted-foreground">Manage beauty styles catalog</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Style
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingStyle ? "Edit Style" : "Create New Style"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bridal Makeup"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this style..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reference Image</label>
              {formData.referenceImageUrl && (
                <div className="mb-3">
                  <img
                    src={formData.referenceImageUrl}
                    alt="Reference"
                    className="h-32 w-32 object-cover rounded-md border"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a reference image (JPEG, PNG, or WebP, max 5MB)
              </p>
            </div>

            {editingStyle && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active
                </label>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{editingStyle ? "Update" : "Create"} Style</>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {styles.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No styles found. Create your first style above.</p>
          </Card>
        ) : (
          styles.map((style) => (
            <Card key={style.id} className="p-6">
              <div className="flex gap-4">
                {style.referenceImageUrl && (
                  <img
                    src={style.referenceImageUrl}
                    alt={style.name}
                    className="h-24 w-24 object-cover rounded-md flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{style.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={style.isActive ? "default" : "secondary"}>
                          {style.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {style.servicesCount} service{style.servicesCount !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(style)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(style)}
                        disabled={style.servicesCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {style.description && (
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
