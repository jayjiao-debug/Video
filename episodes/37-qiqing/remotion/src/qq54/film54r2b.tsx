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
            flanks, dust; the camera tracks left alongside the march, the ground and far columns sweeping past.
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
const lvPt = (p: P, s: number): P => { const a = LV_TH(s) * Math.PI / 180, x = 1.15 * p[0], y = 1.15 * (p[1] + 92); return [x * Math.cos(a) - y * Math.sin(a), -50 + x * Math.sin(a) + y * Math.cos(a)]; };
const ROPE = '#7C6A4E';
/** 吕布: a big man in 札甲, bare-headed, kneeling with his arms bound behind him; cm, facing +x, knees on y = 0 (above the hips the
    NPC frame at 1.1×); s = strain 0..1 (leans into the rope), hl = head lift (deg) */
const LvBu: React.FC<{s: number; hl: number}> = ({s, hl}) => <g>
	<path d={limb([[-40, -5], [-12, -7], [12, -9]], [4.6, 6.4, 7.6])} />
	<path d="M-53,0 L-41,-10 L-33,-6 L-36,0 Z" />
	<Limb j={[[12, -9], [6, -30], [1, -52]]} w={[8.6, 10.6, 12.6]} />
	<g transform={`rotate(${f1(LV_TH(s))} 0 -50) translate(0,-50) scale(1.15) translate(0,92)`}>
		<path d="M-15,-103 C-18,-90 -20,-76 -21.4,-60 L20.4,-60 C19,-76 17,-90 15,-103 Z" />
		<path d="M-4,-142 C-12,-141 -15.4,-135 -15.4,-126 C-15.4,-114 -14.4,-106 -14,-100 L15,-100 C16,-108 17.6,-119 16.8,-128 C16,-136 11,-141.4 5,-142 Z" />
		<g transform="translate(0.4,0) scale(1.14,1)"><path d={NECK} /></g>
		{/* the near arm wrenched back: the elbow out behind, the wrists tied at the small of the back */}
		<Limb j={[[-1, -134], [-17.5, -114], [-11, -101.5]]} w={[6.6, 5.6, 4.6]} />
		<circle cx={-10} cy={-100.5} r={4.4} />
		<path d="M-11,-143.5 C-2,-148.5 9,-144 10.4,-135.6 C9,-127 0,-120.4 -10.4,-118.6 C-17.4,-121.4 -18.4,-131 -15.8,-138 Z" />
		{[-138, -131, -124].map((y) => <path key={y} d={`M${-15 + (y + 138) * 0.1},${y} C-6,${y - 2} 4,${y - 1.4} ${9.4 - (y + 138) * 0.2},${y + 1}`} fill="none" stroke="#3A3028" strokeWidth={0.8} opacity={0.75} />)}
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
const LB_SOLD: [number, number, boolean][] = [650, 700, 762].flatMap((y) => [[1236 - (y - 612) * 0.786 + 12, y, true], [1324 + (y - 612) * 1.143 - 12, y, false]] as [number, number, boolean][]);
export const Lvbu: React.FC<{t: number}> = ({t}) => {
	const u = (t - B34) / (B36 - B34), e = ease(u), cam: Cam = {z: 0.065 * e, fx: 920, fy: 820, px: -26 * e};
	const kY = (y: number) => 0.00566 * (y - 560);
	/* acting: he heaves against the rope (69.5–70.05) and lifts his head to 曹操; the guard hauls him back on the downbeat (70.38);
	   曹操 lifts his hand from the hilt toward him: the verdict (71.05–71.8) */
	const heave = ss(69.5, 70.05, t) * (1 - ss(70.3, 70.85, t)), haul = ss(70.18, 70.42, t) * (1 - 0.55 * ss(71.0, 72.2, t));
	const s = 0.1 + 0.9 * heave + 0.03 * Math.sin(t * 2.3), hl = -10 + 20 * ss(69.4, 70.0, t) - 3 * ss(71.2, 71.9, t);
	const gest = ss(71.05, 71.8, t);
	const LX = 1150, LY = 1008, LK = 3.0, GX = 1400, GY = 1000, GK = 2.9, gl = 3 + 8 * haul - 6 * heave;
	const wl = lvPt([-11, -101], s), wrist: P = [LX - LK * wl[0], LY + LK * wl[1]];
	const hand = rot([GX - GK * 30, GY - GK * 106], [GX, GY], gl);
	const taut = cl(0.3 + heave + haul), mid: P = [(wrist[0] + hand[0]) / 2, (wrist[1] + hand[1]) / 2 + 30 * (1 - taut)];
	const S = 0.6, arm = {sh: ARM_HILT.sh, el: lp(ARM_HILT.el, [70, 176], gest), hd: lp(ARM_HILT.hd, [156, 204], gest)};
	const wave = (i: number) => Math.sin(t * 1.6 + i * 1.7) * 4;
	return <Svg>
		<defs>
			<linearGradient id="lbSky" x1="0" y1="0" x2="0" y2="612" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#525a59" /><stop offset="0.45" stopColor="#848680" /><stop offset="0.8" stopColor="#B4AE9E" /><stop offset="1" stopColor="#C8C0AA" /></linearGradient>
			<radialGradient id="lbSun" cx="1736" cy="296" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FBF2DE" stopOpacity="0.75" /><stop offset="0.14" stopColor="#EEE4CC" stopOpacity="0.35" /><stop offset="1" stopColor="#E6DCC4" stopOpacity="0" /></radialGradient>
			<linearGradient id="lbWall" x1="0" y1="424" x2="0" y2="612" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#6C645A" /><stop offset="1" stopColor="#544C43" /></linearGradient>
			<linearGradient id="lbWater" x1="0" y1="612" x2="0" y2="840" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#3E3932" /><stop offset="0.5" stopColor="#4E4A42" /><stop offset="0.8" stopColor="#6E6A5E" /><stop offset="1" stopColor="#8A8676" /></linearGradient>
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
			<circle cx={1736} cy={296} r={30} fill="#FBF4E4" opacity={0.92} />
			<g filter="url(#lbB8)" opacity={0.65}>{[[1620, 286, 260], [1820, 312, 200], [900, 250, 380], [300, 190, 300], [1250, 400, 240]].map(([x, y, w], i) => <ellipse key={i} cx={x - (t - B34) * (3 + i)} cy={y} rx={w} ry={7 + i % 2 * 3} fill={i < 2 ? '#C8C2B0' : '#9C9A8E'} />)}</g>
		</Pl>
		<Pl c={cam} p={0.12}>
			{/* P1 the far hills and the roofs of 下邳 inside the wall, hazed */}
			<path d="M-100,470 C120,430 300,446 480,420 C640,398 760,430 980,416 C1200,402 1400,436 1620,418 C1800,404 1940,426 2040,420 L2040,480 L-100,480 Z" fill="#A29E90" filter="url(#lbB3)" />
			<g fill="#8E8A7E" filter="url(#lbB1)">{[[220, 0.8], [520, 1], [760, 0.7], [1000, 0.9], [1540, 0.8], [1780, 1]].map(([x, s], i) => <path key={i} d={`M${x - 90 * s},440 L${x - 60 * s},${440 - 30 * s} L${x + 60 * s},${440 - 30 * s} L${x + 90 * s},440 Z`} />)}</g>
		</Pl>
		<Pl c={cam} p={0.3}>
			{/* P2 the wall of 下邳 standing in the flood, the gate passage, the 白门楼; 曹 banners on the parapet now */}
			<g fill="#5A544A" filter="url(#lbRimFar)">{Array.from({length: 18}, (_, i) => <Npc key={i} x={-20 + i * 118 + rnd(i, 7) * 30} y={424} k={0.34} kind={i % 2 ? 'ji' : 'plain'} flip={i % 3 === 0} />)}</g>
			<rect x={-100} y={410} width={2120} height={202} fill="url(#lbWall)" />
			{Array.from({length: 9}, (_, i) => <rect key={'p' + i} x={f1(-60 + rnd(i, 13) * 2000)} y={f1(420 + rnd(i, 14) * 100)} width={f1(60 + rnd(i, 15) * 160)} height={f1(30 + rnd(i, 16) * 60)} fill={i % 2 ? '#7A7266' : '#4E473E'} opacity={0.25} />)}
			<path d={`M-100,612 L-100,566 ${Array.from({length: 22}, (_, i) => `L${-100 + i * 100},${f1(562 + Math.sin(i * 2.1) * 5 + rnd(i, 17) * 6)}`).join(' ')} L2020,566 L2020,612 Z`} fill="#3A342C" opacity={0.5} />
			{Array.from({length: 14}, (_, i) => <rect key={i} x={-100} y={424 + i * 14} width={2120} height={1.4} fill="#2A241E" opacity={0.18} />)}
			<path d={`M-100,410 ${Array.from({length: 82}, (_, i) => `L${-100 + i * 26},410 L${-100 + i * 26},396 L${-84 + i * 26},396 L${-84 + i * 26},410`).join(' ')} L2020,410 Z`} fill="#5E574C" />
			<rect x={-100} y={408} width={2120} height={3} fill="#D8D0BC" opacity={0.35} />
			<rect x={1228} y={506} width={104} height={106} fill="#26211C" />
			<path d="M1232,510 L1256,517 L1256,612 L1232,612 Z M1328,510 L1304,517 L1304,612 L1328,612 Z" fill="#3A332B" />
			<rect x={1220} y={500} width={120} height={9} fill="#3E362E" />
			<g transform="translate(1280,398) scale(0.98)"><GateTower win={0.06} wall="#4C443A" dark="#2E2822" roof="#3A3C3A" /></g>
			<g fill="#3A322A" filter="url(#lbRimFar)">{[360, 860, 1600, 1860].map((x, i) => <g key={x} transform={at(x, 398, 0.36)}><Banner h={320} w={64} ch="曹" cloth="#6A2E24" clothS="#4A1E18" ink="#E8D8B6" wave={wave(i)} /></g>)}</g>
		</Pl>
		<Pl c={cam} p={0.42}>
			{/* the flood: the wall's reflection, the sun's glitter, drowned trees and reeds, mist moving over the water */}
			<rect x={-100} y={612} width={2120} height={240} fill="url(#lbWater)" />
			<rect x={-100} y={612} width={2120} height={70} fill="#4A443A" opacity={0.42} filter="url(#lbB3)" />
			<rect x={1226} y={612} width={108} height={56} fill="#26211C" opacity={0.5} filter="url(#lbB3)" />
			{Array.from({length: 70}, (_, i) => { const y = 618 + rnd(i, 3) * 210, w = 20 + rnd(i, 4) * 90, x = ((rnd(i, 5) * 2200 + (rnd(i, 6) - 0.5) * 16 * (t - B34)) % 2200) - 140;
				return <rect key={i} x={f1(x)} y={f1(y)} width={f1(w * (0.6 + (y - 612) / 300))} height={1.3} fill="#E8E0CC" opacity={0.3 + 0.15 * Math.sin(t * 1.3 + i)} />; })}
			<g fill="#4A463E" filter="url(#lbB1)">
				{[[300, 652, 0.9], [520, 640, 0.7], [1700, 648, 0.8]].map(([x, y, s], i) => <g key={i} transform={`translate(${x},${y}) scale(${s})`}><path d="M-2,0 L-3,-60 L-14,-84 M-3,-46 L14,-72 M-3,-30 L-20,-44 M10,-66 L18,-78" fill="none" stroke="#4A463E" strokeWidth={3} strokeLinecap="round" /><path d="M-20,2 C-10,-2 10,-2 20,2 Z" fill="#4A463E" opacity={0.5} /></g>)}
			</g>
			<g opacity={0.7}>{[[180, 662, 260], [760, 700, 340], [1500, 676, 300], [1850, 720, 220]].map(([x, y, w], i) => <rect key={i} x={x - w + Math.sin(t * 0.4 + i) * 10 + (t - B34) * 5} y={y - 14} width={w * 2} height={28} fill="url(#lbMist)" />)}</g>
			{/* the dike from the gate to the near bank, 曹 soldiers lining it */}
			<path d="M1236,612 L1324,612 L1580,836 L1060,836 Z" fill="url(#lbDike)" />
			<path d="M1236,612 L1324,612 L1330,618 L1242,618 Z" fill="#D8D0BC" opacity={0.3} />
			<path d="M1324,612 L1580,836 L1600,836 L1334,612 Z" fill="#2E2822" opacity={0.6} />
			<g filter="url(#lbRimFar)">{LB_SOLD.map(([x, y, fl], i) => { const k = kY(y); return <g key={i} fill={y < 690 ? '#4A443A' : y < 740 ? '#3E3830' : '#342E28'}><Npc x={x} y={y} k={k} kind="ji" flip={!fl} /><g transform={at(x, y, k, !fl)}><path d={Helmet} /></g></g>; })}</g>
		</Pl>
		<Pl c={cam} p={0.62}>
			{/* the near bank: wet edge, reeds; 曹 troops drawn up behind */}
			<path d={`M-100,826 ${Array.from({length: 22}, (_, i) => `L${-100 + i * 100},${f1(824 + Math.sin(i * 1.7) * 4)}`).join(' ')} L2060,826 L2060,1180 L-100,1180 Z`} fill="url(#lbBank)" />
			<path d={`M-100,826 ${Array.from({length: 22}, (_, i) => `L${-100 + i * 100},${f1(824 + Math.sin(i * 1.7) * 4)}`).join(' ')}`} fill="none" stroke="#E2DAC6" strokeOpacity={0.35} strokeWidth={2} />
			<g fill="#3A342C">{Array.from({length: 30}, (_, i) => { const x = -60 + i * 70 + rnd(i, 21) * 40, y = 830 + rnd(i, 22) * 8; return <path key={i} d={`M${f1(x)},${f1(y)} l-4,-26 l6,24 l4,-34 l3,34 l7,-22 l-3,24 Z`} />; })}</g>
			<g fill="#221C18" color="#221C18" filter="url(#lbRim)">
				{[110, 250].map((x, i) => <g key={x}><Npc x={x} y={848 + i * 4} k={kY(848 + i * 4)} kind="ji" /><g transform={at(x, 848 + i * 4, kY(848 + i * 4))}><path d={Helmet} /></g></g>)}
				<g transform={at(186, 846, kY(846) * 0.9)}><Banner h={250} w={64} ch="曹" cloth="#5E241C" clothS="#3E1612" ink="#EAD8B4" wave={wave(5)} /></g>
			</g>
		</Pl>
		<Pl c={cam} p={1}>
			{/* the hero plane: 吕布 bound on his knees, the guard holding the rope; 曹操 (44, 札甲, short beard) judging */}
			<ellipse cx={1130} cy={1010} rx={170} ry={12} fill="#0E0B08" opacity={0.4} filter="url(#lbB3)" />
			<ellipse cx={GX + 10} cy={GY + 4} rx={70} ry={8} fill="#0E0B08" opacity={0.4} filter="url(#lbB3)" />
			<ellipse cx={580} cy={1014} rx={140} ry={11} fill="#0E0B08" opacity={0.45} filter="url(#lbB3)" />
			<g fill="#2C2620" color="#2C2620" filter="url(#lbRim)"><Npc x={1630} y={984} k={2.7} kind="ji" flip /><g transform={at(1630, 984, 2.7, true)}><path d={Helmet} /></g></g>
			<path d={`M${f1(wrist[0])},${f1(wrist[1])} Q${f1(mid[0])},${f1(mid[1])} ${f1(hand[0])},${f1(hand[1])}`} fill="none" stroke={ROPE} strokeWidth={3} />
			<g fill={SIL} color={SIL} filter="url(#lbRim)">
				<g transform={`rotate(${f1(gl)} ${GX} ${GY})`}><Npc x={GX} y={GY} k={GK} kind="hold" flip /><g transform={at(GX, GY, GK, true)}><path d={Helmet} /></g></g>
				<g transform={at(LX, LY, LK, true)}><LvBu s={s} hl={hl} /></g>
			</g>
			<g filter="url(#lbHero)"><g transform={`translate(600,${f1(1012 - 750 * S)}) scale(${S.toFixed(4)})`}>
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
			<path d="M-46,-92 C-60,-86 -66,-64 -72,-42 C-76,-24 -80,-8 -74,1 C-62,6 -50,1 -44,-6 C-40,-22 -38,-48 -36,-70 Z" />
			<path d="M46,-92 C60,-86 66,-64 72,-42 C76,-24 80,-8 74,1 C62,6 50,1 44,-6 C40,-22 38,-48 36,-70 Z" />
			<path d="M-38,-24 C-44,-44 -50,-66 -48,-84 C-46,-95 -30,-101 -13,-103 L13,-103 C30,-101 46,-95 48,-84 C50,-66 44,-44 38,-24 Z" />
			{/* the embroidered cuffs, the crossing collar, the belt with its gilt hook, the long 紫绶 over the lap */}
			<path d="M-74,1 C-62,6 -50,1 -44,-6 M74,1 C62,6 50,1 44,-6" fill="none" stroke="#7A3020" strokeWidth={3} />
			<path d="M-9,-102 L0,-80 L9,-102" fill="none" stroke="#3E3026" strokeWidth={3} />
			<path d="M-36,-46 L36,-46 L36,-40 L-36,-40 Z" fill="#2A2019" />
			<ellipse cx={0} cy={-43} rx={4} ry={2.6} fill="#A88A4C" />
			<path d="M-3.4,-40 L3.4,-40 L4.6,-6 L0,-2 L-4.6,-6 Z" fill="#3E2434" />
			{/* the 凭几 armrest before him, his forearms on it */}
			<path d="M-50,-30 C-24,-37 24,-37 50,-30 L50,-26 C24,-32 -24,-32 -50,-26 Z" />
			<path d="M-50,-30 C-24,-37 24,-37 50,-30" fill="none" stroke="#A88A4C" strokeWidth={0.9} opacity={0.7} />
			<ellipse cx={-26} cy={-35} rx={7} ry={4.4} /><ellipse cx={26} cy={-35} rx={7} ry={4.4} />
			<path d="M-8,-100 L8,-100 L7.4,-110 L-7.4,-110 Z" />
			<g transform={`translate(0,${f1(-up * 1.4)}) translate(0,-102) scale(1.32) translate(0,102)`}>
				<path d="M-10.6,-114 C-12.4,-124 -11,-134 0,-136 C11,-134 12.4,-124 10.6,-114 C9,-107 5,-104 0,-104 C-5,-104 -9,-107 -10.6,-114 Z" />
				<ellipse cx={-11.4} cy={-121} rx={2.2} ry={3.8} /><ellipse cx={11.4} cy={-121} rx={2.2} ry={3.8} />
				<path d="M-8,-112 C-8.6,-104 -5,-97 0,-95 C5,-97 8.6,-104 8,-112 C4,-108.6 -4,-108.6 -8,-112 Z" />
				<path d="M-11.4,-127 C-8,-131 8,-131 11.4,-127 L11.6,-122 C8,-125 -8,-125 -11.6,-122 Z" />
				<path d="M-8.6,-129 L-7,-144 C-3,-146 3,-146 7,-144 L8.6,-129 Z" />
				{[-4, 0, 4].map((x) => <path key={x} d={`M${x},-131 L${x * 0.9},-143.6`} stroke="#5A4A3A" strokeWidth={0.8} opacity={0.7} />)}
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
	const LK = 1.9, LY = 862, L1 = 548, L2 = 1372, YK = 2.75, YY = 718;
	const fl = 1 + 0.03 * Math.sin(t * 11.3) + 0.03 * Math.sin(t * 6.1 + 1);
	const sway = (i: number) => Math.sin(t * 0.9 + i * 1.9) * 3;
	const jiSw = (i: number) => Math.sin(t * 1.1 + i * 2.3) * 0.8;
	return <Svg>
		<defs>
			<radialGradient id="rvWall" cx="960" cy="560" r="1100" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#3A2C22" /><stop offset="0.35" stopColor="#261D16" /><stop offset="1" stopColor="#120D0B" /></radialGradient>
			<radialGradient id="rvScreen" cx="960" cy="560" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#7A5236" /><stop offset="0.6" stopColor="#5A3824" /><stop offset="1" stopColor="#3A2216" /></radialGradient>
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
			<rect x={700} y={304} width={520} height={414} fill="url(#rvScreen)" />
			{[0, 1, 2].map((i) => <g key={i}><rect x={700 + i * 173.3} y={304} width={173.3} height={414} fill="none" stroke="#1E0C08" strokeWidth={9} />
				<path d={`M${730 + i * 173.3},${400} c18,-22 42,-22 54,0 c10,18 -12,30 -22,14 M${760 + i * 173.3},${560} c18,-22 42,-22 54,0 c10,18 -12,30 -22,14`} fill="none" stroke="#9A5232" strokeOpacity={0.5} strokeWidth={3.4} /></g>)}
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
const kA = (y: number) => 0.00184 * (y - 418);   // px per cm on the ground at screen y (horizon 418–430)
const VA = 90;                                   // the camera tracks left with the march: px/s at the cavalry plane (k 0.85 = p 1)
const pA = (k: number) => k / 0.85;
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
			<g transform="translate(18,2)"><Rider kind="ji" /><path d="M-6,-219 C-6.6,-228 -2,-236 6,-237 C13,-237 16,-231 15.4,-224 L14.6,-221 L-1.2,-222.4 Z M5,-237 L6.6,-245 L8.4,-237 Z" /></g>
		</g>
		{leg([54, -98], 0.25, 58, 54, 46, -1, 11)}{leg([-42, -102], 0, -48, 58, 48, 1, 14)}
	</g>; };
