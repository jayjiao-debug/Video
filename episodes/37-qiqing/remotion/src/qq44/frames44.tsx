import React from 'react';
import {W, H, rnd, lerp, Glow, Blur, Rimmed, fkPose, gaitPose, Look4, Pose, SERIF, RED, INK, B, jointAt, Plate, Sky, Furniture, Age, BrainLight, HeadGlow, Jar, Compass} from './kit44';
/* ep44 《你是爱因斯坦的大脑》: 12 key frames in look A. Each frame = an SVG scene + the look A furniture. */
export type KF = {scene: React.ReactNode; furn: React.ReactNode};
const LK: Record<string, Look4> = {
	ein: {dress: 'jacket', head: 'young', beard: 'mous2'},
	einOld: {dress: 'jacket', head: 'wild', beard: 'mous2', build: 1.05},
	child: {dress: 'tunic', head: 'child', build: 1.12},
	teen: {dress: 'jacket', head: 'short'},
	father: {dress: 'coat', head: 'short', beard: 'full', build: 1.08},
	harvey: {dress: 'coat', head: 'short'},
	harveyOld: {dress: 'jacket', head: 'baldf', build: 1.05},
	levy: {dress: 'jacket', head: 'bowl'},
	diamond: {dress: 'coat', head: 'bob'},
	astro: {dress: 'jacket', head: 'hat'},
};
const STAND = {hip: 0.655, lean: 3, neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14};
const RIMB = '#ffc4a0';
/** a figure carrying "you": the glow inside the head rim-lights him */
const Carrier: React.FC<{x: number; g: number; h: number; pose: Pose; look: Look4; flip?: boolean; id: string; col?: string; glow?: number}> = ({x, g, h, pose, look, flip, id, col = '#120e12', glow = 1}) => {
	const hd = jointAt(pose, 'Head', x, g, h, flip), tp = jointAt(pose, 'Top', x, g, h, flip), c: [number, number] = [lerp(hd[0], tp[0], 0.45), lerp(hd[1], tp[1], 0.45)];
	return <g><Rimmed x={x} ground={g} h={h} pose={pose} look={look} flip={flip} col={col} rim={RIMB} rimOp={0.7} rimDx={flip ? 2.4 : -2.4} />
		<HeadGlow x={c[0]} y={c[1]} r={h * 0.05} id={id} o={glow} /></g>; };

/* 1 · cold open: the light of you cracks into numbered cubes */
const F1: KF = {
	scene: <g>
		<Sky id="s1" stops={[[0, '#0e171a'], [0.6, '#1c2b30'], [1, '#121a1c']]} />
		{Array.from({length: 40}, (_, i) => <circle key={i} cx={rnd(i, 1) * W} cy={rnd(i, 2) * H} r={1 + 2 * rnd(i, 3)} fill="#c8d8dc" opacity={0.15} />)}
		<BrainLight x={1080} y={600} s={1.15} id="b1" cubes explode={0.42} cell={62} />
		{Array.from({length: 26}, (_, i) => { const a = rnd(i, 7) * Math.PI * 2, d = 380 + 160 * rnd(i, 8); return <rect key={i} x={1080 + Math.cos(a) * d} y={600 + Math.sin(a) * d * 0.7} width={4 + 8 * rnd(i, 9)} height={4 + 8 * rnd(i, 9)} fill={B.mid} opacity={0.5} transform={`rotate(${rnd(i, 10) * 90} ${1080 + Math.cos(a) * d} ${600 + Math.sin(a) * d * 0.7})`} />; })}
	</g>,
	furn: <Furniture sub={['爱因斯坦死后，', '你被切成[约240块]，']} stamp={['1955 · 费城', '切块，逐块编号', '据 Witelson、Falk 的论文']} era="身后" age={<Age n={76} />} />,
};

