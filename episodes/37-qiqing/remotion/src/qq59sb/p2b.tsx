import React from 'react';
import {W, H, D, BEAT, rnd, seg, sm, eio, eout, lerp, Glow, Sky, Blur, Cam, Specks, poly, Label, GOLD, GOLD_HI} from './kit59';
import {Karl, Rim2, walkD, walkB, leanP, FIGC, vNat, vBrisk} from './stage59';
import {grounded, withArms, mixPose, nod, Lit, LOOK, PZ} from '../qq59/figure59';
import {StreetBack, StreetFront, Door, DoorSpill, Banner, MUM, Signpost, Strait, Grass, FlagTree} from '../qq59/bg59';
import {routeAt, LL, Earth, satPt, mixSat, SatView, CaspianSea} from './chase59';
import {Space, HULL, PUNTA} from '../qq59/globe59';
import {BT, SC, hit, trap} from './p2a';
/* ep59 part 2 · bars 68–95 (the homecoming and the payoff). The half-time stretch (bars 69–82) breathes: long takes, slow pushes,
   one move per shot; the drive comes back on the bar-83 drop (the globe blazes) and runs to the end card. */
const f1 = (v: number) => v.toFixed(1);
/** the demo's world camera: look at (cx, cy) with zoom z */
const WCam: React.FC<{cx: number; cy: number; z: number; r?: number; children: React.ReactNode}> = ({cx, cy, z, r = 0, children}) =>
	<g transform={`translate(960,540) rotate(${r}) scale(${z.toFixed(4)}) translate(${f1(-cx)},${f1(-cy)})`}>{children}</g>;
const KH = 270, MH = 0.9 * KH;
const RIM_DUSK: Rim2[] = [{c: '#ffc58a', o: 0.5, dx: -2.4, dy: -1.4}, {c: '#8094c4', o: 0.22, dx: 2.0, dy: -1.0}];
const RIM_DOOR: Rim2[] = [{c: '#ffd59a', o: 0.75, dx: 2.6, dy: -1.2}, {c: '#ffc58a', o: 0.3, dx: -2.2, dy: -1.4}];

/* ====================== bars 68–69 · 1 November, thick fog, the Humber Bridge: he pushes the cart; people line the rail ====================== */
const FogBank: React.FC<{t: number; y: number; o: number; seed: number; id: string; spd?: number}> = ({t, y, o, seed, id, spd = 1}) => <Blur id={id} s={34}>
	{Array.from({length: 7}, (_, i) => <ellipse key={i} cx={f1((((rnd(i, seed) * 2600 + t * spd * (16 + 10 * rnd(i, seed + 1))) % 2800) - 400))} cy={f1(y + (rnd(i, seed + 2) - 0.5) * 120)} rx={f1(300 + 200 * rnd(i, seed + 3))} ry={f1(60 + 40 * rnd(i, seed + 4))} fill="#dfe2e2" opacity={o} />)}</Blur>;
