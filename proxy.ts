import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16-д `middleware.ts` хуучирч `proxy.ts` болсон.
 * Энд зөвхөн session сэргээх ажлыг хийнэ — эрхийн шалгалтыг хуудас бүр
 * серверийн талдаа өөрөө хийнэ (lib/auth-server.ts).
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Статик файл, зураг, favicon-оос бусад бүх зам дээр ажиллана.
     * Эдгээрт session шинэчлэх шаардлагагүй тул хассан нь хурдыг нэмнэ.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
