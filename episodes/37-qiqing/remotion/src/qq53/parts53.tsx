import React from 'react';
import {W, H, Subs, SANS, KAI, SAFE_X, SAFE_Y, lerp, cl, rnd} from '../qq50/kit50';
import {B, thB, LacDefs, Lacquer, Vignette} from '../qq50/styleB';
import {SubsCentre, cq} from '../qq51/master51';
import {useStampFonts, YEAR} from '../qq44/skin44';
import {lineById} from './lines53';
import {bladeHW, LB} from './props53';
/* ep53 shared parts for the key frames (B「漆」 night, the ep50–52 engine layer):
   - Frame53: the lacquer ground + vignette under any picture, furniture on top;
   - Sub53: the real line by ID in layout D (top-left, 65 px 黑体 900, [ ] = gold underline), rows typed or full; Q lines centred;
   - Stamp53: the two-line top-right stamp (year in Cormorant figures, words in 文楷);
   - Tag: a picture tag (黑体 bold ≥ 44 px) on a feathered scrim, with an optional gold leader to the point it names;
   - DepthTag: the depth reading, bottom-left (numerals ≥ 96 px);
   - Cam: a look-at perspective camera (x forward along the sword axis, y to the right, z up; units per frame);
   - plane helpers: project a polygon / a blob on any plane, clip at the near plane. */
export type V3 = [number, number, number];
export type P2 = [number, number];

/* ---------- colour ---------- */
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => { const A = hx(a), Bc = hx(b); return '#' + A.map((v, i) => Math.round(lerp(v, Bc[i], cl(t))).toString(16).padStart(2, '0')).join(''); };

/* ---------- the frame ---------- */
export const Frame53: React.FC<{id: string; children: React.ReactNode; over?: React.ReactNode; sheen?: number; vig?: number; ground?: boolean}> = ({id, children, over, sheen = 0.2, vig = 0.66, ground = true}) => <>
	<svg width={W} height={H} style={{position: 'absolute'}}><LacDefs />{ground && <Lacquer sheen={sheen} id={id} />}{children}<Vignette id={id} a={vig} /></svg>{over}</>;

/* ---------- subtitles: the real line, by ID ---------- */
const splitQ = (s: string) => { const m = s.match(/^([\s\S]*?)\{([^}]*)\}\s*$/); const main = m ? m[1].replace(/\n$/, '') : s; return {rows: main.split('\n'), gloss: m ? m[2] : ''}; };
/** rows: how many rows are on screen (H1 at frame 0 shows row 1 only); n2: characters of the last row typed so far */
export const Sub53: React.FC<{id: string; rows?: number; n2?: number}> = ({id, rows, n2}) => { const L = lineById(id), {rows: rr, gloss} = splitQ(cq(L.s));
	if (L.q) return <SubsCentre rows={rr} gloss={gloss} q n={rr.map(() => 1e9)} />;
	const k = rows ?? rr.length;
	return <Subs rows={rr.slice(0, k).map((s, i) => ({s, n: i === k - 1 && n2 !== undefined ? n2 : 1e9}))} th={thB} />; };

/* ---------- stamp ----------
   Sized to read like ep51's stamps (KF51A: era 38 px 文楷, place 36, note 30). ep53's line 1 is mostly a numeric year, and
   Cormorant's default old-style figures sat ~40 % lower than the 文楷 words beside them (the v2 key frames' "small stamp"),
   so numeric years use lining figures at 52 px (cap height ≈ the 文楷 ink at 38 px); the note is 30 px. */
export const Stamp53: React.FC<{id?: string; y?: string; place?: string; note?: string}> = (p) => { const st = p.id ? lineById(p.id).st : null;
	const y = p.y ?? st?.y ?? '', place = p.place ?? st?.place, note = cq(p.note ?? st?.note ?? '');
	useStampFonts(`${y}${place ?? ''}${note}·−>→《》“”`);
	const num = /^[0-9.–→ ]+$/.test(y);
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thB.rule}`, color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: num ? YEAR : KAI, fontWeight: num ? 600 : 700, fontSize: num ? 52 : 38, fontVariantNumeric: num ? 'lining-nums' : undefined}}>{y}</span>
			{place && <><span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: thB.rule}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{place}</span></>}</div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.04em', opacity: 0.9}}>{note}</div>
	</div>; };

/* ---------- picture tags ---------- */
export const Scrim: React.FC<{id: string; x: number; y: number; rx: number; ry: number; a?: number; col?: string}> = ({id, x, y, rx, ry, a = 0.58, col = '#0C0604'}) => <g>
	<defs><radialGradient id={`scr${id}`}><stop offset="0" stopColor={col} stopOpacity={a} /><stop offset="0.55" stopColor={col} stopOpacity={a * 0.8} /><stop offset="0.82" stopColor={col} stopOpacity={a * 0.3} /><stop offset="1" stopColor={col} stopOpacity="0" /></radialGradient></defs>
	<ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#scr${id})`} /></g>;
