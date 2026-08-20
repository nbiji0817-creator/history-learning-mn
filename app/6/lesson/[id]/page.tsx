import { redirect } from "next/navigation";

/** Хуучин зам — шинэ бүтэц рүү шилжүүлнэ. */
export default function LegacyLessonPage() {
  redirect("/grades/6");
}
