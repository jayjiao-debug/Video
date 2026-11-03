import React from 'react';
import {W, H, P, BEAT, STRIDE, rnd, seg, sm, eio, eout, lerp, Glow, Sky, Blur, Cam, Specks, Trav, LK, POSE, walkAt, hand, fkPose, grounded, spline, poly, Label, GOLD, GOLD_HI, CREAM, FIG} from './kit59';
/* the demo's Hull terrace, its globe and its hook staging (qq59, read-only) so the payoff rhymes with the opening */
import {StreetBack, StreetFront, Door, DoorSpill, Banner, MUM} from '../qq59/bg59';
import {Homecoming, SignpostScene} from '../qq59/demo59';
import {Globe, Space, HULL, PUNTA, routeAt} from '../qq59/globe59';
/* ep59 storyboard · scenes D: the Humber Bridge, the street, the door, the hug, the payoff (bars 68–91). */
export type SP = {u: number; d: number};
const f1 = (v: number) => v.toFixed(1);
/** the demo's world camera: look at (cx, cy) with zoom z */
const WCam: React.FC<{cx: number; cy: number; z: number; children: React.ReactNode}> = ({cx, cy, z, children}) =>
	<g transform={`translate(960,540) scale(${z.toFixed(4)}) translate(${f1(-cx)},${f1(-cy)})`}>{children}</g>;
const KH = 270, MH = 0.9 * KH;   // the demo's heights at zoom 1

/* ============ bars 68–69 · the Humber Bridge in thick fog ============ */
const FogBank: React.FC<{t: number; y: number; o: number; seed: number; id: string}> = ({t, y, o, seed, id}) => <Blur id={id} s={34}>
	{Array.from({length: 7}, (_, i) => <ellipse key={i} cx={(((rnd(i, seed) * 2600 + t * (16 + 10 * rnd(i, seed + 1))) % 2800) - 400)} cy={y + (rnd(i, seed + 2) - 0.5) * 120} rx={300 + 200 * rnd(i, seed + 3)} ry={60 + 40 * rnd(i, seed + 4)} fill="#dfe2e2" opacity={o} />)}</Blur>;
