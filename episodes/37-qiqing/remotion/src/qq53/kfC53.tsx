import React from 'react';
import {W, H, rnd, lerp, cl, SANS, KAI} from '../qq50/kit50';
import {B, Pool} from '../qq50/styleB';
import {SealHollow} from '../qq51/master51';
import {YEAR} from '../qq44/skin44';
import {Frame53, Sub53, Stamp53, Tag, DepthTag, mix} from './parts53';
import {blob} from './props53';
/* ep53 key frames, part C: the descent into the 1965 pit (D2) — the approved DESCENT look with DEPTH marks, not years.
   The camera sinks inside the open, stepped-free shaft the 1965 dig has emptied, pitched ~62° down; the far wall is the
   section face: rammed 五花土 in thin courses, 青灰泥, then the pale 白膏泥 around the chamber. A red-and-white survey pole
   stands against the far wall with depth marks every metre (labels every 2 m). The floor far below is the top of the
   chamber (椁), lit by the diggers' lamps. Snow from D1 still drifts down the shaft. World units: metres, z = 0 at the rim. */
type V3 = [number, number, number];
const SH = {a: 1.9, b: 1.5, F: -8.8};
const DC = {x: 0.12, y: -0.95, z: -1.4, p: 62 * Math.PI / 180, f: 860, cx: 960, cy: 300};
const dOf = (q: V3) => (q[1] - DC.y) * Math.cos(DC.p) - (q[2] - DC.z) * Math.sin(DC.p);
const pj = (q: V3): [number, number] => { const ry = q[1] - DC.y, rz = q[2] - DC.z, d = dOf(q), yc = ry * Math.sin(DC.p) + rz * Math.cos(DC.p);
	return [DC.cx + DC.f * (q[0] - DC.x) / d, DC.cy - DC.f * yc / d]; };
const NEAR = 0.2;
const poly3 = (pts: V3[], close = true) => { const out: V3[] = [];
	for (let i = 0; i < pts.length; i++) { const A = pts[i], Bq = pts[(i + 1) % pts.length], da = dOf(A) - NEAR, db = dOf(Bq) - NEAR;
		if (da >= 0) out.push(A);
		if (!close && i === pts.length - 1) break;
		if ((da >= 0) !== (db >= 0)) { const t = da / (da - db); out.push([lerp(A[0], Bq[0], t), lerp(A[1], Bq[1], t), lerp(A[2], Bq[2], t)]); } }
	if (out.length < 2) return '';
	return 'M' + out.map((q) => pj(q).map((v) => v.toFixed(1)).join(',')).join('L') + (close ? 'Z' : ''); };
/* the section, top → bottom (A6: 五花土 rammed, 青灰泥, 白膏泥) */
const BANDS: [number, number, string, string][] = [[0.3, -0.4, '#2E2016', 'top'], [-0.4, -7.0, '#5A452E', 'wuhua'], [-7.0, -8.2, '#46504F', 'qinghui'], [-8.2, -9.0, '#A9A595', 'baigao']];
const A_ = SH.a, B_ = SH.b;
const WALLP: Record<string, (t: number) => [number, number]> = { far: (t) => [lerp(-A_, A_, t), B_], right: (t) => [A_, lerp(B_, -B_, t)], near: (t) => [lerp(A_, -A_, t), -B_], left: (t) => [-A_, lerp(-B_, B_, t)]};
const WK: Record<string, number> = {far: 1, left: 1.16, right: 0.74, near: 0.66};
const wallQuad = (w: string, z0: number, z1: number, t0 = 0, t1 = 1): V3[] => { const [x0, y0] = WALLP[w](t0), [x1, y1] = WALLP[w](t1); return [[x0, y0, z0], [x1, y1, z0], [x1, y1, z1], [x0, y0, z1]]; };
const shade = (c: string, k: number, z: number) => { const glow = cl((z + 5.5) / -3.2);   // the lamps' warmth on the deepest bands
	const base = k >= 1 ? mix(c, '#E8C090', (k - 1) * 0.5) : mix(c, '#0A0503', (1 - k) * 0.9); return mix(base, '#8A5A30', glow * 0.3); };
