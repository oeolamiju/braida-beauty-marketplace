import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPin, ChevronDown, Check } from "lucide-react";
import backend from "@/lib/backend";

interface City {
  name: string;
  displayName: string;
  freelancerCount: number;
}

interface CitySelectorProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  showCount?: boolean;
  size?: "sm" | "default";
}

export function CitySelector({
  selectedCity,
  onCityChange,
  showCount = true,
  size = "default",
}: CitySelectorProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const response = await backend.analytics.getSupportedCities();
      setCities(response.cities);
    } catch (error) {
      console.error("Failed to load cities:", error);
      // Fallback cities
      setCities([
        { name: "london", displayName: "London", freelancerCount: 0 },
        { name: "birmingham", displayName: "Birmingham", freelancerCount: 0 },
        { name: "manchester", displayName: "Manchester", freelancerCount: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectedCityData = cities.find((c) => c.name === selectedCity);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className="gap-2"
          disabled={loading}
        >
          <MapPin className="h-4 w-4" />
          <span>{selectedCityData?.displayName || "All Cities"}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem
          onClick={() => onCityChange("")}
          className="flex items-center justify-between"
        >
          <span>All Cities</span>
          {selectedCity === "" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        {cities.map((city) => (
          <DropdownMenuItem
            key={city.name}
            onClick={() => onCityChange(city.name)}
            className="flex items-center justify-between"
          >
            <span>{city.displayName}</span>
            <div className="flex items-center gap-2">
              {showCount && city.freelancerCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {city.freelancerCount} stylists
                </span>
              )}
              {selectedCity === city.name && <Check className="h-4 w-4" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook for managing city selection with localStorage
export function useCitySelection() {
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem("selectedCity") || "";
  });

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (city) {
      localStorage.setItem("selectedCity", city);
    } else {
      localStorage.removeItem("selectedCity");
    }
  };

  return { selectedCity, setSelectedCity: handleCityChange };
}

