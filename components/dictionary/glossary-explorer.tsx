"use client";

import { useMemo, useState } from "react";
import type { GlossaryTerm } from "@/types";
import { cn } from "@/lib/utils";

export function GlossaryExplorer({ terms }: { terms: GlossaryTerm[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(
    () => Array.from(new Set(terms.map((term) => term.category))),
    [terms],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return terms.filter((term) => {
      if (category !== "all" && term.category !== category) return false;
      if (
        needle &&
        !`${term.term} ${term.definition}`.toLowerCase().includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [terms, query, category]);

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Нэр томьёо хайх…"
          className="w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
          aria-label="Нэр томьёо хайх"
        />

        <div className="flex flex-wrap gap-2">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            Бүгд
          </Chip>
          {categories.map((item) => (
            <Chip
              key={item}
              active={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </Chip>
          ))}
        </div>

        <p className="text-xs text-fg-muted">{filtered.length} нэр томьёо</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        {filtered.map((term) => (
          <div
            key={term.term}
            id={encodeURIComponent(term.term)}
            className="scroll-mt-24 rounded-2xl border border-line bg-surface p-5"
          >
            <dt className="flex items-center justify-between gap-3">
              <span className="text-lg font-black text-gold">{term.term}</span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-fg-muted">
                {term.category}
              </span>
            </dt>
            <dd className="mt-3 text-sm leading-7 text-fg-muted">
              {term.definition}
            </dd>
            {term.relatedTerms.length > 0 ? (
              <dd className="mt-3 flex flex-wrap gap-1.5">
                {term.relatedTerms.map((related) => (
                  <a
                    key={related}
                    href={`#${encodeURIComponent(related)}`}
                    className="rounded-full border border-line px-2.5 py-0.5 text-[11px] transition hover:border-gold hover:text-gold"
                  >
                    {related}
                  </a>
                ))}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-fg-muted">
          Тохирох нэр томьёо олдсонгүй.
        </p>
      ) : null}
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
