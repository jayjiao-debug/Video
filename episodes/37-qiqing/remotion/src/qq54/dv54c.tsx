import React from 'react';
import {W, H} from '../qq50/kit50';
import {RimF, P, rnd, f1} from './cao54b';
import {ACC, Qun, Store, limb} from './set54bs';
import {RunnerF, runTop, Flame3, FIRE, RunKind} from './front54s';
/* ep54 · D1 design variant C 「号令」 (owner: "冲出屏幕的感觉，镜头在剑前面看后面"; the current 曹操 is "太弱了").
   D1V = the whole D1 shot for film 100.256–102.248 (t = film time). The camera sits just above and in front of his 宝剑, looking back
   along it: the blade (projected in 3D, f = 1100 px) runs from the huge point at the lower right (over the bottom bar) up to his fist at
   the left; his face close behind the guard, mouth open on the shout (「杀」, no text), brows knitted; his left arm flung back and up,
   pointing the charge at 乌巢 burning on the horizon to the right. Iron 兜鍪 with a red crest; cape, crest and banners whip; the men
   run past the lens on both sides (blurred) and stream past behind him toward the fire. Dutch tilt on the world. */
const T1 = 100.256;
const cl = (v: number) => Math.min(1, Math.max(0, v));
const eout = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const ease = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const pp = (a: P[]) => a.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ');
const add = (a: P, b: P, k = 1): P => [a[0] + b[0] * k, a[1] + b[1] * k];

/* ---------- 3D (camera space, metres, y down) ---------- */
type V3 = [number, number, number];
const FOC = 1100, CX = 960, CY = 540;
const prj = (p: V3): P => [CX + (FOC * p[0]) / p[2], CY + (FOC * p[1]) / p[2]];
const va = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const vn = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
const vx = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/* ---------- the camera move: the thrust on the hit, the push-in, the shake ---------- */
const FX = 990, FY = 380;
const zoomAt = (d: number) => 1 + 0.14 * eout((d - 0.03) / 2.0);
const plz = (zm: number, p: number, dx = 0) => { const s = 1 + (zm - 1) * p;
	return `translate(${f1(FX + dx * p)},${f1(FY)}) scale(${s.toFixed(5)}) translate(${-FX},${-FY})`; };

/** the sword in camera space at d (s after the hit): it starts a hand back and snaps toward the lens over 5 frames, then trembles */
const swordAt = (d: number) => {
	const sn = eout(d / 0.17), back = 0.09 * (1 - sn), tr = Math.sin(d * 31) * 0.0012 * cl(d / 0.3), tr2 = Math.cos(d * 23) * 0.0009 * cl(d / 0.3);
	const G: V3 = [-0.168 + tr2, 0.030 + tr, 0.70 + back], T: V3 = [0.070 + tr2, 0.0606 + tr, 0.158 + back];
	const u = vn(va(T, G, -1)), L = Math.hypot(T[0] - G[0], T[1] - G[1], T[2] - G[2]);
	/* the flat of the blade faces the lens (we look along it from just above): width ⟂ the blade and the view ray */
	const M = va(G, T); let w = vn(vx(u, M)); let n = vn(vx(w, u)); if (n[2] > 0) n = [-n[0], -n[1], -n[2]];
	const ro = 0.18, w2: V3 = va(w.map((x) => x * Math.cos(ro)) as V3, n, Math.sin(ro)), n2: V3 = va(n.map((x) => x * Math.cos(ro)) as V3, w, -Math.sin(ro));
	return {G, T, u, w: w2, n: n2, L, sn};
};
type SW = ReturnType<typeof swordAt>;
/** the blade's half-width (m) and ridge height along s (0 = guard, 1 = point): straight taper, then a slightly convex point */
const SP = 0.905;
const hwAt = (s: number) => { const hb = 0.0205 - 0.0042 * Math.min(s, SP) / SP; if (s <= SP) return hb; const q = (s - SP) / (1 - SP); return hb * (1 - q) * (1 + 0.55 * q); };
const thAt = (s: number) => 0.0048 * (1 - 0.35 * s) * (s > SP ? 1 - (s - SP) / (1 - SP) : 1);

/** the 宝剑: straight, double-edged, a central ridge, a plain dark-bronze guard with one thin gold inlay line; the glint on the point */
const Sword: React.FC<{d: number; t: number}> = ({d, t}) => { const g = swordAt(d), {G, u, w, n, L} = g;
	const C = (s: number): V3 => va(G, u, s * L);
	const ss = [0, SP, ...Array.from({length: 12}, (_, i) => SP + (1 - SP) * (i + 1) / 12)];
	const eL = ss.map((s) => prj(va(C(s), w, hwAt(s)))), eR = ss.map((s) => prj(va(C(s), w, -hwAt(s)))), rg = ss.map((s) => prj(va(C(s), n, thAt(s))));
	const bL = ss.map((s) => prj(va(va(C(s), w, hwAt(s) * 0.8), n, thAt(s) * 0.2))), bR = ss.map((s) => prj(va(va(C(s), w, -hwAt(s) * 0.8), n, thAt(s) * 0.2)));
	const g0 = prj(G), tp = prj(C(1));
	/* which face is up on screen (it catches the fire sky): warm; the other cool */
	const upL = eL[1][1] < eR[1][1];
	const faceL = pp([...eL, ...rg.slice().reverse()]), faceR = pp([...rg, ...eR.slice().reverse()]);
	const bevL = pp([...eL, ...bL.slice().reverse()]), bevR = pp([...eR, ...bR.slice().reverse()]);
	/* the gold inlay along the ridge just past the guard */
	const inl = pp([prj(va(va(C(0.03), n, thAt(0.03)), w, 0.0012)), prj(va(va(C(0.13), n, thAt(0.13)), w, 0.0012)), prj(va(va(C(0.13), n, thAt(0.13)), w, -0.0012)), prj(va(va(C(0.03), n, thAt(0.03)), w, -0.0012))]);
	/* the guard (剑格): a hexagonal bronze bar across the blade */
	const hex = (k: number) => ([[0.05, 0], [0.036, 0.014], [-0.036, 0.014], [-0.05, 0], [-0.036, -0.014], [0.036, -0.014]] as [number, number][]).map(([a, b]) => prj(va(va(va(G, u, k), w, a), n, b)));
	const hb = hex(-0.012), hf = hex(0.006);
	const sides = hb.map((p, i) => { const j = (i + 1) % 6; return {q: [p, hb[j], hf[j], hf[i]], i}; });
	/* the glint: big on the black first frames, then a star that breathes; a highlight sweeps down the lit edge on the hit */
	const ga = d < 0.06 ? 1.7 : 0.6 + 0.6 * Math.exp(-(d - 0.06) / 0.4), gl = d < 0 ? 0 : 0.85 + 0.15 * Math.sin(t * 9), Lg = 90 * ga, Vg = 56 * ga;
	const sw = cl((d - 0.12) / 0.35), sweep = sw > 0 && sw < 1 ? ss.length : 0;
	const sp0 = Math.max(0, sw - 0.12), sp1 = Math.min(1, sw + 0.02), sEdge = upL ? eL : eR;
	const sweepPts = sweep ? [prj(va(C(sp0), w, (upL ? 1 : -1) * hwAt(sp0))), prj(va(C(sp1), w, (upL ? 1 : -1) * hwAt(sp1)))] : null;
	void sEdge;
	return <g>
		<defs>
			<linearGradient id="dvcBw" x1={f1(g0[0])} y1={f1(g0[1])} x2={f1(tp[0])} y2={f1(tp[1])} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#9A6E52" /><stop offset="0.45" stopColor="#E8A466" /><stop offset="0.8" stopColor="#FFD9A6" /><stop offset="1" stopColor="#FFF0D2" /></linearGradient>
			<linearGradient id="dvcBc" x1={f1(g0[0])} y1={f1(g0[1])} x2={f1(tp[0])} y2={f1(tp[1])} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#1A1E24" /><stop offset="0.5" stopColor="#33424C" /><stop offset="0.85" stopColor="#5E8290" /><stop offset="1" stopColor="#9CC6CE" /></linearGradient>
			<radialGradient id="dvcTg"><stop offset="0" stopColor="#FFF6E0" stopOpacity="1" /><stop offset="0.2" stopColor="#FFD08A" stopOpacity="0.55" /><stop offset="1" stopColor="#FF8A3A" stopOpacity="0" /></radialGradient>
		</defs>
		{/* a dark contact edge so the blade reads on the bright sky */}
		<polygon points={pp([...eL, ...eR.slice().reverse()])} fill="none" stroke="#0E0806" strokeWidth={5} strokeLinejoin="round" opacity={0.55} />
		<polygon points={faceL} fill={upL ? 'url(#dvcBw)' : 'url(#dvcBc)'} />
		<polygon points={faceR} fill={upL ? 'url(#dvcBc)' : 'url(#dvcBw)'} />
		{/* the sharpened bevels: a bright strip along the lit edge, a cool one along the shaded edge */}
		<polygon points={upL ? bevL : bevR} fill="#FFF2D8" opacity={0.85} />
		<polygon points={upL ? bevR : bevL} fill="#8FD0DC" opacity={0.55} />
		<polyline points={pp(rg)} fill="none" stroke="#FFF4DC" strokeWidth={2.2} opacity={0.9} />
		<polygon points={inl} fill="#E8B862" />
		{sweepPts && <line x1={sweepPts[0][0]} y1={sweepPts[0][1]} x2={sweepPts[1][0]} y2={sweepPts[1][1]} stroke="#FFFBEE" strokeWidth={7} strokeLinecap="round" opacity={0.95} />}
		{/* the guard */}
		<polygon points={pp(hb)} fill="#1A140E" />
		{sides.map(({q, i}) => <polygon key={i} points={pp(q)} fill={i === 0 || i === 5 ? '#8A6A40' : i === 1 || i === 4 ? '#4A3824' : '#2A1E14'} />)}
		<polygon points={pp(hf)} fill="#3E3022" />
		<polygon points={pp([hf[0], hf[1], hf[2], hf[3]])} fill="#6A5232" opacity={0.7} />
		<polyline points={pp([hf[5], hf[0], hf[1]])} fill="none" stroke="#C89A5A" strokeWidth={2.4} opacity={0.85} />
		<polyline points={pp([hf[2], hf[3], hf[4]])} fill="none" stroke="#8FD0DC" strokeWidth={1.6} opacity={0.5} />
		{gl > 0.01 && <g opacity={gl}><circle cx={tp[0]} cy={tp[1]} r={80 * ga} fill="url(#dvcTg)" />
			<path d={`M${f1(tp[0] - Lg)},${f1(tp[1])} L${f1(tp[0])},${f1(tp[1] - 3.4)} L${f1(tp[0] + Lg)},${f1(tp[1])} L${f1(tp[0])},${f1(tp[1] + 3.4)} Z M${f1(tp[0])},${f1(tp[1] - Vg)} L${f1(tp[0] + 3)},${f1(tp[1])} L${f1(tp[0])},${f1(tp[1] + Vg)} L${f1(tp[0] - 3)},${f1(tp[1])} Z`} fill="#FFF6E0" /></g>}
	</g>; };

