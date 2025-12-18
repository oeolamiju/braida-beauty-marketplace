import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Palette, ArrowLeft, MapPin, Star } from "lucide-react";
import backend from "@/lib/backend";
import { useToast } from "@/components/ui/use-toast";
import TopNav from "@/components/navigation/TopNav";

interface Service {
  id: number;
  title: string;
  description: string | null;
  priceAmount: number;
  durationMinutes: number;
  freelancerUserId: number;
  freelancerName?: string;
  location?: string;
  rating?: number;
}

export default function PublicStyleDetail() {
  const { styleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [styleName, setStyleName] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (styleId) {
      loadStyleServices();
    }
  }, [styleId]);

  const loadStyleServices = async () => {
    try {
      setLoading(true);
      const response = await backend.styles.searchByStyle({
        styleId: parseInt(styleId!),
        limit: 50,
      });
      
      setStyleName(response.style.name);
      setServices(response.results.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        priceAmount: r.pricePence / 100,
        durationMinutes: r.durationMinutes,
        freelancerUserId: parseInt(r.freelancerId),
        freelancerName: r.freelancerName,
        location: r.freelancerArea,
        rating: r.averageRating,
      })));
    } catch (error: any) {
      console.error("Failed to load style services:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-8 max-w-6xl pt-24">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto px-4 py-8 max-w-6xl pt-24">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold">{styleName}</h1>
          </div>
          <p className="text-muted-foreground">
            {services.length} {services.length === 1 ? 'service' : 'services'} available
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-16">
            <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Services Found</h3>
            <p className="text-muted-foreground mb-6">
              There are no services available for this style yet
            </p>
            <Button onClick={() => navigate("/discover")}>
              Browse All Services
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                onClick={() => navigate(`/services/${service.id}`)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  {service.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    {service.freelancerName && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Provider:</span>
                        <span className="font-medium">{service.freelancerName}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">
                        £{service.priceAmount}
                      </span>
                      <span className="text-muted-foreground">
                        {service.durationMinutes} min
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
