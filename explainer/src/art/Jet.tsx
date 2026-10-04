import React from 'react';
import {P} from './palette';

/**
 * A 1960s two-seat jet trainer in the Fouga Magister mould (the Israeli Air Force flight
 * school's "Tzukit" from 1960): slim fuselage, long tandem bubble canopy, straight wing
 * with tip tanks, butterfly V-tail. Natural metal with dayglo trainer bands and the
 * star-of-David roundel. Side view, nose to +x, origin at the centre of gravity.
 * About 420 units long.
 */
export const JET_DEFS: React.FC = () => (
	<defs>
		<linearGradient id="jet-metal" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#e9ecf0" />
			<stop offset="0.35" stopColor="#c3c8cf" />
			<stop offset="0.75" stopColor="#8f959e" />
			<stop offset="1" stopColor="#5d636c" />
		</linearGradient>
		<linearGradient id="jet-metal-dark" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#a9aeb6" />
			<stop offset="1" stopColor="#555b64" />
		</linearGradient>
		<linearGradient id="jet-canopy" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#dff0ff" stopOpacity="0.95" />
			<stop offset="0.45" stopColor="#7fa6c8" stopOpacity="0.8" />
			<stop offset="1" stopColor="#2a3a52" stopOpacity="0.9" />
		</linearGradient>
		<linearGradient id="jet-dayglo" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#ff8a4a" />
			<stop offset="1" stopColor="#c2421c" />
		</linearGradient>
		<radialGradient id="jet-exhaust">
			<stop offset="0" stopColor="#fff2d0" stopOpacity="0.9" />
			<stop offset="0.4" stopColor="#ffb05a" stopOpacity="0.45" />
			<stop offset="1" stopColor="#ff7a3d" stopOpacity="0" />
		</radialGradient>
	</defs>
);

const FUSE =
	'M212,4 C206,-10 186,-20 150,-24 L40,-30 C-20,-31 -90,-28 -150,-20 L-196,-12 C-206,-10 -210,-4 -210,2 ' +
	'C-210,8 -204,12 -194,13 L-120,20 C-40,26 60,26 140,20 C180,17 204,13 212,4 Z';

