import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { scoreOpportunity } from "@/lib/matching/engine";
import {CVAnalysis, MatchRequest} from "@/features/math/types";
import {Modality, OpportunityType} from "@prisma/client";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string; cvId: string }> }
) {
  try {
    const { userId, cvId } = await context.params;
    const body = await req.json();

    // Asignamos objetos vacíos por defecto para evitar errores de "undefined"
    const {
      cv_data: cvData = {} as CVAnalysis,
      preferences = {},
      filters = {}
    } = body as MatchRequest;

    // 0. Validaciones básicas
    if (!cvData || Object.keys(cvData).length === 0) {
      return NextResponse.json(
        { error: "CV data is required for matching" },
        { status: 400 }
      );
    }

    // 1. Filtrado inicial en Base de Datos (Eficiencia)
    const opportunities = await prisma.opportunity.findMany({
      where: {
        // 1. Filtro de fecha
        deadline: filters?.exclude_expired ? { gte: new Date() } : undefined,

        // 2. Filtro de modalidad (Casting automático si usas el Enum en el esquema)
        modality: preferences?.modality as Modality,

        // 3. Filtro de elegibilidad (Ubicación)
        eligibleCountries: cvData?.location ? { has: cvData.location } : undefined,

        // 4. Filtro por tipo (Aquí el cast es vital para que Prisma lo acepte)
        type: cvData?.type ? (cvData.type as OpportunityType) : undefined,
      },
    });

    // 2. Scoring inteligente
    const results = await Promise.all(
      opportunities.map(async (o) => {
        const scoreData = await scoreOpportunity(cvData, o);

        // Ajuste manual: Penalizar si el salario no llega al mínimo
        // Verificamos que exista tanto la preferencia como el dato en la oportunidad
        if (
          preferences?.min_salary &&
          o?.minSalary && o?.minSalary < preferences.min_salary
        ) {
          scoreData.match_score *= 0.8;
        }
        return scoreData;
      })
    );

    const sortedResults = results
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, preferences?.top_k || 5);

    return NextResponse.json({
      user_id: userId,
      cv_id: cvId,
      matches: sortedResults,
    });

  } catch (error) {
    console.error("[ERROR_MATCHING_OPPORTUNITIES]:", error);
    return NextResponse.json(
      { error: "Error matching opportunities" },
      { status: 500 }
    );
  }
}
