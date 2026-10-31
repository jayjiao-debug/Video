import React from 'react';
import {W, H} from '../qq50/kit50';
import {Cao, RimF, Lamel, P, rnd, f1} from './cao54b';
import {Npc, HEAD, NECK} from './npc54b';
import {NpcWalk, npcWalk, Flame} from './rig54b';
import {SIL, ACC, PAL, Banner, GateTower, Tower, Rider, Trebuchet, Puller, limb, Limb} from './set54bs';
import {Pl, Cam, ease} from './scenes54bs';
import {Helmet, npcTorsoT} from './fig54n';
/* ep54 full film · section C part 2, cards 18–21 (film 68.38–84.32), look B (铜灯影 · 主角刻画). t = film time (s).
   Lvbu   = card 18 (BAR 34–36, 198 下邳): grey morning; the city stands in the flood (泗水 and 沂水 turned on it); 吕布, bound, kneels
            below the 白门楼; he heaves against the rope, the guard hauls him back on the downbeat; 曹操 (44) lifts his hand: the verdict.
   Rival  = card 19 (BAR 36–38, 199 邺): 袁绍 enthroned in his hall between two lamp trees, 袁 banners and armoured guards; slow push.
   Army   = card 20 (BAR 38–40, 199): 袁绍's army marching south at dusk: columns over the plain and through a ford, cavalry on the
            flanks, dust; the camera trucks against the march.
   Duizhi = card 21 (BAR 40–42, 200 官渡): the establishing wide at dusk, earlier and higher than K5 (which follows at 84.32):
            曹操's small camp on the left, 袁绍's vast camp on the right, the 土山 rising and a 高橹 being built; 曹操 small on his rampart.
   Overlay zones kept calm: subtitles x 150–1150 / y 90–300, stamp x 1200–1800 / y 30–200, counter x 150–460 / y 900–1010, seal. */
const BAR = (n: number) => 0.654 + 1.99203 * n;
const B34 = BAR(34), B36 = BAR(36), B38 = BAR(38), B40 = BAR(40), B42 = BAR(42);
const cl = (v: number) => Math.max(0, Math.min(1, v));
const ss = (a: number, b: number, v: number) => { const u = cl((v - a) / (b - a)); return u * u * (3 - 2 * u); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lp = (a: P, b: P, u: number): P => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const rot = (p: P, c: P, deg: number): P => { const a = deg * Math.PI / 180, x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)]; };
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>{children}</svg>;
const Blur: React.FC<{id: string; s: number}> = ({id, s}) => <filter id={id} x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation={s} /></filter>;
const at = (x: number, y: number, k: number, flip?: boolean) => `translate(${f1(x)},${f1(y)}) scale(${flip ? -k : k},${k})`;
const ARM_HILT = {sh: [10, 84] as P, el: [22, 200] as P, hd: [54, 266] as P};

/* =============================== card 18 · 198 下邳 · 白门楼 · grey morning =============================== */
const LV_TH = (s: number) => -3 + s * 10;   // upper-body lean (deg; + = forward)
/** a point of 吕布's upper body (NPC cm) → his kneeling frame */
const lvPt = (p: P, s: number): P => { const a = LV_TH(s) * Math.PI / 180, x = 1.1 * p[0], y = 1.1 * (p[1] + 92); return [x * Math.cos(a) - y * Math.sin(a), -50 + x * Math.sin(a) + y * Math.cos(a)]; };
const ROPE = '#7C6A4E';
/** 吕布: a big man in 札甲, bare-headed, kneeling with his arms bound behind him; cm, facing +x, knees on y = 0 (above the hips the
    NPC frame at 1.1×); s = strain 0..1 (leans into the rope), hl = head lift (deg) */
const LvBu: React.FC<{s: number; hl: number}> = ({s, hl}) => <g>
	<path d={limb([[-40, -5], [-12, -7], [12, -9]], [4.6, 6.4, 7.6])} />
	<path d="M-53,0 L-41,-10 L-33,-6 L-36,0 Z" />
	<Limb j={[[12, -9], [6, -30], [1, -52]]} w={[8.6, 10.6, 12.6]} />
	<g transform={`rotate(${f1(LV_TH(s))} 0 -50) translate(0,-50) scale(1.1) translate(0,92)`}>
		<path d="M-15,-103 C-18,-90 -20,-76 -21.4,-60 L20.4,-60 C19,-76 17,-90 15,-103 Z" />
		<path d="M-4,-142 C-12,-141 -15.4,-135 -15.4,-126 C-15.4,-114 -14.4,-106 -14,-100 L15,-100 C16,-108 17.6,-119 16.8,-128 C16,-136 11,-141.4 5,-142 Z" />
		<g transform="translate(0.4,0) scale(1.14,1)"><path d={NECK} /></g>
		{/* the near arm wrenched back: the elbow out behind, the wrists tied at the small of the back */}
		<Limb j={[[-1, -134], [-17.5, -114], [-11, -101.5]]} w={[6.6, 5.6, 4.6]} />
		<circle cx={-10} cy={-100.5} r={4.4} />
		<path d="M-9,-142.5 C-1,-146.5 7,-142 8,-135 C6.6,-128 -1,-122.4 -9,-121 C-14.4,-123.4 -15.4,-131 -13.4,-137 Z" />
		{/* the lamellar rows on the skirt, catching a little light */}
		{[-92, -82, -72].map((y) => <path key={y} d={`M${-17 - (y + 92) * 0.12},${y} L${17 + (y + 92) * 0.1},${y + 0.6}`} stroke="#3A3028" strokeWidth={0.9} opacity={0.7} />)}
		<g transform={`rotate(${f1(-hl)} 1 -146)`}>
			<path d={HEAD} />
			{/* bare-headed: the cap is gone, the topknot loosened, strands down the nape; a short beard */}
			<path d="M-7.6,-162.6 C-9.4,-169.6 -6,-174.4 -0.6,-175.2 C4,-175.8 7.6,-174 8.6,-171 C3.4,-172 -1.6,-171 -5,-166.6 Z" />
			<path d="M-4.6,-171.4 C-9.6,-175.4 -7.4,-182.4 -1.2,-181.6 C3.6,-180.8 3.8,-175.6 0,-172.4 Z" />
			<path d="M-7.4,-166 C-12,-160 -13,-152 -11,-144.6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
			<path d="M-6,-163 C-9,-157 -9.4,-150.6 -7.4,-145.6" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" />
			<path d="M3,-150.4 C4.6,-145.6 8.8,-144 12.2,-146.4 L11.8,-150.4 C9,-149.2 6,-149.6 3,-150.4 Z" />
		</g>
		{/* the ropes: two turns round the chest and the arms, the wrists bound */}
		<path d="M-16.4,-126.4 C-4,-129.6 8,-131.4 17.2,-131.6 L17,-128.8 C8,-128.6 -4,-126.8 -16.2,-123.4 Z" fill={ROPE} />
		<path d="M-15.8,-116.4 C-4,-118.4 8,-120.2 16.6,-120.6 L16.4,-117.8 C8,-117.6 -4,-115.8 -15.6,-113.4 Z" fill={ROPE} />
		<path d="M-15,-104.6 L-6.4,-97.2 M-14.4,-99 L-7,-103.4" stroke={ROPE} strokeWidth={1.8} />
	</g>
