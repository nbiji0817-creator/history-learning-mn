"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

type Lesson = {
  id: number;
  chapter: string;
  title: string;
  period: string;
  icon: string;
  questions: string[];
  summary: string;
  keyTerms: string[];
  dates: string[];
};

const lessons: Lesson[] = [
  {
    id: 1,
    chapter: "I бүлэг",
    title: "Монгол улс Манжийн эрхшээлд орсон нь",
    period: "XVII–XX зууны эхэн үе",
    icon: "🏯",
    questions: [
      "Монгол улс Манжийн эрхшээлд хэрхэн орсон бэ?",
      "Манжийн эрхшээлд ороход ямар хүчин зүйлс нөлөөлсөн бэ?",
      "Энэ үйл явдлын түүхэн үр дагавар юу байсан бэ?",
    ],
    summary:
      "XVII зуунд Монголын улс төрийн нэгдмэл байдал суларч, Манж Чин улс Монголын дотоод улс төрийн харилцаанд улам хүчтэй оролцох болсон. 1636 онд Өвөр Монголын 16 аймгийн ноёдын чуулган Мүгдэнд болж, Манжийн хааныг эзэн хаанаа хэмээн зөвшөөрсөн. Халх Монголын хувьд Манжтай харилцах, тусгаар байдлаа хадгалах асуудал удаан хугацаанд үргэлжилсэн.",
    keyTerms: ["Манж Чин улс", "Өвөр Монгол", "Халх Монгол", "Манжийн эрхшээл"],
    dates: ["1636 — Өвөр Монгол Манжийн эрхшээлд орсон", "XVII зуун — Халхын улс төрийн нөхцөл өөрчлөгдөв"],
  },
  {
    id: 2,
    chapter: "I бүлэг",
    title: "Халимаг, Буриад Монголыг Орос улс эзэрхсэн нь",
    period: "XVII–XX зууны эхэн үе",
    icon: "🗺️",
    questions: [
      "Оросын эзэнт гүрэн Халимаг, Буриад Монголд хэрхэн нөлөөгөө тогтоосон бэ?",
      "Энэ үйл явц Монголчуудын нутаг дэвсгэрт хэрхэн нөлөөлсөн бэ?",
      "Түүхэн үйл явдлыг газарзүйн зурагтай холбон тайлбарла.",
    ],
    summary:
      "Оросын эзэнт гүрний зүгээс Байгалын орчим, Буриадын нутаг болон Ижил мөрний Халимагийн нутагт нөлөөгөө тогтоох үйл явц өрнөв. Энэ нь Монгол угсаатны тархай бутархай байдал, нутаг дэвсгэрийн улс төрийн хуваагдалд нөлөөлсөн түүхэн үйл явцын нэг хэсэг юм.",
    keyTerms: ["Буриад Монгол", "Халимаг", "Оросын эзэнт гүрэн", "Нутаг дэвсгэр"],
    dates: ["XVII–XVIII зуун — Оросын эзэнт гүрний тэлэлт"],
  },
  {
    id: 3,
    chapter: "I бүлэг",
    title: "Монгол Улс тусгаар тогтнолоо алдсан шалтгаан",
    period: "XVII–XX зууны эхэн үе",
    icon: "⚔️",
    questions: [
      "Монголын тусгаар тогтнол суларсан дотоод шалтгаан юу байв?",
      "Гадаад хүчин зүйл ямар нөлөө үзүүлсэн бэ?",
      "Дотоод болон гадаад шалтгааныг харьцуул.",
    ],
    summary:
      "Монголын улс төрийн нэгдмэл байдал алдагдан, ханлигуудын хоорондын зөрчил, дотоодын задрал нэмэгдсэн нь тусгаар тогтнолоо хадгалахад хүндрэл учруулсан. Үүнийг Манж Чин улсын тэлэлт, Оросын эзэнт гүрний зүгээс Монголын нутагт үзүүлсэн нөлөө зэрэг гадаад нөхцөлтэй хамтатган авч үзнэ.",
    keyTerms: ["Тусгаар тогтнол", "Улс төрийн задрал", "Манж", "Орос"],
    dates: ["XVII зуун — Монголын улс төрийн задрал гүнзгийрэв"],
  },
  {
    id: 4,
    chapter: "I бүлэг",
    title: "Манжийн эрхшээлийн үеийн Монголын нийгэм, соёл",
    period: "Манжийн эрхшээлийн үе",
    icon: "📜",
    questions: [
      "Манжийн эрхшээлийн үед Монголын нийгмийн бүтэц ямар байсан бэ?",
      "Соёл, шашинд ямар өөрчлөлт гарсан бэ?",
      "Тухайн үеийн түүхийн дурсгалууд ямар ач холбогдолтой вэ?",
    ],
    summary:
      "Манжийн эрхшээлийн үед Монголын нийгмийн зохион байгуулалт, засаг захиргааны бүтэц өөрчлөгдөв. Нөгөө талаас буддын шашин, бичиг соёл, уран зохиол, сүм хийдийн соёлын хөгжил үргэлжилсэн.",
    keyTerms: ["Хошуу", "Чуулган", "Буддын шашин", "Сүм хийд"],
    dates: ["XVII–XX зууны эхэн үе — Манжийн эрхшээлийн үе"],
  },
  {
    id: 5,
    chapter: "I бүлэг",
    title: "Монголчуудын тусгаар тогтнолын төлөө тэмцэл, хөдөлгөөн",
    period: "Манжийн эрхшээлийн үе",
    icon: "✊",
    questions: [
      "Монголчууд тусгаар тогтнолын төлөө ямар тэмцэл хийсэн бэ?",
      "Тусгаар тогтнолын үзэл санаа хэрхэн хадгалагдсан бэ?",
      "Тэмцэл хөдөлгөөнүүдийн нийтлэг зорилгыг тодорхойл.",
    ],
    summary:
      "Манжийн эрхшээлийн хугацаанд Монголчуудын тусгаар тогтнол, эрх чөлөөг сэргээх хүсэл эрмэлзэл тасраагүй. Янз бүрийн эсэргүүцэл, хөдөлгөөн өрнөж, XX зууны эхэн үед тусгаар тогтнолоо сэргээх улс төрийн тэмцэл шинэ шатанд орсон.",
    keyTerms: ["Тусгаар тогтнол", "Эрх чөлөө", "Тэмцэл", "Хөдөлгөөн"],
    dates: ["XX зууны эхэн — тусгаар тогтнолын хөдөлгөөн эрчимжив"],
  },

  {
    id: 6,
    chapter: "II бүлэг",
    title: "1911 оны хувьсгалын ялалт, ач холбогдол",
    period: "1911–1924",
    icon: "🇲🇳",
    questions: [
      "1911 оны хувьсгал ямар нөхцөлд гарсан бэ?",
      "1911 оны үйл явдлын гол үр дүн юу байв?",
      "1911 оны хувьсгалын түүхэн ач холбогдлыг үнэл.",
    ],
    summary:
      "1911 онд Монголчууд Манж Чин улсын ноёрхлыг халж, тусгаар тогтнолоо сэргээн тунхаглав. VIII Богд Жавзандамбыг Богд хаанд өргөмжилж, Монголын төрийг сэргээн байгуулсан нь XX зууны Монголын түүхийн томоохон эргэлт байлаа.",
    keyTerms: ["1911 оны хувьсгал", "Богд хаан", "Тусгаар тогтнол", "Монгол Улс"],
    dates: ["1911.12.29 — Монгол Улс тусгаар тогтнолоо сэргээн тунхаглав"],
  },
  {
    id: 7,
    chapter: "II бүлэг",
    title: "Монгол Улсын сэргэн мандлын эхлэл (1911–1920 он)",
    period: "1911–1920",
    icon: "👑",
    questions: [
      "1911 оноос хойш Монголын төр улс ямар арга хэмжээ авч байв?",
      "Шинэ төрийн байгуулал хэрхэн бүрэлдсэн бэ?",
      "Сэргэн мандлын эхний үеийн ололтыг тодорхойл.",
    ],
    summary:
      "1911 онд тусгаар тогтнолоо сэргээн тунхагласны дараа Монголын төрийн байгууллыг шинэчлэн зохион байгуулах, гадаад харилцаагаа хөгжүүлэх, тусгаар тогтнолоо бататгах зорилт тулгарсан.",
    keyTerms: ["Сэргэн мандалт", "Богд хаант Монгол", "Гадаад харилцаа"],
    dates: ["1911 — Тусгаар тогтнол сэргэсэн", "1911–1920 — Сэргэн мандлын эхний үе"],
  },
  {
    id: 8,
    chapter: "II бүлэг",
    title: "Монгол Улсын тусгаар тогтнолын хувь заяа",
    period: "1911–1921",
    icon: "🕊️",
    questions: [
      "Монголын тусгаар тогтнолыг ямар улс орнууд хэрхэн хүлээн авч байв?",
      "Хиагтын хэлэлцээр ямар үр дагавартай байсан бэ?",
      "Монголын тусгаар тогтнол яагаад бүрэн баталгаажаагүй вэ?",
    ],
    summary:
      "Монголын тусгаар тогтнолын асуудал Орос, Хятад болон Монголын хоорондын харилцаатай нягт холбоотой байв. Олон улсын нөхцөл байдлаас шалтгаалан Монголын бүрэн эрхийн асуудал ээдрээтэй хэвээр үлджээ.",
    keyTerms: ["Хиагтын хэлэлцээр", "Автономит эрх", "Тусгаар тогтнол"],
    dates: ["1915 — Хиагтын гурван улсын хэлэлцээр"],
  },
  {
    id: 9,
    chapter: "II бүлэг",
    title: "1921 оны хувьсгалын ялалт, ач холбогдол",
    period: "1921–1924",
    icon: "🚩",
    questions: [
      "1921 оны хувьсгалын гол шалтгаан юу байв?",
      "Хувьсгалын гол үе шатуудыг нэрлэ.",
      "1921 оны хувьсгалын түүхэн ач холбогдлыг тайлбарла.",
    ],
    summary:
      "1921 оны хувьсгалын үр дүнд Монголын тусгаар тогтнолыг сэргээх, бэхжүүлэх шинэ боломж бүрдэв. Ардын засгийн газар байгуулагдаж, улс орноо дотоод, гадаад талаас бэхжүүлэх үйл явц өрнөв.",
    keyTerms: ["1921 оны хувьсгал", "Ардын засгийн газар", "Тусгаар тогтнол"],
    dates: ["1921.03 — Ардын түр засгийн газар", "1921.07.11 — Ардын хувьсгалын ялалт"],
  },
  {
    id: 10,
    chapter: "II бүлэг",
    title: "Хэмжээт цаазат хаант Монгол Улс (1921–1924 он)",
    period: "1921–1924",
    icon: "👑",
    questions: [
      "Хэмжээт цаазат хаант Монгол Улсын онцлог юу байв?",
      "Монгол Улсын бүрэн эрх, тусгаар тогтнол хэр баталгаатай байсан бэ?",
      "Нийгэм, эдийн засаг, соёлд ямар өөрчлөлт гарав?",
    ],
    summary:
      "1921 оны хувьсгалын дараа Монгол Улс тусгаар тогтнолоо эргүүлэн олж, хөгжлийн чиглэлээ тодорхойлох шинэ боломж нээгдэв. Тусгаар тогтнолоо бататгах, дотоод болон гадаад байдлаа бэхжүүлэх шаардлага тулгарсан.",
    keyTerms: ["Хэмжээт цаазат хаант улс", "Ардын засгийн газар", "Бүрэн эрх"],
    dates: ["1921–1924 — Хэмжээт цаазат хаант Монгол Улс"],
  },
  {
    id: 11,
    chapter: "II бүлэг",
    title: "Монгол Улсын хөгжлийн талаарх үзэл баримтлалууд",
    period: "1921–1924",
    icon: "💡",
    questions: [
      "Монгол Улсыг хөгжүүлэх ямар үзэл баримтлал байсан бэ?",
      "Эдгээр үзэл баримтлал юугаараа ялгаатай байсан бэ?",
      "Монголын нөхцөлд тохирох хөгжлийн чиглэлийг хэрхэн үнэлэх вэ?",
    ],
    summary:
      "1920-иод оны эхэнд Монгол Улсын хөгжлийн зам, төрийн байгуулал, эдийн засгийн чиглэлийн талаар өөр өөр үзэл баримтлал оршиж байв. Эдгээрийн зөрөлдөөн нь дараагийн улс төрийн хөгжлийн чиглэлд нөлөөлсөн.",
    keyTerms: ["Хөгжлийн үзэл баримтлал", "Шинэчлэл", "Төрийн байгуулал"],
    dates: ["1921–1924 — Хөгжлийн чиглэлийн асуудал хурцдав"],
  },

  {
    id: 12,
    chapter: "III бүлэг",
    title: "Монгол Улсын анхдугаар Үндсэн хууль",
    period: "1924–1990",
    icon: "📜",
    questions: [
      "Анхдугаар Үндсэн хууль хэдийд батлагдсан бэ?",
      "Үндсэн хуулийн түүхэн ач холбогдол юу вэ?",
      "Төрийн байгуулалд ямар өөрчлөлт гарсан бэ?",
    ],
    summary:
      "1924 онд Монгол Улсын анхдугаар Үндсэн хууль батлагдаж, төрийн байгууллын шинэ тогтолцооны эрх зүйн үндэс тавигдав.",
    keyTerms: ["Үндсэн хууль", "БНМАУ", "Улсын Их Хурал"],
    dates: ["1924 — Анхдугаар Үндсэн хууль батлагдав"],
  },
  {
    id: 13,
    chapter: "III бүлэг",
    title: "Улс орноо хөгжүүлэх чиг хандлага, зөрөлдөөн",
    period: "1924–1932",
    icon: "⚖️",
    questions: [
      "Монгол Улсыг хөгжүүлэх ямар чиглэлүүд байсан бэ?",
      "Улс төрийн зөрөлдөөн юунаас үүссэн бэ?",
      "Эдгээр зөрөлдөөн ямар үр дагаварт хүргэсэн бэ?",
    ],
    summary:
      "1920-иод оны сүүлээр Монголын улс төр, эдийн засгийн хөгжлийн чиглэлийн талаар зөрөлдөөн гарч, улс орноо хөгжүүлэх бодлогод эргэлт өөрчлөлтүүд гарсан.",
    keyTerms: ["Хөгжлийн чиг хандлага", "Зөрөлдөөн", "Бодлого"],
    dates: ["1920-иод он — Хөгжлийн чиглэлийн зөрөлдөөн"],
  },
  {
    id: 14,
    chapter: "III бүлэг",
    title: "1932 оны зэвсэгт бослого, дүрвэх хөдөлгөөн",
    period: "1932",
    icon: "⚔️",
    questions: [
      "1932 оны зэвсэгт бослогын шалтгаан юу байв?",
      "Бослого хэрхэн өрнөсөн бэ?",
      "Дүрвэх хөдөлгөөн ямар шалтгаантай байсан бэ?",
    ],
    summary:
      "1932 онд хэрэгжиж байсан бодлогын үр дагавартай холбоотойгоор зэвсэгт бослого, дүрвэх хөдөлгөөн гарсан. Энэ үйл явдал нь өмнөх бодлогыг өөрчлөхөд нөлөөлсөн.",
    keyTerms: ["1932 оны бослого", "Дүрвэх хөдөлгөөн", "Зүүнтний бодлого"],
    dates: ["1932 — Зэвсэгт бослого"],
  },
  {
    id: 15,
    chapter: "III бүлэг",
    title: "Шинэ эргэлтийн жилүүд дэх өөрчлөлт шинэчлэл, ахиц дэвшил",
    period: "1932–1940",
    icon: "🏭",
    questions: [
      "Шинэ эргэлтийн бодлого ямар зорилготой байсан бэ?",
      "Эдийн засагт ямар өөрчлөлт гарсан бэ?",
      "Нийгмийн салбарт ямар ахиц дэвшил гарсан бэ?",
    ],
    summary:
      "1932 оноос бодлогын чиглэл өөрчлөгдөж, шинэ эргэлтийн жилүүдэд эдийн засаг, нийгэм, боловсрол, эрүүл мэндийн салбарт тодорхой өөрчлөлт, ахиц дэвшил гарсан.",
    keyTerms: ["Шинэ эргэлт", "Эдийн засаг", "Боловсрол", "Эрүүл мэнд"],
    dates: ["1932–1940 — Шинэ эргэлтийн жилүүд"],
  },
  {
    id: 16,
    chapter: "III бүлэг",
    title: "Улс төрийн хэлмэгдүүлэлт: үйл явц, үр дагавар",
    period: "1930-аад он",
    icon: "🕯️",
    questions: [
      "Улс төрийн хэлмэгдүүлэлт ямар нөхцөлд өрнөсөн бэ?",
      "Хэлмэгдүүлэлтэд хэн, ямар байгууллага өртсөн бэ?",
      "Хэлмэгдүүлэлтийн үр дагаврыг үнэл.",
    ],
    summary:
      "1930-аад онд улс төрийн хэлмэгдүүлэлт өргөн хүрээг хамарч, Монголын төр, нийгэм, шашин соёлын салбарт хүнд үр дагавар үлдээсэн.",
    keyTerms: ["Улс төрийн хэлмэгдүүлэлт", "Хэлмэгдэгсэд", "Шашин"],
    dates: ["1930-аад он — Улс төрийн хэлмэгдүүлэлт"],
  },
  {
    id: 17,
    chapter: "III бүлэг",
    title: "Дэлхийн II дайны үеийн БНМАУ, тусгаар тогтнолын бэхжилт",
    period: "1939–1945",
    icon: "🌍",
    questions: [
      "Халх голын дайнд Монгол Улс ямар үүрэгтэй оролцсон бэ?",
      "Дэлхийн II дайны үед Монголын тусгаар тогтнол хэрхэн бэхжив?",
      "Монголын ард түмний тусламж ямар ач холбогдолтой байсан бэ?",
    ],
    summary:
      "Дэлхийн II дайны өмнөх болон үеийн нөхцөлд Монгол Улс Зөвлөлт Холбоот Улстай хамтран ажиллаж, Халх голын байлдаанд оролцсон. Дайны жилүүдэд Монголын тусгаар тогтнолыг бэхжүүлэхэд чиглэсэн үйл явц өрнөв.",
    keyTerms: ["Халх гол", "Дэлхийн II дайн", "Тусгаар тогтнол"],
    dates: ["1939 — Халх голын байлдаан", "1945 — Тусгаар тогтнолын санал хураалт"],
  },
  {
    id: 18,
    chapter: "III бүлэг",
    title: "БНМАУ-д социализм байгуулах оролдлого",
    period: "1940–1990",
    icon: "🏛️",
    questions: [
      "Социализм байгуулах бодлого ямар зорилготой байсан бэ?",
      "Ямар арга хэмжээнүүд хэрэгжсэн бэ?",
      "Энэ бодлогын ололт, сургамжийг хэрхэн үнэлэх вэ?",
    ],
    summary:
      "БНМАУ-д социализм байгуулах зорилгоор улс төр, эдийн засаг, нийгмийн байгууллыг өөрчлөх бодлого хэрэгжүүлсэн. Үүний үр дүнд зарим салбарт хөгжлийн ахиц гарсан боловч нийгэм, эдийн засагт олон асуудал, зөрчил үүссэн.",
    keyTerms: ["Социализм", "Нийгмийн байгуулал", "Төлөвлөгөөт эдийн засаг"],
    dates: ["1940–1990 — Социализмын үеийн хөгжил"],
  },
  {
    id: 19,
    chapter: "III бүлэг",
    title: "БНМАУ-ын нийгэм-эдийн засагт гарсан өөрчлөлт",
    period: "1924–1990",
    icon: "🏭",
    questions: [
      "Нийгмийн бүтцэд ямар өөрчлөлт гарсан бэ?",
      "Эдийн засгийн ямар салбарууд хөгжсөн бэ?",
      "Хотжилт, үйлдвэржилт нийгэмд хэрхэн нөлөөлсөн бэ?",
    ],
    summary:
      "БНМАУ-ын үед нийгэм, эдийн засгийн бүтэц өөрчлөгдөж, үйлдвэржилт, хотжилт, боловсрол, эрүүл мэндийн салбар хөгжсөн. Нүүдлийн мал аж ахуйгаас гадна аж үйлдвэр, үйлчилгээний салбарууд өргөжив.",
    keyTerms: ["Үйлдвэржилт", "Хотжилт", "Нийгэм", "Эдийн засаг"],
    dates: ["1924–1990 — Нийгэм-эдийн засгийн өөрчлөлт"],
  },
  {
    id: 20,
    chapter: "III бүлэг",
    title: "БНМАУ-ын боловсрол, шинжлэх ухаан, соёлын хөгжилт",
    period: "1924–1990",
    icon: "📚",
    questions: [
      "Боловсролын салбарт ямар өөрчлөлт гарсан бэ?",
      "Шинжлэх ухааны байгууллагууд хэрхэн хөгжсөн бэ?",
      "Соёлын салбарын гол өөрчлөлтүүдийг нэрлэ.",
    ],
    summary:
      "БНМАУ-ын үед боловсрол, шинжлэх ухаан, соёлын салбарууд төрийн бодлогын хүрээнд хөгжсөн. Бичиг үсэг тайлагдалт, сургууль, дээд боловсрол, шинжлэх ухааны байгууллагуудын хөгжилд ахиц гарсан.",
    keyTerms: ["Боловсрол", "Шинжлэх ухаан", "Соёл", "Их сургууль"],
    dates: ["1942 — МУИС байгуулагдав"],
  },
  {
    id: 21,
    chapter: "III бүлэг",
    title: "БНМАУ-ын гадаад харилцаа",
    period: "1924–1990",
    icon: "🌐",
    questions: [
      "БНМАУ-ын гадаад харилцааны гол чиглэл юу байв?",
      "Монгол Улс олон улсын байгууллагад хэрхэн оролцсон бэ?",
      "НҮБ-д элссэн нь ямар ач холбогдолтой вэ?",
    ],
    summary:
      "БНМАУ гадаад харилцаагаа хөгжүүлж, олон улсын тавцанд байр сууриа бэхжүүлсэн. 1961 онд Монгол Улс Нэгдсэн Үндэстний Байгууллагын гишүүн болов.",
    keyTerms: ["Гадаад харилцаа", "НҮБ", "Олон улсын харилцаа"],
    dates: ["1961.10.27 — Монгол Улс НҮБ-ын гишүүн болов"],
  },

  {
    id: 22,
    chapter: "IV бүлэг",
    title: "1990 оны ардчилсан хувьсгал: өрнөл, ялалт, ач холбогдол",
    period: "1990 оноос хойш",
    icon: "🕊️",
    questions: [
      "1990 оны ардчилсан хувьсгал ямар шалтгаантай байсан бэ?",
      "Хувьсгал хэрхэн өрнөсөн бэ?",
      "1990 оны хувьсгалын түүхэн ач холбогдол юу вэ?",
    ],
    summary:
      "1990 онд Монгол Улсад улс төр, нийгмийн шинэчлэлийн хөдөлгөөн өрнөж, ардчилсан тогтолцоонд шилжих үйл явц эхэлсэн. Олон намын тогтолцоо, чөлөөт сонгууль, хүний эрх, эрх чөлөөний шинэ орчин бүрэлдэх үндэс тавигдав.",
    keyTerms: ["Ардчилсан хувьсгал", "Олон намын тогтолцоо", "Шинэчлэл"],
    dates: ["1989 — Ардчилсан хөдөлгөөн өрнөв", "1990 — Ардчилсан хувьсгал"],
  },
  {
    id: 23,
    chapter: "IV бүлэг",
    title: "Улс төрийн тогтолцоонд гарсан өөрчлөлт",
    period: "1990 оноос хойш",
    icon: "🏛️",
    questions: [
      "Улс төрийн тогтолцоонд ямар үндсэн өөрчлөлт гарсан бэ?",
      "1992 оны Үндсэн хууль ямар ач холбогдолтой вэ?",
      "Ардчилсан сонгуулийн тогтолцоо хэрхэн бүрэлдсэн бэ?",
    ],
    summary:
      "1990 оноос Монгол Улс ардчилсан улс төрийн тогтолцоонд шилжих үйл явцыг эхлүүлсэн. 1992 онд шинэ Үндсэн хууль батлагдаж, ардчилсан төрийн байгууллын эрх зүйн үндэс бүрдэв.",
    keyTerms: ["Ардчилал", "Үндсэн хууль", "Сонгууль", "Парламент"],
    dates: ["1990 — Улс төрийн шинэчлэл", "1992.01.13 — Шинэ Үндсэн хууль"],
  },
  {
    id: 24,
    chapter: "IV бүлэг",
    title: "Нийгэм, эдийн засгийн тогтолцооны шинэчлэл",
    period: "1990 оноос хойш",
    icon: "📈",
    questions: [
      "Эдийн засгийн тогтолцоо хэрхэн өөрчлөгдсөн бэ?",
      "Зах зээлийн эдийн засагт шилжихэд ямар хүндрэл гарсан бэ?",
      "Шинэчлэлийн эерэг болон сөрөг үр дагаврыг харьцуул.",
    ],
    summary:
      "1990 оноос Монгол Улс төвлөрсөн төлөвлөгөөт эдийн засгаас зах зээлийн эдийн засгийн тогтолцоонд шилжих шинэчлэл хийсэн. Өмч хувьчлал, үнэ чөлөөлөлт, хувийн хэвшлийн хөгжил зэрэг өөрчлөлтүүд өрнөв.",
    keyTerms: ["Зах зээлийн эдийн засаг", "Өмч хувьчлал", "Шинэчлэл"],
    dates: ["1990-ээд он — Зах зээлийн шилжилт"],
  },
  {
    id: 25,
    chapter: "IV бүлэг",
    title: "Оюун санааны хүрээн дэх хувьсал өөрчлөлт",
    period: "1990 оноос хойш",
    icon: "🧠",
    questions: [
      "Оюун санааны хүрээнд ямар өөрчлөлт гарсан бэ?",
      "Үзэл бодол, хэвлэл мэдээллийн орчин хэрхэн өөрчлөгдсөн бэ?",
      "Шашин, соёлын эрх чөлөө ямар ач холбогдолтой вэ?",
    ],
    summary:
      "Ардчилал, шинэчлэлийн үеэс үзэл бодлоо чөлөөтэй илэрхийлэх, хэвлэн нийтлэх, шашин шүтэх болон соёлын эрх чөлөөний орчин өргөжив.",
    keyTerms: ["Оюун санааны эрх чөлөө", "Хэвлэл мэдээлэл", "Шашин", "Соёл"],
    dates: ["1990 оноос — Оюун санааны шинэ орчин бүрэлдэв"],
  },
  {
    id: 26,
    chapter: "IV бүлэг",
    title: "Монгол Улсын гадаад харилцаа өргөжин хөгжсөн нь",
    period: "1990 оноос хойш",
    icon: "🌏",
    questions: [
      "1990 оноос хойш Монголын гадаад харилцаанд ямар өөрчлөлт гарсан бэ?",
      "Гуравдагч хөршийн бодлого ямар ач холбогдолтой вэ?",
      "Монгол Улсын олон улсын хамтын ажиллагааг үнэл.",
    ],
    summary:
      "1990 оноос Монгол Улс гадаад харилцаагаа өргөжүүлж, олон улс, олон улсын байгууллагуудтай харилцаагаа хөгжүүлэн, ардчилсан Монгол Улсын гадаад бодлогын шинэ орчныг бүрдүүлсэн.",
    keyTerms: ["Гадаад харилцаа", "Олон улсын байгууллага", "Гуравдагч хөрш"],
    dates: ["1990 оноос — Гадаад харилцааны шинэ үе"],
  },
];

