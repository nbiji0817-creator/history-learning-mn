import { getCurrentUser } from "@/lib/auth-server";
import { buildCorpus, retrieve } from "@/lib/ai/knowledge";
import { getLessons } from "@/lib/repo";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * AI-ААР АГУУЛГА ҮҮСГЭХ (ноорог)
 *
 * ЗАРЧИМ
 *   1. Үр дүн нь ЗӨВХӨН НООРОГ. Шууд хадгалахгүй — багш уншиж, засаж,
 *      баталсны дараа л өгөгдлийн санд орно. AI-г хянуулалгүй нийтлэх нь
 *      сурах бичгийн агуулгад буруу мэдээлэл оруулах эрсдэлтэй.
 *   2. Системд байгаа баталгаатай агуулгыг контекст болгож өгнө — AI
 *      шинээр түүх зохиохоос сэргийлнэ.
 *   3. Зөвхөн багш/админ дуудна.
 */

interface GenerateBody {
  kind?: "lesson" | "questions";
  topic?: string;
  grade?: number;
  count?: number;
  difficulty?: string;
}

/* ────────────────────  Ноорогийн бүтэц  ──────────────────── */

const LESSON_SCHEMA = `{
  "title": "Хичээлийн гарчиг",
  "subtitle": "Богино дэд гарчиг",
  "icon": "нэг эмодзи",
  "summary": "1-2 өгүүлбэрийн товч тайлбар",
  "objectives": ["суралцах зорилго 1", "зорилго 2", "зорилго 3"],
  "sections": [
    { "type": "text", "title": "Блокийн гарчиг", "body": "2-4 догол мөр текст. Догол мөрийг \\n\\n-ээр салга." },
    { "type": "keypoints", "title": "Гол санаа", "points": ["санаа 1", "санаа 2", "санаа 3", "санаа 4"] },
    { "type": "concepts", "title": "Нэр томьёо", "concepts": [{ "term": "нэр", "definition": "тайлбар" }] }
  ],
  "conclusion": "Хичээлийн дүгнэлт",
  "tags": ["шошго1", "шошго2"]
}`;

const QUESTIONS_SCHEMA = `{
  "questions": [
    {
      "prompt": "Асуулт",
      "options": ["сонголт A", "сонголт B", "сонголт C", "сонголт D"],
      "answerIndex": 0,
      "explanation": "Яагаад энэ хариулт зөв болохын тайлбар",
      "difficulty": "easy | medium | hard",
      "topic": "сэдвийн нэр"
    }
  ]
}`;

function systemPrompt(kind: "lesson" | "questions", context: string): string {
  return [
    "Чи бол Монголын ерөнхий боловсролын сургуулийн түүхийн багшид туслах систем.",
    "Зөвхөн Монгол хэлээр, зөвхөн JSON форматаар хариул. Тайлбар текст бүү нэм.",
    "",
    "ҮНЭН ЗӨВ БАЙХ ДҮРЭМ:",
    "1. Доорх баталгаатай материалд тулгуурла. Түүнд байхгүй он цаг, нэр, тоог БҮҮ ЗОХИО.",
    "2. Материалд «ойролцоогоор» эсвэл «маргаантай» гэсэн тэмдэглэгээ байвал тэр чигээр нь хадгал.",
    "3. Эргэлзээтэй зүйлийг оруулахаас татгалз — дутуу байх нь буруу байхаас дээр.",
    "4. Түүхэн маргаантай асуудалд нэг талыг бүү бари.",
    "5. Хэл найруулга нь 6–12-р ангийн сурагчид ойлгомжтой байх ёстой.",
    "",
    kind === "lesson"
      ? `Яг ЭНЭ бүтэцтэй JSON буцаа:\n${LESSON_SCHEMA}`
      : `Яг ЭНЭ бүтэцтэй JSON буцаа:\n${QUESTIONS_SCHEMA}`,
    "",
    "=== БАТАЛГААТАЙ МАТЕРИАЛ ===",
    context || "(Системд энэ сэдвээр материал алга. Ерөнхий түүхийн мэдлэгээ болгоомжтой ашигла, эргэлзээтэй он цагийг бүү бич.)",
  ].join("\n");
}

export async function POST(request: Request) {
  /* ── Эрх ── */
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }
  if (user.profile.role !== "teacher" && user.profile.role !== "admin") {
    return Response.json({ error: "Танд энэ эрх алга" }, { status: 403 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "OPENAI_API_KEY тохируулаагүй байна. Vercel → Environment Variables хэсэгт нэмээд дахин deploy хийнэ үү.",
      },
      { status: 503 },
    );
  }

  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return Response.json({ error: "Буруу хүсэлт" }, { status: 400 });
  }

  const kind = body.kind === "questions" ? "questions" : "lesson";
  const topic = (body.topic ?? "").trim();
  const grade = body.grade ?? 6;
  const count = Math.min(Math.max(body.count ?? 5, 1), 10);

  if (topic.length < 3) {
    return Response.json({ error: "Сэдвээ бичнэ үү" }, { status: 400 });
  }

  /* ── Системд байгаа материалыг контекст болгоно ── */
  let context = "";
  try {
    const corpus = buildCorpus(await getLessons());
    const result = retrieve(topic, corpus, 6);
    context = result.hits
      .map((hit, index) => `[${index + 1}] ${hit.title}\n${hit.body}`)
      .join("\n\n");
  } catch {
    /* Контекстгүй ч ажиллана — заавар нь болгоомжтой байхыг шаардана */
  }

  const userPrompt =
    kind === "lesson"
      ? `${grade}-р ангид зориулж «${topic}» сэдвээр хичээл боловсруул. 3–5 блоктой байг: эхэнд текст, дараа нь гол санаа, боломжтой бол нэр томьёо.`
      : `${grade}-р ангид зориулж «${topic}» сэдвээр ${count} тестийн асуулт үүсгэ. Асуулт бүр 4 сонголттой, зөв хариулт нэг, тайлбартай байг. Сонголтууд бодитой, ойролцоо түвшинтэй байх ёстой — илт худал сонголт бүү хий.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt(kind, context) },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return Response.json(
        { error: `OpenAI алдаа (${response.status}): ${detail.slice(0, 200)}` },
        { status: 502 },
      );
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json({ error: "Хоосон хариу ирлээ" }, { status: 502 });
    }

    let draft: unknown;
    try {
      draft = JSON.parse(content);
    } catch {
      return Response.json(
        { error: "AI буруу форматтай хариу буцаалаа. Дахин оролдоно уу." },
        { status: 502 },
      );
    }

    return Response.json({
      ok: true,
      kind,
      draft,
      groundedIn: context ? context.split("\n\n").length : 0,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Үүсгэхэд тодорхойгүй алдаа гарлаа",
      },
      { status: 500 },
    );
  }
}
