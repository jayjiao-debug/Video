import React from 'react';
import {W, H, rnd, lerp, Glow, P, CU, KEY, PlateSky, PlateGround, HorseHead, ZHead, StoneBody, WaterArc, ZODIAC, RETURNED, Z} from './kit45';
import {Story, Punch, Stamp, Brand, Dial, dialFor, Marked, SANS} from './skin45';
import {Rimmed, fkPose, gaitPose, jointAt, Look4, Pose} from '../qq44/kit44';
/* ep45 key frames, look "铜版 · 午时". Each frame = an SVG scene + the skin. Frame order follows the film. */
export type KF = {scene: React.ReactNode; furn: React.ReactNode; label: string};

const ALL = new Set<Z>(ZODIAC), BACK7 = RETURNED, BACK5 = new Set<Z>(['牛', '虎', '猴', '猪', '马']), NONE = new Set<Z>();
const home12 = dialFor(ALL), back = (s: Set<Z>) => dialFor(s);
const STAND = {hip: 0.655, lean: 3, neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14};
const LK: Record<string, Look4> = {
	auct: {dress: 'jacket', head: 'short'}, bidA: {dress: 'jacket', head: 'glasses'}, bidB: {dress: 'dress', head: 'bob'}, bidC: {dress: 'jacket', head: 'short'},
	soldier: {dress: 'coat', head: 'cylcap'}, soldier2: {dress: 'coat', head: 'cap'},
};
const INKF = P.ink;

