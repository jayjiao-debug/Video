import React, {useMemo} from 'react';
import {random} from 'remotion';
import {CAM0, Layer, type Cam} from './Airfield';

/**
 * Stanford, 1959 (《越难越爱》).
 *  - Quad1959: the Main Quad's sandstone arcade at night: round Romanesque arches on
 *    squat columns, red tile roofs, palms, iron lamps. Warm lamplight inside the
 *    arcade is the key; a cool moon rims the palms.
 *  - Lab1959: a small psychology lab: wood wainscot, cream walls in lamplight,
 *    venetian blinds over a night window (cool slats), a chalkboard (slot `board`),
 *    a desk with a green banker's lamp (the key), a reel-to-reel recorder and an
 *    intercom on a side table.
 */

// ---------------------------------------------------------------- props

/** reel-to-reel tape recorder (late-1950s, wood-and-grey case); `t` spins the reels. Origin at the base centre. */
export const TapeRecorder: React.FC<{t?: number; on?: number}> = ({t = 0, on = 1}) => (
	<g>
		<ellipse cx={0} cy={4} rx={190} ry={12} fill="#000" opacity={0.35} />
		<rect x={-170} y={-150} width={340} height={150} rx={10} fill="#5a4a3e" />
		<rect x={-160} y={-142} width={320} height={110} rx={6} fill="#8a8a86" />
		<rect x={-160} y={-142} width={320} height={110} rx={6} fill="url(#glass)" opacity={0.15} />
		{[-80, 80].map((x, i) => (
			<g key={i} transform={`translate(${x},-150) rotate(${t * (i ? 2.4 : 3.1)})`}>
				<circle r={72} fill="#2a2420" />
				<circle r={60} fill="#3a2e24" />
				<circle r={60} fill="none" stroke="#6a5a48" strokeWidth={2} />
				{[0, 120, 240].map((a) => (
					<ellipse key={a} cx={34 * Math.cos((a * Math.PI) / 180)} cy={34 * Math.sin((a * Math.PI) / 180)} rx={13} ry={13} fill="#8a8a86" />
				))}
				<circle r={9} fill="#c9c4b8" />
			</g>
		))}
		<path d="M-80,-150 L-60,-60 L60,-60 L80,-150" fill="none" stroke="#3a2a1e" strokeWidth={3} />
		<rect x={-50} y={-70} width={100} height={18} rx={3} fill="#3a3a38" />
		{[-120, -90, 90, 120].map((x, i) => (
			<circle key={i} cx={x} cy={-48} r={9} fill="#2a2a28" stroke="#c9c4b8" strokeWidth={1.5} />
		))}
		<circle cx={0} cy={-20} r={5} fill="#ff6a3a" opacity={0.3 + 0.7 * on} />
	</g>
);

/** 1950s headphones, side view, resting or worn; origin at the band's centre */
export const Headphones59: React.FC<{cord?: string}> = ({cord}) => (
	<g>
		<path d="M-62,6 C-62,-74 62,-74 62,6" fill="none" stroke="#2a2420" strokeWidth={9} strokeLinecap="round" />
		<path d="M-62,6 C-62,-74 62,-74 62,6" fill="none" stroke="#8a7a62" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
		<rect x={-80} y={-6} width={32} height={50} rx={12} fill="#3a2e26" stroke="#1a1410" strokeWidth={2} />
		<rect x={48} y={-6} width={32} height={50} rx={12} fill="#3a2e26" stroke="#1a1410" strokeWidth={2} />
		{cord ? <path d={cord} fill="none" stroke="#2a2420" strokeWidth={3} /> : null}
	</g>
);

/** a wall intercom with a speaker grille; `talk` 0..1 lights its little lamp */
export const Intercom: React.FC<{talk?: number}> = ({talk = 0}) => (
	<g>
		<rect x={-60} y={-80} width={120} height={80} rx={8} fill="#6a5a48" />
		<rect x={-50} y={-72} width={100} height={52} rx={4} fill="#3a3028" />
		{Array.from({length: 6}, (_, i) => (
			<line key={i} x1={-42} y1={-66 + i * 8} x2={42} y2={-66 + i * 8} stroke="#8a7a62" strokeWidth={2} />
		))}
		<circle cx={36} cy={-10} r={5} fill="#ff9a4a" opacity={0.25 + 0.75 * talk} />
		<circle cx={36} cy={-10} r={16} fill="url(#lantern-glow)" opacity={talk} />
	</g>
);