/* 2 · Wichita 1978: the cider box */
const F2: KF = {
	scene: <g>
		<Sky id="s2" stops={[[0, '#3a3a38'], [0.62, '#4a463e'], [0.63, '#2a2622'], [1, '#1c1a18']]} />
		<rect x={140} y={170} width={360} height={380} fill="#2e2c2a" /><rect x={150} y={180} width={340} height={360} fill="#5a6a74" opacity={0.55} />
		<path d="M320,180 V540 M150,360 H490" stroke="#2e2c2a" strokeWidth={10} />
		<rect x={1420} y={300} width={360} height={370} fill="#3a342c" /><rect x={1440} y={330} width={320} height={10} fill="#2a2620" /><rect x={1440} y={460} width={320} height={10} fill="#2a2620" />
		{/* the red cooler (prop only) */}
		<g transform="translate(470,880)"><rect x={-130} y={-120} width={260} height={120} rx={14} fill="#8e3a30" /><rect x={-140} y={-140} width={280} height={34} rx={10} fill="#a8463a" /><rect x={-40} y={-158} width={80} height={20} rx={8} fill="#d8d2c8" opacity={0.8} /></g>
		{/* two stacked boxes; the bottom one says COSTA CIDER; the top one is open */}
		<g transform="translate(980,880)">
			<rect x={-230} y={-210} width={460} height={210} fill="#8a6a46" /><rect x={-230} y={-210} width={460} height={12} fill="#6a5034" />
			<text x={0} y={-90} textAnchor="middle" style={{fontFamily: 'DejaVu Sans, sans-serif', fontWeight: 800, fontSize: 46, letterSpacing: '0.12em'}} fill="#3a2614" opacity={0.85}>COSTA CIDER</text>
			<rect x={-150} y={-62} width={300} height={6} fill="#3a2614" opacity={0.6} />
			<rect x={-200} y={-400} width={400} height={190} fill="#967450" /><path d="M-200,-400 L-262,-470 L-150,-470 L-110,-400 Z" fill="#a8845c" /><path d="M200,-400 L262,-470 L150,-470 L110,-400 Z" fill="#7e6040" />
		</g>
		<Jar x={980} y={-0} s={0} id="j0" />
		<g><Jar x={980} y={610} s={0.95} id="j2" /></g>
		<rect x={760} y={480} width={440} height={0} fill="none" />
		<Glow x={980} y={460} r={360} c={B.halo} o={0.25} id="f2g" />
		<Rimmed x={1470} ground={900} h={600} pose={fkPose({...STAND, lean: 8, neck: 14, ra: 40, re: 50, la: 10, le: 20})} look={LK.harveyOld} flip col="#14100e" rim={RIMB} rimOp={0.6} rimDx={2.4} />
		<Rimmed x={620} ground={905} h={590} pose={fkPose({...STAND, lean: 14, neck: 20, ra: 60, re: 70, la: 40, le: 90})} look={LK.levy} col="#14100e" rim={RIMB} rimOp={0.6} />
		<rect x={700} y={505} width={36} height={46} fill="#e8e0d0" transform="rotate(-20 718 528)" />
	</g>,
	furn: <Furniture sub={['躺在[苹果酒纸箱]里，']} stamp={['1978 · 堪萨斯州 威奇托', '记者找到了你（Levy 记）', '哈维：你的保管者']} era="身后" age={<Age n={99} />} />,
};

/* 3 · rewind and title: the cubes fuse back into one light; the title is written by that light */
const F3: KF = {
	scene: <g>
		<Sky id="s3" stops={[[0, '#0c1316'], [1, '#1a2226']]} />
		<defs><filter id="f3b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="14 2" /></filter></defs>
		<g filter="url(#f3b)">{Array.from({length: 36}, (_, i) => { const a = rnd(i, 1) * Math.PI * 2, d = 300 + 500 * rnd(i, 2), x = 960 + Math.cos(a) * d, y = 440 + Math.sin(a) * d * 0.6;
			return <line key={i} x1={x} y1={y} x2={lerp(x, 960, 0.35)} y2={lerp(y, 440, 0.35)} stroke={B.mid} strokeWidth={4 + 6 * rnd(i, 3)} opacity={0.5} />; })}</g>
		{Array.from({length: 18}, (_, i) => { const a = rnd(i, 4) * Math.PI * 2, d = 230 + 120 * rnd(i, 5), x = 960 + Math.cos(a) * d, y = 440 + Math.sin(a) * d * 0.6;
			return <rect key={i} x={x - 16} y={y - 16} width={32} height={32} rx={4} fill={B.mid} opacity={0.75} stroke={B.core} strokeWidth={2} transform={`rotate(${rnd(i, 6) * 60} ${x} ${y})`} />; })}
		<BrainLight x={960} y={440} s={0.62} id="b3" />
		<text x={960 + 4} y={820} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 112, letterSpacing: '0.06em'}} fill={INK} stroke="rgba(12,8,5,0.6)" strokeWidth={6} paintOrder="stroke"><tspan fill={RED}>你</tspan>是爱因斯坦的大脑</text>
		<Glow x={960} y={780} r={620} c={B.mid} o={0.12} id="f3t" />
		<text x={150} y={250} style={{fontFamily: 'DejaVu Sans Mono, monospace', fontWeight: 700, fontSize: 92}} fill={INK} opacity={0.92}>◀◀</text>
	</g>,
	furn: <Furniture stamp={['1879 · 乌尔姆', '回到他出生那年']} era="倒带" age={<div style={{display: 'flex', alignItems: 'flex-end'}}><Age n={<span style={{display: 'inline-block', filter: 'blur(1.5px)', textShadow: '0 -40px 0 rgba(246,239,226,0.35), 0 40px 0 rgba(246,239,226,0.25)'}}>12</span>} /></div>} />,
};

