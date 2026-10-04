import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {POSES, keyPoses, type Pose} from '../../src/art/Figure';
import {Impact} from '../../src/art/fx';
import {Layer, lookAt, type Cam} from '../../src/art/sets/Airfield';
import {Apartment, seatY} from '../../src/art/sets/Apartment';
import {AllenKey, Balance, FlatPack, LAB_DESK_Y, Lab1959, ShockBox} from '../../src/art/sets/Stanford1959';
import {ease, mix, prog, useCue, useScene} from '../../src/lib/context';
import {font} from '../../src/lib/theme';
import type {SceneProps} from '../../src/lib/types';
import {camPath as spline, type Key} from '../benford/art';
import {Tag} from '../xuming/look3';
import {Thin} from '../xuming/kit3';
import {COED_POSE, Person, SHE_POSE, SheOnBed} from './acting';
import {Dust, HUE} from './kit';
import {Frame, H, W} from './story1';
import {ChalkBar} from './story2';

const landed = (f: number, at: number, out?: number, len = 12) => prog(f, at, len) * (out === undefined ? 1 : 1 - prog(f, out, len));
const S = 1.15;
export const HER = {x: 700, y: seatY(S)};

/** the balance's place in her room: on a low stool in front of the bed (hero coordinates, origin at its base) */
export const BAL = {x: 1080, y: 1010, s: 1.25};
const panL = (tilt: number) => ({x: BAL.x + -230 * Math.cos((tilt * Math.PI) / 180) * BAL.s, y: BAL.y + (-300 + 230 * Math.sin((tilt * Math.PI) / 180) + 150) * BAL.s});
const panR = (tilt: number) => ({x: BAL.x + 230 * Math.cos((tilt * Math.PI) / 180) * BAL.s, y: BAL.y + (-300 - 230 * Math.sin((tilt * Math.PI) / 180) + 150) * BAL.s});

/** a gold message capsule (her effort); `grey` is TA's 嗯 */
export const Capsule: React.FC<{w?: number; grey?: boolean; glow?: number}> = ({w = 70, grey, glow = 0}) => (
	<g>
		{glow > 0 ? <rect x={-w / 2 - 10} y={-20} width={w + 20} height={40} rx={20} fill={HUE.gold} opacity={0.5 * glow} filter="url(#b8)" /> : null}
		<rect x={-w / 2} y={-11} width={w} height={22} rx={11} fill={grey ? '#9a96b4' : '#f1c56d'} />
		<rect x={-w / 2 + 4} y={-8} width={w - 8} height={5} rx={3} fill="#fff" opacity={grey ? 0.15 : 0.35} />
	</g>
);

/** her pile on the left pan: n capsules stacked, the last one dropping in; `fuse` melts them into one ingot */
export const Pile: React.FC<{n: number; drop?: number; fuse?: number; scale?: number}> = ({n, drop = 1, fuse = 0, scale = 1}) => (
	<g transform={`scale(${scale})`}>
		<g opacity={1 - fuse}>
			{Array.from({length: n}, (_, i) => {
				const last = i === n - 1;
				const y = -12 - i * 21 - (last ? (1 - drop) * 260 : 0);
				return (
					<g key={i} transform={`translate(${(random(`pl${i}`) - 0.5) * 18},${y}) rotate(${(random(`pr${i}`) - 0.5) * 8})`}>
						<Capsule w={70 + random(`pw${i}`) * 50} />
					</g>
				);
			})}
		</g>
		{fuse > 0 ? (
			<g opacity={fuse}>
				<path d={`M-70,0 L70,0 L52,${-n * 21} L-52,${-n * 21} Z`} fill="url(#brass)" />
				<path d={`M-70,0 L70,0 L52,${-n * 21} L-52,${-n * 21} Z`} fill="#f1c56d" opacity={0.55} />
				<rect x={-46} y={-n * 21 + 6} width={30} height={n * 21 - 16} fill="#fff" opacity={0.18} />
			</g>
		) : null}
	</g>
);

