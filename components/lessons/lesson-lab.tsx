"use client";

import { useEffect, useMemo, useState } from "react";
import type { LessonLabData } from "@/lib/lessons/lab-data";
import { Button, Card } from "@/components/ui/primitives";
import {
  prefersReducedMotion,
  useAnimationClock,
} from "@/lib/games/use-animation-frame";
import { cn, shuffle } from "@/lib/utils";

/**
 * ХИЧЭЭЛИЙН ЛАБОРАТОРИ
 *
 * Хичээл бүрийн доор гарах интерактив дасгалын самбар. Агуулга нь
 * ТУХАЙН ХИЧЭЭЛИЙН өөрийнх нь өгөгдлөөс үүсдэг (`lib/lessons/lab-data.ts`).
 *
 * Дөрвөн горим — хичээлд байгаа өгөгдлөөс хамаарч зөвхөн боломжтой нь
 * харагдана:
 *   ⏳ Он цаг    — үйл явдал он цагийн шугам дээр хөдөлгөөнтэй гарна
 *   🎯 Таамагла  — эхлээд таамаглаж, дараа нь хариултыг нээнэ
 *   ✍️ Нөхөх     — гол санааны нуусан үгийг сэргээнэ
 *   🧩 Хослуул   — нэр томьёо, тодорхойлолтыг холбоно
 *
 * Цуглуулсан од нь тухайн хичээлд localStorage-д хадгалагдана —
 * сурагч буцаж ирэхэд ахицаа хардаг.
 */

type Mode = "timeline" | "predict" | "cloze" | "concepts";

const MODE_LABEL: Record<Mode, { icon: string; label: string }> = {
  timeline: { icon: "⏳", label: "Он цаг" },
  predict: { icon: "🎯", label: "Таамагла" },
  cloze: { icon: "✍️", label: "Нөхөх" },
  concepts: { icon: "🧩", label: "Хослуул" },
};

function storageKey(slug: string): string {
  return `tuuhee-medye:lab:${slug}`;
}

