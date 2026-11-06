import React from 'react';
import {PAL, sp, poly} from '../qq60/geo60';
import {FC, F_SERIF, rng, PIC_T, PIC_B} from '../qq60/frame60';
import {Throne, Balance, WingedSun, featherD} from '../qq60/props60';
import {God61, P61, headPt} from './cast61';
import {FamilyTree61, NodeId, LIT, FOCUS, NODES, TW} from './tree61';
import {POSES} from '../qq60/rig60';

/* ep61 · the 22 shots of the storyboard. Each `Scene` draws the KEY FRAME of its shot (the frame where the animation beat peaks)
   inside the picture window (y 40–932); the board shell adds the bands, the subtitle, the shot label and the tree chip. */
export const GY = 868, CX = 720, MID = (PIC_T + PIC_B) / 2;
/** tree space x of the tree's visual centre (Thoth … daughters), used to centre it on screen */
const TCX = 568;
export type Shot = {n: number; t0: number; t1: number; lines: string; text: string; size: 'wide' | 'medium' | 'close'; cam: string; beat: string; chip?: boolean; scene: React.FC};

/* ---------- small shared pieces ---------- */
const Bg: React.FC<{a: string; b: string}> = ({a, b}) => <><defs><linearGradient id={`bg-${a.slice(1)}${b.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
	<rect x={0} y={PIC_T} width={1440} height={PIC_B - PIC_T} fill={`url(#bg-${a.slice(1)}${b.slice(1)})`} /></>;
const Ground: React.FC<{y?: number; c?: string; c2?: string}> = ({y = GY, c = PAL.mat, c2 = PAL.mat2}) => <g><rect x={0} y={y} width={1440} height={PIC_B - y} fill={c} /><rect x={0} y={y} width={1440} height={6} fill={c2} /></g>;
const Label: React.FC<{x: number; y: number; t: string; size?: number; c?: string; o?: string}> = ({x, y, t, size = 30, c = FC.cream, o = '#18224A'}) => <text x={x} y={y} textAnchor="middle" fontSize={size} fontFamily={F_SERIF} fontWeight={900} fill={c} stroke={o} strokeWidth={7} paintOrder="stroke">{t}</text>;
const Disc: React.FC<{x: number; y: number; r: number; c?: string}> = ({x, y, r, c = PAL.red}) => <g><circle cx={x} cy={y} r={r + 5} fill={PAL.ink} /><circle cx={x} cy={y} r={r} fill={c} /><circle cx={x} cy={y} r={r * 0.78} fill="none" stroke={PAL.gold} strokeWidth={Math.max(3, r * 0.06)} /></g>;
const Rays: React.FC<{x: number; y: number; r0: number; r1: number; n?: number; c?: string; o?: number}> = ({x, y, r0, r1, n = 24, c = PAL.goldHi, o = 0.8}) => <g opacity={o}>{Array.from({length: n}, (_, i) => { const a = (i / n) * Math.PI * 2, w = 0.06; return <path key={i} d={poly([[x + Math.cos(a - w) * r0, y + Math.sin(a - w) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1], [x + Math.cos(a + w) * r0, y + Math.sin(a + w) * r0]])} fill={c} />; })}</g>;
const Stars: React.FC<{box: [number, number, number, number]; n?: number; seed?: number; c?: string; r?: number}> = ({box, n = 60, seed = 3, c = PAL.star, r = 4}) => { const R = rng(seed);
	return <g>{Array.from({length: n}, (_, i) => { const x = box[0] + R() * (box[2] - box[0]), y = box[1] + R() * (box[3] - box[1]), q = r * (0.5 + R()); return <path key={i} d={`M${x} ${y - q}L${x + q * 0.3} ${y - q * 0.3}L${x + q} ${y}L${x + q * 0.3} ${y + q * 0.3}L${x} ${y + q}L${x - q * 0.3} ${y + q * 0.3}L${x - q} ${y}L${x - q * 0.3} ${y - q * 0.3}Z`} fill={c} />; })}</g>; };
/** sound rings from a mouth (visual cue for a roar / cry), dir = +1 right, -1 left */
const Rings: React.FC<{x: number; y: number; dir?: 1 | -1; n?: number; c?: string; r0?: number}> = ({x, y, dir = 1, n = 4, c = FC.cream, r0 = 40}) => <g fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" opacity={0.9}>
	{Array.from({length: n}, (_, i) => { const r = r0 + i * 38; return <path key={i} d={`M${x + dir * r * Math.cos(0.9)} ${y - r * Math.sin(0.9)}A${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x + dir * r * Math.cos(0.9)} ${y + r * Math.sin(0.9)}`} opacity={1 - i * 0.2} />; })}</g>;
const Mist: React.FC<{x: number; y: number; dx: number; dy: number; r?: number; c?: string}> = ({x, y, dx, dy, r = 38, c = PAL.goldHi}) => <g opacity={0.9}>{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={x + dx * i / 4} cy={y + dy * i / 4 + Math.sin(i * 1.9) * 12} r={r * (0.5 + i * 0.22)} fill={c} opacity={0.75 - i * 0.1} />)}</g>;
const Wave: React.FC<{y: number; c: string; amp?: number; x0?: number; x1?: number}> = ({y, c, amp = 10, x0 = 0, x1 = 1440}) => <path d={`M${x0} ${y}${Array.from({length: Math.round((x1 - x0) / 60)}, (_, i) => `q30 ${i % 2 ? amp : -amp} 60 0`).join('')}`} fill="none" stroke={c} strokeWidth={5} strokeLinecap="round" />;
const Silh: React.FC<{x: number; y: number; s: number; k?: number; c?: string}> = ({x, y, s, k = 0, c = PAL.ink}) => <g transform={`translate(${x},${y}) scale(${s})`} fill={c}>
	<path d={poly([[-0.9, 0], [0.9, 0], [0.7, -4], [-0.7, -4]])} /><circle cx={0} cy={-5} r={0.85} />
	{k % 4 === 0 && <path d={poly([[-0.4, -5.7], [0.3, -7.2], [0.6, -5.7]])} />}{k % 4 === 1 && <path d={poly([[-0.9, -5], [-0.6, -6.3], [0, -5.7], [0.6, -6.3], [0.9, -5]])} />}
	{k % 4 === 2 && <rect x={0.2} y={-6.6} width={0.28} height={1.6} />}{k % 4 === 3 && <path d={poly([[0.2, -5.4], [1.8, -5.1], [0.5, -4.6]])} />}</g>;
const Calendar: React.FC<{x: number; y: number; r: number; done: number; gold?: number; fives?: boolean}> = ({x, y, r, done, gold = 0, fives}) => <g>
	<circle cx={x} cy={y} r={r + 26} fill={PAL.ink} /><circle cx={x} cy={y} r={r + 20} fill={FC.lapis} stroke={PAL.gold} strokeWidth={4} />
	<circle cx={x} cy={y} r={r} fill="none" stroke={PAL.linen} strokeWidth={24} pathLength={360} strokeDasharray="0.8 0.2" />
	<circle cx={x} cy={y} r={r} fill="none" stroke={PAL.red} strokeWidth={24} pathLength={360} strokeDasharray={`${done * 0.8} 360`} transform={`rotate(-90 ${x} ${y})`} />
	{fives && <g><circle cx={x} cy={y} r={r} fill="none" stroke={PAL.goldHi} strokeWidth={70} pathLength={360} strokeDasharray="12 348" strokeDashoffset={-354} opacity={0.5} transform={`rotate(-90 ${x} ${y})`} /><circle cx={x} cy={y} r={r} fill="none" stroke={PAL.gold} strokeWidth={40} pathLength={360} strokeDasharray="12 348" strokeDashoffset={-354} transform={`rotate(-90 ${x} ${y})`} /></g>}
	{gold > 0 && <circle cx={x} cy={y} r={r * 0.7} fill={PAL.gold} opacity={0.15 * gold} />}</g>;

/* ============================== the 22 key frames ============================== */
const S1: React.FC = () => { const R = rng(7); return <g>
	<Bg a="#E8D4AA" b="#D3B98A" />
	{[0, 1, 2, 3, 4].map((row) => <g key={row}><rect x={0} y={150 + row * 160} width={1440} height={5} fill={PAL.blue} opacity={0.7} />
		{Array.from({length: 26}, (_, i) => <Silh key={i} x={30 + i * 56 + (row % 2) * 24} y={142 + row * 160} s={11 + R() * 3} k={Math.floor(R() * 4)} c="#4A3626" />)}</g>)}
	<rect x={0} y={PIC_T} width={1440} height={PIC_B - PIC_T} fill={FC.lapis2} opacity={0.72} /><Disc x={CX} y={MID + 30} r={420} c="#E8B64A" /><circle cx={CX} cy={MID + 30} r={410} fill={FC.lapis2} opacity={0.9} />
	<g transform={`translate(${CX - TCX * 0.78},${MID - 270}) scale(0.78)`}><FamilyTree61 lit={[]} labels={false} icons={false} cid="s1" skeleton /></g>
	<Label x={CX} y={110} t="1500 多位神" size={56} c={PAL.goldHi} /></g>; };

const S2: React.FC = () => <g>
	<Bg a="#0E1538" b="#1D2E6E" /><Stars box={[0, 60, 1440, 360]} seed={5} n={40} />
	<rect x={0} y={640} width={1440} height={292} fill="#0B1230" />
	{[660, 700, 740, 780, 820, 860, 900].map((y, i) => <Wave key={y} y={y} c={i % 2 ? '#2E58A6' : '#3F75BC'} amp={9 + i} />)}
	<path d={sp([[420, 720, 1], [520, 660], [640, 610], [720, 598], [800, 610], [920, 660], [1020, 720, 1]])} fill={PAL.mat} stroke={PAL.ink} strokeWidth={5} />
	<path d={sp([[540, 705], [700, 684], [900, 705]], false)} fill="none" stroke={PAL.mat2} strokeWidth={6} />
	<God61 id="s2" who="atum" pose={P61.rest()} x={CX} y={606} s={21} />
	<Label x={CX} y={810} t="努恩 · 黑水" size={34} c="#9DB6F2" /></g>;

const S3: React.FC = () => <g>
	<Bg a="#F2C27A" b="#E8D4AA" /><Rays x={CX} y={440} r0={250} r1={420} n={28} c="#F8D97A" o={0.55} /><Disc x={CX} y={440} r={235} />
	<Ground c="#C49A55" />
	<God61 id="s3a" who="atum" pose={P61.rest()} x={440} y={GY} s={29} />
	<God61 id="s3b" who="ra" pose={P61.rest()} x={1000} y={GY} s={29} face={-1} />
	<Label x={CX} y={470} t="=" size={90} c={PAL.goldHi} />
	<Mist x={headPt('atum', P61.rest(), 470, GY, 29, 1, [1.6, -0.3])[0]} y={headPt('atum', P61.rest(), 470, GY, 29, 1, [1.6, -0.3])[1]} dx={110} dy={-10} r={16} /></g>;

const S4: React.FC = () => <g>
	<Bg a="#E9D8AE" b="#D9C08E" /><Mist x={560} y={380} dx={-260} dy={-60} r={50} /><Mist x={880} y={380} dx={260} dy={-60} r={50} />
	<Ground c="#C49A55" />
	<God61 id="s4a" who="shu" pose={P61.rest()} x={470} y={GY} s={30} />
	<Path wind />
	<God61 id="s4b" who="tefnut" pose={P61.roar()} x={960} y={GY} s={30} face={-1} roar={1} />
	<Rings x={headPt('tefnut', P61.roar(), 960, GY, 30, -1, [2.3, -0.3])[0]} y={headPt('tefnut', P61.roar(), 960, GY, 30, -1, [2.3, -0.3])[1]} dir={-1} />
	<Label x={470} y={GY + 50} t="舒 · 空气" size={34} /><Label x={960} y={GY + 50} t="泰芙努特 · 湿气" size={34} /></g>;
/* wind lines around Shu */
const Path: React.FC<{wind?: boolean}> = () => <g fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.85}>
	{[300, 380, 460, 540].map((y, i) => <path key={y} d={`M${250 + i * 20} ${y}q60 -26 120 0t120 0`} />)}</g>;

