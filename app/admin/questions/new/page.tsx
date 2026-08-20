import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/page";
import { QuestionForm } from "@/components/admin/question-form";
import { requireRole } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Шинэ асуулт",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewQuestionPage() {
  await requireRole(["teacher", "admin"], "/admin/questions/new");

  return (
    <>
      <PageHeader
        eyebrow="Удирдлага"
        title="Шинэ асуулт нэмэх"
        icon="❓"
        description="Хичээлийн slug-ыг шошго болгон бичвэл тэр хичээлийн тестэд автоматаар багтана."
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
        <div className="mx-auto max-w-3xl">
          <QuestionForm />
        </div>
      </Container>
    </>
  );
}
