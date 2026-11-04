/* ep60 act C · the Field of Reeds (shots 47–53): the endless fields, farming in paradise, the shabti box, the roll call, the 401-piece
   set, you lying back in a boat, and the pull-back to the painted vignette on the Ani papyrus in the British Museum. */
import React from 'react';
import {God, CAST, Pose, POSES, solve, wristTo, holdAt, reach} from './rig60';
import {GlyphColumns, GLYPH_D} from './props60';
import {Stage60, Dado, RegisterLine, Glow, Dust, Shaft, rng, F_SERIF, FW, FH, PIC_T, PIC_B} from './frame60';
import {Wheat, Palm, PapyrusClump, Ox, Plough, Skiff, River} from './props60b';
import {ANI, ANI_POSES, ploughPose, Shabti, ShabtiPose, walkPose} from './cast60';
import {wobIn, camE, wearZ, eOut, bump, EyeFx, Sparkle, Drop} from './act60c_common';
import {TextCols} from './act60c_twist';
import {PAL, sp, poly, lerp, sm, cl, seg, ap, V} from './geo60';
import type {ShotProps} from './EP60';

const GY = 852;

/* ---------------- landscape pieces ---------------- */
type Kind = 'crop' | 'wheat' | 'flax';
/** a pattern tile per field kind (40 × 40), placed per strip with its own scale */
const FieldPat: React.FC<{id: string; kind: Kind; y: number; k: number}> = ({id, kind, y, k}) => <pattern id={id} patternUnits="userSpaceOnUse" width={40} height={40} patternTransform={`translate(0,${y}) scale(${k})`}>
	{kind === 'crop' && <><rect width={40} height={40} fill="#4E8E48" />{[[10, 32], [30, 14]].map(([x, yy], i) => <path key={i} d={`M${x} ${yy}L${x - 7} ${yy - 13}L${x - 3} ${yy - 14}L${x} ${yy - 5}L${x + 3} ${yy - 14}L${x + 7} ${yy - 13}Z`} fill={i ? '#5DA04E' : '#3E7A3E'} stroke={PAL.ink} strokeWidth={1.2} strokeLinejoin="round" />)}</>}
	{kind === 'wheat' && <><rect width={40} height={40} fill="#D9A84A" />{[6, 16, 26, 36].map((x, i) => <g key={x}><path d={`M${x} 40L${x + 1} ${12 + (i % 2) * 6}`} stroke="#B88A2E" strokeWidth={2} /><ellipse cx={x + 1} cy={8 + (i % 2) * 6} rx={2.6} ry={6} fill={PAL.gold} stroke={PAL.ink} strokeWidth={1} /></g>)}</>}
	{kind === 'flax' && <><rect width={40} height={40} fill="#5C9A50" />{[[8, 10], [24, 6], [34, 22], [14, 28], [28, 34]].map(([x, yy], i) => <g key={i}><path d={`M${x} ${yy + 2}L${x} ${yy + 12}`} stroke="#2E6A3A" strokeWidth={1.6} /><circle cx={x} cy={yy} r={3.2} fill="#7FA6E0" stroke={PAL.ink} strokeWidth={1} /></g>)}</>}
</pattern>;
/** a canal band (water sign zigzag scaled to its height) */
const Canal: React.FC<{x0: number; x1: number; y: number; h: number; t: number; speed?: number}> = ({x0, x1, y, h, t, speed = 10}) => {
	const st = Math.max(8, h * 1.1), a = h * 0.22, off = (t * speed * (h / 30)) % st; let d = '';
	for (let x = x0 - st * 2 + off; x < x1 + st; x += st) d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${(y + h * 0.62).toFixed(1)}L${(x + st / 2).toFixed(1)} ${(y + h * 0.62 - a).toFixed(1)}`;
	return <g><rect x={x0} y={y} width={x1 - x0} height={h} fill={PAL.blue} /><rect x={x0} y={y} width={x1 - x0} height={Math.max(1.5, h * 0.08)} fill={PAL.ink} />
		<path d={d} fill="none" stroke="#BFD8F0" strokeWidth={Math.max(1, h * 0.07)} opacity={0.9} /></g>;
};
/** a flying pintail duck (Egyptian style), facing +x, wings flapping (ph radians) */
const Duck: React.FC<{x: number; y: number; s: number; ph: number; a?: number}> = ({x, y, s, ph, a = -12}) => { const fl = Math.sin(ph);
	return <g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`}>
		<path d={sp([[-1.6, -0.2], [-0.6, -0.5], [0.8, -0.45], [1.5, -0.7], [1.95, -0.6], [2.0, -0.4, 1], [1.4, -0.25], [0.8, 0.25], [-0.6, 0.3], [-1.8, 0.1, 1]], true, 0.18)} fill="#B88A5A" stroke={PAL.ink} strokeWidth={0.09} />
		<path d={sp([[1.5, -0.7], [1.95, -0.6], [2.0, -0.4, 1], [1.6, -0.35]])} fill="#2F6A52" />
		<path d="M2.0 -0.52L2.4 -0.48L2.0 -0.4" fill={PAL.gold} stroke={PAL.ink} strokeWidth={0.06} />
		<path d={`M-0.2 -0.3L${0.4 - 0.2 * fl} ${-0.4 - 1.5 * fl}L${-1.0 - 0.3 * fl} ${-0.3 - 1.2 * fl}Z`} fill="#F1E9D6" stroke={PAL.ink} strokeWidth={0.08} strokeLinejoin="round" />
		<path d="M-1.6 -0.15L-2.4 0.05L-1.7 0.15" fill={PAL.ink} />
	</g>; };
