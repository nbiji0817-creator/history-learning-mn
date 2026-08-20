import { cache } from "react";
import type {
  Announcement,
  Exam,
  Feedback,
  Game,
  GlossaryTerm,
  GradeNumber,
  HistoricalEvent,
  HistoricalFigure,
  HistoricalSource,
  Lesson,
  Question,
  Quiz,
  Simulation,
  User,
} from "@/types";

import { grades as localGrades, gradeMap } from "@/data/grades";
import {
  lessons as localLessons,
  lessonBySlug,
  lessonsByGrade,
} from "@/data/lessons";
import { historicalEvents, sortedEvents } from "@/data/events";
import { historicalFigures } from "@/data/figures";
import { historicalSources } from "@/data/sources";
import { glossaryTerms } from "@/data/glossary";
import { questions as localQuestions } from "@/data/questions";
import { quizzes, quizMap } from "@/data/quizzes";
import { exams as localExams } from "@/data/exams";
import { games as localGames } from "@/data/games";
import { simulations, simulationMap } from "@/data/simulations";
import {
  achievements as localAchievements,
  announcements as localAnnouncements,
  demoFeedback,
  demoUsers,
} from "@/data/community";

import {
  getAchievementsFromDb,
  getAnnouncementsFromDb,
  getEventsFromDb,
  getExamsFromDb,
  getFiguresFromDb,
  getGamesFromDb,
  getGlossaryFromDb,
  getGradesFromDb,
  getLessonBySlugFromDb,
  getLessonsByGradeFromDb,
  getLessonsFromDb,
  getQuestionsFromDb,
  getSourcesFromDb,
} from "./supabase";

export { getDbStatus } from "./supabase";
export type { DbStatus } from "./supabase";

/**
 * ӨГӨГДӨЛ АВАХ ДАВХАРГА
 *
 * Дараалал: Supabase → амжилтгүй бол `data/` доторх локал өгөгдөл.
 *
 * Ингэснээр систем дараах бүх нөхцөлд ажиллана:
 *   • Supabase тохируулаагүй
 *   • Migration ажиллуулаагүй (хүснэгт байхгүй)
 *   • Seed хийгээгүй (хүснэгт хоосон)
 *   • Сүлжээ тасарсан
 *
 * Хүснэгт дүүрмэгц ямар ч кодын өөрчлөлтгүйгээр Supabase руу шилжинэ.
 *
 * `cache()` нь нэг хүсэлтийн доторх давхардсан query-г нэгтгэнэ.
 */

/* ─────────────────────────  Анги / Хичээл  ───────────────────────── */

export const getGrades = cache(async () => {
  return (await getGradesFromDb()) ?? localGrades;
});

export async function getGrade(grade: GradeNumber) {
  const all = await getGrades();
  return all.find((item) => item.grade === grade) ?? gradeMap.get(grade) ?? null;
}

export const getLessons = cache(async (): Promise<Lesson[]> => {
  return (
    (await getLessonsFromDb()) ??
    localLessons.filter((lesson) => lesson.published)
  );
});

export const getLessonsByGrade = cache(
  async (grade: GradeNumber): Promise<Lesson[]> => {
    return (await getLessonsByGradeFromDb(grade)) ?? lessonsByGrade(grade);
  },
);

export const getLessonBySlug = cache(
  async (slug: string): Promise<Lesson | null> => {
    return (await getLessonBySlugFromDb(slug)) ?? lessonBySlug.get(slug) ?? null;
  },
);

/** Дараагийн ба өмнөх хичээл — хичээлийн хуудасны навигацид. */
export async function getLessonNeighbours(lesson: Lesson) {
  const siblings = await getLessonsByGrade(lesson.grade);
  const index = siblings.findIndex((item) => item.slug === lesson.slug);
  return {
    previous: index > 0 ? siblings[index - 1] : null,
    next: index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null,
  };
}

/* ─────────────────────────  Түүхэн үйл явдал / хүн  ───────────────────────── */

export const getEvents = cache(async (): Promise<HistoricalEvent[]> => {
  return (await getEventsFromDb()) ?? sortedEvents;
});

export async function getEventsByIds(ids: string[]): Promise<HistoricalEvent[]> {
  const all = await getEvents();
  const byId = new Map(all.map((event) => [event.id, event]));
  return ids
    .map((id) => byId.get(id))
    .filter((event): event is HistoricalEvent => Boolean(event))
    .sort((a, b) => a.sortYear - b.sortYear);
}

export async function getEvent(id: string): Promise<HistoricalEvent | null> {
  const all = await getEvents();
  return all.find((event) => event.id === id) ?? null;
}

export const getFigures = cache(async (): Promise<HistoricalFigure[]> => {
  return (await getFiguresFromDb()) ?? historicalFigures;
});

