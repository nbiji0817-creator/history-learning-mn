"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SearchKind } from "@/types";
import { searchAll } from "@/lib/search";
import { cn } from "@/lib/utils";

const kindLabels: Record<SearchKind, string> = {
  lesson: "Хичээл",
  figure: "Түүхэн хүн",
  event: "Үйл явдал",
  source: "Эх сурвалж",
  term: "Нэр томьёо",
  game: "Тоглоом",
  exam: "Шалгалт",
};

const quick = ["Чингис хаан", "1206", "Хүннү", "Юань улс", "1911", "Хархорум"];

export function SearchPanel({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [kind, setKind] = useState<SearchKind | "all">("all");

  const results = useMemo(() => searchAll(query), [query]);
  const filtered =
    kind === "all" ? results : results.filter((item) => item.kind === kind);

  const counts = useMemo(() => {
    const map: Partial<Record<SearchKind, number>> = {};
    for (const item of results) {
      map[item.kind] = (map[item.kind] ?? 0) + 1;
    }
    return map;
  }, [results]);

  return (
    <div className="space-y-6">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Юу хайх вэ?"
        autoFocus
        className="w-full rounded-2xl border border-line bg-surface px-5 py-4 text-lg outline-none focus:border-gold"
        aria-label="Хайх"
      />

      {query.trim().length < 2 ? (
        <div className="rounded-2xl border border-dashed border-line p-8 text-center">
          <p className="text-sm text-fg-muted">
            Хайхын тулд дор хаяж 2 тэмдэгт бичнэ үү.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {quick.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuery(item)}
                className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold transition hover:border-gold hover:text-gold"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Chip active={kind === "all"} onClick={() => setKind("all")}>
              Бүгд ({results.length})
            </Chip>
            {(Object.keys(counts) as SearchKind[]).map((item) => (
              <Chip
                key={item}
                active={kind === item}
                onClick={() => setKind(item)}
              >
                {kindLabels[item]} ({counts[item]})
              </Chip>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-fg-muted">
              «{query}» гэсэн хайлтад тохирох үр дүн олдсонгүй.
            </p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((item) => (
                <li key={`${item.kind}-${item.href}-${item.title}`}>
                  <Link
                    href={item.href}
                    className="flex gap-4 rounded-2xl border border-line bg-surface p-5 transition hover:border-gold/60"
                  >
                    <span className="text-3xl" aria-hidden>
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-bold">{item.title}</span>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-fg-muted">
                          {item.badge}
                        </span>
                      </span>
                      <span className="mt-1.5 block text-sm leading-6 text-fg-muted">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
        active
          ? "border-gold bg-gold/15 text-gold"
          : "border-line text-fg-muted hover:border-gold/50 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
