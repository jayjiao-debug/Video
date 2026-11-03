import React from 'react';
import {D, BT} from './lines59';
import {W, H, rnd, seg, lerp, sm, eio, eo, ei, land, Glow, Sky, Cam, CamT, Par, Haze, StreetBack, StreetFront, Door, DoorSpill, Banner, MUM, TownPlanes, CloudLayer,
	Signpost, FlagTree, Grass, Gulls, Strait, Bus, Pickup, Plane, RedX, Guanaco, WireFence, PackTop, TentBag, Cash, PlasticCam, Planks, Tag, YearCard, Lamp, ParkedCar} from './bg59';
import {Lit, Rim, Pose, LOOK, PZ, STAGE, grounded, walkTo, walkNat, walkPose, withArms, mixPose, nod, jointAt, Look59, PackProp, Walker, walkG, cartParts, CART_PAINT, LitParts} from './figure59';
import {Globe, Space, ROUTE, routeAt, followAt, HULL, PUNTA, GlobeView, projOf, Earth, SatView, satPt, headingAt} from './globe59';
/* ep59 demo scenes (bars 0–21, film 0–35.94 s). Every scene takes film time t, runs its own camera and acting.
   Hits (tier 1–2) sit on the grid: cuts on downbeats; the door, the ✕s, the kit pops, the first step and the calendar stop on beats.
   Continuous actions (walking, waves, smoke, flipping pages) keep their own clocks. */
type P2 = [number, number];
/** constant speed with soft ends: accelerate over the first fraction a, cruise, decelerate over the last a (position 0 → 1) */
export const trap = (u: number, a: number) => { const v = 1 / (1 - a); return u <= 0 ? 0 : u >= 1 ? 1 : u < a ? v * u * u / (2 * a) : u > 1 - a ? 1 - v * (1 - u) * (1 - u) / (2 * a) : v * (u - a / 2); };
const mixCam = (a: CamT, b: CamT, k: number): CamT => ({cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), z: lerp(a.z, b.z, k), r: lerp(a.r ?? 0, b.r ?? 0, k)});
/** zoom interpolated in log space (constant-rate zooms) */
const mixCamL = (a: CamT, b: CamT, k: number): CamT => ({cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), k)), r: lerp(a.r ?? 0, b.r ?? 0, k)});

/* ====================== A. the homecoming, Hull, dusk (0 → 10.75): wide → door → the question → the hug → the crane ====================== */
const KH = 270, MH = 0.9 * KH;   // Karl's and his mother's heights (px at zoom 1)
const RIM_DUSK: Rim[] = [{c: '#ffc58a', o: 0.5, dx: -2.4, dy: -1.4}, {c: '#8094c4', o: 0.22, dx: 2.0, dy: -1.0}];
const RIM_DOOR: Rim[] = [{c: '#ffd59a', o: 0.7, dx: 2.6, dy: -1.2}, {c: '#ffc58a', o: 0.3, dx: -2.2, dy: -1.4}];
const RIM_BACKLIT: Rim[] = [{c: '#ffd9a0', o: 0.75, dx: 2.4, dy: -1.6}, {c: '#ffd9a0', o: 0.75, dx: -2.4, dy: -1.6}, {c: '#ffe2b0', o: 0.5, dx: 0, dy: -2.6}];
/* his mother (七十多岁): a slight stoop; one hand still on the door, then both hands come up, to her face, then round him */
const MP = {
	door: grounded({lean: 8, neck: 6, lt: 2, lk: 3, rt: -3, rk: 3, la: 8, le: 22, ra: -18, re: 34}),
	see: grounded({lean: 2, neck: -2, lt: 2, lk: 3, rt: -3, rk: 3, la: 22, le: 104, ra: -14, re: 32}),
	face: grounded({lean: 10, neck: 12, lt: 2, lk: 3, rt: -3, rk: 3, la: 30, le: 140, ra: 24, re: 146}),
	hug: grounded({lean: 7, neck: -10, lt: 4, lk: 5, rt: -4, rk: 4, la: 40, le: 90, ra: 46, re: 84}),
};
/* Karl: arms open as he steps in; in the hug one forearm crosses her back (hidden in the one-tone shape), head bowed to her */
const KP = {
	open: grounded({lean: 8, neck: 4, lt: 4, lk: 4, rt: -5, rk: 5, la: 46, le: 30, ra: 38, re: 34}),
	hug: grounded({lean: 13, neck: 24, lt: 4, lk: 8, rt: -6, rk: 7, la: 4, le: 128, ra: 10, re: 122}),
};
const T_HOME = {stop: 2.3, door: BT(2, 1), face: D(3), stepOut: D(3) + 0.62, hug: D(3) + 1.42, crane: 7.72, craneEnd: 10.3};
/** where Karl stands for the whole homecoming: on the path, in the open gateway, facing the door */
const KX = 1040;
/** Karl at the homecoming: position, ground, pose (2026: no pack; his cart is parked behind him on the pavement) */
const karlHome = (t: number): {x: number; g: number; pose: Pose} => {
	// bars 0–2: he stands at the foot of the step looking up at the banner, breathing; on bar 2 he lowers his head (moved)
	let pose = mixPose(PZ.stand, PZ.lookUpFree, 0.75 - 0.08 * Math.sin(t * 1.3));
	pose = mixPose(pose, PZ.bow, sm(seg(t, D(2) + 0.25, D(2) + 0.75)) * (1 - sm(seg(t, T_HOME.face, T_HOME.face + 0.3))));
	pose = mixPose(pose, KP.open, sm(seg(t, T_HOME.hug - 0.6, T_HOME.hug - 0.15)));
	pose = mixPose(pose, KP.hug, sm(seg(t, T_HOME.hug - 0.15, T_HOME.hug + 0.25)));
	const x = lerp(KX, KX + 24, sm(seg(t, T_HOME.hug - 0.55, T_HOME.hug - 0.1)));
	const sway = Math.sin((t - T_HOME.hug) * 1.6) * 2.5 * seg(t, T_HOME.hug, T_HOME.hug + 0.5);
	return {x: x + sway, g: MUM.path, pose};
};
const mumHome = (t: number): {x: number; g: number; pose: Pose; inDoor: boolean} => {
	let pose = mixPose(MP.door, MP.see, sm(seg(t, T_HOME.door + 0.3, T_HOME.door + 0.55)));
	pose = mixPose(pose, MP.face, sm(seg(t, T_HOME.face, T_HOME.face + 0.32)));
	// she comes down the step to him (two steps), then holds him
	const w = walkTo(t, T_HOME.stepOut, T_HOME.hug - 0.05, 1196, 1088, MH, MP.face);
	if (w.moving) pose = mixPose(w.pose, MP.face, 0.25);
	else if (t >= T_HOME.hug - 0.05) pose = mixPose(MP.face, MP.hug, sm(seg(t, T_HOME.hug - 0.15, T_HOME.hug + 0.3)));
	const g = lerp(MUM.step, MUM.path, sm(seg(t, T_HOME.stepOut + 0.15, T_HOME.stepOut + 0.45)));
	const sway = Math.sin((t - T_HOME.hug) * 1.6) * 2.5 * seg(t, T_HOME.hug, T_HOME.hug + 0.5);
	return {x: w.x + sway, g, pose, inDoor: t < T_HOME.stepOut + 0.2};
};
/* the opening pull-back (0 → bar 2): one continuous move that starts on the real photo (his face, Hull, 2 Nov 2026) and lands on the
   drawn door. The size of his head on screen is the shared measure: the photo is scaled so his real head has that size, the drawn camera
   is zoomed so the drawn head has it, and both heads sit on the same screen point. Log-size eases from 530 px to the door framing. */
