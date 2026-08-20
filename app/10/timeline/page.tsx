"use client";

import Link from "next/link";
import { useState } from "react";

type Event = {
  year: string;
  title: string;
  description: string;
  category: string;
  icon: string;
};

const events: Event[] = [
  {
    year: "800 000 жилийн өмнө",
    title: "Монгол нутагт эртний хүмүүсийн ул мөр",
    description:
      "Монгол нутагт эртний хүмүүс амьдарч байсныг археологийн дурсгалууд гэрчилдэг.",
    category: "Өвөг түүх",
    icon: "🪨",
  },
  {
    year: "Палеолит",
    title: "Хуучин чулуун зэвсгийн үе",
    description:
      "Хүмүүс олзворлох, түүвэрлэх аж ахуй эрхэлж, чулуун багаж зэвсэг ашиглаж байв.",
    category: "Өвөг түүх",
    icon: "🔥",
  },
  {
    year: "Мезолит",
    title: "Дунд чулуун зэвсгийн үе",
    description:
      "Ан агнуурын арга, багаж зэвсэг болон амьдралын хэв маяг улам боловсронгуй болсон.",
    category: "Өвөг түүх",
    icon: "🏹",
  },
  {
    year: "Неолит",
    title: "Неолитын хувьсгал",
    description:
      "Хүмүүс олзворлох аж ахуйгаас үйлдвэрлэх аж ахуйд шилжиж, мал аж ахуй, тариалан хөгжсөн.",
    category: "Өвөг түүх",
    icon: "🌾",
  },
  {
    year: "НТӨ III–I мянган",
    title: "Хүрлийн үе",
    description:
      "Хүрэл боловсруулах технологи хөгжиж, мал аж ахуйд суурилсан нүүдлийн амьдралын хэв маяг бэхжсэн.",
    category: "Өвөг түүх",
    icon: "⚒️",
  },
  {
    year: "НТӨ IV зуун",
    title: "Хүннүгийн улс төрийн хүч бүрэлдэх үе",
    description:
      "Монгол нутагт нүүдэлчдийн улс төрийн нэгдлүүд хүчирхэгжин хөгжсөн.",
    category: "Эртний улсууд",
    icon: "🏹",
  },
  {
    year: "НТӨ III зуун",
    title: "Хүннү гүрний хүчирхэгжилт",
    description:
      "Хүннү Төв Азийн хүчирхэг нүүдэлчдийн төр болон хөгжсөн.",
    category: "Эртний улсууд",
    icon: "🐎",
  },
  {
    year: "НТ II зуун",
    title: "Хүннүгийн дараах улс төрийн өөрчлөлт",
    description:
      "Хүннүгийн дараа Сяньби зэрэг улс төрийн нэгдлүүд хүчирхэгжсэн.",
    category: "Эртний улсууд",
    icon: "🏰",
  },
  {
    year: "XII зуун",
    title: "Чингис хаанаас өмнөх Монгол",
    description:
      "Монголын тал нутагт олон аймаг, овог, улс төрийн нэгдлүүд оршиж байв.",
    category: "Монголын эзэнт гүрэн",
    icon: "🏹",
  },
  {
    year: "1206",
    title: "Их Монгол улс байгуулагдав",
    description:
      "Их хуралдайгаар Тэмүжинг Чингис хаанд өргөмжилж, Их Монгол улсыг байгуулсан.",
    category: "Монголын эзэнт гүрэн",
    icon: "👑",
  },
  {
    year: "1227",
    title: "Чингис хаан нас барав",
    description:
      "Чингис хааны нас барсны дараа Монголын эзэнт гүрний тэлэлт, төрийн хөгжил дараагийн хаадын үед үргэлжилсэн.",
    category: "Монголын эзэнт гүрэн",
    icon: "⚔️",
  },
  {
    year: "XIII зуун",
    title: "Монголын эзэнт гүрний өргөжилт",
    description:
      "Монголын эзэнт гүрэн Евразийн өргөн уудам нутагт тэлж, олон улс оронтой харилцаа тогтоосон.",
    category: "Монголын эзэнт гүрэн",
    icon: "🌏",
  },
  {
    year: "XIII–XIV зуун",
    title: "Эзэнт гүрний бүрэлдэхүүн улсууд",
    description:
      "Юань улс, Алтан ордон, Цагадайн улс, Ил хаант улс зэрэг улс төрийн төвүүд бий болсон.",
    category: "Монголын эзэнт гүрэн",
    icon: "🗺️",
  },
  {
    year: "XIV зуун",
    title: "Монголын улс төрийн төв эх нутагтаа шилжив",
    description:
      "Юань улс Хятадад ноёрхлоо алдсаны дараа Монголын улс төрийн төв эх нутагтаа төвлөрсөн.",
    category: "Дараах үе",
    icon: "🇲🇳",
  },
  {
    year: "XIV–XVII зуун",
    title: "Монголын хаант улсууд",
    description:
      "Монголын нутагт олон улс төрийн нэгдэл, хаант улсууд оршин тогтнож байв.",
    category: "Дараах үе",
    icon: "👑",
  },
  {
    year: "XIV–XVII зуун",
    title: "Нүүдлийн мал аж ахуй ба соёл",
    description:
      "Нүүдлийн мал аж ахуй үндсэн аж ахуй хэвээр үргэлжилж, бичиг үсэг, шашин, урлаг, соёл хөгжсөн.",
    category: "Дараах үе",
    icon: "🏕️",
  },
];

