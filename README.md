# ТҮҮХЭЭ МЭДЬЕ

6–12-р ангийн түүхийн нэгдсэн интерактив сургалтын систем. Монгол хэл дээр.

Хичээл, он цагийн хэлхээс, түүхэн хүмүүс, эх сурвалж, тест, тоглоом,
симуляц, AI түүхийн багш, шалгалтын бэлтгэл, сурагч/эцэг эх/багшийн хэсэг —
бүгд нэг системд.

---

## Хурдан эхлэх

```bash
npm install
npm run dev
```

→ http://localhost:3000

Supabase, OpenAI тохируулаагүй байсан ч **систем бүрэн ажиллана**. Демо
өгөгдөл нь `data/` дотор байгаа тул хоосон дэлгэц гарахгүй.

---

## Технологи

| Давхарга | Технологи |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack), React 19, TypeScript strict |
| Загвар | Tailwind CSS v4, Lucide icons |
| Backend | Supabase (PostgreSQL, Auth, Storage, RLS) |
| AI | OpenAI Chat Completions (streaming) + мэдлэгийн сангийн нөөц хариулт |
| Deploy | GitHub → Vercel |

---

## Файлын бүтэц

```
app/
  page.tsx                  Нүүр
  grades/                   Ангиудын жагсаалт ба ангийн хуудас
  lessons/[slug]/           Хичээлийн дэлгэрэнгүй + тест
  timeline/  events/        Он цагийн хэлхээс, үйл явдал
  people/[slug]/            Түүхэн хүмүүс
  sources/  dictionary/     Эх сурвалж, тайлбар толь
  games/[slug]/             Тоглоом
  games/sim/[slug]/         Түүхэн симуляц
  exams/[slug]/             Шалгалтын симуляц
  ai/                       AI түүхийн багш
  dashboard/ parent/ admin/ Сурагч / эцэг эх / багшийн хэсэг
  feedback/ search/ login/
  api/ai/                   AI streaming endpoint
  api/admin/seed/           Демо өгөгдлийг Supabase руу бичих

components/
  ui/          Button, Card, Badge, ProgressBar, Stat, EmptyState …
  layout/      Header, Footer, Mobile bottom nav
  lessons/     Хичээлийн блок render, инфографик, газрын зураг
  quiz/        Тестийн хөдөлгүүр, шалгалтын симуляц
  games/       Тоглоомын хөдөлгүүр, симуляц
  timeline/ people/ dictionary/ search/ dashboard/ feedback/ ai/ auth/

data/          Бүх контент (демо өгөгдөл)
lib/
  repo/        ⭐ Өгөгдөл авах давхарга — Supabase руу шилжих цэг
  progress.tsx XP, түвшин, streak, badge, сэдвийн эзэмшил
  auth.tsx     Supabase Auth (client)
  auth-server.ts ⭐ Серверийн эрхийн шалгалт — жинхэнэ хамгаалалт
  theme.tsx    Dark / light
  ai/          Мэдлэгийн сан (RAG-lite)
  supabase/    Browser / server / admin client

supabase/migrations/  SQL schema, RLS, функцууд
scripts/              Нүүлгэлтийн скрипт
docs/                 Баримтжуулалт
types/                Бүх домэйн төрөл
```

---

## Контентын хэмжээ

| Төрөл | Тоо |
|---|---|
| Хичээл | 160 (сурах бичгийн 108 + сэдэвчилсэн 52) |
| Тестийн асуулт | 481 (гараар 96 + сурах бичгээс 385) |
| Түүхэн үйл явдал | 45 |
| Түүхэн хүн | 23 |
| Эх сурвалж | 18 |
| Нэр томьёо | 53 |
| Шалгалт | 10 |
| Тоглоом | 6 тоглох боломжтой + 2 бэлтгэж буй |
| Симуляц | 1 |

Хичээлийн эх сурвалжийн талаар → [docs/MIGRATION.md](docs/MIGRATION.md)

---

## Архитектурын гол шийдэл: `lib/repo/`

Бүх хуудас өгөгдлийг **зөвхөн** `lib/repo/` дамжуулан авдаг:

```ts
// app/grades/[grade]/page.tsx
const lessons = await getLessonsByGrade(gradeNumber);
```

`getLessonsByGrade` нь одоогоор `data/` доторх массиваас уншиж байна.
Supabase руу шилжихэд **зөвхөн энэ функцийн биеийг** солино:

