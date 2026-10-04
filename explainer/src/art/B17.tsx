import React from 'react';
import {P} from './palette';

/**
 * B-17F Flying Fortress, as flown in 1943: olive drab over neutral gray,
 * star-and-bar insignia. Side view (nose right, ~920 units long, centreline y=0)
 * and top view (nose up, ~760 span). Props spin with `prop` (radians).
 */

export type Damage = {x: number; y: number; r?: number};

const Insignia: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
	const star = Array.from({length: 10}, (_, i) => {
		const a = (Math.PI / 5) * i - Math.PI / 2;
		const r = i % 2 ? 9.5 : 24;
		return `${Math.cos(a) * r},${Math.sin(a) * r}`;
	}).join(' ');
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<rect x={-58} y={-11} width={116} height={22} fill={P.insigniaBlue} />
			<rect x={-55} y={-8} width={110} height={16} fill={P.star} />
			<circle r={28} fill={P.insigniaBlue} />
			<circle r={25} fill={P.star} opacity={0} />
			<polygon points={star} fill={P.star} />
		</g>
	);
};

/** Torn-metal bullet hole decal. */
export const HoleDecal: React.FC<{x: number; y: number; r?: number; glow?: number; seed?: number}> = ({x, y, r = 7, glow = 0, seed = 0}) => {
	const pts = Array.from({length: 9}, (_, i) => {
		const a = (Math.PI * 2 * i) / 9 + seed;
		const k = i % 2 ? 0.55 : 1 + 0.25 * Math.sin(seed * 7 + i);
		return `${Math.cos(a) * r * k},${Math.sin(a) * r * k}`;
	}).join(' ');
	return (
		<g transform={`translate(${x},${y})`}>
			{glow > 0 ? <circle r={r * 3.2} fill="url(#glow-red)" opacity={0.55 * glow} /> : null}
			<polygon points={pts} fill="#c9ccd1" opacity={0.85} />
			<circle r={r * 0.55} fill="#0b0a0a" />
		</g>
	);
};

const Prop: React.FC<{x: number; y: number; angle: number; len?: number; far?: boolean}> = ({x, y, angle, len = 74, far}) => (
	<g transform={`translate(${x},${y})`} opacity={far ? 0.7 : 1}>
		<ellipse rx={6} ry={len} fill="#c9ccd4" opacity={0.08} />
		{[0, 1, 2].map((i) => {
			const l = len * Math.cos(angle + (i * Math.PI * 2) / 3);
			return <path key={i} d={`M0,0 L${-2},${l}`} stroke="#15161a" strokeWidth={7} strokeLinecap="round" />;
		})}
		<ellipse rx={9} ry={12} fill="#2b2d33" />
	</g>
);

export const B17Side: React.FC<{prop?: number; damage?: Damage[]; holeGlow?: number; engineFire?: number; lights?: boolean; gear?: boolean}> = ({
	prop = 0,
	damage = [],
	holeGlow = 0,
	lights = false,
	gear = false,
}) => {
	const body = (
		<B17SideBody prop={prop} damage={damage} holeGlow={holeGlow} lights={lights} gear={gear} />
	);
	// on the ground a B-17 rests on its main wheels and tail wheel, nose up ~7°; ground line y = 150
	return gear ? <g transform="rotate(-6.8, 262, 150)">{body}</g> : body;
};

