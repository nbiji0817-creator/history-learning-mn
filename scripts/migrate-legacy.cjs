/**
 * app/7, app/8, app/9, app/10 доторх өмнөх контентыг шинэ дата давхарга руу
 * хөрвүүлнэ. ЭХ ФАЙЛУУДЫГ УНШИХААС ӨӨР ЮУ Ч ХИЙХГҮЙ (өөр session ажиллаж байгаа).
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = process.argv[2];
if (!ROOT) {
  console.error("Usage: node migrate.cjs <project-root>");
  process.exit(1);
}

/* ──────────  TS файлыг JS болгон уншина  ────────── */

/**
 * Файлаас нэрлэсэн массивын литералыг ялган авч, JS болгон уншина.
 * React компонент, import, JSX бүхий файлаас ч зөвхөн өгөгдлийн хэсгийг авна.
 */
function extractArray(source, name) {
  const declaration = new RegExp(
    `(?:export\\s+)?const\\s+${name}\\s*(?::[^=]+)?=\\s*\\[`,
  );
  const match = declaration.exec(source);
  if (!match) return null;

  const start = match.index + match[0].length - 1; // '[' дээр
  let depth = 0;
  let inString = null;
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === inString) inString = null;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = char;
      continue;
    }

    if (char === "[" || char === "{") depth += 1;
    if (char === "]" || char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

function loadTsData(relPath, names) {
  const source = fs.readFileSync(path.join(ROOT, relPath), "utf8");
  const parts = [];

  for (const name of names) {
    const literal = extractArray(source, name);
    if (literal) parts.push(`exports.${name} = ${literal};`);
  }

  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "mig-")), "data.cjs");
  fs.writeFileSync(tmp, parts.join("\n\n"), "utf8");
  return require(tmp);
}

/* ──────────  Кирилл → латин slug  ────────── */

const MAP = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "ye", ё: "yo", ж: "j", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "u", п: "p",
  р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "kh", ц: "ts", ч: "ch",
  ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugify(value) {
  const latin = [...value.toLowerCase()]
    .map((char) => (MAP[char] !== undefined ? MAP[char] : char))
    .join("");
  return (
    latin
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "") || "lesson"
  );
}

const usedSlugs = new Set();
function uniqueSlug(base, grade) {
  let slug = `${base}`;
  if (usedSlugs.has(slug)) slug = `${base}-${grade}`;
  let counter = 2;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${grade}-${counter}`;
    counter += 1;
  }
  usedSlugs.add(slug);
  return slug;
}

/* ──────────  TS литерал болгон хэвлэх  ────────── */

function lit(value, indent = 0) {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);

  if (value === null) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[\n${value
      .map((item) => `${padIn}${lit(item, indent + 1)}`)
      .join(",\n")},\n${pad}]`;
  }
  const entries = Object.entries(value).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return "{}";
  return `{\n${entries
    .map(([key, v]) => `${padIn}${key}: ${lit(v, indent + 1)}`)
    .join(",\n")},\n${pad}}`;
}

/* ──────────  Хөрвүүлэлт  ────────── */

const ERA_BY_GRADE = { 7: "medieval", 8: "modern", 9: "modern", 10: "contemporary" };

const MEDLE = {
  label: "Medle-ээс нэмж суралцах",
  url: "https://medle.edu.mn",
  provider: "medle.edu.mn",
};

const allQuestions = [];