/** the crossbow (弩) carried on the shoulder, in an NPC torso frame */
const Nu = <g><path d={limb([[-16, -116], [24, -154]], [2.2, 1.6])} /><path d="M10,-162 Q26,-162 34,-144" fill="none" stroke="currentColor" strokeWidth={2.4} /><path d="M10,-162 L34,-144" stroke="currentColor" strokeWidth={0.7} /><rect x={-2} y={-134} width={7} height={6} transform="rotate(-44 1 -131)" /></g>;
type Sol = {x0: number; r: number; kind: 'ji' | 'nu' | 'ban'; t0: number; L: number; f: number};
/** the main column: three files of 戟 and 弩 with 袁 banners (RY), and a crossbow unit nearer (RY2) */
const RY = [690, 706, 722], RY2 = [758, 774];
const SOLS: Sol[] = Array.from({length: 3 * 64}, (_, i) => { const r = i % 3, j = Math.floor(i / 3), m = (j + r * 4) % 9;
	return {x0: -380 + j * 50 + r * 17 + (rnd(i, 71) - 0.5) * 12, r, kind: m === 4 ? 'ban' : m % 3 === 1 ? 'nu' : 'ji', t0: r * 0.27 + (rnd(i, 72) - 0.5) * 0.08 + 10, L: 62 + rnd(i, 73) * 4, f: 1.8 + (rnd(i, 74) - 0.5) * 0.06}; });
