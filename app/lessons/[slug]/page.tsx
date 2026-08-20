import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/page";
import { Card } from "@/components/ui/primitives";
import { LessonSections } from "@/components/lessons/lesson-sections";
import { LessonActions } from "@/components/lessons/lesson-actions";
import { getGrade, getLessonBySlug, getLessonNeighbours } from "@/lib/repo";
import { lessons } from "@/data/lessons";
import { difficultyLabels, difficultyStyles } from "@/lib/utils";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/lessons/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson) return { title: "Хичээл олдсонгүй" };

  return {
    title: `${lesson.title} — ${lesson.grade}-р анги`,
    description: lesson.summary,
    openGraph: {
      title: lesson.title,
      description: lesson.summary,
    },
  };
}

export default async function LessonPage({ params }: PageProps<"/lessons/[slug]">) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson || !lesson.published) notFound();

  const [grade, neighbours] = await Promise.all([
    getGrade(lesson.grade),
    getLessonNeighbours(lesson),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={`${lesson.grade}-Р АНГИ • ${lesson.order}-Р ХИЧЭЭЛ`}
        title={lesson.title}
        icon={lesson.icon}
        description={lesson.subtitle}
        actions={
          <Link
            href={`/grades/${lesson.grade}`}
            className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            ← {grade?.title ?? "Ангид буцах"}
          </Link>
        }
      />

      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_290px]">
          <article className="min-w-0">
            {/* Суралцах зорилго */}
            <Card className="bg-gold/10">
              <h2 className="text-sm font-black uppercase tracking-wider text-gold">
                🎯 Суралцах зорилго
              </h2>
              <ul className="mt-4 space-y-2.5">
                {lesson.objectives.map((objective) => (
                  <li key={objective} className="flex gap-3 text-sm leading-7">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {objective}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="mt-10">
              <LessonSections sections={lesson.sections} />
            </div>

            {/* Дүгнэлт */}
            <Card className="mt-12 border-l-4 border-l-gold">
              <h2 className="text-lg font-black">📌 Дүгнэлт</h2>
              <p className="mt-3 leading-8 text-fg-muted">{lesson.conclusion}</p>
            </Card>

            {/* Өөрийгөө шалгах */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {lesson.quizId ? (
                <Link
                  href={`/lessons/${lesson.slug}/quiz`}
                  className="group rounded-2xl border border-line bg-surface p-6 transition hover:-translate-y-1 hover:border-gold/60"
                >
                  <div className="text-3xl" aria-hidden>
                    📝
                  </div>
                  <h3 className="mt-3 font-bold group-hover:text-gold">
                    Өөрийгөө шалгах
                  </h3>
                  <p className="mt-1 text-sm text-fg-muted">
                    Хичээлийн тестийг өгч мэдлэгээ бататга.
                  </p>
                </Link>
              ) : null}

              {lesson.gameSlug ? (
                <Link
                  href={`/games/${lesson.gameSlug}`}
                  className="group rounded-2xl border border-line bg-surface p-6 transition hover:-translate-y-1 hover:border-gold/60"
                >
                  <div className="text-3xl" aria-hidden>
                    🎮
                  </div>
                  <h3 className="mt-3 font-bold group-hover:text-gold">
                    Холбогдох тоглоом
                  </h3>
                  <p className="mt-1 text-sm text-fg-muted">
                    Тоглож байж сурах нь илүү удаан санагддаг.
                  </p>
                </Link>
              ) : null}
            </div>

            <div className="mt-8">
              <LessonActions lessonId={lesson.id} />
            </div>

            {/* Өмнөх / Дараах */}
            <nav className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Хичээлийн навигаци">
              {neighbours.previous ? (
                <Link
                  href={`/lessons/${neighbours.previous.slug}`}
                  className="rounded-2xl border border-line p-5 transition hover:border-gold/60"
                >
                  <span className="text-xs font-bold text-fg-muted">← Өмнөх</span>
                  <p className="mt-1 font-bold">{neighbours.previous.title}</p>
                </Link>
              ) : (
                <span />
              )}

              {neighbours.next ? (
                <Link
                  href={`/lessons/${neighbours.next.slug}`}
                  className="rounded-2xl border border-line p-5 text-right transition hover:border-gold/60"
                >
                  <span className="text-xs font-bold text-fg-muted">Дараах →</span>
                  <p className="mt-1 font-bold">{neighbours.next.title}</p>
                </Link>
              ) : null}
            </nav>
          </article>

          {/* Хажуугийн самбар */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <h3 className="text-sm font-black">Хичээлийн мэдээлэл</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Хугацаа</dt>
                  <dd className="font-semibold">{lesson.durationMinutes} мин</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-fg-muted">Түвшин</dt>
                  <dd
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyStyles[lesson.difficulty]}`}
                  >
                    {difficultyLabels[lesson.difficulty]}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Хэсэг</dt>
                  <dd className="font-semibold">{lesson.sections.length}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {lesson.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-fg-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Card>

            {/* Агуулга */}
            <Card>
              <h3 className="text-sm font-black">Агуулга</h3>
              <ol className="mt-4 space-y-2 text-sm">
                {lesson.sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-fg-muted transition hover:text-gold"
                    >
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </Card>

            {/* AI */}
            <Card className="bg-gold/10">
              <h3 className="text-sm font-black">🤖 AI багшаас асуух</h3>
              <ul className="mt-4 space-y-2">
                {lesson.aiPrompts.map((prompt) => (
                  <li key={prompt}>
                    <Link
                      href={`/ai?q=${encodeURIComponent(prompt)}`}
                      className="block rounded-xl bg-surface/70 px-3 py-2.5 text-sm leading-6 transition hover:text-gold"
                    >
                      {prompt}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            {lesson.externalLinks?.length ? (
              <Card>
                <h3 className="text-sm font-black">🔗 Нэмэлт эх сурвалж</h3>
                <ul className="mt-4 space-y-2">
                  {lesson.externalLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gold hover:underline"
                      >
                        {link.label} ↗
                      </a>
                      <p className="text-xs text-fg-muted">{link.provider}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[11px] leading-5 text-fg-muted">
                  Гуравдагч талын материалыг эх сурвалж дээр нь очиж үзнэ.
                </p>
              </Card>
            ) : null}
          </aside>
        </div>
      </Container>
    </>
  );
}
