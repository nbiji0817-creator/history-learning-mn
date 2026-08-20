"use client";

import Link from "next/link";

const chapters = [
  {
    number: "I",
    title: "XVII–XX зууны эхэн үеийн Монгол",
    color: "from-amber-500 to-orange-600",
    icon: "🏯",
    lessons: [
      {
        id: 1,
        title: "Монгол улс Манжийн эрхшээлд орсон нь",
        icon: "🏯",
        desc: "Монгол улс Манжийн эрхшээлд орсон үйл явц, түүхэн нөхцөл.",
      },
      {
        id: 2,
        title: "Халимаг, Буриад Монголыг Орос улс эзэрхсэн нь",
        icon: "🗺️",
        desc: "Халимаг, Буриад Монголын түүхэн хувь заяа.",
      },
      {
        id: 3,
        title: "Монгол Улс тусгаар тогтнолоо алдсан шалтгаан",
        icon: "⚔️",
        desc: "Тусгаар тогтнолоо алдсан түүхэн шалтгаан, нөхцөл.",
      },
      {
        id: 4,
        title: "Манжийн эрхшээлийн үеийн Монголын нийгэм, соёл",
        icon: "📜",
        desc: "Нийгмийн байгуулал, соёл, шашин болон оюун санааны амьдрал.",
      },
      {
        id: 5,
        title: "Монголчуудын тусгаар тогтнолын төлөө тэмцэл, хөдөлгөөн",
        icon: "⚔️",
        desc: "Тусгаар тогтнолын төлөө өрнөсөн тэмцэл, хөдөлгөөн.",
      },
    ],
  },
  {
    number: "II",
    title: "Монгол улс сэргэн мандсан нь (1911–1924)",
    color: "from-red-500 to-rose-600",
    icon: "🇲🇳",
    lessons: [
      {
        id: 6,
        title: "1911 оны хувьсгалын ялалт, ач холбогдол",
        icon: "🇲🇳",
        desc: "1911 оны үндэсний эрх чөлөөний хувьсгалын өрнөл, үр дүн.",
      },
      {
        id: 7,
        title: "Монгол Улсын сэргэн мандлын эхлэл (1911–1920 он)",
        icon: "👑",
        desc: "Шинэ Монгол улсын хөгжлийн эхлэл.",
      },
      {
        id: 8,
        title: "Монгол Улсын тусгаар тогтнолын хувь заяа",
        icon: "🕊️",
        desc: "Тусгаар тогтнолын асуудал, олон улсын нөхцөл.",
      },
      {
        id: 9,
        title: "1921 оны хувьсгалын ялалт, ач холбогдол",
        icon: "🚩",
        desc: "1921 оны хувьсгалын өрнөл, ялалт, түүхэн ач холбогдол.",
      },
      {
        id: 10,
        title: "Хэмжээт цаазат хаант Монгол Улс (1921–1924 он)",
        icon: "👑",
        desc: "1921–1924 оны улс төрийн тогтолцоо, хөгжлийн онцлог.",
      },
      {
        id: 11,
        title: "Монгол Улсын хөгжлийн талаарх үзэл баримтлалууд",
        icon: "💡",
        desc: "Монголын хөгжлийн талаарх үзэл санаа, чиг хандлагууд.",
      },
    ],
  },
  {
    number: "III",
    title: "БНМАУ социализмын замаар (1924–1990)",
    color: "from-blue-500 to-indigo-600",
    icon: "🏛️",
    lessons: [
      {
        id: 12,
        title: "Монгол Улсын анхдугаар Үндсэн хууль",
        icon: "📜",
        desc: "Анхдугаар Үндсэн хууль болон түүний түүхэн ач холбогдол.",
      },
      {
        id: 13,
        title: "Улс орноо хөгжүүлэх чиг хандлага, зөрөлдөөн",
        icon: "⚖️",
        desc: "Улс орны хөгжлийн чиглэл, үзэл бодлын зөрөлдөөн.",
      },
      {
        id: 14,
        title: "1932 оны зэвсэгт бослого, дүрвэх хөдөлгөөн",
        icon: "⚔️",
        desc: "1932 оны үйл явдал, түүний шалтгаан, үр дагавар.",
      },
      {
        id: 15,
        title: "Шинэ эргэлтийн жилүүд дэх өөрчлөлт шинэчлэл, ахиц дэвшил",
        icon: "🏭",
        desc: "Нийгэм, эдийн засагт гарсан өөрчлөлт, шинэчлэл.",
      },
      {
        id: 16,
        title: "Улс төрийн хэлмэгдүүлэлт: үйл явц, үр дагавар",
        icon: "🕯️",
        desc: "Улс төрийн хэлмэгдүүлэлтийн үйл явц, түүхэн үр дагавар.",
      },
      {
        id: 17,
        title: "Дэлхийн II дайны үеийн БНМАУ, тусгаар тогтнолын бэхжилт",
        icon: "🌍",
        desc: "Дэлхийн II дайны үеийн Монгол Улсын нөхцөл байдал.",
      },
      {
        id: 18,
        title: "БНМАУ-д социализм байгуулах оролдлого",
        icon: "🏛️",
        desc: "Социализм байгуулах бодлого, хэрэгжүүлсэн арга хэмжээ.",
      },
      {
        id: 19,
        title: "БНМАУ-ын нийгэм-эдийн засагт гарсан өөрчлөлт",
        icon: "🏭",
        desc: "Нийгэм, эдийн засгийн бүтэц, амьдралд гарсан өөрчлөлт.",
      },
      {
        id: 20,
        title: "БНМАУ-ын боловсрол, шинжлэх ухаан, соёлын хөгжилт",
        icon: "📚",
        desc: "Боловсрол, шинжлэх ухаан, соёлын хөгжлийн үндсэн чиглэл.",
      },
      {
        id: 21,
        title: "БНМАУ-ын гадаад харилцаа",
        icon: "🌐",
        desc: "БНМАУ-ын гадаад харилцааны хөгжил, олон улсын байр суурь.",
      },
    ],
  },
  {
    number: "IV",
    title: "Монгол Улс ардчилал, шинэчлэлийн замаар (1990 оноос хойш)",
    color: "from-emerald-500 to-teal-600",
    icon: "🕊️",
    lessons: [
      {
        id: 22,
        title: "1990 оны ардчилсан хувьсгал: өрнөл, ялалт, ач холбогдол",
        icon: "🕊️",
        desc: "1990 оны ардчилсан хувьсгалын өрнөл, ялалт, ач холбогдол.",
      },
      {
        id: 23,
        title: "Улс төрийн тогтолцоонд гарсан өөрчлөлт",
        icon: "🏛️",
        desc: "Ардчиллын үеийн улс төрийн тогтолцооны өөрчлөлт.",
      },
      {
        id: 24,
        title: "Нийгэм, эдийн засгийн тогтолцооны шинэчлэл",
        icon: "📈",
        desc: "Шинэчлэлийн үеийн нийгэм, эдийн засгийн өөрчлөлт.",
      },
      {
        id: 25,
        title: "Оюун санааны хүрээн дэх хувьсал өөрчлөлт",
        icon: "🧠",
        desc: "Оюун санаа, үзэл бодол, соёлын хүрээнд гарсан өөрчлөлт.",
      },
      {
        id: 26,
        title: "Монгол Улсын гадаад харилцаа өргөжин хөгжсөн нь",
        icon: "🌏",
        desc: "Монгол Улсын гадаад харилцааны шинэ үеийн хөгжил.",
      },
    ],
  },
];

