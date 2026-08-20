import Link from "next/link";
import { chapters, lessons } from "./data";

export default function Grade9Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <section className="border-b border-white/10 bg-gradient-to-br from-violet-950 via-slate-950 to-cyan-950">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            ← Нүүр хуудас
          </Link>

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-300">
                9-р анги · Монголын орчин үеийн түүх
              </div>

              <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
                Орчин үеийн Монголын түүх
              </h1>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                1911 оноос өнөө үе хүртэлх Монголын улс төр,
                нийгэм, эдийн засаг, соёл болон дэлхийн түүхтэй
                холбогдох үйл явдлуудыг бүлэг, сэдвээр судална.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat
                value={String(lessons.length)}
                label="Хичээл"
              />

              <Stat
                value={String(chapters.length)}
                label="Бүлэг"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PROGRESS BUTTON */}
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <Link
          href="/9/progress"
          className="inline-flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-6 py-4 font-bold text-cyan-300 transition hover:bg-cyan-400/20"
        >
          📊 Миний ахиц
          <span>→</span>
        </Link>
      </section>

      {/* CHAPTERS */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="space-y-12">
          {chapters.map((chapter) => {
            const chapterLessons = lessons.filter(
              (lesson) => lesson.chapter === chapter.id
            );

            return (
              <section key={chapter.id}>
                {/* CHAPTER HEADER */}
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-black ring-1 ring-white/10">
                    {chapter.id}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                      {chapterLessons.length} хичээл
                    </p>

                    <h2 className="text-2xl font-bold md:text-3xl">
                      {chapter.title}
                    </h2>
                  </div>
                </div>

                {/* LESSON CARDS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {chapterLessons.map((lesson, index) => (
                    <Link
                      key={lesson.id}
                      href={`/9/lesson/${lesson.id}`}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.08]"
                    >
                      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl transition group-hover:bg-cyan-400/20" />

                      <div className="relative">
                        {/* ICON + PAGE */}
                        <div className="mb-5 flex items-start justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-2xl ring-1 ring-white/10">
                            {lesson.icon}
                          </div>

                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-400">
                            хуудас {lesson.pages}
                          </span>
                        </div>

                        {/* LESSON NUMBER */}
                        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                          Хичээл {index + 1}
                        </div>

                        {/* TITLE */}
                        <h3 className="min-h-[60px] text-lg font-bold leading-7 text-white">
                          {lesson.title}
                        </h3>

                        {/* SUMMARY */}
                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-400">
                          {lesson.summary}
                        </p>

                        {/* FOOTER */}
                        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                          <span className="text-xs text-slate-500">
                            {lesson.questions.length} тест
                          </span>

                          <span className="text-sm font-bold text-cyan-400 transition group-hover:translate-x-1">
                            Судлах →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-slate-600">
          © 2026 ТҮҮХЭЭ МЭДЬЕ · 9-р анги
        </div>
      </footer>
    </main>
  );
}

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="min-w-[110px] rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center backdrop-blur">
      <div className="text-2xl font-black">{value}</div>

      <div className="mt-1 text-xs text-slate-400">
        {label}
      </div>
    </div>
  );
}