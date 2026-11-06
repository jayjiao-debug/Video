import React, {useLayoutEffect, useRef, useState} from 'react';
import {Composition, registerRoot, useCurrentFrame, delayRender, continueRender} from 'remotion';
import {Pose, solve, lerpPose, Rig} from '../qq60/rig60';
import {walkPose} from '../qq60/cast60';
import {Ankh, Was, Palette as ScribePalette, Crook, Flail, Sistrum, Pen, Eye} from '../qq60/rig60';
import {Feather} from '../qq60/props60';
import {Balance2} from '../qq60/act60b_kit';
import {HeartScarab} from '../qq60/props60b';
import {GlowHeart, MaskFront, GoldDefs} from '../qq60/act60a_kit';
import {Heart60} from '../qq60/heart60';
import {PAL, V, ap, mx, lerp, sm, cl} from '../qq60/geo60';
import {FC} from '../qq60/frame60';
import {CAST61, God61, bodyOf} from './cast61';
import {Actor, ActorOpts, at, Callouts, Crop, DARK, LIGHT, Ground, headFillOf, Lines, Palette, palHeight, Panel, Rules, SW, SH_, Theme, Tx, wrap, headAt} from './sheetkit61';
import {CHARS, CharCfg, Cell, Part, FaceCell, Slot, SHEET_COUNT, REST, S_RAISE, S_STEP, S_BACK, FACES, restF} from './chars61';
import {Look} from './expr61';
import {FaceCheck, FACE_N} from './facecheck61';

/* ep61 · SHEETS61 (19 sheets, frame i = sheet i+1) and RIGTEST61 (the joints moving, 6 s per character).
   Everything is drawn by the films' own components (God61 → ep60 God rig + heads61 layered animal heads, Ammit61 (ep61 fork of Ammit2), Balance2, HeartScarab, …) so a sheet can never drift from a film.
   Render: cd episodes/37-qiqing/remotion && ENTRY=qq61/sheets61 CID=SHEETS61 JPG=1 node scripts/frame.mjs stills /tmp/sheets 0 0.0333 0.0667 …  (seconds = frame/30) */
const TITLE_H = 98;
const BY = (k: string) => CHARS.find((c) => c.key === k)!;
/** Ani's measured height incl. wig, in grid units (line-up sheet measures it live): the 「凡人 × 1.00」 reference */
const ANI_TOP = 20.0;

/** measure the top of a group (px) once rendered: used for the height ruler */
const useTop = (): [React.RefObject<SVGGElement | null>, {top: number; left: number; right: number} | null] => {
	const ref = useRef<SVGGElement>(null), [bb, setBB] = useState<{top: number; left: number; right: number} | null>(null), [h] = useState(() => delayRender('bbox'));
	useLayoutEffect(() => { const b = ref.current?.getBBox(); if (b) setBB({top: b.y, left: b.x, right: b.x + b.width}); continueRender(h); }, [h]);
	return [ref, bb];
};

const SheetBg: React.FC<{th: Theme; children: React.ReactNode}> = ({th, children}) => <svg width={SW} height={SH_} viewBox={`0 0 ${SW} ${SH_}`} style={{display: 'block'}}>
	<defs><pattern id="papy" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill={th.bg} /><path d="M0 1H6M0 4H6" stroke={th.dark ? '#18224A' : '#DCC592'} strokeWidth="0.6" opacity="0.5" /></pattern></defs>
	<rect width={SW} height={SH_} fill="url(#papy)" />{children}</svg>;
const Title: React.FC<{n: number; zh: string; role: string; sub: string; en: string; th: Theme}> = ({n, zh, role, sub, en}) => <g>
	<rect width={SW} height={TITLE_H} fill="#1B2652" /><rect y={TITLE_H - 5} width={SW} height={5} fill="#D8A845" /><rect y={TITLE_H - 9} width={SW} height={2} fill="#EC6A3E" />
	<Tx x={34} y={50} t={`${zh} · ${role}`} size={40} fill="#F4E8CC" w={900} /><Tx x={36} y={79} t={sub} size={19} fill="#F8D97A" w={600} />
	<Tx x={SW - 34} y={50} t={en} size={30} fill="#F8D97A" w={600} anchor="end" italic /><Tx x={SW - 34} y={80} t={`№ ${String(n).padStart(2, '0')} / ${SHEET_COUNT} · 古埃及神话故事 · 角色设定表 · 骨架 ep60 / 演员 ep61`} size={15} fill="#B8C4F2" w={500} anchor="end" />
</g>;

