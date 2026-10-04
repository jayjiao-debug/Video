import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {GoldTitle} from '../../src/brand/Brand';
import {ease, mix, prog, useCue, useScene} from '../../src/lib/context';
import {font} from '../../src/lib/theme';
import type {SceneProps} from '../../src/lib/types';
import {Tag} from '../xuming/look3';
import {Glow} from '../xuming/kit3';
import {
	Bedroom,
	Bubble,
	Card,
	ChatHead,
	ChatStack,
	Clock,
	Corridor,
	DeskLamp,
	Dust,
	H,
	Headphones,
	HUE,
	Person,
	Phone,
	Pool,
	SHE,
	SIT_PHONE,
	STUDENT59,
	TimeChip,
	W,
	Wave,
} from './kit';
import {Canvas, EPISODE, View, arrive, cam, camPath, landed, shake, through} from './stage';

// ---------------------------------------------------------------- shared 1959 props

export const Student: React.FC<{x: number; seat: number; s?: number; head?: number; reach?: [number, number]; sil?: string}> = ({x, seat, s = 1.3, head = 10, reach, sil = '#120c0a'}) => (
	<g>
		<path
			d={`M${x - 70 * s},${seat} L${x + 40 * s},${seat} L${x + 40 * s},${seat + 14} L${x - 70 * s},${seat + 14} Z M${x - 64 * s},${seat} L${x - 80 * s},${seat - 170 * s} L${x - 66 * s},${seat - 170 * s} L${x - 50 * s},${seat} Z M${x - 60 * s},${seat + 14} L${x - 60 * s},${seat + 150} M${x + 32 * s},${seat + 14} L${x + 32 * s},${seat + 150}`}
			fill="#140e0a"
			stroke="#140e0a"
			strokeWidth={6}
		/>
		<Person
			look={STUDENT59}
			x={x}
			y={seat + 216 * s}
			s={s}
			pose={{lean: 6, head, armNear: [40, 60], armFar: [34, 66], legNear: [86, 88], legFar: [82, 90], lift: -66}}
			rim="warm"
			sil={sil}
			reach={reach ? {near: reach, far: [reach[0] - 6, reach[1] + 4]} : undefined}
		/>
	</g>
);

export const Table: React.FC<{x0: number; x1: number; y: number}> = ({x0, x1, y}) => (
	<g>
		<rect x={x0} y={y} width={x1 - x0} height={16} fill="#2a1d14" />
		<rect x={x0} y={y} width={x1 - x0} height={2} fill={HUE.lamp} opacity={0.5} />
		<rect x={x0 + 30} y={y + 16} width={14} height={H - y} fill="#160f0a" />
		<rect x={x1 - 44} y={y + 16} width={14} height={H - y} fill="#160f0a" />
	</g>
);

export const BASE = 760;
export const SC = (v: number) => (v - 60) * 13; // ratings axis starts at 60 (labelled)

export const Bar: React.FC<{x: number; base?: number; h: number; label: string; v?: string; gold?: boolean; dashed?: boolean; red?: boolean; o?: number; vo?: number}> = ({
	x,
	base = BASE,
	h,
	label,
	v,
	gold,
	dashed,
	red,
	o = 1,
	vo = 1,
}) => {
	const c = gold ? HUE.gold : red ? '#e5484d' : '#cfc6b6';
	return (
		<g opacity={o}>
			{h > 0.5 ? <rect x={x - 70} y={base - h} width={140} height={h} fill={c} opacity={gold ? 0.22 : 0.08} stroke={c} strokeWidth={2} strokeDasharray={dashed ? '10 8' : undefined} filter={gold ? 'url(#g-sm)' : undefined} /> : null}
			{v ? (
				<text x={x} y={base - h - 24} textAnchor="middle" opacity={vo} style={{fontFamily: font.latin, fontWeight: 600, fontSize: gold ? 76 : 54, fill: c}}>
					{v}
				</text>
			) : null}
			<text x={x} y={base + 50} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 26, letterSpacing: '0.2em', fill: '#d8cfc0'}} opacity={0.8}>
				{label}
			</text>
		</g>
	);
};

