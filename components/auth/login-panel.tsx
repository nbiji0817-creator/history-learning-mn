"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { roleLabels, useAuth } from "@/lib/auth";

const options: {
  role: Exclude<UserRole, "guest">;
  icon: string;
  description: string;
  href: string;
}[] = [
  {
    role: "student",
    icon: "🧑‍🎓",
    description: "Хичээл үзэх, тест өгөх, тоглох, ахицаа харах",
    href: "/dashboard",
  },
  {
    role: "parent",
    icon: "👪",
    description: "Хүүхдийн ахиц, оноог харах, санал хүсэлт бичих",
    href: "/parent",
  },
  {
    role: "teacher",
    icon: "👩‍🏫",
    description: "Агуулга, статистик, санал хүсэлтийг харах",
    href: "/admin",
  },
  {
    role: "admin",
    icon: "🛡️",
    description: "Системийн бүх удирдлага",
    href: "/admin",
  },
];

export function LoginPanel() {
  const { user, signInAs, signOut } = useAuth();
  const router = useRouter();

  if (user) {
    return (
      <Card className="text-center">
        <div className="text-5xl" aria-hidden>
          {user.avatar}
        </div>
        <h2 className="mt-4 text-xl font-black">{user.name}</h2>
        <p className="mt-1 text-sm text-fg-muted">
          {roleLabels[user.role]}
          {user.grade ? ` • ${user.grade}-р анги` : ""}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={user.role === "parent" ? "/parent" : user.role === "student" ? "/dashboard" : "/admin"}
            className="inline-flex items-center rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-[#1c1a17]"
          >
            Хэсэг рүү орох
          </Link>
          <Button variant="secondary" onClick={signOut}>
            Гарах
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.role}
            type="button"
            onClick={() => {
              signInAs(option.role);
              router.push(option.href);
            }}
            className="rounded-2xl border border-line bg-surface p-6 text-left transition hover:-translate-y-1 hover:border-gold/60"
          >
            <span className="text-4xl" aria-hidden>
              {option.icon}
            </span>
            <span className="mt-4 block text-lg font-black">
              {roleLabels[option.role]}
            </span>
            <span className="mt-2 block text-sm leading-6 text-fg-muted">
              {option.description}
            </span>
          </button>
        ))}
      </div>

      <Card className="bg-muted/40">
        <h2 className="text-sm font-black">🔒 Production дээр яаж ажиллах вэ?</h2>
        <p className="mt-3 text-sm leading-7 text-fg-muted">
          Энэ демо нэвтрэлт нь зөвхөн UI-г үзүүлэх зорилготой — нууц үг шалгахгүй.
          Бодит хувилбарт Supabase Auth (имэйл/нууц үг эсвэл magic link) ашиглаж,
          эрхийн шалгалтыг серверийн тал дээр Row Level Security-ээр хийнэ.
          Сурагч бусад сурагчийн мэдээллийг, эцэг эх зөвхөн өөрийн хүүхдийн
          мэдээллийг харна.
        </p>
        <p className="mt-3 text-sm leading-7 text-fg-muted">
          Дэлгэрэнгүйг <code className="rounded bg-surface px-1.5 py-0.5">supabase/migrations/0002_rls.sql</code>{" "}
          файлаас үзнэ үү.
        </p>
      </Card>
    </div>
  );
}
