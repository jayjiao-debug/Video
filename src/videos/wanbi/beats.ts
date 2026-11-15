// THE NAMED BEATS of the Wanbi film (STORYBOARD.md: the shot list and the "Tables for beats.ts"). Every frame here is
// LOOKED UP from the generated narration data (line(n), cap(line, k), capWord(line, word), SEGMENTS): nobody types a
// frame number, so a re-timed voice moves every beat by itself. If a lookup no longer exists after a regrouping of the
// captions, the import throws and names it. The numbers in the comments are today's, for reading only.
//   SHOTS    the 33 shots: id, first / last frame, place, camera, the placed list, the eased move inside the shot
//   shot(id) one of them;  shotAt(f);  shotsOf(seg);  shotCheck() -> [] when the list is sound
//   HIT      the frames things land on (a word is said): glints, stamps, swaps, hand-overs, the chip
//   TAG      the first frame of each name tag; TAG_OUT the first frame of its 5-frame leave; TAG_FLIP the 23b flip
//   HOLDER   who holds the jade (the chip HUD), from which frame
//   BEAT     the rest that more than one package needs (the HUD's beats, the flashback label, the dressing spans)
// Segment builders: take your cuts from shot("12b").from / .to and your hits from HIT; if you need a beat that is not
// here, look it up the same way in your own file (cap / capWord / line are exported by story.ts; capWord(line,
// word).from is the frame the word's first syllable starts on, also inside a caption group).
import { cap, capWord, line, lineNo, SEGMENTS, TOTAL, CAM_NAMES, type CamName, type Place } from "./story";

export type { CamName };
/** the first frame of line n as PICTURE: 2 frames before its first word (where a segment also starts) */
const pre = (n: number) => line(n).from - 2;

// ---------------------------------------------------------------------------------------------------- the shot list
/** who is on set in a shot (STORYBOARD "placed"): everyone else is hidden by beginFrame. Figures placed but outside
 *  the frame stand on their marks, so nobody blinks in and out between shots. */
