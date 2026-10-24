import React from 'react';
import {W, H, rnd, lerp, Glow, CU, T, HorseHead, ZODIAC, RETURNED, Z} from './kit45';
import {QDefs, Shadow, Sky3, Tree3, Haiyantang3, Pool3, StoneBody3, ZHead3, WaterArc3, ZPos3} from './sets45';
import {AuctionRoom, Bidders, LK, FIG, RIM, hatchOver} from './frames45';
import {S2, S3, S4, S5, S6, S7, S8, S9, Rewind, seg, ease, easeOut, T45} from './demo45';
import {Rimmed, Look4} from '../qq44/kit44';
import {jointAt, grounded, reg, walkArms, phaseFor, seated} from './pose45';
import {SANS} from './skin45';
import {TL} from './lines45';
/* ep45 《马首回家，用了160年》 full film scenes (0–154.18 s), on the bgm2 film bed (music/build45film.py).
   Music landmarks: title crash 18.115 · S2 34.53 · S3 48.12 · re-entry HIT 63.97 · valley 75.29 · crash 88.87 ·
   stop HIT 105.29, silence 105.98–106.96 · DROP 116.04 · coda cut 125.10 · dead STOP 136.09 · intro return 137.77 ·
   FINAL HIT 146.82 · end 154.18. */
export const END = 154.181;
const P_ = 0.56605, bt = (k: number) => 0.5688 + k * P_;
const Cam: React.FC<{x?: number; y?: number; z?: number; children: React.ReactNode}> = ({x = 960, y = 540, z = 1, children}) =>
	<g transform={`translate(960,540) scale(${z}) translate(${-x},${-y})`}>{children}</g>;
const ALLZ = new Set<Z>(ZODIAC);

