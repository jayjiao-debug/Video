/* ep61 v2 · block N1 (lines 9–16, 28.2 s): Shu's children Geb (earth) and Nut (sky); Nut's body becomes the whole sky; siblings and
   spouses, they cling together (the sky lies on the earth, a bud is squashed: no room); Shu, the air, squeezes in and holds her up; since
   then there is air between sky and earth. Nut is the cast61 woman (star dress) grown into the Greenfield-papyrus pose: bent over the
   earth, hands and feet on the ground (NUT_ARCH), or crouched over Geb (NUT_LOW). Her body follows Shu's hands (underside = his hands).
   t = seconds from the block start; the set-ups cut on the lines (and once inside line 13). */
import React from 'react';
import {POSES, lerpPose, Pose} from '../qq60/rig60';
import {God61, P61, headPt} from './cast61';
import {GY} from './shots61';
import {SetDefs61} from './sets61_kit';
import {BirdsCrossing, PapyrusThicket} from './sets61_nature';
import {Night, Stars, Earth, Air, MysticDefs, cl, sm, lerp, back, u_, handY, BIG, NUT_LOW, NUT_ARCH} from './mystic61';

export const N1_LINES = [0, 2.81, 7.28, 11.04, 14.57, 18.09, 22.09, 24.67, 28.19];   // line starts inside the block (9..16) + end
const W = 1440, CY = 486, NX = 500, NS = 62, SX = 700, SS = 22, GX = 560;
const CROUCH: Pose = {lean: 4, neck: -2, head: -8, bs: 168, be: 46, bw: -8, fs: 172, fe: 44, fw: -8, rt: 22, rk: 46, at: 34, ak: 52};
const DIP: Pose = {lean: 7, neck: -2, head: -4, bs: 166, be: 74, bw: -8, fs: 170, fe: 72, fw: -8, rt: 30, rk: 66, at: 44, ak: 72};
/** Nut's body between crouched (0) and arched (1); underside height ≈ lerp(0.83, 8.1, k) × s (measured on the rig) */
const nutPose = (k: number) => lerpPose(NUT_LOW, NUT_ARCH, cl(k));
const kFor = (hy: number) => cl((GY - hy - 0.83 * NS) / (7.27 * NS));
/** Geb lying face up, head to the right (under Nut's head) */
const Geb: React.FC<{x: number; s: number; id: string; T: number; y?: number}> = ({x, s, id, T, y = GY - 2}) => <g transform={`rotate(90 ${x} ${y})`}>
	<God61 id={id} who="geb" pose={{...POSES.rest, fs: -14, fe: 4, bs: -2, be: 6, rt: -3, at: 3, rk: 2, ak: 2, head: -6 + 0.6 * Math.sin(T), neck: -2, lean: 0}} x={x} y={y} s={s} face={-1} bProp="none" fProp="none" t={T} /></g>;
const Sprouts: React.FC<{xs: number[]; y: number; t: number; T: number; s?: number; d?: number}> = ({xs, y, t, T, s = 8, d = 0.16}) => <>{xs.map((x, i) => {
	const g = back(cl((t - i * d) / 0.7), 1.4); return <g key={i} transform={`translate(${x},${y}) scale(1,${Math.max(0.01, g)}) translate(${-x},${-y})`}><PapyrusThicket x={x} y={y} s={s} t={T} w={8} h={12} n={6} seed={i + 2} /></g>; })}</>;
const Cam: React.FC<{cx: number; cy: number; z: number; children: React.ReactNode}> = ({cx, cy, z, children}) => <g transform={`translate(${W / 2},${CY}) scale(${z}) translate(${-cx},${-cy})`}>{children}</g>;

