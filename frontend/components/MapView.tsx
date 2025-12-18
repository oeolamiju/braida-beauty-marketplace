import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, X, Navigation, Loader2 } from "lucide-react";

interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  title: string;
  freelancerName: string;
  freelancerPhoto: string | null;
  pricePence: number;
  averageRating: number;
  reviewCount: number;
  distanceMiles: number | null;
  category: string;
}

interface MapViewProps {
  markers: MapMarker[];
  centerLat?: number;
  centerLng?: number;
  radiusMiles?: number;
  onMarkerClick?: (id: number) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

// UK bounds for map
const UK_BOUNDS = {
  north: 60.8,
  south: 49.9,
  east: 1.8,
  west: -8.2,
};

// Default center (London)
const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 };

export default function MapView({
  markers,
  centerLat,
  centerLng,
  radiusMiles = 10,
  onMarkerClick,
  onClose,
  isLoading = false,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const center = {
    lat: centerLat ?? DEFAULT_CENTER.lat,
    lng: centerLng ?? DEFAULT_CENTER.lng,
  };

  // Calculate bounds to fit all markers
  const getBounds = () => {
    if (markers.length === 0) {
      return {
        minLat: center.lat - 0.5,
        maxLat: center.lat + 0.5,
        minLng: center.lng - 0.5,
        maxLng: center.lng + 0.5,
      };
    }

    let minLat = markers[0].lat;
    let maxLat = markers[0].lat;
    let minLng = markers[0].lng;
    let maxLng = markers[0].lng;

    markers.forEach((m) => {
      minLat = Math.min(minLat, m.lat);
      maxLat = Math.max(maxLat, m.lat);
      minLng = Math.min(minLng, m.lng);
      maxLng = Math.max(maxLng, m.lng);
    });

    // Add some padding
    const latPadding = (maxLat - minLat) * 0.2 || 0.1;
    const lngPadding = (maxLng - minLng) * 0.2 || 0.1;

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
    };
  };

  const bounds = getBounds();

  // Convert lat/lng to pixel position
  const getMarkerPosition = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    if (onMarkerClick) {
      onMarkerClick(marker.id);
    }
  };

  const formatPrice = (pence: number) => {
    return `£${(pence / 100).toFixed(0)}`;
  };

  return (
    <Card className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 border-2">
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-orange-600" />
          <span className="font-semibold text-sm">
            {markers.length} {markers.length === 1 ? 'stylist' : 'stylists'} found
            {radiusMiles && ` within ${radiusMiles} miles`}
          </span>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="relative w-full h-full pt-14">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Simplified map background with grid */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-green-100/50">
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Search center marker */}
            {centerLat && centerLng && (
              <div
                className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${getMarkerPosition(center.lat, center.lng).x}%`,
                  top: `${getMarkerPosition(center.lat, center.lng).y}%`,
                }}
              >
                <div className="relative">
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <Navigation className="h-3 w-3 text-white" />
                  </div>
                  {/* Radius indicator */}
                  <div 
                    className="absolute rounded-full border-2 border-blue-300 bg-blue-100/20"
                    style={{
                      width: `${radiusMiles * 10}px`,
                      height: `${radiusMiles * 10}px`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Markers */}
            {markers.map((marker) => {
              const pos = getMarkerPosition(marker.lat, marker.lng);
              const isSelected = selectedMarker?.id === marker.id;
              
              return (
                <button
                  key={marker.id}
                  className={`absolute z-10 transform -translate-x-1/2 -translate-y-full transition-all duration-200 ${
                    isSelected ? 'z-20 scale-110' : 'hover:scale-105 hover:z-15'
                  }`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                  }}
                  onClick={() => handleMarkerClick(marker)}
                >
                  <div className={`relative group ${isSelected ? 'drop-shadow-lg' : ''}`}>
                    {/* Price tag marker */}
                    <div className={`px-2 py-1 rounded-lg font-bold text-xs whitespace-nowrap ${
                      isSelected 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-white text-gray-800 border-2 border-gray-200 group-hover:border-orange-400'
                    }`}>
                      {formatPrice(marker.pricePence)}
                    </div>
                    {/* Pointer */}
                    <div className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] ${
                      isSelected 
                        ? 'border-l-transparent border-r-transparent border-t-orange-600' 
                        : 'border-l-transparent border-r-transparent border-t-white'
                    }`} />
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Selected marker popup */}
      {selectedMarker && (
        <div className="absolute bottom-4 left-4 right-4 z-30">
          <Card className="p-4 bg-white/95 backdrop-blur-sm shadow-xl border-2">
            <div className="flex items-start gap-3">
              {/* Freelancer photo */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {selectedMarker.freelancerPhoto ? (
                  <img
                    src={selectedMarker.freelancerPhoto}
                    alt={selectedMarker.freelancerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <MapPin className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{selectedMarker.title}</h3>
                <p className="text-xs text-muted-foreground mb-1">{selectedMarker.freelancerName}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {selectedMarker.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                    <span className="font-medium">{selectedMarker.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({selectedMarker.reviewCount})</span>
                  </div>
                  {selectedMarker.distanceMiles !== null && (
                    <span className="text-xs text-muted-foreground">
                      {selectedMarker.distanceMiles.toFixed(1)} mi away
                    </span>
                  )}
                </div>
              </div>

              {/* Price & CTA */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg text-orange-600">
                  {formatPrice(selectedMarker.pricePence)}
                </p>
                <Button
                  size="sm"
                  className="mt-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-xs"
                  onClick={() => onMarkerClick?.(selectedMarker.id)}
                >
                  View
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={() => setSelectedMarker(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Card>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        {!selectedMarker && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Your location</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-4 h-3 bg-white border border-gray-300 rounded text-[8px] flex items-center justify-center">£</div>
              <span>Stylists</span>
            </div>
          </div>
        )}
      </div>

      {/* Map attribution */}
      <div className="absolute bottom-1 right-1 text-[10px] text-gray-400 bg-white/80 px-1 rounded">
        Simplified map view
      </div>
    </Card>
  );
}