const Fan: React.FC<{x: number; g: number; h: number; i: number; t: number; phone?: boolean; wave?: boolean; flip?: boolean}> = ({x, g, h, i, t, phone, wave, flip = true}) => {
	const sway = Math.sin(t * 1.3 + i * 1.9);
	const pose = phone ? grounded({lean: 0, neck: -4, lt: 3, lk: 3, rt: -5, rk: 4, la: 100 + 4 * sway, le: 30, ra: 6, re: 16})
		: wave ? grounded({lean: -2, neck: -6, lt: 3, lk: 3, rt: -5, rk: 4, la: 160 + 12 * Math.sin(t * 7 + i), le: 10, ra: 6, re: 16})
			: grounded({lean: 3 + 2 * sway, neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: 30, le: 100, ra: 34, re: 96});
	const hd = flip ? [x - pose.LHand[0] * h, g - pose.LHand[1] * h] : [x + pose.LHand[0] * h, g - pose.LHand[1] * h];
	return <g><Lit x={x} ground={g} h={h} pose={pose} look={i % 3 === 1 ? LOOK.woman : LOOK.man} flip={flip} col="#15161a" rims={[{c: '#e8eaea', o: 0.35, dx: -2, dy: -1.4}]} />
		{phone && <><rect x={hd[0] - 6} y={hd[1] - 22} width={10} height={18} rx={2} fill="#bfe0ff" opacity={0.9} /><Glow x={hd[0] - 1} y={hd[1] - 13} r={30} c="#bfe0ff" o={0.5} id={`fan_p${i}`} /></>}</g>;
};
export const HumberScene: SC = ({T}) => {
	const u = T - D(68), h = 300, g = 760, x = 900, v = vNat(h), dd = v * (u + 2.5);
	const push = Math.max(0, seg(T, BT(69, 1.4), D(70))), zp = Math.exp(Math.log(1.7) * eio(push)), fogIn = 1 - sm(seg(T, D(68), D(68) + 0.5));
	const deckY = (sx: number) => g + 6 - (sx - 960) * 0.02;
	const scroll = (k: number, period: number) => -((dd * k) % period);
	return <g><g transform={`translate(1240,560) scale(${zp.toFixed(4)}) translate(-1240,-560)`}><Cam z={1.02} rot={-1}>
		<Sky id="hb_s" stops={[[0, '#767c84'], [0.5, '#b2b6b8'], [1, '#a2a6a4']]} />
		{/* the far tower, ghosted; the main cable sagging toward it */}
		<g opacity={0.22} fill="#3a3e44" transform={`translate(${f1(-dd * 0.08)},0)`}><rect x={1660} y={60} width={34} height={640} /><rect x={1760} y={60} width={34} height={640} /><rect x={1660} y={120} width={134} height={18} /><rect x={1660} y={400} width={134} height={14} /></g>
		<path d={`M${f1(380 - dd * 0.3)},-60 Q${f1(1080 - dd * 0.2)},990 ${f1(1720 - dd * 0.08)},90`} stroke="#2e3238" strokeWidth={7} fill="none" opacity={0.8} />
		<FogBank t={T} y={460} o={0.4} seed={3} id="hb_f1" />
		{/* the deck: girder, walkway, railing, lamps (scroll with him) */}
		<rect x={-200} y={g + 6} width={W + 400} height={40} fill="#33373d" /><rect x={-200} y={g + 6} width={W + 400} height={3} fill="#c8ccd0" opacity={0.45} />
		<rect x={-200} y={g + 46} width={W + 400} height={400} fill="#8e9294" opacity={0.6} />
		<g transform={`translate(${f1(scroll(1, 60))},0)`}>{Array.from({length: 40}, (_, i) => <line key={i} x1={-120 + i * 60} y1={g - 44} x2={-120 + i * 60} y2={g + 6} stroke="#2a2e34" strokeWidth={2} />)}</g>
		<rect x={-200} y={g - 48} width={W + 400} height={5} fill="#2a2e34" />
		<g transform={`translate(${f1(scroll(1, 380))},0)`}>{Array.from({length: 8}, (_, i) => { const px = -200 + i * 380; return <g key={i}><rect x={px} y={g - 200} width={6} height={206} fill="#2a2e34" /><rect x={px - 20} y={g - 206} width={30} height={7} fill="#2a2e34" />
			<Glow x={px - 12} y={g - 196} r={44} c={GOLD} o={0.55} id={`hb_l${i}`} /><circle cx={px - 12} cy={g - 197} r={4} fill={GOLD_HI} /></g>; })}</g>
		{/* people lining the rail ahead, phones up, waving */}
		<g transform={`translate(${f1(-dd + v * 2.5 + 0)},0)`}>{[[1500, 0], [1580, 1], [1650, 2], [1760, 3], [1850, 4], [1990, 5], [2080, 6], [2200, 7], [2290, 8]].map(([px, i]) =>
			<Fan key={i} x={px + 300} g={g} h={h * (0.88 + 0.08 * rnd(i, 3))} i={i} t={T} phone={i % 3 === 0} wave={i % 3 === 1} />)}</g>
		<Karl stage="home" id="hb_k" x={x} g={g} h={h} pose={walkD(dd, h, 6)} rims={[{c: '#f4f2ee', o: 0.5, dx: -2.4, dy: -1.6}]} cart={{dist: dd / h}} />
		{/* the near tower leg passing in the foreground */}
		<g transform={`translate(${f1(scroll(1.4, 3200) + 1800)},0)`} fill="#24282e"><path d="M330,1200 L346,-160 L424,-160 L440,1200 Z" /><rect x={340} y={160} width={100} height={30} /></g>
		<FogBank t={T + 7} y={720} o={0.32} seed={9} id="hb_f2" />
		<FogBank t={T + 3} y={260} o={0.28} seed={14} id="hb_f3" />
	</Cam></g>
		{/* the fog thickens as the camera pushes into it (the bridge's far end is on the other side) */}
		{fogIn > 0 && <rect width={W} height={H} fill="#dfe2e2" opacity={0.95 * fogIn} />}
		{push > 0 && <rect width={W} height={H} fill="#dfe2e2" opacity={0.96 * sm(seg(push, 0.3, 1))} />}
	</g>;
};