const Lamp1959: React.FC<{id: string; x?: number; y?: number}> = ({id, x = 1180, y = 420}) => (
	<>
		<rect x={-2000} y={-2000} width={W + 4000} height={H + 4000} fill="#07060a" />
		<Pool x={x} y={y} r={820} c={HUE.lamp} id={id} />
	</>
);

// ---------------------------------------------------------------- 1. hook: 嗯

// the conversation in screen space; OFF scrolls it so TA's reply sits above the input bar
export const OFF = -64;
export const MSGS: {chip?: string; chipY?: number; y: number; text: string}[] = [
	{chip: '21:02', chipY: 118, y: 128, text: '今天路过那家店了，\n想起你说想去'},
	{y: 214, text: '下周末有空吗？'},
	{chip: '22:40', chipY: 290, y: 300, text: '在忙吗？'},
	{y: 358, text: '看到了回我一下就好'},
	{chip: '23:58', chipY: 434, y: 444, text: '没空也没关系哈哈'},
	{y: 502, text: '早点睡'},
];
export const REPLY_Y = 588;
export const PHONE = {x: 960, y: 480};
export const SCR = {x: PHONE.x - 165, y: PHONE.y - 340}; // screen origin in world space
const UM = {x: SCR.x + 44, y: SCR.y + REPLY_Y + OFF + 25}; // the 嗯 bubble's centre in world space
const SEAT = 700 + 216 * 1.3;
const HANDX = 700 + 104 * 1.3;
const HANDY = SEAT - 262 * 1.3 - 6;

