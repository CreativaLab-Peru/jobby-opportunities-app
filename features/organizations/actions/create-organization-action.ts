"use server";

import { prisma } from "@/lib/prisma";
import { getCanonicalSkill } from "@/lib/matching/skills-utils";

export async function createOrganizationAction(name: string, logoUrl?: string){
  if (!name || name.trim().length < 2) {
    return { success: false, error: "El nombre es demasiado corto" };
  }

  try {
    // 1. Normalizamos el nombre (ej: "React.js" -> "react")
    const canonicalKey = getCanonicalSkill(name);
    const displayName = name.trim();

    // 2. Usamos upsert para evitar errores si dos usuarios crean la misma skill a la vez
    const skill = await prisma.organization.upsert({
      where: { key: canonicalKey },
      update: {}, // Si ya existe, no cambiamos nada
      create: {
        key: canonicalKey,
        name: displayName,
        logoUrl: logoUrl || null,
      },
    });

    return {
      success: true,
      data: {
        label: skill.name,
        value: skill.key,
      },
    };
  } catch (error) {
    console.error("[CREATE_SKILL_ACTION_ERROR]:", error);
    return { success: false, error: "Error al guardar la habilidad" };
  }
}
