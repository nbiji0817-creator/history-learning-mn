/**
 * МОНГОЛ ХЭЛНИЙ ХАЙЛТЫН ХӨДӨЛГҮҮР
 *
 * Яагаад тусдаа модуль вэ?
 *
 * Монгол хэл нь залгавар нэмдэг (агглютинатив) хэл. «Мандухай» гэсэн үг
 * бодит асуултад «Мандухайн», «Мандухайг», «Мандухайтай» гэж илэрдэг.
 * Энгийн `text.includes(token)` шалгалт эдгээрийг ОЛОХГҮЙ — учир нь
 * «Мандухай» дотор «Мандухайн» байхгүй.
 *
 * Иймд энд:
 *   1. Үгийн үндсийг (stem) олж залгаварыг нь тайрна
 *   2. Үг эхлэлээр тааруулна (prefix match), дэд мөрөөр биш
 *   3. Талбар тус бүрд өөр жин өгнө (нэр > шошго > товч > бие)
 *   4. Он тоог тусад нь барина («1206», «МЭӨ 209»)
 *   5. Асуултын үг (хэн, юу, хэзээ…) оноо өгөхгүй
 */

/* ────────────────────────  Үгийн боловсруулалт  ──────────────────────── */

/**
 * Монгол хэлний түгээмэл залгавар — уртаас богино руу эрэмбэлсэн.
 * Дараалал чухал: «ийнхээ»-г «ийн»-ээс өмнө шалгана.
 */
const SUFFIXES = [
  "ийнхээ", "ынхаа", "уудынх", "үүдийнх",
  "аараа", "ээрээ", "оороо", "өөрөө",
  "ийгээ", "ыгаа", "дээрх", "дахь", "дэх",
  "уудын", "үүдийн", "чуудын", "чүүдийн",
  "аас", "ээс", "оос", "өөс",
  "тай", "тэй", "той", "төй",
  "ийн", "ын", "ийг", "ыг",
  "ууд", "үүд", "нууд", "нүүд",
  "лаа", "лээ", "лоо", "лөө",
  "сан", "сэн", "сон", "сөн",
  "даг", "дэг", "дог", "дөг",
  "аар", "ээр", "оор", "өөр",
  "ад", "эд", "од", "өд",
  "д", "т", "г", "н", "р", "х",
];

/** Оноо өгөх ёсгүй түгээмэл үгс — асуултын бүтцийн үг. */
const STOPWORDS = new Set([
  "юу", "юм", "юун", "юуны", "яагаад", "ямар", "яаж", "хэн", "хэний",
  "хэзээ", "хаана", "хаанаас", "хэдэн", "хэд", "хэрхэн", "аль", "энэ",
  "тэр", "энд", "тэнд", "тухай", "талаар", "байсан", "байна", "байх",
  "болсон", "болно", "болох", "гэж", "гэсэн", "гэдэг", "бол", "бэ", "вэ",
  "нь", "ба", "болон", "буюу", "мөн", "бас", "гэхдээ", "харин", "учир",
  "дараа", "өмнө", "хойш", "хамт", "тэгээд", "одоо", "бүр", "бүх",
  "надад", "миний", "чиний", "танай", "манай", "өгөөч", "хэлээч",
  "тайлбарла", "тайлбарлаж", "ярьж", "хариул", "асуулт", "асууя",
  "the", "what", "when", "who", "why", "how", "is", "was", "were", "a", "an",
]);

