import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/page";
import { LoginPanel } from "@/components/auth/login-panel";

export const metadata: Metadata = {
  title: "Нэвтрэх",
  description: "Демо эрхээр нэвтэрч системийн бүх боломжийг туршиж үзнэ үү.",
};

export default function LoginPage() {
  return (
    <>
      <PageHeader
        eyebrow="Нэвтрэх"
        title="Демо эрхээр нэвтрэх"
        icon="🔑"
        description="Энэ бол демо хувилбар. Нууц үг шаардлагагүй бөгөөд мэдээлэл зөвхөн таны браузерт хадгалагдана."
      />

      <Container className="py-10">
        <div className="mx-auto max-w-2xl">
          <LoginPanel />
        </div>
      </Container>
    </>
  );
}
