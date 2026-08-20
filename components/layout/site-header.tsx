"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bot,
  BookOpen,
  Gamepad2,
  GraduationCap,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  User as UserIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { roleLabels, useAuth } from "@/lib/auth";
import { Container } from "@/components/ui/page";

const navigation = [
  { href: "/grades", label: "Хичээл", icon: BookOpen },
  { href: "/timeline", label: "Он цаг", icon: GraduationCap },
  { href: "/people", label: "Түүхэн хүмүүс", icon: UserIcon },
  { href: "/games", label: "Тоглоом", icon: Gamepad2 },
  { href: "/exams", label: "Шалгалт", icon: GraduationCap },
  { href: "/ai", label: "AI багш", icon: Bot },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { resolved, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-xl"
            aria-hidden
          >
            🏛️
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-black leading-tight tracking-tight">
              ТҮҮХЭЭ МЭДЬЕ
            </span>
            <span className="block text-[11px] text-fg-muted">
              6–12-р ангийн түүхийн систем
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Үндсэн цэс">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive(item.href)
                  ? "bg-muted text-gold"
                  : "text-fg-muted hover:bg-muted hover:text-fg",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="rounded-lg p-2 text-fg-muted transition hover:bg-muted hover:text-fg"
            aria-label="Хайх"
          >
            <Search className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
            className="rounded-lg p-2 text-fg-muted transition hover:bg-muted hover:text-fg"
            aria-label={
              resolved === "dark" ? "Гэрэл горимд шилжих" : "Бараан горимд шилжих"
            }
          >
            {resolved === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href={user.role === "parent" ? "/parent" : "/dashboard"}
                className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold transition hover:bg-muted"
              >
                <span aria-hidden>{user.avatar}</span>
                <span className="hidden md:inline">{roleLabels[user.role]}</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg p-2 text-fg-muted transition hover:bg-muted hover:text-fg"
                aria-label="Гарах"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-lg bg-gold px-4 py-2 text-sm font-bold text-[#1c1a17] transition hover:bg-gold-strong sm:block"
            >
              Нэвтрэх
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg p-2 text-fg-muted transition hover:bg-muted hover:text-fg lg:hidden"
            aria-label="Цэс"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {open ? (
        <div className="border-t border-line bg-surface lg:hidden">
          <Container className="grid gap-1 py-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium",
                  isActive(item.href) ? "bg-muted text-gold" : "text-fg-muted",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/dictionary"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-fg-muted"
            >
              📖 Тайлбар толь
            </Link>
            <Link
              href="/sources"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-fg-muted"
            >
              📜 Эх сурвалж
            </Link>
            {!user ? (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-lg bg-gold px-4 py-3 text-center text-sm font-bold text-[#1c1a17]"
              >
                Нэвтрэх
              </Link>
            ) : null}
          </Container>
        </div>
      ) : null}
    </header>
  );
}
