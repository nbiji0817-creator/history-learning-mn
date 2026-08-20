import type { Question } from "@/types";
import { curatedQuestions } from "./questions-curated";
import { textbookQuestions } from "./questions-textbook";

export const questions: Question[] = [...curatedQuestions, ...textbookQuestions];

export const questionMap = new Map<string, Question>(
  questions.map((question) => [question.id, question]),
);

export { curatedQuestions, textbookQuestions };
