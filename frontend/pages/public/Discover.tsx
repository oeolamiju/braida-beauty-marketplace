import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Sparkles, List, Map as MapIcon, ChevronDown, SlidersHorizontal } from "lucide-react";
import SearchFilters from "@/components/SearchFilters";
import SearchResultCard from "@/components/SearchResultCard";
import MapView from "@/components/MapView";
import { useFilters } from "@/hooks/useFilters";
import { useServiceSearch } from "@/hooks/useServiceSearch";
import TopNav from "@/components/navigation/TopNav";

export default function Discover() {
  const navigate = useNavigate();
  const { filters, setFilters, resetFilters, buildSearchParams } = useFilters();
  const searchParams = buildSearchParams();
  const { results, loading, total, page, hasMore, loadMore, searchLocation } = useServiceSearch(
    searchParams,
    [filters]
  );
  
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const mapMarkers = results
    .filter((r) => r.freelancerPostcode)
    .map((result) => ({
      id: result.id,
      lat: 51.5 + (Math.random() - 0.5) * 0.3,
      lng: -0.1 + (Math.random() - 0.5) * 0.5,
      title: result.title,
      freelancerName: result.freelancerName,
      freelancerPhoto: result.freelancerPhoto,
      pricePence: result.pricePence,
      averageRating: result.averageRating,
      reviewCount: result.reviewCount,
      distanceMiles: result.distanceMiles,
      category: result.category,
    }));

  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      
      <div className="bg-white border-b sticky top-16 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Find Your Perfect Stylist</h1>
            <p className="text-muted-foreground">Discover verified beauty professionals near you</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
              <Input
                placeholder="Search by location: postcode, city, or area (e.g., SW1A, Birmingham, Peckham)"
                className="pl-12 pr-12 h-14 text-lg border-2 focus:border-orange-600 rounded-xl shadow-sm"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="lg"
                onClick={() => setViewMode("list")}
                className={`gap-2 ${viewMode === "list" ? "bg-orange-600 hover:bg-orange-700" : "border-2"}`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="lg"
                onClick={() => setViewMode("map")}
                className={`gap-2 ${viewMode === "map" ? "bg-orange-600 hover:bg-orange-700" : "border-2"}`}
              >
                <MapIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Map</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden border-2"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-600" />
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              to="/styles/category/braids"
              className="group relative overflow-hidden rounded-xl border-2 border-border hover:border-orange-500 transition-all duration-300 hover:shadow-lg"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1688592969417-953dd3c2b9d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
                  alt="Braids"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="absolute bottom-2 left-2 text-white font-bold text-sm">Braids</h3>
              </div>
            </Link>
            <Link
              to="/styles/category/locs"
              className="group relative overflow-hidden rounded-xl border-2 border-border hover:border-orange-500 transition-all duration-300 hover:shadow-lg"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1625536658679-42d76fd167c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
                  alt="Locs"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="absolute bottom-2 left-2 text-white font-bold text-sm">Locs</h3>
              </div>
            </Link>
            <Link
              to="/styles/category/weaves"
              className="group relative overflow-hidden rounded-xl border-2 border-border hover:border-orange-500 transition-all duration-300 hover:shadow-lg"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1586583226186-19fa230641a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
                  alt="Weaves"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="absolute bottom-2 left-2 text-white font-bold text-sm">Weaves</h3>
              </div>
            </Link>
            <Link
              to="/styles/category/barbering"
              className="group relative overflow-hidden rounded-xl border-2 border-border hover:border-orange-500 transition-all duration-300 hover:shadow-lg"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1633990700440-30a1f452a95b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
                  alt="Barbering"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="absolute bottom-2 left-2 text-white font-bold text-sm">Barbering</h3>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="hidden md:block w-64 flex-shrink-0">
            <SearchFilters
              filters={filters}
              onChange={setFilters}
              variant="sidebar"
            />
          </div>

          {showMobileFilters && (
            <div className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowMobileFilters(false)}>
              <div className="bg-white w-80 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <SearchFilters
                  filters={filters}
                  onChange={setFilters}
                  variant="sidebar"
                  onClose={() => setShowMobileFilters(false)}
                />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {viewMode === "map" && (
              <div className="mb-8">
                <MapView
                  markers={mapMarkers}
                  centerLat={searchLocation?.lat}
                  centerLng={searchLocation?.lng}
                  radiusMiles={filters.radiusMiles || 10}
                  onMarkerClick={(id) => navigate(`/services/${id}`)}
                  isLoading={loading}
                />
              </div>
            )}

            {viewMode === "list" && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-sm font-medium">
                    <span className="text-2xl font-bold text-orange-600">{total}</span>
                    <span className="text-muted-foreground ml-2">
                      {total === 1 ? 'stylist' : 'stylists'} found
                      {filters.location && ` near ${filters.location}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm">Sort by:</span>
                    <div className="relative">
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        className="px-4 py-2 bg-white border-2 border-border rounded-lg appearance-none cursor-pointer focus:border-orange-600 focus:outline-none"
                      >
                        <option value="best_match">Recommended</option>
                        <option value="rating">Highest Rating</option>
                        <option value="price_low">Lowest Price</option>
                        <option value="distance">Closest</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {loading && page === 1 ? (
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <Skeleton className="w-full md:w-64 h-64 md:h-auto" />
                          <div className="flex-1 p-6 space-y-4">
                            <Skeleton className="h-7 w-3/4" />
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <div className="flex gap-2">
                              <Skeleton className="h-7 w-20" />
                              <Skeleton className="h-7 w-20" />
                              <Skeleton className="h-7 w-20" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : results.length === 0 ? (
                  <Card className="p-16 text-center bg-white">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="h-10 w-10 text-orange-600" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">No stylists found</h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        We couldn't find any stylists matching your criteria. Try adjusting your filters or searching in a different area.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={resetFilters}
                        className="border-2 hover:border-orange-600 hover:text-orange-600"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <>
                    <div className="space-y-6">
                      {results.map((result) => (
                        <SearchResultCard 
                          key={result.id} 
                          result={result}
                          onClick={() => navigate(`/services/${result.id}`)}
                        />
                      ))}
                    </div>

                    {hasMore && (
                      <div className="mt-12 text-center">
                        <Button
                          onClick={loadMore}
                          disabled={loading}
                          variant="outline"
                          size="lg"
                          className="px-12 border-2 hover:border-orange-600 hover:text-orange-600"
                        >
                          {loading ? 'Loading...' : 'Load More Results'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
