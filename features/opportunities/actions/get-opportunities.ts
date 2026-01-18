"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/features/auth/actions/get-session";
import {Prisma, Opportunity, Modality, OpportunityType} from "@prisma/client";

export interface GetOpportunitiesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  types?: string[];
  levels?: string[];
  countries?: string[];
  modality?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMetadata {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type GetOpportunitiesResponse =
  | { success: true; data: Opportunity[]; pagination: PaginationMetadata }
  | { success: false; error: string; data: never[]; pagination: null };

export async function getOpportunities(
  params: GetOpportunitiesParams
): Promise<GetOpportunitiesResponse> { // Retorno tipado
  try {
    const session = await getSession();

    // Verificación de sesión con tipado
    if (!session.success || !session.user?.id) {
      return {
        success: false,
        error: "No autorizado",
        data: [],
        pagination: null
      };
    }

    const {
      page = 1,
      pageSize = 10,
      search,
      types,
      levels,
      countries,
      modality,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * pageSize;

    // Filtro con validación de esquema de Prisma
    const where: Prisma.OpportunityWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtros específicos
    if (types?.length) where.type = { in: types as OpportunityType[] }; // Cast a any si el enum de Prisma da problemas
    if (levels?.length) where.eligibleLevels = { hasSome: levels };
    if (countries?.length) where.eligibleCountries = { hasSome: countries };
    if (modality) where.modality = modality as Modality;

    // 5. Ejecución concurrente
    const [items, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.opportunity.count({ where }),
    ]);

    return {
      success: true,
      data: items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("[GET_OPPORTUNITIES_ACTION]:", error);
    return {
      success: false,
      error: "Error interno al obtener oportunidades",
      data: [],
      pagination: null
    };
  }
}
