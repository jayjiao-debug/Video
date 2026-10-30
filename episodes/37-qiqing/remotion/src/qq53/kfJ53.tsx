import React from 'react';
import {W, H, lerp, rnd, SANS} from '../qq50/kit50';
import {LacDefs, Lacquer, Vignette, Pool, B} from '../qq50/styleB';
import {DepthTag, Tag} from './parts53';
import {Sword, SW, bladeHW} from './props53';
/* ep53 v3 key frames, part J — the open inner coffin, top-down (owner note 0:39: the occupant as a respectful, simplified
   skeleton, not dashed ovals). Bone-cream line art at low contrast, no gore, a few remnants of the shroud; the head to the
   RIGHT, so the occupant's LEFT is the near (lower) side of the frame, and the sword lies there in its black lacquer sheath,
   hilt toward the waist, pommel to the right — the same direction as the draw that follows (KF07). Scale: 0.62 px per mm
   (the inner coffin's floor 2.1 × 0.64 m). The coffin: black lacquer walls with a red line border, the outer coffin's rim
   beyond, the 椁's planks beyond that; the hurricane lamp (off frame, top) is the one key. */
const KP = 0.62, CX = 960, CY = 640;   // px per mm; the pelvis centre on screen
const X = (x: number) => CX + x * KP, Y = (y: number) => CY + y * KP;
const BONE = '#DCCDB0';
const bone = (d: string, w = 2.6, k: string | number = 0) => <path key={String(k) + d.slice(0, 12)} d={d} fill={BONE} fillOpacity={0.07} stroke={BONE} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
const seg2 = (x0: number, y0: number, x1: number, y1: number, w0: number, k: string) => { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), nx = -dy / l * w0 * KP, ny = dx / l * w0 * KP;
	const a = [X(x0), Y(y0)], b = [X(x1), Y(y1)], r = w0 * 1.5 * KP;
	return <g key={k}>{bone(`M${a[0] + nx},${a[1] + ny} L${b[0] + nx * 0.8},${b[1] + ny * 0.8} M${a[0] - nx},${a[1] - ny} L${b[0] - nx * 0.8},${b[1] - ny * 0.8}`, 2.2, k)}
		<circle cx={a[0]} cy={a[1]} r={r} fill="none" stroke={BONE} strokeWidth={2.2} /><circle cx={b[0]} cy={b[1]} r={r * 0.85} fill="none" stroke={BONE} strokeWidth={2.2} /></g>; };
/** the skeleton, supine, head to +x; local mm, origin at the pelvis, y → the occupant's left (screen down) */
export const Skeleton: React.FC<{o?: number}> = ({o = 0.42}) => { const out: React.ReactNode[] = [];
	/* skull seen from above (the face up), the jaw, soft socket hints */
	out.push(<ellipse key="sk" cx={X(770)} cy={Y(0)} rx={108 * KP} ry={76 * KP} fill={BONE} fillOpacity={0.1} stroke={BONE} strokeWidth={2.8} />);
	out.push(bone(`M${X(690)},${Y(-52)} Q${X(615)},${Y(0)} ${X(690)},${Y(52)}`, 2.6, 'jaw'));
	[-30, 30].forEach((y) => out.push(<ellipse key={`e${y}`} cx={X(735)} cy={Y(y)} rx={17 * KP} ry={20 * KP} fill="#3A2418" fillOpacity={0.2} stroke={BONE} strokeOpacity={0.35} strokeWidth={1.4} />));
	/* the spine */
	for (let x = 640; x > 40; x -= 34) out.push(<rect key={`v${x}`} x={X(x - 14)} y={Y(-11)} width={26 * KP} height={22 * KP} rx={6} fill={BONE} fillOpacity={0.1} stroke={BONE} strokeWidth={1.8} />);
	/* clavicles, ribs, sternum */
	[-1, 1].forEach((s) => { out.push(bone(`M${X(548)},${Y(s * 18)} Q${X(560)},${Y(s * 100)} ${X(528)},${Y(s * 165)}`, 2.6, `cl${s}`));
		for (let i = 0; i < 7; i++) { const x = 510 - i * 36; out.push(bone(`M${X(x)},${Y(s * 12)} C${X(x + 8)},${Y(s * 120)} ${X(x - 70)},${Y(s * 150)} ${X(x - 112)},${Y(s * 118)}`, 2.2, `r${s}${i}`)); } });
	out.push(bone(`M${X(520)},${Y(0)} L${X(330)},${Y(0)}`, 3, 'st'));
	/* pelvis: the two wings and the sacrum */
	[-1, 1].forEach((s) => out.push(bone(`M${X(70)},${Y(s * 14)} C${X(100)},${Y(s * 70)} ${X(70)},${Y(s * 150)} ${X(10)},${Y(s * 140)} C${X(-50)},${Y(s * 128)} ${X(-60)},${Y(s * 60)} ${X(-30)},${Y(s * 20)} Z`, 2.6, `p${s}`)));
	out.push(bone(`M${X(40)},${Y(-22)} L${X(-50)},${Y(-12)} L${X(-50)},${Y(12)} L${X(40)},${Y(22)} Z`, 2, 'sac'));
	/* arms at the sides, hands by the hips */
	[-1, 1].forEach((s) => { out.push(seg2(520, s * 175, 245, s * 185, 13, `hu${s}`)); out.push(seg2(245, s * 185, 20, s * 165, 10, `ra${s}`));
		for (let f = 0; f < 4; f++) out.push(bone(`M${X(10)},${Y(s * (150 + f * 9))} L${X(-55 - f * 4)},${Y(s * (146 + f * 12))}`, 1.8, `h${s}${f}`)); });
	/* legs and feet */
	[-1, 1].forEach((s) => { out.push(seg2(-20, s * 85, -440, s * 92, 16, `fe${s}`)); out.push(seg2(-440, s * 92, -830, s * 86, 12, `ti${s}`));
		out.push(<ellipse key={`pa${s}`} cx={X(-445)} cy={Y(s * 92)} rx={22 * KP} ry={20 * KP} fill="none" stroke={BONE} strokeWidth={2} />);
		for (let f = 0; f < 5; f++) out.push(bone(`M${X(-850)},${Y(s * (70 + f * 8))} L${X(-960 - (f === 2 ? 10 : 0))},${Y(s * (58 + f * 14))}`, 1.8, `ft${s}${f}`)); });
	return <g opacity={o}>{out}</g>; };