const totalLessons = chapters.reduce(
  (total, chapter) => total + chapter.lessons.length,
  0
);

export default function Grade11Page() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-bold tracking-[0.25em] text-amber-400">
              ТҮҮХЭЭ МЭДЬЕ
            </p>
            <h1 className="mt-1 text-xl font-bold">
              11-р ангийн Монголын түүх
            </h1>
            <p className="text-sm text-slate-400">
              6–12-р ангийн түүхийн нэгдсэн систем
            </p>
          </div>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 px-5 py-3 font-semibold transition hover:bg-white/10"
          >
            ← Нүүр хуудас
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-14">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-[#111d30] to-[#17243a] p-8 shadow-2xl md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-400">
                🇲🇳 11-Р АНГИ • МОНГОЛЫН ТҮҮХ
              </div>

              <h2 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Монголын түүхийг
                <span className="text-amber-400"> системтэй </span>
                судалъя
              </h2>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                XVII зуунаас XXI зууны эхэн үе хүртэлх Монголын түүхийг
                бүлэг, сэдэв, он цаг, эх сурвалж, дасгал, тестээр дамжуулан
                судлах нэгдсэн сургалтын орчин.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#lessons"
                  className="rounded-2xl bg-amber-400 px-6 py-4 font-black text-slate-950 transition hover:scale-105"
                >
                  📖 Хичээлүүдээ үзэх
                </a>

                <a
                  href="#tools"
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold transition hover:bg-white/10"
                >
                  🧠 Суралцах хэрэгслүүд
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard value="4" label="Бүлэг" icon="📚" />
              <StatCard value={String(totalLessons)} label="Сэдэв" icon="📖" />
              <StatCard value="∞" label="Дасгал" icon="🧩" />
              <StatCard value="AI" label="Туслах" icon="🤖" />
            </div>
          </div>
        </div>
      </section>

      {/* QUICK TOOLS */}
      <section id="tools" className="mx-auto max-w-7xl px-6 pb-12">
        <div className="mb-6">
          <p className="text-sm font-black tracking-[0.25em] text-amber-400">
            СУРАЛЦАХ ХЭРЭГСЛҮҮД
          </p>
          <h2 className="mt-2 text-3xl font-black">Түүхээ судлах орчин</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ToolCard icon="⏳" title="Он цагийн шулуун" text="Түүхэн үйл явдлыг он цагийн дарааллаар судлах" />
          <ToolCard icon="🗺️" title="Түүхэн газрын зураг" text="Түүхэн газар нутаг, үйл явдлыг судлах" />
          <ToolCard icon="👑" title="Түүхэн хүмүүс" text="Түүхэнд нөлөө үзүүлсэн хүмүүсийн тухай" />
          <ToolCard icon="📜" title="Эх сурвалж" text="Түүхийн баримт, эх сурвалж дээр ажиллах" />
          <ToolCard icon="🧩" title="Дасгал даалгавар" text="Мэдлэгээ бататгах интерактив дасгалууд" />
          <ToolCard icon="🧠" title="Тест" text="Өөрийн мэдлэгийг шалгах сорил" />
          <ToolCard icon="🎮" title="Түүхийн тоглоом" text="Тоглож байхдаа түүхээ давтах" />
          <ToolCard icon="🤖" title="AI түүхийн туслах" text="Сэдвийн талаар асуулт асууж суралцах" />
        </div>
      </section>

      {/* LESSONS */}
      <section id="lessons" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-10">
          <p className="text-sm font-black tracking-[0.25em] text-amber-400">
            11-Р АНГИЙН ХӨТӨЛБӨР
          </p>
          <h2 className="mt-2 text-4xl font-black">
            Бүх хичээл
          </h2>
          <p className="mt-3 max-w-3xl text-slate-400">
            Сурах бичгийн гарчгийн бүтцээр бүлэг бүрийг дарааллаар нь
            байрлууллаа.
          </p>
        </div>

        <div className="space-y-10">
          {chapters.map((chapter) => (
            <section
              key={chapter.number}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#101b2c]"
            >
              {/* CHAPTER HEADER */}
              <div
                className={`bg-gradient-to-r ${chapter.color} p-7 md:p-9`}
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-4xl backdrop-blur">
                      {chapter.icon}
                    </div>

                    <div>
                      <p className="text-sm font-black tracking-[0.2em] text-white/70">
                        {chapter.number}-Р БҮЛЭГ
                      </p>
                      <h3 className="mt-1 text-2xl font-black md:text-3xl">
                        {chapter.title}
                      </h3>
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/20 px-4 py-2 text-sm font-bold">
                    {chapter.lessons.length} хичээл
                  </div>
                </div>
              </div>

              {/* LESSON CARDS */}
              <div className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
                {chapter.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/11/lesson/${lesson.id}`}
                    className="group rounded-2xl border border-white/10 bg-[#172337] p-6 transition duration-200 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-[#1d2b42]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-4xl">{lesson.icon}</div>

                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-400">
                        {lesson.id}-р хичээл
                      </span>
                    </div>

                    <h4 className="mt-5 text-xl font-black leading-7 transition group-hover:text-amber-400">
                      {lesson.title}
                    </h4>

                    <p className="mt-3 min-h-[60px] text-sm leading-6 text-slate-400">
                      {lesson.desc}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="font-bold text-amber-400">
                        Хичээл үзэх
                      </span>

                      <span className="text-xl transition group-hover:translate-x-1">
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

      {/* STUDY SYSTEM */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-[2rem] border border-amber-400/20 bg-gradient-to-br from-amber-400/10 to-transparent p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-black tracking-[0.25em] text-amber-400">
                ХИЧЭЭЛ БҮРТ
              </p>

              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                Нэг сэдэв = бүрэн сургалтын модуль
              </h2>

              <p className="mt-5 leading-8 text-slate-300">
                Хичээлүүдийг зөвхөн текстээр бус, он цаг, түлхүүр асуулт,
                түүхийн баримт, эх сурвалж, нэр томьёо, дасгал даалгавар,
                өөрийгөө шалгах хэсгүүдтэйгээр хөгжүүлэхэд зориулсан суурь
                бүтэц.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Feature text="🎯 Суралцахуйн зорилго" />
              <Feature text="⏳ Он цагийн шулуун" />
              <Feature text="❓ Түлхүүр асуулт" />
              <Feature text="📜 Түүхийн эх сурвалж" />
              <Feature text="📚 Нэр томьёо" />
              <Feature text="🧩 Дасгал даалгавар" />
              <Feature text="🧠 Өөрийгөө шалгах тест" />
              <Feature text="🏆 Ахиц, оноо" />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#050c16]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black">ТҮҮХЭЭ МЭДЬЕ</p>
              <p className="mt-1 text-sm text-slate-500">
                11-р ангийн Монголын түүхийн цахим сургалтын систем
              </p>
            </div>

            <p className="text-sm text-slate-500">
              © 2026 • Монголын түүх
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function StatCard({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="text-3xl">{icon}</div>
      <div className="mt-3 text-3xl font-black">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

function ToolCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111d2e] p-5 transition hover:-translate-y-1 hover:border-amber-400/30">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-4 font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold">
      {text}
    </div>
  );
}