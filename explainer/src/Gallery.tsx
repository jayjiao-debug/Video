import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {B17Side, B17Top} from './art/B17';
import {Cat, type CatPose} from './art/Cat';
import {Airfield} from './art/sets/Airfield';
import {CAST} from './art/cast';
import {Figure, POSES, SPOTS, walkPose, type Expression} from './art/Figure';
import {Materials} from './art/materials';
import {P} from './art/palette';
import {loadEpisodeFonts} from './lib/fonts';
import {font} from './lib/theme';

/**
 * Model sheets for art review: one sheet per frame.
 * Render with: node scripts/gallery.mjs  → out/gallery/*.jpg
 */
export const SHEETS = ['palette', 'cast', 'poses', 'faces', 'cat', 'b17', 'airfield'] as const;

const Label: React.FC<{x: number; y: number; children: React.ReactNode; size?: number; color?: string}> = ({x, y, children, size = 26, color = P.paperShade}) => (
	<text x={x} y={y} textAnchor="middle" style={{fontFamily: font.sans, fontSize: size, fill: color, letterSpacing: '0.1em'}}>
		{children}
	</text>
);

const Title: React.FC<{children: React.ReactNode; sub?: string}> = ({children, sub}) => (
	<>
		<text x={80} y={92} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 52, fill: P.gold}}>
			{children}
		</text>
		{sub ? (
			<text x={80} y={136} style={{fontFamily: font.sans, fontSize: 24, fill: P.paperShade, letterSpacing: '0.12em'}}>
				{sub}
			</text>
		) : null}
	</>
);

const Floor: React.FC = () => (
	<>
		<rect x={0} y={0} width={1920} height={1080} fill="url(#sky-night)" />
		<ellipse cx={960} cy={980} rx={1100} ry={120} fill={P.night3} opacity={0.6} />
		<ellipse cx={960} cy={300} rx={700} ry={360} fill="url(#glow-lamp)" opacity={0.18} />
	</>
);

const PaletteSheet: React.FC = () => {
	const groups: [string, (keyof typeof P)[]][] = [
		['夜色 · 冷光', ['night0', 'night1', 'night2', 'night3', 'night4', 'horizon', 'dusk', 'moon', 'rim', 'steelBlue']],
		['暖光 · 实景光源', ['lamp', 'candle', 'ember', 'fire', 'gold', 'brass', 'brassDark']],
		['材质', ['odGreen', 'odLight', 'odDark', 'neutralGray', 'alu', 'glass', 'paper', 'paperShade', 'wood', 'brick', 'concrete']],
		['人物', ['skin1', 'skin2', 'skin3', 'hairBlack', 'hairBrown', 'suitCharcoal', 'suitBrown', 'shirt', 'khaki', 'labCoat']],
		['信号色', ['red', 'redDeep', 'star', 'insigniaBlue']],
	];
	return (
		<>
			<Floor />
			<Title sub="一个暖光主光源 + 冷色环境光 · 金色只给答案 · 红色只给伤害和陷阱">美术规范 · 调色板</Title>
			{groups.map(([name, keys], gi) => (
				<g key={name} transform={`translate(80, ${200 + gi * 168})`}>
					<text y={-14} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 28, fill: P.paper}}>
						{name}
					</text>
					{keys.map((k, i) => (
						<g key={k} transform={`translate(${i * 160}, 0)`}>
							<rect width={144} height={88} rx={10} fill={P[k]} stroke="rgba(255,255,255,0.12)" />
							<text x={4} y={116} style={{fontFamily: font.sans, fontSize: 18, fill: P.paperShade}}>
								{k}
							</text>
						</g>
					))}
				</g>
			))}
		</>
	);
};

