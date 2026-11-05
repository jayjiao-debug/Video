import React from 'react';
import {Pose, solve, Rig, Cast} from '../qq60/rig60';
import {ap, mx, V, PAL, Role} from '../qq60/geo60';
import {F_SERIF} from '../qq60/frame60';
import {God61, CAST61} from './cast61';
import {FaceOver, Look, HeadKind61} from './expr61';
import {gripOf, FistOver} from '../qq60/act60b_kit';
import {Feather} from '../qq60/props60';

/* ep61 · character sheet kit: the Actor (God61 + face layer), themes, panels, wrapped text, callouts, head crops, palette strip. */
export const SW = 1440, SH_ = 1080;
export type Theme = {bg: string; panel: string; line: string; text: string; sub: string; accent: string; ground: string; dark: boolean};
export const LIGHT: Theme = {bg: '#E8D4AA', panel: '#F1E2BF', line: '#B08F58', text: '#2A1912', sub: '#6B4A2B', accent: '#B8371F', ground: '#CDB17C', dark: false};
export const DARK: Theme = {bg: '#101838', panel: '#1B2652', line: '#D8A845', text: '#F4E8CC', sub: '#B8C4F2', accent: '#F08A5A', ground: '#2C3A78', dark: true};

/* ---------------- the actor ---------------- */
export type ActorOpts = {pivots?: boolean; /** Ma'at: the feather of the balance held in the front fist */ feather?: boolean; bProp?: Cast['bProp']; fProp?: Cast['fProp']; wings?: boolean; dress?: Cast['dress']; open?: number; roar?: number; sneer?: number; jaw?: number; ear?: number; look?: Look; basket?: boolean; hide?: {bArm?: boolean; fArm?: boolean; props?: boolean}; t?: number; face?: 1 | -1};
export const headKindOf = (who: string): HeadKind61 => { const k = CAST61[who]; return (k.head ?? k.base.head) as HeadKind61; };
export const headFillOf = (who: string): string => { const k = CAST61[who], hk = headKindOf(who), P = PAL as Record<string, string>;
	if (hk === 'human') return P[k.base.skin]; if (hk === 'lioness') return k.color ?? PAL.lion; if (hk === 'cat' || hk === 'seth') return k.color ?? PAL.lion;
	return P[k.base.headFill ?? 'jackal']; };
export const Actor: React.FC<{id: string; who: string; pose: Pose; x: number; y: number; s: number} & ActorOpts> = ({id, who, pose, x, y, s, face = 1, look, feather, ...o}) => {
	const k = CAST61[who], female = !!k.base.female, c = {OW: 2.7 / s, LW: 1.5 / s};
	return <g>
		<God61 id={id} who={who} pose={pose} x={x} y={y} s={s} face={face} {...o} />
		{feather && (() => { const G = gripOf(pose, 'f', female); return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}><g transform={`translate(${G[0]},${G[1] + 0.45})`}><Feather c={c} h={2.9} /></g><FistOver pose={pose} side="f" c={c} skin={(PAL as Record<string, string>)[k.base.skin]} female={female} /></g>; })()}
		{look && <g transform={`translate(${x},${y}) scale(${s * face},${s})`}><g transform={mx(solve(pose, female).head)}><FaceOver kind={headKindOf(who)} fill={headFillOf(who)} c={c} look={look} id={id} /></g></g>}
	</g>;
};
/** world position (px) of a point in a bone frame of a posed actor */
export const at = (pose: Pose, x: number, y: number, s: number, face: 1 | -1, bone: keyof Rig, p: V, female = false): V => { const q = ap(solve(pose, female)[bone], p); return [x + face * s * q[0], y + s * q[1]]; };

/* ---------------- text ---------------- */
export const wrap = (text: string, n: number): string[] => { const out: string[] = []; let cur = '', w = 0;
	for (const ch of text) { const cw = /[⺀-鿿＀-￯，。、；：「」（）·×≈]/.test(ch) ? 1 : 0.56; if (w + cw > n && !/[，。、；：）」]/.test(ch)) { out.push(cur); cur = ''; w = 0; } cur += ch; w += cw; }
	if (cur) out.push(cur); return out; };
