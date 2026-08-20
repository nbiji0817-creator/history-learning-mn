import Link from "next/link";
import { Container, Section } from "@/components/ui/page";
import { Badge, ButtonLink, Card, CardLink, Stat } from "@/components/ui/primitives";
import {
  getAnnouncements,
  getEvents,
  getGrades,
  getPlatformStats,
} from "@/lib/repo";
import { eraStyles, eraMap } from "@/data/eras";
import { formatDate } from "@/lib/utils";

const features = [
  {
    href: "/timeline",
    icon: "⏳",
    title: "Он цагийн хэлхээс",
    description: "МЭӨ-өөс өнөөг хүртэлх үйл явдлыг нэг тэнхлэг дээр.",
  },
  {
    href: "/people",
    icon: "👑",
    title: "Түүхэн хүмүүс",
    description: "Модун шаньюйгаас Ю.Цэдэнбал хүртэл — намтар, гавьяа, холбоо.",
  },
  {
    href: "/events",
    icon: "📌",
    title: "Түүхэн үйл явдал",
    description: "Шалтгаан, явц, үр дүн, ач холбогдлоор нь задалсан.",
  },
  {
    href: "/sources",
    icon: "📜",
    title: "Эх сурвалж",
    description: "Анхдагч эх сурвалж уншиж, шинжлэх дадлага хий.",
  },
  {
    href: "/games",
    icon: "🎮",
    title: "Түүхийн тоглоом",
    description: "Он цаг байрлуулах, хүн таах, хурдан тест.",
  },
  {
    href: "/exams",
    icon: "📝",
    title: "Шалгалтын бэлтгэл",
    description: "9-р анги, ЭЕШ, улсын болон төрийн албаны шалгалт.",
  },
  {
    href: "/ai",
    icon: "🤖",
    title: "AI түүхийн багш",
    description: "Асуу, тайлбарлуул, шалгуул, түүхэн хүнтэй ярилц.",
  },
  {
    href: "/dictionary",
    icon: "📖",
    title: "Тайлбар толь",
    description: "Түүхийн нэр томьёог энгийн үгээр.",
  },
];

/** Өнөөдрийн түүх — өдрөөс хамаарсан тогтмол сонголт. */
function pickDailyIndex(length: number): number {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  return dayOfYear % Math.max(1, length);
}

