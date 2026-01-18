'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

// UI Components
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OpportunityList from '@/components/opportunity-list';
import FilterPanel from '@/components/filter-panel';
import Pagination from '@/components/Pagination';

// Tipos del Dominio y del Action
import { Opportunity } from "@prisma/client";
import { GetOpportunitiesParams, PaginationMetadata } from "@/features/opportunities/actions/get-opportunities";
import {EmptyState} from "@/components/empty-state";

interface OpportunitiesScreenProps {
  initialData: Opportunity[];
  pagination: PaginationMetadata | null;
  filters: GetOpportunitiesParams;
}

export const OpportunitiesScreen = ({
                                      initialData,
                                      pagination,
                                      filters
                                    }: OpportunitiesScreenProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  /**
   * Actualiza la URL de forma inmutable.
   * Tipamos las llaves para que coincidan con los parámetros permitidos.
   */
  const updateQuery = (newParams: Partial<GetOpportunitiesParams> & Record<string, any>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach(v => params.append(key, v));
      } else {
        params.set(key, value.toString());
      }
    });

    router.push(`?${params.toString()}`);
  };

  // --- Handlers con Tipado ---
  const handleSortChange = (value: string) => {
    const [by, order] = value.split('-') as [string, "asc" | "desc"];
    updateQuery({ sortBy: by, sortOrder: order, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateQuery({ page });
  };

  const handleFilterChange = (newFilters: Partial<GetOpportunitiesParams>) => {
    updateQuery({ ...newFilters, page: 1 });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta oportunidad?')) return;

    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: 'DELETE',
        headers: { 'user-id': session?.user?.id || '' }
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  /**
   * Lógica de conteo de filtros activos basada en el esquema de GetOpportunitiesParams
   */
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    // No contamos paginación técnica como filtros "activos" para el usuario
    if (key === 'page' || key === 'pageSize') return false;
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  }).length;

  if (!session) return null;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Mis Oportunidades</h1>
          <p className="text-sm text-muted-foreground">
            {pagination?.total ?? 0} resultados encontrados
            {activeFiltersCount > 0 && (
              <span className="ml-1 text-primary font-medium">
                · {activeFiltersCount} filtros activos
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Más recientes</SelectItem>
              <SelectItem value="deadline-asc">Deadline próximo</SelectItem>
              <SelectItem value="title-asc">Título A-Z</SelectItem>
            </SelectContent>
          </Select>

          <Button asChild>
            <Link href="/opportunities/new">
              <Plus className="mr-2 h-4 w-4" /> Nueva Oportunidad
            </Link>
          </Button>
        </div>
      </header>

      <FilterPanel
        initialFilters={filters}
        onFilterChange={handleFilterChange}
        activeFiltersCount={activeFiltersCount}
      />

      <main className="min-h-[400px]">
        {initialData.length === 0 ? (
          <EmptyState isFiltered={activeFiltersCount > 0} />
        ) : (
          <div className="space-y-6">
            <OpportunityList
              opportunities={initialData}
              onEdit={(opp) => router.push(`/opportunities/${opp.id}/edit`)}
              onDelete={handleDelete}
            />
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center pt-4">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
