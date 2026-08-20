import { redirect } from "next/navigation";

/** Хуучин зам — шинэ бүтэц рүү шилжүүлнэ. */
export default function LegacyLessonViewPage() {
  redirect("/grades/6");
}
