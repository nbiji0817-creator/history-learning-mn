import Link from "next/link";
import type { HistoricalEvent } from "@/types";
import { eraStyles, eraMap } from "@/data/eras";

/** Хичээл дотор болон он цагийн хуудсанд ашиглагдах босоо хэлхээс. */
export function EventTimeline({
  events,
  detailed = false,
}: {
  events: HistoricalEvent[];
  detailed?: boolean;
}) {
  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-fg-muted">
        Үйл явдал олдсонгүй.
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 border-l-2 border-line pl-6">
      {events.map((event) => (
        <li key={event.id} id={event.id} className="relative scroll-mt-24">
          <span
            className={`absolute -left-[31px] top-5 h-3.5 w-3.5 rounded-full ring-4 ring-[var(--bg)] ${eraStyles[event.era].dot}`}
            aria-hidden
          />

          <article className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl" aria-hidden>
                {event.icon}
              </span>
              <span className="font-mono text-sm font-black text-gold">
                {event.year}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${eraStyles[event.era].chip}`}
              >
                {eraMap[event.era].label}
              </span>
              <span className="text-[11px] font-medium text-fg-muted">
                {event.region === "mn" ? "🇲🇳 Монгол" : "🌍 Дэлхий"}
              </span>
            </div>

            <h3 className="mt-3 text-lg font-bold leading-tight">{event.title}</h3>

            <p className="mt-2 text-sm leading-6 text-fg-muted">{event.summary}</p>

            {detailed ? (
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {event.cause ? (
                  <div className="rounded-xl bg-muted/60 p-3">
                    <dt className="text-xs font-bold text-gold">Шалтгаан</dt>
                    <dd className="mt-1 text-sm leading-6">{event.cause}</dd>
                  </div>
                ) : null}
                {event.course ? (
                  <div className="rounded-xl bg-muted/60 p-3">
                    <dt className="text-xs font-bold text-gold">Явц</dt>
                    <dd className="mt-1 text-sm leading-6">{event.course}</dd>
                  </div>
                ) : null}
                {event.result ? (
                  <div className="rounded-xl bg-muted/60 p-3">
                    <dt className="text-xs font-bold text-gold">Үр дүн</dt>
                    <dd className="mt-1 text-sm leading-6">{event.result}</dd>
                  </div>
                ) : null}
                {event.significance ? (
                  <div className="rounded-xl bg-muted/60 p-3">
                    <dt className="text-xs font-bold text-gold">Ач холбогдол</dt>
                    <dd className="mt-1 text-sm leading-6">{event.significance}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            {detailed && event.figureSlugs.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {event.figureSlugs.map((slug) => (
                  <Link
                    key={slug}
                    href={`/people/${slug}`}
                    className="rounded-full border border-line px-3 py-1 text-xs font-semibold transition hover:border-gold hover:text-gold"
                  >
                    👤 {slug.replace(/-/g, " ")}
                  </Link>
                ))}
              </div>
            ) : null}
          </article>
        </li>
      ))}
    </ol>
  );
}