/* ---------------- cells ---------------- */
const CellView: React.FC<{c: Cell; k: Slot; cfg: CharCfg; sc: number}> = ({c, k, cfg, sc}) => {
	if (c.custom) return <>{c.custom(k)}</>;
	const who = c.who ?? cfg.who, s = c.s ?? sc;
	return <Actor id={k.id} who={who} pose={c.pose!} x={k.x + k.w / 2 + (c.dx ?? (c.label.includes('跪') ? -16 : 0))} y={k.gy} s={s} {...c.o} pivots={c.pivots} />;
};
const CellRow: React.FC<{cells: Cell[]; x0: number; y0: number; w: number; h: number; gap: number; th: Theme; cfg: CharCfg; s: number; tag: string; lab: number}> = ({cells, x0, y0, w, h, gap, th, cfg, s, tag, lab}) => {
	const cw = (w - gap * (cells.length - 1)) / cells.length;
	return <g>{cells.map((c, i) => { const x = x0 + i * (cw + gap), k: Slot = {x, y: y0, w: cw, h, gy: y0 + h - lab - 8, id: `${cfg.key}-${tag}${i}`, th, s};
		return <g key={i}><svg x={x} y={y0} width={cw} height={h} viewBox={`${x} ${y0} ${cw} ${h}`} overflow="hidden"><rect x={x} y={y0} width={cw} height={h} fill={th.dark ? '#16205A' : '#F7EBCB'} opacity={0.0} />
			<Ground x0={x + 4} x1={x + cw - 4} y={k.gy} th={th} /><CellView c={c} k={k} cfg={cfg} sc={s} /></svg>
			<Tx x={x + cw / 2} y={y0 + h - 7} t={c.label} size={c.label.length > 14 ? 12.5 : 14} fill={th.text} w={800} anchor="middle" /></g>; })}</g>;
};
const FaceRow: React.FC<{cells: FaceCell[]; x0: number; y0: number; w: number; h: number; th: Theme; cfg: CharCfg}> = ({cells, x0, y0, w, h, th, cfg}) => {
	const gap = 8, cw = (w - gap * (cells.length - 1)) / cells.length, s = cfg.faceS ? cfg.faceS * 0.85 : 28;
	return <g>{cells.map((c, i) => { const who = c.who ?? cfg.who, [fx, fy] = headAt(who, c.pose, s, cw, h, cfg.focus), x = x0 + i * (cw + gap);
		return <Crop key={i} x={x} y={y0} w={cw} h={h} th={th} label={c.label}>{() => <Actor id={`${cfg.key}-f${i}`} who={who} pose={c.pose} x={fx} y={fy} s={s} {...c.o} look={c.look} />}</Crop>; })}</g>;
};
const figAt = (who: string, pose: Pose, s: number, w: number, h: number): V => { const q = ap(solve(pose, bodyOf(who)).torso, [0, -3.6]); return [w / 2 - s * q[0], h / 2 - s * q[1]]; };
const PartRow: React.FC<{parts: Part[]; x0: number; y0: number; w: number; h: number; th: Theme; cfg: CharCfg}> = ({parts, x0, y0, w, h, th, cfg}) => {
	const gap = 8, cw = (w - gap * (parts.length - 1)) / parts.length;
	return <g>{parts.map((p, i) => { const who = p.who ?? cfg.who, s = p.s ?? 19, x = x0 + i * (cw + gap);
		const [fx, fy] = p.fig ? figAt(who, p.pose, p.s ?? 8, cw, h - 8) : headAt(who, p.pose, s, cw, h - 8, p.focus ?? [cfg.focus[0], -1.3]);
		return <Crop key={i} x={x} y={y0} w={cw} h={h} th={th} label={p.label}>{() => <Actor id={`${cfg.key}-q${i}`} who={who} pose={p.pose} x={fx} y={fy} s={s} {...p.o} look={p.look} />}</Crop>; })}</g>;
};