/* ====================== bars 70–71 · out of the fog: the far end of the bridge, Hull's lights; a light match into the street ====================== */
export const FarEndScene: SC = ({T}) => {
	const u = T - D(70), vp: [number, number] = [1250, 560], lift = sm(seg(u, 0.1, 2.6)), h = 560, v = vNat(h), dd = v * (u + 3);
	const clear = 1 - sm(seg(T, D(70), D(70) + 0.7)), push = sm(seg(T, BT(71, 1.0), D(72)));
	const L = (k: number, side: number, y0: number): [number, number] => [lerp(vp[0], side < 0 ? -300 : 2300, k), lerp(vp[1], y0, k)];
	const zc = Math.exp(Math.log(1.6) * push);
	return <g><g transform={`translate(${vp[0]},${vp[1]}) scale(${zc.toFixed(4)}) translate(${-vp[0]},${-vp[1]})`}><Cam z={lerp(1.0, 1.06, eio(seg(u, 0, 3.4)))} px={lerp(0, -40, eio(seg(u, 0, 3.4)))}>
		<Sky id="fe_s" stops={[[0, '#5c626a'], [0.5, '#9ea2a4'], [1, '#8a8e8e']]} />
		<g opacity={0.35 + 0.65 * lift}><path d={`M880,${vp[1] + 4} Q1250,${vp[1] - 18} 1720,${vp[1] + 2} L1720,${vp[1] + 20} L880,${vp[1] + 20} Z`} fill="#4a4c52" />
			{Array.from({length: 26}, (_, i) => <circle key={i} cx={f1(910 + rnd(i, 3) * 780)} cy={f1(vp[1] - 6 + rnd(i, 4) * 14)} r={2.6} fill={GOLD_HI} />)}
			<Glow x={1260} y={vp[1]} r={440} c={GOLD} o={0.4 + 0.3 * push} id="fe_town" /></g>
		<g opacity={0.3 + 0.4 * lift} fill="#34383e"><rect x={1130} y={250} width={22} height={320} /><rect x={1350} y={250} width={22} height={320} /><rect x={1130} y={280} width={242} height={14} /><rect x={1130} y={430} width={242} height={12} /></g>
		<g opacity={0.6 * lift} fill="#22242a">{Array.from({length: 18}, (_, i) => <rect key={i} x={1180 + i * 8} y={f1(vp[1] - 18 - 6 * rnd(i, 7))} width={5} height={f1(16 + 6 * rnd(i, 7))} rx={2} />)}</g>
		<path d="M1141,250 Q700,560 -200,180" stroke="#2e3238" strokeWidth={6} fill="none" opacity={0.7} /><path d="M1361,250 Q1800,560 2300,180" stroke="#2e3238" strokeWidth={6} fill="none" opacity={0.7} />
		<path d={poly([L(0, -1, 1300), vp, L(0, 1, 1300), [2300, 1300], [-300, 1300]])} fill="#54585c" />
		<path d={poly([vp, L(1, -1, 1300), L(1, 1, 1300)])} fill="#464a4e" />
		<path d={`M${vp[0]},${vp[1]} L-300,1100`} stroke="#26292d" strokeWidth={4} /><path d={`M${vp[0]},${vp[1] - 6} L-300,880`} stroke="#26292d" strokeWidth={5} />
		<path d={`M${vp[0]},${vp[1]} L2300,1100`} stroke="#26292d" strokeWidth={4} /><path d={`M${vp[0]},${vp[1] - 6} L2300,880`} stroke="#26292d" strokeWidth={5} />
		<path d={`M${vp[0]},${vp[1]} L700,1300`} stroke="#e8e8e0" strokeWidth={3} strokeDasharray="30 40" opacity={0.4} />
		{Array.from({length: 9}, (_, i) => { const k = Math.pow(0.7, i), px = lerp(vp[0], -100, k), py = lerp(vp[1], 1000, k), ph = 520 * k; return <g key={i}><rect x={f1(px)} y={f1(py - ph)} width={f1(Math.max(2, 9 * k))} height={f1(ph)} fill="#26292d" /><circle cx={f1(px + 30 * k)} cy={f1(py - ph)} r={f1(Math.max(2, 7 * k))} fill={GOLD_HI} /><Glow x={px + 30 * k} y={py - ph} r={60 * k + 10} c={GOLD} o={0.6} id={`fe_l${i}`} /></g>; })}
		<Blur id="fe_fog" s={40}><rect x={-400} y={vp[1] - 160} width={W + 800} height={220} fill="#d8dcdc" opacity={0.45 * (1 - 0.6 * lift)} /></Blur>
		<Karl stage="home" id="fe_k" x={560} g={1120} h={h} pose={walkD(dd, h, 5)} rims={[{c: '#ffe8c8', o: 0.6, dx: 2.4, dy: -1.6}]} cart={{dist: dd / h}} />
	</Cam></g>
		{clear > 0 && <rect width={W} height={H} fill="#dfe2e2" opacity={0.96 * clear} />}
		{push > 0 && <Glow x={vp[0]} y={vp[1]} r={260 + 700 * push} c="#ffcf8a" o={0.75 * sm(seg(push, 0.2, 1))} id="fe_bl" />}
	</g>;
};

