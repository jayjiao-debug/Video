import React from 'react';
import {useCurrentFrame} from 'remotion';
import {POSES, Pose, solve, castBody} from '../qq60/rig60';
import {mx, ap} from '../qq60/geo60';
import {CAST61, animalOf, animalCols} from './cast61';
import {AnimalHead, FaceState, AnimalKind} from './heads61';
import {Actor, Crop, LIGHT, SW, SH_, Tx, ActorOpts} from './sheetkit61';
import {Ammit61, AMMIT61_REST, Ammit61Face, ammit61Solve} from './ammit61';

/* ep61 · FACECHECK61 — one frame per non-human head (Tefnut, Sekhmet, Bastet, Horus, Ra, Anubis, Thoth, Set, Ammit):
   the head big in eight states (closed / talk / wide roar-screech / eyes half / eyes closed / frown + ears back / brow up + ears forward +
   look front / phone size), with the head's OWN outline (skull, turned lower jaw, throat, ears) traced on top in thin magenta:
   any eye, whisker, brow, marking or tooth crossing the magenta line is a defect.
   Render: cd episodes/37-qiqing/remotion && node ../../../tasks/ep61-facerig/out/rf.mjs qq61/sheets61 FACECHECK61 /tmp/fc fc 0 1 2 3 4 5 6 7 8 */
const MAG = '#FF00E0';
export const FACE_WHO: {who: string; zh: string; en: string; kind: string}[] = [
	{who: 'tefnut', zh: '泰芙努特', en: 'Tefnut · lioness', kind: '狮头'}, {who: 'sekhmet', zh: '塞赫迈特', en: 'Sekhmet · lioness', kind: '狮头'},
	{who: 'bastet', zh: '巴斯特', en: 'Bastet · cat', kind: '猫头'}, {who: 'horus', zh: '荷鲁斯', en: 'Horus · falcon', kind: '隼头'},
	{who: 'ra', zh: '拉（隼首）', en: 'Ra · falcon', kind: '隼头'}, {who: 'anubis', zh: '阿努比斯', en: 'Anubis · jackal', kind: '豺头'},
	{who: 'thoth', zh: '托特', en: 'Thoth · ibis', kind: '朱鹮头'}, {who: 'set', zh: '赛特', en: 'Set · Set animal', kind: 'Set 兽头'},
	{who: 'ammit', zh: '阿米特', en: 'Ammit · crocodile (ep61 Ammit61)', kind: '鳄鱼头'},
];
export const FACE_N = FACE_WHO.length;
type St = {label: string; o: ActorOpts; look: FaceState};
const STATES: St[] = [
	{label: '闭口 · 睁眼', o: {}, look: {eyes: 0}},
	{label: '说话（小张）', o: {jaw: 0.3}, look: {eyes: 0}},
	{label: '大张 · 怒吼 / 鸣叫', o: {roar: 1}, look: {eyes: 0}},
	{label: '眼 半闭', o: {}, look: {eyes: 0.5}},
	{label: '眼 闭', o: {}, look: {eyes: 1}},
	{label: '皱眉 · 耳后压', o: {ear: 26}, look: {brow: -1, eyes: 0}},
	{label: '扬眉 · 耳朝前 · 看前', o: {ear: -10}, look: {brow: 1, look: 1, eyes: 0}},
];
const STAND: Pose = {...POSES.rest, lean: 0, neck: 0, head: 0};
const LONG: Record<string, boolean> = {seth: true, jackal: true, ibis: true};

/** a head in a cell: the actor + its own outline in magenta */
const HeadCell: React.FC<{who: string; st: St; x: number; y: number; w: number; h: number; s: number; id: string; label?: string}> = ({who, st, x, y, w, h, s, id, label}) => {
	const k = CAST61[who], kind = animalOf(k) as AnimalKind, [col, col2] = animalCols(k), female = castBody(k.base);
	const roar = st.o.roar ?? 0, P: Pose = roar > 0 ? {...STAND, head: STAND.head - 7 * roar} : STAND;
	const focus: [number, number] = LONG[kind] ? [1.25, -1.5] : [0.75, -1.45], H = solve(P, female).head;
	const q: [number, number] = [H[0] * focus[0] + H[2] * focus[1] + H[4], H[1] * focus[0] + H[3] * focus[1] + H[5]];
	const fx = w / 2 - s * q[0], fy = h / 2 + 10 - s * q[1], c = {OW: 2.7 / s, LW: 1.5 / s};
	return <Crop x={x} y={y} w={w} h={h} th={LIGHT} label={label}>{() => <g>
		<Actor id={id} who={who} pose={STAND} x={fx} y={fy} s={s} {...st.o} look={st.look} />
		<g transform={`translate(${fx},${fy}) scale(${s},${s})`}><g transform={mx(H)}>
			<AnimalHead kind={kind} col={col} col2={col2} st={{...st.look, jaw: st.o.jaw, roar: st.o.roar, ear: st.o.ear}} c={c} id={`${id}-g`} guide={MAG} /></g></g>
	</g>}</Crop>;
};