export default function LessonPage() {
  const params = useParams();
  const id = Number(params.id);

  const lesson = lessons.find((item) => item.id === id);

  const [activeTab, setActiveTab] = useState("lesson");
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [showAnswers, setShowAnswers] = useState(false);

  if (!lesson) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
        <div className="text-center">
          <div className="text-6xl">🔎</div>
          <h1 className="mt-5 text-3xl font-black">
            Хичээл олдсонгүй
          </h1>
          <Link
            href="/11"
            className="mt-6 inline-block rounded-xl bg-amber-400 px-6 py-3 font-black text-slate-950"
          >
            ← 11-р анги руу буцах
          </Link>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: "lesson", label: "📖 Хичээл" },
    { id: "timeline", label: "⏳ Он цаг" },
    { id: "source", label: "📜 Эх сурвалж" },
    { id: "terms", label: "🔑 Нэр томьёо" },
    { id: "practice", label: "🧩 Дасгал" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
              {lesson.chapter}
            </p>

            <h1 className="mt-1 truncate text-lg font-black">
              {lesson.icon} {lesson.title}
            </h1>
          </div>

          <Link
            href="/11"
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold"
          >
            ← Буцах
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-amber-400/10 px-4 py-2 text-xs font-black text-amber-400">
              {lesson.id}-Р ХИЧЭЭЛ
            </span>

            <span className="rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-slate-400">
              {lesson.period}
            </span>
          </div>

          <div className="mt-5 flex gap-5">
            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-amber-400/10 text-5xl sm:flex">
              {lesson.icon}
            </div>

            <div>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                {lesson.title}
              </h2>

              <p className="mt-4 max-w-4xl leading-7 text-slate-400">
                Энэ сэдвийн үндсэн агуулгыг судалж, түлхүүр асуулт,
                он цаг, эх сурвалж, нэр томьёо болон дасгалаар
                мэдлэгээ бататгана.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-amber-400 text-slate-950"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        {activeTab === "lesson" && (
          <LessonContent lesson={lesson} />
        )}

        {activeTab === "timeline" && (
          <TimelineContent dates={lesson.dates} />
        )}

        {activeTab === "source" && (
          <SourceContent lesson={lesson} />
        )}

        {activeTab === "terms" && (
          <TermsContent terms={lesson.keyTerms} />
        )}

        {activeTab === "practice" && (
          <PracticeContent
            lesson={lesson}
            answers={answers}
            setAnswers={setAnswers}
            showAnswers={showAnswers}
            setShowAnswers={setShowAnswers}
          />
        )}
      </section>
    </main>
  );
}

