"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Game,
  GlossaryTerm,
  HistoricalEvent,
  HistoricalFigure,
  HistoricalPlace,
  Question,
} from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { useProgress } from "@/lib/progress";
import { cn, formatDuration, shuffle } from "@/lib/utils";
import { MapChallengeGame } from "./map-challenge";
import { WordSearchGame } from "./word-search";

export interface GameData {
  events: HistoricalEvent[];
  figures: HistoricalFigure[];
  questions: Question[];
  places: HistoricalPlace[];
  terms: GlossaryTerm[];
}

export function GameBoard({ game, data }: { game: Game; data: GameData }) {
  /*
   * Тоглоом бүр эхлэхдээ өгөгдлөө санамсаргүйгээр холидог. Хэрэв энэ нь
   * серверийн render-ийн үед ажиллавал сервер, клиент хоёр өөр дараалал
   * үүсгэж hydration зөрчил гарна. Иймд зөвхөн браузерт mount хийгдсэний
   * дараа тоглоомын самбарыг үзүүлнэ.
   */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount хийгдсэнийг мэдэх цорын ганц арга
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <p className="py-10 text-center text-sm text-fg-muted">
          Тоглоом бэлтгэж байна…
        </p>
      </Card>
    );
  }

  switch (game.kind) {
    case "timeline_order":
      return <TimelineOrderGame game={game} events={data.events} />;
    case "who_is_it":
      return <WhoIsItGame game={game} figures={data.figures} />;
    case "match_pairs":
      return <MatchPairsGame game={game} events={data.events} />;
    case "memory":
      return <MemoryGame game={game} figures={data.figures} />;
    case "quiz_rush":
      return <QuizRushGame game={game} questions={data.questions} />;
    case "true_false":
      return <TrueFalseGame game={game} questions={data.questions} />;
    case "map_challenge":
      return <MapChallengeGame game={game} places={data.places} />;
    case "word_search":
      return <WordSearchGame game={game} terms={data.terms} />;
    default:
      return (
        <Card>
          <p className="text-center text-sm text-fg-muted">
            Энэ тоглоом удахгүй нэмэгдэнэ.
          </p>
        </Card>
      );
  }
}

/* ─────────────────────────  Ерөнхий хэсгүүд  ───────────────────────── */