const Hook: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const CUT1 = 71; // 2.38 s accent: the bedroom
	const CUT2 = 163; // 5.43 s accent: into the screen
	const THUD = 10; // 0.34 s accent: 嗯 lands

	// --- H1: the giant 嗯, then the pull back that reveals her wall of messages
	const c1 = camPath(f, [
		[0, cam(UM.x, UM.y, 11.5)],
		[THUD, cam(UM.x, UM.y, 10.2)],
		[THUD + 4, cam(UM.x, UM.y, 10.2)],
		[THUD + 34, cam(PHONE.x, PHONE.y - 10, 1.24)],
		[CUT1, cam(PHONE.x, PHONE.y - 10, 1.3)],
	], ease.out);
	const thud = f >= THUD ? Math.exp(-(f - THUD) / 4) : 0;

	// --- H2: the bedroom, pushing into the phone; pushes through its light into H3
	const c2 = camPath(f, [
		[CUT1, cam(900, 560, 1.0)],
		[CUT2 - 12, cam(HANDX, HANDY, 1.5)],
	]);
	const thru = through(f, CUT2 - 14, 14);

	// --- H3: the phone again: a draft typed and deleted, her bubbles warm to gold, the screen dims
	const arr = arrive(f, CUT2, 16);
	const gold = (i: number) => prog(f, cue(2) + 6 + i * 7, 20, ease.inOut);
	const c3 = camPath(f, [
		[CUT2, cam(PHONE.x, PHONE.y + 30, 1.2)],
		[cue(2) - 6, cam(PHONE.x, PHONE.y + 40, 1.3)],
		[cue(2) + 60, cam(PHONE.x + 30, PHONE.y - 40, 1.55)],
		[438, cam(PHONE.x + 20, PHONE.y - 20, 1.5)],
	]);
	const draftText = '那我们下周…';
	const n = [...draftText].length;
	const typed = Math.floor(Math.max(0, f - (cue(1) + 10)) / 4);
	const del = Math.floor(Math.max(0, f - (cue(1) + 74)) / 2);
	const draft = [...draftText].slice(0, Math.max(0, Math.min(n, typed) - del)).join('');
	const caret = Math.floor(f / 15) % 2 === 0;
	const bright = 1 - 0.55 * prog(f, 377, 36, ease.inOut);
	const phoneO = 1 - prog(f, 438, 16, ease.inOut);
	const lift = prog(f, 440, end - 8 - 440, ease.inOut);

	const chat = (opts: {gold?: boolean; bright?: number}) => (
		<Phone x={PHONE.x} y={PHONE.y} s={1} glow={opts.bright ?? 1}>
			<g transform={`translate(0,${OFF})`}>
				{MSGS.map((m, i) => (
					<g key={i}>
						{m.chip ? <TimeChip y={m.chipY!} t={m.chip} /> : null}
						<Bubble y={m.y} mine text={m.text} />
					</g>
				))}
				<TimeChip y={REPLY_Y - 10} t="01:07" />
			</g>
			<ChatHead />
			<Clock t="01:07" />
			<rect x={14} y={606} width={302} height={50} rx={25} fill="#1b1c33" stroke="#3a3d66" strokeWidth={1} />
			<text x={34} y={639} style={{fontFamily: font.sans, fontSize: 20, fill: draft ? '#e6e4f2' : '#5a5e8a'}}>
				{draft || '发消息'}
				{draft && caret ? '|' : ''}
			</text>
			<rect width={330} height={680} rx={44} fill="#000" opacity={1 - (opts.bright ?? 1)} />
		</Phone>
	);
	// TA's reply drawn on its own so it can land with weight
	const reply = (pop: number) => (
		<g transform={`translate(${UM.x},${UM.y}) scale(${1 + 0.18 * pop}) translate(${-UM.x},${-UM.y})`}>
			<g transform={`translate(${SCR.x},${SCR.y + OFF})`}>
				<Bubble y={REPLY_Y} text="嗯" w={52} />
			</g>
		</g>
	);

	// gold bubbles: from the camera's view of the phone to the title card's motif position
	const gx = SCR.x + 187;
	const gy = SCR.y + 300 + OFF;
	const scrX = 960 + c3.z * (gx - c3.x);
	const scrY = 540 + c3.z * (gy - c3.y);
	const flyZ = mix(c3.z, 0.5, lift);
	const flyX = mix(scrX, 960, lift);
	const flyY = mix(scrY, 690, lift);

	return (
		<Canvas flash={f >= CUT2 ? arr.flash * 0.6 : 0} flashColor={HUE.phone}>
			{f < CUT1 ? (
				<View c={c1} sh={shake(f, THUD, 14)}>
					<rect x={-2000} y={-2000} width={6000} height={6000} fill="#05050b" />
					<Pool x={960} y={520} r={800} c={HUE.phone} id="hk1" />
					{chat({})}
					{reply(thud)}
				</View>
			) : null}
			{f >= CUT1 && f < CUT2 ? (
				<g>
					<g opacity={thru.o}>
						<View c={{...c2, z: c2.z * thru.z}}>
							<Bedroom f={f} phone={1} />
							<Person look={SHE} x={700} y={SEAT} s={1.3} pose={SIT_PHONE} rim="cool" sil="#0a0a14" reach={{near: [104, -262], far: [98, -258]}} />
							<g transform={`translate(${HANDX},${HANDY}) rotate(-20)`}>
								<rect x={-13} y={-22} width={26} height={44} rx={5} fill={HUE.phoneWarm} />
								<circle r={70} fill={HUE.phone} opacity={0.22} filter="url(#b8)" />
							</g>
						</View>
					</g>
					<g opacity={1 - prog(f, CUT1 + 50, 14)}>
						<Tag en="1:07 AM" zh="凌晨一点" />
					</g>
					<rect width={W} height={H} fill={HUE.phone} opacity={0.5 * prog(f, CUT2 - 8, 8, ease.in)} style={{mixBlendMode: 'screen'}} />
				</g>
			) : null}
			{f >= CUT2 ? (
				<g>
					<g opacity={phoneO}>
						<View c={{...c3, z: c3.z * arr.z}}>
							<Pool x={960} y={520} r={800} c={HUE.phone} o={bright} id="hk3" />
							{chat({bright})}
							{reply(0)}
						</View>
					</g>
					{/* her bubbles, warming to gold, then flying into the motif */}
					<g transform={`translate(${flyX},${flyY}) scale(${flyZ * (f >= CUT2 ? 1 : 1)}) translate(${-gx},${-gy})`} opacity={1 - prog(f, end - 8, 6)}>
						<g transform={`translate(${SCR.x},${SCR.y + OFF})`}>
							{MSGS.map((m, i) => (gold(i) > 0 ? <Bubble key={i} y={m.y} mine text={m.text} gold={1} o={gold(i)} /> : null))}
						</g>
					</g>
					<ChatStack x={960} y={690} s={1.3} o={prog(f, end - 10, 8)} />
					<Dust seed="hk" f={f} n={40} c="#d8deff" o={phoneO} />
				</g>
			) : null}
		</Canvas>
	);
};