/* ---------- 曹操, front, raging: local units (chin of the closed mouth at 0, the face ±80 wide), the figure palette ---------- */
const C_ = {skin: '#B9784F', skinS: '#6E4130', skinD: '#452619', skinH: '#F2A86C', skinHH: '#FFD39E', hair: '#15100E', grey: '#A09486', line: '#24140E',
	metal: '#3A3534', metalS: '#161212', metalH: '#D88A4C', lace: '#7A2C20', under: '#5A2C24', underS: '#2A1512', underH: '#C8643C',
	cape: '#2E1716', capeS: '#140A0A', capeH: '#C0542C', white: '#D8CDB8', crest: '#B02A1C', crestH: '#F06A3A', crestS: '#5A120C'};
const J = 16;   /* the jaw drop of the shout */
const FACE = `M-74,-150 C-80,-130 -82,-110 -80,-92 C-79,-74 -77,-54 -73,-36 C-69,-16 -61,${4 + J} -45,${14 + J} C-31,${22 + J} -16,${26 + J} 0,${26 + J} C16,${26 + J} 31,${22 + J} 45,${14 + J} C61,${4 + J} 69,-16 73,-36 C77,-54 79,-74 80,-92 C82,-110 80,-130 74,-150 C50,-172 -50,-172 -74,-150 Z`;
const BEARD = `M-83,-76 C-82,-52 -77,-26 -66,-4 C-52,${18 + J} -29,${36 + J} 0,${40 + J} C29,${36 + J} 52,${18 + J} 66,-4 C77,-26 82,-52 83,-76 L73,-74 C71,-54 66,-36 57,-22 C50,-12 43,-4 37,0 C33,12 24,26 12,${14 + J} C5,${16 + J} -5,${16 + J} -12,${14 + J} C-24,26 -33,12 -37,0 C-43,-4 -50,-12 -57,-22 C-66,-36 -71,-54 -73,-74 Z`;
const MOUTH = `M-33,-20 C-22,-28 22,-28 33,-20 C37,-6 30,${6 + J} 17,${12 + J} C7,${15 + J} -7,${15 + J} -17,${12 + J} C-30,${6 + J} -37,-6 -33,-20 Z`;
const BSTR = Array.from({length: 40}, (_, i) => { const side = i % 2 ? 1 : -1, k = Math.floor(i / 2) / 19;
	const x0 = side * (80 - k * 66), y0 = -70 + k * (98 + J) - (k > 0.85 ? (k - 0.85) * 40 : 0), dx = side * -(2 + k * 5), dy = 8 + k * 4;
	return `M${f1(x0)},${f1(y0)} l${f1(dx)},${f1(dy)}`; }).join(' ');