export const NutArch: React.FC<{cx: number; gy: number; span: number; h: number; w?: number; seed?: number}> = ({cx, gy, span, h, w = 66, seed = 4}) => {
	const x0 = cx - span / 2, x1 = cx + span / 2, d = `M${x0} ${gy}Q${cx} ${gy - 2 * h} ${x1} ${gy}`, R = rng(seed);
	const pt = (u: number): [number, number] => [(1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) ** 2 * gy + 2 * (1 - u) * u * (gy - 2 * h) + u * u * gy];
	return <g>
		<path d={d} fill="none" stroke={PAL.ink} strokeWidth={w + 10} strokeLinecap="round" /><path d={d} fill="none" stroke="#1D2E6E" strokeWidth={w} strokeLinecap="round" />
		{Array.from({length: 46}, (_, i) => { const u = 0.03 + i / 48, p = pt(u), q = 5 + R() * 4; return <path key={i} d={`M${p[0]} ${p[1] - w * 0.28 + (R() - 0.5) * w * 0.5 - q}l${q * 0.3} ${q * 0.7}l${q * 0.7} ${q * 0.3}l${-q * 0.7} ${q * 0.3}l${-q * 0.3} ${q * 0.7}l${-q * 0.3} ${-q * 0.7}l${-q * 0.7} ${-q * 0.3}l${q * 0.7} ${-q * 0.3}Z`} fill={PAL.star} />; })}
		{/* head (left end), hands and feet (touching the earth) */}
		<g transform={`translate(${x0 + 6},${gy - 40})`}><circle r={40} fill={PAL.ink} /><circle r={35} fill={PAL.skinF} /><path d="M-35 -4Q-30 -40 5 -38Q36 -34 34 -2Q26 -26 0 -24Q-22 -22 -35 -4Z" fill={PAL.wigH} /><circle cx={14} cy={-6} r={4} fill={PAL.ink} />
			<g transform="translate(0,-38)"><path d="M-14 0Q-18 -34 0 -38Q18 -34 14 0Z" fill={PAL.red} stroke={PAL.ink} strokeWidth={4} /></g></g>
		<ellipse cx={x1 + 10} cy={gy - 4} rx={36} ry={14} fill={PAL.skinF} stroke={PAL.ink} strokeWidth={5} /></g>; };

