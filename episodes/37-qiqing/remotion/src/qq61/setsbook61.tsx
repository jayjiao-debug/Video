import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Bands, Subtitle, FC, F_SERIF, PIC_T, PIC_B, FW, FH, Glow, Embers, Dust} from '../qq60/frame60';
import {PAL} from '../qq60/geo60';
import {POSES, reach, wristTo} from '../qq60/rig60';
import {gripOf, FistOver} from '../qq60/act60b_kit';
import {God61} from './cast61';
import {walkPose} from '../qq60/cast60';
import {ITEMS, CATS, Item, SRC} from './sets61';
import {SetDefs61, S61, Glyphs} from './sets61_kit';
import {Pylon, PylonSun, Column61, Architrave, Obelisk, SphinxAvenue, Naos61} from './sets61_arch';
import {Nile, PapyrusThicket, DatePalm, Dunes, NightSky, HorizonSun, SmokeCurl, BirdsCrossing, WaterShimmer, LightShafts, LotusPond} from './sets61_nature';
import {OfferingPile, IncenseStand, OilLamp, Brazier61, CanopicSet, Skiff61, BeerJars, Baskets, Chest61} from './sets61_props';
import {Falcon, Ibis, CrocWater, Geese, Cat61, Cobra, JackalShrine} from './sets61_animals';
import {PriestProcession, FanBearers} from './sets61_crowds';
import {Pyramids} from './sets61_arch';

/* ep61 · SET-DRESSING library — the book.
   SETS61     1440 × 1080, 6 frames: frame i = catalogue page i (建筑 / 自然 / 道具 / 动物 / 群众 / 氛围动效), drawn at t = 1.3 s.
   SCENE61    1440 × 1080, 3 frames: example scenes showing the layering (background / middle / foreground) behind the cast.
   SETSANIM61 1440 × 1080, 30 fps, 27 s: the 6 pages then the 3 scenes, 3 s each, everything moving.
   Render: see tasks/ep61-sets/result.md. */
const HEAD = 104, FOOT = 40, PAD = 18;
const T_STILL = 1.3;
/** rough text width in em: CJK = 1, latin = 0.55 */
const emW = (str: string) => [...str].reduce((a, ch) => a + (/[\u2E80-\u9FFF\uFF00-\uFFEF\u3000-\u303F]/.test(ch) ? 1 : 0.55), 0);
/** the largest font size ≤ max that fits the text in w px */
const fit = (str: string, w: number, max: number) => Math.min(max, w / Math.max(1, emW(str)));
/** wrap text to lines of at most w px at font size fs */
const wrapW = (str: string, w: number, fs: number): string[] => { const out: string[] = []; let cur = '';
	// tokens: one CJK character, or a run of latin / digits / symbols (kept whole), or spaces
	const toks = str.match(/[\u2E80-\u9FFF\uFF00-\uFFEF\u3000-\u303F]|[^\s\u2E80-\u9FFF\uFF00-\uFFEF\u3000-\u303F]+|\s+/g) ?? [];
	for (const tk of toks) { if (emW(cur + tk) * fs > w && cur.trim()) { out.push(cur.trimEnd()); cur = tk.trim() ? tk : ''; } else cur += tk; }
	if (cur.trim()) out.push(cur.trimEnd()); return out; };

