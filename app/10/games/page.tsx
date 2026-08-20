"use client";

import Link from "next/link";
import { useState } from "react";

const questions = [
  {
    question: "1206 онд болсон гол үйл явдал аль вэ?",
    options: [
      "Хүннү улс байгуулагдсан",
      "Тэмүжин Чингис хаанаар өргөмжлөгдсөн",
      "Юань улс байгуулагдсан",
      "Манжид дагаар орсон",
    ],
    answer: 1,
  },
  {
    question: "Неолитын хувьсгалын гол өөрчлөлт юу байсан бэ?",
    options: [
      "Үйлдвэрлэх аж ахуй үүссэн",
      "Төмөрлөгийн үйлдвэр бий болсон",
      "Компьютер бий болсон",
      "Далайн худалдаа зогссон",
    ],
    answer: 0,
  },
  {
    question: "Хүннүгийн төрийн дээд эрх баригчийн цол?",
    options: ["Хаан", "Шаньюй", "Султан", "Ноён"],
    answer: 1,
  },
  {
    question: "Хүрэл нь ямар металлын хайлш вэ?",
    options: [
      "Төмөр ба алт",
      "Зэс ба цагаан тугалга",
      "Мөнгө ба алт",
      "Төмөр ба зэс",
    ],
    answer: 1,
  },
  {
    question: "Их Монгол улсын дараах томоохон улс аль нь вэ?",
    options: [
      "Ил хаант улс",
      "Ромын эзэнт улс",
      "Египет",
      "Македон",
    ],
    answer: 0,
  },
  {
    question: "Чингис хаан овог, аймгийн хуучин тогтолцоог халж ямар систем бий болгосон бэ?",
    options: [
      "Хотын систем",
      "Мянгатын систем",
      "Тариалангийн систем",
      "Далайн систем",
    ],
    answer: 1,
  },
  {
    question: "Монголын эзэнт гүрний Хятадад төвлөрсөн улс аль нь вэ?",
    options: ["Алтан ордон", "Цагадайн улс", "Юань улс", "Ил хаант улс"],
    answer: 2,
  },
  {
    question: "Монголын уламжлалт үндсэн аж ахуй аль нь вэ?",
    options: [
      "Нүүдлийн мал аж ахуй",
      "Үйлдвэрлэл",
      "Далайн худалдаа",
      "Автомашины үйлдвэрлэл",
    ],
    answer: 0,
  },
];

export default function GamesPage() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const question = questions[current];

  const chooseAnswer = (index: number) => {
    if (selected !== null) return;

    setSelected(index);

    if (index === question.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const next = () => {
    if (selected === null) return;

    if (current === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrent((prev) => prev + 1);
    setSelected(null);
  };

  const restart = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  };

  if (finished) {
    const percent = Math.round((score / questions.length) * 100);

    return (
      <main className="min-h-screen bg-slate-950 px-5 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/10"
            className="inline-block rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold"
          >
            ← 10-р анги
          </Link>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <div className="text-7xl">
              {percent >= 80 ? "🏆" : percent >= 60 ? "🌟" : "📚"}
            </div>

            <p className="mt-5 text-sm font-black uppercase tracking-[0.3em] text-amber-400">
              Тоглоом дууслаа
            </p>

            <h1 className="mt-3 text-4xl font-black">
              {score} / {questions.length}
            </h1>

            <div className="mx-auto mt-6 h-4 max-w-md overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>

            <p className="mt-4 text-xl font-bold">
              {percent}%
            </p>

            <p className="mt-3 text-slate-400">
              {percent >= 80
                ? "Түүхийн мэдлэг маш сайн байна! 🎉"
                : percent >= 60
                ? "Сайн байна. Дахиад нэг тоглоод үзээрэй!"
                : "Хичээлээ дахин судлаад тоглоомоо давтаарай."}
            </p>

            <button
              onClick={restart}
              className="mt-8 rounded-2xl bg-amber-400 px-8 py-4 font-black text-slate-950"
            >
              🔄 Дахин тоглох
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-4xl px-5 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
                10-р анги
              </p>

              <h1 className="mt-1 text-2xl font-black">
                🎮 Түүхийн сорилт
              </h1>
            </div>

            <Link
              href="/10"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold"
            >
              ← Буцах
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="mb-6 flex items-center justify-between">
          <span className="rounded-full bg-amber-400/10 px-4 py-2 text-sm font-black text-amber-400">
            Асуулт {current + 1}/{questions.length}
          </span>

          <span className="font-bold text-slate-400">
            Оноо: {score}
          </span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 sm:p-10">
          <div className="mb-8">
            <div className="mb-4 text-5xl">🧠</div>

            <h2 className="text-2xl font-black leading-relaxed sm:text-3xl">
              {question.question}
            </h2>
          </div>

          <div className="grid gap-4">
            {question.options.map((option, index) => {
              let style =
                "border-white/10 bg-slate-900 hover:border-amber-400/50";

              if (selected !== null) {
                if (index === question.answer) {
                  style =
                    "border-green-400 bg-green-400/10 text-green-300";
                } else if (index === selected) {
                  style =
                    "border-red-400 bg-red-400/10 text-red-300";
                }
              }

              return (
                <button
                  key={option}
                  onClick={() => chooseAnswer(index)}
                  className={`flex items-center gap-4 rounded-2xl border p-5 text-left font-bold transition ${style}`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="flex-1">
                    {option}
                  </span>

                  {selected !== null &&
                    index === question.answer && (
                      <span className="text-xl">✓</span>
                    )}

                  {selected === index &&
                    index !== question.answer && (
                      <span className="text-xl">✗</span>
                    )}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div
              className={`mt-6 rounded-2xl p-5 ${
                selected === question.answer
                  ? "bg-green-400/10 text-green-300"
                  : "bg-red-400/10 text-red-300"
              }`}
            >
              <p className="font-black">
                {selected === question.answer
                  ? "🎉 Зөв хариуллаа!"
                  : "❌ Буруу хариулт"}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Зөв хариулт:{" "}
                <span className="font-bold text-white">
                  {question.options[question.answer]}
                </span>
              </p>
            </div>
          )}

          <button
            onClick={next}
            disabled={selected === null}
            className="mt-8 w-full rounded-2xl bg-amber-400 px-6 py-4 font-black text-slate-950 disabled:opacity-30"
          >
            {current === questions.length - 1
              ? "🏁 Үр дүн харах"
              : "Дараагийн асуулт →"}
          </button>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-amber-400 transition-all"
            style={{
              width: `${((current + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </main>
  );
}