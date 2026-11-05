import React from 'react';
import {God, CAST, Pose, POSES, reach, wristTo, holdAt, solve, lerpPose} from './rig60';
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

/* ================= 15 v7 (owner 11-05 17:46: "去冥界就直接走去吗，没有解释冥界在哪里"): 「下葬后，你要去[冥界]——」 |
   「往[西边]走，太阳落下的地方。」 Dusk, not night. The tomb door shuts, you walk down to the bank and on along the river toward the low red
   sun on the right (the west). On line 2 the camera pans ahead of you to the sun: it sinks into the notch between two hills (the akhet, the
   horizon sign), the sky darkens, stars come out, and where it went down a gate rises out of the horizon; its doorway lights up and the
   camera pushes into the light (the dissolve to shot 16's gate). L2 = line 2 start (story60). Sound: door grind/thud; a low swell as the
   sun touches (L2+0.8); a stone rumble + shimmer as the gate rises (L2+1.1 → +1.8); the doorway bloom (L2+1.9). */
export const S15W = {L2: 2.58, touch: 3.5, gone: 4.35, rise: [3.85, 4.55], door: 4.65};
export const Shot15W: React.FC<ShotProps> = ({t}) => {
	const T = S15W, GB = 800, s = 22, om = 5.4, x0 = 470, SX = 1580, HZ = 566;
	const v = STRIDE * s * om, TS = (1010 - x0) / v, tw = t < TS - 0.5 ? t : TS - 0.5 + 0.5 * (1 - Math.pow(1 - cl((t - TS + 0.5) / 1.0), 2));
	const ax = x0 + v * tw, ph = om * tw + 0.6, stand = up(t, TS - 0.1, 0.45);
	const ani: Pose = lerpPose(walkPose(ph, {lean: 3, stride: 0.95, head: 1.5}), {...POSES.rest, lean: 1, neck: -2, head: -4 + 1.5 * Math.sin(t * 1.1), rt: -5, at: 8, rk: 2, ak: 1, fs: 6, fe: 10, bs: -4, be: 8}, stand);
	const cam = camPath(t, [[-0.5, 640, 560, 1.1], [T.L2 - 0.1, 860, 580, 1.2], [T.touch + 0.1, SX - 250, 535, 1.32], [T.door, SX - 40, 508, 1.6], [6.0, SX, 492, 2.8]]);
	const u = cl((t - S15_DOOR.grind) / (S15_DOOR.thud - S15_DOOR.grind)), shut = Math.pow(u, 1.35), thud = hit(t, S15_DOOR.thud, 0.25), doorLight = 1 - shut;
	const sunY = keys(t, [[-0.5, 452], [T.L2, 498], [T.touch, HZ - 8], [T.gone, HZ + 80]]), dusk = 1 - sm(seg(t, T.touch - 0.2, T.gone + 0.5));
	const gate = sm(seg(t, T.rise[0], T.rise[1])), door = sm(seg(t, T.door, T.door + 0.5)), bloom = hit(t, T.door + 0.05, 0.6);
	const R = rng(15);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#0B1236" wear={wearFor(cam.z, 0.28)} stain={0.22} dark={0.16 - 0.1 * door} darkC="#05081A"
		light={<>
			{/* the low sun: a warm wash over the sky and the water, fading as it sets */}
			<Glow x={SX} y={sunY} r={620} ry={300} c="warm" o={0.55 * dusk} />
			<Glow x={SX} y={sunY} r={200} c="gold" o={0.6 * dusk} />
			<Glow x={SX} y={HZ + 60} r={420} ry={60} c="warm" o={0.4 * dusk} />
			<Glow x={150} y={560} r={260} c="warm" o={0.75 * doorLight + 0.25 * thud} />
			<Glow x={300} y={700} r={200} c="warm" o={0.4 * doorLight} />
			<Glow x={ax + 20} y={GB - 240} r={240} c="warm" o={0.22 * dusk + 0.1} />
			{/* the gate of the west: its doorway fills with light */}
			{gate > 0 && <Glow x={SX} y={HZ - 70} r={160 + 120 * door} c="gold" o={0.3 * gate + 0.5 * door} />}
			{door > 0 && <Glow x={SX} y={HZ - 70} r={90} ry={110} c="white" o={0.55 * door + 0.3 * bloom} />}
			<Dust t={t} box={[ax - 200, GB - 450, ax + 260, GB - 20]} n={22} seed={151} c="#FFE2B0" o={0.5} vx={14} vy={-6} r={1.8} />
			{Array.from({length: 5}, (_, i) => <Glow key={'m' + i} x={((i * 380 + t * 70) % 2200) - 200} y={600 + (i % 3) * 50} r={260} ry={18} c="white" o={0.1} />)}
			{thud > 0.02 && <Glow x={155} y={640} r={120 * (1.3 - thud * 0.3)} ry={40} c="smoke" o={0.5 * thud} blend="normal" />}
		</>}
		screen={<rect width={1440} height={1080} fill="#FFD9A0" opacity={0.22 * door * sm(seg(t, T.door + 0.4, 6.0))} style={{mixBlendMode: 'screen'}} />}>
		<defs>
			<linearGradient id="b15wsky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0B1236" /><stop offset="0.55" stopColor="#2A2A68" /><stop offset="1" stopColor="#4A3A78" /></linearGradient>
			<linearGradient id="b15wdusk" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#E8743A" stopOpacity={0} /><stop offset="0.55" stopColor="#D2603A" stopOpacity={0.35} /><stop offset="1" stopColor="#F29A4A" stopOpacity={0.95} /></linearGradient>
			<clipPath id="b15whz"><rect x={-400} y={-400} width={2600} height={HZ + 400} /></clipPath>
		</defs>
		<rect x={-400} y={-200} width={2600} height={790} fill="url(#b15wsky)" />
		<rect x={-400} y={200} width={2600} height={390} fill="url(#b15wdusk)" opacity={dusk} />
		<g opacity={0.25 + 0.75 * (1 - dusk)}><Stars t={t} box={[-300, 0, 2100, 520]} n={220} seed={157} /></g>
		{/* the sun, sinking behind the hills, the far bank and the river (drawn before them) */}
		<circle cx={SX} cy={sunY} r={64} fill="#E2562C" /><circle cx={SX} cy={sunY} r={52} fill="#F07A36" /><circle cx={SX - 14} cy={sunY - 14} r={20} fill="#FFB060" opacity={0.6} />
		{/* the gate rising out of the horizon in the notch (clipped at the horizon) */}
		{gate > 0 && <g clipPath="url(#b15whz)"><g transform={`translate(0,${(1 - gate) * 230})`} opacity={0.4 + 0.6 * gate}>
			<DuatGate x={SX} gy={HZ} h={210} w={64} t={t} seed={9} glow={0.4 + 0.6 * door} />
			{door > 0 && <rect x={SX - 32} y={HZ - 170} width={64} height={170} fill="#FFE2A0" opacity={0.9 * door} />}
		</g></g>}
		{/* the two hills of the horizon (akhet) with the notch the sun sets into, and the low far bank */}
		<path d={`M${SX - 420} 572Q${SX - 300} 492 ${SX - 150} 486Q${SX - 60} 488 ${SX - 20} 548L${SX - 8} 566L${SX + 8} 566L${SX + 20} 548Q${SX + 60} 488 ${SX + 150} 486Q${SX + 300} 492 ${SX + 420} 572Z`} fill="#140F2A" stroke={PAL.ink} strokeWidth={2} />
		<path d={`M-400 578L-100 566Q120 548 330 562Q560 540 800 560Q1040 546 1250 566L1900 566Q2100 560 2300 568L2300 590L-400 590Z`} fill="#140F2A" />
		<River x0={-400} x1={2300} y={586} h={190} t={t} dark speed={9} />
		{/* the sun's path on the water, then the gate's */}
		{Array.from({length: 14}, (_, i) => { const y = 600 + i * 12, w = 120 - i * 5 + 20 * Math.sin(t * 2 + i); return <rect key={i} x={SX - w / 2 + 6 * Math.sin(t * 1.7 + i)} y={y} width={w} height={3} fill={i % 2 ? '#F2A050' : '#FFD08A'} opacity={(0.55 * dusk + 0.5 * door) * (1 - i / 16)} />; })}
		{Array.from({length: 20}, (_, i) => { const x = -200 + R() * 2400, y = 610 + R() * 150, w = 10 + R() * 26; return <rect key={i} x={x + 8 * Math.sin(t * 1.3 + i)} y={y} width={w} height={2.5} fill="#F3D3A0" opacity={(0.15 + 0.3 * Math.abs(Math.sin(t * 2 + i * 1.7))) * (0.5 + 0.5 * dusk)} />; })}
		<path d={`M-400 772L2300 772L2300 1100L-400 1100Z`} fill="#1E1A3E" />
		<path d={`M-400 772L2300 772L2300 780L-400 780Z`} fill="#3A3670" />
		{Array.from({length: 22}, (_, i) => <path key={i} d={`M${-300 + i * 130} ${812 + (i % 3) * 22}l40 -4`} stroke="#2E2A5E" strokeWidth={3} />)}
		<g opacity={0.9}><PapyrusClump x={1330} y={782} h={150} t={t} n={7} seed={4} /><PapyrusClump x={1880} y={782} h={120} t={t + 1} n={6} seed={7} /></g>
		<ellipse cx={ax + 20} cy={GB + 4} rx={150} ry={16} fill="#5A4A8A" opacity={0.3} />
		{[[520, 930, 90], [760, 960, 140], [1180, 925, 110], [1500, 950, 150], [1900, 940, 120]].map(([x, y, r], i) => <path key={i} d={sp([[x - r, y + 40], [x - r * 0.8, y - r * 0.35], [x - r * 0.2, y - r * 0.55], [x + r * 0.6, y - r * 0.4], [x + r, y + 40]], true, 0.2)} fill="#120E2E" stroke={PAL.ink} strokeWidth={2} />)}
		{/* the cliff with the rock-cut tomb, the slab door, the steps (as v6) */}
		<path d={poly([[-400, -200], [180, -200], [230, 120], [262, 380], [300, 640], [380, 800], [-400, 800]])} fill="#241C40" stroke={PAL.ink} strokeWidth={3} />
		<rect x={70} y={360} width={170} height={22} fill="#34285A" stroke={PAL.ink} strokeWidth={2} />
		<rect x={86} y={382} width={138} height={258} fill="#3A1C10" />
		<rect x={86} y={382} width={138} height={258 * doorLight} fill="#E89A4A" opacity={0.8 * doorLight} />
		<g transform={`translate(0,${-258 * (1 - shut)})`}>
			<rect x={86} y={382} width={138} height={258} fill="#4A4470" stroke={PAL.ink} strokeWidth={3} />
			{[0, 1, 2, 3].map((k) => <path key={k} d={`M92 ${420 + k * 58}L218 ${414 + k * 58}`} stroke="#5E5888" strokeWidth={3} />)}
			<GlyphColumns x={112} y={410} cols={3} rows={5} cell={30} seed={15} mono="#8A80B8" />
		</g>
		<rect x={70} y={-200} width={170} height={560} fill="#241C40" />
		<rect x={70} y={344} width={170} height={20} fill="#34285A" stroke={PAL.ink} strokeWidth={2} />
		{Array.from({length: 8}, (_, i) => { const x = 224 + i * 19, y = 640 + i * 20; return <path key={i} d={poly([[x, y], [x + 19, y], [x + 19, y + 20], [x + 200, y + 20], [x + 200, 800], [x, 800]])} fill={i % 2 ? '#2E2858' : '#322C60'} stroke={PAL.ink} strokeWidth={2} />; })}
		<God id="b15wani" cast={ANI} pose={ani} x={ax} y={GB} s={s} sec={{t, amp: 1.4}} />
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
/* v7 (owner 11-05): line 2 「报出守门人的[名字]，才放行。」 — `b` = seconds into line 2 (undefined on line 1). The camera trucks back left;
   you walk in with the open scroll, stop before the first guardian and read his name off it: gold glyphs float from your mouth to him;
   he lowers his knife and bows, the other three follow, the gate's doorway fills with light and the camera eases toward it.
   Beats (b): walk in 0–0.85 · scroll up 0.7–1.0 · read 1.0–1.9 (five glyphs) · knife down 2.0 (+0.12 per guardian) · door light 2.3. */
export const S16B = {walk: 0.85, read: [1.0, 1.9], lower: 2.0, door: 2.3};
const CAM16: [number, number, number, number][] = [[-0.4, 520, 540, 1.1], [3.4, 905, 528, 1.15]];
export const Shot16: React.FC<ShotProps & {b?: number}> = ({t, b}) => {
	const GY = 852, s = 20, gx = 732, B = b ?? -1;
	const c0 = camPath(3.0, CAM16);
	const cam = b === undefined ? camPath(t, CAM16) : camPath(B, [[0, c0.x, c0.y, c0.z], [0.95, 420, 548, 1.08], [S16B.door, 430, 546, 1.1], [3.4, 500, 540, 1.15]]);
	const low = (k: number) => b === undefined ? 0 : up(B, S16B.lower + 0.12 * k, 0.35);
	const guard = (k: number): {p: Pose; g: number} => { const g = hit(t, S16_GLINTS[k], 0.3, 0.08), L = low(k);
		let p: Pose = {...POSES.kneel, rt: -10, rk: 100, rf: 40, at: 118, ak: 124, lean: 6 + 3 * g + 10 * L, head: 2 + 2 * Math.sin(t * 1.5 + k) - 4 * g + 12 * L, neck: 2 + 6 * L};
		p = wristTo(holdAt(p, 'f', [3.0 - 0.5 * L, -6.6 - 0.9 * g + 0.15 * Math.sin(t * 2 + k) + 1.7 * L]), 'f', 96);
		return {p: wristTo(holdAt(p, 'b', [2.2, -0.6]), 'b', 20), g}; };
	// you (line 2): walk in from the left, raise the open scroll, read
	const ax = lerp(-220, 30, sm(cl(B / S16B.walk))), walking = B >= 0 && B < S16B.walk, sc16 = up(B, 0.7, 0.3);
	let ani: Pose = walking ? walkPose(B * 5.4 + 0.3, {lean: 3}) : {...POSES.rest, lean: 2, neck: -1, head: -3 + 2 * bell(B, S16B.read[0], S16B.read[1]), rt: -6, at: 9, rk: 2, ak: 1};
	if (!walking) { ani = wristTo(reach(ani, 'f', [lerp(2.4, 4.1, sc16), lerp(-5, -12.2, sc16)]), 'f', lerp(20, 110, sc16)); ani = wristTo(reach(ani, 'b', [lerp(1.0, 2.4, sc16), lerp(-5, -11.6, sc16)]), 'b', lerp(20, 105, sc16)); }
	const W = (p: V): V => [ax + p[0] * s, GY + p[1] * s], sb = W(gripOf(ani, 'b')), sf = W(gripOf(ani, 'f')), k16 = s / 24;
	const mouth: V = [ax + 1.3 * s, GY - 13.6 * s], ear: V = [330 - 0.6 * s, GY - 7.4 * s], door = up(B, S16B.door, 0.5);
	const glyphs = b === undefined ? [] : Array.from({length: 5}, (_, i) => { const t0 = S16B.read[0] + i * 0.17, u = cl((B - t0) / 0.6);
		return u <= 0 || u >= 1 ? null : <g key={i} opacity={Math.min(1, u * 5) * Math.min(1, (1 - u) * 4)}><GlyphStack x={lerp(mouth[0] + 20, ear[0], u)} y={lerp(mouth[1], ear[1], u) - 140 * Math.sin(Math.PI * u) - 30} cell={52} n={1} seed={160 + i} glow={0.8} color="#FFE36A" /></g>; });
	return <Stage60 t={t} cam={cam} grade="blood" bg="#3A0E0A" wear={wearFor(cam.z, 0.3)} stain={0.3}
		light={<>
			<Glow x={gx} y={GY - 200} r={420} c="warm" o={0.5 + 0.1 * flick(t, 3)} />
			{[gx - 150, gx + 150].map((x, i) => <g key={x}><Glow x={x} y={GY - 60} r={180} c="warm" o={0.65 + 0.12 * flick(t, i + 5)} /><Embers t={t} x={x} y={GY - 70} n={12} seed={i + 21} h={360} spread={40} /></g>)}
			{GUARD16.map((G, k) => { const {p, g} = guard(k), at = gripOf(p, 'f'), tip: V = [G.x - at[0] * s, GY + (at[1] - 3.6 * 0.8) * s];
				return g > 0.02 ? <g key={k}><Glow x={tip[0]} y={tip[1]} r={260} c="white" o={0.9 * g} /><Glow x={tip[0]} y={tip[1]} r={90} c="white" o={g} /></g> : null; })}
			<Dust t={t} box={[cam.x - 700, 120, cam.x + 700, 850]} n={40} seed={161} c="#FFB080" o={0.45} vx={-12} vy={-4} />
			{door > 0 && <><Glow x={gx} y={GY - 260} r={260 + 160 * door} ry={360} c="gold" o={0.7 * door} /><Glow x={gx} y={GY + 20} r={420} ry={50} c="warm" o={0.6 * door} /></>}
			{b !== undefined && B > 0.9 && <Glow x={(sb[0] + sf[0]) / 2} y={sb[1] - 46 * k16} r={90} c="gold" o={0.45 * bell(B, S16B.read[0] - 0.1, S16B.read[1] + 0.3)} />}
		</>}>
		<defs><linearGradient id="b16sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1C0503" /><stop offset="0.6" stopColor="#4A120C" /><stop offset="1" stopColor="#7A2414" /></linearGradient></defs>
		<rect x={-400} y={-200} width={2400} height={GY + 200} fill="url(#b16sky)" />
		{/* far gates in the haze */}
		{/* v7: the gates beyond, one behind another ("一道道门") */}
		{[[-120, 300, 110, 0.5], [1560, 300, 110, 0.5], [1880, 220, 80, 0.35], [-420, 220, 80, 0.35]].map(([x, h, w, o]) => <g key={x} opacity={o}><DuatGate x={x} gy={GY - 30} h={h} w={w} t={t} seed={x} glow={0.6} /></g>)}
		<DuatGate x={gx} gy={GY + 4} h={560} w={200} t={t} seed={2} />
		{door > 0 && <><defs><linearGradient id="b16door" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFB45A" /><stop offset="0.6" stopColor="#FFE2A0" /><stop offset="1" stopColor="#FFF8E0" /></linearGradient></defs>
			<rect x={gx - 100} y={GY + 4 - 520} width={200} height={524} fill="url(#b16door)" opacity={0.95 * door} /></>}
		{/* uraei along the gate's cornice */}
		{Array.from({length: 11}, (_, i) => { const x = gx - 300 + i * 60; return <g key={i} transform={`translate(${x},${GY - 586})`}><path d="M-6 0L6 0L6 -14Q12 -24 4 -30Q-4 -34 -6 -24Z" fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} /><circle cx={2} cy={-36} r={5} fill={PAL.red} stroke={PAL.ink} strokeWidth={1.5} /></g>; })}
		<Flame x={gx - 150} y={GY - 4} s={1.1} t={t} seed={3} /><Flame x={gx + 150} y={GY - 4} s={1.1} t={t} seed={4} />
		<rect x={-400} y={GY} width={2400} height={300} fill="#2A0A08" />
		<rect x={-400} y={GY} width={2400} height={8} fill="#5A1A10" />
		{Array.from({length: 22}, (_, i) => <path key={i} d={`M${-360 + i * 110} ${GY + 30 + (i % 3) * 22}l56 -3`} stroke="#4A1610" strokeWidth={3} />)}
		{GUARD16.map((G, k) => { const {p, g} = guard(k), at = gripOf(p, 'f');
			return <g key={k}>
				<God id={`b16g${k}`} cast={G.cast} pose={p} x={G.x} y={GY + 2} s={s} face={-1} sec={{t: t + k}} />
				<g transform={`translate(${G.x},${GY + 2}) scale(${-s},${s})`}><BigKnife at={at} c={{OW: 2.7 / s, LW: 1.5 / s}} L={4.4} glint={Math.min(1, 1.4 * g)} a={-6 * g - 172 * low(k)} /><FistOver pose={p} side="f" c={{OW: 2.7 / s, LW: 1.5 / s}} skin={PAL.skinM} /></g>
			</g>; })}
		{b !== undefined && <>
			<ellipse cx={ax + 20} cy={GY + 4} rx={90} ry={9} fill="#120302" opacity={0.5} />
			<God id="b16ani" cast={walking ? ANI : {...ANI, bHand: 'fist', fHand: 'fist'}} pose={ani} x={ax} y={GY} s={s} sec={{t, amp: 1.2}} />
			{!walking && sc16 > 0 && <g opacity={sc16}>
				<path d={poly([[sb[0], sb[1] - 4], [sf[0], sf[1] - 4], [sf[0] + 5, sf[1] - 92 * k16], [sb[0] - 5, sb[1] - 92 * k16]])} fill="#F6E6B8" stroke={PAL.ink} strokeWidth={2.2} />
				<g transform={`translate(${sb[0] + 3},${sb[1] - 84 * k16})`}><GlyphColumns x={0} y={0} cols={Math.max(1, Math.round((sf[0] - sb[0]) / 22))} rows={3} cell={18} seed={163} mono="#9A6A1E" /></g>
				{[sb, sf].map((q, i) => <rect key={i} x={q[0] - 7} y={q[1] - 100 * k16} width={14} height={104 * k16} rx={6} fill="#D9BE7E" stroke={PAL.ink} strokeWidth={2.2} />)}
				<g transform={`translate(${ax},${GY}) scale(${s})`}><FistOver pose={ani} side="b" c={{OW: 2.7 / s, LW: 1.5 / s}} skin={PAL.skinM} /><FistOver pose={ani} side="f" c={{OW: 2.7 / s, LW: 1.5 / s}} skin={PAL.skinM} /></g>
			</g>}
			{glyphs}
		</>}
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
		{/* v7 (owner 11-05: 「遇到蛇和鳄鱼？翻攻略，念[驱鳄咒]。」): the page of the guide for crocodiles pops up over the raised scroll —
		   a papyrus vignette with a crocodile and its spell columns — and bursts into the glyph ring */}
		{(() => { const pg = up(t, 1.0, 0.25) * (1 - up(t, S17.burst - 0.02, 0.16)); if (pg <= 0.01) return null; const px = sc[0] + 300, py = sc[1] - 20;
			return <g opacity={pg} transform={`translate(${px},${py}) scale(${lerp(0.55, 1, pg)}) rotate(${-3 + 3 * pg})`}>
				<rect x={-150} y={-100} width={300} height={200} fill="#EBD7A4" stroke={PAL.ink} strokeWidth={4} />
				<rect x={-140} y={-90} width={280} height={180} fill="none" stroke={PAL.red} strokeWidth={3} />
				<GlyphColumns x={-128} y={-80} cols={8} rows={1} cell={30} seed={177} />
				<g transform="translate(18,72)"><Croc x={0} y={0} s={9} face={-1} t={0} jaw={24} walk={0} /></g>
				<path d="M-14 -70L134 -70" stroke={PAL.red} strokeWidth={0} />
			</g>; })()}
		{/* front half of the ring, in front of you */}
		{ringArc(false)}{G.filter((g) => g.front).map(drawG)}
		<Beetles x={ax + 160} y={GY + 30} t={t} t0={S17.skitter} n={12} seed={17} r={220} s={2.1} floor={GY + 60} />
		{/* the crocodile on the near floor: contact shadow, feet planted on CG, scaled about its feet */}
		<ellipse cx={crX - 0.4 * CS * crK} cy={CG + 3} rx={7.0 * CS * crK} ry={12 * crK} fill="#0E0201" opacity={0.7} />
		<g transform={`translate(${crX},${CG}) scale(${crK}) translate(${-crX},${-CG})`}><Croc x={crX} y={CG} s={CS} face={-1} t={t} jaw={jaw} walk={t * 10 * walking} /></g>
	</Stage60>;
};
export const _keep = {GlyphColumns, solve, ap, sp, Embers, Dust};