/* 4 · the compass, about 5: the needle, and the glow in his head */
const kidP = fkPose({hip: 0.36, lean: 10, neck: 22, lt: 88, lk: 92, rt: 84, rk: 88, la: 52, le: 76, ra: 48, re: 80});
const F4: KF = {
	scene: <g>
		<Sky id="s4" stops={[[0, '#3a2c26'], [0.62, '#4a382e'], [0.63, '#2c201a'], [1, '#1a1410']]} />
		{Array.from({length: 12}, (_, i) => <rect key={i} x={i * 170} y={0} width={4} height={670} fill="#5a4436" opacity={0.35} />)}
		<rect x={1320} y={220} width={300} height={360} fill="#1e2636" /><rect x={1320} y={220} width={300} height={360} fill="none" stroke="#2a1e16" strokeWidth={16} /><path d="M1470,220 V580 M1320,400 H1620" stroke="#2a1e16" strokeWidth={9} />
		<g transform="translate(560,640)"><rect x={-120} y={0} width={240} height={14} fill="#3a2a1e" /><rect x={-100} y={14} width={12} height={250} fill="#3a2a1e" /><rect x={88} y={14} width={12} height={250} fill="#3a2a1e" />
			<path d="M-24,0 L-18,-60 Q0,-80 18,-60 L24,0 Z" fill="#8a6a3a" /><Glow x={0} y={-90} r={160} c="#ffd28a" o={0.5} id="f4l" /><ellipse cx={0} cy={-92} rx={10} ry={20} fill="#ffe2a8" /></g>
		<Rimmed x={760} ground={910} h={700} pose={fkPose({hip: 0.37, lean: 6, neck: 14, lt: 86, lk: 90, rt: 82, rk: 86, la: 40, le: 60, ra: 58, re: 40})} look={LK.father} col="#140f0c" rim="#ffd8a8" rimOp={0.45} />
		<g transform="translate(910,904)"><rect x={-60} y={-260} width={120} height={14} fill="#2a1e16" /><rect x={-50} y={-246} width={10} height={246} fill="#2a1e16" /><rect x={40} y={-246} width={10} height={246} fill="#2a1e16" /></g>
		<Carrier x={1080} g={904} h={430} pose={kidP} look={LK.child} flip id="f4c" />
		{(() => { const hd = jointAt(kidP, 'RHand', 1080, 904, 430, true); return <Compass x={hd[0] - 10} y={hd[1] - 18} r={34} a={18} glow={0.5} id="f4cp" />; })()}
		{/* the needle, close: an inset of light */}
		<g transform="translate(1240,420)"><circle r={150} fill="#0e0a08" opacity={0.35} /><Compass x={0} y={0} r={120} a={18} glow={0.8} id="f4big" /></g>
	</g>,
	furn: <Furniture sub={['你想：事物背后，', '一定[深藏着什么]。']} stamp={['1884 前后 · 慕尼黑', '父亲给他看指南针（自述）']} era="童年" age={<Age pre="约" n={5} />} />,
};

/* 5 · 16: running beside a beam of light */
const runP = gaitPose('08_04', 0.18);
const F5: KF = {
	scene: <g>
		<Plate k="meadow" />
		<rect width={W} height={H} fill="#2a2a20" opacity={0.18} />
		<defs><linearGradient id="beam5" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff8e8" stopOpacity="0" /><stop offset="0.8" stopColor="#fff8e8" stopOpacity="0.85" /><stop offset="1" stopColor="#ffffff" stopOpacity="1" /></linearGradient></defs>
		<rect x={-40} y={560} width={1420} height={10} rx={5} fill="url(#beam5)" /><Glow x={1380} y={565} r={140} c="#fff6e0" o={0.9} id="b5h" />
		{Array.from({length: 7}, (_, i) => <path key={i} d={`M${1380 - 60 - i * 70},${565 - 14 * Math.sin(i)} q18,-22 36,0 t36,0`} stroke="#fff6e0" strokeWidth={3} fill="none" opacity={0.5 - i * 0.06} />)}
		<Carrier x={1180} g={960} h={520} pose={{...runP}} look={LK.teen} id="f5c" />
		{Array.from({length: 6}, (_, i) => <rect key={i} x={900 - i * 60} y={720 + i * 26} width={120 - i * 12} height={3} fill="#fff" opacity={0.35 - i * 0.05} />)}
	</g>,
	furn: <Furniture sub={['16岁，你想：', '要是[追着光跑]呢？']} stamp={['1895 · 瑞士 阿劳', '追光的思想实验（自述）']} era="少年" age={<Age n={16} />} />,
};

