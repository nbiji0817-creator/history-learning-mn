import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/page";
import { Card } from "@/components/ui/primitives";
import { libraryBookMap, libraryBooks } from "@/data/library";

export function generateStaticParams() {
  return libraryBooks.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/library/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const book = libraryBookMap.get(slug);

  if (!book) return { title: "Ном олдсонгүй" };

  return {
    title: book.title,
    description: book.description,
  };
}

export default async function LibraryBookPage({
  params,
}: PageProps<"/library/[slug]">) {
  const { slug } = await params;
  const book = libraryBookMap.get(slug);

  if (!book) notFound();

  /*
   * Агуулгын жагсаалт — ижил гарчигтай дараалсан хэсгүүдийг нэг
   * бүлэг болгон харуулна. Тэмдэглэл нь нэг бүлгийг хэд хэдэн
   * хэсэгт хуваадаг тул давхардсан гарчиг гарахаас сэргийлнэ.
   */
  const sections: { title: string; firstId: string; count: number }[] = [];
  for (const chunk of book.chunks) {
    const last = sections[sections.length - 1];
    if (last && last.title === chunk.section) {
      last.count += 1;
    } else {
      sections.push({ title: chunk.section, firstId: chunk.id, count: 1 });
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={book.kind === "primary" ? "Анхдагч эх сурвалж" : "Сурах бичиг"}
        title={book.title}
        icon={book.icon}
        description={book.description}
      />

      <Container className="space-y-8 py-10">
        <Card>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <span>
              <span className="text-fg-muted">Зохиогч / эх: </span>
              <b>{book.author}</b>
            </span>
            {book.year ? (
              <span>
                <span className="text-fg-muted">Зохиогдсон: </span>
                <b>{book.year}</b>
              </span>
            ) : null}
            <span>
              <span className="text-fg-muted">Хэмжээ: </span>
              <b>{book.pages} хуудас</b>
            </span>
            <span>
              <span className="text-fg-muted">Хэсэг: </span>
              <b>{book.chunks.length}</b>
            </span>
          </div>

          <p className="mt-5 rounded-xl bg-muted/60 p-4 text-sm leading-7 text-fg-muted">
            ⚠️ Доорх бичвэр нь номын <b>эх бичвэр биш</b>, бүх хуудсыг уншиж
            гаргасан <b>судалгааны тэмдэглэл</b> юм. Яг үгчлэн иш татах бол
            эх номоо шалгаарай.
          </p>
        </Card>

        {/* Агуулга */}
        <Card>
          <h2 className="text-sm font-black">Агуулга</h2>
          <ol className="mt-4 space-y-1.5">
            {sections.map((section, index) => (
              <li key={section.firstId} className="text-sm">
                <a
                  href={`#${section.firstId}`}
                  className="flex gap-3 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-gold"
                >
                  <span className="w-7 shrink-0 text-right font-bold text-fg-muted">
                    {index + 1}.
                  </span>
                  <span className="flex-1">{section.title}</span>
                  {section.count > 1 ? (
                    <span className="shrink-0 text-xs text-fg-muted">
                      {section.count} хэсэг
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ol>
        </Card>

        {/* Бичвэр */}
        <div className="space-y-5">
          {book.chunks.map((chunk, index) => {
            const isNewSection =
              index === 0 || book.chunks[index - 1].section !== chunk.section;

            return (
              <Card key={chunk.id} id={chunk.id} className="scroll-mt-24">
                {isNewSection ? (
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="text-base font-black leading-tight">
                      {chunk.section}
                    </h2>
                    {chunk.pages ? (
                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-fg-muted">
                        х. {chunk.pages}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {chunk.sub ? (
                  <h3
                    className={
                      isNewSection
                        ? "mt-3 text-sm font-bold text-gold"
                        : "text-sm font-bold text-gold"
                    }
                  >
                    {chunk.sub}
                  </h3>
                ) : null}

                <div className="mt-3 whitespace-pre-line text-sm leading-7">
                  {chunk.body}
                </div>
              </Card>
            );
          })}
        </div>

        <Card>
          <p className="text-sm leading-7 text-fg-muted">
            Энэ номын талаар нарийн асуулт байвал AI багшаас асуугаарай — тэр
            эдгээр хэсгүүдээс хайж, эх сурвалжаа зааж хариулна.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/ai"
              className="inline-flex items-center rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-[#1c1a17]"
            >
              AI багшаас асуух →
            </Link>
            <Link
              href="/library"
              className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
            >
              Бусад ном
            </Link>
          </div>
        </Card>
      </Container>
    </>
  );
}
