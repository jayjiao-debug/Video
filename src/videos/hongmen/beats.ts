// THE NAMED BEATS of the Hongmen film. Every frame here is LOOKED UP from the generated narration data (line(n),
// cap(line, k), capWord(line, word), SEGMENTS): nobody types a frame number, so a re-timed voice moves every beat by
// itself. If a lookup no longer exists after a regrouping of the captions, the import throws and names it.
//   SHOTS    the shot list of the camera plan (/home/user/hm_notes/g1_layout.md section 4): id, first / last frame,
//            place, camera(s), the eased move inside the shot. A script can check it (shotCheck()).
//   shot(id) one of them;  shotAt(f)
//   HIT      the frames things land on (a word is said): stamps, slams, pops
//   TAG      the first frame of each name tag
//   BEAT     everything else that more than one builder needs (the HUD's start, the loop point ...)
// Segment builders: take your cuts from shot("12b").from / .to and your hits from HIT; if you need a beat that is not
// here, look it up the same way in your own file (cap / capWord / line are exported by story.ts).
import { cap, capWord, line, SEGMENTS, TOTAL, type Place } from "./story";
import type { CamName } from "./layout";

const seg = (id: string) => { const s = SEGMENTS.find((x) => x.id === id); if (!s) throw new Error(`beats: no segment ${id}`); return s; };
/** the first frame of line n as PICTURE: 2 frames before its first word (where a segment also starts) */
const pre = (n: number) => line(n).from - 2;

