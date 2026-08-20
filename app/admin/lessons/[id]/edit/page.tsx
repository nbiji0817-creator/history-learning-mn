import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/page";
import { LessonForm } from "@/components/admin/lesson-form";
import { requireRole } from "@/lib/auth-server";
import { getLessonByIdForAdmin } from "@/lib/repo/admin";

export const metadata: Metadata = {
  title: "Хичээл засах",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditLessonPage({
  params,
}: PageProps<"/admin/lessons/[id]/edit">) {
  await requireRole(["teacher", "admin"], "/admin/lessons");

  const { id } = await params;
  const lesson = await getLessonByIdForAdmin(id);
  if (!lesson) notFound();

  const droppedSections = lesson.sections.filter(
    (section) => !["text", "keypoints", "concepts"].includes(section.type),
  );

  return (
    <>
      <PageHeader
        eyebrow={`${lesson.grade}-Р АНГИ • ЗАСВАР`}
        title={lesson.title}
        icon={lesson.icon}
        description={lesson.subtitle}
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
        <div className="mx-auto max-w-3xl space-y-5">
          {droppedSections.length > 0 ? (
            <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5">
              <p className="text-sm font-bold text-gold">Анхаар</p>
              <p className="mt-2 text-sm leading-7 text-fg-muted">
                Энэ хичээлд формоор засах боломжгүй{" "}
                <b>{droppedSections.length} блок</b> байна (
                {droppedSections.map((section) => section.type).join(", ")}).
                Хадгалахад <b>эдгээр устана</b>. Хэрэв хадгалахыг хүсэхгүй бол
                энэ хичээлийг кодын файлаас засаарай.
              </p>
            </div>
          ) : null}

          <LessonForm lesson={lesson} />
        </div>
      </Container>
    </>
  );
}
