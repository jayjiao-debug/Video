import React from 'react';
import {W, H} from '../qq50/kit50';
import {Cao, Head, RimF, P, f1, rnd} from './cao54b';
import {Npc, LampStand, HEAD, ZE, NECK} from './npc54b';
import {NpcWalk, Flame} from './rig54b';
import {SIL, ACC, COOL, PAL, Rider, Banner, GateTower, Limb, limb} from './set54bs';
import {Kneeler, Mian, JX, npcTorsoT, sstep} from './fig54n';
/* ep54 full film · section C part 1, cards 14–17 (the groove comes back, the rise begins), look B 铜灯影 · 主角刻画. t = film time (s).
   Xu   = card 14, BAR 26–28 (52.45–56.43), 196 许, dusk: the emperor's carriage rolls to the lit gate of 许 (wheels turning, horses walking
          on planted hooves, the escort walking); 曹操 (42) bows at the roadside as it passes. Camera trucks right with a slow push.
   Xie  = card 15, BAR 28–30, the hall at 许 by lamplight: the boy emperor small on the dais, 曹操 standing below and beside it facing the
          court, the edict unrolled on the downbeat of bar 29; the court bows to the throne in a ripple; his lamp shadow towers over the
          throne. A slow push toward him.
   Yuan = card 16, BAR 30–32, 袁绍's hall at 邺: 沮授 bows and offers the scroll, 袁绍 looks, waves it off twice, turns his back on the
          downbeat of bar 31; 沮授 is left holding the bow, then droops. Backlit by a bronze lamp tree.
   Tun  = card 17, BAR 32–34, 许下 in warm-grey daylight (the film's first day scene): a real perspective crane from the granary yard (sacks
          piling up, a 囷 being filled) up over 屯田 fields that spread to the horizon, ox teams ploughing, the ploughed land growing.
   Overlay zones kept calm: subtitles x 150–1150 / y 90–300, stamp x 1200–1800 / y 30–200, counter x 150–460 / y 900–1010, seal 1720–1800 / 930–1010. */
const BAR = (n: number) => 0.654 + 1.99203 * n;
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>{children}</svg>;
const Blur: React.FC<{id: string; s: number}> = ({id, s}) => <filter id={id} x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation={s} /></filter>;
const at = (x: number, y: number, k: number, flip?: boolean) => `translate(${f1(x)},${f1(y)}) scale(${(flip ? -k : k).toFixed(4)},${k.toFixed(4)})`;
const cl01 = (v: number) => Math.max(0, Math.min(1, v));
const ss = sstep;
const lp = (a: P, b: P, u: number): P => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
const mix = (a: string, b: string, u: number) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
	return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * cl01(u)).toString(16).padStart(2, '0')).join(''); };
/** a 2.5D camera: pan (x, y) and zoom z at the hero plane (p = 1), about the focus (fx, fy); plane depth p scales both */
type Cam = {x: number; y: number; z: number; fx: number; fy: number};
const camT = (c: Cam, p: number) => { const s = 1 + (c.z - 1) * p; return `translate(${f1(c.fx - c.x * p)},${f1(c.fy - c.y * p)}) scale(${s.toFixed(5)}) translate(${-c.fx},${-c.fy})`; };
/** a solid cast-shadow filter: the figure's alpha flooded with one colour, softened */
const ShadowF: React.FC<{id: string; c: string; b: number}> = ({id, c, b}) => <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
	<feFlood floodColor={c} result="f" /><feComposite in="f" in2="SourceAlpha" operator="in" result="s" /><feGaussianBlur in="s" stdDeviation={b} /></filter>;

/* ======================= a quadruped walk on planted hooves (horse, ox) =======================
   Each leg has its own phase; a stance lasts D of the cycle, during which the hoof stays fixed in world space while the body moves on
   (in the body frame it slides back by exactly the body's travel). In the swing it lifts on an arc, the hoof flips, and it lands one
   stride S further on. Legs: pivot hidden in the body, two-bone IK (front knee forward, hind hock back), straight when stretched. */
type QL = {px: number; py: number; ph: number; fr: boolean; nx: number; L1: number; L2: number; lift: number; w: number[]};
const ikK = (Pv: P, F: P, L1: number, L2: number, dir: number): P => { const dx = F[0] - Pv[0], dy = F[1] - Pv[1], d = Math.hypot(dx, dy), R = L1 + L2;
	if (d >= R - 0.01) return [Pv[0] + dx * L1 / R, Pv[1] + dy * L1 / R];
	const th = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)))), a = th - dir * al;
	return [Pv[0] + L1 * Math.cos(a), Pv[1] + L1 * Math.sin(a)]; };
const rot = (v: P, deg: number): P => { const r = deg * Math.PI / 180; return [v[0] * Math.cos(r) - v[1] * Math.sin(r), v[0] * Math.sin(r) + v[1] * Math.cos(r)]; };
const QLegG: React.FC<{lg: QL; s: number; S: number; D: number; bob: number; fill?: string; hoofH?: number}> = ({lg, s, S, D, bob, fill, hoofH = 16}) => {
	const u = (((s + lg.ph) % 1) + 1) % 1; let gx: number, gy = 0, a = 0;
	if (u < D) gx = lg.nx + S * D / 2 - S * u;
	else { const w = (u - D) / (1 - D), e = w * w * (3 - 2 * w); gx = lg.nx - S * D / 2 + S * D * e; gy = -lg.lift * Math.sin(Math.PI * Math.pow(w, 0.75)); a = (lg.fr ? 78 : 52) * Math.sin(Math.PI * Math.pow(w, 0.85)); }
	const G: P = [gx, gy], fo = rot([-2.5, -hoofH], a), F: P = [G[0] + fo[0], G[1] + fo[1]], po = rot([0.5, -hoofH * 0.4], a), Pa: P = [G[0] + po[0], G[1] + po[1]];
	const Pv: P = [lg.px, lg.py + bob], K = ikK(Pv, F, lg.L1, lg.L2, lg.fr ? 1 : -1);
	return <g fill={fill}><Limb j={[Pv, lp(Pv, K, 0.45), K, F, Pa]} w={lg.w} />
		<path transform={`translate(${f1(G[0])},${f1(G[1])}) rotate(${f1(a)})`} d={`M-5,${-hoofH * 0.5} L4.5,${-hoofH * 0.5} L7.5,0 L-5.5,0 Z`} /></g>; };

/* the horse (the kit's Han horse body, cm, facing +x, hooves at 0), walking: s = cycles walked; children ride the body */
const HBODY = 'M38,-142 C22,-135 2,-131 -18,-132 C-36,-133 -52,-140 -66,-135 C-74,-132 -80,-124 -81,-112 C-82,-100 -76,-90 -66,-86 L-48,-82 C-30,-80 -10,-79 10,-80 C26,-80 40,-79 52,-82 C62,-86 70,-95 72,-106 C74,-116 79,-130 88,-145 C94,-154 99,-159 103,-162 C109,-158 117,-149 123,-139 C126,-135 130,-131 134,-132 C138,-134 139,-139 136,-145 C129,-158 119,-172 109,-184 C105,-188 101,-191 96,-191 C84,-185 66,-167 52,-153 C46,-148 42,-145 38,-142 Z';
const HLEG = (px: number, py: number, ph: number, fr: boolean, nx: number): QL => fr ? {px, py, ph, fr, nx, L1: 70, L2: 46.5, lift: 22, w: [11, 8.5, 5.8, 4.6, 3.8]}
	: {px, py, ph, fr, nx, L1: 64, L2: 44.5, lift: 14, w: [16, 11, 6.2, 4.6, 3.8]};
const HorseW: React.FC<{s: number; S?: number; harness?: boolean; farFill?: string; children?: React.ReactNode}> = ({s, S = 130, harness, farFill = '#2A1E18', children}) => {
	const D = 0.6, bob = 1.2 * Math.cos(4 * Math.PI * s), nod = 0.7 * Math.sin(4 * Math.PI * s + 1.1), sw = Math.sin(2 * Math.PI * s * 0.5 + 0.4);
	return <g>
		<QLegG lg={HLEG(46, -132, 0.25, true, 52)} s={s} S={S} D={D} bob={bob} fill={farFill} />
		<QLegG lg={HLEG(-46, -120, 0.5, false, -54)} s={s} S={S} D={D} bob={bob} fill={farFill} />
		<g transform={`translate(0,${f1(bob)})`}>
			<g transform={`rotate(${f1(nod)} 40 -120)`}>
				<path d={HBODY} />
				<path d="M93,-188 L90,-203 L98,-191 Z M98,-189 L99,-201 L103,-190 Z" />
				<path d="M100,-190 C106,-188 110,-184 111,-179 C106,-182 102,-184 98,-185 Z" />
				<path d="M96,-191 C84,-186 66,-169 50,-155 L46,-160 L48,-165 L44,-163 C58,-176 78,-192 96,-196 Z" />
				{harness && <g>
					<path d="M44,-150 L50,-166 L56,-152 L60,-120 L56,-119 L52,-146 L48,-146 L44,-118 L40,-120 Z" />
					<path d="M54,-130 C66,-124 72,-110 72,-100" fill="none" strokeWidth={2.4} stroke="currentColor" />
					<path d="M101,-160 C110,-156 120,-146 128,-136 M106,-186 C112,-170 120,-156 128,-138" fill="none" strokeWidth={1.4} stroke="currentColor" />
				</g>}
			</g>
			<path d={`M-70,-132 C-82,-132 -88,-122 -90,-106 C${f1(-92 + sw * 2)},-86 ${f1(-88 + sw * 4)},-66 ${f1(-92 + sw * 6)},-48 C${f1(-86 + sw * 5)},-56 -80,-64 -79,-80 C-78,-96 -78,-112 -72,-124 Z`} />
			{children}
		</g>
		<QLegG lg={HLEG(-42, -120, 0, false, -50)} s={s} S={S} D={D} bob={bob} />
		<QLegG lg={HLEG(52, -132, 0.75, true, 58)} s={s} S={S} D={D} bob={bob} />
	</g>; };

/* the ox (a working ox of the Han reliefs: deep body, hump, dewlap, forward horns), cm, facing +x, hooves at 0 */
const OXB = 'M-104,-118 C-84,-128 -44,-130 -4,-128 C26,-128 46,-134 60,-142 C70,-146 78,-142 84,-134 C92,-124 100,-110 108,-96 C112,-88 116,-80 113,-74 C109,-69 101,-71 97,-77 C91,-86 84,-92 76,-95 C70,-88 66,-80 60,-72 C42,-66 10,-64 -20,-66 C-50,-68 -80,-70 -98,-78 C-108,-86 -112,-102 -110,-110 Z';
const OLEG = (px: number, py: number, ph: number, fr: boolean, nx: number): QL => fr ? {px, py, ph, fr, nx, L1: 46, L2: 38, lift: 14, w: [12, 9, 5.6, 4.6, 4]}
	: {px, py, ph, fr, nx, L1: 52, L2: 40, lift: 10, w: [15, 11, 6, 4.6, 4]};