/** the sword in its black lacquer sheath, lying along y = ys (mm), pommel at x = xp; the hilt (guard, grip, pommel) out */
export const Sheathed: React.FC<{xp: number; ys: number; ghost?: number}> = ({xp, ys, ghost = 0}) => { const k = 10 * KP;   // px per cm
	const px = X(xp), py = Y(ys), ax = (a: number) => px - a * k;
	const mouthA = SW.bladeA + 0.6, tipA = SW.L + 2.0, n = 40;
	const hw = (a: number) => (bladeHW(Math.min(SW.L - SW.bladeA - 0.5, a - SW.bladeA)) + 0.5) * k;
	const sh = Array.from({length: n}, (_, i) => lerp(mouthA, tipA, i / (n - 1)));
	const top = sh.map((a, i) => `${ax(a).toFixed(1)},${(py - (i === n - 1 ? 0.3 * k : hw(a))).toFixed(1)}`), bot = sh.map((a, i) => `${ax(a).toFixed(1)},${(py + (i === n - 1 ? 0.3 * k : hw(a))).toFixed(1)}`).reverse();
	return <g>
		<defs><linearGradient id="shJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2A24" /><stop offset="0.25" stopColor="#120A08" /><stop offset="0.8" stopColor="#0A0605" /><stop offset="1" stopColor="#1E1410" /></linearGradient></defs>
		<path d={`M${top.join('L')}L${bot.join('L')}Z`} transform="translate(4,7)" fill="#000" opacity={0.5} />
		{ghost > 0 && <g opacity={ghost}><Sword x={px + 32 * k * 0.0 + 26 * k} y={py} k={k} rot={-90} id="jG" spec={0.4} />
			{[-0.8, 0, 0.8].map((w) => <path key={w} d={`M${ax(SW.bladeA) + 26 * k},${py + w * k} h${-30 * k}`} stroke="#FFF3CF" strokeOpacity={0.35} strokeWidth={2} strokeDasharray="30 18" />)}</g>}
		<Sword x={px} y={py} k={k} rot={-90} id="jS" spec={0.3} />
		<path d={`M${top.join('L')}L${bot.join('L')}Z`} fill="url(#shJ)" stroke="#050302" strokeWidth={1.5} />
		<path d={`M${sh.slice(1, n - 3).map((a) => `${ax(a).toFixed(1)},${(py - hw(a) * 0.55).toFixed(1)}`).join('L')}`} fill="none" stroke="#7A2A1A" strokeOpacity={0.75} strokeWidth={2} />
		<path d={`M${sh.slice(1, n - 3).map((a) => `${ax(a).toFixed(1)},${(py + hw(a) * 0.55).toFixed(1)}`).join('L')}`} fill="none" stroke="#7A2A1A" strokeOpacity={0.75} strokeWidth={2} />
		<path d={`M${top.slice(2, n - 4).join('L')}`} transform="translate(0,4)" fill="none" stroke="#FFE6C0" strokeOpacity={0.22} strokeWidth={2} />
	</g>; };

