import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {Sub} from '../ep27/kit27';
import {JUNO} from '../brand/identity';
import {CatLying} from './paper28';
import {W, H, SANS, SERIF, P, Table, PaperDefs, Cat, Rhino, Fly, Human, Ape, Dog, Chicken, Lizard, Frog, Fish, Octopus, Bee, Worm, Jelly, Mushroom, Robe, Hippo, Lab, Tag, Brush} from './paper28';

const Mark = () => <div style={{position: 'absolute', top: 40, right: 56, opacity: 0.6, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: P.cream}}>{JUNO.mark}</div>;
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} style={{position: 'absolute', inset: 0}}><PaperDefs />{children}</svg>;
const mixHex = (a: string, b: string, k: number) => {
	const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const A = p(a), B = p(b);
	return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
const floorShadow = (x: number, y: number, rx: number, o = 0.28) => <ellipse cx={x} cy={y + 4} rx={rx} ry={rx * 0.12} fill="#2a1a16" opacity={o} />;

/* the ruler of 14 cut-outs, from "like us" to "not like us" */
const RULER: [React.FC<any>, number][] = [[Human, 1.0], [Ape, 1.1], [Dog, 1.1], [Cat, 1.05], [Chicken, 1.15], [Lizard, 1.0], [Fish, 1.25], [Octopus, 1.15], [Bee, 1.6], [Fly, 1.7], [Worm, 1.3], [Jelly, 1.25]];
const Ruler: React.FC<{lit: number}> = ({lit}) => {
	const x0 = 200, x1 = 1740, y = 700;
	return (
		<g>
			<g filter="url(#cutShadow)"><rect x={110} y={y + 6} width={1720} height={64} rx={6} fill={P.cream} /></g>
			{Array.from({length: 69}, (_, i) => <line key={i} x1={130 + i * 24.8} x2={130 + i * 24.8} y1={y + 8} y2={y + (i % 5 ? 24 : 40)} stroke={P.ink} strokeWidth={i % 5 ? 2 : 3} opacity={0.6} />)}
			{RULER.map(([C, s], i) => {
				const x = x0 + ((x1 - x0) * i) / (RULER.length - 1);
				const k = Math.max(0, Math.min(1, (x - lit) / 380));
				return <React.Fragment key={i}>{floorShadow(x, y, 40 * s + 10, 0.3 * (1 - k))}<C x={x} y={y} s={s} f={mixHex(P.cut, P.cutDim, k)} o={1 - 0.35 * k} /></React.Fragment>;
			})}
		</g>
	);
};

const K1: React.FC = () => (
	<AbsoluteFill>
		<Table pools={[[930, 640, 760, 440, 1]]}>
			{floorShadow(930, 780, 300, 0.35)}
			<Rhino x={900} y={780} s={2.1} />
			<Tag x={1490} y={330} rot={2}>苏丹 · 45岁</Tag>
			<Tag x={420} y={300} size={40}>2018 · 肯尼亚</Tag>
		</Table>
		<Sub t="最后一只雄性北方白犀牛死了" /><Mark />
	</AbsoluteFill>
);

const Trio: React.FC<{dim?: number; tags?: boolean}> = ({dim = 0, tags = true}) => (
	<Table pools={[[1360, 680, 560, 360, 1 - dim * 0.4], [830, 720, 250, 170, 0.75 - dim * 0.3], [400, 740, 120, 70, 0.45]]}>
		{floorShadow(1380, 770, 200)}{floorShadow(830, 770, 70)}
		<Fly x={400} y={772} s={2.2} f={P.cutDim} o={0.95} />
		<Cat x={830} y={772} s={1.7} />
		<Rhino x={1360} y={772} s={1.45} />
		{tags && <><Tag x={400} y={620} size={40} rot={-3} bg="#8a8296">苍蝇</Tag>
		<Tag x={830} y={500} size={44}>猫</Tag>
		<Tag x={1400} y={420} size={48} rot={2}>犀牛</Tag></>}
	</Table>
);
const K2: React.FC = () => (<AbsoluteFill><Trio /><Sub t="苍蝇、猫、犀牛" /><Mark /></AbsoluteFill>);
const K3: React.FC = () => (
	<AbsoluteFill>
		<Trio dim={1} tags={false} />
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 900px 330px at 50% 38%, rgba(30,24,36,0.62), rgba(30,24,36,0) 100%)'}} />
		<div style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center'}}>
			<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.4em', color: JUNO.colors.gold}}>{JUNO.series}</div>
			<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 168, color: P.cream, letterSpacing: '0.06em', marginTop: 10, textShadow: '0 6px 30px rgba(20,12,16,0.6)'}}>生命平等吗？</div>
		</div>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}><Brush d="M 660 560 Q 960 584 1270 552" w={10} /></svg>
		<Mark />
	</AbsoluteFill>
);

