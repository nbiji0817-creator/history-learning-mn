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

/* ────────────────────  Хамааралтай хэсэг сугалах  ──────────────────── */

/**
 * Урт бичвэрээс АСУУЛТАД ХАМААРАХ өгүүлбэрүүдийг л сугалж авна.
 *
 * ЯАГААД ХЭРЭГТЭЙ ВЭ: OPENAI_API_KEY байхгүй эсвэл ажиллахгүй үед
 * систем мэдлэгийн сангийн нөөц хариулт руу унадаг. Тэр нөөц нь
 * тохирсон баримтын БҮХ биетийг хэвлэдэг байлаа — хичээлийн бүтэн
 * текст гарч ирээд, сурагчийн асуусан зүйл дунд нь алдагддаг.
 *
 * Жишээ: «Жамуха Тэмүүжин анд болсон нь» гэж асуухад «Монгол
 * аймгууд ба Тэмүүжин» хичээлийн бүтэн агуулга гарч, анд болсон
 * тухай өгүүлбэр хаа нэгтээ дунд нь оршиж байв.
 *
 * Одоо асуултын үг агуулсан өгүүлбэрүүдийг л түүж, эх дараалалд нь
 * буцааж эмхэлнэ.
 */
export function relevantPassage(
  text: string,
  query: string,
  maxSentences = 3,
): string | null {
  const { terms } = queryTerms(query);
  if (terms.length === 0) return null;

  /* Өгүүлбэр, мөр, сумтай жагсаалтаар таслана */
  const pieces = text
    .split(/(?<=[.!?])\s+|\n+|(?=•)/)
    .map((piece) => piece.trim())
    .filter((piece) => piece.length >= 25);

  if (pieces.length === 0) return null;

  const scored = pieces.map((piece, index) => {
    const pieceWords = words(piece).map(stem);
    let matched = 0;

    for (const term of terms) {
      /* Хэсэг сугалахад нарийвчлал чухал тул хатуу горим */
      if (hasPrefix(pieceWords, term, true)) matched += 1;
    }

    return { piece, index, matched };
  });

  const best = Math.max(...scored.map((item) => item.matched));
  if (best === 0) return null;

  /*
   * ЗӨВХӨН хамгийн сайн таарцтай ойролцоо өгүүлбэрийг авна.
   *
   * «Жамуха Тэмүүжин анд болсон нь» гэж асуухад хичээлийн товчлол
   * «Тэмүүжин» гэсэн ганц үгээр таардаг. Түүнийг оруулбал жинхэнэ
   * хариулт (гурван үг таарсан өгүүлбэр) доор нь дарагдана.
   */
  /*
   * Босгыг ХАМГИЙН ДЭЭД оноогоор нь тавина. Нэг доогуур оноог
   * зөвшөөрвөл үндэслэлийн сул таарц нэвтэрдэг: «болон» гэдэг үг
   * «бололцсон»-ы үндэстэй ижил эхэлдэг тул хичээлийн товчлол
   * жинхэнэ хариулттай тэнцэж, дээр нь гарч ирдэг байв.
   */
  const useful = scored.filter((item) => item.matched === best);

  /*
   * Хамгийн олон үг таарсныг нь эхэлж сонгоод, дараа нь ЭХ
   * ДАРААЛАЛД нь буцаана — эс бөгөөс өгүүлбэрүүд холилдож,
   * уншихад ойлгомжгүй болно.
   */
  return useful
    .sort((a, b) => b.matched - a.matched || a.index - b.index)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.piece)
    .join(" ");
}

/* ────────────────────────  Индекс  ──────────────────────── */

