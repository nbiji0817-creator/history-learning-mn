import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/page";
import { ResetPasswordForm } from "@/components/auth/reset-password";

export const metadata: Metadata = {
  title: "Нууц үг сэргээх",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <>
      <PageHeader
        eyebrow="Нууц үг"
        title="Шинэ нууц үг тогтоох"
        icon="🔐"
        description="Имэйл дэх холбоосоор орж ирсэн бол шинэ нууц үгээ энд тогтооно уу."
      />

      <Container className="py-10">
        <div className="mx-auto max-w-lg">
          <ResetPasswordForm />
        </div>
      </Container>
    </>
  );
}
