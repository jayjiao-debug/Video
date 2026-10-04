import React from 'react';
import {P} from './palette';
import {shade} from './Figure';
import {font} from '../lib/theme';

/**
 * 《八百人猜牛》: the fat ox of the 1906 Plymouth show, and the paper it was judged on.
 *
 * Ox: a Ruby Red Devon bullock (the local breed), side view facing right, origin
 * between the hooves. ~480 units nose to rump, withers at ~286, so next to the
 * rig's 340-unit person it stands about chest high, as a fat ox does.
 */

const HIDE = {hi: '#a9573a', mid: '#82402a', lo: '#4c2416', far: '#5e2c1b'};
const HOOF = '#2a201b';
const HORN = '#e6dac0';
const MUZZLE = '#b48a7a';

export const OX_DEFS: React.FC = () => (
	<defs>
		<linearGradient id="ox-hide" x1="0" y1="-290" x2="0" y2="-90" gradientUnits="userSpaceOnUse">
			<stop offset="0" stopColor={HIDE.hi} />
			<stop offset="0.45" stopColor={HIDE.mid} />
			<stop offset="1" stopColor={HIDE.lo} />
		</linearGradient>
		<linearGradient id="ox-leg" x1="0" y1="-140" x2="0" y2="0" gradientUnits="userSpaceOnUse">
			<stop offset="0" stopColor={HIDE.mid} />
			<stop offset="1" stopColor={HIDE.lo} />
		</linearGradient>
		<linearGradient id="ox-horn" x1="0" y1="0" x2="1" y2="-1">
			<stop offset="0" stopColor={HORN} />
			<stop offset="0.7" stopColor="#d6c6a0" />
			<stop offset="1" stopColor="#3a3024" />
		</linearGradient>
		<linearGradient id="ticket-paper" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stopColor="#f4ecd8" />
			<stop offset="1" stopColor="#d8caa6" />
		</linearGradient>
		<linearGradient id="ticket-gold" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stopColor="#fff1c8" />
			<stop offset="0.5" stopColor="#f1c56d" />
			<stop offset="1" stopColor="#c8913a" />
		</linearGradient>
		<radialGradient id="lantern-glow">
			<stop offset="0" stopColor="#fff2c8" stopOpacity="0.95" />
			<stop offset="0.18" stopColor={P.lamp} stopOpacity="0.5" />
			<stop offset="0.55" stopColor={P.lamp} stopOpacity="0.12" />
			<stop offset="1" stopColor={P.lamp} stopOpacity="0" />
		</radialGradient>
		<linearGradient id="canvas-lit" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#f3d9a4" />
			<stop offset="0.6" stopColor="#e2b672" />
			<stop offset="1" stopColor="#a8743e" />
		</linearGradient>
	</defs>
);

export type OxPose = {
	/** head pitch in degrees (+ = nose down / grazing, − = head up) */
	head: number;
	/** tail swing −1..1 */
	tail: number;
	/** walk phase in radians (undefined = standing square) */
	walk?: number;
	/** chest rise 0..1 */
	breath: number;
};

export const OX_STAND: OxPose = {head: 0, tail: 0, breath: 0};

/** One leg, pivoting at its top (`top`), drawn as a tapered column with a hoof. */
const Leg: React.FC<{d: string; top: [number, number]; angle: number; fill: string; hoof: [number, number]}> = ({d, top, angle, fill, hoof}) => (
	<g transform={`rotate(${angle}, ${top[0]}, ${top[1]})`}>
		<path d={d} fill={fill} />
		<path d={`M${hoof[0] - 2},0 L${hoof[0] + 2},-14 L${hoof[1] - 2},-14 L${hoof[1] + 2},0 Z`} fill={HOOF} />
	</g>
);

const FRONT = 'M128,-136 C124,-96 134,-66 140,-52 L142,-18 L138,0 L176,0 L172,-18 L172,-54 C178,-76 182,-106 180,-136 Z';
const HIND = 'M-226,-156 C-230,-112 -216,-82 -206,-62 L-206,-18 L-210,0 L-172,0 L-176,-18 L-178,-58 C-168,-84 -156,-116 -154,-150 Z';

