import React from 'react';
import {W, H, grounded, walkPose, lerp, cl, rnd, seg, ease, eio, eout, land, KAI, SANS} from '../qq50/kit50';
import {B, BG, curl, LacDefs, Lacquer, Vignette, Pool, RimFig, ScrollBand} from '../qq50/styleB';
import {ikArm, toBody, J} from '../qq50/props50';
import {Pose} from '../qq44/figure44';
import {seated, STRIDE, GAIT_S} from '../qq47/pose47';
import {Defs51, ICE, BRZ, SNOW, IceBlock, IcePool, Chisel, Cup, Snow, FrozenRiver, Jianfou, JarWhole, jfGeom, Fridge, fridgeGeom, LOOKS51, Walker51, Forearm, P2} from './props51';
import {WipeSplit, BA, PillarKind} from './master51';
/* ep51 PartA (Builder A): film t 0–55.92 (+ a little past it for the hand-off wipe).
   hook (your fridge, 不会冷, the lid, the ◀◀ season rewind) → 周 river: title, the two chisel strikes, the block into the 冰窖 →
   80 labourers → ×3 → the 秦 pit 190 m³ → 战国 banquet: the 鉴缶 (exploded, section, packed, 先猜？, 酒, 温) → the cup taken →
   唐: the ice mountain (Q3), 酥山 handed over, frosted at the cellar, the ice-cream ghost → hand-off (Song shopfront, 55.92).
   Picture only: the master (master51) draws subtitles / stamp / counter / seal / title on top. Hits sit on the grid (BA). */

