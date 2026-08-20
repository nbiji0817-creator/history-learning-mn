import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/page";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { FamilyLinks } from "@/components/dashboard/family-links";
import { getAchievements, getLessons } from "@/lib/repo";
import { requireUser } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Миний ахиц",
  description:
    "Үзсэн хичээл, тестийн оноо, XP, түвшин, сул болон хүчтэй сэдэв, амжилтын тэмдэг.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireUser("/dashboard");

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

      <Container className="space-y-8 py-10">
        <StudentDashboard lessons={lessons} achievements={achievements} />
        <FamilyLinks />
      </Container>
    </>
  );
}
