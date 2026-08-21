import { createBrowserClient } from "@supabase/ssr";
import {
  isSupabaseConfigured as configured,
  supabaseAnonKey,
  supabaseConfigHint,
  supabaseUrl,
} from "./config";

/**
 * Браузерын Supabase client.
 * Зөвхөн NEXT_PUBLIC_* хувьсагч ашиглана — эдгээр нь ил гарахад аюулгүй.
 * Бодит хамгаалалт нь өгөгдлийн сангийн RLS дээр байна.
 */
export function createClient() {
  if (!configured()) {
    throw new Error(supabaseConfigHint());
  }

  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}

/*
 * Нэг эх сурвалж: шалгалтыг `./config` дотор л хийнэ. Өмнө нь энд
 * сул хувилбар (зөвхөн «хоосон биш үү») байсан тул буруу хаягийг
 * зөв гэж үзээд нэвтрэлт чимээгүй унадаг байв.
 */
export { isSupabaseConfigured, supabaseConfigHint } from "./config";