/* ---------------- the standard character sheet ---------------- */
const MX = 24, MY = 112, MW = 640, MH = 590, RX = 680, RW = 736;
export const CharSheet: React.FC<{cfg: CharCfg}> = ({cfg}) => {
	const th = cfg.dark ? DARK : LIGHT, gy = MY + MH - 76, cx = MX + 321, s = cfg.main.s;
	const [ref, bb] = useTop();
	const m = cfg.main, mainWho = m.who ?? cfg.who, female = CAST61[mainWho] ? bodyOf(mainWho) : false;
	const slot: Slot = {x: MX, y: MY, w: MW, h: MH, gy, id: `${cfg.key}-main`, th, s};
	const ex = cfg.key === 'atum' ? {who: 'ra', dx: 82} : null, mainDx = ex ? -82 : m.dx ?? 0;
	const targets = cfg.notes.map((n) => { const w2 = n.on === 2 && ex ? ex.who : mainWho, dx = n.on === 2 && ex ? ex.dx : mainDx, fem = CAST61[w2] ? bodyOf(w2) : false;
		const to: V = n.abs ?? (n.bone && n.p ? at(m.pose ?? REST, cx + dx, gy, s, 1, n.bone, n.p, fem) : [cx, gy - 200]);
		return {t: n.t, d: n.d, src: n.src, to, side: n.side}; });
	const topU = bb ? (gy - bb.top) / s : 0, aniY = gy - ANI_TOP * s;
	return <SheetBg th={th}>
		<Title n={cfg.n} zh={cfg.zh} role={cfg.role} sub={cfg.sub} en={cfg.en} th={th} />
		<Panel x={MX} y={MY} w={MW} h={MH} th={th} title="主视图 · 头侧面 / 肩正面（埃及正统画法）" />
		<Ground x0={MX + 8} x1={MX + MW - 8} y={gy} th={th} />
		{/* ruler: grid units, Ani's crown line (19), the figure's own top */}
		{!m.custom && <g>{[0, 5, 10, 15, 20, 25].map((u) => <g key={u}><line x1={206} x2={217} y1={gy - u * s} y2={gy - u * s} stroke={th.sub} strokeWidth={1.2} opacity={0.85} /><Tx x={202} y={gy - u * s + 4} t={String(u)} size={12} fill={th.sub} w={700} anchor="end" /></g>)}
			<line x1={206} x2={206} y1={gy} y2={gy - 25 * s} stroke={th.sub} strokeWidth={1.2} opacity={0.7} />
			<line x1={206} x2={492} y1={aniY} y2={aniY} stroke={th.accent} strokeWidth={1.4} strokeDasharray="7 5" opacity={0.9} />
			<Tx x={214} y={aniY + 15} t={`阿尼头顶 = ${ANI_TOP.toFixed(1)} 格`} size={12.5} fill={th.accent} w={900} /></g>}
		{m.custom ? <>{m.custom(slot)}</> : <>
			<g ref={ref}><Actor id={`${cfg.key}-m`} who={mainWho} pose={m.pose ?? REST} x={cx + mainDx} y={gy} s={s} {...m.o} /></g>
			{ex && <Actor id={`${cfg.key}-m2`} who={ex.who} pose={m.pose ?? REST} x={cx + ex.dx} y={gy} s={s} /> }</>}
		{bb && !m.custom && <g><line x1={206} x2={cx + 150} y1={bb.top} y2={bb.top} stroke={th.dark ? '#F8D97A' : '#2F7F54'} strokeWidth={1.4} strokeDasharray="3 4" /><Tx x={300} y={bb.top - 5} t={`含冠总高 ${topU.toFixed(1)} 格`} size={12.5} fill={th.dark ? '#F8D97A' : '#2F7F54'} w={900} /></g>}
		<Callouts items={targets} th={th} cx={cx} xL={MX + 10} xR={MX + MW - 168} bw={158} y0={MY + 14} y1={MY + MH - 70} />
		<Lines x={MX + 14} y={MY + MH - 46} lines={wrap(`身高：${cfg.height}`, 44).concat(wrap(`关节：${cfg.joints}`, 44))} size={13.5} lh={1.32} fill={th.text} w={700} />
		{/* colour palette (hex read from the code's PAL / cast colours) */}
		<Panel x={MX} y={718} w={MW} h={palHeight(cfg.pal.length) + 30} th={th} title="色板（取自代码 PAL / cast 颜色）" />
		<Palette x={MX + 10} y={738} w={MW - 20} items={cfg.pal} th={th} />
		<Panel x={MX} y={718 + palHeight(cfg.pal.length) + 44} w={MW} h={SH_ - 12 - (718 + palHeight(cfg.pal.length) + 44)} th={th} title="必须 / 不要" />
		<Rules x={MX + 4} y={718 + palHeight(cfg.pal.length) + 56} w={MW - 8} must={cfg.must} dont={cfg.dont} th={th} size={16} />
		{/* right column */}
		<Panel x={RX} y={MY} w={RW} h={330} th={th} title="关键姿势 · 来自骨架（静 / 走 / 标志动作）" />
		<CellRow cells={cfg.poses} x0={RX + 8} y0={MY + 12} w={RW - 16} h={314} gap={8} th={th} cfg={cfg} s={11.2} tag="p" lab={22} />
		<Panel x={RX} y={452} w={RW} h={246} th={th} title="关节 / 动作 · 三个压力姿势（红点 = 枢轴，虚线 = 骨链）" />
		<CellRow cells={cfg.stress} x0={RX + 8} y0={464} w={RW - 16} h={230} gap={8} th={th} cfg={cfg} s={7.7} tag="s" lab={22} />
		{cfg.faces.length > 0 && <><Panel x={RX} y={708} w={RW} h={230} th={th} title="头部特写 · 三种表情（只画骨架真能做的）" />
			<FaceRow cells={cfg.faces} x0={RX + 8} y0={720} w={RW - 16} h={212} th={th} cfg={cfg} />
			<Panel x={RX} y={948} w={RW} h={120} th={th} title={cfg.partsTitle} />
			<PartRow parts={cfg.parts} x0={RX + 8} y0={956} w={RW - 16} h={106} th={th} cfg={cfg} /></>}
		{cfg.faces.length === 0 && <><Panel x={RX} y={708} w={RW} h={360} th={th} title="特写 · 张口 / 怒吼 · 下颌枢轴" />
			<AmmitHeads x={RX + 8} y={720} w={RW - 16} h={342} th={th} /></>}
	</SheetBg>;
};

/* ---------------- Ammit close-ups ---------------- */
import {Ammit61 as Ammit2} from './ammit61';
import {AMMIT_REST} from '../qq60/rig60';
const AmmitHeads: React.FC<{x: number; y: number; w: number; h: number; th: Theme}> = ({x, y, w, h, th}) => {
	const gap = 8, cw = (w - gap * 2) / 3, st = [{l: '闭口 5°', jaw: 5, roar: 0}, {l: '半张 24°', jaw: 24, roar: 0}, {l: '怒吼 46° · 鬃毛竖起', jaw: 5, roar: 1}], s = 27;
	return <g>{st.map((a, i) => <Crop key={i} x={x + i * (cw + gap)} y={y} w={cw} h={h} th={th} label={a.l}>{() =>
		<Ammit2 id={`am-h${i}`} pose={{...AMMIT_REST, jaw: a.jaw}} roar={a.roar} x={cw / 2 - 6.2 * s} y={h / 2 + 4.6 * s} s={s} t={0.5} look={0.6} />}</Crop>)}</g>;
};

