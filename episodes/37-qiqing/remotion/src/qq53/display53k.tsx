import React from 'react';
import {cl} from '../qq50/kit50';
import {B} from '../qq50/styleB';
import {Cam, V3, proj, poly, mix, toCam} from './parts53';
import {RingDisc} from './props53';
/* ep53 · the display (展台), v3: ONE lectern vitrine used at the start (take53 `Museum`) and at the end (hall53d / scene53d `CaseW`).
   Case frame, mm (the sword's own frame): sword axis along x at y = 0, z = 1000, pommel face x = −278, tip x = +278; the viewer
   stands on the −y side. A low dark plinth whose top (the deck) slopes 22° toward the viewer; the sword lies over it on two small
   clear rests; a LOW glass hood (115 mm over the deck) closes it: thin bright edges, one reflection streak, nothing else.
   The plinth is 760 × 520 mm (narrow on purpose: a v3 camera can hold the sword at 60 % of the frame width with the hood still inside it), so in the wide hall views the whole hood stays inside the frame.
   Layers: DisplayBack (plinth, deck, light, shadow, rests, mirror, the hood's far edges) goes UNDER the sword;
   DisplayFront (the hood's near faces, edges and the streak) goes OVER it. The etched title is the master's plaque mapped onto
   `titleQuadOn`. v3-e: the title is back on the FRONT glass, facing the camera as in v2: the hood's front pane carries a tall clear
   leaf (the title glass, `TitleLeaf`, up to 1475 mm) on which the title is etched, large, in front of the sword. The pommel mirror
   is gone (it read as a stray object); `PommelMirror` / `mirrorAt` stay exported but nothing draws them. */
export const DTILT = 22 * Math.PI / 180;
const TN = Math.tan(DTILT);
/** deck (plinth top) extents and the deck height under the sword axis */
export const DX0 = -385, DX1 = 375, DY0 = -190, DY1 = 330, DZ0 = 955;
/** the hood: inset 14 mm on the deck, 115 mm tall (vertical, over the deck) */
export const HX0 = DX0 + 14, HX1 = DX1 - 14, HY0 = DY0 + 14, HY1 = DY1 - 14, HH = 115;
export const deckZ = (y: number) => DZ0 + y * TN;
const dk = (x: number, y: number, dz = 0): V3 => [x, y, deckZ(y) + dz];
const hb = (x: number, y: number): V3 => [x, y, deckZ(y)];
const ht = (x: number, y: number): V3 => [x, y, deckZ(y) + HH];
const facing = (c: Cam, q: V3, n: V3) => (c.p[0] - q[0]) * n[0] + (c.p[1] - q[1]) * n[1] + (c.p[2] - q[2]) * n[2] > 0;
const N_TOP: V3 = [0, -Math.sin(DTILT), Math.cos(DTILT)];

/** distance (mm) from the camera to the hood's box (0 inside) */
export const hoodDist = (c: Cam) => { const [x, y, z] = c.p, dx = Math.max(HX0 - x, 0, x - HX1), dy = Math.max(HY0 - y, 0, y - HY1);
	const zl = deckZ(Math.max(HY0, Math.min(HY1, y))), dz = Math.max(zl - z, 0, z - (zl + HH)); return Math.hypot(dx, dy, dz * Math.cos(DTILT)); };