const OxW: React.FC<{s: number; far?: string}> = ({s, far}) => { const S = 96, D = 0.62, bob = 1.4 * Math.cos(4 * Math.PI * s), nod = 1.4 * Math.sin(4 * Math.PI * s + 0.6);
	return <g>
		<QLegG lg={OLEG(54, -100, 0.25, true, 58)} s={s} S={S} D={D} bob={bob} fill={far} hoofH={13} />
		<QLegG lg={OLEG(-84, -104, 0.5, false, -90)} s={s} S={S} D={D} bob={bob} fill={far} hoofH={13} />
		<g transform={`translate(0,${f1(bob)})`}>
			<path d={OXB} />
			<g transform={`rotate(${f1(nod)} 70 -120)`}><path d="M80,-136 C82,-150 92,-156 100,-152 C92,-150 88,-144 88,-134 Z" /><path d="M64,-96 C66,-84 70,-76 68,-68 L60,-72 Z" /></g>
			<path d="M58,-148 L66,-148 L70,-138 L56,-136 Z" />
			<path d={`M-106,-112 C-114,-100 -116,-84 ${f1(-114 + Math.sin(s * 5) * 3)},-58 L${f1(-110 + Math.sin(s * 5) * 3)},-58 C-110,-84 -108,-100 -102,-110 Z`} />
		</g>
		<QLegG lg={OLEG(-80, -104, 0, false, -86)} s={s} S={S} D={D} bob={bob} hoofH={13} />
		<QLegG lg={OLEG(60, -100, 0.75, true, 64)} s={s} S={S} D={D} bob={bob} hoofH={13} />
	</g>; };

/* ---------- the imperial 轺车 with its wheel turning (rot in degrees) ---------- */
const WheelR: React.FC<{r?: number; n?: number; rot: number}> = ({r = 68, n = 22, rot: ang}) => <g transform={`translate(0,${-r}) rotate(${f1(ang)})`}>
	<circle cx={0} cy={0} r={r - 2.5} fill="none" strokeWidth={5} stroke="currentColor" />
	{Array.from({length: n}, (_, i) => { const a = (i / n) * Math.PI * 2 + 0.1; return <line key={i} x1={f1(Math.cos(a) * 8)} y1={f1(Math.sin(a) * 8)} x2={f1(Math.cos(a) * (r - 4))} y2={f1(Math.sin(a) * (r - 4))} strokeWidth={1.7} stroke="currentColor" />; })}
	<circle cx={0} cy={0} r={9.5} /><rect x={-16} y={-3} width={32} height={6} transform={`rotate(${f1(-ang)})`} /></g>;
const CarriageR: React.FC<{yx: number; rot: number; jig: number; farFill?: string}> = ({yx, rot: ang, jig, farFill = '#2A1E18'}) => <g>
	<g color={farFill} fill={farFill} transform="translate(12,-6)"><WheelR rot={ang} /></g>
	<path d={`M40,-84 C${yx * 0.45},-86 ${yx * 0.8},-104 ${yx},-148 L${yx + 3},-145 C${yx * 0.82 + 3},-100 ${yx * 0.46},-80 40,-78 Z`} />
	<path d={`M40,-86 C${yx * 0.45},-90 ${yx * 0.8},-108 ${yx + 10},-152 L${yx + 12},-150 C${yx * 0.82 + 6},-104 ${yx * 0.46},-84 40,-82 Z`} fill={farFill} />
	<g transform={`translate(0,${f1(jig)})`}>
		<path d="M-52,-74 L54,-74 L54,-112 L48,-112 L48,-80 L-46,-80 L-46,-108 L-52,-108 Z" />
		<path d="M-54,-82 L-14,-82 L-10,-100 L-58,-100 Z" />
		{[-36, -22, -8, 6, 20, 34].map((x) => <rect key={x} x={x} y={-108} width={2.2} height={28} />)}
		<rect x={-52} y={-112} width={106} height={4} />
		<path d="M48,-112 L54,-112 L56,-124 L50,-124 Z" />
		<path d="M-30,-104 C-32,-124 -28,-142 -22,-150 C-18,-154 -8,-154 -4,-150 C2,-140 4,-122 4,-104 Z" />
		<path d="M-4,-140 C4,-136 10,-128 12,-120 L8,-118 C4,-126 -2,-132 -8,-134 Z" /><circle cx={11} cy={-119} r={3.2} />
		<path d="M-19,-154 L-9,-154 L-8,-159 L-19,-159 Z" />
		<path d="M-22,-170 C-22,-177 -17,-180 -13,-180 C-8,-180 -5,-177 -5,-173 L-4,-169 C-4,-165 -6,-161 -9,-160 L-18,-159 C-21,-162 -22,-166 -22,-170 Z" />
		<path d="M-23,-171 L-20,-196 C-14,-200 -6,-198 -2,-190 L-4,-186 L-6,-174 Z" /><path d="M-24,-172 L-4,-175 L-4,-171 L-24,-168 Z" />
		<path d="M26,-104 C24,-120 26,-134 32,-142 C36,-146 44,-146 46,-140 C48,-130 48,-116 46,-104 Z" />
		<path d="M34,-160 C34,-166 38,-169 42,-169 C46,-169 48,-166 48,-162 L49,-158 C49,-155 47,-152 44,-151 L37,-150 C35,-153 34,-156 34,-160 Z" />
		<path d="M33,-161 C33,-168 37,-172 43,-172 L48,-171 C49,-168 49,-166 48,-164 C44,-166 39,-166 35,-162 Z" />
		<path d={limb([[40, -138], [52, -126], [62, -128]], [3.6, 3, 2.6])} />
		<path d={`M62,-128 C${yx * 0.6 + 40},-150 ${yx + 40},-160 ${yx + 84},-138`} fill="none" strokeWidth={1.2} stroke="currentColor" />
		<rect x={-12.5} y={-262} width={3} height={160} />
		<g transform={`rotate(${f1(jig * 0.6)} -11 -262)`}>
			<path d="M-118,-232 C-80,-262 50,-268 96,-236 C100,-233 102,-230 100,-228 C60,-240 -60,-242 -116,-228 C-120,-229 -120,-231 -118,-232 Z" />
			<path d="M-16,-266 C-14,-272 -8,-272 -6,-266 Z" />
			{Array.from({length: 14}, (_, i) => { const x = -114 + i * 16, y = -229 - Math.sin((i / 13) * Math.PI) * 6, sw = jig * 1.6 * Math.sin(i * 1.3); return <path key={i} d={`M${x},${f1(y)} L${f1(x - 1 + sw)},${f1(y + 9)} L${f1(x + 2 + sw)},${f1(y + 9)} Z`} />; })}
		</g>
	</g>
</g>;

