import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import backend from '~backend/client';

export interface SearchFilters {
  query?: string;
  category?: string;
  styleId?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  date?: Date;
  timeSlot?: string;
  location?: {
    lat: number;
    lng: number;
    radius?: number;
  };
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'distance' | 'newest';
  page?: number;
  limit?: number;
}

export function useAdvancedSearch(initialFilters: SearchFilters = {}) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query || '');

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1,
    }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ page: 1, limit: filters.limit || 20 });
    setDebouncedQuery('');
  }, [filters.limit]);

  const clearFilter = useCallback((key: keyof SearchFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return { ...newFilters, page: 1 };
    });
  }, []);

  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).filter(
      (key) => key !== 'page' && key !== 'limit' && filters[key as keyof SearchFilters] != null
    ).length;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  const searchParams = useMemo(() => {
    const params: Record<string, any> = {};
    
    if (debouncedQuery) params.query = debouncedQuery;
    if (filters.category) params.category = filters.category;
    if (filters.styleId) params.style_id = filters.styleId;
    if (filters.city) params.city = filters.city;
    if (filters.minPrice != null) params.min_price = filters.minPrice;
    if (filters.maxPrice != null) params.max_price = filters.maxPrice;
    if (filters.date) params.date = filters.date.toISOString();
    if (filters.timeSlot) params.time_slot = filters.timeSlot;
    if (filters.location) {
      params.lat = filters.location.lat;
      params.lng = filters.location.lng;
      if (filters.location.radius) params.radius = filters.location.radius;
    }
    if (filters.sortBy) params.sort_by = filters.sortBy;
    params.page = filters.page || 1;
    params.limit = filters.limit || 20;
    
    return params;
  }, [filters, debouncedQuery]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    activeFilterCount,
    hasActiveFilters,
    searchParams,
    setDebouncedQuery,
  };
}

export function useServiceSearch(initialFilters: SearchFilters = {}) {
  const search = useAdvancedSearch(initialFilters);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['services', 'search', search.searchParams],
    queryFn: async () => {
      const result = await backend.search.search(search.searchParams);
      return result;
    },
    enabled: true,
  });

  return {
    ...search,
    services: data?.results || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
  };
}

export function useFreelancerSearch(initialFilters: Omit<SearchFilters, 'category'> = {}) {
  const search = useAdvancedSearch(initialFilters);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['freelancers', 'search', search.searchParams],
    queryFn: async () => {
      const result = await backend.freelancers.list();
      return result;
    },
    enabled: true,
  });

  return {
    ...search,
    freelancers: data?.freelancers || [],
    total: data?.freelancers?.length || 0,
    isLoading,
    error,
    refetch,
  };
}
