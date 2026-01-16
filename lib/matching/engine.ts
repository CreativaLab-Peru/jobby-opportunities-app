import { cleanText, getEmbedding, cosineSimilarity } from './utils';
import { Opportunity } from "@prisma/client";
import {CVAnalysis} from "@/features/math/types";

// 1. Scoring de Habilidades con Peso Diferenciado
function skillsOverlapScore(userSkills: string[], required: string[], optional: string[]): number {
  const uSet = new Set(userSkills.map(s => s.toLowerCase().trim()));

  // Scoring para requeridas (base del match)
  const reqMatch = required.length > 0
    ? required.filter(s => uSet.has(s.toLowerCase().trim())).length / required.length
    : 1.0;

  // Scoring para opcionales (bonus extra)
  const optMatch = optional.length > 0
    ? optional.filter(s => uSet.has(s.toLowerCase().trim())).length / optional.length
    : 0;

  // Las requeridas pesan un 80% del score de skills, las opcionales un 20%
  return (reqMatch * 0.8) + (optMatch * 0.2);
}

// 2. Validación de Requisitos de Negocio
function hardRequirementsScore(cv: CVAnalysis, opp: Opportunity): number {
  let score = 1.0;

  // Elegibilidad por País (Filtro Crítico)
  if (opp.eligibleCountries?.length > 0) {
    const hasCountry = cv.countries?.some(c => opp.eligibleCountries.includes(c));
    if (!hasCountry) score *= 0.2; // Penalización severa en lugar de resta fija
  }

  // Nivel de Experiencia (Seniority)
  if (opp.eligibleLevels?.length > 0 && cv.level) {
    const levelMatch = opp.eligibleLevels.some(l => l.toLowerCase() === cv.level?.toLowerCase());
    if (!levelMatch) score *= 0.7; // Penalización moderada
  }

  // Idioma
  if (opp.language && !cv.languages?.some(l => l.toLowerCase() === opp.language?.toLowerCase())) {
    score *= 0.5;
  }

  return score;
}

// 3. Función Principal de Scoring
export async function scoreOpportunity(cv: CVAnalysis, opp: Opportunity) {
  // Enriquecemos el texto de la oportunidad para el embedding
  const oppText = cleanText(`${opp.title} ${opp.description} ${opp.tags?.join(' ')}`);
  const cvText = cleanText(`${cv.summary} ${cv.experience_text} ${cv.skills.join(' ')}`);

  const [embCv, embOpp] = await Promise.all([
    getEmbedding(cvText),
    getEmbedding(oppText)
  ]);

  const semSim = (cosineSimilarity(embCv, embOpp) + 1) / 2;

  // Usamos el nuevo sistema de skills (requeridas vs opcionales)
  const skillsScore = skillsOverlapScore(cv.skills, opp.requiredSkills || [], opp.optionalSkills || []);

  const hardScore = hardRequirementsScore(cv, opp);

  /**
   * NUEVA DISTRIBUCIÓN DE PESOS:
   * 40% Semántica: Contexto general y "vibe" del CV.
   * 40% Skills: Es lo más tangible para el reclutador.
   * 20% Hard Requirements: Filtros de elegibilidad.
   */
  let finalScore = (0.40 * semSim) + (0.40 * skillsScore) + (0.20 * hardScore);

  // Bonus por Popularidad (pequeño empujón a oportunidades destacadas)
  if (opp.popularityScore > 0) {
    finalScore += Math.min(0.05, (opp.popularityScore / 1000));
  }

  return {
    opportunity_id: opp.id,
    title: opp.title,
    organization: opp.organization,
    match_score: Number(Math.min(1.0, finalScore).toFixed(4)),
    breakdown: {
      semantic: Number(semSim.toFixed(4)),
      skills: Number(skillsScore.toFixed(4)),
      eligibility: Number(hardScore.toFixed(4))
    },
    // Metadatos para el frontend
    details: {
      modality: opp.modality,
      deadline: opp.deadline,
      salary: opp.salaryRange,
      currency: opp.currency,
      url: opp.url,
      popularity: opp.popularityScore,
    }
  };
}
