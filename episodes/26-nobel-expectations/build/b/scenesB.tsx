import React from 'react';
import {interpolate} from 'remotion';
import {Phone, AppScreen, Banner, T as T0} from '../Open26';
import {C, W, H, SANS, SERIF, NUM} from './kit';
import {E, ramp, mix, enter, exit, env, land, slam, riseStyle, riseT, drift, Cam} from './motion';
import {SL, Plate2, DK, DarkBar, Bubble} from './ui';
import {Bread} from './OpenB';
import {City, VaultDoor, Ledger, Hardcover, Balance, Lamp, Brick, Shop, Broken, PAPER, INKB, INKD, CRIMSON} from './props';
import {st, W0, W0C} from './scenesA';

const PW = 400, PH = 820;

/* ===================== Vault 76.2–84.1 ===================== */
export const VaultScene: React.FC<{t: number}> = ({t}) => {
	if (t < 76.2 || t > 84.15) return null;
	const inn = ramp(t, 76.2, 77.2, E.CAM);
	const push = mix(ramp(t, 77.2, 81.4, E.LIN), 1, 1.02);
	const wheel = 120 * ramp(t, 81.0, 81.43, E.MOVE);
	const bolts = ramp(t, 81.43, 81.63, E.EXIT);
	const open = t < 81.5 ? 0 : Math.min(1.03, land(t, 81.5, {damping: 13, stiffness: 70}));
	const inside = ramp(t, 81.5, 82.3, E.CAM);
	const dive = ramp(t, 83.3, 84.1, E.MOVE);
	const q = env(t, st(27) + 0.3, 79.2, 0.5, 0.3);
	const dust = Array.from({length: 40}, (_, i) => {
		const u = (t * 0.06 + i * 0.137) % 1;
		return {x: 820 + ((i * 53) % 280), y: 120 + u * 640, r: 1.5 + (i % 3), o: Math.sin(u * Math.PI) * 0.6};
	});
	return (
		<Cam x={mix(inn, -1400, 0)} s={push * mix(dive, 1, 2.6)} fx={960} fy={600} o={1 - ramp(t, 83.7, 84.1, E.EXIT)}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<defs>
					<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe3a0" stopOpacity={0.22} /><stop offset="1" stopColor="#ffe3a0" stopOpacity={0} /></linearGradient>
					<radialGradient id="spill"><stop offset="0" stopColor="#ffd998" stopOpacity={0.45} /><stop offset="1" stopColor="#ffd998" stopOpacity={0} /></radialGradient>
				</defs>
				<polygon points="900,0 1020,0 1260,860 660,860" fill="url(#beam)" />
				<ellipse cx={960} cy={900} rx={620 * inside + 10} ry={120 * inside + 4} fill="url(#spill)" />
			</svg>
			<VaultDoor wheel={wheel} bolts={bolts} open={open} inside={inside} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				{dust.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#ffe9b8" opacity={d.o} />)}
				<g opacity={q} transform={riseT(enter(t, st(27) + 0.3))}><text x={960} y={150} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 150, fontWeight: 900}} fill={C.gold}>？</text></g>
			</svg>
		</Cam>
	);
};

/* ===================== Ledger 83.3–87.4 ===================== */
export const LedgerScene: React.FC<{t: number}> = ({t}) => {
	if (t < 83.3 || t > 87.4) return null;
	const inn = ramp(t, 83.3, 84.1, E.MOVE);
	const out = ramp(t, 86.4, 87.3, E.CAM);
	const sl = slam(t, st(29) + 0.7);
	const d = drift(t, 84, 3);
	return (
		<Cam s={mix(inn, 0.35, 1) * mix(out, 1, 0.4) * d.s} x={mix(out, 0, -900) + d.x} y={mix(inn, 160, 0)} fx={960} fy={560} o={Math.min(1, inn * 1.6) * (1 - ramp(t, 86.8, 87.3, E.EXIT))}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Ledger x={960} y={470} s={0.86} />
				{t > st(29) + 0.7 && (
					<g opacity={sl.o} transform={`translate(${1190 + sl.shake} 560) rotate(-14) scale(${sl.s})`}>
						<rect x={-150} y={-74} width={300} height={136} rx={12} fill="none" stroke={CRIMSON} strokeWidth={9} />
						<text x={0} y={36} textAnchor="middle" style={{fontFamily: SANS, fontSize: 100, fontWeight: 900}} fill={CRIMSON}>0 次</text>
					</g>
				)}
			</svg>
		</Cam>
	);
};