</g>;
const LB_SOLD: [number, number, boolean][] = [646, 676, 710, 748, 790].flatMap((y) => [[1236 - (y - 612) * 0.786 + 12, y, true], [1324 + (y - 612) * 1.143 - 12, y, false]] as [number, number, boolean][]);
export const Lvbu: React.FC<{t: number}> = ({t}) => {
	const u = (t - B34) / (B36 - B34), e = ease(u), cam: Cam = {z: 0.065 * e, fx: 920, fy: 820, px: -26 * e};
	const kY = (y: number) => 0.00566 * (y - 560);
	/* acting: he heaves against the rope (69.5–70.05) and lifts his head to 曹操; the guard hauls him back on the downbeat (70.38);
	   曹操 lifts his hand from the hilt toward him: the verdict (71.05–71.8) */
	const heave = ss(69.5, 70.05, t) * (1 - ss(70.3, 70.85, t)), haul = ss(70.18, 70.42, t) * (1 - 0.55 * ss(71.0, 72.2, t));
	const s = 0.1 + 0.9 * heave + 0.03 * Math.sin(t * 2.3), hl = -10 + 20 * ss(69.4, 70.0, t) - 3 * ss(71.2, 71.9, t);
	const gest = ss(71.05, 71.8, t);
	const LX = 1190, LY = 996, LK = kY(LY), GX = 1408, GY = 984, GK = kY(GY), gl = 3 + 8 * haul - 6 * heave;
	const wl = lvPt([-11, -101], s), wrist: P = [LX - LK * wl[0], LY + LK * wl[1]];
	const hand = rot([GX - GK * 30, GY - GK * 106], [GX, GY], gl);
	const taut = cl(0.3 + heave + haul), mid: P = [(wrist[0] + hand[0]) / 2, (wrist[1] + hand[1]) / 2 + 30 * (1 - taut)];
	const S = kY(1000) / 4.98, arm = {sh: ARM_HILT.sh, el: lp(ARM_HILT.el, [70, 176], gest), hd: lp(ARM_HILT.hd, [156, 204], gest)};
	const wave = (i: number) => Math.sin(t * 1.6 + i * 1.7) * 4;
	return <Svg>
		<defs>
			<linearGradient id="lbSky" x1="0" y1="0" x2="0" y2="612" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#525a59" /><stop offset="0.45" stopColor="#848680" /><stop offset="0.8" stopColor="#B4AE9E" /><stop offset="1" stopColor="#C8C0AA" /></linearGradient>
			<radialGradient id="lbSun" cx="1592" cy="318" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FBF2DE" stopOpacity="0.75" /><stop offset="0.14" stopColor="#EEE4CC" stopOpacity="0.35" /><stop offset="1" stopColor="#E6DCC4" stopOpacity="0" /></radialGradient>
			<linearGradient id="lbWall" x1="0" y1="424" x2="0" y2="612" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#6C645A" /><stop offset="1" stopColor="#544C43" /></linearGradient>
			<linearGradient id="lbWater" x1="0" y1="612" x2="0" y2="840" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#9E9A8A" /><stop offset="0.45" stopColor="#77756A" /><stop offset="1" stopColor="#56544B" /></linearGradient>
			<linearGradient id="lbBank" x1="0" y1="810" x2="0" y2="1080" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#5E5547" /><stop offset="0.35" stopColor="#433b31" /><stop offset="1" stopColor="#28221c" /></linearGradient>
			<linearGradient id="lbDike" x1="0" y1="612" x2="0" y2="830" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#6A6254" /><stop offset="1" stopColor="#4C443A" /></linearGradient>
			<linearGradient id="lbMist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#DCD6C4" stopOpacity="0" /><stop offset="0.5" stopColor="#DCD6C4" stopOpacity="0.5" /><stop offset="1" stopColor="#DCD6C4" stopOpacity="0" /></linearGradient>
			<radialGradient id="lbVig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.4" /></radialGradient>
			<Blur id="lbB1" s={1} /><Blur id="lbB3" s={3} /><Blur id="lbB8" s={8} />
			<RimF id="lbRimFar" lx={1} ly={-0.5} k={1.2} c="#F4E8D0" o={0.55} />
			<RimF id="lbRim" lx={1} ly={-0.45} k={2.6} c="#F8ECD4" o={0.9} lx2={-0.4} ly2={-1} k2={1.4} c2="#C8CCC4" o2={0.35} />
			<RimF id="lbHero" lx={1} ly={-0.4} k={4.4} c="#FFF2DC" o={0.9} lx2={-1} ly2={-0.2} k2={3.6} c2={ACC} o2={0.9} blur={1} />
			<Lamel pal={PAL} />
		</defs>
		<Pl c={cam} p={0}>
			{/* P0 a grey morning: the sun a pale disc over the gate, thin cloud drifting across it */}
			<rect x={-100} y={-100} width={W + 200} height={760} fill="url(#lbSky)" />
			<rect x={-100} y={-100} width={W + 200} height={760} fill="url(#lbSun)" />
			<circle cx={1592} cy={318} r={30} fill="#FBF4E4" opacity={0.92} />
			<g filter="url(#lbB8)" opacity={0.65}>{[[1420, 300, 260], [1700, 334, 200], [900, 250, 380], [300, 190, 300], [1250, 400, 240]].map(([x, y, w], i) => <ellipse key={i} cx={x - (t - B34) * (3 + i)} cy={y} rx={w} ry={7 + i % 2 * 3} fill={i < 2 ? '#C8C2B0' : '#9C9A8E'} />)}</g>
		</Pl>
		<Pl c={cam} p={0.12}>
			{/* P1 the far hills and the roofs of 下邳 inside the wall, hazed */}
			<path d="M-100,470 C120,430 300,446 480,420 C640,398 760,430 980,416 C1200,402 1400,436 1620,418 C1800,404 1940,426 2040,420 L2040,480 L-100,480 Z" fill="#A29E90" filter="url(#lbB3)" />
			<g fill="#8E8A7E" filter="url(#lbB1)">{[[220, 0.8], [520, 1], [760, 0.7], [1000, 0.9], [1540, 0.8], [1780, 1]].map(([x, s], i) => <path key={i} d={`M${x - 90 * s},440 L${x - 60 * s},${440 - 30 * s} L${x + 60 * s},${440 - 30 * s} L${x + 90 * s},440 Z`} />)}</g>
		</Pl>
		<Pl c={cam} p={0.3}>
			{/* P2 the wall of 下邳 standing in the flood, the gate passage, the 白门楼; 曹 banners on the parapet now */}
			<g fill="#5A544A" filter="url(#lbRimFar)">{Array.from({length: 18}, (_, i) => <Npc key={i} x={-20 + i * 118 + rnd(i, 7) * 30} y={446} k={0.34} kind={i % 2 ? 'ji' : 'plain'} flip={i % 3 === 0} />)}</g>
			<rect x={-100} y={432} width={2120} height={180} fill="url(#lbWall)" />
			{Array.from({length: 12}, (_, i) => <rect key={i} x={-100} y={446 + i * 14} width={2120} height={1.4} fill="#2A241E" opacity={0.18} />)}
			<path d={`M-100,432 ${Array.from({length: 82}, (_, i) => `L${-100 + i * 26},432 L${-100 + i * 26},418 L${-84 + i * 26},418 L${-84 + i * 26},432`).join(' ')} L2020,432 Z`} fill="#5E574C" />
			<rect x={-100} y={430} width={2120} height={3} fill="#D8D0BC" opacity={0.35} />
			<rect x={1232} y={516} width={96} height={96} fill="#26211C" />
			<path d="M1236,520 L1258,526 L1258,612 L1236,612 Z M1324,520 L1302,526 L1302,612 L1324,612 Z" fill="#3A332B" />
			<rect x={1226} y={510} width={108} height={8} fill="#3E362E" />
			<g transform="translate(1280,420) scale(0.84)"><GateTower win={0.06} wall="#4C443A" dark="#2E2822" roof="#3A3C3A" /></g>
			<g fill="#3A322A" filter="url(#lbRimFar)">{[360, 860, 1560, 1860].map((x, i) => <g key={x} transform={at(x, 420, 0.36)}><Banner h={320} w={64} ch="曹" cloth="#6A2E24" clothS="#4A1E18" ink="#E8D8B6" wave={wave(i)} /></g>)}</g>
		</Pl>
		<Pl c={cam} p={0.42}>
			{/* the flood: the wall's reflection, the sun's glitter, drowned trees and reeds, mist moving over the water */}
			<rect x={-100} y={612} width={2120} height={240} fill="url(#lbWater)" />
			<rect x={-100} y={612} width={2120} height={70} fill="#4A443A" opacity={0.42} filter="url(#lbB3)" />
			<rect x={1226} y={612} width={108} height={56} fill="#26211C" opacity={0.5} filter="url(#lbB3)" />
			{Array.from({length: 46}, (_, i) => { const y = 618 + rnd(i, 3) * 210, w = 20 + rnd(i, 4) * 90, x = ((rnd(i, 5) * 2200 + (rnd(i, 6) - 0.5) * 16 * (t - B34)) % 2200) - 140;
				return <rect key={i} x={f1(x)} y={f1(y)} width={f1(w * (0.6 + (y - 612) / 300))} height={1.3} fill="#E8E0CC" opacity={0.18 + 0.12 * Math.sin(t * 1.3 + i)} />; })}
			{Array.from({length: 22}, (_, i) => { const y = 622 + i * 9, w = 10 + 30 * (1 - i / 22) * rnd(i, 9); return <rect key={'g' + i} x={f1(1592 - w / 2 + Math.sin(t * 2.1 + i * 1.3) * 6)} y={y} width={f1(w)} height={1.6} fill="#FFF6E2" opacity={0.25 + 0.3 * Math.max(0, Math.sin(t * 3.1 + i * 2.2))} />; })}
			<g fill="#4A463E" filter="url(#lbB1)">
				{[[300, 652, 0.9], [520, 640, 0.7], [1700, 648, 0.8]].map(([x, y, s], i) => <g key={i} transform={`translate(${x},${y}) scale(${s})`}><path d="M-2,0 L-3,-60 L-14,-84 M-3,-46 L14,-72 M-3,-30 L-20,-44 M10,-66 L18,-78" fill="none" stroke="#4A463E" strokeWidth={3} strokeLinecap="round" /><path d="M-20,2 C-10,-2 10,-2 20,2 Z" fill="#4A463E" opacity={0.5} /></g>)}
			</g>
			<g opacity={0.7}>{[[180, 662, 260], [760, 700, 340], [1500, 676, 300], [1850, 720, 220]].map(([x, y, w], i) => <rect key={i} x={x - w + Math.sin(t * 0.4 + i) * 10 + (t - B34) * 5} y={y - 14} width={w * 2} height={28} fill="url(#lbMist)" />)}</g>
			{/* the dike from the gate to the near bank, 曹 soldiers lining it */}
			<path d="M1236,612 L1324,612 L1580,836 L1060,836 Z" fill="url(#lbDike)" />
			<path d="M1236,612 L1324,612 L1330,618 L1242,618 Z" fill="#D8D0BC" opacity={0.3} />
			<path d="M1324,612 L1580,836 L1600,836 L1334,612 Z" fill="#2E2822" opacity={0.6} />
			<g filter="url(#lbRimFar)">{LB_SOLD.map(([x, y, fl], i) => { const k = kY(y); return <g key={i} fill={y < 700 ? '#3E3830' : '#2A241E'}><Npc x={x} y={y} k={k} kind="ji" flip={!fl} /><g transform={at(x, y, k, !fl)}><path d={Helmet} /></g></g>; })}</g>
		</Pl>
		<Pl c={cam} p={0.62}>
			{/* the near bank: wet edge, reeds; 曹 troops drawn up behind */}
			<path d={`M-100,826 ${Array.from({length: 22}, (_, i) => `L${-100 + i * 100},${f1(824 + Math.sin(i * 1.7) * 4)}`).join(' ')} L2060,826 L2060,1180 L-100,1180 Z`} fill="url(#lbBank)" />
			<path d={`M-100,826 ${Array.from({length: 22}, (_, i) => `L${-100 + i * 100},${f1(824 + Math.sin(i * 1.7) * 4)}`).join(' ')}`} fill="none" stroke="#E2DAC6" strokeOpacity={0.35} strokeWidth={2} />
			<g fill="#3A342C">{Array.from({length: 30}, (_, i) => { const x = -60 + i * 70 + rnd(i, 21) * 40, y = 830 + rnd(i, 22) * 8; return <path key={i} d={`M${f1(x)},${f1(y)} l-4,-26 l6,24 l4,-34 l3,34 l7,-22 l-3,24 Z`} />; })}</g>
			<g fill="#221C18" color="#221C18" filter="url(#lbRim)">
				{[90, 210, 330].map((x, i) => <Npc key={x} x={x} y={856 + i * 4} k={kY(856 + i * 4)} kind="ji" />)}
				<g transform={at(268, 860, kY(860) * 0.9)}><Banner h={320} w={66} ch="曹" cloth="#5E241C" clothS="#3E1612" ink="#EAD8B4" wave={wave(5)} /></g>
				{[1540, 1680, 1820].map((x, i) => <Npc key={x} x={x} y={862 - i * 6} k={kY(862 - i * 6)} kind="ji" flip />)}
			</g>
		</Pl>
		<Pl c={cam} p={1}>
			{/* the hero plane: 吕布 bound on his knees, the guard holding the rope; 曹操 (44, 札甲, short beard) judging */}
			<ellipse cx={1170} cy={1000} rx={150} ry={12} fill="#0E0B08" opacity={0.4} filter="url(#lbB3)" />
			<ellipse cx={GX + 10} cy={GY + 4} rx={70} ry={8} fill="#0E0B08" opacity={0.4} filter="url(#lbB3)" />
			<ellipse cx={620} cy={1004} rx={120} ry={10} fill="#0E0B08" opacity={0.45} filter="url(#lbB3)" />
			<g fill="#2C2620" color="#2C2620" filter="url(#lbRim)"><Npc x={1650} y={962} k={kY(962)} kind="ji" flip /><g transform={at(1650, 962, kY(962), true)}><path d={Helmet} /></g></g>
			<path d={`M${f1(wrist[0])},${f1(wrist[1])} Q${f1(mid[0])},${f1(mid[1])} ${f1(hand[0])},${f1(hand[1])}`} fill="none" stroke={ROPE} strokeWidth={3} />
			<g fill={SIL} color={SIL} filter="url(#lbRim)">
				<g transform={`rotate(${f1(gl)} ${GX} ${GY})`}><Npc x={GX} y={GY} k={GK} kind="hold" flip /><g transform={at(GX, GY, GK, true)}><path d={Helmet} /></g></g>
				<g transform={at(LX, LY, LK, true)}><LvBu s={s} hl={hl} /></g>
			</g>
			<g filter="url(#lbHero)"><g transform={`translate(640,${f1(1000 - 750 * S)}) scale(${S.toFixed(4)})`}>
				<Cao pal={PAL} id="lbc" old armour arm={arm} cape={0.3 + 0.12 * Math.sin(t * 1.3)} />
			</g></g>
		</Pl>
		<rect width={W} height={H} fill="url(#lbVig)" />
	</Svg>; };