const SkyBand: React.FC<{x0: number; x1: number; y1: number; sun?: V}> = ({x0, x1, y1, sun = [250, 130]}) => <g>
	<rect x={x0} y={-100} width={x1 - x0} height={y1 + 100} fill="#F4D98E" /><rect x={x0} y={-100} width={x1 - x0} height={190} fill="#F0C870" opacity={0.6} />
	<circle cx={sun[0]} cy={sun[1]} r={92} fill="#FFE7A0" opacity={0.5} /><circle cx={sun[0]} cy={sun[1]} r={74} fill="#FFD27A" opacity={0.55} />
	<circle cx={sun[0]} cy={sun[1]} r={58} fill="#E8642A" stroke={PAL.ink} strokeWidth={3} /><circle cx={sun[0]} cy={sun[1]} r={44} fill="none" stroke={PAL.gold} strokeWidth={4} />
</g>;

/* ======================= 47 · 「你进入[芦苇之野]：完美版的埃及。」 endless fields, canals, palms, a reed boat; crane over ======================= */
const BANDS47: [Kind | 'canal', number][] = [['canal', 9], ['crop', 20], ['canal', 11], ['wheat', 28], ['canal', 13], ['flax', 38], ['canal', 17], ['crop', 52], ['canal', 23], ['wheat', 72], ['canal', 31], ['crop', 96], ['canal', 42]];
const S47: React.FC<ShotProps> = ({t}) => {
	const H0 = 236, x0 = -300, x1 = 1750;
	let y = H0; const strips = BANDS47.map(([k, h], i) => { const o = {k, y, h, i}; y += h; return o; });
	const nearY = y, boat = strips[10];
	const cam = camE(t, -0.5, 3.7, [720, 650, 1.32], [720, 470, 1.0]);
	const flock = Array.from({length: 7}, (_, i) => { const u = cl((t - 0.25 - i * 0.07) / 3.2), R = rng(470 + i);
		return {x: lerp(80 + R() * 120, 1150 + R() * 200, u) + i * 26, y: lerp(760 - R() * 60, 150 + R() * 120, eOut(u)) - i * 18, s: 15 + R() * 6, ph: t * 15 + i * 1.7, o: cl(u * 8)}; });
	return <Stage60 t={t} cam={cam} grade="reeds" bg="#F4D98E" wear={wearZ(cam.z)} stain={0.36} wobble={wobIn(t)}
		light={<>
			<Glow x={250} y={130} r={520} c="gold" o={0.7} />
			<Dust t={t} box={[0, 120, 1400, 840]} n={56} seed={47} c="#FFF0B0" o={0.6} vx={9} vy={-3} />
		</>}>
		<defs>{strips.filter((s) => s.k !== 'canal').map((s) => <FieldPat key={s.i} id={`c47p${s.i}`} kind={s.k as Kind} y={s.y} k={s.h / 40} />)}</defs>
		<SkyBand x0={x0} x1={x1} y1={H0} />
		{[100, 230, 330, 480, 560, 700, 820, 960, 1080, 1180, 1320].map((px, i) => <Palm key={px} x={px} y={H0 + 2} h={56 + (i % 3) * 14} t={t} seed={i} />)}
		{strips.map((s) => s.k === 'canal' ? <Canal key={s.i} x0={x0} x1={x1} y={s.y} h={s.h} t={t} /> : <g key={s.i}><rect x={x0} y={s.y} width={x1 - x0} height={s.h} fill={`url(#c47p${s.i})`} /><rect x={x0} y={s.y + s.h - 1} width={x1 - x0} height={1.5} fill={PAL.ink} opacity={0.4} /></g>)}
		{/* a reed boat on the near canal, you at the paddle (after Ani sheet 35) */}
		<g transform={`translate(${520 + 18 * t},${boat.y + boat.h * 0.5})`}>
			<God id="c47ani" cast={ANI} pose={ANI_POSES.kneel(t)} x={10} y={-6} s={4.2} sec={{t}} />
			<Skiff x={0} y={0} s={4.4} t={t} len={22} />
		</g>
		<PapyrusClump x={1200} y={boat.y + 2} h={70} t={t} n={7} seed={4} />
		{/* the near field: tall wheat swaying, papyrus at the bank */}
		<rect x={x0} y={nearY} width={x1 - x0} height={GY - nearY + 10} fill="#7A9A44" />
		<Wheat x0={-100} x1={1600} y={GY} h={150} t={t} seed={47} dense={1.3} />
		<PapyrusClump x={60} y={GY} h={200} t={t} n={9} seed={7} />
		<PapyrusClump x={1330} y={GY} h={180} t={t} n={8} seed={9} />
		{flock.map((d, i) => d.o > 0 ? <g key={i} opacity={d.o}><Duck x={d.x} y={d.y} s={d.s} ph={d.ph} /></g> : null)}
		<Dado x0={x0} x1={x1} y={GY} h={80} />
	</Stage60>;
};

