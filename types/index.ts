/**
 * Системийн бүх домэйн төрөл.
 * Эдгээр нь Supabase-ийн хүснэгтийн бүтэцтэй 1:1 тохирно
 * (supabase/migrations/0001_init.sql-ыг үз).
 */

/* ─────────────────────────  Хэрэглэгч  ───────────────────────── */

export type UserRole = "guest" | "student" | "parent" | "teacher" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  grade: GradeNumber | null;
  avatar: string;
  createdAt: string;
  /** Эцэг эхийн хувьд: холбогдсон сурагчдын id */
  childIds?: string[];
}

/* ─────────────────────────  Анги / Хичээл  ───────────────────────── */

export type GradeNumber = 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface Grade {
  grade: GradeNumber;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  /** Tailwind gradient-ийн ангиуд */
  accent: string;
  /** Тухайн ангид онцгойлон анхаарах зүйл (шалгалт г.м.) */
  focus?: string;
}

export type LessonSectionType =
  | "text"
  | "keypoints"
  | "concepts"
  | "infographic"
  | "timeline"
  | "map"
  | "figures"
  | "sources"
  | "video"
  | "quote";

export interface LessonSection {
  id: string;
  type: LessonSectionType;
  title: string;
  body?: string;
  /** type=keypoints — сурах бичгийн гол санаанууд */
  points?: string[];
  /** type=concepts */
  concepts?: { term: string; definition: string }[];
  /** type=timeline — timelineEvent.id-ууд */
  eventIds?: string[];
  /** type=figures — figure.slug-ууд */
  figureSlugs?: string[];
  /** type=sources — source.id-ууд */
  sourceIds?: string[];
  /** type=infographic */
  infographic?: Infographic;
  /** type=map */
  map?: MapView;
  /** type=video */
  videoUrl?: string;
  /** type=quote */
  quote?: { text: string; author: string };
}

export type InfographicKind = "stats" | "compare" | "flow" | "pyramid";

export interface Infographic {
  kind: InfographicKind;
  caption?: string;
  /** kind=stats */
  stats?: { label: string; value: string; hint?: string }[];
  /** kind=compare */
  compare?: {
    left: { title: string; items: string[] };
    right: { title: string; items: string[] };
  };
  /** kind=flow | pyramid */
  steps?: { title: string; body: string }[];
}

export interface MapMarker {
  id: string;
  name: string;
  /** Зурган дээрх байрлал, 0–100 хувиар */
  x: number;
  y: number;
  year: string;
  description: string;
  kind: "capital" | "battle" | "city" | "site";
}

export interface MapView {
  title: string;
  caption?: string;
  markers: MapMarker[];
}

export interface Lesson {
  id: string;
  slug: string;
  grade: GradeNumber;
  order: number;
  title: string;
  subtitle: string;
  icon: string;
  summary: string;
  /** Суралцах зорилго */
  objectives: string[];
  durationMinutes: number;
  difficulty: Difficulty;
  tags: string[];
  sections: LessonSection[];
  /** Хичээлийн төгсгөлийн дүгнэлт */
  conclusion: string;
  /** Гадаад эх сурвалж руу чиглүүлэх холбоос (жишээ нь medle.edu.mn) */
  externalLinks?: { label: string; url: string; provider: string }[];
  /** AI багшид өгөх санал болгосон асуултууд */
  aiPrompts: string[];
  quizId: string | null;
  gameSlug: string | null;
  published: boolean;
}

/* ─────────────────────────  Түүхэн хүн / үйл явдал  ───────────────────────── */

export interface HistoricalFigure {
  slug: string;
  name: string;
  title: string;
  /** Эмодзи эсвэл зургийн зам */
  portrait: string;
  born: string;
  died: string;
  era: EraKey;
  region: "mn" | "world";
  summary: string;
  achievements: string[];
  relatedFigureSlugs: string[];
  relatedEventIds: string[];
  tags: string[];
}

export interface HistoricalEvent {
  id: string;
  title: string;
  /** Дэлгэцэнд харагдах он (жишээ: "МЭӨ 209", "1206") */
  year: string;
  /** Эрэмбэлэхэд ашиглах тоон утга (МЭӨ бол сөрөг) */
  sortYear: number;
  era: EraKey;
  region: "mn" | "world";
  place: string;
  summary: string;
  cause?: string;
  course?: string;
  result?: string;
  significance?: string;
  figureSlugs: string[];
  icon: string;
  tags: string[];
}

export type EraKey = "ancient" | "medieval" | "modern" | "contemporary";

export interface Era {
  key: EraKey;
  label: string;
  range: string;
  color: string;
}

/* ─────────────────────────  Эх сурвалж / Нэр томьёо  ───────────────────────── */

export type SourceKind =
  | "written"
  | "archaeological"
  | "oral"
  | "photo"
  | "map"
  | "document"
  | "monument";