// ---------------------------------------------------------------------------------------------------- the shot list
export type ShotDef = {
  /** "1", "2a", "2b", ... "22": the shot ids of the camera plan */ id: string;
  /** the narration line it starts in */ line: number;
  /** the segment letter */ seg: string;
  /** inclusive absolute frames */ from: number; to: number;
  place: Place;
  /** the camera it starts on: a name of layout.ts CAMS, or "privy" (sets/privy.ts gives that camera per frame) */ cam: CamName | "privy";
  /** an eased move inside the shot to another checked camera: [camera, first frame, last frame] */ move?: [CamName, number, number];
  /** true = this shot continues the one before on the same tripod (a move, never a cut) */ joined?: boolean;
  what: string;
};
type Raw = Omit<ShotDef, "to" | "seg">;
const RAW: Raw[] = [
  { id: "1", line: 1, from: 0, place: "privy", cam: "privy", what: "Liu Bang on the privy: the shh + jawline gesture" },
  { id: "2a", line: 2, from: pre(2), place: "tent", cam: "master", what: "the banquet frozen mid sword dance (FREEZE)" },
  { id: "2b", line: 2, from: cap(2, 3).from, place: "camp", cam: "outside", what: "the black silhouette with the ? beside the tent door" },
  { id: "3", line: 3, from: line(3).from, place: "card", cam: "card3", what: "Liu Bang plants the red flag on the capital" },
  { id: "4", line: 4, from: line(4).from, place: "card", cam: "card4", what: "40 charcoal pawns behind Xiang Yu, 10 red behind Liu Bang" },
  { id: "5", line: 5, from: seg("B").from, place: "nightX", cam: "nightX", what: "the red officer at Xiang Yu's ear" },
  { id: "6", line: 6, from: line(6).from, place: "nightX", cam: "nightX", move: ["nightXin", line(6).from, line(6).from + 10], joined: true, what: "the slam, the officer flinches" },
  { id: "7", line: 7, from: line(7).from, place: "nightL", cam: "campNight", what: "the uncle arrives, the toast, the clasp" },
  { id: "8", line: 8, from: line(8).from, place: "gate", cam: "gate", what: "Liu Bang bows to Xiang Yu" },
  { id: "9", line: 9, from: line(9).from, place: "gate", cam: "gateXY", what: "Xiang Yu says the name; the inset of the officer" },
  { id: "10a", line: 10, from: seg("C").from, place: "tent", cam: "master", what: "everyone seated, Xiang Yu lifts his cup" },
  { id: "10b", line: 10, from: capWord(10, "范增").from, place: "tent", cam: "jadeIn", what: "Fan Zeng alone, glaring at Liu Bang" },
  { id: "11", line: 11, from: line(11).from, place: "tent", cam: "jadeIn", move: ["jade", line(11).from, line(11).from + 16], joined: true, what: "the jade three times; Xiang Yu drinks" },
  { id: "12a", line: 12, from: line(12).from, place: "tent", cam: "master", what: "the dancer comes in and salutes" },
  { id: "12b", line: 12, from: cap(12, 2).from, place: "tent", cam: "dance", what: "the dancer draws and turns on Liu Bang" },
  { id: "13", line: 13, from: line(13).from, place: "tent", cam: "dance", joined: true, what: "the uncle steps between blade and Liu Bang" },
  { id: "14", line: 14, from: seg("D").from, place: "tent", cam: "door", what: "the guards knocked aside, Fan Kuai in the doorway" },
  { id: "15a", line: 15, from: line(15).from, place: "tent", cam: "two", what: "Fan Kuai praised; the servant with the leg" },
  { id: "15b", line: 15, from: cap(15, 1).from, place: "tent", cam: "two", move: ["floor", cap(15, 1).from, cap(15, 1).from + 11], joined: true, what: "the raw leg on the shield" },
  { id: "16", line: 16, from: line(16).from, place: "tent", cam: "floor", move: ["master", line(16).from, line(16).from + 13], joined: true, what: "Liu Bang rises, beckons, both leave; the empty seat" },
  { id: "17", line: 17, from: line(17).from, place: "camp", cam: "tentDoor", move: ["tentDoorIn", cap(17, 1).from, cap(17, 1).from + 15], what: "outside the door: Liu Bang hesitates, Fan Kuai answers" },
  { id: "18a", line: 18, from: seg("E").from, place: "gate", cam: "gate", what: "the carriages left standing; one horse leaves" },
  { id: "18b", line: 18, from: cap(18, 2).from, place: "path", cam: "hill", what: "the horse and four runners on the hill road" },
  { id: "19a", line: 19, from: line(19).from, place: "camp", cam: "tentSky", what: "Zhang Liang waits; the sun moves" },
  { id: "19b", line: 19, from: cap(19, 1).from, place: "tent", cam: "two", what: "Zhang Liang bows by the empty seat; Xiang Yu shrugs" },
  { id: "20", line: 20, from: line(20).from, place: "dayL", cam: "campDay", move: ["campDayIn", cap(20, 2).from + 10, line(20).to + 1], what: "the informer marched off; his cap rolls back in" },
  { id: "21", line: 21, from: line(21).from, place: "tent", cam: "two", what: "Xiang Yu admires the jade, unaware; the inset replay" },
  { id: "22", line: 22, from: pre(22), place: "privy", cam: "privy", what: "the privy again: ends on exactly frame 0 of the film" },
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
/** the cut rules of 08_arthur_transitions.md as a check (T1: no shot under 18 frames; a segment's first shot starts
 *  on the segment's first frame; shots are in order): returns the complaints, [] = clean. A "shot" for T1 is a run of
 *  joined shots (same tripod, no cut). */
export const shotCheck = (): string[] => {
  const bad: string[] = [];
  for (let i = 0; i < SHOTS.length; i++) {
    const s = SHOTS[i];
    if (i && s.from <= SHOTS[i - 1].from) bad.push(`shot ${s.id} does not start after ${SHOTS[i - 1].id}`);
    if (s.move && (s.move[1] < s.from || s.move[2] > s.to || s.move[2] - s.move[1] < 9)) bad.push(`shot ${s.id}: its move ${s.move[1]}-${s.move[2]} is outside the shot ${s.from}-${s.to} or shorter than 10 frames`);
    if (s.joined) continue;
    let end = s.to; for (let k = i + 1; k < SHOTS.length && SHOTS[k].joined; k++) end = SHOTS[k].to;
    if (end - s.from + 1 < 18) bad.push(`shot ${s.id} is ${end - s.from + 1} frames long (under 18)`);
  }
  for (const g of SEGMENTS) if (!SHOTS.some((s) => s.from === g.from)) bad.push(`segment ${g.id} does not start on a shot`);
  return bad;
};

// ---------------------------------------------------------------------------------------------------- hits
/** the frame a word starts on: put the hit (a stamp, a slam, a pop) there */
export const HIT = {
  /** line 1: 上厕所 / 暗杀 */ toilet: capWord(1, "上厕所").from, assassination: capWord(1, "暗杀").from,
  /** line 2: the title stamp 鸿门宴; 只死了一个人; the "?" over the silhouette (不在席上) */
  title: capWord(2, "鸿门宴").from, oneDead: capWord(2, "只死了一个人").from, question: capWord(2, "不在席上").from + 4,
  /** line 3: the flag goes into the wall (打下了都城) */ flag: cap(3, 2).from + 3,
  /** line 4: the two numbers */ n40: capWord(4, "四十万").from, n10: capWord(4, "对他").from /* "十万" is also inside "四十万" */,
  /** line 5: the whisper (告密) */ inform: capWord(5, "告密").from,
  /** line 6: the fist on the table */ slam: line(6).from + 2,
  /** line 7: the uncle walks in (叔叔), the cup goes up (刘邦当场), the clasp + the stamp 亲家 */
  uncleIn: cap(7, 1).from, toast: cap(7, 3).from, qinjia: capWord(7, "亲家").from,
  /** line 8: the bow (上门赔罪) */ bow: cap(8, 1).from,
  /** line 9: the inset pops (是你手下), the name slams on it (曹无伤) */ inset: cap(9, 1).from, name: capWord(9, "曹无伤").from,
  /** line 10: 范增; 必须死 */ fanZeng: capWord(10, "范增").from, mustDie: capWord(10, "必须死").from,
  /** line 11: the three raises of the jade (spread over the line's first two caption groups); 没反应 */
  jade: [0, 1, 2].map((i) => Math.round(cap(11, 0).from + 11 + (i * (cap(11, 1).end - cap(11, 0).from - 26)) / 2)) as [number, number, number],
  noReaction: capWord(11, "没反应").from,
  /** line 12: the dancer's tag; the draw (舞剑); the idiom stamp */ dancer: cap(12, 0).from + 19, draw: capWord(12, "舞剑").from, idiomDance: cap(12, 2).from + 4,
  /** line 13: the uncle rises (shortly before the line); he stands in the way (用身子挡着) */ uncleRise: line(13).from - 17, shield13: cap(13, 2).from,
  /** line 14: the shield hits the guards (撞倒); he stands in the doorway (冲了进来) */ ram: cap(14, 1).from, burstIn: cap(14, 2).from,
  /** line 15: the leg comes down (赏他一条猪腿); 生的 */ leg: cap(15, 1).from, raw: capWord(15, "生的").from,
  /** line 16: he beckons (把樊哙也叫了出去) */ beckon: cap(16, 1).from,
  /** line 17: Fan Kuai starts (樊哙说); 刀俎; 鱼肉 */ fanKuaiSays: cap(17, 1).from, daozu: capWord(17, "刀俎").from, yurou: capWord(17, "鱼肉").from,
  /** line 18: 一匹马 */ horse: capWord(18, "一匹马").from,
  /** line 19: 喝多了 (Xiang Yu shrugs) */ drunk: capWord(19, "喝多了").from,
  /** line 20: Liu Bang points (杀了曹无伤); the three are out and the cap rolls in (那个告密的军官) */ kill: capWord(20, "曹无伤").from, capRoll: cap(20, 2).from + 5,
  /** line 21: the inset pops; the bubble 曹无伤 (说漏) */ inset21: line(21).from + 9, slip: capWord(21, "说漏").from,
};

// ---------------------------------------------------------------------------------------------------- name tags
/** the first frame of each name tag (about 36 frames each: TAG_LEN). The informer's tag reads 刘邦的军官 at `officer`
 *  and 曹无伤 · 告密的 at `informer` (line 9, on the inset) and `informerAgain` (line 20). */
export const TAG_LEN = 36;
export const TAG = {
  liu: line(1).from + 6,
  xiangYu: line(4).from,
  officer: cap(5, 0).from + 20,
  uncle: cap(7, 1).from + 3,
  informer: HIT.name,
  fanZeng: HIT.fanZeng,
  dancer: HIT.dancer,
  fanKuai: Math.min(cap(14, 0).from + 37, cap(14, 1).from - 2),
  zhang: cap(19, 1).from + 5,
  informerAgain: line(20).from + 12,
};

// ---------------------------------------------------------------------------------------------------- the rest
export const BEAT = {
  /** the 《史记》 source tag is on from here (line 3) until `sourceOff` (the cut back to the privy) */
  source: shot("3").from, sourceOff: shot("22").from,
  /** the privy shots: the opening is frames 0 .. privyLen - 1; the closing starts on privyBack and its last frame is
   *  the film's last frame = the film's frame 0 */
  privyLen: shot("1").to + 1, privyBack: shot("22").from, loop: TOTAL - 1,
  /** line 2: the slow push toward the door starts (最后只死了一个人) */ push2: HIT.oneDead,
  /** line 16: Liu Bang is through the flap; Fan Kuai is out (the frame ends on the empty seat) */
  liuOut: cap(16, 1).from + 6, fanKuaiOut: line(16).to + 1,
  /** line 20: the three start to march; they are out of frame */ march: line(20).from + 32, marchedOut: cap(20, 2).from + 5,
};
