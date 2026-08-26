"use client";

import { useMemo } from "react";
import { Button, Card } from "@/components/ui/primitives";
import {
  prefersReducedMotion,
  useAnimationClock,
} from "@/lib/games/use-animation-frame";
import { cn } from "@/lib/utils";

/**
 * ЭЗЭНТ ГҮРНИЙ ТЭЛЭЛТ — ХӨДӨЛГӨӨНТ ГАЗРЫН ЗУРАГ
 *
 * 1206–1294 оны хооронд Их Монгол улс хэрхэн тэлснийг он цагийн
 * дагуу үзүүлнэ. Бүс нутаг бүр эзлэгдсэн ондоо гарч ирж, аажим
 * тодорно.
 *
 * ЯАГААД ХУГАЦААГ ШУУД ОН БОЛГОСОН БИШ ВЭ:
 * Гогцоо нь миллисекунд тоолдог. Түүнийг он болгон хөрвүүлснээр
 * хурдыг өөрчлөх, цагийн шугамыг чирэх, хоёулаа нэг эх сурвалжтай
 * болно.
 */

const START_YEAR = 1206;
const END_YEAR = 1294;
const YEARS = END_YEAR - START_YEAR;

/* Нэг он хэдэн миллисекунд үргэлжлэх вэ */
const MS_PER_YEAR = 500;
const TOTAL_MS = YEARS * MS_PER_YEAR;

/* Ази, Европыг хамрах хүрээ */
const BOUNDS = { west: 20, east: 135, south: 18, north: 62 };
const VIEW_W = 1000;
const VIEW_H = 480;