/* ---------- sets ---------- */
/** 海晏堂, west facade, as an engraved view (after the 1780s copperplate series; our own drawing). cx = centre, g = ground line, k = scale */
const Haiyantang: React.FC<{cx: number; g: number; k: number; o?: number}> = ({cx, g, k, o = 1}) => {
	const w = 1100 * k, h = 390 * k, x0 = cx - w / 2, top = g - h, bay = 300 * k;
	const win = (x: number, y: number, ww: number, hh: number, key: string) => <g key={key}><path d={`M${x},${y + hh} L${x},${y + ww / 2} A${ww / 2},${ww / 2} 0 0 1 ${x + ww},${y + ww / 2} L${x + ww},${y + hh} Z`} fill={P.deep} stroke={P.line} strokeWidth={1.4} /><rect x={x} y={y} width={ww} height={hh} fill="url(#hzInk)" opacity={0.6} /></g>;
	return <g opacity={o}>
		{/* wings */}
		<rect x={x0} y={top + 60 * k} width={w} height={h - 60 * k} fill={P.soft} stroke={P.line} strokeWidth={2} />
		<rect x={x0} y={top + 60 * k} width={w} height={h - 60 * k} fill="url(#h45)" opacity={0.35} />
		{/* central bay, raised */}
		<rect x={cx - bay / 2} y={top} width={bay} height={h} fill={P.pale} opacity={0.9} stroke={P.line} strokeWidth={2} />
		<rect x={cx - bay / 2} y={top} width={bay} height={h} fill="url(#hzInk)" opacity={0.18} />
		<path d={`M${cx - bay / 2 - 10 * k},${top} L${cx},${top - 70 * k} L${cx + bay / 2 + 10 * k},${top} Z`} fill={P.pale} stroke={P.line} strokeWidth={2} />
		<circle cx={cx} cy={top - 26 * k} r={18 * k} fill="none" stroke={P.ink} strokeWidth={2} opacity={0.6} />
		{/* cornices */}
		<rect x={x0 - 10 * k} y={top + 52 * k} width={w + 20 * k} height={12 * k} fill={P.pale} />
		<rect x={x0 - 10 * k} y={top + 200 * k} width={w + 20 * k} height={10 * k} fill={P.pale} opacity={0.85} />
		{/* balustrade urns on the roof line */}
		{Array.from({length: 14}, (_, i) => { const x = x0 + 30 * k + i * (w - 60 * k) / 13; if (Math.abs(x - cx) < bay / 2 + 10 * k) return null;
			return <path key={i} d={`M${x - 8 * k},${top + 52 * k} C${x - 12 * k},${top + 34 * k} ${x + 12 * k},${top + 34 * k} ${x + 8 * k},${top + 52 * k} Z M${x - 4 * k},${top + 36 * k} C${x - 4 * k},${top + 22 * k} ${x + 4 * k},${top + 22 * k} ${x + 4 * k},${top + 36 * k} Z`} fill={P.pale} opacity={0.9} />; })}
		{/* windows: two storeys */}
		{Array.from({length: 10}, (_, i) => { const x = x0 + 50 * k + i * (w - 140 * k) / 9; if (Math.abs(x + 20 * k - cx) < bay / 2 + 20 * k) return null;
			return <g key={i}>{win(x, top + 90 * k, 40 * k, 90 * k, `a${i}`)}{win(x, top + 236 * k, 40 * k, 110 * k, `b${i}`)}</g>; })}
		{win(cx - 40 * k, top + 80 * k, 80 * k, 120 * k, 'c1')}{win(cx - 30 * k, top + 240 * k, 60 * k, 150 * k, 'c2')}
		{/* the double stair, curving down to both sides */}
		{[-1, 1].map((sg) => <g key={sg}>
			<path d={`M${cx + sg * bay / 2},${top + 210 * k} C${cx + sg * (bay / 2 + 120 * k)},${top + 220 * k} ${cx + sg * (bay / 2 + 200 * k)},${g - 40 * k} ${cx + sg * (bay / 2 + 230 * k)},${g} L${cx + sg * (bay / 2 + 150 * k)},${g} C${cx + sg * (bay / 2 + 130 * k)},${g - 60 * k} ${cx + sg * (bay / 2 + 60 * k)},${top + 236 * k} ${cx + sg * bay / 2},${top + 236 * k} Z`} fill={P.pale} stroke={P.line} strokeWidth={1.6} />
			{Array.from({length: 10}, (_, i) => { const u = i / 9; return <line key={i} x1={cx + sg * lerp(bay / 2 + 10 * k, bay / 2 + 160 * k, u)} y1={lerp(top + 230 * k, g - 4, u)} x2={cx + sg * lerp(bay / 2 + 30 * k, bay / 2 + 225 * k, u)} y2={lerp(top + 222 * k, g - 4, u)} stroke={P.ink} strokeWidth={1.2} opacity={0.35} />; })}
		</g>)}
	</g>;
};
/** the zodiac pool: two rows of six seated figures in a 八 shape, horse front-right. heads: 'all' | Set of present heads */
const ZPos = (cx: number, g: number, k: number) => {
	const out: {z: Z; x: number; y: number; s: number; side: number}[] = [];
	const L: Z[] = ['巳', '辰', '卯', '寅', '丑', '子'].map((c) => ({子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龙', 巳: '蛇'} as Record<string, Z>)[c]);
	const R: Z[] = ['马', '羊', '猴', '鸡', '狗', '猪'];
	[L, R].forEach((row, side) => row.forEach((z, i) => { const u = i / 5, sg = side ? 1 : -1;
		out.push({z, x: cx + sg * lerp(430 * k, 170 * k, u), y: g + lerp(250 * k, 30 * k, u), s: lerp(1.0, 0.62, u) * k, side: sg}); }));
	return out;
};
const Pool: React.FC<{cx: number; g: number; k: number; present: Set<Z> | 'all'; ghost?: boolean; arcs?: 'none' | 'one' | 'all' | 'memory'; youHead?: boolean}> = ({cx, g, k, present, arcs = 'none', youHead = true, ghost}) => {
	const pos = ZPos(cx, g, k), cxs = cx, cys = g + 150 * k;
	return <g>
		{/* basin */}
		<path d={`M${cx - 470 * k},${g + 300 * k} L${cx - 200 * k},${g + 10 * k} L${cx + 200 * k},${g + 10 * k} L${cx + 470 * k},${g + 300 * k} Z`} fill={P.mid} stroke={P.line} strokeWidth={2} />
		<path d={`M${cx - 420 * k},${g + 286 * k} L${cx - 190 * k},${g + 26 * k} L${cx + 190 * k},${g + 26 * k} L${cx + 420 * k},${g + 286 * k} Z`} fill={P.plate} />
		<path d={`M${cx - 420 * k},${g + 286 * k} L${cx - 190 * k},${g + 26 * k} L${cx + 190 * k},${g + 26 * k} L${cx + 420 * k},${g + 286 * k} Z`} fill="url(#hzW)" opacity={0.5} />
		{/* the shell basin in the middle */}
		<path d={`M${cxs - 80 * k},${cys} C${cxs - 70 * k},${cys - 60 * k} ${cxs + 70 * k},${cys - 60 * k} ${cxs + 80 * k},${cys} Z`} fill={P.pale} stroke={P.line} strokeWidth={1.5} />
		{Array.from({length: 7}, (_, i) => <line key={i} x1={cxs} y1={cys} x2={cxs + Math.cos(Math.PI + (i + 1) * Math.PI / 8) * 76 * k} y2={cys + Math.sin(Math.PI + (i + 1) * Math.PI / 8) * 56 * k} stroke={P.ink} strokeWidth={1.2} opacity={0.5} />)}
		{/* figures, back to front */}
		{[...pos].sort((a, b) => a.y - b.y).map((p) => { const isYou = p.z === '马', has = present === 'all' || (present as Set<Z>).has(p.z), hy = p.y - 56 * p.s;
			return <g key={p.z}>
				<StoneBody x={p.x} y={p.y} s={p.s} flip={p.side > 0} />
				{isYou ? (youHead ? <HorseHead x={p.x + p.side * 2} y={hy - 4 * p.s} s={0.13 * p.s} id={`hp${Math.round(p.x)}`} glow={0.9} flip={p.side < 0 ? false : true} /> : null)
					: has ? <ZHead z={p.z} x={p.x} y={hy} s={0.9 * p.s} mode="cool" c={P.ink2} /> : ghost ? <ZHead z={p.z} x={p.x} y={hy} s={0.9 * p.s} mode="ghost" /> : null}
			</g>; })}
		{/* water */}
		{arcs !== 'none' && pos.map((p) => { const show = arcs === 'all' || arcs === 'memory' || p.z === '马'; if (!show) return null;
			const solid = p.z === '马' || arcs === 'all';
			return <WaterArc key={p.z} x0={p.x - p.side * 30 * p.s} y0={p.y - 60 * p.s} x1={cxs + (p.x - cxs) * 0.18} y1={cys - 30 * k} h={60 * k + 40 * p.s} o={solid ? 0.95 : 0.28} w={(solid ? 5 : 3.5) * k} />; })}
	</g>;
};
/** an auction room (engraved): panelled wall, a lectern on the right, a plinth with a spotlight on the left */
const AuctionRoom: React.FC<{hammer: 'down' | 'up' | 'held'; era?: 'old' | 'new'; plinthX?: number}> = ({hammer, era = 'old', plinthX = 820}) => {
	const pose: Pose = fkPose({...STAND, lean: hammer === 'down' ? 16 : 4, neck: hammer === 'down' ? 18 : 6, ra: hammer === 'down' ? 70 : 158, re: hammer === 'down' ? 40 : -24, la: 30, le: 70});
	const hx = 1430, hg = 960, hh = 640, hand = jointAt(pose, 'RHand', hx, hg, hh, true), elb = jointAt(pose, 'RElb', hx, hg, hh, true);
	const ang = Math.atan2(hand[1] - elb[1], hand[0] - elb[0]) * 180 / Math.PI;
	return <g>
		<PlateSky id={`ar${hammer}${era}`} top={P.plate} bot={P.mid} lines={0.35} />
		{/* wall panels */}
		{Array.from({length: 7}, (_, i) => <g key={i}><rect x={60 + i * 270} y={120} width={220} height={560} fill="none" stroke={P.line} strokeWidth={1.5} opacity={0.45} /><rect x={80 + i * 270} y={140} width={180} height={520} fill="url(#h45)" opacity={0.18} /></g>)}
		{era === 'new' && <><rect x={1090} y={300} width={300} height={190} fill={P.deep} stroke={P.line} strokeWidth={2} /><text x={1240} y={380} textAnchor="middle" style={{fontFamily: SANS, fontSize: 50, fontWeight: 900, letterSpacing: '0.1em'}} fill={P.line}>LOT</text><text x={1240} y={450} textAnchor="middle" style={{fontFamily: "'DejaVu Sans Mono',monospace", fontSize: 48, fontWeight: 700}} fill={P.pale} opacity={0.85}>— — —</text></>}
		<PlateGround y={760} />
		{/* spotlight on the plinth */}
		<path d={`M${plinthX - 40},0 L${plinthX + 40},0 L${plinthX + 260},860 L${plinthX - 260},860 Z`} fill={P.pale} opacity={0.08} />
		<rect x={plinthX - 170} y={700} width={340} height={200} fill={P.soft} stroke={P.line} strokeWidth={2} />
		<rect x={plinthX - 170} y={700} width={340} height={200} fill="url(#h45d)" opacity={0.45} />
		<rect x={plinthX - 190} y={684} width={380} height={22} fill={P.pale} opacity={0.9} />
		{/* the lectern + auctioneer (profile, facing left) */}
		<Rimmed x={hx} ground={hg} h={hh} pose={pose} look={LK.auct} flip col={INKF} rim={P.line} rimOp={0.5} rimDx={2.4} />
		<g transform={`translate(${hand[0]},${hand[1]}) rotate(${ang + 90})`}><rect x={-6} y={-70} width={12} height={78} fill="#2a1f19" /><rect x={-26} y={-96} width={52} height={30} rx={6} fill="#3a2a20" stroke={P.line} strokeWidth={1.2} /></g>
		<path d="M1250,700 L1580,700 L1600,960 L1230,960 Z" fill={P.deep} stroke={P.line} strokeWidth={2} />
		<path d="M1250,700 L1580,700 L1600,960 L1230,960 Z" fill="url(#h45)" opacity={0.35} />
		<rect x={1236} y={690} width={360} height={18} fill={P.soft} />
		{hammer === 'down' && <><rect x={1180} y={672} width={60} height={20} fill="#3a2a20" />{[0, 1, 2].map((i) => <path key={i} d={`M${1170 - i * 14},${650 - i * 20} L${1140 - i * 30},${620 - i * 36}`} stroke={P.pale} strokeWidth={3} opacity={0.6 - i * 0.15} />)}</>}
		{hammer === 'held' && <>{[0, 1, 2].map((i) => <path key={i} d={`M${hand[0] - 30 - i * 26},${hand[1] - 120 - i * 6} q 8,-10 16,0`} stroke={P.pale} strokeWidth={3} fill="none" opacity={0.55} />)}</>}
	</g>;
};
/** seated bidders in profile (facing right), one paddle up */
const Bidders: React.FC<{up?: number[]; xs?: number[]}> = ({up = [1], xs = [170, 400, 620]}) => <g>
	{[{x: xs[0], l: LK.bidA}, {x: xs[1], l: LK.bidB}, {x: xs[2], l: LK.bidC}].filter((b) => b.x !== undefined).map((b, i) => { const raise = up.includes(i);
		const pose = fkPose({hip: 0.37, lean: 6, neck: 6, lt: 86, lk: 90, rt: 84, rk: 86, la: 10, le: 50, ra: raise ? 170 : 30, re: raise ? -10 : 60});
		const hd = jointAt(pose, 'RHand', b.x, 1080, 520);
		return <g key={i}>
			<rect x={b.x - 90} y={1080 - 520 * 0.37 + 4} width={150} height={20} fill={P.deep} /><rect x={b.x - 90} y={1080 - 520 * 0.37 - 150} width={20} height={170} fill={P.deep} />
			<Rimmed x={b.x} ground={1080} h={520} pose={pose} look={b.l} col={INKF} rim={P.line} rimOp={0.45} />
			{raise && <g transform={`translate(${hd[0]},${hd[1]})`}><rect x={-6} y={-60} width={10} height={64} fill={P.pale} /><ellipse cx={-1} cy={-96} rx={44} ry={40} fill={P.pale} stroke={P.ink} strokeWidth={2} /><text x={-1} y={-84} textAnchor="middle" style={{fontFamily: "'DejaVu Sans',sans-serif", fontSize: 34, fontWeight: 700}} fill={P.ink}>{[23, 41, 17][i]}</text></g>}
		</g>; })}
</g>;

/* ---------- 1 · C1 hook ---------- */
const F1: KF = {label: 'C1 0:00 · 假如说',
	scene: <g>
		<PlateSky id="s1" top={P.plate} bot={P.mid} lines={0.55} />
		{Array.from({length: 9}, (_, i) => <path key={i} d={`M${660 + i * 26},${H} L${660 + i * 26},${420 - i * 4} A${580 - i * 26},${580 - i * 26} 0 0 1 ${1820 - i * 26},${420 - i * 4} L${1820 - i * 26},${H}`} fill="none" stroke={P.line} strokeWidth={1.4} opacity={0.22 + i * 0.03} />)}
		<HorseHead x={1180} y={560} s={1.1} id="h1" glow={1} />
		<path d="M1004,790 C996,806 992,816 992,824 C992,836 1000,842 1008,842 C1016,842 1024,836 1024,824 C1024,816 1016,806 1008,790 Z" fill={P.water} opacity={0.95} />
		<circle cx={1002} cy={826} r={3.5} fill="#fff" opacity={0.9} />
	</g>,
	furn: <><Story rows={[{s: '假如说，你是圆明园的[马首]。'}]} /><Brand /><Stamp y="2026" place="圆明园" l2="正觉寺 · 文殊亭" /></>,
};
/* ---------- 2 · C3 London 1989: the hammer comes down ---------- */
const F2: KF = {label: 'C3 0:05 · 伦敦拍卖',
	scene: <g>
		<AuctionRoom hammer="down" plinthX={840} />
		<HorseHead x={840} y={492} s={0.5} id="h2" glow={0.9} />
		<Bidders up={[2]} />
	</g>,
	furn: <><Story rows={[{s: '在伦敦，被[拍卖]，'}]} /><Brand /><Stamp y="1989" place="伦敦" l2="苏富比拍卖行" /></>,
};
/* ---------- 3 · C7 the twelve niches: seven back, five missing ---------- */
const F3: KF = {label: 'C7 0:15 · 五个没回来',
	scene: <g>
		<PlateSky id="s3" top={P.deep} bot={P.plate} lines={0.45} />
		<rect x={0} y={830} width={W} height={250} fill={P.plate} /><rect x={0} y={830} width={W} height={250} fill="url(#hzInk)" opacity={0.35} />
		{ZODIAC.map((z, i) => { const x = 165 + i * 145, y = 500, has = RETURNED.has(z), you = z === '马';
			return <g key={z}>
				<path d={`M${x - 58},${y + 330} L${x - 58},${y + 60} A58,58 0 0 1 ${x + 58},${y + 60} L${x + 58},${y + 330} Z`} fill={P.deep} stroke={P.line} strokeWidth={2} />
				{you ? <><Glow x={x} y={y + 170} r={150} c={CU.halo} o={0.45} id="n3g" /><HorseHead x={x + 4} y={y + 168} s={0.17} id="h3" glow={0.6} /></>
					: has ? <ZHead z={z} x={x} y={y + 170} s={1.05} mode="cool" c={P.soft} /> : <ZHead z={z} x={x} y={y + 170} s={1.05} mode="ghost" />}
				<text x={x} y={y + 300} textAnchor="middle" style={{fontFamily: SANS, fontSize: 34, fontWeight: 900}} fill={has ? P.pale : P.soft} opacity={has ? 0.9 : 0.6}>{z}</text>
			</g>; })}
	</g>,
	furn: <><Punch s="可十二个里，还有[五个]没回来。" top={300} /><Brand /><Stamp y="2026.10" place="今天" l2="回国 7 · 未归 5" /><Dial st={back(BACK7)} rows={[{label: '回国', n: 7}]} /></>,
};
/* ---------- 4 · title on the drop ---------- */
const F4: KF = {label: 'T 0:18 · 片名',
	scene: <g>
		<PlateSky id="s4" top={P.plate} bot={P.mid} lines={0.6} />
		{/* the plate's title cartouche */}
		<rect x={360} y={250} width={1200} height={560} fill="none" stroke={P.line} strokeWidth={3} opacity={0.8} />
		<rect x={376} y={266} width={1168} height={528} fill="none" stroke={P.line} strokeWidth={1.2} opacity={0.6} />
		{[[360, 250], [1560, 250], [360, 810], [1560, 810]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={12} fill={P.plate} stroke={P.line} strokeWidth={2.5} />)}
		{/* twelve arcs rising behind the letters, only one solid */}
		{Array.from({length: 12}, (_, i) => { const x0 = 420 + i * 98; return <WaterArc key={i} x0={x0} y0={780} x1={960} y1={700} h={260 + 30 * Math.sin(i)} o={i === 6 ? 0.95 : 0.22} w={i === 6 ? 6 : 3} />; })}
		<HorseHead x={1340} y={420} s={0.22} id="h4" glow={0.8} />
		{/* rewind marks */}
		<path d="M440,330 L400,360 L440,390 Z M480,330 L440,360 L480,390 Z" fill={P.pale} opacity={0.8} />
		<text x={500} y={374} style={{fontFamily: "'DejaVu Sans Mono',monospace", fontSize: 30, fontWeight: 700}} fill={P.pale} opacity={0.75}>2026 → 乾隆</text>
	</g>,
	furn: <><div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 118, letterSpacing: '0.08em', lineHeight: 1.25, color: '#F3F6F2', textShadow: '0 0 2px rgba(14,20,24,0.95), 0 4px 10px rgba(14,20,24,0.8), 0 6px 40px rgba(14,20,24,0.6)'}}>
		<div>马首回家，</div><div>用了<span style={{color: KEY}}>160</span>年</div></div><Brand /></>,
};
/* ---------- 5 · A3 the fountain (乾隆) ---------- */
const F5: KF = {label: 'A3 0:24 · 海晏堂水力钟',
	scene: <g>
		<PlateSky id="s5" top={P.mid} bot={P.pale} lines={0.55} />
		<Haiyantang cx={960} g={560} k={0.85} />
		<PlateGround y={560} c={P.soft} c2={P.mid} />
		<Pool cx={960} g={560} k={1.25} present="all" arcs="none" />
	</g>,
	furn: <><Story rows={[{s: '你和十一个兄弟，坐在[水池两边]。'}]} /><Brand /><Stamp y="乾隆年间" place="海晏堂" l2="圆明园 · 西洋楼" /><Dial st={home12} rows={[{label: '在家', n: 12}]} /></>,
};
/* ---------- 6 · A7 noon: all twelve at once ---------- */
const F6: KF = {label: 'A7 0:36 · 正午一起喷水',
	scene: <g>
		<PlateSky id="s6" top={P.mid} bot={P.paper} lines={0.5} />
		<g transform="translate(-480,-330) scale(1.5)"><Haiyantang cx={960} g={600} k={0.95} o={0.85} /><PlateGround y={600} c={P.soft} c2={P.mid} /><Pool cx={960} g={600} k={1.0} present="all" arcs="all" /></g>
		{/* noon sun-dial shadow line on the pavement */}
		<line x1={960} y1={1080} x2={960} y2={1010} stroke={P.ink} strokeWidth={6} opacity={0.5} />
	</g>,
	furn: <><Story rows={[{s: '你是[午时]。'}, {s: '正午十二点，十二个[一起喷水]。'}]} /><Brand /><Stamp y="12:00" place="午时" l2="11:00–13:00 是你" /><Dial st={home12} rows={[{label: '在家', n: 12}]} /></>,
};
/* ---------- 7 · B2 1860: everything that can be carried is carried; then the fire ---------- */
const carryP = (u: number): Pose => { const g = gaitPose('08_04', u); const a = fkPose({...STAND, la: 62, le: 60, ra: 66, re: 56}); return {...g, LSh: a.LSh, LElb: [g.Spine1[0] + 0.11, g.Spine1[1] + 0.02], LHand: [g.Spine1[0] + 0.25, g.Spine1[1] + 0.06], RSh: a.RSh, RElb: [g.Spine1[0] + 0.12, g.Spine1[1] + 0.0], RHand: [g.Spine1[0] + 0.26, g.Spine1[1] + 0.03]}; };
const F7: KF = {label: 'B2 0:44 · 1860',
	scene: <g>
		<PlateSky id="s7" top={P.deep} bot={P.soft} lines={0.5} />
		{/* smoke columns behind the roofs, engraved */}
		{[300, 760, 1240, 1660].map((x, i) => <g key={i}>{Array.from({length: 7}, (_, j) => <ellipse key={j} cx={x + Math.sin(j * 1.3 + i) * 60 + j * 22} cy={620 - j * 90} rx={110 + j * 22} ry={70 + j * 10} fill={P.soft} opacity={0.55 - j * 0.05} stroke={P.line} strokeWidth={1.2} />)}</g>)}
		{[300, 760, 1240, 1660].map((x, i) => <rect key={i} x={x - 160} y={540} width={320} height={120} fill={P.plate} />)}
		<g opacity={0.9}><Haiyantang cx={960} g={660} k={0.7} o={0.7} /></g>
		<PlateGround y={660} c={P.mid} c2={P.plate} />
		{/* soldiers carrying things away (profile, walking right) */}
		{[{x: 560, u: 0.1, l: LK.soldier}, {x: 900, u: 0.45, l: LK.soldier2}, {x: 1260, u: 0.75, l: LK.soldier}].map((s, i) => { const p = carryP(s.u), hd = jointAt(p, 'RHand', s.x, 960, 560);
			return <g key={i}><Rimmed x={s.x} ground={960} h={560} pose={p} look={s.l} col={INKF} rim={P.line} rimOp={0.4} />
				{i === 1 ? <path d={`M${hd[0] - 30},${hd[1] - 90} C${hd[0] - 60},${hd[1] - 40} ${hd[0] - 50},${hd[1] + 30} ${hd[0] - 10},${hd[1] + 40} L${hd[0] + 40},${hd[1] + 40} C${hd[0] + 80},${hd[1] + 30} ${hd[0] + 90},${hd[1] - 40} ${hd[0] + 60},${hd[1] - 90} Z`} fill={P.pale} stroke={P.ink} strokeWidth={2} />
					: <rect x={hd[0] - 40} y={hd[1] - 70} width={110} height={90} fill={P.soft} stroke={P.line} strokeWidth={2} />}</g>; })}
		{/* you, still on your seat at the left; fire light flickers on the copper */}
		<StoneBody x={170} y={880} s={1.9} />
		<HorseHead x={176} y={720} s={0.3} id="h7" glow={1.1} flicker={1} flip />
	</g>,
	furn: <><Story rows={[{s: '1860年，英法联军[进了园子]。', o: 0.65}, {s: '能搬走的都被搬走，然后[一把火]。'}]} /><Brand /><Stamp y="1860.10" place="圆明园" l2="10月18日 放火" /><Dial st={home12} rows={[{label: '在家', n: 12}]} /></>,
};
/* ---------- 8 · D7 Hong Kong 2007: the hammer is raised and never comes down ---------- */
const F8: KF = {label: 'D7 1:11 · 锤子没有落下',
	scene: <g><AuctionRoom hammer="held" era="new" plinthX={760} /><HorseHead x={760} y={492} s={0.5} id="h8" glow={1} /><Bidders up={[0, 1]} xs={[110, 320, 520]} /></g>,
	furn: <><Story rows={[{s: '2007年，你又要[上拍]了。', o: 0.65}, {s: '这一次，锤子[没有落下]。'}]} /><Brand /><Stamp y="2007" place="香港苏富比" l2="国家文物局：" l3="主张终止公开拍卖" /><Dial st={back(new Set<Z>(['牛', '虎', '猴', '猪']))} rows={[{label: '回国', n: 4}]} /></>,
};
/* ---------- 9 · D13 Paris 2009: the hammer falls, nobody pays ---------- */
const F9: KF = {label: 'D13 1:28 · 拒绝付款',
	scene: <g>
		<AuctionRoom hammer="down" plinthX={760} />
		<ZHead z="鼠" x={680} y={600} s={1.6} mode="cool" c={P.soft} /><ZHead z="兔" x={850} y={590} s={1.6} mode="cool" c={P.soft} />
		{/* the lot card, stamped 未付款 */}
		<g transform="translate(500,724) rotate(-3)"><rect x={0} y={0} width={560} height={150} fill={P.paper} stroke={P.ink} strokeWidth={2} />
			<text x={24} y={52} style={{fontFamily: SANS, fontSize: 34, fontWeight: 900}} fill={P.ink}>鼠首 · 兔首</text>
			<text x={24} y={108} style={{fontFamily: "'DejaVu Sans',sans-serif", fontSize: 40, fontWeight: 700}} fill={P.ink}>€31,490,000</text>
			<g transform="translate(440,76) rotate(-12)"><rect x={-110} y={-40} width={220} height={80} rx={8} fill="none" stroke="#2E7F74" strokeWidth={6} /><text x={0} y={18} textAnchor="middle" style={{fontFamily: SANS, fontSize: 48, fontWeight: 900, letterSpacing: '0.1em'}} fill="#2E7F74">未付款</text></g></g>
		<Bidders up={[0]} xs={[110, 330]} />
	</g>,
	furn: <><Story rows={[{s: '锤子落下：两件[3149万欧元]。', o: 0.65}, {s: '买家却[拒绝付款]。'}]} /><Brand /><Stamp y="2009" place="巴黎" l2="佳士得" /><Dial st={back(BACK5)} rows={[{label: '回国', n: 5}]} /></>,
};
/* ---------- 10 · E4 he did not live to see it ---------- */
const F10: KF = {label: 'E4 1:44 · 他没等到',
	scene: <g>
		<PlateSky id="s10" top={P.deep} bot={P.plate} lines={0.4} />
		{/* window, night outside, a faint copper glint far away */}
		<rect x={1180} y={180} width={460} height={560} fill={P.deep} stroke={P.line} strokeWidth={3} />
		<rect x={1180} y={180} width={460} height={560} fill="url(#hz)" opacity={0.5} />
		<line x1={1410} y1={180} x2={1410} y2={740} stroke={P.line} strokeWidth={3} /><line x1={1180} y1={460} x2={1640} y2={460} stroke={P.line} strokeWidth={3} />
		<Glow x={1520} y={600} r={50} c={CU.halo} o={0.6} id="g10" /><circle cx={1520} cy={600} r={5} fill={CU.core} />
		<PlateGround y={820} c={P.plate} c2={P.deep} />
		{/* armchair (empty) + lamp (off) */}
		<path d="M640,820 L640,560 C640,500 700,470 760,470 L940,470 C1000,470 1060,500 1060,560 L1060,820 Z" fill={P.mid} stroke={P.line} strokeWidth={2} />
		<path d="M640,820 L640,560 C640,500 700,470 760,470 L940,470 C1000,470 1060,500 1060,560 L1060,820 Z" fill="url(#h45d)" opacity={0.4} />
		<rect x={600} y={640} width={110} height={200} rx={30} fill={P.soft} stroke={P.line} strokeWidth={2} /><rect x={990} y={640} width={110} height={200} rx={30} fill={P.soft} stroke={P.line} strokeWidth={2} />
		<rect x={690} y={680} width={320} height={80} rx={18} fill={P.soft} stroke={P.line} strokeWidth={2} />
		<rect x={360} y={600} width={160} height={14} fill={P.soft} /><rect x={430} y={614} width={20} height={220} fill={P.soft} /><path d="M380,520 L500,520 L470,450 L410,450 Z" fill={P.mid} stroke={P.line} strokeWidth={2} /><rect x={437} y={520} width={6} height={80} fill={P.line} />
	</g>,
	furn: <><Punch s="他没等到，[你回家]那天。" top={300} /><Brand /><Stamp y="2020.5" place="香港" l2="何鸿燊去世，98岁" /><Dial st={back(BACK7)} rows={[{label: '回国', n: 7}]} /></>,
};
/* ---------- 11 · H4 the twist: back in China = 7, back home = 1 ---------- */
const F11: KF = {label: 'H4 1:56 · 只有你',
	scene: <g>
		<PlateSky id="s11" top={P.plate} bot={P.pale} lines={0.5} />
		{/* city far right: two museum buildings holding six pale lights */}
		<g opacity={0.9}>
			{[[1330, 380, 170, 250, '保利艺术博物馆', 4], [1580, 420, 220, 210, '国家博物馆', 2]].map(([x, y, w, h, name, n], i) => <g key={i}>
				<rect x={x as number} y={y as number} width={w as number} height={h as number} fill={P.soft} stroke={P.line} strokeWidth={2} /><rect x={x as number} y={y as number} width={w as number} height={h as number} fill="url(#h45)" opacity={0.35} />
				{Array.from({length: n as number}, (_, j) => <circle key={j} cx={(x as number) + 30 + j * 36} cy={(y as number) + 60} r={10} fill={P.paper} stroke={P.line} strokeWidth={2} />)}
				<text x={(x as number) + (w as number) / 2} y={(y as number) + (h as number) + 40} textAnchor="middle" style={{fontFamily: SANS, fontSize: 28, fontWeight: 700}} fill={P.deep}>{name as string}</text></g>)}
		</g>
		<PlateGround y={700} c={P.soft} c2={P.mid} />
		{/* ruins left, the one temple pavilion in the middle with you inside */}
		{[180, 300, 380].map((x, i) => <g key={i}><rect x={x} y={560 - i * 30} width={50} height={140 + i * 30} fill={P.soft} stroke={P.line} strokeWidth={1.5} /><rect x={x} y={560 - i * 30} width={50} height={140 + i * 30} fill="url(#h45d)" opacity={0.4} /></g>)}
		<path d="M520,700 L560,640 L640,660 L700,610 L760,700 Z" fill={P.soft} stroke={P.line} strokeWidth={1.5} />
		<g>
			<path d="M780,440 L960,330 L1140,440 Z" fill={P.deep} stroke={P.line} strokeWidth={2.5} />
			<path d="M800,440 L1120,440 L1100,470 L820,470 Z" fill={P.mid} stroke={P.line} strokeWidth={2} />
			{[830, 1090].map((x) => <rect key={x} x={x - 12} y={470} width={24} height={230} fill={P.mid} stroke={P.line} strokeWidth={2} />)}
			<rect x={860} y={600} width={200} height={100} fill={P.soft} stroke={P.line} strokeWidth={2} />
			<HorseHead x={960} y={550} s={0.16} id="h11" glow={1} />
		</g>
		{/* six pale lights drifting away to the right */}
		{Array.from({length: 6}, (_, i) => <circle key={i} cx={1130 + i * 30} cy={560 - i * 22} r={8} fill={P.paper} opacity={0.6 - i * 0.05} />)}
	</g>,
	furn: <><Story rows={[{s: '十二个里，回到中国的有[七个]。', o: 0.65}, {s: '如今回到圆明园的，[只有你]。'}]} /><Brand /><Stamp y="2020.12.1" place="圆明园" l2="正觉寺 · 文殊亭" /><Dial st={back(BACK7)} rows={[{label: '回国', n: 7, dim: true}, {label: '回家', n: 1, home: true}]} /></>,
};
/* ---------- 12 · K2 noon again: eleven short ---------- */
const F12: KF = {label: 'K2 2:15 · 还差十一个',
	scene: <g>
		<PlateSky id="s12" top={P.mid} bot={P.paper} lines={0.5} />
		<g transform="translate(-480,-330) scale(1.5)"><Haiyantang cx={960} g={600} k={0.95} o={0.45} /><PlateGround y={600} c={P.soft} c2={P.mid} /><Pool cx={960} g={600} k={1.0} present={NONE} ghost arcs="memory" /></g>
	</g>,
	furn: <><Punch s="还差[十一个]。" top={330} /><Brand /><Stamp y="今天" place="正午" /><Dial st={dialFor(NONE)} rows={[{label: '回家', n: 1, home: true}]} /></>,
};

export const FRAMES45: KF[] = [F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12];
void rnd; void Marked; void H;
