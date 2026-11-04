import React from 'react';
import {God, CAST, Pose, POSES, reach, wristTo, holdAt, solve} from './rig60';
import {Stage60, Glow, Dust, Embers, Stars, Flame, camPath, flick, rng} from './frame60';
import {DuatGate, River, Serpent, PapyrusClump} from './props60b';
import {ANI, walkPose, STRIDE} from './cast60';
import {GlyphColumns} from './props60';
import type {ShotProps} from './EP60';
import {up, hit, keys, bell, gripOf, BigKnife, Croc, Beetles, GlyphStack, wearFor, FistOver} from './act60b_kit';
import {V, PAL, poly, sp, lerp, cl, sm, seg, ap} from './geo60';

/* act60b · the road through the Duat (shots 15–17). Film times of the sound events are listed in episodes/60-xinzang/sync60_b.md. */

/* ================= 15 · 40.8–43.5 · STARRY LAPIS: out of the tomb, down the steps, onto the bank of the dark river; the stone door grinds shut ================= */
export const S15_DOOR = {grind: 0.15, thud: 0.78};
export const Shot15: React.FC<ShotProps> = ({t}) => {
	const GB = 800, s = 22, om = 5.4, x0 = 470;
	const ax = x0 + STRIDE * s * om * t, ph = om * t + 0.6;
	const ani: Pose = walkPose(ph, {lean: 3, stride: 0.95, head: 1.5});
	const cam = camPath(t, [[-0.5, 640, 560, 1.1], [3.0, 900, 590, 1.24]]);
	const u = cl((t - S15_DOOR.grind) / (S15_DOOR.thud - S15_DOOR.grind)), shut = Math.pow(u, 1.35), thud = hit(t, S15_DOOR.thud, 0.25);
	const doorLight = 1 - shut;
	const shakeY = 0 * thud * Math.sin(t * 90); // owner 15:10: no screen shake
	const boatX = 1110 + 7 * t;
	const R = rng(15);
	return <Stage60 t={t} cam={{...cam, y: cam.y + shakeY / cam.z}} grade="lapis" bg="#0B1236" wear={wearFor(cam.z, 0.28)} stain={0.22} dark={0.18} darkC="#05081A"
		light={<>
			{/* the Milky Way: a soft band across the sky */}
			{Array.from({length: 7}, (_, i) => <Glow key={i} x={380 + i * 190} y={120 + i * 42} r={220} ry={90} c={i % 2 ? 'blue' : 'white'} o={0.13 + 0.04 * Math.sin(t * 0.8 + i)} />)}
			{/* the warm tomb light through the door, cut off as the slab closes */}
			<Glow x={150} y={560} r={260} c="warm" o={0.75 * doorLight + 0.25 * thud} />
			<Glow x={300} y={700} r={200} c="warm" o={0.4 * doorLight} />
			{/* the sun-boat far off: a gold disc glowing over its silhouette */}
			<Glow x={boatX + 4} y={530} r={120} c="gold" o={0.55 + 0.08 * Math.sin(t * 2)} />
			<Glow x={boatX} y={590} r={160} ry={30} c="gold" o={0.3} />
			{/* you, faintly glowing */}
			<Glow x={ax + 20} y={GB - 230} r={240} c="blue" o={0.32} />
			<Glow x={ax + 20} y={GB - 260} r={120} c="white" o={0.28 + 0.05 * Math.sin(t * 3)} />
			<Dust t={t} box={[ax - 200, GB - 450, ax + 260, GB - 20]} n={26} seed={151} c="#DDE8FF" o={0.6} vx={14} vy={-6} r={1.8} />
			{/* night wind: mist wisps over the water */}
			{Array.from({length: 6}, (_, i) => <Glow key={'m' + i} x={((i * 340 + t * 70) % 2000) - 200} y={600 + (i % 3) * 50} r={260} ry={18} c="white" o={0.12} />)}
			{/* a dust puff where the slab lands */}
			{thud > 0.02 && <Glow x={155} y={640} r={120 * (1.3 - thud * 0.3)} ry={40} c="smoke" o={0.5 * thud} blend="normal" />}
		</>}>
		<defs><linearGradient id="b15sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#070B26" /><stop offset="0.7" stopColor="#14205A" /><stop offset="1" stopColor="#24357A" /></linearGradient></defs>
		<rect x={-400} y={-200} width={2400} height={790} fill="url(#b15sky)" />
		<Stars t={t} box={[-300, 0, 1900, 560]} n={260} seed={157} />
		{/* the far bank: low dark hills, tiny pylons of the gates ahead */}
		<path d={`M-400 578L-100 566Q120 548 330 562Q560 540 800 560Q1040 546 1300 558Q1560 548 1900 566L1900 590L-400 590Z`} fill="#0A0E28" />
		{[880, 1460, 1700].map((x, i) => <g key={x} opacity={0.9}><path d={poly([[x - 26, 566], [x - 6, 566], [x - 8, 536], [x - 24, 536]])} fill="#0A0E28" /><path d={poly([[x + 6, 566], [x + 26, 566], [x + 24, 536], [x + 8, 536]])} fill="#0A0E28" />
			<rect x={x - 6} y={552} width={12} height={14} fill="#FF9A44" opacity={0.5 + 0.2 * flick(t, i)} /></g>)}
		{/* the sun-boat, a silhouette on the horizon */}
		<g transform={`translate(${boatX},${582 + 1.5 * Math.sin(t * 1.4)})`}>
			<path d="M-74 -16Q-60 -2 -30 2L30 2Q60 -2 76 -18L70 -8Q50 8 0 9Q-50 8 -68 -6Z" fill="#05081A" />
			<rect x={-16} y={-22} width={32} height={22} fill="#05081A" />
			<path d="M-22 -2Q-26 -44 0 -45Q24 -46 22 -6" fill="none" stroke="#05081A" strokeWidth={5} />
			<circle cx={0} cy={-56} r={10} fill="#F2B23A" /><circle cx={0} cy={-56} r={6} fill="#FFE7A0" />
			<path d="M-46 -6L-58 14" stroke="#05081A" strokeWidth={4} />
		</g>
		<River x0={-400} x1={2000} y={586} h={190} t={t} dark speed={9} />
		{/* star reflections twinkling on the water */}
		{Array.from({length: 26}, (_, i) => { const x = -200 + R() * 2000, y = 610 + R() * 150, w = 10 + R() * 26; return <rect key={i} x={x + 8 * Math.sin(t * 1.3 + i)} y={y} width={w} height={2.5} fill="#F3E3B0" opacity={0.25 + 0.35 * Math.abs(Math.sin(t * 2 + i * 1.7))} />; })}
		{/* the near bank */}
		<path d={`M-400 772L1900 772L1900 1100L-400 1100Z`} fill="#141A3C" />
		<path d={`M-400 772L1900 772L1900 780L-400 780Z`} fill="#2A3670" />
		{Array.from({length: 18}, (_, i) => <path key={i} d={`M${-300 + i * 130} ${812 + (i % 3) * 22}l40 -4`} stroke="#25305E" strokeWidth={3} />)}
		<g opacity={0.9}><PapyrusClump x={1330} y={782} h={150} t={t} n={7} seed={4} /><PapyrusClump x={1520} y={782} h={120} t={t + 1} n={6} seed={7} /></g>
		{/* foreground: dark boulders and reeds at the water's edge, Ani's glow on the ground */}
		<ellipse cx={ax + 20} cy={GB + 4} rx={150} ry={16} fill="#3A4C9A" opacity={0.35} />
		{[[520, 930, 90], [760, 960, 140], [1180, 925, 110], [1500, 950, 150]].map(([x, y, r], i) => <path key={i} d={sp([[x - r, y + 40], [x - r * 0.8, y - r * 0.35], [x - r * 0.2, y - r * 0.55], [x + r * 0.6, y - r * 0.4], [x + r, y + 40]], true, 0.2)} fill="#0C1030" stroke={PAL.ink} strokeWidth={2} />)}
		<g opacity={0.95}>{[620, 980, 1380].map((x, i) => <g key={x}>{Array.from({length: 6}, (_, k) => { const a = (k - 2.5) * 9 + 4 * Math.sin(t * 1.6 + k + i); return <path key={k} d={`M${x + k * 6} 940Q${x + k * 6 + a * 0.8} 900 ${x + k * 6 + a * 2.2} ${850 - (k % 3) * 18}`} fill="none" stroke="#0A0E26" strokeWidth={5} />; })}</g>)}</g>
		{/* the cliff with the rock-cut tomb: portal, the slab door, the steps down to the bank */}
		<path d={poly([[-400, -200], [180, -200], [230, 120], [262, 380], [300, 640], [380, 800], [-400, 800]])} fill="#1D1A3E" stroke={PAL.ink} strokeWidth={3} />
		{[[-300, 140, 200, 120], [-260, 300, 240, 290], [-320, 470, 60, 480]].map(([a, b, c2, d], i) => <path key={i} d={`M${a} ${b}Q${(a + c2) / 2} ${b - 14} ${c2} ${d}`} fill="none" stroke="#2E2A58" strokeWidth={4} />)}
		<rect x={70} y={360} width={170} height={22} fill="#2E2A58" stroke={PAL.ink} strokeWidth={2} />
		<rect x={86} y={382} width={138} height={258} fill="#3A1C10" />
		<rect x={86} y={382} width={138} height={258 * doorLight} fill="#E89A4A" opacity={0.8 * doorLight} />
		{/* the slab, sliding down to close the portal */}
		<g transform={`translate(0,${-258 * (1 - shut)})`}>
			<rect x={86} y={382} width={138} height={258} fill="#4A4470" stroke={PAL.ink} strokeWidth={3} />
			{[0, 1, 2, 3].map((k) => <path key={k} d={`M92 ${420 + k * 58}L218 ${414 + k * 58}`} stroke="#5E5888" strokeWidth={3} />)}
			<GlyphColumns x={112} y={410} cols={3} rows={5} cell={30} seed={15} mono="#8A80B8" />
		</g>
		<rect x={70} y={-200} width={170} height={560} fill="#1D1A3E" />
		<rect x={70} y={344} width={170} height={20} fill="#2E2A58" stroke={PAL.ink} strokeWidth={2} />
		{/* steps */}
		{Array.from({length: 8}, (_, i) => { const x = 224 + i * 19, y = 640 + i * 20; return <path key={i} d={poly([[x, y], [x + 19, y], [x + 19, y + 20], [x + 200, y + 20], [x + 200, 800], [x, 800]])} fill={i % 2 ? '#282452' : '#2C285A'} stroke={PAL.ink} strokeWidth={2} />; })}
		<path d={poly([[380, 800], [400, 772], [420, 800]])} fill="#141A3C" />
		<God id="b15ani" cast={ANI} pose={ani} x={ax} y={GB} s={s} sec={{t, amp: 1.4}} />
	</Stage60>;
};

