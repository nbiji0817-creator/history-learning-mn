import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/page";
import { GameBoard } from "@/components/games/game-board";
import { getEvents, getFigures, getGame, getQuestions } from "@/lib/repo";
import { games } from "@/data/games";
import { difficultyLabels } from "@/lib/utils";

export function generateStaticParams() {
  return games.filter((game) => game.playable).map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/games/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGame(slug);
  if (!game) return { title: "Тоглоом олдсонгүй" };

  return { title: game.title, description: game.description };
}

export default async function GamePage({ params }: PageProps<"/games/[slug]">) {
  const { slug } = await params;
  const game = await getGame(slug);
  if (!game) notFound();

  const [events, figures, questions] = await Promise.all([
    getEvents(),
    getFigures(),
    getQuestions(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={`Тоглоом • ${difficultyLabels[game.difficulty]} • +${game.xp} XP`}
        title={game.title}
        icon={game.icon}
        description={game.description}
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
          {game.playable ? (
            <GameBoard game={game} data={{ events, figures, questions }} />
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-12 text-center">
              <p className="text-5xl" aria-hidden>
                {game.icon}
              </p>
              <h2 className="mt-4 text-lg font-bold">Энэ тоглоом удахгүй нээгдэнэ</h2>
              <p className="mt-2 text-sm text-fg-muted">
                Одоогоор бэлтгэл шатандаа явж байна.
              </p>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
