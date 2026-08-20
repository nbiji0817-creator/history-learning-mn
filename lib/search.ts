import type { SearchResult } from "@/types";
import { lessons } from "@/data/lessons";
import { historicalFigures } from "@/data/figures";
import { historicalEvents } from "@/data/events";
import { historicalSources, sourceKindLabels } from "@/data/sources";
import { glossaryTerms } from "@/data/glossary";
import { games } from "@/data/games";
import { exams } from "@/data/exams";

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function matches(haystack: string[], needle: string): boolean {
  const query = normalize(needle);
  return haystack.some((item) => normalize(item).includes(query));
}

/** Бүх агуулгаас нэгдсэн хайлт хийнэ. */
export function searchAll(query: string, limit = 40): SearchResult[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const results: SearchResult[] = [];

  for (const lesson of lessons) {
    if (!lesson.published) continue;
    if (
      matches(
        [lesson.title, lesson.subtitle, lesson.summary, ...lesson.tags],
        trimmed,
      )
    ) {
      results.push({
        kind: "lesson",
        title: lesson.title,
        description: lesson.summary,
        href: `/lessons/${lesson.slug}`,
        icon: lesson.icon,
        badge: `${lesson.grade}-р анги`,
      });
    }
  }

  for (const figure of historicalFigures) {
    if (
      matches(
        [figure.name, figure.title, figure.summary, ...figure.tags],
        trimmed,
      )
    ) {
      results.push({
        kind: "figure",
        title: figure.name,
        description: figure.title,
        href: `/people/${figure.slug}`,
        icon: figure.portrait,
        badge: "Түүхэн хүн",
      });
    }
  }

  for (const event of historicalEvents) {
    if (
      matches(
        [event.title, event.summary, event.year, event.place, ...event.tags],
        trimmed,
      )
    ) {
      results.push({
        kind: "event",
        title: event.title,
        description: `${event.year} • ${event.place}`,
        href: `/events#${event.id}`,
        icon: event.icon,
        badge: "Үйл явдал",
      });
    }
  }

  for (const source of historicalSources) {
    if (matches([source.title, source.excerpt, ...source.tags], trimmed)) {
      results.push({
        kind: "source",
        title: source.title,
        description: `${sourceKindLabels[source.kind].label} • ${source.year}`,
        href: `/sources#${source.id}`,
        icon: sourceKindLabels[source.kind].icon,
        badge: "Эх сурвалж",
      });
    }
  }

  for (const term of glossaryTerms) {
    if (matches([term.term, term.definition], trimmed)) {
      results.push({
        kind: "term",
        title: term.term,
        description: term.definition,
        href: `/dictionary#${encodeURIComponent(term.term)}`,
        icon: "📖",
        badge: "Нэр томьёо",
      });
    }
  }

  for (const game of games) {
    if (matches([game.title, game.description], trimmed)) {
      results.push({
        kind: "game",
        title: game.title,
        description: game.description,
        href: `/games/${game.slug}`,
        icon: game.icon,
        badge: "Тоглоом",
      });
    }
  }

  for (const exam of exams) {
    if (matches([exam.title, exam.description, ...exam.topics], trimmed)) {
      results.push({
        kind: "exam",
        title: exam.title,
        description: exam.subtitle,
        href: `/exams/${exam.slug}`,
        icon: exam.icon,
        badge: "Шалгалт",
      });
    }
  }

  return results.slice(0, limit);
}
