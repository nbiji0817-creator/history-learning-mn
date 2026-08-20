"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const terms = [
  {
    term: "Палеолит",
    category: "Монголын өвөг түүх",
    definition: "Хуучин чулуун зэвсгийн үе.",
    related: "Мезолит, неолит",
  },
  {
    term: "Мезолит",
    category: "Монголын өвөг түүх",
    definition: "Дунд чулуун зэвсгийн үе.",
    related: "Палеолит, неолит",
  },
  {
    term: "Неолитын хувьсгал",
    category: "Монголын өвөг түүх",
    definition:
      "Хүмүүс олзворлох, түүвэрлэх аж ахуйгаас үйлдвэрлэх аж ахуйд шилжсэн түүхэн үйл явц.",
    related: "Үйлдвэрлэх аж ахуй",
  },
  {
    term: "Үйлдвэрлэх аж ахуй",
    category: "Монголын өвөг түүх",
    definition:
      "Мал аж ахуй, газар тариалан зэрэг хүнсийг өөрсдөө үйлдвэрлэх аж ахуйн хэлбэр.",
    related: "Неолитын хувьсгал",
  },
  {
    term: "Нүүдлийн иргэншил",
    category: "Монголын өвөг түүх",
    definition:
      "Бэлчээрийн мал аж ахуйд тулгуурлан байгаль, улирлын нөхцөлд зохицон нүүдэллэн амьдрах иргэншлийн хэлбэр.",
    related: "Нүүдлийн мал аж ахуй",
  },
  {
    term: "Хиргисүүр",
    category: "Монголын өвөг түүх",
    definition:
      "Хүрэл болон түрүү төмрийн үед холбогдох Монгол нутгийн археологийн дурсгал.",
    related: "Археологи",
  },
  {
    term: "Хүннү",
    category: "Эртний улсууд",
    definition:
      "Монгол нутгийн эртний хүчирхэг нүүдэлчдийн төр улс.",
    related: "Шаньюй",
  },
  {
    term: "Шаньюй",
    category: "Эртний улсууд",
    definition:
      "Хүннүгийн төрийн дээд эрх баригчийн цол.",
    related: "Хүннү",
  },
  {
    term: "Сяньби",
    category: "Эртний улсууд",
    definition:
      "Хүннүгийн дараах үед Монгол, Төв Азийн орчимд хүчирхэгжсэн нүүдэлчдийн улс төрийн нэгдэл.",
    related: "Хүннү",
  },
  {
    term: "Археологийн сурвалж",
    category: "Эртний улсууд",
    definition:
      "Өнгөрсөн үеийн хүмүүсийн үлдээсэн эд өлгийн болон материаллаг дурсгал.",
    related: "Хиргисүүр",
  },
  {
    term: "Тэмүжин",
    category: "Монголын эзэнт гүрэн",
    definition:
      "Монгол аймгуудыг нэгтгэх үйл явцыг удирдсан бөгөөд 1206 онд Чингис хаанаар өргөмжлөгдсөн түүхэн хүн.",
    related: "Чингис хаан",
  },
  {
    term: "Чингис хаан",
    category: "Монголын эзэнт гүрэн",
    definition:
      "Их Монгол улсын үндэслэгч, Монголын нэгдсэн төрийн хаан.",
    related: "Их Монгол улс",
  },
  {
    term: "Их хуралдай",
    category: "Монголын эзэнт гүрэн",
    definition:
      "Төрийн чухал асуудлыг хэлэлцэн шийдвэрлэх язгууртнуудын их зөвлөлгөөн.",
    related: "Чингис хаан",
  },
  {
    term: "Их Монгол улс",
    category: "Монголын эзэнт гүрэн",
    definition:
      "1206 онд байгуулагдсан Монголын нэгдсэн төр улс.",
    related: "Чингис хаан",
  },
  {
    term: "Өртөө",
    category: "Монголын эзэнт гүрэн",
    definition:
      "Албан мэдээ, хүн, барааг өргөн уудам нутагт шуурхай дамжуулахад ашигласан замын зохион байгуулалтын тогтолцоо.",
    related: "Монголын эзэнт гүрэн",
  },
  {
    term: "Эзэнт гүрэн",
    category: "Монголын эзэнт гүрэн",
    definition:
      "Олон улс, нутаг дэвсгэрийг хамарсан өргөн хүрээний төрийн байгуулал.",
    related: "Их Монгол улс",
  },
  {
    term: "Юань улс",
    category: "Монголын эзэнт гүрэн",
    definition:
      "Хубилай хааны байгуулсан, Хятадын нутагт төвлөрсөн Монголын хаант улс.",
    related: "Хубилай хаан",
  },
  {
    term: "Алтан ордон",
    category: "Монголын эзэнт гүрэн",
    definition:
      "Монголын эзэнт гүрний баруун хойд хэсэгт тогтсон улс.",
    related: "Монголын эзэнт гүрэн",
  },
  {
    term: "Цагадайн улс",
    category: "Монголын эзэнт гүрэн",
    definition:
      "Төв Азийн нутагт тогтсон Монголын эзэнт гүрний бүрэлдэхүүн улс.",
    related: "Монголын эзэнт гүрэн",
  },
  {
    term: "Ил хаант улс",
    category: "Монголын эзэнт гүрэн",
    definition:
      "Иран болон ойролцоох нутагт тогтсон Монголын эзэнт гүрний бүрэлдэхүүн улс.",
    related: "Монголын эзэнт гүрэн",
  },
  {
    term: "Умард Юань",
    category: "Эзэнт гүрний дараах Монгол",
    definition:
      "Юань улс Хятадад ноёрхлоо алдсаны дараа Монгол нутагт үргэлжилсэн улс төрийн уламжлал.",
    related: "Юань улс",
  },
  {
    term: "Ойрад",
    category: "Эзэнт гүрний дараах Монгол",
    definition:
      "Монголын баруун хэсэгт хүчирхэгжсэн монгол угсааны улс төрийн нэгдэл.",
    related: "Халх",
  },
  {
    term: "Халх",
    category: "Эзэнт гүрний дараах Монгол",
    definition:
      "Монголын төв болон зүүн хойд хэсэгт бүрэлдсэн томоохон монголын улс төр, нийгмийн нэгдэл.",
    related: "Ойрад",
  },
  {
    term: "Нүүдлийн мал аж ахуй",
    category: "Эзэнт гүрний дараах Монгол",
    definition:
      "Улирлын бэлчээрийг даган малаа нүүлгэн маллах аж ахуйн хэлбэр.",
    related: "Нүүдлийн иргэншил",
  },
  {
    term: "Монгол бичиг",
    category: "Эзэнт гүрний дараах Монгол",
    definition:
      "Монгол хэлэнд уламжлал болгон хэрэглэж ирсэн босоо бичгийн тогтолцоо.",
    related: "Монголын соёл",
  },
];

