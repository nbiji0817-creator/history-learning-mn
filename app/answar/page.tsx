import Link from "next/link";

const grades = [
  {
    grade: "6",
    title: "6-р анги",
    subtitle: "Эртний дэлхийн түүх",
    icon: "🏺",
    description:
      "Эртний иргэншил, Монголын эртний түүх болон дэлхийн түүхийн суурь мэдлэг.",
  },
  {
    grade: "7",
    title: "7-р анги",
    subtitle: "Дундад зууны түүх",
    icon: "🏰",
    description:
      "Монголын эзэнт гүрэн, дундад зууны Монгол болон дэлхийн түүх.",
  },
  {
    grade: "8",
    title: "8-р анги",
    subtitle: "Шинэ үеийн түүх",
    icon: "🌍",
    description:
      "XV–XX зууны эхэн үеийн Монгол болон дэлхийн түүх.",
  },
  {
    grade: "9",
    title: "9-р анги",
    subtitle: "Орчин үеийн Монголын түүх",
    icon: "🇲🇳",
    description:
      "1911 оноос өнөө үе хүртэлх Монголын улс төр, нийгэм, эдийн засаг, соёлын түүх.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-bold text-cyan-300">
            📚 Түүхийн цахим сургалтын систем
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
            ТҮҮХЭЭ
            <span className="text-cyan-400"> МЭДЬЕ</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Монгол болон дэлхийн түүхийг анги тус бүрээр
            системтэй судалж, мэдлэгээ интерактив тестээр
            шалгаарай.
          </p>
        </div>
      </section>

      {/* GRADES */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
            АНГИ СОНГОХ
          </p>

          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Түүхийн хичээлүүд
          </h2>

          <p className="mt-3 text-slate-500">
            Өөрийн суралцаж буй ангиа сонгоод хичээлээ эхлүүлнэ үү.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {grades.map((item) => (
            <Link
              key={item.grade}
              href={`/${item.grade}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-6 transition duration-300 hover:-translate-y-2 hover:border-cyan-400/30 hover:bg-white/[0.08]"
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl transition group-hover:bg-cyan-400/20" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-4xl ring-1 ring-white/10">
                    {item.icon}
                  </div>

                  <span className="text-5xl font-black text-white/10 transition group-hover:text-cyan-400/20">
                    {item.grade}
                  </span>
                </div>

                <h3 className="mt-7 text-2xl font-black">
                  {item.title}
                </h3>

                <p className="mt-2 font-semibold text-cyan-400">
                  {item.subtitle}
                </p>

                <p className="mt-4 min-h-[72px] text-sm leading-6 text-slate-400">
                  {item.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-sm font-bold text-slate-500">
                    Хичээл үзэх
                  </span>

                  <span className="font-black text-cyan-400 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-12 md:grid-cols-3">
          <Feature
            icon="📖"
            title="Хичээл"
            text="Сэдэв бүрийн агуулга, гол ойлголтыг дарааллаар нь судална."
          />

          <Feature
            icon="🧠"
            title="Тест"
            text="Хичээл бүрийн дараа мэдлэгээ интерактив тестээр шалгана."
          />

          <Feature
            icon="📊"
            title="Ахиц"
            text="Тестийн оноо болон хичээлүүдийн ахицаа хянах боломжтой."
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="mx-auto max-w-7xl px-6 py-10 text-center">
          <p className="font-black tracking-[0.2em] text-cyan-400">
            ТҮҮХЭЭ МЭДЬЕ
          </p>

          <p className="mt-2 text-sm text-slate-600">
            Монголын түүх · Дэлхийн түүх · Цахим сургалт
          </p>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-3xl">{icon}</div>

      <h3 className="mt-4 text-xl font-black">
        {title}
      </h3>

      <p className="mt-2 leading-7 text-slate-500">
        {text}
      </p>
    </div>
  );
}