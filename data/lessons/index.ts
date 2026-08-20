import type { GradeNumber, Lesson } from "@/types";
import { grade6Lessons } from "./grade6";
import { grade7Lessons } from "./grade7";
import { grade8Lessons } from "./grade8";
import { grade9Lessons } from "./grade9";
import { grade10Lessons } from "./grade10";
import { grade11Lessons } from "./grade11";
import { grade12Lessons } from "./grade12";
import { grade7TextbookLessons } from "./grade7-textbook";
import { grade8TextbookLessons } from "./grade8-textbook";
import { grade9TextbookLessons } from "./grade9-textbook";
import { grade10TextbookLessons } from "./grade10-textbook";

/**
 * ХИЧЭЭЛИЙН НЭГДСЭН САН
 *
 * Хоёр эх сурвалжаас бүрдэнэ:
 *
 * 1. СУРАХ БИЧГИЙН ХИЧЭЭЛ (7–10-р анги) — ерөнхий боловсролын сурах бичгийн
 *    бүлэг, хуудсын дагуу. Эдгээр нь ангийн үндсэн хөтөлбөр учир эхэнд
 *    эрэмбэлэгдэнэ.
 *
 * 2. НЭМЭЛТ ХИЧЭЭЛ — сэдэвчилсэн, гүнзгийрүүлсэн хичээлүүд (инфографик,
 *    газрын зураг, он цагийн хэлхээс, түүхэн хүмүүс, эх сурвалжтай).
 *    Сурах бичгийн хичээлтэй давхцахгүйн тулд order-ыг 100-аас эхлүүлж,
 *    «нэмэлт» шошготой болгоно.
 *
 * 6, 11, 12-р ангид сурах бичгийн хувилбар байхгүй тул нэмэлт хичээлүүд нь
 * үндсэн хөтөлбөр болно.
 */

const textbookLessons: Lesson[] = [
  ...grade7TextbookLessons,
  ...grade8TextbookLessons,
  ...grade9TextbookLessons,
  ...grade10TextbookLessons,
];

/** 7–10-р ангид сурах бичгийн хичээл байгаа тул эдгээр нь нэмэлт болно. */
const supplementary: Lesson[] = [
  ...grade7Lessons,
  ...grade8Lessons,
  ...grade9Lessons,
  ...grade10Lessons,
].map((lesson) => ({
  ...lesson,
  order: 100 + lesson.order,
  tags: [...lesson.tags, "нэмэлт"],
}));

/** Сурах бичгийн хувилбаргүй ангиуд — үндсэн хөтөлбөр хэвээр. */
const core: Lesson[] = [...grade6Lessons, ...grade11Lessons, ...grade12Lessons];

export const lessons: Lesson[] = [...textbookLessons, ...core, ...supplementary];

export const lessonBySlug = new Map<string, Lesson>(
  lessons.map((lesson) => [lesson.slug, lesson]),
);

export const lessonById = new Map<string, Lesson>(
  lessons.map((lesson) => [lesson.id, lesson]),
);

export function lessonsByGrade(grade: GradeNumber): Lesson[] {
  return lessons
    .filter((lesson) => lesson.grade === grade && lesson.published)
    .sort((a, b) => a.order - b.order);
}

/** Тухайн ангид сурах бичгийн хичээл байгаа эсэх. */
export function hasTextbookLessons(grade: GradeNumber): boolean {
  return textbookLessons.some((lesson) => lesson.grade === grade);
}