/* ====================== bars 72–79 · Hull, the next day: the street, the banner, his mother at the window, the door ====================== */
const Neighbours: React.FC<{t: number; xs: number[]}> = ({t, xs}) => <g>{xs.map((x, i) => <Fan key={i} x={x} g={930} h={KH * (0.92 + 0.06 * rnd(i, 3))} i={i} t={t} phone={i % 2 === 0} wave={i === 3} />)}</g>;
/** bars 72–73 · he walks into the terrace from the left (a light match from the bridge: the far lights become the street lamp) */
export const StreetScene: SC = ({T}) => {
	const u = T - D(72), v = vNat(KH), x = 560 + v * u, cx = lerp(1000, 1120, eio(seg(u, 0, 3.4))), inL = 1 - sm(seg(T, D(72), D(72) + 0.4));
	return <g><WCam cx={cx} cy={620} z={0.86}>
		<StreetBack t={T} mode="dusk" />
		<Banner t={T} />
		<Door open={0} />
		<Neighbours t={T} xs={[1900, 1990, 2120, 2210]} />
		<StreetFront mode="dusk" />
		<Karl stage="home" id="sr_k" x={x} g={952} h={KH} pose={walkD(v * u + 200, KH, 4)} rims={RIM_DUSK} />
	</WCam>
		{inL > 0 && <Glow x={380 * 0.86 + 960 - 1000 * 0.86} y={380} r={400} c="#ffcf8a" o={0.8 * inL} id="sr_in" />}
	</g>;
};
/** bars 74–75 · the banner (on the bar-74 kick), then the near-silent beats: he stops at the gate and looks up at it */
export const BannerScene: SC = ({T}) => {
	const u = T - D(74), tilt = eio(seg(u, 0, 2.4)), look = sm(seg(T, BT(74, 1), BT(74, 1.8)));
	const pose = mixPose(PZ.stand, PZ.lookUp, look);
	return <g><WCam cx={lerp(1330, 1405, tilt)} cy={lerp(610, 515, tilt)} z={lerp(1.24, 1.32, tilt)}>
		<StreetBack t={T} mode="dusk" />
		<Banner t={T * 1.4} />
		<Door open={0} />
		<Neighbours t={T} xs={[1880, 1990, 2140]} />
		<StreetFront mode="dusk" />
		<Karl stage="home" id="bn_k" x={1060} g={930} h={KH} pose={pose} rims={RIM_DUSK} />
	</WCam></g>;
};
/** bars 76–77 · his mother at the bay window lifting the net curtain (she sees him) */
export const WindowScene: SC = ({T}) => {
	const u = T - D(76), lift = sm(seg(u, 0.4, 1.4)), x = 1540, g = 640 + 0.98 * MH;
	const pose = grounded({lean: 4, neck: 6 - 10 * lift, lt: 2, lk: 2, rt: -3, rk: 3, la: lerp(10, 112, lift), le: lerp(20, 40, lift), ra: 6, re: 30});
	const hd: [number, number] = [x - pose.LHand[0] * MH, g - pose.LHand[1] * MH];
	return <g><WCam cx={lerp(1500, 1525, eio(seg(u, 0, 3.4)))} cy={720} z={lerp(2.15, 2.3, eio(seg(u, 0, 3.4)))}>
		<StreetBack t={T} mode="dusk" />
		<Banner t={T * 1.4} />
		<g><defs><clipPath id="wn_pane"><rect x={1412} y={622} width={212} height={160} /></clipPath></defs>
			<g clipPath="url(#wn_pane)">
				<rect x={1412} y={622} width={212} height={160} fill="#ffcf8a" opacity={0.35} />
				<Karl stage="mum" id="wn_m" x={x} g={g} h={MH} pose={pose} flip col="#1e1410" rims={[{c: '#fff0d0', o: 0.75, dx: 2.4, dy: -1.6}]} />
				<path d={`M1412,622 L${f1(hd[0] - 4)},622 Q${f1(hd[0] - 20)},${f1(lerp(700, hd[1], 0.5))} ${f1(hd[0] - 6)},${f1(hd[1])} Q${f1(lerp(1412, hd[0], 0.4))},740 1430,782 L1412,782 Z`} fill="#f4ead8" opacity={0.45} />
				<path d={`M${f1(hd[0] + 20)},622 L1624,622 L1624,782 L${f1(hd[0] + 40)},782 Q${f1(hd[0] + 26)},700 ${f1(hd[0] + 20)},622 Z`} fill="#f4ead8" opacity={0.3 * (1 - lift)} /></g>
			<path d="M1412,702 H1624" stroke="#5c4a40" strokeWidth={7} /><rect x={1412} y={622} width={212} height={160} fill="none" stroke="#5c4a40" strokeWidth={7} /></g>
		<Glow x={1520} y={700} r={260} c="#ffcf8a" o={0.25} id="wn_g" />
		<StreetFront mode="dusk" />
	</WCam></g>;
};
/** bars 78–79 · the break: the door opens, the light spills; at the bar-80 downbeat it floods the frame (into the hug) */
export const DoorScene: SC = ({T}) => {
	const u = T - D(78), open = sm(seg(u, 0.3, 2.2)), mx = 1222, flood = sm(seg(T, BT(79, 3), D(80)));
	const mum = <Karl stage="mum" id="dr_m" x={mx} g={900} h={MH} pose={grounded({lean: 2, neck: -2, lt: 2, lk: 2, rt: -3, rk: 3, la: 30, le: 40, ra: 4, re: 14})} flip col="#140e0c" rims={[{c: '#ffe0a8', o: 0.9, dx: 2.4, dy: -1.6}]} />;
	return <g><WCam cx={lerp(1110, 1150, eio(seg(u, 0, 3.4)))} cy={785} z={lerp(1.72, 1.86, eio(seg(u, 0, 3.4)))}>
		<StreetBack t={T} mode="dusk" />
		<Banner t={T * 1.4} />
		<Door open={open} inside={mum} />
		<DoorSpill open={open} />
		<StreetFront mode="dusk" />
		<Karl stage="home" id="dr_k" x={1000} g={930} h={KH} pose={PZ.stand} rims={[{c: '#ffd9a0', o: 0.5 + 0.4 * open, dx: 2.4, dy: -1.6}]} />
	</WCam>
		{flood > 0 && <rect width={W} height={H} fill="#ffe6bc" opacity={0.9 * flood} />}
	</g>;
};
/* ====================== bars 80–82 · the hug (the hook's shot, now earned): held, a slow push; the real photo lands on bar 81 ====================== */
/* poses copied from the demo's hug (qq59/demo59 MP.hug, KP.hug) so the two hugs rhyme */
const MUM_HUG = grounded({lean: 7, neck: -10, lt: 4, lk: 5, rt: -4, rk: 4, la: 40, le: 90, ra: 46, re: 84});
const KARL_HUG = grounded({lean: 13, neck: 24, lt: 4, lk: 8, rt: -6, rk: 7, la: 4, le: 128, ra: 10, re: 122});
export const HugScene: SC = ({T}) => {
	const u = T - D(80), z = lerp(1.62, 1.74, eio(seg(u, 0, 5.1))), sway = Math.sin(u * 1.6) * 2.5, flood = 1 - sm(seg(T, D(80), D(80) + 0.45));
	return <g><WCam cx={1130} cy={lerp(700, 712, eio(seg(u, 0, 5.1)))} z={z}>
		<StreetBack t={T} mode="dusk" />
		<Banner t={T * 1.4} />
		<DoorSpill open={1} />
		<Door open={1} />
		<StreetFront mode="dusk" />
		<Karl stage="mum" id="hg_m" x={1092 + sway} g={MUM.path} h={MH} pose={MUM_HUG} flip col="#0f0b0c" rims={RIM_DOOR} />
		<Karl stage="home" id="hg_k" x={1060 + sway} g={MUM.path} h={KH} pose={KARL_HUG} rims={RIM_DOOR} />
	</WCam>
		{flood > 0 && <rect width={W} height={H} fill="#ffe6bc" opacity={0.9 * flood} />}
	</g>;
};