/** the coffins seen from above: the 椁 planks, the outer coffin's rim ①, the inner coffin's walls ②, the floor with silt */
const Coffin: React.FC = () => { const ix0 = X(-1060), ix1 = X(1040), iy0 = Y(-330), iy1 = Y(330), wI = 34, wO = 46, gap = 26;
	const planks = Array.from({length: 9}, (_, i) => <path key={i} d={`M0,${120 + i * 120} H${W}`} stroke="#120A06" strokeOpacity={0.6} strokeWidth={3} />);
	const silt = Array.from({length: 26}, (_, i) => <ellipse key={i} cx={lerp(ix0 + 30, ix1 - 30, rnd(i, 3))} cy={lerp(iy0 + 20, iy1 - 20, rnd(i, 4))} rx={20 + 50 * rnd(i, 5)} ry={8 + 18 * rnd(i, 6)} fill="#4A3020" opacity={0.25 + 0.2 * rnd(i, 7)} />);
	const R = (x0: number, y0: number, x1: number, y1: number, f: string, k: string, extra = {}) => <rect key={k} x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={f} {...extra} />;
	return <g>
		<rect width={W} height={H} fill="#3A2416" />{planks}
		{R(ix0 - wI - gap - wO, iy0 - wI - gap - wO, ix1 + wI + gap + wO, iy1 + wI + gap + wO, '#1A0E0A', 'o')}
		<rect x={ix0 - wI - gap - wO + 8} y={iy0 - wI - gap - wO + 8} width={ix1 - ix0 + 2 * (wI + gap + wO) - 16} height={iy1 - iy0 + 2 * (wI + gap + wO) - 16} fill="none" stroke="#9A3A22" strokeOpacity={0.6} strokeWidth={2.5} />
		{R(ix0 - wI - gap, iy0 - wI - gap, ix1 + wI + gap, iy1 + wI + gap, '#0C0605', 'g')}
		{R(ix0 - wI, iy0 - wI, ix1 + wI, iy1 + wI, '#140A08', 'i')}
		<rect x={ix0 - wI + 7} y={iy0 - wI + 7} width={ix1 - ix0 + 2 * wI - 14} height={iy1 - iy0 + 2 * wI - 14} fill="none" stroke="#B8432A" strokeOpacity={0.7} strokeWidth={2.5} />
		<defs><radialGradient id="cfF" cx="0.55" cy="0.42" r="0.7"><stop offset="0" stopColor="#4A2A1A" /><stop offset="0.6" stopColor="#2E1810" /><stop offset="1" stopColor="#1A0C08" /></radialGradient></defs>
		{R(ix0, iy0, ix1, iy1, 'url(#cfF)', 'f')}{silt}
		<path d={`M${ix0},${iy0} h${ix1 - ix0} v12 h${-(ix1 - ix0)} Z`} fill="#000" opacity={0.45} /><path d={`M${ix0},${iy0} v${iy1 - iy0} h10 v${-(iy1 - iy0)} Z`} fill="#000" opacity={0.35} />
		{/* remnants of the shroud: low, dark, soft */}
		{[[-300, -40, 520, 150], [250, 60, 380, 120], [-650, 30, 300, 110]].map(([x, y, w, h], i) => <ellipse key={i} cx={X(x)} cy={Y(y)} rx={w * KP / 2} ry={h * KP / 2} fill="#2A1A12" opacity={0.55} />)}
	</g>; };

export const CoffinTop: React.FC<{ghost?: number; tags?: boolean; zoom?: number; depth?: boolean}> = ({ghost = 0, tags = true, zoom = 1, depth = true}) => <>
	<svg width={W} height={H} style={{position: 'absolute'}}><LacDefs /><rect width={W} height={H} fill="#3A2416" />
		<defs><filter id="cfSoft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="0.6" /></filter></defs>
		<g transform={`translate(${CX},${CY}) scale(${zoom}) translate(${-CX},${-CY})`}>
			<Coffin />
			<g filter="url(#cfSoft)"><Skeleton /></g>
			<Sheathed xp={150} ys={245} ghost={ghost} />
		</g>
		<Pool id="cfL" x={1000} y={560} rx={900} ry={430} a={0.32} col="#FFB868" />
		<Vignette id="cfV" a={0.62} />
		{tags && <g><Tag id="cf1" x={X(1040) + 70 * zoom} y={Y(-330) - 60} s="①外棺" fs={44} col={B.cream} anchor="end" scrim={0.5} />
			<Tag id="cf2" x={X(1040) - 10} y={Y(330) + 104} s="②内棺" fs={44} col={B.cream} anchor="end" scrim={0.5} />
			<Tag id="cf3" x={1010} y={Y(330) + 104} s="剑在墓主人左侧" fs={44} col={B.goldL} anchor="middle" to={[X(-60), Y(262)]} scrim={0.55} /></g>}
	</svg>
	{depth && <DepthTag v={10.8} />}
</>;
export const KFJ_D3: React.FC = () => <CoffinTop />;
export const KFJ_T3: React.FC = () => <CoffinTop ghost={0.5} tags={false} zoom={0.9} depth={false} />;
void SANS; void Lacquer;