/* ======================= 48 · 「但是——天堂里，也要[种地]。」 you behind the plough, sweating; the grain is taller than you; deadpan ======================= */
export const T48 = {moo: 0.4, sweat: [0.7, 1.05, 1.9], look: 1.4};
const S48: React.FC<ShotProps> = ({t}) => {
	const OS = 24, k = OS / 17, v = 30, ox = 880 + v * t, oph = t * 3.4, AS = 22;
	const yoke: V = [ox + 3.2 * OS, GY - 7.4 * OS], share: V = [ox - 9.5 * OS - 40 * k, GY - 2], grip: V = [ox - 9.5 * OS - 130 * k, GY - 122 * k], px = ox - 9.5 * OS - 205 * k;
	const pose = ploughPose(oph, [(grip[0] - px) / AS, (grip[1] - GY) / AS]), g = solve(pose), hd = ap(g.head, [0.2, -2.1]), head: V = [px + hd[0] * AS, GY + hd[1] * AS];
	const look = sm(seg(t, T48.look, T48.look + 0.25)), nose: V = [ox + 6.4 * OS, GY - 5.7 * OS];
	const cam = camE(t, 0, 2.9, [650, 520, 1.04], [700 + v * 2.9, 512, 1.1]);
	return <Stage60 t={t} cam={cam} grade="reeds" bg="#F4D98E" wear={0.7} stain={0.34}
		tags={[{x: px - 140, y: 360, text: '阿尼'}]}
		light={<>
			<Glow x={300} y={150} r={520} c="gold" o={0.6} />
			{/* the moo: warm breath from the front ox */}
			{[0, 1, 2].map((i) => { const u = cl((t - T48.moo - i * 0.08) / 0.7); return u > 0 && u < 1 ? <ellipse key={i} cx={nose[0] + 40 + u * 90} cy={nose[1] - 10 - u * 30} rx={16 + 30 * u} ry={11 + 18 * u} fill="#FFFFFF" opacity={0.55 * (1 - u)} /> : null; })}
			{/* clods thrown off the share */}
			{Array.from({length: 9}, (_, i) => { const u = ((t * 1.6 + i / 9) % 1); return <circle key={i} cx={share[0] - 20 - u * 70 - i * 3} cy={share[1] - 8 - 60 * u + 70 * u * u} r={4 + (i % 3) * 2} fill="#5A3A1A" opacity={1 - u} />; })}
			<Dust t={t} box={[0, 120, 1500, 840]} n={50} seed={48} c="#FFF0B0" o={0.55} vx={6} vy={-4} />
		</>}>
		<SkyBand x0={-200} x1={1900} y1={300} sun={[300, 140]} />
		{[120, 900, 1500].map((x, i) => <Palm key={x} x={x} y={302} h={130 + 30 * (i % 2)} t={t} seed={i + 4} />)}
		<rect x={-200} y={300} width={2100} height={GY - 300} fill="#7A9A44" />
		{/* the wheat behind you: taller than a man */}
		<path d={`M-200 ${GY - 26}L-200 ${GY - 400}` + Array.from({length: 44}, (_, i) => `L${-200 + i * 50 + 25} ${GY - 430 - 25 * Math.sin(i * 1.7) + 6 * Math.sin(t * 1.4 + i)}L${-200 + i * 50 + 50} ${GY - 405}`).join('') + `L2000 ${GY - 26}Z`} fill="#D9A84A" stroke={PAL.ink} strokeWidth={2} />
		<Wheat x0={-200} x1={1900} y={GY - 26} h={520} t={t} seed={48} dense={2.2} />
		<rect x={-200} y={GY - 26} width={2100} height={36} fill="#6E8E3C" />
		{Array.from({length: 12}, (_, i) => <path key={i} d={`M${-100 + i * 180} ${GY - 6}Q${-10 + i * 180} ${GY - 22} ${80 + i * 180} ${GY - 6}`} fill="none" stroke="#4A3418" strokeWidth={4} opacity={0.55} />)}
		<Ox x={ox - 50 * k} y={GY - 6} s={OS} ph={oph + 1.4} t={t} hide="red" />
		<Plough yoke={yoke} share={share} grip={grip} />
		<Ox x={ox} y={GY} s={OS} ph={oph} t={t} />
		<God id="c48ani" cast={ANI} pose={pose} x={px} y={GY} s={AS} sec={{t}} />
		<EyeFx id="c48e" pose={pose} x={px} y={GY} s={AS} skin={PAL.skinM} look={look} flat={look} />
		{T48.sweat.map((t0, i) => { const u = (t - t0) / 0.7; return u > 0 && u < 1 ? <Drop key={i} x={head[0] - 30 - 70 * u + i * 16} y={head[1] - 10 - 90 * u + 170 * u * u} r={11} a={-20 - 30 * u} o={1 - u * u} /> : null; })}
		{t > T48.sweat[0] && <Drop x={head[0] + 34} y={head[1] + 30 + 6 * Math.sin(t * 3)} r={9} o={sm(seg(t, T48.sweat[0], T48.sweat[0] + 0.2))} />}
		<Dado x0={-200} x1={1900} y={GY} h={80} />
	</Stage60>;
};

