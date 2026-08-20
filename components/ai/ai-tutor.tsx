"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AiMessage, AiMode } from "@/types";

import { aiModes } from "@/lib/ai/knowledge";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

interface Citation {
  label: string;
  href: string;
  kind: string;
}

interface ChatMessage extends AiMessage {
  citations?: Citation[];
  questionId?: string;
  matched?: boolean;
}

const KIND_ICONS: Record<string, string> = {
  lesson: "📚",
  figure: "👑",
  event: "📌",
  source: "📜",
  term: "📖",
};

const suggestions = [
  "Хүннү улс хэдэн онд байгуулагдсан бэ?",
  "Их засаг хууль гэж юу вэ?",
  "1911 оны хувьсгалын шалтгааныг тайлбарлаж өгөөч",
  "Чингис хаантай ярилцмаар байна",
  "Намайг Монголын эзэнт гүрний сэдвээр шалгаад үзээч",
  "Монголын эзэнт гүрний эерэг, сөрөг талыг харьцуулж өгөөч",
];

export function AiTutor({ initialQuestion }: { initialQuestion?: string }) {
  const [mode, setMode] = useState<AiMode>("ask");
  const [input, setInput] = useState(initialQuestion ?? "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoSent = useRef(false);

  const send = async (text: string, nextMode: AiMode = mode) => {
    const question = text.trim();
    if (!question || busy) return;

    setError(null);
    setBusy(true);
    setInput("");

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };

    const assistantId = `a-${Date.now()}`;
    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          mode: nextMode,
          history: messages.slice(-6).map((item) => ({
            role: item.role,
            content: item.content,
          })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Хариулт авахад алдаа гарлаа");
      }

      /* Эх сурвалж, итгэлцүүр, бүртгэлийн id-г толгойгоос авна */
      let citations: Citation[] = [];
      try {
        const encoded = response.headers.get("X-Ai-Citations");
        if (encoded) citations = JSON.parse(atob(encoded));
      } catch {
        /* Толгой эвдэрсэн ч хариулт харагдах ёстой */
      }

      const questionId = response.headers.get("X-Ai-Question-Id") ?? undefined;
      const matched = response.headers.get("X-Ai-Matched") === "true";

      setMessages((current) =>
        current.map((item) =>
          item.id === assistantId
            ? { ...item, citations, questionId, matched }
            : item,
        ),
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((item) =>
            item.id === assistantId ? { ...item, content: accumulated } : item,
          ),
        );
      }
    } catch {
      setError("Хариулт авахад алдаа гарлаа. Дахин оролдоно уу.");
      setMessages((current) => current.filter((item) => item.id !== assistantId));
    } finally {
      setBusy(false);
    }
  };

  /* Хичээлээс ирсэн асуултыг автоматаар илгээнэ */
  useEffect(() => {
    if (initialQuestion && !autoSent.current) {
      autoSent.current = true;
      void send(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* Горим сонгох */}
      <aside className="space-y-2">
        <h2 className="text-sm font-black">Горим</h2>
        {aiModes.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMode(item.key)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
              mode === item.key
                ? "border-gold bg-gold/10"
                : "border-line hover:border-gold/50 hover:bg-muted",
            )}
            aria-pressed={mode === item.key}
          >
            <span className="text-lg" aria-hidden>
              {item.icon}
            </span>
            <span>
              <span className="block text-sm font-bold">{item.label}</span>
              <span className="block text-[11px] leading-4 text-fg-muted">
                {item.hint}
              </span>
            </span>
          </button>
        ))}
      </aside>

      {/* Чат */}
      <div className="flex min-h-[60vh] flex-col rounded-2xl border border-line bg-surface">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="py-10 text-center">
              <div className="text-5xl" aria-hidden>
                🤖
              </div>
              <h2 className="mt-4 text-lg font-black">
                Сайн байна уу! Би чиний түүхийн багш.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-fg-muted">
                Асуулт асуу, сэдвээ тайлбарлуул, өөрийгөө шалгуул, эсвэл түүхэн
                хүнтэй ярилц. Хариулт нь системийн баталгаатай хичээлийн агуулгад
                тулгуурлана.
              </p>

              <div className="mx-auto mt-8 grid max-w-xl gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void send(suggestion)}
                    className="rounded-xl border border-line px-4 py-2.5 text-left text-sm transition hover:border-gold/60 hover:bg-muted"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {message.role === "assistant" ? (
                <span className="text-2xl" aria-hidden>
                  🤖
                </span>
              ) : null}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7",
                  message.role === "user"
                    ? "bg-gold text-[#1c1a17]"
                    : "bg-muted text-fg",
                )}
              >
                {message.content ? (
                  <>
                    <MessageBody content={message.content} />

                    {message.role === "assistant" &&
                    message.citations &&
                    message.citations.length > 0 ? (
                      <div className="mt-4 border-t border-line/60 pt-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-fg-muted">
                          Эх сурвалж
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {message.citations.map((citation) => (
                            <Link
                              key={citation.href + citation.label}
                              href={citation.href}
                              className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-medium transition hover:border-gold hover:text-gold"
                            >
                              {KIND_ICONS[citation.kind] ?? "🔗"} {citation.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {message.role === "assistant" && message.questionId ? (
                      <AnswerFeedback questionId={message.questionId} />
                    ) : null}
                  </>
                ) : (
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-fg-muted" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-fg-muted [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-fg-muted [animation-delay:240ms]" />
                  </span>
                )}
              </div>
            </div>
          ))}

          {error ? (
            <p className="rounded-xl bg-clay/10 p-4 text-sm text-clay">{error}</p>
          ) : null}

          <div ref={bottomRef} />
        </div>

        {/* Оролт */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
          className="flex gap-3 border-t border-line p-4"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Түүхийн асуултаа бичнэ үү…"
            className="flex-1 rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold"
            aria-label="Асуулт"
            disabled={busy}
          />
          <Button type="submit" disabled={busy || !input.trim()}>
            {busy ? "…" : "Илгээх"}
          </Button>
        </form>
      </div>
    </div>
  );
}


/**
 * Хариултын үнэлгээ — AI-ийн сурах гогцооны хамгийн үнэ цэнэтэй хэсэг.
 *
 * «Тусгүй» гэж тэмдэглэсэн асуултууд багшийн самбарт «юуг сайжруулах вэ»
 * гэсэн жагсаалтад орно.
 */
function AnswerFeedback({ questionId }: { questionId: string }) {
  const [sent, setSent] = useState<1 | -1 | null>(null);
  const [busy, setBusy] = useState(false);

  const rate = async (rating: 1 | -1) => {
    if (sent !== null || busy) return;
    setBusy(true);
    try {
      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, rating }),
      });
      setSent(rating);
    } catch {
      /* Үнэлгээ хадгалагдаагүй ч хэрэглэгчийн ажлыг тасалдуулахгүй */
    } finally {
      setBusy(false);
    }
  };

  if (sent !== null) {
    return (
      <p className="mt-3 text-[11px] text-fg-muted">
        {sent === 1
          ? "Баярлалаа — санал хүлээж авлаа."
          : "Баярлалаа. Энэ асуултыг багш нар хараад агуулга нэмнэ."}
      </p>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-[11px] text-fg-muted">Энэ хариулт тустай байв уу?</span>
      <button
        type="button"
        onClick={() => void rate(1)}
        disabled={busy}
        className="rounded-lg px-2 py-0.5 text-sm transition hover:bg-surface"
        aria-label="Тустай"
      >
        👍
      </button>
      <button
        type="button"
        onClick={() => void rate(-1)}
        disabled={busy}
        className="rounded-lg px-2 py-0.5 text-sm transition hover:bg-surface"
        aria-label="Тусгүй"
      >
        👎
      </button>
    </div>
  );
}

/** Энгийн markdown-той төстэй форматлалт (**bold**, • жагсаалт, зам). */
function MessageBody({ content }: { content: string }) {
  return (
    <div className="space-y-2">
      {content.split("\n").map((line, index) => {
        if (!line.trim()) return <div key={index} className="h-1" />;

        const withBold = line.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <b key={partIndex}>{part.slice(2, -2)}</b>;
          }
          /* Дотоод зам байвал холбоос болгоно */
          const match = part.match(/(\/[a-z0-9/#[\]-]+)/i);
          if (match) {
            const [before, after] = part.split(match[1]);
            return (
              <span key={partIndex}>
                {before}
                <Link href={match[1]} className="font-bold text-gold hover:underline">
                  {match[1]}
                </Link>
                {after}
              </span>
            );
          }
          return <span key={partIndex}>{part}</span>;
        });

        return <p key={index}>{withBold}</p>;
      })}
    </div>
  );
}
