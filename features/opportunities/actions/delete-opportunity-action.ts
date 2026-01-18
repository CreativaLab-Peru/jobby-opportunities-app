"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/features/auth/actions/get-session";

/**
 * Elimina una oportunidad con validación de autoría.
 */
export async function deleteOpportunityAction(id: string) {
  try {
    const session = await getSession();
    if (!session.success || !session.user) {
      return { success: false, error: "No autorizado" };
    }

    // 1. Verificar pertenencia antes de borrar
    const existing = await prisma.opportunity.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) return { success: false, error: "Oportunidad no encontrada" };
    if (existing.userId !== session.user.id) {
      return { success: false, error: "No tienes permiso para eliminar esta oportunidad" };
    }

    await prisma.opportunity.delete({
      where: { id }
    });

    revalidatePath("/opportunities");
    return { success: true, message: "Eliminada exitosamente" };
  } catch (error) {
    console.error("[DELETE_OPPORTUNITY_ERROR]:", error);
    return { success: false, error: "Error al eliminar la oportunidad" };
  }
}
