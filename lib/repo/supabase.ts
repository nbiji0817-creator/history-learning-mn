import "server-only";
import type {
  Achievement,
  Announcement,
  Exam,
  Game,
  GlossaryTerm,
  Grade,
  GradeNumber,
  HistoricalEvent,
  HistoricalFigure,
  HistoricalSource,
  Lesson,
  Question,
} from "@/types";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  mapAchievement,
  mapAnnouncement,
  mapEvent,
  mapExam,
  mapFigure,
  mapGame,
  mapGrade,
  mapLesson,
  mapQuestion,
  mapSource,
  mapTerm,
} from "./mappers";

/**
 * SUPABASE-ЭЭС ӨГӨГДӨЛ УНШИХ ДАВХАРГА
 *
 * Функц бүр амжилтгүй болвол `null` буцаана — `lib/repo/index.ts` тэр үед
 * `data/` доторх локал өгөгдөл рүү унана. Ингэснээр:
 *
 *   • Supabase тохируулаагүй үед систем ажиллана
 *   • Migration ажиллуулаагүй үед систем ажиллана
 *   • Сүлжээ тасарсан үед систем ажиллана
 *   • Хүснэгт дүүрмэгц автоматаар Supabase-аас уншиж эхэлнэ
 *
 * Хоосон хүснэгтийг ч «байхгүй» гэж үзнэ — эс тэгвэл seed хийхээс өмнө
 * хоосон дэлгэц харагдана.
 */

type Row = Record<string, unknown>;

/** Query-г аюулгүй ажиллуулах бүрхүүл. Алдаа гарвал null. */
async function safe<T>(run: () => Promise<T | null>): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    return await run();
  } catch {
    // Сүлжээ, тохиргоо, эрхийн алдаа — локал өгөгдөл рүү унана
    return null;
  }
}

/** Мөр байхгүй бол null (хоосон хүснэгтийг «бэлэн биш» гэж үзнэ). */
function rowsOrNull(data: unknown, error: unknown): Row[] | null {
  if (error) return null;
  if (!Array.isArray(data) || data.length === 0) return null;
  return data as Row[];
}

/* ────────────────────────  Анги  ──────────────────────── */

export function getGradesFromDb(): Promise<Grade[] | null> {
  return safe(async () => {
    const db = await createClient();
    const { data, error } = await db.from("grades").select("*").order("grade");
    const rows = rowsOrNull(data, error);
    return rows ? rows.map(mapGrade) : null;
  });
}

/* ────────────────────────  Хичээл  ──────────────────────── */

/** Хичээлийн блокуудыг дараалалд нь оруулна. */
function sectionsOf(row: Row): Row[] {
  if (!Array.isArray(row.lesson_sections)) return [];
  return [...(row.lesson_sections as Row[])].sort(
    (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0),
  );
}

/**
 * Хичээл + түүний блокуудыг нэг дуудлагаар авна (N+1 асуудлаас сэргийлнэ).
 * `grade` заасан бол зөвхөн тухайн ангийн хичээлийг авна.
 */
async function loadLessons(grade?: GradeNumber): Promise<Lesson[] | null> {
  const db = await createClient();

  const base = db
    .from("lessons")
    .select("*, lesson_sections(*)")
    .eq("published", true);

  const { data, error } = await (grade === undefined
    ? base.order("order")
    : base.eq("grade", grade).order("order"));

  const rows = rowsOrNull(data, error);
  if (!rows) return null;

  return rows.map((row) => mapLesson(row, sectionsOf(row)));
}

export function getLessonsFromDb(): Promise<Lesson[] | null> {
  return safe(() => loadLessons());
}

export function getLessonsByGradeFromDb(
  grade: GradeNumber,
): Promise<Lesson[] | null> {
  return safe(() => loadLessons(grade));
}

export function getLessonBySlugFromDb(slug: string): Promise<Lesson | null> {
  return safe(async () => {
    const db = await createClient();
    const { data, error } = await db
      .from("lessons")
      .select("*, lesson_sections(*)")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as Row;
    return mapLesson(row, sectionsOf(row));
  });
}

