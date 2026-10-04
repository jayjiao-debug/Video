import React from 'react';
import {random} from 'remotion';
import {Ticket} from '../../src/art/Ox';
import {Layer, type Cam} from '../../src/art/sets/Airfield';

/**
 * 《八百人猜牛》 episode-only art: the swarm of tickets that circles the ox in the
 * cold open and bursts on the music's first hit.
 */

export type SwarmCfg = {
	f: number;
	/** orbit centre (hero-plane coordinates) */
	cx: number;
	cy: number;
	n?: number;
	/** frame the swarm blows outward (the hit) */
	burst?: number;
	/** frame it starts gathering */
	start?: number;
	/** draw only the half of the orbit in front of (1) or behind (−1) the ox */
	side: 1 | -1;
	/** 0..1 tightening before the hit */
	tighten?: number;
	/** 0..1 the tickets rush the lens (the wipe into the title card) */
	rush?: number;
	/** the tickets rise out of a point (the box slot) one by one, from frame `at` over `spread` frames */
	emerge?: {x: number; y: number; at: number; spread: number};
};

export const TicketSwarm: React.FC<SwarmCfg> = ({f, cx, cy, n = 56, burst, start = -60, side, tighten = 0, rush = 0, emerge}) => (
	<g>
		{Array.from({length: n}, (_, i) => {
			const r = (k: string) => random(`sw${k}${i}`);
			const rx = (250 + r('rx') * 430) * (1 - 0.18 * tighten);
			const ry = rx * (0.22 + r('ry') * 0.14);
			const dir = r('d') > 0.25 ? 1 : -1;
			const w = (0.014 + r('w') * 0.014) * dir;
			const th = r('p') * Math.PI * 2 + f * w * (1 + 1.4 * tighten);
			const depth = Math.sin(th);
			if (Math.sign(depth || 1) !== side) return null;
			const y0 = -110 - r('y') * 250 + 18 * Math.sin(f / (14 + r('fy') * 10) + i);
			let x = cx + Math.cos(th) * rx;
			let y = cy + y0 + depth * ry;
			let o = Math.min(1, Math.max(0, (f - start - r('in') * 30) / 14));
			let grow = 1;
			if (emerge) {
				const born = emerge.at + r('in') * emerge.spread;
				if (f < born) return null;
				const t = Math.min(1, (f - born) / 26);
				const e = 1 - Math.pow(1 - t, 3);
				// out of the slot, up in an arc, into the orbit
				x = emerge.x + (x - emerge.x) * e;
				y = emerge.y + (y - emerge.y) * e - 60 * Math.sin(Math.PI * t);
				grow = 0.5 + 0.5 * e;
				o = Math.min(1, t * 4);
			}
			if (burst !== undefined && f >= burst) {
				const t = f - burst;
				const k = 1 + 0.09 * t + 0.004 * t * t;
				x = cx + (x - cx) * k + (r('bx') - 0.5) * 30 * t;
				y = cy + (y - cy) * k - 4 * t;
				o *= Math.max(0, 1 - t / 26);
			}
			if (rush > 0) {
				// fly at the lens: out from the centre of frame, growing fast (front half more)
				const k = rush * rush * (side > 0 ? 1 : 0.4);
				x = 960 + (x - 960) * (1 + 2.2 * k);
				y = 540 + (y - 540) * (1 + 2.2 * k) - 120 * k;
			}
			const s = grow * (0.22 + 0.08 * depth) * (0.8 + 0.4 * r('s')) * (1 + (side > 0 ? 9 : 2) * rush * rush * (0.5 + r('rs')));
			const spin = r('rot') * 360 + f * (2 + r('sp') * 5) * dir;
			const flipX = Math.cos(f * (0.08 + r('fl') * 0.1) + i);
			const lit = 0.55 + 0.45 * Math.max(0, Math.cos(th - 0.6));
			return (
				<g key={i} transform={`translate(${x},${y}) rotate(${spin}) scale(${s * flipX},${s})`} opacity={o}>
					<Ticket lod="mid" />
					<rect x={-100} y={-62} width={200} height={124} rx={6} fill="#1a1020" opacity={0.55 * (1 - lit)} />
				</g>
			);
		})}
	</g>
);

