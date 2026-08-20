"use client";

import Link from "next/link";
import { useState } from "react";

type Source = {
  id: number;
  title: string;
  period: string;
  type: string;
  icon: string;
  sourceText: string;
  questions: string[];
  hints: string[];
};

const sources: Source[] = [
  {
    id: 1,
    title: "Палеолитын үеийн хүмүүс",
    period: "800 000 жилийн өмнөөс",
    type: "Археологийн сурвалж",
    icon: "🪨",
    sourceText:
      "Монгол нутагт эртний хүмүүс амьдарч байсныг чулуун зэвсэг, бууц суурин болон бусад археологийн дурсгалууд гэрчилдэг.",
    questions: [
      "Энэ сурвалж ямар төрлийн сурвалж вэ?",
      "Сурвалжаас ямар мэдээлэл авч болох вэ?",
      "Энэ сурвалжийг ашиглан ямар түүхэн дүгнэлт хийж болох вэ?",
    ],
    hints: [
      "Материаллаг дурсгалын шинжийг анхаар.",
      "Чулуун зэвсэг юуг илэрхийлж болохыг бод.",
      "Сурвалжийн боломж ба хязгаарлалтыг ялгаж үз.",
    ],
  },
  {
    id: 2,
    title: "Неолитын хувьсгал",
    period: "Неолитын үе",
    type: "Түүхэн баримт",
    icon: "🌾",
    sourceText:
      "Хүмүүс байгалиас бэлэн байгаа хүнсийг олж ашиглахаас гадна мал аж ахуй, тариалан эрхэлж, хүнсээ өөрсдөө үйлдвэрлэх болсон нь хүний нийгмийн хөгжлийн томоохон өөрчлөлт байв.",
    questions: [
      "Энэ баримтад ямар өөрчлөлтийг онцолсон байна вэ?",
      "Олзворлох ба үйлдвэрлэх аж ахуйн ялгааг тайлбарла.",
      "Энэ өөрчлөлт хүний амьдралд ямар үр дагавартай байсан бэ?",
    ],
    hints: [
      "Аж ахуйн хэлбэрийг харьцуул.",
      "Хүн амын суурьшилд гарсан өөрчлөлтийг бод.",
      "Урт хугацааны үр дагаврыг тайлбарла.",
    ],
  },
  {
    id: 3,
    title: "Хүннүгийн төр",
    period: "НТӨ IV – НТ II зуун",
    type: "Бичгийн сурвалж",
    icon: "🏹",
    sourceText:
      "Хүннүгийн төрийн дээд эрх баригчийг шаньюй хэмээн нэрлэж, төрийн зохион байгуулалт болон цэргийн хүчээрээ Төв Азид нөлөө бүхий улс болжээ.",
    questions: [
      "Сурвалжид Хүннүгийн төрийн ямар шинжийг харуулсан байна вэ?",
      "Шаньюй гэж хэн бэ?",
      "Төрийн зохион байгуулалт хүчирхэг болоход ямар ач холбогдолтой вэ?",
    ],
    hints: [
      "Төрийн эрх мэдлийн шатлалыг анхаар.",
      "Шаньюйн үүргийг тайлбарла.",
      "Цэрэг ба төрийн холбоог бод.",
    ],
  },
  {
    id: 4,
    title: "1206 оны Их хуралдай",
    period: "1206 он",
    type: "Түүхэн баримт",
    icon: "👑",
    sourceText:
      "1206 онд Монголын язгууртнуудын их хуралдай болж, Тэмүжинг Чингис хаанд өргөмжлөн Их Монгол улсыг байгуулжээ.",
    questions: [
      "1206 оны үйл явдлын гол үр дүн юу вэ?",
      "Их хуралдай ямар үүрэгтэй байсан бэ?",
      "Энэ үйл явдал Монголын түүхэнд яагаад чухал вэ?",
    ],
    hints: [
      "Төрийн нэгдлийг анхаар.",
      "Тэмүжингийн шинэ нэр, байр суурийг тодорхойл.",
      "Өмнөх улс төрийн нөхцөлтэй харьцуул.",
    ],
  },
  {
    id: 5,
    title: "Чингис хааны төрийн зохион байгуулалт",
    period: "XIII зуун",
    type: "Түүхэн баримт",
    icon: "⚔️",
    sourceText:
      "Чингис хаан нэгдсэн төрийг бэхжүүлэхийн тулд цэрэг, захиргааны зохион байгуулалтыг шинэчилж, хүмүүсийг аравт, зуут, мянгат зэрэг зохион байгуулалтад оруулсан.",
    questions: [
      "Энэ зохион байгуулалтын гол зорилго юу байсан бэ?",
      "Мянгатын зохион байгуулалт ямар давуу талтай байсан бэ?",
      "Энэ өөрчлөлт төвлөрсөн төрд хэрхэн нөлөөлсөн бэ?",
    ],
    hints: [
      "Хуучин овог, аймгийн зохион байгуулалттай харьцуул.",
      "Цэргийн зохион байгуулалтыг анхаар.",
      "Төвлөрсөн төрийн ач холбогдлыг тайлбарла.",
    ],
  },
  {
    id: 6,
    title: "Өртөөний тогтолцоо",
    period: "XIII–XIV зуун",
    type: "Төрийн байгуулалтын баримт",
    icon: "🐎",
    sourceText:
      "Монголын эзэнт гүрний өргөн уудам нутагт албан мэдээ, хүн, барааг хурдан дамжуулахад өртөөний тогтолцоог ашиглаж байв.",
    questions: [
      "Өртөөний үндсэн зориулалт юу байсан бэ?",
      "Өртөөний тогтолцоо эзэнт гүрний удирдлагад ямар ач холбогдолтой вэ?",
      "Өртөө худалдаа, харилцаанд хэрхэн нөлөөлсөн байж болох вэ?",
    ],
    hints: [
      "Зай, хурд, мэдээллийг бод.",
      "Төв болон захын нутгийн харилцааг анхаар.",
      "Худалдааны замтай холбон дүгнэ.",
    ],
  },
  {
    id: 7,
    title: "Монголын эзэнт гүрний бүрэлдэхүүн улсууд",
    period: "XIII–XIV зуун",
    type: "Газрын зураг / түүхэн баримт",
    icon: "🗺️",
    sourceText:
      "Монголын эзэнт гүрний өргөн уудам нутагт Юань улс, Алтан ордон, Цагадайн улс, Ил хаант улс зэрэг улс төрийн төвүүд бий болсон.",
    questions: [
      "Эдгээр улс төрийн төвүүд ямар нийтлэг гаралтай вэ?",
      "Яагаад эзэнт гүрэн олон улс төрийн төвд хуваагдсан бэ?",
      "Газрын зураг ашиглан тэдгээрийн байрлалыг харьцуул.",
    ],
    hints: [
      "Чингис хааны байгуулсан эзэнт гүрний бүтэцтэй холбон бод.",
      "Газарзүйн зайг анхаар.",
      "Дотоод улс төрийн хүчин зүйлсийг бод.",
    ],
  },
  {
    id: 8,
    title: "Умард Юань",
    period: "XIV–XVII зуун",
    type: "Бичгийн сурвалж",
    icon: "🇲🇳",
    sourceText:
      "Юань улс Хятадад ноёрхлоо алдсаны дараа Монголын улс төрийн төв эх нутагтаа шилжиж, Монголын төрийн уламжлал үргэлжилсэн.",
    questions: [
      "Юань улс Хятадад ноёрхлоо алдсанаар ямар өөрчлөлт гарсан бэ?",
      "Монголын улс төрийн төв хаашаа шилжсэн бэ?",
      "Энэ үеийг Монголын төрийн залгамж чанартай хэрхэн холбож болох вэ?",
    ],
    hints: [
      "Юань улсын өмнөх ба дараах нөхцөлийг харьцуул.",
      "Монголын эх нутгийн улс төрийг анхаар.",
      "Төрийн залгамж чанарыг тайлбарла.",
    ],
  },
];

