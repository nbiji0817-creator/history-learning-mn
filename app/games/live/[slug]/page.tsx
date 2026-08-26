import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/page";
import { EmpireExpansionSim } from "@/components/games/sim-empire-expansion";
import { SilkRoadSim } from "@/components/games/sim-silk-road";
import { NomadYearSim } from "@/components/games/sim-nomad-year";
import { liveSimulationMap, liveSimulations } from "@/data/live-sims";

export function generateStaticParams() {
  return liveSimulations.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/games/live/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const simulation = liveSimulationMap.get(slug);

  if (!simulation) return { title: "Симуляц олдсонгүй" };

  return { title: simulation.title, description: simulation.intro };
}

export default async function LiveSimulationPage({
  params,
}: PageProps<"/games/live/[slug]">) {
  const { slug } = await params;
  const simulation = liveSimulationMap.get(slug);

  if (!simulation) notFound();

  return (
    <>
      <PageHeader
        eyebrow={simulation.subtitle}
        title={simulation.title}
        icon={simulation.icon}
        description={simulation.intro}
        actions={
          <Link
            href="/games"
            className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            ← Бүх тоглоом
          </Link>
        }
      />

      <Container className="py-10">
        <div className="mx-auto max-w-3xl">
          {/* Төрөл бүр өөрийн бүрэлдэхүүнтэй — бүтэц нь огт өөр */}
          {simulation.kind === "map_timeline" ? <EmpireExpansionSim /> : null}
          {simulation.kind === "journey" ? (
            <SilkRoadSim gameSlug={simulation.slug} />
          ) : null}
          {simulation.kind === "seasons" ? (
            <NomadYearSim gameSlug={simulation.slug} />
          ) : null}
        </div>
      </Container>
    </>
  );
}
