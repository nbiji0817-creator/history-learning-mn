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
 * НҮҮДЛИЙН ДӨРВӨН УЛИРАЛ
 *
 * Нэг айлын малыг жилийн турш авч явна. Улирал бүрд нүүх газар,
 * бэлтгэлээ сонгох ба гэр, мал зураг дээр шинэ бууц руу ХӨДӨЛНӨ.
 *
 * СУРГАЛТЫН САНАА: нүүдэл бол дур зоргоор биш, бэлчээр, ус, цаг
 * агаарт захирагдсан ТООЦООТОЙ шийдвэр. Өвлийн бэлтгэлээ намар
 * хийгээгүй бол хавар мал хорогдоно — «отор», «өвөлжөө» гэсэн
 * ойлголтыг мэдрүүлэх зорилготой.
 */

const VIEW_W = 1000;
const VIEW_H = 400;
const MOVE_MS = 2200;

interface Season {
  key: "spring" | "summer" | "autumn" | "winter";
  name: string;
  icon: string;
  /* Бууцны байрлал, 0–100 хувиар */
  x: number;
  y: number;
  /* Тэнгэрийн өнгө — улирлыг мэдрүүлнэ */
  sky: string;
  ground: string;
  situation: string;
  choices: {
    label: string;
    detail: string;
    herd: number;
    hay: number;
    outcome: string;
  }[];
}

const SEASONS: Season[] = [
  {
    key: "spring",
    name: "Хавар",
    icon: "🌱",
    x: 22,
    y: 55,
    sky: "#7dd3fc",
    ground: "#86bb6a",
    situation:
      "Мал төллөж эхлэв. Цас хайлж, шинэ ногоо гарч байгаа ч шөнө хүйтэн. Зуд болох аюул бүрэн өнгөрөөгүй.",
    choices: [
      {
        label: "Хаваржаанд удаан үлдэх",
        detail: "Төл бойжуулна. Бэлчээр талхлагдана.",
        herd: 12,
        hay: -10,
        outcome:
          "Төл сайн бойжив. Гэхдээ нэг газар удсан тул бэлчээр муудаж, өвс нөөц багассан.",
      },
      {
        label: "Эрт отор хийх",
        detail: "Шинэ бэлчээр рүү явна. Сул төл эрсдэлд орно.",
        herd: 6,
        hay: 5,
        outcome:
          "Отор нь бэлчээрийг амраадаг эртний арга. Хэдэн сул төл замд хорогдсон ч мал тарга авав.",
      },
    ],
  },
  {
    key: "summer",
    name: "Зун",
    icon: "☀️",
    x: 45,
    y: 32,
    sky: "#38bdf8",
    ground: "#4ea62f",
    situation:
      "Бэлчээр сайн, мал тарга хүч авах хамгийн чухал үе. Гол мөрөн дүүрэн, айлууд наадам хийж байна.",
    choices: [
      {
        label: "Уулын сэрүүн бэлчээрт",
        detail: "Мал тарга сайн авна. Айлаас хол.",
        herd: 15,
        hay: 10,
        outcome:
          "Уулын бэлчээр өвс шүүслэг. Мал сайн тарга авч, өвс ч арвин бэлтгэв.",
      },
      {
        label: "Голын хөндийд, айлын дэргэд",
        detail: "Худалдаа, харилцаа сайн. Бэлчээр талхлагдмал.",
        herd: 8,
        hay: 4,
        outcome:
          "Хөрш айлуудтай эд бараа солилцов. Гэхдээ олон мал нэг газар бэлчсэн тул өвс бага.",
      },
    ],
  },
  {
    key: "autumn",
    name: "Намар",
    icon: "🍂",
    x: 68,
    y: 44,
    sky: "#fbbf24",
    ground: "#b98b3a",
    situation:
      "Хамгийн шийдвэрлэх улирал. Өвлийн бэлтгэл энд хийгдэнэ. Мал тарга хамгийн сайтай, өвс хатаж байна.",
    choices: [
      {
        label: "Өвс бэлтгэхэд бүх хүчээ",
        detail: "Өвөл найдвартай. Одоо мал нэмэгдэхгүй.",
        herd: 0,
        hay: 30,
        outcome:
          "Өвс арвин бэлтгэв. Монгол айл намрын ажлаараа өвлийг давдаг гэдэг үг үнэн.",
      },
      {
        label: "Мал худалдаж, тоог нэмэх",
        detail: "Сүрэг өснө. Өвлийн нөөц дутагдана.",
        herd: 20,
        hay: -5,
        outcome:
          "Сүрэг өсөв. Гэхдээ илүү мал илүү өвс шаардана — өвөл үүнийг шалгана.",
      },
    ],
  },
  {
    key: "winter",
    name: "Өвөл",
    icon: "❄️",
    x: 86,
    y: 62,
    sky: "#94a3b8",
    ground: "#e2e8f0",
    situation:
      "Хасах 30 хэм. Цас зузаан, мал бэлчээрээ ухаж идэж чадахгүй. Намрын бэлтгэл одоо шалгагдана.",
    choices: [
      {
        label: "Өвөлжөөндөө хоргодох",
        detail: "Хашаа, хоргодол ашиглана. Өвс их зарцуулна.",
        herd: 0,
        hay: -25,
        outcome:
          "Өвөлжөө нь салхинаас хамгаалдаг тогтмол бууц. Мал хоргодож, өвсөөр тэжээгдэв.",
      },
      {
        label: "Цасанд бэлчээх",
        detail: "Өвс хэмнэнэ. Хүйтэн, зудны эрсдэл өндөр.",
        herd: -15,
        hay: -8,
        outcome:
          "Цас зузаан байсан тул мал бэлчээрээ ухаж чадсангүй. Хэсэг мал хорогдов.",
      },
    ],
  },
];

