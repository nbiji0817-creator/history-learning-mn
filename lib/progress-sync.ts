"use client";

import type { Progress, QuizAttempt } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * АХИЦЫГ SUPABASE-ТАЙ СИНК ХИЙХ
 *
 * Хоёр давхар хадгалалт:
 *   • localStorage — зочин, офлайн, шуурхай хариу үйлдэл
 *   • Supabase    — нэвтэрсэн хэрэглэгч, бүх төхөөрөмжид синк
 *
 * localStorage нь үргэлж эхлээд бичигдэнэ (UI шууд шинэчлэгдэнэ),
 * дараа нь дэвсгэрт Supabase рүү илгээнэ. Сүлжээ тасарсан ч сурагчийн
 * ажил алдагдахгүй.
 *
 * Хичээлийн id нь Supabase-аас ирэхэд uuid байдаг. Локал өгөгдөл рүү
 * унасан үед «l6-01» гэх мэт байх тул uuid эсэхийг шалгаж байж RPC дуудна.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/** Supabase-аас хэрэглэгчийн бүх ахицыг татна. */
export async function loadRemoteProgress(
  userId: string,
): Promise<Partial<Progress> | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createClient();

    const [progressRow, lessons, mastery, attempts, games, achievements] =
      await Promise.all([
        supabase
          .from("progress")
          .select("xp, streak, last_active_at")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("lesson_progress")
          .select("lesson_id, completed_at")
          .eq("user_id", userId),
        supabase
          .from("topic_mastery")
          .select("topic, correct, total")
          .eq("user_id", userId),
        supabase
          .from("quiz_attempts")
          .select("id, quiz_id, score, total, duration_seconds, started_at, finished_at")
          .eq("user_id", userId)
          .order("finished_at", { ascending: false })
          .limit(50),
        supabase
          .from("game_scores")
          .select("game_slug, score, played_at")
          .eq("user_id", userId)
          .order("played_at", { ascending: false })
          .limit(50),
        supabase
          .from("user_achievements")
          .select("achievement_id")
          .eq("user_id", userId),
      ]);

    const lessonRows = (lessons.data ?? []) as {
      lesson_id: string;
      completed_at: string | null;
    }[];

    const topicMastery: Progress["topicMastery"] = {};
    for (const row of (mastery.data ?? []) as {
      topic: string;
      correct: number;
      total: number;
    }[]) {
      topicMastery[row.topic] = { correct: row.correct, total: row.total };
    }

    return {
      userId,
      xp: progressRow.data?.xp ?? 0,
      streak: progressRow.data?.streak ?? 0,
      lastActiveAt: progressRow.data?.last_active_at ?? "",
      viewedLessonIds: lessonRows.map((row) => row.lesson_id),
      completedLessonIds: lessonRows
        .filter((row) => row.completed_at)
        .map((row) => row.lesson_id),
      topicMastery,
      quizAttempts: ((attempts.data ?? []) as Record<string, unknown>[]).map(
        (row) => ({
          id: String(row.id),
          quizId: String(row.quiz_id ?? ""),
          userId,
          score: Number(row.score ?? 0),
          total: Number(row.total ?? 0),
          durationSeconds: Number(row.duration_seconds ?? 0),
          startedAt: String(row.started_at ?? ""),
          finishedAt: String(row.finished_at ?? ""),
          answers: [],
        }),
      ),
      gameScores: ((games.data ?? []) as Record<string, unknown>[]).map((row) => ({
        gameSlug: String(row.game_slug ?? ""),
        score: Number(row.score ?? 0),
        playedAt: String(row.played_at ?? ""),
      })),
      achievementIds: ((achievements.data ?? []) as { achievement_id: string }[]).map(
        (row) => row.achievement_id,
      ),
    };
  } catch {
    return null;
  }
}

/** Хичээл үзсэнийг тэмдэглэнэ. */
export async function pushLessonViewed(
  userId: string,
  lessonId: string,
): Promise<void> {
  if (!isSupabaseConfigured() || !isUuid(lessonId)) return;

  try {
    const supabase = createClient();
    await supabase
      .from("lesson_progress")
      .upsert(
        { user_id: userId, lesson_id: lessonId, viewed_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
      );
  } catch {
    /* Офлайн — localStorage дээр хадгалагдсан хэвээр */
  }
}

/** Хичээл дуусгасныг тэмдэглэж, XP нэмнэ (SQL функц дотор нэг гүйлгээгээр). */
export async function pushLessonCompleted(
  lessonId: string,
): Promise<void> {
  if (!isSupabaseConfigured() || !isUuid(lessonId)) return;

  try {
    const supabase = createClient();
    await supabase.rpc("complete_lesson", { p_lesson: lessonId });
  } catch {
    /* ignore */
  }
}

/** Тестийн үр дүнг бүртгэж, сэдвийн эзэмшил, XP-г шинэчилнэ. */
export async function pushQuizAttempt(
  attempt: Omit<QuizAttempt, "id" | "userId">,
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = createClient();
    await supabase.rpc("record_quiz_attempt", {
      p_quiz_id: attempt.quizId,
      p_exam_slug: null,
      p_score: attempt.score,
      p_total: attempt.total,
      p_duration: attempt.durationSeconds,
      p_answers: attempt.answers.map((answer) => ({
        question_id: answer.questionId,
        topic: answer.topic,
        correct: answer.correct,
        given: null,
      })),
    });
  } catch {
    /* ignore */
  }
}

/** Тоглоомын оноог бүртгэж, XP нэмнэ. */
export async function pushGameScore(
  userId: string,
  gameSlug: string,
  score: number,
  xp: number,
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = createClient();
    await supabase
      .from("game_scores")
      .insert({ user_id: userId, game_slug: gameSlug, score });
    await supabase.rpc("add_xp", { p_xp: xp });
  } catch {
    /* ignore */
  }
}

/** Шинээр авсан амжилтын тэмдгийг хадгална. */
export async function pushAchievements(
  userId: string,
  achievementIds: string[],
): Promise<void> {
  if (!isSupabaseConfigured() || achievementIds.length === 0) return;

  try {
    const supabase = createClient();
    await supabase.from("user_achievements").upsert(
      achievementIds.map((id) => ({ user_id: userId, achievement_id: id })),
      { onConflict: "user_id,achievement_id", ignoreDuplicates: true },
    );
  } catch {
    /* ignore */
  }
}

/**
 * Зочиноор цуглуулсан ахицыг бүртгэлд нэгтгэнэ.
 *
 * Сурагч нэвтрэхээсээ өмнө хичээл үзсэн байж болно. Тэр ажлыг алдахгүйн
 * тулд эхний нэвтрэлтэд локал ахицыг сервер рүү илгээнэ.
 */
export async function mergeLocalIntoRemote(
  userId: string,
  local: Progress,
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const lessonIds = local.completedLessonIds.filter(isUuid);

  for (const lessonId of lessonIds) {
    await pushLessonCompleted(lessonId);
  }

  const viewedOnly = local.viewedLessonIds
    .filter(isUuid)
    .filter((id) => !local.completedLessonIds.includes(id));

  for (const lessonId of viewedOnly) {
    await pushLessonViewed(userId, lessonId);
  }

  if (local.achievementIds.length > 0) {
    await pushAchievements(userId, local.achievementIds);
  }
}
