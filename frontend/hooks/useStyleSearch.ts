import { useState, useEffect, useCallback } from "react";
import backend from "@/lib/backend";
import { useToast } from "@/components/ui/use-toast";

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
  avgResponseTimeHours: number | null;
  completionRate: number | null;
}

interface StyleInfo {
  id: number;
  name: string;
  description: string | null;
  referenceImageUrl: string | null;
}

interface UseStyleSearchOptions {
  autoSearch?: boolean;
  limit?: number;
}

export function useStyleSearch(
  styleId: string | undefined,
  searchParams: Record<string, any>,
  dependencies: any[] = [],
  options: UseStyleSearchOptions = {}
) {
  const { autoSearch = true, limit = 20 } = options;
  const [style, setStyle] = useState<StyleInfo | null>(null);
  const [results, setResults] = useState<ServiceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { toast } = useToast();

  const performSearch = useCallback(async (pageNum: number) => {
    if (!styleId) return;

    setLoading(true);
    try {
      const params = {
        styleId: parseInt(styleId),
        ...searchParams,
        page: pageNum,
        limit,
      };

      const response = await backend.styles.searchByStyle(params);

      if (pageNum === 1) {
        setStyle(response.style);
        setResults(response.results);
      } else {
        setResults(prev => [...prev, ...response.results]);
      }

      setTotal(response.total);
      setPage(response.page);
      setHasMore(response.hasMore);
    } catch (error: any) {
      console.error("Search failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load style",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [styleId, searchParams, limit, toast]);

  useEffect(() => {
    if (autoSearch && styleId) {
      performSearch(1);
    }
  }, [styleId, ...dependencies]);

  const loadMore = useCallback(() => {
    performSearch(page + 1);
  }, [page, performSearch]);

  const refresh = useCallback(() => {
    performSearch(1);
  }, [performSearch]);

  return {
    style,
    results,
    loading,
    total,
    page,
    hasMore,
    loadMore,
    refresh,
    performSearch,
  };
}
