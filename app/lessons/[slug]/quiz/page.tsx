import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/page";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { getLessonBySlug, getQuestionsByIds, getQuiz } from "@/lib/repo";

export async function generateMetadata({
  params,
}: PageProps<"/lessons/[slug]/quiz">): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  return { title: lesson ? `${lesson.title} — тест` : "Тест олдсонгүй" };
}

export default async function LessonQuizPage({
  params,
}: PageProps<"/lessons/[slug]/quiz">) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson || !lesson.quizId) notFound();

  const quiz = await getQuiz(lesson.quizId);
  if (!quiz) notFound();

  const questions = await getQuestionsByIds(quiz.questionIds);

  return (
    <>
      <PageHeader
        eyebrow={`${lesson.grade}-Р АНГИ • ТЕСТ`}
        title={lesson.title}
        icon="📝"
        description="Хариулт бүрийн дараа дэлгэрэнгүй тайлбар харагдана. Буруу хариулсан сэдвээ давтахыг зөвлөнө."
      />

      <Container className="py-10">
        <div className="mx-auto max-w-3xl">
          <QuizRunner
            quizId={quiz.id}
            title={quiz.title}
            questions={questions}
            timeLimit={quiz.timeLimit}
            passScore={quiz.passScore}
            backHref={`/lessons/${lesson.slug}`}
            backLabel="← Хичээл рүү буцах"
          />
        </div>
      </Container>
    </>
  );
}
