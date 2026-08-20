import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui/page";
import { Card } from "@/components/ui/primitives";
import { getSources } from "@/lib/repo";
import { sourceKindLabels } from "@/data/sources";

export const metadata: Metadata = {
  title: "Түүхийн эх сурвалж",
  description:
    "Монголын нууц товчоо, Орхоны бичээс, археологийн олдвор, баримт бичиг зэрэг түүхийн эх сурвалжийг уншиж, шинжлэх дадлага.",
};

export default async function SourcesPage() {
  const sources = await getSources();

  const grouped = sources.reduce<Record<string, typeof sources>>((acc, source) => {
    acc[source.kind] = [...(acc[source.kind] ?? []), source];
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow="Эх сурвалж"
        title="Түүхийн эх сурвалж"
        icon="📜"
        description="Түүхч хүн эх сурвалжгүйгээр юу ч бичиж чадахгүй. Эх сурвалж бүрийг уншаад, доорх шинжилгээний асуултад өөрөө хариулж үзээрэй."
      />

      <Section>
        <Card className="bg-gold/10">
          <h2 className="text-sm font-black uppercase tracking-wider text-gold">
            Эх сурвалжид тавих 4 асуулт
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { q: "Хэн?", a: "Хэн бүтээсэн бэ? Нүдээр үзсэн үү?" },
              { q: "Хэзээ?", a: "Үйл явдлаас хэр зайтай вэ?" },
              { q: "Яагаад?", a: "Ямар зорилготой байсан бэ?" },
              { q: "Хэнд?", a: "Хэнд зориулж бүтээсэн бэ?" },
            ].map((item) => (
              <div key={item.q} className="rounded-xl bg-surface/70 p-4">
                <p className="font-black text-gold">{item.q}</p>
                <p className="mt-1 text-sm leading-6 text-fg-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-10 space-y-12">
          {Object.entries(grouped).map(([kind, items]) => (
            <div key={kind}>
              <h2 className="flex items-center gap-3 text-xl font-black">
                <span aria-hidden>{sourceKindLabels[kind as keyof typeof sourceKindLabels].icon}</span>
                {sourceKindLabels[kind as keyof typeof sourceKindLabels].label}
              </h2>

              <div className="mt-5 space-y-5">
                {items.map((source) => (
                  <article
                    key={source.id}
                    id={source.id}
                    className="scroll-mt-24 rounded-2xl border border-line bg-surface p-6"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold">{source.title}</h3>
                      <span className="font-mono text-xs text-gold">{source.year}</span>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-fg-muted">
                        {source.origin}
                      </span>
                    </div>

                    <p className="mt-4 border-l-4 border-gold/40 pl-4 text-sm italic leading-7 text-fg-muted">
                      {source.excerpt}
                    </p>

                    <div className="mt-5 rounded-xl bg-muted/50 p-4">
                      <p className="text-sm font-bold text-gold">
                        ❓ {source.analysisQuestion}
                      </p>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-semibold">
                          Тайлбар харах
                        </summary>
                        <p className="mt-3 text-sm leading-7 text-fg-muted">
                          {source.guidance}
                        </p>
                      </details>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {source.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-fg-muted"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