type Fc = React.FC<{t: number}>;
export const HANDOFF = {t: BA(98), x: 640};   // 55.916: the shopfront's centre crosses the walker (screen x 640)
const V = (h: number) => STRIDE * h / GAIT_S;   // natural walking speed, px/s
const wph = (dist: number, h: number) => dist / (STRIDE * h);   // walk phase (cycles) for a distance walked
const fade = (t: number, a: number, d: number) => ease(seg(t, a, a + d));
const bump = (t: number, a: number, d: number) => Math.sin(Math.PI * seg(t, a, a + d));
const stand = (k: Partial<{lean: number; neck: number; la: number; le: number; ra: number; re: number}> = {}) => grounded({lean: 3, neck: 4, lt: 3, lk: 3, rt: -4, rk: 4, la: -3, le: 10, ra: 4, re: 14, ...k});
const reach = (p: Pose, s: 'L' | 'R', X: number, Y: number, x: number, g: number, h: number, flip = false) => ikArm(p, s, toBody(X, Y, x, g, h, flip));
const mixP = (a: Pose, b: Pose, k: number): Pose => { const o: Pose = {}; for (const n of Object.keys(a)) o[n] = [lerp(a[n][0], b[n][0], k), lerp(a[n][1], b[n][1], k)]; return o; };
const Lab: React.FC<{x: number; y: number; s: string; fs?: number; col?: string; anchor?: 'start' | 'middle' | 'end'; o?: number}> = ({x, y, s, fs = 40, col = B.cream, anchor = 'start', o = 1}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily={KAI} fontWeight={700} fontSize={fs} fill={col} opacity={o} stroke={B.lac} strokeWidth={Math.max(5, fs * 0.14)} style={{paintOrder: 'stroke'}}>{s}</text>;
/** B's ice gradients (identical copies, so either builder's frames work in one page) */
const IceDefsA: React.FC = () => <defs>
	<linearGradient id="iceLit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F4FBFF" /><stop offset="0.6" stopColor="#CDE8F5" /><stop offset="1" stopColor="#A4D1E5" /></linearGradient>
	<linearGradient id="iceShd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9CCBE0" /><stop offset="0.6" stopColor={ICE.shade} /><stop offset="1" stopColor="#4F87A2" /></linearGradient>
	<filter id="mist" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter>
</defs>;
const Pic: React.FC<{id: string; sheen?: number; children: React.ReactNode}> = ({id, sheen = 0.25, children}) =>
	<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><LacDefs /><Defs51 /><IceDefsA /><Lacquer sheen={sheen} id={id} />{children}<Vignette id={id} /></svg>;
const Ground: React.FC<{g: number; lattice?: boolean; x0?: number; x1?: number}> = ({g, lattice = true, x0 = -40, x1 = W + 40}) => <g>
	<rect x={x0} y={g} width={x1 - x0} height={H - g + 400} fill={BG.ground} /><rect x={x0} y={g} width={x1 - x0} height={3} fill={B.gold} opacity={0.28} />
	{lattice && <path d={Array.from({length: Math.ceil((x1 - x0) / 90) + 2}, (_, i) => `M${x0 - 20 + i * 90},${g + 30} l45,40 l-45,40 l-45,-40 Z`).join(' ')} fill="none" stroke={B.gold} strokeWidth={1.5} opacity={0.1} />}
</g>;
/** ice chips bursting from a strike point; k = 0..1 progress of the burst */
const Burst: React.FC<{x: number; y: number; s: number; k: number; seed?: number; dir?: number}> = ({x, y, s, k, seed = 1, dir = -1}) => { if (k <= 0 || k >= 1) return null;
	return <g opacity={1 - k * k}>{Array.from({length: 11}, (_, i) => { const a = (-170 + 160 * rnd(i, seed)) * Math.PI / 180, d = s * (0.2 + 0.9 * rnd(i, seed + 2)) * eout(k), px = x + dir * -Math.cos(a) * d, py = y + Math.sin(a) * d + 60 * k * k, z = s * (0.05 + 0.06 * rnd(i, seed + 4));
		return <path key={i} d={`M${px},${py - z} L${px + z * 0.8},${py} L${px},${py + z * 0.7} L${px - z * 0.7},${py} Z`} fill={i % 3 ? ICE.core : '#FFFFFF'} />; })}
		{k < 0.35 && Array.from({length: 6}, (_, i) => { const a = (-160 + 140 * rnd(i, seed + 7)) * Math.PI / 180, d0 = s * 0.1, d1 = s * (0.3 + 0.3 * rnd(i, seed + 8));
			return <path key={`r${i}`} d={`M${x + dir * -Math.cos(a) * d0},${y + Math.sin(a) * d0} L${x + dir * -Math.cos(a) * d1},${y + Math.sin(a) * d1}`} stroke="#F4FBFF" strokeWidth={3} strokeLinecap="round" opacity={1 - k / 0.35} />; })}</g>; };
const Glint: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => o <= 0 ? null : <g transform={`translate(${x},${y})`} opacity={o}>
	<circle r={r * 0.3} fill="#FFFFFF" opacity={0.55} />
	<path d={`M0,${-r} L${r * 0.09},${-r * 0.09} L${r},0 L${r * 0.09},${r * 0.09} L0,${r} L${-r * 0.09},${r * 0.09} L${-r},0 L${-r * 0.09},${-r * 0.09} Z`} fill="#FFFFFF" /></g>;

/* ======================= 1 · HOOK 0–4.6: your fridge (frame 0 = KF01; the light dies on DA(1) = 2.707 = KF02) ======================= */
const FX0 = 820, FY0 = -40, FW = 680, FH = 1060, FG = fridgeGeom(FX0, FY0, FW, FH), VX = (FG.bx0 + FG.bx1) / 2, VY = FG.iy1 - 18, VW = 380;
const Hook: Fc = ({t}) => {   // the push-in (3.85–4.6) lands the vessel exactly on the lid shot's vessel (LX, LY, LW)
	const open = t < BA(0) ? 0.6 : lerp(0.6, 0.92, eout(seg(t, BA(0), BA(0) + 0.55)));
	const light = t < BA(4) ? 1 : t < BA(4) + 0.07 ? 0.3 : 0;
	const e = eio(seg(t, 3.85, 4.6)), z = 1 + 0.012 * Math.min(t, 3.85) * (1 - e) + (LW / VW - 1) * e, fx = PUSH_F[0], fy = PUSH_F[1];
	const edge = FX0 - 0.42 * FW * open, hand: P2 = [edge + 18, 640 + 6 * Math.sin(t * 1.3)], el: P2 = [120, 1180];
	const d = Math.hypot(hand[0] - el[0], hand[1] - el[1]), wr: P2 = [hand[0] - (hand[0] - el[0]) / d * 45, hand[1] - (hand[1] - el[1]) / d * 45];
	const bob = 5 * Math.sin(t * 1.7);
	return <Pic id="hk" sheen={0.12 + 0.03 * t}>
		<g transform={`translate(${fx},${fy}) scale(${z}) translate(${-fx},${-fy})`}>
			<rect x={-40} y={0} width={W + 80} height={H} fill="#140A07" opacity={0.5} />
			<rect x={-40} y={700} width={880} height={400} fill="#1E100B" /><rect x={-40} y={700} width={880} height={3} fill={B.gold} opacity={0.3} />
			<path d={Array.from({length: 10}, (_, i) => `M${-40 + i * 90},420 V700`).join(' ') + ' M-40,510 H840 M-40,600 H840'} stroke={B.gold} strokeOpacity={0.06} strokeWidth={1.5} />
			<rect x={1500} y={700} width={460} height={400} fill="#1E100B" /><rect x={1500} y={700} width={460} height={3} fill={B.gold} opacity={0.3} />
			<Fridge x0={FX0} y0={FY0} w={FW} h={FH} open={open} light={light} id="hkf">
				<Pool id="hkv" x={VX} y={VY - 170} rx={330} ry={260} a={light > 0.5 ? 0.22 : 0.34} />
				<ellipse cx={VX} cy={VY + 4} rx={VW * 0.62} ry={16} fill="#000" opacity={0.35} />
				<g filter="url(#sh51)"><Jianfou x={VX} y={VY} w={VW} id="hkj" /></g>
			</Fridge>
			<Forearm el={el} wr={wr} size={36} thumb={-1} />
			<Cup x={1560} y={905 + bob} w={112} frost={0.6} />
			<Forearm el={[1640, 1200 + bob]} wr={[1574, 894 + bob]} size={34} thumb={1} />
		</g>
	</Pic>; };

/* ======================= 2 · H2 4.25–7.3: the vessel close; cut to section, the lid lifts: ice packed in the gap ======================= */
const LX = 1080, LY = 1010, LW = 600, LG = jfGeom(LX, LY, LW);
const PUSH_F: P2 = (() => { const z = LW / VW; return [(LX - VX * z) / (1 - z), (LY - VY * z) / (1 - z)]; })();
const LidSlabs: React.FC<{dy: number; o: number}> = ({dy, o}) => { const {nw, yt, yl, w} = LG, L = LX - w / 2, R = LX + w / 2;
	return <g opacity={o} transform={`translate(0,${-dy})`}><path d={`M${L - w * 0.01},${yt} L${LX - nw / 2 - w * 0.015},${yt} L${LX - nw / 2 - w * 0.015},${yl} L${L - w * 0.01},${yl} Z M${LX + nw / 2 + w * 0.015},${yt} L${R + w * 0.01},${yt} L${R + w * 0.01},${yl} L${LX + nw / 2 + w * 0.015},${yl} Z`} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={2} />
		<path d={`M${L - w * 0.01},${yl} L${LX - nw / 2 - w * 0.015},${yl} M${LX + nw / 2 + w * 0.015},${yl} L${R + w * 0.01},${yl}`} stroke={BRZ.hi} strokeWidth={4} opacity={0.85} /></g>; };
/** shared by the lid shot and the start of the rewind: the vessel in section with its gap ice. lift = the left-gap top block rising out */
const VesselClose: React.FC<{t: number}> = ({t}) => {
	const cut = eio(seg(t, 4.85, 5.4)), cx = lerp(LX - LW / 2 - 60, LX + LW / 2 + 60, cut), lidUp = eout(seg(t, 5.45, 6.1));
	const z = 1 + 0.02 * seg(t, 4.25, 7.0);
	return <g transform={`translate(${LX},${LY - 300}) scale(${z}) translate(${-LX},${-LY + 300})`}>
		<Pool id="lc" x={LX} y={LY - 330} rx={520} ry={420} a={0.3} />
		<ellipse cx={LX} cy={LY + 6} rx={LW * 0.62} ry={22} fill="#000" opacity={0.4} />
		<defs><clipPath id="lcA"><rect x={-100} y={0} width={cx + 100} height={H} /></clipPath><clipPath id="lcB"><rect x={cx} y={0} width={W} height={H} /></clipPath></defs>
		<g clipPath="url(#lcA)"><Jianfou x={LX} y={LY} w={LW} mode="section" ice={1} frost={0.4} lid={lidUp <= 0} wine={false} id="lcs" /></g>
		{cut < 1 && <g clipPath="url(#lcB)"><Jianfou x={LX} y={LY} w={LW} id="lcw" /></g>}
		{cut > 0 && cut < 1 && <path d={`M${cx},${LG.neckTop - 80} V${LY + 10}`} stroke={B.goldL} strokeWidth={3} opacity={0.9} />}
		{lidUp > 0 && <LidSlabs dy={150 * lidUp} o={1 - seg(t, 6.2, 6.8)} />}
		{/* chisel marks catch the light on 「冬天凿下的」 */}
		<Glint x={LG.gapL - 10} y={LG.yt + 140} r={26} o={bump(t, BA(9) - 0.1, 0.45)} />
		<Glint x={LG.gapR + 6} y={LG.yt + 230} r={22} o={bump(t, BA(10) - 0.1, 0.45)} />
	</g>; };
const LidShot: Fc = ({t}) => <Pic id="ls" sheen={0.2}><VesselClose t={t} /></Pic>;

/* ======================= 3 · H3 7.0–9.0: ◀◀ the block slides back out, the seasons run backwards, pull back to the river ======================= */
const RW_B: P2 = [960, 760], RW_W = 420;   // the block's screen place during the rewind (= the river block at camera ×1.75)
const Rewind: Fc = ({t}) => {
	const u = seg(t, 7.0, 7.45), ue = eio(u);
	const from: P2 = [LG.gapL, LG.yt + 150], bx = lerp(from[0], RW_B[0], ue), by = lerp(from[1], RW_B[1], ue), bw = lerp(LG.gapW * 0.9, RW_W, ue), bh = lerp(LG.gapW * 0.8, 262, ue);
	const sum = 1 - seg(t, 7.35, 7.6), aut = bump(t, 7.35, 0.5), win = seg(t, 7.6, 7.85);
	const vesO = 1 - seg(t, 7.0, 7.35);
	/* large leaves running BACKWARDS (rising) behind the block: green, then orange, then the snow */
	const leaves = (col: string, vein: string, o: number, seed: number) => o <= 0 ? null : <g opacity={o}>{Array.from({length: 22}, (_, i) => { const y = (H + 80) - ((rnd(i, seed) * (H + 160) + 1100 * (t - 7.0)) % (H + 160)), x = rnd(i, seed + 1) * W + 40 * Math.sin(t * 3 + i), r = 22 + 14 * rnd(i, seed + 3);
		return <g key={i} transform={`translate(${x},${y}) rotate(${rnd(i, seed + 2) * 180 - t * 260})`}><path d={`M${-r},0 Q0,${-r * 0.55} ${r},0 Q0,${r * 0.55} ${-r},0 Z`} fill={col} /><path d={`M${-r},0 L${r},0`} stroke={vein} strokeWidth={1.5} /></g>; })}</g>;
	return <Pic id="rw" sheen={0.2}>
		{/* the season field behind: warm summer → amber autumn → cold winter night */}
		<rect width={W} height={H} fill="#2E1A0E" opacity={0.6 * sum} />
		<rect width={W} height={H} fill="#3A200C" opacity={0.55 * aut} />
		<rect width={W} height={H} fill="#10141A" opacity={0.5 * win} />
		{leaves('#5E8A3A', '#3A5A22', sum * seg(t, 7.02, 7.15), 3)}{leaves('#D0782A', '#8A4A16', aut, 5)}
		{/* rewind streaks */}
		<g stroke={B.cream} strokeLinecap="round">{Array.from({length: 14}, (_, i) => { const y = 120 + i * 70 + 20 * rnd(i, 4), x = W - ((rnd(i, 5) * W + 2600 * (t - 7.0)) % (W + 600)) + 300;
			return <path key={i} d={`M${x},${y} h${160 + 200 * rnd(i, 6)}`} strokeWidth={2} opacity={0.1 * bump(t, 7.0, 1.4)} />; })}</g>
		{win > 0 && <g opacity={win}><Snow t={-(t - 7.6) * 2.2 + 3} n={110} seed={8} /></g>}
		{vesO > 0 && <g opacity={vesO} transform={`translate(0,${80 * ue})`}><VesselClose t={7.0} /></g>}
		<IcePool x={bx} y={by + 8} rx={bw * 0.9} o={ue} />
		<IceBlock x={bx} y={by} w={bw} h={bh} d={bw * 0.46} seed={3} />
		{/* ◀◀ (upper right, clear of the subtitle; the stamp is hidden on H3) */}
		<g transform="translate(1330,330)" opacity={fade(t, 7.0, 0.1) * (0.75 + 0.25 * Math.sin(t * 14))}>
			<path d="M0,-46 L-62,0 L0,46 Z M66,-46 L4,0 L66,46 Z" fill={B.cream} stroke="#0A0503" strokeWidth={6} style={{paintOrder: 'stroke'}} /></g>
	</Pic>; };

/* ======================= 4 · the 周 river 8.2–17.3: walker revealed (KF03), title (KF04), two strikes, push, into the 冰窖 ======================= */
const RG = 880, RH = 540, BW = 240, BH = 150, PITX = 1365, WG = RG - 24;   // WG: he walks a step behind the block (along the pit's far rim)
const STR = [BA(22), 13.40];   // the two strikes (sound cues 12.896 / 13.40)
/* his world x: chisel stance → walks round behind the block (13.55–14.75) → hauls it on the rope (14.75–15.6) → the block drops
   into the 冰窖 (15.6–15.75) → a look back → walks on (15.95) */
const riverWX = (t: number) => t < 13.55 ? 860 : t < 14.75 ? 860 + 446 * (t - 13.55) : t < 15.6 ? 1395 + 300 * (t - 14.75) : t < 15.95 ? 1650 : 1650 + V(RH) * (t - 15.95);
const blockWX = (t: number) => t < 14.75 ? 1110 : 1110 + 300 * (Math.min(t, 15.6) - 14.75);
const riverCam = (t: number) => {   // → {s, fx, fy, sx, sy}: world (fx, fy) lands on screen (sx, sy) at scale s
	/* one pull-back straight to the title framing, done by 8.93; the music breaks 8.93–9.50, the picture holds, the title slams on 9.50 */
	if (t < 8.93) { const u = ease(seg(t, 8.1, 8.93)); return {s: lerp(RW_W / BW, 0.87, u), fx: 1110, fy: RG, sx: lerp(RW_B[0], 960 + 150 * 0.87, u), sy: lerp(RW_B[1], RG, u)}; }
	const s = 0.87 + 0.03 * ease(seg(t, 9.5, 12.5)) - 0.03 * ease(seg(t, 12.5, 13.6));   // a slow drift in over the title, back out for the haul
	const fx = 960 + 0.85 * (riverWX(t) - 860) + 30 * ease(seg(t, 9.5, 12.5)) * (1 - ease(seg(t, 12.5, 13.6)));
	return {s, fx, fy: RG, sx: 960, sy: RG}; };
const PitMouth: React.FC<{x: number; y: number; w: number; id: string}> = ({x, y, w, id}) => { const hw = w / 2, d = w * 0.27;
	return <g>
		<defs><linearGradient id={`pw${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6A4A30" /><stop offset="0.45" stopColor="#2A1A10" /><stop offset="1" stopColor="#030101" /></linearGradient></defs>
		<path d={`M${x - hw},${y - d} L${x + hw},${y - d} L${x + hw + 40},${y} L${x - hw - 40},${y} Z`} fill="#040202" />
		<path d={`M${x - hw},${y - d} L${x + hw},${y - d} L${x + hw - 10},${y - d * 0.45} L${x - hw + 10},${y - d * 0.45} Z`} fill={`url(#pw${id})`} />
		<path d={`M${x - hw},${y - d} L${x + hw},${y - d} L${x + hw + 40},${y} L${x - hw - 40},${y} Z`} fill="none" stroke={SNOW} strokeOpacity={0.35} strokeWidth={3} strokeLinejoin="round" />
	</g>; };
const River: Fc = ({t}) => {
	const c = riverCam(t), wx = riverWX(t), bxw = blockWX(t);
	/* the chisel: resting (KF03) → two strikes → tucked in his belt from 13.55 */
	const lift = t < STR[0] ? bump(t, 12.45, STR[0] - 12.45) : t < STR[1] ? Math.sin(Math.PI * seg(t, STR[0] + 0.04, STR[1])) : 0;
	const tipRest: P2 = [1110 - 70, RG - BH - 12];
	const tip: P2 = [tipRest[0], tipRest[1] - 70 * lift], butt: P2 = [tip[0] - 52, tip[1] - 168];
	const chiselHeld = t < 13.55;
	const stance = (k = lift) => { let q = stand({lean: 8 + 6 * k, neck: 18, la: 10, le: 20, ra: 4, re: 16}); q = reach(q, 'L', butt[0] + 10, butt[1] + 26, 860, WG, RH); return t > 12.3 ? reach(q, 'R', butt[0] + 20, butt[1] + 62, 860, WG, RH) : q; };
	const haulLean = grounded({lean: 20, neck: -8, lt: 20, lk: 14, rt: -16, rk: 10, la: -30, le: 10, ra: -26, re: 14});
	let p: Pose;
	if (chiselHeld) p = stance();
	else if (t < 14.75) p = mixP(stance(0), walkPose(wph(wx - 860, RH)), ease(seg(t, 13.55, 13.8)));
	else if (t < 15.6) p = ikArm(ikArm(mixP(walkPose(wph(wx - 860, RH)), haulLean, 0.4 * ease(seg(t, 14.75, 14.95))), 'L', [-0.1, 0.52]), 'R', [-0.08, 0.5]);
	else if (t < 15.95) p = mixP(ikArm(ikArm(mixP(walkPose(wph(1650 - 860, RH)), haulLean, 0.4), 'L', [-0.1, 0.52]), 'R', [-0.08, 0.5]), stand({lean: 0, neck: -24, la: -10, le: 14}), ease(seg(t, 15.6, 15.85)));
	else p = mixP(stand({lean: 0, neck: -24, la: -10, le: 14}), walkPose(wph(wx - 1650, RH) + 0.3), ease(seg(t, 15.95, 16.15)));
	const drop = seg(t, 15.6, 15.76);
	const lab = t > BA(27) - 0.25 ? land(seg(t, BA(27) - 0.25, BA(27) + 0.25)) : 0;
	const hits = STR.map((s) => seg(t, s, s + 0.6));
	const hand = J(p, 'LHand', wx, WG, RH), hip = J(p, 'Hips', wx, WG, RH);
	const ropeAt: P2 = [bxw + BW / 2 - 6, RG - BH * 0.45];
	const gust = bump(t, 9.5, 0.9);
	return <Pic id="rv" sheen={0.2}>
		<g transform={`translate(${c.sx},${c.sy}) scale(${c.s}) translate(${-c.fx},${-c.fy})`}>
			<g transform={`translate(${-W},0)`}><FrozenRiver g={RG} t={t} id="rvl" /></g>
			<FrozenRiver g={RG} t={t} id="rva" />
			<rect x={-W} y={H} width={W * 3} height={300} fill="#2A201C" />
			<g transform={`translate(${W},0)`}><FrozenRiver g={RG} t={t} id="rvb" /></g>
			<Pool id="rv" x={wx + 60} y={640} rx={560} ry={420} a={0.24} />
			<Pool id="rvf" x={wx} y={WG + 4} rx={260} ry={36} a={0.22} />
			{/* where the block was cut from the sheet: a dark slot + chips */}
			<path d={`M${1110 - 190},${RG + 34} L${1110 + 210},${RG + 34} L${1110 + 260},${RG + 8} L${1110 - 140},${RG + 8} Z`} fill="#0C0605" opacity={0.6} />
			{Array.from({length: 9}, (_, i) => <path key={i} d={`M0,0 l${6 + 6 * rnd(i, 2)},${-4 - 4 * rnd(i, 3)} l${4 + 4 * rnd(i, 4)},${6 + 3 * rnd(i, 5)} Z`} transform={`translate(${1110 - 170 + 360 * rnd(i, 7)},${RG + 6 + 26 * rnd(i, 8)})`} fill={ICE.body} opacity={0.75} />)}
			<PitMouth x={PITX} y={RG + 60} w={250} id="rvp" />
			{lab > 0 && <Lab x={PITX} y={RG + 140 - 120 * (1 - lab)} s="冰窖" fs={56} anchor="middle" col={B.goldL} o={cl(lab * 3)} />}
			{/* the rope, lying slack on the ice until he takes it up (14.75) */}
			{t < 14.75 && <path d={`M${ropeAt[0]},${ropeAt[1]} Q${ropeAt[0] + 60},${RG + 4} ${ropeAt[0] + 150},${RG + 8} q30,4 26,-8 q-6,-10 -30,-4`} fill="none" stroke="#A88A5C" strokeWidth={4} strokeLinecap="round" />}
			<Walker51 x={chiselHeld ? 860 : wx} g={WG} h={RH} pose={p} look={LOOKS51.zhou.look} />
			{chiselHeld && <Chisel x={butt[0]} y={butt[1]} L={Math.hypot(tip[0] - butt[0], tip[1] - butt[1])} rot={Math.atan2(tip[1] - butt[1], tip[0] - butt[0]) * 180 / Math.PI} />}
			{!chiselHeld && <Chisel x={hip[0] - 18} y={hip[1] - 46} L={150} rot={98} />}
			{/* the block, with its rope loop; it sinks into the 冰窖 behind the near lip */}
			{drop < 1 && <g opacity={1 - seg(drop, 0.55, 1)}>
				<defs><clipPath id="rvc"><rect x={-W} y={-400} width={W * 4} height={RG + 60 + 400} /></clipPath></defs>
				<g clipPath="url(#rvc)"><IcePool x={bxw + 20} y={RG + 6} rx={240} o={1 - drop} />
					<IceBlock x={bxw} y={RG + 110 * drop * drop} w={BW} h={BH} d={110} seed={3} />
					<path d={`M${bxw - BW / 2},${RG - BH * 0.45 + 110 * drop * drop} H${bxw + BW / 2}`} stroke="#A88A5C" strokeWidth={4} opacity={0.9} /></g></g>}
			{t >= 14.75 && t < 15.62 && <path d={`M${hand[0]},${hand[1]} L${ropeAt[0]},${ropeAt[1]}`} stroke="#A88A5C" strokeWidth={4} strokeLinecap="round" />}
			{hits.map((k, i) => <Burst key={i} x={tipRest[0]} y={tipRest[1]} s={160} k={k} seed={i + 2} />)}
		</g>
		<Snow t={t} n={150} seed={3} />
		{gust > 0 && <g opacity={gust}>{Array.from({length: 60}, (_, i) => { const y = H * rnd(i, 31), x = W + 200 - ((rnd(i, 32) * (W + 400) + 2400 * (t - 9.5)) % (W + 400));
			return <path key={i} d={`M${x},${y} l${-26 - 30 * rnd(i, 33)},${4}`} stroke={SNOW} strokeWidth={2 + 2 * rnd(i, 34)} strokeLinecap="round" opacity={0.7} />; })}</g>}
	</Pic>; };

/* ======================= 5 · Z1 16.4–21.3: 80 labourers (20 teams of four) to the 冰窖, officials with tallies, tag 1 → 80 ======================= */
const haulPose = (ph: number) => ikArm(ikArm(grounded({lean: 24 + 3 * Math.sin(ph), neck: -12, lt: 26 + 8 * Math.sin(ph), lk: 18, rt: -18 - 8 * Math.sin(ph), rk: 14, la: -30, le: 10, ra: -26, re: 14}), 'L', [-0.12, 0.5]), 'R', [-0.1, 0.48]);
const Team: React.FC<{x: number; g: number; h: number; dir: 1 | -1; seed: number; t: number}> = ({x, g, h, dir, seed, t}) => {
	const gap = 0.36 * h, bw = 0.8 * h, bx = x - dir * (3 * gap + 0.75 * h), flip = dir === -1;
	const ps = [0, 1, 2, 3].map((k) => ({x: x - dir * k * gap, p: haulPose(seed + k * 1.7 + t * 4.2)}));
	const hands = ps.map((o) => J(o.p, 'LHand', o.x, g, h, flip));
	return <g>
		<path d={`M${hands[0][0]},${hands[0][1]} ${hands.slice(1).map((q) => `L${q[0]},${q[1]}`).join(' ')} L${bx + dir * bw * 0.5},${g - h * 0.12}`} stroke="#A88A5C" strokeWidth={Math.max(1, h * 0.02)} fill="none" />
		<rect x={bx - bw * 0.6} y={g - h * 0.04} width={bw * 1.2} height={h * 0.04} fill="#3A2116" />
		<IceBlock x={bx} y={g - h * 0.04} w={bw} h={bw * 0.62} d={bw * 0.35} marks={h > 55} seed={seed} side={dir} />
		{ps.map((o, k) => <Walker51 key={k} x={o.x} g={g} h={h} pose={o.p} look={{dress: 'tunic', legs: 'bare', head: 'bun'}} col="#100806" flip={flip} rimO={0.5} />)}
	</g>; };
const Tally: React.FC<{x: number; y: number; h: number; rot?: number}> = ({x, y, h, rot = 0}) => <g transform={`translate(${x},${y}) rotate(${rot})`}>
	{[-1, 0, 1].map((i) => <rect key={i} x={i * h * 0.075 - h * 0.035} y={-h} width={h * 0.07} height={h} rx={1.5} fill="#C9A86A" stroke="#6E5530" strokeWidth={1} />)}
	<path d={`M${-h * 0.15},${-h * 0.72} H${h * 0.15} M${-h * 0.15},${-h * 0.28} H${h * 0.15}`} stroke="#5A3A18" strokeWidth={1.6} /></g>;
const NumTag: React.FC<{x: number; y: number; label: string; num: string; w: number; tail?: string; o?: number; sc?: number}> = ({x, y, label, num, w, tail, o = 1, sc = 1}) =>
	<g transform={`translate(${x + w / 2},${y + 70}) scale(${sc}) translate(${-w / 2},-70)`} opacity={o}>
		<defs><radialGradient id={`nt${Math.round(x)}${Math.round(y)}`}><stop offset="0" stopColor="#0A0503" stopOpacity="0.82" /><stop offset="0.6" stopColor="#0A0503" stopOpacity="0.6" /><stop offset="1" stopColor="#0A0503" stopOpacity="0" /></radialGradient></defs>
		<ellipse cx={w / 2} cy={70} rx={w * 0.72} ry={120} fill={`url(#nt${Math.round(x)}${Math.round(y)})`} />
		<g stroke="#0A0503" strokeWidth={10} style={{paintOrder: 'stroke'}} strokeLinejoin="round">
			<text x={28} y={98} fontFamily={KAI} fontWeight={700} fontSize={58} fill={B.cream}>{label}</text>
			<text x={tail ? w - 210 : w - 28} y={106} textAnchor="end" fontFamily={SANS} fontWeight={900} fontSize={104} fill={B.goldL}>{num}</text>
			{tail && <text x={w - 28} y={98} textAnchor="end" fontFamily={KAI} fontWeight={700} fontSize={58} fill={B.cream}>{tail}</text>}</g></g>;
const ROWS_T: {g: number; h: number; dir: 1 | -1; xs: number[]}[] = [
	{g: 655, h: 34, dir: 1, xs: Array.from({length: 9}, (_, i) => 250 + i * 100)},
	{g: 712, h: 48, dir: -1, xs: Array.from({length: 6}, (_, i) => 1010 - i * 142)},
	{g: 790, h: 66, dir: 1, xs: Array.from({length: 5}, (_, i) => 300 + i * 180)},
];
const Zhou80: Fc = ({t}) => { const g = 960, h = 480, wx = 300 + 230 * (t - 19.5);
	const o1 = ikArm(ikArm(stand({lean: 6, neck: 18 + 6 * bump(t % 1.13, 0, 0.5), la: 40, le: 60, ra: 50, re: 70}), 'L', [0.2, 0.66]), 'R', [0.16, 0.6]);
	const o2 = ikArm(stand({lean: 2, neck: 10, la: 50, le: 70, ra: 6, re: 12}), 'L', [0.22, 0.68 + 0.02 * Math.sin(t * 5)]);
	const n = Math.round(lerp(1, 80, eio(seg(t, 17.45, BA(32)))));
	const tagO = fade(t, 17.2, 0.3) * (1 - fade(t, 20.3, 0.3)), tagS = t > BA(32) - 0.05 ? lerp(1.12, 1, land(seg(t, BA(32) - 0.05, BA(32) + 0.4))) : 1;
	const prog = (r: typeof ROWS_T[0]) => r.dir * 0.22 * r.h * (t - 19.5);
	return <Pic id="z1" sheen={0.2}>
		<path d={`M-40,600 Q300,540 620,580 Q980,520 1320,570 Q1640,530 1960,580 V640 H-40 Z`} fill={B.far} />
		<path d={`M-40,600 Q300,540 620,580 Q980,520 1320,570 Q1640,530 1960,580`} fill="none" stroke={SNOW} strokeOpacity={0.18} strokeWidth={3} />
		<rect x={-40} y={630} width={W + 80} height={400} fill="#1A120F" />
		<path d="M-40,632 H1960" stroke={SNOW} strokeOpacity={0.2} strokeWidth={3} />
		<Pool id="z1" x={1100} y={720} rx={720} ry={300} a={0.22} />
		<path d="M140,658 H1150 Q1220,668 1150,700 H140 Q60,730 140,770 H1000 Q1060,780 1080,850" fill="none" stroke="#3A2A20" strokeWidth={22} strokeLinejoin="round" opacity={0.8} />
		<defs>
			<linearGradient id="z1wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7A5434" /><stop offset="0.35" stopColor="#4A3020" /><stop offset="0.75" stopColor="#1E110A" /><stop offset="1" stopColor="#050202" /></linearGradient>
			<radialGradient id="z1hole" cx="0.5" cy="0.75" r="0.7"><stop offset="0" stopColor="#020101" /><stop offset="0.7" stopColor="#080403" /><stop offset="1" stopColor="#1A0E09" /></radialGradient>
			<clipPath id="z1open"><path d="M1200,822 L1560,822 L1630,904 L1150,904 Z" /></clipPath>
			<linearGradient id="z1ramp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3A2A20" /><stop offset="1" stopColor="#0A0504" /></linearGradient>
		</defs>
		<path d="M1200,822 L1560,822 L1630,904 L1150,904 Z" fill="url(#z1hole)" />
		<g clipPath="url(#z1open)">
			<path d="M1200,822 L1560,822 L1540,884 L1222,884 Z" fill="url(#z1wall)" />
			<path d="M1560,822 L1630,904 L1590,904 L1540,884 Z" fill="#2A1A10" /><path d="M1200,822 L1222,884 L1190,904 L1150,904 Z" fill="#1A0F09" />
			{[836, 852, 868].map((y) => <path key={y} d={`M1190,${y} H1570`} stroke="#0E0705" strokeOpacity={0.5} strokeWidth={1.5} />)}
			<Pool id="z1p" x={1380} y={830} rx={200} ry={30} a={0.25} />
			<path d="M1150,904 L1196,826 L1330,872 L1300,904 Z" fill="url(#z1ramp)" />
			{/* a block sliding down the ramp, on a loop */}
			{(() => { const u = ((t - 16.0) / 2.26) % 1; return <IceBlock x={lerp(1180, 1320, u)} y={lerp(870, 960, u * u)} w={90} h={52} d={30} seed={41} rot={14} o={1 - seg(u, 0.75, 1)} />; })()}
		</g>
		<path d="M1060,846 L1196,826 L1150,904 L1050,890 Z" fill="#3A2A20" />
		<path d="M1200,822 L1560,822 L1630,904 L1150,904 Z" fill="none" stroke={SNOW} strokeOpacity={0.32} strokeWidth={3} strokeLinejoin="round" />
		<path d="M1196,822 L1564,822" stroke={B.gold} strokeOpacity={0.35} strokeWidth={2} />
		<Lab x={1400} y={806} s="冰窖" fs={52} anchor="middle" col={B.goldL} />
		{ROWS_T.map((r, ri) => r.xs.map((x, i) => <Team key={`${ri}-${i}`} x={x + prog(r)} g={r.g} h={r.h} dir={r.dir} seed={ri * 10 + i} t={t} />))}
		<Walker51 x={1262} g={814} h={280} pose={o2} look={{dress: 'robe', head: 'guan', beard: 'long'}} col="#0F0806" flip rimO={0.6} />
		<Tally x={1262 - 0.22 * 280} y={814 - (0.62 + 0.02 * Math.sin(t * 5)) * 280} h={72} rot={-10} />
		<Walker51 x={1664} g={884} h={320} pose={o1} look={{dress: 'robe', head: 'guan', beard: 'short'}} col="#0F0806" flip rimO={0.6} />
		<Tally x={1664 - 0.2 * 320} y={884 - 0.6 * 320} h={84} rot={8} />
		{tagO > 0 && <NumTag x={640} y={380} label="干活的 ×" num={`${n}`} w={430} o={tagO} sc={tagS} />}
		<rect x={-40} y={g} width={W + 80} height={H - g + 40} fill={BG.ground} /><rect x={-40} y={g} width={W + 80} height={3} fill={B.gold} opacity={0.28} />
		<Pool id="z1f" x={wx} y={g + 4} rx={240} ry={34} a={0.25} />
		<Walker51 x={wx} g={g} h={h} pose={walkPose(wph(wx, h) + 0.2)} look={LOOKS51.zhou.look} />
		<Snow t={t} n={80} seed={5} o={0.6} />
	</Pic>; };

/* ======================= 6 · Z3 + A1 20.8–26.9: the pit section: three blocks land (×3, the 「？」), then it turns into the 秦 excavation ======================= */
const GS = 560, PF = 950;
const Pit: Fc = ({t}) => {
	const m = eio(seg(t, 23.5, 24.15));   // straight cellar → excavated sloped pit (口大底小)
	const tl = lerp(520, 400, m), tr = lerp(1500, 1620, m), bl = lerp(550, 760, m), br = lerp(1470, 1260, m), pf = lerp(PF, 900, m);
	const lands = [BA(37), BA(38), BA(39)], blocksO = 1 - seg(t, 23.5, 23.9);
	const swing = 6 * Math.sin((t - 22.6) * 3.2) * Math.exp(-(t - 22.6) * 0.8);
	const qO = fade(t, BA(39) + 0.1, 0.3) * (1 - seg(t, 23.5, 23.85)), x3 = t > BA(39) ? land(seg(t, BA(39), BA(39) + 0.4)) : 0;
	const tag190 = t > BA(42) - 0.1 ? land(seg(t, BA(42) - 0.1, BA(42) + 0.35)) : 0;
	/* the walker: Z3 stands at the rim looking down (≤ 3 s); A1 walks along the far rim */
	const h = 300, inW = 221 * Math.min(0, t - 23.0), wx = t < 23.6 ? 430 + inW : 430 + 150 * (t - 23.6);
	const p = t < 23.0 ? walkPose(wph(inW, h)) : t < 23.6 ? mixP(walkPose(0), stand({lean: 12, neck: 34, la: 8, le: 24, ra: -4, re: 16}), ease(seg(t, 23.0, 23.3))) : walkPose(wph(150 * (t - 23.6), h));
	const wg = t < 23.6 ? GS : GS - 12;
	return <Pic id="pt" sheen={0.2}>
		<path d={`M-40,${GS - 40} Q400,${GS - 90} 900,${GS - 60} Q1400,${GS - 100} 1960,${GS - 50} V${GS} H-40 Z`} fill={B.far} />
		<path d={`M-40,${GS - 40} Q400,${GS - 90} 900,${GS - 60} Q1400,${GS - 100} 1960,${GS - 50}`} fill="none" stroke={SNOW} strokeOpacity={0.16} strokeWidth={3} />
		<rect x={-40} y={GS} width={W + 80} height={H - GS + 40} fill="#21110C" />
		{Array.from({length: 14}, (_, i) => <path key={i} d={`M-40,${GS + 36 * (i + 1)} H${W + 40}`} stroke={B.ochre} strokeOpacity={0.1 + 0.08 * m} strokeWidth={1.5} />)}
		<path d={`M-40,${GS} H${W + 40}`} stroke={SNOW} strokeOpacity={0.35 * (1 - m) + 0.1} strokeWidth={4} />
		<path d={`M${tl},${GS} L${tr},${GS} L${br},${pf} L${bl},${pf} Z`} fill="#0A0504" stroke={B.gold} strokeOpacity={0.4} strokeWidth={2.5} strokeDasharray={m > 0.5 ? '14 8' : undefined} />
		<Pool id="pt" x={1010} y={820} rx={560} ry={240} a={0.16} />
		<g opacity={1 - m}>
			<path d={`M552,${PF - 18} Q1010,${PF - 34} 1468,${PF - 18} L1470,${PF} L550,${PF} Z`} fill="#6A5028" opacity={0.7} />
			<path d={Array.from({length: 40}, (_, i) => `M${560 + i * 23},${PF - 4} l${8 + 6 * rnd(i, 2)},${-12 - 8 * rnd(i, 3)}`).join(' ')} stroke="#B89656" strokeOpacity={0.5} strokeWidth={1.5} />
			<rect x={500} y={GS - 16} width={1020} height={18} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.5} />
		</g>
		{/* the excavated pit: rammed-earth wall courses in the section, pegs on the rim */}
		{m > 0 && <g opacity={m}>
			{Array.from({length: 9}, (_, i) => { const y = GS + (pf - GS) * (i + 1) / 10; return <g key={i}><path d={`M${lerp(tl, bl, (i + 1) / 10) - 160},${y} H${lerp(tl, bl, (i + 1) / 10)}`} stroke="#8A6A44" strokeOpacity={0.35} strokeWidth={2} /><path d={`M${lerp(tr, br, (i + 1) / 10)},${y} H${lerp(tr, br, (i + 1) / 10) + 160}`} stroke="#8A6A44" strokeOpacity={0.35} strokeWidth={2} /></g>; })}
			{[tl - 30, tl + 60, tr - 60, tr + 30].map((x, i) => <path key={i} d={`M${x},${GS} v-26`} stroke={B.goldL} strokeWidth={3} opacity={0.6} />)}
			<rect x={tl} y={GS - 14} width={tr - tl} height={4} fill={B.gold} opacity={0.25} />
		</g>}
		{/* the three blocks, one per beat */}
		{blocksO > 0 && [730, 1010, 1290].map((bx, i) => { const k = seg(t, lands[i] - 0.35, lands[i]); if (k <= 0) return null;
			const y = lerp(GS - 20, PF - 16, k * k), sq = t > lands[i] ? 1 - 0.06 * bump(t, lands[i], 0.2) : 1;
			return <g key={i} opacity={blocksO}><IcePool x={bx} y={PF - 14} rx={160} ry={20} o={k} />
				<g transform={`translate(${bx},${y}) scale(${2 - sq},${sq}) translate(${-bx},${-y})`}><IceBlock x={bx} y={y} w={210} h={170} d={80} seed={10 + i} /></g>
				<Burst x={bx} y={PF - 20} s={120} k={seg(t, lands[i], lands[i] + 0.45)} seed={i + 4} dir={i % 2 ? 1 : -1} /></g>; })}
		{qO > 0 && <g opacity={qO}>
			<path d={`M1010,${GS + 2} L${1010 + 74 * Math.sin(swing * Math.PI / 180)},${GS + 74}`} stroke={B.cream} strokeOpacity={0.5} strokeWidth={2} />
			<g transform={`translate(1010,${GS + 2}) rotate(${-swing}) translate(0,72)`}><circle r={40} fill="#0E0705" stroke={B.gold} strokeOpacity={0.6} strokeWidth={2} /><text x={2} y={22} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={62} fill={B.goldL}>？</text></g></g>}
		{x3 > 0 && <g opacity={1 - seg(t, 23.5, 23.85)} transform={`translate(1615,670) scale(${lerp(1.3, 1, x3)}) translate(-85,-70)`}><ellipse cx={85} cy={70} rx={150} ry={110} fill="url(#x3s)" /><defs><radialGradient id="x3s"><stop offset="0" stopColor="#0A0503" stopOpacity="0.82" /><stop offset="0.6" stopColor="#0A0503" stopOpacity="0.55" /><stop offset="1" stopColor="#0A0503" stopOpacity="0" /></radialGradient></defs>
			<text x={85} y={106} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={104} fill={B.goldL} stroke="#0A0503" strokeWidth={10} style={{paintOrder: 'stroke'}}>×3</text></g>}
		{tag190 > 0 && <NumTag x={700} y={650} label="容积" num="190" tail="立方米" w={560} sc={lerp(1.15, 1, tag190)} o={cl(tag190 * 3)} />}
		<Pool id="ptw" x={wx} y={GS - 160} rx={260} ry={200} a={0.2} />
		{t >= 23.6 && <rect x={tl} y={GS - 14} width={tr - tl} height={14} fill="#2A160E" opacity={0.8} />}
		<Walker51 x={wx} g={wg} h={h} pose={p} look={LOOKS51.zhou.look} />
		<Snow t={t} n={70} seed={6} y1={GS} o={0.6} />
	</Pic>; };

/* ======================= 7 · 战国 banquet 26.0–41.9: carry in (ghost fridge door) → exploded → section, pack → 先猜？ → 酒 → 温 ======================= */
const VX7 = 1140, VY7 = 880, VW7 = 420, G7 = jfGeom(VX7, VY7, VW7), G_ = 960, H7 = 600;
const Room: React.FC<{t: number}> = ({t}) => { const snowO = seg(t, 39.3, 39.8);
	return <g>
		<rect x={-40} y={300} width={W + 80} height={605} fill={BG.wall} />
		{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={160 + i * 330} y={340} width={320} height={500} fill="#1A0D09" stroke={BG.line} strokeWidth={1.5} />
			<rect x={176 + i * 330} y={356} width={288} height={468} fill="none" stroke={B.gold} strokeOpacity={0.12} strokeWidth={1.2} /></g>)}
		{/* the window (left): a warm summer night, then snow (J5) */}
		<rect x={196} y={500} width={248} height={250} fill={snowO > 0 ? '#121820' : '#2A1A10'} />
		<rect x={196} y={500} width={248} height={250} fill="#2A1A10" opacity={1 - snowO} />
		{snowO > 0 && <defs><clipPath id="win7"><rect x={196} y={500} width={248} height={250} /></clipPath></defs>}
		{snowO > 0 && <g clipPath="url(#win7)" opacity={snowO}><Snow x0={196} x1={444} y0={500} y1={750} n={40} t={t} seed={9} size={0.9} /></g>}
		<path d={`M196,500 h248 v250 h-248 Z M320,500 v250 M196,625 h248`} fill="none" stroke={B.gold} strokeOpacity={0.4} strokeWidth={3} />
		<ScrollBand y={420} x0={160} x1={1810} h={44} flow={20 + 6 * t} fill="#2A120C" />
		<rect x={-40} y={300} width={W + 80} height={4} fill={B.gold} opacity={0.18} />
		<Ground g={905} />
		<Pool id="r7" x={1060} y={640} rx={640} ry={400} a={0.3} />
		<rect x={VX7 - 310} y={VY7} width={620} height={22} fill="#2E1610" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} />
		<rect x={VX7 - 300} y={VY7 + 22} width={600} height={6} fill={B.redD} opacity={0.6} />
	</g>; };
