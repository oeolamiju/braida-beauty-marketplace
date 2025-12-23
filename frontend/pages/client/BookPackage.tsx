import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Clock,
  CheckCircle,
  Calendar,
  MapPin,
  ArrowLeft,
  Star,
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
}

interface Freelancer {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  averageRating: number;
  totalReviews: number;
  city: string | null;
  postcode: string | null;
}

export default function BookPackage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pkg, setPkg] = useState<ServicePackage | null>(null);
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackage();
  }, [packageId]);

  const loadPackage = async () => {
    if (!packageId) return;

    try {
      setLoading(true);
      const response = await backend.packages.getPackage({ id: parseInt(packageId) });
      setPkg(response.package);

      // Load freelancer details
      const freelancerRes = await backend.profiles.getProfile({ userId: response.package.freelancerId });
      setFreelancer(freelancerRes as any);
    } catch (error: any) {
      console.error("Failed to load package:", error);
      toast({
        title: "Error",
        description: "Failed to load package details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const handleBookPackage = () => {
    if (!pkg) return;
    // Navigate to booking with package context
    navigate(`/freelancers/${pkg.freelancerId}?package=${pkg.id}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Package not found</h2>
        <p className="text-muted-foreground mb-4">
          This package may no longer be available
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="overflow-hidden">
        {pkg.imageUrl && (
          <div className="aspect-video bg-gray-100">
            <img
              src={pkg.imageUrl}
              alt={pkg.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-[#E91E63]" />
                <Badge className="bg-[#E91E63] text-white">
                  {pkg.discountPercent}% OFF
                </Badge>
              </div>
              <h1 className="text-2xl font-bold">{pkg.name}</h1>
            </div>
            <div className="text-right">
              <span className="text-lg line-through text-muted-foreground">
                {formatPrice(pkg.originalPricePence)}
              </span>
              <p className="text-3xl font-bold text-[#E91E63]">
                {formatPrice(pkg.discountedPricePence)}
              </p>
            </div>
          </div>

          {pkg.description && (
            <p className="text-muted-foreground mb-6">{pkg.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(pkg.totalDurationMinutes)} total
            </span>
            <span>{pkg.services.length} services included</span>
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="font-semibold">Services Included:</h3>
            {pkg.services.map((service) => (
              <div
                key={service.serviceId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{service.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(service.durationMinutes)}
                    </p>
                  </div>
                </div>
                <span className="text-muted-foreground line-through">
                  {formatPrice(service.pricePence)}
                </span>
              </div>
            ))}
          </div>

          {freelancer && (
            <Card className="p-4 mb-6 bg-gray-50 border-none">
              <div className="flex items-center gap-4">
                {freelancer.profilePhoto ? (
                  <img
                    src={freelancer.profilePhoto}
                    alt={`${freelancer.firstName} ${freelancer.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E91E63] to-[#F4B942] flex items-center justify-center text-white text-xl font-bold">
                    {freelancer.firstName?.[0]}{freelancer.lastName?.[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {freelancer.firstName} {freelancer.lastName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {freelancer.averageRating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-[#F4B942] text-[#F4B942]" />
                        {freelancer.averageRating.toFixed(1)} ({freelancer.totalReviews} reviews)
                      </span>
                    )}
                    {freelancer.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {freelancer.city}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/freelancers/${freelancer.id}`)}
                >
                  View Profile
                </Button>
              </div>
            </Card>
          )}

          <div className="flex gap-4">
            <Button
              size="lg"
              className="flex-1 bg-gradient-to-r from-[#E91E63] to-[#F4B942]"
              onClick={handleBookPackage}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book This Package
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            You save {formatPrice(pkg.originalPricePence - pkg.discountedPricePence)} with this package!
          </p>
        </div>
      </Card>
    </div>
  );
}

