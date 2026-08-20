"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Question } from "@/types";
import { Button, Card, ProgressBar } from "@/components/ui/primitives";
import { useProgress } from "@/lib/progress";
import {
  cn,
  difficultyLabels,
  difficultyStyles,
  formatDuration,
  percent,
  questionTypeLabels,
  shuffle,
} from "@/lib/utils";

type Answer = string | number | string[] | Record<string, string> | null;

export interface QuizRunnerProps {
  quizId: string;
  title: string;
  questions: Question[];
  /** Секундээр; null бол хугацаагүй */
  timeLimit?: number | null;
  /** Тэнцэх босго, хувиар */
  passScore?: number;
  /** Шалгалтын горим — асуулт хооронд буцахыг хориглоно */
  examMode?: boolean;
  backHref?: string;
  backLabel?: string;
}

/** Хариулт зөв эсэхийг асуултын төрлөөс хамааруулан шалгана. */
function isCorrect(question: Question, answer: Answer): boolean {
  if (answer === null || answer === undefined) return false;

  switch (question.type) {
    case "multiple_choice":
    case "true_false":
      return answer === question.answerIndex;

    case "fill_blank":
      return (
        typeof answer === "string" &&
        answer.trim().toLowerCase() ===
          (question.answerText ?? "").trim().toLowerCase()
      );

    case "ordering": {
      const sequence = question.sequence ?? [];
      return (
        Array.isArray(answer) &&
        answer.length === sequence.length &&
        answer.every((item, index) => item === sequence[index])
      );
    }

    case "matching": {
      const pairs = question.pairs ?? [];
      if (typeof answer !== "object" || Array.isArray(answer)) return false;
      return pairs.every((pair) => (answer as Record<string, string>)[pair.left] === pair.right);
    }

    default:
      return false;
  }
}