export const Ox: React.FC<{
	pose?: OxPose;
	blink?: number;
	/** halter and lead rope */
	halter?: boolean;
	/** a flat silhouette colour (crowd shots, backlight) */
	silhouette?: string;
	rim?: 'cool' | 'warm' | 'moon' | 'none';
	/** warm practical from the upper right: 0..1 */
	lit?: number;
	shadow?: boolean;
}> = ({pose = OX_STAND, blink = 1, halter = true, silhouette, rim = 'warm', lit = 0.6, shadow = true}) => {
	const sil = silhouette;
	const hide = sil ?? 'url(#ox-hide)';
	const leg = sil ?? 'url(#ox-leg)';
	const far = sil ?? HIDE.far;
	const w = pose.walk;
	const swing = (ph: number) => (w === undefined ? 0 : 9 * Math.sin(w + ph));
	const bob = w === undefined ? 0 : -2.5 * Math.abs(Math.cos(w));
	const breathe = 1 + 0.012 * pose.breath;
	const sw = pose.tail;

	const head = (
		<g transform={`translate(240,-252) rotate(${pose.head - 12}) scale(1.3)`}>
			{/* far horn and far ear sit behind the skull */}
			<path d="M-12,-10 C-26,-34 -18,-60 4,-72 C9,-74 11,-70 8,-66 C-6,-52 -6,-32 0,-12 Z" fill={sil ?? shade(HORN, 0.7)} />
			<ellipse cx={-30} cy={10} rx={22} ry={10} transform="rotate(-24,-30,10)" fill={sil ?? HIDE.far} />
			{/* skull: broad forehead, long face, square muzzle */}
			<path d="M-20,-8 C4,-24 40,-16 58,2 C72,20 86,50 98,76 C106,94 104,112 88,118 C70,124 50,120 38,110 C22,92 2,66 -12,42 C-24,22 -28,6 -20,-8 Z" fill={hide} />
			{!sil ? (
				<>
					{/* shadow under the jaw, light down the face */}
					<path d="M-12,42 C2,66 22,92 38,110 C30,90 14,66 4,40 Z" fill="#000" opacity={0.18} />
					<path d="M20,-14 C44,-10 62,14 74,38 C68,30 52,10 30,0 Z" fill="#fff" opacity={0.1 + 0.12 * lit} />
					{/* forehead curls */}
					{[
						[14, -4],
						[26, -6],
						[20, 6],
						[34, 4],
						[8, 6],
					].map(([x, y], i) => (
						<path key={i} d={`M${x - 5},${y} a5,5 0 1,1 8,3`} fill="none" stroke={shade(HIDE.hi, 1.15)} strokeWidth={2} opacity={0.6} />
					))}
					{/* muzzle, nostril, mouth */}
					<path d="M70,90 C80,82 100,86 104,100 C106,112 98,120 86,120 C74,120 66,110 70,90 Z" fill={MUZZLE} />
					<ellipse cx={96} cy={100} rx={4} ry={6} transform="rotate(-20,96,100)" fill="#4a2a24" />
					<path d="M74,114 C82,118 92,118 98,116" stroke="#5a3a32" strokeWidth={2} fill="none" strokeLinecap="round" />
					{/* eye: dark and wet, a heavy lid; blink closes it */}
					<path d="M32,24 C38,16 52,16 58,24" stroke={shade(HIDE.lo, 0.8)} strokeWidth={4} fill="none" strokeLinecap="round" />
					<ellipse cx={45} cy={30} rx={7.5} ry={6.5 * blink} fill="#1a1210" />
					{blink > 0.5 ? <circle cx={48} cy={27} r={2} fill="#fff" opacity={0.85} /> : null}
					<path d={`M37,${30 - 6 * blink} C42,${26 - 7 * blink} 50,${26 - 7 * blink} 54,${30 - 6 * blink}`} stroke={shade(HIDE.lo, 0.7)} strokeWidth={2.4} fill="none" />
				</>
			) : null}
			{/* near ear and near horn */}
			<path d="M-6,22 C-30,14 -50,24 -52,34 C-40,40 -18,36 -2,32 Z" fill={sil ?? HIDE.mid} />
			{!sil ? <path d="M-10,26 C-26,22 -40,28 -44,32 C-32,34 -20,32 -8,30 Z" fill="#c98a74" opacity={0.7} /> : null}
			<path d="M8,-12 C2,-36 18,-60 46,-68 C52,-70 56,-65 51,-61 C30,-52 22,-36 22,-16 Z" fill={sil ?? 'url(#ox-horn)'} />
			{halter && !sil ? (
				<g fill="none" stroke="#b08a52" strokeWidth={5} strokeLinecap="round">
					<path d="M-4,30 C14,56 40,82 66,94" />
					<path d="M64,84 C74,104 90,112 104,104" />
					<path d="M-14,4 C-20,18 -16,28 -4,30" />
					<circle cx={66} cy={94} r={5} fill="#7d5420" stroke="none" />
				</g>
			) : null}
		</g>
	);

	return (
		<g>
			{shadow ? <ellipse cx={-10} cy={6} rx={270} ry={20} fill="#000" opacity={0.38} /> : null}
			<g filter={rim === 'none' || sil ? undefined : `url(#rim-${rim})`}>
				{/* far legs, a shade darker */}
				<g transform="translate(-28,0)">
					<Leg d={FRONT} top={[154, -130]} angle={-swing(Math.PI)} fill={far} hoof={[138, 176]} />
				</g>
				<g transform="translate(30,0)">
					<Leg d={HIND} top={[-190, -150]} angle={-swing(0)} fill={far} hoof={[-210, -172]} />
				</g>
				{/* tail hangs off the tailhead and swings */}
				<g>
					<path
						d={`M-214,-256 C${-242 + sw * 6},-226 ${-250 + sw * 14},-160 ${-244 + sw * 24},-84`}
						fill="none"
						stroke={sil ?? HIDE.mid}
						strokeWidth={9}
						strokeLinecap="round"
					/>
					<path
						d={`M${-244 + sw * 24},-96 C${-256 + sw * 26},-76 ${-252 + sw * 30},-50 ${-240 + sw * 28},-40 C${-232 + sw * 26},-54 ${-232 + sw * 22},-78 ${-238 + sw * 22},-96 Z`}
						fill={sil ?? '#3a1c12'}
					/>
				</g>
				{/* near legs: their tops tuck under the body */}
				<Leg d={FRONT} top={[154, -130]} angle={swing(0)} fill={leg} hoof={[138, 176]} />
				<Leg d={HIND} top={[-190, -150]} angle={swing(Math.PI)} fill={leg} hoof={[-210, -172]} />
				<g transform={`translate(0,${bob})`}>
					{/* body: deep, square, fat-stock round; breath lifts the barrel */}
					<g transform={`translate(0,-190) scale(1,${breathe}) translate(0,190)`}>
						<path
							d="M-206,-266 C-180,-276 -150,-282 -120,-276 C-60,-268 20,-270 80,-280 C120,-288 150,-298 180,-292 C210,-286 236,-268 248,-246 L262,-200 C268,-168 254,-140 236,-124 C228,-108 216,-96 200,-96 C170,-98 150,-104 130,-102 C80,-92 0,-84 -80,-90 C-130,-94 -165,-108 -190,-126 C-236,-150 -252,-200 -242,-236 C-236,-254 -224,-264 -206,-266 Z"
							fill={hide}
						/>
						{!sil ? (
							<>
								{/* muscle and bone: shoulder blade, point of hip, thigh, dewlap fold */}
								<path d="M168,-290 C186,-246 190,-190 178,-132" stroke="#000" strokeOpacity={0.16} strokeWidth={4} fill="none" strokeLinecap="round" />
								<path d="M-140,-272 C-176,-232 -198,-182 -208,-136" stroke="#000" strokeOpacity={0.16} strokeWidth={4} fill="none" strokeLinecap="round" />
								<ellipse cx={-20} cy={-238} rx={220} ry={34} fill="#fff" opacity={0.05 + 0.05 * lit} filter="url(#blur-md)" />
								<ellipse cx={176} cy={-236} rx={40} ry={56} fill="#fff" opacity={0.03 + 0.04 * lit} filter="url(#blur-md)" />
								<ellipse filter="url(#blur-sm)" cx={-134} cy={-262} rx={22} ry={9} fill="#fff" opacity={0.08 + 0.08 * lit} />
								<path d="M222,-160 C236,-140 236,-118 222,-100" stroke="#000" strokeOpacity={0.2} strokeWidth={3} fill="none" />
								{/* the belly falls into shadow */}
								<path d="M-190,-126 C-165,-108 -130,-94 -80,-90 C0,-84 80,-92 130,-102 C150,-104 170,-98 200,-96 C150,-118 -40,-108 -194,-142 Z" fill="#000" opacity={0.26} />
								
								{/* the warm key catches the back */}
								<path d="M-200,-268 C-180,-276 -150,-280 -120,-274 C-60,-266 20,-268 80,-278 C120,-286 150,-296 180,-290 C210,-284 232,-268 242,-250" stroke="#ffd9a8" strokeOpacity={0.22 + 0.3 * lit} strokeWidth={4} fill="none" strokeLinecap="round" />
							</>
						) : null}
					</g>
				</g>
				<g transform={`translate(0,${bob})`}>{head}</g>
			</g>
		</g>
	);
};

