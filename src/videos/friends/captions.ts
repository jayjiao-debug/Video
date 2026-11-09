// Caption groups of storyboard §1, one entry per group: [first frame, last frame (inclusive), text]. 【】 marks the gold
// key words (the brackets are not drawn). Drawn by <Caption> in Film.tsx over everything except `top` (the end card).
// Timing is the storyboard's (silence-detected group starts); a refinement may move a group by at most ±3 frames.
// Gaps between groups (e.g. f219-224) show no caption. Nothing after f2231.
export type CaptionGroup = { from: number; to: number; text: string; shot: string };
export type CaptionRun = { text: string; gold: boolean };

const RAW: [string, number, number, string][] = [
  ["S01", 0, 29, "你当朋友的"], ["S01", 30, 55, "【10】个人里"], ["S01", 56, 89, "【约3个】"], ["S01", 90, 125, "【没把你】当朋友"],
  ["S02", 126, 171, "你肯定在想"], ["S02", 172, 218, "我的朋友【不会】"],
  ["S03", 225, 277, "研究者【真测过】"], ["S03", 278, 310, "一门大学课"], ["S03", 311, 345, "【84】个人"], ["S03", 346, 377, "互相【打分】"],
  ["S04", 378, 410, "【0到5分】"], ["S04", 411, 436, "【3分以上】"], ["S04", 437, 469, "算【朋友】"], ["S04", 470, 492, "【再猜】"],
  ["S04", 493, 519, "对方会给我"], ["S04", 520, 536, "【几分】？"],
  ["S05", 537, 564, "他们当朋友"], ["S05", 565, 584, "的人里"], ["S05", 585, 627, "【94%】"], ["S05", 628, 644, "都以为"], ["S05", 645, 673, "是【双向】的"],
  ["S06", 674, 695, "实际上"], ["S06", 696, 726, "【真双向】的"], ["S06", 727, 781, "大约只有【7成】"],
  ["S07", 784, 834, "友谊是根【绳】"], ["S07", 835, 862, "你只握得到"], ["S07", 863, 889, "【自己这头】"],
  ["S08", 890, 939, "先别委屈"], ["S08", 940, 955, "也有人"], ["S08", 956, 992, "【把你当朋友】"], ["S08", 993, 1016, "你【没接】"],
  ["S09", 1017, 1058, "算上你【没接的】"], ["S09", 1059, 1095, "全班的绳子"], ["S09", 1096, 1136, "【两头】都握住的"], ["S09", 1137, 1187, "才【53%】"],
  ["S10", 1191, 1234, "研究者【推测】"], ["S10", 1235, 1247, "很多"], ["S10", 1248, 1280, "【单向】的友谊"], ["S10", 1281, 1322, "其实是【仰望】"],
  ["S11a", 1331, 1387, "单向还是双向"],
  ["S11b", 1388, 1411, "还关系到"], ["S11b", 1412, 1448, "谁【带得动你】"],
  ["S12", 1449, 1484, "【健身实验】里"], ["S12", 1485, 1523, "每人配了【搭子】"],
  ["S13", 1524, 1561, "【双向】的搭子"], ["S13", 1562, 1597, "【最能】带动你"],
  ["S14", 1598, 1642, "他把你当朋友"], ["S14", 1643, 1673, "你【没有】"], ["S14", 1674, 1697, "【也有用】"],
  ["S15", 1698, 1739, "你把他当朋友"], ["S15", 1740, 1770, "他【没有】"], ["S15", 1771, 1814, "【测不出效果】"],
  ["S16", 1818, 1851, "所以，别人"], ["S16", 1852, 1884, "抛给你的绳"], ["S16", 1885, 1905, "【接住】"],
  ["S17", 1906, 1945, "自己【抛出去】的"], ["S17", 1946, 1966, "【别猜】"], ["S17", 1967, 1989, "【去问】"],
  ["S18", 1993, 2018, "把这条发给"], ["S18", 2019, 2044, "你会打【5分】"], ["S18", 2045, 2070, "的那个人"], ["S18", 2071, 2096, "问他"],
  ["S18", 2097, 2130, "你给我打【几分】？"],
  ["S19", 2131, 2153, "只要他回"], ["S19", 2154, 2184, "【3分以上】"], ["S19", 2185, 2201, "这根绳"], ["S19", 2202, 2231, "就是【双向】的"],
];
export const CAPTIONS: CaptionGroup[] = RAW.map(([shot, from, to, text]) => ({ shot, from, to, text }));

/** the caption group on screen at frame f (or null) */
export const captionAt = (f: number): CaptionGroup | null => {
  let lo = 0, hi = CAPTIONS.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1, c = CAPTIONS[m];
    if (f < c.from) hi = m - 1; else if (f > c.to) lo = m + 1; else return c;
  }
  return null;
};
/** "我的朋友【不会】" -> [{text: "我的朋友", gold: false}, {text: "不会", gold: true}] */
export const captionRuns = (text: string): CaptionRun[] => {
  const out: CaptionRun[] = [];
  const re = /【([^】]*)】/g;
  let i = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > i) out.push({ text: text.slice(i, m.index), gold: false });
    out.push({ text: m[1], gold: true });
    i = m.index + m[0].length;
  }
  if (i < text.length) out.push({ text: text.slice(i), gold: false });
  return out;
};
/** trailing punctuation that is pulled back by half an em so the line stays optically centred (storyboard §0.2) */
export const TRAILING_PUNCT = "？！，。：";

// sanity: groups are sorted and do not overlap
for (let i = 1; i < CAPTIONS.length; i++) {
  if (CAPTIONS[i].from <= CAPTIONS[i - 1].to) throw new Error(`caption groups overlap at ${CAPTIONS[i].text}`);
}