const segDist = (p: V3, a: V3, b: V3) => { const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
	const u = cl((ab[0] * ap[0] + ab[1] * ap[1] + ab[2] * ap[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2));
	return Math.hypot(ap[0] - u * ab[0], ap[1] - u * ab[1], ap[2] - u * ab[2]); };
/** the hood's visibility from where the camera is: it dissolves as the lens comes within ~30 cm of the glass (never cut through) */
const hoodVis = (c: Cam) => cl((hoodDist(c) - 30) / 280);

/* the hood's faces (glass) and its 12 edges with their two adjacent faces (−1 = the deck) */
type Face = {q: V3[]; n: V3};
const FACES: Face[] = [
	{q: [ht(HX1, HY0), ht(HX0, HY0), hb(HX0, HY0), hb(HX1, HY0)], n: [0, -1, 0]},          // 0 front
	{q: [ht(HX0, HY1), ht(HX1, HY1), hb(HX1, HY1), hb(HX0, HY1)], n: [0, 1, 0]},           // 1 back
	{q: [ht(HX0, HY0), ht(HX0, HY1), hb(HX0, HY1), hb(HX0, HY0)], n: [-1, 0, 0]},          // 2 pommel end
	{q: [ht(HX1, HY1), ht(HX1, HY0), hb(HX1, HY0), hb(HX1, HY1)], n: [1, 0, 0]},           // 3 tip end
	{q: [ht(HX0, HY0), ht(HX1, HY0), ht(HX1, HY1), ht(HX0, HY1)], n: N_TOP}];              // 4 top (sloped, parallel to the deck)
const EDGES: [V3, V3, number, number][] = [
	[ht(HX0, HY0), ht(HX1, HY0), 4, 0], [ht(HX0, HY1), ht(HX1, HY1), 4, 1], [ht(HX0, HY0), ht(HX0, HY1), 4, 2], [ht(HX1, HY0), ht(HX1, HY1), 4, 3],
	[hb(HX0, HY0), ht(HX0, HY0), 0, 2], [hb(HX1, HY0), ht(HX1, HY0), 0, 3], [hb(HX0, HY1), ht(HX0, HY1), 1, 2], [hb(HX1, HY1), ht(HX1, HY1), 1, 3],
	[hb(HX0, HY0), hb(HX1, HY0), 0, -1], [hb(HX0, HY1), hb(HX1, HY1), 1, -1], [hb(HX0, HY0), hb(HX0, HY1), 2, -1], [hb(HX1, HY0), hb(HX1, HY1), 3, -1]];
const faceOn = (c: Cam, i: number) => i >= 0 && facing(c, FACES[i].q[0], FACES[i].n);
const HoodEdges: React.FC<{c: Cam; front: boolean; o: number}> = ({c, front, o}) => <g>
	{EDGES.map(([a, b, f1, f2], i) => { const isFront = faceOn(c, f1) || faceOn(c, f2); if (isFront !== front) return null;
		const k = cl((segDist(c.p, a, b) - 30) / 220); if (k < 0.01) return null; const d = poly(c, [a, b], false); if (!d) return null;
		const m = proj(c, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]), w = Math.max(1.1, Math.min(2.6, c.f * 1.6 / Math.max(1, m[2])));
		const top = f1 === 4;
		return <path key={i} d={d} stroke="#F2F7F8" strokeOpacity={o * k * (front ? (top ? 0.55 : 0.4) : 0.16)} strokeWidth={w} strokeLinecap="round" fill="none" />; })}
</g>;

/** the pommel mirror (a small round mirror on a stem, beside the hilt, showing the end face's 11 rings) */
export const MIR_Q: V3 = [-342, -96, 0];
export const mirrorAt = (c: Cam) => { const z = deckZ(MIR_Q[1]) + 44, p = proj(c, [MIR_Q[0], MIR_Q[1], z]); return {x: p[0], y: p[1], r: p[2] > 30 ? c.f * 22 / p[2] : 0}; };
export const PommelMirror: React.FC<{c: Cam; o?: number; id: string}> = ({c, o = 1, id}) => { const m = mirrorAt(c); if (m.r < 2 || o < 0.01) return null;
	const foot = proj(c, dk(MIR_Q[0], MIR_Q[1], 0.5)), base = proj(c, dk(MIR_Q[0], MIR_Q[1], 24)), fr = Math.max(6, c.f * 15 / Math.max(1, foot[2]));
	return <g opacity={o}>
		<ellipse cx={foot[0]} cy={foot[1]} rx={fr} ry={fr * 0.42} fill="#0A0604" opacity={0.7} />
		<path d={`M${foot[0]},${foot[1]} L${base[0]},${base[1]}`} stroke="#14090A" strokeWidth={Math.max(3, m.r * 0.32)} strokeLinecap="round" />
		<path d={`M${foot[0]},${foot[1]} L${base[0]},${base[1]}`} stroke="#9A7440" strokeWidth={Math.max(2, m.r * 0.2)} strokeLinecap="round" />
		<ellipse cx={m.x} cy={m.y} rx={m.r * 1.12} ry={m.r} fill="#0E0806" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.6} />
		<RingDisc x={m.x} y={m.y} r={m.r * 0.8} ry={0.9} id={`dm${id}`} />
		<path d={`M${m.x - m.r * 0.7},${m.y - m.r * 0.4} Q${m.x - m.r * 0.3},${m.y - m.r * 0.82} ${m.x + m.r * 0.35},${m.y - m.r * 0.75}`} stroke="#FFFFFF" strokeOpacity={0.25} strokeWidth={2} fill="none" />
	</g>; };

/** a soft pool of light lying on the sloped deck (stacked ellipses, centre brightest) */
const DeckPool: React.FC<{c: Cam; x: number; y: number; rx: number; ry: number; col: string; a: number; n?: number}> = ({c, x, y, rx, ry, col, a, n = 18}) => <g>
	{Array.from({length: n}, (_, k) => { const r = 1 - k / n, d = poly(c, Array.from({length: 28}, (_, i) => { const th = i / 28 * 2 * Math.PI;
		return dk(Math.max(DX0, Math.min(DX1, x + rx * r * Math.cos(th))), Math.max(DY0, Math.min(DY1, y + ry * r * Math.sin(th))), 0.4); }));
		return d ? <path key={k} d={d} fill={col} opacity={a / n} /> : null; })}</g>;