const SOLS2: Sol[] = Array.from({length: 2 * 60}, (_, i) => { const r = i % 2, j = Math.floor(i / 2), g = Math.floor(j / 10);
	return {x0: -420 + j * 56 + g * 120 + r * 24 + (rnd(i, 75) - 0.5) * 10, r, kind: j % 10 === 4 ? 'ban' : 'nu', t0: r * 0.31 + (rnd(i, 76) - 0.5) * 0.06 + 20, L: 63 + rnd(i, 77) * 3, f: 1.8}; });
const FORD = Array.from({length: 30}, (_, i) => ({u0: i / 30 + rnd(i, 81) * 0.01, ph: rnd(i, 82) * 6.28, sp: rnd(i, 83) < 0.6, ban: i % 7 === 3}));
const DUST = Array.from({length: 26}, (_, i) => ({x: rnd(i, 91) * 2900 - 300, y: 640 + rnd(i, 92) * 280, r: 80 + rnd(i, 93) * 170, o: 0.1 + rnd(i, 94) * 0.15, sp: 26 + rnd(i, 95) * 40}));
const COL1: P[] = [[1236, 433], [1420, 439], [1560, 448], [1460, 462], [1600, 482], [1830, 510], [2140, 540]];
const COL2: P[] = [[760, 434], [610, 441], [720, 454], [500, 472], [270, 496], [-30, 526], [-320, 560]];
const along = (c: P[], q: number): P => { const n = c.length - 1, s = Math.max(0, Math.min(n - 1e-6, q * n)), a = Math.floor(s); return lp(c[a], c[a + 1], s - a); };
const farFig = (x: number, y: number, k: number, sp: boolean) => `M${f1(x - 8 * k)},${f1(y)} L${f1(x - 7 * k)},${f1(y - 128 * k)} L${f1(x - 3 * k)},${f1(y - 152 * k)} L${f1(x + 4 * k)},${f1(y - 152 * k)} L${f1(x + 8 * k)},${f1(y - 128 * k)} L${f1(x + 8 * k)},${f1(y)} Z` + (sp ? ` M${f1(x + 2 * k)},${f1(y - 120 * k)} l1.1,0 l0,${f1(-170 * k)} l-1.1,0 Z` : '');
const rivTop = (x: number) => 590 - (x + 300) * 0.0074 + Math.sin(x * 0.002) * 3, rivBot = (x: number) => 630 - (x + 300) * 0.0089 + Math.sin(x * 0.002 + 1) * 3;
export const Army: React.FC<{t: number}> = ({t}) => {
	const u = t - B38, sh = (p: number) => VA * u * p;
	const flag = (x: number, y: number, k: number, i: number) => { const w = 60 * k, h = 150 * k, wv = Math.sin(t * 3.1 + i) * 4 * k;
		return <g key={'f' + i}><path d={`M${f1(x)},${f1(y)} L${f1(x + w)},${f1(y + 2 * k)} C${f1(x + w + wv)},${f1(y + h * 0.4)} ${f1(x + w - wv)},${f1(y + h * 0.7)} ${f1(x + w + wv * 0.5)},${f1(y + h)} L${f1(x + 1)},${f1(y + h - 2 * k)} Z`} fill="#5A2820" />
			<rect x={x - 1} y={y - 2} width={w + 4} height={Math.max(1.5, 2.5 * k)} fill={SIL} />
			<text x={x + w * 0.52} y={y + h * 0.6} textAnchor="middle" fontFamily="'Noto Serif CJK SC',serif" fontWeight={700} fontSize={w * 0.8} fill="#DCC49A">袁</text></g>; };
	/* a marching file of NpcWalkers facing left: world x0 at film start, plane p, scale k */
	const file = (list: Sol[], ry: number[], key: string, fills: string[]) => ry.map((y, r) => { const k = kA(y), p = pA(k);
		return <g key={key + r} fill={fills[r]} color={fills[r]} filter="url(#arRim)">
			{list.filter((s2) => s2.r === r).map((s2, i) => { const hx0 = npcWalk(s2.t0, s2.L, s2.f).hipX, X = s2.x0 + sh(p) + k * hx0, cx = X - k * npcWalk(u + s2.t0, s2.L, s2.f).hipX;
				if (cx < -160 || cx > 2080) return null;
				return <g key={i} transform={at(X, y, k, true)}>
					<NpcWalk t={u} kind={s2.kind === 'nu' ? 'plain' : 'ji'} L={s2.L} f={s2.f} t0={s2.t0} lean={4} swing={0.7} />
					<g transform={npcTorsoT(u, s2.L, s2.f, s2.t0, 4)}><path d={Helmet} />{s2.kind === 'nu' && Nu}</g>
				</g>; })}
		</g>; });
	const flags = (list: Sol[], ry: number[], key: number) => ry.map((y, r) => { const k = kA(y), p = pA(k);
		return list.filter((s2) => s2.r === r && s2.kind === 'ban').map((s2, i) => { const W2 = npcWalk(u + s2.t0, s2.L, s2.f), hx0 = npcWalk(s2.t0, s2.L, s2.f).hipX, X = s2.x0 + sh(p) + k * hx0;
			const dy = W2.hipY + 89, nl = 4 + 1.2 * Math.sin(Math.PI * (((u + s2.t0) * s2.f) % 1)) ** 2, top = rot([W2.hipX + 15.1, dy - 262], [W2.hipX, -92 + dy], nl);
			const sx = X - k * top[0], sy = y + k * top[1];
			if (sx < -160 || sx > 2080) return null;
			return flag(sx, sy + 8 * k, k, key + r * 100 + i); }); });
	const snake = (c: P[], n: number, seed: number) => { let d = ''; const bans: React.ReactNode[] = [];
		for (let i = 0; i < n; i++) { const q = (i / n + u * 0.016) % 1, [x0, y] = along(c, q), k = kA(y), x = x0 + sh(pA(k)) + (rnd(i, seed) - 0.5) * 8;
			if (x < -40 || x > 1960) continue;
			d += farFig(x, y, k, i % 2 === 0) + ' ';
			if (i % 10 === 5) bans.push(<rect key={i} x={f1(x + 2 * k)} y={f1(y - 290 * k)} width={f1(46 * k)} height={f1(96 * k)} fill="#5A3428" />); }
		return <g><path d={d} />{bans}</g>; };
	const fordA: P = [1560, 552], fordB: P = [1200, 668], pR = pA(kA(610));
	return <Svg>
		<defs>
			<linearGradient id="arSky" x1="0" y1="0" x2="0" y2="440" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#1C2830" /><stop offset="0.38" stopColor="#34444A" /><stop offset="0.66" stopColor="#6E726A" /><stop offset="0.86" stopColor="#B4A686" /><stop offset="1" stopColor="#DCC9A0" /></linearGradient>
			<radialGradient id="arGlow" cx="1250" cy="440" r="980" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFF0D0" stopOpacity="0.75" /><stop offset="0.22" stopColor="#E8D6AE" stopOpacity="0.3" /><stop offset="1" stopColor="#E8D6AE" stopOpacity="0" /></radialGradient>
			<linearGradient id="arPlain" x1="0" y1="428" x2="0" y2="1080" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#8A8068" /><stop offset="0.16" stopColor="#625B4A" /><stop offset="0.5" stopColor="#433D33" /><stop offset="1" stopColor="#221E19" /></linearGradient>
			<radialGradient id="arPlainG" cx="1250" cy="440" r="700" gradientUnits="userSpaceOnUse" gradientTransform="translate(1250 440) scale(1 0.4) translate(-1250 -440)"><stop offset="0" stopColor="#E8D6AE" stopOpacity="0.45" /><stop offset="1" stopColor="#E8D6AE" stopOpacity="0" /></radialGradient>
			<linearGradient id="arRiv" x1="-300" y1="0" x2="2500" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#5E605A" /><stop offset="0.45" stopColor="#D2C29C" /><stop offset="0.62" stopColor="#B8AA88" /><stop offset="1" stopColor="#585A54" /></linearGradient>
			<linearGradient id="arVeil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B8A888" stopOpacity="0" /><stop offset="0.6" stopColor="#B8A888" stopOpacity="0.32" /><stop offset="1" stopColor="#B8A888" stopOpacity="0.12" /></linearGradient>
			<radialGradient id="arVig" cx="0.5" cy="0.5" r="0.76"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient>
			<Blur id="arB2" s={2} /><Blur id="arB1" s={0.7} /><Blur id="arB18" s={18} /><Blur id="arB4" s={4} />
			<RimF id="arRimFar" lx={1} ly={-0.4} k={1.1} c="#FFE6BE" o={0.6} />
			<RimF id="arRim" lx={1} ly={-0.35} k={1.8} c="#FFE0B0" o={0.85} lx2={-0.3} ly2={-1} k2={1.1} c2="#9FB8B6" o2={0.35} />
		</defs>
		{/* P0 dusk: the sun just down ahead of the march, the glow on the horizon */}
		<g transform={`translate(${f1(sh(0.03))},0)`}>
			<rect x={-100} y={-100} width={W + 300} height={560} fill="url(#arSky)" />
			<rect x={-100} y={-100} width={W + 300} height={560} fill="url(#arGlow)" />
			<g filter="url(#arB4)" opacity={0.6}>{[[1300, 360, 520, '#E8D8B4'], [600, 330, 460, '#7E7E70'], [1700, 300, 340, '#9A9480'], [300, 250, 300, '#4E5A5A']].map(([x, y, w, c], i) => <ellipse key={i} cx={(x as number) - u * 4} cy={y} rx={w} ry={6 + i * 1.5} fill={c as string} />)}</g>
			<path d="M-200,432 C0,420 200,426 420,418 C600,412 760,426 980,422 C1200,418 1400,428 1640,420 C1900,412 2100,426 2400,422 L2400,440 L-200,440 Z" fill="#6A6C62" filter="url(#arB2)" />
		</g>
		{/* P1 the plain to the horizon; far columns snaking toward us, gold dust hanging over them */}
		<g transform={`translate(${f1(sh(0.12))},0)`}>
			<rect x={-200} y={428} width={2800} height={700} fill="url(#arPlain)" />
			<rect x={-200} y={428} width={2800} height={300} fill="url(#arPlainG)" />
		</g>
		<g fill="#3A362E" filter="url(#arB1)">{snake(COL1, 170, 61)}{snake(COL2, 150, 63)}</g>
		<g transform={`translate(${f1(sh(0.2))},0)`} filter="url(#arB18)">{[[1500, 470, 380], [700, 470, 420], [1950, 520, 300], [200, 520, 360]].map(([x, y, w], i) => <ellipse key={i} cx={x - u * 6} cy={y} rx={w} ry={22} fill="#D8C8A0" opacity={0.32} />)}</g>
		{/* P2 the river (黄河 at 黎阳) across the plain, and the ford: a column wades it toward us */}
		<g transform={`translate(${f1(sh(pR))},0)`}>
			<path d={`M-300,${f1(rivTop(-300))} ${Array.from({length: 28}, (_, i) => `L${-300 + i * 100},${f1(rivTop(-300 + i * 100))}`).join(' ')} L2500,${f1(rivBot(2500))} ${Array.from({length: 28}, (_, i) => `L${2400 - i * 100},${f1(rivBot(2400 - i * 100))}`).join(' ')} Z`} fill="url(#arRiv)" />
			<path d={`M-300,${f1(rivTop(-300))} ${Array.from({length: 28}, (_, i) => `L${-300 + i * 100},${f1(rivTop(-300 + i * 100))}`).join(' ')}`} fill="none" stroke="#2A2620" strokeWidth={2.4} opacity={0.6} />
			{Array.from({length: 46}, (_, i) => { const x = -200 + rnd(i, 51) * 2700, y = lerp(rivTop(x), rivBot(x), 0.1 + rnd(i, 52) * 0.8); return <rect key={i} x={f1(x + Math.sin(t * 0.9 + i) * 8)} y={f1(y)} width={f1(18 + rnd(i, 53) * 60)} height={1.2} fill="#FFF2D6" opacity={0.32} />; })}
		</g>
		{FORD.map((f, i) => { const q = (f.u0 + u * 0.03) % 1, pos = lp(fordA, fordB, q), k = kA(pos[1]), x = pos[0] + sh(pA(k)), y = pos[1] + Math.sin(t * 7 + f.ph) * 0.4;
			const xl = x - sh(pR), inW = y - 44 * k > rivTop(xl) - 1 && y < rivBot(xl) + 3, st = 0.8 * Math.sin(t * 2 * Math.PI * 0.9 + f.ph);
			if (x < -100 || x > 2020) return null;
			return <g key={i}>
				<g fill="#262019" color="#262019" filter="url(#arRimFar)"><Npc x={x} y={y} k={k} kind={f.sp ? 'ji' : 'plain'} flip stride={st} /><g transform={at(x, y, k, true)}><path d={Helmet} /></g></g>
				{f.ban && flag(x - 15 * k, y - 266 * k, k, 50 + i)}
				{inW && <g transform={`translate(${f1(sh(pR))},0)`}><path d={`M${f1(xl - 24 * k)},${f1(y - 44 * k)} L${f1(xl + 24 * k)},${f1(y - 44 * k)} L${f1(xl + 24 * k)},${f1(y + 3)} L${f1(xl - 24 * k)},${f1(y + 3)} Z`} fill="url(#arRiv)" />
					<ellipse cx={xl} cy={y - 44 * k} rx={28 * k} ry={3.6 * k} fill="none" stroke="#FFF2D6" strokeOpacity={0.55} strokeWidth={1.2} /></g>}
			</g>; })}
		{/* the far flank: riders beside the column */}
		<g transform={`translate(${f1(sh(pA(kA(654))))},0)`} fill="#3A332A" color="#3A332A" filter="url(#arRimFar)">
			{Array.from({length: 12}, (_, i) => { const k = kA(654), x = -200 + i * 280 + (rnd(i, 33) - 0.5) * 50 - u * 150 * k; return <g key={i} transform={at(x, 654 + (i % 2) * 4, k, true)}><HorseW t={t + i * 0.37} v={150} f={0.95} far="#3A322A" /></g>; })}
		</g>
		{/* P3 the main column: three files of 戟 and 弩 under 袁 banners, marching left (south) */}
		{file(SOLS, RY, 'a', ['#3E372E', '#38312A', '#322C25'])}
		{flags(SOLS, RY, 0)}
		<g filter="url(#arB18)">{DUST.map((d, i) => { const x = ((d.x - u * d.sp + sh(0.75)) % 2900 + 2900) % 2900 - 400; return <ellipse key={i} cx={f1(x)} cy={f1(d.y - u * 6)} rx={d.r} ry={d.r * 0.3} fill="#B4A282" opacity={d.o} />; })}</g>
		{/* the crossbow unit nearer, in companies */}
		{file(SOLS2, RY2, 'b', ['#2C251F', '#28221C'])}
		<rect x={-100} y={640} width={W + 200} height={190} fill="url(#arVeil)" />
		{flags(SOLS2, RY2, 300)}
		{/* P4 the near flank: cavalry with 戟 at the walk */}
		<g transform={`translate(${f1(sh(1))},0)`} fill={SIL} color={SIL} filter="url(#arRim)">
			{Array.from({length: 9}, (_, i) => { const k = kA(900), x = -120 + i * 400 + (rnd(i, 31) - 0.5) * 60 - u * 150 * k; return <g key={i} transform={at(x, 900 + (i % 2) * 6, k, true)}><HorseW t={t + i * 0.53} v={150} f={0.95} /></g>; })}
		</g>
		<g transform={`translate(${f1(sh(1))},0)`} filter="url(#arB4)" opacity={0.75}>{Array.from({length: 11}, (_, i) => { const x = -100 + i * 330 - u * 128 + 180; return <ellipse key={i} cx={x} cy={910} rx={150} ry={20} fill="#A89878" opacity={0.25} />; })}</g>
		{/* P5 the near ground, out of focus */}
		<g transform={`translate(${f1(sh(1.35))},0)`} filter="url(#arB4)">
			<path d="M-800,1040 C-400,1034 200,1030 600,1036 C1000,1028 1400,1022 1800,1034 C2000,1030 2200,1028 2400,1026 L2400,1180 L-800,1180 Z" fill="#14100D" />
			{Array.from({length: 48}, (_, i) => { const x = -700 + i * 70 + rnd(i, 41) * 40, y = 1040 - rnd(i, 42) * 8; return <path key={i} d={`M${f1(x)},${f1(y + 8)} l-6,-34 l10,30 l6,-44 l4,44 l10,-30 l-4,34 Z`} fill="#14100D" />; })}
		</g>
		<rect width={W} height={H} fill="url(#arVig)" />
	</Svg>; };

