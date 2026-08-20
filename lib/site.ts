/**
 * Сайтын үндсэн хаягийг найдвартай тодорхойлно.
 *
 * ЯАГААД ТУСДАА ФУНКЦ ВЭ?
 * `process.env.X ?? "fallback"` нь зөвхөн `undefined`/`null`-д ажилладаг.
 * Vercel дээр орчны хувьсагчийг **хоосон утгатай** үүсгэсэн тохиолдолд
 * `""` буцаж ирдэг бөгөөд `??` түүнийг барьдаггүй. Үр дүнд нь
 * `new URL("")` → `TypeError: Invalid URL` гарч build бүтэлгүйтдэг.
 *
 * Иймд энд:
 *   1. хоосон/зайтай утгыг «байхгүй» гэж үзнэ
 *   2. хаяг бодитой эсэхийг `new URL`-ээр шалгана
 *   3. Vercel-ийн автомат домэйн руу унана
 *   4. эцэст нь localhost
 */

const FALLBACK = "http://localhost:3000";

function normalize(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    // Төгсгөлийн ташуу зураасыг авч хаяна (metadataBase-д давхар зураас гарахгүй)
    return url.origin;
  } catch {
    return null;
  }
}

export function getSiteUrl(): string {
  return (
    normalize(process.env.NEXT_PUBLIC_SITE_URL) ??
    // Vercel бүх deployment-д автоматаар өгдөг (протоколгүй домэйн)
    normalize(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalize(process.env.VERCEL_URL) ??
    FALLBACK
  );
}