/* ======================= 49 · 「所以，你带了一箱小人：[沙布提]。」 you open a painted box; rows of shabtis stand up ======================= */
export const T49 = {lid: [0.2, 0.95], rows: [1.05, 1.3, 1.55]};
const BOX = {x0: 600, x1: 1080, top: 548, D: 130};
const S49: React.FC<ShotProps> = ({t}) => {
	const th = (Math.PI / 180) * 104 * eOut(seg(t, T49.lid[0], T49.lid[1])), up = Math.sin(th) * BOX.D, face = Math.max(0, Math.cos(th)) * 62;
	const lidBot = BOX.top - up, open = cl(th / (Math.PI / 2));
	// you, bending to lift the lid's front edge, then straightening to look in
	const AX = 486, AS = 19, letGo = sm(seg(t, 0.95, 1.3));
	let pose: Pose = {...POSES.rest, lean: lerp(10, 4, letGo) + 0.6 * Math.sin(t * 1.4), neck: 4, head: lerp(6, 10, letGo), rt: -8, at: 12, rk: 3, ak: 2};
	const hand: V = [(BOX.x0 + 40 - AX) / AS, (lidBot - 4 - GY) / AS], rest: V = [3.4, -8.2];
	pose = wristTo(reach(pose, 'f', [lerp(hand[0], rest[0], letGo), lerp(hand[1], rest[1], letGo)]), 'f', lerp(150, 60, letGo));
	pose = wristTo(holdAt(pose, 'b', [1.2, -2.6]), 'b', 20);
	const rows = [0, 1, 2].map((r) => { const u = cl((t - T49.rows[r]) / 0.28), b = u < 1 ? eOut(u) + 0.18 * Math.sin(Math.PI * u) : 1; return {y: BOX.top + 10 + r * 22 + (1 - b) * 130, s: 9 + 1.0 * r, n: 8 - (r % 2), r}; });
	const cam = camE(t, 0, 3.1, [700, 486, 1.0], [800, 520, 1.12]);
	return <Stage60 t={t} cam={cam} grade="reeds" bg="#F4D98E" wear={wearZ(cam.z, 0.8)} stain={0.34}
		tags={[{x: 1150, y: 300, text: '沙布提', o: sm((t - 1.2) / 0.3)}]}
		light={<>
			<Glow x={300} y={140} r={480} c="gold" o={0.55} />
			<Glow x={(BOX.x0 + BOX.x1) / 2} y={BOX.top - 20} r={340} c="green" o={0.7 * open} />
			<Glow x={(BOX.x0 + BOX.x1) / 2} y={BOX.top - 30} r={200} c="white" o={0.4 * open} />
			<Dust t={t} box={[BOX.x0 - 60, 200, BOX.x1 + 60, 620]} n={34} seed={49} c="#DFFFF0" o={0.7 * open} vx={2} vy={-14} r={2.4} />
		</>}>
		<SkyBand x0={-200} x1={1900} y1={330} sun={[260, 140]} />
		{[150, 400, 1220, 1420].map((x, i) => <Palm key={x} x={x} y={332} h={140 + 26 * (i % 2)} t={t} seed={i + 2} />)}
		<Canal x0={-200} x1={1900} y={330} h={40} t={t} />
		<rect x={-200} y={370} width={2100} height={GY - 370} fill="#5E964A" />
		<Wheat x0={-200} x1={1900} y={470} h={110} t={t} seed={49} dense={1.2} />
		<rect x={-200} y={470} width={2100} height={GY - 470} fill="#7A9A44" />
		{/* the lid's inside, standing up behind the box as it opens */}
		{up > 2 && <path d={sp([[BOX.x0 + 4, BOX.top, 1], [BOX.x1 - 4, BOX.top, 1], [BOX.x1 - 4, lidBot, 1], [(BOX.x0 + BOX.x1) / 2, lidBot - 26 * open], [BOX.x0 + 4, lidBot, 1]], true, 0.2)} fill="#8A5A2E" stroke={PAL.ink} strokeWidth={3} />}
		{/* the shabtis inside, rising row by row (the box front hides what is below the rim) */}
		{rows.map((rw) => Array.from({length: rw.n}, (_, i) => { const x = BOX.x0 + 60 + i * ((BOX.x1 - BOX.x0 - 120) / (rw.n - 1));
			return <Shabti key={`${rw.r}.${i}`} x={x} y={rw.y} s={rw.s} t={t} p={{alive: 0}} />; }))}
		{/* the box: yellow ground, red and blue frame, painted signs, sledge runners */}
		<path d={poly([[BOX.x0, BOX.top], [BOX.x1, BOX.top], [BOX.x1, GY - 22], [BOX.x0, GY - 22]])} fill="#E7C46A" stroke={PAL.ink} strokeWidth={3.5} />
		<rect x={BOX.x0 + 10} y={BOX.top + 10} width={BOX.x1 - BOX.x0 - 20} height={GY - 22 - BOX.top - 20} fill="none" stroke={PAL.red} strokeWidth={6} />
		<rect x={BOX.x0 + 20} y={BOX.top + 20} width={BOX.x1 - BOX.x0 - 40} height={GY - 22 - BOX.top - 40} fill="none" stroke={PAL.blue} strokeWidth={4} />
		<GlyphColumns x={BOX.x0 + 40} y={BOX.top + 40} cols={11} rows={2} cell={32} seed={49} />
		{Array.from({length: 12}, (_, i) => <rect key={i} x={BOX.x0 + 34 + i * 35} y={GY - 100} width={28} height={40} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} stroke={PAL.ink} strokeWidth={1.5} />)}
		<rect x={BOX.x0 - 12} y={GY - 22} width={BOX.x1 - BOX.x0 + 24} height={22} fill="#8A5A2E" stroke={PAL.ink} strokeWidth={3} />
		{/* the lid's outer face, foreshortening as it swings back */}
		{face > 1 && <g><path d={sp([[BOX.x0 - 14, lidBot, 1], [BOX.x1 + 14, lidBot, 1], [BOX.x1 + 14, lidBot - face * 0.55, 1], [(BOX.x0 + BOX.x1) / 2, lidBot - face], [BOX.x0 - 14, lidBot - face * 0.55, 1]], true, 0.22)} fill="#D9A23E" stroke={PAL.ink} strokeWidth={3.5} />
			<path d={`M${BOX.x0} ${lidBot - face * 0.2}L${BOX.x1} ${lidBot - face * 0.2}`} stroke={PAL.red} strokeWidth={5 * (face / 62)} />
			<circle cx={(BOX.x0 + BOX.x1) / 2} cy={lidBot - face * 0.5} r={9 * (face / 62) + 1} fill={PAL.blue} stroke={PAL.ink} strokeWidth={2} /></g>}
		<God id="c49ani" cast={ANI} pose={pose} x={AX} y={GY} s={AS} sec={{t}} />
		<Dado x0={-200} x1={1900} y={GY} h={80} />
	</Stage60>;
};

