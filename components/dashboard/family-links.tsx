"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * ГЭР БҮЛИЙН ХОЛБОО
 *
 * Эцэг эх хүүхдийнхээ имэйлээр холбох хүсэлт илгээнэ. Хүүхэд өөрөө
 * зөвшөөрөх хүртэл эцэг эх ЮУ Ч ХАРАХГҮЙ — RLS дээрх `is_my_child()`
 * нь `confirmed` төлөвийг шаарддаг.
 *
 * Нэг л бүрэлдэхүүн хоёр талд ажиллана:
 *   • Эцэг эх → хүүхдүүдээ нэмж, хасна
 *   • Сурагч  → ирсэн хүсэлтийг зөвшөөрч, цуцална
 */

interface LinkRow {
  counterpart_id: string;
  name: string;
  avatar: string;
  email: string | null;
  grade: number | null;
  confirmed: boolean;
  direction: "child" | "parent";
  created_at: string;
}

export function FamilyLinks() {
  const { user, ready } = useAuth();

  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /* Migration 0006 ажиллуулаагүй бол функц олдохгүй — тайлбарыг харуулна */
  const [needsMigration, setNeedsMigration] = useState(false);

  /*
   * Татах боломжтой эсэхийг render-ийн үед тооцно. Effect дотор
   * setState-ийг синхроноор дуудвал илүүц дахин render үүсдэг тул
   * «боломжгүй» тохиолдлыг effect-т биш, энд шийднэ.
   */
  const canLoad = isSupabaseConfigured() && Boolean(user);

  /*
   * Татах ба төлөв бичих хоёрыг салгав. Effect дотор setState-ийг
   * СИНХРОНООР дуудвал илүүц дахин render үүсдэг — тиймээс `fetchLinks`
   * нь зөвхөн өгөгдөл буцааж, төлөвийг await-ын дараа бичнэ.
   */
  const fetchLinks = useCallback(async (): Promise<{
    rows: LinkRow[];
    missing: boolean;
  } | null> => {
    if (!user) return null;

    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("list_parent_links");

    if (rpcError) {
      /* PostgREST: функц байхгүй бол PGRST202 */
      return {
        rows: [],
        missing:
          rpcError.code === "PGRST202" || /function/i.test(rpcError.message),
      };
    }

    return { rows: (data ?? []) as LinkRow[], missing: false };
  }, [user]);

  useEffect(() => {
    if (!canLoad) return;

    let active = true;
    void (async () => {
      const result = await fetchLinks();
      if (!active || !result) return;
      setLinks(result.rows);
      setNeedsMigration(result.missing);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [canLoad, fetchLinks]);

  /** Үйлдлийн дараа жагсаалтыг шинэчилнэ (effect биш, товчны хариу). */
  const refresh = async () => {
    const result = await fetchLinks();
    if (!result) return;
    setLinks(result.rows);
    setNeedsMigration(result.missing);
  };

  if (!ready || (canLoad && loading)) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">Ачаалж байна…</p>
      </Card>
    );
  }

  if (!user) return null;

  if (needsMigration) {
    return (
      <Card>
        <h3 className="text-sm font-black">👨‍👩‍👧 Гэр бүлийн холбоо</h3>
        <p className="mt-3 rounded-xl bg-gold/10 p-4 text-sm leading-7 text-fg-muted">
          <b>Бэлэн биш байна.</b> Supabase SQL Editor дээр{" "}
          <code className="rounded bg-surface px-1.5 py-0.5">
            supabase/migrations/0006_parent_links.sql
          </code>{" "}
          файлыг ажиллуулна уу.
        </p>
      </Card>
    );
  }

  const isParent = user.role === "parent";
  const pending = links.filter((row) => !row.confirmed);
  const active = links.filter((row) => row.confirmed);

  const act = async (
    fn: () => Promise<{ error: { message: string } | null }>,
    successText: string,
  ) => {
    setBusy(true);
    setError(null);
    setMessage(null);

    const { error: actError } = await fn();
    setBusy(false);

    if (actError) {
      setError(actError.message);
      return;
    }
    setMessage(successText);
    await refresh();
  };

  return (
    <Card>
      <h3 className="text-sm font-black">👨‍👩‍👧 Гэр бүлийн холбоо</h3>

      {isParent ? (
        <>
          <p className="mt-2 text-sm leading-7 text-fg-muted">
            Хүүхдийнхээ бүртгэлтэй имэйлийг бичээд хүсэлт илгээнэ. Хүүхэд
            өөрөө зөвшөөрсний дараа л та ахицыг нь харна.
          </p>

          <form
            className="mt-4 flex flex-wrap gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const supabase = createClient();

              await act(async () => {
                const { data, error: rpcError } = await supabase.rpc(
                  "request_parent_link",
                  { p_student_email: email },
                );

                if (rpcError) return { error: rpcError };
                if (data === "not_parent") {
                  return {
                    error: {
                      message:
                        "Зөвхөн эцэг эхийн эрхтэй бүртгэл хүсэлт илгээнэ.",
                    },
                  };
                }
                if (data === "self") {
                  return {
                    error: { message: "Өөрийгөө холбож болохгүй." },
                  };
                }
                return { error: null };
              }, "Хүсэлт илгээлээ. Хүүхэд өөрийн хэсгээсээ зөвшөөрнө.");

              setEmail("");
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="huuhed@example.com"
              className="min-w-0 flex-1 rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
              required
            />
            <Button type="submit" disabled={busy}>
              {busy ? "Илгээж байна…" : "Хүсэлт илгээх"}
            </Button>
          </form>

          <p className="mt-2 text-xs leading-6 text-fg-muted">
            Аюулгүй байдлын үүднээс имэйл бүртгэлтэй эсэхийг харуулахгүй.
            Хүсэлт үргэлж «илгээлээ» гэж хариулна.
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm leading-7 text-fg-muted">
          Эцэг эх тань холбогдох хүсэлт илгээвэл энд харагдана. Та
          зөвшөөрөх хүртэл тэд таны ахицыг харахгүй.
        </p>
      )}

      {error ? (
        <p className="mt-4 rounded-xl bg-clay/10 p-3 text-sm text-clay">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          ✅ {message}
        </p>
      ) : null}

      {pending.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-xs font-black uppercase tracking-wide text-fg-muted">
            Хүлээгдэж буй
          </h4>
          <ul className="mt-3 space-y-2">
            {pending.map((row) => (
              <li
                key={row.counterpart_id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3"
              >
                <span className="text-xl" aria-hidden>
                  {row.avatar}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">
                    {row.name}
                  </span>
                  <span className="block truncate text-xs text-fg-muted">
                    {row.email}
                  </span>
                </span>

                {row.direction === "parent" ? (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      act(async () => {
                        const supabase = createClient();
                        const { error: rpcError } = await supabase.rpc(
                          "confirm_parent_link",
                          { p_parent: row.counterpart_id },
                        );
                        return { error: rpcError };
                      }, "Зөвшөөрлөө.")
                    }
                  >
                    Зөвшөөрөх
                  </Button>
                ) : (
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
                    Хүлээгдэж байна
                  </span>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    act(async () => {
                      const supabase = createClient();
                      const { error: rpcError } = await supabase.rpc(
                        "remove_parent_link",
                        { p_other: row.counterpart_id },
                      );
                      return { error: rpcError };
                    }, "Цуцаллаа.")
                  }
                >
                  Цуцлах
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {active.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-xs font-black uppercase tracking-wide text-fg-muted">
            {isParent ? "Холбогдсон хүүхэд" : "Холбогдсон эцэг эх"}
          </h4>
          <ul className="mt-3 space-y-2">
            {active.map((row) => (
              <li
                key={row.counterpart_id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3"
              >
                <span className="text-xl" aria-hidden>
                  {row.avatar}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">
                    {row.name}
                    {row.grade ? (
                      <span className="ml-2 text-xs font-semibold text-fg-muted">
                        {row.grade}-р анги
                      </span>
                    ) : null}
                  </span>
                  <span className="block truncate text-xs text-fg-muted">
                    {row.email}
                  </span>
                </span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  ✓ Холбогдсон
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    act(async () => {
                      const supabase = createClient();
                      const { error: rpcError } = await supabase.rpc(
                        "remove_parent_link",
                        { p_other: row.counterpart_id },
                      );
                      return { error: rpcError };
                    }, "Холбоог цуцаллаа.")
                  }
                >
                  Салгах
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {links.length === 0 ? (
        <p className="mt-6 rounded-xl bg-muted/60 p-4 text-sm leading-7 text-fg-muted">
          Одоогоор холбоо байхгүй байна.
        </p>
      ) : null}
    </Card>
  );
}