/** a shock generator (Gerard & Mathewson 1966), a grey box with a big dial; `k` 0..1 turns the dial */
export const ShockBox: React.FC<{k?: number; spark?: number}> = ({k = 0, spark = 0}) => {
	const a = (-210 + 240 * k) * (Math.PI / 180);
	return (
		<g>
			<ellipse cx={0} cy={4} rx={190} ry={12} fill="#000" opacity={0.35} />
			<rect x={-170} y={-170} width={340} height={170} rx={8} fill="#6a6e72" />
			<rect x={-170} y={-170} width={340} height={20} rx={8} fill="#8a8e92" />
			<g transform="translate(-60,-80)">
				<circle r={58} fill="#e8e2d4" />
				{Array.from({length: 11}, (_, i) => {
					const t = (-210 + i * 24) * (Math.PI / 180);
					return <line key={i} x1={50 * Math.cos(t)} y1={50 * Math.sin(t)} x2={40 * Math.cos(t)} y2={40 * Math.sin(t)} stroke={i > 7 ? '#c0392b' : '#3a3a38'} strokeWidth={2.5} />;
				})}
				<line x1={0} y1={0} x2={44 * Math.cos(a)} y2={44 * Math.sin(a)} stroke="#c0392b" strokeWidth={4} strokeLinecap="round" />
				<circle r={10} fill="#2a2a28" />
			</g>
			<text x={70} y={-120} textAnchor="middle" style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 18, fill: '#2a2a28'}}>
				VOLTS
			</text>
			{[40, 100].map((x, i) => (
				<g key={i}>
					<circle cx={x} cy={-60} r={10} fill="#c0392b" />
					<path d={`M${x},-60 C${x + 30},10 ${x + 90},40 ${x + 160},30`} fill="none" stroke="#1a1a18" strokeWidth={3} />
				</g>
			))}
			{spark > 0 ? (
				<g opacity={spark}>
					<circle cx={-60} cy={-80} r={110} fill="#bfe0ff" opacity={0.25} filter="url(#blur-md)" />
					<path d="M110,-110 L140,-150 L130,-125 L170,-170" stroke="#e8f4ff" strokeWidth={4} fill="none" strokeLinecap="round" />
				</g>
			) : null}
		</g>
	);
};

/** a brass balance scale (her desk ornament); tilt in degrees (+ = left pan down). Origin at its base. */
export const Balance: React.FC<{tilt?: number; left?: React.ReactNode; right?: React.ReactNode}> = ({tilt = 0, left, right}) => {
	const r = (tilt * Math.PI) / 180;
	const arm = 230;
	const lx = -arm * Math.cos(r);
	const ly = -300 + arm * Math.sin(r);
	const rx = arm * Math.cos(r);
	const ry = -300 - arm * Math.sin(r);
	const pan = (x: number, y: number, load: React.ReactNode) => (
		<g transform={`translate(${x},${y})`}>
			<line x1={0} y1={0} x2={-70} y2={150} stroke="#a8823e" strokeWidth={2} />
			<line x1={0} y1={0} x2={70} y2={150} stroke="#a8823e" strokeWidth={2} />
			<g transform="translate(0,150)">{load}</g>
			<path d="M-90,150 C-80,180 80,180 90,150 Z" fill="url(#brass)" />
			<ellipse cx={0} cy={150} rx={90} ry={10} fill="#e8c878" />
		</g>
	);
	return (
		<g>
			<ellipse cx={0} cy={6} rx={110} ry={14} fill="#000" opacity={0.35} />
			<path d="M-90,0 L90,0 L60,-30 L-60,-30 Z" fill="url(#brass)" />
			<rect x={-8} y={-300} width={16} height={270} fill="url(#brass)" />
			<g transform={`rotate(${-tilt},0,-300)`}>
				<rect x={-arm} y={-306} width={arm * 2} height={12} rx={6} fill="url(#brass)" />
				<path d="M0,-306 L-8,-250 L8,-250 Z" fill="#7a5a28" />
			</g>
			<circle cx={0} cy={-300} r={16} fill="url(#brass)" />
			{pan(lx, ly, left)}
			{pan(rx, ry, right)}
		</g>
	);
};

