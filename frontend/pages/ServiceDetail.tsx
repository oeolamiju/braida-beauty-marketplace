import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, MapPin, Package, User, ChevronLeft, ChevronRight } from "lucide-react";
import backend from "@/lib/backend";
import { useApiError } from "@/hooks/useApiError";
import BookingForm from "@/components/BookingForm";
import TopNav from "@/components/navigation/TopNav";

interface ServiceDetail {
  id: number;
  freelancerId: string;
  freelancerName: string;
  title: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  basePricePence: number;
  durationMinutes: number;
  materialsPolicy: string;
  materialsFee: number;
  materialsDescription: string | null;
  locationTypes: string[];
  travelFeePence: number;
  isActive: boolean;
  styles: { id: number; name: string }[];
}

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [images, setImages] = useState<Array<{ id: number; imageUrl: string; displayOrder: number }>>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showError } = useApiError();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    loadService();
  }, [id]);

  async function loadService() {
    try {
      const data = await backend.services.get({ id: parseInt(id!) });
      setService(data as any);
      
      const imagesData = await backend.services.listImages({ serviceId: parseInt(id!) });
      setImages(imagesData.images);
    } catch (error) {
      console.error("Failed to load service:", error);
      showError(error);
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(pence: number): string {
    return `£${(pence / 100).toFixed(2)}`;
  }

  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  function formatMaterialsPolicy(policy: string): string {
    const policies: Record<string, string> = {
      client_provides: "Client Provides Materials",
      freelancer_provides: "Freelancer Provides Materials",
      both: "Materials Can Be Provided by Either Party",
    };
    return policies[policy] || policy;
  }

  function formatLocationType(type: string): string {
    const types: Record<string, string> = {
      client_travels_to_freelancer: "Client Travels to Freelancer",
      freelancer_travels_to_client: "Freelancer Travels to Client",
    };
    return types[type] || type;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl pt-20 md:pt-24">
          <Skeleton className="h-10 w-48 mb-6" />
          <Card className="p-8">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-6" />
            <Skeleton className="h-24 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-8 max-w-3xl pt-24">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Service not found</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <TopNav />
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl pt-20 md:pt-24">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 md:mb-6 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card className="p-4 md:p-8">
        {images.length > 0 && (
          <div className="mb-4 md:mb-6 relative">
            <img
              src={images[currentImageIndex].imageUrl}
              alt={service.title}
              className="w-full h-56 sm:h-72 md:h-96 object-cover rounded-lg"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? "bg-white w-8" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{service.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <User className="h-4 w-4" />
                <span>{service.freelancerName}</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                {formatPrice(service.basePricePence)}
              </div>
              <div className="text-sm text-muted-foreground">base price</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="capitalize">
              {service.category}
            </Badge>
            {service.subcategory && (
              <Badge variant="outline">{service.subcategory}</Badge>
            )}
            {service.styles.map((style) => (
              <Badge key={style.id} variant="secondary">
                {style.name}
              </Badge>
            ))}
          </div>
        </div>

        {service.description && (
          <div className="mb-4 md:mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{service.description}</p>
          </div>
        )}

        <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium">Duration</div>
              <div className="text-sm text-muted-foreground">
                {formatDuration(service.durationMinutes)}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <div className="font-medium">Materials</div>
              <div className="text-sm text-muted-foreground">
                {formatMaterialsPolicy(service.materialsPolicy)}
              </div>
              {service.materialsFee > 0 && (
                <div className="text-sm text-muted-foreground">
                  Materials fee: {formatPrice(service.materialsFee)}
                </div>
              )}
              {service.materialsDescription && (
                <div className="text-sm text-muted-foreground mt-1">
                  {service.materialsDescription}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <div className="font-medium">Location Options</div>
              {service.locationTypes.map((type) => (
                <div key={type} className="text-sm text-muted-foreground">
                  {formatLocationType(type)}
                </div>
              ))}
              {service.travelFeePence > 0 && (
                <div className="text-sm text-muted-foreground">
                  Travel fee: {formatPrice(service.travelFeePence)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 md:pt-6 border-t">
          <Button size="lg" className="w-full text-sm md:text-base" onClick={() => navigate(`/freelancers/${service.freelancerId}`)}>
            View Freelancer Profile
          </Button>
        </div>
      </Card>

      {isAuthenticated ? (
        <div className="mt-8">
          <BookingForm
            serviceId={service.id}
            basePricePence={service.basePricePence}
            materialsFee={service.materialsFee}
            materialsPolicy={service.materialsPolicy}
            travelFeePence={service.travelFeePence}
            locationTypes={service.locationTypes}
            durationMinutes={service.durationMinutes}
          />
        </div>
      ) : (
        <Card className="mt-8 p-8 text-center bg-gradient-to-br from-orange-50/50 to-amber-50/50 border-2 border-orange-200">
          <h3 className="text-2xl font-bold mb-3">Ready to Book?</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Sign in or create an account to book this service and access exclusive features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth/login')}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
            >
              Sign In
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/auth/register')}
              className="border-2"
            >
              Create Account
            </Button>
          </div>
        </Card>
      )}
      </div>
    </div>
  );
}
