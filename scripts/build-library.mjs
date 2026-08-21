/**
 * Номын тэмдэглэлүүдийг AI-ийн мэдлэгийн санд индексжих TS өгөгдөл болгоно.
 *
 * Оролт : D:\хичээл ai\түүхийн номнууд\*.md  (өмнөх session-д бичсэн тэмдэглэл)
 * Гаралт: data/library/<slug>.ts
 *
 * Хэсэгчлэх зарчим: хайлтын нэгж нь 800–2500 тэмдэгт байх нь тохиромжтой.
 * Хэт урт бол асуултад хамаагүй текст ороод оноо сарнина; хэт богино бол
 * контекст тасарна.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SRC = "D:/хичээл ai/түүхийн номнууд/";
/** Номын багц бүр өөрийн хавтастай — `dir` заагаагүй бол SRC-ийг авна. */
const SRC_ACADEMIC = "D:/түүх/Түүх ном/";
const OUT = "C:/Users/sainshand/OneDrive/Desktop/Түүхийн систем/history-learning-mn/data/library/";

const MAX = 2600;
const TARGET = 2100;
const MIN = 140;

/** Нэг номын тодорхойлолт. `files` дараалалаар нийлнэ. */
const BOOKS = [
  {
    slug: "tuuh-6",
    title: "Түүх — 6-р анги",
    author: "ЕБС-ийн сурах бичиг",
    kind: "textbook",
    grade: 6,
    icon: "📗",
    pages: 84,
    description:
      "6-р ангийн түүхийн сурах бичгийн бүрэн агуулга — эртний иргэншил, Монголын эртний түүх.",
    files: ["түүх 6 - тэмдэглэл.md"],
  },
  {
    slug: "tuuh-7",
    title: "Түүх — 7-р анги",
    author: "ЕБС-ийн сурах бичиг",
    kind: "textbook",
    grade: 7,
    icon: "📗",
    pages: 152,
    description:
      "7-р ангийн түүхийн сурах бичгийн бүрэн агуулга — дундад зуун, Монголын эзэнт гүрэн.",
    files: ["түүх 7 - тэмдэглэл.md"],
  },
  {
    slug: "tuuh-8",
    title: "Түүх — 8-р анги",
    author: "ЕБС-ийн сурах бичиг",
    kind: "textbook",
    grade: 8,
    icon: "📗",
    pages: 148,
    description:
      "8-р ангийн түүхийн сурах бичгийн бүрэн агуулга — шинэ үе, XV–XX зууны эхэн.",
    files: ["түүх 8 - тэмдэглэл.md"],
  },
  {
    slug: "tuuh-9",
    title: "Түүх — 9-р анги",
    author: "ЕБС-ийн сурах бичиг",
    kind: "textbook",
    grade: 9,
    icon: "📗",
    pages: 160,
    description:
      "9-р ангийн түүхийн сурах бичгийн бүрэн агуулга — XX зууны Монгол ба дэлхий.",
    files: ["түүх 9 - тэмдэглэл.md"],
  },
  {
    slug: "nuuts-tovchoo",
    title: "Монголын нууц товчоо",
    author: "Ц. Дамдинсүрэнгийн орчуулга",
    kind: "primary",
    icon: "📜",
    pages: 125,
    year: "1240",
    description:
      "Монголчуудын өөрсдийн гараар бичсэн хамгийн эртний түүхэн дурсгал. 282 зүйл, 13 бүлэг.",
    files: ["Монголын Нууц Товчоо - тэмдэглэл.md"],
  },
  {
    slug: "sudryn-chuulgan-1",
    title: "Судрын чуулган — I боть",
    author: "Рашид ад-Дин",
    kind: "primary",
    icon: "📕",
    pages: 424,
    year: "1307",
    description:
      "Түрэг, монгол аймгуудын угийн бичиг ба Чингис хааны он дараллын түүх.",
    files: ["судрын чуулган 1 - тэмдэглэл.md"],
  },
  {
    slug: "sudryn-chuulgan-2",
    title: "Судрын чуулган — II боть",
    author: "Рашид ад-Дин",
    kind: "primary",
    icon: "📕",
    pages: 249,
    year: "1307",
    description:
      "Өгэдэй, Жочи, Цагадай, Түлүй, Гүюг, Мөнх, Хубилай хаадын хүүрнэл.",
    files: ["судрын чуулган 2 - тэмдэглэл.md"],
  },
  {
    slug: "sudryn-chuulgan-3",
    title: "Судрын чуулган — III боть",
    author: "Рашид ад-Дин",
    kind: "primary",
    icon: "📕",
    pages: 378,
    year: "1307",
    description:
      "Хүлэгийн улс (Ил хаант улс) — Хулагугаас Газан хаан хүртэл.",
    files: ["судрын чуулган 3 - тэмдэглэл.md"],
  },
  /* ── ШУА-ийн «Монгол улсын түүх» таван боть (2003) ── */
  {
    slug: "mongol-ulsyn-tuuh-1",
    title: "Монгол улсын түүх — I боть",
    author: "ШУА-ийн Түүхийн хүрээлэн (ред. Д. Цэвээндорж)",
    kind: "academic",
    icon: "📘",
    pages: 447,
    year: "2003",
    dir: SRC_ACADEMIC,
    description:
      "Нэн эртнээс XII зууны дунд үе — чулуун зэвсэг, Хүннү, Сяньби, Жужан, Түрэг, Уйгур, Хятан.",
    files: [
      "Монгол улсын түүх 1 боть - тэмдэглэл (а).md",
      "Монгол улсын түүх 1 боть - тэмдэглэл (б).md",
    ],
  },
  {
    slug: "mongol-ulsyn-tuuh-2",
    title: "Монгол улсын түүх — II боть",
    author: "ШУА-ийн Түүхийн хүрээлэн",
    kind: "academic",
    icon: "📘",
    pages: 415,
    year: "2003",
    dir: SRC_ACADEMIC,
    description:
      "XIII–XIV зуун — монголчуудын гарал, Их Монгол Улс, Юан гүрэн, гүрний задрал.",
    files: ["Монгол улсын түүх 2 боть - тэмдэглэл.md"],
  },
  {
    slug: "mongol-ulsyn-tuuh-3",
    title: "Монгол улсын түүх — III боть",
    author: "ШУА-ийн Түүхийн хүрээлэн",
    kind: "academic",
    icon: "📘",
    pages: 226,
    year: "2003",
    dir: SRC_ACADEMIC,
    description:
      "XIV зууны сүүл – XVII зууны эхэн — төв нутагтаа шилжсэн нь, Даян хаан, дахин бутрал.",
    files: ["Монгол улсын түүх 3 боть - тэмдэглэл.md"],
  },
  {
    slug: "mongol-ulsyn-tuuh-4",
    title: "Монгол улсын түүх — IV боть",
    author: "ШУА-ийн Түүхийн хүрээлэн (удирдагч А. Очир)",
    kind: "academic",
    icon: "📘",
    pages: 424,
    year: "2003",
    dir: SRC_ACADEMIC,
    description:
      "XVII зуун – XX зууны эхэн — Лигдэн хаан, Зүүнгар, Манжийн эрхшээл, ардын хөдөлгөөн.",
    files: ["Монгол улсын түүх 4 боть - тэмдэглэл.md"],
  },
  {
    slug: "mongol-ulsyn-tuuh-5",
    title: "Монгол улсын түүх — V боть",
    author: "ШУА-ийн Түүхийн хүрээлэн",
    kind: "academic",
    icon: "📘",
    pages: 403,
    year: "2003",
    dir: SRC_ACADEMIC,
    description:
      "XX зуун — 1911, 1921 оны хувьсгал, хэлмэгдүүлэлт, социализм, 1990 оны ардчилал.",
    files: ["Монгол улсын түүх 5 боть - тэмдэглэл.md"],
  },
];

