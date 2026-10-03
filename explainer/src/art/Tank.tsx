import React from 'react';
import {P} from './palette';

/**
 * German tanks, side view, facing right, origin at the middle of the track's
 * ground contact (ground line y = 0). Panzer IV ~760 units long incl. gun;
 * Panther ~860 with its interleaved road wheels. Paint: dunkelgelb (1943).
 * `wreck` burns the paint, droops the gun and breaks a track.
 */

const YELLOW = '#a8915a';
const YELLOW_LIGHT = '#c4ad73';
const YELLOW_DARK = '#7a6a40';
const STEEL = '#2b2b29';
const RUST = '#5a3a22';

export const TANK_DEFS: React.FC = () => (
	<defs>
		<linearGradient id="dunkelgelb" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={YELLOW_LIGHT} />
			<stop offset="0.55" stopColor={YELLOW} />
			<stop offset="1" stopColor={YELLOW_DARK} />
		</linearGradient>
		<radialGradient id="scorch">
			<stop offset="0" stopColor="#0d0b09" stopOpacity="0.95" />
			<stop offset="0.6" stopColor="#1f160f" stopOpacity="0.6" />
			<stop offset="1" stopColor="#1f160f" stopOpacity="0" />
		</radialGradient>
	</defs>
);

const Balkenkreuz: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M-6,-24 L6,-24 L6,-6 L24,-6 L24,6 L6,6 L6,24 L-6,24 L-6,6 L-24,6 L-24,-6 L-6,-6 Z" fill="#f0eee6" />
		<path d="M-3,-21 L3,-21 L3,-3 L21,-3 L21,3 L3,3 L3,21 L-3,21 L-3,3 L-21,3 L-21,-3 L-3,-3 Z" fill="#121212" />
	</g>
);

const Wheel: React.FC<{x: number; y: number; r: number; spin: number; dish?: boolean}> = ({x, y, r, spin, dish}) => (
	<g transform={`translate(${x},${y}) rotate(${spin})`}>
		<circle r={r} fill="#1d1d1b" />
		<circle r={r * 0.82} fill={dish ? YELLOW_DARK : '#3a3a35'} />
		<circle r={r * 0.32} fill="#22221f" />
		{Array.from({length: 6}, (_, i) => (
			<circle key={i} cx={Math.cos((i * Math.PI) / 3) * r * 0.55} cy={Math.sin((i * Math.PI) / 3) * r * 0.55} r={r * 0.07} fill="#151513" />
		))}
	</g>
);

const Track: React.FC<{x0: number; x1: number; top: number; travel: number; broken?: boolean}> = ({x0, x1, top, travel, broken}) => {
	const h = -top;
	const d = `M${x0 + h / 2},0 L${x1 - h / 2},0 A${h / 2},${h / 2} 0 0,0 ${x1 - h / 2},${top} L${x0 + h / 2},${top} A${h / 2},${h / 2} 0 0,0 ${x0 + h / 2},0 Z`;
	return (
		<g>
			<path d={d} fill="none" stroke={STEEL} strokeWidth={13} />
			<path d={d} fill="none" stroke="#45443d" strokeWidth={13} strokeDasharray="5 9" strokeDashoffset={-travel} />
			{broken ? <path d={`M${x0 + 30},${top - 4} L${x0 - 40},${10} L${x0 - 90},14`} stroke={STEEL} strokeWidth={12} fill="none" /> : null}
		</g>
	);
};

