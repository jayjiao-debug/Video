// src/videos/hongmen/hud/: EVERYTHING DRAWN OVER THE PICTURE of the Hongmen film (1080 x 1920 px).
// Notes: /home/user/hm_notes/w_overlays.md. Captions are Film.tsx's <Caption> (text with an ink line, no plate).
// =====================================================================================================================
// THE API (for shot builders). Every one is a PLAIN FUNCTION of the frame that returns a React node: no hooks, no
// state, nothing random, so frames render in any order on fresh pages. Segment files are .ts: call the function and
// put the node into Pose.overlays (frag(...) from shots/common.ts joins several). The same things exist as
// components for .tsx users: <Tag .../>, <Tags .../>, <Stamp .../>, <TitleCard .../>, <Inset .../>, <Bubble .../>.
//
//   import { tag, tags, stamp, title, inset, bubble, count, ratioBar, times, label, arrow } from "../hud";
//
// TIMES are absolute film frames from beats.ts (TAG.x, HIT.x): `from` = first frame; the overlay leaves by itself
// (`len` frames later) or on `out` (the first frame of a 5-frame leave). Give the overlay on EVERY frame of the shot
// (it returns null outside its life).
// PLACES are film px. A head comes from headPx(w, rig) (shots/common.ts, after w.update()): { x, y, r }.
//
//   NAME TAGS (hud/tag.tsx)
//     tag({ f, who: "fanZeng", at: headPx(w, rig), from: TAG.fanZeng })
//     tags(f, [{ who: "xiangYu", at: hx, from: TAG.xiangYu }, { who: "liu", at: hl, from: TAG.liu }], { avoid: [otherHead] })
//       who: "liu" | "xiangYu" | "uncle" | "fanZeng" | "dancer" | "fanKuai" | "zhang" | "officer" | "informer"
//            (also accepted: informerAgain, liuBang, zhangLiang, caoWushang, xiangBo, xiangZhuang)
//       The plate is RED for Liu Bang's side, DEEP PURPLE over CHARCOAL for Xiang Yu's. It sits above the head with its
//       tail on the hat; if there is no room (top safe line, another tag, another head, the caption band, the source
//       tag, the button column) placeTags moves it and the tail still ends on the head. Use tags() for two or more in
//       one shot, and pass the heads of people WITHOUT a tag in `avoid`: then nothing covers a face.
//       Options per tag: len (default TAG_LEN = 36) | out; side: "up" | "left" | "right" | "down" (pins it);
//       lift (tail end above the head centre, in head radii); text + role + camp (a free tag).
//     THE INFORMER: tag({ f, who: "officer", at, from: TAG.officer })                      line 5: 刘邦的军官 + the 密 seal
//                   tag({ f, who: "informer", at, from, flipAt: HIT.name })               reads 刘邦的军官, FLIPS to
//                                                                                          曹无伤 / 告密的 on flipAt
//                   tag({ f, who: "informer", at, from: TAG.informerAgain })              line 20: the same plate, same seal
//       His plate always carries the round cream 密 seal on its corner; nobody else's does. Keep him and his tag in the
//       RIGHT half (layout.ts).
//   THE INSET (hud/inset.tsx): the informer's round picture, upper right (default centre 816, 394, diameter 344: the place segment B checked at the gate)
//     inset({ f, from: HIT.inset, flipAt: HIT.name })       line 9: pops with the plate 刘邦的军官, flips to the name
//     inset({ f, from, out })                               lines 20 / 21: named from the start
//     options: x, y, d, img (a square picture of the real figure as a data URI, laid over the drawn portrait),
//     plate: false. insetRect({ x, y, d }) = the box it takes.
//     bubble({ f, from, out, x, y, text: TXT.informerName, to: mouthPx })   line 21: 「曹无伤」 out of Xiang Yu's mouth
//   STAMPS (hud/stamp.tsx): a red seal slapped on (lands on from + 2 with a shake), gone after len = 36 frames
//     stamp({ f, id: "dance", from: HIT.idiomDance })       「项庄舞剑，意在沛公」   default place 540, 440 (upper third)
//     stamp({ f, id: "fish", from: HIT.daozu })             「人为刀俎，我为鱼肉」
//     stamp({ f, id: "qinjia", from: HIT.qinjia, x, y })    「亲家」      stamp({ f, id: "raw", from: HIT.raw, x, y })  「生的」
//     options: text (any words; ， starts a new row), x, y, size, rot, len | out. stampSize(p) = { w, h } of its block.
//   THE TITLE: title({ f, from: HIT.title, ask: HIT.oneDead, out })   鸿门宴 slams in, 到底死了谁？ pops on `ask`
//     options: x, y (default 540, 330), size, question: false (only 鸿门宴).
//   NUMBERS (hud/extras.tsx)
//     count({ f, from: HIT.n40, x, y, text: TXT.n40, camp: "xiang", size })   counts up and lands with a punch
//     ratioBar({ f, from: HIT.n40, bAt: HIT.n10, y })                         one bar: 4 parts purple, 1 part red
//     times({ f, hits: HIT.jade, x, y })                                      ×1 ×2 ×3
//     label({ f, from, out, x, y, text, size, color });  arrow({ f, from, out, a, b })
//   THE SOURCE TAG 《史记·项羽本纪》 is a HUD (registered below): top left from BEAT.source to BEAT.sourceOff, on every
//     shot whose Pose does not say hud: false. Shots do nothing for it. tags() keeps out of its corner.
//
// ZONES (base.tsx ZONE): nothing above y 210, in the caption band 1190-1498, below 1613, or right of x 930 below
// y 900. Tags obey them by themselves; stamps, the title, numbers and the inset are placed by the builder.
// Looking at them: hud/sheet.tsx (Remotion only: remotion_still.sh HongmenFilm <f> out.png --props='{"hudsheet":"tags","noov":true}').
// =====================================================================================================================
import { registerHud } from "../story";
import { BEAT } from "../beats";
import { sourceTag } from "./extras";
import "./sheet";

export { CAMP, HC, ZONE, plate, plateSize, sealMark, textW, type Camp, type Head, type Rect, type PlateSpec } from "./base";
export * from "./tag";
export * from "./stamp";
export * from "./inset";
export * from "./extras";

// the source tag: on from line 3 to the cut back to the privy (the privy shots say hud: false anyway)
registerHud("source", (f) => sourceTag({ f, from: BEAT.source, out: BEAT.sourceOff - 5 }));
