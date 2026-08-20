import Link from "next/link";

const chapters = [
  {
    number: "I",
    title: "Монголын өвөг түүх",
    period: "800 000 жилийн өмнө – НТӨ IV зуун",
    icon: "🪨",
    color: "blue",
    lessons: [
      {
        id: 1,
        title: "Палеолит, мезолит",
        subtitle: "Олзворлох, түүвэрлэх аж ахуйн үе",
        icon: "🔥",
      },
      {
        id: 2,
        title: "Неолитын хувьсгал",
        subtitle: "Үйлдвэрлэх аж ахуйн үе",
        icon: "🌾",
      },
      {
        id: 3,
        title: "Хүрлийн үе, түрүү төмрийн үе",
        subtitle: "Нүүдлийн иргэншил",
        icon: "⚔️",
      },
    ],
  },
  {
    number: "II",
    title: "Монголын эртний улсууд",
    period: "НТӨ IV – XII зуун",
    icon: "🏹",
    color: "emerald",
    lessons: [
      {
        id: 4,
        title: "Хүннү гүрэн",
        subtitle: "Монгол нутаг дахь анхны хүчирхэг улс",
        icon: "🐎",
      },
      {
        id: 5,
        title: "Хүннүгийн дараах улсууд",
        subtitle: "Эртний Монголын төр улсууд",
        icon: "🏰",
      },
      {
        id: 6,
        title: "Эртний улсуудын аж ахуй, технологийн дэвшил",
        subtitle: "Аж ахуй ба технологийн хөгжил",
        icon: "⚒️",
      },
      {
        id: 7,
        title: "Эртний улсуудын соёл",
        subtitle: "Соёл, зан заншил, дурсгал",
        icon: "🎨",
      },
    ],
  },
  {
    number: "III",
    title: "Монголын эзэнт гүрэн",
    period: "XII – XIV зуун",
    icon: "👑",
    color: "amber",
    lessons: [
      {
        id: 8,
        title: "Чингис хаанаас өмнөх үеийн монголчууд",
        subtitle: "Монгол аймгууд ба улс төрийн нөхцөл",
        icon: "🏹",
      },
      {
        id: 9,
        title: "Их Монгол улс",
        subtitle: "Монголын нэгдсэн улс байгуулагдсан нь",
        icon: "👑",
      },
      {
        id: 10,
        title: "Чингис хааны түүхэнд гүйцэтгэсэн үүрэг",
        subtitle: "Чингис хааны түүхэн байр суурь",
        icon: "⚔️",
      },
      {
        id: 11,
        title: "Чингис хааны дараах Монголын эзэнт гүрэн",
        subtitle: "Эзэнт гүрний хөгжил ба залгамжлал",
        icon: "🌏",
      },
      {
        id: 12,
        title: "Монголын эзэнт гүрний задрал",
        subtitle: "Юань, Алтан ордон, Цагадай, Ил хаант улс",
        icon: "🗺️",
      },
    ],
  },
  {
    number: "IV",
    title: "Монголын эзэнт гүрний дараах Монгол улс",
    period: "XIV – XVII зуун",
    icon: "🏛️",
    color: "purple",
    lessons: [
      {
        id: 13,
        title: "Монгол улс эх нутагтаа төвлөсөн нь",
        subtitle: "Монгол улс эх нутагтаа төвлөрсөн үйл явц",
        icon: "🇲🇳",
      },
      {
        id: 14,
        title: "Монголын хаант улсууд",
        subtitle: "Монголын хаант улсуудын хөгжил",
        icon: "👑",
      },
      {
        id: 15,
        title: "Соёл, аж ахуй",
        subtitle: "XIV–XVII зууны Монголын соёл, аж ахуй",
        icon: "🏕️",
      },
    ],
  },
];

const colorClasses: Record<string, string> = {
  blue: "border-blue-400/20 bg-blue-400/5 text-blue-400",
  emerald: "border-emerald-400/20 bg-emerald-400/5 text-emerald-400",
  amber: "border-amber-400/20 bg-amber-400/5 text-amber-400",
  purple: "border-purple-400/20 bg-purple-400/5 text-purple-400",
};

export default function Grade10Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-amber-400">
              ТҮҮХЭЭ МЭДЬЕ
            </p>

            <h1 className="mt-1 text-xl font-black">
              10-р ангийн Монголын түүх
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
          >
            ← Нүүр
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute left-1/2 top-0 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-3">
              <span className="text-3xl">📚</span>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Монголын түүх
                </p>

                <p className="font-black">
                  10-р анги
                </p>
              </div>
            </div>

            <h2 className="mt-8 text-4xl font-black leading-tight sm:text-6xl">
              Монголын түүхийг
              <br />
              <span className="text-amber-400">
                үе шаттайгаар судалъя
              </span>
            </h2>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Нэн эрт үеэс XVII зууны эхэн хүртэлх Монголын
              түүхийг бүлэг, сэдвээр нь дарааллаар судална.
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            icon="📖"
            number="4"
            text="Бүлэг"
          />

          <Stat
            icon="📚"
            number="15"
            text="Сэдэв"
          />

          <Stat
            icon="⏳"
            number="800,000+"
            text="Жилийн түүх"
          />
        </div>
      </section>

      {/* CHAPTERS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
            ХИЧЭЭЛИЙН БҮТЭЦ
          </p>

          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Бүлэг, сэдвүүд
          </h2>
        </div>

        <div className="space-y-8">
          {chapters.map((chapter) => (
            <section
              key={chapter.number}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]"
            >
              {/* CHAPTER HEADER */}
              <div
                className={`border-b p-6 sm:p-8 ${
                  colorClasses[chapter.color]
                }`}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-950/50 text-3xl">
                      {chapter.icon}
                    </div>

                    <div>
                      <p className="text-sm font-black uppercase tracking-widest opacity-70">
                        {chapter.number}-р бүлэг
                      </p>

                      <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                        {chapter.title}
                      </h3>

                      <p className="mt-2 text-sm font-semibold opacity-80">
                        {chapter.period}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950/40 px-4 py-2 text-sm font-bold">
                    {chapter.lessons.length} сэдэв
                  </div>
                </div>
              </div>

              {/* LESSONS */}
              <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {chapter.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/10/lesson/${lesson.id}`}
                    className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition duration-300 hover:-translate-y-1 hover:border-amber-400/30 hover:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl">
                        {lesson.icon}
                      </div>

                      <span className="text-sm font-black text-slate-600">
                        #{lesson.id}
                      </span>
                    </div>

                    <h4 className="mt-5 text-lg font-black leading-7">
                      {lesson.title}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {lesson.subtitle}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Хичээл үзэх
                      </span>

                      <span className="font-black text-amber-400 transition group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* BOTTOM */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-12 text-center">
          <div className="text-4xl">🏺 🏹 👑 🇲🇳</div>

          <h2 className="mt-5 text-2xl font-black">
            Монголын түүхээ хамтдаа судалцгаая
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Сэдвээ сонгон орж хичээлийн агуулга,
            эх сурвалж, даалгавар болон мэдлэг шалгах
            тестүүдтэй ажиллана.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center">
          <p className="font-black tracking-[0.2em] text-amber-400">
            ТҮҮХЭЭ МЭДЬЕ
          </p>

          <p className="mt-2 text-xs text-slate-600">
            10-р анги · Монголын түүх
          </p>
        </div>
      </footer>
    </main>
  );
}

function Stat({
  icon,
  number,
  text,
}: {
  icon: string;
  number: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl">
        {icon}
      </div>

      <div>
        <p className="text-2xl font-black">
          {number}
        </p>

        <p className="text-sm text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}