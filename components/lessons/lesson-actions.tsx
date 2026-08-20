"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/primitives";
import { useProgress } from "@/lib/progress";

/** Хичээл үзсэнийг автоматаар тэмдэглэж, дуусгах товч харуулна. */
export function LessonActions({ lessonId }: { lessonId: string }) {
  const { progress, ready, markViewed, markCompleted } = useProgress();

  useEffect(() => {
    if (ready) markViewed(lessonId);
  }, [ready, lessonId, markViewed]);

  const done = progress.completedLessonIds.includes(lessonId);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-muted/40 p-5">
      {done ? (
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
          ✅ Энэ хичээлийг дуусгасан байна
        </p>
      ) : (
        <>
          <Button onClick={() => markCompleted(lessonId)}>
            ✓ Хичээлийг дуусгах (+25 XP)
          </Button>
          <p className="text-sm text-fg-muted">
            Дуусгаснаар ахиц болон XP-д тооцогдоно.
          </p>
        </>
      )}
    </div>
  );
}

/** Ангийн хичээлийн жагсаалтад ахиц харуулах жижиг тэмдэг. */
export function LessonProgressBadge({ lessonId }: { lessonId: string }) {
  const { progress, ready } = useProgress();
  if (!ready) return null;

  if (progress.completedLessonIds.includes(lessonId)) {
    return (
      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
        ✓ Дууссан
      </span>
    );
  }

  if (progress.viewedLessonIds.includes(lessonId)) {
    return (
      <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-bold text-gold">
        ● Үзэж эхэлсэн
      </span>
    );
  }

  return null;
}

/** Ангийн ерөнхий гүйцэтгэлийн хувь. */
export function GradeCompletion({ lessonIds }: { lessonIds: string[] }) {
  const { progress, ready } = useProgress();
  if (!ready || lessonIds.length === 0) return null;

  const done = lessonIds.filter((id) =>
    progress.completedLessonIds.includes(id),
  ).length;
  const pct = Math.round((done / lessonIds.length) * 100);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>Ангийн гүйцэтгэл</span>
        <span className="text-gold">{pct}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-fg-muted">
        {lessonIds.length} хичээлээс {done} нь дууссан
      </p>
    </div>
  );
}
