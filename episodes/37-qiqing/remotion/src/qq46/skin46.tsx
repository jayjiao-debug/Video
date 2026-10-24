import React from 'react';
import {C, clamp, seg, easeOut, lerp} from './kit46';
/* ep46 skin: the series layout (story top-left, stamp top-right, counter bottom-left, brand mark), reskinned for
   "岱庙 · 同一个机位": heavy white sans story text, key words in glazed-tile yellow (no glow), the stamp as a small
   stone tablet caption, the counter as tree rings. No red chips, no serif furniture (title/end card excepted). */
export const SANS = "'Noto Sans CJK SC','Noto Sans CJK',sans-serif", SERIF = "'Noto Serif CJK SC','Noto Serif CJK',serif", NUM = "'DejaVu Sans','Noto Sans CJK SC',sans-serif";
export const INK = '#FFF8EC', KEY = '#FFD36E';
const SH = '0 0 2px rgba(20,14,8,0.95), 0 2px 6px rgba(20,14,8,0.75), 0 3px 22px rgba(20,14,8,0.6)';
const fx: React.CSSProperties = {position: 'absolute', fontFamily: SANS, color: INK, textShadow: SH};

/** "[key]" → yellow spans; typed reveal of the first n characters; pull = pull back a final ？/。 for centring */
export const Marked: React.FC<{s: string; n?: number; pull?: boolean}> = ({s, n = 1e9, pull}) => {
	let left = n; const parts = s.split(/(\[[^\]]+\])/).filter(Boolean), out: React.ReactNode[] = [];
	parts.forEach((p, i) => {
		const key = p.startsWith('['), txt = key ? p.slice(1, -1) : p, vis = txt.slice(0, Math.max(0, left)), hid = txt.slice(vis.length); left -= txt.length;
		const st: React.CSSProperties = key ? {color: KEY} : {};
		if (pull && i === parts.length - 1 && /[？。！，]$/.test(vis) && hid === '') out.push(<span key={i} style={st}>{vis.slice(0, -1)}<span style={{marginRight: '-0.5em'}}>{vis.slice(-1)}</span></span>);
		else out.push(<span key={i} style={st}>{vis}<span style={{opacity: 0}}>{hid}</span></span>);
	});
	return <>{out}</>;
};
export const plainLen = (s: string) => s.replace(/[[\]]/g, '').length;
export type Row = {s: string; n?: number; o?: number};
export const Story: React.FC<{rows: Row[]; o?: number}> = ({rows, o = 1}) => rows.length === 0 ? null : <div style={{opacity: o}}>
	<div style={{position: 'absolute', borderRadius: '50%', filter: 'blur(42px)', left: 40, top: 70, width: 1120, height: 120 + 88 * rows.length, background: 'rgba(26,18,10,0.34)'}} />
	<div style={{...fx, left: 150, top: 132, fontWeight: 900, fontSize: 58, lineHeight: 1.5, letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>{rows.map((r, i) => <div key={i} style={{opacity: r.o ?? 1}}><Marked s={r.s} n={r.n} /></div>)}</div>
</div>;
export const Punch: React.FC<{s: string; o?: number; n?: number; top?: number; size?: number}> = ({s, o = 1, n, top = 440, size = 78}) => <>
	<div style={{position: 'absolute', left: 300, right: 300, top: top - 34, height: size * 2.1, borderRadius: '50%', filter: 'blur(42px)', background: 'rgba(22,16,10,0.45)', opacity: o}} />
	<div style={{...fx, left: 0, right: 0, top, textAlign: 'center', fontWeight: 900, fontSize: size, letterSpacing: '0.06em', opacity: o, whiteSpace: 'nowrap'}}><Marked s={s} n={n} pull /></div></>;

/** stamp (top-right): year in figures, place, a note line; a stone-coloured bar on the right */
export const Stamp: React.FC<{y: string; place?: string; l2?: string; o?: number}> = ({y, place, l2, o = 1}) =>
	<div style={{...fx, top: 92, right: 60, textAlign: 'right', paddingRight: 26, opacity: o}}>
		<div style={{position: 'absolute', right: 0, top: 8, bottom: 8, width: 8, borderRadius: 3, background: '#D3CEC2', boxShadow: '0 0 6px rgba(0,0,0,0.5)'}} />
		<div style={{fontWeight: 900, fontSize: 52, lineHeight: 1.22}}><span style={{fontFamily: NUM, fontWeight: 700}}>{y}</span>{place && <span> · {place}</span>}</div>
		{l2 && <div style={{fontWeight: 700, fontSize: 34, lineHeight: 1.5, marginTop: 2, opacity: 0.92}}>{l2}</div>}
	</div>;
export const Brand: React.FC<{o?: number}> = ({o = 1}) => <div style={{...fx, top: 34, right: 60, fontSize: 28, letterSpacing: '0.06em', fontWeight: 700, opacity: 0.92 * o}}><span style={{color: KEY}}>◆</span> Juno · VIBE知识大赏</div>;
/** small source note under the story (e.g. 据齐鲁晚报 2015) */
export const Src: React.FC<{s: string; top: number; o?: number}> = ({s, top, o = 1}) => <div style={{...fx, left: 154, top, fontSize: 30, fontWeight: 500, opacity: 0.85 * o}}>{s}</div>;

/* ---------- the counter: tree rings ---------- */
export const Rings: React.FC<{n: number; dashed?: boolean; size?: number}> = ({n, dashed, size = 96}) => {
	const R = size / 2 - 4, k = clamp(Math.log10(Math.max(1, n + 1)) / Math.log10(2200));
	const rings = Math.max(1, Math.round(2 + k * 10));
	return <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{overflow: 'visible', filter: 'drop-shadow(0 2px 8px rgba(20,14,8,0.7))'}}>
		<circle r={R} fill="rgba(70,52,36,0.55)" stroke={C.barkLit} strokeWidth={2.5} strokeDasharray={dashed ? '6 5' : undefined} />
		{Array.from({length: rings}, (_, i) => <circle key={i} r={R * (i + 1) / (rings + 1)} fill="none" stroke={i === rings - 1 ? C.glow : '#D9C4A6'} strokeWidth={i === rings - 1 ? 2.6 : 1.4} opacity={i === rings - 1 ? 0.95 : 0.6} strokeDasharray={dashed ? '4 4' : undefined} />)}
		<circle r={3} fill={C.glowCore} />
	</svg>;
};
export const Counter: React.FC<{n: number | string; label?: string; o?: number; dashed?: boolean; note?: string; noteO?: number}> = ({n, label = '相传 · 你', o = 1, dashed = true, note, noteO = 1}) =>
	<div style={{...fx, left: 132, bottom: 52, display: 'flex', alignItems: 'flex-end', gap: 18, opacity: o}}>
		<Rings n={typeof n === 'number' ? n : 2135} dashed={dashed} />
		<div style={{display: 'flex', flexDirection: 'column', marginBottom: 6}}>
			<div style={{display: 'flex', alignItems: 'flex-end', gap: 10, whiteSpace: 'nowrap'}}>
				<span style={{fontSize: 32, fontWeight: 900, lineHeight: 1, marginBottom: 10}}>{label}</span>
				<span style={{fontFamily: NUM, fontSize: 80, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.01em'}}>{n}</span>
				<span style={{fontSize: 36, fontWeight: 900, lineHeight: 1, marginBottom: 10}}>岁</span>
			</div>
			{note && <div style={{fontSize: 24, fontWeight: 500, opacity: 0.8 * noteO, marginTop: 6}}>{note}</div>}
		</div>
	</div>;

/* ---------- the six 封禅 emperors: jade discs (玉璧) in a row ---------- */
export type SealState = 'off' | 'before' | 'legend' | 'lit' | 'ghost';
export const SEALS: {name: string; year: string}[] = [
	{name: '秦始皇', year: '前219'}, {name: '汉武帝', year: '前110'}, {name: '光武帝', year: '56'}, {name: '唐高宗', year: '666'}, {name: '唐玄宗', year: '725'}, {name: '宋真宗', year: '1008'},
];
export const SealRow: React.FC<{st: SealState[]; o?: number; seventh?: number; pop?: number[]}> = ({st, o = 1, seventh = 0, pop = []}) =>
	<div style={{...fx, left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', gap: 36, opacity: o}}>
		{[...SEALS, {name: '第7位', year: '?'}].map((s, i) => { const state: SealState = i < 6 ? st[i] : (seventh > 0 ? 'ghost' : 'off'); if (state === 'off') return <div key={i} style={{width: 150}} />;
			const lit = state === 'lit', k = pop[i] ?? 1, dim = state === 'before' ? 0.5 : 1;
			return <div key={i} style={{width: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: (i === 6 ? seventh : 1) * dim, transform: `scale(${lerp(0.6, 1, easeOut(k))})`}}>
				<svg width={120} height={120} viewBox="-60 -60 120 120" style={{overflow: 'visible', filter: 'drop-shadow(0 3px 10px rgba(20,14,8,0.7))'}}>
					<defs><radialGradient id={`jd${i}`} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#D8F0DF" /><stop offset="0.5" stopColor={C.jade} /><stop offset="1" stopColor={C.jadeD} /></radialGradient></defs>
					<circle r={52} fill={lit ? `url(#jd${i})` : 'rgba(60,52,44,0.55)'} stroke={lit ? '#E8F6EC' : '#D3CEC2'} strokeWidth={3} strokeDasharray={state === 'legend' || state === 'ghost' ? '7 6' : undefined} />
					<circle r={16} fill="rgba(30,24,18,0.75)" stroke={lit ? '#E8F6EC' : '#D3CEC2'} strokeWidth={2} />
					{lit && Array.from({length: 10}, (_, j) => { const a = j / 10 * Math.PI * 2; return <circle key={j} cx={Math.cos(a) * 34} cy={Math.sin(a) * 34} r={3.4} fill="#F0FAF2" opacity={0.7} />; })}
				</svg>
				<div style={{fontSize: 34, fontWeight: 900, marginTop: 8}}>{s.name}</div>
				<div style={{fontFamily: NUM, fontSize: 28, fontWeight: 700, opacity: 0.9}}>{s.year}</div>
			</div>; })}
	</div>;

/* ---------- title card: the title slams on the first crash; the counter rewinds under it ---------- */
export const TITLE1 = '汉柏的孩子，', TITLE2 = '去守汉武帝';
export const TitleCard: React.FC<{t: number; t0: number; t1: number; num: number}> = ({t, t0, t1, num}) => {
	const u = seg(t, t0, t0 + 0.22), out = seg(t, t1 - 0.35, t1), sc = lerp(1.35, 1, easeOut(u)) + 0.025 * Math.sin(seg(t, t0 + 0.22, t0 + 0.9) * Math.PI * 3) * (1 - seg(t, t0 + 0.22, t0 + 0.9));
	return <div style={{position: 'absolute', inset: 0, opacity: (u > 0 ? 1 : 0) * (1 - out)}}>
		<div style={{position: 'absolute', left: 260, right: 260, top: 300, height: 380, borderRadius: '50%', filter: 'blur(60px)', background: 'rgba(22,16,10,0.5)'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', transform: `scale(${sc})`, fontFamily: SERIF, fontWeight: 900, color: INK, textShadow: `0 0 18px rgba(246,231,160,0.55), ${SH}`}}>
			<div style={{fontSize: 108, letterSpacing: '0.08em'}}>{TITLE1.slice(0, -1)}<span style={{marginRight: '-0.5em'}}>，</span></div>
			<div style={{fontSize: 124, letterSpacing: '0.1em', color: KEY}}>{TITLE2}</div>
		</div>
		<div style={{...fx, left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: NUM, fontWeight: 700, fontSize: 64, opacity: 0.9}}>相传 · 你 {Math.round(num)} 岁</div>
	</div>;
};

/* ---------- Juno end card ---------- */
export const EndCard: React.FC<{t: number; t0: number}> = ({t, t0}) => {
	const a = seg(t, t0, t0 + 0.5), q = seg(t, t0 + 0.9, t0 + 1.4), pill = seg(t, t0 + 1.5, t0 + 1.85), src = seg(t, t0 + 2.0, t0 + 2.6);
	return <div style={{position: 'absolute', inset: 0}}>
		<div style={{position: 'absolute', left: 220, right: 220, top: 170, height: 640, borderRadius: '50%', filter: 'blur(70px)', background: 'rgba(22,16,10,0.42)', opacity: a}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 180, display: 'flex', justifyContent: 'center', opacity: a}}>
			<div style={{width: 112, height: 112, borderRadius: 56, border: `4px solid ${KEY}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: 70, color: KEY, textShadow: SH, boxShadow: '0 0 30px rgba(255,211,110,0.35)'}}>J</div>
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: 84, color: KEY, letterSpacing: '0.08em', textShadow: SH, opacity: a, transform: `translateY(${16 * (1 - easeOut(a))}px)`}}>
			{TITLE1.slice(0, -1)}<span>，</span>{TITLE2}</div>
		<div style={{...fx, left: 0, right: 0, top: 460, textAlign: 'center', fontWeight: 900, fontSize: 64, opacity: q}}><Marked s="它真是汉武帝种的吗？[你信吗]？" pull /></div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center', opacity: pill, transform: `scale(${lerp(0.8, 1, easeOut(pill))})`}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 34px 12px 16px', borderRadius: 40, border: `2px solid ${KEY}`, background: 'rgba(28,20,12,0.6)', fontFamily: SANS, fontWeight: 700, fontSize: 32, color: '#FFF3D6'}}>
				<span style={{width: 42, height: 42, borderRadius: 21, background: KEY, color: '#2A1A08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900}}>+</span>关注 Juno · 一起看懂世界</div>
		</div>
		<div style={{...fx, left: 0, right: 0, top: 940, textAlign: 'center', fontSize: 24, fontWeight: 500, opacity: 0.85 * src, lineHeight: 1.5}}>
			资料：《汉书·武帝纪》《水经注》卷二十四 · 故宫博物院《紫禁城》2022年第4期 · 央广网 2026 · 新京报 2024 · 新华社 2025 · 齐鲁晚报 2015 · UNESCO</div>
	</div>;
};
