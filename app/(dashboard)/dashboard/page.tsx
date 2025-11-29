'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import OpportunityList from '@/components/OpportunityList';
import FilterPanel, { Filters } from '@/components/FilterPanel';
import Pagination from '@/components/Pagination';
import { OpportunityListItem } from '../../types/opportunity';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [opportunities, setOpportunities] = useState<OpportunityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [filters, setFilters] = useState<Filters>({
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

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  const fetchOpportunities = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      // Construir query params
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      
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
  }, [session?.user?.id, currentPage, filters]);

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

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hola, {session?.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-white text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Mis Oportunidades ({totalOpportunities})
            </h2>
            <Link
              href="/opportunities/new"
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-white font-medium inline-block"
            >
              + Nueva Oportunidad
            </Link>
          </div>

          {/* Panel de filtros */}
          <FilterPanel 
            onFilterChange={handleFilterChange}
            activeFiltersCount={activeFiltersCount}
          />

          {loading ? (
            <div className="bg-white shadow rounded-lg p-6 text-center mt-6">
              <div className="text-lg">Cargando oportunidades...</div>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center mt-6">
              <p className="text-gray-500 mb-4">No se encontraron oportunidades</p>
              {activeFiltersCount > 0 ? (
                <p className="text-sm text-gray-400">Intenta ajustar los filtros</p>
              ) : (
                <Link
                  href="/opportunities/new"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Crear tu primera oportunidad
                </Link>
              )}
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
      </main>
    </div>
  );
}