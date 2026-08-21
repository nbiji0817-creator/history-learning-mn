import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseConfigHint,
  supabaseUrl,
} from "./config";

/**
 * Серверийн Supabase client (Server Component, Route Handler, Server Action).
 * Хэрэглэгчийн session-ыг cookie-оор дамжуулан уншина — иймд RLS зөв ажиллана.
 */
export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(supabaseConfigHint());
  }

  const url = supabaseUrl();
  const key = supabaseAnonKey();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component дотроос cookie бичих боломжгүй.
          // Session сэргээлтийг middleware хийнэ.
        }
      },
    },
  });
}

/**
 * SERVICE ROLE client — RLS-ыг тойрдог.
 *
 * ⚠️ ЗӨВХӨН серверийн орчинд, зөвхөн seed / админы автомат ажилд ашиглана.
 * Энэ түлхүүрийг хэзээ ч client-д дамжуулж болохгүй.
 */
export function createAdminClient() {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY тохируулаагүй байна. Энэ түлхүүр зөвхөн " +
        "серверт хадгалагдана — NEXT_PUBLIC_ угтвар ХЭРЭГЛЭХГҮЙ.",
    );
  }

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
