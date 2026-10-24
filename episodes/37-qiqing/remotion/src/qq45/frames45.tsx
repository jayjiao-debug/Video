import React from 'react';
import {W, H, rnd, lerp, Glow, P, CU, KEY, T, PlateSky, PlateGround, HorseHead, ZHead, StoneBody, WaterArc, ZODIAC, RETURNED, Z, Chair, Tree} from './kit45';
import {Story, Punch, Stamp, Brand, Dial, dialFor, SANS} from './skin45';
import {Rimmed, fkPose, mixPose, Look4, Pose} from '../qq44/kit44';
import {jointAt, grounded, seated, reg} from './pose45';
/* ep45 key frames v2, look "铜版 · 午时" hand-tinted (owner 22:48: more colour; fix chairs and poses).
   Engraved line work over muted colour washes; 你 is still the only glowing thing. Every person is placed from
   its body (pose45.ts) and registered for check45.mjs. */
export type KF = {scene: React.ReactNode; furn: React.ReactNode; label: string};

const ALL = new Set<Z>(ZODIAC), BACK7 = RETURNED, BACK5 = new Set<Z>(['牛', '虎', '猴', '猪', '马']), BACK4 = new Set<Z>(['牛', '虎', '猴', '猪']), NONE = new Set<Z>();
const home12 = dialFor(ALL), back = (s: Set<Z>) => dialFor(s);
export const LK: Record<string, Look4> = {
	auct: {dress: 'shirt', head: 'short'}, bidA: {dress: 'shirt', head: 'glasses'}, bidB: {dress: 'dress', head: 'bob'}, bidC: {dress: 'shirt', head: 'short'},
	soldier: {dress: 'coat', head: 'cylcap'}, soldier2: {dress: 'coat', head: 'cap'},
};
export const FIG = T.fig, RIM = '#E9DFC8';
export const hatchOver = (x: number, y: number, w: number, h: number, id = 'h45d', o = 0.25) => <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} opacity={o} />;

