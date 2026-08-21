import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "@/components/ui/page";
import { Card } from "@/components/ui/primitives";
import { libraryBooks, libraryChunkCount } from "@/data/library";

export const metadata: Metadata = {
  title: "Номын сан",
  description:
    "Түүхийн сурах бичиг, Монголын нууц товчоо, Рашид ад-Дины Судрын чуулган, ШУА-ийн «Монгол улсын түүх» таван боть. AI багш эдгээрээс хариулна.",
};

export default function LibraryPage() {
  const textbooks = libraryBooks.filter((book) => book.kind === "textbook");
  const primary = libraryBooks.filter((book) => book.kind === "primary");
  const academic = libraryBooks.filter((book) => book.kind === "academic");

  const totalPages = libraryBooks.reduce((sum, book) => sum + book.pages, 0);

  return (
    <>
      <PageHeader
        eyebrow="Эх сурвалж"
        title="Номын сан"
        icon="📚"
        description="Сурах бичиг, анхдагч эх сурвалж, эрдэм шинжилгээний бүтээлийн агуулга. AI багш асуултад эндээс хайж, номын бүлгийг нь заана."
      />

      <Section title="">
        <Card>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-2xl font-black text-gold">
                {libraryBooks.length}
              </p>
              <p className="text-sm text-fg-muted">ном</p>
            </div>
            <div>
              <p className="text-2xl font-black text-gold">{totalPages}</p>
              <p className="text-sm text-fg-muted">хуудас уншсан</p>
            </div>
            <div>
              <p className="text-2xl font-black text-gold">
                {libraryChunkCount}
              </p>
              <p className="text-sm text-fg-muted">хайлтын хэсэг</p>
            </div>
          </div>

          <p className="mt-6 rounded-xl bg-muted/60 p-4 text-sm leading-7 text-fg-muted">
            ⚠️ <b>Энэ бол номын эх бичвэр биш.</b> Ном бүрийн бүх хуудсыг
            уншиж гаргасан <b>судалгааны тэмдэглэл</b> — агуулга, он цаг,
            хүмүүс, бүлгийн бүтцийг товчилсон хураангуй. Ишлэл татах,
            яг үгчлэн иш татахад эх номоо шалгаарай.
          </p>
        </Card>
      </Section>

      <Section
        title="Анхдагч эх сурвалж"
        description="Түүхэн үйл явдалтай ойр үед бичигдсэн, судлаачдын гол тулгуур"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {primary.map((book) => (
            <Link
              key={book.slug}
              href={`/library/${book.slug}`}
              className="rounded-2xl border border-line p-5 transition hover:border-gold/60 hover:bg-muted/40"
            >
              <span className="text-3xl" aria-hidden>
                {book.icon}
              </span>
              <h3 className="mt-3 font-black leading-tight">{book.title}</h3>
              <p className="mt-1 text-xs font-semibold text-gold">
                {book.author}
                {book.year ? ` · ${book.year}` : ""}
              </p>
              <p className="mt-3 text-sm leading-6 text-fg-muted">
                {book.description}
              </p>
              <p className="mt-4 text-xs text-fg-muted">
                {book.pages} хуудас · {book.chunks.length} хэсэг
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="Эрдэм шинжилгээний бүтээл"
        description="Мэргэжлийн түүхчдийн олон жилийн судалгаа — гүнзгий, эх сурвалжид тулгуурласан"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {academic.map((book) => (
            <Link
              key={book.slug}
              href={`/library/${book.slug}`}
              className="rounded-2xl border border-line p-5 transition hover:border-gold/60 hover:bg-muted/40"
            >
              <span className="text-3xl" aria-hidden>
                {book.icon}
              </span>
              <h3 className="mt-3 font-black leading-tight">{book.title}</h3>
              <p className="mt-1 text-xs font-semibold text-gold">
                {book.author}
                {book.year ? ` · ${book.year}` : ""}
              </p>
              <p className="mt-3 text-sm leading-6 text-fg-muted">
                {book.description}
              </p>
              <p className="mt-4 text-xs text-fg-muted">
                {book.pages} хуудас · {book.chunks.length} хэсэг
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="Сурах бичиг"
        description="Ерөнхий боловсролын сургуулийн түүхийн сурах бичгүүд"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {textbooks.map((book) => (
            <Link
              key={book.slug}
              href={`/library/${book.slug}`}
              className="rounded-2xl border border-line p-5 transition hover:border-gold/60 hover:bg-muted/40"
            >
              <span className="text-3xl" aria-hidden>
                {book.icon}
              </span>
              <h3 className="mt-3 font-black leading-tight">{book.title}</h3>
              <p className="mt-3 text-sm leading-6 text-fg-muted">
                {book.description}
              </p>
              <p className="mt-4 text-xs text-fg-muted">
                {book.pages} хуудас · {book.chunks.length} хэсэг
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="">
        <Card>
          <h3 className="text-sm font-black">💬 AI багшаас асуу</h3>
          <p className="mt-2 text-sm leading-7 text-fg-muted">
            Эдгээр номын агуулга AI багшийн мэдлэгийн санд орсон. «Судрын
            чуулганд Жамухын тухай юу гэж бичсэн бэ?», «Нууц товчоо хэдэн
            зүйлтэй вэ?» гэх мэт нарийн асуулт тавьж үзээрэй.
          </p>
          <Link
            href="/ai"
            className="mt-5 inline-flex items-center rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-[#1c1a17]"
          >
            AI багш руу →
          </Link>
        </Card>
      </Section>
    </>
  );
}
