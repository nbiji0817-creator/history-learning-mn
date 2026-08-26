"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card } from "@/components/ui/primitives";
import { useProgress } from "@/lib/progress";
import {
  prefersReducedMotion,
  useAnimationClock,
} from "@/lib/games/use-animation-frame";
import { cn } from "@/lib/utils";

/**
 * ТОРГОНЫ ЗАМЫН АЯН
 *
 * Тэмээн жин Хархорумаас баруун зүг явна. Зогсоол бүрд шийдвэр
 * гаргах бөгөөд жин нь дараагийн зогсоол руу зураг дээр ХӨДӨЛНӨ.
 *
 * СУРГАЛТЫН САНАА: аюулгүй сонголт үргэлж ашигтай байдаггүй.
 * Богино зам эрсдэлтэй, урт зам аюулгүй ч зардалтай. Монголын үеийн
 * «Пакс Монголика» нь замын аюулгүй байдлыг сайжруулж, худалдааг
 * хэрхэн өргөжүүлснийг мэдрүүлэх зорилготой.
 */

const VIEW_W = 1000;
const VIEW_H = 420;

/* Зогсоол хооронд явах хугацаа */
const LEG_MS = 2600;

interface Stop {
  id: string;
  name: string;
  /** Зураг дээрх байрлал, 0–100 хувиар */
  x: number;
  y: number;
  note: string;
}

interface Choice {
  label: string;
  detail: string;
  goods: number;
  silver: number;
  camels: number;
  outcome: string;
}

interface Leg {
  /** Энэ зогсоол дээр гарах шийдвэр */
  prompt: string;
  choices: Choice[];
}

const STOPS: Stop[] = [
  { id: "kharkhorum", name: "Хархорум", x: 68, y: 26, note: "Их Монгол улсын нийслэл. Жин эндээс хөдөлнө." },
  { id: "beshbalik", name: "Бешбалык", x: 52, y: 34, note: "Уйгурын хот. Зам хоёр сална." },
  { id: "samarkand", name: "Самарканд", x: 36, y: 46, note: "Дундад Азийн худалдааны төв." },
  { id: "tabriz", name: "Тавриз", x: 22, y: 52, note: "Ил хаант улсын худалдааны хот." },
  { id: "baghdad", name: "Багдад", x: 14, y: 62, note: "Аяны эцсийн цэг." },
];

const LEGS: Leg[] = [
  {
    prompt:
      "Хархорумаас гарахад ачаагаа сонгоно. Юуг ихээр авах вэ?",
    choices: [
      {
        label: "Торго, эдлэл ихээр",
        detail: "Үнэ өндөр ч жин хүнд, тэмээ илүү шаардана.",
        goods: 40,
        silver: -20,
        camels: 0,
        outcome:
          "Торго барууны зах зээлд хамгийн эрэлттэй бараа. Гэхдээ хүнд ачаа тэмээг хурдан ядраана.",
      },
      {
        label: "Хөнгөн бараа, илүү тэмээ",
        detail: "Ачаа хөнгөн, аян хурдан. Ашиг багавтар.",
        goods: 20,
        silver: -10,
        camels: 4,
        outcome:
          "Хөнгөн ачаатай жин хурдан явдаг. Нэмэлт тэмээ хожим гарз тохиолдоход хэрэг болно.",
      },
    ],
  },
  {
    prompt:
      "Бешбалыкт зам хоёр сална. Аль замаар явах вэ?",
    choices: [
      {
        label: "Говийн богино зам",
        detail: "Хугацаа хэмнэнэ. Ус ховор, тэмээ хорогдож болзошгүй.",
        goods: 0,
        silver: 15,
        camels: -3,
        outcome:
          "Богино зам мөнгө хэмнэсэн ч гурван тэмээ ус хүрэлцэхгүйгээс хорогдов.",
      },
      {
        label: "Уулын дагуух урт зам",
        detail: "Ус, бэлчээр элбэг. Хугацаа, хоолны зардал их.",
        goods: 0,
        silver: -15,
        camels: 1,
        outcome:
          "Урт зам зардалтай ч бүх тэмээ эсэн мэнд гарав. Нэг унага төллөв.",
      },
    ],
  },
  {
    prompt:
      "Самаркандад орон нутгийн худалдаачид санал тавьлаа.",
    choices: [
      {
        label: "Хагасыг нь энд зарах",
        detail: "Мөнгө шууд орно. Багдадын өндөр үнийг алдана.",
        goods: -20,
        silver: 45,
        camels: 0,
        outcome:
          "Эрт зарах нь эрсдэлийг бууруулна. Гэхдээ баруун тийш явах тусам үнэ өснө.",
      },
      {
        label: "Бүх ачаагаа авч үлдэх",
        detail: "Багдадад илүү үнэтэй зарна. Эрсдэл өндөр.",
        goods: 0,
        silver: -10,
        camels: 0,
        outcome:
          "Ачаагаа хадгалав. Замын татвар, хоолны зардал мөнгийг иднэ.",
      },
    ],
  },
  {
    prompt:
      "Тавризад гааль, хамгаалалтын асуудал гарлаа.",
    choices: [
      {
        label: "Пайз үзүүлж, албан замаар",
        detail: "Монголын пайз нь хамгаалалт өгнө. Татвар төлнө.",
        goods: 0,
        silver: -20,
        camels: 0,
        outcome:
          "Пайз бол монголын албан ёсны бичиг. Үүнийг үзүүлсэн жинг өртөө хамгаална — «Пакс Монголика»-гийн бодит үр дүн.",
      },
      {
        label: "Тойрч, татвараас зайлсхийх",
        detail: "Мөнгө хэмнэнэ. Дээрэмчинтэй тааралдаж болно.",
        goods: -25,
        silver: 10,
        camels: -2,
        outcome:
          "Албан замаас гарсан жинг хэн ч хамгаалахгүй. Дээрэмчид ачааны хэсгийг авч одов.",
      },
    ],
  },
];

