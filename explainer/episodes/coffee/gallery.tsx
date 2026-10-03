import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Basket, Bean, Bee, Bokeh, Branch, BrassFilterPot, COFFEE_DEFS, CeramicCup, Cherry, CoffeeFlower, CoffeePot18, PaperCup, Steam} from '../../src/art/Coffee';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, walkPose} from '../../src/art/Figure';
import {Materials} from '../../src/art/materials';
import {P} from '../../src/art/palette';
import {CafeStreet} from '../../src/art/sets/CafeStreet';
import {CoffeeHouse} from '../../src/art/sets/CoffeeHouse';
import {Kitchen1908} from '../../src/art/sets/Kitchen1908';
import {Metro} from '../../src/art/sets/Metro';
import {Yunnan} from '../../src/art/sets/Yunnan';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {font} from '../../src/lib/theme';

/** 《续命》 model sheets, one per frame: COMPOSITION=CoffeeGallery node scripts/stills.mjs coffee out/gallery-coffee 0 1 … */
export const COFFEE_SHEETS = ['cast', 'props', 'metro', 'street', 'kitchen', 'london', 'leipzig', 'yunnan', 'macro'] as const;

const Title: React.FC<{children: React.ReactNode; sub?: string; dark?: boolean}> = ({children, sub, dark}) => (
	<g>
		<rect x={60} y={44} width={1100} height={110} rx={12} fill={dark ? 'rgba(10,8,6,0.55)' : 'rgba(10,8,6,0.35)'} />
		<text x={84} y={98} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 48, fill: P.gold}}>
			{children}
		</text>
		{sub ? (
			<text x={86} y={136} style={{fontFamily: font.sans, fontSize: 22, fill: '#efe6d6', letterSpacing: '0.1em'}}>
				{sub}
			</text>
		) : null}
	</g>
);

const Label: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => (
	<text x={x} y={y} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, fill: '#e9dfcc', letterSpacing: '0.08em'}}>
		{children}
	</text>
);

const cupInHand = (s = 0.16) => (
	<g transform={`translate(2,14) scale(${s})`}>
		<PaperCup />
	</g>
);

const Backdrop: React.FC = () => (
	<>
		<rect width={1920} height={1080} fill="#2a1f18" />
		<ellipse cx={960} cy={420} rx={900} ry={460} fill="url(#glow-lamp)" opacity={0.25} />
		<ellipse cx={960} cy={980} rx={1100} ry={110} fill="#1a130e" />
	</>
);

const CastSheet: React.FC = () => {
	const people: [keyof typeof CAST, string][] = [
		['commuter', '通勤的她'],
		['coworker', '同事'],
		['officegirl', '想多走一段路的人'],
		['melitta', '梅丽塔 · 1908'],
		['liesgen', '巴赫的「女儿」'],
		['schlendrian', '「父亲」'],
		['gentleman', '伦敦常客'],
		['merchant', '商人'],
		['farmer', '普洱咖啡农'],
		['farmerOld', '老咖啡农'],
	];
	return (
		<>
			<Backdrop />
			<Title sub="同一副骨架 · 新增：通勤装 / 马尾 / 长发 / 假发 + 三角帽 / 围裙 / 头巾 / 草帽">角色 · 《续命》</Title>
			{people.map(([k, label], i) => (
				<g key={k}>
					<g transform={`translate(${130 + i * 184}, 880) scale(1.32)`}>
						<Figure
							look={CAST[k]}
							pose={k === 'commuter' || k === 'coworker' ? POSES.hold : k === 'liesgen' ? POSES.present : k === 'gentleman' ? POSES.point : POSES.stand}
							holdNear={k === 'commuter' || k === 'coworker' ? cupInHand() : undefined}
							expression={k === 'liesgen' ? 'smile' : k === 'schlendrian' ? 'stern' : k === 'officegirl' ? 'smile' : 'neutral'}
							rim="warm"
						/>
					</g>
					<Label x={130 + i * 184} y={950}>
						{label}
					</Label>
				</g>
			))}
		</>
	);
};

