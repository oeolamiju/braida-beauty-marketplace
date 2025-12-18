import { useState, useEffect, useCallback } from "react";
import backend from "@/lib/backend";
import { useApiError } from "./useApiError";

interface ServiceResult {
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
  locationTypes: string[];
  averageRating: number;
  reviewCount: number;
  distanceMiles: number | null;
  freelancerPostcode: string;
  freelancerArea: string;
  freelancerCategories: string[];
  availabilityMatch?: {
    matched: boolean;
    matchedPatterns: string[];
  };
  avgResponseTimeHours: number | null;
  completionRate: number | null;
}

interface SearchLocation {
  lat: number;
  lng: number;
  radiusMiles: number;
}

interface UseServiceSearchOptions {
  autoSearch?: boolean;
  limit?: number;
}

export function useServiceSearch(
  searchParams: Record<string, any>,
  dependencies: any[] = [],
  options: UseServiceSearchOptions = {}
) {
  const { autoSearch = true, limit = 20 } = options;
  const [results, setResults] = useState<ServiceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchLocation, setSearchLocation] = useState<SearchLocation | undefined>();
  const { showError } = useApiError();

  const performSearch = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const params = {
        ...searchParams,
        page: pageNum,
        limit,
      };

      const response = await backend.search.search(params);
      
      if (pageNum === 1) {
        setResults(response.results);
      } else {
        setResults(prev => [...prev, ...response.results]);
      }
      
      setTotal(response.total);
      setPage(response.page);
      setHasMore(response.hasMore);
      
      // Store search location if available
      if ((response as any).searchLocation) {
        setSearchLocation((response as any).searchLocation);
      } else {
        setSearchLocation(undefined);
      }
    } catch (error) {
      console.error("Search failed:", error);
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, limit, showError]);

  useEffect(() => {
    if (autoSearch) {
      performSearch(1);
    }
  }, dependencies);

  const loadMore = useCallback(() => {
    performSearch(page + 1);
  }, [page, performSearch]);

  const refresh = useCallback(() => {
    performSearch(1);
  }, [performSearch]);

  return {
    results,
    loading,
    total,
    page,
    hasMore,
    loadMore,
    refresh,
    performSearch,
    searchLocation,
  };
}