export type PlacedCode = "L" | "Q" | "A" | "B" | "M" | "G" | "C" | "O" | "U" | "Z" | "E" | "N" | "S";
/** the codes and the Persons they stand for (people.ts, BIBLE section 5) */
export const PLACED: Record<PlacedCode, string> = {
  L: "the envoy: LIN (LIN_RAGE in 1, 10b-11 and 1253-1271, LIN_OFFICIAL from 2061)",
  Q: "the King of Qin: QIN_WANG",
  A: "lady A: LADY_A",
  B: "lady B: LADY_B",
  M: "the three Qin ministers: QIN_MIN_A, QIN_MIN_B, QIN_MIN_C",
  G: "guardL + guardR: QIN_GUARD, QIN_GUARD_B (segment B only)",
  C: "guardC: QIN_GUARD_B (from 17a)",
  O: "the official at the map: QIN_MIN_C (12b-15)",
  U: "the usher: QIN_USHER (17a-18a)",
  Z: "the King of Zhao: ZHAO_WANG",
  E: "the eunuch: MIAO_XIAN",
  N: "the two Zhao ministers: ZHAO_MIN_A, ZHAO_MIN_B",
  S: "the servant: SERVANT (SERVANT_ROUGH from 1339)",
};
export type ShotDef = {
  /** "1", "2", "3", "5a", ... "23b" (there is no shot "4": line 4 lives inside shot 3's move) */ id: string;
  /** the narration line it starts in (as picture: lineNo(from)) */ line: number;
  /** the segment letter */ seg: string;
  /** inclusive absolute frames */ from: number; to: number;
  place: Place;
  /** the camera it starts on: a name of layout.ts CAMS */ cam: CamName;
  /** who is on set (PLACED) */ placed: PlacedCode[];
  /** an eased move inside the shot to another checked camera: [camera, first frame, last frame] */ move?: [CamName, number, number];
  what: string;
};
type Raw = Omit<ShotDef, "to" | "seg">;
const P = (s: string) => s.split(" ") as PlacedCode[];
const HALL6 = P("L Q A B M G"), CER = P("L Q M C U"), CER4 = P("L Q M C");
const RAW: Raw[] = [
  // ------------------------------------------------------------------- A 0-512: lines 1-6
  { id: "1", line: 1, from: 0, place: "hall", cam: "hook", placed: P("L Q"), what: "THE HOOK: the envoy at the pillar, jade raised; the half-risen king waving (push fov 28 -> 26; hud: false)" },
  { id: "2", line: 2, from: pre(2), place: "hall", cam: "kingWave", placed: P("L Q"), what: "the waving king; tag 秦王; whip RIGHT out" },
  { id: "3", line: 3, from: pre(3), place: "zhao", cam: "zhaoThrone", placed: P("Z"), move: ["zhaoKing", line(4).from - 4, line(4).from + 10],
    what: "EARLIER; the Zhao king and the jade; 15 cities; the dilemma; the army" },
  { id: "5a", line: 5, from: pre(5), place: "zhao", cam: "zhaoWide", placed: P("Z N L E"), what: "派谁去? the ministers turn their backs; the eunuch brings his retainer in" },
  { id: "5b", line: 5, from: cap(5, 3).from, place: "zhao", cam: "zhaoPush", placed: P("Z L E"), what: "the eunuch puts him forward; two tags; 我去" },
  { id: "6", line: 6, from: cap(6, 2).from, place: "zhao", cam: "zhaoLin", placed: P("L"), what: "jade at his chest; 完璧归赵 stamp; turns left; whip LEFT out (axial 1.7x from 5b)" },
  // ------------------------------------------------------------------- B 513-924: lines 7-11
  { id: "7a", line: 7, from: pre(7), place: "hall", cam: "hallWide", placed: HALL6, what: "he steps up and offers; the lounging king reaches" },
  { id: "7b", line: 7, from: capWord(7, "玉").from - 2, place: "hall", cam: "presentTwo", placed: HALL6, what: "the take; the king laughs; passes it to lady A" },
  { id: "8a", line: 8, from: line(8).from, place: "hall", cam: "hallWide", placed: HALL6, what: "万岁: lady A holds the jade up; tag 秦国大臣; he backs off" },
  { id: "8b", line: 8, from: cap(8, 1).from, place: "hall", cam: "linClose", placed: P("L Q M G"), what: "deadpan; thought bubble: the cities?" },
  { id: "9", line: 9, from: line(9).from, place: "hall", cam: "presentTwo", placed: HALL6, what: "\"there's a flaw\"; lady A gives it back; the king hands it to him" },
  { id: "10a", line: 10, from: line(10).from, place: "hall", cam: "retreat", placed: HALL6, what: "jade held high, he scuttles back to the pillar; bump" },
  { id: "10b", line: 10, from: cap(10, 2).from, place: "hall", cam: "pillarClose", placed: P("L"), what: "怒发冲冠: rage swap, stamp; \"再逼我\" (the hook's axis, 1.7x)" },
  { id: "11", line: 11, from: cap(11, 1).from, place: "hall", cam: "hook", placed: P("L Q"), what: "the opening shot returns (hookPose(w, f, 852)): the threat; 碎 (punch-in 886-896; hud: false)" },
  // ------------------------------------------------------------------- C 925-1295: lines 12-15
  { id: "12a", line: 12, from: pre(12), place: "hall", cam: "throne", placed: P("L Q"), what: "the king apologises; claps for the map" },
  { id: "12b", line: 12, from: cap(12, 1).from, place: "hall", cam: "map", placed: P("L Q O"), what: "the official holds the map; the king unrolls it and points (map stand on)" },
  { id: "13", line: 13, from: line(13).from, place: "hall", cam: "stageTwo", placed: P("L Q O"), what: "he walks in; THE STAGE on the king, then on him; five suns" },
  { id: "14", line: 14, from: cap(14, 2).from, place: "hall", cam: "linStage", placed: P("L Q O"), what: "\"you fast five days too\"; the grand ceremony; \"then I hand it over\"; the stage lifts" },
  { id: "15", line: 15, from: line(15).from, place: "hall", cam: "stageTwo", placed: P("L Q O"), what: "the king's half-reach stops; rage raise; he agrees; the envoy leaves right" },
  // ------------------------------------------------------------------- D 1296-1685: lines 16-19
  { id: "16a", line: 16, from: pre(16), place: "road", cam: "roadGate", placed: P("L S"), what: "dusk: in from the left edge; the servant; the cloak puff; jade into the coat" },
  { id: "16b", line: 16, from: cap(16, 3).from, place: "road", cam: "roadFar", placed: P("S"), what: "the servant runs left to right on the ridge; arrow 赵; whip LEFT out" },
  { id: "17a", line: 17, from: pre(17), place: "hall", cam: "hallWide", placed: CER, what: "ceremony on: five suns tick; drum; the usher leads him in, empty-handed" },
  { id: "17b", line: 17, from: cap(17, 2).from, place: "hall", cam: "throne", placed: CER, what: "the king holds out his hand" },
  { id: "18a", line: 18, from: line(18).from, place: "hall", cam: "linMid", placed: CER, what: "twenty-odd rulers; 22 crowns crossed out; empty hands" },
  { id: "18b", line: 18, from: cap(18, 3).from, place: "hall", cam: "throne", placed: CER4, what: "\"the jade is in Zhao\": shock; chip 赵国" },
  { id: "19", line: 19, from: pre(19), place: "hall", cam: "hallMid", placed: CER4, what: "\"throw me in the pot\"; the cauldron drops in" },
  // ------------------------------------------------------------------- E 1686-2106: lines 20-23
  { id: "20a", line: 20, from: pre(20), place: "hall", cam: "ministers", placed: CER4, what: "the ministers stare at each other (alarm, never laughing)" },
  { id: "20b", line: 20, from: cap(20, 1).from, place: "hall", cam: "hallMid", placed: CER4, what: "the guard strides in from the right and takes his left arm" },
  { id: "21a", line: 21, from: line(21).from - 1, place: "hall", cam: "throne", placed: CER4, what: "\"stop\"; \"killing him won't bring it back\" (the king slumps)" },
  { id: "21b", line: 21, from: cap(21, 3).from, place: "hall", cam: "hallMid", placed: CER4, what: "\"let him go\": released, bows exchanged, he turns right" },
  { id: "22", line: 22, from: pre(22), place: "hall", cam: "hallDoor", placed: CER4, what: "he walks to the bright door; THE BILL: 0 and 0; whip RIGHT out" },
  { id: "23a", line: 23, from: line(23).from - 1, place: "zhao", cam: "zhaoThrone", placed: P("Z"), what: "the rhyme of 3: 价值连城 stamp; the arch of cities pops away" },
  { id: "23b", line: 23, from: cap(23, 2).from, place: "zhao", cam: "zhaoCrown", placed: P("Z L E"), what: "kneeling; the official's cap handed over; the tag flips to 上大夫" },
];
export const SHOTS: ShotDef[] = RAW.map((s, i) => {
  const to = (RAW[i + 1]?.from ?? TOTAL) - 1, sg = SEGMENTS.find((x) => s.from >= x.from && s.from <= x.to);
  if (!sg) throw new Error(`beats: shot ${s.id} starts outside the film (${s.from})`);
  return { ...s, to, seg: sg.id };
});
/** the shot with this id ("12b"). Throws when there is none. */
export const shot = (id: string): ShotDef => { const s = SHOTS.find((x) => x.id === id); if (!s) throw new Error(`shot("${id}"): no such shot`); return s; };
/** the shot that frame f is in */
export const shotAt = (f: number): ShotDef => { let s = SHOTS[0]; for (const x of SHOTS) if (f >= x.from) s = x; return s; };
/** the shots of one segment, in order */
export const shotsOf = (segId: string) => SHOTS.filter((s) => s.seg === segId);

