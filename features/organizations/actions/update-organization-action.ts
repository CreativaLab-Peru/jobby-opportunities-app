import {getCanonicalSkill} from "@/lib/matching/skills-utils";
import {prisma} from "@/lib/prisma";

export async function updateOrganizationAction(id: string, newName: string, logoImageUrl?: string) {
  try {
    const newKey = getCanonicalSkill(newName);
    const updated = await prisma.organization.update({
      where: { id },
      data: { name: newName.trim(), key: newKey, logoUrl: logoImageUrl },
    });
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Error al actualizar" };
  }
}