/* ────────────────────────  Түүхэн үйл явдал  ──────────────────────── */

export function getEventsFromDb(): Promise<HistoricalEvent[] | null> {
  return safe(async () => {
    const db = await createClient();
    const { data, error } = await db
      .from("historical_events")
      .select("*")
      .order("sort_year");
    const rows = rowsOrNull(data, error);
    return rows ? rows.map(mapEvent) : null;
  });
}

/* ────────────────────────  Түүхэн хүн  ──────────────────────── */

export function getFiguresFromDb(): Promise<HistoricalFigure[] | null> {
  return safe(async () => {
    const db = await createClient();

    const [figuresResult, eventsResult, relationsResult] = await Promise.all([
      db.from("historical_figures").select("*").order("name"),
      db.from("figure_events").select("figure_id, event_id"),
      db.from("figure_relations").select("figure_id, related_id"),
    ]);

    const rows = rowsOrNull(figuresResult.data, figuresResult.error);
    if (!rows) return null;

    const slugById = new Map<string, string>(
      rows.map((row) => [String(row.id), String(row.slug)]),
    );

    const eventsByFigure = new Map<string, string[]>();
    for (const link of (eventsResult.data ?? []) as Row[]) {
      const key = String(link.figure_id);
      eventsByFigure.set(key, [
        ...(eventsByFigure.get(key) ?? []),
        String(link.event_id),
      ]);
    }

    const relationsByFigure = new Map<string, string[]>();
    for (const link of (relationsResult.data ?? []) as Row[]) {
      const key = String(link.figure_id);
      const slug = slugById.get(String(link.related_id));
      if (!slug) continue;
      relationsByFigure.set(key, [...(relationsByFigure.get(key) ?? []), slug]);
    }

    return rows.map((row) =>
      mapFigure(
        row,
        relationsByFigure.get(String(row.id)) ?? [],
        eventsByFigure.get(String(row.id)) ?? [],
      ),
    );
  });
}

/* ────────────────────────  Эх сурвалж / Толь  ──────────────────────── */

export function getSourcesFromDb(): Promise<HistoricalSource[] | null> {
  return safe(async () => {
    const db = await createClient();
    const { data, error } = await db.from("sources").select("*");
    const rows = rowsOrNull(data, error);
    return rows ? rows.map(mapSource) : null;
  });
}

export function getGlossaryFromDb(): Promise<GlossaryTerm[] | null> {
  return safe(async () => {
    const db = await createClient();
    const { data, error } = await db.from("glossary_terms").select("*").order("term");
    const rows = rowsOrNull(data, error);
    return rows ? rows.map(mapTerm) : null;
  });
}

/* ────────────────────────  Тест / Шалгалт  ──────────────────────── */

export function getQuestionsFromDb(): Promise<Question[] | null> {
  return safe(async () => {
    const db = await createClient();
    /* Асуултын сан том тул хязгаарыг тодорхой заана (PostgREST-ийн default 1000) */
    const { data, error } = await db.from("questions").select("*").limit(5000);
    const rows = rowsOrNull(data, error);
    return rows ? rows.map(mapQuestion) : null;
  });
}

export function getExamsFromDb(): Promise<Exam[] | null> {
  return safe(async () => {
    const db = await createClient();
    const { data, error } = await db.from("exams").select("*");
    const rows = rowsOrNull(data, error);
    return rows ? rows.map(mapExam) : null;
  });
}

/* ────────────────────────  Тоглоом  ──────────────────────── */

export function getGamesFromDb(): Promise<Game[] | null> {
  return safe(async () => {
    const db = await createClient();
    const { data, error } = await db.from("games").select("*");
    const rows = rowsOrNull(data, error);
    return rows ? rows.map(mapGame) : null;
  });
}

/* ────────────────────────  Мэдээ / Амжилт  ──────────────────────── */