export async function getFiguresBySlugs(
  slugs: string[],
): Promise<HistoricalFigure[]> {
  const all = await getFigures();
  const bySlug = new Map(all.map((figure) => [figure.slug, figure]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((figure): figure is HistoricalFigure => Boolean(figure));
}

export async function getFigure(slug: string): Promise<HistoricalFigure | null> {
  const all = await getFigures();
  return all.find((figure) => figure.slug === slug) ?? null;
}

/* ─────────────────────────  Эх сурвалж / Нэр томьёо  ───────────────────────── */

export const getSources = cache(async (): Promise<HistoricalSource[]> => {
  return (await getSourcesFromDb()) ?? historicalSources;
});

export async function getSourcesByIds(ids: string[]): Promise<HistoricalSource[]> {
  const all = await getSources();
  const byId = new Map(all.map((source) => [source.id, source]));
  return ids
    .map((id) => byId.get(id))
    .filter((source): source is HistoricalSource => Boolean(source));
}

export const getGlossary = cache(async (): Promise<GlossaryTerm[]> => {
  const fromDb = await getGlossaryFromDb();
  const terms = fromDb ?? glossaryTerms;
  return [...terms].sort((a, b) => a.term.localeCompare(b.term, "mn"));
});

/* ─────────────────────────  Тест / Шалгалт  ───────────────────────── */

export const getQuestions = cache(async (): Promise<Question[]> => {
  return (await getQuestionsFromDb()) ?? localQuestions;
});

export async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
  const all = await getQuestions();
  const byId = new Map(all.map((question) => [question.id, question]));
  return ids
    .map((id) => byId.get(id))
    .filter((question): question is Question => Boolean(question));
}

/** Тестүүд нь асуултын сангаас угсрагддаг тул локал тодорхойлолтоос авна. */
export async function getQuiz(id: string): Promise<Quiz | null> {
  return quizMap.get(id) ?? null;
}

export async function getQuizzes(): Promise<Quiz[]> {
  return quizzes;
}

export const getExams = cache(async (): Promise<Exam[]> => {
  return (await getExamsFromDb()) ?? localExams;
});

export async function getExam(slug: string): Promise<Exam | null> {
  const all = await getExams();
  return all.find((exam) => exam.slug === slug) ?? null;
}

/** Шалгалтын шүүлтүүрийн дагуу асуултын сангаас түүвэрлэнэ. */
export async function getExamQuestions(exam: Exam): Promise<Question[]> {
  const { grades: gradeFilter, eras, tags } = exam.filter;
  const pool = await getQuestions();

  return pool.filter((question) => {
    if (
      gradeFilter?.length &&
      (!question.grade || !gradeFilter.includes(question.grade))
    ) {
      return false;
    }
    if (eras?.length && !eras.includes(question.era)) return false;
    if (tags?.length && !question.tags.some((tag) => tags.includes(tag))) {
      return false;
    }
    return true;
  });
}

/* ─────────────────────────  Тоглоом / Симуляци  ───────────────────────── */

export const getGames = cache(async (): Promise<Game[]> => {
  return (await getGamesFromDb()) ?? localGames;
});

export async function getGame(slug: string): Promise<Game | null> {
  const all = await getGames();
  return all.find((game) => game.slug === slug) ?? null;
}

export async function getSimulations(): Promise<Simulation[]> {
  return simulations;
}

export async function getSimulation(slug: string): Promise<Simulation | null> {
  return simulationMap.get(slug) ?? null;
}

/* ─────────────────────────  Мэдээ / Санал / Хэрэглэгч  ───────────────────────── */

export const getAnnouncements = cache(async (): Promise<Announcement[]> => {
  const fromDb = await getAnnouncementsFromDb();
  if (fromDb) return fromDb;

  return [...localAnnouncements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
});

export const getAchievements = cache(async () => {
  return (await getAchievementsFromDb()) ?? localAchievements;
});

export async function getFeedback(): Promise<Feedback[]> {
  return demoFeedback;
}

export async function getUsers(): Promise<User[]> {
  return demoUsers;
}

/* ─────────────────────────  Статистик  ───────────────────────── */

export async function getPlatformStats() {
  const [lessons, questions, exams, games, figures, events, sources, terms] =
    await Promise.all([
      getLessons(),
      getQuestions(),
      getExams(),
      getGames(),
      getFigures(),
      getEvents(),
      getSources(),
      getGlossary(),
    ]);

  return {
    lessons: lessons.length,
    questions: questions.length,
    quizzes: quizzes.length,
    exams: exams.length,
    games: games.length,
    figures: figures.length,
    events: events.length,
    sources: sources.length,
    terms: terms.length,
    users: demoUsers.length,
    feedback: demoFeedback.length,
    unresolvedFeedback: demoFeedback.filter((item) => !item.resolved).length,
  };
}

/* Локал эх өгөгдлийг шууд ашиглах шаардлагатай газарт (жишээ нь
   generateStaticParams) экспортолно — эдгээр нь build-ийн үед ажиллана. */
export { localLessons, localGrades, historicalEvents };
