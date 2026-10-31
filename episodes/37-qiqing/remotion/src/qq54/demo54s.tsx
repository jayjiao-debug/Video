import React from 'react';
import {Img, staticFile} from 'remotion';
import {W, H} from '../qq50/kit50';
import {RimF, P, rnd, f1} from './cao54b';
import {LampStand} from './npc54b';
import {SIL, ACC, limb} from './set54bs';
import {CaoSeated, CaoSeatedShadow} from './set54bs2';
import {K5, K6, cl, ease} from './scenes54bs';
/* ep54 demo · part 2 scenes by the set builder. t = FILM time (s).
   Guandu = cards 22–24 (84.32–96.27): K5 animated → cut to the tent (曹操 writes to 荀彧) → close-up of 荀彧's slip letter unrolling.
   Handover = card 25 (96.27–100.26): K6 animated, ending exactly on the handover frame at 100.22.
   Drop = cards 26–27 (100.26–108.22): the owner's AI test image as a placeholder, with the hit, embers and heat shimmer. */
const BAR = (n: number) => 0.654 + 1.99203 * n;
const B42 = BAR(42), B44 = BAR(44), B46 = BAR(46), B48 = BAR(48), B50 = BAR(50), B52 = BAR(52);
const Svg: React.FC<{children: React.ReactNode; tf?: string}> = ({children, tf}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}><g transform={tf}>{children}</g></svg>;
const Blur: React.FC<{id: string; s: number}> = ({id, s}) => <filter id={id} x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation={s} /></filter>;
/** a push toward (fx, fy) by z */
const push = (z: number, fx: number, fy: number, dx = 0, dy = 0) => `translate(${f1(fx + dx)},${f1(fy + dy)}) scale(${(1 + z).toFixed(5)}) translate(${-fx},${-fy})`;

