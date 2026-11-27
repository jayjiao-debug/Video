// 采访月老的一天: the frames of the PICTURE's own events that the sound hits (stamps, the slam, the whip, the spool, the
// mitten, the power-off), computed from the same timing the shots use, so a hit can never drift from its picture.
// Run (no browser needed):
//   node_modules/.bin/esbuild scripts/yuelao/sound/events.ts --bundle --platform=node --format=cjs --outfile=/tmp/yl_events.js \
//     --log-level=error --external:three --external:react --external:react-dom --external:remotion --external:@remotion/*
//   NODE_PATH=node_modules node /tmp/yl_events.js 2>/dev/null | grep '^{' > /home/user/yuelao_work/film/sound/events.json
// make_cues.py reads that file. Every formula here is copied from the shot that draws the event (file named per line).
import { line, seg, TITLE_BLOCK } from "../../../src/videos/yuelao/story";
import { cap, capWord } from "../../../src/videos/yuelao/captions";
import { OFF_AT } from "../../../src/videos/yuelao/hud";
const w = (id: string, word: string) => capWord(id, word).from;
const st = (id: string) => cap(id, 0).from, en = (id: string) => line(id).to;
const CARD = (() => { const from = en("A02") + 5; return { from, to: from + 87 }; })();          // freeze.ts
const x06 = en("F06"), x08 = en("I08");
const fall = en("D03") + 3, got = fall + 10, thrown = en("D05") + 2, land = thrown + 12;            // segD.ts
const e04 = st("E04");
const ev: Record<string, number> = {
  cardFrom: CARD.from, yank: CARD.to + 22,                                                            // segA.ts: snap
  titleThread: TITLE_BLOCK.from + 6, titlePaper: TITLE_BLOCK.from + 15, titleSeal: TITLE_BLOCK.from + 26,   // fx.tsx TITLE_ON; skin.tsx ThreadTitle (seal at paperAt + 11)
  whipBC: seg("C").from - 4,                                                                          // segB.ts / segC.ts whip
  cFile1: st("C02") + 1, cFile2: st("C05") + 15, cFile3: st("C06") + 19, cFile4: st("C07") + 22, cFile5: st("C10") + 10,   // segC.ts card(g + n)
  cStamp1: w("C04", "异地") + 2, cStamp2: w("C05", "变") + 12, cStamp3: w("C06", "跨") + 6, cStamp4: w("C07", "绑成") + 2, cStamp5: st("C10") + 26,   // stampOn + 2 (slap)
  butterflies: w("C05", "变") - 8, slam: w("C09", "仙女") + 13,                                         // segC.ts bf; slam + 3 (shut)
  dGot: got, dSlipSeal: st("D04") + 6 + 10, dThrown: thrown, dLand: land,                              // segD.ts; orderSlip seal at from + 9 (+1 slap)
  eHit1: e04 + 6, eHit2: w("E04", "不合适下") + 6, eHit3: w("E04", "下一个") + 6, eStamp: w("E06", "未到") + 10,   // segE.ts hits; stamp from + 2
  fStamp: x06 - 6, mitten: x06 + 21,                                                                   // segF.ts stamp from x06 - 8; handCover cov = x06 + 14, len 9
  iStamp: x08 + 4, off: OFF_AT,                                                                        // segI.ts stamp from x08 + 2; hud.tsx
};
console.log(JSON.stringify(ev));