const S5: React.FC = () => <g>
	<Bg a="#0B1230" b="#1B2652" /><Stars box={[0, 60, 1440, 600]} seed={9} n={50} c="#8FA6E8" r={3} />
	<Ground y={860} c="#2F6A47" c2="#1E4A31" />
	<g transform="rotate(-90 1010 805)"><God61 id="s5g" who="geb" pose={{...POSES.rest, fs: 4, fe: 8, bs: -2, be: 6, rt: -3, at: 3, rk: 2, ak: 2}} x={1010} y={805} s={26} bProp="none" fProp="none" /></g>
	<NutArch cx={700} gy={845} span={900} h={150} w={84} />
	<Label x={500} y={890} t="盖布 · 大地" size={30} c="#9FE0B4" /><Label x={700} y={440} t="努特 · 天空" size={30} c={PAL.goldHi} /></g>;

const S6: React.FC = () => <g>
	<Bg a="#16205A" b="#2E58A6" /><Stars box={[0, 60, 1440, 340]} seed={11} n={40} />
	<NutArch cx={CX} gy={850} span={1300} h={620} w={74} seed={13} />
	<Ground y={872} c="#2F6A47" c2="#1E4A31" />
	{[330, 420, 1000, 1090].map((x, i) => <path key={x} d={`M${x} 872q${i % 2 ? 20 : -20} -60 0 -120M${x + 16} 872q10 -40 -4 -90M${x - 16} 872q-12 -44 4 -80`} stroke="#3A9160" strokeWidth={8} fill="none" strokeLinecap="round" />)}
	<g transform="rotate(-90 1250 850)"><God61 id="s6g" who="geb" pose={{...POSES.rest, fs: 4, fe: 8, bs: -2, be: 6, rt: -3, at: 3, rk: 2, ak: 2}} x={1250} y={850} s={14} bProp="none" fProp="none" /></g>
	<God61 id="s6s" who="shu" pose={P61.lift()} x={CX} y={GY} s={27} bProp="none" fProp="none" />
	<Label x={CX} y={GY + 52} t="舒 · 撑开天地" size={32} /></g>;