const CastSheet: React.FC<{f: number}> = ({f}) => {
	const names: [keyof typeof CAST, string][] = [
		['wald', '瓦尔德 · 统计学家'],
		['friedman', '弗里德曼'],
		['officer', '空军军官'],
		['pilot', '飞行员'],
		['mechanic', '地勤机械师'],
		['vet', '兽医'],
		['clerk', '研究员'],
	];
	return (
		<>
			<Floor />
			<Title sub="同一副骨架 · 6.5 头身 · 用帽子 / 眼镜 / 衣长区分剪影">角色阵容</Title>
			{names.map(([k, label], i) => (
				<g key={k} transform={`translate(${200 + i * 255}, 860) scale(1.55)`}>
					<Figure look={CAST[k]} pose={i % 3 === 1 ? POSES.present : i % 3 === 2 ? POSES.hold : POSES.stand} expression={i === 0 ? 'thinking' : 'neutral'} blink={1} />
				</g>
			))}
			{names.map(([k, label], i) => (
				<Label key={k} x={200 + i * 255} y={940}>
					{label}
				</Label>
			))}
		</>
	);
};

const PoseSheet: React.FC = () => {
	const list: [string, React.ReactNode][] = [
		['站立', <Figure look={CAST.wald} pose={POSES.stand} />],
		['指向', <Figure look={CAST.wald} pose={POSES.point} expression="stern" />],
		['思考', <Figure look={CAST.wald} pose={POSES.think} reach={{near: SPOTS.chin}} expression="thinking" />],
		['讲解', <Figure look={CAST.wald} pose={POSES.present} expression="smile" />],
		['摊手', <Figure look={CAST.wald} pose={POSES.shrug} expression="worried" />],
		['惊退', <Figure look={CAST.wald} pose={POSES.recoil} expression="surprise" />],
		['行走', <Figure look={CAST.wald} pose={walkPose(1.3)} />],
		['背影', <Figure look={CAST.wald} pose={POSES.stand} facing="back" rim="warm" />],
	];
	return (
		<>
			<Floor />
			<Title sub="关节角度驱动 · 姿势之间用弹簧曲线过渡 · 背影用于叙事镜头">姿势库 · 瓦尔德</Title>
			{list.map(([label, node], i) => (
				<g key={label}>
					<g transform={`translate(${170 + i * 225}, 860) scale(1.45)`}>{node}</g>
					<Label x={170 + i * 225} y={940}>
						{label}
					</Label>
				</g>
			))}
		</>
	);
};

const FaceSheet: React.FC = () => {
	const ex: [Expression, string][] = [
		['neutral', '平静'],
		['smile', '微笑'],
		['surprise', '惊讶'],
		['worried', '担忧'],
		['stern', '严肃'],
		['thinking', '思考'],
	];
	return (
		<>
			<Floor />
			<Title sub="表情 = 眉毛角度 + 嘴型 · 自动眨眼 · 剪影模式带轮廓光">表情 · 剪影</Title>
			<defs>
				<clipPath id="bust-crop">
					<rect x={0} y={160} width={1920} height={430} />
				</clipPath>
			</defs>
			<g clipPath="url(#bust-crop)">
				{ex.map(([e], i) => (
					<g key={e} transform={`translate(${200 + i * 300}, ${1180}) scale(2.7)`}>
						<Figure look={i % 2 ? CAST.officer : CAST.wald} pose={POSES.stand} expression={e} rim="none" shadow={false} />
					</g>
				))}
			</g>
			{ex.map(([e, label], i) => (
				<Label key={e} x={215 + i * 300} y={630}>
					{label}
				</Label>
			))}
			{(
				[
					[CAST.officer, POSES.point, 'moon', 'side', false],
					[CAST.pilot, POSES.stand, 'warm', 'back', false],
					[CAST.mechanic, POSES.hold, 'moon', 'side', true],
					[CAST.wald, POSES.think, 'warm', 'side', false],
				] as const
			).map(([look, pose, rim, facing, flip], i) => (
				<g key={i} transform={`translate(${560 + i * 260}, 1040) scale(1.05)`}>
					<Figure look={look} pose={pose} silhouette={P.night0} rim={rim} facing={facing} flip={flip} reach={i === 3 ? {near: [22, -292]} : undefined} />
				</g>
			))}
			<Label x={300} y={900} size={28} color={P.paper}>
				剪影 + 轮廓光 →
			</Label>
		</>
	);
};