// ---------------------------------------------------------------- 2. cold open: title card → 1959 corridor → sign-up sheet → the test door

const TitleCard: React.FC<{f: number; out: number}> = ({f, out}) => {
	const meta = (d: number) => prog(f, d, 14);
	const t = through(f, out, 18);
	return (
		<g opacity={t.o}>
			<g transform={`translate(960,600) scale(${t.z}) translate(-960,-600)`}>
				<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#05050b" />
				<Pool x={960} y={540} r={760} c={HUE.gold} o={0.5} id="tc" />
				<Dust seed="tc" f={f} n={50} c="#ffd98f" o={0.7} />
				<g opacity={meta(8)}>
					<text x={960} y={330} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 26, letterSpacing: '0.42em', fill: '#e0b46e'}}>
						{EPISODE.kicker}
					</text>
				</g>
				<GoldTitle text={EPISODE.title} f={f} at={0} size={150} y={530} />
				<ChatStack x={960} y={690} s={1.3} />
				<g opacity={meta(20)}>
					<text x={960} y={840} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 38, fill: '#f6e7c8'}}>
						{EPISODE.tagline}
					</text>
				</g>
				<g opacity={meta(28)}>
					<text x={960} y={886} textAnchor="middle" style={{fontFamily: font.latinItalic, fontSize: 30, fill: '#cdbb98'}}>
						{EPISODE.taglineEn}
					</text>
				</g>
				<g opacity={meta(36)}>
					<text x={960} y={950} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 20, letterSpacing: '0.3em', fill: '#bfa77a'}}>
						— Juno 出品 · VIBE知识大赏 —
					</text>
				</g>
			</g>
		</g>
	);
};

const SignSheet: React.FC<{f: number; at: number}> = ({f, at}) => (
	<g transform="translate(960,470) rotate(-3)">
		<rect x={-330} y={-230} width={660} height={430} fill="#e9dcc0" />
		<text x={0} y={-150} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 52, fill: '#2a2018'}}>
			招募 · 讨论小组
		</text>
		<text x={0} y={-92} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 30, letterSpacing: '0.2em', fill: '#4a3a2a'}}>
			THE PSYCHOLOGY OF SEX
		</text>
		{Array.from({length: 7}, (_, i) => {
			const w = 90 + ((i * 53) % 120);
			const k = prog(f, at + i * 6, 10);
			return (
				<g key={i}>
					<line x1={-260} y1={-30 + i * 30} x2={260} y2={-30 + i * 30} stroke="#8a7a62" strokeWidth={1} />
					<path
						d={`M-250,${-36 + i * 30} c 14,-10 22,6 34,-4 c 12,-10 18,8 30,-2 c 12,-8 ${w - 80},4 ${w - 64},-2`}
						fill="none"
						stroke="#2a2018"
						strokeWidth={2.2}
						strokeDasharray={w + 60}
						strokeDashoffset={(w + 60) * (1 - k)}
						opacity={0.8}
					/>
				</g>
			);
		})}
	</g>
);

