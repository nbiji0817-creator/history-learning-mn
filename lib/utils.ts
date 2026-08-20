import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Массивыг тогтмол seed-гүйгээр холино (Fisher–Yates). */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function percent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

/** XP-ээс түвшин тооцох — түвшин бүр 100 XP-ээр өснө. */
export function levelFromXp(xp: number): { level: number; progress: number; next: number } {
  const level = Math.floor(xp / 100) + 1;
  const inLevel = xp % 100;
  return { level, progress: inLevel, next: 100 };
}

export const difficultyLabels: Record<string, string> = {
  easy: "Хялбар",
  medium: "Дунд",
  hard: "Хүнд",
  olympiad: "Олимпиад",
};

export const difficultyStyles: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  hard: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  olympiad: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export const questionTypeLabels: Record<string, string> = {
  multiple_choice: "Олон сонголт",
  true_false: "Үнэн / Худал",
  matching: "Тааруулах",
  ordering: "Дараалуулах",
  fill_blank: "Нөхөх",
};
