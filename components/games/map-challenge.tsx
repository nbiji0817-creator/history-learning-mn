"use client";

import { useEffect, useRef, useState } from "react";
import type { Game, HistoricalPlace } from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { useProgress } from "@/lib/progress";
import { cn, shuffle } from "@/lib/utils";

/**
 * ГАЗРЫН ЗУРАГ ТААХ
 *
 * Сурагчид түүхэн газрын нэр, сэжүүр харуулж, зураг дээр дарж
 * байрлуулахыг хүснэ. Оноог таамаг ба жинхэнэ байрлалын хоорондох
 * ЗАЙГААР өгнө — ойртох тусам оноо өндөр.
 *
 * Яагаад зурган дээрх хувь биш, жинхэнэ координат вэ:
 *   • Зай нь километрээр бодогддог тул «хэр ойрхон таасан» гэдгийг
 *     шударгаар хэлж чадна. Хувиар бодвол зургийн хэлбэрээс хамаарч
 *     хойд, өмнөд хэсэгт өөр өөр хатуу болно.
 *   • Зургийн хэмжээ, дэлгэцийн өргөн өөрчлөгдөхөд өгөгдөл хэвээр.
 */

/* Зургийн хамрах хүрээ — Монгол ба хөрш орчим */
const BOUNDS = { west: 85, east: 122, south: 39, north: 54 };

/* SVG-ийн дотоод координатын систем */
const VIEW_W = 1000;
const VIEW_H = 560;

const ROUNDS = 6;