/**
 * Гарчгаас хуудасны мужийг салгана.
 *
 * Тэмдэглэлийн гарчиг «Хуудас 22-44: Багдад руу довтолгоо» гэсэн
 * хэлбэртэй. «Хуудас 22-44» нь хайлтад ямар ч утгагүй чимээ бөгөөд
 * ишлэлийн шошгыг ч уншихад бэрх болгодог. Тусад нь салгана.
 */
function splitPages(heading) {
  const patterns = [
    /^Хуудас\s+([\d\-–,\s]+)\s*:\s*/i,
    /^Pages?\s+([\d\-–,\s]+)\s*(?:\([^)]*\))?\s*:\s*/i,
    /^х\.\s*([\d\-–,\s]+)\s*:\s*/i,
  ];

  for (const pattern of patterns) {
    const match = heading.match(pattern);
    if (match) {
      const rest = heading.slice(match[0].length).trim();
      /* Гарчиг бүхэлдээ хуудасны муж байсан бол хоосон үлдээхгүй */
      if (rest.length >= 3) {
        return { title: rest, pages: match[1].replace(/\s+/g, " ").trim() };
      }
    }
  }

  return { title: heading, pages: null };
}

/**
 * Зөвхөн надад (уншиж байсан AI-д) хандсан хэсэг мөн эсэх.
 *
 * Тэмдэглэлд «Ашиглах заавар» гэх мэт хэсэг байдаг — «эх PDF-ийг
 * D:\... замаас 20 хуудсаар дахин уншиж болно» гэсэн ажлын санамж.
 * Энэ нь сурагчид хэрэггүй төдийгүй, өөр хүний компьютерийн зам
 * хариултад гарч ирвэл эвгүй. Индексэд огт оруулахгүй.
 */
