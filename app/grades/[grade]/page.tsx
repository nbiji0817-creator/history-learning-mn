import type { Metadata } from "next";
import type { Lesson } from "@/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Section } from "@/components/ui/page";
import { ButtonLink, Card, CardLink } from "@/components/ui/primitives";
import { GradeCompletion, LessonProgressBadge } from "@/components/lessons/lesson-actions";
import { getGrade, getLessonsByGrade } from "@/lib/repo";
import { grades } from "@/data/grades";
import { parseGrade } from "@/data/grades";
import { difficultyLabels, difficultyStyles } from "@/lib/utils";

export function generateStaticParams() {
  return grades.map((grade) => ({ grade: String(grade.grade) }));
}

function LessonGrid({
  lessons,
  showOrder = true,
}: {
  lessons: Lesson[];
  showOrder?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {lessons.map((lesson) => (
        <CardLink key={lesson.id} href={`/lessons/${lesson.slug}`}>
          <div className="flex items-start justify-between gap-3">
            <span className="text-4xl" aria-hidden>
              {lesson.icon}
            </span>
            <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold">
              {showOrder ? `${lesson.order}-р хичээл` : "Нэмэлт"}
            </span>
          </div>

          <h3 className="mt-5 text-lg font-bold leading-tight group-hover:text-gold">
            {lesson.title}
          </h3>

          <p className="mt-1 text-sm font-medium text-fg-muted">
            {lesson.subtitle}
          </p>

          <p className="mt-3 text-sm leading-6 text-fg-muted">{lesson.summary}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-xs">
            <span
              className={`rounded-full px-2.5 py-0.5 font-semibold ${difficultyStyles[lesson.difficulty]}`}
            >
              {difficultyLabels[lesson.difficulty]}
            </span>
            <span className="text-fg-muted">⏱ {lesson.durationMinutes} мин</span>
            <LessonProgressBadge lessonId={lesson.id} />
          </div>
        </CardLink>
      ))}
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/grades/[grade]">): Promise<Metadata> {
  const { grade: raw } = await params;
  const gradeNumber = parseGrade(raw);
  if (!gradeNumber) return { title: "Анги олдсонгүй" };

  const grade = await getGrade(gradeNumber);
  if (!grade) return { title: "Анги олдсонгүй" };

  return {
    title: `${grade.grade}-р анги — ${grade.title}`,
    description: grade.description,
  };
}

export default async function GradePage({ params }: PageProps<"/grades/[grade]">) {
  const { grade: raw } = await params;
  const gradeNumber = parseGrade(raw);
  if (!gradeNumber) notFound();

  const grade = await getGrade(gradeNumber);
  if (!grade) notFound();

  const lessons = await getLessonsByGrade(gradeNumber);

  /* Сурах бичгийн үндсэн хичээл ба гүнзгийрүүлсэн нэмэлт хичээлийг ялгана. */
  const textbook = lessons.filter((lesson) => !lesson.tags.includes("нэмэлт"));
  const extra = lessons.filter((lesson) => lesson.tags.includes("нэмэлт"));

  return (
    <>
      <PageHeader
        eyebrow={`${grade.grade}-Р АНГИ`}
        title={grade.title}
        icon={grade.icon}
        description={grade.description}
        actions={
          <>
            <ButtonLink href="/grades" variant="secondary">
              ← Бүх анги
            </ButtonLink>
            {grade.focus ? (
              <ButtonLink href="/exams">📝 Шалгалтын бэлтгэл</ButtonLink>
            ) : null}
          </>
        }
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-12">
            <div>
              <h2 className="mb-1 text-xl font-black">
                Хичээлүүд ({textbook.length})
              </h2>
              <p className="mb-5 text-sm text-fg-muted">
                Ерөнхий боловсролын сурах бичгийн бүлгийн дагуу.
              </p>

              <LessonGrid lessons={textbook} />
            </div>

            {extra.length > 0 ? (
              <div>
                <h2 className="mb-1 text-xl font-black">
                  Гүнзгийрүүлсэн нэмэлт хичээл ({extra.length})
                </h2>
                <p className="mb-5 text-sm text-fg-muted">
                  Инфографик, газрын зураг, он цагийн хэлхээс, эх сурвалж бүхий
                  сэдэвчилсэн хичээлүүд. Заавал биш ч гүнзгий ойлгоход тустай.
                </p>

                <LessonGrid lessons={extra} showOrder={false} />
              </div>
            ) : null}
          </div>

          <aside className="space-y-5">
            <GradeCompletion lessonIds={lessons.map((lesson) => lesson.id)} />

            <Card>
              <h3 className="text-sm font-black">Энэ ангид</h3>
              <ul className="mt-4 space-y-3 text-sm text-fg-muted">
                <li>📚 {lessons.length} хичээл</li>
                <li>📝 Хичээл бүрд тест</li>
                <li>🎮 Холбогдох тоглоом</li>
                <li>🤖 AI багшийн дэмжлэг</li>
              </ul>
              <div className="mt-5 grid gap-2">
                <Link
                  href="/exams"
                  className="rounded-xl bg-muted px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-line"
                >
                  Шалгалтын бэлтгэл
                </Link>
                <Link
                  href="/games"
                  className="rounded-xl bg-muted px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-line"
                >
                  Тоглоом тоглох
                </Link>
              </div>
            </Card>

            <Card className="bg-gold/10">
              <h3 className="text-sm font-black">💡 Зөвлөгөө</h3>
              <p className="mt-3 text-sm leading-7 text-fg-muted">
                Хичээлийг дарааллаар нь үзээрэй. Түүхэн үйл явдал хоорондоо
                учир шалтгааны холбоотой тул дараалал нь ойлголтод чухал.
              </p>
            </Card>
          </aside>
        </div>
      </Section>
    </>
  );
}
