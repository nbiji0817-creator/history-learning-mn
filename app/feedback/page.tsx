import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/page";
import { FeedbackForm } from "@/components/feedback/feedback-form";

export const metadata: Metadata = {
  title: "Санал хүсэлт",
  description:
    "Системийг сайжруулах санал хүсэлтээ илгээнэ үү. Сурагч болон эцэг эх санал бичих боломжтой.",
};

export default function FeedbackPage() {
  return (
    <>
      <PageHeader
        eyebrow="Санал хүсэлт"
        title="Саналаа бидэнд хэлээрэй"
        icon="💬"
        description="Ямар хичээл, тоглоом, боломж нэмэхийг хүсэж байна вэ? Алдаа олсон уу? Бидэнд бичээрэй."
      />

      <Container className="py-10">
        <div className="mx-auto max-w-2xl">
          <FeedbackForm />
        </div>
      </Container>
    </>
  );
}