function lonToX(lon: number): number {
  return ((lon - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * VIEW_W;
}

function latToY(lat: number): number {
  return ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * VIEW_H;
}

interface Region {
  id: string;
  name: string;
  /** Энэ ондоо гарч эхэлнэ */
  year: number;
  /** Бүрэн тодрох хүртэлх жил */
  fadeYears: number;
  /** Ойролцоо хүрээ — [уртраг, өргөрөг] цэгүүд */
  shape: [number, number][];
  event: string;
}

/*
 * Бүс нутгийн хүрээ нь ТОЙМ. Зорилго нь хилийн нарийвчлал биш,
 * «хэзээ хаашаа тэлсэн» гэдгийг мэдрүүлэх.
 */
const REGIONS: Region[] = [
  {
    id: "mongolia",
    name: "Монгол нутаг",
    year: 1206,
    fadeYears: 2,
    shape: [
      [88, 49], [95, 51], [102, 51], [110, 50], [118, 49],
      [117, 45], [110, 43], [102, 42], [95, 44], [88, 46],
    ],
    event: "Их хуралдайгаар Их Монгол улс байгуулагдав.",
  },
  {
    id: "xixia",
    name: "Тангуд (Ся)",
    year: 1209,
    fadeYears: 18,
    shape: [
      [98, 41], [106, 41], [108, 37], [103, 35], [98, 37],
    ],
    event: "Тангуд улс алба барихаар болов; 1227 онд бүрэн эзлэгдэв.",
  },
  {
    id: "jin",
    name: "Алтан улс (Хятад хойд)",
    year: 1211,
    fadeYears: 23,
    shape: [
      [110, 42], [122, 43], [124, 38], [119, 33], [111, 34], [108, 38],
    ],
    event: "Алтан улс руу дайн эхлэв; 1234 онд мөхөв.",
  },
  {
    id: "qara-khitai",
    name: "Хар Хятан",
    year: 1218,
    fadeYears: 2,
    shape: [
      [72, 45], [85, 46], [88, 41], [80, 38], [73, 40],
    ],
    event: "Хүчүлүгийг устгаж, Хар Хятаны нутгийг нэгтгэв.",
  },
  {
    id: "khwarazm",
    name: "Хорезм",
    year: 1219,
    fadeYears: 6,
    shape: [
      [52, 44], [66, 45], [72, 40], [68, 32], [58, 30], [52, 36],
    ],
    event: "Отрарын хядлагын хариуд баруун зүгийн аян эхлэв.",
  },
  {
    id: "caucasus",
    name: "Кавказ, Кипчак",
    year: 1223,
    fadeYears: 15,
    shape: [
      [38, 48], [50, 50], [54, 44], [48, 39], [40, 41],
    ],
    event: "Зэв, Сүбээдэй хайгуулын аян хийж, Калка мөрөнд ялалт байгуулав.",
  },
  {
    id: "rus",
    name: "Оросын хаант улсууд",
    year: 1237,
    fadeYears: 4,
    shape: [
      [30, 58], [42, 59], [48, 54], [44, 48], [34, 49], [29, 53],
    ],
    event: "Бат хааны их аян: Рязань, Владимир, Киев эзлэгдэв.",
  },
  {
    id: "europe",
    name: "Польш, Унгар",
    year: 1241,
    fadeYears: 2,
    shape: [
      [17, 52], [26, 53], [28, 46], [22, 44], [17, 47],
    ],
    event: "Легница, Мохид ялалт байгуулав; Өгэдэй нас барахад цэрэг буцав.",
  },
  {
    id: "persia",
    name: "Перс, Багдад",
    year: 1256,
    fadeYears: 4,
    shape: [
      [44, 40], [58, 40], [62, 32], [56, 26], [46, 28], [42, 34],
    ],
    event: "Хулагу Аламутыг авч, 1258 онд Багдадыг эзлэв.",
  },
  {
    id: "song",
    name: "Сүн улс (Хятад өмнөд)",
    year: 1268,
    fadeYears: 11,
    shape: [
      [104, 33], [120, 33], [122, 26], [116, 21], [106, 23], [102, 28],
    ],
    event: "Сяньян хотын бүслэлт эхлэв; 1279 онд Сүн улс мөхөв.",
  },
];

/** Тухайн онд энэ бүс хэр тодорсон бэ (0–1) */
function opacityAt(region: Region, year: number): number {
  if (year < region.year) return 0;
  const progress = (year - region.year) / Math.max(1, region.fadeYears);
  return Math.min(1, 0.35 + progress * 0.65);
}

function pathFrom(points: [number, number][]): string {
  return (
    points
      .map(
        ([lon, lat], index) =>
          `${index === 0 ? "M" : "L"} ${lonToX(lon).toFixed(1)} ${latToY(lat).toFixed(1)}`,
      )
      .join(" ") + " Z"
  );
}

export function EmpireExpansionSim() {
  const reduced = prefersReducedMotion();

  const clock = useAnimationClock({
    durationMs: TOTAL_MS,
    autoStart: false,
  });

  /* Хөдөлгөөн багасгах горимд бүх зургийг шууд харуулна */
  const year = reduced
    ? END_YEAR
    : Math.round(START_YEAR + (clock.elapsed / MS_PER_YEAR));

  /* Энэ онд шинээр нээгдсэн бүс — тайлбар мөрөнд харуулна */
  const active = useMemo(() => {
    const opened = REGIONS.filter((region) => region.year <= year);
    return opened[opened.length - 1] ?? null;
  }, [year]);

  const areaShare = Math.round(
    (REGIONS.filter((r) => r.year <= year).length / REGIONS.length) * 100,
  );

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block w-full"
          role="img"
          aria-label={`Монголын эзэнт гүрний хил ${year} онд`}
        >
          <rect
            x={0}
            y={0}
            width={VIEW_W}
            height={VIEW_H}
            className="fill-muted"
          />

          {/* Уртраг, өргөрөгийн тор */}
          {[30, 50, 70, 90, 110, 130].map((lon) => (
            <line
              key={`lon-${lon}`}
              x1={lonToX(lon)}
              y1={0}
              x2={lonToX(lon)}
              y2={VIEW_H}
              className="stroke-line"
              strokeWidth={1}
              opacity={0.4}
            />
          ))}
          {[25, 35, 45, 55].map((lat) => (
            <line
              key={`lat-${lat}`}
              x1={0}
              y1={latToY(lat)}
              x2={VIEW_W}
              y2={latToY(lat)}
              className="stroke-line"
              strokeWidth={1}
              opacity={0.4}
            />
          ))}

          {/* Бүс нутгууд */}
          {REGIONS.map((region) => {
            const opacity = opacityAt(region, year);
            if (opacity === 0) return null;

            return (
              <g key={region.id}>
                <path
                  d={pathFrom(region.shape)}
                  className="fill-gold stroke-gold"
                  fillOpacity={opacity * 0.45}
                  strokeOpacity={opacity}
                  strokeWidth={2}
                />
                {opacity > 0.6 ? (
                  <text
                    x={lonToX(
                      region.shape.reduce((sum, p) => sum + p[0], 0) /
                        region.shape.length,
                    )}
                    y={latToY(
                      region.shape.reduce((sum, p) => sum + p[1], 0) /
                        region.shape.length,
                    )}
                    textAnchor="middle"
                    className="fill-fg text-[15px] font-bold"
                    opacity={opacity}
                  >
                    {region.name}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        <div className="border-t border-line px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-3xl font-black text-gold">{year} он</p>
            <p className="text-sm text-fg-muted">
              Нэгтгэсэн бүс: <b>{areaShare}%</b>
            </p>
          </div>

          {active ? (
            <p className="mt-3 text-sm leading-7">
              <b>{active.name}</b> — {active.event}
            </p>
          ) : null}
        </div>
      </Card>

      {/* Удирдлага */}
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={clock.toggle}>
            {clock.running ? "⏸ Түр зогсоох" : "▶ Тоглуулах"}
          </Button>
          <Button variant="secondary" onClick={clock.reset}>
            ⏮ Эхнээс
          </Button>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-semibold">Он цаг</span>
          <input
            type="range"
            min={0}
            max={TOTAL_MS}
            step={MS_PER_YEAR}
            value={clock.elapsed}
            onChange={(event) => {
              clock.pause();
              clock.seek(Number(event.target.value));
            }}
            className="mt-2 w-full accent-[var(--gold)]"
            aria-label="Он цагийг чирж сонгох"
          />
          <span className="mt-1 flex justify-between text-xs text-fg-muted">
            <span>{START_YEAR}</span>
            <span>{END_YEAR}</span>
          </span>
        </label>
      </Card>

      {/* Он цагийн жагсаалт */}
      <Card>
        <h3 className="text-sm font-black">Он цагийн хэлхээс</h3>
        <ol className="mt-4 space-y-2">
          {REGIONS.map((region) => {
            const reached = region.year <= year;
            return (
              <li
                key={region.id}
                className={cn(
                  "flex gap-3 rounded-lg px-2 py-1.5 text-sm transition",
                  reached ? "text-fg" : "text-fg-muted opacity-50",
                )}
              >
                <span className="w-12 shrink-0 font-black text-gold">
                  {region.year}
                </span>
                <span>
                  <b>{region.name}</b> — {region.event}
                </span>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
