import type { MetadataRoute } from "next";
import { lessons } from "@/data/lessons";
import { historicalFigures } from "@/data/figures";
import { games } from "@/data/games";
import { exams } from "@/data/exams";
import { grades } from "@/data/grades";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/grades",
    "/timeline",
    "/events",
    "/people",
    "/sources",
    "/dictionary",
    "/games",
    "/exams",
    "/ai",
    "/feedback",
    "/search",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const gradeRoutes = grades.map((grade) => ({
    url: `${siteUrl}/grades/${grade.grade}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const lessonRoutes = lessons
    .filter((lesson) => lesson.published)
    .map((lesson) => ({
      url: `${siteUrl}/lessons/${lesson.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const figureRoutes = historicalFigures.map((figure) => ({
    url: `${siteUrl}/people/${figure.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const gameRoutes = games
    .filter((game) => game.playable)
    .map((game) => ({
      url: `${siteUrl}/games/${game.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  const examRoutes = exams.map((exam) => ({
    url: `${siteUrl}/exams/${exam.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...gradeRoutes,
    ...lessonRoutes,
    ...figureRoutes,
    ...gameRoutes,
    ...examRoutes,
  ];
}
