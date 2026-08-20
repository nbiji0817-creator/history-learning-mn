import { redirect } from "next/navigation";

/**
 * `/lessons` нь өөрөө жагсаалтын хуудасгүй — хичээл нь ангиар
 * бүлэглэгддэг. Гараар бичиж ирсэн хүнийг 404 руу оруулахгүй,
 * ангиудын жагсаалт руу шилжүүлнэ.
 */
export default function LessonsIndexPage() {
  redirect("/grades");
}