/* ====================== bars 83–84 · DROP: the whole gold route blazes round the globe ====================== */
/* a high camera (alt 5, a long lens) so nearly a hemisphere shows: the route wraps over the pole from the Americas to Europe */
export const globeDView = (T: number): SatView => { const k = seg(T, D(83), D(85) + 0.2);
	return {lon: lerp(-64, -30, trap(k, 0.2)), lat: lerp(30, 50, trap(k, 0.2)), alt: 5, F: Math.exp(lerp(Math.log(2600), Math.log(2850), eout(k))), tilt: 0, roll: 0, cx: 1000, cy: 585}; };
export const GlobeDScene: SC = ({T}) => {
	const v = globeDView(T), fl = hit(T, D(83), 2.2), beats = [0, 1, 2, 3, 4, 5, 6, 7].reduce((a, k) => a + hit(T, BT(83, k), 7), 0) * 0.5;
	const cp = trap(seg(T, D(83) + 0.02, BT(83, 3.6)), 0.15), ring = seg(T, D(83), D(83) + 0.9), R = (v.F ?? 1100) / Math.sqrt(36 - 1);
	const flash = 1 - seg(T, D(83), D(83) + 0.07);
	return <g>
		<Space id="gD" drift={(T - D(83)) * 10} />
		<Earth id="gDe" v={v} route={{p0: 0, p1: 1, w: 4.2 * (1 + 1.4 * fl + 0.22 * beats), head: cp, headO: cp < 0.999 ? 1 : 0}} home={1 + 0.5 * beats}
			pins={[{ll: PUNTA, kind: 'start', label: '起点', o: sm(seg(T, D(83) + 0.1, D(83) + 0.4)), dy: 40}, {ll: HULL, kind: 'home', label: '家', o: sm(seg(T, BT(83, 3.2), BT(83, 3.6))), dy: -28}]} />
		<CaspianSea v={v} route={{p0: 0.8517, p1: 0.8626}} />
		{ring > 0 && ring < 1 && <circle cx={v.cx} cy={v.cy} r={f1(R * (1.02 + 0.5 * eout(ring)))} fill="none" stroke={GOLD_HI} strokeWidth={f1(10 * (1 - ring))} opacity={0.8 * (1 - ring)} />}
		{flash > 0 && <rect width={W} height={H} fill="#fff6e0" opacity={0.7 * flash} />}
	</g>;
};

