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
import { mergeHits, semanticSearch } from "@/lib/ai/embeddings";
import { createClient } from "@/lib/supabase/server";
import {
  webContextPrompt,
  webOnlyAnswer,
  webSearch,
  type WebResult,
} from "@/lib/ai/web-search";

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

  const keywordResult = retrieve(message, corpus);

  /*
   * ХОЛИМОГ ХАЙЛТ
   *
   * Түлхүүр үгийн хайлт нь нэр, он цагийг олоход хүчтэй. Утгын хайлт нь
   * өөр үгээр асуусныг олоход хүчтэй. Хоёуланг нь нэгтгэвэл хамгийн сайн.
   *
   * Утгын хайлт бэлэн биш (OPENAI_API_KEY эсвэл 0005 migration байхгүй)
   * бол хоосон массив буцаах тул түлхүүр үгийн үр дүн хэвээр үлдэнэ.
   */
  const semanticHits = await semanticSearch(message);

  const result =
    semanticHits.length > 0
      ? {
          ...keywordResult,
          hits: mergeHits(keywordResult.hits, semanticHits),
          confident: keywordResult.confident || semanticHits.length > 0,
        }
      : keywordResult;

  /*
   * Сурагчийн анги, сул сэдвийг мэдвэл хариултаа тэр түвшинд тааруулна.
   * Нэвтрээгүй бол хоосон буцна — хувийн мэдээлэл ашиглагдахгүй.
   */
  const learner = await getLearnerContext();

  const apiKey = process.env.OPENAI_API_KEY;

  /*
   * ВЭБ ХАЙЛТ РУУ ШИЛЖИХ
   *
   * Мэдлэгийн санд юу ч олдоогүй бол «мэдэхгүй» гээд орхихгүй —
   * интернэтээс хайна. Википедиа түлхүүргүй ажилладаг тул энэ нь
   * ямар ч тохиргоогүйгээр идэвхтэй байна.
   *
   * Олдсон ч гэсэн энэ нь сурах бичгээс гадуурх мэдээлэл гэдгийг
   * хариулт дотор ил хэлнэ (`webContextPrompt` / `webOnlyAnswer`).
   */
  let webResults: WebResult[] = [];
  if (result.hits.length === 0) {
    webResults = await webSearch(message);
  }

  const useOpenAi =
    Boolean(apiKey) && (result.hits.length > 0 || webResults.length > 0);

  const questionId = await logQuestion({
    question: message,
    mode,
    matched: result.confident,
    topScore: result.topScore,
    topMatch: result.hits[0]?.title ?? null,
    source: useOpenAi
      ? webResults.length > 0
        ? "openai+web"
        : "openai"
      : webResults.length > 0
        ? "web"
        : "knowledge-base",
  });

  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Ai-Matched": String(result.confident),
    "X-Ai-Score": String(result.topScore),
    "X-Ai-Citations": citationHeader(result.hits),
    "X-Ai-Personalized": String(learner.available),
    "X-Ai-Semantic": String(semanticHits.length),
    "X-Ai-Web": String(webResults.length),
  };
  if (questionId) headers["X-Ai-Question-Id"] = questionId;

  /* ── Санд ч, вэбэд ч олдсонгүй: зохиохгүй, шулуухан хэлнэ ── */
  if (result.hits.length === 0 && webResults.length === 0) {
    return new Response(streamText(notFoundAnswer(message, result.nearMisses)), {
      headers: { ...headers, "X-Ai-Source": "not-found" },
    });
  }

  /* ── Санд алга, вэбээс олдсон, түлхүүр байхгүй: хураангуйг өгнө ── */
  if (result.hits.length === 0 && !apiKey) {
    /* Вэбийн эх сурвалжийг ишлэлийн толгойд оруулна */
    const webCitations = Buffer.from(
      JSON.stringify(
        webResults.slice(0, 5).map((item) => ({
          label: item.title,
          href: item.url,
          kind: "web" as const,
        })),
      ),
      "utf8",
    ).toString("base64");

    return new Response(streamText(webOnlyAnswer(message, webResults)), {
      headers: {
        ...headers,
        "X-Ai-Citations": webCitations,
        "X-Ai-Source": "web",
      },
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
              personalizationPrompt(learner) +
              (webResults.length > 0 ? webContextPrompt(webResults) : ""),
          },
          ...(body.history ?? []).slice(-6),
          { role: "user", content: message },
        ],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      /*
       * OpenAI бүтэлгүйтвэл сурагч үүнийг мэдэх шаардлагагүй — мэдлэгийн
       * сангийн хариулт хэвийн үргэлжилнэ. Гэхдээ админ ЯАГААД гэдгийг
       * мэдэх ёстой тул шалтгааныг толгойд тавина. Түлхүүрийн утга
       * хэзээ ч энд орохгүй — зөвхөн статус, OpenAI-ийн мессеж.
       */
      let reason = `HTTP ${upstream.status}`;
      try {
        const errorBody = await upstream.json();
        const detail = errorBody?.error?.message;
        if (detail) reason += `: ${String(detail).slice(0, 180)}`;
      } catch {
        /* Биегүй хариу — статус л хангалттай */
      }

      const text =
        result.hits.length > 0
          ? buildFallbackAnswer(mode, message, result)
          : webOnlyAnswer(message, webResults);

      return new Response(streamText(text), {
        headers: {
          ...headers,
          "X-Ai-Source": "knowledge-base-fallback",
          /* Толгойд зөвхөн ASCII зөвшөөрөгддөг */
          "X-Ai-Openai-Error": encodeURIComponent(reason),
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
      headers: { ...headers, "X-Ai-Source": "openai" },
    });
  } catch {
    const text =
      result.hits.length > 0
        ? buildFallbackAnswer(mode, message, result)
        : webOnlyAnswer(message, webResults);
    return new Response(streamText(text), {
      headers: { ...headers, "X-Ai-Source": "knowledge-base-error" },
    });
  }
}