const HeadR: React.FC<{t: number}> = ({t}) => { const c = C_;
	const eye = (s: number) => { const x = s * 37, y = -84, mx = (v: number) => x + s * v;
		const alm = `M${mx(-19)},${y + 1} C${mx(-10)},${y - 4} ${mx(10)},${y - 9} ${mx(21)},${y - 4} C${mx(12)},${y + 6} ${mx(-8)},${y + 7} ${mx(-19)},${y + 1} Z`;
		return <g key={s}>
			<defs><clipPath id={`dvcE${s}`}><path d={alm} /></clipPath></defs>
			{/* the socket under the knitted brow */}
			<path d={`M${mx(-26)},${y - 12} C${mx(-8)},${y - 22} ${mx(14)},${y - 22} ${mx(30)},${y - 14} L${mx(26)},${y + 2} C${mx(10)},${y - 6} ${mx(-10)},${y - 4} ${mx(-24)},${y + 4} Z`} fill={c.skinD} opacity={s < 0 ? 0.8 : 0.55} />
			<path d={alm} fill={s < 0 ? '#9C8C78' : '#E6D2B6'} />
			<g clipPath={`url(#dvcE${s})`}><circle cx={mx(-1)} cy={y - 0.5} r={6.6} fill="#2A1A12" /><circle cx={mx(-1)} cy={y - 0.5} r={3.4} fill="#050302" />
				<rect x={x - 24} y={y - 12} width={48} height={6} fill="#000" opacity={0.45} /></g>
			<circle cx={mx(-1) + 2} cy={y - 2.6} r={1.6} fill={s < 0 ? '#CFF0F4' : '#FFE8C0'} />
			{/* the upper lid, heavy, pulled down at the inner corner by the brow */}
			<path d={`M${mx(-23)},${y + 3} C${mx(-12)},${y - 5} ${mx(10)},${y - 11} ${mx(24)},${y - 5}`} fill="none" stroke={c.line} strokeWidth={5} strokeLinecap="round" />
			<path d={`M${mx(-16)},${y + 6} C${mx(-4)},${y + 9} ${mx(10)},${y + 7} ${mx(18)},${y + 1}`} fill="none" stroke={c.line} strokeWidth={1.6} opacity={0.6} />
			<path d={`M${mx(-14)},${y + 14} C${mx(-2)},${y + 18} ${mx(10)},${y + 16} ${mx(19)},${y + 10}`} fill="none" stroke={c.line} strokeWidth={1.3} opacity={0.4} />
			{/* the brow: thick, its inner end low and close to the other (knitted) */}
			<path d={`M${mx(34)},${y - 30} C${mx(16)},${y - 36} ${mx(-4)},${y - 30} ${mx(-26)},${y - 15} L${mx(-21)},${y - 5} C${mx(-4)},${y - 18} ${mx(14)},${y - 23} ${mx(33)},${y - 21} Z`} fill={c.hair} />
			<path d={`M${mx(30)},${y - 28} C${mx(14)},${y - 31} ${mx(0)},${y - 27} ${mx(-14)},${y - 18}`} fill="none" stroke={c.grey} strokeWidth={1.2} opacity={0.45} />
		</g>; };
	return <g>
		<defs><clipPath id="dvcF"><path d={FACE} /></clipPath><clipPath id="dvcB"><path d={BEARD} /></clipPath><clipPath id="dvcM"><path d={MOUTH} /></clipPath></defs>
		{/* the strong neck under the jaw */}
		<path d="M-60,-10 C-62,20 -66,48 -72,72 L72,72 C66,48 62,20 60,-10 Z" fill={c.skinS} />
		<path d="M28,0 C34,24 38,46 42,72 L72,72 C66,48 62,20 60,-10 Z" fill={c.skinH} opacity={0.6} />
		<path d={FACE} fill={c.skin} />
		<g clipPath="url(#dvcF)">
			<path d="M-4,-172 C-2,-128 -12,-96 -10,-70 C-8,-52 -16,-44 -14,-30 C-12,-14 -16,10 -12,50 L-110,50 L-110,-172 Z" fill={c.skinS} />
			<path d="M24,-160 C50,-160 70,-150 76,-132 C76,-122 74,-114 70,-108 C56,-118 40,-126 24,-130 Z" fill={c.skinH} opacity={0.85} />
			{/* the raised cheek of the shout, lit */}
			<path d="M46,-70 C60,-72 74,-78 80,-86 C80,-68 78,-52 74,-38 C70,-28 64,-20 56,-14 C58,-32 54,-52 46,-70 Z" fill={c.skinH} />
			<path d="M58,-82 C68,-84 76,-88 80,-96 C81,-90 81,-86 80,-82 C72,-80 64,-80 58,-80 Z" fill={c.skinHH} opacity={0.8} />
			<path d="M4,-96 C8,-80 10,-62 14,-50 L6,-48 C4,-62 2,-80 0,-94 Z" fill={c.skinH} opacity={0.9} />
			<path d="M-74,-140 C-78,-110 -80,-80 -72,-50 L-82,-50 L-82,-140 Z" fill="#000" opacity={0.25} />
		</g>
		{eye(-1)}{eye(1)}
		{/* the knit between the brows, the wrinkled bridge */}
		<path d="M-7,-112 C-9,-104 -9,-96 -6,-88 M7,-112 C9,-104 9,-96 6,-88 M-1,-116 L-1,-104" fill="none" stroke={c.line} strokeWidth={2.4} opacity={0.75} />
		<path d="M-11,-80 C-4,-76 4,-76 11,-80 M-9,-73 C-3,-70 3,-70 9,-73" fill="none" stroke={c.line} strokeWidth={1.8} opacity={0.6} />
		<path d="M-56,-138 C-30,-146 30,-146 56,-138 M-50,-128 C-26,-134 26,-134 50,-128" fill="none" stroke={c.skinD} strokeWidth={1.6} opacity={0.4} />
		{/* the nose, nostrils flared */}
		<path d="M-8,-94 C-10,-76 -12,-60 -19,-46" fill="none" stroke={c.skinD} strokeWidth={2.6} opacity={0.6} />
		<path d="M-24,-44 C-18,-32 -6,-31 0,-34 C6,-31 18,-32 24,-44 C16,-39 8,-39 0,-41 C-8,-39 -16,-39 -24,-44 Z" fill={c.skinD} opacity={0.85} />
		<ellipse cx={-11} cy={-39} rx={6.4} ry={3.2} fill="#1A0C08" /><ellipse cx={11} cy={-39} rx={6.4} ry={3.2} fill="#2A140C" />
		<path d="M-25,-46 C-30,-52 -26,-58 -19,-56 M25,-46 C30,-52 26,-58 19,-56" fill="none" stroke={c.skinD} strokeWidth={2} opacity={0.7} />
		<ellipse cx={7} cy={-52} rx={6} ry={4.4} fill={c.skinHH} opacity={0.75} />
		{/* the deep folds from the nose to the corners of the shouting mouth */}
		<path d="M-26,-48 C-38,-36 -42,-22 -40,-8" fill="none" stroke={c.skinD} strokeWidth={2.6} opacity={0.75} />
		<path d="M26,-48 C38,-36 42,-22 40,-8" fill="none" stroke={c.skinS} strokeWidth={2.4} opacity={0.75} />
		{/* the open mouth: dark, the upper teeth, the lower teeth, the tongue */}
		<path d={MOUTH} fill="#240A06" />
		<g clipPath="url(#dvcM)">
			<ellipse cx={0} cy={10 + J} rx={20} ry={9} fill="#6E2620" />
			<path d="M-34,-30 L34,-30 L34,-13 C20,-9 -20,-9 -34,-13 Z" fill="#E6D8BE" />
			<path d="M-16,-22 L-16,-11 M-6,-23 L-6,-10 M6,-23 L6,-10 M16,-22 L16,-11 M-25,-20 L-25,-12 M25,-20 L25,-12" stroke="#9A8A72" strokeWidth={1.2} />
			<path d="M-34,-30 L34,-30 L34,-23 C20,-21 -20,-21 -34,-23 Z" fill="#000" opacity={0.25} />
			<path d={`M-30,${8 + J} C-18,${3 + J} 18,${3 + J} 30,${8 + J} L30,${20 + J} L-30,${20 + J} Z`} fill="#CDBFA4" />
			<path d={`M-10,${4 + J} L-10,${12 + J} M0,${3.6 + J} L0,${12 + J} M10,${4 + J} L10,${12 + J}`} stroke="#8A7A62" strokeWidth={1.1} />
		</g>
		<path d={MOUTH} fill="none" stroke="#3A160E" strokeWidth={2.4} />
		{/* the lower lip */}
		<path d={`M-17,${12 + J} C-7,${15 + J} 7,${15 + J} 17,${12 + J} C10,${20 + J} -10,${20 + J} -17,${12 + J} Z`} fill={c.skinS} />
		{/* the beard: dense and short, greying; lit warm on his left, the cool accent on his right */}
		<path d={BEARD} fill="#2E2824" />
		<g clipPath="url(#dvcB)">
			<path d={`M-90,-80 L-6,-80 C-8,-40 -10,0 -8,${60 + J} L-90,${60 + J} Z`} fill="#000" opacity={0.35} />
			<path d={`M50,-60 C70,-60 84,-70 86,-80 L90,${60 + J} L30,${60 + J} C52,${20 + J} 62,0 66,-20 C62,-36 56,-50 50,-60 Z`} fill="#6A4A34" opacity={0.55} />
			<path d={BSTR} fill="none" stroke={c.grey} strokeWidth={2} strokeLinecap="round" opacity={0.9} />
		</g>
		<path d={`M83,-76 C82,-52 77,-26 66,-4 C52,${18 + J} 29,${36 + J} 0,${40 + J}`} fill="none" stroke={c.metalH} strokeWidth={2.6} opacity={0.8} />
		<path d={`M-83,-76 C-82,-52 -77,-26 -66,-4 C-52,${18 + J} -29,${36 + J} 0,${40 + J}`} fill="none" stroke={ACC} strokeWidth={1.8} opacity={0.5} />
		{/* the moustache over the upper lip, down to the corners */}
		<path d="M-2,-33 C-14,-37 -30,-32 -39,-10 C-34,-16 -24,-25 -3,-26 Z M2,-33 C14,-37 30,-32 39,-10 C34,-16 24,-25 3,-26 Z" fill="#2E2824" />
		<path d="M-30,-26 C-24,-30 -14,-31 -8,-30 M30,-26 C24,-30 14,-31 8,-30" fill="none" stroke={c.grey} strokeWidth={1.2} opacity={0.6} />
		<Helmet t={t} />
	</g>; };

