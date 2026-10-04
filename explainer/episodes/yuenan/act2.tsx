import React from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {POSES, lerpPose, walkPose} from '../../src/art/Figure';
import {Impact} from '../../src/art/fx';
import {EndCard} from '../../src/brand/Brand';
import {ease, mix, prog, useCue, useScene} from '../../src/lib/context';
import {font} from '../../src/lib/theme';
import type {SceneProps} from '../../src/lib/types';
import {Tag} from '../xuming/look3';
import {Glow, Thin} from '../xuming/kit3';
import {BASE, Bar, MSGS, OFF, PHONE, REPLY_Y} from './act1';
import {Bedroom, Bubble, Bulb, ChatHead, Clock, Dust, FlatPack, H, HUE, Person, Phone, Pool, SHE, SIT_PHONE, TimeChip, W} from './kit';
import {Canvas, EPISODE, View, arrive, cam, camPath, landed, shake, through} from './stage';

const L = {x: 640, y: 460};
const R = {x: 1280, y: 460};
const CORD = {x: R.x + 80, y: 338};

const BulbLabel: React.FC<{x: number; text: string; o: number; gold?: boolean; dim?: boolean}> = ({x, text, o, gold, dim}) => (
	<text x={x} y={R.y + 180} textAnchor="middle" opacity={o} style={{fontFamily: font.serif, fontWeight: 600, fontSize: 46, fill: gold ? HUE.gold : dim ? '#8a84a8' : HUE.cream}} filter={gold ? 'url(#g-sm)' : undefined}>
		{text}
	</text>
);

/** a pull cord hanging from the bulb's socket; `cut` drops its lower half */
const Cord: React.FC<{x: number; y: number; cut?: number; pull?: number}> = ({x, y, cut = 0, pull = 0}) => (
	<g>
		<line x1={x} y1={y - 200} x2={x} y2={y - 40 + 30 * pull} stroke="#c9a070" strokeWidth={2.5} />
		<g transform={`translate(0,${260 * cut * cut + 30 * pull}) rotate(${40 * cut},${x},${y - 40})`} opacity={1 - cut}>
			<line x1={x} y1={y - 40} x2={x} y2={y} stroke="#c9a070" strokeWidth={2.5} />
			<circle cx={x} cy={y + 8} r={9} fill="#c9a070" />
		</g>
	</g>
);

/** a reaching arm in silhouette (tapered forearm, a hand closing on the target), rim-lit by the bulbs */
const Arm: React.FC<{from: [number, number]; to: [number, number]; k: number; grip: number}> = ({from, to, k, grip}) => {
	const hx = mix(from[0], to[0], k);
	const hy = mix(from[1], to[1], k);
	const ang = Math.atan2(hy - from[1], hx - from[0]);
	const nx = -Math.sin(ang);
	const ny = Math.cos(ang);
	const w0 = 46;
	const w1 = 24;
	const d = `M${from[0] + nx * w0},${from[1] + ny * w0} L${hx + nx * w1},${hy + ny * w1} L${hx - nx * w1},${hy - ny * w1} L${from[0] - nx * w0},${from[1] - ny * w0} Z`;
	const deg = (ang * 180) / Math.PI;
	return (
		<g>
			<path d={d} fill="#0b0812" />
			<line x1={from[0] - nx * w0} y1={from[1] - ny * w0} x2={hx - nx * w1} y2={hy - ny * w1} stroke={HUE.violet} strokeWidth={2} opacity={0.5} />
			<g transform={`translate(${hx},${hy}) rotate(${deg})`}>
				<ellipse cx={18} cy={0} rx={30} ry={24} fill="#0b0812" />
				{/* fingers curling around the cord */}
				{[-14, -2, 10].map((fy, i) => (
					<rect key={i} x={30} y={fy - 5} width={mix(30, 14, grip)} height={10} rx={5} fill="#0b0812" />
				))}
				<rect x={10} y={-30} width={mix(26, 16, grip)} height={11} rx={5} fill="#0b0812" transform={`rotate(${mix(-30, -5, grip)},10,-24)`} />
			</g>
		</g>
	);
};

