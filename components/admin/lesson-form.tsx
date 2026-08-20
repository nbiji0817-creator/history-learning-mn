"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Difficulty, GradeNumber, Lesson } from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { saveLesson, type LessonSectionInput } from "@/lib/actions/content";
import { cn, difficultyLabels } from "@/lib/utils";

/**
 * Кирилл гарчгийг латин slug болгоно.
 * Client талд хийж байгаа шалтгаан: гарчиг бичих бүрд сервер рүү хүсэлт
 * явуулах нь илүүц ачаалал үүсгэнэ.
 */
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "ye", ё: "yo", ж: "j", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "u", п: "p",
  р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "kh", ц: "ts", ч: "ch",
  ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function toSlug(value: string): string {
  return (
    [...value.toLowerCase()]
      .map((char) => TRANSLIT[char] ?? char)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "")
  );
}

const SECTION_TYPES: {
  key: LessonSectionInput["type"];
  label: string;
  hint: string;
}[] = [
  { key: "text", label: "Текст", hint: "Энгийн тайлбар. Хоосон мөрөөр догол мөр салгана." },
  { key: "keypoints", label: "Гол санаа", hint: "Мөр бүр нэг санаа." },
  { key: "concepts", label: "Нэр томьёо", hint: "Мөр бүрд: нэр :: тайлбар" },
];

/** Байгаа хичээлийн блокуудыг формын хэлбэрт хөрвүүлнэ. */
function toFormSections(lesson?: Lesson): LessonSectionInput[] {
  if (!lesson || lesson.sections.length === 0) {
    return [{ type: "text", title: "Хичээлийн танилцуулга", body: "" }];
  }

  return lesson.sections
    .filter((section) =>
      ["text", "keypoints", "concepts"].includes(section.type),
    )
    .map((section) => ({
      type: section.type as LessonSectionInput["type"],
      title: section.title,
      body: section.body ?? "",
      points: (section.points ?? []).join("\n"),
      concepts: (section.concepts ?? [])
        .map((item) => `${item.term} :: ${item.definition}`)
        .join("\n"),
    }));
}

