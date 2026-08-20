import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6", className)} {...props} />;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-line bg-surface/60 bg-parchment">
      <Container className="py-10 sm:py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-3 flex items-center gap-3 text-3xl font-black tracking-tight text-balance sm:text-4xl">
              {icon ? (
                <span className="text-4xl sm:text-5xl" aria-hidden>
                  {icon}
                </span>
              ) : null}
              {title}
            </h1>
            {description ? (
              <p className="mt-4 text-base leading-7 text-fg-muted">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </Container>
    </header>
  );
}

export function Section({
  title,
  description,
  action,
  children,
  className,
  id,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-10 sm:py-14", className)}>
      <Container>
        {title ? (
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
              {description ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-fg-muted">
                  {description}
                </p>
              ) : null}
            </div>
            {action}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
