import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, PP, PaperDefs, Grain, KEY} from './kit47';
import {Story, Punch, Stamp, Brand, Title, Orig, SANS, SERIF} from './skin47';
import {seg, ease} from './scenes47';
import {SCENES, LINES, STAMPS, ORIGS, TITLE, END, FINAL_HIT, CARD_Q, SOURCES, SCRIM} from './timeline47';
/* ep47 film: picture only (music muxed after). Film time t; every scene gets its own local time. */
const FPS = 30;
const cl = (v: number) => Math.max(0, Math.min(1, v));

/** the Juno end card in this film's skin: monogram ring + follow pill, over the last frame */
const JMark: React.FC<{draw: number}> = ({draw}) => { const r = 54, c = 2 * Math.PI * r, spark = cl((draw - 0.6) / 0.4);
	return <g>
		<circle r={r} fill="none" stroke={KEY} strokeWidth={2.5} strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, draw * 1.3))} transform="rotate(-90)" />
		<circle r={47} fill="none" stroke={KEY} strokeWidth={1} opacity={0.35 * draw} />
		<text y={22} textAnchor="middle" style={{fontFamily: '"DejaVu Serif", serif', fontStyle: 'italic', fontWeight: 600, fontSize: 70}} fill={KEY} opacity={cl((draw - 0.3) / 0.4)}>J</text>
		<path d="M0,-9 L2.2,-2.2 L9,0 L2.2,2.2 L0,9 L-2.2,2.2 L-9,0 L-2.2,-2.2 Z" fill="#fff4d6" transform={`translate(40,-40) scale(${spark * 1.4}) rotate(${draw * 90})`} />
	</g>; };
const EndCard: React.FC<{u: number}> = ({u}) => { const a = cl(u / 0.6), q = cl((u - 0.5) / 0.6), pill = cl((u - 1.0) / 0.6);
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<rect width={W} height={H} fill={PP.night} opacity={0.86 * a} />
		<g opacity={a}>
			<text x={960} y={360} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 64, letterSpacing: '0.05em'}} fill="#FFF8EA">{TITLE[0]}</text>
			<text x={960} y={446} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 800, fontSize: 52, letterSpacing: '0.08em'}} fill={KEY}>{TITLE[1]}</text>
		</g>
		<g opacity={q}><text x={960 + 18} y={590} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 70}} fill={KEY} stroke="rgba(0,0,0,0.35)" strokeWidth={5} paintOrder="stroke">{CARD_Q[0]}</text>
			<text x={960} y={652} textAnchor="middle" style={{fontFamily: SANS, fontSize: 32}} fill="#FFF8EA" opacity={0.88}>{CARD_Q[1]}</text></g>
		<g opacity={pill}>
			<g transform="translate(770,928) scale(0.56)"><JMark draw={cl((u - 1.0) / 1.1)} /></g>
			<rect x={800} y={899} width={400} height={58} rx={29} fill="rgba(255,217,138,0.10)" stroke={KEY} strokeOpacity={0.75} strokeWidth={2} />
			<text x={1000} y={938} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em'}} fill={KEY}>关注 Juno · 一起看懂世界</text>
		</g>
		<text x={960} y={1030} textAnchor="middle" style={{fontFamily: SANS, fontSize: 22}} fill="#FFF8EA" opacity={0.75 * pill}>{SOURCES}</text>
	</svg>; };

/** subtitles: the current line types on in 0.35 s; 'p' lines are punches (centred); story lines of the same block stack */
const subsAt = (t: number) => {
	const i = LINES.findIndex((l) => t >= l[0] && t < l[1]); if (i < 0) return null;
	const [a, , s, kind, block] = LINES[i], len = s.replace(/[[\]]/g, '').length, n = Math.ceil(len * (a < 0.05 ? 0.35 + 0.65 * seg(t, 0, 0.35) : seg(t, a, a + 0.35)));
	if (kind === 'p') return {punch: {s, n}, rows: []};
	const prev = block ? LINES.slice(0, i).filter((l) => l[4] === block && l[3] !== 'p').slice(-1) : [];
	return {rows: [...prev.map((l) => ({s: l[2], o: 0.55})), {s, n}]};
};
const Film: React.FC<{t: number}> = ({t}) => {
	const sc = SCENES.find((s) => t >= s.a && t < s.b) ?? SCENES[SCENES.length - 1];
	const C = sc.C, prev = SCENES[SCENES.indexOf(sc) - 1];
	/* 'F' = a 0.3 s cross-dissolve from the previous scene (its own motion continues under it) */
	const w = sc.wipe ? seg(t, sc.a, sc.a + 0.3) : 1;
	return <g>
		{w < 1 && prev && <prev.C u={t - prev.a} d={prev.b - prev.a} tag={prev.tag} />}
		<g opacity={sc.wipe === 'F' ? ease(w) : 1}><C u={t - sc.a} d={sc.b - sc.a} tag={sc.tag} /></g>
	</g>;
};
export const Frame47: React.FC<{t: number}> = ({t}) => {
	const sub = t < END ? subsAt(t) : null, st = STAMPS.find(([a, b]) => t >= a && t < b), og = ORIGS.find(([a, b]) => t >= a && t < b);
	const titleOn = t >= SCENES[1].a && t < SCENES[1].b, tu = t - SCENES[1].a;
	const scrim = (SCRIM.find(([a, b]) => t >= a && t < b) ?? [0, 0, '#1B1830', 0.34]).slice(2) as [string, number];
	return <AbsoluteFill style={{background: PP.ivory}}>
		<svg width={W} height={H} style={{position: 'absolute'}}><PaperDefs /><Film t={t} /><Grain seed={3 + (Math.floor(t * 30) % 6)} /></svg>
		{titleOn && <Title a={TITLE[0]} b={TITLE[1]} o={cl(tu / 0.15)} top={680} />}
		{sub && sub.rows.length > 0 && <Story rows={sub.rows} tint={scrim[0]} to={scrim[1]} />}
		{sub && sub.punch && <Punch tint={scrim[0]} s={sub.punch.s} n={sub.punch.n} top={sub.punch.s.length > 14 ? 780 : 800} size={sub.punch.s.length > 14 ? 66 : 78} />}
		{og && sub && sub.rows.length > 0 && <Orig s={og[2]} top={132 + 87 * sub.rows.length + 18} />}
		{t < FINAL_HIT && <Brand />}
		{st && <Stamp y={st[2]} src={st[3]} l3={st[4]} />}
		{t >= FINAL_HIT && <EndCard u={t - FINAL_HIT} />}
	</AbsoluteFill>;
};
const Comp: React.FC = () => { const f = useCurrentFrame(); return <Frame47 t={f / FPS} />; };
registerRoot(() => <Composition id="FILM47" component={Comp} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />);