/** the Han iron 兜鍪: a lamellar dome, a brow band, lamellar cheek guards over the ears, a finial with a small red crest whipping back */
const Helmet: React.FC<{t: number}> = ({t}) => { const c = C_;
	const dome = 'M-88,-146 C-96,-212 -70,-284 0,-300 C70,-284 96,-212 88,-146 Z';
	const chL = 'M-80,-156 L-106,-150 C-114,-112 -112,-78 -104,-42 L-82,-50 C-84,-88 -84,-124 -78,-152 Z';
	const chR = 'M80,-156 L106,-150 C114,-112 112,-78 104,-42 L82,-50 C84,-88 84,-124 78,-152 Z';
	const w1 = Math.sin(t * 13.1) * 10, w2 = Math.sin(t * 17.3 + 1) * 14, w3 = Math.sin(t * 11.7 + 2) * 18;
	const crest = `M-6,-326 C30,${-344 + w1} 70,${-340 + w2 * 0.6} ${112 + w2 * 0.8},${-322 + w3 * 0.5} C${150 + w3},${-306 + w2 * 0.4} ${186 + w2},${-296 + w3 * 0.8} ${232 + w3},${-272 + w2 * 0.8} C${186 + w2},${-282 + w1} 146,${-290 + w1 * 0.6} 104,${-300 + w2 * 0.3} C70,${-306 + w1 * 0.4} 30,${-312} 6,-310 Z`;
	return <g>
		<defs><clipPath id="dvcHd"><path d={dome} /></clipPath><clipPath id="dvcHl"><path d={chL} /></clipPath><clipPath id="dvcHr"><path d={chR} /></clipPath></defs>
		{/* the crest streaming back in the wind (behind the finial) */}
		<path d={crest} fill={c.crest} />
		<path d={`M6,-320 C40,${-336 + w1} 80,${-332 + w2 * 0.6} ${120 + w2 * 0.8},${-314 + w3 * 0.5} C${150 + w3},${-302 + w2 * 0.4} ${180 + w2},${-292 + w3 * 0.8} ${214 + w3},${-276 + w2 * 0.8}`} fill="none" stroke={c.crestH} strokeWidth={5} opacity={0.8} />
		<path d={`M10,-312 C50,-318 90,${-312 + w1 * 0.5} ${130 + w2 * 0.8},${-298 + w3 * 0.3}`} fill="none" stroke={c.crestS} strokeWidth={4} opacity={0.7} />
		{[chL, chR].map((d, i) => <g key={i}>
			<path d={d} fill="#262020" />
			<g clipPath={`url(#${i ? 'dvcHr' : 'dvcHl'})`}>
				{Array.from({length: 7}, (_, r) => <path key={r} d={`M-120,${-150 + r * 16} L120,${-150 + r * 16} L120,${-138 + r * 16} L-120,${-138 + r * 16} Z`} fill={c.metal} />)}
				{Array.from({length: 7}, (_, r) => <rect key={'l' + r} x={-120} y={-137 + r * 16} width={240} height={3} fill={c.lace} opacity={0.8} />)}
				<rect x={i ? 92 : -120} y={-160} width={28} height={130} fill={i ? c.metalH : '#000'} opacity={i ? 0.45 : 0.4} />
			</g>
		</g>)}
		<path d={dome} fill="#221C1C" />
		<g clipPath="url(#dvcHd)">
			{/* vertical lamellae converging to the crown */}
			{Array.from({length: 13}, (_, i) => { const a = -1 + i / 6, x0 = a * 96, x1 = a * 14;
				return <path key={i} d={`M${f1(x0 - 6)},-140 L${f1(x1 - 1.4)},-296 L${f1(x1 + 1.4)},-296 L${f1(x0 + 6)},-140 Z`} fill={i < 5 ? '#2E2828' : i < 9 ? c.metal : '#5A4238'} />; })}
			<path d="M-100,-240 C-40,-252 40,-252 100,-240 L100,-234 C40,-246 -40,-246 -100,-234 Z M-100,-196 C-40,-210 40,-210 100,-196 L100,-190 C40,-204 -40,-204 -100,-190 Z" fill={c.lace} opacity={0.75} />
			<path d="M30,-296 C70,-276 92,-220 90,-146 L120,-146 L120,-300 Z" fill={c.metalH} opacity={0.55} />
			<path d="M46,-290 C78,-262 94,-210 92,-146 L120,-146 L120,-300 Z" fill="#FFC890" opacity={0.3} />
			<path d="M-30,-296 C-70,-276 -92,-220 -90,-146 L-120,-146 L-120,-300 Z" fill="#000" opacity={0.35} />
		</g>
		<path d="M-30,-294 C-70,-276 -96,-222 -88,-146" fill="none" stroke={ACC} strokeWidth={2.4} opacity={0.6} />
		<path d="M30,-294 C70,-276 96,-222 88,-146" fill="none" stroke="#FFB070" strokeWidth={3.4} opacity={0.85} />
		{/* the brow band, low over the knitted brows */}
		<path d="M-92,-142 C-50,-158 50,-158 92,-142 L94,-164 C50,-180 -50,-180 -94,-164 Z" fill="#191414" />
		<path d="M-92,-144 C-50,-160 50,-160 92,-144" fill="none" stroke={c.lace} strokeWidth={4} />
		<path d="M40,-174 C64,-172 82,-168 94,-162 L93,-150 C80,-156 62,-160 40,-162 Z" fill={c.metalH} opacity={0.6} />
		{/* the finial */}
		<path d="M-10,-298 L-7,-322 L7,-322 L10,-298 Z" fill="#2A2222" /><ellipse cx={0} cy={-324} rx={12} ry={5} fill="#3A2E2A" />
		<path d="M3,-320 L7,-320 L9,-299 L5,-299 Z" fill={c.metalH} opacity={0.7} />
	</g>; };

/* ---------- the body ---------- */
const TORSO = 'M-176,72 C-146,46 -100,32 -66,30 C-50,58 -26,78 0,82 C26,78 50,58 66,30 C100,32 146,46 176,72 C192,160 190,320 178,470 L-178,470 C-190,320 -192,160 -176,72 Z';
const PAUL = 'M-262,104 C-258,62 -210,36 -140,40 C-130,104 -136,172 -148,224 C-186,236 -230,230 -266,212 C-272,168 -270,132 -262,104 Z';
const PAUR = 'M262,104 C258,62 210,36 140,40 C130,104 136,172 148,224 C186,236 230,230 266,212 C272,168 270,132 262,104 Z';
const LamC: React.FC<{id: string; s: number}> = ({id, s}) => <pattern id={id} width={12 * s} height={22 * s} patternUnits="userSpaceOnUse">
	<rect width={12 * s} height={22 * s} fill="#241E1C" />
	<path d={`M${s * 0.6},${s * 0.6} L${11.6 * s},${s * 0.6} L${11.6 * s},${17.5 * s} C${9 * s},${19.6 * s} ${3 * s},${19.6 * s} ${s * 0.6},${17.5 * s} Z`} fill={C_.metal} />
	<rect x={s * 0.6} y={s * 0.6} width={11 * s} height={2.4 * s} fill="#8A7A70" opacity={0.3} />
	<rect x={0} y={19.8 * s} width={12 * s} height={2.2 * s} fill={C_.lace} opacity={0.7} />
</pattern>;
/** the flung arm (his left, screen right): shoulder → elbow → wrist, back and up; the hand points (index finger) toward 乌巢 */
const ARM_S: P = [196, 70], ARM_E: P = [300, -40], ARM_W: P = [372, -128];
const FlungArm: React.FC<{d: number}> = ({d}) => { const c = C_, k = eout(d / 0.22), lift = (1 - k) * 60;
	const E: P = [ARM_E[0] - lift * 0.6, ARM_E[1] + lift * 1.6], Wr: P = [ARM_W[0] - lift, ARM_W[1] + lift * 2.6], a = Math.atan2(Wr[1] - E[1], Wr[0] - E[0]) * 180 / Math.PI;
	return <g>
		<path d={limb([ARM_S, E, Wr], [46, 34, 24])} fill={c.under} />
		<path d={limb([add(ARM_S, [10, -14]), add(E, [8, -10]), add(Wr, [6, -7])], [12, 9, 6])} fill={c.underH} opacity={0.75} />
		<circle cx={E[0]} cy={E[1]} r={34} fill={c.under} />
		{/* the bracer on the forearm, its cuff */}
		<path d={limb([add(E, [(Wr[0] - E[0]) * 0.25, (Wr[1] - E[1]) * 0.25]), Wr], [28, 23])} fill={c.metal} />
		<path d={limb([add(E, [(Wr[0] - E[0]) * 0.25 + 8, (Wr[1] - E[1]) * 0.25 - 10]), add(Wr, [6, -8])], [7, 6])} fill={c.metalH} opacity={0.75} />
		<path d={limb([add(Wr, [(E[0] - Wr[0]) * 0.07, (E[1] - Wr[1]) * 0.07]), add(Wr, [(Wr[0] - E[0]) * 0.03, (Wr[1] - E[1]) * 0.03])], [26, 25])} fill={c.lace} />
		{/* the hand: knuckles, the index finger out along the arm, the thumb */}
		<g transform={`translate(${f1(Wr[0])},${f1(Wr[1])}) rotate(${f1(a + 6)}) scale(0.72)`}>
			<path d="M4,-24 C24,-30 44,-26 52,-14 C58,0 54,18 40,24 C24,28 8,26 0,18 C-6,6 -6,-14 4,-24 Z" fill={c.skin} />
			<path d="M4,-24 C24,-30 44,-26 52,-14 C46,-16 30,-18 12,-14 Z" fill={c.skinH} />
			<path d="M48,-20 C70,-26 96,-30 116,-30 C122,-28 122,-20 116,-18 C96,-16 74,-12 54,-6 Z" fill={c.skin} />
			<path d="M50,-21 C72,-27 96,-31 116,-30 C120,-30 121,-27 120,-25 C98,-26 74,-23 52,-16 Z" fill={c.skinHH} opacity={0.8} />
			<path d="M20,16 C34,6 50,4 60,8 C58,16 46,22 32,24 Z" fill={c.skinS} />
			<path d="M24,-2 C34,0 44,2 52,0 M22,8 C32,10 42,10 50,8" fill="none" stroke={c.skinD} strokeWidth={2} opacity={0.6} />
		</g>
	</g>; };
