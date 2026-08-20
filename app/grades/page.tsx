import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui/page";
import { CardLink } from "@/components/ui/primitives";
import { getGrades, getLessonsByGrade } from "@/lib/repo";

export const metadata: Metadata = {
  title: "6–12-р ангийн түүхийн хичээл",
  description:
    "6, 7, 8, 9, 10, 11, 12-р ангийн түүхийн хичээлүүд — эртний дэлхийн түүхээс орчин үеийн Монгол хүртэл.",
};

export default async function GradesPage() {
  const grades = await getGrades();
  const counts = await Promise.all(
    grades.map(async (grade) => (await getLessonsByGrade(grade.grade)).length),
  );

  return (
    <>
      <PageHeader
        eyebrow="Хичээл"
        title="Ангиа сонгоно уу"
        icon="📚"
        description="Анги бүр хичээл, тест, тоглоом, шалгалтын бэлтгэлтэй. Дарааллаар нь үзвэл он цагийн логик тодорхой болно."
      />

      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {grades.map((grade, index) => (
            <CardLink key={grade.grade} href={`/grades/${grade.grade}`}>
              <div className="flex items-start justify-between">
                <span className="text-5xl" aria-hidden>
                  {grade.icon}
                </span>
                <span
                  className={`rounded-full bg-gradient-to-r ${grade.accent} px-3 py-1 text-xs font-black text-white`}
                >
                  {grade.grade}-р анги
                </span>
              </div>

              <h2 className="mt-6 text-xl font-black group-hover:text-gold">
                {grade.title}
              </h2>

              <p className="mt-1 text-sm font-medium text-gold">{grade.subtitle}</p>

              <p className="mt-3 text-sm leading-6 text-fg-muted">
                {grade.description}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
                <span className="text-fg-muted">{counts[index]} хичээл</span>
                <span className="font-bold text-gold">Үзэх →</span>
              </div>

              {grade.focus ? (
                <p className="mt-3 rounded-lg bg-clay/10 px-3 py-2 text-xs font-bold text-clay">
                  ⭐ {grade.focus}
                </p>
              ) : null}
            </CardLink>
          ))}
        </div>
      </Section>
    </>
  );
}
