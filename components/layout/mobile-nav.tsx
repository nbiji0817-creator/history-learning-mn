"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, BookOpen, Gamepad2, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Нүүр", icon: Home },
  { href: "/grades", label: "Хичээл", icon: BookOpen },
  { href: "/games", label: "Тоглоом", icon: Gamepad2 },
  { href: "/ai", label: "AI", icon: Bot },
  { href: "/dashboard", label: "Профайл", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 backdrop-blur md:hidden"
      aria-label="Доод цэс"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition",
                  active ? "text-gold" : "text-fg-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