// ---------------------------------------------------------------------------------------------------- hits
/** the frame a word starts on (or an action the storyboard ties to it): put the hit there. [a, b] = a start and its
 *  landing (the pass starts, the chip flips). */
export const HIT = {
  // line 1 (shot 1): the glint on 和氏璧, the wind-up (要往), the feint stops on 撞
  glint1: capWord(1, "和氏璧").from /* 59 */, wind1: capWord(1, "要往").from /* 75 */, smash1: capWord(1, "撞").from /* 100 */,
  // line 2: the tag on 是秦王; the whip pan RIGHT is the last 4 frames of shot 2
  kingTag: cap(2, 1).from - 2 /* 148 */, whip1: pre(3) - 4 /* 168 */,
  // line 3 (shot 3): EARLIER lands with the whip; the source tag; the glint on 玉; the chip; the tag; the 15 cities
  earlier: pre(3) /* 172 */, source: line(3).from /* 174 */, glintZhao: capWord(3, "玉").from /* 182 */,
  chipZhao: cap(3, 1).from /* 190 */, zhaoTag: cap(3, 1).from + 6 /* 196 */, cities: capWord(3, "十五座城").from /* 211 */,
  // line 4: the offer and the QIN arrow; the cities go ghost; the hug; the army
  offer: line(4).from /* 237 */, ghost: cap(4, 1).from /* 257 */, hug: cap(4, 2).from /* 283 */, army: cap(4, 3).from /* 296 */,
  // line 5 (5a, 5b): the 「?」; the ministers' tag; 没人; the walk in; 推了出来
  who: line(5).from /* 328 */, zhaoMin: line(5).from + 2 /* 330 */, noOne: capWord(5, "没人").from /* 347 */,
  walkIn: cap(5, 2).from + 2 /* 363 */, present: cap(5, 3).from /* 407 */,
  // line 6: 我去 (head pop); 我把玉 (the chip flips, the cut to 6); the stamp 完璧归赵 on 把玉 + 1; the whip LEFT
  iGo: capWord(6, "我去").from /* 443 */, chipLin: cap(6, 2).from /* 472 */, wanbi: capWord(6, "把玉").from + 1 /* 476 */, whip2: pre(7) - 4 /* 509 */,
  // line 7: the lazy reach (4 frames before the cut to 7b); the take on 玉; 乐坏了; to lady A (pass starts, chip)
  reach: capWord(7, "玉").from - 6 /* 527 */, take: capWord(7, "玉").from /* 533 */, laugh: cap(7, 1).from /* 543 */,
  toLady: [cap(7, 2).from, cap(7, 2).from + 5] as [number, number] /* 565 / 570 */,
  // line 8: 万岁; the ministers' tag; the thought bubble
  cheer: line(8).from /* 594 */, qinMin: line(8).from + 6 /* 600 */, bubble: cap(8, 1).from + 11 /* 640 */,
  // line 9: the walk up; the ring on 瑕; lady A gives it back (pass starts, chip); the hand-over to the envoy (starts, glint)
  walkUp: line(9).from /* 663 */, flaw: capWord(9, "瑕疵").from /* 707 */,
  giveBack: [cap(9, 2).from, cap(9, 2).from + 6] as [number, number] /* 724 / 730 */,
  handBack: [line(9).to - 2, line(9).to] as [number, number] /* 748 / 750 */,
  // line 10: 玉一到手 (chip); the spin; his back meets E1; the rage swap; the stamp 怒发冲冠
  jadeBack: line(10).from /* 752 */, spin: cap(10, 2).from - 9 /* 794 */, bump: cap(10, 2).from - 3 /* 800 */,
  rage: cap(10, 2).from /* 803 */, nufa: cap(10, 2).from + 3 /* 806 */,
  // line 11: 再逼我; the HUD fades out; the hook returns; 碎
  threat: line(11).from /* 831 */, hudOut: cap(11, 1).from - 6 /* 846 */, hookBack: cap(11, 1).from /* 852 */, smash2: capWord(11, "碎").from /* 896 */,
  // line 12: the HUD back; two claps (召); the map opens; the official takes the roller; 一指; the 15 dots; the envoy starts walking
  hudIn: pre(12) /* 925 */, clap: [cap(12, 1).from - 8, cap(12, 1).from - 4] as [number, number] /* 955 / 959 */,
  mapOpen: cap(12, 1).from /* 963 */, roller: cap(12, 1).from + 13 /* 976 */, point: capWord(12, "一指").from /* 980 */,
  cities12: capWord(12, "十五").from /* 996 */, linWalk: cap(12, 2).from + 19 /* 1011 */,
  // lines 13-14: THE STAGE drops on 在; slides to him (也演); five suns (五天才); they slide to the king; 大礼; the stage lifts (我才交)
  stage: capWord(13, "在演").from /* 1077 */, swing: line(14).from /* 1094 */, suns: capWord(14, "五天才").from /* 1133 */,
  sunsSlide: cap(14, 2).from + 17 /* 1180 */, grand: cap(14, 3).from /* 1205 */, stageOff: cap(14, 4).from /* 1225 */,
  // line 15: the half reach; the glance at the guards; the rage swap on 抢; the nod; he turns to leave (the walk starts 4 frames before the cut)
  reach15: line(15).from /* 1244 */, glance: line(15).from + 6 /* 1250 */, rage2: capWord(15, "抢").from /* 1253 */,
  nod: cap(15, 1).from + 8 /* 1280 */, exit15: pre(16) - 10 /* 1286 */,
  // line 16: the beckon (让); the servant's tag (随从); the puff (粗); the jade into his coat (着玉, chip); the whip LEFT
  beckon: capWord(16, "让").from /* 1316 */, servantTag: capWord(16, "随从").from /* 1320 */, puff: capWord(16, "粗").from /* 1339 */,
  tuck: capWord(16, "着玉").from /* 1367 */, whip3: pre(17) - 6 /* 1414 */,
  // line 17: the day-tick (五天后); the usher; the drum (大礼摆好); 秦王要玉
  dayTick: line(17).from /* 1422 */, usher: line(17).from + 2 /* 1424 */, drum: cap(17, 1).from /* 1441 */, ask: cap(17, 2).from /* 1461 */,
  // line 18: the 22 crowns (二十); the crosses (没一个 + 6); the reveal on 赵国 (chip 赵国, the 「!」)
  crowns: capWord(18, "二十").from /* 1512 */, cross: cap(18, 2).from + 6 /* 1553 */, reveal: capWord(18, "赵国").from /* 1595 */,
  // line 19: the cauldron falls (把我) and lands
  cauldron: [cap(19, 2).from, cap(19, 2).from + 6] as [number, number] /* 1654 / 1660 */,
  // line 20: the first gaze snap; the grab (拖)
  snap: line(20).from + 2 /* 1690 */, grab: capWord(20, "拖").from /* 1751 */,
  // line 21: the stop hand; the slump (玉也回不来); the release; the bows
  stop: line(21).from + 2 /* 1775 */, slump: cap(21, 2).from /* 1814 */, release: cap(21, 3).from + 2 /* 1840 */, bows: cap(21, 3).from + 7 /* 1845 */,
  // line 22: THE BILL (最后); the two 「0」 (没给城, 没给玉); the whip RIGHT (the last 5 frames of 22)
  bill: line(22).from /* 1866 */, zero1: capWord(22, "没给城").from /* 1890 */, zero2: capWord(22, "没给玉").from /* 1924 */, whip4: line(23).from - 6 /* 1934 */,
  // line 23: the stamp 价值连城; the arch vanishes; the tag returns; the cap is handed over (国); the swap on 当; he rises
  liancheng: line(23).from /* 1940 */, vanish: cap(23, 1).from + 8 /* 1985 */, lin23: cap(23, 2).from + 2 /* 2017 */,
  cap: capWord(23, "国").from /* 2050 */, crown: capWord(23, "当").from /* 2061 */, rise23: capWord(23, "官").from + 1 /* 2076 */,
};

