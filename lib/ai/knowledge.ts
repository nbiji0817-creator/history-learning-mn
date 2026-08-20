import type { AiMode, AiModeInfo, Lesson } from "@/types";
import { lessons as localLessons } from "@/data/lessons";
import { historicalFigures } from "@/data/figures";
import { historicalEvents } from "@/data/events";
import { historicalSources } from "@/data/sources";
import { glossaryTerms } from "@/data/glossary";
import { search, type SearchDoc, type SearchHit } from "./search";

/**
 * AI-ийн МЭДЛЭГИЙН САН
 *
 * Зарчим: AI дур мэдэн түүх зохиохгүй. Хариулт нь системд байгаа
 * баталгаатай агуулгад тулгуурлана (RAG).
 *
 * Хайлтын нарийн ажлыг `./search.ts` хийнэ — монгол хэлний залгавар,
 * он тоо, нэрийн богино хэлбэрийг барина.
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

/* ────────────────────────  Корпус  ──────────────────────── */

function lessonDoc(lesson: Lesson): SearchDoc {
  const sectionText = lesson.sections
    .map((section) => {
      const parts = [section.title, section.body ?? ""];

      if (section.points) parts.push(section.points.join(" "));

      if (section.concepts) {
        parts.push(
          section.concepts.map((c) => `${c.term} ${c.definition}`).join(" "),
        );
      }

      /*
       * Инфографик доторх текст хичээлийн жинхэнэ агуулгын нэлээд хэсгийг
       * эзэлдэг (харьцуулалт, статистик, алхмууд). Үүнийг индекслэхгүй бол
       * AI тэр мэдээллийг «мэдэхгүй» гэж хариулна.
       */
      const info = section.infographic;
      if (info) {
        if (info.caption) parts.push(info.caption);
        for (const stat of info.stats ?? []) {
          parts.push(`${stat.label} ${stat.value} ${stat.hint ?? ""}`);
        }
        if (info.compare) {
          parts.push(info.compare.left.title, ...info.compare.left.items);
          parts.push(info.compare.right.title, ...info.compare.right.items);
        }
        for (const step of info.steps ?? []) {
          parts.push(`${step.title} ${step.body}`);
        }
      }

      /* Газрын зургийн тэмдэглэгээ ба ишлэл */
      if (section.map) {
        parts.push(section.map.title, section.map.caption ?? "");
        for (const marker of section.map.markers) {
          parts.push(`${marker.name} ${marker.year} ${marker.description}`);
        }
      }
      if (section.quote) {
        parts.push(section.quote.text, section.quote.author);
      }

      return parts.join(" ");
    })
    .join(" ");

  return {
    id: `lesson:${lesson.slug}`,
    kind: "lesson",
    title: `${lesson.grade}-р анги — ${lesson.title}`,
    body: [
      lesson.summary,
      lesson.objectives.length > 0
        ? `Суралцах зорилго: ${lesson.objectives.join("; ")}`
        : "",
      sectionText.slice(0, 1500),
      lesson.conclusion,
    ]
      .filter(Boolean)
      .join("\n"),
    href: `/lessons/${lesson.slug}`,
    strong: `${lesson.title} ${lesson.subtitle}`,
    medium: `${lesson.tags.join(" ")} ${lesson.summary}`,
    weak: sectionText,
    /* Хичээл нь ерөнхий байдаг тул тодорхой баримтаас бага жинтэй */
    boost: 0.9,
  };
}