function convertMcqLessons(grade, raw, chapters) {
  const chapterTitle = (lesson) => {
    if (lesson.chapterTitle) return lesson.chapterTitle;
    const found = (chapters ?? []).find((item) => item.id === lesson.chapter);
    return found ? found.title : `${lesson.chapter} бүлэг`;
  };

  return raw.map((lesson, index) => {
    const slug = uniqueSlug(slugify(lesson.title), grade);
    const chapter = chapterTitle(lesson);
    const quizId = `q-g${grade}-${lesson.id}`;

    (lesson.questions ?? []).forEach((question, qIndex) => {
      allQuestions.push({
        id: `qn-g${grade}-${lesson.id}-${qIndex + 1}`,
        grade,
        topic: chapter,
        era: ERA_BY_GRADE[grade],
        difficulty: "medium",
        type: "multiple_choice",
        prompt: question.question,
        options: question.options,
        answerIndex: question.correct,
        explanation: `Зөв хариулт: «${question.options[question.correct]}». Дэлгэрэнгүйг «${lesson.title}» хичээлээс (сурах бичиг ${lesson.pages}-р хуудас) үзнэ үү.`,
        source: `${grade}-р ангийн түүхийн сурах бичиг, ${lesson.pages}-р хуудас`,
        tags: [slug],
      });
    });

    return {
      id: `l${grade}-${lesson.id}`,
      slug,
      grade,
      order: index + 1,
      title: lesson.title,
      subtitle: chapter,
      icon: lesson.icon || "📘",
      summary: lesson.summary,
      objectives: (lesson.keyPoints ?? []).slice(0, 4),
      durationMinutes: 30,
      difficulty: "medium",
      tags: [chapter, `${grade}-р анги`, "сурах бичиг"],
      sections: [
        {
          id: "s1",
          type: "text",
          title: "Хичээлийн танилцуулга",
          body: lesson.summary,
        },
        {
          id: "s2",
          type: "keypoints",
          title: "Гол санаа",
          points: lesson.keyPoints ?? [],
        },
      ],
      conclusion: `«${chapter}» бүлгийн энэ хичээлийн гол санааг дээр үзлээ. Сурах бичгийн ${lesson.pages}-р хуудаснаас дэлгэрэнгүйг уншиж, доорх тестээр мэдлэгээ шалгаарай.`,
      externalLinks: [MEDLE],
      aiPrompts: [
        `«${lesson.title}» сэдвийг ойлгомжтой тайлбарлаж өгөөч`,
        `Намайг «${lesson.title}» сэдвээр шалгаад үзээч`,
      ],
      quizId: (lesson.questions ?? []).length > 0 ? quizId : null,
      gameSlug: null,
      published: true,
    };
  });
}

function convertGrade10(raw) {
  const grade = 10;
  return raw.map((lesson, index) => {
    const slug = uniqueSlug(slugify(lesson.title), grade);
    const sections = [
      {
        id: "s1",
        type: "text",
        title: "Хичээлийн танилцуулга",
        body: lesson.introduction,
      },
      {
        id: "s2",
        type: "keypoints",
        title: "Гол санаа",
        points: lesson.keyPoints ?? [],
      },
    ];

    if ((lesson.terms ?? []).length > 0) {
      sections.push({
        id: "s3",
        type: "concepts",
        title: "Нэр томьёо",
        concepts: lesson.terms.map((item) => ({
          term: item.term,
          definition: item.meaning,
        })),
      });
    }

    if ((lesson.questions ?? []).length > 0) {
      sections.push({
        id: "s4",
        type: "keypoints",
        title: "Өөрийгөө шалгах асуултууд",
        points: lesson.questions,
      });
    }

    return {
      id: `l10-${lesson.id}`,
      slug,
      grade,
      order: index + 1,
      title: lesson.title,
      subtitle: lesson.chapter,
      icon: lesson.icon || "📘",
      summary: lesson.introduction,
      objectives: (lesson.keyPoints ?? []).slice(0, 4),
      durationMinutes: 35,
      difficulty: "medium",
      tags: [lesson.chapter, lesson.period, "10-р анги", "сурах бичиг"].filter(Boolean),
      sections,
      conclusion: `«${lesson.chapter}» бүлгийн энэ хичээлийн гол санаа, нэр томьёог давтаж, дээрх асуултуудад бичгээр хариулж үзээрэй.`,
      externalLinks: [MEDLE],
      aiPrompts: [
        `«${lesson.title}» сэдвийг ойлгомжтой тайлбарлаж өгөөч`,
        `Намайг «${lesson.title}» сэдвээр шалгаад үзээч`,
      ],
      quizId: null,
      gameSlug: null,
      published: true,
    };
  });
}