/* ================= card 14 · 196 许 · dusk: the emperor comes to 许 ================= */
export const Xu: React.FC<{t: number}> = ({t}) => {
	const tA = BAR(26), u = t - tA, U = cl01(u / 3.98);
	const cam: Cam = {x: 75 * u, y: 0, z: 1 + 0.045 * ss(0, 1, U), fx: 1150, fy: 760};
	const T = (p: number) => camT(cam, p);
	const GY = 845, k = 1.15, v = 140, AX = 760 + v * u;
	const cyc = (ph: number) => (v * u) / (k * 130) + ph;
	const wrot = ((v * u) / k / 68) * 180 / Math.PI, jig = 0.8 * Math.sin(wrot * Math.PI / 180 * 5.5);
	const br = 1 + 0.04 * Math.sin(t * 2.3) + 0.02 * Math.sin(t * 5.1);
	/* 曹操's bow: upright and waiting, then down as the horses come level, held deep while the carriage passes */
	const bow = 3 + 27 * ss(53.4, 54.6, t) + 1.4 * Math.sin((t - 54.6) * 1.6) * ss(54.6, 55.4, t);
	const crenel = Array.from({length: 62}, (_, i) => 962 + i * 26), courses = Array.from({length: 17}, (_, i) => 578 + i * 13.5);
	const pass = (cx: number, w: number, h: number) => <g key={cx}>
		<rect x={cx - w / 2 - 8} y={800 - h - 10} width={w + 16} height={h + 10} fill="#1C1511" />
		<rect x={cx - w / 2} y={800 - h} width={w} height={h} fill="url(#xupsg)" opacity={br} />
		{[0.14, 0.32, 0.68, 0.86].map((q) => <rect key={q} x={cx - w / 2 + w * q - 2} y={800 - h} width={4} height={h} fill="#3A2A1E" opacity={0.5} />)}
		<rect x={cx - w / 2 - 8} y={800 - h - 10} width={w + 16} height={7} fill="#2A1E16" /></g>;
	const caoArm = {sh: [8, 84] as P, el: [24, 200] as P, hd: [92, 222] as P};
	const NL = 66, NF = 1.845;
	const walkers: {x: number; kind: 'ji' | 'plain'; t0: number; ban?: boolean}[] = [
		{x: 120, kind: 'plain', t0: 0.21, ban: true}, {x: 230, kind: 'plain', t0: 0.52, ban: true},
		{x: 548, kind: 'ji', t0: 0.1}, {x: 606, kind: 'ji', t0: 0.37}, {x: 1236, kind: 'ji', t0: 0.05}, {x: 1300, kind: 'ji', t0: 0.31}];
	/* dust kicked up behind the wheel and the hooves: puffs born on a clock, left in the world, growing and fading */
	const puffs: React.ReactNode[] = [];
	for (let i = 0; i < 18; i++) { const tb = -1.6 + i * 0.3, age = u - tb; if (age < 0 || age > 1.8) continue;
		const src = [760 + v * tb - 30, 760 + v * tb + 240, 400 + v * tb - 40][i % 3], o = 0.22 * Math.sin(Math.PI * age / 1.8);
		puffs.push(<ellipse key={i} cx={f1(src - 30 * age)} cy={f1(GY - 6 - 10 * age)} rx={f1(30 + 50 * age)} ry={f1(9 + 10 * age)} fill="#CDB892" opacity={o} />); }
	return <Svg>
		<defs>
			<linearGradient id="xusky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1E2C33" /><stop offset="0.3" stopColor="#33454A" /><stop offset="0.52" stopColor="#6A7268" /><stop offset="0.64" stopColor="#B5AE94" /><stop offset="0.7" stopColor="#D9CDA8" /></linearGradient>
			<radialGradient id="xusun" cx="250" cy="662" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFF4DC" stopOpacity="0.95" /><stop offset="0.08" stopColor="#F6E4BE" stopOpacity="0.6" /><stop offset="0.35" stopColor="#E4CFA4" stopOpacity="0.22" /><stop offset="1" stopColor="#E4CFA4" stopOpacity="0" /></radialGradient>
			<linearGradient id="xuwall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6A5A48" /><stop offset="0.18" stopColor="#4E4236" /><stop offset="1" stopColor="#3A3029" /></linearGradient>
			<linearGradient id="xupsg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6E5840" /><stop offset="0.55" stopColor="#D2B48A" /><stop offset="1" stopColor="#F3DDB4" /></linearGradient>
			<radialGradient id="xugate" cx="1650" cy="760" r="420" gradientUnits="userSpaceOnUse" gradientTransform="translate(1650 760) scale(1 0.5) translate(-1650 -760)"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.4" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient>
			<linearGradient id="xufld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7C7A66" /><stop offset="1" stopColor="#4A4438" /></linearGradient>
			<linearGradient id="xugnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A4034" /><stop offset="0.4" stopColor="#30281F" /><stop offset="1" stopColor="#17110D" /></linearGradient>
			<linearGradient id="xuroad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B8A27E" stopOpacity="0.55" /><stop offset="0.5" stopColor="#8A765A" stopOpacity="0.32" /><stop offset="1" stopColor="#6A5A46" stopOpacity="0.22" /></linearGradient>
			<linearGradient id="xuhaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C9BC9A" stopOpacity="0" /><stop offset="0.6" stopColor="#C9BC9A" stopOpacity="0.4" /><stop offset="1" stopColor="#C9BC9A" stopOpacity="0" /></linearGradient>
			<radialGradient id="xuvig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.62" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.42" /></radialGradient>
			<Blur id="xub3" s={3} /><Blur id="xub1" s={1.1} /><Blur id="xub6" s={6} /><Blur id="xub10" s={10} />
			<RimF id="xurim" lx={-1} ly={-0.25} k={2.6} c="#FFE0B0" o={0.95} lx2={0.2} ly2={-1} k2={1.6} c2={COOL} o2={0.4} />
			<RimF id="xurimG" lx={0.4} ly={-1} k={1.8} c="#FFE6C0" o={0.7} lx2={-1} ly2={-0.2} k2={1.6} c2="#FFE0B0" o2={0.8} />
			<RimF id="xuhero" lx={-1} ly={-0.3} k={5} c="#FFE6C0" o={0.95} lx2={1} ly2={-0.15} k2={4} c2={ACC} o2={0.95} blur={1} />
			<clipPath id="xulo"><rect x={-400} y={296} width={800} height={600} /></clipPath>
			<clipPath id="xuup"><rect x={-400} y={-400} width={800} height={708} /></clipPath>
		</defs>
		{/* P0 sky: the late sun low on the left, thin cloud bars lit from below, drifting */}
		<g transform={T(0.05)}>
			<rect x={-300} y={-200} width={W + 600} height={H + 400} fill="url(#xusky)" />
			<rect x={-300} y={-200} width={W + 600} height={H + 400} fill="url(#xusun)" />
			<g filter="url(#xub6)" opacity={0.6}>
				<ellipse cx={520 - u * 6} cy={520} rx={420} ry={8} fill="#8A8676" /><ellipse cx={980 - u * 4} cy={470} rx={360} ry={7} fill="#6E7268" /><ellipse cx={300 - u * 7} cy={585} rx={300} ry={6} fill="#E8D8B4" />
				<ellipse cx={1500 - u * 5} cy={420} rx={300} ry={7} fill="#56625E" />
			</g>
			<circle cx={250} cy={662} r={36} fill="#FFF6E2" />
		</g>
		{/* P1 far hills and a tree line, hazed */}
		<g transform={T(0.2)}>
			<g filter="url(#xub3)">
				<path d="M-300,700 C120,676 240,680 360,690 C480,666 640,668 780,684 C880,672 960,676 1100,690 L1100,760 L-300,760 Z" fill="#6E7266" />
				{Array.from({length: 26}, (_, i) => { const x = -150 + i * 44 + rnd(i, 7) * 20, h = 12 + rnd(i, 8) * 14; return <ellipse key={i} cx={x} cy={700 - h * 0.4} rx={10 + rnd(i, 9) * 8} ry={h} fill="#5A5E54" />; })}
			</g>
			<rect x={-300} y={704} width={1400} height={100} fill="url(#xufld)" />
			<rect x={-300} y={640} width={W + 900} height={130} fill="url(#xuhaze)" />
		</g>
		{/* P2 the rammed-earth wall of 许, the 门楼, the three passages lit within (the goal of the shot) */}
		<g transform={T(0.55)}>
			<g filter="url(#xub1)">
				<rect x={960} y={566} width={1700} height={236} fill="url(#xuwall)" />
				{courses.map((y, i) => <path key={i} d={`M960,${y} L2660,${y + (i % 2 ? 1 : -1)}`} stroke="#000" strokeOpacity={0.16} strokeWidth={1.4} />)}
				{courses.map((y, i) => <path key={'h' + i} d={`M960,${y + 2} L1300,${y + 2}`} stroke="#FFE8C0" strokeOpacity={0.07} strokeWidth={1} />)}
				<g fill="#2E261F">{crenel.map((x) => <rect key={x} x={x} y={550} width={16} height={17} />)}<rect x={956} y={562} width={1710} height={8} /></g>
				<rect x={950} y={540} width={86} height={262} fill="#5E5040" /><rect x={950} y={540} width={14} height={262} fill="#8C7A60" opacity={0.6} />
				{[0, 1, 2].map((i) => <rect key={i} x={952 + i * 30} y={526} width={18} height={16} fill="#3A3028" />)}
				{pass(1650, 96, 140)}{pass(1512, 68, 108)}{pass(1788, 68, 108)}
				<g transform="translate(1650,566) scale(0.92)"><GateTower win={0.4 * br} wall="#3A3029" dark="#221B16" roof="#262A2A" /></g>
			</g>
			<rect x={1200} y={600} width={900} height={300} fill="url(#xugate)" opacity={br} />
		</g>
		{/* P3 the ground and the road, the sun's long light along it */}
		<g transform={T(0.9)}>
			<rect x={-400} y={800} width={W + 1000} height={H} fill="url(#xugnd)" />
			<path d="M-400,812 L2600,806 L2600,872 L-400,890 Z" fill="url(#xuroad)" />
			<rect x={-400} y={790} width={W + 1000} height={60} fill="url(#xuhaze)" opacity={0.6} />
			<ellipse cx={1650} cy={842} rx={260} ry={22} fill="#F3DDB4" opacity={0.16 * br} />
			{/* the vanguard at the gate: three 戟 guards and the two lamps by the passage */}
			<g fill={SIL} color={SIL} filter="url(#xurimG)">
				{[1560, 1622, 1748].map((x, i) => <g key={x} transform={`rotate(${f1(0.8 * Math.sin(t * 0.9 + i * 2))} ${x} 832)`}><NpcStand x={x} y={832} k={0.98} flip={i === 2} /></g>)}
				<LampStand x={1592} y={834} k={0.86} /><LampStand x={1708} y={834} k={0.86} />
			</g>
			<Flame x={1592} y={834 - 117 * 0.86} s={0.8} t={t} seed={3} ivory glow={0.9} /><Flame x={1708} y={834 - 117 * 0.86} s={0.8} t={t} seed={9} ivory glow={0.9} />
		</g>
		{/* P4 the procession, all silhouettes, moving right to the gate */}
		<g transform={T(1)}>
			<g filter="url(#xub10)">{puffs}</g>
			{[AX, AX + 190, 400 + v * u, ...walkers.map((w) => w.x + v * u)].map((x, i) => <ellipse key={i} cx={x + 40} cy={GY + 3} rx={i < 2 ? 90 : 42} ry={6} fill="#0A0706" opacity={0.35} />)}
			<g fill={SIL} color={SIL} filter="url(#xurim)">
				{walkers.map((w, i) => { const x0 = w.x - k * (NL * NF * w.t0 - NL / 2);
					return <g key={i} transform={at(x0, GY, k)}><NpcWalk t={u} kind={w.kind} L={NL} f={NF} t0={w.t0} swing={w.ban ? 0.25 : 1} />
						{w.ban && <g transform={npcTorsoT(u, NL, NF, w.t0)}><g transform="translate(13,-30)"><Banner h={400} ch="汉" wave={6 * Math.sin(t * 2.1 + i * 1.7)} cloth="#4A1E1A" clothS="#2A110E" ink="#E8D2A6" /></g></g>}</g>; })}
				<g transform={at(400 + v * u, GY - 4, k)}><HorseW s={cyc(0.3)}><g transform="translate(18,2)"><Rider kind="ji" /></g></HorseW></g>
				<g transform={at(AX + 170 * k, GY - 8 * k, k)}><HorseW s={cyc(0.13)} harness farFill="#2A1E18" /></g>
				<g transform={at(AX, GY, k)}><CarriageR yx={210} rot={wrot} jig={jig} /></g>
				<g transform={at(AX + 160 * k, GY, k)}><HorseW s={cyc(0)} harness /></g>
			</g>
		</g>
		{/* P5 foreground: 曹操 (42, court robe, 武冠, short beard) at the roadside, bowing as the carriage comes level */}
		<g transform={T(1.25)}>
			<path d="M1560,1012 L1720,1012 L1900,1020 L1580,1022 Z" fill="#0A0706" opacity={0.5} filter="url(#xub3)" />
			<g filter="url(#xuhero)">
				<g transform={`translate(1640,${1012 - 750 * 0.6}) scale(-0.6,0.6)`}>
					<g clipPath="url(#xulo)"><Cao pal={PAL} id="xua" old armour={false} arm={caoArm} dao={false} /><path d="M-30,300 L-18,298 L-12,520 L-24,524 Z" fill="#5A4266" /><path d="M-30,300 L-26,300 L-21,522 L-24,524 Z" fill="#33243C" /></g>
					<g transform={`rotate(${f1(bow)} 0 300)`}><g clipPath="url(#xuup)"><Cao pal={PAL} id="xub" old armour={false} arm={caoArm} dao={false} /></g></g>
				</g>
			</g>
		</g>
		{/* P6 the near verge, out of focus */}
		<g transform={T(1.4)} filter="url(#xub6)" fill="#0C0806">
			<path d="M-300,1100 L-300,1030 C80,1020 200,1036 320,1048 C420,1056 520,1060 600,1100 Z" />
		</g>
		<rect width={W} height={H} fill="url(#xuvig)" />
	</Svg>; };
/** a standing 戟 guard in one tone (the kit Npc) */
const NpcStand: React.FC<{x: number; y: number; k: number; flip?: boolean}> = ({x, y, k, flip}) => <Npc x={x} y={y} k={k} flip={flip} kind="ji" />;

/* ================= card 15 · 挟天子以令诸侯 · the hall at 许 ================= */
const LAP = 'M-34,0 C-36,-14 -32,-30 -20,-37 C-2,-40 18,-33 30,-24 C37,-19 40,-10 39.6,0 Z';
const HEEL = 'M-36,-1 C-38,-6 -36,-10 -32,-10 L-26,-10 L-26,0 Z';
const TORSO = 'M-22,-34 C-25,-52 -22,-70 -13,-84 C-8,-90 0,-93 6,-91 C11,-81 14,-64 14,-48 L18,-32 Z';
const SLEEVE = 'M-6,-88 C6,-86 18,-78 28,-73 L32,-64 C30,-54 24,-46 14,-42 C4,-40 -6,-46 -10,-56 C-13,-68 -12,-82 -6,-88 Z';
/** the boy emperor seated upright (跽坐) in his 冕, hands in his sleeves; cm, facing +x */
const Emperor: React.FC<{br: number; sw: number}> = ({br, sw}) => <g>
	<path d={HEEL} /><path d={LAP} />
	<g transform={`translate(0,${f1(-br * 0.6)})`}>
		<path d={TORSO} /><path d={SLEEVE} />
		<g transform="translate(0,55)"><path d={NECK} /><path d={HEAD} /><path d={ZE} /><g transform={`rotate(${f1(sw)} 3 -178)`}><Mian /></g></g>
	</g>