/* ======================= 50 · 「一点名，它们就答：“[我在]！”」 the roll call; they snap alive and march off, hoes on shoulders ======================= */
export const T50 = {snap: 0.8, march: 1.286, step: 60 / 112 / 2}; // march on the playful cue's 112 bpm grid (141.486 = downbeat)
const S50: React.FC<ShotProps> = ({t}) => {
	const AX = 210, AS = 20;
	let pose: Pose = {...POSES.rest, lean: 3 + 0.5 * Math.sin(t * 1.5), neck: 6, head: 12, rt: -6, at: 9, rk: 2, ak: 1};
	pose = wristTo(holdAt(pose, 'f', [4.4, -5.9]), 'f', 140);
	pose = wristTo(holdAt(pose, 'b', [3.9, -5.4]), 'b', 150);
	const g = solve(pose), fh = ap(g.fH, [0, 0.9]), bh = ap(g.bH, [0, 0.9]), F: V = [AX + fh[0] * AS, GY + fh[1] * AS], B: V = [AX + bh[0] * AS, GY + bh[1] * AS];
	const alive = sm(seg(t, T50.snap, T50.snap + 0.08)), hop = bump(t, T50.snap, T50.snap + 0.32), mt = Math.max(0, t - T50.march);
	const ph = Math.PI * mt / T50.step, mx = 150 * mt;
	const rowsS = [{y: GY - 70, s: 8.2, n: 8, x0: 610, dx: 76}, {y: GY, s: 10, n: 8, x0: 560, dx: 84}];
	const R = rng(50);
	return <Stage60 t={t} cam={camE(t, 0, 2.7, [700, 500, 1.02], [740, 496, 1.08])} grade="reeds" bg="#F4D98E" wear={0.75} stain={0.34}
		light={<>
			<Glow x={300} y={140} r={480} c="gold" o={0.55} />
			{/* the summons: gold signs flying off the papyrus to the figures */}
			{Array.from({length: 9}, (_, i) => { const u = cl((t - 0.02 - i * 0.07) / 0.55); if (u <= 0 || u >= 1) return null; const tx = 640 + i * 70, ty = GY - 160 - (i % 3) * 30;
				return <g key={i} transform={`translate(${lerp(F[0], tx, eOut(u))},${lerp(F[1] - 20, ty, eOut(u)) - 60 * Math.sin(Math.PI * u)}) scale(30)`} opacity={Math.sin(Math.PI * u)}><path d={GLYPH_D[Object.keys(GLYPH_D)[i % 16]].d} fill="#FFD86A" stroke={PAL.ink} strokeWidth={0.04} transform="translate(-0.5,-0.5)" /></g>; })}
			{t > T50.snap && t < T50.snap + 0.6 && rowsS[1] && Array.from({length: 8}, (_, i) => <g key={i} opacity={bump(t, T50.snap, T50.snap + 0.6)}>
				<path d={`M${rowsS[1].x0 + i * rowsS[1].dx + mx - 7} ${GY - 196 - 30 * hop}L${rowsS[1].x0 + i * rowsS[1].dx + mx + 7} ${GY - 196 - 30 * hop}L${rowsS[1].x0 + i * rowsS[1].dx + mx + 3} ${GY - 150 - 30 * hop}L${rowsS[1].x0 + i * rowsS[1].dx + mx - 3} ${GY - 150 - 30 * hop}Z`} fill="#B8371F" stroke={PAL.ink} strokeWidth={1.5} />
				<circle cx={rowsS[1].x0 + i * rowsS[1].dx + mx} cy={GY - 136 - 30 * hop} r={6} fill="#B8371F" stroke={PAL.ink} strokeWidth={1.5} /></g>)}
			<Dust t={t} box={[0, 120, 1500, 840]} n={44} seed={50} c="#FFF0B0" o={0.55} vx={6} vy={-4} />
		</>}>
		<SkyBand x0={-200} x1={1900} y1={330} sun={[1000, 150]} />
		{[130, 380, 1240, 1440].map((x, i) => <Palm key={x} x={x} y={332} h={140 + 26 * (i % 2)} t={t} seed={i + 6} />)}
		<Canal x0={-200} x1={1900} y={330} h={40} t={t} />
		<rect x={-200} y={370} width={2100} height={GY - 370} fill="#5E964A" />
		<Wheat x0={-200} x1={1900} y={560} h={170} t={t} seed={50} dense={1.2} />
		<rect x={-200} y={560} width={2100} height={GY - 560} fill="#7A9A44" />
		{Array.from({length: 12}, (_, i) => <path key={i} d={`M${-100 + i * 180} ${GY - 8}Q${-10 + i * 180} ${GY - 26} ${80 + i * 180} ${GY - 8}`} fill="none" stroke="#4A3418" strokeWidth={4} opacity={0.5} />)}
		{rowsS.map((rw, r) => Array.from({length: rw.n}, (_, i) => { const jig = 0.4 * R();
			const p: ShabtiPose = alive < 1 && t < T50.march ? {alive, act: 'march', ph: 0} : {alive: 1, act: 'march', ph: ph + jig * 0};
			return <Shabti key={`${r}.${i}`} x={rw.x0 + i * rw.dx + mx} y={rw.y - 26 * hop * (1 - r * 0.2)} s={rw.s} t={t} p={p} />; }))}
		{/* you, reading the roll call off a papyrus */}
		<God id="c50ani" cast={ANI} pose={pose} x={AX} y={GY} s={AS} sec={{t}} />
		<g><path d={poly([[B[0] - 6, B[1] - 70], [F[0] + 10, F[1] - 76], [F[0] + 12, F[1] + 30], [B[0] - 4, B[1] + 34]])} fill="#EBD7A4" stroke={PAL.ink} strokeWidth={2.4} />
			<GlyphColumns x={B[0] + 4} y={B[1] - 56} cols={2} rows={4} cell={18} seed={50} /></g>
		<Dado x0={-200} x1={1900} y={GY} h={80} />
	</Stage60>;
};

