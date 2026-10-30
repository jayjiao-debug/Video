import React from 'react';
import {W, H, SANS, lerp, cl, rnd} from '../qq50/kit50';
import {LacDefs, Lacquer, Vignette, Pool, B} from '../qq50/styleB';
import {lookAt, proj, poly, Cam, V3} from './parts53';
import {Sword} from './props53';
import {homog} from './kfG53';
import {KitchenEnd} from './end53d';
/* ep53 v3 key frames, part I — the new DISPLAY (owner note 0:10): a sloped, lectern-style plinth with a low glass hood, drawn
   here as a stand-in until display53k.tsx exists. World units cm; x along the sword (pommel to the right), y away from the
   viewer, z up. The plinth is a dark lacquer block 80 × 30 cm, its top tilted 23° toward the viewer (front edge 87.6 cm,
   back edge 100.4 cm); the sword lies 2.4 cm above the slope on two clear acrylic rests (under the blade and under the
   grip); the hood is a low glass box (70 × 24 cm on the slope, 8 cm high) whose edges stay inside the frame. The title is
   etched on the hood's top pane, row 1 behind the sword, row 2 in front of it, so the sword sits between the two lines.
   The sword is the props53 Sword (55.6 cm, waist, lattice, blue glass, two grip bands, disc pommel) mapped onto its plane
   by the homography of the same camera. */
const TH = Math.atan2(12.8, 30), CT = Math.cos(TH), ST = Math.sin(TH);
const ZC = 94;                                  // the slope's centre height
/** a point on the slope frame: x along, s up the slope from the centre line, h along the slope's normal */
export const SL = (x: number, s: number, h = 0): V3 => [-x, s * CT - h * ST, ZC + s * ST + h * CT];   // −x: parts53's look-at camera mirrors x
const KS = 40;                                  // sword panel px per cm

/** a flat panel (pw × ph px, K px per cm) laid on the slope frame: panel (0,0) at slope point (x0, s0, h), x → +x, y → down the slope */
export const SlopePic: React.FC<{c: Cam; x0: number; s0: number; h: number; pw: number; ph: number; k: number; children: React.ReactNode; o?: number; html?: boolean}> = ({c, x0, s0, h, pw, ph, k, children, o = 1, html}) => {
	const P = (px: number, py: number) => { const q = proj(c, SL(x0 + px / k, s0 - py / k, h)); return [q[0], q[1]] as [number, number]; };
	const q = [P(0, 0), P(pw, 0), P(pw, ph), P(0, ph)];
	return <div style={{position: 'absolute', left: 0, top: 0, width: pw, height: ph, transformOrigin: '0 0', transform: homog(q, pw, ph), opacity: o}}>
		{html ? children : <svg width={pw} height={ph} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{children}</svg>}</div>; };

