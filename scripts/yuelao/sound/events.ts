// 采访月老的一天: the frames of the PICTURE's own events that the sound hits (the token, the cord, the plaque, the books,
// the stamps, the spool, the mitten, the power-off), computed from the same timing the shots use, so a hit can never
// drift from its picture. v7 (28 Nov): scene A's name token and title plaque (v6), scene C's five case books (v6, read
// from segC.ts itself), scene G's strands pulled off her lens.
// Run (no browser needed):
//   node_modules/.bin/esbuild scripts/yuelao/sound/events.ts --bundle --platform=node --format=cjs --outfile=/tmp/yl_events.js \
//     --log-level=error --external:three --external:react --external:react-dom --external:remotion --external:@remotion/*
//   NODE_PATH=node_modules node /tmp/yl_events.js 2>/dev/null | grep '^{' > <work>/events.json
// make_cues.py reads that file. Formulas not imported are copied from the shot that draws the event (file named per line).
import { line, seg } from "../../../src/videos/yuelao/story";
import { cap, capWord } from "../../../src/videos/yuelao/captions";
import { OFF_AT } from "../../../src/videos/yuelao/hud";
import { TOKEN, TITLE_ON } from "../../../src/videos/yuelao/fx";
import { W_, CASE_T as CASES, BACK } from "../../../src/videos/yuelao/shots/segC_time";
const w = (id: string, word: string) => capWord(id, word).from;
const st = (id: string) => cap(id, 0).from, en = (id: string) => line(id).to;
const x06 = en("F06"), x08 = en("I08");
const fall = en("D03") + 3, got = fall + 10, thrown = en("D05") + 2, land = thrown + 12;            // segD.ts
const e04 = st("E04");
const T = TITLE_ON.from + TITLE_ON.threadAt;                                                        // hud/skin.tsx ThreadTitle: H0 = hang(from + threadAt)
const wound = w("G02", "缠"), x02 = en("G02");                                                      // segG.ts pulls
const ev: Record<string, number> = {
  // A · segA.ts: the token comes down on its cord (hang, 10 frames), its slip slides out at +11; the cord parts at +40
  tokenIn: TOKEN.from, tokenSlip: TOKEN.from + 11, snap: TOKEN.from + 40,
  // A · the plaque drops (its overshoot lands about 7 frames in) and the crescent seal slaps on at +15 (slap(H0.t, 15))
  titleDrop: T, titleClack: T + 7, titleSeal: T + 15,
  // B → C · the whip pan
  whipBC: seg("C").from - 4,
  // C · segC.ts: each book leaves its drawer (leave), its pop-up stands (open[0]); the gags; the flights back
  cLeave0: CASES[0].leave, cLeave1: CASES[1].leave, cLeave2: CASES[2].leave, cLeave3: CASES[3].leave, cLeave4: CASES[4].leave,
  cOpen0: CASES[0].open[0], cOpen1: CASES[1].open[0], cOpen2: CASES[2].open[0], cOpen3: CASES[3].open[0],
  cBack0: BACK[0][0], cIn0: BACK[0][1],
  butterflies: W_.bf + 4, cHide: CASES[1].shut[1], cDrop1: CASES[1].exit + 9,                       // 梁祝: shut on 这单, dropped behind him (lands 9 frames on)
  slips: W_.appr + 6, cDrop2: CASES[2].exit + 8,                                                     // 白蛇传: the concertina climbs; let fall at his feet
  cChai: W_.chai + 6, letters: W_.curse - 4, cBack3: BACK[3][0], cIn3: BACK[3][1],                  // 红楼梦: lands on 宝钗; the letters burst; hurled back
  sealUp: W_.that + 7, sealSlam: W_.c11 + 2, cBack4: BACK[4][0], cIn4: BACK[4][1],                  // 天仙配: the seal springs up, slams down; the book flies home
  // D · segD.ts: the burner pings (puff + 4); the slip falls out of the smoke and he catches it; orderSlip seal at from + 9 (+1 slap)
  dPing: seg("D").from + 8 + 4, dGot: got, dSlipSeal: st("D04") + 6 + 10, dThrown: thrown, dLand: land,
  // E · segE.ts hits; stamp from + 2
  eHit1: e04 + 6, eHit2: w("E04", "不合适下") + 6, eHit3: w("E04", "下一个") + 6, eStamp: w("E06", "未到") + 10,
  // F · segF.ts stamp from x06 - 8; handCover cov = x06 + 14, len 9
  fStamp: x06 - 6, mitten: x06 + 21,
  fFreeR: en("F04") - 12 + 3, fFreeL: w("F05", "修个") + 6 + 3,                                      // segF.ts freeR = tugR + 3, freeL = tugL + 3
  // G · segG.ts: the four strands pulled off her lens (each with its small jolt at + 1)
  gPull1: wound + 6 + 1, gPull2: wound + 17 + 1, gPull3: wound + 28 + 1, gPull4: x02 + 1 + 1,
  // I · segI.ts stamp from x08 + 2; hud.tsx
  iStamp: x08 + 4, off: OFF_AT,
};
for (const k of "ABCDEFGHIJ") ev["seg_" + k] = seg(k).from;                                         // the scenes' first frames (make_cues.py anchors on them)
console.log(JSON.stringify(ev));