/* ======================= 51 · 「后来全套：365个干活，36个[监工]。」 the field fills with the full set; a counter rolls to 401 ======================= */
export const T51 = {fill: [0.25, 2.0], beat0: 0.293, crack: 2.436, beat: 60 / 112}; // hoes on the 112 bpm beats (143.093 …), crack on 145.236
const S51: React.FC<ShotProps> = ({t}) => {
	const phH = 2 * Math.PI * (t - T51.beat0) / T51.beat, phO = t * 3; // the hoe strikes the ground at ph = 0: on the beat
	const ROWK = [0.56, 0.66, 0.77, 0.89, 1.02, 1.16], ROWY = [298, 382, 478, 588, 708, 838], CX = 650, BW = 185;
	const blocks: {r: number; c: number; i: number}[] = [];
	for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) blocks.push({r, c, i: r * 6 + c});
	const order = (b: {r: number; c: number}) => (5 - b.r) * 6 + (b.r % 2 ? 5 - b.c : b.c);
	const step = (T51.fill[1] - T51.fill[0]) / 36;
	const shown = blocks.reduce((a, b) => a + (t > T51.fill[0] + order(b) * step ? 1 : 0), 0);
	const n = Math.min(401, Math.round(shown * 401 / 36));
	const cam = camE(t, 0, 3.9, [700, 520, 1.1], [690, 486, 1.0]);
	const crack = t > T51.crack ? Math.exp(-(t - T51.crack) / 0.18) : 0, front = {x: CX - 0.5 * BW * 1.16 - 78 * 1.16, y: ROWY[5] + 2 * 1.16};
	return <Stage60 t={t} cam={cam} grade="reeds" bg="#F4D98E" wear={0.65} stain={0.3}
		screen={<>
			{/* the counter (top left) */}
			<g transform="translate(70,62)">
				<rect x={0} y={0} width={262} height={104} rx={14} fill="#F3E3B8" stroke={PAL.ink} strokeWidth={3} />
				<rect x={7} y={7} width={248} height={90} rx={9} fill="none" stroke={PAL.red} strokeWidth={2} />
				<text x={130} y={84} textAnchor="middle" fontFamily={F_SERIF} fontWeight={900} fontSize={80} fill={n >= 401 ? '#B8371F' : PAL.ink}>{n}</text>
			</g>
		</>}
		light={<>
			<Glow x={240} y={110} r={420} c="gold" o={0.55} />
			<Dust t={t} box={[0, 200, 1300, 880]} n={36} seed={51} c="#FFF0B0" o={0.45} vx={5} vy={-3} />
			{crack > 0.02 && <><Sparkle x={front.x + 64} y={front.y - 150} r={80 * crack} rot={20} c="#FFFFFF" /><g stroke="#FFFFFF" strokeWidth={5} opacity={crack}>{[0, 1, 2, 3, 4].map((i) => { const a = (i * 72 + 10) * Math.PI / 180; return <line key={i} x1={front.x + 64 + Math.cos(a) * 46} y1={front.y - 150 + Math.sin(a) * 46} x2={front.x + 64 + Math.cos(a) * 92} y2={front.y - 150 + Math.sin(a) * 92} />; })}</g></>}
		</>}>
		<defs>
			<g id="c51w"><Shabti x={0} y={0} s={5} t={t} p={{alive: 1, act: 'hoe', ph: phH}} /></g>
			<g id="c51o"><Shabti x={0} y={0} s={5} t={t} p={{alive: 1, act: 'idle', overseer: true, ph: phO}} /></g>
		</defs>
		{/* the far edge: a plain sky and a canal (the stamp sits top right: kept calm) */}
		<rect x={-200} y={-100} width={2000} height={300} fill="#F4D98E" />
		{[420, 560, 700].map((x, i) => <Palm key={x} x={x} y={198} h={90 + 20 * (i % 2)} t={t} seed={i + 11} />)}
		<Canal x0={-200} x1={1800} y={196} h={22} t={t} />
		<rect x={-200} y={218} width={2000} height={GY - 218} fill="#6E9A44" />
		{blocks.map((b) => { const k = ROWK[b.r], w = BW * k, x = CX + (b.c - 2.5) * w, y = ROWY[b.r], u = cl((t - T51.fill[0] - order(b) * step) / 0.22);
			const plot = <path key="p" d={poly([[x - w * 0.46, y + 10 * k], [x + w * 0.46, y + 10 * k], [x + w * 0.44, y - 62 * k], [x - w * 0.44, y - 62 * k]])} fill="#86AE52" stroke="#4E7A30" strokeWidth={2} />;
			if (u <= 0) return <g key={b.i}>{plot}</g>;
			const pop = eOut(u) + 0.15 * Math.sin(Math.PI * u), extra = b.r === 0 && b.c < 5 ? 1 : 0; // 35 blocks of 10 + 5 of 11 = 365
			const out: React.ReactNode[] = [plot];
			for (let j = 0; j < 2; j++) for (let i = 0; i < 5 + (j === 0 ? extra : 0); i++) out.push(<use key={`${j}.${i}`} href="#c51w" transform={`translate(${x - 32 * k + i * 27 * k - (j === 0 ? extra * 13 * k : 0)},${y - (1 - j) * 34 * k}) scale(${k * pop})`} />);
			if (!(b.r === 5 && b.c === 2)) out.push(<use key="o" href="#c51o" transform={`translate(${x - 78 * k},${y + 2 * k}) scale(${k * 1.45 * pop})`} />);
			return <g key={b.i}>{out}</g>; })}
		{/* the front overseer, cracking the whip */}
		{t > T51.fill[0] + 0.25 && <Shabti x={front.x} y={front.y} s={5 * 1.16 * 1.45} t={t} p={{alive: 1, act: 'idle', overseer: true, ph: t < T51.crack - 0.2 ? phO : Math.PI / 2 + 6 * cl((t - T51.crack + 0.2) / 0.4)}} />}
		<Dado x0={-200} x1={1800} y={GY} h={80} />
	</Stage60>;
};

