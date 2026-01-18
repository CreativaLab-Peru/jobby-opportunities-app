import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditOpportunityScreen from "@/features/opportunities/screens/edit-opportunity-screen";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditOpportunityPage({ params }: Props) {
  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
  });

  if (!opportunity) {
    notFound();
  }

  return (
    <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Editar Oportunidad</h1>
        <p className="text-muted-foreground">Actualiza los detalles de la vacante.</p>
      </div>

      {/* Pasamos la data ya serializada al Client Component */}
      <EditOpportunityScreen initialData={opportunity} />
    </main>
  );
}
