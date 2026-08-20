import { createAdminClient, createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * ЭРХ ОЛГОХ
 *
 * Аюулгүй байдлын зарчим:
 *
 * 1. Хэрэглэгчийг ЗӨВХӨН session-аас тодорхойлно. Client-ийн илгээсэн
 *    `userId`-д хэзээ ч итгэхгүй — эс тэгвэл хэн ч бусдын эрхийг өөрчилнө.
 *
 * 2. `student` → `parent` нь өөрөө сонгох боломжтой (эрсдэл бага, зөвхөн
 *    өөрийн холбогдсон хүүхдийн мэдээллийг харна — RLS хамгаална).
 *
 * 3. `teacher` эрх нь TEACHER_INVITE_CODE-той таарсан үед л олгогдоно.
 *    Код нь зөвхөн серверт байна.
 *
 * 4. `admin` эрхийг ЭНЭ ЗАМААР ХЭЗЭЭ Ч олгохгүй. Зөвхөн SQL-ээр:
 *      update public.profiles set role = 'admin' where email = '...';
 *
 * 5. Аль хэдийн teacher/admin эрхтэй хүний эрхийг бууруулахгүй.
 */

interface ClaimBody {
  role?: "parent" | "teacher";
  teacherCode?: string;
}

export async function POST(request: Request) {
  let body: ClaimBody;
  try {
    body = (await request.json()) as ClaimBody;
  } catch {
    return Response.json({ error: "Буруу хүсэлт" }, { status: 400 });
  }

  /* ── 1. Хэн хүсэлт илгээж байгааг session-аас тогтооно ── */
  let userId: string;
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
    }
    userId = user.id;
  } catch {
    return Response.json({ error: "Нэвтрэлт шалгах боломжгүй" }, { status: 500 });
  }

  /* ── 2. Хүссэн эрхийг шалгана ── */
  let newRole: "parent" | "teacher";

  if (body.role === "teacher") {
    const expected = process.env.TEACHER_INVITE_CODE;

    if (!expected) {
      return Response.json(
        {
          error:
            "Багшийн урилгын код тохируулаагүй байна. Админд хандана уу.",
        },
        { status: 503 },
      );
    }
    if (!body.teacherCode || body.teacherCode.trim() !== expected) {
      return Response.json({ error: "Багшийн код буруу байна." }, { status: 403 });
    }
    newRole = "teacher";
  } else if (body.role === "parent") {
    newRole = "parent";
  } else {
    return Response.json({ error: "Буруу эрх" }, { status: 400 });
  }

  /* ── 3. Эрхийг олгоно (RLS хэрэглэгчид өөрийн role-оо солихыг хориглодог
         тул service role шаардлагатай) ── */
  try {
    const admin = createAdminClient();

    const { data: current } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    /* Одоо байгаа эрх нь илүү өндөр бол бууруулахгүй */
    if (current?.role === "admin" || current?.role === "teacher") {
      return Response.json({ ok: true, role: current.role, changed: false });
    }

    const { error } = await admin
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true, role: newRole, changed: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Эрх олгоход алдаа гарлаа. SUPABASE_SERVICE_ROLE_KEY тохируулсан эсэхийг шалгана уу.",
      },
      { status: 500 },
    );
  }
}
