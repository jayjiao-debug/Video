import { b } from '../v6/ui6';
import { CUT, LINES11 } from './time11';
import type { Line11 } from './kit11';

/* v6 · the long cut (~2:00). The music now starts at the track's 0 s, so the track's strongest early hit (16.6 s)
   lands on the film's first big beat (85 % slams in). Track time τ:
     τ ∈ [0, PRE)            a new cold open in the cinema (Pre11), on the intro's accents
     τ ≥ PRE                 the v5 film, old T = τ − PRE (b(16) = bar 4 = 8.545 s in the track)
     old T ∈ [INS_AT, …)     a 16-beat insert in the payoff (the ledger is cleaned), then v5 resumes 16 beats later.
   16 beats = one half-phrase, so everything after the insert stays on the phrase grid. */
export const PRE = 8.545; // track time of v5's T = 0 (b(i) = beats[i] − 8.545)
export const INS_BEAT = 199, INS_BEATS = 16;
export const INS_AT = b(INS_BEAT);
export const INS_LEN = b(INS_BEAT + INS_BEATS) - b(INS_BEAT);
/** seconds into the insert at which insert-beat k falls (k may be fractional) */
export const ik = (k: number) => b(INS_BEAT + k) - b(INS_BEAT);

/** v5 film time for track time τ (frozen at INS_AT during the insert) */
export const oldT = (tau: number) => {
  const t = tau - PRE;
  if (t < INS_AT) return t;
  if (t < INS_AT + INS_LEN) return INS_AT;
  return t - INS_LEN;
};
/** seconds into the insert (0 before, INS_LEN after) */
export const insT = (tau: number) => Math.max(0, Math.min(INS_LEN, tau - PRE - INS_AT));
/** track time of a v5 time */
export const tauOf = (t: number) => PRE + t + (t >= INS_AT - 1e-6 ? INS_LEN : 0);

export const FILM_END_L = tauOf(CUT.end);
export const EP11L_FRAMES = Math.round(FILM_END_L * 30);

/* the cold open's beats (track time). Intro accents: beats 0, 5, 7 | 8, 11, 13, 15 | 16 */
const tb = (k: number) => b(k) + 8.545; // track time of beat k
export const PB = { on: tb(0), four: tb(5), seat: tb(7), three: tb(8), two: tb(11), one: tb(13), pop: tb(15), cut: PRE };

const PRE_LINES: Line11[] = [
  [PB.on, PB.three - 0.1, '你有没有过：明明不想要了，还是[舍不得]？'],
  [PB.three, PB.one + 0.42, '先看一个你肯定遇到过的选择'],
];
/* the insert's lines (insert-beat offsets) */
const INS_LINES: [number, number, string][] = [
  [0, 5.5, '只算往后：已付出的，先[盖住]'],
  [5.5, 10, '说不准的，也先[拿开]'],
  [10, 16, '剩下的满意，比[别的选择]多吗？'],
];
export const LINES_L: Line11[] = [
  ...PRE_LINES,
  ...LINES11.map(([a, z, s]): Line11 => [tauOf(a), a < INS_AT ? PRE + z : tauOf(z), s]),
  ...INS_LINES.map(([k0, k1, s]): Line11 => [PRE + INS_AT + ik(k0), PRE + INS_AT + ik(k1) - 0.1, s]),
].sort((x, y) => x[0] - y[0]);
