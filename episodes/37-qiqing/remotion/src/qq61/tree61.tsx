import React from 'react';
import {PAL} from '../qq60/geo60';
import {FC, F_SERIF} from '../qq60/frame60';
import {God61, P61, CAST61, sigOf} from './cast61';

/* ep61 · the family tree (the throughline). Tree space 1040 × 760, node = medallion r 46 with the god's bust.
   Rows: Atum-Ra on top (Ra's daughters beside him, right) · Shu + Tefnut · Geb + Nut · Osiris Isis | Set Nephthys · Horus | Anubis.
   Thoth stands beside the tree (left) as the scribe. A node is dim until its god is introduced, gold when lit, pulsing when in focus. */
export type NodeId = 'atum' | 'shu' | 'tefnut' | 'geb' | 'nut' | 'osiris' | 'isis' | 'set' | 'nephthys' | 'horus' | 'anubis' | 'sekhmet' | 'bastet' | 'maat' | 'thoth';
export const TW = 1040, TH = 760, NR = 46;
export const NODES: Record<NodeId, {x: number; y: number; zh: string; who: string}> = {
	atum: {x: 520, y: 70, zh: '亚图姆·拉', who: 'ra'},
	sekhmet: {x: 760, y: 70, zh: '塞赫麦特', who: 'sekhmet'}, bastet: {x: 880, y: 70, zh: '巴斯特', who: 'bastet'}, maat: {x: 1000, y: 70, zh: '玛阿特', who: 'maat'},
	shu: {x: 380, y: 215, zh: '舒', who: 'shu'}, tefnut: {x: 660, y: 215, zh: '泰芙努特', who: 'tefnut'},
	thoth: {x: 90, y: 215, zh: '托特', who: 'thoth'},
	geb: {x: 380, y: 360, zh: '盖布', who: 'geb'}, nut: {x: 660, y: 360, zh: '努特', who: 'nut'},
	osiris: {x: 170, y: 520, zh: '奥西里斯', who: 'osiris'}, isis: {x: 370, y: 520, zh: '伊西斯', who: 'isis'}, set: {x: 670, y: 520, zh: '赛特', who: 'set'}, nephthys: {x: 870, y: 520, zh: '奈芙蒂斯', who: 'nephthys'},
	horus: {x: 270, y: 670, zh: '荷鲁斯', who: 'horus'}, anubis: {x: 870, y: 670, zh: '阿努比斯', who: 'anubis'},
};
/** parent → child lines (solid), marriages (double line) and the scribe / daughter links (dashed) */
const KIDS: [NodeId, NodeId][] = [['atum', 'shu'], ['atum', 'tefnut'], ['shu', 'geb'], ['tefnut', 'nut'], ['nut', 'osiris'], ['nut', 'isis'], ['nut', 'set'], ['nut', 'nephthys'], ['osiris', 'horus'], ['nephthys', 'anubis']];
const WED: [NodeId, NodeId][] = [['shu', 'tefnut'], ['geb', 'nut'], ['osiris', 'isis'], ['set', 'nephthys']];
const LINK: [NodeId, NodeId][] = [['atum', 'sekhmet'], ['sekhmet', 'bastet'], ['bastet', 'maat'], ['thoth', 'shu']];
const nodeAt = (id: NodeId) => NODES[id];

/** which gods are lit at shot n (1-based) */
export const LIT: Record<number, NodeId[]> = (() => {
	const add: Record<number, NodeId[]> = {2: ['atum'], 4: ['shu', 'tefnut'], 5: ['geb', 'nut'], 8: ['thoth'], 10: ['osiris'], 11: ['isis', 'set'], 12: ['nephthys'], 14: ['horus'], 17: ['anubis'], 19: ['sekhmet'], 20: ['bastet', 'maat']};
	const out: Record<number, NodeId[]> = {}; let cur: NodeId[] = [];
	for (let n = 1; n <= 22; n++) { cur = [...cur, ...(add[n] ?? [])]; out[n] = n >= 21 ? [...cur, ...(Object.keys(NODES) as NodeId[]).filter((k) => !cur.includes(k))] : cur; }
	return out; })();
