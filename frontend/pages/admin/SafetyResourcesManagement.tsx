import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { SafetyResource } from "~backend/content/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, AlertTriangle, Phone, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SafetyResourcesManagement() {
  const { toast } = useToast();
  const [resources, setResources] = useState<SafetyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<SafetyResource | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resourceType: "hotline",
    url: "",
    phoneNumber: "",
    isEmergency: false,
    displayOrder: 0,
    isActive: true,
  });

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await backend.content.listSafetyResources({ activeOnly: false });
      setResources(response.resources);
    } catch (error) {
      console.error("Failed to load resources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleEdit = (resource: SafetyResource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      resourceType: resource.resourceType,
      url: resource.url || "",
      phoneNumber: resource.phoneNumber || "",
      isEmergency: resource.isEmergency,
      displayOrder: resource.displayOrder,
      isActive: resource.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingResource(null);
    setFormData({
      title: "",
      description: "",
      resourceType: "hotline",
      url: "",
      phoneNumber: "",
      isEmergency: false,
      displayOrder: 0,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingResource) {
        await backend.content.updateSafetyResource({
          id: editingResource.id,
          ...formData,
        });
        toast({
          title: "Success",
          description: "Safety resource updated successfully",
        });
      } else {
        await backend.content.createSafetyResource(formData);
        toast({
          title: "Success",
          description: "Safety resource created successfully",
        });
      }
      setIsDialogOpen(false);
      await loadResources();
    } catch (error: any) {
      console.error("Failed to save resource:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save resource",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this safety resource?")) return;

    try {
      await backend.content.deleteSafetyResource({ id });
      toast({
        title: "Success",
        description: "Safety resource deleted successfully",
      });
      await loadResources();
    } catch (error) {
      console.error("Failed to delete resource:", error);
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Safety Resources</h1>
          <p className="text-muted-foreground">
            Manage emergency contacts and safety resources
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Resource
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {resources.map(resource => (
            <Card key={resource.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {resource.isEmergency && (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      <CardTitle>{resource.title}</CardTitle>
                      <Badge variant={resource.isActive ? "default" : "secondary"}>
                        {resource.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {resource.isEmergency && (
                        <Badge variant="destructive">Emergency</Badge>
                      )}
                    </div>
                    <CardDescription className="mt-2">
                      {resource.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(resource)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="capitalize">
                    {resource.resourceType}
                  </Badge>
                  {resource.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{resource.phoneNumber}</span>
                    </div>
                  )}
                  {resource.url && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {resource.url}
                      </a>
                    </div>
                  )}
                  <span className="text-muted-foreground">Order: {resource.displayOrder}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? "Edit Safety Resource" : "Create Safety Resource"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Resource name"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the resource"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Resource Type</Label>
                <Select
                  value={formData.resourceType}
                  onValueChange={(value) => setFormData({ ...formData, resourceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="hotline">Hotline</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="1-800-XXX-XXXX"
                />
              </div>

              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isEmergency}
                  onCheckedChange={(checked) => setFormData({ ...formData, isEmergency: checked })}
                />
                <Label>Emergency Resource</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