export const HEAD_U = 0.135;                                   // drawn head height in body units (crown to chin)
const OPEN_T1 = D(2) + 0.1, HEAD0 = 530, HEAD1 = HEAD_U * KH * 2.27;
export const openHead = (t: number) => Math.exp(lerp(Math.log(HEAD0), Math.log(HEAD1), trap(seg(t, 0, OPEN_T1), 0.32)));
/** the screen point of his head during the opening (photo face point → his place in the door framing) */
export const openHeadAt = (t: number): P2 => { const u = sm(seg(t, 0.9, OPEN_T1)); return [lerp(1010, 737, u), lerp(470, 352, u)]; };
const headWorld = (): P2 => { const p = mixPose(PZ.stand, PZ.lookUpFree, 0.75), hd = jointAt(p, 'Head', KX, MUM.path, KH), tp = jointAt(p, 'Top', KX, MUM.path, KH); return [lerp(hd[0], tp[0], 0.3), lerp(hd[1], tp[1], 0.3)]; };
const HW = headWorld();
/** the homecoming camera: the pull-back off the photo, the push to the door, the dolly-out to the question, the crane */
export const homeCam = (t: number): CamT => {
	if (t < OPEN_T1) { const z = openHead(t) / (HEAD_U * KH), S = openHeadAt(t); return {cx: HW[0] - (S[0] - 960) / z, cy: HW[1] - (S[1] - 540) / z, z}; }
	const door = mixCam({cx: 1150, cy: 752, z: 2.27}, {cx: 1153, cy: 749, z: 2.33}, seg(t, OPEN_T1, D(3)));
	/* the question: a quick dolly-out lands on bar 3 (the banner above the centred line, the two of them below it); a slow push while they hold */
	const drift = mixCam({cx: 1196, cy: 584, z: 1.6}, {cx: 1190, cy: 588, z: 1.66}, seg(t, D(3), T_HOME.crane));
	if (t < D(3) + 0.14) { const k = trap(seg(t, D(3) - 0.48, D(3) + 0.14), 0.3); return mixCamL(door, drift, k); }
	/* the crane: rises off the hug at a near-constant rate, little zoom (rise and zoom add up on the roofline): measured ≤ ~26 px/frame */
	const u = trap(seg(t, T_HOME.crane, T_HOME.craneEnd), 0.25), z0 = drift.z, z1 = 1.0, lr = Math.log(z0 / z1);
	const w = (Math.exp(lr * u) - 1) / (Math.exp(lr) - 1);   // rise slower while the zoom is high: constant speed on screen
	return {cx: lerp(drift.cx, 1110, u), cy: lerp(drift.cy, -400, w), z: z0 * Math.pow(z1 / z0, u)};
};
/** his cart, parked on the pavement behind him (shafts down on the flags): it crossed the world with him */
const ParkedCart: React.FC<{rims: Rim[]}> = ({rims}) => { const c = cartParts(KX - 170, 930, KH * 1.0, [0.0, 0.06], 0.4, 'orange');
	return <LitParts parts={[...c.back.map((p) => ({...p, fill: p.fill ?? (p.role === 'load' ? CART_PAINT.orange.load : undefined)})), ...c.front]} rims={rims} k={0.6} col="#0c0a0e" />; };
export const Homecoming: React.FC<{t: number}> = ({t}) => {
	const cam = homeCam(t), K = karlHome(t), M = mumHome(t), open = sm(seg(t, T_HOME.door, T_HOME.door + 0.36));
	const bg = 1 - sm(seg(t, 8.2, 9.0));   // the street-level sky gives way to the high view of the town as the camera rises
	const rimK = RIM_DOOR.map((r, i) => (i === 0 ? {...r, o: r.o * (0.25 + 0.75 * open)} : r));
	const mumFig = <Lit x={M.x} ground={M.g} h={MH} pose={M.pose} look={STAGE.mum} flip col="#0f0b0c" rims={M.inDoor ? RIM_BACKLIT : [{c: '#ffd9a0', o: 0.65, dx: 2.4, dy: -1.6}, {c: '#ffc58a', o: 0.28, dx: -2.0, dy: -1.4}]} />;
	return <g>
		{t > 8.2 && <TownPlanes cam={cam} t={t} />}
		<Cam {...cam}>
			<StreetBack t={t} mode="dusk" skyO={bg} />
			<Banner t={t} />
			{/* the door's light first, so it lights the bricks and the path but never washes over her */}
			<DoorSpill open={open} />
			<Door open={open} inside={M.inDoor ? mumFig : null} />
			{!M.inDoor && mumFig}
			{/* neighbours waiting down the street (faceless), on their own small idle clocks */}
			{[[1800, 0.94, 0], [1866, 0.9, 1], [1930, 0.97, 2]].map(([x, s, i]) => <Lit key={i} x={x} ground={930} h={KH * s} pose={mixPose(PZ.stand, PZ.lookUp, 0.15 + 0.1 * Math.sin(t * 0.9 + i * 2))} look={i === 1 ? LOOK.woman : LOOK.man} flip col="#0e0c10" rims={RIM_DUSK} />)}
			<StreetFront mode="dusk" />
			<ParkedCart rims={RIM_DUSK} />
			<Lit x={K.x} ground={K.g} h={KH} pose={K.pose} look={STAGE.k2026} col="#0c0a0e" rims={rimK} />
			<ParkedCar x={2140} ground={1000} s={1.15} />
		</Cam>
	</g>;
};

