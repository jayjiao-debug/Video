import React from 'react';
import {useCurrentFrame} from 'remotion';
import {POSES, keyPoses, walkPose, type Pose} from '../../src/art/Figure';
import {GoldTitle} from '../../src/brand/Brand';
import {LAB_DESK_Y, Lab1959, Quad1959} from '../../src/art/sets/Stanford1959';
import {ease, mix, prog, useCue, useScene} from '../../src/lib/context';
import {font} from '../../src/lib/theme';
import type {SceneProps} from '../../src/lib/types';
import {camPath as spline, type Key} from '../benford/art';
import {Tag} from '../xuming/look3';
import {COED_POSE, Chalk, Clipboard, EXP_POSE, HandCard, Person} from './acting';
import {ChatStack, Dust, HUE, Pool} from './kit';
import {EPISODE} from './stage';
import {Frame, H, W} from './story1';

/**
 * 《越难越爱》 v3, act one in 1959: the title card → the Main Quad at night → the lab.
 * The chalkboard carries the numbers (our guess in dashed chalk, the real ratings in
 * gold chalk), so nothing floats on a black void.
 */

const landed = (f: number, at: number, out?: number, len = 12) => prog(f, at, len) * (out === undefined ? 1 : 1 - prog(f, out, len));

/** chalk written on the board: board space 640×340 */
export const ChalkText: React.FC<{x: number; y: number; text: string; k?: number; size?: number; gold?: boolean; anchor?: 'start' | 'middle'}> = ({x, y, text, k = 1, size = 30, gold, anchor = 'middle'}) => {
	const chars = [...text];
	const n = Math.round(chars.length * Math.min(1, Math.max(0, k)));
	return (
		<text x={x} y={y} textAnchor={anchor} style={{fontFamily: font.serif, fontWeight: 600, fontSize: size, fill: gold ? '#f1c56d' : '#e8e6dc', letterSpacing: '0.04em'}} opacity={0.9}>
			{chars.slice(0, n).join('')}
		</text>
	);
};

/** a chalk bar drawn bottom-up; board space; `h` final height */
export const ChalkBar: React.FC<{x: number; h: number; k: number; gold?: boolean; red?: boolean; dashed?: boolean; label?: string; value?: string; vk?: number; erase?: number}> = ({x, h, k, gold, red, dashed, label, value, vk = 0, erase = 0}) => {
	const c = gold ? '#f1c56d' : red ? '#ff8a7a' : '#e8e6dc';
	const hh = h * Math.min(1, Math.max(0, k));
	return (
		<g opacity={1 - erase}>
			{hh > 0.5 ? (
				<g>
					<rect x={x - 40} y={290 - hh} width={80} height={hh} fill={c} opacity={gold ? 0.32 : 0.12} />
					<rect x={x - 40} y={290 - hh} width={80} height={hh} fill="none" stroke={c} strokeWidth={3.2} strokeDasharray={dashed ? '10 8' : undefined} opacity={0.9} />
				</g>
			) : null}
			{label ? (
				<text x={x} y={318} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 20, fill: '#e8e6dc'}} opacity={0.85}>
					{label}
				</text>
			) : null}
			{value && vk > 0 ? (
				<text x={x} y={280 - hh} textAnchor="middle" opacity={vk} style={{fontFamily: font.latin, fontWeight: 600, fontSize: gold ? 46 : 32, fill: c, fontVariantNumeric: 'lining-nums'}}>
					{value}
				</text>
			) : null}
		</g>
	);
};

const RATE = (v: number) => (v - 60) * 4.6; // board px per rating point (axis from 60)

// ---------------------------------------------------------------- 2. cold open

const NOTICE = {x: 960, y: 780};

