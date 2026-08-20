import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/page";
import { QuestionForm } from "@/components/admin/question-form";
import { requireRole } from "@/lib/auth-server";
import { getQuestionByIdForAdmin } from "@/lib/repo/admin";

export const metadata: Metadata = {
  title: "Асуулт засах",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditQuestionPage({
  params,
}: PageProps<"/admin/questions/[id]/edit">) {
  await requireRole(["teacher", "admin"], "/admin/questions");

  const { id } = await params;
  const question = await getQuestionByIdForAdmin(decodeURIComponent(id));
  if (!question) notFound();

  const unsupported = !["multiple_choice", "true_false"].includes(question.type);

  return (
    <>
      <PageHeader
        eyebrow="Удирдлага • Асуулт засах"
        title={question.topic}
        icon="❓"
        description={question.prompt}
        actions={
          <Link
            href="/admin/questions"
            className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            ← Жагсаалт
          </Link>
        }
      />

      <Container className="py-10">
        <div className="mx-auto max-w-3xl space-y-5">
          {unsupported ? (
            <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5">
              <p className="text-sm font-bold text-gold">Анхаар</p>
              <p className="mt-2 text-sm leading-7 text-fg-muted">
                Энэ асуулт нь <b>{question.type}</b> төрөлтэй. Форм одоогоор
                зөвхөн «олон сонголт» болон «үнэн/худал» төрлийг дэмждэг тул
                хадгалахад төрөл нь солигдоно.
              </p>
            </div>
          ) : null}

          <QuestionForm question={question} />
        </div>
      </Container>
    </>
  );
}
