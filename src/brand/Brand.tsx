import React from 'react';
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame } from 'remotion';
import { ease, prog, font } from './lib';
import {JUNO} from './identity';

/**
 * Juno's channel package: a title card (片头) that replaces the plain card the
 * videos already carry at ~16–21 s, and an end card (片尾) that extends each
 * video while the background track keeps playing. Config: brand/videos.yaml →
 * public/build/brand/brand.json (written by brand.py).
 */

export type VideoCfg = {
	id: string;
	title: string;
	kicker: string;
	tagline: string;
	taglineEn: string;
	motif: 'cards' | 'duel' | 'stars' | 'serials' | 'grid';
	question: string;
	sources: string;
};

const GOLD = JUNO.colors.gold;
const INK = JUNO.colors.ink;
const W = 1920;
const H = 1080;

// ------------------------------------------------------------------ pieces

/** The channel monogram: a gold ring, an italic J, a four-point spark. `draw` 0..1 animates it in. */
export const Monogram: React.FC<{draw?: number; size?: number; wordmark?: string}> = ({draw = 1, size = 1, wordmark}) => {
	const r = 54;
	const c = 2 * Math.PI * r;
	const spark = Math.max(0, Math.min(1, (draw - 0.6) / 0.4));
	return (
		<g transform={`scale(${size})`}>
			<circle r={r} fill="none" stroke={GOLD} strokeWidth={2.5} strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, draw * 1.3))} transform="rotate(-90)" />
			<circle r={47} fill="none" stroke={GOLD} strokeWidth={1} opacity={0.35 * draw} />
			<text y={22} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontWeight: 600, fontSize: 70, fill: GOLD}} opacity={Math.min(1, Math.max(0, (draw - 0.3) / 0.4))}>
				J
			</text>
			<path d="M0,-9 L2.2,-2.2 L9,0 L2.2,2.2 L0,9 L-2.2,2.2 L-9,0 L-2.2,-2.2 Z" fill="#fff4d6" transform={`translate(40,-40) scale(${spark * 1.4}) rotate(${draw * 90})`} />
			{wordmark ? (
				<text y={r + 48} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 26, letterSpacing: '0.6em', fill: GOLD}} opacity={Math.min(1, Math.max(0, (draw - 0.5) * 2))}>
					{wordmark.toUpperCase()}
				</text>
			) : null}
		</g>
	);
};