const ColdOpen: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const OUT = 128;
	// --- title card (the motif comes from the hook), leaves by diving into its gold glow
	const meta = (d: number) => prog(f, d, 14);
	const into = prog(f, OUT - 10, 24, ease.in);
	// --- the quad: arrive out of a lamp, pull back, dolly along the arcade to the notice and the door
	const keys: Key[] = [
		[OUT, 1120, 470, 3.4],
		[OUT + 40, 1060, 560, 1.25],
		[cue(1) - 10, NOTICE.x, NOTICE.y - 60, 1.9],
		[cue(1) + 50, NOTICE.x + 30, NOTICE.y - 50, 1.95],
		[cue(2) + 10, 1250, 700, 1.45],
		[end - 14, 1300, 690, 1.9],
		[end, 1300, 680, 3.6],
	];
	const cam = spline(keys, f);
	const arrive = 1 - prog(f, OUT, 22, ease.out);
	const out = prog(f, end - 14, 14, ease.in);
	// the student walks along the arcade and stops by the door; Aronson waits with a clipboard
	const walkT = prog(f, OUT + 20, cue(2) - OUT - 30, (x) => x);
	const coedX = mix(560, 1180, walkT);
	const walking = walkT > 0 && walkT < 1;
	const door = mix(0.35, 0.95, prog(f, cue(2) + 20, 30, ease.inOut));
	const arPose: Pose = keyPoses(f - cue(2), [
		[0, {...POSES.hold, armFar: [6, 20]}],
		[10, {...POSES.hold, lean: -3, armFar: [6, 20]}],
		[24, {...POSES.present, armFar: [8, 30]}],
		[30, {...POSES.present, armNear: [56, 44], armFar: [8, 30]}],
		[36, {...POSES.present, armFar: [8, 30]}],
	]);
	return (
		<Frame flash={f >= OUT ? 0.85 * arrive * arrive + 0.9 * out * out : 0.9 * into * into} flashColor={HUE.lamp}>
			{f >= OUT ? (
				<Quad1959
					frame={f}
					cam={cam}
					door={door}
					children={
						<>
							<Person who="aronson59" f={f} x={1400} y={935} s={1.0} pose={arPose} hand={f - cue(2) > 20 ? 'open' : 'grip'} hold={f - cue(2) > 20 ? undefined : <Clipboard />} flip rim="warm" still={f - cue(2) > 0 && f - cue(2) < 40 ? 0 : 1} />
							{/* the recruiting sign by the lab door */}
							<g transform={`translate(${NOTICE.x},940)`}>
								<path d="M-90,0 L-60,-230 M90,0 L60,-230" stroke="#3a2a1e" strokeWidth={8} />
								<rect x={-110} y={-260} width={220} height={170} fill="#efe6d2" />
								<rect x={-110} y={-260} width={220} height={170} fill="url(#paper)" opacity={0.4} />
								<text x={0} y={-222} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 22, fill: '#2a2018', letterSpacing: '0.06em'}}>
									DISCUSSION GROUP
								</text>
								<text x={0} y={-192} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 18, fill: '#4a3a2a'}}>
									the psychology of sex
								</text>
								<text x={0} y={-160} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 24, fill: '#7a1f1f'}}>
									招募女生 · 讨论小组
								</text>
								<text x={0} y={-118} textAnchor="middle" style={{fontFamily: font.latinItalic, fontSize: 18, fill: '#4a3a2a'}}>
									volunteers wanted · Rm 6
								</text>
							</g>
							<Person who="coed59" f={f} x={coedX} y={945} s={0.98} pose={walking ? walkPose(f * 0.21, 1) : POSES.stand} rim="warm" still={walking ? 0 : 1} />
						</>
					}
					front={null}
				/>
			) : null}
			{f < OUT + 14 ? (
				<g opacity={1 - prog(f, OUT + 2, 10)}>
					<g transform={`translate(960,690) scale(${1 + 3 * into * into}) translate(-960,-690)`}>
						<rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#05050b" />
						<Pool x={960} y={540} r={760} c={HUE.gold} o={0.5} id="tc" />
						<Dust seed="tc" f={f} n={50} c="#ffd98f" o={0.7} />
						<g opacity={meta(8)}>
							<text x={960} y={330} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 26, letterSpacing: '0.42em', fill: '#e0b46e'}}>
								{EPISODE.kicker}
							</text>
						</g>
						<GoldTitle text={EPISODE.title} f={f} at={0} size={150} y={530} />
						<ChatStack x={960} y={690} s={1.3} />
						<g opacity={meta(20) * (1 - into)}>
							<text x={960} y={840} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 38, fill: '#f6e7c8'}}>
								{EPISODE.tagline}
							</text>
							<text x={960} y={886} textAnchor="middle" style={{fontFamily: font.latinItalic, fontSize: 30, fill: '#cdbb98'}}>
								{EPISODE.taglineEn}
							</text>
							<text x={960} y={950} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 20, letterSpacing: '0.3em', fill: '#bfa77a'}}>
								— Juno 出品 · VIBE知识大赏 —
							</text>
						</g>
					</g>
				</g>
			) : null}
			<g opacity={landed(f, OUT + 24, cue(1) - 20)}>
				<Tag en="1959 · Stanford University" zh="1959 · 斯坦福大学" />
			</g>
		</Frame>
	);
};