const S7: React.FC = () => <g>
	<Bg a="#9B2A18" b="#E8A24E" /><Rays x={CX} y={190} r0={150} r1={330} n={22} c="#F8D97A" o={0.5} />
	<Disc x={CX} y={190} r={140} c={PAL.gold} />
	<RaFace x={CX} y={190} s={62} />
	<Calendar x={CX} y={650} r={170} done={190} />
	<g stroke={PAL.ink} strokeWidth={14} strokeLinecap="round"><path d={`M${CX - 90} ${560}L${CX + 90} ${740}M${CX + 90} ${560}L${CX - 90} ${740}`} /></g>
	<g stroke={PAL.red} strokeWidth={8} strokeLinecap="round"><path d={`M${CX - 90} ${560}L${CX + 90} ${740}M${CX + 90} ${560}L${CX - 90} ${740}`} /></g>
	<Label x={CX} y={920 - 36} t="360 天 · 一天天被划掉" size={28} /></g>;
/** the falcon head of Ra, large, in front of the disc */
const RaFace: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => <g><clipPath id="rafc"><circle cx={x} cy={y} r={150} /></clipPath>
	<g clipPath="url(#rafc)"><God61 id="rf" who="ra" pose={P61.rest()} x={x - 0.5 * s} y={y + 17.4 * s} s={s} /></g></g>;

const Senet: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => { const c = w / 10; return <g>
	<rect x={x - 8} y={y - 8} width={w + 16} height={c * 3 + 16} fill={PAL.wood} stroke={PAL.ink} strokeWidth={5} />
	{Array.from({length: 30}, (_, i) => <rect key={i} x={x + (i % 10) * c} y={y + Math.floor(i / 10) * c} width={c} height={c} fill={(i + Math.floor(i / 10)) % 2 ? PAL.linen2 : PAL.mat} stroke={PAL.ink} strokeWidth={2} />)}
	{[1, 3, 4, 6, 8].map((i) => <circle key={i} cx={x + i * c + c / 2} cy={y + c / 2} r={c * 0.33} fill={PAL.ink} />)}{[2, 5, 7, 9].map((i) => <path key={i} d={`M${x + i * c + c * 0.22} ${y + c * 0.78}L${x + i * c + c * 0.78} ${y + c * 0.78}L${x + i * c + c / 2} ${y + c * 0.2}Z`} fill={PAL.linen} stroke={PAL.ink} strokeWidth={3} />)}</g>; };
const S8: React.FC = () => <g>
	<Bg a="#16205A" b="#2A3F8C" /><Stars box={[0, 60, 1440, 600]} seed={21} n={30} />
	<Ground y={880} c="#3A2E5A" c2="#2A2040" />
	<rect x={520} y={700} width={400} height={180} fill={PAL.mat2} stroke={PAL.ink} strokeWidth={5} /><Senet x={540} y={620} w={360} />
	<God61 id="s8" who="thoth" pose={{...POSES.kneel, lean: 10, head: 6, fs: 40, fe: 40, fw: -10}} x={430} y={GY + 10} s={28} fProp="none" bProp="none" />
	<circle cx={1090} cy={470} r={190} fill="#BFD0FF" opacity={0.25} /><circle cx={1090} cy={470} r={116} fill="#E6EEFF" stroke={PAL.ink} strokeWidth={6} /><path d="M1010 450q40 -34 80 -6" fill="none" stroke={PAL.ink} strokeWidth={6} /><circle cx={1062} cy={470} r={8} fill={PAL.ink} /><circle cx={1120} cy={470} r={8} fill={PAL.ink} /><path d="M1050 520q40 26 84 -4" fill="none" stroke={PAL.ink} strokeWidth={6} strokeLinecap="round" />
	<path d="M1000 560q-60 80 -150 90" stroke={PAL.goldHi} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="2 14" />
	<Label x={430} y={GY + 62} t="托特" size={34} /><Label x={1090} y={640} t="月亮" size={34} c="#CFE0FF" /></g>;

const S9: React.FC = () => <g>
	<Bg a="#16205A" b="#2A3F8C" />
	<Calendar x={CX} y={500} r={300} done={0} fives gold={1} />
	<path d={`M${CX} 60Q${CX + 20} 180 ${CX} 215`} stroke={PAL.goldHi} strokeWidth={10} fill="none" strokeLinecap="round" /><circle cx={CX} cy={226} r={16} fill={PAL.goldHi} />
	<text x={CX} y={560} textAnchor="middle" fontSize={190} fontFamily={F_SERIF} fontWeight={900} fill={PAL.goldHi} stroke={PAL.ink} strokeWidth={10} paintOrder="stroke">365</text>
	<Label x={CX} y={642} t="360 + 5" size={36} /></g>;

