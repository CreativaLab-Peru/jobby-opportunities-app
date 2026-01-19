import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { OrganizationForm } from "../components/organization-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function NewOrganizationScreen() {
  return (
    <div className="container max-w-2xl mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/organizations"
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a organizaciones
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Nueva Organización</CardTitle>
          <CardDescription>
            Registra una nueva entidad en el sistema. Asegúrate de que el nombre y la key sean únicos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationForm />
        </CardContent>
      </Card>
    </div>
  );
}
