"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { lessons } from "../data";

type ProgressItem = {
  score: number;
  total: number;
  date: string;
};

type ProgressData = Record<string, ProgressItem>;

export default function Grade8ProgressPage() {
  const [progress, setProgress] = useState<ProgressData>({});
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const savedProgress = localStorage.getItem("history8-progress");
    const savedName = localStorage.getItem("history8-student");

    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }

    if (savedName) {
      setStudentName(savedName);
    }
  }, []);

  const completedLessons = lessons.filter(
    (lesson) => progress[lesson.id]
  );

  const totalTests = completedLessons.length;

  const totalCorrect = completedLessons.reduce(
    (sum, lesson) => sum + progress[lesson.id].score,
    0
  );

  const totalQuestions = completedLessons.reduce(
    (sum, lesson) => sum + progress[lesson.id].total,
    0
  );

  const averageScore =
    totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0;

  const bestScore =
    totalTests > 0
      ? Math.max(
          ...completedLessons.map((lesson) =>
            Math.round(
              (progress[lesson.id].score /
                progress[lesson.id].total) *
                100
            )
          )
        )
      : 0;

  const overallProgress = Math.round(
    (completedLessons.length / lessons.length) * 100
  );

  const chapterProgress = useMemo(() => {
    return ["I", "II", "III", "IV"].map((chapter) => {
      const chapterLessons = lessons.filter(
        (lesson) => lesson.chapter === chapter
      );

      const completed = chapterLessons.filter(
        (lesson) => progress[lesson.id]
      ).length;

      return {
        chapter,
        total: chapterLessons.length,
        completed,
        percent:
          chapterLessons.length > 0
            ? Math.round(
                (completed / chapterLessons.length) * 100
              )
            : 0,
      };
    });
  }, [progress]);

  function clearProgress() {
    const confirmed = window.confirm(
      "8-р ангийн бүх ахиц, оноог устгах уу?"
    );

    if (!confirmed) return;

    localStorage.removeItem("history8-progress");
    setProgress({});
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-black tracking-[0.2em] text-cyan-400">
              ТҮҮХЭЭ МЭДЬЕ
            </p>

            <h1 className="mt-1 text-xl font-bold">
              8-р анги · Миний ахиц
            </h1>
          </div>

          <Link
            href="/8"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/10"
          >
            ← 8-р анги
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* STUDENT */}
        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/50 to-indigo-950/50 p-7">
          <p className="text-sm font-bold text-cyan-400">
            СУРАГЧ
          </p>

          <h2 className="mt-2 text-3xl font-black">
            {studentName || "Сурагч"}
          </h2>

          <p className="mt-2 text-slate-400">
            8-р ангийн түүхийн хичээлийн ахиц
          </p>
        </div>

        {/* STATS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon="📚"
            value={`${completedLessons.length}/${lessons.length}`}
            label="Үзсэн хичээл"
          />

          <Stat
            icon="📝"
            value={String(totalTests)}
            label="Өгсөн тест"
          />

          <Stat
            icon="📊"
            value={`${averageScore}%`}
            label="Дундаж оноо"
          />

          <Stat
            icon="🏆"
            value={`${bestScore}%`}
            label="Хамгийн өндөр"
          />
        </div>

        {/* OVERALL */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-7">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                НИЙТ АХИЦ
              </p>

              <h2 className="mt-2 text-2xl font-black">
                8-р анги
              </h2>
            </div>

            <span className="text-3xl font-black text-cyan-400">
              {overallProgress}%
            </span>
          </div>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all"
              style={{
                width: `${overallProgress}%`,
              }}
            />
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Нийт {lessons.length} хичээлээс{" "}
            {completedLessons.length} хичээл хийсэн.
          </p>
        </section>

        {/* CHAPTERS */}
        <section className="mt-8">
          <h2 className="text-2xl font-black">
            📖 Бүлэг тус бүрийн ахиц
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {chapterProgress.map((item) => (
              <div
                key={item.chapter}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-cyan-400">
                      {item.chapter}-Р БҮЛЭГ
                    </span>

                    <p className="mt-1 text-sm text-slate-400">
                      {item.completed} / {item.total} хичээл
                    </p>
                  </div>

                  <span className="text-xl font-black">
                    {item.percent}%
                  </span>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all"
                    style={{
                      width: `${item.percent}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RESULTS */}
        <section className="mt-8">
          <h2 className="text-2xl font-black">
            📝 Хичээлүүдийн үр дүн
          </h2>

          <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            {completedLessons.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-5xl">📚</div>

                <h3 className="mt-4 text-xl font-bold">
                  Одоогоор тест өгсөн хичээл алга
                </h3>

                <p className="mt-2 text-slate-500">
                  Хичээлээ сонгоод тест өгч эхлээрэй.
                </p>

                <Link
                  href="/8"
                  className="mt-6 inline-block rounded-2xl bg-cyan-400 px-6 py-3 font-black text-slate-950"
                >
                  Хичээлүүд рүү очих →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {completedLessons.map((lesson) => {
                  const result = progress[lesson.id];

                  const percent = Math.round(
                    (result.score / result.total) * 100
                  );

                  return (
                    <Link
                      key={lesson.id}
                      href={`/8/lesson/${lesson.id}/view`}
                      className="flex flex-col gap-4 p-5 transition hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                          {lesson.icon}
                        </div>

                        <div>
                          <p className="font-bold">
                            {lesson.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {result.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="hidden w-32 sm:block">
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-cyan-400"
                              style={{
                                width: `${percent}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="min-w-[80px] text-right">
                          <span
                            className={`text-xl font-black ${
                              percent >= 80
                                ? "text-green-400"
                                : percent >= 60
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {percent}%
                          </span>

                          <p className="text-xs text-slate-500">
                            {result.score}/{result.total}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CLEAR */}
        <div className="mt-8 text-center">
          <button
            onClick={clearProgress}
            className="rounded-xl border border-red-400/20 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-400/10"
          >
            🗑️ 8-р ангийн ахиц устгах
          </button>
        </div>
      </section>
    </main>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-3xl">{icon}</div>

      <div className="mt-4 text-3xl font-black">
        {value}
      </div>

      <p className="mt-1 text-sm text-slate-500">
        {label}
      </p>
    </div>
  );
}