export type PlinthOpt = {c: Cam; title?: number; dull?: number; bloom?: boolean; reflect?: number; hood?: number; spec?: number; floor?: boolean};
/** the plinth, the sword on it, the hood; drawn in painter's order for a camera in front of and above the plinth */
export const Plinth: React.FC<PlinthOpt> = ({c, title = 0, dull = 0, bloom = false, reflect = 0, hood = 1, spec = 0.45}) => {
	const X0 = -40, X1 = 40, sF = -15, sB = 15;
	const top: V3[] = [SL(X0, sF), SL(X1, sF), SL(X1, sB), SL(X0, sB)];
	const fr: V3[] = [[-X0, SL(0, sF)[1], 0], [-X1, SL(0, sF)[1], 0], SL(X1, sF), SL(X0, sF)];
	const sideR: V3[] = [[-X1, SL(0, sF)[1], 0], [-X1, SL(0, sB)[1], 0], SL(X1, sB), SL(X1, sF)];
	const sideL: V3[] = [[-X0, SL(0, sF)[1], 0], [-X0, SL(0, sB)[1], 0], SL(X0, sB), SL(X0, sF)];
	const camRight = c.p[0] < -X1, camLeft = c.p[0] > -X0;   // world x is mirrored (SL)
	/* the hood */
	const hx0 = -35, hx1 = 35, hs0 = -12, hs1 = 12, hh = 8;
	const Hd = (x: number, s: number, h: number) => SL(x, s, h);
	const hTop = [Hd(hx0, hs1, hh), Hd(hx1, hs1, hh), Hd(hx1, hs0, hh), Hd(hx0, hs0, hh)];
	const hFront = [Hd(hx0, hs0, 0), Hd(hx1, hs0, 0), Hd(hx1, hs0, hh), Hd(hx0, hs0, hh)];
	const hBack = [Hd(hx0, hs1, 0), Hd(hx1, hs1, 0), Hd(hx1, hs1, hh), Hd(hx0, hs1, hh)];
	const hR = [Hd(hx1, hs0, 0), Hd(hx1, hs1, 0), Hd(hx1, hs1, hh), Hd(hx1, hs0, hh)], hL = [Hd(hx0, hs0, 0), Hd(hx0, hs1, 0), Hd(hx0, hs1, hh), Hd(hx0, hs0, hh)];
	const edge = (pts: V3[]) => poly(c, pts);
	/* the rests: clear acrylic blocks with a cradle notch, under the blade (x −12) and the grip (x 22) */
	const rest = (x: number, hTop: number) => { const w = 0.9, d = 3.2; const f: V3[] = [Hd(x - w, -d, 0), Hd(x + w, -d, 0), Hd(x + w, -d, hTop), Hd(x + w * 0.3, -d, hTop - 0.5), Hd(x - w * 0.3, -d, hTop - 0.5), Hd(x - w, -d, hTop)];
		const tp: V3[] = [Hd(x - w, -d, hTop), Hd(x + w, -d, hTop), Hd(x + w, d, hTop), Hd(x - w, d, hTop)], sd: V3[] = [Hd(x + w, -d, 0), Hd(x + w, d, 0), Hd(x + w, d, hTop), Hd(x + w, -d, hTop)];
		return <g><path d={edge(sd)} fill="#CFE6F0" fillOpacity={0.1} stroke="#E8F4F8" strokeOpacity={0.35} strokeWidth={1} /><path d={edge(tp)} fill="#E8F4F8" fillOpacity={0.18} />
			<path d={edge(f)} fill="#CFE6F0" fillOpacity={0.16} stroke="#F4FAFC" strokeOpacity={0.7} strokeWidth={1.4} /></g>; };
	const pw = 60 * KS, ph = 8 * KS, sx0 = -30, ss0 = 4;   // sword panel: 60 × 8 cm, the axis on the slope's centre line
	const bloomAt: [number, number] = [(57.8 - 31) * KS, 4 * KS + 0.6 * KS];
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><linearGradient id="plF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E1C12" /><stop offset="0.25" stopColor="#1C100A" /><stop offset="1" stopColor="#0E0705" /></linearGradient>
				<linearGradient id="plS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1A0E08" /><stop offset="1" stopColor="#0A0504" /></linearGradient></defs>
			{camRight && <path d={edge(sideR)} fill="url(#plS)" />}{camLeft && <path d={edge(sideL)} fill="url(#plS)" />}
			<path d={edge(fr)} fill="url(#plF)" />
			<path d={poly(c, [fr[3], fr[2]], false)} stroke={B.gold} strokeOpacity={0.55} strokeWidth={2} fill="none" />
			<path d={poly(c, [SL(X0, sF, -0.6), SL(X1, sF, -0.6)].map(([x, y, z]) => [x, y - 0.4, z - 2.2] as V3), false)} stroke={B.gold} strokeOpacity={0.18} strokeWidth={1.2} fill="none" />
		</svg>
		{/* the top surface: dark felt, the spot's pool, the sword's soft shadow */}
		<SlopePic c={c} x0={X0} s0={sB} h={0} pw={80 * 20} ph={30 * 20} k={20}>
			<defs><radialGradient id="plTop" cx="0.52" cy="0.52" r="0.62"><stop offset="0" stopColor="#4A2E1C" /><stop offset="0.5" stopColor="#2A1A10" /><stop offset="1" stopColor="#140A06" /></radialGradient>
				<filter id="plSh" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="9" /></filter></defs>
			<rect width={1600} height={600} fill="url(#plTop)" />
			<g filter="url(#plSh)" opacity={0.6}><g transform={`translate(${(57.8 + 10 + 0.6) * 20},${(15 - 0.0 + 1.6) * 20})`}><path d={`M0,-38 L0,38 L-${55 * 20},10 L-${55.6 * 20},0 L-${55 * 20},-10 Z`} fill="#000" /></g></g>
			<rect x={2} y={2} width={1596} height={596} fill="none" stroke={B.gold} strokeOpacity={0.12} strokeWidth={3} />
		</SlopePic>
		<svg width={W} height={H} style={{position: 'absolute'}}>{rest(-12, 2.0)}{rest(22, 1.55)}</svg>
		{/* the sword */}
		<SlopePic c={c} x0={sx0} s0={ss0} h={2.4} pw={pw} ph={ph} k={KS}>
			<defs><filter id="plBl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter></defs>
			<Sword x={57.8 * KS} y={4 * KS} k={KS} rot={-90} id="plSw" spec={spec} />
			{dull > 0 && <rect x={2.2 * KS} y={1.4 * KS} width={45.6 * KS} height={5.2 * KS} fill="#2A2418" opacity={dull} style={{mixBlendMode: 'multiply'}} />}
			{bloom && <g><circle cx={bloomAt[0]} cy={bloomAt[1]} r={0.9 * KS} fill="none" stroke="#F2E6CC" strokeOpacity={0.7} strokeWidth={2} /><ellipse cx={bloomAt[0]} cy={bloomAt[1]} rx={0.42 * KS} ry={0.3 * KS} fill="#6E7E46" opacity={0.75} filter="url(#plBl)" /><ellipse cx={bloomAt[0] + 2} cy={bloomAt[1]} rx={0.2 * KS} ry={0.14 * KS} fill="#4E5E38" opacity={0.9} /></g>}
		</SlopePic>
		{/* the hood: back and side panes faint, the front and top panes with bright edges; the title etched on the top pane */}
		<svg width={W} height={H} style={{position: 'absolute', opacity: hood}}>
			<defs><linearGradient id="plG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F4FAFC" stopOpacity="0.1" /><stop offset="0.4" stopColor="#F4FAFC" stopOpacity="0.03" /><stop offset="0.55" stopColor="#F4FAFC" stopOpacity="0.12" /><stop offset="0.7" stopColor="#F4FAFC" stopOpacity="0.02" /><stop offset="1" stopColor="#F4FAFC" stopOpacity="0.05" /></linearGradient></defs>
			<path d={edge(hBack)} fill="#F4FAFC" fillOpacity={0.03} stroke="#F4FAFC" strokeOpacity={0.25} strokeWidth={1.2} />
			<path d={edge(hR)} fill="#F4FAFC" fillOpacity={0.04} stroke="#F4FAFC" strokeOpacity={0.4} strokeWidth={1.4} /><path d={edge(hL)} fill="#F4FAFC" fillOpacity={0.04} stroke="#F4FAFC" strokeOpacity={0.4} strokeWidth={1.4} />
			<path d={edge(hFront)} fill="#F4FAFC" fillOpacity={0.05} stroke="#F4FAFC" strokeOpacity={0.55} strokeWidth={1.6} />
			<path d={edge(hTop)} fill="url(#plG)" stroke="#F4FAFC" strokeOpacity={0.7} strokeWidth={1.8} />
			<path d={poly(c, [Hd(hx0 + 1, hs0, hh), Hd(hx1 - 1, hs0, hh)], false)} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={2.5} fill="none" />
		</svg>
		{reflect > 0 && <SlopePic c={c} x0={hx0} s0={hs1} h={hh} pw={1920} ph={Math.round(1920 * 24 / 70)} k={1920 / 70} o={reflect} html>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" style={{width: 1920, height: Math.round(1920 * 24 / 70), transform: 'scaleY(-1)'}}><LacDefs /><KitchenEnd glow={0.4} /></svg></SlopePic>}
		{title > 0 && <SlopePic c={c} x0={hx0} s0={hs1} h={hh + 0.05} pw={70 * 20} ph={24 * 20} k={20} o={title}>
			<g fontFamily={SANS} fontWeight={900} textAnchor="middle" style={{paintOrder: 'stroke'}}>
				<text x={700} y={128} fontSize={116} letterSpacing="0.06em" fill="#F6F2EA" fillOpacity={0.92} stroke="#1A0D08" strokeOpacity={0.55} strokeWidth={8}>越王勾践剑</text>
				<text x={700} y={466} fontSize={100} letterSpacing="0.04em" fill={B.gold} stroke="#1A0D08" strokeOpacity={0.55} strokeWidth={8}>真的没锈吗？</text>
				<path d="M120,152 H1280 M120,372 H1280" stroke="#F4F0E8" strokeOpacity={0.3} strokeWidth={2} />
			</g></SlopePic>}
	</>; };

/** the ground: museum dark, a soft spot pool round the plinth */
export const DisplayRoom: React.FC<{c: Cam; children?: React.ReactNode; beam?: number}> = ({c, children, beam = 0.5}) => { const p = proj(c, [0, 0, 96]);
	return <svg width={W} height={H} style={{position: 'absolute'}}><LacDefs /><Lacquer sheen={0.12} id="dr" />
		<defs><linearGradient id="drB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF0D0" stopOpacity={0.16 * beam} /><stop offset="1" stopColor="#FFF0D0" stopOpacity="0" /></linearGradient></defs>
		<path d={`M${p[0] - 120},-20 L${p[0] + 120},-20 L${p[0] + 760},${p[1] + 160} L${p[0] - 760},${p[1] + 160} Z`} fill="url(#drB)" />
		<Pool id="drP" x={p[0]} y={p[1] + 40} rx={900} ry={360} a={0.3} col="#FFB868" />{children}</svg>; };
const Vig: React.FC<{a?: number}> = ({a = 0.55}) => <svg width={W} height={H} style={{position: 'absolute', pointerEvents: 'none'}}><LacDefs /><Vignette id="plV" a={a} /></svg>;

/* ---------- the key frames on the display ---------- */
export const CAM_H2 = lookAt([-14, -104, 160], [0, 2, 92], 2250, 960, 610);
export const CAM_TITLE = lookAt([-8, -58, 168], [0, 1, 94], 1700, 960, 570);
export const CAM_R2 = lookAt([6, -70, 132], [2, 0, 95], 1650, 960, 650);
export const CAM_P1 = lookAt([-14, -140, 175], [0, 4, 92], 2000, 960, 610);
export const KFI_H2: React.FC = () => <><DisplayRoom c={CAM_H2} /><Plinth c={CAM_H2} /><Vig /></>;
export const KFI_TITLE: React.FC = () => <><DisplayRoom c={CAM_TITLE} /><Plinth c={CAM_TITLE} title={1} /><Vig /></>;
export const KFI_R2: React.FC = () => <><DisplayRoom c={CAM_R2} beam={0.3} /><Plinth c={CAM_R2} dull={0.22} bloom spec={0.25} /><Vig a={0.6} /></>;
export const KFI_P1: React.FC = () => <><DisplayRoom c={CAM_P1} /><Plinth c={CAM_P1} reflect={0.42} dull={0.15} /><Vig /></>;
void lerp; void cl; void rnd;

/* ---------- S1: the hall, the display in the middle (the orbit's mid-point) ---------- */
/** a faceless modern visitor silhouette, feet at world (x, y, 0), height hcm; one tone, a thin warm rim toward the display */
const Visitor: React.FC<{c: Cam; x: number; y: number; h: number; seed: number; flip?: boolean}> = ({c, x, y, h, seed, flip}) => { const f = proj(c, [x, y, 0]), t = proj(c, [x, y, h]), s = (f[1] - t[1]) / 100;
	if (f[2] <= 0) return null; const w = 1 + 0.15 * (rnd(seed, 1) - 0.5), sh = rnd(seed, 2) > 0.5;
	return <g transform={`translate(${f[0]},${f[1]}) scale(${flip ? -s : s},${s})`}>
		<path d={`M${-9 * w},-2 L${-7 * w},-46 L${7 * w},-46 L${9 * w},-2 Z`} fill="#0C0604" />
		<path d={`M${-13 * w},-44 C${-14 * w},-62 ${-12 * w},-76 ${-8 * w},-80 L${8 * w},-80 C${12 * w},-76 ${14 * w},-62 ${13 * w},-44 Z`} fill="#0E0705" />
		<ellipse cx={0} cy={-89} rx={6.6} ry={8} fill="#0E0705" />{sh && <path d="M-7,-92 Q0,-101 7,-92 L7,-88 L-7,-88 Z" fill="#0E0705" />}
		<path d={`M${13 * w},-44 C${14 * w},-62 ${12 * w},-76 ${8 * w},-80`} fill="none" stroke="#FFB868" strokeOpacity={0.45} strokeWidth={1.2 / s} />
	</g>; };
const Stanchion: React.FC<{c: Cam; pts: [number, number][]}> = ({c, pts}) => <g>
	{pts.slice(0, -1).map(([x, y], i) => { const [x2, y2] = pts[i + 1], n = 12; const d = Array.from({length: n + 1}, (_, k) => { const u = k / n, p = proj(c, [lerp(x, x2, u), lerp(y, y2, u), 92 - 14 * Math.sin(Math.PI * u)]); return `${p[0].toFixed(1)},${p[1].toFixed(1)}`; });
		return <path key={i} d={`M${d.join('L')}`} fill="none" stroke="#7A2A1A" strokeWidth={4} strokeOpacity={0.9} />; })}
	{pts.map(([x, y], i) => { const a = proj(c, [x, y, 0]), b = proj(c, [x, y, 95]); return <g key={`p${i}`}><path d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke="#C8944C" strokeWidth={4} /><circle cx={b[0]} cy={b[1]} r={5} fill="#E8BC66" /></g>; })}</g>;
export const CAM_S1 = lookAt([-380, -460, 250], [0, 0, 70], 1750, 960, 610);
export const KFI_S1: React.FC = () => { const c = CAM_S1;
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}><LacDefs /><Lacquer sheen={0.08} id="s1" />
			<defs><linearGradient id="s1w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0A0504" /><stop offset="1" stopColor="#1E110B" /></linearGradient></defs>
			<path d={poly(c, [[-700, 600, 0], [700, 600, 0], [700, 600, 420], [-700, 600, 420]])} fill="url(#s1w)" />
			<path d={poly(c, [[700, -700, 0], [700, 600, 0], [700, 600, 420], [700, -700, 420]])} fill="#120A06" />
			<path d={poly(c, [[-700, -700, 0], [700, -700, 0], [700, 600, 0], [-700, 600, 0]])} fill="#1A0F0A" />
			{(() => { const p = proj(c, [0, 0, 0]); return <Pool id="s1p" x={p[0]} y={p[1]} rx={620} ry={230} a={0.45} col="#FFB868" />; })()}
			<path d={poly(c, [[-60, 600, 300], [60, 600, 300], [60, 600, 330], [-60, 600, 330]])} fill="#3A2416" opacity={0.6} />
			{[[-200, 230, 172, 1], [150, 260, 165, 2], [330, 60, 178, 3], [-330, 40, 160, 7]].map(([x, y, h, s]) => <Visitor key={s} c={c} x={x} y={y} h={h} seed={s} flip={x > 0} />)}
		</svg>
		<DisplayRoomBeam c={c} />
		<Plinth c={c} />
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<Stanchion c={c} pts={[[-150, -130], [-150, 130], [150, 130], [150, -130]]} />
			{[[-330, -150, 168, 4]].map(([x, y, h, s]) => <Visitor key={s} c={c} x={x} y={y} h={h} seed={s} />)}
		</svg>
		<Vig a={0.6} /></>; };
const DisplayRoomBeam: React.FC<{c: Cam}> = ({c}) => { const p = proj(c, [0, 0, 96]), q = proj(c, [0, 0, 420]);
	return <svg width={W} height={H} style={{position: 'absolute'}}><defs><linearGradient id="s1b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF0D0" stopOpacity="0.14" /><stop offset="1" stopColor="#FFF0D0" stopOpacity="0" /></linearGradient></defs>
		<path d={`M${q[0] - 40},${q[1]} L${q[0] + 40},${q[1]} L${p[0] + 300},${p[1] + 80} L${p[0] - 300},${p[1] + 80} Z`} fill="url(#s1b)" /></svg>; };