/* 6 · 1919: the eclipse; starlight bends past the sun; he reads the news */
const F6: KF = {
	scene: <g>
		<Sky id="s6" stops={[[0, '#0a0f1c'], [0.55, '#1a2236'], [0.85, '#3a3640'], [1, '#2a241e']]} />
		{Array.from({length: 60}, (_, i) => <circle key={i} cx={rnd(i, 11) * W} cy={rnd(i, 12) * 700} r={0.8 + 1.6 * rnd(i, 13) ** 3} fill="#eef0ff" opacity={0.25 + 0.5 * rnd(i, 14)} />)}
		<g transform="translate(1180,400)">
			<Glow x={0} y={0} r={260} c="#f4f0e4" o={0.45} id="cor" />{Array.from({length: 24}, (_, i) => { const a = i * Math.PI / 12, l = 120 + 70 * rnd(i, 2); return <path key={i} d={`M${Math.cos(a) * 96},${Math.sin(a) * 96} L${Math.cos(a + 0.05) * l},${Math.sin(a + 0.05) * l}`} stroke="#f4f0e4" strokeWidth={4} opacity={0.35} />; })}
			<circle r={96} fill="#05060a" /><circle r={98} fill="none" stroke="#fffaf0" strokeWidth={3} opacity={0.9} />
			{/* a star behind the sun: its light bends round the sun toward the island */}
			<circle cx={330} cy={-240} r={6} fill="#fff" /><Glow x={330} y={-240} r={30} c="#ffffff" o={0.8} id="st6" />
			<path d="M330,-240 Q120,-150 40,-118 Q-260,20 -520,330" stroke="#fff4dc" strokeWidth={3} fill="none" strokeDasharray="10 9" opacity={0.85} />
			<path d="M330,-240 L-520,330" stroke="#fff4dc" strokeWidth={1.5} fill="none" strokeDasharray="3 10" opacity={0.35} />
			<circle cx={230} cy={-292} r={4} fill="#fff" opacity={0.5} /><text x={210} y={-310} style={{fontFamily: SERIF, fontSize: 26}} fill="#e8e4d8" opacity={0.7}>看起来的位置</text>
		</g>
		{/* Príncipe: the observers' telescope under palms */}
		<path d="M0,820 Q500,780 1100,810 Q1500,830 1920,800 L1920,1080 L0,1080 Z" fill="#14120e" />
		{[[1500, 820], [1760, 806]].map(([x, y], i) => <g key={i} fill="#14120e"><path d={`M${x},${y} Q${x + 10},${y - 160} ${x - 6},${y - 300} L${x + 6},${y - 300} Q${x + 24},${y - 160} ${x + 14},${y} Z`} />{Array.from({length: 7}, (_, k) => { const a = -170 + k * 30; return <path key={k} d={`M${x},${y - 300} q${Math.cos(a * Math.PI / 180) * 60},${Math.sin(a * Math.PI / 180) * 40 - 10} ${Math.cos(a * Math.PI / 180) * 130},${Math.sin(a * Math.PI / 180) * 60 + 40}`} stroke="#14120e" strokeWidth={14} fill="none" strokeLinecap="round" />; })}</g>)}
		<g transform="translate(1260,812)"><path d="M0,0 L-30,-120 M0,0 L30,-120 M0,0 L0,-130" stroke="#14120e" strokeWidth={8} /><rect x={-20} y={-300} width={44} height={200} rx={8} fill="#14120e" transform="rotate(-30 0 -130)" /></g>
		<Rimmed x={1350} ground={816} h={260} pose={fkPose({...STAND, neck: -20, ra: 70, re: 30})} look={LK.astro} flip col="#14120e" rimOp={0} />
		{/* Berlin: he reads the papers, the light of you in his head */}
		<Carrier x={560} g={900} h={620} pose={fkPose({...STAND, lean: 6, neck: 14, la: 60, le: 70, ra: 66, re: 64})} look={LK.ein} id="f6c" />
		{(() => { const p = fkPose({...STAND, lean: 6, neck: 14, la: 60, le: 70, ra: 66, re: 64}), h = jointAt(p, 'RHand', 560, 900, 620); return <g transform={`translate(${h[0] + 20},${h[1] - 40}) rotate(-8)`}><rect x={-10} y={-90} width={180} height={150} fill="#d8d0bc" /><rect x={8} y={-76} width={140} height={16} fill="#3a342c" /><rect x={8} y={-50} width={110} height={8} fill="#6a6258" />{Array.from({length: 7}, (_, i) => <rect key={i} x={8} y={-30 + i * 11} width={60 + (i % 3) * 22} height={4} fill="#8a8274" />)}</g>; })()}
	</g>,
	furn: <Furniture sub={['1919年日全食：', '星光真的[弯了]。']} stamp={['1919 · 普林西比岛', '日全食观测（爱丁顿）', '他在柏林，一夜成名']} era="成名" age={<Age n={40} />} />,
};

