import React from 'react';
import {W, H, rnd, lerp, Glow, CU, T, HorseHead, ZODIAC, RETURNED, Z} from './kit45';
import {QDefs, Shadow, Sky3, Tree3, Haiyantang3, Pool3, StoneBody3, ZHead3, WaterArc3, ZPos3, Courtyard, Fire, Embers, SmokeCols, Kepi} from './sets45';
import {AuctionRoom, Bidders, LK, FIG, RIM, hatchOver} from './frames45';
import {S2, S3, S4, S5, S6, S7, S8, S9, Rewind, seg, ease, easeOut, T45, PrivateRoom, Unveil} from './demo45';
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
const easeIn = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * x; };
/** whip-pan streaks (drawn over a scene, outside its camera) */
const Streaks: React.FC<{u: number}> = ({u}) => u <= 0.01 ? null : <g opacity={u}>{Array.from({length: 30}, (_, i) => <rect key={i} x={0} y={rnd(i, 41) * H} width={W} height={2 + 7 * rnd(i, 42)} fill="#E9DFC8" opacity={0.2 + 0.35 * rnd(i, 43)} />)}<rect width={W} height={H} fill="#E9DFC8" opacity={0.18 * u} /></g>;
/** a push-in on a point during [a, b] (z → zt) */
const push = (t: number, a: number, b: number) => ease(seg(t, a, b));
/** camera: centre (x, y), zoom z; clamped so the view never leaves the 1920×1080 set (zoom ≥ 1) */
const Cam: React.FC<{x?: number; y?: number; z?: number; children: React.ReactNode; free?: boolean}> = ({x = 960, y = 540, z = 1, children, free}) => {
	const zz = free ? z : Math.max(1, z), hw = 960 / zz, hh = 540 / zz, cx = free ? x : Math.min(W - hw, Math.max(hw, x)), cy = free ? y : Math.min(H - hh, Math.max(hh, y));
	return <g transform={`translate(960,540) scale(${zz}) translate(${-cx},${-cy})`}>{children}</g>; };
const ALLZ = new Set<Z>(ZODIAC);

/* ================= museum case (hook, E1) ================= */
const Museum: React.FC<{t: number; on: number; id: string; z?: number; visitors?: boolean}> = ({t, on, id, z = 1, visitors}) => <Cam z={z} x={1120} y={600} free>
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
		return <Rimmed key={i} x={x} ground={1060} h={h} pose={p} look={([{dress: 'shirt', head: 'short'}, {dress: 'dress', head: 'bob'}, {dress: 'coat', head: 'glasses'}] as Look4[])[i]} col={FIG} rim={RIM} rimOp={0.35} />; })}
</Cam>;
export const F_S1: React.FC<{t: number}> = ({t}) => { const on = t < 0.5688 ? 0.15 : 0.15 + 0.85 * easeOut(seg(t, 0.5688, 0.5688 + 0.12)); return <Museum t={t} on={on} id="m1" z={1 + 0.05 * ease(seg(t, 0, T45.c2))} />; };


/* ================= the garden of 海晏堂 ================= */
const Garden3: React.FC<{t: number; id: string; present?: Set<Z> | 'all'; ghost?: boolean; ghostSet?: Set<Z>; arcs?: 'none' | 'all' | 'memory' | 'one'; active?: Z; grow?: number; smoke?: number; fire?: number; dim?: number; label?: number; youOn?: boolean; rip?: number}> =
	({t, id, present = 'all', ghost, ghostSet, arcs = 'none', active, grow = 1, smoke = 0, fire = 0, dim = 0, label = 0, youOn = true, rip}) => { const sk = Math.min(1, smoke * 2.5);
	return <g>
		<Sky3 id={`${id}s`} top="#7FA7C2" bot="#E3ECE8" seed={4} clouds={5} />
		{sk > 0 && <g opacity={sk}><Sky3 id={`${id}k`} top="#5B5048" bot="#B49C80" seed={4} clouds={0} /></g>}
		{smoke > 0 && [260, 760, 1260, 1720].map((x, i) => <g key={i} opacity={smoke}>{Array.from({length: 7}, (_, j) => <ellipse key={j} cx={x + Math.sin(j * 1.3 + i) * 60 + j * 22 + t * 12} cy={560 - j * 90 - (t % 20) * 4} rx={130 + j * 26} ry={80 + j * 12} fill={j < 2 ? '#5E5046' : '#8A7C6C'} opacity={0.8 - j * 0.07} filter="url(#soft6)" />)}</g>)}
		<Fire t={t} x0={420} x1={1500} y={420} hgt={330} k={fire} />
		<Tree3 x={170} g={575} h={360} seed={7} hue="pine" /><Tree3 x={1760} g={575} h={340} seed={8} hue="pine" />
		<Tree3 x={330} g={590} h={430} seed={2} hue="willow" /><Tree3 x={1610} g={590} h={420} seed={3} hue="round" />
		<rect x={0} y={575} width={W} height={H - 575} fill="url(#pave)" />
		{Array.from({length: 24}, (_, i) => <line key={i} x1={960} y1={560} x2={-600 + i * 130} y2={H} stroke="#8D7D5F" strokeWidth={1} opacity={0.35} />)}
		{Array.from({length: 12}, (_, i) => { const y = 580 + Math.pow(i / 11, 1.6) * 500; return <line key={i} x1={0} y1={y} x2={W} y2={y} stroke="#8D7D5F" strokeWidth={1} opacity={0.3} />; })}
		<Haiyantang3 cx={960} g={575} k={0.8} />
		{fire > 0 && <rect x={0} y={0} width={W} height={600} fill="#FF8A40" opacity={0.16 * fire * (0.7 + 0.3 * Math.sin(t * 17))} style={{mixBlendMode: 'multiply'}} />}
		{dim > 0 && <rect x={0} y={0} width={W} height={600} fill="#E3ECE8" opacity={dim} />}
		<Pool3 cx={960} g={575} k={1.22} present={present} ghost={ghost} ghostSet={ghostSet} arcs={arcs} active={active} grow={grow} id={`${id}p`} youGlow={0.9} you={youOn} rip={rip} />
		{label > 0 && <g opacity={label}><rect x={820} y={952} width={280} height={84} rx={6} fill="#F1EADC" stroke="#2B2722" strokeWidth={2.5} /><text x={960} y={1010} textAnchor="middle" style={{fontFamily: SANS, fontSize: 46, fontWeight: 900, letterSpacing: '0.2em'}} fill="#2B2722">水力钟</text></g>}
		{smoke > 0 && <rect x={0} y={0} width={W} height={H} fill="#6A4A30" opacity={0.12 * smoke} />}
	</g>; };
