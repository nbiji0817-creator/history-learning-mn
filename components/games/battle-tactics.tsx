"use client";

import { useEffect, useRef, useState } from "react";
import type { BattleScenario, BattleTactic, Game } from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import {
  arrowStorm,
  baseThem,
  baseUs,
  envelopment,
  failureEnding,
  feignedRetreat,
  FIELD_H,
  FIELD_W,
  frontal,
  lerp,
  UNITS,
  type Phase,
} from "@/lib/games/battle-choreography";

/**
 * ТУЛАЛДААНЫ ТАКТИК — ХӨДӨЛГӨӨНТ СИМУЛЯЦ
 *
 * Сурагч монголын жинхэнэ дөрвөн тактикаас сонгоод, шийдвэрээ
 * хөдөлгөөнт зураглалаар ХАРНА. Текст уншихаас илүү санагдана —
 * хуурамч ухралт яагаад ажилладгийг тайлбарлахаас нүдээр харуулах
 * нь илүү хүчтэй.
 *
 * ХЭРХЭН АЖИЛЛАДАГ ВЭ
 *   Тактик бүр «үе шат»-уудын жагсаалт. Үе шат бүр өөрийн үргэлжлэх
 *   хугацаа, тайлбар, мөн цэрэг тус бүрийн байрлалыг 0–1 хүртэлх
 *   явцын утгаар буцаадаг функцтэй. `requestAnimationFrame` нь
 *   явцыг бодож, байрлалыг шинэчилнэ.
 *
 *   Тактик бүрд тусад нь өгөгдөл бичихийн оронд ЕРӨНХИЙ хөдөлгөөний
 *   загвар бичсэн — ямар ч хувилбарт ижил ажиллана.
 */

const TACTICS: {
  id: BattleTactic;
  label: string;
  icon: string;
  blurb: string;
  build: () => Phase[];
}[] = [
  {
    id: "feigned_retreat",
    label: "Хуурамч ухралт",
    icon: "🏃",
    blurb: "Зугтах дүр эсгэж дайсныг татан оруулаад, эргэж бүслэнэ.",
    build: feignedRetreat,
  },
  {
    id: "envelopment",
    label: "Далавчаар тойрох",
    icon: "🪽",
    blurb: "Төв хүчээр тогтоож байх зуур хажуугаар ар тал руу гарна.",
    build: envelopment,
  },
  {
    id: "arrow_storm",
    label: "Сумны бороо",
    icon: "🏹",
    blurb: "Зайнаас нум харваад ухарна. Ойрын тулалдаанаас зайлсхийнэ.",
    build: arrowStorm,
  },
  {
    id: "frontal",
    label: "Шууд довтолгоо",
    icon: "⚔️",
    blurb: "Хүчээ төвлөрүүлж, дайсны эгнээний төвийг цоолж орно.",
    build: frontal,
  },
];

/* ────────────────────────────  Бүрэлдэхүүн  ──────────────────────────── */

type Stage = "choose" | "playing" | "result";

