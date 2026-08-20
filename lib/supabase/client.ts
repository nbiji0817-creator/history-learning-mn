import { createBrowserClient } from "@supabase/ssr";

/**
 * Браузерын Supabase client.
 * Зөвхөн NEXT_PUBLIC_* хувьсагч ашиглана — эдгээр нь ил гарахад аюулгүй.
 * Бодит хамгаалалт нь өгөгдлийн сангийн RLS дээр байна.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase тохируулаагүй байна. .env.local дотор NEXT_PUBLIC_SUPABASE_URL " +
        "болон NEXT_PUBLIC_SUPABASE_ANON_KEY-г тохируулна уу (.env.example-ыг үз).",
    );
  }

  return createBrowserClient(url, key);
}

/** Supabase тохируулагдсан эсэх — Phase 1-д демо өгөгдөл рүү унана. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