/** the sword arm (his right, screen left), toward the lens: drawn in SCREEN px from the shoulder to the projected wrist and fist */
const SwordArm: React.FC<{sh: P; g: SW}> = ({sh, g}) => { const c = C_;
	const Wp = prj(va(g.G, g.u, -0.125)), F = prj(va(g.G, g.u, -0.055)), Z = g.G[2], kf = FOC * 0.001 / (Z - 0.05);
	const El: P = [sh[0] - 150, sh[1] + 120];
	const a = Math.atan2(prj(g.G)[1] - Wp[1], prj(g.G)[0] - Wp[0]) * 180 / Math.PI;
	const pom = prj(va(g.G, g.u, -0.17));
	const ax = [Wp[0] - El[0], Wp[1] - El[1]], al = Math.hypot(ax[0], ax[1]), ux: P = [ax[0] / al, ax[1] / al], nx: P = [-ux[1], ux[0]], rW = 80 * kf / 1.6;
	const at = (k: number, o: number): P => [El[0] + ax[0] * k + nx[0] * o, El[1] + ax[1] * k + nx[1] * o];
	const rad = (k: number) => 54 + (rW - 54) * k;
	const ring = (k: number) => { const c0 = at(k, 0), r = rad(k); return `M${f1(c0[0] - nx[0] * r)},${f1(c0[1] - nx[1] * r)} Q${f1(c0[0] + ux[0] * r * 0.5)},${f1(c0[1] + ux[1] * r * 0.5)} ${f1(c0[0] + nx[0] * r)},${f1(c0[1] + nx[1] * r)}`; };
	const ca = Math.atan2(ux[1], ux[0]) * 180 / Math.PI;
	return <g>
		{/* the upper arm (sleeve) down and out to the elbow, the forearm in its bracer coming up at the lens */}
		<path d={limb([sh, El], [62, 58])} fill={c.under} />
		<path d={limb([add(sh, [-40, 30]), add(El, [-46, 10])], [12, 12])} fill={ACC} opacity={0.3} />
		<circle cx={El[0]} cy={El[1]} r={58} fill={c.under} />
		<path d={limb([at(0.05, 0), at(1, 0)], [54, rW])} fill="#262022" />
		<path d={limb([at(0.08, rad(0.08) * 0.45), at(1, rW * 0.45)], [rad(0.08) * 0.3, rW * 0.3])} fill={c.metal} />
		<path d={limb([at(0.08, rad(0.08) * 0.8), at(1, rW * 0.8)], [6, 9])} fill={c.metalH} opacity={0.8} />
		<path d={limb([at(0.08, -rad(0.08) * 0.82), at(1, -rW * 0.82)], [5, 8])} fill={ACC} opacity={0.5} />
		{[0.3, 0.55, 0.8].map((k) => <path key={k} d={ring(k)} fill="none" stroke={c.lace} strokeWidth={5} opacity={0.85} />)}
		{/* the cuff at the wrist, seen nearly end-on */}
		<ellipse cx={Wp[0]} cy={Wp[1]} rx={rW * 0.5} ry={rW * 1.04} transform={`rotate(${f1(ca)},${f1(Wp[0])},${f1(Wp[1])})`} fill={c.lace} />
		<ellipse cx={Wp[0] + ux[0] * 4} cy={Wp[1] + ux[1] * 4} rx={rW * 0.36} ry={rW * 0.86} transform={`rotate(${f1(ca)},${f1(Wp[0] + ux[0] * 4)},${f1(Wp[1] + ux[1] * 4)})`} fill="#2A120E" />
		{/* the pommel peeking behind the fist */}
		<circle cx={pom[0]} cy={pom[1]} r={16 * kf} fill="#2E241A" /><circle cx={pom[0] + 4 * kf} cy={pom[1] - 4 * kf} r={7 * kf} fill="#9A7A4A" opacity={0.6} />
		{/* the fist round the cord-wrapped grip, foreshortened toward the guard: knuckles up toward the fire, fingers curled, the thumb over them */}
		<g transform={`translate(${f1(F[0])},${f1(F[1])}) rotate(${f1(a)}) scale(${(kf * 0.86).toFixed(3)},${kf.toFixed(3)})`}>
			<path d="M-74,-30 C-64,-42 -44,-44 -38,-42 L-38,42 C-52,46 -68,40 -76,28 Z" fill={c.skinS} />
			<path d="M-46,-48 C-22,-60 24,-60 48,-46 C62,-32 64,26 52,42 C32,56 -24,56 -46,44 C-60,28 -60,-32 -46,-48 Z" fill={c.skin} />
			<path d="M-58,4 C-30,12 30,12 62,4 C62,24 54,38 50,42 C30,56 -24,56 -46,44 C-54,36 -58,22 -58,4 Z" fill={c.skinS} opacity={0.7} />
			<path d="M-46,-48 C-40,-56 -30,-56 -24,-51 C-18,-57 -8,-57 -2,-51 C4,-57 14,-57 20,-51 C26,-56 38,-56 48,-46 L46,-36 C24,-42 -16,-42 -44,-36 Z" fill={c.skinH} />
			<path d="M-44,-36 C-16,-42 24,-42 46,-36" fill="none" stroke={c.skinD} strokeWidth={2} opacity={0.4} />
			{[-24, -2, 20].map((x) => <path key={x} d={`M${x},-38 C${x + 3},-16 ${x + 3},8 ${x},30`} fill="none" stroke={c.skinD} strokeWidth={2.6} opacity={0.55} />)}
			<path d="M-42,-4 C-14,-10 16,-10 44,-4" fill="none" stroke={c.skinD} strokeWidth={2} opacity={0.4} />
			<path d="M-36,34 C-22,18 6,10 32,12 C46,14 54,24 48,36 C38,46 10,50 -12,50 C-30,50 -40,44 -36,34 Z" fill={c.skinS} />
			<path d="M-28,26 C-10,16 12,12 32,14 C42,16 48,22 48,28 C34,22 8,22 -28,30 Z" fill={c.skinHH} opacity={0.6} />
			<path d="M36,44 C44,42 50,36 50,30" fill="none" stroke={c.skinD} strokeWidth={2} opacity={0.6} />
		</g>
	</g>; };