/* ---------- card 23 · the tent at night: 曹操 (46) writes to 荀彧 by one lamp ---------- */
const Tent: React.FC<{t: number}> = ({t}) => { const u = (t - B44) / (B46 - B44), FY = 915, k = 4.7, CX = 760;
	const LX = CX + 104 * k, LY = FY - 36 * k;                     // the lamp stands on the far end of the desk
	const flame: P = [LX, LY - 34 * k];
	const fl = 1 + Math.sin(t * 13.1) * 0.03 + Math.sin(t * 7.3 + 1) * 0.04;
	/* acting: he writes (small strokes) … stops, lifts the brush, his head sinks a little: 想退了 */
	const w = cl((t - B44 - 2.3) / 0.6), wr = 1 - ease(w);
	const hand: P = [Math.sin(t * 9.4) * 0.9 * wr + w * 1.5, Math.sin(t * 6.1 + 0.4) * 0.5 * wr - ease(w) * 2.6];
	const tilt = 14 + ease((t - B44 - 2.5) / 1.1) * 7;
	return <Svg tf={push(0.075 * ease(u * 0.9 + 0.05), CX + 60, 520)}>
		<defs>
			<radialGradient id="dtLamp" cx={flame[0]} cy={flame[1]} r="1300" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F3DDB4" stopOpacity={0.6 * fl} /><stop offset="0.16" stopColor="#E9CB98" stopOpacity={0.34 * fl} /><stop offset="0.5" stopColor="#B08A64" stopOpacity="0.1" /><stop offset="1" stopColor="#B08A64" stopOpacity="0" /></radialGradient>
			<radialGradient id="dtLg"><stop offset="0" stopColor="#FFF0D0" stopOpacity="0.55" /><stop offset="0.3" stopColor="#F3DDB4" stopOpacity="0.16" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient>
			<linearGradient id="dtCanvas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A231D" /><stop offset="1" stopColor="#40352A" /></linearGradient>
			<linearGradient id="dtRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120E0B" /><stop offset="1" stopColor="#2A221B" /></linearGradient>
			<linearGradient id="dtFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2E24" /><stop offset="1" stopColor="#140F0B" /></linearGradient>
			<linearGradient id="dtNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1A2830" /><stop offset="1" stopColor="#34444A" /></linearGradient>
			<radialGradient id="dtVig" cx="0.55" cy="0.5" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
			<Blur id="dtb4" s={4} /><Blur id="dtb10" s={10} /><Blur id="dtb2" s={2} />
			<RimF id="dtHero" lx={1} ly={-0.4} k={4} c="#FFE6C0" o={0.95} lx2={-1} ly2={-0.2} k2={3.4} c2={ACC} o2={0.9} blur={0.9} />
			<RimF id="dtRim" lx={1} ly={-0.3} k={2.4} c="#FFE0B0" o={0.8} />
		</defs>
		{/* P0 the tent: the back wall of canvas in panels, the roof sloping up toward us, two poles */}
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#dtCanvas)" />
		<path d="M-200,-200 L2120,-200 L2120,170 C1500,250 420,250 -200,170 Z" fill="url(#dtRoof)" />
		{Array.from({length: 16}, (_, i) => { const x = -60 + i * 140; return <path key={i} d={`M${x},${232 - Math.abs(x - 960) * 0.06} L${x + (x - 960) * 0.04},820`} stroke="#000" strokeOpacity={0.2} strokeWidth={2} />; })}
		{Array.from({length: 9}, (_, i) => { const x = -100 + i * 260; return <path key={i} d={`M${x},-200 L${x + (x - 960) * 0.25},${236 - Math.abs(x - 960) * 0.06}`} stroke="#000" strokeOpacity={0.3} strokeWidth={2.5} />; })}
		<path d="M-200,170 C420,250 1500,250 2120,170" fill="none" stroke="#E9CB98" strokeOpacity={0.12} strokeWidth={3} />
		{/* the door flap open on the night: the camp outside, a guard's silhouette, the palisade */}
		<path d="M150,330 L380,300 L400,820 L130,820 Z" fill="url(#dtNight)" />
		<g fill="#0E1416"><path d="M130,700 L400,690 L400,820 L130,820 Z" />{Array.from({length: 16}, (_, i) => <path key={i} d={`M${136 + i * 17},700 L${142 + i * 17},664 L${148 + i * 17},700 Z`} />)}</g>
		<g transform="translate(300,760) scale(0.62)" fill="#0A0E10"><path d="M-8,0 L-10,-80 C-12,-110 -8,-130 -2,-140 L8,-140 C12,-130 14,-110 12,-80 L10,0 Z" /><circle cx={3} cy={-152} r={9} /><rect x={14} y={-260} width={2.6} height={262} /></g>
		<path d="M150,330 C200,480 230,640 210,820 L120,820 L120,330 Z" fill="#3A2E24" /><path d="M380,300 C340,470 330,650 360,820 L420,820 L420,300 Z" fill="#33291F" />
		<path d="M150,330 C200,480 230,640 210,820" fill="none" stroke="#E9CB98" strokeOpacity={0.12} strokeWidth={3} />
		{[560, 1700].map((x) => <g key={x}><rect x={x - 11} y={-200} width={22} height={1020} fill="#1E1610" /><rect x={x + (x < 900 ? 7 : -11)} y={-200} width={4} height={1020} fill="#E9CB98" opacity={x < 900 ? 0.14 : 0.22} /></g>)}
		{/* his 札甲 on a stand, his sword on a rack: a quiet still life at the back right */}
		<g transform="translate(1500,820)">
			<rect x={-4} y={-300} width={8} height={300} fill="#1C140F" /><rect x={-60} y={-280} width={120} height={8} fill="#1C140F" />
			<path d="M-56,-272 C-60,-220 -58,-170 -52,-120 L52,-120 C58,-170 60,-220 56,-272 C30,-284 -30,-284 -56,-272 Z" fill="#2A2826" />
			{Array.from({length: 7}, (_, i) => <rect key={i} x={-56} y={-262 + i * 20} width={112} height={2.4} fill="#6E2C22" opacity={0.6} />)}
			<path d="M20,-272 C30,-220 32,-170 30,-120 L52,-120 C58,-170 60,-220 56,-272 Z" fill="#9A968C" opacity={0.18} />
			<path d="M-36,-120 L36,-120 L42,-60 L-42,-60 Z" fill="#26201C" />
			<rect x={-50} y={-6} width={100} height={6} fill="#1C140F" />
		</g>
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#dtLamp)" />
		{/* his lamp shadow on the canvas */}
		<g transform={`translate(${CX - 250},836) scale(${k * 1.3},${k * 1.12})`} fill="#140C08" color="#140C08" opacity={0.55} filter="url(#dtb2)"><CaoSeatedShadow /></g>
		{/* P1 the floor: matting, the lamp's pool */}
		<rect x={-200} y={820} width={W + 400} height={460} fill="url(#dtFloor)" />
		{Array.from({length: 6}, (_, i) => <path key={i} d={`M-200,${840 + i * i * 7 + i * 16} L2120,${840 + i * i * 7 + i * 16}`} stroke="#000" strokeOpacity={0.18} strokeWidth={1.5} />)}
		<ellipse cx={LX - 200} cy={960} rx={620} ry={110} fill="#F3DDB4" opacity={0.1 * fl} />
		<path d={`M520,${FY - 22} L1300,${FY - 22} L1330,${FY} L490,${FY} Z`} fill="#4A3C2E" /><rect x={490} y={FY} width={840} height={8} fill="#2A2018" />
		{/* the desk, the slips, the inkstone, the little lamp on it */}
		<g>
			<path d={`M${CX + 22 * k},${FY - 33 * k} L${CX + 112 * k},${FY - 33 * k} L${CX + 106 * k},${FY - 39 * k} L${CX + 28 * k},${FY - 39 * k} Z`} fill="#6E4A30" />
			<rect x={CX + 20 * k} y={FY - 33 * k} width={94 * k} height={3.4 * k} fill="#2A1A10" /><rect x={CX + 20 * k} y={FY - 33 * k} width={94 * k} height={0.7 * k} fill="#F3DDB4" opacity={0.3} />
			{[[25, -1], [108, 1]].map(([x, fq]) => <path key={x} d={`M${CX + (x - 2.2) * k},${FY - 29.6 * k} L${CX + (x + 2.2) * k},${FY - 29.6 * k} L${CX + (x + 2.6 + fq * 2) * k},${FY} L${CX + (x - 2.4 + fq * 1.4) * k},${FY} Z`} fill="#24170F" />)}
			{Array.from({length: 22}, (_, i) => { const x0 = CX + (34 + i * 2.1) * k; return <path key={i} d={`M${x0},${FY - 33.4 * k} L${x0 + 2.5 * k},${FY - 38.6 * k} L${x0 + 4.3 * k},${FY - 38.6 * k} L${x0 + 1.8 * k},${FY - 33.4 * k} Z`} fill={i % 2 ? '#CDB88A' : '#BCA676'} />; })}
			{Array.from({length: 22}, (_, i) => { const x0 = CX + (36 + i * 2.1) * k; const done = i < 6 + Math.floor(cl((t - B44) / 2.3) * 5);
				return <path key={i} d={`M${x0 + 1.4 * k},${FY - 34.4 * k} L${x0 + 2.4 * k},${FY - 36.4 * k} M${x0 + 2.6 * k},${FY - 36.8 * k} L${x0 + 3.2 * k},${FY - 38 * k}`} stroke="#2A1A10" strokeWidth={0.45 * k} opacity={done ? 0.75 : 0} />; })}
			<path d={`M${CX + 34 * k},${FY - 35 * k} L${CX + 81 * k},${FY - 35 * k} M${CX + 35 * k},${FY - 37.2 * k} L${CX + 82 * k},${FY - 37.2 * k}`} stroke="#5A3A26" strokeWidth={0.5 * k} />
			<rect x={CX + 20.5 * k} y={FY - 35.6 * k} width={10 * k} height={2.4 * k} fill="#141416" /><rect x={CX + 20.5 * k} y={FY - 35.6 * k} width={10 * k} height={0.5 * k} fill="#8A8A86" opacity={0.6} />
			{/* the lamp: a Han 豆形灯 (a dish on a stem) */}
			<g fill="#140D0A" filter="url(#dtRim)">
				<path d={`M${LX - 7 * k},${LY} C${LX - 6 * k},${LY - 2 * k} ${LX - 2 * k},${LY - 2.4 * k} ${LX - 1 * k},${LY - 3 * k} L${LX - 0.8 * k},${LY - 26 * k} L${LX - 5 * k},${LY - 28 * k} C${LX - 5 * k},${LY - 31 * k} ${LX - 2 * k},${LY - 32 * k} ${LX},${LY - 32 * k} C${LX + 2 * k},${LY - 32 * k} ${LX + 5 * k},${LY - 31 * k} ${LX + 5 * k},${LY - 28 * k} L${LX + 0.8 * k},${LY - 26 * k} L${LX + 1 * k},${LY - 3 * k} C${LX + 2 * k},${LY - 2.4 * k} ${LX + 6 * k},${LY - 2 * k} ${LX + 7 * k},${LY} Z`} />
			</g>
			<circle cx={flame[0]} cy={flame[1] - 10} r={190} fill="url(#dtLg)" opacity={fl} />
			<path d={`M${flame[0] - 2.4 * k},${flame[1] + 1.6 * k} C${flame[0] - 3 * k},${flame[1] - 3 * k * fl} ${flame[0] + Math.sin(t * 5) * 0.6 * k},${flame[1] - 6 * k * fl} ${flame[0] + Math.sin(t * 5) * 0.8 * k},${flame[1] - 9.6 * k * fl} C${flame[0] + 1.6 * k},${flame[1] - 5 * k * fl} ${flame[0] + 3 * k},${flame[1] - 2 * k} ${flame[0] + 2.4 * k},${flame[1] + 1.6 * k} Z`} fill="#FFF0D0" />
			<ellipse cx={flame[0]} cy={flame[1] - 0.4 * k} rx={0.7 * k} ry={1.4 * k} fill="#F0A050" />
		</g>
		{/* P2 曹操 at 46, kneeling, writing; he stops */}
		<g filter="url(#dtHero)"><g transform={`translate(${CX},${FY - 4}) scale(${k})`}><CaoSeated id="dtc" mid tilt={tilt} hand={hand} /></g></g>
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#dtVig)" />
	</Svg>; };

