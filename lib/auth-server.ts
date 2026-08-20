import "server-only";
import { redirect } from "next/navigation";
import type { GradeNumber, User, UserRole } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * СЕРВЕРИЙН ТАЛЫН ЭРХИЙН ШАЛГАЛТ
 *
 * Энэ файл дахь шалгалт нь ЖИНХЭНЭ хамгаалалт юм. Client дээрх `useAuth()`
 * нь зөвхөн юуг харуулахыг тохируулна — түүнийг браузерын консолоос
 * хуурч болно.
 *
 * Хамгаалалт гурван давхаргатай:
 *   1. proxy.ts       — session сэргээнэ
 *   2. энэ файл       — хуудсанд нэвтрэх эрхийг шалгана
 *   3. RLS (0002_rls) — өгөгдлийн сангийн түвшинд, эцсийн хамгаалалт
 *
 * Гурав дахь давхарга хамгийн чухал: хэн нэгэн UI-г тойрч API руу шууд
 * хандсан ч RLS түүнийг зогсооно.
 */

export interface CurrentUser {
  id: string;
  email: string;
  profile: User;
}

/**
 * Одоо нэвтэрсэн хэрэглэгчийг буцаана. Нэвтрээгүй бол `null`.
 *
 * `getUser()`-ыг ашиглаж байгаа нь санамсаргүй биш — энэ нь token-ыг
 * Supabase сервер дээр баталгаажуулдаг. `getSession()` нь cookie-г шууд
 * уншдаг тул эрхийн шалгалтад ХЭРЭГЛЭЖ БОЛОХГҮЙ.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    /* Профайл тригерээр үүсдэг. Ямар нэг шалтгаанаар үүсээгүй бол
       хамгийн бага эрхтэй гэж үзнэ. */
    return {
      id: user.id,
      email: user.email ?? "",
      profile: {
        id: user.id,
        name: profile?.name ?? user.email?.split("@")[0] ?? "Хэрэглэгч",
        email: user.email ?? "",
        role: (profile?.role as UserRole) ?? "student",
        grade: (profile?.grade as GradeNumber | null) ?? null,
        avatar: profile?.avatar ?? "🧑‍🎓",
        createdAt: profile?.created_at ?? "",
      },
    };
  } catch {
    return null;
  }
}

/** Нэвтрээгүй бол /login руу шилжүүлнэ. */
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  return user;
}

/** Шаардлагатай эрхгүй бол /login руу шилжүүлнэ. */
export async function requireRole(
  roles: UserRole[],
  returnTo: string,
): Promise<CurrentUser> {
  const user = await requireUser(returnTo);
  if (!roles.includes(user.profile.role)) {
    redirect(`/login?denied=1&next=${encodeURIComponent(returnTo)}`);
  }
  return user;
}

/** Эцэг эхийн холбогдсон хүүхдүүд. */
export async function getMyChildren(): Promise<User[]> {
  const user = await getCurrentUser();
  if (!user || user.profile.role !== "parent") return [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("parent_links")
      .select("student_id, confirmed, profiles!parent_links_student_id_fkey(*)")
      .eq("parent_id", user.id)
      .eq("confirmed", true);

    return (data ?? [])
      .map((row: Record<string, unknown>) => row.profiles as Record<string, unknown> | null)
      .filter((profile): profile is Record<string, unknown> => Boolean(profile))
      .map((profile) => ({
        id: String(profile.id),
        name: String(profile.name ?? ""),
        email: String(profile.email ?? ""),
        role: (profile.role as UserRole) ?? "student",
        grade: (profile.grade as GradeNumber | null) ?? null,
        avatar: String(profile.avatar ?? "🧑‍🎓"),
        createdAt: String(profile.created_at ?? ""),
      }));
  } catch {
    return [];
  }
}
