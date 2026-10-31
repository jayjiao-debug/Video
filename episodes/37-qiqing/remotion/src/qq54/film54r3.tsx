import React from 'react';
import {Img} from 'remotion';
import {W, H, SANS, SERIF, SAFE_X, seg, land, lerp} from '../qq50/kit50';
import {B, thB} from '../qq50/styleB';
import {SEAL_SRC} from '../qq44/skin44';
import {Cao, Head, RimF, Lamel, Pal, P, f1, rnd} from './cao54b';
import {Npc} from './npc54b';
import {Flame, flick} from './rig54b';
import {ACC, PAL, Horse, limb} from './set54bs';
import {CaoSeated, CaoSeatedShadow} from './set54bs2';
import {Kneeler, JX, Smoke, sstep, cl01} from './fig54n';
import {BAR, END_T, FILM_LEN} from './demo54core';
/* ep54 full film · section E after the drop (fire orange allowed), cards 28–31 + the end card. t = FILM time (s).
   Jieshi  = card 28 (BAR 54–56, 207 碣石, dawn): 曹操 53 (grey beard, 札甲, cape) on the sea rocks, his old war horse beside him, the
     sun rising out of the sea; a wide crane-and-truck sweep that decelerates into a slow drift (keeps the drop's energy).
   Chibi   = card 29 (BAR 56–58, 208, night on the Yangtze): fire ships (brushwood boats, 牙旗) run into his moored fleet (close-packed,
     no chains); 曹操 54 on the north shore watches his own fleet burn: orange fire, reflections, embers; a mast falls on BAR 57.
   Wenwang = card 30 (BAR 58–60, 219, 魏王's hall): officials kneel and petition; 曹操 65 in 冕 and 玄衣 waves it away and lifts his eyes
     past them to 曹丕, standing apart by a lamp; the empty seat behind him.
   Death   = card 31 (BAR 60 → END_T): K8 brought to life: he writes, the brush slows, the lamp gutters; the lamp goes out exactly on
     the music's dead stop END_T = 124.088 (the first frame of End).
   End     = END_T → FILM_LEN: the same room in moonlight, dimmed to ~30 %, the J seal pressed in, title, question, pill, sources,
     fade to black on the film's last frame. Overlay-safe zones kept calm (subtitles x 150–1150 / y 90–300, stamp x 1200–1800 /
     y 30–200, counter x 150–460 / y 900–1010, seal x 1720–1800 / y 930–1010). */
const T54 = BAR(54), T56 = BAR(56), T57 = BAR(57), T58 = BAR(58), T60 = BAR(60);
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>{children}</svg>;
const Blur: React.FC<{id: string; s: number}> = ({id, s}) => <filter id={id} x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation={s} /></filter>;
const at = (x: number, y: number, k: number, flip?: boolean) => `translate(${f1(x)},${f1(y)}) scale(${(flip ? -k : k).toFixed(4)},${k.toFixed(4)})`;
/** the Cao rig placed by its soles (local y = 750) at (x, y), scale S */
const atC = (x: number, y: number, S: number, flip?: boolean) => `translate(${f1(x)},${f1(y - 750 * S)}) scale(${(flip ? -S : S).toFixed(4)},${S.toFixed(4)})`;
/** a 2.5D layer: pan (dx, dy) and zoom z about (fx, fy), scaled by the plane's depth p */
const lay = (dx: number, dy: number, z: number, p: number, fx = 960, fy = 600) => { const s = 1 + (z - 1) * p;
	return `translate(${f1(fx + dx * p)},${f1(fy + dy * p)}) scale(${s.toFixed(5)}) translate(${-fx},${-fy})`; };
const lp = (a: P, b: P, u: number): P => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
/** smooth noise in 0..1 (summed sines on its own clock) */
const nz = (t: number, s: number) => 0.5 + 0.25 * Math.sin(t * 7.3 + s * 1.7) + 0.15 * Math.sin(t * 13.1 + s * 2.9) + 0.1 * Math.sin(t * 21.7 + s * 0.7);
const CAPC = '#15100E';

/* ---------- 曹操's aged head: the kit Head with grey / white hair and beard, the cap redrawn dark over it ---------- */
const WuOver: React.FC<{pal: Pal}> = ({pal}) => <g>
	<path d="M-34,-120 C-32,-142 -6,-146 2,-128 C4,-118 -12,-114 -34,-120 Z" fill={CAPC} />
	<path d="M34,-97 C20,-106 -20,-110 -57,-97 L-59,-84 C-40,-93 0,-96 36,-87 Z" fill={CAPC} />
	<path d="M-24,-92 C-24,-60 -20,-24 -6,6 C2,14 12,16 20,13" fill="none" stroke={CAPC} strokeWidth={2.4} opacity={0.85} />
	<path d="M31,-99 C33,-107 32,-115 28,-120 C10,-128 -20,-136 -44,-140 C-56,-134 -60,-114 -57,-97 Z" fill={CAPC} />
	<path d="M24,-104 C27,-116 25,-126 18,-132 M6,-102 C8,-118 6,-130 0,-138 M-12,-102 C-12,-118 -14,-132 -20,-141 M-30,-100 C-32,-116 -36,-130 -40,-139 M30,-112 C0,-120 -40,-122 -64,-112 M28,-124 C0,-132 -36,-134 -58,-126" fill="none" stroke={pal.metalH} strokeOpacity={0.1} strokeWidth={1} />
	<path d="M31,-99 C33,-107 32,-115 28,-120 C10,-128 -20,-136 -44,-140" fill="none" stroke={pal.skinH} strokeOpacity={0.35} strokeWidth={1.6} />
	<path d="M-57,-97 C-40,-104 0,-106 34,-97" fill="none" stroke={pal.trim} strokeWidth={2.4} opacity={0.8} />
</g>;
const BEAD = ['#B9C9B2', '#9C3B2C', '#D9D0BA', '#3F6E74', '#B9913C'];
/** the 冕 (granted to the 魏王 in 217: 冕十有二旒): cap body, the forward-tilted 綖 board, jade 旒 front and back, the 簪 and a 充耳 */
const MianOver: React.FC<{sw: number}> = ({sw}) => { const top = (x: number) => -164 + (x + 88) * 0.0886;
	const str = (x: number, y1: number, n: number, k: number) => <g key={x}>
		<line x1={x} y1={top(x) + 3} x2={x + sw * 0.6} y2={y1} stroke="#2A2420" strokeWidth={0.9} />
		{Array.from({length: n}, (_, i) => { const u = (i + 1) / (n + 0.4), y = top(x) + 3 + (y1 - top(x) - 3) * u; return <circle key={i} cx={f1(x + sw * 0.6 * u)} cy={f1(y)} r={2.5} fill={BEAD[(i + k) % 5]} />; })}</g>;
	return <g>
		<path d="M-48,-102 C-52,-124 -46,-144 -34,-154 L24,-149 C32,-134 33,-116 31,-99 C6,-107 -24,-109 -48,-102 Z" fill={CAPC} />
		<path d="M24,-149 C32,-134 33,-116 31,-99" fill="none" stroke="#E8BC8E" strokeOpacity={0.3} strokeWidth={1.6} />
		<path d="M-46,-104 C-22,-111 8,-109 31,-100" fill="none" stroke="#7A2A20" strokeWidth={3} />
		{[-80, -74, -68].map((x, i) => str(x, -96 - i * 4, 6, i + 2))}
		<path d="M-90,-165 L72,-150.5 L72,-143 L-90,-157 Z" fill="#141012" />
		<path d="M-90,-165 L72,-150.5" stroke="#C09A52" strokeWidth={2} opacity={0.75} />
		<path d="M-90,-157 L72,-143" stroke="#7A2A20" strokeWidth={1.4} opacity={0.8} />
		<line x1={-62} y1={-126} x2={44} y2={-121} stroke="#C09A52" strokeWidth={3} strokeLinecap="round" />
		<line x1={-16} y1={-124} x2={-14} y2={-58} stroke="#2A2420" strokeWidth={0.8} /><circle cx={-14} cy={-56} r={4} fill="#B9C9B2" /><circle cx={-15} cy={-57} r={1.4} fill="#F4F0E4" opacity={0.6} />
		{[52, 58, 64, 70].map((x, i) => str(x, -62 - (i % 2) * 5, 9, i))}
	</g>; };
const AgedHead: React.FC<{pal: Pal; id: string; grey: string; cap: 'wu' | 'mian'; sw?: number}> = ({pal, id, grey, cap, sw = 0}) => <g>
	<Head old pal={{...pal, hair: grey}} id={id} cap={cap === 'wu' ? 'wu' : 'ze'} capC={CAPC} />
	{/* white strands through the hair at the temple */}
	<path d="M-52,-72 C-50,-52 -46,-34 -42,-18 M-44,-92 C-34,-100 -18,-104 0,-104 M-56,-84 C-52,-70 -50,-56 -48,-44" fill="none" stroke="#D8D2C6" strokeOpacity={0.45} strokeWidth={1.3} />
	{cap === 'wu' ? <WuOver pal={pal} /> : <MianOver sw={sw} />}
</g>;

/* ---------- 曹操 from behind (after set54bs2's CaoBack, 46 y with the torch): here 54, grey, no torch, the arm lowered — the
   reverse of the drop's D1 (there he faces us with the fire behind him; at 赤壁 we stand behind him and the fire is ahead) ---------- */
