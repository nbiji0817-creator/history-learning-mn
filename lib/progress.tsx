"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Progress, QuizAttempt } from "@/types";
import { achievements } from "@/data/community";

/**
 * Сурагчийн ахицыг хадгалах store.
 *
 * PHASE 1: localStorage. PHASE 2: Supabase-ийн `progress`, `quiz_attempts`,
 * `game_scores`, `user_achievements` хүснэгтүүд рүү бичнэ — доорх `persist`
 * функцийг солиход хангалттай.
 */

const STORAGE_KEY = "tuuhee-medye:progress:v1";

const emptyProgress: Progress = {
  userId: "local",
  xp: 0,
  streak: 0,
  completedLessonIds: [],
  viewedLessonIds: [],
  achievementIds: [],
  quizAttempts: [],
  gameScores: [],
  topicMastery: {},
  lastActiveAt: "",
};

interface ProgressContextValue {
  progress: Progress;
  ready: boolean;
  markViewed: (lessonId: string) => void;
  markCompleted: (lessonId: string) => void;
  recordQuizAttempt: (attempt: Omit<QuizAttempt, "id" | "userId">) => void;
  recordGameScore: (gameSlug: string, score: number, xp: number) => void;
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const first = new Date(a).getTime();
  const second = new Date(b).getTime();
  if (Number.isNaN(first) || Number.isNaN(second)) return Number.POSITIVE_INFINITY;
  return Math.round((second - first) / 86_400_000);
}

