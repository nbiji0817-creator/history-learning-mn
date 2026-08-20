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