// ---------------------------------------------------------------------------------------------------- name tags
/** frames a tag stays before its leave starts (STORYBOARD: 32 unless noted) and the length of the leave */
export const TAG_LEN = 32, TAG_LEAVE = 5;
/** the first frame of each name tag (hud tag `from`). lin0 starts before the film: its pop is over by frame 0 (the
 *  thumbnail shows it settled). miao + lin5 are one tags() call in 5b. */
export const TAG = {
  /** 蔺相如 · 宦官的门客 / "the envoy" (shot 1) */ lin0: -12,
  /** 秦王 / "King of Qin" (shot 2) */ qinWang: HIT.kingTag /* 148 */,
  /** 赵王 / "King of Zhao" (shot 3) */ zhaoWang: HIT.zhaoTag /* 196 */,
  /** 赵国大臣 / "Zhao's ministers" (5a) */ zhaoMin: HIT.zhaoMin /* 330 */,
  /** 赵国宦官 / "the eunuch" (5b; "the palace eunuch" was too wide beside the envoy's plate in English) */ miao: cap(5, 3).from + 2 /* 409 */,
  /** 蔺相如 · 宦官的门客 / "the envoy" · "the eunuch's retainer" (5b, with miao) */ lin5: cap(5, 3).from + 2 /* 409 */,
  /** 美人 / "the king's ladies" (7b, over lady A) */ ladies: cap(7, 2).from /* 565 */,
  /** 秦国大臣 / "Qin's ministers" (8a) */ qinMin: HIT.qinMin /* 600 */,
  /** 随从 / "his servant" (16a) */ servant: HIT.servantTag /* 1320 */,
  /** 蔺相如 · 宦官的门客 -> 上大夫 / "the envoy" · "the eunuch's retainer" -> "senior official" (23b) */ lin23: HIT.lin23 /* 2017 */,
};
export type TagKey = keyof typeof TAG;
const cutAfter = (id: string) => shot(id).to + 1;
/** the first frame of each tag's leave (hud tag `out`): it is gone from TAG_OUT + TAG_LEAVE on. Default TAG + TAG_LEN;
 *  shorter where the storyboard ends it early, and never so late that the leave crosses a cut (shotCheck checks). */
