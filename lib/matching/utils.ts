import crypto from 'crypto';
import * as math from 'mathjs';
import {getCanonicalSkill} from "@/lib/matching/skills-utils";

const EMBEDDING_DIM = 512;

export function cleanText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getEmbedding(text: string): Promise<number[]> {
  const content = text || "empty";
  const hash = crypto.createHash('sha256').update(content).digest();

  const embedding: number[] = [];
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    // Replicamos la expansión del hash de tu código Python
    const byte = hash[i % hash.length];
    embedding.push((byte / 255.0) * 2 - 1);
  }
  return embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = math.dot(a, b) as number;
  const normA = math.norm(a) as number;
  const normB = math.norm(b) as number;

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

interface VectorSource {
  title?: string;
  organization?: string;
  description?: string;
  skills?: string[];
  fieldOfStudy?: string;
}

/**
 * Genera un bloque de texto limpio y enriquecido para búsqueda semántica.
 */
export function generateSearchVector(source: {
  title?: string;
  organization?: string;
  description?: string;
  skills?: string[];
  fieldOfStudy?: string;
  type?: string;
}): string {
  // En multiaérea, el 'fieldOfStudy' y el 'type' son tan importantes como el título
  const components = [
    source.title,
    source.title, // Prioridad doble
    source.fieldOfStudy,
    source.fieldOfStudy, // Prioridad doble para becas/academia
    source.type,
    source.organization,
    source.skills?.map(getCanonicalSkill).join(" "),
    source.description
  ];

  return components
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/<[^>]*>?/gm, "") // Limpiar HTML de descripciones
    .replace(/[^\w\sáéíóúñ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
