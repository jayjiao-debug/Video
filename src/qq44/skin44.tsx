import React from 'react';
/* ep44 episode skin (owner note 2): same layout as look A, reskinned for "you are Einstein's brain".
   Key words in the brain's rose-gold, a modern sans for the story text, lab-record mono years in the stamp,
   and the counter as a specimen label. No red anywhere. */
export const SANS = "'Noto Sans CJK SC','Noto Sans CJK',sans-serif", MONO = "'DejaVu Sans Mono',monospace", FIG = "'DejaVu Sans','Noto Sans CJK SC',sans-serif";
export const ROSE = '#FFB291', ROSE_D = '#C9775E', INK = '#F4EEE4', LABEL = '#EEE8DC', LABEL_INK = '#2A2420';
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
/** the specimen label (bottom-left): era tag | 你 N 岁 */
export const Specimen: React.FC<{era: string; v: number; blur?: number; who?: string; pre?: string}> = ({era, v, blur = 0, who = '你', pre = ''}) =>
	<div style={{position: 'absolute', left: 150, bottom: 62, background: LABEL, color: LABEL_INK, border: `2px solid ${LABEL_INK}`, borderRadius: 3, padding: 4, boxShadow: '0 4px 18px rgba(0,0,0,0.45)', fontFamily: SANS}}>
		<div style={{border: `1px solid ${LABEL_INK}`, display: 'flex', alignItems: 'stretch'}}>
			<div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px 12px', borderRight: `1px solid ${LABEL_INK}`}}>
				<div style={{fontFamily: MONO, fontSize: 13, letterSpacing: '0.14em', fontWeight: 700, opacity: 0.75}}>SPECIMEN</div>
				<div style={{fontSize: 30, fontWeight: 900, letterSpacing: '0.12em', lineHeight: 1.05}}>{era}</div>
			</div>
			<div style={{display: 'flex', alignItems: 'flex-end', padding: '6px 16px 8px 14px', gap: 6, whiteSpace: 'nowrap'}}>
				<span style={{fontSize: 30, fontWeight: 900, lineHeight: 1, marginBottom: 6}}>{who}{pre && ` ${pre}`}</span>
				<span style={{fontFamily: FIG, fontSize: 70, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums'}}><Odo v={v} size={70} blur={blur} /></span>
				<span style={{fontSize: 30, fontWeight: 900, lineHeight: 1, marginBottom: 6}}>岁</span>
			</div>
		</div>
	</div>;
/** stamp (top-right): lab-record year in mono, place in sans, rose-gold rule */
export const Stamp: React.FC<{y: string; place?: string; l2?: string; l3?: string; o?: number}> = ({y, place, l2, l3, o = 1}) =>
	<div style={{...fx, top: 92, right: 60, textAlign: 'right', paddingRight: 22, borderRight: `4px solid ${ROSE}`, opacity: o}}>
		<div style={{fontWeight: 900, fontSize: 54, lineHeight: 1.22}}><span style={{fontFamily: MONO, fontWeight: 700, letterSpacing: '-0.02em'}}>{y}</span>{place && <span> · {place}</span>}</div>
		{l2 && <div style={{fontWeight: 700, fontSize: 38, lineHeight: 1.45, marginTop: 2}}>{l2}</div>}
		{l3 && <div style={{fontWeight: 500, fontSize: 32, lineHeight: 1.45, opacity: 0.85}}>{l3}</div>}
	</div>;
export const Brand: React.FC = () => <div style={{...fx, top: 34, right: 60, fontSize: 28, letterSpacing: '0.06em', fontWeight: 700, opacity: 0.92}}><span style={{color: ROSE, textShadow: KEY_SH}}>◆</span> Juno · VIBE知识大赏</div>;
/** story text, top-left; rows stack (row 1 stays while row 2 types) */
export const Story: React.FC<{rows: SubRow[]}> = ({rows}) => rows.length === 0 ? null : <>
	<div style={{position: 'absolute', borderRadius: '50%', filter: 'blur(38px)', left: 40, top: 70, width: 1080, height: 120 + 88 * rows.length, background: 'rgba(12,16,20,0.30)'}} />
	<div style={{...fx, left: 150, top: 132, fontWeight: 900, fontSize: 58, lineHeight: 1.5, letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>{rows.map((r, i) => <div key={i} style={{opacity: r.o ?? 1}}><Marked s={r.s} n={r.n} /></div>)}</div>
</>;
export const Punch: React.FC<{s: string; o?: number; n?: number}> = ({s, o = 1, n}) => <>
	<div style={{position: 'absolute', left: 460, right: 460, top: 440, height: 160, borderRadius: '50%', filter: 'blur(40px)', background: 'rgba(10,12,16,0.38)', opacity: o}} />
	<div style={{...fx, left: 0, right: 0, top: 470, textAlign: 'center', fontWeight: 900, fontSize: 76, letterSpacing: '0.06em', opacity: o}}><Marked s={s} n={n} pull /></div></>;
