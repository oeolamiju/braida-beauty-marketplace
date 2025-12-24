import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ShieldCheck, Clock, CalendarCheck, MessageCircle, Award, Heart, Home, Car } from "lucide-react";
import { useState, useEffect } from "react";
import backend from "@/lib/backend";

interface SearchResultCardProps {
  result: {
    id: number;
    freelancerId: string;
    freelancerName: string;
    freelancerPhoto: string | null;
    freelancerVerified: boolean;
    title: string;
    category: string;
    subcategory: string | null;
    description: string | null;
    pricePence: number;
    durationMinutes: number;
    averageRating: number;
    reviewCount: number;
    distanceMiles: number | null;
    freelancerArea: string;
    freelancerCategories: string[];
    locationTypes?: string[];
    availabilityMatch?: {
      matched: boolean;
      matchedPatterns: string[];
    };
    avgResponseTimeHours: number | null;
    completionRate: number | null;
    isNew?: boolean;
  };
  onClick: () => void;
  variant?: "light" | "dark";
  compact?: boolean;
}

// Calculate price level (£, ££, £££) based on price
const getPriceLevel = (pricePence: number): { level: string; label: string } => {
  if (pricePence <= 5000) return { level: "£", label: "Affordable" };
  if (pricePence <= 10000) return { level: "££", label: "Moderate" };
  return { level: "£££", label: "Premium" };
};