const K4: React.FC = () => (
	<AbsoluteFill>
		<Table pools={[[420, 680, 900, 520, 1]]}>
			<Ruler lit={620} />
			<Lab x={200} y={850} size={52}>像我们</Lab>
			<Lab x={1700} y={850} size={52} col={P.cream} o={0.9}>不像我们</Lab>
			<Brush d="M 340 832 L 1520 832" w={7} col={P.ink} o={0.4} dash="2 18" />
			<Tag x={560} y={300} size={46} rot={-2}>52种生物 · 3500多人选</Tag>
		</Table>
		<Sub t="和人类越近，越被同情" /><Mark />
	</AbsoluteFill>
);

const K5: React.FC = () => (
	<AbsoluteFill>
		<Table pools={[[940, 470, 640, 330, 1], [1560, 200, 150, 150, 0.7]]}>
			{/* water */}
			{[0, 1, 2, 3].map((i) => <rect key={i} x={0} y={640 + i * 70} width={W} height={70} fill={P.water} opacity={0.35 + i * 0.12} />)}
			{[[300, 700], [620, 760], [1200, 720], [1500, 790], [880, 820]].map(([x, y], i) => <path key={i} d={`M ${x - 70} ${y} q 35 -10 70 0 t 70 0`} fill="none" stroke={P.cream} strokeWidth={3} opacity={0.45} />)}
			<Fish x={720} y={830} s={1.5} f={P.gold} /><Fish x={1180} y={880} s={1.2} f={P.cream} flip /><Fish x={520} y={900} s={1.0} f={P.gold} o={0.8} />
			{/* bridge */}
			<g filter="url(#cutShadow)" fill={P.cut}>
				<path d="M 160 640 Q 940 330 1720 640 L 1720 680 Q 940 380 160 680 Z" />
				{Array.from({length: 12}, (_, i) => { const x = 360 + i * 105; const t = (x - 160) / 1560, deck = 640 - 620 * t * (1 - t); const t2 = (x - 300) / 1280, rail = 528 - 580 * t2 * (1 - t2); return <rect key={i} x={x - 5} y={rail} width={10} height={deck - rail + 4} />; })}
				<path d="M 300 590 Q 940 300 1580 590" fill="none" stroke={P.cut} strokeWidth={8} transform="translate(0 -62)" />
			</g>
			<Robe x={830} y={490} s={1.15} point />
			<Robe x={1070} y={491} s={1.15} flip />
			<Tag x={800} y={250} size={44} rot={-3}>庄子</Tag>
			<Tag x={1100} y={250} size={44} rot={2}>惠子</Tag>
		</Table>
		<Sub t="他说：鱼真快乐" /><Mark />
	</AbsoluteFill>
);

const K6: React.FC = () => (
	<AbsoluteFill>
		<Table pools={[[700, 660, 1080, 560, 1]]}>
			<Ruler lit={1200} />
			<Brush d="M 268 260 L 272 800" w={9} o={0.4} dash="26 18" />
			<Tag x={330} y={220} size={42} rot={-2} bg="#d8cbb4">康德：会思考</Tag>
			<Brush d="M 1260 250 Q 1264 520 1256 810" w={14} />
			<Tag x={1260} y={210} size={48} rot={2}>边沁：会不会痛</Tag>
		</Table>
		<Sub t="而是：它会不会痛苦" /><Mark />
	</AbsoluteFill>
);

