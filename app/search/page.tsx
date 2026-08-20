import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/page";
import { SearchPanel } from "@/components/search/search-panel";

export const metadata: Metadata = {
  title: "Хайлт",
  description:
    "Хичээл, түүхэн хүн, үйл явдал, эх сурвалж, нэр томьёо, тоглоом, шалгалтаас нэгдсэн хайлт хийх.",
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const raw = params.q;
  const initial = Array.isArray(raw) ? raw[0] : (raw ?? "");

  return (
    <>
      <PageHeader
        eyebrow="Хайлт"
        title="Нэгдсэн хайлт"
        icon="🔍"
        description="«Чингис хаан», «1206», «Хүннү» гэх мэтээр хайхад бүх холбогдох материал гарна."
      />

      <Container className="py-10">
        <div className="mx-auto max-w-3xl">
          <SearchPanel initialQuery={initial} />
        </div>
      </Container>
    </>
  );
}
