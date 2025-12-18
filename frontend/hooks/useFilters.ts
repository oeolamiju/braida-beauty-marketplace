import { useState } from "react";
import type { FilterState } from "@/components/SearchFilters";

export function useFilters(initialFilters?: Partial<FilterState>) {
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    keyword: '',
    category: '',
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    availableOnDate: '',
    availableThisWeekend: false,
    locationType: '',
    sortBy: 'best_match',
    dayPattern: '',
    timeOfDay: '',
    specificDays: [],
    radiusMiles: 5,
    verifiedOnly: false,
    experienceLevel: '',
    styleTags: [],
    ...initialFilters,
  });

  const resetFilters = () => {
    setFilters({
      location: '',
      keyword: '',
      category: '',
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      availableOnDate: '',
      availableThisWeekend: false,
      locationType: '',
      sortBy: 'best_match',
      dayPattern: '',
      timeOfDay: '',
      specificDays: [],
      radiusMiles: 5,
      verifiedOnly: false,
      experienceLevel: '',
      styleTags: [],
      ...initialFilters,
    });
  };

  const buildSearchParams = (baseParams: Record<string, any> = {}) => {
    const params = { ...baseParams };
    
    if (filters.location) params.location = filters.location;
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.category) params.category = filters.category;
    if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters.minRating !== undefined) params.minRating = filters.minRating;
    if (filters.availableOnDate) params.availableOnDate = filters.availableOnDate;
    if (filters.availableThisWeekend) params.availableThisWeekend = filters.availableThisWeekend;
    if (filters.locationType) params.locationType = filters.locationType;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.dayPattern) params.dayPattern = filters.dayPattern;
    if (filters.timeOfDay) params.timeOfDay = filters.timeOfDay;
    if (filters.specificDays && filters.specificDays.length > 0) params.specificDays = filters.specificDays.join(',');
    if (filters.radiusMiles !== undefined) params.radiusMiles = filters.radiusMiles;
    if (filters.verifiedOnly) params.verifiedOnly = filters.verifiedOnly;
    if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
    if (filters.styleTags && filters.styleTags.length > 0) params.styleTags = filters.styleTags.join(',');

    return params;
  };

  return {
    filters,
    setFilters,
    resetFilters,
    buildSearchParams,
  };
}
