/**
 * Supabase тохируулагдсан эсэхийг шалгана.
 *
 * Server болон client хоёуланд ажиллана — NEXT_PUBLIC_* хувьсагчийг
 * Next.js build-ийн үед шууд утгаар нь орлуулдаг тул `process.env.X`-ыг
 * бүтнээр нь бичих ёстой (destructure хийвэл ажиллахгүй).
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
      key &&
      url.startsWith("http") &&
      // Загварын утгыг бодит утга гэж үзэхгүй
      !url.includes("xxxxxxxxxxxxx"),
  );
}