const youPos = () => ZPos3(960, 575, 1.22).find((p) => p.z === '马')!;
/** the hour the water clock shows, 0 = 子 … 6 = 午 */
export const hourAt = (t: number) => t < TL.A4 ? 0 : t < TL.A6 ? 5.2 * Math.pow(seg(t, TL.A4, TL.A6), 1.5) : 5.2 + 0.8 * easeOut(seg(t, TL.A6, TL.A6 + 1.2));
/* A3–A6: push out from you, the hours go round, the needle reaches 午; the arcs ripple out from you into noon */
export const F_A3: React.FC<{t: number}> = ({t}) => {
	const u = ease(seg(t, TL.A3, TL.A3 + 1.6)), y = youPos(), zA6 = ease(seg(t, TL.A6, TL.A6 + 1.4)), ripA = TL.A7 - 2 * P_;
	const z = lerp(3.0, 1.0, u) * (1 + 0.6 * zA6) * (1 - 0.25 * ease(seg(t, ripA, TL.A7))), cx = lerp(lerp(y.x, 960, u), y.x - 60, zA6), cy = lerp(lerp(y.y - 80, 540, u), y.y - 120, zA6);
	const h = hourAt(t), act = t >= TL.A4 ? ZODIAC[Math.floor(h + 0.001) % 12] : undefined, grow = t >= TL.A4 ? (t >= TL.A6 + 1.0 ? 1 : 0.25 + 0.75 * Math.sin(Math.PI * Math.min(0.999, h % 1))) : 0;
	const label = t >= TL.A4 ? easeOut(seg(t, TL.A4, TL.A4 + 0.4)) * (1 - seg(t, TL.A6 - 0.35, TL.A6)) : 0;
	return <Cam z={z} x={cx} y={cy}><Garden3 t={t} id="ga3" arcs={t >= ripA ? 'all' : act ? 'one' : 'none'} active={act} grow={Math.max(0.2, grow)} label={label} rip={t >= ripA ? seg(t, ripA, TL.A7) : undefined} /></Cam>;
};
/* A7: noon — all twelve at full height on the section downbeat */
export const F_A7: React.FC<{t: number}> = ({t}) => { const z = 1.08 - 0.08 * ease(seg(t, TL.A7, TL.A7 + 1.2)) + 0.03 * seg(t, TL.A7 + 1.2, TL.B1);
	return <Cam z={z}><Garden3 t={t} id="ga7" arcs="all" grow={1 + 0.05 * Math.sin((t - TL.A7) * 11)} /></Cam>; };

/* ================= 1860 ================= */
/** soldiers walking left→right (kepi, short hair); carry: crate / vase / none */
const March: React.FC<{t: number; t0: number; frame: string; carry?: boolean; g?: number; h?: number; xs?: number[]; speed?: number}> = ({t, t0, frame, carry, g = 860, h = 430, xs = [-200, 240, 680], speed = 150}) => <g>
	{xs.map((x0, i) => { const x = x0 + (t - t0) * speed, kind = !carry ? 'none' : i === 1 ? 'vase' : 'crate', k = h / 520;
		const arms = kind === 'crate' ? {la: 34, le: 58, ra: 40, re: 52} : kind === 'vase' ? {la: 24, le: 64, ra: 28, re: 60} : undefined;
		const p = walkArms(phaseFor((x - x0 + i * 40) / h), arms), l = jointAt(p, 'LHand', x, g, h), r = jointAt(p, 'RHand', x, g, h), hx = (l[0] + r[0]) / 2, hy = Math.min(l[1], r[1]);
		reg({frame, who: `soldier${i}`, x, ground: g, h, pose: p, intent: 'walk'});
		return <g key={i}><Shadow x={x} y={g + 4} rx={h * 0.16} ry={10} o={0.35} /><Rimmed x={x} ground={g} h={h} pose={p} look={{dress: 'coat', head: 'short'} as Look4} col={FIG} rim={RIM} rimOp={0.4} /><Kepi pose={p} x={x} g={g} h={h} />
			{kind === 'crate' && <g transform={`translate(${hx},${hy}) scale(${k})`}><rect x={-30} y={-86} width={118} height={88} fill="#7B5A42" stroke="#2B2722" strokeWidth={2} /><rect x={-30} y={-48} width={118} height={7} fill="#4E3828" /></g>}
			{kind === 'vase' && <g transform={`translate(${hx},${hy}) scale(${k})`}><path d="M6,-116 L34,-116 C28,-98 76,-68 66,-10 C58,28 38,40 20,40 C2,40 -18,28 -26,-10 C-36,-68 12,-98 6,-116 Z" fill="#DCE6EE" stroke="#2B2722" strokeWidth={2} /><path d="M-16,-40 C10,-20 40,-50 60,-30" stroke="#3E5E8A" strokeWidth={5} fill="none" /></g>}
		</g>; })}
</g>;
export const F_B1: React.FC<{t: number}> = ({t}) => <g><Garden3 t={t} id="gb1" smoke={0.25 * seg(t, TL.B1 + 1.2, TL.B2)} /><March t={t} t0={TL.B1} frame="B1" xs={[-160, 160, 480]} speed={170} /></g>;
export const F_B2: React.FC<{t: number}> = ({t}) => { const fire = easeOut(seg(t, bt(79), bt(80)));   // 一把火, on the beat
	return <g><Garden3 t={t} id="gb2" smoke={0.35 + 0.65 * fire} fire={fire} /><March t={t} t0={TL.B2} frame="B2" carry xs={[620, 1020, 1420]} speed={120} /><Embers t={t} k={fire} /></g>; };
/* B4: you go first, then every seat empties in step with the counter; the camera rises into the smoke */
export const B4_ORDER: Z[] = ['马', ...ZODIAC.filter((z) => z !== '马')];
export const b4Gone = (t: number) => Math.round(12 * seg(t, TL.B4 + 0.05, TL.B4 + 2.6));
export const F_B4: React.FC<{t: number}> = ({t}) => { const y = youPos(), n = b4Gone(t), gone = new Set<Z>(B4_ORDER.slice(0, n)), out = ease(seg(t, TL.B4 + 0.35, TL.B4 + 1.6)), up = ease(seg(t, TL.D1 - 0.7, TL.D1));
	const z = lerp(1.7, 1.0, out) + 0.25 * up, cx = lerp(y.x - 80, 960, out), cy = lerp(lerp(y.y - 60, 540, out), 200, up);
	return <g><Cam z={z} x={cx} y={cy}><Garden3 t={t} id="gb4" smoke={0.7} youOn={!gone.has('马')} present={new Set<Z>(ZODIAC.filter((zz) => zz !== '马' && !gone.has(zz)))} /></Cam>
		<rect width={W} height={H} fill="#5B5048" opacity={0.92 * up} /></g>; };