interface Herd {
  count: number;
  hay: number;
}

const START: Herd = { count: 100, hay: 40 };

/**
 * Өвлийг давахад шаардагдах өвсний хэмжээ.
 *
 * Энэ тоо нь тоглоомын гол сургалтын цэгийг шийднэ. Хэт нам байвал
 * намрын «өвс бэлтгэх / мал нэмэх» сонголт утгагүй болно — аль
 * замаар явсан ч ялгаагүй сайн үр дүн гарна. 40 нь намар өвс
 * бэлтгэсэн айлыг шагнаж, мал нэмсэн айлыг шийтгэхээр тохируулсан.
 */
const HAY_NEEDED = 40;

export function NomadYearSim({ gameSlug }: { gameSlug?: string }) {
  const { recordGameScore } = useProgress();
  const reduced = prefersReducedMotion();

  const [index, setIndex] = useState(0);
  const [herd, setHerd] = useState<Herd>(START);
  const [log, setLog] = useState<{ season: string; text: string }[]>([]);
  const [moving, setMoving] = useState(false);
  const [finished, setFinished] = useState(false);

  /* Нүүдэл дуусахад шинэ бууц дээр буусан гэж үзнэ */
  const clock = useAnimationClock({
    durationMs: MOVE_MS,
    autoStart: false,
    onComplete: () => {
      setMoving(false);
      setIndex((value) => {
        const next = value + 1;
        if (next >= SEASONS.length) {
          setFinished(true);
          return value;
        }
        return next;
      });
    },
  });
  const savedRef = useRef(false);

  useEffect(() => {
    if (!finished || savedRef.current || !gameSlug) return;
    savedRef.current = true;
    recordGameScore(gameSlug, Math.max(0, Math.round(herd.count / 10)), 30);
  }, [finished, gameSlug, herd.count, recordGameScore]);

  const season = SEASONS[index];
  const nextSeason = SEASONS[Math.min(index + 1, SEASONS.length - 1)];

  const progress = moving ? Math.min(1, clock.elapsed / MOVE_MS) : 0;
  const campX = season.x + (nextSeason.x - season.x) * progress;
  const campY = season.y + (nextSeason.y - season.y) * progress;

  /* Тэнгэр, газрын өнгө улирал хооронд аажим шилжинэ */
  const mix = (a: string, b: string, t: number): string => {
    const parse = (hex: string) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
    const [r1, g1, b1] = parse(a);
    const [r2, g2, b2] = parse(b);
    const to = (v1: number, v2: number) => Math.round(v1 + (v2 - v1) * t);
    return `rgb(${to(r1, r2)}, ${to(g1, g2)}, ${to(b1, b2)})`;
  };

  const sky = mix(season.sky, nextSeason.sky, progress);
  const ground = mix(season.ground, nextSeason.ground, progress);

  const choose = (choice: Season["choices"][number]) => {
    setHerd((current) => ({
      count: Math.max(0, current.count + choice.herd),
      hay: Math.max(0, current.hay + choice.hay),
    }));
    setLog((list) => [...list, { season: season.name, text: choice.outcome }]);

    if (index + 1 >= SEASONS.length) {
      setFinished(true);
      return;
    }

    if (reduced) {
      setIndex((value) => value + 1);
      return;
    }

    setMoving(true);
    clock.start();
  };

  const restart = () => {
    savedRef.current = false;
    setIndex(0);
    setHerd(START);
    setLog([]);
    setMoving(false);
    setFinished(false);
    clock.reset();
  };

  /*
   * Эцсийн үнэлгээ: өвс дутсан бол мал нэмж хорогдоно. Энэ нь
   * «намрын бэлтгэл өвлийг шийднэ» гэдгийг тоогоор харуулна.
   */
  const shortage = Math.max(0, HAY_NEEDED - herd.hay);
  const finalCount = Math.max(0, herd.count - shortage);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-2xl">{season.icon}</p>
          <p className="mt-1 text-lg font-black text-gold">{season.name}</p>
          <p className="text-xs text-fg-muted">{index + 1} / 4</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl">🐑</p>
          <p className="mt-1 text-2xl font-black text-gold">{herd.count}</p>
          <p className="text-xs text-fg-muted">толгой мал</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl">🌾</p>
          <p
            className={cn(
              "mt-1 text-2xl font-black",
              herd.hay >= HAY_NEEDED ? "text-emerald-600 dark:text-emerald-400" : "text-gold",
            )}
          >
            {herd.hay}
          </p>
          {/* Шаардлагыг нуухгүй — сурагч тооцоолж чаддаг байх ёстой */}
          <p className="text-xs text-fg-muted">өвс / {HAY_NEEDED} хэрэгтэй</p>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block w-full"
          role="img"
          aria-label={`${season.name} улирлын бэлчээр`}
        >
          {/* Тэнгэр */}
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H * 0.55} fill={sky} />
          {/* Газар */}
          <rect
            x={0}
            y={VIEW_H * 0.55}
            width={VIEW_W}
            height={VIEW_H * 0.45}
            fill={ground}
          />

          {/* Уулс — баримжаа өгнө */}
          <path
            d={`M 0 ${VIEW_H * 0.55} L 150 ${VIEW_H * 0.3} L 300 ${VIEW_H * 0.5} L 450 ${VIEW_H * 0.28} L 620 ${VIEW_H * 0.52} L 800 ${VIEW_H * 0.34} L ${VIEW_W} ${VIEW_H * 0.55} Z`}
            fill={ground}
            opacity={0.55}
          />

          {/* Бууцны цэгүүд */}
          {SEASONS.map((item, position) => (
            <g key={item.key}>
              <circle
                cx={(item.x / 100) * VIEW_W}
                cy={(item.y / 100) * VIEW_H}
                r={position === index ? 11 : 7}
                fill={position <= index ? "#f5b301" : "rgba(255,255,255,0.45)"}
              />
              <text
                x={(item.x / 100) * VIEW_W}
                y={(item.y / 100) * VIEW_H - 18}
                textAnchor="middle"
                fontSize={15}
                fontWeight="bold"
                fill="#1c1a17"
              >
                {item.name}
              </text>
            </g>
          ))}

          {/* Нүүдлийн зам */}
          <path
            d={SEASONS.map(
              (item, position) =>
                `${position === 0 ? "M" : "L"} ${(item.x / 100) * VIEW_W} ${(item.y / 100) * VIEW_H}`,
            ).join(" ")}
            fill="none"
            stroke="rgba(28,26,23,0.35)"
            strokeWidth={3}
            strokeDasharray="8 7"
          />

          {/* Гэр ба мал */}
          <text
            x={(campX / 100) * VIEW_W}
            y={(campY / 100) * VIEW_H + 10}
            textAnchor="middle"
            fontSize={32}
          >
            🛖
          </text>
          {[0, 1, 2].map((n) => (
            <text
              key={n}
              x={(campX / 100) * VIEW_W + 30 + n * 26}
              y={(campY / 100) * VIEW_H + 14 + (n % 2) * 10}
              textAnchor="middle"
              fontSize={20}
            >
              🐑
            </text>
          ))}
        </svg>

        <div className="border-t border-line px-5 py-4">
          {moving ? (
            <p className="text-sm font-bold">
              {season.name} → {nextSeason.name}: шинэ бууц руу нүүж байна…
            </p>
          ) : (
            <p className="text-sm leading-7">{season.situation}</p>
          )}
        </div>
      </Card>

      {finished ? (
        <Card className="text-center">
          <div className="text-6xl" aria-hidden>
            {finalCount >= 120 ? "🏆" : finalCount >= 90 ? "🎉" : "💪"}
          </div>
          <h2 className="mt-4 text-2xl font-black">Жил бүтэн эргэлээ</h2>
          <p className="mt-4 text-5xl font-black text-gold">{finalCount}</p>
          <p className="mt-2 text-sm text-fg-muted">
            толгой малтай хаваржаанд орлоо ({START.count}-аас эхэлсэн)
          </p>

          {shortage > 0 ? (
            <p className="mx-auto mt-4 max-w-md rounded-xl bg-clay/10 p-4 text-sm leading-7 text-clay">
              Өвлийг давахад <b>{HAY_NEEDED}</b> өвс хэрэгтэй байсан ч
              зөвхөн <b>{herd.hay}</b> байлаа. Дутсан тул <b>{shortage}</b>{" "}
              толгой мал нэмж хорогдов. Намрын бэлтгэл өвлийн үр дүнг шийддэг.
            </p>
          ) : (
            <p className="mx-auto mt-4 max-w-md rounded-xl bg-emerald-500/10 p-4 text-sm leading-7 text-emerald-700 dark:text-emerald-300">
              Өвс нөөц хангалттай байсан тул мал бүтэн өвөлжлөө.
            </p>
          )}

          <div className="mt-8">
            <Button onClick={restart}>🔄 Дахин эхлэх</Button>
          </div>
        </Card>
      ) : !moving ? (
        <Card>
          <p className="text-sm font-bold text-gold">
            {season.icon} {season.name} — шийдвэр
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {season.choices.map((choice) => (
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
                  <span
                    className={cn(
                      choice.herd > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : choice.herd < 0
                          ? "text-clay"
                          : "text-fg-muted",
                    )}
                  >
                    🐑 {choice.herd > 0 ? "+" : ""}
                    {choice.herd}
                  </span>
                  <span
                    className={cn(
                      choice.hay > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : choice.hay < 0
                          ? "text-clay"
                          : "text-fg-muted",
                    )}
                  >
                    🌾 {choice.hay > 0 ? "+" : ""}
                    {choice.hay}
                  </span>
                </p>
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {log.length > 0 ? (
        <Card>
          <h3 className="text-sm font-black">Жилийн тэмдэглэл</h3>
          <ul className="mt-4 space-y-3">
            {log.map((entry, position) => (
              <li key={position} className="text-sm leading-6">
                <b className="text-gold">{entry.season}:</b>{" "}
                <span className="text-fg-muted">{entry.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