// ------------------------------------------------------------------ the ticket

/**
 * One of the ~800 stamped, numbered cards (6d each): name, address and an estimate of
 * the dressed weight in lb. Origin at the centre; 200 × 124 units.
 * `lod`: full (readable close-up), mid (lines only), tiny (a sliver in a line of 787).
 */
export const Ticket: React.FC<{
	no?: number;
	name?: string;
	guess?: number | string;
	tone?: 'paper' | 'gold' | 'dim';
	lod?: 'full' | 'mid' | 'tiny';
	/** the handwritten estimate glows (the answer) */
	glow?: number;
	/** handwriting draw-on 0..1 */
	write?: number;
}> = ({no = 394, name = 'W. Pengelly', guess = 1207, tone = 'paper', lod = 'full', glow = 0, write = 1}) => {
	const fill = tone === 'gold' ? 'url(#ticket-gold)' : tone === 'dim' ? '#8d8673' : 'url(#ticket-paper)';
	const ink = tone === 'gold' ? '#4a3210' : P.ink;
	if (lod === 'tiny') {
		return <rect x={-100} y={-62} width={200} height={124} rx={6} fill={fill} />;
	}
	const stub = (
		<g>
			{/* perforated stub on the left */}
			{Array.from({length: 7}, (_, i) => (
				<circle key={i} cx={-58} cy={-50 + i * 16.6} r={2.4} fill="#000" opacity={0.25} />
			))}
		</g>
	);
	const g = String(guess);
	return (
		<g>
			<rect x={-96} y={-58} width={200} height={124} rx={6} fill="#000" opacity={0.3} />
			<rect x={-100} y={-62} width={200} height={124} rx={6} fill={fill} />
			{stub}
			{lod === 'mid' ? (
				<g stroke={ink} strokeOpacity={0.35} strokeWidth={3}>
					<line x1={-44} y1={-34} x2={80} y2={-34} />
					<line x1={-44} y1={-6} x2={60} y2={-6} />
					<line x1={-44} y1={30} x2={20} y2={30} strokeWidth={6} strokeOpacity={0.6} />
				</g>
			) : (
				<g>
					<text x={-80} y={4} transform="rotate(-90,-80,4)" textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 15, fill: ink, letterSpacing: '0.1em'}}>
						{`No ${String(no).padStart(4, '0')}`}
					</text>
					<text x={-44} y={-40} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 12, fill: ink, letterSpacing: '0.06em'}}>
						FAT STOCK SHOW · 1906
					</text>
					<text x={-44} y={-25} style={{fontFamily: font.latin, fontWeight: 600, fontSize: 9.5, fill: ink, opacity: 0.75, letterSpacing: '0.04em'}}>
						DRESSED WEIGHT OF THE OX
					</text>
					<line x1={-44} y1={-16} x2={92} y2={-16} stroke={ink} strokeOpacity={0.35} />
					<text x={-44} y={4} style={{fontFamily: font.latin, fontSize: 12, fill: ink, opacity: 0.7}}>
						Name
					</text>
					<text x={-6} y={4} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontWeight: 600, fontSize: 19, fill: ink}} opacity={Math.min(1, write * 2)}>
						{name}
					</text>
					<text x={-44} y={40} style={{fontFamily: font.latin, fontSize: 12, fill: ink, opacity: 0.7}}>
						lbs.
					</text>
					{glow > 0 ? <ellipse cx={30} cy={34} rx={70} ry={26} fill="url(#lantern-glow)" opacity={glow} /> : null}
					<text x={-14} y={44} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontWeight: 700, fontSize: 38, fill: glow > 0.5 ? '#6a4310' : ink}}>
						{g.slice(0, Math.ceil(g.length * Math.max(0, Math.min(1, write * 2 - 1))))}
					</text>
					{/* the sixpenny stamp */}
					<g transform="translate(78,32) rotate(-14)" opacity={0.55}>
						<circle r={17} fill="none" stroke="#4a4a7a" strokeWidth={2} />
						<circle r={13} fill="none" stroke="#4a4a7a" strokeWidth={1} />
						<text y={5} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 13, fill: '#4a4a7a'}}>
							6d
						</text>
					</g>
				</g>
			)}
		</g>
	);
};

