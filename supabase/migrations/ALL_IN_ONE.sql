-- ============================================================================
-- ТҮҮХЭЭ МЭДЬЕ — БҮХ MIGRATION НЭГ ФАЙЛД
--
-- Энэ файлыг бүтнээр нь Supabase SQL Editor-т хуулж, нэг удаа Run хийнэ.
-- Дотор нь 0001_init + 0002_rls + 0003_functions зөв дарааллаар багтсан.
-- ============================================================================

-- ============================================================================
-- ТҮҮХЭЭ МЭДЬЕ — Database schema
-- 0001_init.sql : хүснэгт, индекс, харилцан хамаарал
--
-- Ажиллуулах:
--   supabase db push
--   эсвэл Supabase Dashboard → SQL Editor рүү хуулж ажиллуулна
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ────────────────────────────  ENUM төрлүүд  ────────────────────────────

create type user_role as enum ('student', 'parent', 'teacher', 'admin');
create type era_key as enum ('ancient', 'medieval', 'modern', 'contemporary');
create type difficulty_level as enum ('easy', 'medium', 'hard', 'olympiad');
create type question_type as enum (
  'multiple_choice', 'true_false', 'matching', 'ordering', 'fill_blank'
);
create type source_kind as enum (
  'written', 'archaeological', 'oral', 'photo', 'map', 'document', 'monument'
);
create type region_kind as enum ('mn', 'world');
create type feedback_kind as enum ('bug', 'content', 'idea', 'praise', 'other');
create type exam_kind as enum ('grade9', 'eesh', 'state', 'civil', 'practice');

-- ────────────────────────────  Хэрэглэгч  ────────────────────────────

-- auth.users-тэй 1:1 холбогдоно. Бүртгэл үүсэхэд trigger автоматаар үүсгэнэ
-- (0003_functions.sql-ыг үз).
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default 'Хэрэглэгч',
  email       text,
  role        user_role not null default 'student',
  grade       smallint check (grade between 6 and 12),
  avatar      text default '🧑‍🎓',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Хэрэглэгчийн профайл. role талбар нь эрхийн шалгалтын үндэс болно.';

-- Эцэг эх ↔ сурагчийн холбоо (олон-олон)
create table public.parent_links (
  parent_id   uuid not null references public.profiles (id) on delete cascade,
  student_id  uuid not null references public.profiles (id) on delete cascade,
  confirmed   boolean not null default false,
  created_at  timestamptz not null default now(),
  primary key (parent_id, student_id)
);

comment on table public.parent_links is
  'Эцэг эх зөвхөн энд холбогдсон хүүхдийнхээ мэдээллийг харна.';

-- ────────────────────────────  Хичээл  ────────────────────────────

create table public.grades (
  grade       smallint primary key check (grade between 6 and 12),
  title       text not null,
  subtitle    text,
  description text,
  icon        text,
  accent      text,
  focus       text
);

