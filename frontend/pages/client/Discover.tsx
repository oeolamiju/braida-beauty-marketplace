import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Filter } from "lucide-react";
import SearchFilters from "@/components/SearchFilters";
import SearchResultCard from "@/components/SearchResultCard";
import { useFilters } from "@/hooks/useFilters";
import { useServiceSearch } from "@/hooks/useServiceSearch";

export default function ClientDiscover() {
  const navigate = useNavigate();
  const { filters, setFilters, resetFilters, buildSearchParams } = useFilters();
  const searchParams = buildSearchParams();
  const { results, loading, total, page, hasMore, loadMore } = useServiceSearch(
    searchParams,
    [filters]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-background to-amber-50/20">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Find Your Perfect Stylist</h1>
            <p className="text-muted-foreground">Discover verified beauty professionals near you</p>
          </div>

          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
            <Input
              placeholder="Search by location: postcode, city, or area (e.g., SW1A, Birmingham, Peckham)"
              className="pl-12 pr-12 h-14 text-lg border-2 focus:border-orange-600 rounded-xl shadow-sm"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <SearchFilters
          filters={filters}
          onChange={setFilters}
        />
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-7xl">

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
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm font-medium">
                <span className="text-2xl font-bold text-orange-600">{total}</span>
                <span className="text-muted-foreground ml-2">
                  {total === 1 ? 'stylist' : 'stylists'} found near you
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {results.map((result) => (
                <SearchResultCard 
                  key={result.id} 
                  result={result}
                  onClick={() => navigate(`/client/services/${result.id}`)}
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
      </div>
    </div>
  );
}