/* ====================== B. the globe: crane → title (route drawn back to the start, the years rewind) → the dive (10.2 → 16.2) ====================== */
const G_IN = 10.2, CRANE0 = 10.45, CRANE1 = 12.0, COMET0 = 12.2, COMET1 = 14.95, DIVE = 14.95, SIGN_IN = 15.72;
const HULL_U: P2 = [-360.33, 53.745];   // Hull with the route's unwrapped longitude
const EURASIA: P2 = [-325, 45];          // the end-of-crane view: Europe and Asia in front, the far side (Bering, the Americas) behind
const TITLE_END: P2 = [-71, -38];        // the rewind ends over Patagonia
/** the crane: the gold line draws itself out of Hull back along the whole route (0 → 1), landing as the line 「约5万公里」 ends */
export const craneQ = (t: number) => { const u = seg(t, CRANE0, CRANE1); return u < 0.3 ? 0.12 * (u / 0.3) ** 2 : 0.12 + 0.88 * (u - 0.3) / 0.7; };
/** the title: a light runs back along the route from Hull (1) to Punta Arenas (0) at a near-constant speed (≈ 25 px/frame on the surface) */
export const comet = (t: number) => 1 - trap(seg(t, COMET0, COMET1), 0.12);
/** route fraction → date (fractional year), for the rewinding counter (facts: start 1 Nov 1998, Darién 2001, Bering 2006, Mongolia 2017, China 2018, Caspian 2024, Channel Oct 2026, home 2 Nov 2026) */
const DATES: [number, number][] = [[0, 1998.83], [0.215, 2001.1], [0.511, 2006.22], [0.671, 2017.6], [0.707, 2018.5], [0.852, 2024.62], [0.916, 2025.33], [0.988, 2026.76], [1, 2026.84]];
export const dateAt = (p: number) => { for (let i = 1; i < DATES.length; i++) if (p <= DATES[i][0]) { const [a0, y0] = DATES[i - 1], [a1, y1] = DATES[i]; return y0 + (y1 - y0) * (p - a0) / (a1 - a0); } return 2026.84; };
/** the Earth camera for the crane/title/dive (perspective: altitude in Earth radii, tilt, roll); `sun` = where the signpost scene's sun sits
    on screen (the dive aims at it). The crane comes out of the clouds low over Britain, tilted toward the horizon, and rises to the whole
    Earth; under the title the Earth spins at a uniform rate (the route's own speed is very uneven: Russia flies by); the dive drops onto
    Patagonia, the nadir sliding onto the sun. Screen speed measured ≤ ~27 px/frame. */
export const ALT_TITLE = 2.15;
export const globeView = (t: number, sun: P2): SatView => {
	const kC = sm(seg(t, 10.55, 12.3)), u = seg(t, COMET0 - 0.1, COMET1);
	let lon = lerp(HULL_U[0], EURASIA[0], kC), lat = lerp(HULL_U[1] - 4, EURASIA[1], kC);
	if (t > COMET0 - 0.1) { lon = lerp(EURASIA[0], TITLE_END[0], trap(u, 0.15)); lat = lerp(EURASIA[1], TITLE_END[1], sm(seg(u, 0.3, 1))); }
	const ku = trap(seg(t, G_IN, 12.08), 0.18);
	let alt = Math.exp(lerp(Math.log(0.12), Math.log(ALT_TITLE), ku)), tilt = 34 * (1 - sm(seg(t, G_IN + 0.3, 11.7))), cx = 960, cy = lerp(lerp(860, 540, sm(seg(t, G_IN + 0.2, 11.5))), 430, sm(seg(t, 11.3, 12.1)));
	if (t > DIVE) { const k = seg(t, DIVE, 16.25), e = Math.pow(k, 2.6);   // slow at first; the fast end is under the haze and the dissolve
		alt = Math.exp(lerp(Math.log(ALT_TITLE), Math.log(0.004), e)); tilt = 18 * sm(seg(k, 0.4, 1));
		const ks = sm(seg(t, DIVE - 0.1, SIGN_IN + 0.3)); cx = lerp(960, sun[0], ks); cy = lerp(430, sun[1] + 120 * ks, ks); }
	const pk = sm(seg(t, DIVE - 0.2, DIVE + 0.35)); lon = lerp(lon, PUNTA[0], pk); lat = lerp(lat, PUNTA[1], pk);
	return {lon, lat, alt, tilt, cx, cy, roll: 0};
};
export const GlobeAct: React.FC<{t: number; sun: P2}> = ({t, sun}) => {
	const v = globeView(t, sun), q = craneQ(t), c = comet(t), gO = sm(seg(t, G_IN + 0.05, G_IN + 0.35));
	const cloudsIn = sm(seg(t, 9.7, 10.2)), cloudsOut = 1 - sm(seg(t, 10.38, 10.95)), cO = cloudsIn * cloudsOut;
	const cy0 = lerp(-150, 420, sm(seg(t, 9.6, 10.9)));
	const haze = sm(seg(t, 15.3, 15.8)) * (1 - sm(seg(t, 15.95, 16.25)));
	const inTitle = t >= COMET0;
	return <g>
		{gO > 0 && <g opacity={gO}>
			<Space id="gs" drift={(t - G_IN) * 6} />
			<Earth id="g1" v={v} route={{p0: inTitle ? 0 : 1 - q, p1: 1, head: inTitle ? (c > 0.002 && t < COMET1 + 0.2 ? c : undefined) : 1 - q, headO: inTitle ? 1 : (q > 0.002 && q < 0.995 ? 1 : 0)}}
				home={1} pins={[{ll: PUNTA, kind: 'start', o: sm(seg(t, COMET1 - 0.35, COMET1))}]} clouds={0.8} />
		</g>}
		{/* clouds the crane rises through: they come down from above, fill the frame, then part over the Earth */}
		{cO > 0.01 && <g>
			<rect x={0} y={0} width={W} height={H} fill="#4a4660" opacity={0.88 * sm(seg(t, 9.95, 10.25)) * cloudsOut} />
			<CloudLayer y={cy0 - 260} k={1} t={t} tint="#5e5874" under="#c08a70" o={cO} seed={1} s={1.3} />
			<CloudLayer y={cy0 + 120} k={1} t={t} tint="#6c6680" under="#d09a78" o={cO} seed={2} s={1.6} />
			<CloudLayer y={cy0 + 520} k={1} t={t} tint="#7a7290" under="#d8a888" o={cO} seed={3} s={1.9} />
		</g>}
		{/* entering the air over Patagonia: a pale haze covers the last of the dive */}
		{haze > 0 && <rect x={0} y={0} width={W} height={H} fill="#b8c4cc" opacity={0.7 * haze} />}
	</g>;
};

