import type { AiMode, AiModeInfo } from "@/types";
import { lessons } from "@/data/lessons";
import { historicalFigures } from "@/data/figures";
import { historicalEvents } from "@/data/events";
import { historicalSources } from "@/data/sources";
import { glossaryTerms } from "@/data/glossary";

/**
 * AI-ийн МЭДЛЭГИЙН САН
 *
 * AI дур мэдэн түүх зохиохгүй байх зарчмыг хангахын тулд хариулт нь
 * системд байгаа баталгаатай агуулгад тулгуурлана (RAG-ийн энгийн хувилбар).
 * Phase 7-д Supabase pgvector + embedding ашиглан илүү нарийвчилсан
 * хайлт хийж болно — доорх `retrieve` функцийг солиход хангалттай.
 */

export const aiModes: AiModeInfo[] = [
  { key: "ask", label: "Асуулт асуух", icon: "❓", hint: "Түүхийн аливаа асуултаа асуу" },
  { key: "explain", label: "Надад тайлбарла", icon: "💡", hint: "Ойлгомжтой, энгийн үгээр" },
  { key: "quiz_me", label: "Шалгалт ав", icon: "📝", hint: "Сэдвээр асуулт асууж шалга" },
  { key: "challenge", label: "Намайг сорь", icon: "🔥", hint: "Хүнд асуултаар сорих" },
  { key: "teach", label: "Хичээл заа", icon: "👩‍🏫", hint: "Сэдвийг эхнээс нь заа" },
  { key: "review_mistakes", label: "Алдааг тайлбарла", icon: "🔍", hint: "Буруу хариултын учрыг олох" },
  { key: "debate", label: "Мэтгэлцээн", icon: "⚖️", hint: "Түүхэн маргаантай сэдвээр" },
  { key: "roleplay", label: "Түүхэн хүний дүрд", icon: "🎭", hint: "Түүхэн хүнтэй ярилцах" },
];

export interface KnowledgeHit {
  kind: "lesson" | "figure" | "event" | "source" | "term";
  title: string;
  body: string;
  href: string;
  score: number;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function scoreOf(haystack: string, tokens: string[]): number {
  const text = haystack.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (text.includes(token)) score += 1;
    /* Монгол хэлний нөхцөл, залгаварыг ойролцоогоор барих */
    if (token.length > 4 && text.includes(token.slice(0, token.length - 2))) {
      score += 0.5;
    }
  }
  return score;
}

