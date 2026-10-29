import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, Subs, rnd, cl, lerp, KAI, SAFE_X, SAFE_Y} from '../qq50/kit50';
import {B, thB, LacDefs, Lacquer, Vignette, Pool, SealB} from '../qq50/styleB';
import {useStampFonts, YEAR} from '../qq44/skin44';
import {Sword, RingDisc, Knife, blob, BZ, LAT, SW} from './props53';
/* ep53 越王勾践剑 · three style frames for the one-take film (B「漆」 night, the ep50/51 engine layer).
   KF53-ALL renders frame i = [HOOK, DESCENT, MACRO][i]; one id per frame as well.
   Furniture at final positions: layout-D subtitle (top-left, placeholder copy), two-line stamp top-right, J seal bottom-right.
   No counter in this film (brief: captions, stamp, seal). */

const Fonts: React.FC<{s: string}> = ({s}) => { useStampFonts(s); return null; };
const StampK: React.FC<{y: string; place?: string; note: string}> = ({y, place, note}) => { useStampFonts(`${y}${place ?? ''}${note}·`);
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thB.rule}`, color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 48}}>{y}</span>
			{place && <><span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: thB.rule}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{place}</span></>}</div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.04em', opacity: 0.88}}>{note}</div>
	</div>; };
const Frame: React.FC<{id: string; children: React.ReactNode; over?: React.ReactNode; sheen?: number}> = ({id, children, over, sheen = 0.3}) => <>
	<svg width={W} height={H} style={{position: 'absolute'}}><LacDefs /><Lacquer sheen={sheen} id={id} />{children}<Vignette id={id} /></svg>{over}</>;

/* colour helpers */
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => { const A = hx(a), Bc = hx(b); return '#' + A.map((v, i) => Math.round(lerp(v, Bc[i], cl(t))).toString(16).padStart(2, '0')).join(''); };

/* =============================== 1 · HOOK (frame 0) ===============================
   Left: your kitchen counter at night, your cleaver lying on it, rust blooming along the spine and round the hole, water beads.
   Right: through the museum case glass, the sword standing in a spotlight, the brightest thing in frame. A tilted mirror on the
   plinth shows the pommel's ringed end (the museum shows the rings that way). The case's lit glass edge is the seam between the
   two worlds; the camera will push right, through that glass. */
const SX = 1245, SY = 912, SK = 14.6;   // sword: pommel end, px per cm (55.6 cm → 812 px, tip at y ≈ 100)
const Hook: React.FC = () => <Frame id="h" sheen={0.18} over={<><Fonts s="你的菜刀放久了就会生锈。湖北省博物馆越王勾践剑" /><Subs rows={[{s: '你的菜刀，放久了就会生锈。'}]} th={thB} /><StampK y="2026" place="湖北省博物馆" note="越王勾践剑" /><SealB /></>}>
	<defs>
		<linearGradient id="hCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE2A8" stopOpacity="0.2" /><stop offset="0.6" stopColor="#FFD08A" stopOpacity="0.08" /><stop offset="1" stopColor="#FFC070" stopOpacity="0.02" /></linearGradient>
		<linearGradient id="hGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E8F0F2" stopOpacity="0.07" /><stop offset="0.5" stopColor="#E8F0F2" stopOpacity="0.02" /><stop offset="1" stopColor="#E8F0F2" stopOpacity="0.05" /></linearGradient>
		<linearGradient id="hCtr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#231915" /><stop offset="1" stopColor="#120C0A" /></linearGradient>
		<filter id="hBl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10" /></filter>
		<filter id="hBl2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5" /></filter>
	</defs>
	{/* --- your kitchen: dark tiled splashback, the counter top, a weak under-cabinet light --- */}
	<rect x={-40} y={-20} width={1050} height={720} fill="#130B08" opacity={0.6} />
	<path d={Array.from({length: 12}, (_, i) => `M${-40 + i * 88},250 V700`).join(' ') + ' ' + [338, 426, 514, 602].map((y) => `M-40,${y} H1004`).join(' ')} stroke="#C8B89A" strokeOpacity={0.05} strokeWidth={1.5} />
	<rect x={-40} y={226} width={1048} height={24} fill="#0C0705" />
	<rect x={-40} y={248} width={1048} height={2} fill={B.gold} opacity={0.12} />
	<path d="M-40,700 L1004,700 L1004,1120 L-40,1120 Z" fill="url(#hCtr)" />
	<rect x={-40} y={698} width={1044} height={3} fill="#D8CDB8" opacity={0.18} />
	{Array.from({length: 140}, (_, i) => <circle key={i} cx={-30 + 1030 * rnd(i, 1)} cy={705 + 380 * rnd(i, 2)} r={0.8 + 1.4 * rnd(i, 3)} fill="#E8DCC8" opacity={0.04 + 0.05 * rnd(i, 4)} />)}
	<Pool id="hk" x={520} y={800} rx={520} ry={190} a={0.1} col="#E8D6B8" />
	{/* a wet ring where it was put down */}
	<ellipse cx={420} cy={930} rx={150} ry={26} fill="none" stroke="#B8B4AA" strokeOpacity={0.1} strokeWidth={3} />
	<Knife x={390} y={742} k={25} rot={-5} squash={0.56} id="k1" />
	{/* the near counter edge, out of focus (depth) */}
	<rect x={-60} y={1040} width={1080} height={80} fill="#090504" filter="url(#hBl)" opacity={0.9} />
	{/* --- the museum: the case on its plinth in the dark --- */}
	<rect x={1004} y={-20} width={960} height={1120} fill="#0B0605" opacity={0.55} />
	<path d={`M1060,-20 L1430,-20 L1430,935 L1060,935 Z`} fill="#140A07" />
	<path d="M1150,-20 L1340,-20 L1440,935 L1050,935 Z" fill="url(#hCone)" />
	<Pool id="hp" x={SX} y={930} rx={230} ry={30} a={0.36} col="#FFC878" />
	<Pool id="hs" x={SX} y={520} rx={200} ry={460} a={0.12} col="#FFC070" />
	{/* plinth */}
	<rect x={1030} y={935} width={430} height={170} fill="#1C100B" />
	<rect x={1030} y={933} width={430} height={3} fill={B.gold} opacity={0.4} />
	<rect x={1040} y={950} width={410} height={1.5} fill={B.gold} opacity={0.14} />
	{/* the clear holder */}
	<path d={`M${SX - 40},935 L${SX - 22},${SY - 60} M${SX + 40},935 L${SX + 22},${SY - 60}`} stroke="#E8F0F2" strokeOpacity={0.16} strokeWidth={3} />
	<rect x={SX - 46} y={928} width={92} height={7} fill="#E8F0F2" opacity={0.12} />
	<ellipse cx={SX} cy={SY + 6} rx={38} ry={6} fill="#000" opacity={0.4} />
	<Sword x={SX} y={SY} k={SK} id="hs1" />
	{/* the tilted mirror on the plinth: the 11 rings of the pommel's end */}
	<g transform="translate(1362,898)">
		<path d="M-6,40 L0,-4 L6,40 Z" fill="#2A1A12" />
		<ellipse cx={0} cy={0} rx={40} ry={36} fill="#0E0806" stroke={B.gold} strokeOpacity={0.55} strokeWidth={2} />
		<RingDisc x={0} y={0} r={30} ry={0.9} id="hm" />
		<path d="M-26,-16 Q-10,-30 14,-28" stroke="#FFFFFF" strokeOpacity={0.25} strokeWidth={3} fill="none" />
	</g>
	{/* dust in the spotlight */}
	{Array.from({length: 26}, (_, i) => { const yy = 40 + 860 * rnd(i, 7), half = lerp(95, 195, yy / 935); return <circle key={i} cx={SX - half + 2 * half * rnd(i, 8)} cy={yy} r={1 + 1.6 * rnd(i, 9)} fill="#FFE6B8" opacity={0.18 + 0.25 * rnd(i, 10)} />; })}
	{/* the glass: frame edges, a lit left edge (the seam between the two worlds), two soft reflections */}
	<rect x={1060} y={-20} width={370} height={955} fill="url(#hGlass)" />
	<path d="M1088,-20 L1170,-20 L1060,420 L1060,140 Z" fill="#F4F8FA" opacity={0.045} />
	<path d="M1360,180 L1400,180 L1300,935 L1258,935 Z" fill="#F4F8FA" opacity={0.035} />
	<rect x={1056} y={-20} width={5} height={955} fill="#E9EEF0" opacity={0.42} />
	<rect x={1427} y={-20} width={4} height={955} fill="#E9EEF0" opacity={0.2} />
	<rect x={1052} y={-20} width={14} height={955} fill="#E9EEF0" opacity={0.08} filter="url(#hBl2)" />
</Frame>;

/* =============================== 2 · DESCENT ===============================
   Below the museum floor the camera sinks down a shaft cut through the ground (a cut-away: we see its four walls), looking
   down at an angle. Every stratum is a horizontal band running round the walls; a thin year label sits on each band edge on
   the far wall, counting back as the bands go deeper (1990 → 1980 → 1970 → 1965) and shrinking with distance. The last bands
   are the tomb's own fill: rammed 五花土 in thin courses, 青灰泥, then the pale 白膏泥 seal: the floor far below, with the
   outline of the double coffin glowing faintly through it. Motion: the walls nearest the lens are smeared (fast), the far ones
   sharp (parallax); speed lines run down the walls to the vanishing point. No bones. */
type V3 = [number, number, number];
const SH = {a: 3, b: 3, F: 25};   // shaft half-width, half-depth, floor depth below the camera (units)
const DC = {x: 0, y: -2, z: 0, p: 58 * Math.PI / 180, f: 1000, cx: 960, cy: 420};
const dOf = (q: V3) => (q[1] - DC.y) * Math.cos(DC.p) - (q[2] - DC.z) * Math.sin(DC.p);
const pj = (q: V3): [number, number] => { const ry = q[1] - DC.y, rz = q[2] - DC.z, d = dOf(q), yc = ry * Math.sin(DC.p) + rz * Math.cos(DC.p);
	return [DC.cx + DC.f * (q[0] - DC.x) / d, DC.cy - DC.f * yc / d]; };
const NEAR = 0.25;
/** clip a 3D polygon to d ≥ NEAR, project, return an SVG path ('' if nothing is left) */
const poly3 = (pts: V3[], close = true) => { const out: V3[] = [];
	for (let i = 0; i < pts.length; i++) { const A = pts[i], Bq = pts[(i + 1) % pts.length], da = dOf(A) - NEAR, db = dOf(Bq) - NEAR;
		if (da >= 0) out.push(A);
		if (!close && i === pts.length - 1) break;
		if ((da >= 0) !== (db >= 0)) { const t = da / (da - db); out.push([lerp(A[0], Bq[0], t), lerp(A[1], Bq[1], t), lerp(A[2], Bq[2], t)]); } }
	if (out.length < 2) return '';
	return 'M' + out.map((q) => pj(q).map((v) => v.toFixed(1)).join(',')).join('L') + (close ? 'Z' : ''); };
/* strata, top → bottom: [z top, z bottom, colour, name]; the last three are the tomb fill (A6) */
const BANDS: [number, number, string][] = [[3, -2, '#2A1C14'], [-2, -6, '#33251A'], [-6, -10, '#2B2017'], [-10, -15, '#382A1E'], [-15, -19.5, '#4A3826'], [-19.5, -22.5, '#3A3A33'], [-22.5, -25, '#9A907A']];
const LABELS: [number, string][] = [[-6, '1990'], [-10, '1980'], [-15, '1970'], [-22.5, '1965']];
const WALLS: {id: string; q: (z0: number, z1: number) => V3[]; k: number}[] = [
	{id: 'far', q: (z0, z1) => [[-SH.a, SH.b, z0], [SH.a, SH.b, z0], [SH.a, SH.b, z1], [-SH.a, SH.b, z1]], k: 1},
	{id: 'left', q: (z0, z1) => [[-SH.a, -SH.b, z0], [-SH.a, SH.b, z0], [-SH.a, SH.b, z1], [-SH.a, -SH.b, z1]], k: 1.18},
	{id: 'right', q: (z0, z1) => [[SH.a, -SH.b, z0], [SH.a, SH.b, z0], [SH.a, SH.b, z1], [SH.a, -SH.b, z1]], k: 0.78},
	{id: 'near', q: (z0, z1) => [[-SH.a, -SH.b, z0], [SH.a, -SH.b, z0], [SH.a, -SH.b, z1], [-SH.a, -SH.b, z1]], k: 0.7}];
const shade = (c: string, k: number, z: number) => { const glow = cl((z + 17) / -8);   // the tomb's warm light on the deepest bands
	const base = k >= 1 ? mix(c, '#E8C090', (k - 1) * 0.5) : mix(c, '#0A0503', (1 - k) * 0.9);
	return mix(base, '#7A4E2A', glow * 0.35); };
/** random points on the walls (pebbles, crumbs), and short streaks running down the walls (speed lines) */
const wallPt = (i: number, seed: number, z0: number, z1: number): V3 => { const w = Math.floor(rnd(i, seed) * 4), t = rnd(i, seed + 1) * 2 - 1, z = lerp(z0, z1, rnd(i, seed + 2));
	return w === 0 ? [t * SH.a, SH.b, z] : w === 1 ? [-SH.a, t * SH.b, z] : w === 2 ? [SH.a, t * SH.b, z] : [t * SH.a, -SH.b, z]; };
const Specks: React.FC<{z0: number; z1: number; n: number; seed: number}> = ({z0, z1, n, seed}) => <g>{Array.from({length: n}, (_, i) => { const q = wallPt(i, seed, z0, z1), d = dOf(q); if (d < NEAR + 0.2) return null;
	const [x, y] = pj(q), r = DC.f * (0.03 + 0.05 * rnd(i, seed + 3)) / d; if (x < -40 || x > W + 40 || y < -40 || y > H + 40) return null;
	return <ellipse key={i} cx={x} cy={y} rx={r * 1.4} ry={r} fill={rnd(i, seed + 4) > 0.5 ? '#5E4A34' : '#140C08'} opacity={0.55} />; })}</g>;
const Descent: React.FC = () => {
	const zs = (z0: number, z1: number) => <g>{BANDS.filter(([t, bt]) => t > z1 && bt < z0).map(([t, bt, c], bi) => { const top = Math.min(t, z0), bot = Math.max(bt, z1);
		return <g key={bi}>{WALLS.map((w) => { const d = poly3(w.q(top, bot)); return d ? <path key={w.id} d={d} fill={shade(c, w.k, (top + bot) / 2)} stroke={shade(c, w.k, (top + bot) / 2)} strokeWidth={0.8} /> : null; })}
			{/* rammed courses (夯层) in the tomb fill */}
			{t <= -15 && t > -22.5 && Array.from({length: 6}, (_, k) => { const z = lerp(top, bot, (k + 1) / 7); return <path key={`c${k}`} d={poly3([[-SH.a, -SH.b, z], [-SH.a, SH.b, z], [SH.a, SH.b, z], [SH.a, -SH.b, z]], false)} fill="none" stroke="#1E140C" strokeOpacity={0.5} strokeWidth={1.2} />; })}
		</g>; })}</g>;
	const ring = (z: number, o: number, col: string = B.gold, sw = 1.6) => <path d={poly3([[-SH.a, -SH.b, z], [-SH.a, SH.b, z], [SH.a, SH.b, z], [SH.a, -SH.b, z]], false)} fill="none" stroke={col} strokeOpacity={o} strokeWidth={sw} />;
	const corners = [[-SH.a, SH.b], [SH.a, SH.b], [-SH.a, -SH.b], [SH.a, -SH.b]].map(([x, y], i) => <path key={i} d={poly3([[x, y, 3], [x, y, -SH.F]], false)} stroke={B.gold} strokeOpacity={0.3} strokeWidth={2} fill="none" />);
	const streaks = Array.from({length: 46}, (_, i) => { const q = wallPt(i, 91, 0, -9), L = 1.2 + 2.2 * rnd(i, 95); const d = poly3([q, [q[0], q[1], q[2] - L]], false);
		return d ? <path key={i} d={d} stroke="#D8C4A0" strokeOpacity={0.05 + 0.1 * rnd(i, 96)} strokeWidth={1.5 + 2 * rnd(i, 97)} strokeLinecap="round" fill="none" /> : null; });
	/* the floor: the top of the 白膏泥 seal; the double coffin under it shows as a faint warm outline */
	const F = -SH.F, rect = (hx: number, hy: number, cy = 0.4) => poly3([[-hx, cy - hy, F], [hx, cy - hy, F], [hx, cy + hy, F], [-hx, cy + hy, F]]);
	const fc = pj([0, 0.4, F]);
	const lab = LABELS.map(([z, s]) => { const [x, y] = pj([-SH.a, SH.b, z]), d = dOf([-SH.a, SH.b, z]), last = s === '1965';
		return {x: x + 14, y: y - 10, s, fs: last ? 50 : Math.max(40, Math.min(56, 400 / d)), last}; });
	return <Frame id="d" sheen={0.1} over={<><Fonts s="往下10.8米，是一座楚墓。江陵望山地下" /><Subs rows={[{s: '往下10.8米，是一座楚墓。'}]} th={thB} /><StampK y="1965" place="江陵望山" note="地下10.8米" /><SealB /></>}>
		<defs>
			<filter id="dN" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9 14" /></filter>
			<filter id="dM" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2 3.2" /></filter>
			<filter id="dL" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="0.4 1.4" /></filter>
			<radialGradient id="dGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFB060" stopOpacity="0.55" /><stop offset="0.5" stopColor="#FF9A48" stopOpacity="0.2" /><stop offset="1" stopColor="#FF9040" stopOpacity="0" /></radialGradient>
		</defs>
		{/* far (sharp) → middle (slight smear) → near (heavy smear): painted back to front */}
		{zs(-12, -25)}
		<Specks z0={-12} z1={-22.5} n={160} seed={11} />
		{[-15, -19.5].map((z) => <g key={z}>{ring(z, 0.28)}</g>)}
		{ring(-22.5, 0.55, '#EDE3CC', 1.8)}
		{/* the floor */}
		<path d={poly3([[-SH.a, -SH.b, F], [SH.a, -SH.b, F], [SH.a, SH.b, F], [-SH.a, SH.b, F]])} fill="#B3A88E" />
		<path d={rect(2.3, 1.6)} fill="none" stroke="#8A7E66" strokeOpacity={0.6} strokeWidth={1.5} />
		<ellipse cx={fc[0]} cy={fc[1]} rx={150} ry={70} fill="url(#dGlow)" />
		<path d={rect(1.55, 0.95)} fill="none" stroke="#FFB868" strokeOpacity={0.55} strokeWidth={2.2} />
		<path d={rect(1.3, 0.72)} fill="none" stroke="#FFD49A" strokeOpacity={0.75} strokeWidth={1.8} />
		{Array.from({length: 8}, (_, i) => { const x0 = (rnd(i, 61) - 0.5) * 5, y0 = (rnd(i, 62) - 0.5) * 5; return <path key={i} d={poly3([[x0, y0, F], [x0 + (rnd(i, 63) - 0.5) * 1.6, y0 + (rnd(i, 64) - 0.5) * 1.6, F]], false)} stroke="#7A705C" strokeOpacity={0.5} strokeWidth={1.2} fill="none" />; })}
		<g filter="url(#dM)">{zs(-4.5, -12)}<Specks z0={-4.5} z1={-12} n={120} seed={21} />{ring(-6, 0.3)}{ring(-10, 0.3)}</g>
		<g filter="url(#dN)">{zs(3, -4.5)}<Specks z0={3} z1={-4.5} n={60} seed={31} /></g>
		{corners}
		{streaks}
		{/* year labels on the far wall's band edges, counting back, smaller as they go deeper; 1965 = the seal, sharp, gold */}
		{lab.map((l) => <g key={l.s} filter={l.last ? undefined : 'url(#dL)'}>
			<text x={l.x} y={l.y} fontFamily={YEAR} fontWeight={600} fontSize={l.fs} fill={l.last ? B.goldL : '#F2E6CC'} opacity={l.last ? 1 : 0.88} style={{paintOrder: 'stroke'}} stroke="#120A06" strokeWidth={5}>{l.s}</text></g>)}
	</Frame>; };

/* =============================== 3 · MACRO ===============================
   The camera skims a few millimetres above the blade. The diamond lattice is the land: a grid of diamonds (dark double lines,
   alternate diamonds pale = the tin-rich skin, a small dark diamond in the gold ones) draped over the raised central ridge,
   which runs to the vanishing point like a mountain spine; the polished edges fall away to darkness on both sides. A raking
   warm light from the right catches the raised rims of the pale diamonds (the thin tin layer). Near cells are smeared by the
   forward glide, the far ones soften into haze. Drawn, not photographed; no scale bar, no numbers. */
const MC = {v: -5, z: 20, pitch: Math.atan(210 / 820), yaw: 2.5 * Math.PI / 180, f: 820, cx: 960, cy: 540};   // wide lens, horizon at y ≈ 330
const HW0 = 24, RIDGE = 5, STRIP = 2.2;   // mm: half-width, ridge height, polished edge strip
const hwAt = (u: number) => HW0 - 0.006 * u;
const zAt = (u: number, v: number) => { const hw = hwAt(u), a = Math.min(1, Math.abs(v) / hw); return RIDGE * Math.pow(1 - a, 1.12) - (Math.abs(v) > hw - STRIP ? 0.9 * (Math.abs(v) - (hw - STRIP)) / STRIP : 0); };
const proj = (u: number, v: number, z: number): [number, number, number] => {
	const dx = v - MC.v, dy = z - MC.z, du = u;
	const x1 = dx * Math.cos(MC.yaw) - du * Math.sin(MC.yaw), d1 = dx * Math.sin(MC.yaw) + du * Math.cos(MC.yaw);
	const d2 = d1 * Math.cos(MC.pitch) - dy * Math.sin(MC.pitch), y2 = d1 * Math.sin(MC.pitch) + dy * Math.cos(MC.pitch);
	return [MC.cx + MC.f * x1 / d2, MC.cy - MC.f * y2 / d2, d2]; };
const PT = (u: number, v: number) => { const p = proj(u, v, zAt(u, v)); return `${p[0].toFixed(1)},${p[1].toFixed(1)}`; };
const FOG = '#1E100B';
type Cell = {u: number; v: number; d: string; dIn: string; dCore: string; pale: boolean; col: string; line: number; rim: number; fog: number};
const LA = 15, LW = 6.2;
const cellsMacro = (): Cell[] => { const out: Cell[] = [];
	const quad = (ca: number, cw: number, sc: number) => { const pts: string[] = [];
		const cs: [number, number][] = [[ca - LA / 2 * sc, cw], [ca, cw + LW / 2 * sc], [ca + LA / 2 * sc, cw], [ca, cw - LW / 2 * sc]];
		for (let e = 0; e < 4; e++) { const [a0, b0] = cs[e], [a1, b1] = cs[(e + 1) % 4];
			for (let s = 0; s < 6; s++) { const t = s / 6, uu = lerp(a0, a1, t), lim = hwAt(uu) - STRIP, vv = Math.max(-lim, Math.min(lim, lerp(b0, b1, t))); pts.push(PT(Math.max(uu, 14), vv)); } }
		return 'M' + pts.join('L') + 'Z'; };
	for (let i = -12; i <= 200; i++) for (let j = -12; j <= 200; j++) {
		const ca = (i + j + 1) / 2 * LA, cw = (i - j) / 2 * LW;
		if (ca < 8 || ca > 1400 || Math.abs(cw) > HW0 + LW / 2) continue;
		const pale = ((i + j) % 2 + 2) % 2 === 0;
		const side = cw > 0.5 ? 1 : cw < -0.5 ? -0.25 : 0.4;   // the right flank faces the light
		const spec = Math.exp(-Math.pow((ca - 75) / 40, 2)) * (0.45 + 0.55 * side);
		const fog = 1 - Math.exp(-Math.max(0, ca - 30) / 200);
		const jit = (rnd(i * 31 + j, 71) - 0.5) * 0.12, base = mix(pale ? '#D2B886' : '#B98443', pale ? '#8A6A3E' : '#6E4824', 0.2 + jit), lit = side > 0.5 ? 0 : 0.42;
		const col = mix(mix(mix(base, '#3A2410', lit), '#FFF6DC', spec * (pale ? 0.85 : 0.3)), FOG, fog * 0.94);
		const d = proj(ca, cw, zAt(ca, cw))[2];
		out.push({u: ca, v: cw, d: quad(ca, cw, 1), dIn: quad(ca, cw, 0.84), dCore: quad(ca, cw, 0.3), pale, col, line: Math.max(0.4, MC.f * 0.36 / d), rim: spec, fog}); }
	return out.sort((a, b) => b.u - a.u); };
const CellG: React.FC<{c: Cell}> = ({c}) => <g>
	<path d={c.d} fill={c.col} stroke={mix(LAT, FOG, c.fog * 0.8)} strokeWidth={c.line} strokeLinejoin="round" />
	<path d={c.dIn} fill="none" stroke={mix(LAT, FOG, c.fog * 0.8)} strokeWidth={c.line * 0.38} strokeOpacity={0.8} />
	{!c.pale && <path d={c.dCore} fill={mix(LAT, FOG, c.fog * 0.8)} opacity={0.75} />}
	{c.pale && c.fog < 0.75 && <path d={c.dIn} fill="none" stroke="#FFF8E4" strokeWidth={c.line * 0.3} strokeOpacity={cl(0.15 + 0.85 * c.rim) * (1 - c.fog)} transform={`translate(${c.line * 0.18},${-c.line * 0.22})`} />}
</g>;
const Macro: React.FC = () => { const cells = cellsMacro();
	const near = cells.filter((c) => c.u < 34), mid = cells.filter((c) => c.u >= 34 && c.u < 220), far = cells.filter((c) => c.u >= 220);
	/* pitting and a faint bloom of corrosion (E8: lightly corroded, not rust-free), scattered over the near and middle ground */
	const pits = Array.from({length: 260}, (_, i) => { const u = 20 + 260 * Math.pow(rnd(i, 81), 1.6), v = (rnd(i, 82) - 0.5) * 2 * (hwAt(u) - STRIP), p = proj(u, v, zAt(u, v)), r = MC.f * (0.08 + 0.18 * rnd(i, 83)) / p[2];
		return <ellipse key={i} cx={p[0]} cy={p[1]} rx={r} ry={r * 0.45} fill="#2A180C" opacity={0.35 + 0.3 * rnd(i, 84)} />; });
	const blooms = [[60, 9, 2.2], [140, -12, 3.0], [46, -15, 1.6], [230, 4, 4]].map(([u, v, r], i) => { const p = proj(u, v, zAt(u, v)), R = MC.f * r / p[2]; return <ellipse key={i} cx={p[0]} cy={p[1]} rx={R} ry={R * 0.4} fill="#3A2A1A" opacity={0.28} filter="url(#mBloom)" />; });
	/* the polished edge strips, as quads along u with fog */
	const strip = (s: 1 | -1) => Array.from({length: 60}, (_, k) => { const u0 = 14 * Math.pow(1400 / 14, k / 60), u1 = 14 * Math.pow(1400 / 14, (k + 1) / 60), fog = 1 - Math.exp(-Math.max(0, u0 - 30) / 200);
		const spec = Math.exp(-Math.pow((u0 - 75) / 45, 2));
		const col = mix(mix(s > 0 ? '#F2D79C' : '#A97C40', '#FFFBEA', spec * (s > 0 ? 0.7 : 0.25)), FOG, fog * 0.92);
		const a = hwAt(u0) - STRIP, b = hwAt(u0), c = hwAt(u1) - STRIP, d = hwAt(u1);
		return <path key={k} d={`M${PT(u0, s * a)}L${PT(u0, s * b)}L${PT(u1, s * d)}L${PT(u1, s * c)}Z`} fill={col} stroke={col} strokeWidth={0.6} />; });
	/* the ridge: one continuous lit line (a polyline per fog step, butt caps so it never beads) */
	const ridge = Array.from({length: 30}, (_, k) => { const us = Array.from({length: 5}, (_, q) => 16 * Math.pow(1400 / 16, (k + q / 4) / 30)), fog = 1 - Math.exp(-Math.max(0, us[0] - 30) / 200);
		const pts = us.map((u) => proj(u, 0, RIDGE)), d0 = pts[0][2];
		return <polyline key={k} points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} fill="none" stroke="#FFF2D0" strokeOpacity={0.7 * (1 - fog)} strokeWidth={Math.max(0.8, MC.f * 0.12 / d0)} strokeLinecap="butt" />; });
	const hz = MC.cy - MC.f * Math.tan(MC.pitch);
	return <Frame id="m" sheen={0.08} over={<><Fonts s="这些菱形纹，是热镀上去的锡。湖北省博物馆热镀锡" /><Subs rows={[{s: '这些菱形纹，是热镀上去的锡。'}]} th={thB} /><StampK y="2025" place="湖北省博物馆" note="热镀锡" /><SealB /></>}>
		<defs>
			<filter id="mNear" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="2 9" /></filter>
			<filter id="mFar" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="1.3" /></filter>
			<filter id="mBok" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
			<filter id="mBloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
		</defs>
		{/* the haze on the horizon where the blade runs out of sight */}
		<Pool id="mh" x={1000} y={hz + 8} rx={720} ry={70} a={0.22} col="#FFC478" />
		<g filter="url(#mFar)">{far.map((c, i) => <CellG key={i} c={c} />)}</g>
		{mid.map((c, i) => <CellG key={i} c={c} />)}
		{blooms}{pits}
		<g filter="url(#mNear)">{near.map((c, i) => <CellG key={i} c={c} />)}</g>
		{strip(1)}{strip(-1)}
		{ridge}
		{/* the raking light: a soft warm sheet across the middle distance */}
		<Pool id="ml" x={1240} y={hz + 150} rx={640} ry={110} a={0.16} col="#FFE2A8" />
		{/* out-of-focus dust in front of the lens */}
		<g filter="url(#mBok)">{[[260, 860, 46, 0.1], [1500, 930, 64, 0.08], [1660, 560, 30, 0.12], [620, 520, 22, 0.1], [1180, 780, 36, 0.07]].map(([x, y, r, o], i) => <circle key={i} cx={x} cy={y} r={r} fill="#FFE0A8" opacity={o} />)}</g>
		{Array.from({length: 40}, (_, i) => <circle key={`s${i}`} cx={120 + 1680 * rnd(i, 51)} cy={hz + 20 + 640 * rnd(i, 52)} r={0.8 + 1.4 * rnd(i, 53)} fill="#FFF0D0" opacity={0.15 + 0.3 * rnd(i, 54)} />)}
	</Frame>; };

/* =========================================== registration =========================================== */
const KFS: [string, React.FC][] = [['HOOK', Hook], ['DESCENT', Descent], ['MACRO', Macro]];
const one = (C: React.FC): React.FC => () => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>;
const All: React.FC = () => { const f = useCurrentFrame(), C = KFS[Math.min(KFS.length - 1, f)][1]; return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>; };
const Root: React.FC = () => <>
	<Composition id="KF53-ALL" component={All} width={W} height={H} fps={30} durationInFrames={KFS.length} />
	{KFS.map(([n, C]) => <Composition key={n} id={`KF53-${n}`} component={one(C)} width={W} height={H} fps={30} durationInFrames={1} />)}
</>;
registerRoot(Root);
void BZ; void SW;
