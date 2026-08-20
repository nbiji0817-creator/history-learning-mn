import Link from "next/link";
import { Container } from "@/components/ui/page";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-7xl" aria-hidden>
        🏺
      </p>
      <h1 className="mt-6 text-3xl font-black">Хуудас олдсонгүй</h1>
      <p className="mx-auto mt-4 max-w-md leading-7 text-fg-muted">
        Хайж буй хуудас байхгүй эсвэл нүүсэн байна. Доорх холбоосуудаас
        үргэлжлүүлээрэй.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-[#1c1a17]"
        >
          Нүүр хуудас
        </Link>
        <Link
          href="/grades"
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
        >
          Хичээлүүд
        </Link>
        <Link
          href="/search"
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
        >
          Хайлт
        </Link>
      </div>
    </Container>
  );
}