/* ---------- sets ---------- */
/** 海晏堂, west facade (our drawing after the 1780s copperplate views), hand-tinted marble + slate */
export const Haiyantang: React.FC<{cx: number; g: number; k: number; o?: number; dim?: number}> = ({cx, g, k, o = 1, dim = 0}) => {
	const w = 1100 * k, h = 390 * k, x0 = cx - w / 2, top = g - h, bay = 300 * k;
	const win = (x: number, y: number, ww: number, hh: number, key: string) => <path key={key} d={`M${x},${y + hh} L${x},${y + ww / 2} A${ww / 2},${ww / 2} 0 0 1 ${x + ww},${y + ww / 2} L${x + ww},${y + hh} Z`} fill={T.win} stroke={T.ink} strokeWidth={1.4} />;
	return <g opacity={o}>
		<rect x={x0} y={top + 60 * k} width={w} height={h - 60 * k} fill={T.marbleSh} stroke={T.ink} strokeWidth={2} />
		{hatchOver(x0, top + 60 * k, w, h - 60 * k, 'h45d', 0.18)}
		<rect x={cx - bay / 2} y={top} width={bay} height={h} fill={T.marble} stroke={T.ink} strokeWidth={2} />
		<path d={`M${cx - bay / 2 - 10 * k},${top} L${cx},${top - 70 * k} L${cx + bay / 2 + 10 * k},${top} Z`} fill={T.marble} stroke={T.ink} strokeWidth={2} />
		<circle cx={cx} cy={top - 26 * k} r={18 * k} fill={T.slate} stroke={T.ink} strokeWidth={1.5} />
		<rect x={x0 - 10 * k} y={top + 52 * k} width={w + 20 * k} height={12 * k} fill={T.marble} stroke={T.ink} strokeWidth={1} />
		<rect x={x0 - 10 * k} y={top + 200 * k} width={w + 20 * k} height={10 * k} fill={T.marble} stroke={T.ink} strokeWidth={1} />
		{Array.from({length: 14}, (_, i) => { const x = x0 + 30 * k + i * (w - 60 * k) / 13; if (Math.abs(x - cx) < bay / 2 + 10 * k) return null;
			return <path key={i} d={`M${x - 8 * k},${top + 52 * k} C${x - 12 * k},${top + 34 * k} ${x + 12 * k},${top + 34 * k} ${x + 8 * k},${top + 52 * k} Z M${x - 4 * k},${top + 36 * k} C${x - 4 * k},${top + 22 * k} ${x + 4 * k},${top + 22 * k} ${x + 4 * k},${top + 36 * k} Z`} fill={T.marble} stroke={T.ink} strokeWidth={0.8} />; })}
		{Array.from({length: 10}, (_, i) => { const x = x0 + 50 * k + i * (w - 140 * k) / 9; if (Math.abs(x + 20 * k - cx) < bay / 2 + 20 * k) return null;
			return <g key={i}>{win(x, top + 90 * k, 40 * k, 90 * k, `a${i}`)}{win(x, top + 236 * k, 40 * k, 110 * k, `b${i}`)}</g>; })}
		{win(cx - 40 * k, top + 80 * k, 80 * k, 120 * k, 'c1')}{win(cx - 30 * k, top + 240 * k, 60 * k, 150 * k, 'c2')}
		{[-1, 1].map((sg) => <g key={sg}>
			<path d={`M${cx + sg * bay / 2},${top + 210 * k} C${cx + sg * (bay / 2 + 120 * k)},${top + 220 * k} ${cx + sg * (bay / 2 + 200 * k)},${g - 40 * k} ${cx + sg * (bay / 2 + 230 * k)},${g} L${cx + sg * (bay / 2 + 150 * k)},${g} C${cx + sg * (bay / 2 + 130 * k)},${g - 60 * k} ${cx + sg * (bay / 2 + 60 * k)},${top + 236 * k} ${cx + sg * bay / 2},${top + 236 * k} Z`} fill={T.marble} stroke={T.ink} strokeWidth={1.6} />
			{Array.from({length: 10}, (_, i) => { const u = i / 9; return <line key={i} x1={cx + sg * lerp(bay / 2 + 10 * k, bay / 2 + 160 * k, u)} y1={lerp(top + 230 * k, g - 4, u)} x2={cx + sg * lerp(bay / 2 + 30 * k, bay / 2 + 225 * k, u)} y2={lerp(top + 222 * k, g - 4, u)} stroke={T.ink} strokeWidth={1.2} opacity={0.4} />; })}
		</g>)}
		{dim > 0 && <rect x={x0 - 20} y={top - 80 * k} width={w + 40} height={h + 80 * k} fill={T.skyDay[1]} opacity={dim} />}
	</g>;
};
export const ZPos = (cx: number, g: number, k: number) => {
	const out: {z: Z; x: number; y: number; s: number; side: number}[] = [];
	const L: Z[] = ['蛇', '龙', '兔', '虎', '牛', '鼠'], R: Z[] = ['马', '羊', '猴', '鸡', '狗', '猪'];
	[L, R].forEach((row, side) => row.forEach((z, i) => { const u = i / 5, sg = side ? 1 : -1;
		out.push({z, x: cx + sg * lerp(430 * k, 170 * k, u), y: g + lerp(250 * k, 30 * k, u), s: lerp(1.0, 0.62, u) * k, side: sg}); }));
	return out;
};
export const Pool: React.FC<{cx: number; g: number; k: number; present: Set<Z> | 'all'; ghost?: boolean; arcs?: 'none' | 'all' | 'memory' | 'one'; id: string; active?: Z; grow?: number}> = ({cx, g, k, present, arcs = 'none', ghost, id, active, grow = 1}) => {
	const pos = ZPos(cx, g, k), cys = g + 150 * k;
	return <g>
		<path d={`M${cx - 470 * k},${g + 300 * k} L${cx - 200 * k},${g + 10 * k} L${cx + 200 * k},${g + 10 * k} L${cx + 470 * k},${g + 300 * k} Z`} fill={T.marble} stroke={T.ink} strokeWidth={2} />
		<path d={`M${cx - 420 * k},${g + 286 * k} L${cx - 190 * k},${g + 26 * k} L${cx + 190 * k},${g + 26 * k} L${cx + 420 * k},${g + 286 * k} Z`} fill={T.water} stroke={T.ink} strokeWidth={1.2} />
		{Array.from({length: 18}, (_, i) => { const y = g + 40 * k + i * 14 * k, u = (y - g - 26 * k) / (260 * k), hw = lerp(190 * k, 420 * k, u); return <line key={i} x1={cx - hw + 20} y1={y} x2={cx + hw - 20} y2={y} stroke={T.waterL} strokeWidth={2} opacity={0.6} />; })}
		<path d={`M${cx - 80 * k},${cys} C${cx - 70 * k},${cys - 60 * k} ${cx + 70 * k},${cys - 60 * k} ${cx + 80 * k},${cys} Z`} fill={T.marble} stroke={T.ink} strokeWidth={1.5} />
		{Array.from({length: 7}, (_, i) => <line key={i} x1={cx} y1={cys} x2={cx + Math.cos(Math.PI + (i + 1) * Math.PI / 8) * 76 * k} y2={cys + Math.sin(Math.PI + (i + 1) * Math.PI / 8) * 56 * k} stroke={T.ink} strokeWidth={1.2} opacity={0.5} />)}
		{[...pos].sort((a, b) => a.y - b.y).map((p) => { const isYou = p.z === '马', has = present === 'all' || (present as Set<Z>).has(p.z), hy = p.y - 56 * p.s;
			return <g key={p.z}>
				<StoneBody x={p.x} y={p.y} s={p.s} flip={p.side > 0} />
				{isYou ? <HorseHead x={p.x + p.side * 2} y={hy - 4 * p.s} s={0.13 * p.s} id={`${id}y`} glow={0.9} flip={p.side > 0} />
					: has ? <ZHead z={p.z} x={p.x} y={hy} s={0.9 * p.s} mode="bronze" /> : ghost ? <ZHead z={p.z} x={p.x} y={hy} s={0.9 * p.s} mode="ghost" ghostC={T.ink} /> : null}
			</g>; })}
		{arcs !== 'none' && pos.map((p) => { if (arcs === 'one' && p.z !== active) return null; const solid = p.z === '马' || arcs === 'all' || arcs === 'one';
			return <WaterArc key={p.z} x0={p.x - p.side * 30 * p.s} y0={p.y - 60 * p.s} x1={cx + (p.x - cx) * 0.18} y1={cys - 30 * k} h={(60 * k + 40 * p.s) * (arcs === 'one' ? 2.2 * grow : grow)} o={solid ? 0.95 : 0.3} w={(solid ? (arcs === 'one' ? 7 : 5) : 3.5) * k} />; })}
	</g>;
};
/** daylight garden behind the palace: blue sky, trees both sides, paving */
export const Garden: React.FC<{id: string; g: number; sky?: string[]}> = ({id, g, sky = T.skyDay}) => <g>
	<PlateSky id={id} top={sky[0]} bot={sky[1]} lines={0.3} lineC={T.ink} />
	{[[90, 1.2], [260, 0.95], [1660, 1.0], [1840, 1.25]].map(([x, s], i) => <Tree key={i} x={x} g={g} h={420 * s} seed={i + 2} willow={i % 2 === 0} />)}