// ---------------------------------------------------------------- 3. setup: the test, three groups, headphones, a dull tape, our guess

const COED = {x: 600, s: 1.1};
const COED_Y = LAB_DESK_Y - 50 + 216 * COED.s;
const EXP = {x: 1340, s: 1.05};
const EXP_Y = LAB_DESK_Y - 50 + 216 * EXP.s;
// the board (wall layer, depth 0.6) centre is at about (480, 310); this hero-plane target frames it
const BOARD_T = {x: 960 + (480 - 960) / 0.6, y: 540 + (310 - 540) / 0.6};

const Setup: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const S2 = cue(1) - 8;
	const S3 = cue(2) - 6;
	const S4 = cue(3) - 6;
	const S5 = cue(4) - 10;
	const keys: Key[] = [
		[0, 970, LAB_DESK_Y - 110, 3.2],
		[30, 900, 560, 1.2],
		[S2 - 14, 700, 520, 1.55],
		[S2 + 10, BOARD_T.x, BOARD_T.y + 40, 2.3],
		[S3 - 8, BOARD_T.x + 20, BOARD_T.y + 30, 2.4],
		[S3 + 16, 840, 540, 1.3],
		[S4 - 12, 980, 540, 1.25],
		[S4 + 14, 1560, LAB_DESK_Y - 60, 1.9],
		[S5 - 10, 1560, LAB_DESK_Y - 70, 2.05],
		[S5 + 18, BOARD_T.x, BOARD_T.y + 30, 2.4],
		[end, BOARD_T.x + 10, BOARD_T.y + 20, 2.5],
	];
	const cam = spline(keys, f);
	const arrive = 1 - prog(f, 0, 18, ease.out);
	// the student reads, then shrinks into her chair; a flush rises
	const coedPose = keyPoses(f, [
		[0, COED_POSE.read],
		[cue(0) + 50, COED_POSE.read],
		[cue(0) + 62, {...COED_POSE.flush, head: 38}],
		[cue(0) + 68, COED_POSE.flush],
		[S3, COED_POSE.flush],
		[S3 + 14, COED_POSE.listen],
	]);
	const flush = prog(f, cue(0) + 40, 40) * (1 - prog(f, S3, 20));
	const phones = f >= S3 + 4;
	const hp = prog(f, S3 + 4, 14, ease.out);
	const talk = prog(f, S3 + 20, 10);
	const reels = f >= S3 + 20 ? 1 : 0;
	// the experimenter writes the three groups at the board, later our dashed guess
	const atBoard = f >= S2 - 20 && f < S3 + 4 ? 1 : f >= S5 - 10 ? 1 : 0;
	const write = (at: number, k = 1) => Math.min(1, Math.max(0, (f - at) / (10 * k)));
	const guess = (i: number) => prog(f, cue(4) + 6 + i * 12, 16, ease.out);
	const chalkArm: Pose = {...EXP_POSE.write, armNear: [118 + 14 * Math.sin(f / 3), 36 + 8 * Math.cos(f / 4)]};
	const headX = COED.x + 6 * COED.s;
	const headY = COED_Y - 374 * COED.s;
	return (
		<Frame flash={0.8 * arrive * arrive} flashColor={HUE.lamp}>
			<Lab1959
				frame={f}
				cam={cam}
				reels={reels}
				intercom={talk}
				boardTitle={f < S5}
				board={
					<g>
						{/* the three groups, chalked in on the beats */}
						{f >= S2 ? (
							<g opacity={1 - prog(f, S5 - 16, 12)}>
								<ChalkText x={130} y={150} text="难堪" k={write(S2 + 2, 0.6)} size={34} />
								<ChalkText x={320} y={150} text="温和" k={write(S2 + 16, 0.6)} size={34} />
								<ChalkText x={510} y={150} text="免考" k={write(S2 + 30, 0.6)} size={34} />
								{[130, 320, 510].map((x, i) => (
									<ChalkText key={i} x={x} y={200} text="21人" k={write(S2 + 40 + i * 6, 0.5)} size={24} />
								))}
							</g>
						) : null}
						{/* our guess: dashed chalk, the 难堪 bar lowest */}
						{f >= S5 ? (
							<g>
								<ChalkText x={320} y={52} text="我们的猜测（示意）" k={write(S5 + 4, 1.2)} size={22} />
								<line x1={70} y1={290} x2={590} y2={290} stroke="#e8e6dc" strokeWidth={3} opacity={0.75 * write(S5 + 6)} />
								<ChalkBar x={130} h={150} k={guess(2)} dashed red label="难堪" />
								<ChalkBar x={320} h={60} k={guess(1)} dashed label="温和" />
								<ChalkBar x={510} h={30} k={guess(0)} dashed label="免考" />
							</g>
						) : null}
					</g>
				}
				wall={
					atBoard ? (
						<Person who="experimenter59" f={f} x={f >= S5 ? 760 : 740} y={760} s={0.95} pose={f - (f >= S5 ? S5 : S2) < 40 ? chalkArm : EXP_POSE.look} hand="pinch" hold={<Chalk />} flip rim="warm" still={0.4} />
					) : null
				}
				behind={
					<>
						<Person who="coed59" f={f} x={COED.x} y={COED_Y} s={COED.s} pose={coedPose} hand="pinch" hold={f < S3 ? <HandCard /> : undefined} expression={f > cue(0) + 50 && f < S3 ? 'worried' : f >= S4 ? 'neutral' : 'thinking'} still={0.5} />
						{phones ? (
							<g transform={`translate(${headX},${mix(headY - 120, headY - 6, hp)}) scale(${0.62 * COED.s})`}>
								<g transform="translate(0,0)">
									<path d="M-62,6 C-62,-74 62,-74 62,6" fill="none" stroke="#2a2420" strokeWidth={9} strokeLinecap="round" />
									<rect x={-80} y={-6} width={32} height={50} rx={12} fill="#3a2e26" />
									<rect x={48} y={-6} width={32} height={50} rx={12} fill="#3a2e26" />
								</g>
							</g>
						) : null}
						{atBoard ? null : <Person who="experimenter59" f={f} x={EXP.x} y={EXP_Y} s={EXP.s} pose={EXP_POSE.sit} hand="grip" hold={<Clipboard />} flip still={0.6} />}
						<ellipse cx={headX + 30} cy={headY + 20} rx={60} ry={40} fill="#ff6a5a" opacity={0.3 * flush} filter="url(#b8)" />
					</>
				}
			/>
			{/* the tape: a flat, droning waveform over the recorder close-up */}
			{f >= S4 && f < S5 + 10 ? (
				<g opacity={landed(f, S4 + 10, S5 - 4)}>
					<text x={960} y={800} textAnchor="middle" style={{fontFamily: font.latinItalic, fontSize: 30, fill: '#e9d9b8'}}>
						“one of the most worthless and uninteresting discussions imaginable”
					</text>
					<text x={960} y={838} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 17, letterSpacing: '0.2em', fill: '#bfa77a'}}>
						ARONSON & MILLS, 1959
					</text>
				</g>
			) : null}
		</Frame>
	);
};

