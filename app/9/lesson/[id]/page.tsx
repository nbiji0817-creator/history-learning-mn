import Link from "next/link";
import { lessons } from "../../data";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lesson = lessons.find((item) => item.id === id);

  if (!lesson) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <h1 className="text-3xl font-black text-red-400">
          Хичээл олдсонгүй
        </h1>

        <Link
          href="/9"
          className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
        >
          ← 9-р анги руу буцах
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-cyan-400">
              ТҮҮХЭЭ МЭДЬЕ
            </p>

            <p className="text-xs text-slate-500">
              9-р анги · {lesson.chapter}-р бүлэг
            </p>
          </div>

          <Link
            href="/9"
            className="rounded-xl border border-white/10 px-4 py-2 font-semibold transition hover:bg-white/10"
          >
            ← 9-р анги
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-8 sm:p-12">
          {/* TITLE */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold uppercase tracking-[0.2em] text-cyan-400">
                {lesson.chapter}-Р БҮЛЭГ
              </p>

              <h1 className="mt-4 text-4xl font-black sm:text-5xl">
                {lesson.title}
              </h1>

              <p className="mt-4 text-slate-400">
                Сурах бичгийн хуудас: {lesson.pages}
              </p>
            </div>

            <div className="text-7xl">
              {lesson.icon}
            </div>
          </div>

          {/* SUMMARY */}
          <div className="mt-10 rounded-2xl bg-white/5 p-6">
            <h2 className="text-2xl font-bold text-cyan-400">
              📖 Хичээлийн агуулга
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-300">
              {lesson.summary}
            </p>
          </div>

          {/* KEY POINTS */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold">
              🎯 Гол ойлголтууд
            </h2>

            <div className="mt-5 space-y-3">
              {lesson.keyPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex gap-4 rounded-2xl bg-white/5 p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400 font-bold text-slate-950">
                    {index + 1}
                  </span>

                  <p className="leading-7 text-slate-300">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* QUIZ INFO */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black">
                  🧠 Өөрийгөө шалгая
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Энэ хичээлээр {lesson.questions.length} асуулттай
                  тест ажиллана.
                </p>
              </div>

              <div className="rounded-xl bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300">
                {lesson.questions.length} асуулт
              </div>
            </div>
          </div>

          {/* START BUTTON */}
          <Link
            href={`/9/lesson/${lesson.id}/view`}
            className="mt-10 inline-flex rounded-2xl bg-cyan-400 px-8 py-4 font-black text-slate-950 transition hover:bg-cyan-300"
          >
            📚 Хичээл үзэж эхлэх →
          </Link>
        </div>
      </section>
    </main>
  );
}