/** one clear rest (a small acrylic block with a V cradle) under the sword at x */
const Rest: React.FC<{c: Cam; x: number}> = ({c, x}) => { const w = 7, y0 = -13, y1 = 13, zt = 991;
	const fr = poly(c, [[x - w, y0, deckZ(y0)], [x + w, y0, deckZ(y0)], [x + w, y0, zt], [x - w, y0, zt]]), tp = poly(c, [[x - w, y0, zt], [x + w, y0, zt], [x + w, y1, zt], [x - w, y1, zt]]);
	const ed = poly(c, [[x - w, y0, deckZ(y0)], [x - w, y0, zt], [x - w, y1, zt]], false);
	return <g>{fr && <path d={fr} fill="#E8F0F2" opacity={0.1} />}{tp && <path d={tp} fill="#F4FAFC" opacity={0.16} />}{ed && <path d={ed} stroke="#F4FAFC" strokeOpacity={0.4} strokeWidth={1.3} fill="none" />}</g>; };

/** UNDER the sword: plinth body, deck, spot pool, the sword's shadow, the rests, the mirror, the hood's far edges */
export const DisplayBack: React.FC<{c: Cam; lite: number; hood: number; mirror?: number; id: string; leaf?: number; pool?: number}> = ({c, lite, hood, mirror = 0, id, leaf = 0, pool = 1}) => { void mirror;
	const body: [V3[], V3][] = [
		[[[DX1, DY0, deckZ(DY0)], [DX0, DY0, deckZ(DY0)], [DX0, DY0, 0], [DX1, DY0, 0]], [0, -1, 0]],
		[[[DX0, DY1, deckZ(DY1)], [DX1, DY1, deckZ(DY1)], [DX1, DY1, 0], [DX0, DY1, 0]], [0, 1, 0]],
		[[[DX0, DY0, deckZ(DY0)], [DX0, DY1, deckZ(DY1)], [DX0, DY1, 0], [DX0, DY0, 0]], [-1, 0, 0]],
		[[[DX1, DY1, deckZ(DY1)], [DX1, DY0, deckZ(DY0)], [DX1, DY0, 0], [DX1, DY1, 0]], [1, 0, 0]]];
	const shade = [mix('#140A07', '#2A1A11', lite), mix('#0E0705', '#1E120C', lite), mix('#1A0E09', '#332015', lite), mix('#170C08', '#2E1D13', lite)];
	const toe = (q: V3[]) => q.map(([x, y, z]) => [x, y, Math.min(z, 70)] as V3);
	const deck = poly(c, [dk(DX0, DY0), dk(DX1, DY0), dk(DX1, DY1), dk(DX0, DY1)]);
	const inner = poly(c, [dk(HX0, HY0, 0.2), dk(HX1, HY0, 0.2), dk(HX1, HY1, 0.2), dk(HX0, HY1, 0.2)]);
	/* the sword's shadow on the deck (the spot is above and a little in front: the shadow falls just behind the blade) */
	const sh = poly(c, [dk(-268, -2, 0.6), dk(90, -6, 0.6), dk(284, 8, 0.6), dk(284, 18, 0.6), dk(90, 44, 0.6), dk(-268, 40, 0.6)]);
	const hv = hood * hoodVis(c);
	return <g>
		<defs><filter id={`dsh${id}`} x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="7" /></filter></defs>
		{body.map(([q, n], i) => facing(c, q[0], n) ? <g key={i}><path d={poly(c, q)} fill={shade[i]} /><path d={poly(c, toe(q))} fill="#050302" opacity={0.55} /></g> : null)}
		{deck && <path d={deck} fill={mix('#1E110B', '#3A2418', lite)} />}
		{/* pool: the end hall fades the deck light out before the eye passes over the deck, where its rings drop out of view (v3.1 pop at 135.03) */}
		{pool > 0.004 && <DeckPool c={c} x={0} y={30} rx={520} ry={300} col="#FFC878" a={(0.3 + 0.1 * lite) * pool} />}
		{lite > 0.01 && <DeckPool c={c} x={0} y={20} rx={430} ry={220} col="#FFEBC0" a={0.1 * lite} n={14} />}
		{inner && <path d={inner} fill="none" stroke="#0A0504" strokeOpacity={0.6} strokeWidth={2} />}
		{/* the brass lip along the deck's front edge */}
		<path d={poly(c, [dk(DX0, DY0, 0.5), dk(DX1, DY0, 0.5)], false)} stroke={B.gold} strokeOpacity={0.45} strokeWidth={2} fill="none" />
		{sh && <path d={sh} fill={mix('#000000', '#140904', lite)} opacity={0.55} filter={`url(#dsh${id})`} />}
		{[-150, 160].map((x) => <Rest key={x} c={c} x={x} />)}
		{hv > 0.01 && <HoodEdges c={c} front={false} o={hv} />}
		{c.p[1] >= LEAF_Y && <TitleLeaf c={c} o={leaf} />}
	</g>; };

