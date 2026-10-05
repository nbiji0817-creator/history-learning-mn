import "server-only";

/**
 * AI НИЙЛҮҮЛЭГЧ
 *
 * Хоёр нийлүүлэгчийг дэмжинэ. Аль нь тохируулагдсанаас хамаарч
 * автоматаар сонгоно — код өөрчлөх шаардлагагүй:
 *
 *   1. GEMINI_API_KEY  — Google Gemini. ҮНЭГҮЙ БАГЦТАЙ, карт
 *                        шаардахгүй. aistudio.google.com-оос авна.
 *   2. OPENAI_API_KEY  — OpenAI. Төлбөртэй, кредит шаардана.
 *
 * Хоёулаа байвал Gemini-г сонгоно (үнэгүй). Аль нь ч байхгүй бол
 * систем мэдлэгийн сангийн нөөц хариулт руу унана — сурагч хоосон
 * гараас буцахгүй.
 *
 * ЯАГААД ТУСАД НЬ МОДУЛЬ ВЭ: хоёр нийлүүлэгчийн хүсэлтийн бие,
 * урсгалын хэлбэр нь өөр. Үүнийг маршрут дотор холивол уншихад
 * бэрх болно.
 */

export type ChatProvider = "gemini" | "openai";

/** Түлхүүрийг зай тайрч уншина — хуулж буулгахад зай үлддэг. */
function key(name: string): string {
  return (process.env[name] ?? "").trim();
}

/** Аль нийлүүлэгч идэвхтэй вэ. Аль нь ч тохируулаагүй бол `null`. */
export function activeChatProvider(): ChatProvider | null {
  if (key("GEMINI_API_KEY")) return "gemini";
  if (key("OPENAI_API_KEY")) return "openai";
  return null;
}

/**
 * Тохиргооны асуудлыг монголоор тайлбарлана. Бүх зүйл зөв бол `null`.
 * Түлхүүрийн УТГЫГ хэзээ ч буцаахгүй.
 */
export function describeChatProvider(): string | null {
  const gemini = key("GEMINI_API_KEY");
  const openai = key("OPENAI_API_KEY");

  if (!gemini && !openai) {
    return "AI-ийн түлхүүр тохируулаагүй байна. GEMINI_API_KEY (үнэгүй) эсвэл OPENAI_API_KEY нэмнэ үү.";
  }

  if (gemini && gemini.length < 20) {
    return `GEMINI_API_KEY дутуу байна: ${gemini.length} тэмдэгт. Бүтнээр нь хуулж буулгана уу.`;
  }

  if (!gemini && openai) {
    if (!openai.startsWith("sk-")) {
      return "OPENAI_API_KEY буруу байна: жинхэнэ түлхүүр «sk-» гэж эхэлдэг.";
    }
    if (openai.length < 40) {
      return `OPENAI_API_KEY дутуу байна: ${openai.length} тэмдэгт.`;
    }
  }

  return null;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

type StreamResult =
  | { stream: ReadableStream<Uint8Array>; provider: ChatProvider }
  | { error: string };

/* ────────────────────────  Gemini  ──────────────────────── */

/*
 * Google загвараа тогтмол шинэчилж, хуучныг нь хаадаг. Хаагдсан
 * загвар дуудвал 404 буцаж, хариултын текстэд ОРЛУУЛАХ загварын нэр
 * бичигдэж ирдэг — тэр мессежийг `/api/health`, админ самбарт ил
 * гаргадаг тул дараагийн удаа шууд мэдэгдэнэ.
 *
 * Шинэчлэхдээ энд засах, эсвэл GEMINI_MODEL хувьсагчаар дарна.
 */
const GEMINI_DEFAULT_MODEL = "gemini-3.8-flash";

async function streamGemini(
  system: string,
  history: ChatTurn[],
  message: string,
): Promise<StreamResult> {
  const model = (process.env.GEMINI_MODEL ?? "").trim() || GEMINI_DEFAULT_MODEL;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key("GEMINI_API_KEY"),
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [
          /* Gemini-д туслахын үүргийг «model» гэж нэрлэдэг */
          ...history.map((turn) => ({
            role: turn.role === "assistant" ? "model" : "user",
            parts: [{ text: turn.content }],
          })),
          { role: "user", parts: [{ text: message }] },
        ],
        /* Бага температур — түүхэн баримтад бүтээлч байдал хэрэггүй */
        generationConfig: { temperature: 0.2 },
      }),
    },
  );

  if (!response.ok || !response.body) {
    return { error: await describeFailure(response, "Gemini") };
  }

  return { stream: parseSse(response.body, extractGeminiText), provider: "gemini" };
}

function extractGeminiText(payload: unknown): string | null {
  const parts = (
    payload as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    }
  )?.candidates?.[0]?.content?.parts;

  if (!parts) return null;
  return parts.map((part) => part.text ?? "").join("") || null;
}

/* ────────────────────────  OpenAI  ──────────────────────── */