// ---------------------------------------------------------------- Galton's desk, seen from above

import {font as FONT} from '../../src/lib/theme';
import {P as PAL} from '../../src/art/palette';

const NUM = {fontVariantNumeric: 'lining-nums' as const};

/** Where things sit on the desk, top view (hero-plane coordinates). The lamp matches the elevation view's. */
export const TOP = {lamp: {x: 1500, y: 240}, box: {x: 250, y: 190}, ink: {x: 1760, y: 640}, rowY: 640};

/** The desk from above: oak planks, the lamp's brass foot and globe, its pool of light, the box, an inkwell. */
export const DeskTop: React.FC<{f: number; lamp?: number; children?: React.ReactNode; flare?: number}> = ({f, lamp = 1, children, flare = 0}) => {
	const fl = 0.95 + 0.03 * Math.sin(f / 3.3) + 0.02 * Math.sin(f / 1.9);
	return (
		<g>
			<defs>
				<radialGradient id="top-pool" cx={TOP.lamp.x} cy={TOP.lamp.y} r={1500} gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#ffd9a0" stopOpacity={0.55 * lamp * fl + 0.3 * flare} />
					<stop offset="0.35" stopColor="#c98a4a" stopOpacity={0.22 * lamp} />
					<stop offset="1" stopColor="#000" stopOpacity={0.7} />
				</radialGradient>
			</defs>
			{Array.from({length: 16}, (_, i) => (
				<g key={i}>
					<rect x={-3400} y={-500 + i * 130} width={9000} height={128} fill={['#5a3a24', '#62412a', '#55361f', '#5e3d26'][i % 4]} />
					{Array.from({length: 7}, (_, j) => (
						<path
							key={j}
							d={`M-3400,${-480 + i * 130 + j * 17} C-1000,${-470 + i * 130 + j * 17 + 8 * Math.sin(i + j)} 2000,${-490 + i * 130 + j * 17} 5600,${-478 + i * 130 + j * 17}`}
							stroke="#3a2416"
							strokeWidth={1.2}
							fill="none"
							opacity={0.35}
						/>
					))}
					<rect x={-3400} y={-500 + i * 130 + 126} width={9000} height={3} fill="#2a180e" opacity={0.7} />
				</g>
			))}
			{/* the box from above: lid and slot */}
			<g transform={`translate(${TOP.box.x},${TOP.box.y})`}>
				<rect x={-140} y={-96} width={280} height={192} rx={6} fill="#000" opacity={0.35} transform="translate(14,16)" />
				<rect x={-140} y={-96} width={280} height={192} rx={6} fill="#6b4a30" />
				<rect x={-126} y={-82} width={252} height={164} rx={4} fill="url(#wood)" />
				<rect x={-70} y={-7} width={140} height={14} rx={6} fill="#140d08" />
			</g>
			{/* inkwell and pen */}
			<g transform={`translate(${TOP.ink.x},${TOP.ink.y})`}>
				<circle r={44} fill="#000" opacity={0.35} transform="translate(10,12)" />
				<rect x={-40} y={-40} width={80} height={80} rx={10} fill="#1a2430" />
				<circle r={18} fill="url(#brass)" />
				<line x1={-20} y1={60} x2={-190} y2={150} stroke="#2a1e14" strokeWidth={7} strokeLinecap="round" />
			</g>
			{children}
			{/* light falls off away from the lamp */}
			<rect x={-3400} y={-500} width={9000} height={2200} fill="url(#top-pool)" />
			{/* the lamp from above: brass foot, the glass globe */}
			<g transform={`translate(${TOP.lamp.x},${TOP.lamp.y})`}>
				<circle r={420 * (1 + 0.4 * flare)} fill="url(#lantern-glow)" opacity={0.5 * lamp * fl + 0.5 * flare} />
				<circle r={92} fill="url(#brass)" />
				<circle r={64} fill="#fff6e0" opacity={0.9 * lamp} />
				<circle r={40} fill="#fffaf0" opacity={lamp} />
				<circle r={14} fill="#e8f0f4" opacity={0.5} />
			</g>
		</g>
	);
};

