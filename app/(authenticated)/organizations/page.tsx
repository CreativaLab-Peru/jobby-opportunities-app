import {getOrganizationsActionsV2} from "@/features/organizations/actions/get-organizations-actions-v2";
import {OrganizationsScreen} from "@/features/organizations/screens/organization-screen";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
  }>;
}

export default async function OrganizationsPage({ searchParams }: PageProps) {
  const sParams = await searchParams;

  // 1. Normalización de parámetros
  const filters = {
    page: sParams.page ? parseInt(sParams.page) : 1,
    pageSize: 10,
    search: sParams.search || "",
    orderBy: sParams.orderBy || "name",
    orderDirection: sParams.orderDirection || "asc",
  };

  // 2. Fetch de datos en el servidor
  const result = await getOrganizationsActionsV2(filters);

  return (
    <OrganizationsScreen
      initialData={result.data}
      pagination={result.meta}
      filters={filters}
    />
  );
}