/** Уртраг → SVG x */
function lonToX(lon: number): number {
  return ((lon - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * VIEW_W;
}

/** Өргөрөг → SVG y (өргөрөг дээшээ өсдөг, y доошоо тул урвуулна) */
function latToY(lat: number): number {
  return ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * VIEW_H;
}

function xToLon(x: number): number {
  return BOUNDS.west + (x / VIEW_W) * (BOUNDS.east - BOUNDS.west);
}

function yToLat(y: number): number {
  return BOUNDS.north - (y / VIEW_H) * (BOUNDS.north - BOUNDS.south);
}

/** Хоёр цэгийн хоорондох зай, километрээр (haversine). */
function distanceKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;

  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/**
 * Зайг оноо болгоно.
 *
 * Монгол баруунаас зүүн тийш ~2400 км тул 150 км нь «маш нарийн»,
 * 800 км нь «ерөнхий чиглэлээ мэдэж байна» гэсэн үг.
 */
function scoreFor(km: number): { points: number; label: string; tone: string } {
  if (km <= 150) {
    return { points: 3, label: "Гайхалтай нарийн!", tone: "emerald" };
  }
  if (km <= 400) {
    return { points: 2, label: "Ойрхон таалаа", tone: "emerald" };
  }
  if (km <= 800) {
    return { points: 1, label: "Ерөнхий чиглэл зөв", tone: "gold" };
  }
  return { points: 0, label: "Хол зөрлөө", tone: "clay" };
}

/*
 * Монгол улсын хилийн ойролцоо тойм — чиг баримжаа өгөх зорилготой.
 * Хэмжилтийн нарийвчлал биш, ТАНИГДАХ хэлбэр нь чухал.
 */
const MONGOLIA: [number, number][] = [
  [87.8, 49.1], [89.0, 49.5], [90.0, 50.1], [91.0, 50.4], [92.4, 50.8],
  [94.3, 50.6], [95.8, 50.0], [97.2, 49.7], [98.3, 50.3], [99.0, 51.7],
  [100.5, 51.7], [102.1, 51.4], [103.0, 50.3], [104.6, 50.3], [106.0, 50.3],
  [107.3, 49.9], [108.5, 49.3], [110.0, 49.2], [111.6, 49.4], [113.0, 49.6],
  [114.3, 50.2], [115.8, 49.9], [116.7, 49.8], [117.9, 49.5], [119.7, 48.0],
  [118.0, 47.0], [117.3, 46.6], [115.9, 45.7], [114.5, 45.4], [113.6, 44.7],
  [112.1, 44.9], [111.0, 44.4], [110.4, 43.3], [109.5, 42.5], [107.7, 42.4],
  [106.0, 42.1], [104.5, 41.9], [103.0, 41.8], [101.8, 42.5], [100.8, 42.6],
  [99.5, 42.6], [97.2, 42.8], [96.4, 42.9], [95.9, 43.3], [95.0, 44.3],
  [94.0, 44.8], [92.0, 45.1], [90.9, 45.3], [90.7, 45.7], [91.0, 46.6],
  [90.3, 47.7], [89.0, 48.0], [87.8, 49.1],
];

/** Голуудын ойролцоо шугам — сэжүүрт «Орхон гол» гэх мэт нэр гардаг */
const RIVERS: { name: string; points: [number, number][] }[] = [
  {
    name: "Орхон",
    points: [[102.2, 46.9], [102.8, 47.6], [103.5, 48.6], [104.3, 49.3], [106.2, 50.3]],
  },
  {
    name: "Хэрлэн",
    points: [[107.5, 48.3], [109.2, 47.9], [110.6, 47.9], [112.5, 48.0], [114.5, 48.1], [116.5, 48.5]],
  },
  {
    name: "Онон",
    points: [[109.5, 48.4], [110.8, 48.8], [112.0, 49.6], [113.5, 50.4]],
  },
  {
    name: "Туул",
    points: [[105.0, 47.5], [106.3, 47.8], [107.5, 48.3], [105.5, 48.9]],
  },
];

/** Нуурууд — овал байдлаар ойролцоо байрлуулна */
const LAKES: { cx: number; cy: number; rx: number; ry: number }[] = [
  { cx: 100.5, cy: 51.0, rx: 0.45, ry: 1.1 }, // Хөвсгөл
  { cx: 93.3, cy: 48.5, rx: 0.5, ry: 0.5 }, // Увс
  { cx: 108.0, cy: 53.3, rx: 0.9, ry: 1.3 }, // Байгаль
];

function pathFrom(points: [number, number][]): string {
  return points
    .map(
      ([lon, lat], index) =>
        `${index === 0 ? "M" : "L"} ${lonToX(lon).toFixed(1)} ${latToY(lat).toFixed(1)}`,
    )
    .join(" ");
}

interface RoundResult {
  place: HistoricalPlace;
  guessLat: number;
  guessLon: number;
  km: number;
  points: number;
}

export function MapChallengeGame({
  game,
  places,
}: {
  game: Game;
  places: HistoricalPlace[];
}) {
  const { recordGameScore } = useProgress();

  const [pool] = useState(() => shuffle(places).slice(0, ROUNDS));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [current, setCurrent] = useState<RoundResult | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const finished = index >= pool.length;

  useEffect(() => {
    if (finished && pool.length > 0) recordGameScore(game.slug, score, game.xp);
  }, [finished, pool.length, game.slug, game.xp, score, recordGameScore]);

  if (pool.length === 0) {
    return (
      <Card>
        <p className="text-center text-sm text-fg-muted">
          Газрын өгөгдөл бэлэн биш байна.
        </p>
      </Card>
    );
  }

  if (finished) {
    const best = history.reduce(
      (min, item) => (item.km < min.km ? item : min),
      history[0],
    );

    return (
      <div className="space-y-5">
        <Card className="text-center">
          <div className="text-6xl" aria-hidden>
            {score >= ROUNDS * 2.5 ? "🏆" : score >= ROUNDS ? "🎉" : "💪"}
          </div>
          <h2 className="mt-4 text-2xl font-black">Тоглоом дууслаа</h2>
          <p className="mt-4 text-5xl font-black text-gold">
            {score}
            <span className="text-2xl text-fg-muted"> / {pool.length * 3}</span>
          </p>
          {best ? (
            <p className="mt-3 text-sm text-fg-muted">
              Хамгийн нарийн таамаг: <b>{best.place.name}</b> — {best.km} км зөрөв
            </p>
          ) : null}
          <div className="mt-8">
            <Button onClick={() => window.location.reload()}>
              🔄 Дахин тоглох
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-black">Үр дүн</h3>
          <ul className="mt-4 divide-y divide-line">
            {history.map((item) => (
              <li
                key={item.place.id}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <span className="font-semibold">{item.place.name}</span>
                <span className="text-fg-muted">{item.km} км</span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-bold",
                    item.points === 3 &&
                      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                    item.points === 2 &&
                      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                    item.points === 1 && "bg-gold/15 text-gold",
                    item.points === 0 && "bg-clay/15 text-clay",
                  )}
                >
                  +{item.points}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    );
  }

  const place = pool[index];

  /*
   * Дарсан цэгийг SVG-ийн дотоод координат руу хөрвүүлнэ.
   * `getBoundingClientRect` ашигласнаар зургийн бодит хэмжээ ямар ч
   * байсан (утас, дэлгэц) зөв ажиллана.
   */
  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (current) return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * VIEW_W;
    const y = ((event.clientY - rect.top) / rect.height) * VIEW_H;

    const guessLat = yToLat(y);
    const guessLon = xToLon(x);
    const km = distanceKm(guessLat, guessLon, place.lat, place.lon);
    const { points } = scoreFor(km);

    setCurrent({ place, guessLat, guessLon, km, points });
    setScore((value) => value + points);
  };

  const next = () => {
    if (!current) return;
    setHistory((list) => [...list, current]);
    setCurrent(null);
    setIndex((value) => value + 1);
  };

  const verdict = current ? scoreFor(current.km) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          {index + 1} / {pool.length}
        </span>
        <span className="text-gold">Оноо: {score}</span>
      </div>

      <Card>
        <p className="text-xs font-bold uppercase tracking-wider text-fg-muted">
          Энэ газрыг зураг дээр ол
        </p>
        <h2 className="mt-2 text-2xl font-black">{place.name}</h2>
        <p className="mt-3 text-sm leading-7 text-fg-muted">{place.hint}</p>
      </Card>

      <Card className="overflow-hidden p-0">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className={cn(
            "block w-full touch-manipulation",
            current ? "cursor-default" : "cursor-crosshair",
          )}
          onClick={handleClick}
          role="img"
          aria-label="Монгол ба хөрш орчмын схем зураг"
        >
          {/* Дэвсгэр */}
          <rect
            x={0}
            y={0}
            width={VIEW_W}
            height={VIEW_H}
            className="fill-muted"
          />

          {/* Уртраг, өргөрөгийн тор */}
          {[90, 95, 100, 105, 110, 115, 120].map((lon) => (
            <line
              key={`lon-${lon}`}
              x1={lonToX(lon)}
              y1={0}
              x2={lonToX(lon)}
              y2={VIEW_H}
              className="stroke-line"
              strokeWidth={1}
              opacity={0.5}
            />
          ))}
          {[42, 45, 48, 51].map((lat) => (
            <line
              key={`lat-${lat}`}
              x1={0}
              y1={latToY(lat)}
              x2={VIEW_W}
              y2={latToY(lat)}
              className="stroke-line"
              strokeWidth={1}
              opacity={0.5}
            />
          ))}

          {/* Монгол улсын нутаг дэвсгэр */}
          <path
            d={`${pathFrom(MONGOLIA)} Z`}
            className="fill-gold/10 stroke-gold"
            strokeWidth={2.5}
          />

          {/* Нуурууд */}
          {LAKES.map((lake) => (
            <ellipse
              key={`${lake.cx}-${lake.cy}`}
              cx={lonToX(lake.cx)}
              cy={latToY(lake.cy)}
              rx={(lake.rx / (BOUNDS.east - BOUNDS.west)) * VIEW_W}
              ry={(lake.ry / (BOUNDS.north - BOUNDS.south)) * VIEW_H}
              className="fill-sky-500/40"
            />
          ))}

          {/* Голууд */}
          {RIVERS.map((river) => (
            <path
              key={river.name}
              d={pathFrom(river.points)}
              fill="none"
              className="stroke-sky-500/50"
              strokeWidth={2}
            />
          ))}

          {/* Хариулт харуулах үе */}
          {current ? (
            <>
              <line
                x1={lonToX(current.guessLon)}
                y1={latToY(current.guessLat)}
                x2={lonToX(place.lon)}
                y2={latToY(place.lat)}
                className="stroke-fg-muted"
                strokeWidth={2}
                strokeDasharray="6 5"
              />

              {/* Сурагчийн таамаг */}
              <circle
                cx={lonToX(current.guessLon)}
                cy={latToY(current.guessLat)}
                r={9}
                className="fill-clay"
                stroke="white"
                strokeWidth={2}
              />

              {/* Жинхэнэ байршил */}
              <circle
                cx={lonToX(place.lon)}
                cy={latToY(place.lat)}
                r={11}
                className="fill-emerald-500"
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={lonToX(place.lon)}
                y={latToY(place.lat) - 20}
                textAnchor="middle"
                className="fill-fg text-[20px] font-bold"
              >
                {place.name}
              </text>
            </>
          ) : null}
        </svg>
      </Card>

      {current && verdict ? (
        <Card
          className={cn(
            verdict.tone === "emerald" && "border-emerald-500/60",
            verdict.tone === "gold" && "border-gold/60",
            verdict.tone === "clay" && "border-clay/60",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-black">{verdict.label}</p>
              <p className="mt-1 text-sm text-fg-muted">
                Жинхэнэ байрлалаас <b>{current.km} км</b> зөрлөө · +
                {current.points} оноо
              </p>
            </div>
            <Button onClick={next}>
              {index + 1 >= pool.length ? "Дүн харах →" : "Дараагийн газар →"}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-fg-muted">
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-clay" />
              Таны таамаг
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
              Жинхэнэ байрлал
            </span>
          </div>
        </Card>
      ) : (
        <p className="text-center text-sm text-fg-muted">
          Зураг дээр дарж таамаглалаа тавина уу. Ойртох тусам оноо өндөр:
          150 км дотор +3, 400 км дотор +2, 800 км дотор +1.
        </p>
      )}
    </div>
  );
}