function LessonContent({ lesson }: { lesson: Lesson }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
          ҮНДСЭН АГУУЛГА
        </p>

        <h3 className="mt-4 text-3xl font-black">
          {lesson.title}
        </h3>

        <p className="mt-7 text-lg leading-9 text-slate-300">
          {lesson.summary}
        </p>

        <div className="mt-10 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-widest text-amber-400">
            🎯 СУДЛАХ ЧИГЛЭЛ
          </p>

          <ul className="mt-4 space-y-4">
            {lesson.questions.map((question, index) => (
              <li
                key={question}
                className="flex gap-3 leading-7 text-slate-300"
              >
                <span className="font-black text-amber-400">
                  {index + 1}.
                </span>
                {question}
              </li>
            ))}
          </ul>
        </div>
      </article>

      <aside className="space-y-5">
        <SideCard
          icon="🎯"
          title="Суралцахуйн зорилго"
          text="Түүхэн үйл явдлын шалтгаан, өрнөл, үр дагаврыг тайлбарлаж, эх сурвалжид тулгуурлан дүгнэлт хийх."
        />

        <SideCard
          icon="💡"
          title="Түүхчлэн бодох"
          text="Үйл явдлыг тухайн үеийн улс төр, нийгэм, эдийн засгийн нөхцөлтэй нь холбон бодоорой."
        />

        <SideCard
          icon="🧠"
          title="Өөрийгөө шалга"
          text="Дасгал хэсэгт орж өөрийн ойлголтоо шалгана уу."
        />
      </aside>
    </div>
  );
}

