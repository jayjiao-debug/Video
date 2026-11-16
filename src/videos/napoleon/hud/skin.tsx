// hud/skin.tsx: THE SKIN of the Napoleon film, "Empire": one look for the title, the lead's card and every effect.
// From the two printed worlds that fought over his picture: HIS side is the gilt frame and the engraved army bulletin
// (laurel, the crowned N, the bees of the coronation robe); the ENEMY's is the London caricature (a scratchy pen, a tiny
// man in a huge hat). Chasseur green is his colour; gold, coronation crimson and parchment go with it.
// Motion: military. Things wheel into line and are STAMPED (the kit's slap); nothing plops, nothing floats.
// The repo has one CJK face (FrSans), so Chinese is that face in gold with a dark-green ink line; Latin and numbers are
// a Didone where the machine has one (the Mac has Didot), a plain bold serif elsewhere.
import React from "react";
import { defineSkin, clamp01, easeOut, easeOutBack, hash01, part } from "../../../kit/overlay";

export const SKIN = defineSkin({
  film: "napoleon",
  from: "Napoleon's own propaganda print (gilt frame, engraved bulletin, laurel, crowned N, bees) against the London caricature of him",
  colour: { lead: "#2f6a47", accent: "#a8283a", ink: "#13241b", paper: "#f1e7cf" },
  display: { ink: 0.075, track: 0.1, tilt: -2, hand: { rot: 0, lift: 0, scale: 0 }, rough: { fx: 0.8, fy: 0.8, scale: 2.4, seed: 4 } },
  body: { ink: 0, track: 0.08, tilt: -2, hand: { rot: 0, lift: 0, scale: 0 }, rough: null },
  material: "engraved bulletin sheet, gilt frame, crimson wax, gold bees; the enemy's scratchy pen",
  motion: { arrive: 5, over: 1.4, leave: 5, hit: "wheels into line on a drum, then is stamped like a seal" },
});
export const EM = {
  green: SKIN.colour.lead, greenDeep: "#1f4a32", greenLight: "#3f8259", crimson: SKIN.colour.accent, crimsonDeep: "#741828", crimsonLight: "#cf4a55",
  ink: SKIN.colour.ink, cream: SKIN.colour.paper, creamLo: "#dccfae", gold: "#e2b64e", goldLight: "#f8e29a", goldDeep: "#9a6c1e", shadow: "rgba(8,20,12,0.5)",
};
export const DIDONE = "Didot, 'Bodoni 72', 'Playfair Display', 'Liberation Serif', 'DejaVu Serif', serif";

