import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Img} from 'remotion';
import {Subs, Stamp, Seal, SANS, SERIF, KAI} from '../qq50/kit50';
import {useStampFonts, SEAL_SRC, SAFE_X} from '../qq44/skin44';
import {Zun, lookAt, ZunLight, V3, Cam, proj, ZUN, Rz, rho, zunScreen, ZunProps} from './zun55h';
import {KF1, KF2, KF3, KF4, L1, L3, L4, thK, sm, pth, f1, rnd, P, Glow, Haze, Vig, Plume, Person, YardBG, pile, shard, ForgeBG, ScaleDeck, SCALE, Tag30, sleeve, mitten, tube, heroCam} from './kf55h';
import {Body, Sil, kneel, stand, crouch, toLocal} from './rig55h';
/* ep55 · 何尊 — ALL the key frames, one per script card (v1.1): 1, 2, T, 3–16, the stop, 17–28, Q (31 frames).
   KF1 = card 1, KF2 = card 3, KF3 = cards 19–21 (19 is the room it starts in), KF4 = cards 25–26; the rest are new sets in the
   same family (flat-vector 2.5D layers, one warm key, warm-black rim-lit people). The 尊 is in every frame, on the x = 960 axis,
   the brightest thing on screen; its state follows the story: molten → fresh gold (西周) → earthy (buried … scrap yard) →
   being cleaned (1975) → shining (museum). Overlay zones kept calm: subtitles x 150–1150 / y 90–300, stamp top-right,
   counter bottom-left, seal bottom-right. */
const W = 1920, H = 1080;

/* ============================== cards ============================== */
type St = {y?: string; place?: string; note: string};
export type CardD = {id: string; t: number; act: string; rows?: string[]; age?: string; st?: St; mode?: 'tl' | 'big' | 'q' | 'none'; bigY?: number};
export const CARDS_ALL: CardD[] = [
	{id: '1', t: 0.0, act: '废品站，30元', rows: ['最早写着“中国”两个字的国宝，', '在废品站里，只值[30块钱]。'], age: '约3000', st: {y: '1965', place: '宝鸡', note: '废品收购站'}},
	{id: '2', t: 5.98, act: '饕餮双眼特写', rows: ['假如说，', '你就是这件国宝。'], age: '约3000'},
	{id: 'T', t: 9.05, act: '标题砸在剪影上', mode: 'none'},
	{id: '3', t: 15.03, act: '你在火里出生', rows: ['约三千年前，西周。', '你在火里出生。'], age: '0', st: {y: '西周初', place: '成周', note: '铸造'}},
	{id: '4', t: 19.56, act: '冷却，何跪在你面前', rows: ['铸你的人，叫“何”，', '周王室的一位“宗小子”。'], age: '0'},
	{id: '5', t: 24.09, act: '成王训话，何跪听', rows: ['周成王亲政第五年，在新都洛邑，', '把何这些宗小子叫来，训了一番话。'], age: '0', st: {y: '西周', place: '成周', note: '成王五年'}},
	{id: '6', t: 28.62, act: '镜头探进尊口', rows: ['何把这番话，铸进了你的肚子里，', '12行，122个字。'], age: '0'},
	{id: '7', t: 33.15, act: '宅兹中国，微光', rows: ['其中，有这样四个字：', '“宅兹[中国]”。'], age: '0'},
	{id: '8', t: 37.68, act: '祭台，洛邑黎明', rows: ['意思是：我要住在这天下的中心，', '在这里，治理百姓。'], age: '0'},
	{id: '9', t: 42.20, act: '土层一层层盖上', rows: ['后来，你被埋进了土里。', '一埋，就是三千年。'], age: '1536'},
	{id: '10', t: 46.73, act: '贾村，村民挖出', rows: ['1963年，陕西宝鸡贾村，', '你被一个村民，从土里挖了出来。'], age: '约3000', st: {y: '1963', place: '宝鸡', note: '贾村'}},
	{id: '11', t: 51.26, act: '农家墙角，装满粮', rows: ['他把你搬回家，', '用来装粮食。'], age: '约3000'},
	{id: '12', t: 55.79, act: '同一墙角，季节流转', rows: ['没人知道你是谁。', '你只是一个，装粮食的罐子。'], age: '约3000'},
	{id: '13', t: 60.32, act: '板车拉进废品站', rows: ['两年后，', '你流落到了废品收购站。'], age: '约3000', st: {y: '1965', place: '宝鸡', note: '废品收购站'}},
	{id: '14', t: 64.85, act: '秤砣滑动，写下30元', rows: ['在这里，你就是一堆废铜，', '按斤称。'], age: '约3000'},
	{id: '15', t: 69.37, act: '炉火逼近', rows: ['再晚一步——'], age: '约3000'},
	{id: '16', t: 73.90, act: '火光里的饕餮之眼', rows: ['你，就要被销毁了。'], age: '约3000', mode: 'big', bigY: 196},
	{id: '停', t: 76.17, act: '黑场，炉火一闪', mode: 'none'},
	{id: '17', t: 78.43, act: '专家停步，看见你', rows: ['就在这时，宝鸡市博物馆的专家，', '来废品站寻宝，看见了你。'], age: '约3000'},
	{id: '18', t: 82.96, act: '抱起你，带走', rows: ['30块钱，把你买了回来。'], age: '约3000'},
	{id: '19', t: 87.17, act: '故宫，台灯下除锈', rows: ['1975年，你被送进北京故宫，', '参加文物展，专家给你除锈——'], age: '约3000', st: {y: '1975', place: '北京', note: '故宫除锈'}},
	{id: '20', t: 92.02, act: '铭文一列列现身', rows: ['锈层下面，', '露出了12行、122个字。'], age: '约3000'},
	{id: '21', t: 96.54, act: '“中国”点亮', rows: ['宅兹[中国]。'], age: '约3000', mode: 'big', bigY: 170},
	{id: '22', t: 101.07, act: '拉出，整尊锃亮', rows: ['这是目前所知，', '“中国”一词最早的文字记载。'], age: '约3000'},
	{id: '23', t: 105.60, act: '洛邑黎明，回响', rows: ['那时的“中国”，', '说的是天下的中心，洛阳一带。'], age: '约3000'},
	{id: '24', t: 110.13, act: '缓慢环绕，光变暖', rows: ['三千年后，', '它成了一个国家的名字。'], age: '约3000'},
	{id: '25', t: 114.66, act: '展柜，禁止出境', rows: ['后来，你成了国家一级文物，', '首批禁止出国（境）展览的文物。'], age: '约3000', st: {note: '首批禁止出境'}},
	{id: '26', t: 119.19, act: '博物院，人来人往', rows: ['今天，你在宝鸡青铜器博物院，', '每天被很多人看见。'], age: '约3000', st: {y: '今', place: '宝鸡', note: '宝鸡青铜器博物院'}},
	{id: '27', t: 123.72, act: '炉火闪回', rows: ['差一点，', '你就被当成废铜，销毁了。'], age: '约3000'},
	{id: '28', t: 128.25, act: '黄昏，空荡的站门', rows: ['如果那天，他没有走进那个废品站——'], age: '约3000'},
	{id: 'END', t: 132.77, act: '片尾卡：聚光灯下的你', mode: 'none'},
];