const S10: React.FC = () => <g>
	<Bg a="#E9D8AE" b="#D9C08E" />
	{[0, 1, 2, 3, 4].map((i) => <g key={i} transform="translate(-340,0)"><path d={`M${470 + i * 150} 330V230Q${470 + i * 150} 170 ${520 + i * 150} 170Q${570 + i * 150} 170 ${570 + i * 150} 230V330Z`} fill={i === 0 ? PAL.gold : FC.lapis} stroke={PAL.ink} strokeWidth={5} />
		<circle cx={520 + i * 150} cy={262} r={18} fill={i === 0 ? PAL.goldHi : '#8FA6E8'} /><path d={poly([[502 + i * 150, 330], [538 + i * 150, 330], [532 + i * 150, 282], [508 + i * 150, 282]])} fill={i === 0 ? PAL.goldHi : '#8FA6E8'} /></g>)}
	<Label x={CX - 340} y={140} t="5 天 · 5 个孩子" size={30} c={FC.ink} o="#F4E8CC" />
	<Ground c="#C49A55" />
	<Throne x={880} y={GY} s={32} /><God61 id="s10" who="osiris" pose={{...POSES.throne}} x={880 + 2.7 * 32} y={GY} s={32} face={-1} />
	<Label x={970} y={GY + 55} t="奥西里斯 · 长子" size={34} /></g>;

const Sand: React.FC<{x0: number; x1: number}> = ({x0, x1}) => <g>{Array.from({length: 14}, (_, i) => <path key={i} d={`M${x0 + (i * 53) % (x1 - x0)} ${300 + i * 38}q70 -${24 + (i % 3) * 10} 150 0t150 0`} fill="none" stroke="#E8B25A" strokeWidth={8} strokeLinecap="round" opacity={0.75} />)}</g>;
const S11: React.FC = () => <g>
	<Bg a="#E9D8AE" b="#D9C08E" /><rect x={720} y={PIC_T} width={720} height={PIC_B - PIC_T} fill="#B5702E" opacity={0.55} /><Sand x0={730} x1={1400} />
	<Ground c="#C49A55" /><rect x={716} y={PIC_T} width={8} height={PIC_B - PIC_T} fill={PAL.gold} stroke={PAL.ink} strokeWidth={3} />
	<Sparkles x={520} y={400} />
	<God61 id="s11a" who="isis" pose={P61.wide()} x={520} y={GY} s={29} wings t={0.9} />
	<God61 id="s11b" who="set" pose={P61.menace()} x={1080} y={GY} s={29} face={-1} sneer={1} />
	<Label x={520} y={GY + 55} t="伊西斯 · 魔法" size={32} /><Label x={1080} y={GY + 55} t="赛特 · 沙漠风暴" size={32} /></g>;
const Sparkles: React.FC<{x: number; y: number}> = ({x, y}) => <Stars box={[x - 230, y - 150, x + 230, y + 150]} seed={31} n={22} c={PAL.goldHi} r={9} />;

const S12: React.FC = () => <g>
	<Bg a="#E9D8AE" b="#D9C08E" />
	<rect x={0} y={640} width={560} height={292} fill="#D9B16A" /><Sand x0={0} x1={540} />
	<rect x={560} y={650} width={880} height={282} fill="#E8C25A" />{Array.from({length: 22}, (_, i) => <path key={i} d={`M${590 + i * 40} ${860}V${700 + (i % 3) * 14}M${590 + i * 40} ${720 + (i % 3) * 14}l-8 -22M${590 + i * 40} ${735 + (i % 3) * 14}l9 -20`} stroke="#B58A2A" strokeWidth={5} fill="none" />)}
	<rect x={0} y={900} width={1440} height={32} fill="#2E58A6" />
	<God61 id="s12a" who="set" pose={P61.menace()} x={170} y={GY - 10} s={26} sneer={1} />
	<God61 id="s12b" who="nephthys" pose={P61.rest()} x={400} y={GY - 10} s={26} />
	<God61 id="s12c" who="osiris" pose={{...POSES.mummy}} x={900} y={GY - 10} s={26} />
	<God61 id="s12d" who="isis" pose={P61.rest()} x={1070} y={GY - 10} s={26} wings={false} face={-1} />
	<Label x={400} y={920 - 60} t="赛特的妻子" size={28} /><Label x={985} y={920 - 60} t="统治埃及" size={28} /></g>;

const Chest: React.FC<{x: number; y: number; w: number; lid: number}> = ({x, y, w, lid}) => <g>
	<rect x={x - w / 2} y={y - w * 0.4} width={w} height={w * 0.4} fill={PAL.wood} stroke={PAL.ink} strokeWidth={6} />
	<rect x={x - w / 2} y={y - w * 0.4} width={w} height={w * 0.07} fill={PAL.gold} /><rect x={x - w / 2} y={y - w * 0.12} width={w} height={w * 0.07} fill={PAL.gold} />
	{[0.25, 0.5, 0.75].map((u) => <circle key={u} cx={x - w / 2 + w * u} cy={y - w * 0.22} r={w * 0.025} fill={PAL.ink} />)}
	<g transform={`rotate(${-lid} ${x - w / 2} ${y - w * 0.4})`}><path d={`M${x - w / 2} ${y - w * 0.4}V${y - w * 0.52}Q${x} ${y - w * 0.66} ${x + w / 2} ${y - w * 0.52}V${y - w * 0.4}Z`} fill={PAL.wood} stroke={PAL.ink} strokeWidth={6} /><path d={`M${x - w / 2} ${y - w * 0.46}H${x + w / 2}`} stroke={PAL.gold} strokeWidth={7} /></g></g>;
