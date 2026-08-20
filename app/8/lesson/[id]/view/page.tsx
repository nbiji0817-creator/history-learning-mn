"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { lessons } from "../../../data";

export default function LessonView() {
  const params = useParams();
  const id = String(params.id);

  const lessonIndex = lessons.findIndex(
    (lesson) => lesson.id === id
  );

  const lesson = lessons[lessonIndex];

  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (!lesson) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <h1 className="text-3xl font-black text-red-400">
          Хичээл олдсонгүй
        </h1>

        <Link
          href="/8"
          className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
        >
          ← 8-р анги
        </Link>
      </main>
    );
  }

  const score = lesson.questions.reduce(
    (total, question, index) =>
      total + (selected[index] === question.correct ? 1 : 0),
    0
  );

  const allAnswered =
    selected.length === lesson.questions.length &&
    selected.every((answer) => answer !== undefined);

  function chooseAnswer(
    questionIndex: number,
    optionIndex: number
  ) {
    if (submitted) return;

    const answers = [...selected];
    answers[questionIndex] = optionIndex;

    setSelected(answers);
  }

  function submitTest() {
    if (!allAnswered) {
      alert("Бүх асуултад хариулна уу.");
      return;
    }

    setSubmitted(true);

    setTimeout(() => {
      document
        .getElementById("test-result")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  }

  function resetTest() {
    setSelected([]);
    setSubmitted(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const previousLesson =
    lessonIndex > 0
      ? lessons[lessonIndex - 1]
      : null;

  const nextLesson =
    lessonIndex < lessons.length - 1
      ? lessons[lessonIndex + 1]
      : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-cyan-400">
              ТҮҮХЭЭ МЭДЬЕ
            </p>

            <p className="text-xs text-slate-500">
              8-р анги · {lesson.chapter}-р бүлэг
            </p>
          </div>

          <Link
            href="/8"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            ← Хичээлүүд
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        {/* LESSON HEADER */}
        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-950/40 via-white/5 to-indigo-950/30 p-8 sm:p-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold uppercase tracking-[0.25em] text-cyan-400">
                {lesson.chapter}-Р БҮЛЭГ
              </p>

              <h1 className="mt-4 text-4xl font-black sm:text-6xl">
                {lesson.title}
              </h1>

              <p className="mt-4 text-slate-400">
                Сурах бичгийн хуудас: {lesson.pages}
              </p>
            </div>

            <div className="text-7xl sm:text-8xl">
              {lesson.icon}
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <section className="mt-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              ХИЧЭЭЛИЙН АГУУЛГА
            </p>

            <h2 className="mt-2 text-3xl font-black">
              📖 Гол агуулга
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              {lesson.summary}
            </p>
          </div>
        </section>

        {/* KEY POINTS */}
        <section className="mt-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              СУРАХ ЗҮЙЛС
            </p>

            <h2 className="mt-2 text-3xl font-black">
              🎯 Гол ойлголтууд
            </h2>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {lesson.keyPoints.map((point, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
                >
                  <div className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400 font-black text-slate-950">
                      {index + 1}
                    </span>

                    <p className="leading-7 text-slate-300">
                      {point}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* QUIZ */}
        <section className="mt-8">
          <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              ӨӨРИЙГӨӨ ШАЛГАЯ
            </p>

            <h2 className="mt-2 text-3xl font-black">
              🧠 Мэдлэгээ шалгах тест
            </h2>

            <p className="mt-3 text-slate-400">
              Нийт {lesson.questions.length} асуулт.
              Бүх асуултад хариулаад хариугаа шалгана уу.
            </p>

            <div className="mt-8 space-y-6">
              {lesson.questions.map(
                (question, questionIndex) => (
                  <div
                    key={question.question}
                    className="rounded-2xl border border-white/10 bg-slate-900/50 p-5"
                  >
                    <div className="flex gap-3">
                      <span className="font-black text-cyan-400">
                        {questionIndex + 1}.
                      </span>

                      <h3 className="font-bold leading-7">
                        {question.question}
                      </h3>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {question.options.map(
                        (option, optionIndex) => {
                          const isSelected =
                            selected[questionIndex] ===
                            optionIndex;

                          const isCorrect =
                            submitted &&
                            optionIndex ===
                              question.correct;

                          const isWrong =
                            submitted &&
                            isSelected &&
                            optionIndex !==
                              question.correct;

                          return (
                            <button
                              key={option}
                              type="button"
                              disabled={submitted}
                              onClick={() =>
                                chooseAnswer(
                                  questionIndex,
                                  optionIndex
                                )
                              }
                              className={`
                                rounded-xl border px-4 py-4
                                text-left font-medium
                                transition
                                ${
                                  isCorrect
                                    ? "border-green-400 bg-green-400/15 text-green-300"
                                    : isWrong
                                    ? "border-red-400 bg-red-400/15 text-red-300"
                                    : isSelected
                                    ? "border-cyan-400 bg-cyan-400/15 text-cyan-300"
                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                }
                              `}
                            >
                              <span className="mr-2 font-black">
                                {String.fromCharCode(
                                  65 + optionIndex
                                )}
                                .
                              </span>

                              {option}

                              {isCorrect && (
                                <span className="ml-2 font-bold">
                                  ✓ Зөв
                                </span>
                              )}

                              {isWrong && (
                                <span className="ml-2 font-bold">
                                  ✗ Буруу
                                </span>
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* SUBMIT */}
            <div className="mt-8">
              {!submitted ? (
                <button
                  type="button"
                  onClick={submitTest}
                  className="rounded-2xl bg-cyan-400 px-8 py-4 font-black text-slate-950 transition hover:bg-cyan-300"
                >
                  ✅ Хариугаа шалгах
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetTest}
                  className="rounded-2xl bg-cyan-400 px-8 py-4 font-black text-slate-950 transition hover:bg-cyan-300"
                >
                  🔄 Дахин өгөх
                </button>
              )}
            </div>

            {/* RESULT */}
            {submitted && (
              <div
                id="test-result"
                className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-8"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  ТЕСТИЙН ҮР ДҮН
                </p>

                <div className="mt-3 flex items-end gap-4">
                  <h3 className="text-5xl font-black">
                    {score}
                  </h3>

                  <span className="pb-1 text-xl text-slate-400">
                    / {lesson.questions.length}
                  </span>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all"
                    style={{
                      width: `${
                        (score /
                          lesson.questions.length) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <p className="mt-5 text-lg text-slate-300">
                  {score === lesson.questions.length
                    ? "🎉 Маш сайн! Бүх асуултад зөв хариуллаа."
                    : score >= 4
                    ? "👏 Маш сайн байна. Хичээлийн агуулгыг сайн ойлгожээ."
                    : score >= 3
                    ? "👍 Сайн байна. Зарим хэсгийг дахин давтаарай."
                    : "📚 Хичээлийн агуулгаа дахин уншаад тестээ дахин өгөөрэй."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* PREVIOUS / NEXT */}
        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {previousLesson ? (
              <Link
                href={`/8/lesson/${previousLesson.id}/view`}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold transition hover:bg-white/10"
              >
                ← {previousLesson.title}
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/8/lesson/${nextLesson.id}/view`}
                className="rounded-2xl bg-cyan-400 px-6 py-4 font-black text-slate-950 transition hover:bg-cyan-300"
              >
                {nextLesson.title} →
              </Link>
            ) : (
              <Link
                href="/8"
                className="rounded-2xl bg-cyan-400 px-6 py-4 font-black text-slate-950 transition hover:bg-cyan-300"
              >
                🎉 8-р анги дуусгах
              </Link>
            )}
          </div>
        </section>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-slate-600">
          © 2026 ТҮҮХЭЭ МЭДЬЕ · 8-р анги
        </div>
      </footer>
    </main>
  );
}
