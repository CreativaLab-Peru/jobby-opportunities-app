'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ListFilter } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

// UI Components
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

// Domain Components
import OpportunityList from '@/components/opportunity-list';
import FilterPanel from '@/components/FilterPanel';
import Pagination from '@/components/Pagination';
import {useOpportunities} from "@/features/opportunities/hooks/use-opportunities";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const {
    items, total, totalPages, loading,
    currentPage, setCurrentPage,
    filters, setFilters,
    sort, setSort, refresh
  } = useOpportunities(session?.user?.id);

  // Lógica de conteo de filtros
  const activeFiltersCount = Object.values(filters).filter(v =>
    Array.isArray(v) ? v.length > 0 : !!v
  ).length;

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta oportunidad?')) return;
    const res = await fetch(`/api/opportunities/${id}`, { method: 'DELETE' });
    if (res.ok) refresh();
  };

  if (!session) return null;

  return (
    <div className="container mx-auto py-6 space-y-6">

      {/* HEADER DE ACCIONES */}
      <header className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mis Oportunidades</h1>
          <p className="text-sm text-muted-foreground">
            {total} resultados encontrados {activeFiltersCount > 0 && `· ${activeFiltersCount} filtros`}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            value={`${sort.by}-${sort.order}`}
            onValueChange={(v) => {
              const [by, order] = v.split('-');
              setSort({ by, order: order as 'asc' | 'desc' });
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
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
              <Plus className="mr-2 h-4 w-4" /> Nueva
            </Link>
          </Button>
        </div>
      </header>

      {/* FILTROS */}
      <FilterPanel
        onFilterChange={(f) => { setFilters(f); setCurrentPage(1); }}
        activeFiltersCount={activeFiltersCount}
      />

      {/* ESTADOS DE CARGA Y CONTENIDO */}
      <main>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState isFiltered={activeFiltersCount > 0} />
        ) : (
          <div className="space-y-6">
            <OpportunityList
              opportunities={items}
              onEdit={(opp) => router.push(`/opportunities/${opp.id}/edit`)}
              onDelete={handleDelete}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-componente para limpiar el render principal
function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="border-2 border-dashed rounded-xl p-16 text-center">
      <h3 className="text-lg font-medium">No hay oportunidades</h3>
      <p className="text-muted-foreground mb-6">
        {isFiltered ? "Prueba ajustando los filtros de búsqueda." : "Aún no has creado ninguna oportunidad."}
      </p>
      {!isFiltered && (
        <Button asChild>
          <Link href="/opportunities/new"><Plus className="mr-2 h-4 w-4" /> Crear primera</Link>
        </Button>
      )}
    </div>
  );
}