function GameResult({
  score,
  total,
  detail,
  onRestart,
}: {
  score: number;
  total: number;
  detail?: string;
  onRestart: () => void;
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  return (
    <Card className="text-center">
      <div className="text-6xl" aria-hidden>
        {pct >= 90 ? "🏆" : pct >= 60 ? "🎉" : "💪"}
      </div>
      <h2 className="mt-4 text-2xl font-black">Тоглоом дууслаа</h2>
      <p className="mt-4 text-5xl font-black text-gold">
        {score}
        <span className="text-2xl text-fg-muted"> / {total}</span>
      </p>
      {detail ? <p className="mt-3 text-sm text-fg-muted">{detail}</p> : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={onRestart}>🔄 Дахин тоглох</Button>
        <Link
          href="/games"
          className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
        >
          Бусад тоглоом
        </Link>
      </div>
    </Card>
  );
}

/* ─────────────────────────  1. Он цагийг зөв байрлуул  ───────────────────────── */

function TimelineOrderGame({
  game,
  events,
}: {
  game: Game;
  events: HistoricalEvent[];
}) {
  const { recordGameScore } = useProgress();
  const [round, setRound] = useState(0);
  const [items, setItems] = useState<HistoricalEvent[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const ROUNDS = 5;
  const SIZE = 5;

  const startRound = useCallback(() => {
    const picked = shuffle(events).slice(0, SIZE);
    setItems(shuffle(picked));
    setChecked(false);
  }, [events]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- шинэ шатны асуултыг зөвхөн браузерт санамсаргүйгээр холино
    startRound();
  }, [startRound]);

  const correctOrder = useMemo(
    () => [...items].sort((a, b) => a.sortYear - b.sortYear),
    [items],
  );

  const isRight = items.every((item, index) => item.id === correctOrder[index]?.id);

  const move = (from: number, to: number) => {
    if (checked || to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    setItems(next);
  };

  const check = () => {
    setChecked(true);
    if (isRight) setScore((value) => value + 1);
  };

  const next = () => {
    if (round + 1 >= ROUNDS) {
      setDone(true);
      recordGameScore(game.slug, score + (isRight && checked ? 0 : 0), game.xp);
      return;
    }
    setRound((value) => value + 1);
    startRound();
  };

  if (done) {
    return (
      <GameResult
        score={score}
        total={ROUNDS}
        detail="Он цагийн хэлхээсийг санахад дадлага хамгийн үр дүнтэй."
        onRestart={() => {
          setRound(0);
          setScore(0);
          setDone(false);
          startRound();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          Шат {round + 1} / {ROUNDS}
        </span>
        <span className="text-gold">Оноо: {score}</span>
      </div>

      <Card>
        <p className="text-sm text-fg-muted">
          Дараах үйл явдлыг <b>эртнээс хойш</b> зөв дарааллаар нь өрөөрэй.
        </p>

        <ol className="mt-5 space-y-2">
          {items.map((item, index) => {
            const rightPlace = checked && correctOrder[index]?.id === item.id;
            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3.5 transition",
                  checked
                    ? rightPlace
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : "border-clay/60 bg-clay/10"
                    : "border-line",
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold text-xs font-black text-[#1c1a17]">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm">
                  {item.icon} {item.title}
                  {checked ? (
                    <span className="ml-2 font-mono text-xs text-gold">
                      {item.year}
                    </span>
                  ) : null}
                </span>
                {!checked ? (
                  <span className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, index - 1)}
                      disabled={index === 0}
                      className="rounded-lg bg-muted px-2.5 py-1 text-sm disabled:opacity-30"
                      aria-label="Дээш"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, index + 1)}
                      disabled={index === items.length - 1}
                      className="rounded-lg bg-muted px-2.5 py-1 text-sm disabled:opacity-30"
                      aria-label="Доош"
                    >
                      ↓
                    </button>
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex justify-end gap-3">
          {!checked ? (
            <Button onClick={check}>Шалгах</Button>
          ) : (
            <>
              <p
                className={cn(
                  "flex-1 self-center text-sm font-bold",
                  isRight ? "text-emerald-600 dark:text-emerald-400" : "text-clay",
                )}
              >
                {isRight ? "✅ Зөв дараалал!" : "❌ Дараалал буруу байна."}
              </p>
              <Button onClick={next}>
                {round + 1 >= ROUNDS ? "Дуусгах" : "Дараах шат →"}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────  2. Хэн бэ?  ───────────────────────── */

function WhoIsItGame({
  game,
  figures,
}: {
  game: Game;
  figures: HistoricalFigure[];
}) {
  const { recordGameScore } = useProgress();
  const ROUNDS = 6;

  const [pool] = useState(() => shuffle(figures).slice(0, ROUNDS));
  const [round, setRound] = useState(0);
  const [hints, setHints] = useState(1);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const target = pool[round];

  const options = useMemo(() => {
    if (!target) return [];
    const others = shuffle(figures.filter((item) => item.slug !== target.slug)).slice(
      0,
      3,
    );
    return shuffle([target, ...others]);
  }, [target, figures]);

  if (done || !target) {
    return (
      <GameResult
        score={score}
        total={ROUNDS}
        detail="Сэжүүр цөөн ашиглах тусам оноо өндөр."
        onRestart={() => window.location.reload()}
      />
    );
  }

  const clues = [
    `Эрин үе: ${target.era === "ancient" ? "Эрт үе" : target.era === "medieval" ? "Дундад үе" : target.era === "modern" ? "Шинэ үе" : "Орчин үе"}`,
    `Амьдарсан хугацаа: ${target.born} – ${target.died}`,
    `Албан тушаал: ${target.title}`,
    `Гол гавьяа: ${target.achievements[0]}`,
  ];

  const pick = (slug: string) => {
    if (answered) return;
    setAnswered(slug);
    if (slug === target.slug) {
      setScore((value) => value + Math.max(1, 4 - hints + 1));
    }
  };

  const next = () => {
    if (round + 1 >= ROUNDS) {
      setDone(true);
      recordGameScore(game.slug, score, game.xp);
      return;
    }
    setRound((value) => value + 1);
    setHints(1);
    setAnswered(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          Асуулт {round + 1} / {ROUNDS}
        </span>
        <span className="text-gold">Оноо: {score}</span>
      </div>

      <Card>
        <p className="text-sm font-bold text-gold">Сэжүүр</p>
        <ul className="mt-3 space-y-2">
          {clues.slice(0, hints).map((clue) => (
            <li key={clue} className="rounded-xl bg-muted/60 p-3 text-sm leading-6">
              {clue}
            </li>
          ))}
        </ul>

        {hints < clues.length && !answered ? (
          <button
            type="button"
            onClick={() => setHints((value) => value + 1)}
            className="mt-3 text-sm font-semibold text-gold hover:underline"
          >
            + Дараагийн сэжүүр (оноо буурна)
          </button>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const isTarget = option.slug === target.slug;
            const selected = answered === option.slug;
            return (
              <button
                key={option.slug}
                type="button"
                onClick={() => pick(option.slug)}
                disabled={Boolean(answered)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition",
                  answered
                    ? isTarget
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : selected
                        ? "border-clay/60 bg-clay/10"
                        : "border-line opacity-60"
                    : "border-line hover:border-gold/60 hover:bg-muted",
                )}
              >
                <span className="text-2xl" aria-hidden>
                  {option.portrait}
                </span>
                <span className="font-semibold">{option.name}</span>
              </button>
            );
          })}
        </div>

        {answered ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm leading-6 text-fg-muted">
              {answered === target.slug ? "✅ Зөв!" : "❌ Буруу."}{" "}
              <b>{target.name}</b> — {target.summary}
            </p>
            <Button onClick={next}>
              {round + 1 >= ROUNDS ? "Дуусгах" : "Дараах →"}
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

/* ─────────────────────────  3. Үйл явдлыг тааруул  ───────────────────────── */

function MatchPairsGame({
  game,
  events,
}: {
  game: Game;
  events: HistoricalEvent[];
}) {
  const { recordGameScore } = useProgress();
  const SIZE = 6;

  const [pool] = useState(() => shuffle(events).slice(0, SIZE));
  const [years] = useState(() => shuffle(pool.map((item) => item.year)));
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const correctCount = pool.filter((item) => picked[item.id] === item.year).length;

  const assign = (year: string) => {
    if (!activeEvent || checked) return;
    const next = { ...picked };
    for (const key of Object.keys(next)) {
      if (next[key] === year) delete next[key];
    }
    next[activeEvent] = year;
    setPicked(next);
    setActiveEvent(null);
  };

  if (checked) {
    return (
      <GameResult
        score={correctCount}
        total={SIZE}
        detail="Он ба үйл явдлыг хослуулан санах нь шалгалтад маш их тустай."
        onRestart={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <p className="text-sm text-fg-muted">
          Эхлээд <b>үйл явдлаа</b> сонго, дараа нь <b>тохирох оноо</b> дар.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-black">Үйл явдал</h3>
            <ul className="mt-3 space-y-2">
              {pool.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActiveEvent(item.id)}
                    className={cn(
                      "w-full rounded-xl border p-3.5 text-left text-sm transition",
                      activeEvent === item.id
                        ? "border-gold bg-gold/15"
                        : "border-line hover:border-gold/50",
                    )}
                  >
                    <span aria-hidden>{item.icon}</span> {item.title}
                    {picked[item.id] ? (
                      <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 font-mono text-xs font-bold text-gold">
                        {picked[item.id]}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black">Он</h3>
            <ul className="mt-3 grid gap-2">
              {years.map((year) => {
                const used = Object.values(picked).includes(year);
                return (
                  <li key={year}>
                    <button
                      type="button"
                      onClick={() => assign(year)}
                      disabled={used || !activeEvent}
                      className={cn(
                        "w-full rounded-xl border p-3.5 text-center font-mono text-sm font-bold transition",
                        used
                          ? "border-line opacity-40"
                          : "border-line hover:border-gold/60 hover:bg-muted",
                      )}
                    >
                      {year}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => {
              setChecked(true);
              recordGameScore(game.slug, correctCount, game.xp);
            }}
            disabled={Object.keys(picked).length < SIZE}
          >
            Шалгах ({Object.keys(picked).length}/{SIZE})
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────  4. Санах ойн тоглоом  ───────────────────────── */

interface MemoryCard {
  key: string;
  pairId: string;
  face: string;
  label: string;
}

function MemoryGame({
  game,
  figures,
}: {
  game: Game;
  figures: HistoricalFigure[];
}) {
  const { recordGameScore } = useProgress();
  const SIZE = 6;

  const [cards] = useState<MemoryCard[]>(() => {
    const picked = shuffle(figures).slice(0, SIZE);
    const deck = picked.flatMap((figure) => [
      {
        key: `${figure.slug}-a`,
        pairId: figure.slug,
        face: figure.portrait,
        label: figure.portrait,
      },
      {
        key: `${figure.slug}-b`,
        pairId: figure.slug,
        face: figure.portrait,
        label: figure.name,
      },
    ]);
    return shuffle(deck);
  });

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [first, second] = flipped.map((key) =>
      cards.find((card) => card.key === key),
    );
    const timer = window.setTimeout(() => {
      if (first && second && first.pairId === second.pairId) {
        setMatched((value) => [...value, first.pairId]);
      }
      setFlipped([]);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [flipped, cards]);

  const complete = matched.length === SIZE;

  useEffect(() => {
    if (complete) recordGameScore(game.slug, SIZE, game.xp);
  }, [complete, game.slug, game.xp, recordGameScore]);

  if (complete) {
    return (
      <GameResult
        score={SIZE}
        total={SIZE}
        detail={`${moves} хөдөлгөөнөөр бүх хосыг оллоо.`}
        onRestart={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>Хөдөлгөөн: {moves}</span>
        <span className="text-gold">
          Олсон: {matched.length} / {SIZE}
        </span>
      </div>

      <Card>
        <p className="text-sm text-fg-muted">
          Хөзрийг эргүүлж, түүхэн хүний хөрөг ба нэрийг хослуул.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {cards.map((card) => {
            const open = flipped.includes(card.key) || matched.includes(card.pairId);
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => {
                  if (open || flipped.length === 2) return;
                  setFlipped((value) => [...value, card.key]);
                  if (flipped.length === 1) setMoves((value) => value + 1);
                }}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-xl border p-2 text-center text-sm font-semibold transition",
                  open
                    ? "border-gold bg-gold/15"
                    : "border-line bg-muted hover:border-gold/50",
                )}
                aria-label={open ? card.label : "Хаалттай хөзөр"}
              >
                {open ? (
                  <span className={card.label.length > 3 ? "text-xs" : "text-3xl"}>
                    {card.label}
                  </span>
                ) : (
                  <span className="text-2xl opacity-40" aria-hidden>
                    ❔
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────  5. Хурдан тест  ───────────────────────── */

function QuizRushGame({
  game,
  questions,
}: {
  game: Game;
  questions: Question[];
}) {
  const { recordGameScore } = useProgress();
  const DURATION = 60;

  const [pool] = useState(() =>
    shuffle(
      questions.filter(
        (question) =>
          (question.type === "multiple_choice" || question.type === "true_false") &&
          question.options,
      ),
    ),
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [remaining, setRemaining] = useState(DURATION);
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);

  const finished = remaining <= 0 || index >= pool.length;

  useEffect(() => {
    if (finished) recordGameScore(game.slug, score, game.xp);
  }, [finished, game.slug, game.xp, score, recordGameScore]);

  if (finished) {
    return (
      <GameResult
        score={score}
        total={score + wrong}
        detail={`${DURATION} секундэд ${score + wrong} асуултад хариулж, ${score}-д нь зөв хариуллаа.`}
        onRestart={() => window.location.reload()}
      />
    );
  }

  const current = pool[index];

  const answer = (optionIndex: number) => {
    const right = optionIndex === current.answerIndex;
    setFeedback(right ? "right" : "wrong");
    if (right) setScore((value) => value + 1);
    else setWrong((value) => value + 1);
    window.setTimeout(() => {
      setFeedback(null);
      setIndex((value) => value + 1);
    }, 400);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "rounded-xl px-4 py-2 font-mono text-xl font-black",
            remaining <= 10 ? "bg-clay/15 text-clay" : "bg-muted",
          )}
        >
          ⏱ {formatDuration(remaining)}
        </span>
        <span className="text-sm font-semibold">
          ✅ {score} • ❌ {wrong}
        </span>
      </div>

      <Card
        className={cn(
          "transition",
          feedback === "right" && "border-emerald-500/60",
          feedback === "wrong" && "border-clay/60",
        )}
      >
        <h3 className="text-lg font-bold leading-8">{current.prompt}</h3>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {current.options?.map((option, optionIndex) => (
            <button
              key={option}
              type="button"
              onClick={() => answer(optionIndex)}
              disabled={feedback !== null}
              className="rounded-xl border border-line p-4 text-left text-sm transition hover:border-gold/60 hover:bg-muted disabled:opacity-60"
            >
              {option}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────  6. Үнэн үү, худал уу?  ───────────────────────── */

function TrueFalseGame({
  game,
  questions,
}: {
  game: Game;
  questions: Question[];
}) {
  const { recordGameScore } = useProgress();
  const ROUNDS = 8;

  const [pool] = useState(() =>
    shuffle(
      questions.filter(
        (question) =>
          (question.type === "multiple_choice" || question.type === "true_false") &&
          question.options &&
          question.answerIndex !== undefined,
      ),
    ).slice(0, ROUNDS),
  );

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [shown, setShown] = useState<{ text: string; isTrue: boolean } | null>(null);
  const [result, setResult] = useState<null | boolean>(null);

  useEffect(() => {
    const question = pool[index];
    if (!question || !question.options) return;
    /* Санамсаргүйгээр зөв эсвэл буруу мэдэгдэл харуулна. */
    const useTrue = Math.random() > 0.5;
    const correct = question.options[question.answerIndex ?? 0];
    const wrongOptions = question.options.filter((item) => item !== correct);
    const shownOption = useTrue
      ? correct
      : wrongOptions[Math.floor(Math.random() * wrongOptions.length)] ?? correct;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Math.random ашигладаг тул render-ийн үед бодож болохгүй
    setShown({
      text: `${question.prompt} → ${shownOption}`,
      isTrue: shownOption === correct,
    });
    setResult(null);
  }, [index, pool]);

  const finished = index >= pool.length || pool.length === 0;

  useEffect(() => {
    if (finished && pool.length > 0) recordGameScore(game.slug, score, game.xp);
  }, [finished, pool.length, game.slug, game.xp, score, recordGameScore]);

  if (finished) {
    return (
      <GameResult
        score={score}
        total={pool.length}
        onRestart={() => window.location.reload()}
      />
    );
  }

  const answer = (value: boolean) => {
    if (!shown || result !== null) return;
    const right = value === shown.isTrue;
    setResult(right);
    if (right) setScore((current) => current + 1);
    window.setTimeout(() => setIndex((current) => current + 1), 900);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          {index + 1} / {pool.length}
        </span>
        <span className="text-gold">Оноо: {score}</span>
      </div>

      <Card
        className={cn(
          result === true && "border-emerald-500/60",
          result === false && "border-clay/60",
        )}
      >
        <p className="text-lg font-bold leading-8">{shown?.text}</p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => answer(true)}
            disabled={result !== null}
            className="rounded-xl bg-emerald-500/15 p-5 text-lg font-black text-emerald-700 transition hover:bg-emerald-500/25 disabled:opacity-60 dark:text-emerald-300"
          >
            ✓ Үнэн
          </button>
          <button
            type="button"
            onClick={() => answer(false)}
            disabled={result !== null}
            className="rounded-xl bg-clay/15 p-5 text-lg font-black text-clay transition hover:bg-clay/25 disabled:opacity-60"
          >
            ✗ Худал
          </button>
        </div>

        {result !== null ? (
          <p className="mt-5 text-center text-sm font-bold">
            {result ? "✅ Зөв!" : "❌ Буруу."}
          </p>
        ) : null}
      </Card>
    </div>
  );
}