const S13: React.FC = () => <g>
	<Bg a="#3A1A12" b="#7A3A1E" /><rect x={0} y={150} width={1440} height={10} fill={PAL.gold} />
	{Array.from({length: 12}, (_, i) => <Silh key={i} x={80 + i * 125} y={420} s={19} k={i} c="#1A0C08" />)}
	{[260, 720, 1180].map((x) => <g key={x}><path d={`M${x} 160V230`} stroke={PAL.gold} strokeWidth={4} /><circle cx={x} cy={250} r={20} fill="#FFB45A" /><circle cx={x} cy={250} r={70} fill="#FFB45A" opacity={0.22} /></g>)}
	<Ground c="#8A5A2A" c2="#4A2E14" /><rect x={0} y={880} width={1440} height={52} fill="#2E58A6" /><Wave y={906} c="#3F75BC" />
	<Chest x={640} y={GY - 30} w={420} lid={0} />
	<God61 id="s13" who="set" pose={{...P61.menace(), lean: 4, fs: 64, fe: 20}} x={1010} y={GY - 20} s={30} face={-1} sneer={1} bProp="none" fProp="none" />
	<Label x={640} y={GY + 40} t="一口箱子" size={34} /></g>;
const Hammers: React.FC = () => <g stroke={PAL.ink} strokeWidth={4} fill={PAL.gold}>{[500, 640, 780].map((x) => <g key={x}><rect x={x - 6} y={GY - 150} width={12} height={34} fill={PAL.ink} /><path d={`M${x - 14} ${GY - 156}h28`} /></g>)}</g>;

const S14: React.FC = () => <g>
	<Bg a="#F6D890" b="#E8C060" /><Disc x={760} y={430} r={250} c="#FFE6A0" /><Rays x={760} y={430} r0={260} r1={430} n={30} c="#FFF2C0" o={0.7} />
	<Ground c="#C49A55" />
	<God61 id="s14i" who="isis" pose={P61.wide()} x={430} y={GY} s={30} wings t={1.3} />
	<God61 id="s14o" who="osiris" pose={{...POSES.mummy}} x={760} y={GY} s={28} face={-1} />
	<God61 id="s14h" who="horus" pose={P61.rest()} x={1130} y={GY} s={22} face={-1} />
	<Rings x={headPt('horus', P61.rest(), 1130, GY, 22, -1, [2.0, -0.8])[0]} y={headPt('horus', P61.rest(), 1130, GY, 22, -1, [2.0, -0.8])[1]} dir={-1} n={3} c="#FFFFFF" r0={30} />
	<Label x={1130} y={GY + 46} t="荷鲁斯" size={30} /></g>;

const S15: React.FC = () => <g>
	<Bg a="#1A1008" b="#3A2210" />{[0, 1, 2, 3].map((i) => <rect key={i} x={0} y={120 + i * 14} width={1440} height={6} fill={[PAL.red, PAL.blue, PAL.green, PAL.gold][i]} opacity={0.8} />)}
	<Ground c="#3A2A18" c2="#6A4A22" />
	<Throne x={250} y={GY} s={38} /><God61 id="s15" who="osiris" pose={{...POSES.throne}} x={250 + 2.7 * 38} y={GY} s={38} face={-1} />
	<rect x={896} y={190} width={440} height={430} rx={14} fill="#F2E3BE" stroke={PAL.gold} strokeWidth={10} /><rect x={906} y={200} width={420} height={410} rx={8} fill="#E8D4AA" />
	<Balance p={{tilt: 0}} x={1116} y={600} s={19} />	<Label x={1116} y={225} t="第 1 集 · 审判大厅" size={26} c={FC.ink} o="#F2E3BE" /><Label x={400} y={GY + 55} t="冥界之王" size={34} /></g>;

const S16: React.FC = () => <g>
	<Bg a="#E9D8AE" b="#D9C08E" /><Ground c="#C49A55" />
	<Throne x={CX - 100} y={GY} s={40} />
	<text x={CX} y={410} textAnchor="middle" fontSize={250} fontFamily={F_SERIF} fontWeight={900} fill={PAL.gold} stroke={PAL.ink} strokeWidth={12} paintOrder="stroke">80</text>
	<text x={CX} y={480} textAnchor="middle" fontSize={50} fontFamily={F_SERIF} fontWeight={900} fill={FC.cream} stroke={PAL.ink} strokeWidth={9} paintOrder="stroke">年</text>
	<God61 id="s16a" who="horus" pose={P61.rest()} x={250} y={GY} s={32} />
	<God61 id="s16b" who="set" pose={P61.menace()} x={1190} y={GY} s={32} face={-1} sneer={1} /></g>;

const S17: React.FC = () => <g>
	<Bg a="#E9D8AE" b="#D9C08E" /><Ground c="#C49A55" />
	<God61 id="s17n" who="nephthys" pose={P61.rest()} x={420} y={GY} s={27} />
	<Balance p={{tilt: 0}} x={1120} y={GY} s={30} />
	<God61 id="s17a" who="anubis" pose={{...POSES.kneel}} x={820} y={GY} s={36} />
	<Twitch p={headPt('anubis', POSES.kneel, 820, GY, 36, 1, [0.36, -4.1])} />
	<Label x={420} y={GY + 55} t="奈芙蒂斯" size={30} /><Label x={820} y={GY + 55} t="阿努比斯" size={32} /></g>;