// ---------------------------------------------------------------- 5. mechanism (the build): two thoughts that can't both stay lit

const Mechanism: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const a = arrive(f, 0, 20);
	const c = camPath(f, [
		[0, cam(L.x, L.y, 2.3)],
		[cue(1) - 14, cam(960, 470, 1.0)],
		[cue(2) - 6, cam(980, 460, 1.04)],
		[cue(2) + 30, cam(760, 400, 1.32)],
		[cue(3) - 10, cam(1100, 420, 1.2)],
		[end, cam(CORD.x - 40, CORD.y + 30, 2.0)],
	]);
	// the two thoughts fight for the same wire: as one brightens the other dims
	const fight = prog(f, cue(1) - 6, 12) * (1 - prog(f, cue(2) + 10, 6));
	const k = 0.5 + 0.5 * Math.sin(f / 4.2) * Math.sin(f / 9.7);
	const cut = prog(f, cue(2) + 10, 18, ease.in);
	const left = fight > 0 ? mix(1, 0.45 + 0.55 * k, fight) : 1;
	const right = mix(prog(f, cue(1) - 6, 10) * mix(1, 0.45 + 0.55 * (1 - k), fight), 0.35, prog(f, cue(2) + 10, 20));
	const reach = prog(f, cue(3) + 10, end - cue(3) - 24, ease.inOut);
	const tension = 0.55 * prog(f, cue(3), end - cue(3), ease.in);
	return (
		<Canvas flash={a.flash} flashColor={HUE.gold} tension={tension}>
			<View c={{...c, z: c.z * a.z}}>
				<rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#07050f" />
				<Pool x={960} y={420} r={900} c={HUE.violet} o={0.5} id="mc" />
				<Pool x={L.x} y={L.y} r={500} c={HUE.lamp} o={0.5 * left} id="mcl" />
				<Bulb x={L.x} y={L.y} on={left} s={1.5} />
				<Bulb x={R.x} y={R.y} on={right} c={HUE.violet} s={1.5} />
				<Cord x={L.x + 80} y={CORD.y} cut={cut} />
				<Cord x={CORD.x} y={CORD.y} />
				{cut > 0 && cut < 1 ? <Impact f={f} t={cue(2) + 10} x={L.x + 80} y={CORD.y - 40} size={0.12} color="#ffcf80" seed="snip" /> : null}
				<BulbLabel x={L.x} text="我为它付出了这么多" o={landed(f, cue(1) - 4, cue(3) - 4)} />
				<BulbLabel x={R.x} text="它根本不值得" o={landed(f, cue(1) + 14, cue(3) - 4)} dim />
				<Dust seed="mc" f={f} n={50} c="#e6dcff" />
				{reach > 0 ? <Arm from={[1950, 1100]} to={[CORD.x - 30, CORD.y + 10]} k={reach} grip={prog(f, end - 30, 16)} /> : null}
			</View>
		</Canvas>
	);
};

// ---------------------------------------------------------------- 6. reveal (the drop): it must be interesting; the lamp in her hand; effort justification; 1966

const Dial: React.FC<{f: number; k: number}> = ({f, k}) => {
	const a = (-210 + 240 * k) * (Math.PI / 180);
	return (
		<g transform="translate(720,520)">
			<circle r={170} fill="#1a1410" stroke="#c9a070" strokeWidth={2} />
			{Array.from({length: 11}, (_, i) => {
				const t = (-210 + i * 24) * (Math.PI / 180);
				return <line key={i} x1={150 * Math.cos(t)} y1={150 * Math.sin(t)} x2={130 * Math.cos(t)} y2={130 * Math.sin(t)} stroke={i > 7 ? '#e5484d' : '#c9a070'} strokeWidth={2} />;
			})}
			<line x1={0} y1={0} x2={120 * Math.cos(a)} y2={120 * Math.sin(a)} stroke="#e5484d" strokeWidth={4} />
			<circle r={14} fill="#c9a070" />
			<text x={0} y={90} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 26, letterSpacing: '0.3em', fill: '#c9a070'}}>
				VOLTS
			</text>
		</g>
	);
};