/* ====================== C. Patagonia, 1998: the signpost, he shoulders the pack, the first step (15.7 → 20.9) ====================== */
const YH = 360, SG = 905;   // young Karl's height, the ground
const RIM_SEA: Rim[] = [{c: '#f2f0e4', o: 0.55, dx: -2.4, dy: -1.6}, {c: '#9ab0c4', o: 0.25, dx: 2.0, dy: -1.0}];
const SUN_W: P2 = [560, 300];
const T_SIGN = {bend: D(10), lift: D(10) + 0.32, swing: D(10) + 0.62, on: D(10) + 0.82, step: BT(10, 3)};
const YP = {
	look: grounded({lean: 0, neck: -6, lt: 2, lk: 2, rt: -4, rk: 3, la: 4, le: 12, ra: 2, re: 16}),
	bend: grounded({lean: 48, neck: 12, lt: 64, lk: 92, rt: 34, rk: 74, la: 22, le: 6, ra: 12, re: 10}),
	lift: grounded({lean: 12, neck: 4, lt: 12, lk: 18, rt: -6, rk: 12, la: 40, le: 72, ra: 34, re: 78}),
	heave: grounded({lean: -4, neck: -2, lt: 4, lk: 6, rt: -6, rk: 8, la: 150, le: 40, ra: 140, re: 44}),
};
export const signCam = (t: number, kx: number): CamT => {
	const c0 = mixCam({cx: 940, cy: 540, z: 0.94}, {cx: 990, cy: 560, z: 1.06}, sm(seg(t, SIGN_IN - 0.3, T_SIGN.step)));
	const track = Math.max(0, kx - 1060) * sm(seg(t, T_SIGN.step, T_SIGN.step + 0.8));
	return {...c0, cx: c0.cx + track};
};
/** where the sun of the signpost scene sits on screen at time t (its plane has parallax k = 0.15): the dive lands on it, the goal globe leaves from it */
export const signSun = (t: number): P2 => { const c = signCam(Math.max(t, SIGN_IN), youngAt(Math.max(t, SIGN_IN)).x), k = 0.15, z = Math.pow(c.z, k);
	return [(SUN_W[0] - (960 + (c.cx - 960) * k)) * z + 960, (SUN_W[1] - (540 + (c.cy - 540) * k)) * z + 540]; };
const handsMid = (pose: Pose, x: number): P2 => { const l = jointAt(pose, 'LHand', x, SG, YH), r = jointAt(pose, 'RHand', x, SG, YH); return [(l[0] + r[0]) / 2, (l[1] + r[1]) / 2]; };
/** the pack on his back (torso frame s = 0.195, w = 0.14, as figure59 draws it): centre and angle */
const backPack = (pose: Pose, x: number): {x: number; y: number; a: number} => {
	const hp = jointAt(pose, 'Hips', x, SG, YH), sp = jointAt(pose, 'Spine1', x, SG, YH), dx = sp[0] - hp[0], dy = sp[1] - hp[1], l = Math.hypot(dx, dy) || 1, ax = dx / l, ay = dy / l;
	return {x: hp[0] + (ax * 0.195 + ay * 0.14) * YH, y: hp[1] + (ay * 0.195 - ax * 0.14) * YH, a: Math.atan2(ax, -ay) * 180 / Math.PI}; };
const X0Y = 1030;
const PACK_G: P2 = (() => { const hm = handsMid(YP.bend, X0Y); return [hm[0] + 0.01 * YH, SG - 0.215 * YH]; })();
const PACK_OFF: P2 = (() => { const hm = handsMid(YP.bend, X0Y); return [PACK_G[0] - hm[0], PACK_G[1] - hm[1]]; })();
export const youngAt = (t: number): {x: number; pose: Pose; pack: boolean; packP?: {x: number; y: number; a: number}} => {
	const x0 = X0Y, s = T_SIGN;
	const breath = Math.sin(t * 1.7) * 1.2;
	if (t < s.bend) return {x: x0, pose: nod(YP.look, breath - 2), pack: false, packP: {x: PACK_G[0], y: PACK_G[1], a: 4}};
	if (t < s.on) {
		let pose = mixPose(YP.look, YP.bend, sm(seg(t, s.bend, s.bend + 0.26)));
		const grabbed = t >= s.bend + 0.26;
		pose = mixPose(pose, YP.lift, sm(seg(t, s.lift, s.lift + 0.26)));
		const front = (p: Pose): P2 => { const hm = handsMid(p, x0); return [hm[0] + PACK_OFF[0], hm[1] + PACK_OFF[1]]; };
		if (t < s.swing) return {x: x0, pose, pack: false, packP: grabbed ? {...(() => { const f = front(pose); return {x: f[0], y: f[1]}; })(), a: 4} : {x: PACK_G[0], y: PACK_G[1], a: 4}};
		// the heave: up over his shoulder and onto his back (a quadratic arc above the head)
		const k = sm(seg(t, s.swing, s.on)), poseH = mixPose(pose, YP.heave, k), f0 = front(pose), bp = backPack(PZ.straps, x0);
		const top = jointAt(YP.heave, 'Top', x0, SG, YH), c: P2 = [(f0[0] + bp.x) / 2, top[1] - 0.12 * YH];
		const qx = (1 - k) * (1 - k) * f0[0] + 2 * k * (1 - k) * c[0] + k * k * bp.x, qy = (1 - k) * (1 - k) * f0[1] + 2 * k * (1 - k) * c[1] + k * k * bp.y;
		return {x: x0, pose: poseH, pack: false, packP: {x: qx, y: qy, a: lerp(4, bp.a, k)}};
	}
	// the pack is on: a little shrug settles it, then the first step lands on the beat and he walks north (right)
	if (t < s.step) { const pose = mixPose(YP.heave, PZ.straps, sm(seg(t, s.on, s.on + 0.2))), sh = 0.02 * Math.sin(seg(t, s.on + 0.12, s.on + 0.42) * Math.PI);
		const o: Pose = {}; for (const k2 of Object.keys(pose)) o[k2] = [pose[k2][0], pose[k2][1] + (['LSh', 'RSh', 'LElb', 'RElb', 'LHand', 'RHand'].includes(k2) ? sh : 0)]; return {x: x0, pose: o, pack: true}; }
	const w = walkNat(t, s.step, 99, x0, 1, YH, PZ.straps);
	return {x: w.x, pose: withArms(w.pose, [14 + 5 * Math.sin(w.phase * Math.PI * 2), 124], [10 + 5 * Math.sin(w.phase * Math.PI * 2 + 3), 130]), pack: true};
};
export const SignpostScene: React.FC<{t: number}> = ({t}) => {
	const Y = youngAt(t), cam = signCam(t, Y.x);
	return <g>
		<Sky id="pgs" stops={[[0, '#3c4c5e'], [0.45, '#6e7f8e'], [0.62, '#a9b3b6'], [0.7, '#c8c6ba']]} x={-200} y={-200} w={2400} h={1500} />
		<Par cam={cam} k={0.15}>
			{Array.from({length: 7}, (_, i) => { const x = ((rnd(i, 3) * 3000 + t * (26 + 14 * rnd(i, 4))) % 3000) - 600, y = 120 + rnd(i, 5) * 300;
				return <path key={i} d={`M${x},${y} q120,-26 300,-6 q140,10 260,4 q-160,30 -300,22 q-160,-6 -260,-20 Z`} fill="#e8eaea" opacity={0.18 + 0.15 * rnd(i, 6)} />; })}
			<Glow x={SUN_W[0]} y={SUN_W[1]} r={460} c="#fff0d0" o={0.55} id="psun" /><Glow x={SUN_W[0]} y={SUN_W[1]} r={110} c="#fffaf0" o={0.8} id="psun2" /><circle cx={SUN_W[0]} cy={SUN_W[1]} r={32} fill="#fffdf6" />
		</Par>
		<Par cam={cam} k={0.45}><Strait t={t} y0={560} y1={720} /></Par>
		<Par cam={cam} k={0.6}><Gulls t={t} x={1100 - 0} y={360} n={3} /></Par>
		<Cam {...cam}>
			<path d="M-600,760 Q200,700 800,730 Q1400,760 2200,712 Q2800,690 3600,730 L3600,1400 L-600,1400 Z" fill="#4e4430" />
			<path d="M-600,840 Q400,800 1200,836 Q2200,870 3600,820 L3600,1400 L-600,1400 Z" fill="#3a3222" />
			<Grass x0={-600} x1={3600} y={770} t={t} n={70} seed={1} col="#5a4c30" hi="#c8b07a" s={0.7} />
			<FlagTree x={1720} ground={860} s={1.05} t={t} />
			<path d="M-600,905 L3600,905 L3600,1400 L-600,1400 Z" fill="#2e281c" />
			{/* the gravel track north starts at the post */}
			<path d="M800,898 L3600,896 L3600,918 L790,914 Q770,906 800,898 Z" fill="#5e523c" />
			{Array.from({length: 40}, (_, i) => <circle key={i} cx={820 + rnd(i, 81) * 2700} cy={900 + rnd(i, 82) * 14} r={1.5 + rnd(i, 83) * 1.5} fill="#8a7c5c" opacity={0.6} />)}
			<Signpost x={780} ground={SG} t={t} s={0.92} />
			{!Y.pack && Y.packP && <PackProp x={Y.packP.x} y={Y.packP.y} h={YH} a={Y.packP.a} rims={RIM_SEA} />}
			<Walker x={Y.x} ground={SG} h={YH} pose={Y.pose} look={Y.pack ? LOOK.karlYoung : LOOK.karlYoungNoPack} col="#0c0b0e" rims={RIM_SEA} cart="hivis" dist={(Y.x - X0Y) / YH} />
			<Grass x0={-600} x1={3600} y={1000} t={t} n={46} seed={7} col="#211c12" hi="#a08a5a" s={1.6} />
		</Cam>
	</g>;
};