/* 7 · 1939: he signs the letter by lamplight */
const signP = fkPose({hip: 0.37, lean: 20, neck: 18, lt: 86, lk: 90, rt: 82, rk: 86, la: 46, le: 62, ra: 54, re: 70});
const F7: KF = {
	scene: <g>
		<Sky id="s7" stops={[[0, '#1e2228'], [0.64, '#2a2a2c'], [0.65, '#1a1614'], [1, '#100c0a']]} />
		<rect x={1240} y={180} width={360} height={420} fill="#0e1626" /><rect x={1240} y={180} width={360} height={420} fill="none" stroke="#14100e" strokeWidth={18} /><path d="M1420,180 V600 M1240,390 H1600" stroke="#14100e" strokeWidth={10} />
		{Array.from({length: 14}, (_, i) => <circle key={i} cx={1260 + rnd(i, 21) * 320} cy={200 + rnd(i, 22) * 200} r={1.4} fill="#e8eaf8" opacity={0.6} />)}
		<path d="M1250,560 Q1420,530 1590,550 L1590,600 L1250,600 Z" fill="#1a2a30" opacity={0.9} />
		<Glow x={1060} y={600} r={520} c="#ffcf8a" o={0.32} id="f7l" />
		<rect x={760} y={706} width={640} height={18} fill="#3a2a1e" /><rect x={790} y={724} width={16} height={190} fill="#3a2a1e" /><rect x={1360} y={724} width={16} height={190} fill="#3a2a1e" />
		<g transform="translate(1180,706)"><rect x={-8} y={-110} width={16} height={110} fill="#2a1e14" /><path d="M-70,-110 L70,-110 L44,-170 L-44,-170 Z" fill="#3a5a40" opacity={0.85} /><Glow x={0} y={-100} r={90} c="#fff0c8" o={0.8} id="f7b" /></g>
		<g transform="translate(990,700) rotate(-4)"><rect x={-110} y={-6} width={220} height={8} fill="#efe8d8" />{Array.from({length: 0}, () => null)}</g>
		<g transform="translate(990,690)"><path d="M-110,0 L110,0 L120,14 L-100,14 Z" fill="#f2ecdc" />{Array.from({length: 4}, (_, i) => <rect key={i} x={-90} y={3 + i * 2.4} width={150 - i * 20} height={1} fill="#5a5448" />)}</g>
		<Carrier x={760} g={912} h={600} pose={signP} look={LK.einOld} id="f7c" />
		{(() => { const h = jointAt(signP, 'RHand', 760, 912, 600); return <path d={`M${h[0]},${h[1] - 4} L${h[0] + 34},${h[1] + 18}`} stroke="#0e0a08" strokeWidth={5} strokeLinecap="round" />; })()}
		<g transform="translate(1000,632)"><rect x={-60} y={-20} width={150} height={44} rx={4} fill="#f2ecdc" opacity={0.95} /><text x={14} y={10} textAnchor="middle" style={{fontFamily: 'DejaVu Serif, serif', fontSize: 20, fontStyle: 'italic'}} fill="#2a2420">Aug. 2nd, 1939</text></g>
	</g>,
	furn: <Furniture sub={['他签信，', '建议美国[也造]。']} stamp={['1939 · 美国', '致罗斯福总统的信（8月2日）']} era="战时" age={<Age n={60} />} />,
};