interface State {
  goods: number;
  silver: number;
  camels: number;
}

const START: State = { goods: 60, silver: 100, camels: 12 };

export function SilkRoadSim({ gameSlug }: { gameSlug?: string }) {
  const { recordGameScore } = useProgress();
  const reduced = prefersReducedMotion();

  const [stopIndex, setStopIndex] = useState(0);
  const [state, setState] = useState<State>(START);
  const [log, setLog] = useState<string[]>([]);
  const [moving, setMoving] = useState(false);
  const [finished, setFinished] = useState(false);

  /* Хөдөлгөөн дуусахад дараагийн зогсоол дээр буусан гэж үзнэ */
  const clock = useAnimationClock({
    durationMs: LEG_MS,
    autoStart: false,
    onComplete: () => {
      setMoving(false);
      setStopIndex((value) => {
        const next = value + 1;
        if (next >= STOPS.length - 1) setFinished(true);
        return next;
      });
    },
  });
  const savedRef = useRef(false);

  /* Аян дуусахад оноог нэг л удаа бүртгэнэ */
  useEffect(() => {
    if (!finished || savedRef.current || !gameSlug) return;
    savedRef.current = true;
    recordGameScore(gameSlug, Math.max(0, Math.round(state.silver / 10)), 30);
  }, [finished, gameSlug, state.silver, recordGameScore]);

  const from = STOPS[stopIndex];
  const to = STOPS[Math.min(stopIndex + 1, STOPS.length - 1)];

  /* Жингийн одоогийн байрлал */
  const progress = moving ? Math.min(1, clock.elapsed / LEG_MS) : 0;
  const caravanX = from.x + (to.x - from.x) * progress;
  const caravanY = from.y + (to.y - from.y) * progress;

  const choose = (choice: Choice) => {
    setState((current) => ({
      goods: Math.max(0, current.goods + choice.goods),
      silver: Math.max(0, current.silver + choice.silver),
      camels: Math.max(0, current.camels + choice.camels),
    }));
    setLog((list) => [...list, `${from.name}: ${choice.outcome}`]);

    if (reduced) {
      /* Анимацийг алгасаж шууд дараагийн зогсоол руу */
      setStopIndex((value) => {
        const next = value + 1;
        if (next >= STOPS.length - 1) setFinished(true);
        return next;
      });
      return;
    }

    setMoving(true);
    clock.start();
  };

  const restart = () => {
    savedRef.current = false;
    setStopIndex(0);
    setState(START);
    setLog([]);
    setMoving(false);
    setFinished(false);
    clock.reset();
  };

  const leg = LEGS[stopIndex];

  /* Эцсийн үнэлгээ — үлдсэн мөнгө, бараа хоёрын нийлбэр */
  const finalValue = state.silver + state.goods * 2;

  return (
    <div className="space-y-5">
      {/* Нөөц */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-2xl">📦</p>
          <p className="mt-1 text-2xl font-black text-gold">{state.goods}</p>
          <p className="text-xs text-fg-muted">бараа</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl">🪙</p>
          <p className="mt-1 text-2xl font-black text-gold">{state.silver}</p>
          <p className="text-xs text-fg-muted">мөнгө</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl">🐫</p>
          <p className="mt-1 text-2xl font-black text-gold">{state.camels}</p>
          <p className="text-xs text-fg-muted">тэмээ</p>
        </Card>
      </div>

      {/* Зам */}
      <Card className="overflow-hidden p-0">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block w-full"
          role="img"
          aria-label="Торгоны замын схем"
        >
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} className="fill-muted" />

          {/* Замын шугам */}
          <path
            d={STOPS.map(
              (stop, index) =>
                `${index === 0 ? "M" : "L"} ${(stop.x / 100) * VIEW_W} ${(stop.y / 100) * VIEW_H}`,
            ).join(" ")}
            fill="none"
            className="stroke-line"
            strokeWidth={4}
            strokeDasharray="10 8"
          />

          {/* Туулсан хэсэг */}
          <path
            d={STOPS.slice(0, stopIndex + 1)
              .map(
                (stop, index) =>
                  `${index === 0 ? "M" : "L"} ${(stop.x / 100) * VIEW_W} ${(stop.y / 100) * VIEW_H}`,
              )
              .join(" ")}
            fill="none"
            className="stroke-gold"
            strokeWidth={4}
          />

          {/* Зогсоолууд */}
          {STOPS.map((stop, index) => {
            const reached = index <= stopIndex;
            return (
              <g key={stop.id}>
                <circle
                  cx={(stop.x / 100) * VIEW_W}
                  cy={(stop.y / 100) * VIEW_H}
                  r={index === stopIndex ? 13 : 9}
                  className={reached ? "fill-gold" : "fill-line"}
                />
                <text
                  x={(stop.x / 100) * VIEW_W}
                  y={(stop.y / 100) * VIEW_H - 20}
                  textAnchor="middle"
                  className={cn(
                    "text-[16px] font-bold",
                    reached ? "fill-fg" : "fill-fg-muted",
                  )}
                >
                  {stop.name}
                </text>
              </g>
            );
          })}

          {/* Тэмээн жин */}
          <text
            x={(caravanX / 100) * VIEW_W}
            y={(caravanY / 100) * VIEW_H + 8}
            textAnchor="middle"
            fontSize={34}
          >
            🐫
          </text>
        </svg>

        <div className="border-t border-line px-5 py-4">
          {moving ? (
            <p className="text-sm font-bold">
              {from.name} → {to.name} рүү явж байна…
            </p>
          ) : (
            <p className="text-sm">
              <b>{from.name}</b> — {from.note}
            </p>
          )}
        </div>
      </Card>

      {/* Шийдвэр эсвэл дүн */}
      {finished ? (
        <Card className="text-center">
          <div className="text-6xl" aria-hidden>
            {finalValue >= 220 ? "🏆" : finalValue >= 150 ? "🎉" : "💪"}
          </div>
          <h2 className="mt-4 text-2xl font-black">Аян дууслаа</h2>
          <p className="mt-4 text-4xl font-black text-gold">{finalValue}</p>
          <p className="mt-2 text-sm text-fg-muted">
            нийт хөрөнгө (мөнгө + бараа × 2)
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-fg-muted">
            Монголын үед замын аюулгүй байдал сайжирч, пайз бүхий жин
            хамгаалалттай явдаг болсон. Үүнийг түүхчид «Пакс Монголика»
            хэмээн нэрлэдэг.
          </p>
          <div className="mt-8">
            <Button onClick={restart}>🔄 Дахин аялах</Button>
          </div>
        </Card>
      ) : !moving && leg ? (
        <Card>
          <p className="text-sm font-bold text-gold">Шийдвэр</p>
          <p className="mt-2 text-base leading-7">{leg.prompt}</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {leg.choices.map((choice) => (
              <button
                key={choice.label}
                type="button"
                onClick={() => choose(choice)}
                className="rounded-2xl border border-line p-4 text-left transition hover:border-gold/60 hover:bg-muted/40"
              >
                <p className="font-black">{choice.label}</p>
                <p className="mt-1 text-sm leading-6 text-fg-muted">
                  {choice.detail}
                </p>
                <p className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
                  {choice.goods !== 0 ? (
                    <span className={choice.goods > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-clay"}>
                      📦 {choice.goods > 0 ? "+" : ""}
                      {choice.goods}
                    </span>
                  ) : null}
                  {choice.silver !== 0 ? (
                    <span className={choice.silver > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-clay"}>
                      🪙 {choice.silver > 0 ? "+" : ""}
                      {choice.silver}
                    </span>
                  ) : null}
                  {choice.camels !== 0 ? (
                    <span className={choice.camels > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-clay"}>
                      🐫 {choice.camels > 0 ? "+" : ""}
                      {choice.camels}
                    </span>
                  ) : null}
                </p>
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Аяны тэмдэглэл */}
      {log.length > 0 ? (
        <Card>
          <h3 className="text-sm font-black">Аяны тэмдэглэл</h3>
          <ul className="mt-4 space-y-3">
            {log.map((entry, index) => (
              <li key={index} className="text-sm leading-6 text-fg-muted">
                {entry}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
