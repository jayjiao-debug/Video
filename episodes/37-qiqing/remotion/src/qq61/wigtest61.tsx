import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {POSES, Pose} from '../qq60/rig60';
import {CAST61, animalOf} from './cast61';
import {Actor, Crop, LIGHT, SW, SH_, Tx, headAt, ActorOpts} from './sheetkit61';
import {Look} from './expr61';

/* ep61 · WIGTEST61 — DESIGN TEST of the tripartite wig's near front lappet IN FRONT of the shoulder (owner 2026-11-06 13:30 / 13:42
   "isn't the hair supposed to be in front? … 先看看设计"). Review only: the option `wigFront` (God61 / Actor prop, or `wigFront: true` on a
   CAST61 entry) is OFF by default and nothing else uses it yet.
   One frame per pair of characters; per character three columns 「现在」 (current drawing) | 「垂片在前」 (front lappet) | 「垂片在前 · 怒吼」
   (animal heads: roar / screech with the head thrown back) or 「垂片在前 · 仰头」 (human heads: head back, mouth open), at head-close-up
   scale (top row) and full figure (bottom row).
   Render (from episodes/37-qiqing/remotion, after npm ci):
     node ../../../tasks/ep61-facerig/out/rf.mjs qq61/wigtest61 WIGTEST61 /tmp/wig wig 0 1 2 3 4 5 */

const PAIRS: [string, string][] = [['ra', 'horus'], ['anubis', 'thoth'], ['set', 'bastet'], ['tefnut', 'sekhmet'], ['isis', 'nephthys'], ['maat', 'shu']];
const ZH: Record<string, [string, string]> = {
	ra: ['拉', 'Ra · falcon'], horus: ['荷鲁斯', 'Horus · falcon'], anubis: ['阿努比斯', 'Anubis · jackal'], thoth: ['托特', 'Thoth · ibis'],
	set: ['赛特', 'Set · Set animal'], bastet: ['巴斯特', 'Bastet · cat'], tefnut: ['泰芙努特', 'Tefnut · lioness'], sekhmet: ['塞赫迈特', 'Sekhmet · lioness'],
	isis: ['伊西斯', 'Isis · human'], nephthys: ['奈芙蒂斯', 'Nephthys · human'], maat: ['玛阿特', "Ma'at · human"], shu: ['舒', 'Shu · human'],
};
export const WIG_N = PAIRS.length;
const STAND: Pose = {...POSES.rest, lean: 0, neck: 0, head: 0};
/** the head-back state: animal heads roar (God61 throws the head back 7° on top of this), human heads tip the chin up and open the mouth */
const BACK: Pose = {...STAND, neck: -4, head: -8};
const LONG: Record<string, boolean> = {seth: true, jackal: true, ibis: true};

type Col = {label: string; wf: boolean; back: boolean};
const COLS: Col[] = [{label: '现在', wf: false, back: false}, {label: '垂片在前', wf: true, back: false}, {label: '', wf: true, back: true}];

const Cell: React.FC<{who: string; col: Col; full: boolean; x: number; y: number; w: number; h: number; id: string}> = ({who, col, full, x, y, w, h, id}) => {
	const kind = animalOf(CAST61[who]), pose = col.back ? BACK : STAND;
	const o: ActorOpts = {wigFront: col.wf, t: 0, ...(col.back && kind ? {roar: 1} : {})};
	const look: Look = kind ? {eyes: 0} : col.back ? {eyes: 0, mouth: 0.8} : {eyes: 0};
	const label = col.back ? (kind ? '垂片在前 · 怒吼' : '垂片在前 · 仰头') : col.label;
	if (full) { const s = 19.5; return <Crop x={x} y={y} w={w} h={h} th={LIGHT} label={label}>{() => <g>
		<line x1={0} x2={w} y1={h - 34} y2={h - 34} stroke="#B08F58" strokeWidth={2} />
		<Actor id={id} who={who} pose={pose} x={w / 2 - 12} y={h - 34} s={s} look={look} {...o} /></g>}</Crop>; }
	const s = kind && LONG[kind] ? 44 : 50, [hx, hy] = headAt(who, pose, s, w, h, kind && LONG[kind] ? [0.95, -0.3] : [0.55, -0.3]);
	return <Crop x={x} y={y} w={w} h={h} th={LIGHT} label={label}>{() => <g><Actor id={id} who={who} pose={pose} x={hx} y={hy} s={s} look={look} {...o} />
		{col.wf && animalOf(CAST61[who]) === 'cat' && <g><rect x={6} y={6} width={w - 12} height={46} rx={4} fill="#2A1912" opacity={0.85} />
			<Tx x={w / 2} y={25} t="猫头不戴假发（设计书 §0.2）" size={14} fill="#F8D97A" w={700} anchor="middle" /><Tx x={w / 2} y={44} t="没有垂片 · 与「现在」相同" size={13} fill="#F4E8CC" w={600} anchor="middle" /></g>}</g>}</Crop>;
};

const Half: React.FC<{who: string; x: number}> = ({who, x}) => {
	const [zh, en] = ZH[who], gap = 8, cw = (720 - 28 - 2 * gap) / 3, y1 = 134, h1 = 392, y2 = y1 + h1 + gap, h2 = SH_ - 12 - y2;
	return <g>
		<Tx x={x + 14} y={120} t={zh} size={28} fill="#2A1912" w={900} /><Tx x={x + 706} y={120} t={en} size={18} fill="#6B4A2B" w={600} anchor="end" italic />
		{COLS.map((col, i) => <Cell key={'h' + i} who={who} col={col} full={false} x={x + 14 + i * (cw + gap)} y={y1} w={cw} h={h1} id={`wt-${who}-h${i}`} />)}
		{COLS.map((col, i) => <Cell key={'f' + i} who={who} col={col} full x={x + 14 + i * (cw + gap)} y={y2} w={cw} h={h2} id={`wt-${who}-f${i}`} />)}
	</g>;
};

export const WigTest: React.FC = () => {
	const f = Math.min(WIG_N - 1, useCurrentFrame()), [a, b] = PAIRS[f];
	return <svg width={SW} height={SH_} viewBox={`0 0 ${SW} ${SH_}`} style={{display: 'block'}}>
		<rect width={SW} height={SH_} fill="#E8D4AA" />
		<rect width={SW} height={84} fill="#1B2652" /><rect y={80} width={SW} height={4} fill="#D8A845" />
		<Tx x={28} y={48} t="三段式假发 · 前垂片放到肩前（设计测试，仅供审阅）" size={32} fill="#F4E8CC" w={900} />
		<Tx x={30} y={74} t="「现在」= 现行画法；「垂片在前」= 近侧前垂片从耳后 / 下颌关节后垂下，压在肩前和项圈上缘；眼、吻 / 喙、耳、张开的嘴都不被遮住" size={15} fill="#F8D97A" w={600} />
		<Tx x={SW - 28} y={48} t="tripartite wig · front lappet" size={22} fill="#F8D97A" w={600} anchor="end" italic />
		<Tx x={SW - 28} y={74} t={`WIGTEST61 · ${f + 1} / ${WIG_N}`} size={15} fill="#B8C4F2" w={500} anchor="end" />
		<line x1={720} x2={720} y1={92} y2={SH_ - 8} stroke="#B08F58" strokeWidth={2} />
		<Half who={a} x={0} /><Half who={b} x={720} />
	</svg>;
};

registerRoot(() => <>
	<Composition id="WIGTEST61" component={WigTest} durationInFrames={WIG_N} fps={30} width={SW} height={SH_} />
</>);