/* ---------------- 01 line-up ---------------- */
const LINEUP: {who: string; zh: string; pose?: Pose; o?: ActorOpts}[] = [
	{who: 'atum', zh: '阿图姆'}, {who: 'ra', zh: '拉'}, {who: 'shu', zh: '舒'}, {who: 'tefnut', zh: '泰芙努特', o: {dress: 'sheath'}}, {who: 'geb', zh: '盖布'}, {who: 'nut', zh: '努特', pose: restF(), o: {bProp: 'none', fProp: 'none'}},
	{who: 'osiris', zh: '奥西里斯', pose: {...walkPose(0, {}), lean: 0}}, {who: 'isis', zh: '伊西斯', o: {wings: false}}, {who: 'set', zh: '赛特', o: {sneer: 1}}, {who: 'nephthys', zh: '奈芙蒂斯', pose: restF(), o: {bProp: 'none', fProp: 'none'}},
	{who: 'horus', zh: '荷鲁斯'}, {who: 'anubis', zh: '阿努比斯'}, {who: 'thoth', zh: '托特'}, {who: 'sekhmet', zh: '塞赫迈特', o: {dress: 'sheath'}}, {who: 'bastet', zh: '巴斯特'}, {who: 'maat', zh: '玛阿特', o: {wings: false}}, {who: 'ani', zh: '阿尼（凡人）'}];
export const LineUp: React.FC = () => {
	const th = LIGHT, s = 11, gy = 520, step = 78, x0 = 54, refs = useRef<(SVGGElement | null)[]>([]), [tops, setTops] = useState<number[] | null>(null), [h] = useState(() => delayRender('lineup'));
	useLayoutEffect(() => { setTops(refs.current.map((r) => (r ? r.getBBox().y : gy))); continueRender(h); }, [h]);
	const pose = (i: number) => LINEUP[i].pose ?? (LINEUP[i].who === 'osiris' ? BY('osiris').main.pose! : REST);
	return <SheetBg th={th}>
		<Title n={1} zh="总排 · 身高对照" role="全体神 + 凡人" sub="同一副骨架、同一比例尺：男身 = 凡人 × 1.00，女身 × 0.94，头饰另算" en="Line-up" th={th} />
		<Panel x={24} y={112} w={1392} h={450} th={th} title="并排 · 同一地平线 · 同一比例尺（s = 11 px/格）" />
		<g>{[0, 5, 10, 15, 20, 25].map((u) => <g key={u}><line x1={44} x2={1400} y1={gy - u * s} y2={gy - u * s} stroke={th.sub} strokeWidth={0.9} strokeDasharray="2 6" opacity={0.8} /><Tx x={40} y={gy - u * s - 3} t={String(u)} size={12} fill={th.sub} w={700} /></g>)}
			<line x1={44} x2={1400} y1={gy - ANI_TOP * s} y2={gy - ANI_TOP * s} stroke={th.accent} strokeWidth={1.6} strokeDasharray="8 6" /><Tx x={60} y={150} t={`红色虚线 = 阿尼头顶（含假发）= ${ANI_TOP.toFixed(1)} 格 = 男身基准线（女身 × 0.94）；灰点线每 5 格；名字下的数字 = 含头饰总高`} size={15} fill={th.accent} w={900} /></g>
		<Ground x0={30} x1={1410} y={gy} th={th} />
		{LINEUP.map((l, i) => { const x = x0 + 18 + i * step, ani = l.who === 'ani'; return <g key={l.who}><g ref={(r) => { refs.current[i] = r; }}><Actor id={`lu${i}`} who={l.who} pose={pose(i)} x={x} y={gy} s={s} {...l.o} /></g>
			<Tx x={x} y={gy + 24} t={l.zh} size={l.zh.length > 4 ? 12.5 : 15} fill={ani ? th.accent : th.text} w={900} anchor="middle" />
			{tops && <Tx x={x} y={gy + 42} t={`${((gy - tops[i]) / s).toFixed(1)} 格`} size={12} fill={th.sub} w={700} anchor="middle" />}</g>; })}
		<Panel x={24} y={578} w={1392} h={176} th={th} title="脸的索引 · 同一比例尺的头部（认人用）" />
		{LINEUP.map((l, i) => { const w = 76, x = 36 + i * 81, hs = 15, [fx, fy] = headAt(l.who, pose(i), hs, w, 128, [l.who === 'osiris' || l.who === 'horus' || l.who === 'atum' ? 0.6 : 0.9, -1.75]);
			return <Crop key={l.who} x={x} y={592} w={w} h={150} th={th}>{() => <Actor id={`luh${i}`} who={l.who} pose={pose(i)} x={fx} y={fy + 10} s={hs} {...l.o} />}</Crop>; })}
		<Panel x={24} y={770} w={1392} h={298} th={th} title="身高规则（全系列统一，新集必须照做）" />
		<Lines x={44} y={808} lines={[
			'● 骨架：神与凡人（阿尼）共用 ep60 的同一副骨架（脚底 0、膝 6、髋 9.5、肩 16，19 方格网）；阿尼连假发实测 20.0 格（男身站得宽，比 ep60 的 20.1 低 0.1）。',
			'● 男身（rig60 BODY.m）= 凡人 × 1.00：宽肩、胸肌轮廓线（不画乳点）/ 三角肌 / 二头肌、粗颈、细腰 V 形躯干、壮小腿；短裙 + 腰带 + 前垂、臂环；站得宽、步子大；握拳、握紧权杖。',
			'● 女身（BODY.f）= × 0.94：肩宽 ≈ 男身 80%、细臂、小手小脚、长颈、细腰与柔和的臀线；及踝紧身长裙一直盖到宽领下，胸前是一条平顺的线（不画胸形）、深宽领、长垂发；双脚靠拢、步子小；空手时手掌张开。',
			'● 神靠头、头饰和手里的东西来认；含头饰总高是渲染后量出来的（名字下的数字，÷20.0 = 倍数）。',
			'● 例外：孩童荷鲁斯 ×0.75；特写整体放大；阿米特是独立小骨架（右下）；奥西里斯木乃伊形但保留宽肩，双手从裹布里伸出、交叉在胸前握住弯钩与连枷；总排里伊西斯、玛阿特收起了翅膀。'].flatMap((t) => wrap(t, 54)).slice(0, 13)} size={15} lh={1.38} fill={th.text} w={600} />
		<g><Actor id="lu-ani2" who="ani" pose={REST} x={1040} y={1050} s={9.6} /><Ammit2 id="lu-am" pose={{...AMMIT_REST, jaw: 5}} x={1215} y={1050} s={13} t={0.5} look={0.6} />
			<Tx x={1040} y={1066} t="阿尼" size={13} fill={th.accent} w={900} anchor="middle" /><Tx x={1300} y={1066} t="阿米特（ep60 称重厅 s34 : s26）" size={13} fill={th.text} w={800} anchor="middle" /></g>
	</SheetBg>;
};