/* =============================== card 19 · 199 邺 · 袁绍 enthroned =============================== */
/** 袁绍 seated (跪坐) on his couch, seen from the front: broad, wide-sleeved, a tall 进贤冠; units cm-ish, the seat at y = 0;
    up = he sits up taller (0..1), br = breath */
const YuanShao: React.FC<{up: number; br: number}> = ({up, br}) => { const ty = -up * 4 - br * 0.6, sx = 1 + up * 0.035;
	return <g>
		<path d="M-62,0 C-64,-12 -56,-22 -40,-26 C-20,-29 20,-29 40,-26 C56,-22 64,-12 62,0 Z" />
		<g transform={`translate(0,${f1(ty)}) translate(0,-26) scale(${sx.toFixed(4)},1) translate(0,26)`}>
			<path d="M-40,-92 C-54,-88 -62,-66 -68,-44 C-72,-26 -76,-10 -70,0 C-60,5 -48,1 -42,-6 C-38,-22 -36,-48 -32,-70 Z" />
			<path d="M40,-92 C54,-88 62,-66 68,-44 C72,-26 76,-10 70,0 C60,5 48,1 42,-6 C38,-22 36,-48 32,-70 Z" />
			<path d="M-36,-24 C-40,-44 -44,-66 -42,-84 C-40,-94 -26,-100 -12,-102 L12,-102 C26,-100 40,-94 42,-84 C44,-66 40,-44 36,-24 Z" />
			{/* the embroidered cuffs, the crossing collar, the belt with its gilt hook, the long 紫绶 over the lap */}
			<path d="M-70,0 C-60,5 -48,1 -42,-6 M70,0 C60,5 48,1 42,-6" fill="none" stroke="#6A2A1E" strokeWidth={3} />
			<path d="M-9,-102 L0,-80 L9,-102" fill="none" stroke="#3E3026" strokeWidth={3} />
			<path d="M-36,-46 L36,-46 L36,-40 L-36,-40 Z" fill="#2A2019" />
			<ellipse cx={0} cy={-43} rx={4} ry={2.6} fill="#A88A4C" />
			<path d="M-3.4,-40 L3.4,-40 L4.6,-6 L0,-2 L-4.6,-6 Z" fill="#3E2434" />
			{/* the 凭几 armrest before him, his forearms on it */}
			<path d="M-50,-30 C-24,-37 24,-37 50,-30 L50,-26 C24,-32 -24,-32 -50,-26 Z" />
			<path d="M-50,-30 C-24,-37 24,-37 50,-30" fill="none" stroke="#A88A4C" strokeWidth={0.9} opacity={0.7} />
			<ellipse cx={-26} cy={-35} rx={7} ry={4.4} /><ellipse cx={26} cy={-35} rx={7} ry={4.4} />
			<path d="M-7,-101 L7,-101 L6.4,-111 L-6.4,-111 Z" />
			<g transform={`translate(0,${f1(-up * 1.4)})`}>
				<path d="M-10.6,-114 C-12.4,-124 -11,-134 0,-136 C11,-134 12.4,-124 10.6,-114 C9,-107 5,-104 0,-104 C-5,-104 -9,-107 -10.6,-114 Z" />
				<ellipse cx={-11.4} cy={-121} rx={2.2} ry={3.8} /><ellipse cx={11.4} cy={-121} rx={2.2} ry={3.8} />
				<path d="M-8,-112 C-8.6,-104 -5,-97 0,-95 C5,-97 8.6,-104 8,-112 C4,-108.6 -4,-108.6 -8,-112 Z" />
				<path d="M-11.4,-127 C-8,-131 8,-131 11.4,-127 L11.6,-122 C8,-125 -8,-125 -11.6,-122 Z" />
				<path d="M-9,-129 L-8,-150 C-3,-152.4 3,-152.4 8,-150 L9,-129 Z" />
				{[-4, 0, 4].map((x) => <path key={x} d={`M${x},-131 L${x * 1.05},-149.6`} stroke="#5A4A3A" strokeWidth={0.8} opacity={0.7} />)}
				<path d="M-11,-123 C-10,-114 -6,-106 -2,-104 M11,-123 C10,-114 6,-106 2,-104" fill="none" stroke="currentColor" strokeWidth={0.9} />
			</g>
		</g>
	</g>; };
/** a Han 连枝灯 (lamp tree): a mountain base, a stem, three tiers of curling arms with lamp dishes; cm, base at 0. Flame bases in FLAMES. */
const LT_FL: P[] = [[0, -166], [-24, -140], [24, -140], [-38, -112], [38, -112], [-30, -84], [30, -84]];
const LampTree: React.FC = () => <g>
	<path d="M-26,0 C-22,-10 -12,-18 -4,-20 L-3,-164 L3,-164 L4,-20 C12,-18 22,-10 26,0 Z" />
	{[[-24, -140, -150], [24, -140, -150], [-38, -112, -124], [38, -112, -124], [-30, -84, -96], [30, -84, -96]].map(([x, y, y0], i) =>
		<path key={i} d={`M0,${y0} C${x * 0.3},${y0 - 10} ${x * 0.8},${y + 16} ${x},${y + 3}`} fill="none" stroke="currentColor" strokeWidth={2.6} />)}
	{LT_FL.map(([x, y], i) => <path key={'d' + i} d={`M${x - 7},${y} L${x + 7},${y} L${x + 4},${y + 4} L${x - 4},${y + 4} Z`} />)}
	<path d="M-14,-6 C-8,-12 -2,-10 0,-16 C2,-10 8,-12 14,-6" fill="none" stroke="#6A5A44" strokeWidth={1.2} opacity={0.6} />
