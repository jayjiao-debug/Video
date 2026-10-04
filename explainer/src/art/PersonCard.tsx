import React from 'react';
import {color, font} from '../lib/theme';

/**
 * A person card: how a Juno episode introduces a real person without animating one.
 * A cut-paper profile silhouette (19th-century cameo style) inside a thin gold oval,
 * with the name, years and role beside it, like an archive caption. It enters with a
 * short rise, holds still while it is read, and leaves with a fade.
 *
 * Draw it in screen space (an overlay), on the line that names the person.
 * `t` is local frames since it should appear; `dur` how long it stays.
 */
export type Profile = {beard?: boolean; glasses?: boolean; hair?: 'full' | 'short' | 'bald'};

const HEAD =
	'M20,240 C25,204 48,192 70,186 C72,172 68,160 62,150 C45,135 40,100 50,75 C62,40 100,28 128,36 C150,42 160,60 160,80 ' +
	'C160,90 158,98 162,104 L177,128 C173,132 169,134 166,136 C168,140 170,144 168,148 C172,150 170,154 166,156 ' +
	'C168,160 166,166 160,170 C150,176 140,176 132,174 C128,182 128,190 132,196 C160,205 185,215 190,240 Z';

export const Silhouette: React.FC<{p: Profile; fill: string}> = ({p, fill}) => (
	<g fill={fill}>
		<path d={HEAD} />
		{p.hair === 'full' ? <path d="M48,80 C40,48 70,26 110,28 C140,30 156,44 160,62 C150,50 130,44 110,46 C86,48 66,62 60,92 Z" /> : null}
		{p.beard ? <path d="M146,138 C166,146 172,172 162,196 C152,212 126,208 116,190 C110,176 118,160 130,156 Z" /> : null}
		{p.glasses ? (
			<g stroke={fill} strokeWidth={3} fill="none">
				<line x1={104} y1={96} x2={158} y2={98} />
				<ellipse cx={162} cy={100} rx={6} ry={8} />
			</g>
		) : null}
	</g>
);

export const PersonCard: React.FC<{
	t: number;
	dur: number;
	name: string; // latin, e.g. 'SIMON NEWCOMB'
	zh: string; // e.g. '西蒙·纽康'
	years: string; // e.g. '1835 – 1909'
	role: string; // e.g. '天文学家 · 美国航海天文历编纂局'
	profile: Profile;
	x?: number;
	y?: number;
	/**
	 * Optional achievements listed under the caption, each rising in at its own local frame
	 * (`at`, frames after the card appears; keep the gaps uneven so they don't tick on the beat).
	 * `muted` rows are greyed (e.g. a controversial footnote).
	 */
	facts?: {year?: string; text: string; at: number; muted?: boolean}[];
}> = ({t, dur, name, zh, years, role, profile, x = 120, y = 150, facts = []}) => {
	if (t < 0 || t > dur) return null;
	const inP = Math.min(1, t / 14);
	const e = 1 - Math.pow(1 - inP, 3);
	const out = Math.max(0, Math.min(1, (t - (dur - 12)) / 12));
	const o = e * (1 - out);
	const id = `pc-${name.replace(/\W/g, '')}`;
	const ROW = 60;
	const shown = (i: number) => {
		const k = Math.min(1, Math.max(0, (t - facts[i].at + 2) / 10));
		return 1 - Math.pow(1 - k, 3);
	};
	const factsIn = facts.reduce((n, _, i) => n + shown(i), 0);
	return (
		<g transform={`translate(${x},${y + 16 * (1 - e)})`} opacity={o}>
			<defs>
				<clipPath id={id}>
					<ellipse cx={90} cy={110} rx={74} ry={94} />
				</clipPath>
				<radialGradient id={`${id}-bg`} cx="0.45" cy="0.4" r="0.7">
					<stop offset="0" stopColor="#f3e9d2" />
					<stop offset="1" stopColor="#d9c9a4" />
				</radialGradient>
			</defs>
			{/* soft backing so the card reads on any set */}
			{/* the backing grows with the rows as they arrive, so it is never an empty box */}
			<rect x={-30} y={-20} width={facts.length ? 690 : 560} height={260 + (facts.length ? 34 * shown(0) + factsIn * ROW : 0)} rx={14} fill="#07060a" opacity={facts.length ? 0.66 : 0.55} />
			{facts.length ? <line x1={0} y1={252} x2={630 * Math.min(1, Math.max(0, (t - 8) / 16))} y2={252} stroke={color.goldDeep} strokeWidth={1.5} opacity={0.7} /> : null}
			{facts.map((fact, i) => {
				const k = t - fact.at;
				if (k < 0) return null;
				const a = Math.min(1, k / 10);
				const ea = 1 - Math.pow(1 - a, 3);
				const fy = 306 + i * ROW;
				return (
					<g key={i} opacity={ea} transform={`translate(${-18 * (1 - ea)},0)`}>
						{fact.year ? (
							<text x={0} y={fy} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 34, fill: fact.muted ? '#8a857a' : color.gold, fontVariantNumeric: 'lining-nums'}}>
								{fact.year}
							</text>
						) : (
							<circle cx={10} cy={fy - 10} r={5} fill={fact.muted ? '#8a857a' : color.gold} />
						)}
						<text x={92} y={fy} style={{fontFamily: font.serif, fontWeight: fact.muted ? 500 : 700, fontSize: fact.muted ? 27 : 33, fill: fact.muted ? '#9a9488' : color.text}}>
							{fact.text}
						</text>
					</g>
				);
			})}
			<ellipse cx={90} cy={110} rx={74} ry={94} fill={`url(#${id}-bg)`} />
			<g clipPath={`url(#${id})`}>
				<g transform="translate(16,20) scale(0.72)">
					<Silhouette p={profile} fill="#231a12" />
				</g>
			</g>
			<ellipse cx={90} cy={110} rx={74} ry={94} fill="none" stroke={color.goldDeep} strokeWidth={3} />
			<ellipse cx={90} cy={110} rx={82} ry={102} fill="none" stroke={color.goldDeep} strokeWidth={1} opacity={0.6} />
			<text x={200} y={70} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 24, letterSpacing: '0.22em', fill: color.goldDeep, fontVariantNumeric: 'lining-nums'}}>
				{name}
			</text>
			<text x={200} y={124} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 46, fill: color.text}}>
				{zh}
			</text>
			<text x={200} y={164} style={{fontFamily: font.latin, fontWeight: 600, fontSize: 26, fill: '#cfc8b8', fontVariantNumeric: 'lining-nums'}}>
				{years}
			</text>
			<text x={200} y={200} style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.06em', fill: '#9a9488'}}>
				{role}
			</text>
		</g>
	);
};