/* ---------- card 24 · 荀彧's letter unrolling in lamplight: columns of brush marks; his hand closes on it ---------- */
const MARKS = Array.from({length: 26}, (_, c) => Array.from({length: 9}, (_, r) => Array.from({length: 3 + Math.floor(rnd(c * 9 + r, 5) * 4)}, (_, s) => {
	const q = rnd(c * 97 + r * 13 + s, 7), x0 = (rnd(c * 31 + r * 7 + s, 9) - 0.5) * 18, y0 = (rnd(c * 17 + r * 3 + s, 11) - 0.5) * 22;
	return q < 0.4 ? `M${f1(x0 - 9)},${f1(y0)} L${f1(x0 + 9)},${f1(y0 - 1.5)}` : q < 0.7 ? `M${f1(x0)},${f1(y0 - 11)} L${f1(x0 + 1)},${f1(y0 + 10)}` : q < 0.85 ? `M${f1(x0 - 6)},${f1(y0 - 6)} L${f1(x0 + 7)},${f1(y0 + 8)}` : `M${f1(x0 - 1)},${f1(y0 - 2)} l2.4,3`;
}).join(' ')));
const Letter: React.FC<{t: number}> = ({t}) => { const u = (t - B46) / (B48 - B46), SWD = 46, X0 = 1700, N = 26;
	const open = 140 + ease(cl((t - B46 - 0.2) / 2.6)) * 1060;          // unrolled width (px), the roll travels left
	const rollX = X0 - open;
	const fl = 1 + Math.sin(t * 12.7) * 0.03 + Math.sin(t * 6.9 + 2) * 0.04;
	/* the hand slides in from the lower right and closes on the slips */
	const hu = ease(cl((t - B46 - 2.85) / 0.7)), cu = ease(cl((t - B46 - 3.35) / 0.45));
	const hx = 1980 - hu * 470, hy = 1180 - hu * 330;
	const fing = (i: number): P[] => { const bx = -30 + i * 20, by = -40 + Math.abs(i - 1.5) * 6, L1 = 40 - Math.abs(i - 1.5) * 5;
		return [[bx, by], [bx - 8 - cu * 2, by - L1 + cu * 18], [bx - 14 - cu * 10, by - L1 * 1.7 + cu * 52]]; };
	return <Svg tf={push(0.06 * ease(u), 1100, 520, -u * 30, 0)}>
		<defs>
			<linearGradient id="dlWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1E140E" /><stop offset="0.6" stopColor="#3E2A1C" /><stop offset="1" stopColor="#5A3E28" /></linearGradient>
			<radialGradient id="dlLamp" cx="1760" cy="60" r="1500" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F3DDB4" stopOpacity={0.55 * fl} /><stop offset="0.3" stopColor="#E9CB98" stopOpacity={0.22 * fl} /><stop offset="1" stopColor="#E9CB98" stopOpacity="0" /></radialGradient>
			<linearGradient id="dlSlip" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#A8925E" /><stop offset="0.25" stopColor="#D4C08E" /><stop offset="0.8" stopColor="#C8B07C" /><stop offset="1" stopColor="#8E7A4E" /></linearGradient>
			<linearGradient id="dlRoll" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6A5634" /><stop offset="0.35" stopColor="#C8B07C" /><stop offset="0.6" stopColor="#E0CC9A" /><stop offset="1" stopColor="#7A6640" /></linearGradient>
			<radialGradient id="dlVig" cx="0.55" cy="0.48" r="0.72"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.65" /></radialGradient>
			<Blur id="dlb14" s={14} /><Blur id="dlb3" s={3} />
			<RimF id="dlHand" lx={0.8} ly={-0.6} k={3} c="#FFE6C0" o={0.8} lx2={-1} ly2={0.3} k2={3} c2={ACC} o2={0.8} />
			<clipPath id="dlOpen"><rect x={rollX} y={0} width={open + 400} height={H} /></clipPath>
		</defs>
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#dlWood)" />
		{Array.from({length: 26}, (_, i) => <path key={i} d={`M-200,${-120 + i * 54 + rnd(i, 3) * 20} C400,${-140 + i * 54} 1200,${-90 + i * 54} 2120,${-130 + i * 54 + rnd(i, 4) * 30}`} fill="none" stroke="#120A06" strokeOpacity={0.3} strokeWidth={1.4 + rnd(i, 5) * 2} />)}
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#dlLamp)" />
		{/* the slips: shadow, then the opened part (clipped at the roll), each slip a column of marks */}
		<rect x={rollX + 10} y={196} width={open} height={720} fill="#000" opacity={0.35} filter="url(#dlb3)" />
		<g clipPath="url(#dlOpen)">
			{Array.from({length: N}, (_, i) => { const x = X0 - (i + 1) * SWD; return <g key={i}>
				<rect x={x + 1} y={180} width={SWD - 3} height={720} rx={3} fill="url(#dlSlip)" />
				<rect x={x + 1} y={180} width={SWD - 3} height={720} rx={3} fill="#3A2A14" opacity={rnd(i, 21) * 0.12} />
				<g transform={`translate(${x + SWD / 2},${250})`} stroke="#1A120C" strokeWidth={3.6} strokeLinecap="round" fill="none" opacity={0.85}>
					{(i % 9 === 8 ? [] : MARKS[i]).map((d, r) => r < 9 - (i % 4 === 3 ? 4 : 0) ? <path key={r} d={d} transform={`translate(0,${r * 68})`} /> : null)}
				</g></g>; })}
			{[300, 780].map((y) => <path key={y} d={`M${X0 + 20},${y} ${Array.from({length: N}, (_, i) => `L${X0 - i * SWD - SWD / 2},${y + (i % 2 ? 4 : -4)}`).join(' ')}`} fill="none" stroke="#3A2414" strokeWidth={5} />)}
		</g>
		<path d={`M${X0},${180} L${X0 + 14},${200} L${X0 + 14},${880} L${X0},${900} Z`} fill="#6A5634" />
		{/* the roll (end-on spirals top and bottom) */}
		<g>
			<rect x={rollX - 46} y={164} width={70} height={752} rx={30} fill="url(#dlRoll)" />
			{[0, 1, 2, 3].map((j) => <path key={j} d={`M${rollX - 40 + j * 15},166 L${rollX - 40 + j * 15},914`} stroke="#4A381E" strokeOpacity={0.35} strokeWidth={1.2} />)}
			<ellipse cx={rollX - 11} cy={170} rx={35} ry={10} fill="#BCA676" /><ellipse cx={rollX - 11} cy={170} rx={22} ry={6} fill="none" stroke="#6E5638" strokeWidth={2} /><ellipse cx={rollX - 11} cy={170} rx={10} ry={3} fill="none" stroke="#6E5638" strokeWidth={2} />
			{[300, 780].map((y) => <rect key={y} x={rollX - 46} y={y - 3} width={70} height={6} fill="#3A2414" />)}
		</g>
		{/* the lamp, out of focus at the top right */}
		<g filter="url(#dlb14)"><circle cx={1760} cy={50} r={70} fill="#FFF0D0" opacity={0.7 * fl} /><circle cx={1760} cy={60} r={160} fill="#F3DDB4" opacity={0.18} /></g>
		{/* his hand: the dark sleeve with its red trim from the lower right, the hand closing over the slips */}
		{hu > 0.001 && <g filter="url(#dlHand)" transform={`translate(${f1(hx)},${f1(hy)}) rotate(-28)`}>
			<path d="M-70,30 C-60,-10 -10,-30 40,-24 L260,40 L260,260 L-40,260 Z" fill="#262A31" />
			<path d="M-70,30 C-60,-10 -10,-30 40,-24 L50,-4 C0,-12 -40,4 -54,40 Z" fill="#5C2E24" />
			<path d="M-56,36 C-50,-2 -6,-20 40,-14 L240,48 L240,90 L-40,80 Z" fill="#575B62" opacity={0.35} />
			<path d="M-56,20 C-66,-6 -60,-40 -40,-56 C-20,-70 26,-66 44,-50 C56,-38 54,-10 40,10 C10,20 -30,30 -56,20 Z" fill="#C38D64" />
			<path d="M-50,-4 C-54,-28 -40,-52 -16,-58 C10,-62 30,-56 40,-46 C20,-50 -10,-44 -28,-28 C-38,-18 -44,-8 -50,-4 Z" fill="#E8BC8E" />
			{[0, 1, 2, 3].map((i) => { const j = fing(i); return <g key={i}><path d={limb(j, [8.6 - i * 0.6, 7.8 - i * 0.6, 6.4 - i * 0.5])} fill="#C38D64" /><path d={limb(j.map((p) => [p[0] + 3, p[1]] as P), [2.6, 2.4, 2])} fill="#E8BC8E" opacity={0.8} /></g>; })}
			<path d={limb([[44, -20], [62, -44], [70, -66 + cu * 14]], [9, 8, 6.6])} fill="#B07E58" />
			<path d="M-20,-30 C-10,-36 6,-36 16,-30" fill="none" stroke="#9C6848" strokeWidth={1.4} opacity={0.6} />
		</g>}
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#dlVig)" />
	</Svg>; };

