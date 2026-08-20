"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  Announcement,
  Exam,
  Feedback,
  Game,
  Lesson,
  Question,
  User,
  UserRole,
} from "@/types";
import { Button, Card, Stat } from "@/components/ui/primitives";
import { roleLabels } from "@/lib/auth";
import { cn, difficultyLabels, formatDate, questionTypeLabels } from "@/lib/utils";

interface Stats {
  lessons: number;
  questions: number;
  quizzes: number;
  exams: number;
  games: number;
  figures: number;
  events: number;
  sources: number;
  terms: number;
  users: number;
  feedback: number;
  unresolvedFeedback: number;
}

type Tab = "overview" | "lessons" | "questions" | "users" | "feedback" | "news";

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: "overview", label: "Тойм", icon: "📊" },
  { key: "lessons", label: "Хичээл", icon: "📚" },
  { key: "questions", label: "Асуултын сан", icon: "❓" },
  { key: "users", label: "Хэрэглэгч", icon: "👥" },
  { key: "feedback", label: "Санал хүсэлт", icon: "💬" },
  { key: "news", label: "Мэдээ", icon: "📰" },
];

export interface DbStatusProps {
  configured: boolean;
  connected: boolean;
  seeded: boolean;
  lessonCount: number;
  message: string;
}

export function AdminPanel({
  stats,
  lessons,
  questions,
  games,
  exams,
  feedback,
  users,
  announcements,
  dbStatus,
  currentUser,
}: {
  stats: Stats;
  lessons: Lesson[];
  questions: Question[];
  games: Game[];
  exams: Exam[];
  feedback: Feedback[];
  users: User[];
  announcements: Announcement[];
  dbStatus: DbStatusProps;
  currentUser: { name: string; role: UserRole; email: string };
}) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-fg-muted">
          Нэвтэрсэн: <b>{currentUser.name}</b> ({roleLabels[currentUser.role]}) ·{" "}
          {currentUser.email}
        </p>
      </div>

      <DbStatusBanner status={dbStatus} />

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold transition",
              tab === item.key
                ? "bg-gold text-[#1c1a17]"
                : "bg-muted text-fg-muted hover:text-fg",
            )}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <OverviewTab stats={stats} games={games} exams={exams} lessons={lessons} />
      ) : null}
      {tab === "lessons" ? <LessonsTab lessons={lessons} /> : null}
      {tab === "questions" ? <QuestionsTab questions={questions} /> : null}
      {tab === "users" ? <UsersTab users={users} /> : null}
      {tab === "feedback" ? <FeedbackTab feedback={feedback} /> : null}
      {tab === "news" ? <NewsTab announcements={announcements} /> : null}

      <Card className="bg-muted/40">
        <h3 className="text-sm font-black">✍️ Агуулга нэмэх, засах</h3>
        <p className="mt-3 text-sm leading-7 text-fg-muted">
          Phase 1-д агуулга нь кодын доторх өгөгдлийн файлд байна
          (<code>data/lessons/</code>, <code>data/questions.ts</code>).
          Supabase холбогдсоны дараа энэ хэсгээс шууд хичээл нэмэх, засах,
          устгах, AI-аар тест үүсгэх боломж нээгдэнэ.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["+ Хичээл нэмэх", "+ Тест үүсгэх", "🤖 AI-аар тест үүсгэх", "🤖 AI-аар хичээл боловсруулах"].map(
            (label) => (
              <span
                key={label}
                className="cursor-not-allowed rounded-xl border border-dashed border-line px-4 py-2 text-sm text-fg-muted"
                title="Phase 9 — Admin CMS"
              >
                {label}
              </span>
            ),
          )}
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────  Өгөгдлийн сангийн төлөв  ───────────────────────── */

