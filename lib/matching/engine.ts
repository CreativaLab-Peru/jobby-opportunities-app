import { cleanText, getEmbedding, cosineSimilarity } from './utils';
import {CVAnalysis} from "@/features/math/types";
import {Opportunity} from "@prisma/client";

function skillsOverlapScore(userSkills: string[], reqSkills: string[]): number {
  if (!reqSkills || reqSkills.length === 0) return 1.0;

  const uSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
  const rSet = reqSkills.map(s => s.toLowerCase().trim());

  const intersect = rSet.filter(s => uSet.has(s));
  const ratio = intersect.length / Math.max(1, rSet.length);

  const criticalBoost = (intersect.length > 0 && uSet.has(rSet[0])) ? 0.1 : 0;
  return Math.min(1.0, ratio + criticalBoost);
}

function hardRequirementsScore(cv: CVAnalysis, opp: Opportunity): number {
  let score = 1.0;

  // Países
  if (opp.eligibleCountries?.length) {
    const hasCountry = cv.countries?.some(c => opp.eligibleCountries?.includes(c));
    if (!hasCountry) score -= 0.5;
  }

  // Idioma
  if (opp.language && !cv.languages?.includes(opp.language)) {
    score -= 0.5;
  }

  // Experiencia (Regex simple equivalente)
  // if (opp.experience) {
  //   const reqYears = parseInt(opp.experience.match(/\d+/)?.[0] || "0");
  //   const userYears = parseInt(cvs.experience_text.match(/\d+/)?.[0] || "0");
  //   if (userYears < reqYears) score -= 0.3;
  // }

  return Math.max(0.0, Math.min(1.0, score));
}

export async function scoreOpportunity(cv: CVAnalysis, opp: Opportunity) {
  const cvText = cleanText(`${cv.summary} ${cv.experience_text}`);
  const oppText = cleanText(`${opp.title} ${opp.description}`);

  const [embCv, embOpp] = await Promise.all([
    getEmbedding(cvText),
    getEmbedding(oppText)
  ]);

  const semSim = (cosineSimilarity(embCv, embOpp) + 1) / 2;
  const skillsScore = skillsOverlapScore(cv.skills, opp.requiredSkills);
  const hardScore = hardRequirementsScore(cv, opp);

  const finalScore = (0.55 * semSim) + (0.30 * skillsScore) + (0.15 * hardScore);

  return {
    opportunity_id: opp.id,
    title: opp.title,
    match_score: Number(finalScore.toFixed(4)),
    components: {
      semantic_similarity: Number(semSim.toFixed(4)),
      skills_score: Number(skillsScore.toFixed(4)),
      hard_requirements: Number(hardScore.toFixed(4))
    }
  };
}
