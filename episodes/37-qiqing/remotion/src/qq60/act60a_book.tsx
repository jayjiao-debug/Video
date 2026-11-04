import React from 'react';
import {Stage60, Glow, Dust, Shaft, Embers, flick, rng, toScreen, FW, PIC_T, F_SERIF} from './frame60';
import {GlyphColumns, Balance, Gateway, Throne, GLYPH_D} from './props60';
import {Mummy, Basket, ScrollRoll, ScrollShelf, Awning, Lamp} from './props60b';
import {God, CAST, POSES, Pose, solve, reach, wristTo, holdAt} from './rig60';
import {CAST2, ANI, leadPair, scribePose, tutuPose} from './cast60';
import {PAL, sp, poly, lerp, cl, sm, V, ap} from './geo60';
import type {ShotProps} from './EP60';
import {pulse, seg, aimPath, HEART_D, Sparkle, DustBurst, wearAt, BaBird, ReedPen, GlyphRun} from './act60a_kit';

/* ep60 act A · the ready-made guide (shots 10–14, 26.5–40.8 s), warm papyrus, playful: the scroll whips open; its real name and the ba
   flying into daylight; the scribe's stall flipping spells like a menu; the finished scroll with the name left blank; Ani's papyrus in
   the museum, his name written in later. Times: shot seconds (t), film seconds in [brackets]. */
const GY = 852;
const PAPY = '#EBD7A4', INK = '#2A1912';
const keyV = (t: number, keys: [number, number, number][], ease = sm): V => { if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
	for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i], u = ease((t - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
	const k = keys[keys.length - 1]; return [k[1], k[2]]; };

/** columns of ink glyphs (red rubrics now and then) between ruled lines; cells listed in `gaps` ([col, row0, row1]) stay empty */
const TextCols: React.FC<{x: number; y: number; cols: number; rows: number; cw: number; seed: number; gaps?: [number, number, number][]; ink?: string}> = ({x, y, cols, rows, cw, seed, gaps = [], ink = INK}) => {
	const R = rng(seed), K = Object.keys(GLYPH_D), out: React.ReactNode[] = [], g = cw * 0.78;
	for (let i = 0; i <= cols; i++) out.push(<line key={'l' + i} x1={x + i * cw} x2={x + i * cw} y1={y} y2={y + rows * cw} stroke={ink} strokeWidth={1.2} opacity={0.6} />);
	for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const k = K[Math.floor(R() * K.length)];
		if (gaps.some(([c, a, b]) => c === i && j >= a && j <= b)) continue;
		out.push(<path key={`${i}.${j}`} d={GLYPH_D[k].d} fill={j === 0 && i % 4 === 0 ? PAL.red : ink} transform={`translate(${x + i * cw + (cw - g) / 2},${y + j * cw + (cw - g) / 2}) scale(${g})`} />); }
	return <g>{out}</g>;
};
/** a papyrus band: fibres, sheet joins, red/black border lines */
const PapyrusBand: React.FC<{x0: number; x1: number; y: number; h: number; seed?: number}> = ({x0, x1, y, h, seed = 3}) => { const R = rng(seed);
	return <g>
		<rect x={x0} y={y} width={x1 - x0} height={h} fill={PAPY} stroke={INK} strokeWidth={2.4} />
		{Array.from({length: Math.round(h / 9)}, (_, i) => <line key={i} x1={x0} x2={x1} y1={y + 6 + i * 9 + R() * 3} y2={y + 6 + i * 9 + R() * 3} stroke="#D9C08A" strokeWidth={1.4} opacity={0.6} />)}
		{Array.from({length: Math.floor((x1 - x0) / 380)}, (_, i) => <line key={'j' + i} x1={x0 + (i + 1) * 380} x2={x0 + (i + 1) * 380} y1={y} y2={y + h} stroke="#C9AE72" strokeWidth={3} opacity={0.6} />)}
		{[[y + 14, INK], [y + 20, PAL.red], [y + h - 20, PAL.red], [y + h - 14, INK]].map(([yy, c], i) => <line key={'b' + i} x1={x0 + 6} x2={x1 - 6} y1={yy as number} y2={yy as number} stroke={c as string} strokeWidth={3} />)}
	</g>; };
