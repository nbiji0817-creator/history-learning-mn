"use client";

import Link from "next/link";
import type { Achievement, Lesson } from "@/types";
import { Button, Card, ProgressBar, Stat } from "@/components/ui/primitives";
import { strongTopics, useProgress, weakTopics } from "@/lib/progress";
import { useAuth, roleLabels } from "@/lib/auth";
import { cn, formatDate, levelFromXp, percent } from "@/lib/utils";

export function StudentDashboard({
  lessons,
  achievements,
}: {
  lessons: Lesson[];
  achievements: Achievement[];
}) {
  const { progress, ready, reset } = useProgress();
  const { user } = useAuth();

  if (!ready) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">Ачаалж байна…</p>
      </Card>
    );
  }

  const { level, progress: levelProgress, next } = levelFromXp(progress.xp);
  const completed = progress.completedLessonIds.length;
  const attempts = progress.quizAttempts;
  const lastAttempts = [...attempts].reverse().slice(0, 5);

  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce(
            (sum, attempt) => sum + percent(attempt.score, attempt.total),
            0,
          ) / attempts.length,
        )
      : 0;

  const weak = weakTopics(progress);
  const strong = strongTopics(progress);
  const earned = achievements.filter((item) =>
    progress.achievementIds.includes(item.id),
  );

  /* Санал болгох хичээл — дуусгаагүй эхний 3 */
  const recommended = lessons
    .filter((lesson) => !progress.completedLessonIds.includes(lesson.id))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Тойм */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="⭐" label="Нийт XP" value={progress.xp} hint={`Түвшин ${level}`} />
        <Stat icon="📚" label="Дуусгасан хичээл" value={completed} hint={`${lessons.length} хичээлээс`} />
        <Stat icon="📝" label="Өгсөн тест" value={attempts.length} hint={`Дундаж ${averageScore}%`} />
        <Stat icon="🔥" label="Дараалсан өдөр" value={progress.streak} hint="Streak" />
      </div>

      {/* Түвшин */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black">
              {user ? `${user.avatar} ${user.name}` : "🧑‍🎓 Зочин"}
            </h2>
            <p className="text-sm text-fg-muted">
              {user ? roleLabels[user.role] : "Нэвтрээгүй"}
              {user?.grade ? ` • ${user.grade}-р анги` : ""}
            </p>
          </div>
          <span className="rounded-full bg-gold/15 px-4 py-1.5 text-sm font-black text-gold">
            Түвшин {level}
          </span>
        </div>

        <div className="mt-5">
          <ProgressBar
            value={levelProgress}
            max={next}
            label={`Дараагийн түвшин хүртэл ${next - levelProgress} XP`}
          />
        </div>
      </Card>

      {/* Сул / хүчтэй сэдэв */}
      {weak.length > 0 || strong.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <h3 className="text-sm font-black text-clay">📉 Сул сэдэв</h3>
            {weak.length === 0 ? (
              <p className="mt-3 text-sm text-fg-muted">
                Одоогоор сул сэдэв илрээгүй байна.
              </p>
            ) : (
              <>
                <ul className="mt-4 space-y-3">
                  {weak.slice(0, 5).map((item) => (
                    <li key={item.topic}>
                      <ProgressBar
                        value={item.percent}
                        label={`${item.topic} (${item.total} асуулт)`}
                      />
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-xl bg-clay/10 p-3 text-sm leading-6 text-fg-muted">
                  Эдгээр сэдвийг дахин судлахыг зөвлөж байна. Хичээлээ дахин уншаад
                  тестийг давтаарай.
                </p>
              </>
            )}
          </Card>

          <Card>
            <h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              📈 Хүчтэй сэдэв
            </h3>
            {strong.length === 0 ? (
              <p className="mt-3 text-sm text-fg-muted">
                Тест өгснөөр энд харагдана.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {strong.slice(0, 5).map((item) => (
                  <li key={item.topic}>
                    <ProgressBar
                      value={item.percent}
                      label={`${item.topic} (${item.total} асуулт)`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}

      {/* Сүүлийн тестүүд */}
      <Card>
        <h3 className="text-sm font-black">Сүүлийн тестүүд</h3>
        {lastAttempts.length === 0 ? (
          <p className="mt-3 text-sm text-fg-muted">
            Одоогоор тест өгөөгүй байна.{" "}
            <Link href="/exams" className="font-bold text-gold hover:underline">
              Шалгалт өгөх →
            </Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {lastAttempts.map((attempt) => {
              const pct = percent(attempt.score, attempt.total);
              return (
                <li
                  key={attempt.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <span className="text-fg-muted">
                    {formatDate(attempt.finishedAt)}
                  </span>
                  <span>
                    {attempt.score} / {attempt.total}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold",
                      pct >= 80
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : pct >= 60
                          ? "bg-gold/15 text-gold"
                          : "bg-clay/15 text-clay",
                    )}
                  >
                    {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Санал болгох хичээл */}
      {recommended.length > 0 ? (
        <Card>
          <h3 className="text-sm font-black">Санал болгож буй хичээл</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {recommended.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.slug}`}
                className="rounded-xl border border-line p-4 transition hover:border-gold/60"
              >
                <span className="text-2xl" aria-hidden>
                  {lesson.icon}
                </span>
                <p className="mt-2 font-bold leading-tight">{lesson.title}</p>
                <p className="mt-1 text-xs text-fg-muted">
                  {lesson.grade}-р анги • {lesson.durationMinutes} мин
                </p>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Badge */}
      <Card>
        <h3 className="text-sm font-black">
          Амжилтын тэмдэг ({earned.length} / {achievements.length})
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {achievements.map((achievement) => {
            const has = progress.achievementIds.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={cn(
                  "rounded-2xl border p-4 text-center transition",
                  has ? "border-gold bg-gold/10" : "border-line opacity-50",
                )}
              >
                <div className="text-3xl" aria-hidden>
                  {achievement.icon}
                </div>
                <p className="mt-2 text-sm font-bold">{achievement.title}</p>
                <p className="mt-1 text-xs leading-5 text-fg-muted">
                  {has ? achievement.description : achievement.requirement}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={reset}>
          Ахицыг цэвэрлэх
        </Button>
        <p className="self-center text-xs text-fg-muted">
          Ахиц одоогоор энэ браузерт хадгалагдаж байна. Supabase холбогдсоны
          дараа бүх төхөөрөмжид синк хийгдэнэ.
        </p>
      </div>
    </div>
  );
}
