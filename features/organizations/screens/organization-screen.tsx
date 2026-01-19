'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Building2 } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

// UI Components
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Pagination from '@/components/Pagination';
import { EmptyState } from "@/components/empty-state";

// Componentes del Módulo
import OrganizationFilterPanel from "@/features/organizations/components/organization-filter-panel";
import OrganizationList from "@/features/organizations/components/organization-list";

// Tipos
import { Organization } from "@prisma/client";


interface OrganizationsScreenProps {
  initialData: Organization[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null;
  filters: {
    page: number;
    search?: string;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
  };
}

export const OrganizationsScreen = ({
                                      initialData,
                                      pagination,
                                      filters
                                    }: OrganizationsScreenProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  /**
   * Actualiza la URL manteniendo la consistencia de los parámetros.
   */
  const updateQuery = (newParams: Record<string, any>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    router.push(`?${params.toString()}`);
  };

  // --- Handlers ---
  const handleSortChange = (value: string) => {
    const [by, order] = value.split('-') as [string, "asc" | "desc"];
    updateQuery({ orderBy: by, orderDirection: order, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateQuery({ page });
  };

  const handleFilterChange = (newFilters: any) => {
    updateQuery({ ...newFilters, page: 1 });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta organización?')) return;

    try {
      const res = await fetch(`/api/organizations/${id}`, {
        method: 'DELETE',
        headers: { 'user-id': session?.user?.id || '' }
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error al eliminar organización:", error);
    }
  };

  if (!session) return null;

  const activeFiltersCount = filters.search ? 1 : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Organizaciones</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {pagination?.total ?? 0} organizaciones registradas
            {activeFiltersCount > 0 && (
              <span className="ml-1 text-primary font-medium">
                · {activeFiltersCount} filtro activo
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            value={`${filters.orderBy || 'name'}-${filters.orderDirection || 'asc'}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
              <SelectItem value="createdAt-desc">Más recientes</SelectItem>
            </SelectContent>
          </Select>

          <Button asChild>
            <Link href="/organizations/new">
              <Plus className="mr-2 h-4 w-4" /> Nueva Organización
            </Link>
          </Button>
        </div>
      </header>

      {/* Panel de Búsqueda */}
      <OrganizationFilterPanel
        initialFilters={filters}
        onFilterChange={handleFilterChange}
      />

      <main className="min-h-[400px]">
        {initialData.length === 0 ? (
          <EmptyState
            isFiltered={activeFiltersCount > 0}
            title="No hay organizaciones"
            description={activeFiltersCount > 0
              ? "No encontramos organizaciones que coincidan con tu búsqueda."
              : "Aún no has registrado ninguna organización."
            }
          />
        ) : (
          <div className="space-y-6">
            <OrganizationList
              organizations={initialData}
              onEdit={(org) => router.push(`/organizations/${org.id}/edit`)}
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