function isInternalNote(heading, body) {
  if (/^(ашиглах заавар|заавар|тэмдэглэлийн тухай)/i.test(heading.trim())) {
    return true;
  }
  /* Биет нь голчлон локал зам, хэрэглэх зөвлөмж бол алгасна */
  return /[A-Za-z]:[\\/]|Read tool|pages параметр/i.test(body) && body.length < 900;
}

/**
 * Локал файлын замыг бичвэрээс арилгана.
 *
 * Зам дотор зай байдаг («D:\хичээл ai\...») тул үгээр таслах
 * загвар ажиллахгүй — өргөтгөл дээр нь тулгуурлан залхуу таарцаар
 * барина. Дискний үсэггүй ганц файлын нэрээс зөвхөн өргөтгөлийг
 * хасна: «судрын чуулган 2.pdf» → «судрын чуулган 2».
 */
function stripLocalPaths(text) {
  return text
    /* Дискний үсэгтэй бүтэн зам — бүхэлд нь солино */
    .replace(/`?[A-Za-z]:[\\/][^\n`)]*?\.(?:pdf|md|docx?)`?/gi, "эх ном")
    /* Ганц файлын нэр — зөвхөн өргөтгөлийг хасна */
    .replace(/([\p{L}\d][\p{L}\d \-—]*?)\.(?:pdf|md|docx?)\b/giu, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** Markdown тэмдэглэгээг цэвэрлэж, хайлтад тохирсон энгийн текст болгоно. */
function plain(text) {
  return stripLocalPaths(text)
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Догол мөрөөр нь TARGET хэмжээнд багтаан цуглуулна. */
function byParagraph(text) {
  const paragraphs = text.split(/\n\s*\n/);
  const out = [];
  let buffer = "";

  for (const paragraph of paragraphs) {
    if (buffer && buffer.length + paragraph.length > TARGET) {
      out.push(buffer.trim());
      buffer = "";
    }
    buffer += (buffer ? "\n\n" : "") + paragraph;

    /* Ганц догол мөр өөрөө хэт урт бол мөрөөр нь тасална */
    while (buffer.length > MAX) {
      const cut = buffer.lastIndexOf("\n", MAX);
      const at = cut > MIN ? cut : MAX;
      out.push(buffer.slice(0, at).trim());
      buffer = buffer.slice(at).trim();
    }
  }

  if (buffer.trim()) out.push(buffer.trim());
  return out.filter((item) => item.length >= MIN);
}

/**
 * Файлыг хэсэгчилнэ: `##` → шаардлагатай бол `###` → шаардлагатай бол догол мөр.
 * Хэсэг бүр өөрийн замын мөрийг (breadcrumb) хадгална.
 */
