import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Серверийн Supabase client (Server Component, Route Handler, Server Action).
 * Хэрэглэгчийн session-ыг cookie-оор дамжуулан уншина — иймд RLS зөв ажиллана.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase тохируулаагүй байна (.env.example-ыг үз).",
    );
  }

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
