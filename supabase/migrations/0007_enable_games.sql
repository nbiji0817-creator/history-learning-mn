-- ============================================================================
--  0007 — «Газрын зураг таах» ба «Түүхэн үг хайх» тоглоомыг нээх
-- ============================================================================
--
--  Энэ хоёр тоглоом эхнээсээ бүртгэгдсэн боловч `playable = false` буюу
--  «удахгүй» төлөвтэй байсан. Одоо хоёуланг нь бодитоор хэрэгжүүлсэн тул
--  нээж байна.
--
--  Дахин ажиллуулж болно.
-- ============================================================================

update public.games
set playable = true
where slug in ('map-challenge', 'word-search');

-- Хэрэв ямар нэг шалтгаанаар мөр байхгүй бол шинээр нэмнэ
insert into public.games (slug, kind, title, description, icon, grades, difficulty, playable, xp)
values
  (
    'map-challenge',
    'map_challenge',
    'Газрын зураг таах',
    'Түүхэн хот, тулалдааны талбарыг газрын зураг дээр зөв байрлуул.',
    '🗺️',
    '{7,8,9,10}',
    'medium',
    true,
    35
  ),
  (
    'word-search',
    'word_search',
    'Түүхэн үг хайх',
    'Тор дотроос түүхэн нэр томьёог олж тэмдэглэ.',
    '🔤',
    '{6,7,8}',
    'easy',
    true,
    15
  )
on conflict (slug) do update
set playable = true,
    kind = excluded.kind,
    title = excluded.title,
    description = excluded.description,
    icon = excluded.icon,
    grades = excluded.grades,
    difficulty = excluded.difficulty,
    xp = excluded.xp;
