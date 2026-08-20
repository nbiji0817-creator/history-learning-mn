import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/page";
import { Card } from "@/components/ui/primitives";
import { EventTimeline } from "@/components/timeline/event-timeline";
import { getEventsByIds, getFigure, getFiguresBySlugs } from "@/lib/repo";
import { historicalFigures } from "@/data/figures";
import { eras, eraStyles } from "@/data/eras";

export function generateStaticParams() {
  return historicalFigures.map((figure) => ({ slug: figure.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/people/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const figure = await getFigure(slug);
  if (!figure) return { title: "Түүхэн хүн олдсонгүй" };

  return {
    title: figure.name,
    description: `${figure.title} (${figure.born} – ${figure.died}). ${figure.summary}`,
  };
}

export default async function FigurePage({ params }: PageProps<"/people/[slug]">) {
  const { slug } = await params;
  const figure = await getFigure(slug);
  if (!figure) notFound();

  const [events, related] = await Promise.all([
    getEventsByIds(figure.relatedEventIds),
    getFiguresBySlugs(figure.relatedFigureSlugs),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={figure.title}
        title={figure.name}
        icon={figure.portrait}
        description={figure.summary}
        actions={
          <Link
            href="/people"
            className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            ← Бүх түүхэн хүн
          </Link>
        }
      />

      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_290px]">
          <div className="min-w-0 space-y-10">
            <section>
              <h2 className="text-xl font-black">Гол гавьяа</h2>
              <ul className="mt-5 space-y-3">
                {figure.achievements.map((achievement) => (
                  <li
                    key={achievement}
                    className="flex gap-3 rounded-xl border border-line bg-surface p-4 text-sm leading-7"
                  >
                    <span className="text-gold">★</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </section>

            {events.length > 0 ? (
              <section>
                <h2 className="text-xl font-black">Холбогдох үйл явдал</h2>
                <div className="mt-5">
                  <EventTimeline events={events} />
                </div>
              </section>
            ) : null}

            {related.length > 0 ? (
              <section>
                <h2 className="text-xl font-black">Холбогдох хүмүүс</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {related.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/people/${item.slug}`}
                      className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-gold/60"
                    >
                      <span className="text-3xl" aria-hidden>
                        {item.portrait}
                      </span>
                      <span>
                        <span className="block font-bold group-hover:text-gold">
                          {item.name}
                        </span>
                        <span className="block text-xs text-fg-muted">
                          {item.title}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <h3 className="text-sm font-black">Товч мэдээлэл</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-fg-muted">Төрсөн</dt>
                  <dd className="text-right font-semibold">{figure.born}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-fg-muted">Нас барсан</dt>
                  <dd className="text-right font-semibold">{figure.died}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-fg-muted">Эрин үе</dt>
                  <dd
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${eraStyles[figure.era].chip}`}
                  >
                    {eras.find((item) => item.key === figure.era)?.label}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-fg-muted">Бүс нутаг</dt>
                  <dd className="font-semibold">
                    {figure.region === "mn" ? "🇲🇳 Монгол" : "🌍 Дэлхий"}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {figure.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-fg-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="bg-gold/10">
              <h3 className="text-sm font-black">🤖 AI-аас асуу</h3>
              <Link
                href={`/ai?q=${encodeURIComponent(`${figure.name}-ы тухай дэлгэрэнгүй ярьж өгөөч`)}`}
                className="mt-3 block rounded-xl bg-surface/70 px-3 py-2.5 text-sm transition hover:text-gold"
              >
                {figure.name}-ы тухай дэлгэрэнгүй ярьж өгөөч
              </Link>
              <Link
                href={`/ai?q=${encodeURIComponent(`${figure.name}-ы дүрд тоглоод надтай ярилцаач`)}`}
                className="mt-2 block rounded-xl bg-surface/70 px-3 py-2.5 text-sm transition hover:text-gold"
              >
                {figure.name}-тай ярилцах (roleplay)
              </Link>
            </Card>

            <Card>
              <h3 className="text-sm font-black">🎮 Дадлага</h3>
              <Link
                href="/games/who-is-it"
                className="mt-3 block rounded-xl bg-muted px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-line"
              >
                «Хэн бэ?» тоглох
              </Link>
            </Card>
          </aside>
        </div>
      </Container>
    </>
  );
}