/** the skin's gradients: put once inside an <svg><defs> */
export const SkinDefs: React.FC<{ id: string }> = ({ id }) => (
  <>
    <linearGradient id={`${id}Gold`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={EM.goldLight} /><stop offset="0.5" stopColor={EM.gold} /><stop offset="1" stopColor={EM.goldDeep} /></linearGradient>
    <linearGradient id={`${id}Gilt`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={EM.goldLight} /><stop offset="0.35" stopColor={EM.gold} /><stop offset="0.6" stopColor={EM.goldDeep} /><stop offset="0.8" stopColor={EM.gold} /><stop offset="1" stopColor={EM.goldLight} /></linearGradient>
    <linearGradient id={`${id}Green`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={EM.greenLight} /><stop offset="0.5" stopColor={EM.green} /><stop offset="1" stopColor={EM.greenDeep} /></linearGradient>
    <linearGradient id={`${id}Wax`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={EM.crimsonLight} /><stop offset="0.5" stopColor={EM.crimson} /><stop offset="1" stopColor={EM.crimsonDeep} /></linearGradient>
  </>
);

/** WHEEL INTO LINE: a part swings in about its left end like a rank wheeling (deg from `from` to 0) while it opens */
export const wheel = (t: number, at: number, n = 6, from = -16) => { const k = easeOutBack(part(t, at, n), 1.4); return { k, rot: from * (1 - k), o: part(t, at, 2) }; };
/** MARCH IN: from `dx` px to the side, with a step's bob */
export const march = (t: number, at: number, n = 6, dx = -70) => { const p = part(t, at, n), k = easeOut(p); return { x: dx * (1 - k), y: -7 * Math.abs(Math.sin(p * Math.PI * 2)) * (1 - p), o: part(t, at, 2) }; };
/** the leave: a part shrinks to nothing over the last `n` frames of a life of `len`. NO fade: a group opacity over a
 *  mask or a filter is drawn twice by the headless renderer (seen 16 Nov), so the skin never fades a group. */
export const leave = (t: number, len: number, n = 5) => { const k = clamp01((t - (len - n)) / n); return { s: 1 - k * k, o: 1 }; };

/** THE BEE of his coronation robe, head up, about 44 x 50 px at s 1; flap -1..1 opens the wings */
export const Bee: React.FC<{ x: number; y: number; s?: number; rot?: number; flap?: number; off?: boolean }> = ({ x, y, s = 1, rot = 0, flap = 0, off }) => (
  <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})`}>
    {off ? <ellipse cx={0} cy={4} rx={10} ry={17} fill="none" stroke={EM.ink} strokeOpacity={0.28} strokeWidth={3} strokeDasharray="5 5" /> : <>
      {[-1, 1].map((d) => <ellipse key={d} cx={d * 13} cy={-1} rx={9} ry={19} fill={EM.cream} stroke={EM.ink} strokeWidth={3.5} transform={`rotate(${d * (40 + 14 * flap)} ${d * 4} 4)`} />)}
      <ellipse cx={0} cy={7} rx={10} ry={17} fill={EM.gold} stroke={EM.ink} strokeWidth={3.5} />
      <path d="M-8,3 h16 M-9,10 h18 M-7,17 h14" stroke={EM.ink} strokeWidth={3} strokeLinecap="round" />
      <circle cx={0} cy={-13} r={7} fill={EM.goldDeep} stroke={EM.ink} strokeWidth={3.5} />
    </>}
  </g>
);

/** A LAUREL BRANCH on a circle (centre cx, cy; radius R): `side` -1 = the left branch, 1 = the right; it grows from the
 *  bottom to the top as k goes 0..1, a pair of leaves at a time */
export const Laurel: React.FC<{ cx: number; cy: number; R: number; side: 1 | -1; k: number; fill: string; n?: number; leaf?: number }> = ({ cx, cy, R, side, k, fill, n = 10, leaf = 38 }) => {
  const a0 = 90 - side * 14, a1 = 90 - side * 158, out: React.ReactNode[] = [];
  const pt = (a: number, r = R) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const shown = clamp01(k) * n;
  const [sx, sy] = pt(a0), aEnd = a0 + (a1 - a0) * clamp01(k), [ex, ey] = pt(aEnd);
  out.push(<path key="stem" d={`M${sx.toFixed(1)},${sy.toFixed(1)} A${R},${R} 0 0 ${side > 0 ? 0 : 1} ${ex.toFixed(1)},${ey.toFixed(1)}`} fill="none" stroke={EM.ink} strokeWidth={9} strokeLinecap="round" />);
  out.push(<path key="stem2" d={`M${sx.toFixed(1)},${sy.toFixed(1)} A${R},${R} 0 0 ${side > 0 ? 0 : 1} ${ex.toFixed(1)},${ey.toFixed(1)}`} fill="none" stroke={EM.goldDeep} strokeWidth={4} strokeLinecap="round" />);
  for (let i = 0; i < n; i++) {
    const g = easeOutBack(clamp01(shown - i), 2.2);
    if (g <= 0) continue;
    const a = a0 + ((a1 - a0) * (i + 0.5)) / n, [x, y] = pt(a), tan = a - side * 90, sz = leaf * (1 - 0.25 * (i / n));
    for (const d of [-1, 1]) out.push(
      <path key={`${i}${d}`} d={`M0,0 C${(sz * 0.3).toFixed(1)},${(-sz * 0.3).toFixed(1)} ${(sz * 0.75).toFixed(1)},${(-sz * 0.24).toFixed(1)} ${sz.toFixed(1)},0 C${(sz * 0.75).toFixed(1)},${(sz * 0.24).toFixed(1)} ${(sz * 0.3).toFixed(1)},${(sz * 0.3).toFixed(1)} 0,0 Z M${(sz * 0.12).toFixed(1)},0 H${(sz * 0.8).toFixed(1)}`} fill={fill} stroke={EM.ink} strokeWidth={3.5} strokeLinejoin="round"
        transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(tan + d * 34 + 6 * (hash01(i, d + 3) - 0.5)).toFixed(1)}) scale(${g.toFixed(3)})`} />);
  }
  return <>{out}</>;
};