export const TrainerJet: React.FC<{
	/** 0..1 how lit by a warm key from the left/below (sunset, hangar light) */
	warm?: number;
	/** wheels down */
	gear?: boolean;
	/** engine glow 0..1 */
	burn?: number;
	/** cadet number painted on the nose */
	no?: string;
	/** skip small details (far away) */
	lod?: 'full' | 'far';
}> = ({warm = 0, gear = false, burn = 0, no = '14', lod = 'full'}) => {
	const far = lod === 'far';
	return (
		<g>
			{/* far V-tail surface (behind the fuselage) */}
			<path d="M-150,-16 L-200,-92 L-226,-90 L-206,-14 Z" fill="url(#jet-metal-dark)" />
			{/* far tip tank, peeking under the fuselage */}
			<ellipse cx={-6} cy={14} rx={46} ry={9} fill="#6c727b" />
			{/* fuselage */}
			<path d={FUSE} fill="url(#jet-metal)" />
			{/* exhaust nozzle */}
			<ellipse cx={-206} cy={0} rx={6} ry={11} fill="#2a2d33" />
			{burn > 0 ? <ellipse cx={-226} cy={0} rx={40} ry={16} fill="url(#jet-exhaust)" opacity={burn} /> : null}
			{/* dayglo trainer bands: nose and rear fuselage */}
			<path d="M212,4 C206,-10 186,-20 150,-24 L150,21 C180,17 204,13 212,4 Z" fill="url(#jet-dayglo)" opacity={0.92} />
			<path d="M-120,-24 L-150,-20 L-150,17 L-120,20 Z" fill="url(#jet-dayglo)" opacity={0.92} />
			{/* intake on the fuselage side, at the wing root */}
			<path d="M8,-16 C18,-19 32,-17 38,-12 L36,-6 C26,-9 16,-9 8,-8 Z" fill="#4a505a" opacity={0.8} />
			{/* tandem canopy: two bubbles under one long frame */}
			<path d="M128,-24 C110,-48 70,-56 30,-54 C0,-52 -26,-44 -38,-30 L-38,-28 L128,-24 Z" fill="url(#jet-canopy)" />
			<path d="M128,-24 C110,-48 70,-56 30,-54 C0,-52 -26,-44 -38,-30" fill="none" stroke="#5a616b" strokeWidth={3} />
			<line x1={44} y1={-54} x2={40} y2={-27} stroke="#5a616b" strokeWidth={3} />
			{!far ? (
				<>
					{/* two helmets */}
					<circle cx={78} cy={-38} r={10} fill="#e8e4da" opacity={0.8} />
					<circle cx={0} cy={-36} r={10} fill="#e8e4da" opacity={0.8} />
					{/* glint */}
					<path d="M100,-44 C84,-52 60,-54 46,-52" fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.75} />
				</>
			) : null}
			{/* near wing (seen edge-on) with its tip tank */}
			<path d="M60,6 L-60,8 L-70,16 L56,14 Z" fill="url(#jet-metal-dark)" />
			<ellipse cx={-4} cy={22} rx={58} ry={11} fill="url(#jet-metal)" />
			<path d="M54,22 C54,16 58,13 62,22 C58,31 54,28 54,22 Z" fill="url(#jet-dayglo)" />
			{/* near V-tail surface, raked out toward us */}
			<path d="M-138,-14 L-184,-104 L-212,-102 L-194,-12 Z" fill="url(#jet-metal)" />
			<path d="M-184,-104 L-212,-102 L-206,-84 L-180,-86 Z" fill="url(#jet-dayglo)" opacity={0.92} />
			{/* panel lines */}
			{!far ? (
				<g stroke="#6b717a" strokeWidth={1.4} opacity={0.6} fill="none">
					<line x1={150} y1={-23} x2={150} y2={20} />
					<line x1={-60} y1={-28} x2={-60} y2={25} />
					<line x1={-120} y1={-24} x2={-120} y2={20} />
					<path d="M-150,4 L200,6" opacity={0.5} />
				</g>
			) : null}
			{/* roundel: a white disc, blue star of David */}
			<g transform="translate(-92,-1)">
				<circle r={13} fill="#f4f2ec" />
				<g stroke="#2a4fa0" strokeWidth={2.6} fill="none" strokeLinejoin="round">
					<path d="M0,-9 L7.8,4.5 L-7.8,4.5 Z" />
					<path d="M0,9 L7.8,-4.5 L-7.8,-4.5 Z" />
				</g>
			</g>
			{!far ? (
				<text x={170} y={8} textAnchor="middle" style={{fontFamily: 'sans-serif', fontWeight: 700, fontSize: 16, fill: '#1e1e22', fontVariantNumeric: 'lining-nums'}}>
					{no}
				</text>
			) : null}
			{/* warm key from below (sunset, hangar) */}
			{warm > 0 ? <path d={FUSE} fill={P.lamp} opacity={0.18 * warm} /> : null}
			{gear ? (
				<g fill="#2a2d33" stroke="#2a2d33">
					<line x1={150} y1={18} x2={152} y2={48} strokeWidth={5} />
					<circle cx={152} cy={52} r={9} />
					<line x1={-30} y1={22} x2={-34} y2={50} strokeWidth={6} />
					<circle cx={-34} cy={54} r={12} />
				</g>
			) : null}
		</g>
	);
};

/**
 * White display smoke behind a jet, from a list of past positions (oldest first).
 * The puff grows and fades with age; a little wind drifts it.
 */
export const SmokeTrail: React.FC<{points: [number, number][]; width?: number; tone?: string; opacity?: number}> = ({points, width = 18, tone = '#f2eee6', opacity = 0.85}) => {
	const n = points.length;
	return (
		<g filter="url(#blur-sm)">
			{points.map(([x, y], i) => {
				const age = 1 - i / Math.max(1, n - 1); // 1 = oldest
				return <circle key={i} cx={x + age * 16} cy={y - age * 10} r={width * (0.45 + 1.2 * age)} fill={tone} opacity={opacity * Math.pow(1 - age, 0.8) * (i % 2 ? 0.8 : 1)} />;
			})}
		</g>
	);
};