</g>;
export const Rival: React.FC<{t: number}> = ({t}) => {
	const u = (t - B36) / (B38 - B36), e = ease(u), cam: Cam = {z: 0.09 * e, fx: 960, fy: 560};
	const up = ss(72.95, 73.85, t), br = Math.sin(t * 1.7);
	const LK = 1.9, LY = 862, L1 = 548, L2 = 1372, YK = 2.5, YY = 718;
	const fl = 1 + 0.03 * Math.sin(t * 11.3) + 0.03 * Math.sin(t * 6.1 + 1);
	const sway = (i: number) => Math.sin(t * 0.9 + i * 1.9) * 3;
	const jiSw = (i: number) => Math.sin(t * 1.1 + i * 2.3) * 0.8;
	return <Svg>
		<defs>
			<radialGradient id="rvWall" cx="960" cy="560" r="1100" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4A3A2C" /><stop offset="0.35" stopColor="#2C221A" /><stop offset="1" stopColor="#140F0C" /></radialGradient>
			<radialGradient id="rvLamp" cx="960" cy="600" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F3DDB4" stopOpacity={0.32 * fl} /><stop offset="0.4" stopColor="#E9CB98" stopOpacity={0.12 * fl} /><stop offset="1" stopColor="#E9CB98" stopOpacity="0" /></radialGradient>
			<linearGradient id="rvFloor" x1="0" y1="690" x2="0" y2="1080" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#2E241C" /><stop offset="1" stopColor="#120D0A" /></linearGradient>
			<radialGradient id="rvPool" cx="960" cy="880" r="640" gradientUnits="userSpaceOnUse" gradientTransform="translate(960 880) scale(1 0.34) translate(-960 -880)"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.22" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient>
			<linearGradient id="rvMat" x1="0" y1="860" x2="0" y2="1080" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4A2218" /><stop offset="1" stopColor="#24100C" /></linearGradient>
			<radialGradient id="rvVig" cx="0.5" cy="0.52" r="0.76"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
			<Blur id="rvB2" s={2} /><Blur id="rvB14" s={14} />
			<RimF id="rvRimK" lx={1} ly={-0.6} k={1.6} c="#F0D6A8" o={0.7} lx2={-1} ly2={-0.6} k2={1.6} c2="#F0D6A8" o2={0.7} />
			<RimF id="rvRimY" lx={1} ly={-0.5} k={3} c="#FFE6BC" o={0.95} lx2={-1} ly2={-0.5} k2={3} c2="#FFE6BC" o2={0.95} blur={1} />
		</defs>
		<Pl c={cam} p={0.15}>
			{/* P0 the back wall of the hall: beams and brackets, lacquered pillars, curtains gathered beside a great screen */}
			<rect x={-200} y={-200} width={2320} height={900} fill="url(#rvWall)" />
			<rect x={-200} y={-200} width={2320} height={290} fill="#120D0B" />
			{Array.from({length: 24}, (_, i) => <g key={i} fill="#100C0A"><rect x={-40 + i * 86} y={90} width={34} height={20} /><rect x={-54 + i * 86} y={108} width={62} height={10} /></g>)}
			<rect x={-200} y={118} width={2320} height={14} fill="#1A1310" />
			{[120, 1746].map((x) => <g key={x}><rect x={x} y={128} width={56} height={580} fill="#3A1812" /><rect x={x + (x < 960 ? 46 : 0)} y={128} width={10} height={580} fill="#F0D6A8" opacity={0.14} /></g>)}
			{[[620, 1], [1300, -1]].map(([x, d], j) => { const sw = Math.sin(t * 0.8 + j) * 3;
				return <g key={x} fill="#2E1410"><path d={`M${x - 50 * d},132 C${x - 36 * d},220 ${x - 12 * d},330 ${x - 4 * d},420 C${x},500 ${x - 16 * d + sw},600 ${x - 30 * d + sw},700 L${x + 40 * d},700 C${x + 40 * d},560 ${x + 44 * d},300 ${x + 60 * d},132 Z`} />
					<rect x={Math.min(x - 8 * d, x + 44 * d)} y={414} width={52} height={14} fill="#6A5232" opacity={0.8} /></g>; })}
			<path d={`M-200,132 L2120,132 L2120,152 ${Array.from({length: 30}, (_, i) => `Q${-160 + i * 80},${172 + (i % 2) * 4} ${-120 + i * 80},152`).join(' ')} L-200,152 Z`} fill="#3A1A14" />
			<rect x={-200} y={690} width={2320} height={500} fill="url(#rvFloor)" />
			{Array.from({length: 17}, (_, i) => { const x = -400 + i * 170; return <path key={i} d={`M${960 + (x - 960) * 0.18},690 L${x},1180`} stroke="#000" strokeOpacity={0.25} strokeWidth={1.4} />; })}
			<rect x={-200} y={690} width={2320} height={400} fill="url(#rvPool)" />
		</Pl>
		<Pl c={cam} p={0.32}>
			{/* the 袁 banners, tall, and the back rank of guards */}
			<g fill="#1A1410" color="#1A1410" filter="url(#rvRimK)">
				{[[240, 0], [410, 1], [1486, 2], [1656, 3]].map(([x, i]) => <g key={x} transform={at(x, 730, 0.95)}><Banner h={440} w={64} ch="袁" cloth="#5E2620" clothS="#3C1814" ink="#E8D6AE" wave={sway(i)} /></g>)}
				{[[300, false], [446, false], [1474, true], [1620, true]].map(([x, fl2], i) => <g key={i} transform={`rotate(${f1(jiSw(i))} ${x} 752)`}><Npc x={x as number} y={752} k={1.5} kind="ji" flip={fl2 as boolean} /><g transform={at(x as number, 752, 1.5, fl2 as boolean)}><path d={Helmet} /></g></g>)}
			</g>
		</Pl>
		<Pl c={cam} p={0.55}>
			{/* P1 the dais and its steps, the great screen behind him, his couch; 袁绍 on it */}
			<rect x={700} y={304} width={520} height={414} fill="#120C0A" />
			{[0, 1, 2].map((i) => <g key={i}><rect x={700 + i * 173.3} y={304} width={173.3} height={414} fill="none" stroke="#5A2018" strokeWidth={7} />
				<path d={`M${730 + i * 173.3},${400} c18,-22 42,-22 54,0 c10,18 -12,30 -22,14 M${760 + i * 173.3},${560} c18,-22 42,-22 54,0 c10,18 -12,30 -22,14`} fill="none" stroke="#7A3424" strokeOpacity={0.45} strokeWidth={3.4} /></g>)}
			<rect x={692} y={296} width={536} height={9} fill="#3A2A1C" /><rect x={692} y={296} width={536} height={2} fill="#E8C890" opacity={0.5} />
			<path d="M560,712 L1360,712 L1384,740 L536,740 Z" fill="#3A2C22" />
			<rect x={536} y={740} width={848} height={64} fill="#24120E" /><rect x={536} y={740} width={848} height={3} fill="#E8C890" opacity={0.42} />
			{Array.from({length: 8}, (_, i) => <path key={i} d={`M${576 + i * 104},790 c14,-18 34,-18 44,0 c8,14 -10,24 -18,12`} fill="none" stroke="#7A4030" strokeOpacity={0.4} strokeWidth={3} />)}
			{[0, 1, 2].map((i) => <g key={i}><rect x={846 - i * 22} y={804 + i * 22} width={228 + i * 44} height={22} fill={i % 2 ? '#2A1C16' : '#30221A'} /><rect x={846 - i * 22} y={804 + i * 22} width={228 + i * 44} height={2.4} fill="#E8C890" opacity={0.25} /></g>)}
			<path d="M846,870 L1074,870 L1180,1080 L740,1080 Z" fill="url(#rvMat)" />
			<path d="M846,870 L740,1080 M1074,870 L1180,1080" stroke="#8A6A3A" strokeOpacity={0.35} strokeWidth={3} />
			<g fill="#1A110D"><rect x={760} y={YY - 4} width={400} height={18} /><rect x={772} y={YY + 14} width={14} height={12} /><rect x={1134} y={YY + 14} width={14} height={12} /></g>
			<rect x={760} y={YY - 4} width={400} height={2} fill="#E8C890" opacity={0.4} />
			<g fill="#100A08" color="#100A08" filter="url(#rvRimY)"><g transform={at(960, YY, YK)}><YuanShao up={up} br={br} /></g></g>
		</Pl>
		<Pl c={cam} p={0.75}>
			{/* the lamp trees (the key) and the front guards */}
			<rect x={-200} y={-200} width={2320} height={1480} fill="url(#rvLamp)" />
			{[L1, L2].map((x) => <ellipse key={x} cx={x} cy={LY + 4} rx={150} ry={16} fill="#F3DDB4" opacity={0.1 * fl} />)}
			<g fill="#140D0A" color="#140D0A">{[L1, L2].map((x) => <g key={x} transform={at(x, LY, LK)}><LampTree /></g>)}</g>
			{[L1, L2].map((x, j) => LT_FL.map(([fx, fy], i) => <Flame key={j * 10 + i} x={x + fx * LK} y={LY + fy * LK} s={0.62} t={t} seed={31 + j * 10 + i} ivory glow={0.85} />))}
			<g fill={SIL} color={SIL} filter="url(#rvRimK)">
				{[[236, false], [1684, true]].map(([x, fl2], i) => <g key={i} transform={`rotate(${f1(jiSw(i + 4))} ${x} 898)`}><Npc x={x as number} y={898} k={2.15} kind="ji" flip={fl2 as boolean} /><g transform={at(x as number, 898, 2.15, fl2 as boolean)}><path d={Helmet} /></g></g>)}
			</g>
		</Pl>
		<Pl c={cam} p={1.25}>
			<g filter="url(#rvB14)" fill="#0C0605"><rect x={-120} y={-100} width={170} height={1300} /><rect x={1870} y={-100} width={170} height={1300} /><path d="M50,-100 C90,0 100,200 70,420 L50,420 Z" fill="#2A0E0A" /></g>
		</Pl>
		<rect width={W} height={H} fill="url(#rvVig)" />
	</Svg>; };

