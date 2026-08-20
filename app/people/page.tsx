import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui/page";
import { FigureExplorer } from "@/components/people/figure-explorer";
import { getFigures } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Түүхэн хүмүүс",
  description:
    "Модун шаньюй, Чингис хаан, Мандухай хатан, Богд хаан, Д.Сүхбаатар зэрэг Монгол болон дэлхийн түүхэн хүмүүсийн намтар, гавьяа.",
};

export default async function PeoplePage() {
  const figures = await getFigures();

  return (
    <>
      <PageHeader
        eyebrow="Түүхэн хүмүүс"
        title="Түүхийг бүтээсэн хүмүүс"
        icon="👑"
        description="Хүн бүрийн намтар, гол гавьяа, холбогдох үйл явдал, бусад хүмүүстэй холбоог нэг дор."
      />

      <Section>
        <FigureExplorer figures={figures} />
      </Section>
    </>
  );
}
