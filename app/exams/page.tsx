import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui/page";
import { CardLink } from "@/components/ui/primitives";
import { getExams } from "@/lib/repo";
import { examKindLabels } from "@/data/exams";
import { difficultyLabels, difficultyStyles } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Шалгалтын бэлтгэл",
  description:
    "9-р ангийн шалгалт, ЭЕШ, улсын шалгалт болон төрийн албан хаагчийн түүхийн шалгалтын бэлтгэл — хугацаатай симуляц, автомат үнэлгээ, дэлгэрэнгүй тайлбар.",
};

export default async function ExamsPage() {
  const exams = await getExams();

  const grouped = exams.reduce<Record<string, typeof exams>>((acc, exam) => {
    acc[exam.kind] = [...(acc[exam.kind] ?? []), exam];
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow="Шалгалт"
        title="Шалгалтын бэлтгэл"
        icon="📝"
        description="Шалгалт бүр автоматаар үнэлэгдэж, сул сэдвийг чинь тодорхойлж, юуг давтахыг зөвлөнө."
      />

      <Section>
        <div className="space-y-12">
          {Object.entries(grouped).map(([kind, items]) => (
            <div key={kind}>
              <h2 className="text-xl font-black">{examKindLabels[kind] ?? kind}</h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((exam) => (
                  <CardLink key={exam.slug} href={`/exams/${exam.slug}`}>
                    <div className="flex items-start justify-between">
                      <span className="text-4xl" aria-hidden>
                        {exam.icon}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${difficultyStyles[exam.difficulty]}`}
                      >
                        {difficultyLabels[exam.difficulty]}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-bold leading-tight group-hover:text-gold">
                      {exam.title}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-gold">
                      {exam.subtitle}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-fg-muted">
                      {exam.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs text-fg-muted">
                      <span>📋 {exam.questionCount} асуулт</span>
                      <span>
                        ⏱ {exam.duration > 0 ? `${exam.duration} мин` : "хязгааргүй"}
                      </span>
                    </div>
                  </CardLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
