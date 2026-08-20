import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui/page";
import { TimelineExplorer } from "@/components/timeline/timeline-explorer";
import { getEvents } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Түүхэн үйл явдал",
  description:
    "Түүхэн үйл явдал бүрийг шалтгаан, явц, үр дүн, ач холбогдлоор нь задлан судал.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <PageHeader
        eyebrow="Үйл явдал"
        title="Түүхэн үйл явдлын сан"
        icon="📌"
        description="Үйл явдал бүрийг шалтгаан → явц → үр дүн → ач холбогдол гэсэн бүтцээр задалсан. Энэ бүтэц шалгалтын шинжилгээний даалгаварт шууд хэрэглэгдэнэ."
      />

      <Section>
        <TimelineExplorer events={events} detailed />
      </Section>
    </>
  );
}
