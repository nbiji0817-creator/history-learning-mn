import type { HistoricalEvent, Lesson, Question } from "@/types";

/**
 * ХИЧЭЭЛИЙН ИНТЕРАКТИВ ДАСГАЛЫН ӨГӨГДӨЛ
 *
 * 160 хичээл бүрд гараар симуляц бичих боломжгүй. Оронд нь ХИЧЭЭЛИЙН
 * ӨӨРИЙНХ НЬ өгөгдлөөс дасгал үүсгэнэ.
 *
 * ⚠️ ЧАНАР > ХАМРАХ ХҮРЭЭ
 * Эхний хувилбарт шошго, гарчгийн үгээр «ойролцоо» үйл явдал хайж
 * 99% хамрах хүрээ гаргасан боловч чанар нь тааруу байв: «VI–XII
 * зууны Монголын аймгууд» хичээлд 1939 оны Халхын голын дайн,
 * «Бидний мэдэх Чингис хаан»-д Дэлхийн дайн санал болгож байлаа.
 * Ийм дүүргэлт сурагчийг төөрөгдүүлнэ.
 *
 * Тиймээс зөвхөн НАЙДВАРТАЙ холбоос ашиглана:
 *   • Он цагийн хэсэгт ЗААСАН үйл явдал   —  25 хичээл
 *   • Хичээлийн slug шошготой асуулт      — 135 хичээл
 *   • Хичээлийн өөрийнх нь гол санаа      — 108 хичээл
 *   • Хичээлийн өөрийнх нь нэр томьёо     —  18 хичээл
 * Нийлбэр: 157 / 160 хичээл дасгалтай (98%).
 */

export interface ClozeItem {
  /** Гол санаа, нэг үгийг нь нуусан */
  masked: string;
  answer: string;
  options: string[];
}

export interface ConceptPair {
  term: string;
  definition: string;
}

export interface LessonLabData {
  events: HistoricalEvent[];
  questions: Question[];
  cloze: ClozeItem[];
  concepts: ConceptPair[];
  hasAnything: boolean;
}

const MAX_QUESTIONS = 5;
const MAX_CLOZE = 5;
const MAX_CONCEPTS = 6;

/* Нөхөх дасгалд нуухгүй түгээмэл үг */
const COMMON = new Set([
  "монгол", "монголын", "улсын", "түүх", "түүхийн", "байсан",
  "болсон", "байна", "гэдэг", "тухай", "хийсэн", "болох", "байх",
  "тэдгээр", "энэхүү", "дараа", "өмнө", "бүхий", "хамгийн",
]);

/**
 * Гол санаанаас нэг ОНЦЛОХ үгийг нуун, нөхөх дасгал үүсгэнэ.
 *
 * Нуух үг нь 6-аас урт, түгээмэл биш, тухайн өгүүлбэрт НЭГ Л УДАА
 * орсон байх ёстой — эс бөгөөс нөхөх байрлал хоёрдмол утгатай болно.
 * Он тоог нуухгүй: «1206» гэдгийг сонголтоос таах нь уншихгүйгээр
 * таамаглах дасгал болно.
 */
function buildCloze(points: string[]): ClozeItem[] {
  const pool = new Set<string>();

  const pick = (text: string): string | null => {
    const candidates = text
      .split(/[\s,.;:—–()«»"]+/)
      .filter((word) => word.length >= 6 && !COMMON.has(word.toLowerCase()))
      .filter((word) => !/^\d+$/.test(word))
      /* Өгүүлбэрт давхардаагүй үг */
      .filter((word) => text.split(word).length === 2);

    return candidates[Math.floor(candidates.length / 2)] ?? null;
  };

  const chosen: { text: string; word: string }[] = [];

  for (const point of points) {
    const word = pick(point);
    if (!word) continue;
    chosen.push({ text: point, word });
    pool.add(word);
  }

  return chosen.slice(0, MAX_CLOZE).map(({ text, word }) => {
    const distractors = [...pool].filter((item) => item !== word).slice(0, 2);

    return {
      masked: text.replace(word, "_____"),
      answer: word,
      options: [word, ...distractors],
    };
  });
}

export function buildLessonLabData(
  lesson: Lesson,
  allEvents: HistoricalEvent[],
  allQuestions: Question[],
): LessonLabData {
  /* 1. Он цагийн хэсэгт ЗААСАН үйл явдал — таамаглаж нэмэхгүй */
  const ids = new Set(
    lesson.sections
      .filter((section) => section.type === "timeline")
      .flatMap((section) => section.eventIds ?? []),
  );

  const events = allEvents
    .filter((event) => ids.has(event.id))
    .sort((a, b) => a.sortYear - b.sortYear);

  /* 2. Хичээлийн slug шошготой асуулт — `data/quizzes.ts`-тай ижил зарчим */
  const questions = allQuestions
    .filter(
      (question) =>
        question.tags.includes(lesson.slug) &&
        question.options &&
        question.options.length >= 2 &&
        question.answerIndex !== undefined,
    )
    .slice(0, MAX_QUESTIONS);

  /* 3. Хичээлийн өөрийнх нь гол санаа → нөхөх дасгал */
  const points = lesson.sections
    .filter((section) => section.type === "keypoints")
    .flatMap((section) => section.points ?? []);

  const cloze = points.length >= 3 ? buildCloze(points) : [];

  /* 4. Хичээлийн өөрийнх нь нэр томьёо → хослуулах дасгал */
  const concepts = lesson.sections
    .filter((section) => section.type === "concepts")
    .flatMap((section) => section.concepts ?? [])
    .slice(0, MAX_CONCEPTS);

  return {
    events,
    questions,
    cloze,
    concepts,
    hasAnything:
      events.length >= 2 ||
      questions.length >= 1 ||
      cloze.length >= 2 ||
      concepts.length >= 2,
  };
}
