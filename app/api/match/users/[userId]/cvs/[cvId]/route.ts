import {prisma} from "@/lib/prisma";
import {NextRequest, NextResponse} from "next/server";
import {scoreOpportunity} from "@/lib/matching/engine";
import {CVAnalysis, MatchRequest} from "@/features/math/types";
import {Modality, OpportunityType} from "@prisma/client";
import {MODALITIES, OPPORTUNITY_TYPES} from "@/consts";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string; cvId: string }> }
) {
  try {
    const {userId, cvId} = await context.params;
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
        {error: "CV data is required for matching"},
        {status: 400}
      );
    }

    const type = cvData.type;
    const OPPORTUNITY_TYPES_MAPPED = OPPORTUNITY_TYPES.flatMap(o=> o.value);
    if (type && !OPPORTUNITY_TYPES_MAPPED.includes(type)) {
      return NextResponse.json(
        {error: "Invalid CV type specified, it must be one of: " + OPPORTUNITY_TYPES_MAPPED.join(", ")},
        {status: 400}
      );
    }

    const modality = preferences.modality;
    const MODALITIES_MAPPED = MODALITIES.flatMap(m=> m.value);
    if (modality && !MODALITIES_MAPPED.includes(modality)) {
      return NextResponse.json(
        {error: "Invalid modality specified, it must be one of: " + MODALITIES_MAPPED.join(", ")},
        {status: 400}
      );
    }

    // 1. Filtrado inicial en Base de Datos (Eficiencia mejorada)
    const whereClause: any = {};

    // Filtro de fecha (solo si se especifica)
    if (filters?.exclude_expired) {
      whereClause.deadline = {gte: new Date()};
    }

    // Filtro de modalidad (solo si se especifica)
    if (preferences?.modality) {
      whereClause.modality = preferences.modality as Modality;
    }

    // Filtro de elegibilidad por ubicación (más flexible)
    // Ahora acepta matches parciales con OR en lugar de filtro estricto
    if (cvData?.location) {
      whereClause.eligibleCountries = {has: cvData.location};
    }

    // Filtro por tipo (solo si se especifica)
    if (cvData?.type) {
      whereClause.type = cvData.type as OpportunityType;
    }

    // Búsqueda optimizada con índices
    const opportunities = await prisma.opportunity.findMany({
      where: whereClause,
    });

    // Logging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MATCHING] Found ${opportunities.length} opportunities for user ${userId}`);
    }

    // 2. Scoring inteligente con procesamiento paralelo
    const results = await Promise.all(
      opportunities.map(async (o) => {
        const scoreData = await scoreOpportunity(cvData, o);

        // Ajustes post-scoring (más suaves que antes)
        let adjustedScore = scoreData.match_score;

        // Penalización por salario (más gradual)
        if (preferences?.min_salary && o?.minSalary) {
          const salaryGap = preferences.min_salary - o.minSalary;

          if (salaryGap > 0) {
            // Penalización gradual basada en % de diferencia
            const gapPercentage = salaryGap / preferences.min_salary;

            if (gapPercentage > 0.5) {
              // Más del 50% por debajo: penalización del 20%
              adjustedScore *= 0.80;
            } else if (gapPercentage > 0.3) {
              // 30-50% por debajo: penalización del 10%
              adjustedScore *= 0.90;
            } else {
              // Menos del 30%: penalización del 5%
              adjustedScore *= 0.95;
            }
          }
        }

        // Boost por salario atractivo (premium compensation)
        if (preferences?.min_salary && o?.maxSalary) {
          const salaryBoost = o.maxSalary - preferences.min_salary;

          if (salaryBoost > preferences.min_salary * 0.5) {
            // Salario 50%+ más alto que el mínimo: pequeño boost
            adjustedScore = Math.min(1.0, adjustedScore * 1.05);
          }
        }

        // Boost por urgencia (deadline cercano)
        if (o.deadline) {
          const daysUntilDeadline = Math.floor(
            (o.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          // Oportunidades con deadline en menos de 7 días: pequeño boost
          if (daysUntilDeadline > 0 && daysUntilDeadline <= 7) {
            adjustedScore = Math.min(1.0, adjustedScore * 1.03);
          }
        }

        return {
          ...scoreData,
          match_score: Number(Math.min(1.0, adjustedScore).toFixed(4))
        };
      })
    );

    // 3. Filtrado de resultados de calidad
    // Filtrar matches muy bajos (< 30%) a menos que no haya suficientes
    const qualityThreshold = 0.20;
    let filteredResults = results.filter(r => r.match_score >= qualityThreshold);

    // Si quedan muy pocos resultados, relajamos el threshold
    const minResults = preferences?.top_k || 5;
    if (filteredResults.length < minResults && results.length >= minResults) {
      // Tomar los mejores N aunque estén bajo el threshold
      filteredResults = results
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, minResults);
    }

    // 4. Ordenar y limitar resultados
    const sortedResults = filteredResults
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, preferences?.top_k || 5);

    // 5. Metadata adicional útil para el frontend
    const metadata = {
      total_opportunities_evaluated: opportunities.length,
      total_quality_matches: filteredResults.length,
      returned_matches: sortedResults.length,
      average_score: sortedResults.length > 0
        ? Number((sortedResults.reduce((sum, r) => sum + r.match_score, 0) / sortedResults.length).toFixed(4))
        : 0,
      filters_applied: {
        exclude_expired: filters?.exclude_expired || false,
        modality: preferences?.modality || 'ANY',
        location: cvData?.location || 'ANY',
        type: cvData?.type || 'ANY',
      }
    };

    // Logging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('[MATCHING_RESULTS]:', metadata);
    }

    // Full details con info de organización
    const resultsDetails = [];
    for (const match of sortedResults) {
      // Skill labels
      const requiredSkillKeys = match.details.requiredSkills;
      const optionalSkillKeys = match.details.optionalSkills;

      const requiredSkills = await prisma.skill.findMany({
        where: {key: {in: requiredSkillKeys}}
      })
      const optionalSkills = await prisma.skill.findMany({
        where: {key: {in: optionalSkillKeys}}
      })
      match.details.requiredSkills = requiredSkills.map(s=> s.name);
      match.details.optionalSkills = optionalSkills.map(s=> s.name);

      // Match opportunity
      if (!match.details.organization) continue;
      const org = await prisma.organization.findUnique({
        where: {key: match.details.organization}
      });
      if (!org) {
        continue;
      }
      resultsDetails.push({
        ...match,
        details: {
          ...match.details,
          organization_name: org.name,
          organization_logo: org.logoUrl || null
        }
      });
    }

    return NextResponse.json({
      user_id: userId,
      cv_id: cvId,
      matches: resultsDetails,
      metadata, // Info útil para debugging y analytics
    });

  } catch (error) {
    console.error("[ERROR_MATCHING_OPPORTUNITIES]:", error);

    // Logging más detallado en desarrollo
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      console.error("[ERROR_STACK]:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Error matching opportunities",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      {status: 500}
    );
  }
}
