"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { GradeNumber } from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { roleLabels, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";
type SignupRole = "student" | "parent" | "teacher";

const roleOptions: { key: SignupRole; icon: string; hint: string }[] = [
  { key: "student", icon: "🧑‍🎓", hint: "Хичээл үзэх, тест өгөх, ахицаа харах" },
  { key: "parent", icon: "👪", hint: "Хүүхдийнхээ ахицыг харах" },
  { key: "teacher", icon: "👩‍🏫", hint: "Агуулга, статистик — урилгын код шаардлагатай" },
];

export function AuthForm({ initialMode = "signin" }: { initialMode?: Mode }) {
  const { user, ready, configured, signIn, signUp, signOut, claimRole } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const nextPath = params.get("next");
  const denied = params.get("denied") === "1";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<SignupRole>("student");
  const [grade, setGrade] = useState<GradeNumber | "">("");
  const [teacherCode, setTeacherCode] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /* ── Тохируулаагүй ── */
  if (!configured) {
    return (
      <Card>
        <h2 className="text-lg font-black">Нэвтрэлт идэвхгүй байна</h2>
        <p className="mt-3 text-sm leading-7 text-fg-muted">
          Supabase тохируулаагүй тул нэвтрэх боломжгүй. Систем нийтийн
          контентыг үзэх горимд ажиллаж байна.
        </p>
        <p className="mt-3 text-sm text-fg-muted">
          Тохируулахын тулд <code className="rounded bg-muted px-1.5 py-0.5">.env.local</code>{" "}
          дотор <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          болон <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          нэмнэ үү.
        </p>
      </Card>
    );
  }

  if (!ready) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">Ачаалж байна…</p>
      </Card>
    );
  }

  /* ── Аль хэдийн нэвтэрсэн ── */
  if (user) {
    const home =
      user.role === "parent"
        ? "/parent"
        : user.role === "teacher" || user.role === "admin"
          ? "/admin"
          : "/dashboard";

    return (
      <div className="space-y-5">
        <Card className="text-center">
          <div className="text-5xl" aria-hidden>
            {user.avatar}
          </div>
          <h2 className="mt-4 text-xl font-black">{user.name}</h2>
          <p className="mt-1 text-sm text-fg-muted">{user.email}</p>
          <p className="mt-3 inline-block rounded-full bg-gold/15 px-4 py-1.5 text-sm font-bold text-gold">
            {roleLabels[user.role]}
            {user.grade ? ` • ${user.grade}-р анги` : ""}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={home}
              className="inline-flex items-center rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-[#1c1a17]"
            >
              Хэсэг рүү орох
            </Link>
            <Button variant="secondary" onClick={() => void signOut()}>
              Гарах
            </Button>
          </div>
        </Card>

        {/* Багшийн эрх авах — сурагч/эцэг эх кодоор эрхээ ахиулж болно */}
        {(user.role === "student" || user.role === "parent") ? (
          <Card>
            <h3 className="text-sm font-black">👩‍🏫 Багшийн эрх авах</h3>
            <p className="mt-2 text-sm leading-6 text-fg-muted">
              Сургуулиасаа авсан урилгын код байвал энд оруулна уу.
            </p>
            <form
              className="mt-4 flex flex-wrap gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setError(null);
                setNotice(null);
                const result = await claimRole("teacher", teacherCode);
                setBusy(false);
                if (result.error) setError(result.error);
                else setNotice("Багшийн эрх амжилттай олгогдлоо.");
              }}
            >
              <input
                type="text"
                value={teacherCode}
                onChange={(event) => setTeacherCode(event.target.value)}
                placeholder="Урилгын код"
                className="flex-1 rounded-xl border border-line bg-muted/40 px-4 py-2.5 text-sm outline-none focus:border-gold"
              />
              <Button type="submit" variant="secondary" disabled={busy || !teacherCode}>
                Илгээх
              </Button>
            </form>
            {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
            {notice ? (
              <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
                {notice}
              </p>
            ) : null}
          </Card>
        ) : null}
      </div>
    );
  }

  /* ── Нэвтрэх / Бүртгүүлэх ── */
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    if (mode === "signin") {
      const result = await signIn(email, password);
      setBusy(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(nextPath || "/dashboard");
      router.refresh();
      return;
    }

    if (name.trim().length < 2) {
      setBusy(false);
      setError("Нэрээ бичнэ үү.");
      return;
    }
    if (password.length < 6) {
      setBusy(false);
      setError("Нууц үг дор хаяж 6 тэмдэгт байх ёстой.");
      return;
    }
    if (role === "teacher" && !teacherCode.trim()) {
      setBusy(false);
      setError("Багшаар бүртгүүлэхэд урилгын код шаардлагатай.");
      return;
    }

    const result = await signUp({
      email,
      password,
      name,
      role,
      grade: grade === "" ? null : grade,
      teacherCode: teacherCode.trim() || undefined,
    });
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirm) {
      setNotice(
        `${email} хаяг руу баталгаажуулах захидал илгээлээ. Захидал дахь холбоос дээр дарж баталгаажуулаад нэвтэрнэ үү.`,
      );
      setMode("signin");
      return;
    }

    router.push(nextPath || (role === "parent" ? "/parent" : "/dashboard"));
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {denied ? (
        <div className="rounded-2xl border border-clay/40 bg-clay/10 p-5">
          <p className="text-sm font-bold text-clay">Хандах эрхгүй байна</p>
          <p className="mt-2 text-sm leading-6 text-fg-muted">
            Энэ хэсэгт орохын тулд тохирох эрхтэй бүртгэлээр нэвтрэх
            шаардлагатай.
          </p>
        </div>
      ) : null}

      <Card>
        {/* Табууд */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          {(["signin", "signup"] as Mode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setMode(item);
                setError(null);
                setNotice(null);
              }}
              className={cn(
                "rounded-lg py-2.5 text-sm font-bold transition",
                mode === item ? "bg-gold text-[#1c1a17]" : "text-fg-muted",
              )}
            >
              {item === "signin" ? "Нэвтрэх" : "Бүртгүүлэх"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" ? (
            <>
              <div>
                <span className="text-sm font-semibold">Хэн болох вэ? *</span>
                <div className="mt-2 grid gap-2">
                  {roleOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setRole(option.key)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3.5 text-left transition",
                        role === option.key
                          ? "border-gold bg-gold/10"
                          : "border-line hover:border-gold/50",
                      )}
                      aria-pressed={role === option.key}
                    >
                      <span className="text-xl" aria-hidden>
                        {option.icon}
                      </span>
                      <span>
                        <span className="block text-sm font-bold">
                          {roleLabels[option.key]}
                        </span>
                        <span className="block text-xs leading-5 text-fg-muted">
                          {option.hint}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-semibold">Нэр *</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Овог нэр"
                  autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
                  required
                />
              </label>

              {role === "student" ? (
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
                    className="mt-2 w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
                  >
                    <option value="">— сонгоно уу —</option>
                    {[6, 7, 8, 9, 10, 11, 12].map((item) => (
                      <option key={item} value={item}>
                        {item}-р анги
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {role === "teacher" ? (
                <label className="block">
                  <span className="text-sm font-semibold">Урилгын код *</span>
                  <input
                    type="text"
                    value={teacherCode}
                    onChange={(event) => setTeacherCode(event.target.value)}
                    placeholder="Сургуулиасаа авсан код"
                    className="mt-2 w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
                  />
                  <span className="mt-1.5 block text-xs text-fg-muted">
                    Код байхгүй бол эхлээд сурагчаар бүртгүүлээд, дараа нь
                    админаас эрх хүсээрэй.
                  </span>
                </label>
              ) : null}
            </>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold">Имэйл *</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jishee@gmail.com"
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Нууц үг *</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "signup" ? "Дор хаяж 6 тэмдэгт" : "Нууц үг"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="mt-2 w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
              required
              minLength={6}
            />
          </label>

          {error ? (
            <p className="rounded-xl bg-clay/10 p-3 text-sm text-clay">{error}</p>
          ) : null}
          {notice ? (
            <p className="rounded-xl bg-emerald-500/10 p-3 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
              {notice}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Түр хүлээнэ үү…" : mode === "signin" ? "Нэвтрэх" : "Бүртгүүлэх"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-xs leading-6 text-fg-muted">
        Нэвтрэхгүйгээр ч хичээл, он цагийн хэлхээс, түүхэн хүмүүс, тоглоомыг
        үзэх боломжтой.{" "}
        <Link href="/" className="font-bold text-gold hover:underline">
          Нүүр хуудас →
        </Link>
      </p>
    </div>
  );
}
