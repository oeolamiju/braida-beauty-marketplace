import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, MapPin, ChevronDown, SlidersHorizontal } from "lucide-react";
import SearchFilters from "@/components/SearchFilters";
import SearchResultCard from "@/components/SearchResultCard";
import { useFilters } from "@/hooks/useFilters";
import { useServiceSearch } from "@/hooks/useServiceSearch";
import { Select } from "@/components/ui/select";
import { useState } from "react";

export default function ClientDiscover() {
  const navigate = useNavigate();
  const { filters, setFilters, resetFilters, buildSearchParams } = useFilters();
  const searchParams = buildSearchParams();
  const { results, loading, total, page, hasMore, loadMore } = useServiceSearch(
    searchParams,
    [filters]
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <div className="bg-[#2a2a2a] border-b border-[#3a3a3a] sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
              <Input
                placeholder="Braids"
                className="pl-12 pr-4 h-12 bg-[#3a3a3a] border-[#4a4a4a] text-white placeholder:text-gray-500 focus:border-orange-500 rounded-lg"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
            </div>

            {/* City Selector */}
            <div className="relative w-48 hidden md:block">
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full h-12 px-4 bg-[#3a3a3a] border border-[#4a4a4a] text-white rounded-lg appearance-none cursor-pointer focus:border-orange-500 focus:outline-none"
              >
                <option value="">London</option>
                <option value="Birmingham">Birmingham</option>
                <option value="Manchester">Manchester</option>
                <option value="Leeds">Leeds</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Mobile Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden bg-[#3a3a3a] border-[#4a4a4a] text-white hover:bg-[#4a4a4a] hover:text-white"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <SearchFilters
              filters={filters}
              onChange={setFilters}
              variant="sidebar"
            />
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowMobileFilters(false)}>
              <div className="bg-[#2a2a2a] w-80 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <SearchFilters
                  filters={filters}
                  onChange={setFilters}
                  variant="sidebar"
                  onClose={() => setShowMobileFilters(false)}
                />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">

            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-white">
                <span className="text-2xl font-bold">{total} stylists found</span>
                <span className="text-gray-400 ml-2">near Brixton, London</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Sort by:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="px-4 py-2 bg-[#3a3a3a] border border-[#4a4a4a] text-white rounded-lg appearance-none cursor-pointer focus:border-orange-500 focus:outline-none"
                >
                  <option value="best_match">Recommended</option>
                  <option value="rating">Highest Rating</option>
                  <option value="price_low">Lowest Price</option>
                  <option value="distance">Closest</option>
                </select>
                <ChevronDown className="-ml-8 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {loading && page === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden bg-[#2a2a2a] border-[#3a3a3a]">
                    <Skeleton className="w-full aspect-[4/3] bg-[#3a3a3a]" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4 bg-[#3a3a3a]" />
                      <Skeleton className="h-4 w-1/2 bg-[#3a3a3a]" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16 bg-[#3a3a3a]" />
                        <Skeleton className="h-5 w-16 bg-[#3a3a3a]" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : results.length === 0 ? (
              <Card className="p-16 text-center bg-[#2a2a2a] border-[#3a3a3a]">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">No stylists found</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    We couldn't find any stylists matching your criteria. Try adjusting your filters or searching in a different area.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={resetFilters}
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                {/* Grid of Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.map((result) => (
                    <SearchResultCard 
                      key={result.id} 
                      result={result}
                      onClick={() => navigate(`/client/services/${result.id}`)}
                      variant="dark"
                      compact
                    />
                  ))}
                </div>

                {/* Pagination */}
                {total > results.length && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      className="w-10 h-10 p-0 bg-[#3a3a3a] border-[#4a4a4a] text-white hover:bg-[#4a4a4a] hover:text-white"
                      disabled
                    >
                      &lt;
                    </Button>
                    <Button className="w-10 h-10 p-0 bg-orange-500 text-white hover:bg-orange-600 border-0">
                      1
                    </Button>
                    <Button
                      variant="outline"
                      className="w-10 h-10 p-0 bg-[#3a3a3a] border-[#4a4a4a] text-white hover:bg-[#4a4a4a] hover:text-white"
                      onClick={loadMore}
                      disabled={loading || !hasMore}
                    >
                      2
                    </Button>
                    <Button
                      variant="outline"
                      className="w-10 h-10 p-0 bg-[#3a3a3a] border-[#4a4a4a] text-white hover:bg-[#4a4a4a] hover:text-white"
                      onClick={loadMore}
                      disabled={loading || !hasMore}
                    >
                      3
                    </Button>
                    <span className="text-gray-500">...</span>
                    <Button
                      variant="outline"
                      className="w-10 h-10 p-0 bg-[#3a3a3a] border-[#4a4a4a] text-white hover:bg-[#4a4a4a] hover:text-white"
                      onClick={loadMore}
                      disabled={loading || !hasMore}
                    >
                      &gt;
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