/* ===================== Woodford's book 98.2–102.9 ===================== */
export const BookScene: React.FC<{t: number}> = ({t}) => {
	if (t < 98.2 || t > 103.0) return null;
	const wipe = ramp(t, 98.2, 99.0, E.CAM);
	const truck = ramp(t, 102.0, 102.9, E.CAM);
	const d = drift(t, 98.6, 5);
	return (
		<>
			<Cam x={mix(truck, 0, -1690) + d.x} y={d.y} o={wipe} filter={`brightness(${mix(wipe, 0.3, 1)})`}>
				<Hardcover />
			</Cam>
			<Cam x={mix(truck, 0, -1300)} o={wipe}>
				<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
					<g opacity={enter(t, st(34) + 0.2)} transform={riseT(enter(t, st(34) + 0.2))}><Plate2 x={900} y={300} name="伍德福德 · 哥伦比亚大学" sub="另一位 2026 年得主" /></g>
					<g opacity={enter(t, st(34) + 0.7)} transform={riseT(enter(t, st(34) + 0.7))}>
						<SL x={900} y={500} text="研究的是：" size={48} anchor="start" col={C.mute} />
						<SL x={900} y={610} text="央行该怎么说话" size={80} anchor="start" col={C.gold} serif weight={900} />
					</g>
				</svg>
			</Cam>
		</>
	);
};

/* ===================== the scale 102.0–111.8 ===================== */
export const ScaleScene: React.FC<{t: number}> = ({t}) => {
	if (t < 102.0 || t > 111.8) return null;
	const inn = ramp(t, 102.0, 102.9, E.CAM);
	const sw = t < st(36) + 0.2 ? 0 : land(t, st(36) + 0.2, {damping: 6, stiffness: 50});
	const tilt = -8 + 20 * sw;
	const lampOn = t < st(37) + 0.4 ? 0 : (t < st(37) + 0.47 ? 1 : t < st(37) + 0.53 ? 0.2 : 1) * ramp(t, st(37) + 0.4, st(37) + 0.45, E.LIN);
	const lift = ramp(t, 110.9, 111.7, E.MOVE);
	const fade = ramp(t, 110.9, 111.6, E.CAM);
	const d = drift(t, 103, 7);
	const cx = 900, cy = 300;
	const paper = (
		<g transform={`translate(0 ${-40})`} opacity={1 - Math.min(1, lift * 4)}>
			<rect x={-90} y={-62} width={180} height={88} fill={PAPER} transform="rotate(-4)" />
			<text x={0} y={0} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 48, fontWeight: 900}} fill={INKD} transform="rotate(-4)">一句话</text>
		</g>
	);
	const la = (tilt * Math.PI) / 180, rx = cx + 420 * Math.cos(la), ry = cy + 420 * Math.sin(la);
	return (
		<>
			<Cam x={mix(inn, 1300, 0) + d.x} y={d.y} s={d.s} o={1 - ramp(t, 111.2, 111.7, E.EXIT)} filter={fade > 0 ? `brightness(${mix(fade, 1, 0.25)})` : undefined}>
				<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
					<Lamp x={rx} y={60} on={lampOn} />
					<Balance cx={cx} cy={cy} tilt={tilt} left={<g transform="translate(0 -60) scale(0.7)"><Brick x={0} y={0} /></g>} right={paper} />
					<SL x={cx - 420 * Math.cos(la)} y={cy - 420 * Math.sin(la) + 380} text="钱" size={64} />
					<g opacity={enter(t, st(36) + 0.4)}><SL x={rx} y={ry + 380} text="承诺" size={64} col={C.gold} weight={900} /></g>
					<g opacity={enter(t, st(37) + 0.6)} transform={riseT(enter(t, st(37) + 0.6))}><SL x={rx - 140} y={120} text="前提：有人信" size={52} anchor="end" col={C.gold} /></g>
				</svg>
			</Cam>
			{/* T14: the paper lifts off the right pan and flies to the document */}
			{lift > 0 && lift < 1 && (
				<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
					<g transform={`translate(${mix(lift, rx + d.x, 1220)} ${mix(lift, ry + 180, 470) - Math.sin(lift * Math.PI) * 120}) scale(${mix(lift, 1, 2.6)} ${mix(lift, 1, 1.6)})`}>
						<rect x={-90} y={-62} width={180} height={88} fill={PAPER} />
						<text x={0} y={0} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 48, fontWeight: 900}} fill={INKD} opacity={1 - lift}>一句话</text>
					</g>
				</svg>
			)}
		</>
	);
};