/** One small line drawing per episode, drawn on with `p` 0..1. */
const Motif: React.FC<{kind: VideoCfg['motif']; p: number; f: number}> = ({kind, p, f}) => {
	if (kind === 'cards') {
		// eleven cards on a red thread; the fifth one is the answer
		return (
			<g>
				<path d="M-330,-14 Q0,10 330,-14" fill="none" stroke="#9e2a2a" strokeWidth={2} strokeDasharray={700} strokeDashoffset={700 * (1 - p)} />
				{Array.from({length: 11}, (_, i) => {
					const x = -300 + i * 60;
					const y = -12 + 10 * (1 - Math.pow((x / 330), 2)) + 4;
					const q = Math.min(1, Math.max(0, p * 13 - i));
					const hero = i === 4;
					const sway = Math.sin(f / 18 + i) * 2;
					return (
						<g key={i} transform={`translate(${x},${y}) rotate(${sway})`} opacity={q}>
							{hero ? <circle cy={26} r={46} fill="url(#brand-glow)" opacity={0.9} /> : null}
							<rect x={-17} y={4} width={34} height={44} rx={2} fill={hero ? '#f6e3b0' : i < 4 ? '#8d8673' : '#d9cfb6'} />
							<text y={34} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 22, fill: '#3a2f1e'}}>
								{hero ? '5' : '?'}
							</text>
						</g>
					);
				})}
			</g>
		);
	}
	if (kind === 'serials') {
		// five stamped plates; the largest number glows
		const nums = ['19', '40', '42', '60', '?'];
		return (
			<g>
				{nums.map((n, i) => {
					const q = Math.min(1, Math.max(0, p * 6 - i));
					const hero = i === 3;
					const unknown = i === 4;
					return (
						<g key={i} transform={`translate(${(i - 2) * 96},${(1 - q) * 14})`} opacity={q}>
							{hero ? <circle r={56} fill="url(#brand-glow)" /> : null}
							<rect x={-40} y={-24} width={80} height={48} rx={5} fill={unknown ? 'none' : hero ? '#f3d58d' : '#b49a62'} stroke={unknown ? GOLD : '#5a4520'} strokeWidth={2} strokeDasharray={unknown ? '6 5' : undefined} />
							<text y={11} textAnchor="middle" style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 28, fill: unknown ? GOLD : '#3a2810'}}>
								{n}
							</text>
						</g>
					);
				})}
			</g>
		);
	}
	if (kind === 'duel') {
		// two cards, 合作 meeting 合作, with a spark between them
		const s = spring({frame: Math.round(p * 40), fps: 30, config: {damping: 12}});
		return (
			<g>
				{[-1, 1].map((d) => (
					<g key={d} transform={`translate(${d * (140 - 70 * s)},10) rotate(${d * (12 - 8 * s)})`} opacity={Math.min(1, p * 2)}>
						<rect x={-36} y={-48} width={72} height={96} rx={6} fill="#efe6d2" stroke="#b08a4a" strokeWidth={2} />
						<text y={10} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 26, fill: '#3a2f1e'}}>
							合作
						</text>
					</g>
				))}
				<circle cy={10} r={60 * s} fill="url(#brand-glow)" opacity={s} />
			</g>
		);
	}
	if (kind === 'grid') {
		// a 6x3 patch of Clarke's grid: random hits, some squares empty, one crowded
		const cols = 8, rows = 2, cs = 38;
		const hits = [1, 0, 2, 0, 0, 1, 0, 1, 0, 0, 3, 0, 1, 0, 2, 0];
		return (
			<g transform={`translate(${(-cols * cs) / 2},${(-rows * cs) / 2 - 6})`}>
				{hits.map((n, i) => {
					const c = i % cols, r = Math.floor(i / cols);
					const q = Math.min(1, Math.max(0, p * 20 - i));
					return (
						<g key={i} transform={`translate(${c * cs},${r * cs})`} opacity={q}>
							<rect x={2} y={2} width={cs - 4} height={cs - 4} fill="none" stroke={GOLD} strokeOpacity={0.55} strokeWidth={1.2} />
							{Array.from({length: n}, (_, k) => (
								<circle key={k} cx={9 + random(`gx${i}${k}`) * (cs - 18)} cy={9 + random(`gy${i}${k}`) * (cs - 18)} r={3} fill={n === 3 ? '#fff4d6' : GOLD} />
							))}
							{n === 3 ? <circle cx={cs / 2} cy={cs / 2} r={24} fill="url(#brand-glow)" opacity={0.7 * (0.6 + 0.4 * Math.sin(f / 9))} /> : null}
						</g>
					);
				})}
			</g>
		);
	}
	// stars: a constellation that resolves into the Drake-style product
	const pts = Array.from({length: 18}, (_, i) => [(random(`m${i}`) - 0.5) * 640, (random(`n${i}`) - 0.5) * 44 - 18] as [number, number]);
	return (
		<g>
			{pts.map(([x, y], i) => (
				<circle key={i} cx={x} cy={y} r={i === 7 ? 5 : 2.2} fill={i === 7 ? '#fff4d6' : GOLD} opacity={Math.min(1, Math.max(0, p * 18 - i)) * (0.5 + 0.5 * Math.sin(f / 9 + i))} />
			))}
			<circle cx={pts[7][0]} cy={pts[7][1]} r={34} fill="url(#brand-glow)" opacity={p} />
			<text y={36} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 24, fill: GOLD, letterSpacing: '0.12em'}} opacity={Math.max(0, p * 2 - 1)}>
				N = R* · fp · ne · fl · fi · fc · L
			</text>
		</g>
	);
};