/** the room behind, out of focus; the balance and labels sharp in front, all on one camera */
const BalanceShot: React.FC<{
	f: number;
	cam: Cam;
	tilt: number;
	left: React.ReactNode;
	right: React.ReactNode;
	blur?: number;
	labels?: React.ReactNode;
	extra?: React.ReactNode;
	herKeys?: [number, Pose][];
	lamp?: number;
}> = ({f, cam, tilt, left, right, blur = 1, labels, extra, herKeys, lamp = 1}) => (
	<g>
		<g filter={blur > 0.5 ? 'url(#dof)' : undefined}>
			<Apartment frame={f} cam={cam} lamp={lamp} bed={<SheOnBed f={f} x={HER.x} y={HER.y} s={S} keys={herKeys ?? [[0, SHE_POSE.phone]]} />} phone={{x: HER.x + 130, y: HER.y - 290, o: 0.6}} />
			<rect width={W} height={H} fill="#06060c" opacity={0.35 * blur} />
		</g>
		<Layer cam={cam} depth={1}>
			{extra}
			{/* a low stool under the balance */}
			<rect x={BAL.x - 170} y={BAL.y} width={340} height={22} rx={6} fill="#5a4436" />
			<rect x={BAL.x - 150} y={BAL.y + 22} width={18} height={140} fill="#3a2a20" />
			<rect x={BAL.x + 132} y={BAL.y + 22} width={18} height={140} fill="#3a2a20" />
			<g transform={`translate(${BAL.x},${BAL.y}) scale(${BAL.s})`}>
				<Balance tilt={tilt} left={left} right={right} />
			</g>
			{labels}
		</Layer>
	</g>
);

// ---------------------------------------------------------------- 5. mechanism (the build)

const Mechanism: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	// her pile grows on the beats while Festinger is named; the balance sinks on her side
	const drops = [cue(0) + 16, cue(0) + 46, cue(0) + 76, cue(0) + 106, cue(0) + 136];
	const n = 3 + drops.filter((d) => f >= d).length;
	const lastDrop = drops.filter((d) => f >= d).pop() ?? -100;
	const drop = prog(f, lastDrop, 10, ease.in);
	const tilt = keyPoses(f, [
		[0, {...POSES.stand, lean: 8}],
		[cue(1), {...POSES.stand, lean: 17}],
		[cue(1) + 6, {...POSES.stand, lean: 19}],
		[cue(1) + 12, {...POSES.stand, lean: 18}],
	]).lean;
	const fuse = prog(f, cue(2) + 12, 24, ease.inOut);
	const tremble = f > cue(3) ? 1.6 * Math.sin(f * 1.3) * prog(f, cue(3), 40) : 0;
	const L = panL(tilt);
	const R = panR(tilt);
	const keys: Key[] = [
		[0, L.x, L.y + 120, 4.2],
		[34, BAL.x - 20, BAL.y - 250, 1.3],
		[cue(1) - 6, BAL.x - 10, BAL.y - 240, 1.36],
		[cue(2), BAL.x - 30, BAL.y - 230, 1.34],
		[cue(2) + 40, L.x + 40, L.y - 20, 1.9],
		[cue(3), BAL.x + 120, BAL.y - 250, 1.6],
		[end, R.x, R.y + 20, 2.5],
	];
	const cam = spline(keys, f);
	const arrive = 1 - prog(f, 0, 20, ease.out);
	return (
		<Frame flash={0.85 * arrive * arrive + 0.3 * (f >= cue(2) + 12 && f < cue(2) + 24 ? 1 - (f - cue(2) - 12) / 12 : 0)} flashColor={HUE.gold}>
			<BalanceShot
				f={f}
				cam={cam}
				tilt={tilt}
				left={<Pile n={n} drop={drop} fuse={fuse} />}
				right={
					<g transform={`translate(${tremble},0)`}>
						<g transform="translate(0,-12)">
							<Capsule w={44} grey glow={0.15 * prog(f, cue(3) + 20, 60)} />
						</g>
					</g>
				}
				labels={
					<g>
						<text x={L.x} y={L.y + 64} textAnchor="middle" opacity={landed(f, cue(1) - 4, cue(3) - 6)} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 40, fill: HUE.gold}}>
							我为它付出了这么多
						</text>
						<text x={R.x} y={R.y + 64} textAnchor="middle" opacity={landed(f, cue(1) + 12)} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 40, fill: '#b8b4cc'}}>
							它根本不值得
						</text>
					</g>
				}
			/>
			{/* tension before the drop */}
			<rect width={W} height={H} fill="url(#vig3)" opacity={0.6 * prog(f, cue(3), end - cue(3), ease.in)} />
		</Frame>
	);
};

