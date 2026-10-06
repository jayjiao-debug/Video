import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Monogram, QubitMotif} from '../../src/brand/Brand';
import {C, Chapter, Corner, Defs, FPS, Finish, Graticule, H, SANS, SERIF, Status, Subtitle, TLX, W, clamp, ez, pr} from './kit';
import {SCENES} from './scenes';

/**
 * 《量子计算机不是同时算》 (ep12, voice-over) — the whole film as one composition. The scope frame stays put; the
 * scenes inside it change with the VO lines (persistence decay between layouts, 0.27 s), the title lands on the
 * hardest drop (14.24 s), "不是。" on the second drop, then the Juno end card.
 * Audio (VO + edited BGM, mastered) is muxed after the render: episodes/qvo/audio/master.wav.
 */

export const QVO_FRAMES = TLX.frames;
const DECAY = 0.18;

const EndCard: React.FC<{T: number}> = ({T}) => {
	const a = TLX.endCard;
	const t = T - a;
	const f = Math.round(t * FPS);
	const gold = C.gold;
	const title = '《量子计算机不是同时算》';
	const size = 92;
	const width = [...title].length * size;
	const black = pr(T, TLX.length - 0.6, 0.6, ez.in);
	return (
		<g>
			<rect width={W} height={H} fill={C.screen} />
			<g opacity={0.2}>
				<Graticule kind="full" />
			</g>
			<ellipse cx={W / 2} cy={420} rx={760} ry={300} fill="url(#brand-glow)" opacity={0.22} />
			<g transform={`translate(${W / 2},250)`}>
				<Monogram draw={0.35 + 0.65 * pr(T, a, 0.6, ez.io)} size={1} wordmark="Juno" />
			</g>
			<defs>
				<linearGradient id="qvo-gold" x1="0" y1={470 - size * 0.8} x2="0" y2={470 + size * 0.2} gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#FFF3CF" />
					<stop offset="0.45" stopColor="#F3CD7A" />
					<stop offset="0.7" stopColor="#C99140" />
					<stop offset="1" stopColor="#8A5A22" />
				</linearGradient>
			</defs>
			<text y={470} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: size}}>
				{[...title].map((ch, i) => (
					<tspan key={i} x={W / 2 - width / 2 + (i + 0.5) * size} fill="url(#qvo-gold)" opacity={0.25 + 0.75 * pr(T, a + 0.05 + i * 0.04, 0.3)}>
						{ch}
					</tspan>
				))}
			</text>
			<g transform={`translate(${W / 2},572) scale(1.1)`}>
				<QubitMotif p={pr(T, a + 0.7, 1.1)} f={f} gold={gold} />
			</g>
			<text x={W / 2} y={712} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 52, letterSpacing: 4}} fill={C.ink} opacity={pr(T, a + 1.0, 0.5)}>
				你身边谁还以为，量子计算机能同时算所有答案？
			</text>
			<g opacity={pr(T, a + 1.4, 0.5)}>
				<rect x={W / 2 - 480} y={752} width={960} height={72} rx={36} fill="none" stroke={gold} strokeOpacity={0.7} strokeWidth={2} />
				<text x={W / 2} y={801} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 500, fontSize: 40, letterSpacing: 6}} fill={gold}>
					关注 Juno · 每期一个反直觉的知识
				</text>
			</g>
			<text x={W / 2} y={1010} textAnchor="middle" style={{fontFamily: SANS, fontSize: 20, letterSpacing: 1}} fill="rgba(243,237,226,0.45)" opacity={pr(T, a + 1.6, 0.6)}>
				《量子计算机不是同时算》 · VIBE知识大赏　|　参考 · Google Quantum AI (2024) · Google Research (2026) · Caltech (2026) · Gidney (2025) · Shor (1994)
			</text>
			<text x={W / 2} y={1040} textAnchor="middle" style={{fontFamily: SANS, fontSize: 20, letterSpacing: 1}} fill="rgba(243,237,226,0.45)" opacity={pr(T, a + 1.6, 0.6)}>
				NIST (2024) · Aaronson, SciAm (2008) · Fermilab SQMS · IBM Quantum · Bose · NASA/ESA · Stanford CS109
			</text>
			<rect width={W} height={H} fill="#000" opacity={black} />
		</g>
	);
};

export const QuantumVO: React.FC = () => {
	const f = useCurrentFrame();
	const T = f / FPS;
	const inCard = T >= TLX.endCard;
	// the current scene and the one decaying out of view
	const cur = SCENES.find((s) => T >= s.a && T < s.b) ?? SCENES[SCENES.length - 1];
	const prev = SCENES.find((s) => s !== cur && T >= s.b && T < s.b + DECAY);
	const chapterSince = (() => {
		let since = 0;
		let label = '';
		for (const s of SCENES) {
			if (s.a > T) break;
			if (s.chapter !== label) {
				label = s.chapter;
				since = s.a;
			}
		}
		return since;
	})();
	const layer = (s: (typeof SCENES)[number], o: number) => {
		const cam = s.cam ? s.cam(T) : {s: 1, x: 960, y: 450};
		return (
			<g key={s.name} opacity={o} transform={`translate(${cam.x},${cam.y}) scale(${cam.s}) translate(${-cam.x},${-cam.y})`}>
				{s.draw(T, s)}
			</g>
		);
	};
	const titleHide = T >= TLX.drop1 && T < TLX.lines.find((l) => l.id === 's1')!.from;
	return (
		<AbsoluteFill style={{background: C.screen}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<Defs f={f} />
				<rect width={W} height={H} fill="url(#scrGlow)" />
				{inCard ? (
					<EndCard T={T} />
				) : (
					<>
						<g clipPath="url(#scr)">
							<Graticule kind={cur.grat} o={cur.gratO ?? 1} pulse={Math.exp(-Math.abs(T - TLX.drop1) * 10) + Math.exp(-Math.abs(T - TLX.drop2) * 10)} />
							{prev ? layer(prev, clamp(1 - (T - prev.b) / DECAY) ** 2) : null}
							{layer(cur, 1)}
						</g>
						{cur.chapter ? <Chapter text={cur.chapter} T={T} since={chapterSince} /> : null}
						<Status text={cur.status} />
						<Corner o={titleHide ? 0 : 1} />
					</>
				)}
				<Finish f={f} />
			</svg>
			{inCard ? null : <Subtitle T={T} />}
		</AbsoluteFill>
	);
};