const CaoBackLow: React.FC<{id: string; pal: Pal; grey: string; slack?: number; sink?: number; flap?: number}> = ({id, pal, grey, slack = 0, sink = 0, flap = 0}) => { const p = pal;
	const EL = lp([25, -117], [23, -113], slack), HD = lp([28.5, -97.5], [25, -91], slack), FR = 96 - 8 * slack;
	const BR = lp(EL, HD, 0.3);
	const CUIR = 'M-23,-141 C-25,-128 -23,-112 -19,-98 L23,-98 C26,-112 27,-128 23,-142 C10,-147 -10,-147 -23,-141 Z';
	const SKIRT = 'M-21,-101 L23,-101 L27,-58 L-25,-58 Z';
	const CAPE = 'M-22,-146 C-12,-149 -7,-149.8 -4,-149.2 C0,-148.4 4,-148.4 7,-149.6 C10,-149.4 13,-148.4 15,-147 C18,-124 17,-96 14,-70 C13,-58 12,-50 11,-41 C4,-38 -4,-41 -12,-38 C-20,-35 -30,-40 -38,-36 C-42,-35 -46,-37 -49,-36 C-46,-56 -41,-90 -33,-118 C-30,-132 -28,-142 -22,-146 Z';
	return <g>
		<defs>
			<clipPath id={`${id}c`}><path d={CAPE} /></clipPath>
			<clipPath id={`${id}k`}><path d={SKIRT} /></clipPath>
			<clipPath id={`${id}u`}><path d={CUIR} /></clipPath>
			<pattern id={`${id}lm`} width={3.2} height={5.6} patternUnits="userSpaceOnUse">
				<rect width={3.2} height={5.6} fill={p.metalS} />
				<path d="M0.25,0.25 L3,0.25 L3,4.3 C2.4,5 0.8,5 0.25,4.3 Z" fill={p.metal} />
				<rect x={0.25} y={0.25} width={2.75} height={0.8} fill={p.metalH} opacity={0.5} />
				<rect x={0} y={4.95} width={3.2} height={0.65} fill={p.lace} />
			</pattern>
		</defs>
		{/* legs: baggy crimson trousers into short boots; weight on the left leg, the right foot a step ahead (further, so higher) */}
		<path d={limb([[-10, -46], [-11, -31], [-11, -20]], [7.6, 7.4, 6.2])} fill={p.underS} />
		<path d={limb([[10, -48], [11.6, -34], [12, -25]], [7.6, 7.2, 6])} fill={p.under} />
		<path d={limb([[14, -46], [16.4, -34], [16.6, -26]], [1.6, 1.6, 1.4])} fill="#8A4A3A" opacity={0.7} />
		<path d="M-14,-34 C-12,-31 -9,-31 -7,-34 M8,-38 C10,-35 13,-35 15,-38" fill="none" stroke="#1A0C0A" strokeWidth={0.8} opacity={0.6} />
		<path d="M-16.6,-22 L-5.4,-22 C-5,-14 -4.6,-7 -4,-3 C-4,-0.6 -6.4,0.4 -10.4,0.4 C-15,0.4 -17.6,-0.6 -17.4,-3 C-17,-8 -16.8,-14 -16.6,-22 Z" fill="#16100C" />
		<path d="M6.8,-27 L17.4,-27 C17.6,-19 18,-13 18.4,-9 C18.4,-6.6 16.2,-5.6 12.4,-5.6 C8.6,-5.6 6.6,-6.6 6.6,-9 C6.6,-14 6.7,-20 6.8,-27 Z" fill="#1C140F" />
		<path d="M15.4,-26.6 L17.4,-27 C17.6,-19 18,-13 18.4,-9 L16.8,-7.4 C16.4,-13 16,-19 15.4,-26.6 Z" fill="#6A5A4C" opacity={0.6} />
		<path d="M-16.8,-22 L-5.2,-22 L-5.2,-19.8 L-16.8,-19.8 Z M6.8,-27 L17.4,-27 L17.4,-24.8 L6.8,-24.8 Z" fill="#2E2218" />
		{/* the scabbard of the 环首刀 under the cape, its chape showing below the hem */}
		<path d={limb([[-10, -60], [-24, -30]], [1.5, 1.4])} fill="#24160F" /><path d={limb([[-21.6, -35], [-24.4, -29.4]], [1.7, 1.6])} fill={p.gold} />
		{/* the lamellar skirt and the cuirass (the right side shows past the cape) */}
		<path d={SKIRT} fill={`url(#${id}lm)`} />
		<g clipPath={`url(#${id}k)`}><rect x={-30} y={-110} width={36} height={60} fill={p.metalS} opacity={0.55} /><rect x={18} y={-110} width={12} height={60} fill={p.metalH} opacity={0.28} /><rect x={-30} y={-62} width={60} height={4} fill={p.lace} /></g>
		<path d={CUIR} fill={`url(#${id}lm)`} />
		<g clipPath={`url(#${id}u)`}><rect x={-30} y={-150} width={40} height={56} fill={p.metalS} opacity={0.5} /><path d="M17,-146 C21,-128 22,-112 20,-98 L30,-98 L30,-146 Z" fill={p.metalH} opacity={0.3} />
			{[-128, -114].map((y) => <rect key={y} x={-30} y={y} width={60} height={0.9} fill={p.lace} opacity={0.8} />)}</g>
		<path d="M-20,-101 L23,-101 L23,-97 L-20,-97 Z" fill="#1A120E" /><ellipse cx={22} cy={-99} rx={1.6} ry={1.2} fill={p.gold} />
		{/* the right arm lowered, the hand closed at his hip (it falls slack): crimson sleeve, a lamellar 披膊 on the upper arm, a metal bracer */}
		<path d={limb([[18, -139], EL, HD], [6.4, 5, 4.2])} fill={p.under} />
		<path d={limb([[19, -142], [EL[0], EL[1] - 3], [HD[0] - 1, HD[1] - 3]], [2, 1.8, 1.4])} fill="#8A4A3A" opacity={0.7} />
		<path d={limb([BR, HD], [4.6, 4.4])} fill={p.metal} /><path d={limb([[BR[0] + 1, BR[1] - 3], [HD[0], HD[1] - 2]], [1.4, 1.2])} fill={p.metalH} opacity={0.7} />
		<path d="M12,-148 C18,-152 28,-151 32,-145 C33,-140 31,-135 27,-133 C22,-134 16,-136 12,-140 Z" fill={`url(#${id}lm)`} />
		<path d="M24,-150 C29,-149 32,-146 32,-142 L28,-141 C28,-145 26,-147 22,-148 Z" fill={p.metalH} opacity={0.45} />
		<path d="M12,-140 C16,-136 22,-134 27,-133" fill="none" stroke={p.lace} strokeWidth={1.4} />
		<g transform={`translate(${f1(HD[0] + 0.5)},${f1(HD[1] - 1)}) rotate(${f1(FR)})`}><path d="M-3.4,-3 C0,-4.4 3.6,-3 4,0 C4.2,3 1.6,4.4 -1.4,4 C-3.8,3.4 -4.6,-1 -3.4,-3 Z" fill={p.skin} /><path d="M-3.4,-3 C-1,-3.8 1.4,-3.6 3,-2.4 C1,-1 -1.6,-0.4 -4,-0.6 Z" fill={p.skinH} /></g>
		{/* the cape over the back: base, the shade away from the torch, lit folds toward it, a dark hem */}
		<path d={CAPE} fill="#3A1C18" />
		<g clipPath={`url(#${id}c)`}>
			<path d="M-52,-150 L-10,-150 C-12,-120 -15,-80 -19,-36 L-52,-36 Z" fill="#1E0E0C" />
			<path d="M-30,-140 C-33,-110 -37,-80 -42,-36 L-37,-36 C-33,-80 -29,-110 -26,-140 Z" fill="#2C1512" />
			<path d="M-3,-146 C-2,-118 -4,-84 -7,-38 L-1,-38 C2,-84 3,-118 2,-146 Z" fill="#552820" />
			<path d="M7,-148 C10,-124 10,-96 8,-60 L6,-38 L20,-38 L20,-150 Z" fill="#7A3A2C" opacity={0.85} />
			<path d="M10,-148 C13,-124 13,-96 11,-60 L9,-38 L20,-38 L20,-150 Z" fill="#A0503A" opacity={0.45} />
			<path d="M-10,-146 C-11,-116 -13,-80 -16,-38 M-22,-138 C-25,-108 -29,-76 -33,-38 M4,-146 C5,-118 4,-84 2,-38" fill="none" stroke="#140808" strokeWidth={1.1} opacity={0.75} />
			<path d="M-60,-41 C-40,-46 -20,-42 0,-44 C8,-44 14,-46 20,-46 L20,-30 L-60,-30 Z" fill="#160A08" />
			<path d="M-18,-146 C-8,-150 4,-150 13,-147 L13,-143 C4,-146 -8,-146 -18,-142 Z" fill="#552820" />
		</g>
		<path d={`M-49,-37 C-54,${f1(-41 - flap)} ${f1(-60 - flap * 2)},${f1(-45 - flap)} ${f1(-66 - flap * 3)},${f1(-43 - flap * 0.5)} C-60,-38 -54,-35 -46,-35 Z`} fill="#2C1512" />
		{/* the left shoulder under the cape */}
		<path d="M-22,-146 C-26,-144 -28,-140 -29,-134 L-24,-136 Z" fill="#1E0E0C" />
		<g transform={`translate(0,${f1(1.3 * sink)})`}>
		{/* the head from behind, turned a little to his right: nape, the back of the head, the right ear, a sliver of lit cheek and the greying
		    beard (lost profile), the 帻 band with its trim, the lacquered gauze 武冠 cage and its chin tie */}
		<path d="M-3.4,-151 L6,-151 L6.3,-148.6 L-3.4,-148.6 Z" fill={p.skinS} />
		<path d="M-8,-149 C-10,-155 -10,-163 -6,-168 C-2,-171 5,-171 9,-167 C11,-162 11,-155 9,-150 C5,-147.4 -4,-147.4 -8,-149 Z" fill={grey} /><path d="M-6,-150 C-7,-156 -6,-162 -3,-166 M0,-149.6 C0,-155 1,-161 3,-166 M5,-149.8 C6,-155 7,-160 8,-163" fill="none" stroke="#D2CCC0" strokeOpacity={0.5} strokeWidth={0.45} />
		<path d="M-5,-149 C-2,-150.4 2,-150.4 5,-149.4" fill="none" stroke="#3A2A20" strokeWidth={0.6} />
		<path d="M8,-158 C10.8,-157 12.6,-153 12.4,-149 C12.2,-146 10,-144.6 8,-145 L7,-150 Z" fill={p.skinH} />
		<path d="M11.6,-151 C13,-148 12.6,-144.6 10.6,-143 C8.6,-142.4 7,-143.2 6.6,-144.6 C8.4,-145 10.2,-147.4 11.6,-151 Z" fill={grey} />
		<path d="M11.4,-149.4 C12.2,-147.6 11.8,-145.4 10.6,-144" fill="none" stroke="#A09890" strokeWidth={0.4} opacity={0.8} />
		<path d="M8.4,-162 C11.8,-163.6 14,-160.2 13.4,-156 C13,-152.8 10.8,-151.4 8.8,-152.4 Z" fill={p.skin} />
		<path d="M10.8,-163 C12.8,-162.4 14,-160 13.4,-156 L12.4,-156.4 C12.8,-159.4 12,-161.4 10.4,-162 Z" fill={p.skinH} />
		<path d="M9.8,-160.4 C11.6,-160 12,-157.6 11.2,-155.2" fill="none" stroke={p.skinS} strokeWidth={0.7} />
		<path d="M-8,-160.4 C-10.6,-161 -11.8,-158 -11.2,-154.8 C-10.6,-152.6 -9,-152 -7.8,-152.8 Z" fill={p.skinS} />
		<path d="M-9,-159 C-3,-161.4 5,-161.8 10.6,-160.4 L10.4,-157.8 C5,-159 -3,-158.6 -8.8,-156.6 Z" fill={CAPC} />
		<path d="M-8.8,-156.6 C-3,-158.6 5,-159 10.4,-157.8" fill="none" stroke={p.trim} strokeWidth={0.8} />
		<path d="M-5,-166 C-5,-172 -1,-175 3,-174.6 C7,-174 8,-170 7.4,-165 Z" fill="#0A0807" />
		<path d="M-8.4,-159.6 C-9.4,-167 -7.4,-174.4 -1,-176.4 C5,-177.6 10,-173.6 10.6,-160.6 Z" fill="#3E3A38" opacity={0.62} />
		<path d="M-7,-161 C-7.4,-168 -5,-173.4 -1,-175 M-2.4,-160.4 C-2.6,-167 -1,-173 1.6,-176 M2.6,-160.6 C2.8,-166.6 4,-172 6,-175.4 M7.4,-160.8 C7.6,-166 8.4,-170 9.4,-172 M-8.6,-165 C-2,-167 5,-167.4 10.4,-165.4 M-7.4,-170.6 C-2,-172.4 4,-172.6 9,-171" fill="none" stroke={p.metalH} strokeOpacity={0.22} strokeWidth={0.35} />
		<path d="M3,-177.2 C8,-176.6 10.4,-172 10.6,-161" fill="none" stroke={p.skinH} strokeOpacity={0.45} strokeWidth={0.7} />
		<path d="M10.4,-158 C10.8,-153 11.4,-148 11.6,-144" fill="none" stroke={grey} strokeWidth={0.6} />
		</g>
	</g>; };


/* ======================================================================================================================
   card 28 · 碣石 · 207 · dawn
   ====================================================================================================================== */