/* ================= the hammer ================= */
/** 1989 London: opens by tilting down from the ceiling; a bidding war on the beat; the hammer on the music's hit (57.175) */
const HIT_D2 = 57.175;
export const F_D1: React.FC<{t: number}> = ({t}) => { const e = ease(seg(t, TL.D1, TL.D1 + 0.8)), k = t < HIT_D2 - 0.07 ? 0 : ease(seg(t, HIT_D2 - 0.07, HIT_D2)), w = seg(t, TL.D3 - 0.25, TL.D3);
	const beatI = Math.floor((t - TL.D1) / P_), up = k > 0.9 ? [2] : beatI % 2 ? [1] : [2], sh = t > HIT_D2 ? Math.exp(-(t - HIT_D2) * 12) * Math.sin((t - HIT_D2) * 70) * 8 : 0;
	return <g><Cam z={lerp(1.4, 1.05, e) + 0.3 * w * w} x={lerp(900, 1180, w * w) + sh} y={lerp(386, 540, e)}><AuctionRoom hammer="held" k={k} wall="#4F6E64" frame="D1" plinthX={860} /><HorseHead x={860} y={676 - 0.26 * 276} s={0.26} id="D1h" glow={0.9} /><Bidders frame="D1" up={up} xs={[130, 360, 580]} /></Cam><Streaks u={w} /></g>; };
/* 2000 Hong Kong: whip in; the three brothers set down one per beat; a bidding war; the hammer on 63.97; push into the tiger */
const BRO: Z[] = ['牛', '猴', '虎'];
export const F_D3: React.FC<{t: number}> = ({t}) => { const k = t < TL.D4 - 0.07 ? 0 : ease(seg(t, TL.D4 - 0.07, TL.D4)), sh = t < TL.D4 ? 0 : Math.exp(-(t - TL.D4) * 10) * Math.sin((t - TL.D4) * 80) * 8;
	const w = 1 - seg(t, TL.D3, TL.D3 + 0.3), pi = push(t, TL.D5 - 0.7, TL.D5), beatI = Math.floor((t - TL.D3) / P_);
	const up = t >= TL.D4 ? [0] : [[0], [1], [2], [0, 2], [1], [0]][beatI % 6];
	const z = (1.0 + 0.14 * ease(seg(t, TL.D3, TL.D4))) * (1 + 0.25 * w) * (1 + 1.4 * pi), x = lerp(lerp(920, 1080, ease(seg(t, TL.D3, TL.D4))) - 400 * w * w, 910, pi) + sh, y = lerp(lerp(540, 470, ease(seg(t, TL.D3, TL.D4))), 630, pi);
	return <g><Cam z={z} x={x} y={y}><AuctionRoom hammer="held" k={k} wall="#4B5A68" trim="#6D7F8E" frame="D3" screen plinthX={800} />
		{BRO.map((zz, i) => { const a = TL.D3 + 0.3 + i * P_, d = easeOut(seg(t, a, a + 0.25)); return t >= a && <g key={zz} opacity={d}><ZHead3 z={zz} x={690 + i * 110} y={642 - 50 * (1 - d)} s={0.95} flip tag /></g>; })}
		<Bidders frame="D3" up={up} xs={[110, 320, 520]} /></Cam><Streaks u={w * w} /></g>; };
/* 2003: the pig head; a handshake (no hammer); opens close on the pig (match on bronze) */
export const F_D5: React.FC<{t: number}> = ({t}) => { const g = 960, h = 600, xA = 640, pump = Math.sin((t - TL.D5) * 9) * 5 * seg(t, TL.D5 + 0.9, TL.D5 + 1.2);
	const shakeA = grounded({lean: 4, neck: 6, lt: 2, lk: 2, rt: -3, rk: 3, la: -2, le: 12, ra: 44 + pump, re: 36}), hA = jointAt(shakeA, 'RHand', xA, g, h), hB0 = jointAt(shakeA, 'RHand', 0, g, h, true), xB = hA[0] - hB0[0] + 6;
	reg({frame: 'D5', who: 'Ho', x: xA, ground: g, h, pose: shakeA, intent: 'stand'}); reg({frame: 'D5', who: 'seller', x: xB, ground: g, h, pose: shakeA, flip: true, intent: 'stand'});
	const o = ease(seg(t, TL.D5, TL.D5 + 0.9));
	return <Cam z={lerp(2.4, 1.0, o) + 0.04 * seg(t, TL.D5, TL.D6)} x={lerp(1430, 960, o)} y={lerp(680, 540, o)}>
		<rect width={W} height={H} fill="#6B5A4E" />{hatchOver(0, 0, W, 760, 'h45d', 0.12)}
		{[200, 760, 1320].map((x) => <rect key={x} x={x} y={120} width={400} height={480} fill="none" stroke="#A8927C" strokeWidth={4} />)}
		<rect x={0} y={760} width={W} height={320} fill="#4E3828" />
		<Shadow x={1430} y={964} rx={180} ry={16} /><rect x={1300} y={760} width={260} height={200} fill="#7B5A42" stroke="#2B2722" strokeWidth={2} /><rect x={1290} y={748} width={280} height={16} fill="#4E3828" />
		<ZHead3 z="猪" x={1430} y={694} s={1.5} flip tag />
		<Shadow x={(xA + xB) / 2} y={g + 4} rx={260} ry={14} />
		<Rimmed x={xA} ground={g} h={h} pose={shakeA} look={{dress: 'shirt', head: 'glasses'} as Look4} col={FIG} rim={RIM} rimOp={0.4} />
		<Rimmed x={xB} ground={g} h={h} pose={shakeA} look={{dress: 'coat', head: 'short'} as Look4} flip col={FIG} rim={RIM} rimOp={0.4} />
	</Cam>; };
