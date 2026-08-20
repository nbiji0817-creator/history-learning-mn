import type { Achievement, Announcement, Feedback, User } from "@/types";

/* ─────────────────────────  Амжилтын тэмдэг  ───────────────────────── */

export const achievements: Achievement[] = [
  {
    id: "ach-first-lesson",
    title: "Анхны алхам",
    description: "Эхний хичээлээ дуусгалаа.",
    icon: "🌱",
    requirement: "1 хичээл дуусгах",
    xp: 10,
  },
  {
    id: "ach-beginner",
    title: "Түүхийн анхан шатны мэдэгч",
    description: "5 хичээл дуусгаж, суурь мэдлэгээ бэхжүүллээ.",
    icon: "🏅",
    requirement: "5 хичээл дуусгах",
    xp: 50,
  },
  {
    id: "ach-hunnu",
    title: "Хүннүгийн мэргэжилтэн",
    description: "Хүннүгийн сэдвийн тестийг 90-ээс дээш хувьтай өглөө.",
    icon: "🏹",
    requirement: "Хүннүгийн тест ≥ 90%",
    xp: 80,
  },
  {
    id: "ach-empire",
    title: "Монголын эзэнт гүрний судлаач",
    description: "Дундад үеийн бүх хичээлийг дуусгалаа.",
    icon: "👑",
    requirement: "Дундад үеийн бүх хичээл",
    xp: 120,
  },
  {
    id: "ach-source",
    title: "Эх сурвалжийн шинжээч",
    description: "10 эх сурвалжийг уншиж, шинжилгээний асуултад хариуллаа.",
    icon: "📜",
    requirement: "10 эх сурвалж унших",
    xp: 70,
  },
  {
    id: "ach-100",
    title: "100 асуултын аварга",
    description: "Нийт 100 асуултад зөв хариуллаа.",
    icon: "🎯",
    requirement: "100 зөв хариулт",
    xp: 150,
  },
  {
    id: "ach-streak-7",
    title: "Долоо хоногийн тууштай",
    description: "7 өдөр дараалан суралцлаа.",
    icon: "🔥",
    requirement: "7 өдрийн streak",
    xp: 60,
  },
  {
    id: "ach-exam",
    title: "Шалгалтын бэлтгэлтэн",
    description: "Бүрэн хэмжээний шалгалтын симуляцыг дуусгалаа.",
    icon: "🎓",
    requirement: "1 бүрэн шалгалт өгөх",
    xp: 100,
  },
  {
    id: "ach-gamer",
    title: "Тоглоомын дурлагч",
    description: "5 өөр төрлийн тоглоом тоглолоо.",
    icon: "🎮",
    requirement: "5 өөр тоглоом",
    xp: 50,
  },
];

export const achievementMap = new Map<string, Achievement>(
  achievements.map((achievement) => [achievement.id, achievement]),
);

/* ─────────────────────────  Мэдээ  ───────────────────────── */

export const announcements: Announcement[] = [
  {
    id: "an-001",
    title: "Систем нээгдлээ — 6–12-р ангийн бүх хичээл бэлэн",
    body: "Түүхээ мэдье платформ нээгдлээ. Одоогоор 6–12-р ангийн хичээл, тест, тоглоом, AI түүхийн багш, шалгалтын бэлтгэл ажиллаж байна. Санал хүсэлтээ бидэнд илгээгээрэй.",
    category: "Мэдээ",
    author: "Системийн баг",
    publishedAt: "2026-08-20",
    pinned: true,
    icon: "🎉",
  },
  {
    id: "an-002",
    title: "ЭЕШ-ийн бэлтгэлийн шинэ шалгалт нэмэгдлээ",
    body: "40 болон 60 асуулттай хугацаатай симуляц шалгалт нэмэгдлээ. Шалгалт дууссаны дараа сул сэдвийг чинь тодорхойлж, давтах хичээл санал болгоно.",
    category: "Шалгалт",
    author: "Системийн баг",
    publishedAt: "2026-08-18",
    pinned: false,
    icon: "🎓",
  },
  {
    id: "an-003",
    title: "«Чи Өгөөдэй хааны зөвлөх бол» симуляц нээгдлээ",
    body: "Түүхэн шийдвэр гаргах интерактив симуляц нэмэгдлээ. Шийдвэр бүр эдийн засаг, цэрэг, ард түмний сэтгэлд нөлөөлж, өөр өөр төгсгөлд хүргэнэ.",
    category: "Шинэ",
    author: "Контентын баг",
    publishedAt: "2026-08-15",
    pinned: false,
    icon: "🎲",
  },
  {
    id: "an-004",
    title: "Багш нарт: хичээлийн агуулгыг удирдах хэсэг",
    body: "Багшийн хэсгээс хичээл, тест, асуултын санг харах боломжтой боллоо. Дараагийн хувилбарт агуулга нэмэх, засах бүрэн эрх нээгдэнэ.",
    category: "Багш",
    author: "Системийн баг",
    publishedAt: "2026-08-12",
    pinned: false,
    icon: "👩‍🏫",
  },
];

/* ─────────────────────────  Санал хүсэлт (демо)  ───────────────────────── */

export const demoFeedback: Feedback[] = [
  {
    id: "fb-001",
    name: "Б.Тэмүүлэн",
    userType: "student",
    kind: "praise",
    title: "Он цагийн тоглоом их тустай байна",
    body: "Огноо цээжлэхэд их тусалж байна. Дундад үеийн үйл явдал илүү олон нэмж өгөөч.",
    rating: 5,
    createdAt: "2026-08-19",
    resolved: false,
  },
  {
    id: "fb-002",
    name: "Д.Оюунчимэг",
    userType: "parent",
    kind: "idea",
    title: "Эцэг эхэд долоо хоногийн тайлан",
    body: "Хүүхдийн ахицын долоо хоног тутмын тайланг имэйлээр авдаг болгож болох уу?",
    rating: 4,
    createdAt: "2026-08-17",
    resolved: false,
  },
  {
    id: "fb-003",
    name: "Ч.Ганбаатар",
    userType: "student",
    kind: "content",
    title: "11-р ангийн хичээлд эх сурвалж нэмнэ үү",
    body: "Гүнзгийрүүлсэн хэсэгт анхдагч эх сурвалж дээр ажиллах даалгавар олон байвал сайн.",
    rating: 4,
    createdAt: "2026-08-14",
    resolved: true,
  },
];

/* ─────────────────────────  Демо хэрэглэгч  ───────────────────────── */

export const demoUsers: User[] = [
  {
    id: "u-student",
    name: "Б.Тэмүүлэн",
    email: "student@demo.mn",
    role: "student",
    grade: 9,
    avatar: "🧑‍🎓",
    createdAt: "2026-06-01",
  },
  {
    id: "u-parent",
    name: "Д.Оюунчимэг",
    email: "parent@demo.mn",
    role: "parent",
    grade: null,
    avatar: "👩",
    createdAt: "2026-06-01",
    childIds: ["u-student"],
  },
  {
    id: "u-teacher",
    name: "С.Батбаяр",
    email: "teacher@demo.mn",
    role: "teacher",
    grade: null,
    avatar: "👨‍🏫",
    createdAt: "2026-05-20",
  },
  {
    id: "u-admin",
    name: "Админ",
    email: "admin@demo.mn",
    role: "admin",
    grade: null,
    avatar: "🛡️",
    createdAt: "2026-05-01",
  },
];

export const userMap = new Map<string, User>(
  demoUsers.map((user) => [user.id, user]),
);
