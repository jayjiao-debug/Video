import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CAST} from './art/cast';
import {Figure, JOINT_LIMITS, POSES, type HandShape, type Pose} from './art/Figure';
import {Materials} from './art/materials';
import {MOCAP, mocapPose} from './art/mocap';
import {P} from './art/palette';
import {loadEpisodeFonts} from './lib/fonts';
import {font} from './lib/theme';

/**
 * Motion reference board: real motion capture (left, the actor's skeleton seen
 * from the side) next to our rig driven by the same frame (right). One sheet per
 * clip, then a sheet of hand orientations and the joint limits every pose obeys.
 * Render: COMPOSITION=MocapBoard node scripts/stills.mjs benford <dir> 0 1 2 …
 */

const SHEETS: {clip: string; t: number[]}[] = [
	{clip: '13_07', t: [1.0, 3.0, 4.3, 5.0, 5.6, 8.5]},
	{clip: '77_08', t: [0.3, 1.0, 1.7, 2.3, 4.0, 5.3]},
	{clip: '15_06', t: [0.0, 1.2, 6.2, 8.6, 16.0, 21.0]},
	{clip: '13_04', t: [3.3, 4.9, 6.5, 13.1, 24.5, 34.3]},
	{clip: '18_08', t: [2, 4, 6, 8, 10, 12]},
	{clip: '26_10', t: [0.5, 1.5, 2.2, 3.0, 4.0, 5.0]},
];
export const MOCAP_BOARD_N = SHEETS.length + 1;

const BONES: [string, string, 'near' | 'far' | 'mid'][] = [
	['Hips', 'Spine1', 'mid'],
	['Spine1', 'Neck', 'mid'],
	['Neck', 'Head', 'mid'],
	['Head', 'Head_end', 'mid'],
	['Neck', 'LeftArm', 'far'],
	['LeftArm', 'LeftForeArm', 'far'],
	['LeftForeArm', 'LeftHand', 'far'],
	['LeftHand', 'LeftHandIndex1', 'far'],
	['LeftHand', 'LThumb', 'far'],
	['Hips', 'LeftUpLeg', 'far'],
	['LeftUpLeg', 'LeftLeg', 'far'],
	['LeftLeg', 'LeftFoot', 'far'],
	['LeftFoot', 'LeftToeBase', 'far'],
	['Neck', 'RightArm', 'near'],
	['RightArm', 'RightForeArm', 'near'],
	['RightForeArm', 'RightHand', 'near'],
	['RightHand', 'RightHandIndex1', 'near'],
	['RightHand', 'RThumb', 'near'],
	['Hips', 'RightUpLeg', 'near'],
	['RightUpLeg', 'RightLeg', 'near'],
	['RightLeg', 'RightFoot', 'near'],
	['RightFoot', 'RightToeBase', 'near'],
];
const COL = {near: '#f1c56d', far: '#6a8ab8', mid: '#e8e2d4'};

/** the actor's skeleton, hips at (x, y), body height `h` px */
const Skeleton: React.FC<{j: Record<string, [number, number]>; x: number; y: number; h: number}> = ({j, x, y, h}) => (
	<g>
		{BONES.map(([a, b, side], i) =>
			j[a] && j[b] ? (
				<line key={i} x1={x + j[a][0] * h} y1={y - j[a][1] * h} x2={x + j[b][0] * h} y2={y - j[b][1] * h} stroke={COL[side]} strokeWidth={side === 'near' ? 5 : 4} strokeLinecap="round" opacity={side === 'far' ? 0.8 : 1} />
			) : null,
		)}
		{j.Head ? <circle cx={x + ((j.Head[0] + j.Head_end[0]) / 2) * h} cy={y - ((j.Head[1] + j.Head_end[1]) / 2) * h} r={h * 0.055} fill="none" stroke={COL.mid} strokeWidth={3} /> : null}
	</g>
);

const T: React.FC<{x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; w?: number; children: React.ReactNode}> = ({x, y, s = 22, c = '#e8e2d4', a = 'start', w = 500, children}) => (
	<text x={x} y={y} textAnchor={a} style={{fontFamily: font.sans, fontSize: s, fill: c, fontWeight: w, fontVariantNumeric: 'lining-nums tabular-nums'}}>
		{children}
	</text>
);

