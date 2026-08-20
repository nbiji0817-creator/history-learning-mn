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

  return Response.json(
    {
      ok: true,
      source: status.seeded ? "supabase" : "local",
      supabase: status,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