const Spark: React.FC<{f: number; on: number; seed: string}> = ({f, on, seed}) => {
	if (on <= 0) return null;
	const pts = Array.from({length: 9}, (_, i) => `${940 + i * 26},${520 + (i % 2 ? -1 : 1) * (14 + 18 * Math.abs(Math.sin(f * 1.7 + i * 2.1 + seed.length)))}`);
	return <polyline points={pts.join(' ')} fill="none" stroke="#bfe0ff" strokeWidth={3} filter="url(#g-sm)" opacity={on} />;
};

const Reveal: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const R2 = cue(1) - 16;
	const R3 = cue(2) - 8;
	const R4 = cue(3) - 8;
	// R1: the pull. The right bulb blazes gold on the drop.
	const blaze = prog(f, 0, 6, ease.out);
	const rewrite = prog(f, cue(0) - 4, 14);
	const c1 = camPath(f, [
		[0, cam(CORD.x - 40, CORD.y + 30, 1.8)],
		[2, cam(CORD.x - 40, CORD.y + 30, 1.8)],
		[16, cam(960, 470, 1.0)],
		[R2 - 18, cam(1100, 470, 1.12)],
	], ease.out);
	const into = through(f, R2 - 16, 16);
	// R2: the bulb becomes the lamp in her hand; the door is gold only where her lamp reaches
	const lamp = {x: 880, y: 600};
	const a2 = arrive(f, R2, 14);
	const c2 = camPath(f, [
		[R2, cam(lamp.x, lamp.y, 3.6)],
		[R2 + 50, cam(1040, 540, 1.1)],
		[R3, cam(1120, 520, 1.2)],
	]);
	const lower = prog(f, cue(1) + 80, 40, ease.inOut);
	// R3: the name
	const a3 = arrive(f, R3, 14);
	// R4: 1966, shocks
	const a4 = arrive(f, R4, 12);
	const knob = prog(f, R4 + 18, 20, ease.inOut);
	const zap = f >= R4 + 38 ? Math.exp(-(f - R4 - 38) / 10) : 0;
	const c4 = camPath(f, [
		[R4, cam(820, 520, 1.25)],
		[R4 + 40, cam(900, 520, 1.15)],
		[end, cam(1250, 600, 1.2)],
	]);
	const bars = prog(f, cue(3) + 50, 30, ease.out);
	return (
		<Canvas flash={f < 8 ? 0.9 * (1 - f / 8) : f < R2 ? 0.85 * prog(f, R2 - 10, 10, ease.in) : f >= R4 ? a4.flash * 0.5 + 0.35 * zap : f >= R3 ? a3.flash * 0.5 : f >= R2 ? a2.flash * 0.6 : 0} flashColor={f >= R4 ? '#cfe6ff' : HUE.gold}>
			{f < R2 ? (
				<g opacity={into.o}>
					<View c={{...c1, z: c1.z * into.z, x: mix(c1.x, R.x, prog(f, R2 - 16, 16, ease.in)), y: mix(c1.y, R.y, prog(f, R2 - 16, 16, ease.in))}} sh={shake(f, 0, 18)}>
						<rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#0a0704" />
						<Pool x={960} y={440} r={900} c={HUE.gold} o={0.9 * blaze} id="rv" />
						<Bulb x={L.x} y={L.y} on={1} c={HUE.gold} s={1.5} />
						<Bulb x={R.x} y={R.y} on={mix(0.35, 1, blaze)} c={HUE.gold} s={1.5} />
						<Cord x={CORD.x} y={CORD.y} pull={1 - prog(f, 4, 10)} />
						<Impact f={f} t={0} x={R.x} y={R.y} size={0.9} color="#ffe2a0" seed="drop" />
						<BulbLabel x={L.x} text="我为它付出了这么多" o={1} gold />
						<BulbLabel x={R.x} text="它根本不值得" o={1 - rewrite} dim />
						<BulbLabel x={R.x} text="它一定很有意思" o={rewrite} gold />
						<Dust seed="rv" f={f} n={60} c="#ffd98f" />
					</View>
				</g>
			) : null}
			{f >= R2 && f < R3 ? (
				<View c={{...c2, z: c2.z * a2.z}}>
					<rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#060509" />
					<rect x={1080} y={180} width={360} height={700} fill="#17131a" stroke="#2a2430" strokeWidth={3} />
					<circle cx={1400} cy={540} r={10} fill="#3a3040" />
					<rect x={1080} y={180} width={360} height={700} fill={HUE.gold} opacity={0.32 * (1 - lower)} filter="url(#g-sm)" />
					<rect x={1080} y={180} width={360} height={700} fill="none" stroke={HUE.gold} strokeWidth={2} opacity={0.7 * (1 - lower)} />
					<Pool x={mix(1200, 1060, lower)} y={mix(500, 760, lower)} r={420} c={HUE.gold} o={mix(0.95, 0.35, lower)} id="rv2" />
					<Person look={SHE} x={700} y={900} s={1.35} pose={{...POSES.hold, head: -8}} rim="warm" sil="#0c0a10" reach={{near: [mix(120, 90, lower), mix(-230, -150, lower)]}} />
					<g transform={`translate(${mix(lamp.x - 8, lamp.x - 48, lower)},${mix(lamp.y - 15, lamp.y + 95, lower)})`}>
						<path d="M-16,0 L16,0 L22,44 L-22,44 Z" fill="#3a2c20" stroke="#c9a070" strokeWidth={1.5} />
						<Glow x={0} y={24} r={60} />
						<path d={`M0,24 L420,${-120 + 260 * lower} L420,${330 + 120 * lower} Z`} fill={HUE.gold} opacity={0.07} filter="url(#b8)" />
					</g>
					<Dust seed="rv2" f={f} n={40} c="#ffd98f" x0={800} x1={1500} />
				</View>
			) : null}
			{f >= R3 && f < R4 ? (
				<View c={{x: 960, y: 520, z: (1 + 0.06 * prog(f, R3, R4 - R3, ease.inOut)) * a3.z}}>
					<rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#060509" />
					<Pool x={960} y={500} r={700} c={HUE.gold} o={0.5} id="rv3" />
					<Dust seed="rv3" f={f} n={50} c="#ffd98f" />
					<g opacity={landed(f, cue(2) - 2)}>
						<Thin text="努力合理化" y={520} size={130} fill="url(#gold-text)" w={900} ls="0.12em" />
					</g>
					<text x={960} y={610} textAnchor="middle" opacity={landed(f, cue(2) + 10)} style={{fontFamily: font.latin, fontSize: 34, letterSpacing: '0.5em', fill: '#e0b46e'}}>
						EFFORT JUSTIFICATION
					</text>
				</View>
			) : null}
			{f >= R4 ? (
				<g>
					<View c={{...c4, z: c4.z * a4.z}} sh={shake(f, R4 + 38, 9)}>
						<rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#07060a" />
						<Pool x={1180} y={420} r={820} c={HUE.lamp} o={0.8} id="rv4" />
						<Dial f={f} k={knob} />
						<Spark f={f} on={zap > 0.05 ? Math.min(1, zap * 1.5) : 0} seed="zap" />
						<Bar x={1300} h={140 * bars} label="弱电击" o={landed(f, cue(3) + 46)} />
						<Bar x={1520} h={260 * bars} label="强电击" gold o={landed(f, cue(3) + 46)} />
					</View>
					<g opacity={landed(f, R4 + 10)}>
						<Tag en="1966 · Gerard & Mathewson" zh="1966 · 重复实验" />
					</g>
				</g>
			) : null}
		</Canvas>
	);
};

