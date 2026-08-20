import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/page";
import { SimulationRunner } from "@/components/games/simulation-runner";
import { getSimulation } from "@/lib/repo";
import { simulations } from "@/data/simulations";

export function generateStaticParams() {
  return simulations.map((simulation) => ({ slug: simulation.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/games/sim/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const simulation = await getSimulation(slug);
  if (!simulation) return { title: "Симуляц олдсонгүй" };

  return { title: simulation.title, description: simulation.intro };
}

export default async function SimulationPage({
  params,
}: PageProps<"/games/sim/[slug]">) {
  const { slug } = await params;
  const simulation = await getSimulation(slug);
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
            ← Тоглоомын төв
          </Link>
        }
      />

      <Container className="py-10">
        <div className="mx-auto max-w-3xl">
          <SimulationRunner simulation={simulation} />
        </div>
      </Container>
    </>
  );
}