export const TAG_OUT: Record<TagKey, number> = {
  lin0: capWord(1, "举着").from - 6 - TAG_LEAVE /* 39: gone on 44, after his name 蔺相如, before 举着 */,
  qinWang: HIT.whip1 - TAG_LEAVE /* 163: gone before the whip (the one short tag, declared) */,
  zhaoWang: TAG.zhaoWang + TAG_LEN /* 228 */,
  zhaoMin: cap(5, 2).from - 1 /* 360: leaves as 最后 starts (the walk-in) */,
  miao: TAG.miao + TAG_LEN /* 441 */,
  lin5: TAG.lin5 + TAG_LEN /* 441 */,
  ladies: cutAfter("7b") - TAG_LEAVE /* 589: gone on the cut to 8a */,
  qinMin: cutAfter("8a") - TAG_LEAVE /* 624: gone on the cut to 8b */,
  servant: TAG.servant + TAG_LEN /* 1352 */,
  lin23: TOTAL - 7 /* 2100: the declared long tag (the flip is the punchline); gone 2 frames before the end */,
};
/** a tag's role row flips on this frame (hud tag `flipAt`): the envoy's 宦官的门客 -> 上大夫 on 当 */
export const TAG_FLIP = { lin23: HIT.crown /* 2061 */ };

