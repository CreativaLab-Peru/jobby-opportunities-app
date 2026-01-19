"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/features/auth/actions/get-session";
import { generateSearchVector } from "@/lib/matching/utils";
import { getCanonicalSkill } from "@/lib/matching/skills-utils";
import { OpportunityFormValues } from "@/features/opportunities/schemas/opportunity.schema";
import { Modality, OpportunityType } from "@prisma/client";

/**
 * Actualiza una oportunidad existente con validación de autoría y tipado estricto.
 */
export async function updateOpportunityAction(id: string, body: OpportunityFormValues) {
  try {
    // 1. Verificación de Sesión
    const session = await getSession();
    if (!session.success || !session.user) {
      return { success: false, error: "No autorizado" };
    }

    // const userId = session.user.id as string;

    // 2. Verificación de Propiedad (Seguridad)
    // Buscamos la oportunidad asegurándonos de que pertenezca al usuario en una sola consulta
    const existing = await prisma.opportunity.findFirst({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, error: "Oportunidad no encontrada o no tienes permisos" };
    }

    // 3. Normalización de Habilidades (Deduplicación)
    const rawSkills = [
      ...(body.requiredSkills || []),
      ...(body.optionalSkills || []),
    ];
    const normalizedSkills = Array.from(new Set(rawSkills.map(getCanonicalSkill)));

    // Blind organization logo URL if organization is provided
    if (body.organization) {
      const findOrganization = await prisma.organization.findUnique({
        where: {
          key: body.organization,
        },
      });
      if (findOrganization && findOrganization?.logoUrl) {
        body.organizationLogoUrl = findOrganization.logoUrl;
      }
    }

    // 4. Ejecución de la Actualización
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        type: body.type as OpportunityType,
        title: body.title,
        organization: body.organization,
        organizationLogoUrl: body.organizationLogoUrl || null,
        url: body.url || "",
        description: body.description,
        language: body.language || "ES",
        ubication: body.location || null, // Mapeo Schema -> Prisma
        fieldOfStudy: body.area || null,   // Mapeo Schema -> Prisma
        modality: (body.modality as Modality) || "ON_SITE",

        // Transformación de Arrays
        eligibleLevels: (body.eligibleLevels || []).map(l => l.toUpperCase()),
        eligibleCountries: (body.eligibleCountries || []).map(c => c.toUpperCase()),
        requiredSkills: (body.requiredSkills || []).map(getCanonicalSkill),
        optionalSkills: (body.optionalSkills || []).map(getCanonicalSkill),

        // Finanzas (Zod ya garantiza que son números o undefined)
        minSalary: body.salaryRange?.min ?? null,
        maxSalary: body.salaryRange?.max ?? null,
        currency: body.currency || "USD",

        // Re-generación del motor de búsqueda
        searchVector: generateSearchVector({
          title: body.title,
          description: body.description,
          organization: body.organization,
          skills: normalizedSkills
        }),

        deadline: body.deadline ? new Date(body.deadline) : null,
      }
    });

    // 5. Revalidación de Caché Estratégica
    revalidatePath("/opportunities");
    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${id}`);

    return { success: true, data: opportunity };
  } catch (error) {
    console.error("[UPDATE_OPPORTUNITY_ERROR]:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar la oportunidad"
    };
  }
}