</g>;

/* ---------- the auction room ---------- */
export const AUCT_X = 1440, AUCT_G = 950, AUCT_H = 540;
export const auctPose = (hammer: 'down' | 'held'): Pose => grounded({lean: hammer === 'down' ? 10 : 4, neck: hammer === 'down' ? 16 : 4, lt: 2, lk: 2, rt: -3, rk: 3, ra: hammer === 'down' ? 40 : 150, re: hammer === 'down' ? 30 : 8, la: 34, le: 64});
/** gavel along the forearm, head across it; returns the head centre */
export const gavelGeom = (pose: Pose) => { const hand = jointAt(pose, 'RHand', AUCT_X, AUCT_G, AUCT_H, true), el = jointAt(pose, 'RElb', AUCT_X, AUCT_G, AUCT_H, true), a = Math.atan2(hand[1] - el[1], hand[0] - el[0]);
	return {hand, a, head: [hand[0] + Math.cos(a) * 70, hand[1] + Math.sin(a) * 70] as [number, number]}; };
export const LECTERN_TOP = Math.round(gavelGeom(auctPose('down')).head[1] + 16);
export const AuctionRoom: React.FC<{hammer: 'down' | 'held'; wall: string; trim?: string; frame: string; screen?: React.ReactNode; plinthX?: number; k?: number}> = ({hammer, wall, trim = T.cream, frame, screen, plinthX = 800, k}) => {
	const pose = k === undefined ? auctPose(hammer) : mixPose(auctPose('held'), auctPose('down'), k), gv = gavelGeom(pose), deg = gv.a * 180 / Math.PI; hammer = k === undefined ? hammer : k > 0.97 ? 'down' : 'held';
	reg({frame, who: 'auctioneer', x: AUCT_X, ground: AUCT_G, h: AUCT_H, pose, flip: true, intent: 'stand'});
	return <g>
		<rect x={0} y={0} width={W} height={H} fill={wall} />
		{Array.from({length: 7}, (_, i) => <g key={i}><rect x={60 + i * 270} y={110} width={220} height={560} fill="none" stroke={trim} strokeWidth={3} opacity={0.75} /><rect x={78 + i * 270} y={128} width={184} height={524} fill="none" stroke={trim} strokeWidth={1.2} opacity={0.5} /></g>)}
		{hatchOver(0, 0, W, 760, 'h45d', 0.12)}
		{screen && <><rect x={1040} y={300} width={340} height={190} fill={T.win} stroke={T.ink} strokeWidth={3} /><text x={1210} y={370} textAnchor="middle" style={{fontFamily: SANS, fontSize: 44, fontWeight: 900, letterSpacing: '0.1em'}} fill={T.cream}>LOT</text>{screen === true ? <text x={1210} y={452} textAnchor="middle" style={{fontFamily: "'DejaVu Sans Mono',monospace", fontSize: 48, fontWeight: 700}} fill={T.cream} opacity={0.8}>— — —</text> : screen}</>}
		<PlateGround y={760} c={T.wood} c2={T.woodD} edge={T.ink} hatch={1.2} />
		<path d={`M${plinthX - 40},0 L${plinthX + 40},0 L${plinthX + 260},880 L${plinthX - 260},880 Z`} fill="#FFF8E8" opacity={0.1} />
		<rect x={plinthX - 170} y={690} width={340} height={210} fill={T.marble} stroke={T.ink} strokeWidth={2} />
		{hatchOver(plinthX - 170, 690, 340, 210, 'h45d', 0.22)}
		<rect x={plinthX - 190} y={676} width={380} height={20} fill={T.cream} stroke={T.ink} strokeWidth={1.5} />
		<Rimmed x={AUCT_X} ground={AUCT_G} h={AUCT_H} pose={pose} look={LK.auct} flip col={FIG} rim={RIM} rimOp={0.45} rimDx={2.4} />
		<g transform={`translate(${gv.hand[0]},${gv.hand[1]}) rotate(${deg})`}><rect x={-4} y={-5} width={74} height={10} rx={3} fill={T.woodD} /><rect x={58} y={-20} width={26} height={40} rx={6} fill={T.wood} stroke={T.ink} strokeWidth={1.5} /></g>
		{/* lectern, top just under the gavel's strike point */}
		<path d={`M1250,${LECTERN_TOP} L1600,${LECTERN_TOP} L1620,${AUCT_G} L1230,${AUCT_G} Z`} fill={T.wood} stroke={T.ink} strokeWidth={2} />
		{hatchOver(1240, LECTERN_TOP, 380, AUCT_G - LECTERN_TOP, 'h45d', 0.3)}
		<rect x={1236} y={LECTERN_TOP - 12} width={380} height={16} fill={T.woodD} />
		<rect x={gv.head[0] - 30} y={LECTERN_TOP - 26} width={60} height={14} rx={3} fill={T.woodD} stroke={T.ink} strokeWidth={1} />
		{hammer === 'down' && [0, 1, 2].map((i) => <path key={i} d={`M${gv.head[0] - 40 - i * 16},${LECTERN_TOP - 40 - i * 18} l${-26 - i * 6},${-22 - i * 6}`} stroke={T.cream} strokeWidth={3} opacity={0.7 - i * 0.18} />)}
	</g>;
};
/** seated bidders on chairs (profile, facing right toward the rostrum); paddles in raised hands */
export const FLOOR = 1010, BH = 430;
export const Bidders: React.FC<{frame: string; up?: number[]; xs?: number[]}> = ({frame, up = [1], xs = [150, 380, 600]}) => <g>
	{xs.map((x, i) => { const raise = up.includes(i), {pose, seat} = seated(raise ? {ra: 128, re: 22, la: 28, le: 46} : {ra: 26, re: 52, la: 30, le: 46});
		const seatY = FLOOR - seat * BH, look = [LK.bidA, LK.bidB, LK.bidC][i % 3], hd = jointAt(pose, 'RHand', x, FLOOR, BH);
		reg({frame, who: `bidder${i}`, x, ground: FLOOR, h: BH, pose, intent: 'sit', seatY});
		return <g key={i}>
			<Chair x={x} seatY={seatY} floor={FLOOR} k={BH / 520} />
			<Rimmed x={x} ground={FLOOR} h={BH} pose={pose} look={look} col={FIG} rim={RIM} rimOp={0.4} />
			{raise && <g transform={`translate(${hd[0]},${hd[1]})`}><rect x={-5} y={-58} width={10} height={66} fill={T.cream} stroke={T.ink} strokeWidth={1} /><ellipse cx={0} cy={-92} rx={40} ry={36} fill={T.cream} stroke={T.ink} strokeWidth={2} /><text x={0} y={-80} textAnchor="middle" style={{fontFamily: "'DejaVu Sans',sans-serif", fontSize: 32, fontWeight: 700}} fill={T.ink}>{[23, 41, 17][i]}</text></g>}
		</g>; })}