export function LessonLab({
  lessonSlug,
  data,
}: {
  lessonSlug: string;
  data: LessonLabData;
}) {
  const available = useMemo<Mode[]>(() => {
    const modes: Mode[] = [];
    if (data.events.length >= 2) modes.push("timeline");
    if (data.questions.length >= 1) modes.push("predict");
    if (data.cloze.length >= 2) modes.push("cloze");
    if (data.concepts.length >= 2) modes.push("concepts");
    return modes;
  }, [data]);

  const [mode, setMode] = useState<Mode>(available[0] ?? "predict");
  const [stars, setStars] = useState(0);
  const [loaded, setLoaded] = useState(false);

  /* Хадгалсан одыг сэргээнэ */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(lessonSlug));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage-ыг render-ийн үед уншвал сервер, клиентийн гаралт зөрнө
      if (raw) setStars(Number(raw) || 0);
    } catch {
      /* Хадгалах боломжгүй орчин — од 0-ээс эхэлнэ */
    }
    setLoaded(true);
  }, [lessonSlug]);

  const addStar = () => {
    setStars((value) => {
      const next = value + 1;
      try {
        window.localStorage.setItem(storageKey(lessonSlug), String(next));
      } catch {
        /* Хадгалагдахгүй ч тоглоом үргэлжилнэ */
      }
      return next;
    });
  };

  if (available.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-gold">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black">🔬 Хичээлийн лаборатори</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Таамагла → Турш → Шалга. Уншсанаа энд бататга.
          </p>
        </div>
        <span className="rounded-full bg-gold/15 px-4 py-1.5 text-sm font-black text-gold">
          ⭐ {loaded ? stars : 0}
        </span>
      </div>

      {/* Горимын таб */}
      {available.length > 1 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {available.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={cn(
                "rounded-xl border px-3.5 py-2 text-sm font-bold transition",
                mode === item
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-line text-fg-muted hover:border-gold/50",
              )}
            >
              {MODE_LABEL[item].icon} {MODE_LABEL[item].label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-6">
        {mode === "timeline" ? (
          <TimelineLab events={data.events} onStar={addStar} />
        ) : null}
        {mode === "predict" ? (
          <PredictLab questions={data.questions} onStar={addStar} />
        ) : null}
        {mode === "cloze" ? (
          <ClozeLab items={data.cloze} onStar={addStar} />
        ) : null}
        {mode === "concepts" ? (
          <ConceptLab pairs={data.concepts} onStar={addStar} />
        ) : null}
      </div>
    </Card>
  );
}

/* ─────────────────────────  ⏳ Он цагийн шугам  ───────────────────────── */

const TIMELINE_MS = 9000;

function TimelineLab({
  events,
  onStar,
}: {
  events: LessonLabData["events"];
  onStar: () => void;
}) {
  const reduced = prefersReducedMotion();
  const [watched, setWatched] = useState(false);

  /*
   * Бүрэн үзсэн үед нэг удаа од өгнө. Үүнийг effect дотор `progress`-ыг
   * харьцуулж мэдэхгүй — тэр нь render бүрд ажиллаж, төлөвийг
   * синхроноор өөрчилдөг. Гогцоо өөрөө дуусахаа мэднэ.
   */
  const clock = useAnimationClock({
    durationMs: TIMELINE_MS,
    autoStart: false,
    onComplete: () => {
      if (watched) return;
      setWatched(true);
      onStar();
    },
  });

  const first = events[0].sortYear;
  const last = events[events.length - 1].sortYear;
  const span = Math.max(1, last - first);

  const progress = reduced ? 1 : clock.elapsed / TIMELINE_MS;
  const currentYear = first + span * progress;

  return (
    <div>
      <p className="text-sm leading-7 text-fg-muted">
        Тоглуулах товчийг дарж, үйл явдлууд он цагийн дарааллаар хэрхэн
        өрнөснийг ажигла.
      </p>

      {/* Шугам */}
      <div className="relative mt-6 pl-6">
        <div className="absolute bottom-0 left-2 top-0 w-0.5 bg-line" />
        <div
          className="absolute left-2 top-0 w-0.5 bg-gold transition-none"
          style={{ height: `${Math.min(100, progress * 100)}%` }}
        />

        <ol className="space-y-4">
          {events.map((event) => {
            const shown = event.sortYear <= currentYear || reduced;
            return (
              <li
                key={event.id}
                className={cn(
                  "relative transition-all duration-500",
                  shown
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-2 opacity-25",
                )}
              >
                <span
                  className={cn(
                    "absolute -left-[19px] top-2 h-3 w-3 rounded-full border-2",
                    shown
                      ? "border-gold bg-gold"
                      : "border-line bg-surface",
                  )}
                />
                <p className="text-sm font-black text-gold">{event.year}</p>
                <p className="text-sm font-bold">{event.title}</p>
                {shown ? (
                  <p className="mt-1 text-sm leading-6 text-fg-muted">
                    {event.summary}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      {!reduced ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={clock.toggle}>
            {clock.running ? "⏸ Зогсоох" : progress >= 1 ? "🔄 Дахин" : "▶ Тоглуулах"}
          </Button>
          <input
            type="range"
            min={0}
            max={TIMELINE_MS}
            value={clock.elapsed}
            onChange={(event) => {
              clock.pause();
              clock.seek(Number(event.target.value));
            }}
            className="min-w-0 flex-1 accent-[var(--gold)]"
            aria-label="Он цагийг чирэх"
          />
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────  🎯 Таамаглах  ───────────────────────── */

function PredictLab({
  questions,
  onStar,
}: {
  questions: LessonLabData["questions"];
  onStar: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const question = questions[index];
  const correct = question.answerIndex ?? 0;

  const choose = (option: number) => {
    if (picked !== null) return;
    setPicked(option);
    if (option === correct) onStar();
  };

  const next = () => {
    setPicked(null);
    setIndex((value) => (value + 1) % questions.length);
  };

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-fg-muted">
        Асуулт {index + 1} / {questions.length}
      </p>
      <p className="mt-2 text-base font-bold leading-8">{question.prompt}</p>

      <div className="mt-5 grid gap-3">
        {(question.options ?? []).map((option, position) => {
          const isCorrect = position === correct;
          const isPicked = picked === position;

          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(position)}
              disabled={picked !== null}
              className={cn(
                "rounded-xl border p-3.5 text-left text-sm transition",
                picked === null
                  ? "border-line hover:border-gold/60 hover:bg-muted"
                  : isCorrect
                    ? "border-emerald-500/60 bg-emerald-500/10"
                    : isPicked
                      ? "border-clay/60 bg-clay/10"
                      : "border-line opacity-55",
              )}
            >
              {option}
              {picked !== null && isCorrect ? " ✓" : ""}
            </button>
          );
        })}
      </div>

      {picked !== null ? (
        <div className="mt-5 rounded-xl bg-muted/60 p-4">
          <p className="text-sm font-bold">
            {picked === correct ? "✅ Зөв! +1 ⭐" : "❌ Дахин үзье"}
          </p>
          {question.explanation ? (
            <p className="mt-2 text-sm leading-7 text-fg-muted">
              {question.explanation}
            </p>
          ) : null}
          {questions.length > 1 ? (
            <Button className="mt-4" onClick={next}>
              Дараагийн асуулт →
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────  ✍️ Нөхөх  ───────────────────────── */

function ClozeLab({
  items,
  onStar,
}: {
  items: LessonLabData["cloze"];
  onStar: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const item = items[index];

  /* Сонголтын дараалал асуулт бүрд нэг л удаа холигдоно */
  const options = useMemo(() => shuffle(item.options), [item]);

  const choose = (option: string) => {
    if (picked !== null) return;
    setPicked(option);
    if (option === item.answer) onStar();
  };

  const next = () => {
    setPicked(null);
    setIndex((value) => (value + 1) % items.length);
  };

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-fg-muted">
        Гол санаа {index + 1} / {items.length}
      </p>

      <p className="mt-3 rounded-xl bg-muted/60 p-4 text-base leading-8">
        {picked === item.answer
          ? item.masked.replace(
              "_____",
              item.answer,
            )
          : item.masked}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        {options.map((option) => {
          const isCorrect = option === item.answer;
          const isPicked = picked === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(option)}
              disabled={picked !== null}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                picked === null
                  ? "border-line hover:border-gold/60 hover:bg-muted"
                  : isCorrect
                    ? "border-emerald-500/60 bg-emerald-500/10"
                    : isPicked
                      ? "border-clay/60 bg-clay/10"
                      : "border-line opacity-55",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {picked !== null ? (
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <p className="text-sm font-bold">
            {picked === item.answer ? "✅ Зөв! +1 ⭐" : `❌ Зөв нь: ${item.answer}`}
          </p>
          {items.length > 1 ? (
            <Button size="sm" onClick={next}>
              Дараагийх →
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────  🧩 Хослуулах  ───────────────────────── */

function ConceptLab({
  pairs,
  onStar,
}: {
  pairs: LessonLabData["concepts"];
  onStar: () => void;
}) {
  /* Тодорхойлолтыг холиод, нэр томьёотой нь тааруулна */
  const shuffled = useMemo(() => shuffle(pairs.map((pair) => pair.definition)), [pairs]);

  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);

  const tryMatch = (definition: string) => {
    if (!selectedTerm) return;

    const pair = pairs.find((item) => item.term === selectedTerm);
    if (pair && pair.definition === definition) {
      setMatched((list) => [...list, selectedTerm]);
      setSelectedTerm(null);
      onStar();
      return;
    }

    setWrong(definition);
    window.setTimeout(() => setWrong(null), 700);
    setSelectedTerm(null);
  };

  const done = matched.length === pairs.length;

  return (
    <div>
      <p className="text-sm leading-7 text-fg-muted">
        Нэр томьёог дараад, түүнд тохирох тодорхойлолтыг сонго.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-fg-muted">
            Нэр томьёо
          </p>
          <div className="mt-3 grid gap-2">
            {pairs.map((pair) => {
              const isMatched = matched.includes(pair.term);
              return (
                <button
                  key={pair.term}
                  type="button"
                  disabled={isMatched}
                  onClick={() => setSelectedTerm(pair.term)}
                  className={cn(
                    "rounded-xl border p-3 text-left text-sm font-bold transition",
                    isMatched
                      ? "border-emerald-500/60 bg-emerald-500/10 opacity-70"
                      : selectedTerm === pair.term
                        ? "border-gold bg-gold/15"
                        : "border-line hover:border-gold/60",
                  )}
                >
                  {pair.term} {isMatched ? "✓" : ""}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-fg-muted">
            Тодорхойлолт
          </p>
          <div className="mt-3 grid gap-2">
            {shuffled.map((definition) => {
              const owner = pairs.find((item) => item.definition === definition);
              const isMatched = owner ? matched.includes(owner.term) : false;

              return (
                <button
                  key={definition}
                  type="button"
                  disabled={isMatched || !selectedTerm}
                  onClick={() => tryMatch(definition)}
                  className={cn(
                    "rounded-xl border p-3 text-left text-sm leading-6 transition",
                    isMatched
                      ? "border-emerald-500/60 bg-emerald-500/10 opacity-70"
                      : wrong === definition
                        ? "border-clay/60 bg-clay/15"
                        : selectedTerm
                          ? "border-line hover:border-gold/60"
                          : "border-line opacity-60",
                  )}
                >
                  {definition}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {done ? (
        <p className="mt-5 rounded-xl bg-emerald-500/10 p-4 text-sm font-bold text-emerald-700 dark:text-emerald-300">
          🎉 Бүх хосыг оллоо!
        </p>
      ) : null}
    </div>
  );
}