/* 2007 Hong Kong: the gavel rests, paddles start to rise (D6); the gavel lifts slow→fast, trembles, paddles drop, the room dims: 撤拍 (D7); push into you */
export const F_D6: React.FC<{t: number}> = ({t}) => {
	const lift = easeIn(seg(t, TL.D7, TL.D7 + 1.1)), k = t < TL.D7 ? 1 : Math.max(0, 1 - lift + (lift > 0.99 ? 0.035 + 0.03 * Math.sin(t * 46) : 0));
	const up = t < TL.D6 + 0.8 ? [] : t < TL.D6 + 1.6 ? [0] : t < TL.D7 + 1.0 ? [0, 1] : [], dimr = seg(t, TL.D7 + 0.6, TL.D7 + 1.4), st = easeOut(seg(t, TL.D7 + 1.4, TL.D7 + 1.55)), pi = push(t, TL.D8 - 0.7, TL.D8);
	const screen = <text x={1210} y={452} textAnchor="middle" style={{fontFamily: SANS, fontSize: 52, fontWeight: 900}} fill="#E9DFC8">马首</text>;
	return <Cam z={(1.0 + 0.06 * seg(t, TL.D6, TL.D8)) * (1 + 1.5 * pi)} x={lerp(900, 800, pi)} y={lerp(540, 600, pi)}>
		<AuctionRoom hammer="held" k={k} wall="#4B5A68" trim="#6D7F8E" frame="D6" screen={screen} plinthX={800} /><HorseHead x={800} y={676 - 0.26 * 276} s={0.26} id="d6h" glow={1} /><Bidders frame="D6" up={up} xs={[110, 320, 520]} />
		<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#0C141A" opacity={0.4 * dimr} />
		<Glow x={800} y={600} r={200} c={CU.halo} o={0.3 * dimr} id="d6g" />
		{st > 0 && <g transform={`translate(1210,395) rotate(-10) scale(${1 + 0.6 * (1 - st)})`} opacity={st}><rect x={-120} y={-56} width={240} height={112} rx={10} fill="none" stroke="#C85A3C" strokeWidth={8} /><text x={0} y={26} textAnchor="middle" style={{fontFamily: SANS, fontSize: 76, fontWeight: 900, letterSpacing: '0.12em'}} fill="#C85A3C">撤拍</text></g>}
	</Cam>; };
/* D8–D9: the private room — opens close on you, Ho walks in and signs; the price card rises on the 808 (79.815) */
export const F_D8: React.FC<{t: number}> = ({t}) => { const o = ease(seg(t, TL.D8, TL.D8 + 1.0)), walk = ease(seg(t, TL.D8 + 0.4, TL.D8 + 2.9)), card = seg(t, TL.D9 - 0.12, TL.D9 + 0.2), v = Math.round(6910 * easeOut(seg(t, TL.D9 - 0.1, TL.D9 + 0.45)));
	return <Cam z={lerp(2.5, 1.04, o) + 0.08 * seg(t, TL.D9, TL.D10)} x={lerp(760, lerp(1000, 1200, seg(t, TL.D9, TL.D10)), o)} y={lerp(640, 560, o)}><PrivateRoom t={t} frame="D8" v={v} walk={walk} card={card} /></Cam>; };
/* D10: the price, twenty times over (two bars, both in US dollars) */
export const F_D10: React.FC<{t: number}> = ({t}) => { const g = easeOut(seg(t, TL.D10, TL.D10 + 1.0)), hA = 18, hB = 440 * g, br = easeOut(seg(t, TL.D10 + 1.0, TL.D10 + 1.4));
	return <g><rect width={W} height={H} fill="#2E3F4B" />{hatchOver(0, 0, W, H, 'hzInk', 0.18)}
		<rect x={520} y={900} width={880} height={4} fill="#E9DFC8" />
		<rect x={600} y={900 - hA} width={240} height={hA} fill="#B08463" /><rect x={1040} y={900 - hB} width={240} height={hB} fill={CU.mid} />
		<Glow x={1160} y={900 - hB / 2} r={260} c={CU.halo} o={0.25 * g} id="d10g" />
		<text x={720} y={968} textAnchor="middle" style={{fontFamily: SANS, fontSize: 52, fontWeight: 900}} fill="#E9DFC8">1989</text><text x={720} y={850} textAnchor="middle" style={{fontFamily: SANS, fontSize: 48, fontWeight: 900}} fill="#E9DFC8">几十万美元</text>
		<text x={1160} y={968} textAnchor="middle" style={{fontFamily: SANS, fontSize: 52, fontWeight: 900}} fill="#E9DFC8">2007</text>
		<g opacity={g}><text x={1160} y={876 - hB} textAnchor="middle" style={{fontFamily: SANS, fontSize: 52, fontWeight: 900}} fill="#E9DFC8">884万美元</text><text x={1160} y={820 - hB} textAnchor="middle" style={{fontFamily: SANS, fontSize: 36, fontWeight: 700}} fill="#E9DFC8" opacity={0.85}>≈ 6910万港元</text></g>
		{br > 0 && <g opacity={br}><path d={`M1330,${900 - hA} L1360,${900 - hA} L1360,${900 - 440} L1330,${900 - 440}`} stroke="#9FE6D8" strokeWidth={5} fill="none" /><text x={1390} y={900 - 220} style={{fontFamily: SANS, fontSize: 56, fontWeight: 900}} fill="#9FE6D8">二十多倍</text></g>}
	</g>; };
/* D11–D13: Paris 2009 — rat and rabbit; a paddle up; the hammer on the crash (88.87); the result board, 未付款 */
export const F_D11: React.FC<{t: number}> = ({t}) => { const k = t < TL.D12 - 0.07 ? 0 : ease(seg(t, TL.D12 - 0.07, TL.D12)), stamp = easeOut(seg(t, TL.D13, TL.D13 + 0.15)), sh = t < TL.D12 ? 0 : Math.exp(-(t - TL.D12) * 10) * Math.sin((t - TL.D12) * 80) * 8;
	return <Cam z={1.06 - 0.03 * seg(t, TL.D11, TL.D14)} x={900 + sh}><AuctionRoom hammer="held" k={k} wall="#6E4249" frame="D11" plinthX={800} />
		<ZHead3 z="鼠" x={720} y={626} s={1.3} flip tag /><ZHead3 z="兔" x={880} y={626} s={1.3} flip tag />
		{t >= TL.D12 && <g transform={`translate(1000,430)`}><path d="M60,140 L30,330 M500,140 L530,330 M280,140 L280,320" stroke="#4E3828" strokeWidth={10} />
			<rect x={0} y={0} width={560} height={150} fill="#E9DFC8" stroke="#2B2722" strokeWidth={2} />
			<text x={24} y={54} style={{fontFamily: SANS, fontSize: 40, fontWeight: 900}} fill="#2B2722">鼠首 · 兔首</text><text x={24} y={118} style={{fontFamily: "'DejaVu Sans',sans-serif", fontSize: 46, fontWeight: 700}} fill="#2B2722">€31,490,000</text>
			{stamp > 0 && <g transform={`translate(420,80) rotate(-12) scale(${1 + 0.6 * (1 - stamp)})`} opacity={stamp}><rect x={-120} y={-44} width={240} height={88} rx={8} fill="rgba(233,223,200,0.85)" stroke="#2E6F8A" strokeWidth={6} /><text x={0} y={20} textAnchor="middle" style={{fontFamily: SANS, fontSize: 54, fontWeight: 900, letterSpacing: '0.1em'}} fill="#2E6F8A">未付款</text></g>}</g>}
		<Bidders frame="D11" up={[0]} xs={[110, 330]} /></Cam>; };