/** the figure (cape, flung arm, torso, head) in local units; the sword arm is drawn by the caller in screen px */
const Figure: React.FC<{t: number; d: number}> = ({t, d}) => { const c = C_;
	const w1 = Math.sin(t * 5.6) * 30, w2 = Math.sin(t * 7.1 + 1.2) * 38, w3 = Math.sin(t * 4.7 + 2.1) * 26;
	const CAPER = `M120,60 C200,30 280,0 ${350 + w1 * 0.6},${-40 + w2 * 0.4} C${400 + w2 * 0.5},${-60 + w1 * 0.4} ${450 + w3 * 0.6},${-50 + w2 * 0.5} ${500 + w2 * 0.6},${-20 + w3 * 0.5} C${470 + w3 * 0.5},${40 + w1 * 0.5} ${480 + w1 * 0.5},${110 + w3 * 0.5} ${450 + w2 * 0.4},${190 + w1 * 0.4} C${400 + w1 * 0.3},${240 + w3 * 0.3} 360,${320 + w2 * 0.2} 330,420 C290,320 240,220 160,170 Z`;
	const CAPEL = `M-120,60 C-190,50 -250,60 ${-300 + w3 * 0.4},${80 + w1 * 0.3} C${-350 + w1 * 0.4},${110 + w2 * 0.3} ${-390 + w2 * 0.3},${170 + w3 * 0.3} ${-420 + w3 * 0.4},${240 + w1 * 0.3} C${-390 + w1 * 0.3},${300 + w2 * 0.2} ${-370},${380} -340,470 L-250,470 C-240,380 -220,260 -150,170 Z`;
	return <g>
		<defs><LamC id="dvcLm" s={1.55} /><clipPath id="dvcT"><path d={TORSO} /></clipPath><clipPath id="dvcCr"><path d={CAPER} /></clipPath>
			<clipPath id="dvcNk"><path d="M-84,10 L84,10 L64,30 C48,58 24,80 0,84 C-24,80 -48,58 -64,30 L-84,10 Z" /></clipPath></defs>
		{/* the cape whipping out behind both shoulders, up behind the flung arm */}
		<path d={CAPEL} fill={c.cape} />
		<path d={`M-150,170 C-220,280 -240,380 -250,470 L-300,470 C-280,380 -250,280 -170,160 Z`} fill={c.capeS} />
		<path d={`M${-300 + w3 * 0.4},${80 + w1 * 0.3} C${-350 + w1 * 0.4},${110 + w2 * 0.3} ${-390 + w2 * 0.3},${170 + w3 * 0.3} ${-420 + w3 * 0.4},${240 + w1 * 0.3}`} fill="none" stroke={ACC} strokeWidth={4} opacity={0.45} />
		<path d={CAPER} fill={c.cape} />
		<g clipPath="url(#dvcCr)">
			<path d="M160,170 C240,220 290,320 330,420 L420,420 C380,300 300,190 200,120 Z" fill={c.capeS} />
			<path d={`M180,50 C250,20 ${310 + w1 * 0.5},${-10} ${360 + w2 * 0.5},${-30} C${330 + w1 * 0.5},${20} 260,${60} 200,110 Z`} fill={c.capeH} opacity={0.55} />
			<path d={`M${500 + w2 * 0.6},${-20 + w3 * 0.5} C${470 + w3 * 0.5},${40 + w1 * 0.5} ${480 + w1 * 0.5},${110 + w3 * 0.5} ${450 + w2 * 0.4},${190 + w1 * 0.4} L${420 + w2 * 0.4},${180 + w1 * 0.4} C${450 + w1 * 0.5},${110 + w3 * 0.5} ${440 + w3 * 0.5},${40 + w1 * 0.5} ${470 + w2 * 0.6},${-14 + w3 * 0.5} Z`} fill="#FFB070" opacity={0.6} />
		</g>
		<FlungArm d={d} />
		{/* the cuirass: lamellar, hunched, shaded away from the fire, lit toward it */}
		<path d={TORSO} fill="url(#dvcLm)" />
		<g clipPath="url(#dvcT)">
			<path d="M-30,40 C-36,200 -40,340 -44,480 L-200,480 L-200,40 Z" fill="#000" opacity={0.5} />
			<path d="M80,50 C110,180 116,320 112,480 L200,480 L200,50 Z" fill={c.metalH} opacity={0.26} />
			<path d="M134,60 C156,180 162,320 158,480 L200,480 L200,60 Z" fill="#FFC890" opacity={0.3} />
			{[150, 240, 330].map((y) => <rect key={y} x={-200} y={y} width={400} height={4} fill={c.lace} opacity={0.6} />)}
		</g>
		{/* the 披膊 over the raised left shoulder (screen right), tilted up with the arm */}
		<g transform="rotate(-24,180,60)"><path d={PAUR} fill="url(#dvcLm)" />
			<path d="M210,70 C236,80 248,100 250,130 C256,170 256,200 252,230 L232,236 C236,190 232,130 206,82 Z" fill={c.metalH} opacity={0.55} />
			<path d="M252,214 C224,234 186,240 154,228" fill="none" stroke={c.lace} strokeWidth={8} /></g>
		<g transform="translate(0,-8) scale(1.0)"><HeadR t={t} /></g>
		{/* the robe at the throat: 交领 右衽 */}
		<g clipPath="url(#dvcNk)">
			<path d="M-80,20 C-40,12 40,12 80,20 L80,100 L-80,100 Z" fill={c.under} />
			<path d="M-66,30 C-46,40 -26,46 -6,54" fill="none" stroke="#24120E" strokeWidth={14} />
			<path d="M-62,22 C-42,32 -22,38 -2,46" fill="none" stroke={c.white} strokeWidth={8} opacity={0.85} />
			<path d="M62,20 C40,30 18,40 -2,48 C-24,58 -48,76 -70,98 L80,98 L80,20 Z" fill={c.under} />
			<path d="M80,20 C60,34 44,50 30,66 L80,66 Z" fill={c.underH} opacity={0.4} />
			<path d="M66,28 C44,38 22,48 2,56 C-20,66 -42,82 -62,102" fill="none" stroke="#24120E" strokeWidth={14} />
			<path d="M58,16 C36,26 14,36 -6,44 C-28,54 -52,72 -74,94" fill="none" stroke={c.white} strokeWidth={8} />
		</g>
		<path d="M-176,72 C-146,46 -100,32 -66,30 C-50,58 -26,78 0,82 C26,78 50,58 66,30 C100,32 146,46 176,72" fill="none" stroke={c.lace} strokeWidth={7} />
		{/* the 披膊 over the right shoulder (screen left), under which the sword arm comes out */}
		<path d={PAUL} fill="url(#dvcLm)" /><path d={PAUL} fill="#000" opacity={0.4} />
		<path d="M-266,212 C-230,230 -186,236 -148,224" fill="none" stroke={c.lace} strokeWidth={8} />
		<path d="M-262,104 C-258,62 -210,36 -140,40" fill="none" stroke={ACC} strokeWidth={3} opacity={0.55} />
	</g>; };
/* the figure's placement: chin at (HX, HY), scale S, a lean */
const HX = 1010, HY = 555, S = 1.4, LEAN = -5;
const figTf = (d: number) => { const k = eout(d / 0.2), s = S * (0.95 + 0.05 * k), dy = (1 - k) * 18;
	return {tf: `translate(${HX},${f1(HY + dy)}) rotate(${LEAN}) scale(${s.toFixed(4)})`, s, dy}; };
const toScr = (p: P, d: number): P => { const {s, dy} = figTf(d), a = LEAN * Math.PI / 180;
	return [HX + s * (p[0] * Math.cos(a) - p[1] * Math.sin(a)), HY + dy + s * (p[0] * Math.sin(a) + p[1] * Math.cos(a))]; };

/* ---------- the world behind: the fire sky, smoke, 乌巢 burning on the horizon (right), the charge streaming toward it ---------- */
const HZ = 650, CH = 1.35, TILT = -5.5;
type Rn = {X: number; Z0: number; ph: number; kind: RunKind; i: number; vx: number; vz: number; t0: number};
const RUN: Rn[] = Array.from({length: 190}, (_, i) => { const q = rnd(i, 13), side = rnd(i, 14) < 0.5 ? -1 : 1, Z0 = 3.6 + Math.pow(rnd(i, 15), 1.4) * 80;
	const X = side * (0.9 + rnd(i, 16) * 5.5) * Math.min(1, 0.4 + Z0 / 30);
	return {X, Z0, ph: rnd(i, 17) * 6.28, kind: q < 0.6 ? 'torch' : q < 0.72 && Z0 > 9 ? 'banner' : q < 0.92 ? 'ji' : 'plain', i, vx: 1.9, vz: 4.6, t0: 0}; });
/* the near men: they come past the lens from behind the camera, on both sides, and run on into the scene */
const NEAR: Rn[] = Array.from({length: 9}, (_, i) => { const side = i % 2 ? 1 : -1;
	return {X: side * (1.05 + rnd(i, 61) * 0.5), Z0: 0.5, ph: rnd(i, 62) * 6.28, kind: 'plain', i: 500 + i, vx: 0.15 * side, vz: 4.4, t0: -0.25 + i * 0.27 + rnd(i, 64) * 0.12}; });
const runPos = (m: Rn, d: number) => { const dt = d - m.t0, Z = m.Z0 + m.vz * dt, X = m.X + m.vx * dt;
	return {Z, x: CX + FOC * X / Z, y: HZ + FOC * CH / Z, k: FOC / (100 * Z)}; };
