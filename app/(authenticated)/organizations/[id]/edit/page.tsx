import { notFound } from "next/navigation";
import { EditOrganizationScreen } from "@/features/organizations/screens/edit-organization-screen";
import {prisma} from "@/lib/prisma";
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOrganizationPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Obtención de datos en el servidor
  const organization = await prisma.organization.findUnique({
    where: { id }
  });

  // 2. Control de excepciones: Si no existe, disparamos el error 404 de Next.js
  if (!organization) {
    notFound();
  }

  // 3. Pasamos la data al Screen Component
  return <EditOrganizationScreen organization={organization} />;
}
