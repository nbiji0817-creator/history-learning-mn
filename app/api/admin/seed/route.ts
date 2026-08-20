import { createAdminClient } from "@/lib/supabase/server";
import { grades } from "@/data/grades";
import { lessons } from "@/data/lessons";
import { historicalFigures } from "@/data/figures";
import { historicalEvents } from "@/data/events";
import { historicalSources } from "@/data/sources";
import { glossaryTerms } from "@/data/glossary";
import { questions } from "@/data/questions";
import { quizzes } from "@/data/quizzes";
import { exams } from "@/data/exams";
import { games } from "@/data/games";
import { simulations } from "@/data/simulations";
import { achievements, announcements } from "@/data/community";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * DEMO/SEED DATA-Г SUPABASE РУУ БИЧИХ
 *
 * Яагаад API route гэж?  `data/` доторх файлууд TypeScript + path alias
 * ашигладаг тул Next.js-ийн module resolution дотор ажиллуулах нь хамгийн
 * найдвартай. Ингэснээр тусдаа build хийх шаардлагагүй.
 *
 * Ажиллуулах:
 *   curl -X POST http://localhost:3000/api/admin/seed \
 *        -H "x-seed-secret: <SEED_SECRET>"
 *
 * Шаардлагатай env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (⚠️ зөвхөн серверт)
 *   SEED_SECRET                 (өөрөө зохиож тавина)
 *
 * ⚠️ SEED_SECRET тохируулаагүй бол энэ route ажиллахгүй.
 *    Production-д seed хийж дуусаад SEED_SECRET-ээ устгахыг зөвлөнө.
 */
