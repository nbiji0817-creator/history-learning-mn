-- ============================================================================
-- 0005_embeddings.sql : Ойлголтын хайлт (semantic search)
--
-- ЯАГААД ХЭРЭГТЭЙ ВЭ?
--   Түлхүүр үгийн хайлт нь ижил үг ашигласан үед л ажилладаг.
--   «Монголчууд яагаад ийм олон газар эзэлсэн бэ?» гэсэн асуултад
--   «эзэнт гүрэн», «аян дайн» гэсэн үг байхгүй тул олдохгүй.
--
--   Embedding нь текстийн УТГЫГ тоон вектор болгодог. Ойролцоо утгатай
--   текстүүд ойролцоо вектортой байдаг тул өөр үгээр асуусан ч олдоно.
--
-- ЭНЭ НЬ ЗААВАЛ БИШ
--   Ажиллуулаагүй бол систем түлхүүр үгийн хайлтаар хэвийн ажиллана.
--   Embedding үүсгэхэд OPENAI_API_KEY шаардлагатай.
-- ============================================================================

create extension if not exists vector;

create table if not exists public.content_embeddings (
  -- «lesson:hunnu», «event:ev-1206» гэх мэт корпусын id
  doc_id      text primary key,
  kind        text not null,
  title       text not null,
  href        text not null,
  -- AI-д дамжуулах агуулга
  content     text not null,
  -- text-embedding-3-small → 1536 хэмжээст
  embedding   vector(1536),
  updated_at  timestamptz not null default now()
);

/*
 * HNSW индекс — ойролцоо хөршийн хайлтыг хурдасгана.
 * Косинусын зайг ашиглана (embedding нь нормчлогдсон).
 */
create index if not exists content_embeddings_vector_idx
  on public.content_embeddings
  using hnsw (embedding vector_cosine_ops);

create index if not exists content_embeddings_kind_idx
  on public.content_embeddings (kind);

alter table public.content_embeddings enable row level security;

-- Нийтийн контентын embedding — бүгд уншина
create policy "Embedding-ийг бүгд унших"
  on public.content_embeddings for select using (true);

-- Зөвхөн багш/админ шинэчилнэ (бодит бичилтийг service role хийнэ)
create policy "Багш embedding нэмэх"
  on public.content_embeddings for insert with check (public.is_staff());
create policy "Багш embedding засах"
  on public.content_embeddings for update
  using (public.is_staff()) with check (public.is_staff());
create policy "Багш embedding устгах"
  on public.content_embeddings for delete using (public.is_staff());

-- ────────────────────────────  Хайлтын функц  ────────────────────────────

/**
 * Утгаараа хамгийн ойр агуулгыг буцаана.
 *
 * `similarity` нь 0–1: 1 бол яг ижил утгатай.
 * 0.3-аас доош бол хамааралгүй гэж үзэхэд ойролцоо.
 */
create or replace function public.match_content(
  query_embedding vector(1536),
  match_count integer default 6,
  min_similarity double precision default 0.25
)
returns table (
  doc_id     text,
  kind       text,
  title      text,
  href       text,
  content    text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    e.doc_id,
    e.kind,
    e.title,
    e.href,
    e.content,
    1 - (e.embedding <=> query_embedding) as similarity
  from public.content_embeddings e
  where e.embedding is not null
    and 1 - (e.embedding <=> query_embedding) > min_similarity
  order by e.embedding <=> query_embedding
  limit match_count;
$$;

/** Хэдэн баримт индекслэгдсэнийг харах — админы самбарт. */
create or replace function public.embedding_status()
returns table (total bigint, last_updated timestamptz)
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::bigint, max(updated_at)
  from public.content_embeddings
  where embedding is not null;
$$;
