import crypto from 'crypto';
import * as math from 'mathjs';

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
