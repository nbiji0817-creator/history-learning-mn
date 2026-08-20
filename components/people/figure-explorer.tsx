"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { EraKey, HistoricalFigure } from "@/types";
import { eras, eraStyles } from "@/data/eras";
import { cn } from "@/lib/utils";

export function FigureExplorer({ figures }: { figures: HistoricalFigure[] }) {
  const [era, setEra] = useState<EraKey | "all">("all");
  const [region, setRegion] = useState<"all" | "mn" | "world">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return figures.filter((figure) => {
      if (era !== "all" && figure.era !== era) return false;
      if (region !== "all" && figure.region !== region) return false;
      if (
        needle &&
        ![figure.name, figure.title, figure.summary, ...figure.tags]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [figures, era, region, query]);

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Түүхэн хүн хайх…"
          className="w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
          aria-label="Түүхэн хүн хайх"
        />

        <div className="flex flex-wrap gap-2">
          <Chip active={era === "all"} onClick={() => setEra("all")}>
            Бүх эрин
          </Chip>
          {eras.map((item) => (
            <Chip
              key={item.key}
              active={era === item.key}
              onClick={() => setEra(item.key)}
            >
              {item.label}
            </Chip>
          ))}
          <span className="mx-1 w-px bg-line" aria-hidden />
          <Chip active={region === "all"} onClick={() => setRegion("all")}>
            Бүгд
          </Chip>
          <Chip active={region === "mn"} onClick={() => setRegion("mn")}>
            🇲🇳 Монгол
          </Chip>
          <Chip active={region === "world"} onClick={() => setRegion("world")}>
            🌍 Дэлхий
          </Chip>
        </div>

        <p className="text-xs text-fg-muted">{filtered.length} хүн олдлоо</p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-fg-muted">
          Тохирох түүхэн хүн олдсонгүй.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((figure) => (
            <Link
              key={figure.slug}
              href={`/people/${figure.slug}`}
              className="group rounded-2xl border border-line bg-surface p-6 transition hover:-translate-y-1 hover:border-gold/60"
            >
              <div className="flex items-start justify-between">
                <span className="text-5xl" aria-hidden>
                  {figure.portrait}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${eraStyles[figure.era].chip}`}
                >
                  {eras.find((item) => item.key === figure.era)?.label}
                </span>
              </div>

              <h2 className="mt-5 text-lg font-black group-hover:text-gold">
                {figure.name}
              </h2>
              <p className="text-sm text-fg-muted">{figure.title}</p>
              <p className="mt-2 font-mono text-xs text-gold">
                {figure.born} – {figure.died}
              </p>
              <p className="mt-3 text-sm leading-6 text-fg-muted">
                {figure.summary}
              </p>
            </Link>
          ))}
        </div>
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