/** the title of the book in hieroglyphs: "(spells of) coming forth by day" (house · loaf · owl/bird · sun · ...) */
const TITLE_SIGNS = ['mouth', 'water', 'house', 'loaf', 'bird', 'disc', 'bolt'];
/** the pyramid-topped tomb chapel of Thebes with its door; origin = ground centre */
const TombChapel: React.FC<{x: number; y: number; s?: number; dark?: number}> = ({x, y, s = 1, dark = 1}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<path d={poly([[-70, 0], [70, 0], [70, -120], [-70, -120]])} fill="#F1E6CC" stroke={INK} strokeWidth={2.6} />
	<path d={poly([[-58, -120], [58, -120], [0, -210]])} fill="#F1E6CC" stroke={INK} strokeWidth={2.6} />
	<path d={poly([[-12, -196], [12, -196], [0, -214]])} fill={PAL.gold} stroke={INK} strokeWidth={1.6} />
	<rect x={-30} y={-92} width={60} height={92} fill={dark > 0.5 ? '#2A1A10' : '#FFE9A8'} stroke={INK} strokeWidth={2.4} />
	<rect x={-38} y={-100} width={76} height={10} fill={PAL.red} stroke={INK} strokeWidth={1.6} />
	<rect x={-58} y={-150} width={34} height={20} fill={PAL.blue} stroke={INK} strokeWidth={1.4} /><rect x={24} y={-150} width={34} height={20} fill={PAL.blue} stroke={INK} strokeWidth={1.4} />
</g>;
/** the Book of the Dead as a long painted banner (world px): title + tomb, Anubis leads you, a gate and its knife-guardian, the balance, Osiris.
    x0 = left edge, y = top, H = 440. `glow` = how gold the title has turned. */
const BH = 440;
const BookBanner: React.FC<{x0: number; y: number; t: number; glow?: number; ba?: boolean; id: string}> = ({x0, y, t, glow = 0, ba = true, id}) => {
	const gy = y + BH - 34, lp = leadPair(0.5 + 0.5 * Math.sin(t * 2), 11, x0 + 650, x0 + 520, gy), lead = lp.lead;
	// you follow with the free (far) arm lowered: the kit raises it before the face, which hid the face behind the fist
	const fol: Pose = wristTo(reach(lp.fol, 'b', [-0.4, -8.6]), 'b', 10);
	const guard: Pose = wristTo(holdAt({...POSES.kneel, rt: -10, rk: 100, rf: 40, at: 118, ak: 124, lean: 6, neck: 2, head: 2}, 'f', [3.2, -5.6]), 'f', 96);
	const thoth: Pose = wristTo(holdAt({...POSES.write, head: 6}, 'b', [4.3, -5.0]), 'b', 100);
	return <g>
		<PapyrusBand x0={x0} x1={x0 + 1900} y={y} h={BH} />
		{/* 0: the title column (gold when lit) + the tomb chapel with the ba at its door, the sun on the horizon */}
		<rect x={x0 + 24} y={y + 34} width={96} height={BH - 68} fill="#3A2A6A" opacity={0.75 * glow} />
		<rect x={x0 + 24} y={y + 34} width={96} height={BH - 68} fill="none" stroke={PAL.gold} strokeWidth={4} opacity={glow} />
		<GlyphRun x={x0 + 34} y={y + 44} cell={46} keys={TITLE_SIGNS} color={INK} o={1 - glow} />
		{glow > 0 && <GlyphRun x={x0 + 34} y={y + 44} cell={46} keys={TITLE_SIGNS} color="#FFD45A" stroke="#7A4A08" o={glow} />}
		{glow > 0 && <g style={{mixBlendMode: 'screen'}} opacity={0.6 * glow}><GlyphRun x={x0 + 34} y={y + 44} cell={46} keys={TITLE_SIGNS} color="#FFE9A0" /></g>}
		<line x1={x0 + 130} x2={x0 + 130} y1={y + 30} y2={y + BH - 30} stroke={INK} strokeWidth={2} />
		<g transform={`translate(${x0 + 330},${y + 120})`}>{Array.from({length: 12}, (_, i) => <path key={i} d="M-6 -50L6 -50L0 -74Z" fill={PAL.gold} stroke={INK} strokeWidth={1.4} transform={`rotate(${i * 30 + t * 12})`} />)}
			<circle r={40} fill="#E8642A" stroke={INK} strokeWidth={2.4} /><circle r={28} fill="none" stroke={PAL.gold} strokeWidth={4} /></g>
		<path d={`M${x0 + 140} ${gy}L${x0 + 370} ${gy}`} stroke={INK} strokeWidth={3} />
		<TombChapel x={x0 + 220} y={gy} s={1} />
		{ba && <BaBird x={x0 + 222} y={gy - 120} s={20} ph={1.2} />}
		{/* 1: Anubis leads you by the hand */}
		<GlyphColumns x={x0 + 400} y={y + 40} cols={9} rows={2} cell={34} seed={71} />
		<God id={`${id}-fol`} cast={ANI} pose={fol} x={x0 + 520} y={gy} s={11} sec={{t}} />
		<God id={`${id}-lead`} cast={{...CAST.anubis, bHand: 'fist', fHand: 'fist'}} pose={lead} x={x0 + 650} y={gy} s={11} sec={{t}} bProp="none" fProp="ankh" />
		{/* 2: a gate and its knife-holding guardian */}
		<Gateway x0={x0 + 860} x1={x0 + 1060} top={y + 70} gy={gy} s={8} t={t} />
		<God id={`${id}-gd`} cast={{...CAST.anubis, crown: 'none', bHand: 'fist', fHand: 'fist'}} pose={guard} x={x0 + 750} y={gy} s={10} sec={{t}} bProp="none" fProp="knife" />
		{/* 3: the balance with heart and feather, Thoth writing */}
		<Balance p={{tilt: 1.2 * Math.sin(t * 1.4), plumb: 1.5 * Math.sin(t * 1.8)}} x={x0 + 1290} y={gy} s={14} t={t} />
		<God id={`${id}-th`} cast={CAST.thoth} pose={thoth} x={x0 + 1535} y={gy} s={11} face={-1} sec={{t}} bProp="palette" fProp="pen" />
		{/* 4: Osiris enthroned */}
		<GlyphColumns x={x0 + 1560} y={y + 40} cols={8} rows={2} cell={34} seed={72} />
		<Throne x={x0 + 1700} y={gy} s={11} />
		<God id={`${id}-os`} cast={CAST.osiris} pose={{...POSES.throne, y: 5.95, head: 0.5 * Math.sin(t)}} x={x0 + 1700 + 3.4 * 11} y={gy} s={11} face={-1} sec={{t}} />
		<rect x={x0 + 1600} y={gy - 4} width={180} height={6} fill={PAL.blue} />
	</g>;
};

/* ================= 10 · 26.5–29.1 · the roll is laid in the coffin beside you; the string slips; it whips open like a banner =================
   dissolve in (0.4). Roll set down 0.42 [26.92] · string snaps 0.9 [27.40] · unrolling whoosh 0.95–1.6 [27.45–28.10]. */
export const Shot10: React.FC<ShotProps> = ({t}) => {
	const RX = 300, RY = 690, R0 = 40, RL = 320, L = 1900, by = 300;
	const tSet = 0.42, tSnap = 0.9, tU0 = 0.95, tU1 = 1.6;
	const un = 1 - Math.pow(1 - sm(seg(t, tU0, tU1)), 1.6), x0 = RX - RL / 2, rollX = x0 + L * un;
	// the banner lifts from the coffin floor to face us as it opens
	const rise = sm(seg(t, tU0 + 0.15, tU1 + 0.25)), bTop = lerp(RY - BH / 2, by, rise);
	const cam = aimPath(t, [[-0.4, RX + 20, RY - 90, 700, 500, 1.45], [tU0, RX + 40, RY - 70, 700, 500, 1.5], [tU1 + 0.15, x0 + 690, by + BH / 2, 640, 486, 0.9], [2.6 + 0.4, x0 + 750, by + BH / 2, 640, 486, 0.93]]);
	// the roll is lowered into the coffin, bounces softly, its linen tie (a bow) pops at the snap
	const setY = t < tSet ? lerp(RY - 420, RY, sm(cl((t + 0.4) / (tSet + 0.4))) ** 1.5) : RY - 10 * Math.exp(-(t - tSet) / 0.08) * Math.abs(Math.sin((t - tSet) * 30));
	const snap = pulse(t, tSnap, 0.02, 0.2), su = seg(t, tSnap, tSnap + 0.35);
	const spin = (t * 900) % 24;
	return <Stage60 t={t} cam={cam} grade="papyrus" bg="papyrus" wear={wearAt(cam.z, 0.35)} stain={wearAt(cam.z, 0.2)} dark={0.18 + 0.22 * rise}
		light={<>
			<Glow x={RX} y={RY - 80} r={520} c="warm" o={0.55} />
			{rise > 0 && <rect x={x0} y={bTop} width={rollX - x0} height={BH} fill="#FFF0C8" opacity={0.08 * rise} style={{mixBlendMode: 'screen'}} />}
			{un > 0 && <Glow x={rollX} y={bTop + BH / 2} r={260} c="gold" o={0.4 * (1 - sm(seg(t, tU1, tU1 + 0.4)))} />}
			<Glow x={760} y={by + 200} r={900} ry={380} c="gold" o={0.3 * rise} />
			<Dust t={t} box={[-200, 100, 1900, 900]} n={60} seed={41} o={0.6} vx={14} vy={-3} />
			{snap > 0.02 && <Sparkle x={RX - 40} y={setY - R0} r={34 * snap} o={snap} a={10} />}
		</>}>
		{/* the coffin: painted inner wall with a glyph band, you lying in it, the plank floor */}
		<rect x={-600} y={-300} width={3400} height={1700} fill="#B9844E" />
		<rect x={-600} y={RY - 420} width={3400} height={56} fill={PAL.blue} opacity={0.85} />
		<GlyphColumns x={-200} y={RY - 410} cols={60} rows={1} cell={34} seed={81} mono="#F4E2B0" />
		<Mummy x={RX - 560} y={RY - 150} s={34} t={t} masked />
		<rect x={-600} y={RY - 150} width={3400} height={18} fill="#7A4E2A" stroke={PAL.ink} strokeWidth={2} />
		<rect x={-600} y={RY - 132} width={3400} height={800} fill="#9C6A3A" />
		{Array.from({length: 9}, (_, i) => <line key={i} x1={-600} x2={2800} y1={RY - 90 + i * 70} y2={RY - 90 + i * 70} stroke="#7E5230" strokeWidth={3} />)}
		{un <= 0 ? <g>
			<ellipse cx={RX + 10} cy={RY + R0 + 4} rx={RL * 0.55} ry={14} fill="#3A2010" opacity={0.35 * sm(seg(t, -0.2, tSet))} />
			<g transform={`translate(${RX},${setY}) rotate(-3)`}>
				<rect x={-RL / 2} y={-R0} width={RL} height={R0 * 2} rx={R0 * 0.4} fill="#E8D19A" stroke={PAL.ink} strokeWidth={3} />
				<path d={`M${-RL / 2 + 10} ${-R0 * 0.45}L${RL / 2 - 10} ${-R0 * 0.45}`} stroke="#F8EBC4" strokeWidth={4} />
				<ellipse cx={RL / 2} cy={0} rx={R0 * 0.42} ry={R0} fill="#D9BC7A" stroke={PAL.ink} strokeWidth={2.4} /><ellipse cx={RL / 2} cy={0} rx={R0 * 0.18} ry={R0 * 0.45} fill="none" stroke="#9A7A3A" strokeWidth={2} />
				{/* the linen tie: a band and a bow, which pops loose at the snap */}
				<rect x={-12} y={-R0 - 2} width={22} height={R0 * 2 + 4} fill="#F2E9D2" stroke={PAL.ink} strokeWidth={2} opacity={t < tSnap ? 1 : 1 - su} />
				{t < tSnap ? <g><path d="M0 -40Q-36 -78 -44 -50Q-36 -30 0 -40Z M0 -40Q36 -78 46 -50Q36 -30 0 -40Z" fill="#F2E9D2" stroke={PAL.ink} strokeWidth={2.4} /><circle cx={0} cy={-40} r={8} fill="#E6DCC0" stroke={PAL.ink} strokeWidth={2} /></g>
					: [-1, 1].map((k) => <path key={k} d={`M${k * 8} -40q${k * 40} ${-50} ${k * 90} ${-20}`} fill="none" stroke="#F2E9D2" strokeWidth={7} strokeLinecap="round" opacity={1 - su} transform={`translate(${k * 120 * su},${-140 * su + 200 * su * su}) rotate(${k * 200 * su})`} />)}
			</g>
		</g> : <g>
			<clipPath id="a10-open"><rect x={x0} y={-400} width={rollX - x0} height={1800} /></clipPath>
			<g clipPath="url(#a10-open)"><BookBanner x0={x0} y={bTop} t={t} id="a10" glow={0} /></g>
			{/* the rolling end: a vertical tube, its fibres racing as it turns */}
			<g transform={`translate(${rollX},${bTop + BH / 2})`}>
				<rect x={-R0 * 0.8} y={-BH / 2 - 6} width={R0 * 1.6} height={BH + 12} rx={R0 * 0.8} fill="#D9BC7A" stroke={PAL.ink} strokeWidth={3} />
				<clipPath id="a10-tube"><rect x={-R0 * 0.8} y={-BH / 2 - 6} width={R0 * 1.6} height={BH + 12} rx={R0 * 0.8} /></clipPath>
				<g clipPath="url(#a10-tube)">{Array.from({length: 6}, (_, i) => <line key={i} x1={-R0 + ((i * 24 + spin) % 96) - 20} x2={-R0 + ((i * 24 + spin) % 96) - 20} y1={-BH / 2} y2={BH / 2} stroke="#B99A5A" strokeWidth={4} />)}</g>
				<rect x={-R0 * 0.35} y={-BH / 2 - 6} width={R0 * 0.3} height={BH + 12} fill="#F4E4B8" opacity={0.7} />
			</g>
		</g>}
	</Stage60>;
};

/* ================= 11 · 29.1–31.8 · dawn light rakes the banner; the title glows gold; the ba flies out of the tomb door into the sun =================
   cut in. Light sweep 0–1.3, title fully gold at 0.65 [29.75] (riq shake) · the ba leaves the door 1.15 [30.25]; wing flaps every 0.26 s
   from 1.2 [30.30, 30.56, 30.82, 31.08, 31.34, 31.60]. */
export const Shot11: React.FC<ShotProps> = ({t}) => {
	const x0 = 100, by = 220, gy = by + BH - 34;
	const cam = aimPath(t, [[0, x0 + 150, by + 230, 520, 486, 1.55], [1.2, x0 + 200, by + 230, 560, 486, 1.6], [2.7, x0 + 290, by + 170, 620, 470, 1.75]]);
	const sweep = seg(t, -0.1, 1.3), glow = sm(seg(t, 0.25, 0.65));
	const fly = seg(t, 1.15, 2.7), door: V = [x0 + 222, gy - 120], sun: V = [x0 + 330, by + 120];
	const baP: V = [lerp(door[0], sun[0] + 30, sm(fly)) - 90 * Math.sin(fly * Math.PI), lerp(door[1], sun[1] + 30, sm(fly))], baS = lerp(20, 40, sm(fly));
	const flaps = t < 1.15 ? 1.2 : 1.2 + (t - 1.15) * (2 * Math.PI / 0.26);
	const lx = lerp(x0 - 300, x0 + 900, sweep);
	return <Stage60 t={t} cam={cam} grade="papyrus" bg="papyrus" wear={wearAt(cam.z, 0.35)} stain={wearAt(cam.z, 0.2)}
		light={<>
			<path d={poly([[lx - 160, by - 200], [lx + 40, by - 200], [lx - 120, by + 700], [lx - 320, by + 700]])} fill="#FFE6A0" opacity={0.55 * (1 - sm(seg(t, 1.3, 1.8)))} style={{mixBlendMode: 'screen'}} />
			<Glow x={x0 + 80} y={by + 200} r={300} ry={360} c="gold" o={0.6 * glow} />
			<Glow x={x0 + 330} y={by + 120} r={420} c="warm" o={0.45 + 0.5 * fly} />
			<Glow x={x0 + 330} y={by + 120} r={130} c="white" o={0.35 + 0.55 * fly} />
			{glow > 0.9 && t < 1.2 && [0, 1, 2].map((i) => <Sparkle key={i} x={x0 + 60 + (i % 2) * 40} y={by + 80 + i * 110} r={22 + 10 * Math.sin(t * 9 + i)} a={t * 60} />)}
			<Dust t={t} box={[x0 - 200, by - 200, x0 + 900, by + 600]} n={40} seed={42} c="#FFF0B8" o={0.7} vx={10} vy={-6} />
		</>}>
		<rect x={-600} y={-400} width={2800} height={1800} fill="#C9935A" />
		<BookBanner x0={x0} y={by} t={t} id="a11" glow={glow} ba={t < 1.15} />
		{/* the door glows as the ba comes out; the ba flies off the page toward the sun */}
		{t >= 1.0 && <rect x={x0 + 192} y={gy - 92} width={60} height={92} fill="#FFE9A8" opacity={sm(seg(t, 1.0, 1.2))} />}
		{t >= 1.15 && <BaBird x={baP[0]} y={baP[1]} s={baS} ph={flaps} a={-12} />}
	</Stage60>;
};

/* ================= 12 · 31.8–34.8 · the scribe's stall: the vendor flips spell sheets like a menu; the client points; picks fly to a pile =================
   dissolve in (0.4). Sheet flips on the playful eighths [32.13, 32.39, 32.66] and [33.20, 33.46, 33.73] and [34.27];
   picks (reed-pen tap) at 1.13 [32.93] and 2.20 [34.00]; each pick lands on the pile 0.4 s later [33.33, 34.40]. */
const E8 = 60 / 112 / 2;
const FLIPS = [0.33, 0.33 + E8, 0.33 + 2 * E8, 1.4, 1.4 + E8, 1.4 + 2 * E8, 2.47];
const PICKS = [1.13, 2.2];
const SheetFace: React.FC<{k: number}> = ({k}) => {
	const keys = ['viper', 'bird', 'ankh', 'eye', 'disc', 'djed', 'feather', 'water', 'house', 'basket'];
	const icon = k % 5 === 0 ? <path d={HEART_D} fill={PAL.red} stroke={INK} strokeWidth={0.05} transform="translate(0,40) scale(46)" />
		: <path d={GLYPH_D[keys[k % keys.length]].d} fill={[PAL.red, PAL.blue, PAL.green, INK][k % 4]} stroke={INK} strokeWidth={0.03} transform="translate(-44,-50) scale(88)" />;
	return <g>
		<rect x={-80} y={-110} width={160} height={220} fill={PAPY} stroke={INK} strokeWidth={2.4} />
		<rect x={-68} y={-98} width={136} height={110} fill="none" stroke={PAL.red} strokeWidth={2} />
		{icon}
		<TextCols x={-66} y={22} cols={6} rows={3} cw={22} seed={90 + k} />
	</g>;
};
export const Shot12: React.FC<ShotProps> = ({t}) => {
	const vx = 420, cx = 1050, MX = 690, MY = 600, PW = 160;
	const cam = aimPath(t, [[-0.4, 700, 560, 700, 500, 1.0], [3.4, 710, 590, 700, 500, 1.1]], (u) => u);
	// the menu is an open book on a lectern: the current spell on the left page, pages already turned stack on the right
	const flipped = FLIPS.filter((f) => t >= f + 0.2).length, picked = PICKS.filter((p) => t >= p).length, top = flipped + picked;
	const fl = FLIPS.find((f) => t >= f && t < f + 0.2), fu = fl !== undefined ? (t - fl) / 0.2 : -1;
	const edgeX = fu >= 0 ? MX - PW * Math.cos(fu * Math.PI) : MX - PW;
	// the vendor's fingers turn each page by its free edge (as far as he reaches), and tap the page with his pen on each pick
	const tap = PICKS.reduce((a, q) => a + sm(seg(t, q - 0.15, q)) * (1 - sm(seg(t, q + 0.05, q + 0.3))), 0);
	const hx = lerp(fu >= 0 ? Math.min(edgeX, MX - PW + 70) : MX - PW + 4, MX - PW + 46, tap) - 26, hy = lerp(MY + 64, MY + 20, tap);
	let vPose: Pose = scribePose(t * 3, 0);
	vPose = wristTo(reach(vPose, 'f', [(hx - vx) / 20, (hy - (GY - 10)) / 20]), 'f', 72);
	const point = PICKS.reduce((a, q) => a + sm(seg(t, q - 0.35, q - 0.1)) * (1 - sm(seg(t, q + 0.25, q + 0.5))), 0);
	let cPose: Pose = {...POSES.rest, lean: 3 + 3 * point, head: 4, rt: -6, at: 9, rk: 2, ak: 1};
	cPose = point > 0.01 ? wristTo(reach(cPose, 'f', [(cx - (MX - 80)) / 19, (MY - 20 - GY) / 19]), 'f', lerp(20, 95, point)) : wristTo(reach(cPose, 'f', [3.2, -9.5]), 'f', 20);
	if (point > 0.01 && point < 1) cPose = {...cPose, fs: lerp(wristTo(reach({...POSES.rest, lean: 3, head: 4, rt: -6, at: 9, rk: 2, ak: 1}, 'f', [3.2, -9.5]), 'f', 20).fs, cPose.fs, point)};
	cPose = wristTo(holdAt(cPose, 'b', [0.8, -2.2]), 'b', 10);
	const pile: V = [910, GY - 4];
	const page = (k: number) => <g transform={`translate(${MX - PW / 2},${MY})`}><SheetFace k={k} /></g>;
	return <Stage60 t={t} cam={cam} grade="papyrus" dark={0.1} wear={0.4} stain={0.25} tags={[{x: vx - 130, y: 470, text: '书吏'}]}
		light={<>
			<Shaft pts={[[540, PIC_T], [880, PIC_T], [920, GY], [480, GY]]} o={0.45} />
			<Glow x={MX} y={MY} r={320} c="gold" o={0.4} />
			<Dust t={t} box={[400, 120, 1000, 840]} n={50} seed={23} o={0.7} vx={-4} vy={5} />
			{PICKS.map((q, i) => t > q - 0.02 && t < q + 0.4 ? <Sparkle key={i} x={MX - 80} y={MY - 40} r={50 * pulse(t, q, 0.02, 0.15)} /> : null)}
		</>}>
		<rect x={-300} y={-200} width={2200} height={1400} fill="#D9C08C" />
		<GlyphColumns x={40} y={190} cols={3} rows={3} cell={28} seed={61} />
		<Awning x0={120} x1={1180} y={160} gy={GY} t={t} />
		<ScrollShelf x={880} y={230} w={300} h={300} rows={4} cols={4} seed={9} />
		{/* the lectern and the open book */}
		<path d={poly([[MX - 150, GY], [MX + 150, GY], [MX + 110, MY + 122], [MX - 110, MY + 122]])} fill="#8A5A2E" stroke={PAL.ink} strokeWidth={2.4} />
		<rect x={MX - PW - 8} y={MY - 118} width={2 * PW + 16} height={240} rx={6} fill="#6A4426" stroke={PAL.ink} strokeWidth={2.4} />
		{flipped > 0 && <g>{[3, 2, 1].map((k) => <rect key={k} x={MX + k * 2} y={MY - 110 + k * 2} width={PW} height={220} fill="#DCC48E" stroke={INK} strokeWidth={1.4} />)}
			<rect x={MX} y={MY - 110} width={PW} height={220} fill="#E2CC98" stroke={INK} strokeWidth={2} /><TextCols x={MX + 14} y={MY + 22} cols={6} rows={3} cw={22} seed={77} ink="#C9B07A" /></g>}
		{page(top + 1)}
		{fu >= 0 ? <g transform={`translate(${MX},0) scale(${Math.cos(fu * Math.PI)},1) translate(${-MX},0)`}>{Math.cos(fu * Math.PI) > 0 ? page(top) : <rect x={MX - PW} y={MY - 110} width={PW} height={220} fill="#E2CC98" stroke={INK} strokeWidth={2} />}</g> : page(top)}
		<line x1={MX} x2={MX} y1={MY - 112} y2={MY + 112} stroke={PAL.ink} strokeWidth={3} />
		{/* the vendor, drawn after the book so his hand lies on the page */}
		<God id="a12-v" cast={CAST2.scribe} pose={vPose} x={vx} y={GY - 10} s={20} sec={{t}} fProp="pen" />
		{/* picked sheets fly to the client's pile */}
		<Basket x={pile[0]} y={GY} w={130} h={40} />
		{PICKS.map((q, i) => { if (t < q) return null; const u = cl((t - q) / 0.4), p0: V = [MX - 80, MY], p1: V = [pile[0], pile[1] - 30 - i * 8];
			const x = lerp(p0[0], p1[0], sm(u)), y = lerp(p0[1], p1[1], u) - 200 * 4 * u * (1 - u);
			const kk = FLIPS.filter((f) => q >= f + 0.2).length + i;
			return <g key={i} transform={`translate(${x},${y}) rotate(${lerp(0, 84 + i * 10, sm(u))}) scale(${lerp(1, 0.5, u)})`}><SheetFace k={kk} /></g>; })}
		{/* the client */}
		<God id="a12-c" cast={{...ANI, collar: 'god'}} pose={cPose} x={cx} y={GY} s={19} face={-1} sec={{t}} />
		<Lamp x={150} y={GY} s={1.0} t={t} seed={8} />
		<rect x={-300} y={GY} width={2200} height={300} fill="#B48A55" /><rect x={-300} y={GY} width={2200} height={5} fill={PAL.ink} />
	</Stage60>;
};

/* ================= 13 · 34.8–37.9 · close-up of a finished scroll: every picture painted; where the owner's name goes, a gap =================
   cut in. Push in to the gap; the gap blinks with a white outline at 1.3 [36.10] (ding); it stays outlined, softly pulsing. */
const Sheet13: React.FC<{x: number; y: number; t: number; id: string; gap?: number; name?: number; nameInk?: string; owner?: 'generic' | 'ani'}> = ({x, y, t, id, gap = 0, name = 0, nameInk = '#5A2E12', owner = 'generic'}) => {
	const W = 980, H = 640, gy = y + H - 50, aniX = x + 212;
	const adore: Pose = {...POSES.adore, lean: 9, head: 4};
	const g0: V = [x + 140, y + 60];
	const cols = 9, cw = 40;
	return <g>
		<PapyrusBand x0={x} x1={x + W} y={y} h={H} seed={7} />
		{/* text columns above the owner: the name belongs in column 5, rows 1–3 */}
		<TextCols x={g0[0]} y={g0[1]} cols={cols} rows={5} cw={cw} seed={id === 'a14' ? 12 : 11} gaps={[[5, 1, 3]]} />
		{name > 0 && <GlyphRun x={g0[0] + 5 * cw + 5} y={g0[1] + cw + 4} cell={30} keys={['reed', 'water', 'reed'].slice(0, Math.ceil(name * 3))} color={nameInk} />}
		{name > 0 && <g opacity={0.55 * (1 - sm(cl((name - 0.95) * 4)) * 0.6)} style={{mixBlendMode: 'screen'}}><GlyphRun x={g0[0] + 5 * cw + 3} y={g0[1] + cw + 2} cell={30} keys={['reed', 'water', 'reed'].slice(0, Math.ceil(name * 3))} color="#B87A4A" /></g>}
		{name >= 1 && <rect x={g0[0] + 5 * cw - 4} y={g0[1] + cw - 4} width={cw + 8} height={3 * cw + 8} rx={7} fill="url(#g60-gold)" opacity={0.45} style={{mixBlendMode: 'screen'}} />}
		{gap > 0 && <g>
			<rect x={g0[0] + 5 * cw + 2} y={g0[1] + cw + 2} width={cw - 4} height={3 * cw - 4} rx={4} fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={gap} />
			<rect x={g0[0] + 5 * cw - 4} y={g0[1] + cw - 4} width={cw + 8} height={3 * cw + 8} rx={7} fill="url(#g60-white)" opacity={0.5 * gap} style={{mixBlendMode: 'screen'}} />
		</g>}
		{/* the vignette: the owner adoring, Anubis at the balance, Osiris (all painted in) */}
		<rect x={x + 20} y={gy} width={W - 40} height={8} fill={PAL.red} />
		{owner === 'ani' && <God id={`${id}-tutu`} cast={CAST2.tutu} pose={tutuPose(t)} x={aniX - 150} y={gy} s={16} sec={{t}} />}
		<God id={`${id}-own`} cast={ANI} pose={adore} x={aniX} y={gy} s={16} sec={{t}} />
		<Balance p={{tilt: 0.8 * Math.sin(t * 1.3), plumb: 1.2 * Math.sin(t * 1.7)}} x={x + 665} y={gy} s={13} t={t} />
		<God id={`${id}-anb`} cast={{...CAST.anubis, bProp: 'none', fProp: 'none', bHand: 'open', fHand: 'open'}} pose={wristTo(reach({...POSES.kneel, lean: 2}, 'f', [6.0, -6.6]), 'f', 110)} x={x + 436} y={gy} s={13} sec={{t}} />
		<Throne x={x + 830} y={gy} s={11} />
		<God id={`${id}-os`} cast={CAST.osiris} pose={{...POSES.throne, y: 5.95}} x={x + 830 + 3.4 * 11} y={gy} s={11} face={-1} sec={{t}} />
		<GlyphColumns x={x + 470} y={y + 60} cols={6} rows={2} cell={36} seed={77} />
	</g>;
};
export const Shot13: React.FC<ShotProps> = ({t}) => {
	const sx = 200, sy = 170, gapC: V = [sx + 140 + 5 * 40 + 20, sy + 60 + 40 + 60];
	const cam = aimPath(t, [[0, sx + 480, sy + 330, 720, 486, 1.12], [1.25, gapC[0] + 60, gapC[1] + 40, 720, 486, 1.85], [3.2, gapC[0] + 50, gapC[1] + 30, 720, 486, 1.95]]);
	const blink = pulse(t, 1.3, 0.03, 0.35), gap = t < 1.3 ? 0 : 0.55 + 0.45 * blink + 0.1 * Math.sin(t * 6);
	return <Stage60 t={t} cam={cam} grade="papyrus" dark={0.08} wear={wearAt(cam.z, 0.3)} stain={wearAt(cam.z, 0.2)}
		light={<>
			<Shaft pts={[[sx + 200, -200], [sx + 600, -200], [gapC[0] + 220, sy + 700], [gapC[0] - 200, sy + 700]]} o={0.35} />
			<Glow x={gapC[0]} y={gapC[1]} r={200} c="gold" o={0.3 + 0.4 * blink} />
			{blink > 0.05 && <Sparkle x={gapC[0] + 40} y={gapC[1] - 80} r={60 * blink} o={blink} a={20} />}
			<Dust t={t} box={[sx, sy - 100, sx + 1000, sy + 700]} n={40} seed={51} o={0.6} />
		</>}>
		<rect x={-600} y={-500} width={2800} height={2000} fill="#7A4E2A" />
		{Array.from({length: 14}, (_, i) => <line key={i} x1={-600} x2={2200} y1={-300 + i * 90} y2={-280 + i * 90} stroke="#6A4224" strokeWidth={4} />)}
		<Sheet13 x={sx} y={sy} t={t} id="a13" gap={gap} />
		<ReedPen x={sx + 1040} y={sy + 520} len={260} a={-30} />
	</Stage60>;
};

/* ================= 14 · 37.9–40.8 · the Ani papyrus in its museum case; a reed pen writes Ani's name into the gap in a different ink =================
   dissolve in (0.4). Push through the glass 0–0.9 · pen writes 0.95–2.05 [38.85–39.95] (scratch; one sign per 0.35 s) · glass hum throughout ·
   label 大英博物馆 EA 10470 on the case · tag 书吏 阿尼 from 2.2. */
export const Shot14: React.FC<ShotProps> = ({t}) => {
	const sx = 230, sy = 210, gapC: V = [sx + 140 + 5 * 40 + 20, sy + 60 + 40 + 60];
	const cam = aimPath(t, [[-0.4, 680, 560, 700, 486, 0.86], [0.45, 680, 560, 700, 486, 0.9], [1.05, gapC[0] + 30, gapC[1] + 40, 700, 470, 1.7], [2.05, gapC[0] + 30, gapC[1] + 40, 700, 470, 1.75], [2.7, gapC[0] - 10, gapC[1] + 250, 700, 486, 1.22], [3.3, gapC[0] - 14, gapC[1] + 252, 700, 486, 1.2]]);
	const w = seg(t, 1.05, 2.05), name = w, glass = 1 - 0.7 * sm(seg(t, 0.3, 0.9)) + 0.5 * sm(seg(t, 2.1, 2.9));
	const k = Math.min(2, Math.floor(w * 3)), ku = w * 3 - k;
	const pen: V = [gapC[0] - 6 + 10 * Math.sin(ku * Math.PI * 2), gapC[1] - 50 + k * 31 + 18 * ku];
	const penIn = sm(seg(t, 0.8, 1.05)) * (1 - sm(seg(t, 2.1, 2.4)));
	return <Stage60 t={t} cam={cam} grade="papyrus" bg="#15171D" dark={0.12} darkC="#0A0A10" wear={wearAt(cam.z, 0.25)} stain={wearAt(cam.z, 0.15)}
		tags={t > 2.2 ? [{x: sx + 314, y: sy + 418, text: '书吏 阿尼', o: sm(seg(t, 2.2, 2.45)), size: 30}] : []}
		light={<>
			<Shaft pts={[[sx + 300, -300], [sx + 700, -300], [sx + 1100, sy + 720], [sx - 100, sy + 720]]} o={0.4} />
			<Glow x={sx + 490} y={sy + 330} r={700} ry={420} c="warm" o={0.35} />
			{penIn > 0 && <Glow x={pen[0]} y={pen[1]} r={60} c="gold" o={0.5 * penIn} />}
			{/* the glass: reflections */}
			<g opacity={0.5 * cl(glass)} style={{mixBlendMode: 'screen'}}>
				<path d={poly([[sx + 80, sy - 40], [sx + 220, sy - 40], [sx - 40, sy + 700], [sx - 180, sy + 700]])} fill="#BFD4FF" opacity={0.18} />
				<path d={poly([[sx + 700, sy - 40], [sx + 740, sy - 40], [sx + 480, sy + 700], [sx + 440, sy + 700]])} fill="#BFD4FF" opacity={0.22} />
			</g>
		</>}>
		<rect x={-800} y={-600} width={3200} height={2200} fill="#15171D" />
		{/* the case: dark frame, the sheet mounted inside, the small label */}
		<rect x={sx - 60} y={sy - 60} width={1100} height={760} fill="#20232B" stroke="#0A0B0E" strokeWidth={6} />
		<rect x={sx - 44} y={sy - 44} width={1068} height={728} fill="#2C2F38" />
		<Sheet13 x={sx} y={sy} t={t} id="a14" name={name} nameInk="#5A2E12" owner="ani" />
		{w > 0 && w < 1 && <circle cx={pen[0] + 6} cy={pen[1] + 6} r={5} fill="#5A2E12" opacity={0.6} />}
		<rect x={sx - 40} y={sy + 662} width={290} height={38} rx={3} fill="#E9E2CF" stroke="#0A0B0E" strokeWidth={2} />
		<text x={sx - 28} y={sy + 690} fontFamily={F_SERIF} fontWeight={700} fontSize={24} fill="#2A2A2A">大英博物馆 EA 10470</text>
		{penIn > 0 && <g opacity={penIn}><ReedPen x={pen[0]} y={pen[1]} len={170} a={28} ink="#5A2E12" />
			<g transform={`translate(${pen[0]},${pen[1]}) rotate(28)`}>
				<path d="M-34 -150L-60 -560L60 -560L36 -150Z" fill={PAL.skinM} stroke={PAL.ink} strokeWidth={3.4} />
				<rect x={-40} y={-196} width={80} height={26} rx={6} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2.6} /><rect x={-40} y={-188} width={80} height={8} fill={PAL.blue} />
				<path d={sp([[-38, -170], [36, -172], [44, -130], [36, -96], [6, -84], [-30, -92], [-44, -128]], true, 0.2)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={3.2} />
				{[-26, -10, 6].map((xx) => <path key={xx} d={`M${xx} -96Q${xx + 4} -84 ${xx + 12} -92`} fill="none" stroke={PAL.skinM2} strokeWidth={2.4} />)}
				<path d={sp([[-12, -100], [6, -100], [8, -60], [2, -44], [-8, -44], [-12, -62]], true, 0.2)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={3} />
				<path d={sp([[22, -120], [40, -110], [26, -70], [14, -66], [10, -84]], true, 0.2)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={3} />
			</g></g>}
	</Stage60>;
};
export const _b = {Embers, flick, toScreen, FW, solve, ap, Shaft};