/* ===================== 我保证 vs 我觉得 111.6–124.0 ===================== */
export const CardsScene: React.FC<{t: number}> = ({t}) => {
	if (t < 111.6 || t > 124.1) return null;
	const unfold = ramp(t, 111.6, 112.2, E.ENTER);
	const settle = land(t, 112.0);
	const think = enter(t, st(39), 0.6);
	const blow = ramp(t, st(39) + 1.6, st(39) + 2.3, E.EXIT);
	const sig = ramp(t, st(40) + 0.2, st(40) + 1.3, E.MOVE);
	const seal = slam(t, st(40) + 1.2);
	const tear = t < st(41) + 0.3 ? 0 : land(t, st(41) + 0.3, {damping: 18, stiffness: 90});
	const fall = ramp(t, 122.9, 123.5, E.EXIT);
	const tilt = ramp(t, 123.2, 124.0, E.CAM);
	const pool = 1 - ramp(t, st(41) + 0.5, st(41) + 1.3, E.EXIT);
	const dx = 1220, dy = 470;
	const half = (side: -1 | 1) => (
		<g transform={`translate(${side * 70 * tear + side * 120 * fall} ${30 * tear + 900 * fall * fall}) rotate(${side * (10 * tear + 12 * fall)} ${dx} ${dy})`}>
			<g clipPath={`url(#tear${side > 0 ? 'R' : 'L'})`}>
				<rect x={dx - 300} y={dy - 200} width={600} height={400} fill={PAPER} />
				<rect x={dx - 280} y={dy - 180} width={560} height={360} fill="none" stroke={C.gold} strokeWidth={2} />
				<text x={dx} y={dy + 10} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 110, fontWeight: 900}} fill={INKD}>我保证</text>
				<path d={`M${dx - 170} ${dy + 110} c30 -40 50 30 80 -10 s40 -30 60 10 s50 -20 70 0 s40 10 70 -10`} fill="none" stroke="#1d2f6b" strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={`${sig} 1`} />
				{t > st(40) + 1.2 && (
					<g opacity={seal.o} transform={`translate(${dx + 190 + seal.shake} ${dy + 100}) rotate(-8) scale(${seal.s})`}>
						<rect x={-50} y={-50} width={100} height={100} rx={8} fill="#b8402e" opacity={0.92} />
						<text x={0} y={-6} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 40, fontWeight: 900}} fill="#f8e8d8">信</text>
						<text x={0} y={38} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 40, fontWeight: 900}} fill="#f8e8d8">用</text>
					</g>
				)}
			</g>
		</g>
	);
	const jag = `${dx + 10},${dy - 220} ${dx - 20},${dy - 120} ${dx + 25},${dy - 40} ${dx - 15},${dy + 40} ${dx + 20},${dy + 120} ${dx - 10},${dy + 220}`;
	return (
		<Cam y={mix(tilt, 0, -1080)}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<defs>
					<radialGradient id="docPool"><stop offset="0" stopColor="#ffd998" stopOpacity={0.3} /><stop offset="1" stopColor="#ffd998" stopOpacity={0} /></radialGradient>
					<clipPath id="tearL"><polygon points={`${dx - 400},${dy - 260} ${jag} ${dx - 400},${dy + 260}`} /></clipPath>
					<clipPath id="tearR"><polygon points={`${dx + 400},${dy - 260} ${jag} ${dx + 400},${dy + 260}`} /></clipPath>
				</defs>
				<ellipse cx={dx} cy={dy} rx={360 * pool} ry={300 * pool} fill="url(#docPool)" />
				{/* 我觉得: a smoked-glass forecast that blows away */}
				<g opacity={Math.min(1, think / 0.6) * (1 - blow)} transform={`translate(${-500 * blow} ${riseTnum(think)}) rotate(${-18 * blow} 520 480)`}>
					<text x={520} y={250} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 80, fontWeight: 900}} fill="#9a958c">我觉得</text>
					<rect x={330} y={300} width={380} height={300} rx={24} fill="rgba(30,32,36,0.7)" stroke="rgba(255,255,255,0.18)" />
					<path d="M440 420 a40 40 0 0 1 70 -30 a50 50 0 0 1 90 20 a34 34 0 0 1 -10 66 h-140 a30 30 0 0 1 -10 -56z" fill="none" stroke="#9aa3ad" strokeWidth={4} />
					{Array.from({length: 6}, (_, i) => <line key={i} x1={455 + i * 24} x2={445 + i * 24} y1={500} y2={530} stroke="#9aa3ad" strokeWidth={3} strokeLinecap="round" />)}
					<text x={520} y={575} textAnchor="middle" style={{fontFamily: SANS, fontSize: 44, fontWeight: 800}} fill="#d8dde3">明天 降雨 70%</text>
					<g opacity={enter(t, st(39) + 0.6)}><SL x={520} y={680} text="说错了，不负责" size={44} col="#a8a29a" weight={700} /></g>
				</g>
				{blow > 0 && blow < 1 && Array.from({length: 8}, (_, i) => <line key={i} x1={700 - blow * 900 + i * 40} x2={660 - blow * 900 + i * 40} y1={300 + i * 30} y2={340 + i * 30} stroke="#9aa3ad" strokeOpacity={0.5} strokeWidth={2} />)}
				{/* 我保证: unfolds from the flying paper, signed, sealed, torn */}
				<g transform={`translate(0 ${(1 - Math.min(1, settle)) * -40}) translate(${dx} ${dy}) scale(1 ${mix(unfold, 0.4, 1)}) translate(${-dx} ${-dy})`} opacity={Math.min(1, unfold * 3)}>
					<rect x={dx - 290} y={dy - 180} width={600} height={400} fill="#000" opacity={0.5} style={{filter: 'blur(16px)'}} />
					{half(-1)}
					{half(1)}
				</g>
				<g opacity={env(t, st(40) + 1.4, st(41) - 0.1)} transform={riseT(enter(t, st(40) + 1.4))}><SL x={dx} y={780} text="做不到，就丢信用" size={52} col={C.gold} /></g>
				<g opacity={enter(t, st(41) + 0.8)} transform={riseT(enter(t, st(41) + 0.8))}><SL x={dx} y={800} text="下次，没人信了" size={56} col={C.red} weight={900} /></g>
			</svg>
		</Cam>
	);
};
const riseTnum = (p: number) => (1 - p) * 32;