const ColdOpen: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const OUT = 126; // the title card pushes through into the corridor
	const SHEET = cue(1) - 8;
	const DOOR = cue(2) - 6;

	// corridor dolly toward the lit door, the door swings wider
	const corrIn = arrive(f, OUT + 10, 22);
	const cc = camPath(f, [
		[OUT + 10, cam(1080, 560, 1.0)],
		[SHEET - 10, cam(1400, 540, 1.6)],
	]);
	const open = mix(0.3, 0.7, prog(f, OUT + 10, SHEET - OUT - 20, ease.inOut));
	const thruDoor = through(f, SHEET - 16, 16);
	// the sheet under the lamp: arrive from the light, tilt down as names fill in
	const sa = arrive(f, SHEET, 16);
	const sc = camPath(f, [
		[SHEET, cam(960, 360, 1.35)],
		[DOOR, cam(960, 500, 1.15)],
	]);
	// the test door: closer, the door slowly closes to a crack, push into the crack at the end
	const dc = camPath(f, [
		[DOOR, cam(1380, 520, 1.55)],
		[end - 16, cam(1410, 540, 1.95)],
	]);
	const shut = mix(0.45, 0.04, prog(f, DOOR + 30, end - DOOR - 50, ease.inOut));
	const crack = through(f, end - 14, 14);

	return (
		<Canvas
			flash={
				f >= SHEET
					? Math.max(sa.flash * 0.9, f >= DOOR ? 0.85 * prog(f, end - 10, 10, ease.in) : 0)
					: f >= OUT + 10
						? Math.max(corrIn.flash * 0.5, 0.9 * prog(f, SHEET - 10, 10, ease.in))
						: 0
			}
			flashColor={HUE.lamp}
		>
			{f >= OUT && f < SHEET ? (
				<g opacity={thruDoor.o}>
					<View c={{...cc, z: cc.z * corrIn.z * thruDoor.z}}>
						<Corridor f={f} open={open} />
					</View>
					<g opacity={landed(f, OUT + 24, SHEET - 30)}>
						<Tag en="1959 · Stanford University" zh="1959 · 斯坦福大学" />
					</g>
				</g>
			) : null}
			{f >= SHEET && f < DOOR ? (
				<View c={{...sc, z: sc.z * sa.z}}>
					<Lamp1959 id="co2" x={1100} y={300} />
					<SignSheet f={f} at={SHEET + 14} />
					<Pool x={960} y={470} r={600} c={HUE.lamp} o={0.5} id="co2b" />
					<text x={1180} y={760} textAnchor="end" opacity={landed(f, SHEET + 50)} style={{fontFamily: font.latin, fontSize: 30, letterSpacing: '0.2em', fill: '#e9dcc0'}}>
						63 · STUDENTS
					</text>
					<Dust seed="co2" f={f} n={40} c="#ffe0b0" />
				</View>
			) : null}
			{f >= DOOR ? (
				<g opacity={crack.o}>
					<View c={{...dc, z: dc.z * crack.z}}>
						<Corridor f={f} open={shut} />
						<g transform="translate(1340,250)">
							<rect x={18} y={196} width={120} height={44} fill="#e9dcc0" transform="skewY(-22)" opacity={0.9} />
							<text x={78} y={228} textAnchor="middle" transform="skewY(-22)" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 24, fill: '#7a1f1f'}}>
								难堪测试
							</text>
						</g>
					</View>
				</g>
			) : null}
			{f < OUT + 20 ? <TitleCard f={f} out={OUT} /> : null}
		</Canvas>
	);
};

// ---------------------------------------------------------------- 3. setup: three tests, headphones, a dull tape, our guess

const Reels: React.FC<{f: number}> = ({f}) => (
	<g>
		{[700, 1220].map((x, i) => (
			<g key={i} transform={`translate(${x},420) rotate(${f * (i ? 2.2 : 3)})`}>
				<circle r={150} fill="none" stroke="#c9a070" strokeWidth={2} />
				<circle r={110} fill="#1a130d" opacity={0.6} />
				<circle r={40} fill="#2a2018" stroke="#c9a070" strokeWidth={2} />
				{[0, 120, 240].map((a) => (
					<line key={a} x1={0} y1={0} x2={140 * Math.cos((a * Math.PI) / 180)} y2={140 * Math.sin((a * Math.PI) / 180)} stroke="#6a5038" strokeWidth={8} />
				))}
			</g>
		))}
		<path d="M700,570 L1220,570" stroke="#8a6a48" strokeWidth={3} />
	</g>
);