const B17SideBody: React.FC<{prop: number; damage: Damage[]; holeGlow: number; lights: boolean; gear: boolean}> = ({prop, damage, holeGlow, lights, gear}) => {
	const fuselage =
		'M452,2 C452,-26 436,-40 404,-43 L326,-46 C306,-62 262,-68 232,-58 L118,-50 L-150,-44 L-330,-32 L-452,-14 C-462,-10 -462,8 -452,12 L-300,30 L-100,44 L110,47 L300,42 C404,40 446,28 452,2 Z';
	return (
		<g>
			{gear ? (
				<g>
					{/* main gear under the inboard nacelle, tail wheel; ground line is y = 150 */}
					<path d="M262,30 L250,110 M282,30 L274,110" stroke="#23252b" strokeWidth={9} strokeLinecap="round" />
					<circle cx={262} cy={118} r={32} fill="#141518" />
					<circle cx={262} cy={118} r={14} fill="#3b3e46" />
					<path d="M-392,8 L-400,52" stroke="#23252b" strokeWidth={7} strokeLinecap="round" />
					<circle cx={-400} cy={58} r={14} fill="#141518" />
				</g>
			) : null}
			{/* far-side engines and wing, in shadow */}
			<g opacity={0.9}>
				<path d="M378,-6 C378,-20 356,-22 320,-22 L196,-16 L196,16 L320,22 C356,22 378,14 378,0 Z" fill={P.odDark} />
				<Prop x={386} y={-4} angle={prop + 1} far />
			</g>
			{/* dorsal fin */}
			<path d="M-228,-44 C-298,-58 -336,-118 -358,-198 C-366,-226 -402,-234 -424,-222 L-454,-150 L-462,-14 Z" fill="url(#metal-od-v)" />
			<line x1={-428} y1={-214} x2={-440} y2={-18} stroke="#000" strokeOpacity={0.25} strokeWidth={2} />
			<text x={-398} y={-120} textAnchor="middle" style={{fontFamily: 'monospace', fontSize: 22, fontWeight: 700, fill: '#e2c35a'}} transform="rotate(-2,-398,-120)">
				230127
			</text>
			{/* fuselage */}
			<path d={fuselage} fill="url(#metal-od)" />
			<path d={fuselage} fill="url(#rivets)" opacity={0.6} />
			{[300, 180, 40, -90, -220, -340].map((x) => (
				<line key={x} x1={x} y1={-48 + Math.abs(x) * 0.02} x2={x} y2={44 - Math.abs(x) * 0.03} stroke="#000" strokeOpacity={0.18} strokeWidth={1.5} />
			))}
			<path d="M-450,-12 L452,-6" stroke="#fff" strokeOpacity={0.08} strokeWidth={3} />
			{/* nose glazing and cockpit */}
			<path d="M452,2 C452,-26 436,-40 404,-43 L392,-43 C392,-20 396,10 404,38 C430,32 448,22 452,2 Z" fill="url(#glass)" />
			{[412, 428, 442].map((x) => (
				<line key={x} x1={x} y1={-40} x2={x} y2={34} stroke="#2a2d33" strokeWidth={1.5} opacity={0.7} />
			))}
			<path d="M320,-46 C302,-60 264,-64 238,-56 L242,-46 Z" fill="url(#glass)" />
			<line x1={282} y1={-62} x2={286} y2={-46} stroke="#2a2d33" strokeWidth={2} />
			{/* top turret, radio room, waist and tail windows */}
			<ellipse cx={206} cy={-56} rx={28} ry={17} fill="url(#glass)" />
			<path d="M196,-62 L150,-70 M196,-56 L150,-62" stroke="#1a1b1f" strokeWidth={3} />
			<rect x={40} y={-36} width={26} height={14} rx={3} fill="#1b1f28" />
			<rect x={-140} y={-30} width={56} height={26} rx={4} fill="#14171e" />
			<path d="M-112,-17 L-166,-24" stroke="#1a1b1f" strokeWidth={4} />
			<path d="M-452,-10 L-440,-10 L-440,8 L-452,10 Z" fill="url(#glass)" />
			{/* ball turret */}
			<circle cx={-20} cy={52} r={22} fill="#3b4049" />
			<path d="M-34,44 A16,16 0 0,1 -6,44" fill="url(#glass)" />
			{/* horizontal stabiliser */}
			<path d="M-330,-8 L-462,-12 L-474,-2 L-330,6 Z" fill={P.odDark} />
			{/* wing root and near engines */}
			<path d="M280,6 C270,-6 160,-8 56,0 L56,16 C160,20 260,18 280,6 Z" fill="#40442d" />
			<path d="M396,8 C396,-8 372,-12 330,-12 L168,-6 L168,30 L330,34 C372,34 396,24 396,12 Z" fill="url(#metal-od)" />
			<path d="M396,8 C396,-8 384,-12 366,-12 L366,32 C384,32 396,24 396,12 Z" fill="#2c2f22" />
			<path d="M300,30 L244,52 L232,50 L284,30 Z" fill="#2a2c22" />
			<Prop x={404} y={10} angle={prop} />
			<Insignia x={-176} y={0} s={0.9} />
			{damage.map((d, i) => (
				<HoleDecal key={i} x={d.x} y={d.y} r={d.r ?? 7} glow={holeGlow} seed={i * 1.7} />
			))}
			{lights ? (
				<>
					<circle cx={446} cy={-4} r={5} fill="#fff6d8" />
					<circle cx={446} cy={-4} r={60} fill="url(#glow-lamp)" opacity={0.5} />
				</>
			) : null}
		</g>
	);
};