/** a tag: text at (x, y) (baseline, anchor), scrim behind it, optional leader from `to` to the text's side */
export const Tag: React.FC<{id: string; x: number; y: number; s: string; fs?: number; col?: string; anchor?: 'start' | 'middle' | 'end'; to?: P2; w?: number; o?: number; scrim?: number; font?: string}> =
	({id, x, y, s, fs = 52, col = B.cream, anchor = 'start', to, w = 900, o = 1, scrim = 0.55, font = SANS}) => { const tw = fs * s.replace(/[ ·]/g, '').length * 0.98 + fs * 0.4 * (s.split(/[ ·]/).length - 1);
	const cx = anchor === 'start' ? x + tw / 2 : anchor === 'end' ? x - tw / 2 : x;
	const lx = anchor === 'end' ? x + fs * 0.35 : anchor === 'start' ? x - fs * 0.35 : x, ly = y - fs * 0.36;
	return <g opacity={o}>
		{scrim > 0 && <Scrim id={`t${id}`} x={cx} y={y - fs * 0.36} rx={tw / 2 + fs * 1.6} ry={fs * 1.35} a={scrim} />}
		{to && <><path d={`M${to[0]},${to[1]} L${lx},${ly}`} stroke={B.lac} strokeWidth={5} strokeOpacity={0.6} /><path d={`M${to[0]},${to[1]} L${lx},${ly}`} stroke={B.goldL} strokeWidth={2.2} /><circle cx={to[0]} cy={to[1]} r={5} fill={B.goldL} stroke={B.lac} strokeWidth={1.5} /></>}
		<text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={w} fontSize={fs} fill={col} stroke={B.lac} strokeWidth={Math.max(5, fs * 0.12)} strokeOpacity={0.85} strokeLinejoin="round" style={{paintOrder: 'stroke'}}>{s}</text>
	</g>; };