/* =============================== card 21 · 200 官渡 · the establishing wide at dusk =============================== */
const kD = (y: number) => 0.0013 * (y - 470);
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
const tent = (x: number, y: number, w: number) => `M${f1(x - w / 2)},${f1(y)} L${f1(x - w * 0.3)},${f1(y - w * 0.3)} L${f1(x - w * 0.04)},${f1(y - w * 0.46)} L${f1(x + w * 0.04)},${f1(y - w * 0.46)} L${f1(x + w * 0.3)},${f1(y - w * 0.3)} L${f1(x + w / 2)},${f1(y)} Z`;
const Tent: React.FC<{x: number; y: number; w: number; c?: string; lit?: number}> = ({x, y, w, c = '#221D18', lit = 0.4}) => <g>
	<path d={tent(x, y, w)} fill={c} />
	<path d={`M${f1(x + w * 0.04)},${f1(y - w * 0.46)} L${f1(x + w * 0.3)},${f1(y - w * 0.3)} L${f1(x + w / 2)},${f1(y)} L${f1(x + w * 0.1)},${f1(y)} Z`} fill="#E8D4AA" opacity={0.08} />
	<path d={`M${f1(x + w * 0.04)},${f1(y - w * 0.46)} L${f1(x + w * 0.3)},${f1(y - w * 0.3)} L${f1(x + w / 2)},${f1(y)}`} fill="none" stroke="#E8D4AA" strokeOpacity={lit} strokeWidth={1.3} />
	<path d={`M${f1(x - w * 0.1)},${f1(y)} L${f1(x)},${f1(y - w * 0.28)} L${f1(x + w * 0.1)},${f1(y)} Z`} fill="#0A0807" />
	<rect x={f1(x - 1)} y={f1(y - w * 0.56)} width={2} height={f1(w * 0.1)} fill={c} />