function chunkFile(raw) {
  const chunks = [];
  const sections = raw.split(/\n(?=## (?!#))/g);

  for (const section of sections) {
    const headingMatch = section.match(/^##\s+(.+)$/m);
    const rawHeading = headingMatch ? headingMatch[1].trim() : "Ерөнхий тойм";
    const { title: heading, pages: headingPages } = splitPages(rawHeading);

    const body = section.replace(/^#{1,2}\s+.+$/m, "").trim();
    if (body.length < MIN) continue;
    if (isInternalNote(heading, body)) continue;

    if (plain(body).length <= MAX) {
      chunks.push({ section: heading, sub: null, pages: headingPages, body: plain(body) });
      continue;
    }

    /* Хэт урт — дэд гарчгаар хуваана */
    const subs = body.split(/\n(?=### (?!#))/g);

    if (subs.length > 1) {
      for (const sub of subs) {
        const subMatch = sub.match(/^###\s+(.+)$/m);
        const subHeading = subMatch ? subMatch[1].trim() : null;
        const subBody = plain(sub.replace(/^###\s+.+$/m, "").trim());
        if (subBody.length < MIN) continue;

        if (subBody.length <= MAX) {
          chunks.push({ section: heading, sub: subHeading, pages: headingPages, body: subBody });
        } else {
          for (const piece of byParagraph(subBody)) {
            chunks.push({ section: heading, sub: subHeading, pages: headingPages, body: piece });
          }
        }
      }
    } else {
      for (const piece of byParagraph(plain(body))) {
        chunks.push({ section: heading, sub: null, pages: headingPages, body: piece });
      }
    }
  }

  return chunks;
}

/** TS файл болгон бичнэ. */
function emit(book, chunks) {
  const lines = [
    `import type { LibraryBook } from "@/types";`,
    ``,
    `/**`,
    ` * ${book.title}${book.author ? ` — ${book.author}` : ""}`,
    ` *`,
    ` * Энэ бол номын ЭХ БИЧВЭР БИШ, судалгааны тэмдэглэл (хураангуй).`,
    ` * Бүх ${book.pages} хуудсыг уншиж гаргасан агуулгын товчлол бөгөөд`,
    ` * AI багшийн мэдлэгийн санд индексжинэ.`,
    ` *`,
    ` * Автоматаар үүсгэсэн — гараар засварлахаас илүү эх тэмдэглэлээ`,
    ` * шинэчлээд дахин үүсгэх нь зөв.`,
    ` */`,
    `export const ${camel(book.slug)}: LibraryBook = {`,
    `  slug: ${JSON.stringify(book.slug)},`,
    `  title: ${JSON.stringify(book.title)},`,
    `  author: ${JSON.stringify(book.author ?? "")},`,
    `  kind: ${JSON.stringify(book.kind)},`,
    book.grade ? `  grade: ${book.grade},` : ``,
    book.year ? `  year: ${JSON.stringify(book.year)},` : ``,
    `  icon: ${JSON.stringify(book.icon)},`,
    `  pages: ${book.pages},`,
    `  description: ${JSON.stringify(book.description)},`,
    `  chunks: [`,
  ].filter(Boolean);

  chunks.forEach((chunk, index) => {
    const id = `${book.slug}-${String(index + 1).padStart(3, "0")}`;
    lines.push(`    {`);
    lines.push(`      id: ${JSON.stringify(id)},`);
    lines.push(`      order: ${index + 1},`);
    lines.push(`      section: ${JSON.stringify(chunk.section)},`);
    if (chunk.sub) lines.push(`      sub: ${JSON.stringify(chunk.sub)},`);
    if (chunk.pages) lines.push(`      pages: ${JSON.stringify(chunk.pages)},`);
    lines.push(`      body: ${JSON.stringify(chunk.body)},`);
    lines.push(`    },`);
  });

  lines.push(`  ],`, `};`, ``);
  return lines.join("\n");
}

function camel(slug) {
  return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

/* ────────────────────────  Ажиллуулах  ──────────────────────── */

mkdirSync(OUT, { recursive: true });

let grandTotal = 0;
const summary = [];

for (const book of BOOKS) {
  const chunks = [];
  for (const file of book.files) {
    chunks.push(...chunkFile(readFileSync((book.dir ?? SRC) + file, "utf8")));
  }

  writeFileSync(OUT + book.slug + ".ts", emit(book, chunks), "utf8");

  const sizes = chunks.map((c) => c.body.length);
  grandTotal += chunks.length;
  summary.push({ slug: book.slug, count: chunks.length, max: Math.max(...sizes, 0) });
  console.log(
    `${String(chunks.length).padStart(3)} хэсэг | хамгийн урт ${String(Math.max(...sizes, 0)).padStart(5)} | ${book.slug}.ts`,
  );
}

/* index.ts */
const index = [
  `import type { LibraryBook } from "@/types";`,
  ...BOOKS.map((b) => `import { ${camel(b.slug)} } from "./${b.slug}";`),
  ``,
  `/**`,
  ` * НОМЫН САН`,
  ` *`,
  ` * Сурах бичиг ба анхдагч эх сурвалжийн агуулгын товчлол. AI багш`,
  ` * эдгээрийг индексжүүлж, хариултдаа номын нэр, бүлгийг заана.`,
  ` *`,
  ` * ⚠️ Эх бичвэрийг бүтнээр нь агуулаагүй — судалгааны тэмдэглэл.`,
  ` */`,
  `export const libraryBooks: LibraryBook[] = [`,
  ...BOOKS.map((b) => `  ${camel(b.slug)},`),
  `];`,
  ``,
  `export const libraryBookMap = new Map(`,
  `  libraryBooks.map((book) => [book.slug, book]),`,
  `);`,
  ``,
  `/** Бүх хэсгийн нийт тоо — оношилгоо, статистикт. */`,
  `export const libraryChunkCount = libraryBooks.reduce(`,
  `  (sum, book) => sum + book.chunks.length,`,
  `  0,`,
  `);`,
  ``,
].join("\n");

writeFileSync(OUT + "index.ts", index, "utf8");
console.log(`\nНийт ${grandTotal} хэсэг, ${BOOKS.length} ном → data/library/`);