/* ---------------- one catalogue page ---------------- */
const Cell: React.FC<{it: Item; x: number; y: number; w: number; h: number; t: number; n: number}> = ({it, x, y, w, h, t, n}) => {
	const m = 6, lab = 64, dx = x + m, dy = y + m, dw = w - 2 * m, dh = h - 2 * m, ax = dx + 10, ay = dy + 8, aw = dw - 20, ah = dh - lab - 12;
	const dark = !!it.dark;
	let art: React.ReactNode;
	if (it.px) art = it.draw(dx + dw / 2, dy + (dh - lab) / 2, Math.min(aw / 320, ah / 220), t);
	else { const [x0, x1, y0, y1] = it.box!, s = Math.min(aw / (x1 - x0), ah / (y1 - y0)), ox = ax + aw / 2 - ((x0 + x1) / 2) * s, oy = ay + ah / 2 - ((y0 + y1) / 2) * s;
		art = it.draw(ox, oy, s, t); }
	const cid = `cell-${it.key}`;
	return <g>
		<rect x={dx} y={dy} width={dw} height={dh} rx={6} fill={dark ? '#141C44' : '#F3E6C4'} stroke={dark ? '#D8A845' : '#B08F58'} strokeWidth={2} />
		<defs><clipPath id={cid}><rect x={dx + 2} y={dy + 2} width={dw - 4} height={dh - lab - 2} rx={5} /></clipPath></defs>
		<g clipPath={`url(#${cid})`}>{art}</g>
		<rect x={dx} y={dy + dh - lab} width={dw} height={lab} rx={0} fill={dark ? '#0B1230' : '#2A1912'} />
		<text x={dx + 10} y={dy + dh - lab + 22} fontSize={fit(String(n).padStart(2, '0') + ' ' + it.zh, dw - 20, 19)} fontWeight={900} fontFamily={F_SERIF} fill={dark ? '#F8D97A' : '#F4E8CC'}>
			<tspan fill={dark ? '#F08A5A' : '#ECB637'}>{String(n).padStart(2, '0')} </tspan>{it.zh}</text>
		<text x={dx + 10} y={dy + dh - lab + 40} fontSize={fit(it.en + ' · ' + it.key, dw - 20, 12.5)} fontWeight={600} fontFamily={F_SERIF} fill={dark ? '#B8C4F2' : '#D8C6A0'}>{it.en} · <tspan fill={dark ? '#F8D97A' : '#F2C649'}>{it.key}</tspan></text>
		<text x={dx + 10} y={dy + dh - 8} fontSize={fit('出处 ' + (SRC[it.src] ?? it.src) + ' [' + it.src + ']', dw - 20, 12.5)} fontWeight={600} fontFamily={F_SERIF} fill={dark ? '#F8D97A' : '#F2C649'}>出处 {SRC[it.src] ?? it.src} <tspan fill={dark ? '#B8C4F2' : '#D8C6A0'}>[{it.src}]</tspan></text>
	</g>;
};
export const Page: React.FC<{p: number; t: number}> = ({p, t}) => {
	const C = CATS[p], items = ITEMS.filter((i) => i.cat === C.cat), gw = FW - 2 * PAD, gh = FH - HEAD - FOOT - 2 * PAD + 8, cw = gw / C.cols, ch = gh / C.rows;
	const dark = C.cat === 'ambient', base = ITEMS.indexOf(items[0]);
	return <AbsoluteFill style={{background: dark ? '#0B1233' : PAL.plaster}}>
		<svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`}>
			<SetDefs61 />
			<rect width={FW} height={FH} fill={dark ? '#0B1233' : '#E8D4AA'} />
			<rect x={0} y={0} width={FW} height={HEAD - 8} fill={FC.lapis} /><rect x={0} y={HEAD - 12} width={FW} height={4} fill={FC.gold} />
			<text x={PAD + 4} y={52} fontSize={38} fontWeight={900} fontFamily={F_SERIF} fill={PAL.goldHi}>古埃及神话故事 · 布景库　<tspan fill="#F4E8CC">{C.zh}</tspan><tspan fontSize={24} fill="#B8C4F2">  {C.en}</tspan></text>
			<text x={PAD + 4} y={82} fontSize={15} fontWeight={600} fontFamily={F_SERIF} fill="#D8C6A0">第 {p + 1} / {CATS.length} 页 · SETS61 · 单位 = 角色格（阿尼 20.1 格高；同一个 s 与演员同比例）· 每件都由 t 驱动 · 出处全文见 episodes/61-zhongshen/setsbook.md</text>
			<text x={FW - PAD - 4} y={52} fontSize={20} fontWeight={900} fontFamily={F_SERIF} fill="#F4E8CC" textAnchor="end">src/qq61/sets61*.tsx</text>
			{items.map((it, i) => <Cell key={it.key} it={it} x={PAD + (i % C.cols) * cw} y={HEAD + PAD - 6 + Math.floor(i / C.cols) * ch} w={cw} h={ch} t={t} n={base + i + 1} />)}
			{items.length < C.cols * C.rows && (() => { const i = items.length, x = PAD + (i % C.cols) * cw + 6, y = HEAD + PAD - 6 + Math.floor(i / C.cols) * ch + 6, w = cw * (C.cols * C.rows - i) - 12, h = ch - 12;
				return <g><rect x={x} y={y} width={w} height={h} rx={6} fill="none" stroke={dark ? '#D8A845' : '#B08F58'} strokeWidth={1.5} strokeDasharray="6 5" />
					{(() => { let yy = y + 30; return LEGEND[C.cat].flatMap((l, k) => { const fs = k ? 14.5 : 18, ls = k ? wrapW(l, w - 32, fs) : [l];
						return ls.map((q, j) => { const el = <text key={`${k}.${j}`} x={x + 16 + (j ? 12 : 0)} y={yy} fontSize={fs} fontWeight={k ? 600 : 900} fontFamily={F_SERIF} fill={dark ? (k ? '#B8C4F2' : '#F8D97A') : (k ? '#4A3020' : '#962A16')}>{(k && !j ? '· ' : '') + q}</text>; yy += k ? 21 : 27; return el; }); }); })()}</g>; })()}
			<rect x={0} y={FH - FOOT + 6} width={FW} height={FOOT - 6} fill={FC.lapis} />
			<text x={FW / 2} y={FH - 12} fontSize={14} fontWeight={600} fontFamily={F_SERIF} fill="#D8C6A0" textAnchor="middle">墨线外轮廓 + 平涂（青金 · 金 · 赤陶 · 绿松石 · 纸草米白）· 原点 = 落地点中心 · 出处标签 = setsbook.md §2 的编号（Met / UNESCO / Louvre 记录）· “设计选择”= 无可考实物</text>
		</svg>
	</AbsoluteFill>;
};
const LEGEND: Record<string, string[]> = {
	arch: ['怎么用', '<Pylon x y s t />：x,y = 落地点中心（px），s = px/格', '与演员同一个 s 即同比例；柱子 h=18 格 ≈ 0.9 个人高', 'PylonSun 画在 Pylon 之后（门楣上的有翼日轮）', '动：旗杆三角旗 · 门内火光 · 神龛灯 · 假门里的卡之光'],
	nature: ['怎么用', '条带（河、天、沙丘）：x = 中心，y = 上沿 / 水线', 'w, h 用格；天空先画，水最后画在地平线上', '动：水纹漂流 · 纸草与棕榈随风 · 莲花开合', '星星闪 · 流星 · 扬沙 · 日出日落（rise 0..1）'],
	props: ['怎么用', '原点 = 地面中心；香炉/火盆/灯自带火焰与烟', '火光要照亮周围：外加 Glow（frame60）', '动：火焰 · 烟 · 火星 · 莲花点头 · 棋子跳格', '叉铃摇响 · 羽扇摆 · 纸草边卷 · 船随水摇'],
	animals: ['怎么用', '小而次要：一般 s ≈ 演员 s 的 0.6–1', '全部面向 +x，flip = -1 镜像；seed 错开节奏', '动：隼转头 · 朱鹮啄水 · 猫甩尾眨眼', '蛇膨颈吐信 · 甲虫推球 · 鳄鱼滑行 · 雁扇翅'],
	crowds: ['怎么用（同一副 ep60 骨架）', 'n 人一排，原点 = 领头者脚下；gap = 间距（格）', 'march = 每秒前进格数（0 = 原地走）', '每个人有自己的相位：永远不会整齐划一', 'seed 换一组节奏；face = -1 朝左'],
	ambient: ['怎么用', '这些是 px 空间的叠加层：画在场景最上层', 'FlameFx / SmokeCurl / DustMotes / Sparks', 'BirdsCrossing / WaterShimmer / LightShafts', '需要 <SetDefs61 />（或 Stage60）提供光晕渐变'],
};

/* ---------------- example scenes ---------------- */
const GY = 868;
const LayerKey: React.FC<{rows: [string, string][]; title: string}> = ({rows, title}) => <g transform={`translate(${FW - 470},${PIC_T + 16})`}>
	<rect x={0} y={0} width={454} height={34 + rows.length * 22} rx={6} fill="#0B1230" opacity={0.82} stroke="#D8A845" strokeWidth={1.5} />
	<text x={12} y={24} fontSize={18} fontWeight={900} fontFamily={F_SERIF} fill="#F8D97A">{title}</text>
	{rows.map(([k, v], i) => <text key={i} x={12} y={50 + i * 22} fontSize={13.5} fontWeight={600} fontFamily={F_SERIF} fill="#E8DCC0"><tspan fill={k === '前景' ? '#F08A5A' : k === '中景' ? '#8FCBFF' : '#B8C4F2'} fontWeight={900}>{k} </tspan>{v}</text>)}
</g>;
const Pic: React.FC<{children: React.ReactNode; bg: string}> = ({children, bg}) => <svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{position: 'absolute', inset: 0}}>
	<SetDefs61 />
	<defs><clipPath id="scene-pic"><rect x={0} y={PIC_T} width={FW} height={PIC_B - PIC_T} /></clipPath></defs>
	<rect width={FW} height={FH} fill={bg} />
	<g clipPath="url(#scene-pic)">{children}</g>
</svg>;
const Darken: React.FC<{o: number; c?: string}> = ({o, c = '#0A0F2A'}) => <rect x={0} y={PIC_T} width={FW} height={PIC_B - PIC_T} fill={c} opacity={o} style={{mixBlendMode: 'multiply'}} />;

/** 1 · the temple forecourt at night: stars, the pylon with its flagstaffs, obelisks, a colonnade; braziers; the procession of the barque; Anubis stands guard */
export const SceneTemple: React.FC<{t: number}> = ({t}) => {
	const s = 22;
	return <Pic bg="#0B1233">
		{/* BACKGROUND */}
		<NightSky x={720} y={PIC_T} s={24} t={t} w={62} h={26} n={90} />
		<Pyramids x={250} y={560} s={6} t={t} />
		<Pylon x={720} y={GY - 90} s={15.5} t={t} glow={1} />
		<PylonSun x={720} y={GY - 90} s={15.5} t={t} />
		<Darken o={0.42} />
		{/* MIDDLE */}
		<rect x={0} y={GY - 92} width={FW} height={PIC_B - GY + 92} fill="#3A2E4A" />
		<rect x={0} y={GY - 92} width={FW} height={4} fill={PAL.ink} />
		<Obelisk x={430} y={GY - 70} s={13} t={t} h={28} />
		<Obelisk x={1010} y={GY - 70} s={13} t={t} h={28} />
		<SphinxAvenue x={330} y={GY - 40} s={10} t={t} n={3} gap={16} face={1} />
		<g transform={`translate(${FW},0) scale(-1,1)`}><SphinxAvenue x={330} y={GY - 40} s={10} t={t} n={3} gap={16} face={1} /></g>
		<Darken o={0.25} />
		<rect x={0} y={GY} width={FW} height={PIC_B - GY} fill="#4A3A40" /><rect x={0} y={GY} width={FW} height={3} fill={PAL.ink} />
		{/* FOREGROUND */}
		<Brazier61 x={150} y={GY + 10} s={s * 0.95} t={t} seed={1} />
		<Brazier61 x={1290} y={GY + 10} s={s * 0.95} t={t} seed={4} />
		<PriestProcession x={1060} y={GY - 26} s={s * 0.66} t={t} n={5} gap={5.6} march={0} seed={2} id="sc1p" />
		<God61 id="sc1-anubis" who="anubis" pose={{...POSES.rest, lean: 0.5 * Math.sin(t)}} x={300} y={GY + 4} s={s} face={1} t={t} />
		<Cat61 x={1180} y={GY + 6} s={s * 0.6} t={t} flip={-1} />
		{/* LIGHT */}
		<Glow x={150} y={GY - 140} r={260} c="warm" o={0.55} /><Glow x={1290} y={GY - 140} r={260} c="warm" o={0.55} />
		<Glow x={720} y={GY - 200} r={200} c="warm" o={0.3} />
		<Dust t={t} box={[0, PIC_T + 200, FW, GY]} n={40} seed={3} o={0.35} />
		<LayerKey title="场景 1 · 夜 · 神庙前庭" rows={[['背景', 'NightSky · Pyramids · Pylon + PylonSun（门内火光）'], ['中景', 'Obelisk ×2 · SphinxAvenue ×2（压暗 25%）'], ['前景', 'Brazier61 ×2 · PriestProcession · Cat61'], ['角色', 'God61 阿努比斯（与布景同 s = 21）'], ['光', 'Glow · Dust（Embers 在火盆里）']]} />
	</Pic>;
};
/** Ani poling a skiff (the ep60 rig + a punting pole held in both fists) */
const PunterOnSkiff: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => {
	const fs = s * 0.75, rock = 0.6 * Math.sin(t * 1.2), lean = 14 + 6 * Math.sin(t * 0.9);
	let p = {...POSES.rest, lean, neck: -2, head: -4, rt: -14, at: 12, rk: 6, ak: 4};
	p = wristTo(reach(p, 'f', [2.8, -13.6]), 'f', 100); p = wristTo(reach(p, 'b', [1.2, -11.0]), 'b', 100);
	const gf = gripOf(p, 'f'), gb = gripOf(p, 'b'), dx = gf[0] - gb[0], dy = gf[1] - gb[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
	const a: [number, number] = [gf[0] + ux * 5, gf[1] + uy * 5], b: [number, number] = [gb[0] - ux * 20, gb[1] - uy * 20];
	const fx = x - 1 * s, fy = y - 0.35 * s + 0.15 * s * Math.sin(t * 1.7);
	return <g>
		<Skiff61 x={x} y={y} s={s} t={t} len={14} />
		<g transform={`rotate(${rock} ${x} ${y})`}>
			<God61 id="sc2-ani" who="ani" pose={p} x={fx} y={fy} s={fs} face={1} t={t} />
			<g transform={`translate(${fx},${fy}) scale(${fs},${fs})`}>
				<path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} stroke={PAL.ink} strokeWidth={0.5} strokeLinecap="round" /><path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} stroke={S61.wood} strokeWidth={0.28} strokeLinecap="round" />
				<FistOver pose={p} side="f" c={{OW: 2.7 / fs, LW: 1.5 / fs}} skin={PAL.skinM} /><FistOver pose={p} side="b" c={{OW: 2.7 / fs, LW: 1.5 / fs}} skin={PAL.skinM} />
			</g>
		</g>
	</g>;
};
/** 2 · the Nile at sunset: the sun between the akhet hills, dunes and palms, the river with papyrus, a skiff, an ibis, a crocodile, geese */
export const SceneNile: React.FC<{t: number}> = ({t}) => {
	const s = 20, wy = 700;
	return <Pic bg="#3A2C6E">
		{/* BACKGROUND */}
		<HorizonSun x={720} y={wy - 120} s={22} t={t} w={66} h={26} mode="set" auto={false} rise={0.6 - 0.02 * t} />
		<Pyramids x={1080} y={wy - 120} s={5} t={t} />
		<Dunes x={720} y={wy - 40} s={20} t={t} w={74} h={5} seed={5} />
		<DatePalm x={260} y={wy} s={13} t={t} seed={1} /><DatePalm x={340} y={wy} s={11} t={t} seed={2} /><DatePalm x={1180} y={wy} s={12} t={t} seed={3} />
		<rect x={0} y={wy - 40} width={FW} height={44} fill={S61.sand2} />
		<Geese x={1020} y={PIC_T + 290} s={9} t={t} n={6} v seed={2} travel={0} />
		<BirdsCrossing x={0} y={PIC_T + 120} s={8} t={t} n={5} period={9} />
		{/* MIDDLE: the river */}
		<Nile x={720} y={wy} s={20} t={t} w={74} h={12} flow={0.6} />
		<WaterShimmer t={t} box={[300, wy + 10, 1200, wy + 120]} n={40} />
		<CrocWater x={980} y={wy + 120} s={s * 0.8} t={t} flip={-1} />
		<PunterOnSkiff x={430} y={wy + 78} s={s} t={t} />
		{/* FOREGROUND */}
		<PapyrusThicket x={130} y={PIC_B + 10} s={20} t={t} w={14} h={15} n={20} />
		<PapyrusThicket x={1350} y={PIC_B + 10} s={17} t={t} w={9} h={13} n={12} seed={4} />
		<Ibis x={1180} y={wy + 168} s={s} t={t} flip={-1} />
		<Falcon x={520} y={PIC_T + 210} s={s * 0.8} t={t} mode="fly" />
		<LayerKey title="场景 2 · 黄昏 · 尼罗河" rows={[['背景', 'HorizonSun（日落）· Pyramids · Dunes · DatePalm ×3'], ['背景', 'Geese（雁阵）· BirdsCrossing'], ['中景', 'Nile · WaterShimmer · CrocWater · Skiff61'], ['角色', 'God61 阿尼（撑篙，s = 15）'], ['前景', 'PapyrusThicket ×2 · Ibis · Falcon（飞）']]} />
	</Pic>;
};
/** 3 · the offering hall: columns, a lit naos, offering tables piled high, incense rising through the light shafts, lamps; a priest censes before Isis */
export const SceneHall: React.FC<{t: number}> = ({t}) => {
	const s = 22, ceil = PIC_T + 70;
	return <Pic bg="#2A1A12">
		{/* BACKGROUND: the wall with registers, the ceiling of stars */}
		<rect x={0} y={PIC_T} width={FW} height={GY - PIC_T} fill="#C9A86E" />
		{[0, 1].map((r) => <g key={r}><Glyphs x={40} y={ceil + 70 + r * 210} cols={22} rows={4} cell={22} seed={r + 4} o={0.75} />
			<g transform={`translate(800,${ceil + 70 + r * 210})`}><Glyphs x={0} y={0} cols={22} rows={4} cell={22} seed={r + 9} o={0.75} /></g></g>)}
		<rect x={0} y={PIC_T} width={FW} height={ceil - PIC_T} fill="#1B2A63" />
		{Array.from({length: 26}, (_, i) => <path key={i} d={`M${30 + i * 56} ${PIC_T + 20}l4 10l11 0l-9 6l4 11l-10 -7l-10 7l4 -11l-9 -6l11 0z`} fill="#E8B83E" />)}
		<Naos61 x={720} y={GY - 8} s={s * 1.6} t={t} open={0.75} />
		<JackalShrine x={720} y={GY - 8 - 17.3 * s} s={s * 0.55} t={t} poles={false} />
		<Darken o={0.35} c="#2A1408" />
		{/* MIDDLE: the columns, the architrave */}
		{[120, 420, 1020, 1320].map((cx, i) => <Column61 key={i} x={cx} y={GY} s={s * 1.9} t={t} h={(GY - ceil - 6) / (s * 1.9)} kind={i % 2 ? 'lotus' : 'papyrus'} open={i < 2} />)}
		<Architrave x={720} y={ceil + 6} s={s * 1.2} t={t} w={58} />
		<LightShafts x={560} y={ceil + 10} s={1.3} t={t} n={2} L={800} a={12} o={0.45} />
		<rect x={0} y={GY} width={FW} height={PIC_B - GY} fill="#6A4A2A" /><rect x={0} y={GY} width={FW} height={3} fill={PAL.ink} />
		{/* FOREGROUND */}
		<OfferingPile x={520} y={GY + 20} s={s} t={t} />
		<OfferingPile x={930} y={GY + 20} s={s} t={t} jars={false} />
		<IncenseStand x={620} y={GY + 24} s={s} t={t} seed={3} smoke={11} />
		<IncenseStand x={830} y={GY + 24} s={s} t={t} seed={5} smoke={11} />
		<OilLamp x={260} y={GY + 30} s={s} t={t} seed={2} /><OilLamp x={1190} y={GY + 30} s={s} t={t} seed={6} />
		<CanopicSet x={1080} y={GY + 40} s={s * 0.8} t={t} />
		<BeerJars x={340} y={GY + 40} s={s * 0.9} t={t} />
		<God61 id="sc3-isis" who="isis" pose={{...POSES.rest, lean: 0.5 * Math.sin(t * 0.8)}} x={180} y={GY + 30} s={s} face={1} t={t} />
		<God61 id="sc3-priest" who="ani" pose={{...walkPose(0.3, {lean: 6, stride: 0.6}), bs: 40, be: 30, fs: 70, fe: 20}} x={1300} y={GY + 30} s={s} face={-1} t={t} />
		<Cobra x={420} y={GY + 42} s={s * 0.55} t={t} gold />
		<Glow x={720} y={GY - 260} r={300} c="gold" o={0.35} />
		<Glow x={260} y={GY - 100} r={170} c="warm" o={0.5} /><Glow x={1190} y={GY - 100} r={170} c="warm" o={0.5} />
		<LayerKey title="场景 3 · 供奉大厅" rows={[['背景', '星顶 · Glyphs 墙面 · Naos61（灯）· JackalShrine'], ['中景', 'Column61 ×4 · Architrave（有翼日轮）· LightShafts'], ['前景', 'OfferingPile ×2 · IncenseStand ×2 · OilLamp ×2'], ['前景', 'CanopicSet · BeerJars · Cobra（金圣蛇）'], ['角色', 'God61 伊西斯 · 阿尼（s = 22）']]} />
	</Pic>;
};
const SCENES = [SceneTemple, SceneNile, SceneHall];
const SceneFrame: React.FC<{i: number; t: number}> = ({i, t}) => { const S = SCENES[i]; return <AbsoluteFill style={{background: '#000'}}><S t={t} /><Bands t={t} />
	<Subtitle t={0} sub={{text: ['示例场景 1：夜，神庙前庭（背景 · 中景 · 前景 + 角色）', '示例场景 2：黄昏，尼罗河（天 · 岸 · 水 · 近景纸草）', '示例场景 3：供奉大厅（墙 · 柱 · 供桌与香烟）'][i]}} /></AbsoluteFill>; };

const SetsStill: React.FC = () => { const f = useCurrentFrame(); return <Page p={Math.min(CATS.length - 1, f)} t={T_STILL} />; };
const SceneStill: React.FC = () => { const f = useCurrentFrame(); return <SceneFrame i={Math.min(2, f)} t={T_STILL} />; };
const PER = 90;
const Anim: React.FC = () => { const f = useCurrentFrame(), k = Math.floor(f / PER), t = (f % PER) / 30;
	return k < CATS.length ? <Page p={k} t={t + 0.5} /> : <SceneFrame i={Math.min(2, k - CATS.length)} t={t + 0.5} />; };
registerRoot(() => <>
	<Composition id="SETS61" component={SetsStill} durationInFrames={CATS.length} fps={30} width={FW} height={FH} />
	<Composition id="SCENE61" component={SceneStill} durationInFrames={3} fps={30} width={FW} height={FH} />
	<Composition id="SETSANIM61" component={Anim} durationInFrames={(CATS.length + 3) * PER} fps={30} width={FW} height={FH} />
</>);
export const _bookKeep = {Embers, LotusPond, Baskets, Chest61, Falcon, Cat61, SmokeCurl, Geese, PIC_B};
