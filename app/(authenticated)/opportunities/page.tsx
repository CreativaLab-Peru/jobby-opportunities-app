import { OpportunitiesScreen } from "@/features/opportunities/screens/opportunities-screen";
import { getOpportunities } from "@/features/opportunities/actions/get-opportunities";

interface OpportunitiesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    types?: string | string[];
    levels?: string | string[];
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  const sParams = await searchParams;

  // 1. Normalización de parámetros (asegurar arrays para Prisma)
  const toArray = (val: string | string[] | undefined) =>
    val ? (Array.isArray(val) ? val : [val]) : undefined;

  const params = {
    page: sParams.page ? parseInt(sParams.page) : 1,
    pageSize: sParams.pageSize ? parseInt(sParams.pageSize) : 10,
    search: sParams.search,
    types: toArray(sParams.types),
    levels: toArray(sParams.levels),
    sortBy: sParams.sortBy,
    sortOrder: (sParams.sortOrder as "asc" | "desc") || "desc",
  };

  // 2. Fetch de datos en el servidor
  const result = await getOpportunities(params);

  return (
    <OpportunitiesScreen
      initialData={result.data}
      pagination={result.pagination}
      filters={params} // Pasamos los filtros actuales para sincronizar la UI
    />
  );
}
