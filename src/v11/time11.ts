import { b } from '../v6/ui6';
import type { Line11 } from './kit11';

/* The edit, on the music's grid. bar k downbeat = b(16 + 4k); beats are ~0.506 s apart.
   Every scene cut and every hit sits on a beat; the structural ones on bar downbeats.
   The music fades over the end card (bar 47 → bar 50) and ends exactly on the bar-50 line. */
export const bar = (k: number, beat = 1) => b(16 + 4 * k + (beat - 1));

export const CUT = {
  s2: b(22),      // 3.04  bar 1 beat 3   ticket pushed off, cards dealt
  drop1: b(32),   // 8.08  bar 4          85 % lands
  l4: b(34),      // 9.13  bar 4 beat 3   lamp to the right card
  s3: b(39),      // 11.66 bar 5 beat 4   cards flip into ledger rows
  s4: b(44),      // 14.16 bar 7          the book closes → title
  s5: b(48),      // 16.21 bar 8          the book opens
  s6: b(60),      // 22.27 bar 11         match shape: beam → card
  s7: b(73),      // 28.86 bar 14 beat 2  the 留 bar tips into the sheet
  s8: b(91),      // 37.96 bar 18 beat 4  the sheet turns into time
  stamp: b(96),   // 40.50 bar 20         被套牢
  s9: b(103),     // 44.05 bar 21 beat 4  rewind
  s10: b(109),    // 47.09 bar 23 beat 2  the square grows into the board
  dive: b(124),   // 54.66 bar 27         dive into 爱而不得
  silent: b(156), // 70.87 bar 35         the music's silent bar: the "?" falls
  drop2: b(160),  // 72.89 bar 36         the reward lamp ignites
  machine: b(162),// 73.91 bar 36 beat 3  key + lamp travel → 回复机
  gauges: b(169), // 77.46 bar 38 beat 2
  neq: b(176),    // 80.99 bar 40         ≠
  s13: b(182),    // 84.03 bar 41 beat 3  ≠ → −
  s14: b(204),    // 95.18 bar 47         page turns → end card
  end: b(216),    // 101.24 bar 50        last frame; music has faded to 0 here
};
export const FILM_END11 = CUT.end;
export const EP11_FRAMES = Math.round(FILM_END11 * 30);

/* line starts as beat indices (half-beats allowed where reading time needs it) */
const S: [number, string][] = [
  [16, '电影很烂，票都买了：你[走不走]？'],
  [22, '有个实验：项目已投1000万美元'],
  [28, '对手更强，[85%]的人还接着投'],
  [34, '没投过钱的：只有[17%]肯投'],
  [39, '感情里，我们也这样算账吗？'],
  [48, '花掉、要不回的，叫[沉没成本]'],
  [54, '经济学说：做选择时，别算它'],
  [60, '同一段不开心的感情，你走不走？'],
  [66, '实验里，花过钱和心力的[更可能留下]'],
  [73, '有位心理学家，给感情列了[账本]'],
  [79, '想留下 = 满意 + 投入 − 别的选择'],
  [85, '满意少了，投入还能把总数[撑住]'],
  [91, '被甩的人，满意平平却一直[大把投入]'],
  [98, '研究者管这叫[被套牢]'],
  [103, '要是两个人都还没投入呢？'],
  [109, '暧昧时的博弈：先主动，还是等？'],
  [115, '等，看着更安全；都在等，就[错过]'],
  [121, '你主动、TA不表态，就是[爱而不得]'],
  [127, '一个实验：看4个陌生人的主页'],
  [133, 'TA对你：很喜欢／一般／[说不准]'],
  [138.5, '最心动的，不是“很喜欢你”那组'],
  [144, '是[说不准]那组，也更常想起TA'],
  [150, '作者说：可能只在[刚认识]时'],
  [156, '奖励说不准，鸽子能连啄[好几小时]'],
  [162, '忽冷忽热的回复，就像[说不准的奖励]'],
  [169, '另一项研究：上心后被[吊着]，更想要'],
  [176, '却会[更不喜欢]TA'],
  [182, '让你舍不得的，有时不是这个人'],
  [188, '而是你已经[付出]的'],
  [193, '让你放不下的，有时只是[说不准]'],
  [199, '把账看清，怎么选由你'],
];
/* where a line must end before the next one starts (title card, the breath before ≠ → −, the end card) */
const HARD_END: Record<number, number> = { 4: b(44) + 0.35, 26: b(180) - 0.08, 30: b(204) - 0.1 };
export const LINES11: Line11[] = S.map(([bi, s], i) => {
  const a = i === 0 ? 0 : b(bi);
  const z = HARD_END[i] ?? (i + 1 < S.length ? b(S[i + 1][0]) - 0.1 : b(204) - 0.1);
  return [a, z, s];
});
