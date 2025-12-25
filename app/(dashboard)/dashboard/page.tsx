'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import OpportunityList from '@/components/OpportunityList';
import FilterPanel, { Filters } from '@/components/FilterPanel';
import Pagination from '@/components/Pagination';
import { OpportunityListItem } from '../../types/opportunity';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [opportunities, setOpportunities] = useState<OpportunityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Filters>({
    search: null,
    types: [],
    levels: [],
    countries: [],
    modality: null,
    language: null,
    deadlineFrom: null,
    deadlineTo: null,
    salaryMin: null,
    salaryMax: null,
  });

  const fetchOpportunities = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      // Construir query params
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.types.length > 0) {
        filters.types.forEach(type => params.append('types', type));
      }
      if (filters.levels.length > 0) {
        filters.levels.forEach(level => params.append('levels', level));
      }
      if (filters.countries.length > 0) {
        filters.countries.forEach(country => params.append('countries', country));
      }
      if (filters.modality) {
        params.append('modality', filters.modality);
      }
      if (filters.language) {
        params.append('language', filters.language);
      }
      if (filters.deadlineFrom) {
        params.append('deadlineFrom', filters.deadlineFrom);
      }
      if (filters.deadlineTo) {
        params.append('deadlineTo', filters.deadlineTo);
      }
      if (filters.salaryMin) {
        params.append('salaryMin', filters.salaryMin);
      }
      if (filters.salaryMax) {
        params.append('salaryMax', filters.salaryMax);
      }

      // Ordenamiento
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await fetch(`/api/opportunities?${params.toString()}`, {
        headers: { 
            'user-id': session.user.id
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.opportunities || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalOpportunities(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, currentPage, filters, sortBy, sortOrder]);

  // Cargar oportunidades
  useEffect(() => {
    if (session?.user) {
      fetchOpportunities();
    }
  }, [session?.user, fetchOpportunities]);

  // Manejar cambios en filtros (resetear a página 1)
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Calcular filtros activos
  const activeFiltersCount = 
    (filters.search ? 1 : 0) +
    filters.types.length +
    filters.levels.length +
    filters.countries.length +
    (filters.modality ? 1 : 0) +
    (filters.language ? 1 : 0) +
    (filters.deadlineFrom ? 1 : 0) +
    (filters.deadlineTo ? 1 : 0) +
    (filters.salaryMin ? 1 : 0) +
    (filters.salaryMax ? 1 : 0);

  // Manejar cambios de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta oportunidad?')) {
      try {
        const response = await fetch(`/api/opportunities/${id}`, { 
          method: 'DELETE' 
        });

        if (!response.ok) {
          throw new Error('Error al eliminar oportunidad');
        }

        fetchOpportunities();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar oportunidad');
      }
    }
  };

  if (!session) {
    return null; 
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-muted-foreground mt-1">
            {totalOpportunities} {totalOpportunities === 1 ? 'oportunidad' : 'oportunidades'} {activeFiltersCount > 0 && `(${activeFiltersCount} filtros activos)`}
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {/* Selector de ordenamiento */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md bg-background text-sm flex-1 sm:flex-none"
          >
            <option value="createdAt-desc">Más recientes</option>
            <option value="createdAt-asc">Más antiguas</option>
            <option value="deadline-asc">Deadline más cercano</option>
            <option value="deadline-desc">Deadline más lejano</option>
            <option value="title-asc">Título A-Z</option>
            <option value="title-desc">Título Z-A</option>
          </select>
          <Button asChild className="whitespace-nowrap">
            <Link href="/opportunities/new">
              <Plus className="h-4 w-4" />
              Nueva Oportunidad
            </Link>
          </Button>
        </div>
      </div>

      {/* Panel de filtros */}
      <FilterPanel 
        onFilterChange={handleFilterChange}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Contenido */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-semibold">No se encontraron oportunidades</h3>
            {activeFiltersCount > 0 ? (
              <p className="text-muted-foreground">Intenta ajustar los filtros para ver más resultados</p>
            ) : (
              <>
                <p className="text-muted-foreground">Comienza agregando tu primera oportunidad</p>
                <Button asChild className="mt-4">
                  <Link href="/opportunities/new">
                    <Plus className="h-4 w-4" />
                    Crear Primera Oportunidad
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <OpportunityList
            opportunities={opportunities}
            onEdit={(opp) => router.push(`/opportunities/${opp.id}/edit`)}
            onDelete={handleDelete}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}