import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui/page";
import { GlossaryExplorer } from "@/components/dictionary/glossary-explorer";
import { getGlossary } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Түүхийн тайлбар толь",
  description:
    "Түүх, эх сурвалж, иргэншил, хаган, мянгат, өртөө, тусгаар тогтнол зэрэг түүхийн нэр томьёоны тайлбар.",
};

export default async function DictionaryPage() {
  const terms = await getGlossary();

  return (
    <>
      <PageHeader
        eyebrow="Тайлбар толь"
        title="Түүхийн нэр томьёо"
        icon="📖"
        description="Хичээл дээр тааралдсан үгээ шууд хайж олоорой. Нэр томьёог ойлгосон бол текст ойлгоход хялбар болно."
      />

      <Section>
        <GlossaryExplorer terms={terms} />
      </Section>
    </>
  );
}