</g>;

/* ---------- 1 · C1 hook ---------- */
const F1: KF = {label: '1 C1 假如说',
	scene: <g>
		<PlateSky id="s1" top="#2C4650" bot="#5E7A7C" lines={0.4} lineC={T.cream} />
		{Array.from({length: 9}, (_, i) => <path key={i} d={`M${660 + i * 26},${H} L${660 + i * 26},${420 - i * 4} A${580 - i * 26},${580 - i * 26} 0 0 1 ${1820 - i * 26},${420 - i * 4} L${1820 - i * 26},${H}`} fill="none" stroke={T.cream} strokeWidth={1.4} opacity={0.18 + i * 0.03} />)}
		<rect x={760} y={978} width={1000} height={102} fill={T.marbleSh} stroke={T.ink} strokeWidth={2} />{hatchOver(760, 978, 1000, 102, 'h45d', 0.3)}
		<HorseHead x={1180} y={548} s={1.1} id="h1" glow={1} />
		<path d="M1004,780 C996,796 992,806 992,814 C992,826 1000,832 1008,832 C1016,832 1024,826 1024,814 C1024,806 1016,796 1008,780 Z" fill={T.waterL} opacity={0.95} />
	</g>,
	furn: <><Story rows={[{s: '假如说，你是圆明园的[马首]。'}]} /><Brand /><Stamp y="2026" place="圆明园" l2="正觉寺 · 文殊亭" /></>,
};
/* ---------- 2 · C3 London 1989 ---------- */
const F2: KF = {label: '2 C3 伦敦 1989',
	scene: <g><AuctionRoom hammer="down" wall={T.wallG} frame="F2" plinthX={860} /><HorseHead x={860} y={482} s={0.5} id="h2" glow={0.9} /><Bidders frame="F2" up={[2]} xs={[130, 360, 580]} /></g>,
	furn: <><Story rows={[{s: '在伦敦，被[拍卖]，'}]} /><Brand /><Stamp y="1989" place="伦敦" l2="苏富比拍卖行" /></>,
};
/* ---------- 3 · C7 the twelve niches ---------- */
const F3: KF = {label: '3 C7 五个没回来',
	scene: <g>
		<rect x={0} y={0} width={W} height={H} fill={T.wallB} />{hatchOver(0, 0, W, 460, 'hzInk', 0.25)}
		<rect x={0} y={460} width={W} height={620} fill={T.cream} stroke={T.ink} strokeWidth={2} />{hatchOver(0, 460, W, 620, 'h45d', 0.12)}
		{ZODIAC.map((z, i) => { const x = 165 + i * 145, y = 500, has = RETURNED.has(z), you = z === '马';
			return <g key={z}>
				<path d={`M${x - 58},${y + 330} L${x - 58},${y + 60} A58,58 0 0 1 ${x + 58},${y + 60} L${x + 58},${y + 330} Z`} fill="#33485A" stroke={T.ink} strokeWidth={2} />
				{you ? <><Glow x={x} y={y + 170} r={150} c={CU.halo} o={0.45} id="n3g" /><HorseHead x={x + 4} y={y + 168} s={0.17} id="h3" glow={0.6} /></>
					: has ? <ZHead z={z} x={x} y={y + 170} s={1.05} mode="bronze" /> : <ZHead z={z} x={x} y={y + 170} s={1.05} mode="ghost" ghostC={T.cream} />}
				<text x={x} y={y + 300} textAnchor="middle" style={{fontFamily: SANS, fontSize: 34, fontWeight: 900}} fill={T.cream} opacity={has ? 0.95 : 0.5}>{z}</text>
			</g>; })}
	</g>,
	furn: <><Punch s="可十二个里，还有[五个]没回来。" top={250} /><Brand /><Stamp y="2026.10" place="今天" l2="回国 7 · 未归 5" /><Dial st={back(BACK7)} rows={[{label: '回国', n: 7}]} /></>,
};
/* ---------- 4 · title ---------- */
const F4: KF = {label: '4 片名（第一个drop）',
	scene: <g>
		<PlateSky id="s4" top="#22374A" bot="#4E6A78" lines={0.45} lineC={T.cream} />
		<rect x={360} y={250} width={1200} height={560} fill="none" stroke={T.cream} strokeWidth={3} opacity={0.8} />
		<rect x={376} y={266} width={1168} height={528} fill="none" stroke={T.cream} strokeWidth={1.2} opacity={0.55} />
		{[[360, 250], [1560, 250], [360, 810], [1560, 810]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={12} fill="#22374A" stroke={T.cream} strokeWidth={2.5} />)}
		{Array.from({length: 12}, (_, i) => <WaterArc key={i} x0={420 + i * 98} y0={780} x1={960} y1={700} h={260 + 30 * Math.sin(i)} o={i === 6 ? 0.95 : 0.3} w={i === 6 ? 6 : 3} />)}
		<HorseHead x={1340} y={420} s={0.22} id="h4" glow={0.8} />
		<path d="M440,330 L400,360 L440,390 Z M480,330 L440,360 L480,390 Z" fill={T.cream} opacity={0.85} />
		<text x={500} y={374} style={{fontFamily: "'DejaVu Sans Mono',monospace", fontSize: 30, fontWeight: 700}} fill={T.cream} opacity={0.8}>2026 → 乾隆</text>
	</g>,
	furn: <><div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 118, letterSpacing: '0.08em', lineHeight: 1.25, color: '#F3F6F2', textShadow: '0 0 2px rgba(14,20,24,0.95), 0 4px 10px rgba(14,20,24,0.8), 0 6px 40px rgba(14,20,24,0.6)'}}>
		<div>马首回家，</div><div>用了<span style={{color: KEY}}>160</span>年</div></div><Brand /></>,
};
/* ---------- 5 · A3 the fountain ---------- */
const F5: KF = {label: '5 A3 海晏堂水力钟',
	scene: <g><Garden id="s5" g={560} /><Haiyantang cx={960} g={560} k={0.85} /><PlateGround y={560} c={T.pave} c2={T.pave2} edge={T.ink} /><Pool cx={960} g={560} k={1.25} present="all" id="p5" /></g>,
	furn: <><Story rows={[{s: '你和十一个兄弟，坐在[水池两边]。'}]} /><Brand /><Stamp y="乾隆年间" place="海晏堂" l2="圆明园 · 西洋楼" /><Dial st={home12} rows={[{label: '在家', n: 12}]} /></>,
};
/* ---------- 6 · A7 noon ---------- */
const F6: KF = {label: '6 A7 正午一起喷水',
	scene: <g><PlateSky id="s6" top={T.skyDay[0]} bot="#EEF2EA" lines={0.25} lineC={T.ink} />
		<g transform="translate(-480,-330) scale(1.5)"><Haiyantang cx={960} g={600} k={0.95} /><PlateGround y={600} c={T.pave} c2={T.pave2} edge={T.ink} /><Pool cx={960} g={600} k={1.0} present="all" arcs="all" id="p6" /></g></g>,
	furn: <><Story rows={[{s: '你是[午时]。'}, {s: '正午十二点，十二个[一起喷水]。'}]} /><Brand /><Stamp y="12:00" place="午时" l2="11:00–13:00 是你" /><Dial st={home12} rows={[{label: '在家', n: 12}]} /></>,
};
/* ---------- 7 · B2 1860 ---------- */
const carry = (kind: 'crate' | 'vase', phase: number) => grounded({lean: 6, neck: 4, lt: phase ? 22 : -16, lk: phase ? 6 : 30, rt: phase ? -16 : 22, rk: phase ? 30 : 6,
	la: kind === 'crate' ? 32 : 22, le: kind === 'crate' ? 62 : 66, ra: kind === 'crate' ? 38 : 26, re: kind === 'crate' ? 56 : 62});
