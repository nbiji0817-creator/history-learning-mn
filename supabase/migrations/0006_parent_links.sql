-- ============================================================================
--  0006 — ЭЦЭГ ЭХ ↔ СУРАГЧИЙН ХОЛБОО
-- ============================================================================
--
--  Асуудал: эцэг эх хүүхдээ хайж олох ёстой, гэтэл RLS нь өөр хүний
--  профайлыг УНШУУЛДАГГҮЙ (зөв). Тиймээс имэйлээр хайх ажлыг
--  SECURITY DEFINER функцээр гүйцэтгэнэ.
--
--  АЮУЛГҮЙ БАЙДЛЫН ЗАРЧИМ:
--    • Функц нь профайлын мэдээллийг БУЦААХГҮЙ — зөвхөн холбоо үүсгэнэ.
--      Ингэснээр «имэйл байгаа эсэхийг» шалгах хэрэгсэл болохгүй:
--      олдсон ч, олдоогүй ч ижил хариу өгнө.
--    • Холбоо нь `confirmed = false` төлөвтэй үүснэ. СУРАГЧ өөрөө
--      зөвшөөрөх хүртэл эцэг эх ЮУ Ч ХАРАХГҮЙ (is_my_child нь
--      `confirmed` шаарддаг).
--    • Зөвхөн `parent` эрхтэй хүн хүсэлт үүсгэнэ.
--
--  Дахин ажиллуулж болно (create or replace).
-- ============================================================================

-- ────────────────────  1. Эцэг эх хүсэлт илгээнэ  ────────────────────

create or replace function public.request_parent_link(p_student_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student uuid;
  v_role    user_role;
begin
  select public.my_role() into v_role;

  if v_role <> 'parent' then
    return 'not_parent';
  end if;

  select id into v_student
  from public.profiles
  where lower(email) = lower(trim(p_student_email))
    and role = 'student'
  limit 1;

  -- Олдсон эсэхийг ИЛЧЛЭХГҮЙ: аль ч тохиолдолд «илгээлээ» гэж хариулна.
  -- Ингэснээр энэ функц имэйл шалгагч болж ашиглагдахгүй.
  if v_student is null then
    return 'sent';
  end if;

  if v_student = auth.uid() then
    return 'self';
  end if;

  insert into public.parent_links (parent_id, student_id, confirmed)
  values (auth.uid(), v_student, false)
  on conflict (parent_id, student_id) do nothing;

  return 'sent';
end;
$$;

comment on function public.request_parent_link is
  'Эцэг эх хүүхдийнхээ имэйлээр холбох хүсэлт үүсгэнэ. Сурагч батална.';

-- ────────────────────  2. Холбоонуудаа жагсаана  ────────────────────
--
--  Хоёр талд ажиллана:
--    • Эцэг эх дуудвал → хүүхдүүдээ харна
--    • Сурагч дуудвал  → хүсэлт илгээсэн эцэг эхээ харна
--
--  Зөвхөн ӨӨРТЭЙ НЬ ХОЛБООТОЙ мөрийг буцаана.

create or replace function public.list_parent_links()
returns table (
  counterpart_id uuid,
  name           text,
  avatar         text,
  email          text,
  grade          smallint,
  confirmed      boolean,
  direction      text,
  created_at     timestamptz
)
language sql
security definer
set search_path = public
as $$
  -- Эцэг эхийн харагдац: хүүхдүүд
  select
    p.id, p.name, p.avatar, p.email, p.grade,
    l.confirmed, 'child'::text, l.created_at
  from public.parent_links l
  join public.profiles p on p.id = l.student_id
  where l.parent_id = auth.uid()

  union all

  -- Сурагчийн харагдац: эцэг эх
  select
    p.id, p.name, p.avatar, p.email, null::smallint,
    l.confirmed, 'parent'::text, l.created_at
  from public.parent_links l
  join public.profiles p on p.id = l.parent_id
  where l.student_id = auth.uid()

  order by created_at desc;
$$;

comment on function public.list_parent_links is
  'Өөрийн эцэг эх / хүүхдийн холбоог жагсаана. Бусдынхыг харуулахгүй.';

-- ────────────────────  3. Сурагч холбоог батална  ────────────────────

create or replace function public.confirm_parent_link(p_parent uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.parent_links
  set confirmed = true
  where parent_id = p_parent
    and student_id = auth.uid();   -- ЗӨВХӨН өөрийн холбоог

  return found;
end;
$$;

comment on function public.confirm_parent_link is
  'Сурагч эцэг эхийн хүсэлтийг зөвшөөрнө. Үүнээс өмнө эцэг эх юу ч харахгүй.';

-- ────────────────────  4. Холбоог цуцлана  ────────────────────
--
--  Хоёр тал хэзээ ч цуцалж болно. `p_other` нь нөгөө талын id.

create or replace function public.remove_parent_link(p_other uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.parent_links
  where (parent_id = auth.uid() and student_id = p_other)
     or (student_id = auth.uid() and parent_id = p_other);

  return found;
end;
$$;

comment on function public.remove_parent_link is
  'Эцэг эх эсвэл сурагч холбоогоо цуцална.';

-- ────────────────────  Эрх олгох  ────────────────────

revoke all on function public.request_parent_link(text) from public, anon;
revoke all on function public.list_parent_links()      from public, anon;
revoke all on function public.confirm_parent_link(uuid) from public, anon;
revoke all on function public.remove_parent_link(uuid)  from public, anon;

grant execute on function public.request_parent_link(text)  to authenticated;
grant execute on function public.list_parent_links()        to authenticated;
grant execute on function public.confirm_parent_link(uuid)  to authenticated;
grant execute on function public.remove_parent_link(uuid)   to authenticated;