const categories = [
  "Бүгд",
  "Өвөг түүх",
  "Эртний улсууд",
  "Монголын эзэнт гүрэн",
  "Дараах үе",
];

export default function TimelinePage() {
  const [category, setCategory] = useState("Бүгд");
  const [selected, setSelected] = useState<Event | null>(null);

  const filtered =
    category === "Бүгд"
      ? events
      : events.filter((event) => event.category === category);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
              10-р анги · Монголын түүх
            </p>

            <h1 className="mt-1 text-xl font-black">
              ⏳ Он цагийн шулуун
            </h1>
          </div>

          <Link
            href="/10"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold hover:bg-white/10"
          >
            ← 10-р анги
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
            ТҮҮХИЙН ОН ЦАГ
          </p>

          <h2 className="mt-3 text-4xl font-black sm:text-5xl">
            Монголын түүхийг
            <span className="text-amber-400"> он дарааллаар</span>
          </h2>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Түүхэн үйл явдлуудыг цаг хугацааны дарааллаар
            харьцуулж, аль үеийн ямар үйл явдал болохыг
            нэг дороос хараарай.
          </p>

          {/* FILTER */}
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold transition ${
                  category === item
                    ? "bg-amber-400 text-slate-950"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="relative">
          {/* CENTER LINE */}
          <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-amber-400 via-white/20 to-transparent sm:left-1/2 sm:-translate-x-1/2" />

          <div className="space-y-10">
            {filtered.map((event, index) => {
              const left = index % 2 === 0;

              return (
                <div
                  key={`${event.year}-${event.title}`}
                  className="relative sm:grid sm:grid-cols-2 sm:gap-12"
                >
                  {/* MOBILE DOT */}
                  <div className="absolute left-5 top-6 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-slate-950 bg-amber-400 sm:left-1/2" />

                  {/* LEFT */}
                  <div
                    className={`pl-12 sm:pl-0 ${
                      left
                        ? "sm:col-start-1 sm:text-right"
                        : "sm:col-start-2 sm:row-start-1"
                    }`}
                  >
                    <button
                      onClick={() => setSelected(event)}
                      className={`w-full rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-left transition hover:-translate-y-1 hover:border-amber-400/30 ${
                        left ? "sm:text-right" : ""
                      }`}
                    >
                      <div
                        className={`flex items-start justify-between gap-4 ${
                          left ? "sm:flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-3xl">
                          {event.icon}
                        </div>

                        <span className="rounded-full bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-400">
                          {event.year}
                        </span>
                      </div>

                      <p className="mt-5 text-xs font-black uppercase tracking-widest text-slate-600">
                        {event.category}
                      </p>

                      <h3 className="mt-2 text-xl font-black leading-7">
                        {event.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {event.description}
                      </p>

                      <div className="mt-5 border-t border-white/10 pt-4 text-sm font-bold text-amber-400">
                        Дэлгэрэнгүй →
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* INFO */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <div className="grid gap-5 md:grid-cols-3">
            <Info
              icon="📅"
              title="Он дараалал"
              text="Үйл явдлыг цаг хугацааны дарааллаар харна."
            />

            <Info
              icon="🔎"
              title="Үеэр шүүх"
              text="Өвөг түүх, эртний улс, эзэнт гүрэн зэрэг үеэр шүүнэ."
            />

            <Info
              icon="💡"
              title="Дэлгэрэнгүй"
              text="Үйл явдал дээр дарж тайлбар болон ач холбогдлыг харна."
            />
          </div>
        </div>
      </section>

      {/* MODAL */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-7 sm:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <span className="rounded-full bg-amber-400/10 px-4 py-2 text-xs font-black text-amber-400">
                  {selected.year}
                </span>

                <h2 className="mt-5 text-3xl font-black">
                  {selected.icon} {selected.title}
                </h2>

                <p className="mt-2 text-sm font-bold text-slate-500">
                  {selected.category}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl hover:bg-white/10"
              >
                ×
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                ТАЙЛБАР
              </p>

              <p className="mt-4 text-lg leading-8 text-slate-300">
                {selected.description}
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/[0.03] p-5">
                <p className="text-xs font-black text-slate-600">
                  ОН ЦАГ
                </p>

                <p className="mt-2 font-black text-amber-400">
                  {selected.year}
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.03] p-5">
                <p className="text-xs font-black text-slate-600">
                  ҮЕ
                </p>

                <p className="mt-2 font-black">
                  {selected.category}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-2xl bg-amber-400 px-6 py-4 font-black text-slate-950"
            >
              Ойлголоо
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Info({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
      <div className="text-3xl">{icon}</div>

      <h3 className="mt-4 text-lg font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}