"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Game, GlossaryTerm } from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

/**
 * ТҮҮХЭН ҮГ ХАЙХ
 *
 * Кирилл үсгийн тор дотроос түүхийн нэр томьёог олж тэмдэглэнэ.
 * Олсон үг бүрийн тайлбар нээгдэх тул тоглоом нь давхар давтлага
 * болно — зөвхөн үг олох биш, утгыг нь харах.
 *
 * Сонголт: эхний нүдийг дараад төгсгөлийн нүдийг дарна. Чирэх
 * (drag) хэрэглээгүй нь санаатай — хүрэлцэх дэлгэц дээр чирэх нь
 * хуудсыг гүйлгэдэг тул хоёр товшилт хамаагүй найдвартай.
 */

const SIZE = 12;
const WORD_COUNT = 7;

/* Монгол кирилл — тор дүүргэхэд ашиглана */
const ALPHABET = "АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЫЭЮЯ";

/** Найман чиглэл: хэвтээ, босоо, хоёр диагональ, тус бүр хоёр зүгт */
const DIRECTIONS: [number, number][] = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

interface Placed {
  word: string;
  term: GlossaryTerm;
  cells: number[];
}

interface Puzzle {
  grid: string[];
  placed: Placed[];
}

/**
 * Нэр томьёог тор дээр байрлуулахад тохирох үг болгоно.
 *
 * Олон үгтэй нэр томьёо («Анхдагч эх сурвалж») торонд багтахгүй тул
 * зөвхөн нэг үгтэйг авна. Зай, зураас, цэг агуулаагүй, 4–9 үсэгтэй
 * байх нь торны хэмжээнд тохирно.
 */
function candidateWords(terms: GlossaryTerm[]): Placed[] {
  const seen = new Set<string>();
  const out: Placed[] = [];

  for (const term of terms) {
    const word = term.term.trim().toUpperCase().replace(/Ь/g, "");

    if (!/^[А-ЯЁӨҮ]{4,9}$/.test(word)) continue;
    if (seen.has(word)) continue;

    seen.add(word);
    out.push({ word, term, cells: [] });
  }

  return out;
}

