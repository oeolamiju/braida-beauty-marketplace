import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Briefcase, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import backend from "@/lib/backend";
import { useApiError } from "@/hooks/useApiError";
import { useToast } from "@/components/ui/use-toast";

interface Service {
  id: number;
  title: string;
  category: string;
  subcategory: string | null;
  basePricePence: number;
  durationMinutes: number;
  isActive: boolean;
  styles: { id: number; name: string }[];
}

export default function FreelancerServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Services</h1>
          <p className="text-muted-foreground">Manage your service listings</p>
        </div>
        <Button onClick={() => navigate("/freelancer/services/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No services yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first service listing to start receiving bookings.
          </p>
          <Button onClick={() => navigate("/freelancer/services/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <Card key={service.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{service.title}</h3>
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                    <span className="capitalize">{service.category}</span>
                    {service.subcategory && (
                      <>
                        <span>•</span>
                        <span>{service.subcategory}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{formatPrice(service.basePricePence)}</span>
                    <span>•</span>
                    <span>{service.durationMinutes} mins</span>
                  </div>
                  {service.styles.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {service.styles.map((style) => (
                        <Badge key={style.id} variant="outline" className="text-xs">
                          {style.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/freelancer/services/${service.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant={service.isActive ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleActive(service.id, service.isActive)}
                  >
                    {service.isActive ? (
                      <>
                        <ToggleRight className="h-4 w-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
