/**
 * «Хэн бэ?» тоглоомын сэжүүрийг шалгана.
 *
 * Хамгийн түгээмэл алдаа бол сэжүүр дотор хүний нэр, эсвэл албан
 * тушаал задарч, таавар утгагүй болох явдал. Гараар 92 сэжүүр
 * бичсэн тул нүдээр шалгах найдваргүй.
 */
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(p, "utf8");

/*
 * Өгөгдлийг TS-ээс импортлохын оронд энгийн задлан хийнэ — `@/`
 * alias шийдэх шаардлагагүй, шалгалт хурдан ажиллана.
 */
const figuresSrc = read("data/figures.ts");
const cluesSrc = read("data/figure-clues.ts");

const figures = [
  ...figuresSrc.matchAll(
    /slug: "([^"]+)",\s*\n\s*name: "([^"]+)",\s*\n\s*title: "([^"]+)"/g,
  ),
].map((m) => ({ slug: m[1], name: m[2], title: m[3] }));

const clueBlocks = [
  ...cluesSrc.matchAll(/"?([a-z0-9-]+)"?:\s*\[([\s\S]*?)\n  \],/g),
].map((m) => ({
  slug: m[1],
  /* Сэжүүр дотор escape хийсэн хашилт байхгүй — « » ашигласан */
  clues: [...m[2].matchAll(/"([^"]*)"/g)].map((c) => c[1]),
}));

const bySlug = new Map(clueBlocks.map((b) => [b.slug, b.clues]));

/** Олон хүнд нийтлэг цол — эдгээр задарсан ч хариултыг заахгүй */
const HONORIFICS = new Set([
  "хаан", "хан", "хатан", "сэцэн", "баатар", "шаньюй",
  "ноён", "сайн", "богд", "жавзандамба", "македонский",
]);

let problems = 0;

for (const figure of figures) {
  const clues = bySlug.get(figure.slug);

  if (!clues) {
    console.log(`✗ ${figure.slug.padEnd(20)} сэжүүр огт алга`);
    problems += 1;
    continue;
  }
  if (clues.length !== 4) {
    console.log(
      `✗ ${figure.slug.padEnd(20)} ${clues.length} сэжүүртэй (4 байх ёстой)`,
    );
    problems += 1;
    continue;
  }

  const joined = clues.join(" ");
  const issues = [];

  /*
   * Нэрний ОНЦЛОХ хэсэг задарсан эсэх (Д.Сүхбаатар → «Сүхбаатар»).
   *
   * Цол, хүндэтгэлийн үгийг тооцохгүй: «дөрөв дэх их хаан» гэсэн
   * сэжүүр нь АЛЬ хаан болохыг заахгүй тул асуудалгүй. Харин
   * «Хубилай» гэсэн үг гарвал таавар дуусна.
   */
  for (const word of figure.name.split(/[\s.]+/).filter((w) => w.length >= 4)) {
    if (HONORIFICS.has(word.toLowerCase())) continue;
    if (joined.includes(word)) issues.push(`нэр задарсан: «${word}»`);
  }

  /* Албан тушаал бүтнээрээ орсон эсэх */
  if (joined.includes(figure.title)) issues.push("албан тушаал бүтнээр орсон");

  /* Хэт богино сэжүүр нь чиглүүлэг өгөхгүй */
  const short = clues.filter((c) => c.length < 30).length;
  if (short > 0) issues.push(`${short} сэжүүр хэт богино`);

  if (issues.length > 0) {
    console.log(`✗ ${figure.slug.padEnd(20)} ${issues.join("; ")}`);
    problems += issues.length;
  } else {
    console.log(`✓ ${figure.slug.padEnd(20)} 4 сэжүүр цэвэр`);
  }
}

const extra = clueBlocks.filter(
  (b) => !figures.some((f) => f.slug === b.slug),
);
for (const item of extra) {
  console.log(`✗ ${item.slug.padEnd(20)} ийм хүн байхгүй`);
  problems += 1;
}

console.log(
  problems === 0
    ? `\nБүгд зөв — ${figures.length} хүн, ${figures.length * 4} сэжүүр`
    : `\n${problems} асуудал`,
);
process.exit(problems === 0 ? 0 : 1);