/* D14: 2013, a certificate handed over in front of the rat and rabbit; whip out */
const reachP = (ra: number) => grounded({lean: 6, neck: 10, lt: 2, lk: 2, rt: -3, rk: 3, la: -2, le: 14, ra, re: 8});
export const F_D14: React.FC<{t: number}> = ({t}) => { const g = 940, h = 600, t0 = TL.D14, rG = lerp(30, 66, ease(seg(t, t0 + 0.2, t0 + 0.9))) - 36 * ease(seg(t, t0 + 2.0, t0 + 2.6)), rT = lerp(30, 66, ease(seg(t, t0 + 0.5, t0 + 1.1)));
	const full = reachP(66), xG = 1300, hG = jointAt(full, 'RHand', xG, g, h, true), hT0 = jointAt(full, 'RHand', 0, g, h), xT = hG[0] - hT0[0] - 6;
	const pG = reachP(rG), pT = reachP(rT), handT = jointAt(pT, 'RHand', xT, g, h), handG = jointAt(pG, 'RHand', xG, g, h, true), c = t < t0 + 1.1 ? handG : handT, w = seg(t, TL.E1 - 0.3, TL.E1);
	reg({frame: 'D14', who: 'giver', x: xG, ground: g, h, pose: pG, flip: true, intent: 'stand'}); reg({frame: 'D14', who: 'taker', x: xT, ground: g, h, pose: pT, intent: 'stand'});
	return <g><Cam z={1.02 + 0.04 * seg(t, t0, TL.E1) + 0.3 * w * w} x={960 + 300 * w * w}>
		<rect width={W} height={H} fill="#E9DFC8" />{hatchOver(0, 0, W, 760, 'h45d', 0.1)}
		{[200, 760, 1320].map((x) => <rect key={x} x={x} y={120} width={400} height={520} fill="none" stroke="#C2B7A2" strokeWidth={4} />)}
		<rect x={0} y={760} width={W} height={320} fill="url(#pave)" />
		<path d="M520,0 L600,0 L760,880 L360,880 Z" fill="#FFF8E8" opacity={0.25} />
		<Shadow x={560} y={944} rx={180} ry={14} /><rect x={420} y={700} width={280} height={240} fill="url(#mbV)" stroke="#2B2722" strokeWidth={2} />
		<rect x={400} y={686} width={320} height={18} fill="#6E4249" stroke="#2B2722" strokeWidth={1.5} />
		<ZHead3 z="鼠" x={500} y={655} s={0.85} tag /><ZHead3 z="兔" x={630} y={655} s={0.85} flip tag />
		<Shadow x={xT} y={g + 4} rx={110} ry={12} /><Shadow x={xG} y={g + 4} rx={110} ry={12} />
		<Rimmed x={xT} ground={g} h={h} pose={pT} look={{dress: 'shirt', head: 'glasses'} as Look4} col={FIG} rim={RIM} rimOp={0.4} />
		<Rimmed x={xG} ground={g} h={h} pose={pG} look={{dress: 'coat', head: 'short'} as Look4} flip col={FIG} rim={RIM} rimOp={0.4} />
		<g transform={`translate(${c[0]},${c[1] - 30})`}><rect x={-56} y={-40} width={112} height={78} fill="#F6F0E2" stroke="#2B2722" strokeWidth={2} /><circle cx={30} cy={18} r={11} fill="#B8452E" /><rect x={-44} y={-26} width={70} height={5} fill="#8E8675" /><rect x={-44} y={-12} width={56} height={5} fill="#8E8675" /></g>
	</Cam><Streaks u={w * w} /></g>; };
/* E1: on show in Hong Kong and Macau — a visitor stops to look; two walk past, well apart */
export const F_E1: React.FC<{t: number}> = ({t}) => { const FL = 960, w = 1 - seg(t, TL.E1, TL.E1 + 0.3), sway = Math.sin((t - TL.E1) * 1.6) * 1.5;
	const pS = grounded({lean: 6 + sway, neck: 18, lt: 2, lk: 2, rt: -4, rk: 4, la: 10, le: 40, ra: 6, re: 20});
	reg({frame: 'E1', who: 'looker', x: 620, ground: FL + 50, h: 590, pose: pS, intent: 'stand'});
	return <g><Cam z={(1 + 0.03 * seg(t, TL.E1, TL.E2)) * (1 + 0.3 * w * w)} x={960 - 300 * w * w}>
		<rect width={W} height={H} fill="#24394A" />{Array.from({length: 7}, (_, i) => <rect key={i} x={i * 300 + 40} y={0} width={3} height={FL} fill="#3C5668" opacity={0.6} />)}
		<rect x={0} y={FL} width={W} height={H - FL} fill="#1B2A33" /><rect x={0} y={FL} width={W} height={3} fill="#4C6670" />
		<path d={`M880,0 L1040,0 L1220,${FL} L700,${FL} Z`} fill="#FFF4E0" opacity={0.12} />
		<Shadow x={960} y={FL + 4} rx={170} ry={14} o={0.5} />
		<rect x={860} y={FL - 330} width={200} height={330} fill="url(#mbV)" stroke="#2B2722" strokeWidth={1.5} />
		<HorseHead x={958} y={FL - 330 - 0.24 * 276} s={0.24} id="e1h" glow={1} />
		<rect x={846} y={FL - 520} width={228} height={190} fill="#CFE6EE" opacity={0.08} stroke="#BFD9DE" strokeOpacity={0.5} strokeWidth={2} />
		<Shadow x={620} y={FL + 54} rx={90} ry={10} o={0.4} /><Rimmed x={620} ground={FL + 50} h={590} pose={pS} look={{dress: 'coat', head: 'glasses'} as Look4} col={FIG} rim={RIM} rimOp={0.35} />
		{[0, 1].map((i) => { const h = 600 + 20 * i, x = (i ? 1180 : -380) + (t - TL.E1) * 150, p = walkArms(phaseFor((x + 400) / h)), gr = FL + 30 + i * 50;
			reg({frame: 'E1', who: `visitor${i}`, x, ground: gr, h, pose: p, intent: 'walk'});
			return <g key={i}><Shadow x={x} y={gr + 4} rx={h * 0.14} ry={10} o={0.4} /><Rimmed x={x} ground={gr} h={h} pose={p} look={([{dress: 'shirt', head: 'short'}, {dress: 'dress', head: 'bob'}] as Look4[])[i]} col={FIG} rim={RIM} rimOp={0.35} /></g>; })}
	</Cam><Streaks u={w * w} /></g>; };
