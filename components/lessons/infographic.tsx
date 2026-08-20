import type { Infographic } from "@/types";

/** Хичээлийн инфографик — 4 төрөл: stats, compare, flow, pyramid. */
export function InfographicBlock({ data }: { data: Infographic }) {
  return (
    <figure>
      {data.kind === "stats" ? <StatsGrid data={data} /> : null}
      {data.kind === "compare" ? <CompareBlock data={data} /> : null}
      {data.kind === "flow" ? <FlowBlock data={data} /> : null}
      {data.kind === "pyramid" ? <PyramidBlock data={data} /> : null}

      {data.caption ? (
        <figcaption className="mt-4 text-sm italic text-fg-muted">
          {data.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function StatsGrid({ data }: { data: Infographic }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.stats?.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-line bg-muted/50 p-5"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-gold">
            {stat.label}
          </div>
          <div className="mt-2 text-xl font-black leading-tight">{stat.value}</div>
          {stat.hint ? (
            <div className="mt-2 text-xs leading-5 text-fg-muted">{stat.hint}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function CompareBlock({ data }: { data: Infographic }) {
  if (!data.compare) return null;
  const sides = [
    { ...data.compare.left, accent: "border-gold/40" },
    { ...data.compare.right, accent: "border-clay/40" },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {sides.map((side) => (
        <div
          key={side.title}
          className={`rounded-2xl border-2 ${side.accent} bg-muted/40 p-6`}
        >
          <h4 className="text-base font-black">{side.title}</h4>
          <ul className="mt-4 space-y-2.5">
            {side.items.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-6">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function FlowBlock({ data }: { data: Infographic }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.steps?.map((step, index) => (
        <li
          key={step.title}
          className="relative rounded-2xl border border-line bg-muted/50 p-5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-sm font-black text-[#1c1a17]">
            {index + 1}
          </div>
          <h4 className="mt-3 font-bold leading-tight">{step.title}</h4>
          <p className="mt-2 text-sm leading-6 text-fg-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

function PyramidBlock({ data }: { data: Infographic }) {
  const steps = data.steps ?? [];
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const width = 55 + (index / Math.max(1, steps.length - 1)) * 45;
        return (
          <div
            key={step.title}
            className="mx-auto rounded-2xl border border-line bg-muted/50 p-4 text-center"
            style={{ width: `${width}%`, minWidth: "220px" }}
          >
            <h4 className="font-bold">{step.title}</h4>
            <p className="mt-1 text-sm text-fg-muted">{step.body}</p>
          </div>
        );
      })}
    </div>
  );
}
