import React from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {POSES, handAt, keyPoses, lerpPose, walkPose, type Pose} from '../../src/art/Figure';
import {Layer, lookAt} from '../../src/art/sets/Airfield';
import {Balance} from '../../src/art/sets/Stanford1959';
import {Apartment, BED} from '../../src/art/sets/Apartment';
import {EndCard} from '../../src/brand/Brand';
import {ease, mix, prog, useCue, useScene} from '../../src/lib/context';
import {font} from '../../src/lib/theme';
import type {SceneProps} from '../../src/lib/types';
import {camPath as spline, type Key} from '../benford/art';
import {Glow} from '../xuming/kit3';
import {Person, SHE_POSE, SheOnBed} from './acting';
import {Bubble, ChatHead, Clock, HUE, Phone, TimeChip} from './kit';
import {EPISODE} from './stage';
import {CHAT, Frame, H, PH, W} from './story1';
import {BAL, Capsule, HER, Pile} from './story3';

const landed = (f: number, at: number, out?: number, len = 12) => prog(f, at, len) * (out === undefined ? 1 : 1 - prog(f, out, len));
const S = 1.15;
const PHONE_ON_BED = {x: BED.x0 + 600, y: BED.top + 4};

// ---------------------------------------------------------------- 8. takeaways

const Takeaways: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const T2 = cue(1) - 8;
	const T3 = cue(2) - 8;
	const T4 = cue(3) - 8;
	const arrive = 1 - prog(f, 0, 16, ease.out);
	// T1: she lowers the phone and puts it face down beside her
	const pose = keyPoses(f, [
		[0, SHE_POSE.phone],
		[cue(0) + 30, SHE_POSE.phone],
		[cue(0) + 54, SHE_POSE.lap],
		[cue(0) + 80, SHE_POSE.lap],
		[cue(0) + 100, SHE_POSE.place],
		[cue(0) + 104, {...SHE_POSE.place, lean: 20}],
		[cue(0) + 112, SHE_POSE.place],
		[cue(0) + 132, SHE_POSE.sigh],
	]);
	const placed = f >= cue(0) + 108;
	const c1 = spline(
		[
			[0, 860, 560, 2.6],
			[30, 820, 600, 1.35],
			[T2, 760, 620, 1.5],
		],
		f,
	);
	// T2 ①: the chat rewinds to the first day, newest first
	const gone = (i: number) => prog(f, cue(1) + 8 + (CHAT.length - 1 - i) * 7, 9, ease.in);
	const fresh = landed(f, cue(1) + 8 + CHAT.length * 7 + 4);
	const ui = {sc: mix(1.15, 1.32, prog(f, T2, T3 - T2, ease.inOut))};
	// T3 ②: the balance again: the gold drains back from TA's side; what you paid and what TA gave, apart
	const drain = prog(f, cue(2) + 10, 40, ease.inOut);
	const tilt = mix(0, 18, drain);
	const c3 = spline(
		[
			[T3, BAL.x, BAL.y - 250, 1.4],
			[T4, BAL.x, BAL.y - 240, 1.28],
		],
		f,
	);
	// T4 ③: the gold comes back to her: it gathers in her cupped hands; the room warms
	const gather = prog(f, T4 + 6, 70, ease.inOut);
	const warm = prog(f, T4 + 30, 80, ease.inOut);
	const hand = handAt(SHE_POSE.cup);
	const hx = HER.x + hand[0] * S;
	const hy = HER.y + hand[1] * S;
	const c4 = spline(
		[
			[T4, hx, hy, 2.4],
			[end, 860, 600, 1.25],
		],
		f,
	);
	return (
		<Frame flash={f < T2 ? 0.7 * arrive * arrive : 0} flashColor={HUE.phone}>
			{f < T2 ? (
				<Apartment
					frame={f}
					cam={c1}
					lamp={1}
					phone={placed ? undefined : {x: HER.x + 130, y: HER.y - 280, o: 0.7}}
					bed={
						<g>
							<SheOnBed f={f} x={HER.x} y={HER.y} s={S} keys={[[0, pose]]} phone={placed ? 'none' : 'up'} expression={f > cue(0) + 120 ? 'thinking' : 'neutral'} />
							{placed ? (
								<g transform={`translate(${PHONE_ON_BED.x},${PHONE_ON_BED.y}) rotate(4)`}>
									<rect x={-40} y={-10} width={80} height={20} rx={5} fill="#15161f" stroke="#3a3a4c" />
								</g>
							) : null}
						</g>
					}
				/>
			) : null}
			{f >= T2 && f < T3 ? (
				<g>
					<g filter="url(#dof)">
						<Apartment frame={f} cam={lookAt(HER.x + 130, HER.y - 290, 3.2)} lamp={1} bed={<SheOnBed f={f} x={HER.x} y={HER.y} s={S} keys={[[0, SHE_POSE.phone]]} />} />
					</g>
					<rect width={W} height={H} fill="#05050b" opacity={0.6} />
					<g transform={`translate(960,540) scale(${ui.sc}) translate(${-PH.x},${-PH.y})`}>
						<Phone x={PH.x} y={PH.y} s={1}>
							{CHAT.map((m, i) => {
								const g = gone(i);
								return g < 1 ? (
									<g key={i} opacity={1 - g} transform={`translate(0,${30 * g})`}>
										{m.chip ? <TimeChip y={m.chipY!} t={m.chip} /> : null}
										<Bubble y={m.y} mine={m.mine} text={m.text} w={m.mine ? undefined : 52} />
									</g>
								) : null;
							})}
							<ChatHead />
							<Clock t={fresh > 0.5 ? '21:02' : '01:07'} />
							<g opacity={fresh}>
								<TimeChip y={150} t="今天 · 你们刚认识" />
							</g>
							<rect x={14} y={606} width={302} height={50} rx={25} fill="#1b1c33" stroke="#3a3d66" strokeWidth={1} />
							<text x={34} y={639} style={{fontFamily: font.sans, fontSize: 20, fill: '#5a5e8a'}}>
								发消息
							</text>
						</Phone>
					</g>
				</g>
			) : null}
			{f >= T3 && f < T4 ? (
				<g>
					<g filter="url(#dof)">
						<Apartment frame={f} cam={c3} lamp={1} bed={<SheOnBed f={f} x={HER.x} y={HER.y} s={S} keys={[[0, SHE_POSE.sigh]]} phone="none" />} />
					</g>
					<rect width={W} height={H} fill="#06060c" opacity={0.35} />
					<Layer cam={c3} depth={1}>
						<rect x={BAL.x - 170} y={BAL.y} width={340} height={22} rx={6} fill="#5a4436" />
						<g transform={`translate(${BAL.x},${BAL.y}) scale(${BAL.s})`}>
							<BalanceWith tilt={tilt} drain={drain} />
						</g>
					</Layer>
					<g opacity={landed(f, cue(2) + 20)}>
						<text x={600} y={250} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 52, fill: HUE.gold}}>
							你付出的
						</text>
						<text x={1330} y={250} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 52, fill: '#b8b4cc'}}>
							TA 给的
						</text>
					</g>
				</g>
			) : null}
			{f >= T4 ? (
				<Apartment
					frame={f}
					cam={c4}
					lamp={mix(1, 0.6, warm)}
					bed={
						<g>
							<circle cx={hx} cy={hy} r={900} fill="url(#lantern-glow)" opacity={0.7 * warm} />
							<SheOnBed f={f} x={HER.x} y={HER.y} s={S} keys={[[0, SHE_POSE.cup]]} phone="none" hand="open" expression={warm > 0.5 ? 'smile' : 'thinking'} rim="warm" />
							<g transform={`translate(${PHONE_ON_BED.x},${PHONE_ON_BED.y}) rotate(4)`}>
								<rect x={-40} y={-10} width={80} height={20} rx={5} fill="#15161f" stroke="#3a3a4c" />
							</g>
							{Array.from({length: 18}, (_, i) => {
								const a0 = (i / 18) * Math.PI * 2;
								const r0 = 640 + 160 * Math.sin(i * 1.7);
								const k = Math.min(1, Math.max(0, gather * 1.3 - (i % 6) * 0.05));
								const x = mix(hx + r0 * Math.cos(a0), hx, k);
								const y = mix(hy + r0 * Math.sin(a0) * 0.6, hy, k);
								return <rect key={i} x={x - 12} y={y - 5} width={24} height={10} rx={5} fill={HUE.gold} opacity={0.85 * (1 - k ** 6)} filter="url(#g-sm)" />;
							})}
							<Glow x={hx} y={hy} r={30 + 80 * warm} o={warm} />
						</g>
					}
				/>
			) : null}
		</Frame>
	);
};

