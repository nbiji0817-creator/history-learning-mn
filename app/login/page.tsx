import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, PageHeader } from "@/components/ui/page";
import { AuthForm } from "@/components/auth/auth-form";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Нэвтрэх",
  description:
    "Сурагч, эцэг эх, багшийн эрхээр бүртгүүлж нэвтэрч, ахицаа хадгалаарай.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <>
      <PageHeader
        eyebrow="Нэвтрэх"
        title="Бүртгүүлэх ба нэвтрэх"
        icon="🔑"
        description="Нэвтэрснээр ахиц, оноо, амжилтын тэмдэг хадгалагдаж, бүх төхөөрөмж дээр синк хийгдэнэ."
      />

      <Container className="py-10">
        <div className="mx-auto max-w-lg">
          <Suspense
            fallback={
              <Card>
                <p className="text-sm text-fg-muted">Ачаалж байна…</p>
              </Card>
            }
          >
            <AuthForm />
          </Suspense>
        </div>
      </Container>
    </>
  );
}
