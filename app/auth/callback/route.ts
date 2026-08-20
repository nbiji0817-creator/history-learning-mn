import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Имэйл баталгаажуулалтын буцах цэг.
 *
 * Supabase хэрэглэгчийн имэйл рүү илгээсэн холбоос энд буцаж ирнэ.
 * `code`-ыг session болгон солиод хэрэглэгчийг зохих хэсэг рүү оруулна.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const authError = searchParams.get("error_description");

  if (authError) {
    return NextResponse.redirect(
      `${origin}/login?denied=1&reason=${encodeURIComponent(authError)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        `${origin}/login?denied=1&reason=${encodeURIComponent(error.message)}`,
      );
    }

    return NextResponse.redirect(`${origin}${next}`);
  } catch {
    return NextResponse.redirect(`${origin}/login`);
  }
}
