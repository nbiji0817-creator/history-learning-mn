"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";

/**
 * ШИНЭ НУУЦ ҮГ ТОГТООХ
 *
 * Хэрэглэгч имэйл дэх сэргээх холбоос дээр дарж энд ирнэ. Тэр холбоос нь
 * түр зуурын session үүсгэдэг тул `updateUser({ password })` ажиллана.
 *
 * Session байхгүй бол (холбоосны хугацаа дууссан) шинээр захидал хүсэхийг
 * санал болгоно.
 */
export function ResetPasswordForm() {
  const { user, ready, updatePassword, signOut } = useAuth();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const field =
    "mt-2 w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold";

  if (!ready) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">Ачаалж байна…</p>
      </Card>
    );
  }

  /* Сэргээх холбоос нь session үүсгэдэг — session байхгүй бол хугацаа дууссан */
  if (!user) {
    return (
      <Card>
        <div className="text-center text-4xl" aria-hidden>
          ⏳
        </div>
        <h2 className="mt-4 text-center text-lg font-black">
          Холбоосын хугацаа дууссан байна
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-7 text-fg-muted">
          Нууц үг сэргээх холбоос нэг удаа, богино хугацаанд ажилладаг.
          Нэвтрэх хуудаснаас шинээр захидал хүсээрэй.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-[#1c1a17]"
          >
            Нэвтрэх хуудас руу
          </Link>
        </div>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="text-center">
        <div className="text-5xl" aria-hidden>
          ✅
        </div>
        <h2 className="mt-4 text-xl font-black">Нууц үг шинэчлэгдлээ</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-fg-muted">
          Одооноос шинэ нууц үгээрээ нэвтэрнэ. Аюулгүй байдлын үүднээс бусад
          төхөөрөмж дээрээ дахин нэвтрэх шаардлагатай байж болно.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-[#1c1a17]"
          >
            Үргэлжлүүлэх
          </Link>
          <Button
            variant="secondary"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
          >
            Гараад дахин нэвтрэх
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-black">Шинэ нууц үг тогтоох</h2>
      <p className="mt-2 text-sm text-fg-muted">{user.email}</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();

          if (password !== confirm) {
            setError("Хоёр нууц үг таарахгүй байна.");
            return;
          }

          setBusy(true);
          setError(null);
          const result = await updatePassword(password);
          setBusy(false);

          if (result.error) {
            setError(result.error);
            return;
          }
          setDone(true);
        }}
      >
        <label className="block">
          <span className="text-sm font-semibold">Шинэ нууц үг *</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Дор хаяж 6 тэмдэгт"
            autoComplete="new-password"
            className={field}
            required
            minLength={6}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Дахин бичих *</span>
          <input
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="Нууц үгээ давтана уу"
            autoComplete="new-password"
            className={field}
            required
            minLength={6}
          />
        </label>

        {error ? (
          <p className="rounded-xl bg-clay/10 p-3 text-sm text-clay">{error}</p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Хадгалж байна…" : "Нууц үг хадгалах"}
        </Button>
      </form>
    </Card>
  );
}
