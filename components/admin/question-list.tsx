"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Question } from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { deleteQuestion } from "@/lib/actions/content";
import { cn, difficultyLabels, questionTypeLabels } from "@/lib/utils";

const PAGE_SIZE = 25;

export function QuestionList({ questions }: { questions: Question[] }) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState<number | "all">("all");
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return questions.filter((question) => {
      if (grade !== "all" && question.grade !== grade) return false;
      if (
        needle &&
        !`${question.prompt} ${question.topic} ${question.tags.join(" ")}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [questions, query, grade]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const shown = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const remove = async (id: string) => {
    setBusyId(id);
    setError(null);
    const result = await deleteQuestion(id);
    setBusyId(null);
    setConfirmId(null);
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
          Нийт <b>{questions.length}</b> асуулт
        </p>
        <Link
          href="/admin/questions/new"
          className="inline-flex items-center rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-[#1c1a17]"
        >
          + Асуулт нэмэх
        </Link>
      </div>

      <Card>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          placeholder="Асуулт, сэдэв, шошгоор хайх…"
          className="w-full rounded-xl border border-line bg-muted/40 px-4 py-2.5 text-sm outline-none focus:border-gold"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setGrade("all");
              setPage(0);
            }}
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
              onClick={() => {
                setGrade(item);
                setPage(0);
              }}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold",
                grade === item ? "border-gold bg-gold/15 text-gold" : "border-line",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-fg-muted">
          {filtered.length} олдлоо · {current + 1} / {pageCount} хуудас
        </p>
      </Card>

      {error ? (
        <p className="rounded-xl bg-clay/10 p-4 text-sm text-clay">{error}</p>
      ) : null}

      <div className="space-y-3">
        {shown.map((question) => (
          <Card key={question.id} className="p-4">
            <div className="flex flex-wrap items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-fg-muted">
                    {question.grade ? `${question.grade}-р анги` : "Бүх анги"}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-fg-muted">
                    {question.topic}
                  </span>
                  <span className="text-[11px] text-fg-muted">
                    {questionTypeLabels[question.type]} ·{" "}
                    {difficultyLabels[question.difficulty]}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold">{question.prompt}</p>

                {question.options && question.answerIndex !== undefined ? (
                  <p className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-300">
                    ✓ {question.options[question.answerIndex]}
                  </p>
                ) : null}

                <p className="mt-1 font-mono text-[11px] text-fg-muted">
                  {question.id}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/questions/${encodeURIComponent(question.id)}/edit`}
                  className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold transition hover:bg-line"
                >
                  Засах
                </Link>

                {confirmId === question.id ? (
                  <span className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busyId === question.id}
                      onClick={() => void remove(question.id)}
                    >
                      Батлах
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
                    onClick={() => setConfirmId(question.id)}
                  >
                    Устгах
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-fg-muted">
            Асуулт олдсонгүй.
          </p>
        ) : null}
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            ← Өмнөх
          </Button>
          <span className="text-sm text-fg-muted">
            {current + 1} / {pageCount}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            Дараах →
          </Button>
        </div>
      ) : null}
    </div>
  );
}