/* ====================== D. the goal: on the globe, a dashed line from Chile up and over to England (20.45 → 24.0) ====================== */
const GOAL_IN = 20.45, PLAN0 = 21.15, PLAN1 = 23.82;
export const planP = (t: number) => trap(seg(t, PLAN0, PLAN1), 0.14);
/** the goal globe's camera: the dashed plan runs along the route while the Earth spins at a uniform rate from Chile to England;
    in the last beats the camera pushes into the home light (終点), which becomes the headlight of the bus in the next shot */
export const BUS_LIGHT: P2 = [1250, 778];
export const goalView = (t: number, sun: P2): SatView => {
	const u = seg(t, PLAN0 - 0.1, PLAN1 + 0.05);
	const zk = sm(seg(t, GOAL_IN, 21.4)), alt = Math.exp(lerp(Math.log(1.25), Math.log(1.75), zk));
	const lon = lerp(PUNTA[0] + 4, -340, trap(u, 0.18)), lat = lerp(-30, 44, sm(seg(u, 0, 0.88)));
	void sun;   // a straight cross-dissolve from the coast (a slide off the sun measured > 30 px/frame)
	const v: SatView = {lon, lat, alt, tilt: 12, cx: 930, cy: 600};
	/* the push: the camera drops toward Hull while the Earth slides so that Hull lands where the bus headlight will be (its light
	   becomes the headlight); the slide starts as the plan reaches Europe, the zoom keeps Hull fixed on screen */
	const kp = sm(seg(t, D(14) - 1.25, D(14) - 0.05)), kz = seg(t, D(14) - 0.85, D(14) + 0.1);
	if (kz > 0) { v.alt = Math.exp(lerp(Math.log(alt), Math.log(0.45), trap(kz, 0.3))); v.tilt = 12 * (1 - kz); }
	if (kp > 0) { const h = satPt(v, HULL); if (h) { v.cx += (BUS_LIGHT[0] - h[0]) * kp; v.cy += (BUS_LIGHT[1] - h[1]) * kp; } }
	return v;
};
export const GoalGlobe: React.FC<{t: number; sun: P2}> = ({t, sun}) => {
	const p = Math.max(0, Math.min(1, planP(t))), v = goalView(t, sun);
	const startO = sm(seg(t, 20.75, 21.05)), endO = sm(seg(t, PLAN1 - 0.25, PLAN1 + 0.05));
	const flare = sm(seg(t, D(14) - 0.3, D(14) + 0.04));
	return <g>
		<Space id="gg" drift={(t - GOAL_IN) * 5} />
		<Earth id="g2" v={v} plan={{p}} home={endO} clouds={0.7}
			pins={[{ll: PUNTA, label: '起点', o: startO * (1 - flare), kind: 'start'}, {ll: HULL, label: '终点', o: endO * (1 - flare), kind: 'home', dy: -30}]} />
		{p > 0.003 && p < 0.999 && (() => { const q = satPt(v, routeAt(p)); return q ? <g><circle cx={q[0]} cy={q[1]} r={26} fill="#FFC24A" opacity={0.25} /><circle cx={q[0]} cy={q[1]} r={5.5} fill="#F4EAD8" /></g> : null; })()}
		{flare > 0 && <g><Glow x={BUS_LIGHT[0]} y={BUS_LIGHT[1]} r={260 + 900 * flare} c="#ffe2a8" o={0.9 * flare} id="gflare" /></g>}
	</g>;
};