/* =============================== card 20 · 199 · 袁绍's army marches south at dusk =============================== */
const kA = (y: number) => 0.0033 * (y - 548);
const VA = 150;                                   // the camera trucks right: px/s at the near plane (p = 1)
/** a horse at the walk (cm, facing +x, hooves at 0): lateral-sequence gait, stance feet planted while the body moves at v cm/s */
const HB = 'M38,-142 C22,-135 2,-131 -18,-132 C-36,-133 -52,-140 -66,-135 C-74,-132 -80,-124 -81,-112 C-82,-100 -76,-90 -66,-86 L-48,-82 C-30,-80 -10,-79 10,-80 C26,-80 40,-79 52,-82 C62,-86 70,-95 72,-106 C74,-116 79,-130 88,-145 C94,-154 99,-159 103,-162 C109,-158 117,-149 123,-139 C126,-135 130,-131 134,-132 C138,-134 139,-139 136,-145 C129,-158 119,-172 109,-184 C105,-188 101,-191 96,-191 C84,-185 66,-167 52,-153 C46,-148 42,-145 38,-142 Z';
const ik2 = (r: P, h: P, l1: number, l2: number, bend: number): P => { const dx = h[0] - r[0], dy = h[1] - r[1], d = Math.min(l1 + l2 - 0.01, Math.hypot(dx, dy)), a = Math.atan2(dy, dx), c = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
	return [r[0] + l1 * Math.cos(a + bend * c), r[1] + l1 * Math.sin(a + bend * c)]; };
const HorseW: React.FC<{t: number; v: number; f: number; far?: string}> = ({t, v, f, far = '#2A2420'}) => {
	const A = 0.6 * v / f / 2, bob = -2.2 * Math.cos(4 * Math.PI * f * t);
	const foot = (ph: number, rx: number): P => { const q = ((f * t + ph) % 1 + 1) % 1;
		if (q < 0.6) return [rx + A - 2 * A * q / 0.6, 0]; const w = (q - 0.6) / 0.4; return [rx - A + 2 * A * ease(w), -15 * Math.sin(Math.PI * w)]; };
	const leg = (root: P, ph: number, rx: number, l1: number, l2: number, bend: number, w0: number) => { const h = foot(ph, rx), r: P = [root[0], root[1] + bob], j = ik2(r, h, l1, l2, bend);
		return <g><path d={limb([r, j, h], [w0, 5.6, 4])} /><circle cx={j[0]} cy={j[1]} r={5.8} /><path transform={`translate(${f1(h[0])},${f1(h[1])})`} d="M-4.6,-6 L5.4,-6 L7.4,0.4 L-5.2,0.4 Z" /></g>; };
	return <g>
		<g fill={far} color={far}>{leg([48, -98], 0.75, 56, 54, 46, -1, 10)}{leg([-46, -102], 0.5, -52, 58, 48, 1, 13)}</g>
		<g transform={`translate(0,${f1(bob)})`}>
			<path d={HB} />
			<path d="M93,-188 L90,-203 L98,-191 Z M98,-189 L99,-201 L103,-190 Z" />
			<path d="M96,-191 C84,-186 66,-169 50,-155 L46,-160 L48,-165 L44,-163 C58,-176 78,-192 96,-196 Z" />
			<path d={`M-70,-132 C-82,-132 -88,-122 -90,-106 C-92,-86 ${f1(-88 + Math.sin(t * 3) * 3)},-66 ${f1(-92 + Math.sin(t * 3 - 0.6) * 5)},-48 C-86,-56 -80,-64 -79,-80 C-78,-96 -78,-112 -72,-124 Z`} />
			<g transform="translate(18,2)"><Rider kind="ji" /></g>
		</g>
		{leg([54, -98], 0.25, 58, 54, 46, -1, 11)}{leg([-42, -102], 0, -48, 58, 48, 1, 14)}
	</g>; };
/** the crossbow (弩) carried on the shoulder, in an NPC torso frame */
const Nu = <g><path d={limb([[-16, -116], [24, -154]], [2.2, 1.6])} /><path d="M10,-162 Q26,-162 34,-144" fill="none" stroke="currentColor" strokeWidth={2.4} /><path d="M10,-162 L34,-144" stroke="currentColor" strokeWidth={0.7} /><rect x={-2} y={-134} width={7} height={6} transform="rotate(-44 1 -131)" /></g>;
type Sol = {x0: number; r: number; kind: 'ji' | 'nu' | 'ban'; t0: number; L: number; f: number};
const SOLS: Sol[] = Array.from({length: 2 * 72}, (_, i) => { const r = i % 2, j = Math.floor(i / 2), m = (j + r * 4) % 9;
	return {x0: -380 + j * 48 + r * 22 + (rnd(i, 71) - 0.5) * 12, r, kind: m === 4 ? 'ban' : m % 3 === 1 ? 'nu' : 'ji', t0: (r * 0.27 + (rnd(i, 72) - 0.5) * 0.08 + 10) , L: 62 + rnd(i, 73) * 4, f: 1.8 + (rnd(i, 74) - 0.5) * 0.06}; });