/**
 * Flat-pack, in two readable states: `k` < 0.5 a neat stack of boards with the
 * instruction sheet (boards lift off one by one as k rises), k ≥ 0.5 the box standing,
 * its fabric drawer sliding in by k = 1. Origin at the floor, centre.
 */
export const FlatPack: React.FC<{k: number}> = ({k}) => {
	if (k < 0.5) {
		const left = Math.max(0, 5 - Math.floor(k * 10));
		return (
			<g>
				<ellipse cx={0} cy={4} rx={210} ry={12} fill="#000" opacity={0.3} />
				{Array.from({length: left}, (_, i) => (
					<g key={i} transform={`translate(${(i % 2) * 8 - 4},${-12 - i * 14})`}>
						<rect x={-170} y={0} width={340} height={12} rx={2} fill={i % 2 ? '#e8dfcf' : '#d8cfbe'} />
						<rect x={-170} y={0} width={340} height={3} fill="#fff" opacity={0.25} />
						<circle cx={-150} cy={6} r={2.4} fill="#8a8070" />
						<circle cx={150} cy={6} r={2.4} fill="#8a8070" />
					</g>
				))}
				<g transform={`translate(110,${-12 - left * 14}) rotate(-6)`}>
					<rect x={-50} y={-6} width={100} height={6} fill="#f4f0e8" />
					<path d="M-36,-6 L-20,-6 M-10,-6 L20,-6" stroke="#3a3a38" strokeWidth={1} />
				</g>
			</g>
		);
	}
	const d = Math.min(1, (k - 0.5) * 2);
	return (
		<g>
			<ellipse cx={0} cy={4} rx={156} ry={10} fill="#000" opacity={0.35} />
			<rect x={-130} y={-230} width={260} height={230} rx={4} fill="#e8dfcf" />
			<rect x={-130} y={-230} width={260} height={230} rx={4} fill="url(#apt-shade-r)" />
			<rect x={-116} y={-216} width={232} height={202} rx={3} fill="#2a2a30" />
			<g transform={`translate(${(1 - d) * 300},0)`} opacity={d > 0 ? 1 : 0}>
				<rect x={-108} y={-208} width={216} height={186} rx={3} fill="#3a3f52" />
				<rect x={-100} y={-200} width={200} height={170} rx={3} fill="#5a6278" />
				<rect x={-26} y={-124} width={52} height={14} rx={7} fill="#2a2e3c" />
			</g>
		</g>
	);
};

/** an L-shaped hex key */
export const AllenKey: React.FC = () => <path d="M0,0 L0,-46 L18,-46" fill="none" stroke="#7a7e86" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />;

// ---------------------------------------------------------------- the quad at night

const Arch: React.FC<{x: number; y: number; w: number; h: number; lit: number}> = ({x, y, w, h, lit}) => (
	<g transform={`translate(${x},${y})`}>
		{/* the dark opening, warm lamplight inside */}
		<path d={`M${-w / 2},0 L${-w / 2},${-h + w / 2} A${w / 2},${w / 2} 0 0 1 ${w / 2},${-h + w / 2} L${w / 2},0 Z`} fill="#2a1a12" />
		<path d={`M${-w / 2},0 L${-w / 2},${-h + w / 2} A${w / 2},${w / 2} 0 0 1 ${w / 2},${-h + w / 2} L${w / 2},0 Z`} fill="url(#lantern-glow)" opacity={0.85 * lit} />
		{/* voussoirs */}
		<path d={`M${-w / 2 - 22},${-h + w / 2} A${w / 2 + 22},${w / 2 + 22} 0 0 1 ${w / 2 + 22},${-h + w / 2}`} fill="none" stroke="#b89a72" strokeWidth={18} />
		{Array.from({length: 9}, (_, i) => {
			const a = Math.PI + (i / 8) * Math.PI;
			const r0 = w / 2 + 13;
			const r1 = w / 2 + 31;
			return <line key={i} x1={r0 * Math.cos(a)} y1={-h + w / 2 + r0 * Math.sin(a)} x2={r1 * Math.cos(a)} y2={-h + w / 2 + r1 * Math.sin(a)} stroke="#8a6e4e" strokeWidth={2} />;
		})}
	</g>
);