export const Tx: React.FC<{x: number; y: number; t: string; size?: number; fill?: string; w?: number; anchor?: 'start' | 'middle' | 'end'; stroke?: string; italic?: boolean; ls?: number}> = ({x, y, t, size = 18, fill = '#2A1912', w = 700, anchor = 'start', stroke, italic, ls}) =>
	<text x={x} y={y} fontSize={size} fontWeight={w} fill={fill} textAnchor={anchor} fontFamily={F_SERIF} fontStyle={italic ? 'italic' : undefined} letterSpacing={ls} stroke={stroke} strokeWidth={stroke ? size * 0.25 : undefined} paintOrder={stroke ? 'stroke' : undefined}>{t}</text>;
export const Lines: React.FC<{x: number; y: number; lines: string[]; size?: number; lh?: number; fill?: string; w?: number; anchor?: 'start' | 'middle' | 'end'}> = ({x, y, lines, size = 15, lh = 1.35, fill = '#2A1912', w = 600, anchor = 'start'}) =>
	<g>{lines.map((l, i) => <Tx key={i} x={x} y={y + i * size * lh} t={l} size={size} fill={fill} w={w} anchor={anchor} />)}</g>;

/* ---------------- panels ---------------- */
export const Panel: React.FC<{x: number; y: number; w: number; h: number; th: Theme; title?: string; fill?: string}> = ({x, y, w, h, th, title, fill}) => <g>
	<rect x={x} y={y} width={w} height={h} rx={6} fill={fill ?? th.panel} stroke={th.line} strokeWidth={2} />
	{title && <g><rect x={x + 10} y={y - 11} width={title.length * 17 + 18} height={22} rx={4} fill={th.dark ? '#0B1230' : '#2A1912'} /><Tx x={x + 19} y={y + 5} t={title} size={15} fill={th.dark ? '#F8D97A' : '#F4E8CC'} /></g>}
</g>;
export const Ground: React.FC<{x0: number; x1: number; y: number; th: Theme}> = ({x0, x1, y, th}) => <g><rect x={x0} y={y} width={x1 - x0} height={5} fill={th.ground} /><line x1={x0} x2={x1} y1={y} y2={y} stroke={th.dark ? '#D8A845' : '#2A1912'} strokeWidth={2} opacity={0.7} /></g>;

/* ---------------- callouts ---------------- */
export type Callout = {t: string; d: string; src: string; to: V; side?: 'L' | 'R'};
export const Callouts: React.FC<{items: Callout[]; th: Theme; cx: number; xL: number; xR: number; bw: number; y0: number; y1: number}> = ({items, th, cx, xL, xR, bw, y0, y1}) => {
	const boxes = items.map((it) => { const side = it.side ?? (it.to[0] < cx ? 'L' : 'R'), dl = wrap(it.d, bw / 13.2), sl = wrap(it.src, bw / 11); return {it, side, dl, sl, h: 25 + dl.length * 17 + sl.length * 14 + 6}; });
	const place = (side: 'L' | 'R') => { const bs = boxes.filter((b) => b.side === side).sort((a, b) => a.it.to[1] - b.it.to[1]); let y = y0; const out: {b: typeof bs[0]; y: number}[] = [];
		bs.forEach((b) => { const yy = Math.max(y, Math.min(b.it.to[1] - b.h / 2, y1 - b.h)); out.push({b, y: yy}); y = yy + b.h + 7; });
		// push up if the stack ran past the bottom
		for (let i = out.length - 1, lim = y1; i >= 0; i--) { out[i].y = Math.min(out[i].y, lim - out[i].b.h); lim = out[i].y - 7; } return out; };
	const all = [...place('L'), ...place('R')];
	return <g>
		{all.map(({b, y}, i) => { const bx = b.side === 'L' ? xL : xR, ex = b.side === 'L' ? bx + bw : bx, ey = y + 13, [tx, ty] = b.it.to;
			return <g key={i}><path d={`M${ex} ${ey}L${(ex + tx) / 2} ${ey}L${tx} ${ty}`} fill="none" stroke={th.dark ? '#F8D97A' : '#B8371F'} strokeWidth={1.4} />
				<circle cx={tx} cy={ty} r={4.2} fill={th.dark ? '#F8D97A' : '#B8371F'} stroke={th.dark ? '#0B1230' : '#F8F3E7'} strokeWidth={1.5} /></g>; })}
		{all.map(({b, y}, i) => { const bx = b.side === 'L' ? xL : xR;
			return <g key={'b' + i}><rect x={bx} y={y} width={bw} height={b.h} rx={5} fill={th.dark ? '#0B1230' : '#FBF3DC'} stroke={th.line} strokeWidth={1.5} opacity={0.97} />
				<Tx x={bx + 8} y={y + 18} t={b.it.t} size={16} fill={th.dark ? '#F8D97A' : '#962A16'} w={900} />
				<Lines x={bx + 8} y={y + 37} lines={b.dl} size={13.2} lh={1.3} fill={th.text} w={600} />
				<Lines x={bx + 8} y={y + 37 + b.dl.length * 17.2 + 3} lines={b.sl} size={11} lh={1.28} fill={th.sub} w={600} /></g>; })}
	</g>;
};