const PropsSheet: React.FC<{f: number}> = ({f}) => (
	<>
		<Backdrop />
		<Title sub="外带杯（可倒流的热气）· 1908 铜罐滤器 · 生豆/熟豆 · 咖啡果与剖面 · 咖啡花 · 蜜蜂 · 背篓 · 18 世纪咖啡壶">道具 · 《续命》</Title>
		<g transform="translate(210,640)">
			<PaperCup mark="续命" />
			<g transform="translate(26,-222)">
				<Steam t={f * 3} height={180} />
			</g>
		</g>
		<g transform="translate(420,640)">
			<CeramicCup />
		</g>
		<g transform="translate(700,640) scale(0.95)">
			<BrassFilterPot drip={1} t={f * 3} />
		</g>
		<g transform="translate(960,500)">
			<Bean r={40} rot={-20} />
			<g transform="translate(110,0)">
				<Bean r={36} green rot={15} />
			</g>
		</g>
		<g transform="translate(1260,480)">
			<Cherry r={46} />
			<g transform="translate(150,0)">
				<Cherry r={46} cut={1} />
			</g>
		</g>
		<g transform="translate(1660,470)">
			<CoffeeFlower r={60} />
		</g>
		<g transform="translate(1060,820) scale(1.6)">
			<Bee flap={f * 3} />
		</g>
		<g transform="translate(1420,900)">
			<Basket fill={0.8} />
		</g>
		<g transform="translate(1720,900) scale(0.8)">
			<CoffeePot18 />
		</g>
		<g transform="translate(80,880) scale(0.9)">
			<Branch mode="flower" f={f} seed="g1" />
		</g>
		<Label x={210} y={690}>外带杯</Label>
		<Label x={420} y={690}>瓷杯</Label>
		<Label x={700} y={690}>1908 铜罐 + 吸墨纸</Label>
		<Label x={1015} y={590}>熟豆 / 生豆</Label>
		<Label x={1335} y={590}>咖啡果 · 剖开是两颗背靠背的豆</Label>
		<Label x={1660} y={580}>咖啡花</Label>
		<Label x={1060} y={940}>蜜蜂</Label>
		<Label x={1420} y={940}>竹背篓</Label>
		<Label x={1720} y={940}>18 世纪咖啡壶</Label>
	</>
);