const K7: React.FC = () => (
	<AbsoluteFill style={{background: 'linear-gradient(180deg, #4a3a5a 0%, #b4646a 38%, #f0a35e 56%, #f6c27a 60%, #6c5a70 61%, #46405a 100%)'}}>
		<Svg>
			<circle cx={1250} cy={560} r={120} fill="#ffd89a" opacity={0.95} />
			<path d="M 0 600 Q 200 520 420 570 T 820 560 T 1240 590 T 1920 560 L 1920 660 L 0 660 Z" fill="#3e2c3e" />
			<path d="M 0 640 Q 300 600 640 630 T 1300 620 T 1920 640 L 1920 662 L 0 662 Z" fill="#2e2232" />
			{Array.from({length: 14}, (_, i) => <rect key={i} x={1060 + (i % 4) * 30 - i * 6} y={690 + i * 22} width={300 - i * 14} height={5} fill="#ffd89a" opacity={0.5 - i * 0.03} />)}
			<Hippo x={420} y={760} s={1.1} /><Hippo x={690} y={840} s={1.3} flip /><Hippo x={1500} y={800} s={1.2} /><Hippo x={1720} y={900} s={0.9} flip />
			<g filter="url(#cutShadow)" fill={P.cut}>
				<path d="M 760 760 Q 1000 800 1240 752 L 1222 784 Q 1000 822 780 790 Z" />
			</g>
			<Robe x={900} y={778} s={0.62} /><Robe x={1010} y={782} s={0.7} /><Robe x={1110} y={776} s={0.62} flip />
			{Array.from({length: 40}, (_, i) => <circle key={i} cx={(i * 397) % W} cy={80 + ((i * 131) % 420)} r={2 + (i % 3)} fill="#ffe7c0" opacity={0.25} />)}
			<rect width={W} height={H} filter="url(#fiber)" opacity={0.5} style={{mixBlendMode: 'multiply'}} />
			<rect width={W} height={H} filter="url(#grain)" opacity={0.2} style={{mixBlendMode: 'multiply'}} />
			<Tag x={430} y={230} size={42} rot={-2}>1915 · 非洲 · 奥果韦河</Tag>
		</Svg>
		<Sub t="船穿过一群河马" /><Mark />
	</AbsoluteFill>
);

const RINGS = ['家人', '阶层', '国家', '全人类', '动物'];
const K8: React.FC = () => {
	const cx = 960, cy = 500, sq = 0.6;
	const R = (i: number) => 130 + i * 112;
	return (
		<AbsoluteFill>
			<Table pools={[[cx, cy, 900, 520, 1]]}>
				{RINGS.map((name, i) => {
					const r = R(i), last = i === RINGS.length - 1;
					return last
						? <g key={i}><ellipse cx={cx} cy={cy} rx={r} ry={r * sq} fill="none" stroke={P.red} strokeWidth={10} strokeLinecap="round" pathLength={100} strokeDasharray="78 100" strokeDashoffset={-30} opacity={0.9} /></g>
						: <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * sq} fill="none" stroke={P.ink} strokeWidth={4} opacity={0.5} />;
				})}
				{/* people fill the inner rings, animals stand in the outer band */}
				<Human x={cx} y={cy + 40} s={0.5} />
				<Human x={cx - 190} y={cy + 70} s={0.4} /><Human x={cx + 180} y={cy + 60} s={0.38} />
				<Human x={cx - 300} y={cy - 40} s={0.34} o={0.85} /><Human x={cx + 320} y={cy + 150} s={0.34} o={0.85} /><Human x={cx - 260} y={cy + 200} s={0.32} o={0.85} />
				<Human x={cx + 400} y={cy - 30} s={0.3} o={0.8} /><Human x={cx - 430} y={cy + 110} s={0.3} o={0.8} /><Human x={cx + 120} y={cy + 270} s={0.3} o={0.8} />
				<Cat x={cx - 590} y={cy + 120} s={0.9} /><Dog x={cx + 600} y={cy + 60} s={0.85} /><Chicken x={cx + 420} y={cy + 300} s={0.85} /><Fly x={cx - 520} y={cy - 150} s={1.4} /><Fish x={cx - 380} y={cy + 330} s={0.9} />
				{RINGS.map((name, i) => {
					const last = i === RINGS.length - 1;
					return <Tag key={name} x={cx + (i % 2 ? 16 : -16)} y={cy - R(i) * sq + 14} size={last ? 46 : 40} rot={i % 2 ? 2 : -2} bg={last ? P.cream : '#efdfc0'} col={last ? P.red : P.ink}>{name}</Tag>;
				})}
			</Table>
			<Sub t="后来是阶层、国家、全人类" /><Mark />
		</AbsoluteFill>
	);
};

