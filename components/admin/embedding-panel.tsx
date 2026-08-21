"use client";

import { useState } from "react";
import { Button, Card, ProgressBar } from "@/components/ui/primitives";

/**
 * ОЙЛГОЛТЫН ХАЙЛТЫН УДИРДЛАГА
 *
 * Бүх агуулгыг вектор болгож индекслэнэ. Багц болгон явуулдаг тул
 * серверийн хугацааны хязгаарт багтана — дуустал давтан дуудна.
 */
export function EmbeddingPanel({
  initial,
}: {
  initial: {
    total: number;
    lastUpdated: string | null;
    available: boolean;
    corpusSize: number;
    openAiConfigured: boolean;
    /** Тохиргоо буруу бол яг юу буруу байгааг тайлбарласан мөр */
    openAiProblem?: string | null;
  };
}) {
  const [status, setStatus] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const build = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);

    let offset = 0;
    let processed = 0;

    try {
      for (;;) {
        const response = await fetch("/api/admin/embeddings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offset }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(String(result.error ?? "Алдаа гарлаа"));
          return;
        }

        processed += Number(result.processed ?? 0);
        setProgress({ done: processed, total: Number(result.total ?? 0) });

        if (result.done || result.nextOffset === null) break;
        offset = Number(result.nextOffset);
      }

      setNotice(`${processed} баримт индекслэгдлээ.`);

      /* Төлөвийг сэргээж авна */
      const check = await fetch("/api/admin/embeddings");
      if (check.ok) setStatus(await check.json());
    } catch {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  };

  const coverage =
    status.corpusSize > 0
      ? Math.round((status.total / status.corpusSize) * 100)
      : 0;

  return (
    <Card>
      <h3 className="text-sm font-black">🧠 Ойлголтын хайлт</h3>
      <p className="mt-2 text-sm leading-7 text-fg-muted">
        Түлхүүр үгийн хайлт нь ижил үг ашигласан үед л ажилладаг. Ойлголтын
        хайлт нь текстийн утгыг ойлгодог тул сурагч өөр үгээр асуусан ч
        зөв хичээлийг олно.
      </p>

      {!status.openAiConfigured ? (
        <div className="mt-4 rounded-xl bg-clay/10 p-4 text-sm leading-7 text-clay">
          {/* «Тохируулаагүй», «дутуу буулгасан», «буруу эхэлсэн» гурав
              өөр асуудал — аль нь болохыг сервер тодорхойлж өгнө */}
          <b>{status.openAiProblem ?? "OPENAI_API_KEY тохируулаагүй байна."}</b>
          <p className="mt-2">
            Vercel → Settings → Environment Variables хэсэгт{" "}
            <code className="rounded bg-surface px-1.5 py-0.5">
              OPENAI_API_KEY
            </code>{" "}
            мөрийг засаад <b>Production</b> сонгогдсоныг шалгаж, дахин
            deploy хийнэ үү. Түлхүүрийг{" "}
            <code className="rounded bg-surface px-1.5 py-0.5">sk-</code>
            -ээс эхлээд төгсгөл хүртэл нь бүтнээр хуулна.
          </p>
        </div>
      ) : !status.available ? (
        <p className="mt-4 rounded-xl bg-gold/10 p-4 text-sm leading-7 text-fg-muted">
          <b>Хүснэгт бэлэн биш байна.</b> Supabase SQL Editor дээр{" "}
          <code className="rounded bg-surface px-1.5 py-0.5">
            supabase/migrations/0005_embeddings.sql
          </code>{" "}
          файлыг ажиллуулна уу.
        </p>
      ) : (
        <>
          <div className="mt-5">
            <ProgressBar
              value={status.total}
              max={Math.max(1, status.corpusSize)}
              label={`Индекслэгдсэн: ${status.total} / ${status.corpusSize}`}
            />
          </div>

          {coverage < 100 ? (
            <p className="mt-3 text-sm text-fg-muted">
              {status.total === 0
                ? "Хараахан индекслээгүй байна. Доорх товчийг дарж эхлүүлнэ үү."
                : "Шинэ агуулга нэмэгдсэн байна — дахин индекслэхийг зөвлөнө."}
            </p>
          ) : (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
              ✅ Бүх агуулга индекслэгдсэн.
            </p>
          )}
        </>
      )}

      {progress ? (
        <p className="mt-3 text-sm text-fg-muted">
          {progress.done} / {progress.total} боловсруулагдлаа…
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl bg-clay/10 p-3 text-sm text-clay">{error}</p>
      ) : null}

      {notice ? (
        <p className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          {notice}
        </p>
      ) : null}

      {status.openAiConfigured && status.available ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={() => void build()} disabled={busy}>
            {busy ? "Индексжүүлж байна…" : "🔄 Индекс шинэчлэх"}
          </Button>
          <span className="text-xs text-fg-muted">
            Шинэ хичээл нэмсний дараа дахин ажиллуулна
          </span>
        </div>
      ) : null}
    </Card>
  );
}
