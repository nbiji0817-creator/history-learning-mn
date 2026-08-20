import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/page";
import { ProfileForm } from "@/components/auth/profile-form";

export const metadata: Metadata = {
  title: "Миний профайл",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        eyebrow="Хэрэглэгч"
        title="Миний профайл"
        icon="👤"
        description="Нэр, анги, аватараа өөрчилж, нууц үгээ шинэчилнэ."
      />

      <Container className="py-10">
        <div className="mx-auto max-w-2xl">
          <ProfileForm />
        </div>
      </Container>
    </>
  );
}
