"use client";

import { useState } from "react";
import type { Exam, Question } from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { QuizRunner } from "./quiz-runner";
import { shuffle } from "@/lib/utils";

/**
 * Шалгалтын симуляц.
 * Асуултыг браузерт санамсаргүйгээр түүвэрлэдэг тул шалгалт бүр өөр байна.
 */
export function ExamRunner({ exam, pool }: { exam: Exam; pool: Question[] }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const started = questions.length > 0;

  /*
   * Асуултыг товч дарах мөчид холино — render эсвэл effect дотор биш.
   * Ингэснээр сервер дээр Math.random ажиллахгүй тул hydration зөрчил гарахгүй.
   */
  const start = () => {
    setQuestions(shuffle(pool).slice(0, Math.min(exam.questionCount, pool.length)));
  };

  if (!started) {
    return (
      <Card>
        <h2 className="text-xl font-black">{exam.title}</h2>
        <p className="mt-3 leading-7 text-fg-muted">{exam.description}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/60 p-4">
            <dt className="text-xs font-bold text-gold">Асуултын тоо</dt>
            <dd className="mt-1 text-lg font-black">
              {Math.min(exam.questionCount, pool.length)}
            </dd>
          </div>
          <div className="rounded-xl bg-muted/60 p-4">
            <dt className="text-xs font-bold text-gold">Хугацаа</dt>
            <dd className="mt-1 text-lg font-black">
              {exam.duration > 0 ? `${exam.duration} мин` : "Хязгааргүй"}
            </dd>
          </div>
          <div className="rounded-xl bg-muted/60 p-4">
            <dt className="text-xs font-bold text-gold">Сэдэв</dt>
            <dd className="mt-1 text-sm">{exam.topics.join(", ")}</dd>
          </div>
        </dl>

        {pool.length < exam.questionCount ? (
          <p className="mt-5 rounded-xl bg-clay/10 p-4 text-sm text-clay">
            Анхаар: асуултын санд одоогоор {pool.length} асуулт байна. Шалгалт
            тэр тоогоор явагдана. Багш/админ асуултын санг өргөжүүлж болно.
          </p>
        ) : null}

        <div className="mt-8 rounded-xl bg-gold/10 p-5 text-sm leading-7">
          <p className="font-bold text-gold">Зөвлөгөө</p>
          <p className="mt-2 text-fg-muted">
            Эхлээд мэдэж байгаа асуултаа бүгдийг хариулаад, дараа нь эргэлзсэн
            асуулт руугаа буц. Хугацаа дуусахад шалгалт автоматаар дуусна.
          </p>
        </div>

        <div className="mt-8">
          <Button size="lg" onClick={start}>
            ▶ Шалгалт эхлүүлэх
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <QuizRunner
      quizId={`exam-${exam.slug}`}
      title={exam.title}
      questions={questions}
      timeLimit={exam.duration > 0 ? exam.duration * 60 : null}
      passScore={60}
      examMode={false}
      backHref="/exams"
      backLabel="← Шалгалтын жагсаалт"
    />
  );
}