/* ====================== bars 85–86 · two of him, split by the gold line: 1998 at the signpost (29), 2026 at the door (57) ====================== */
export const TwoSelvesScene: SC = ({T}) => {
	const u = T - D(85), seam = sm(seg(u, 0, 0.4)), slide = sm(seg(u, 0, 0.75)), push = eio(seg(u, 0, 3.4)), pb = hit(T, D(86), 6);
	const s0 = 960, top = -20, bot = H + 20, sx = (y: number) => s0 + 70 - 140 * (y - top) / (bot - top);
	const young = withArms(grounded({lean: 6, neck: 2, lt: 2, lk: 2, rt: -4, rk: 4, la: 0, le: 0, ra: 0, re: 0}), [12, 128], [8, 132]);
	return <g>
		<defs><clipPath id="ts_l"><path d={`M-20,-20 L${f1(sx(top))},-20 L${f1(sx(bot))},${H + 20} L-20,${H + 20} Z`} /></clipPath><clipPath id="ts_r"><path d={`M${f1(sx(top))},-20 L${W + 20},-20 L${W + 20},${H + 20} L${f1(sx(bot))},${H + 20} Z`} /></clipPath></defs>
		<rect width={W} height={H} fill="#08090b" />
		<g clipPath="url(#ts_l)"><g transform={`translate(${f1(-300 * (1 - slide))},0)`}><Cam z={1.0 + 0.04 * push + 0.015 * pb} px={-20 * push}>
			<Sky id="ts_sk" stops={[[0, '#3c4c5e'], [0.45, '#6e7f8e'], [0.62, '#a9b3b6'], [0.7, '#c8c6ba']]} />
			<Glow x={300} y={300} r={420} c="#fff0d0" o={0.5} id="ts_sun" /><circle cx={300} cy={300} r={28} fill="#fffdf6" />
			<Strait t={T} y0={560} y1={720} />
			<path d="M-600,760 Q200,700 800,730 Q1400,760 2200,712 L2200,1400 L-600,1400 Z" fill="#4e4430" />
			<Grass x0={-600} x1={1200} y={770} t={T} n={40} seed={1} col="#5a4c30" hi="#c8b07a" s={0.7} />
			<path d="M-600,905 L2200,905 L2200,1400 L-600,1400 Z" fill="#2e281c" />
			<Signpost x={300} ground={905} t={T} s={0.9} />
			<Lit x={600} ground={905} h={360} pose={young} look={LOOK.karlYoung} col="#0c0b0e" rims={[{c: '#f2f0e4', o: 0.55, dx: -2.4, dy: -1.6}, {c: '#9ab0c4', o: 0.25, dx: 2.0, dy: -1.0}]} />
			<Grass x0={-600} x1={1200} y={1000} t={T} n={30} seed={7} col="#211c12" hi="#a08a5a" s={1.6} />
		</Cam></g></g>
		<g clipPath="url(#ts_r)"><g transform={`translate(${f1(300 * (1 - slide))},0)`}><WCam cx={lerp(1010, 1040, push)} cy={720} z={1.5 + 0.06 * push + 0.02 * pb}>
			<StreetBack t={T} mode="dusk" /><Banner t={T * 1.4} /><DoorSpill open={1} /><Door open={1} /><StreetFront mode="dusk" />
			<Karl stage="home" id="ts_k" x={1060} g={MUM.path} h={KH} pose={PZ.stand} flip rims={RIM_DOOR} />
		</WCam></g></g>
		<path d={`M${f1(sx(top))},${top} L${f1(lerp(sx(top), sx(bot), seam))},${f1(lerp(top, bot, seam))}`} stroke={GOLD} strokeWidth={f1(5 + 3 * pb)} opacity={0.95} />
		<path d={`M${f1(sx(top))},${top} L${f1(lerp(sx(top), sx(bot), seam))},${f1(lerp(top, bot, seam))}`} stroke={GOLD_HI} strokeWidth={22} opacity={0.18 + 0.2 * pb} />
		<g opacity={sm(seg(u, 0.35, 0.7))}><Label x={560} y={880} s="1998 · 29岁" size={46} /><Label x={1400} y={880} s="2026 · 57岁" size={46} /></g>
	</g>;
};