```ts
export async function getLessonsByGrade(grade: GradeNumber) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons").select("*")
    .eq("grade", grade).eq("published", true).order("order");
  return data ?? [];
}
```

UI-д ямар ч засвар шаардлагагүй. Функцууд аль хэдийн `async` байгаа.

---

## Хөгжүүлэлтийн үе шат

| Phase | Агуулга | Төлөв |
|---|---|---|
| 1 | UI + routing + демо өгөгдөл | ✅ Дууссан |
| 2 | Supabase database | ✅ Холбогдсон |
| 3 | Authentication + roles | ✅ Supabase Auth |
| 4 | Хичээл | ✅ |
| 5 | Тестийн хөдөлгүүр | ✅ |
| 6 | Тоглоом | ✅ (6/8) |
| 7 | AI багш | ✅ (streaming + RAG-lite) |
| 8 | Шалгалтын систем | ✅ |
| 9 | Admin CMS | 🟡 Харах хэсэг бэлэн, засах хэсэг үлдсэн |
| 10 | Analytics + gamification | ✅ XP/badge/streak, 🟡 leaderboard |
| 11 | Симуляц + газрын зураг | 🟡 Симуляц ✅, бодит газрын зураг үлдсэн |
| 12 | Production deployment | ✅ Vercel |

---

## PHASE 2: Supabase холбох

### 1. Project үүсгэх

1. https://supabase.com → **New project**
2. Region: **Southeast Asia (Singapore)** — Монголд хамгийн ойр
3. Database password-оо аюулгүй газар хадгална

### 2. Schema үүсгэх

Supabase Dashboard → **SQL Editor** → дараах файлуудыг **дарааллаар нь**
хуулж ажиллуулна:

```
supabase/migrations/0001_init.sql        хүснэгт, индекс
supabase/migrations/0002_rls.sql         Row Level Security
supabase/migrations/0003_functions.sql   trigger, функц, storage
```

Эсвэл Supabase CLI ашиглавал:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

### 3. Түлхүүр авах

Project Settings → **API**:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **зөвхөн серверт**

```bash
cp .env.example .env.local
# .env.local-оо бөглөнө
```

### 4. Демо өгөгдөл оруулах

`.env.local` дотор `SEED_SECRET`-ээ зохиож тавина, дараа нь:

```bash
npm run dev
```

Өөр terminal-аас:

```bash
curl -X POST http://localhost:3000/api/admin/seed -H "x-seed-secret: <SEED_SECRET>"
```

Амжилттай бол хүснэгт тус бүрд хэдэн мөр бичигдсэн тайлан буцаана.
Дуусаад `SEED_SECRET`-ээ устгахыг зөвлөнө.

### 5. Админ эрх олгох

Аюулгүй байдлын үүднээс шинэ хэрэглэгч **үргэлж `student`** эрхтэй үүснэ
(`0003_functions.sql` доторх `handle_new_user`). Өөрийгөө админ болгохын
тулд SQL Editor-оос:

```sql
update public.profiles set role = 'admin' where email = 'таны@имэйл.mn';
```

### 6. `lib/repo/` -г шилжүүлэх

`lib/repo/index.ts` доторх функц бүрийн биеийг Supabase query болгож солино.
Файлын толгойд жишээ бичсэн байгаа. Нэг нэгээр нь шилжүүлж болно — UI
өөрчлөгдөхгүй.

---

## PHASE 3: Authentication ✅

Нэвтрэлт нь **Supabase Auth (имэйл + нууц үг)** дээр бүрэн ажиллана.

### Эрхийн загвар

| Эрх | Хэрхэн авах | Юу хийж чадах |
|---|---|---|
| `student` | Өөрөө бүртгүүлнэ | Хичээл, тест, тоглоом, өөрийн ахиц |
| `parent` | Өөрөө бүртгүүлнэ | Зөвхөн холбогдсон хүүхдийнхээ мэдээлэл |
| `teacher` | **Урилгын код** шаардлагатай | Агуулга, статистик, санал хүсэлт |
| `admin` | **Зөвхөн SQL-ээр** | Бүх эрх |

Админ эрх олгох:

```sql
update public.profiles set role = 'admin' where email = 'таны@имэйл.mn';
```

### Хамгаалалтын гурван давхарга

1. **`proxy.ts`** — хүсэлт бүрд session сэргээнэ
   (Next.js 16-д `middleware.ts` хуучирч `proxy.ts` болсон)
2. **`lib/auth-server.ts`** — хуудсанд нэвтрэх эрхийг СЕРВЕР дээр шалгана
   (`requireUser`, `requireRole`)
