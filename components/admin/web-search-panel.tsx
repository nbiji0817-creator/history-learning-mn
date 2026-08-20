import { Card } from "@/components/ui/primitives";

/**
 * ВЭБ ХАЙЛТЫН ТӨЛӨВ
 *
 * Сурах бичигт байхгүй асуултад AI интернэтээс хайдаг. Википедиа нь
 * түлхүүр шаардахгүй тул энэ боломж ҮРГЭЛЖ идэвхтэй — админ юу ч
 * тохируулахгүйгээр ажиллана.
 *
 * Brave эсвэл Google нэмбэл хайлтын хүрээ Википедиагаас гадагш тэлнэ.
 */
export function WebSearchPanel({ provider }: { provider: string }) {
  const labels: Record<string, string> = {
    wikipedia: "Википедиа (үндсэн, түлхүүр шаардахгүй)",
    brave: "Brave Search",
    google: "Google Custom Search",
  };

  const upgraded = provider !== "wikipedia";

  return (
    <Card>
      <h3 className="text-sm font-black">🌐 Вэб хайлт</h3>
      <p className="mt-2 text-sm leading-7 text-fg-muted">
        Сурагчийн асуулт манай хичээлийн санд олдоогүй үед AI интернэтээс
        хайж, олсон эх сурвалжаа зааж хариулна. Хариулт бүрд «энэ нь сурах
        бичгээс биш» гэсэн сануулга харагдана.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          ✓ Идэвхтэй
        </span>
        <span className="text-sm text-fg-muted">
          Эх сурвалж: <b>{labels[provider] ?? provider}</b>
        </span>
      </div>

      {!upgraded ? (
        <p className="mt-4 rounded-xl bg-muted/60 p-4 text-sm leading-7 text-fg-muted">
          <b>Хүрээг тэлэх (заавал биш):</b> Vercel → Environment Variables
          хэсэгт{" "}
          <code className="rounded bg-surface px-1.5 py-0.5">
            BRAVE_SEARCH_API_KEY
          </code>{" "}
          нэмбэл Википедиагаас гадна бүх вэбээс хайна. Brave сард 2000 хайлт
          үнэгүй. Google хэрэглэх бол{" "}
          <code className="rounded bg-surface px-1.5 py-0.5">
            GOOGLE_SEARCH_API_KEY
          </code>{" "}
          болон{" "}
          <code className="rounded bg-surface px-1.5 py-0.5">
            GOOGLE_SEARCH_CX
          </code>{" "}
          хоёуланг нь нэмнэ.
        </p>
      ) : null}
    </Card>
  );
}
