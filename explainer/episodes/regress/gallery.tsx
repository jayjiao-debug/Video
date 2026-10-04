import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, blinkAt} from '../../src/art/Figure';
import {JET_DEFS, SmokeTrail, TrainerJet} from '../../src/art/Jet';
import {Materials} from '../../src/art/materials';
import {lookAt} from '../../src/art/sets/Airfield';
import {AIRBASE_DEFS, Airbase1965, BriefingHut} from '../../src/art/sets/Airbase1965';
import {BRIEFING_DEFS, Briefing1965, FLOOR_Y} from '../../src/art/sets/Briefing1965';
import {GlowDefs} from '../../src/components/Stage';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {COINS, Coin, Desk, GradeBoard, HangarFloor, HeightChart, Logbook, REGRESS_DEFS, TGT, TopPerson, WriteOn, throwerAt} from './art';

/** 《夸完就翻车》 model sheets: COMPOSITION=RegressGallery node scripts/stills.mjs regress out/gallery-regress 0 1 … */
export const REGRESS_SHEETS = ['airbase', 'night', 'briefing', 'logbook', 'floor', 'galton', 'jet'] as const;

const ROWS = [
	{cadet: '07', a: '92', b: '71', note: '夸' as const, pa: 1, pn: 1, pb: 1},
	{cadet: '12', a: '48', b: '76', note: '骂' as const, pa: 1, pn: 1, pb: 1},
];

const Sheet: React.FC<{i: number; f: number}> = ({i, f}) => {
	const k = REGRESS_SHEETS[i];
	if (k === 'airbase' || k === 'night') {
		const night = k === 'night' ? 1 : 0;
		const pts: [number, number][] = Array.from({length: 40}, (_, j) => {
			const t = j / 39;
			const a = Math.PI * 1.2 * t;
			return [700 + 260 * Math.sin(a), 330 - 200 * (1 - Math.cos(a))];
		});
		return (
			<Airbase1965
				frame={f}
				cam={lookAt(960, 560, 1)}
				night={night}
				sky={
					<g>
						<SmokeTrail points={pts} />
						<g transform={`translate(${pts[39][0]},${pts[39][1]}) rotate(-140) scale(0.5)`}>
							<TrainerJet burn={0.6} />
						</g>
					</g>
				}
			>
				<g transform="translate(330,900)">
					<BriefingHut lit={1} />
				</g>
				<g transform="translate(1240,960) scale(0.95)">
					<GradeBoard rows={ROWS} />
				</g>
				<g transform="translate(1620,930) scale(0.95)">
					<Figure look={CAST.instructor} pose={POSES.stand} flip rim="warm" blink={blinkAt(f, 'i')} />
				</g>
			</Airbase1965>
		);
	}
	if (k === 'briefing') {
		return (
			<Briefing1965
				frame={f}
				cam={lookAt(960, 560, 1)}
				board={
					<g>
						<WriteOn x={400} y={150} text="奖励 > 惩罚" size={96} p={1} anchor="middle" id="g-b1" />
						<WriteOn x={400} y={250} text="（技能学习）" size={40} p={1} anchor="middle" id="g-b2" />
					</g>
				}
			>
				<g transform={`translate(1420,${FLOOR_Y}) scale(1.05)`}>
					<Figure look={CAST.kahneman} pose={POSES.stand} flip rim="warm" blink={blinkAt(f, 'k')} />
				</g>
			</Briefing1965>
		);
	}
	if (k === 'logbook') {
		return (
			<g>
				<Desk f={f}>
					<g transform="translate(120,150)">
						<Logbook rows={7} ticks={7} strike={0.5} />
					</g>
				</Desk>
			</g>
		);
	}
	if (k === 'floor') {
		return (
			<HangarFloor f={f}>
				{COINS.map((c, j) => (
					<g key={j}>
						<circle cx={TGT.x + c.aim[0]} cy={TGT.y + c.aim[1]} r={120} fill="none" stroke="#f1c56d" strokeWidth={2} strokeDasharray="8 8" opacity={0.25} />
						<Coin x={TGT.x + c.a[0]} y={TGT.y + c.a[1]} />
						<Coin x={TGT.x + c.b[0]} y={TGT.y + c.b[1]} copper />
					</g>
				))}
				{COINS.map((_, j) => {
					const [x, y] = throwerAt(j);
					return <TopPerson key={j} x={x} y={y} f={f} seed={`t${j}`} />;
				})}
				<Coin x={300} y={200} h={140} spin={0.5} r={40} face="夸" back="骂" gold />
			</HangarFloor>
		);
	}
	if (k === 'galton') {
		return (
			<Desk f={f}>
				<g transform="translate(480,180)">
					<HeightChart p={1} line={1} fit={1} tall={1} />
				</g>
			</Desk>
		);
	}
	// jet model sheet
	return (
		<g>
			<rect width={1920} height={1080} fill="#151a26" />
			<g transform="translate(700,420) scale(1.9)">
				<TrainerJet gear warm={0.3} />
			</g>
			<g transform="translate(1500,420) scale(0.8) rotate(-30)">
				<TrainerJet burn={1} />
			</g>
			<g transform="translate(1500,760) scale(0.8) scale(1,-1)">
				<TrainerJet />
			</g>
			{[0, 0.6, 1.2, 1.5].map((s, j) => (
				<Coin key={j} x={300 + j * 160} y={880} spin={s} r={50} face="夸" back="骂" gold />
			))}
			{[0, 2.2].map((s, j) => (
				<Coin key={j} x={1000 + j * 160} y={880} spin={s} r={50} />
			))}
		</g>
	);
};

export const RegressGallery: React.FC = () => {
	loadEpisodeFonts('regress');
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#06070b'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{fontVariantNumeric: 'lining-nums'}}>
				<Materials />
				<GlowDefs />
				<JET_DEFS />
				<AIRBASE_DEFS />
				<BRIEFING_DEFS />
				<REGRESS_DEFS />
				<Sheet i={f} f={f * 7 + 30} />
			</svg>
		</AbsoluteFill>
	);
};
