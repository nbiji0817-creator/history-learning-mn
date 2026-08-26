/**
 * ТУЛАЛДААНЫ ХӨДӨЛГӨӨНИЙ ЗУРАГЛАЛ
 *
 * Цэвэр функцууд — React-ээс хамаарахгүй. Ингэснээр хөдөлгөөний
 * тооцоог браузергүйгээр шалгаж болно (`scripts/check-battle.mjs`),
 * мөн бүрэлдэхүүн нь зөвхөн дүрслэлээр хариуцна.
 *
 * Тактик бүр «үе шат»-уудын жагсаалт буцаана. Үе шат бүр өөрийн
 * үргэлжлэх хугацаа, тайлбар, мөн цэрэг тус бүрийн байрлалыг 0–1
 * хүртэлх явцын утгаар буцаадаг функцтэй.
 */

export const FIELD_W = 1000;
export const FIELD_H = 520;

/** Тал бүрийн цэргийн бүлгийн тоо — 9 нь дэлгэцэнд тод, дүрслэлд хангалттай */
export const UNITS = 9;

export interface Point {
  x: number;
  y: number;
}

export interface Phase {
  caption: string;
  ms: number;
  /** Монгол (эсвэл сурагчийн) тал */
  us: (t: number, i: number) => Point;
  /** Эсрэг тал */
  them: (t: number, i: number) => Point;
  /** Сум харвах эсэх — дүрслэлд */
  arrows?: boolean;
  /** Дайсны эгнээ замбараагүй болсныг харуулах */
  rout?: boolean;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Зөөлөн эхлэл, зөөлөн төгсгөл — механик хөдөлгөөнийг байгалийн болгоно */
function ease(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** Босоо тэнхлэгт жигд тарааж байрлуулна */
function spread(i: number, from: number, to: number): number {
  return lerp(from, to, i / (UNITS - 1));
}

/* ────────────────────  Тактик тус бүрийн хөдөлгөөн  ──────────────────── */

const START_US = 190;
const START_THEM = 810;

export function baseUs(i: number): Point {
  return { x: START_US, y: spread(i, 90, FIELD_H - 90) };
}

export function baseThem(i: number): Point {
  return { x: START_THEM, y: spread(i, 110, FIELD_H - 110) };
}

/** Хуурамч ухралт — довтлох дүр эсгэж, ухарч, дайсныг сунгаад бүслэх */
export function feignedRetreat(): Phase[] {
  return [
    {
      caption: "Довтлох дүр эсгэн ойртов",
      ms: 1500,
      us: (t, i) => ({ x: lerp(START_US, 470, ease(t)), y: baseUs(i).y }),
      them: (_, i) => baseThem(i),
      arrows: true,
    },
    {
      caption: "Гэнэт ухарч эхлэв — дайсан хөөж оров",
      ms: 2200,
      us: (t, i) => ({ x: lerp(470, 120, ease(t)), y: baseUs(i).y }),
      them: (t, i) => ({
        /* Хөөцөлдөгчид жигд бус хурдалж эгнээ сунана */
        x: lerp(START_THEM, 420 + i * 26, ease(t)),
        y: lerp(baseThem(i).y, baseUs(i).y, t * 0.55),
      }),
    },
    {
      caption: "Дайсны эгнээ сунаж тасрав",
      ms: 1400,
      us: (t, i) => ({ x: lerp(120, 150, t), y: baseUs(i).y }),
      them: (t, i) => ({
        x: lerp(420 + i * 26, 330 + i * 46, ease(t)),
        y: lerp(baseUs(i).y, baseUs(i).y + (i % 2 === 0 ? -34 : 34), t),
      }),
    },
    {
      caption: "Эргэж бүслэн цохив",
      ms: 2200,
      /*
       * Дайсны бөөгнөрлийг тойрч нумаар гүйнэ. Тэгш дугаартай нэгж
       * дээгүүр, сондгой нь доогуур эргэнэ. SVG-д y доошоо өсдөг тул
       * дээгүүр тойроход өнцөг π → 2π (sin сөрөг), доогуур тойроход
       * π → 0 (sin эерэг) байна.
       */
      us: (t, i) => {
        const up = i % 2 === 0;
        const cx = 430;
        const cy = FIELD_H / 2;
        const r = 265;
        const angle = up
          ? lerp(Math.PI, Math.PI * 2, ease(t))
          : lerp(Math.PI, 0, ease(t));

        return {
          x: cx + Math.cos(angle) * r,
          /* Босоо тэнхлэгт хавтгайруулж талбарт багтаана */
          y: lerp(baseUs(i).y, cy + Math.sin(angle) * r * 0.62, ease(t)),
        };
      },
      them: (t, i) => ({
        x: lerp(330 + i * 46, 430 + (i % 3) * 20, ease(t)),
        y: lerp(
          baseUs(i).y + (i % 2 === 0 ? -34 : 34),
          FIELD_H / 2 + (i - 4) * 12,
          ease(t),
        ),
      }),
      rout: true,
    },
  ];
}

/** Далавчаар тойрох — төв нь барьж байх зуур хажуугаар ар тал руу */
export function envelopment(): Phase[] {
  const isWing = (i: number) => i < 3 || i > 5;

  return [
    {
      caption: "Төв хүчээр дайсныг тогтоов",
      ms: 1600,
      us: (t, i) =>
        isWing(i)
          ? baseUs(i)
          : { x: lerp(START_US, 480, ease(t)), y: baseUs(i).y },
      them: (_, i) => baseThem(i),
      arrows: true,
    },
    {
      caption: "Далавчууд дээш, доош тойрч гарав",
      ms: 2200,
      us: (t, i) => {
        if (!isWing(i)) return { x: 480, y: baseUs(i).y };
        const up = i < 3;
        return {
          x: lerp(START_US, 700, ease(t)),
          y: lerp(baseUs(i).y, up ? 24 : FIELD_H - 24, ease(t)),
        };
      },
      them: (_, i) => baseThem(i),
    },
    {
      caption: "Ар талаас нь цохив",
      ms: 2000,
      us: (t, i) => {
        if (!isWing(i)) return { x: lerp(480, 600, ease(t)), y: baseUs(i).y };
        const up = i < 3;
        return {
          x: lerp(700, 930, ease(t)),
          y: lerp(up ? 24 : FIELD_H - 24, FIELD_H / 2 + (up ? -60 : 60), ease(t)),
        };
      },
      them: (t, i) => ({
        x: lerp(START_THEM, 760, ease(t)),
        y: lerp(baseThem(i).y, FIELD_H / 2 + (i - 4) * 16, ease(t)),
      }),
      rout: true,
    },
  ];
}

/** Сумны бороо — ойртож харваад ухрах, давтах */
export function arrowStorm(): Phase[] {
  /*
   * `themX` нь дайсны тухайн үе дэх байрлал. Үе шат бүрд baseThem рүү
   * буцаавал дайсан гэнэт үсэрч харагдана.
   */
  const dash = (
    near: number,
    far: number,
    themX: number,
    caption: string,
  ): Phase => ({
    caption,
    ms: 1500,
    us: (t, i) => ({
      /* Эхний хагаст ойртож, хоёрдугаарт ухарна */
      x: t < 0.5 ? lerp(far, near, ease(t * 2)) : lerp(near, far, ease((t - 0.5) * 2)),
      y: baseUs(i).y,
    }),
    them: (_, i) => ({ x: themX, y: baseThem(i).y }),
    arrows: true,
  });

  return [
    dash(560, START_US, START_THEM, "Ойртож сум харвав"),
    {
      caption: "Хүнд хуягтнууд хөөхөөр оролдов",
      ms: 1500,
      us: (_, i) => baseUs(i),
      them: (t, i) => ({
        x: lerp(START_THEM, 690, ease(t)),
        y: baseThem(i).y,
      }),
    },
    dash(600, START_US, 690, "Дахин ойртож харвав — морьд унав"),
    {
      caption: "Эгнээ замбараагүй болов",
      ms: 1800,
      us: (t, i) => ({ x: lerp(START_US, 430, ease(t)), y: baseUs(i).y }),
      them: (t, i) => ({
        x: lerp(690, 830 + (i % 3) * 30, ease(t)),
        y: lerp(baseThem(i).y, baseThem(i).y + (i % 2 === 0 ? -70 : 70), ease(t)),
      }),
      arrows: true,
      rout: true,
    },
  ];
}

/** Шууд довтолгоо — тарж олон мэт харагдаад, мэс шиг төвийг цоолох */
export function frontal(): Phase[] {
  return [
    {
      caption: "Хармаг журам — тарж, олон мэт харагдав",
      ms: 1600,
      us: (t, i) => ({
        x: lerp(START_US, START_US - 40 + (i % 3) * 40, ease(t)),
        y: lerp(baseUs(i).y, spread(i, 30, FIELD_H - 30), ease(t)),
      }),
      them: (_, i) => baseThem(i),
    },
    {
      caption: "Нуурын журам — нэг эгнээнд жагсав",
      ms: 1400,
      us: (t, i) => ({
        x: lerp(START_US - 40 + (i % 3) * 40, 330, ease(t)),
        y: lerp(spread(i, 30, FIELD_H - 30), baseUs(i).y, ease(t)),
      }),
      them: (_, i) => baseThem(i),
    },
    {
      caption: "Мэсийн журам — үзүүр болж төвийг цоолов",
      ms: 2200,
      /* Шаантаг хэлбэр: төв нь хамгийн урд, хажуу нь хойно */
      us: (t, i) => {
        const offset = Math.abs(i - 4);
        return {
          x: lerp(330, 720 - offset * 34, ease(t)),
          y: lerp(baseUs(i).y, FIELD_H / 2 + (i - 4) * 30, ease(t)),
        };
      },
      them: (t, i) => ({
        x: lerp(START_THEM, 880 + (i % 2) * 30, ease(t)),
        y: lerp(baseThem(i).y, baseThem(i).y + (i - 4) * 22, ease(t)),
      }),
      rout: true,
    },
  ];
}

/**
 * Буруу сонголтын төгсгөл — сурагчийн тал ухрахад хүрнэ.
 *
 * ӨМНӨХ үе шат дуусах байрлалаас эхэлнэ. Тогтмол тооноос эхлүүлбэл
 * тактик бүрд өөр өөр байрлалд дуусдаг тул цэрэг гэнэт үсэрч
 * харагдана.
 */
export function failureEnding(previous: Phase): Phase {
  return {
    caption: "Тактик бүтсэнгүй — ухрахаас өөр аргагүй болов",
    ms: 1800,
    us: (t, i) => {
      const from = previous.us(1, i);
      return {
        x: lerp(from.x, 90, ease(t)),
        y: lerp(from.y, from.y + (i % 2 === 0 ? -50 : 50), ease(t)),
      };
    },
    them: (t, i) => {
      const from = previous.them(1, i);
      return {
        x: lerp(from.x, 430, ease(t)),
        y: lerp(from.y, baseThem(i).y, ease(t)),
      };
    },
  };
}