export const Panzer: React.FC<{wreck?: boolean; travel?: number; turret?: number; gun?: number; plateGlow?: number}> = ({
	wreck,
	travel = 0,
	turret = 0,
	gun = 0,
	plateGlow = 0,
}) => {
	const spin = (travel / 22) * (180 / Math.PI);
	const gunAngle = wreck ? 7 : gun;
	return (
		<g>
			<TANK_DEFS />
			{/* tracks and running gear */}
			<Track x0={-340} x1={330} top={-76} travel={travel} broken={wreck} />
			{[-250, -180, -110, -40, 30, 100, 170, 240].map((x) => (
				<Wheel key={x} x={x} y={-24} r={21} spin={spin} />
			))}
			<Wheel x={300} y={-46} r={27} spin={spin} dish />
			<Wheel x={-312} y={-42} r={25} spin={spin} />
			{[-200, -80, 60, 180].map((x) => (
				<circle key={x} cx={x} cy={-68} r={8} fill="#1d1d1b" />
			))}
			{/* hull */}
			<path d="M-338,-80 L330,-80 L354,-98 L346,-142 L-330,-142 Z" fill="url(#dunkelgelb)" />
			<path d="M-346,-80 L362,-80" stroke={YELLOW_DARK} strokeWidth={5} />
			<path d="M-160,-142 L262,-142 L258,-196 L-160,-196 Z" fill="url(#dunkelgelb)" />
			<path d="M-160,-142 L262,-142" stroke={YELLOW_DARK} strokeWidth={3} />
			<rect x={232} y={-178} width={22} height={7} rx={2} fill="#141414" />
			<rect x={-330} y={-170} width={34} height={26} rx={6} fill={wreck ? '#2a1d14' : '#6a5f45'} />
			{/* gearbox inspection plate: where the serial number lives */}
			<g transform="translate(300,-112)">
				{plateGlow > 0 ? <circle r={70} fill="url(#glow-lamp)" opacity={plateGlow} /> : null}
				<rect x={-22} y={-12} width={44} height={22} rx={3} fill="#8c8270" stroke="#3b362c" strokeWidth={2} />
				{[-17, 17].map((x) => (
					<circle key={x} cx={x} cy={-1} r={2} fill="#3b362c" />
				))}
			</g>
			<Balkenkreuz x={-60} y={-168} s={0.8} />
			{/* turret */}
			<g transform={`rotate(${turret}, 40, -196)`}>
				<g transform={`rotate(${gunAngle}, 150, -238)`}>
					<rect x={150} y={-244} width={300} height={12} fill="#6f6243" />
					<rect x={438} y={-249} width={28} height={22} rx={2} fill="#4d4430" />
					<path d="M126,-258 L160,-254 L160,-222 L126,-218 Z" fill={YELLOW_DARK} />
				</g>
				<path d="M-118,-196 L134,-196 L126,-274 L-96,-278 Z" fill="url(#dunkelgelb)" />
				<path d="M-118,-196 L134,-196" stroke={YELLOW_DARK} strokeWidth={3} />
				<path d="M-78,-278 C-78,-304 -20,-304 -20,-278 Z" fill={YELLOW} />
				<rect x={-40} y={-262} width={32} height={40} rx={4} fill="#7a6a40" stroke="#5d5131" />
				<text x={60} y={-222} textAnchor="middle" style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 28, fill: '#e9e4d8'}}>
					{wreck ? '' : '624'}
				</text>
			</g>
			{wreck ? (
				<g>
					<ellipse cx={-180} cy={-120} rx={150} ry={60} fill="url(#scorch)" />
					<ellipse cx={60} cy={-236} rx={120} ry={50} fill="url(#scorch)" />
					<ellipse cx={250} cy={-90} rx={70} ry={30} fill="url(#scorch)" opacity={0.6} />
					<path d="M-260,-100 l14,-10 l6,14 Z M120,-150 l10,-8 l4,12 Z" fill={RUST} opacity={0.7} />
				</g>
			) : null}
		</g>
	);
};

/** Panther: sloped glacis, long gun, interleaved road wheels (the ones whose moulds gave it away). */
/** `missing`: outer road wheels already taken off, counted from the front. */
export const Panther: React.FC<{travel?: number; wheelGlow?: number; missing?: number}> = ({travel = 0, wheelGlow = 0, missing = 0}) => {
	const spin = (travel / 30) * (180 / Math.PI);
	const xs = [-300, -220, -140, -60, 20, 100, 180, 260];
	return (
		<g>
			<TANK_DEFS />
			<Track x0={-380} x1={370} top={-84} travel={travel} />
			{xs.map((x, i) =>
				i >= xs.length - missing ? null : (
					<g key={x}>
						{wheelGlow > 0 ? <circle cx={x + (i % 2 ? 40 : 0)} cy={-40} r={60} fill="url(#glow-lamp)" opacity={wheelGlow * 0.5} /> : null}
						<Wheel x={x} y={-40} r={33} spin={spin} dish />
					</g>
				),
			)}
			{xs.slice(0, 7).map((x) => (
				<Wheel key={`b${x}`} x={x + 40} y={-40} r={33} spin={spin} />
			))}
			<Wheel x={340} y={-58} r={28} spin={spin} />
			<path d="M-386,-88 L372,-88 L262,-182 L-374,-182 L-392,-130 Z" fill="url(#dunkelgelb)" />
			<path d="M-380,-102 L356,-102" stroke={YELLOW_DARK} strokeWidth={4} />
			<g>
				<rect x={196} y={-238} width={400} height={13} fill="#6f6243" />
				<rect x={582} y={-244} width={32} height={25} rx={3} fill="#4d4430" />
				<path d="M-80,-182 L200,-182 L176,-262 L-60,-266 Z" fill="url(#dunkelgelb)" />
				<path d="M176,-262 C214,-258 222,-206 196,-190 L176,-190 Z" fill={YELLOW_DARK} />
				<path d="M-36,-266 C-36,-290 18,-290 18,-266 Z" fill={YELLOW} />
			</g>
			<Balkenkreuz x={-230} y={-140} s={0.8} />
		</g>
	);
};