// ---------------------------------------------------------------- 6. reveal (the drop)

const Reveal: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const R3 = cue(2) - 10;
	const R4 = cue(3) - 10;
	// R1/R2: TA's grey 嗯 swells into a gold one on the drop; the beam swings level with overshoot
	const swell = prog(f, 0, 8, ease.out);
	const tilt = keyPoses(f, [
		[0, {...POSES.stand, lean: 18}],
		[8, {...POSES.stand, lean: -7}],
		[16, {...POSES.stand, lean: 4}],
		[24, {...POSES.stand, lean: -1.5}],
		[32, {...POSES.stand, lean: 0}],
	]).lean;
	const R = panR(tilt);
	const L = panL(tilt);
	const rewrite = prog(f, cue(0) - 4, 14);
	// R2: pull back to her; the gold on TA's side came out of her (a stream from her hands)
	const back = prog(f, cue(1) - 16, 50, ease.inOut);
	const focus = prog(f, cue(1) - 6, 40);
	const keys: Key[] = [
		[0, R.x, R.y + 20, 2.5],
		[6, R.x - 40, R.y, 2.2],
		[30, BAL.x, BAL.y - 250, 1.32],
		[cue(1) - 16, BAL.x - 20, BAL.y - 240, 1.36],
		[cue(1) + 40, 900, 640, 1.08],
		[R3, 880, 620, 1.12],
	];
	const cam = spline(keys, f);
	const sh = f < 10 ? 16 * Math.exp(-f / 2.6) : 0;
	const shake = `translate(${sh * Math.sin(f * 2.9)},${sh * Math.cos(f * 3.7)})`;
	// R4: 1966
	const labCam = spline(
		[
			[R4, 1000, LAB_DESK_Y - 60, 2.3],
			[R4 + 40, 1020, LAB_DESK_Y - 70, 1.8],
			[end, 760, 480, 1.35],
		],
		f,
	);
	const knob = prog(f, R4 + 22, 18, ease.inOut);
	const zapAt = R4 + 40;
	const zap = f >= zapAt ? Math.exp(-(f - zapAt) / 9) : 0;
	const bars = prog(f, cue(3) + 60, 30, ease.out);
	const stream = prog(f, cue(1) + 6, 60);
	return (
		<Frame
			flash={f < 6 ? 0.9 * (1 - f / 6) : f >= R4 ? 0.8 * Math.pow(1 - prog(f, R4, 16), 2) + 0.4 * zap : f >= R3 ? 0.7 * Math.pow(1 - prog(f, R3, 16), 2) : 0.8 * prog(f, R3 - 10, 10, ease.in)}
			flashColor={f >= R4 ? '#cfe6ff' : HUE.gold}
		>
			{f < R3 ? (
				<g transform={shake}>
					<BalanceShot
						f={f}
						cam={cam}
						tilt={tilt}
						blur={1 - focus}
						lamp={1}
						herKeys={[[0, SHE_POSE.phone], [cue(1) + 10, SHE_POSE.phone], [cue(1) + 30, SHE_POSE.cup]]}
						left={<Pile n={8} fuse={1} scale={mix(1, 0.8, stream)} />}
						right={
							<g transform="translate(0,-14)">
								<g transform={`scale(${mix(1, 1.9, swell)})`}>
									<Capsule w={mix(44, 80, swell)} grey={swell < 0.4} glow={swell} />
								</g>
							</g>
						}
						labels={
							<g opacity={1 - back}>
								<text x={L.x} y={L.y + 64} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 40, fill: HUE.gold}}>
									我为它付出了这么多
								</text>
								<text x={R.x} y={R.y + 64} textAnchor="middle" opacity={1 - rewrite} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 40, fill: '#b8b4cc'}}>
									它根本不值得
								</text>
								<text x={R.x} y={R.y + 64} textAnchor="middle" opacity={rewrite} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 44, fill: HUE.gold}} filter="url(#g-sm)">
									它一定很有意思
								</text>
							</g>
						}
						extra={
							<g>
								<Impact f={f} t={0} x={panR(0).x} y={panR(0).y + 160} size={0.7} color="#ffe2a0" seed="drop" />
								{/* the gold comes out of her: a stream from her hands to TA's pan */}
								{stream > 0
									? Array.from({length: 26}, (_, i) => {
											const t = ((f - cue(1) - 6) / 50 + i / 26) % 1;
											const hx = HER.x + 120;
											const hy = HER.y - 280;
											const tx = panR(0).x;
											const ty = panR(0).y + 130;
											const x = mix(hx, tx, t);
											const y = mix(hy, ty, t) - 200 * Math.sin(Math.PI * t);
											return <rect key={i} x={x - 10} y={y - 4} width={20} height={8} rx={4} fill={HUE.gold} opacity={0.85 * stream * Math.sin(Math.PI * t)} filter="url(#g-sm)" />;
									  })
									: null}
							</g>
						}
					/>
				</g>
			) : null}
			{f >= R3 && f < R4 ? (
				<g>
					<g filter="url(#dof)">
						<Apartment frame={f} cam={lookAt(900, 620, 1.12 + 0.05 * prog(f, R3, R4 - R3))} lamp={0.8} bed={<SheOnBed f={f} x={HER.x} y={HER.y} s={S} keys={[[0, SHE_POSE.cup]]} phone="none" hand="open" />} />
					</g>
					<rect width={W} height={H} fill="#05050b" opacity={0.6} />
					<g opacity={landed(f, cue(2) - 2)}>
						<Thin text="努力合理化" y={520} size={130} fill="url(#gold-text)" w={900} ls="0.12em" />
					</g>
					<text x={960} y={610} textAnchor="middle" opacity={landed(f, cue(2) + 10)} style={{fontFamily: font.latin, fontSize: 34, letterSpacing: '0.5em', fill: '#e0b46e'}}>
						EFFORT JUSTIFICATION
					</text>
					<Dust seed="rv3" f={f} n={50} c="#ffd98f" />
				</g>
			) : null}
			{f >= R4 ? (
				<g transform={zap > 0.3 ? `translate(${6 * zap * Math.sin(f * 3)},${4 * zap * Math.cos(f * 4)})` : undefined}>
					<Lab1959
						frame={f}
						cam={labCam}
						boardTitle={false}
						board={
							<g>
								<line x1={70} y1={290} x2={590} y2={290} stroke="#e8e6dc" strokeWidth={3} opacity={0.75} />
								<ChalkBar x={220} h={70} k={bars} label="弱电击" />
								<ChalkBar x={420} h={150} k={bars} gold label="强电击" />
							</g>
						}
						desk={
							<g transform={`translate(1030,${LAB_DESK_Y})`}>
								<ShockBox k={knob} spark={zap} />
							</g>
						}
						behind={<Person who="coed59" f={f} x={600} y={LAB_DESK_Y - 50 + 216 * 1.1} s={1.1} pose={zap > 0.2 ? COED_POSE.flush : COED_POSE.listen} expression={zap > 0.2 ? 'surprise' : 'worried'} />}
					/>
					<g opacity={landed(f, R4 + 8)}>
						<Tag en="1966 · Gerard & Mathewson" zh="1966 · 换成电击的重复实验" />
					</g>
				</g>
			) : null}
		</Frame>
	);
};

