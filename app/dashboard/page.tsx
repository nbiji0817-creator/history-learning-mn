import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/page";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { getAchievements, getLessons } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Миний ахиц",
  description:
    "Үзсэн хичээл, тестийн оноо, XP, түвшин, сул болон хүчтэй сэдэв, амжилтын тэмдэг.",
};

export default async function DashboardPage() {
  const [lessons, achievements] = await Promise.all([
    getLessons(),
    getAchievements(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Сурагчийн хэсэг"
        title="Миний ахиц"
        icon="📊"
        description="Сурсан зүйлээ хэмжиж байж сайжруулна. Сул сэдвээ таньж, зорилготой давтлага хий."
      />

      <Container className="py-10">
        <StudentDashboard lessons={lessons} achievements={achievements} />
      </Container>
    </>
  );
}