/** Локал өгөгдлөөс корпус угсарна. */
export function buildCorpus(lessons: Lesson[] = localLessons): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const lesson of lessons) {
    if (!lesson.published) continue;
    docs.push(lessonDoc(lesson));
  }

  for (const figure of historicalFigures) {
    docs.push({
      id: `figure:${figure.slug}`,
      kind: "figure",
      title: figure.name,
      body: `${figure.title} (${figure.born} – ${figure.died}). ${figure.summary} Гол гавьяа: ${figure.achievements.join("; ")}.`,
      href: `/people/${figure.slug}`,
      strong: figure.name,
      medium: `${figure.title} ${figure.tags.join(" ")}`,
      weak: `${figure.summary} ${figure.achievements.join(" ")} ${figure.born} ${figure.died}`,
      boost: 1.3,
    });
  }

  for (const event of historicalEvents) {
    docs.push({
      id: `event:${event.id}`,
      kind: "event",
      title: `${event.year} — ${event.title}`,
      body: [
        event.summary,
        event.cause ? `Шалтгаан: ${event.cause}` : "",
        event.course ? `Явц: ${event.course}` : "",
        event.result ? `Үр дүн: ${event.result}` : "",
        event.significance ? `Ач холбогдол: ${event.significance}` : "",
      ]
        .filter(Boolean)
        .join(" "),
      href: `/events#${event.id}`,
      strong: `${event.title} ${event.year}`,
      medium: `${event.tags.join(" ")} ${event.place}`,
      weak: `${event.summary} ${event.cause ?? ""} ${event.course ?? ""} ${event.result ?? ""} ${event.significance ?? ""}`,
      year: event.sortYear,
      boost: 1.4,
    });
  }

  for (const source of historicalSources) {
    docs.push({
      id: `source:${source.id}`,
      kind: "source",
      title: source.title,
      body: `${source.excerpt} ${source.guidance}`,
      href: `/sources#${source.id}`,
      strong: source.title,
      medium: `${source.tags.join(" ")} ${source.origin} ${source.year}`,
      weak: `${source.excerpt} ${source.guidance} ${source.analysisQuestion}`,
      boost: 1.1,
    });
  }

  for (const term of glossaryTerms) {
    docs.push({
      id: `term:${term.term}`,
      kind: "term",
      title: term.term,
      body: term.definition,
      href: `/dictionary#${encodeURIComponent(term.term)}`,
      strong: term.term,
      medium: `${term.category} ${term.relatedTerms.join(" ")}`,
      weak: term.definition,
      boost: 1.2,
    });
  }

  return docs;
}

/* ────────────────────────  Хайлт  ──────────────────────── */

export interface KnowledgeHit {
  kind: SearchDoc["kind"];
  title: string;
  body: string;
  href: string;
  score: number;
}

/**
 * Итгэлцүүрийн доод хязгаар. Үүнээс бага бол «мэдэхгүй» гэж хариулна —
 * буруу хариулт өгөхөөс мэдэхгүй гэж хэлэх нь дээр.
 */
const MIN_SCORE = 6;

export interface RetrieveResult {
  hits: KnowledgeHit[];
  /** Хангалттай итгэлтэй хариулт өгөх боломжтой эсэх */
  confident: boolean;
  /** Хамгийн сайн таарцын оноо — оношилгоонд */
  topScore: number;
  /**
   * Босго давaагүй ч ойролцоо байсан сэдвүүд.
   * «Мэдэхгүй» гэж хариулахдаа хоосон гараар явуулахгүй, эдгээрийг
   * санал болгоно — сурагч өөрөө холбоог нь олж магадгүй.
   */
  nearMisses: { title: string; href: string }[];
}

export function retrieve(
  query: string,
  corpus: SearchDoc[] = buildCorpus(),
  limit = 6,
): RetrieveResult {
  const results: SearchHit[] = search(query, corpus, limit);

  /*
   * Хамааралгүй асуултад санамсаргүй хариулт өгөхөөс сэргийлнэ.
   *
   * Ганц түгээмэл үг хичээлийн биед таарсан нь хамааралтай гэсэн үг биш
   * (жишээ: «зохиосон» → «зохион байгуулалт»). Иймд шаардана:
   *   • нэр/гарчиг/шошгонд дор хаяж нэг таарц (сэдэвчилсэн), ЭСВЭЛ
   *   • асуултын хоёроос дээш үг таарсан байх
   */
  const hits: KnowledgeHit[] = results
    .filter(
      (hit) =>
        hit.score >= MIN_SCORE &&
        (hit.topicalMatches >= 1 || hit.coverage >= 0.6),
    )
    .map((hit) => ({
      kind: hit.doc.kind,
      title: hit.doc.title,
      body: hit.doc.body,
      href: hit.doc.href,
      score: Math.round(hit.score * 10) / 10,
    }));

  const topScore = results[0]?.score ?? 0;

  const nearMisses = results
    .filter((hit) => !hits.some((kept) => kept.href === hit.doc.href))
    .filter((hit) => hit.score >= 1.5)
    .slice(0, 3)
    .map((hit) => ({ title: hit.doc.title, href: hit.doc.href }));

  return {
    hits,
    nearMisses,
    /* Хоёр нөхцөл: оноо хангалттай ӨӨР асуултын үгсийн ихэнхийг олсон */
    confident: hits.length > 0 && topScore >= MIN_SCORE * 1.5,
    topScore: Math.round(topScore * 10) / 10,
  };
}