export default function SearchResultCard({ result, onClick, variant = "light", compact = false }: SearchResultCardProps) {
  const {
    id,
    freelancerId,
    freelancerName,
    freelancerPhoto,
    freelancerVerified,
    title,
    category,
    subcategory,
    description,
    pricePence,
    durationMinutes,
    averageRating,
    reviewCount,
    distanceMiles,
    freelancerArea,
    freelancerCategories,
    locationTypes,
    availabilityMatch,
    avgResponseTimeHours,
    completionRate,
    isNew,
  } = result;

  const [serviceImage, setServiceImage] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  const isDark = variant === "dark";
  const priceLevel = getPriceLevel(pricePence);
  
  // Determine if mobile or salon service
  const isMobile = locationTypes?.includes("stylist_travels_to_client");
  const isSalon = locationTypes?.includes("client_travels_to_stylist");

  useEffect(() => {
    loadServiceImage();
  }, [id]);

  async function loadServiceImage() {
    try {
      const imagesData = await backend.services.listImages({ serviceId: id });
      if (imagesData.images.length > 0) {
        setServiceImage(imagesData.images[0].imageUrl);
      }
    } catch (error) {
      console.error("Failed to load service image:", error);
    }
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    // TODO: Call API to toggle favorite
  };

  // Compact card variant for grid view (like in mockup image 2)
  if (compact) {
    return (
      <Card 
        className={`overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
          isDark 
            ? "bg-[#2a2a2a] border-[#3a3a3a] hover:border-orange-500/50" 
            : "bg-white border-gray-200 hover:border-orange-300"
        }`}
        onClick={onClick}
      >
        {/* Image with badges */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
          {serviceImage ? (
            <img 
              src={serviceImage} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          ) : freelancerPhoto ? (
            <img 
              src={freelancerPhoto} 
              alt={freelancerName} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Star className="h-12 w-12 text-orange-300" />
            </div>
          )}
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isMobile && (
              <Badge className="bg-[#2a2a2a]/90 text-white border-0 text-xs font-medium">
                <Car className="h-3 w-3 mr-1" />
                MOBILE
              </Badge>
            )}
            {isSalon && !isMobile && (
              <Badge className="bg-[#2a2a2a]/90 text-white border-0 text-xs font-medium">
                <Home className="h-3 w-3 mr-1" />
                SALON
              </Badge>
            )}
            {isNew && (
              <Badge className="bg-green-500 text-white border-0 text-xs font-medium">
                NEW
              </Badge>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
          >
            <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>

          {/* Fully booked overlay */}
          {!availabilityMatch?.matched && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium">Fully Booked</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Freelancer info */}
          <div className="flex items-center gap-2 mb-2">
            <div className="relative">
              {freelancerPhoto ? (
                <img 
                  src={freelancerPhoto} 
                  alt={freelancerName} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDark ? "bg-[#3a3a3a] text-gray-300" : "bg-gray-200 text-gray-600"
                }`}>
                  {freelancerName.charAt(0)}
                </div>
              )}
              {freelancerVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                {freelancerName}
              </p>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  {averageRating > 0 ? averageRating.toFixed(1) : "New"}
                </span>
                {reviewCount > 0 && (
                  <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    ({reviewCount} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[subcategory, ...freelancerCategories.slice(0, 2)].filter(Boolean).slice(0, 3).map((tag, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className={`text-xs ${
                  isDark 
                    ? "border-[#3a3a3a] text-gray-300" 
                    : "border-gray-300 text-gray-600"
                }`}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Location & Price */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              <MapPin className="h-3.5 w-3.5" />
              <span>{distanceMiles !== null ? `${distanceMiles.toFixed(1)} miles` : freelancerArea}</span>
            </div>
            <div className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              <span className="text-orange-500">{priceLevel.level}</span>
              <span className="ml-1">{priceLevel.label}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Original full card layout
  return (
    <Card className={`overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border hover:-translate-y-1 group ${
      isDark 
        ? "bg-[#2a2a2a] border-[#3a3a3a] hover:border-orange-500/50" 
        : "bg-white border-gray-200 hover:border-orange-300"
    }`} onClick={onClick}>
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-72 h-56 sm:h-64 md:h-auto bg-gradient-to-br from-orange-100 to-amber-100 flex-shrink-0 overflow-hidden">
          {serviceImage ? (
            <img src={serviceImage} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : freelancerPhoto ? (
            <img src={freelancerPhoto} alt={freelancerName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Star className="h-16 w-16 text-orange-300" />
            </div>
          )}
          
          {/* Service type badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isMobile && (
              <Badge className="bg-[#2a2a2a]/90 text-white border-0 text-xs font-medium">
                <Car className="h-3 w-3 mr-1" />
                MOBILE
              </Badge>
            )}
            {isSalon && !isMobile && (
              <Badge className="bg-[#2a2a2a]/90 text-white border-0 text-xs font-medium">
                <Home className="h-3 w-3 mr-1" />
                SALON
              </Badge>
            )}
          </div>

          {/* Verified/New badge */}
          {(freelancerVerified || isNew) && (
            <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col gap-2">
              {isNew && (
                <Badge className="bg-green-500 text-white border-0 text-xs font-bold">
                  NEW
                </Badge>
              )}
              {freelancerVerified && (
                <div className="bg-green-500 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 shadow-lg">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="hidden sm:inline">Verified</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 md:p-6 flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {freelancerVerified && (
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-muted-foreground"}`}>
                    {freelancerName}
                  </span>
                </div>
              </div>
              
              <h3 className={`font-bold text-lg md:text-2xl mb-2 md:mb-3 group-hover:text-orange-600 transition-colors ${
                isDark ? "text-white" : ""
              }`}>
                {title}
              </h3>

              {description && (
                <p className={`text-sm md:text-base line-clamp-2 mb-3 md:mb-4 leading-relaxed ${
                  isDark ? "text-gray-400" : "text-muted-foreground"
                }`}>
                  {description}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-0">{category}</Badge>
                {subcategory && <Badge variant="outline" className="border-orange-200">{subcategory}</Badge>}
                {freelancerCategories.slice(0, 2).map((cat) => (
                  <Badge key={cat} variant="outline" className={`text-xs ${isDark ? "border-[#3a3a3a] text-gray-400" : "border-gray-300"}`}>
                    {cat}
                  </Badge>
                ))}
              </div>

              {availabilityMatch && availabilityMatch.matched && availabilityMatch.matchedPatterns.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-700 font-semibold mb-2">
                    <CalendarCheck className="h-4 w-4" />
                    <span>Available for your schedule</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {availabilityMatch.matchedPatterns.map((pattern, idx) => (
                      <Badge key={idx} className="text-xs bg-green-100 text-green-700 border-green-300 hover:bg-green-200">
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`flex items-center gap-3 md:gap-6 mb-3 md:mb-4 pb-3 md:pb-4 border-b flex-wrap ${
            isDark ? "border-[#3a3a3a]" : ""
          }`}>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span className={`font-bold text-lg ${isDark ? "text-white" : ""}`}>
                {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
              </span>
              {reviewCount > 0 && (
                <span className={`text-sm ${isDark ? "text-gray-400" : "text-muted-foreground"}`}>
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              )}
            </div>

            <div className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-muted-foreground"}`}>
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">
                {freelancerArea}
                {distanceMiles !== null && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    isDark ? "bg-[#3a3a3a]" : "bg-gray-100"
                  }`}>
                    {distanceMiles.toFixed(1)} mi away
                  </span>
                )}
              </span>
            </div>

            <div className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-muted-foreground"}`}>
              <Clock className="h-4 w-4" />
              <span className="text-sm">{durationMinutes} mins</span>
            </div>

            {avgResponseTimeHours !== null && (
              <div className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-muted-foreground"}`} title="Average response time">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {avgResponseTimeHours < 1 
                    ? '<1 hr' 
                    : avgResponseTimeHours < 24 
                      ? `${Math.round(avgResponseTimeHours)} hrs`
                      : `${Math.round(avgResponseTimeHours / 24)} days`}
                </span>
              </div>
            )}

            {completionRate !== null && completionRate > 0 && (
              <div className="flex items-center gap-2 text-green-600" title="Completion rate">
                <Award className="h-4 w-4" />
                <span className="text-sm font-bold">{completionRate.toFixed(0)}%</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-orange-600">
                £{(pricePence / 100).toFixed(0)}
                <span className={`text-sm md:text-base font-normal ml-1 ${isDark ? "text-gray-400" : "text-muted-foreground"}`}>
                  {pricePence % 100 !== 0 && `.${String(pricePence % 100).padStart(2, '0')}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isDark ? "text-gray-500" : "text-muted-foreground"}`}>Starting price</span>
                <span className="text-xs text-orange-500 font-medium">{priceLevel.level} {priceLevel.label}</span>
              </div>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 px-6 md:px-8 w-full sm:w-auto">
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
