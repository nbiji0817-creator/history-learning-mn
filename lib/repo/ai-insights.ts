import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * AI-ИЙН СУРАХ ГОГЦОО — БАГШИД ЗОРИУЛСАН ТАЙЛАН
 *
 * AI юуг мэдэхгүй байгаа, ямар хариулт тусгүй байсныг харуулна.
 * Багш эдгээрт хичээл/асуулт нэмэхэд систем сайжирна.
 *
 * `ai_questions` хүснэгт байхгүй (0004 migration ажиллуулаагүй) бол
 * хоосон буцаана — админы самбар алдаагүй ажиллах ёстой.
 */

export interface ContentGap {
  question: string;
  timesAsked: number;
  lastAsked: string;
  avgScore: number;
}

export interface AiStats {
  total: number;
  unmatched: number;
  helpful: number;
  unhelpful: number;
  available: boolean;
}

export async function getAiStats(): Promise<AiStats> {
  const empty: AiStats = {
    total: 0,
    unmatched: 0,
    helpful: 0,
    unhelpful: 0,
    available: false,
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ai_questions")
      .select("matched, rating")
      .limit(5000);

    if (error || !data) return empty;

    const rows = data as { matched: boolean; rating: number | null }[];

    return {
      total: rows.length,
      unmatched: rows.filter((row) => !row.matched).length,
      helpful: rows.filter((row) => row.rating === 1).length,
      unhelpful: rows.filter((row) => row.rating === -1).length,
      available: true,
    };
  } catch {
    return empty;
  }
}

/** Хамгийн олон удаа асуусан боловч хариулт олдоогүй асуултууд. */
export async function getContentGaps(limit = 30): Promise<ContentGap[]> {
  try {
    const supabase = await createClient();

    /* SQL функц байвал түүнийг ашиглана — бүлэглэлт дата санд илүү хурдан */
    const { data, error } = await supabase.rpc("ai_content_gaps", {
      p_limit: limit,
    });

    if (!error && Array.isArray(data)) {
      return (data as Record<string, unknown>[]).map((row) => ({
        question: String(row.question ?? ""),
        timesAsked: Number(row.times_asked ?? 0),
        lastAsked: String(row.last_asked ?? ""),
        avgScore: Number(row.avg_score ?? 0),
      }));
    }

    return [];
  } catch {
    return [];
  }
}

/** Сүүлд асуусан асуултууд — AI-г хэрхэн ашиглаж байгааг харах. */
export async function getRecentQuestions(limit = 40) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ai_questions")
      .select("id, question, mode, matched, top_match, top_score, rating, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      question: String(row.question ?? ""),
      mode: String(row.mode ?? "ask"),
      matched: Boolean(row.matched),
      topMatch: row.top_match ? String(row.top_match) : null,
      topScore: Number(row.top_score ?? 0),
      rating: row.rating === null ? null : Number(row.rating),
      createdAt: String(row.created_at ?? ""),
    }));
  } catch {
    return [];
  }
}

export type RecentQuestion = Awaited<
  ReturnType<typeof getRecentQuestions>
>[number];
