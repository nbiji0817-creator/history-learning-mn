import type { GradeNumber, Quiz } from "@/types";
import { lessons } from "./lessons";
import { questions } from "./questions";

/**
 * Хичээл бүрийн тестийг асуултын сангаас автоматаар угсарна.
 * Эхлээд хичээлийн slug-тай таарсан асуултыг авч, хүрэлцэхгүй бол
 * ижил ангийн бусад асуултаар нөхнө.
 */
const MIN_QUESTIONS = 4;
const MAX_QUESTIONS = 8;

function buildLessonQuiz(
  quizId: string,
  title: string,
  grade: GradeNumber,
  slug: string,
): Quiz {
  const tagged = questions.filter((question) => question.tags.includes(slug));
  const sameGrade = questions.filter(
    (question) => question.grade === grade && !tagged.includes(question),
  );

  const picked = [...tagged];
  for (const question of sameGrade) {
    if (picked.length >= MIN_QUESTIONS) break;
    picked.push(question);
  }

  return {
    id: quizId,
    title: `${title} — тест`,
    description: "Хичээлийн мэдлэгээ шалгах богино тест.",
    grade,
    questionIds: picked.slice(0, MAX_QUESTIONS).map((question) => question.id),
    timeLimit: null,
    passScore: 60,
  };
}

/** Ангийн жилийн эцсийн нэгдсэн тест. */
function buildFinalQuiz(quizId: string, grade: GradeNumber): Quiz {
  const pool = questions.filter((question) => question.grade === grade);
  return {
    id: quizId,
    title: `${grade}-р ангийн нэгдсэн тест`,
    description: "Жилийн туршид үзсэн бүх сэдвийг хамарсан давтлагын тест.",
    grade,
    questionIds: pool.map((question) => question.id),
    timeLimit: 20 * 60,
    passScore: 70,
  };
}

const lessonQuizzes: Quiz[] = lessons
  .filter((lesson) => lesson.quizId && !lesson.quizId.endsWith("-final"))
  .map((lesson) =>
    buildLessonQuiz(lesson.quizId!, lesson.title, lesson.grade, lesson.slug),
  );

const finalQuizIds = new Set(
  lessons
    .map((lesson) => lesson.quizId)
    .filter((id): id is string => Boolean(id) && id!.endsWith("-final")),
);

const finalQuizzes: Quiz[] = Array.from(finalQuizIds).map((quizId) => {
  const lesson = lessons.find((item) => item.quizId === quizId)!;
  return buildFinalQuiz(quizId, lesson.grade);
});

export const quizzes: Quiz[] = [...lessonQuizzes, ...finalQuizzes];

export const quizMap = new Map<string, Quiz>(
  quizzes.map((quiz) => [quiz.id, quiz]),
);
