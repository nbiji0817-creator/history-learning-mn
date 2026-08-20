-- ============================================================================
-- 0004_ai_feedback.sql : AI-ийн сурах гогцоо
--
-- ЗОРИЛГО
--   AI юуг мэдэхгүй байгааг бүртгэж, багш нар түүнд нь агуулга нэмэх
--   боломжийг олгоно. Ингэснээр систем хэрэглэх тусам сайжирна.
--
--   • matched = false  → мэдлэгийн санд хариулт олдоогүй
--   • rating  = -1     → хэрэглэгч хариултыг буруу гэж үзсэн
--
--   Эдгээр нь «дараа юу нэмэх вэ» гэсэн жагсаалт болно.
-- ============================================================================

create table if not exists public.ai_questions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete set null,
  question    text not null,
  mode        text not null default 'ask',
  -- Мэдлэгийн сангаас хангалттай итгэлтэй хариулт олдсон эсэх
  matched     boolean not null default false,
  top_score   numeric(6,1) not null default 0,
  top_match   text,
  -- 'openai' эсвэл 'knowledge-base'
  source      text not null default 'knowledge-base',
  -- Хэрэглэгчийн үнэлгээ: 1 = тустай, -1 = буруу/тусгүй
  rating      smallint check (rating in (-1, 1)),
  created_at  timestamptz not null default now()
);

create index if not exists ai_questions_unmatched_idx
  on public.ai_questions (created_at desc) where not matched;

create index if not exists ai_questions_rating_idx
  on public.ai_questions (rating, created_at desc) where rating is not null;

alter table public.ai_questions enable row level security;

-- Хэн ч (зочин ч) асуулт бүртгүүлж болно — статистик цуглуулах зорилготой
create policy "Асуулт бүртгэх"
  on public.ai_questions for insert
  with check (
    (user_id is null) or (user_id = auth.uid())
  );

-- Зөвхөн багш/админ бүх асуултыг харна
create policy "Багш асуултуудыг харна"
  on public.ai_questions for select
  using (public.is_staff() or user_id = auth.uid());

-- Үнэлгээ өгөх. id нь таамаглах боломжгүй uuid тул тухайн асуултыг
-- асуусан хүн л мэднэ — зочин ч үнэлгээгээ өгөх боломжтой байх ёстой.
create policy "Үнэлгээ өгөх"
  on public.ai_questions for update
  using (true)
  with check (true);

create policy "Админ асуулт устгана"
  on public.ai_questions for delete
  using (public.is_admin());

-- ────────────────────────────  Тайлан  ────────────────────────────

-- Багш нарт: «юуг нэмэх шаардлагатай вэ» жагсаалт
create or replace function public.ai_content_gaps(p_limit integer default 50)
returns table (
  question    text,
  times_asked bigint,
  last_asked  timestamptz,
  avg_score   numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    lower(trim(q.question)) as question,
    count(*)                as times_asked,
    max(q.created_at)       as last_asked,
    round(avg(q.top_score), 1) as avg_score
  from public.ai_questions q
  where not q.matched or q.rating = -1
  group by lower(trim(q.question))
  order by times_asked desc, last_asked desc
  limit p_limit;
$$;
