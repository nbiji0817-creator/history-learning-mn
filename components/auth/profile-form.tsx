"use client";

import Link from "next/link";
import { useState } from "react";
import type { GradeNumber } from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { roleLabels, useAuth } from "@/lib/auth";

/**
 * ПРОФАЙЛ ЗАСАХ
 *
 * Сурагч нэр, анги, аватараа өөрөө өөрчилнө. Анги нь чухал — AI хариултаа
 * тэр түвшинд тааруулж, хичээлийн жагсаалт шүүгддэг.
 *
 * ЭРХ (role) энд БАЙХГҮЙ. Хэрэглэгч өөрийгөө багш, админ болгож
 * чадахгүй — RLS policy үүнийг хориглоно. Багшийн эрхийг урилгын
 * кодоор, админыг зөвхөн SQL-ээр олгоно.
 */

const AVATARS = [
  "🧑‍🎓", "👩‍🎓", "🧒", "👦", "👧",
  "🐎", "🦅", "🏹", "⚔️", "🏔️",
  "📚", "🔥", "⭐", "🌙", "🐺",
];

const GRADES: GradeNumber[] = [6, 7, 8, 9, 10, 11, 12];

export function ProfileForm() {
  const { user, ready, updateProfile, requestPasswordReset } = useAuth();

  const [name, setName] = useState("");
  const [grade, setGrade] = useState<GradeNumber | "">("");
  const [avatar, setAvatar] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const field =
    "mt-2 w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold";

  /* Хэрэглэгч ачаалагдмагц маягтыг нэг удаа дүүргэнэ */
  if (user && !loaded) {
    setName(user.name);
    setGrade(user.grade ?? "");
    setAvatar(user.avatar);
    setLoaded(true);
  }

  if (!ready) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">Ачаалж байна…</p>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="text-center">
        <div className="text-4xl" aria-hidden>
          🔒
        </div>
        <h2 className="mt-4 text-lg font-black">Нэвтрэх шаардлагатай</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-fg-muted">
          Профайлаа засахын тулд эхлээд нэвтэрнэ үү.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex items-center rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-[#1c1a17]"
          >
            Нэвтрэх
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-3xl">
            {avatar || user.avatar}
          </div>
          <div>
            <h2 className="text-lg font-black">{user.name}</h2>
            <p className="text-sm text-fg-muted">
              {user.email} · {roleLabels[user.role]}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-black">Мэдээлэл засах</h3>

        <form
          className="mt-5 space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError(null);
            setMessage(null);

            const result = await updateProfile({
              name,
              grade: grade === "" ? null : grade,
              avatar,
            });
            setBusy(false);

            if (result.error) {
              setError(result.error);
              return;
            }
            setMessage("Хадгаллаа.");
          }}
        >
          <label className="block">
            <span className="text-sm font-semibold">Нэр *</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={field}
              required
              maxLength={60}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Анги</span>
            <select
              value={grade}
              onChange={(event) =>
                setGrade(
                  event.target.value === ""
                    ? ""
                    : (Number(event.target.value) as GradeNumber),
                )
              }
              className={field}
            >
              <option value="">— Сонгоогүй —</option>
              {GRADES.map((item) => (
                <option key={item} value={item}>
                  {item}-р анги
                </option>
              ))}
            </select>
            <span className="mt-2 block text-xs leading-5 text-fg-muted">
              AI багш хариултаа таны ангийн түвшинд тааруулдаг тул ангиа
              зөв сонгоорой.
            </span>
          </label>

          <div>
            <span className="text-sm font-semibold">Аватар</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {AVATARS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAvatar(item)}
                  aria-label={`Аватар ${item}`}
                  aria-pressed={avatar === item}
                  className={
                    "flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition " +
                    (avatar === item
                      ? "border-gold bg-gold/15"
                      : "border-line hover:border-gold/60")
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p className="rounded-xl bg-clay/10 p-3 text-sm text-clay">{error}</p>
          ) : null}
          {message ? (
            <p className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
              ✅ {message}
            </p>
          ) : null}

          <Button type="submit" disabled={busy}>
            {busy ? "Хадгалж байна…" : "Хадгалах"}
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-sm font-black">🔑 Нууц үг</h3>
        <p className="mt-2 text-sm leading-7 text-fg-muted">
          Нууц үгээ солихыг хүсвэл доорх товчийг дарна уу. Таны бүртгэлтэй
          имэйл рүү сэргээх холбоос илгээнэ.
        </p>

        {resetSent ? (
          <p className="mt-4 rounded-xl bg-emerald-500/10 p-4 text-sm leading-7 text-emerald-700 dark:text-emerald-300">
            ✅ <b>{user.email}</b> хаяг руу захидал илгээлээ. Ирсэн
            холбоосоор орж шинэ нууц үгээ тогтооно уу. Захидал ирээгүй бол
            «спам» хавтсаа шалгаарай.
          </p>
        ) : (
          <div className="mt-4">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                const result = await requestPasswordReset(user.email);
                setBusy(false);
                if (result.error) {
                  setError(result.error);
                  return;
                }
                setResetSent(true);
              }}
            >
              Нууц үг солих захидал авах
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