const Twitch: React.FC<{p: [number, number]}> = ({p}) => <g fill="none" stroke={PAL.goldHi} strokeWidth={6} strokeLinecap="round"><path d={`M${p[0] - 38} ${p[1] - 20}q-14 -22 6 -40`} /><path d={`M${p[0] + 34} ${p[1] - 26}q14 -22 -6 -40`} /><path d={`M${p[0] - 58} ${p[1] - 4}q-26 -14 -20 -42`} /></g>;

const S18: React.FC = () => <g>
	<Bg a="#16205A" b="#1B2652" />
	<g transform={`translate(${CX - 640 * 1.3},${150}) scale(1.3)`}><FamilyTree61 lit={LIT[18] as NodeId[]} focus={['atum', 'sekhmet', 'bastet', 'maat']} cid="s18" /></g></g>;

const S19: React.FC = () => { const R = rng(41); return <g>
	<Bg a="#4A0A06" b="#C0281C" /><Disc x={760} y={330} r={250} c="#E8451F" /><Rays x={760} y={330} r0={270} r1={520} n={26} c="#FF7A3A" o={0.35} />
	<Ground y={890} c="#3A0A06" c2="#1A0402" />
	{Array.from({length: 9}, (_, i) => <Silh key={i} x={1000 + i * 52} y={890} s={9 + R() * 2} k={i} c="#1A0402" />)}
	<God61 id="s19" who="sekhmet" pose={P61.roar()} x={500} y={GY + 20} s={40} roar={1} dress="sheath" />
	<Rings x={headPt('sekhmet', P61.roar(), 500, GY + 20, 40, 1, [2.3, -0.3])[0]} y={headPt('sekhmet', P61.roar(), 500, GY + 20, 40, 1, [2.3, -0.3])[1]} dir={1} n={5} c="#FFE0C0" r0={60} /></g>; };

const S20: React.FC = () => <g>
	<Bg a="#E9D8AE" b="#D9C08E" /><Ground c="#C49A55" />
	<Rays x={360} y={420} r0={0} r1={0} n={1} />
	<God61 id="s20a" who="bastet" pose={P61.shake()} x={330} y={GY} s={30} basket />
	<God61 id="s20b" who="maat" pose={P61.rest()} x={720} y={GY} s={30} wings />
	<Balance p={{tilt: 3}} x={1150} y={GY} s={30} />
	<g transform="translate(1000,420) rotate(14)"><path d={featherD(2.2)} fill={PAL.linen} stroke={PAL.ink} strokeWidth={0.08} transform="scale(30)" /></g>
	<Label x={330} y={GY + 55} t="巴斯特" size={32} /><Label x={720} y={GY + 55} t="玛阿特 · 真理" size={32} /></g>;

const S21: React.FC = () => <g>
	<Bg a="#16205A" b="#1B2652" />
	<rect x={220} y={110} width={1000} height={740} rx={18} fill="#EFE0B4" stroke={PAL.ink} strokeWidth={6} /><rect x={220} y={110} width={1000} height={36} fill={PAL.mat} stroke={PAL.ink} strokeWidth={5} /><rect x={220} y={814} width={1000} height={36} fill={PAL.mat} stroke={PAL.ink} strokeWidth={5} />
	<g transform={`translate(${CX + 60 - TCX * 0.8},${130}) scale(0.8)`}><FamilyTree61 lit={LIT[21] as NodeId[]} cid="s21" labels /></g>
	<God61 id="s21" who="thoth" pose={{...POSES.write}} x={180} y={GY - 10} s={24} bProp="palette" fProp="pen" />
	<Label x={180} y={GY + 40} t="书记官 · 托特" size={26} /></g>;

const S22: React.FC = () => <g>
	<Bg a="#E8D4AA" b="#D3B98A" />
	{[0, 1].map((i) => <g key={i}><rect x={0} y={PIC_T + i * 740 + 20} width={1440} height={96} fill={FC.lapis} opacity={0.95} />{Array.from({length: 30}, (_, j) => <path key={j} d={poly([[j * 50 + 4, PIC_T + i * 740 + 28], [j * 50 + 46, PIC_T + i * 740 + 28], [j * 50 + 25, PIC_T + i * 740 + 108]])} fill={[PAL.red, PAL.gold, PAL.green][j % 3]} opacity={0.9} />)}</g>)}
	<g transform={`translate(${CX - TCX * 0.82},${140}) scale(0.82)`}><FamilyTree61 lit={LIT[22] as NodeId[]} cid="s22" /></g>
	<Label x={CX} y={PIC_T + 70} t="古埃及神话故事" size={52} c={PAL.goldHi} /></g>;