export const N1Block: React.FC<{t: number}> = ({t}) => {
	const T = t + 28, [, a10, a11, a12, a13, a14, a15, a16] = N1_LINES;
	let body: React.ReactNode;
	if (t < a10) {   /* line 9 · Shu and Tefnut; two lights rise between them (their children) */
		const k = u_(t, 0.3, 1.6);
		body = <Cam cx={720} cy={520} z={1.06 + 0.04 * sm(t / 2.8)}><Night T={T} /><Stars seed={21} n={90} T={T} /><Earth y={870} />
			<God61 id="n1s" who="shu" pose={P61.rest(T)} x={430} y={GY} s={26} t={T} /><God61 id="n1t" who="tefnut" pose={P61.rest(T)} x={1010} y={GY} s={26} face={-1} t={T} />
			{[[-1, '#9FE0B4'], [1, '#9FB8FF']].map(([d, c], i) => <g key={i}><circle cx={720 + (d as number) * 70 * k} cy={lerp(760, 470, k) - 20 * Math.sin(T * 2 + i)} r={44} fill={c as string} opacity={0.35 * k} filter="url(#my14)" />
				<circle cx={720 + (d as number) * 70 * k} cy={lerp(760, 470, k) - 20 * Math.sin(T * 2 + i)} r={16} fill="#FFFFFF" opacity={0.9 * k} /></g>)}</Cam>;
	} else if (t < a10 + 2.2) {   /* line 10a · Geb = earth: he lies down, the ground lights green, papyrus sprouts along him */
		const u = t - a10;
		body = <Cam cx={760} cy={700} z={1.5 - 0.06 * sm(u / 2.2)}><Night T={T} /><Stars seed={3} n={70} T={T} /><Earth y={870} />
			<ellipse cx={760} cy={860} rx={460} ry={60} fill="#4FE08A" opacity={0.25 * u_(u, 0.2, 0.8)} filter="url(#my50)" />
			<g opacity={u_(u, 0, 0.3)}><Geb x={GX} s={SS} id="n1g" T={T} /></g><Sprouts xs={[600, 680, 780, 860, 940]} y={872} t={u - 0.5} T={T} s={6} /></Cam>;
	} else if (t < a11) {   /* line 10b · Nut = sky: a woman in a star dress; stars flow over her and up into the night */
		const u = t - a10 - 2.2, k = u_(u, 0.1, 1.4), R = (() => { let s = 19 * 9973 + 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
		body = <Cam cx={720} cy={540} z={1.12 + 0.05 * sm(u / 2.3)}><Night T={T} /><Stars seed={5} n={50 + Math.round(90 * k)} T={T} /><Earth y={870} />
			<circle cx={720} cy={430} r={300} fill="#6A7CFF" opacity={0.2 * k} filter="url(#my50)" />
			<God61 id="n1n" who="nut" pose={lerpPose(P61.rest(T), P61.wide(), u_(u, 0.2, 1.0))} x={720} y={GY} s={28} t={T} />
			{Array.from({length: 40}, (_, i) => { const sx = 700 + (R() - 0.5) * 60, sy = 640 - R() * 160, ex = R() * W, ey = R() * 520 + 40, e = sm(k * 1.3 - R() * 0.3);
				return <circle key={i} cx={lerp(sx, ex, e)} cy={lerp(sy, ey, e)} r={2 + R() * 2.5} fill="#FFE6A8" opacity={e > 0 ? 0.85 : 0} />; })}</Cam>;
	} else if (t < a12) {   /* line 11 · her body becomes the whole sky: she grows and bends over the earth, hands and feet on the ground */
		const u = sm((t - a11) / 3.2), s = lerp(28, NS, u), x = lerp(720, NX, u);
		body = <Cam cx={720} cy={CY} z={1.0}><Night T={T} /><Stars seed={7} n={80 + Math.round(100 * u)} T={T} /><Earth y={870} />
			<ellipse cx={720} cy={420} rx={560} ry={300} fill="#9FB8FF" opacity={0.16 * u} filter="url(#my50)" />
			<God61 id="n1n2" who="nut" pose={lerpPose(P61.wide(), NUT_ARCH, u)} x={x} y={GY} s={s} t={T} />
			<g opacity={u_(t - a11, 2.2, 1.0)}><Geb x={GX} s={SS} id="n1g2" T={T} y={GY + 12} /></g></Cam>;
	} else if (t < a13) {   /* line 12 · siblings and spouses: she lowers her face to his (close-up, warm light) */
		const u = t - a12, k = 1 - sm(u / 2.6), pose = nutPose(lerp(1, 0.08, 1 - k)), hp = headPt('nut', pose, NX, GY, NS, 1, [0.2, -1.3]);
		const z = lerp(1.15, 1.55, sm(u / 3.0)), cx = lerp(720, hp[0] - 80, sm(u / 3.0)), cy = lerp(CY, GY - 150, sm(u / 3.0));
		body = <Cam cx={cx} cy={cy} z={z}><Night T={T} /><Stars seed={9} n={80} T={T} o={0.7} /><Earth y={870} />
			<Geb x={GX} s={SS} id="n1g3" T={T} />
			<God61 id="n1n3" who="nut" pose={pose} x={NX} y={GY} s={NS} t={T} />
			<ellipse cx={hp[0]} cy={(hp[1] + GY) / 2 + 20} rx={150} ry={90} fill="#FFC870" opacity={0.35 * sm(u / 2) * (0.85 + 0.15 * Math.sin(T * 2.4))} filter="url(#my50)" /></Cam>;
	} else if (t < a14) {   /* line 13 · the sky lies on the earth; a bud pops up and is squashed (no room) */
		const u = t - a13, close = u > 1.6, bud = cl((u - 1.7) / 0.45), sq = u_(u, 2.3, 0.16), wob = sq > 0 ? Math.sin((u - 2.3) * 30) * Math.exp(-(u - 2.3) * 5) : 0;
		const bx = 470, by = GY + 2, bh = lerp(0, 50, back(bud, 1.2)) * lerp(1, 0.32, sq) * (1 + 0.15 * wob);
		body = <Cam cx={close ? 520 : 720} cy={close ? 770 : CY} z={close ? 1.9 : 1.04}><Night T={T} /><Stars seed={9} n={60} T={T} o={0.4} /><Earth y={870} />
			<Geb x={GX} s={SS} id="n1g4" T={T} />
			<God61 id="n1n4" who="nut" pose={nutPose(0.02)} x={NX} y={GY} s={NS} t={T} />
			{close && <g><path d={`M${bx} ${by}Q${bx - 4} ${by - bh * 0.6} ${bx + 2} ${by - bh}`} stroke="#4FA06A" strokeWidth={5} fill="none" /><path d={`M${bx - 6} ${by - 6}q-16 -6 -18 -16q14 1 20 11Z`} fill="#4FA06A" />
				<ellipse cx={bx + 2} cy={by - bh} rx={11 + 8 * sq} ry={15 * lerp(1, 0.42, sq)} fill="#F4B6C8" stroke="#05081A" strokeWidth={2.5} /></g>}
			<rect x={BIG[0]} y={BIG[1]} width={BIG[2]} height={BIG[3]} fill="#02030C" opacity={0.3} /></Cam>;
	} else if (t < a15) {   /* line 14 · a gust swirls in under her and condenses into Shu (the air), crouched, palms up; she lifts onto his hands */
		const u = t - a14, swirl = u_(u, 0, 1.2), form = u_(u, 0.9, 0.9), hy = handY('shu', CROUCH, SS), k = lerp(0.02, kFor(hy), u_(u, 0.7, 1.0));
		body = <Cam cx={720} cy={CY + 30} z={1.06}><Night T={T} /><Stars seed={11} n={70} T={T} o={0.5} /><Earth y={870} />
			<God61 id="n1n5" who="nut" pose={nutPose(k)} x={NX} y={GY} s={NS} t={T} />
			<g opacity={1 - 0.6 * form}>{Array.from({length: 26}, (_, i) => { const a = T * 5 + i * 0.7, r = lerp(260, 40, swirl) * (0.4 + (i % 5) * 0.15), cx = lerp(200, SX, swirl), cy = 760;
				return <path key={i} d={`M${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r * 0.45}A${r} ${r * 0.45} 0 0 1 ${cx + Math.cos(a + 0.9) * r} ${cy + Math.sin(a + 0.9) * r * 0.45}`} stroke="#DDF2FF" strokeWidth={3} fill="none" opacity={0.75} />; })}</g>
			<g opacity={form}><God61 id="n1s2" who="shu" pose={CROUCH} x={SX} y={GY} s={SS} bProp="none" fProp="none" t={T} /></g>
			<circle cx={SX} cy={720} r={160} fill="#DDF2FF" opacity={0.5 * form * (1 - form)} filter="url(#my14)" />
			<Geb x={GX - 380} s={SS} id="n1g5" T={T} y={GY + 14} /></Cam>;
	} else if (t < a16) {   /* line 15 · the push: wind-up dip, then up; her body rises on his hands into the arch; a ring of wind */
		const u = t - a15, dip = u_(u, 0, 0.25), go = cl((u - 0.3) / 0.7), kk = back(go, 1.4);
		const pose = go > 0 ? lerpPose(DIP, P61.lift(T), Math.min(1.06, kk)) : lerpPose(CROUCH, DIP, dip), hy = handY('shu', pose, SS), boom = cl((u - 0.35) / 1.0), z = lerp(1.22, 1.0, sm((u - 0.3) / 1.6));
		body = <Cam cx={720} cy={CY + 60} z={z}><Night T={T} /><Stars seed={13} n={90} T={T} /><Earth y={870} />
			<God61 id="n1n6" who="nut" pose={nutPose(kFor(hy))} x={NX} y={GY} s={NS} t={T} />
			{go > 0 && <g fill="none"><ellipse cx={SX} cy={GY + 2} rx={50 + 760 * boom} ry={12 + 60 * boom} stroke="#FFFFFF" strokeWidth={9 * (1 - boom)} opacity={1 - boom} />
				<ellipse cx={SX} cy={hy} rx={40 + 500 * boom} ry={18 + 120 * boom} stroke="#BFE6FF" strokeWidth={6 * (1 - boom)} opacity={0.9 * (1 - boom)} />
				<Air T={T} y0={hy + 60} y1={GY - 30} o={0.8 * boom} n={7} /></g>}
			<God61 id="n1s3" who="shu" pose={pose} x={SX} y={GY} s={SS} bProp="none" fProp="none" t={T} />
			<Geb x={GX - 380} s={SS} id="n1g6" T={T} y={GY + 14} /></Cam>;
	} else {   /* line 16 · since then: air flows between sky and earth, plants grow, birds cross, dawn; pull back */
		const u = t - a16, dawn = u_(u, 0.2, 2.0), z = lerp(1.02, 0.92, sm(u / 3.5));
		body = <Cam cx={720} cy={CY + 40} z={z}><SetDefs61 /><Night T={T} dawn={dawn} /><Stars seed={15} n={70} T={T} box={[-400, -300, W + 400, 280]} />
			<ellipse cx={720} cy={860} rx={320 + 160 * dawn} ry={70 + 30 * dawn} fill="#FFD890" opacity={0.6 * dawn} filter="url(#my14)" />
			<God61 id="n1n7" who="nut" pose={NUT_ARCH} x={NX} y={GY} s={NS} t={T} />
			<Air T={T} y0={GY - 470} y1={GY - 40} o={0.85} n={10} />
			<g opacity={0.9}><BirdsCrossing x={0} y={420} s={13} t={T + 4} n={6} w={1440} period={8} color="#1A1430" /></g>
			<God61 id="n1s4" who="shu" pose={P61.lift(T)} x={SX} y={GY} s={SS} bProp="none" fProp="none" t={T} />
			<Sprouts xs={[120, 260, 420, 980, 1120, 1260]} y={874} t={u - 0.2} T={T} />
			<Geb x={GX - 380} s={SS} id="n1g7" T={T} y={GY + 14} /></Cam>;
	}
	return <g><MysticDefs /><SetDefs61 />{body}</g>;
};
