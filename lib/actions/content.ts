"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth-server";
import type { Difficulty, EraKey, GradeNumber, QuestionType } from "@/types";

/**
 * АГУУЛГЫН CMS — СЕРВЕРИЙН ҮЙЛДЭЛ
 *
 * Аюулгүй байдал хоёр давхаргатай:
 *
 *   1. Энд: багш/админ эсэхийг шалгана (доорх `assertStaff`)
 *   2. RLS: `createClient()` нь хэрэглэгчийн session-ыг ашигладаг тул
 *      дата сан өөрөө эрхийг дахин шалгана. Хэрэв энэ файлын шалгалт
 *      алдаа гаргасан ч RLS зогсооно.
 *
 * Service role client-ыг ЭНД АШИГЛАХГҮЙ — тэр нь RLS-ыг тойрох тул
 * хоёр дахь давхарга алга болно.
 */

export interface ActionResult {
  error: string | null;
  id?: string;
}

async function assertStaff(): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();

  if (!user) return { ok: false, error: "Нэвтрээгүй байна." };
  if (user.profile.role !== "teacher" && user.profile.role !== "admin") {
    return { ok: false, error: "Танд агуулга засах эрх алга." };
  }
  return { ok: true };
}

/* ─────────────────────────  Туслах  ───────────────────────── */

/** Кирилл гарчгийг латин slug болгоно. */
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "ye", ё: "yo", ж: "j", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "u", п: "p",
  р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "kh", ц: "ts", ч: "ch",
  ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export async function slugify(value: string): Promise<string> {
  return (
    [...value.toLowerCase()]
      .map((char) => TRANSLIT[char] ?? char)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "") || "khicheel"
  );
}

/** Мөр бүрийг тусад нь — хоосон мөрийг хаяна. */
function lines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function commaList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/* ─────────────────────────  Хичээл  ───────────────────────── */

export interface LessonSectionInput {
  type: "text" | "keypoints" | "concepts";
  title: string;
  /** type=text */
  body?: string;
  /** type=keypoints — мөр бүр нэг санаа */
  points?: string;
  /** type=concepts — «нэр томьёо :: тайлбар» хэлбэрээр мөр бүрд */
  concepts?: string;
}

export interface LessonInput {
  id?: string;
  slug: string;
  grade: GradeNumber;
  order: number;
  title: string;
  subtitle: string;
  icon: string;
  summary: string;
  objectives: string;
  durationMinutes: number;
  difficulty: Difficulty;
  tags: string;
  conclusion: string;
  published: boolean;
  sections: LessonSectionInput[];
}

function buildSectionRows(lessonId: string, sections: LessonSectionInput[]) {
  return sections
    .filter((section) => section.title.trim())
    .map((section, index) => {
      const content: Record<string, unknown> = {};

      if (section.type === "keypoints") {
        content.points = lines(section.points ?? "");
      }

      if (section.type === "concepts") {
        content.concepts = lines(section.concepts ?? "")
          .map((line) => {
            const [term, ...rest] = line.split("::");
            return {
              term: term.trim(),
              definition: rest.join("::").trim(),
            };
          })
          .filter((item) => item.term && item.definition);
      }

      return {
        lesson_id: lessonId,
        order: index + 1,
        type: section.type,
        title: section.title.trim(),
        body: section.type === "text" ? (section.body ?? "").trim() : null,
        content,
      };
    });
}