/* ===================== the same loop near you: 123.2–127.3 ===================== */
export const NearCity: React.FC<{t: number}> = ({t}) => {
	if (t < 123.2 || t > 127.35) return null;
	const up = ramp(t, 123.2, 124.0, E.CAM);
	const dive = ramp(t, 126.5, 127.3, E.CAM);
	const loopP = ramp(t, 124.0, 125.0, E.MOVE);
	return (
		<>
			<Cam y={mix(up, 1080, 0)} s={mix(dive, 1, 30)} fx={W0C.x} fy={W0C.y} o={1 - ramp(t, 126.9, 127.3, E.EXIT)}>
				<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
					<City lit={0.45} force={W0} />
					<ellipse cx={W0C.x} cy={W0C.y + 40} rx={420} ry={200} fill="none" stroke={CRIMSON} strokeWidth={8} pathLength={1} strokeDasharray={`${loopP} 1`} />
					{loopP >= 1 && <ellipse cx={W0C.x} cy={W0C.y + 40} rx={420} ry={200} fill="none" stroke="#fff4e0" strokeOpacity={0.6} strokeWidth={4} strokeDasharray="14 90" strokeDashoffset={-(t - 125) * 180} />}
				</svg>
			</Cam>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<g opacity={env(t, 124.2, 126.4)} transform={riseT(enter(t, 124.2))}><SL x={960} y={150} text="同一个漩涡" size={64} col={C.red} weight={900} /></g>
			</svg>
		</>
	);
};