</g>;
const YT = Array.from({length: 380}, (_, i) => { const y = 474 + Math.pow(rnd(i, 101), 1.25) * 150, x = 220 + Math.pow(rnd(i, 102), 0.62) * 1860; return {x, y}; }).sort((a, b) => a.y - b.y);
const CT: [number, number][] = [[80, 942], [300, 926], [520, 950], [730, 934], [190, 1040], [430, 1062], [670, 1050], [900, 1012]];
/** a 高橹 under construction: the post frame, braces in the lower bays, a ladder; the floor beam hauled up to height hb (0..1) */
const TowerFrame: React.FC<{hb: number}> = ({hb}) => <g>
	<g opacity={0.72}><rect x={-27} y={-214} width={5} height={214} /><rect x={22} y={-214} width={5} height={214} /></g>
	<rect x={-46} y={-216} width={10} height={216} /><rect x={36} y={-216} width={10} height={216} />
	{[-34, -104].map((y) => <rect key={y} x={-50} y={y} width={100} height={6} />)}
	<path d="M-38,-34 L38,-98 L40,-92 L-36,-28 Z" />
	<path d="M-41,-216 L-41,-246 M41,-216 L41,-246 M-46,-244 L46,-244" stroke="currentColor" strokeWidth={5} />
	<line x1={0} y1={-244} x2={0} y2={f1(-30 - hb * 180)} stroke="currentColor" strokeWidth={2} />
	<rect x={-62} y={f1(-30 - hb * 180)} width={124} height={8} />
