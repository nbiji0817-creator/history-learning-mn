import Link from "next/link";
import { Container } from "@/components/ui/page";

const columns = [
  {
    title: "Суралцах",
    links: [
      { href: "/grades", label: "6–12-р ангийн хичээл" },
      { href: "/timeline", label: "Он цагийн хэлхээс" },
      { href: "/people", label: "Түүхэн хүмүүс" },
      { href: "/events", label: "Түүхэн үйл явдал" },
      { href: "/sources", label: "Эх сурвалж" },
      { href: "/dictionary", label: "Тайлбар толь" },
    ],
  },
  {
    title: "Дадлага",
    links: [
      { href: "/games", label: "Түүхийн тоглоом" },
      { href: "/exams", label: "Шалгалтын бэлтгэл" },
      { href: "/ai", label: "AI түүхийн багш" },
      { href: "/dashboard", label: "Миний ахиц" },
    ],
  },
  {
    title: "Бусад",
    links: [
      { href: "/feedback", label: "Санал хүсэлт" },
      { href: "/parent", label: "Эцэг эхийн хэсэг" },
      { href: "/admin", label: "Багш / Админ" },
      { href: "/search", label: "Хайлт" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-line bg-surface/60">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-xl"
                aria-hidden
              >
                🏛️
              </span>
              <span className="text-sm font-black tracking-tight">ТҮҮХЭЭ МЭДЬЕ</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-fg-muted">
              6–12-р ангийн сурагч, багш, эцэг эхэд зориулсан Монгол хэл дээрх
              интерактив түүхийн сургалтын нэгдсэн систем.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-muted transition hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-fg-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Түүхээ мэдье. Боловсролын зориулалттай.</p>
          <p>
            Гуравдагч талын материалыг эх сурвалжийн холбоосоор дамжуулан
            ашиглана.
          </p>
        </div>
      </Container>
    </footer>
  );
}