// ---------------------------------------------------------------- 7. second layer: the IKEA effect; uncertainty

const Profile: React.FC<{x: number; label: string; o: number; lit: number; f: number}> = ({x, label, o, lit, f}) => (
	<g opacity={o}>
		<rect x={x - 150} y={300} width={300} height={360} rx={18} fill="#14152a" stroke={lit > 0.5 ? HUE.phone : '#4a4f80'} strokeWidth={1.5 + lit} />
		{lit > 0 ? <rect x={x - 170} y={280} width={340} height={400} rx={26} fill={HUE.phone} opacity={0.12 * lit} filter="url(#b8)" /> : null}
		<circle cx={x} cy={410} r={60} fill="#22243e" />
		<path d={`M${x - 90},560 C${x - 60},490 ${x + 60},490 ${x + 90},560`} fill="#22243e" />
		<text x={x} y={720} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 34, fill: HUE.cream}}>
			{label}
		</text>
		{/* thoughts circling the one you can't read */}
		{lit > 0
			? Array.from({length: 7}, (_, i) => {
					const t = f / 26 + (i / 7) * Math.PI * 2;
					return <circle key={i} cx={x + 200 * Math.cos(t)} cy={480 + 240 * Math.sin(t)} r={4} fill={HUE.phoneWarm} opacity={0.7 * lit} filter="url(#g-sm)" />;
			  })
			: null}
	</g>
);

