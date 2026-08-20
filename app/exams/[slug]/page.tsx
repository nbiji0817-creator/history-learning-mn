import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/page";
import { ExamRunner } from "@/components/quiz/exam-runner";
import { getExam, getExamQuestions } from "@/lib/repo";
import { exams, examKindLabels } from "@/data/exams";

export function generateStaticParams() {
  return exams.map((exam) => ({ slug: exam.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/exams/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const exam = await getExam(slug);
  if (!exam) return { title: "Шалгалт олдсонгүй" };

  return { title: exam.title, description: exam.description };
}

export default async function ExamPage({ params }: PageProps<"/exams/[slug]">) {
  const { slug } = await params;
  const exam = await getExam(slug);
  if (!exam) notFound();

  const pool = await getExamQuestions(exam);

  return (
    <>
      <PageHeader
        eyebrow={examKindLabels[exam.kind] ?? "Шалгалт"}
        title={exam.title}
        icon={exam.icon}
        description={exam.subtitle}
        actions={
          <Link
            href="/exams"
            className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            ← Бүх шалгалт
          </Link>
        }
      />

      <Container className="py-10">
        <div className="mx-auto max-w-3xl">
          <ExamRunner exam={exam} pool={pool} />
        </div>
      </Container>
    </>
  );
}
