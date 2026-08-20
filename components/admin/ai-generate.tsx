"use client";

import { useState } from "react";
import type { GradeNumber } from "@/types";
import { Button, Card } from "@/components/ui/primitives";

/**
 * AI-ААР НООРОГ ҮҮСГЭХ
 *
 * ⚠️ Үр дүн нь ноорог. Багш уншиж, засаж, баталсны дараа л хадгалагдана.
 * Энэ бол санаатай шийдэл — AI-ийн үүсгэсэн түүхэн агуулгыг хянуулалгүй
 * нийтлэх нь сурагчид буруу мэдээлэл өгөх эрсдэлтэй.
 */

export interface LessonDraft {
  title?: string;
  subtitle?: string;
  icon?: string;
  summary?: string;
  objectives?: string[];
  conclusion?: string;
  tags?: string[];
  sections?: {
    type?: string;
    title?: string;
    body?: string;
    points?: string[];
    concepts?: { term: string; definition: string }[];
  }[];
}

export interface QuestionDraft {
  prompt?: string;
  options?: string[];
  answerIndex?: number;
  explanation?: string;
  difficulty?: string;
  topic?: string;
}

export function AiGenerate({
  kind,
  grade,
  onLesson,
  onQuestions,
}: {
  kind: "lesson" | "questions";
  grade: GradeNumber;
  onLesson?: (draft: LessonDraft) => void;
  onQuestions?: (drafts: QuestionDraft[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const generate = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, topic, grade, count }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(String(result.error ?? "Үүсгэхэд алдаа гарлаа"));
        return;
      }

      if (kind === "lesson") {
        onLesson?.(result.draft as LessonDraft);
      } else {
        const questions = (result.draft?.questions ?? []) as QuestionDraft[];
        if (questions.length === 0) {
          setError("AI асуулт үүсгэж чадсангүй. Сэдвээ өөрчилж үзнэ үү.");
          return;
        }
        onQuestions?.(questions);
      }

      setNotice(
        result.groundedIn > 0
          ? `Ноорог бэлэн — системийн ${result.groundedIn} материалд тулгуурлав. Заавал уншиж шалгаарай.`
          : "Ноорог бэлэн. Системд энэ сэдвээр материал байгаагүй тул он цаг, нэрийг ОНЦГОЙ анхааралтай шалгана уу.",
      );
    } catch {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <Card className="border-dashed bg-muted/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black">🤖 AI-аар ноорог үүсгэх</h3>
            <p className="mt-1 text-sm text-fg-muted">
              Сэдвээ бичихэд AI ноорог бэлдэнэ. Та уншиж, засаад хадгална.
            </p>
          </div>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Нээх
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-gold/40 bg-gold/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-black">
          🤖 AI-аар {kind === "lesson" ? "хичээл" : "тест"} үүсгэх
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-fg-muted hover:text-fg"
        >
          Хаах ✕
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-sm font-semibold">Сэдэв *</span>
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder={
              kind === "lesson"
                ? "Жишээ: Хүннү гүрний төрийн байгуулал"
                : "Жишээ: Их Монгол улсын байгуулалт"
            }
            className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-gold"
          />
        </label>

        {kind === "questions" ? (
          <label className="block">
            <span className="text-sm font-semibold">Асуултын тоо</span>
            <input
              type="number"
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              min={1}
              max={10}
              className="mt-2 w-32 rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </label>
        ) : null}

        {error ? (
          <p className="rounded-xl bg-clay/10 p-3 text-sm text-clay">{error}</p>
        ) : null}

        {notice ? (
          <p className="rounded-xl bg-emerald-500/10 p-3 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            {notice}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => void generate()}
            disabled={busy || topic.trim().length < 3}
          >
            {busy ? "Үүсгэж байна…" : "✨ Ноорог үүсгэх"}
          </Button>
          <span className="text-xs text-fg-muted">
            {grade}-р ангид зориулж үүсгэнэ
          </span>
        </div>

        <p className="rounded-xl bg-surface/70 p-3 text-xs leading-6 text-fg-muted">
          <b>Анхаар:</b> AI ноорог нь алдаатай байж болно. Он цаг, нэр, баримтыг
          сурах бичигтэй заавал тулгаж шалгаарай. Хадгалах шийдвэр танайх.
        </p>
      </div>
    </Card>
  );
}
