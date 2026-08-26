import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "@/components/ui/page";
import { Card, CardLink } from "@/components/ui/primitives";
import { getGames, getSimulations } from "@/lib/repo";
import { liveSimulations } from "@/data/live-sims";
import { difficultyLabels, difficultyStyles } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Түүхийн тоглоом",
  description:
    "Он цагийг зөв байрлуул, Хэн бэ?, Үйл явдлыг тааруул, Хурдан тест — түүхийг тоглож сурах интерактив тоглоомууд.",
};

export default async function GamesPage() {
  const [games, simulations] = await Promise.all([getGames(), getSimulations()]);

  const playable = games.filter((game) => game.playable);
  const soon = games.filter((game) => !game.playable);

  return (
    <>
      <PageHeader
        eyebrow="Тоглоом"
        title="Түүхийн тоглоомын төв"
        icon="🎮"
        description="Тоглож байж сурсан зүйл илүү удаан санагддаг. Тоглоом бүр XP цуглуулж, ахицад тооцогдоно."
      />

      <Section title="">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-2.5 text-sm font-bold transition hover:border-gold/60 hover:bg-muted"
        >
          🏆 Тэргүүлэгчдийн самбар харах →
        </Link>
      </Section>

      <Section title="Тоглох боломжтой">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {playable.map((game) => (
            <CardLink key={game.slug} href={`/games/${game.slug}`}>
              <div className="flex items-start justify-between">
                <span className="text-5xl" aria-hidden>
                  {game.icon}
                </span>
                <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold">
                  +{game.xp} XP
                </span>
              </div>

              <h2 className="mt-5 text-lg font-black group-hover:text-gold">
                {game.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-fg-muted">
                {game.description}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-semibold ${difficultyStyles[game.difficulty]}`}
                >
                  {difficultyLabels[game.difficulty]}
                </span>
                <span className="text-fg-muted">
                  {game.grades[0]}–{game.grades[game.grades.length - 1]}-р анги
                </span>
              </div>
            </CardLink>
          ))}
        </div>
      </Section>

      <Section
        title="Хөдөлгөөнт симуляц"
        description="Газрын зураг, маршрут, улирал — бүгд нүдэн дээр өрнөнө."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {liveSimulations.map((simulation) => (
            <CardLink
              key={simulation.slug}
              href={`/games/live/${simulation.slug}`}
            >
              <div className="text-5xl" aria-hidden>
                {simulation.icon}
              </div>
              <h2 className="mt-5 text-lg font-black group-hover:text-gold">
                {simulation.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-gold">
                {simulation.subtitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-fg-muted">
                {simulation.intro}
              </p>
            </CardLink>
          ))}
        </div>
      </Section>

      <Section
        title="Шийдвэрийн симуляци"
        description="Түүхэн шийдвэр гаргаж, үр дагаврыг нь өөрөө мэдэр."
        className="bg-muted/40"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {simulations.map((simulation) => (
            <CardLink key={simulation.slug} href={`/games/sim/${simulation.slug}`}>
              <div className="text-5xl" aria-hidden>
                {simulation.icon}
              </div>
              <h2 className="mt-5 text-lg font-black group-hover:text-gold">
                {simulation.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-gold">
                {simulation.subtitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-fg-muted">
                {simulation.intro}
              </p>
            </CardLink>
          ))}
        </div>
      </Section>

      {soon.length > 0 ? (
        <Section title="Удахгүй">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {soon.map((game) => (
              <Card key={game.slug} className="opacity-60">
                <div className="text-4xl" aria-hidden>
                  {game.icon}
                </div>
                <h3 className="mt-4 font-bold">{game.title}</h3>
                <p className="mt-2 text-sm leading-6 text-fg-muted">
                  {game.description}
                </p>
                <p className="mt-4 text-xs font-bold text-fg-muted">Удахгүй…</p>
              </Card>
            ))}
          </div>

          <p className="mt-6 text-sm text-fg-muted">
            Ямар тоглоом нэмэхийг хүсэж байна вэ?{" "}
            <Link href="/feedback" className="font-bold text-gold hover:underline">
              Санал хүсэлт илгээх →
            </Link>
          </p>
        </Section>
      ) : null}
    </>
  );
}