/* ===================== your phone, the shop, then back to you: 126.5–154.6 (one phone, no cut) ===================== */
const CartDark: React.FC<{cart: number}> = ({cart}) => (
	<div style={{position: 'absolute', inset: 0, background: DK.bg}}>
		<DarkBar title="购物车" />
		<div style={{position: 'absolute', top: 260, width: '100%', textAlign: 'center', fontFamily: SANS}}>
			<div style={{fontFamily: NUM, fontSize: 150, fontWeight: 700, color: cart === 0 ? DK.sys : C.gold}}>¥{cart}</div>
			<div style={{fontSize: 34, fontWeight: 800, color: DK.sys, opacity: cart === 0 ? 1 : 0, marginTop: 10}}>已清空 · 钱先存着</div>
		</div>
	</div>
);
const ChatDark: React.FC<{t: number; who: 'boss' | 'friend'; sent?: number}> = ({t, who, sent = 0}) => {
	const scroll = who === 'boss' ? land(t, st(47) + 0.1, {damping: 14, stiffness: 90}) : 0;
	return (
		<div style={{position: 'absolute', inset: 0, background: DK.bg, overflow: 'hidden'}}>
			{who === 'boss' ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 140 - 300 + 300 * Math.min(1.08, scroll), display: 'flex', flexDirection: 'column'}}>
					<Bubble who="sys">去年 10 月</Bubble>
					<Bubble who="boss">明年给你涨工资</Bubble>
					<Bubble who="me">谢谢老板！</Bubble>
					<Bubble who="sys">……之后，再没提过</Bubble>
					<Bubble who="sys">今天 21:04</Bubble>
					<Bubble who="boss">明年给你涨工资</Bubble>
				</div>
			) : (
				<div style={{position: 'absolute', right: 20, top: interpolate(Math.min(1, sent), [0, 1], [700, 200]), opacity: Math.min(1, sent * 2), display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
					<div style={{padding: '18px 26px', borderRadius: 26, background: DK.me, color: DK.meInk, fontFamily: SANS, fontSize: 48, fontWeight: 900}}>我保证</div>
					<div style={{marginTop: 8, fontFamily: SANS, fontSize: 26, fontWeight: 700, color: C.gold, opacity: ramp(t, st(50) + 1.0, st(50) + 1.3)}}>✓ 已读</div>
				</div>
			)}
			<DarkBar title={who === 'boss' ? '老板' : '朋友'} />
		</div>
	);
};
export const PhoneSection: React.FC<{t: number}> = ({t}) => {
	if (t < 126.5 || t > 154.7) return null;
	// phone: emerges from the window (T16), holds, grows for the chat (T17), page push (T18)
	const emerge = ramp(t, 126.5, 127.3, E.CAM);
	const grow = ramp(t, 135.3, 136.4, E.CAM);
	const ph = {cx: mix(emerge, W0C.x, 520), cy: mix(emerge, W0C.y, 500), s: mix(emerge, 0.05, 1.0) * mix(grow, 1, 1.3)};
	const pcx = mix(grow, ph.cx, 500), pcy = mix(grow, ph.cy, 560);
	const note = land(t, st(43) + 0.1);
	const cart = Math.round(mix(ramp(t, st(43) + 0.8, st(43) + 1.6, E.MOVE), 58, 0));
	const shopIn = ramp(t, 126.9, 127.8, E.ENTER), shopOut = ramp(t, 135.3, 135.9, E.EXIT);
	const shutter = mix(ramp(t, st(44) + 0.3, st(44) + 1.1, E.MOVE), 0.33, 0.66);
	const shopLit = mix(ramp(t, st(44) + 0.3, st(44) + 1.4, E.CAM), 1, 0.45);
	const notice = t < st(45) + 0.3 ? 0 : Math.min(1, land(t, st(45) + 0.3));
	const a1 = ramp(t, st(44) + 0.1, st(44) + 0.8), a2 = ramp(t, st(45) + 0.7, st(45) + 1.4);
	const scr = ramp(t, 135.4, 135.9, E.MOVE); // cart → boss chat
	const appIn = ramp(t, st(48) + 0.05, st(48) + 0.45, E.MOVE), appOut = ramp(t, st(49) + 0.05, st(49) + 0.45, E.MOVE);
	const push = ramp(t, 148.0, 148.45, E.MOVE);
	const sent = t < st(50) + 0.4 ? 0 : land(t, st(50) + 0.4);
	// the reverse tap on line 48: 58 rolls back to 26
	const tap = T0.s2 + 34;
	const fRev = mix(ramp(t, st(48) + 0.5, st(48) + 1.4, E.MOVE), tap + 26, tap);
	// right side
	const bIn = ramp(t, 135.4, 136.1, E.ENTER);
	const q = env(t, st(46) + 0.5, st(47) + 0.8);
	const crack = t < st(47) + 1.0 ? 0 : land(t, st(47) + 1.0);
	const grey = ramp(t, st(47) + 1.0, st(47) + 1.6, E.CAM);
	const brokenO = 1 - exit(t, st(48) - 0.05, 0.3);
	const cheap = env(t, st(48) + 0.3, st(49) - 0.35);
	const pair = env(t, st(49) + 0.05, 147.9, 0.6, 0.35);
	const yourWords = enter(t, st(50) + 0.2);
	const ticks = [0, 1, 2, 3, 4].map((i) => (t < 150.9 + i * 0.506 ? 0 : land(t, 150.9 + i * 0.506)));
	const gather = ramp(t, 153.6, 154.2, E.MOVE);
	const fadeAll = ramp(t, 153.9, 154.5, E.EXIT);
	const fly = ramp(t, 154.0, 154.6, E.MOVE);
	return (
		<>
			<div style={{position: 'absolute', inset: 0, opacity: 1 - fadeAll}}>
				{/* the shop at street level */}
				{t < 136.0 && (
					<svg width={W} height={H} style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - shopIn) * 900 + shopOut * 900}px)`}}>
						<Shop x={1380} y={560} shutter={shutter} lit={shopLit} notice={notice} t={t} />
						<SL x={1380} y={110} text="楼下小面馆" size={56} />
					</svg>
				)}
				{/* the loop between you and the shop */}
				{t < 135.5 && (
					<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 1 - shopOut}}>
						<path d="M780 260 Q 980 120 1150 240" fill="none" stroke={CRIMSON} strokeWidth={8} pathLength={1} strokeDasharray={`${a1} 1`} />
						{a1 >= 1 && <path d="M780 260 Q 980 120 1150 240" fill="none" stroke="#fff4e0" strokeOpacity={0.6} strokeWidth={4} strokeDasharray="14 90" strokeDashoffset={-(t - 130) * 160} />}
						<g opacity={a1}><SL x={965} y={150} text="你少花" size={48} col={C.red} /></g>
						<path d="M1150 820 Q 980 930 790 840" fill="none" stroke={CRIMSON} strokeWidth={8} pathLength={1} strokeDasharray={`${a2} 1`} />
						{a2 >= 1 && <path d="M1150 820 Q 980 930 790 840" fill="none" stroke="#fff4e0" strokeOpacity={0.6} strokeWidth={4} strokeDasharray="14 90" strokeDashoffset={-(t - 133) * 160} />}
						<g opacity={a2}><SL x={965} y={880} text="它裁人" size={48} col={C.red} /></g>
					</svg>
				)}
				{/* one phone */}
				<div style={{position: 'absolute', left: pcx - PW / 2, top: pcy - PH / 2, transform: `scale(${ph.s})`, transformOrigin: '50% 50%', opacity: Math.min(1, emerge * 3)}}>
					<Phone>
						{scr < 1 && <div style={{position: 'absolute', inset: 0, opacity: 1 - scr}}><CartDark cart={cart} /></div>}
						{scr > 0 && push < 1 && <div style={{position: 'absolute', inset: 0, opacity: scr, transform: `translateX(${-30 * push}%)`}}><ChatDark t={t} who="boss" /></div>}
						{appIn > 0 && appOut < 1 && <div style={{position: 'absolute', inset: 0, opacity: appIn * (1 - appOut)}}><AppScreen f={fRev} /></div>}
						{push > 0 && <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - push) * 100}%)`, boxShadow: '-20px 0 40px rgba(0,0,0,0.5)'}}><ChatDark t={t} who="friend" sent={sent} /></div>}
						{t < 135.8 && (
							<div style={{position: 'absolute', left: 14, right: 14, top: interpolate(Math.min(1, note), [0, 1], [-160, 44]), opacity: Math.min(1, note * 2), borderRadius: 26, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center', background: 'rgba(250,250,250,0.96)'}}>
								<div style={{width: 58, height: 58, borderRadius: 15, background: 'linear-gradient(160deg,#ff8a5b,#d4482b)', color: '#fff', fontFamily: SANS, fontSize: 32, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>!</div>
								<div style={{fontFamily: SANS, color: '#161616'}}><div style={{fontSize: 24, fontWeight: 800}}>公司通知</div><div style={{fontSize: 32, fontWeight: 900}}>明年可能要裁员</div></div>
							</div>
						)}
					</Phone>
				</div>
				<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
					<defs><radialGradient id="bHalo"><stop offset="0" stopColor={C.gold} stopOpacity={0.28} /><stop offset="1" stopColor={C.gold} stopOpacity={0} /></radialGradient></defs>
					{/* the boss's 饼 slides in (T17), cracks on line 47 */}
					{t > 135.4 && brokenO > 0 && (
						<g transform={`translate(${(1 - bIn) * 700} 0) rotate(${(1 - bIn) * 6} 1320 430)`} opacity={brokenO}>
							<circle cx={1320} cy={430} r={330} fill="url(#bHalo)" opacity={1 - grey * 0.7} />
							{crack <= 0 ? <Bread x={1320} y={430} r={170} bite={1} id="bk" /> : <Broken x={1320} y={430} r={170} split={Math.min(1.1, crack)} grey={grey} id="bb" />}
							<g opacity={q} transform={riseT(enter(t, st(46) + 0.5))}><text x={1320} y={730} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 110, fontWeight: 900}} fill={C.gold}>？</text></g>
							<g opacity={enter(t, st(47) + 1.3)} transform={riseT(enter(t, st(47) + 1.3))}><SL x={1320} y={720} text="去年那张，没兑现" size={52} col={C.mute} /></g>
						</g>
					)}
					<g opacity={cheap} transform={riseT(enter(t, st(48) + 0.3))}>
						<SL x={1300} y={420} text="这次，一分都不多花" size={60} />
						<text x={1300} y={560} textAnchor="middle" style={{fontFamily: NUM, fontSize: 120, fontWeight: 700}} fill={C.ink}>¥26</text>
					</g>
					{pair > 0 && (
						<g opacity={pair} transform={riseT(enter(t, st(49) + 0.05))}>
							<circle cx={1120} cy={420} r={250} fill="url(#bHalo)" />
							<Bread x={1120} y={420} r={140} id="kp" />
							<SL x={1120} y={650} text="说到做到" size={52} col={C.gold} />
							<Broken x={1580} y={420} r={140} split={1} grey={0.85} id="kb" />
							<SL x={1580} y={650} text="说了不做" size={52} col={C.mute} />
						</g>
					)}
					<g opacity={yourWords * (1 - gather)} transform={riseT(yourWords)}><SL x={1300} y={330} text="你说出去的话" size={60} /></g>
					{ticks.map((k, i) => {
						const x0 = 1060 + i * 120, y0 = 470;
						const gx = mix(gather, x0, 1300), gy = y0;
						return k > 0 && (
							<g key={i} transform={`translate(${gx} ${gy}) scale(${Math.min(1.1, k) * mix(gather, 1, 0.4)})`}>
								<circle r={46} fill={C.gold} />
								<path d="M-20 0 l14 16 l26 -30" stroke="#2a1d08" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
							</g>
						);
					})}
					<g opacity={enter(t, 152.5) * (1 - gather)} transform={riseT(enter(t, 152.5))}><SL x={1300} y={620} text="兑现一次，就多值一分" size={52} col={C.gold} /></g>
				</svg>
			</div>
			{/* T19: the gathered gold dot travels to the end card's motif */}
			{t > 153.9 && fly < 1 && (
				<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
					<circle cx={mix(fly, 1300, 960)} cy={mix(fly, 470, 556)} r={mix(fly, 22, 34)} fill={C.gold} opacity={1 - ramp(t, 154.4, 154.6)} style={{filter: 'drop-shadow(0 0 16px rgba(226,194,127,0.8))'}} />
				</svg>
			)}
		</>
	);
};
