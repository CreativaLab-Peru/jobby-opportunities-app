// lib/matching/skills-utils.ts

/**
 * Diccionario maestro categorizado para normalización multiaérea.
 * Esto permite que el motor escale a cualquier industria.
 */
const SKILL_ALIASES: Record<string, string> = {
  // --- TECH & DEV ---
  postgresql: "postgres",
  typescript: "ts",
  javascript: "js",
  amazonwebservices: "aws",
  artificialintelligence: "ai",
  machinelearning: "ml",
  reactjs: "react",
  nextjs: "next",
  tailwindcss: "tailwind",
  frontend: "frontend",
  backend: "backend",

  // --- DISEÑO & CREATIVIDAD ---
  adobephotoshop: "photoshop",
  adobeillustrator: "illustrator",
  userexperience: "ux",
  userinterface: "ui",
  productdesign: "productdesign",
  graphicdesign: "design",

  // --- MARKETING & BUSINESS ---
  searchengineoptimization: "seo",
  searchenginemarketing: "sem",
  googleads: "googleads",
  socialmediamarketing: "smm",
  customerrelationshipmanagement: "crm",
  businessintelligence: "bi",
  growthhacking: "growth",

  // --- FINANZAS & LEGAL ---
  financialanalysis: "finanzas",
  investmentbanking: "banking",
  corporatelegal: "legal",
  humanresources: "hr",
  talentacquisition: "recruitment",

  // --- SOFT SKILLS ---
  publicspeaking: "oratoria",
  teamleadership: "liderazgo",
  projectmanagement: "gestión",
  criticalthinking: "pensamiento_critico",
};

/**
 * Normaliza cualquier habilidad eliminando ruido y mapeando a su nombre canónico.
 */
export function getCanonicalSkill(rawSkill: string): string {
  if (!rawSkill) return "";

  // 1. Limpieza agresiva pero respetuosa con otros idiomas
  const normalized = rawSkill
    .toLowerCase()
    .trim()
    // Quita sufijos comunes de tech que ensucian el match
    .replace(/\.js$/i, "")
    .replace(/\.ts$/i, "")
    // Quita espacios, guiones, puntos y underscores para unificar "SEO" con "S.E.O." o "Search Engine Optimization"
    .replace(/[\s\-_.]/g, "")
    // Elimina caracteres especiales, dejando solo letras y números
    .replace(/[^\w]/g, "");

  // 2. Retorna el alias si existe, de lo contrario la versión normalizada
  return SKILL_ALIASES[normalized] || normalized;
}
