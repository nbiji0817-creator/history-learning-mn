import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * ТЭРГҮҮЛЭГЧДИЙН САМБАР
 *
 * `public.leaderboard` нь SECURITY DEFINER харагдац — тоглоом тус бүрийн
 * хамгийн өндөр оноог нэр, аватартай нь буцаана. RLS-ийг тойрч гарахгүй:
 * харагдац нь зөвхөн нэр, аватар, оноог л гаргадаг тул хэн ямар хичээл
 * үзсэн, ямар дүн авсан зэрэг хувийн мэдээлэл ил гарахгүй.
 *
 * Хүснэгт бэлэн биш эсвэл өгөгдөл байхгүй бол хоосон буцаана — энэ нь
 * бодит хариу («хэн ч тоглоогүй байна»), алдаа биш.
 */

export interface LeaderboardRow {
  gameSlug: string;
  name: string;
  avatar: string;
  bestScore: number;
}

export async function getLeaderboard(
  gameSlug?: string,
): Promise<LeaderboardRow[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("leaderboard")
      .select("game_slug, name, avatar, best_score")
      .order("best_score", { ascending: false })
      .limit(100);

    if (gameSlug) query = query.eq("game_slug", gameSlug);

    const { data, error } = await query;
    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map((row) => ({
      gameSlug: String(row.game_slug ?? ""),
      name: String(row.name ?? "Нэргүй"),
      avatar: String(row.avatar ?? "🧑‍🎓"),
      bestScore: Number(row.best_score ?? 0),
    }));
  } catch {
    return [];
  }
}