export interface SearchDoc {
  id: string;
  kind: "lesson" | "figure" | "event" | "source" | "term" | "library";
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
/**
 * @param strict Урвуу таарцад илүү урт үндэс шаардах эсэх.
 *
 * ЭРЭМБЭЛЭХ ба ХЭСЭГ СУГАЛАХ хоёр өөр шаардлагатай:
 *   • Эрэмбэлэхэд ӨРГӨН таарц ашигтай — баримт олдохгүй байснаас
 *     ойролцоо таарсан нь дээр.
 *   • Хэсэг сугалахад НАРИЙВЧЛАЛ чухал — нэг өгүүлбэр сонгох тул
 *     худал таарц шууд буруу хариулт болно. «болон» → «боло» нь
 *     «бололцсон» → «бололц»-той таарч, хамааралгүй өгүүлбэр
 *     хариултын эхэнд гарч ирж байв.
 */
function hasPrefix(
  haystackWords: string[],
  term: string,
  strict = false,
): boolean {
  const minRoot = strict ? 5 : 4;

  for (const word of haystackWords) {
    if (word === term) return true;
    if (word.startsWith(term) && word.length - term.length <= 4) return true;
    /* Урвуу тохиолдол: асуултын үг илүү урт (үндэс нь бүрэн тайрагдаагүй) */
    if (
      term.startsWith(word) &&
      term.length - word.length <= 3 &&
      word.length >= minRoot
    ) {
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
/**
 * Үгийн ховор байдлаар жин тогтооно (хялбаршуулсан IDF).
 *
 * «хан», «улс», «он» гэх мэт үг корпусын хэдэн зуун баримтад байдаг
 * тул тэдгээрээр таарсан нь юуг ч ялгахгүй. Харин «Багдад», «Аламут»
 * гэх ховор үг таарвал энэ нь маш хүчтэй дохио.
 *
 * Үржүүлэгчийг 0.6–1.4 хооронд барьсан нь санаатай: оноо нь
 * `MIN_SCORE`-той харьцуулагддаг тул хэмжээсийг эрс өөрчилж болохгүй.
 */
function rarityWeight(documentFrequency: number, total: number): number {
  if (documentFrequency === 0 || total === 0) return 1;

  const ratio = documentFrequency / total;

  if (ratio > 0.25) return 0.6; // корпусын дөрөвний нэгээс дээшид байна
  if (ratio > 0.1) return 0.85;
  if (ratio < 0.01) return 1.4; // зуутын нэгээс цөөнд байгаа онцлох үг
  return 1;
}

export function search(
  query: string,
  docs: SearchDoc[],
  limit = 6,
): SearchHit[] {
  const { terms, years } = queryTerms(query);
  if (terms.length === 0) return [];

  /*
   * НЭГДҮГЭЭР ДАМЖЛАГА — таарцыг цуглуулж, үг тус бүр хэдэн баримтад
   * байгааг тоолно. Токенчлолыг нэг л удаа хийхийн тулд үр дүнг
   * түр хадгална.
   */
  interface Partial {
    doc: SearchDoc;
    /** Үг тус бүрийн талбарын жин: 6 / 3 / 1 / 0 */
    weights: number[];
    /** Нэр, гарчиг, шошгонд таарсан эсэх */
    topical: boolean[];
    yearHit: boolean;
  }

  const partials: Partial[] = [];
  const documentFrequency = new Array<number>(terms.length).fill(0);

  for (const doc of docs) {
    const strongWords = words(doc.strong).map(stem);
    const mediumWords = words(doc.medium).map(stem);
    const weakWords = words(doc.weak).map(stem);

    const weights = new Array<number>(terms.length).fill(0);
    const topical = new Array<boolean>(terms.length).fill(false);
    let any = false;

    for (let i = 0; i < terms.length; i += 1) {
      const term = terms[i];

      if (hasPrefix(strongWords, term)) {
        weights[i] = 6;
        topical[i] = true;
      } else if (hasPrefix(mediumWords, term)) {
        weights[i] = 3;
        topical[i] = true;
      } else if (hasPrefix(weakWords, term)) {
        weights[i] = 1;
      }

      if (weights[i] > 0) {
        documentFrequency[i] += 1;
        any = true;
      }
    }

    const yearHit =
      doc.year !== undefined && years.includes(doc.year);

    if (!any && !yearHit) continue;
    partials.push({ doc, weights, topical, yearHit });
  }

  /* ХОЁРДУГААР ДАМЖЛАГА — ховор үгэнд илүү жин өгч оноог бодно */
  const rarity = documentFrequency.map((count) =>
    rarityWeight(count, docs.length),
  );

  const hits: SearchHit[] = [];

  for (const partial of partials) {
    let score = 0;
    let matched = 0;
    let topicalMatches = 0;

    for (let i = 0; i < terms.length; i += 1) {
      if (partial.weights[i] === 0) continue;
      score += partial.weights[i] * rarity[i];
      matched += 1;
      if (partial.topical[i]) topicalMatches += 1;
    }

    /* Он таарвал маш хүчтэй дохио — «1206» гэвэл тэр оны үйл явдал */
    if (partial.yearHit) {
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
    score *= partial.doc.boost ?? 1;

    hits.push({ doc: partial.doc, score, coverage, topicalMatches });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