export const Humber: React.FC<SP> = ({u, d}) => {
	const p = u / d, deckY = (x: number) => lerp(700, 612, x / 1920), h = 150, uk = 0.7 * d, x = 840 + 34 * (u - uk), fade = (x0: number) => 1 - 0.75 * seg(x0, 700, 1900);
	return <g><Cam z={lerp(1.0, 1.05, eio(p))} px={lerp(0, -40, eio(p))}>
		<Sky id="hb_s" stops={[[0, '#7c8288'], [0.5, '#b8bcbc'], [1, '#a8aca8']]} />
		<rect x={-400} y={780} width={W + 800} height={H} fill="#7a7a72" opacity={0.6} />
		{/* far tower ghosted in the fog */}
		<g opacity={0.22} fill="#3a3e44"><rect x={1660} y={120} width={30} height={560} /><rect x={1750} y={120} width={30} height={560} /><rect x={1660} y={170} width={120} height={16} /><rect x={1660} y={420} width={120} height={14} /></g>
		{/* the main cable sagging from the near tower to mid-span and up to the far tower; hangers */}
		<path d="M420,-40 Q1080,1010 1720,130" stroke="#2e3238" strokeWidth={7} fill="none" opacity={0.85} />
		{Array.from({length: 30}, (_, i) => { const t = (i + 1) / 31, cx = (1 - t) * (1 - t) * 420 + 2 * (1 - t) * t * 1080 + t * t * 1720, cy = (1 - t) * (1 - t) * -40 + 2 * (1 - t) * t * 1010 + t * t * 130;
			return <line key={i} x1={cx} y1={cy} x2={cx} y2={deckY(cx) - 6} stroke="#2e3238" strokeWidth={2} opacity={0.75 * fade(cx)} />; })}
		<FogBank t={u} y={520} o={0.35} seed={3} id="hb_f1" />
		{/* the deck: girder, walkway, railing, lamp posts with warm heads */}
		<path d={`M-200,${deckY(-200) - 6} L2200,${deckY(2200) - 6} L2200,${deckY(2200) + 30} L-200,${deckY(-200) + 30} Z`} fill="#34383e" />
		<path d={`M-200,${deckY(-200) - 6} L2200,${deckY(2200) - 6}`} stroke="#c8ccd0" strokeWidth={2} opacity={0.5} />
		<path d={`M-200,${deckY(-200) - 40} L2200,${deckY(2200) - 40}`} stroke="#2a2e34" strokeWidth={3} />
		{Array.from({length: 40}, (_, i) => { const px = -160 + i * 60; return <line key={i} x1={px} y1={deckY(px) - 40} x2={px} y2={deckY(px) - 6} stroke="#2a2e34" strokeWidth={2} opacity={fade(px)} />; })}
		{Array.from({length: 12}, (_, i) => { const px = -100 + i * 190, py = deckY(px); return <g key={i} opacity={fade(px)}><rect x={px} y={py - 120} width={5} height={114} fill="#2a2e34" /><rect x={px - 18} y={py - 124} width={26} height={6} fill="#2a2e34" /><Glow x={px - 12} y={py - 116} r={30} c={GOLD} o={0.6} id={`hb_l${i}`} /><circle cx={px - 12} cy={py - 117} r={3.5} fill={GOLD_HI} /></g>; })}
		<Trav x={x} g={deckY(x) - 6} h={h} pose={walkAt(40 * (u - uk), h)} look={LK.old} side={-1} rimOp={0.5} rim="#f4f2ee" />
		{/* the near tower: two concrete legs and their beams, rising out of frame */}
		<g fill="#2c3036"><path d="M330,1100 L346,-120 L414,-120 L430,1100 Z" /><path d="M480,1100 L494,-120 L560,-120 L576,1100 Z" /><rect x={340} y={140} width={220} height={34} /><rect x={336} y={560} width={232} height={30} /></g>
		<path d="M346,-120 L330,1100" stroke="#d8dcdc" strokeWidth={3} opacity={0.35} />
		<FogBank t={u + 7} y={700} o={0.3} seed={9} id="hb_f2" />
		<FogBank t={u + 3} y={300} o={0.25} seed={14} id="hb_f3" />
	</Cam></g>;
};
/** bars 70–71 · over his shoulder down the deck: the far end comes out of the fog, the lights of Hull beyond */
export const FarEnd: React.FC<SP> = ({u, d}) => {
	const p = u / d, vp: P = [1250, 560], lift = sm(seg(u, 0.2, d * 0.8)), h = 600, uk = 0.72 * d;
	const L = (k: number, side: number, y0: number): P => [lerp(vp[0], side < 0 ? -300 : 2300, k), lerp(vp[1], y0, k)];
	return <g><Cam z={lerp(1.0, 1.1, eio(p))} px={lerp(0, -60, eio(p))}>
		<Sky id="fe_s" stops={[[0, '#6c7278'], [0.5, '#aeb2b2'], [1, '#9a9e9c']]} />
		{/* the far shore: Hull's lights warming through the thinning fog */}
		<g opacity={0.35 + 0.55 * lift}><path d={`M900,${vp[1] + 4} Q1250,${vp[1] - 18} 1700,${vp[1] + 2} L1700,${vp[1] + 20} L900,${vp[1] + 20} Z`} fill="#5a5c60" />
			{Array.from({length: 22}, (_, i) => <circle key={i} cx={940 + rnd(i, 3) * 720} cy={vp[1] - 6 + rnd(i, 4) * 14} r={2.5} fill={GOLD_HI} />)}
			<Glow x={1260} y={vp[1]} r={420} ry={80} c={GOLD} o={0.35} id="fe_town" /></g>
		{/* the far tower astride the deck, and the people waiting at the end (tiny) */}
		<g opacity={0.3 + 0.4 * lift} fill="#3a3e44"><rect x={1130} y={250} width={22} height={320} /><rect x={1350} y={250} width={22} height={320} /><rect x={1130} y={280} width={242} height={14} /><rect x={1130} y={430} width={242} height={12} /></g>
		<g opacity={0.5 * lift} fill="#2a2c30">{Array.from({length: 14}, (_, i) => <rect key={i} x={1190 + i * 9} y={vp[1] - 18 - 6 * rnd(i, 7)} width={5} height={16 + 6 * rnd(i, 7)} rx={2} />)}</g>
		{/* cables sweeping down toward us from the tower tops; the deck, kerbs and railings converging */}
		<path d={`M1141,250 Q700,560 -200,180`} stroke="#2e3238" strokeWidth={6} fill="none" opacity={0.7} /><path d={`M1361,250 Q1800,560 2300,180`} stroke="#2e3238" strokeWidth={6} fill="none" opacity={0.7} />
		<path d={poly([L(0, -1, 1300), vp, L(0, 1, 1300), [2300, 1300], [-300, 1300]])} fill="#5a5e62" />
		<path d={poly([vp, L(1, -1, 1300), L(1, 1, 1300)])} fill="#4c5054" />
		<path d={`M${vp[0]},${vp[1]} L${-300},${1100}`} stroke="#2a2e32" strokeWidth={4} /><path d={`M${vp[0]},${vp[1] - 6} L${-300},${880}`} stroke="#2a2e32" strokeWidth={5} />
		<path d={`M${vp[0]},${vp[1]} L${2300},${1100}`} stroke="#2a2e32" strokeWidth={4} /><path d={`M${vp[0]},${vp[1] - 6} L${2300},${880}`} stroke="#2a2e32" strokeWidth={5} />
		<path d={`M${vp[0]},${vp[1]} L${700},${1300}`} stroke="#e8e8e0" strokeWidth={3} strokeDasharray="30 40" opacity={0.4} />
		{Array.from({length: 9}, (_, i) => { const k = Math.pow(0.7, i), px = lerp(vp[0], -100, k), py = lerp(vp[1], 1000, k), ph = 520 * k; return <g key={i}><rect x={px} y={py - ph} width={Math.max(2, 9 * k)} height={ph} fill="#2a2e32" /><circle cx={px + 30 * k} cy={py - ph} r={Math.max(2, 7 * k)} fill={GOLD_HI} /><Glow x={px + 30 * k} y={py - ph} r={60 * k + 10} c={GOLD} o={0.6} id={`fe_l${i}`} /></g>; })}
		<Blur id="fe_fog" s={40}><rect x={-400} y={vp[1] - 160} width={W + 800} height={220} fill="#d8dcdc" opacity={0.45 * (1 - 0.6 * lift)} /></Blur>
		<Trav x={460} g={1110} h={h} pose={walkAt(46 * (u - uk), h)} look={LK.old} side={1} rimOp={0.6} rim="#ffe8c8" />
	</Cam></g>;
};