export function LessonForm({ lesson }: { lesson?: Lesson }) {
  const router = useRouter();

  const [slug, setSlug] = useState(lesson?.slug ?? "");
  const [grade, setGrade] = useState<GradeNumber>(lesson?.grade ?? 6);
  const [order, setOrder] = useState(lesson?.order ?? 1);
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [subtitle, setSubtitle] = useState(lesson?.subtitle ?? "");
  const [icon, setIcon] = useState(lesson?.icon ?? "📘");
  const [summary, setSummary] = useState(lesson?.summary ?? "");
  const [objectives, setObjectives] = useState(
    (lesson?.objectives ?? []).join("\n"),
  );
  const [duration, setDuration] = useState(lesson?.durationMinutes ?? 30);
  const [difficulty, setDifficulty] = useState<Difficulty>(
    lesson?.difficulty ?? "medium",
  );
  const [tags, setTags] = useState((lesson?.tags ?? []).join(", "));
  const [conclusion, setConclusion] = useState(lesson?.conclusion ?? "");
  const [published, setPublished] = useState(lesson?.published ?? false);
  const [sections, setSections] = useState<LessonSectionInput[]>(() =>
    toFormSections(lesson),
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Гарчиг бичихэд slug-ыг автоматаар санал болгоно (шинэ хичээл дээр). */
  const onTitleChange = (value: string) => {
    setTitle(value);
    /* Байгаа хичээлийн slug-ыг өөрчилбөл хуучин холбоос эвдэрнэ — зөвхөн шинэд */
    if (!lesson) setSlug(toSlug(value));
  };

  const updateSection = (index: number, patch: Partial<LessonSectionInput>) => {
    setSections((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= sections.length) return;
    setSections((current) => {
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const result = await saveLesson({
      id: lesson?.id,
      slug,
      grade,
      order,
      title,
      subtitle,
      icon,
      summary,
      objectives,
      durationMinutes: duration,
      difficulty,
      tags,
      conclusion,
      published,
      sections,
    });

    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/admin/lessons");
    router.refresh();
  };

  const field =
    "mt-2 w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold";

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <h2 className="text-sm font-black">Үндсэн мэдээлэл</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">Гарчиг *</span>
            <input
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Жишээ: Хүннү гүрэн"
              className={field}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Дэд гарчиг</span>
            <input
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder="Монгол нутаг дахь анхны төрт улс"
              className={field}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Дүрс (эмодзи)</span>
            <input
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              placeholder="🏹"
              className={field}
              maxLength={4}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Анги *</span>
            <select
              value={grade}
              onChange={(event) =>
                setGrade(Number(event.target.value) as GradeNumber)
              }
              className={field}
            >
              {[6, 7, 8, 9, 10, 11, 12].map((item) => (
                <option key={item} value={item}>
                  {item}-р анги
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Дараалал</span>
            <input
              type="number"
              value={order}
              onChange={(event) => setOrder(Number(event.target.value))}
              min={1}
              className={field}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Хугацаа (мин)</span>
            <input
              type="number"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              min={5}
              className={field}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Түвшин</span>
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as Difficulty)}
              className={field}
            >
              {(["easy", "medium", "hard", "olympiad"] as Difficulty[]).map(
                (item) => (
                  <option key={item} value={item}>
                    {difficultyLabels[item]}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">Slug (хаягийн нэр) *</span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="hunnu-guren"
              className={`${field} font-mono`}
              required
            />
            <span className="mt-1.5 block text-xs text-fg-muted">
              Хаяг: /lessons/{slug || "…"} — зөвхөн латин үсэг, тоо, зураас
            </span>
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">Товч тайлбар</span>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={2}
              placeholder="Энэ хичээлээр юу судлахыг 1–2 өгүүлбэрээр"
              className={field}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">Суралцах зорилго</span>
            <textarea
              value={objectives}
              onChange={(event) => setObjectives(event.target.value)}
              rows={4}
              placeholder={"Мөр бүрд нэг зорилго:\nХүннү гүрэн байгуулагдсан он, нөхцөлийг хэлэх\nМодун шаньюйн шинэчлэлийг тайлбарлах"}
              className={field}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">Шошго</span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="Хүннү, төрт ёс, 6-р анги"
              className={field}
            />
            <span className="mt-1.5 block text-xs text-fg-muted">
              Таслалаар тусгаарлана
            </span>
          </label>
        </div>
      </Card>

      {/* ── Блокууд ── */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-black">Хичээлийн блокууд</h2>
          <span className="text-xs text-fg-muted">{sections.length} блок</span>
        </div>

        <div className="mt-5 space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="rounded-2xl border border-line p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {SECTION_TYPES.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => updateSection(index, { type: item.key })}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold transition",
                        section.type === item.key
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-line text-fg-muted",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(index, index - 1)}
                    disabled={index === 0}
                    className="rounded-lg bg-muted px-2.5 py-1 text-sm disabled:opacity-30"
                    aria-label="Дээш"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(index, index + 1)}
                    disabled={index === sections.length - 1}
                    className="rounded-lg bg-muted px-2.5 py-1 text-sm disabled:opacity-30"
                    aria-label="Доош"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSections((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                    className="rounded-lg bg-clay/15 px-2.5 py-1 text-sm text-clay"
                    aria-label="Устгах"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <input
                value={section.title}
                onChange={(event) =>
                  updateSection(index, { title: event.target.value })
                }
                placeholder="Блокийн гарчиг"
                className={`${field} font-semibold`}
              />

              <textarea
                value={
                  section.type === "text"
                    ? (section.body ?? "")
                    : section.type === "keypoints"
                      ? (section.points ?? "")
                      : (section.concepts ?? "")
                }
                onChange={(event) =>
                  updateSection(
                    index,
                    section.type === "text"
                      ? { body: event.target.value }
                      : section.type === "keypoints"
                        ? { points: event.target.value }
                        : { concepts: event.target.value },
                  )
                }
                rows={section.type === "text" ? 7 : 5}
                placeholder={
                  section.type === "text"
                    ? "Тайлбар текст…"
                    : section.type === "keypoints"
                      ? "Мөр бүрд нэг санаа"
                      : "Хүннү :: Монгол нутагт байгуулагдсан анхны төрт улс"
                }
                className={`${field} leading-7`}
              />

              <p className="mt-2 text-xs text-fg-muted">
                {SECTION_TYPES.find((item) => item.key === section.type)?.hint}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {SECTION_TYPES.map((item) => (
            <Button
              key={item.key}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setSections((current) => [
                  ...current,
                  { type: item.key, title: "", body: "", points: "", concepts: "" },
                ])
              }
            >
              + {item.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* ── Дүгнэлт, төлөв ── */}
      <Card>
        <label className="block">
          <span className="text-sm font-semibold">Дүгнэлт</span>
          <textarea
            value={conclusion}
            onChange={(event) => setConclusion(event.target.value)}
            rows={3}
            placeholder="Хичээлийн төгсгөлийн дүгнэлт"
            className={field}
          />
        </label>

        <label className="mt-5 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
            className="h-5 w-5 accent-[var(--gold)]"
          />
          <span>
            <span className="block text-sm font-semibold">Нийтлэх</span>
            <span className="block text-xs text-fg-muted">
              Тэмдэглээгүй бол зөвхөн багш/админ харна
            </span>
          </span>
        </label>
      </Card>

      {error ? (
        <p className="rounded-xl bg-clay/10 p-4 text-sm text-clay">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "Хадгалж байна…" : lesson ? "Хадгалах" : "Хичээл үүсгэх"}
        </Button>
        <Link
          href="/admin/lessons"
          className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
        >
          Болих
        </Link>
      </div>
    </form>
  );
}
