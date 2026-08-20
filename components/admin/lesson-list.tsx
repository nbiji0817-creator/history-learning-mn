"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Lesson } from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { deleteLesson, toggleLessonPublished } from "@/lib/actions/content";
import { cn, difficultyLabels } from "@/lib/utils";

export function LessonList({ lessons }: { lessons: Lesson[] }) {
  const router = useRouter();

  const [grade, setGrade] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return lessons.filter((lesson) => {
      if (grade !== "all" && lesson.grade !== grade) return false;
      if (
        needle &&
        !`${lesson.title} ${lesson.subtitle} ${lesson.slug}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [lessons, grade, query]);

  const run = async (id: string, task: () => Promise<{ error: string | null }>) => {
    setBusyId(id);
    setError(null);
    const result = await task();
    setBusyId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">
          Нийт <b>{lessons.length}</b> хичээл ·{" "}
          {lessons.filter((item) => !item.published).length} ноорог
        </p>
        <Link
          href="/admin/lessons/new"
          className="inline-flex items-center rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-[#1c1a17]"
        >
          + Хичээл нэмэх
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Хичээл хайх…"
            className="flex-1 rounded-xl border border-line bg-muted/40 px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGrade("all")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold",
              grade === "all" ? "border-gold bg-gold/15 text-gold" : "border-line",
            )}
          >
            Бүгд
          </button>
          {[6, 7, 8, 9, 10, 11, 12].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setGrade(item)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold",
                grade === item ? "border-gold bg-gold/15 text-gold" : "border-line",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-fg-muted">{filtered.length} харагдаж байна</p>
      </Card>

      {error ? (
        <p className="rounded-xl bg-clay/10 p-4 text-sm text-clay">{error}</p>
      ) : null}

      <div className="space-y-3">
        {filtered.map((lesson) => (
          <Card key={lesson.id} className="p-4">
            <div className="flex flex-wrap items-start gap-4">
              <span className="text-3xl" aria-hidden>
                {lesson.icon}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{lesson.title}</h3>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-fg-muted">
                    {lesson.grade}-р анги · {lesson.order}
                  </span>
                  {lesson.published ? (
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      Нийтэлсэн
                    </span>
                  ) : (
                    <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-bold text-gold">
                      Ноорог
                    </span>
                  )}
                  <span className="text-[11px] text-fg-muted">
                    {difficultyLabels[lesson.difficulty]} · {lesson.sections.length} блок
                  </span>
                </div>

                <p className="mt-1 font-mono text-xs text-fg-muted">/{lesson.slug}</p>
                <p className="mt-1.5 line-clamp-2 text-sm text-fg-muted">
                  {lesson.summary}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/lessons/${lesson.slug}`}
                  target="_blank"
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
                >
                  Үзэх ↗
                </Link>
                <Link
                  href={`/admin/lessons/${lesson.id}/edit`}
                  className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold transition hover:bg-line"
                >
                  Засах
                </Link>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busyId === lesson.id}
                  onClick={() =>
                    void run(lesson.id, () =>
                      toggleLessonPublished(lesson.id, !lesson.published),
                    )
                  }
                >
                  {lesson.published ? "Нуух" : "Нийтлэх"}
                </Button>

                {confirmId === lesson.id ? (
                  <span className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busyId === lesson.id}
                      onClick={() =>
                        void run(lesson.id, async () => {
                          const result = await deleteLesson(lesson.id);
                          setConfirmId(null);
                          return result;
                        })
                      }
                    >
                      Устгахыг батлах
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmId(null)}
                    >
                      Болих
                    </Button>
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmId(lesson.id)}
                  >
                    Устгах
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-fg-muted">
            Хичээл олдсонгүй.
          </p>
        ) : null}
      </div>
    </div>
  );
}
