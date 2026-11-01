import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {Subs, Stamp, Seal, SANS, SERIF, KAI} from '../qq50/kit50';
import {useStampFonts, SEAL_SRC, SAFE_X} from '../qq44/skin44';
import {Zun, lookAt, ZunLight, V3, Cam, proj, ZUN, Rz, rho, zunScreen} from './zun55h';
import {KF3, L3, thK, sm, pth, f1, rnd, P, Glow, Haze, Vig, Plume, Person, YardBG, Mood, pile, shard, ForgeBG, Tag30, tube, sleeve} from './kf55h';
import {Body, Sil, kneel, stand} from './rig55h';
import {HOME_X, HOME_Y, HOME_BOX, homeCam, rotL} from './home55h';
/* ep55 · 何尊 — ALL the key frames, round 2 (owner: 「size一直inconsistant 忽大忽小的」).
   One rule above all: every card's key frame shows the 尊 in HOME framing (home55h: base centre (960, 880), 560 px tall,
   a 3/4 view at az ±30/±60, all four the same silhouette box), drawn through ONE path (Frame → HZ), so every cut matches on
   it. Close-ups (2, 6, 7, 16, 20, 21) are pushes inside the shot: each has a HOME start frame and a close-up end frame.
   People and props sit at a natural size for their scene, staged in the mid-ground or as hands at the edge of frame, never
   toy-sized against it; the quiet label 「高 38.8 厘米 · 示意放大」 by its foot says the 尊 is enlarged. Card 9 is the burial
   time-lapse; T lands over an orbiting silhouette that heats up into card 3's molten 尊 at the same place. */
const W = 1920, H = 1080;

/* ============================== cards ============================== */
type St = {y?: string; place?: string; note: string};
export type CardD = {id: string; t: number; act: string; rows?: string[]; age?: string; roll?: boolean; st?: St; mode?: 'tl' | 'big' | 'none'; bigY?: number};
export const CARDS_ALL: CardD[] = [
	{id: '1', t: 0.0, act: '废品站，30元', rows: ['最早写着“中国”两个字的国宝，', '在废品站里，只值[30块钱]。'], age: '约3000', st: {y: '1965', place: '宝鸡', note: '废品收购站'}},
	{id: '2', t: 5.98, act: '推近饕餮双眼', rows: ['假如说，', '你就是这件国宝。'], age: '约3000'},
	{id: 'T', t: 9.05, act: '标题砸下，剪影转而发热', mode: 'none'},
	{id: '3', t: 15.03, act: '剪影烧成铜水，出生', rows: ['约三千年前，西周。', '你在火里出生。'], age: '0', st: {y: '西周初', place: '成周', note: '铸造'}},
	{id: '4', t: 19.56, act: '冷却，何在远处跪拜', rows: ['铸你的人，叫“何”，', '周王室的一位“宗小子”。'], age: '0'},
	{id: '5', t: 24.09, act: '成王训话，何跪听', rows: ['周成王亲政第五年，在新都洛邑，', '把何这些宗小子叫来，训了一番话。'], age: '0', st: {y: '西周', place: '成周', note: '成王五年'}},
	{id: '6', t: 28.62, act: '升起，俯冲进尊口', rows: ['何把这番话，铸进了你的肚子里，', '12行，122个字。'], age: '0'},
	{id: '7', t: 33.15, act: '推向“宅兹中国”', rows: ['其中，有这样四个字：', '“宅兹[中国]”。'], age: '0'},
	{id: '8', t: 37.68, act: '祭台，洛邑黎明', rows: ['意思是：我要住在这天下的中心，', '在这里，治理百姓。'], age: '0'},
	{id: '9', t: 42.20, act: '延时：埋入三千年', rows: ['后来，你被埋进了土里。', '一埋，就是三千年。'], age: '1536', roll: true},
	{id: '10', t: 46.73, act: '贾村，挖出土', rows: ['1963年，陕西宝鸡贾村，', '你被一个村民，从土里挖了出来。'], age: '约3000', st: {y: '1963', place: '宝鸡', note: '贾村'}},
	{id: '11', t: 51.26, act: '农家墙角，装满粮', rows: ['他把你搬回家，', '用来装粮食。'], age: '约3000'},
	{id: '12', t: 55.79, act: '同一墙角，冬天', rows: ['没人知道你是谁。', '你只是一个，装粮食的罐子。'], age: '约3000'},
	{id: '13', t: 60.32, act: '板车拉进废品站', rows: ['两年后，', '你流落到了废品收购站。'], age: '约3000', st: {y: '1965', place: '宝鸡', note: '废品收购站'}},
	{id: '14', t: 64.85, act: '手推秤砣，30元', rows: ['在这里，你就是一堆废铜，', '按斤称。'], age: '约3000'},
	{id: '15', t: 69.37, act: '废铜堆上，炉火逼近', rows: ['再晚一步——'], age: '约3000'},
	{id: '16', t: 73.90, act: '推近火光里的眼', rows: ['你，就要被销毁了。'], age: '约3000', mode: 'big', bigY: 150},
	{id: '停', t: 76.17, act: '黑场，炉火一闪', mode: 'none'},
	{id: '17', t: 78.43, act: '专家远处停步', rows: ['就在这时，宝鸡市博物馆的专家，', '来废品站寻宝，看见了你。'], age: '约3000'},
	{id: '18', t: 82.96, act: '抱起你，带走', rows: ['30块钱，把你买了回来。'], age: '约3000'},
	{id: '19', t: 87.17, act: '故宫，台灯下除锈', rows: ['1975年，你被送进北京故宫，', '参加文物展，专家给你除锈——'], age: '约3000', st: {y: '1975', place: '北京', note: '故宫除锈'}},
	{id: '20', t: 92.02, act: '俯冲进口，铭文现身', rows: ['锈层下面，', '露出了12行、122个字。'], age: '约3000'},
	{id: '21', t: 96.54, act: '推近，“中国”点亮', rows: ['宅兹[中国]。'], age: '约3000', mode: 'big', bigY: 150},
	{id: '22', t: 101.07, act: '拉出，整尊锃亮', rows: ['这是目前所知，', '“中国”一词最早的文字记载。'], age: '约3000'},
	{id: '23', t: 105.60, act: '洛阳平原，晨光', rows: ['那时的“中国”，', '说的是天下的中心，洛阳一带。'], age: '约3000'},
	{id: '24', t: 110.13, act: '环绕，光变暖', rows: ['三千年后，', '它成了一个国家的名字。'], age: '约3000'},
	{id: '25', t: 114.66, act: '夜间展柜，禁止出境', rows: ['后来，你成了国家一级文物，', '首批禁止出国（境）展览的文物。'], age: '约3000', st: {note: '首批禁止出境'}},
	{id: '26', t: 119.19, act: '白天展厅，人来人往', rows: ['今天，你在宝鸡青铜器博物院，', '每天被很多人看见。'], age: '约3000', st: {y: '今', place: '宝鸡', note: '宝鸡青铜器博物院'}},
	{id: '27', t: 123.72, act: '炉火闪回', rows: ['差一点，', '你就被当成废铜，销毁了。'], age: '约3000'},
	{id: '28', t: 128.25, act: '黄昏，空秤，空站门', rows: ['如果那天，他没有走进那个废品站——'], age: '约3000'},
	{id: 'END', t: 132.77, act: '片尾卡：聚光灯下的你', mode: 'none'},
];
const C = (id: string) => CARDS_ALL.find((k) => k.id === id)!;