const Layer: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const L2 = cue(2) - 10;
	const a = arrive(f, 0, 14);
	const build = prog(f, cue(0), cue(1) - cue(0) - 20, ease.inOut);
	const c1 = camPath(f, [
		[0, cam(1220, 560, 1.5)],
		[cue(0) + 60, cam(1100, 540, 1.3)],
		[cue(1) - 20, cam(990, 520, 1.02)],
		[L2, cam(990, 500, 1.06)],
	]);
	const whip = prog(f, L2 - 6, 14, ease.inOut);
	const c2 = camPath(f, [
		[L2, cam(960, 500, 1.0)],
		[cue(3) - 10, cam(1100, 490, 1.08)],
		[end - 18, cam(1380, 470, 1.5)],
		[end, cam(1380, 420, 3.5)],
	]);
	const card = (i: number) => prog(f, L2 + 6 + i * 8, 16, ease.out);
	const lit = prog(f, cue(2) + 40, 30);
	const out = prog(f, end - 14, 14, ease.in);
	return (
		<Canvas flash={a.flash * 0.5 + 0.8 * out * out} flashColor={f > L2 ? HUE.phone : HUE.gold}>
			{f < L2 + 8 ? (
				<g transform={`translate(0,${900 * whip})`} filter={whip > 0.05 ? 'url(#whip)' : undefined} opacity={1 - whip}>
					<View c={{...c1, z: c1.z * a.z}}>
						<rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#07060a" />
						<Pool x={1220} y={520} r={700} c={HUE.gold} o={0.5} id="ly" />
						<FlatPack x={760} y={560} s={1.5} k={1} c="#8a8478" />
						<FlatPack x={1220} y={560} s={1.5} k={build} />
						<text x={760} y={800} textAnchor="middle" opacity={landed(f, cue(1) - 30)} style={{fontFamily: font.sans, fontSize: 26, letterSpacing: '0.2em', fill: '#cfc6b6'}}>
							别人拼好的 · $0.48
						</text>
						<text x={1220} y={800} textAnchor="middle" opacity={landed(f, cue(1) - 16)} style={{fontFamily: font.sans, fontSize: 26, letterSpacing: '0.2em', fill: HUE.gold}}>
							自己拼的 · $0.78
						</text>
						<g opacity={landed(f, cue(1) + 2)}>
							<Thin text="+63%" y={300} x={1220} size={110} fill={HUE.gold} />
						</g>
						<Dust seed="ly" f={f} n={40} c="#ffd98f" />
					</View>
					<g opacity={landed(f, 10)}>
						<Tag en="The IKEA effect · Norton 2012" zh="宜家效应" />
					</g>
				</g>
			) : null}
			{f >= L2 - 6 ? (
				<g transform={`translate(0,${-900 * (1 - prog(f, L2 - 6, 14, ease.out))})`}>
					<View c={c2}>
						<rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#05050b" />
						<Pool x={1380} y={480} r={600} c={HUE.phone} o={0.3 + 0.5 * lit} id="ly2" />
						<Profile x={540} label="很喜欢你" o={card(0) * (1 - 0.5 * lit)} lit={0} f={f} />
						<Profile x={960} label="一般般" o={card(1) * (1 - 0.5 * lit)} lit={0} f={f} />
						<Profile x={1380} label="不确定" o={card(2)} lit={lit} f={f} />
						<Dust seed="ly2" f={f} n={40} c="#d8deff" />
					</View>
					<g opacity={landed(f, L2 + 20)}>
						<Tag en="Whitchurch, Wilson & Gilbert · 2011" zh="47 名大学生 · 小型研究" />
					</g>
				</g>
			) : null}
		</Canvas>
	);
};