const ClipSheet: React.FC<{clip: string; t: number[]}> = ({clip, t}) => {
	const meta = MOCAP[clip];
	return (
		<>
			<T x={60} y={70} s={40} c={P.gold} w={800}>
				{`动作参考 · ${meta.zh}`}
			</T>
			<T x={60} y={108} s={20} c="#9a9488">
				{`CMU 动作捕捉 ${clip}（${meta.en}）· 左：真人骨架侧视（金 = 近侧手臂/腿，蓝 = 远侧）· 右：我们的人物用同一帧驱动`}
			</T>
			{t.map((sec, i) => {
				const col = i % 3;
				const row = Math.floor(i / 3);
				const px = 60 + col * 610;
				const py = 150 + row * 460;
				const f = Math.round(sec * 30);
				const m = meta.data.frames[Math.min(meta.data.frames.length - 1, f)];
				const pose: Pose = mocapPose(clip, f);
				return (
					<g key={i}>
						<rect x={px} y={py} width={590} height={440} rx={14} fill="#16181e" stroke="#2a2d36" strokeWidth={2} />
						<Skeleton j={m.joints} x={px + 150} y={py + 205} h={330} />
						<g transform={`translate(${px + 430},${py + 400}) scale(0.95)`}>
							<Figure look={CAST.economist} pose={pose} hands={{near: 'relaxed', far: 'relaxed'}} rim="none" shadow={false} />
						</g>
						<line x1={px + 295} y1={py + 30} x2={px + 295} y2={py + 410} stroke="#2a2d36" strokeWidth={2} />
						<T x={px + 18} y={py + 34} s={20} c="#cfc8b8" w={700}>{`${sec.toFixed(1)}s`}</T>
						<T x={px + 18} y={py + 428} s={15} c="#8a8478">
							{`前倾 ${pose.lean.toFixed(0)}° · 上臂 ${pose.armNear[0].toFixed(0)}° · 肘 ${pose.armNear[1].toFixed(0)}° · 手腕 ${(pose.wristNear ?? 0).toFixed(0)}° · ${pose.palmNear === -1 ? '手背朝外' : '掌心朝外'}`}
						</T>
					</g>
				);
			})}
		</>
	);
};

const HandSheet: React.FC = () => {
	const shapes: HandShape[] = ['relaxed', 'grip', 'open', 'point', 'pinch'];
	const zh: Record<HandShape, string> = {relaxed: '放松', grip: '握', open: '张开', point: '指', pinch: '捏'};
	const wrists = [-60, -30, 0, 40, 75];
	return (
		<>
			<T x={60} y={70} s={40} c={P.gold} w={800}>
				手的朝向 · 关节限制
			</T>
			<T x={60} y={108} s={20} c="#9a9488">
				同一只前臂（水平向前伸）配不同手腕角度；所有姿势都会被夹在真人关节范围内，肘、膝不会反折，手腕不会拧过头
			</T>
			{shapes.map((sh, r) => (
				<g key={sh}>
					<T x={60} y={210 + r * 150} s={26} c="#e8e2d4" w={700}>
						{zh[sh]}
					</T>
					{wrists.map((w, c) => {
						const pose: Pose = {...POSES.stand, armNear: [80, 10], wristNear: w, palmNear: 1};
						return (
							<g key={c}>
								<g transform={`translate(${260 + c * 250},${430 + r * 150}) scale(0.9)`}>
									<g clipPath="url(#hs-clip)">
										<Figure look={CAST.economist} pose={pose} hands={{near: sh, far: 'relaxed'}} rim="none" shadow={false} />
									</g>
								</g>
								{r === 0 ? (
									<T x={330 + c * 250} y={160} s={20} c="#9a9488" a="middle">{`手腕 ${w > 0 ? '+' : ''}${w}°`}</T>
								) : null}
							</g>
						);
					})}
				</g>
			))}
			<g transform="translate(1540,170)">
				<rect width={330} height={560} rx={14} fill="#16181e" stroke="#2a2d36" strokeWidth={2} />
				<T x={24} y={50} s={26} c={P.gold} w={800}>
					关节范围
				</T>
				{[
					['身体前倾', JOINT_LIMITS.lean],
					['头', JOINT_LIMITS.head],
					['上臂', JOINT_LIMITS.upperArm],
					['肘（只向前弯）', JOINT_LIMITS.elbow],
					['大腿', JOINT_LIMITS.thigh],
					['膝（只向后弯）', JOINT_LIMITS.knee],
					['手腕', JOINT_LIMITS.wrist],
				].map(([n, r], i) => (
					<g key={i}>
						<T x={24} y={110 + i * 62} s={20} c="#cfc8b8">
							{n as string}
						</T>
						<T x={306} y={110 + i * 62} s={20} c="#e8e2d4" a="end" w={700}>
							{`${(r as readonly number[])[0]}° ~ ${(r as readonly number[])[1]}°`}
						</T>
					</g>
				))}
				<T x={24} y={540} s={15} c="#8a8478">
					数值来自 CMU 动作捕捉 · pipeline/mocap.py
				</T>
			</g>
		</>
	);
};

export const MocapBoard: React.FC = () => {
	loadEpisodeFonts('benford');
	const i = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#0e0f13'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				<Materials />
				<defs>
					<clipPath id="hs-clip">
						<rect x={-30} y={-262} width={95} height={95} />
						<rect x={65} y={-330} width={160} height={165} />
					</clipPath>
				</defs>
				{i < SHEETS.length ? <ClipSheet clip={SHEETS[i].clip} t={SHEETS[i].t} /> : <HandSheet />}
			</svg>
		</AbsoluteFill>
	);
};
