import React from 'react';
import {P, CU, KEY, ZODIAC, Z} from './kit45';
/* ep45 skin "铜版 · 午时": series layout (story top-left, stamp top-right, counter bottom-left, brand mark),
   reskinned: plain heavy sans story text, key words in water-jade (no glow), the stamp as an engraved plate caption
   (double rule), the counter as the water clock's twelve-hour dial. No red, no serif, no seal chip. */
export const SANS = "'Noto Sans CJK SC','Noto Sans CJK',sans-serif", NUM = "'DejaVu Sans','Noto Sans CJK SC',sans-serif";
export const INK = '#F3F6F2';
const SH = '0 0 2px rgba(14,20,24,0.95), 0 2px 6px rgba(14,20,24,0.75), 0 3px 22px rgba(14,20,24,0.6)';
const fx: React.CSSProperties = {position: 'absolute', fontFamily: SANS, color: INK, textShadow: SH};

/** "[key]" → water-jade spans; typed reveal of the first n characters; pull = pull back a final ？/。 for centring */
export const Marked: React.FC<{s: string; n?: number; pull?: boolean}> = ({s, n = 1e9, pull}) => {
	let left = n; const parts = s.split(/(\[[^\]]+\])/).filter(Boolean), out: React.ReactNode[] = [];
	parts.forEach((p, i) => {
		const key = p.startsWith('['), txt = key ? p.slice(1, -1) : p, vis = txt.slice(0, Math.max(0, left)), hid = txt.slice(vis.length); left -= txt.length;
		const st: React.CSSProperties = key ? {color: KEY} : {};
		if (pull && i === parts.length - 1 && !key && /[？。！，]$/.test(vis) && hid === '') out.push(<span key={i} style={st}>{vis.slice(0, -1)}<span style={{marginRight: '-0.5em'}}>{vis.slice(-1)}</span></span>);
		else out.push(<span key={i} style={st}>{vis}<span style={{opacity: 0}}>{hid}</span></span>);
	});
	return <>{out}</>;
};
export type SubRow = {s: string; n?: number; o?: number};
export const Story: React.FC<{rows: SubRow[]}> = ({rows}) => rows.length === 0 ? null : <>
	<div style={{position: 'absolute', borderRadius: '50%', filter: 'blur(40px)', left: 40, top: 70, width: 1080, height: 120 + 88 * rows.length, background: 'rgba(16,24,28,0.34)'}} />
	<div style={{...fx, left: 150, top: 132, fontWeight: 900, fontSize: 58, lineHeight: 1.5, letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>{rows.map((r, i) => <div key={i} style={{opacity: r.o ?? 1}}><Marked s={r.s} n={r.n} /></div>)}</div>
</>;
export const Punch: React.FC<{s: string; o?: number; n?: number; top?: number}> = ({s, o = 1, n, top = 470}) => <>
	<div style={{position: 'absolute', left: 420, right: 420, top: top - 30, height: 160, borderRadius: '50%', filter: 'blur(40px)', background: 'rgba(14,20,24,0.42)', opacity: o}} />
	<div style={{...fx, left: 0, right: 0, top, textAlign: 'center', fontWeight: 900, fontSize: 76, letterSpacing: '0.06em', opacity: o}}><Marked s={s} n={n} pull /></div></>;

/** stamp (top-right): an engraved plate caption — year in figures, place, a note line; double rule on the right */
export const Stamp: React.FC<{y: string; place?: string; l2?: string; l3?: string; o?: number}> = ({y, place, l2, l3, o = 1}) =>
	<div style={{...fx, top: 92, right: 60, textAlign: 'right', paddingRight: 24, opacity: o}}>
		<div style={{position: 'absolute', right: 0, top: 6, bottom: 6, width: 9, borderLeft: `2px solid ${P.line}`, borderRight: `2px solid ${P.line}`, opacity: 0.85}} />
		<div style={{fontWeight: 900, fontSize: 54, lineHeight: 1.22}}><span style={{fontFamily: NUM, fontWeight: 700, letterSpacing: '0.01em'}}>{y}</span>{place && <span> · {place}</span>}</div>
		{l2 && <div style={{fontWeight: 700, fontSize: 38, lineHeight: 1.45, marginTop: 2}}>{l2}</div>}
		{l3 && <div style={{fontWeight: 500, fontSize: 32, lineHeight: 1.45, opacity: 0.85}}>{l3}</div>}
	</div>;
export const Brand: React.FC = () => <div style={{...fx, top: 34, right: 60, fontSize: 28, letterSpacing: '0.06em', fontWeight: 700, opacity: 0.92}}><span style={{color: KEY}}>◆</span> Juno · VIBE知识大赏</div>;

/* ---------- the counter: the water clock's dial (子 at the top, 午 = you at the bottom) ---------- */
export type DialState = 'you' | 'lit' | 'dark' | 'ghost';
export const dialFor = (back: Set<Z>, youLit = true): Record<Z, DialState> => Object.fromEntries(ZODIAC.map((z) => [z, z === '马' ? (youLit ? 'you' : 'dark') : back.has(z) ? 'lit' : 'ghost'])) as Record<Z, DialState>;
const Ring: React.FC<{st: Record<Z, DialState>; r?: number; homeOnly?: boolean; hand?: number}> = ({st, r = 50, homeOnly, hand = 180}) => {
	const S = r * 2 + 36;
	return <svg width={S} height={S} viewBox={`${-S / 2} ${-S / 2} ${S} ${S}`} style={{overflow: 'visible', filter: 'drop-shadow(0 2px 8px rgba(10,16,20,0.7))'}}>
		<defs><radialGradient id={`dy${r}`}><stop offset="0" stopColor={CU.core} /><stop offset="0.5" stopColor={CU.mid} /><stop offset="1" stopColor={CU.halo} stopOpacity="0" /></radialGradient></defs>
		<circle r={r} fill="rgba(20,30,36,0.55)" stroke={P.line} strokeWidth={2} />
		<circle r={r - 10} fill="none" stroke={P.line} strokeWidth={1} opacity={0.5} />
		{ZODIAC.map((z, i) => { const a = (i / 12) * Math.PI * 2, x = Math.sin(a) * r, y = -Math.cos(a) * r, s = homeOnly && z !== '马' ? 'dark' : st[z];
			return <g key={z}>
				{s === 'you' && <circle cx={x} cy={y} r={16} fill={`url(#dy${r})`} />}
				<circle cx={x} cy={y} r={s === 'you' ? 8.5 : 7} fill={s === 'you' ? CU.core : s === 'lit' ? INK : 'rgba(20,30,36,0.9)'} stroke={s === 'ghost' ? P.line : s === 'dark' ? P.soft : 'none'} strokeWidth={1.8} strokeDasharray={s === 'ghost' ? '3 3' : undefined} />
			</g>; })}
		<line x1={0} y1={0} x2={Math.sin(hand * Math.PI / 180) * (r - 18)} y2={-Math.cos(hand * Math.PI / 180) * (r - 18)} stroke={P.line} strokeWidth={2.5} strokeLinecap="round" />
		<circle r={4} fill={P.line} />
	</svg>;
};
export const DialRow: React.FC<{label: string; n: React.ReactNode; of?: string; dim?: boolean}> = ({label, n, of = '/12', dim}) =>
	<div style={{display: 'flex', alignItems: 'flex-end', gap: 8, whiteSpace: 'nowrap', opacity: dim ? 0.55 : 1}}>
		<span style={{fontSize: 32, fontWeight: 900, lineHeight: 1, marginBottom: 8}}>{label}</span>
		<span style={{fontFamily: NUM, fontSize: 76, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.01em'}}>{n}</span>
		<span style={{fontFamily: NUM, fontSize: 34, fontWeight: 700, lineHeight: 1, marginBottom: 8, opacity: 0.85}}>{of}</span>
	</div>;
/** bottom-left counter: the dial + one or two rows */
export const Dial: React.FC<{st: Record<Z, DialState>; rows: {label: string; n: React.ReactNode; dim?: boolean; home?: boolean}[]; hand?: number; o?: number}> = ({st, rows, hand, o = 1}) =>
	<div style={{...fx, left: 132, bottom: 56, display: 'flex', alignItems: 'flex-end', gap: 20, opacity: o}}>
		<Ring st={st} hand={hand} />
		<div style={{display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14}}>{rows.map((r, i) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12}}>
			{r.home && <span style={{display: 'inline-block', width: 14, height: 14, borderRadius: 7, background: CU.core, boxShadow: `0 0 12px ${CU.halo}, 0 0 4px ${CU.mid}`}} />}
			<DialRow label={r.label} n={r.n} dim={r.dim} /></div>)}</div>
	</div>;
