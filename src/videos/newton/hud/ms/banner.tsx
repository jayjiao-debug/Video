// hud/ms/banner.tsx: SKIN A's SIDE CARD for HUMPHREY (EFFECTS_PLAN row 2; stage 2b): a banner on the live shot under
// A04 「助手小哥，他平时笑吗？」, no freeze. A slip of the same laid paper with a wash of HIS drab (his coat, MS.hum),
// never crimson: the small tag 助手 boxed, his name 汉弗莱 written with the broad nib in iron-gall ink, a dotted sepia
// rule, 今日关键证人 (why he matters today: the only witness of the laugh). Its one crimson rubric mark is the margin's
// pointing hand (manicule), its tip on his CHEEK LINE (the head's outline, low on the side facing the slip), never on
// his face.
// Where: director r1 note 6 (Jay 20:15: a side card stays 3-4 s and travels with its person): AT THE APPROVED SIZE
// (scale 1.0: 今日关键证人 36 px, its glyphs 31-34 px tall; the 助手 tag 29 px), placed from his head on EVERY frame
// (hud/ms/bannerplace.ts): beside his head where the frame leaves room (the approved place), else below the lowest
// point his head reaches (today's A04: his face reaches x 336-433 on f340-378, no room beside it), sliding with him;
// the manicule's tip on his cheek line (about 6 px outside his outline: the inked fingertip on the outline line, its
// paper backing never his skin), pointing at his head. The checkers read the same per-frame boxes (when.ts
// bannerBoxesAt, from the probed track.ts); the live place is held within a few px of the track's.
// When: in as he comes out of his door (A03's end + 0.6 s + 4 f), gone the frame before A05: the slip laid in 3 f,
// the name written in 6 f, the tag and the line, the hand drawn last (beats slip 0, name 3, tag 7, hand 9); it holds;
// out over its last 6 frames by sinking into the paper.
// Look: looks/frames/A_humphrey.png, looks/src/skin_a.py humphrey(). Ids: newton-ms-banner*. A pure function of (f, ctx).
import React from "react";
import { clamp } from "../../../../kit/overlay";
import { MS, MOTION } from "./skin";
import { msDefs, nibFilter, quill, inkText, leaf, manicule, writeK } from "./marks";
import { msItem, msT, bannerTrackPlace } from "./when";
import { Sheet, layK, about, exitK, sinkDef } from "./fxkit";
import { msFig, type MsCtx } from "./screen";
import { BAN, SLIP, bannerPlace, type BannerPlace } from "./bannerplace";

const P = "newton-ms-banner";
/** the approved slip (skin_a.py humphrey: paper(70, 300, 344, 250, -2.5)); everything below is drawn in these coords
 *  and then moved and scaled onto the frame */
const { X0, Y0, W, H, ROT } = SLIP;
/** how far the live place may stray from the probed track's (px): the checkers test the track's boxes */
const HOLD = 6;
/** THE PLACE on this frame: from his live head (ctx), held within HOLD px of the track's place (when.ts) */
const place = (f: number, ctx: MsCtx | null | undefined): BannerPlace => {
  const tr = bannerTrackPlace(f), h = ctx ? msFig(ctx, "humphrey") : null;
  if (!h || !h.front) return tr;
  const lv = bannerPlace({ x: h.head.x, y: h.head.y, r: h.r }, msItem("banner").box[0]);
  const near = (a: number, b: number) => clamp(a, b - HOLD, b + HOLD);
  const tip = { x: near(lv.tip.x, tr.tip.x), y: near(lv.tip.y, tr.tip.y) };
  const rot = Math.abs(((lv.rot - tr.rot + 540) % 360) - 180) <= 8 ? lv.rot : tr.rot;
  return { ...lv, x: near(lv.x, tr.x), y: near(lv.y, tr.y), tip, rot };
};

export const MsBanner: React.FC<{ f: number; ctx?: MsCtx | null }> = ({ f, ctx }) => {
  const t = msT("banner", f);
  if (t === null) return null;
  const b = msItem("banner").beats, ex = exitK(t, b.out, b.leave);
  const pl = place(f, ctx);
  const lay = layK(t, b.slip);
  const cx = X0 + W / 2, cy = Y0 + H / 2;
  // the slip's things, in the approved coords
  const tagK = writeK(t, b.tag, 3), ruleK = writeK(t, b.tag + 1, 4);
  const sink = ex.ink > 0 ? `url(#${P}-sink)` : undefined;
  const slip = (
    <g transform={about(cx, cy, lay.s)} opacity={lay.o}>
      {leaf(P, `${P}-leaf`, X0, Y0, W, H, ROT, { fill: MS.slip, small: true, fox: false, opacity: ex.paper }, (
        <g opacity={ex.paper}>
          {/* HIS drab: a band down the left edge and a faint wash over the slip */}
          <rect x={X0} y={Y0} width={22} height={H} fill={MS.hum} opacity={0.85} filter={`url(#${P}-torn2)`} />
          <rect x={X0 + 22} y={Y0} width={W - 22} height={H} fill={MS.hum} opacity={0.1} />
        </g>
      ))}
      <g transform={`rotate(${ROT} ${cx} ${cy})`} filter={sink}>
        {tagK > 0 ? <rect x={X0 + 40} y={Y0 + 26} width={74} height={40} rx={4} fill="none" stroke="#000" strokeWidth={2.5} filter={`url(#${P}-inkAsm)`} pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={(1 - tagK).toFixed(3)} /> : null}
        {inkText(`${P}-tag`, "助手", X0 + 77, Y0 + 57, 29, `${P}-inkAsm`, { anchor: "middle", ls: 2, w: 60, write: { t, at: b.tag, per: 1 } })}
        {quill(`${P}-name`, "汉弗莱", X0 + 38, Y0 + 156, 96, `${P}-nib`, { rots: [-3, 2, -2], lifts: [0, 4, 0], scales: [1, 0.97, 1.02], track: 2, seed: 7, core: MS.edgeInk, write: { t, at: b.name, per: 2, pool: MOTION.pool } })}
        {ruleK > 0 ? <line x1={X0 + 40} y1={Y0 + 182} x2={X0 + 40 + 282 * ruleK} y2={Y0 + 182} stroke="#000" strokeWidth={2} strokeDasharray="3 7" filter={`url(#${P}-inkS)`} /> : null}
        {inkText(`${P}-why`, "今日关键证人", X0 + 40, Y0 + 228, 36, `${P}-inkAsm`, { ls: 1, w: 6 * 36 + 5, write: { t, at: b.tag, per: 0.9 } })}
      </g>
    </g>
  );
  // the slip moved and scaled onto the frame
  const tr = `translate(${pl.x.toFixed(1)} ${pl.y.toFixed(1)}) scale(${pl.s.toFixed(3)}) translate(${-X0} ${-Y0})`;
  const handK = writeK(t, b.hand, 6);
  return (
    <Sheet id={P}>
      <defs>
        {msDefs(P)}
        {nibFilter(`${P}-nib`, MS.ink, MS.edgeInk, 96, 7)}
        {sinkDef(`${P}-sink`, ex.ink)}
      </defs>
      <g transform={tr}>{slip}</g>
      {/* THE RUBRIC MARK: the crimson manicule, its tip on his cheek line */}
      {handK > 0 ? (
        <g opacity={ex.paper} filter={sink}>
          {manicule(P, `${P}-hand`, pl.tip.x, pl.tip.y, BAN.HAND_S, pl.rot, { k: handK })}
        </g>
      ) : null}
    </Sheet>
  );
};
