import type {
  Achievement,
  Announcement,
  Difficulty,
  EraKey,
  Exam,
  ExamKind,
  Game,
  GameKind,
  GlossaryTerm,
  Grade,
  GradeNumber,
  HistoricalEvent,
  HistoricalFigure,
  HistoricalSource,
  Lesson,
  LessonSection,
  LessonSectionType,
  Question,
  QuestionType,
  SourceKind,
} from "@/types";

/**
 * Supabase-ийн мөрийг (snake_case) домэйн төрөл (camelCase) рүү хөрвүүлнэ.
 *
 * Хүснэгтийн бүтэц supabase/migrations/0001_init.sql-д тодорхойлогдсон.
 * Багана нэмэх/өөрчлөхөд ЭНЭ ФАЙЛЫГ хамт шинэчилнэ.
 */

type Row = Record<string, unknown>;

/* ────────────  Туслах  ──────────── */

const str = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const num = (value: unknown, fallback = 0): number =>
  typeof value === "number" ? value : fallback;

const bool = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

const strArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const nullableStr = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

/* ────────────  Анги  ──────────── */

export function mapGrade(row: Row): Grade {
  return {
    grade: num(row.grade, 6) as GradeNumber,
    title: str(row.title),
    subtitle: str(row.subtitle),
    description: str(row.description),
    icon: str(row.icon, "📘"),
    accent: str(row.accent, "from-amber-500 to-orange-600"),
    focus: nullableStr(row.focus),
  };
}

/* ────────────  Хичээл  ──────────── */

export function mapLessonSection(row: Row): LessonSection {
  const content = (row.content ?? {}) as Row;

  return {
    id: str(row.id),
    type: str(row.type, "text") as LessonSectionType,
    title: str(row.title),
    body: nullableStr(row.body),
    points: Array.isArray(content.points) ? strArray(content.points) : undefined,
    concepts: content.concepts as LessonSection["concepts"],
    eventIds: Array.isArray(content.eventIds) ? strArray(content.eventIds) : undefined,
    figureSlugs: Array.isArray(content.figureSlugs)
      ? strArray(content.figureSlugs)
      : undefined,
    sourceIds: Array.isArray(content.sourceIds) ? strArray(content.sourceIds) : undefined,
    infographic: content.infographic as LessonSection["infographic"],
    map: content.map as LessonSection["map"],
    quote: content.quote as LessonSection["quote"],
    videoUrl: nullableStr(content.videoUrl),
  };
}

/** `lessons` мөр + түүний `lesson_sections`-ыг нэгтгэнэ. */
export function mapLesson(row: Row, sections: Row[] = []): Lesson {
  return {
    id: str(row.id),
    slug: str(row.slug),
    grade: num(row.grade, 6) as GradeNumber,
    order: num(row.order, 1),
    title: str(row.title),
    subtitle: str(row.subtitle),
    icon: str(row.icon, "📘"),
    summary: str(row.summary),
    objectives: strArray(row.objectives),
    durationMinutes: num(row.duration_minutes, 30),
    difficulty: str(row.difficulty, "medium") as Difficulty,
    tags: strArray(row.tags),
    sections: sections.map(mapLessonSection),
    conclusion: str(row.conclusion),
    externalLinks: Array.isArray(row.external_links)
      ? (row.external_links as Lesson["externalLinks"])
      : [],
    aiPrompts: strArray(row.ai_prompts),
    quizId: typeof row.quiz_id === "string" ? row.quiz_id : null,
    gameSlug: typeof row.game_slug === "string" ? row.game_slug : null,
    published: bool(row.published, true),
  };
}

/* ────────────  Түүхэн хүн / үйл явдал  ──────────── */

export function mapFigure(
  row: Row,
  relatedFigureSlugs: string[] = [],
  relatedEventIds: string[] = [],
): HistoricalFigure {
  return {
    slug: str(row.slug),
    name: str(row.name),
    title: str(row.title),
    portrait: str(row.portrait, "👤"),
    born: str(row.born),
    died: str(row.died),
    era: str(row.era, "medieval") as EraKey,
    region: row.region === "world" ? "world" : "mn",
    summary: str(row.summary),
    achievements: strArray(row.achievements),
    relatedFigureSlugs,
    relatedEventIds,
    tags: strArray(row.tags),
  };
}

