import { getDbStatus } from "@/lib/repo";
import { webSearchProvider } from "@/lib/ai/web-search";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";
import { describeOpenAiKey } from "@/lib/ai/embeddings";

/**
 * Орчны хувьсагчийн төлөвийг хүн уншихаар тайлбарлана.
 *
 * «Тохируулаагүй» болон «хоосон утгатай» хоёр нь ӨӨР асуудал:
 * эхнийх нь мартсан, хоёр дахь нь Vercel дээр мөрийг үүсгээд утгыг
 * нь бөглөөгүй гэсэн үг. Хоёуланг нь ялгаж хэлэхгүй бол хэрэглэгч
 * «би нэмсэн шүү дээ» гээд эргэлзэнэ.
 *
 * Утгыг НЬ ХЭЗЭЭ Ч буцаахгүй — зөвхөн төлөвийг.
 */
function describe(name: string): string {
  const raw = process.env[name];
  if (raw === undefined) return "тохируулаагүй";
  if (raw.trim() === "") return "⚠️ мөр үүссэн ч утга нь ХООСОН байна";
  return "OK";
}

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
  /* Тайрсан утгыг харуулна — зай, tab нь нүдэнд харагддаггүй */
  const url = supabaseUrl();
  const anonKey = supabaseAnonKey();
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
        siteUrl: describe("NEXT_PUBLIC_SITE_URL"),
        teacherCode: describe("TEACHER_INVITE_CODE"),
        seedSecret: describe("SEED_SECRET"),
        /* Хоосон эсэхээс гадна ХЭЛБЭР нь зөв эсэхийг шалгана */
        openAiKey: describeOpenAiKey() ?? "OK",
        openAiKeyLength: (process.env.OPENAI_API_KEY ?? "").trim().length,
        openAiModel: describe("OPENAI_MODEL"),
        /* Википедиа түлхүүргүй ажилладаг тул энэ нь хэзээ ч хоосон биш */
        webSearchProvider: webSearchProvider(),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