/* ──────────  Ажиллуулах  ────────── */

const out = {};

for (const grade of [7, 8, 9]) {
  const mod = loadTsData(`app/${grade}/data.ts`, ["lessons", "chapters"]);
  const lessons = convertMcqLessons(grade, mod.lessons, mod.chapters);
  out[grade] = lessons;
  console.log(`grade ${grade}: ${lessons.length} lessons`);
}

const g10 = loadTsData("app/10/lesson/[id]/page.tsx", ["lessons"]);
out[10] = convertGrade10(g10.lessons);
console.log(`grade 10: ${out[10].length} lessons`);

/* Толь бичиг ба эх сурвалж */
const dict = loadTsData("app/10/dictionary/page.tsx", ["terms"]);
const src = loadTsData("app/10/sources/page.tsx", ["sources"]);
console.log(`dictionary: ${dict.terms.length} terms, sources: ${sourcesCount(src)}`);

function sourcesCount(mod) {
  return (mod.sources ?? []).length;
}

/* ──────────  Файл бичих  ────────── */

const DATA = path.join(ROOT, "data");

for (const grade of [7, 8, 9, 10]) {
  const body = `import type { Lesson } from "@/types";

/**
 * ${grade}-р ангийн хичээлүүд — ерөнхий боловсролын сурах бичигт тулгуурлав.
 * АВТОМАТААР ҮҮСГЭСЭН: scripts/migrate-legacy.md-ыг үз.
 * Гараар засварлахаас өмнө эх сурвалжаа шалгана уу.
 */
export const grade${grade}TextbookLessons: Lesson[] = ${lit(out[grade], 0)};
`;
  fs.writeFileSync(path.join(DATA, "lessons", `grade${grade}-textbook.ts`), body, "utf8");
}

const questionsBody = `import type { Question } from "@/types";

/**
 * Сурах бичгийн хичээлээс автоматаар үүсгэсэн асуултын сан.
 * Эх сурвалж: app/7/data.ts, app/8/data.ts, app/9/data.ts
 */
export const textbookQuestions: Question[] = ${lit(allQuestions, 0)};
`;
fs.writeFileSync(path.join(DATA, "questions-textbook.ts"), questionsBody, "utf8");

/* Толь бичгийн нэмэлт нэр томьёо */
const extraTerms = dict.terms.map((item) => ({
  term: item.term,
  definition: item.definition,
  category: item.category,
  relatedTerms: String(item.related || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
}));

fs.writeFileSync(
  path.join(DATA, "glossary-textbook.ts"),
  `import type { GlossaryTerm } from "@/types";

/** 10-р ангийн тайлбар толиос нүүлгэсэн нэр томьёо. */
export const textbookGlossary: GlossaryTerm[] = ${lit(extraTerms, 0)};
`,
  "utf8",
);

/* Эх сурвалжууд */
const KIND_MAP = {
  "Археологийн сурвалж": "archaeological",
  "Бичгийн сурвалж": "written",
  "Аман сурвалж": "oral",
  "Гэрэл зураг": "photo",
  "Газрын зураг": "map",
  "Баримт бичиг": "document",
  Дурсгал: "monument",
};

const extraSources = (src.sources ?? []).map((item) => ({
  id: `src-tb-${item.id}`,
  title: item.title,
  kind: KIND_MAP[item.type] || "written",
  origin: "Монгол",
  year: item.period,
  excerpt: item.sourceText,
  analysisQuestion: (item.questions ?? [])[0] || "Энэ эх сурвалж юу өгүүлж байна вэ?",
  guidance: (item.hints ?? []).join(" "),
  tags: ["сурах бичиг", item.type].filter(Boolean),
}));

fs.writeFileSync(
  path.join(DATA, "sources-textbook.ts"),
  `import type { HistoricalSource } from "@/types";

/** 10-р ангийн эх сурвалжийн хэсгээс нүүлгэсэн материал. */
export const textbookSources: HistoricalSource[] = ${lit(extraSources, 0)};
`,
  "utf8",
);

console.log(`questions: ${allQuestions.length}`);
console.log("done");