export async function saveLesson(input: LessonInput): Promise<ActionResult> {
  const guard = await assertStaff();
  if (!guard.ok) return { error: guard.error! };

  if (!input.title.trim()) return { error: "Гарчиг оруулна уу." };
  if (!input.slug.trim()) return { error: "Slug оруулна уу." };

  try {
    const supabase = await createClient();

    const row = {
      slug: input.slug.trim(),
      grade: input.grade,
      order: input.order,
      title: input.title.trim(),
      subtitle: input.subtitle.trim(),
      icon: input.icon.trim() || "📘",
      summary: input.summary.trim(),
      objectives: lines(input.objectives),
      duration_minutes: input.durationMinutes,
      difficulty: input.difficulty,
      tags: commaList(input.tags),
      conclusion: input.conclusion.trim(),
      ai_prompts: [
        `«${input.title.trim()}» сэдвийг ойлгомжтой тайлбарлаж өгөөч`,
        `Намайг «${input.title.trim()}» сэдвээр шалгаад үзээч`,
      ],
      external_links: [],
      published: input.published,
    };

    let lessonId = input.id;

    if (lessonId) {
      const { error } = await supabase
        .from("lessons")
        .update(row)
        .eq("id", lessonId);
      if (error) return { error: `Хадгалахад алдаа: ${error.message}` };
    } else {
      const { data, error } = await supabase
        .from("lessons")
        .insert(row)
        .select("id")
        .single();
      if (error) return { error: `Үүсгэхэд алдаа: ${error.message}` };
      lessonId = data.id as string;
    }

    /* Блокуудыг бүтнээр нь солино — дараалал, устгалыг зэрэг зохицуулна */
    await supabase.from("lesson_sections").delete().eq("lesson_id", lessonId);

    const sectionRows = buildSectionRows(lessonId!, input.sections);
    if (sectionRows.length > 0) {
      const { error } = await supabase.from("lesson_sections").insert(sectionRows);
      if (error) return { error: `Блок хадгалахад алдаа: ${error.message}` };
    }

    revalidatePath("/admin/lessons");
    revalidatePath("/grades");
    revalidatePath(`/grades/${input.grade}`);
    revalidatePath(`/lessons/${row.slug}`);

    return { error: null, id: lessonId };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Тодорхойгүй алдаа",
    };
  }
}

export async function deleteLesson(id: string): Promise<ActionResult> {
  const guard = await assertStaff();
  if (!guard.ok) return { error: guard.error! };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/lessons");
    revalidatePath("/grades");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Тодорхойгүй алдаа",
    };
  }
}

export async function toggleLessonPublished(
  id: string,
  published: boolean,
): Promise<ActionResult> {
  const guard = await assertStaff();
  if (!guard.ok) return { error: guard.error! };

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("lessons")
      .update({ published })
      .eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/lessons");
    revalidatePath("/grades");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Тодорхойгүй алдаа",
    };
  }
}

/* ─────────────────────────  Асуулт  ───────────────────────── */

export interface QuestionInput {
  id?: string;
  grade: GradeNumber | null;
  topic: string;
  era: EraKey;
  difficulty: Difficulty;
  type: QuestionType;
  prompt: string;
  /** Мөр бүр нэг сонголт */
  options: string;
  answerIndex: number;
  explanation: string;
  tags: string;
}

export async function saveQuestion(input: QuestionInput): Promise<ActionResult> {
  const guard = await assertStaff();
  if (!guard.ok) return { error: guard.error! };

  const options = lines(input.options);

  if (!input.prompt.trim()) return { error: "Асуултаа бичнэ үү." };
  if (options.length < 2) return { error: "Дор хаяж 2 сонголт оруулна уу." };
  if (input.answerIndex < 0 || input.answerIndex >= options.length) {
    return { error: "Зөв хариултаа сонгоно уу." };
  }
  if (!input.explanation.trim()) {
    return { error: "Тайлбар бичнэ үү — сурагчид энэ нь хамгийн чухал." };
  }

  try {
    const supabase = await createClient();

    const id = input.id ?? `qn-cms-${Date.now()}`;

    const row = {
      id,
      grade: input.grade,
      topic: input.topic.trim() || "Бусад",
      era: input.era,
      difficulty: input.difficulty,
      type: input.type,
      prompt: input.prompt.trim(),
      options,
      answer_index: input.answerIndex,
      explanation: input.explanation.trim(),
      tags: commaList(input.tags),
    };

    const { error } = await supabase
      .from("questions")
      .upsert(row, { onConflict: "id" });

    if (error) return { error: `Хадгалахад алдаа: ${error.message}` };

    revalidatePath("/admin/questions");
    return { error: null, id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Тодорхойгүй алдаа",
    };
  }
}

export async function deleteQuestion(id: string): Promise<ActionResult> {
  const guard = await assertStaff();
  if (!guard.ok) return { error: guard.error! };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/questions");
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Тодорхойгүй алдаа",
    };
  }
}