/** OVER the sword: the hood's near faces (a breath of glass), its near edges and one clean reflection streak on the top glass */
export const DisplayFront: React.FC<{c: Cam; hood: number; leaf?: number}> = ({c, hood, leaf = 0}) => { const lv = c.p[1] < LEAF_Y && leaf > 0.01 ? <TitleLeaf c={c} o={leaf} /> : null;
	const o = hood * hoodVis(c); if (o < 0.01) return lv;
	const onTop = (x: number, y: number): V3 => [x, y, deckZ(y) + HH + 0.3];
	const streak = poly(c, [onTop(150, HY0), onTop(232, HY0), onTop(-30, HY1), onTop(-112, HY1)]);
	const thin = poly(c, [onTop(262, HY0), onTop(276, HY0), onTop(14, HY1), onTop(0, HY1)]);
	return <><g opacity={o}>
		{FACES.map((f, i) => facing(c, f.q[0], f.n) ? <path key={i} d={poly(c, f.q)} fill="#E9F2F4" opacity={i === 4 ? 0.035 : 0.025} /> : null)}
		{facing(c, FACES[4].q[0], N_TOP) && <>{streak && <path d={streak} fill="#F4F8FA" opacity={0.07} />}{thin && <path d={thin} fill="#F4F8FA" opacity={0.1} />}</>}
		<HoodEdges c={c} front o={1} />
		</g>{lv}</>; };

/* ---------- the title glass: a tall clear leaf standing on the hood's front pane (y = HY0), the full width of the hood ----------
   Clear glass: a breath of fill, a bright top edge, fainter sides (no streak of its own: the hood's streak shows through). Drawn over the sword when the camera
   is in front of it (DisplayFront), under it from behind (DisplayBack); it dissolves as the lens comes near, like the hood. */
export const LEAF_Y = HY0, LEAF_TOP = 1475;
const lf = (x: number, z: number): V3 => [x, LEAF_Y, z];
export const TitleLeaf: React.FC<{c: Cam; o: number}> = ({c, o}) => { const near = cl((Math.abs(c.p[1] - LEAF_Y) - 30) / 280), k = o * near; if (k < 0.01) return null;
	const zb = deckZ(LEAF_Y) + HH, face = poly(c, [lf(HX0, zb), lf(HX1, zb), lf(HX1, LEAF_TOP), lf(HX0, LEAF_TOP)]);
	const edge = (a: V3, b: V3, op: number, key: string) => { const d = poly(c, [a, b], false); if (!d) return null; const m = proj(c, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
		return <path key={key} d={d} stroke="#F2F7F8" strokeOpacity={op} strokeWidth={Math.max(1.1, Math.min(2.6, c.f * 1.6 / Math.max(1, m[2])))} strokeLinecap="round" fill="none" />; };
	return <g opacity={k}>
		{face && <path d={face} fill="#E9F2F4" opacity={0.03} />}
		{edge(lf(HX0, LEAF_TOP), lf(HX1, LEAF_TOP), 0.5, 't')}{edge(lf(HX0, zb), lf(HX0, LEAF_TOP), 0.3, 'l')}{edge(lf(HX1, zb), lf(HX1, LEAF_TOP), 0.3, 'r')}
	</g>; };

/* ---------- the etched title on the title glass (the leaf on the hood's front pane), facing the camera, in front of the sword
   (world quad; the master maps its plaque onto it). At 9.5 s the plaque is ~1220 px wide in the upper middle, the sword below it. ---------- */
/** the whole source sheet (1400 × 640 px; the plaque 1080 × 404 inside): plaque 640 mm wide on the leaf, its centre 1300 mm up */
export const DTITLE_W = 829.6, DTITLE_H = 379.3, DTITLE_Y = HY0 - 0.5, DTITLE_Z = 1300;
export const titleQuadOn = (c: Cam): [number, number][] | null => { const hw = DTITLE_W / 2, hh = DTITLE_H / 2;
	const at = (sx: number, su: number): V3 => [sx * hw, DTITLE_Y, DTITLE_Z + su * hh];
	const p = [at(1, 1), at(-1, 1), at(-1, -1), at(1, -1)].map((q) => proj(c, q)); if (p.some((v) => v[2] < 20)) return null;
	return p.map((v) => [v[0], v[1]]); };
void toCam;