/** Metallic gold title with a staggered reveal and one light sweep. */
const GoldTitle: React.FC<{text: string; f: number; at: number; size: number; y: number}> = ({text, f, at, size, y}) => {
	const chars = [...`《${text}》`];
	const sweep = interpolate(f, [at + 26, at + 56], [-700, 700], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut});
	const width = chars.length * size * 0.98;
	return (
		<g>
			<defs>
				<linearGradient id="gold-metal" x1="0" y1={y - size * 0.8} x2="0" y2={y + size * 0.2} gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#fff3cf" />
					<stop offset="0.45" stopColor="#f3cd7a" />
					<stop offset="0.7" stopColor="#c99140" />
					<stop offset="1" stopColor="#8a5a22" />
				</linearGradient>
				<linearGradient id="gold-sweep" x1={W / 2 + sweep - 120} y1="0" x2={W / 2 + sweep + 120} y2="0" gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#fff" stopOpacity="0" />
					<stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
					<stop offset="1" stopColor="#fff" stopOpacity="0" />
				</linearGradient>
			</defs>
			{(['gold-metal', 'gold-sweep'] as const).map((fill) => (
				<text key={fill} y={y} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, letterSpacing: '0.04em'}}>
					{chars.map((ch, i) => {
						const p = prog(f, at + i * 3, 16, ease.out);
						return (
							<tspan key={i} x={W / 2 - width / 2 + (i + 0.5) * (width / chars.length)} fill={`url(#${fill})`} opacity={p * (fill === 'gold-sweep' ? 1 : 1)} dy={0}>
								{ch}
							</tspan>
						);
					})}
				</text>
			))}
		</g>
	);
};

const Dust: React.FC<{f: number; n?: number; burstAt?: number}> = ({f, n = 90, burstAt}) => (
	<g>
		{Array.from({length: n}, (_, i) => {
			const x0 = random(`dx${i}`) * W;
			const y0 = random(`dy${i}`) * H;
			const z = random(`dz${i}`);
			const x = x0 + Math.sin((f + i * 13) / (60 + z * 40)) * 20;
			const y = ((y0 - f * (0.2 + z * 0.6)) % H + H) % H;
			let o = (0.15 + 0.45 * z) * (0.5 + 0.5 * Math.sin(f / 11 + i));
			let bx = 0;
			let by = 0;
			if (burstAt !== undefined && f >= burstAt && i < 40) {
				const t = f - burstAt;
				const a = random(`ba${i}`) * Math.PI * 2;
				const d = t * (3 + random(`bd${i}`) * 9) * Math.exp(-t / 30);
				bx = Math.cos(a) * d - (x - W / 2);
				by = Math.sin(a) * d * 0.35 - (y - 470);
				o = Math.max(0, 1 - t / 40);
			}
			return <circle key={i} cx={x + bx} cy={y + by} r={0.8 + z * 2.2} fill="#ffe3a8" opacity={o} />;
		})}
	</g>
);

const Backdrop: React.FC = () => (
	<>
		<rect width={W} height={H} fill="#06080f" />
		<rect width={W} height={H} fill="url(#brand-bg)" />
	</>
);

const Defs: React.FC = () => (
	<defs>
		<radialGradient id="brand-bg" cx="50%" cy="44%" r="70%">
			<stop offset="0" stopColor="#1b2033" />
			<stop offset="0.5" stopColor="#0c0f1a" />
			<stop offset="1" stopColor="#040509" />
		</radialGradient>
		<radialGradient id="brand-glow">
			<stop offset="0" stopColor="#ffe7b0" stopOpacity="0.9" />
			<stop offset="0.35" stopColor="#f1c56d" stopOpacity="0.35" />
			<stop offset="1" stopColor="#f1c56d" stopOpacity="0" />
		</radialGradient>
		<radialGradient id="brand-key" cx="50%" cy="42%" r="40%">
			<stop offset="0" stopColor="#f1c56d" stopOpacity="0.22" />
			<stop offset="1" stopColor="#f1c56d" stopOpacity="0" />
		</radialGradient>
	</defs>
);

const Hairline: React.FC<{y: number; p: number; gap: number}> = ({y, p, gap}) => (
	<g stroke={GOLD} strokeWidth={1.2} opacity={0.7}>
		<line x1={W / 2 - gap} y1={y} x2={W / 2 - gap - 140 * p} y2={y} />
		<line x1={W / 2 + gap} y1={y} x2={W / 2 + gap + 140 * p} y2={y} />
	</g>
);

// ------------------------------------------------------------------ the cards