// ---------------------------------------------------------------- 8. takeaways: the phone goes face down; three questions

const SEAT = 700 + 216 * 1.3;

const Takeaways: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const T2 = cue(1) - 8;
	const T3 = cue(2) - 8;
	const T4 = cue(3) - 8;
	const handX = 700 + 104 * 1.3;
	const handY = SEAT - 262 * 1.3 - 6;

	// T1: out of the card into the phone in her hand, pull back; she puts it face down
	const a = arrive(f, 0, 16);
	const c1 = camPath(f, [
		[0, cam(handX, handY, 4.2)],
		[cue(0) + 60, cam(820, 600, 1.05)],
		[T2, cam(780, 600, 1.12)],
	]);
	const down = prog(f, cue(0) + 70, 30, ease.inOut);
	const phoneX = mix(handX, 860, down);
	const phoneY = mix(handY, 818, down);
	const glow = 1 - prog(f, cue(0) + 96, 10);

	// T2 ①: the chat rewinds to the first day: every message slides back out, newest first
	const c2 = camPath(f, [
		[T2, cam(PHONE.x, PHONE.y + 30, 1.12)],
		[T3, cam(PHONE.x, PHONE.y + 10, 1.3)],
	]);
	const gone = (k: number) => prog(f, cue(1) + 8 + k * 6, 9, ease.in);
	const fresh = landed(f, cue(1) + 8 + 7 * 6 + 6);

	// T3 ②: what you paid (her gold pile) and what TA gave (one grey 嗯) slide apart
	const c3 = camPath(f, [
		[T3, cam(960, 520, 1.25)],
		[T4, cam(960, 520, 1.0)],
	]);
	const sep = prog(f, cue(2) + 20, 90, ease.inOut);

	// T4 ③: the gold comes back to her: it gathers into a warm light in her hands
	const c4 = camPath(f, [
		[T4, cam(handX, handY, 2.3)],
		[end, cam(860, 600, 1.15)],
	]);
	const gather = prog(f, T4 + 10, 80, ease.inOut);
	const warm = prog(f, T4 + 40, 90, ease.inOut);

	const chatAt = (k: number) => {
		// k: 0 = TA's reply, 1.. = her messages from the newest down
		const o = 1 - gone(k);
		return {o, dy: 30 * gone(k)};
	};

	return (
		<Canvas flash={f < T2 ? a.flash * 0.4 : 0} flashColor={HUE.phone}>
			{f < T2 ? (
				<View c={{...c1, z: c1.z * a.z}}>
					<Bedroom f={f} phone={mix(1, 0.15, 1 - glow)} />
					<Pool x={1440} y={420} r={800} c={HUE.phone} o={0.35} id="tkm" />
					<Person look={SHE} x={700} y={SEAT} s={1.3} pose={lerpPose(SIT_PHONE, {...SIT_PHONE, head: 6, armNear: [14, 30], armFar: [10, 34]}, down)} rim="cool" sil="#0a0a14" reach={down < 0.5 ? {near: [104, -262], far: [98, -258]} : undefined} />
					<g transform={`translate(${phoneX},${phoneY}) rotate(${mix(-20, 4, down)})`}>
						{down < 0.6 ? <rect x={-13} y={-22} width={26} height={44} rx={5} fill={HUE.phoneWarm} opacity={glow} /> : <rect x={-40} y={-10} width={80} height={20} rx={5} fill="#0b0b12" stroke="#4a4a5c" />}
						<circle r={70} fill={HUE.phone} opacity={0.22 * glow} filter="url(#b8)" />
					</g>
				</View>
			) : null}
			{f >= T2 && f < T3 ? (
				<View c={c2}>
					<rect x={-2000} y={-2000} width={W + 4000} height={H + 4000} fill="#05050b" />
					<Pool x={960} y={520} r={800} c={HUE.phone} id="tk2" />
					<Phone x={PHONE.x} y={PHONE.y} s={1}>
						<g transform={`translate(0,${OFF})`}>
							{MSGS.map((m, i) => {
								const {o, dy} = chatAt(MSGS.length - i);
								return o > 0 ? (
									<g key={i} opacity={o} transform={`translate(0,${dy})`}>
										{m.chip ? <TimeChip y={m.chipY!} t={m.chip} /> : null}
										<Bubble y={m.y} mine text={m.text} />
									</g>
								) : null;
							})}
							{chatAt(0).o > 0 ? (
								<g opacity={chatAt(0).o} transform={`translate(0,${chatAt(0).dy})`}>
									<TimeChip y={REPLY_Y - 10} t="01:07" />
									<Bubble y={REPLY_Y} text="嗯" w={52} />
								</g>
							) : null}
						</g>
						<ChatHead />
						<Clock t={fresh > 0.5 ? '21:02' : '01:07'} />
						<g opacity={fresh}>
							<TimeChip y={150} t="今天 · 你们刚认识" />
						</g>
						<rect x={14} y={606} width={302} height={50} rx={25} fill="#1b1c33" stroke="#3a3d66" strokeWidth={1} />
						<text x={34} y={639} style={{fontFamily: font.sans, fontSize: 20, fill: '#5a5e8a'}}>
							发消息{Math.floor(f / 15) % 2 === 0 && fresh > 0.5 ? '|' : ''}
						</text>
					</Phone>
					<Dust seed="tk2" f={f} n={36} c="#d8deff" />
				</View>
			) : null}
			{f >= T3 && f < T4 ? (
				<View c={c3}>
					<rect x={-2000} y={-2000} width={W + 4000} height={H + 4000} fill="#05050b" />
					<Pool x={mix(640, 560, sep)} y={460} r={620} c={HUE.gold} o={0.55} id="tk3a" />
					<g transform={`translate(${mix(470, 390, sep)},${150}) scale(1.25)`}>
						{MSGS.map((m, i) => (
							<Bubble key={i} y={m.y - 100} mine text={m.text} gold={1} />
						))}
					</g>
					<g transform={`translate(${mix(1280, 1380, sep)},${560}) scale(2)`}>
						<circle cx={-40} cy={-60} r={22} fill="#22243e" stroke="#4a4f80" strokeWidth={1} />
						<g transform="translate(-18,-25)">
							<Bubble y={0} text="嗯" w={52} />
						</g>
					</g>
					<text x={mix(660, 580, sep)} y={790} textAnchor="middle" opacity={landed(f, cue(2) + 6)} style={{fontFamily: font.serif, fontWeight: 600, fontSize: 46, fill: HUE.gold}}>
						你付出的
					</text>
					<text x={mix(1300, 1400, sep)} y={790} textAnchor="middle" opacity={landed(f, cue(2) + 16)} style={{fontFamily: font.serif, fontWeight: 600, fontSize: 46, fill: "#9a96b4"}}>
						TA 给的
					</text>
					<line x1={960} y1={250} x2={960} y2={800} stroke="#3a3650" strokeWidth={1.5} strokeDasharray="6 10" opacity={sep} />
					<Dust seed="tk3" f={f} n={40} c="#ffd98f" x0={200} x1={1000} />
				</View>
			) : null}
			{f >= T4 ? (
				<View c={c4}>
					<Bedroom f={f} phone={0.12} />
					<Pool x={handX} y={handY} r={900} c={HUE.lamp} o={0.7 * warm} id="tk4" />
					<Person look={SHE} x={700} y={SEAT} s={1.3} pose={{...SIT_PHONE, head: 14}} rim="warm" sil="#100a10" reach={{near: [104, -250], far: [96, -246]}} />
					<g transform="translate(860,818) rotate(4)">
						<rect x={-40} y={-10} width={80} height={20} rx={5} fill="#0b0b12" stroke="#4a4a5c" />
					</g>
					{/* gold motes gathering into her hands */}
					{Array.from({length: 18}, (_, i) => {
						const a0 = (i / 18) * Math.PI * 2;
						const r0 = 700 + 200 * Math.sin(i * 1.7);
						const k = Math.min(1, gather * 1.25 - (i % 6) * 0.04);
						const x = mix(handX + r0 * Math.cos(a0), handX, Math.max(0, k));
						const y = mix(handY + r0 * Math.sin(a0) * 0.6, handY, Math.max(0, k));
						return <rect key={i} x={x - 14} y={y - 6} width={28} height={12} rx={6} fill={HUE.gold} opacity={0.8 * (1 - Math.max(0, k) ** 6)} filter="url(#g-sm)" />;
					})}
					<Glow x={handX} y={handY} r={40 + 90 * warm} o={warm} />
				</View>
			) : null}
		</Canvas>
	);
};

