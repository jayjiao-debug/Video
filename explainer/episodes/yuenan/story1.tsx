import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {handAt, type Pose} from '../../src/art/Figure';
import {Materials} from '../../src/art/materials';
import {GlowDefs} from '../../src/art/glow/kit';
import {OX_DEFS} from '../../src/art/Ox';
import {lookAt} from '../../src/art/sets/Airfield';
import {Apartment, seatY} from '../../src/art/sets/Apartment';
import {ease, mix, prog, useCue, useScene} from '../../src/lib/context';
import {font} from '../../src/lib/theme';
import type {SceneProps} from '../../src/lib/types';
import {Grade} from '../xuming/look3';
import {SHE_POSE, SheOnBed} from './acting';
import {Bubble, ChatHead, ChatStack, Clock, Phone, TimeChip} from './kit';

/**
 * 《越难越爱》 v3, act one opening, in the illustrated look.
 * Her room at 1 a.m. → the camera dives into the phone in her hands (log-zoom, one
 * continuous move landing on the 2.38 s accent) → the chat: two messages at 21:02,
 * TA's single 嗯 at 22:10, then hers at 22:40 and 23:58 with no answer; the clock
 * says 01:07 → she types 我是不是打扰到你了, hesitates, deletes it one character at a
 * time → her bubbles warm to gold (her effort) and fly into the title's motif.
 */

export const W = 1920;
export const H = 1080;