/* ====================== E. the rules: the steppe road, a bus, a pickup, a plane; three red ✕ on beats (24.0 → 27.4) ====================== */
const RH = 330, RG = 950;
const RIM_DAY: Rim[] = [{c: '#f0eadc', o: 0.45, dx: -2.4, dy: -1.6}, {c: '#9aaab8', o: 0.2, dx: 2, dy: -1}];
const X_HITS = [D(15), BT(15, 1), BT(15, 2)];
export const RulesScene: React.FC<{t: number}> = ({t}) => {
	const w = walkNat(t, D(14) - 0.6, 99, 640, 1, RH, PZ.straps), kx = w.x;
	const pose = withArms(w.pose, [14 + 5 * Math.sin(w.phase * Math.PI * 2), 124], [10 + 5 * Math.sin(w.phase * Math.PI * 2 + 3), 130]);
	/* the camera tracks him; each red ✕ kicks it in a little (3 %); in the last half beat it tilts up into the sky (out to the night window) */
	const kick = X_HITS.reduce((a, h) => a + (t >= h ? 0.035 * Math.exp(-(t - h) * 9) : 0), 0), up = sm(seg(t, D(16) - 0.62, D(16) + 0.06));
	const cam: CamT = {cx: kx + 130, cy: 540 - 280 * up, z: 1.0 + kick};
	// bus: drives in on the far lane, stops at the bus stop (door opens), leaves after the ✕
	const busStop = 1394, bArr = seg(t, D(14) - 0.9, D(14) + 0.5), bLeave = seg(t, BT(15, 2.4), BT(15, 2.4) + 1.6);
	const busX = busStop + 1400 * (1 - eo(bArr)) - 900 * ei(bLeave), busDoor = sm(seg(t, D(14) + 0.6, D(14) + 0.85)) * (1 - sm(seg(t, BT(15, 2.1), BT(15, 2.4))));
	// pickup: comes up from behind on the near lane, slows ahead of him (driver waving him in), then drives on
	const pk0 = seg(t, D(14) + 0.5, D(15) + 0.15), pkX = lerp(kx - 1700, kx - 390, eo(pk0)) + 1900 * ei(seg(t, BT(15, 2.2), BT(15, 2.2) + 1.5));
	// plane: climbs across the upper right
	const pl = seg(t, 24.55, 27.6), plX = cam.cx - 960 + lerp(-320, 2250, pl), plY = lerp(500, 250, pl);
	const xk = (i: number) => seg(t, X_HITS[i], X_HITS[i] + 0.3);
	return <g>
		<Sky id="rds" stops={[[0, '#4a5866'], [0.5, '#7c8a92'], [0.7, '#a8aca4']]} x={-200} y={-200} w={2400} h={1500} />
		<Par cam={cam} k={0.08}>{Array.from({length: 6}, (_, i) => <ellipse key={i} cx={(rnd(i, 1) * 2600 + t * 12) % 2600 - 300} cy={140 + rnd(i, 2) * 220} rx={240 + 120 * rnd(i, 3)} ry={40} fill="#d8dcd8" opacity={0.2} />)}</Par>
		<Par cam={cam} k={0.12}><path d="M-800,640 L-500,520 L-380,560 L-160,440 L40,540 L260,470 L520,560 L760,450 L980,530 L1260,420 L1500,540 L1780,470 L2100,560 L2400,480 L2800,580 L2800,700 L-800,700 Z" fill="#5e6a76" />
			<path d="M-160,440 L-100,482 L-200,476 Z M260,470 L310,500 L220,500 Z M760,450 L810,486 L716,484 Z M1260,420 L1320,460 L1210,456 Z M1780,470 L1830,500 L1740,500 Z" fill="#e6eaec" opacity={0.75} /></Par>
		<Par cam={cam} k={0.3}><path d="M-1200,700 Q0,660 1200,690 Q2400,720 4200,680 L4200,900 L-1200,900 Z" fill="#6e6044" />
			{[0, 1].map((i) => <Guanaco key={i} x={900 + i * 140 + (i ? 30 : 0)} ground={724 + i * 6} s={0.5} t={t} head={i} />)}</Par>
		<Cam {...cam}>
			<rect x={-2000} y={740} width={8000} height={600} fill="#5a4e36" />
			<WireFence x0={-1600} x1={5200} y={786} gap={130} />
			<rect x={-2000} y={790} width={8000} height={82} fill="#2c2b2e" /><path d="M-2000,831 H6000" stroke="#d8d0b8" strokeWidth={4} strokeDasharray="60 70" opacity={0.6} />
			<rect x={-2000} y={872} width={8000} height={10} fill="#6a6250" />
			{/* the bus stop: a pole and a plain sign (a bus glyph, no text) */}
			<g transform={`translate(${busStop - 330},${790})`}><rect x={-4} y={-190} width={8} height={190} fill="#1a1a1e" /><rect x={-34} y={-236} width={68} height={52} rx={8} fill="#d8d4c4" /><rect x={-22} y={-226} width={44} height={26} rx={5} fill="#2a3a4a" /><circle cx={-12} cy={-196} r={5} fill="#2a3a4a" /><circle cx={12} cy={-196} r={5} fill="#2a3a4a" /></g>
			<Bus x={busX} ground={832} s={0.85} door={busDoor} t={t} />
			<RedX x={busX + 40} y={832 - 130} s={1.25} k={xk(0)} />
			<Pickup x={pkX} ground={870} s={0.8} t={t} />
			<RedX x={pkX + 20} y={870 - 90} s={1.0} k={xk(1)} />
			<rect x={-2000} y={882} width={8000} height={400} fill="#4a3f2a" />
			<Grass x0={kx - 1400} x1={kx + 1600} y={RG + 4} t={t} n={40} seed={3} col="#2e2618" hi="#b09a68" s={0.9} />
			<Walker x={kx} ground={RG} h={RH} pose={pose} look={LOOK.karlYoung} col="#0c0b0e" rims={RIM_DAY} cart="hivis" dist={(kx - 640) / RH} />
			{/* the headlight that the home light of the goal globe became (fades as the bus settles) */}
			<Glow x={busX - 252} y={778} r={220} c="#ffe2a8" o={0.85 * (1 - sm(seg(t, D(14) + 0.05, D(14) + 0.6)))} id="busl" />
		</Cam>
		<Plane x={plX - (cam.cx - 960)} y={plY} s={0.42} ang={-5} t={t} />
		<RedX x={plX - (cam.cx - 960)} y={plY} s={0.7} k={xk(2)} />
	</g>;
};

