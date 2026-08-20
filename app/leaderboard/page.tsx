import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "@/components/ui/page";
import { Card } from "@/components/ui/primitives";
import { getGames } from "@/lib/repo";
import { getLeaderboard } from "@/lib/repo/leaderboard";

export const metadata: Metadata = {
  title: "Тэргүүлэгчид",
  description:
    "Түүхийн тоглоомуудын хамгийн өндөр оноо. Тоглож XP цуглуулаад жагсаалтад ор.",
};

/* Оноо байнга өөрчлөгддөг тул кэшлэхгүй */
export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const [rows, games] = await Promise.all([getLeaderboard(), getGames()]);

  const gameTitle = new Map(games.map((game) => [game.slug, game.title]));

  /* Тоглоом тус бүрээр бүлэглэж, өндөр оноогоор эрэмбэлнэ */
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = grouped.get(row.gameSlug) ?? [];
    list.push(row);
    grouped.set(row.gameSlug, list);
  }

  const sections = [...grouped.entries()]
    .map(([slug, list]) => ({
      slug,
      title: gameTitle.get(slug) ?? slug,
      rows: [...list].sort((a, b) => b.bestScore - a.bestScore).slice(0, 10),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "mn"));

  return (
    <>
      <PageHeader
        eyebrow="Тэмцээн"
        title="Тэргүүлэгчид"
        icon="🏆"
        description="Тоглоом бүрийн хамгийн өндөр оноо. Нэвтэрч тоглосон сурагчид энд харагдана."
      />

      {sections.length === 0 ? (
        <Section title="Одоогоор хоосон">
          <Card>
            <p className="text-sm leading-7 text-fg-muted">
              Хараахан хэн ч оноо бүртгүүлээгүй байна. Эхний хүн нь болоорой!
            </p>
            <p className="mt-4 text-sm leading-7 text-fg-muted">
              Оноо бүртгэгдэхийн тулд <b>нэвтэрсэн</b> байх шаардлагатай.
              Нэвтрээгүй үед ахиц зөвхөн таны браузерт хадгалагдана.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/games"
                className="inline-flex items-center rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-[#1c1a17]"
              >
                🎮 Тоглоом руу
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
              >
                Нэвтрэх
              </Link>
            </div>
          </Card>
        </Section>
      ) : (
        <Section title="Тоглоомоор">
          <div className="grid gap-5 md:grid-cols-2">
            {sections.map((section) => (
              <Card key={section.slug}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black">{section.title}</h3>
                  <Link
                    href={`/games/${section.slug}`}
                    className="text-xs font-bold text-gold hover:underline"
                  >
                    Тоглох →
                  </Link>
                </div>

                <ol className="mt-4 divide-y divide-line">
                  {section.rows.map((row, index) => (
                    <li
                      key={`${row.name}-${index}`}
                      className="flex items-center gap-3 py-2.5 text-sm"
                    >
                      <span className="w-7 shrink-0 text-center font-black text-fg-muted">
                        {MEDALS[index] ?? index + 1}
                      </span>
                      <span className="text-lg" aria-hidden>
                        {row.avatar}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-semibold">
                        {row.name}
                      </span>
                      <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-black text-gold">
                        {row.bestScore}
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