/** The episode motif: a ticket drawn in brand gold, outline only, readable at phone size. */
export const TicketMotif: React.FC<{p: number; gold?: string}> = ({p, gold = '#f1c56d'}) => {
	const len = 2 * (180 + 100);
	const q = Math.max(0, Math.min(1, (p - 0.45) / 0.4));
	return (
		<g>
			<circle r={110} fill="url(#brand-glow)" opacity={0.55 * p} />
			<rect x={-90} y={-50} width={180} height={100} rx={8} fill="none" stroke={gold} strokeWidth={3} strokeDasharray={len} strokeDashoffset={len * (1 - Math.min(1, p * 1.6))} />
			{Array.from({length: 6}, (_, i) => (
				<circle key={i} cx={-50} cy={-38 + i * 15.2} r={2.4} fill={gold} opacity={q} />
			))}
			<line x1={-36} y1={-22} x2={70} y2={-22} stroke={gold} strokeWidth={2} opacity={0.6 * q} />
			<line x1={-36} y1={-4} x2={44} y2={-4} stroke={gold} strokeWidth={2} opacity={0.6 * q} />
			<text x={-34} y={34} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontWeight: 700, fontSize: 34, fill: gold}} opacity={q}>
				No 394
			</text>
		</g>
	);
};

// ------------------------------------------------------------------ fair props