export function mapEvent(row: Row): HistoricalEvent {
  return {
    id: str(row.id),
    title: str(row.title),
    year: str(row.year_label),
    sortYear: num(row.sort_year),
    era: str(row.era, "medieval") as EraKey,
    region: row.region === "world" ? "world" : "mn",
    place: str(row.place),
    summary: str(row.summary),
    cause: nullableStr(row.cause),
    course: nullableStr(row.course),
    result: nullableStr(row.result),
    significance: nullableStr(row.significance),
    figureSlugs: strArray(row.figure_slugs),
    icon: str(row.icon, "📌"),
    tags: strArray(row.tags),
  };
}

/* ────────────  Эх сурвалж / Нэр томьёо  ──────────── */

export function mapSource(row: Row): HistoricalSource {
  return {
    id: str(row.id),
    title: str(row.title),
    kind: str(row.kind, "written") as SourceKind,
    origin: str(row.origin),
    year: str(row.year_label),
    excerpt: str(row.excerpt),
    analysisQuestion: str(row.analysis_question),
    guidance: str(row.guidance),
    tags: strArray(row.tags),
  };
}

export function mapTerm(row: Row): GlossaryTerm {
  return {
    term: str(row.term),
    definition: str(row.definition),
    category: str(row.category, "Бусад"),
    relatedTerms: strArray(row.related_terms),
  };
}

/* ────────────  Тест / Шалгалт  ──────────── */

export function mapQuestion(row: Row): Question {
  return {
    id: str(row.id),
    grade: typeof row.grade === "number" ? (row.grade as GradeNumber) : null,
    topic: str(row.topic),
    era: str(row.era, "medieval") as EraKey,
    difficulty: str(row.difficulty, "medium") as Difficulty,
    type: str(row.type, "multiple_choice") as QuestionType,
    prompt: str(row.prompt),
    options: Array.isArray(row.options) ? strArray(row.options) : undefined,
    answerIndex:
      typeof row.answer_index === "number" ? row.answer_index : undefined,
    answerText: nullableStr(row.answer_text),
    pairs: Array.isArray(row.pairs) ? (row.pairs as Question["pairs"]) : undefined,
    sequence: Array.isArray(row.sequence) ? strArray(row.sequence) : undefined,
    explanation: str(row.explanation),
    source: nullableStr(row.source),
    tags: strArray(row.tags),
  };
}

export function mapExam(row: Row): Exam {
  return {
    slug: str(row.slug),
    kind: str(row.kind, "practice") as ExamKind,
    title: str(row.title),
    subtitle: str(row.subtitle),
    description: str(row.description),
    icon: str(row.icon, "📝"),
    questionCount: num(row.question_count, 20),
    duration: num(row.duration),
    difficulty: str(row.difficulty, "medium") as Difficulty,
    topics: strArray(row.topics),
    filter: (row.filter ?? {}) as Exam["filter"],
  };
}

/* ────────────  Тоглоом  ──────────── */

export function mapGame(row: Row): Game {
  return {
    slug: str(row.slug),
    kind: str(row.kind, "quiz_rush") as GameKind,
    title: str(row.title),
    description: str(row.description),
    icon: str(row.icon, "🎮"),
    grades: Array.isArray(row.grades)
      ? (row.grades.filter((item) => typeof item === "number") as GradeNumber[])
      : [],
    difficulty: str(row.difficulty, "medium") as Difficulty,
    playable: bool(row.playable),
    xp: num(row.xp, 10),
  };
}

/* ────────────  Мэдээ / Амжилт  ──────────── */

export function mapAnnouncement(row: Row): Announcement {
  return {
    id: str(row.id),
    title: str(row.title),
    body: str(row.body),
    category: str(row.category, "Мэдээ"),
    author: str(row.author),
    publishedAt: str(row.published_at),
    pinned: bool(row.pinned),
    icon: str(row.icon, "📢"),
  };
}

export function mapAchievement(row: Row): Achievement {
  return {
    id: str(row.id),
    title: str(row.title),
    description: str(row.description),
    icon: str(row.icon, "🏅"),
    requirement: str(row.requirement),
    xp: num(row.xp),
  };
}