const T = (n: number, t0: number, t1: number, lines: string, text: string, size: Shot['size'], cam: string, beat: string, scene: React.FC, chip = true): Shot => ({n, t0, t1, lines, text, size, cam, beat, scene, chip});
export const SHOTS: Shot[] = [
	T(1, 0, 5.9, '1–2', '古埃及有[1500多位]神——但你只要认识[这一家人]。', 'wide', '缓推 +6%', '金光一层层亮起 → 镜头收拢到空家谱', S1, false),
	T(2, 5.9, 12.2, '3–4', '一开始，世界只有一片[黑水]。水里升起创世神[亚图姆]——', 'wide', '静机位，水面微波', '水面隆起山丘，亚图姆升起站定', S2),
	T(3, 12.2, 17.8, '5–6', '他也是太阳神，叫[拉]。他一口气，吐出一儿一女——', 'medium', '缓推 +4%', '日盘升起，同一位神换成鹰头；张口吐出两团金雾', S3),
	T(4, 17.8, 22.8, '7–8', '儿子[舒]，是空气。女儿[泰芙努特]，是湿气。', 'medium', '缓拉 −3%', '舒：风吹羽毛；泰芙努特：张口一吼（母狮吼，截短）', S4),
	T(5, 22.8, 29.9, '9–10', '他们又生下大地[盖布]和天空[努特]。这对兄妹，紧紧抱在一起。', 'wide', '静机位，微降', '努特从上方俯身压向盖布，天地贴合变黑', S5),
	T(6, 29.9, 36.0, '11–12', '父亲舒看不下去，把他们[撑开]——从此，天在上，地在下。', 'wide', '上摇 +60 px 总量', '舒双手托起努特，星光亮满，盖布身上长草', S6),
	T(7, 36.0, 43.0, '13–14', '可太阳神下了一道诅咒：一年里哪一天，努特都不许生孩子。', 'medium', '缓推 +4%', '拉怒目，金光炸开；日历轮盘一格格变红打叉', S7),
	T(8, 43.0, 49.8, '15–16', '智慧之神[托特]想了个办法——找月亮下棋，赢走她的[一点光]。', 'medium', '缓平移 40 px', '托特歪头落子，月亮脸色一变，掉下一缕光', S8),
	T(9, 49.8, 55.8, '17–18', '攒出了日历之外的[5天]。一年，从360天变成[365天]。', 'close', '缓推 +5%', '光缕落进轮盘，挤出5个金格；数字 360 滚动成 365', S9),
	T(10, 55.8, 62.8, '19–20', '这5天里，努特的孩子出生了：长子[奥西里斯]，后来当了国王。', 'medium', '缓平移 −40 px', '5格壁龛逐个亮起；第一格打开，奥西里斯坐上王座', S10),
	T(11, 62.8, 68.6, '21–22', '[伊西斯]，最会魔法的女神。[赛特]，沙漠和风暴之神。', 'medium', '静机位（分屏）', '左：伊西斯展开双翼；右：赛特在沙暴里冷笑', S11),
	T(12, 68.6, 75.7, '23–24', '还有[奈芙蒂斯]，赛特的妻子。奥西里斯娶了伊西斯，统治埃及。', 'wide', '平移 −300 px（左→右，≤8 px/帧）', '奈芙蒂斯走到赛特身边；镜头滑向并肩的奥西里斯和伊西斯', S12),
	T(13, 75.7, 83.0, '25–26', '弟弟赛特嫉妒，做了[一口箱子]——骗哥哥躺进去，钉死，扔进[尼罗河]。', 'medium', '缓推 +4%', '赛特合上箱盖，钉子三下，箱子漂走（不画人体）', S13),
	T(14, 83.0, 89.5, '27–28', '伊西斯找回丈夫，用魔法唤醒他。他们有了儿子：[荷鲁斯]。', 'medium', '缓拉 −3%', '伊西斯展翅，金光包住奥西里斯；右侧荷鲁斯一声鹰啸', S14),
	T(15, 89.5, 97.2, '29–30', '奥西里斯去了冥界，当上[冥界之王]。就是第1集里，审判你的那位神。', 'medium', '静机位 → 画中画', '奥西里斯坐上冥界王座；右侧框内闪回第1集的天平', S15),
	T(16, 97.2, 103.7, '31–32', '荷鲁斯长大，要向叔叔讨回[王位]——叔侄俩，一争就是[80年]。', 'wide', '静机位', '两人隔着空王座对峙，年份数字飞转到80', S16),
	T(17, 103.7, 111.3, '33–34', '奈芙蒂斯也有个儿子：[阿努比斯]。黑色胡狼头，专管木乃伊和[称心]。', 'medium', '缓平移 +40 px', '阿努比斯从奈芙蒂斯身后走出，耳朵一动，扶住天平', S17),
	T(18, 111.3, 115.0, '35', '太阳神的女儿们，脾气天差地别。', 'medium', '回到家谱顶端，推近 +20%', '拉的节点放光，右侧亮出三个女儿的空位', S18, false),
	T(19, 115.0, 120.9, '36–37', '狮子头的[塞赫麦特]，发起怒来——差点把人类[灭光]。', 'close', '缓推 +6%', '塞赫麦特仰头怒吼（全长母狮吼，BGM让开）；红天，人影奔逃', S19),
	T(20, 120.9, 127.9, '38–39', '猫头的[巴斯特]，守护家和孩子。头顶羽毛的[玛阿特]，代表真理。', 'wide', '平移 +40 px（巴斯特→玛阿特）', '巴斯特摇叉铃、舔爪；玛阿特的羽毛飘落到天平上', S20),
	T(21, 127.9, 134.7, '40–41', '托特，就是众神的[书记官]。这就是古埃及最有名的一家人。', 'medium', '缓推 +5%', '托特在纸草上写下整张家谱；每位神在自己位置上做一个小动作', S21, false),
	T(22, 134.7, 148.3, '42–43', '以后每个故事，都发生在这一家。这一家人，你最想先听谁的故事？', 'wide', '缓拉 −12%，家谱化为壁画', '家谱变成神殿壁画；片尾卡「古埃及神话故事」', S22, false),
];
export {NODES, FOCUS};