export function QuizRunner({
  quizId,
  title,
  questions,
  timeLimit = null,
  passScore = 60,
  examMode = false,
  backHref,
  backLabel = "Буцах",
}: QuizRunnerProps) {
  const { recordQuizAttempt } = useProgress();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [finished, setFinished] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(timeLimit);
  const startedAt = useRef(new Date().toISOString());
  const recorded = useRef(false);

  const current = questions[index];
  const total = questions.length;

  /*
   * Дараалуулах асуултын анхны эмх замбараагүй дараалал.
   * Санамсаргүй холилтыг зөвхөн браузерт хийнэ — эс тэгвэл сервер болон
   * клиентийн HTML зөрж hydration алдаа гарна.
   */
  const [shuffledSequences, setShuffledSequences] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    const map: Record<string, string[]> = {};
    for (const question of questions) {
      if (question.type === "ordering" && question.sequence) {
        map[question.id] = shuffle(question.sequence);
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- санамсаргүй холилтыг зөвхөн браузерт хийж hydration зөрчлөөс сэргийлнэ
    setShuffledSequences(map);
  }, [questions]);

  const finish = useCallback(() => {
    setFinished(true);
  }, []);

  /* Таймер */
  useEffect(() => {
    if (timeLimit === null || finished) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value === null) return null;
        if (value <= 1) {
          window.clearInterval(timer);
          setFinished(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timeLimit, finished]);

  const results = useMemo(
    () =>
      questions.map((question) => ({
        question,
        given: answers[question.id] ?? null,
        correct: isCorrect(question, answers[question.id] ?? null),
      })),
    [questions, answers],
  );

  const score = results.filter((item) => item.correct).length;

  /* Ахицад бүртгэх — нэг л удаа */
  useEffect(() => {
    if (!finished || recorded.current || total === 0) return;
    recorded.current = true;
    const finishedAt = new Date().toISOString();
    recordQuizAttempt({
      quizId,
      startedAt: startedAt.current,
      finishedAt,
      score,
      total,
      durationSeconds: Math.max(
        1,
        Math.round(
          (new Date(finishedAt).getTime() - new Date(startedAt.current).getTime()) /
            1000,
        ),
      ),
      answers: results.map((item) => ({
        questionId: item.question.id,
        topic: item.question.topic,
        correct: item.correct,
      })),
    });
  }, [finished, quizId, score, total, results, recordQuizAttempt]);

  if (total === 0) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">Энэ тестэд асуулт олдсонгүй.</p>
      </Card>
    );
  }

  if (finished) {
    return (
      <QuizResult
        title={title}
        results={results}
        score={score}
        total={total}
        passScore={passScore}
        backHref={backHref}
        backLabel={backLabel}
        onRetry={() => {
          setAnswers({});
          setIndex(0);
          setFinished(false);
          setRemaining(timeLimit);
          startedAt.current = new Date().toISOString();
          recorded.current = false;
        }}
      />
    );
  }

  const setAnswer = (value: Answer) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const answered = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      {/* Толгой хэсэг */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-gold">
            Асуулт {index + 1} / {total}
          </p>
          <h2 className="text-lg font-black">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          {remaining !== null ? (
            <span
              className={cn(
                "rounded-xl px-4 py-2 font-mono text-lg font-black",
                remaining <= 60 ? "bg-clay/15 text-clay" : "bg-muted text-fg",
              )}
              role="timer"
            >
              ⏱ {formatDuration(remaining)}
            </span>
          ) : null}
          <span className="text-sm text-fg-muted">Хариулсан: {answered}</span>
        </div>
      </div>

      <ProgressBar value={index + 1} max={total} />

      {/* Асуулт */}
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${difficultyStyles[current.difficulty]}`}
          >
            {difficultyLabels[current.difficulty]}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-fg-muted">
            {questionTypeLabels[current.type]}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-fg-muted">
            {current.topic}
          </span>
        </div>

        <h3 className="mt-5 text-lg font-bold leading-8">{current.prompt}</h3>

        <div className="mt-6">
          {(current.type === "multiple_choice" || current.type === "true_false") &&
          current.options ? (
            <div className="space-y-3">
              {current.options.map((option, optionIndex) => {
                const selected = answers[current.id] === optionIndex;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswer(optionIndex)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm transition",
                      selected
                        ? "border-gold bg-gold/10 font-semibold"
                        : "border-line hover:border-gold/50 hover:bg-muted",
                    )}
                    aria-pressed={selected}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black",
                        selected ? "bg-gold text-[#1c1a17]" : "bg-muted text-fg-muted",
                      )}
                    >
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="leading-6">{option}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {current.type === "fill_blank" ? (
            <input
              type="text"
              value={(answers[current.id] as string) ?? ""}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Хариултаа бичнэ үү"
              className="w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-base outline-none focus:border-gold"
            />
          ) : null}

          {current.type === "matching" && current.pairs ? (
            <MatchingInput
              pairs={current.pairs}
              value={(answers[current.id] as Record<string, string>) ?? {}}
              onChange={setAnswer}
            />
          ) : null}

          {current.type === "ordering" && current.sequence ? (
            shuffledSequences[current.id] ? (
              <OrderingInput
                items={
                  (answers[current.id] as string[]) ?? shuffledSequences[current.id]
                }
                onChange={setAnswer}
              />
            ) : (
              <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-fg-muted">
                Ачаалж байна…
              </p>
            )
          ) : null}
        </div>
      </Card>

      {/* Навигаци */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {!examMode ? (
            <Button
              variant="secondary"
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
              disabled={index === 0}
            >
              ← Өмнөх
            </Button>
          ) : null}
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
            >
              {backLabel}
            </Link>
          ) : null}
        </div>

        {index < total - 1 ? (
          <Button onClick={() => setIndex((value) => value + 1)}>Дараах →</Button>
        ) : (
          <Button onClick={finish}>Дуусгах ✓</Button>
        )}
      </div>

      {!examMode ? (
        <div className="flex flex-wrap gap-1.5">
          {questions.map((question, questionIndex) => (
            <button
              key={question.id}
              type="button"
              onClick={() => setIndex(questionIndex)}
              className={cn(
                "h-8 w-8 rounded-lg text-xs font-bold transition",
                questionIndex === index
                  ? "bg-gold text-[#1c1a17]"
                  : answers[question.id] !== undefined
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted text-fg-muted hover:bg-line",
              )}
              aria-label={`${questionIndex + 1}-р асуулт руу очих`}
            >
              {questionIndex + 1}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────  Тааруулах  ───────────────────────── */

function MatchingInput({
  pairs,
  value,
  onChange,
}: {
  pairs: { left: string; right: string }[];
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}) {
  const options = useMemo(
    () => [...pairs.map((pair) => pair.right)].sort((a, b) => a.localeCompare(b, "mn")),
    [pairs],
  );

  return (
    <div className="space-y-3">
      {pairs.map((pair) => (
        <div
          key={pair.left}
          className="flex flex-col gap-2 rounded-xl border border-line p-4 sm:flex-row sm:items-center"
        >
          <span className="flex-1 text-sm font-semibold">{pair.left}</span>
          <select
            value={value[pair.left] ?? ""}
            onChange={(event) =>
              onChange({ ...value, [pair.left]: event.target.value })
            }
            className="flex-1 rounded-lg border border-line bg-muted/40 px-3 py-2 text-sm outline-none focus:border-gold"
            aria-label={`${pair.left}-ийн хариулт`}
          >
            <option value="">— сонгоно уу —</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────  Дараалуулах  ───────────────────────── */

function OrderingInput({
  items,
  onChange,
}: {
  items: string[];
  onChange: (value: string[]) => void;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li
          key={item}
          className="flex items-center gap-3 rounded-xl border border-line p-3"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold text-xs font-black text-[#1c1a17]">
            {index + 1}
          </span>
          <span className="flex-1 text-sm">{item}</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => move(index, index - 1)}
              disabled={index === 0}
              className="rounded-lg bg-muted px-2.5 py-1 text-sm disabled:opacity-30"
              aria-label="Дээш зөөх"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(index, index + 1)}
              disabled={index === items.length - 1}
              className="rounded-lg bg-muted px-2.5 py-1 text-sm disabled:opacity-30"
              aria-label="Доош зөөх"
            >
              ↓
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ─────────────────────────  Үр дүн  ───────────────────────── */

function QuizResult({
  title,
  results,
  score,
  total,
  passScore,
  onRetry,
  backHref,
  backLabel,
}: {
  title: string;
  results: { question: Question; given: Answer; correct: boolean }[];
  score: number;
  total: number;
  passScore: number;
  onRetry: () => void;
  backHref?: string;
  backLabel: string;
}) {
  const pct = percent(score, total);
  const passed = pct >= passScore;

  /* Сэдэв тус бүрийн гүйцэтгэл */
  const byTopic = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    for (const item of results) {
      const entry = map[item.question.topic] ?? { correct: 0, total: 0 };
      map[item.question.topic] = {
        correct: entry.correct + (item.correct ? 1 : 0),
        total: entry.total + 1,
      };
    }
    return Object.entries(map).map(([topic, value]) => ({
      topic,
      ...value,
      pct: percent(value.correct, value.total),
    }));
  }, [results]);

  const weak = byTopic.filter((item) => item.pct < 70);
  const strong = byTopic.filter((item) => item.pct >= 80);

  const grade =
    pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";

  return (
    <div className="space-y-6">
      <Card className={passed ? "border-emerald-500/40" : "border-clay/40"}>
        <div className="text-center">
          <div className="text-6xl" aria-hidden>
            {pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : pct >= 50 ? "💪" : "📚"}
          </div>

          <h2 className="mt-4 text-2xl font-black">{title} — үр дүн</h2>

          <p className="mt-6 text-6xl font-black text-gold">{pct}%</p>

          <p className="mt-2 text-sm text-fg-muted">
            {total} асуултаас {score}-д зөв хариуллаа • Түвшин: <b>{grade}</b>
          </p>

          <p className="mx-auto mt-5 max-w-lg rounded-xl bg-muted/60 p-4 text-sm leading-7">
            {pct >= 90
              ? "Маш сайн! Энэ сэдвийг бүрэн эзэмшсэн байна."
              : pct >= 70
                ? "Сайн байна. Цөөн хэдэн сэдвийг давтвал төгс болно."
                : pct >= 50
                  ? "Дунд зэрэг. Доорх сул сэдвүүдийг заавал давтаарай."
                  : "Одоохондоо сул байна. Хичээлийг дахин уншаад тестийг давтаарай."}
          </p>
        </div>

        {weak.length > 0 ? (
          <div className="mt-8 rounded-2xl bg-clay/10 p-5">
            <h3 className="text-sm font-black text-clay">📉 Сул сэдэв</h3>
            <ul className="mt-3 space-y-2">
              {weak.map((item) => (
                <li key={item.topic} className="flex justify-between text-sm">
                  <span>{item.topic}</span>
                  <span className="font-bold">{item.pct}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-fg-muted">
              Эдгээр сэдвийг дахин судлахыг зөвлөж байна.
            </p>
          </div>
        ) : null}

        {strong.length > 0 ? (
          <div className="mt-4 rounded-2xl bg-emerald-500/10 p-5">
            <h3 className="text-sm font-black text-emerald-700 dark:text-emerald-300">
              📈 Хүчтэй сэдэв
            </h3>
            <ul className="mt-3 space-y-2">
              {strong.map((item) => (
                <li key={item.topic} className="flex justify-between text-sm">
                  <span>{item.topic}</span>
                  <span className="font-bold">{item.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={onRetry}>🔄 Дахин өгөх</Button>
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
            >
              {backLabel}
            </Link>
          ) : null}
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            Ахицаа харах
          </Link>
        </div>
      </Card>

      {/* Дэлгэрэнгүй тайлбар */}
      <div className="space-y-4">
        <h3 className="text-lg font-black">Хариултын тайлбар</h3>
        {results.map((item, index) => (
          <Card
            key={item.question.id}
            className={cn(
              "border-l-4",
              item.correct ? "border-l-emerald-500" : "border-l-clay",
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl" aria-hidden>
                {item.correct ? "✅" : "❌"}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold">
                  {index + 1}. {item.question.prompt}
                </p>

                <CorrectAnswer question={item.question} />

                <p className="mt-3 rounded-xl bg-muted/60 p-3 text-sm leading-7 text-fg-muted">
                  💡 {item.question.explanation}
                </p>

                {item.question.source ? (
                  <p className="mt-2 text-xs text-fg-muted">
                    Эх сурвалж: {item.question.source}
                  </p>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CorrectAnswer({ question }: { question: Question }) {
  if (
    (question.type === "multiple_choice" || question.type === "true_false") &&
    question.options &&
    question.answerIndex !== undefined
  ) {
    return (
      <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
        Зөв хариулт: <b>{question.options[question.answerIndex]}</b>
      </p>
    );
  }

  if (question.type === "fill_blank") {
    return (
      <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
        Зөв хариулт: <b>{question.answerText}</b>
      </p>
    );
  }

  if (question.type === "ordering" && question.sequence) {
    return (
      <ol className="mt-2 list-inside list-decimal text-sm text-emerald-700 dark:text-emerald-300">
        {question.sequence.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  }

  if (question.type === "matching" && question.pairs) {
    return (
      <ul className="mt-2 space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
        {question.pairs.map((pair) => (
          <li key={pair.left}>
            {pair.left} → <b>{pair.right}</b>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}
