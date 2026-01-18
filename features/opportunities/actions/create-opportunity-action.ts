"use server";

import { prisma } from "@/lib/prisma";
import { generateSearchVector } from "@/lib/matching/utils";
import { getCanonicalSkill } from "@/lib/matching/skills-utils";
import { getSession } from "@/features/auth/actions/get-session";
import { revalidatePath } from "next/cache";
import {OpportunityFormValues} from "@/features/opportunities/schemas/opportunity.schema";
import {Modality, OpportunityType} from "@prisma/client";

export async function createOpportunityAction(body: OpportunityFormValues) {
  try {
    // 1. Verificación de Autenticación
    const session = await getSession();
    if (!session.success || !session.user) {
      return { success: false, error: 'No autorizado' };
    }

    const userId = session.user.id as string;

    // 2. Normalización de Skills y actualización del diccionario Tag (Master Data)
    const rawSkills = [
      ...(body.requiredSkills || []),
      ...(body.optionalSkills || []),
      ...(body.tags || [])
    ];

    const normalizedSkills = Array.from(new Set(rawSkills.map(getCanonicalSkill)));

    // Upsert masivo para asegurar que los tags existan en el sistema
    await Promise.all(
      normalizedSkills.map(skillName =>
        prisma.tag.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName, category: "skill" }
        })
      )
    );

    // 3. Preparación y Persistencia de la Data
    const opportunity = await prisma.opportunity.create({
      data: {
        type: body.type as OpportunityType,
        title: body.title,
        organization: body.organization,
        url: body.url || "",
        description: body.description,
        language: body.language || "ES",

        // Clasificación
        modality: body.modality as Modality,
        status: "ACTIVE",

        // Transformación de Arrays
        eligibleLevels: (body.eligibleLevels || []).map((l: string) => l.toUpperCase()),
        eligibleCountries: (body.eligibleCountries || []).map((c: string) => c.toUpperCase()),
        requiredSkills: (body.requiredSkills || []).map(getCanonicalSkill),
        optionalSkills: (body.optionalSkills || []).map(getCanonicalSkill),

        fieldOfStudy: body.fieldOfStudy || null,

        // Finanzas (Doble entrada para optimizar queries de rango)
        minSalary: body.salaryRange?.min ? parseFloat(body.salaryRange.min.toString()) : null,
        maxSalary: body.salaryRange?.max ? parseFloat(body.salaryRange.max.toString()) : null,
        currency: body.currency || "USD",

        // Vector de búsqueda para Matching Engine
        searchVector: generateSearchVector({
          title: body.title,
          description: body.description,
          organization: body.organization,
          skills: normalizedSkills
        }),

        deadline: body.deadline ? new Date(body.deadline) : null,
        userId,
      }
    });

    // 4. Invalidación de Cache
    // Esto asegura que la lista de oportunidades se actualice inmediatamente
    revalidatePath('/dashboard');
    revalidatePath('/opportunities');

    return { success: true, data: opportunity };

  } catch (error) {
    console.error('[CREATE_OPPORTUNITY_ACTION_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear la oportunidad'
    };
  }
}