// ---------------------------------------------------------------------------------------------------- the jade holder
/** who holds the jade: the chip HUD (top right) shows the holder's label (hud/index.ts CHIP_LABEL) and pops on each
 *  change. null = no chip (0-189: frame 0 stays clean, shot 3 staggers its arrivals). */
export type Holder = "zhaoWang" | "lin" | "qinWang" | "ladies" | "servant" | "inZhao";
export const HOLDER: { from: number; who: Holder | null }[] = [
  { from: 0, who: null },
  { from: HIT.chipZhao, who: "zhaoWang" },     // 190 秦王开价: the offer is for HIS jade
  { from: HIT.chipLin, who: "lin" },           // 472 我把玉
  { from: HIT.take, who: "qinWang" },          // 533 接过玉
  { from: HIT.toLady[1], who: "ladies" },      // 570 传给美人们
  { from: HIT.giveBack[1], who: "qinWang" },   // 730 lady A gives it back (王授璧)
  { from: HIT.jadeBack, who: "lin" },          // 752 玉一到手 (the hand-over lands 748-751)
  { from: HIT.tuck, who: "servant" },          // 1367 揣着玉
  { from: HIT.reveal, who: "inZhao" },         // 1595 玉已经到赵国了: the reveal (the chip waits for it)
];
/** the holder on frame f and the frame that holder started (the chip pops on `from`, except on a fade-in) */
export const holderAt = (f: number): { from: number; who: Holder | null } => { let h = HOLDER[0]; for (const x of HOLDER) if (f >= x.from) h = x; return h; };