export function getAnnouncementsFromDb(): Promise<Announcement[] | null> {
  return safe(async () => {
    const db = await createClient();
    const { data, error } = await db
      .from("announcements")
      .select("*")
      .order("pinned", { ascending: false })
      .order("published_at", { ascending: false });
    const rows = rowsOrNull(data, error);
    return rows ? rows.map(mapAnnouncement) : null;
  });
}

export function getAchievementsFromDb(): Promise<Achievement[] | null> {
  return safe(async () => {
    const db = await createClient();
    const { data, error } = await db.from("achievements").select("*");
    const rows = rowsOrNull(data, error);
    return rows ? rows.map(mapAchievement) : null;
  });
}

/* ────────────────────────  Холболтын төлөв  ──────────────────────── */

export interface DbStatus {
  configured: boolean;
  connected: boolean;
  seeded: boolean;
  lessonCount: number;
  message: string;
}

/** Админы самбар болон /api/health-д ашиглана. */
export async function getDbStatus(): Promise<DbStatus> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      connected: false,
      seeded: false,
      lessonCount: 0,
      message:
        "Supabase тохируулаагүй. .env.local дотор NEXT_PUBLIC_SUPABASE_URL, " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY-г нэмнэ үү.",
    };
  }

  try {
    const db = await createClient();

    /*
     * ЧУХАЛ: энд `head: true` ашиглаж БОЛОХГҮЙ. HEAD хүсэлтэд хариултын бие
     * байхгүй тул supabase-js алдааг задлан унших боломжгүй бөгөөд хүснэгт
     * байхгүй үед ч `error` нь null болж, «холбогдсон» гэсэн буруу дүгнэлт
     * гарна. Иймд эхлээд жинхэнэ SELECT хийж хүснэгтийн оршихуйг шалгана.
     */
    const { error } = await db.from("lessons").select("id").limit(1);

    if (error) {
      const message = error.message ?? "";

      /*
       * Хэрэв хариу нь HTML бол NEXT_PUBLIC_SUPABASE_URL нь Supabase биш
       * өөр сайт руу (ихэвчлэн өөрийнхөө домэйн руу) зааж байна гэсэн үг.
       * Энэ андуурал их гардаг тул тусад нь ойлгомжтой мэдэгдэнэ.
       */
      if (message.includes("<!DOCTYPE") || message.includes("<html")) {
        return {
          configured: true,
          connected: false,
          seeded: false,
          lessonCount: 0,
          message:
            "NEXT_PUBLIC_SUPABASE_URL буруу байна — Supabase биш өөр вэб хуудас " +
            "хариу өгч байна. Утга нь https://<project-ref>.supabase.co хэлбэртэй, " +
            "/rest/v1/ хэсэггүй, төгсгөлийн ташуу зураасгүй байх ёстой.",
        };
      }

      const missingTable =
        error.code === "PGRST205" ||
        message.includes("schema cache") ||
        message.includes("does not exist");

      return {
        configured: true,
        connected: !missingTable,
        seeded: false,
        lessonCount: 0,
        message: missingTable
          ? "Холбогдсон боловч хүснэгт олдсонгүй. supabase/migrations/ доторх " +
            "3 SQL файлыг дарааллаар нь ажиллуулна уу."
          : `Supabase алдаа: ${message.slice(0, 300)}`,
      };
    }

    /* Хүснэгт байгаа нь батлагдсаны дараа мөрийн тоог авна */
    const { count } = await db
      .from("lessons")
      .select("*", { count: "exact", head: true });

    const lessonCount = count ?? 0;

    return {
      configured: true,
      connected: true,
      seeded: lessonCount > 0,
      lessonCount,
      message:
        lessonCount > 0
          ? `Supabase-аас уншиж байна (${lessonCount} хичээл).`
          : "Хүснэгт бэлэн боловч хоосон. /api/admin/seed ажиллуулна уу.",
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      seeded: false,
      lessonCount: 0,
      message: `Холбогдож чадсангүй: ${
        error instanceof Error ? error.message : "тодорхойгүй алдаа"
      }`,
    };
  }
}
