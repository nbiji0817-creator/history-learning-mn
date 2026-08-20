import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { KnowledgeHit } from "./knowledge";

/**
 * ОЙЛГОЛТЫН ХАЙЛТ (semantic search)
 *
 * Түлхүүр үгийн хайлт нь ижил үг ашигласан үед л ажилладаг. Embedding нь
 * текстийн утгыг вектор болгодог тул өөр үгээр асуусан ч олдоно.
 *
 * ЗААВАЛ БИШ. Дараах бүх тохиолдолд систем түлхүүр үгийн хайлтаар
 * хэвийн ажиллана:
 *   • OPENAI_API_KEY байхгүй
 *   • 0005_embeddings.sql ажиллуулаагүй
 *   • Embedding үүсгээгүй
 *   • Сүлжээ тасарсан
 */

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

/** Текстийг вектор болгоно. Түлхүүр байхгүй бол null. */
export async function embed(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text.slice(0, 8000),
      }),
    });

    if (!response.ok) return null;

    const payload = await response.json();
    const vector = payload.data?.[0]?.embedding;

    return Array.isArray(vector) ? (vector as number[]) : null;
  } catch {
    return null;
  }
}

/** Олон текстийг нэг дуудлагаар — үүсгэх ажилд хурдан. */
export async function embedBatch(texts: string[]): Promise<number[][] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || texts.length === 0) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: texts.map((text) => text.slice(0, 8000)),
      }),
    });

    if (!response.ok) return null;

    const payload = await response.json();
    const items = payload.data;
    if (!Array.isArray(items)) return null;

    /* OpenAI дараалал хадгалдаг ч index-ээр нь эрэмбэлэх нь найдвартай */
    return [...items]
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .map((item) => item.embedding as number[]);
  } catch {
    return null;
  }
}

/**
 * Утгаараа ойр агуулгыг хайна.
 * Ямар нэг зүйл бүтэлгүйтвэл хоосон массив — дуудагч түлхүүр үгийн
 * хайлтаар үргэлжлүүлнэ.
 */
export async function semanticSearch(
  query: string,
  limit = 6,
): Promise<KnowledgeHit[]> {
  const vector = await embed(query);
  if (!vector) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("match_content", {
      query_embedding: vector,
      match_count: limit,
      min_similarity: 0.25,
    });

    if (error || !Array.isArray(data)) return [];

    return (data as Record<string, unknown>[]).map((row) => ({
      kind: String(row.kind ?? "lesson") as KnowledgeHit["kind"],
      title: String(row.title ?? ""),
      body: String(row.content ?? ""),
      href: String(row.href ?? ""),
      /* Ижил төстэй байдлыг түлхүүр үгийн оноотой ойролцоо хэмжээнд авчирна */
      score: Math.round(Number(row.similarity ?? 0) * 40 * 10) / 10,
    }));
  } catch {
    return [];
  }
}

/** Индекслэгдсэн баримтын тоо — админы самбарт. */
export async function getEmbeddingStatus(): Promise<{
  total: number;
  lastUpdated: string | null;
  available: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("embedding_status");

    if (error || !Array.isArray(data) || data.length === 0) {
      return { total: 0, lastUpdated: null, available: false };
    }

    const row = data[0] as Record<string, unknown>;
    return {
      total: Number(row.total ?? 0),
      lastUpdated: row.last_updated ? String(row.last_updated) : null,
      available: true,
    };
  } catch {
    return { total: 0, lastUpdated: null, available: false };
  }
}

/**
 * Түлхүүр үг ба утгын хайлтын үр дүнг нэгтгэнэ (hybrid search).
 *
 * Хоёр арга өөр давуу талтай:
 *   • түлхүүр үг — яг нэр, он цаг олоход хүчтэй
 *   • утга      — өөр үгээр асуусныг олоход хүчтэй
 *
 * Давхардсаныг нэгтгэж, оноог нь нэмнэ — хоёуланд нь олдсон нь
 * хамгийн найдвартай.
 */
export function mergeHits(
  keyword: KnowledgeHit[],
  semantic: KnowledgeHit[],
  limit = 6,
): KnowledgeHit[] {
  const byHref = new Map<string, KnowledgeHit>();

  for (const hit of keyword) {
    byHref.set(hit.href, { ...hit });
  }

  for (const hit of semantic) {
    const existing = byHref.get(hit.href);
    if (existing) {
      /* Хоёуланд нь олдсон — итгэл нэмэгдэнэ */
      existing.score = Math.round((existing.score + hit.score * 0.6) * 10) / 10;
    } else {
      byHref.set(hit.href, { ...hit });
    }
  }

  return [...byHref.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