/* ================= 16 · 43.5–46.5 · BLOOD RED: a pylon gate; kneeling animal-headed guardians with knives; each knife glints as the camera trucks past ================= */
export const S16_GLINTS = [0.3, 0.9, 1.5, 2.1];
const GUARD16 = [
	{x: 330, cast: {...CAST.anubis, crown: 'none' as const, bProp: 'none' as const, fProp: 'none' as const}},
	{x: 550, cast: {...CAST.horus, crown: 'none' as const, bProp: 'none' as const, fProp: 'none' as const}},
	{x: 920, cast: {...CAST.thoth, crown: 'none' as const, bProp: 'none' as const, fProp: 'none' as const}},
	{x: 1140, cast: {...CAST.anubis, crown: 'none' as const, bProp: 'none' as const, fProp: 'none' as const}},
];
export const Shot16: React.FC<ShotProps> = ({t}) => {
	const GY = 852, s = 20, gx = 732;
	const cam = camPath(t, [[-0.4, 520, 540, 1.1], [3.4, 905, 528, 1.15]]);
	const guard = (k: number): {p: Pose; g: number} => { const g = hit(t, S16_GLINTS[k], 0.3, 0.08);
		let p: Pose = {...POSES.kneel, rt: -10, rk: 100, rf: 40, at: 118, ak: 124, lean: 6 + 3 * g, head: 2 + 2 * Math.sin(t * 1.5 + k) - 4 * g, neck: 2};
		p = wristTo(holdAt(p, 'f', [3.0, -6.6 - 0.9 * g + 0.15 * Math.sin(t * 2 + k)]), 'f', 96);
		return {p: wristTo(holdAt(p, 'b', [2.2, -0.6]), 'b', 20), g}; };
	return <Stage60 t={t} cam={cam} grade="blood" bg="#3A0E0A" wear={wearFor(cam.z, 0.3)} stain={0.3}
		light={<>
			<Glow x={gx} y={GY - 200} r={420} c="warm" o={0.5 + 0.1 * flick(t, 3)} />
			{[gx - 150, gx + 150].map((x, i) => <g key={x}><Glow x={x} y={GY - 60} r={180} c="warm" o={0.65 + 0.12 * flick(t, i + 5)} /><Embers t={t} x={x} y={GY - 70} n={12} seed={i + 21} h={360} spread={40} /></g>)}
			{GUARD16.map((G, k) => { const {p, g} = guard(k), at = gripOf(p, 'f'), tip: V = [G.x - at[0] * s, GY + (at[1] - 3.6 * 0.8) * s];
				return g > 0.02 ? <g key={k}><Glow x={tip[0]} y={tip[1]} r={260} c="white" o={0.9 * g} /><Glow x={tip[0]} y={tip[1]} r={90} c="white" o={g} /></g> : null; })}
			<Dust t={t} box={[cam.x - 700, 120, cam.x + 700, 850]} n={40} seed={161} c="#FFB080" o={0.45} vx={-12} vy={-4} />
		</>}>
		<defs><linearGradient id="b16sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1C0503" /><stop offset="0.6" stopColor="#4A120C" /><stop offset="1" stopColor="#7A2414" /></linearGradient></defs>
		<rect x={-400} y={-200} width={2400} height={GY + 200} fill="url(#b16sky)" />
		{/* far gates in the haze */}
		{[-120, 1560].map((x) => <g key={x} opacity={0.35}><DuatGate x={x} gy={GY - 30} h={300} w={110} t={t} seed={x} glow={0.6} /></g>)}
		<DuatGate x={gx} gy={GY + 4} h={560} w={200} t={t} seed={2} />
		{/* uraei along the gate's cornice */}
		{Array.from({length: 11}, (_, i) => { const x = gx - 300 + i * 60; return <g key={i} transform={`translate(${x},${GY - 586})`}><path d="M-6 0L6 0L6 -14Q12 -24 4 -30Q-4 -34 -6 -24Z" fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} /><circle cx={2} cy={-36} r={5} fill={PAL.red} stroke={PAL.ink} strokeWidth={1.5} /></g>; })}
		<Flame x={gx - 150} y={GY - 4} s={1.1} t={t} seed={3} /><Flame x={gx + 150} y={GY - 4} s={1.1} t={t} seed={4} />
		<rect x={-400} y={GY} width={2400} height={300} fill="#2A0A08" />
		<rect x={-400} y={GY} width={2400} height={8} fill="#5A1A10" />
		{Array.from({length: 22}, (_, i) => <path key={i} d={`M${-360 + i * 110} ${GY + 30 + (i % 3) * 22}l56 -3`} stroke="#4A1610" strokeWidth={3} />)}
		{GUARD16.map((G, k) => { const {p, g} = guard(k), at = gripOf(p, 'f');
			return <g key={k}>
				<God id={`b16g${k}`} cast={G.cast} pose={p} x={G.x} y={GY + 2} s={s} face={-1} sec={{t: t + k}} />
				<g transform={`translate(${G.x},${GY + 2}) scale(${-s},${s})`}><BigKnife at={at} c={{OW: 2.7 / s, LW: 1.5 / s}} L={4.4} glint={Math.min(1, 1.4 * g)} a={-6 * g} /><FistOver pose={p} side="f" c={{OW: 2.7 / s, LW: 1.5 / s}} skin={PAL.skinM} /></g>
			</g>; })}
	</Stage60>;
};

