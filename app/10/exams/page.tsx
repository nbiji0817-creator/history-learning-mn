"use client";

import Link from "next/link";
import { useState } from "react";

type Question = {
  id: number;
  lesson: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const questions: Question[] = [
  {
    id: 1,
    lesson: 1,
    question: "Палеолит гэж ямар үеийг хэлдэг вэ?",
    options: [
      "Шинэ чулуун зэвсгийн үе",
      "Хуучин чулуун зэвсгийн үе",
      "Хүрлийн үе",
      "Төмрийн үе",
    ],
    answer: 1,
    explanation: "Палеолит нь хуучин чулуун зэвсгийн үе юм.",
  },
  {
    id: 2,
    lesson: 1,
    question: "Эртний хүмүүсийн амьдралын үндсэн хэлбэр аль нь вэ?",
    options: [
      "Үйлдвэрийн үйлдвэрлэл",
      "Худалдаа",
      "Олзворлох, түүвэрлэх аж ахуй",
      "Газар тариалан",
    ],
    answer: 2,
    explanation: "Эртний хүмүүс байгалиас бэлэн нөөцийг олзворлон амьдарч байв.",
  },
  {
    id: 3,
    lesson: 2,
    question: "Неолитын хувьсгалын гол үр дүн юу вэ?",
    options: [
      "Төмөр боловсруулах үүссэн",
      "Үйлдвэрлэх аж ахуй үүссэн",
      "Бичиг үсэг устсан",
      "Хот суурин үгүй болсон",
    ],
    answer: 1,
    explanation: "Неолитын үед хүмүүс мал аж ахуй, тариалан эрхэлж үйлдвэрлэх аж ахуйд шилжсэн.",
  },
  {
    id: 4,
    lesson: 2,
    question: "Үйлдвэрлэх аж ахуйн үндсэн хэлбэрүүд аль нь вэ?",
    options: [
      "Ан агнуур ба түүвэрлэлт",
      "Мал аж ахуй ба тариалан",
      "Загасчлал ба ан агнуур",
      "Худалдаа ба гар урлал",
    ],
    answer: 1,
    explanation: "Мал аж ахуй, газар тариалан нь үйлдвэрлэх аж ахуйн гол хэлбэрүүд юм.",
  },
  {
    id: 5,
    lesson: 3,
    question: "Нүүдлийн мал аж ахуй үүсэхэд чухал нөлөө үзүүлсэн хүчин зүйл аль нь вэ?",
    options: [
      "Уур амьсгалын хуурайшилт",
      "Далайн түвшин нэмэгдсэн",
      "Хотжилт",
      "Үйлдвэржилт",
    ],
    answer: 0,
    explanation: "Монгол нутгийн уур амьсгал хуурайшиж, бэлчээрийн мал аж ахуйд зохицох нөхцөл бүрдсэн.",
  },
  {
    id: 6,
    lesson: 3,
    question: "Хүрэл гэж юу вэ?",
    options: [
      "Төмөр ба нүүрсний холимог",
      "Зэс ба цагаан тугалгын хайлш",
      "Алт ба мөнгөний хайлш",
      "Чулууны төрөл",
    ],
    answer: 1,
    explanation: "Хүрэл нь гол төлөв зэс, цагаан тугалгын хайлш юм.",
  },
  {
    id: 7,
    lesson: 4,
    question: "Хүннү гүрэн ямар иргэншлийн хөгжилтэй холбоотой вэ?",
    options: [
      "Нүүдлийн иргэншил",
      "Далайн иргэншил",
      "Аж үйлдвэрийн иргэншил",
      "Колонийн иргэншил",
    ],
    answer: 0,
    explanation: "Хүннү нь Монгол нутгийн нүүдлийн иргэншлийн хөгжлийн чухал төлөөлөл юм.",
  },
  {
    id: 8,
    lesson: 4,
    question: "Хүннүгийн төрийн дээд эрх баригчийн цол юу вэ?",
    options: [
      "Хаан",
      "Султан",
      "Шаньюй",
      "Фараон",
    ],
    answer: 2,
    explanation: "Хүннүгийн төрийн дээд эрх баригчийг шаньюй гэж нэрлэдэг.",
  },
  {
    id: 9,
    lesson: 5,
    question: "Хүннүгийн дараа Монгол нутагт хүчирхэгжсэн улс төрийн нэгдлийн нэг аль нь вэ?",
    options: [
      "Сяньби",
      "Ром",
      "Египет",
      "Грек",
    ],
    answer: 0,
    explanation: "Хүннүгийн дараах үед Сяньби зэрэг нүүдэлчдийн улс төрийн нэгдлүүд хүчирхэгжсэн.",
  },
  {
    id: 10,
    lesson: 6,
    question: "Эртний нүүдэлчдийн үндсэн аж ахуй юу байсан бэ?",
    options: [
      "Далайн худалдаа",
      "Мал аж ахуй",
      "Үйлдвэрлэл",
      "Уул уурхай",
    ],
    answer: 1,
    explanation: "Нүүдлийн мал аж ахуй эртний нүүдэлчдийн эдийн засгийн үндэс байв.",
  },
  {
    id: 11,
    lesson: 6,
    question: "Төмөр боловсруулах технологийн хөгжил ямар салбарт онцгой нөлөөтэй байсан бэ?",
    options: [
      "Цэргийн зэвсэглэл",
      "Далайн аялал",
      "Хэвлэл",
      "Цахилгаан үйлдвэрлэл",
    ],
    answer: 0,
    explanation: "Төмөр боловсруулах нь багаж, зэр зэвсэг үйлдвэрлэх боломжийг нэмэгдүүлсэн.",
  },
  {
    id: 12,
    lesson: 7,
    question: "Эртний улсуудын соёлыг судлахад аль нь чухал эх сурвалж вэ?",
    options: [
      "Археологийн дурсгал",
      "Орчин үеийн кино",
      "Сошиал медиа",
      "Телевизийн нэвтрүүлэг",
    ],
    answer: 0,
    explanation: "Археологийн олдвор, булш, хадны зураг зэрэг нь эртний соёлыг судлах чухал эх сурвалж юм.",
  },
  {
    id: 13,
    lesson: 8,
    question: "Чингис хаанаас өмнөх Монголын улс төрийн нөхцөл ямар байсан бэ?",
    options: [
      "Бүх монголчууд нэг төвлөрсөн улсад байсан",
      "Олон аймаг, овог улс төрийн хувьд хуваагдсан байсан",
      "Монгол нутаг эзгүй байсан",
      "Зөвхөн нэг хот оршин байсан",
    ],
    answer: 1,
    explanation: "XII зуунд Монголын тал нутагт олон аймаг, овог, улс төрийн нэгдлүүд оршиж байв.",
  },
  {
    id: 14,
    lesson: 9,
    question: "1206 онд ямар түүхэн үйл явдал болсон бэ?",
    options: [
      "Хүннү улс байгуулагдсан",
      "Тэмүжин Чингис хаанаар өргөмжлөгдсөн",
      "Юань улс мөхсөн",
      "Манж улс байгуулагдсан",
    ],
    answer: 1,
    explanation: "1206 оны Их хуралдайгаар Тэмүжинг Чингис хаанд өргөмжилсөн.",
  },
  {
    id: 15,
    lesson: 9,
    question: "Их Монгол улс хэзээ байгуулагдсан бэ?",
    options: [
      "1206 он",
      "1162 он",
      "1227 он",
      "1260 он",
    ],
    answer: 0,
    explanation: "1206 онд Их Монгол улс байгуулагдсан.",
  },
  {
    id: 16,
    lesson: 10,
    question: "Чингис хааны нэг чухал түүхэн үүрэг аль нь вэ?",
    options: [
      "Монгол аймгуудыг нэгтгэсэн",
      "Монголын бичгийг устгасан",
      "Нүүдлийн аж ахуйг хориглосон",
      "Худалдааг зогсоосон",
    ],
    answer: 0,
    explanation:
      "Чингис хаан тархай бутархай байдлыг эцэслэн Их Монгол улсыг байгуулсан нь Монголын түүхэн дэх чухал үйл явдал юм.",
  },
  {
    id: 17,
    lesson: 10,
    question: "Чингис хаан овог, аймгийн хуучин тогтолцоог халж ямар зохион байгуулалт бий болгосон бэ?",
    options: [
      "Мянгатын систем",
      "Аравтын худалдааны систем",
      "Хотын систем",
      "Далайн систем",
    ],
    answer: 0,
    explanation: "Чингис хаан мянгатын зохион байгуулалтыг бий болгосон.",
  },
  {
    id: 18,
    lesson: 11,
    question: "Чингис хааны дараа Их Монгол улсын их хаан болсон хүн хэн бэ?",
    options: [
      "Хубилай",
      "Өгэдэй",
      "Мөнх",
      "Бат",
    ],
    answer: 1,
    explanation: "Чингис хааны дараа Өгэдэй их хаан болсон.",
  },
  {
    id: 19,
    lesson: 11,
    question: "Өртөөний тогтолцооны гол зориулалт юу байсан бэ?",
    options: [
      "Зөвхөн мал маллах",
      "Мэдээ, хүн, бараа тээвэрлэх",
      "Газар тариалах",
      "Хот нураах",
    ],
    answer: 1,
    explanation: "Өртөө нь өргөн уудам нутагт мэдээ, хүмүүс болон барааг шуурхай дамжуулахад ашиглагдсан.",
  },
  {
    id: 20,
    lesson: 12,
    question: "Монголын эзэнт гүрний бүрэлдэхүүнд оршиж байсан улсуудын нэг аль нь вэ?",
    options: [
      "Ил хаант улс",
      "Ромын эзэнт улс",
      "Египетийн шинэ улс",
      "Македоны улс",
    ],
    answer: 0,
    explanation: "Юань, Алтан ордон, Цагадайн улс, Ил хаант улс нь Монголын эзэнт гүрний бүрэлдэхүүнд бий болсон томоохон улс төрийн төвүүд юм.",
  },
  {
    id: 21,
    lesson: 12,
    question: "Юань улс аль нутагт төвлөрч байсан бэ?",
    options: [
      "Хятадын нутаг",
      "Европ",
      "Африк",
      "Энэтхэгийн өмнөд хэсэг",
    ],
    answer: 0,
    explanation: "Юань улс Хятадад төвлөрсөн Монголын хаант улс байв.",
  },
  {
    id: 22,
    lesson: 12,
    question: "Ил хаант улс аль бүс нутагт төвлөрч байсан бэ?",
    options: [
      "Иран болон ойролцоох нутаг",
      "Япон",
      "Скандинав",
      "Өмнөд Америк",
    ],
    answer: 0,
    explanation: "Ил хаант улс Иран болон ойролцоох бүс нутагт төвлөрсөн.",
  },
  {
    id: 23,
    lesson: 13,
    question: "Юань улс Хятадад ноёрхлоо алдсаны дараа Монголын улс төрийн төв хаашаа шилжсэн бэ?",
    options: [
      "Европ руу",
      "Монголын эх нутаг руу",
      "Африк руу",
      "Япон руу",
    ],
    answer: 1,
    explanation: "Монголын улс төрийн төв эх нутагтаа дахин төвлөрсөн.",
  },
  {
    id: 24,
    lesson: 13,
    question: "Умард Юань гэж юуг хэлдэг вэ?",
    options: [
      "Монгол нутагт үргэлжилсэн Юанийн улс төрийн уламжлал",
      "Хятадын өмнөд улс",
      "Европын улс",
      "Төвдийн улс",
    ],
    answer: 0,
    explanation: "Юань Хятадад ноёрхлоо алдсаны дараа Монгол нутагт улс төрийн уламжлал нь үргэлжилсэн.",
  },
  {
    id: 25,
    lesson: 14,
    question: "Ойрадын улс төрийн хүч Монголын аль хэсэгт илүү хүчтэй байсан бэ?",
    options: [
      "Баруун хэсэгт",
      "Зүүн өмнөд хэсэгт",
      "Зөвхөн Хятадад",
      "Европт",
    ],
    answer: 0,
    explanation: "Ойрадын улс төрийн нэгдэл Монголын баруун хэсэгт хүчирхэгжсэн.",
  },
  {
    id: 26,
    lesson: 14,
    question: "Халх Монголын улс төрийн хөгжил аль үед чухал байр суурь эзэлсэн бэ?",
    options: [
      "XIV–XVII зуунд",
      "НТӨ IV зуунд л",
      "XXI зуунд",
      "Эртний Египетийн үед",
    ],
    answer: 0,
    explanation: "XIV–XVII зууны Монголын улс төрийн түүхэнд Халх, Ойрад зэрэг нэгдлүүд чухал байр суурь эзэлсэн.",
  },
  {
    id: 27,
    lesson: 15,
    question: "XIV–XVII зууны Монголын үндсэн аж ахуй юу байсан бэ?",
    options: [
      "Нүүдлийн мал аж ахуй",
      "Аж үйлдвэрийн үйлдвэрлэл",
      "Далайн загасчлал",
      "Автомашины үйлдвэрлэл",
    ],
    answer: 0,
    explanation: "Нүүдлийн мал аж ахуй Монголын үндсэн аж ахуй хэвээр байсан.",
  },
  {
    id: 28,
    lesson: 15,
    question: "Монголын уламжлалт бичгийн нэг аль нь вэ?",
    options: [
      "Монгол бичиг",
      "Латин үсэг л",
      "Иероглиф л",
      "Руны латин үсэг",
    ],
    answer: 0,
    explanation: "Монгол бичиг нь монголчуудын уламжлалт бичгийн тогтолцооны нэг юм.",
  },
  {
    id: 29,
    lesson: 15,
    question: "Монголын түүх, соёлыг судлахад аль нь чухал вэ?",
    options: [
      "Соёлын өв, дурсгал",
      "Зөвхөн орчин үеийн зураг",
      "Зөвхөн кино",
      "Зөвхөн аман яриа",
    ],
    answer: 0,
    explanation: "Соёлын өв, археологийн болон бичгийн дурсгалууд түүхийг судлах чухал эх сурвалж болдог.",
  },
  {
    id: 30,
    lesson: 9,
    question: "Их Монгол улс байгуулагдсанаар ямар гол өөрчлөлт гарсан бэ?",
    options: [
      "Монгол аймгууд нэг төрийн дор нэгдсэн",
      "Монголын бүх нутаг эзгүй болсон",
      "Мал аж ахуй устсан",
      "Худалдаа бүрэн зогссон",
    ],
    answer: 0,
    explanation:
      "Их Монгол улс байгуулагдсанаар олон монгол аймаг нэг төрийн дор нэгдсэн.",
  },
];

export default function ExamsPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [finished, setFinished] = useState(false);

  const question = questions[current];

  const chooseAnswer = (index: number) => {
    if (selected !== null) return;

    setSelected(index);

    const newAnswers = [...answers];
    newAnswers[current] = index;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (selected === null) return;

    if (current === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrent(current + 1);
    setSelected(answers[current + 1]);
  };

  const previousQuestion = () => {
    if (current === 0) return;

    setCurrent(current - 1);
    setSelected(answers[current - 1]);
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers(Array(questions.length).fill(null));
    setFinished(false);
  };

  const score = answers.reduce<number>((total, answer, index) => {
    return total + (answer === questions[index].answer ? 1 : 0);
  }, 0);

  const percent = Math.round((score / questions.length) * 100);

  const getResult = () => {
    if (percent >= 90) {
      return {
        emoji: "🏆",
        title: "Онц",
        text: "Түүхийн мэдлэг маш сайн байна!",
      };
    }

    if (percent >= 80) {
      return {
        emoji: "🌟",
        title: "Сайн",
        text: "Мэдлэгийн түвшин сайн байна.",
      };
    }

    if (percent >= 60) {
      return {
        emoji: "👍",
        title: "Дунд",
        text: "Зарим сэдвээ дахин давтаарай.",
      };
    }

    return {
      emoji: "📚",
      title: "Дахин судлая",
      text: "Хичээлүүдээ дахин уншаад тестээ давтаарай.",
    };
  };

  if (finished) {
    const result = getResult();

    return (
      <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/10"
            className="inline-block rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold hover:bg-white/10"
          >
            ← 10-р анги
          </Link>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center sm:p-12">
            <div className="text-7xl">{result.emoji}</div>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.3em] text-amber-400">
              Тест дууслаа
            </p>

            <h1 className="mt-3 text-4xl font-black">
              {result.title}
            </h1>

            <p className="mt-3 text-slate-400">
              {result.text}
            </p>

            <div className="mx-auto mt-10 flex h-48 w-48 items-center justify-center rounded-full border-8 border-amber-400 bg-slate-900">
              <div>
                <div className="text-5xl font-black">
                  {percent}%
                </div>

                <div className="mt-1 text-sm text-slate-400">
                  {score}/{questions.length}
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-green-400/10 p-5">
                <div className="text-3xl font-black text-green-400">
                  {score}
                </div>

                <div className="mt-1 text-sm text-slate-400">
                  Зөв
                </div>
              </div>

              <div className="rounded-2xl bg-red-400/10 p-5">
                <div className="text-3xl font-black text-red-400">
                  {questions.length - score}
                </div>

                <div className="mt-1 text-sm text-slate-400">
                  Буруу
                </div>
              </div>

              <div className="rounded-2xl bg-amber-400/10 p-5">
                <div className="text-3xl font-black text-amber-400">
                  {questions.length}
                </div>

                <div className="mt-1 text-sm text-slate-400">
                  Нийт
                </div>
              </div>
            </div>

            <button
              onClick={restart}
              className="mt-10 rounded-2xl bg-amber-400 px-8 py-4 font-black text-slate-950 hover:scale-105"
            >
              🔄 Дахин өгөх
            </button>
          </div>
        </div>
      </main>
    );
  }

  const answeredCount = answers.filter(
    (answer) => answer !== null
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto max-w-5xl px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                10-р анги · Монголын түүх
              </p>

              <h1 className="mt-1 text-xl font-black">
                🧠 Өөрийгөө шалгая
              </h1>
            </div>

            <Link
              href="/10"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold"
            >
              ← Буцах
            </Link>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs font-bold text-slate-400">
              <span>
                Асуулт {current + 1} / {questions.length}
              </span>

              <span>
                {answeredCount}/{questions.length}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-amber-400 transition-all"
                style={{
                  width: `${((current + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* QUESTION */}
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-amber-400/10 px-4 py-2 text-xs font-black text-amber-400">
            СЭДЭВ {question.lesson}
          </span>

          <span className="rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-slate-400">
            Асуулт {question.id}
          </span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 sm:p-10">
          <h2 className="text-2xl font-black leading-relaxed sm:text-3xl">
            {question.question}
          </h2>

          <div className="mt-8 grid gap-4">
            {question.options.map((option, index) => {
              const isSelected = selected === index;
              const isCorrect = index === question.answer;

              let style =
                "border-white/10 bg-slate-900 hover:border-amber-400/50 hover:bg-white/5";

              if (selected !== null && isCorrect) {
                style =
                  "border-green-400 bg-green-400/10 text-green-300";
              }

              if (
                selected === index &&
                index !== question.answer
              ) {
                style =
                  "border-red-400 bg-red-400/10 text-red-300";
              }

              return (
                <button
                  key={option}
                  onClick={() => chooseAnswer(index)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left font-bold transition ${style}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="flex-1">
                    {option}
                  </span>

                  {selected !== null && isCorrect && (
                    <span className="text-xl">✓</span>
                  )}

                  {isSelected &&
                    index !== question.answer && (
                      <span className="text-xl">✗</span>
                    )}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div
              className={`mt-6 rounded-2xl p-5 ${
                selected === question.answer
                  ? "bg-green-400/10"
                  : "bg-red-400/10"
              }`}
            >
              <p className="font-black">
                {selected === question.answer
                  ? "✅ Зөв хариулт!"
                  : "❌ Буруу хариулт"}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {question.explanation}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              onClick={previousQuestion}
              disabled={current === 0}
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Өмнөх
            </button>

            <button
              onClick={nextQuestion}
              disabled={selected === null}
              className="rounded-2xl bg-amber-400 px-8 py-4 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {current === questions.length - 1
                ? "Тест дуусгах ✓"
                : "Дараагийн →"}
            </button>
          </div>
        </div>

        {/* QUESTION NUMBERS */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <p className="mb-4 text-sm font-black text-slate-400">
            Асуултууд
          </p>

          <div className="flex flex-wrap gap-2">
            {questions.map((q, index) => {
              const answer = answers[index];

              let style =
                "bg-white/5 text-slate-400 hover:bg-white/10";

              if (index === current) {
                style = "bg-amber-400 text-slate-950";
              } else if (answer !== null) {
                style =
                  answer === q.answer
                    ? "bg-green-400/20 text-green-400"
                    : "bg-red-400/20 text-red-400";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrent(index);
                    setSelected(answers[index]);
                  }}
                  className={`h-10 w-10 rounded-xl text-sm font-black ${style}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}