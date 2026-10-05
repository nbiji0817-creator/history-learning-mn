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
import { activeChatProvider, streamChat } from "@/lib/ai/provider";
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

  /* Аль нийлүүлэгч идэвхтэйг тодорхойлно (Gemini → OpenAI → байхгүй) */
  const provider = activeChatProvider();

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

  const useModel =
    provider !== null && (result.hits.length > 0 || webResults.length > 0);

  const questionId = await logQuestion({
    question: message,
    mode,
    matched: result.confident,
    topScore: result.topScore,
    topMatch: result.hits[0]?.title ?? null,
    source: useModel
      ? webResults.length > 0
        ? `${provider}+web`
        : String(provider)
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
  if (result.hits.length === 0 && provider === null) {
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

  /* ── Нийлүүлэгч байхгүй: мэдлэгийн сангийн нөөц хариулт ── */
  if (!useModel) {
    return new Response(streamText(buildFallbackAnswer(mode, message, result)), {
      headers: { ...headers, "X-Ai-Source": "knowledge-base" },
    });
  }

  /* ── Нийлүүлэгчээр урсгах (Gemini эсвэл OpenAI) ── */
  const outcome = await streamChat({
    system:
      buildSystemPrompt(mode, result.hits) +
      personalizationPrompt(learner) +
      (webResults.length > 0 ? webContextPrompt(webResults) : ""),
    history: (body.history ?? []).slice(-6),
    message,
  });

  if ("error" in outcome) {
    /*
     * Нийлүүлэгч бүтэлгүйтвэл сурагч үүнийг мэдэх шаардлагагүй —
     * мэдлэгийн сангийн хариулт хэвийн үргэлжилнэ. Гэхдээ админ
     * ЯАГААД гэдгийг мэдэх ёстой тул шалтгааныг толгойд тавина.
     * Түлхүүрийн утга хэзээ ч энд орохгүй.
     */
    const text =
      result.hits.length > 0
        ? buildFallbackAnswer(mode, message, result)
        : webOnlyAnswer(message, webResults);

    return new Response(streamText(text), {
      headers: {
        ...headers,
        "X-Ai-Source": "knowledge-base-fallback",
        /* Толгойд зөвхөн ASCII зөвшөөрөгддөг */
        "X-Ai-Provider-Error": encodeURIComponent(outcome.error),
      },
    });
  }

  return new Response(outcome.stream, {
    headers: {
      ...headers,
      "X-Ai-Source": outcome.provider,
      /* Аль загвар хариулсан — нөөц загвар ажилласан эсэхийг харуулна */
      ...(outcome.model ? { "X-Ai-Model": outcome.model } : {}),
    },
  });
}