/* 8 · 1955: the hospital window at night; he stops at 76, you don't */
const F8: KF = {
	scene: <g>
		<Sky id="s8" stops={[[0, '#121a24'], [0.7, '#1a2430'], [0.71, '#12161c'], [1, '#0c1014']]} />
		<rect x={1180} y={170} width={420} height={520} fill="#0a1222" />{Array.from({length: 30}, (_, i) => <circle key={i} cx={1200 + rnd(i, 31) * 380} cy={190 + rnd(i, 32) * 380} r={1.3} fill="#e8eaf8" opacity={0.5} />)}
		<circle cx={1480} cy={300} r={36} fill="#e8e4d6" opacity={0.9} /><Glow x={1480} y={300} r={160} c="#e8eaf4" o={0.25} id="f8m" />
		<rect x={1180} y={170} width={420} height={520} fill="none" stroke="#0a0c10" strokeWidth={20} /><path d="M1390,170 V690 M1180,430 H1600" stroke="#0a0c10" strokeWidth={10} />
		<path d="M1180,690 L1600,690 L1760,1080 L1000,1080 Z" fill="#c8d4e8" opacity={0.05} />
		{/* the bed, the sheet; you, a light that does not go out */}
		<rect x={360} y={760} width={760} height={40} rx={10} fill="#2a3240" /><rect x={380} y={800} width={16} height={130} fill="#1a2028" /><rect x={1090} y={800} width={16} height={130} fill="#1a2028" />
		<path d="M360,764 Q700,690 1120,720 L1120,800 L360,800 Z" fill="#9aa6b8" opacity={0.55} /><rect x={380} y={712} width={150} height={54} rx={22} fill="#b8c2d0" opacity={0.6} />
		<rect x={260} y={560} width={30} height={370} fill="#1a2028" /><rect x={230} y={550} width={90} height={14} fill="#1a2028" />
		<BrainLight x={470} y={640} s={0.22} id="b8" />
	</g>,
	furn: <Furniture sub={['他停在了[76岁]。']} punch="你没有。" stamp={['1955 · 普林斯顿医院', '4月18日 凌晨1点多']} era="身后"
		age={<div style={{display: 'flex', alignItems: 'flex-end', gap: 40}}><div style={{opacity: 0.5, filter: 'grayscale(1)'}}><Age who="他" n={76} /></div><div style={{position: 'relative'}}><Age n={76} /><span style={{position: 'absolute', right: -70, bottom: 18, fontSize: 34, color: RED, fontWeight: 900}}>→</span></div></div>} />,
};

/* 9 · Harvey's lab: you on the scale */
const F9: KF = {
	scene: <g>
		<Sky id="s9" stops={[[0, '#2a3034'], [0.66, '#384044'], [0.67, '#20262a'], [1, '#161a1c']]} />
		{Array.from({length: 9}, (_, i) => <rect key={i} x={i * 240} y={0} width={3} height={720} fill="#4a5458" opacity={0.5} />)}
		<rect x={300} y={140} width={280} height={300} fill="#1c2226" /><rect x={316} y={156} width={248} height={268} fill="#3a4a50" opacity={0.6} />
		<Glow x={960} y={180} r={600} c="#e8f0f0" o={0.12} id="f9c" />
		<rect x={620} y={720} width={760} height={20} fill="#4a5054" /><rect x={640} y={740} width={18} height={180} fill="#30363a" /><rect x={1342} y={740} width={18} height={180} fill="#30363a" />
		{/* a dial scale: pan, column, dial reading about 1.2 kg */}
		<g transform="translate(960,720)">
			<rect x={-120} y={-40} width={240} height={40} rx={8} fill="#6a7074" /><rect x={-150} y={-60} width={300} height={20} rx={8} fill="#8a9094" />
			<g transform="translate(0,-330)"><circle r={0} /></g>
		</g>
		<g transform="translate(1200,620)"><circle r={86} fill="#e8e4d8" /><circle r={86} fill="none" stroke="#5a6064" strokeWidth={10} />
			{Array.from({length: 11}, (_, i) => { const a = (-210 + i * 24) * Math.PI / 180; return <line key={i} x1={Math.cos(a) * 70} y1={Math.sin(a) * 70} x2={Math.cos(a) * (i % 5 ? 60 : 52)} y2={Math.sin(a) * (i % 5 ? 60 : 52)} stroke="#2a2a2a" strokeWidth={3} />; })}
			<text x={0} y={40} textAnchor="middle" style={{fontFamily: 'DejaVu Sans, sans-serif', fontSize: 18, fontWeight: 700}} fill="#2a2a2a">kg</text>
			<text x={-50} y={10} textAnchor="middle" style={{fontFamily: 'DejaVu Sans, sans-serif', fontSize: 16}} fill="#2a2a2a">0</text><text x={0} y={-36} textAnchor="middle" style={{fontFamily: 'DejaVu Sans, sans-serif', fontSize: 16}} fill="#2a2a2a">1</text><text x={50} y={10} textAnchor="middle" style={{fontFamily: 'DejaVu Sans, sans-serif', fontSize: 16}} fill="#2a2a2a">2</text>
			{(() => { const a = (-210 + 6 * 24) * Math.PI / 180; return <line x1={0} y1={0} x2={Math.cos(a) * 66} y2={Math.sin(a) * 66} stroke={RED} strokeWidth={5} strokeLinecap="round" />; })()}<circle r={8} fill="#2a2a2a" />
			<rect x={-30} y={86} width={60} height={14} fill="#5a6064" /></g>
		<g transform="translate(960,660)"><path d="M-110,0 L-110,-200 Q-110,-224 -86,-232 L86,-232 Q110,-224 110,-200 L110,0 Z" fill="#cfe2e6" opacity={0.14} stroke="#e8f2f4" strokeWidth={3} strokeOpacity={0.55} /></g>
		<BrainLight x={960} y={560} s={0.3} id="b9" />
		<Rimmed x={470} ground={912} h={640} pose={fkPose({...STAND, lean: 6, neck: 12, la: 50, le: 80, ra: 60, re: 70})} look={LK.harvey} col="#121616" rim={RIMB} rimOp={0.55} />
		{(() => { const p = fkPose({...STAND, lean: 6, neck: 12, la: 50, le: 80, ra: 60, re: 70}), h = jointAt(p, 'RHand', 470, 912, 640); return <rect x={h[0] - 10} y={h[1] - 70} width={70} height={92} fill="#e8e4d8" transform={`rotate(10 ${h[0]} ${h[1]})`} />; })()}
	</g>,
	furn: <Furniture sub={['你约[1.2公斤]，不比别人重。']} stamp={['1955 · 普林斯顿医院', '病理医生 哈维称重']} era="身后" age={<Age n={76} />} />,
};