/** Асуултад орж болох богино нэрийг бүтэн нэртэй холбоно. */
const ALIASES: Record<string, string[]> = {
  чингис: ["чингис хаан", "тэмүүжин", "их монгол улс"],
  тэмүүжин: ["чингис хаан"],
  өгөөдэй: ["өгөөдэй хаан", "хархорум"],
  хубилай: ["хубилай хаан", "юань улс"],
  мөнх: ["мөнх хаан"],
  гүюг: ["гүюг хаан"],
  бат: ["бат хаан", "алтан ордны улс"],
  мандухай: ["мандухай сэцэн хатан", "даян хаан"],
  даян: ["даян хаан", "батмөнх"],
  модун: ["модун шаньюй", "хүннү"],
  богд: ["богд хаан", "жавзандамба"],
  сүхбаатар: ["ардын хувьсгал"],
  засаг: ["их засаг"],
  товчоо: ["монголын нууц товчоо"],
  нууц: ["монголын нууц товчоо"],
  хэрэм: ["цагаан хэрэм"],
  еэш: ["элсэлтийн шалгалт"],
  эеэш: ["элсэлтийн шалгалт"],
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[«»""''`]/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Залгаварыг тайрч үндсийг олно. */
export function stem(word: string): string {
  for (const suffix of SUFFIXES) {
    if (word.length >= suffix.length + 3 && word.endsWith(suffix)) {
      return word.slice(0, word.length - suffix.length);
    }
  }
  return word;
}

function words(text: string): string[] {
  return normalize(text).split(" ").filter(Boolean);
}

/** Асуултаас утга агуулсан үгсийг ялгаж, үндэс + өргөтгөлийг буцаана. */
export function queryTerms(query: string): { terms: string[]; years: number[] } {
  const raw = words(query);
  const terms = new Set<string>();
  const years: number[] = [];

  for (const word of raw) {
    /* Он тоо: 3–4 оронтой тоог тусад нь барина */
    if (/^\d{3,4}$/.test(word)) {
      years.push(Number(word));
      terms.add(word);
      continue;
    }

    if (word.length < 3 || STOPWORDS.has(word)) continue;

    const root = stem(word);
    terms.add(root);

    for (const alias of ALIASES[root] ?? ALIASES[word] ?? []) {
      for (const aliasWord of words(alias)) {
        if (aliasWord.length >= 3) terms.add(stem(aliasWord));
      }
    }
  }

  /* «МЭӨ 209» гэсэн бичлэгийг сөрөг он гэж тэмдэглэнэ */
  if (/мэө|м\.э\.ө/i.test(query)) {
    for (let i = 0; i < years.length; i += 1) years[i] = -years[i];
  }

  return { terms: [...terms], years };
}

/* ────────────────────────  Индекс  ──────────────────────── */

export interface SearchDoc {
  id: string;
  kind: "lesson" | "figure" | "event" | "source" | "term";
  title: string;
  /** AI-д дамжуулах бүрэн агуулга */
  body: string;
  href: string;
  /** Нэр, гарчиг — хамгийн хүчтэй дохио */
  strong: string;
  /** Шошго, сэдэв */
  medium: string;
  /** Бүрэн текст */
  weak: string;
  /** Үйл явдлын он (эрэмбэлэх утга) */
  year?: number;
  /** Төрлийн суурь жин */
  boost?: number;
}

export interface SearchHit {
  doc: SearchDoc;
  score: number;
  /** Асуултын хэдэн үг таарсан (0–1) */
  coverage: number;
  /** Нэр/гарчиг/шошгонд таарсан үгийн тоо — сэдэвчилсэн таарц мөн эсэх */
  topicalMatches: number;
}

/** Тухайн үг текстэд үгийн эхлэлээр таарч байна уу? */
function hasPrefix(haystackWords: string[], term: string): boolean {
  for (const word of haystackWords) {
    if (word === term) return true;
    if (word.startsWith(term) && word.length - term.length <= 4) return true;
    /* Урвуу тохиолдол: асуултын үг илүү урт (үндэс нь бүрэн тайрагдаагүй) */
    if (term.startsWith(word) && term.length - word.length <= 3 && word.length >= 4) {
      return true;
    }
  }
  return false;
}

/**
 * Асуултад хамааралтай баримтуудыг оноогоор нь эрэмбэлж буцаана.
 *
 * Оноо = талбарын жин × таарсан үгийн тоо, дээр нь бүрэн хамрах урамшуулал.
 */
export function search(
  query: string,
  docs: SearchDoc[],
  limit = 6,
): SearchHit[] {
  const { terms, years } = queryTerms(query);
  if (terms.length === 0) return [];

  const hits: SearchHit[] = [];

  for (const doc of docs) {
    const strongWords = words(doc.strong).map(stem);
    const mediumWords = words(doc.medium).map(stem);
    const weakWords = words(doc.weak).map(stem);

    let score = 0;
    let matched = 0;
    let topicalMatches = 0;

    for (const term of terms) {
      let termScore = 0;

      if (hasPrefix(strongWords, term)) {
        termScore += 6;
        topicalMatches += 1;
      } else if (hasPrefix(mediumWords, term)) {
        termScore += 3;
        topicalMatches += 1;
      } else if (hasPrefix(weakWords, term)) {
        termScore += 1;
      }

      if (termScore > 0) {
        matched += 1;
        score += termScore;
      }
    }

    /* Он таарвал маш хүчтэй дохио — «1206» гэвэл тэр оны үйл явдал */
    if (doc.year !== undefined && years.includes(doc.year)) {
      score += 15;
      matched += 1;
      topicalMatches += 1;
    }

    if (matched === 0) continue;

    /*
     * Хамрах хувь: асуултын үгсийн хэдийг олсон бэ.
     * Ганц түгээмэл үгээр таарсан урт баримт дээшлэхээс сэргийлнэ.
     */
    const coverage = matched / terms.length;
    score *= 0.4 + coverage;
    score *= doc.boost ?? 1;

    hits.push({ doc, score, coverage, topicalMatches });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