/** where his far hand holds the ladle at t (same maths as the ladle drawing in Banquet) */
const POUR = 37.66;   // the pour cue
const ladleHand = (t: number): P2 => { const ld = seg(t, 37.25, 37.45), sw = eio(seg(t, 37.45, POUR)), CUP: P2 = [958, 540];
	const bowlDip: P2 = [VX7 + 6, G7.neckTop + 18], bowlUp: P2 = [VX7 - 10, G7.neckTop - 70], bowlPour: P2 = [CUP[0] + 22, CUP[1] - 62];
	const bowl: P2 = t < 37.45 ? [lerp(bowlUp[0], bowlDip[0], Math.sin(Math.PI * ld)), lerp(bowlUp[1], bowlDip[1], Math.sin(Math.PI * ld))] : [lerp(bowlUp[0], bowlPour[0], sw), lerp(bowlUp[1], bowlPour[1], sw)];
	const hAng = t < 37.45 ? Math.PI + 0.22 : lerp(Math.PI + 0.22, Math.PI + 0.42, sw); return [bowl[0] + 165 * Math.cos(hAng), bowl[1] + 165 * Math.sin(hAng)]; };
/** walking carry pose: both mittens under the block's lower corners */
const carryPose = (ph: number, walking: boolean) => ikArm(ikArm(walking ? walkPose(ph) : stand({lean: -2, neck: 8}), 'L', [0.17, 0.5]), 'R', [0.3, 0.52]);
const X_STOP = 450 + 146 * (28.6 - BA(46));
const CARRY_AT = (() => { const p = carryPose(0, false), a = J(p, 'LHand', X_STOP, G_, H7), b = J(p, 'RHand', X_STOP, G_, H7); return {x: (a[0] + b[0]) / 2 + 4, y: Math.min(a[1], b[1]) + 4}; })();
const Banquet: Fc = ({t}) => {
	/* walker: carries the block in (26.48 at x 450) → stops at 760 (28.6) → steps to 786 and packs (32.3–33.3) → hand to chin
	   (guess) → holds out his cup (J4) → steps on (41.0) */
	const xIn = t < 28.6 ? 450 + 146 * (t - BA(46)) : t < 32.3 ? 450 + 146 * (28.6 - BA(46)) : lerp(450 + 146 * (28.6 - BA(46)), 786, ease(seg(t, 32.3, 32.7)));
	const wx = t < 41.0 ? xIn : 786 + 260 * (t - 41.0);
	const gapC = G7.gapL, bw = G7.gapW * 0.86, bh = 112;
	const section = eio(seg(t, 32.25, 32.7)), cutX = lerp(VX7 - VW7 / 2 - 50, VX7 + VW7 / 2 + 50, section);
	const knock = BA(58);   // 33.274: the block knocks down into the gap
	const drop = eio(seg(t, 32.75, knock)), bTop0 = G7.yt - 150, bTopIn = G7.yt - 26, bTopDown = G7.yt + 60;
	const bTop = t < 32.75 ? bTop0 : t < knock ? lerp(bTop0, bTopIn, drop) : lerp(bTopIn, bTopDown, eout(seg(t, knock, knock + 0.12)));
	const iceLvl = t < knock ? 0.5 : 0.62, frost = lerp(0.2, 0.85, seg(t, knock, knock + 1.2));
	const lidOn = t > 34.55, lidDrop = seg(t, 34.4, 34.6);
	const exp = eio(seg(t, BA(52), BA(53))) * (1 - eio(seg(t, BA(55), BA(56))));   // the jar rises out (29.88–30.44), settles back (31.58–32.14)
	const lab = fade(t, BA(53), 0.3) * (1 - fade(t, 34.6, 0.35));
	const REVEAL = BA(64);   // 36.670 = DA(16), the chorus downbeat: 肉？/瓜果？ drop, 酒 lights, the jar lid pops
	const wineO = fade(t, 37.25, 0.25), jarLidUp = eout(seg(t, REVEAL, REVEAL + 0.3));
	const melt = seg(t, 39.45, 40.7), water = eout(seg(t, 39.6, 40.9));
	/* the walker's pose */
	let p: Pose;
	const holding = t < knock + 0.1;
	if (t < 28.6) p = carryPose(wph(146 * (t - BA(46)), H7), true);
	else if (t < 32.3) p = carryPose(0, false);
	else if (holding) { p = stand({lean: 14, neck: 24}); const bx = t < 32.75 ? lerp(CARRY_AT.x, gapC, ease(seg(t, 32.3, 32.7))) : gapC, by = (t < 32.75 ? lerp(CARRY_AT.y, bTop0 + bh, ease(seg(t, 32.3, 32.7))) : bTop + bh) - bh + 40;
		p = reach(reach(p, 'L', bx - bw * 0.45, by, wx, G_, H7), 'R', bx + bw * 0.05, by - 14, wx, G_, H7); }
	else if (t < 34.6) p = mixP(reach(reach(stand({lean: 14, neck: 24}), 'L', gapC - bw * 0.45, bTopDown + 30, wx, G_, H7), 'R', gapC, bTopDown + 16, wx, G_, H7), stand({lean: 4, neck: 10}), ease(seg(t, knock + 0.2, knock + 0.7)));
	else if (t < 37.25) p = mixP(stand({lean: 4, neck: 10}), reach(stand({lean: 4, neck: 6, la: 40, le: 90}), 'L', wx + 0.16 * H7, G_ - 0.86 * H7, wx, G_, H7), ease(seg(t, 34.6, 35.0)));
	else if (t < 41.0) { p = mixP(stand({lean: 4, neck: 6}), reach(stand({lean: 6, neck: 14}), 'L', 958, 540, wx, G_, H7), ease(seg(t, 37.25, 37.55)));
		if (t < 39.1) { const lh = ladleHand(t); p = mixP(p, reach(p, 'R', lh[0], lh[1], wx, G_, H7), fade(t, 37.2, 0.12) * (1 - fade(t, 38.85, 0.25))); } }
	else p = reach(walkPose(wph(260 * (t - 41.0), H7)), 'L', wx + 0.22 * H7, G_ - 0.6 * H7, wx, G_, H7);
	const cupHand = J(p, 'LHand', wx, G_, H7);
	/* the carried block: under the mittens while walking/standing; lifted over the gap (32.3–32.75); in the gap once dropped */
	const carried = t < 32.75;
	const cb = carried ? (() => { if (t >= 32.3) return {x: lerp(CARRY_AT.x, gapC, ease(seg(t, 32.3, 32.7))), y: lerp(CARRY_AT.y, bTop0 + bh, ease(seg(t, 32.3, 32.7)))};
		const a = J(p, 'LHand', wx, G_, H7), b = J(p, 'RHand', wx, G_, H7); return {x: (a[0] + b[0]) / 2 + 4, y: Math.min(a[1], b[1]) + 4}; })() : null;
	/* the ladle in his far hand: dips into the jar mouth (37.25–37.45), swings over his cup, pours from 37.66, put away */
	const ld = seg(t, 37.25, 37.45), sw = eio(seg(t, 37.45, POUR)), pour = seg(t, POUR, 38.6), back = eio(seg(t, 38.75, 39.1));
	const CUP: P2 = [958, 540], bowlDip: P2 = [VX7 + 6, G7.neckTop + 18], bowlUp: P2 = [VX7 - 10, G7.neckTop - 70], bowlPour: P2 = [CUP[0] + 22, CUP[1] - 62];
	const bowl: P2 = t < 37.45 ? [lerp(bowlUp[0], bowlDip[0], Math.sin(Math.PI * ld)), lerp(bowlUp[1], bowlDip[1], Math.sin(Math.PI * ld))] : [lerp(bowlUp[0], bowlPour[0], sw), lerp(bowlUp[1], bowlPour[1], sw)];
	const hAng = t < 37.45 ? Math.PI + 0.22 : lerp(Math.PI + 0.22, Math.PI + 0.42, sw);   // from the bowl back along the handle to his hand
	const lHand: P2 = [bowl[0] + 165 * Math.cos(hAng), bowl[1] + 165 * Math.sin(hAng)];
	const tilt = -55 * Math.sin(Math.PI * Math.min(1, pour * 1.2)) * (1 - back);
	const ladleO = fade(t, 37.25, 0.15) * (1 - seg(t, 38.85, 39.1));
	const cupO = fade(t, 37.25, 0.25), cupFrost = seg(t, 38.2, 39.0) * (1 - melt), steam = seg(t, 39.6, 40.4);
	const ghost = t < 27.74 ? 0 : t < 27.84 ? seg(t, 27.74, 27.84) : 1 - seg(t, 28.31, 28.4);
	const opts = ['肉？', '瓜果？', '酒？'], xs = [VX7 - 160, VX7 + 70, VX7 + 290], oy = G7.neckTop - 100;
	const pill = t > BA(61) - 0.05 ? land(seg(t, BA(61) - 0.05, BA(61) + 0.3)) : 0, tick = Math.sin((t - 35) * Math.PI / 0.566) * 3;
	const optO = (i: number) => (t < 34.95 ? 0 : fade(t, 34.97 + 0.04 * i, 0.12)) * (t < REVEAL ? 1 : i === 2 ? 1 : 1 - fade(t, REVEAL, 0.25)) * (1 - fade(t, 38.9, 0.4));
	const optDrop = (i: number) => i < 2 && t > REVEAL ? 80 * eio(seg(t, REVEAL, REVEAL + 0.35)) : 0;
	const vessel = <>
		{exp > 0 || t < 32.25 ? <>
			{exp > 0 && <JarWhole x={VX7} y={VY7} w={VW7} dy={240 * exp} />}
			<Jianfou x={VX7} y={VY7} w={VW7} jar={exp <= 0} id="b7w" />
		</> : null}
		{t >= 32.25 && <g>
			<defs><clipPath id="b7cA"><rect x={-100} y={0} width={cutX + 100} height={H} /></clipPath><clipPath id="b7cB"><rect x={cutX} y={0} width={W} height={H} /></clipPath></defs>
			<g clipPath="url(#b7cA)"><Jianfou x={VX7} y={VY7} w={VW7} mode="section" ice={iceLvl * (1 - melt)} water={water} lid={lidOn} frost={frost * (1 - melt)} wine wineO={wineO} jarLidOff={jarLidUp * (1 - seg(t, 39.6, 40.2))} id="b7s"
				slot={t < knock + 0.2 && t >= 32.75 ? <IceBlock x={gapC} y={bTop + bh} w={bw} h={bh} d={22} seed={77} /> : null} /></g>
			{section < 1 && <g clipPath="url(#b7cB)"><Jianfou x={VX7} y={VY7} w={VW7} id="b7w2" /></g>}
			{section > 0 && section < 1 && <path d={`M${cutX},${G7.neckTop - 90} V${VY7 + 10}`} stroke={B.goldL} strokeWidth={3} />}
			{!lidOn && lidDrop > 0 && (() => { const {nw, yt, yl, w} = G7, L = VX7 - w / 2, R = VX7 + w / 2, dy = -90 * (1 - eio(lidDrop));
				return <path transform={`translate(0,${dy})`} opacity={lidDrop} d={`M${L - w * 0.01},${yt} L${VX7 - nw / 2 - w * 0.015},${yt} L${VX7 - nw / 2 - w * 0.015},${yl} L${L - w * 0.01},${yl} Z M${VX7 + nw / 2 + w * 0.015},${yt} L${R + w * 0.01},${yt} L${R + w * 0.01},${yl} L${VX7 + nw / 2 + w * 0.015},${yl} Z`} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={2} />; })()}
		</g>}
		{/* the jar lid hops off for the ladle (J4) and rests on the basin lid */}
	</>;
	return <Pic id="b7" sheen={0.28}>
		<Room t={t} />
		{/* the ghost of the open fridge door frames the vessel for one beat (开头那件) */}
		{ghost > 0 && <g opacity={0.35 * ghost}>
			{/* the frame-0 fridge for one beat: cabinet, cold blue interior washing the vessel, the open door */}
			<rect x={VX7 - 300} y={G7.neckTop - 170} width={600} height={VY7 - G7.neckTop + 200} rx={22} fill="#6B6762" />
			<rect x={VX7 - 270} y={G7.neckTop - 140} width={540} height={VY7 - G7.neckTop + 150} rx={8} fill="#A6C1CE" />
			<rect x={VX7 - 120} y={G7.neckTop - 120} width={240} height={10} rx={5} fill="#F4FBFF" />
			<path d={`M${VX7 - 300},${G7.neckTop - 150} L${VX7 - 520},${G7.neckTop - 200} L${VX7 - 520},${VY7 + 90} L${VX7 - 300},${VY7 + 30} Z`} fill="#B9C6CC" stroke="#E8F2F6" strokeWidth={3} />
			{[0.3, 0.55, 0.8].map((u, i) => <path key={i} d={`M${VX7 - 320},${lerp(G7.neckTop - 140, VY7 + 20, u)} L${VX7 - 500},${lerp(G7.neckTop - 180, VY7 + 70, u)}`} stroke="#E0EAEE" strokeWidth={8} strokeLinecap="round" />)}</g>}
		{vessel}
		{/* exploded-view labels, kept through the pack (KF07) */}
		{lab > 0 && <g opacity={lab}>
			<path d={`M${VX7 + VW7 / 2 + 4},${G7.yt + 230} L1486,${G7.yt + 230}`} stroke={B.cream} strokeOpacity={0.6} strokeWidth={2} />
			<Lab x={1496} y={G7.yt + 250} s="鉴 · 盆" fs={58} />
			<path d={`M${VX7 + 0.2 * VW7},${G7.yt + 40 - 240 * exp} L1486,${G7.neckTop - 10}`} stroke={B.cream} strokeOpacity={0.6} strokeWidth={2} />
			<Lab x={1496} y={G7.neckTop + 10} s="缶 · 罐" fs={58} />
		</g>}
		{t > knock && t < 35.0 && <g opacity={fade(t, knock, 0.2) * (1 - fade(t, 34.6, 0.3))}>{(() => { const gx = G7.gapR, ty = G7.yt + 60; return <>
			<path d={`M${gx + 70},${ty - 120} Q${gx + 30},${ty - 90} ${gx + 6},${ty - 10}`} fill="none" stroke={B.goldL} strokeWidth={4} strokeLinecap="round" />
			<path d={`M${gx - 8},${ty - 26} L${gx + 4},${ty + 4} L${gx + 24},${ty - 20}`} fill="none" stroke={B.goldL} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" /></>; })()}</g>}
		{t > knock && t < knock + 0.5 && <Burst x={gapC} y={G7.yt + 10} s={110} k={seg(t, knock, knock + 0.5)} seed={7} />}
		{/* steam (J5): from the warm water in the gaps and from his cup */}
		{steam > 0 && <g fill="none" stroke="#F2E6CC" strokeLinecap="round" opacity={0.55 * steam}>{[G7.gapL, G7.gapR, cupHand[0] + 4].map((x, i) => <path key={i} d={curl(x + 6 * Math.sin(t * 2 + i), (i < 2 ? G7.yt - 20 : cupHand[1] - 60) - 30 * ((t * 0.6 + i * 0.3) % 1), i < 2 ? 22 : 14, i % 2 ? -1 : 1, 2.2, 0.5)} strokeWidth={3} />)}</g>}
		{carried && cb && <IceBlock x={cb.x} y={cb.y} w={bw} h={bh} d={22} seed={77} />}
		<Pool id="b7f" x={wx} y={G_ + 4} rx={240} ry={34} a={0.22} />
		{ladleO > 0 && <g opacity={ladleO}>
			<path d={`M${bowl[0]},${bowl[1]} L${lHand[0]},${lHand[1]}`} stroke="#C08A4A" strokeWidth={7} strokeLinecap="round" />
			<g transform={`translate(${bowl[0]},${bowl[1]}) rotate(${tilt})`}><path d="M-24,-6 Q-22,16 0,18 Q22,16 24,-6 Z" fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={1.5} /></g>
			{pour > 0 && pour < 0.95 && <path d={`M${bowl[0] - 16},${bowl[1] + 8} Q${bowl[0] - 20},${(bowl[1] + CUP[1]) / 2} ${CUP[0] + 6},${CUP[1] - 18}`} stroke="#7A2418" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />}
		</g>}
		<Walker51 x={wx} g={G_} h={H7} pose={p} look={LOOKS51.zhanguo.look} />
		{/* his cup (J4 →): frosts when the chilled wine is in, steams in winter */}
		{cupO > 0 && <g opacity={cupO}><g transform={`translate(${cupHand[0] + 4},${cupHand[1] + 8})`}>
			<path d="M-24,-30 Q-22,-4 0,0 Q22,-4 24,-30 Z" fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={1.5} />
			<ellipse cx={0} cy={-30} rx={24} ry={5} fill={pour > 0.2 ? '#5A1E14' : '#2A160C'} />
			{cupFrost > 0 && Array.from({length: 12}, (_, i) => <circle key={i} cx={-20 + 40 * rnd(i, 3)} cy={-26 + 24 * rnd(i, 4)} r={1.5} fill="#F2FAFF" opacity={cupFrost} />)}
		</g><ellipse cx={cupHand[0] + 2} cy={cupHand[1] + 6} rx={14} ry={13} fill={B.lac} /></g>}
		{/* the ladle and the server's forearm */}

		{/* 先猜？ and the three guesses over the jar mouth; 酒 lights up on BA(65) = 37.237 */}
		{opts.map((o, i) => { const oo = optO(i); if (oo <= 0) return null; const lit = i === 2 && t > REVEAL ? land(seg(t, REVEAL, REVEAL + 0.35)) : 0;
			return <g key={i} opacity={oo}><path d={`M${xs[i]},${oy + 18} Q${lerp(xs[i], VX7, 0.6)},${oy + 60} ${VX7 + (i - 1) * 30},${G7.neckTop - 40}`} stroke={B.cream} strokeOpacity={0.25 * (1 - lit)} strokeWidth={2} fill="none" strokeDasharray="5 7" />
				<g transform={`translate(${xs[i]},${oy + 4 * Math.sin(t * 2.4 + i) + optDrop(i)}) scale(${1 + 0.35 * lit}) translate(${-xs[i]},${-oy})`}><Lab x={xs[i]} y={oy} s={lit > 0 ? '酒' : o} fs={56} anchor="middle" o={0.88 + 0.12 * lit} col={lit > 0 ? B.goldL : B.cream} /></g></g>; })}
		{pill > 0 && t < 37.0 && <g opacity={cl(pill * 3) * (1 - fade(t, REVEAL - 0.05, 0.2))} transform={`translate(1540,${G7.yt + 132}) rotate(${-4 + tick}) scale(${lerp(1.4, 1, pill)}) translate(-110,-42)`}><rect x={0} y={0} width={220} height={84} rx={42} fill={B.goldL} /><text x={110} y={60} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={52} fill={B.lac}>先猜？</text></g>}
	</Pic>; };

/* ======================= 8 · W1 41.5–46.3: he walks on with his cup; a noble at a high table takes it (on BA(76) = 43.463) ======================= */
const W1: Fc = ({t}) => { const g = 960, h = 600;
	/* he walks on from the banquet (same pose/place through the dissolve), the camera overtakes him until he sits at screen x 260;
	   stops 42.85–44.6 at the high table */
	const walkD = (tt: number) => 260 * Math.min(tt - 41.0, 42.85 - 41.0) + 260 * Math.max(0, tt - 44.6);
	const sx = lerp(786 + 260 * (Math.min(t, 41.85) - 41.0), W1X, eio(seg(t, 41.85, 42.85)));
	const camX = walkD(t) - (sx - W1X), wx = sx;
	const stop = t >= 42.85 && t < 44.6;
	const tableX = walkD(42.85) + 560;   // world x of the high table's front
	const take = BA(76), cupK = seg(t, take - 0.12, take + 0.12), up = eio(seg(t, take + 0.35, take + 1.1));
	let p: Pose;
	if (stop) { const hold: P2 = [sx + 0.3 * h, g - 0.66 * h]; p = t < take + 0.15 ? reach(stand({lean: 8, neck: 2}), 'L', hold[0], hold[1], wx, g, h) : mixP(reach(stand({lean: 8, neck: 2}), 'L', hold[0], hold[1], wx, g, h), stand({lean: 2, neck: 18}), ease(seg(t, take + 0.15, take + 0.7))); }
	else p = ikArm(walkPose(wph(walkD(t), h)), 'L', [0.22, 0.6]);
	const ch = J(p, 'LHand', wx, g, h);
	const nx = tableX - camX + 120, ng = g - 130, nh = 470;
	const np = t < take ? reach(stand({lean: 8, neck: 10}), 'L', sx + 0.3 * h + 26, g - 0.66 * h - 10, nx, ng, nh, true) : mixP(reach(stand({lean: 8, neck: 10}), 'L', sx + 0.3 * h + 26, g - 0.66 * h - 10, nx, ng, nh, true), reach(stand({lean: -4, neck: -10}), 'L', nx + 120, ng - 0.95 * nh, nx, ng, nh, true), up);
	const nh2 = J(np, 'LHand', nx, ng, nh, true);
	const cupP: P2 = t < take ? [ch[0] + 4, ch[1]] : [nh2[0] - 4, nh2[1]];
	const cols = Array.from({length: 12}, (_, i) => -200 + i * 360 - (camX * 1.0) % 360);
	return <Pic id="w1" sheen={0.25 + camX * 0.0002}>
		<rect x={-40} y={300} width={W + 80} height={605} fill={BG.wall} />
		<g transform={`translate(${-camX * 0.4},0)`}>{Array.from({length: 10}, (_, i) => <rect key={i} x={i * 420} y={360} width={300} height={420} fill="#1A0D09" stroke={BG.line} strokeWidth={1.5} />)}</g>
		<ScrollBand y={330} x0={-40} x1={W + 40} h={40} flow={camX} fill="#2A120C" />
		{cols.map((x, i) => <rect key={i} x={x} y={300} width={46} height={605} fill="#2E130D" stroke={BG.line} strokeWidth={1.2} />)}
		<Ground g={g} />
		<Pool id="w1" x={sx + 300} y={600} rx={560} ry={380} a={0.28} />
		{/* the high table on a dais; a noble behind it; a seated figure higher up the table (dim) */}
		<g transform={`translate(${tableX - camX},0)`}>
			<rect x={-20} y={g - 130} width={760} height={130} fill="#26120D" stroke={B.gold} strokeOpacity={0.4} strokeWidth={1.5} />
			{[0, 1, 2].map((i) => <rect key={i} x={-20 - 40 * (2 - i)} y={g - 44 * (i + 1)} width={60} height={44} fill="#2E1610" stroke={BG.line} strokeWidth={1} />)}
			<rect x={40} y={g - 300} width={640} height={24} fill="#3A2116" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} />
			<rect x={60} y={g - 276} width={14} height={146} fill={BG.post} /><rect x={646} y={g - 276} width={14} height={146} fill={BG.post} />
		</g>
		{(() => { const sxx = tableX - camX + 470, sp = seated({lean: 2, neck: 8, la: 40, le: 70}); return <RimFig x={sxx} ground={g - 130} h={430} pose={sp.pose} look={{dress: 'robe', head: 'guan', beard: 'long', build: 1.15}} col="#0F0806" flip dx={-2.5} dy={-2} rimO={0.45} />; })()}
		<RimFig x={nx} ground={ng} h={nh} pose={np} look={{dress: 'robe', head: 'guan', beard: 'short', build: 1.12}} col="#0F0806" flip dx={-2.5} dy={-2} rimO={0.6} />
		<Pool id="w1f" x={wx} y={g + 4} rx={240} ry={34} a={0.22} />
		<Walker51 x={wx} g={g} h={h} pose={p} look={LOOKS51.zhanguo.look} />
		{/* the cup: in his hand → the noble's → up the table */}
		<g transform={`translate(${cupP[0]},${cupP[1] + 8})`} opacity={1 - seg(t, 45.0, 45.4)}>
			<path d="M-22,-28 Q-20,-4 0,0 Q20,-4 22,-28 Z" fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={1.5} /><ellipse cx={0} cy={-28} rx={22} ry={5} fill="#5A1E14" />
			{t < take && <path d={curl(2, -50 - 20 * ((t * 0.6) % 1), 10, 1, 2, 0.5)} fill="none" stroke="#F2E6CC" strokeWidth={2.5} opacity={0.5} />}
		</g>
		<ellipse cx={cupP[0] - 2} cy={cupP[1] + 6} rx={13} ry={12} fill={t < take ? B.lac : '#0F0806'} />
		{cupK > 0 && cupK < 1 && <ellipse cx={ch[0] + 4} cy={ch[1] + 6} rx={13} ry={12} fill={B.lac} />}
	</Pic>; };

/* ======================= 9 · 唐 45.2–56.4: the ice mountain (KF09), 酥山 handed over, frosted at the cellar, the cone ghost ======================= */
type Peak = [number, number, number, number];
const IceMountain: React.FC<{x: number; base: number; s?: number}> = ({x, base, s = 1}) => {
	const back: Peak[] = [[-150, 120, 300, 10], [150, 130, 335, -12], [10, 100, 395, 4]];
	const front: Peak[] = [[-215, 115, 235, 14], [-60, 95, 175, -6], [0, 175, 430, 0], [80, 90, 205, 8], [230, 125, 270, -14], [320, 70, 140, -6]];
	const peak = (pk: Peak, k: number, o: number, dim: boolean) => { const [cx0, hw0, hh0, ln] = pk, cx = x + cx0 * s, hw = hw0 * s, hh = hh0 * s, ax = cx + ln * s, ay = base - hh, mx = cx + hw * 0.08;
		const sh = (u: number, v: number): P2 => [lerp(lerp(cx - hw, ax, v), lerp(mx, ax, v), u), lerp(base, ay, v)];
		const SL: P2 = [lerp(cx - hw, ax, 0.55) - hw * 0.16, lerp(base, ay, 0.55)], SR: P2 = [lerp(cx + hw, ax, 0.4) + hw * 0.14, lerp(base, ay, 0.4)];
		const f1 = sh(0.15, 0.35), f2 = sh(0.7, 0.62), f3 = sh(0.35, 0.82);
		return <g key={k} opacity={o}>
			<path d={`M${cx - hw},${base} L${SL[0]},${SL[1]} L${ax},${ay} L${mx},${base} Z`} fill="url(#iceLit)" />
			<path d={`M${ax},${ay} L${SR[0]},${SR[1]} L${cx + hw},${base} L${mx},${base} Z`} fill="url(#iceShd)" />
			<path d={`M${f1[0]},${f1[1]} L${f3[0]},${f3[1]} L${f2[0]},${f2[1]} Z`} fill="#FFFFFF" opacity={dim ? 0.18 : 0.32} />
			<path d={`M${ax},${ay + hh * 0.12} L${lerp(ax, cx + hw, 0.55)},${lerp(ay, base, 0.5)} L${lerp(ax, mx, 0.45)},${lerp(ay, base, 0.42)} Z`} fill="#4A82A0" opacity={dim ? 0.25 : 0.4} />
			<path d={`M${lerp(cx - hw, ax, 0.25) + hw * 0.18},${lerp(base, ay, 0.22)} L${lerp(cx - hw, ax, 0.7) + hw * 0.1},${lerp(base, ay, 0.68)}`} stroke="#FFFFFF" strokeWidth={Math.max(2, hw * 0.05)} strokeLinecap="round" opacity={dim ? 0.3 : 0.6} />
			<g stroke={ICE.deep} strokeWidth={2.2} strokeLinecap="round" opacity={dim ? 0.35 : 0.7}>{[0.25, 0.45, 0.65].map((v, i) => { const q = [lerp(mx, ax, v), lerp(base, ay, v)]; return <path key={i} d={`M${q[0] - 2},${q[1]} l${-hw * 0.14},${hh * 0.03}`} />; })}</g>
			<path d={`M${cx - hw},${base} L${SL[0]},${SL[1]} L${ax},${ay} L${mx},${base}`} fill="none" stroke="#FFFFFF" strokeWidth={dim ? 1.6 : 3} strokeLinejoin="round" opacity={dim ? 0.6 : 0.95} />
			<path d={`M${ax},${ay} L${SR[0]},${SR[1]} L${cx + hw},${base}`} fill="none" stroke="#DFF1FA" strokeWidth={1.5} opacity={0.5} />
		</g>; };
	return <g>{back.map((q, i) => peak(q, i, 0.72, true))}{front.map((q, i) => peak(q, 10 + i, 0.9, false))}
		<IceBlock x={x} y={base + 42 * s} w={720 * s} h={42 * s} d={40 * s} o={0.95} seed={5} /></g>; };
const Mist: React.FC<{pts: [number, number, number, number][]; o?: number; t: number}> = ({pts, o = 0.5, t}) => <g>
	<g filter="url(#mist)" opacity={o * 0.8}>{pts.map(([x, y, r, d], i) => <ellipse key={i} cx={x + d * r * 1.2 + d * 30 * ((t * 0.3 + i * 0.2) % 1)} cy={y + r * 0.1} rx={r * 2.4} ry={r * 0.55} fill="#DCEFF9" opacity={0.35} />)}</g>
	<g fill="none" stroke="#E4F4FC" strokeLinecap="round" opacity={o}>{pts.map(([x, y, r, d], i) => <path key={i} d={curl(x + d * 20 * Math.sin(t * 0.8 + i), y, r, d, 3.2, 0.4)} strokeWidth={Math.max(2, r * 0.09)} />)}</g>
</g>;
const Guest: React.FC<{x: number; g: number; h: number; flip?: boolean; lean?: number; look?: {dress: 'robe' | 'dress'; head: 'futou' | 'bun' | 'long'}}> = ({x, g, h, flip, lean = -16, look = {dress: 'robe', head: 'futou'}}) => {
	const {pose, seat} = seated({lean, neck: -10, la: 50, le: 80, ra: -10, re: 30, lt: 80, rt: 76});
	const sy = g - seat * h, hx = J(pose, 'Hips', x, g, h, flip)[0];
	return <g>
		<path d={`M${hx - 0.13 * h},${sy} Q${hx},${sy + 0.05 * h} ${hx + 0.13 * h},${sy} L${hx + 0.1 * h},${sy + 0.03 * h} L${hx + 0.08 * h},${g} L${hx + 0.05 * h},${g} L${hx},${sy + 0.06 * h} L${hx - 0.05 * h},${g} L${hx - 0.08 * h},${g} L${hx - 0.1 * h},${sy + 0.03 * h} Z`} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.2} />
		<RimFig x={x} ground={g} h={h} pose={pose} look={look} col="#120A07" flip={flip} dx={flip ? -2.5 : 2.5} dy={-2} rimO={0.6} />
	</g>; };
/** a craftsman chiselling a peak; k = 0 (mallet raised) … 1 (struck) */
const Carver: React.FC<{x: number; g: number; h: number; tip: P2; flip?: boolean; k: number; hit: number}> = ({x, g, h, tip, flip, k, hit}) => {
	const sgn = flip ? -1 : 1, grip: P2 = [tip[0] - sgn * 34, tip[1] + 14], back: P2 = [tip[0] - sgn * 62, tip[1] + 25];
	let p = grounded({lean: 14, neck: -12, lt: 10, lk: 12, rt: -10, rk: 8, la: 40, le: 40, ra: 150, re: 30});
	p = ikArm(p, 'L', toBody(grip[0], grip[1], x, g, h, flip));
	const mh: P2 = [lerp(x + sgn * 0.27 * h, back[0] - sgn * 10, k), lerp(g - 1.0 * h, back[1] - 30, k)];
	p = ikArm(p, 'R', toBody(mh[0], mh[1], x, g, h, flip));
	const rh = J(p, 'RHand', x, g, h, flip), mEnd: P2 = [rh[0] - sgn * lerp(34, -10, k), rh[1] - lerp(50, 20, k)];
	return <g>
		<path d={`M${rh[0] + sgn * 6},${rh[1] + 10} L${mEnd[0]},${mEnd[1]}`} stroke="#8A6232" strokeWidth={7} strokeLinecap="round" />
		<rect x={mEnd[0] - 22} y={mEnd[1] - 14} width={44} height={28} rx={5} fill="#5A3A20" stroke={B.gold} strokeOpacity={0.4} strokeWidth={1.5} transform={`rotate(${sgn * lerp(-36, 20, k)},${mEnd[0]},${mEnd[1]})`} />
		<path d={`M${back[0]},${back[1]} L${tip[0]},${tip[1]}`} stroke="#9AA4AB" strokeWidth={7} strokeLinecap="round" />
		<path d={`M${back[0]},${back[1]} L${lerp(back[0], tip[0], 0.45)},${lerp(back[1], tip[1], 0.45)}`} stroke="#6B4A2A" strokeWidth={10} strokeLinecap="round" />
		<RimFig x={x} ground={g} h={h} pose={p} look={{dress: 'tunic', legs: 'trousers', head: 'bun'}} col="#120A07" flip={flip} dx={flip ? -2.5 : 2.5} dy={-2} rimO={0.65} />
		<Burst x={tip[0]} y={tip[1]} s={80} k={hit} seed={flip ? 3 : 1} dir={-sgn} />
	</g>; };
/** the 酥山 on its dish: three piped peaks drawn one per beat (k0..k2), frost f, tints on the tips */
const SuShanP: React.FC<{x: number; y: number; s: number; ks: number[]; f: number}> = ({x, y, s, ks, f}) => { const k = s / 100;
	const peak = (cx: number, base: number, ht0: number, wd: number, tint: string, i: number, kk: number) => { if (kk <= 0) return null; const ht = ht0 * eout(kk), top = base - ht;
		const body = `M${cx - wd / 2},${base} Q${cx - wd * 0.46},${base - ht * 0.45} ${cx - wd * 0.14},${top + ht * 0.2} Q${cx - wd * 0.02},${top - ht * 0.04} ${cx + wd * 0.12},${top + ht * 0.05} Q${cx + wd * 0.1},${top + ht * 0.16} ${cx + wd * 0.16},${top + ht * 0.24} Q${cx + wd * 0.46},${base - ht * 0.45} ${cx + wd / 2},${base} Z`;
		const bands = [0.22, 0.45, 0.68].map((u) => { const yy = top + ht * (0.18 + u * 0.8), hw = wd * (0.12 + 0.4 * u); return `M${cx - hw},${yy} Q${cx},${yy + ht * 0.12} ${cx + hw},${yy - ht * 0.04}`; }).join(' ');
		return <g key={i}><path d={body} fill={B.cream} stroke="#BFA77C" strokeWidth={1.2} />
			<path d={bands} stroke="#C9B08A" strokeWidth={2 * k} fill="none" strokeLinecap="round" />
			<path d={`M${cx - wd * 0.14},${top + ht * 0.2} Q${cx - wd * 0.02},${top - ht * 0.04} ${cx + wd * 0.12},${top + ht * 0.05}`} fill="none" stroke={tint} strokeWidth={4 * k} strokeLinecap="round" opacity={0.35 + 0.45 * f} />
			{kk < 1 && <path d={`M${cx},${top - 4} V${top - 60 * k}`} stroke={B.cream} strokeWidth={3 * k} opacity={1 - kk} />}</g>; };
	return <g transform={`translate(${x},${y})`}>
		<ellipse cx={0} cy={-4 * k} rx={64 * k} ry={13 * k} fill="#2A1710" stroke={B.gold} strokeOpacity={0.7} strokeWidth={2} />
		<ellipse cx={0} cy={-7 * k} rx={54 * k} ry={9 * k} fill="#3A2116" />
		{peak(-30 * k, -6 * k, 52 * k, 40 * k, '#C8503A', 0, ks[0])}{peak(28 * k, -6 * k, 48 * k, 38 * k, '#5E9A6A', 1, ks[2])}{peak(0, -2 * k, 76 * k, 48 * k, '#C8503A', 2, ks[1])}
		{f > 0 && Array.from({length: 22}, (_, i) => <circle key={i} cx={(-46 + 92 * rnd(i, 3)) * k} cy={(-10 - 64 * rnd(i, 4) * (1 - Math.abs(rnd(i, 3) - 0.5) * 1.4)) * k} r={1.6 * k} fill="#F4FBFF" opacity={f * (0.5 + 0.5 * rnd(i, 5))} />)}
	</g>; };
const CELLAR = 2370, TANG_G = 905, TANG_H = 540, TW0 = 300, TANG_WALK = 48.9;
const tangWX = (t: number) => t < 45.727 ? 260 - 80 * (45.727 - t) : t < 46.3 ? lerp(260, TW0, ease(seg(t, 45.727, 46.3))) : t < TANG_WALK ? TW0 : TW0 + V(TANG_H) * (t - TANG_WALK);
const tangCam = (t: number) => Math.max(0, tangWX(t) - HANDOFF.x);
const Tang: Fc = ({t}) => { const g = TANG_G, mx = 990, base = 820, h = TANG_H;
	const camX = tangCam(t), wxW = tangWX(t), wx = wxW - camX;
	const z = 1 + 0.06 * eio(seg(t, 50.0, 52.0));
	const walking = t < 46.3 || t >= TANG_WALK;
	const plateT = BA(88);   // 50.256: the servant's plate reaches his hand
	const has = t >= plateT - 0.05;
	const dip = bump(t, 53.25, 0.9);
	let p: Pose = walking ? walkPose(wph(Math.abs(wxW - 260), h)) : grounded({lean: -2, neck: -22, lt: 4, lk: 4, rt: -6, rk: 5, la: 6, le: 20, ra: 4, re: 12});
	if (has) p = ikArm(p, 'L', [0.26, 0.6 - 0.12 * dip]);
	else if (!walking) p = ikArm(p, 'L', [0.12, 0.42]);
	const ph = J(p, 'LHand', wx, g, h);
	const ks = [BA(89), BA(90), BA(91)].map((b) => seg(t, b - 0.28, b));
	const frost = seg(t, 53.45, 54.3);
	/* a servant stands in his path and holds out the plate; it changes hands on BA(88), she stays behind as he walks on */
	const servW = 1120, servX = servW - camX, sp = reach(stand({lean: 8, neck: 12}), 'L', Math.max(ph[0] + 40, servX - 0.3 * 500), Math.min(ph[1], g - 0.5 * 500), servX, g, 500, true);
	const sh = J(sp, 'LHand', servX, g, 500, true);
	const plateP: P2 = has ? [ph[0] + 26, ph[1] - 2] : [sh[0] - 26, sh[1] - 2];
	const focus = fade(t, 49.6, 0.5) * 0.4;   // the hall dims behind the hand-over so the plate reads
	const strike = (b: number) => { const u = ((t - b) / 0.566 + 10) % 2; return u < 1 ? {k: eio(Math.min(1, u * 3)), hit: seg(u, 0.33, 0.95)} : {k: 1 - eio(Math.min(1, (u - 1) * 1.4)), hit: 0}; };
	const s1 = strike(BA(81) - 0.19), s2 = strike(BA(82) - 0.19);
	const cellarX = CELLAR - camX;
	const cone = bump(t, BA(95), 0.56);
	return <Pic id="tg" sheen={0.25 + camX * 0.0001}>
		<g transform={`translate(${wx},${g}) scale(${z}) translate(${-wx},${-g})`}>
		<g transform={`translate(${-camX},0)`}>
			<rect x={-40} y={330} width={W * 2.5} height={g - 330} fill={BG.wall} />
			{[[180, 420], [1480, 420], [2200, 420], [2900, 420], [3600, 420], [4300, 420]].map(([x0, w], i) => <g key={i}><rect x={x0} y={360} width={w} height={300} fill="#5A3018" opacity={0.55} />
				<path d={Array.from({length: 26}, (_, k) => `M${x0},${372 + k * 11} h${w}`).join(' ')} stroke="#2A140C" strokeWidth={4} opacity={0.75} />
				<rect x={x0} y={360} width={w} height={300} fill="none" stroke={BG.lineS} strokeWidth={2} /></g>)}
			<rect x={-40} y={310} width={W * 2.5} height={34} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
			{[110, 650, 1340, 1830, 2400, 2950, 3500, 4050, 4600].map((x0, i) => <rect key={i} x={x0} y={344} width={44} height={g - 344} fill="#2E130D" stroke={BG.line} strokeWidth={1.2} />)}
			<Pool id="tg" x={mx} y={600} rx={760} ry={430} a={0.3} />
			<rect x={mx - 420} y={base + 42} width={840} height={g - base - 42} fill="#2A1710" stroke={B.gold} strokeOpacity={0.35} strokeWidth={1.5} />
			<IceMountain x={mx} base={base} />
			<Ground g={g} x0={-40} x1={W * 2.5} />
			<Guest x={480} g={g} h={500} lean={-16 - 4 * Math.sin(t * 1.3)} />
			<Guest x={1660} g={g} h={500} flip lean={-16 - 3 * Math.sin(t * 1.1 + 1)} />
			<Guest x={1500} g={g} h={470} flip look={{dress: 'dress', head: 'bun'}} lean={-20} />
			<Carver x={640} g={g - 30} h={470} tip={[749, 637]} k={s1.k} hit={s1.hit} />
			<Carver x={1340} g={g - 30} h={470} tip={[1257, 640]} flip k={s2.k} hit={s2.hit} />
			<rect x={570} y={g - 30} width={150} height={30} fill="#2A1710" stroke={B.gold} strokeOpacity={0.35} strokeWidth={1.2} />
			<rect x={1265} y={g - 30} width={150} height={30} fill="#2A1710" stroke={B.gold} strokeOpacity={0.35} strokeWidth={1.2} />
			<Mist t={t} pts={[[mx - 380, 860, 40, -1], [mx - 470, 885, 32, -1], [mx + 380, 860, 40, 1], [mx + 470, 885, 32, 1], [mx - 180, 870, 26, -1], [mx + 200, 872, 26, 1]]} o={0.55} />
			{/* the ice cellar's mouth in the floor further on, breathing cold */}
			<path d={`M${CELLAR - 170},${g + 6} L${CELLAR + 170},${g + 6} L${CELLAR + 220},${g + 60} L${CELLAR - 220},${g + 60} Z`} fill="#040202" stroke={SNOW} strokeOpacity={0.3} strokeWidth={2.5} />
		</g>
		{focus > 0 && <rect x={-100} y={0} width={W + 200} height={H} fill="#0A0503" opacity={focus} />}
		{/* the cellar's cold breath: a column rising from the floor mouth up to the plate */}
		<Mist t={t} pts={Array.from({length: 7}, (_, i): [number, number, number, number] => [cellarX + (i % 2 ? 50 : -60) + 10 * Math.sin(t * 1.5 + i), g - 20 - i * 58 - 20 * ((t * 0.7 + i * 0.15) % 1), 30 - i * 1.5, i % 2 ? 1 : -1])} o={0.65 * (1 - seg(t, 54.6, 55.4)) * seg(t, 52.4, 52.9)} />
		{/* the servant who hands him the plate */}
		{servX > -200 && servX < W + 200 && t < 51.2 && <g opacity={1 - fade(t, 50.65, 0.5)} transform={`translate(${60 * ease(seg(t, 50.5, 51.1))},0)`}><RimFig x={servX} ground={g} h={500} pose={sp} look={{dress: 'dress', head: 'bun'}} col="#1A0F0A" flip dx={-2.5} dy={-2} rimO={0.75} /></g>}
		<Pool id="tgf" x={wx} y={g + 4} rx={240} ry={34} a={0.22} />
		<Walker51 x={wx} g={g} h={h} pose={p} look={LOOKS51.tang.look} />
		{t > 49.6 && <SuShanP x={plateP[0]} y={plateP[1]} s={118} ks={ks} f={frost} />}
		{has && <ellipse cx={ph[0] + 3} cy={ph[1] + 4} rx={13} ry={12} fill={B.lac} />}
		{cone > 0 && <g opacity={0.6 * cone} fill="none" stroke="#F2E6CC" strokeWidth={3} strokeDasharray="8 7" transform={`translate(${plateP[0] + 120},${plateP[1] - 20})`}>
			<path d="M-26,-40 L0,40 L26,-40" /><path d="M-30,-40 Q-30,-84 0,-88 Q30,-84 30,-40 Z" /><path d="M-20,-40 l40,40 M-10,-40 l30,30 M20,-40 l-40,40" opacity={0.5} /></g>}
		</g>
	</Pic>; };

/* ======================= the cut: layers + the foreground wipes ======================= */
const early = (t: number): React.ReactNode => {
	if (t < 4.25) return <Hook t={t} />;
	if (t < 4.6) return <><Hook t={t} /><div style={{position: 'absolute', inset: 0, opacity: ease(seg(t, 4.4, 4.6))}}><LidShot t={t} /></div></>;
	if (t < 7.0) return <LidShot t={t} />;
	if (t < 7.9) return <Rewind t={t} />;
	if (t < 8.1) return <><Rewind t={t} /><div style={{position: 'absolute', inset: 0, opacity: ease(seg(t, 7.9, 8.1))}}><River t={t} /></div></>;
	return <River t={t} />;
};
const mid = (t: number): React.ReactNode => t < 20.8 ? <Zhou80 t={t} /> : t < 21.15 ? <><Zhou80 t={t} /><div style={{position: 'absolute', inset: 0, opacity: ease(seg(t, 20.8, 21.15)), transform: `translateY(${60 * (1 - ease(seg(t, 20.8, 21.15)))}px)`}}><Pit t={t} /></div></> : <Pit t={t} />;
const W1X = 260;
const late = (t: number): React.ReactNode => t < 41.5 ? <Banquet t={t} /> : t < 41.85 ? <><Banquet t={t} /><div style={{position: 'absolute', inset: 0, opacity: ease(seg(t, 41.5, 41.85))}}><W1 t={t} /></div></> : <W1 t={t} />;
const WIPES: {cross: number; kind: PillarKind; x0: number}[] = [{cross: BA(29), kind: 'banner', x0: 860}, {cross: BA(46), kind: 'screen', x0: 1000}, {cross: BA(80), kind: 'gate', x0: W1X}];   // x0 = where the new picture's walker is at the crossing
export const PartA: Fc = ({t}) => <div style={{position: 'absolute', inset: 0, background: '#0A0503', overflow: 'hidden'}}>
	{t < 20 ? <WipeSplit t={t} cross={WIPES[0].cross} kind={WIPES[0].kind} id="wa1" x0={WIPES[0].x0} oldP={early(t)} newP={mid(t)} />
		: t < 35 ? <WipeSplit t={t} cross={WIPES[1].cross} kind={WIPES[1].kind} id="wa2" x0={WIPES[1].x0} oldP={mid(t)} newP={late(t)} />
			: <WipeSplit t={t} cross={WIPES[2].cross} kind={WIPES[2].kind} id="wa3" x0={WIPES[2].x0} oldP={late(t)} newP={<Tang t={t} />} />}
</div>;
void Jianfou; void IcePool; void JarWhole; void Chisel;