/* ---------------- 19 props ---------------- */
const PropCell: React.FC<{x: number; y: number; w: number; h: number; zh: string; en: string; note: string; src: string; th: Theme; children: React.ReactNode}> = ({x, y, w, h, zh, en, note, src, th, children}) => <g>
	<rect x={x} y={y} width={w} height={h} rx={6} fill={th.panel} stroke={th.line} strokeWidth={2} />
	<svg x={x} y={y} width={w} height={h - 92} viewBox={`0 0 ${w} ${h - 92}`} overflow="hidden">{children}</svg>
	<line x1={x + 10} x2={x + w - 10} y1={y + h - 92} y2={y + h - 92} stroke={th.line} strokeWidth={1.2} />
	<Tx x={x + 12} y={y + h - 70} t={zh} size={20} fill={th.accent} w={900} /><Tx x={x + w - 12} y={y + h - 71} t={en} size={13} fill={th.sub} w={600} anchor="end" italic />
	<Lines x={x + 12} y={y + h - 50} lines={wrap(note, (w - 24) / 12.6).slice(0, 2)} size={12.6} lh={1.28} fill={th.text} w={600} />
	<Lines x={x + 12} y={y + h - 20} lines={wrap(src, (w - 24) / 10.6).slice(0, 2)} size={10.6} lh={1.25} fill={th.sub} w={600} /></g>;