/** The back of a ticket: plain card, the number printed small. Same footprint as <Ticket>. */
export const TicketBack: React.FC<{no?: number}> = ({no = 394}) => (
	<g>
		<rect x={-96} y={-58} width={200} height={124} rx={6} fill="#000" opacity={0.3} />
		<rect x={-100} y={-62} width={200} height={124} rx={6} fill="url(#ticket-paper)" />
		<text x={0} y={8} textAnchor="middle" style={{...NUM, fontFamily: FONT.latin, fontWeight: 700, fontSize: 22, fill: PAL.ink, letterSpacing: '0.2em', opacity: 0.55}}>
			{`No ${String(no).padStart(4, '0')}`}
		</text>
	</g>
);

/** The show's card with the real dressed weight. Origin at its centre (420 × 250). */
export const OfficialCard: React.FC<{write?: number}> = ({write = 1}) => (
	<g>
		<rect x={-200} y={-115} width={420} height={250} rx={4} fill="#000" opacity={0.35} />
		<rect x={-210} y={-125} width={420} height={250} rx={4} fill="url(#ticket-paper)" />
		<rect x={-198} y={-113} width={396} height={226} fill="none" stroke={PAL.ink} strokeOpacity={0.35} />
		<g style={{fontFamily: FONT.latin, fill: PAL.ink, ...NUM}}>
			<text x={0} y={-78} textAnchor="middle" style={{fontWeight: 700, fontSize: 17, letterSpacing: '0.16em'}}>
				WEST OF ENGLAND FAT STOCK SHOW
			</text>
			<text x={0} y={-54} textAnchor="middle" style={{fontSize: 14, letterSpacing: '0.2em', opacity: 0.75}}>
				PLYMOUTH · 1906
			</text>
			<line x1={-150} y1={-40} x2={150} y2={-40} stroke={PAL.ink} strokeOpacity={0.4} />
			<text x={0} y={-10} textAnchor="middle" style={{fontSize: 18, fontStyle: 'italic', fontFamily: FONT.latinItalic}}>
				Dressed weight of the ox
			</text>
			<text x={0} y={62} textAnchor="middle" style={{fontWeight: 700, fontSize: 64, letterSpacing: '0.04em'}} opacity={write}>
				1198 lbs.
			</text>
		</g>
	</g>
);

// ---------------------------------------------------------------- Galton's bean machine, animated

const ROWS = 8;
const PIN = 18; // pin spacing
const BIN_BOTTOM = -17;
const BEAD = 7.4;

/**
 * The bean machine with beads actually falling: each bead bounces left or right at
 * every pin (its own coin toss) and piles into the bins, building the bell. Origin at
 * the base centre, same footprint as the static <Quincunx>.
 * `start`: frame the first bead drops; `every`: frames between beads; `n` beads.
 * `follow` (0..1): the chance a bead copies the bead before it (herding) instead of
 * tossing its own coin. `hero`: index of one bead drawn in gold. `glow`: the centre bin lights.
 */