/* ====================== bars 87–88 · the globe settles on Britain; the gold line closes at Hull; a push into Hull's light ====================== */
export const globeEView = (T: number): SatView => { const k = eio(seg(T, D(87) - 0.1, BT(88, 2.2)));
	return mixSat({lon: -30, lat: 50, alt: 5, F: 2850, tilt: 0, roll: 0, cx: 1000, cy: 585}, {lon: HULL[0] + 2, lat: HULL[1] - 3, alt: 0.55, F: 1100, tilt: 18, roll: 0, cx: 960, cy: 600}, k); };
export const GlobeEScene: SC = ({T}) => {
	const v = globeEView(T), close = hit(T, D(88), 3), pulse = ((T - D(87)) / (2 * BEAT)) % 1, hp = satPt(v, HULL as LL);
	const push = sm(seg(T, BT(88, 1.6), D(89))), into = hp ? Math.exp(Math.log(2.4) * push) : 1;
	return <g><g transform={hp ? `translate(${f1(hp[0])},${f1(hp[1])}) scale(${into.toFixed(4)}) translate(${f1(-hp[0])},${f1(-hp[1])})` : undefined}>
		<Space id="gE" drift={(T - D(87)) * 5} />
		<Earth id="gEe" v={v} route={{p0: 0, p1: 1, head: 1, headO: 1 + close, w: 4.2 * (1 + 0.8 * close)}} home={1 + close}
			pins={[{ll: HULL, kind: 'home', label: '赫尔', o: sm(seg(T, D(87) + 0.3, D(87) + 0.7)) * (1 - push), dy: -30}]} />
		{hp && [0, 0.5].map((o, i) => { const q = (pulse + o) % 1; return <circle key={i} cx={f1(hp[0])} cy={f1(hp[1])} r={f1(18 + 80 * q)} fill="none" stroke={GOLD_HI} strokeWidth={3 - i} opacity={0.75 * (1 - q) * (1 - push)} />; })}
	</g>
		{hp && push > 0 && <Glow x={hp[0]} y={hp[1]} r={200 + 900 * push} c="#ffcf8a" o={0.9 * sm(seg(push, 0.2, 1))} id="gE_bl" />}
	</g>;
};

