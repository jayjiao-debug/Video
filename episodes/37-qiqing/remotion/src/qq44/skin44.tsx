import React from 'react';
/* ep44 episode skin (owner note 2): same layout as look A, reskinned for "you are Einstein's brain".
   Key words in the brain's rose-gold, a modern sans for the story text, lab-record mono years in the stamp,
   and the counter as a specimen label. No red anywhere. */
export const SANS = "'Noto Sans CJK SC','Noto Sans CJK',sans-serif", MONO = "'DejaVu Sans Mono',monospace", FIG = "'DejaVu Sans','Noto Sans CJK SC',sans-serif";
export const ROSE = '#FFB291', ROSE_D = '#C9775E', INK = '#F4EEE4';
const SH = '0 0 2px rgba(10,8,8,0.95), 0 2px 6px rgba(10,8,8,0.7), 0 3px 22px rgba(10,8,8,0.55)';
const KEY_SH = '0 0 2px rgba(10,8,8,0.95), 0 2px 6px rgba(10,8,8,0.7), 0 0 18px rgba(255,140,105,0.55)';
const fx: React.CSSProperties = {position: 'absolute', fontFamily: SANS, color: INK, textShadow: SH};

/** "[key]" markup → spans, revealing only the first n characters (typed reveal) */
export const Marked: React.FC<{s: string; n?: number; pull?: boolean}> = ({s, n = 1e9, pull}) => {
	let left = n; const out: React.ReactNode[] = [];
	s.split(/(\[[^\]]+\])/).filter(Boolean).forEach((p, i) => {
		const key = p.startsWith('['), txt = key ? p.slice(1, -1) : p, vis = txt.slice(0, Math.max(0, left)), hid = txt.slice(vis.length); left -= txt.length;
		const isLast = i === s.split(/(\[[^\]]+\])/).filter(Boolean).length - 1;
		const st: React.CSSProperties = key ? {color: ROSE, textShadow: KEY_SH} : {};
		if (pull && isLast && !key && /[？。！]$/.test(vis) && hid === '') out.push(<span key={i} style={st}>{vis.slice(0, -1)}<span style={{marginRight: '-0.5em'}}>{vis.slice(-1)}</span></span>);
		else out.push(<span key={i} style={st}>{vis}<span style={{opacity: 0}}>{hid}</span></span>);
	});
	return <>{out}</>;
};
export type SubRow = {s: string; n?: number; o?: number};
/** an odometer number: v may be fractional while it rolls */
export const Odo: React.FC<{v: number; size: number; blur?: number}> = ({v, size, blur = 0}) => {
	const a = Math.floor(v + 1e-6), f = v - a, lh = size * 1.0;
	return <span style={{display: 'inline-block', position: 'relative', height: lh, overflow: 'hidden', verticalAlign: 'bottom', minWidth: `${String(Math.max(a, a + 1)).length * 0.62}em`, textAlign: 'center'}}>
		<span style={{display: 'block', transform: `translateY(${-f * lh}px)`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>
			<span style={{display: 'block', height: lh, lineHeight: `${lh}px`}}>{Math.max(0, a)}</span><span style={{display: 'block', height: lh, lineHeight: `${lh}px`}}>{Math.max(0, a + 1)}</span></span></span>;
};
/** the counter (bottom-left): no box, just calm text over the picture; era tag optional */
export const Counter: React.FC<{era?: string; v: number; blur?: number; o?: number}> = ({era, v, blur = 0, o = 1}) =>
	<div style={{...fx, left: 150, bottom: 58, display: 'flex', alignItems: 'flex-end', gap: 10, whiteSpace: 'nowrap', opacity: o, textShadow: '0 0 2px rgba(10,8,8,0.9), 0 2px 8px rgba(10,8,8,0.75), 0 0 26px rgba(10,8,8,0.55)'}}>
		{era && <span style={{fontSize: 26, fontWeight: 700, opacity: 0.8, marginBottom: 8, marginRight: 6, letterSpacing: '0.08em'}}>{era}</span>}
		<span style={{fontSize: 30, fontWeight: 700, marginBottom: 6}}>你</span>
		<span style={{fontFamily: FIG, fontSize: 62, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}><Odo v={v} size={62} blur={blur} /></span>
		<span style={{fontSize: 30, fontWeight: 700, marginBottom: 6}}>岁</span>
	</div>;
/** stamp (top-right): ONE line, year in lab-record mono, place in sans, rose-gold rule */
export const Stamp: React.FC<{y: string; place?: string; o?: number}> = ({y, place, o = 1}) =>
	<div style={{...fx, top: 60, right: 60, textAlign: 'right', paddingRight: 20, borderRight: `4px solid ${ROSE}`, opacity: o, fontWeight: 900, fontSize: 50, lineHeight: 1.2, whiteSpace: 'nowrap'}}>
		<span style={{fontFamily: MONO, fontWeight: 700, letterSpacing: '-0.02em'}}>{y}</span>{place && <span> · {place}</span>}</div>;
/** the brand as a small round seal, bottom-right, low opacity */
export const Seal: React.FC = () => <div style={{position: 'absolute', right: 56, bottom: 52, width: 54, height: 54, borderRadius: '50%', border: `2.5px solid ${INK}`, opacity: 0.36, transform: 'rotate(-10deg)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
	<div style={{position: 'absolute', inset: 4, borderRadius: '50%', border: `1px solid ${INK}`}} />
	<span style={{fontFamily: "'DejaVu Serif',serif", fontWeight: 700, fontSize: 28, color: INK, lineHeight: 1, marginTop: 2}}>J</span></div>;
/** story text, top-left; rows stack (row 1 stays while row 2 types) */
export const Story: React.FC<{rows: SubRow[]}> = ({rows}) => rows.length === 0 ? null : <>
	<div style={{position: 'absolute', borderRadius: '50%', filter: 'blur(38px)', left: 40, top: 70, width: 1080, height: 120 + 88 * rows.length, background: 'rgba(12,16,20,0.30)'}} />
	<div style={{...fx, left: 150, top: 132, fontWeight: 900, fontSize: 58, lineHeight: 1.5, letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>{rows.map((r, i) => <div key={i} style={{opacity: r.o ?? 1}}><Marked s={r.s} n={r.n} /></div>)}</div>
</>;
export const Punch: React.FC<{s: string; o?: number; n?: number}> = ({s, o = 1, n}) => <>
	<div style={{position: 'absolute', left: 460, right: 460, top: 440, height: 160, borderRadius: '50%', filter: 'blur(40px)', background: 'rgba(10,12,16,0.38)', opacity: o}} />
	<div style={{...fx, left: 0, right: 0, top: 470, textAlign: 'center', fontWeight: 900, fontSize: 76, letterSpacing: '0.06em', opacity: o}}><Marked s={s} n={n} pull /></div></>;