const Setup: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const S2 = cue(1) - 8;
	const S3 = cue(2) - 6;
	const S4 = cue(3) - 6;
	const S5 = cue(4) - 8;

	// S1: arrive out of the door crack into the desk lamp, pull back to her reading
	const a1 = arrive(f, 0, 18);
	const c1 = camPath(f, [
		[0, cam(1270, 500, 2.6)],
		[46, cam(1000, 560, 1.16)],
		[S2, cam(940, 560, 1.24)],
	]);
	const flush = prog(f, cue(0) + 20, 60, ease.inOut);
	const tremble = 1.6 * Math.sin(f / 2.3) * flush;
	// whip pan S1 → S2
	const whip1 = prog(f, S2 - 8, 14, ease.inOut);
	// S2: three lamps light on the beat
	const c2 = camPath(f, [
		[S2, cam(1120, 470, 1.08)],
		[S3, cam(860, 470, 1.0)],
	]);
	const lamp = (i: number) => prog(f, S2 + 10 + i * 14, 10);
	// S3: headphones come down, the intercom starts to talk
	const c3 = camPath(f, [
		[S3, cam(960, 560, 1.1)],
		[S4, cam(840, 470, 1.38)],
	]);
	const hp = prog(f, S3 + 14, 18, ease.out);
	// S4: tilt down the cord to the tape recorder
	const tilt = prog(f, S4 - 6, 20, ease.inOut);
	const c4 = camPath(f, [
		[S4, cam(960, 470, 1.15)],
		[S5, cam(960, 520, 1.05)],
	]);
	// S5: the tape's flat line becomes the baseline of our guess
	const toBase = prog(f, S5 - 6, 22, ease.inOut);
	const guess = (i: number) => prog(f, S5 + 16 + i * 10, 18, ease.out);

	return (
		<Canvas flash={a1.flash * 0.7} flashColor={HUE.lamp}>
			{f < S2 + 6 ? (
				<g opacity={1 - whip1} filter={whip1 > 0.05 ? 'url(#whip)' : undefined} transform={`translate(${-900 * whip1},0)`}>
					<View c={{...c1, z: c1.z * a1.z}}>
						<Lamp1959 id="s1" />
						<Table x0={860} x1={1560} y={700} />
						<DeskLamp x={1220} y={700} s={1.1} />
						<Student x={700} seat={760} reach={[150, -236]} head={18} />
						<g transform={`rotate(${tremble},905,560)`}>
							<Card x={905} y={560} rot={-14} s={0.55} />
						</g>
						<Person
							look={{...STUDENT59, hair: 'short', outfit: 'suit'}}
							x={1660}
							y={980}
							s={1.3}
							pose={{lean: 2, head: -4, armNear: [30, 50], armFar: [24, 56], legNear: [86, 88], legFar: [82, 90], lift: -66}}
							flip
							rim="warm"
							sil="#0e0a08"
						/>
						<Pool x={860} y={420} r={240} c="#e5484d" o={0.5 * flush} id="s1r" />
						<Dust seed="s1" f={f} n={40} c="#ffe0b0" x0={600} x1={1500} y0={250} y1={760} />
					</View>
				</g>
			) : null}
			{f >= S2 - 6 && f < S3 ? (
				<g opacity={prog(f, S2 - 6, 10)} filter={f < S2 + 4 ? 'url(#whip)' : undefined} transform={`translate(${900 * (1 - prog(f, S2 - 6, 12, ease.out))},0)`}>
					<View c={c2}>
						<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#07060a" />
						{[
							{x: 400, k: 1, l: '难堪', red: true},
							{x: 960, k: 0.45, l: '温和'},
							{x: 1520, k: 0.08, l: '免考'},
						].map((b, i) => {
							const o = b.k * lamp(i);
							return (
								<g key={i}>
									<Pool x={b.x} y={380} r={360} c={b.red ? '#ff8a6a' : HUE.lamp} o={o} id={`s2${i}`} />
									<line x1={b.x} y1={-200} x2={b.x} y2={250} stroke="#2a2018" strokeWidth={2} />
									<Glow x={b.x} y={262} r={50 * o + 6} o={0.2 + 0.8 * o} />
									<Card x={b.x} y={560} s={0.8} o={0.25 + 0.75 * Math.max(o, 0.1)} />
									<text x={b.x} y={760} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 40, fill: b.red ? '#ff9a80' : HUE.cream}} opacity={landed(f, S2 + 10 + i * 14) * (0.45 + 0.55 * b.k)}>
										{b.l}
									</text>
									<text x={b.x} y={808} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 26, letterSpacing: '0.3em', fill: '#bfa77a'}} opacity={landed(f, S2 + 16 + i * 14)}>
										21 人
									</text>
								</g>
							);
						})}
					</View>
				</g>
			) : null}
			{f >= S3 && f < S4 + 14 ? (
				<g transform={`translate(0,${-700 * tilt})`} opacity={1 - prog(f, S4 + 4, 10)}>
					<View c={c3}>
						<Lamp1959 id="s3" />
						<Table x0={860} x1={1560} y={700} />
						<DeskLamp x={1300} y={700} s={1.1} />
						<Student x={700} seat={760} head={4} />
						<Headphones x={711} y={mix(180, 532, hp)} s={0.74} />
						<g transform="translate(980,620)">
							<rect x={-40} y={0} width={80} height={80} rx={6} fill="#2a2018" stroke="#6a5038" strokeWidth={2} />
							<circle cx={0} cy={36} r={22} fill="none" stroke="#c9a070" strokeWidth={2} />
							<circle cx={0} cy={36} r={6} fill={HUE.lamp} opacity={hp} filter="url(#g-sm)" />
						</g>
						<path d={`M770,${560} C840,620 900,640 980,660`} fill="none" stroke="#c9a070" strokeWidth={2} opacity={0.5 * hp} />
						<path d="M980,700 C1000,900 980,1100 960,1500" fill="none" stroke="#c9a070" strokeWidth={2} opacity={0.5 * hp} />
						<g opacity={prog(f, S3 + 34, 14)}>
							<Wave x0={1040} x1={1500} y={560} t={f} amp={0.7} />
						</g>
						<Dust seed="s3" f={f} n={40} c="#ffe0b0" x0={600} x1={1500} y0={250} y1={760} />
					</View>
				</g>
			) : null}
			{f >= S4 - 6 ? (
				<g transform={`translate(0,${700 * (1 - tilt)})`}>
					<View c={c4}>
						<rect x={-2000} y={-2000} width={W + 4000} height={H + 4000} fill="#07060a" />
						<Pool x={960} y={460} r={700} c={HUE.lamp} o={0.6 * (1 - 0.5 * toBase)} id="s4" />
						<path d="M960,-600 C980,-200 960,100 960,270" fill="none" stroke="#c9a070" strokeWidth={2} opacity={0.5 * (1 - toBase)} />
						<g opacity={1 - toBase}>
							<Reels f={f} />
							<text x={960} y={800} textAnchor="middle" opacity={landed(f, S4 + 16)} style={{fontFamily: font.latinItalic, fontSize: 30, fill: '#bfa77a'}}>
								“one of the most worthless and uninteresting discussions imaginable”
							</text>
							<text x={960} y={844} textAnchor="middle" opacity={landed(f, S4 + 26) * 0.7} style={{fontFamily: font.sans, fontSize: 18, letterSpacing: '0.2em', fill: '#bfa77a'}}>
								ARONSON & MILLS, 1959
							</text>
						</g>
						{/* the drone: flat line → baseline */}
						<g transform={`translate(0,${mix(0, BASE - 690, toBase)})`}>
							<Wave x0={mix(560, 460, toBase)} x1={mix(1360, 1480, toBase)} y={690} t={f} amp={0.07 * (1 - toBase)} c={toBase > 0.5 ? '#5a4a38' : '#9a8a72'} />
						</g>
						{toBase > 0 ? (
							<g>
								<text x={960} y={260} textAnchor="middle" opacity={landed(f, S5 + 8)} style={{fontFamily: font.sans, fontSize: 24, letterSpacing: '0.4em', fill: '#bfa77a'}}>
									我们的猜测（示意）
								</text>
								<Bar x={600} h={300 * guess(0)} label="免考" dashed o={landed(f, S5 + 10)} />
								<Bar x={960} h={250 * guess(1)} label="温和" dashed o={landed(f, S5 + 18)} />
								<Bar x={1320} h={120 * guess(2)} label="难堪" dashed red o={landed(f, S5 + 26)} />
							</g>
						) : null}
					</View>
				</g>
			) : null}
			{f >= end - 2 ? null : null}
		</Canvas>
	);
};