/* ====================== bars 89–95 · night in Hull, one lit window (a light match out of the globe); the end card dims it to 30 % ====================== */
export const NightScene: SC = ({T}) => {
	const u = T - D(89), k = eio(seg(u, 0, 6.6)), inL = 1 - sm(seg(T, D(89), D(89) + 0.6));
	return <g><WCam cx={lerp(1560, 1585, k)} cy={lerp(420, 400, k)} z={lerp(1.25, 1.42, k)}>
		<StreetBack t={T} mode="night" banner={false} />
		<defs><clipPath id="nt_win"><rect x={1480} y={210} width={210} height={230} /></clipPath></defs>
		<g clipPath="url(#nt_win)"><rect x={1480} y={210} width={210} height={230} fill="#ffcf8a" opacity={0.3} />
			<path d="M1488,216 Q1520,325 1492,436 L1480,440 L1480,210 Z M1682,216 Q1650,325 1678,436 L1690,440 L1690,210 Z" fill="#6a3c2a" opacity={0.85} /></g>
		<path d="M1480,325 H1690 M1585,210 V440" stroke="#3c3236" strokeWidth={8} /><rect x={1480} y={210} width={210} height={230} fill="none" stroke="#3c3236" strokeWidth={7} />
		<Door open={0} mode="night" />
		<StreetFront mode="night" />
		<Glow x={1585} y={330} r={420} c="#ffcf8a" o={0.22} id="nt_g" />
	</WCam>
		<Specks t={T} n={40} seed={21} col="#c8d4e8" o={0.2} vx={-10} vy={30} r={1.6} />
		{inL > 0 && <Glow x={960} y={560} r={1100} c="#ffcf8a" o={0.9 * inL} id="nt_in" />}
	</g>;
};
void Label; void FlagTree; void leanP; void nod; void FIGC; void routeAt; void walkD; void walkB; void vBrisk;
