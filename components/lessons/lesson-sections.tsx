import Link from "next/link";
import type { LessonSection } from "@/types";
import { getEventsByIds, getFiguresBySlugs, getSourcesByIds } from "@/lib/repo";
import { sourceKindLabels } from "@/data/sources";
import { InfographicBlock } from "./infographic";
import { MapBlock } from "./map-view";
import { EventTimeline } from "@/components/timeline/event-timeline";

export async function LessonSections({ sections }: { sections: LessonSection[] }) {
  return (
    <div className="space-y-12">
      {sections.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}
    </div>
  );
}

async function SectionBlock({ section }: { section: LessonSection }) {
  return (
    <section id={section.id} className="scroll-mt-24">
      <h2 className="text-xl font-black tracking-tight sm:text-2xl">
        {section.title}
      </h2>

      <div className="mt-5">
        {section.type === "text" ? <TextBlock body={section.body ?? ""} /> : null}

        {section.type === "keypoints" ? (
          <ul className="space-y-3">
            {section.points?.map((point) => (
              <li
                key={point}
                className="flex gap-3 rounded-2xl border border-line bg-muted/40 p-4 text-sm leading-7"
              >
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {section.type === "concepts" ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            {section.concepts?.map((concept) => (
              <div
                key={concept.term}
                className="rounded-2xl border border-line bg-muted/40 p-5"
              >
                <dt className="font-bold text-gold">{concept.term}</dt>
                <dd className="mt-2 text-sm leading-6 text-fg-muted">
                  {concept.definition}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {section.type === "infographic" && section.infographic ? (
          <InfographicBlock data={section.infographic} />
        ) : null}

        {section.type === "map" && section.map ? (
          <MapBlock data={section.map} />
        ) : null}

        {section.type === "timeline" ? (
          <TimelineSection eventIds={section.eventIds ?? []} />
        ) : null}

        {section.type === "figures" ? (
          <FiguresSection slugs={section.figureSlugs ?? []} />
        ) : null}

        {section.type === "sources" ? (
          <SourcesSection ids={section.sourceIds ?? []} intro={section.body} />
        ) : null}

        {section.type === "quote" && section.quote ? (
          <blockquote className="rounded-2xl border-l-4 border-gold bg-muted/40 p-6">
            <p className="text-lg font-medium italic leading-8">
              «{section.quote.text}»
            </p>
            <footer className="mt-3 text-sm text-fg-muted">
              — {section.quote.author}
            </footer>
          </blockquote>
        ) : null}

        {section.type === "video" ? (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center">
            <p className="text-4xl" aria-hidden>
              🎬
            </p>
            <p className="mt-3 text-sm text-fg-muted">
              Видео материал удахгүй нэмэгдэнэ.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function TextBlock({ body }: { body: string }) {
  const paragraphs = body.split("\n\n").filter(Boolean);
  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-base leading-8 text-fg-muted">
          {paragraph.split("\n").map((line, lineIndex) => (
            <span key={lineIndex} className="block">
              {line}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

async function TimelineSection({ eventIds }: { eventIds: string[] }) {
  const events = await getEventsByIds(eventIds);
  return <EventTimeline events={events} />;
}

async function FiguresSection({ slugs }: { slugs: string[] }) {
  const figures = await getFiguresBySlugs(slugs);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {figures.map((figure) => (
        <Link
          key={figure.slug}
          href={`/people/${figure.slug}`}
          className="group rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-1 hover:border-gold/60"
        >
          <div className="text-4xl" aria-hidden>
            {figure.portrait}
          </div>
          <h3 className="mt-3 font-bold group-hover:text-gold">{figure.name}</h3>
          <p className="text-xs text-fg-muted">{figure.title}</p>
          <p className="mt-2 font-mono text-xs text-gold">
            {figure.born} – {figure.died}
          </p>
          <p className="mt-3 text-sm leading-6 text-fg-muted">{figure.summary}</p>
        </Link>
      ))}
    </div>
  );
}

async function SourcesSection({
  ids,
  intro,
}: {
  ids: string[];
  intro?: string;
}) {
  const sources = await getSourcesByIds(ids);
  return (
    <div className="space-y-4">
      {intro ? <p className="text-sm text-fg-muted">{intro}</p> : null}
      {sources.map((source) => (
        <article
          key={source.id}
          className="rounded-2xl border border-line bg-surface p-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl" aria-hidden>
              {sourceKindLabels[source.kind].icon}
            </span>
            <h3 className="font-bold">{source.title}</h3>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-fg-muted">
              {sourceKindLabels[source.kind].label}
            </span>
            <span className="font-mono text-xs text-gold">{source.year}</span>
          </div>

          <p className="mt-4 border-l-4 border-gold/40 pl-4 text-sm italic leading-7 text-fg-muted">
            {source.excerpt}
          </p>

          <details className="mt-4 rounded-xl bg-muted/50 p-4">
            <summary className="cursor-pointer text-sm font-bold text-gold">
              ❓ {source.analysisQuestion}
            </summary>
            <p className="mt-3 text-sm leading-7 text-fg-muted">{source.guidance}</p>
          </details>
        </article>
      ))}
    </div>
  );
}
