import type { LibraryBook } from "@/types";
import { tuuh6 } from "./tuuh-6";
import { tuuh7 } from "./tuuh-7";
import { tuuh8 } from "./tuuh-8";
import { tuuh9 } from "./tuuh-9";
import { nuutsTovchoo } from "./nuuts-tovchoo";
import { sudrynChuulgan1 } from "./sudryn-chuulgan-1";
import { sudrynChuulgan2 } from "./sudryn-chuulgan-2";
import { sudrynChuulgan3 } from "./sudryn-chuulgan-3";
import { mongolUlsynTuuh1 } from "./mongol-ulsyn-tuuh-1";
import { mongolUlsynTuuh2 } from "./mongol-ulsyn-tuuh-2";
import { mongolUlsynTuuh3 } from "./mongol-ulsyn-tuuh-3";
import { mongolUlsynTuuh4 } from "./mongol-ulsyn-tuuh-4";
import { mongolUlsynTuuh5 } from "./mongol-ulsyn-tuuh-5";

/**
 * НОМЫН САН
 *
 * Сурах бичиг ба анхдагч эх сурвалжийн агуулгын товчлол. AI багш
 * эдгээрийг индексжүүлж, хариултдаа номын нэр, бүлгийг заана.
 *
 * ⚠️ Эх бичвэрийг бүтнээр нь агуулаагүй — судалгааны тэмдэглэл.
 */
export const libraryBooks: LibraryBook[] = [
  tuuh6,
  tuuh7,
  tuuh8,
  tuuh9,
  nuutsTovchoo,
  sudrynChuulgan1,
  sudrynChuulgan2,
  sudrynChuulgan3,
  mongolUlsynTuuh1,
  mongolUlsynTuuh2,
  mongolUlsynTuuh3,
  mongolUlsynTuuh4,
  mongolUlsynTuuh5,
];

export const libraryBookMap = new Map(
  libraryBooks.map((book) => [book.slug, book]),
);

/** Бүх хэсгийн нийт тоо — оношилгоо, статистикт. */
export const libraryChunkCount = libraryBooks.reduce(
  (sum, book) => sum + book.chunks.length,
  0,
);