/* ────────────────────────  OpenAI-д өгөх заавар  ──────────────────────── */

export function buildSystemPrompt(mode: AiMode, hits: KnowledgeHit[]): string {
  const modeInstruction: Record<AiMode, string> = {
    ask: "Асуултад эхлээд 1–2 өгүүлбэрээр товч хариулаад, дараа нь дэлгэрэнгүй тайлбарла.",
    explain:
      "Сэдвийг 6–12-р ангийн сурагчид ойлгомжтой, энгийн үгээр тайлбарла. Өдөр тутмын жишээ ашигла.",
    quiz_me:
      "Сэдвээр 5 асуулт үүсгэ. Асуулт бүрд 4 сонголт, зөв хариулт, богино тайлбар бич.",
    challenge:
      "Хүндэвтэр, сэтгэн бодох шаардлагатай асуулт тавьж сурагчийг сорь. Шууд хариултыг нь бүү хэл.",
    teach:
      "Сэдвийг богино хичээл болгон заа: суралцах зорилго → гол ойлголт → тайлбар → дүгнэлт → өөрийгөө шалгах 2 асуулт.",
    review_mistakes:
      "Сурагчийн буруу ойлголтын учир шалтгааныг тайлбарлаж, зөв ойлголтыг тодруул.",
    debate:
      "Түүхэн маргаантай асуудлын хоёр талыг тэнцвэртэй танилцуулж, сурагчийг өөрийн байр суурьтай болгох асуулт тавь.",
    roleplay:
      "Хэрэглэгчийн сонгосон түүхэн хүний дүрд ор. Хариултын төгсгөлд «_(Энэ бол сургалтын зорилготой дүрд тоглолт)_» гэж заавал сануул.",
  };

  const context = hits
    .map(
      (hit, index) =>
        `[${index + 1}] ${hit.title}\n${hit.body}\nХолбоос: ${hit.href}`,
    )
    .join("\n\n");

  return [
    "Чи бол Монголын ерөнхий боловсролын сургуулийн 6–12-р ангийн түүхийн багш.",
    "Зөвхөн Монгол хэлээр хариул.",
    "",
    `ГОРИМ: ${modeInstruction[mode]}`,
    "",
    "ҮНЭН ЗӨВ БАЙХ ДҮРЭМ (заавал баримтал):",
    "1. ЗӨВХӨН доорх мэдлэгийн санд байгаа мэдээлэлд тулгуурлан хариул.",
    "2. Санд байхгүй зүйлийг ЗОХИОЖ БОЛОХГҮЙ. Мэдэхгүй бол шууд «Энэ талаар системийн материалд мэдээлэл алга» гэж хэл.",
    "3. Он цаг, нэр, тоог мэдлэгийн сангаас яг тэр хэвээр нь ав. Санахуйгаас бүү бич.",
    "4. Мэдлэгийн санд «ойролцоогоор» эсвэл «маргаантай» гэж тэмдэглэсэн он цагийг тэр чигээр нь дамжуул. Тодорхой мэт бүү харагдуул.",
    "5. Түүхэн маргаантай асуудалд нэг талыг барихгүй — өөр өөр үзэл бодлыг дурд.",
    "6. Хариултынхаа төгсгөлд ашигласан эх сурвалжийн холбоосыг «Эх сурвалж:» гэж жагсаа.",
    "",
    "=== МЭДЛЭГИЙН САН ===",
    context || "(Хамааралтай агуулга олдсонгүй — мэдэхгүй гэж хариул)",
  ].join("\n");
}

/* ────────────────────────  Нөөц хариулт  ──────────────────────── */

const KIND_LABELS: Record<SearchDoc["kind"], string> = {
  lesson: "Хичээл",
  figure: "Түүхэн хүн",
  event: "Түүхэн үйл явдал",
  source: "Эх сурвалж",
  term: "Нэр томьёо",
};

/**
 * OPENAI_API_KEY байхгүй үед мэдлэгийн сангаас шууд хариулт эмхэтгэнэ.
 * Энэ нь зохиомол текст үүсгэдэггүй — зөвхөн байгаа агуулгыг харуулна.
 */