/* E2: 2019, the cloth comes off — given to the state; the room dims to the spotlight */
export const F_E2: React.FC<{t: number}> = ({t}) => <Cam z={1.03 + 0.04 * seg(t, TL.E2, TL.E3)} x={900}><Unveil t={t} t0={TL.E2} t1={TL.E3} frame="E2" dim={seg(t, TL.E3 - 0.5, TL.E3)} /></Cam>;
/* E3–E4: the lamp comes on, the empty armchair; the lamp goes out on the stop hit; the star in the window, then a push into it */
export const F_E3: React.FC<{t: number}> = ({t}) => { const lamp = t < TL.E4 ? easeOut(seg(t, TL.E3 + 0.12, TL.E3 + 0.24)) : 0, pS = push(t, 106.986, TL.H1a);
	const z = (1 + 0.12 * ease(seg(t, TL.E3, TL.E4))) * (1 + 2.3 * pS), cx = lerp(lerp(900, 1100, seg(t, TL.E3, TL.E4)), 1520, ease(seg(t, TL.E4 + 0.5, TL.H1a))), cy = lerp(560, 600, ease(seg(t, TL.E4 + 0.5, TL.H1a)));
	return <Cam z={z} x={cx} y={cy}>
		<rect width={W} height={H} fill="#46605A" />{hatchOver(0, 0, W, 820, 'h45d', 0.15)}
		<rect x={1180} y={180} width={460} height={560} fill="#1E2A44" stroke="#E9DFC8" strokeWidth={4} />
		{Array.from({length: 30}, (_, i) => <circle key={i} cx={1190 + rnd(i, 2) * 440} cy={190 + rnd(i, 3) * 540} r={1 + rnd(i, 4) * 1.5} fill="#EAF0FF" opacity={0.3 + 0.4 * Math.sin(t * (1 + rnd(i, 5) * 3) + i) ** 2} />)}
		<line x1={1410} y1={180} x2={1410} y2={740} stroke="#E9DFC8" strokeWidth={4} /><line x1={1180} y1={460} x2={1640} y2={460} stroke="#E9DFC8" strokeWidth={4} />
		<Glow x={1520} y={600} r={50 + 20 * Math.sin(t * 2.2) ** 2} c={CU.halo} o={0.6} id="e3g" /><circle cx={1520} cy={600} r={5} fill={CU.core} />
		<rect x={0} y={820} width={W} height={260} fill="#4E3828" />
		<Shadow x={850} y={832} rx={260} ry={18} />
		<path d="M640,820 L640,560 C640,500 700,470 760,470 L940,470 C1000,470 1060,500 1060,560 L1060,820 Z" fill="#6E8C7C" stroke="#2B2722" strokeWidth={2} />{hatchOver(640, 470, 420, 350, 'h45d', 0.3)}
		<rect x={600} y={640} width={110} height={190} rx={30} fill="#7E9C8A" stroke="#2B2722" strokeWidth={2} /><rect x={990} y={640} width={110} height={190} rx={30} fill="#7E9C8A" stroke="#2B2722" strokeWidth={2} />
		<rect x={690} y={680} width={320} height={80} rx={18} fill="#8CAA96" stroke="#2B2722" strokeWidth={2} />
		<rect x={340} y={600} width={200} height={14} fill="#7B5A42" stroke="#2B2722" strokeWidth={1.5} /><rect x={360} y={614} width={14} height={206} fill="#7B5A42" /><rect x={506} y={614} width={14} height={206} fill="#7B5A42" />
		<path d="M380,520 L500,520 L470,450 L410,450 Z" fill={lamp > 0.5 ? '#FFF2D8' : '#E9DFC8'} stroke="#2B2722" strokeWidth={2} /><rect x={437} y={520} width={6} height={80} fill="#4E3828" /><rect x={410} y={594} width={60} height={8} fill="#4E3828" />
		<Glow x={440} y={500} r={360} c="#FFE2B0" o={0.45 * lamp} id="e3l" />
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#0C141A" opacity={0.42 * (1 - lamp)} />
	</Cam>; };