</g>;
export const Duizhi: React.FC<{t: number}> = ({t}) => {
	const u = (t - B40) / (B42 - B40), e = ease(u), cam: Cam = {z: 0.085 * e, fx: 960, fy: 730, px: -12 * e};
	const hb = ss(B40 - 0.4, B42 + 0.4, t), grip = ss(81.5, 82.4, t);
	const CY = 862, S = kD(CY) / 4.98, arm = {sh: ARM_HILT.sh, el: lp([12, 206], ARM_HILT.el, grip), hd: lp([20, 300], ARM_HILT.hd, grip)};
	const wv = (i: number) => Math.sin(t * 1.9 + i * 1.7) * 5;
	/* 曹操's palisade: the long side across at y 800, the short side turning toward us at the right */
	const BY = 800, C0: P = [980, BY], C1: P = [1230, 1110];
	const stake = (x: number, y: number, i: number, hc = 180) => { const k = kD(y), h = hc * k * (0.9 + rnd(i, 8) * 0.18), w = 18 * k, l = (rnd(i, 9) - 0.5) * 3 * k;
		return `M${f1(x - w / 2)},${f1(y)} L${f1(x - w / 2 + l)},${f1(y - h + w)} L${f1(x + l)},${f1(y - h - w * 0.6)} L${f1(x + w / 2 + l)},${f1(y - h + w)} L${f1(x + w / 2)},${f1(y)} Z`; };
	const backD = Array.from({length: 128}, (_, i) => stake(-90 + i * 8.42 + (rnd(i, 7) - 0.5) * 2, BY, i)).join(' ');
	const sideD = Array.from({length: 46}, (_, i) => { const q = i / 45, p = lp(C0, C1, q); return stake(p[0], p[1], i + 300); }).join(' ');
	const ramp = (q: number): P => lp([1118, 632], [1266, 524], q);
	return <Svg>
		<defs>
			<linearGradient id="dzSky" x1="0" y1="0" x2="0" y2="480" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#1E2B33" /><stop offset="0.42" stopColor="#3A4A50" /><stop offset="0.72" stopColor="#868878" /><stop offset="0.9" stopColor="#CBBC96" /><stop offset="1" stopColor="#E8D7AC" /></linearGradient>
			<radialGradient id="dzGlow" cx="1470" cy="476" r="1150" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFF2D4" stopOpacity="0.85" /><stop offset="0.2" stopColor="#E8D6AE" stopOpacity="0.34" /><stop offset="1" stopColor="#E8D6AE" stopOpacity="0" /></radialGradient>
			<linearGradient id="dzFar" x1="0" y1="470" x2="0" y2="800" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#A0967C" /><stop offset="0.3" stopColor="#6E6656" /><stop offset="1" stopColor="#3E3930" /></linearGradient>
			<radialGradient id="dzFarG" cx="1470" cy="480" r="800" gradientUnits="userSpaceOnUse" gradientTransform="translate(1470 480) scale(1 0.35) translate(-1470 -480)"><stop offset="0" stopColor="#F0E0B8" stopOpacity="0.5" /><stop offset="1" stopColor="#F0E0B8" stopOpacity="0" /></radialGradient>
			<linearGradient id="dzMound" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2A241F" /><stop offset="0.7" stopColor="#3A322A" /><stop offset="1" stopColor="#5A4E40" /></linearGradient>
			<linearGradient id="dzGround" x1="0" y1="680" x2="0" y2="1080" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#625A4A" /><stop offset="0.4" stopColor="#4A4438" /><stop offset="1" stopColor="#2E2A24" /></linearGradient>
			<linearGradient id="dzCamp" x1="0" y1="800" x2="0" y2="1080" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#3A332B" /><stop offset="1" stopColor="#1E1A16" /></linearGradient>
			<linearGradient id="dzRiv" x1="0" y1="0" x2="2000" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#7A786A" /><stop offset="0.72" stopColor="#E6D6AE" /><stop offset="1" stopColor="#CDBE96" /></linearGradient>
			<linearGradient id="dzHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C8BA96" stopOpacity="0" /><stop offset="0.5" stopColor="#C8BA96" stopOpacity="0.4" /><stop offset="1" stopColor="#C8BA96" stopOpacity="0" /></linearGradient>
			<radialGradient id="dzVig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient>
			<Blur id="dzB1" s={0.7} /><Blur id="dzB2" s={2} /><Blur id="dzB6" s={6} />
			<RimF id="dzRimFar" lx={1} ly={-0.4} k={1.1} c="#FFE6BE" o={0.65} />
			<RimF id="dzRim" lx={1} ly={-0.3} k={1.8} c="#FFE0B0" o={0.85} lx2={-0.3} ly2={-1} k2={1.1} c2="#9FB8B6" o2={0.35} />
			<RimF id="dzHero" lx={1} ly={-0.3} k={2.2} c="#FFE6C0" o={0.95} lx2={-1} ly2={-0.15} k2={1.9} c2={ACC} o2={0.95} blur={0.6} />
			<Lamel pal={PAL} />
		</defs>
		<Pl c={cam} p={0}>
			{/* P0 earlier in the evening than K5: the light still up behind 袁绍's lines */}
			<rect x={-100} y={-100} width={W + 200} height={620} fill="url(#dzSky)" />
			<rect x={-100} y={-100} width={W + 200} height={620} fill="url(#dzGlow)" />
			<g filter="url(#dzB6)" opacity={0.6}>{[[1300, 330, 520, '#7C7C6E'], [560, 280, 420, '#4E5A5A'], [1560, 420, 380, '#F0E2BE'], [900, 400, 300, '#A49C86']].map(([x, y, w, c], i) => <ellipse key={i} cx={(x as number) - (t - B40) * 4} cy={y} rx={w} ry={7 + i} fill={c as string} />)}</g>
		</Pl>
		<Pl c={cam} p={0.1}>
			{/* P1 袁绍's camp to the horizon: thousands of tents, cooking smoke going up */}
			<rect x={-100} y={468} width={W + 200} height={420} fill="url(#dzFar)" />
			<rect x={-100} y={468} width={W + 200} height={300} fill="url(#dzFarG)" />
			{YT.map((p, i) => { const k = kD(p.y), c = p.y < 500 ? '#7A725E' : p.y < 540 ? '#5E5848' : '#4A443A'; return <path key={i} d={tent(p.x, p.y, 280 * k * (0.8 + rnd(i, 103) * 0.4))} fill={c} />; })}
			<g filter="url(#dzB6)">{Array.from({length: 11}, (_, i) => { const x = 420 + i * 150 + rnd(i, 111) * 80, y = 496 + rnd(i, 112) * 70, d = (t - B40) * 6;
				return <path key={i} d={`M${f1(x)},${f1(y)} C${f1(x - 6)},${f1(y - 30)} ${f1(x + 10 + d * 0.4)},${f1(y - 60)} ${f1(x - 4 + d)},${f1(y - 100 - rnd(i, 113) * 50)}`} fill="none" stroke="#A09888" strokeWidth={9} strokeLinecap="round" opacity={0.16} />; })}</g>
			<rect x={-100} y={468} width={W + 200} height={50} fill="url(#dzHaze)" opacity={0.8} />
		</Pl>
		<Pl c={cam} p={0.16}>
			{/* P2 the 土山: men carry earth up the ramp; two 高橹 stand manned, a third is going up */}
			<g fill="url(#dzMound)" filter="url(#dzRimFar)">
				<path d="M1080,640 L1130,618 L1160,614 L1230,548 L1262,544 L1286,520 L1620,520 L1648,546 L1676,550 L1748,620 L1776,624 L1830,642 Z" />
				<path d="M1720,646 L1780,600 L1800,596 L1866,560 L2040,556 L2040,646 Z" />
				<path d="M470,628 L520,610 L548,608 L580,590 L760,590 L792,608 L820,610 L870,628 Z" />
			</g>
			<path d="M1118,632 L1266,524 L1282,524 L1138,632 Z" fill="#6A5C4A" opacity={0.55} />
			<g fill="#221D18" color="#221D18" filter="url(#dzRimFar)">
				<g transform="translate(1340,522) scale(0.42)"><Tower archers={4} /></g>
				<g transform="translate(1460,522) scale(0.42)"><Tower archers={4} /></g>
				<g transform="translate(1580,522) scale(0.42)"><TowerFrame hb={hb} /></g>
				<g transform="translate(1906,558) scale(0.34)"><Tower archers={3} /></g>
				<g transform="translate(672,592) scale(0.22)"><Tower archers={3} /></g>
				{[0, 1].map((i) => <g key={i} transform={at(1606 + i * 10, 522, 0.075, true)}><Puller lean={0.6 + i * 0.3 + 0.2 * Math.sin(t * 3 + i)} /></g>)}
				{Array.from({length: 8}, (_, i) => { const q = ((i / 8 + (t - B40) * 0.04) % 1), p = ramp(q), k = 0.085;
					return <g key={i}><Npc x={p[0]} y={p[1]} k={k} kind="plain" stride={0.7 * Math.sin(t * 6 + i * 2)} /><ellipse cx={p[0] - 3} cy={p[1] - 122 * k} rx={4.6} ry={3.6} /></g>; })}
			</g>
		</Pl>
		<Pl c={cam} p={0.24}>
			{/* P3 袁绍's lines: their stakes, then rank on rank with 袁 banners, thickest under the mounds */}
			<g fill="#3A342C" filter="url(#dzB1)">{Array.from({length: 190}, (_, i) => { const x = 200 + i * 9.6; return <rect key={i} x={f1(x)} y={f1(630 - 26 * (0.9 + rnd(i, 131) * 0.2))} width={3} height={f1(26 * (0.9 + rnd(i, 131) * 0.2))} />; })}<rect x={200} y={612} width={1840} height={2.4} /></g>
			<g fill="#2E2822" color="#2E2822" filter="url(#dzB1)"><Mass x0={330} x1={2080} y={644} k={kD(644)} seed={31} ban={0.12} t={t} /></g>
			<g fill="#262019" color="#262019" filter="url(#dzRimFar)"><Mass x0={480} x1={2080} y={658} k={kD(658)} seed={41} ban={0.1} t={t} /></g>
			<g fill="#1E1915" color="#1E1915" filter="url(#dzRimFar)">
				<Mass x0={700} x1={2080} y={674} k={kD(674)} seed={51} ban={0.08} t={t} />
				{[620, 860, 1100, 1320, 1540, 1760, 1980].map((x, i) => <g key={x}><g transform={at(x, 688, kD(688))}><Banner h={420} w={70} ch="袁" cloth="#4A2A1A" clothS="#2E180F" ink="#DCC49A" wave={wv(i)} /></g><Npc x={x - 20} y={688} k={kD(688)} kind="ji" flip={i % 2 === 0} /></g>)}
			</g>
			<rect x={-100} y={620} width={W + 200} height={70} fill="url(#dzHaze)" opacity={0.4} />
		</Pl>
		<Pl c={cam} p={0.34}>
			{/* the open ground between the camps and the 官渡水 shining in it */}
			<path d="M-100,690 C500,700 1100,684 2040,676 L2040,1180 L-100,1180 Z" fill="url(#dzGround)" />
			<path d="M-100,736 C500,744 1100,722 2040,706 L2040,724 C1100,742 500,764 -100,756 Z" fill="url(#dzRiv)" />
			<path d="M-100,736 C500,744 1100,722 2040,706" fill="none" stroke="#2A2620" strokeWidth={2} opacity={0.5} />
			{Array.from({length: 22}, (_, i) => { const x = -60 + rnd(i, 121) * 2060, y = lerp(746, 714, x / 2000) + rnd(i, 122) * 8; return <rect key={i} x={f1(x + Math.sin(t * 0.8 + i) * 6)} y={f1(y)} width={f1(16 + rnd(i, 123) * 40)} height={1.1} fill="#FFF4DA" opacity={0.45} />; })}
		</Pl>
		<Pl c={cam} p={0.5}>
			{/* P4 曹操's small camp: its palisade across and turning toward us, the rampart inside, tents, a 霹雳车, two 曹 banners */}
			{/* the open ground: ruts, stones, and the long trench (长堑) dug outside the stakes */}
			{Array.from({length: 14}, (_, i) => { const y = 790 + i * i * 1.6 + i * 6, x0 = 1000 + rnd(i, 141) * 500; return <path key={'r' + i} d={`M${f1(x0)},${f1(y)} L${f1(x0 + 160 + rnd(i, 142) * 400)},${f1(y - 6 - rnd(i, 143) * 8)}`} stroke="#1E1A15" strokeOpacity={0.35} strokeWidth={1.2 + i * 0.12} />; })}
			{Array.from({length: 40}, (_, i) => { const y = 780 + rnd(i, 144) * 300, x = 1240 + rnd(i, 145) * 700 + (y - 780) * 0.2; return <ellipse key={'s' + i} cx={f1(x)} cy={f1(y)} rx={f1(1.5 + kD(y) * 6)} ry={f1(0.8 + kD(y) * 3)} fill="#14110E" opacity={0.6} />; })}
			<path d={`M-100,${BY - 14} L${C0[0] + 26},${BY - 14} L${C1[0] + 60},${C1[1]} L${C1[0] + 30},${C1[1]} L${C0[0] + 12},${BY - 6} L-100,${BY - 6} Z`} fill="#16120F" />
			<path d={`M-100,${BY - 14} L${C0[0] + 26},${BY - 14} L${C1[0] + 60},${C1[1]}`} fill="none" stroke="#E0CCA2" strokeOpacity={0.3} strokeWidth={1.6} />
			<path d={`M-100,${BY} L${C0[0]},${C0[1]} L${C1[0]},${C1[1]} L-100,1110 Z`} fill="url(#dzCamp)" />
			<g fill="#15100D" filter="url(#dzRim)"><path d={backD} />
				{[[76, 70], [30, 24]].map(([a, b], i) => <path key={i} d={`M-100,${f1(BY - a * kD(BY))} L${C0[0]},${f1(BY - a * kD(BY))} L${C0[0]},${f1(BY - b * kD(BY))} L-100,${f1(BY - b * kD(BY))} Z`} />)}</g>
			{/* the rampart (土垒) along the inside of the stakes, its top catching the sky */}
			<path d={`M-100,${BY + 4} L${C0[0] + 4},${BY + 4} L${C0[0] + 40},${BY + 72} L-100,${BY + 72} Z`} fill="#40382E" />
			<path d={`M-100,${BY + 72} L${C0[0] + 40},${BY + 72} L${C0[0] + 48},${BY + 88} L-100,${BY + 88} Z`} fill="#221C17" />
			<path d={`M-100,${BY + 5} L${C0[0] + 4},${BY + 5}`} stroke="#E0CCA2" strokeOpacity={0.28} strokeWidth={2} />
			{CT.map(([x, y], i) => <Tent key={i} x={x} y={y} w={280 * kD(y)} c={i % 2 ? '#2E2822' : '#28231D'} />)}
			{[[180, 928], [640, 950]].map(([x, y], i) => <g key={'l' + i}><circle cx={x} cy={y - 24} r={46} fill="#F3DDB4" opacity={0.13} filter="url(#dzB6)" /><circle cx={x} cy={y - 24} r={2.6} fill="#FFF0D0" /></g>)}
			<g fill="#16110E" color="#16110E" filter="url(#dzRim)">
				<g transform={at(330, 900, kD(900) * 0.6)}><Trebuchet a={-108} ropes={[]} sling="hang" far="#2A231C" /></g>
				<g transform={at(640, 906, kD(906) * 0.6)}><Trebuchet a={-116} ropes={[]} sling="hang" far="#2A231C" /></g>
				{[[120, 852], [480, 858], [950, 858], [560, 992]].map(([x, y], i) => <Npc key={i} x={x} y={y} k={kD(y)} kind="ji" flip={i === 3} />)}
				<g transform={at(770, 862, kD(862))}><Banner h={420} w={70} ch="曹" cloth="#4E1E18" clothS="#2C100C" ink="#EAD4A8" wave={wv(7)} /></g>
				<g transform={at(220, 856, kD(856))}><Banner h={400} w={66} ch="曹" cloth="#4E1E18" clothS="#2C100C" ink="#EAD4A8" wave={wv(8)} /></g>
			</g>
			<ellipse cx={872} cy={CY + 1} rx={34} ry={3.5} fill="#0A0806" opacity={0.5} />
			<g filter="url(#dzHero)"><g transform={`translate(860,${f1(CY - 750 * S)}) scale(${S.toFixed(4)})`}>
				<Cao pal={PAL} id="dzc" old armour arm={arm} cape={0.35 + 0.15 * Math.sin(t * 1.4)} />
			</g></g>
			<g fill="#120D0A" filter="url(#dzRim)"><path d={sideD} />
				{[[76, 70], [30, 24]].map(([a, b], i) => <path key={i} d={`M${C0[0]},${f1(C0[1] - a * kD(C0[1]))} L${C1[0]},${f1(C1[1] - a * kD(C1[1]))} L${C1[0]},${f1(C1[1] - b * kD(C1[1]))} L${C0[0]},${f1(C0[1] - b * kD(C0[1]))} Z`} />)}</g>
		</Pl>
		<rect width={W} height={H} fill="url(#dzVig)" />
	</Svg>; };