// ---------------------------------------------------------------- 4. twist (the break): 不。 the real ratings

const Twist: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	// our guess falls apart on 不。
	const fall = (i: number) => prog(f, cue(0) + i * 3, 20, ease.in);
	// the real chart
	const axis = landed(f, cue(1) - 4);
	const gold = prog(f, cue(2) - 2, 26, ease.out);
	const goldNum = landed(f, cue(2) + 20);
	const rest = (i: number) => prog(f, cue(3) - 2 + i * 8, 22, ease.out);
	const restNum = (i: number) => landed(f, cue(3) + 16 + i * 8);
	// camera: still on 不。, a slow push in on the gold bar, then up into its glow
	const c = camPath(f, [
		[0, cam(960, 540, 1.0)],
		[cue(2) - 10, cam(960, 520, 1.02)],
		[cue(3) - 10, cam(1180, 480, 1.18)],
		[cue(3) + 20, cam(960, 500, 1.05)],
		[end - 40, cam(1000, 480, 1.1)],
		[end, cam(1320, BASE - SC(97.6), 3.2)],
	]);
	const out = prog(f, end - 18, 18, ease.in);
	return (
		<Canvas flash={0.8 * out * out} flashColor={HUE.gold} tension={0.4 * (1 - prog(f, cue(1), 20))}>
			<View c={c}>
				<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#050407" />
				<Pool x={1320} y={420} r={600} c={HUE.gold} o={0.5 * gold} id="tw" />
				{/* the guess, collapsing */}
				{[
					{x: 600, h: 300, l: '免考'},
					{x: 960, h: 250, l: '温和'},
					{x: 1320, h: 120, l: '难堪', red: true},
				].map((b, i) => (
					<g key={i} transform={`translate(0,${400 * fall(i)})`} opacity={(1 - fall(i)) * (1 - axis)}>
						<Bar x={b.x} h={b.h} label={b.l} dashed red={b.red} />
					</g>
				))}
				{/* a hint: a thin gold line starts to grow where the 难堪 bar will rise */}
				<rect x={1318} y={BASE - 60 * prog(f, cue(0) + 24, cue(2) - cue(0) - 24, ease.inOut)} width={4} height={60 * prog(f, cue(0) + 24, cue(2) - cue(0) - 24, ease.inOut)} fill={HUE.gold} opacity={0.9 * (1 - gold)} filter="url(#g-sm)" />
				{axis > 0 ? (
					<g opacity={axis}>
						<line x1={460} y1={BASE} x2={1480} y2={BASE} stroke="#5a4a38" strokeWidth={1.5} />
						<text x={440} y={BASE + 6} textAnchor="end" style={{fontFamily: font.latin, fontSize: 22, fill: '#8a7a62'}}>
							60
						</text>
						<text x={960} y={200} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.4em', fill: '#bfa77a'}}>
							对同一段无聊讨论的评分 · 评分总和
						</text>
						<g opacity={landed(f, cue(1), cue(2) - 6)} transform="translate(960,430) scale(0.42) translate(-960,-420)">
							<Reels f={f} />
						</g>
						<Bar x={600} h={SC(80.2) * rest(0)} label="免考" v="80.2" vo={restNum(0)} />
						<Bar x={960} h={SC(81.8) * rest(1)} label="温和" v="81.8" vo={restNum(1)} />
						<Bar x={1320} h={SC(97.6) * gold} label="难堪" v="97.6" gold vo={goldNum} />
					</g>
				) : null}
			</View>
		</Canvas>
	);
};

export const act1 = {Hook, ColdOpen, Setup, Twist};
