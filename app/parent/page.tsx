import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/page";
import { ParentView } from "@/components/dashboard/parent-view";
import { getAnnouncements, getLessons } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Эцэг эхийн хэсэг",
  description:
    "Хүүхдийн үзсэн хичээл, тестийн оноо, ахиц, тоглосон тоглоом болон системийн мэдээг харах.",
};

export default async function ParentPage() {
  const [lessons, announcements] = await Promise.all([
    getLessons(),
    getAnnouncements(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Эцэг эх"
        title="Хүүхдийн сургалтын мэдээлэл"
        icon="👪"
        description="Хүүхдийнхээ ахицыг ажиглаж, дэмжлэг үзүүлээрэй. Энэ хэсэгт зөвхөн харах эрхтэй бөгөөд санал хүсэлт бичих боломжтой."
      />

      <Container className="py-10">
        <ParentView lessons={lessons} announcements={announcements} />
      </Container>
    </>
  );
}
