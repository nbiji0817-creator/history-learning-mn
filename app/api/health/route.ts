import { getDbStatus } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Supabase холболтын төлөв.
 *
 *   curl http://localhost:3000/api/health
 *
 * Хариултын `source` талбар нь систем яг одоо хаанаас өгөгдөл уншиж
 * байгааг харуулна: "supabase" эсвэл "local".
 */
export async function GET() {
  const status = await getDbStatus();

  /*
   * Тохируулсан хаягийг харуулна. NEXT_PUBLIC_SUPABASE_URL нь загвараараа
   * нийтийн (client bundle дотор ил байдаг) тул үүнийг үзүүлэх нь аюулгүй.
   * Түлхүүрүүдийг ХАРУУЛАХГҮЙ — зөвхөн тохируулсан эсэх, уртыг нь.
   */
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const looksLikeSupabase = /^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(
    url.trim(),
  );

  return Response.json(
    {
      ok: true,
      source: status.seeded ? "supabase" : "local",
      supabase: status,
      config: {
        url: url || "(тохируулаагүй)",
        urlLooksCorrect: looksLikeSupabase,
        urlHint: looksLikeSupabase
          ? "OK"
          : "https://<project-ref>.supabase.co хэлбэртэй байх ёстой " +
            "(/rest/v1/ хэсэггүй, төгсгөлд ташуу зураасгүй).",
        anonKeySet: anonKey.length > 0,
        serviceKeySet: serviceKey.length > 0,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "(тохируулаагүй)",
        teacherCodeSet: Boolean(process.env.TEACHER_INVITE_CODE),
        seedSecretSet: Boolean(process.env.SEED_SECRET),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