const FORD = Array.from({length: 34}, (_, i) => ({u0: i / 34 + rnd(i, 81) * 0.012, ph: rnd(i, 82) * 6.28, sp: rnd(i, 83) < 0.6, ban: i % 7 === 3}));
const DUST = Array.from({length: 24}, (_, i) => ({x: rnd(i, 91) * 2900 - 300, y: 700 + rnd(i, 92) * 240, r: 80 + rnd(i, 93) * 160, o: 0.1 + rnd(i, 94) * 0.16, sp: 26 + rnd(i, 95) * 40}));
const COLF: P[] = [[1180, 561], [1400, 565], [1620, 571], [1540, 580], [1700, 590], [1960, 600], [2120, 606]];
export const Army: React.FC<{t: number}> = ({t}) => {
	const u = t - B38, sh = (p: number) => -VA * u * p;
	const RY = [772, 798], RK = RY.map(kA), RP = RK.map((k) => k / 1.18);
	const flag = (x: number, y: number, k: number, i: number) => { const w = 60 * k, h = 150 * k, wv = Math.sin(t * 3.1 + i) * 4 * k;
		return <g key={'f' + i}><path d={`M${f1(x)},${f1(y)} L${f1(x + w)},${f1(y + 2 * k)} C${f1(x + w + wv)},${f1(y + h * 0.4)} ${f1(x + w - wv)},${f1(y + h * 0.7)} ${f1(x + w + wv * 0.5)},${f1(y + h)} L${f1(x + 1)},${f1(y + h - 2 * k)} Z`} fill="#5A2820" />
			<rect x={x - 1} y={y - 2} width={w + 4} height={Math.max(1.5, 2.5 * k)} fill={SIL} />
			<text x={x + w * 0.52} y={y + h * 0.6} textAnchor="middle" fontFamily="'Noto Serif CJK SC',serif" fontWeight={700} fontSize={w * 0.8} fill="#DCC49A">袁</text></g>; };
	/* the ford column: down the far bank, through the water, up toward the near plain (per-figure parallax by its depth) */
	const fordA: P = [1980, 604], fordB: P = [1180, 742];
	return <Svg>
		<defs>
			<linearGradient id="arSky" x1="0" y1="0" x2="0" y2="560" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#1C2830" /><stop offset="0.38" stopColor="#34444A" /><stop offset="0.66" stopColor="#6E726A" /><stop offset="0.86" stopColor="#B4A686" /><stop offset="1" stopColor="#DCC9A0" /></linearGradient>
			<radialGradient id="arGlow" cx="1240" cy="566" r="980" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFF0D0" stopOpacity="0.7" /><stop offset="0.22" stopColor="#E8D6AE" stopOpacity="0.3" /><stop offset="1" stopColor="#E8D6AE" stopOpacity="0" /></radialGradient>
			<linearGradient id="arPlain" x1="0" y1="556" x2="0" y2="1080" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#7E7660" /><stop offset="0.2" stopColor="#5C5646" /><stop offset="0.55" stopColor="#3E3930" /><stop offset="1" stopColor="#221E19" /></linearGradient>
			<linearGradient id="arRiv" x1="-200" y1="0" x2="2600" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#5E605A" /><stop offset="0.45" stopColor="#D2C29C" /><stop offset="0.62" stopColor="#B8AA88" /><stop offset="1" stopColor="#585A54" /></linearGradient>
			<radialGradient id="arVig" cx="0.5" cy="0.5" r="0.76"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient>
			<Blur id="arB2" s={2} /><Blur id="arB1" s={0.9} /><Blur id="arB18" s={18} /><Blur id="arB4" s={4} />
			<RimF id="arRimFar" lx={1} ly={-0.4} k={1.2} c="#FFE6BE" o={0.6} />
			<RimF id="arRim" lx={1} ly={-0.35} k={2} c="#FFE0B0" o={0.85} lx2={-0.3} ly2={-1} k2={1.2} c2="#9FB8B6" o2={0.35} />
		</defs>
		{/* P0 dusk: the sun just down behind the plain, the glow low ahead of the march */}
		<g transform={`translate(${f1(sh(0.03))},0)`}>
			<rect x={-100} y={-100} width={W + 300} height={700} fill="url(#arSky)" />
			<rect x={-100} y={-100} width={W + 300} height={700} fill="url(#arGlow)" />
			<g filter="url(#arB4)" opacity={0.6}>{[[1300, 470, 520, '#E8D8B4'], [600, 420, 460, '#7E7E70'], [1700, 380, 340, '#9A9480'], [200, 300, 300, '#4E5A5A']].map(([x, y, w, c], i) => <ellipse key={i} cx={(x as number) - u * 4} cy={y} rx={w} ry={6 + i * 1.5} fill={c as string} />)}</g>
		</g>
		<g transform={`translate(${f1(sh(0.08))},0)`}>
			<path d="M-200,560 C0,540 200,548 420,536 C600,528 760,546 980,540 C1200,534 1400,548 1640,538 C1900,528 2100,546 2400,540 L2400,566 L-200,566 Z" fill="#6A6C62" filter="url(#arB2)" />
		</g>
		{/* P1 the far plain: columns snaking to the horizon, gold dust hanging over them */}
		<g transform={`translate(${f1(sh(0.16))},0)`}>
			<rect x={-200} y={554} width={2800} height={540} fill="url(#arPlain)" />
			<g fill="#3E3A32" filter="url(#arB1)">{Array.from({length: 120}, (_, i) => { const q = ((i / 120 + u * 0.012) % 1), n = COLF.length - 1, s2 = q * n, a = Math.floor(s2), b = Math.min(n, a + 1), w2 = s2 - a, x = lerp(COLF[a][0], COLF[b][0], w2) + (rnd(i, 61) - 0.5) * 10, y = lerp(COLF[a][1], COLF[b][1], w2), k = kA(y) * 0.95;
				return <g key={i}><rect x={f1(x - 7 * k)} y={f1(y - 150 * k)} width={f1(15 * k)} height={f1(150 * k)} />{i % 3 === 0 && <rect x={f1(x)} y={f1(y - 300 * k)} width={1} height={f1(150 * k)} />}{i % 11 === 5 && <rect x={f1(x)} y={f1(y - 300 * k)} width={f1(36 * k)} height={f1(70 * k)} fill="#5A3428" />}</g>; })}</g>
			<g fill="#3A362E" filter="url(#arB1)">{Array.from({length: 90}, (_, i) => { const x = -160 + ((i * 26 - u * 9) % 2340 + 2340) % 2340 - 80, y = 590 + Math.sin(i * 0.4) * 3, k = kA(y);
				return <g key={i}><rect x={f1(x)} y={f1(y - 150 * k)} width={f1(15 * k)} height={f1(150 * k)} />{i % 2 === 0 && <rect x={f1(x + 6 * k)} y={f1(y - 290 * k)} width={1.2} height={f1(150 * k)} />}{i % 9 === 4 && <rect x={f1(x + 6 * k)} y={f1(y - 290 * k)} width={f1(40 * k)} height={f1(80 * k)} fill="#5A3428" />}</g>; })}</g>
			<g filter="url(#arB18)">{[[1500, 560, 420], [700, 580, 500], [1900, 572, 300], [200, 590, 360]].map(([x, y, w], i) => <ellipse key={i} cx={x - u * 6} cy={y} rx={w} ry={26} fill="#D8C8A0" opacity={0.3} />)}</g>
		</g>
		{/* P2 the river across the plain, the ford (the column wades it toward us) */}
		<g transform={`translate(${f1(sh(0.36))},0)`}>
			<path d="M-300,654 C200,646 800,660 1400,652 C1900,646 2300,656 2700,650 L2700,694 C2300,700 1900,690 1400,698 C800,704 200,690 -300,698 Z" fill="url(#arRiv)" />
			<path d="M-300,654 C200,646 800,660 1400,652 C1900,646 2300,656 2700,650" fill="none" stroke="#2A2620" strokeWidth={3} opacity={0.6} />
			{Array.from({length: 40}, (_, i) => <rect key={i} x={f1(-200 + rnd(i, 51) * 2800 + Math.sin(t * 0.9 + i) * 8)} y={f1(658 + rnd(i, 52) * 34)} width={f1(20 + rnd(i, 53) * 70)} height={1.2} fill="#FFF2D6" opacity={0.3} />)}
		</g>
		{FORD.map((f, i) => { const q = (f.u0 + u * 0.035) % 1, pos = lp(fordA, fordB, q), k = kA(pos[1]), p = k / 1.18, x = pos[0] + sh(p), y = pos[1] + Math.sin(t * 7 + f.ph) * 0.6;
			const inW = y - 40 * k > 651 && y < 699, st = 0.8 * Math.sin(t * 2 * Math.PI * 0.9 + f.ph);
			if (x < -100 || x > 2020) return null;
			return <g key={i}>
				<g fill="#241F1A" color="#241F1A" filter="url(#arRimFar)"><Npc x={x} y={y} k={k} kind={f.sp ? 'ji' : 'plain'} flip stride={st} /><g transform={at(x, y, k, true)}><path d={Helmet} /></g></g>
				{f.ban && flag(x - 15 * k, y - 266 * k, k, 50 + i)}
				{inW && <g><path d={`M${f1(x - 26 * k)},${f1(y - 40 * k)} L${f1(x + 26 * k)},${f1(y - 40 * k)} L${f1(x + 26 * k)},${f1(y + 3)} L${f1(x - 26 * k)},${f1(y + 3)} Z`} fill="url(#arRiv)" />
					<ellipse cx={x} cy={y - 40 * k} rx={30 * k} ry={4 * k} fill="none" stroke="#FFF2D6" strokeOpacity={0.5} strokeWidth={1.4} /></g>}
			</g>; })}
		{/* the far flank: riders behind the column */}
		<g transform={`translate(${f1(sh(0.6))},0)`} fill="#262019" color="#262019" filter="url(#arRimFar)">
			{Array.from({length: 12}, (_, i) => { const k = kA(746), x = -200 + i * 290 - u * 150 * k; return <g key={i} transform={at(x, 746, k, true)}><HorseW t={t + i * 0.37} v={150} f={0.95} far="#3A322A" /></g>; })}
		</g>
		{/* P3 the main column: two ranks of 戟 and 弩, 袁 banners, marching left (south) */}
		{[0, 1].map((r) => <g key={r} fill={r ? '#16110E' : '#1E1814'} color={r ? '#16110E' : '#1E1814'} filter="url(#arRim)">
			{SOLS.filter((s2) => s2.r === r).map((s2, i) => { const k = RK[r], hx0 = npcWalk(s2.t0, s2.L, s2.f).hipX, X = s2.x0 + sh(RP[r]) + k * hx0, cx = X - k * npcWalk(u + s2.t0, s2.L, s2.f).hipX;
				if (cx < -160 || cx > 2080) return null;
				const tor = npcTorsoT(u, s2.L, s2.f, s2.t0, 4);
				return <g key={i} transform={at(X, RY[r], k, true)}>
					<NpcWalk t={u} kind={s2.kind === 'nu' ? 'plain' : 'ji'} L={s2.L} f={s2.f} t0={s2.t0} lean={4} swing={0.7} />
					<g transform={tor}><path d={Helmet} />{s2.kind === 'nu' && Nu}</g>
				</g>; })}
		</g>)}
		{[0, 1].map((r) => SOLS.filter((s2) => s2.r === r && s2.kind === 'ban').map((s2, i) => { const k = RK[r], W2 = npcWalk(u + s2.t0, s2.L, s2.f), hx0 = npcWalk(s2.t0, s2.L, s2.f).hipX, X = s2.x0 + sh(RP[r]) + k * hx0;
			const dy = W2.hipY + 89, nl = 4 + 1.2 * Math.sin(Math.PI * (((u + s2.t0) * s2.f) % 1)) ** 2, top = rot([W2.hipX + 15.1, dy - 262], [W2.hipX, -92 + dy], nl);
			const sx = X - k * top[0], sy = RY[r] + k * top[1];
			if (sx < -160 || sx > 2080) return null;
			return flag(sx, sy + 8 * k, k, r * 100 + i); }))}
		{/* dust kicked up and drifting, lit by the glow */}
		<g filter="url(#arB18)">{DUST.map((d, i) => { const x = ((d.x - u * d.sp + sh(0.75)) % 2900 + 2900) % 2900 - 400; return <ellipse key={i} cx={f1(x)} cy={f1(d.y - u * 6)} rx={d.r} ry={d.r * 0.32} fill="#B4A282" opacity={d.o} />; })}</g>
		{/* P4 the near flank: cavalry with 戟 at the walk */}
		<g transform={`translate(${f1(sh(1))},0)`} fill={SIL} color={SIL} filter="url(#arRim)">
			{Array.from({length: 9}, (_, i) => { const k = kA(908), x = -120 + i * 400 + (rnd(i, 31) - 0.5) * 60 - u * 150 * k; return <g key={i} transform={at(x, 908 + (i % 2) * 6, k, true)}><HorseW t={t + i * 0.53} v={150} f={0.95} /></g>; })}
		</g>
		<g transform={`translate(${f1(sh(1))},0)`} filter="url(#arB4)" opacity={0.75}>{Array.from({length: 9}, (_, i) => { const x = -100 + i * 330 - u * 177 + 180; return <ellipse key={i} cx={x} cy={918} rx={160} ry={22} fill="#A89878" opacity={0.25} />; })}</g>
		{/* P5 the near ground, out of focus */}
		<g transform={`translate(${f1(sh(1.35))},0)`} filter="url(#arB4)">
			<path d="M-200,1040 C200,1030 600,1036 1000,1028 C1400,1022 1800,1034 2400,1026 L2400,1180 L-200,1180 Z" fill="#14100D" />
			{Array.from({length: 40}, (_, i) => { const x = -160 + i * 70 + rnd(i, 41) * 40, y = 1040 - rnd(i, 42) * 8; return <path key={i} d={`M${f1(x)},${f1(y + 8)} l-6,-34 l10,30 l6,-44 l4,44 l10,-30 l-4,34 Z`} fill="#14100D" />; })}
		</g>
		<rect width={W} height={H} fill="url(#arVig)" />
	</Svg>; };