export default function SourcesPage() {
  const [selected, setSelected] = useState<Source | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showHints, setShowHints] = useState(false);

  const currentAnswers = selected
    ? selected.questions.map((_, index) => answers[selected.id + index])
    : [];

  const completed = selected
    ? selected.questions.every(
        (_, index) =>
          answers[selected.id + index]?.trim().length > 0
      )
    : false;

  const saveAnswer = (index: number, value: string) => {
    if (!selected) return;

    setAnswers((prev) => ({
      ...prev,
      [selected.id + index]: value,
    }));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
              10-р анги · Монголын түүх
            </p>

            <h1 className="mt-1 text-xl font-black">
              🔎 Эх сурвалж шинжлэх
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

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
            СУДАЛГААНЫ УР ЧАДВАР
          </p>

          <h2 className="mt-3 text-4xl font-black sm:text-5xl">
            Эх сурвалжийг
            <span className="text-amber-400"> шинжилж суръя</span>
          </h2>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Түүхийн баримтыг уншиж, мэдээллийг ялган авч,
            асуултад хариулж, өөрийн дүгнэлтийг боловсруулах
            дадлага хийнэ.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Stat icon="📜" number="8" text="Сурвалж" />
            <Stat icon="🧠" number="24" text="Асуулт" />
            <Stat icon="🔎" number="4" text="Судлах чадвар" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Skill
            icon="📖"
            title="Унших"
            text="Сурвалжийн агуулгыг анхааралтай унших"
          />

          <Skill
            icon="🔍"
            title="Задлах"
            text="Гол мэдээлэл, баримтыг ялгах"
          />

          <Skill
            icon="🧩"
            title="Холбох"
            text="Өмнөх мэдлэгтэйгээ холбон тайлбарлах"
          />

          <Skill
            icon="💡"
            title="Дүгнэх"
            text="Өөрийн үндэслэлтэй дүгнэлт гаргах"
          />
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-black">
            📜 Сурвалжууд
          </h3>

          <p className="mt-2 text-slate-500">
            Сурвалжаа сонгоод шинжилгээний даалгаврыг ажиллаарай.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {sources.map((source) => {
            const done = source.questions.every(
              (_, index) =>
                answers[source.id + index]?.trim().length > 0
            );

            return (
              <button
                key={source.id}
                onClick={() => {
                  setSelected(source);
                  setShowHints(false);
                }}
                className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-left transition hover:-translate-y-1 hover:border-amber-400/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-3xl">
                    {source.icon}
                  </div>

                  {done && (
                    <span className="rounded-full bg-green-400/10 px-3 py-2 text-xs font-black text-green-400">
                      ✓ Дууссан
                    </span>
                  )}
                </div>

                <p className="mt-5 text-xs font-black uppercase tracking-widest text-amber-400">
                  Сурвалж {source.id}
                </p>

                <h4 className="mt-2 text-xl font-black">
                  {source.title}
                </h4>

                <p className="mt-2 text-sm text-slate-500">
                  {source.period}
                </p>

                <span className="mt-5 inline-block rounded-full bg-white/5 px-3 py-2 text-xs font-bold text-slate-400">
                  {source.type}
                </span>

                <div className="mt-5 border-t border-white/10 pt-4 text-sm font-bold text-amber-400">
                  Шинжилж эхлэх →
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/75 px-5 py-8 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <span className="rounded-full bg-amber-400/10 px-4 py-2 text-xs font-black text-amber-400">
                  СУРВАЛЖ {selected.id}
                </span>

                <h2 className="mt-4 text-3xl font-black">
                  {selected.title}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {selected.period} · {selected.type}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl"
              >
                ×
              </button>
            </div>

            <div className="mt-8 rounded-3xl border border-amber-400/20 bg-amber-400/[0.04] p-6">
              <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                СУРВАЛЖ
              </p>

              <p className="mt-4 text-lg leading-9 text-slate-200">
                {selected.sourceText}
              </p>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black">
                    🧠 Шинжилгээний асуулт
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Асуулт бүрт өөрийн үгээр хариулаарай.
                  </p>
                </div>

                <button
                  onClick={() => setShowHints(!showHints)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold"
                >
                  💡 {showHints ? "Санамж нуух" : "Санамж"}
                </button>
              </div>

              {showHints && (
                <div className="mt-5 rounded-2xl bg-cyan-400/5 p-5">
                  <p className="font-black text-cyan-400">
                    Санамж
                  </p>

                  <ul className="mt-3 space-y-2">
                    {selected.hints.map((hint) => (
                      <li
                        key={hint}
                        className="text-sm leading-6 text-slate-400"
                      >
                        • {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 space-y-6">
                {selected.questions.map((question, index) => (
                  <div
                    key={question}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <p className="font-bold leading-7">
                      <span className="mr-2 text-amber-400">
                        {index + 1}.
                      </span>

                      {question}
                    </p>

                    <textarea
                      value={answers[selected.id + index] || ""}
                      onChange={(e) =>
                        saveAnswer(index, e.target.value)
                      }
                      placeholder="Энд өөрийн хариултаа бич..."
                      className="mt-4 min-h-[120px] w-full resize-y rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm leading-7 text-white outline-none placeholder:text-slate-700 focus:border-amber-400/50"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">
                    Гүйцэтгэл
                  </span>

                  <span className="font-black text-amber-400">
                    {
                      selected.questions.filter(
                        (_, index) =>
                          answers[selected.id + index]
                            ?.trim().length > 0
                      ).length
                    }
                    /{selected.questions.length}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{
                      width: `${
                        (selected.questions.filter(
                          (_, index) =>
                            answers[selected.id + index]
                              ?.trim().length > 0
                        ).length /
                          selected.questions.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {completed && (
                <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/5 p-5">
                  <p className="font-black text-green-400">
                    ✅ Сурвалжийн бүх асуултад хариуллаа.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Одоо өөрийн хариултаа эх сурвалжийн мэдээлэлтэй
                    харьцуулж, үндэслэлтэй дүгнэлт гаргаарай.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-8 w-full rounded-2xl bg-amber-400 px-6 py-4 font-black text-slate-950"
            >
              Дуусгах
            </button>
          </div>
        </div>
      )}
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="text-2xl">{icon}</div>
      <div className="mt-3 text-2xl font-black">{number}</div>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

function Skill({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="text-3xl">{icon}</div>

      <h3 className="mt-4 font-black">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}