export const BeanMachine: React.FC<{f: number; start: number; every?: number; n?: number; follow?: number; hero?: number; glow?: number; seed?: string; heroAt?: number}> = ({
	f,
	start,
	every = 2,
	n = 110,
	follow = 0,
	hero,
	glow = 0,
	seed = 'bm',
	heroAt,
}) => {
	const paths: number[][] = [];
	const binCount = new Array(ROWS + 1).fill(0);
	const beads: React.ReactNode[] = [];
	const total = heroAt === undefined ? n : n + 1;
	for (let i = 0; i < total; i++) {
		const isLone = heroAt !== undefined && i === n;
		const p: number[] = [];
		for (let r = 0; r < ROWS; r++) {
			const copy = i > 0 && random(`${seed}f${i}${r}`) < follow;
			p.push(copy ? paths[i - 1][r] : random(`${seed}${i}r${r}`) < 0.5 ? 0 : 1);
		}
		paths.push(p);
		const bin = p.reduce((a, b) => a + b, 0);
		const k = binCount[bin]++;
		const t = f - (isLone ? heroAt! : start + i * every);
		if (t < 0) continue;
		// through the pins: 3 frames per row, then a fall into the bin
		const rowF = isLone ? 6 : 3; // the lone bead falls slower, so you can follow it
		let x = 0;
		let y = -262;
		if (t < ROWS * rowF) {
			const r = Math.floor(t / rowF);
			const u = (t % rowF) / rowF;
			const before = p.slice(0, r).reduce((a, b) => a + (b ? 1 : -1), 0);
			const step = p[r] ? 1 : -1;
			x = ((before + step * u) * PIN) / 2;
			y = -252 + r * 16 + u * 16 - 6 * Math.sin(Math.PI * u);
		} else {
			x = (bin - ROWS / 2) * PIN;
			const yTop = -252 + ROWS * 16;
			const yEnd = BIN_BOTTOM - k * BEAD;
			const tf = t - ROWS * rowF;
			y = Math.min(yEnd, yTop + 0.9 * tf * tf + 4 * tf);
		}
		const isHero = hero === i || isLone;
		if (isLone) beads.push(<circle key={`${i}h`} cx={x} cy={y} r={14} fill="url(#lantern-glow)" opacity={0.9} />);
		beads.push(<circle key={i} cx={x} cy={y} r={isHero ? 4.6 : 3.6} fill={isHero ? '#f1c56d' : '#d8cdb4'} stroke={isHero ? '#fff1cf' : 'none'} strokeWidth={1} />);
	}
	return (
		<g>
			<rect x={-96} y={-300} width={192} height={300} rx={6} fill="url(#wood)" />
			<rect x={-84} y={-288} width={168} height={276} fill="#1a1612" />
			<path d="M-24,-288 L-6,-266 L6,-266 L24,-288 Z" fill="#3a2a1e" />
			{Array.from({length: ROWS}, (_, r) =>
				Array.from({length: r + 1}, (_, c) => <circle key={`${r}-${c}`} cx={(c - r / 2) * PIN} cy={-248 + r * 16} r={2.2} fill="#c9a95e" />),
			)}
			{Array.from({length: ROWS + 2}, (_, i) => (
				<line key={i} x1={(i - ROWS / 2 - 0.5) * PIN} y1={-112} x2={(i - ROWS / 2 - 0.5) * PIN} y2={-12} stroke="#5a4632" strokeWidth={2} />
			))}
			{glow > 0 ? <rect x={-PIN / 2} y={-112} width={PIN} height={100} fill="#f1c56d" opacity={0.25 * glow} /> : null}
			{beads}
			<rect x={-84} y={-288} width={168} height={276} fill="url(#glass)" opacity={0.1} />
			<rect x={-96} y={-12} width={192} height={12} fill="#3e2a1a" />
		</g>
	);
};

// ---------------------------------------------------------------- Zurich, 2011: the estimation lab

/** monitor screen centres on the hero plane, and the screen size */
export const LAB = {screens: [330, 750, 1170, 1590].map((x) => ({x, y: 520})), w: 300, h: 190, deskY: 700};

/**
 * A seminar room at night: blue-grey walls, blinds with the city's cool light, a long
 * desk of flat monitors, students seen from behind in office chairs, one warm desk lamp
 * at the end of the row. `screen(i)` draws the content of monitor i (screen-centred
 * coordinates, LAB.w × LAB.h). `students` is drawn between the monitors and the chairs.
 */