/** The competition box: oak, a slot in the lid, a brass plate. Origin at its base centre. */
export const BallotBox: React.FC<{lit?: number}> = ({lit = 0.6}) => (
	<g>
		<ellipse cx={0} cy={4} rx={80} ry={8} fill="#000" opacity={0.35} />
		{/* trestle */}
		<path d="M-60,0 L-48,-90 M60,0 L48,-90 M-56,-40 L56,-40" stroke={P.woodDark} strokeWidth={8} strokeLinecap="round" />
		<rect x={-70} y={-100} width={140} height={14} fill="url(#wood)" />
		<rect x={-56} y={-190} width={112} height={92} rx={4} fill="url(#wood)" />
		<rect x={-56} y={-190} width={112} height={92} rx={4} fill="#ffcf8a" opacity={0.12 * lit} />
		<path d="M-62,-196 L62,-196 L56,-186 L-56,-186 Z" fill="#6b4a30" />
		<rect x={-30} y={-195} width={60} height={5} rx={2} fill="#140d08" />
		<rect x={-42} y={-160} width={84} height={30} rx={3} fill="url(#brass)" />
		<text x={0} y={-140} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 12, fill: '#3a2810', letterSpacing: '0.02em'}}>
			6d · TICKETS
		</text>
	</g>
);

