import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/page";
import { LessonList } from "@/components/admin/lesson-list";
import { requireRole } from "@/lib/auth-server";
import { getAllLessonsForAdmin } from "@/lib/repo/admin";

export const metadata: Metadata = {
  title: "Хичээлийн удирдлага",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLessonsPage() {
  await requireRole(["teacher", "admin"], "/admin/lessons");
  const lessons = await getAllLessonsForAdmin();

  return (
    <>
      <PageHeader
        eyebrow="Удирдлага"
        title="Хичээлийн удирдлага"
        icon="📚"
        description="Хичээл нэмэх, засах, нийтлэх, устгах."
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
        <LessonList lessons={lessons} />
      </Container>
    </>
  );
}
