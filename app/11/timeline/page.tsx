"use client";

import Link from "next/link";
import { useState } from "react";

type Event = {
  year: string;
  title: string;
  description: string;
  period: string;
  icon: string;
};

const events: Event[] = [
  {
    year: "1636",
    title: "Өвөр Монгол Манжид дагаар оров",
    description:
      "Өвөр Монголын ноёдын чуулган Манжийн хааныг эзэн хаанаа хэмээн зөвшөөрөв.",
    period: "Манжийн эрхшээл",
    icon: "🏹",
  },
  {
    year: "1640",
    title: "Их цааз батлагдав",
    description:
      "Халх, Ойрадын ноёд чуулж, Монголын эрх зүйн чухал баримт бичиг болох Их цаазыг батлав.",
    period: "Манжийн эрхшээл",
    icon: "📜",
  },
  {
    year: "1676",
    title: "Галдан Зүүнгарын хаан болов",
    description:
      "Галдан Зүүнгарын хаан болж, Зүүнгар улс хүчирхэгжин өргөжив.",
    period: "Манжийн эрхшээл",
    icon: "👑",
  },
  {
    year: "1691",
    title: "Халх Монгол Манжийн эрхшээлд оров",
    description:
      "Долоон нуурын чуулганаар Халхын ноёд Манжийн эрхшээлд орохыг зөвшөөрөв.",
    period: "Манжийн эрхшээл",
    icon: "🏯",
  },
  {
    year: "1755–1760",
    title: "Зүүнгар улс Манжид эзлэгдэв",
    description:
      "Манж Чин улс Зүүнгарын эсрэг цэрэг хөдөлгөж, Зүүнгар улс мөхөв.",
    period: "Манжийн эрхшээл",
    icon: "⚔️",
  },
  {
    year: "1771",
    title: "Халимагийн их нүүдэл",
    description:
      "Ижил мөрөнд байсан Халимагуудын нэг хэсэг нутаг буцаж, Манжийн захиргаанд оров.",
    period: "Манжийн эрхшээл",
    icon: "🐎",
  },
  {
    year: "1905–1907",
    title: "Өвөр Монголын бослого хөдөлгөөнүүд",
    description:
      "Өвөр Монголд Тогтох, Цогдалай, Дампил нарын удирдсан бослого хөдөлгөөнүүд өрнөв.",
    period: "Манжийн эрхшээл",
    icon: "✊",
  },
  {
    year: "1911.12.29",
    title: "Монгол Улс тусгаар тогтнолоо тунхаглав",
    description:
      "Монголчууд Манж Чин улсын ноёрхлыг халж, тусгаар тогтносон Монгол Улсыг сэргээн байгуулав.",
    period: "Сэргэн мандалт 1911–1924",
    icon: "🇲🇳",
  },
  {
    year: "1912",
    title: "Орос-Монголын гэрээ",
    description:
      "Монголын шинэ төр улс гадаад харилцаагаа хөгжүүлэх, тусгаар тогтнолоо бататгах үйл явц үргэлжилсэн.",
    period: "Сэргэн мандалт 1911–1924",
    icon: "🤝",
  },
  {
    year: "1915",
    title: "Хиагтын гурван улсын хэлэлцээр",
    description:
      "Монгол, Орос, Хятад гурван улсын хэлэлцээрийн үр дүнд Монгол Улс автономит эрхтэй болов.",
    period: "Сэргэн мандалт 1911–1924",
    icon: "📜",
  },
  {
    year: "1921.03",
    title: "Ардын түр засгийн газар байгуулагдав",
    description:
      "Монголын хувьсгалын улс төрийн байгууллага байгуулагдаж, тусгаар тогтнолын төлөө тэмцэл шинэ шатанд орлоо.",
    period: "Сэргэн мандалт 1911–1924",
    icon: "🏛️",
  },
  {
    year: "1921.07.11",
    title: "1921 оны хувьсгалын ялалт",
    description:
      "Ардын эрхтэй хэмжээт цаазат хаант Монгол Улсыг тунхаглав.",
    period: "Сэргэн мандалт 1911–1924",
    icon: "🎉",
  },
  {
    year: "1921.11.05",
    title: "Монгол-Зөвлөлтийн найрамдлын гэрээ",
    description:
      "Монгол, Зөвлөлт Оросын хооронд найрамдлын гэрээнд гарын үсэг зурав.",
    period: "Сэргэн мандалт 1911–1924",
    icon: "🤝",
  },
  {
    year: "1924.05.20",
    title: "Богд хаан жанч халав",
    description:
      "Богд хаан нас барснаар хэмжээт цаазат хаант төрийн үе төгсөх нөхцөл бүрдэв.",
    period: "Сэргэн мандалт 1911–1924",
    icon: "👑",
  },
  {
    year: "1924.11",
    title: "Анхдугаар Үндсэн хууль батлагдав",
    description:
      "Улсын анхдугаар Их Хурал хуралдаж, Монгол Улсын анхдугаар Үндсэн хуулийг батлав.",
    period: "БНМАУ 1924–1990",
    icon: "📘",
  },
  {
    year: "1928–1932",
    title: "Зүүнтний бодлого",
    description:
      "Социализмыг хурдавчлан байгуулах бодлого хэрэгжиж, нийгэм, эдийн засагт ихээхэн өөрчлөлт гарав.",
    period: "БНМАУ 1924–1990",
    icon: "⚙️",
  },
  {
    year: "1932",
    title: "Зэвсэгт бослого, дүрвэх хөдөлгөөн",
    description:
      "Зүүнтний бодлогын үр дагавартай холбоотойгоор 1932 оны зэвсэгт бослого гарч, дүрвэх хөдөлгөөн өрнөв.",
    period: "БНМАУ 1924–1990",
    icon: "⚠️",
  },
  {
    year: "1932–1940",
    title: "Шинэ эргэлтийн бодлого",
    description:
      "Монголд шинэ эргэлтийн бодлого хэрэгжиж, өмнөх бодлогын алдааг засах чиглэлээр өөрчлөлт хийв.",
    period: "БНМАУ 1924–1990",
    icon: "🔄",
  },
  {
    year: "1939",
    title: "Халх голын дайн",
    description:
      "Монгол-Зөвлөлтийн хамтарсан цэргийн хүч Халх голын байлдаанд ялалт байгуулав.",
    period: "БНМАУ 1924–1990",
    icon: "🪖",
  },
  {
    year: "1940",
    title: "Хоёр дахь Үндсэн хууль",
    description:
      "БНМАУ хоёр дахь Үндсэн хуулиа батлав.",
    period: "БНМАУ 1924–1990",
    icon: "📘",
  },
  {
    year: "1942",
    title: "МУИС байгуулагдав",
    description:
      "Монгол Улсын их сургууль байгуулагдаж, дээд боловсролын тогтолцооны хөгжилд чухал алхам болов.",
    period: "БНМАУ 1924–1990",
    icon: "🎓",
  },
  {
    year: "1945.10.20",
    title: "Тусгаар тогтнолын бүх нийтийн санал хураалт",
    description:
      "Монголчууд бүх нийтийн санал хураалтаар тусгаар тогтнолоо баталгаажуулав.",
    period: "БНМАУ 1924–1990",
    icon: "🗳️",
  },
  {
    year: "1960",
    title: "Гурав дахь Үндсэн хууль",
    description:
      "БНМАУ гурав дахь Үндсэн хуулиа батлав.",
    period: "БНМАУ 1924–1990",
    icon: "📕",
  },
  {
    year: "1961.10.27",
    title: "Монгол Улс НҮБ-ын гишүүн болов",
    description:
      "БНМАУ Нэгдсэн Үндэстний Байгууллагын бүрэн эрхт гишүүнээр элсэв.",
    period: "БНМАУ 1924–1990",
    icon: "🌐",
  },
  {
    year: "1989.12.10",
    title: "МоАХ байгуулагдав",
    description:
      "Монголын ардчилсан хөдөлгөөний гол байгууллагуудын нэг болох МоАХ байгуулагдав.",
    period: "Ардчилал ба шинэчлэл",
    icon: "✊",
  },
  {
    year: "1990.03",
    title: "Ардчилсан хөдөлгөөний өрнөл",
    description:
      "Улс төрийн өлсгөлөн зарлаж, олон намын тогтолцоо болон улс төрийн шинэчлэлийн шаардлага хүчтэй өрнөв.",
    period: "Ардчилал ба шинэчлэл",
    icon: "🕊️",
  },
  {
    year: "1990.07",
    title: "Анхны чөлөөт, ардчилсан сонгууль",
    description:
      "Монголд анхны чөлөөт, ардчилсан сонгууль хоёр үе шаттайгаар явагдав.",
    period: "Ардчилал ба шинэчлэл",
    icon: "🗳️",
  },
  {
    year: "1992.01.13",
    title: "Шинэ Үндсэн хууль батлагдав",
    description:
      "Монгол Улсын ардчилсан шинэ тогтолцооны эрх зүйн үндэс болсон шинэ Үндсэн хуулийг батлав.",
    period: "Ардчилал ба шинэчлэл",
    icon: "📘",
  },
  {
    year: "1993",
    title: "Валютын ханшийг чөлөөлөв",
    description:
      "Эдийн засгийн шинэчлэлийн хүрээнд валютын ханшийг чөлөөлөв.",
    period: "Ардчилал ба шинэчлэл",
    icon: "💰",
  },
  {
    year: "1996",
    title: "Чөлөөт үнийн тогтолцоонд шилжив",
    description:
      "Монгол Улс зах зээлийн эдийн засгийн тогтолцоог бэхжүүлэх шинэчлэлээ үргэлжлүүлэв.",
    period: "Ардчилал ба шинэчлэл",
    icon: "📈",
  },
  {
    year: "1999",
    title: "Энхийг сахиулах ажиллагаанд оролцож эхлэв",
    description:
      "Монгол Улс олон улсын энхийг сахиулах ажиллагаанд оролцох шийдвэр гаргав.",
    period: "Ардчилал ба шинэчлэл",
    icon: "🌍",
  },
  {
    year: "2006",
    title: "Их Монгол Улс байгуулагдсаны 800 жилийн ой",
    description:
      "Их Монгол Улс байгуулагдсаны 800 жилийн ойг ёслон тэмдэглэв.",
    period: "Ардчилал ба шинэчлэл",
    icon: "🏹",
  },
  {
    year: "2008",
    title: "Иргэнд газар өмчлүүлэх хууль",
    description:
      "Иргэдэд газар өмчлүүлэх эрх зүйн зохицуулалт батлагдав.",
    period: "Ардчилал ба шинэчлэл",
    icon: "🏡",
  },
];