</g>;
/** the edict (诏) in 曹操's hand, Cao units around the fist h: rolled (r = 0) or unrolled toward us (r = 1) */
const Edict: React.FC<{h: P; r: number; sway: number}> = ({h, r, sway}) => { const [x, y] = h;
	if (r < 0.02) return <g><rect x={x - 9} y={y - 24} width={18} height={92} rx={8} fill="#BFAE7A" /><rect x={x - 9} y={y - 24} width={7} height={92} rx={4} fill="#8E7E52" />
		<rect x={x - 11} y={y - 30} width={22} height={8} rx={3} fill="#2A1A12" /><rect x={x - 11} y={y + 64} width={22} height={8} rx={3} fill="#2A1A12" /></g>;
	const hh = 30 + 210 * r, w = 118, x0 = x - w / 2 + 6, y0 = y - 6, sk = sway * 6 * r;
	return <g>
		<path d={`M${x0},${y0} L${x0 + w},${y0} L${f1(x0 + w + sk)},${f1(y0 + hh)} L${f1(x0 + sk)},${f1(y0 + hh)} Z`} fill="#D9C68C" />
		<path d={`M${x0},${y0} L${x0 + 22},${y0} L${f1(x0 + 22 + sk)},${f1(y0 + hh)} L${f1(x0 + sk)},${f1(y0 + hh)} Z`} fill="#A8955E" opacity={0.7} />
		<path d={`M${x0 + w - 14},${y0} L${x0 + w},${y0} L${f1(x0 + w + sk)},${f1(y0 + hh)} L${f1(x0 + w - 14 + sk)},${f1(y0 + hh)} Z`} fill="#F2E6C0" opacity={0.6} />
		{Array.from({length: 6}, (_, i) => { const cx = x0 + 18 + i * 17; return <g key={i}>{Array.from({length: Math.max(0, Math.floor((hh - 40) / 22))}, (_, j) => <rect key={j} x={f1(cx + sk * (j * 22 + 20) / hh - 3)} y={y0 + 18 + j * 22} width={6 + (rnd(i * 9 + j, 4) > 0.6 ? 3 : 0)} height={13} rx={2} fill="#3A2A1A" opacity={0.75} />)}</g>; })}
		<rect x={x0 - 8} y={y0 - 8} width={w + 16} height={11} rx={4} fill="#2A1A12" /><rect x={x0 - 10} y={y0 - 9} width={6} height={13} rx={2} fill="#C09A52" /><rect x={x0 + w + 4} y={y0 - 9} width={6} height={13} rx={2} fill="#C09A52" />
		<rect x={f1(x0 - 4 + sk)} y={f1(y0 + hh - 3)} width={w + 8} height={10} rx={4} fill="#2A1A12" />
	</g>; };
