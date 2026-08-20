"use client";

import Link from "next/link";
import { useState } from "react";
import type { Simulation, SimulationChoice } from "@/types";
import { Button, Card, ProgressBar } from "@/components/ui/primitives";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

interface Stats {
  economy: number;
  army: number;
  reputation: number;
  people: number;
}

const initialStats: Stats = {
  economy: 50,
  army: 50,
  reputation: 50,
  people: 50,
};

const statMeta: { key: keyof Stats; label: string; icon: string }[] = [
  { key: "economy", label: "Эдийн засаг", icon: "💰" },
  { key: "army", label: "Цэрэг", icon: "⚔️" },
  { key: "reputation", label: "Нэр хүнд", icon: "👑" },
  { key: "people", label: "Ард түмэн", icon: "🧑‍🤝‍🧑" },
];

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function SimulationRunner({ simulation }: { simulation: Simulation }) {
  const { recordGameScore } = useProgress();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [outcome, setOutcome] = useState<SimulationChoice | null>(null);
  const [history, setHistory] = useState<{ scene: string; choice: string }[]>([]);
  const [finished, setFinished] = useState(false);

  const scene = simulation.scenes[sceneIndex];

  const choose = (choice: SimulationChoice) => {
    setStats((current) => ({
      economy: clamp(current.economy + (choice.effects.economy ?? 0)),
      army: clamp(current.army + (choice.effects.army ?? 0)),
      reputation: clamp(current.reputation + (choice.effects.reputation ?? 0)),
      people: clamp(current.people + (choice.effects.people ?? 0)),
    }));
    setOutcome(choice);
    setHistory((current) => [...current, { scene: scene.title, choice: choice.label }]);
  };

  const next = () => {
    setOutcome(null);
    if (sceneIndex + 1 >= simulation.scenes.length) {
      setFinished(true);
      const total = Math.round(
        (stats.economy + stats.army + stats.reputation + stats.people) / 4,
      );
      recordGameScore(`sim-${simulation.slug}`, total, 50);
      return;
    }
    setSceneIndex((value) => value + 1);
  };

  const average = Math.round(
    (stats.economy + stats.army + stats.reputation + stats.people) / 4,
  );

  if (finished) {
    const ending =
      simulation.endings.find((item) => average >= item.min) ??
      simulation.endings[simulation.endings.length - 1];

    return (
      <div className="space-y-6">
        <Card className="text-center">
          <div className="text-6xl" aria-hidden>
            {simulation.icon}
          </div>
          <h2 className="mt-4 text-2xl font-black">{ending.title}</h2>
          <p className="mx-auto mt-4 max-w-xl leading-8 text-fg-muted">
            {ending.body}
          </p>
          <p className="mt-6 text-5xl font-black text-gold">{average}</p>
          <p className="text-sm text-fg-muted">Эцсийн дундаж үзүүлэлт</p>
        </Card>

        <Card>
          <h3 className="text-sm font-black">Үзүүлэлт</h3>
          <div className="mt-4 space-y-4">
            {statMeta.map((meta) => (
              <ProgressBar
                key={meta.key}
                value={stats[meta.key]}
                label={`${meta.icon} ${meta.label}`}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-black">Таны шийдвэрүүд</h3>
          <ol className="mt-4 space-y-3">
            {history.map((item, index) => (
              <li key={index} className="rounded-xl bg-muted/60 p-4 text-sm">
                <span className="font-bold">{item.scene}</span>
                <span className="mt-1 block text-fg-muted">→ {item.choice}</span>
              </li>
            ))}
          </ol>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setSceneIndex(0);
              setStats(initialStats);
              setHistory([]);
              setFinished(false);
              setOutcome(null);
            }}
          >
            🔄 Дахин тоглох
          </Button>
          <Link
            href="/games"
            className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            Бусад тоглоом
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Үзүүлэлт */}
      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statMeta.map((meta) => (
            <div key={meta.key}>
              <ProgressBar
                value={stats[meta.key]}
                label={`${meta.icon} ${meta.label}`}
              />
            </div>
          ))}
        </div>
      </Card>

      <p className="text-sm font-semibold text-fg-muted">
        Хэсэг {sceneIndex + 1} / {simulation.scenes.length}
      </p>

      <Card>
        <h2 className="text-xl font-black">{scene.title}</h2>
        <p className="mt-4 leading-8 text-fg-muted">{scene.narrative}</p>

        {!outcome ? (
          <div className="mt-8 grid gap-4">
            {scene.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => choose(choice)}
                className="rounded-2xl border border-line p-5 text-left transition hover:-translate-y-0.5 hover:border-gold/60 hover:bg-muted"
              >
                <span className="block font-bold">{choice.label}</span>
                <span className="mt-1 block text-sm leading-6 text-fg-muted">
                  {choice.description}
                </span>
                <span className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(choice.effects).map(([key, value]) => (
                    <span
                      key={key}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                        (value as number) >= 0
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-clay/15 text-clay",
                      )}
                    >
                      {statMeta.find((meta) => meta.key === key)?.icon}{" "}
                      {(value as number) > 0 ? "+" : ""}
                      {value as number}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5">
              <p className="text-sm font-bold text-gold">Үр дагавар</p>
              <p className="mt-2 leading-7">{outcome.outcome}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={next}>
                {sceneIndex + 1 >= simulation.scenes.length
                  ? "Үр дүнг харах"
                  : "Үргэлжлүүлэх →"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