/** THE CROWNED N centred on (0, 0): about 120 px wide, 170 high at s 1 */
export const CrownedN: React.FC<{ fill: string }> = ({ fill }) => (
  <g>
    <g transform="translate(0,-52)" stroke={EM.ink} strokeWidth={4} strokeLinejoin="round">
      <path d="M-42,22 L-48,-14 L-26,4 L-13,-26 L0,2 L13,-26 L26,4 L48,-14 L42,22 Z" fill={fill} />
      <rect x={-44} y={20} width={88} height={13} rx={4} fill={fill} />
      {[-48, -13, 13, 48].map((x, i) => <circle key={i} cx={x} cy={i % 3 ? -29 : -17} r={6} fill={EM.cream} />)}
      <circle cx={0} cy={27} r={4} fill={EM.crimson} stroke="none" />
    </g>
    <text x={0} y={62} textAnchor="middle" fontFamily={DIDONE} fontWeight={700} fontSize={118} fill={fill} stroke={EM.ink} strokeWidth={7} strokeLinejoin="round" style={{ paintOrder: "stroke fill" } as React.CSSProperties}>N</text>
  </g>
);

/** THE LONDON CARICATURE, the enemy's version: a tiny man under a huge hat in a scratchy pen, about 150 x 170 px, feet
 *  on (0, 0). k 0..1 draws it on. */
export const LittleBoney: React.FC<{ k: number }> = ({ k }) => {
  const dash = (len: number, at: number, n: number) => ({ strokeDasharray: len, strokeDashoffset: len * (1 - clamp01((k - at) / n)) });
  const pen = { fill: "none", stroke: "#3a2c22", strokeWidth: 3.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <g>
      <path d="M-70,-112 C-44,-150 44,-152 72,-110 C40,-122 -38,-122 -70,-112 Z" {...pen} fill="rgba(58,44,34,0.82)" fillOpacity={clamp01((k - 0.2) / 0.2)} {...dash(330, 0, 0.3)} />
      <path d="M-6,-146 l4,-24 l10,2 l-4,24" {...pen} fill="rgba(168,40,58,0.6)" fillOpacity={clamp01((k - 0.3) / 0.1)} {...dash(70, 0.25, 0.1)} />
      <path d="M-20,-108 C-24,-84 22,-84 20,-108 M-9,-99 l1,2 M9,-99 l1,2 M-5,-90 q5,-4 10,0" {...pen} {...dash(150, 0.3, 0.2)} />
      <path d="M-22,-84 C-30,-56 -24,-40 -18,-34 L18,-34 C26,-44 30,-60 22,-84 M-24,-74 l-20,22 M24,-74 l22,-30 l4,-26" {...pen} fill="rgba(47,106,71,0.35)" fillOpacity={clamp01((k - 0.6) / 0.15)} {...dash(260, 0.45, 0.25)} />
      <path d="M-14,-34 l-4,26 l-14,8 M12,-34 l6,26 l16,8 M-2,-34 v10" {...pen} {...dash(130, 0.7, 0.2)} />
      <path d="M40,-132 l10,-8 M54,-126 l12,-2 M-46,-2 h100" {...pen} strokeWidth={2.2} {...dash(130, 0.85, 0.15)} />
    </g>
  );
};
