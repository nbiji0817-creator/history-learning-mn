"use client";

import { useMemo, useState } from "react";
import type { EraKey, HistoricalEvent } from "@/types";
import { eras } from "@/data/eras";
import { EventTimeline } from "./event-timeline";
import { cn } from "@/lib/utils";

type RegionFilter = "all" | "mn" | "world";

export function TimelineExplorer({
  events,
  detailed = false,
}: {
  events: HistoricalEvent[];
  detailed?: boolean;
}) {
  const [era, setEra] = useState<EraKey | "all">("all");
  const [region, setRegion] = useState<RegionFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return events.filter((event) => {
      if (era !== "all" && event.era !== era) return false;
      if (region !== "all" && event.region !== region) return false;
      if (
        needle &&
        ![event.title, event.summary, event.year, event.place, ...event.tags]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [events, era, region, query]);

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Үйл явдал, он, газар хайх…"
          className="w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
          aria-label="Үйл явдал хайх"
        />

        <div className="flex flex-wrap gap-2">
          <FilterChip active={era === "all"} onClick={() => setEra("all")}>
            Бүх эрин
          </FilterChip>
          {eras.map((item) => (
            <FilterChip
              key={item.key}
              active={era === item.key}
              onClick={() => setEra(item.key)}
            >
              {item.label}
              <span className="ml-1 text-[10px] opacity-70">{item.range}</span>
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={region === "all"} onClick={() => setRegion("all")}>
            Бүгд
          </FilterChip>
          <FilterChip active={region === "mn"} onClick={() => setRegion("mn")}>
            🇲🇳 Монгол
          </FilterChip>
          <FilterChip active={region === "world"} onClick={() => setRegion("world")}>
            🌍 Дэлхий
          </FilterChip>
        </div>

        <p className="text-xs text-fg-muted">
          {filtered.length} үйл явдал олдлоо
        </p>
      </div>

      <EventTimeline events={filtered} detailed={detailed} />
    </div>
  );
}

function FilterChip({
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
