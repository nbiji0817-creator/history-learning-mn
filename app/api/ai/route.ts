import type { AiMode } from "@/types";
import {
  buildCorpus,
  buildFallbackAnswer,
  buildSystemPrompt,
  notFoundAnswer,
  retrieve,
  type KnowledgeHit,
} from "@/lib/ai/knowledge";
import { getLessons } from "@/lib/repo";
import {
  getLearnerContext,
  personalizationPrompt,
} from "@/lib/ai/personalize";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface ChatRequest {
  message?: string;
  mode?: AiMode;
  history?: { role: "user" | "assistant"; content: string }[];
}

const MAX_MESSAGE_LENGTH = 2000;

/** Нөөц хариултыг ч урсгалаар буцаана — UI-д ижил ажиллана. */
function streamText(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = text.match(/[\s\S]{1,24}/g) ?? [text];
  let index = 0;

  return new ReadableStream({
    async pull(controller) {
      if (index >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(chunks[index]));
      index += 1;
      await new Promise((resolve) => setTimeout(resolve, 12));
    },
  });
}

/**
 * Асуултыг бүртгэнэ — AI-ийн сурах гогцооны эхлэл.
 *
 * Хариулт олдоогүй асуултууд нь багш нарт «юуг нэмэх вэ» гэсэн
 * жагсаалт болно (/admin → AI асуултууд).
 *
 * Хүснэгт байхгүй (migration 0004 ажиллуулаагүй) байсан ч алдаа
 * гаргахгүй — бүртгэл нь туслах үүрэгтэй, хариултыг зогсоох ёсгүй.
 */
async function logQuestion(input: {
  question: string;
  mode: AiMode;
  matched: boolean;
  topScore: number;
  topMatch: string | null;
  source: string;
}): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("ai_questions")
      .insert({
        user_id: user?.id ?? null,
        question: input.question.slice(0, 500),
        mode: input.mode,
        matched: input.matched,
        top_score: input.topScore,
        top_match: input.topMatch,
        source: input.source,
      })
      .select("id")
      .single();

    if (error || !data) return null;
    return data.id as string;
  } catch {
    return null;
  }
}

/** Эх сурвалжийг гарчиг болон холбоосоор нь толгойд дамжуулна. */
function citationHeader(hits: KnowledgeHit[]): string {
  return Buffer.from(
    JSON.stringify(
      hits.slice(0, 5).map((hit) => ({
        label: hit.title,
        href: hit.href,
        kind: hit.kind,
      })),
    ),
    "utf8",
  ).toString("base64");
}

export async function POST(request: Request) {
  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return new Response("Буруу хүсэлт", { status: 400 });
  }

  const message = (body.message ?? "").trim();
  const mode: AiMode = body.mode ?? "ask";

  if (!message) {
    return new Response("Асуулт хоосон байна", { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return new Response("Асуулт хэт урт байна", { status: 400 });
  }

  /*
   * Корпусыг өгөгдлийн сангийн хичээлээс угсарна — ингэснээр админ
   * шинээр нэмсэн хичээл AI-д ШУУД мэдэгдэнэ. Supabase ажиллахгүй бол
   * getLessons() локал өгөгдөл рүү унана.
   */
  let corpus;
  try {
    corpus = buildCorpus(await getLessons());
  } catch {
    corpus = buildCorpus();
  }

  const result = retrieve(message, corpus);

  /*
   * Сурагчийн анги, сул сэдвийг мэдвэл хариултаа тэр түвшинд тааруулна.
   * Нэвтрээгүй бол хоосон буцна — хувийн мэдээлэл ашиглагдахгүй.
   */
  const learner = await getLearnerContext();

  const apiKey = process.env.OPENAI_API_KEY;
  const useOpenAi = Boolean(apiKey) && result.hits.length > 0;

  const questionId = await logQuestion({
    question: message,
    mode,
    matched: result.confident,
    topScore: result.topScore,
    topMatch: result.hits[0]?.title ?? null,
    source: useOpenAi ? "openai" : "knowledge-base",
  });

  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Ai-Matched": String(result.confident),
    "X-Ai-Score": String(result.topScore),
    "X-Ai-Citations": citationHeader(result.hits),
    "X-Ai-Personalized": String(learner.available),
  };
  if (questionId) headers["X-Ai-Question-Id"] = questionId;

  /* ── Мэдлэгийн санд юу ч олдсонгүй: зохиохгүй, шулуухан хэлнэ ── */
  if (result.hits.length === 0) {
    return new Response(streamText(notFoundAnswer(message, result.nearMisses)), {
      headers: { ...headers, "X-Ai-Source": "not-found" },
    });
  }

  /* ── Түлхүүр байхгүй: мэдлэгийн сангийн нөөц хариулт ── */
  if (!useOpenAi) {
    return new Response(streamText(buildFallbackAnswer(mode, message, result)), {
      headers: { ...headers, "X-Ai-Source": "knowledge-base" },
    });
  }

  /* ── OpenAI streaming ── */
  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        stream: true,
        /* Бага температур — түүхэн баримтад бүтээлч байдал хэрэггүй */
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              buildSystemPrompt(mode, result.hits) +
              personalizationPrompt(learner),
          },
          ...(body.history ?? []).slice(-6),
          { role: "user", content: message },
        ],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(
        streamText(buildFallbackAnswer(mode, message, result)),
        { headers: { ...headers, "X-Ai-Source": "knowledge-base-fallback" } },
      );
    }

    /* SSE-г цэвэр текст болгон хөрвүүлнэ */
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    const transformed = upstream.body.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          buffer += decoder.decode(chunk, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") return;
            try {
              const parsed = JSON.parse(payload);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              /* Бүрэн бус JSON — дараагийн chunk-д үргэлжилнэ */
            }
          }
        },
      }),
    );

    return new Response(transformed, {
      headers: { ...headers, "X-Ai-Source": "openai" },
    });
  } catch {
    return new Response(streamText(buildFallbackAnswer(mode, message, result)), {
      headers: { ...headers, "X-Ai-Source": "knowledge-base-error" },
    });
  }
}
