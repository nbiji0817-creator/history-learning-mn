/**
 * Тулалдааны хөдөлгөөнийг браузергүйгээр шалгана.
 *
 * requestAnimationFrame нь далд табд ажилладаггүй тул анимацийг
 * браузераар автоматжуулж шалгах боломжгүй. Харин хөдөлгөөний
 * тооцоо нь цэвэр функц учир энд шууд дуудаж шалгаж болно.
 */
import {
  arrowStorm, envelopment, failureEnding, feignedRetreat, frontal,
  FIELD_H, FIELD_W, UNITS,
} from "../lib/games/battle-choreography.ts";

const tactics = { feignedRetreat, envelopment, arrowStorm, frontal };
let problems = 0;

for (const [name, build] of Object.entries(tactics)) {
  const phases = build();
  let moved = 0;
  let outOfBounds = 0;
  let notFinite = 0;

  /*
   * Дундын цэгүүдийг ч хэмжинэ. «Дайрч ухрах» хөдөлгөөн нь эхлэл,
   * төгсгөлдөө ижил байрлалтай тул зөвхөн 0 ба 1-ийг харьцуулбал
   * «хөдлөөгүй» мэт харагдана.
   */
  const samples = [0, 0.25, 0.5, 0.75, 1];

  for (const phase of phases) {
    for (let i = 0; i < UNITS; i += 1) {
      let usPath = 0;
      let prevUs = null;

      for (const t of samples) {
        const u = phase.us(t, i);
        const e = phase.them(t, i);

        for (const p of [u, e]) {
          if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) notFinite += 1;
          /* Талбараас 60 нэгжээс их гарвал дэлгэцэнд харагдахгүй */
          if (p.x < -60 || p.x > FIELD_W + 60 || p.y < -60 || p.y > FIELD_H + 60) {
            outOfBounds += 1;
          }
        }

        if (prevUs) usPath += Math.hypot(u.x - prevUs.x, u.y - prevUs.y);
        prevUs = u;
      }

      if (usPath > 8) moved += 1;
    }
  }

  /* Үе шат бүрд ядаж хэдэн нэгж хөдлөх ёстой — эс бөгөөс "анимаци" биш */
  const ok = moved > 0 && outOfBounds === 0 && notFinite === 0;
  if (!ok) problems += 1;

  console.log(
    `${ok ? "✓" : "✗"} ${name.padEnd(16)} үе шат ${phases.length} | хөдөлсөн ${String(moved).padStart(3)} | хилээс гарсан ${outOfBounds} | тоо бус ${notFinite}`,
  );
}

/* Буруу сонголтын төгсгөл өмнөх үе шатаас үргэлжлэх ёстой */
const built = feignedRetreat();
const fail = failureEnding(built[1]);
let jump = 0;
for (let i = 0; i < UNITS; i += 1) {
  const endOfPrev = built[1].us(1, i);
  const startOfFail = fail.us(0, i);
  if (Math.hypot(startOfFail.x - endOfPrev.x, startOfFail.y - endOfPrev.y) > 1) jump += 1;
}
const failOk = jump === 0;
if (!failOk) problems += 1;
console.log(`${failOk ? "✓" : "✗"} ${"failureEnding".padEnd(16)} өмнөх байрлалаас үсэрсэн нэгж: ${jump}`);

console.log(problems === 0 ? "\nБүгд зөв" : `\n${problems} асуудал`);
process.exit(problems === 0 ? 0 : 1);
