import type { Game } from "@/types";

export const games: Game[] = [
  {
    slug: "timeline-order",
    kind: "timeline_order",
    title: "Он цагийг зөв байрлуул",
    description:
      "Түүхэн үйл явдлыг эрт үеэс хойш зөв дарааллаар нь өрөөрэй. Он цагийн хэлхээс цээжлэх хамгийн үр дүнтэй арга.",
    icon: "⏳",
    grades: [6, 7, 8, 9, 10, 11, 12],
    difficulty: "medium",
    playable: true,
    xp: 30,
  },
  {
    slug: "who-is-it",
    kind: "who_is_it",
    title: "Хэн бэ?",
    description:
      "Сэжүүрээр түүхэн хүнийг таа. Сэжүүр цөөн ашиглах тусам оноо өндөр.",
    icon: "🕵️",
    grades: [6, 7, 8, 9, 10, 11, 12],
    difficulty: "medium",
    playable: true,
    xp: 25,
  },
  {
    slug: "match-pairs",
    kind: "match_pairs",
    title: "Үйл явдлыг тааруул",
    description:
      "Түүхэн хүн, он, үйл явдлыг зөв хосоор нь холбо. Хурдан холбох тусам оноо өндөр.",
    icon: "🔗",
    grades: [6, 7, 8, 9, 10, 11, 12],
    difficulty: "easy",
    playable: true,
    xp: 20,
  },
  {
    slug: "quiz-rush",
    kind: "quiz_rush",
    title: "Хурдан тест",
    description:
      "60 секундэд аль болох олон асуултад зөв хариул. Цаг барагдахаас өмнө яараарай!",
    icon: "⚡",
    grades: [6, 7, 8, 9, 10, 11, 12],
    difficulty: "hard",
    playable: true,
    xp: 40,
  },
  {
    slug: "true-false",
    kind: "true_false",
    title: "Үнэн үү, худал уу?",
    description: "Түүхэн мэдэгдэл үнэн эсэхийг хурдан шийд.",
    icon: "✅",
    grades: [6, 7, 8, 9],
    difficulty: "easy",
    playable: true,
    xp: 15,
  },
  {
    slug: "memory",
    kind: "memory",
    title: "Түүхэн хослол",
    description:
      "Хөзрийг эргүүлж ижил хосыг ол. Санах ой, түүхэн мэдлэгээ зэрэг сориорой.",
    icon: "🃏",
    grades: [6, 7, 8],
    difficulty: "easy",
    playable: true,
    xp: 20,
  },
  {
    slug: "map-challenge",
    kind: "map_challenge",
    title: "Газрын зураг таах",
    description:
      "Түүхэн хот, тулалдааны талбарыг газрын зураг дээр зөв байрлуул.",
    icon: "🗺️",
    grades: [7, 8, 9, 10],
    difficulty: "medium",
    playable: true,
    xp: 35,
  },
  {
    slug: "word-search",
    kind: "word_search",
    title: "Түүхэн үг хайх",
    description: "Тор дотроос түүхэн нэр томьёог олж тэмдэглэ.",
    icon: "🔤",
    grades: [6, 7, 8],
    difficulty: "easy",
    playable: true,
    xp: 15,
  },
];

export const gameMap = new Map<string, Game>(
  games.map((game) => [game.slug, game]),
);