function randomLetter(): string {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

/**
 * Торыг үүсгэнэ.
 *
 * Үг бүрийг санамсаргүй байрлал, чиглэлээр тавихыг оролдоно. Аль
 * хэдийн тавьсан үсэгтэй ТААРВАЛ давхарлаж болно (сонгодог үг хайх
 * тоглоом ингэдэг). Оролдлого бүтэхгүй бол тэр үгийг алгасна —
 * тоглоом эхлэхгүй хөлдөхөөс сэргийлнэ.
 */
function buildPuzzle(candidates: Placed[]): Puzzle {
  const grid: (string | null)[] = new Array(SIZE * SIZE).fill(null);
  const placed: Placed[] = [];

  const shuffled = [...candidates].sort(() => Math.random() - 0.5);

  for (const candidate of shuffled) {
    if (placed.length >= WORD_COUNT) break;

    const letters = [...candidate.word];
    let done = false;

    for (let attempt = 0; attempt < 220 && !done; attempt += 1) {
      const [dRow, dCol] =
        DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const row = Math.floor(Math.random() * SIZE);
      const col = Math.floor(Math.random() * SIZE);

      const endRow = row + dRow * (letters.length - 1);
      const endCol = col + dCol * (letters.length - 1);
      if (endRow < 0 || endRow >= SIZE || endCol < 0 || endCol >= SIZE) continue;

      /* Зам чөлөөтэй эсвэл ижил үсэгтэй давхцаж байгаа эсэх */
      const cells: number[] = [];
      let fits = true;

      for (let i = 0; i < letters.length; i += 1) {
        const r = row + dRow * i;
        const c = col + dCol * i;
        const at = r * SIZE + c;
        const existing = grid[at];

        if (existing !== null && existing !== letters[i]) {
          fits = false;
          break;
        }
        cells.push(at);
      }

      if (!fits) continue;

      cells.forEach((at, i) => {
        grid[at] = letters[i];
      });
      placed.push({ ...candidate, cells });
      done = true;
    }
  }

  return {
    grid: grid.map((letter) => letter ?? randomLetter()),
    placed,
  };
}

/**
 * Хоёр нүдний хооронд шулуун зам байвал нүднүүдийг буцаана.
 * Хэвтээ, босоо, 45° диагональ л зөвшөөрнө.
 */
function lineBetween(from: number, to: number): number[] | null {
  const fromRow = Math.floor(from / SIZE);
  const fromCol = from % SIZE;
  const toRow = Math.floor(to / SIZE);
  const toCol = to % SIZE;

  const dRow = toRow - fromRow;
  const dCol = toCol - fromCol;

  const straight =
    dRow === 0 || dCol === 0 || Math.abs(dRow) === Math.abs(dCol);
  if (!straight) return null;

  const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
  if (steps === 0) return null;

  const stepRow = Math.sign(dRow);
  const stepCol = Math.sign(dCol);

  const cells: number[] = [];
  for (let i = 0; i <= steps; i += 1) {
    cells.push((fromRow + stepRow * i) * SIZE + (fromCol + stepCol * i));
  }
  return cells;
}

function sameCells(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const reversed = [...b].reverse();
  return (
    a.every((value, index) => value === b[index]) ||
    a.every((value, index) => value === reversed[index])
  );
}

export function WordSearchGame({
  game,
  terms,
}: {
  game: Game;
  terms: GlossaryTerm[];
}) {
  const { recordGameScore } = useProgress();

  const [puzzle] = useState<Puzzle>(() => buildPuzzle(candidateWords(terms)));
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [anchor, setAnchor] = useState<number | null>(null);
  /*
   * Товшилт хоорондоо маш ойрхон болвол (хүрэлцэх дэлгэц дээр давхар
   * товшилт) React төлөвөө шинэчилж амжаагүй байхад дараагийн
   * боловсруулагч ажиллана. Тэр үед `anchor` хуучин утгаа хадгалж
   * байдаг тул сонголт алдагдана. Ref нь шууд шинэчлэгддэг учир
   * найдвартай.
   */
  const anchorRef = useRef<number | null>(null);
  const [flash, setFlash] = useState<{ cells: number[]; ok: boolean } | null>(
    null,
  );
  const [seconds, setSeconds] = useState(0);

  const total = puzzle.placed.length;
  const finished = total > 0 && foundWords.length === total;

  /* Хугацаа — дарамт үүсгэхгүй, зөвхөн өөрийгөө хэмжих зорилготой */
  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finished]);

  useEffect(() => {
    if (finished) recordGameScore(game.slug, foundWords.length, game.xp);
  }, [finished, foundWords.length, game.slug, game.xp, recordGameScore]);

  /* Олсон үгсийн нүднүүд — торыг будахад */
  const foundCells = useMemo(() => {
    const set = new Set<number>();
    for (const item of puzzle.placed) {
      if (foundWords.includes(item.word)) {
        item.cells.forEach((cell) => set.add(cell));
      }
    }
    return set;
  }, [puzzle.placed, foundWords]);

  if (total === 0) {
    return (
      <Card>
        <p className="text-center text-sm text-fg-muted">
          Тохирох нэр томьёо олдсонгүй.
        </p>
      </Card>
    );
  }

  const handleCell = (at: number) => {
    if (finished) return;

    const start = anchorRef.current;

    if (start === null) {
      anchorRef.current = at;
      setAnchor(at);
      setFlash(null);
      return;
    }

    if (start === at) {
      anchorRef.current = null;
      setAnchor(null);
      return;
    }

    const cells = lineBetween(start, at);
    anchorRef.current = null;
    setAnchor(null);

    if (!cells) {
      setFlash({ cells: [start, at], ok: false });
      window.setTimeout(() => setFlash(null), 600);
      return;
    }

    const hit = puzzle.placed.find(
      (item) => !foundWords.includes(item.word) && sameCells(item.cells, cells),
    );

    if (hit) {
      setFoundWords((list) => [...list, hit.word]);
      setFlash({ cells, ok: true });
    } else {
      setFlash({ cells, ok: false });
    }
    window.setTimeout(() => setFlash(null), 700);
  };

  const minutes = Math.floor(seconds / 60);
  const clock = `${minutes}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          Олсон: {foundWords.length} / {total}
        </span>
        <span className="text-gold">⏱ {clock}</span>
      </div>

      {finished ? (
        <Card className="text-center">
          <div className="text-6xl" aria-hidden>
            🏆
          </div>
          <h2 className="mt-4 text-2xl font-black">Бүх үгийг оллоо!</h2>
          <p className="mt-3 text-sm text-fg-muted">
            {total} үгийг {clock} хугацаанд оллоо.
          </p>
          <div className="mt-8">
            <Button onClick={() => window.location.reload()}>
              🔄 Дахин тоглох
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-x-auto">
        <div
          className="mx-auto grid w-max gap-1"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
        >
          {puzzle.grid.map((letter, at) => {
            const isFound = foundCells.has(at);
            const isAnchor = anchor === at;
            const inFlash = flash?.cells.includes(at) ?? false;

            return (
              <button
                key={at}
                type="button"
                onClick={() => handleCell(at)}
                disabled={finished}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold transition sm:h-9 sm:w-9",
                  "border border-line",
                  isFound && "border-emerald-500/60 bg-emerald-500/20",
                  isAnchor && "border-gold bg-gold/30",
                  inFlash && flash?.ok && "bg-emerald-500/40",
                  inFlash && !flash?.ok && "bg-clay/40",
                  !isFound && !isAnchor && !inFlash && "hover:bg-muted",
                )}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-center text-xs leading-6 text-fg-muted">
          Үгийн <b>эхний</b> үсгийг дараад, дараа нь <b>сүүлийн</b> үсгийг
          дарна. Үг хэвтээ, босоо, налуу — найман чиглэлд, урвуугаар ч
          бичигдсэн байж болно.
        </p>
      </Card>

      <Card>
        <h3 className="text-sm font-black">Хайх үгс</h3>
        <ul className="mt-4 space-y-3">
          {puzzle.placed.map((item) => {
            const done = foundWords.includes(item.word);
            return (
              <li key={item.word}>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-bold",
                      done
                        ? "text-emerald-600 line-through dark:text-emerald-400"
                        : "text-fg",
                    )}
                  >
                    {item.word}
                  </span>
                  {done ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                      ✓
                    </span>
                  ) : null}
                </div>
                {/* Тайлбар зөвхөн олсны дараа — эс бөгөөс хариултаа хэлчихнэ */}
                {done ? (
                  <p className="mt-1 text-xs leading-6 text-fg-muted">
                    {item.term.definition}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
