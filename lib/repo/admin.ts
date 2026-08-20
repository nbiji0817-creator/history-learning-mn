import "server-only";
import type { Lesson, Question } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { mapLesson, mapQuestion } from "./mappers";

/**
 * АДМИНЫ ӨГӨГДӨЛ
 *
 * Энгийн `lib/repo/index.ts` нь зөвхөн НИЙТЭЛСЭН агуулгыг буцаадаг.
 * Админ/багш нь ноорог хичээлээ ч харах шаардлагатай тул тусад нь.
 *
 * RLS нь нийтлээгүй хичээлийг зөвхөн багш/админд харуулна — иймд энэ
 * функцууд нь эрхгүй хүнд хоосон жагсаалт буцаана.
 */

type Row = Record<string, unknown>;

function sectionsOf(row: Row): Row[] {
  if (!Array.isArray(row.lesson_sections)) return [];
  return [...(row.lesson_sections as Row[])].sort(
    (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0),
  );
}

/** Ноорог болон нийтэлсэн бүх хичээл. */
export async function getAllLessonsForAdmin(): Promise<Lesson[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("*, lesson_sections(*)")
      .order("grade")
      .order("order");

    if (error || !data) return [];
    return (data as Row[]).map((row) => mapLesson(row, sectionsOf(row)));
  } catch {
    return [];
  }
}

export async function getLessonByIdForAdmin(id: string): Promise<Lesson | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("*, lesson_sections(*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    const row = data as Row;
    return mapLesson(row, sectionsOf(row));
  } catch {
    return null;
  }
}

export async function getAllQuestionsForAdmin(): Promise<Question[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error || !data) return [];
    return (data as Row[]).map(mapQuestion);
  } catch {
    return [];
  }
}

export async function getQuestionByIdForAdmin(
  id: string,
): Promise<Question | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return mapQuestion(data as Row);
  } catch {
    return null;
  }
}
