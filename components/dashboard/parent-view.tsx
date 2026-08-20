"use client";

import Link from "next/link";
import type { Announcement, Lesson } from "@/types";
import { Card, ProgressBar, Stat } from "@/components/ui/primitives";
import { useProgress, weakTopics } from "@/lib/progress";
import { formatDate, levelFromXp, percent } from "@/lib/utils";

export function ParentView({
  lessons,
  announcements,
}: {
  lessons: Lesson[];
  announcements: Announcement[];
}) {
  const { progress, ready } = useProgress();

  if (!ready) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">Ачаалж байна…</p>
      </Card>
    );
  }

  const { level } = levelFromXp(progress.xp);
  const attempts = progress.quizAttempts;
  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce(
            (sum, attempt) => sum + percent(attempt.score, attempt.total),
            0,
          ) / attempts.length,
        )
      : 0;

  const completedLessons = lessons.filter((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  );
  const weak = weakTopics(progress);
  const overall = percent(progress.completedLessonIds.length, lessons.length);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="📚" label="Дуусгасан хичээл" value={completedLessons.length} hint={`${lessons.length} хичээлээс`} />
        <Stat icon="📝" label="Өгсөн тест" value={attempts.length} hint={`Дундаж ${averageScore}%`} />
        <Stat icon="⭐" label="Түвшин" value={level} hint={`${progress.xp} XP`} />
        <Stat icon="🎮" label="Тоглосон тоглоом" value={progress.gameScores.length} />
      </div>

      <Card>
        <h2 className="text-sm font-black">Ерөнхий гүйцэтгэл</h2>
        <div className="mt-4">
          <ProgressBar value={overall} label="Хичээлийн явц" />
        </div>
        <p className="mt-4 text-sm leading-7 text-fg-muted">
          {overall >= 70
            ? "Хүүхэд тогтмол суралцаж байна. Ийм хэвээр дэмжээрэй."
            : overall >= 30
              ? "Тогтмол суралцаж эхэлсэн байна. Өдөрт 20–30 минут тогтмол хуваарилвал үр дүн тод харагдана."
              : "Суралцалт дөнгөж эхэлж байна. Хүүхэдтэйгээ хамт эхний хичээлийг үзэж үзээрэй."}
        </p>
      </Card>

      {completedLessons.length > 0 ? (
        <Card>
          <h2 className="text-sm font-black">Үзсэн хичээлүүд</h2>
          <ul className="mt-4 divide-y divide-line">
            {completedLessons.slice(-8).reverse().map((lesson) => (
              <li key={lesson.id} className="flex items-center gap-3 py-3 text-sm">
                <span aria-hidden>{lesson.icon}</span>
                <span className="flex-1">{lesson.title}</span>
                <span className="text-xs text-fg-muted">
                  {lesson.grade}-р анги
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {weak.length > 0 ? (
        <Card>
          <h2 className="text-sm font-black text-clay">Анхаарах сэдэв</h2>
          <ul className="mt-4 space-y-3">
            {weak.slice(0, 5).map((item) => (
              <li key={item.topic}>
                <ProgressBar value={item.percent} label={item.topic} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-7 text-fg-muted">
            Эдгээр сэдвээр хүүхэдтэйгээ хамт давтвал үр дүнтэй. Хичээл бүрийн
            төгсгөлд тест байгаа тул давтсаныхаа дараа шалгаж болно.
          </p>
        </Card>
      ) : null}

      <Card>
        <h2 className="text-sm font-black">Системийн мэдээ</h2>
        <ul className="mt-4 space-y-4">
          {announcements.slice(0, 4).map((item) => (
            <li key={item.id} className="rounded-xl bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <span aria-hidden>{item.icon}</span>
                {item.title}
              </div>
              <p className="mt-1.5 text-sm leading-6 text-fg-muted">{item.body}</p>
              <p className="mt-2 text-xs text-fg-muted">
                {formatDate(item.publishedAt)} • {item.author}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="bg-gold/10">
        <h2 className="text-sm font-black">Санал хүсэлт</h2>
        <p className="mt-3 text-sm leading-7 text-fg-muted">
          Эцэг эх системийн агуулгыг засах эрхгүй боловч санал хүсэлтээ илгээх
          боломжтой. Таны санал системийг сайжруулахад шууд нөлөөлнө.
        </p>
        <Link
          href="/feedback"
          className="mt-5 inline-flex rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-[#1c1a17]"
        >
          Санал хүсэлт илгээх
        </Link>
      </Card>

      <p className="text-xs leading-6 text-fg-muted">
        Демо хувилбарт харагдаж буй ахиц нь энэ браузерын өгөгдөл юм. Бодит
        хувилбарт эцэг эх зөвхөн өөрийн холбогдсон хүүхдийн мэдээллийг
        Supabase RLS-ээр хамгаалагдсан байдлаар харна.
      </p>
    </div>
  );
}
