import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/page";
import { LessonForm } from "@/components/admin/lesson-form";
import { requireRole } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Шинэ хичээл",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewLessonPage() {
  await requireRole(["teacher", "admin"], "/admin/lessons/new");

  return (
    <>
      <PageHeader
        eyebrow="Удирдлага"
        title="Шинэ хичээл нэмэх"
        icon="✍️"
        description="Гарчиг бичихэд хаягийн нэр автоматаар үүснэ. Блокуудыг дурын дарааллаар нэмж болно."
        actions={
          <Link
            href="/admin/lessons"
            className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            ← Жагсаалт
          </Link>
        }
      />

      <Container className="py-10">
        <div className="mx-auto max-w-3xl">
          <LessonForm />
        </div>
      </Container>
    </>
  );
}
