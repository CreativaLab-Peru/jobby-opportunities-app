"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/features/auth/actions/get-session";
import { generateSearchVector } from "@/lib/matching/utils";
import { getCanonicalSkill } from "@/lib/matching/skills-utils";

/**
 * Actualiza una oportunidad existente con validación de autoría.
 */
export async function updateOpportunityAction(id: string, body: any) {
  try {
    const session = await getSession();
    if (!session.success || !session.user) {
      return { success: false, error: "No autorizado" };
    }

    // 1. Verificar que la oportunidad existe y pertenece al usuario
    const existing = await prisma.opportunity.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) return { success: false, error: "Oportunidad no encontrada" };
    if (existing.userId !== session.user.id) {
      return { success: false, error: "No tienes permiso para editar esta oportunidad" };
    }

    // 2. Normalización de Skills (igual que en el create)
    const rawSkills = [
      ...(body.requiredSkills || []),
      ...(body.optionalSkills || []),
      ...(body.tags || [])
    ];
    const normalizedSkills = Array.from(new Set(rawSkills.map(getCanonicalSkill)));

    // 3. Preparación de datos para la actualización
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        type: body.type,
        title: body.title,
        organization: body.organization,
        url: body.url || "",
        description: body.description,
        language: body.language || "ES",
        modality: body.modality || "ON_SITE",

        // Transformación de Arrays y Enums
        eligibleLevels: (body.eligibleLevels || []).map((l: string) => l.toUpperCase()),
        eligibleCountries: (body.eligibleCountries || []).map((c: string) => c.toUpperCase()),
        requiredSkills: (body.requiredSkills || []).map(getCanonicalSkill),
        optionalSkills: (body.optionalSkills || []).map(getCanonicalSkill),

        fieldOfStudy: body.fieldOfStudy || null,

        // Finanzas (Doble entrada para filtros rápidos)
        minSalary: body.salaryRange?.min ? parseFloat(body.salaryRange.min.toString()) : null,
        maxSalary: body.salaryRange?.max ? parseFloat(body.salaryRange.max.toString()) : null,
        currency: body.currency || "USD",

        // Re-generar vector de búsqueda por si cambió el título/descripción
        searchVector: generateSearchVector({
          title: body.title,
          description: body.description,
          organization: body.organization,
          skills: normalizedSkills
        }),

        deadline: body.deadline ? new Date(body.deadline) : null,
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/opportunities/${id}`);

    return { success: true, data: opportunity };
  } catch (error) {
    console.error("[UPDATE_OPPORTUNITY_ERROR]:", error);
    return { success: false, error: "Error al actualizar la oportunidad" };
  }
}