/* H1a: opens on the glowing crate (the star becomes the cargo); a tracked truck shot with parallax; it stops at the 圆明园 gate two beats before the drop */
const STOP_T = 114.911, GATE = 2900;
export const F_H1a: React.FC<{t: number}> = ({t}) => { const u = seg(t, TL.H1a, STOP_T), X = 2200 * (1 - (1 - u) * (1 - u)), camX = X - 700, dawn = seg(t, TL.H1a + 2.2, STOP_T), zo = ease(seg(t, TL.H1a, TL.H1a + 1.3));
	const wl = (f: number) => `translate(${-camX * f},0)`;
	return <Cam z={lerp(3.2, 1.0, zo)} x={lerp(825, 960, zo)} y={lerp(712, 540, zo)}>
		<Sky3 id="h1n" top="#1E2A44" bot="#41506C" clouds={0} />
		<g opacity={dawn}><Sky3 id="h1d" top="#3A4A6C" bot="#D8B496" clouds={0} /></g>
		<g transform={wl(0.15)}>{Array.from({length: 9}, (_, i) => <path key={i} d={`M${-200 + i * 420},640 Q${10 + i * 420},${520 - 40 * rnd(i, 3)} ${220 + i * 420},640 Z`} fill="#2C3A50" opacity={0.8} />)}</g>
		<g transform={wl(0.5)}>{Array.from({length: 16}, (_, i) => <Tree3 key={i} x={100 + i * 260} g={700} h={240 + 70 * rnd(i, 4)} seed={i + 11} hue={i % 2 ? 'pine' : 'willow'} />)}</g>
		<rect x={0} y={690} width={W} height={H - 690} fill="#3A3E42" /><rect x={0} y={760} width={W} height={60} fill="#2C3034" />
		<g transform={wl(1)}>
			{Array.from({length: 22}, (_, i) => <rect key={i} x={i * 220} y={786} width={120} height={8} fill="#D8D0B0" opacity={0.6} />)}
			{/* the 圆明园 gate */}
			<rect x={GATE - 700} y={560} width={560} height={130} fill="#8E3B2E" /><rect x={GATE - 700} y={548} width={560} height={14} fill="#3F5A52" />
			<rect x={GATE + 340} y={560} width={700} height={130} fill="#8E3B2E" /><rect x={GATE + 340} y={548} width={700} height={14} fill="#3F5A52" />
			{[GATE - 140, GATE + 340].map((x) => <rect key={x} x={x - 20} y={430} width={40} height={262} fill="#8E3B2E" stroke="#1B2329" strokeWidth={2} />)}
			<path d={`M${GATE - 220},440 Q${GATE + 100},400 ${GATE + 420},440 L${GATE + 360},390 L${GATE - 160},390 Z`} fill="#3F5A52" stroke="#1B2329" strokeWidth={2} />
			<rect x={GATE - 10} y={410} width={220} height={74} fill="#2B2722" stroke="#C9A65A" strokeWidth={4} /><text x={GATE + 100} y={462} textAnchor="middle" style={{fontFamily: SANS, fontSize: 46, fontWeight: 900, letterSpacing: '0.1em'}} fill="#E8C27A">圆明园</text>
		</g>
		<g transform={`translate(${X - camX},0)`}>
			<Shadow x={170} y={824} rx={200} ry={12} o={0.5} />
			<rect x={0} y={630} width={250} height={170} rx={6} fill="#56687A" stroke="#1B2329" strokeWidth={2} /><rect x={250} y={680} width={100} height={120} rx={10} fill="#46586A" stroke="#1B2329" strokeWidth={2} /><rect x={270} y={694} width={64} height={46} rx={6} fill="#9FB8C8" />
			{[60, 200, 300].map((wx) => <g key={wx} transform={`rotate(${(X * 0.6) % 360} ${wx} 808)`}><circle cx={wx} cy={808} r={26} fill="#15191C" /><circle cx={wx} cy={808} r={11} fill="#5A6066" /><rect x={wx - 2} y={790} width={4} height={36} fill="#3A4046" /></g>)}
			<path d="M350,740 L760,690 L760,810 L350,770 Z" fill="#FFF2C8" opacity={0.2 * (1 - dawn * 0.6)} />
			<Glow x={125} y={712} r={80} c={CU.halo} o={0.45} id="h1g" /><circle cx={125} cy={712} r={6} fill={CU.core} />
			<text x={125} y={760} textAnchor="middle" style={{fontFamily: SANS, fontSize: 28, fontWeight: 900}} fill="#E9DFC8" opacity={0.85}>小心轻放</text>
		</g>
		<rect x={0} y={0} width={W} height={H} fill="#E8B48C" opacity={0.14 * dawn} />
	</Cam>; };
/* H1b–H5: one courtyard — 正觉寺 · 文殊亭. Doors open on the drop; push in; the six others gather (H3) and fly to their museums (H4); pulled back, the old fire beyond the wall (H5) */
const SIX: Z[] = ['牛', '猴', '虎', '猪', '鼠', '兔'];
export const F_H1b: React.FC<{t: number}> = ({t}) => { const d = easeOut(seg(t, TL.H1b, TL.H1b + 0.45)), flash = Math.max(0, 1 - (t - TL.H1b) / 0.6), p1 = ease(seg(t, TL.H1b + 0.3, TL.H3)), back = ease(seg(t, TL.H3, TL.H3 + 0.9));
	const z = lerp(1.0 + 0.8 * p1, 1.0, back), cy = lerp(lerp(560, 600, p1), 540, back);
	const split = easeOut(seg(t, TL.H4 + 0.15, TL.H4 + 1.4)), city = easeOut(seg(t, TL.H4, TL.H4 + 0.5));
	const smoke = t >= TL.H5 ? 0.85 * (1 - seg(t, TL.H5 + 0.8, TL.H5 + 3.0)) : 0, zH5 = t >= TL.H5 ? 1.0 + 0.05 * seg(t, TL.H5, TL.H7) : z;
	return <g><Cam z={t >= TL.H5 ? zH5 : z} x={960} y={t >= TL.H5 ? 540 : cy}>
		<Courtyard t={t} id="cy" doors={d} light={d} city={t >= TL.H5 ? 0 : city} smoke={smoke} />
		{t >= TL.H5 && <Embers t={t} k={0.6 * smoke} n={30} seed={8} />}
		{t >= TL.H3 && t < TL.H5 && SIX.map((zz, i) => { const a0 = TL.H3 + 0.25 + i * P_, on = easeOut(seg(t, a0, a0 + 0.3)), ang = (i / 6) * Math.PI * 2 + (t - TL.H3) * 0.55;
			const x0 = 960 + Math.cos(ang) * 560, y0 = 400 + Math.sin(ang) * 130, mi = i < 4 ? i : i - 4, tx = i < 4 ? 1382 + mi * 42 : 1610 + mi * 66, ty = i < 4 ? 450 : 470;
			const x = lerp(x0, tx, split), y = lerp(y0, ty, split) - Math.sin(split * Math.PI) * 140, s = lerp(1.0, 0.38, split);
			return on > 0 && <g key={zz} opacity={on}><Glow x={x} y={y} r={70 * s / 0.62} c={CU.halo} o={0.5} id={`six${i}`} /><ZHead3 z={zz} x={x} y={y} s={s} flip={x0 > 960 && split < 0.5} tag={split < 0.2} /></g>; })}
	</Cam>{flash > 0 && <rect width={W} height={H} fill="#FFE6C0" opacity={0.5 * flash} />}</g>; };