/** Ахицад тулгуурлан аваарай гэсэн шинэ badge-үүдийг тооцно. */
function evaluateAchievements(progress: Progress): string[] {
  const earned = new Set(progress.achievementIds);
  const correctTotal = Object.values(progress.topicMastery).reduce(
    (sum, item) => sum + item.correct,
    0,
  );

  const conditions: Record<string, boolean> = {
    "ach-first-lesson": progress.completedLessonIds.length >= 1,
    "ach-beginner": progress.completedLessonIds.length >= 5,
    "ach-empire": progress.completedLessonIds.length >= 12,
    "ach-source": progress.viewedLessonIds.length >= 10,
    "ach-100": correctTotal >= 100,
    "ach-streak-7": progress.streak >= 7,
    "ach-exam": progress.quizAttempts.some((attempt) => attempt.total >= 20),
    "ach-gamer": new Set(progress.gameScores.map((item) => item.gameSlug)).size >= 5,
    "ach-hunnu": progress.quizAttempts.some(
      (attempt) => attempt.total > 0 && attempt.score / attempt.total >= 0.9,
    ),
  };

  for (const achievement of achievements) {
    if (conditions[achievement.id] && !earned.has(achievement.id)) {
      earned.add(achievement.id);
    }
  }

  return Array.from(earned);
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage нь зөвхөн браузерт байдаг тул mount-ийн дараа уншина
        setProgress({ ...emptyProgress, ...(JSON.parse(raw) as Progress) });
      }
    } catch {
      // Хадгалсан өгөгдөл эвдэрсэн бол шинээр эхэлнэ.
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: Progress) => {
    setProgress(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Хадгалах эрхгүй (private mode) байж болно — UI үргэлжилнэ.
    }
  }, []);

  /** Идэвхтэй өдрийн дараалал (streak)-ыг шинэчилнэ. */
  const touch = useCallback((current: Progress): Progress => {
    const today = todayKey();
    if (current.lastActiveAt === today) return current;

    const gap = current.lastActiveAt
      ? daysBetween(current.lastActiveAt, today)
      : Number.POSITIVE_INFINITY;

    return {
      ...current,
      streak: gap === 1 ? current.streak + 1 : 1,
      lastActiveAt: today,
    };
  }, []);

  const markViewed = useCallback(
    (lessonId: string) => {
      setProgress((current) => {
        if (current.viewedLessonIds.includes(lessonId)) return current;
        const next = touch({
          ...current,
          viewedLessonIds: [...current.viewedLessonIds, lessonId],
          xp: current.xp + 5,
        });
        const withAchievements = {
          ...next,
          achievementIds: evaluateAchievements(next),
        };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withAchievements));
        } catch {
          /* ignore */
        }
        return withAchievements;
      });
    },
    [touch],
  );

  const markCompleted = useCallback(
    (lessonId: string) => {
      setProgress((current) => {
        if (current.completedLessonIds.includes(lessonId)) return current;
        const next = touch({
          ...current,
          completedLessonIds: [...current.completedLessonIds, lessonId],
          viewedLessonIds: current.viewedLessonIds.includes(lessonId)
            ? current.viewedLessonIds
            : [...current.viewedLessonIds, lessonId],
          xp: current.xp + 25,
        });
        const withAchievements = {
          ...next,
          achievementIds: evaluateAchievements(next),
        };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withAchievements));
        } catch {
          /* ignore */
        }
        return withAchievements;
      });
    },
    [touch],
  );

  const recordQuizAttempt = useCallback(
    (attempt: Omit<QuizAttempt, "id" | "userId">) => {
      setProgress((current) => {
        const mastery = { ...current.topicMastery };
        for (const answer of attempt.answers) {
          const entry = mastery[answer.topic] ?? { correct: 0, total: 0 };
          mastery[answer.topic] = {
            correct: entry.correct + (answer.correct ? 1 : 0),
            total: entry.total + 1,
          };
        }

        const next = touch({
          ...current,
          xp: current.xp + attempt.score * 5,
          topicMastery: mastery,
          quizAttempts: [
            ...current.quizAttempts,
            {
              ...attempt,
              id: `attempt-${Date.now()}`,
              userId: current.userId,
            },
          ].slice(-50),
        });

        const withAchievements = {
          ...next,
          achievementIds: evaluateAchievements(next),
        };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withAchievements));
        } catch {
          /* ignore */
        }
        return withAchievements;
      });
    },
    [touch],
  );

  const recordGameScore = useCallback(
    (gameSlug: string, score: number, xp: number) => {
      setProgress((current) => {
        const next = touch({
          ...current,
          xp: current.xp + xp,
          gameScores: [
            ...current.gameScores,
            { gameSlug, score, playedAt: new Date().toISOString() },
          ].slice(-50),
        });
        const withAchievements = {
          ...next,
          achievementIds: evaluateAchievements(next),
        };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withAchievements));
        } catch {
          /* ignore */
        }
        return withAchievements;
      });
    },
    [touch],
  );

  const reset = useCallback(() => {
    persist(emptyProgress);
  }, [persist]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      ready,
      markViewed,
      markCompleted,
      recordQuizAttempt,
      recordGameScore,
      reset,
    }),
    [progress, ready, markViewed, markCompleted, recordQuizAttempt, recordGameScore, reset],
  );

  return <ProgressContext value={value}>{children}</ProgressContext>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress-ыг ProgressProvider дотор ашиглана уу.");
  }
  return context;
}

/** Сул сэдвийг тодорхойлно — 70%-иас доош эзэмшилттэй сэдвүүд. */
export function weakTopics(progress: Progress, threshold = 0.7) {
  return Object.entries(progress.topicMastery)
    .filter(([, value]) => value.total >= 2 && value.correct / value.total < threshold)
    .map(([topic, value]) => ({
      topic,
      percent: Math.round((value.correct / value.total) * 100),
      total: value.total,
    }))
    .sort((a, b) => a.percent - b.percent);
}

/** Хүчтэй сэдэв. */
export function strongTopics(progress: Progress, threshold = 0.8) {
  return Object.entries(progress.topicMastery)
    .filter(([, value]) => value.total >= 2 && value.correct / value.total >= threshold)
    .map(([topic, value]) => ({
      topic,
      percent: Math.round((value.correct / value.total) * 100),
      total: value.total,
    }))
    .sort((a, b) => b.percent - a.percent);
}
