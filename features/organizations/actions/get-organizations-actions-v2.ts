"use server";

import { prisma } from "@/lib/prisma";
import {Organization, Prisma} from "@prisma/client";

export interface OpportunityParams {
  page?: number;
  pageSize?: number;
  search?: string;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

// Interfaz para la respuesta estructurada
export interface GetOpportunityResponse {
  success: boolean;
  data: Organization[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export async function getOrganizationsActionsV2(params: OpportunityParams): Promise<GetOpportunityResponse> {
  // 1. Valores por defecto (Sanitización)
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, params.pageSize || 10); // Limitamos a 100 max por seguridad
  const skip = (page - 1) * pageSize;
  const search = params.search?.trim();

  // Validar campos permitidos para ordenar
  const allowedOrderFields = ["name", "key", "createdAt"];
  const orderByField = allowedOrderFields.includes(params.orderBy || "")
    ? params.orderBy
    : "name";

  try {
    // 2. Construcción dinámica del filtro 'where'
    const where: Prisma.OrganizationWhereInput = search
      ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { key: { contains: search, mode: "insensitive" } },
        ],
      }
      : {};

    // 3. Ejecución de consultas en paralelo (Performance)
    // Ejecutamos el conteo y la data al mismo tiempo para ahorrar latencia
    const [total, organizations] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.findMany({
        where,
        take: pageSize,
        skip: skip,
        orderBy: {
          [orderByField as string]: params.orderDirection || "asc",
        }
      }),
    ]);

    return {
      success: true,
      data: organizations,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("[GET_SKILLS_ERROR]:", error);
    return {
      success: false,
      data: [],
      meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
    };
  }
}