/** Top view, nose up, centred. Same zones as the episode's hole charts. */
export const B17Top: React.FC<{prop?: number; damage?: Damage[]; holeGlow?: number; engineGlow?: number; ghost?: string}> = ({
	prop = 0,
	damage = [],
	holeGlow = 0,
	engineGlow = 0,
	ghost,
}) => {
	const wing = 'M-24,-58 L-372,-22 C-382,-20 -384,-2 -374,2 L-24,30 Z';
	const tail = 'M-12,236 L-128,262 C-136,264 -138,280 -128,282 L-12,288 Z';
	const fuse = 'M0,-300 C16,-300 26,-280 28,-250 L30,180 C28,240 14,300 0,306 C-14,300 -28,240 -30,180 L-28,-250 C-26,-280 -16,-300 0,-300 Z';
	const g = ghost;
	const fill = (f: string) => (g ? 'none' : f);
	const st = g ? {stroke: g, strokeWidth: 3, strokeDasharray: '10 8'} : {};
	return (
		<g>
			<path d={wing} fill={fill('url(#metal-od-v)')} {...st} />
			<path d={wing} fill={fill('url(#metal-od-v)')} transform="scale(-1,1)" {...st} />
			<path d={tail} fill={fill(P.odGreen)} {...st} />
			<path d={tail} fill={fill(P.odGreen)} transform="scale(-1,1)" {...st} />
			{[-250, -140, 140, 250].map((x) => (
				<g key={x}>
					{engineGlow > 0 ? <ellipse cx={x} cy={-60} rx={60} ry={90} fill="url(#glow-lamp)" opacity={engineGlow} /> : null}
					<path d={`M${x - 15},-108 C${x - 15},-118 ${x + 15},-118 ${x + 15},-108 L${x + 13},${-4 + Math.abs(x) * 0.02} L${x - 13},${-4 + Math.abs(x) * 0.02} Z`} fill={fill(engineGlow > 0 ? '#6e6234' : P.odDark)} {...st} stroke={engineGlow > 0 ? P.gold : st.stroke} strokeWidth={engineGlow > 0 ? 3 : st.strokeWidth} />
					{!g ? (
						<g transform={`translate(${x},-118)`}>
							<ellipse rx={64} ry={5} fill="#c9ccd4" opacity={0.1} />
							{[0, 1, 2].map((i) => (
								<line key={i} x1={0} y1={0} x2={60 * Math.cos(prop + (i * Math.PI * 2) / 3)} y2={0} stroke="#15161a" strokeWidth={6} strokeLinecap="round" />
							))}
						</g>
					) : null}
				</g>
			))}
			<path d={fuse} fill={fill('url(#metal-od-v)')} {...st} />
			{!g ? (
				<>
					<path d="M0,-300 C12,-300 20,-288 22,-268 L-22,-268 C-20,-288 -12,-300 0,-300 Z" fill="url(#glass)" />
					<path d="M-14,-232 L14,-232 L12,-206 L-12,-206 Z" fill="url(#glass)" />
					<circle cx={0} cy={-176} r={14} fill="url(#glass)" />
					<path d="M-3,-60 L-3,236 M3,-60 L3,236" stroke="#000" strokeOpacity={0.15} />
					<g transform="translate(-250,-18) scale(0.55)">
						<circle r={28} fill={P.insigniaBlue} />
						<polygon points={Array.from({length: 10}, (_, i) => {
							const a = (Math.PI / 5) * i - Math.PI / 2;
							const r = i % 2 ? 9.5 : 24;
							return `${Math.cos(a) * r},${Math.sin(a) * r}`;
						}).join(' ')} fill={P.star} />
					</g>
				</>
			) : null}
			{damage.map((d, i) => (
				<HoleDecal key={i} x={d.x} y={d.y} r={d.r ?? 7} glow={holeGlow} seed={i * 1.3} />
			))}
		</g>
	);
};