const PC = {OW: 2.7 / 40, LW: 1.5 / 40};
export const PropsSheet: React.FC = () => {
	const th = LIGHT, cw = 270, ch = 344, gx = 10, x0 = 24, y0 = 116, y1 = y0 + ch + 12;
	const cell = (i: number) => ({x: x0 + (i % 5) * (cw + gx), y: i < 5 ? y0 : y1, w: cw, h: ch});
	const hold = (who: string, pose: Pose, o: ActorOpts, bone: keyof Rig, p: V, s: number, id: string, w = 130, h = 120) => { const q = ap(solve(pose, bodyOf(who))[bone], p); return <Crop x={0} y={0} w={w} h={h} th={th}>{() => <Actor id={id} who={who} pose={pose} x={w / 2 - s * q[0]} y={h / 2 - s * q[1]} s={s} {...o} />}</Crop>; };
	const items: {zh: string; en: string; note: string; src: string; node: React.ReactNode}[] = [
		{zh: '坛形心脏', en: 'jar heart', note: '红色坛形心脏，口沿金；怀疑 / 称重时会跳动、发光（Heart60 / GlowHeart）', src: '系列设计 · ep60 facts F11/F15 + 心脏象形 ib', node: <g><Heart60 x={cw / 2 - 62} y={150} h={118} beat={0.3} id="pr-h1" /><GlowHeart x={cw / 2 + 66} y={222} s={62} glow={0.8} /></g>},
		{zh: '玛阿特羽毛', en: "Ma'at's feather", note: '一根窄而直的鸵鸟羽，根部蓝带；秤右盘与头顶共用同一形（3.2 格）', src: 'I16 · Louvre E 4436 · BM EA9901/3', node: <g transform={`translate(${cw / 2 + 6},236) scale(64)`}><Feather c={{OW: 2.7 / 64, LW: 1.5 / 64}} h={3.2} /></g>},
		{zh: '天平', en: 'the balance', note: '左盘心、右盘羽；立柱 + 横梁 + 铅锤；阿努比斯跪着调铅锤', src: 'F31/F32 · BM EA9901/3、EA10470/3', node: <Balance2 p={{tilt: 3, plumb: -0.4, heartDy: 0, featherDy: 0}} x={cw / 2} y={288} s={9.6} t={0.5} />},
		{zh: '生命符 ankh', en: 'ankh', note: '金色，环孔透出底色；握在拳里，握法 = 手指在柄前', src: 'I1 · I9 · Louvre E 3374（tient un signe ânkh）', node: <g transform={`translate(${cw / 2},96) scale(52)`}><Ankh at={[0, 0]} s={1} c={{OW: 2.7 / 52, LW: 1.5 / 52}} /></g>},
		{zh: '权杖 was', en: 'was-sceptre', note: '杖头是 Set 兽头，杖身青金节，叉形杖脚立在地上', src: 'I9 · Met 25.3.284h · I1', node: <g transform={`translate(${cw / 2 - 30},244) scale(34)`}><Was at={[0.9, 0]} top={-6.3} c={{OW: 2.7 / 34, LW: 1.5 / 34}} /></g>},
		{zh: '弯钩 · 连枷', en: 'crook & flail', note: '金身蓝节；弯钩在钩、连枷三串珠会摆（secondary motion）', src: 'I7 · Met 96.4.4 · 30.3.31', node: <g><g transform={`translate(${cw / 2 - 54},196) scale(44)`}><Crook at={[0, 0]} a={4} c={{OW: 2.7 / 50, LW: 1.5 / 50}} /></g><g transform={`translate(${cw / 2 + 58},190) scale(32)`}><Flail at={[0, 0]} a={-8} c={{OW: 2.7 / 34, LW: 1.5 / 34}} t={0.6} /></g></g>},
		{zh: '叉铃', en: 'sistrum', note: '金柄 + 环形框 + 三根会晃的横条；握在拳里摇动', src: 'I15 · Met 04.2.425（sistrum）', node: <g transform={`translate(${cw / 2},196) scale(44)`}><Sistrum at={[0, 0]} c={{OW: 2.7 / 44, LW: 1.5 / 44}} t={0.4} /></g>},
		{zh: '托特的调色板与笔', en: 'palette & pen', note: '长调色板：红 / 黑墨池 + 笔槽；芦苇笔斜握，笔尖点在板上', src: 'I13 · Louvre N 2609（palette de scribe）', node: <g><g transform={`translate(${cw / 2},110) scale(66) rotate(-8)`}><ScribePalette m={[1, 0, 0, 1, 0, 0]} c={{OW: 2.7 / 66, LW: 1.5 / 66}} /></g><g transform={`translate(${cw / 2 + 4},180) rotate(-62) scale(52)`}><g transform="translate(0,0)"><path d="M-0.06 -1.25L0.06 -1.25L0.06 1.15L0 1.4L-0.06 1.15Z" fill={PAL.wood} stroke={PAL.ink} strokeWidth={1.5 / 60} /><path d="M-0.065 1.08L0.065 1.08L0 1.4Z" fill={PAL.black} /></g></g></g>},
		{zh: '心脏圣甲虫', en: 'heart scarab', note: '绿石圣甲虫，翻面是 30B 咒文：“心啊，不要作证反对我”', src: 'ep60 facts F16–F20 · Met 550986 · BM EA7876', node: <g><HeartScarab x={cw / 2 - 62} y={126} s={14.5} flip={0} id="pr-s0" /><HeartScarab x={cw / 2 + 62} y={126} s={14.5} flip={1} lines={1} id="pr-s1" /></g>},
		{zh: '正面面具', en: 'MaskFront (Anubis)', note: '阿努比斯正面：金面具、青金耳、条纹垂片；ep60 开场用', src: 'I12 · Met 38.5 · ep60 act60a_kit', node: <g><GoldDefs id="prm" /><MaskFront x={cw / 2} y={118} s={27} t={0.3} id="prm" /></g>}];
	return <SheetBg th={th}>
		<Title n={19} zh="道具表" role="手里的东西" sub="心脏 · 羽毛 · 天平 · ankh · was · 弯钩连枷 · 叉铃 · 调色板 · 圣甲虫" en="Props" th={th} />
		{items.map((it, i) => { const c = cell(i); return <PropCell key={i} {...c} zh={it.zh} en={it.en} note={it.note} src={it.src} th={th}>{it.node}</PropCell>; })}
		<Panel x={24} y={y1 + ch + 26} w={1392} h={SH_ - 12 - (y1 + ch + 26)} th={th} title="握法 · 手在物体上（拳头盖在物体前面，手指绕杆；无指甲）" />
		{[{who: 'anubis', pose: REST, bone: 'bH' as keyof Rig, p: [0.0, 1.9] as V, o: {}, l: 'ankh · 后手'}, {who: 'horus', pose: REST, bone: 'fH' as keyof Rig, p: [0.2, 0.8] as V, o: {}, l: 'was · 前手'}, {who: 'osiris', pose: BY('osiris').main.pose!, bone: 'fH' as keyof Rig, p: [0.2, 0.6] as V, o: {}, l: '弯钩 + 连枷 · 胸前'}, {who: 'bastet', pose: BY('bastet').main.pose!, bone: 'fH' as keyof Rig, p: [0.2, 0.6] as V, o: {}, l: '叉铃 · 摇'}, {who: 'thoth', pose: BY('thoth').poses[2].pose!, bone: 'fH' as keyof Rig, p: [0.2, 0.9] as V, o: {bProp: 'palette' as const, fProp: 'pen' as const}, l: '笔 · 前手 / 调色板 · 后手'}].map((h, i) => {
			const w = 262, x = 34 + i * (w + 8), q = ap(solve(h.pose, bodyOf(h.who))[h.bone], h.p), s = 30, ww = w, hh = SH_ - 12 - (y1 + ch + 26) - 56;
			return <g key={i}><Crop x={x} y={y1 + ch + 40} w={ww} h={hh} th={th} label={h.l}>{() => <Actor id={`pr-hold${i}`} who={h.who} pose={h.pose} x={ww / 2 - s * q[0]} y={hh / 2 - s * q[1]} s={s} {...h.o} />}</Crop></g>; })}
	</SheetBg>;
};

