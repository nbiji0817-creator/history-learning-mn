import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/page";
import { QuestionList } from "@/components/admin/question-list";
import { requireRole } from "@/lib/auth-server";
import { getAllQuestionsForAdmin } from "@/lib/repo/admin";

export const metadata: Metadata = {
  title: "Асуултын сан",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  await requireRole(["teacher", "admin"], "/admin/questions");
  const questions = await getAllQuestionsForAdmin();

  return (
    <>
      <PageHeader
        eyebrow="Удирдлага"
        title="Асуултын сан"
        icon="❓"
        description="Тестийн асуулт нэмэх, засах, устгах. Тайлбар бичих нь хамгийн чухал — сурагч буруу хариулсныхаа дараа үүнийг уншина."
        actions={
          <Link
            href="/admin"
            className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            ← Админы хэсэг
          </Link>
        }
      />

      <Container className="py-10">
        <QuestionList questions={questions} />
      </Container>
    </>
  );
}