export const LabZurich: React.FC<{f: number; cam: Cam; screen: (i: number) => React.ReactNode; students?: React.ReactNode; chairs?: boolean; power?: number}> = ({f, cam, screen, students, chairs = true, power = 1}) => {
	return (
		<g>
			<Layer cam={cam} depth={0.6}>
				<rect x={-600} y={-400} width={3100} height={1800} fill="#151b27" />
				{/* blinds with the city behind */}
				<g transform="translate(1180,40)">
					<rect width={620} height={330} fill="#1d2a40" />
					{Array.from({length: 40}, (_, i) => (
						<rect key={i} x={20 + ((i * 97) % 580)} y={160 + ((i * 53) % 150)} width={6} height={8} fill="#ffd98f" opacity={0.25 + 0.4 * Math.abs(Math.sin(i))} />
					))}
					{Array.from({length: 22}, (_, i) => (
						<rect key={i} x={0} y={i * 15} width={620} height={9} fill="#27324a" opacity={0.85} />
					))}
					<rect x={-14} y={-14} width={648} height={358} fill="none" stroke="#0f141e" strokeWidth={16} />
				</g>
				{/* whiteboard, dim, with last lecture's ghost marks */}
				<g transform="translate(120,60)">
					<rect width={700} height={300} fill="#2a3140" />
					<path d="M40,80 C120,60 200,110 300,70 M60,170 L320,170 M380,90 C440,140 520,60 600,120" stroke="#3a4458" strokeWidth={6} fill="none" />
					<rect x={0} y={300} width={700} height={14} fill="#3a4152" />
				</g>
				<g transform="translate(1000,120)">
					<circle r={34} fill="#d8dde6" />
					<circle r={30} fill="#eef1f5" />
					<line x1={0} y1={0} x2={0} y2={-20} stroke="#222" strokeWidth={3} />
					<line x1={0} y1={0} x2={16} y2={4} stroke="#222" strokeWidth={3} />
				</g>
				<rect x={-600} y={640} width={3100} height={800} fill="#10151f" />
			</Layer>
			<Layer cam={cam} depth={1}>
				{/* the long desk */}
				<rect x={-500} y={LAB.deskY} width={3000} height={22} fill="#3a3f4a" />
				<rect x={-500} y={LAB.deskY + 22} width={3000} height={600} fill="#1b1f28" />
				{LAB.screens.map((sc, i) => (
					<g key={i}>
						{/* the monitor's glow on the desk and wall */}
						<ellipse cx={sc.x} cy={LAB.deskY} rx={260} ry={34} fill="#9fc3e6" opacity={0.18 * power} />
						<circle cx={sc.x} cy={sc.y} r={300} fill="url(#glow-moon)" opacity={0.35 * power} />
						<rect x={sc.x - 20} y={sc.y + LAB.h / 2} width={40} height={LAB.deskY - sc.y - LAB.h / 2} fill="#23262d" />
						<rect x={sc.x - 70} y={LAB.deskY - 8} width={140} height={10} rx={4} fill="#23262d" />
						<rect x={sc.x - LAB.w / 2 - 12} y={sc.y - LAB.h / 2 - 12} width={LAB.w + 24} height={LAB.h + 24} rx={8} fill="#16181d" />
						<rect x={sc.x - LAB.w / 2} y={sc.y - LAB.h / 2} width={LAB.w} height={LAB.h} fill="#0b0d12" />
						<rect x={sc.x - LAB.w / 2} y={sc.y - LAB.h / 2} width={LAB.w} height={LAB.h} fill="#e9eef5" opacity={power} />
						<g transform={`translate(${sc.x},${sc.y})`}>{screen(i)}</g>
						{/* keyboard */}
						<rect x={sc.x - 90} y={LAB.deskY - 4} width={180} height={8} rx={3} fill="#2c2f36" />
					</g>
				))}
				{/* the warm practical: a desk lamp at the end of the row */}
				<g transform={`translate(1830,${LAB.deskY})`}>
					<circle cy={-170} r={360} fill="url(#lantern-glow)" opacity={0.55 + 0.03 * Math.sin(f / 3)} />
					<path d="M-30,0 L30,0 L6,-10 L4,-120 L-60,-170" stroke="#2a2a2e" strokeWidth={8} fill="none" />
					<path d="M-100,-150 L-30,-200 L-10,-160 Z" fill="#2a2a2e" />
					<circle cx={-52} cy={-160} r={12} fill="#fff1cf" />
				</g>
				{students}
				{chairs
					? LAB.screens.map((sc, i) => (
							<g key={`c${i}`} transform={`translate(${sc.x + (i % 2 ? 14 : -10)},0)`}>
								<rect x={-92} y={800} width={184} height={230} rx={40} fill="#0d0f14" />
								<rect x={-92} y={800} width={184} height={230} rx={40} fill="none" stroke="#9fc3e6" strokeOpacity={0.25} strokeWidth={2} />
							</g>
						))
					: null}
			</Layer>
		</g>
	);
};