/* H7–H8: the folded ear — push in; on the dead stop the ring shuts and the light narrows; bloom into the memory */
const EAR: [number, number] = [1170 + 50 * 1.12, 640 - 326 * 1.12];
export const F_H7: React.FC<{t: number}> = ({t}) => { const ring = seg(t, TL.H8, TL.H8 + 0.5), shut = t >= 136.088, z = lerp(1.0, 2.0, ease(seg(t, TL.H7, TL.H8))) + 0.5 * seg(t, TL.H8, TL.K1), narrow = seg(t, 136.088, 136.4), bloom = seg(t, TL.K1 - 0.55, TL.K1);
	const cx = lerp(1170, EAR[0], ease(seg(t, TL.H7, TL.H8))), cy = lerp(540, EAR[1] + 40, ease(seg(t, TL.H7, TL.H8))), r = 96, c = 2 * Math.PI * r;
	return <g><Cam z={z} x={cx} y={cy}>
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#24343C" />{hatchOver(-200, -200, W + 400, H + 400, 'hzInk', 0.12)}
		<HorseHead x={1170} y={640} s={1.12} id="h7h" glow={0.7} curl={1} lx={-500} ly={-700} />
		{ring > 0 && <g transform={`translate(${EAR[0]},${EAR[1]}) rotate(-90)`}><circle r={r} fill="none" stroke="#9FE6D8" strokeWidth={6} strokeDasharray={c} strokeDashoffset={shut ? 0 : c * (1 - 0.8 * easeOut(ring))} />
			{shut && <circle r={r + 14 + 30 * (1 - Math.min(1, (t - 136.088) / 0.3))} fill="none" stroke="#9FE6D8" strokeWidth={2} opacity={0.7} />}</g>}
		{narrow > 0 && <g opacity={narrow}><defs><radialGradient id="h7v" cx={EAR[0]} cy={EAR[1]} r={420} gradientUnits="userSpaceOnUse"><stop offset="0.35" stopColor="#0C141A" stopOpacity="0" /><stop offset="1" stopColor="#0C141A" stopOpacity="0.85" /></radialGradient></defs><rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#h7v)" /></g>}
	</Cam>{bloom > 0 && <rect width={W} height={H} fill="#FFF1D8" opacity={bloom * bloom} />}</g>; };
/* K1–K4: noon — a memory of twelve (warm, faded); the eleven go; five dashed */
export const F_K1: React.FC<{t: number}> = ({t}) => { const gone = t >= TL.K2, five = t >= TL.K4, bloom = 1 - seg(t, TL.K1, TL.K1 + 0.6);
	const MISSING = new Set<Z>(['龙', '蛇', '羊', '鸡', '狗']);
	return <g><Cam z={1.06 - 0.06 * seg(t, TL.K1, TL.K5)}><Garden3 t={t} id="gk1" dim={0.35} present={gone ? new Set<Z>() : 'all'} ghost={five} ghostSet={MISSING} arcs={gone ? 'one' : 'memory'} active="马" grow={1} />
		{!gone && <rect width={W} height={H} fill="#F3E2C0" opacity={0.22} style={{mixBlendMode: 'multiply'}} />}</Cam>
		{bloom > 0 && <rect width={W} height={H} fill="#FFF1D8" opacity={bloom * bloom} />}</g>; };
/* K5: France 2018 — opens with the gavel up and a paddle raised; the hammer on the final hit (146.82); a slow push; the outline flickers */
export const F_K5: React.FC<{t: number}> = ({t}) => { const k = t < TL.K5 - 0.07 ? 0 : ease(seg(t, TL.K5 - 0.07, TL.K5)), sh = t < TL.K5 ? 0 : Math.exp(-(t - TL.K5) * 9) * Math.sin((t - TL.K5) * 80) * 10;
	const fl = 0.55 + 0.45 * Math.abs(Math.sin(t * 5.3) * Math.sin(t * 2.1 + 1));
	return <Cam z={1.04 + 0.16 * ease(seg(t, TL.K5 + 0.3, TL.Q))} x={lerp(900, 820, seg(t, TL.K5, TL.Q)) + sh} y={lerp(540, 560, seg(t, TL.K5, TL.Q))}><AuctionRoom hammer="held" k={k} wall="#5C5F7A" frame="K5" plinthX={800} />
		<g opacity={fl}><Glow x={800} y={560} r={220} c="#E9DFC8" o={0.18} id="k5g" /><ZHead3 z="龙" x={800} y={600} s={2.1} ghost="#F3ECDC" flip /></g>
		<text x={800} y={520} textAnchor="middle" style={{fontFamily: SANS, fontSize: 96, fontWeight: 900}} fill="#E9DFC8" opacity={0.85}>?</text>
		<Bidders frame="K5" up={[1]} xs={[110, 330]} /></Cam>; };
/* Q: the end card, built from the film's own water clock */
export const F_Q: React.FC<{t: number}> = ({t}) => { const a = TL.Q, rise = easeOut(seg(t, a, a + 1.2));
	return <g>
		<Sky3 id="qs" top="#22374A" bot="#4E6A78" clouds={0} />
		{Array.from({length: 12}, (_, i) => <WaterArc3 key={i} x0={420 + i * 98} y0={860} x1={960} y1={780} h={(220 + 30 * Math.sin(i)) * rise} o={(i === 6 ? 0.95 : 0.2) * rise} w={i === 6 ? 6 : 3} />)}
		<HorseHead x={1560} y={330} s={0.2} id="qh" glow={0.8} />
	</g>; };

/* ================= the scene table ================= */
type Sc = [number, React.FC<{t: number}>];
export const SCENES45: Sc[] = [
	[0, F_S1], [T45.c2, S2], [T45.c3, S3], [T45.c4, S4], [T45.c5, S5], [T45.c6, S6], [T45.c7, S7], [T45.rew, Rewind], [T45.title, S8],
	[TL.A1, S9], [TL.A3, F_A3], [TL.A7, F_A7], [TL.B1, F_B1], [TL.B2, F_B2], [TL.B4, F_B4],
	[TL.D1, F_D1], [TL.D3, F_D3], [TL.D5, F_D5], [TL.D6, F_D6], [TL.D8, F_D8], [TL.D10, F_D10], [TL.D11, F_D11], [TL.D14, F_D14],
	[TL.E1, F_E1], [TL.E2, F_E2], [TL.E3, F_E3], [TL.H1a, F_H1a], [TL.H1b, F_H1b], [TL.H7, F_H7],
	[TL.K1, F_K1], [TL.K5 - P_, F_K5], [TL.Q, F_Q],
];
export const sceneAt = (t: number) => { let i = 0; while (i + 1 < SCENES45.length && t >= SCENES45[i + 1][0]) i++; return SCENES45[i][1]; };
export const Film45: React.FC<{t: number}> = ({t}) => { const S = sceneAt(t); return <><QDefs /><S t={t} /></>; };
void H; void StoneBody3; void seated; void RETURNED; void ALLZ; void SmokeCols; void easeIn;