/* 10 · the genius hunt: a microscope, a glowing slide, "found it!" */
const F10: KF = {
	scene: <g>
		<Sky id="s10" stops={[[0, '#1c2226'], [0.66, '#262e32'], [0.67, '#161a1c'], [1, '#0e1012']]} />
		<rect x={500} y={700} width={900} height={18} fill="#3a4044" />
		<Glow x={1080} y={640} r={300} c={B.halo} o={0.35} id="f10s" />
		{/* microscope */}
		<g transform="translate(1080,700)" fill="#0e1012"><rect x={-110} y={-24} width={220} height={24} rx={6} /><path d="M40,-24 L60,-24 L70,-260 Q60,-300 20,-300 L10,-260 Z" /><rect x={-80} y={-110} width={160} height={14} rx={4} />
			<rect x={-40} y={-330} width={56} height={170} rx={10} transform="rotate(-24 0 -250)" /><rect x={-70} y={-360} width={40} height={60} rx={8} transform="rotate(-24 0 -250)" /><rect x={-18} y={-170} width={20} height={56} /></g>
		<rect x={1010} y={588} width={140} height={10} fill={B.mid} /><Glow x={1080} y={593} r={70} c={B.core} o={0.9} id="f10g" />
		<Rimmed x={760} ground={912} h={620} pose={fkPose({hip: 0.37, lean: 34, neck: 22, lt: 86, lk: 90, rt: 82, rk: 86, la: 70, le: 50, ra: 64, re: 60})} look={LK.diamond} col="#121416" rim={RIMB} rimOp={0.6} />
		<g transform="translate(560,912)"><rect x={-60} y={-240} width={120} height={14} fill="#1a1e20" /><rect x={-4} y={-226} width={8} height={226} fill="#1a1e20" /></g>
		{/* what the eyepiece sees: abstract light, many small cells */}
		<g transform="translate(1500,470)"><circle r={210} fill="#120a08" /><circle r={210} fill="none" stroke="#3a3e42" strokeWidth={14} />
			<defs><clipPath id="f10c"><circle r={200} /></clipPath></defs>
			<g clipPath="url(#f10c)"><Glow x={0} y={0} r={260} c={B.halo} o={0.35} id="f10e" />{Array.from({length: 70}, (_, i) => <circle key={i} cx={(rnd(i, 41) - 0.5) * 400} cy={(rnd(i, 42) - 0.5) * 400} r={6 + 10 * rnd(i, 43)} fill={i % 3 ? B.mid : B.core} opacity={0.55 + 0.4 * rnd(i, 44)} />)}</g>
			<path d="M-300,120 L-212,60" stroke="#3a3e42" strokeWidth={6} /></g>
	</g>,
	furn: <Furniture sub={['[找到了]！', '你的胶质细胞比别人多！']} stamp={['1985 · 加州 伯克利', '戴蒙德的研究（4块组织）']} era="身后" age={<Age n={105} />} />,
};

