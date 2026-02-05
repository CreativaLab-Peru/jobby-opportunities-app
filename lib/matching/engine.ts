import { cleanText, getEmbedding, cosineSimilarity } from './utils';
import { Opportunity } from "@prisma/client";
import { CVAnalysis } from "@/features/math/types";

/**
 * Scoring de Habilidades con Lógica Difusa
 * Mejora: Escalado suave para no penalizar tanto matches parciales
 */
function skillsOverlapScore(
  userSkills: string[],
  required: string[],
  optional: string[]
): number {
  const uSet = new Set(userSkills.map(s => s.toLowerCase().trim()));

  // Skills Requeridas con umbral de aceptación
  let reqScore = 1.0;
  if (required.length > 0) {
    const matchedCount = required.filter(s =>
      uSet.has(s.toLowerCase().trim())
    ).length;
    const matchRatio = matchedCount / required.length;

    // Escalado suave: 50% de match ya da 0.7 de score
    // Esto hace que candidatos con mayoría de skills tengan buen score
    reqScore = matchRatio >= 0.5
      ? 0.7 + (matchRatio - 0.5) * 0.6  // [0.5-1.0] → [0.7-1.0]
      : matchRatio * 1.4;                // [0-0.5] → [0-0.7]
  }

  // Skills Opcionales (Bonus adicional hasta 15%)
  let optBonus = 0;
  if (optional.length > 0) {
    const matchedOpt = optional.filter(s =>
      uSet.has(s.toLowerCase().trim())
    ).length;
    optBonus = Math.min(0.15, (matchedOpt / optional.length) * 0.15);
  }

  return Math.min(1.0, reqScore + optBonus);
}

/**
 * Validación de Requisitos de Negocio
 * Mejora: Penalizaciones aditivas en lugar de multiplicativas
 */
function hardRequirementsScore(cv: CVAnalysis, opp: Opportunity): number {
  const score = 1.0;
  const penalties: number[] = [];

  // 1. Elegibilidad por País (Crítico pero no eliminatorio)
  if (opp.eligibleCountries?.length > 0) {
    const hasCountry = cv.countries?.some(c =>
      opp.eligibleCountries.includes(c)
    );
    if (!hasCountry) {
      penalties.push(0.15); // Penalización del 15% en lugar de 80%
    }
  }

  // 2. Nivel de Experiencia (Moderado)
  if (opp.eligibleLevels?.length > 0 && cv.level) {
    const levelMatch = opp.eligibleLevels.some(l =>
      l.toLowerCase() === cv.level?.toLowerCase()
    );
    if (!levelMatch) {
      penalties.push(0.10); // 10% de penalización en lugar de 30%
    }
  }

  // 3. Idioma (Moderado-Alto)
  if (opp.language && !cv.languages?.some(l =>
    l.toLowerCase() === opp.language?.toLowerCase()
  )) {
    penalties.push(0.12); // 12% de penalización en lugar de 50%
  }

  // Aplicamos las penalizaciones de forma aditiva
  const totalPenalty = penalties.reduce((sum, p) => sum + p, 0);
  return Math.max(0, score - totalPenalty);
}

/**
 * Función Principal de Scoring
 * Mejoras:
 * - Verificación de normalización del cosine similarity
 * - Pesos balanceados (35% skills, 35% semantic, 20% hard, 10% bonuses)
 * - Sistema de compensación para candidatos fuertes
 * - Logging para debugging
 */
export async function scoreOpportunity(cv: CVAnalysis, opp: Opportunity) {
  // Enriquecemos el texto de la oportunidad para el embedding
  const oppText = cleanText(
    `${opp.title} ${opp.description} ${opp.requiredSkills?.join(' ')}`
  );
  const cvText = cleanText(
    `${cv.summary} ${cv.experience_text} ${cv.skills.join(' ')}`
  );

  const [embCv, embOpp] = await Promise.all([
    getEmbedding(cvText),
    getEmbedding(oppText)
  ]);

  // IMPORTANTE: Verificar si tu cosineSimilarity ya retorna [0,1] o [-1,1]
  // Si ya está normalizado [0,1], NO aplicar la transformación
  const semSim = cosineSimilarity(embCv, embOpp);

  // Descomenta la siguiente línea SOLO si cosineSimilarity retorna [-1, 1]
  // semSim = (semSim + 1) / 2;

  // Usamos el nuevo sistema de skills mejorado
  const skillsScore = skillsOverlapScore(
    cv.skills,
    opp.requiredSkills || [],
    opp.optionalSkills || []
  );

  const hardScore = hardRequirementsScore(cv, opp);

  /**
   * NUEVA DISTRIBUCIÓN BALANCEADA:
   * 35% Skills: Lo más importante para recruiters
   * 35% Semántica: Contexto y fit cultural
   * 20% Hard Requirements: Filtros de elegibilidad
   * 10% Bonuses: Popularidad y compensaciones
   */
  let finalScore =
    (0.35 * skillsScore) +
    (0.35 * semSim) +
    (0.20 * hardScore);

  // Bonus por Popularidad (hasta 8% adicional)
  let popBonus = 0;
  if (opp.popularityScore > 0) {
    popBonus = Math.min(0.08, (opp.popularityScore / 500) * 0.08);
    finalScore += popBonus;
  }

  // Sistema de Compensación: Si el candidato es muy fuerte en skills
  // pero débil en elegibilidad, compensamos parcialmente
  let compensationBonus = 0;
  if (skillsScore > 0.8 && hardScore < 0.5) {
    compensationBonus = (skillsScore - 0.8) * 0.15; // Hasta 3% extra
    finalScore += compensationBonus;
  }

  // Bonus por semántica excepcional
  if (semSim > 0.85) {
    compensationBonus += 0.03;
    finalScore += 0.03;
  }

  // Cap en 100%
  finalScore = Math.min(1.0, finalScore);

  // Logging para debugging (útil en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MATCH] ${opp.title}:`, {
      semantic: semSim.toFixed(4),
      skills: skillsScore.toFixed(4),
      hard: hardScore.toFixed(4),
      popBonus: popBonus.toFixed(4),
      compensation: compensationBonus.toFixed(4),
      final: finalScore.toFixed(4)
    });
  }

  return {
    opportunity_id: opp.id,
    match_score: Number(finalScore.toFixed(4)),

    // Metadatos para el frontend
    breakdown: {
      semantic: Number(semSim.toFixed(4)),
      skills: Number(skillsScore.toFixed(4)),
      eligibility: Number(hardScore.toFixed(4))
    },

    // Detalles de la oportunidad
    details: {
      type: opp.type,
      title: opp.title,
      organization: opp.organization,
      organizationLogoUrl: opp.organizationLogoUrl,
      url: opp.url,
      description: opp.description,
      language: opp.language,
      ubication: opp.ubication,
      fieldOfStudy: opp.fieldOfStudy,

      modality: opp.modality,
      status: opp.status,

      eligibleLevels: opp.eligibleLevels,
      eligibleCountries: opp.eligibleCountries,

      requiredSkills: opp.requiredSkills,
      optionalSkills: opp.optionalSkills,

      salary: {
        min: opp.minSalary,
        max: opp.maxSalary,
        anual: opp.yearSalary,
        currency: opp.currency,
      },
      popularity: opp.popularityScore,

      deadline: opp.deadline,
    }
  };
}