function TimelineContent({ dates }: { dates: string[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 md:p-10">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
        ⏳ ОН ЦАГИЙН ШУЛУУН
      </p>

      <h3 className="mt-3 text-3xl font-black">
        Түүхэн үйл явдлууд
      </h3>

      <div className="relative mt-10 ml-3 border-l border-amber-400/40">
        <div className="space-y-8">
          {dates.map((date) => (
            <div key={date} className="relative pl-8">
              <div className="absolute -left-[7px] top-2 h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.7)]" />

              <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                <p className="font-bold leading-7 text-slate-200">
                  {date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SourceContent({ lesson }: { lesson: Lesson }) {
  return (
    <div className="grid gap-7 lg:grid-cols-2">
      <div className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.04] p-7 md:p-9">
        <p className="text-xs font-black uppercase tracking-widest text-amber-400">
          📜 ЭХ СУРВАЛЖТАЙ АЖИЛЛАХ
        </p>

        <h3 className="mt-4 text-2xl font-black">
          Сурвалжийг шинжлэх арга
        </h3>

        <div className="mt-6 space-y-4">
          <Step number="1" text="Сурвалжийн төрлийг тодорхойл." />
          <Step number="2" text="Хэн, хэзээ, ямар нөхцөлд бүтээснийг тодорхойл." />
          <Step number="3" text="Сурвалжаас гол мэдээллийг ялга." />
          <Step number="4" text="Бусад түүхэн баримттай харьцуул." />
          <Step number="5" text="Өөрийн үндэслэлтэй дүгнэлт гарга." />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 md:p-9">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
          🔎 СЭДВИЙН АСУУЛТ
        </p>

        <h3 className="mt-4 text-2xl font-black">
          Эх сурвалж дээр ажиллах
        </h3>

        <div className="mt-6 space-y-4">
          {lesson.questions.map((question, index) => (
            <div
              key={question}
              className="rounded-2xl border border-white/10 bg-slate-900 p-5"
            >
              <p className="font-bold leading-7">
                <span className="mr-2 text-amber-400">
                  {index + 1}.
                </span>
                {question}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TermsContent({ terms }: { terms: string[] }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
        🔑 ТҮЛХҮҮР ОЙЛГОЛТ
      </p>

      <h3 className="mt-3 text-3xl font-black">
        Нэр томьёо
      </h3>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {terms.map((term) => (
          <div
            key={term}
            className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-xl">
              🔑
            </div>

            <h4 className="mt-5 text-xl font-black">
              {term}
            </h4>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Энэ нэр томьёог тухайн сэдвийн үндсэн агуулгатай
              холбон тайлбарлаж, хэрэглээрэй.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PracticeContent({
  lesson,
  answers,
  setAnswers,
  showAnswers,
  setShowAnswers,
}: {
  lesson: Lesson;
  answers: string[];
  setAnswers: React.Dispatch<React.SetStateAction<string[]>>;
  showAnswers: boolean;
  setShowAnswers: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
          🧩 ДАСГАЛ ДААЛГАВАР
        </p>

        <h3 className="mt-3 text-3xl font-black">
          Өөрийн мэдлэгээ шалга
        </h3>
      </div>

      <div className="space-y-5">
        {lesson.questions.map((question, index) => (
          <div
            key={question}
            className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 md:p-8"
          >
            <p className="text-lg font-black leading-8">
              <span className="mr-3 text-amber-400">
                {index + 1}.
              </span>
              {question}
            </p>

            <textarea
              value={answers[index]}
              onChange={(e) => {
                const next = [...answers];
                next[index] = e.target.value;
                setAnswers(next);
              }}
              placeholder="Энд өөрийн хариултыг бич..."
              className="mt-5 min-h-[130px] w-full rounded-2xl border border-white/10 bg-slate-950 p-5 leading-7 text-white outline-none placeholder:text-slate-700 focus:border-amber-400/50"
            />
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          onClick={() => setShowAnswers(true)}
          className="rounded-2xl bg-amber-400 px-7 py-4 font-black text-slate-950"
        >
          💡 Өөрийгөө шалгах
        </button>

        <button
          onClick={() => {
            setAnswers(["", "", ""]);
            setShowAnswers(false);
          }}
          className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-bold"
        >
          🔄 Дахин эхлэх
        </button>
      </div>

      {showAnswers && (
        <div className="mt-7 rounded-3xl border border-green-400/20 bg-green-400/[0.04] p-7">
          <p className="font-black text-green-400">
            ✅ Өөрийн хариултаа шалгаарай
          </p>

          <p className="mt-3 leading-7 text-slate-400">
            Хариултаа зөвхөн цээжээр бус, тухайн сэдвийн
            үндсэн агуулга, түүхэн баримт, эх сурвалжтай
            холбон тайлбарласан эсэхээ анхаараарай.
          </p>
        </div>
      )}
    </div>
  );
}

function SideCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <div className="text-3xl">{icon}</div>

      <h3 className="mt-4 font-black">{title}</h3>

      <p className="mt-2 text-sm leading-7 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function Step({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/[0.04] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 font-black text-slate-950">
        {number}
      </div>

      <p className="text-sm font-bold text-slate-300">
        {text}
      </p>
    </div>
  );
}