import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, Briefcase, Edit, Clock, Filter, Search, 
  X, Trash2, ChevronRight, CheckCircle2
} from "lucide-react";
import backend from "@/lib/backend";
import { useApiError } from "@/hooks/useApiError";
import { useToast } from "@/components/ui/use-toast";

interface Service {
  id: number;
  title: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  basePricePence: number;
  durationMinutes: number;
  isActive: boolean;
  isDraft?: boolean;
  styles: { id: number; name: string }[];
}

export default function FreelancerServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [filterText, setFilterText] = useState("");
  const { showError } = useApiError();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) {
        return;
      }
      const response = await backend.services.list({ 
        freelancerId: user.id,
        includeInactive: true
      });
      setServices(response.services);
      // Auto-select first service
      if (response.services.length > 0 && !selectedService) {
        setSelectedService(response.services[0]);
      }
    } catch (error) {
      console.error("Failed to load services:", error);
      showError(error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(serviceId: number, currentlyActive: boolean) {
    try {
      if (currentlyActive) {
        await backend.services.deactivate({ id: serviceId });
        toast({ description: "Service deactivated successfully" });
      } else {
        await backend.services.activate({ id: serviceId });
        toast({ description: "Service activated successfully" });
      }
      loadServices();
    } catch (error) {
      console.error("Failed to toggle service status:", error);
      showError(error);
    }
  }

  function formatPrice(pence: number): string {
    return `£${(pence / 100).toFixed(2)}`;
  }

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(filterText.toLowerCase()) ||
    s.category.toLowerCase().includes(filterText.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6 bg-[#2a2a2a]" />
          <div className="grid grid-cols-[350px_1fr] gap-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full bg-[#2a2a2a]" />
              ))}
            </div>
            <Skeleton className="h-96 w-full bg-[#2a2a2a]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold italic mb-1">Manage Services</h1>
            <p className="text-gray-400">Create and manage your service portfolio.</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-[#3a3a3a] bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
            >
              Discard Changes
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              Save Service
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
          {/* Left Panel - Service List */}
          <div className="space-y-4">
            <Button 
              onClick={() => navigate("/freelancer/services/new")}
              className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border border-[#3a3a3a] justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Service
            </Button>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Filter services..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-9 bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-500"
              />
            </div>

            {filteredServices.length === 0 ? (
              <Card className="p-8 text-center bg-[#2a2a2a] border-[#3a3a3a]">
                <Briefcase className="h-10 w-10 text-gray-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">No services yet</h3>
                <p className="text-sm text-gray-400">
                  Create your first service to start receiving bookings.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredServices.map((service) => (
                  <Card 
                    key={service.id} 
                    className={`p-4 cursor-pointer transition-all ${
                      selectedService?.id === service.id 
                        ? "bg-[#3a3a3a] border-orange-500" 
                        : "bg-[#2a2a2a] border-[#3a3a3a] hover:border-[#4a4a4a]"
                    }`}
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{service.title}</h3>
                      <Badge 
                        className={service.isActive 
                          ? "bg-green-500/20 text-green-400 border-green-500/30" 
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }
                      >
                        {service.isActive ? "Live" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                      {service.description || `${service.category} service`}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-500 font-semibold">{formatPrice(service.basePricePence)}</span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(service.durationMinutes)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Edit Form */}
          {selectedService ? (
            <Card className="p-6 bg-[#2a2a2a] border-[#3a3a3a]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Edit Service</h2>
                  <p className="text-sm text-gray-400">
                    Update the details for "{selectedService.title}"
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">Listing Active</span>
                  <Switch 
                    checked={selectedService.isActive}
                    onCheckedChange={() => toggleActive(selectedService.id, selectedService.isActive)}
                  />
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-orange-600/20 flex items-center justify-center">
                    <span className="text-orange-500 text-sm font-bold">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-orange-500">Basic Information</h3>
                </div>

                <div className="space-y-4 pl-10">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Service Title
                    </label>
                    <Input 
                      value={selectedService.title}
                      className="bg-[#1a1a1a] border-[#3a3a3a] text-white"
                      readOnly
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <div className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-white capitalize">
                        {selectedService.category}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Subcategory
                      </label>
                      <div className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-white">
                        {selectedService.subcategory || "Not set"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea 
                      value={selectedService.description || ""}
                      className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-white resize-none min-h-[100px]"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {(selectedService.description || "").length}/500 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing & Duration Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-orange-600/20 flex items-center justify-center">
                    <span className="text-orange-500 text-sm font-bold">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-orange-500">Pricing & Duration</h3>
                </div>

                <div className="grid grid-cols-3 gap-4 pl-10">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Base Price (£)
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 rounded-l-lg bg-[#3a3a3a] border border-[#4a4a4a] text-gray-400">
                        £
                      </span>
                      <Input 
                        value={(selectedService.basePricePence / 100).toFixed(2)}
                        className="bg-[#1a1a1a] border-[#3a3a3a] text-white rounded-l-none"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estimated Duration
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input 
                          value={Math.floor(selectedService.durationMinutes / 60)}
                          className="bg-[#1a1a1a] border-[#3a3a3a] text-white text-center"
                          readOnly
                        />
                        <span className="text-xs text-gray-500 mt-1 block text-center">HRS</span>
                      </div>
                      <div className="flex-1">
                        <Input 
                          value={selectedService.durationMinutes % 60}
                          className="bg-[#1a1a1a] border-[#3a3a3a] text-white text-center"
                          readOnly
                        />
                        <span className="text-xs text-gray-500 mt-1 block text-center">MINS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Styles Section */}
              {selectedService.styles.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-orange-600/20 flex items-center justify-center">
                      <span className="text-orange-500 text-sm font-bold">3</span>
                    </div>
                    <h3 className="text-lg font-semibold text-orange-500">Styles & Tags</h3>
                  </div>

                  <div className="flex flex-wrap gap-2 pl-10">
                    {selectedService.styles.map((style) => (
                      <Badge 
                        key={style.id} 
                        className="bg-[#3a3a3a] text-white border-[#4a4a4a]"
                      >
                        {style.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#3a3a3a]">
                <Button 
                  variant="outline" 
                  className="border-[#3a3a3a] text-white hover:bg-[#3a3a3a]"
                  onClick={() => navigate(`/freelancer/services/${selectedService.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Service
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center bg-[#2a2a2a] border-[#3a3a3a]">
              <Briefcase className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a service</h3>
              <p className="text-gray-400 mb-4">
                Choose a service from the list to view and edit its details.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