/* ============================== overlay ============================== */
export const Counter: React.FC<{age: string; roll?: boolean}> = ({age, roll}) => { const approx = age.startsWith('约'), num = approx ? age.slice(1) : age;
	return <div style={{position: 'absolute', left: 150, bottom: 70, color: '#FFF6E6', fontFamily: SANS, textShadow: thK.halo, display: 'flex', alignItems: 'baseline', gap: 10, whiteSpace: 'nowrap'}}>
		<span style={{fontSize: 34, fontWeight: 700}}>你</span>{approx && <span style={{fontSize: 34, fontWeight: 700}}>约</span>}
		<span style={{position: 'relative', fontSize: 78, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
			{roll && <><span style={{position: 'absolute', left: 0, top: '-0.62em', opacity: 0.22, filter: 'blur(1.5px)'}}>{String(+num + 7)}</span><span style={{position: 'absolute', left: 0, top: '0.62em', opacity: 0.22, filter: 'blur(1.5px)'}}>{String(+num - 9)}</span></>}
			<span style={roll ? {filter: 'blur(0.6px)'} : undefined}>{num}</span></span><span style={{fontSize: 34, fontWeight: 700}}>岁</span></div>; };
export const NoteStamp: React.FC<{note: string}> = ({note}) => { useStampFonts(note);
	return <div style={{position: 'absolute', top: 64, right: 160, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thK.rule}`, color: thK.ink, textShadow: thK.halo, whiteSpace: 'nowrap', fontFamily: KAI, fontWeight: 700, fontSize: 40, letterSpacing: '0.06em', lineHeight: 1.3}}>{note}</div>; };
export const Centre: React.FC<{rows: string[]; y: number; size: number}> = ({rows, y, size}) => { const part = (s: string) => s.split(/(\[[^\]]+\])/).filter(Boolean).map((p, i) => p.startsWith('[') ? <span key={i} style={{color: '#F2C66E'}}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>);
	const w = Math.max(...rows.map((r) => r.replace(/[[\]]/g, '').length)) * size * 1.05, h = rows.length * size * 1.45;
	return <>
		<div style={{position: 'absolute', left: 960 - w / 2 - 260, top: y - 120, width: w + 520, height: h + 240, background: 'radial-gradient(closest-side, rgba(14,8,5,0.5) 0%, rgba(14,8,5,0.36) 50%, rgba(14,8,5,0) 100%)'}} />
		<div style={{position: 'absolute', left: 0, width: W, top: y, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 1.45, letterSpacing: '0.04em', color: '#FFF6E6', textShadow: thK.halo}}>
			{rows.map((r, i) => <div key={i}>{part(r)}</div>)}</div></>; };
/** the honest measure by its foot: the same in every HOME frame (cream, 60 %) */
export const LABEL_X = Math.round(HOME_BOX.x1 + 44);
export const ScaleLabel: React.FC = () => { const y0 = HOME_BOX.y0, y1 = HOME_BOX.y1, x = LABEL_X, c = '#F2E6CC';
	return <svg width={W} height={H} style={{position: 'absolute', opacity: 0.6}}>
		<g stroke={c} strokeWidth={1.6} fill="none"><path d={`M${x},${f1(y0)} L${x},${f1(y1)}`} /><path d={`M${x - 7},${f1(y0)} L${x + 7},${f1(y0)} M${x - 7},${f1(y1)} L${x + 7},${f1(y1)}`} />
			{[10, 20, 30].map((cm) => { const y = y1 - ((y1 - y0) * cm) / 38.8; return <path key={cm} d={`M${x},${f1(y)} L${x + 5},${f1(y)}`} />; })}</g>
		<text x={x + 14} y={y1 - 34} fontFamily={SANS} fontWeight={500} fontSize={24} fill={c} letterSpacing={1}>高 38.8 厘米</text>
		<text x={x + 14} y={y1 - 6} fontFamily={SANS} fontWeight={400} fontSize={22} fill={c} letterSpacing={2}>示意放大</text>
	</svg>; };
export const Ov: React.FC<{c: CardD; label?: boolean}> = ({c, label = true}) => <>
	{label && <ScaleLabel />}
	{c.mode !== 'none' && <>
		{(c.mode ?? 'tl') === 'tl' && c.rows && <Subs rows={c.rows.map((s) => ({s}))} th={thK} />}
		{c.mode === 'big' && c.rows && <Centre rows={c.rows} y={c.bigY ?? 380} size={112} />}
		{c.st && (c.st.y ? <Stamp y={c.st.y} place={c.st.place ?? ''} note={c.st.note} th={thK} /> : <NoteStamp note={c.st.note} />)}
		{c.age && <Counter age={c.age} roll={c.roll} />}
		<Seal /></>}
</>;

/* ============================== the one path the 尊 is drawn through ============================== */
/** mask mode (composition KFM55): a frame renders only its HOME 尊, flat magenta on white, for the box check */
export const MaskCtx = React.createContext(false);
export type ZS = {az: number; light: ZunLight; patina?: number; molten?: number; fresh?: number; reveal?: number; glow?: number; shadow?: boolean; inscription?: boolean;
	mode?: 'normal' | 'sil' | 'heat' | 'ghost'; rim?: string; halo?: string; haloO?: number};
export const NEUTRAL: ZunLight = {dir: [0.3, 0.5, 0.8], col: '#FFFFFF', k: 1, amb: 0.5, ambCol: '#FFFFFF', spec: 0};
/** the 尊 as a black silhouette with a thin hot rim and a halo behind */
export const SilZun: React.FC<{cam: Cam; id: string; rim: string; halo: string; haloO: number; rimO?: number; body?: string; bodyO?: number; mask?: string}> = ({cam, id, rim, halo, haloO, rimO = 1, body = '#0B0705', bodyO = 1, mask}) => {
	const c = (h: string) => [1, 3, 5].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3)), [br, bg, bb] = c(body);
	return <g>
		<defs>
			<filter id={`${id}h`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation={26} result="b" /><feFlood floodColor={halo} floodOpacity={haloO} /><feComposite in2="b" operator="in" /></filter>
			<filter id={`${id}s`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
				<feColorMatrix in="SourceAlpha" type="matrix" values={`0 0 0 0 ${br} 0 0 0 0 ${bg} 0 0 0 0 ${bb} 0 0 0 ${bodyO} 0`} result="blk" />
				<feMorphology in="SourceAlpha" operator="erode" radius={2.4} result="er" /><feComposite in="SourceAlpha" in2="er" operator="out" result="edge" />
				<feGaussianBlur in="edge" stdDeviation={0.7} result="eb" /><feFlood floodColor={rim} floodOpacity={rimO} result="fc" /><feComposite in="fc" in2="eb" operator="in" result="rimc" />
				<feMerge><feMergeNode in="blk" /><feMergeNode in="rimc" /></feMerge></filter></defs>
		<g filter={`url(#${id}h)`}><Zun cam={cam} light={NEUTRAL} id={`${id}a`} patina={0.3} shadow={false} inscription={false} /></g>
		<g filter={`url(#${id}s)`} mask={mask}><Zun cam={cam} light={NEUTRAL} id={`${id}b`} patina={0.3} shadow={false} inscription={false} /></g>
	</g>; };
export const HZ: React.FC<{z: ZS; id: string}> = ({z, id}) => { const mask = React.useContext(MaskCtx), cam = homeCam(z.az), L = rotL(z.light, z.az);
	if (mask) return <g><defs><filter id={`${id}mk`} colorInterpolationFilters="sRGB"><feFlood floodColor="#FF00FF" /><feComposite in2="SourceAlpha" operator="in" /></filter></defs>
		<g filter={`url(#${id}mk)`}><Zun cam={cam} light={NEUTRAL} id={`${id}m`} shadow={false} inscription={false} /></g></g>;
	const mode = z.mode ?? 'normal';
	if (mode === 'sil') return <SilZun cam={cam} id={id} rim={z.rim ?? '#FFD088'} halo={z.halo ?? '#FFB050'} haloO={z.haloO ?? 0.9} />;
	if (mode === 'ghost') return <g opacity={0.22}><SilZun cam={cam} id={id} rim={z.rim ?? '#F0C070'} halo={z.halo ?? '#FFB060'} haloO={z.haloO ?? 0.4} body="#2A1C12" bodyO={0.25} /></g>;
	if (mode === 'heat') {   /* T, late: the black silhouette starts to glow from inside, from the foot up (it becomes card 3's molten 尊) */
		const zs = zunScreen(cam);
		return <g><defs><linearGradient id={`${id}hg`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff" stopOpacity={0} /><stop offset="0.5" stopColor="#fff" stopOpacity={0.45} /><stop offset="0.85" stopColor="#fff" stopOpacity={1} /></linearGradient>
			<mask id={`${id}hm`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><rect x={0} y={zs.lip[1] - 40} width={W} height={zs.base[1] - zs.lip[1] + 80} fill={`url(#${id}hg)`} /></mask></defs>
			<Zun cam={cam} light={L} id={`${id}mo`} patina={0.3} molten={0.85} shadow={false} inscription={false} />
			<SilZun cam={cam} id={id} rim={z.rim ?? '#FFD088'} halo={z.halo ?? '#FF9A40'} haloO={z.haloO ?? 0.95} mask={`url(#${id}hm)`} /></g>; }
	return <Zun cam={cam} light={L} id={id} patina={z.patina} molten={z.molten} fresh={z.fresh} reveal={z.reveal} glow={z.glow} shadow={z.shadow} inscription={z.inscription} />; };
/** a HOME frame: back (behind the 尊), the 尊, front (in front of it); then the vignette and the overlay */
type FP = {c: CardD; bg: string; z: ZS; back?: (cam: Cam) => React.ReactNode; front?: (cam: Cam) => React.ReactNode; vig?: number; after?: React.ReactNode; top?: React.ReactNode; label?: boolean; ovMode?: CardD};
export const Frame: React.FC<FP> = ({c, bg, z, back, front, vig = 0.6, after, top, label = true, ovMode}) => { const mask = React.useContext(MaskCtx), cam = homeCam(z.az);
	if (mask) return <AbsoluteFill style={{background: '#FFFFFF'}}><svg width={W} height={H} style={{position: 'absolute'}}><HZ z={z} id={`z${c.id}`} /></svg></AbsoluteFill>;
	return <AbsoluteFill style={{background: bg}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>{back?.(cam)}<HZ z={z} id={`z${c.id}`} />{front?.(cam)}</svg>
		{after}
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id={`v${c.id}`} a={vig} /></svg>
		<Ov c={ovMode ?? c} label={label} />{top}
	</AbsoluteFill>; };
/** a push-in end frame (not HOME): the close-up the shot ends on, with the card's subtitle, no measure label */
export const CloseFrame: React.FC<{c: CardD; bg: string; children: React.ReactNode; vig?: number}> = ({c, bg, children, vig = 0.7}) => <AbsoluteFill style={{background: bg}}>
	<svg width={W} height={H} style={{position: 'absolute'}}>{children}</svg>
	<svg width={W} height={H} style={{position: 'absolute'}}><Vig id={`ve${c.id}`} a={vig} /></svg>
	<Ov c={c} label={false} />
</AbsoluteFill>;

/* ============================== shared pieces ============================== */
const surfPt = (th: number, z: number, lift = 0): V3 => { const [r, n] = Rz(z), k = r * rho(th, n) + lift; return [k * Math.cos(th), k * Math.sin(th), z]; };
const lipRing = (cam: Cam, r = 14.0, z = 38.8, n = 48) => Array.from({length: n}, (_, j) => proj(cam, [r * Math.cos((j / n) * 2 * Math.PI), r * Math.sin((j / n) * 2 * Math.PI), z]));
export const Motes: React.FC<{n: number; x0: number; x1: number; y0: number; y1: number; c: string; seed: number; o?: number; r?: number}> = ({n, x0, x1, y0, y1, c, seed, o = 0.5, r = 2.2}) => <g>
	{Array.from({length: n}, (_, i) => <circle key={i} cx={x0 + rnd(i, seed) * (x1 - x0)} cy={y0 + rnd(i, seed + 1) * (y1 - y0)} r={0.6 + rnd(i, seed + 2) * r} fill={c} opacity={o * (0.3 + 0.7 * rnd(i, seed + 3))} />)}</g>;
export const Beam: React.FC<{pts: P[]; c: string; o: number; id: string; dir?: [number, number, number, number]}> = ({pts, c, o, id, dir = [0, 0, 0, 1]}) => <>
	<defs><linearGradient id={id} x1={dir[0]} y1={dir[1]} x2={dir[2]} y2={dir[3]}><stop offset="0" stopColor={c} stopOpacity={o} /><stop offset="1" stopColor={c} stopOpacity={0} /></linearGradient></defs>
	<path d={pth(pts)} fill={`url(#${id})`} /></>;
/** a support under the 尊 (deck / stand / altar / plinth top): top face and front face, sized to the HOME 尊 */
export const Top: React.FC<{x0: number; x1: number; y?: number; d?: number; h: number; top: string; face: string; edge?: string; edgeO?: number}> = ({x0, x1, y = HOME_Y + 14, d = 30, h, top, face, edge, edgeO = 0.55}) => <>
	<path d={pth([[x0, y], [x1, y], [x1 + 24, y - d], [x0 + 24, y - d]])} fill={top} />
	<rect x={x0} y={y} width={x1 - x0} height={h} fill={face} />
	{edge && <path d={`M${x0},${y} L${x1},${y}`} stroke={edge} strokeWidth={2.2} strokeOpacity={edgeO} />}</>;
export const Furnace: React.FC<{x: number; y: number; s: number; id: string; heat?: number}> = ({x, y, s, id, heat = 1}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<path d={pth([[-220, 0], [-200, -520], [-120, -600], [120, -600], [200, -520], [220, 0]])} fill="#2A1A14" />
	{Array.from({length: 12}, (_, i) => <path key={i} d={`M-210,${-40 - i * 44} L210,${-40 - i * 44}`} stroke="#1A100C" strokeWidth={4} />)}
	<rect x={-60} y={-900} width={120} height={300} fill="#1E140F" />
	<path d={sm([[-110, -40], [-110, -230], [-60, -300], [60, -300], [110, -230], [110, -40]])} fill="#120806" />
	<path d={sm([[-90, -40], [-90, -220], [-50, -276], [50, -276], [90, -220], [90, -40]])} fill={`url(#${id}fm)`} opacity={heat} />
	<defs><radialGradient id={`${id}fm`} cx="50%" cy="80%" r="70%"><stop offset="0" stopColor="#FFE8A0" /><stop offset="0.35" stopColor="#FF9A30" /><stop offset="0.8" stopColor="#C83A10" /><stop offset="1" stopColor="#5A1408" /></radialGradient></defs>
	{Array.from({length: 7}, (_, i) => <path key={i} d={sm([[-70 + i * 22, -50], [-80 + i * 22 + rnd(i, 3) * 20, -150 - rnd(i, 4) * 80], [-56 + i * 22, -60]])} fill="#FFD27A" opacity={0.55 * heat} />)}
	<path d="M-110,-40 L110,-40" stroke="#FF9A40" strokeWidth={4} opacity={0.7 * heat} /></g>;
/** a forearm in a sleeve and a hand in a pinch grip holding a tool; cm, pointing +x from the wrist at (0, 0) */
const HandTool: React.FC<{tool: 'scalpel' | 'brush' | 'pencil' | 'none'; coat?: string}> = ({tool, coat}) => <>
	<path d={tube([-44, 0.5], [-2, 0], 5.6, 4.4)} fill={coat} />
	<path d={sm([[-10, -6], [-4, -5.6], [-4, 5.8], [-10, 6.4]])} fill={coat} />
	<path d={sm([[-2.5, -3.6], [3.5, -4.4], [8.5, -3.6], [10.5, -1.2], [10, 2.4], [6, 4.2], [-1, 3.8]])} />
	<path d={tube([6.5, -1.4], [14.5, -2.6], 1.25, 0.95)} />
	<path d={tube([2.5, -4.2], [11.5, -4.3], 1.35, 1.0)} />
	{tool === 'scalpel' && <g fill="#D8D8D4"><path d={pth([[3, -3.1], [18, -3.5], [18, -2.7], [3, -2.5]])} /><path d={pth([[18, -3.7], [23, -3.3], [18, -2.5]])} fill="#F2F2EE" /></g>}
	{tool === 'brush' && <g><path d={pth([[1, -3.3], [13, -3.6], [13, -2.4], [1, -2.2]])} fill="#5A3A22" /><path d={pth([[13, -3.8], [15, -3.8], [15, -2.2], [13, -2.2]])} fill="#B8B0A0" /><path d={sm([[15, -3.9], [19.5, -4.4], [21, -3.0], [19.5, -1.6], [15, -2.1]])} fill="#D8B888" /></g>}
	{tool === 'pencil' && <g><path d={pth([[1, -3.3], [16, -3.5], [16, -2.5], [1, -2.3]])} fill="#3A6A3A" /><path d={pth([[16, -3.5], [19.5, -3.0], [16, -2.5]])} fill="#D8C8A0" /></g>}
</>;
/** an open hand gripping (cm, the wrist at 0,0, fingers toward +x, curling round toward +y): forearm, palm, four fingers, thumb */
export const GripHand: React.FC<{arm?: number}> = ({arm = 40}) => <>
	<path d={tube([-arm, 0.4], [-1, 0], 5.8, 4.6)} />
	<path d={sm([[-10, -6.4], [-4, -6], [-4, 6.2], [-10, 6.8]])} />
	<path d={sm([[-2, -4.4], [5, -5], [9.5, -4.2], [10.5, 0], [9.5, 4.4], [4, 4.8], [-2, 4.2]])} />
	{[-3.3, -1.1, 1.1, 3.2].map((y, i) => <path key={i} d={sm([[9, y - 1.1], [14.5 - Math.abs(y) * 0.3, y - 0.9], [17.5 - Math.abs(y) * 0.4, y + 0.6], [16.5 - Math.abs(y) * 0.4, y + 2.0], [14, y + 1.0], [9, y + 1.0]])} />)}
	<path d={tube([2, -4.6], [8, -8.4], 1.7, 1.3)} />
</>;
export const Grain: React.FC<{cam: Cam; heap: number; id: string; c1: string; c2: string}> = ({cam, heap, id, c1, c2}) => {
	const ring = lipRing(cam, 13.4, 38.6, 64), cx = ring.reduce((s, q) => s + q[0], 0) / ring.length, cy = ring.reduce((s, q) => s + q[1], 0) / ring.length;
	const left = ring.reduce((a, q) => (q[0] < a[0] ? q : a)), right = ring.reduce((a, q) => (q[0] > a[0] ? q : a));
	const near = ring.filter((q) => q[1] >= cy - 1).sort((a, b) => a[0] - b[0]).map((q) => [q[0], q[1]] as P);
	const px = zunScreen(cam).pxPerCm, top = cy - heap * px;
	const d = 'M' + near.map((q) => `${f1(q[0])},${f1(q[1])}`).join('L') + ` C${f1(right[0] - 20)},${f1(top + 10)} ${f1(cx + 120)},${f1(top)} ${f1(cx)},${f1(top)} C${f1(cx - 120)},${f1(top)} ${f1(left[0] + 20)},${f1(top + 10)} ${f1(left[0])},${f1(left[1])} Z`;
	return <g>
		<defs><linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient><clipPath id={`${id}c`}><path d={d} /></clipPath></defs>
		<path d={d} fill={`url(#${id}g)`} />
		<g clipPath={`url(#${id}c)`}>{Array.from({length: 300}, (_, i) => { const x = left[0] + rnd(i, 71) * (right[0] - left[0]), y = top + rnd(i, 72) * (cy - top + 40);
			return <ellipse key={i} cx={x} cy={y} rx={2.6} ry={1.6} transform={`rotate(${f1(rnd(i, 73) * 180)} ${f1(x)} ${f1(y)})`} fill={i % 3 ? '#5A4020' : '#FFF0C0'} opacity={0.35} />; })}</g>
	</g>; };
/** the 洛 valley: dawn (card 8: the new city at sunrise) or full morning (card 23: the plain as it is remembered, the city a ghost) */
export const Luoyi: React.FC<{id: string; mood: 'dawn' | 'morning'}> = ({id, mood}) => { const m = mood === 'morning';
	const sky = m ? ['#3A6A9A', '#7AA2C4', '#C8D4D8', '#F2DCB0', '#FFE8C0', '#6A5A48'] : ['#141A2E', '#3A3352', '#8A5A62', '#E89A6A', '#FFC888', '#5A3A2A'];
	return <g>
		<defs><linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="0.3" stopColor={sky[1]} /><stop offset="0.5" stopColor={sky[2]} /><stop offset="0.6" stopColor={sky[3]} /><stop offset="0.66" stopColor={sky[4]} /><stop offset="1" stopColor={sky[5]} /></linearGradient>
			<linearGradient id={`${id}pl`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={m ? '#8A7A5E' : '#6A4A3E'} /><stop offset="1" stopColor={m ? '#3A3226' : '#2A1C16'} /></linearGradient></defs>
		<rect width={W} height={H} fill={`url(#${id}sky)`} />
		<Glow x={m ? 420 : 1500} y={m ? 260 : 640} r={640} c={m ? '#FFF2D0' : '#FFC070'} o={0.6} id={`${id}sun`} sy={m ? 0.8 : 0.5} />
		<circle cx={m ? 420 : 1500} cy={m ? 250 : 648} r={m ? 34 : 40} fill={m ? '#FFF8E8' : '#FFE2A8'} opacity={m ? 0.9 : 1} />
		<path d={sm([[-40, 660], [140, 610], [300, 632], [470, 588], [640, 626], [820, 600], [1000, 640], [1180, 612], [1360, 650], [1960, 652], [1960, 720], [-40, 720]])} fill={m ? '#7A8A9A' : '#5A4A62'} opacity={0.75} />
		<Haze y={652} h={110} c={m ? '#F2F0E8' : '#FFC890'} o={m ? 0.6 : 0.45} id={`${id}hz`} />
		<path d={pth([[-40, 660], [1960, 652], [1960, 1080], [-40, 1080]])} fill={`url(#${id}pl)`} />
		<path d="M-40,880 C220,860 380,790 640,770 S1060,742 1260,712 S1640,676 1960,668 L1960,676 C1640,686 1420,712 1262,724 S920,770 650,792 S240,890 -40,912 Z" fill={m ? '#C8DCE8' : '#E8A870'} opacity={0.85} />
		<g opacity={m ? 0.3 : 1}>
			<path d={pth([[1250, 662], [1730, 656], [1760, 690], [1230, 698]])} fill="#4A3228" />
			<path d="M1230,698 L1760,690" stroke="#FFC890" strokeWidth={2} strokeOpacity={0.7} />
			{[[1300, 650], [1480, 646], [1660, 644]].map(([x, y], i) => <g key={i}><rect x={x - 16} y={y - 22} width={32} height={30} fill="#3A261E" /><path d={pth([[x - 24, y - 22], [x, y - 36], [x + 24, y - 22]])} fill="#2A1A14" /></g>)}
			{Array.from({length: 22}, (_, i) => { const x = 1270 + rnd(i, 41) * 460, y = 668 + rnd(i, 42) * 18; return <path key={i} d={pth([[x - 10, y], [x, y - 8], [x + 10, y]])} fill="#2E1E18" />; })}
			{[1340, 1420, 1590, 1690].map((x, i) => <Plume key={i} x={x} y={664} h={110} w={40} c="#D8B8A8" o={0.25} id={`${id}sm${i}`} seed={i} />)}</g>
		{Array.from({length: 8}, (_, i) => <path key={i} d={`M${-40 + i * 80},${1080} L${260 + i * 150},700`} stroke={m ? '#5A5040' : '#3A281E'} strokeWidth={2} opacity={0.5} />)}
	</g>; };
/** the scrap yard's platform scale under the 尊 (sized to it): deck, the column at its right end, the beam with its poise */
export const Scale: React.FC<{beam?: boolean; poise?: number; trail?: boolean; rimC?: string}> = ({beam = true, poise = 1590, trail = false, rimC = '#E8A868'}) => <>
	{beam && <><rect x={1330} y={470} width={26} height={430} fill="#2A2422" /><path d={`M1356,470 L1356,900`} stroke={rimC} strokeWidth={2} strokeOpacity={0.6} />
		<rect x={1330} y={456} width={560} height={22} fill="#2E2826" /><path d="M1330,456 L1890,456" stroke={rimC} strokeWidth={2} strokeOpacity={0.75} />
		{Array.from({length: 17}, (_, i) => <path key={i} d={`M${1370 + i * 30},456 L${1370 + i * 30},${i % 5 ? 466 : 474}`} stroke="#C9A27A" strokeWidth={1.8} opacity={0.7} />)}
		{trail && [0, 1, 2].map((i) => <rect key={i} x={poise - 110 + i * 30} y={438} width={38} height={54} rx={5} fill="#5A4A40" opacity={0.1 + i * 0.07} />)}
		<rect x={poise - 19} y={436} width={38} height={58} rx={5} fill="#3A3230" stroke={rimC} strokeWidth={2} strokeOpacity={0.6} />
		<path d="M1880,478 L1880,560" stroke="#2A2422" strokeWidth={5} /><rect x={1858} y={560} width={44} height={14} fill="#2A2422" /><rect x={1862} y={576} width={36} height={12} fill="#2A2422" /></>}
	<Top x0={580} x1={1340} h={70} top="#3A3330" face="#1E1A18" edge="#C99A6A" />
	{[600, 1300].map((x, i) => <rect key={i} x={x} y={HOME_Y + 84} width={20} height={20} fill="#121010" />)}
</>;

/* ============================== lights (authored for az = 0: [toward camera, screen right, up]; HZ turns them) ============================== */
export const LY: ZunLight = {dir: [0.25, 0.78, 0.5], col: '#FFC27A', k: 1.35, amb: 0.36, ambCol: '#6E7A8E', spec: 0.5, shin: 14, rim: {dir: [-0.6, 0.55, 0.3], col: '#FFB46A', k: 0.55}};
export const LYlow: ZunLight = {dir: [0.3, 0.9, 0.25], col: '#FFAA60', k: 1.4, amb: 0.26, ambCol: '#5A5E78', spec: 0.5, shin: 14, rim: {dir: [-0.6, 0.6, 0.3], col: '#FF9A50', k: 0.6}};
export const LM: ZunLight = {dir: [0.35, -0.8, 0.45], col: '#FF9A4A', k: 1.2, amb: 0.25, ambCol: '#5A3A30', spec: 0.6, shin: 12};
export const L4c: ZunLight = {dir: [0.35, -0.75, 0.55], col: '#FFB070', k: 1.3, amb: 0.3, ambCol: '#5A3A30', spec: 0.9, shin: 16, rim: {dir: [-0.5, 0.7, 0.4], col: '#FF8A40', k: 0.6}};
export const LH: ZunLight = {dir: [0.45, 0.6, 0.65], col: '#FFC27A', k: 1.4, amb: 0.26, ambCol: '#5A4038', spec: 1.1, shin: 18, rim: {dir: [-0.6, -0.6, 0.4], col: '#FFB060', k: 0.5}};
export const LTop: ZunLight = {dir: [0.25, -0.2, 0.95], col: '#FFD8A0', k: 1.5, amb: 0.22, ambCol: '#4A3A30', spec: 1.2, shin: 18, rim: {dir: [-0.6, 0.5, 0.5], col: '#FFC080', k: 0.5}};
export const LDawn: ZunLight = {dir: [0.5, 0.7, 0.45], col: '#FFC890', k: 1.65, amb: 0.3, ambCol: '#6A6080', spec: 1.1, shin: 16, rim: {dir: [-0.5, 0.75, 0.25], col: '#FFD8A0', k: 0.6}};
const L9: ZunLight = {dir: [0.55, -0.4, 0.7], col: '#FFC890', k: 1.6, amb: 0.28, ambCol: '#5A5048', spec: 0.5, shin: 14, rim: {dir: [-0.5, 0.7, 0.3], col: '#C8A070', k: 0.4}};
const L10: ZunLight = {dir: [0.3, -0.85, 0.42], col: '#FFC888', k: 1.4, amb: 0.32, ambCol: '#7A7068', spec: 0.5, shin: 14, rim: {dir: [-0.4, -0.8, 0.3], col: '#FFE0B0', k: 0.4}};
const LFarm = (winter: boolean): ZunLight => winter ? {dir: [0.35, -0.8, 0.45], col: '#B8CCE8', k: 1.1, amb: 0.3, ambCol: '#4A5262', spec: 0.4, shin: 12, rim: {dir: [-0.5, 0.6, 0.4], col: '#8A9AB8', k: 0.35}}
	: {dir: [0.35, -0.8, 0.45], col: '#FFC888', k: 1.4, amb: 0.3, ambCol: '#5A4A3E', spec: 0.45, shin: 12, rim: {dir: [-0.5, 0.6, 0.4], col: '#C8A070', k: 0.35}};
const L15: ZunLight = {dir: [0.2, 0.9, 0.35], col: '#FF7A30', k: 1.6, amb: 0.16, ambCol: '#3A2430', spec: 0.6, shin: 12, rim: {dir: [-0.3, 0.9, 0.3], col: '#FFB060', k: 0.8}};
const L16: ZunLight = {dir: [0.35, 0.88, 0.3], col: '#FF5A20', k: 1.8, amb: 0.12, ambCol: '#3A1008', spec: 0.9, shin: 12, rim: {dir: [-0.3, 0.9, 0.35], col: '#FFA040', k: 0.9}};
const LMorn: ZunLight = {dir: [0.35, -0.8, 0.5], col: '#FFE0B8', k: 1.5, amb: 0.34, ambCol: '#7A8494', spec: 0.55, shin: 14, rim: {dir: [-0.4, 0.8, 0.35], col: '#B8C8DC', k: 0.45}};
const LRoom = (clean: boolean): ZunLight => clean ? {dir: [0.35, -0.45, 0.82], col: '#FFE6C4', k: 2.2, amb: 0.4, ambCol: '#6A6E74', spec: 2.0, shin: 14, rim: {dir: [-0.6, 0.7, 0.4], col: '#FFE0B8', k: 1.0}, inside: 0.6}
	: {dir: [0.2, -0.6, 0.78], col: '#FFE0B0', k: 1.45, amb: 0.3, ambCol: '#5A6268', spec: 0.6, shin: 14, rim: {dir: [-0.5, 0.8, 0.3], col: '#B8C8D8', k: 0.45}, inside: 0.5};
const LMus: ZunLight = {dir: [0.55, 0.3, 0.78], col: '#FFE6C4', k: 2.1, amb: 0.36, ambCol: '#5A6670', spec: 1.9, shin: 14, rim: {dir: [-0.8, -0.3, 0.5], col: '#CFE0F0', k: 0.9}};
const LMusDay: ZunLight = {dir: [0.4, -0.5, 0.75], col: '#FFF0DC', k: 1.9, amb: 0.48, ambCol: '#8A8478', spec: 1.6, shin: 14, rim: {dir: [-0.6, 0.6, 0.4], col: '#FFE8C8', k: 0.7}};
const LMem: ZunLight = {dir: [0.4, -0.75, 0.5], col: '#FFF0D8', k: 1.9, amb: 0.4, ambCol: '#7A8AA0', spec: 1.8, shin: 14, rim: {dir: [-0.5, 0.75, 0.4], col: '#FFE8C0', k: 0.8}};
const LWarm: ZunLight = {dir: [0.6, 0.45, 0.65], col: '#FFC888', k: 2.0, amb: 0.32, ambCol: '#5A4A44', spec: 1.9, shin: 14, rim: {dir: [-0.7, -0.4, 0.5], col: '#FFB870', k: 1.0}};

/* ============================== 1 · the scrap yard: 30 元 on the scale ============================== */
const F1: React.FC = () => <Frame c={C('1')} bg="#0E0B0A" vig={0.55} z={{az: 30, light: LY, patina: 0.95, shadow: true}}
	back={() => <><YardBG />
		{/* the clerk, back by the shed, entering the weight in his ledger */}
		<Person id="c1w" f={{kind: 'worker', lean: 8, stride: 0.1, hN: [26, -112], hF: [22, -104]}} x={330} y={812} k={2.0} rim="#FFB874" lx={1} ly={0.2} />
		<path d={pth([[372, 586], [398, 578], [402, 602], [376, 608]])} fill="#D8C8A6" opacity={0.85} />
		<Haze y={800} h={120} c="#C8885A" o={0.18} id="c1hz" />
		<Scale /></>}
	front={(cam) => <Tag30 cam={cam} />} />;

/* ============================== 2 · push in to the 饕餮 eyes ============================== */
const F2: React.FC = () => <Frame c={C('2')} bg="#0E0B0A" vig={0.62} z={{az: 30, light: LYlow, patina: 0.95, shadow: true}}
	back={() => <><YardBG />
		<rect width={W} height={H} fill="#1A0E08" opacity={0.25} />
		<Scale beam={false} />
		<Beam pts={[[1920, 300], [1920, 760], [700, 1000], [560, 820]]} c="#FFC890" o={0.16} id="c2bm" dir={[1, 0, 0, 0]} /></>}
	front={() => <Motes n={70} x0={560} x1={1880} y0={300} y1={1000} c="#FFE2B8" seed={31} o={0.55} r={2.6} />} />;
export const L2c: ZunLight = {dir: [0.72, 0.55, 0.3], col: '#FFB874', k: 1.45, amb: 0.2, ambCol: '#4A4E5E', spec: 0.55, shin: 14, rim: {dir: [-0.4, -0.7, 0.45], col: '#8A96B8', k: 0.45}};
const F2e: React.FC = () => { const T: V3 = [0, 0, 16.2], D = 132, e = 4 * Math.PI / 180, a = 10 * Math.PI / 180;
	const cam = lookAt([D * Math.cos(e) * Math.cos(a), D * Math.cos(e) * Math.sin(a), T[2] + D * Math.sin(e)], T, 3900, 960, 650);
	return <CloseFrame c={C('2')} bg="#0E0A08">
		<defs><radialGradient id="e2bg" cx="70%" cy="60%" r="80%"><stop offset="0" stopColor="#5A3A26" /><stop offset="0.5" stopColor="#24180F" /><stop offset="1" stopColor="#0C0907" /></radialGradient>
			<filter id="e2bk" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={14} /></filter>
			<linearGradient id="e2top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0A0705" stopOpacity={0.88} /><stop offset="1" stopColor="#0A0705" stopOpacity={0} /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#e2bg)" />
		<g filter="url(#e2bk)">{Array.from({length: 14}, (_, i) => <circle key={i} cx={1480 + rnd(i, 4) * 440} cy={420 + rnd(i, 5) * 420} r={18 + rnd(i, 6) * 40} fill={i % 3 ? '#FFB070' : '#FF7A30'} opacity={0.18 + 0.2 * rnd(i, 7)} />)}</g>
		<Zun cam={cam} light={rotL(L2c, 10)} id="e2z" patina={0.95} shadow={false} inscription={false} />
		<rect width={W} height={380} fill="url(#e2top)" />
		<Motes n={70} x0={480} x1={1880} y0={260} y1={1040} c="#FFE2B8" seed={31} o={0.55} r={2.6} />
	</CloseFrame>; };

/* ============================== T · the title slams over the orbiting silhouette; through the hold it heats up ============================== */
export const TitleText: React.FC = () => <svg width={W} height={H} style={{position: 'absolute'}}>
	<defs><linearGradient id="tgold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF2C8" /><stop offset="0.38" stopColor="#F2C46A" /><stop offset="0.56" stopColor="#B87A32" /><stop offset="0.7" stopColor="#D89A48" /><stop offset="1" stopColor="#F6D488" /></linearGradient>
		<filter id="tglow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation={16} result="b" /><feFlood floodColor="#000" floodOpacity={0.85} /><feComposite in2="b" operator="in" result="sh" />
			<feGaussianBlur in="SourceGraphic" stdDeviation={10} result="g" /><feColorMatrix in="g" type="matrix" values="1 0 0 0 0.1 0 0.7 0 0 0 0 0 0.3 0 0 0 0 0 0.45 0" result="gg" />
			<feMerge><feMergeNode in="sh" /><feMergeNode in="gg" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
	<g filter="url(#tglow)">{['“中国”两个字，', '最早出现在哪？'].map((r, i) => <text key={i} x={960} y={560 + i * 200} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={164} letterSpacing={8}
		fill="url(#tgold)" stroke="#1A0D05" strokeWidth={9} strokeLinejoin="round" paintOrder="stroke">{r}</text>)}</g></svg>;
export const TBack: React.FC<{heat: number}> = ({heat}) => <>
	<defs><radialGradient id="tbg" cx="50%" cy="56%" r="58%"><stop offset="0" stopColor="#6A3A16" /><stop offset="0.45" stopColor="#2A160A" /><stop offset="1" stopColor="#070403" /></radialGradient></defs>
	<rect width={W} height={H} fill="url(#tbg)" />
	<Glow x={960} y={600} r={560} c="#E8903A" o={0.8 + 0.1 * heat} id="tback" sy={0.9} />
	<Glow x={960} y={940} r={560} c="#FF7A30" o={0.25 + 0.3 * heat} id="tfl" sy={0.16} />
	<Motes n={46 + 30 * heat} x0={200} x1={1720} y0={120} y1={1000} c="#FFB060" seed={77} o={0.5} r={2.4} /></>;
const FT: React.FC = () => <Frame c={C('T')} bg="#070403" vig={0.75} z={{az: 60, light: LM, mode: 'sil'}} back={() => <TBack heat={0} />} top={<TitleText />} />;
const FTe: React.FC = () => <Frame c={C('T')} bg="#070403" vig={0.75} z={{az: 30, light: LM, mode: 'heat'}} back={() => <TBack heat={1} />} top={<TitleText />} />;

/* ============================== 3 / 4 / 6 · the 西周 casting workshop ============================== */
/* the floor is raised over ForgeBG's lower wall so that the people stand clearly back, behind a haze, at their own size */
export const Forge: React.FC<{fire: number; pour?: boolean; id: string}> = ({fire, pour = false, id}) => <>
	<ForgeBG fire={fire} />
	<defs><linearGradient id={`${id}fl`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24170F" /><stop offset="1" stopColor="#0E0806" /></linearGradient></defs>
	<rect x={0} y={760} width={W} height={320} fill={`url(#${id}fl)`} />
	{pour && <g>   {/* the pour, back left: a mould stack bound with cord, two men tipping the crucible on a pole */}
		<path d={sm([[300, 800], [296, 690], [316, 664], [396, 664], [416, 690], [412, 800]])} fill="#5A3A28" />
		{[700, 732, 764].map((y, i) => <path key={i} d={`M298,${y} L414,${y}`} stroke="#2E1C12" strokeWidth={5} />)}
		<path d={sm([[342, 656], [356, 646], [370, 656], [366, 668], [346, 668]])} fill="#FFD27A" />
		<g transform="translate(400,560) rotate(-38)"><path d={sm([[-38, -32], [38, -32], [33, 8], [0, 48], [-33, 8]])} fill="#3A281C" /><path d="M-38,-32 L38,-32" stroke="#FFB060" strokeWidth={3} strokeOpacity={0.7} /></g>
		<path d="M370,582 C362,606 357,628 356,650" stroke="#FFE6A8" strokeWidth={8} strokeLinecap="round" fill="none" />
		<Glow x={358} y={648} r={150} c="#FFB050" o={0.7} id={`${id}pour`} />
		<path d="M250,528 L530,580" stroke="#1A100B" strokeWidth={7} strokeLinecap="round" />
		<Person id={`${id}a`} f={{kind: 'zhou', lean: 16, stride: 0.4, hN: [30, -136], hF: [24, -128]}} x={200} y={800} k={2.1} rim="#FFB060" lx={1} ly={0.1} />
		<Person id={`${id}b`} f={{kind: 'zhou', lean: 18, stride: 0.35, hN: [34, -112], hF: [28, -104], flip: true}} x={560} y={804} k={2.0} rim="#FFB060" lx={-1} ly={0.1} /></g>}
	<Haze y={790} h={140} c="#C87840" o={0.22} id={`${id}hz`} />
	<Glow x={960} y={890} r={560} c="#FF8A3A" o={0.3 + 0.12 * fire} id={`${id}pool`} sy={0.2} />
</>;
export const Shards: React.FC = () => <>{shard(640, 925, 190, 80, -10, 0)}{shard(1270, 930, 200, 86, 9, 1)}{shard(1400, 1000, 150, 62, 24, 2)}{shard(520, 1000, 150, 62, -26, 3)}</>;
const F3: React.FC = () => <Frame c={C('3')} bg="#070505" z={{az: 30, light: LM, patina: 0.3, molten: 0.9, shadow: false}}
	back={() => <><Forge fire={1} pour id="c3" />
		{/* the master caster, back right, with a long pick */}
		<Person id="c3m" f={{kind: 'zhou', lean: -4, stride: 0.2, hN: [-36, -112], hF: [-30, -100], flip: true}} x={1600} y={812} k={2.2} rim="#FFC070" lx={-1} ly={0.15} />
		<path d="M1528,560 L1500,812" stroke="#1A100B" strokeWidth={5} strokeLinecap="round" />
		<Haze y={800} h={120} c="#FF9A50" o={0.15} id="c3hz2" />
		<Plume x={900} y={330} h={300} w={160} c="#E8C8A8" o={0.16} id="c3st1" seed={1} /><Plume x={1020} y={340} h={260} w={140} c="#E8C8A8" o={0.13} id="c3st2" seed={3} />
		<Glow x={960} y={600} r={460} c="#FFB050" o={0.42} id="c3halo" /></>}
	front={() => <Shards />} />;
const F4: React.FC = () => <Frame c={C('4')} bg="#070505" z={{az: 30, light: L4c, patina: 0.05, molten: 0.32, fresh: 0.6, shadow: true}}
	back={() => <><Forge fire={0.45} id="c4" />
		{/* 何, a 宗小子 in robe and cap, kneeling back in the workshop, bowing to the new vessel */}
		<Sil id="c4he" x={330} y={806} k={2.25} rim="#FFB060" lx={1} ly={0.15}><Body s={kneel(16)} dress="robe" hat="guan" /></Sil>
		<Haze y={800} h={110} c="#FF9A50" o={0.14} id="c4hz2" />
		<Plume x={930} y={340} h={300} w={150} c="#E8C8A8" o={0.1} id="c4st" seed={2} />
		<Glow x={960} y={600} r={420} c="#FFB050" o={0.26} id="c4halo" /></>}
	front={() => <Shards />} />;
/* 6 · the workshop at daybreak: a shaft from the smoke hole onto the new vessel; the camera cranes up and dives into the mouth */
const F6: React.FC = () => <Frame c={C('6')} bg="#070505" z={{az: -30, light: LTop, patina: 0, fresh: 0.6, shadow: true}}
	back={() => <><Forge fire={0.15} id="c6" />
		<Beam pts={[[820, 0], [1100, 0], [1260, 900], [660, 900]]} c="#FFE0A8" o={0.24} id="c6sh" />
		<Motes n={50} x0={700} x1={1260} y0={60} y1={860} c="#FFE6B8" seed={61} o={0.45} /></>}
	front={() => <Shards />} />;
export const L6e: ZunLight = {dir: [-0.45, -0.35, 0.82], col: '#FFD49A', k: 1.25, amb: 0.3, ambCol: '#5A4A3A', spec: 1.0, shin: 18, inside: 0.85};
const F6e: React.FC = () => { const T: V3 = [0, 0, 18], D = 92, a = 225 * Math.PI / 180, e = 66 * Math.PI / 180;
	const cam = lookAt([T[0] + D * Math.cos(e) * Math.cos(a), T[1] + D * Math.cos(e) * Math.sin(a), T[2] + D * Math.sin(e)], T, 2500, 960, 640);
	return <CloseFrame c={C('6')} bg="#0A0705">
		<defs><radialGradient id="e6bg" cx="50%" cy="60%" r="70%"><stop offset="0" stopColor="#3A2614" /><stop offset="1" stopColor="#0A0705" /></radialGradient></defs>
		<rect width={W} height={H} fill="url(#e6bg)" />
		<Glow x={960} y={640} r={640} c="#FFB060" o={0.2} id="e6g" />
		<Zun cam={cam} light={L6e} id="e6z" patina={0} fresh={0.6} reveal={1} glow={0} shadow={false} />
		<Motes n={30} x0={600} x1={1400} y0={300} y1={900} c="#FFE6B8" seed={61} o={0.4} />
	</CloseFrame>; };

/* ============================== 5 · the 西周 hall ============================== */
export const Hall: React.FC<{people: boolean; id: string; stand?: boolean; kingHand?: P; heBow?: number}> = ({people, id, stand: withStand = true, kingHand = [44, -128], heBow = 10}) => { const fu = Array.from({length: 20}, (_, i) => { const cx = 1418 + (i % 4) * 74, cy = 372 + Math.floor(i / 4) * 54;
	return <path key={i} d={sm([[cx - 18, cy - 15], [cx + 10, cy - 18], [cx + 21, cy], [cx + 10, cy + 18], [cx - 18, cy + 15], [cx - 11, cy]])} fill="#3A1A10" stroke="#8A5A30" strokeWidth={1.2} strokeOpacity={0.5} />; });
	return <>
		<defs><linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120A07" /><stop offset="1" stopColor="#2A1A10" /></linearGradient>
			<linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E1E14" /><stop offset="1" stopColor="#0E0907" /></linearGradient></defs>
		<rect width={W} height={H} fill={`url(#${id}w)`} />
		<rect x={0} y={0} width={W} height={60} fill="#0C0705" /><path d="M0,60 L1920,60" stroke="#6A3A20" strokeWidth={3} strokeOpacity={0.6} />
		{[40, 1290, 1830].map((x, i) => <g key={i}><rect x={x} y={60} width={46} height={680} fill="#3A120C" /><path d={`M${x + 46},60 L${x + 46},740`} stroke="#FF9A50" strokeWidth={2} strokeOpacity={0.35} /></g>)}
		<path d={sm([[110, 330], [420, 318], [640, 330], [640, 720], [560, 730], [470, 712], [380, 730], [280, 714], [190, 730], [110, 720]])} fill="#1E0F0A" />
		<rect x={1380} y={330} width={330} height={360} fill="#1A0C08" stroke="#6A3A20" strokeWidth={4} />{fu}
		<path d={pth([[1230, 690], [1920, 682], [1920, 722], [1210, 730]])} fill="#2A1A12" /><path d="M1210,730 L1920,722 L1920,744 L1210,752 Z" fill="#160D09" />
		<path d="M1230,690 L1920,682" stroke="#FFB060" strokeWidth={2} strokeOpacity={0.5} />
		<path d={pth([[0, 735], [1210, 745], [1210, 752], [1920, 744], [1920, 1080], [0, 1080]])} fill={`url(#${id}f)`} />
		{Array.from({length: 9}, (_, i) => <path key={i} d={`M${-200 + i * 300},1080 L${300 + i * 140},745`} stroke="#3A2618" strokeWidth={2} strokeOpacity={0.6} />)}
		{[800, 870, 960].map((y, i) => <path key={i} d={`M0,${y} L1920,${y - 8}`} stroke="#3A2618" strokeWidth={2} strokeOpacity={0.5} />)}
		{people && <>
			<Sil id={`${id}king`} x={1540} y={694} k={2.05} flip rim="#FFB870" lx={-1} ly={0.2}><Body s={stand(-2, 0.2, kingHand, [12, -98])} dress="kingrobe" hat="mian" /></Sil>
			<Sil id={`${id}he`} x={330} y={800} k={2.2} rim="#FFB060" lx={1} ly={0.15}><Body s={kneel(heBow)} dress="robe" hat="guan" /></Sil></>}
		<Haze y={760} h={130} c="#C8884A" o={0.14} id={`${id}hz`} />
		{[[560, 'a'], [1360, 'b']].map(([x, k]) => { const X = x as number, by = HOME_Y; return <g key={k as string}><path d={`M${X - 30},${by + 30} L${X + 30},${by + 30} L${X + 9},${by - 4} L${X + 7},${by - 150} L${X + 34},${by - 164} L${X - 34},${by - 164} L${X - 7},${by - 150} L${X - 9},${by - 4} Z`} fill="#24160E" />
			<path d={sm([[X - 9, by - 168], [X, by - 206], [X + 9, by - 168]])} fill="#FFD890" /><Glow x={X} y={by - 180} r={220} c="#FFB060" o={0.45} id={`${id}l${k}`} /></g>; })}
		<Glow x={960} y={600} r={380} c="#FFB050" o={0.22} id={`${id}halo`} />
		{withStand && <HallStand />}
	</>; };
export const HallStand: React.FC = () => <><Top x0={680} x1={1240} h={56} top="#3A2614" face="#1C120A" edge="#FFC070" edgeO={0.6} />
	{[700, 1196].map((x, i) => <rect key={i} x={x} y={HOME_Y + 70} width={30} height={40} fill="#140C08" />)}</>;
const F5: React.FC = () => <Frame c={C('5')} bg="#0A0605" vig={0.65} z={{az: -30, light: LH, patina: 0.02, fresh: 0.62}} back={() => <Hall people id="c5" />} />;

/* ============================== 7 · the column of 宅兹中或 (start: a reading light from above in the dark) ============================== */
const F7: React.FC = () => <Frame c={C('7')} bg="#080604" vig={0.75} z={{az: 30, light: LTop, patina: 0, fresh: 0.55, shadow: true}}
	back={() => <><rect width={W} height={H} fill="#0A0806" />
		<Beam pts={[[860, -20], [1060, -20], [1260, 900], [660, 900]]} c="#FFD8A0" o={0.2} id="c7sh" />
		<Glow x={960} y={900} r={420} c="#FFC880" o={0.3} id="c7p" sy={0.14} />
		<Top x0={660} x1={1260} h={200} top="#2A1E14" face="#140E0A" edge="#FFC880" edgeO={0.4} />
		<Motes n={40} x0={700} x1={1220} y0={40} y1={860} c="#FFE6B8" seed={71} o={0.4} /></>} />;
const L7: ZunLight = {dir: [0.45, 0.25, 0.86], col: '#FFC890', k: 0.85, amb: 0.22, ambCol: '#4A3A2E', spec: 0.6, shin: 18, inside: 0.45};
const F7e: React.FC = () => { const u = (5.5 - 6) * 1.12, a = Math.PI / 4, T: V3 = [Math.cos(a - Math.PI / 2) * u, Math.sin(a - Math.PI / 2) * u, ZUN.FLOOR], off = 7;
	const cam = lookAt([T[0] - off * Math.cos(a), T[1] - off * Math.sin(a), 88.8], T, 5600, 1230, 600);
	return <CloseFrame c={C('7')} bg="#0A0705" vig={0.72}>
		<rect width={W} height={H} fill="#1A120A" />
		<Zun cam={cam} light={L7} id="e7z" patina={0} fresh={0.4} reveal={1} glow={0.75} shadow={false} />
	</CloseFrame>; };

/* ============================== 8 · the altar at dawn over 洛邑 ============================== */
const F8: React.FC = () => <Frame c={C('8')} bg="#141A2E" vig={0.55} z={{az: 30, light: LDawn, patina: 0.02, fresh: 0.6, shadow: true}}
	back={() => <><Luoyi id="c8" mood="dawn" />
		<path d={sm([[-40, 940], [420, 920], [960, 914], [1500, 920], [1960, 936], [1960, 1100], [-40, 1100]])} fill="#1E140F" />
		<Top x0={600} x1={1320} h={240} top="#4A3020" face="#24160F" edge="#FFC890" edgeO={0.7} />
		{Array.from({length: 4}, (_, i) => <path key={i} d={`M600,${HOME_Y + 64 + i * 44} L1320,${HOME_Y + 64 + i * 44}`} stroke="#1A100B" strokeWidth={3} />)}</>} />;

/* ============================== 9 · the burial, a time-lapse: the earth lays down over it, three thousand years race above ============================== */
const F9: React.FC = () => { const g = 292;   /* the ground line at this moment of the time-lapse */
	const cols = ['#7A5E3C', '#6A5236', '#5A4430', '#68503A', '#4E3A28', '#5E4632', '#46342A', '#3E2E22'];
	const tops = [g + 10, g + 40, g + 96, g + 190, g + 300, g + 430, g + 560, g + 690];
	const band = (i: number) => { const y0 = tops[i], y1 = i === cols.length - 1 ? 1100 : tops[i + 1], wv = (y: number, s: number) => Array.from({length: 13}, (_, j) => [-40 + j * 168, y + Math.sin(j * 1.3 + s) * 6 + (rnd(j, s) - 0.5) * 8] as P);
		return <path key={i} d={sm([...wv(y0, i), [1980, y0], [1980, y1 + 10], ...wv(y1 + 10, i + 1).reverse(), [-60, y1 + 10]], true)} fill={cols[i]} />; };
	return <Frame c={C('9')} bg="#0A0B12" vig={0.55} z={{az: 30, light: L9, patina: 0.72, shadow: false}}
		back={() => <>
			<defs><linearGradient id="c9sky" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#060814" /><stop offset="0.45" stopColor="#141C34" /><stop offset="0.62" stopColor="#5A6E8E" /><stop offset="0.8" stopColor="#C8B08A" /><stop offset="1" stopColor="#7A88A0" /></linearGradient>
				<linearGradient id="c9dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.5} /></linearGradient>
				<filter id="c9bl" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={3} /></filter></defs>
			{/* the sky in time-lapse: night on the left with star trails, day on the right with the sun's arcs smeared across it */}
			<rect width={W} height={g + 20} fill="url(#c9sky)" />
			<g stroke="#DDE6FF" strokeOpacity={0.35} strokeWidth={1.6} fill="none">{Array.from({length: 26}, (_, i) => { const r = 120 + rnd(i, 3) * 700, a0 = 200 + rnd(i, 4) * 40; return <path key={i} d={`M${f1(300 + r * Math.cos(a0 * Math.PI / 180))},${f1(-60 - r * Math.sin(a0 * Math.PI / 180))} A${f1(r)},${f1(r)} 0 0 0 ${f1(300 + r * Math.cos((a0 + 14) * Math.PI / 180))},${f1(-60 - r * Math.sin((a0 + 14) * Math.PI / 180))}`} />; })}</g>
			<g filter="url(#c9bl)" fill="none" stroke="#FFE6A8">{[0, 1, 2, 3].map((i) => <path key={i} d={`M${1000 + i * 30},${g} Q${1450 + i * 20},${-80 + i * 34} ${1940},${g - 40 + i * 10}`} strokeWidth={5 - i} strokeOpacity={0.35 - i * 0.06} />)}</g>
			{/* the eras passing over the ground, as overlapping exposures: a 西周 wall, 秦汉 roofs, a 唐 pagoda (now), a village, a road */}
			<g opacity={0.16}><path d={pth([[1180, g], [1180, g - 52], [1900, g - 52], [1900, g]])} fill="#1A1410" /><rect x={1500} y={g - 74} width={70} height={22} fill="#1A1410" /></g>
			<g opacity={0.28}>{[1240, 1560].map((x, i) => <g key={i}><rect x={x + 30} y={g - 90} width={180} height={90} fill="#141010" /><path d={sm([[x - 10, g - 86], [x + 50, g - 128], [x + 190, g - 128], [x + 250, g - 86], [x + 220, g - 96], [x + 30, g - 96]])} fill="#141010" /></g>)}</g>
			<g opacity={0.72}>{Array.from({length: 7}, (_, i) => { const w = 92 - i * 10, y = g - 26 - i * 30; return <g key={i}><rect x={1480 - w / 2 + 14} y={y} width={w - 28} height={30} fill="#0E0C0C" /><path d={sm([[1480 - w / 2 - 12, y + 4], [1480, y - 10], [1480 + w / 2 + 12, y + 4], [1480 + w / 2, y + 10], [1480 - w / 2, y + 10]])} fill="#0E0C0C" /></g>; })}
				<path d={`M1480,${g - 236} L1480,${g - 280}`} stroke="#0E0C0C" strokeWidth={5} /></g>
			<g opacity={0.3}>{[1260, 1330, 1640, 1720, 1800].map((x, i) => <g key={i}><rect x={x} y={g - 40} width={56} height={40} fill="#181412" /><path d={pth([[x - 6, g - 40], [x + 28, g - 62], [x + 62, g - 40]])} fill="#181412" /></g>)}</g>
			<g opacity={0.14}><path d={pth([[1150, g - 6], [1920, g - 14], [1920, g - 4], [1150, g + 2]])} fill="#3A3A3A" /></g>
			{/* the ground line: the seasons smeared along it — snow, green, dry stubble — and falling snow and leaves */}
			<path d={`M-40,${g} L1960,${g - 4} L1960,${g + 16} L-40,${g + 16} Z`} fill="#3A3020" />
			<path d={sm([[-40, g - 2], [200, g - 8], [420, g - 4], [560, g - 9], [700, g - 3], [700, g + 6], [-40, g + 6]])} fill="#E8EEF4" opacity={0.85} />
			{Array.from({length: 70}, (_, i) => { const x = 680 + i * 12 + rnd(i, 5) * 8; return <path key={i} d={`M${f1(x)},${g} l${f1(-2 + rnd(i, 6) * 4)},${f1(-8 - rnd(i, 7) * 14)}`} stroke={x < 1250 ? '#6A8A3A' : '#B89A5A'} strokeWidth={2.4} />; })}
			{Array.from({length: 40}, (_, i) => <path key={i} d={`M${f1(rnd(i, 81) * 1900)},${f1(20 + rnd(i, 82) * (g - 40))} l${f1(-6 - rnd(i, 83) * 6)},${f1(18 + rnd(i, 84) * 18)}`} stroke={i % 3 ? '#FFFFFF' : '#C8A060'} strokeOpacity={0.45} strokeWidth={2} strokeLinecap="round" />)}
			{/* the strata, oldest at the bottom; the newest still settling */}
			{cols.map((_, i) => band(i))}
			<rect x={0} y={g} width={W} height={H - g} fill="url(#c9dk)" />
			{Array.from({length: 120}, (_, i) => <path key={i} d={`M${f1(rnd(i, 91) * W)},${f1(g + 14 + rnd(i, 92) * 40)} l0,${f1(8 + rnd(i, 93) * 16)}`} stroke="#C8A878" strokeOpacity={0.4} strokeWidth={1.6} />)}
			{Array.from({length: 46}, (_, i) => { const x = rnd(i, 51) * W, y = g + 120 + rnd(i, 52) * 640, s = 4 + rnd(i, 53) * 10; if (Math.abs(x - 960) < 330 && y > 300) return null;
				return rnd(i, 54) > 0.68 ? <path key={i} d={pth([[x - s * 1.6, y], [x - s, y - s * 0.8], [x + s * 1.4, y - s * 0.5], [x + s * 1.6, y + s * 0.3]])} fill="#8A5A3A" opacity={0.6} /> : <ellipse key={i} cx={x} cy={y} rx={s} ry={s * 0.7} fill="#2A2018" opacity={0.7} />; })}
			{/* roots growing down; one reaching for the lip */}
			<g stroke="#2A1E14" fill="none" strokeLinecap="round">
				<path d={`M1480,${g + 4} C1490,${g + 80} 1440,${g + 140} 1460,${g + 230} S1420,${g + 330} 1380,${g + 380}`} strokeWidth={5} />
				<path d={`M1460,${g + 230} C1520,${g + 260} 1560,${g + 300} 1570,${g + 360}`} strokeWidth={3} />
				<path d={`M1250,${g + 4} C1240,${g + 40} 1210,${g + 60} 1186,${g + 84}`} strokeWidth={3} />
				<path d={`M420,${g + 4} C430,${g + 70} 390,${g + 130} 410,${g + 210}`} strokeWidth={3.5} /></g>
			<Glow x={960} y={610} r={380} c="#140C08" o={0.7} id="c9pk" sy={0.85} />
			<Glow x={960} y={610} r={360} c="#FFB060" o={0.42} id="c9h" /></>} />; };

/* ============================== 10 · 1963, 贾村: out of the loess ============================== */
const F10: React.FC = () => <Frame c={C('10')} bg="#2A2A30" vig={0.55} z={{az: -30, light: L10, patina: 1, shadow: false}}
	back={() => <>
		<defs><linearGradient id="c10sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5A6274" /><stop offset="1" stopColor="#D8B088" /></linearGradient>
			<linearGradient id="c10cl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#A07A4C" /><stop offset="0.6" stopColor="#7A5A38" /><stop offset="1" stopColor="#5A4028" /></linearGradient></defs>
		<rect width={W} height={360} fill="url(#c10sky)" />
		<Glow x={160} y={300} r={520} c="#FFD8A0" o={0.55} id="c10sun" sy={0.6} />
		<path d={sm([[-40, 340], [300, 346], [700, 336], [1060, 346], [1300, 332], [1960, 340], [1960, 820], [-40, 820]])} fill="url(#c10cl)" />
		<path d={sm([[-40, 470], [500, 480], [1000, 468], [1500, 478], [1960, 470], [1960, 500], [-40, 502]])} fill="#8A4E30" opacity={0.45} />
		<path d={sm([[-40, 640], [600, 650], [1200, 640], [1960, 652], [1960, 668], [-40, 664]])} fill="#8A4E30" opacity={0.3} />
		{Array.from({length: 34}, (_, i) => { const x = 20 + i * 58 + rnd(i, 7) * 30; return <path key={i} d={`M${x},${346 + rnd(i, 8) * 30} L${x + (rnd(i, 9) - 0.5) * 20},${560 + rnd(i, 10) * 240}`} stroke="#4A3420" strokeWidth={2 + rnd(i, 11) * 2} opacity={0.55} />; })}
		<path d={pth([[1360, 340], [1360, 276], [1620, 248], [1620, 340]])} fill="#3A2C22" /><path d={pth([[1340, 280], [1640, 242], [1650, 254], [1350, 292]])} fill="#2A1E16" />
		<rect x={1440} y={292} width={36} height={48} fill="#1A120C" />
		{/* the ground in front of the bank, and the pit */}
		<path d={sm([[-40, 820], [400, 800], [700, 790], [1000, 786], [1300, 798], [1960, 820], [1960, 1080], [-40, 1080]])} fill="#6A4C30" />
		<Haze y={800} h={90} c="#E8C8A0" o={0.2} id="c10hz" />
		{/* the villager, 白羊肚手巾 on his head, kneeling at the edge of the pit, leaning on the mattock */}
		<Sil id="c10v" x={1560} y={850} k={2.3} flip rim="#FFE0B0" lx={-1} ly={0.3}><Body s={kneel(24, 'down')} dress="jacket" hat="towel" /></Sil>
		<path d="M1500,856 L1410,560" stroke="#2A1C12" strokeWidth={7} strokeLinecap="round" /><path d={pth([[1404, 548], [1370, 590], [1360, 584], [1396, 538]])} fill="#3A3430" />
		<path d={sm([[540, 1080], [600, 900], [760, 870], [960, 880], [1160, 872], [1320, 900], [1400, 1080]])} fill="#4A3420" /></>}
	front={() => <>{Array.from({length: 22}, (_, i) => <ellipse key={i} cx={640 + rnd(i, 21) * 640} cy={HOME_Y + 6 + rnd(i, 22) * 150} rx={10 + rnd(i, 23) * 20} ry={7 + rnd(i, 24) * 12} fill={i % 2 ? '#4A3420' : '#7A5A3A'} />)}
		<path d={sm([[700, HOME_Y + 18], [800, HOME_Y + 4], [960, HOME_Y + 10], [1120, HOME_Y + 2], [1220, HOME_Y + 20], [1240, HOME_Y + 40], [680, HOME_Y + 40]])} fill="#5A4028" /></>} />;

/* ============================== 11 / 12 · the farmhouse corner ============================== */
const Farm: React.FC<{winter?: boolean}> = ({winter = false}) => { const wv = winter, c = C(wv ? '12' : '11');
	const wallL = wv ? '#2E3036' : '#4A3826', wallR = wv ? '#24262C' : '#3A2C1E', beam = wv ? '#C8DCF0' : '#FFD49A', fl = wv ? '#1E1E22' : '#2E2218';
	return <Frame c={c} bg="#141210" vig={0.62} z={{az: 30, light: LFarm(wv), patina: 0.92, shadow: true}}
		back={() => <>
			<defs><linearGradient id="c11fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={fl} /><stop offset="1" stopColor="#0C0A08" /></linearGradient></defs>
			<path d={pth([[0, 0], [960, 0], [960, 720], [0, 860]])} fill={wallL} /><path d={pth([[960, 0], [1920, 0], [1920, 860], [960, 720]])} fill={wallR} />
			{Array.from({length: 50}, (_, i) => <path key={i} d={`M${f1(rnd(i, 81) * 1900)},${f1(rnd(i, 82) * 700)} l${f1(6 + rnd(i, 83) * 14)},${f1((rnd(i, 84) - 0.5) * 6)}`} stroke="#000" strokeOpacity={0.25} strokeWidth={2} />)}
			<path d={pth([[0, 860], [960, 720], [1920, 860], [1920, 1080], [0, 1080]])} fill="url(#c11fl)" />
			{/* the window on the left wall: a wooden lattice with paper panes, its light falling on the jar */}
			<path d={pth([[300, 360], [560, 376], [560, 590], [300, 600]])} fill={wv ? '#C8D8E8' : '#F2D8A8'} opacity={wv ? 0.6 : 0.55} />
			{[0.25, 0.5, 0.75].map((u, i) => <path key={i} d={`M${300 + 260 * u},${360 + 16 * u} L${300 + 260 * u},${600 - 10 * u}`} stroke="#2A1C12" strokeWidth={6} />)}
			{[0.33, 0.66].map((u, i) => <path key={`h${i}`} d={`M300,${360 + 240 * u} L560,${376 + 214 * u}`} stroke="#2A1C12" strokeWidth={6} />)}
			<path d={pth([[288, 350], [572, 366], [572, 602], [288, 612]])} fill="none" stroke="#2A1C12" strokeWidth={12} />
			{wv && <path d={pth([[300, 600], [560, 590], [560, 576], [300, 586]])} fill="#F2F6FA" opacity={0.6} />}
			<Beam pts={[[560, 376], [560, 590], [1300, 1080], [1400, 640]]} c={beam} o={wv ? 0.12 : 0.18} id="c11b" dir={[0, 0, 1, 0.4]} />
			{/* the right wall: a straw hat, a string of maize, a winnowing basket, a big 瓮 back by the wall */}
			<ellipse cx={1500} cy={400} rx={58} ry={16} fill="#2A1E14" /><path d={sm([[1468, 400], [1478, 368], [1522, 368], [1532, 400]])} fill="#2A1E14" />
			{Array.from({length: 6}, (_, i) => <ellipse key={i} cx={1660 + (i % 2) * 18} cy={380 + i * 26} rx={12} ry={18} fill={wv ? '#3A3428' : '#7A5A2A'} />)}<path d="M1669,336 L1669,372" stroke="#1A120C" strokeWidth={3} />
			<path d={sm([[1700, 820], [1730, 650], [1840, 630], [1880, 800]])} fill="#2E2216" />
			<path d={sm([[1340, 830], [1316, 760], [1330, 700], [1380, 684], [1460, 684], [1510, 700], [1524, 760], [1500, 830]])} fill="#1E1812" /><path d="M1330,700 C1380,684 1460,684 1510,700" stroke={beam} strokeOpacity={0.3} strokeWidth={2} fill="none" />
			<path d="M420,860 L380,600" stroke="#1E140E" strokeWidth={7} strokeLinecap="round" />
			<Glow x={960} y={600} r={400} c={beam} o={wv ? 0.12 : 0.18} id="c11h" /></>}
		front={(cam) => <>
			<Grain cam={cam} heap={wv ? 0.6 : 3.2} id="c11g" c1={wv ? '#8A7E68' : '#E8C27A'} c2={wv ? '#4A4232' : '#8A6430'} />
			{!wv && Array.from({length: 46}, (_, i) => <ellipse key={i} cx={720 + rnd(i, 91) * 480} cy={HOME_Y + 14 + rnd(i, 92) * 44} rx={3} ry={1.8} fill="#D8B068" opacity={0.7} />)}
			{wv && <g stroke="#D8E0EA" strokeOpacity={0.35} strokeWidth={1} fill="none">{[0, 1, 2, 3].map((i) => <path key={i} d={`M${1176 - i * 10},${400 + i * 12} Q1200,450 ${1226 + i * 4},${500 - i * 8}`} />)}
				{[0, 1, 2, 3, 4].map((i) => <path key={`s${i}`} d={`M1182,402 L${1226 - i * 12},${446 + i * 14}`} />)}</g>}</>} />; };

/* ============================== 13 · on a handcart into the yard ============================== */
const F13: React.FC = () => { const by = HOME_Y + 14, RL: P = [540, by + 2], RR: P = [1360, by + 12], FR: P = [1600, 766], FL: P = [1330, 752], up = 34;
	return <Frame c={C('13')} bg="#0E0B0A" vig={0.55} z={{az: 60, light: LY, patina: 0.95, shadow: true}}
		back={() => <><YardBG />
			<path d={pth([FL, [FL[0], FL[1] - up * 0.5], [1700, 640], [1704, 648]])} fill="#241A14" />
			<Person id="c13p" f={{kind: 'worker', lean: 26, stride: 0.6, hN: [-2, -86], hF: [-6, -88]}} x={1712} y={826} k={2.3} rim="#FFB874" lx={1} ly={0.1} />
			<path d={pth([FR, [FR[0], FR[1] - up * 0.5], [1760, 654], [1764, 662]])} fill="#2A1E16" />
			<path d={pth([RL, RR, FR, FL])} fill="#4A3A2E" />
			{Array.from({length: 7}, (_, i) => { const u = (i + 1) / 8; return <path key={i} d={`M${f1(RL[0] + (RR[0] - RL[0]) * u)},${f1(RL[1] + (RR[1] - RL[1]) * u)} L${f1(FL[0] + (FR[0] - FL[0]) * u)},${f1(FL[1] + (FR[1] - FL[1]) * u)}`} stroke="#2A2018" strokeWidth={2.5} />; })}
			<path d={pth([RL, RR, [RR[0], RR[1] + 38], [RL[0], RL[1] + 34]])} fill="#1E1610" /><path d={`M${RL[0]},${RL[1]} L${RR[0]},${RR[1]}`} stroke="#FFC080" strokeWidth={2.5} strokeOpacity={0.55} />
			<path d={pth([RR, FR, [FR[0], FR[1] - up], [RR[0], RR[1] - up]])} fill="#3A2C22" /><path d={`M${RR[0]},${RR[1] - up} L${FR[0]},${FR[1] - up}`} stroke="#FFB070" strokeWidth={2} strokeOpacity={0.6} />
			<ellipse cx={1480} cy={868} rx={52} ry={148} fill="#121010" /><ellipse cx={1480} cy={868} rx={52} ry={148} fill="none" stroke="#FFB070" strokeOpacity={0.4} strokeWidth={2} />
			<ellipse cx={1480} cy={868} rx={15} ry={40} fill="#3A3230" /></>}
		front={() => <><path d={`M1130,${by - 10} Q1200,${by - 190} 1150,${by - 340}`} stroke="#C8B08A" strokeWidth={3.5} fill="none" opacity={0.8} />
			<path d={`M1150,${by - 340} Q960,${by - 372} 770,${by - 340}`} stroke="#C8B08A" strokeWidth={3.5} fill="none" opacity={0.65} /></>} />; };

/* ============================== 14 · by the jin: a hand slides the poise; the tag is written ============================== */
const F14: React.FC = () => <Frame c={C('14')} bg="#0E0B0A" vig={0.58} z={{az: -30, light: LYlow, patina: 0.95, shadow: true}}
	back={() => <><YardBG />
		<rect width={W} height={H} fill="#2A0E04" opacity={0.18} />
		<Scale poise={1600} trail rimC="#FF9A50" /></>}
	front={(cam) => { const k = zunScreen(cam).pxPerCm; return <><Tag30 cam={cam} />
		<Sil id="c14h" x={1640} y={470} k={k * 0.9} flip rim="#FFB874" lx={-1} ly={-0.4}><g transform="rotate(10)"><GripHand arm={34} /></g></Sil></>; }} />;

/* ============================== 15 / 16 · on the scrap pile, the furnace near ============================== */
const Pile: React.FC<{dark: string; rimC: string}> = ({dark, rimC}) => <>
	{pile(960, 1150, 1500, 300, 13, dark, rimC, 2.2)}
	<path d={sm([[560, 1080], [600, HOME_Y + 30], [760, HOME_Y + 6], [960, HOME_Y + 12], [1160, HOME_Y + 4], [1320, HOME_Y + 28], [1380, 1080]])} fill={dark} />
	<path d={sm([[600, HOME_Y + 30], [760, HOME_Y + 6], [960, HOME_Y + 12], [1160, HOME_Y + 4], [1320, HOME_Y + 28]], false)} fill="none" stroke={rimC} strokeWidth={2} strokeOpacity={0.5} />
	<ellipse cx={600} cy={HOME_Y + 70} rx={120} ry={70} fill={dark} stroke={rimC} strokeWidth={2} strokeOpacity={0.5} /><ellipse cx={590} cy={HOME_Y + 50} rx={70} ry={22} fill="#000" opacity={0.35} />
	<path d={`M1240,${HOME_Y + 110} L1560,${HOME_Y + 10}`} stroke={dark} strokeWidth={34} strokeLinecap="round" /><path d={`M1240,${HOME_Y + 94} L1560,${HOME_Y - 6}`} stroke={rimC} strokeWidth={2} strokeOpacity={0.5} />
</>;
const F15: React.FC = () => <Frame c={C('15')} bg="#080506" vig={0.6} z={{az: 30, light: L15, patina: 0.95, shadow: false}}
	back={() => <><YardBG mood="night" piles={false} />
		<Glow x={1600} y={760} r={700} c="#FF6A20" o={0.5} id="c15g" />
		<Furnace x={1640} y={930} s={0.8} id="c15f" heat={0.78} />
		{pile(260, 960, 560, 200, 17, '#120B08', '#C85A28', 1.2)}
		<Pile dark="#1A100C" rimC="#FF8A40" /></>}
	front={() => <Motes n={60} x0={1080} x1={1880} y0={200} y1={900} c="#FFB050" seed={151} o={0.8} r={2.6} />} />;
const F16: React.FC = () => <Frame c={C('16')} bg="#0A0303" vig={0.72} z={{az: 60, light: L16, patina: 0.9, shadow: false}}
	back={() => <><rect width={W} height={H} fill="#120404" />
		<Glow x={1700} y={820} r={900} c="#FF4A10" o={0.55} id="c16g" />
		<Pile dark="#160A08" rimC="#FF6A30" /></>}
	front={() => <Motes n={70} x0={900} x1={1900} y0={200} y1={1000} c="#FFB050" seed={161} o={0.85} r={2.8} />} />;
const F16e: React.FC = () => { const th = 5.25 / 9.4, z = 14.7, Pq = surfPt(th, z, 0.6), a = (th * 180 / Math.PI - 4) * Math.PI / 180, D = 62;
	const cam = lookAt([Pq[0] + D * Math.cos(a), Pq[1] + D * Math.sin(a), Pq[2] + 4], Pq, 4300, 960, 680);
	return <CloseFrame c={C('16')} bg="#0A0303" vig={0.8}>
		<defs><radialGradient id="e16bg" cx="80%" cy="70%" r="80%"><stop offset="0" stopColor="#5A1A08" /><stop offset="1" stopColor="#0A0303" /></radialGradient></defs>
		<rect width={W} height={H} fill="url(#e16bg)" />
		<Zun cam={cam} light={L16} id="e16z" patina={0.9} shadow={false} inscription={false} />
		<Glow x={1800} y={900} r={700} c="#FF6A20" o={0.28} id="e16f" />
		<Motes n={40} x0={1100} x1={1900} y0={300} y1={1060} c="#FFB050" seed={161} o={0.8} r={2.8} />
	</CloseFrame>; };

/* ============================== the stop ============================== */
const FStop: React.FC = () => <Frame c={C('停')} bg="#000" vig={0.85} z={{az: 30, light: LM, mode: 'sil', rim: '#E0501A', halo: '#A02A08', haloO: 0.35}}
	back={() => <><rect width={W} height={H} fill="#020101" /><Glow x={1500} y={1000} r={900} c="#C83A10" o={0.22} id="csg" sy={0.6} /></>} />;

/* ============================== 17 · morning: the museum man stops, back in the yard ============================== */
const F17: React.FC = () => <Frame c={C('17')} bg="#3A4A5E" vig={0.55} z={{az: -30, light: LMorn, patina: 0.95, shadow: false}}
	back={() => <><YardBG mood="morning" piles={false} />
		{pile(1720, 900, 520, 200, 19, '#18120E', '#D8B088', 1.2)}
		{/* he has stopped mid-stride by the far heap, leaning to look; his long morning shadow reaches toward it */}
		<path d={pth([[1556, 838], [1580, 846], [1160, 1000], [1110, 990]])} fill="#000" opacity={0.25} />
		<Sil id="c17m" x={1560} y={840} k={2.45} flip rim="#FFE6C0" lx={-1} ly={0.25}><Body s={stand(12, 0.42, [40, -116], [6, -84], 22)} dress="zsz" hat="cadre" /></Sil>
		<Sil id="c17bag" x={1560} y={840} k={2.45} flip rim="#FFE6C0" lx={-1} ly={0.25}><path d={sm([[-20, -98], [-6, -98], [-4, -76], [-22, -74]])} /><path d={tube([-14, -98], [10, -138], 1.2, 1.2)} /></Sil>
		<Haze y={820} h={120} c="#E8D8C8" o={0.18} id="c17hz" />
		<Pile dark="#1E1612" rimC="#F0C898" />
		<Beam pts={[[0, 360], [0, 640], [900, 1000], [1120, 560]]} c="#FFE6C0" o={0.2} id="c17b" dir={[0, 0, 1, 0.3]} /></>} />;

/* ============================== 18 · carried away in his arms ============================== */
/* a close two-shot of the 尊 and his chest: the 中山装 front behind it (buttons, the four pockets), his arms coming down on
   both sides, the right forearm under its foot, the left hand on its flank. His head is above the frame. At the enlarged 尊's
   scale (the label says so); lit from the left by the morning sun. */
const F18: React.FC = () => { const g = 'url(#c18j)';
	const torso = sm([[470, -40], [1450, -40], [1430, 400], [1400, 1100], [520, 1100], [490, 400]]);
	const armL = sleeve([600, -60], [560, 690], [830, 880], 96, 74, 60), armR = sleeve([1340, -60], [1390, 640], [1165, 735], 92, 72, 58);
	return <Frame c={C('18')} bg="#3A4A5E" vig={0.55} z={{az: 30, light: LMorn, patina: 0.92, shadow: false}}
		back={() => <><YardBG mood="morning" />
			<defs><linearGradient id="c18j" gradientUnits="userSpaceOnUse" x1={470} y1={0} x2={1450} y2={0}><stop offset="0" stopColor="#4E5662" /><stop offset="0.35" stopColor="#2A2E36" /><stop offset="1" stopColor="#14161B" /></linearGradient></defs>
			<Sil id="c18t" x={0} y={0} k={1} rim="#FFE6C0" lx={-1} ly={0.1} fill={g}><path d={torso} /></Sil>
			<g stroke="#0E1014" strokeWidth={3} fill="none" opacity={0.85}>
				<path d="M960,-40 L968,1100" />
				<path d="M700,120 L850,116 M1080,114 L1230,118" /><path d="M700,120 L706,250 L846,248 L850,116 M1080,114 L1084,246 L1226,250 L1230,118" />
				<path d="M560,940 L790,936 L796,1080 M1130,936 L1360,940 L1356,1080" /></g>
			<g fill="#0E1014">{[60, 200, 950].map((y, i) => <circle key={i} cx={963 + i} cy={y} r={9} />)}</g>
			<path d="M520,40 C540,300 520,600 560,1000" stroke="#7A8290" strokeWidth={2} strokeOpacity={0.35} fill="none" /></>}
		front={(cam) => { const k = zunScreen(cam).pxPerCm * 0.92; return <>
			<Sil id="c18a" x={0} y={0} k={1} rim="#FFE6C0" lx={-1} ly={0.1} fill={g}><path d={armL} /><path d={armR} /></Sil>
			<g stroke="#0E1014" strokeWidth={3} fill="none" opacity={0.8}><path d="M520,650 C560,700 600,720 650,700" /><path d="M1420,610 C1390,660 1360,680 1320,670" /></g>
			<Sil id="c18r" x={826} y={878} k={k} rim="#FFE6C0" lx={-1} ly={-0.4} fill="#2A2420"><g transform="rotate(-6)"><GripHand arm={6} /></g></Sil>
			<Sil id="c18l" x={1168} y={734} k={k} flip rim="#FFE6C0" lx={-1} ly={-0.4} fill="#2A2420"><g transform="rotate(14)"><GripHand arm={6} /></g></Sil></>; }} />; };

/* ============================== 19 / 20 / 21 / 22 · 1975, the 故宫 restoration room ============================== */
const Room: React.FC<{clean?: boolean; lamp?: 'left' | 'over'; dark?: boolean; id: string}> = ({clean = false, lamp = 'left', dark = false, id}) => { const by = HOME_Y + 14;
	return <>
		<defs><linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1C1A18" /><stop offset="1" stopColor="#2C2622" /></linearGradient></defs>
		<rect width={W} height={H} fill={`url(#${id}w)`} />
		{/* the window: lattice, and through it the 故宫 — a red wall, a yellow-glazed roof with its upturned eave */}
		<g opacity={dark ? 0.35 : 1}>
			<rect x={1330} y={260} width={420} height={380} fill="#6A7A8C" />
			<path d={pth([[1330, 560], [1750, 556], [1750, 640], [1330, 640]])} fill="#7A2A1E" />
			<path d={sm([[1330, 470], [1400, 440], [1650, 432], [1750, 420], [1750, 470], [1690, 462], [1400, 472]])} fill="#B88A3A" />
			<path d={pth([[1370, 474], [1720, 466], [1720, 560], [1370, 560]])} fill="#5A1E16" />
			{[0.333, 0.666].map((u, i) => <path key={i} d={`M${1330 + 420 * u},260 L${1330 + 420 * u},640`} stroke="#1A1612" strokeWidth={10} />)}
			<path d="M1330,440 L1750,440" stroke="#1A1612" strokeWidth={10} /><rect x={1320} y={250} width={440} height={400} fill="none" stroke="#1A1612" strokeWidth={18} /></g>
		{dark && <rect width={W} height={H} fill="#000" opacity={0.4} />}
		{/* the bench and its tools */}
		<path d={pth([[0, by - 4], [1920, by - 4], [1920, by + 26], [0, by + 26]])} fill="#4A3A2C" /><rect x={0} y={by + 26} width={W} height={300} fill="#1A1410" />
		<path d={`M0,${by - 4} L1920,${by - 4}`} stroke="#FFE0B0" strokeWidth={2} strokeOpacity={0.35} />
		<rect x={1330} y={by - 16} width={300} height={12} fill="#D8D0C0" opacity={0.6} />
		{[0, 1, 2, 3].map((i) => <path key={i} d={`M${1350 + i * 64},${by - 14} L${1396 + i * 64},${by - 22}`} stroke="#C8C8C8" strokeWidth={3} />)}
		<path d={sm([[1690, by - 4], [1682, by - 80], [1748, by - 80], [1740, by - 4]])} fill="#2A2420" />{[0, 1, 2].map((i) => <path key={i} d={`M${1704 + i * 14},${by - 80} L${1690 + i * 20},${by - 190}`} stroke="#3A2C20" strokeWidth={5} />)}
		{[0, 1, 2].map((i) => <rect key={i} x={160 + i * 56} y={by - 62 + i * 6} width={34} height={58 - i * 6} rx={4} fill="#3A4A50" opacity={0.8} />)}
		{/* the work lamp: an enamel shade on an arm */}
		{lamp === 'left' ? <><path d={`M360,${by - 4} L430,${by - 4} L408,${by - 22} L382,${by - 22} Z`} fill="#141210" /><path d={`M395,${by - 22} L420,420 L560,380`} stroke="#141210" strokeWidth={10} fill="none" strokeLinejoin="round" />
			<path d={pth([[520, 340], [650, 372], [712, 490], [520, 470]])} fill="#2A3A34" /><ellipse cx={618} cy={482} rx={96} ry={22} transform="rotate(8 618 482)" fill="#FFF0D0" />
			<Beam pts={[[540, 476], [712, 494], [1240, by], [700, by]]} c="#FFE8C0" o={0.22} id={`${id}b`} /></>
			: <><path d={`M1560,${by - 4} L1630,${by - 4} L1608,${by - 22} L1582,${by - 22} Z`} fill="#141210" /><path d={`M1595,${by - 22} L1560,330 L1180,316`} stroke="#141210" strokeWidth={10} fill="none" strokeLinejoin="round" />
			<path d={pth([[1080, 300], [1220, 300], [1250, 350], [1050, 350]])} fill="#2A3A34" /><ellipse cx={1150} cy={350} rx={102} ry={14} fill="#FFF0D0" />
			<Beam pts={[[1050, 350], [1250, 350], [1180, 520], [760, 520]]} c="#FFE8C0" o={0.3} id={`${id}b`} /></>}
		{clean && <Beam pts={[[800, 420], [1120, 420], [1240, 0], [680, 0]]} c="#FFD890" o={0.3} id={`${id}up`} dir={[0, 1, 0, 0]} />}
		<Glow x={960} y={600} r={420} c="#FFE0B0" o={clean ? 0.3 : 0.16} id={`${id}h`} />
	</>; };
const RestHands: React.FC<{cam: Cam; id: string; scalpel?: boolean}> = ({cam, id, scalpel = true}) => { const k = zunScreen(cam).pxPerCm * 0.9;
	return <>{scalpel && <Sil id={`${id}a`} x={1400} y={372} k={k} flip rim="#FFE6C0" lx={-1} ly={-0.6}><g transform="rotate(12)"><HandTool tool="scalpel" coat="#8E8A84" /></g></Sil>}
		<Sil id={`${id}c`} x={1340} y={780} k={k} flip rim="#FFE6C0" lx={-1} ly={-0.6}><g transform="rotate(-15)"><HandTool tool="brush" coat="#8E8A84" /></g></Sil>
		{scalpel && <Motes n={24} x0={1080} x1={1180} y0={360} y1={450} c="#8A6A48" seed={191} o={0.9} r={2.2} />}</>; };
const F19: React.FC = () => <Frame c={C('19')} bg="#0C0B0A" vig={0.62} z={{az: -30, light: LRoom(false), patina: 0.82, shadow: true}} back={() => <Room id="r19" />} front={(cam) => <RestHands cam={cam} id="r19" />} />;
const F20: React.FC = () => <Frame c={C('20')} bg="#0C0B0A" vig={0.62} z={{az: 30, light: LRoom(false), patina: 0.78, shadow: true}} back={() => <Room id="r20" lamp="over" />} front={(cam) => <RestHands cam={cam} id="r20" scalpel={false} />} />;
const F21: React.FC = () => <Frame c={C('21')} bg="#060505" vig={0.7} z={{az: 30, light: {...LRoom(false), k: 1.2, amb: 0.2}, patina: 0.7, shadow: true}} back={() => <Room id="r21" lamp="over" dark />} />;
const F22: React.FC = () => <Frame c={C('22')} bg="#0C0B0A" vig={0.62} z={{az: 30, light: LRoom(true), patina: 0.06, shadow: true}} back={() => <Room id="r22" clean />} />;
const F20e: React.FC = () => <KF3 ov={<Ov c={C('20')} label={false} />} reveal={0.62} glow={0} />;
const F21e: React.FC = () => <KF3 ov={<Ov c={C('21')} label={false} />} reveal={0.96} glow={1} brush={false} f={4800} cy={560} />;

/* ============================== 23 · the plain of 洛阳, remembered in full morning ============================== */
const F23: React.FC = () => <Frame c={C('23')} bg="#3A6A9A" vig={0.5} z={{az: -30, light: LMem, patina: 0.04, shadow: true}}
	back={() => <><Luoyi id="c23" mood="morning" />
		<defs><linearGradient id="c23fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A2620" stopOpacity={0} /><stop offset="0.35" stopColor="#1A1814" stopOpacity={0.85} /><stop offset="1" stopColor="#0E0C0A" /></linearGradient></defs>
		<rect x={0} y={760} width={W} height={320} fill="url(#c23fl)" />
		<ellipse cx={960} cy={HOME_Y + 14} rx={340} ry={34} fill="#FFF0D8" opacity={0.16} /></>} />;

/* ============================== 24 · the slow orbit, the light warming ============================== */
const F24: React.FC = () => <Frame c={C('24')} bg="#0C0806" vig={0.7} z={{az: 60, light: LWarm, patina: 0.04, shadow: true}}
	back={() => <><defs><radialGradient id="c24bg" cx="56%" cy="55%" r="65%"><stop offset="0" stopColor="#4A2E1A" /><stop offset="0.6" stopColor="#1A100A" /><stop offset="1" stopColor="#0A0605" /></radialGradient></defs>
		<rect width={W} height={H} fill="url(#c24bg)" />
		<ellipse cx={960} cy={HOME_Y + 10} rx={600} ry={80} fill="none" stroke="#FFC888" strokeOpacity={0.18} strokeWidth={2} />
		<Glow x={960} y={HOME_Y + 10} r={440} c="#FFC888" o={0.32} id="c24p" sy={0.15} />
		<Motes n={36} x0={500} x1={1500} y0={300} y1={900} c="#FFE0B0" seed={241} o={0.35} /></>} />;

/* ============================== 25 / 27 / END · the museum at night; 26 · the gallery by day ============================== */
const MuseumNight: React.FC<{id: string}> = ({id}) => <>
	<defs><linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E8F0FF" stopOpacity={0.14} /><stop offset="1" stopColor="#E8F0FF" stopOpacity={0.02} /></linearGradient>
		<linearGradient id={`${id}p`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A2624" /><stop offset="1" stopColor="#0C0B0A" /></linearGradient>
		<linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B8C8D4" stopOpacity={0} /><stop offset="0.3" stopColor="#B8C8D4" stopOpacity={0.4} /><stop offset="1" stopColor="#B8C8D4" stopOpacity={0.4} /></linearGradient></defs>
	<rect width={W} height={H} fill="#06070A" />
	<path d="M880,-20 L1040,-20 L1360,900 L560,900 Z" fill={`url(#${id}c)`} />
	<Top x0={600} x1={1320} h={300} top="#3A3430" face={`url(#${id}p)`} edge="#D8E0EA" edgeO={0.3} />
	<Glow x={960} y={HOME_Y + 10} r={340} c="#E8F0FF" o={0.32} id={`${id}pool`} sy={0.12} />
	<path d={`M560,320 L560,${HOME_Y + 14} M1360,320 L1360,${HOME_Y + 14}`} stroke={`url(#${id}g)`} strokeWidth={2} fill="none" />
	<path d={`M612,330 L690,330 L630,${HOME_Y} L570,${HOME_Y} Z`} fill="#D8E6F0" opacity={0.05} />
	<rect x={1150} y={HOME_Y + 80} width={150} height={52} fill="#1C1A18" stroke="#3A3632" /><text x={1225} y={HOME_Y + 113} textAnchor="middle" fontFamily={KAI} fontSize={22} fill="#B8A88A">何尊 · 西周</text>
</>;
const F25: React.FC = () => <Frame c={C('25')} bg="#060606" vig={0.72} z={{az: 30, light: rotLcool(LMus), patina: 0.04, shadow: true}} back={() => <MuseumNight id="m25" />} />;
function rotLcool(L: ZunLight): ZunLight { return {...L, col: '#E8F0FF', rim: L.rim ? {...L.rim, col: '#CFE0F0'} : undefined}; }
const F26: React.FC = () => <Frame c={C('26')} bg="#2A2622" vig={0.5} z={{az: -30, light: LMusDay, patina: 0.04, shadow: true}}
	back={() => <>
		<defs><linearGradient id="m26w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A4238" /><stop offset="1" stopColor="#2A241E" /></linearGradient>
			<linearGradient id="m26f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5A4E40" /><stop offset="1" stopColor="#1E1A16" /></linearGradient>
			<linearGradient id="m26p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A3430" /><stop offset="1" stopColor="#14120F" /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#m26w)" />
		{/* a long skylight band and its daylight on the far wall */}
		<rect x={0} y={0} width={W} height={70} fill="#E8E0D0" opacity={0.5} /><Beam pts={[[200, 70], [1720, 70], [1920, 720], [0, 720]]} c="#FFF4E0" o={0.14} id="m26sky" />
		<rect x={0} y={700} width={W} height={380} fill="url(#m26f)" />
		{/* other cases along the far wall, small */}
		{[160, 1600].map((x, i) => <g key={i}><rect x={x} y={500} width={170} height={200} fill="#1A1814" opacity={0.6} stroke="#C8C0B0" strokeOpacity={0.3} /><rect x={x} y={700} width={170} height={60} fill="#2A2420" /></g>)}
		{/* visitors in the gallery behind it: their own size, some stopping to look */}
		{[[380, 790, 2.3, 4, false], [520, 800, 2.4, -2, false], [1440, 796, 2.35, 2, true], [1560, 780, 2.1, 0, true], [1720, 806, 2.5, 6, true], [260, 770, 2.0, 0, false]].map(([x, y, k, l, fl], i) =>
			<Person key={i} id={`m26v${i}`} f={{kind: 'visitor', lean: l as number, stride: 0.08 + 0.1 * (i % 2), hN: [10, -100 + 6 * i], hF: [3, -84], flip: fl as boolean}} x={x as number} y={y as number} k={k as number} rim="#FFE8C8" lx={fl ? -1 : 1} ly={0.3} fill="#2A2420" />)}
		<Haze y={790} h={120} c="#E8DCC8" o={0.22} id="m26hz" />
		<Top x0={600} x1={1320} h={300} top="#4A4440" face="url(#m26p)" edge="#FFF0DC" edgeO={0.4} />
		<path d={`M560,320 L560,${HOME_Y + 14} M1360,320 L1360,${HOME_Y + 14}`} stroke="#E8E0D0" strokeOpacity={0.3} strokeWidth={2} fill="none" />
		<rect x={1150} y={HOME_Y + 80} width={150} height={52} fill="#2A2622" stroke="#4A4440" /><text x={1225} y={HOME_Y + 113} textAnchor="middle" fontFamily={KAI} fontSize={22} fill="#D8C8AA">何尊 · 西周</text></>}
	front={() => <g opacity={0.12}>{/* the nearest visitors, reflected in the glass */}
		<Person id="m26r1" f={{kind: 'visitor', lean: 2, stride: 0.05, hN: [8, -84], hF: [2, -84]}} x={640} y={1080} k={3.4} rim="#FFF0DC" lx={1} ly={0.3} fill="#C8C0B0" />
		<Person id="m26r2" f={{kind: 'visitor', lean: -2, stride: 0.05, hN: [10, -110], hF: [2, -84], flip: true}} x={1300} y={1090} k={3.2} rim="#FFF0DC" lx={-1} ly={0.3} fill="#C8C0B0" /></g>} />;
const F27: React.FC = () => <Frame c={C('27')} bg="#060606" vig={0.72} z={{az: 30, light: LMus, patina: 0.04, shadow: true}}
	back={() => <><MuseumNight id="m27" /><g style={{mixBlendMode: 'screen'}}><Glow x={360} y={900} r={760} c="#FF5A18" o={0.55} id="c27a" sy={0.8} /><Furnace x={300} y={1080} s={0.9} id="c27f" heat={0.9} /></g></>}
	after={<svg width={W} height={H} style={{position: 'absolute', mixBlendMode: 'screen'}}><defs><linearGradient id="c27r" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#FF4A10" stopOpacity={0.5} /><stop offset="0.5" stopColor="#C82A08" stopOpacity={0.12} /><stop offset="1" stopColor="#000" stopOpacity={0} /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#c27r)" /><Motes n={50} x0={0} x1={900} y0={400} y1={1060} c="#FFB050" seed={271} o={0.9} r={2.8} /></svg>} />;

/* ============================== 28 · the empty scale at the empty gate ============================== */
const F28: React.FC = () => <Frame c={C('28')} bg="#0E0B0A" vig={0.6} z={{az: 30, light: LY, mode: 'ghost'}}
	back={() => <><YardBG />
		<rect x={0} y={250} width={150} height={830} fill="#1A120E" /><path d="M150,250 L150,1080" stroke="#FFB070" strokeWidth={2.5} strokeOpacity={0.5} />
		{Array.from({length: 18}, (_, i) => <path key={i} d={`M0,${290 + i * 44} L150,${290 + i * 44}`} stroke="#0E0907" strokeWidth={3} />)}
		<rect x={1700} y={250} width={220} height={830} fill="#1A120E" /><path d="M1700,250 L1700,1080" stroke="#FFB070" strokeWidth={2.5} strokeOpacity={0.6} />
		{Array.from({length: 18}, (_, i) => <path key={i} d={`M1700,${290 + i * 44} L1920,${290 + i * 44}`} stroke="#0E0907" strokeWidth={3} />)}
		<rect x={1736} y={370} width={88} height={420} fill="#D8C8A6" opacity={0.85} />
		{'废品收购站'.split('').map((ch, i) => <text key={i} x={1780} y={432 + i * 78} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={58} fill="#2A1A12">{ch}</text>)}
		<g stroke="#1A120E" strokeWidth={8} fill="none">{Array.from({length: 7}, (_, i) => <path key={i} d={`M${160 + i * 40},${470 + i * 8} L${160 + i * 40},${1000 - i * 6}`} />)}<path d="M160,470 L400,520 M160,1000 L400,960 M160,735 L400,740" /></g>
		<Scale beam={false} /></>} />;

/* ============================== END ============================== */
const END_TITLE = ['“中国”两个字，', '最早出现在哪？'], END_Q = '你家里，有没有一件被当成破烂的老东西？';
const END_SRC = '资料：新华网（2023-07-09）· 中国社会科学网（2022-07-28）';
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
/* the end card's own layout uses the middle band (question, pill, sources), so the measure label stays off it */
const FEnd: React.FC = () => <Frame c={C('END')} bg="#050505" vig={0.75} label={false} z={{az: 30, light: LMus, patina: 0.04, shadow: true}} back={() => <MuseumNight id="mE" />} top={<EndCard />} />;

/* ============================== the lists ============================== */
/** HOME frames: index i = card i. E = the second frame shown in the same storyboard cell (push-in end, or T heating up). */
export const FRAMES: {c: CardD; F: React.FC; E?: React.FC; eLabel?: [string, string]}[] = [
	{c: C('1'), F: F1}, {c: C('2'), F: F2, E: F2e, eLabel: ['HOME 起', '推近 · 饕餮双眼']}, {c: C('T'), F: FT, E: FTe, eLabel: ['9.05 标题砸下 · 环绕', '14.9 剪影发热 → 卡3']},
	{c: C('3'), F: F3}, {c: C('4'), F: F4}, {c: C('5'), F: F5}, {c: C('6'), F: F6, E: F6e, eLabel: ['HOME 起', '升起俯冲 · 尊口']}, {c: C('7'), F: F7, E: F7e, eLabel: ['HOME 起', '推近 · 宅兹中或']},
	{c: C('8'), F: F8}, {c: C('9'), F: F9}, {c: C('10'), F: F10}, {c: C('11'), F: () => <Farm />}, {c: C('12'), F: () => <Farm winter />},
	{c: C('13'), F: F13}, {c: C('14'), F: F14}, {c: C('15'), F: F15}, {c: C('16'), F: F16, E: F16e, eLabel: ['HOME 起', '推近 · 火光之眼']}, {c: C('停'), F: FStop},
	{c: C('17'), F: F17}, {c: C('18'), F: F18}, {c: C('19'), F: F19}, {c: C('20'), F: F20, E: F20e, eLabel: ['HOME 起', '俯冲 · 铭文现身']}, {c: C('21'), F: F21, E: F21e, eLabel: ['HOME 起', '推近 · 中国点亮']},
	{c: C('22'), F: F22}, {c: C('23'), F: F23}, {c: C('24'), F: F24}, {c: C('25'), F: F25}, {c: C('26'), F: F26}, {c: C('27'), F: F27}, {c: C('28'), F: F28}, {c: C('END'), F: FEnd},
];
export const EXTRA = FRAMES.map((f, i) => ({i, ...f})).filter((f) => f.E);
void ([] as (typeof L3 | Mood)[]);