3. **RLS** (`0002_rls.sql`) — өгөгдлийн сангийн түвшний эцсийн хамгаалалт

`lib/auth.tsx` доторх `useAuth()` нь **зөвхөн UI-д** зориулагдсан. Браузерын
консолоос түүнийг хуурсан ч дата сан юу ч өгөхгүй.

Эрх ахиулах нь `/api/auth/claim-role` дээр хийгдэх ба хэрэглэгчийг **зөвхөн
session-аас** тодорхойлно — client-ийн илгээсэн `userId`-д хэзээ ч итгэхгүй.

### Supabase дээр тохируулах

**Authentication → Providers → Email** идэвхжүүлнэ.

**Authentication → URL Configuration**:
- Site URL: `https://<таны-домэйн>.vercel.app`
- Redirect URLs: `https://<таны-домэйн>.vercel.app/auth/callback`
  болон `http://localhost:3000/auth/callback`

**Имэйл баталгаажуулалт**: анхдагчаар асаалттай. Сургуулийн дотоод хэрэглээнд
хүндрэлтэй бол Authentication → Providers → Email → «Confirm email»-ыг
унтраана. Тэгвэл бүртгүүлмэгц шууд нэвтэрнэ.

## GitHub

```bash
git init
git add .
git commit -m "feat: 6-12-р ангийн түүхийн нэгдсэн систем — Phase 1"
git branch -M main
git remote add origin https://github.com/<хэрэглэгч>/history-learning-mongolia.git
git push -u origin main
```

Салбарын бодлого:

- `main` — production
- `develop` — хөгжүүлэлт

Commit нэрлэлт:

```
feat: add quiz engine
fix: secure admin authorization
docs: update supabase setup
```

---

## Vercel deployment

1. https://vercel.com → **Add New → Project** → GitHub repo-гоо сонгоно
2. Framework: Next.js (автоматаар танина)
3. **Environment Variables** хэсэгт нэмнэ:

| Нэр | Орчин |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production зөвхөн |
| `OPENAI_API_KEY` | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | Production (жинхэнэ домэйн) |

4. **Deploy**

`main` салбар руу push хийх бүрд автоматаар deploy хийгдэнэ.

---

## Command-ууд

```bash
npm run dev      # хөгжүүлэлтийн сервер
npm run build    # production build + type check
npm run start    # production сервер
npm run lint     # ESLint
```

Type шалгах:

```bash
npx tsc --noEmit
```

---

## Хөгжүүлэлтийн дүрэм

- **TypeScript strict** — `any` ашиглахгүй
- **Өгөгдөл `lib/repo/`-оор** — хуудсууд `data/`-аас шууд импортлохгүй
- **Нууц түлхүүр `NEXT_PUBLIC_`-гүй** — client-д ил гарна
- **Эрхийн шалгалт RLS дээр** — client дээрх шалгалт нь зөвхөн UI-д
- **Loading / error / empty state** — гурвуулангийг нь бодох
- **Accessibility** — `aria-label`, keyboard navigation, contrast
- **Mobile-first** — доод navigation, responsive grid
- **Монгол хэл** — UI, comment, commit бүгд Монголоор

---

## Түүхэн агуулгын зарчим

- Он цаг маргаантай бол `"1517 (маргаантай)"` гэж тэмдэглэнэ
- Түүхэн үйл явдлыг **нэг талыг барихгүй** танилцуулна — эерэг ба сөрөг
  үр дагаврыг хоёуланг нь
- Эх сурвалж бүрийг **хэн, хэзээ, яагаад** үлдээсэн өнцгөөс харуулна
- AI нь системийн мэдлэгийн сангаас гадуур түүх зохиохгүй
  (`lib/ai/knowledge.ts` доторх system prompt-ыг үз)
- Гуравдагч талын материалыг хуулахгүй — эх сурвалж руу нь холбоно
  (жишээ: medle.edu.mn)

---

## Мэдэгдэж буй ажил үлдсэн зүйл

- `app/7`, `app/8`, `app/9`, `app/10` — контент нь `data/` руу нүүсэн тул
  эдгээр хуучин замыг redirect болгох
- `app/10/exams/page.tsx` — 3 ширхэг `null` шалгалтын алдаа build-ыг
  зогсоож байна
- Газрын зураг одоогоор схемчилсэн — бодит SVG/tile map хэрэгтэй
- Leaderboard UI (SQL view бэлэн)
- Admin CMS-ийн засварлах хэсэг