export const CoffeeGallery: React.FC = () => {
	loadEpisodeFonts('coffee');
	const f = useCurrentFrame();
	const sheet = COFFEE_SHEETS[f % COFFEE_SHEETS.length];
	const t = 40 + f * 7;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				<Materials />
				<COFFEE_DEFS />
				{sheet === 'cast' ? <CastSheet /> : null}
				{sheet === 'props' ? <PropsSheet f={f} /> : null}
				{sheet === 'metro' ? (
					<>
						<Metro
							frame={t}
							travel={t * 12}
							crowd={
								<>
									{[300, 520, 1240, 1450].map((x, i) => (
										<g key={x} transform={`translate(${x}, 960) scale(1.25)`}>
											<Figure look={[CAST.coworker, CAST.officegirl, CAST.economist, CAST.clerk][i]} pose={POSES.hold} holdNear={i % 2 ? cupInHand() : undefined} flip={i % 2 === 1} rim="none" silhouette="#3a4250" shadow={false} />
										</g>
									))}
								</>
							}
						>
							<g transform="translate(900, 1040) scale(1.7)">
								<Figure look={CAST.commuter} pose={POSES.hold} reach={{near: [70, -250]}} holdNear={cupInHand(0.15)} expression="neutral" rim="warm" />
							</g>
						</Metro>
						<Title sub="早上八点 · 地上段 · 低角度晨光从窗外扫进车厢 · 窗外城市视差滑过 · 柱子掠过时车厢一暗 · 拉环摇晃">布景 · 早高峰地铁</Title>
					</>
				) : null}
				{sheet === 'street' ? (
					<>
						<CafeStreet t={t}>
							<g transform="translate(760, 1000) scale(1.5)">
								<Figure look={CAST.coworker} pose={walkPose(1.2, 0.8)} holdNear={cupInHand()} rim="warm" />
							</g>
							<g transform="translate(960, 1000) scale(1.5)">
								<Figure look={CAST.officegirl} pose={walkPose(2.8, 0.8)} holdNear={cupInHand()} expression="smile" rim="warm" />
							</g>
						</CafeStreet>
						<Title sub="下午三点 · 玻璃幕墙写字楼 · 绿白条纹遮阳篷的小咖啡店 · 梧桐树影在人行道上晃动">布景 · 写字楼楼下</Title>
					</>
				) : null}
				{sheet === 'kitchen' ? (
					<>
						<Kitchen1908
							t={t}
							table={
								<g transform="translate(1000, 860) scale(0.7)">
									<BrassFilterPot drip={1} t={t} />
								</g>
							}
						>
							<g transform="translate(740, 1060) scale(1.75)">
								<Figure look={CAST.melitta} pose={POSES.write} expression="thinking" rim="warm" shadow={false} />
							</g>
						</Kitchen1908>
						<Title sub="德累斯顿 · 晨光穿过蕾丝窗帘 · 白瓷砖墙 · 铸铁炉上水壶冒汽 · 光柱里的浮尘">布景 · 1908 梅丽塔的厨房</Title>
					</>
				) : null}
				{sheet === 'london' ? (
					<>
						<CoffeeHouse
							t={t}
							kind="london"
							table={
								<>
									{[700, 1000, 1300].map((x) => (
										<g key={x} transform={`translate(${x},866) scale(0.5)`}>
											<CeramicCup handle={false} />
										</g>
									))}
									<g transform="translate(1600,866) scale(0.6)">
										<CoffeePot18 />
									</g>
								</>
							}
						>
							{[
								['gentleman', 560, POSES.point, 'stern'],
								['merchant', 860, POSES.shrug, 'surprise'],
								['schlendrian', 1160, POSES.think, 'thinking'],
								['gentleman', 1460, POSES.present, 'smile'],
							].map(([k, x, pose, ex], i) => (
								<g key={i} transform={`translate(${x}, 1010) scale(1.5)`}>
									<Figure look={CAST[k as string]} pose={pose as typeof POSES.stand} expression={ex as 'stern'} flip={i % 2 === 1} rim="warm" shadow={false} />
								</g>
							))}
						</CoffeeHouse>
						<Title sub="1652 起 · 烛光 · 长桌 · 价目牌「COFFEE 1d」· 墙上告示 · 烟斗的烟 · 吵成一团的常客">布景 · 伦敦「一便士大学」</Title>
					</>
				) : null}
				{sheet === 'leipzig' ? (
					<>
						<CoffeeHouse t={t} kind="leipzig">
							<g transform="translate(1180, 1010) scale(1.6)">
								<Figure look={CAST.liesgen} pose={POSES.present} expression="smile" rim="warm" shadow={false} />
							</g>
							<g transform="translate(1520, 1010) scale(1.6)">
								<Figure look={CAST.schlendrian} pose={POSES.point} expression="stern" flip rim="warm" shadow={false} />
							</g>
						</CoffeeHouse>
						<Title sub="1730 年代 · 齐默尔曼咖啡馆 · 大键琴与谱架 · 女儿唱、父亲气">布景 · 莱比锡 · 巴赫的咖啡馆</Title>
					</>
				) : null}
				{sheet === 'yunnan' ? (
					<>
						<Yunnan
							t={t}
							season="harvest"
							front={
								<g transform="translate(1500, 1120) rotate(-160)">
									<Branch mode="cherry" f={t} seed="yf" len={600} />
								</g>
							}
						>
							<g transform="translate(820, 1000) scale(1.5)">
								<Figure look={CAST.farmer} pose={POSES.hold} reach={{near: [120, -280]}} expression="smile" rim="warm" />
								<g transform="translate(-40,-120) scale(0.7)">
									<Basket fill={0.6} />
								</g>
							</g>
						</Yunnan>
						<Title sub="普洱 · 黎明 · 层层山脊和谷里的雾 · 梯田上的咖啡树 · 冬天采红果 / 春天开白花">布景 · 云南的山</Title>
					</>
				) : null}
				{sheet === 'macro' ? (
					<>
						<rect width={1920} height={1080} fill="#3a4a2e" />
						<Bokeh f={t} n={34} />
						<g transform="translate(200,760) rotate(-12) scale(1.8)">
							<Branch mode="flower" f={t} seed="mf" len={700} />
						</g>
						<g transform="translate(1240,430) scale(3)">
							<Bee flap={t} />
						</g>
						<Title sub="微距 · 柔焦光斑 · 白色咖啡花 · 蜜蜂翅膀高速扇动 · 一点金光的花蜜" dark>
							布景 · 花与蜜蜂
						</Title>
					</>
				) : null}
			</svg>
		</AbsoluteFill>
	);
};