const periods = [
  "Бүгд",
  "Манжийн эрхшээл",
  "Сэргэн мандалт 1911–1924",
  "БНМАУ 1924–1990",
  "Ардчилал ба шинэчлэл",
];

export default function TimelinePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("Бүгд");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filteredEvents =
    selectedPeriod === "Бүгд"
      ? events
      : events.filter((event) => event.period === selectedPeriod);

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07111f]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
              11-р анги · Монголын түүх
            </p>

            <h1 className="mt-1 text-xl font-black">
              ⏳ Түүхийн он цагийн шулуун
            </h1>
          </div>

          <Link
            href="/11"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
          >
            ← 11-р анги
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
            XVII–XXI ЗУУНЫ ЭХЭН ҮЕ
          </p>

          <h2 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Монголын түүхийг
            <span className="text-amber-400"> он цагийн дарааллаар</span>
            <br />
            судалцгаая
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Манжийн эрхшээлийн үеэс эхлэн 1911, 1921 оны
            сэргэн мандалт, БНМАУ-ын үе, 1990 оны ардчилсан
            хувьсгал болон XXI зууны эхэн үе хүртэлх гол
            үйл явдлуудыг дарааллаар нь судална.
          </p>

          {/* PERIOD FILTER */}
          <div className="mt-9 flex gap-2 overflow-x-auto pb-2">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`whitespace-nowrap rounded-xl px-5 py-3 text-sm font-black transition ${
                  selectedPeriod === period
                    ? "bg-amber-400 text-slate-950"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="relative">
          {/* CENTER LINE */}
          <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-amber-400 via-white/20 to-transparent md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-10">
            {filteredEvents.map((event, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={`${event.year}-${event.title}`}
                  className="relative md:grid md:grid-cols-2 md:gap-14"
                >
                  {/* DOT */}
                  <div className="absolute left-5 top-8 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-[#07111f] bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] md:left-1/2" />

                  <div
                    className={`pl-12 md:pl-0 ${
                      isLeft
                        ? "md:col-start-1 md:text-right"
                        : "md:col-start-2 md:row-start-1"
                    }`}
                  >
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className={`group w-full rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/[0.06] ${
                        isLeft ? "md:text-right" : ""
                      }`}
                    >
                      <div
                        className={`flex items-start justify-between gap-5 ${
                          isLeft ? "md:flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-3xl">
                          {event.icon}
                        </div>

                        <span className="rounded-full bg-amber-400/10 px-4 py-2 text-xs font-black text-amber-400">
                          {event.year}
                        </span>
                      </div>

                      <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-slate-600">
                        {event.period}
                      </p>

                      <h3 className="mt-2 text-xl font-black leading-7 group-hover:text-amber-400">
                        {event.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {event.description}
                      </p>

                      <div className="mt-5 border-t border-white/10 pt-4 text-sm font-black text-amber-400">
                        Дэлгэрэнгүй үзэх →
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SUMMARY */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <h2 className="text-2xl font-black">
            🧠 11-р ангийн түүхийн 4 үндсэн үе
          </h2>

          <div className="mt-7 grid gap-4 md:grid-cols-4">
            <PeriodCard
              number="01"
              title="Манжийн эрхшээл"
              years="XVII–XX зууны эхэн"
              icon="🏯"
            />

            <PeriodCard
              number="02"
              title="Сэргэн мандалт"
              years="1911–1924"
              icon="🇲🇳"
            />

            <PeriodCard
              number="03"
              title="БНМАУ"
              years="1924–1990"
              icon="🏛️"
            />

            <PeriodCard
              number="04"
              title="Ардчилал, шинэчлэл"
              years="1990 оноос хойш"
              icon="🕊️"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto max-w-7xl px-5 py-10 text-center">
        <p className="text-sm text-slate-600">
          11-р анги · Монголын түүхийн интерактив сургалтын систем
        </p>
      </footer>

      {/* MODAL */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d1928] p-7 shadow-2xl sm:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <span className="rounded-full bg-amber-400/10 px-4 py-2 text-xs font-black text-amber-400">
                  {selectedEvent.year}
                </span>

                <h2 className="mt-5 text-3xl font-black leading-tight">
                  {selectedEvent.icon} {selectedEvent.title}
                </h2>

                <p className="mt-2 font-bold text-slate-500">
                  {selectedEvent.period}
                </p>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl hover:bg-white/10"
              >
                ×
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                ТҮҮХЭН ҮЙЛ ЯВДАЛ
              </p>

              <p className="mt-4 text-lg leading-8 text-slate-300">
                {selectedEvent.description}
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/[0.035] p-5">
                <p className="text-xs font-black text-slate-600">
                  ОН ЦАГ
                </p>

                <p className="mt-2 font-black text-amber-400">
                  {selectedEvent.year}
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.035] p-5">
                <p className="text-xs font-black text-slate-600">
                  ТҮҮХИЙН ҮЕ
                </p>

                <p className="mt-2 font-black">
                  {selectedEvent.period}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-6 w-full rounded-2xl bg-amber-400 px-6 py-4 font-black text-slate-950 transition hover:bg-amber-300"
            >
              Хаах
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function PeriodCard({
  number,
  title,
  years,
  icon,
}: {
  number: string;
  title: string;
  years: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-slate-600">
          {number}
        </span>

        <span className="text-3xl">{icon}</span>
      </div>

      <h3 className="mt-5 font-black">{title}</h3>

      <p className="mt-2 text-sm text-slate-500">
        {years}
      </p>
    </div>
  );
}