/* ---------------- composition: SHEETS61 ---------------- */
const SHEETS: React.FC[] = [LineUp, ...CHARS.map((c) => () => <CharSheet cfg={c} />), PropsSheet];
export const Sheets61: React.FC = () => { const f = useCurrentFrame(), S = SHEETS[Math.min(SHEETS.length - 1, f)]; return <S />; };

/* ---------------- composition: RIGTEST61 — every character through walk → signature → stress poses → expressions (6 s each) ---------------- */
const SEC = 6, FPS = 30, N_CHARS = CHARS.length;
const mix = (a: number | undefined, b: number | undefined, u: number) => lerp(a ?? 0, b ?? 0, u);
const mixLook = (a: Look | undefined, b: Look | undefined, u: number): Look => ({eyes: mix(a?.eyes, b?.eyes, u), look: mix(a?.look ?? 0.2, b?.look ?? 0.2, u), brow: mix(a?.brow, b?.brow, u), smile: mix(a?.smile, b?.smile, u), mouth: mix(a?.mouth, b?.mouth, u)});
const mixOpts = (a: ActorOpts | undefined, b: ActorOpts | undefined, u: number): ActorOpts => ({jaw: mix(a?.jaw, b?.jaw, u), roar: mix(a?.roar, b?.roar, u), ear: mix(a?.ear, b?.ear, u), sneer: mix(a?.sneer, b?.sneer, u)});
const ease = (u: number) => sm(cl(u));
export const RigTest: React.FC = () => {
	const f = useCurrentFrame(), i = Math.min(N_CHARS - 1, Math.floor(f / (SEC * FPS))), t = (f - i * SEC * FPS) / FPS, cfg = CHARS[i], th = cfg.dark ? DARK : LIGHT;
	const sigCell = cfg.rig ? {pose: cfg.rig.pose, label: cfg.rig.label, o: cfg.rig.o} : [cfg.poses[2], cfg.poses[3], cfg.stress[0]].find((c) => c.pose) ?? cfg.stress[0];
	const base = cfg.poses[0].pose ?? REST, sig = sigCell.pose ?? S_RAISE, sigO = sigCell.o, st = cfg.stress.map((c) => c.pose ?? REST), stO = cfg.stress.map((c) => c.o);
	const who = cfg.who, mainO = cfg.poses[0].o, armK = who && CAST61[who]?.base.body === 'f' ? 0.6 : 1; // goddesses: soft arm swing (the short stride is the body's)
	const mummy = cfg.key === 'osiris', isAmmit = cfg.key === 'ammit';
	let pose: Pose = base, o: ActorOpts = {...mainO}, seg = isAmmit ? '站 → 嗅 → 抬爪 → 怒吼 → 后坐（循环）' : '走 · 步行循环', pivots = false;
	const ph = t * 5.6;
	if (t < 1.8) { pose = mummy ? {...base, lean: 3 * Math.sin(ph), head: 6 * Math.sin(ph * 0.5)} : walkPose(ph, {arm: armK}); pivots = true; }
	else if (t < 2.0) { pose = lerpPose(walkPose(1.8 * 5.6, {arm: armK}), base, ease((t - 1.8) / 0.2)); seg = '收步'; }
	else if (t < 3.4) { const u = t < 2.4 ? ease((t - 2.0) / 0.4) : t < 3.0 ? 1 : 1 - ease((t - 3.0) / 0.4); pose = lerpPose(base, sig, u); o = {...mainO, ...mixOpts(undefined, sigO, u), ...(u > 0.5 ? {wings: sigO?.wings ?? mainO?.wings} : {})}; seg = '标志动作：' + sigCell.label.replace(/（.*）/, ''); pivots = true; if (sigO?.basket !== undefined) o.basket = sigO.basket; if (sigO?.fProp) o.fProp = u > 0.5 ? sigO.fProp : mainO?.fProp; if (sigO?.bProp) o.bProp = u > 0.5 ? sigO.bProp : mainO?.bProp; if (sigO?.dress) o.dress = sigO.dress; }
	else if (t < 4.6) { const k = Math.min(2, Math.floor((t - 3.4) / 0.4)), u = ease(((t - 3.4) % 0.4) / 0.25), a = k === 0 ? sig : st[k - 1], b = st[k]; pose = lerpPose(a, b, u); o = {...mainO, ...mixOpts(k === 0 ? sigO : stO[k - 1], stO[k], u), ...(stO[k]?.wings !== undefined ? {wings: stO[k]!.wings} : {})}; seg = `压力姿势 ${k + 1}/3：${cfg.stress[k].label}`; pivots = true; if (stO[k]?.dress) o.dress = stO[k]!.dress; }
	else { const u0 = (t - 4.6) / 1.4, fr = cfg.faces; const e = u0 < 0.25 ? 0 : u0 < 0.6 ? 1 : 2, pu = ease(u0 < 0.25 ? u0 / 0.25 : u0 < 0.6 ? (u0 - 0.25) / 0.35 : (u0 - 0.6) / 0.4);
		const A = fr[e === 0 ? 0 : e - 1], B = fr[e];
		if (fr.length) { const fp = lerpPose(A.pose, B.pose, e === 0 ? 0 : pu); pose = {...base, lean: base.lean + (fp.lean - STAND0.lean), neck: fp.neck, head: fp.head}; o = {...mainO, ...mixOpts(A.o, B.o, e === 0 ? 0 : pu), look: mixLook(A.look, B.look, e === 0 ? 0 : pu)}; }
		seg = '表情：' + (e === 0 ? '平静' : e === 1 ? '愤怒 / 怒吼' : '满意'); }
	if (isAmmit) seg = '站 → 嗅 → 抬爪 → 怒吼 → 后坐（循环）';
	const looks = cfg.faces.length ? (o.look ?? {eyes: 0.5 * Math.max(0, Math.sin(t * 7)) ** 8 * 2, look: 0.2}) : undefined;
	const gy = 936, s = 26, cx = 330, tNow = t;
	const fw = 640, fh = 560, hs = cfg.faceS ? cfg.faceS * 2.0 : 70;
	const [hx, hy] = who && !isAmmit ? headAt(who, pose, hs, fw, fh, cfg.focus) : [0, 0];
	const ammitPose = (): {jaw: number; neck: number; lean: number; roar: number; paw: number; tail: number} => { const u = (t % 6) / 6; const k = (a: number[]) => a[Math.min(a.length - 1, Math.floor(u * a.length))];
		const seq = (vals: number[]) => { const x = u * (vals.length - 1), j = Math.floor(x); return lerp(vals[j], vals[Math.min(vals.length - 1, j + 1)], ease(x - j)); }; void k;
		return {jaw: seq([5, 5, 24, 5, 12, 5, 5]), neck: seq([0, 14, -4, -10, 0, -6, 0]), lean: seq([0, 3, 2, 0, -8, 8, 0]), roar: seq([0, 0, 0, 1, 1, 0, 0]), paw: seq([0, 0, 0, 0, 2.2, 0, 0]), tail: seq([0, 0, 0, 0, 10, 20, 0])}; };
	const am = isAmmit ? ammitPose() : null;
	return <SheetBg th={th}>
		<Title n={cfg.n} zh={cfg.zh} role="关节测试 · 骨架动起来" sub={`${seg}　（红点 = 关节枢轴）`} en={cfg.en} th={th} />
		<Panel x={24} y={112} w={640} h={944} th={th} title="全身 · 关节在动" />
		<Ground x0={32} x1={656} y={gy} th={th} />
		{t < 1.8 && Array.from({length: 14}, (_, j) => { const x = ((j * 52 - t * 5.6 * 9.6 / (2 * Math.PI) * s * 0.95) % 728 + 728) % 728; return <line key={j} x1={32 + x * 0.85} x2={32 + x * 0.85 + 18} y1={gy + 16} y2={gy + 16} stroke={th.sub} strokeWidth={3} opacity={0.5} />; })}
		{isAmmit && am ? <Ammit2 id="rt-am" pose={{...AMMIT_REST, jaw: am.jaw, neck: am.neck, lean: am.lean, paw: am.paw, tail: am.tail}} roar={am.roar} x={344 - 2.4 * 38} y={gy} s={38} t={t} look={0.6} /> :
			<Actor id="rt" who={who} pose={pose} x={cx} y={gy} s={s} {...o} look={looks} pivots={pivots} t={tNow} />}
		<Panel x={680} y={112} w={736} h={600} th={th} title="头部特写" />
		{isAmmit && am ? <Crop x={692} y={124} w={712} h={576} th={th}>{() => <Ammit2 id="rt-amh" pose={{...AMMIT_REST, jaw: am.jaw, neck: am.neck, lean: am.lean}} roar={am.roar} x={356 - 6.2 * 62} y={288 + 4.6 * 62} s={62} t={t} look={0.6} />}</Crop> :
			<Crop x={692} y={124} w={712} h={576} th={th}>{() => <Actor id="rt-h" who={who} pose={pose} x={hx + 20} y={hy - 30} s={hs} {...o} look={looks} t={tNow} />}</Crop>}
		<Panel x={680} y={728} w={736} h={328} th={th} title="这一段在测什么" />
		<Lines x={700} y={768} lines={[`段落：${seg}`, `关节：${cfg.joints}`, '检查：关节处无缝、无断裂、无轮廓穿插；手握物体（拳盖在物体前）；重量落在脚上；动作符合解剖。', `时间：${t.toFixed(2)} s / 6 s　·　第 ${i + 1} / ${N_CHARS} 位`].flatMap((l) => wrap(l, 36))} size={19} lh={1.5} fill={th.text} w={600} />
	</SheetBg>;
};
const STAND0: Pose = {...REST, lean: 0, neck: 0, head: 0};

/* ---------------- root ---------------- */
registerRoot(() => <>
	<Composition id="SHEETS61" component={Sheets61} durationInFrames={SHEET_COUNT} fps={30} width={SW} height={SH_} />
	<Composition id="RIGTEST61" component={RigTest} durationInFrames={N_CHARS * SEC * FPS} fps={30} width={SW} height={SH_} />
	<Composition id="FACECHECK61" component={FaceCheck} durationInFrames={FACE_N} fps={30} width={SW} height={SH_} />
</>);
export {FC, God61, Eye, S_STEP, S_BACK, FACES, headFillOf, mx, Rig};
