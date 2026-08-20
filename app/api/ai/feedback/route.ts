import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * AI-ийн хариултад үнэлгээ өгөх.
 *
 * `questionId` нь таамаглах боломжгүй uuid бөгөөд зөвхөн тухайн асуултыг
 * асуусан хүнд буцаагдсан байдаг. Иймд нэвтрээгүй сурагч ч үнэлгээгээ
 * өгөх боломжтой — энэ нь AI-г сайжруулах хамгийн үнэ цэнэтэй мэдээлэл.
 */
export async function POST(request: Request) {
  let body: { questionId?: string; rating?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Буруу хүсэлт" }, { status: 400 });
  }

  const { questionId, rating } = body;

  if (!questionId || (rating !== 1 && rating !== -1)) {
    return Response.json({ error: "Буруу утга" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("ai_questions")
      .update({ rating })
      .eq("id", questionId);

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Хадгалахад алдаа гарлаа" }, { status: 500 });
  }
}