const Palm: React.FC<{x: number; y: number; s: number; f: number; seed: string}> = ({x, y, s, f, seed}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M0,0 C6,-120 -6,-260 10,-420" stroke="#14100e" strokeWidth={18} fill="none" />
		{Array.from({length: 9}, (_, i) => {
			const a = -Math.PI / 2 + (i - 4) * 0.36 + 0.04 * Math.sin(f / 40 + i + seed.length);
			const len = 150 + random(`${seed}${i}`) * 50;
			const ex = 10 + Math.cos(a) * len;
			const ey = -420 + Math.sin(a) * len * 0.6 + len * 0.35;
			return <path key={i} d={`M10,-420 Q${10 + Math.cos(a) * len * 0.5},${-420 + Math.sin(a) * len * 0.6 - 30} ${ex},${ey}`} stroke="#14100e" strokeWidth={10} fill="none" strokeLinecap="round" />;
		})}
	</g>
);

export const Quad1959: React.FC<{frame: number; cam?: Cam; children?: React.ReactNode; front?: React.ReactNode; door?: number}> = ({frame: f, cam = CAM0, children, front, door = 0.4}) => {
	const stars = useMemo(() => Array.from({length: 120}, (_, i) => ({x: random(`qs${i}`) * 2600 - 340, y: random(`qy${i}`) * 380, r: 0.6 + random(`qr${i}`) * 1.4})), []);
	return (
		<g>
			<Layer cam={cam} depth={0.1}>
				<rect x={-800} y={-600} width={3520} height={2200} fill="url(#sky-night)" />
				{stars.map((s, i) => (
					<circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#e8eef8" opacity={0.4 + 0.4 * Math.sin(f / 20 + i)} />
				))}
				<circle cx={1520} cy={140} r={30} fill="#eef2fb" />
				<circle cx={1520} cy={140} r={140} fill="url(#glow-moon)" opacity={0.6} />
			</Layer>
			<Layer cam={cam} depth={0.4}>
				{/* far hills and Hoover-tower-less 1959 skyline: low tile roofs */}
				<path d="M-800,560 C-400,520 0,540 400,520 C900,500 1400,540 2720,520 L2720,900 L-800,900 Z" fill="#141826" />
				<Palm x={180} y={640} s={0.7} f={f} seed="pa" />
				<Palm x={1760} y={640} s={0.8} f={f} seed="pb" />
			</Layer>
			<Layer cam={cam} depth={0.8}>
				{/* the arcade: tile roof, sandstone wall, a row of arches */}
				<path d="M-600,300 L2520,300 L2480,250 L-560,250 Z" fill="#6a2a20" />
				{Array.from({length: 40}, (_, i) => (
					<line key={i} x1={-560 + i * 80} y1={252} x2={-580 + i * 80} y2={300} stroke="#4a1a14" strokeWidth={3} />
				))}
				<rect x={-600} y={300} width={3120} height={480} fill="#c8a882" />
				<rect x={-600} y={300} width={3120} height={480} fill="#3a2a40" opacity={0.55} />
				{Array.from({length: 9}, (_, i) => (
					<Arch key={i} x={-200 + i * 300} y={780} w={210} h={400} lit={i === 5 ? 1 : 0.55} />
				))}
				{/* columns' capitals */}
				{Array.from({length: 10}, (_, i) => (
					<rect key={i} x={-350 + i * 300 - 22} y={560} width={44} height={22} fill="#b89a72" opacity={0.8} />
				))}
				{/* the lab door inside the 6th arch, ajar */}
				<g transform="translate(1300,780)">
					<rect x={-50} y={-210} width={100} height={210} fill="#1a100a" />
					<path d={`M-50,-210 L${-50 + 100 * door},-200 L${-50 + 100 * door},-8 L-50,0 Z`} fill="#ffcf8a" opacity={0.9} />
				</g>
				<rect x={-600} y={780} width={3120} height={400} fill="#2a2228" />
				<path d="M-600,780 L2520,780 L2520,800 L-600,800 Z" fill="#3a2e30" />
				{/* iron lamps */}
				{[420, 1120, 1820].map((x, i) => (
					<g key={i} transform={`translate(${x},780)`}>
						<line x1={0} y1={0} x2={0} y2={-240} stroke="#14100e" strokeWidth={8} />
						<path d="M-18,-240 L18,-240 L12,-282 L-12,-282 Z" fill="#ffe2a8" />
						<circle cx={0} cy={-260} r={120} fill="url(#lantern-glow)" opacity={0.8} />
					</g>
				))}
			</Layer>
			<Layer cam={cam} depth={1}>
				{/* the walk: pale stone pavers in front of the arcade */}
				<rect x={-600} y={860} width={3120} height={400} fill="#3a3036" />
				{Array.from({length: 26}, (_, i) => (
					<line key={i} x1={-600 + i * 140} y1={860} x2={-700 + i * 160} y2={1260} stroke="#2a2228" strokeWidth={2} />
				))}
				<ellipse cx={1300} cy={900} rx={300} ry={40} fill="#ffcf8a" opacity={0.18} />
				{children}
			</Layer>
			<Layer cam={cam} depth={1.4}>
				{front}
			</Layer>
		</g>
	);
};

