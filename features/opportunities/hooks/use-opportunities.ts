import { useState, useCallback, useEffect } from 'react';
import { Filters } from '@/components/filter-panel';
import {OpportunityListItem} from "@/app/types/opportunity";

export function useOpportunities(userId?: string) {
  const [data, setData] = useState<{
    items: OpportunityListItem[];
    total: number;
    totalPages: number;
  }>({ items: [], total: 0, totalPages: 1 });

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState({ by: 'createdAt', order: 'desc' });
  const [filters, setFilters] = useState<Filters>({
    search: null, types: [], levels: [], countries: [],
    modality: null, language: null, deadlineFrom: null,
    deadlineTo: null, salaryMin: null, salaryMax: null,
  });

  const fetchItems = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy: sort.by,
        sortOrder: sort.order,
      });

      // Mapeo dinámico de filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (!value) return;
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value as string);
        }
      });

      const res = await fetch(`/api/opportunities?${params.toString()}`, {
        headers: { 'user-id': userId }
      });

      const result = await res.json();
      setData({
        items: result.opportunities || [],
        total: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 1
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userId, currentPage, filters, sort]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  return {
    ...data,
    loading,
    currentPage,
    setCurrentPage,
    filters,
    setFilters,
    sort,
    setSort,
    refresh: fetchItems
  };
}