export default async function HomePage() {
  const [grades, events, announcements, stats] = await Promise.all([
    getGrades(),
    getEvents(),
    getAnnouncements(),
    getPlatformStats(),
  ]);

  const daily = events[pickDailyIndex(events.length)];
  const pinned = announcements.filter((item) => item.pinned).slice(0, 1);

  return (
    <>
      {/* ─────────────  Hero  ───────────── */}
      <section className="border-b border-line bg-parchment">
        <Container className="py-16 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <Badge className="bg-gold/15 text-gold">
                🇲🇳 Монгол хэл дээрх түүхийн нэгдсэн систем
              </Badge>

              <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                ТҮҮХЭЭ МЭДЬЕ —
                <span className="block text-gold">ИРЭЭДҮЙГЭЭ БҮТЭЭЕ</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-fg-muted">
                6–12-р ангийн түүхийн хичээл, интерактив он цагийн хэлхээс,
                түүхэн хүмүүс, эх сурвалж, тоглоом, AI багш болон шалгалтын
                бэлтгэл — бүгд нэг дор.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/grades" size="lg">
                  📚 Хичээл үзэж эхлэх
                </ButtonLink>
                <ButtonLink href="/ai" size="lg" variant="secondary">
                  🤖 AI багшаас асуух
                </ButtonLink>
              </div>

              <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <dt className="text-xs font-medium text-fg-muted">Хичээл</dt>
                  <dd className="text-2xl font-black text-gold">{stats.lessons}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-fg-muted">Тестийн асуулт</dt>
                  <dd className="text-2xl font-black text-gold">{stats.questions}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-fg-muted">Түүхэн хүн</dt>
                  <dd className="text-2xl font-black text-gold">{stats.figures}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-fg-muted">Үйл явдал</dt>
                  <dd className="text-2xl font-black text-gold">{stats.events}</dd>
                </div>
              </dl>
            </div>

            {/* Өнөөдрийн түүх */}
            <Card className="bg-surface/80">
              <div className="flex items-center justify-between">
                <Badge className="bg-clay/15 text-clay">🔥 Өнөөдрийн түүх</Badge>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${eraStyles[daily.era].chip}`}
                >
                  {eraMap[daily.era].label}
                </span>
              </div>

              <div className="mt-6 text-5xl" aria-hidden>
                {daily.icon}
              </div>

              <p className="mt-4 font-mono text-sm font-bold text-gold">{daily.year}</p>

              <h2 className="mt-2 text-2xl font-black leading-tight">{daily.title}</h2>

              <p className="mt-3 text-sm leading-6 text-fg-muted">{daily.summary}</p>

              <Link
                href="/events"
                className="mt-6 inline-flex text-sm font-bold text-gold hover:underline"
              >
                Бүх үйл явдал үзэх →
              </Link>
            </Card>
          </div>
        </Container>
      </section>

      {/* ─────────────  Мэдээ  ───────────── */}
      {pinned.length > 0 ? (
        <Container className="pt-8">
          {pinned.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4"
            >
              <span className="text-xl" aria-hidden>
                {item.icon}
              </span>
              <p className="flex-1 text-sm font-medium">
                <span className="font-bold">{item.title}</span>
                <span className="ml-2 text-fg-muted">{item.body}</span>
              </p>
              <span className="text-xs text-fg-muted">
                {formatDate(item.publishedAt)}
              </span>
            </div>
          ))}
        </Container>
      ) : null}

      {/* ─────────────  Ангиуд  ───────────── */}
      <Section
        title="Ангиа сонгоно уу"
        description="Анги бүр өөрийн хичээл, тест, тоглоом, шалгалтын бэлтгэлтэй."
        action={
          <Link href="/grades" className="text-sm font-bold text-gold hover:underline">
            Бүгдийг үзэх →
          </Link>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {grades.map((grade) => (
            <CardLink key={grade.grade} href={`/grades/${grade.grade}`}>
              <div className="flex items-start justify-between">
                <span className="text-4xl" aria-hidden>
                  {grade.icon}
                </span>
                <span
                  className={`rounded-full bg-gradient-to-r ${grade.accent} px-3 py-1 text-xs font-black text-white`}
                >
                  {grade.grade}-р анги
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold group-hover:text-gold">
                {grade.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-fg-muted">{grade.subtitle}</p>

              {grade.focus ? (
                <p className="mt-3 text-xs font-bold text-clay">⭐ {grade.focus}</p>
              ) : null}
            </CardLink>
          ))}
        </div>
      </Section>

      {/* ─────────────  Онцлох хэсгүүд  ───────────── */}
      <Section
        title="Онцлох хэсгүүд"
        description="Түүхийг зөвхөн уншиж биш, харж, тоглож, шалгуулж сур."
        className="bg-muted/40"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <CardLink key={feature.href} href={feature.href}>
              <div className="text-3xl" aria-hidden>
                {feature.icon}
              </div>
              <h3 className="mt-4 font-bold group-hover:text-gold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-fg-muted">
                {feature.description}
              </p>
            </CardLink>
          ))}
        </div>
      </Section>

      {/* ─────────────  Хэрэглэгчийн төрөл  ───────────── */}
      <Section
        title="Хэн ашиглах вэ?"
        description="Систем сурагч, эцэг эх, багш, түүх сонирхогч иргэн бүрд зориулагдсан."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Stat icon="🧑‍🎓" label="Сурагч" value="Суралцах" hint="Хичээл, тест, тоглоом, ахиц" />
          <Stat icon="👪" label="Эцэг эх" value="Хянах" hint="Хүүхдийн ахиц, оноо, санал хүсэлт" />
          <Stat icon="👩‍🏫" label="Багш" value="Удирдах" hint="Агуулга, статистик, санал хүсэлт" />
          <Stat icon="🌍" label="Иргэн" value="Судлах" hint="Нэвтрэхгүйгээр үнэгүй үзэх" />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/login" variant="secondary">
            Демо эрхээр нэвтрэх
          </ButtonLink>
          <ButtonLink href="/feedback" variant="ghost">
            Санал хүсэлт илгээх
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
