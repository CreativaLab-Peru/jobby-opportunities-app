'use client';

import Link from "next/link";
import { ChevronLeft, Building2 } from "lucide-react";
import { Organization } from "@prisma/client";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrganizationForm } from "../components/organization-form";

interface EditOrganizationScreenProps {
  organization: Organization;
}

export const EditOrganizationScreen = ({ organization }: EditOrganizationScreenProps) => {
  return (
    <div className="container max-w-2xl mx-auto py-10 space-y-6 animate-in fade-in duration-500">
      {/* Navegación de retorno */}
      <div className="flex items-center justify-between">
        <Link
          href="/organizations"
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Volver al listado
        </Link>
      </div>

      <Card className="border-t-4 border-t-primary shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Editar Organización</CardTitle>
              <CardDescription>
                Actualiza la información de <span className="text-foreground font-medium">{organization.name}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <OrganizationForm initialData={organization} />
        </CardContent>
      </Card>
    </div>
  );
};