/* ============================== overlay ============================== */
const Counter: React.FC<{age: string}> = ({age}) => { const approx = age.startsWith('约');
	return <div style={{position: 'absolute', left: 150, bottom: 70, color: '#FFF6E6', fontFamily: SANS, textShadow: thK.halo, display: 'flex', alignItems: 'baseline', gap: 10, whiteSpace: 'nowrap'}}>
		<span style={{fontSize: 34, fontWeight: 700}}>你</span>{approx && <span style={{fontSize: 34, fontWeight: 700}}>约</span>}
		<span style={{fontSize: 78, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{approx ? age.slice(1) : age}</span><span style={{fontSize: 34, fontWeight: 700}}>岁</span></div>; };
const NoteStamp: React.FC<{note: string}> = ({note}) => { useStampFonts(note);
	return <div style={{position: 'absolute', top: 64, right: 160, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thK.rule}`, color: thK.ink, textShadow: thK.halo, whiteSpace: 'nowrap', fontFamily: KAI, fontWeight: 700, fontSize: 40, letterSpacing: '0.06em', lineHeight: 1.3}}>{note}</div>; };
/** a centred line (big) or the closing question: key words in [..] in the gold of the rule */
const Centre: React.FC<{rows: string[]; y: number; size: number}> = ({rows, y, size}) => { const part = (s: string) => s.split(/(\[[^\]]+\])/).filter(Boolean).map((p, i) => p.startsWith('[') ? <span key={i} style={{color: '#F2C66E'}}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>);
	const w = Math.max(...rows.map((r) => r.replace(/[[\]]/g, '').length)) * size * 1.05, h = rows.length * size * 1.45;
	return <>
		<div style={{position: 'absolute', left: 960 - w / 2 - 260, top: y - 120, width: w + 520, height: h + 240, background: 'radial-gradient(closest-side, rgba(14,8,5,0.5) 0%, rgba(14,8,5,0.36) 50%, rgba(14,8,5,0) 100%)'}} />
		<div style={{position: 'absolute', left: 0, width: W, top: y, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 1.45, letterSpacing: '0.04em', color: '#FFF6E6', textShadow: thK.halo}}>
			{rows.map((r, i) => <div key={i}>{part(r)}</div>)}</div></>; };
export const Ov: React.FC<{c: CardD}> = ({c}) => {
	if (c.mode === 'none') return null;
	return <>
		{(c.mode ?? 'tl') === 'tl' && c.rows && <Subs rows={c.rows.map((s) => ({s}))} th={thK} />}
		{c.mode === 'big' && c.rows && <Centre rows={c.rows} y={c.bigY ?? 380} size={112} />}
		{c.mode === 'q' && c.rows && <Centre rows={c.rows} y={c.bigY ?? 140} size={84} />}
		{c.st && (c.st.y ? <Stamp y={c.st.y} place={c.st.place ?? ''} note={c.st.note} th={thK} /> : <NoteStamp note={c.st.note} />)}
		{c.age && <Counter age={c.age} />}
		<Seal />
	</>; };

/* ============================== shared ============================== */
/** a hero camera with its own screen centre: model mid-height (tz) lands at (cx, cy), the 尊 about h px tall */
const camH = (az = 0, el = 7, h = 480, cx = 960, cy = 650, D = 300, tz = 19.4): Cam => { const a = az * Math.PI / 180, e = el * Math.PI / 180;
	return lookAt([D * Math.cos(e) * Math.cos(a), D * Math.cos(e) * Math.sin(a), tz + D * Math.sin(e)], [0, 0, tz], h * D / ZUN.H, cx, cy); };
/** a point on the outer surface (model θ, z), as the model draws it */
const surfPt = (th: number, z: number, lift = 0): V3 => { const [r, n] = Rz(z), k = r * rho(th, n) + lift; return [k * Math.cos(th), k * Math.sin(th), z]; };
/** the lip ring on screen */
const lipRing = (cam: Cam, r = 14.0, z = 38.8, n = 48) => Array.from({length: n}, (_, j) => proj(cam, [r * Math.cos((j / n) * 2 * Math.PI), r * Math.sin((j / n) * 2 * Math.PI), z]));
const Motes: React.FC<{n: number; x0: number; x1: number; y0: number; y1: number; c: string; seed: number; o?: number; r?: number}> = ({n, x0, x1, y0, y1, c, seed, o = 0.5, r = 2.2}) => <g>
	{Array.from({length: n}, (_, i) => <circle key={i} cx={x0 + rnd(i, seed) * (x1 - x0)} cy={y0 + rnd(i, seed + 1) * (y1 - y0)} r={0.6 + rnd(i, seed + 2) * r} fill={c} opacity={o * (0.3 + 0.7 * rnd(i, seed + 3))} />)}</g>;
const Beam: React.FC<{pts: P[]; c: string; o: number; id: string; dir?: [number, number, number, number]}> = ({pts, c, o, id, dir = [0, 0, 0, 1]}) => <>
	<defs><linearGradient id={id} x1={dir[0]} y1={dir[1]} x2={dir[2]} y2={dir[3]}><stop offset="0" stopColor={c} stopOpacity={o} /><stop offset="1" stopColor={c} stopOpacity={0} /></linearGradient></defs>
	<path d={pth(pts)} fill={`url(#${id})`} /></>;
/** the 尊 as a black silhouette with a thin hot rim and a halo behind (title, stop, ghost) */
const SilZun: React.FC<{cam: Cam; id: string; rim: string; halo: string; haloO: number; rimO?: number; body?: string; bodyO?: number}> = ({cam, id, rim, halo, haloO, rimO = 1, body = '#0B0705', bodyO = 1}) => {
	const L: ZunLight = {dir: [0.3, 0.5, 0.8], col: '#FFFFFF', k: 1, amb: 0.5, ambCol: '#FFFFFF', spec: 0};
	const c = (h: string) => [1, 3, 5].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3));
	const [br, bg, bb] = c(body);
	return <g>
		<defs>
			<filter id={`${id}h`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation={26} result="b" /><feFlood floodColor={halo} floodOpacity={haloO} /><feComposite in2="b" operator="in" /></filter>
			<filter id={`${id}s`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
				<feColorMatrix in="SourceAlpha" type="matrix" values={`0 0 0 0 ${br} 0 0 0 0 ${bg} 0 0 0 0 ${bb} 0 0 0 ${bodyO} 0`} result="blk" />
				<feMorphology in="SourceAlpha" operator="erode" radius={2.4} result="er" /><feComposite in="SourceAlpha" in2="er" operator="out" result="edge" />
				<feGaussianBlur in="edge" stdDeviation={0.7} result="eb" /><feFlood floodColor={rim} floodOpacity={rimO} result="fc" /><feComposite in="fc" in2="eb" operator="in" result="rimc" />
				<feMerge><feMergeNode in="blk" /><feMergeNode in="rimc" /></feMerge></filter></defs>
		<g filter={`url(#${id}h)`}><Zun cam={cam} light={L} id={`${id}a`} patina={0.3} shadow={false} inscription={false} /></g>
		<g filter={`url(#${id}s)`}><Zun cam={cam} light={L} id={`${id}b`} patina={0.3} shadow={false} inscription={false} /></g>
	</g>; };
const Frame: React.FC<{bg: string; c: CardD; children: React.ReactNode; vig?: number; after?: React.ReactNode}> = ({bg, c, children, vig = 0.6, after}) => <AbsoluteFill style={{background: bg}}>
	<svg width={W} height={H} style={{position: 'absolute'}}>{children}</svg>
	{after}
	<svg width={W} height={H} style={{position: 'absolute'}}><Vig id={`v${c.id}`} a={vig} /></svg>
	<Ov c={c} />
</AbsoluteFill>;
const C = (id: string) => CARDS_ALL.find((k) => k.id === id)!;

/* ============================== 2 · close on the 饕餮 eyes, dust ============================== */
const L2c: ZunLight = {dir: [0.5, 0.78, 0.22], col: '#FFB874', k: 1.5, amb: 0.2, ambCol: '#4A4E5E', spec: 0.55, shin: 14, rim: {dir: [-0.4, -0.7, 0.45], col: '#8A96B8', k: 0.45}};
const F2: React.FC = () => { const c = C('2'), T: V3 = [0, 0, 16.2], D = 132, e = 4 * Math.PI / 180;
	const cam = lookAt([D * Math.cos(e), 0, T[2] + D * Math.sin(e)], T, 5200, 960, 640);
	return <Frame bg="#0E0A08" c={c} vig={0.7}>
		<defs><radialGradient id="c2bg" cx="70%" cy="60%" r="80%"><stop offset="0" stopColor="#5A3A26" /><stop offset="0.5" stopColor="#24180F" /><stop offset="1" stopColor="#0C0907" /></radialGradient>
			<filter id="c2bk" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={14} /></filter>
			<linearGradient id="c2top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0A0705" stopOpacity={0.88} /><stop offset="1" stopColor="#0A0705" stopOpacity={0} /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#c2bg)" />
		{/* the yard far behind, out of focus: the sunset and the furnace as soft discs */}
		<g filter="url(#c2bk)">{Array.from({length: 14}, (_, i) => <circle key={i} cx={1480 + rnd(i, 4) * 440} cy={420 + rnd(i, 5) * 420} r={18 + rnd(i, 6) * 40} fill={i % 3 ? '#FFB070' : '#FF7A30'} opacity={0.18 + 0.2 * rnd(i, 7)} />)}
			{Array.from({length: 8}, (_, i) => <circle key={`l${i}`} cx={rnd(i, 8) * 420} cy={560 + rnd(i, 9) * 380} r={16 + rnd(i, 10) * 34} fill="#C8885A" opacity={0.12 + 0.12 * rnd(i, 11)} />)}</g>
		<Beam pts={[[1920, 120], [1920, 820], [700, 1080], [420, 1080]]} c="#FFC890" o={0.16} id="c2beam" dir={[1, 0, 0, 0]} />
		<Zun cam={cam} light={L2c} id="z2c" patina={0.95} shadow={false} inscription={false} />
		<rect width={W} height={380} fill="url(#c2top)" />
		<Motes n={70} x0={480} x1={1880} y0={260} y1={1040} c="#FFE2B8" seed={31} o={0.55} r={2.6} />
	</Frame>; };

/* ============================== T · the title over the 尊's black silhouette ============================== */
const FT: React.FC = () => { const c = C('T'), cam = heroCam(0, 7);
	const rows = ['“中国”两个字，', '最早出现在哪？'];
	return <Frame bg="#070403" c={c} vig={0.75}>
		<defs><radialGradient id="tbg" cx="50%" cy="56%" r="58%"><stop offset="0" stopColor="#6A3A16" /><stop offset="0.45" stopColor="#2A160A" /><stop offset="1" stopColor="#070403" /></radialGradient>
			<linearGradient id="tgold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF2C8" /><stop offset="0.38" stopColor="#F2C46A" /><stop offset="0.56" stopColor="#B87A32" /><stop offset="0.7" stopColor="#D89A48" /><stop offset="1" stopColor="#F6D488" /></linearGradient>
			<filter id="tglow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation={16} result="b" /><feFlood floodColor="#000" floodOpacity={0.85} /><feComposite in2="b" operator="in" result="sh" />
				<feGaussianBlur in="SourceGraphic" stdDeviation={10} result="g" /><feColorMatrix in="g" type="matrix" values="1 0 0 0 0.1 0 0.7 0 0 0 0 0 0.3 0 0 0 0 0 0.45 0" result="gg" />
				<feMerge><feMergeNode in="sh" /><feMergeNode in="gg" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
		<rect width={W} height={H} fill="url(#tbg)" />
		<Glow x={960} y={940} r={560} c="#FF9A40" o={0.25} id="tfl" sy={0.16} />
		<SilZun cam={cam} id="tsil" rim="#F0B866" halo="#E08A36" haloO={0.75} />
		<Motes n={46} x0={200} x1={1720} y0={120} y1={1000} c="#FFB060" seed={77} o={0.5} r={2.4} />
		<g filter="url(#tglow)">
			{rows.map((r, i) => <text key={i} x={960} y={530 + i * 196} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={164} letterSpacing={8}
				fill="url(#tgold)" stroke="#1A0D05" strokeWidth={9} strokeLinejoin="round" paintOrder="stroke">{r}</text>)}
		</g>
		<path d="M640,800 L1280,800" stroke="#E8B868" strokeWidth={2.4} strokeOpacity={0.7} />
		<circle cx={960} cy={800} r={5} fill="#F2C66E" />
	</Frame>; };

/* ============================== 4 · cooling; 何 kneels before it ============================== */
const L4c: ZunLight = {dir: [0.35, -0.75, 0.55], col: '#FFB070', k: 1.3, amb: 0.3, ambCol: '#5A3A30', spec: 0.9, shin: 16, rim: {dir: [-0.5, 0.7, 0.4], col: '#FF8A40', k: 0.6}};
const F4: React.FC = () => { const c = C('4'), cam = heroCam(0, 7);
	return <Frame bg="#070505" c={c}>
		<ForgeBG fire={0.45} />
		<rect x={0} y={860} width={W} height={220} fill="#120B08" />
		<Glow x={960} y={900} r={520} c="#FF8A3A" o={0.3} id="c4pool" sy={0.22} />
		{shard(745, 925, 150, 64, -10, 0)}{shard(1185, 928, 160, 70, 9, 1)}{shard(1330, 985, 120, 50, 24, 2)}
		<Plume x={930} y={430} h={300} w={150} c="#E8C8A8" o={0.1} id="c4st" seed={2} />
		<Glow x={960} y={640} r={420} c="#FFB050" o={0.28} id="c4halo" />
		<Zun cam={cam} light={L4c} id="z4c" patina={0.05} molten={0.32} fresh={0.6} shadow />
		{/* 何, a 宗小子: robe, cap and pin; kneeling upright, hands joined, bowing to the new vessel */}
		<Sil id="c4he" x={420} y={905} k={3.05} rim="#FFB060" lx={1} ly={0.15}><Body s={kneel(16)} dress="robe" hat="guan" /></Sil>
	</Frame>; };

/* ============================== 5 · the 西周 hall: the king, 何 kneeling, the 尊 on its stand ============================== */
const LH: ZunLight = {dir: [0.45, 0.6, 0.65], col: '#FFC27A', k: 1.4, amb: 0.26, ambCol: '#5A4038', spec: 1.1, shin: 18, rim: {dir: [-0.6, -0.6, 0.4], col: '#FFB060', k: 0.5}};
const F5: React.FC = () => { const c = C('5'), cam = camH(0, 7, 380, 960, 640), zs = zunScreen(cam), by = zs.base[1];
	/* 黼: a black-and-white axe-head pattern on the king's screen (扆) */
	const fu = Array.from({length: 24}, (_, i) => { const cx = 1385 + (i % 4) * 92, cy = 395 + Math.floor(i / 4) * 66;
		return <path key={i} d={sm([[cx - 22, cy - 18], [cx + 12, cy - 22], [cx + 26, cy], [cx + 12, cy + 22], [cx - 22, cy + 18], [cx - 14, cy]])} fill="#3A1A10" stroke="#8A5A30" strokeWidth={1.4} strokeOpacity={0.5} />; });
	return <Frame bg="#0A0605" c={c} vig={0.65}>
		<defs><linearGradient id="c5wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120A07" /><stop offset="1" stopColor="#2A1A10" /></linearGradient>
			<linearGradient id="c5fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E1E14" /><stop offset="1" stopColor="#0E0907" /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#c5wall)" />
		{/* beams and posts of the hall (堂): a lintel high up, red-lacquered posts at the edges */}
		<rect x={0} y={0} width={W} height={60} fill="#0C0705" /><path d="M0,60 L1920,60" stroke="#6A3A20" strokeWidth={3} strokeOpacity={0.6} />
		{[40, 1290, 1830].map((x, i) => <g key={i}><rect x={x} y={60} width={52} height={800} fill="#3A120C" /><path d={`M${x + 52},60 L${x + 52},860`} stroke="#FF9A50" strokeWidth={2} strokeOpacity={0.35} /></g>)}
		{/* hanging curtains (帷) behind 何 */}
		<path d={sm([[110, 330], [420, 318], [640, 330], [640, 760], [560, 770], [470, 750], [380, 770], [280, 752], [190, 770], [110, 760]])} fill="#1E0F0A" />
		{Array.from({length: 7}, (_, i) => <path key={i} d={`M${150 + i * 72},340 Q${140 + i * 72},560 ${154 + i * 72},760`} stroke="#0E0705" strokeWidth={3} fill="none" />)}
		{/* the dais and the king's screen (扆) with 黼 */}
		<rect x={1340} y={360} width={400} height={420} fill="#1A0C08" stroke="#6A3A20" strokeWidth={4} />{fu}
		<path d={pth([[1180, 770], [1920, 760], [1920, 812], [1160, 822]])} fill="#2A1A12" /><path d="M1160,822 L1920,812 L1920,840 L1160,852 Z" fill="#160D09" />
		<path d="M1180,770 L1920,760" stroke="#FFB060" strokeWidth={2} strokeOpacity={0.5} />
		{/* the floor: mats (席) in a grid */}
		<path d={pth([[0, 780], [1180, 790], [1160, 850], [1920, 840], [1920, 1080], [0, 1080]])} fill="url(#c5fl)" />
		{Array.from({length: 9}, (_, i) => <path key={i} d={`M${-200 + i * 300},1080 L${300 + i * 140},790`} stroke="#3A2618" strokeWidth={2} strokeOpacity={0.6} />)}
		{[860, 930, 1010].map((y, i) => <path key={i} d={`M0,${y} L1920,${y - 8}`} stroke="#3A2618" strokeWidth={2} strokeOpacity={0.5} />)}
		{/* bronze lamps (豆形灯) either side of the stand: the key */}
		{[[700, 'a'], [1220, 'b']].map(([x, k]) => <g key={k as string}><path d={`M${x as number - 26},${by + 16} L${x as number + 26},${by + 16} L${x as number + 8},${by - 10} L${x as number + 6},${by - 120} L${x as number + 30},${by - 132} L${x as number - 30},${by - 132} L${x as number - 6},${by - 120} L${x as number - 8},${by - 10} Z`} fill="#24160E" />
			<path d={sm([[x as number - 8, by - 136], [x as number, by - 168], [x as number + 8, by - 136]])} fill="#FFD890" /><Glow x={x as number} y={by - 145} r={200} c="#FFB060" o={0.45} id={`c5l${k}`} /></g>)}
		{/* the king (成王): 冕, a long robe, standing on the dais, his hand out to the kneeling 宗小子 */}
		<Sil id="c5king" x={1500} y={772} k={2.55} flip rim="#FFB870" lx={-1} ly={0.2}><Body s={stand(-2, 0.2, [44, -128], [12, -98])} dress="kingrobe" hat="mian" /></Sil>
		{/* 何, kneeling upright before the king, hands joined */}
		<Sil id="c5he" x={360} y={900} k={2.7} rim="#FFB060" lx={1} ly={0.15}><Body s={kneel(10)} dress="robe" hat="guan" /></Sil>
		{/* the stand (禁): a low bronze table */}
		<path d={pth([[740, by + 4], [1180, by + 4], [1200, by + 30], [720, by + 30]])} fill="#3A2614" /><rect x={720} y={by + 30} width={480} height={40} fill="#1C120A" />
		{[740, 1150].map((x, i) => <rect key={i} x={x} y={by + 70} width={30} height={34} fill="#140C08" />)}
		<path d={`M740,${by + 4} L1180,${by + 4}`} stroke="#FFC070" strokeWidth={2} strokeOpacity={0.6} />
		<Glow x={960} y={by - 190} r={330} c="#FFB050" o={0.22} id="c5halo" />
		<Zun cam={cam} light={LH} id="z5" patina={0.02} fresh={0.62} shadow={false} />
	</Frame>; };

/* ============================== 6 · the camera goes down into the mouth: the fresh inscription ============================== */
const L6: ZunLight = {dir: [-0.45, -0.35, 0.82], col: '#FFD49A', k: 1.25, amb: 0.3, ambCol: '#5A4A3A', spec: 1.0, shin: 18, inside: 0.85};
const F6: React.FC = () => { const c = C('6'), T: V3 = [0, 0, 18], D = 92, a = 225 * Math.PI / 180, e = 66 * Math.PI / 180;
	const cam = lookAt([T[0] + D * Math.cos(e) * Math.cos(a), T[1] + D * Math.cos(e) * Math.sin(a), T[2] + D * Math.sin(e)], T, 2500, 960, 640);
	return <Frame bg="#0A0705" c={c} vig={0.7}>
		<defs><radialGradient id="c6bg" cx="50%" cy="60%" r="70%"><stop offset="0" stopColor="#3A2614" /><stop offset="1" stopColor="#0A0705" /></radialGradient></defs>
		<rect width={W} height={H} fill="url(#c6bg)" />
		{/* the stand's top under the vessel, seen from above: planks */}
		{Array.from({length: 12}, (_, i) => <path key={i} d={`M${-100 + i * 190},1080 L${300 + i * 140},0`} stroke="#140C08" strokeWidth={4} opacity={0.5} />)}
		<Glow x={960} y={640} r={640} c="#FFB060" o={0.2} id="c6g" />
		<Zun cam={cam} light={L6} id="z6" patina={0} fresh={0.6} reveal={1} glow={0} shadow={false} />
		<Motes n={30} x0={600} x1={1400} y0={300} y1={900} c="#FFE6B8" seed={61} o={0.4} />
	</Frame>; };

/* ============================== 7 · close on the column: 宅兹中或, lit softly ============================== */
const L7: ZunLight = {dir: [0.45, 0.25, 0.86], col: '#FFD6A0', k: 1.2, amb: 0.3, ambCol: '#5A4A3A', spec: 0.9, shin: 18, inside: 0.85};
const keyColCentre = (): V3 => { const u = (5.5 - 6) * 1.12, v = 0.0, a = Math.PI / 4, du = [Math.cos(a - Math.PI / 2), Math.sin(a - Math.PI / 2)], dv = [-Math.cos(a), -Math.sin(a)];
	return [du[0] * u + dv[0] * v, du[1] * u + dv[1] * v, ZUN.FLOOR]; };
const F7: React.FC = () => { const c = C('7'), T = keyColCentre(), a = Math.PI / 4, off = 7;
	const cam = lookAt([T[0] - off * Math.cos(a), T[1] - off * Math.sin(a), 88.8], T, 8200, 1180, 610);
	return <Frame bg="#0A0705" c={c} vig={0.72}>
		<rect width={W} height={H} fill="#1A120A" />
		<Zun cam={cam} light={L7} id="z7" patina={0} fresh={0.55} reveal={1} glow={0.38} shadow={false} />
		<Glow x={1500} y={160} r={700} c="#FFD8A0" o={0.12} id="c7l" />
	</Frame>; };

/* ============================== 8 / 23 · 洛邑 at dawn (unbordered terrain, no map) ============================== */
const Luoyi: React.FC<{id: string; o?: number}> = ({id, o = 1}) => <g opacity={o}>
	<defs><linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141A2E" /><stop offset="0.3" stopColor="#3A3352" /><stop offset="0.5" stopColor="#8A5A62" /><stop offset="0.6" stopColor="#E89A6A" /><stop offset="0.66" stopColor="#FFC888" /><stop offset="1" stopColor="#5A3A2A" /></linearGradient>
		<linearGradient id={`${id}pl`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6A4A3E" /><stop offset="1" stopColor="#2A1C16" /></linearGradient></defs>
	<rect width={W} height={H} fill={`url(#${id}sky)`} />
	<Glow x={1500} y={640} r={640} c="#FFC070" o={0.6} id={`${id}sun`} sy={0.5} />
	<circle cx={1500} cy={648} r={40} fill="#FFE2A8" />
	{/* far: 嵩山 to the south-east, 邙山 low behind the city */}
	<path d={sm([[-40, 660], [140, 610], [300, 632], [470, 588], [640, 626], [820, 600], [1000, 640], [1180, 612], [1360, 650], [1960, 652], [1960, 720], [-40, 720]])} fill="#5A4A62" opacity={0.75} />
	<Haze y={652} h={90} c="#FFC890" o={0.45} id={`${id}hz`} />
	{/* the plain */}
	<path d={pth([[-40, 660], [1960, 652], [1960, 1080], [-40, 1080]])} fill={`url(#${id}pl)`} />
	{/* the 洛 river winding across it, carrying the dawn */}
	<path d="M-40,880 C220,860 380,790 640,770 S1060,742 1260,712 S1640,676 1960,668 L1960,676 C1640,686 1420,712 1262,724 S920,770 650,792 S240,890 -40,912 Z" fill="#E8A870" opacity={0.85} />
	<path d="M-40,880 C220,860 380,790 640,770 S1060,742 1260,712 S1640,676 1960,668" fill="none" stroke="#FFE0A8" strokeWidth={2} opacity={0.7} />
	{/* the new city (洛邑 / 成周): rammed-earth walls, gate towers, roofs, morning smoke, on the far bank right of the vessel */}
	<path d={pth([[1250, 662], [1730, 656], [1760, 690], [1230, 698]])} fill="#4A3228" />
	<path d="M1230,698 L1760,690" stroke="#FFC890" strokeWidth={2} strokeOpacity={0.7} />
	{[[1300, 650], [1480, 646], [1660, 644]].map(([x, y], i) => <g key={i}><rect x={x - 16} y={y - 22} width={32} height={30} fill="#3A261E" /><path d={pth([[x - 24, y - 22], [x, y - 36], [x + 24, y - 22]])} fill="#2A1A14" /></g>)}
	{Array.from({length: 22}, (_, i) => { const x = 1270 + rnd(i, 41) * 460, y = 668 + rnd(i, 42) * 18; return <path key={i} d={pth([[x - 10, y], [x, y - 8], [x + 10, y]])} fill="#2E1E18" />; })}
	{[1340, 1420, 1590, 1690].map((x, i) => <Plume key={i} x={x} y={664} h={110} w={40} c="#D8B8A8" o={0.25} id={`${id}sm${i}`} seed={i} />)}
	{/* fields on the near bank */}
	{Array.from({length: 8}, (_, i) => <path key={i} d={`M${-40 + i * 80},${1080} L${260 + i * 150},700`} stroke="#3A281E" strokeWidth={2} opacity={0.5} />)}
	{/* the terrace edge in the foreground */}
	<path d={sm([[-40, 900], [420, 880], [960, 872], [1500, 878], [1960, 896], [1960, 1100], [-40, 1100]])} fill="#1E140F" />
	<path d="M-40,900 C420,880 960,870 1500,878 S1960,896 1960,896" stroke="#FFB070" strokeWidth={2} strokeOpacity={0.5} fill="none" />
</g>;
const LDawn: ZunLight = {dir: [0.15, 0.85, 0.42], col: '#FFC890', k: 1.45, amb: 0.3, ambCol: '#6A6080', spec: 1.1, shin: 16, rim: {dir: [-0.5, 0.75, 0.25], col: '#FFD8A0', k: 0.6}};
const F8: React.FC = () => { const c = C('8'), cam = heroCam(0, 7), zs = zunScreen(cam), by = zs.base[1];
	return <Frame bg="#141A2E" c={c} vig={0.55}>
		<Luoyi id="c8" />
		{/* the altar: a rammed-earth block with a mat, the 尊 on it */}
		<path d={pth([[680, by + 2], [1240, by + 2], [1270, by + 30], [650, by + 30]])} fill="#4A3020" /><rect x={650} y={by + 30} width={620} height={200} fill="#24160F" />
		<path d={`M680,${by + 2} L1240,${by + 2}`} stroke="#FFC890" strokeWidth={2} strokeOpacity={0.7} />
		{Array.from({length: 5}, (_, i) => <path key={i} d={`M650,${by + 70 + i * 34} L1270,${by + 70 + i * 34}`} stroke="#1A100B" strokeWidth={3} />)}
		<Zun cam={cam} light={LDawn} id="z8" patina={0.02} fresh={0.6} shadow />
	</Frame>; };

/* ============================== 9 · buried: the strata build over it, the counter rolls ============================== */
const L9: ZunLight = {dir: [0.45, -0.45, 0.78], col: '#FFC890', k: 1.3, amb: 0.28, ambCol: '#5A5048', spec: 0.5, shin: 14, rim: {dir: [-0.5, 0.7, 0.3], col: '#C8A070', k: 0.4}};
const F9: React.FC = () => { const c = C('9'), cam = camH(0, 7, 380, 960, 772), zs = zunScreen(cam);
	const cols = ['#6A5236', '#5A4430', '#7A5E3C', '#4E3A28', '#68503A', '#46342A', '#5E4632', '#3E2E22', '#4A3828', '#36281E'];
	const tops = Array.from({length: 11}, (_, i) => 336 + i * 34 + (i > 4 ? (i - 4) * 26 : 0));
	const band = (i: number) => { const y0 = tops[i], y1 = tops[i + 1] ?? 1100, wv = (y: number, s: number) => Array.from({length: 13}, (_, j) => [-40 + j * 168, y + Math.sin(j * 1.3 + s) * 5 + (rnd(j, s) - 0.5) * 6] as P);
		return <path key={i} d={sm([...wv(y0, i), [1980, y0], [1980, y1 + 10], ...wv(y1 + 10, i + 1).reverse(), [-60, y1 + 10]], true)} fill={cols[i % cols.length]} />; };
	return <Frame bg="#0A0B12" c={c} vig={0.6}>
		<defs><linearGradient id="c9sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0A0C16" /><stop offset="1" stopColor="#2A2A36" /></linearGradient>
			<linearGradient id="c9dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.55} /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#c9sky)" />
		{/* the surface today: grass, a far village, a tree */}
		<path d={sm([[-40, 336], [300, 326], [700, 334], [1100, 324], [1500, 332], [1960, 326], [1960, 360], [-40, 360]])} fill="#2A2418" />
		{[1440, 1520, 1585].map((x, i) => <g key={i}><rect x={x} y={300 - i * 4} width={50} height={34} fill="#1A1612" /><path d={pth([[x - 6, 302 - i * 4], [x + 25, 282 - i * 4], [x + 56, 302 - i * 4]])} fill="#141210" /></g>)}
		<path d={sm([[1700, 330], [1696, 262], [1660, 250], [1676, 214], [1720, 200], [1760, 222], [1770, 256], [1730, 264], [1726, 330]])} fill="#141210" />
		{Array.from({length: 60}, (_, i) => <path key={i} d={`M${i * 33},${330 + rnd(i, 3) * 6} l${-2 + rnd(i, 4) * 4},${-8 - rnd(i, 5) * 10}`} stroke="#3A3424" strokeWidth={2} />)}
		{/* the strata, oldest at the bottom */}
		{cols.map((_, i) => band(i))}
		<rect x={0} y={336} width={W} height={744} fill="url(#c9dk)" />
		{/* what the ground keeps: pebbles, sherds, a root reaching down */}
		{Array.from({length: 60}, (_, i) => { const x = rnd(i, 51) * W, y = 380 + rnd(i, 52) * 680, s = 3 + rnd(i, 53) * 9; if (Math.abs(x - 960) < 300 && y > 480) return null;
			return rnd(i, 54) > 0.7 ? <path key={i} d={pth([[x - s * 1.6, y], [x - s, y - s * 0.8], [x + s * 1.4, y - s * 0.5], [x + s * 1.6, y + s * 0.3]])} fill="#8A5A3A" opacity={0.6} /> : <ellipse key={i} cx={x} cy={y} rx={s} ry={s * 0.7} fill="#2A2018" opacity={0.7} />; })}
		<path d="M1730,334 C1740,390 1700,430 1712,500 S1690,580 1660,620" stroke="#2A1E14" strokeWidth={4} fill="none" /><path d="M1712,420 C1760,450 1790,470 1800,520" stroke="#2A1E14" strokeWidth={2.5} fill="none" />
		{/* the pocket of earth round the vessel, warmer, and its halo */}
		<ellipse cx={960} cy={(zs.lip[1] + zs.base[1]) / 2} rx={330} ry={290} fill="#2A1C12" opacity={0.55} />
		<Glow x={960} y={(zs.lip[1] + zs.base[1]) / 2} r={360} c="#FFB060" o={0.3} id="c9h" />
		<Zun cam={cam} light={L9} id="z9" patina={0.72} shadow={false} />
		{/* the newest layer still falling over it */}
		<Motes n={50} x0={640} x1={1280} y0={360} y1={560} c="#C8A070" seed={91} o={0.45} r={2.4} />
	</Frame>; };

/* ============================== 10 · 1963, 贾村: dug out of the loess ============================== */
const L10: ZunLight = {dir: [0.3, -0.85, 0.42], col: '#FFC888', k: 1.4, amb: 0.32, ambCol: '#7A7068', spec: 0.5, shin: 14, rim: {dir: [-0.4, -0.8, 0.3], col: '#FFE0B0', k: 0.4}};
const F10: React.FC = () => { const c = C('10'), cam = heroCam(0, 7), zs = zunScreen(cam);
	const soilTop = zs.base[1] - 0.24 * (zs.base[1] - zs.lip[1]);
	return <Frame bg="#2A2A30" c={c} vig={0.55}>
		<defs><linearGradient id="c10sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5A6274" /><stop offset="1" stopColor="#D8B088" /></linearGradient>
			<linearGradient id="c10cl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#A07A4C" /><stop offset="0.6" stopColor="#7A5A38" /><stop offset="1" stopColor="#5A4028" /></linearGradient></defs>
		<rect width={W} height={340} fill="url(#c10sky)" />
		<Glow x={160} y={300} r={520} c="#FFD8A0" o={0.55} id="c10sun" sy={0.6} />
		{/* the loess cliff (土崖): vertical joints, a reddish 古土壤 band */}
		<path d={sm([[-40, 330], [300, 336], [700, 326], [1060, 336], [1300, 322], [1960, 330], [1960, 900], [-40, 900]])} fill="url(#c10cl)" />
		<path d={sm([[-40, 470], [500, 480], [1000, 468], [1500, 478], [1960, 470], [1960, 500], [-40, 502]])} fill="#8A4E30" opacity={0.45} />
		<path d={sm([[-40, 640], [600, 650], [1200, 640], [1960, 652], [1960, 668], [-40, 664]])} fill="#8A4E30" opacity={0.3} />
		{Array.from({length: 34}, (_, i) => { const x = 20 + i * 58 + rnd(i, 7) * 30; return <path key={i} d={`M${x},${336 + rnd(i, 8) * 30} L${x + (rnd(i, 9) - 0.5) * 20},${560 + rnd(i, 10) * 300}`} stroke="#4A3420" strokeWidth={2 + rnd(i, 11) * 2} opacity={0.55} />; })}
		{/* the farmhouse up on the 塬: a 关中 single-slope 厦子房 and a tree */}
		<path d={pth([[1340, 330], [1340, 262], [1620, 232], [1620, 330]])} fill="#3A2C22" /><path d={pth([[1320, 266], [1640, 226], [1650, 238], [1330, 278]])} fill="#2A1E16" />
		<rect x={1420} y={282} width={40} height={48} fill="#1A120C" />
		<path d={sm([[1720, 330], [1716, 250], [1680, 236], [1690, 196], [1740, 178], [1790, 200], [1800, 240], [1760, 252], [1756, 330]])} fill="#2E2418" />
		{/* the collapsed earth at the foot of the cliff, the vessel half out of it */}
		<path d={sm([[-40, 900], [400, 860], [700, 836], [1000, 828], [1300, 846], [1960, 880], [1960, 1080], [-40, 1080]])} fill="#5A4028" />
		<Zun cam={cam} light={L10} id="z10" patina={1} shadow={false} />
		<path d={sm([[520, 1080], [560, soilTop + 40], [680, soilTop + 6], [800, soilTop - 8], [900, soilTop + 10], [1010, soilTop - 4], [1140, soilTop + 16], [1290, soilTop + 34], [1420, 1080]])} fill="#6A4C30" />
		<path d={sm([[560, soilTop + 40], [680, soilTop + 6], [800, soilTop - 8], [900, soilTop + 10], [1010, soilTop - 4], [1140, soilTop + 16], [1290, soilTop + 34]], false)} fill="none" stroke="#E8C090" strokeWidth={2.5} strokeOpacity={0.55} />
		{Array.from({length: 26}, (_, i) => <ellipse key={i} cx={560 + rnd(i, 21) * 760} cy={soilTop + 30 + rnd(i, 22) * 160} rx={8 + rnd(i, 23) * 18} ry={6 + rnd(i, 24) * 10} fill={i % 2 ? '#4A3420' : '#7A5A3A'} />)}
		{/* the mattock (镢头) dropped beside him */}
		<path d="M1560,1000 L1380,850" stroke="#2A1C12" strokeWidth={9} strokeLinecap="round" /><path d={pth([[1372, 846], [1350, 892], [1338, 888], [1366, 838]])} fill="#3A3430" />
		{/* the villager, 白羊肚手巾 on his head, crouched at its side, hands on the flange */}
		<Sil id="c10v" x={1430} y={958} k={3.2} flip rim="#FFE0B0" lx={-1} ly={0.3}><Body s={crouch(38, [74, -80], [70, -64])} dress="jacket" hat="towel" /></Sil>
	</Frame>; };

/* ============================== 11 / 12 · the farmhouse corner: a grain jar ============================== */
const Grain: React.FC<{cam: Cam; heap: number; id: string; c1: string; c2: string}> = ({cam, heap, id, c1, c2}) => {
	const ring = lipRing(cam, 13.4, 38.6, 64), cx = ring.reduce((s, q) => s + q[0], 0) / ring.length, cy = ring.reduce((s, q) => s + q[1], 0) / ring.length;
	const left = ring.reduce((a, q) => (q[0] < a[0] ? q : a)), right = ring.reduce((a, q) => (q[0] > a[0] ? q : a));
	const near = ring.filter((q) => q[1] >= cy - 1).sort((a, b) => a[0] - b[0]).map((q) => [q[0], q[1]] as P);
	const px = zunScreen(cam).pxPerCm, top = cy - heap * px;
	const d = 'M' + near.map((q) => `${f1(q[0])},${f1(q[1])}`).join('L') + ` C${f1(right[0] - 20)},${f1(top + 10)} ${f1(cx + 120)},${f1(top)} ${f1(cx)},${f1(top)} C${f1(cx - 120)},${f1(top)} ${f1(left[0] + 20)},${f1(top + 10)} ${f1(left[0])},${f1(left[1])} Z`;
	return <g>
		<defs><linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient><clipPath id={`${id}c`}><path d={d} /></clipPath></defs>
		<path d={d} fill={`url(#${id}g)`} />
		<g clipPath={`url(#${id}c)`}>{Array.from({length: 260}, (_, i) => <ellipse key={i} cx={left[0] + rnd(i, 71) * (right[0] - left[0])} cy={top + rnd(i, 72) * (cy - top + 40)} rx={2.4} ry={1.5} transform={`rotate(${rnd(i, 73) * 180} ${f1(left[0] + rnd(i, 71) * (right[0] - left[0]))} ${f1(top + rnd(i, 72) * (cy - top + 40))})`} fill={i % 3 ? '#5A4020' : '#FFF0C0'} opacity={0.35} />)}</g>
	</g>; };
const LFarm = (winter: boolean): ZunLight => winter ? {dir: [0.35, 0.8, 0.45], col: '#B8CCE8', k: 1.1, amb: 0.3, ambCol: '#4A5262', spec: 0.4, shin: 12, rim: {dir: [-0.5, -0.6, 0.4], col: '#8A9AB8', k: 0.35}}
	: {dir: [0.35, 0.8, 0.45], col: '#FFC888', k: 1.4, amb: 0.3, ambCol: '#5A4A3E', spec: 0.45, shin: 12, rim: {dir: [-0.5, -0.6, 0.4], col: '#C8A070', k: 0.35}};
const Farm: React.FC<{winter?: boolean}> = ({winter = false}) => { const c = C(winter ? '12' : '11'), cam = heroCam(0, 7), zs = zunScreen(cam), wv = winter;
	const wallL = wv ? '#2E3036' : '#4A3826', wallR = wv ? '#24262C' : '#3A2C1E', beam = wv ? '#C8DCF0' : '#FFD49A', fl = wv ? '#1E1E22' : '#2E2218';
	return <Frame bg="#141210" c={c} vig={0.62}>
		<defs><linearGradient id="c11fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={fl} /><stop offset="1" stopColor="#0C0A08" /></linearGradient></defs>
		{/* two mud-plaster walls meeting behind the vessel, the floor */}
		<path d={pth([[0, 0], [960, 0], [960, 770], [0, 930]])} fill={wallL} /><path d={pth([[960, 0], [1920, 0], [1920, 930], [960, 770]])} fill={wallR} />
		{Array.from({length: 50}, (_, i) => <path key={i} d={`M${rnd(i, 81) * 1900},${rnd(i, 82) * 760} l${6 + rnd(i, 83) * 14},${(rnd(i, 84) - 0.5) * 6}`} stroke="#000" strokeOpacity={0.25} strokeWidth={2} />)}
		<path d="M960,0 L960,770" stroke="#000" strokeOpacity={0.35} strokeWidth={3} />
		<path d={pth([[0, 930], [960, 770], [1920, 930], [1920, 1080], [0, 1080]])} fill="url(#c11fl)" />
		{/* the window on the right wall: a wooden lattice (窗棂) with paper panes */}
		<path d={pth([[1360, 370], [1640, 352], [1640, 600], [1360, 596]])} fill={wv ? '#C8D8E8' : '#F2D8A8'} opacity={wv ? 0.75 : 0.85} />
		{[0.25, 0.5, 0.75].map((u, i) => <path key={i} d={`M${1360 + 280 * u},${370 - 18 * u} L${1360 + 280 * u},${596 + 4 * u}`} stroke="#2A1C12" strokeWidth={6} />)}
		{[0.33, 0.66].map((u, i) => <path key={`h${i}`} d={`M1360,${370 + 226 * u} L1640,${352 + 248 * u}`} stroke="#2A1C12" strokeWidth={6} />)}
		<path d={pth([[1348, 360], [1652, 340], [1652, 612], [1348, 608]])} fill="none" stroke="#2A1C12" strokeWidth={12} />
		{wv && <path d={pth([[1360, 596], [1640, 600], [1640, 584], [1360, 582]])} fill="#F2F6FA" opacity={0.6} />}
		{/* its light across the room onto the jar */}
		<Beam pts={[[1360, 370], [1360, 600], [620, 1080], [520, 520]]} c={beam} o={wv ? 0.14 : 0.2} id="c11b" dir={[1, 0, 0, 0.4]} />
		{/* the left wall: a straw hat, a string of maize, a winnowing basket, a hoe */}
		<ellipse cx={420} cy={470} rx={70} ry={20} fill="#2A1E14" /><path d={sm([[380, 470], [392, 430], [448, 430], [460, 470]])} fill="#2A1E14" />
		{Array.from({length: 6}, (_, i) => <ellipse key={i} cx={640 + (i % 2) * 22} cy={430 + i * 30} rx={14} ry={22} fill={wv ? '#3A3428' : '#7A5A2A'} />)}<path d="M651,380 L651,420" stroke="#1A120C" strokeWidth={3} />
		<path d={sm([[150, 880], [190, 680], [340, 660], [400, 860]])} fill="#2E2216" /><path d={sm([[170, 860], [205, 700], [330, 684], [380, 846]], false)} stroke="#1A120C" strokeWidth={3} fill="none" />
		<path d="M520,900 L470,560" stroke="#1E140E" strokeWidth={8} strokeLinecap="round" />
		{/* other jars: a big 瓮 left, a 罐 right */}
		<path d={sm([[560, 960], [530, 870], [548, 800], [600, 780], [700, 780], [752, 800], [770, 870], [740, 960]])} fill="#1E1812" /><path d="M548,800 C600,780 700,780 752,800" stroke={beam} strokeOpacity={0.3} strokeWidth={2} fill="none" />
		<path d={sm([[1250, 900], [1232, 850], [1250, 812], [1300, 806], [1350, 812], [1368, 850], [1350, 900]])} fill="#201A14" />
		<Glow x={960} y={zs.mid[1]} r={380} c={beam} o={wv ? 0.12 : 0.18} id="c11h" />
		<Zun cam={cam} light={LFarm(wv)} id="z11" patina={0.92} shadow />
		<Grain cam={cam} heap={wv ? 0.6 : 3.4} id="c11g" c1={wv ? '#8A7E68' : '#E8C27A'} c2={wv ? '#4A4232' : '#8A6430'} />
		{/* spilled grains on the floor (autumn) / a cobweb on the beak (winter) */}
		{!wv && Array.from({length: 40}, (_, i) => <ellipse key={i} cx={760 + rnd(i, 91) * 420} cy={zs.base[1] + 10 + rnd(i, 92) * 40} rx={2.6} ry={1.6} fill="#D8B068" opacity={0.7} />)}
		{wv && <g stroke="#D8E0EA" strokeOpacity={0.35} strokeWidth={1} fill="none">{[0, 1, 2, 3].map((i) => <path key={i} d={`M${1190 - i * 10},${428 + i * 12} Q${1215},${470} ${1236 + i * 4},${520 - i * 8}`} />)}
			{[0, 1, 2, 3, 4].map((i) => <path key={`s${i}`} d={`M1196,${430} L${1240 - i * 12},${470 + i * 14}`} />)}</g>}
	</Frame>; };

/* ============================== 13 · on a handcart into the scrap yard ============================== */
const F13: React.FC = () => { const c = C('13'), cam = heroCam(-14, 9), zs = zunScreen(cam), by = zs.base[1];
	return <Frame bg="#0E0B0A" c={c} vig={0.55}>
		<YardBG />
		{/* the 架子车 seen from behind: the bed, its side rails, the tyres, the shafts running to the man pulling it into the yard */}
		<path d={pth([[1380, 860], [1560, 812], [1592, 818], [1420, 870]])} fill="#2A1E16" />
		<path d={pth([[1230, 850], [1470, 800], [1490, 806], [1262, 858]])} fill="#2A1E16" />
		<Person id="c13p" f={{kind: 'worker', lean: 22, stride: 0.5, hN: [6, -86], hF: [2, -88]}} x={1540} y={846} k={2.3} rim="#FFB874" lx={1} ly={0.1} />
		<path d={pth([[600, by - 6], [1300, by - 30], [1420, by + 22], [560, by + 60]])} fill="#3A2C22" />
		{Array.from({length: 6}, (_, i) => <path key={i} d={`M${600 + i * 4},${by - 6 + i * 11} L${1300 + i * 20},${by - 30 + i * 9}`} stroke="#1E1610" strokeWidth={2} />)}
		<path d={`M600,${by - 6} L1300,${by - 30}`} stroke="#FFC080" strokeWidth={2} strokeOpacity={0.5} />
		<path d={pth([[560, by + 60], [1420, by + 22], [1420, by + 50], [560, by + 92]])} fill="#1C140E" />
		<path d={sm([[480, by + 40], [530, by - 50], [580, by + 30], [560, 1100], [490, 1100]])} fill="#141110" /><path d={sm([[530, by - 50], [580, by + 30], [560, 1100]], false)} stroke="#FFB070" strokeWidth={2} strokeOpacity={0.4} fill="none" />
		<path d={sm([[1400, by + 20], [1440, by - 60], [1488, by + 10], [1476, 1100], [1410, 1100]])} fill="#141110" /><path d={sm([[1440, by - 60], [1488, by + 10], [1476, 1100]], false)} stroke="#FFB070" strokeWidth={2} strokeOpacity={0.5} fill="none" />
		<Zun cam={cam} light={L1} id="z13" patina={0.95} shadow />
		{/* a rope lashing it to the rail */}
		<path d={`M${zs.base[0] - 230},${by + 10} Q${zs.base[0] - 120},${by - 160} ${zs.base[0] - 40},${by - 190}`} stroke="#C8B08A" strokeWidth={3} fill="none" opacity={0.75} />
	</Frame>; };

/* ============================== 14 · weighed by the jin: the poise slides, the tag says 30元 ============================== */
const F14: React.FC = () => { const c = C('14'), cam = camH(0, 7, 540, 900, 660), zs = zunScreen(cam), by = zs.base[1];
	const bx0 = 1200, bx1 = 1860, bY = 470;
	return <Frame bg="#0E0B0A" c={c} vig={0.55}>
		<YardBG />
		<path d={pth([[620, by], [1180, by], [1206, by - 14], [646, by - 14]])} fill="#3A3330" /><rect x={620} y={by} width={560} height={26} fill="#1E1A18" />
		<path d={`M620,${by} L1180,${by}`} stroke="#C99A6A" strokeWidth={2} strokeOpacity={0.6} />
		<Zun cam={cam} light={L1} id="z14" patina={0.95} shadow />
		<Tag30 cam={cam} />
		{/* the beam, close: notches, the poise mid-slide with its trail, the counterweight hanger */}
		<rect x={bx0} y={bY - 20} width={bx1 - bx0} height={24} fill="#2E2826" /><path d={`M${bx0},${bY - 20} L${bx1},${bY - 20}`} stroke="#F0B070" strokeWidth={2.4} strokeOpacity={0.75} />
		{Array.from({length: 22}, (_, i) => <path key={i} d={`M${bx0 + 20 + i * 30},${bY - 20} L${bx0 + 20 + i * 30},${bY - (i % 5 ? 10 : 2)}`} stroke="#C9A27A" strokeWidth={1.8} opacity={0.7} />)}
		{[0, 1, 2, 3].map((i) => <rect key={i} x={1500 + i * 22} y={bY - 40} width={36} height={52} rx={5} fill="#3A3230" opacity={0.12 + i * 0.06} />)}
		<rect x={1590} y={bY - 42} width={40} height={56} rx={5} fill="#3A3230" stroke="#E8A868" strokeWidth={2} strokeOpacity={0.6} />
		<rect x={1840} y={bY - 40} width={22} height={600} fill="#2A2422" />
		{/* the worker's hand pushing the poise (his arm from out of frame, right) */}
		<Sil id="c14a" x={0} y={0} k={1} rim="#FFB874" lx={-1} ly={-0.3}>
			<path d={sleeve([1990, 760], [1800, 640], [1660, 470], 34, 30, 26)} /><path d={mitten([1800, 640], [1652, 462])} transform="translate(1652,462) scale(5.2) translate(-1652,-462)" /></Sil>
	</Frame>; };

/* ============================== 15 · the furnace, nearer ============================== */
const L15: ZunLight = {dir: [0.2, 0.9, 0.35], col: '#FF7A30', k: 1.6, amb: 0.16, ambCol: '#3A2430', spec: 0.6, shin: 12, rim: {dir: [-0.3, 0.9, 0.3], col: '#FFB060', k: 0.8}};
const Furnace: React.FC<{x: number; y: number; s: number; id: string; heat?: number}> = ({x, y, s, id, heat = 1}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<path d={pth([[-220, 0], [-200, -520], [-120, -600], [120, -600], [200, -520], [220, 0]])} fill="#2A1A14" />
	{Array.from({length: 12}, (_, i) => <path key={i} d={`M-210,${-40 - i * 44} L210,${-40 - i * 44}`} stroke="#1A100C" strokeWidth={4} />)}
	<rect x={-60} y={-900} width={120} height={300} fill="#1E140F" />
	<path d={sm([[-110, -40], [-110, -230], [-60, -300], [60, -300], [110, -230], [110, -40]])} fill="#120806" />
	<path d={sm([[-90, -40], [-90, -220], [-50, -276], [50, -276], [90, -220], [90, -40]])} fill={`url(#${id}fm)`} opacity={heat} />
	<defs><radialGradient id={`${id}fm`} cx="50%" cy="80%" r="70%"><stop offset="0" stopColor="#FFE8A0" /><stop offset="0.35" stopColor="#FF9A30" /><stop offset="0.8" stopColor="#C83A10" /><stop offset="1" stopColor="#5A1408" /></radialGradient></defs>
	{Array.from({length: 7}, (_, i) => <path key={i} d={sm([[-70 + i * 22, -50], [-80 + i * 22 + rnd(i, 3) * 20, -150 - rnd(i, 4) * 80], [-56 + i * 22, -60]])} fill="#FFD27A" opacity={0.55 * heat} />)}
	<path d="M-110,-40 L110,-40" stroke="#FF9A40" strokeWidth={4} opacity={0.7 * heat} />
</g>;
const F15: React.FC = () => { const c = C('15'), cam = heroCam(0, 7), zs = zunScreen(cam), by = zs.base[1];
	return <Frame bg="#080506" c={c} vig={0.6}>
		<YardBG mood="night" piles={false} />
		<Glow x={1560} y={760} r={700} c="#FF6A20" o={0.5} id="c15g" />
		<Furnace x={1580} y={1010} s={0.82} id="c15f" />
		{pile(960, by + 150, 900, 230, 13, '#1A100C', '#FF8A40', 1.4)}
		{pile(300, 1000, 560, 200, 17, '#120B08', '#C85A28', 1.2)}
		<Zun cam={cam} light={L15} id="z15" patina={0.95} shadow={false} />
		<Motes n={60} x0={1080} x1={1880} y0={200} y1={900} c="#FFB050" seed={151} o={0.8} r={2.6} />
	</Frame>; };

/* ============================== 16 · extreme close: the 饕餮 eye in the firelight ============================== */
const L16: ZunLight = {dir: [0.35, 0.88, 0.3], col: '#FF5A20', k: 1.8, amb: 0.12, ambCol: '#3A1008', spec: 0.9, shin: 12, rim: {dir: [-0.3, 0.9, 0.35], col: '#FFA040', k: 0.9}};
const F16: React.FC = () => { const c = C('16'), th = 5.25 / 9.4, z = 14.7, Pq = surfPt(th, z, 0.6), a = (th * 180 / Math.PI - 4) * Math.PI / 180, D = 62;
	const cam = lookAt([Pq[0] + D * Math.cos(a), Pq[1] + D * Math.sin(a), Pq[2] + 4], Pq, 6600, 960, 690);
	return <Frame bg="#0A0303" c={c} vig={0.8}>
		<defs><radialGradient id="c16bg" cx="80%" cy="70%" r="80%"><stop offset="0" stopColor="#5A1A08" /><stop offset="1" stopColor="#0A0303" /></radialGradient></defs>
		<rect width={W} height={H} fill="url(#c16bg)" />
		<Zun cam={cam} light={L16} id="z16" patina={0.9} shadow={false} inscription={false} />
		<Glow x={1800} y={900} r={700} c="#FF6A20" o={0.28} id="c16f" />
		<Motes n={40} x0={1100} x1={1900} y0={300} y1={1060} c="#FFB050" seed={161} o={0.8} r={2.8} />
	</Frame>; };

/* ============================== the stop · black, the furnace glow once ============================== */
const FStop: React.FC = () => { const c = C('停'), cam = heroCam(0, 7);
	return <Frame bg="#000" c={c} vig={0.85}>
		<rect width={W} height={H} fill="#020101" />
		<Glow x={1500} y={1000} r={900} c="#C83A10" o={0.22} id="csg" sy={0.6} />
		<SilZun cam={cam} id="csil" rim="#E0501A" halo="#A02A08" haloO={0.35} rimO={0.75} body="#030101" />
	</Frame>; };

/* ============================== 17 · the museum man stops: there it is ============================== */
const L17: ZunLight = {dir: [0.3, -0.8, 0.55], col: '#FFE0B8', k: 1.45, amb: 0.34, ambCol: '#7A8494', spec: 0.55, shin: 14, rim: {dir: [-0.4, 0.8, 0.35], col: '#B8C8DC', k: 0.45}};
const F17: React.FC = () => { const c = C('17'), cam = heroCam(0, 7), zs = zunScreen(cam), by = zs.base[1];
	return <Frame bg="#3A4A5E" c={c} vig={0.55}>
		<YardBG mood="morning" piles={false} />
		{pile(960, by + 150, 900, 230, 13, '#1E1612', '#F0C898', 1.4)}
		{pile(1700, 1000, 520, 220, 19, '#18120E', '#D8B088', 1.2)}
		<Beam pts={[[0, 420], [0, 700], [900, 1000], [1120, 560]]} c="#FFE6C0" o={0.2} id="c17b" dir={[0, 0, 1, 0.3]} />
		<Zun cam={cam} light={L17} id="z17" patina={0.95} shadow={false} />
		{/* the man from the 宝鸡市博物馆: cadre jacket and cap, a satchel; he has stopped mid-stride and leans to look */}
		<Sil id="c17m" x={1440} y={940} k={3.0} flip rim="#FFE6C0" lx={-1} ly={0.25}><Body s={{...stand(12, 0.42, [40, -116], [6, -84], 22)}} dress="zsz" hat="cadre" /></Sil>
		<Sil id="c17bag" x={1440} y={940} k={3.0} flip rim="#FFE6C0" lx={-1} ly={0.25}><path d={sm([[-20, -98], [-6, -98], [-4, -76], [-22, -74]])} /><path d={tube([-14, -98], [10, -138], 1.2, 1.2)} /></Sil>
	</Frame>; };

/* ============================== 18 · lifted off the pile and carried away in his arms ============================== */
const L18: ZunLight = {dir: [0.35, -0.8, 0.5], col: '#FFE0B8', k: 1.5, amb: 0.34, ambCol: '#7A8494', spec: 0.55, shin: 14, rim: {dir: [-0.4, 0.8, 0.35], col: '#B8C8DC', k: 0.45}};
const F18: React.FC = () => { const c = C('18'), cam = camH(0, 5, 400, 900, 640), zs = zunScreen(cam), k = zs.pxPerCm * 0.96, X = 1300, Y = zs.base[1] + 98 * k;
	const s = stand(-6, 0.35, toLocal([zs.base[0] - 30, zs.base[1] + 14], X, Y, k, true), toLocal([zs.base[0] - 12.2 * k, zs.mid[1] + 20], X, Y, k, true), 14);
	const hF = s.hF, hN = s.hN;
	return <Frame bg="#3A4A5E" c={c} vig={0.55}>
		<YardBG mood="morning" />
		<Sil id="c18b" x={X} y={Y} k={k} flip rim="#FFE6C0" lx={-1} ly={0.2}><Body s={s} dress="zsz" hat="cadre" part="back" /></Sil>
		<Zun cam={cam} light={L18} id="z18" patina={0.92} shadow={false} />
		<Sil id="c18f" x={X} y={Y} k={k} flip rim="#FFE6C0" lx={-1} ly={0.2}><Body s={s} dress="zsz" hat="cadre" part="front" /><path d={mitten([hF[0] - 12, hF[1] + 4], hF)} /></Sil>
		{void hN}
	</Frame>; };

/* ============================== 19 / 22 · 1975, the 故宫 restoration room ============================== */
const LRoom = (clean: boolean): ZunLight => ({dir: [-0.15, -0.55, 0.82], col: '#FFE0B0', k: clean ? 1.9 : 1.45, amb: 0.3, ambCol: '#5A6268', spec: clean ? 1.8 : 0.6, shin: clean ? 16 : 14,
	rim: {dir: [-0.5, 0.8, 0.3], col: '#B8C8D8', k: clean ? 0.8 : 0.45}, inside: 0.5});
const Room: React.FC<{clean?: boolean}> = ({clean = false}) => { const c = C(clean ? '22' : '19'), cam = heroCam(0, 7), zs = zunScreen(cam), by = zs.base[1];
	return <Frame bg="#0C0B0A" c={c} vig={0.62}>
		<defs><linearGradient id="r19w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1C1A18" /><stop offset="1" stopColor="#2C2622" /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#r19w)" />
		{/* the window: lattice, and through it the 故宫 — a red wall and a yellow-glazed roof with its upturned eave */}
		<rect x={1250} y={240} width={460} height={400} fill="#6A7A8C" />
		<path d={pth([[1250, 560], [1710, 556], [1710, 640], [1250, 640]])} fill="#7A2A1E" />
		<path d={sm([[1250, 470], [1330, 440], [1600, 432], [1710, 420], [1710, 470], [1640, 462], [1330, 472]])} fill="#B88A3A" />
		<path d={pth([[1300, 474], [1680, 466], [1680, 560], [1300, 560]])} fill="#5A1E16" />
		<path d={sm([[1250, 470], [1300, 448], [1330, 440]], false)} stroke="#2A1E14" strokeWidth={5} fill="none" />
		{[0.333, 0.666].map((u, i) => <path key={i} d={`M${1250 + 460 * u},240 L${1250 + 460 * u},640`} stroke="#1A1612" strokeWidth={10} />)}
		<path d="M1250,440 L1710,440" stroke="#1A1612" strokeWidth={10} /><rect x={1240} y={230} width={480} height={420} fill="none" stroke="#1A1612" strokeWidth={18} />
		{/* the bench and its tools */}
		<path d={pth([[0, by - 4], [1920, by - 4], [1920, by + 24], [0, by + 24]])} fill="#4A3A2C" /><rect x={0} y={by + 24} width={W} height={300} fill="#1A1410" />
		<path d={`M0,${by - 4} L1920,${by - 4}`} stroke="#FFE0B0" strokeWidth={2} strokeOpacity={0.35} />
		<rect x={1260} y={by - 14} width={260} height={12} fill="#D8D0C0" opacity={0.6} />
		{[0, 1, 2, 3].map((i) => <path key={i} d={`M${1280 + i * 56},${by - 12} L${1320 + i * 56},${by - 20}`} stroke="#C8C8C8" strokeWidth={3} />)}
		<path d={sm([[1600, by - 4], [1592, by - 70], [1650, by - 70], [1642, by - 4]])} fill="#2A2420" />{[0, 1, 2].map((i) => <path key={i} d={`M${1612 + i * 12},${by - 70} L${1600 + i * 18},${by - 170}`} stroke="#3A2C20" strokeWidth={5} />)}
		{[0, 1, 2].map((i) => <rect key={i} x={340 + i * 50} y={by - 54 + i * 6} width={30} height={50 - i * 6} rx={4} fill="#3A4A50" opacity={0.8} />)}
		{/* the work lamp: an enamel shade on an arm, pointed into the vessel */}
		<path d={`M240,${by - 4} L300,${by - 4} L280,${by - 20} L262,${by - 20} Z`} fill="#141210" /><path d={`M272,${by - 20} L330,420 L560,360`} stroke="#141210" strokeWidth={10} fill="none" strokeLinejoin="round" />
		<path d={pth([[520, 330], [640, 360], [700, 470], [520, 450]])} fill="#2A3A34" /><ellipse cx={612} cy={462} rx={90} ry={22} transform="rotate(8 612 462)" fill="#FFF0D0" />
		<Beam pts={[[540, 456], [700, 474], [1200, by], [700, by]]} c="#FFE8C0" o={0.22} id="r19b" />
		{clean && <Beam pts={[[880, 400], [1040, 400], [1100, 0], [820, 0]]} c="#FFD890" o={0.18} id="r22up" dir={[0, 1, 0, 0]} />}
		<Glow x={960} y={zs.mid[1]} r={420} c="#FFE0B0" o={clean ? 0.3 : 0.16} id="r19h" />
		<Zun cam={cam} light={LRoom(clean)} id="z19" patina={clean ? 0.06 : 0.82} shadow />
		{/* the restorer's hands: a scalpel at the lip (his arm from out of frame, top right), a brush at the belly */}
		{!clean && <Sil id="r19a" x={0} y={0} k={1} rim="#FFE6C0" lx={-1} ly={-0.6}>
			<path d={sleeve([2000, 180], [1560, 300], [1236, 404], 70, 52, 40)} /><path d={mitten([1560, 300], [1236, 404])} transform="translate(1236,404) scale(6) translate(-1236,-404)" />
			<path d={sleeve([2000, 1000], [1700, 870], [1290, 740], 66, 50, 40)} /><path d={mitten([1700, 870], [1290, 740])} transform="translate(1290,740) scale(6) translate(-1290,-740)" /></Sil>}
		{!clean && <><path d="M1210,396 L1150,382" stroke="#E8E8E8" strokeWidth={4} strokeLinecap="round" /><path d="M1262,738 L1196,716" stroke="#3A2C20" strokeWidth={9} strokeLinecap="round" /><path d={sm([[1200, 718], [1166, 698], [1150, 706], [1180, 726]])} fill="#C8A878" />
			<Motes n={24} x0={1080} x1={1200} y0={380} y1={470} c="#8A6A48" seed={191} o={0.9} r={2.2} /></>}
	</Frame>; };

/* ============================== 20 / 21 · KF3, the inscription comes out; 中国 ignites ============================== */
const F20: React.FC = () => <KF3 ov={<Ov c={C('20')} />} reveal={0.62} glow={0} />;
const F21: React.FC = () => <KF3 ov={<Ov c={C('21')} />} reveal={0.96} glow={1} brush={false} f={4800} cy={560} />;

/* ============================== 23 · the shining 尊 and the 洛邑 dawn, again ============================== */
const L23: ZunLight = {dir: [0.2, 0.85, 0.45], col: '#FFD8A8', k: 1.9, amb: 0.34, ambCol: '#6A6080', spec: 1.8, shin: 14, rim: {dir: [-0.6, 0.6, 0.4], col: '#FFE0B8', k: 0.8}};
const F23: React.FC = () => { const c = C('23'), cam = heroCam(10, 6);
	return <Frame bg="#141A2E" c={c} vig={0.62}>
		<Luoyi id="c23" o={0.85} />
		<rect width={W} height={H} fill="#0A0806" opacity={0.25} />
		<Glow x={960} y={900} r={340} c="#FFE0B8" o={0.3} id="c23p" sy={0.14} />
		<Zun cam={cam} light={L23} id="z23" patina={0.04} shadow />
	</Frame>; };

/* ============================== 24 · a slow orbit, the light warms ============================== */
const L24: ZunLight = {dir: [0.6, 0.45, 0.65], col: '#FFC888', k: 2.0, amb: 0.32, ambCol: '#5A4A44', spec: 1.9, shin: 14, rim: {dir: [-0.7, -0.4, 0.5], col: '#FFB870', k: 1.0}};
const F24: React.FC = () => { const c = C('24'), cam = heroCam(36, 8);
	return <Frame bg="#0C0806" c={c} vig={0.7}>
		<defs><radialGradient id="c24bg" cx="56%" cy="55%" r="65%"><stop offset="0" stopColor="#4A2E1A" /><stop offset="0.6" stopColor="#1A100A" /><stop offset="1" stopColor="#0A0605" /></radialGradient></defs>
		<rect width={W} height={H} fill="url(#c24bg)" />
		<ellipse cx={960} cy={900} rx={560} ry={70} fill="none" stroke="#FFC888" strokeOpacity={0.18} strokeWidth={2} />
		<Glow x={960} y={900} r={420} c="#FFC888" o={0.32} id="c24p" sy={0.15} />
		<Zun cam={cam} light={L24} id="z24" patina={0.04} shadow />
		<Motes n={36} x0={500} x1={1500} y0={300} y1={900} c="#FFE0B0" seed={241} o={0.35} />
	</Frame>; };

/* ============================== 27 · a flash of the furnace over the shining 尊 ============================== */
const F27: React.FC = () => <KF4 ov={<Ov c={C('27')} />} visitors={1}
	under={<g style={{mixBlendMode: 'screen'}}><Glow x={380} y={900} r={760} c="#FF5A18" o={0.55} id="c27a" sy={0.8} /><Furnace x={300} y={1080} s={0.9} id="c27f" heat={0.9} /></g>}
	over={<svg width={W} height={H} style={{position: 'absolute', mixBlendMode: 'screen'}}><defs><linearGradient id="c27r" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#FF4A10" stopOpacity={0.5} /><stop offset="0.5" stopColor="#C82A08" stopOpacity={0.12} /><stop offset="1" stopColor="#000" stopOpacity={0} /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#c27r)" /><Motes n={50} x0={0} x1={900} y0={400} y1={1060} c="#FFB050" seed={271} o={0.9} r={2.8} /></svg>} />;

/* ============================== 28 · the empty gate at dusk ============================== */
const F28: React.FC = () => { const c = C('28'), cam = heroCam(0, 7);
	return <Frame bg="#0E0B0A" c={c} vig={0.6}>
		<YardBG />
		<ScaleDeck />
		{/* where it stood: only a faint memory of its outline */}
		<g opacity={0.22}><SilZun cam={cam} id="c28g" rim="#F0C070" halo="#FFB060" haloO={0.4} body="#2A1C12" bodyO={0.25} /></g>
		{/* the gate: two brick posts, one iron leaf swung open, the sign board on the right post */}
		<rect x={0} y={250} width={150} height={830} fill="#1A120E" /><path d="M150,250 L150,1080" stroke="#FFB070" strokeWidth={2.5} strokeOpacity={0.5} />
		{Array.from({length: 18}, (_, i) => <path key={i} d={`M0,${290 + i * 44} L150,${290 + i * 44}`} stroke="#0E0907" strokeWidth={3} />)}
		<rect x={1700} y={250} width={220} height={830} fill="#1A120E" /><path d="M1700,250 L1700,1080" stroke="#FFB070" strokeWidth={2.5} strokeOpacity={0.6} />
		{Array.from({length: 18}, (_, i) => <path key={i} d={`M1700,${290 + i * 44} L1920,${290 + i * 44}`} stroke="#0E0907" strokeWidth={3} />)}
		<rect x={1736} y={370} width={88} height={420} fill="#D8C8A6" opacity={0.85} />
		{'废品收购站'.split('').map((ch, i) => <text key={i} x={1780} y={432 + i * 78} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={58} fill="#2A1A12">{ch}</text>)}
		<g stroke="#1A120E" strokeWidth={8} fill="none">{Array.from({length: 7}, (_, i) => <path key={i} d={`M${160 + i * 40},${470 + i * 8} L${160 + i * 40},${1000 - i * 6}`} />)}<path d="M160,470 L400,520 M160,1000 L400,960 M160,735 L400,740" /></g>
	</Frame>; };

/* ============================== END · 132.77 → 140.0: the end card over the dimmed 尊 in the spotlight ============================== */
/* house style (ep54 End): the J seal pressed in at the top, the 片名 in two gold rows, the closing question centred at 76 px,
   the pill, the sources line; the shot under it dimmed to about 30 %; fade to black at 140.0. Sources: PROVISIONAL (the two
   pages the producer checked v1.1 against) until facts.md gives the line. */
const END_TITLE = ['“中国”两个字，', '最早出现在哪？'], END_Q = '你家里，有没有一件被当成破烂的老东西？';
const END_SRC = '新华网《“何以中国”：一件何尊，见证“中国”》（2023-07-09）· 中国社会科学网（2022-07-28）· 宝鸡青铜器博物院';
const EndCard: React.FC = () => { const fs = 76, tw = fs * END_Q.length * 1.03, gold = '#F2C66E';
	return <>
		<div style={{position: 'absolute', inset: 0, background: 'rgba(8,4,3,0.66)'}} />
		<Img src={SEAL_SRC} style={{position: 'absolute', left: 960 - 70, top: 110, width: 140, height: 140, transform: 'rotate(-6deg)', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 284, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, lineHeight: 1.35, letterSpacing: '0.05em', color: gold, textShadow: thK.halo, whiteSpace: 'nowrap'}}>{END_TITLE[0]}<br />{END_TITLE[1]}</div>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 260, top: 560 - 150, width: tw + 520, height: fs * 1.5 + 300, background: 'radial-gradient(closest-side, rgba(16,7,4,0.42), rgba(16,7,4,0.36) 45%, rgba(16,7,4,0.15) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.5, letterSpacing: '0.03em', color: thK.ink, textShadow: thK.halo, whiteSpace: 'nowrap'}}>{END_Q}</div>
		<div style={{position: 'absolute', left: 760, top: 742, width: 400, height: 58, borderRadius: 29, border: `2px solid ${gold}`, background: 'rgba(255,217,138,0.08)', textAlign: 'center', lineHeight: '58px', fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color: gold}}>关注 Juno · 一起看懂世界</div>
		<div style={{position: 'absolute', left: SAFE_X, right: SAFE_X, top: 868, textAlign: 'center', fontFamily: SANS, fontSize: 24, lineHeight: 1.6, color: '#D8CCB6', opacity: 0.88, whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}>{END_SRC}</div>
	</>; };
const FQ: React.FC = () => { const c = C('END'), cam = camH(6, 7, 440, 960, 640);
	return <Frame bg="#050505" c={c} vig={0.75} after={<EndCard />}>
		<defs><linearGradient id="cqc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE8C8" stopOpacity={0.12} /><stop offset="1" stopColor="#FFE8C8" stopOpacity={0.03} /></linearGradient></defs>
		<rect width={W} height={H} fill="#060606" />
		<path d="M900,-20 L1020,-20 L1290,930 L630,930 Z" fill="url(#cqc)" />
		<Glow x={960} y={930} r={330} c="#FFE0B8" o={0.38} id="cqp" sy={0.12} />
		<Zun cam={cam} light={L4} id="zq" patina={0.04} shadow />
	</Frame>; };

/* ============================== the list: frame i = card i ============================== */
export const FRAMES: {c: CardD; F: React.FC}[] = [
	{c: C('1'), F: () => <KF1 ov={<Ov c={C('1')} />} />},
	{c: C('2'), F: F2},
	{c: C('T'), F: FT},
	{c: C('3'), F: () => <KF2 ov={<Ov c={C('3')} />} />},
	{c: C('4'), F: F4},
	{c: C('5'), F: F5},
	{c: C('6'), F: F6},
	{c: C('7'), F: F7},
	{c: C('8'), F: F8},
	{c: C('9'), F: F9},
	{c: C('10'), F: F10},
	{c: C('11'), F: () => <Farm />},
	{c: C('12'), F: () => <Farm winter />},
	{c: C('13'), F: F13},
	{c: C('14'), F: F14},
	{c: C('15'), F: F15},
	{c: C('16'), F: F16},
	{c: C('停'), F: FStop},
	{c: C('17'), F: F17},
	{c: C('18'), F: F18},
	{c: C('19'), F: () => <Room />},
	{c: C('20'), F: F20},
	{c: C('21'), F: F21},
	{c: C('22'), F: () => <Room clean />},
	{c: C('23'), F: F23},
	{c: C('24'), F: F24},
	{c: C('25'), F: () => <KF4 ov={<Ov c={C('25')} />} visitors={1} />},
	{c: C('26'), F: () => <KF4 ov={<Ov c={C('26')} />} visitors={4} az={-6} />},
	{c: C('27'), F: F27},
	{c: C('28'), F: F28},
	{c: C('END'), F: FQ},
];
void ([] as (P | ZunProps | typeof L3 | typeof proj | typeof SCALE)[]);