const categories = [
  "Бүгд",
  "Монголын өвөг түүх",
  "Эртний улсууд",
  "Монголын эзэнт гүрэн",
  "Эзэнт гүрний дараах Монгол",
];

export default function DictionaryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Бүгд");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return terms.filter((item) => {
      const matchesCategory =
        category === "Бүгд" || item.category === category;

      const matchesSearch =
        !keyword ||
        item.term.toLowerCase().includes(keyword) ||
        item.definition.toLowerCase().includes(keyword) ||
        item.related.toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const selected = terms.find(
    (item) => item.term === selectedTerm
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
              10-р анги · Монголын түүх
            </p>

            <h1 className="mt-1 text-xl font-black">
              🔑 Нэр томьёоны толь
            </h1>
          </div>

          <Link
            href="/10"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold hover:bg-white/10"
          >
            ← 10-р анги
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
              ТҮЛХҮҮР ОЙЛГОЛТУУД
            </p>

            <h2 className="mt-3 text-4xl font-black sm:text-5xl">
              Түүхийн нэр томьёоны толь
            </h2>

            <p className="mt-4 leading-8 text-slate-400">
              10-р ангийн Монголын түүхийн хичээлд хэрэглэгдэх
              гол нэр томьёог хайж, ангиллаар нь судлаарай.
            </p>
          </div>

          {/* SEARCH */}
          <div className="mt-8">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">
                🔎
              </span>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Нэр томьёо хайх..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-5 pl-14 pr-5 text-lg outline-none transition placeholder:text-slate-600 focus:border-amber-400/50"
              />
            </div>
          </div>

          {/* CATEGORIES */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold transition ${
                  category === item
                    ? "bg-amber-400 text-slate-950"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-black">
            Нэр томьёо
          </h3>

          <span className="rounded-full bg-white/5 px-4 py-2 text-sm font-bold text-slate-400">
            {filteredTerms.length} нэр томьёо
          </span>
        </div>

        {filteredTerms.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-12 text-center">
            <div className="text-6xl">🔍</div>

            <h3 className="mt-5 text-2xl font-black">
              Илэрц олдсонгүй
            </h3>

            <p className="mt-2 text-slate-500">
              Өөр нэр томьёо хайж үзээрэй.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTerms.map((item) => (
              <button
                key={item.term}
                onClick={() => setSelectedTerm(item.term)}
                className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-left transition hover:-translate-y-1 hover:border-amber-400/30 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-xl">
                    🔑
                  </div>

                  <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold text-slate-500">
                    {item.category}
                  </span>
                </div>

                <h4 className="mt-5 text-xl font-black group-hover:text-amber-400">
                  {item.term}
                </h4>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                  {item.definition}
                </p>

                <div className="mt-5 border-t border-white/10 pt-4 text-xs font-bold text-slate-600">
                  Дэлгэрэнгүй харах →
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* MODAL */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
          onClick={() => setSelectedTerm(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-7 shadow-2xl sm:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <span className="rounded-full bg-amber-400/10 px-4 py-2 text-xs font-black text-amber-400">
                  {selected.category}
                </span>

                <h2 className="mt-5 text-3xl font-black">
                  {selected.term}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTerm(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl hover:bg-white/10"
              >
                ×
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <p className="text-xs font-black uppercase tracking-widest text-slate-600">
                ТАЙЛБАР
              </p>

              <p className="mt-3 text-lg leading-8 text-slate-300">
                {selected.definition}
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-amber-400/5 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                ХОЛБООТОЙ ОЙЛГОЛТ
              </p>

              <p className="mt-2 font-bold text-slate-300">
                {selected.related}
              </p>
            </div>

            <button
              onClick={() => setSelectedTerm(null)}
              className="mt-6 w-full rounded-2xl bg-amber-400 px-6 py-4 font-black text-slate-950"
            >
              Ойлголоо
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-8 text-center text-sm text-slate-600">
          10-р анги · Монголын түүх · Нэр томьёоны толь
        </div>
      </footer>
    </main>
  );
}