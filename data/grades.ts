import type { Grade, GradeNumber } from "@/types";

export const grades: Grade[] = [
  {
    grade: 6,
    title: "Эртний дэлхийн түүх",
    subtitle: "Түүхийн эхлэл ба анхны иргэншлүүд",
    description:
      "Түүх гэж юу вэ, эх сурвалжийг хэрхэн уншихаас эхлээд эртний хүмүүс, неолитын хувьсгал, анхны иргэншлүүд болон Монгол нутаг дахь эртний улсуудыг судална.",
    icon: "🏺",
    accent: "from-amber-500 to-orange-600",
  },
  {
    grade: 7,
    title: "Дундад зууны түүх",
    subtitle: "Түрэгээс Их Монгол улс хүртэл",
    description:
      "Түрэг, Уйгур, Кидан улсууд, монгол аймгуудын нэгдэл, Чингис хааны үе болон Монголын эзэнт гүрний байгуулалтыг дэлхийн дундад зууны түүхтэй зэрэгцүүлэн үзнэ.",
    icon: "🏰",
    accent: "from-orange-500 to-red-600",
  },
  {
    grade: 8,
    title: "Эзэнт гүрний дараах үе",
    subtitle: "Юань улс, ханлигууд, Сэргэн мандалт",
    description:
      "Юань улс, монголын ханлигууд, тэдгээрийн задрал, зэрэгцээд Европын Сэргэн мандалт, газар нутгийн нээлт, шинжлэх ухааны хувьсгалыг харьцуулан судална.",
    icon: "⚔️",
    accent: "from-red-500 to-rose-600",
  },
  {
    grade: 9,
    title: "Шинэ үеийн түүх",
    subtitle: "XIX–XX зууны Монгол ба дэлхий",
    description:
      "Манжийн эрхшээл, 1911 оны Үндэсний эрх чөлөөний хувьсгал, 1921 оны Ардын хувьсгал болон дэлхийн шинэ үеийн үйл явдлуудыг судалж, шалгалтад бэлтгэнэ.",
    icon: "📜",
    accent: "from-rose-500 to-purple-600",
    focus: "9-р ангийн шалгалтын бэлтгэл",
  },
  {
    grade: 10,
    title: "Орчин үеийн түүх",
    subtitle: "XX зууны Монгол ба дэлхий",
    description:
      "Дэлхийн хоёр дайн, социализмын үе, хүйтэн дайн, Монголын хөгжлийн замнал болон 1990 оны ардчилсан хувьсгалыг судална.",
    icon: "🌍",
    accent: "from-purple-500 to-indigo-600",
  },
  {
    grade: 11,
    title: "Гүнзгийрүүлсэн түүх",
    subtitle: "Улс төр, эдийн засаг, нийгэм, соёл",
    description:
      "Түүхийг сэдэвчилсэн байдлаар — улс төрийн тогтолцоо, эдийн засаг, нийгмийн бүтэц, соёл, дипломат харилцааны өнцгөөс гүнзгийрүүлэн шинжилнэ.",
    icon: "🏛️",
    accent: "from-indigo-500 to-sky-600",
  },
  {
    grade: 12,
    title: "Шалгалтын жил",
    subtitle: "Улсын болон элсэлтийн шалгалт",
    description:
      "Монголын тусгаар тогтнол, орчин үеийн хөгжил, дэлхийн геополитикийг давтаж, ЭЕШ болон улсын шалгалтад бүрэн бэлтгэнэ.",
    icon: "🎓",
    accent: "from-sky-500 to-emerald-600",
    focus: "ЭЕШ ба улсын шалгалтын бэлтгэл",
  },
];

export const gradeMap = new Map<GradeNumber, Grade>(
  grades.map((item) => [item.grade, item]),
);

export const gradeNumbers: GradeNumber[] = grades.map((item) => item.grade);

export function isGradeNumber(value: unknown): value is GradeNumber {
  return (
    typeof value === "number" && gradeNumbers.includes(value as GradeNumber)
  );
}

export function parseGrade(value: string): GradeNumber | null {
  const parsed = Number(value);
  return isGradeNumber(parsed) ? parsed : null;
}
