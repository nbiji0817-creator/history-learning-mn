import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseUrl,
} from "./config";

/**
 * Хүсэлт бүрд нэвтрэлтийн session-ыг шинэчилнэ.
 *
 * Supabase-ийн access token богино хугацаатай тул хугацаа нь дуусахад
 * refresh token-оор сэргээх шаардлагатай. Үүнийг proxy дээр хийвэл
 * Server Component-ууд үргэлж хүчинтэй session-тэй ажиллана.
 *
 * ЧУХАЛ: `supabase.auth.getUser()`-ыг заавал дуудна. Энэ нь token-ыг
 * Supabase сервер дээр шалгадаг. `getSession()` нь зөвхөн cookie-г уншдаг
 * тул хуурамч cookie-д хууртаж болзошгүй — эрхийн шалгалтад ашиглаж болохгүй.
 */
export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl(),
    supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  try {
    await supabase.auth.getUser();
  } catch {
    // Сүлжээ тасарсан ч хуудас ачаалагдах ёстой — зочин болж үзнэ
  }

  return response;
}
