import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/page";
import { AiTutor } from "@/components/ai/ai-tutor";

export const metadata: Metadata = {
  title: "AI түүхийн багш",
  description:
    "Түүхийн асуултаа асуу, сэдвээ тайлбарлуул, өөрийгөө шалгуул, түүхэн хүнтэй ярилц — системийн баталгаатай агуулгад тулгуурласан AI багш.",
};

export default async function AiPage({ searchParams }: PageProps<"/ai">) {
  const params = await searchParams;
  const raw = params.q;
  const initialQuestion = Array.isArray(raw) ? raw[0] : raw;

  return (
    <>
      <PageHeader
        eyebrow="AI"
        title="AI түүхийн багш"
        icon="🤖"
        description="Хариулт нь системийн хичээл, түүхэн хүн, үйл явдал, эх сурвалжийн санд тулгуурлана. AI дур мэдэн түүх зохиохгүй."
      />

      <Container className="py-10">
        <AiTutor initialQuestion={initialQuestion} />

        <p className="mt-8 rounded-2xl border border-line bg-muted/40 p-5 text-sm leading-7 text-fg-muted">
          <b>Анхаарах зүйл:</b> AI бол багшийг орлох биш, туслах хэрэгсэл юм.
          Шалгалт, гэрийн даалгаварт ашиглахдаа хариултыг хичээлийн материалтай
          заавал тулгаж шалгаарай. Түүхэн маргаантай асуудалд өөр өөр судлаачид
          өөр өөр дүгнэлт хийдгийг санаарай.
        </p>
      </Container>
    </>
  );
}