// ---------------------------------------------------------------- 9. callback: dawn; the phone lights; she doesn't look; end card

const Callback: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const end = useScene().duration;
	const endAt = end - 180;
	const dawn = prog(f, 0, 150, ease.inOut);
	const buzz = cue(0) + 24;
	const lightUp = f >= buzz ? Math.exp(-(f - buzz) / 22) : 0;
	const vib: [number, number] = f >= buzz && f < buzz + 8 ? [2 * Math.sin(f * 3), 0] : [0, 0];
	// she gets up and walks to the window
	const rise = prog(f, cue(1) - 4, 24, ease.inOut);
	const walk = prog(f, cue(1) + 20, cue(2) + 10 - cue(1) - 20, ease.inOut);
	const atWindow = f > cue(2) + 10;
	const x = mix(700, 1440, walk);
	const y = mix(SEAT, 1000, rise);
	const s = mix(1.3, 1.4, rise);
	const pose = walk > 0 && walk < 1 ? walkPose(f * 0.22, 1) : lerpPose(SIT_PHONE.lift ? {...SIT_PHONE, head: 6, armNear: [14, 30], armFar: [10, 34]} : SIT_PHONE, POSES.stand, rise);
	const c = camPath(f, [
		[0, cam(800, 640, 1.2)],
		[cue(1) - 10, cam(860, 760, 1.45)],
		[cue(1) + 20, cam(960, 600, 1.08)],
		[cue(2) + 10, cam(1400, 520, 1.25)],
		[endAt, cam(1440, 480, 1.4)],
	]);
	return (
		<Canvas
			over={
				<Sequence from={endAt}>
					<EndCard v={EPISODE} cfg={{videos: []}} dur={end - endAt} />
				</Sequence>
			}
		>
			<View c={c}>
				<Bedroom f={f} phone={0.12 + 0.6 * lightUp} dawn={dawn} />
				<g transform={`translate(${860 + vib[0]},818) rotate(4)`}>
					<rect x={-40} y={-10} width={80} height={20} rx={5} fill="#0b0b12" stroke="#4a4a5c" />
					<ellipse cx={0} cy={6} rx={90} ry={16} fill={HUE.phone} opacity={0.7 * lightUp} filter="url(#b8)" />
				</g>
				<Person look={SHE} x={x} y={y} s={s} pose={pose} back={atWindow} rim="warm" sil="#160d14" />
				<Dust seed="cb" f={f} n={40} c="#ffd0b8" x0={1100} x1={1800} y0={150} y1={900} o={dawn} />
			</View>
		</Canvas>
	);
};

export const act2 = {Mechanism, Reveal, Layer, Takeaways, Callback};
