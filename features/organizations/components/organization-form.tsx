'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, RefreshCw } from "lucide-react";

// Actions & Types
import { createOrganizationAction } from "../actions/create-organization-action";
import { updateOrganizationAction } from "../actions/update-organization-action"; // Debes crear este action
import { OrganizationFormValues, organizationSchema } from "@/features/organizations/schemas";
import { Organization } from "@prisma/client";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface OrganizationFormProps {
  initialData?: Organization | null;
}

export function OrganizationForm({ initialData }: OrganizationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Determinamos el modo del formulario
  const isEditMode = !!initialData;

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: initialData?.name || "",
      logoUrl: initialData?.logoUrl || "",
    },
  });

  async function onSubmit(values: OrganizationFormValues) {
    setIsLoading(true);
    try {
      let result;

      if (isEditMode && initialData) {
        // Lógica de Actualización
        result = await updateOrganizationAction(initialData.id, values.name, values.logoUrl);
      } else {
        // Lógica de Creación (ajustado a tu firma de action actual)
        result = await createOrganizationAction(values.name, values.logoUrl);
      }

      if (result.success) {
        toast.success(isEditMode ? "Cambios guardados" : "Organización creada");
        router.refresh();
        router.push("/organizations");
      } else {
        toast.error(result.error || "Ocurrió un error inesperado");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Organización</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Acme Corp"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del Logo</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://logo-url.com/imagen.png"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Actualizando..." : "Guardando..."}
              </>
            ) : (
              <>
                {isEditMode ? (
                  <RefreshCw className="mr-2 h-4 w-4" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditMode ? "Guardar Cambios" : "Crear Organización"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
