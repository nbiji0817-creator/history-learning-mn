import type { AiMode } from "@/types";
import {
  buildFallbackAnswer,
  buildSystemPrompt,
  retrieve,
} from "@/lib/ai/knowledge";

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

  const hits = retrieve(message);
  const apiKey = process.env.OPENAI_API_KEY;

  /* ── Түлхүүр байхгүй: мэдлэгийн сангийн нөөц хариулт ── */
  if (!apiKey) {
    return new Response(streamText(buildFallbackAnswer(mode, message, hits)), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Ai-Source": "knowledge-base",
        "Cache-Control": "no-store",
      },
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
        temperature: 0.3,
        messages: [
          { role: "system", content: buildSystemPrompt(mode, hits) },
          ...(body.history ?? []).slice(-6),
          { role: "user", content: message },
        ],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(streamText(buildFallbackAnswer(mode, message, hits)), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Ai-Source": "knowledge-base-fallback",
        },
      });
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
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Ai-Source": "openai",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response(streamText(buildFallbackAnswer(mode, message, hits)), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Ai-Source": "knowledge-base-error",
      },
    });
  }
}
