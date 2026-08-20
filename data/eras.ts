import type { Era, EraKey } from "@/types";

export const eras: Era[] = [
  {
    key: "ancient",
    label: "Эрт үе",
    range: "МЭӨ 3000 – МЭ 476",
    color: "amber",
  },
  {
    key: "medieval",
    label: "Дундад үе",
    range: "476 – 1500",
    color: "orange",
  },
  {
    key: "modern",
    label: "Шинэ үе",
    range: "1500 – 1918",
    color: "sky",
  },
  {
    key: "contemporary",
    label: "Орчин үе",
    range: "1918 – өнөөг хүртэл",
    color: "emerald",
  },
];

export const eraMap: Record<EraKey, Era> = Object.fromEntries(
  eras.map((era) => [era.key, era]),
) as Record<EraKey, Era>;

/** Эрин үеийн өнгөний Tailwind ангиуд (JIT-д бүрэн бичигдсэн байх ёстой). */
export const eraStyles: Record<EraKey, { chip: string; dot: string; ring: string }> = {
  ancient: {
    chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    ring: "ring-amber-500/40",
  },
  medieval: {
    chip: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
    ring: "ring-orange-500/40",
  },
  modern: {
    chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
    ring: "ring-sky-500/40",
  },
  contemporary: {
    chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/40",
  },
};