function DbStatusBanner({ status }: { status: DbStatusProps }) {
  const state = status.seeded
    ? {
        tone: "border-emerald-500/40 bg-emerald-500/10",
        icon: "🟢",
        label: "Supabase холбогдсон",
        detail: `Систем өгөгдлийг Supabase-аас уншиж байна (${status.lessonCount} хичээл).`,
      }
    : status.connected
      ? {
          tone: "border-gold/40 bg-gold/10",
          icon: "🟡",
          label: "Холбогдсон, гэхдээ хоосон",
          detail: status.message,
        }
      : status.configured
        ? {
            tone: "border-clay/40 bg-clay/10",
            icon: "🟠",
            label: "Тохируулсан, гэхдээ бэлэн биш",
            detail: status.message,
          }
        : {
            tone: "border-line bg-muted/50",
            icon: "⚪",
            label: "Демо горим",
            detail: status.message,
          };

  return (
    <div className={cn("rounded-2xl border p-5", state.tone)}>
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden>{state.icon}</span>
        <h3 className="text-sm font-black">{state.label}</h3>
        {!status.seeded ? (
          <span className="rounded-full bg-surface/70 px-2.5 py-0.5 text-[11px] font-semibold">
            Одоо локал өгөгдөл ашиглаж байна
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm leading-7 text-fg-muted">{state.detail}</p>

      {status.configured && !status.seeded ? (
        <ol className="mt-4 space-y-1.5 text-sm text-fg-muted">
          <li>
            1. <code className="rounded bg-surface px-1.5 py-0.5">supabase/migrations/</code>{" "}
            доторх 3 SQL файлыг дарааллаар нь Supabase SQL Editor дээр ажиллуулна
          </li>
          <li>
            2. <code className="rounded bg-surface px-1.5 py-0.5">.env.local</code>-д{" "}
            <code className="rounded bg-surface px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            болон <code className="rounded bg-surface px-1.5 py-0.5">SEED_SECRET</code> нэмнэ
          </li>
          <li>
            3. Dev серверээ дахин асаагаад{" "}
            <code className="rounded bg-surface px-1.5 py-0.5">
              POST /api/admin/seed
            </code>{" "}
            дуудна
          </li>
        </ol>
      ) : null}

      <p className="mt-3 text-xs text-fg-muted">
        Дэлгэрэнгүй төлөв:{" "}
        <Link href="/api/health" className="font-bold text-gold hover:underline">
          /api/health
        </Link>
      </p>
    </div>
  );
}

/* ─────────────────────────  Табууд  ───────────────────────── */

function OverviewTab({
  stats,
  games,
  exams,
  lessons,
}: {
  stats: Stats;
  games: Game[];
  exams: Exam[];
  lessons: Lesson[];
}) {
  const byGrade = useMemo(() => {
    const map: Record<number, number> = {};
    for (const lesson of lessons) {
      map[lesson.grade] = (map[lesson.grade] ?? 0) + 1;
    }
    return Object.entries(map).sort(([a], [b]) => Number(a) - Number(b));
  }, [lessons]);

  const max = Math.max(1, ...byGrade.map(([, count]) => count));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="📚" label="Хичээл" value={stats.lessons} />
        <Stat icon="❓" label="Асуулт" value={stats.questions} />
        <Stat icon="📝" label="Шалгалт" value={stats.exams} />
        <Stat icon="🎮" label="Тоглоом" value={stats.games} />
        <Stat icon="👑" label="Түүхэн хүн" value={stats.figures} />
        <Stat icon="📌" label="Үйл явдал" value={stats.events} />
        <Stat icon="📜" label="Эх сурвалж" value={stats.sources} />
        <Stat icon="📖" label="Нэр томьёо" value={stats.terms} />
      </div>

      <Card>
        <h3 className="text-sm font-black">Ангиар хичээлийн тоо</h3>
        <div className="mt-5 space-y-3">
          {byGrade.map(([grade, count]) => (
            <div key={grade} className="flex items-center gap-3">
              <span className="w-16 text-sm font-semibold">{grade}-р анги</span>
              <div className="h-6 flex-1 overflow-hidden rounded-lg bg-muted">
                <div
                  className="flex h-full items-center justify-end rounded-lg bg-gold px-2 text-xs font-bold text-[#1c1a17]"
                  style={{ width: `${(count / max) * 100}%` }}
                >
                  {count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <h3 className="text-sm font-black">Тоглоомын төлөв</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {games.map((game) => (
              <li key={game.slug} className="flex items-center justify-between">
                <span>
                  {game.icon} {game.title}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-bold",
                    game.playable
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-muted text-fg-muted",
                  )}
                >
                  {game.playable ? "Идэвхтэй" : "Бэлтгэж байна"}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="text-sm font-black">Шалгалтууд</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {exams.map((exam) => (
              <li key={exam.slug} className="flex items-center justify-between gap-3">
                <span className="truncate">
                  {exam.icon} {exam.title}
                </span>
                <span className="shrink-0 text-xs text-fg-muted">
                  {exam.questionCount} асуулт
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function LessonsTab({ lessons }: { lessons: Lesson[] }) {
  const [grade, setGrade] = useState<number | "all">("all");
  const filtered =
    grade === "all" ? lessons : lessons.filter((lesson) => lesson.grade === grade);

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setGrade("all")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-semibold",
            grade === "all" ? "border-gold bg-gold/15 text-gold" : "border-line",
          )}
        >
          Бүгд
        </button>
        {[6, 7, 8, 9, 10, 11, 12].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setGrade(item)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold",
              grade === item ? "border-gold bg-gold/15 text-gold" : "border-line",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="scroll-x mt-5">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-fg-muted">
            <tr>
              <th className="py-2 pr-3">Анги</th>
              <th className="py-2 pr-3">#</th>
              <th className="py-2 pr-3">Гарчиг</th>
              <th className="py-2 pr-3">Хэсэг</th>
              <th className="py-2 pr-3">Тест</th>
              <th className="py-2 pr-3">Төлөв</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((lesson) => (
              <tr key={lesson.id}>
                <td className="py-2.5 pr-3">{lesson.grade}</td>
                <td className="py-2.5 pr-3">{lesson.order}</td>
                <td className="py-2.5 pr-3">
                  <Link
                    href={`/lessons/${lesson.slug}`}
                    className="font-medium hover:text-gold"
                  >
                    {lesson.icon} {lesson.title}
                  </Link>
                </td>
                <td className="py-2.5 pr-3">{lesson.sections.length}</td>
                <td className="py-2.5 pr-3">{lesson.quizId ? "✓" : "—"}</td>
                <td className="py-2.5 pr-3">
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Нийтэлсэн
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function QuestionsTab({ questions }: { questions: Question[] }) {
  const [query, setQuery] = useState("");
  const filtered = questions.filter((question) =>
    `${question.prompt} ${question.topic} ${question.tags.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <Card>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Асуулт хайх…"
        className="w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
        aria-label="Асуулт хайх"
      />

      <p className="mt-3 text-xs text-fg-muted">{filtered.length} асуулт</p>

      <div className="scroll-x mt-5">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-fg-muted">
            <tr>
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">Анги</th>
              <th className="py-2 pr-3">Сэдэв</th>
              <th className="py-2 pr-3">Төрөл</th>
              <th className="py-2 pr-3">Түвшин</th>
              <th className="py-2 pr-3">Асуулт</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.slice(0, 60).map((question) => (
              <tr key={question.id}>
                <td className="py-2.5 pr-3 font-mono text-xs">{question.id}</td>
                <td className="py-2.5 pr-3">{question.grade ?? "—"}</td>
                <td className="py-2.5 pr-3">{question.topic}</td>
                <td className="py-2.5 pr-3 text-xs">
                  {questionTypeLabels[question.type]}
                </td>
                <td className="py-2.5 pr-3 text-xs">
                  {difficultyLabels[question.difficulty]}
                </td>
                <td className="max-w-md truncate py-2.5 pr-3">{question.prompt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 60 ? (
        <p className="mt-3 text-xs text-fg-muted">
          Эхний 60 мөрийг харуулав. Хайлт ашиглан нарийсгана уу.
        </p>
      ) : null}
    </Card>
  );
}

function UsersTab({ users }: { users: User[] }) {
  return (
    <Card>
      <div className="scroll-x">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-fg-muted">
            <tr>
              <th className="py-2 pr-3">Хэрэглэгч</th>
              <th className="py-2 pr-3">Имэйл</th>
              <th className="py-2 pr-3">Эрх</th>
              <th className="py-2 pr-3">Анги</th>
              <th className="py-2 pr-3">Бүртгүүлсэн</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((item) => (
              <tr key={item.id}>
                <td className="py-2.5 pr-3">
                  {item.avatar} {item.name}
                </td>
                <td className="py-2.5 pr-3 text-fg-muted">{item.email}</td>
                <td className="py-2.5 pr-3">{roleLabels[item.role]}</td>
                <td className="py-2.5 pr-3">{item.grade ?? "—"}</td>
                <td className="py-2.5 pr-3 text-xs text-fg-muted">
                  {formatDate(item.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-6 text-fg-muted">
        Демо хэрэглэгчид. Supabase Auth холбогдсоны дараа бодит хэрэглэгчид
        энд харагдана.
      </p>
    </Card>
  );
}

function FeedbackTab({ feedback }: { feedback: Feedback[] }) {
  const [resolved, setResolved] = useState<Record<string, boolean>>(
    Object.fromEntries(feedback.map((item) => [item.id, item.resolved])),
  );

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <Card key={item.id}>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-bold">{item.title}</h3>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-fg-muted">
              {item.userType === "student" ? "Сурагч" : "Эцэг эх"}
            </span>
            <span className="text-xs text-fg-muted">
              {"★".repeat(item.rating)}
            </span>
            {resolved[item.id] ? (
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Шийдвэрлэсэн
              </span>
            ) : null}
          </div>

          <p className="mt-3 text-sm leading-7 text-fg-muted">{item.body}</p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-fg-muted">
              {item.name} • {formatDate(item.createdAt)}
            </span>
            <Button
              size="sm"
              variant={resolved[item.id] ? "secondary" : "primary"}
              onClick={() =>
                setResolved((current) => ({
                  ...current,
                  [item.id]: !current[item.id],
                }))
              }
            >
              {resolved[item.id] ? "Буцаах" : "Шийдвэрлэсэн гэж тэмдэглэх"}
            </Button>
          </div>
        </Card>
      ))}

      <p className="text-xs text-fg-muted">
        Демо хувилбарт тэмдэглэгээ хадгалагдахгүй. Supabase холбогдсоны дараа
        <code className="mx-1">feedback.resolved</code> талбарт бичигдэнэ.
      </p>
    </div>
  );
}

function NewsTab({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="space-y-4">
      {announcements.map((item) => (
        <Card key={item.id}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xl" aria-hidden>
              {item.icon}
            </span>
            <h3 className="font-bold">{item.title}</h3>
            {item.pinned ? (
              <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-bold text-gold">
                📌 Онцолсон
              </span>
            ) : null}
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-fg-muted">
              {item.category}
            </span>
          </div>
          <p className="mt-3 text-sm leading-7 text-fg-muted">{item.body}</p>
          <p className="mt-3 text-xs text-fg-muted">
            {formatDate(item.publishedAt)} • {item.author}
          </p>
        </Card>
      ))}
    </div>
  );
}