// ---------------------------------------------------------------------------------------------------- the rest
const hookShots = ["1", "11"].map(shot);
export const BEAT = {
  /** the label 此前 / EARLIER and the sepia rewind tint of the 2 -> 3 whip: [first, last] */ earlier: [pre(3), pre(3) + 27] as [number, number] /* 172-199 */,
  /** the source tag fades in from here (174-181) */ source: line(3).from /* 174 */,
  /** the source tag at full strength until here (the last word); then it fades with the chip (hudEnd) */ sourceOff: line(23).to /* 2083 */,
  /** the source tag and the chip fade out before the callback ... */ hudOut: [HIT.hudOut, cap(11, 1).from - 1] as [number, number] /* 846-851 */,
  /** ... and back in after it (no pop on the return) */ hudIn: [HIT.hudIn, HIT.hudIn + 6] as [number, number] /* 925-931 */,
  /** the chip (and the source tag) fade out for a clean end */ chipFade: [line(23).to + 1, line(23).to + 6] as [number, number] /* 2084-2089 */,
  /** the shots with hud: false (no source tag, no chip): shots 1 and 11, [first, last] each */
  hookOff: hookShots.map((s) => [s.from, s.to] as [number, number]) /* 0-107, 852-924 */,
  /** the hall's ceremony dressing (setCeremony): 17a to the end of 22 */ ceremony: [shot("17a").from, shot("22").to] as [number, number] /* 1420-1938 */,
  /** the map stand (setMapStand): 12b to the end of 15 (never in the throne shot) */ mapStand: [shot("12b").from, shot("15").to] as [number, number] /* 963-1295 */,
  /** the ladies duck at the threat and never return (V9): not placed from here */ ladiesGone: shot("10b").from /* 803 */,
  /** THE STAGE HUD: drops on 在, slides to the envoy on 也演, lifts on 我才交 (10 frames) */ stage: [HIT.stage, HIT.swing, HIT.stageOff, HIT.stageOff + 10] as [number, number, number, number] /* 1077 / 1094 / 1225-1235 */,
};
/** true on the frames whose shot has hud: false (shots 1 and 11) */
export const hookOffAt = (f: number) => BEAT.hookOff.some(([a, b]) => f >= a && f <= b);

// ---------------------------------------------------------------------------------------------------- the check
/** the storyboard's rules as a check: returns the complaints, [] = clean. 33 shots in order, contiguous from 0 to
 *  TOTAL - 1 (they sum to TOTAL), none under 18 frames (BIBLE rule 1), each segment starts on a shot and no shot
 *  crosses a segment's end, the shot's line is the picture line of its first frame, cameras belong to the shot's
 *  place, moves inside their shot; every tag lives inside one shot (never across a cut); the holders in order; every
 *  hit inside the film. */
