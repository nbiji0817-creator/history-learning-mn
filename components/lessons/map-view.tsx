"use client";

import { useState } from "react";
import type { MapView } from "@/types";

const markerStyles: Record<string, { color: string; label: string }> = {
  capital: { color: "bg-gold", label: "Нийслэл" },
  battle: { color: "bg-clay", label: "Тулалдаан" },
  city: { color: "bg-sky-500", label: "Хот" },
  site: { color: "bg-emerald-500", label: "Дурсгал" },
};

/**
 * Схемчилсэн интерактив газрын зураг.
 * Phase 2-т бодит газрын зураг (SVG/tile) ашиглана — marker-ийн өгөгдөл
 * ижил хэвээр үлдэнэ.
 */
export function MapBlock({ data }: { data: MapView }) {
  const [active, setActive] = useState<string | null>(null);
  const selected = data.markers.find((marker) => marker.id === active) ?? null;

  return (
    <div className="space-y-4">
      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-muted to-surface">
        {/* Схемчилсэн тор */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "10% 10%",
          }}
          aria-hidden
        />

        <p className="absolute left-4 top-3 text-xs font-bold uppercase tracking-wider text-fg-muted">
          {data.title}
        </p>

        {data.markers.map((marker) => (
          <button
            key={marker.id}
            type="button"
            onClick={() => setActive(marker.id === active ? null : marker.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            aria-label={`${marker.name} (${marker.year})`}
            aria-pressed={marker.id === active}
          >
            <span
              className={`block h-4 w-4 rounded-full ring-4 ring-[var(--bg)] transition ${
                markerStyles[marker.kind]?.color ?? "bg-gold"
              } ${marker.id === active ? "scale-150" : "hover:scale-125"}`}
            />
            <span className="mt-1 block whitespace-nowrap text-[10px] font-bold">
              {marker.name}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(markerStyles).map(([kind, style]) => (
          <span key={kind} className="flex items-center gap-1.5 text-fg-muted">
            <span className={`h-2.5 w-2.5 rounded-full ${style.color}`} aria-hidden />
            {style.label}
          </span>
        ))}
      </div>

      {selected ? (
        <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5">
          <div className="flex items-center justify-between gap-4">
            <h4 className="font-bold">{selected.name}</h4>
            <span className="font-mono text-sm font-bold text-gold">
              {selected.year}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-fg-muted">
            {selected.description}
          </p>
        </div>
      ) : (
        <p className="text-sm text-fg-muted">
          Тэмдэглэгээ дээр дарж дэлгэрэнгүй мэдээллийг үзнэ үү.
        </p>
      )}

      {data.caption ? (
        <p className="text-xs italic text-fg-muted">{data.caption}</p>
      ) : null}
    </div>
  );
}