export const Guandu: React.FC<{t: number}> = ({t}) => {
	if (t < B44) { const u = ease((t - B42) / (B44 - B42)); return <K5 t={t} cam={{z: 0.075 * u, fx: 1075, fy: 600, px: -14 * u}} />; }
	if (t < B46) return <Tent t={t} />;
	return <Letter t={t} />;
};

/* ---------- card 25 · the handover: K6 animated, landing exactly on the key frame at 100.22 ---------- */
export const Handover: React.FC<{t: number}> = ({t}) => { const END = 100.22, u = cl((t - B48) / (END - B48));
	const z = -0.065 * Math.pow(1 - u, 1.6);
	const raise = ease((t - 97.25) / 2.1);
	return <K6 t={t} raise={raise} cam={{z, fx: 1240, fy: 640}} />;
};

/* ---------- cards 26–27 · the DROP placeholder: the owner's AI test frame with the hit, push, embers, heat ---------- */
const EMB = Array.from({length: 110}, (_, i) => ({x: rnd(i, 41) * W, sp: 70 + rnd(i, 42) * 190, ph: rnd(i, 43), sw: 10 + rnd(i, 44) * 50, fq: 0.6 + rnd(i, 45) * 1.6, r: 1.2 + rnd(i, 46) * 2.8, spark: rnd(i, 47) < 0.3, hot: rnd(i, 48)}));
export const Drop: React.FC<{t: number}> = ({t}) => { const d = Math.max(0, t - B50), fr = Math.floor(d * 30 + 1e-6);
	const flash = [0.5, 0.34, 0.18, 0.06][fr] ?? 0;
	const A = 26 * Math.exp(-d / 0.16) * (d < 0.55 ? 1 : 0);
	const shx = A * Math.sin(d * 97 + 0.7) * Math.cos(d * 31), shy = A * 0.7 * Math.sin(d * 83 + 2.1);
	const s = 1.06 + 0.17 * (1 - Math.pow(1 - cl(d / 1.8), 3)) + 0.012 * d;
	const pu = ease((t - B52) / (BAR(54) - B52 - 0.1));
	const panX = -175 * pu, panY = -18 * pu, s2 = s + 0.05 * pu;
	const hb = (0.024 + 0.004 * Math.sin(t * 2.3)).toFixed(4), hb2 = (0.006 + 0.0012 * Math.sin(t * 1.7 + 1)).toFixed(4);
	return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#140C08'}}>
		<svg width={0} height={0} style={{position: 'absolute'}}><defs>
			<filter id="dsHeat" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency={`${hb2} ${hb}`} numOctaves={2} seed={7} result="n" />
				<feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" /></filter>
		</defs></svg>
		<div style={{position: 'absolute', inset: 0, transform: `translate(${f1(shx + panX)}px,${f1(shy + panY)}px) scale(${s2.toFixed(4)})`, transformOrigin: '52% 42%'}}>
			<div style={{position: 'absolute', inset: 0, filter: 'url(#dsHeat)'}}>
				<Img src={staticFile('ep54_tmp/drop_ai_A.jpg')} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, objectFit: 'cover'}} />
			</div>
		</div>
		{/* the fire's breath: a warm wash that swells and settles */}
		<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 62% 38%, rgba(255,150,60,0.16) 0%, rgba(255,120,40,0.06) 40%, rgba(0,0,0,0) 70%)', opacity: 0.7 + 0.3 * Math.sin(t * 3.1)}} />
		{/* embers and sparks drifting up */}
		<svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
			<defs><radialGradient id="dsEm"><stop offset="0" stopColor="#FFE2A0" stopOpacity="1" /><stop offset="0.35" stopColor="#FF9A40" stopOpacity="0.6" /><stop offset="1" stopColor="#FF6A20" stopOpacity="0" /></radialGradient></defs>
			{EMB.map((e, i) => { const yy = H + 60 - (((t - 99) * e.sp + e.ph * (H + 160)) % (H + 160)), xx = e.x + Math.sin(t * e.fq + e.ph * 6) * e.sw + (t - 99) * 14 * (e.ph - 0.4);
				const o = (0.55 + 0.45 * Math.sin(t * (5 + e.fq * 4) + i)) * Math.min(1, (yy + 40) / 300) * Math.min(1, d * 3 + 0.2);
				if (o <= 0.02) return null;
				return e.spark ? <line key={i} x1={xx} y1={yy} x2={xx - Math.cos(t * e.fq + e.ph * 6) * e.sw * e.fq * 0.12} y2={yy + 10 + e.sp * 0.06} stroke={e.hot > 0.5 ? '#FFE6A8' : '#FFB060'} strokeWidth={e.r * 0.6} strokeLinecap="round" opacity={o} />
					: <circle key={i} cx={xx} cy={yy} r={e.r * 3} fill="url(#dsEm)" opacity={o} />; })}
		</svg>
		{flash > 0 && <div style={{position: 'absolute', inset: 0, background: '#FFC88A', opacity: flash}} />}
	</div>; };
void SIL; void LampStand;
