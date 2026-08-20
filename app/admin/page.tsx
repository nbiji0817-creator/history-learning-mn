import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/page";
import { AdminPanel } from "@/components/dashboard/admin-panel";
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

export default async function AdminPage() {
  const [
    stats,
    lessons,
    questions,
    games,
    exams,
    feedback,
    users,
    announcements,
    dbStatus,
  ] = await Promise.all([
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
        />
      </Container>
    </>
  );
}