/** A hurricane lantern hanging from its bail. Origin at the hook. `on` 0..1, `f` for the flicker. */
export const Lantern: React.FC<{on?: number; f?: number; seed?: number; glow?: number}> = ({on = 1, f = 0, seed = 0, glow = 1}) => {
	const fl = 0.92 + 0.05 * Math.sin(f / 3.1 + seed) + 0.03 * Math.sin(f / 1.7 + seed * 2);
	return (
		<g>
			<circle cy={46} r={260 * glow} fill="url(#lantern-glow)" opacity={0.75 * on * fl} />
			<path d="M-16,22 C-16,0 16,0 16,22" stroke="#2a2420" strokeWidth={2.5} fill="none" />
			<rect x={-14} y={20} width={28} height={8} rx={2} fill="#3a3430" />
			<path d="M-14,28 C-22,40 -22,62 -14,72 L14,72 C22,62 22,40 14,28 Z" fill="#fff4d6" opacity={0.35 + 0.6 * on * fl} />
			<ellipse cx={0} cy={54} rx={5} ry={9 * fl} fill="#fff8e6" opacity={on} />
			<path d="M-16,30 L-16,70 M16,30 L16,70" stroke="#3a3430" strokeWidth={2.5} />
			<rect x={-18} y={70} width={36} height={10} rx={3} fill="#3a3430" />
		</g>
	);
};

/** A chalkboard on an easel announcing the competition. Origin at the easel's feet. */
export const Signboard: React.FC = () => (
	<g>
		<path d="M-70,0 L-40,-300 M70,0 L40,-300 M0,-300 L18,0" stroke={P.woodDark} strokeWidth={8} strokeLinecap="round" />
		<rect x={-110} y={-290} width={220} height={170} rx={4} fill="#6b4a30" />
		<rect x={-100} y={-280} width={200} height={150} fill="#1f2622" />
		<g style={{fontFamily: font.latinItalic, fontStyle: 'italic', fill: '#e9e4d6'}}>
			<text x={0} y={-246} textAnchor="middle" style={{fontSize: 22, fontWeight: 700}}>
				Guess the Weight
			</text>
			<text x={0} y={-220} textAnchor="middle" style={{fontSize: 22, fontWeight: 700}}>
				of the Ox
			</text>
			<line x1={-60} y1={-206} x2={60} y2={-206} stroke="#e9e4d6" strokeOpacity={0.5} strokeWidth={1.5} />
			<text x={0} y={-182} textAnchor="middle" style={{fontSize: 16}}>
				dressed weight, in lbs.
			</text>
			<text x={0} y={-150} textAnchor="middle" style={{fontSize: 22, fontWeight: 700, fill: '#f3d9a0'}}>
				Sixpence a ticket
			</text>
		</g>
	</g>
);

/** A straw bale. Origin at its base centre. */
export const Bale: React.FC<{w?: number}> = ({w = 150}) => (
	<g>
		<rect x={-w / 2} y={-74} width={w} height={74} rx={6} fill="#a8894a" />
		<rect x={-w / 2} y={-74} width={w} height={22} rx={6} fill="#c9a95e" />
		{[-0.25, 0.25].map((k) => (
			<line key={k} x1={k * w} y1={-74} x2={k * w} y2={0} stroke="#6a5226" strokeWidth={3} />
		))}
		{Array.from({length: 9}, (_, i) => (
			<line key={i} x1={-w / 2 + 8 + i * (w / 9)} y1={-48} x2={-w / 2 + 14 + i * (w / 9)} y2={-10} stroke="#8a6e36" strokeWidth={1.5} opacity={0.6} />
		))}
	</g>
);
