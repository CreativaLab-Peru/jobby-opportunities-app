"use server";

import { prisma } from "@/lib/prisma";

/**
 * 1. MÉTTRICAS DE DISPONIBILIDAD
 */
export async function getInventoryKPIs() {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const [totalActive, typeDistribution, expiringSoon, areaCoverage] = await Promise.all([
    // Volumen Total Activo
    prisma.opportunity.count({ where: { status: "ACTIVE" } }),

    // Balance de Tipos
    prisma.opportunity.groupBy({
      by: ['type'],
      where: { status: "ACTIVE" },
      _count: { _all: true }
    }),

    // Índice de Caducidad (Próximos 7 días)
    prisma.opportunity.count({
      where: {
        status: "ACTIVE",
        deadline: { lte: nextWeek, gte: now }
      }
    }),

    // Cobertura de Áreas
    prisma.opportunity.groupBy({
      by: ['fieldOfStudy'],
      where: { status: "ACTIVE" },
      _count: { _all: true }
    })
  ]);

  return { totalActive, typeDistribution, expiringSoon, areaCoverage };
}

/**
 * 2. ANÁLISIS DE SKILLS
 */
export async function getSkillsAnalytics() {
  // Para MongoDB, el manejo de arrays requiere un approach manual o agregaciones complejas
  // Aquí traemos los arrays de habilidades de oportunidades activas
  const opportunities = await prisma.opportunity.findMany({
    where: { status: "ACTIVE" },
    select: { requiredSkills: true, optionalSkills: true }
  });

  const skillCounts: Record<string, number> = {};
  const usedSkillKeys = new Set<string>();

  opportunities.forEach(opp => {
    opp.requiredSkills.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      usedSkillKeys.add(skill);
    });
  });

  // Top 10 Required Skills
  const topSkills = Object.entries(skillCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Skills Huérfanas (Existen en Skill pero no en oportunidades activas)
  const allSkills = await prisma.skill.findMany({ select: { key: true } });
  const orphanSkillsCount = allSkills.filter(s => !usedSkillKeys.has(s.key)).length;

  return {
    topSkills,
    orphanSkillsCount,
    totalSkillsInCatalog: allSkills.length
  };
}

/**
 * 3. SALUD DE LA MASTER DATA
 */
export async function getMasterDataHealth() {
  const [opportunities, totalOrgs, orgsWithLogo] = await Promise.all([
    prisma.opportunity.findMany({
      select: { organization: true, fieldOfStudy: true, eligibleCountries: true }
    }),
    prisma.organization.count(),
    prisma.organization.count({ where: { NOT: { logoUrl: null } } })
  ]);

  const orgKeys = (await prisma.organization.findMany({ select: { key: true } })).map(o => o.key);
  const orgKeysSet = new Set(orgKeys);

  let anonymousOrgs = 0;
  let emptyAreas = 0;
  const uniqueCountries = new Set<string>();

  opportunities.forEach(opp => {
    if (opp.organization && !orgKeysSet.has(opp.organization)) anonymousOrgs++;
    if (!opp.fieldOfStudy) emptyAreas++;
    opp.eligibleCountries.forEach(c => uniqueCountries.add(c));
  });

  return {
    anonymousOrgs,
    visualIdentityRate: totalOrgs > 0 ? (orgsWithLogo / totalOrgs) * 100 : 0,
    geographicDiversity: uniqueCountries.size,
    emptyAreasCount: emptyAreas
  };
}

/**
 * 4. INTELIGENCIA DE MATCHING
 */
export async function getMatchingIntelligence() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [avgPopularity, matchDensity, recentTags] = await Promise.all([
    prisma.opportunity.aggregate({
      _avg: { popularityScore: true }
    }),
    prisma.opportunityCache.count(),
    prisma.tag.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    })
  ]);

  return {
    avgPopularity: avgPopularity._avg.popularityScore || 0,
    matchDensity,
    recentTags
  };
}
