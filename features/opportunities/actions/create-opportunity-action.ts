"use server";

import { prisma } from "@/lib/prisma";
import { generateSearchVector } from "@/lib/matching/utils";
import { getCanonicalSkill } from "@/lib/matching/skills-utils";
import { getSession } from "@/features/auth/actions/get-session";
import { revalidatePath } from "next/cache";
import { OpportunityFormValues } from "@/features/opportunities/schemas/opportunity.schema";
import { Modality, OpportunityType } from "@prisma/client";

// Añadimos un parámetro opcional id para manejar ediciones
export async function upsertOpportunityAction(body: OpportunityFormValues, id?: string) {
  try {
    // 1. Verificación de Autenticación
    const session = await getSession();
    if (!session.success || !session.user) {
      return { success: false, error: 'No autorizado' };
    }

    const userId = session.user.id as string;

    // 2. Normalización de Skills
    const rawSkills = [
      ...(body.requiredSkills || []),
      ...(body.optionalSkills || []),
      ...(body.tags || [])
    ];
    const normalizedSkills = Array.from(new Set(rawSkills.map(getCanonicalSkill)));

    // Upsert de Tags (Master Data)
    await Promise.all(
      normalizedSkills.map(skillName =>
        prisma.tag.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName, category: "skill" }
        })
      )
    );

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

    // 3. Preparación del objeto de datos (Mapeo Schema -> Prisma)
    const opportunityData = {
      type: body.type as OpportunityType,
      title: body.title,
      organization: body.organization,
      organizationLogoUrl: body.organizationLogoUrl || null,
      url: body.url || "",
      description: body.description,
      language: body.language || "ES",
      ubication: body.location || null, // Mapeo correcto a Prisma
      fieldOfStudy: body.area || null,   // Mapeo correcto a Prisma

      modality: (body.modality as Modality) || "ON_SITE",

      // Transformación de Arrays
      eligibleLevels: (body.eligibleLevels || []).map(l => l.toUpperCase()),
      eligibleCountries: (body.eligibleCountries || []).map(c => c.toUpperCase()),
      requiredSkills: (body.requiredSkills || []).map(getCanonicalSkill),
      optionalSkills: (body.optionalSkills || []).map(getCanonicalSkill),

      // Finanzas
      minSalary: body.salaryRange?.min ?? null,
      maxSalary: body.salaryRange?.max ?? null,
      yearSalary: body.yearSalary ?? null,
      currency: body.currency || "USD",

      searchVector: generateSearchVector({
        title: body.title,
        description: body.description,
        organization: body.organization,
        skills: normalizedSkills
      }),

      deadline: body.deadline ? new Date(body.deadline) : null,
      userId,
    };

    // 4. Persistencia (Create o Update)
    let opportunity;
    if (id) {
      // Verificamos que la oportunidad pertenezca al usuario antes de editar
      opportunity = await prisma.opportunity.update({
        where: { id, userId }, // Seguridad: Solo el dueño edita
        data: opportunityData,
      });
    } else {
      opportunity = await prisma.opportunity.create({
        data: {
          ...opportunityData,
          status: "ACTIVE",
        },
      });
    }

    // 5. Invalida rutas para reflejar cambios
    revalidatePath('/opportunities');
    if (id) revalidatePath(`/opportunities/${id}`);

    return { success: true, data: opportunity };

  } catch (error) {
    console.error('[UPSERT_OPPORTUNITY_ACTION_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al procesar la oportunidad'
    };
  }
}