const Title: React.FC<{zh: string; en: string; kind: string; n: number}> = ({zh, en, kind, n}) => <g>
	<rect width={SW} height={84} fill="#1B2652" /><rect y={80} width={SW} height={4} fill="#D8A845" />
	<Tx x={28} y={48} t={`${zh} · ${kind} · 面部骨架检查`} size={34} fill="#F4E8CC" w={900} />
	<Tx x={30} y={74} t="品红细线 = 头部自身外轮廓（头骨 / 转动后的下颌 / 喉 / 耳）：任何眼、须、眉、花纹、牙越过它都是错" size={16} fill="#F8D97A" w={600} />
	<Tx x={SW - 28} y={48} t={en} size={24} fill="#F8D97A" w={600} anchor="end" italic /><Tx x={SW - 28} y={74} t={`FACECHECK61 · ${n + 1} / ${FACE_N}`} size={15} fill="#B8C4F2" w={500} anchor="end" />
</g>;

const AMMIT_STATES: {label: string; f: Ammit61Face; jaw: number; roar: number}[] = [
	{label: '闭口 5°', f: {}, jaw: 5, roar: 0}, {label: '说话 16°', f: {}, jaw: 16, roar: 0}, {label: '怒吼（大张 46°）', f: {}, jaw: 5, roar: 1},
	{label: '眼 半闭', f: {eyes: 0.5}, jaw: 5, roar: 0}, {label: '眼 闭', f: {eyes: 1}, jaw: 5, roar: 0}, {label: '皱眉', f: {brow: -1}, jaw: 8, roar: 0}, {label: '扬眉 · 看前', f: {brow: 1, look: 0}, jaw: 5, roar: 0},
];

export const FaceCheck: React.FC = () => {
	const f = Math.min(FACE_N - 1, useCurrentFrame()), W = FACE_WHO[f], gap = 10, x0 = 14, y0 = 94, cw = (SW - 2 * x0 - 3 * gap) / 4, ch = (SH_ - y0 - 12 - gap) / 2;
	const cells = Array.from({length: 8}, (_, i) => ({x: x0 + (i % 4) * (cw + gap), y: y0 + Math.floor(i / 4) * (ch + gap)}));
	const isAmmit = W.who === 'ammit';
	const kind = isAmmit ? undefined : animalOf(CAST61[W.who]), s = kind && LONG[kind] ? 64 : 76;
	return <svg width={SW} height={SH_} viewBox={`0 0 ${SW} ${SH_}`} style={{display: 'block'}}>
		<rect width={SW} height={SH_} fill="#E8D4AA" />
		<Title zh={W.zh} en={W.en} kind={W.kind} n={f} />
		{isAmmit ? <g>
			{AMMIT_STATES.map((a, i) => <Crop key={i} x={cells[i].x} y={cells[i].y} w={cw} h={ch} th={LIGHT} label={a.label}>{() => { const s2 = 40, g = ammit61Solve({...AMMIT61_REST, jaw: a.jaw}, a.roar), q = ap(g.N, [3.3, -0.7]), ax = cw / 2 - s2 * q[0], ay = ch / 2 - s2 * q[1];
				return <g><Ammit61 id={`fc-am${i}`} pose={{...AMMIT61_REST, jaw: a.jaw}} roar={a.roar} fs={a.f} x={ax} y={ay} s={s2} t={0.5} />
					<Ammit61 id={`fc-amg${i}`} pose={{...AMMIT61_REST, jaw: a.jaw}} roar={a.roar} fs={a.f} x={ax} y={ay} s={s2} t={0.5} guide={MAG} /></g>; }}</Crop>)}
			<Crop x={cells[7].x} y={cells[7].y} w={cw} h={ch} th={LIGHT} label="手机尺寸（闭 / 吼）">{() => <g>
				<Ammit61 id="fc-ams0" pose={{...AMMIT61_REST, jaw: 5}} x={cw / 2 - 40} y={ch * 0.42} s={11} t={0.5} />
				<Ammit61 id="fc-ams1" pose={{...AMMIT61_REST, jaw: 5}} roar={1} x={cw / 2 - 40} y={ch * 0.86} s={11} t={0.5} /></g>}</Crop>
		</g> : <g>
			{STATES.map((st, i) => <HeadCell key={i} who={W.who} st={st} x={cells[i].x} y={cells[i].y} w={cw} h={ch} s={s} id={`fc${f}-${i}`} label={st.label} />)}
			<Crop x={cells[7].x} y={cells[7].y} w={cw} h={ch} th={LIGHT} label="手机尺寸（闭 / 说 / 吼）">{() => <g>
				{[{o: {}, l: {}}, {o: {jaw: 0.3}, l: {}}, {o: {roar: 1}, l: {}}].map((v, i) => <Actor key={i} id={`fc${f}-s${i}`} who={W.who} pose={STAND} x={48 + i * 112} y={ch - 40} s={9} {...v.o} look={{eyes: 0}} />)}
				<Tx x={cw / 2} y={40} t="s = 9（手机竖屏全身约 1/3 高）" size={14} fill="#2A1912" w={700} anchor="middle" />
			</g>}</Crop>
		</g>}
	</svg>;
};