/** the mottle of rammed mixed earth (五花土): small patches of yellow, grey and red clay on a wall strip */
const Mottle: React.FC<{w: string; z0: number; z1: number; n: number; seed: number}> = ({w, z0, z1, n, seed}) => <g>{Array.from({length: n}, (_, i) => {
	const t = rnd(i, seed), z = lerp(z0, z1, rnd(i, seed + 1)), [x, y] = WALLP[w](t), q: V3 = [x, y, z], d = dOf(q); if (d < NEAR + 0.3) return null;
	const [sx, sy] = pj(q), r = DC.f * (0.05 + 0.09 * rnd(i, seed + 2)) / d; if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) return null;
	return <path key={i} d={blob(sx, sy, r, i + seed * 50, 8, 0.6)} fill={['#8A6E40', '#6E6A5C', '#7A4A30', '#9A8458', '#4A3A28'][i % 5]} opacity={0.35 * WK[w]} />; })}</g>;
export const KF05: React.FC = () => {
	const walls = ['far', 'left', 'right', 'near'];
	const band = (z0: number, z1: number, c: string) => walls.map((w) => { const d = poly3(wallQuad(w, z0, z1)); return d ? <path key={w + z0} d={d} fill={shade(c, WK[w], (z0 + z1) / 2)} stroke={shade(c, WK[w], (z0 + z1) / 2)} strokeWidth={0.8} /> : null; });
	/* rammed courses every 0.25 m in the 五花土, rings round all four walls */
	const courses = Array.from({length: 26}, (_, i) => -0.55 - i * 0.25).map((z) => walls.map((w) => { const d = poly3(wallQuad(w, z, z).slice(0, 2), false); return d ? <path key={w + z} d={d} stroke="#1E140C" strokeOpacity={0.45} strokeWidth={1.3} fill="none" /> : null; }));
	/* streaks: the walls stream upward past the lens (speed lines) */
	const streaks = Array.from({length: 40}, (_, i) => { const w = walls[Math.floor(rnd(i, 91) * 4)], t = rnd(i, 92), z = -1.6 - 6 * rnd(i, 93), [x, y] = WALLP[w](t), L = 0.5 + 1.2 * rnd(i, 95);
		const d = poly3([[x, y, z], [x, y, z - L]], false); return d ? <path key={i} d={d} stroke="#E8D4B0" strokeOpacity={0.05 + 0.08 * rnd(i, 96)} strokeWidth={2 + 3 * rnd(i, 97)} strokeLinecap="round" fill="none" /> : null; });
	/* the floor: the white clay round the chamber top; the 椁 roof planks; the lamps' warm light leaking at the edges */
	const F = SH.F, flo = poly3([[-A_, -B_, F], [A_, -B_, F], [A_, B_, F], [-A_, B_, F]]);
	const koR = (hx: number, hy: number, cy = 0.15) => poly3([[-hx, cy - hy, F + 0.01], [hx, cy - hy, F + 0.01], [hx, cy + hy, F + 0.01], [-hx, cy + hy, F + 0.01]]);
	const fc = pj([0, 0.15, F]);
	/* the survey pole on the far wall: red/white every 0.5 m, a tick each metre, labels at −2 … −8 */
	const PX = 1.05, PY = B_ - 0.03;
	const pole = Array.from({length: 18}, (_, i) => { const z0 = -i * 0.5, z1 = z0 - 0.5; return <path key={i} d={poly3([[PX - 0.05, PY, z0], [PX + 0.05, PY, z0], [PX + 0.05, PY, z1], [PX - 0.05, PY, z1]])} fill={i % 2 ? '#E8DCC4' : '#A8402A'} opacity={0.92} />; });
	const ticks = Array.from({length: 9}, (_, i) => -(i + 1)).map((z) => <path key={z} d={poly3([[PX + 0.05, PY, z], [PX + 0.3, PY, z]], false)} stroke="#F2E6CC" strokeWidth={2} strokeOpacity={0.8} fill="none" />);
	const labels = [-2, -4, -6, -8].map((z) => { const [x, y] = pj([PX + 0.36, PY, z]), d = dOf([PX, PY, z]), fs = Math.max(42, Math.min(60, 260 / d));
		return <text key={z} x={x} y={y + fs * 0.34} fontFamily={YEAR} fontWeight={700} fontSize={fs} fill="#F6EBD2" stroke="#120A06" strokeWidth={6} strokeOpacity={0.85} style={{paintOrder: 'stroke'}}>{`−${-z}`}<tspan fontFamily={KAI} fontSize={fs * 0.72} dx={4}>米</tspan></text>; });
	/* snow from D1 still drifting down the shaft (near flakes soft and large) */
	const snow = Array.from({length: 46}, (_, i) => { const x = rnd(i, 71) * W, y = rnd(i, 72) * 700, r = 1.5 + 5 * Math.pow(rnd(i, 73), 2.5);
		return <circle key={i} cx={x} cy={y} r={r} fill="#F4F2EC" opacity={0.25 + 0.4 * rnd(i, 74)} filter={r > 4 ? 'url(#d5s)' : undefined} />; });
	return <Frame53 id="k5" ground={false} vig={0.6} over={<><Sub53 id="D2" /><Stamp53 id="D2" /><DepthTag v={1.4} /><SealHollow /></>}>
		<defs>
			<filter id="d5N" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8 13" /></filter>
			<filter id="d5M" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6 2.6" /></filter>
			<filter id="d5s" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.2" /></filter>
			<radialGradient id="d5Glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFB060" stopOpacity="0.55" /><stop offset="0.5" stopColor="#FF9A48" stopOpacity="0.2" /><stop offset="1" stopColor="#FF9040" stopOpacity="0" /></radialGradient>
		</defs>
		<rect x={-40} y={-40} width={W + 80} height={H + 80} fill="#140C08" />
		{/* deep → near; the deepest bands sharp, the middle a little smeared, the nearest walls heavily smeared (speed) */}
		<path d={flo} fill="#8E8A7C" />
		<path d={koR(1.6, 1.15)} fill="#2A1A10" stroke="#8A6A44" strokeOpacity={0.6} strokeWidth={1.5} />
		{Array.from({length: 7}, (_, i) => <path key={i} d={poly3([[-1.6 + (i + 1) * 3.2 / 8, -1.0, F + 0.02], [-1.6 + (i + 1) * 3.2 / 8, 1.3, F + 0.02]], false)} stroke="#140C06" strokeWidth={1.5} strokeOpacity={0.6} fill="none" />)}
		{/* the diggers have reached the chamber roof: a film of white clay on the planks, their two lamps at its corners */}
		{/* a thin film of white clay still on the planks */}<path d={koR(1.6, 1.15)} fill="#B8B4A6" opacity={0.12} />
		{[[-1.35, -0.85], [1.35, 1.1]].map(([x, y], i) => { const [sx, sy] = pj([x, y, F + 0.25]); return <g key={`l${i}`}><Pool id={`d5l${i}`} x={sx} y={sy} rx={150} ry={110} a={0.5} col="#FFB868" /><circle cx={sx} cy={sy} r={6} fill="#FFF0C8" /></g>; })}
		<ellipse cx={fc[0]} cy={fc[1]} rx={130} ry={80} fill="url(#d5Glow)" />
		<Pool id="d5g" x={fc[0]} y={fc[1] - 30} rx={300} ry={220} a={0.16} col="#FFA858" />
		<path d={koR(1.62, 1.17)} fill="none" stroke="#FFB868" strokeOpacity={0.55} strokeWidth={2} />
		{band(-8.2, -9.0, BANDS[3][2])}
		{band(-7.0, -8.2, BANDS[2][2])}
		<g filter="url(#d5M)">{band(-3.6, -7.0, BANDS[1][2])}{['far', 'left', 'right'].map((w, k) => <Mottle key={w} w={w} z0={-3.6} z1={-7.0} n={110} seed={20 + k * 7} />)}</g>
		<g filter="url(#d5N)">{band(0.3, -3.6, BANDS[1][2])}{band(0.3, -0.4, BANDS[0][2])}{['far', 'left', 'right', 'near'].map((w, k) => <Mottle key={w} w={w} z0={-0.4} z1={-3.6} n={70} seed={50 + k * 7} />)}</g>
		{courses}
		{/* the seal layers' edges: a pale line where the grey clay meets the white clay */}
		{walls.map((w) => { const d = poly3(wallQuad(w, -8.2, -8.2).slice(0, 2), false); return d ? <path key={`e${w}`} d={d} stroke="#EDE3CC" strokeOpacity={0.45} strokeWidth={1.6} fill="none" /> : null; })}
		{[[-A_, B_], [A_, B_]].map(([x, y], i) => <path key={i} d={poly3([[x, y, 0.3], [x, y, F]], false)} stroke={B.gold} strokeOpacity={0.12} strokeWidth={2} fill="none" />)}
		<g filter="url(#d5M)">{streaks}</g>
		{pole}{ticks}{labels}
		{snow}
	</Frame53>; };
void SANS; void Tag; void lerp;