/* ====================== F. the promise: his mother's window, Hull, at night (27.4 → 29.1) ====================== */
export const WindowScene: React.FC<{t: number}> = ({t}) => {
	/* a wide night: roofs, stars, one warm window; a slow push toward it */
	const u = seg(t, D(16), D(17)), base = mixCamL({cx: 1480, cy: 240, z: 0.86}, {cx: 1530, cy: 268, z: 0.98}, u);
	/* in: the tilt down out of the sky (the rules shot tilted up into it); out: a push into the lit window, whose light becomes the lamp of the kit */
	const down = 1 - sm(seg(t, D(16) - 0.14, D(16) + 0.5)), push = sm(seg(t, D(17) - 0.62, D(17) + 0.04));
	const pc = mixCamL(base, {cx: 1585, cy: 325, z: 3.6}, push), cam = {...pc, cy: pc.cy - 300 * down};
	const sway = Math.sin(t * 1.3) * 3;
	return <g>
		<Cam {...cam}>
			<StreetBack t={t} mode="night" banner={false} />
			{/* his mother upstairs, behind the curtain, looking down the street */}
			<defs><clipPath id="wwin"><rect x={1480} y={210} width={210} height={230} /></clipPath></defs>
			<g clipPath="url(#wwin)"><rect x={1480} y={210} width={210} height={230} fill="#ffcf8a" opacity={0.25} />
				<Lit x={1610 + sway} ground={566} h={MH} pose={mixPose(PZ.stand, MP.see, 0.3)} look={LOOK.mum} flip col="#2a1a12" rims={[]} />
				<path d="M1488,216 Q1520,325 1492,436 L1480,440 L1480,210 Z M1682,216 Q1650,325 1678,436 L1690,440 L1690,210 Z" fill="#6a3c2a" opacity={0.85} /></g>
			<path d="M1480,325 H1690 M1585,210 V440" stroke="#3c3236" strokeWidth={8} /><rect x={1480} y={210} width={210} height={230} fill="none" stroke="#3c3236" strokeWidth={7} />
			<Door open={0} mode="night" />
			<StreetFront mode="night" />
			<Lamp x={2300} ground={930} h={560} id="lpn" />
		</Cam>
		<rect x={0} y={0} width={W} height={H} fill="#0a0c18" opacity={0.18} />
		{/* the window's light falls out into the night */}
		<Cam {...cam}><Glow x={1585} y={330} r={420} c="#ffcf8a" o={0.22} id="wglow" /></Cam>
		{push > 0.45 && <rect x={0} y={0} width={W} height={H} fill="#ffd9a0" opacity={sm(seg(push, 0.45, 1)) * 0.95} />}
	</g>;
};

/* ====================== G. the kit: a flat-lay; three things pop out of the pack on beats (29.1 → 32.5) ====================== */
const MOUTH: P2 = [760, 630];
const ITEMS: {at: number; to: P2; r: number; s: number; tag: string; C: React.FC<{x: number; y: number; s?: number; r?: number}>}[] = [
	{at: BT(17, 1), to: [1000, 640], r: -8, s: 0.95, tag: '帐篷', C: TentBag},
	{at: BT(17, 2), to: [1330, 680], r: 6, s: 0.9, tag: '几百美元', C: Cash},
	{at: D(18), to: [1630, 640], r: -4, s: 0.85, tag: '塑料相机', C: PlasticCam},
];
export const KitScene: React.FC<{t: number}> = ({t}) => {
	const cam = kitCamAt(t), warm = 1 - sm(seg(t, D(17), D(17) + 0.4)), iris = irisAt(t);
	return <g><Cam {...cam}>
		<Planks id="kp" />
		<PackTop x={540} y={630} s={1.05} r={-6} />
		{ITEMS.map((it, i) => { const a = it.at - 0.14, k = seg(t, a, a + 0.32); if (k <= 0) return null;
			const e = eo(k), x = lerp(MOUTH[0], it.to[0], e), y = lerp(MOUTH[1], it.to[1], e), hgt = Math.sin(Math.PI * Math.min(1, k)) * (1 - k * 0.2);
			const sq = k >= 1 ? 1 + 0.06 * Math.exp(-(t - a - 0.32) * 12) * Math.cos((t - a - 0.32) * 30) : 1 + 0.28 * hgt, rot = lerp(it.r - 40, it.r, e);
			return <g key={i}>
				<ellipse cx={x + 30 * hgt + 10} cy={y + 50 * hgt + 20} rx={150 * it.s} ry={70 * it.s} fill="#000" opacity={0.35 * (1 - 0.5 * hgt)} />
				<it.C x={x} y={y - 60 * hgt} s={it.s * sq} r={rot} />
				<Tag x={it.to[0]} y={it.to[1] + 150} text={it.tag} k={seg(t, a + 0.3, a + 0.62)} />
			</g>; })}
	</Cam>
		{warm > 0.01 && <rect x={0} y={0} width={W} height={H} fill="#ffd9a0" opacity={0.95 * warm} />}
		{iris && <Iris x={iris[0]} y={iris[1]} r={iris[2]} />}
	</g>;
};
/* the iris: the kit shot closes down onto the plastic camera's lens (a black frame with a round hole), and the sunset shot opens from its sun */
const LENS_W: P2 = [1630 + 20 * 0.85, 640 + 10 * 0.85];
/** the kit camera: a slow drift, kicked in a little (4 %) as each item lands */
const kitCamAt = (t: number): CamT => { const u = seg(t, D(17), D(19)), kick = ITEMS.reduce((a, it) => a + (t >= it.at ? 0.04 * Math.exp(-(t - it.at) * 8) : 0), 0); return {cx: lerp(1010, 1060, u), cy: lerp(600, 590, u), z: lerp(1.0, 1.07, u) + kick, r: lerp(-1.5, 1.0, u)}; };
const camPt = (c: CamT, p: P2): P2 => { const a = (c.r ?? 0) * Math.PI / 180, x = (p[0] - c.cx) * c.z, y = (p[1] - c.cy) * c.z; return [960 + x * Math.cos(a) - y * Math.sin(a), 540 + x * Math.sin(a) + y * Math.cos(a)]; };
export const IRIS_T = D(19);
/** [x, y, r] of the iris hole at time t (closing on the lens before IRIS_T, opening from the sun after), null when fully open */
export const irisAt = (t: number): [number, number, number] | null => {
	if (t < IRIS_T - 0.4 || t > IRIS_T + 0.45) return null;
	if (t < IRIS_T) { const k = seg(t, IRIS_T - 0.4, IRIS_T - 1 / 30), p = camPt(kitCamAt(t), LENS_W); return [p[0], p[1], 1500 * Math.pow(1 - ei(k), 1.6)]; }
	const k = seg(t, IRIS_T + 1 / 30, IRIS_T + 0.45), sun = calSun(t); return [sun[0], sun[1], 1900 * Math.pow(eo(k), 1.6)];
};
export const Iris: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => <path fillRule="evenodd" fill="#07060a"
	d={`M-10,-10 H${W + 10} V${H + 10} H-10 Z M${(x - r).toFixed(1)},${y.toFixed(1)} a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(2 * r).toFixed(1)},0 a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(-2 * r).toFixed(1)},0 Z`} />;