/** The stamped serial plate, close up: brass, rivets, embossed digits; `torch` lights it. */
export const SerialPlate: React.FC<{serial: string; label?: string; torch?: number; reveal?: number}> = ({serial, label = 'Fgst.Nr.', torch = 1, reveal = 1}) => (
	<g>
		<rect x={-330} y={-130} width={660} height={260} rx={18} fill="#4a4234" />
		<rect x={-310} y={-110} width={620} height={220} rx={10} fill="url(#brass)" />
		<rect x={-310} y={-110} width={620} height={220} rx={10} fill="url(#rivets)" opacity={0.8} />
		{[
			[-280, -80],
			[280, -80],
			[-280, 80],
			[280, 80],
		].map(([x, y], i) => (
			<g key={i}>
				<circle cx={x} cy={y} r={13} fill="#6b5328" />
				<circle cx={x - 3} cy={y - 3} r={5} fill="#d9b874" opacity={0.6} />
			</g>
		))}
		<text x={-240} y={-40} style={{fontFamily: 'monospace', fontSize: 34, fontWeight: 700, fill: '#4a3517', letterSpacing: '0.1em'}}>
			{label}
		</text>
		<text x={0} y={60} textAnchor="middle" style={{fontFamily: 'monospace', fontSize: 110, fontWeight: 700, fill: '#3a2810', letterSpacing: '0.12em'}}>
			{serial.slice(0, Math.round(serial.length * reveal))}
		</text>
		<text x={0} y={58} textAnchor="middle" style={{fontFamily: 'monospace', fontSize: 110, fontWeight: 700, fill: '#f6dfa0', opacity: 0.35, letterSpacing: '0.12em'}} transform="translate(-2,-3)">
			{serial.slice(0, Math.round(serial.length * reveal))}
		</text>
		{/* torch hotspot */}
		<ellipse cx={-40} cy={-10} rx={360} ry={200} fill="url(#glow-lamp)" opacity={0.45 * torch} style={{mixBlendMode: 'screen'}} />
		<rect x={-330} y={-130} width={660} height={260} rx={18} fill="#000" opacity={0.55 * (1 - torch)} />
	</g>
);

/** A glass jar of numbered balls for the toy version of the problem. */
/** `lid`: 0 on, 1 lifted off out of the shot. */
export const Jar: React.FC<{balls: {n: number; x: number; y: number; lit?: number; out?: number}[]; lid?: number}> = ({balls, lid = 0}) => (
	<g>
		<path d="M-150,-330 L150,-330 L150,-300 C190,-280 200,-240 200,-200 L200,40 C200,80 170,100 130,100 L-130,100 C-170,100 -200,80 -200,40 L-200,-200 C-200,-240 -190,-280 -150,-300 Z" fill="rgba(160,200,235,0.08)" stroke="rgba(210,230,255,0.45)" strokeWidth={4} />
		<g transform={`translate(${-220 * lid},${-520 * lid}) rotate(${-30 * lid})`} opacity={1 - 0.6 * lid}>
			<rect x={-160} y={-350} width={320} height={26} rx={6} fill="url(#brass)" />
		</g>
		{balls.map((b, i) => {
			const out = b.out ?? 0;
			const lit = b.lit ?? 0;
			return (
				<g key={i} transform={`translate(${b.x},${b.y - out * 520}) scale(${1 + out * 0.6})`}>
					{lit > 0 ? <circle r={44} fill="url(#glow-lamp)" opacity={lit} /> : null}
					<circle r={26} fill={lit > 0 ? '#f6e3b0' : '#d9cfb6'} />
					<circle cx={-8} cy={-9} r={7} fill="#fff" opacity={0.5} />
					<text y={9} textAnchor="middle" style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 24, fill: '#3a2f1e'}}>
						{b.n}
					</text>
				</g>
			);
		})}
		<path d="M-170,-250 C-180,-120 -180,0 -160,60" stroke="#fff" strokeOpacity={0.18} strokeWidth={10} fill="none" strokeLinecap="round" />
	</g>
);