// ---------------------------------------------------------------- 7. second layer: she builds the box (IKEA effect); 2011, uncertainty

const BOXP = {x: 1080, y: 1000};

/** a price tag on a string */
const PriceTag: React.FC<{x: number; y: number; text: string; gold?: boolean; o?: number; swing?: number}> = ({x, y, text, gold, o = 1, swing = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${swing})`} opacity={o}>
		<line x1={0} y1={-60} x2={0} y2={0} stroke="#cfc6b6" strokeWidth={2} />
		<path d="M-60,0 L60,0 L60,70 L-60,70 L-76,35 Z" fill={gold ? '#f1c56d' : '#efe6d2'} />
		<circle cx={-58} cy={35} r={5} fill="#3a2e22" />
		<text x={8} y={50} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 36, fill: '#2a2018', fontVariantNumeric: 'lining-nums'}}>
			{text}
		</text>
	</g>
);

/** 2011: a small study room at UVA, a monitor with three profiles; the uncertain one glows */
const Room2011: React.FC<{f: number; cam: Cam; lit: number}> = ({f, cam, lit}) => (
	<g>
		<Layer cam={cam} depth={0.6}>
			<rect x={-800} y={-600} width={3520} height={2200} fill="#1c2030" />
			<rect x={-800} y={640} width={3520} height={900} fill="#151824" />
			<g transform="translate(1320,120)">
				<rect width={380} height={380} fill="#0e1424" />
				{Array.from({length: 16}, (_, i) => (
					<rect key={i} x={0} y={i * 24} width={380} height={12} fill="#2a3048" />
				))}
				<rect x={-10} y={-10} width={400} height={400} fill="none" stroke="#2a2e40" strokeWidth={14} />
			</g>
		</Layer>
		<Layer cam={cam} depth={1}>
			<circle cx={1060} cy={560} r={700} fill="#8a9aff" opacity={0.12} filter="url(#blur-lg)" />
			<rect x={420} y={760} width={1200} height={20} fill="#3a3a44" />
			<rect x={440} y={780} width={1160} height={400} fill="#22242e" />
			{/* monitor */}
			<g transform="translate(1060,760)">
				<rect x={-14} y={-60} width={28} height={60} fill="#2a2a30" />
				<rect x={-90} y={-8} width={180} height={10} rx={4} fill="#2a2a30" />
				<rect x={-330} y={-420} width={660} height={370} rx={10} fill="#141418" />
				<rect x={-314} y={-404} width={628} height={338} fill="#e8ecf6" />
				<rect x={-314} y={-404} width={628} height={34} fill="#3b5998" />
				<text x={-296} y={-380} style={{fontFamily: font.sans, fontWeight: 700, fontSize: 18, fill: '#fff'}}>
					profiles
				</text>
				{[
					{x: -210, l: '很喜欢你'},
					{x: 0, l: '一般般'},
					{x: 210, l: '不确定'},
				].map((c, i) => {
					const hi = i === 2;
					return (
						<g key={i} transform={`translate(${c.x},-220)`} opacity={hi ? 1 : 1 - 0.45 * lit}>
							{hi ? <rect x={-96} y={-120} width={192} height={240} rx={10} fill="#8a9aff" opacity={0.35 * lit} filter="url(#b8)" /> : null}
							<rect x={-86} y={-110} width={172} height={220} rx={8} fill="#fff" stroke={hi ? '#5a6ad8' : '#c8ccd8'} strokeWidth={hi ? 3 : 1.5} />
							<rect x={-60} y={-96} width={120} height={110} fill="#c8d0e0" />
							<circle cx={0} cy={-56} r={26} fill="#9aa4b8" />
							<path d="M-40,14 C-30,-14 30,-14 40,14 Z" fill="#9aa4b8" />
							<text x={0} y={60} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 26, fill: '#2a2e3c'}}>
								{c.l}
							</text>
						</g>
					);
				})}
			</g>
			{/* the student, seen from behind-left, thinking */}
			<Person who="student11" f={f} x={560} y={760 - 50 + 216 * 1.1} s={1.1} pose={{...COED_POSE.rate, head: 4, armNear: [50, 96], armFar: [44, 100]}} expression="thinking" rim="cool" />
			{/* thoughts circling the one she can't read */}
			{Array.from({length: 9}, (_, i) => {
				const t = f / 24 + (i / 9) * Math.PI * 2;
				return <circle key={i} cx={1270 + 170 * Math.cos(t)} cy={540 + 150 * Math.sin(t)} r={5} fill="#c8d2ff" opacity={0.8 * lit} filter="url(#g-sm)" />;
			})}
		</Layer>
	</g>
);

const Layer2: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const L2 = cue(2) - 10;
	// she builds it: boards lift off on the beats, the box stands, the drawer slides in
	const build = prog(f, cue(0) - 10, cue(1) - cue(0) - 10, (x) => x);
	const workPose: Pose = {...SHE_POSE.place, lean: 30, head: 40, armNear: [30, 40], armFar: [24, 50], wristNear: 20};
	const turn = f < cue(1) - 20 ? 8 * Math.sin(f / 3) : 0;
	const keys: Key[] = [
		[0, BOXP.x, BOXP.y - 120, 2.6],
		[cue(0) + 50, BOXP.x - 60, BOXP.y - 180, 1.9],
		[cue(1) - 20, BOXP.x + 40, BOXP.y - 300, 1.3],
		[cue(1) + 30, 1260, BOXP.y - 330, 1.22],
		[L2, 1270, BOXP.y - 330, 1.28],
	];
	const cam = spline(keys, f);
	const store = prog(f, cue(1) - 20, 20, ease.out);
	const slam = cue(1) + 8;
	// 2011
	const keys2: Key[] = [
		[L2, 960, 560, 1.0],
		[cue(3) - 10, 1100, 520, 1.25],
		[end - 16, 1270, 540, 1.9],
		[end, 1270, 540, 5.5],
	];
	const cam2 = spline(keys2, f);
	const lit = prog(f, cue(2) + 30, 30);
	const whip = prog(f, L2 - 8, 16, ease.inOut);
	const out = prog(f, end - 16, 16, ease.in);
	return (
		<Frame flash={0.9 * out * out + (f >= L2 - 2 && f < L2 + 6 ? 0.3 : 0)} flashColor={f >= L2 ? '#c8d2ff' : HUE.gold}>
			{f < L2 + 6 ? (
				<g opacity={1 - whip} transform={`translate(0,${-700 * whip * whip})`}>
					<Apartment
						frame={f}
						cam={cam}
						lamp={1}
						box={false}
						bed={<SheOnBed f={f} x={HER.x} y={HER.y} s={S} keys={[[0, workPose]]} phone="none" hand="grip" expression="thinking" />}
						children={
							<g>
								<g transform={`translate(${BOXP.x},${BOXP.y}) scale(1.2)`}>
									<FlatPack k={build} />
								</g>
								<g transform={`translate(${HER.x + 150},${HER.y - 150}) rotate(${turn})`}>
									<AllenKey />
								</g>
								{/* the store-built twin slides in beside hers */}
								<g transform={`translate(${mix(1900, 1440, store)},${BOXP.y}) scale(1.2)`} opacity={store}>
									<FlatPack k={1} />
								</g>
								<PriceTag x={BOXP.x} y={BOXP.y - 330} text="$0.78" gold o={landed(f, cue(1) - 4)} swing={4 * Math.sin(f / 9) * Math.exp(-(f - cue(1)) / 30)} />
								<PriceTag x={1440} y={BOXP.y - 330} text="$0.48" o={landed(f, cue(1) - 14)} />
								{f >= slam ? (
									<g>
										<Impact f={f} t={slam} x={1260} y={BOXP.y - 560} size={0.3} color="#ffe2a0" seed="pct" />
										<g transform={`translate(1260,${BOXP.y - 500}) scale(${1 + 0.4 * Math.exp(-(f - slam) / 3)})`}>
											<Thin text="+63%" x={0} y={0} size={110} fill={HUE.gold} />
										</g>
									</g>
								) : null}
							</g>
						}
					/>
					<g opacity={landed(f, 6)}>
						<Tag en="The IKEA effect · Norton, Mochon & Ariely 2012" zh="宜家效应" />
					</g>
				</g>
			) : null}
			{f >= L2 - 6 ? (
				<g transform={`translate(0,${700 * Math.pow(1 - prog(f, L2 - 6, 16, ease.out), 2)})`}>
					<Room2011 f={f} cam={cam2} lit={lit} />
					<g opacity={landed(f, L2 + 20)}>
						<Tag en="2011 · University of Virginia" zh="47 名女大学生 · 一项小型研究" />
					</g>
				</g>
			) : null}
		</Frame>
	);
};

export const story3 = {Mechanism, Reveal, Layer: Layer2};