export function BattleTacticsGame({
  game,
  scenarios,
}: {
  game: Game;
  scenarios: BattleScenario[];
}) {
  const { recordGameScore } = useProgress();

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState<Stage>("choose");
  const [picked, setPicked] = useState<BattleTactic | null>(null);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  /*
   * Үе шатуудыг ref биш ТӨЛӨВД хадгална: тэдгээрийг render-ийн үед
   * уншиж байрлал тооцдог тул ref-ээс уншвал React-ийн дүрэм зөрчинө
   * (ref өөрчлөгдөхөд дахин render хийгддэггүй).
   */
  const [phases, setPhases] = useState<Phase[]>([]);
  const frameRef = useRef<number | null>(null);

  const scenario = scenarios[index];
  const finished = index >= scenarios.length;

  /* Хөдөлгөөн багасгах тохиргоотой хэрэглэгчид шууд үр дүнг харуулна */
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (finished && scenarios.length > 0) {
      recordGameScore(game.slug, score, game.xp);
    }
  }, [finished, scenarios.length, game.slug, game.xp, score, recordGameScore]);

  /* Анимацийн гогцоо */
  useEffect(() => {
    if (stage !== "playing") return;
    if (phases.length === 0) return;

    let current = 0;
    let elapsed = 0;
    let last = performance.now();

    const step = (now: number) => {
      /*
       * Хоёр кадрын зөрүүг 100 мс-ээр хязгаарлана. Хэрэглэгч өөр таб
       * руу шилжвэл requestAnimationFrame зогсдог; буцаж ирэхэд
       * зөрүү нь хэдэн секунд болно. Хязгаарлаагүй бол тулалдаан
       * нэг агшинд төгсгөл рүүгээ үсэрч, юу болсныг харах завгүй
       * өнгөрнө.
       */
      const delta = Math.min(now - last, 100);
      last = now;
      elapsed += delta;

      const phase = phases[current];
      const t = Math.min(1, elapsed / phase.ms);

      setProgress(t);

      if (t >= 1) {
        if (current + 1 >= phases.length) {
          setStage("result");
          return;
        }
        current += 1;
        elapsed = 0;
        setPhaseIndex(current);
      }

      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [stage, phases]);

  if (scenarios.length === 0) {
    return (
      <Card>
        <p className="text-center text-sm text-fg-muted">
          Тулалдааны өгөгдөл бэлэн биш байна.
        </p>
      </Card>
    );
  }

  if (finished) {
    return (
      <Card className="text-center">
        <div className="text-6xl" aria-hidden>
          {score >= scenarios.length - 1 ? "🏆" : score >= 3 ? "🎉" : "💪"}
        </div>
        <h2 className="mt-4 text-2xl font-black">Аян дуусав</h2>
        <p className="mt-4 text-5xl font-black text-gold">
          {score}
          <span className="text-2xl text-fg-muted"> / {scenarios.length}</span>
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-fg-muted">
          Нэг ч тактик үргэлж зөв байдаггүй — нөхцөл байдал шийднэ. Энэ нь
          Чингис хааны цэргийн урлагийн гол зарчим байв.
        </p>
        <div className="mt-8">
          <Button onClick={() => window.location.reload()}>
            🔄 Дахин тоглох
          </Button>
        </div>
      </Card>
    );
  }

  const correct = picked === scenario.correct;
  const phase = phases[phaseIndex];

  /* Одоогийн байрлалыг тооцоолно */
  const positions = (() => {
    if (!phase) {
      return {
        us: Array.from({ length: UNITS }, (_, i) => baseUs(i)),
        them: Array.from({ length: UNITS }, (_, i) => baseThem(i)),
      };
    }
    const t = stage === "result" ? 1 : progress;
    return {
      us: Array.from({ length: UNITS }, (_, i) => phase.us(t, i)),
      them: Array.from({ length: UNITS }, (_, i) => phase.them(t, i)),
    };
  })();

  const play = (tactic: BattleTactic) => {
    const definition = TACTICS.find((item) => item.id === tactic);
    if (!definition) return;

    const built = definition.build();
    const isRight = tactic === scenario.correct;

    const script = isRight
      ? built
      : [...built.slice(0, 2), failureEnding(built[1])];

    setPhases(script);
    setPicked(tactic);
    setPhaseIndex(0);
    setProgress(0);

    if (isRight) setScore((value) => value + 1);

    /* Хөдөлгөөн багасгах горимд анимацийг алгасна */
    if (reducedMotion) {
      setPhaseIndex(script.length - 1);
      setProgress(1);
      setStage("result");
      return;
    }

    setStage("playing");
  };

  const next = () => {
    setPhases([]);
    setPicked(null);
    setPhaseIndex(0);
    setProgress(0);
    setStage("choose");
    setIndex((value) => value + 1);
  };

  /* Сурагчийн тал ямар өнгөтэй байхыг `playingAs` шийднэ */
  const usIsMongol = scenario.playingAs === "mongol";
  const usColor = usIsMongol ? "#3b82f6" : "#a855f7";
  const themColor = usIsMongol ? "#dc2626" : "#3b82f6";
  const usLabel = usIsMongol ? "Монгол цэрэг" : "Мамлюк цэрэг";
  const themLabel = usIsMongol ? "Дайсан" : "Монгол цэрэг";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          {index + 1} / {scenarios.length}
        </span>
        <span className="text-gold">Оноо: {score}</span>
      </div>

      <Card>
        <p className="text-xs font-bold uppercase tracking-wider text-fg-muted">
          {scenario.year} · {scenario.place}
        </p>
        <h2 className="mt-2 text-2xl font-black">{scenario.title}</h2>
        <p className="mt-3 text-sm leading-7 text-fg-muted">
          {scenario.situation}
        </p>
      </Card>

      {/* Тулалдааны талбар */}
      <Card className="overflow-hidden p-0">
        <svg
          viewBox={`0 0 ${FIELD_W} ${FIELD_H}`}
          className="block w-full"
          role="img"
          aria-label={`${scenario.title} — тулалдааны зураглал`}
        >
          <rect
            x={0}
            y={0}
            width={FIELD_W}
            height={FIELD_H}
            className="fill-muted"
          />

          {/* Талбарын зурвасууд — хөдөлгөөнийг мэдрэхэд тусална */}
          {[1, 2, 3, 4].map((n) => (
            <line
              key={n}
              x1={(FIELD_W / 5) * n}
              y1={0}
              x2={(FIELD_W / 5) * n}
              y2={FIELD_H}
              className="stroke-line"
              strokeWidth={1}
              opacity={0.4}
            />
          ))}

          {/* Сум — зөвхөн харвах үе шатанд */}
          {phase?.arrows && stage === "playing"
            ? positions.us.map((point, i) => {
                const flight = (progress * 2 + i * 0.11) % 1;
                const target = positions.them[i];
                return (
                  <line
                    key={`arrow-${i}`}
                    x1={lerp(point.x, target.x, flight)}
                    y1={lerp(point.y, target.y, flight)}
                    x2={lerp(point.x, target.x, flight) + 18}
                    y2={lerp(point.y, target.y, flight)}
                    stroke="#facc15"
                    strokeWidth={3}
                    strokeLinecap="round"
                    opacity={0.85}
                  />
                );
              })
            : null}

          {/* Эсрэг тал */}
          {positions.them.map((point, i) => (
            <g key={`them-${i}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={15}
                fill={themColor}
                opacity={phase?.rout && stage === "result" ? 0.35 : 0.9}
              />
              <text
                x={point.x}
                y={point.y + 5}
                textAnchor="middle"
                fontSize={14}
                fill="white"
              >
                ▲
              </text>
            </g>
          ))}

          {/* Сурагчийн тал */}
          {positions.us.map((point, i) => (
            <g key={`us-${i}`}>
              <circle cx={point.x} cy={point.y} r={16} fill={usColor} />
              <text
                x={point.x}
                y={point.y + 6}
                textAnchor="middle"
                fontSize={16}
                fill="white"
              >
                ●
              </text>
            </g>
          ))}
        </svg>

        {/* Тайлбар мөр */}
        <div className="border-t border-line px-5 py-4">
          {phase ? (
            <>
              <p className="text-sm font-bold">{phase.caption}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gold transition-none"
                  style={{
                    width: `${((phaseIndex + (stage === "result" ? 1 : progress)) / phases.length) * 100}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-fg-muted">
              Тактикаа сонгоход тулалдаан эхэлнэ.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-fg-muted">
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: usColor }}
              />
              {usLabel} (чи)
            </span>
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: themColor }}
              />
              {themLabel}
            </span>
          </div>
        </div>
      </Card>

      {/* Тактик сонгох */}
      {stage === "choose" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {TACTICS.map((tactic) => (
            <button
              key={tactic.id}
              type="button"
              onClick={() => play(tactic.id)}
              className="rounded-2xl border border-line p-5 text-left transition hover:border-gold/60 hover:bg-muted/40"
            >
              <span className="text-2xl" aria-hidden>
                {tactic.icon}
              </span>
              <p className="mt-2 font-black">{tactic.label}</p>
              <p className="mt-1 text-sm leading-6 text-fg-muted">
                {tactic.blurb}
              </p>
            </button>
          ))}
        </div>
      ) : null}

      {stage === "playing" ? (
        <p className="text-center text-sm text-fg-muted">
          Тулалдаан өрнөж байна…
        </p>
      ) : null}

      {stage === "result" ? (
        <Card
          className={cn(
            correct ? "border-emerald-500/60" : "border-clay/60",
          )}
        >
          <p className="text-lg font-black">
            {correct ? "✅ Зөв тактик!" : "❌ Энэ тактик тохирохгүй"}
          </p>
          <p className="mt-2 text-sm font-bold text-gold">
            Түүхэн зөв шийдэл: {scenario.correctTitle}
          </p>
          <p className="mt-3 text-sm leading-7 text-fg-muted">
            {correct ? scenario.correctExplanation : scenario.wrongExplanation}
          </p>
          <p className="mt-4 text-xs text-fg-muted">
            Эх сурвалж: {scenario.source}
          </p>

          <div className="mt-6">
            <Button onClick={next}>
              {index + 1 >= scenarios.length
                ? "Дүн харах →"
                : "Дараагийн тулалдаан →"}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