const ROW1 = Array.from({length: 8}, (_, i) => ({x: 110 + i * 98 + (rnd(i, 51) - 0.5) * 16, bow: 24 + rnd(i, 52) * 8, hb: 10 + rnd(i, 53) * 10, i}));
const ROW2 = Array.from({length: 7}, (_, i) => ({x: 40 + i * 132 + (rnd(i, 54) - 0.5) * 18, bow: 22 + rnd(i, 55) * 10, hb: 12 + rnd(i, 56) * 8, i}));
const ROW3 = [{x: -40, bow: 26, hb: 14, i: 0}, {x: 560, bow: 22, hb: 18, i: 1}, {x: 800, bow: 25, hb: 15, i: 2}];
export const Xie: React.FC<{t: number}> = ({t}) => {
	const tA = BAR(28), u = t - tA, U = cl01(u / 3.98);
	const S = 0.68, CX = 1226, CY = 962;
	const cam: Cam = {x: -36 * U, y: -12 * U, z: 1 + 0.15 * (0.25 * U + 0.75 * ss(0, 1, U)), fx: 1190, fy: 520};
	const T = (p: number) => camT(cam, p);
	/* the edict comes up into the light on the downbeat of bar 29, unrolls toward the court; his chin lifts */
	const B29 = BAR(29), rz = ss(B29 - 0.32, B29 + 0.12, t), ur = ss(B29 - 0.05, B29 + 0.5, t), sway = Math.sin((t - B29) * 3.1) * Math.exp(-Math.max(0, t - B29) * 1.4) * ur;
	const arm = {sh: [8, 84] as P, el: lp([24, 204], [74, 168], rz), hd: lp([46, 300], [150, 150], rz)};
	const tilt = 4 - 7 * rz + 0.8 * Math.sin(t * 1.3);
	/* the court bows lower in a wave that runs back from the throne, just after the edict opens */
	const wave = (x: number) => 9 * ss(B29 + 0.1 + (1000 - x) * 0.0007, B29 + 0.65 + (1000 - x) * 0.0007, t);
	const LX = 968, LB = 896, LK = 2.3, flame: P = [LX, LB - 117 * LK];
	const fl = 1 + 0.05 * Math.sin(t * 7.3) + 0.03 * Math.sin(t * 13.7);
	const SM = 2.25;
	const hero = (id: string) => <g transform={`translate(${CX},${f1(CY - 750 * S)}) scale(${-S},${S})`}>
		<g clipPath="url(#xibody)"><Cao pal={PAL} id={id} old armour={false} arm={arm} dao={false} /><path d="M-30,300 L-18,298 L-12,520 L-24,524 Z" fill="#5A4266" /><path d="M-30,300 L-26,300 L-21,522 L-24,524 Z" fill="#33243C" /></g>
		<g transform={`translate(0,49) rotate(${f1(tilt)} 0 -8) scale(0.88) translate(0,-40)`}><Head old pal={PAL} id={id + 'h'} /></g>
		<Edict h={arm.hd} r={ur} sway={sway} />
	</g>;
	return <Svg>
		<defs>
			<linearGradient id="xiwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#11171A" /><stop offset="0.6" stopColor="#1B2224" /><stop offset="1" stopColor="#232A2A" /></linearGradient>
			<radialGradient id="xilit" cx={flame[0]} cy={flame[1]} r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.38" /><stop offset="0.3" stopColor="#D9B98A" stopOpacity="0.16" /><stop offset="0.7" stopColor="#D9B98A" stopOpacity="0.04" /><stop offset="1" stopColor="#D9B98A" stopOpacity="0" /></radialGradient>
			<linearGradient id="xiscr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6E5A44" /><stop offset="0.5" stopColor="#4A3C30" /><stop offset="1" stopColor="#2A2420" /></linearGradient>
			<linearGradient id="xifloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A2D2B" /><stop offset="0.4" stopColor="#1C1F1E" /><stop offset="1" stopColor="#0E100F" /></linearGradient>
			<radialGradient id="xipool" cx={flame[0]} cy="900" r="620" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${flame[0]} 900) scale(1 0.32) translate(${-flame[0]} -900)`}><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.3" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient>
			<linearGradient id="xiwin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A4C50" /><stop offset="1" stopColor="#56686A" /></linearGradient>
			<radialGradient id="xivig" cx="0.55" cy="0.5" r="0.76"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
			<Blur id="xib2" s={2} /><Blur id="xib8" s={8} /><Blur id="xib16" s={16} /><Blur id="xib1" s={1} />
			<ShadowF id="xishd" c="#050606" b={3.5} />
			<RimF id="xirimK" lx={1} ly={-0.6} k={1.8} c="#F0D2A2" o={0.75} lx2={-0.4} ly2={-1} k2={1.2} c2="#8FA8A6" o2={0.3} />
			<RimF id="xirimE" lx={-1} ly={-0.4} k={1.6} c="#F0D2A2" o={0.8} lx2={0.4} ly2={-1} k2={1.4} c2="#B8CCC8" o2={0.4} />
			<RimF id="xihero" lx={-1} ly={-0.45} k={5} c="#FFE6C0" o={0.95} lx2={1} ly2={-0.1} k2={4} c2={ACC} o2={0.95} blur={1} />
			<clipPath id="xibody"><rect x={-400} y={52} width={900} height={800} /></clipPath>
			<clipPath id="xiwallC"><rect x={-200} y={-200} width={2400} height={898} /></clipPath>
		</defs>
		{/* P0 the back wall: beams and brackets, dark red pillars, a dim high window, the screen behind the throne (lit by the lamp) */}
		<g transform={T(0.6)}>
			<rect x={-200} y={-200} width={2400} height={900} fill="url(#xiwall)" />
			<rect x={240} y={196} width={300} height={120} fill="#0E1112" /><rect x={250} y={206} width={280} height={100} fill="url(#xiwin)" opacity={0.6} />
			{Array.from({length: 15}, (_, i) => <rect key={i} x={254 + i * 18.6} y={206} width={6} height={100} fill="#0E1112" />)}
			<rect x={-200} y={-200} width={2400} height={262} fill="#0E0B0A" />
			{Array.from({length: 26}, (_, i) => <g key={i} fill="#0F0C0B"><rect x={-60 + i * 86} y={62} width={34} height={20} /><rect x={-74 + i * 86} y={80} width={62} height={10} /></g>)}
			<rect x={-200} y={90} width={2400} height={14} fill="#16110F" />
			{[150, 760, 2000].map((x) => <g key={x}><rect x={x} y={100} width={56} height={600} fill="#2A1411" /><rect x={x} y={100} width={10} height={600} fill="#F3DDB4" opacity={x < 1000 ? 0.12 : 0.05} /><rect x={x - 6} y={684} width={68} height={16} fill="#1A1210" /></g>)}
			{/* the folding screen (屏风) behind the throne: four lacquered leaves with painted cloud scrolls */}
			<rect x={1440} y={330} width={480} height={330} fill="url(#xiscr)" />
			{[0, 1, 2, 3].map((i) => <g key={i}><rect x={1440 + i * 120} y={330} width={120} height={330} fill="none" stroke="#3A1612" strokeWidth={7} />
				<path d={`M${1470 + i * 120},${430} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12 M${1480 + i * 120},${560} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12`} fill="none" stroke="#8A4A30" strokeOpacity={0.45} strokeWidth={3} /></g>)}
			<rect x={1436} y={322} width={488} height={10} fill="#1C1210" /><rect x={1436} y={322} width={488} height={3} fill="#F3DDB4" opacity={0.18} />
			<rect x={-200} y={-200} width={2400} height={1000} fill="url(#xilit)" opacity={fl} />
			{/* his shadow, thrown by the lamp onto the wall and the screen: it stands taller than the throne */}
			<g clipPath="url(#xiwallC)" opacity={0.8}>
				<g transform={`translate(${flame[0]},${flame[1]}) scale(${SM}) translate(${-flame[0]},${-flame[1]})`} filter="url(#xishd)">{hero('xis')}</g>
			</g>
		</g>
		{/* P1 the dais with the boy emperor on his 榻, two guards at its ends */}
		<g transform={T(0.78)}>
			<path d="M1250,640 L2200,640 L2200,700 L1210,700 Z" fill="#2A2522" />
			<rect x={1210} y={700} width={990} height={86} fill="#1A1310" /><rect x={1210} y={700} width={990} height={7} fill="#4A1C16" />
			{Array.from({length: 7}, (_, i) => <path key={i} d={`M${1250 + i * 130},${748} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12`} fill="none" stroke="#6A3A2A" strokeOpacity={0.4} strokeWidth={3} />)}
			<path d="M1210,700 L2200,700" stroke="#F3DDB4" strokeOpacity={0.3} strokeWidth={2} />
			{[0, 1, 2].map((i) => <rect key={i} x={1120 + i * 30} y={786 - (i + 1) * 29} width={90 - i * 30} height={(i + 1) * 29} fill={i % 2 ? '#1E1714' : '#241B16'} />)}
			{[0, 1, 2].map((i) => <rect key={'e' + i} x={1120 + i * 30} y={786 - (i + 1) * 29} width={30} height={3} fill="#F3DDB4" opacity={0.3} />)}
			<g fill="#1C1612"><rect x={1530} y={640} width={250} height={20} /><rect x={1536} y={660} width={12} height={20} /><rect x={1762} y={660} width={12} height={20} /></g>
			<path d="M1530,640 L1780,640" stroke="#F3DDB4" strokeOpacity={0.3} strokeWidth={2} />
			<g fill="#120C0A" color="#120C0A" filter="url(#xirimE)">
				<g transform={at(1652, 642, 1.38, true)}><Emperor br={Math.sin(t * 1.9)} sw={0.6 * Math.sin(t * 1.4)} /></g>
			</g>
		</g>
		{/* the lamp on its tall stand at the foot of the dais: the one key light of the hall */}
		<g transform={T(0.88)}>
			<rect x={-200} y={786} width={2400} height={400} fill="url(#xifloor)" />
			{Array.from({length: 8}, (_, i) => <path key={i} d={`M-200,${f1(800 + i * i * 5 + i * 14)} L2200,${f1(800 + i * i * 5 + i * 14)}`} stroke="#000" strokeOpacity={0.22} strokeWidth={1.4} />)}
			<rect x={-200} y={780} width={2400} height={260} fill="url(#xipool)" opacity={fl} />
			<g fill="#140D0A"><LampStand x={LX} y={LB} k={LK} /></g>
			<Flame x={flame[0]} y={flame[1]} s={2.0} t={t} seed={21} ivory glow={1.3} />
		</g>
		{/* P2 the court kneeling in rows, bowed toward the throne */}
		<g transform={T(0.9)} fill="#1E1816" filter="url(#xirimK)">{ROW1.map((r) => <g key={r.i} transform={at(r.x, 822, 1.45)}><Kneeler bow={r.bow + wave(r.x) + 0.8 * Math.sin(t * 1.6 + r.i)} hb={r.hb + wave(r.x) * 0.5} /></g>)}</g>
		<g transform={T(0.95)} fill="#16100E" filter="url(#xirimK)">{ROW2.map((r) => <g key={r.i} transform={at(r.x, 914, 1.95)}><Kneeler bow={r.bow + wave(r.x) + 0.8 * Math.sin(t * 1.4 + r.i * 2)} hb={r.hb + wave(r.x) * 0.5} /></g>)}</g>
		{/* P3 曹操 (42) standing below and beside the throne, facing the court, the edict in his hand */}
		<g transform={T(1)}>
			<ellipse cx={CX + 40} cy={CY + 4} rx={120} ry={10} fill="#050505" opacity={0.6} />
			<path d={`M${CX - 20},${CY} L${CX + 70},${CY} L${CX + 360},${CY + 70} L${CX + 120},${CY + 74} Z`} fill="#050505" opacity={0.35} filter="url(#xib8)" />
			<g filter="url(#xihero)">{hero('xic')}</g>
		</g>
		<g transform={T(1.05)} fill={SIL} filter="url(#xirimK)">{ROW3.map((r) => <g key={r.i} transform={at(r.x, 1050, 2.6)}><Kneeler bow={r.bow + wave(r.x) + 0.8 * Math.sin(t * 1.2 + r.i)} hb={r.hb + wave(r.x) * 0.5} /></g>)}</g>
		{/* P4 the near pillar, out of focus */}
		<g transform={T(1.3)} filter="url(#xib16)" fill="#0A0706"><rect x={1830} y={-100} width={170} height={1300} /><path d="M1830,-100 C1790,0 1780,200 1800,420 L1830,420 Z" fill="#1E0C0A" /></g>
		<rect width={W} height={H} fill="url(#xivig)" />
	</Svg>; };

/* ================= card 16 · 袁绍没听 · 邺 ================= */
/** 袁绍: a big man in a rich long robe with a train, wide sleeves, 进贤冠 with a hairpin, beard, 绶 and jade pendants at the belt.
    cm, facing +x, soles 0. arm: the near arm pose (0 at rest at the belly, 1 raised to wave); wag: forearm flick (deg); back: hands
    behind the back (after the turn); head: tilt (deg, + down) */
const YuanFig: React.FC<{arm: number; wag: number; back: boolean; head: number; br: number; t: number}> = ({arm, wag, back, head, br, t}) => {
	const sh: P = [3, -137 - br];
	/* rest: hands folded at the belly; raised: the forearm up before his face, the hand flapping (wag) about the elbow;
	   back: the elbow jutting behind, the hand on the small of his back */
	const el: P = back ? [-34, -114] : lp([12, -108], [34, -124], arm), hd0: P = back ? [-14, -98] : lp([24, -96], [44, -160], arm);
	const fa = Math.atan2(hd0[1] - el[1], hd0[0] - el[0]) + wag * Math.PI / 180, fl = Math.hypot(hd0[0] - el[0], hd0[1] - el[1]), hd: P = [el[0] + fl * Math.cos(fa), el[1] + fl * Math.sin(fa)];
	const sw = Math.sin(t * 1.7) * 2;
	/* the wide sleeve: hangs from the forearm at rest; slides to the elbow and droops from it when the arm is up or back */
	const bag = back || arm > 0.5 ? `M${f1(el[0] - 7)},${f1(el[1] - 6)} L${f1(el[0] + 8)},${f1(el[1] - 4)} C${f1(el[0] + 10)},${f1(el[1] + 14)} ${f1(el[0] + 2)},${f1(el[1] + 30)} ${f1(el[0] - 8)},${f1(el[1] + 34)} C${f1(el[0] - 14)},${f1(el[1] + 20)} ${f1(el[0] - 12)},${f1(el[1] + 6)} ${f1(el[0] - 7)},${f1(el[1] - 6)} Z`
		: `M${f1(el[0] - 6)},${f1(el[1] - 5)} L${f1(hd[0] + 3)},${f1(hd[1] - 5)} L${f1(hd[0] + 5)},${f1(hd[1] + 6)} C${f1(hd[0] + 1)},${f1(hd[1] + 30)} ${f1((el[0] + hd[0]) / 2 - 10)},${f1(hd[1] + 40)} ${f1(el[0] - 10)},${f1(el[1] + 22)} Z`;
	return <g>
		{/* the far sleeve, hanging behind */}
		<path d={back ? 'M-24,-126 C-32,-116 -34,-102 -30,-90 C-24,-86 -18,-92 -18,-102 Z' : 'M-8,-132 C-15,-118 -18,-98 -13,-80 C-6,-75 4,-78 6,-88 C3,-102 1,-118 -2,-130 Z'} />
		{/* the robe: a broad back, a big belly under the belt, the skirt to the ground with a train; raised-toe shoes */}
		<path d={`M-7,${f1(-149 - br)} C-19,-148 -24,-140 -25,-126 C-26,-112 -23,-100 -22,-90 C-24,-64 -30,-34 -40,-6 C-52,-2 ${f1(-66 + sw)},0 ${f1(-82 + sw)},3 L${f1(-82 + sw)},6 L37,5 C35,-20 32,-42 30,-60 C${f1(35 + br * 0.4)},-70 ${f1(38 + br * 0.5)},-84 35,-100 C32,-118 24,-138 11,${f1(-149 - br)} Z`} />
		<path d="M29,0 L43,0 C48,-2 50,-7 48,-10 L44,-7 L29,-4 Z" />
		{/* the belt, the long 绶, a string of jade 佩 swinging a little */}
		<path d="M-23,-92 L37,-96 L38,-90 L-23,-86 Z" />
		<path d={`M6,-90 L10,-90 L${f1(14 + sw)},-30 L${f1(8 + sw)},-30 Z`} />
		<g transform={`rotate(${f1(sw * 1.5)} 22 -90)`}><rect x={21.4} y={-90} width={1.2} height={40} />{[-80, -68, -56].map((y) => <ellipse key={y} cx={22} cy={y} rx={4} ry={2.6} />)}<path d="M17,-50 L27,-50 L22,-44 Z" /></g>
		{/* head: neck, face, a full beard, the 进贤冠 with its long hairpin */}
		<g transform={`translate(0,${f1(-br)}) rotate(${f1(head)} 2 -150)`}>
			<path d={NECK} /><path d={HEAD} /><path d={ZE} />
			<path d="M3,-150 C8,-149 12,-146 13,-140 C14,-132 10,-124 4,-120 C-1,-124 -3,-132 -2,-140 C-1,-145 0,-148 3,-150 Z" />
			<path d="M8,-152.5 C11,-152 13,-150.5 13.6,-149 L9,-149.6 Z" />
			<g transform="translate(0,-168) scale(1.22) translate(0,168)"><path d={JX} /></g>
			<path d="M-15,-174 L19,-181.6 L19.4,-180 L-14.6,-172.4 Z" />
		</g>
		{/* the near arm and its sleeve */}
		<path d={bag} />
		<path d={limb([sh, el], [7.4, 6.4])} /><path d={limb([el, hd], [6.4, 4.4])} /><circle cx={el[0]} cy={el[1]} r={6.4} />
		{!back && <g transform={`translate(${f1(hd[0])},${f1(hd[1])}) rotate(${f1(fa * 180 / Math.PI)})`}><path d="M-2,-5 C4,-7 10,-6 13,-3 C14,0 12,3 8,4 L-2,5 Z" /></g>}
		{back && <circle cx={hd[0]} cy={hd[1]} r={4.6} />}
	</g>; };
/** 沮授: a lean official in court robe and 进贤冠, bowing at the waist (bow deg) with a bamboo-slip memorial in both hands (off 0..1 =
    held at the chest .. offered out; droop 0..1 = arms sinking after the refusal); head: tilt against the torso (deg, − = looks up) */
const JuShou: React.FC<{bow: number; off: number; droop: number; head: number}> = ({bow, off, droop, head}) => {
	const hd: P = lp(lp([14, -118], [34, -124], off), [18, -96], droop), el: P = lp(lp([6, -110], [16, -116], off), [6, -106], droop);
	const sa = -bow + 6 - droop * 60 + (1 - off) * 50;
	return <g>
		<path d="M-13,-100 C-15,-70 -18,-36 -21,-4 L19.5,-4 C17,-36 15,-70 13.4,-100 Z" />
		<path d="M-12,-6 L1,-6 L3,0 L-12,0 Z M1,-6 L16,-5.5 C19,-4 19,-1 17,0 L1,0 Z" />
		<g transform={`rotate(${f1(bow)} 0 -98)`}>
			<path d="M-4,-141 C-11,-140 -13.4,-135 -13.4,-126 C-13.4,-114 -12.6,-104 -13,-94 L13.4,-94 C14,-104 15,-114 14.4,-126 C13.8,-134 9.6,-140 5,-141 Z" />
			<path d="M-4,-142 L-18,-104 L-14,-100 L0,-130 Z" />
			<g transform={`rotate(${f1(head)} 0 -146)`}><path d={NECK} /><path d={HEAD} /><path d={ZE} /><path d={JX} /></g>
			<path d={limb([[2, -134], el], [5.4, 4.8])} /><path d={limb([el, hd], [4.8, 4])} /><circle cx={el[0]} cy={el[1]} r={4.8} />
			<path d={`M${f1(el[0] - 5)},${f1(el[1])} L${f1(hd[0])},${f1(hd[1] + 2)} C${f1(hd[0] - 2)},${f1(hd[1] + 22)} ${f1(el[0] - 8)},${f1(el[1] + 26)} ${f1(el[0] - 10)},${f1(el[1] + 10)} Z`} />
			<g transform={`translate(${f1(hd[0])},${f1(hd[1])}) rotate(${f1(sa)})`}><rect x={-4} y={-6} width={34} height={11} rx={4} /><rect x={-6} y={-7} width={4} height={13} rx={1.5} /><rect x={28} y={-7} width={4} height={13} rx={1.5} /></g>
			<circle cx={hd[0]} cy={hd[1]} r={4} />
		</g>
	</g>; };
/** a bronze lamp tree (连枝灯): a stem on a domed foot, three tiers of curling branches, a cup and a flame on each; base (x, y), k px/cm */
const LampTree: React.FC<{x: number; y: number; k: number; t: number}> = ({x, y, k, t}) => { const cups: P[] = [[0, -196], [-34, -160], [34, -160], [-46, -118], [46, -118], [-30, -84], [30, -84]];
	return <g>
		<g transform={at(x, y, k)} fill="#140D0A">
			<path d="M-26,0 C-24,-10 -12,-16 -3,-18 L-2,-190 L2,-190 L3,-18 C12,-16 24,-10 26,0 Z" />
			{cups.slice(1).map(([cx, cy], i) => <path key={i} d={`M0,${cy + 26} C${cx * 0.3},${cy + 30} ${cx * 0.9},${cy + 20} ${cx},${cy + 4}`} fill="none" stroke="#140D0A" strokeWidth={2.6} />)}
			{cups.map(([cx, cy], i) => <path key={'c' + i} d={`M${cx - 6},${cy} L${cx + 6},${cy} L${cx + 3},${cy + 5} L${cx - 3},${cy + 5} Z`} />)}
		</g>
		{cups.map(([cx, cy], i) => <Flame key={i} x={x + cx * k} y={y + cy * k} s={k * 0.55} t={t} seed={30 + i * 3} ivory glow={i === 0 ? 1.1 : 0.7} />)}
	</g>; };
/** a 博山炉 censer on a low stand with its smoke curling up on its own clock */
const Censer: React.FC<{x: number; y: number; k: number; t: number}> = ({x, y, k, t}) => <g>
	<g transform={at(x, y, k)} fill="#140D0A"><path d="M-16,0 L16,0 L10,-4 L3,-6 L3,-18 L10,-20 C14,-26 12,-34 6,-38 C4,-46 0,-50 0,-52 C0,-50 -4,-46 -6,-38 C-12,-34 -14,-26 -10,-20 L-3,-18 L-3,-6 L-10,-4 Z" /></g>
	<g filter="url(#yub6)">{Array.from({length: 9}, (_, i) => { const a0 = t * 0.22 + i / 9, a = a0 - Math.floor(a0), py = y - 52 * k - a * 300, px = x + Math.sin(a * 5 + Math.floor(a0) * 1.7 + i) * 18 * a + a * 30;
		return <ellipse key={i} cx={f1(px)} cy={f1(py)} rx={f1(6 + a * 26)} ry={f1(5 + a * 14)} fill="#8A9A98" opacity={0.28 * Math.sin(Math.PI * a)} />; })}</g>
</g>;
export const Yuan: React.FC<{t: number}> = ({t}) => {
	const tA = BAR(30), u = t - tA, U = cl01(u / 3.98), B31 = BAR(31);
	const cam: Cam = {x: 70 * U, y: 0, z: 1 + 0.09 * (0.3 * U + 0.7 * ss(0, 1, U)), fx: 1000, fy: 620};
	const T = (p: number) => camT(cam, p);
	/* the acting: 沮授 bows and offers (u 0–0.8); 袁绍 looks down at it (0.9–1.3), lifts his hand and flicks it away twice (1.3–1.9), turns his
	   back on the downbeat of bar 31 with his chin up; 沮授 is left holding the bow, then the memorial sinks (2.6–3.4) */
	const bow = 10 + 30 * ss(tA, tA + 0.75, t) - 16 * ss(B31 + 0.75, B31 + 1.55, t);
	const off = ss(tA + 0.15, tA + 0.8, t), droop = ss(B31 + 0.55, B31 + 1.4, t);
	const jh = -12 + 8 * ss(tA, tA + 0.6, t) - 14 * ss(B31 + 0.2, B31 + 0.6, t);
	const look = 14 * ss(tA + 0.85, tA + 1.1, t) * (1 - ss(tA + 1.35, tA + 1.6, t));
	const arm = ss(tA + 1.3, tA + 1.5, t) * (1 - ss(B31 - 0.12, B31 + 0.05, t));
	const wag = arm * 38 * Math.sin(Math.PI * 2 * cl01((t - tA - 1.45) / 0.44) * 2) * (t > tA + 1.45 && t < tA + 1.89 ? 1 : 0);
	const tu = ss(B31 - 0.1, B31 + 0.2, t), sx = -Math.cos(Math.PI * tu), back = tu > 0.5;
	const yhead = look - 8 * ss(tA + 1.3, tA + 1.6, t) * (back ? 0 : 1) + (back ? -9 + 0.8 * Math.sin(t * 1.3) : 0);
	const br = Math.sin(t * 1.9) * 0.8, YX = 1290, YY = 986, YK = 3.15;
	return <Svg>
		<defs>
			<linearGradient id="yuwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#12181B" /><stop offset="0.65" stopColor="#1C2426" /><stop offset="1" stopColor="#252B2A" /></linearGradient>
			<radialGradient id="yulit" cx="960" cy="470" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.42" /><stop offset="0.35" stopColor="#D2B286" stopOpacity="0.16" /><stop offset="1" stopColor="#D2B286" stopOpacity="0" /></radialGradient>
			<linearGradient id="yuscr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4A2620" /><stop offset="0.45" stopColor="#3A1E1A" /><stop offset="1" stopColor="#1E1210" /></linearGradient>
			<linearGradient id="yufloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A2A27" /><stop offset="0.45" stopColor="#1A1B19" /><stop offset="1" stopColor="#0D0E0D" /></linearGradient>
			<radialGradient id="yupool" cx="960" cy="880" r="560" gradientUnits="userSpaceOnUse" gradientTransform="translate(960 880) scale(1 0.3) translate(-960 -880)"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.32" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient>
			<radialGradient id="yuvig" cx="0.5" cy="0.52" r="0.76"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
			<Blur id="yub6" s={6} /><Blur id="yub16" s={16} /><Blur id="yub2" s={2} />
			<RimF id="yurimL" lx={1} ly={-0.5} k={2.6} c="#FFE2B4" o={0.95} lx2={-0.5} ly2={-1} k2={1.4} c2="#9FB8B6" o2={0.35} />
			<RimF id="yurimR" lx={-1} ly={-0.5} k={2.8} c="#FFE2B4" o={0.95} lx2={0.5} ly2={-1} k2={1.4} c2="#9FB8B6" o2={0.35} />
			<RimF id="yurimF" lx={0} ly={-1} k={1.6} c="#E8CFA2" o={0.6} />
		</defs>
		{/* P0 the hall of 邺: dark wall, beams, a grand painted screen, lacquered pillars, the 袁 standard */}
		<g transform={T(0.55)}>
			<rect x={-200} y={-200} width={2400} height={1000} fill="url(#yuwall)" />
			<rect x={-200} y={-200} width={2400} height={262} fill="#0E0B0A" />
			{Array.from({length: 26}, (_, i) => <g key={i} fill="#0F0C0B"><rect x={-40 + i * 86} y={62} width={34} height={20} /><rect x={-54 + i * 86} y={80} width={62} height={10} /></g>)}
			<rect x={-200} y={90} width={2400} height={14} fill="#16110F" />
			<path d={`M-200,104 L2200,104 L2200,126 ${Array.from({length: 31}, (_, i) => `Q${-160 + i * 80},${148 + (i % 2) * 4} ${-120 + i * 80},126`).join(' ')} L-200,126 Z`} fill="#321612" />
			<rect x={560} y={300} width={860} height={440} fill="url(#yuscr)" />
			{[0, 1, 2, 3, 4, 5].map((i) => <g key={i}><rect x={560 + i * 143.3} y={300} width={143.3} height={440} fill="none" stroke="#1A0C0A" strokeWidth={7} />
				<path d={`M${590 + i * 143.3},${390} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12 M${612 + i * 143.3},${520} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12 M${586 + i * 143.3},${640} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12`} fill="none" stroke="#B08848" strokeOpacity={0.35} strokeWidth={3} /></g>)}
			<rect x={556} y={292} width={868} height={10} fill="#1C1210" />
			{[200, 1700].map((x) => <g key={x}><rect x={x} y={100} width={62} height={640} fill="#3A1612" /><rect x={x + (x < 960 ? 52 : 0)} y={100} width={10} height={640} fill="#F3DDB4" opacity={0.12} /></g>)}
			{[[300, 1], [1580, -1]].map(([x, s], j) => { const sw2 = Math.sin(t * 0.8 + j) * 3; return <path key={x} d={`M${x},104 C${x + s * 30},200 ${x + s * 40},320 ${x + s * 30 + sw2},460 C${x + s * 20 + sw2},560 ${x + s * 34 + sw2},660 ${x + s * 44},740 L${x - s * 40},740 L${x - s * 40},104 Z`} fill="#2A120F" />; })}
			<rect x={-200} y={-200} width={2400} height={1000} fill="url(#yulit)" opacity={1 + 0.04 * Math.sin(t * 6.1)} />
			<g fill="#120C0A" filter="url(#yurimF)"><g transform={at(1820, 760, 1.15)}><Banner h={520} w={74} ch="袁" cloth="#3E2416" clothS="#26140C" ink="#D8BE8E" wave={3 * Math.sin(t * 1.3)} /></g></g>
		</g>
		{/* P1 the floor, the mats, the lamp tree between them (the key, behind) */}
		<g transform={T(0.8)}>
			<rect x={-200} y={740} width={2400} height={500} fill="url(#yufloor)" />
			{Array.from({length: 8}, (_, i) => <path key={i} d={`M-200,${f1(752 + i * i * 5 + i * 14)} L2200,${f1(752 + i * i * 5 + i * 14)}`} stroke="#000" strokeOpacity={0.22} strokeWidth={1.4} />)}
			<rect x={-200} y={740} width={2400} height={300} fill="url(#yupool)" />
			<LampTree x={968} y={846} k={2.15} t={t} />
		</g>
		{/* P2 the two men */}
		<g transform={T(1)}>
			<ellipse cx={660} cy={968} rx={110} ry={9} fill="#050505" opacity={0.55} /><ellipse cx={YX - 30} cy={YY + 2} rx={170} ry={11} fill="#050505" opacity={0.55} />
			<g fill="#130D0B" color="#130D0B" filter="url(#yurimL)"><g transform={at(650, 966, 2.95)}><JuShou bow={bow + 0.6 * Math.sin(t * 2.3)} off={off} droop={droop} head={jh} /></g></g>
			<g fill="#120C0A" color="#120C0A" filter="url(#yurimR)"><g transform={`translate(${YX},${YY}) scale(${f1(Math.sign(sx || 1) * Math.max(0.22, Math.abs(sx)) * YK)},${YK})`}>
				<YuanFig arm={arm} wag={wag} back={back} head={yhead} br={br} t={t} /></g></g>
			<Censer x={1640} y={1000} k={2.2} t={t} />
		</g>
		{/* P3 the near pillar edge, out of focus */}
		<g transform={T(1.3)} filter="url(#yub16)" fill="#0A0706"><rect x={-120} y={-100} width={190} height={1300} /></g>
		<rect width={W} height={H} fill="url(#yuvig)" />
	</Svg>; };

/* ================= card 17 · 屯田 · 许下 · day ================= */
/* A real perspective crane: ground points (X across, Z ahead, metres) project with focal F from a camera at height h (rising 2 → 14 m,
   exponentially, so near things never outrun 18 px/frame) while the horizon tilts up a little; things on the ground are billboards at their
   (X, Z). Fields are ground quads in perspective, so the patchwork spreads out toward the horizon as the camera rises. */
const DSIL = '#2A211A', HAZE = '#C4BCA9';
const fogOf = (Z: number) => (1 - Math.exp(-Z / 230)) * 0.9;
type Fld = {x0: number; x1: number; z0: number; z1: number; c: string; furrow?: boolean};
const FIELDS: Fld[] = (() => { const rows = [19, 24, 30, 38, 48, 61, 78, 100, 130, 170, 225, 300, 400, 560, 800, 1300, 2600], out: Fld[] = [];
	const pal = ['#8E8468', '#7C7558', '#9A8E6C', '#6E6A52', '#857E62', '#A39676', '#76705A'];
	rows.slice(0, -1).forEach((z0, r) => { const z1 = rows[r + 1]; let x = -900 - rnd(r, 3) * 40;
		while (x < 900) { const w = (10 + rnd(Math.round(x), r + 11) * 26) * (1 + z0 / 120); const i = Math.floor(rnd(Math.round(x * 7), r) * pal.length);
			out.push({x0: x, x1: x + w, z0, z1, c: pal[i], furrow: rnd(Math.round(x * 3), r + 5) < 0.45}); x += w; } });
	return out; })();
type Team = {x0: number; z: number; v: number; dir: 1 | -1; ph: number};
const TEAMS: Team[] = [{x0: -14, z: 34, v: 0.62, dir: 1, ph: 0}, {x0: 9, z: 44, v: 0.58, dir: -1, ph: 0.3}, {x0: -24, z: 58, v: 0.6, dir: 1, ph: 0.6}, {x0: 22, z: 72, v: 0.6, dir: 1, ph: 0.15},
	{x0: -6, z: 26, v: 0.6, dir: -1, ph: 0.45}, {x0: -40, z: 95, v: 0.6, dir: 1, ph: 0.8}, {x0: 34, z: 120, v: 0.6, dir: -1, ph: 0.2}];
const QunD: React.FC<{c: (s: string) => string; fill?: number}> = ({c}) => <g>
	<path d="M-170,0 L170,0 L160,-30 L-160,-30 Z" fill={c('#8C8068')} />
	<path d="M-150,-28 L-152,-262 C-60,-276 60,-276 152,-262 L150,-28 Z" fill={c('#B6AA8E')} />
	<path d="M30,-28 L36,-268 C90,-270 130,-266 152,-262 L150,-28 Z" fill={c('#8E8470')} />
	<path d="M-150,-28 L-152,-262 C-140,-263 -128,-265 -116,-266 L-112,-28 Z" fill={c('#CCC1A4')} />
	{[-200, -150, -100].map((y) => <path key={y} d={`M-151,${y} C-60,${y - 8} 60,${y - 8} 151,${y}`} fill="none" stroke={c('#6E6450')} strokeOpacity={0.45} strokeWidth={4} />)}
	<path d="M-196,-250 C-100,-280 100,-280 196,-250 L8,-452 L-8,-452 Z" fill={c('#9C8A62')} />
	<path d="M20,-268 C100,-272 160,-262 196,-250 L8,-452 Z" fill={c('#6E6046')} />
	{Array.from({length: 12}, (_, i) => <path key={i} d={`M${-170 + i * 30},${-252 - Math.sin(i / 11 * Math.PI) * 18} L${f1(-4 + i * 0.8)},-440`} stroke={c('#5E5240')} strokeOpacity={0.35} strokeWidth={3} />)}
	<path d="M-196,-250 C-100,-280 100,-280 196,-250" fill="none" stroke={c('#4E4434')} strokeWidth={6} />
	<rect x={-18} y={-476} width={36} height={30} rx={10} fill={c('#7A6A4C')} />
	<rect x={-30} y={-232} width={56} height={46} fill={c('#2E261E')} />
</g>;
const Ladder: React.FC<{h: number}> = ({h}) => <g><rect x={-22} y={-h} width={6} height={h} /><rect x={16} y={-h} width={6} height={h} />{Array.from({length: Math.floor(h / 34)}, (_, i) => <rect key={i} x={-20} y={-20 - i * 34} width={40} height={5} />)}</g>;
/** a filled hemp sack lying in a pile, cm-ish units (≈ 60 wide, 45 tall), lit from the left */
const SackL: React.FC<{c: (s: string) => string}> = ({c}) => <g>
	<path d="M-30,0 C-36,-14 -32,-34 -18,-40 C-6,-46 10,-46 22,-40 C34,-34 38,-16 32,0 Z" fill={c('#9C845E')} />
	<path d="M6,-44 C20,-42 32,-34 34,-18 C36,-10 34,-4 32,0 L10,0 C16,-14 14,-30 6,-44 Z" fill={c('#6E5A3E')} />
	<path d="M-26,-26 C-20,-36 -10,-40 0,-41" fill="none" stroke={c('#D2BA90')} strokeWidth={3} opacity={0.7} />
	<path d="M24,-40 C30,-46 36,-46 38,-42 L30,-36 Z" fill={c('#5A4830')} />
</g>;
export const Tun: React.FC<{t: number}> = ({t}) => {
	const tA = BAR(32), u = t - tA, U = cl01(u / 3.98), e = 0.12 * U + 0.88 * ss(0, 1, U);
	const F = 1400, h = 2.0 * Math.pow(7, e), HY = 362 - 112 * e, camX = 0.7 * e, CXs = 960;
	const pj = (X: number, Z: number): P => [CXs + F * (X - camX) / Z, HY + F * h / Z];
	const sc = (Z: number) => F / Z;
	const fc = (Z: number) => (s: string) => mix(s, HAZE, fogOf(Z));
	const quad = (x0: number, x1: number, z0: number, z1: number) => { const a = pj(x0, z0), b = pj(x1, z0), c = pj(x1, z1), d = pj(x0, z1); return `M${f1(a[0])},${f1(a[1])} L${f1(b[0])},${f1(b[1])} L${f1(c[0])},${f1(c[1])} L${f1(d[0])},${f1(d[1])} Z`; };
	const bb = (X: number, Z: number, k?: number) => { const [x, y] = pj(X, Z); return at(x, y, k ?? sc(Z) / 100); };
	/* ploughing: each team walks across its strip; the furrowed ground grows behind it */
	const teamX = (m: Team) => m.x0 + m.dir * m.v * u;
	const sackDrop = (i: number) => ss(64.6 + i * 0.55, 64.85 + i * 0.55, t);
	const PILE: [number, number, number][] = [[-0.9, 0, 0], [-0.3, 0, 0], [0.3, 0, 0], [0.9, 0, 0], [-0.6, 0.42, 0], [0, 0.42, 0], [0.6, 0.42, 0], [-0.3, 0.84, 0], [0.3, 0.84, 1], [1.5, 0, 1], [-1.5, 0, 1], [0, 1.26, 1]];
	const drops = [8, 9, 10, 11];
	const carriers = [{z: 6.4, x0: -2.4, t0: 0.1}, {z: 7.6, x0: -3.6, t0: 0.55}, {z: 11.0, x0: -4.6, t0: 0.3}];
	const sowers = [{x: 2, z: 30}, {x: -4, z: 47}, {x: 14, z: 54}];
	const pour = 0.5 + 0.5 * Math.sin(t * 1.4);
	return <Svg>
		<defs>
			<linearGradient id="tusky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6E6C64" /><stop offset="0.22" stopColor="#8C887C" /><stop offset="0.5" stopColor="#B4AE9E" /><stop offset="1" stopColor="#D6CEBA" /></linearGradient>
			<radialGradient id="tusun" cx="1760" cy="-60" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFF6E2" stopOpacity="0.7" /><stop offset="0.15" stopColor="#F2E6CC" stopOpacity="0.3" /><stop offset="1" stopColor="#F2E6CC" stopOpacity="0" /></radialGradient>
			<linearGradient id="tuhz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={HAZE} stopOpacity="0" /><stop offset="0.5" stopColor={HAZE} stopOpacity="0.75" /><stop offset="1" stopColor={HAZE} stopOpacity="0" /></linearGradient>
			<radialGradient id="tuvig" cx="0.5" cy="0.5" r="0.78"><stop offset="0.62" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#1A140E" stopOpacity="0.35" /></radialGradient>
			<pattern id="tufur" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(84)"><rect width="14" height="14" fill="#64593F" /><rect width="5" height="14" fill="#4E4532" /></pattern>
			<Blur id="tub2" s={2} /><Blur id="tub4" s={4} />
			<RimF id="turim" lx={0.7} ly={-1} k={2.2} c="#FFF3DC" o={0.7} />
			<RimF id="turimS" lx={0.7} ly={-1} k={1.2} c="#F6EAD2" o={0.5} />
		</defs>
		{/* the sky, a veiled sun high on the left (the key), soft cloud bars */}
		<rect width={W} height={H} fill="url(#tusky)" />
		<rect width={W} height={H} fill="url(#tusun)" />
				<g filter="url(#tub4)" opacity={0.5}>{[[600, 200, 380], [1300, 150, 420], [1700, 260, 300], [200, 300, 260]].map(([x, y, w], i) => <ellipse key={i} cx={x - u * (5 + i)} cy={y + (HY - 362) * 0.2} rx={w} ry={7} fill="#E6DECA" />)}</g>
		{/* far hills on the horizon, then the ground plane with its patchwork of fields */}
		<path d={`M-20,${f1(HY + 2)} C200,${f1(HY - 26)} 420,${f1(HY - 30)} 640,${f1(HY - 10)} C820,${f1(HY - 34)} 1040,${f1(HY - 40)} 1260,${f1(HY - 14)} C1460,${f1(HY - 28)} 1700,${f1(HY - 24)} 1940,${f1(HY - 4)} L1940,${f1(HY + 4)} L-20,${f1(HY + 4)} Z`} fill="#A8A494" filter="url(#tub2)" />
		<rect x={-20} y={HY} width={1960} height={H} fill={fc(400)('#8E8468')} />
		{FIELDS.map((q, i) => { const zc = (q.z0 + q.z1) / 2; return <path key={i} d={quad(q.x0, q.x1, q.z0, q.z1)} fill={fc(zc)(q.c)} />; })}
		{FIELDS.filter((q) => q.furrow && q.z0 < 400).map((q, i) => { const zc = (q.z0 + q.z1) / 2, n = Math.max(2, Math.round((q.x1 - q.x0) / (1.6 + zc / 40)));
			return <g key={'f' + i} stroke={fc(zc)('#5A503C')} strokeOpacity={0.5} strokeWidth={zc < 60 ? 1.6 : 1}>{Array.from({length: n}, (_, j) => { const x = q.x0 + (j + 0.5) * (q.x1 - q.x0) / n, a = pj(x, q.z0), b = pj(x, q.z1);
				return <line key={j} x1={f1(a[0])} y1={f1(a[1])} x2={f1(b[0])} y2={f1(b[1])} />; })}</g>; })}
		{/* the 阡陌: raised paths between the plots, catching the light */}
		{[19, 24, 30, 38, 48, 61, 78, 100, 130, 170, 225, 300].map((z) => { const a = pj(-900, z), b = pj(900, z); return <line key={z} x1={a[0]} y1={f1(a[1])} x2={b[0]} y2={f1(b[1])} stroke={fc(z)('#C2B490')} strokeOpacity={0.6} strokeWidth={Math.max(0.8, 60 / z)} />; })}
		{[-60, -18, 14, 48, 90].map((x) => { const a = pj(x, 19), b = pj(x, 2600); return <line key={x} x1={f1(a[0])} y1={f1(a[1])} x2={f1(b[0])} y2={f1(b[1])} stroke="#C2B490" strokeOpacity={0.45} strokeWidth={2} />; })}
		{/* the land being ploughed: dark furrowed strips growing behind each team */}
		{TEAMS.map((m, i) => { const xa = m.x0 - m.dir * 9, xb = teamX(m) - m.dir * 2.6; return <path key={i} d={quad(Math.min(xa, xb), Math.max(xa, xb), m.z - 1.4, m.z + 1.4)} fill={fc(m.z)('#5C523C')} />; })}
		{TEAMS.map((m, i) => <path key={'d' + i} d={quad(m.x0 - m.dir * 9 - 30 * m.dir, m.x0 - m.dir * 9, m.z - 1.4, m.z + 4.2)} fill={fc(m.z)('#5C523C')} opacity={0.85} />)}
		{/* far 屯 settlements: clusters of 囷 and houses, tree lines */}
		{[[-120, 260], [60, 330], [190, 220], [-40, 520], [-260, 420], [300, 600], [140, 900]].map(([X, Z], i) => <g key={i}>
			{[0, 1, 2].map((j) => <g key={j} transform={bb(X + j * 7 - 7, Z + j * 3, sc(Z + j * 3) / 100 * 0.9 * 0.01 * 100)}><QunD c={fc(Z)} /></g>)}
			<g transform={bb(X + 22, Z, sc(Z) / 100)} fill={fc(Z)('#6E6656')}><rect x={-400} y={-260} width={800} height={260} /><path d="M-460,-250 L460,-250 L380,-380 L-380,-380 Z" /></g></g>)}
		{[[160, -300, 300], [420, -260, 400], [700, -500, 600]].map(([Z, x0, x1], i) => <g key={'tr' + i} fill={fc(Z)('#62645A')}>{Array.from({length: 26}, (_, j) => { const X = x0 + (x1 - x0) * j / 25 + rnd(j, i) * 8, [x, y] = pj(X, Z), s = sc(Z), r = s * (1.4 + rnd(j, i + 3) * 0.8);
			return <g key={j}><rect x={f1(x - s * 0.15)} y={f1(y - s * 2)} width={f1(Math.max(0.6, s * 0.3))} height={f1(s * 2)} /><ellipse cx={f1(x)} cy={f1(y - s * 2.6)} rx={f1(r)} ry={f1(r * 0.8)} /><ellipse cx={f1(x + r * 0.6)} cy={f1(y - s * 2.2)} rx={f1(r * 0.7)} ry={f1(r * 0.6)} /></g>; })}</g>)}
		{/* the threshing yard before the granaries: packed earth, straw, cart ruts, contact shadows */}
		<path d={quad(-60, 60, 2.2, 19)} fill="#A69878" />
		<path d={quad(-60, 60, 2.2, 6)} fill="#8E8064" opacity={0.6} />
		{[[-1.6, -1.1], [1.9, 2.4]].map(([a0, a1], i) => <path key={i} d={quad(a0 - 0.1, a1 + 0.1, 2.2, 19)} fill="#8C7E62" opacity={0.35} />)}
		{Array.from({length: 70}, (_, i) => { const X = -14 + rnd(i, 91) * 26, Z = 3 + rnd(i, 92) * 15, [x, y] = pj(X, Z), s = sc(Z), a = (rnd(i, 93) - 0.5) * 1.4;
			return <line key={'st' + i} x1={f1(x)} y1={f1(y)} x2={f1(x + Math.cos(a) * s * 0.35)} y2={f1(y - Math.sin(a) * s * 0.08)} stroke={rnd(i, 94) < 0.5 ? '#C8B488' : '#7E6E50'} strokeWidth={Math.max(0.8, s * 0.012)} opacity={0.7} />; })}
		{[[12.5, 25, 1.8], [6.6, 20, 1.8], [3.6, 15, 1.8], [-0.6, 9.2, 1.7]].map(([X, Z, r], i) => <path key={'sh' + i} d={quad(X - r - 1.6, X + r - 0.6, Z, Z + 1.4)} fill="#5E5440" opacity={0.35} filter="url(#tub2)" />)}
		{/* the ox teams (二牛抬杠), the ploughman leaning on the handle */}
		<g filter="url(#turimS)">{TEAMS.slice().sort((a, b) => b.z - a.z).map((m, i) => { const X = teamX(m), k = sc(m.z) / 100, [x, y] = pj(X, m.z), s = (m.v * 100 * u) / 96 + m.ph, c = fc(m.z)(DSIL);
			const wL = 50, wF = m.v * 100 / wL;
			return <g key={i} transform={`translate(${f1(x)},${f1(y)}) scale(${(m.dir * k).toFixed(4)},${k.toFixed(4)})`} fill={c} color={c}>
				<g transform="translate(10,-4)" fill={fc(m.z + 30)(DSIL)}><OxW s={s + 0.31} /></g>
				<OxW s={s} />
				<path d="M60,-142 L70,-142 L68,-130 L58,-130 Z" />
				<path d="M62,-136 C20,-120 -60,-80 -150,-40 L-148,-36 C-58,-76 22,-116 64,-132 Z" />
				<path d="M-160,-2 L-128,-2 L-150,-40 L-156,-40 Z" /><path d="M-156,-40 L-196,-104 L-192,-106 L-150,-42 Z" />
				<g transform={`translate(${f1(-232 - (wL * wF * (u + i * 0.13) - wL / 2))},0)`}><NpcWalk t={u + i * 0.13} kind="plain" L={wL} f={wF} lean={16} swing={0.25} /></g>
			</g>; })}</g>
		{/* sowers broadcasting seed from a basket */}
		<g filter="url(#turimS)">{sowers.map((m, i) => { const k = sc(m.z) / 100, [x, y] = pj(m.x + 0.4 * u, m.z), c = fc(m.z)(DSIL);
			return <g key={i}><g transform={at(x, y, k)} fill={c}><g transform={`translate(${f1(-40 * (u + i * 0.4) + 20)},0)`}><NpcWalk t={u + i * 0.4} kind="plain" L={40} f={1.0} lean={8} swing={1.4} /></g>
				<path d="M-6,-104 C-10,-90 8,-86 16,-96 L14,-108 Z" /></g>
				{Array.from({length: 10}, (_, j) => { const a0 = t * 1.2 + j / 10 + i * 0.3, a = a0 - Math.floor(a0); return <circle key={j} cx={f1(x + k * (20 + 70 * a))} cy={f1(y - k * (110 - 140 * a * a + 40 * a))} r={Math.max(0.6, k * 1.6)} fill={c} opacity={0.8 * (1 - a)} />; })}</g>; })}</g>
		{/* the granary yard: three 囷 (one being filled from a ladder), the 曹 standard, a rack of 戟 (the farmers are soldiers), the sack pile */}
		<g filter="url(#turim)">
			<g transform={bb(12.5, 25)}><QunD c={fc(25)} /></g>
			<g transform={bb(6.6, 20)}><QunD c={fc(20)} /></g>
			<g transform={bb(3.6, 15)}><QunD c={fc(15)} /></g>
			{/* the man on the ladder at the hatch empties a sack into the 囷: the grain runs in */}
			<g transform={bb(4.2, 14.9)} fill={fc(15)(DSIL)} color={fc(15)(DSIL)}>
				<g transform="rotate(-8 0 0)"><Ladder h={250} /></g>
				<Npc x={6} y={-112} k={1} kind="hold" flip />
				<g transform={`translate(-30,-222) rotate(${f1(-40 - 12 * pour)})`}><path d="M0,-12 C-22,-16 -40,-8 -44,6 C-40,20 -22,24 0,16 Z" fill={fc(15)('#8A7454')} /><path d="M-20,-14 C-34,-10 -42,-2 -44,6 C-40,0 -32,-4 -20,-6 Z" fill={fc(15)('#5E4C34')} /></g>
				{Array.from({length: 12}, (_, j) => { const a0 = t * 2.6 + j / 12, q = a0 - Math.floor(a0); return <circle key={j} cx={f1(-68 + Math.sin(j * 2.1) * 2.5)} cy={f1(-214 + 26 * q)} r={1.8} fill="#D8C48E" opacity={0.9 * (1 - q)} />; })}
			</g>
			<g transform={bb(-1.0, 16.5)} fill={fc(16.5)(DSIL)}>
				<rect x={-60} y={-130} width={120} height={8} /><rect x={-58} y={-130} width={6} height={130} /><rect x={52} y={-130} width={6} height={130} />
				{[-40, -18, 6, 30].map((x, i) => <g key={x} transform={`rotate(${-6 + i * 3} ${x} 0)`}><rect x={x - 1.3} y={-250} width={2.6} height={250} /><path d={`M${x},-270 C${x + 1.5},-264 ${x + 2},-258 ${x + 1.3},-250 L${x - 1.3},-250 C${x - 2},-258 ${x - 1.5},-264 ${x},-270 Z`} /><path d={`M${x + 1},-246 L${x + 15},-243 L${x + 15},-238 L${x + 1},-241 Z`} /></g>)}
			</g>
			{/* the pile: sacks laid by unseen hands one after another (a short drop and a settle) */}
			{PILE.map(([px, py, late], i) => { const d = drops.indexOf(i), v = d < 0 ? 1 : sackDrop(d); if (v <= 0.001) return null; const Z = 9.2 + (late ? 0.2 : 0);
				const [x, y] = pj(-0.6 + px, Z), s = sc(Z);
				return <g key={i} transform={`translate(${f1(x)},${f1(y - (py + (1 - v) * 0.5) * s)}) scale(${f1(s / 100 * (0.9 + 0.1 * v))},${f1(s / 100 * (0.9 + 0.1 * v))})`} opacity={cl01(v * 3)}><SackL c={fc(Z)} /></g>; })}
			{/* carriers bringing sacks on their shoulders */}
			{carriers.map((m, i) => { const k = sc(m.z) / 100, L = 62, f = 1.6, x0 = m.x0 - (L * f * m.t0 - L / 2) / 100, [x, y] = pj(x0, m.z);
				return <g key={i} transform={at(x, y, k)} fill={fc(m.z)(DSIL)}><NpcWalk t={u} kind="plain" L={L} f={f} t0={m.t0} lean={7} swing={0.7} />
					<g transform={npcTorsoT(u, L, f, m.t0, 7)}><g transform="translate(-2,-150) rotate(-12)"><path d="M-26,0 C-30,-12 -24,-26 -10,-30 C4,-33 18,-30 26,-20 C32,-10 30,0 22,4 C8,8 -14,8 -26,0 Z" fill={fc(m.z)('#8C7652')} /><path d="M4,-31 C18,-30 30,-18 26,-2 L10,2 C16,-10 12,-24 4,-31 Z" fill={fc(m.z)('#5E4C34')} /></g>
						<path d="M6,-134 L-2,-158 L4,-160 L12,-136 Z" /></g></g>; })}
		</g>
		<rect x={-20} y={HY - 40} width={1960} height={110} fill="url(#tuhz)" opacity={0.85} />
		<rect width={W} height={H} fill="url(#tuvig)" />
	</Svg>; };