/** Асуултад хамааралтай агуулгыг мэдлэгийн сангаас түүнэ. */
export function retrieve(query: string, limit = 6): KnowledgeHit[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const hits: KnowledgeHit[] = [];

  for (const lesson of lessons) {
    const text = [
      lesson.title,
      lesson.subtitle,
      lesson.summary,
      lesson.conclusion,
      ...lesson.tags,
      ...lesson.sections.map((section) => `${section.title} ${section.body ?? ""}`),
    ].join(" ");
    const score = scoreOf(text, tokens);
    if (score > 0) {
      hits.push({
        kind: "lesson",
        title: `${lesson.grade}-р анги — ${lesson.title}`,
        body: `${lesson.summary}\n${lesson.conclusion}`,
        href: `/lessons/${lesson.slug}`,
        score: score * 1.2,
      });
    }
  }

  for (const figure of historicalFigures) {
    const text = [
      figure.name,
      figure.title,
      figure.summary,
      figure.born,
      figure.died,
      ...figure.achievements,
      ...figure.tags,
    ].join(" ");
    const score = scoreOf(text, tokens);
    if (score > 0) {
      hits.push({
        kind: "figure",
        title: figure.name,
        body: `${figure.title} (${figure.born} – ${figure.died}). ${figure.summary} Гол гавьяа: ${figure.achievements.join("; ")}.`,
        href: `/people/${figure.slug}`,
        score: score * 1.4,
      });
    }
  }

  for (const event of historicalEvents) {
    const text = [
      event.title,
      event.year,
      event.place,
      event.summary,
      event.cause ?? "",
      event.course ?? "",
      event.result ?? "",
      event.significance ?? "",
      ...event.tags,
    ].join(" ");
    const score = scoreOf(text, tokens);
    if (score > 0) {
      hits.push({
        kind: "event",
        title: `${event.year} — ${event.title}`,
        body: [
          event.summary,
          event.cause ? `Шалтгаан: ${event.cause}` : "",
          event.result ? `Үр дүн: ${event.result}` : "",
          event.significance ? `Ач холбогдол: ${event.significance}` : "",
        ]
          .filter(Boolean)
          .join(" "),
        href: `/events#${event.id}`,
        score: score * 1.5,
      });
    }
  }

  for (const source of historicalSources) {
    const score = scoreOf(
      [source.title, source.excerpt, source.guidance, ...source.tags].join(" "),
      tokens,
    );
    if (score > 0) {
      hits.push({
        kind: "source",
        title: source.title,
        body: `${source.excerpt} ${source.guidance}`,
        href: `/sources#${source.id}`,
        score,
      });
    }
  }

  for (const term of glossaryTerms) {
    const score = scoreOf(`${term.term} ${term.definition}`, tokens);
    if (score > 0) {
      hits.push({
        kind: "term",
        title: term.term,
        body: term.definition,
        href: `/dictionary#${encodeURIComponent(term.term)}`,
        score: score * 1.1,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** OpenAI-д дамжуулах системийн заавар. */
export function buildSystemPrompt(mode: AiMode, hits: KnowledgeHit[]): string {
  const modeInstruction: Record<AiMode, string> = {
    ask: "Асуултад товч хариулаад, дараа нь дэлгэрэнгүй тайлбарла.",
    explain: "Сэдвийг 6–12-р ангийн сурагчид ойлгомжтой, энгийн үгээр тайлбарла. Жишээ ашигла.",
    quiz_me: "Сэдвээр 5 асуулт үүсгэ. Асуулт бүрд 4 сонголт, зөв хариулт, тайлбар бич.",
    challenge: "Хүндэвтэр, сэтгэн бодох шаардлагатай асуулт тавьж сурагчийг сорь.",
    teach: "Сэдвийг богино хичээл байдлаар заа: зорилго → гол ойлголт → тайлбар → дүгнэлт → 2 асуулт.",
    review_mistakes: "Сурагчийн буруу хариултын учир шалтгааныг тайлбарлаж, зөв ойлголтыг тодруул.",
    debate: "Түүхэн маргаантай асуудлын хоёр талыг тэнцвэртэй танилцуулж, сурагчийг өөрийн байр суурьтай болгох асуулт тавь.",
    roleplay:
      "Хэрэглэгчийн сонгосон түүхэн хүний дүрд ор. Гэхдээ хариултын төгсгөлд «Энэ бол сургалтын зорилготой дүрд тоглолт» гэж сануул.",
  };

  const context = hits
    .map((hit) => `[${hit.title}]\n${hit.body}\nЭх сурвалж: ${hit.href}`)
    .join("\n\n");

  return [
    "Чи бол Монголын ерөнхий боловсролын сургуулийн 6–12-р ангийн түүхийн багш.",
    "Зөвхөн Монгол хэлээр хариул.",
    modeInstruction[mode],
    "ЧУХАЛ ДҮРЭМ:",
    "1. Доорх мэдлэгийн сангийн агуулгад тулгуурлан хариул.",
    "2. Мэдлэгийн санд байхгүй зүйлийг зохиож болохгүй. Мэдэхгүй бол «Энэ талаар системийн материалд мэдээлэл алга» гэж хэл.",
    "3. Он цаг, нэрийг өөрчилж болохгүй.",
    "4. Маргаантай түүхэн асуудалд нэг талыг барихгүй, өөр өөр үзэл бодлыг дурд.",
    "5. Хариултынхаа төгсгөлд холбогдох хичээл рүү заасан холбоос санал болго.",
    "",
    "=== МЭДЛЭГИЙН САН ===",
    context || "(Хамааралтай агуулга олдсонгүй)",
  ].join("\n");
}

/**
 * OPENAI_API_KEY байхгүй үед ажиллах нөөц хариулт.
 * Мэдлэгийн сангаас олдсон агуулгыг эмхэтгэн, шууд танилцуулна.
 */
export function buildFallbackAnswer(
  mode: AiMode,
  query: string,
  hits: KnowledgeHit[],
): string {
  if (hits.length === 0) {
    return [
      "Энэ асуултад хариулах мэдээлэл системийн материалд одоогоор алга байна.",
      "",
      "Дараах хэсгээс хайж үзээрэй:",
      "• Хичээлүүд — /grades",
      "• Түүхэн хүмүүс — /people",
      "• Он цагийн хэлхээс — /timeline",
      "• Тайлбар толь — /dictionary",
      "",
      "Эсвэл асуултаа арай тодорхой бичээд дахин оролдоно уу.",
    ].join("\n");
  }

  const header: Record<AiMode, string> = {
    ask: "Асуултын хариулт",
    explain: "Тайлбар",
    quiz_me: "Энэ сэдвээр өөрийгөө шалгах",
    challenge: "Сорилт",
    teach: "Богино хичээл",
    review_mistakes: "Алдааны тайлбар",
    debate: "Хоёр талын үзэл",
    roleplay: "Түүхэн дүрд тоглолт",
  };

  const lines: string[] = [`**${header[mode]}**`, ""];

  const [primary, ...rest] = hits;
  lines.push(`**${primary.title}**`, primary.body, "");

  if (rest.length > 0) {
    lines.push("**Холбогдох мэдээлэл**", "");
    for (const hit of rest.slice(0, 3)) {
      lines.push(`• **${hit.title}** — ${hit.body.slice(0, 220)}…`);
    }
    lines.push("");
  }

  if (mode === "quiz_me" || mode === "challenge") {
    lines.push(
      "**Өөрийгөө шалгах асуулт**",
      "",
      `1. ${primary.title} — энэ юуны тухай вэ?`,
      "2. Энэ үйл явдлын шалтгаан юу байсан бэ?",
      "3. Урт хугацаанд ямар ач холбогдолтой байсан бэ?",
      "",
      "Бүрэн тест өгөхийг хүсвэл /exams хэсэг рүү оч.",
      "",
    );
  }

  if (mode === "debate") {
    lines.push(
      "Түүхэн үйл явдлыг үнэлэхдээ дор хаяж хоёр өнцгөөс хараарай: тухайн үеийн хүмүүсийн байр суурь, болон өнөөгийн бидний харах өнцөг. Аль аль нь өөр өөр дүгнэлтэд хүргэдэг.",
      "",
    );
  }

  if (mode === "roleplay") {
    lines.push(
      "_(Энэ бол сургалтын зорилготой дүрд тоглолт. Бодит түүхэн хүний үг биш.)_",
      "",
    );
  }

  lines.push("**Дэлгэрэнгүй унших**");
  for (const hit of hits.slice(0, 4)) {
    lines.push(`• ${hit.title} → ${hit.href}`);
  }

  lines.push(
    "",
    "_Энэ хариултыг системийн мэдлэгийн сангаас автоматаар эмхэтгэсэн. OpenAI түлхүүр тохируулсны дараа бүрэн ярианы горим идэвхжинэ._",
  );

  return lines.join("\n");
}