const Flag: React.FC<{x: number; y: number; k: number; t: number; i: number}> = ({x, y, k, t, i}) => { const wv = Math.sin(t * 9 + i) * 0.16 * k, wv2 = Math.sin(t * 12.3 + i * 2) * 0.12 * k;
	const fw = -0.7 * k, fh = 1.55 * k;
	return <g>
		<path d={`M${f1(x)},${f1(y)} L${f1(x + fw)},${f1(y + wv * 0.4)} C${f1(x + fw - wv)},${f1(y + fh * 0.35)} ${f1(x + fw + wv2)},${f1(y + fh * 0.7)} ${f1(x + fw - wv * 0.7)},${f1(y + fh)} L${f1(x)},${f1(y + fh - 0.05 * k)} Z`} fill="#7A2418" />
		<path d={`M${f1(x + fw * 0.6)},${f1(y)} L${f1(x + fw)},${f1(y + wv * 0.4)} C${f1(x + fw - wv)},${f1(y + fh * 0.35)} ${f1(x + fw + wv2)},${f1(y + fh * 0.7)} ${f1(x + fw - wv * 0.7)},${f1(y + fh)} L${f1(x + fw * 0.6)},${f1(y + fh)} Z`} fill="#3A120C" opacity={0.6} />
		<path d={`M${f1(x)},${f1(y)} L${f1(x + fw * 0.35)},${f1(y)} L${f1(x + fw * 0.35)},${f1(y + fh)} L${f1(x)},${f1(y + fh)} Z`} fill="#F08A48" opacity={0.45} />
		<text x={x + fw * 0.5} y={y + fh * 0.56} textAnchor="middle" fontFamily="'Noto Serif CJK SC',serif" fontWeight={700} fontSize={0.52 * k} fill="#F2DDB0">曹</text>
	</g>; };
const runnerEl = (m: Rn, d: number, t: number) => { const p = runPos(m, d), ph = m.ph + t * 8.2, sg = m.X < 0 ? -1 : 1;
	return <g key={m.i} transform={`translate(${f1(p.x)},${f1(p.y)}) scale(${(sg * p.k).toFixed(4)},${p.k.toFixed(4)})`}><RunnerF ph={ph} kind={m.kind} /></g>; };
const torchEl = (m: Rn, d: number, t: number, big = 1) => { if (m.kind !== 'torch') return null; const p = runPos(m, d), ph = m.ph + t * 8.2, q = runTop(ph, 'torch'), sg = m.X < 0 ? -1 : 1;
	const x = p.x + sg * q[0] * p.k, y = p.y + q[1] * p.k, s = p.k * 100;
	return <g key={'f' + m.i}><circle cx={x} cy={y - 0.14 * s} r={0.62 * s * big} fill="url(#dvcGl)" /><Flame3 x={x} y={y} w={0.2 * s} h={0.52 * s} t={t + m.i * 0.37} seed={m.i} /></g>; };
/** a near man's torch, carried forward at shoulder height in the outside hand: it streaks past at mid-frame */
const lowTorch = (m: Rn, d: number, t: number) => { const dt = d - m.t0, Z = m.Z0 + m.vz * dt, sg = m.X < 0 ? -1 : 1, X = m.X + m.vx * dt - sg * 0.32;
	const bob = Math.sin((m.ph + t * 8.2) * 2) * 0.03, x = CX + FOC * X / Z, y = HZ + FOC * (CH - 1.5 + bob) / Z, s = FOC / Z;
	return <g key={'lt' + m.i}>
		<line x1={x} y1={y} x2={x - sg * 0.05 * s} y2={y + 0.42 * s} stroke="#1A0E0A" strokeWidth={0.035 * s} strokeLinecap="round" />
		<circle cx={x} cy={y - 0.1 * s} r={0.5 * s} fill="url(#dvcGl)" />
		<Flame3 x={x} y={y + 0.02 * s} w={0.16 * s} h={0.38 * s} t={t + m.i * 0.37} seed={m.i} />
	</g>; };
const flagEl = (m: Rn, d: number, t: number) => { if (m.kind !== 'banner') return null; const p = runPos(m, d), ph = m.ph + t * 8.2, q = runTop(ph, 'banner'), sg = m.X < 0 ? -1 : 1;
	return <Flag key={'b' + m.i} x={p.x + sg * q[0] * p.k} y={p.y + q[1] * p.k} k={p.k * 100} t={t} i={m.i} />; };

type Blob = {x: number; y: number; r: number; vx: number; vy: number; lit: number};
const SMK: Blob[] = Array.from({length: 34}, (_, i) => ({x: -200 + rnd(i, 21) * 2400, y: -260 + rnd(i, 22) * 820, r: 110 + rnd(i, 23) * 170, vx: 30 + rnd(i, 24) * 40, vy: -(20 + rnd(i, 25) * 40), lit: rnd(i, 26)}));
const COL: Blob[] = Array.from({length: 14}, (_, i) => ({x: 1560 + rnd(i, 31) * 340, y: 470 - i * 30 - rnd(i, 32) * 50, r: 80 + i * 10 + rnd(i, 33) * 40, vx: 50 + rnd(i, 34) * 30, vy: -(60 + rnd(i, 35) * 50), lit: 1 - i / 14}));
const QX: [number, number][] = [[1330, 0.7], [1490, 0.95], [1660, 1.15], [1850, 1.0], [2040, 0.9]];
const World: React.FC<{t: number; d: number; zm: number}> = ({t, d, zm}) => {
	const live = RUN.map((m) => ({m, p: runPos(m, d)})).filter((o) => o.p.Z > 3.4).sort((a, b) => b.p.Z - a.p.Z);
	const far = live.filter((o) => o.p.Z > 26), mid = live.filter((o) => o.p.Z <= 26);
	return <>
		<g transform={plz(zm, 0.2, -30 * ease(d / 2))}><g transform={`rotate(${TILT},960,${HZ})`}>
			<rect x={-600} y={-700} width={W + 1200} height={HZ + 740} fill="url(#dvcSky)" />
			<circle cx={1720} cy={HZ - 120} r={900} fill="url(#dvcHot)" />
			<g filter="url(#dvcSb)">{SMK.map((s, i) => { const x = s.x + s.vx * (d + 2), y = s.y + s.vy * (d + 2), lit = cl((y + 100) / (HZ + 100)) * (0.4 + 0.6 * s.lit);
				return <g key={i}><circle cx={x} cy={y} r={s.r} fill={FIRE.smoke} opacity={0.9} /><ellipse cx={x} cy={y + s.r * 0.5} rx={s.r * 0.8} ry={s.r * 0.4} fill="#B0481E" opacity={lit * 0.8} /></g>; })}
				{COL.map((s, i) => { const x = s.x + s.vx * (d + 1), y = s.y + s.vy * (d + 1);
					return <g key={'c' + i}><circle cx={x} cy={y} r={s.r} fill="#2E1A1C" /><ellipse cx={x} cy={y + s.r * 0.45} rx={s.r * 0.85} ry={s.r * 0.45} fill="#D0602A" opacity={0.25 + 0.6 * s.lit} /></g>; })}</g>
		</g></g>
		<g transform={plz(zm, 0.3, -30 * ease(d / 2))}><g transform={`rotate(${TILT},960,${HZ})`}>
			<ellipse cx={1500} cy={HZ} rx={1300} ry={110} fill="url(#dvcHg)" />
			<path d={`M-600,${HZ} L${W + 600},${HZ} L${W + 600},${H + 800} L-600,${H + 800} Z`} fill="url(#dvcGd)" />
			{Array.from({length: 80}, (_, i) => { const x = -400 + i * 34 + rnd(i, 81) * 20, near = QX.some(([q]) => Math.abs(q - x) < 140), h = 10 + rnd(i, 82) * 26 + (near ? 50 : 0) + (x > 1200 ? 18 : 0);
				return <Flame3 key={i} x={x} y={HZ + 2} w={h * 0.6} h={h} t={t} seed={i * 1.3} />; })}
			{/* 乌巢: the round granaries and a raised store burning, a fire column rising where his hand points */}
			<g filter="url(#dvcRq)">{QX.map(([x, s], i) => <g key={x} transform={`translate(${x},${HZ + 4}) scale(${s})`}>{i === 2 ? <Store body="#1C0E0A" roof="#140906" /> : <Qun drum="#1C0E0A" thatch="#160A08" edge="#FFB04E" />}</g>)}</g>
			{QX.map(([x, s], i) => <g key={'f' + x}>
				<Flame3 x={x + 6} y={HZ - 150 * s} w={115 * s} h={175 * s} t={t} seed={i * 7 + 1} />
				<Flame3 x={x - 50 * s} y={HZ - 84 * s} w={80 * s} h={150 * s} t={t + 0.3} seed={i * 7 + 3} />
				<Flame3 x={x + 52 * s} y={HZ - 90 * s} w={70 * s} h={130 * s} t={t + 0.6} seed={i * 7 + 5} />
			</g>)}
		</g></g>
		{/* the charge: the river of torches far off, the men streaming past behind him */}
		<g transform={plz(zm, 0.55, -30 * ease(d / 2))}><g transform={`rotate(${TILT},960,${HZ})`}>
			{far.map((o) => { const s = Math.max(0.6, 4400 / o.p.Z), fk = 0.75 + 0.25 * Math.sin(t * 11 + o.m.i * 1.7);
				return <g key={o.m.i}>{o.p.Z < 70 && <rect x={o.p.x - 0.13 * o.p.k * 100} y={o.p.y - 1.7 * o.p.k * 100} width={Math.max(1, 0.26 * o.p.k * 100)} height={1.7 * o.p.k * 100} fill="#160A08" opacity={0.85} />}
					{o.m.kind === 'torch' && <><circle cx={o.p.x} cy={o.p.y - 2.15 * o.p.k * 100} r={s * 0.12 + 4} fill="url(#dvcGl)" opacity={fk} /><circle cx={o.p.x} cy={o.p.y - 2.15 * o.p.k * 100} r={Math.max(1.6, s * 0.014)} fill={FIRE.core} /></>}</g>; })}
			<g fill="#150B09" filter="url(#dvcRm)">{mid.map((o) => runnerEl(o.m, d, t))}</g>
			{mid.map((o) => torchEl(o.m, d, t))}{mid.map((o) => flagEl(o.m, d, t))}
			{NEAR.map((m) => { const p = runPos(m, d); return p.Z >= 1.7 && p.Z < 6 ? <g key={m.i}><g fill="#150B09" filter="url(#dvcRm)">{runnerEl(m, d, t)}</g>{lowTorch(m, d, t)}</g> : null; })}
		</g></g>
	</>; };