/** ② the balance: her gold ingot (heavy) and TA's capsule, which loses the gold it was lent */
const BalanceWith: React.FC<{tilt: number; drain: number}> = ({tilt, drain}) => {
	return (
		<Balance
			tilt={tilt}
			left={<Pile n={8} fuse={1} scale={mix(0.8, 1, drain)} />}
			right={
				<g transform="translate(0,-14)">
					<g transform={`scale(${mix(1.9, 1, drain)})`}>
						<Capsule w={mix(80, 44, drain)} grey={drain > 0.6} glow={1 - drain} />
					</g>
				</g>
			}
		/>
	);
};

// ---------------------------------------------------------------- 9. callback: dawn; the phone lights; she doesn't look; end card

const Callback: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const endAt = end - 180;
	const dawn = prog(f, 0, 150, ease.inOut);
	const buzz = cue(0) + 24;
	const lightUp = f >= buzz ? Math.exp(-(f - buzz) / 22) : 0;
	const vib = f >= buzz && f < buzz + 8 ? 2 * Math.sin(f * 3) : 0;
	// she stands and walks to the window
	const rise = prog(f, cue(1) - 4, 22, ease.inOut);
	const walk = prog(f, cue(1) + 18, cue(2) + 10 - cue(1) - 18, ease.inOut);
	const atWindow = f > cue(2) + 10;
	const x = mix(HER.x, 1420, walk);
	const y = mix(HER.y, 1000, rise);
	const s = mix(S, 1.2, rise);
	const seated: Pose = {...SHE_POSE.sigh, head: 8};
	const pose = walk > 0 && walk < 1 ? walkPose(f * 0.22, 1) : rise < 1 ? lerpPose(seated, POSES.stand, rise) : POSES.stand;
	const keys: Key[] = [
		[0, 860, 620, 1.3],
		[cue(0) + 20, PHONE_ON_BED.x, PHONE_ON_BED.y - 40, 2.0],
		[cue(1) - 10, PHONE_ON_BED.x - 60, PHONE_ON_BED.y - 80, 1.8],
		[cue(1) + 24, 980, 600, 1.12],
		[cue(2) + 10, 1380, 560, 1.3],
		[endAt, 1420, 520, 1.42],
		[end, 1430, 510, 1.5],
	];
	const cam = spline(keys, f);
	return (
		<Frame
			over={
				<Sequence from={endAt}>
					<EndCard v={EPISODE} cfg={{videos: []}} dur={end - endAt} />
				</Sequence>
			}
		>
			<Apartment
				frame={f}
				cam={cam}
				dawn={dawn}
				lamp={mix(0.6, 0.15, dawn)}
				bed={
					<g>
						<g transform={`translate(${PHONE_ON_BED.x + vib},${PHONE_ON_BED.y}) rotate(4)`}>
							<ellipse cx={0} cy={8} rx={120} ry={22} fill="#c8d2ff" opacity={0.7 * lightUp} filter="url(#b8)" />
							<rect x={-40} y={-10} width={80} height={20} rx={5} fill="#15161f" stroke="#3a3a4c" />
						</g>
						{rise < 1 ? <SheOnBed f={f} x={x} y={y} s={s} keys={[[0, pose]]} phone="none" rim="warm" expression="thinking" /> : null}
					</g>
				}
				children={rise >= 1 ? <Person who="she" f={f} x={x} y={y} s={s} pose={pose} back={atWindow} rim="warm" still={walk > 0 && walk < 1 ? 0 : 1} /> : null}
			/>
		</Frame>
	);
};

export const story4 = {Takeaways, Callback};