export const shotCheck = (): string[] => {
  const bad: string[] = [];
  if (SHOTS.length !== 33) bad.push(`${SHOTS.length} shots, the storyboard has 33`);
  if (SHOTS[0].from !== 0) bad.push(`the first shot starts on ${SHOTS[0].from}, not 0`);
  if (SHOTS[SHOTS.length - 1].to !== TOTAL - 1) bad.push(`the last shot ends on ${SHOTS[SHOTS.length - 1].to}, not ${TOTAL - 1}`);
  const ids = new Set<string>();
  let sum = 0;
  for (let i = 0; i < SHOTS.length; i++) {
    const s = SHOTS[i], n = s.to - s.from + 1;
    sum += n;
    if (ids.has(s.id)) bad.push(`shot id ${s.id} twice`); ids.add(s.id);
    if (i && s.from !== SHOTS[i - 1].to + 1) bad.push(`shot ${s.id} does not follow ${SHOTS[i - 1].id}`);
    if (n < 18) bad.push(`shot ${s.id} is ${n} frames long (under 18)`);
    const g = SEGMENTS.find((x) => x.id === s.seg);
    if (!g || s.to > g.to) bad.push(`shot ${s.id} (${s.from}-${s.to}) crosses the end of segment ${s.seg}`);
    if (lineNo(s.from) !== s.line) bad.push(`shot ${s.id} says line ${s.line}, its first frame ${s.from} is line ${lineNo(s.from)}`);
    const camPlace = (c: CamName): Place => (c.startsWith("zhao") ? "zhao" : c.startsWith("road") ? "road" : "hall");
    if (!(CAM_NAMES as readonly string[]).includes(s.cam) || camPlace(s.cam) !== s.place) bad.push(`shot ${s.id}: camera ${s.cam} is not a ${s.place} camera`);
    if (s.move && (camPlace(s.move[0]) !== s.place || s.move[1] < s.from || s.move[2] > s.to || s.move[2] - s.move[1] < 9)) bad.push(`shot ${s.id}: its move ${s.move.join(" ")} is not a ${s.place} camera inside ${s.from}-${s.to} of 10 frames or more`);
    if (!s.placed.length || new Set(s.placed).size !== s.placed.length || s.placed.some((c) => !(c in PLACED))) bad.push(`shot ${s.id}: placed list ${s.placed.join(" ")}`);
  }
  if (sum !== TOTAL) bad.push(`the shots sum to ${sum} frames, the film is ${TOTAL}`);
  for (const g of SEGMENTS) if (!SHOTS.some((s) => s.from === g.from)) bad.push(`segment ${g.id} does not start on a shot`);
  for (const k of Object.keys(TAG) as TagKey[]) {
    const a = Math.max(0, TAG[k]), b = TAG_OUT[k] + TAG_LEAVE - 1, s = shotAt(a);
    if (TAG_OUT[k] <= TAG[k]) bad.push(`tag ${k}: leaves (${TAG_OUT[k]}) before it starts (${TAG[k]})`);
    if (b > s.to) bad.push(`tag ${k}: on screen ${a}-${b}, across the cut after shot ${s.id} (${s.to})`);
  }
  const fl = TAG_FLIP.lin23;
  if (fl <= TAG.lin23 || fl >= TAG_OUT.lin23) bad.push(`tag lin23: the flip ${fl} is outside its life ${TAG.lin23}-${TAG_OUT.lin23}`);
  for (let i = 1; i < HOLDER.length; i++) if (HOLDER[i].from <= HOLDER[i - 1].from) bad.push(`HOLDER: ${HOLDER[i].who} (${HOLDER[i].from}) is not after ${HOLDER[i - 1].who}`);
  for (const [k, v] of Object.entries(HIT)) for (const x of Array.isArray(v) ? v : [v]) if (x < 0 || x >= TOTAL) bad.push(`HIT.${k} = ${x} is outside the film`);
  return bad;
};