/* ================= 17 · 「蛇和鳄鱼扑过来，全靠咒语挡。」 (v4, owner 19:21): a cobra rears, a crocodile lunges along the floor at the lens;
   you lift the scroll: it flares, gold glyphs burst out and swirl round you into a spinning ring + shield, then the shield blasts outward
   (shock ring, sparks) and both beasts recoil; beetles scatter. The crocodile walks on the near floor (feet planted, contact shadow). ================= */
export const S17 = {hiss: 0.25, growl: 0.4, snap: 1.1, flare: 1.55, burst: 1.7, shield: 2.05, blast: 2.45, skitter: 2.5};
const NG17 = 12;
export const Shot17: React.FC<ShotProps> = ({t}) => {
	const GY = 852, s = 24, ax = 300, CG = GY, CS = 40;
	const lift = up(t, 1.2, 0.32), flare = hit(t, S17.flare, 0.4, 0.06), blastK = hit(t, S17.blast, 0.35, 0.04);
	const shieldK = up(t, S17.shield - 0.12, 0.18) * (1 - up(t, S17.blast, 0.06)), after = t >= S17.blast;
	const recoil = up(t, S17.blast, 0.32), snapK = hit(t, S17.snap, 0.18, 0.04);
	// you: brace, lift the open scroll high in both hands, lean into the blast
	let ani: Pose = {...POSES.rest, lean: lerp(-4, 2, lift) - 3 * snapK + 4 * bell(t, S17.blast - 0.1, S17.blast + 0.5), neck: -2, head: lerp(-2, -6, lift), rt: -10, at: 14, rk: 3, ak: 2};
	const hb: V = [lerp(2.4, 2.2, lift), lerp(-11.6, -17.4, lift)], hf: V = [lerp(4.1, 4.4, lift), lerp(-12.2, -17.9, lift)];
	ani = wristTo(reach(ani, 'f', hf), 'f', lerp(110, 170, lift)); ani = wristTo(reach(ani, 'b', hb), 'b', lerp(105, 165, lift));
	const gb = gripOf(ani, 'b'), gf = gripOf(ani, 'f'), W = (p: V): V => [ax + p[0] * s, GY + p[1] * s];
	const sb = W(gb), sf = W(gf), sc: V = [(sb[0] + sf[0]) / 2, (sb[1] + sf[1]) / 2 - 46];
	// the beasts: the cobra rears (hiss); the crocodile walks in on the near floor, gapes (growl), snaps; both recoil on the blast
	const rear = keys(t, [[-0.3, 0.35], [S17.hiss, 1], [S17.blast, 1], [S17.blast + 0.3, 0.5]]);
	const lunge = keys(t, [[0.2, 0], [1.05, 1], [S17.shield, 1], [S17.shield + 0.3, 0.88], [S17.blast, 0.88], [S17.blast + 0.45, 0.1]]);
	const crX = lerp(1430, 1070, lunge), crK = lerp(1.0, 1.15, lunge);
	const jaw = t < S17.snap - 0.08 ? 36 * sm(seg(t, 0.3, 0.6)) : t < S17.snap ? 36 * (1 - (t - S17.snap + 0.08) / 0.08) : after ? 34 * bell(t, S17.blast, S17.blast + 0.7) : 3 + 9 * Math.max(0, Math.sin((t - S17.snap) * 9));
	const walking = t > 0.2 && t < 1.05 ? 1 : after && t < S17.blast + 0.45 ? -1 : 0;
	// the ring of glyphs: burst from the scroll, swirl into an orbit round you, blast outward
	const C: V = [ax + 40, GY - 250], RX = 250, RY = 64;
	const glyph = (i: number) => {
		const th = (i / NG17) * Math.PI * 2 + 4.2 * (t - S17.burst), a = (-90 + (i - (NG17 - 1) / 2) * 24) * Math.PI / 180;
		const ub = 1 - Math.pow(1 - cl((t - S17.burst - i * 0.01) / 0.24), 3), burstP: V = [sc[0] + Math.cos(a) * 380 * ub, sc[1] + Math.sin(a) * 260 * ub];
		const orbit: V = [C[0] + RX * Math.cos(th), C[1] + RY * Math.sin(th) - 40 * Math.sin(th * 2 + t * 3) * 0.2];
		const k = sm((t - S17.burst - 0.18) / (S17.shield - S17.burst - 0.18));
		let p: V = [lerp(burstP[0], orbit[0], k), lerp(burstP[1], orbit[1], k)], front = k < 0.5 || Math.sin(th) > 0, sz = k < 0.5 ? 66 : 54 + 14 * Math.sin(th), o = cl((t - S17.burst + 0.02) / 0.08);
		if (after) { const thB = (i / NG17) * Math.PI * 2 + 4.2 * (S17.blast - S17.burst), ob: V = [C[0] + RX * Math.cos(thB), C[1] + RY * Math.sin(thB)], d = 1500 * (t - S17.blast), dir = Math.atan2(ob[1] - C[1], ob[0] - C[0]);
			p = [ob[0] + Math.cos(dir) * d, ob[1] + Math.sin(dir) * d * 0.6]; front = true; sz = 54 + 30 * cl((t - S17.blast) / 0.4); o = cl(1 - (t - S17.blast - 0.25) / 0.45); }
		return {p, front, sz, o};
	};
	const G = t >= S17.burst - 0.02 ? Array.from({length: NG17}, (_, i) => ({i, ...glyph(i)})) : [];
	const drawG = (g: {i: number; p: V; sz: number; o: number}) => g.o > 0.01 ? <g key={g.i} opacity={g.o}><GlyphStack x={g.p[0]} y={g.p[1] - g.sz / 2} cell={g.sz} n={1} seed={170 + g.i} glow={0.85} color="#FFE36A" /></g> : null;
	const ringArc = (back: boolean) => shieldK > 0.02 ? <path d={`M${C[0] - RX} ${C[1]}A${RX} ${RY} 0 0 ${back ? 1 : 0} ${C[0] + RX} ${C[1]}`} fill="none" stroke="#FFE08A" strokeWidth={back ? 5 : 9} opacity={(back ? 0.45 : 0.95) * shieldK} strokeLinecap="round" /> : null;
	const cam = camPath(t, [[-0.2, 660, 560, 1.06], [S17.shield, 640, 548, 1.1], [3.4, 690, 540, 1.08]]);
	const R = rng(17), sparkR = rng(171), blastU = cl((t - S17.blast) / 0.7);
	return <Stage60 t={t} cam={cam} grade="blood" bg="#300C08" wear={wearFor(cam.z, 0.3)} stain={0.3} flickSeed={7}
		light={<>
			<Glow x={980} y={GY - 120} r={420} c="red" o={0.45 * (1 - 0.5 * shieldK)} />
			{/* scroll flare: rays turning round the scroll */}
			{t > S17.flare - 0.05 && <g style={{mixBlendMode: 'screen'}} opacity={cl((t - S17.flare + 0.05) / 0.08) * (1 - 0.6 * up(t, S17.shield, 0.3)) * (after ? 1 - blastU : 1)}>
				{Array.from({length: 14}, (_, k) => { const a = k * Math.PI / 7 + t * 1.6, L = 150 + 120 * flare + 40 * Math.sin(t * 9 + k);
					return <path key={k} d={`M${sc[0]} ${sc[1]}L${sc[0] + Math.cos(a - 0.06) * L} ${sc[1] + Math.sin(a - 0.06) * L}L${sc[0] + Math.cos(a + 0.06) * L} ${sc[1] + Math.sin(a + 0.06) * L}Z`} fill="#FFE7A0" opacity={0.2} />; })}
				<Glow x={sc[0]} y={sc[1]} r={140 + 200 * flare} c="gold" o={0.45 + 0.4 * flare} />
				<Glow x={sc[0]} y={sc[1]} r={70} c="white" o={0.7 * flare + 0.3} />
			</g>}
			{/* the shield: a gold dome of light round you, its rim turning */}
			{shieldK > 0.02 && <g style={{mixBlendMode: 'screen'}} opacity={shieldK}>
				<ellipse cx={C[0]} cy={C[1] + 30} rx={330} ry={360} fill="url(#g60-gold)" opacity={0.32} />
				<ellipse cx={C[0]} cy={C[1] + 30} rx={330} ry={360} fill="none" stroke="#FFE08A" strokeWidth={4} strokeDasharray="26 14" strokeDashoffset={-t * 220} opacity={0.75} />
			</g>}
			{/* the blast: two shock rings and sparks */}
			{after && blastU < 1 && <g style={{mixBlendMode: 'screen'}}>
				{[0, 0.12].map((dl, j) => { const u = cl((t - S17.blast - dl) / 0.7); return u > 0 && u < 1 ? <ellipse key={j} cx={C[0]} cy={C[1] + 30} rx={330 + 1300 * u} ry={360 + 900 * u} fill="none" stroke="#FFE7A0" strokeWidth={26 * (1 - u)} opacity={1 - u} /> : null; })}
				{Array.from({length: 36}, (_, k) => { const a = sparkR() * Math.PI * 2, v = 700 + sparkR() * 900, d = 200 + v * (t - S17.blast), x = C[0] + Math.cos(a) * d, y = C[1] + 30 + Math.sin(a) * d * 0.75;
					return <path key={k} d={`M${x} ${y}l${-Math.cos(a) * 40} ${-Math.sin(a) * 30}`} stroke="#FFF1C0" strokeWidth={4} strokeLinecap="round" opacity={1 - blastU} />; })}
				<Glow x={C[0]} y={C[1]} r={380 + 300 * blastU} c="gold" o={0.55 * (1 - blastU)} />
			</g>}
			{/* a white core of light on every glyph so the ring reads through the red grade */}
			{G.map((g) => g.o > 0.02 ? <Glow key={'gg' + g.i} x={g.p[0]} y={g.p[1]} r={g.sz * 0.85} c="white" o={0.55 * g.o * (g.front ? 1 : 0.55)} /> : null)}
			<Embers t={t} x={sc[0]} y={sc[1]} n={18} seed={171} h={300} spread={200} s={t > S17.flare ? 1.2 : 0.01} />
			<Dust t={t} box={[0, 120, 1400, 960]} n={34} seed={172} c="#FFB080" o={0.4} vx={-8} vy={-3} />
		</>}
		screen={<rect width={1440} height={1080} fill="#FFC85A" opacity={0.1 * flare + 0.18 * blastK} style={{mixBlendMode: 'screen'}} />}>
		<defs><linearGradient id="b17sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#170403" /><stop offset="1" stopColor="#5A160E" /></linearGradient></defs>
		<rect x={-400} y={-200} width={2400} height={GY + 200} fill="url(#b17sky)" />
		<g opacity={0.5}><DuatGate x={1180} gy={GY - 10} h={420} w={150} t={t} seed={5} glow={0.8} /></g>
		<rect x={-400} y={GY} width={2400} height={400} fill="#260806" />
		<rect x={-400} y={GY} width={2400} height={8} fill="#55180E" />
		{Array.from({length: 14}, (_, i) => <path key={i} d={`M${-300 + R() * 2000} ${GY + 30 + R() * 90}l50 -3`} stroke="#45140C" strokeWidth={3} />)}
		<g transform={`rotate(${16 * recoil} 1200 ${GY})`}><Serpent x={1200} y={GY} s={30} t={t} flip={-1} rear={rear} fire={0} /></g>
		<ellipse cx={ax + 30} cy={GY + 2} rx={120} ry={10} fill="#120302" opacity={0.5} />
		{/* back half of the glyph ring, behind you */}
		{ringArc(true)}{G.filter((g) => !g.front).map(drawG)}
		<God id="b17ani" cast={{...ANI, bHand: 'fist', fHand: 'fist'}} pose={ani} x={ax} y={GY} s={s} sec={{t, amp: 1.2}} />
		{/* the open scroll between the hands, glowing from the flare on */}
		<g>
			<path d={poly([[sb[0], sb[1] - 4], [sf[0], sf[1] - 4], [sf[0] + 6, sf[1] - 92], [sb[0] - 6, sb[1] - 92]])} fill={t > S17.flare ? '#FFF2C8' : '#EBD7A4'} stroke={PAL.ink} strokeWidth={2.4} />
			<g transform={`translate(${sb[0] + 4},${sb[1] - 84})`}><GlyphColumns x={0} y={0} cols={Math.max(1, Math.round((sf[0] - sb[0]) / 26))} rows={3} cell={22} seed={171} mono={t > S17.flare ? '#E8A21E' : undefined} /></g>
			{[sb, sf].map((p, i) => <rect key={i} x={p[0] - 9} y={p[1] - 100} width={18} height={104} rx={8} fill="#D9BE7E" stroke={PAL.ink} strokeWidth={2.4} />)}
			<g transform={`translate(${ax},${GY}) scale(${s})`}><FistOver pose={ani} side="b" c={{OW: 2.7 / s, LW: 1.5 / s}} skin={PAL.skinM} /><FistOver pose={ani} side="f" c={{OW: 2.7 / s, LW: 1.5 / s}} skin={PAL.skinM} /></g>
		</g>
		{/* front half of the ring, in front of you */}
		{ringArc(false)}{G.filter((g) => g.front).map(drawG)}
		<Beetles x={ax + 160} y={GY + 30} t={t} t0={S17.skitter} n={12} seed={17} r={220} s={2.1} floor={GY + 60} />
		{/* the crocodile on the near floor: contact shadow, feet planted on CG, scaled about its feet */}
		<ellipse cx={crX - 0.4 * CS * crK} cy={CG + 3} rx={7.0 * CS * crK} ry={12 * crK} fill="#0E0201" opacity={0.7} />
		<g transform={`translate(${crX},${CG}) scale(${crK}) translate(${-crX},${-CG})`}><Croc x={crX} y={CG} s={CS} face={-1} t={t} jaw={jaw} walk={t * 10 * walking} /></g>
	</Stage60>;
};
export const _keep = {GlyphColumns, solve, ap, sp, Embers, Dust};