create table public.lessons (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  grade         smallint not null references public.grades (grade),
  "order"       integer not null default 1,
  title         text not null,
  subtitle      text,
  icon          text,
  summary       text,
  objectives    text[] not null default '{}',
  duration_minutes integer not null default 30,
  difficulty    difficulty_level not null default 'medium',
  tags          text[] not null default '{}',
  conclusion    text,
  ai_prompts    text[] not null default '{}',
  external_links jsonb not null default '[]',
  -- Хичээлийн төгсгөлийн тест ба холбогдох тоглоом.
  -- quizzes нь хичээлээс хойш үүсдэг тул FK биш (seed-ийн дараалал).
  quiz_id       text,
  game_slug     text,
  published     boolean not null default false,
  created_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index lessons_grade_idx on public.lessons (grade, "order");
create index lessons_published_idx on public.lessons (published) where published;
create index lessons_tags_idx on public.lessons using gin (tags);

-- Хичээлийн блокууд. `type` талбар нь UI-д ямар блок гэдгийг заана,
-- `content` нь тухайн блокийн өгөгдлийг jsonb-ээр хадгална.
create table public.lesson_sections (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons (id) on delete cascade,
  "order"     integer not null default 1,
  type        text not null,
  title       text not null,
  body        text,
  content     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index lesson_sections_lesson_idx on public.lesson_sections (lesson_id, "order");

-- ────────────────────────────  Түүхэн агуулга  ────────────────────────────

create table public.historical_figures (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  title        text,
  portrait     text,
  born         text,
  died         text,
  era          era_key not null,
  region       region_kind not null default 'mn',
  summary      text,
  achievements text[] not null default '{}',
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now()
);

create index historical_figures_era_idx on public.historical_figures (era);
create index historical_figures_tags_idx on public.historical_figures using gin (tags);

create table public.historical_events (
  id           text primary key,
  title        text not null,
  year_label   text not null,
  sort_year    integer not null,
  era          era_key not null,
  region       region_kind not null default 'mn',
  place        text,
  summary      text,
  cause        text,
  course       text,
  result       text,
  significance text,
  icon         text,
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now()
);

create index historical_events_sort_idx on public.historical_events (sort_year);
create index historical_events_era_idx on public.historical_events (era);

-- Түүхэн хүн ↔ үйл явдлын холбоо
create table public.figure_events (
  figure_id uuid not null references public.historical_figures (id) on delete cascade,
  event_id  text not null references public.historical_events (id) on delete cascade,
  primary key (figure_id, event_id)
);

-- Түүхэн хүмүүсийн хоорондын холбоо
create table public.figure_relations (
  figure_id  uuid not null references public.historical_figures (id) on delete cascade,
  related_id uuid not null references public.historical_figures (id) on delete cascade,
  primary key (figure_id, related_id),
  check (figure_id <> related_id)
);

create table public.historical_places (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  kind        text not null default 'city',
  year_label  text,
  description text,
  -- Схемчилсэн газрын зурган дээрх байрлал (0–100 хувь)
  x           numeric(5,2),
  y           numeric(5,2),
  -- Бодит координат (Phase 11-д ашиглана)
  latitude    numeric(9,6),
  longitude   numeric(9,6)
);

create table public.sources (
  id                text primary key,
  title             text not null,
  kind              source_kind not null,
  origin            text,
  year_label        text,
  excerpt           text not null,
  analysis_question text,
  guidance          text,
  tags              text[] not null default '{}',
  created_at        timestamptz not null default now()
);

create table public.glossary_terms (
  id            uuid primary key default gen_random_uuid(),
  term          text not null unique,
  definition    text not null,
  category      text,
  related_terms text[] not null default '{}'
);

-- Хичээл ↔ агуулгын холбоос
create table public.lesson_figures (
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  figure_id uuid not null references public.historical_figures (id) on delete cascade,
  primary key (lesson_id, figure_id)
);

create table public.lesson_events (
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  event_id  text not null references public.historical_events (id) on delete cascade,
  primary key (lesson_id, event_id)
);

create table public.lesson_sources (
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  source_id text not null references public.sources (id) on delete cascade,
  primary key (lesson_id, source_id)
);

-- ────────────────────────────  Тест / Шалгалт  ────────────────────────────

create table public.questions (
  id           text primary key,
  grade        smallint references public.grades (grade),
  topic        text not null,
  era          era_key not null,
  difficulty   difficulty_level not null default 'medium',
  type         question_type not null default 'multiple_choice',
  prompt       text not null,
  options      text[],
  answer_index smallint,
  answer_text  text,
  pairs        jsonb,
  sequence     text[],
  explanation  text not null,
  source       text,
  image_url    text,
  tags         text[] not null default '{}',
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index questions_grade_idx on public.questions (grade);
create index questions_era_idx on public.questions (era);
create index questions_tags_idx on public.questions using gin (tags);
create index questions_topic_idx on public.questions (topic);

create table public.quizzes (
  id          text primary key,
  title       text not null,
  description text,
  grade       smallint references public.grades (grade),
  lesson_id   uuid references public.lessons (id) on delete cascade,
  time_limit  integer,
  pass_score  smallint not null default 60,
  created_at  timestamptz not null default now()
);

create table public.quiz_questions (
  quiz_id     text not null references public.quizzes (id) on delete cascade,
  question_id text not null references public.questions (id) on delete cascade,
  "order"     integer not null default 1,
  primary key (quiz_id, question_id)
);

create table public.exams (
  slug           text primary key,
  kind           exam_kind not null,
  title          text not null,
  subtitle       text,
  description    text,
  icon           text,
  question_count integer not null default 20,
  duration       integer not null default 0,
  difficulty     difficulty_level not null default 'medium',
  topics         text[] not null default '{}',
  filter         jsonb not null default '{}'
);

create table public.quiz_attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  quiz_id          text,
  exam_slug        text references public.exams (slug) on delete set null,
  score            integer not null default 0,
  total            integer not null default 0,
  duration_seconds integer not null default 0,
  started_at       timestamptz not null default now(),
  finished_at      timestamptz not null default now()
);

create index quiz_attempts_user_idx on public.quiz_attempts (user_id, finished_at desc);

create table public.quiz_answers (
  id          uuid primary key default gen_random_uuid(),
  attempt_id  uuid not null references public.quiz_attempts (id) on delete cascade,
  question_id text not null references public.questions (id) on delete cascade,
  topic       text not null,
  correct     boolean not null,
  given       jsonb
);

create index quiz_answers_attempt_idx on public.quiz_answers (attempt_id);

-- ────────────────────────────  Тоглоом / Симуляц  ────────────────────────────

create table public.games (
  slug        text primary key,
  kind        text not null,
  title       text not null,
  description text,
  icon        text,
  grades      smallint[] not null default '{}',
  difficulty  difficulty_level not null default 'medium',
  playable    boolean not null default false,
  xp          integer not null default 10
);

create table public.game_scores (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  game_slug  text not null references public.games (slug) on delete cascade,
  score      integer not null default 0,
  played_at  timestamptz not null default now()
);

create index game_scores_user_idx on public.game_scores (user_id, played_at desc);
create index game_scores_leaderboard_idx on public.game_scores (game_slug, score desc);

create table public.simulations (
  slug     text primary key,
  title    text not null,
  subtitle text,
  icon     text,
  intro    text,
  endings  jsonb not null default '[]'
);

create table public.simulation_scenes (
  id            uuid primary key default gen_random_uuid(),
  simulation_slug text not null references public.simulations (slug) on delete cascade,
  "order"       integer not null default 1,
  title         text not null,
  narrative     text not null
);

create table public.simulation_choices (
  id          uuid primary key default gen_random_uuid(),
  scene_id    uuid not null references public.simulation_scenes (id) on delete cascade,
  label       text not null,
  description text,
  effects     jsonb not null default '{}',
  outcome     text
);

-- ────────────────────────────  Ахиц / Gamification  ────────────────────────────

create table public.progress (
  user_id        uuid primary key references public.profiles (id) on delete cascade,
  xp             integer not null default 0,
  streak         integer not null default 0,
  last_active_at date,
  updated_at     timestamptz not null default now()
);

create table public.lesson_progress (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  lesson_id   uuid not null references public.lessons (id) on delete cascade,
  viewed_at   timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

create index lesson_progress_user_idx on public.lesson_progress (user_id);

-- Сэдэв тус бүрийн эзэмшил — сул сэдвийг илрүүлэхэд ашиглана
create table public.topic_mastery (
  user_id uuid not null references public.profiles (id) on delete cascade,
  topic   text not null,
  correct integer not null default 0,
  total   integer not null default 0,
  primary key (user_id, topic)
);

create table public.achievements (
  id          text primary key,
  title       text not null,
  description text,
  icon        text,
  requirement text,
  xp          integer not null default 0
);

create table public.user_achievements (
  user_id        uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  earned_at      timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ────────────────────────────  Мэдээ / Санал  ────────────────────────────

create table public.announcements (
  id           uuid primary key default gen_random_uuid(),
  -- Гарчиг давтагдахгүй — seed дахин ажиллахад давхардахаас сэргийлнэ
  title        text not null unique,
  body         text not null,
  category     text default 'Мэдээ',
  icon         text default '📢',
  author       text,
  author_id    uuid references public.profiles (id) on delete set null,
  pinned       boolean not null default false,
  published_at date not null default current_date,
  created_at   timestamptz not null default now()
);

create index announcements_published_idx on public.announcements (pinned desc, published_at desc);

create table public.feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete set null,
  name       text,
  user_type  text not null default 'student',
  kind       feedback_kind not null default 'idea',
  title      text not null,
  body       text not null,
  rating     smallint check (rating between 1 and 5),
  resolved   boolean not null default false,
  created_at timestamptz not null default now()
);

create index feedback_resolved_idx on public.feedback (resolved, created_at desc);

-- ────────────────────────────  AI яриа  ────────────────────────────

create table public.ai_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete cascade,
  mode       text not null default 'ask',
  title      text,
  created_at timestamptz not null default now()
);

create table public.ai_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  citations       jsonb not null default '[]',
  created_at      timestamptz not null default now()
);

create index ai_messages_conversation_idx on public.ai_messages (conversation_id, created_at);

-- ────────────────────────────  Медиа  ────────────────────────────

create table public.media (
  id          uuid primary key default gen_random_uuid(),
  bucket      text not null default 'media',
  path        text not null,
  alt         text,
  kind        text not null default 'image',
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (bucket, path)
);


-- ============================================================================
-- 0002_rls.sql : Row Level Security
--
-- ЗАРЧИМ
--   • Нийтийн контент (хичээл, түүхэн хүн, үйл явдал, тоглоом …) — бүгд УНШИНА
--   • Контент засах — зөвхөн teacher / admin
--   • Хувийн өгөгдөл (ахиц, тестийн үр дүн, AI яриа) — зөвхөн эзэн нь
--   • Эцэг эх — зөвхөн parent_links-ээр холбогдсон хүүхдийнхээ өгөгдлийг
--   • Сурагч өөр сурагчийн өгөгдлийг ХАРАХГҮЙ
--
-- ЧУХАЛ: client-side дэх role шалгалт бол зөвхөн UI-д зориулагдсан.
-- Бодит хамгаалалт нь ЭНЭ ФАЙЛД байна.
-- ============================================================================

-- ────────────────────────────  Туслах функцууд  ────────────────────────────

-- SECURITY DEFINER — profiles дээрх policy дотроос profiles-ыг уншихад
-- рекурс үүсэхээс сэргийлнэ.
create or replace function public.my_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('teacher', 'admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Тухайн сурагч над (эцэг эх)-тэй холбогдсон эсэх
create or replace function public.is_my_child(child uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.parent_links
    where parent_id = auth.uid()
      and student_id = child
      and confirmed
  );
$$;

-- ────────────────────────────  RLS идэвхжүүлэх  ────────────────────────────

alter table public.profiles            enable row level security;
alter table public.parent_links        enable row level security;
alter table public.grades              enable row level security;
alter table public.lessons             enable row level security;
alter table public.lesson_sections     enable row level security;
alter table public.historical_figures  enable row level security;
alter table public.historical_events   enable row level security;
alter table public.figure_events       enable row level security;
alter table public.figure_relations    enable row level security;
alter table public.historical_places   enable row level security;
alter table public.sources             enable row level security;
alter table public.glossary_terms      enable row level security;
alter table public.lesson_figures      enable row level security;
alter table public.lesson_events       enable row level security;
alter table public.lesson_sources      enable row level security;
alter table public.questions           enable row level security;
alter table public.quizzes             enable row level security;
alter table public.quiz_questions      enable row level security;
alter table public.exams               enable row level security;
alter table public.quiz_attempts       enable row level security;
alter table public.quiz_answers        enable row level security;
alter table public.games               enable row level security;
alter table public.game_scores         enable row level security;
alter table public.simulations         enable row level security;
alter table public.simulation_scenes   enable row level security;
alter table public.simulation_choices  enable row level security;
alter table public.progress            enable row level security;
alter table public.lesson_progress     enable row level security;
alter table public.topic_mastery       enable row level security;
alter table public.achievements        enable row level security;
alter table public.user_achievements   enable row level security;
alter table public.announcements       enable row level security;
alter table public.feedback            enable row level security;
alter table public.ai_conversations    enable row level security;
alter table public.ai_messages         enable row level security;
alter table public.media               enable row level security;

-- ────────────────────────────  Профайл  ────────────────────────────

create policy "Өөрийн профайлаа харна"
  on public.profiles for select
  using (
    id = auth.uid()
    or public.is_staff()
    or public.is_my_child(id)
  );

create policy "Өөрийн профайлаа засна"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- Хэрэглэгч өөрийнхөө эрхийг өөрчилж чадахгүй
    and role = public.my_role()
  );

create policy "Админ бүх профайлыг засна"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────  Эцэг эхийн холбоо  ────────────────────────────

create policy "Холбоогоо харна"
  on public.parent_links for select
  using (parent_id = auth.uid() or student_id = auth.uid() or public.is_staff());

create policy "Эцэг эх хүсэлт үүсгэнэ"
  on public.parent_links for insert
  with check (parent_id = auth.uid());

create policy "Сурагч холбоог баталгаажуулна"
  on public.parent_links for update
  using (student_id = auth.uid() or public.is_staff());

create policy "Холбоог цуцлана"
  on public.parent_links for delete
  using (parent_id = auth.uid() or student_id = auth.uid() or public.is_staff());

-- ────────────────────────────  Нийтийн контент  ────────────────────────────
-- Хэв маяг: бүгд УНШИНА (нэвтрээгүй зочин ч), зөвхөн staff ЗАСНА.

-- Нийтлээгүй хичээлийг зөвхөн staff харна
create policy "Нийтэлсэн хичээлийг бүгд харна"
  on public.lessons for select
  using (published or public.is_staff());

create policy "Багш хичээл нэмнэ"
  on public.lessons for insert with check (public.is_staff());
create policy "Багш хичээл засна"
  on public.lessons for update using (public.is_staff()) with check (public.is_staff());
create policy "Багш хичээл устгана"
  on public.lessons for delete using (public.is_staff());

do $$
declare
  t text;
begin
  foreach t in array array[
    'grades', 'lesson_sections', 'historical_figures', 'historical_events',
    'figure_events', 'figure_relations', 'historical_places', 'sources',
    'glossary_terms', 'lesson_figures', 'lesson_events', 'lesson_sources',
    'questions', 'quizzes', 'quiz_questions', 'exams', 'games',
    'simulations', 'simulation_scenes', 'simulation_choices', 'achievements',
    'media'
  ]
  loop
    execute format(
      'create policy "Бүгд унших: %1$s" on public.%1$I for select using (true);', t
    );
    execute format(
      'create policy "Багш нэмэх: %1$s" on public.%1$I for insert with check (public.is_staff());', t
    );
    execute format(
      'create policy "Багш засах: %1$s" on public.%1$I for update using (public.is_staff()) with check (public.is_staff());', t
    );
    execute format(
      'create policy "Багш устгах: %1$s" on public.%1$I for delete using (public.is_staff());', t
    );
  end loop;
end;
$$;

-- ────────────────────────────  Хувийн өгөгдөл  ────────────────────────────
-- Эзэн нь бүрэн эрхтэй; эцэг эх, багш нь ЗӨВХӨН УНШИНА.

do $$
declare
  t text;
begin
  foreach t in array array[
    'quiz_attempts', 'game_scores', 'lesson_progress', 'topic_mastery',
    'user_achievements'
  ]
  loop
    execute format($f$
      create policy "Эзэн харна: %1$s"
        on public.%1$I for select
        using (
          user_id = auth.uid()
          or public.is_staff()
          or public.is_my_child(user_id)
        );
    $f$, t);

    execute format($f$
      create policy "Эзэн нэмнэ: %1$s"
        on public.%1$I for insert with check (user_id = auth.uid());
    $f$, t);

    execute format($f$
      create policy "Эзэн засна: %1$s"
        on public.%1$I for update
        using (user_id = auth.uid()) with check (user_id = auth.uid());
    $f$, t);

    execute format($f$
      create policy "Эзэн устгана: %1$s"
        on public.%1$I for delete using (user_id = auth.uid());
    $f$, t);
  end loop;
end;
$$;

-- progress хүснэгт нь user_id-г primary key болгосон тул тусад нь
create policy "Ахицаа харна"
  on public.progress for select
  using (
    user_id = auth.uid() or public.is_staff() or public.is_my_child(user_id)
  );
create policy "Ахицаа нэмнэ"
  on public.progress for insert with check (user_id = auth.uid());
create policy "Ахицаа засна"
  on public.progress for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Тестийн хариултууд — attempt-аар дамжуулан эзэмшил тодорхойлогдоно
create policy "Өөрийн хариултаа харна"
  on public.quiz_answers for select
  using (
    exists (
      select 1 from public.quiz_attempts a
      where a.id = attempt_id
        and (
          a.user_id = auth.uid()
          or public.is_staff()
          or public.is_my_child(a.user_id)
        )
    )
  );

create policy "Өөрийн хариултаа нэмнэ"
  on public.quiz_answers for insert
  with check (
    exists (
      select 1 from public.quiz_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  );

-- ────────────────────────────  AI яриа  ────────────────────────────

create policy "Өөрийн яриагаа харна"
  on public.ai_conversations for select using (user_id = auth.uid());
create policy "Яриа эхлүүлнэ"
  on public.ai_conversations for insert with check (user_id = auth.uid());
create policy "Яриагаа устгана"
  on public.ai_conversations for delete using (user_id = auth.uid());

create policy "Өөрийн мессежээ харна"
  on public.ai_messages for select
  using (
    exists (
      select 1 from public.ai_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy "Мессеж нэмнэ"
  on public.ai_messages for insert
  with check (
    exists (
      select 1 from public.ai_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

-- ────────────────────────────  Мэдээ  ────────────────────────────

create policy "Мэдээг бүгд харна"
  on public.announcements for select using (true);
create policy "Багш мэдээ нэмнэ"
  on public.announcements for insert with check (public.is_staff());
create policy "Багш мэдээ засна"
  on public.announcements for update using (public.is_staff()) with check (public.is_staff());
create policy "Багш мэдээ устгана"
  on public.announcements for delete using (public.is_staff());

-- ────────────────────────────  Санал хүсэлт  ────────────────────────────
-- Сурагч, эцэг эх бичнэ. Багш/админ бүгдийг харж, шийдвэрлэсэн гэж тэмдэглэнэ.

create policy "Өөрийн саналаа харна"
  on public.feedback for select
  using (user_id = auth.uid() or public.is_staff());

create policy "Санал илгээнэ"
  on public.feedback for insert
  with check (
    -- Нэвтэрсэн бол өөрийн нэрээр, зочин бол user_id хоосон
    (user_id is null and auth.uid() is null)
    or user_id = auth.uid()
  );

create policy "Багш саналыг шийдвэрлэнэ"
  on public.feedback for update
  using (public.is_staff()) with check (public.is_staff());

create policy "Админ санал устгана"
  on public.feedback for delete using (public.is_admin());

-- ────────────────────────────  Leaderboard  ────────────────────────────
-- Бусад сурагчийн оноог шууд харуулахгүйн тулд нэргүй харагдацыг
-- SECURITY DEFINER view-ээр гаргана.

create or replace view public.leaderboard
with (security_invoker = false)
as
  select
    g.game_slug,
    p.name,
    p.avatar,
    max(g.score) as best_score
  from public.game_scores g
  join public.profiles p on p.id = g.user_id
  group by g.game_slug, p.name, p.avatar
  order by best_score desc;

grant select on public.leaderboard to anon, authenticated;


-- ============================================================================
-- 0003_functions.sql : trigger, туслах функц, storage
-- ============================================================================

-- ────────────────────────────  updated_at  ────────────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger lessons_touch
  before update on public.lessons
  for each row execute function public.touch_updated_at();

create trigger progress_touch
  before update on public.progress
  for each row execute function public.touch_updated_at();

-- ────────────────────────────  Шинэ хэрэглэгч  ────────────────────────────
-- auth.users-д бүртгэл үүсэхэд профайл автоматаар үүснэ.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, grade)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    -- Шинэ хэрэглэгч ҮРГЭЛЖ сурагч эрхтэй эхэлнэ.
    -- Багш/админ эрхийг зөвхөн одоо байгаа админ гараар олгоно.
    'student',
    nullif(new.raw_user_meta_data ->> 'grade', '')::smallint
  );

  insert into public.progress (user_id) values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────  Ахиц бүртгэх  ────────────────────────────

-- Тест дуусахад: оноо бүртгэх, XP нэмэх, сэдвийн эзэмшлийг шинэчлэх.
-- Нэг transaction-д хийгдэх тул хэсэгчилсэн бичилт үүсэхгүй.
create or replace function public.record_quiz_attempt(
  p_quiz_id     text,
  p_exam_slug   text,
  p_score       integer,
  p_total       integer,
  p_duration    integer,
  p_answers     jsonb  -- [{ question_id, topic, correct, given }]
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_attempt uuid;
  v_answer  jsonb;
begin
  if auth.uid() is null then
    raise exception 'Нэвтрээгүй байна';
  end if;

  insert into public.quiz_attempts (
    user_id, quiz_id, exam_slug, score, total, duration_seconds, finished_at
  )
  values (auth.uid(), p_quiz_id, p_exam_slug, p_score, p_total, p_duration, now())
  returning id into v_attempt;

  for v_answer in select * from jsonb_array_elements(p_answers)
  loop
    insert into public.quiz_answers (attempt_id, question_id, topic, correct, given)
    values (
      v_attempt,
      v_answer ->> 'question_id',
      v_answer ->> 'topic',
      (v_answer ->> 'correct')::boolean,
      v_answer -> 'given'
    );

    insert into public.topic_mastery (user_id, topic, correct, total)
    values (
      auth.uid(),
      v_answer ->> 'topic',
      case when (v_answer ->> 'correct')::boolean then 1 else 0 end,
      1
    )
    on conflict (user_id, topic) do update
      set correct = public.topic_mastery.correct + excluded.correct,
          total   = public.topic_mastery.total + excluded.total;
  end loop;

  perform public.add_xp(p_score * 5);

  return v_attempt;
end;
$$;

-- XP нэмэх, streak-ыг шинэчлэх
create or replace function public.add_xp(p_xp integer)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_last date;
begin
  if auth.uid() is null then
    return;
  end if;

  select last_active_at into v_last from public.progress where user_id = auth.uid();

  insert into public.progress (user_id, xp, streak, last_active_at)
  values (auth.uid(), p_xp, 1, current_date)
  on conflict (user_id) do update
    set xp = public.progress.xp + p_xp,
        streak = case
          when public.progress.last_active_at = current_date then public.progress.streak
          when public.progress.last_active_at = current_date - 1 then public.progress.streak + 1
          else 1
        end,
        last_active_at = current_date;
end;
$$;

-- Хичээл дуусгах
create or replace function public.complete_lesson(p_lesson uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Нэвтрээгүй байна';
  end if;

  insert into public.lesson_progress (user_id, lesson_id, completed_at)
  values (auth.uid(), p_lesson, now())
  on conflict (user_id, lesson_id) do update
    set completed_at = coalesce(public.lesson_progress.completed_at, now());

  perform public.add_xp(25);
end;
$$;

-- Сул сэдвийг буцаана — сурагчийн самбарт ашиглана
create or replace function public.weak_topics(p_threshold numeric default 0.7)
returns table (topic text, percent integer, total integer)
language sql
security invoker
set search_path = public
as $$
  select
    m.topic,
    round((m.correct::numeric / nullif(m.total, 0)) * 100)::integer as percent,
    m.total
  from public.topic_mastery m
  where m.user_id = auth.uid()
    and m.total >= 2
    and (m.correct::numeric / nullif(m.total, 0)) < p_threshold
  order by percent asc;
$$;

-- ────────────────────────────  Хайлт  ────────────────────────────

create or replace function public.search_content(p_query text)
returns table (kind text, id text, title text, description text)
language sql
stable
security invoker
set search_path = public
as $$
  select 'lesson', l.slug, l.title, l.summary
    from public.lessons l
   where l.published
     and (l.title ilike '%' || p_query || '%' or l.summary ilike '%' || p_query || '%')
  union all
  select 'figure', f.slug, f.name, f.title
    from public.historical_figures f
   where f.name ilike '%' || p_query || '%' or f.summary ilike '%' || p_query || '%'
  union all
  select 'event', e.id, e.title, e.summary
    from public.historical_events e
   where e.title ilike '%' || p_query || '%'
      or e.summary ilike '%' || p_query || '%'
      or e.year_label ilike '%' || p_query || '%'
  union all
  select 'term', t.term, t.term, t.definition
    from public.glossary_terms t
   where t.term ilike '%' || p_query || '%'
  limit 50;
$$;

-- ────────────────────────────  Storage  ────────────────────────────
-- Дашбоард → Storage хэсгээс гараар үүсгэж болно. SQL-ээр:

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Медиаг бүгд харна"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Багш медиа байршуулна"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_staff());

create policy "Багш медиа устгана"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_staff());