export interface HistoricalSource {
  id: string;
  title: string;
  kind: SourceKind;
  origin: string;
  year: string;
  excerpt: string;
  /** Сурагчид тавих шинжилгээний асуулт */
  analysisQuestion: string;
  /** Загвар хариулт — AI/багшийн тайлбар */
  guidance: string;
  tags: string[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms: string[];
}

/* ─────────────────────────  Тест / Шалгалт  ───────────────────────── */

export type Difficulty = "easy" | "medium" | "hard" | "olympiad";

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "matching"
  | "ordering"
  | "fill_blank";

export interface Question {
  id: string;
  grade: GradeNumber | null;
  topic: string;
  era: EraKey;
  difficulty: Difficulty;
  type: QuestionType;
  prompt: string;
  /** multiple_choice | true_false */
  options?: string[];
  /** multiple_choice → индекс, true_false → 0/1 */
  answerIndex?: number;
  /** fill_blank → зөв текст */
  answerText?: string;
  /** matching: зүүн ↔ баруун хос */
  pairs?: { left: string; right: string }[];
  /** ordering: зөв дараалал */
  sequence?: string[];
  explanation: string;
  source?: string;
  tags: string[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  grade: GradeNumber | null;
  questionIds: string[];
  /** Секундээр; null бол хугацаагүй */
  timeLimit: number | null;
  passScore: number;
}

export type ExamKind = "grade9" | "eesh" | "state" | "civil" | "practice";

export interface Exam {
  slug: string;
  kind: ExamKind;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  questionCount: number;
  /** Минутаар */
  duration: number;
  difficulty: Difficulty;
  topics: string[];
  /** Асуултын санг шүүх нөхцөл */
  filter: { grades?: GradeNumber[]; eras?: EraKey[]; tags?: string[] };
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: string;
  finishedAt: string;
  score: number;
  total: number;
  durationSeconds: number;
  answers: { questionId: string; topic: string; correct: boolean }[];
}

/* ─────────────────────────  Тоглоом / Симуляци  ───────────────────────── */

export type GameKind =
  | "timeline_order"
  | "who_is_it"
  | "match_pairs"
  | "memory"
  | "quiz_rush"
  | "true_false"
  | "map_challenge"
  | "word_search";

export interface Game {
  slug: string;
  kind: GameKind;
  title: string;
  description: string;
  icon: string;
  grades: GradeNumber[];
  difficulty: Difficulty;
  /** Phase 1-д тоглох боломжтой эсэх */
  playable: boolean;
  xp: number;
}

export interface SimulationChoice {
  id: string;
  label: string;
  description: string;
  effects: {
    economy?: number;
    army?: number;
    reputation?: number;
    people?: number;
  };
  outcome: string;
}

export interface SimulationScene {
  id: string;
  title: string;
  narrative: string;
  choices: SimulationChoice[];
}

export interface Simulation {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  intro: string;
  scenes: SimulationScene[];
  endings: { min: number; title: string; body: string }[];
}

/* ─────────────────────────  Ахиц / Gamification  ───────────────────────── */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Шаардлагатай нөхцөлийн тайлбар */
  requirement: string;
  xp: number;
}

export interface Progress {
  userId: string;
  xp: number;
  streak: number;
  completedLessonIds: string[];
  viewedLessonIds: string[];
  achievementIds: string[];
  quizAttempts: QuizAttempt[];
  gameScores: { gameSlug: string; score: number; playedAt: string }[];
  /** Сэдэв → зөв/нийт хариулт */
  topicMastery: Record<string, { correct: number; total: number }>;
  lastActiveAt: string;
}

/* ─────────────────────────  Мэдээ / Санал хүсэлт  ───────────────────────── */

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  author: string;
  publishedAt: string;
  pinned: boolean;
  icon: string;
}

export type FeedbackKind = "bug" | "content" | "idea" | "praise" | "other";

export interface Feedback {
  id: string;
  name: string;
  userType: "student" | "parent";
  kind: FeedbackKind;
  title: string;
  body: string;
  rating: number;
  createdAt: string;
  resolved: boolean;
}

/* ─────────────────────────  Номын сан  ───────────────────────── */

/**
 * Номын нэг хэсэг — хайлтын нэгж.
 *
 * Бүтэн бүлэг биш, 800–2600 тэмдэгтийн хэмжээтэй хэсэг. Ингэснээр
 * AI асуултад хамааралтай хэсгийг нь оновчтой олно.
 */
export interface LibraryChunk {
  id: string;
  order: number;
  /** Бүлэг / хэсгийн гарчиг */
  section: string;
  /** Дэд гарчиг (байвал) */
  sub?: string;
  /** Эх номын хуудасны муж (ж: "22-44") */
  pages?: string;
  body: string;
}

/**
 * Номын сангийн нэгж.
 *
 * ⚠️ `chunks` нь номын ЭХ БИЧВЭР БИШ — бүх хуудсыг уншиж гаргасан
 * судалгааны тэмдэглэл (хураангуй). UI дээр үүнийг ил тэмдэглэнэ.
 */
export interface LibraryBook {
  slug: string;
  title: string;
  author: string;
  /**
   * textbook — ЕБС-ийн сурах бичиг
   * primary  — анхдагч эх сурвалж (Нууц товчоо, Судрын чуулган)
   * academic — эрдэм шинжилгээний бүтээл (ШУА-ийн олон боть түүх)
   */
  kind: "textbook" | "primary" | "academic";
  grade?: GradeNumber;
  /** Зохиогдсон он (анхдагч эх сурвалжид) */
  year?: string;
  icon: string;
  /** Эх номын хуудасны тоо */
  pages: number;
  description: string;
  chunks: LibraryChunk[];
}

/* ─────────────────────────  AI  ───────────────────────── */

export type AiMode =
  | "ask"
  | "explain"
  | "quiz_me"
  | "challenge"
  | "teach"
  | "review_mistakes"
  | "debate"
  | "roleplay";

export interface AiModeInfo {
  key: AiMode;
  label: string;
  icon: string;
  hint: string;
}

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Мэдлэгийн сангаас олдсон эх сурвалж */
  citations?: { label: string; href: string }[];
  createdAt: string;
}

/* ─────────────────────────  Хайлт  ───────────────────────── */

export type SearchKind =
  | "lesson"
  | "figure"
  | "event"
  | "source"
  | "term"
  | "game"
  | "exam";

export interface SearchResult {
  kind: SearchKind;
  title: string;
  description: string;
  href: string;
  icon: string;
  badge: string;
}