/* =============================== card 21 · 200 官渡 · the establishing wide at dusk =============================== */
const kD = (y: number) => 0.0026 * (y - 462);
/** a band of massed men (shoulders, heads, spears, a banner here and there) from x0 to x1 at ground y, scale k (px/cm) */
const Mass: React.FC<{x0: number; x1: number; y: number; k: number; seed: number; ban: number; t: number}> = ({x0, x1, y, k, seed, ban, t}) => { const sp = 44 * k, n = Math.ceil((x1 - x0) / sp);
	let d = `M${x0},${f1(y + 4)} `; const tops: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) { const x = x0 + i * sp + (rnd(i, seed) - 0.5) * sp * 0.6, hy = y - (150 + rnd(i, seed + 1) * 20) * k, sw = y - (128 + rnd(i, seed + 1) * 16) * k;
		d += `L${f1(x)},${f1(sw)} L${f1(x + sp * 0.28)},${f1(hy + 6 * k)} Q${f1(x + sp * 0.5)},${f1(hy - 8 * k)} ${f1(x + sp * 0.72)},${f1(hy + 6 * k)} L${f1(x + sp)},${f1(sw)} `;
		if (rnd(i, seed + 2) < 0.5) { const sx = x + sp * 0.5, top = y - (290 + rnd(i, seed + 4) * 90) * k;
			tops.push(<rect key={i} x={f1(sx)} y={f1(top)} width={Math.max(1, 2.4 * k)} height={f1(hy - top)} />);
			if (rnd(i, seed + 6) < ban) { const wv = Math.sin(t * 2 + i) * 3 * k; tops.push(<path key={'b' + i} d={`M${f1(sx + 1)},${f1(top + 4 * k)} L${f1(sx + 60 * k)},${f1(top + 6 * k)} C${f1(sx + 60 * k + wv)},${f1(top + 60 * k)} ${f1(sx + 60 * k - wv)},${f1(top + 100 * k)} ${f1(sx + 62 * k)},${f1(top + 140 * k)} L${f1(sx + 1)},${f1(top + 138 * k)} Z`} fill="#4A2A1A" />); } } }
	d += `L${x1},${f1(y + 4)} Z`;
	return <g><path d={d} />{tops}</g>; };
/** a Han ridge tent, base centre (x, y), width w */
const tent = (x: number, y: number, w: number) => `M${f1(x - w / 2)},${f1(y)} L${f1(x - w * 0.36)},${f1(y - w * 0.42)} L${f1(x + w * 0.36)},${f1(y - w * 0.42)} L${f1(x + w / 2)},${f1(y)} Z`;
const YT = Array.from({length: 300}, (_, i) => { const y = 476 + Math.pow(rnd(i, 101), 1.4) * 90, x = 440 + Math.pow(rnd(i, 102), 0.7) * 1640; return {x, y}; }).sort((a, b) => a.y - b.y);
const CT: [number, number][] = [[120, 700], [300, 690], [470, 720], [210, 790], [400, 830], [80, 900], [620, 800], [300, 960]];
/** a 高橹 under construction: the post frame, braces in the lower bays, a ladder; the floor beam hauled up to height hb (0..1) */
const TowerFrame: React.FC<{hb: number}> = ({hb}) => <g>
	<g opacity={0.72}><rect x={-27} y={-214} width={5} height={214} /><rect x={22} y={-214} width={5} height={214} /></g>
	<rect x={-46} y={-216} width={10} height={216} /><rect x={36} y={-216} width={10} height={216} />
	{[-34, -104].map((y) => <rect key={y} x={-50} y={y} width={100} height={6} />)}
	<path d="M-38,-34 L38,-98 L40,-92 L-36,-28 Z" />
	<path d="M-41,-216 L-41,-246 M41,-216 L41,-246 M-41,-244 L41,-244" stroke="currentColor" strokeWidth={4} />
	<line x1={0} y1={-244} x2={0} y2={f1(-30 - hb * 186)} stroke="currentColor" strokeWidth={1.4} />
	<rect x={-60} y={f1(-30 - hb * 186)} width={120} height={7} />