export const TitleCard: React.FC<{v: VideoCfg; dur: number; land?: number}> = ({v, dur, land: landAt}) => {
	const f = useCurrentFrame();
	const inP = prog(f, 0, 5, ease.inOut);
	const out = prog(f, dur - 14, 14, ease.inOut);
	// the title lands on the track's downbeat (`hit`), else ~0.7 s in
	const land = landAt ?? 22;
	const flare = f >= land + 8 ? Math.exp(-(f - land - 8) / 9) : 0;
	const push = 1 + 0.03 * prog(f, 0, dur, ease.inOut) + 0.03 * out;
	return (
		<AbsoluteFill style={{opacity: inP * (1 - out)}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<Defs />
				<Backdrop />
				<g transform={`translate(${W / 2},${H / 2}) scale(${push}) translate(${-W / 2},${-H / 2})`}>
					<rect width={W} height={H} fill="url(#brand-key)" opacity={0.7 + 0.6 * flare} />
					<Dust f={f} burstAt={land + 8} />
					<text x={W / 2} y={318} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 24, letterSpacing: '0.45em', fill: GOLD}} opacity={0.85 * prog(f, 4, 20)}>
						{v.kicker}
					</text>
					<Hairline y={360} p={prog(f, 8, 30)} gap={70} />
					<g transform={`translate(${W / 2},360)`} opacity={prog(f, 6, 16)}>
						<path d="M0,-6 L6,0 L0,6 L-6,0 Z" fill={GOLD} />
					</g>
					<GoldTitle text={v.title} f={f} at={Math.max(5, land - 8)} size={140} y={512} />
					{/* anamorphic flare as the title lands */}
					<ellipse cx={W / 2} cy={470} rx={760 * (0.4 + flare)} ry={2 + 2.5 * flare} fill="#fff1cf" opacity={0.6 * flare} />
					<g transform={`translate(${W / 2},606) scale(1.35)`}>
						<Motif kind={v.motif} p={prog(f, land + 6, 40, ease.out)} f={f} />
					</g>
					<text x={W / 2} y={752} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 40, fill: INK, letterSpacing: '0.12em'}} opacity={prog(f, land + 22, 18)}>
						{v.tagline}
					</text>
					<text x={W / 2} y={798} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 26, fill: 'rgba(243,237,226,0.55)'}} opacity={prog(f, land + 28, 18)}>
						{v.taglineEn}
					</text>
					<text x={W / 2} y={884} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.42em', fill: 'rgba(241,197,109,0.75)'}} opacity={prog(f, land + 36, 20)}>
						{`— ${JUNO.credit} · ${JUNO.series} —`}
					</text>
				</g>
			</svg>
		</AbsoluteFill>
	);
};

export const EndCard: React.FC<{v: VideoCfg; dur: number}> = ({v, dur}) => {
	const f = useCurrentFrame();
	const bgIn = prog(f, 0, 24, ease.inOut);
	const black = prog(f, dur - 18, 18, ease.in);
	return (
		<AbsoluteFill>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<Defs />
				<rect width={W} height={H} fill="#05060b" opacity={0.72 * bgIn} />
				<rect width={W} height={H} fill="url(#brand-key)" opacity={bgIn} />
				<Dust f={f + 400} n={70} />
				<g transform={`translate(${W / 2},250)`}>
					<Monogram draw={prog(f, 8, 40, ease.inOut)} size={1} wordmark={JUNO.name} />
				</g>
				<GoldTitle text={v.title} f={f} at={30} size={92} y={470} />
				<g transform={`translate(${W / 2},556) scale(1.1)`}>
					<Motif kind={v.motif} p={prog(f, 44, 40)} f={f} />
				</g>
				<text x={W / 2} y={690} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 46, fill: INK, letterSpacing: '0.1em'}} opacity={prog(f, 62, 18)}>
					{v.question}
				</text>
				<g opacity={prog(f, 78, 20)}>
					<rect x={W / 2 - 330} y={738} width={660} height={56} rx={28} fill="none" stroke={GOLD} strokeOpacity={0.6} />
					<text x={W / 2} y={774} textAnchor="middle" style={{fontFamily: font.sans, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', fill: GOLD}}>
						{JUNO.follow}
					</text>
				</g>
				<text x={W / 2} y={1010} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 18, letterSpacing: '0.06em', fill: 'rgba(243,237,226,0.38)'}} opacity={prog(f, 90, 20)}>
					{`《${v.title}》 · ${JUNO.credit} · ${JUNO.series}　|　${v.sources}`}
				</text>
				<rect width={W} height={H} fill="#000" opacity={black} />
			</svg>
		</AbsoluteFill>
	);
};

