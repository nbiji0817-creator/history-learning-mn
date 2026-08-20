import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/page";
import { AdminPanel } from "@/components/dashboard/admin-panel";
import { requireRole } from "@/lib/auth-server";
import {
  getAnnouncements,
  getDbStatus,
  getExams,
  getFeedback,
  getGames,
  getLessons,
  getPlatformStats,
  getQuestions,
  getUsers,
} from "@/lib/repo";

export const metadata: Metadata = {
  title: "Багш / Админы хэсэг",
  description:
    "Хичээл, асуултын сан, тоглоом, шалгалт, хэрэглэгч, санал хүсэлтийн удирдлага болон статистик.",
  robots: { index: false, follow: false },
};

/* Эрхийн шалгалт хийгддэг тул кэшлэхгүй */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  /*
   * ЖИНХЭНЭ ХАМГААЛАЛТ. Энэ мөр нь багш/админ биш хүнийг /login руу
   * шилжүүлнэ. Client дээрх ямар ч заль мэх үүнийг тойрч чадахгүй, учир нь
   * шалгалт нь сервер дээр Supabase-ийн баталгаажуулсан session дээр хийгдэнэ.
   */
  const current = await requireRole(["teacher", "admin"], "/admin");

  const [stats, lessons, questions, games, exams, feedback, users, announcements, dbStatus] =
    await Promise.all([
      getPlatformStats(),
      getLessons(),
      getQuestions(),
      getGames(),
      getExams(),
      getFeedback(),
      getUsers(),
      getAnnouncements(),
      getDbStatus(),
    ]);

  return (
    <>
      <PageHeader
        eyebrow="Удирдлага"
        title="Багш / Админы хэсэг"
        icon="🛡️"
        description="Системийн агуулга, хэрэглэгч, статистик, санал хүсэлтийг нэг дороос харна."
      />

      <Container className="py-10">
        <AdminPanel
          stats={stats}
          lessons={lessons}
          questions={questions}
          games={games}
          exams={exams}
          feedback={feedback}
          users={users}
          announcements={announcements}
          dbStatus={dbStatus}
          currentUser={{
            name: current.profile.name,
            role: current.profile.role,
            email: current.email,
          }}
        />
      </Container>
    </>
  );
}