const K9: React.FC = () => (
	<AbsoluteFill>
		<Table pools={[[960, 620, 1100, 560, 1]]}>
			{/* window: dusk sky panes behind the sill */}
			<g opacity={0.9}>
				<rect x={420} y={90} width={1080} height={560} fill="#3c4a66" />
				<rect x={420} y={90} width={1080} height={560} fill="url(#pool)" opacity={0.18} />
				{[0, 1, 2].map((i) => <rect key={i} x={420 + i * 360 + 354} y={90} width={14} height={560} fill={P.cut} />)}
				<rect x={420} y={360} width={1080} height={14} fill={P.cut} />
				<rect x={404} y={74} width={1112} height={576} fill="none" stroke={P.cut} strokeWidth={18} />
			</g>
			{Array.from({length: 18}, (_, i) => <circle key={i} cx={460 + ((i * 211) % 1000)} cy={120 + ((i * 97) % 220)} r={2 + (i % 2)} fill="#fff2d6" opacity={0.6} />)}
			<g filter="url(#cutShadow)"><rect x={300} y={650} width={1320} height={70} rx={6} fill="#e7cfa4" /><rect x={300} y={718} width={1320} height={22} fill="#b98d62" /></g>
			<Fly x={1080} y={706} s={2.4} />
			<Ellipse28 />
		</Table>
		<Sub t="而万物与我为一" /><Mark />
		<div style={{position: 'absolute', right: 140, bottom: 190, fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: P.ink, opacity: 0.8}}>——庄子</div>
	</AbsoluteFill>
);

const Ellipse28: React.FC = () => <ellipse cx={1092} cy={684} rx={110} ry={62} fill="none" stroke={P.red} strokeWidth={7} strokeLinecap="round" pathLength={100} strokeDasharray="88 100" opacity={0.85} />;

/* hook: a roadside at night, a cat lying still in a streetlamp's pool, headlights already gone */
const K0: React.FC = () => (
	<AbsoluteFill>
		<Table pools={[[1010, 720, 620, 300, 1]]}>
			<rect x={0} y={760} width={W} height={320} fill="#2e2a36" opacity={0.75} />
			<rect x={0} y={748} width={W} height={18} fill="#8d8378" opacity={0.85} />
			{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={80 + i * 400} y={900} width={200} height={12} fill={P.cream} opacity={0.35} />)}
			<g filter="url(#cutShadow)" fill={P.cut}><rect x={1452} y={150} width={16} height={600} /><path d="M 1460 160 Q 1440 120 1360 128 L 1330 140 L 1360 150 Q 1430 146 1452 170 Z" /></g>
			<path d="M 1340 150 L 1100 750 L 1560 750 Z" fill="#fff1cf" opacity={0.08} />
			{[0, 1, 2].map((i) => <rect key={i} x={-200 + i * 60} y={810 + i * 22} width={700 - i * 160} height={6} rx={3} fill="#ffe2b0" opacity={0.28 - i * 0.07} style={{filter: 'blur(3px)'}} />)}
			{floorShadow(1000, 748, 90, 0.35)}
			<CatLying x={990} y={748} s={1.5} />
		</Table>
		<Sub t="路边，一只猫被车撞了" /><Mark />
	</AbsoluteFill>
);

const KEYS = [K0, K1, K2, K3, K4, K5, K6, K7, K8, K9];
const Keys28: React.FC<{k: number}> = ({k}) => { const C = KEYS[k] ?? K1; return <C />; };
const Root: React.FC = () => <Composition id="KEYS28" component={Keys28} durationInFrames={1} fps={30} width={W} height={H} defaultProps={{k: 0}} />;
registerRoot(Root);
