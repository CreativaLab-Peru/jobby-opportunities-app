"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface AreaParams {
  page?: number;
  pageSize?: number;
  search?: string;
  orderBy?: "name" | "createdAt";
  orderDirection?: "asc" | "desc";
}

export interface GetAreasResponse {
  success: boolean;
  data: {
    value: string; // Usamos el ID o el Name según prefieras, aquí usaré el ID de Mongo
    label: string;
  }[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export async function getAreasAction(params: AreaParams): Promise<GetAreasResponse> {
  // 1. Sanitización de inputs (Ingeniería defensiva)
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, params.pageSize || 20);
  const skip = (page - 1) * pageSize;
  const search = params.search?.trim();

  const orderBy = params.orderBy || "name";
  const orderDirection = params.orderDirection || "asc";

  try {
    // 2. Construcción del filtro dinámico
    const where: Prisma.AreaWhereInput = search
      ? {
        name: { contains: search, mode: "insensitive" },
      }
      : {};

    // 3. Ejecución concurrente para máxima velocidad
    const [total, areas] = await Promise.all([
      prisma.area.count({ where }),
      prisma.area.findMany({
        where,
        take: pageSize,
        skip: skip,
        orderBy: {
          [orderBy]: orderDirection,
        },
      }),
    ]);

    return {
      success: true,
      data: areas.map((area) => ({
        value: area.key, // Identificador único de Mongo
        label: area.name,
      })),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("[GET_AREAS_ERROR]:", error);
    return {
      success: false,
      data: [],
      meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
    };
  }
}