export const FOCUS: Record<number, NodeId[]> = {2: ['atum'], 3: ['atum'], 4: ['shu', 'tefnut'], 5: ['geb', 'nut'], 8: ['thoth'], 10: ['osiris'], 11: ['isis', 'set'], 12: ['nephthys'], 14: ['horus'], 17: ['anubis'], 19: ['sekhmet'], 20: ['bastet', 'maat']};

const Medallion: React.FC<{id: NodeId; lit: boolean; focus: boolean; labels: boolean; icon: boolean; cid: string; sk?: boolean}> = ({id, lit, focus, labels, icon, cid, sk}) => {
	const n = nodeAt(id), who = n.who, cast = CAST61[who].base, sig = sigOf(who);
	const sc = who === 'ra' || who === 'atum' ? 7 : 8, headY = who === 'osiris' || who === 'sekhmet' ? 17.4 : 17.6;
	return <g>
		{focus && <circle cx={n.x} cy={n.y} r={NR + 16} fill={FC.gold} opacity={0.35} />}
		<circle cx={n.x} cy={n.y} r={NR + 4} fill={lit ? FC.gold : 'none'} stroke={lit ? FC.gold2 : sk ? FC.gold : '#7C6A4A'} strokeWidth={sk ? 5 : 3} strokeDasharray={lit ? undefined : '7 6'} opacity={lit || sk ? 1 : 0.7} />
		{/* round 3: the lit node ring carries the god's signature colour (c, with c2 as the thin outer ring) */}
		{lit && <g fill="none"><circle cx={n.x} cy={n.y} r={NR + 10} stroke={FC.ink} strokeWidth={4.5} /><circle cx={n.x} cy={n.y} r={NR + 10} stroke={sig.c2} strokeWidth={2.5} />
			<circle cx={n.x} cy={n.y} r={NR + 4} stroke={FC.ink} strokeWidth={11} /><circle cx={n.x} cy={n.y} r={NR + 4} stroke={sig.c} strokeWidth={8} /></g>}
		<circle cx={n.x} cy={n.y} r={NR} fill={lit ? FC.lapis : sk ? FC.lapis2 : '#D9C7A0'} opacity={lit ? 1 : sk ? 0.9 : 0.55} />
		{lit && icon && <g>
			<clipPath id={`tc-${cid}-${id}`}><path d={`M${n.x - NR},${n.y - NR * 3} L${n.x + NR},${n.y - NR * 3} L${n.x + NR},${n.y} A${NR},${NR} 0 0 1 ${n.x - NR},${n.y} Z`} /></clipPath>
			<g clipPath={`url(#tc-${cid}-${id})`}><God61 id={`ti-${cid}-${id}`} who={who} pose={P61.rest()} x={n.x - 0.6 * sc} y={n.y + (headY - 1.4) * sc} s={sc} /></g></g>}
		{lit && !icon && <circle cx={n.x} cy={n.y} r={NR * 0.45} fill={FC.cream} />}
		{!lit && !sk && <text x={n.x} y={n.y + 14} textAnchor="middle" fontSize={44} fontFamily={F_SERIF} fontWeight={900} fill="#7C6A4A" opacity={0.7}>？</text>}
		{labels && lit && <g>{/* the name tag: cream plate edged in the signature colour */}
			<rect x={n.x - n.zh.length * 13 - 6} y={n.y + NR + 13} width={n.zh.length * 26 + 12} height={28} rx={7} fill="#F4E8CC" stroke={FC.ink} strokeWidth={6} />
			<rect x={n.x - n.zh.length * 13 - 6} y={n.y + NR + 13} width={n.zh.length * 26 + 12} height={28} rx={7} fill="#F4E8CC" stroke={sig.c} strokeWidth={3.5} /></g>}
		{labels && <text x={n.x} y={n.y + NR + (lit ? 36 : 38)} textAnchor="middle" fontSize={lit ? 25 : 30} fontFamily={F_SERIF} fontWeight={900} fill={lit ? FC.ink : '#8A7852'} stroke={lit ? '#F4E8CC' : 'none'} strokeWidth={6} paintOrder="stroke">{n.zh}</text>}
	</g>;
};