</g>;
export const Duizhi: React.FC<{t: number}> = ({t}) => {
	const u = (t - B40) / (B42 - B40), e = ease(u), cam: Cam = {z: 0.075 * e, fx: 1010, fy: 700, px: -10 * e};
	const hb = ss(B40 - 0.4, B42 + 0.6, t), grip = ss(81.6, 82.4, t);
	const S = kD(860) / 4.98, arm = {sh: ARM_HILT.sh, el: lp([12, 206], ARM_HILT.el, grip), hd: lp([20, 300], ARM_HILT.hd, grip)};
	const wv = (i: number) => Math.sin(t * 1.9 + i * 1.7) * 5;
	/* the front palisade of 曹操's camp: from (520, 620) to (1520, 1080) */
	const PA: P = [520, 622], PB: P = [1560, 1100];
	const stakes = Array.from({length: 120}, (_, i) => { const q = i / 119, x = lerp(PA[0], PB[0], q) + (rnd(i, 7) - 0.5) * 3, y = lerp(PA[1], PB[1], q), k = kD(y); return {x, y, k, h: 220 * k * (0.9 + rnd(i, 8) * 0.18), w: 16 * k, l: (rnd(i, 9) - 0.5) * 4 * k}; });
	const back = Array.from({length: 70}, (_, i) => { const q = i / 69, x = lerp(-120, PA[0], q), y = lerp(650, PA[1], q), k = kD(y); return {x, y, k, h: 220 * k * (0.9 + rnd(i, 18) * 0.18), w: 16 * k, l: 0}; });
	const stakeD = (a: typeof stakes) => a.map((s) => `M${f1(s.x - s.w / 2)},${f1(s.y)} L${f1(s.x - s.w / 2 + s.l)},${f1(s.y - s.h + s.w)} L${f1(s.x + s.l)},${f1(s.y - s.h - s.w * 0.6)} L${f1(s.x + s.w / 2 + s.l)},${f1(s.y - s.h + s.w)} L${f1(s.x + s.w / 2)},${f1(s.y)} Z`).join(' ');
	const ramp = (q: number): P => lp([1170, 602], [1312, 506], q);
	const rail = (h0: number, h1: number) => `M${PA[0]},${f1(PA[1] - h0 * kD(PA[1]))} L${PB[0]},${f1(PB[1] - h0 * kD(PB[1]))} L${PB[0]},${f1(PB[1] - h1 * kD(PB[1]))} L${PA[0]},${f1(PA[1] - h1 * kD(PA[1]))} Z`;
	const rails = <><path d={rail(150, 141)} /><path d={rail(60, 51)} /></>;
	return <Svg>
		<defs>
			<linearGradient id="dzSky" x1="0" y1="0" x2="0" y2="480" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#1E2B33" /><stop offset="0.42" stopColor="#3A4A50" /><stop offset="0.72" stopColor="#868878" /><stop offset="0.9" stopColor="#CBBC96" /><stop offset="1" stopColor="#E8D7AC" /></linearGradient>
			<radialGradient id="dzGlow" cx="1480" cy="476" r="1150" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFF2D4" stopOpacity="0.8" /><stop offset="0.2" stopColor="#E8D6AE" stopOpacity="0.32" /><stop offset="1" stopColor="#E8D6AE" stopOpacity="0" /></radialGradient>
			<linearGradient id="dzFar" x1="0" y1="470" x2="0" y2="640" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#9A927A" /><stop offset="0.4" stopColor="#6A6454" /><stop offset="1" stopColor="#4A453A" /></linearGradient>
			<linearGradient id="dzMound" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2A241F" /><stop offset="0.7" stopColor="#3A322A" /><stop offset="1" stopColor="#54493C" /></linearGradient>
			<linearGradient id="dzGround" x1="0" y1="600" x2="0" y2="1080" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#5A5446" /><stop offset="0.5" stopColor="#3C372E" /><stop offset="1" stopColor="#2A2620" /></linearGradient>
			<linearGradient id="dzCamp" x1="0" y1="620" x2="0" y2="1080" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#36302A" /><stop offset="1" stopColor="#1A1613" /></linearGradient>
			<linearGradient id="dzRiv" x1="500" y1="0" x2="2000" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#7A786A" /><stop offset="0.7" stopColor="#E0CFA6" /><stop offset="1" stopColor="#C8B890" /></linearGradient>
			<linearGradient id="dzHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C8BA96" stopOpacity="0" /><stop offset="0.5" stopColor="#C8BA96" stopOpacity="0.4" /><stop offset="1" stopColor="#C8BA96" stopOpacity="0" /></linearGradient>
			<radialGradient id="dzVig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient>
			<Blur id="dzB1" s={0.8} /><Blur id="dzB2" s={2} /><Blur id="dzB6" s={6} /><Blur id="dzB12" s={12} />
			<RimF id="dzRimFar" lx={1} ly={-0.4} k={1.2} c="#FFE6BE" o={0.6} />
			<RimF id="dzRim" lx={1} ly={-0.3} k={2} c="#FFE0B0" o={0.85} lx2={-0.3} ly2={-1} k2={1.2} c2="#9FB8B6" o2={0.35} />
			<RimF id="dzHero" lx={1} ly={-0.3} k={2.6} c="#FFE6C0" o={0.95} lx2={-1} ly2={-0.15} k2={2.2} c2={ACC} o2={0.95} blur={0.7} />
			<Lamel pal={PAL} />
		</defs>
		<Pl c={cam} p={0}>
			{/* P0 earlier in the evening than K5: the light still up behind 袁绍's lines */}
			<rect x={-100} y={-100} width={W + 200} height={620} fill="url(#dzSky)" />
			<rect x={-100} y={-100} width={W + 200} height={620} fill="url(#dzGlow)" />
			<g filter="url(#dzB6)" opacity={0.6}>{[[1300, 330, 520, '#7C7C6E'], [560, 280, 420, '#4E5A5A'], [1560, 420, 380, '#F0E2BE'], [900, 400, 300, '#A49C86']].map(([x, y, w, c], i) => <ellipse key={i} cx={(x as number) - (t - B40) * 4} cy={y} rx={w} ry={7 + i} fill={c as string} />)}</g>
		</Pl>
		<Pl c={cam} p={0.1}>
			{/* P1 袁绍's camp to the horizon: thousands of tents, cooking smoke */}
			<rect x={-100} y={470} width={W + 200} height={200} fill="url(#dzFar)" />
			{YT.map((p, i) => { const k = kD(p.y), c = p.y < 500 ? '#6E685A' : p.y < 530 ? '#57524A' : '#47423A'; return <path key={i} d={tent(p.x, p.y, 320 * k * (0.8 + rnd(i, 103) * 0.4))} fill={c} />; })}
			<g filter="url(#dzB2)">{Array.from({length: 9}, (_, i) => { const x = 640 + i * 160 + rnd(i, 111) * 80, y = 500 + rnd(i, 112) * 40, d = (t - B40) * 6;
				return <path key={i} d={`M${f1(x)},${f1(y)} C${f1(x - 6)},${f1(y - 30)} ${f1(x + 10 + d * 0.4)},${f1(y - 60)} ${f1(x - 4 + d)},${f1(y - 100 - rnd(i, 113) * 40)}`} fill="none" stroke="#9A9282" strokeWidth={5} strokeLinecap="round" opacity={0.35} />; })}</g>
			<rect x={-100} y={470} width={W + 200} height={60} fill="url(#dzHaze)" opacity={0.7} />
		</Pl>
		<Pl c={cam} p={0.18}>
			{/* P2 the 土山: men carry earth up the ramp; two 高橹 stand manned, a third is going up */}
			<g fill="url(#dzMound)" filter="url(#dzRimFar)">
				<path d="M1130,612 L1190,588 L1226,584 L1300,512 L1330,508 L1352,486 L1660,486 L1690,512 L1716,516 L1790,600 L1816,604 L1860,618 Z" />
				<path d="M1720,626 L1790,566 L1812,562 L1880,520 L2040,516 L2040,626 Z" />
				<path d="M560,566 L610,546 L640,544 L668,532 L800,532 L830,546 L860,548 L900,566 Z" />
			</g>
			<path d="M1170,602 L1312,506 L1326,506 L1188,602 Z" fill="#5E5244" opacity={0.6} />
			<g fill="#221D18" color="#221D18" filter="url(#dzRimFar)">
				<g transform="translate(1410,488) scale(0.3)"><Tower archers={4} /></g>
				<g transform="translate(1516,488) scale(0.3)"><Tower archers={4} /></g>
				<g transform="translate(1624,488) scale(0.3)"><TowerFrame hb={hb} /></g>
				<g transform="translate(1930,518) scale(0.27)"><Tower archers={3} /></g>
				<g transform="translate(730,532) scale(0.18)"><Tower archers={3} /></g>
				{[0, 1].map((i) => <g key={i} transform={at(1606 + i * 14, 488, 0.08, true)}><Puller lean={0.7 + i * 0.3} /></g>)}
				{Array.from({length: 7}, (_, i) => { const q = ((i / 7 + (t - B40) * 0.045) % 1), p = ramp(q), k = 0.075;
					return <g key={i}><Npc x={p[0]} y={p[1]} k={k} kind="plain" stride={0.7 * Math.sin(t * 6 + i * 2)} /><ellipse cx={p[0] - 3} cy={p[1] - 120 * k} rx={4.4} ry={3.4} /></g>; })}
			</g>
		</Pl>
		<Pl c={cam} p={0.28}>
			{/* P3 袁绍's lines: rank on rank with 袁 banners, from the mounds to off the right edge */}
			<g fill="#2C2620" color="#2C2620" filter="url(#dzB1)"><Mass x0={880} x1={2080} y={606} k={kD(606) * 0.9} seed={31} ban={0.14} t={t} /></g>
			<g fill="#221D19" color="#221D19" filter="url(#dzRimFar)"><Mass x0={960} x1={2080} y={628} k={kD(628) * 0.9} seed={41} ban={0.12} t={t} /></g>
			<g fill="#1A1512" color="#1A1512" filter="url(#dzRimFar)">
				<Mass x0={1060} x1={2080} y={652} k={kD(652) * 0.9} seed={51} ban={0.1} t={t} />
				{[1120, 1330, 1540, 1760, 1960].map((x, i) => <g key={x} transform={at(x, 664, kD(664))}><Banner h={420} w={70} ch="袁" cloth="#4A2A1A" clothS="#2E180F" ink="#DCC49A" wave={wv(i)} /></g>)}
			</g>
			<rect x={-100} y={590} width={W + 200} height={80} fill="url(#dzHaze)" opacity={0.45} />
		</Pl>
		<Pl c={cam} p={0.4}>
			{/* the ground between the two camps and the 官渡水 shining in it */}
			<path d="M-100,660 C400,650 900,668 2040,662 L2040,1180 L-100,1180 Z" fill="url(#dzGround)" />
			<path d="M520,706 C760,712 980,702 1180,690 C1420,676 1700,672 2040,664 L2040,676 C1700,686 1420,692 1180,708 C980,722 760,732 520,722 Z" fill="url(#dzRiv)" />
			{Array.from({length: 18}, (_, i) => <rect key={i} x={f1(640 + rnd(i, 121) * 1300 + Math.sin(t * 0.8 + i) * 6)} y={f1(lerp(712, 670, (rnd(i, 121))) + rnd(i, 122) * 6)} width={f1(16 + rnd(i, 123) * 40)} height={1.1} fill="#FFF4DA" opacity={0.4} />)}
		</Pl>
		<Pl c={cam} p={0.62}>
			{/* P4 曹操's camp: a small wedge of palisade, tents, a 霹雳车, two 曹 banners; he stands on the rampart inside the stakes */}
			<path d={`M-120,652 L${PA[0]},${PA[1]} L${PB[0]},${PB[1]} L-120,1180 Z`} fill="url(#dzCamp)" />
			<g fill="#1A1512" filter="url(#dzRim)"><path d={stakeD(back)} /></g>
			{CT.map(([x, y], i) => <g key={i}><path d={tent(x, y, 260 * kD(y))} fill="#2E2822" /><path d={tent(x, y, 260 * kD(y))} fill="none" stroke="#C8B48C" strokeOpacity={0.18} strokeWidth={1.2} /><path d={`M${f1(x - 10 * kD(y))},${y} L${f1(x)},${f1(y - 60 * kD(y))} L${f1(x + 10 * kD(y))},${y} Z`} fill="#0E0B09" /></g>)}
			{[[190, 788], [410, 826]].map(([x, y], i) => <g key={'l' + i}><circle cx={x} cy={y - 26} r={40} fill="#F3DDB4" opacity={0.12} filter="url(#dzB6)" /><circle cx={x} cy={y - 26} r={2.4} fill="#FFF0D0" /></g>)}
			<g fill="#16110E" color="#16110E" filter="url(#dzRim)">
				<g transform={at(700, 742, kD(742) * 0.62)}><Trebuchet a={-112} ropes={[]} sling="hang" far="#2A231C" /></g>
				<g transform={at(470, 690, kD(690) * 0.62)}><Trebuchet a={-100} ropes={[]} sling="hang" far="#2A231C" /></g>
				{[[640, 722], [760, 772], [300, 742], [560, 860], [1080, 990]].map(([x, y], i) => <Npc key={i} x={x} y={y} k={kD(y)} kind="ji" flip={i === 2} />)}
				<g transform={at(866, 852, kD(852))}><Banner h={440} w={70} ch="曹" cloth="#4E1E18" clothS="#2C100C" ink="#EAD4A8" wave={wv(7)} /></g>
				<g transform={at(380, 760, kD(760))}><Banner h={420} w={66} ch="曹" cloth="#4E1E18" clothS="#2C100C" ink="#EAD4A8" wave={wv(8)} /></g>
			</g>
			{/* the rampart along the inside of the stakes, its top catching the sky */}
			<path d={`M${PA[0] - 40},${PA[1] + 4} L${PB[0] - 150},${PB[1] + 4} L${PB[0] - 60},${PB[1]} L${PA[0] - 8},${PA[1]} Z`} fill="#3A332A" />
			<path d={`M${PA[0] - 40},${PA[1] + 4} L${PB[0] - 150},${PB[1] + 4}`} stroke="#E0CCA2" strokeOpacity={0.3} strokeWidth={2} />
			<g fill="#120D0A" filter="url(#dzRim)"><path d={stakeD(stakes.filter((s) => s.y < 860))} />{rails}</g>
			<ellipse cx={972} cy={862} rx={40} ry={4} fill="#0A0806" opacity={0.5} />
			<g filter="url(#dzHero)"><g transform={`translate(962,${f1(860 - 750 * S)}) scale(${S.toFixed(4)})`}>
				<Cao pal={PAL} id="dzc" old armour arm={arm} cape={0.35 + 0.15 * Math.sin(t * 1.4)} />
			</g></g>
			<g fill="#120D0A" filter="url(#dzRim)"><path d={stakeD(stakes.filter((s) => s.y >= 860))} /></g>
		</Pl>
		<rect width={W} height={H} fill="url(#dzVig)" />
	</Svg>; };
