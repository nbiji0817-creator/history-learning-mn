import { getCurrentUser } from "@/lib/auth-server";
import { buildCorpus } from "@/lib/ai/knowledge";
import {
  describeOpenAiKey,
  embedBatchDetailed,
  getEmbeddingStatus,
} from "@/lib/ai/embeddings";
import { getLessons } from "@/lib/repo";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * EMBEDDING ҮҮСГЭХ
 *
 * Бүх агуулгыг вектор болгож `content_embeddings` хүснэгтэд хадгална.
 * Үүний дараа AI нь өөр үгээр асуусан асуултыг ч ойлгодог болно.
 *
 * Хэзээ дахин ажиллуулах вэ:
 *   • Шинэ хичээл, түүхэн хүн нэмсний дараа
 *   • Агуулгыг ихээхэн засварласны дараа
 *
 * Багц болгон явуулдаг тул нэг удаагийн хугацааны хязгаарт багтана.
 * Дуусаагүй бол `nextOffset` буцаана — дахин дуудаж үргэлжлүүлнэ.
 */

const BATCH_SIZE = 40;

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.profile.role !== "teacher" && user.profile.role !== "admin")) {
    return Response.json({ error: "Эрхгүй" }, { status: 403 });
  }

  const status = await getEmbeddingStatus();
  const corpus = buildCorpus(await getLessons());

  return Response.json({
    ...status,
    corpusSize: corpus.length,
    openAiConfigured: describeOpenAiKey() === null,
    /* Тохиргоо буруу бол ЯГ ЮУ буруу байгааг нь панелд харуулна */
    openAiProblem: describeOpenAiKey(),
  });
}

export async function POST(request: Request) {
  /* ── Эрх ── */
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }
  if (user.profile.role !== "teacher" && user.profile.role !== "admin") {
    return Response.json({ error: "Танд энэ эрх алга" }, { status: 403 });
  }

  /*
   * Түлхүүрийн хэлбэрийг OpenAI руу залгахаас ӨМНӨ шалгана. Дутуу
   * буулгасан түлхүүр 401 өгдөг ч, шалтгааныг нь урьдчилж хэлэх нь
   * хэрэглэгчид хамаагүй тустай.
   */
  const keyProblem = describeOpenAiKey();
  if (keyProblem) {
    return Response.json({ error: keyProblem }, { status: 503 });
  }

  let offset = 0;
  try {
    const body = (await request.json()) as { offset?: number };
    offset = Math.max(0, Number(body.offset ?? 0));
  } catch {
    /* Биегүй хүсэлт — эхнээс нь эхэлнэ */
  }

  const corpus = buildCorpus(await getLessons());
  const batch = corpus.slice(offset, offset + BATCH_SIZE);

  if (batch.length === 0) {
    return Response.json({
      ok: true,
      done: true,
      processed: 0,
      total: corpus.length,
    });
  }

  /* Гарчиг + агуулгыг хамт векторчилно — гарчиг чухал дохио өгдөг */
  const texts = batch.map((doc) => `${doc.title}\n${doc.body}`);
  const result = await embedBatchDetailed(texts);

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 502 });
  }

  const vectors = result.vectors;

  if (vectors.length !== batch.length) {
    return Response.json(
      {
        error:
          `OpenAI ${batch.length} текстээс ${vectors.length}-ыг нь ` +
          "буцаалаа. Дахин оролдоно уу.",
      },
      { status: 502 },
    );
  }

  try {
    /* Бичихдээ service role — RLS-ийг тойрох шаардлагатай багц ажил */
    const admin = createAdminClient();

    const rows = batch.map((doc, index) => ({
      doc_id: doc.id,
      kind: doc.kind,
      title: doc.title,
      href: doc.href,
      content: doc.body.slice(0, 4000),
      embedding: vectors[index],
      updated_at: new Date().toISOString(),
    }));

    const { error } = await admin
      .from("content_embeddings")
      .upsert(rows, { onConflict: "doc_id" });

    if (error) {
      const missingTable =
        error.message?.includes("schema cache") ||
        error.message?.includes("does not exist");

      return Response.json(
        {
          error: missingTable
            ? "content_embeddings хүснэгт олдсонгүй. supabase/migrations/0005_embeddings.sql-ыг ажиллуулна уу."
            : error.message,
        },
        { status: 500 },
      );
    }

    const nextOffset = offset + batch.length;
    const done = nextOffset >= corpus.length;

    return Response.json({
      ok: true,
      done,
      processed: batch.length,
      nextOffset: done ? null : nextOffset,
      total: corpus.length,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "SUPABASE_SERVICE_ROLE_KEY тохируулсан эсэхийг шалгана уу.",
      },
      { status: 500 },
    );
  }
}