/* ======================= 52 · 「你呢？躺着就行。」 you lie back in a reed boat, eyes closed; the shabtis harvest behind ======================= */
/** reclining: the whole figure tipped back about the hip, legs forward (one knee up), both hands behind the head */
export const lieBack = (t: number): {pose: Pose; rot: number} => {
	const br = Math.sin(t * 1.6);
	let p: Pose = {lean: 0, neck: 10, head: 6 + 1.5 * Math.sin(t * 0.7), bs: 0, be: 0, bw: 0, fs: 0, fe: 0, fw: 0, rt: 28, rk: 10, at: 72, ak: 78 + 3 * Math.sin(t * 0.6), y: 9.6};
	p = wristTo(holdAt(p, 'b', [-1.6, -8.2 - 0.05 * br], false, -1), 'b', -170);
	p = wristTo(holdAt(p, 'f', [-1.3, -8.6 - 0.05 * br], false, -1), 'f', -175);
	return {pose: p, rot: -58 + 1.2 * br};
};
export const T52 = {sigh: 1.0};
const S52: React.FC<ShotProps> = ({t}) => {
	const bx = 610 + 14 * t, by = 640 + 3 * Math.sin(t * 1.7), rock = 1.4 * Math.sin(t * 1.2), sigh = bump(t, T52.sigh, T52.sigh + 0.8);
	const {pose, rot} = lieBack(t), AS = 20, hip: V = [bx - 70, by - 18];
	const g = solve(pose), mouth = ap(g.head, [1.3, -0.5]);
	const cam = camE(t, -0.4, 2.6, [700, 500, 1.04], [740, 492, 1.09]);
	const harv = [0, 1, 2, 3, 4, 5].map((i) => ({x: 250 + i * 150, a: i % 2 ? 'carry' as const : 'hoe' as const}));
	return <Stage60 t={t} cam={cam} grade="reeds" bg="#F4D98E" wear={0.7} stain={0.34} wobble={wobIn(t)}
		light={<>
			<Glow x={1100} y={120} r={460} c="gold" o={0.6} />
			<Glow x={bx} y={by - 100} r={300} c="gold" o={0.25} />
			<Dust t={t} box={[0, 120, 1500, 840]} n={44} seed={52} c="#FFF0B0" o={0.55} vx={7} vy={-3} />
		</>}>
		<SkyBand x0={-200} x1={1900} y1={250} sun={[1100, 120]} />
		{[90, 420, 760, 1340].map((x, i) => <Palm key={x} x={x} y={252} h={130 + 24 * (i % 2)} t={t} seed={i + 20} />)}
		{/* the far bank: the wheat, and your shabtis doing the work */}
		<rect x={-200} y={250} width={2100} height={260} fill="#5E964A" />
		<Wheat x0={680} x1={1600} y={480} h={150} t={t} seed={52} dense={1.4} />
		{harv.map((h, i) => <Shabti key={i} x={h.x} y={480} s={7.5} t={t} p={{alive: 1, act: h.a, ph: t * 4 + i * 1.3}} />)}
		<Shabti x={1070} y={482} s={9} t={t} p={{alive: 1, act: 'idle', overseer: true, ph: t * 3}} />
		<River x0={-200} x1={1900} y={510} h={300} t={t} speed={-8} />
		{/* the boat and you, tipped back with your hands behind your head */}
		<g transform={`rotate(${rock} ${bx} ${by})`}>
			<g transform={`translate(${hip[0]},${hip[1]}) rotate(${rot}) translate(${-hip[0]},${-hip[1]})`}>
				<God id="c52ani" cast={ANI} pose={pose} x={hip[0]} y={hip[1] + pose.y! * AS} s={AS} sec={{t}} />
				<EyeFx id="c52e" pose={pose} x={hip[0]} y={hip[1] + pose.y! * AS} s={AS} skin={PAL.skinM} lid={1} smile={0.8 + 0.2 * sigh} />
				{sigh > 0.05 && <g transform={`translate(${hip[0] + mouth[0] * AS + 18},${hip[1] + pose.y! * AS + mouth[1] * AS - 6})`} opacity={sigh}>
					<path d={`M0 0Q${16 + 14 * sigh} ${-10} ${30 + 20 * sigh} ${4}Q${40 + 24 * sigh} ${14} ${54 + 30 * sigh} ${2}`} fill="none" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" /></g>}
			</g>
			<Skiff x={bx} y={by} s={20} t={0} len={22} />
		</g>
		{[0, 1].map((i) => { const u = cl((t + 0.3 - i * 0.5) / 2.6); return <Duck key={i} x={lerp(-80, 1250, u) + i * 60} y={lerp(170, 90, u) + i * 30 + 8 * Math.sin(t * 3 + i)} s={14} ph={t * 14 + i * 2} a={-6} />; })}
		<PapyrusClump x={140} y={GY} h={170} t={t} n={9} seed={52} />
		<PapyrusClump x={1260} y={GY} h={150} t={t} n={7} seed={53} />
		<Dado x0={-200} x1={1900} y={GY} h={80} />
	</Stage60>;
};

/* ======================= 53 · 「而纸草上，结局早就[画好]了。」 pull back: it is a vignette on the Ani papyrus; it rolls up into its case ======================= */
export const T53 = {pull: [0, 1.15], roll: [1.15, 1.95], case: [1.6, 2.4]};
/** the painted Field of Reeds as a papyrus vignette (world px inside x0..x1, y0..y1) */
const Vignette: React.FC<{x0: number; y0: number; w: number; h: number; t: number}> = ({x0, y0, w, h, t}) => {
	const r1 = y0 + h * 0.36, r2 = y0 + h * 0.7, yb = y0 + h;
	return <g>
		<rect x={x0} y={y0} width={w} height={h} fill="#EAD6A2" stroke={PAL.ink} strokeWidth={3} />
		{/* register 1: the boat on the canal */}
		<rect x={x0} y={r1 - 26} width={w} height={26} fill={PAL.blue} /><path d={`M${x0} ${r1 - 12}` + Array.from({length: Math.floor(w / 18)}, (_, i) => `L${x0 + i * 18 + 9} ${r1 - 18}L${x0 + i * 18 + 18} ${r1 - 12}`).join('')} fill="none" stroke="#BFD8F0" strokeWidth={2} />
		<g transform={`translate(${x0 + w * 0.55},${r1 - 18})`}><Skiff x={0} y={0} s={5} t={t} len={20} /></g>
		<g transform={`translate(${x0 + w * 0.55 - 8},${r1 - 26}) rotate(-64)`}><God id="c53rec" cast={ANI} pose={lieBack(t).pose} x={0} y={0} s={4.6} sec={{t}} /></g>
		{[0.12, 0.3, 0.84].map((u, i) => <Palm key={i} x={x0 + w * u} y={r1 - 26} h={h * 0.22} t={t} seed={i + 30} />)}
		<RegisterLine x0={x0} x1={x0 + w} y={r1} h={8} />
		{/* register 2: ploughing and reaping */}
		<Wheat x0={x0 + w * 0.5} x1={x0 + w - 10} y={r2} h={h * 0.26} t={t} seed={53} dense={0.9} />
		<Ox x={x0 + w * 0.36} y={r2} s={5.6} ph={t * 3} t={t} />
		<God id="c53plo" cast={ANI} pose={ploughPose(t * 3, [5.2, -7.6])} x={x0 + w * 0.12} y={r2} s={5.2} sec={{t}} />
		<God id="c53har" cast={ANI} pose={ANI_POSES.harvest(t * 2)} x={x0 + w * 0.56} y={r2} s={5.2} sec={{t}} fProp="sickle" />
		<RegisterLine x0={x0} x1={x0 + w} y={r2} h={8} />
		{/* register 3: the shabtis hoeing, canals */}
		{Array.from({length: 7}, (_, i) => <Shabti key={i} x={x0 + w * 0.1 + i * w * 0.12} y={yb - 10} s={3.6} t={t} p={{alive: 1, act: 'hoe', ph: t * 3 + i}} />)}
		<rect x={x0} y={yb - 8} width={w} height={8} fill={PAL.blue} />
	</g>;
};
const S53: React.FC<ShotProps> = ({t}) => {
	const SH = {x0: 120, x1: 1320, y0: 200, y1: 760}, V0 = {x: 420, y: 300, w: 540, h: 330};
	const pull = sm(seg(t, T53.pull[0] - 0.4, T53.pull[1])), roll = eOut(seg(t, T53.roll[0], T53.roll[1])), cs = sm(seg(t, T53.case[0], T53.case[1]));
	const z = lerp(2.05, 0.94, pull), cam = {x: lerp(V0.x + V0.w / 2, 720, pull), y: lerp(V0.y + V0.h / 2, 480, pull), z};
	const rx = lerp(SH.x1, 1010, roll), rr = 30 + 16 * roll;
	return <Stage60 t={t} cam={cam} grade="papyrus" bg="papyrus" wear={wearZ(z, 0.8)} stain={0.36} wobble={wobIn(t)}
		tags={[{x: 300, y: 330, text: '阿尼纸草', o: sm((t - 1.5) / 0.4)}]}
		light={<>
			<Shaft pts={[[520, PIC_T - 60], [920, PIC_T - 60], [1120, 800], [320, 800]]} o={0.4 * cs} />
			<Glow x={680} y={480} r={620} c="warm" o={0.25 + 0.2 * cs} />
			<Dust t={t} box={[300, 120, 1100, 800]} n={30} seed={53} o={0.45 * cs} vx={2} vy={-3} r={1.8} />
		</>}>
		<defs><clipPath id="c53clip"><rect x={SH.x0 - 40} y={SH.y0 - 40} width={rx - SH.x0 + 40} height={SH.y1 - SH.y0 + 80} /></clipPath></defs>
		{/* the sheet: text columns either side of the vignette, rolled up from the right */}
		<g clipPath="url(#c53clip)">
			<path d={sp([[SH.x0, SH.y0 + 6, 1], [SH.x1, SH.y0, 1], [SH.x1 + 4, SH.y1, 1], [SH.x0 + 3, SH.y1 + 6, 1]])} fill="#E4CC92" stroke={PAL.ink} strokeWidth={3} />
			<rect x={SH.x0 + 20} y={SH.y0 + 30} width={SH.x1 - SH.x0 - 40} height={14} fill={PAL.red} opacity={0.6} />
			<TextCols x={SH.x0 + 30} y={SH.y0 + 70} cols={8} rows={12} cell={28} seed={531} lit={0} />
			<TextCols x={V0.x + V0.w + 30} y={SH.y0 + 70} cols={9} rows={12} cell={28} seed={532} lit={0} />
			<Vignette x0={V0.x} y0={V0.y} w={V0.w} h={V0.h} t={t} />
			<TextCols x={V0.x} y={V0.y + V0.h + 22} cols={14} rows={3} cell={28} seed={533} lit={0} />
		</g>
		{/* the roll */}
		{roll > 0 && <g><rect x={rx - rr} y={SH.y0 - 14} width={rr * 2} height={SH.y1 - SH.y0 + 28} rx={rr} fill="#D9BC7A" stroke={PAL.ink} strokeWidth={3} />
			{[0.3, 0.55, 0.8].map((u) => <path key={u} d={`M${rx - rr * u} ${SH.y0 - 6}L${rx - rr * u} ${SH.y1 + 6}`} stroke="#B0904E" strokeWidth={2} />)}
			<ellipse cx={rx} cy={SH.y0 - 14 + rr * 0.3} rx={rr} ry={rr * 0.3} fill="#C9A866" stroke={PAL.ink} strokeWidth={2} /></g>}
		{/* the museum: dark wall around the sheet, the glass case, its label */}
		<path d={`M-400 -200H1900V1200H-400ZM${SH.x0 - 60} ${SH.y0 - 70}V${SH.y1 + 70}H${SH.x1 + 60}V${SH.y0 - 70}Z`} fill="#16120E" fillRule="evenodd" opacity={0.25 + 0.7 * cs} />
		<g opacity={cs}>
			<rect x={SH.x0 - 60} y={SH.y0 - 70} width={SH.x1 - SH.x0 + 120} height={SH.y1 - SH.y0 + 140} fill="none" stroke="#C9D4E0" strokeWidth={4} />
			<path d={poly([[SH.x0 + 80, SH.y0 - 70], [SH.x0 + 150, SH.y0 - 70], [SH.x0 + 20, SH.y1 + 70], [SH.x0 - 50, SH.y1 + 70]])} fill="#FFFFFF" opacity={0.08} />
			<rect x={600} y={SH.y1 + 88} width={240} height={50} rx={4} fill="#E9E2D2" stroke="#0A0806" strokeWidth={2} />
			<text x={720} y={SH.y1 + 122} textAnchor="middle" fontFamily={F_SERIF} fontWeight={900} fontSize={26} fill="#2A2420">EA 10470</text>
		</g>
	</Stage60>;
};

export const REEDS: Record<number, React.FC<ShotProps>> = {47: S47, 48: S48, 49: S49, 50: S50, 51: S51, 52: S52, 53: S53};
export const _keepR = {CAST, walkPose, FW, FH, PIC_B, Shaft} as Record<string, unknown>;
