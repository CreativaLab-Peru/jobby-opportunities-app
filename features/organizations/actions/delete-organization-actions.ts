import {prisma} from "@/lib/prisma";

export async function deleteOrganizationAction(key: string) {
  try {
    await prisma.organization.delete({ where: { key } });
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar" };
  }
}
