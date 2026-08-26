"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ХӨДӨЛГӨӨНИЙ ГОГЦОО
 *
 * Хөдөлгөөнт симуляц бүрд ижил гогцоо хэрэгтэй тул нэг дор бичив.
 *
 * ХОЁР ЧУХАЛ ЗҮЙЛ:
 *
 * 1. Кадр хоорондын зөрүүг хязгаарлана. Хэрэглэгч өөр таб руу
 *    шилжвэл `requestAnimationFrame` зогсдог; буцаж ирэхэд зөрүү нь
 *    хэдэн секунд болно. Хязгаарлаагүй бол симуляц нэг агшинд
 *    төгсгөл рүүгээ үсэрч, юу болсныг харах завгүй өнгөрнө.
 *
 * 2. Хөдөлгөөн багасгах тохиргоотой хэрэглэгчид гогцоог огт
 *    ажиллуулахгүй — дуудагч нь `reducedMotion`-ыг хараад үр дүнг
 *    шууд харуулна.
 */

const MAX_DELTA_MS = 100;

export interface AnimationClock {
  /** Эхэлснээс хойш өнгөрсөн хугацаа, миллисекундээр */
  elapsed: number;
  running: boolean;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  /** Тодорхой цэг рүү шилжих — цагийн шугам чирэхэд */
  seek: (ms: number) => void;
}

export function useAnimationClock(options?: {
  /** Энэ хугацаанд хүрэхэд өөрөө зогсоно */
  durationMs?: number;
  /** Хурдны илтгэлцүүр — 2 бол хоёр дахин хурдан */
  speed?: number;
  autoStart?: boolean;
  /**
   * `durationMs` хүрэхэд нэг удаа дуудагдана.
   *
   * Дуусахыг effect дотор `elapsed`-ыг харьцуулж мэдэх нь болохгүй:
   * тэр нь render бүрд ажиллаж, төлөвийг синхроноор өөрчилснөөр
   * илүүц дахин render үүсгэдэг. Гогцоо өөрөө хэзээ дууссанаа
   * мэддэг тул мэдэгдэх нь ч түүний үүрэг.
   */
  onComplete?: () => void;
}): AnimationClock {
  const { durationMs, speed = 1, autoStart = false, onComplete } = options ?? {};

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(autoStart);

  const frameRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const elapsedRef = useRef(0);

  /* Дуудагч бүрд шинэ функц дамжуулдаг тул ref-д барина —
     эс бөгөөс гогцоо кадр бүрд дахин эхлэнэ */
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!running) return;

    lastRef.current = performance.now();

    const step = (now: number) => {
      const delta = Math.min(now - lastRef.current, MAX_DELTA_MS) * speed;
      lastRef.current = now;

      elapsedRef.current += delta;

      if (durationMs !== undefined && elapsedRef.current >= durationMs) {
        elapsedRef.current = durationMs;
        setElapsed(durationMs);
        setRunning(false);
        completeRef.current?.();
        return;
      }

      setElapsed(elapsedRef.current);
      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [running, speed, durationMs]);

  return {
    elapsed,
    running,
    start: () => {
      /* Төгсгөлд хүрсэн байвал эхнээс нь эхэлнэ */
      if (durationMs !== undefined && elapsedRef.current >= durationMs) {
        elapsedRef.current = 0;
        setElapsed(0);
      }
      setRunning(true);
    },
    pause: () => setRunning(false),
    toggle: () => setRunning((value) => !value),
    reset: () => {
      elapsedRef.current = 0;
      setElapsed(0);
      setRunning(false);
    },
    seek: (ms: number) => {
      const clamped = Math.max(
        0,
        durationMs === undefined ? ms : Math.min(ms, durationMs),
      );
      elapsedRef.current = clamped;
      setElapsed(clamped);
    },
  };
}

/** Хөдөлгөөн багасгах тохиргоо асаалттай эсэх. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
