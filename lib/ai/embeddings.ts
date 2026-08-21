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

/**
 * Түлхүүрийн хэлбэрийг шалгана — дуудахаас ӨМНӨ.
 *
 * OpenAI-ийн түлхүүр «sk-» -ээр эхэлж, 100-аас урт байдаг. Хэрэглэгч
 * Vercel-ийн нүдэнд буулгахдаа хэсэгчлэн хуулах, эсвэл өөр зүйл
 * бичих нь элбэг. Тэр тохиолдолд OpenAI 401 буцаадаг ч бид үүнийг
 * урьдчилж, ойлгомжтой монголоор хэлж чадна.
 *
 * Утгыг НЬ ХЭЗЭЭ Ч буцаахгүй — зөвхөн асуудлын тайлбарыг.
 */
export function describeOpenAiKey(): string | null {
  const raw = process.env.OPENAI_API_KEY;

  if (raw === undefined) return "OPENAI_API_KEY тохируулаагүй байна.";

  const key = raw.trim();
  if (key === "") {
    return "OPENAI_API_KEY мөр үүссэн ч утга нь хоосон байна.";
  }
  if (!key.startsWith("sk-")) {
    return "OPENAI_API_KEY буруу байна: жинхэнэ түлхүүр «sk-» гэж эхэлдэг.";
  }
  if (key.length < 40) {
    return (
      `OPENAI_API_KEY дутуу байна: ${key.length} тэмдэгт байна, ` +
      "жинхэнэ түлхүүр 100-аас урт. Түлхүүрээ бүтнээр нь хуулж буулгана уу."
    );
  }

  return null;
}

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

/**
 * Олон текстийг нэг дуудлагаар, АЛДААНЫ ШАЛТГААНТАЙГААР.
 *
 * Сурагчид харагддаг замд алдааг чимээгүй залгих нь зөв — хайлт
 * түлхүүр үгээр үргэлжилнэ. Харин админ гараар «индекс шинэчлэх»
 * дархад ЯАГААД бүтэхгүй байгааг нь мэдэх ёстой. Тиймээс энэ
 * хувилбар шалтгааныг буцаана.
 */
export async function embedBatchDetailed(
  texts: string[],
): Promise<{ vectors: number[][] } | { error: string }> {
  const keyProblem = describeOpenAiKey();
  if (keyProblem) return { error: keyProblem };

  if (texts.length === 0) return { error: "Векторчлох текст алга." };

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!.trim()}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: texts.map((text) => text.slice(0, 8000)),
      }),
    });

    if (!response.ok) {
      /* OpenAI-ийн алдааг монгол тайлбартай нь хамт дамжуулна */
      let detail = "";
      try {
        const body = await response.json();
        detail = body?.error?.message ?? "";
      } catch {
        detail = await response.text().catch(() => "");
      }

      const hint: Record<number, string> = {
        401: "Түлхүүр буруу эсвэл хүчингүй болсон байна.",
        403: "Энэ түлхүүрт эрх алга.",
        429: "Хязгаар хэтэрсэн эсвэл данс дээр мөнгө дууссан байна. platform.openai.com → Billing хэсгийг шалгана уу.",
        404: "Загвар олдсонгүй — OPENAI_MODEL-ыг шалгана уу.",
      };

      return {
        error:
          `OpenAI ${response.status} алдаа. ` +
          (hint[response.status] ?? "") +
          (detail ? ` (${detail.slice(0, 220)})` : ""),
      };
    }

    const payload = await response.json();
    const items = payload.data;
    if (!Array.isArray(items)) {
      return { error: "OpenAI-аас хүлээгдээгүй хариу ирлээ." };
    }

    /* OpenAI дараалал хадгалдаг ч index-ээр нь эрэмбэлэх нь найдвартай */
    return {
      vectors: [...items]
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        .map((item) => item.embedding as number[]),
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `Сүлжээний алдаа: ${error.message}`
          : "Тодорхойгүй алдаа.",
    };
  }
}

/** Олон текстийг нэг дуудлагаар — үүсгэх ажилд хурдан. */
export async function embedBatch(texts: string[]): Promise<number[][] | null> {
  const result = await embedBatchDetailed(texts);
  return "vectors" in result ? result.vectors : null;
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