/** the depth reading, bottom-left inside the phone-safe corner: 「深」 + big numerals + 米 */
export const DepthTag: React.FC<{v: number; gold?: boolean}> = ({v, gold}) => { useStampFonts('深米−');
	return <div style={{position: 'absolute', left: SAFE_X + 30, bottom: SAFE_Y + 4, display: 'flex', alignItems: 'baseline', gap: 12, color: gold ? B.goldL : thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
		<span style={{fontFamily: KAI, fontWeight: 700, fontSize: 44, opacity: 0.9}}>深</span>
		<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 104, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em'}}>{v.toFixed(1)}</span>
		<span style={{fontFamily: KAI, fontWeight: 700, fontSize: 48}}>米</span></div>; };

/* ---------- the camera ---------- */
export type Cam = {p: V3; yaw: number; pitch: number; roll?: number; f: number; cx: number; cy: number};
/** look-at helper: yaw/pitch (radians) from the camera position toward a target */
export const lookAt = (p: V3, t: V3, f: number, cx = 960, cy = 540, roll = 0): Cam => { const d = [t[0] - p[0], t[1] - p[1], t[2] - p[2]], hz = Math.hypot(d[0], d[1]);
	return {p, yaw: Math.atan2(d[1], d[0]), pitch: Math.atan2(-d[2], hz), f, cx, cy, roll}; };
export const camBasis = (c: Cam) => { const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
	return {F: [cp * cy, cp * sy, -sp] as V3, R: [-sy, cy, 0] as V3, U: [sp * cy, sp * sy, cp] as V3}; };
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** camera-space [x right, y up, z depth] */
export const toCam = (c: Cam, q: V3): V3 => { const {F, R, U} = camBasis(c), d: V3 = [q[0] - c.p[0], q[1] - c.p[1], q[2] - c.p[2]]; return [dot(d, R), dot(d, U), dot(d, F)]; };
export const scr = (c: Cam, k: V3): P2 => { const r = c.roll ?? 0, x = c.f * k[0] / k[2], y = c.f * k[1] / k[2];
	return [c.cx + x * Math.cos(r) - y * Math.sin(r), c.cy - (x * Math.sin(r) + y * Math.cos(r))]; };
export const proj = (c: Cam, q: V3): [number, number, number] => { const k = toCam(c, q); const [x, y] = scr(c, k); return [x, y, k[2]]; };
const NEAR = 1e-3;
/** a 3-D polygon → SVG path, clipped at the near plane ('' when nothing is left) */
export const poly = (c: Cam, pts: V3[], close = true, near = NEAR) => { const ks = pts.map((q) => toCam(c, q)), out: V3[] = [];
	for (let i = 0; i < ks.length; i++) { const A = ks[i], Bq = ks[(i + 1) % ks.length], da = A[2] - near, db = Bq[2] - near;
		if (da >= 0) out.push(A);
		if (!close && i === ks.length - 1) break;
		if ((da >= 0) !== (db >= 0)) { const t = da / (da - db); out.push([lerp(A[0], Bq[0], t), lerp(A[1], Bq[1], t), lerp(A[2], Bq[2], t)]); } }
	if (out.length < 2) return '';
	return 'M' + out.map((k) => scr(c, k).map((v) => v.toFixed(1)).join(',')).join('L') + (close ? 'Z' : ''); };
/** a soft blob lying on the plane z = z0 (world units), as a projected path */
export const blobOn = (c: Cam, x: number, y: number, r: number, seed: number, z0 = 0, n = 10, rough = 0.5) => { const pts: V3[] = [];
	for (let i = 0; i < n; i++) { const a = (i / n) * 2 * Math.PI, rr = r * (1 - rough / 2 + rough * rnd(seed * 31 + i, 5)); pts.push([x + rr * Math.cos(a), y + rr * Math.sin(a), z0]); }
	const sp = pts.map((q) => proj(c, q)); if (sp.some((p) => p[2] <= NEAR)) return '';
	let d = ''; for (let i = 0; i < n; i++) { const p0 = sp[(i - 1 + n) % n], p1 = sp[i], p2 = sp[(i + 1) % n];
		const m0 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], m1 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
		d += (i === 0 ? `M${m0[0].toFixed(1)},${m0[1].toFixed(1)}` : '') + `Q${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${m1[0].toFixed(1)},${m1[1].toFixed(1)}`; }
	return d + 'Z'; };

/* ---------- the sword's blade as a plane in world units (mm): axis along +x or −x, lattice cells, outline ---------- */
/** blade outline points (world, mm) for a blade whose BASE is at x = xb and which points along dir (+1 / −1), axis at y = ya, face at z = zf */
export const bladeOutline = (xb: number, dir: 1 | -1, ya: number, zf: number, inset = 0, n = 80): V3[] => { const L = LB * 10, R: V3[] = [], Lf: V3[] = [];
	for (let i = 0; i <= n; i++) { const s = L * i / n, hw = Math.max(0, bladeHW(s / 10) * 10 - inset * cl(bladeHW(s / 10) / 1.4, 0.25, 1)); R.push([xb + dir * s, ya + hw, zf]); Lf.push([xb + dir * s, ya - hw, zf]); }
	return [...R, ...Lf.reverse()]; };
export const LAT_A = 20.5, LAT_W = 11.8;   // mm: the diamond cell (props53: La 2.05 cm along, Lw 1.18 cm across)
/** lattice cells of the blade (world quads) with their pale (tin-rich) flag; s = distance from the blade base */
export const latticeCells = (xb: number, dir: 1 | -1, ya: number, zf: number, s0 = 0, s1 = LB * 10) => { const out: {q: V3[]; core: V3[]; inner: V3[]; pale: boolean; s: number; w: number}[] = [];
	const ip = Math.ceil(s1 / LAT_A + 6);
	for (let i = -8; i <= ip; i++) for (let j = -8; j <= ip; j++) { const ca = (i + j + 1) / 2 * LAT_A, cw = (i - j) / 2 * LAT_W;
		if (ca < s0 - LAT_A || ca > s1 + LAT_A || Math.abs(cw) > 26) continue;
		const P = (a: number, w: number): V3 => [xb + dir * a, ya + w, zf];
		const D = (sc: number) => [P(ca - LAT_A / 2 * sc, cw), P(ca, cw + LAT_W / 2 * sc), P(ca + LAT_A / 2 * sc, cw), P(ca, cw - LAT_W / 2 * sc)];
		out.push({q: D(1), inner: D(0.8), core: D(0.38), pale: ((i + j) % 2 + 2) % 2 === 0, s: ca, w: cw}); }
	return out; };
void W; void H;
