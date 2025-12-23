import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Clock,
  Percent,
  Tag,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";

interface ServicePackage {
  id: number;
  freelancerId: string;
  name: string;
  description: string | null;
  discountPercent: number;
  discountAmountPence: number;
  isActive: boolean;
  imageUrl: string | null;
  validUntil: string | null;
  maxUses: number | null;
  currentUses: number;
  services: {
    serviceId: number;
    title: string;
    durationMinutes: number;
    pricePence: number;
    sortOrder: number;
  }[];
  originalPricePence: number;
  discountedPricePence: number;
  totalDurationMinutes: number;
  createdAt: string;
}

interface Service {
  id: number;
  title: string;
  durationMinutes: number;
  studioPricePence: number | null;
  isActive: boolean;
}

export default function FreelancerPackages() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const [packagesRes, servicesRes] = await Promise.all([
        backend.packages.listPackages({ freelancerId: user.id, activeOnly: false }),
        backend.services.list({ freelancerId: user.id }),
      ]);

      setPackages(packagesRes.packages);
      setServices(servicesRes.services.filter((s: any) => s.isActive) as any);
    } catch (error: any) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (packageId: number) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      await backend.packages.deletePackage({ id: packageId });
      setPackages(packages.filter((p) => p.id !== packageId));
      toast({ title: "Package deleted" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete package",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (pence: number) => `£${(pence / 100).toFixed(2)}`;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-[#E91E63]" />
          <h1 className="text-2xl font-bold">Service Packages</h1>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-[#E91E63] to-[#F4B942]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Package
        </Button>
      </div>

      <p className="text-muted-foreground">
        Create bundled service packages to offer clients a discount when booking multiple services together.
      </p>

      {packages.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No packages yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first service package to attract more clients
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Package
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{pkg.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {pkg.isActive ? (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {pkg.discountPercent > 0 && (
                        <Badge className="bg-[#E91E63] text-white">
                          {pkg.discountPercent}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingPackage(pkg)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(pkg.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {pkg.description && (
                  <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                )}
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium">Included Services:</p>
                  {pkg.services.map((service) => (
                    <div key={service.serviceId} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{service.title}</span>
                      <span className="text-muted-foreground">({formatDuration(service.durationMinutes)})</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(pkg.totalDurationMinutes)}
                    </span>
                    {pkg.currentUses > 0 && (
                      <span>{pkg.currentUses} uses</span>
                    )}
                  </div>
                  <div className="text-right">
                    {pkg.discountPercent > 0 || pkg.discountAmountPence > 0 ? (
                      <>
                        <span className="text-sm line-through text-muted-foreground mr-2">
                          {formatPrice(pkg.originalPricePence)}
                        </span>
                        <span className="text-lg font-bold text-[#E91E63]">
                          {formatPrice(pkg.discountedPricePence)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold">
                        {formatPrice(pkg.originalPricePence)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <PackageModal
        open={showCreateModal || !!editingPackage}
        onClose={() => {
          setShowCreateModal(false);
          setEditingPackage(null);
        }}
        onSave={loadData}
        package={editingPackage}
        availableServices={services}
      />
    </div>
  );
}

interface PackageModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  package: ServicePackage | null;
  availableServices: Service[];
}

function PackageModal({ open, onClose, onSave, package: pkg, availableServices }: PackageModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (pkg) {
      setName(pkg.name);
      setDescription(pkg.description || "");
      setSelectedServiceIds(pkg.services.map((s) => s.serviceId));
      setDiscountPercent(pkg.discountPercent);
    } else {
      setName("");
      setDescription("");
      setSelectedServiceIds([]);
      setDiscountPercent(10);
    }
  }, [pkg, open]);

  const toggleService = (serviceId: number) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  const calculateTotals = () => {
    const selected = availableServices.filter((s) => selectedServiceIds.includes(s.id));
    const originalPrice = selected.reduce((sum, s) => sum + (s.studioPricePence || 0), 0);
    const totalDuration = selected.reduce((sum, s) => sum + s.durationMinutes, 0);
    const discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));
    return { originalPrice, discountedPrice, totalDuration };
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a package name",
        variant: "destructive",
      });
      return;
    }

    if (selectedServiceIds.length < 2) {
      toast({
        title: "Error",
        description: "Please select at least 2 services",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (pkg) {
        await backend.packages.updatePackage({
          id: pkg.id,
          name,
          description,
          serviceIds: selectedServiceIds,
          discountPercent,
        });
        toast({ title: "Package updated" });
      } else {
        await backend.packages.createPackage({
          name,
          description,
          serviceIds: selectedServiceIds,
          discountPercent,
        });
        toast({ title: "Package created" });
      }
      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save package",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const { originalPrice, discountedPrice, totalDuration } = calculateTotals();

  const formatPrice = (pence: number) => `£${(pence / 100).toFixed(2)}`;
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pkg ? "Edit Package" : "Create Package"}</DialogTitle>
          <DialogDescription>
            Bundle multiple services together and offer a discount
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Package Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bridal Package, Full Makeover Deal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what's included in this package..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Services *</label>
            <p className="text-sm text-muted-foreground mb-3">
              Choose at least 2 services to include in this package
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
              {availableServices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active services available. Create some services first.
                </p>
              ) : (
                availableServices.map((service) => (
                  <label
                    key={service.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedServiceIds.includes(service.id)
                        ? "bg-pink-50 border-[#E91E63]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="h-4 w-4 accent-[#E91E63]"
                      />
                      <div>
                        <p className="font-medium">{service.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDuration(service.durationMinutes)}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium">
                      {formatPrice(service.studioPricePence || 0)}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Discount Percentage
              </div>
            </label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={0}
                max={50}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                (Max 50%)
              </span>
            </div>
          </div>

          {selectedServiceIds.length >= 2 && (
            <Card className="p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Package Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Services included</span>
                  <span>{selectedServiceIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total duration</span>
                  <span>{formatDuration(totalDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Original price</span>
                  <span className="line-through text-muted-foreground">
                    {formatPrice(originalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discount ({discountPercent}%)</span>
                  <span className="text-green-600">
                    -{formatPrice(originalPrice - discountedPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Package price</span>
                  <span className="text-[#E91E63]">{formatPrice(discountedPrice)}</span>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || selectedServiceIds.length < 2}
              className="bg-gradient-to-r from-[#E91E63] to-[#F4B942]"
            >
              {saving ? "Saving..." : pkg ? "Update Package" : "Create Package"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

