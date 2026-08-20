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