/** shared SVG defs + grade for every scene in the illustrated look */
export const Frame: React.FC<{children: React.ReactNode; over?: React.ReactNode; flash?: number; flashColor?: string; scrim?: number}> = ({children, over, flash = 0, flashColor = '#fff4dc', scrim = 0.55}) => (
	<AbsoluteFill style={{background: '#05050b'}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', fontVariantNumeric: 'lining-nums'}}>
			<GlowDefs />
			<Materials />
			<OX_DEFS />
			<defs>
				<filter id="b8" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="8" />
				</filter>
				<filter id="dof" x="-10%" y="-10%" width="120%" height="120%">
					<feGaussianBlur stdDeviation="9" />
				</filter>
				<radialGradient id="vig3" cx="50%" cy="48%" r="72%">
					<stop offset="0.5" stopColor="#000" stopOpacity="0" />
					<stop offset="1" stopColor="#000" stopOpacity="0.85" />
				</radialGradient>
				<linearGradient id="sub-band" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#000" stopOpacity="0" />
					<stop offset="1" stopColor="#000" stopOpacity="0.9" />
				</linearGradient>
			</defs>
			{children}
			<rect x={0} y={840} width={W} height={240} fill="url(#sub-band)" opacity={scrim} />
			{flash > 0 ? <rect width={W} height={H} fill={flashColor} opacity={flash} /> : null}
			<Grade />
		</svg>
		{over}
	</AbsoluteFill>
);

// ---------------------------------------------------------------- the chat (phone-UI space: screen 330×680, phone centre at PH)

export const PH = {x: 960, y: 480};
export const SCR = {x: PH.x - 165, y: PH.y - 340};
export const CHAT: {chip?: string; chipY?: number; y: number; text: string; mine: boolean}[] = [
	{chip: '21:02', chipY: 118, y: 128, text: '今天路过那家店了，\n想起你说想去', mine: true},
	{y: 214, text: '下周末有空吗？', mine: true},
	{chip: '22:10', chipY: 290, y: 300, text: '嗯', mine: false},
	{chip: '22:40', chipY: 376, y: 386, text: '在忙吗？', mine: true},
	{chip: '23:58', chipY: 462, y: 472, text: '没空也没关系哈哈', mine: true},
	{y: 530, text: '早点睡', mine: true},
];
export const DRAFT = '我是不是打扰到你了';

export const ChatScreen: React.FC<{draft?: string; caret?: boolean; dim?: number; hideMine?: boolean; clock?: string}> = ({draft = '', caret, dim = 0, hideMine, clock = '01:07'}) => (
	<Phone x={PH.x} y={PH.y} s={1} glow={1 - dim}>
		{CHAT.map((m, i) => (
			<g key={i}>
				{m.chip ? <TimeChip y={m.chipY!} t={m.chip} /> : null}
				{m.mine && hideMine ? null : <Bubble y={m.y} mine={m.mine} text={m.text} w={m.mine ? undefined : 52} />}
			</g>
		))}
		<ChatHead />
		<Clock t={clock} />
		<rect x={14} y={606} width={302} height={50} rx={25} fill="#1b1c33" stroke="#3a3d66" strokeWidth={1} />
		<text x={34} y={639} style={{fontFamily: font.sans, fontSize: 20, fill: draft ? '#e6e4f2' : '#5a5e8a'}}>
			{draft || '发消息'}
			{caret ? <tspan fill="#8f9cff">|</tspan> : null}
		</text>
		{draft ? (
			<g>
				<rect x={262} y={612} width={46} height={38} rx={19} fill="#8f9cff" />
				<path d="M276,631 L294,631 M288,624 L295,631 L288,638" stroke="#0c0d1c" strokeWidth={3} fill="none" strokeLinecap="round" />
			</g>
		) : null}
		<rect width={330} height={680} rx={44} fill="#000" opacity={dim} />
	</Phone>
);

// ---------------------------------------------------------------- 1. hook

const S = 1.15;
const HER = {x: 700, y: seatY(S)};
const PHONE_H = 48 * 0.9 * S;
const Z_HAND = 3.4;
const SC_HAND = (PHONE_H * Z_HAND) / 700;
const DIVE = 71; // lands inside the screen on the 2.38 s accent

const Hook: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;

	// ---- the dive: one log-zoom from the room into the screen
	const Z_FILL = (1.18 * Z_HAND) / SC_HAND; // the UI phone at 1.18× fills the frame's height
	const u = prog(f, 0, DIVE, Easing.bezier(0.5, 0, 0.25, 1));
	const Z = Math.exp(Math.log(1.18) + (Math.log(Z_FILL) - Math.log(1.18)) * u);
	const k = Math.min(1, Math.max(0, (Math.log(Z) - Math.log(Z_HAND * 0.8)) / (Math.log(Z_HAND * 1.6) - Math.log(Z_HAND * 0.8)))); // room → UI crossfade
	const pose: Pose = SHE_POSE.phone;
	const h = handAt(pose);
	const hand = {x: HER.x + h[0] * S + 8, y: HER.y + h[1] * S - 6};
	const toHand = Math.min(1, Math.max(0, Math.log(Z / 1.18) / Math.log(Z_HAND / 1.18)));
	const roomCam = lookAt(mix(820, hand.x, ease.inOut(toHand)), mix(610, hand.y, ease.inOut(toHand)), Math.min(Z, Z_HAND * 1.6));

	// ---- inside the phone: the UI camera (anchor in UI space, scale)
	const sc0 = (SC_HAND * Z) / Z_HAND;
	const ui = (() => {
		if (f < DIVE) return {ax: PH.x, ay: PH.y, sc: sc0, rot: -26 * (1 - ease.inOut(k))};
		// settle on the whole chat, drift onto 嗯 and the unanswered messages, then down to the input bar
		const keys: [number, number, number, number][] = [
			[DIVE, PH.x, PH.y, 1.18],
			[DIVE + 26, SCR.x + 110, SCR.y + 300, 2.5],
			[cue(0) + 96, SCR.x + 120, SCR.y + 330, 2.4],
			[cue(1) - 6, SCR.x + 170, SCR.y + 480, 2.0],
			[cue(1) + 14, PH.x, PH.y + 120, 1.75],
			[cue(2) - 4, PH.x + 20, PH.y + 150, 1.95],
			[cue(2) + 34, PH.x, PH.y - 10, 1.16],
			[end, PH.x, PH.y - 30, 1.1],
		];
		let i = 0;
		while (i < keys.length - 2 && f >= keys[i + 1][0]) i++;
		const a = keys[i];
		const b = keys[i + 1];
		const t = ease.inOut(Math.min(1, Math.max(0, (f - a[0]) / (b[0] - a[0]))));
		return {ax: mix(a[1], b[1], t), ay: mix(a[2], b[2], t), sc: Math.exp(mix(Math.log(a[3]), Math.log(b[3]), t)), rot: 0};
	})();

	// ---- typing, a hesitation, then deleting one character at a time
	const T0 = cue(1) + 16;
	const n = [...DRAFT].length;
	const typed = Math.min(n, Math.floor(Math.max(0, f - T0) / 4));
	const D0 = T0 + n * 4 + 34; // the hesitation: the cursor blinks after the last character
	const del = Math.floor(Math.max(0, f - D0) / 7);
	const shown = Math.max(0, typed - del);
	const draft = [...DRAFT].slice(0, shown).join('');
	const caret = f >= T0 && (shown === 0 ? f < D0 + n * 7 + 12 : true) && Math.floor(f / 14) % 2 === 0;

	// ---- her bubbles warm to gold; the screen dims; the gold lifts off into the motif
	const goldAt = (i: number) => prog(f, cue(2) + 10 + i * 8, 20, ease.inOut);
	const dim = 0.5 * prog(f, 377, 36, ease.inOut);
	const phoneO = 1 - prog(f, 438, 16, ease.inOut);
	const lift = prog(f, 440, end - 8 - 440, ease.inOut);
	// the gold group: from where the UI camera shows it to the motif under the title
	const gx = SCR.x + 190;
	const gy = SCR.y + 330;
	const scrX = 960 + ui.sc * (gx - ui.ax);
	const scrY = 540 + ui.sc * (gy - ui.ay);
	const uiT = `translate(960,540) rotate(${ui.rot}) scale(${ui.sc}) translate(${-ui.ax},${-ui.ay})`;

	return (
		<Frame>
			{/* the room: sharp while we dive, then a blurred, darkened background behind the phone */}
			{f < DIVE ? (
				<g opacity={1}>
					<Apartment frame={f} cam={roomCam} lamp={1} phone={{x: hand.x, y: hand.y, o: 0.8}} bed={<SheOnBed f={f} x={HER.x} y={HER.y} s={S} keys={[[0, SHE_POSE.phone]]} />} />
				</g>
			) : (
				<g filter="url(#dof)" opacity={phoneO}>
					<Apartment frame={f} cam={lookAt(hand.x, hand.y, Z_HAND * 1.6)} lamp={1} phone={{x: hand.x, y: hand.y, o: 0.8}} bed={<SheOnBed f={f} x={HER.x} y={HER.y} s={S} keys={[[0, SHE_POSE.phone]]} />} />
					<rect width={W} height={H} fill="#05050b" opacity={0.55 + 0.3 * (dim / 0.5)} />
				</g>
			)}
			{/* the phone UI */}
			{k > 0 || f >= DIVE ? (
				<g opacity={(f < DIVE ? k : 1) * phoneO} transform={uiT}>
					<ChatScreen draft={draft} caret={caret} dim={dim} />
				</g>
			) : null}
			{/* her bubbles, warming to gold, then flying to the motif */}
			{f >= cue(2) ? (
				<g
					transform={`translate(${mix(scrX, 960, lift)},${mix(scrY, 690, lift)}) scale(${mix(ui.sc, 0.55, lift)}) translate(${-gx},${-gy})`}
					opacity={1 - prog(f, end - 8, 6)}
				>
					<g transform={`translate(${SCR.x},${SCR.y})`}>
						{CHAT.map((m, i) => (m.mine && goldAt(i) > 0 ? <Bubble key={i} y={m.y} mine text={m.text} gold={1} o={goldAt(i)} /> : null))}
					</g>
				</g>
			) : null}
			<ChatStack x={960} y={690} s={1.3} o={prog(f, end - 10, 8)} />
		</Frame>
	);
};

export const story1 = {Hook};