export function buildFallbackAnswer(
  mode: AiMode,
  query: string,
  result: RetrieveResult,
): string {
  if (result.hits.length === 0) {
    return notFoundAnswer(query);
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

  const [primary, ...rest] = result.hits;

  lines.push(`**${primary.title}**`, primary.body, "");

  if (!result.confident) {
    lines.push(
      "_Энэ хариулт асуултад бүрэн тохирохгүй байж магадгүй. Асуултаа арай тодорхой бичвэл илүү зөв хариулт олдоно._",
      "",
    );
  }

  if (rest.length > 0) {
    lines.push("**Холбогдох мэдээлэл**", "");
    for (const hit of rest.slice(0, 3)) {
      const snippet = hit.body.length > 240 ? `${hit.body.slice(0, 240)}…` : hit.body;
      lines.push(`• **${hit.title}** (${KIND_LABELS[hit.kind]}) — ${snippet}`);
    }
    lines.push("");
  }

  if (mode === "quiz_me" || mode === "challenge") {
    lines.push(
      "**Өөрийгөө шалгах асуулт**",
      "",
      `1. ${primary.title} — гол агуулга нь юу вэ?`,
      "2. Энэ юунаас үүдэлтэй вэ?",
      "3. Урт хугацаанд ямар ач холбогдолтой байсан бэ?",
      "",
      "Бүрэн тест өгөхийг хүсвэл /exams хэсэг рүү оч.",
      "",
    );
  }

  if (mode === "debate") {
    lines.push(
      "Түүхэн үйл явдлыг үнэлэхдээ дор хаяж хоёр өнцгөөс хараарай: тухайн үеийн хүмүүсийн байр суурь, өнөөгийн бидний харах өнцөг. Аль аль нь өөр дүгнэлтэд хүргэдэг.",
      "",
    );
  }

  if (mode === "roleplay") {
    lines.push("_(Энэ бол сургалтын зорилготой дүрд тоглолт.)_", "");
  }

  lines.push("**Эх сурвалж**");
  for (const hit of result.hits.slice(0, 4)) {
    lines.push(`• ${hit.title} → ${hit.href}`);
  }

  lines.push(
    "",
    "_Энэ хариултыг системийн мэдлэгийн сангаас автоматаар эмхэтгэсэн._",
  );

  return lines.join("\n");
}

/**
 * Мэдэхгүй үедээ ЮУ ХИЙХ ВЭ.
 *
 * Буруу хариулт зохиохын оронд:
 *   • мэдэхгүйгээ шулуухан хэлнэ
 *   • хаанаас хайхыг зааж өгнө
 *   • асуултыг бүртгэж, багш агуулга нэмэх боломж олгоно
 */
export function notFoundAnswer(
  query: string,
  nearMisses: { title: string; href: string }[] = [],
): string {
  const encoded = encodeURIComponent(query.slice(0, 120));

  const lines: string[] = [
    "**Энэ талаар системийн материалд мэдээлэл алга байна.**",
    "",
    "Буруу хариулт зохиохоос мэдэхгүй гэж хэлэх нь зөв гэж үзэж байна.",
    "",
  ];

  /* Хоосон гараар явуулахгүй — хамгийн ойр байсан сэдвүүдийг санал болгоно */
  if (nearMisses.length > 0) {
    lines.push("**Магадгүй эдгээр хэрэгтэй байж болно**", "");
    for (const item of nearMisses) {
      lines.push(`• ${item.title} → ${item.href}`);
    }
    lines.push("");
  }

  lines.push(
    "**Системээс хайх**",
    "",
    `• Нэгдсэн хайлт — /search?q=${encoded}`,
    "• Хичээлүүд — /grades",
    "• Түүхэн хүмүүс — /people",
    "• Он цагийн хэлхээс — /timeline",
    "• Тайлбар толь — /dictionary",
    "",
    "**Гадаад эх сурвалжаас хайх**",
    "",
    `• Монгол Википедиа — https://mn.wikipedia.org/w/index.php?search=${encoded}`,
    "• Medle сургалтын материал — https://medle.edu.mn",
    "",
    "_Таны асуултыг бүртгэлээ. Багш нар «AI-ийн сурал» хэсгээс үүнийг хараад холбогдох хичээл нэмэх боломжтой._",
  );

  return lines.join("\n");
}
