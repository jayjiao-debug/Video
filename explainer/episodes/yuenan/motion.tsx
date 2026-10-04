import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {handAt, type Pose} from '../../src/art/Figure';
import {Materials} from '../../src/art/materials';
import {OX_DEFS} from '../../src/art/Ox';
import {lookAt} from '../../src/art/sets/Airfield';
import {Apartment, seatY} from '../../src/art/sets/Apartment';
import {ease, prog} from '../../src/lib/context';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {Grade, Sub} from '../xuming/look3';
import {MSGS, OFF, REPLY_Y} from './act1';
import {SHE_POSE, SheOnBed} from './acting';
import {Bubble, ChatHead, Clock, Phone, TimeChip} from './kit';

/**
 * 《越难越爱》 motion test in the illustrated look (8 s on the real track).
 * One continuous camera: the frame is filled by TA's grey 嗯, which lands on the
 * 0.34 s accent; the camera pulls back in log-zoom (velocity-continuous) out of the
 * screen, through the phone in her hands, into her room at 1 a.m. She types a few
 * characters, deletes them, lowers the phone to her lap and looks up with a sigh.
 */

const FPS = 30;
const THUD = 10; // 0.34 s
const S = 1.15;
const HER = {x: 700, y: seatY(S)};
const UM = {x: 960 - 165 + 44, y: 480 - 340 + REPLY_Y + OFF + 25}; // 嗯's centre in phone-UI space
const PH = {x: 960, y: 480}; // the phone's centre in UI space
const PHONE_H = 48 * 0.9 * S; // the held phone's height in world units
const Z_HAND = 3.2;
const SC_HAND = (PHONE_H * Z_HAND) / 700; // UI scale when the UI phone matches the held phone at Z_HAND

const KEYS: [number, Pose][] = [
	[0, SHE_POSE.type],
	[150, SHE_POSE.type],
	[156, {...SHE_POSE.type, armNear: [20, 104], armFar: [15, 106]}],
	[172, SHE_POSE.lap],
	[177, {...SHE_POSE.lap, lean: 18, head: 34}],
	[184, SHE_POSE.lap],
	[196, SHE_POSE.lap],
	[214, SHE_POSE.sigh],
	[219, {...SHE_POSE.sigh, head: -15}],
	[226, SHE_POSE.sigh],
];

export const YUENAN_MOTION_N = 240;

export const YuenanMotion: React.FC = () => {
	loadEpisodeFonts('yuenan');
	const f = useCurrentFrame();
	// one zoom path in log space: from deep inside the screen (Z0) to the room's medium shot
	const Z0 = (Z_HAND * 10) / SC_HAND;
	const Z1 = 1.28;
	const pre = 1 - 0.08 * prog(f, 0, THUD, ease.out); // a small push back before the hit
	const u = prog(f, THUD + 1, 66, Easing.bezier(0.45, 0, 0.2, 1));
	const Z = Math.exp(Math.log(Z0 * pre) + (Math.log(Z1) - Math.log(Z0 * pre)) * u);
	const k = Math.min(1, Math.max(0, (Math.log(Z0) - Math.log(Z)) / (Math.log(Z0) - Math.log(Z_HAND)))); // 0 → 1 until the hand
	const after = Math.min(1, Math.max(0, (Math.log(Z_HAND) - Math.log(Z)) / (Math.log(Z_HAND) - Math.log(Z1)))); // hand → room

	const pose = KEYS.length ? KEYS : [];
	const now = f;
	const p = (() => {
		// mirror SheOnBed's key interpolation for the hand position (without idle)
		let cur = pose[0][1];
		for (let i = 0; i < pose.length - 1; i++) if (now >= pose[i][0]) cur = pose[i][1];
		return cur;
	})();
	const h = handAt(p);
	const hand = {x: HER.x + h[0] * S + 10, y: HER.y + h[1] * S - 4};
	const tx = hand.x + (900 - hand.x) * ease.inOut(after);
	const ty = hand.y + (600 - hand.y) * ease.inOut(after);
	const cam = lookAt(tx, ty, Math.min(Z, Z_HAND * 1.6));

	// the UI phone: anchored on 嗯, sliding to its own centre as it shrinks into her hands
	const sc = (SC_HAND * Z) / Z_HAND;
	const ax = UM.x + (PH.x - UM.x) * ease.inOut(k);
	const ay = UM.y + (PH.y - UM.y) * ease.inOut(k);
	const rot = -26 * ease.inOut(Math.max(0, (k - 0.6) / 0.4));
	const uiO = 1 - prog(f, 0, 1) * Math.min(1, Math.max(0, (k - 0.9) / 0.1));
	const roomO = Math.min(1, Math.max(0, (k - 0.8) / 0.15));
	const thud = f >= THUD ? Math.exp(-(f - THUD) / 3) : 0;
	const sh = f >= THUD && f < THUD + 10 ? 12 * Math.exp(-(f - THUD) / 2.6) : 0;
	const shx = sh * Math.sin((f - THUD) * 2.9);
	const shy = sh * Math.cos((f - THUD) * 3.7);

	const lit = 1 - 0.6 * prog(f, 168, 20);

	return (
		<AbsoluteFill style={{background: '#05050b'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{fontVariantNumeric: 'lining-nums'}}>
				<Materials />
				<OX_DEFS />
				<defs>
					<filter id="b8" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="8" />
					</filter>
					<radialGradient id="vig3" cx="50%" cy="48%" r="72%">
						<stop offset="0.5" stopColor="#000" stopOpacity="0" />
						<stop offset="1" stopColor="#000" stopOpacity="0.85" />
					</radialGradient>
				</defs>
				<g transform={`translate(${shx},${shy})`}>
					{roomO > 0 ? (
						<g opacity={roomO}>
							<Apartment
								frame={f}
								cam={cam}
								lamp={1}
								phone={{x: hand.x, y: hand.y, o: 0.75 * lit}}
								bed={<SheOnBed f={f} x={HER.x} y={HER.y} s={S} keys={KEYS} lit={lit} expression={f > 200 ? 'thinking' : 'neutral'} />}
							/>
						</g>
					) : null}
					{uiO > 0.01 ? (
						<g opacity={uiO} transform={`translate(960,540) rotate(${rot}) scale(${sc}) translate(${-ax},${-ay})`}>
							<Phone x={PH.x} y={PH.y} s={1}>
								<g transform={`translate(0,${OFF})`}>
									{MSGS.map((m, i) => (
										<g key={i}>
											{m.chip ? <TimeChip y={m.chipY!} t={m.chip} /> : null}
											<Bubble y={m.y} mine text={m.text} />
										</g>
									))}
									<TimeChip y={REPLY_Y - 10} t="01:07" />
									<g transform={`translate(44,${REPLY_Y + 25}) scale(${1 + 0.25 * thud}) translate(-44,${-(REPLY_Y + 25)})`}>
										<Bubble y={REPLY_Y} text="嗯" w={52} />
									</g>
								</g>
								<ChatHead />
								<Clock t="01:07" />
								<rect x={14} y={606} width={302} height={50} rx={25} fill="#1b1c33" stroke="#3a3d66" strokeWidth={1} />
							</Phone>
						</g>
					) : null}
				</g>
				{f >= 32 && f < 176 ? <Sub text="你等了四个小时，TA只回了一个“嗯”。" /> : null}
				{f >= 178 ? <Sub text="你打了几个字，又一个一个删掉。" /> : null}
				<Grade />
			</svg>
		</AbsoluteFill>
	);
};