/** the whole tree in tree space; place it with the `transform` prop (e.g. translate + scale) */
export const FamilyTree61: React.FC<{lit?: NodeId[]; focus?: NodeId[]; labels?: boolean; icons?: boolean; cid?: string; showAll?: boolean; skeleton?: boolean}> = ({lit = [], focus = [], labels = true, icons = true, cid = 'a', skeleton}) => {
	const L = new Set(lit), seg = (a: NodeId, b: NodeId, dash?: boolean, dbl?: boolean) => { const p = nodeAt(a), q = nodeAt(b), on = L.has(a) && L.has(b) || !!skeleton, col = on ? FC.gold : '#9C8A66', common = {stroke: col, strokeWidth: on ? 6 : 3.5, strokeDasharray: dash || !on ? '9 8' : undefined, opacity: on ? 1 : 0.6, fill: 'none'};
		return dbl ? <g key={a + b}><line x1={p.x + NR} y1={p.y - 6} x2={q.x - NR} y2={q.y - 6} {...common} /><line x1={p.x + NR} y1={p.y + 6} x2={q.x - NR} y2={q.y + 6} {...common} /></g>
			: <path key={a + b} d={`M${p.x} ${p.y + NR}V${(p.y + q.y) / 2 + 8}H${q.x}V${q.y - NR}`} {...common} />; };
	return <g>
		{KIDS.map(([a, b]) => seg(a, b))}
		{WED.map(([a, b]) => seg(a, b, false, true))}
		{LINK.map(([a, b]) => { const p = nodeAt(a), q = nodeAt(b), on = L.has(a) && L.has(b);
			return <line key={a + b} x1={p.x + (q.x > p.x ? NR : -NR)} y1={p.y} x2={q.x + (q.x > p.x ? -NR : NR)} y2={q.y} stroke={on ? FC.gold : '#9C8A66'} strokeWidth={on ? 5 : 3} strokeDasharray="4 9" strokeLinecap="round" opacity={on ? 1 : 0.55} />; })}
		{(Object.keys(NODES) as NodeId[]).map((id) => <Medallion key={id} id={id} lit={L.has(id)} focus={focus.includes(id)} labels={labels} icon={icons} cid={cid} sk={skeleton} />)}
		<text x={NODES.thoth.x} y={NODES.thoth.y - NR - 22} textAnchor="middle" fontSize={22} fontFamily={F_SERIF} fontWeight={900} fill={FC.gold2}>书记官</text>
		<text x={880} y={NODES.sekhmet.y - NR - 22} textAnchor="middle" fontSize={22} fontFamily={F_SERIF} fontWeight={900} fill={FC.gold2}>拉的女儿们</text>
	</g>;
};

/** small chip for every shot: the tree as dots, the lit ones gold, the gods in focus ringed */
export const TreeChip: React.FC<{n: number}> = ({n}) => {
	const lit = new Set(LIT[n]), foc = new Set(FOCUS[n] ?? []), k = 0.225, ids = Object.keys(NODES) as NodeId[];
	const P = (id: NodeId): [number, number] => [24 + 14 + nodeAt(id).x * k, 56 + 14 + nodeAt(id).y * k];
	return <g>
		<rect x={24} y={56} width={TW * k + 28} height={TH * k + 20} rx={10} fill={FC.lapis2} opacity={0.82} stroke={FC.gold2} strokeWidth={2} />
		{KIDS.map(([a, b]) => { const p = P(a), q = P(b), on = lit.has(a) && lit.has(b); return <path key={a + b} d={`M${p[0]} ${p[1]}V${(p[1] + q[1]) / 2}H${q[0]}V${q[1]}`} stroke={on ? FC.gold : '#55618F'} strokeWidth={on ? 2.6 : 1.6} fill="none" />; })}
		{LINK.map(([a, b]) => { const p = P(a), q = P(b); return <line key={a + b} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={lit.has(a) && lit.has(b) ? FC.gold : '#55618F'} strokeWidth={1.4} strokeDasharray="2 4" />; })}
		{ids.map((id) => { const p = P(id), on = lit.has(id);
			return <g key={id}>{foc.has(id) && <circle cx={p[0]} cy={p[1]} r={13} fill="none" stroke={FC.key} strokeWidth={3} />}
				<circle cx={p[0]} cy={p[1]} r={8} fill={on ? sigOf(nodeAt(id).who).c : '#2A3566'} stroke={on ? FC.gold : '#55618F'} strokeWidth={on ? 2.4 : 1.6} /></g>; })}
	</g>;
};