/* 11 · 1997: across America in a teal-green sedan; light leaks from the trunk */
const F11: KF = {
	scene: <g>
		<Plate k="highway" />
		<path d="M1150,610 Q1180,600 1210,612 L1200,640 L1160,640 Z" fill="#7a8a70" opacity={0.9} />
		{/* the car, from behind, heading west */}
		<g transform="translate(960,830)">
			<ellipse cx={0} cy={118} rx={300} ry={26} fill="#000" opacity={0.35} />
			<path d="M-270,100 L-280,20 Q-276,-10 -240,-20 L-190,-120 Q-176,-140 -140,-142 L140,-142 Q176,-140 190,-120 L240,-20 Q276,-10 280,20 L270,100 Z" fill="#2f5a56" />
			<path d="M-176,-118 Q-164,-130 -136,-130 L136,-130 Q164,-130 176,-118 L206,-36 L-206,-36 Z" fill="#1c2a2e" />
			<circle cx={-62} cy={-74} r={30} fill="#0c1012" /><path d="M-92,-36 Q-92,-60 -62,-62 Q-32,-60 -32,-36 Z" fill="#0c1012" />
			<circle cx={70} cy={-78} r={28} fill="#0c1012" /><path d="M42,-36 Q44,-60 70,-62 Q98,-60 98,-36 Z" fill="#0c1012" /><path d="M48,-96 Q70,-118 94,-96 Q84,-108 70,-108 Z" fill="#0c1012" />
			<rect x={-240} y={-14} width={480} height={8} fill="#24484a" />
			<Glow x={0} y={-8} r={260} c={B.halo} o={0.55} id="f11t" /><rect x={-230} y={-10} width={460} height={4} fill={B.core} opacity={0.9} /><Glow x={0} y={-8} r={110} c={B.core} o={0.6} id="f11tc" />
			<rect x={-262} y={10} width={70} height={26} rx={4} fill="#7a2a24" /><rect x={192} y={10} width={70} height={26} rx={4} fill="#7a2a24" />
			<rect x={-70} y={40} width={140} height={34} rx={3} fill="#d8d4c4" opacity={0.85} />
			<rect x={-280} y={80} width={560} height={26} rx={8} fill="#1a2a2a" /><rect x={-250} y={100} width={80} height={30} rx={8} fill="#0c0e10" /><rect x={170} y={100} width={80} height={30} rx={8} fill="#0c0e10" />
		</g>
	</g>,
	furn: <Furniture sub={['坐车[横穿美国]，6000多公里，']} stamp={['1997 · 堪萨斯 → 伯克利', '84岁的哈维与作家帕特尼蒂']} era="身后" age={<Age n={117} />} />,
};

/* 12 · the ending: the childhood compass glowing in a small hand */
const F12: KF = {
	scene: <g>
		<Sky id="s12" stops={[[0, '#14191c'], [1, '#221a14']]} />
		<Glow x={1160} y={640} r={700} c={B.halo} o={0.22} id="f12w" />
		{/* a small hand from below, palm up, cupping the compass */}
		<g fill="#120d0c">
			<path d="M980,1100 Q1000,880 1060,780 L1240,760 Q1290,860 1300,1100 Z" />
			<path d="M1040,800 Q1030,720 1080,690 Q1150,670 1250,700 Q1300,720 1290,770 Q1230,800 1150,800 Z" />
			<path d="M1250,705 Q1300,660 1336,676 Q1346,700 1300,740 Z" />
		</g>
		<path d="M1040,800 Q1030,720 1080,690 Q1150,670 1250,700 Q1300,720 1290,770" stroke="#ffc4a0" strokeWidth={3} fill="none" opacity={0.6} />
		<Compass x={1160} y={650} r={110} a={14} glow={1} id="f12c" />
		<Glow x={1160} y={650} r={200} c={B.core} o={0.35} id="f12cc" />
	</g>,
	furn: <Furniture sub={['我没有[特别的天赋]，', '我只是有强烈的[好奇心]。']} stamp={['今天 · 2026', '他的话（柏林纪念牌）']} era="今天" age={<Age n={147} />}
		extra={<><div style={{position: 'absolute', left: 150, top: 330, fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: INK, textShadow: '0 2px 6px rgba(12,8,5,0.65)'}}>——爱因斯坦</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 200, textAlign: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: INK, letterSpacing: '0.04em', textShadow: '0 0 2px rgba(12,8,5,0.9), 0 3px 24px rgba(12,8,5,0.6)'}}>如果是你，愿意把大脑<span style={{color: RED}}>留给科学</span>吗？</div></>} />,
};
export const FRAMES44: KF[] = [F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12];
void Blur; void H;
