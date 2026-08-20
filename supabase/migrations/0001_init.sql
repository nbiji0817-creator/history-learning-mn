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