export async function POST(request: Request) {
  const secret = process.env.SEED_SECRET;

  if (!secret) {
    return Response.json(
      { error: "SEED_SECRET тохируулаагүй тул seed route идэвхгүй байна." },
      { status: 503 },
    );
  }

  if (request.headers.get("x-seed-secret") !== secret) {
    return Response.json({ error: "Эрхгүй" }, { status: 401 });
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Supabase алдаа" },
      { status: 500 },
    );
  }

  const report: Record<string, number | string> = {};

  async function upsert(table: string, rows: unknown[], conflict: string) {
    if (rows.length === 0) {
      report[table] = 0;
      return;
    }
    /* Том хүснэгтийг хэсэгчлэн бичнэ — нэг хүсэлт хэт том болохоос сэргийлнэ */
    const CHUNK = 200;
    let written = 0;

    for (let i = 0; i < rows.length; i += CHUNK) {
      const { error } = await supabase
        .from(table)
        .upsert(rows.slice(i, i + CHUNK), { onConflict: conflict });

      if (error) {
        report[table] = `АЛДАА: ${error.message}`;
        return;
      }
      written += Math.min(CHUNK, rows.length - i);
    }
    report[table] = written;
  }

  /* ────────  Анги  ──────── */
  await upsert(
    "grades",
    grades.map((grade) => ({
      grade: grade.grade,
      title: grade.title,
      subtitle: grade.subtitle,
      description: grade.description,
      icon: grade.icon,
      accent: grade.accent,
      focus: grade.focus ?? null,
    })),
    "grade",
  );

  /* ────────  Түүхэн агуулга  ──────── */
  await upsert(
    "historical_events",
    historicalEvents.map((event) => ({
      id: event.id,
      title: event.title,
      year_label: event.year,
      sort_year: event.sortYear,
      era: event.era,
      region: event.region,
      place: event.place,
      summary: event.summary,
      cause: event.cause ?? null,
      course: event.course ?? null,
      result: event.result ?? null,
      significance: event.significance ?? null,
      icon: event.icon,
      tags: event.tags,
    })),
    "id",
  );

  await upsert(
    "historical_figures",
    historicalFigures.map((figure) => ({
      slug: figure.slug,
      name: figure.name,
      title: figure.title,
      portrait: figure.portrait,
      born: figure.born,
      died: figure.died,
      era: figure.era,
      region: figure.region,
      summary: figure.summary,
      achievements: figure.achievements,
      tags: figure.tags,
    })),
    "slug",
  );

  /* Түүхэн хүн ↔ үйл явдал, хүн ↔ хүний холбоо (id-г татаж авна) */
  const { data: figureRows, error: figureError } = await supabase
    .from("historical_figures")
    .select("id, slug");

  if (figureError) {
    report.figure_events = `АЛДАА: ${figureError.message}`;
  } else {
    const figureIdBySlug = new Map<string, string>(
      (figureRows ?? []).map((row: { id: string; slug: string }) => [
        row.slug,
        row.id,
      ]),
    );

    await upsert(
      "figure_events",
      historicalFigures.flatMap((figure) => {
        const figureId = figureIdBySlug.get(figure.slug);
        if (!figureId) return [];
        return figure.relatedEventIds.map((eventId) => ({
          figure_id: figureId,
          event_id: eventId,
        }));
      }),
      "figure_id,event_id",
    );

    await upsert(
      "figure_relations",
      historicalFigures.flatMap((figure) => {
        const figureId = figureIdBySlug.get(figure.slug);
        if (!figureId) return [];
        return figure.relatedFigureSlugs
          .map((slug) => figureIdBySlug.get(slug))
          .filter((id): id is string => Boolean(id) && id !== figureId)
          .map((relatedId) => ({ figure_id: figureId, related_id: relatedId }));
      }),
      "figure_id,related_id",
    );
  }

  await upsert(
    "sources",
    historicalSources.map((source) => ({
      id: source.id,
      title: source.title,
      kind: source.kind,
      origin: source.origin,
      year_label: source.year,
      excerpt: source.excerpt,
      analysis_question: source.analysisQuestion,
      guidance: source.guidance,
      tags: source.tags,
    })),
    "id",
  );

  await upsert(
    "glossary_terms",
    glossaryTerms.map((term) => ({
      term: term.term,
      definition: term.definition,
      category: term.category,
      related_terms: term.relatedTerms,
    })),
    "term",
  );

  /* ────────  Хичээл  ──────── */
  await upsert(
    "lessons",
    lessons.map((lesson) => ({
      slug: lesson.slug,
      grade: lesson.grade,
      order: lesson.order,
      title: lesson.title,
      subtitle: lesson.subtitle,
      icon: lesson.icon,
      summary: lesson.summary,
      objectives: lesson.objectives,
      duration_minutes: lesson.durationMinutes,
      difficulty: lesson.difficulty,
      tags: lesson.tags,
      conclusion: lesson.conclusion,
      ai_prompts: lesson.aiPrompts,
      external_links: lesson.externalLinks ?? [],
      quiz_id: lesson.quizId,
      game_slug: lesson.gameSlug,
      published: lesson.published,
    })),
    "slug",
  );

  /* Хичээлийн блокуудыг бичихийн тулд эхлээд id-г нь татаж авна */
  const { data: lessonRows, error: lessonError } = await supabase
    .from("lessons")
    .select("id, slug");

  if (lessonError) {
    report.lesson_sections = `АЛДАА: ${lessonError.message}`;
  } else {
    const idBySlug = new Map<string, string>(
      (lessonRows ?? []).map((row: { id: string; slug: string }) => [
        row.slug,
        row.id,
      ]),
    );

    const sections = lessons.flatMap((lesson) => {
      const lessonId = idBySlug.get(lesson.slug);
      if (!lessonId) return [];
      return lesson.sections.map((section, index) => ({
        lesson_id: lessonId,
        order: index + 1,
        type: section.type,
        title: section.title,
        body: section.body ?? null,
        content: {
          points: section.points,
          concepts: section.concepts,
          eventIds: section.eventIds,
          figureSlugs: section.figureSlugs,
          sourceIds: section.sourceIds,
          infographic: section.infographic,
          map: section.map,
          quote: section.quote,
          videoUrl: section.videoUrl,
        },
      }));
    });

    /* Дахин seed хийхэд давхардахаас сэргийлж эхлээд цэвэрлэнэ */
    await supabase.from("lesson_sections").delete().neq("lesson_id", null);
    await upsert("lesson_sections", sections, "id");
  }

  /* ────────  Тест  ──────── */
  await upsert(
    "questions",
    questions.map((question) => ({
      id: question.id,
      grade: question.grade,
      topic: question.topic,
      era: question.era,
      difficulty: question.difficulty,
      type: question.type,
      prompt: question.prompt,
      options: question.options ?? null,
      answer_index: question.answerIndex ?? null,
      answer_text: question.answerText ?? null,
      pairs: question.pairs ?? null,
      sequence: question.sequence ?? null,
      explanation: question.explanation,
      source: question.source ?? null,
      tags: question.tags,
    })),
    "id",
  );

  await upsert(
    "quizzes",
    quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      grade: quiz.grade,
      time_limit: quiz.timeLimit,
      pass_score: quiz.passScore,
    })),
    "id",
  );

  await upsert(
    "quiz_questions",
    quizzes.flatMap((quiz) =>
      quiz.questionIds.map((questionId, index) => ({
        quiz_id: quiz.id,
        question_id: questionId,
        order: index + 1,
      })),
    ),
    "quiz_id,question_id",
  );

  await upsert(
    "exams",
    exams.map((exam) => ({
      slug: exam.slug,
      kind: exam.kind,
      title: exam.title,
      subtitle: exam.subtitle,
      description: exam.description,
      icon: exam.icon,
      question_count: exam.questionCount,
      duration: exam.duration,
      difficulty: exam.difficulty,
      topics: exam.topics,
      filter: exam.filter,
    })),
    "slug",
  );

  /* ────────  Тоглоом, симуляц  ──────── */
  await upsert(
    "games",
    games.map((game) => ({
      slug: game.slug,
      kind: game.kind,
      title: game.title,
      description: game.description,
      icon: game.icon,
      grades: game.grades,
      difficulty: game.difficulty,
      playable: game.playable,
      xp: game.xp,
    })),
    "slug",
  );

  await upsert(
    "simulations",
    simulations.map((simulation) => ({
      slug: simulation.slug,
      title: simulation.title,
      subtitle: simulation.subtitle,
      icon: simulation.icon,
      intro: simulation.intro,
      endings: simulation.endings,
    })),
    "slug",
  );

  /* Симуляцын хэсэг, сонголтууд — эцэг мөрийн id хэрэгтэй тул дараалуулна */
  await supabase.from("simulation_scenes").delete().neq("simulation_slug", "");

  for (const simulation of simulations) {
    const { data: sceneRows, error: sceneError } = await supabase
      .from("simulation_scenes")
      .insert(
        simulation.scenes.map((scene, index) => ({
          simulation_slug: simulation.slug,
          order: index + 1,
          title: scene.title,
          narrative: scene.narrative,
        })),
      )
      .select("id, order");

    if (sceneError) {
      report.simulation_scenes = `АЛДАА: ${sceneError.message}`;
      break;
    }

    const idByOrder = new Map<number, string>(
      (sceneRows ?? []).map((row: { id: string; order: number }) => [
        row.order,
        row.id,
      ]),
    );

    const choices = simulation.scenes.flatMap((scene, index) => {
      const sceneId = idByOrder.get(index + 1);
      if (!sceneId) return [];
      return scene.choices.map((choice) => ({
        scene_id: sceneId,
        label: choice.label,
        description: choice.description,
        effects: choice.effects,
        outcome: choice.outcome,
      }));
    });

    const { error: choiceError } = await supabase
      .from("simulation_choices")
      .insert(choices);

    if (choiceError) {
      report.simulation_choices = `АЛДАА: ${choiceError.message}`;
      break;
    }

    report.simulation_scenes =
      (Number(report.simulation_scenes) || 0) + simulation.scenes.length;
    report.simulation_choices =
      (Number(report.simulation_choices) || 0) + choices.length;
  }

  /* ────────  Амжилт, мэдээ  ──────── */
  await upsert(
    "achievements",
    achievements.map((achievement) => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      requirement: achievement.requirement,
      xp: achievement.xp,
    })),
    "id",
  );

  await upsert(
    "announcements",
    announcements.map((announcement) => ({
      title: announcement.title,
      body: announcement.body,
      category: announcement.category,
      icon: announcement.icon,
      author: announcement.author,
      pinned: announcement.pinned,
      published_at: announcement.publishedAt,
    })),
    "title",
  );

  const failed = Object.entries(report).filter(
    ([, value]) => typeof value === "string",
  );

  return Response.json(
    {
      ok: failed.length === 0,
      report,
      hint:
        failed.length > 0
          ? "Алдаатай хүснэгтүүдийг шалгана уу. Migration бүрэн ажилласан эсэхийг нягтлаарай."
          : "Seed амжилттай. SEED_SECRET-ээ устгахыг зөвлөнө.",
    },
    { status: failed.length > 0 ? 500 : 200 },
  );
}