/* ============ bars 72–79 · Hull: the street, the banner, the window, the door (the demo's terrace) ============ */
const Neighbours: React.FC<{t: number; xs: number[]; phones?: boolean}> = ({t, xs, phones}) => <g>{xs.map((x, i) => {
	const up = phones && i % 2 === 0, pose = up ? grounded({lean: 0, neck: -4, lt: 3, lk: 3, rt: -5, rk: 4, la: 100, le: 30, ra: 6, re: 16}) : grounded({lean: 3 + 2 * Math.sin(t + i), neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14});
	const hd = hand(pose, 'LHand', x, 930, KH * (0.92 + 0.06 * rnd(i, 3)), true);
	return <g key={i}><Trav x={x} g={930} h={KH * (0.92 + 0.06 * rnd(i, 3))} pose={pose} look={i % 3 === 1 ? LK.woman : LK.man} flip pack={0} side={-1} rimOp={0.45} rim="#ffd9a0" />
		{up && <rect x={hd[0] - 10} y={hd[1] - 26} width={14} height={24} rx={2} fill="#9fc4e8" opacity={0.8} />}</g>; })}</g>;
/** bars 72–73 · the street again, from his side: he walks in from the left */
export const Street: React.FC<SP> = ({u, d}) => {
	const p = u / d, uk = 0.7 * d, x = 640 + 70 * (u - uk), cx = lerp(1150, 1240, eio(p));
	return <g><WCam cx={cx} cy={600} z={0.78}>
		<StreetBack t={u + 20} mode="dusk" />
		<Banner t={u + 20} />
		<Door open={0} />
		<Neighbours t={u} xs={[1900, 1990, 2120, 2210]} phones />
		<StreetFront mode="dusk" />
		<Trav x={x} g={962} h={KH} pose={walkAt(KH * 0.25 * (u - uk) * 1.2, KH, 6)} look={LK.old} side={-1} rimOp={0.6} rim="#ffd9a0" />
	</WCam></g>;
};
/** bars 74–75 · the banner, the neighbours waiting */
export const BannerScene: React.FC<SP> = ({u, d}) => {
	const p = u / d;
	return <g><WCam cx={lerp(1440, 1460, p)} cy={lerp(700, 600, eio(p))} z={1.45}>
		<StreetBack t={u + 24} mode="dusk" />
		<Banner t={u * 1.6 + 24} />
		<Door open={0} />
		<Neighbours t={u} xs={[1560, 1660, 1880, 1990]} phones />
		<StreetFront mode="dusk" />
	</WCam></g>;
};
/** bars 76–77 · his mother at the bay window, lifting the net curtain */
export const Window: React.FC<SP> = ({u, d}) => {
	const p = u / d, lift = sm(seg(u, 0.3, 1.2)), x = 1540, g = 640 + 0.98 * MH;
	const pose = grounded({lean: 4, neck: 6, lt: 2, lk: 2, rt: -3, rk: 3, la: lerp(10, 112, lift), le: lerp(20, 40, lift), ra: 6, re: 30});
	const hd = hand(pose, 'LHand', x, g, MH, true);
	return <g><WCam cx={lerp(1500, 1530, p)} cy={725} z={lerp(2.2, 2.3, p)}>
		<StreetBack t={u + 28} mode="dusk" />
		<Banner t={u * 1.6 + 28} />
		<g><defs><clipPath id="wn_pane"><rect x={1412} y={622} width={212} height={160} /></clipPath></defs>
			<g clipPath="url(#wn_pane)">
				<Trav x={x} g={g} h={MH} pose={pose} look={LK.mum} flip pack={0} side={1} rimOp={0.7} rim="#fff0d0" col="#1a1210" />
				{/* the net curtain, gathered to her hand */}
				<path d={`M1412,622 L${hd[0] - 4},622 Q${hd[0] - 20},${lerp(700, hd[1], 0.5)} ${hd[0] - 6},${hd[1]} Q${lerp(1412, hd[0], 0.4)},${740} 1430,782 L1412,782 Z`} fill="#f4ead8" opacity={0.45} />
				<path d={`M${hd[0] + 20},622 L1624,622 L1624,782 L${hd[0] + 40},782 Q${hd[0] + 26},700 ${hd[0] + 20},622 Z`} fill="#f4ead8" opacity={0.3 * (1 - lift)} /></g>
			<path d="M1412,702 H1624" stroke="#5c4a40" strokeWidth={7} /><rect x={1412} y={622} width={212} height={160} fill="none" stroke="#5c4a40" strokeWidth={7} /></g>
		<Glow x={1520} y={700} r={260} c="#ffcf8a" o={0.25} id="wn_g" />
		<StreetFront mode="dusk" />
	</WCam></g>;
};
/** bars 78–79 · the break: the door opens, the light spills; him from behind, her in the doorway */
export const DoorScene: React.FC<SP> = ({u, d}) => {
	const p = u / d, open = sm(seg(u, 0.25, 2.0)), mx = 1222;
	const mum = <Trav x={mx} g={900} h={MH} pose={grounded({lean: 2, neck: -2, lt: 2, lk: 2, rt: -3, rk: 3, la: 30, le: 40, ra: 4, re: 14})} look={LK.mum} flip pack={0} side={1} rimOp={0.9} rim="#ffe0a8" col="#140e0c" />;
	return <g><WCam cx={lerp(1120, 1150, eio(p))} cy={785} z={lerp(1.75, 1.85, eio(p))}>
		<StreetBack t={u + 32} mode="dusk" />
		<Banner t={u * 1.6 + 32} />
		<Door open={open} inside={mum} />
		<DoorSpill open={open} />
		<StreetFront mode="dusk" />
		<Trav x={980} g={940} h={KH * 1.05} pose={POSE.stand} look={LK.old} side={1} rimOp={0.5 + 0.4 * open} rim="#ffd9a0" />
	</WCam></g>;
};
/** bars 80–82 · the hug: the demo's own hug (bar 3), held, the camera a little closer (the callback, now earned) */
export const Hug: React.FC<SP> = ({u, d}) => {
	const z = lerp(1.36, 1.42, u / d);   // pushed in about the hug so the banner leaves the top of frame (the line sits there)
	return <g transform={`translate(1000,960) scale(${z}) translate(-1000,-960)`}><Homecoming t={7.2 + 0.12 * Math.min(1, u / d)} /></g>;
};

