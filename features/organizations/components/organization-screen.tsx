"use client";
import { useState } from "react";
import { Organization } from "@prisma/client";
import { OrganizationForm } from "./organization-form";
import {updateOrganizationAction} from "@/features/organizations/actions/update-organization-action";
import {createOrganizationAction} from "@/features/organizations/actions/create-organization-action";

export function OrganizationsScreen({ initialData }: { initialData: Organization[] }) {
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Columna Formulario */}
      <div className="md:col-span-1">
        <h2 className="text-xl font-bold mb-4">{editingOrg ? "Editar" : "Nueva"}</h2>
        <OrganizationForm
          organization={editingOrg ?? undefined}
          onSubmit={(data) => editingOrg
            ? updateOrganizationAction(editingOrg.id, data.name, data.logoUrl)
            : createOrganizationAction(data.name)
          }
          onSuccess={() => setEditingOrg(null)}
        />
        {editingOrg && (
          <button onClick={() => setEditingOrg(null)} className="mt-2 text-sm text-gray-500 underline w-full">
            Cancelar edición
          </button>
        )}
      </div>

      {/* Columna Tabla */}
      <div className="md:col-span-2">
        <div className="border rounded-lg overflow-hidden bg-white">
          <table className="w-full">
            <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Organización</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
            </thead>
            <tbody>
            {initialData.map((org) => (
              <tr key={org.key} className="border-t">
                <td className="p-4 text-black font-medium">{org.name}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setEditingOrg(org)} // Aquí mapeas tus datos a Organization
                    className="text-indigo-600 hover:text-indigo-900 font-semibold"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