/** the near men in front of him, at the edges of the frame, blurred by their speed */
const NearMen: React.FC<{t: number; d: number; zm: number}> = ({t, d, zm}) => <g transform={plz(zm, 1.3)}><g transform={`rotate(${TILT},960,${HZ})`}>
	{NEAR.map((m) => { const p = runPos(m, d); if (p.Z < 0.62 || p.Z >= 1.7) return null; const bl = p.Z < 1.1 ? 'dvcNb2' : 'dvcNb1';
		return <g key={m.i} filter={`url(#${bl})`}><g fill="#1C0D08">{runnerEl(m, d, t)}</g>{lowTorch(m, d, t)}</g>; })}
</g></g>;

/* embers and sparks rushing past toward the lens */
const EMB = Array.from({length: 80}, (_, i) => ({X: (rnd(i, 71) - 0.5) * 7, Y: (rnd(i, 72) - 0.75) * 4, Z0: 0.5 + rnd(i, 73) * 9, v: 3 + rnd(i, 74) * 5, hot: rnd(i, 75)}));
const Embers: React.FC<{d: number; o: number}> = ({d, o}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: o}}>
	{EMB.map((e, i) => { const span = 9.5, z = 0.5 + ((e.Z0 - e.v * (d + 3) - 0.5) % span + span) % span, z2 = z + e.v / 30 * 1.6;
		const x = 1300 + FOC * (e.X + 0.6) / z, y = 470 + FOC * (e.Y - 0.3 * (9 - z) * 0.1) / z, x2 = 1300 + FOC * (e.X + 0.6) / z2, y2 = 470 + FOC * (e.Y - 0.3 * (9 - z2) * 0.1) / z2;
		if (x < -100 || x > W + 100 || y < -100 || y > H + 100) return null; const r = Math.min(9, 3.2 / z + 0.8), a = cl((9.5 - z) / 2) * cl((z - 0.5) / 0.3);
		return <line key={i} x1={f1(x)} y1={f1(y)} x2={f1(x2)} y2={f1(y2)} stroke={e.hot > 0.5 ? FIRE.core : FIRE.mid} strokeWidth={r} strokeLinecap="round" opacity={a * 0.9} />; })}
</svg>;

/** the letterbox on the hit: black, then the bars snap open in about 4 frames; the bottom bar stays (the point crosses over it) */
const BAR_REST = 930;
const Letterbox: React.FC<{d: number}> = ({d}) => { const u = eout((d - 0.03) / 0.12), top = 540 * (1 - u), bot = 540 + (BAR_REST - 540) * u;
	return <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
		{top > 0.5 && <rect x={0} y={0} width={W} height={top} fill="#000" />}
		<rect x={0} y={bot} width={W} height={H - bot} fill="#000" />
	</svg>; };

export const D1V: React.FC<{t: number}> = ({t}) => { const d = Math.max(0, t - T1), zm = zoomAt(d), g = swordAt(d), {tf} = figTf(d);
	const A = 14 * Math.exp(-d / 0.14) * cl((0.6 - d) / 0.1), shx = A * Math.sin(d * 97 + 0.7) * Math.cos(d * 31), shy = A * 0.7 * Math.sin(d * 83 + 2.1);
	const shake = {position: 'absolute' as const, inset: 0, transform: `translate(${f1(shx)}px,${f1(shy)}px) scale(1.03)`, transformOrigin: '50% 50%'};
	const open = eout((d - 0.03) / 0.12), sh = toScr([-196, 96], d);
	return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#0A0605'}}>
		<div style={shake}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<defs>
					<linearGradient id="dvcSky" x1="0" y1={-700} x2="0" y2={HZ + 40} gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#0A0505" /><stop offset="0.3" stopColor="#2A100C" /><stop offset="0.55" stopColor="#6A2814" /><stop offset="0.8" stopColor="#C85A22" /><stop offset="1" stopColor="#FFA04A" /></linearGradient>
					<radialGradient id="dvcHot"><stop offset="0" stopColor="#FFB04E" stopOpacity="0.55" /><stop offset="0.4" stopColor="#EA6028" stopOpacity="0.22" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
					<radialGradient id="dvcHg"><stop offset="0" stopColor="#FFD08A" stopOpacity="0.7" /><stop offset="0.5" stopColor="#EA6028" stopOpacity="0.25" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
					<linearGradient id="dvcGd" x1="0" y1={HZ} x2="0" y2={H + 300} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4A2012" /><stop offset="0.1" stopColor="#24100A" /><stop offset="1" stopColor="#0A0605" /></linearGradient>
					<radialGradient id="dvcGl"><stop offset="0" stopColor="#FFD08A" stopOpacity="0.75" /><stop offset="0.3" stopColor="#FF9A40" stopOpacity="0.3" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
					<radialGradient id="dvcBack" cx={1010} cy={330} r={700} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFC060" stopOpacity="0.62" /><stop offset="0.45" stopColor="#EA6028" stopOpacity="0.2" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
					<radialGradient id="dvcVig" cx="0.52" cy="0.42" r="0.8"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
					<filter id="dvcSb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={26} /></filter>
					<filter id="dvcNb1" x="-40%" y="-20%" width="180%" height="140%"><feGaussianBlur stdDeviation="9 3" /></filter>
					<filter id="dvcNb2" x="-40%" y="-20%" width="180%" height="140%"><feGaussianBlur stdDeviation="18 5" /></filter>
					<RimF id="dvcRm" lx={1} ly={-0.3} k={2.2} c={FIRE.mid} o={0.95} lx2={-1} ly2={-0.3} k2={1.8} c2={FIRE.out} o2={0.8} blur={0.8} />
					<RimF id="dvcRq" lx={0} ly={-1} k={3} c={FIRE.mid} o={0.9} />
					<RimF id="dvcHero" lx={1} ly={-0.4} k={5} c={FIRE.mid} o={0.95} lx2={-1} ly2={-0.25} k2={4} c2={ACC} o2={0.9} blur={1} />
				</defs>
				<World t={t} d={d} zm={zm} />
				<g transform={plz(zm, 0.8)}><rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#dvcBack)" /></g>
				<g filter="url(#dvcHero)"><g transform={plz(zm, 1)}>
					<g transform={tf}><Figure t={t} d={d} /></g>
					<SwordArm sh={sh} g={g} />
				</g></g>
				<NearMen t={t} d={d} zm={zm} />
				<rect width={W} height={H} fill="url(#dvcVig)" />
			</svg>
		</div>
		{open > 0.001 && <div style={{opacity: open}}><Embers d={d} o={1} /></div>}
		<Letterbox d={d} />
		<div style={shake}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}><g transform={plz(zm, 1)}><Sword d={d} t={t} /></g></svg></div>
	</div>; };
