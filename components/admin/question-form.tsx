"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Difficulty, EraKey, GradeNumber, Question } from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { saveQuestion } from "@/lib/actions/content";
import { cn, difficultyLabels } from "@/lib/utils";
import { AiGenerate, type QuestionDraft } from "./ai-generate";

const ERA_LABELS: Record<EraKey, string> = {
  ancient: "Эрт үе",
  medieval: "Дундад үе",
  modern: "Шинэ үе",
  contemporary: "Орчин үе",
};

export function QuestionForm({ question }: { question?: Question }) {
  const router = useRouter();

  const isTrueFalse = question?.type === "true_false";

  const [grade, setGrade] = useState<GradeNumber | "">(question?.grade ?? "");
  const [topic, setTopic] = useState(question?.topic ?? "");
  const [era, setEra] = useState<EraKey>(question?.era ?? "medieval");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    question?.difficulty ?? "medium",
  );
  const [type, setType] = useState<"multiple_choice" | "true_false">(
    isTrueFalse ? "true_false" : "multiple_choice",
  );
  const [prompt, setPrompt] = useState(question?.prompt ?? "");
  const [options, setOptions] = useState(
    (question?.options ?? ["", "", "", ""]).join("\n"),
  );
  const [answerIndex, setAnswerIndex] = useState(question?.answerIndex ?? 0);
  const [explanation, setExplanation] = useState(question?.explanation ?? "");
  const [tags, setTags] = useState((question?.tags ?? []).join(", "));

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optionList = options
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  /**
   * AI хэд хэдэн асуулт үүсгэдэг. Эхнийхийг формд буулгаж, үлдсэнийг
   * дараалалд хадгална — нэгийг хадгалсны дараа дараагийнх нь гарч ирнэ.
   */
  const [queue, setQueue] = useState<QuestionDraft[]>([]);

  const applyDraft = (draft: QuestionDraft) => {
    if (draft.prompt) setPrompt(draft.prompt);
    if (draft.options?.length) setOptions(draft.options.join("\n"));
    if (typeof draft.answerIndex === "number") setAnswerIndex(draft.answerIndex);
    if (draft.explanation) setExplanation(draft.explanation);
    if (draft.topic) setTopic(draft.topic);
    if (draft.difficulty && ["easy", "medium", "hard"].includes(draft.difficulty)) {
      setDifficulty(draft.difficulty as Difficulty);
    }
    setType("multiple_choice");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const result = await saveQuestion({
      id: question?.id,
      grade: grade === "" ? null : grade,
      topic,
      era,
      difficulty,
      type,
      prompt,
      options: type === "true_false" ? "Үнэн\nХудал" : options,
      answerIndex,
      explanation,
      tags,
    });

    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/admin/questions");
    router.refresh();
  };

  const field =
    "mt-2 w-full rounded-xl border border-line bg-muted/40 px-4 py-3 text-sm outline-none focus:border-gold";

  const shownOptions = type === "true_false" ? ["Үнэн", "Худал"] : optionList;

  return (
    <form onSubmit={submit} className="space-y-6">
      <AiGenerate
        kind="questions"
        grade={grade === "" ? 6 : grade}
        onQuestions={(drafts) => {
          const [first, ...rest] = drafts;
          if (first) applyDraft(first);
          setQueue(rest);
        }}
      />

      {queue.length > 0 ? (
        <Card className="border-gold/40 bg-gold/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              AI үүсгэсэн <b>{queue.length}</b> асуулт дараалалд хүлээж байна.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                const [next, ...rest] = queue;
                applyDraft(next);
                setQueue(rest);
              }}
            >
              Дараагийнхыг харах →
            </Button>
          </div>
        </Card>
      ) : null}

      <Card>
        <h2 className="text-sm font-black">Асуулт</h2>

        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["multiple_choice", "true_false"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setType(item);
                  setAnswerIndex(0);
                }}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                  type === item
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-line text-fg-muted",
                )}
              >
                {item === "multiple_choice" ? "Олон сонголт" : "Үнэн / Худал"}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-sm font-semibold">Асуулт *</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={3}
              placeholder="Хүннү гүрэн хэдэн онд хүчирхэгжсэн бэ?"
              className={field}
              required
            />
          </label>

          {type === "multiple_choice" ? (
            <label className="block">
              <span className="text-sm font-semibold">Сонголтууд *</span>
              <textarea
                value={options}
                onChange={(event) => setOptions(event.target.value)}
                rows={5}
                placeholder={"Мөр бүрд нэг сонголт:\nМЭӨ 209\nМЭӨ 109\nМЭ 209\nМЭӨ 309"}
                className={field}
                required
              />
              <span className="mt-1.5 block text-xs text-fg-muted">
                {optionList.length} сонголт
              </span>
            </label>
          ) : null}

          {shownOptions.length >= 2 ? (
            <div>
              <span className="text-sm font-semibold">Зөв хариулт *</span>
              <div className="mt-2 grid gap-2">
                {shownOptions.map((option, index) => (
                  <button
                    key={`${option}-${index}`}
                    type="button"
                    onClick={() => setAnswerIndex(index)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition",
                      answerIndex === index
                        ? "border-emerald-500 bg-emerald-500/10 font-semibold"
                        : "border-line hover:border-gold/50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black",
                        answerIndex === index
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-fg-muted",
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="rounded-xl bg-muted/60 p-3 text-sm text-fg-muted">
              Зөв хариулт сонгохын тулд дор хаяж 2 сонголт бичнэ үү.
            </p>
          )}

          <label className="block">
            <span className="text-sm font-semibold">Тайлбар *</span>
            <textarea
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              rows={3}
              placeholder="Яагаад энэ хариулт зөв болохыг тайлбарла. Сурагч буруу хариулсныхаа дараа үүнийг уншина."
              className={field}
              required
            />
          </label>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-black">Ангилал</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">Анги</span>
            <select
              value={grade}
              onChange={(event) =>
                setGrade(
                  event.target.value === ""
                    ? ""
                    : (Number(event.target.value) as GradeNumber),
                )
              }
              className={field}
            >
              <option value="">— бүх анги —</option>
              {[6, 7, 8, 9, 10, 11, 12].map((item) => (
                <option key={item} value={item}>
                  {item}-р анги
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Эрин үе</span>
            <select
              value={era}
              onChange={(event) => setEra(event.target.value as EraKey)}
              className={field}
            >
              {(Object.keys(ERA_LABELS) as EraKey[]).map((item) => (
                <option key={item} value={item}>
                  {ERA_LABELS[item]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Сэдэв</span>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Хүннү"
              className={field}
            />
            <span className="mt-1.5 block text-xs text-fg-muted">
              Сул сэдвийн шинжилгээнд ашиглагдана
            </span>
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
            <span className="text-sm font-semibold">Шошго</span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="hunnu, on-tsag"
              className={field}
            />
            <span className="mt-1.5 block text-xs text-fg-muted">
              Хичээлийн slug-ыг шошго болгон бичвэл тэр хичээлийн тестэд
              автоматаар багтана
            </span>
          </label>
        </div>
      </Card>

      {error ? (
        <p className="rounded-xl bg-clay/10 p-4 text-sm text-clay">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "Хадгалж байна…" : question ? "Хадгалах" : "Асуулт нэмэх"}
        </Button>
        <Link
          href="/admin/questions"
          className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
        >
          Болих
        </Link>
      </div>
    </form>
  );
}