/* ============ bars 83–88 · the globe; the two of him ============ */
const ROUTE_ALL = {p0: 0, p1: 1};
/** bars 83–84 · DROP: up to the globe, the whole gold route lit */
export const GlobeUp: React.FC<SP> = ({u, d}) => {
	const p = u / d, head = (u * 0.35) % 1, v = {cx: 1060, cy: 610, r: lerp(380, 450, eout(seg(u, 0, 0.8))), lon: lerp(-10, -40, p), lat: lerp(48, 52, p)};
	return <g><Space id="gu" drift={u * 6} />
		<Globe id="gug" v={v} route={{...ROUTE_ALL, head, headO: 0.9}} pins={[{ll: PUNTA, kind: 'start', label: '起点'}, {ll: HULL, kind: 'home', label: '家', dy: -26}]} home={1} />
	</g>;
};
/** bars 85–86 · split screen: young him at the signpost (1998), old him at his mother's door (2026) */
export const TwoSelves: React.FC<SP> = ({u, d}) => {
	const p = u / d, seam = 960 + 6 * Math.sin(u), close = 1 - 0.04 * eio(p);
	return <g>
		<defs><clipPath id="ts_l"><path d={`M-20,-20 L${seam + 60},-20 L${seam - 60},${H + 20} L-20,${H + 20} Z`} /></clipPath><clipPath id="ts_r"><path d={`M${seam + 60},-20 L${W + 20},-20 L${W + 20},${H + 20} L${seam - 60},${H + 20} Z`} /></clipPath></defs>
		<g clipPath="url(#ts_l)"><g transform={`translate(${-330 * close},20) scale(1.05)`}><SignpostScene t={19.2} /></g></g>
		<g clipPath="url(#ts_r)"><WCam cx={796} cy={690} z={1.2}>
			<StreetBack t={u + 40} mode="dusk" /><Banner t={u + 40} /><Door open={1} /><DoorSpill open={1} /><StreetFront mode="dusk" />
			<Trav x={1196} g={900} h={KH} pose={POSE.stand} look={LK.old} flip side={1} rimOp={0.85} rim="#ffd9a0" />
		</WCam></g>
		<path d={`M${seam + 60},-20 L${seam - 60},${H + 20}`} stroke={GOLD} strokeWidth={4} opacity={0.9} />
		<Label x={560} y={930} s="1998 · 29岁" size={40} /><Label x={1440} y={930} s="2026 · 57岁" size={40} />
	</g>;
};
/** bars 87–88 · the globe settles on Britain; the gold line closes at Hull */
export const GlobeHome: React.FC<SP> = ({u, d}) => {
	const p = u / d, r = Math.exp(lerp(Math.log(520), Math.log(900), eio(p))), v = {cx: 1060, cy: lerp(640, 760, eio(p)), r, lon: lerp(10, 2, eio(p)), lat: lerp(44, 50, eio(p))};
	const pulse = (u * 0.8) % 1;
	return <g><Space id="gh" drift={u * 4} />
		<Globe id="ghg" v={v} route={{...ROUTE_ALL, head: 1, headO: 1}} pins={[{ll: HULL, kind: 'home', label: '赫尔', dy: -28}]} home={1} />
		{(() => { const k = r / 520; void k; return null; })()}
		<HullRing v={v} pulse={pulse} />
	</g>;
};
const HullRing: React.FC<{v: {cx: number; cy: number; r: number; lon: number; lat: number}; pulse: number}> = ({v, pulse}) => {
	/* orthographic position of Hull for this view (same maths as d3's rotate + orthographic) */
	const rad = Math.PI / 180, l = (HULL[0] - v.lon) * rad, ph = HULL[1] * rad, p0 = v.lat * rad;
	const x = Math.cos(ph) * Math.sin(l), y = Math.cos(p0) * Math.sin(ph) - Math.sin(p0) * Math.cos(ph) * Math.cos(l);
	const sx = v.cx + v.r * x, sy = v.cy - v.r * y;
	return <g><circle cx={sx} cy={sy} r={20 + 70 * pulse} fill="none" stroke={GOLD_HI} strokeWidth={3} opacity={0.8 * (1 - pulse)} /><circle cx={sx} cy={sy} r={20 + 70 * ((pulse + 0.5) % 1)} fill="none" stroke={GOLD_HI} strokeWidth={2} opacity={0.6 * (1 - (pulse + 0.5) % 1)} /></g>;
};
/** bars 89–90 · night: one lit window in the terrace */
export const NightWindow: React.FC<SP> = ({u, d}) => {
	const p = u / d;
	return <g><WCam cx={lerp(1480, 1560, eio(p))} cy={lerp(470, 430, eio(p))} z={lerp(1.15, 1.3, eio(p))}>
		<StreetBack t={u + 50} mode="night" banner={false} />
		<Door open={0} mode="night" />
		<StreetFront mode="night" />
		<Glow x={1585} y={330} r={300} c={GOLD} o={0.18} id="nw_g" />
	</WCam><Specks t={u} n={40} seed={21} col="#c8d4e8" o={0.25} vx={-10} vy={30} r={1.6} /></g>;
};
void BEAT; void STRIDE; void eout; void fkPose; void spline; void CREAM; void FIG; void routeAt; void MUM; void Sky;