/* ====================== H. "he thought ten-odd years": sunset road, a tear-off calendar flips 1998 → 2008 and stops (32.5 → 35.94) ====================== */
const CARD: P2 = [1080, 330];
const TEARS = Array.from({length: 10}, (_, k) => 32.9 + (BT(19, 3.75) - 32.9) * (1 - Math.pow(1 - k / 9, 1.7)));
export const CalendarScene: React.FC<{t: number}> = ({t}) => {
	const w = walkNat(t, D(19) - 0.8, 99, 470, 1, RH, PZ.straps), kx = w.x;
	let pose = withArms(w.pose, [14 + 5 * Math.sin(w.phase * Math.PI * 2), 124], [10 + 5 * Math.sin(w.phase * Math.PI * 2 + 3), 130]);
	const nodK = Math.sin(seg(t, D(20) + 0.08, D(20) + 0.55) * Math.PI);
	pose = nod(pose, 14 * nodK);
	const cam = calCam(t, kx), flare = calFlare(t), iris = irisAt(t);
	const n = TEARS.filter((x) => t >= x).length, year = 1998 + n;
	const stop = seg(t, D(20), D(20) + 0.5), ring = seg(t, D(20) + 0.05, D(20) + 0.5);
	const flying = TEARS.map((x, k) => ({k, u: (t - x) / 0.55})).filter((f) => f.u >= 0 && f.u < 1);
	const RIM_SUN: Rim[] = [{c: '#ffc070', o: 0.8, dx: 2.8, dy: -1.4}, {c: '#ffd8a0', o: 0.25, dx: -1.8, dy: -1.6}];
	return <g>
		<Par cam={cam} k={0.25}><Sky id="ssk" stops={[[0, '#120e24'], [0.3, '#2a2240'], [0.55, '#6a3c58'], [0.72, '#c8665a'], [0.79, '#f0a060'], [0.82, '#ffd090']]} x={-600} y={-1600} w={3200} h={2900} /></Par>
		<Par cam={cam} k={0.04}><Glow x={1500} y={650} r={640} c="#ffc070" o={0.6} id="csun" /><Glow x={1500} y={650} r={200} c="#fff0c8" o={0.7} id="csun2" /><circle cx={1500} cy={650} r={62} fill="#fff4d8" /></Par>
		<Par cam={cam} k={0.12}><path d="M-800,720 L-500,600 L-300,650 L-60,560 L200,640 L460,580 L700,670 L980,600 L1240,690 L1420,676 L1600,700 L1800,680 L2100,630 L2600,700 L2600,800 L-800,800 Z" fill="#4a3048" />
			<path d="M-800,720 L-500,600 L-300,650 L-60,560 L200,640 L460,580 L700,670 L980,600" stroke="#ffb070" strokeWidth={3} opacity={0.35} fill="none" /></Par>
		<Par cam={cam} k={0.3}><path d="M-1200,740 Q0,710 1200,730 Q2400,750 4200,720 L4200,900 L-1200,900 Z" fill="#3a2630" /></Par>
		<Cam {...cam}>
			<rect x={-2000} y={760} width={8000} height={600} fill="#2e2026" />
			<WireFence x0={-1600} x1={5200} y={800} gap={130} col="#160e12" />
			<rect x={-2000} y={804} width={8000} height={78} fill="#1e1820" /><path d="M-2000,843 H6000" stroke="#f0c890" strokeWidth={4} strokeDasharray="60 70" opacity={0.45} />
			<path d="M-2000,806 H6000" stroke="#ffb070" strokeWidth={2} opacity={0.35} />
			<rect x={-2000} y={882} width={8000} height={400} fill="#24181c" />
			<Grass x0={kx - 1400} x1={kx + 1800} y={RG + 4} t={t} n={40} seed={5} col="#1a1014" hi="#ffb070" s={0.9} />
			<Walker x={kx} ground={RG} h={RH} pose={pose} look={LOOK.karlYoung} col="#0e0a0e" rims={RIM_SUN} cart="hivis" dist={(kx - 470) / RH} />
		</Cam>
		{/* the calendar (a widget card, upper right): pages tear off downwind, faster and faster, and stop on 2008 */}
		<g opacity={sm(seg(t, D(19) + 0.05, D(19) + 0.3)) * (1 - sm(seg(t, D(20) + 0.45, D(20) + 0.7)))} transform={`translate(0,${-8 * Math.sin(Math.PI * stop) * (1 - stop)})`}>
			<YearCard x={CARD[0]} y={CARD[1]} year={Math.min(2008, year)} ring={ring} s={0.92} />
			{flying.map((f) => <g key={f.k} transform={`translate(${CARD[0] + 820 * ei(f.u)},${CARD[1] - 120 * f.u + 380 * f.u * f.u}) rotate(${f.u * 80}) scale(${0.92 * (1 - 0.3 * f.u)})`} opacity={1 - sm(seg(f.u, 0.55, 1))}>
				<rect x={-170} y={-10} width={340} height={300} rx={10} fill="#efe4cc" />
				<text x={0} y={160} textAnchor="middle" style={{fontFamily: "'Cormorant59','DejaVu Serif',serif", fontWeight: 700, fontSize: 150}} fill="#2a2018">{1998 + f.k}</text></g>)}
		</g>
		{flare > 0 && (() => { const sp = calSun(t); return <g><Glow x={sp[0]} y={sp[1]} r={300 + 1700 * flare} c="#ffd27a" o={Math.min(1, 1.3 * flare)} id="cflare" />
			<rect x={0} y={0} width={W} height={H} fill="#fff0cc" opacity={sm(seg(flare, 0.45, 1))} /></g>; })()}
		{iris && <Iris x={iris[0]} y={iris[1]} r={iris[2]} />}
	</g>;
};
/** the sunset camera: tracks him; from bar 20 beat 2 it tilts up into the sky while the sun flares (the pull-out to orbit) */
export const CAL_OUT = D(20) + 0.5;
const calCam = (t: number, kx: number): CamT => ({cx: kx + 300, cy: 540 - 520 * ei(seg(t, CAL_OUT, CAL_OUT + 0.55)), z: 1.0});
const calKx = (t: number) => walkNat(t, D(19) - 0.8, 99, 470, 1, RH, PZ.straps).x;
/** the sun on screen (its plane has parallax k = 0.04) */
export const calSun = (t: number): P2 => { const c = calCam(t, calKx(t)), k = 0.04; return [1500 - (960 + (c.cx - 960) * k) + 960, 650 - (540 + (c.cy - 540) * k) + 540]; };
/** the flare that carries the cut to the chase over the Earth (0 → 1 → the Earth fades in under it) */
export const calFlare = (t: number) => sm(seg(t, CAL_OUT + 0.05, CAL_OUT + 0.45));
void H; void Haze; void land; void eio; void walkPose; void routeAt; void ROUTE; void projOf; void Lamp; void ParkedCar; void HULL;
export type {Look59};
