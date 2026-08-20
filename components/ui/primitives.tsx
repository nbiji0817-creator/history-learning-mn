import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────  Button  ───────────────────────── */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-[#1c1a17] hover:bg-gold-strong shadow-sm shadow-black/10",
  secondary:
    "border border-line bg-surface text-fg hover:bg-muted",
  ghost: "text-fg hover:bg-muted",
  danger: "bg-clay text-white hover:opacity-90",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <Link
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  );
}

/* ─────────────────────────  Card  ───────────────────────── */

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface p-6 shadow-sm shadow-black/5",
        className,
      )}
      {...props}
    />
  );
}

export function CardLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "group block rounded-2xl border border-line bg-surface p-6 shadow-sm shadow-black/5 transition",
        "hover:-translate-y-1 hover:border-gold/60 hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

/* ─────────────────────────  Badge / Chip  ───────────────────────── */

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        "bg-muted text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

/* ─────────────────────────  Progress  ───────────────────────── */

export function ProgressBar({
  value,
  max = 100,
  label,
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-fg-muted">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Ахиц"}
      >
        <div
          className="h-full rounded-full bg-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────  Stat  ───────────────────────── */

export function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      {icon ? <div className="mb-2 text-2xl">{icon}</div> : null}
      <div className="text-2xl font-black text-fg">{value}</div>
      <div className="mt-1 text-sm font-medium text-fg-muted">{label}</div>
      {hint ? <div className="mt-1 text-xs text-fg-muted/80">{hint}</div> : null}
    </div>
  );
}

/* ─────────────────────────  Empty / Loading  ───────────────────────── */

export function EmptyState({
  icon = "🗂️",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface/50 p-12 text-center">
      <div className="text-5xl" aria-hidden>
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold text-fg">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-muted", className)} aria-hidden />
  );
}