// ---------------------------------------------------------------- 4. twist (the break): 不。 the eraser, then the real ratings in chalk

const Twist: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const keys: Key[] = [
		[0, BOARD_T.x + 10, BOARD_T.y + 20, 2.5],
		[cue(1), BOARD_T.x, BOARD_T.y + 20, 2.52],
		[cue(2) + 40, BOARD_T.x - 60, BOARD_T.y, 2.75],
		[cue(3) + 30, BOARD_T.x, BOARD_T.y + 20, 2.52],
		[end - 20, BOARD_T.x - 20, BOARD_T.y + 10, 2.6],
		[end, BOARD_T.x - 180, BOARD_T.y - 50, 8],
	];
	const cam = spline(keys, f);
	// the eraser wipes our guess from left to right on 不。
	const wipe = prog(f, cue(0) + 4, 40, ease.inOut);
	const ex = mix(40, 620, wipe);
	const gold = prog(f, cue(2) - 2, 30, ease.out);
	const rest = (i: number) => prog(f, cue(3) - 2 + i * 10, 22, ease.out);
	const out = prog(f, end - 20, 20, ease.in);
	return (
		<Frame flash={0.85 * out * out} flashColor={HUE.gold}>
			<Lab1959
				frame={f}
				cam={cam}
				lamp={0.8}
				boardTitle={false}
				board={
					<g>
						<g>
							<line x1={70} y1={290} x2={590} y2={290} stroke="#e8e6dc" strokeWidth={3} opacity={0.75} />
							<ChalkBar x={130} h={150} k={1} dashed red label="难堪" erase={wipe > 0.15 ? 1 : 0} />
							<ChalkBar x={320} h={60} k={1} dashed label="温和" erase={wipe > 0.5 ? 1 : 0} />
							<ChalkBar x={510} h={30} k={1} dashed label="免考" erase={wipe > 0.85 ? 1 : 0} />
						</g>
						{wipe > 0 && wipe < 1 ? (
							<g transform={`translate(${ex},200)`}>
								<rect x={-40} y={-20} width={80} height={40} rx={6} fill="#5a3e28" />
								<rect x={-40} y={10} width={80} height={10} fill="#d8d0c0" />
							</g>
						) : null}
						{/* chalk smear where it passed */}
						<rect x={40} y={110} width={Math.max(0, ex - 40)} height={200} fill="#e8e6dc" opacity={0.05} />
						{f >= cue(1) - 6 ? (
							<g>
								<ChalkText x={320} y={52} text="对同一段录音的评分（总分）" k={prog(f, cue(1) - 6, 20)} size={22} />
								<line x1={70} y1={290} x2={590} y2={290} stroke="#e8e6dc" strokeWidth={3} opacity={0.75 * prog(f, cue(1), 10)} />
								<ChalkText x={56} y={296} text="60" size={16} k={prog(f, cue(1), 8)} />
								<ChalkBar x={130} h={RATE(97.6)} k={gold} gold label="难堪" value="97.6" vk={landed(f, cue(2) + 24)} />
								<ChalkBar x={320} h={RATE(81.8)} k={rest(1)} label="温和" value="81.8" vk={landed(f, cue(3) + 22)} />
								<ChalkBar x={510} h={RATE(80.2)} k={rest(0)} label="免考" value="80.2" vk={landed(f, cue(3) + 12)} />
							</g>
						) : null}
					</g>
				}
				behind={
					<>
						<Person who="coed59" f={f} x={COED.x} y={COED_Y} s={COED.s} pose={COED_POSE.rate} expression={f > cue(2) ? 'smile' : 'thinking'} />
						<Person who="experimenter59" f={f} x={EXP.x} y={EXP_Y} s={EXP.s} pose={EXP_POSE.sit} hand="grip" hold={<Clipboard />} flip expression={f > cue(2) ? 'surprise' : 'neutral'} />
					</>
				}
			/>
			<g opacity={landed(f, cue(2) + 30)}>
				<text x={1820} y={1000} textAnchor="end" style={{fontFamily: font.sans, fontSize: 16, fill: '#bfa77a', letterSpacing: '0.1em'}}>
					Aronson & Mills, 1959 · 评分总和
				</text>
			</g>
		</Frame>
	);
};

export const story2 = {ColdOpen, Setup, Twist};