/* ---------------- head crop ---------------- */
export const Crop: React.FC<{x: number; y: number; w: number; h: number; th: Theme; label?: string; children: (ox: number, oy: number) => React.ReactNode}> = ({x, y, w, h, th, label, children}) => <g>
	<svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="hidden"><rect width={w} height={h} fill={th.dark ? '#16205A' : '#F7EBCB'} />{children(0, 0)}</svg>
	<rect x={x} y={y} width={w} height={h} fill="none" stroke={th.line} strokeWidth={2} rx={4} />
	{label && <g><rect x={x + w - label.length * 14 - 16} y={y + h - 26} width={label.length * 14 + 12} height={20} rx={4} fill={th.dark ? '#0B1230' : '#2A1912'} opacity={0.9} /><Tx x={x + w - label.length * 14 - 10} y={y + h - 11} t={label} size={13} fill={th.dark ? '#F8D97A' : '#F4E8CC'} /></g>}
</g>;
/** an actor placed so that head-frame point `focus` sits at the middle of a w×h box */
export const headAt = (who: string, pose: Pose, s: number, w: number, h: number, focus: V): V => { const q = ap(solve(pose, !!CAST61[who].base.female).head, focus); return [w / 2 - s * q[0], h / 2 - s * q[1]]; };

/* ---------------- palette strip ---------------- */
export const hexOf = (k: string) => (PAL as Record<string, string>)[k] ?? k;
export const Palette: React.FC<{x: number; y: number; w: number; items: [string, string][]; th: Theme}> = ({x, y, w, items, th}) => {
	const per = Math.min(items.length, 8), sw = w / per, rows = Math.ceil(items.length / per);
	return <g>{items.map(([k, name], i) => { const cx = x + (i % per) * sw, cy = y + Math.floor(i / per) * 62;
		return <g key={i}><rect x={cx + 2} y={cy} width={sw - 6} height={26} rx={3} fill={hexOf(k)} stroke={th.dark ? '#F4E8CC' : '#2A1912'} strokeWidth={1.6} />
			<Tx x={cx + sw / 2 - 2} y={cy + 40} t={hexOf(k).toUpperCase()} size={12.5} fill={th.text} w={800} anchor="middle" />
			<Tx x={cx + sw / 2 - 2} y={cy + 55} t={name} size={11.5} fill={th.sub} w={600} anchor="middle" /></g>; })}
		<rect x={x} y={y - 4} width={0} height={rows * 62} /></g>;
};
export const palHeight = (n: number) => Math.ceil(n / 8) * 62;

/* ---------------- must / don't ---------------- */
export const Rules: React.FC<{x: number; y: number; w: number; must: string[]; dont: string[]; th: Theme; size?: number}> = ({x, y, w, must, dont, th, size = 15}) => {
	const cw = w / 2 - 14, col = (items: string[], x0: number, head: string, hc: string, mark: string) => { let yy = y + 44; const out: React.ReactNode[] = [];
		items.forEach((it, i) => { const ls = wrap(it, (cw - 18) / size); out.push(<g key={i}><Tx x={x0} y={yy} t={mark} size={size} fill={hc} w={900} /><Lines x={x0 + 18} y={yy} lines={ls} size={size} lh={1.32} fill={th.text} w={600} /></g>); yy += ls.length * size * 1.32 + 5; });
		return <g><rect x={x0 - 8} y={y} width={cw + 12} height={28} rx={4} fill={hc} /><Tx x={x0 + 2} y={y + 21} t={head} size={18} fill="#FBF3DC" w={900} />{out}</g>; };
	return <g>{col(must, x + 8, '必须', th.dark ? '#2E8F5F' : '#2F7F54', '●')}{col(dont, x + w / 2 + 8, '不要', th.dark ? '#C23A22' : '#A82E1A', '●')}</g>;
};
export type {Role};