const CatSheet: React.FC<{f: number}> = ({f}) => {
	const poses: [CatPose, string][] = [
		['sit', '坐'],
		['walk', '走'],
		['fall', '坠落'],
		['right', '翻正'],
		['land', '落地'],
	];
	return (
		<>
			<Floor />
			<Title sub="同一配色与线条 · 坠楼故事需要的全部姿势 · 虚线版本 = 未被统计的猫">猫</Title>
			{poses.map(([p, label], i) => (
				<g key={p}>
					<g transform={`translate(${260 + i * 340}, 700) scale(1.8)`}>
						<Cat pose={p} tail={0.5} />
					</g>
					<Label x={260 + i * 340} y={790}>
						{label}
					</Label>
				</g>
			))}
			<g transform="translate(960, 960) scale(1.2)">
				<Cat pose="sit" ghost />
			</g>
		</>
	);
};

const B17Sheet: React.FC<{f: number}> = ({f}) => {
	const dmg = [
		{x: 120, y: -20}, {x: 60, y: 10}, {x: -40, y: -30}, {x: -200, y: 20}, {x: -260, y: -10}, {x: -380, y: -150}, {x: -330, y: -70}, {x: 20, y: 30},
	];
	return (
		<>
			<Floor />
			<Title sub="B-17F · 1943 · 橄榄绿上表面 / 中性灰下表面 · 星杠徽 · 弹孔贴花 · 螺旋桨可转动">主角道具 · 空中堡垒</Title>
			<g transform="translate(560, 520) scale(0.9)">
				<B17Side prop={f * 0.9} damage={dmg} />
			</g>
			<g transform="translate(1500, 640) scale(0.62)">
				<B17Top prop={f * 0.9} damage={[{x: 0, y: 40}, {x: -200, y: -10}, {x: 180, y: 0}, {x: 10, y: 220}, {x: -60, y: 260}]} />
			</g>
			<g transform="translate(1500, 640) scale(0.62)" opacity={0}>
				<B17Top ghost={P.red} />
			</g>
			<Label x={560} y={800}>侧视 · 带弹孔</Label>
			<Label x={1500} y={1010}>俯视</Label>
		</>
	);
};

const AirfieldSheet: React.FC<{f: number}> = ({f}) => (
	<>
		<Airfield frame={f * 7}>
			<g transform="translate(1000, 860) scale(0.86)">
				<B17Side prop={1.2} damage={[{x: 120, y: -20}, {x: -40, y: -30}, {x: -200, y: 20}, {x: -330, y: -70}]} lights gear />
			</g>
			<g transform="translate(700, 989) scale(0.3)">
				<Figure look={CAST.mechanic} pose={POSES.point} reach={{near: [150, -300]}} expression="surprise" rim="warm" />
			</g>
			<g transform="translate(640, 989) scale(0.3)">
				<Figure look={CAST.officer} pose={POSES.hold} expression="stern" rim="warm" />
			</g>
			<g transform="translate(1260, 989) scale(0.3)">
				<Figure look={CAST.pilot} pose={POSES.stand} rim="warm" flip />
			</g>
		</Airfield>
		<rect x={0} y={0} width={1920} height={150} fill="url(#fog)" opacity={0} />
		<g>
			<rect x={60} y={50} width={760} height={100} rx={12} fill="rgba(7,10,20,0.6)" />
			<Title sub="分层视差：天空 · 树林 · 塔台与营房 · 跑道灯 · 主角层 · 前景雾">布景 · 1943 英国轰炸机基地</Title>
		</g>
	</>
);

export const Gallery: React.FC = () => {
	loadEpisodeFonts('survivorship');
	const f = useCurrentFrame();
	const sheet = SHEETS[f % SHEETS.length];
	return (
		<AbsoluteFill style={{background: P.night0}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				<Materials />
				{sheet === 'palette' ? <PaletteSheet /> : null}
				{sheet === 'cast' ? <CastSheet f={f} /> : null}
				{sheet === 'poses' ? <PoseSheet /> : null}
				{sheet === 'faces' ? <FaceSheet /> : null}
				{sheet === 'cat' ? <CatSheet f={f} /> : null}
				{sheet === 'b17' ? <B17Sheet f={f} /> : null}
				{sheet === 'airfield' ? <AirfieldSheet f={f} /> : null}
			</svg>
		</AbsoluteFill>
	);
};
