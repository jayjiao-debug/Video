import React from 'react';
import {AbsoluteFill, random, useVideoConfig} from 'remotion';
import {Materials} from '../../src/art/materials';
import {SerialPlate, TANK_DEFS} from '../../src/art/Tank';
import {JUNO} from '../../src/brand/identity';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {color, font} from '../../src/lib/theme';

/**
 * Douyin covers for 《德国坦克问题》: a wall of serial plates, plate 82731 lit, one
 * bold hook line, and the three numbers that pay it off. Same art as the video.
 * Wide 4:3 (1440×1080) and tall 3:4 (1080×1440).
 */
export const TanksCover: React.FC<{layout: 'wide' | 'tall'}> = ({layout}) => {
	loadEpisodeFonts('tanks');
	const {width: W, height: H} = useVideoConfig();
	const tall = layout === 'tall';
	const plates = Array.from({length: 48}, (_, i) => ({
		x: (i % 8) * 250 - 120 + (Math.floor(i / 8) % 2) * 120,
		y: Math.floor(i / 8) * 270 - 60,
		r: (random(`cr${i}`) - 0.5) * 8,
		n: String(82600 + Math.floor(random(`cn${i}`) * 560)),
	}));
	const hero = tall ? {x: 540, y: 800, s: 1.15} : {x: 1060, y: 760, s: 0.88};
	const headSize = tall ? 112 : 104;
	return (
		<AbsoluteFill style={{background: '#06070b'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<Materials />
				<TANK_DEFS />
				<defs>
					<radialGradient id="cv-vig" cx="50%" cy="50%" r="70%">
						<stop offset="0.3" stopColor="#000" stopOpacity="0" />
						<stop offset="1" stopColor="#000" stopOpacity="0.92" />
					</radialGradient>
					<linearGradient id="cv-gold" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#fff1c4" />
						<stop offset="0.5" stopColor="#f1c56d" />
						<stop offset="1" stopColor="#b47e2e" />
					</linearGradient>
				</defs>
				{/* the wall of numbers */}
				<g opacity={0.32}>
					{plates.map((p, i) => (
						<g key={i} transform={`translate(${p.x},${p.y}) scale(0.34) rotate(${p.r})`}>
							<SerialPlate serial={p.n} torch={0.5} />
						</g>
					))}
				</g>
				<rect width={W} height={H} fill="url(#cv-vig)" />
				<ellipse cx={hero.x} cy={hero.y} rx={560} ry={340} fill="url(#glow-lamp)" opacity={0.75} />
				<g transform={`translate(${hero.x},${hero.y}) scale(${hero.s}) rotate(-4)`}>
					<SerialPlate serial="82731" torch={1} />
				</g>
			</svg>
			{/* type */}
			<div style={{position: 'absolute', left: tall ? 0 : 80, right: tall ? 0 : undefined, top: tall ? 120 : 90, textAlign: tall ? 'center' : 'left'}}>
				<div style={{fontFamily: font.sans, fontWeight: 700, fontSize: 34, letterSpacing: '0.3em', color: color.gold}}>二战真实案例 · 统计学</div>
				<div style={{fontFamily: font.serif, fontWeight: 900, fontSize: headSize, lineHeight: 1.18, color: '#fff7e6', marginTop: 24, textShadow: '0 6px 30px rgba(0,0,0,0.9)'}}>
					只看几个<span style={{color: color.gold}}>编号</span>
					<br />
					能算出德军
					{tall ? <br /> : null}
					造了<span style={{color: color.gold}}>多少坦克</span>？
				</div>
			</div>
			<div style={{position: 'absolute', left: tall ? 0 : 80, right: tall ? 0 : undefined, top: tall ? 1080 : 470, display: 'flex', justifyContent: tall ? 'center' : 'flex-start', gap: tall ? 40 : 56}}>
				{(
					[
						['情报估计', '1550', color.red, true],
						['编号推算', '327', color.gold, false],
						['真实档案', '342', '#f3ede2', false],
					] as [string, string, string, boolean][]
				).map(([label, n, c, wrong]) => (
					<div key={label} style={{textAlign: 'center', position: 'relative'}}>
						<div style={{fontFamily: font.latin, fontWeight: 700, fontSize: tall ? 112 : 104, lineHeight: 1, color: c, textShadow: '0 4px 24px rgba(0,0,0,0.9)'}}>{n}</div>
						<div style={{fontFamily: font.sans, fontWeight: 700, fontSize: 30, letterSpacing: '0.15em', color: c, marginTop: 10}}>{label}</div>
						{wrong ? (
							<div style={{position: 'absolute', left: -10, right: -10, top: 52, height: 8, background: '#fff4dc', transform: 'rotate(-12deg)', opacity: 0.9, borderRadius: 4}} />
						) : null}
					</div>
				))}
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: tall ? 60 : 36, textAlign: 'center', fontFamily: font.serif, fontWeight: 900, fontSize: 40, letterSpacing: '0.1em', color: color.gold}}>
				《德国坦克问题》
				<span style={{fontFamily: font.sans, fontWeight: 500, fontSize: 22, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.6)', marginLeft: 24}}>{`◆ ${JUNO.mark}`}</span>
			</div>
		</AbsoluteFill>
	);
};
