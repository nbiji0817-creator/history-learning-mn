import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui/page";
import { TimelineExplorer } from "@/components/timeline/timeline-explorer";
import { getEvents } from "@/lib/repo";
import { eras } from "@/data/eras";

export const metadata: Metadata = {
  title: "Түүхийн он цагийн хэлхээс",
  description:
    "МЭӨ 10000 оноос өнөөг хүртэлх Монгол болон дэлхийн түүхийн гол үйл явдлыг нэг тэнхлэг дээр — эрин үе, бүс нутгаар шүүж үзнэ.",
};

export default async function TimelinePage() {
  const events = await getEvents();

  return (
    <>
      <PageHeader
        eyebrow="Он цаг"
        title="Түүхийн он цагийн хэлхээс"
        icon="⏳"
        description="Эрт үеэс өнөөг хүртэлх үйл явдлыг дарааллаар нь хараарай. Эрин үе, бүс нутгаар шүүж, хайлт хийж болно."
      />

      <Section>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {eras.map((era) => (
            <div key={era.key} className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-bold">{era.label}</h2>
              <p className="mt-1 font-mono text-xs text-gold">{era.range}</p>
              <p className="mt-2 text-xs text-fg-muted">
                {events.filter((event) => event.era === era.key).length} үйл явдал
              </p>
            </div>
          ))}
        </div>

        <TimelineExplorer events={events} />
      </Section>
    </>
  );
}