/* ================= museum case (hook, E1) ================= */
const Museum: React.FC<{t: number; on: number; id: string; z?: number; visitors?: boolean}> = ({t, on, id, z = 1, visitors}) => <Cam z={z} x={1120} y={600}>
	<defs><linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1F3540" /><stop offset="1" stopColor="#2F4B55" /></linearGradient>
		<linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF4E0" stopOpacity="0.5" /><stop offset="1" stopColor="#FFF4E0" stopOpacity="0" /></linearGradient>
		<radialGradient id={`${id}p`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFF1DA" stopOpacity="0.6" /><stop offset="1" stopColor="#FFF1DA" stopOpacity="0" /></radialGradient></defs>
	<rect x={-200} y={-200} width={W + 400} height={H + 400} fill={`url(#${id}w)`} />
	{Array.from({length: 8}, (_, i) => <g key={i}><rect x={-180 + i * 300} y={-200} width={4} height={H + 400} fill="#16262E" opacity={0.6} /><rect x={-176 + i * 300} y={-200} width={2} height={H + 400} fill="#46646E" opacity={0.5} /></g>)}
	<rect x={-200} y={900} width={W + 400} height={400} fill="#1B2C33" /><rect x={-200} y={900} width={W + 400} height={3} fill="#4C6670" />
	<Shadow x={1230} y={1004} rx={420} ry={30} o={0.55} />
	<rect x={830} y={950} width={760} height={330} fill="url(#mbV)" stroke="#2B2722" strokeWidth={1.5} /><rect x={830} y={950} width={760} height={10} fill="#FAF5EC" /><rect x={1450} y={960} width={140} height={320} fill="#8E826D" opacity={0.5} />
	<g opacity={on}><path d="M560,-240 L760,-240 L1700,960 L980,1000 Z" fill={`url(#${id}b)`} filter="url(#soft14)" /><ellipse cx={1210} cy={952} rx={360} ry={30} fill={`url(#${id}p)`} />
		{Array.from({length: 40}, (_, i) => { const u = (rnd(i, 3) + t * 0.02 * (0.5 + rnd(i, 7))) % 1, x = lerp(640, 1500, u) + (rnd(i, 4) - 0.5) * 200 * u, y = lerp(30, 900, u); return <circle key={i} cx={x} cy={y} r={1 + 2.2 * rnd(i, 5)} fill="#FFF4E0" opacity={0.25 + 0.4 * rnd(i, 6)} />; })}</g>
	<HorseHead x={1170} y={640} s={1.12} id={`${id}h`} glow={0.25 + 0.6 * on} metal={0.3 + 0.7 * on} lx={-500} ly={-700} />
	<rect x={760} y={60} width={3} height={880} fill="#BFD9DE" opacity={0.25} /><rect x={1660} y={60} width={3} height={880} fill="#BFD9DE" opacity={0.25} />
	<path d="M1560,60 L1620,60 L1460,940 L1400,940 Z" fill="#E6F2F4" opacity={0.06} />
	{visitors && [0, 1, 2].map((i) => { const h = 560, sp = 0.55 + 0.15 * i, x = -200 + ((t * 260 * sp + i * 760) % (W + 600)), p = walkArms(phaseFor((x + 200) / h));
		reg({frame: 'E1', who: `visitor${i}`, x, ground: 1060, h, pose: p, intent: 'walk'});
		return <Rimmed key={i} x={x} ground={1060} h={h} pose={p} look={([{dress: 'jacket', head: 'short'}, {dress: 'dress', head: 'bob'}, {dress: 'coat', head: 'glasses'}] as Look4[])[i]} col={FIG} rim={RIM} rimOp={0.35} />; })}
</Cam>;
export const F_S1: React.FC<{t: number}> = ({t}) => { const on = t < 0.5688 ? 0.15 : 0.15 + 0.85 * easeOut(seg(t, 0.5688, 0.5688 + 0.12)); return <Museum t={t} on={on} id="m1" z={1 + 0.04 * seg(t, 0, T45.c2)} />; };

/* ================= the garden of 海晏堂 ================= */
const Garden3: React.FC<{t: number; id: string; present?: Set<Z> | 'all'; ghost?: boolean; ghostSet?: Set<Z>; arcs?: 'none' | 'all' | 'memory' | 'one'; active?: Z; grow?: number; smoke?: number; dim?: number; label?: number; youOn?: boolean}> =
	({t, id, present = 'all', ghost, ghostSet, arcs = 'none', active, grow = 1, smoke = 0, dim = 0, label = 0, youOn = true}) => <g>
	<Sky3 id={`${id}s`} top={smoke > 0 ? '#5B5048' : '#7FA7C2'} bot={smoke > 0 ? '#B49C80' : '#E3ECE8'} seed={4} clouds={smoke > 0 ? 0 : 5} />
	{smoke > 0 && [260, 760, 1260, 1720].map((x, i) => <g key={i} opacity={smoke}>{Array.from({length: 7}, (_, j) => <ellipse key={j} cx={x + Math.sin(j * 1.3 + i) * 60 + j * 22 + t * 12} cy={560 - j * 90 - (t % 20) * 4} rx={130 + j * 26} ry={80 + j * 12} fill={j < 2 ? '#5E5046' : '#8A7C6C'} opacity={0.8 - j * 0.07} filter="url(#soft6)" />)}</g>)}
	<Tree3 x={170} g={575} h={360} seed={7} hue="pine" /><Tree3 x={1760} g={575} h={340} seed={8} hue="pine" />
	<Tree3 x={330} g={590} h={430} seed={2} hue="willow" /><Tree3 x={1610} g={590} h={420} seed={3} hue="round" />
	<rect x={0} y={575} width={W} height={H - 575} fill="url(#pave)" />
	{Array.from({length: 24}, (_, i) => <line key={i} x1={960} y1={560} x2={-600 + i * 130} y2={H} stroke="#8D7D5F" strokeWidth={1} opacity={0.35} />)}
	{Array.from({length: 12}, (_, i) => { const y = 580 + Math.pow(i / 11, 1.6) * 500; return <line key={i} x1={0} y1={y} x2={W} y2={y} stroke="#8D7D5F" strokeWidth={1} opacity={0.3} />; })}
	<Haiyantang3 cx={960} g={575} k={0.8} />
	{dim > 0 && <rect x={0} y={0} width={W} height={600} fill="#E3ECE8" opacity={dim} />}
	<Pool3 cx={960} g={575} k={1.22} present={present} ghost={ghost} ghostSet={ghostSet} arcs={arcs} active={active} grow={grow} id={`${id}p`} youGlow={0.9} you={youOn} />
	{label > 0 && <g opacity={label}><rect x={820} y={952} width={280} height={84} rx={6} fill="#F1EADC" stroke="#2B2722" strokeWidth={2.5} /><text x={960} y={1010} textAnchor="middle" style={{fontFamily: SANS, fontSize: 46, fontWeight: 900, letterSpacing: '0.2em'}} fill="#2B2722">水力钟</text></g>}
	{smoke > 0 && <rect x={0} y={0} width={W} height={H} fill="#6A4A30" opacity={0.12 * smoke} />}
</g>;
const youPos = () => ZPos3(960, 575, 1.22).find((p) => p.z === '马')!;
/** the hour the water clock shows, 0 = 子 … 6 = 午 */
export const hourAt = (t: number) => t < TL.A4 ? 0 : t < TL.A6 ? 5.2 * Math.pow(seg(t, TL.A4, TL.A6), 1.5) : 5.2 + 0.8 * easeOut(seg(t, TL.A6, TL.A6 + 1.2));
/* A3–A6: push out from you, the hours go round, the needle reaches 午 */
export const F_A3: React.FC<{t: number}> = ({t}) => {
	const u = ease(seg(t, TL.A3, TL.A3 + 1.6)), y = youPos(), zA6 = ease(seg(t, TL.A6, TL.A6 + 1.4));
	const z = lerp(3.0, 1.0, u) * (1 + 0.6 * zA6), cx = lerp(lerp(y.x, 960, u), y.x - 60, zA6), cy = lerp(lerp(y.y - 80, 540, u), y.y - 120, zA6);
	const h = hourAt(t), act = t >= TL.A4 ? ZODIAC[Math.floor(h + 0.001) % 12] : undefined, grow = t >= TL.A4 ? (t >= TL.A6 + 1.0 ? 1 : 0.25 + 0.75 * Math.sin(Math.PI * Math.min(0.999, h % 1))) : 0;
	return <Cam z={z} x={cx} y={cy}><Garden3 t={t} id="ga3" arcs={act ? 'one' : 'none'} active={act} grow={Math.max(0.2, grow)} label={t >= TL.A4 ? easeOut(seg(t, TL.A4, TL.A4 + 0.4)) * (1 - zA6) : 0} /></Cam>;
};
/* A7: noon — all twelve rise together on the section downbeat */
export const F_A7: React.FC<{t: number}> = ({t}) => { const r = easeOut(seg(t, TL.A7, TL.A7 + 0.9)), z = 1.08 - 0.08 * ease(seg(t, TL.A7, TL.A7 + 1.2)) + 0.03 * seg(t, TL.A7 + 1.2, TL.B1);
	return <Cam z={z}><Garden3 t={t} id="ga7" arcs="all" grow={r} /></Cam>; };

/* ================= 1860 ================= */
const SOLDIER = (k: number): Look4 => (k % 2 ? {dress: 'coat', head: 'cap'} : {dress: 'coat', head: 'cylcap'}) as Look4;
/** soldiers walking left→right; carry: crate / vase / none */
const March: React.FC<{t: number; t0: number; frame: string; carry?: boolean; g?: number; h?: number; xs?: number[]; speed?: number}> = ({t, t0, frame, carry, g = 1010, h = 520, xs = [-200, 240, 680], speed = 150}) => <g>
	{xs.map((x0, i) => { const x = x0 + (t - t0) * speed, kind = !carry ? 'none' : i === 1 ? 'vase' : 'crate';
		const arms = kind === 'crate' ? {la: 34, le: 58, ra: 40, re: 52} : kind === 'vase' ? {la: 24, le: 64, ra: 28, re: 60} : undefined;
		const p = walkArms(phaseFor((x - x0 + i * 40) / h), arms), l = jointAt(p, 'LHand', x, g, h), r = jointAt(p, 'RHand', x, g, h), hx = (l[0] + r[0]) / 2, hy = Math.min(l[1], r[1]);
		reg({frame, who: `soldier${i}`, x, ground: g, h, pose: p, intent: 'walk'});
		return <g key={i}><Shadow x={x} y={g + 4} rx={h * 0.16} ry={10} o={0.35} /><Rimmed x={x} ground={g} h={h} pose={p} look={SOLDIER(i)} col={FIG} rim={RIM} rimOp={0.4} />
			{kind === 'crate' && <g><rect x={hx - 30} y={hy - 86} width={118} height={88} fill="#7B5A42" stroke="#2B2722" strokeWidth={2} />{hatchOver(hx - 30, hy - 86, 118, 88, 'h45d', 0.3)}<rect x={hx - 30} y={hy - 48} width={118} height={7} fill="#4E3828" /></g>}
			{kind === 'vase' && <g><path d={`M${hx + 6},${hy - 116} L${hx + 34},${hy - 116} C${hx + 28},${hy - 98} ${hx + 76},${hy - 68} ${hx + 66},${hy - 10} C${hx + 58},${hy + 28} ${hx + 38},${hy + 40} ${hx + 20},${hy + 40} C${hx + 2},${hy + 40} ${hx - 18},${hy + 28} ${hx - 26},${hy - 10} C${hx - 36},${hy - 68} ${hx + 12},${hy - 98} ${hx + 6},${hy - 116} Z`} fill="#DCE6EE" stroke="#2B2722" strokeWidth={2} /><path d={`M${hx - 16},${hy - 40} C${hx + 10},${hy - 20} ${hx + 40},${hy - 50} ${hx + 60},${hy - 30}`} stroke="#3E5E8A" strokeWidth={5} fill="none" /></g>}
		</g>; })}
</g>;
export const F_B1: React.FC<{t: number}> = ({t}) => <g><Garden3 t={t} id="gb1" smoke={0.25 * seg(t, TL.B1 + 1.5, TL.B2)} /><March t={t} t0={TL.B1} frame="B1" xs={[-420, -120, 180]} speed={170} /></g>;
export const F_B2: React.FC<{t: number}> = ({t}) => { const fire = easeOut(seg(t, bt(76), bt(77))); // 一把火 on beat ≈ 43.6+2.8
	return <g><Garden3 t={t} id="gb2" smoke={0.35 + 0.65 * fire} /><March t={t} t0={TL.B2} frame="B2" carry xs={[60, 560, 1060]} speed={120} />
		{fire > 0 && <rect x={0} y={0} width={W} height={H} fill="#FF9A50" opacity={0.08 * fire * (0.6 + 0.4 * Math.sin(t * 19))} />}</g>; };
/* B4: your seat is empty; the dial goes dark */
export const F_B4: React.FC<{t: number}> = ({t}) => { const y = youPos(), z = lerp(1.6, 2.2, ease(seg(t, TL.B4, TL.D1)));
	return <Cam z={z} x={y.x - 80} y={y.y - 60}><Garden3 t={t} id="gb4" smoke={0.7} youOn={false} present={new Set<Z>(ZODIAC.filter((zz) => zz !== '马'))} /></Cam>; };

/* ================= the hammer ================= */
const LondonLot: React.FC<{t: number; k: number; frame: string}> = ({t, k, frame}) => <Cam z={1.05 - 0.05 * seg(t, TL.D1, TL.D3)} x={900}><AuctionRoom hammer="held" k={k} wall="#4F6E64" frame={frame} plinthX={860} /><HorseHead x={860} y={604} s={0.26} id={`${frame}h`} glow={0.9} /><Bidders frame={frame} up={k > 0.9 ? [2] : [1, 2]} xs={[130, 360, 580]} /></Cam>;
export const F_D1: React.FC<{t: number}> = ({t}) => <LondonLot t={t} k={0} frame="D1" />;
export const F_D2: React.FC<{t: number}> = ({t}) => <LondonLot t={t} k={ease(seg(t, bt(98.5), bt(99)))} frame="D2" />;
/* 2000 Hong Kong: the three brothers, hammer held through the break, slams on the re-entry hit (63.97) */
export const F_D3: React.FC<{t: number}> = ({t}) => { const k = t < TL.D4 ? 0 : 1, sh = t < TL.D4 ? 0 : Math.exp(-(t - TL.D4) * 10) * Math.sin((t - TL.D4) * 80) * 6;
	return <g transform={`translate(${sh},0)`}><Cam z={1.0 + 0.14 * ease(seg(t, TL.D3, TL.D4))} x={lerp(920, 1080, ease(seg(t, TL.D3, TL.D4)))} y={lerp(540, 470, ease(seg(t, TL.D3, TL.D4)))}><AuctionRoom hammer="held" k={k} wall="#4B5A68" trim="#6D7F8E" frame="D3" screen plinthX={800} />
		{(['牛', '猴', '虎'] as Z[]).map((zz, i) => <ZHead3 key={zz} z={zz} x={700 + i * 100} y={640} s={1.25} flip />)}<Bidders frame="D3" up={t < TL.D4 ? [0, 1, 2] : [0]} xs={[110, 320, 520]} /></Cam></g>; };
/* 2003: the pig head, a handshake (no hammer) */
const shakeA = grounded({lean: 4, neck: 6, lt: 2, lk: 2, rt: -3, rk: 3, la: -2, le: 12, ra: 44, re: 36}), shakeB = shakeA;
export const F_D5: React.FC<{t: number}> = ({t}) => { const g = 960, h = 600, xA = 640, hA = jointAt(shakeA, 'RHand', xA, g, h), hB0 = jointAt(shakeB, 'RHand', 0, g, h, true), xB = hA[0] - hB0[0] + 6;
	reg({frame: 'D5', who: 'Ho', x: xA, ground: g, h, pose: shakeA, intent: 'stand'}); reg({frame: 'D5', who: 'seller', x: xB, ground: g, h, pose: shakeB, flip: true, intent: 'stand'});
	return <Cam z={1 + 0.04 * seg(t, TL.D5, TL.D6)}>
		<rect width={W} height={H} fill="#6B5A4E" />{hatchOver(0, 0, W, 760, 'h45d', 0.12)}
		{[200, 760, 1320].map((x) => <rect key={x} x={x} y={120} width={400} height={480} fill="none" stroke="#A8927C" strokeWidth={4} />)}
		<rect x={0} y={760} width={W} height={320} fill="#4E3828" />
		<Shadow x={1420} y={964} rx={180} ry={16} /><rect x={1300} y={760} width={260} height={200} fill="#7B5A42" stroke="#2B2722" strokeWidth={2} /><rect x={1290} y={748} width={280} height={16} fill="#4E3828" />
		<ZHead3 z="猪" x={1430} y={690} s={1.5} />
		<Shadow x={(xA + xB) / 2} y={g + 4} rx={260} ry={14} />
		<Rimmed x={xA} ground={g} h={h} pose={shakeA} look={{dress: 'jacket', head: 'glasses'} as Look4} col={FIG} rim={RIM} rimOp={0.4} />
		<Rimmed x={xB} ground={g} h={h} pose={shakeB} look={{dress: 'jacket', head: 'short'} as Look4} flip col={FIG} rim={RIM} rimOp={0.4} />
	</Cam>; };
/* 2007 Hong Kong: you again; the hammer is raised and held (D6–D7) */
export const F_D6: React.FC<{t: number}> = ({t}) => { const v = 6910; void v;
	return <Cam z={1.0 + 0.06 * seg(t, TL.D6, TL.D8)} x={900}><AuctionRoom hammer="held" k={0} wall="#4B5A68" trim="#6D7F8E" frame="D6" screen plinthX={800} /><HorseHead x={800} y={604} s={0.26} id="d6h" glow={1} /><Bidders frame="D6" up={[0, 1]} xs={[110, 320, 520]} /></Cam>; };
/* D8–D9: the quiet room, the deal; the number slams */
export const F_D8: React.FC<{t: number}> = ({t}) => { const g = 960, h = 600, x = 560, p = grounded({lean: 6, neck: 14, lt: 2, lk: 2, rt: -3, rk: 3, la: 8, le: 20, ra: 30, re: 40});
	reg({frame: 'D8', who: 'Ho', x, ground: g, h, pose: p, intent: 'stand'});
	return <Cam z={1.0 + 0.16 * ease(seg(t, TL.D8, TL.D10))} x={lerp(960, 1020, seg(t, TL.D8, TL.D10))} y={lerp(540, 600, seg(t, TL.D8, TL.D10))}>
		<rect width={W} height={H} fill="#3E4A55" />{hatchOver(0, 0, W, 760, 'h45d', 0.12)}
		<rect x={0} y={760} width={W} height={320} fill="#2E3740" />
		<path d="M1000,0 L1100,0 L1260,780 L860,780 Z" fill="#FFF4E0" opacity={0.12} />
		<Shadow x={1080} y={964} rx={220} ry={18} /><rect x={930} y={720} width={300} height={240} fill="url(#mbV)" stroke="#2B2722" strokeWidth={2} />
		<HorseHead x={1080} y={648} s={0.26} id="d8h" glow={1} />
		<Shadow x={x} y={g + 4} rx={110} ry={12} /><Rimmed x={x} ground={g} h={h} pose={p} look={{dress: 'jacket', head: 'glasses'} as Look4} col={FIG} rim={RIM} rimOp={0.45} />
	</Cam>; };
/* D10: the price, twenty times over (two bars, both in US dollars) */
export const F_D10: React.FC<{t: number}> = ({t}) => { const g = easeOut(seg(t, TL.D10, TL.D10 + 1.0)), hA = 18, hB = 440 * g;
	return <g><rect width={W} height={H} fill="#2E3F4B" />{hatchOver(0, 0, W, H, 'hzInk', 0.18)}
		<rect x={560} y={900} width={800} height={4} fill="#E9DFC8" />
		<rect x={640} y={900 - hA} width={220} height={hA} fill="#B08463" /><rect x={1060} y={900 - hB} width={220} height={hB} fill={CU.mid} />
		<Glow x={1170} y={900 - hB / 2} r={260} c={CU.halo} o={0.25 * g} id="d10g" />
		<text x={750} y={960} textAnchor="middle" style={{fontFamily: SANS, fontSize: 40, fontWeight: 900}} fill="#E9DFC8">1989</text><text x={750} y={860} textAnchor="middle" style={{fontFamily: SANS, fontSize: 36, fontWeight: 700}} fill="#E9DFC8">几十万美元</text>
		<text x={1170} y={960} textAnchor="middle" style={{fontFamily: SANS, fontSize: 40, fontWeight: 900}} fill="#E9DFC8">2007</text><text x={1170} y={880 - hB} textAnchor="middle" style={{fontFamily: SANS, fontSize: 36, fontWeight: 700}} fill="#E9DFC8" opacity={g}>884万美元</text>
	</g>; };
/* D11–D13: Paris 2009 — rat and rabbit; the hammer on the crash (88.87); 未付款 */
export const F_D11: React.FC<{t: number}> = ({t}) => { const k = t < TL.D12 ? 0 : ease(seg(t, TL.D12 - 0.06, TL.D12)), stamp = easeOut(seg(t, TL.D13, TL.D13 + 0.15));
	return <Cam z={1.03 - 0.03 * seg(t, TL.D11, TL.D14)} x={900}><AuctionRoom hammer="held" k={k} wall="#6E4249" frame="D11" plinthX={800} />
		<ZHead3 z="鼠" x={720} y={620} s={1.4} /><ZHead3 z="兔" x={880} y={610} s={1.4} />
		{t >= TL.D12 && <g transform={`translate(560,724) rotate(-3)`}><rect x={0} y={0} width={560} height={150} fill="#E9DFC8" stroke="#2B2722" strokeWidth={2} />
			<text x={24} y={52} style={{fontFamily: SANS, fontSize: 34, fontWeight: 900}} fill="#2B2722">鼠首 · 兔首</text><text x={24} y={108} style={{fontFamily: "'DejaVu Sans',sans-serif", fontSize: 40, fontWeight: 700}} fill="#2B2722">€31,490,000</text>
			{stamp > 0 && <g transform={`translate(440,76) rotate(-12) scale(${1 + 0.6 * (1 - stamp)})`} opacity={stamp}><rect x={-110} y={-40} width={220} height={80} rx={8} fill="none" stroke="#2E6F8A" strokeWidth={6} /><text x={0} y={18} textAnchor="middle" style={{fontFamily: SANS, fontSize: 48, fontWeight: 900, letterSpacing: '0.1em'}} fill="#2E6F8A">未付款</text></g>}</g>}
		<Bidders frame="D11" up={t < TL.D12 ? [0] : []} xs={[110, 330]} /></Cam>; };
/* handover in a hall (2013: rat + rabbit; 2019: you). Two standing figures, the item on a plinth between them */
const giverP = grounded({lean: 4, neck: 8, lt: 2, lk: 2, rt: -3, rk: 3, la: -2, le: 14, ra: 34, re: 30}), takerP = grounded({lean: 6, neck: 12, lt: 2, lk: 2, rt: -3, rk: 3, la: 4, le: 18, ra: 30, re: 44});
const Handover: React.FC<{t: number; t0: number; t1: number; frame: string; item: 'you' | 'ratRabbit'}> = ({t, t0, t1, frame, item}) => { const g = 940, h = 600;
	reg({frame, who: 'giver', x: 560, ground: g, h, pose: giverP, intent: 'stand'}); reg({frame, who: 'taker', x: 1360, ground: g, h, pose: takerP, flip: true, intent: 'stand'});
	return <Cam z={1 + 0.04 * seg(t, t0, t1)}>
		<rect width={W} height={H} fill="#E9DFC8" />{hatchOver(0, 0, W, 760, 'h45d', 0.1)}
		{[200, 760, 1320].map((x) => <rect key={x} x={x} y={120} width={400} height={520} fill="none" stroke="#C2B7A2" strokeWidth={4} />)}
		<rect x={0} y={760} width={W} height={320} fill="url(#pave)" />
		<path d="M920,0 L1000,0 L1160,880 L760,880 Z" fill="#FFF8E8" opacity={0.25} />
		<Shadow x={960} y={944} rx={180} ry={14} /><rect x={820} y={700} width={280} height={240} fill="url(#mbV)" stroke="#2B2722" strokeWidth={2} />
		<rect x={800} y={686} width={320} height={18} fill="#6E4249" stroke="#2B2722" strokeWidth={1.5} />
		{item === 'you' ? <HorseHead x={960} y={614} s={0.25} id={`${frame}h`} glow={1} /> : <><ZHead3 z="鼠" x={910} y={652} s={1.0} /><ZHead3 z="兔" x={1010} y={648} s={1.0} flip /></>}
		<Shadow x={560} y={g + 4} rx={110} ry={12} /><Shadow x={1360} y={g + 4} rx={110} ry={12} />
		<Rimmed x={560} ground={g} h={h} pose={giverP} look={LK.auct} col={FIG} rim={RIM} rimOp={0.4} />
		<Rimmed x={1360} ground={g} h={h} pose={takerP} look={{dress: 'jacket', head: 'glasses'} as Look4} flip col={FIG} rim={RIM} rimOp={0.4} />
	</Cam>; };
export const F_D14: React.FC<{t: number}> = ({t}) => <Handover t={t} t0={TL.D14} t1={TL.E1} frame="D14" item="ratRabbit" />;
/* E1: on show in Hong Kong and Macau — a wide hall at true scale (head ≈ ¼ of a person), visitors walk past */
export const F_E1: React.FC<{t: number}> = ({t}) => { const FL = 960, PH = 600;
	return <Cam z={1 + 0.03 * seg(t, TL.E1, TL.E2)}>
		<rect width={W} height={H} fill="#24394A" />{Array.from({length: 7}, (_, i) => <rect key={i} x={i * 300 + 40} y={0} width={3} height={FL} fill="#3C5668" opacity={0.6} />)}
		<rect x={0} y={FL} width={W} height={H - FL} fill="#1B2A33" /><rect x={0} y={FL} width={W} height={3} fill="#4C6670" />
		<path d={`M880,0 L1040,0 L1220,${FL} L700,${FL} Z`} fill="#FFF4E0" opacity={0.12} />
		<Shadow x={960} y={FL + 4} rx={170} ry={14} o={0.5} />
		<rect x={860} y={FL - 330} width={200} height={330} fill="url(#mbV)" stroke="#2B2722" strokeWidth={1.5} />
		<HorseHead x={958} y={FL - 330 - 0.24 * 276} s={0.24} id="e1h" glow={1} />
		<rect x={846} y={FL - 520} width={228} height={190} fill="#CFE6EE" opacity={0.08} stroke="#BFD9DE" strokeOpacity={0.5} strokeWidth={2} />
		{[0, 1, 2].map((i) => { const h = PH * (0.94 + 0.06 * i), sp = 0.7 + 0.12 * i, dir = i === 1 ? -1 : 1, span = W + 700, d = ((t - TL.E1) * 170 * sp + i * 640) % span, x = dir > 0 ? -300 + d : W + 300 - d, p = walkArms(phaseFor(d / h));
			reg({frame: 'E1', who: `visitor${i}`, x, ground: FL + 40 + i * 30, h, pose: p, flip: dir < 0, intent: 'walk'});
			return <g key={i}><Shadow x={x} y={FL + 44 + i * 30} rx={h * 0.14} ry={10} o={0.4} /><Rimmed x={x} ground={FL + 40 + i * 30} h={h} pose={p} flip={dir < 0} look={([{dress: 'jacket', head: 'short'}, {dress: 'dress', head: 'bob'}, {dress: 'coat', head: 'glasses'}] as Look4[])[i]} col={FIG} rim={RIM} rimOp={0.35} /></g>; })}
	</Cam>; };
/* E2: 2019, given to the state */
export const F_E2: React.FC<{t: number}> = ({t}) => <Handover t={t} t0={TL.E2} t1={TL.E3} frame="E2" item="you" />;
/* E3–E4: the empty chair; the lamp goes out; a far copper glint in the window */
export const F_E3: React.FC<{t: number}> = ({t}) => { const lamp = 1 - easeOut(seg(t, bt(181.5), bt(182))), z = 1 + 0.22 * ease(seg(t, TL.E3, TL.H1a));
	return <Cam z={z} x={lerp(900, 1380, ease(seg(t, TL.E4, TL.H1a)))} y={lerp(560, 520, seg(t, TL.E3, TL.H1a))}>
		<rect width={W} height={H} fill="#46605A" />{hatchOver(0, 0, W, 820, 'h45d', 0.15)}
		<rect x={1180} y={180} width={460} height={560} fill="#1E2A44" stroke="#E9DFC8" strokeWidth={4} />
		{Array.from({length: 30}, (_, i) => <circle key={i} cx={1190 + rnd(i, 2) * 440} cy={190 + rnd(i, 3) * 540} r={1 + rnd(i, 4) * 1.5} fill="#EAF0FF" opacity={0.5} />)}
		<line x1={1410} y1={180} x2={1410} y2={740} stroke="#E9DFC8" strokeWidth={4} /><line x1={1180} y1={460} x2={1640} y2={460} stroke="#E9DFC8" strokeWidth={4} />
		<Glow x={1520} y={600} r={50 + 20 * Math.sin(t * 2.2) ** 2} c={CU.halo} o={0.6} id="e3g" /><circle cx={1520} cy={600} r={5} fill={CU.core} />
		<rect x={0} y={820} width={W} height={260} fill="#4E3828" />
		<Shadow x={850} y={832} rx={260} ry={18} />
		<path d="M640,820 L640,560 C640,500 700,470 760,470 L940,470 C1000,470 1060,500 1060,560 L1060,820 Z" fill="#6E8C7C" stroke="#2B2722" strokeWidth={2} />{hatchOver(640, 470, 420, 350, 'h45d', 0.3)}
		<rect x={600} y={640} width={110} height={190} rx={30} fill="#7E9C8A" stroke="#2B2722" strokeWidth={2} /><rect x={990} y={640} width={110} height={190} rx={30} fill="#7E9C8A" stroke="#2B2722" strokeWidth={2} />
		<rect x={690} y={680} width={320} height={80} rx={18} fill="#8CAA96" stroke="#2B2722" strokeWidth={2} />
		<rect x={340} y={600} width={200} height={14} fill="#7B5A42" stroke="#2B2722" strokeWidth={1.5} /><rect x={360} y={614} width={14} height={206} fill="#7B5A42" /><rect x={506} y={614} width={14} height={206} fill="#7B5A42" />
		<path d="M380,520 L500,520 L470,450 L410,450 Z" fill="#E9DFC8" stroke="#2B2722" strokeWidth={2} /><rect x={437} y={520} width={6} height={80} fill="#4E3828" /><rect x={410} y={594} width={60} height={8} fill="#4E3828" />
		<Glow x={440} y={500} r={360} c="#FFE2B0" o={0.45 * lamp} id="e3l" />
		<rect width={W} height={H} fill="#0C141A" opacity={0.25 * (1 - lamp)} />
	</Cam>; };
/* H1a: a night road; a truck brings you back (lead-in, filtered music) */
export const F_H1a: React.FC<{t: number}> = ({t}) => { const u = seg(t, TL.H1a, TL.H1b), x = lerp(-360, 1120, ease(u)), dawn = seg(t, TL.H1a + 3, TL.H1b);
	return <g>
		<Sky3 id="h1s" top={dawn > 0 ? '#2B3A5C' : '#1E2A44'} bot={lerp(0, 1, dawn) > 0.5 ? '#C9A88E' : '#41506C'} clouds={0} />
		<rect x={0} y={0} width={W} height={H} fill="#E8B48C" opacity={0.18 * dawn} />
		{Array.from({length: 7}, (_, i) => <Tree3 key={i} x={120 + i * 300} g={700} h={260 + 60 * rnd(i, 4)} seed={i + 11} hue={i % 2 ? 'pine' : 'round'} />)}
		<rect x={0} y={690} width={W} height={H - 690} fill="#3A3E42" /><rect x={0} y={760} width={W} height={60} fill="#2C3034" />
		{Array.from({length: 12}, (_, i) => <rect key={i} x={((i * 220 - t * 400) % 2640 + 2640) % 2640 - 360} y={786} width={120} height={8} fill="#D8D0B0" opacity={0.6} />)}
		<g transform={`translate(${x},0)`}>
			<Shadow x={170} y={824} rx={200} ry={12} o={0.5} />
			<rect x={0} y={630} width={250} height={170} rx={6} fill="#56687A" stroke="#1B2329" strokeWidth={2} /><rect x={250} y={680} width={100} height={120} rx={10} fill="#46586A" stroke="#1B2329" strokeWidth={2} /><rect x={270} y={694} width={64} height={46} rx={6} fill="#9FB8C8" />
			{[60, 200, 300].map((wx) => <g key={wx}><circle cx={wx} cy={808} r={26} fill="#15191C" /><circle cx={wx} cy={808} r={11} fill="#5A6066" /></g>)}
			<path d="M350,740 L700,700 L700,800 L350,770 Z" fill="#FFF2C8" opacity={0.18} />
			<Glow x={125} y={715} r={70} c={CU.halo} o={0.35} id="h1g" />
			<text x={125} y={730} textAnchor="middle" style={{fontFamily: SANS, fontSize: 28, fontWeight: 900}} fill="#E9DFC8" opacity={0.85}>小心轻放</text>
		</g>
	</g>; };
/* H1b–H2: the pavilion lights up on the drop; 1860 → 2020 */
export const F_H1b: React.FC<{t: number}> = ({t}) => <S6 t={T45.c6 + Math.min(1.9, (t - TL.H1b) * 0.9)} />;
/* H3–H4: seven back in China; only you back here (the twist on the coda cut) */
const Twist: React.FC<{t: number}> = ({t}) => { const split = easeOut(seg(t, TL.H4, TL.H4 + 0.9));
	return <g>
		<Sky3 id="h4s" top="#7FA7C2" bot="#E3ECE8" seed={6} />
		<rect x={0} y={700} width={W} height={H - 700} fill="#8FA67E" /><rect x={0} y={700} width={W} height={3} fill="#2B2722" opacity={0.5} />
		{[[1330, 380, 170, 320, '保利艺术博物馆', 4], [1580, 420, 220, 280, '国家博物馆', 2]].map(([x, y, w, h, name, n], i) => <g key={i} opacity={split}>
			<Shadow x={(x as number) + (w as number) / 2} y={702} rx={(w as number) * 0.6} ry={10} />
			<rect x={x as number} y={y as number} width={w as number} height={h as number} fill="url(#mbH)" stroke="#2B2722" strokeWidth={2} />
			{Array.from({length: 4}, (_, j) => <rect key={j} x={(x as number) + 16} y={(y as number) + 100 + j * 46} width={(w as number) - 32} height={8} fill="#B5A98F" />)}
			{Array.from({length: n as number}, (_, j) => <circle key={j} cx={(x as number) + 30 + j * 36} cy={(y as number) + 60} r={11} fill="#B08463" stroke="#2B2722" strokeWidth={2} />)}
			<text x={(x as number) + (w as number) / 2} y={(y as number) + (h as number) + 44} textAnchor="middle" style={{fontFamily: SANS, fontSize: 30, fontWeight: 900}} fill="#2B2722">{name as string}</text></g>)}
		<path d="M150,700 L150,520 C150,470 190,440 230,440 C270,440 310,470 310,520 L310,560 L280,560 L280,526 C280,494 260,476 230,476 C200,476 180,494 180,526 L180,700 Z M330,700 L330,600 L370,580 L390,610 L410,590 L430,700 Z" fill="#BFB6A3" stroke="#2B2722" strokeWidth={1.5} />
		<Tree3 x={90} g={700} h={380} seed={3} /><Tree3 x={1840} g={700} h={360} seed={5} hue="willow" />
		<Shadow x={960} y={704} rx={220} ry={14} />
		<path d="M780,440 L960,330 L1140,440 Z" fill="#4F6B62" stroke="#2B2722" strokeWidth={2.5} />
		<path d="M800,440 L1120,440 L1100,470 L820,470 Z" fill="#8A5A3C" stroke="#2B2722" strokeWidth={2} />
		{[830, 1090].map((x) => <rect key={x} x={x - 12} y={470} width={24} height={230} fill="#8A5A3C" stroke="#2B2722" strokeWidth={2} />)}
		<rect x={860} y={600} width={200} height={100} fill="url(#mbV)" stroke="#2B2722" strokeWidth={2} />
		<HorseHead x={960} y={548} s={0.14} id="h4h" glow={1} />
		{/* the six lights: around you before the cut, drifting off to the city after it */}
		{Array.from({length: 6}, (_, i) => { const a = (i / 6) * Math.PI * 2 + (Math.min(t, TL.H4) - TL.H3) * 0.9, x0 = 960 + Math.cos(a) * 160, y0 = 520 + Math.sin(a) * 70, tx = i < 4 ? 1360 + i * 36 : 1610 + (i - 4) * 36, ty = i < 4 ? 440 : 480;
			return <circle key={i} cx={lerp(x0, tx, split)} cy={lerp(y0, ty, split) - Math.sin(split * Math.PI) * 60} r={11} fill="#B08463" stroke="#2B2722" strokeWidth={2} opacity={1 - 0.2 * split} />; })}
	</g>; };
export const F_H3: React.FC<{t: number}> = ({t}) => <Cam z={1.0 + 0.08 * ease(seg(t, TL.H3, TL.H4)) - 0.08 * ease(seg(t, TL.H4, TL.H4 + 1.2))}><Twist t={t} /></Cam>;
/* H5: the temple that the fire missed */
export const F_H5: React.FC<{t: number}> = ({t}) => { const ghost = seg(t, TL.H5 + 0.4, TL.H5 + 2.2);
	return <Cam z={1.05 - 0.05 * seg(t, TL.H5, TL.H7)}>
		<Sky3 id="h5s" top="#B7A28C" bot="#E8DCC6" clouds={2} seed={9} />
		<rect x={0} y={720} width={W} height={H - 720} fill="#CDBE9C" />
		{[[120, 760], [340, 760], [1500, 760], [1700, 760]].map(([x, g], i) => <path key={i} d={`M${x - 70},${g} L${x - 70},${g - 120 - 40 * rnd(i, 2)} L${x - 30},${g - 150} L${x + 10},${g - 90} L${x + 60},${g - 130 - 30 * rnd(i, 3)} L${x + 70},${g} Z`} fill="#BFB6A3" stroke="#2B2722" strokeWidth={1.5} />)}
		{/* the temple wall + gate (正觉寺), intact */}
		<rect x={560} y={500} width={800} height={240} fill="#8E4A3E" opacity={0.92} /><rect x={560} y={480} width={800} height={24} fill="#4F6B62" />
		<rect x={860} y={420} width={200} height={320} fill="#8E4A3E" /><path d="M820,440 L960,370 L1100,440 Z" fill="#4F6B62" stroke="#2B2722" strokeWidth={2} />
		<rect x={910} y={560} width={100} height={180} fill="#3A2A20" />
		{/* the 1860 fire as a ghost layer, stopping at the wall */}
		{[0, 1, 2, 3].map((i) => { const side = i < 2 ? -1 : 1, x = 960 + side * (520 + i % 2 * 160); return <g key={i} opacity={0.5 * (1 - ghost)}><path d={`M${x - 60},740 C${x - 50},640 ${x - 10},620 ${x},540 C${x + 20},620 ${x + 50},640 ${x + 60},740 Z`} fill="#FF9A50" filter="url(#soft6)" /></g>; })}
		<Glow x={960} y={660} r={120} c={CU.halo} o={0.5} id="h5g" />
	</Cam>; };
/* H7–H8: the curled ear */
export const F_H7: React.FC<{t: number}> = ({t}) => { const ring = easeOut(seg(t, TL.H8, TL.H8 + 0.6)), z = lerp(1.0, 1.25, ease(seg(t, TL.H7, TL.H8)));
	return <Cam z={z} x={1220} y={420}>
		<rect width={W} height={H} fill="#24343C" />{hatchOver(0, 0, W, H, 'hzInk', 0.12)}
		<HorseHead x={1170} y={640} s={1.12} id="h7h" glow={0.7} curl={1} lx={-500} ly={-700} />
		{ring > 0 && <g opacity={ring}><circle cx={1240} cy={260} r={90 + 20 * (1 - ring)} fill="none" stroke="#9FE6D8" strokeWidth={5} /><circle cx={1240} cy={260} r={104 + 20 * (1 - ring)} fill="none" stroke="#9FE6D8" strokeWidth={1.5} opacity={0.6} /></g>}
	</Cam>; };
/* K1–K4: noon again — a memory of twelve; the eleven fade */
export const F_K1: React.FC<{t: number}> = ({t}) => { const gone = t >= TL.K2, five = t >= TL.K4;
	const MISSING = new Set<Z>(['龙', '蛇', '羊', '鸡', '狗']);
	return <Cam z={1.06 - 0.06 * seg(t, TL.K1, TL.K5)}><Garden3 t={t} id="gk1" dim={0.35} present={gone ? new Set<Z>() : 'all'} ghost={five} ghostSet={MISSING} arcs={gone ? 'one' : 'memory'} active="马" grow={1} />
		{!gone && <rect width={W} height={H} fill="#E3ECE8" opacity={0.12} />}</Cam>; };
/* K5: France 2018, a "dragon" outline under the hammer, on the final hit */
export const F_K5: React.FC<{t: number}> = ({t}) => { const k = ease(seg(t, TL.K5 - 0.08, TL.K5));
	return <Cam z={1.02 + 0.16 * ease(seg(t, TL.K5 + 0.3, TL.Q))} x={lerp(900, 820, seg(t, TL.K5, TL.Q))} y={lerp(540, 560, seg(t, TL.K5, TL.Q))}><AuctionRoom hammer="held" k={k} wall="#5C5F7A" frame="K5" plinthX={800} />
		<ZHead3 z="龙" x={800} y={600} s={2.0} ghost="#E9DFC8" />
		<text x={800} y={560} textAnchor="middle" style={{fontFamily: SANS, fontSize: 96, fontWeight: 900}} fill="#E9DFC8" opacity={0.8}>?</text>
		<Bidders frame="K5" up={[]} xs={[110, 330]} /></Cam>; };
/* Q: the end card, built from the film's own water clock */
export const F_Q: React.FC<{t: number}> = ({t}) => { const a = TL.Q, rise = easeOut(seg(t, a, a + 1.2)), pill = easeOut(seg(t, a + 1.0, a + 1.4));
	return <g>
		<Sky3 id="qs" top="#22374A" bot="#4E6A78" clouds={0} />
		{Array.from({length: 12}, (_, i) => <WaterArc3 key={i} x0={420 + i * 98} y0={860} x1={960} y1={780} h={(220 + 30 * Math.sin(i)) * rise} o={(i === 6 ? 0.95 : 0.2) * rise} w={i === 6 ? 6 : 3} />)}
		<HorseHead x={1520} y={360} s={0.22} id="qh" glow={0.8} />
		{pill > 0 && <g transform={`translate(960,980) scale(${pill})`}><rect x={-260} y={-34} width={520} height={68} rx={34} fill="#0E1A20" opacity={0.6} stroke="#9FE6D8" strokeWidth={2} />
			<circle cx={-218} cy={0} r={20} fill="#9FE6D8" /><path d="M-228,0 h20 M-218,-10 v20" stroke="#0E1A20" strokeWidth={4} />
			<text x={18} y={11} textAnchor="middle" style={{fontFamily: SANS, fontSize: 30, fontWeight: 700}} fill="#F3F6F2">关注 Juno · 一起看懂世界</text></g>}
	</g>; };

/* ================= the scene table ================= */
type Sc = [number, React.FC<{t: number}>];
export const SCENES45: Sc[] = [
	[0, F_S1], [T45.c2, S2], [T45.c3, S3], [T45.c4, S4], [T45.c5, S5], [T45.c6, S6], [T45.c7, S7], [T45.rew, Rewind], [T45.title, S8],
	[TL.A1, S9], [TL.A3, F_A3], [TL.A7, F_A7], [TL.B1, F_B1], [TL.B2, F_B2], [TL.B4, F_B4],
	[TL.D1, F_D1], [TL.D2, F_D2], [TL.D3, F_D3], [TL.D5, F_D5], [TL.D6, F_D6], [TL.D8, F_D8], [TL.D10, F_D10], [TL.D11, F_D11], [TL.D14, F_D14],
	[TL.E1, F_E1], [TL.E2, F_E2], [TL.E3, F_E3], [TL.H1a, F_H1a], [TL.H1b, F_H1b], [TL.H3, F_H3], [TL.H5, F_H5], [TL.H7, F_H7],
	[TL.K1, F_K1], [TL.K5, F_K5], [TL.Q, F_Q],
];
export const sceneAt = (t: number) => { let i = 0; while (i + 1 < SCENES45.length && t >= SCENES45[i + 1][0]) i++; return SCENES45[i][1]; };
export const Film45: React.FC<{t: number}> = ({t}) => { const S = sceneAt(t); return <><QDefs /><S t={t} /></>; };
void H; void StoneBody3; void WaterArc3; void seated; void RETURNED; void ALLZ; void Tree3;
