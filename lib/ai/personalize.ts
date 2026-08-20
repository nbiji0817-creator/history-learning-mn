import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth-server";
import type { GradeNumber } from "@/types";

/**
 * СУРАГЧИД ТААРУУЛСАН ХАРИУЛТ
 *
 * AI нь сурагчийн ангийг мэдвэл түвшинд тохирсон үгээр тайлбарлана,
 * сул сэдвийг мэдвэл тэр өнцгөөс нь холбож өгнө.
 *
 * НУУЦЛАЛ
 *   • Зөвхөн нэвтэрсэн хэрэглэгчийн ӨӨРИЙНХ нь өгөгдлийг уншина
 *   • RLS нь бусдын ахицыг уншихыг зөвшөөрөхгүй
 *   • Нэвтрээгүй бол ямар ч хувийн мэдээлэл ашиглагдахгүй
 */

export interface LearnerContext {
  grade: GradeNumber | null;
  name: string | null;
  /** 70%-иас доош эзэмшилтэй сэдвүүд */
  weakTopics: { topic: string; percent: number }[];
  /** Сүүлийн тестийн дундаж хувь */
  averageScore: number | null;
  available: boolean;
}

const EMPTY: LearnerContext = {
  grade: null,
  name: null,
  weakTopics: [],
  averageScore: null,
  available: false,
};

export async function getLearnerContext(): Promise<LearnerContext> {
  const user = await getCurrentUser();
  if (!user) return EMPTY;

  try {
    const supabase = await createClient();

    const [masteryResult, attemptsResult] = await Promise.all([
      supabase
        .from("topic_mastery")
        .select("topic, correct, total")
        .eq("user_id", user.id)
        .limit(100),
      supabase
        .from("quiz_attempts")
        .select("score, total")
        .eq("user_id", user.id)
        .order("finished_at", { ascending: false })
        .limit(10),
    ]);

    const mastery = (masteryResult.data ?? []) as {
      topic: string;
      correct: number;
      total: number;
    }[];

    const weakTopics = mastery
      .filter((row) => row.total >= 2 && row.correct / row.total < 0.7)
      .map((row) => ({
        topic: row.topic,
        percent: Math.round((row.correct / row.total) * 100),
      }))
      .sort((a, b) => a.percent - b.percent)
      .slice(0, 5);

    const attempts = (attemptsResult.data ?? []) as {
      score: number;
      total: number;
    }[];

    const averageScore =
      attempts.length > 0
        ? Math.round(
            (attempts.reduce(
              (sum, item) => sum + (item.total > 0 ? item.score / item.total : 0),
              0,
            ) /
              attempts.length) *
              100,
          )
        : null;

    return {
      grade: user.profile.grade,
      name: user.profile.name,
      weakTopics,
      averageScore,
      available: true,
    };
  } catch {
    return { ...EMPTY, grade: user.profile.grade, name: user.profile.name };
  }
}

/** Сурагчийн мэдээллийг AI-д өгөх зааврын хэсэг болгоно. */
export function personalizationPrompt(context: LearnerContext): string {
  if (!context.available && !context.grade) return "";

  const lines: string[] = ["", "=== СУРАГЧИЙН ТУХАЙ ==="];

  if (context.grade) {
    lines.push(
      `Энэ сурагч ${context.grade}-р ангид сурдаг. Тайлбараа тэр түвшинд тохируул.`,
    );
    if (context.grade <= 7) {
      lines.push("Богино өгүүлбэр, энгийн үг, өдөр тутмын жишээ ашигла.");
    } else if (context.grade >= 11) {
      lines.push(
        "Учир шалтгааны холбоо, түүхэн үнэлгээ, эх сурвалжийн шинжилгээнд илүү анхаар.",
      );
    }
  }

  if (context.weakTopics.length > 0) {
    lines.push(
      `Энэ сурагчийн сул сэдвүүд: ${context.weakTopics
        .map((item) => `${item.topic} (${item.percent}%)`)
        .join(", ")}.`,
      "Хариулт нь эдгээр сэдэвтэй холбогдож байвал тэр холбоог тодруулж, товч давтлага өг.",
    );
  }

  if (context.averageScore !== null) {
    if (context.averageScore < 50) {
      lines.push(
        "Сурагчийн тестийн дундаж оноо доогуур байна. Урамшуулсан өнгө аястай бич, суурь ойлголтыг тодруул.",
      );
    } else if (context.averageScore >= 85) {
      lines.push(
        "Сурагч сайн суралцаж байна. Гүнзгий асуулт, нэмэлт сонирхолтой баримт нэм.",
      );
    }
  }

  lines.push(
    "Сурагчийн мэдээллийг ил задлан ярихгүй — зөвхөн хариултаа тааруулахад ашигла.",
  );

  return lines.join("\n");
}
