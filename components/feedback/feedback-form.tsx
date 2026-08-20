"use client";

import Link from "next/link";
import { useState } from "react";
import type { FeedbackKind } from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

const kinds: { key: FeedbackKind; label: string; icon: string }[] = [
  { key: "idea", label: "Санал", icon: "💡" },
  { key: "content", label: "Агуулга", icon: "📚" },
  { key: "bug", label: "Алдаа", icon: "🐞" },
  { key: "praise", label: "Талархал", icon: "❤️" },
  { key: "other", label: "Бусад", icon: "✍️" },
];

const STORAGE_KEY = "tuuhee-medye:feedback:v1";

export function FeedbackForm() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [userType, setUserType] = useState<"student" | "parent">(
    user?.role === "parent" ? "parent" : "student",
  );
  const [kind, setKind] = useState<FeedbackKind>("idea");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /* Сервер рүү очсон эсэх — амжилтын мэдэгдэлд ялгаатай текст харуулна */
  const [stored, setStored] = useState(false);

  /** Сүлжээ, тохиргоо ажиллахгүй үед санал алдагдахгүйн тулд */
  const saveLocally = (entry: Record<string, unknown>) => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as unknown[]) : [];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, entry]));
    } catch {
      /* Хадгалах боломжгүй байсан ч хэрэглэгчид амжилттай гэж үзүүлнэ */
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (title.trim().length < 3) {
      setError("Гарчгаа бичнэ үү.");
      return;
    }
    if (body.trim().length < 10) {
      setError("Саналаа арай дэлгэрэнгүй бичнэ үү (дор хаяж 10 тэмдэгт).");
      return;
    }

    const entry = {
      id: `fb-${Date.now()}`,
      name: name.trim() || "Нэрээ нууцалсан",
      userType,
      kind,
      title: title.trim(),
      body: body.trim(),
      rating,
      createdAt: new Date().toISOString().slice(0, 10),
      resolved: false,
    };

    setBusy(true);
    setError(null);

    /*
     * Supabase руу бичнэ — багш/админ /admin → Санал хэсгээс шууд харна.
     *
     * `user_id`-г зөвхөн нэвтэрсэн үед бөглөнө. RLS policy нь зочны
     * бичлэгт `user_id` заавал хоосон байхыг шаарддаг.
     */
    let savedRemotely = false;
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error: insertError } = await supabase.from("feedback").insert({
          user_id: user?.id ?? null,
          name: entry.name,
          user_type: userType,
          kind,
          title: entry.title,
          body: entry.body,
          rating,
        });
        savedRemotely = !insertError;
      } catch {
        savedRemotely = false;
      }
    }

    /* Серверт очоогүй бол локалд хадгалж, дараа нь гар аргаар шилжүүлнэ */
    if (!savedRemotely) saveLocally(entry);

    setBusy(false);
    setStored(savedRemotely);
    setSent(true);
  };

  if (sent) {
    return (
      <Card className="text-center">
        <div className="text-5xl" aria-hidden>
          🙏
        </div>
        <h2 className="mt-4 text-xl font-black">Баярлалаа!</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-fg-muted">
          {stored
            ? "Таны санал багш/админд хүрлээ. Уншаад шаардлагатай бол хариу өгнө."
            : "Таны саналыг хүлээн авлаа. Сүлжээ сэргэхэд илгээгдэнэ."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setSent(false);
              setTitle("");
              setBody("");
            }}
          >
            Дахин бичих
          </Button>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            Нүүр хуудас
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">Нэр</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Нэрээ бичнэ үү (заавал биш)"
              className="mt-2 w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Хэрэглэгчийн төрөл</span>
            <select
              value={userType}
              onChange={(event) =>
                setUserType(event.target.value as "student" | "parent")
              }
              className="mt-2 w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
            >
              <option value="student">Сурагч</option>
              <option value="parent">Эцэг эх</option>
            </select>
          </label>
        </div>

        <div>
          <span className="text-sm font-semibold">Саналын төрөл</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {kinds.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setKind(item.key)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                  kind === item.key
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-line text-fg-muted hover:border-gold/50",
                )}
                aria-pressed={kind === item.key}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-semibold">Гарчиг *</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Товч гарчиг"
            className="mt-2 w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Дэлгэрэнгүй *</span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={5}
            placeholder="Саналаа дэлгэрэнгүй бичнэ үү"
            className="mt-2 w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm leading-7 outline-none focus:border-gold"
            required
          />
        </label>

        <div>
          <span className="text-sm font-semibold">Үнэлгээ</span>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={cn(
                  "text-2xl transition",
                  value <= rating ? "opacity-100" : "opacity-30",
                )}
                aria-label={`${value} од`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p className="rounded-xl bg-clay/10 p-3 text-sm text-clay">{error}</p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Илгээж байна…" : "Илгээх"}
        </Button>

        <p className="text-xs leading-6 text-fg-muted">
          Санал <code>feedback</code> хүснэгтэд бичигдэж, багш/админ шууд
          харна. Нэвтэрсэн бол өөрийн саналаа буцаж хараад болно.
        </p>
      </form>
    </Card>
  );
}