// ---------------------------------------------------------------- the lab

export const LAB_DESK_Y = 720;

const Blinds: React.FC<{w: number; h: number; open?: number}> = ({w, h, open = 0.5}) => (
	<g>
		<rect width={w} height={h} fill="#141c30" />
		<rect width={w} height={h} fill="url(#sky-night)" opacity={0.8} />
		<circle cx={w * 0.3} cy={h * 0.3} r={18} fill="#eef2fb" />
		{Array.from({length: Math.floor(h / 22)}, (_, i) => (
			<g key={i}>
				<rect x={0} y={i * 22} width={w} height={22 * (1 - open)} fill="#c8bca4" />
				<rect x={0} y={i * 22 + 22 * (1 - open) - 2} width={w} height={2} fill="#8a7e68" />
			</g>
		))}
		<rect x={-12} y={-12} width={w + 24} height={h + 24} fill="none" stroke="#4a3626" strokeWidth={16} />
	</g>
);

export const Lab1959: React.FC<{
	frame: number;
	cam?: Cam;
	/** chalk on the board (board space: 0..640 × 0..340) */
	board?: React.ReactNode;
	/** on the back-wall layer, in front of the board (a person standing at it, ~0.62 scale) */
	wall?: React.ReactNode;
	/** the chalked heading on the board */
	boardTitle?: boolean;
	/** on the desk top (hero plane, desk top at LAB_DESK_Y) */
	desk?: React.ReactNode;
	/** people behind the desk (hero plane) */
	behind?: React.ReactNode;
	children?: React.ReactNode;
	front?: React.ReactNode;
	lamp?: number;
	reels?: number;
	intercom?: number;
	/** hide the tape recorder (when it is its own close-up) */
	recorder?: boolean;
}> = ({frame: f, cam = CAM0, board, wall, boardTitle = true, desk, behind, children, front, lamp = 1, reels = 0, intercom = 0, recorder = true}) => (
	<g>
		<Layer cam={cam} depth={0.6}>
			<rect x={-800} y={-600} width={3520} height={2200} fill="#3a3228" />
			<rect x={-800} y={-600} width={3520} height={2200} fill="#1a1420" opacity={0.45} />
			{/* wainscot */}
			<rect x={-800} y={560} width={3520} height={900} fill="#3e2a1c" />
			{Array.from({length: 20}, (_, i) => (
				<rect key={i} x={-760 + i * 180} y={590} width={150} height={240} rx={4} fill="none" stroke="#2a1c12" strokeWidth={4} />
			))}
			<rect x={-800} y={552} width={3520} height={14} fill="#5a3e28" />
			{/* chalkboard */}
			<g transform="translate(160,140)">
				<rect x={-18} y={-18} width={676} height={376} fill="#5a3e28" />
				<rect width={640} height={340} fill="#26332c" />
				<rect width={640} height={340} fill="url(#glass)" opacity={0.06} />
				{boardTitle ? (
					<text x={30} y={46} style={{fontFamily: 'cursive', fontSize: 26, fill: '#d8d8cc', opacity: 0.55}}>
						Discussion group · psychology of sex
					</text>
				) : null}
				{board}
				<rect x={-18} y={340} width={676} height={14} fill="#6a4a30" />
				<rect x={60} y={334} width={40} height={8} fill="#efeae0" />
			</g>
			{/* blinds over the night window */}
			<g transform="translate(1260,120)">
				<Blinds w={420} h={400} open={0.45} />
			</g>
			<path d="M1260,120 L1680,120 L1500,1100 L900,1100 Z" fill="url(#beam-cool)" opacity={0.12} filter="url(#blur-md)" />
			{/* clock */}
			<g transform="translate(1040,170)">
				<circle r={44} fill="#efe6d2" stroke="#3a2a1e" strokeWidth={6} />
				<line x1={0} y1={0} x2={0} y2={-30} stroke="#1a1410" strokeWidth={4} />
				<line x1={0} y1={0} x2={22} y2={10} stroke="#1a1410" strokeWidth={4} />
			</g>
			{/* intercom on the wall */}
			<g transform="translate(1040,400)">
				<Intercom talk={intercom} />
			</g>
			{wall}
		</Layer>
		<Layer cam={cam} depth={1}>
			{behind}
			{/* lamp pool */}
			<ellipse cx={900} cy={LAB_DESK_Y - 120} rx={760} ry={420} fill="#ffcf8a" opacity={0.14 * lamp} filter="url(#blur-md)" />
			{/* the desk */}
			<rect x={300} y={LAB_DESK_Y} width={1100} height={22} fill="#6a4a30" />
			<rect x={300} y={LAB_DESK_Y} width={1100} height={6} fill="#8a6440" />
			<rect x={320} y={LAB_DESK_Y + 22} width={1060} height={300} fill="url(#wood)" />
			<rect x={360} y={LAB_DESK_Y + 60} width={420} height={110} rx={4} fill="none" stroke="#2a1a10" strokeWidth={4} />
			<rect x={920} y={LAB_DESK_Y + 60} width={420} height={110} rx={4} fill="none" stroke="#2a1a10" strokeWidth={4} />
			<ellipse cx={900} cy={LAB_DESK_Y + 8} rx={480} ry={28} fill="#ffcf8a" opacity={0.18 * lamp} />
			{/* banker's lamp */}
			<g transform={`translate(970,${LAB_DESK_Y})`}>
				<circle cy={-110} r={560} fill="url(#lantern-glow)" opacity={0.55 * lamp} />
				<ellipse cx={0} cy={0} rx={50} ry={8} fill="url(#brass)" />
				<rect x={-5} y={-96} width={10} height={96} fill="url(#brass)" />
				<path d="M-80,-96 C-80,-130 80,-130 80,-96 Z" fill="#1e5a3a" />
				<path d="M-80,-96 C-80,-112 -40,-124 0,-126" fill="none" stroke="#4a9a6a" strokeWidth={4} opacity={0.7} />
				<ellipse cx={0} cy={-96} rx={80} ry={8} fill="#fff1cf" opacity={0.9 * lamp} />
			</g>
			{desk}
			{/* side table with the recorder */}
			{recorder ? (
				<g transform={`translate(1560,${LAB_DESK_Y + 40})`}>
					<rect x={-200} y={0} width={400} height={16} fill="#5a3e28" />
					<rect x={-180} y={16} width={14} height={300} fill="#2a1c12" />
					<rect x={166} y={16} width={14} height={300} fill="#2a1c12" />
					<TapeRecorder t={f * reels} on={reels > 0 ? 1 : 0.2} />
				</g>
			) : null}
			<rect x={-800} y={LAB_DESK_Y + 320} width={3520} height={600} fill="#1e1612" />
			{children}
		</Layer>
		<Layer cam={cam} depth={1.4}>
			{front}
		</Layer>
	</g>
);
