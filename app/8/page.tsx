import Link from "next/link";
import { chapters, lessons } from "./data";

export default function Grade8Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <section className="border-b border-white/10 bg-gradient-to-br from-indigo-950 via-slate-950 to-cyan-950">
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
                8-р анги · Шинэ үеийн түүх
              </div>

              <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
                Монгол ба дэлхийн шинэ үеийн түүх
              </h1>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                XV–XX зууны эхэн үеийн Монгол болон дэлхийн түүхийг
                бүлэг, сэдвээр дарааллаар нь судлах интерактив хичээл.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat value={String(lessons.length)} label="Хичээл" />
              <Stat value={String(chapters.length)} label="Бүлэг" />
            </div>
          </div>
        </div>
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
                {/* Chapter title */}
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

                {/* Lessons */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {chapterLessons.map((lesson, index) => (
                    <Link
                      key={lesson.id}
                      href={`/8/lesson/${lesson.id}`}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.08]"
                    >
                      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl transition group-hover:bg-cyan-400/20" />

                      <div className="relative">
                        <div className="mb-5 flex items-start justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-2xl ring-1 ring-white/10">
                            {lesson.icon}
                          </div>

                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-400">
                            {lesson.pages}
                          </span>
                        </div>

                        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                          Хичээл {index + 1}
                        </div>

                        <h3 className="min-h-[60px] text-lg font-bold leading-7 text-white">
                          {lesson.title}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                          {lesson.summary}
                        </p>

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
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  );
}