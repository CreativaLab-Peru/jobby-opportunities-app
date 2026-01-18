"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Organization } from "@prisma/client";
import {OrganizationFormValues, OrganizationSchema} from "@/features/organizations/schemas";
import {useEffect} from "react";

interface Props {
  organization?: Organization;
  onSubmit: (data: OrganizationFormValues) => Promise<{ success: boolean; error?: any }>;
  onSuccess?: () => void;
}

export function OrganizationForm({ organization, onSubmit, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(OrganizationSchema),
    defaultValues: {
      name: organization?.name || "",
      logoUrl: organization?.logoUrl || "",
    },
  });

  useEffect(() => {
    if (organization) {
      reset({
        name: organization.name,
        logoUrl: organization.logoUrl || "",
      });
    } else {
      reset({
        name: "",
        logoUrl: "",
      });
    }
  }, [organization, reset]);

  const onFormSubmit = async (data: OrganizationFormValues) => {
    const result = await onSubmit(data);
    if (result.success) {
      if (!organization) reset();
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 p-6 bg-white border rounded-xl shadow-sm">
      <div>
        <label className="block text-sm font-semibold text-gray-700">Nombre</label>
        <input
          {...register("name")}
          className={`w-full p-2 border rounded mt-1 text-black ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Nombre de la empresa"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700">URL del Logo (Opcional)</label>
        <input
          {...register("logoUrl")}
          className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
          placeholder="https://..."
        />
        {errors.logoUrl && <p className="text-red-500 text-xs mt-1">{errors.logoUrl.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400 transition-all"
      >
        {isSubmitting ? "Guardando..." : organization ? "Actualizar Organización" : "Crear Organización"}
      </button>
    </form>
  );
}