export const Soldier: React.FC<{x: number; kind: 'crate' | 'vase'; phase: number; look: Look4; i: number}> = ({x, kind, phase, look, i}) => {
	const g = 975, h = 540, p = carry(kind, phase), l = jointAt(p, 'LHand', x, g, h), r = jointAt(p, 'RHand', x, g, h), hx = (l[0] + r[0]) / 2, hy = (l[1] + r[1]) / 2;
	reg({frame: 'F7', who: `soldier${i}`, x, ground: g, h, pose: p, intent: 'walk'});
	return <g>
		<Rimmed x={x} ground={g} h={h} pose={p} look={look} col={FIG} rim={RIM} rimOp={0.4} />
		{kind === 'crate' ? <g><rect x={hx - 40} y={hy - 92} width={124} height={92} fill={T.wood} stroke={T.ink} strokeWidth={2} />{hatchOver(hx - 40, hy - 92, 124, 92, 'h45d', 0.3)}<rect x={hx - 40} y={hy - 52} width={124} height={8} fill={T.woodD} /></g>
			: <g><path d={`M${hx + 6},${hy - 120} L${hx + 36},${hy - 120} C${hx + 30},${hy - 100} ${hx + 80},${hy - 70} ${hx + 70},${hy - 10} C${hx + 62},${hy + 30} ${hx + 40},${hy + 44} ${hx + 21},${hy + 44} C${hx + 2},${hy + 44} ${hx - 20},${hy + 30} ${hx - 28},${hy - 10} C${hx - 38},${hy - 70} ${hx + 12},${hy - 100} ${hx + 6},${hy - 120} Z`} fill="#DCE6EE" stroke={T.ink} strokeWidth={2} /><path d={`M${hx - 18},${hy - 40} C${hx + 10},${hy - 20} ${hx + 40},${hy - 50} ${hx + 64},${hy - 30}`} stroke="#3E5E8A" strokeWidth={5} fill="none" /></g>}
	</g>;
};
const F7: KF = {label: '7 B2 1860',
	scene: <g>
		<PlateSky id="s7" top={T.skySmoke[0]} bot={T.skySmoke[1]} lines={0.3} lineC={T.ink} />
		{[300, 760, 1240, 1660].map((x, i) => <g key={i}>{Array.from({length: 7}, (_, j) => <ellipse key={j} cx={x + Math.sin(j * 1.3 + i) * 60 + j * 22} cy={620 - j * 90} rx={110 + j * 22} ry={70 + j * 10} fill={j < 2 ? '#6A5B4E' : '#8E8172'} opacity={0.7 - j * 0.06} stroke={T.ink} strokeWidth={1} strokeOpacity={0.4} />)}</g>)}
		<Haiyantang cx={960} g={660} k={0.7} o={0.92} />
		<PlateGround y={660} c={T.pave} c2={T.pave2} edge={T.ink} />
		<Soldier x={600} kind="crate" phase={1} look={LK.soldier} i={0} /><Soldier x={940} kind="vase" phase={0} look={LK.soldier2} i={1} /><Soldier x={1300} kind="crate" phase={0} look={LK.soldier} i={2} />
		<StoneBody x={170} y={880} s={1.9} />
		<HorseHead x={176} y={720} s={0.3} id="h7" glow={1.1} flicker={1} flip />
	</g>,
	furn: <><Story rows={[{s: '1860年，英法联军[进了园子]。', o: 0.65}, {s: '能搬走的都被搬走，然后[一把火]。'}]} /><Brand /><Stamp y="1860.10" place="圆明园" l2="10月18日 放火" /><Dial st={home12} rows={[{label: '在家', n: 12}]} /></>,
};
/* ---------- 8 · D7 Hong Kong 2007 ---------- */
const F8: KF = {label: '8 D7 锤子没落下',
	scene: <g><AuctionRoom hammer="held" wall={T.wallB} trim={T.wallBL} frame="F8" screen plinthX={800} /><HorseHead x={800} y={482} s={0.5} id="h8" glow={1} /><Bidders frame="F8" up={[0, 1]} xs={[110, 320, 520]} /></g>,
	furn: <><Story rows={[{s: '2007年，你又要[上拍]了。', o: 0.65}, {s: '这一次，锤子[没有落下]。'}]} /><Brand /><Stamp y="2007" place="香港苏富比" l2="国家文物局：" l3="主张终止公开拍卖" /><Dial st={back(BACK4)} rows={[{label: '回国', n: 4}]} /></>,
};
/* ---------- 9 · D13 Paris 2009 ---------- */
const F9: KF = {label: '9 D13 拒绝付款',
	scene: <g>
		<AuctionRoom hammer="down" wall={T.wallW} frame="F9" plinthX={800} />
		<ZHead z="鼠" x={720} y={600} s={1.6} mode="bronze" /><ZHead z="兔" x={890} y={590} s={1.6} mode="bronze" />
		<g transform="translate(560,724) rotate(-3)"><rect x={0} y={0} width={560} height={150} fill={T.cream} stroke={T.ink} strokeWidth={2} />
			<text x={24} y={52} style={{fontFamily: SANS, fontSize: 34, fontWeight: 900}} fill={T.ink}>鼠首 · 兔首</text>
			<text x={24} y={108} style={{fontFamily: "'DejaVu Sans',sans-serif", fontSize: 40, fontWeight: 700}} fill={T.ink}>€31,490,000</text>
			<g transform="translate(440,76) rotate(-12)"><rect x={-110} y={-40} width={220} height={80} rx={8} fill="none" stroke="#2E6F8A" strokeWidth={6} /><text x={0} y={18} textAnchor="middle" style={{fontFamily: SANS, fontSize: 48, fontWeight: 900, letterSpacing: '0.1em'}} fill="#2E6F8A">未付款</text></g></g>
		<Bidders frame="F9" up={[0]} xs={[110, 330]} />
	</g>,
	furn: <><Story rows={[{s: '锤子落下：两件[3149万欧元]。', o: 0.65}, {s: '买家却[拒绝付款]。'}]} /><Brand /><Stamp y="2009" place="巴黎" l2="佳士得" /><Dial st={back(BACK5)} rows={[{label: '回国', n: 5}]} /></>,
};
/* ---------- 10 · E4 ---------- */
const F10: KF = {label: '10 E4 他没等到',
	scene: <g>
		<rect x={0} y={0} width={W} height={H} fill="#46605A" />{hatchOver(0, 0, W, 820, 'h45d', 0.15)}
		<rect x={1180} y={180} width={460} height={560} fill={T.skyNight[0]} stroke={T.cream} strokeWidth={4} />
		<rect x={1180} y={180} width={460} height={560} fill="url(#hz)" opacity={0.35} />
		<line x1={1410} y1={180} x2={1410} y2={740} stroke={T.cream} strokeWidth={4} /><line x1={1180} y1={460} x2={1640} y2={460} stroke={T.cream} strokeWidth={4} />
		<Glow x={1520} y={600} r={50} c={CU.halo} o={0.6} id="g10" /><circle cx={1520} cy={600} r={5} fill={CU.core} />
		<PlateGround y={820} c={T.wood} c2={T.woodD} edge={T.ink} />
		<path d="M640,820 L640,560 C640,500 700,470 760,470 L940,470 C1000,470 1060,500 1060,560 L1060,820 Z" fill="#6E8C7C" stroke={T.ink} strokeWidth={2} />{hatchOver(640, 470, 420, 350, 'h45d', 0.3)}
		<rect x={600} y={640} width={110} height={190} rx={30} fill="#7E9C8A" stroke={T.ink} strokeWidth={2} /><rect x={990} y={640} width={110} height={190} rx={30} fill="#7E9C8A" stroke={T.ink} strokeWidth={2} />
		<rect x={690} y={680} width={320} height={80} rx={18} fill="#8CAA96" stroke={T.ink} strokeWidth={2} />
		<rect x={610} y={826} width={20} height={20} fill={T.woodD} /><rect x={1070} y={826} width={20} height={20} fill={T.woodD} />
		<rect x={340} y={600} width={200} height={14} fill={T.wood} stroke={T.ink} strokeWidth={1.5} /><rect x={360} y={614} width={14} height={206} fill={T.wood} /><rect x={506} y={614} width={14} height={206} fill={T.wood} />
		<path d="M380,520 L500,520 L470,450 L410,450 Z" fill={T.cream} stroke={T.ink} strokeWidth={2} /><rect x={437} y={520} width={6} height={80} fill={T.woodD} /><rect x={410} y={594} width={60} height={8} fill={T.woodD} />
	</g>,
	furn: <><Punch s="他没等到，[你回家]那天。" top={300} /><Brand /><Stamp y="2020.5" place="香港" l2="何鸿燊去世，98岁" /><Dial st={back(BACK7)} rows={[{label: '回国', n: 7}]} /></>,
};
/* ---------- 11 · H4 ---------- */
const F11: KF = {label: '11 H4 回家只有你',
	scene: <g>
		<PlateSky id="s11" top={T.skyDay[0]} bot={T.skyDay[1]} lines={0.3} lineC={T.ink} />
		<g>{[[1330, 380, 170, 250, '保利艺术博物馆', 4], [1580, 420, 220, 210, '国家博物馆', 2]].map(([x, y, w, h, name, n], i) => <g key={i}>
			<rect x={x as number} y={y as number} width={w as number} height={h as number} fill={T.marbleSh} stroke={T.ink} strokeWidth={2} />{hatchOver(x as number, y as number, w as number, h as number, 'h45d', 0.25)}
			{Array.from({length: n as number}, (_, j) => <circle key={j} cx={(x as number) + 30 + j * 36} cy={(y as number) + 60} r={10} fill={T.bronzeL} stroke={T.ink} strokeWidth={2} />)}
			<text x={(x as number) + (w as number) / 2} y={(y as number) + (h as number) + 40} textAnchor="middle" style={{fontFamily: SANS, fontSize: 28, fontWeight: 700}} fill={T.ink}>{name as string}</text></g>)}</g>
		<PlateGround y={700} c={T.grass} c2="#6F8A63" edge={T.ink} hatch={0.6} />
		<Tree x={110} g={700} h={420} seed={3} /><Tree x={1820} g={700} h={380} seed={5} willow />
		{[220, 330, 410].map((x, i) => <g key={i}><rect x={x} y={560 - i * 30} width={50} height={140 + i * 30} fill={T.stone} stroke={T.ink} strokeWidth={1.5} />{hatchOver(x, 560 - i * 30, 50, 140 + i * 30, 'h45d', 0.3)}</g>)}
		<path d="M520,700 L560,640 L640,660 L700,610 L760,700 Z" fill={T.stone} stroke={T.ink} strokeWidth={1.5} />
		<path d="M780,440 L960,330 L1140,440 Z" fill="#4F6B62" stroke={T.ink} strokeWidth={2.5} />{hatchOver(780, 330, 360, 110, 'h45d', 0.2)}
		<path d="M800,440 L1120,440 L1100,470 L820,470 Z" fill="#8A5A3C" stroke={T.ink} strokeWidth={2} />
		{[830, 1090].map((x) => <rect key={x} x={x - 12} y={470} width={24} height={230} fill="#8A5A3C" stroke={T.ink} strokeWidth={2} />)}
		<rect x={860} y={600} width={200} height={100} fill={T.marble} stroke={T.ink} strokeWidth={2} />
		<HorseHead x={960} y={550} s={0.16} id="h11" glow={1} />
		{Array.from({length: 6}, (_, i) => <circle key={i} cx={1130 + i * 30} cy={560 - i * 22} r={8} fill={T.bronzeL} opacity={0.75 - i * 0.06} stroke={T.ink} strokeWidth={1} />)}
	</g>,
	furn: <><Story rows={[{s: '十二个里，回到中国的有[七个]。', o: 0.65}, {s: '如今回到圆明园的，[只有你]。'}]} /><Brand /><Stamp y="2020.12.1" place="圆明园" l2="正觉寺 · 文殊亭" /><Dial st={back(BACK7)} rows={[{label: '回国', n: 7, dim: true}, {label: '回家', n: 1, home: true}]} /></>,
};
/* ---------- 12 · K2 ---------- */
const F12: KF = {label: '12 K2 还差十一个',
	scene: <g><PlateSky id="s12" top="#8DA2AE" bot="#E6E2D6" lines={0.25} lineC={T.ink} />
		<g transform="translate(-480,-330) scale(1.5)"><Haiyantang cx={960} g={600} k={0.95} dim={0.45} /><PlateGround y={600} c={T.pave} c2={T.pave2} edge={T.ink} /><Pool cx={960} g={600} k={1.0} present={NONE} ghost arcs="memory" id="p12" /></g></g>,
	furn: <><Punch s="还差[十一个]。" top={330} /><Brand /><Stamp y="今天" place="正午" /><Dial st={dialFor(NONE)} rows={[{label: '回家', n: 1, home: true}]} /></>,
};

export const FRAMES45: KF[] = [F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12];
void rnd; void H; void P; void fkPose;