async function streamOpenAi(
  system: string,
  history: ChatTurn[],
  message: string,
): Promise<StreamResult> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key("OPENAI_API_KEY")}`,
    },
    body: JSON.stringify({
      model: (process.env.OPENAI_MODEL ?? "").trim() || "gpt-4o-mini",
      stream: true,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        ...history,
        { role: "user", content: message },
      ],
    }),
  });

  if (!response.ok || !response.body) {
    return { error: await describeFailure(response, "OpenAI") };
  }

  return { stream: parseSse(response.body, extractOpenAiText), provider: "openai" };
}

function extractOpenAiText(payload: unknown): string | null {
  return (
    (payload as { choices?: { delta?: { content?: string } }[] })?.choices?.[0]
      ?.delta?.content ?? null
  );
}

/* ────────────────────────  Нийтлэг  ──────────────────────── */

/** Алдааг монгол тайлбартай нь хамт эмхэтгэнэ. Түлхүүр энд орохгүй. */
async function describeFailure(
  response: Response,
  label: string,
): Promise<string> {
  let detail = "";
  try {
    const body = await response.json();
    detail =
      (body as { error?: { message?: string } })?.error?.message ?? "";
  } catch {
    detail = await response.text().catch(() => "");
  }

  /*
   * Статусаас илүү МЕССЕЖ нь оновчтой байдаг. Gemini буруу түлхүүрт
   * 401 биш 400 буцаадаг тул зөвхөн статусаар шүүвэл «загварын нэрээ
   * шалга» гэж буруу чиглүүлнэ.
   */
  const lower = detail.toLowerCase();

  /*
   * Дараалал чухал. «This model is currently experiencing high
   * demand» гэсэн ачааллын мессеж дотор «model» гэсэн үг байдаг тул
   * загварын шалгалтыг эхэнд тавивал «загвар олдсонгүй» гэж буруу
   * чиглүүлнэ. Тиймээс ТОДОРХОЙ шалтгаануудыг эхэлж шалгана.
   */
  let hint = "";
  if (/high demand|overload|unavailable|try again later/.test(lower)) {
    hint = "Нийлүүлэгч түр ачаалалтай байна. Хэсэг хүлээгээд дахин оролдоно уу.";
  } else if (/api key|api_key|credential|unauthenticated/.test(lower)) {
    hint = "Түлхүүр буруу эсвэл хүчингүй байна. Бүтнээр нь хуулж буулгасан эсэхээ шалгана уу.";
  } else if (/quota|rate limit|exceeded|billing|insufficient/.test(lower)) {
    hint = "Хязгаар хэтэрсэн эсвэл кредит дууссан байна.";
  } else if (/no longer available|not found|is not supported/.test(lower)) {
    hint = "Загвар олдсонгүй эсвэл хаагдсан — GEMINI_MODEL-ыг шалгана уу.";
  } else if (/permission|forbidden/.test(lower)) {
    hint = "Энэ түлхүүрт эрх алга.";
  } else if (response.status === 429 || response.status === 503) {
    hint = "Нийлүүлэгч завгүй байна. Хэсэг хүлээгээд дахин оролдоно уу.";
  }

  return (
    `${label} ${response.status} алдаа. ` +
    hint +
    (detail ? ` (${detail.slice(0, 200)})` : "")
  );
}

/**
 * SSE урсгалыг цэвэр текст болгоно.
 *
 * Хоёр нийлүүлэгч хоёулаа `data: {json}` мөрөөр урсгадаг ч JSON-ийн
 * бүтэц нь өөр. Тиймээс текст сугалах функцийг гаднаас өгнө.
 */
function parseSse(
  body: ReadableStream<Uint8Array>,
  extract: (payload: unknown) => string | null,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return body.pipeThrough(
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
            const text = extract(JSON.parse(payload));
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            /* Бүрэн бус JSON — дараагийн chunk-д үргэлжилнэ */
          }
        }
      },
    }),
  );
}

/**
 * Идэвхтэй нийлүүлэгчээр хариулт урсгана.
 *
 * Алдаа гарвал шалтгааныг буцаана — дуудагч нь мэдлэгийн сангийн
 * нөөц хариулт руу унаж, шалтгааныг толгойд тавина.
 */
/**
 * Түр зуурын алдаанд дахин оролдох эсэх.
 *
 * 503 (ачаалал), 429 (хурдны хязгаар) нь хэдхэн зуун миллисекундын
 * дараа өөрөө арилдаг. Буруу түлхүүр, хаагдсан загвар зэрэг
 * ТОГТМОЛ алдаанд дахин оролдох нь утгагүй — хэрэглэгчийг хүлээлгэх
 * төдий.
 */
function isTransient(message: string): boolean {
  return /(429|503)|ачаалалтай|завгүй/.test(message);
}

const RETRIES = 2;
const RETRY_DELAY_MS = 700;

export async function streamChat(options: {
  system: string;
  history: ChatTurn[];
  message: string;
}): Promise<StreamResult> {
  const provider = activeChatProvider();
  if (!provider) return { error: "AI-ийн түлхүүр тохируулаагүй байна." };

  const problem = describeChatProvider();
  if (problem) return { error: problem };

  let last: StreamResult = { error: "Тодорхойгүй алдаа." };

  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      last =
        provider === "gemini"
          ? await streamGemini(options.system, options.history, options.message)
          : await streamOpenAi(options.system, options.history, options.message);
    } catch (error) {
      last = {
        error:
          error instanceof Error
            ? `Сүлжээний алдаа: ${error.message}`
            : "Тодорхойгүй алдаа.",
      };
    }

    if (!("error" in last)) return last;
    if (!isTransient(last.error) || attempt === RETRIES) return last;

    await new Promise((resolve) =>
      setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)),
    );
  }

  return last;
}
