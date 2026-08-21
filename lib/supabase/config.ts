/**
 * Supabase-ийн тохиргоог НЭГ ГАЗРААС уншина.
 *
 * Server болон client хоёуланд ажиллана — NEXT_PUBLIC_* хувьсагчийг
 * Next.js build-ийн үед шууд утгаар нь орлуулдаг тул `process.env.X`-ыг
 * бүтнээр нь бичих ёстой (destructure хийвэл ажиллахгүй).
 *
 * ЗАЙ ТАЙРАХ нь чухал: Vercel-ийн нүдэнд хуулж буулгахад мөрийн урд,
 * ард зай эсвэл tab үлддэг. Тайрахгүй бол `new URL()` унаж, нэвтрэх
 * хүсэлт хаашаа ч хамаагүй явдаг.
 */

/**
 * Тайрсан, цэгцэлсэн Supabase project URL.
 *
 * Supabase-ийн хяналтын самбар нь `https://<ref>.supabase.co/rest/v1/`
 * хэлбэрээр хуулах товч санал болгодог. Client нь замыг өөрөө нэмдэг
 * тул зөвхөн origin хэсэг үлдээнэ — эс бөгөөс `/rest/v1/rest/v1/...`
 * болж 404 өгнө.
 */
export function supabaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  if (!raw) return "";

  try {
    return new URL(raw).origin;
  } catch {
    /* URL болж задрахгүй бол хэвээр нь буцаана — шалгалт нь барина */
    return raw;
  }
}

/** Тайрсан anon (publishable) түлхүүр. */
export function supabaseAnonKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
}

/**
 * Утга нь ЖИНХЭНЭ Supabase хаяг мөн эсэх.
 *
 * Зөвхөн «хоосон биш» гэж шалгахад хангалтгүй: өмнө нь энэ мөрөнд
 * сайтын өөрийнх нь хаяг бичигдэж, нэвтрэх хүсэлт HTML буцааж
 * «Unexpected token '<'» алдаа өгч байсан.
 */
export function isSupabaseConfigured(): boolean {
  const url = supabaseUrl();
  const key = supabaseAnonKey();

  if (!url || !key) return false;

  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      /\.supabase\.(co|in)$/.test(parsed.hostname) &&
      // Загварын утгыг бодит утга гэж үзэхгүй
      !url.includes("xxxxxxxxxxxxx")
    );
  } catch {
    /* Зай, tab, илүү текст — URL болж задрахгүй бол тохируулаагүйтэй адил */
    return false;
  }
}

/** Тохиргоо буруу үед хэрэглэгчид харуулах монгол тайлбар. */
export function supabaseConfigHint(): string {
  const url = supabaseUrl();

  if (!url) {
    return "NEXT_PUBLIC_SUPABASE_URL тохируулаагүй байна.";
  }
  if (!supabaseAnonKey()) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY тохируулаагүй байна.";
  }
  return (
    "NEXT_PUBLIC_SUPABASE_URL буруу байна. " +
    "https://<project-ref>.supabase.co хэлбэртэй, урд хойно нь зай, " +
    "илүү текстгүй байх ёстой."
  );
}
