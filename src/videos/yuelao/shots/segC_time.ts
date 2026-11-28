// SCENE C's timing (v7): the words the five case books are timed to, when each book flies, opens, shuts and leaves his
// hands, and the flights back. Pure numbers from the captions, no three.js or canvas, so the sound's event list
// (scripts/yuelao/sound/events.ts) reads the very frames segC.ts draws. segC.ts adds each book's drawer cell.
import { cap, capWord } from "../captions";
const wordAt = (id: string, word: string) => capWord(id, word).from;   // (as shots/kit.ts)
const startOf = (id: string) => cap(id, 0).from;
export const W_ = {
  mine: wordAt("C01", "老业"), bound: wordAt("C02", "我绑"), solid: wordAt("C02", "牢"), year: wordAt("C03", "一年"), c04: startOf("C04"), counts: wordAt("C04", "也算"),
  c05: startOf("C05"), bf: wordAt("C05", "变"), hide: wordAt("C05", "这单"), noted: wordAt("C05", "别记"), c06: startOf("C06"), kua: wordAt("C06", "跨"), appr: wordAt("C06", "审批"), kyr: wordAt("C06", "千年"),
  c07: startOf("C07"), shake: wordAt("C07", "手"), tie: wordAt("C07", "绑成"), chai: wordAt("C07", "宝钗"), c08: startOf("C08"), curse: wordAt("C08", "骂"), late: wordAt("C08", "多年"),
  c09: startOf("C09"), that: wordAt("C09", "那是"), jade: wordAt("C09", "玉帝"), c10: startOf("C10"), c11: startOf("C11"), three: wordAt("C11", "三百"),
};
/** each case: s = he beckons (its drawer shoots open 4 frames later, the book leaves it at s + 8 and is in his hands at
 *  catch); open = [from, to, how far]; shut = [from, to]; exit = the frame it leaves his hands */
export type CaseTime = { s: number; leave: number; catch: number; open: [number, number, number]; shut: [number, number]; exit: number };
export const CASE_T: CaseTime[] = (() => {
  const w = W_, mk = (s: number, fly: number, open: [number, number, number], shut: [number, number], exit: number): CaseTime => ({ s, leave: s + 8, catch: s + 8 + fly, open, shut, exit });
  return [
    mk(w.mine - 4, 14, [w.bound - 12, w.bound - 2, 1], [w.counts + 2, w.counts + 10], w.counts + 12),
    mk(w.c05 - 26, 16, [w.c05 + 20, w.c05 + 30, 1], [w.hide - 6, w.hide], w.hide + 22),
    mk(w.hide + 34, 15, [w.c06 + 26, w.c06 + 36, 1], [w.kyr + 20, w.kyr + 26], w.kyr + 26),
    mk(w.kyr + 22, 16, [w.c07 + 38, w.c07 + 48, 1], [w.late + 13, w.late + 19], w.late + 19),
    // (v6b: it stays shut in his hands through 三百年仙丹, so his face is clear on the punch, then pulls free on its own)
    mk(w.late + 21, 19, [w.that + 2, w.that + 7, 0.12], [w.c11, w.c11 + 3], w.c11 + 40),
  ];
})();
/** the flights back (case 0: flicked; 3: hurled; 4: on its own): [leaves his hands, in its drawer] */
export const BACK: Record<number, [number, number]> = { 0: [CASE_T[0].exit, CASE_T[0].exit + 12], 3: [CASE_T[3].exit, CASE_T[3].exit + 10], 4: [CASE_T[4].exit, CASE_T[4].exit + 14] };