const SUNX = 1400;
export const Jieshi: React.FC<{t: number}> = ({t}) => {
	const u = t - T54, v = cl01(u / 3.5), m = 1 - (1 - v) ** 3;
	const dx = 470 * (1 - m) - 18 * u, dy = -190 * (1 - m), z = 1 + 0.07 * (1 - m);
	const L = (p: number) => lay(dx, dy, z, p, 960, 640);
	const sunY = 588 - 11 * u, S = 0.5, CX = 1010, CY = 842, HX = 515, HY = 848, HK = 2.3;
	const cape = 0.62 + 0.2 * Math.sin(t * 2.3) + 0.08 * Math.sin(t * 5.1 + 1), lift = sstep(T54 + 1.6, T54 + 2.8, t), tilt = 4 - 7 * lift + 0.6 * Math.sin(t * 1.3);
	const P53: Pal = {...PAL, skinH: '#EEC496'};
	return <Svg>
		<defs>
			<linearGradient id="j1sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1E2A32" /><stop offset="0.25" stopColor="#36424A" /><stop offset="0.42" stopColor="#5E6260" /><stop offset="0.5" stopColor="#968A76" /><stop offset="0.535" stopColor="#C6B290" /></linearGradient>
			<radialGradient id="j1sun" cx={SUNX} cy={560} r="1100" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${SUNX} 560) scale(1 0.55) translate(${-SUNX} -560)`}><stop offset="0" stopColor="#F6E2B8" stopOpacity="0.75" /><stop offset="0.08" stopColor="#E9CC98" stopOpacity="0.45" /><stop offset="0.3" stopColor="#C9A97C" stopOpacity="0.16" /><stop offset="1" stopColor="#C9A97C" stopOpacity="0" /></radialGradient>
			<radialGradient id="j1disk"><stop offset="0" stopColor="#FFF4DC" /><stop offset="0.75" stopColor="#F8E2B4" /><stop offset="1" stopColor="#EFCB92" /></radialGradient>
			<linearGradient id="j1sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8E8574" /><stop offset="0.06" stopColor="#5E605A" /><stop offset="0.35" stopColor="#3A4244" /><stop offset="1" stopColor="#1A2024" /></linearGradient>
			<linearGradient id="j1haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C8B696" stopOpacity="0" /><stop offset="0.5" stopColor="#C8B696" stopOpacity="0.38" /><stop offset="1" stopColor="#C8B696" stopOpacity="0" /></linearGradient>
			<linearGradient id="j1rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#241C18" /><stop offset="1" stopColor="#0E0A08" /></linearGradient>
			<radialGradient id="j1vig" cx="0.55" cy="0.5" r="0.78"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient>
			<Blur id="j1b2" s={2} /><Blur id="j1b3" s={3} /><Blur id="j1b7" s={7} /><Blur id="j1b12" s={12} /><Blur id="j1b4" s={4} />
			<RimF id="j1rimF" lx={1} ly={-0.2} k={1.4} c="#E8C89A" o={0.6} />
			<RimF id="j1rim" lx={1} ly={-0.25} k={2.6} c="#F2D2A0" o={0.9} lx2={-0.4} ly2={-1} k2={1.2} c2="#AFC0BC" o2={0.35} />
			<RimF id="j1hero" lx={1} ly={-0.2} k={5} c="#F6DCAE" o={0.95} lx2={-1} ly2={-0.15} k2={4} c2={ACC} o2={0.95} blur={1} />
			<clipPath id="j1body"><rect x={-400} y={52} width={900} height={800} /></clipPath>
			<Lamel pal={P53} />
		</defs>
		{/* P0 dawn sky, the sun's glow, thin cloud bars lit from below (drifting) */}
		<rect width={W} height={H} fill="url(#j1sky)" />
		<g transform={L(0.04)}>
			<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#j1sun)" />
			{[[300, 300, 420, 7, 0.5], [900, 250, 560, 6, 0.4], [1500, 330, 380, 6, 0.45], [1150, 420, 520, 5, 0.55], [500, 455, 640, 5, 0.5], [1760, 470, 420, 4, 0.55], [1250, 500, 300, 3, 0.6]].map(([x, y, w, h, o], i) => { const X = x - u * (5 + i * 1.3);
				return <g key={i} filter="url(#j1b3)"><ellipse cx={f1(X)} cy={y} rx={w / 2} ry={h} fill="#3A3E40" opacity={o} /><ellipse cx={f1(X + 20)} cy={y + h * 0.7} rx={w * 0.42} ry={h * 0.45} fill="#E6C99A" opacity={o * 0.7} /></g>; })}
		</g>
		{/* P1 the sun rising out of the sea (clipped at the horizon), the far headlands in haze */}
		<g transform={L(0.07)}>
			<clipPath id="j1hz"><rect x={-300} y={-300} width={W + 600} height={860} /></clipPath>
			<g clipPath="url(#j1hz)"><circle cx={SUNX} cy={f1(sunY)} r={52} fill="url(#j1disk)" /><circle cx={SUNX} cy={f1(sunY)} r={90} fill="#FFF0D0" opacity={0.22} filter="url(#j1b12)" /></g>
		</g>
		<g transform={L(0.15)} filter="url(#j1b2)">
			<path d="M-300,562 L-300,546 C-160,538 -40,522 90,530 C180,518 280,522 380,538 C450,544 500,552 560,562 Z" fill="#5A5C56" />
			<path d="M-300,562 L-300,554 C-100,550 100,544 260,552 L330,562 Z" fill="#4C4E4A" />
			<path d="M1660,562 C1690,550 1722,545 1752,551 C1778,546 1806,552 1830,562 Z" fill="#6A6860" />
		</g>
		{/* P2 the sea: the horizon line, the sun's glitter path widening toward us, slow swells */}
		<g transform={L(0.3)}>
			<rect x={-400} y={560} width={W + 800} height={700} fill="url(#j1sea)" />
			<rect x={-400} y={552} width={W + 800} height={22} fill="#F2DEB4" opacity={0.18} filter="url(#j1b3)" />
			{Array.from({length: 70}, (_, i) => { const r = i / 70, y = 563 + 520 * r * r, spread = 18 + 300 * r, x = SUNX + (rnd(i, 3) - 0.5) * 2 * spread * (0.4 + 0.6 * rnd(i, 4)), w = 10 + 60 * r * (0.5 + rnd(i, 5)), o = (0.55 - 0.35 * r) * (0.5 + 0.5 * Math.sin(t * (2.2 + rnd(i, 6) * 2.4) + i * 1.7));
				return o > 0.03 ? <rect key={i} x={f1(x - w / 2)} y={f1(y)} width={f1(w)} height={f1(1.2 + 3 * r)} fill="#FFEAC0" opacity={f1(o)} /> : null; })}
			{Array.from({length: 16}, (_, i) => { const y = 580 + i * i * 2.1 + i * 8, ph = (u * (0.4 + i * 0.05) + rnd(i, 7)) % 1;
				return <path key={i} d={`M${f1(-300 + ph * 160)},${f1(y)} ${Array.from({length: 12}, (_, j) => `q${f1(90 + i * 6)},${f1(-2 - i * 0.25)} ${f1(180 + i * 12)},0`).join(' ')}`} fill="none" stroke="#C8B896" strokeOpacity={0.08 + i * 0.006} strokeWidth={1 + i * 0.12} />; })}
		</g>
		<rect y={540} width={W} height={60} fill="url(#j1haze)" />
		{/* gulls over the water */}
		<g transform={L(0.45)} fill="none" stroke="#1E1A18" strokeLinecap="round">
			{[[1250, 430, 1.0, 0], [1340, 470, 0.8, 1.3], [1180, 500, 0.7, 2.1], [1560, 410, 0.6, 0.7]].map(([x, y, s, ph], i) => { const X = x - u * (34 + i * 9), Y = y + Math.sin(t * 1.4 + ph) * 8, fl = Math.sin(t * 9 + ph * 3);
				return <path key={i} d={`M${f1(X - 16 * s)},${f1(Y + 2 * s)} Q${f1(X - 8 * s)},${f1(Y - 8 * s * fl)} ${f1(X)},${f1(Y)} Q${f1(X + 8 * s)},${f1(Y - 8 * s * fl)} ${f1(X + 16 * s)},${f1(Y + 2 * s)}`} strokeWidth={2.4 * s} />; })}
		</g>
		{/* a sea stack (碣石) standing off the headland, foam at its foot */}
		<g transform={L(0.6)}>
			<path d="M1618,668 L1626,600 L1634,556 L1648,520 L1664,512 L1678,530 L1686,566 L1694,612 L1704,668 Z" fill="#17110E" filter="url(#j1rimF)" />
			<path d="M1664,512 L1678,530 L1686,566 L1694,612 L1704,668 L1690,668 L1680,610 L1672,560 Z" fill="#3E3028" opacity={0.6} />
			<ellipse cx={1660} cy={668} rx={f1(56 + 6 * Math.sin(t * 2.1))} ry={5} fill="#E2D8C4" opacity={0.35} filter="url(#j1b2)" />
		</g>
		{/* P3 the 碣石 headland: stepped ledges of layered stone; the old war horse and 曹操 on its top, facing the sunrise; surf at its foot */}
		<g transform={L(1)}>
			<path d="M240,1500 L300,1040 L338,1000 L352,950 L400,912 L430,872 L470,856 L520,850 L700,846 L860,842 L1000,846 L1100,844 L1150,852 L1190,872 L1214,900 L1236,912 L1262,950 L1300,980 L1322,1030 L1360,1060 L1390,1120 L1430,1180 L1470,1500 Z" fill="url(#j1rock)" />
			{['M1150,852 L1190,872 L1214,900 L1172,934 L1138,884 Z', 'M1236,912 L1262,950 L1300,980 L1252,1012 L1220,962 Z', 'M1322,1030 L1360,1060 L1390,1120 L1342,1146 L1310,1082 Z', 'M1100,844 L1150,852 L1138,884 L1090,872 Z'].map((d, i) => <path key={i} d={d} fill="#5A4636" opacity={0.55} />)}
			{['M430,872 L470,856 L520,850 L540,880 L470,900 Z', 'M352,950 L400,912 L430,936 L380,972 Z'].map((d, i) => <path key={i} d={d} fill="#2E241E" opacity={0.7} />)}
			{[[360, 980, 1250, 960], [330, 1060, 1320, 1040], [420, 900, 1180, 890], [300, 1140, 1380, 1120], [280, 1240, 1420, 1220]].map(([a, y, b, y2], i) => <path key={i} d={`M${a},${y} L${(a + b) / 2},${y - 8} L${b},${y2}`} fill="none" stroke="#000" strokeOpacity={0.4} strokeWidth={2.2} />)}
			{[[760, 846, 740, 960], [1020, 848, 1050, 1000], [560, 852, 530, 1010], [1180, 880, 1150, 1100], [900, 860, 880, 1200]].map(([a, b, c, d], i) => <path key={i} d={`M${a},${b} L${(a + c) / 2 + 12},${(b + d) / 2} L${c},${d}`} fill="none" stroke="#000" strokeOpacity={0.45} strokeWidth={2.4} />)}
			<path d="M470,856 L520,850 L700,846 L860,842 L1000,846 L1100,844 L1150,852 L1190,872 L1214,900 L1236,912 L1262,950 L1300,980 L1322,1030 L1360,1060 L1390,1120 L1430,1180" fill="none" stroke="#F2D6A6" strokeOpacity={0.5} strokeWidth={2.6} />
			{Array.from({length: 18}, (_, i) => { const x = 520 + i * 36 + rnd(i, 21) * 20, y = 848, b = Math.sin(t * 3 + i) * 3;
				return <path key={i} d={`M${f1(x)},${f1(y)} q${f1(-4 + b)},-12 ${f1(-6 + b * 1.6)},-22 M${f1(x + 5)},${f1(y)} q${f1(-2 + b)},-9 ${f1(-3 + b * 1.4)},-16`} fill="none" stroke="#1A1410" strokeWidth={2.2} />; })}
			{/* surf at the rock's foot: swells break and spray rises on their own clocks */}
			{Array.from({length: 5}, (_, i) => { const ph = (t * 0.42 + i * 0.37 + rnd(i, 8)) % 1, x = 1340 + i * 40 + rnd(i, 9) * 30, y = 1060 + i * 30, h = 80 * Math.sin(Math.PI * Math.min(1, ph * 1.6)), o = 0.5 * (1 - ph);
				return <g key={i} filter="url(#j1b4)"><ellipse cx={f1(x)} cy={f1(y - h * 0.5)} rx={f1(26 + 40 * ph)} ry={f1(8 + h * 0.6)} fill="#E8E0CE" opacity={f1(o)} />
					<ellipse cx={f1(x + 30)} cy={f1(y + 6)} rx={f1(60 + 30 * ph)} ry={6} fill="#D8D2C2" opacity={f1(o * 0.7)} /></g>; })}
			<ellipse cx={HX + 20} cy={HY + 2} rx={270} ry={9} fill="#060403" opacity={0.5} />
			<g fill="#140E0B" color="#140E0B" filter="url(#j1rim)"><g transform={at(HX, HY, HK)}><Horse pose={1} tail="knot" /></g></g>
			<ellipse cx={CX - 20} cy={CY + 3} rx={90} ry={8} fill="#060403" opacity={0.55} />
			<g filter="url(#j1hero)"><g transform={atC(CX, CY, S)}>
				<g clipPath="url(#j1body)"><Cao pal={P53} id="j1c" old armour arm={{sh: [10, 84], el: [22, 200], hd: [54, 266]}} cape={cape} /></g>
				<g transform={`translate(0,49) rotate(${f1(tilt)} 0 -8) scale(0.88) translate(0,-40)`}><AgedHead pal={P53} id="j1h" grey="#7E7870" cap="wu" /></g>
			</g></g>
		</g>
		{/* P4 the near rocks, out of focus, wet tops catching the sun; spray drifting through */}
		<g transform={L(1.45)}>
			<g filter="url(#j1b7)" fill="#0C0907">
				<path d="M1440,1500 L1480,1060 L1530,1010 L1600,990 L1660,960 L1730,972 L1800,950 L1880,980 L1990,1000 L2100,1040 L2100,1500 Z" />
				<path d="M-200,1500 L-200,1010 L-120,990 L-40,1000 L60,980 L150,1010 L230,1050 L280,1120 L300,1500 Z" />
			</g>
			<path d="M1530,1010 L1600,990 L1660,960 L1730,972 L1800,950" fill="none" stroke="#F2D6A6" strokeOpacity={0.3} strokeWidth={4} filter="url(#j1b4)" />
			{Array.from({length: 4}, (_, i) => { const ph = (t * 0.33 + i * 0.29) % 1, x = 1560 + i * 90, y = 990 - 160 * ph;
				return <ellipse key={i} cx={f1(x - 60 * ph)} cy={f1(y)} rx={f1(30 + 60 * ph)} ry={f1(16 + 30 * ph)} fill="#E6DECC" opacity={f1(0.32 * Math.sin(Math.PI * ph))} filter="url(#j1b12)" />; })}
		</g>
		<rect width={W} height={H} fill="url(#j1vig)" />
	</Svg>; };

/* ======================================================================================================================
   card 29 · 赤壁 · 208 · night
   ====================================================================================================================== */
/** a fire: a glowing bed and tongues of mixed width and height on their own clocks, in four layers (deep red, orange, gold, white-hot);
    lean < 0 = blown to the left */
const Blaze: React.FC<{x: number; y: number; w: number; h: number; t: number; seed: number; lean?: number; o?: number}> = ({x, y, w, h, t, seed, lean = -0.3, o = 1}) => {
	if (o <= 0.01) return null;
	const N = Math.max(3, Math.round(w / 26) + 2);
	const T = Array.from({length: N}, (_, i) => { const r = rnd(i, seed), c = (i + 0.5) / N + (rnd(i, seed + 5) - 0.5) * 0.5 / N, edge = Math.sin(Math.PI * Math.min(1, Math.max(0, c)));
		return {bx: x - w / 2 + c * w, by: y - rnd(i, seed + 6) * h * 0.1, ww: (w / N) * (0.7 + 0.9 * r) * 0.9, hh: h * (0.3 + 0.7 * edge) * (0.55 + 0.75 * nz(t * (0.8 + rnd(i, seed + 1) * 0.6), seed * 7 + i * 3)) * (0.7 + 0.5 * rnd(i, seed + 2)), sp: 5 + rnd(i, seed + 3) * 4}; });
	const tongue = (k: number, c: string, j: number) => T.map((q, i) => { const hh = q.hh * k, ww = q.ww * (0.5 + 0.5 * k), sway = Math.sin(t * q.sp + i * 2.1) * hh * 0.1, tx = q.bx + lean * hh + sway, mx = q.bx + lean * hh * 0.5 - sway * 0.5;
		return <path key={j * 100 + i} d={`M${f1(q.bx - ww)},${f1(q.by)} C${f1(q.bx - ww * 1.05)},${f1(q.by - hh * 0.35)} ${f1(mx - ww * 0.6)},${f1(q.by - hh * 0.6)} ${f1(tx)},${f1(q.by - hh)} C${f1(mx + ww * 0.25)},${f1(q.by - hh * 0.62)} ${f1(q.bx + ww * 1.1)},${f1(q.by - hh * 0.36)} ${f1(q.bx + ww)},${f1(q.by)} Z`} fill={c} />; });
	const bed = (k: number) => `M${f1(x - w * 0.55 * k)},${f1(y + 4)} C${f1(x - w * 0.5 * k)},${f1(y - h * 0.16 * k)} ${f1(x + w * 0.5 * k)},${f1(y - h * 0.16 * k)} ${f1(x + w * 0.55 * k)},${f1(y + 4)} Z`;
	return <g opacity={f1(o)}>
		<path d={bed(1)} fill="#B83A18" />{tongue(1, '#B83A18', 0)}
		<path d={bed(0.85)} fill="#E8702A" />{tongue(0.74, '#E8702A', 1)}
		<path d={bed(0.65)} fill="#FFB850" />{tongue(0.46, '#FFB850', 2)}
		{tongue(0.2, '#FFE8B0', 3)}
	</g>; };
/** a Han tower ship (楼船), local px: waterline y = 0, length ≈ 450, bow at +x; mast = fall angle (deg); win = window glow (fire inside);
    sailFire is drawn on the mast (it falls with it) */
const Ship: React.FC<{tiers?: number; mast?: number; win?: number; sail?: number; sailFire?: React.ReactNode}> = ({tiers = 3, mast = 0, win = 0, sail = 1, sailFire}) => <g>
	<path d="M-226,-46 L-196,-30 L180,-30 L232,-54 L240,-50 L206,4 L-196,4 L-222,-20 Z" />
	{Array.from({length: 12}, (_, i) => <path key={i} d={`M${-170 + i * 30},-14 L${-186 + i * 30},18`} stroke="currentColor" strokeWidth={4} />)}
	<rect x={-180} y={-66} width={356} height={38} />
	{Array.from({length: 22}, (_, i) => <rect key={i} x={-180 + i * 16.3} y={-74} width={9} height={9} />)}
	{tiers > 1 && <><rect x={-130} y={-110} width={250} height={46} /><path d="M-146,-108 L136,-108 L122,-122 L-132,-122 Z" />{Array.from({length: 15}, (_, i) => <rect key={'c' + i} x={-128 + i * 16.6} y={-130} width={8} height={9} />)}</>}
	{tiers > 2 && <><rect x={-74} y={-150} width={134} height={30} /><path d="M-90,-148 L76,-148 L60,-166 L-74,-166 Z" /><path d="M-80,-166 L66,-166 L68,-171 L-82,-171 Z" /></>}
	{win > 0 && <g fill="#FFB050" opacity={win}>{Array.from({length: 11}, (_, i) => <rect key={i} x={-160 + i * 32} y={-56} width={12} height={14} />)}{tiers > 1 && Array.from({length: 9}, (_, i) => <rect key={'u' + i} x={-116 + i * 26} y={-100} width={10} height={12} />)}{tiers > 2 && Array.from({length: 4}, (_, i) => <rect key={'v' + i} x={-56 + i * 28} y={-144} width={9} height={10} />)}</g>}
	<g transform={`rotate(${f1(mast)} 10 -150)`}>
		<rect x={6} y={-360} width={8} height={212} />
		{sail > 0 && <g opacity={sail}><path d="M-40,-348 L76,-344 L82,-226 L-44,-230 Z" />{Array.from({length: 6}, (_, i) => <path key={i} d={`M-44,${-332 + i * 20} L80,${-328 + i * 20}`} stroke="#000" strokeOpacity={0.25} strokeWidth={2} />)}</g>}
		{sailFire}
	</g>
	<rect x={-206} y={-190} width={4} height={150} /><path d="M-204,-190 L-160,-184 L-162,-150 L-204,-154 Z" />
</g>;
/** a fire ship: a 蒙冲 packed with brushwood soaked in oil, a 牙旗 on its mast (local px, waterline 0, bow at −x) */
const FireBoat: React.FC = () => <g>
	<path d="M-92,-26 L-74,-12 L72,-12 L82,-20 L76,4 L-66,4 Z" />
	{Array.from({length: 5}, (_, i) => <path key={i} d={`M${-50 + i * 26},-6 L${-60 + i * 26},12`} stroke="currentColor" strokeWidth={3} />)}
	<path d="M-62,-12 C-58,-30 -30,-40 0,-40 C30,-40 56,-30 64,-12 Z" />
	<rect x={46} y={-118} width={4} height={106} /><path d="M50,-118 L92,-112 L90,-88 L50,-92 Z" />
</g>;
type Fire = {dx: number; dy: number; w: number; h: number};
type ShipSpec = {x: number; y: number; k: number; flip?: boolean; tiers: number; back: Fire[]; front: Fire[]; win: number; sail?: number; ign?: 'c'; id: number};
const SHIPS: ShipSpec[] = [
	{id: 1, x: 300, y: 656, k: 0.28, flip: true, tiers: 2, back: [], front: [], win: 0},
	{id: 2, x: 620, y: 664, k: 0.36, tiers: 2, back: [], front: [], win: 0},
	{id: 3, x: 1390, y: 662, k: 0.42, flip: true, tiers: 2, back: [{dx: 10, dy: -96, w: 330, h: 230}], front: [{dx: -80, dy: -40, w: 120, h: 50}], win: 0.9, sail: 0},
	{id: 4, x: 1830, y: 676, k: 0.52, tiers: 3, back: [{dx: -20, dy: -120, w: 380, h: 300}], front: [{dx: 90, dy: -40, w: 120, h: 60}], win: 1, sail: 0},
	{id: 5, x: 880, y: 680, k: 0.55, tiers: 2, back: [{dx: 60, dy: -90, w: 260, h: 190}], front: [{dx: 150, dy: -40, w: 90, h: 50}], win: 0.8, ign: 'c'},
	{id: 6, x: 1560, y: 694, k: 0.78, flip: true, tiers: 3, back: [{dx: 0, dy: -150, w: 400, h: 320}, {dx: -170, dy: -60, w: 140, h: 120}], front: [{dx: 120, dy: -40, w: 110, h: 50}, {dx: -60, dy: -70, w: 60, h: 40}], win: 1, sail: 0},
	{id: 7, x: 1180, y: 704, k: 0.9, tiers: 3, back: [{dx: -70, dy: -120, w: 300, h: 240}, {dx: 130, dy: -70, w: 150, h: 150}], front: [{dx: -160, dy: -36, w: 90, h: 50}, {dx: 70, dy: -72, w: 70, h: 40}], win: 1},
];
type Boat = {x0: number; v: number; y: number; k: number; s: number};
const BOATS: Boat[] = [{x0: 1330, v: 0, y: 728, k: 1.0, s: 0}, {x0: 1770, v: -26, y: 748, k: 1.1, s: 1}, {x0: 2090, v: -34, y: 768, k: 1.2, s: 2}, {x0: 1030, v: -14, y: 712, k: 0.8, s: 3}];
export const Chibi: React.FC<{t: number}> = ({t}) => {
	const u = t - T56, v = cl01(u / 4), z = 1 + 0.06 * (v * 0.6 + 0.4 * v * v), dx = -50 * v;
	const L = (p: number) => lay(dx, 0, z, p, 1000, 640);
	const fall = 74 * sstep(T57 - 0.1, T57 + 0.85, t) ** 1.6, sink = sstep(T57 + 0.5, T57 + 1.6, t);
	const cIgn = sstep(T56 + 1.0, T56 + 2.2, t);
	const BS = 3.55, CX = 720, CY = 1062;
	const arm = sstep(T57 + 0.3, T57 + 1.2, t), sinkH = sstep(T57 + 0.4, T57 + 1.6, t) + 0.1 * Math.sin(t * 1.7), flap = 2.5 + 2 * Math.sin(t * 3.1) + Math.sin(t * 7.3);
	const P54: Pal = {...PAL, skin: '#C08A60', skinH: '#F2B47E', skinS: '#8E5E40', metalH: '#C8A07A'};
	const cape = 0.42 + 0.14 * Math.sin(t * 1.8) + 0.06 * Math.sin(t * 4.4 + 1);
	const glowA = 0.9 + 0.1 * Math.sin(t * 5.3) + 0.05 * Math.sin(t * 11.7);
	/* every fire in layer coordinates (for the glows and the reflections) */
	const amt = (s: ShipSpec) => s.ign ? cIgn : 1;
	const abs = (s: ShipSpec, f: Fire, j: number) => ({x: s.x + (s.flip ? -1 : 1) * f.dx * s.k, y: s.y + f.dy * s.k, w: f.w * s.k, h: f.h * s.k, a: amt(s), seed: s.id * 10 + j});
	const bx = (b: Boat) => b.x0 + b.v * u;
	const boatFire = (b: Boat) => ({x: bx(b) + 2 * b.k, y: b.y - 30 * b.k, w: 120 * b.k, h: 150 * b.k, a: 1, seed: 90 + b.s});
	const all = [...SHIPS.flatMap((s) => s.back.map((f, j) => abs(s, f, j))), ...BOATS.map(boatFire), {x: 1180 + 18, y: 704 - 280 * 0.9, w: 120, h: 140, a: (1 - sink * 0.8), seed: 77}].filter((f) => f.a > 0.01);
	return <Svg>
		<defs>
			<linearGradient id="c1sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0E161C" /><stop offset="0.35" stopColor="#18232A" /><stop offset="0.55" stopColor="#2C2A28" /><stop offset="0.6" stopColor="#4A3426" /></linearGradient>
			<radialGradient id="c1glow" cx="1380" cy="620" r="1000" gradientUnits="userSpaceOnUse" gradientTransform="translate(1380 620) scale(1 0.62) translate(-1380 -620)"><stop offset="0" stopColor="#E0702A" stopOpacity="0.7" /><stop offset="0.25" stopColor="#B4521E" stopOpacity="0.38" /><stop offset="0.6" stopColor="#6A3018" stopOpacity="0.12" /><stop offset="1" stopColor="#6A3018" stopOpacity="0" /></radialGradient>
			<radialGradient id="c1f"><stop offset="0" stopColor="#FFB04E" stopOpacity="0.5" /><stop offset="0.35" stopColor="#E8702A" stopOpacity="0.2" /><stop offset="1" stopColor="#E8702A" stopOpacity="0" /></radialGradient>
			<linearGradient id="c1water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2618" /><stop offset="0.15" stopColor="#1E1A18" /><stop offset="1" stopColor="#0A0E10" /></linearGradient>
			<linearGradient id="c1shore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1A1310" /><stop offset="1" stopColor="#080605" /></linearGradient>
			<radialGradient id="c1vig" cx="0.55" cy="0.5" r="0.78"><stop offset="0.58" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
			<Blur id="c1b2" s={2} /><Blur id="c1b3" s={3} /><Blur id="c1sm" s={9} /><Blur id="c1b6" s={6} /><Blur id="c1b1" s={1.2} /><Blur id="c1b14" s={14} />
			<RimF id="c1rimS" lx={1} ly={-0.6} k={1.6} c="#FF9A50" o={0.7} />
			<RimF id="c1rimN" lx={1} ly={-0.3} k={2.4} c="#FFB070" o={0.85} lx2={-1} ly2={-0.4} k2={1.2} c2="#9FB8B6" o2={0.3} />
			<RimF id="c1hero" lx={0.7} ly={-1} k={5} c="#FFB878" o={0.95} lx2={-1} ly2={0.1} k2={4} c2={ACC} o2={0.9} blur={1} />
			<clipPath id="c1body"><rect x={-400} y={52} width={900} height={800} /></clipPath>
			<Lamel pal={P54} />
		</defs>
		{/* P0 the night sky reddened over the fire; faint stars away from it */}
		<rect width={W} height={H} fill="url(#c1sky)" />
		<g transform={L(0.05)}>
			<rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#c1glow)" opacity={f1(glowA)} />
			{Array.from({length: 40}, (_, i) => <circle key={i} cx={f1(rnd(i, 71) * 1000)} cy={f1(30 + rnd(i, 72) * 360)} r={0.8 + rnd(i, 73) * 1.1} fill="#DDE6E4" opacity={f1((0.25 + 0.3 * rnd(i, 74)) * (0.8 + 0.2 * Math.sin(t * 2 + i)))} />)}
		</g>
		{/* the smoke of the burning fleet, lit from below, streaming left with the wind */}
		<g transform={L(0.3)} filter="url(#c1sm)">
			{[[1180, 520, 520, 60, 1], [1560, 480, 560, 72, 2], [1840, 520, 480, 56, 3], [1390, 560, 420, 46, 4], [900, 600, 360, 40, 5]].map(([x, y, h, w, s]) =>
				<Smoke key={s} x={x} y={y} h={h} w={w} t={t + 40} seed={s} drift={420} rate={0.12} c0="#7A4224" c1="#221E1E" o={s === 5 ? 0.85 * cIgn : 0.85} />)}
		</g>
		{/* P1 the far south bank: the cliffs of 赤壁, rimmed by the fire */}
		<g transform={L(0.2)} filter="url(#c1b2)">
			<path d="M-300,642 L-300,610 C-100,600 100,604 300,612 C420,600 520,606 640,620 L700,642 Z" fill="#14161A" />
			<path d="M1500,642 L1540,560 C1580,548 1640,546 1700,556 L1760,520 C1820,512 1900,514 1980,526 L2300,540 L2300,642 Z" fill="#1A1416" />
			<path d="M1540,560 C1580,548 1640,546 1700,556 L1760,520 C1820,512 1900,514 1980,526" fill="none" stroke="#E07A3A" strokeOpacity={0.5} strokeWidth={2} />
		</g>
		{/* P2 the river and the fleet */}
		<g transform={L(0.5)}>
			<rect x={-400} y={636} width={W + 800} height={700} fill="url(#c1water)" />
			<rect x={-400} y={632} width={W + 800} height={14} fill="#E8823A" opacity={0.22} filter="url(#c1b3)" />
			{/* reflections of every fire: broken horizontal strokes shimmering down the water */}
			{all.map((f, j) => { const y0 = Math.max(f.y + f.h * 0.3, 650); return <g key={'r' + j} opacity={f1(0.75 * f.a)}>{Array.from({length: 16}, (_, i) => { const r = i / 16, y = y0 + r * r * 380 + r * 30, w = f.w * (0.8 - 0.4 * r) * (0.4 + 0.6 * nz(t * 0.7 + i * 0.3, j * 5 + i)), x = f.x + Math.sin(t * 2.6 + i * 1.9 + j) * 10 * (0.3 + r);
				return <rect key={i} x={f1(x - w / 2)} y={f1(y)} width={f1(w)} height={f1(2 + 3 * r)} fill={i % 3 === 0 ? '#FFC468' : '#E8702A'} opacity={f1(0.7 - 0.55 * r)} />; })}</g>; })}
			{all.map((f, j) => <circle key={'g' + j} cx={f1(f.x)} cy={f1(f.y - f.h * 0.4)} r={f1(f.w * 0.9 + f.h * 0.8)} fill="url(#c1f)" opacity={f1(f.a * (0.85 + 0.15 * nz(t, j)))} />)}
			{/* the moored fleet, close-packed bow to stern (no chains): the fire behind each hull, the hull against it, flames on the decks */}
			{SHIPS.map((s) => <g key={s.id}>
				{s.back.map((f, j) => { const a = abs(s, f, j); return <Blaze key={j} x={a.x} y={a.y} w={a.w} h={a.h} t={t} seed={a.seed} o={a.a} />; })}
				<g fill="#120C0A" color="#120C0A" filter="url(#c1rimS)"><g transform={at(s.x, s.y, s.k, s.flip)}>
					<Ship tiers={s.tiers} win={s.win * amt(s)} sail={s.id === 7 ? 1 - sink * 0.85 : s.sail ?? 1} mast={s.id === 7 ? -fall : 0}
						sailFire={s.id === 7 ? <Blaze x={20} y={-226} w={130} h={155} t={t} seed={77} o={1 - sink * 0.8} lean={-0.2} /> : undefined} />
				</g></g>
				{s.front.map((f, j) => { const a = abs(s, f, j + 5); return <Blaze key={j} x={a.x} y={a.y} w={a.w} h={a.h} t={t} seed={a.seed} o={a.a} />; })}
			</g>)}
			{/* the fire boats, driven in on the wind, and their wakes */}
			{BOATS.map((b) => { const X = bx(b), F = boatFire(b); return <g key={b.s}>
				<path d={`M${f1(X + 76 * b.k)},${f1(b.y + 2)} L${f1(X + 300 * b.k)},${f1(b.y - 3)} L${f1(X + 300 * b.k)},${f1(b.y + 7)} Z`} fill="#E8A060" opacity={b.v ? 0.28 : 0} filter="url(#c1b2)" />
				<g fill="#140C08" color="#140C08" filter="url(#c1rimS)"><g transform={at(X, b.y, b.k)}><FireBoat /></g></g>
				<Blaze x={F.x} y={F.y} w={F.w} h={F.h} t={t} seed={F.seed} lean={-0.42} /></g>; })}
		</g>
		{/* embers drifting up and to the left across the frame */}
		<g transform={L(0.7)}>{Array.from({length: 70}, (_, i) => { const life = 2.6 + rnd(i, 81) * 2, a = ((t + rnd(i, 82) * 10) / life) % 1, x0 = 820 + rnd(i, 83) * 1100, y0 = 640 - rnd(i, 84) * 60;
			const x = x0 - a * (260 + rnd(i, 85) * 300) + Math.sin(t * 3 + i) * 10, y = y0 - a * (300 + rnd(i, 86) * 260), o = Math.sin(Math.PI * a) * (0.5 + 0.5 * rnd(i, 87));
			return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(1.2 + rnd(i, 88) * 2.2)} fill={i % 4 ? '#FFB860' : '#FFE0A0'} opacity={f1(o)} />; })}</g>
		{/* P3 the north shore: two of his guards, and 曹操 (54) watching his own fleet burn */}
		<g transform={L(1)}>
			<path d="M-200,1180 L-200,978 C60,964 340,968 560,986 C780,1004 1000,1040 1220,1180 Z" fill="url(#c1shore)" />
			<path d="M-200,978 C60,964 340,968 560,986 C780,1004 1000,1040 1220,1180" fill="none" stroke="#F08A40" strokeOpacity={0.35} strokeWidth={2.4} />
			{Array.from({length: 22}, (_, i) => { const x = -60 + i * 52 + rnd(i, 91) * 30, y = 974 + (x > 560 ? (x - 560) * 0.16 : 0) + rnd(i, 92) * 8, b = Math.sin(t * 2.2 + i * 0.8) * 4;
				return <path key={i} d={`M${f1(x)},${f1(y)} q${f1(-6 + b)},-24 ${f1(-10 + b * 2)},-46 M${f1(x + 6)},${f1(y)} q${f1(-2 + b)},-18 ${f1(-4 + b * 1.6)},-34`} fill="none" stroke="#120C09" strokeWidth={2.6} />; })}
			<g fill="#0E0908" filter="url(#c1rimN)">
				<g transform={at(196, 968, 1.7)}><Npc x={0} y={0} k={1} kind="ji" /></g>
				<g transform={at(318, 972, 1.78)}><Npc x={0} y={0} k={1} kind="ji" /></g>
			</g>
			<ellipse cx={CX - 20} cy={CY + 6} rx={150} ry={12} fill="#050303" opacity={0.6} />
			<g filter="url(#c1hero)"><g transform={at(CX, CY, BS)}><CaoBackLow id="c1c" pal={P54} grey="#8E8880" slack={arm} sink={sinkH} flap={flap} /></g></g>
		</g>
		{/* P4 near reeds, out of focus, swaying, rimmed by the fire; a few big embers close to the lens */}
		<g transform={L(1.35)}>
			<g filter="url(#c1b6)">{Array.from({length: 16}, (_, i) => { const x = 1460 + i * 32 + rnd(i, 95) * 20, h = 160 + rnd(i, 96) * 160, b = Math.sin(t * 1.6 + i * 0.6) * 14;
				return <path key={i} d={`M${f1(x)},1100 Q${f1(x - 10 + b * 0.5)},${f1(1100 - h * 0.5)} ${f1(x - 24 + b)},${f1(1100 - h)}`} fill="none" stroke="#0A0605" strokeWidth={7} />; })}</g>
			<g filter="url(#c1b3)">{Array.from({length: 8}, (_, i) => { const life = 3 + rnd(i, 97) * 2, a = ((t + rnd(i, 98) * 9) / life) % 1, x = 1700 - a * 900 + rnd(i, 99) * 200, y = 820 - a * 600 + rnd(i, 100) * 200;
				return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(3.5 + rnd(i, 101) * 3)} fill="#FFB860" opacity={f1(0.6 * Math.sin(Math.PI * a))} />; })}</g>
		</g>
		<rect width={W} height={H} fill="url(#c1vig)" />
	</Svg>; };

/* ======================================================================================================================
   card 30 · 吾为周文王矣 · 219 · 魏王's hall
   ====================================================================================================================== */
const ROW = (n: number, x0: number, dx: number, seed: number) => Array.from({length: n}, (_, i) => ({x: x0 + i * dx + (rnd(i, seed) - 0.5) * 18, b: 22 + rnd(i, seed + 1) * 8, hb: 10 + rnd(i, seed + 2) * 8, d: rnd(i, seed + 3) * 0.35, i}));
const R1 = ROW(6, 330, 120, 3), R2 = ROW(5, 250, 168, 7), R3 = ROW(4, 280, 232, 11);
export const Wenwang: React.FC<{t: number}> = ({t}) => {
	const u = t - T58, v = cl01(u / 4), z = 1 + 0.055 * v, dx = -40 * v;
	const L = (p: number) => lay(dx, 0, z, p, 1300, 600);
	const S = 0.6, CX = 1440, CY = 792;
	/* the petition: the rows bow deeper (a wave, back row first), then hold with a breath */
	const bowOf = (r: {b: number; d: number; i: number}, row: number) => r.b + 16 * sstep(T58 + 0.05 + r.d + row * 0.12, T58 + 0.85 + r.d + row * 0.12, t) + 1.2 * Math.sin(t * 1.6 + r.i + row);
	/* 曹操 raises his hand and waves it away, then lowers it; his eyes go from the kneeling men to 曹丕 */
	const up = sstep(T58 + 0.45, T58 + 1.15, t), push = sstep(T58 + 1.15, T58 + 1.75, t), down = sstep(T58 + 2.4, T58 + 3.3, t);
	const REST: [P, P] = [[26, 206], [60, 262]], RAISE: [P, P] = [[82, 142], [168, 74]], PUSH: [P, P] = [[96, 172], [204, 150]];
	const el = lp(lp(lp(REST[0], RAISE[0], up), PUSH[0], push), REST[0], down), hd = lp(lp(lp(REST[1], RAISE[1], up), PUSH[1], push), REST[1], down);
	const look = sstep(T58 + 1.85, T58 + 2.75, t), head = 11 - 13 * look + 0.5 * Math.sin(t * 1.3), sw = Math.sin(t * 2.2) * 1.5 + (up - down) * 4;
	const P65: Pal = {...PAL, robe: '#1E1C22', robeS: '#0E0D11', robeH: '#57525E', trim: '#7A2A20', skin: '#BC8A64', skinS: '#8E6448', skinH: '#ECC294', gold: '#C9A458'};
	const fA = flick(t, 5), fB = flick(t, 9);
	return <Svg>
		<defs>
			<linearGradient id="w1wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#140E0B" /><stop offset="0.6" stopColor="#2A1D16" /><stop offset="1" stopColor="#36261C" /></linearGradient>
			<radialGradient id="w1la" cx="1150" cy="440" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F2C88A" stopOpacity="0.42" /><stop offset="0.3" stopColor="#D8A468" stopOpacity="0.18" /><stop offset="1" stopColor="#D8A468" stopOpacity="0" /></radialGradient>
			<radialGradient id="w1lb" cx="480" cy="520" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F2C88A" stopOpacity="0.32" /><stop offset="0.35" stopColor="#D8A468" stopOpacity="0.12" /><stop offset="1" stopColor="#D8A468" stopOpacity="0" /></radialGradient>
			<linearGradient id="w1floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#30221A" /><stop offset="0.4" stopColor="#1E1510" /><stop offset="1" stopColor="#0C0806" /></linearGradient>
			<radialGradient id="w1pool" cx="1000" cy="860" r="700" gradientUnits="userSpaceOnUse" gradientTransform="translate(1000 860) scale(1 0.3) translate(-1000 -860)"><stop offset="0" stopColor="#F2C88A" stopOpacity="0.22" /><stop offset="1" stopColor="#F2C88A" stopOpacity="0" /></radialGradient>
			<radialGradient id="w1vig" cx="0.55" cy="0.5" r="0.76"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
			<Blur id="w1b2" s={2} /><Blur id="w1b16" s={16} /><Blur id="w1b8" s={8} />
			<RimF id="w1rimK" lx={1} ly={-0.6} k={1.8} c="#F0B87A" o={0.75} />
			<RimF id="w1rimP" lx={1} ly={-0.4} k={2.4} c="#F6C68A" o={0.9} lx2={-0.6} ly2={-0.8} k2={1.4} c2="#F6C68A" o2={0.45} />
			<RimF id="w1hero" lx={-1} ly={-0.4} k={4.6} c="#F8CC90" o={0.95} lx2={1} ly2={-0.2} k2={3.6} c2={ACC} o2={0.9} blur={1} />
			<clipPath id="w1body"><rect x={-400} y={52} width={900} height={800} /></clipPath>
		</defs>
		{/* P0 the hall: back wall, beams and 斗拱, red pillars, curtains; the dais with its screen and the empty seat */}
		<g transform={L(0.55)}>
			<rect x={-300} y={-300} width={W + 600} height={1080} fill="url(#w1wall)" />
			<rect x={-300} y={-300} width={W + 600} height={1080} fill="url(#w1la)" opacity={f1(0.9 + 0.1 * fA.s)} />
			<rect x={-300} y={-300} width={W + 600} height={1080} fill="url(#w1lb)" opacity={f1(0.9 + 0.1 * fB.s)} />
			<rect x={-300} y={-300} width={W + 600} height={360} fill="#0E0907" />
			{Array.from({length: 26}, (_, i) => <g key={i} fill="#0E0907"><rect x={-200 + i * 96} y={56} width={36} height={22} /><rect x={-216 + i * 96} y={76} width={68} height={12} /><rect x={-206 + i * 96} y={50} width={48} height={8} /></g>)}
			<rect x={-300} y={88} width={W + 600} height={16} fill="#1A110D" /><rect x={-300} y={102} width={W + 600} height={3} fill="#F0B87A" opacity={0.14} />
			{[60, 640, 1180, 1880].map((x) => <g key={x}><rect x={x} y={100} width={58} height={640} fill="#3E1712" /><rect x={x + (x < 1150 ? 46 : 0)} y={100} width={12} height={640} fill="#F0B87A" opacity={0.2} /><rect x={x - 8} y={724} width={74} height={20} fill="#1A110D" /></g>)}
			{[60, 640, 1180].map((x, j) => { const s = Math.sin(t * 0.8 + j) * 3; return <g key={x} fill="#2E120E">
				<path d={`M${x + 58},104 C${x + 70},200 ${x + 90},320 ${x + 100},400 C${x + 104},480 ${x + 90 + s},600 ${x + 82 + s},740 L${x + 58},740 Z`} />
				<path d={`M${x + 88},392 L${x + 104},392 L${x + 104},406 L${x + 86},406 Z`} fill="#6A4A2A" /></g>; })}
			<path d={`M-300,104 L2220,104 L2220,126 ${Array.from({length: 32}, (_, i) => `Q${-260 + i * 80},${148 + (i % 2) * 4} ${-220 + i * 80},126`).join(' ')} L-300,126 Z`} fill="#2C120E" />
			{/* the dais: steps, the screen (black lacquer, red border, cloud curls), the empty seat with its armrest */}
			<path d="M1210,740 L2220,740 L2220,792 L1196,792 Z" fill="#2A1E17" />
			<rect x={1196} y={792} width={1024} height={70} fill="#1A110D" /><rect x={1196} y={792} width={1024} height={6} fill="#5A2018" />
			<path d="M1196,792 L2220,792" stroke="#F0B87A" strokeOpacity={0.3} strokeWidth={2} />
			{[0, 1].map((i) => <rect key={i} x={1120 + i * 40} y={862 - (i + 1) * 35} width={90 - i * 40} height={(i + 1) * 35} fill={i ? '#22180F' : '#1E150E'} />)}
			<rect x={1280} y={300} width={600} height={440} fill="#120C0A" />
			{[0, 1, 2, 3].map((i) => <g key={i}><rect x={1280 + i * 150} y={300} width={150} height={440} fill="none" stroke="#6A241C" strokeWidth={6} />
				<path d={`M${1306 + i * 150},${410} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12 M${1322 + i * 150},${560} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12`} fill="none" stroke="#9A5434" strokeOpacity={0.4} strokeWidth={3} /></g>)}
			<rect x={1280} y={300} width={600} height={4} fill="#F0B87A" opacity={0.25} />
			<g fill="#1C130E"><rect x={1500} y={690} width={330} height={24} /><rect x={1506} y={714} width={16} height={28} /><rect x={1808} y={714} width={16} height={28} /><path d="M1520,690 C1528,664 1570,660 1620,664 L1630,690 Z" /><rect x={1760} y={656} width={10} height={34} /><rect x={1726} y={650} width={78} height={8} /></g>
			<path d="M1500,690 L1830,690" stroke="#F0B87A" strokeOpacity={0.35} strokeWidth={2} />
			<rect x={-300} y={740} width={W + 600} height={600} fill="url(#w1floor)" />
			{Array.from({length: 9}, (_, i) => <path key={i} d={`M-300,${f1(748 + i * i * 5 + i * 12)} L2220,${f1(748 + i * i * 5 + i * 12)}`} stroke="#000" strokeOpacity={0.22} strokeWidth={1.4} />)}
			<rect x={-300} y={740} width={W + 600} height={300} fill="url(#w1pool)" />
		</g>
		{/* the lamps (the keys): one before the dais, one by 曹丕 */}
		<g transform={L(0.8)}>
			{[[1110, 812, 1.55, fA, 5], [470, 780, 1.4, fB, 9]].map(([x, y, k, F, sd]) => { const X = x as number, Y = y as number, K = k as number, Fl = F as {s: number};
				return <g key={X}><ellipse cx={X} cy={Y} rx={150} ry={16} fill="#F3C88A" opacity={f1(0.14 * Fl.s)} />
					<path transform={`translate(${X},${Y}) scale(${K})`} d="M-14,0 C-12,-4 -6,-6 -2.4,-7 L-1.6,-110 L-9,-112 C-9,-115 -4,-117 0,-117 C4,-117 9,-115 9,-112 L1.6,-110 L2.4,-7 C6,-6 12,-4 14,0 Z" fill="#140D0A" />
					<Flame x={X} y={Y - 117 * K} s={K} t={t} seed={sd as number} glow={1.2} /></g>; })}
		</g>
		{/* 曹丕, standing apart in the lamplight by the pillar, facing his father */}
		<g transform={L(0.78)} fill="#16100D" filter="url(#w1rimP)">
			<g transform={`translate(330,772) rotate(${f1(-1.5 * sstep(T58 + 2.6, T58 + 3.4, t))} 0 -90)`}><Npc x={0} y={0} k={1.62} kind="plain" long /><g transform="scale(1.62)"><path d={JX} /></g></g>
		</g>
		{/* the officials kneeling in rows, bowing their petition toward the dais */}
		<g transform={L(0.85)} fill="#1C1512" filter="url(#w1rimK)">{R1.map((r) => <g key={r.i} transform={at(r.x, 826, 1.12)}><Kneeler bow={bowOf(r, 0)} hb={r.hb} /></g>)}</g>
		<g transform={L(0.92)} fill="#161010" filter="url(#w1rimK)">{R2.map((r) => <g key={r.i} transform={at(r.x, 906, 1.5)}><Kneeler bow={bowOf(r, 1)} hb={r.hb} /></g>)}</g>
		<g transform={L(1)}>
			<g fill="#120C0A" filter="url(#w1rimK)">{R3.map((r) => <g key={r.i} transform={at(r.x, 1010, 2.0)}><Kneeler bow={bowOf(r, 2)} hb={r.hb + 4} /></g>)}</g>
			{/* 曹操 (65, 魏王: 冕, 玄衣 with 纁 trim) on the dais, facing the hall */}
			<ellipse cx={CX} cy={CY + 3} rx={110} ry={9} fill="#050303" opacity={0.6} />
			<g filter="url(#w1hero)"><g transform={atC(CX, CY, S, true)}>
				<g clipPath="url(#w1body)"><Cao pal={P65} id="w1c" old={false} armour={false} dao={false} arm={{sh: [10, 86], el, hd}} /></g>
				<g transform={`translate(0,49) rotate(${f1(head)} 0 -8) scale(0.88) translate(0,-40)`}><AgedHead pal={P65} id="w1h" grey="#C4BEB2" cap="mian" sw={sw} /></g>
			</g></g>
		</g>
		{/* P3 a near pillar out of focus */}
		<g transform={L(1.3)} filter="url(#w1b16)"><rect x={1960} y={-100} width={140} height={1300} fill="#0A0605" /><path d="M1960,-100 C1920,0 1910,200 1940,420 L1960,420 Z" fill="#200C0A" /></g>
		<rect width={W} height={H} fill="url(#w1vig)" />
	</Svg>; };

/* ======================================================================================================================
   card 31 · 洛阳 220 (K8 brought to life) and the end card: one room, one camera; lamp = 1 lit … 0 out
   ====================================================================================================================== */
const FY = 900, KK = 4.1, RCX = 820, LX = 1330, LY = 896, LK = 4.0, FLY = LY - 117 * LK;
const STAND = 'M-14,0 C-12,-4 -6,-6 -2.4,-7 L-1.6,-110 L-9,-112 C-9,-115 -4,-117 0,-117 C4,-117 9,-115 9,-112 L1.6,-110 L2.4,-7 C6,-6 12,-4 14,0 Z';
/** the writing: stroke phase φ(t) with a rate that slows from 3 Hz to rest at 123.3 */
const rate = (t: number) => t < T60 ? 3 : t > 123.3 ? 0 : 3 * Math.pow(1 - (t - T60) / (123.3 - T60), 1.4);
const phase = (t: number) => { let p = 0; const n = 60, a = T60, b = Math.min(t, 123.3); for (let i = 0; i < n; i++) { const x = a + (b - a) * (i + 0.5) / n; p += rate(x) * (b - a) / n; } return Math.max(0, p); };
/** a rim-only filter (the cool moonlight edge on a figure that is otherwise in the dark) */
const RimOnly: React.FC<{id: string; lx: number; ly: number; k: number; c: string; o: number}> = ({id, lx, ly, k, c, o}) => <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
	<feOffset in="SourceAlpha" dx={-lx * k} dy={-ly * k} result="o1" /><feComposite in="SourceAlpha" in2="o1" operator="out" result="e1" /><feGaussianBlur in="e1" stdDeviation={0.9} result="b1" />
	<feFlood floodColor={c} floodOpacity={o} result="c1" /><feComposite in="c1" in2="b1" operator="in" result="r1" /><feComposite in="r1" in2="SourceAlpha" operator="in" /></filter>;
const Room: React.FC<{t: number; lamp: number; out: number}> = ({t, lamp, out}) => {
	const zz = 0.13 * Math.pow(cl01((t - T60) / (FILM_LEN - T60)), 0.8), cam = {z: zz, fx: 1040, fy: 640, px: -70 * cl01((t - T60) / (FILM_LEN - T60))};
	const Lp = (p: number) => { const s = 1 + cam.z * (0.3 + 0.7 * p); return `translate(${f1(cam.fx + cam.px * (0.3 + 0.7 * p))},${cam.fy}) scale(${s.toFixed(5)}) translate(${-cam.fx},${-cam.fy})`; };
	const F = flick(t, 3), g = lamp, ph = phase(t), wr = rate(t) / 3, rest = sstep(123.1, 123.7, t);
	/* the brush: short strokes down a slip, lifting between them; the column drifts along the slips; at rest it lowers onto the slip */
	const hand: P = [0.6 * ph * 0.22 + 0.25 * Math.sin(Math.PI * 2 * ph) * wr, -0.9 * Math.abs(Math.sin(Math.PI * ph)) * wr + 0.7 * rest];
	const tilt = 14 + 3.5 * sstep(122.6, 123.9, t) + 0.4 * Math.sin(t * 1.1);
	const marks = Math.min(14, 9 + Math.floor(ph / 2.6));
	const shk = 1 + 0.025 * (F.s - 1) * 4 * g, shx = (F.w * 3) * g;
	return <Svg>
		<defs>
			<radialGradient id="k8lamp" cx={LX} cy={FLY - 8} r="1200" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.55" /><stop offset="0.18" stopColor="#E9CB98" stopOpacity="0.3" /><stop offset="0.55" stopColor="#B08A64" stopOpacity="0.08" /><stop offset="1" stopColor="#B08A64" stopOpacity="0" /></radialGradient>
			<linearGradient id="k8wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#241D19" /><stop offset="1" stopColor="#3A2F27" /></linearGradient>
			<linearGradient id="k8floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2D23" /><stop offset="1" stopColor="#15100C" /></linearGradient>
			<linearGradient id="k8win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2C4248" /><stop offset="1" stopColor="#5F716A" /></linearGradient>
			<linearGradient id="k8beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9FB8B6" stopOpacity="0.2" /><stop offset="1" stopColor="#9FB8B6" stopOpacity="0" /></linearGradient>
			<linearGradient id="k8beam2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#A8C4C6" stopOpacity="0.42" /><stop offset="1" stopColor="#A8C4C6" stopOpacity="0" /></linearGradient>
			<radialGradient id="k8pool" cx={LX - 120} cy="930" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.3" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient>
			<radialGradient id="k8vig" cx="0.56" cy="0.52" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
			<Blur id="k8b10" s={14} /><Blur id="k8b5" s={5} /><Blur id="k8b25" s={2.5} /><Blur id="k8b15" s={1.5} />
			<radialGradient id="k8wash" cx="1000" cy="460" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#E9CB98" stopOpacity="0.2" /><stop offset="0.6" stopColor="#E9CB98" stopOpacity="0.1" /><stop offset="1" stopColor="#E9CB98" stopOpacity="0" /></radialGradient>
			<RimF id="k8rim" lx={1} ly={-0.3} k={2.4} c="#FFE0B0" o={0.85 * g} />
			<RimF id="k8hero" lx={1} ly={-0.4} k={4} c="#FFE6C0" o={0.95 * g} lx2={-1} ly2={-0.2} k2={3.4} c2={ACC} o2={0.9} blur={0.9} />
			<RimOnly id="k8moon" lx={-1} ly={-0.3} k={3.4} c="#A9D2DA" o={0.9} />
		</defs>
		{/* P0 the back wall (plastered), lit by the lamp's falloff; the timber frame, the window, the curtains, the screen, his shadow */}
		<g transform={Lp(0.6)}>
			<rect x={-200} y={-200} width={W + 400} height={980} fill="url(#k8wall)" />
			<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#k8lamp)" opacity={f1(g * (0.92 + 0.08 * F.s))} />
			<rect x={-200} y={-100} width={W + 400} height={156} fill="#18110D" /><rect x={-200} y={56} width={W + 400} height={22} fill="#221812" />
			<rect x={-200} y={22} width={W + 400} height={26} fill="#3A1A15" opacity={0.85} />
			{Array.from({length: 26}, (_, i) => <path key={i} d={`M${-62 + i * 82},40 c10,-14 26,-14 32,0 c5,10 -8,16 -13,8 M${-24 + i * 82},30 c6,-6 14,-6 18,0`} fill="none" stroke="#9A6A40" strokeOpacity={0.35} strokeWidth={2} />)}<rect x={-200} y={76} width={W + 400} height={3} fill="#E9CB98" opacity={0.12 * g} />
			{[80, 1780].map((x) => <g key={x}><rect x={x} y={56} width={64} height={724} fill="#1C140F" /><rect x={x + (x < 900 ? 52 : 0)} y={56} width={12} height={724} fill="#E9CB98" opacity={(x < 900 ? 0.06 : 0.16) * g} /></g>)}
			<rect x={222} y={316} width={340} height={318} fill="#1A1410" />
			<rect x={236} y={330} width={312} height={290} fill="url(#k8win)" />
			{Array.from({length: 13}, (_, i) => <rect key={i} x={236 + i * 24} y={330} width={7} height={290} fill="#1A1410" />)}
			<rect x={236} y={468} width={312} height={7} fill="#1A1410" />
			<path d="M144,56 C176,200 168,380 196,560 C200,620 186,700 176,780 L144,780 Z" fill="#3A1C17" />
			<path d="M144,56 C160,220 150,420 168,600 L156,780 L144,780 Z" fill="#24110E" />
			<path d="M1780,56 C1740,240 1752,420 1720,600 C1712,680 1722,740 1730,780 L1780,780 Z" fill="#4A2219" />
			<path d="M1752,140 C1740,300 1744,460 1724,620" fill="none" stroke="#2A120E" strokeWidth={6} opacity={0.7} />
			<rect x={560} y={80} width={1300} height={700} fill="url(#k8wash)" opacity={f1(g)} />
			{/* his shadow on the wall: it breathes with the flame */}
			<g transform={`translate(${f1(RCX - 210 + shx)},782) scale(${f1(KK * 1.25 * shk)},${f1(KK * 1.08 * shk)})`} fill="#140C08" color="#140C08" opacity={f1(0.6 * g)} filter="url(#k8b25)"><CaoSeatedShadow /></g>
			<g>
				<rect x={1440} y={452} width={300} height={330} fill="#17110E" />
				{[0, 1].map((i) => <g key={i}><rect x={1440 + i * 150} y={452} width={150} height={330} fill="none" stroke="#5A2420" strokeWidth={6} />
					<path d={`M${1466 + i * 150},${540} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12 M${1480 + i * 150},${660} c14,-18 34,-18 44,0 c8,14 -10,24 -18,12`} fill="none" stroke="#8A4430" strokeOpacity={0.45} strokeWidth={3} /></g>)}
				<rect x={1440} y={452} width={300} height={330} fill="url(#k8lamp)" opacity={0.5 * g} />
				{[1456, 1724].map((x) => <rect key={x} x={x - 8} y={780} width={16} height={16} fill="#100B08" />)}
			</g>
		</g>
		{/* P2 the floor, the mat, the lamp's pool; the desk with the slips; the lamp */}
		<g transform={Lp(0.88)}>
			<rect x={-200} y={780} width={W + 400} height={500} fill="url(#k8floor)" />
			{Array.from({length: 7}, (_, i) => <path key={i} d={`M-200,${800 + i * i * 6 + i * 14} L${W + 200},${800 + i * i * 6 + i * 14}`} stroke="#000" strokeOpacity={0.2} strokeWidth={1.5} />)}
			<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#k8pool)" opacity={f1(g * (0.9 + 0.1 * F.s))} />
			<path d={`M600,${FY - 22} L1180,${FY - 22} L1210,${FY} L570,${FY} Z`} fill="#4E4030" />
			{Array.from({length: 30}, (_, i) => <path key={i} d={`M${600 + i * 19.6},${FY - 22} L${570 + i * 21.3},${FY}`} stroke="#2A2018" strokeOpacity={0.5} strokeWidth={1.2} />)}
			<rect x={570} y={FY} width={640} height={7} fill="#2A2018" />
			<g>
				<path d={`M${RCX + 22 * KK},${FY - 33 * KK} L${RCX + 106 * KK},${FY - 33 * KK} L${RCX + 110 * KK},${FY - 30 * KK} L${RCX + 20 * KK},${FY - 30 * KK} Z`} fill="#5A3A26" />
				<path d={`M${RCX + 22 * KK},${FY - 33 * KK} L${RCX + 106 * KK},${FY - 33 * KK} L${RCX + 100 * KK},${FY - 39 * KK} L${RCX + 28 * KK},${FY - 39 * KK} Z`} fill="#6E4A30" />
				<rect x={RCX + 20 * KK} y={FY - 30 * KK} width={90 * KK} height={3.4 * KK} fill="#2A1A10" />
				<rect x={RCX + 20 * KK} y={FY - 30 * KK} width={90 * KK} height={0.8 * KK} fill="#F3DDB4" opacity={0.25 * g} />
				{[[25, -1], [104, 1]].map(([x, f]) => <path key={x} d={`M${RCX + (x - 2.2) * KK},${FY - 27 * KK} L${RCX + (x + 2.2) * KK},${FY - 27 * KK} C${RCX + (x + 2) * KK},${FY - 14 * KK} ${RCX + (x + 1.6 + f) * KK},${FY - 6 * KK} ${RCX + (x + 2.6 + f * 2) * KK},${FY - 1.4 * KK} L${RCX + (x + 2.6 + f * 2) * KK},${FY} L${RCX + (x - 2.4 + f * 1.4) * KK},${FY} L${RCX + (x - 1.4 + f) * KK},${FY - 2 * KK} C${RCX + (x - 1.6) * KK},${FY - 8 * KK} ${RCX + (x - 2) * KK},${FY - 16 * KK} ${RCX + (x - 2.2) * KK},${FY - 27 * KK} Z`} fill="#24170F" />)}
				{Array.from({length: 24}, (_, i) => { const x0 = RCX + (34 + i * 2.1) * KK; return <path key={i} d={`M${x0},${FY - 33.4 * KK} L${x0 + 2.5 * KK},${FY - 38.6 * KK} L${x0 + 4.3 * KK},${FY - 38.6 * KK} L${x0 + 1.8 * KK},${FY - 33.4 * KK} Z`} fill={i % 2 ? '#CDB88A' : '#BCA676'} />; })}
				<path d={`M${RCX + 34 * KK},${FY - 35 * KK} L${RCX + 85 * KK},${FY - 35 * KK} M${RCX + 35 * KK},${FY - 37.2 * KK} L${RCX + 86 * KK},${FY - 37.2 * KK}`} stroke="#5A3A26" strokeWidth={0.5 * KK} />
				{/* the columns written so far (more appear as he writes) */}
				{Array.from({length: 14}, (_, i) => { const x0 = RCX + (36 + i * 2.1) * KK; return <path key={i} d={`M${x0 + 1.4 * KK},${FY - 34.4 * KK} L${x0 + 2.4 * KK},${FY - 36.4 * KK} M${x0 + 2.6 * KK},${FY - 36.8 * KK} L${x0 + 3.2 * KK},${FY - 38 * KK}`} stroke="#2A1A10" strokeWidth={0.45 * KK} opacity={i < marks ? 0.75 : 0} />; })}
				<circle cx={RCX + 93 * KK} cy={FY - 40.6 * KK} r={6.4 * KK} fill="#B49E70" />
				<path d={`M${RCX + 93 * KK},${FY - 40.6 * KK} m${-1 * KK},0 a${1 * KK},${1 * KK} 0 1 1 ${2 * KK},0 a${2.2 * KK},${2.2 * KK} 0 1 1 ${-4.4 * KK},0 a${3.4 * KK},${3.4 * KK} 0 1 1 ${6.8 * KK},0 a${4.6 * KK},${4.6 * KK} 0 1 1 ${-9.2 * KK},0 a${5.8 * KK},${5.8 * KK} 0 1 1 ${11.6 * KK},0`} fill="none" stroke="#6E5638" strokeWidth={0.5 * KK} />
				<path d={`M${RCX + 99.4 * KK},${FY - 40.6 * KK} A${6.4 * KK},${6.4 * KK} 0 0 1 ${RCX + 93 * KK},${FY - 34.2 * KK}`} fill="none" stroke="#F3DDB4" strokeOpacity={0.5 * g} strokeWidth={0.6 * KK} />
				<rect x={RCX + 20.5 * KK} y={FY - 35.6 * KK} width={10 * KK} height={2.4 * KK} fill="#141416" /><rect x={RCX + 20.5 * KK} y={FY - 35.6 * KK} width={10 * KK} height={0.5 * KK} fill="#8A8A86" opacity={0.6} />
				<rect x={RCX + 23 * KK} y={FY - 37.6 * KK} width={2.6 * KK} height={2 * KK} fill="#2A2A2C" />
			</g>
			<g filter="url(#k8rim)"><path transform={`translate(${LX},${LY}) scale(${LK})`} d={STAND} fill="#140D0A" /></g>
			{g > 0.001 && <Flame x={LX} y={FLY} s={2.15 * (0.55 + 0.45 * g)} t={t} seed={3} glow={2.2 * g} ivory />}
		</g>
		{/* P3 曹操 at 66, kneeling, writing */}
		<g transform={Lp(1)}>
			<g filter="url(#k8hero)"><g transform={at(RCX, FY - 22 * 0.2, KK)}><CaoSeated id="k8c" tilt={tilt} hand={hand} /></g></g>
		</g>
		{/* the lamp out: the room falls to the cold moonlight from the window */}
		{out > 0 && <g opacity={f1(out)}>
			<rect width={W} height={H} fill="#060A0D" opacity={0.62} />
			<g transform={Lp(0.6)}>
				<rect x={236} y={330} width={312} height={290} fill="url(#k8win)" />
				{Array.from({length: 13}, (_, i) => <rect key={i} x={236 + i * 24} y={330} width={7} height={290} fill="#121012" />)}
				<rect x={236} y={468} width={312} height={7} fill="#121012" />
			</g>
			<g transform={Lp(0.88)}><path d="M236,640 L548,640 L800,1080 L360,1080 Z" fill="url(#k8beam2)" filter="url(#k8b5)" /></g>
			<g transform={Lp(1)}><g filter="url(#k8moon)"><g transform={at(RCX, FY - 22 * 0.2, KK)}><CaoSeated id="k8m" tilt={tilt} hand={hand} /></g></g></g>
			<g transform={Lp(0.88)}><g filter="url(#k8moon)"><path transform={`translate(${LX},${LY}) scale(${LK})`} d={STAND} fill="#140D0A" /></g></g>
			{/* the last thread of smoke from the wick */}
			{(() => { const a = t - END_T, n = 26, top = Math.min(1, a / 1.6); const pts = Array.from({length: n}, (_, i) => { const r = (i / (n - 1)) * top, y = FLY - 4 - r * 300, x = LX + Math.sin(r * 7 - a * 1.8) * 18 * r + r * r * -40; return f1(x) + ',' + f1(y); });
				return <g transform={Lp(0.88)}><polyline points={pts.join(' ')} fill="none" stroke="#B8C6C8" strokeWidth={2.4} strokeLinecap="round" opacity={f1(0.55 * (1 - sstep(1.5, 4.5, a)))} filter="url(#k8b15)" /></g>; })()}
		</g>}
		{/* P4 the near edge: a dark post out of focus at the right */}
		<g transform={Lp(1.3)} filter="url(#k8b10)" fill="#0A0605"><rect x={1880} y={-120} width={90} height={1320} /></g>
		<rect width={W} height={H} fill="url(#k8vig)" />
	</Svg>; };
/** the lamp: lit, flickering harder from 122.4, guttering low in the last half second; out at END_T (the first frame of End) */
const lampAt = (t: number) => { const F = flick(t * 1.7, 11), gut = sstep(122.4, 123.6, t), low = sstep(123.45, 124.0, t);
	return Math.max(0.15, 1 - gut * 0.22 * (1 + (F.s - 1) * 6) * (0.6 + 0.4 * Math.sin(t * 9.1)) - 0.45 * low + 0.12 * low * Math.sin(t * 31)); };
export const Death: React.FC<{t: number}> = ({t}) => <Room t={t} lamp={cl01(lampAt(t))} out={0} />;

/* ---------- the end card (house style, after end53d3's EndCard3): seal, title, question, pill, sources; fade to black ---------- */
const TITLE: [string, string] = ['曹操', '到底是英雄，还是奸雄？'];
const QUESTION = '看完他的一生，你说，他是英雄，还是奸雄？';
const SOURCES = '《三国志》武帝纪、荀彧传、曹洪传、袁绍传 · 裴松之注引《曹瞒传》《魏书》《杂记》《献帝传》《魏氏春秋》 · 曹操《蒿里行》《龟虽寿》';
const LAST = (Math.round(FILM_LEN * 30) - 1) / 30;
const fade = (t: number, a: number, d = 0.4) => seg(t, a, a + d);
export const End: React.FC<{t: number}> = ({t}) => {
	const T0 = END_T, f = Math.round(t * 30), f0 = Math.ceil(T0 * 30 + 1e-6), fs = 76, tw = fs * QUESTION.length * 1.03;
	const fSeal = f0 + 8, dim = 0.7 * seg(t, T0 + 0.12, T0 + 0.6);
	const title = fade(t, T0 + 0.6), qq = fade(t, T0 + 0.95), pill = t >= T0 + 1.45 ? land(seg(t, T0 + 1.45, T0 + 1.85)) : 0, src = fade(t, T0 + 1.55);
	const jolt = f >= fSeal && f - fSeal < 18 ? 1 + 0.045 * Math.exp(-(f - fSeal) / 5) * Math.cos(2 * Math.PI * (f - fSeal) / 8) : 1;
	return <div style={{position: 'absolute', inset: 0, background: '#000'}}>
		<Room t={t} lamp={0} out={1} />
		<div style={{position: 'absolute', inset: 0, background: `rgba(8,4,3,${dim.toFixed(3)})`}} />
		{f >= fSeal && <Img src={SEAL_SRC} style={{position: 'absolute', left: 960 - 70, top: 120, width: 140, height: 140, transform: `rotate(-6deg) scale(${jolt})`, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />}
		<div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, lineHeight: 1.35, letterSpacing: '0.05em', color: B.gold, textShadow: thB.halo, whiteSpace: 'nowrap', opacity: title}}>
			{TITLE[0].slice(0, -1)}<span style={{marginRight: '-0.05em'}}>{TITLE[0].slice(-1)}</span><br />{TITLE[1].slice(0, -1)}<span style={{marginRight: '-0.55em'}}>{TITLE[1].slice(-1)}</span></div>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 260, top: 560 - 150, width: tw + 520, height: fs * 1.5 + 300, opacity: qq, background: 'radial-gradient(closest-side, rgba(16,7,4,0.42), rgba(16,7,4,0.36) 45%, rgba(16,7,4,0.15) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 560 + 10 * (1 - qq), opacity: qq, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.5, letterSpacing: '0.03em', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>{QUESTION.slice(0, -1)}<span style={{marginRight: '-0.53em'}}>{QUESTION.slice(-1)}</span></div>
		{pill > 0 && <div style={{position: 'absolute', left: 760, top: 742, width: 400, height: 58, borderRadius: 29, border: `2px solid ${B.gold}`, background: 'rgba(255,217,138,0.08)', textAlign: 'center', lineHeight: '58px', fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color: B.gold, opacity: cl01(pill * 2), transform: `scale(${lerp(0.9, 1, pill)})`}}>关注 Juno · 一起看懂世界</div>}
		<div style={{position: 'absolute', left: SAFE_X, right: SAFE_X, top: 868, textAlign: 'center', fontFamily: SANS, fontSize: 24, lineHeight: 1.6, color: '#D8CCB6', opacity: 0.88 * src, whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}>{SOURCES}</div>
		<div style={{position: 'absolute', inset: 0, background: '#000', opacity: seg(t, LAST - 0.5, LAST - 0.001)}} />
	</div>; };
void T56;
