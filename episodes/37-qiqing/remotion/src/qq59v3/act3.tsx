/* ep59 v3 act 3 (≈ 88–126 s on the DJ track, right after the first drop): Siberia → the Gobi → the closed border → the sea → the swims
   (the Caspian, the night on the boat, the far shore) → the Bosphorus → the Channel → Dover. See story3.ts SCENES and EP59V3.tsx for
   the contract. Every move runs on t/dur; cuts inside a scene and the hits sit on multiples of `beat` from the scene start.
   Sets: act3_land.tsx (river, caravan, border, road), act3_land2.tsx (shore, boots, far shore, bridge, tunnel, cliffs, Dover),
   act3_sea.tsx (the open-water shots). */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneDef, SceneProps} from './EP59V3';
import {Stage, camPath, addCam, drift, karlTravel, cl} from './kit3';
import {Print3, PH3} from './photo3';
import {SwimShot, NightBoat, DAWN_CASPIAN, DAWN_CHANNEL} from './act3_sea';
import {FrozenRiver, GobiCaravan, BorderGate, EmptyRoad} from './act3_land';
import {ShoreClose, BootsPOV, CaspianShore, BosphorusWide, BosphorusDeck, TunnelPortal, FarCliffs, DoverWide, DoverStand} from './act3_land2';

type Ph = {src: string; pos?: string; aspect?: number};
/** a photo print by key; keys the owner hasn't sent yet (caspian, bosphorus, dover) render nothing until the producer adds them to PH3 */
const Photo: React.FC<{k: string; t: number; t0: number; hold: number; cx: number; cy: number; w: number; rot?: number; from?: 'left' | 'right' | 'top' | 'bottom'; caption: string}> = ({k, t, t0, hold, cx, cy, w, rot = -3, from = 'right', caption}) => {
	const ph = (PH3 as unknown as Record<string, Ph | undefined>)[k];
	if (!ph) return null;
	return <Print3 src={ph.src} pos={ph.pos} aspect={ph.aspect} t={t - t0} dur={hold} cx={cx} cy={cy} w={w} rot={rot} from={from} caption={caption} />;
};

/* ---------- siberia: the winter road on a frozen river; he pushes the cart through the ice fog; the frost-face print ---------- */
const Siberia: React.FC<SceneProps> = ({t, dur, beat}) => {
	const kh = 300, dx = karlTravel('pushCart', Math.max(0, t), kh).dx;
	const cam = addCam(camPath(t / dur, [[0, {x: -40, y: 18, z: 0}], [1, {x: 30, y: -14, z: 0.38}]]), {...drift(t, 0.6), x: dx * 0.88 + drift(t, 0.6).x!});
	return <AbsoluteFill>
		<FrozenRiver t={t} cam={cam} kx={620} kh={kh} />
		<Photo k="frostFace" t={t} t0={4 * beat} hold={dur - 4 * beat - 0.35} cx={1420} cy={690} w={420} rot={3} from="right" caption="冬天 · 俄罗斯远东" />
	</AbsoluteFill>;
};

/* ---------- gobi: the caravan crosses the sand at sunset; the camera tracks at his pace and pulls back to show the string ---------- */
const Gobi: React.FC<SceneProps> = ({t, dur}) => {
	const kh = 230, dx = karlTravel('leadCamel', Math.max(0, t), kh).dx;
	const cam = addCam(camPath(t / dur, [[0, {x: 0, y: 40, z: 0.5}], [1, {x: 0, y: -24, z: 0}]]), {...drift(t, 0.5), x: dx});
	return <GobiCaravan t={t} cam={cam} kx={1400} kh={kh} />;
};

/* ---------- border: the closed gate at dusk (a red ✕ on the first beat) → the empty road (a mask on a fence post) toward the grey sea ---------- */
const Border: React.FC<SceneProps> = ({t, dur, beat}) => {
	const cut = 3 * beat;
	if (t < cut) return <BorderGate t={t} beat={beat} cam={addCam(camPath(t / cut, [[0, {x: -30, z: 0}], [1, {x: 10, z: 0.32}]]), drift(t, 0.5))} />;
	const u = t - cut, D = dur - cut, kh = 260, dx = karlTravel('pushCart', u, kh).dx;
	return <EmptyRoad t={u} kx={620} kh={kh} cam={addCam(camPath(u / D, [[0, {x: -20, y: 10, z: 0}], [1, {x: 40, y: -6, z: 0.16}]]), {...drift(u, 0.5), x: dx * 0.8})} />;
};

/* ---------- sea: close on him at the grey shore, wind; 「那就游过去。」 lands centred (the master draws it) ---------- */
const Sea: React.FC<SceneProps> = ({t, dur}) => <ShoreClose t={t} cam={addCam(camPath(t / dur, [[0, {x: 10, y: 6, z: 0}], [1, {x: -16, y: -6, z: 0.2}]]), drift(t, 0.7))} />;

/* ---------- noswim: his boots at the water's edge (POV); the second wave comes in big and he steps back ---------- */
const NoSwim: React.FC<SceneProps> = ({t, dur, beat}) => <BootsPOV t={t} beat={beat} dur={dur} />;

/* ---------- caspian: a low tracking shot beside his front crawl (the camera surfaces out of a swell), then he floats on the life vest
   with the escort boat behind ---------- */
const Caspian: React.FC<SceneProps> = ({t, dur, beat}) => {
	const cut = 4 * beat;
	if (t < cut) return <Stage t={t} atm={{grain: 0.05, vignette: 0.45}} bg="#1a2139">
		<SwimShot id="csw" t={t + 0.4} dur={cut + 0.4} mode="swim" h={1750} look={DAWN_CASPIAN} sx={[740, 800]} HZ={420} camH={0.2} k={1.0} nearMax={2.6} lens={230} boat={{dX: 26, Z: 160, refl: 0.3}} surface={0.3} wipeT={t} />
	</Stage>;
	const u = t - cut;
	return <AbsoluteFill>
		<Stage t={t} atm={{grain: 0.05, vignette: 0.45}} bg="#1a2139">
			<SwimShot id="cfl" t={u + 2} dur={dur - cut + 1} mode="float" h={1250} look={{...DAWN_CASPIAN, sun: {...DAWN_CASPIAN.sun!, x: 560}}} sx={[760, 740]} HZ={350} camH={0.4} k={1.0} nearMax={4} lens={150} boat={{dX: 10, Z: 66, refl: 0.4}} />
		</Stage>
		<Photo k="caspian" t={t} t0={cut + beat} hold={dur - cut - beat - 0.3} cx={1330} cy={360} w={420} rot={-3} caption="2024 · 里海" />
	</AbsoluteFill>;
};

/* ---------- boat: the rough sea at night, the escort boat rocking, him wrapped in a blanket on deck under a swinging lamp ---------- */
const Boat: React.FC<SceneProps> = ({t, dur}) => <Stage t={t} atm={{grain: 0.07, vignette: 0.55}} bg="#05070d"><NightBoat t={t + 1.2} dur={dur} id="nb" /></Stage>;

/* ---------- caspianShore: dawn again, the far shore (Azerbaijan): he wades out of the sea; the end of 31 days ---------- */
const CaspShore: React.FC<SceneProps> = ({t, dur}) => {
	const dx = karlTravel('walk', Math.max(0, t), 430, 0.75).dx;
	return <CaspianShore t={t} dur={dur} cam={addCam(camPath(t / dur, [[0, {x: -20, y: 10, z: 0}], [1, {x: 20, y: -10, z: 0.22}]]), {...drift(t, 0.5), x: dx * 0.7})} />;
};

/* ---------- bosphorus: the bridge at dawn (wide), then on the deck: he walks past 「Welcome to Europe」 ---------- */
const Bosphorus: React.FC<SceneProps> = ({t, dur, beat}) => {
	const cut = 4 * beat;
	if (t < cut) return <BosphorusWide t={t} cam={addCam(camPath(t / cut, [[0, {x: -30, y: 10, z: 0}], [1, {x: 20, y: -10, z: 0.5}]]), drift(t, 0.5))} />;
	const u = t - cut, kh = 330, dx = karlTravel('walk', u, kh).dx;
	return <AbsoluteFill>
		<BosphorusDeck t={u} kx={720} kh={kh} cam={addCam(camPath(u / (dur - cut), [[0, {x: -40, z: 0}], [1, {x: 30, z: 0.14}]]), {...drift(u, 0.5), x: dx * 0.55})} />
		<Photo k="bosphorus" t={t} t0={cut + 2 * beat} hold={dur - cut - 2 * beat - 0.3} cx={1260} cy={330} w={400} rot={3} caption="2025 · 博斯普鲁斯大桥" />
	</AbsoluteFill>;
};

/* ---------- channel: the tunnel mouth with a red ✕ → the Channel at dawn, the swim toward the white cliffs; the wetsuit print ---------- */
const Channel: React.FC<SceneProps> = ({t, dur, beat}) => {
	const cut = 3 * beat;
	if (t < cut) return <TunnelPortal t={t} beat={beat} cam={addCam(camPath(t / cut, [[0, {x: -20, z: 0}], [1, {x: 16, z: 0.3}]]), drift(t, 0.5))} />;
	const u = t - cut;
	return <AbsoluteFill>
		<Stage t={t} atm={{grain: 0.05, vignette: 0.45}} bg="#121b23">
			<SwimShot id="chs" t={u + 0.9} dur={dur - cut + 0.9} mode="swim" h={1350} look={DAWN_CHANNEL} sx={[560, 640]} HZ={430} camH={0.22} k={1.05} nearMax={2.6} lens={190} boat={{dX: -16, Z: 120, refl: 0.3}} far={FarCliffs(1080, 1660, 64)} surface={0.32} wipeT={u} />
		</Stage>
		<Photo k="swimDawn" t={t} t0={5 * beat} hold={dur - 5 * beat - 0.35} cx={1330} cy={760} w={420} rot={-3} from="bottom" caption="2026 · 英吉利海峡" />
	</AbsoluteFill>;
};

/* ---------- dover: he wades out onto Shakespeare Beach's shingle; then stands and looks up at the white cliffs, his family waiting ---------- */
const Dover: React.FC<SceneProps> = ({t, dur, beat}) => {
	const cut = 4 * beat;   // the cut lands as the second line of his words comes up
	if (t < cut) { const dx = karlTravel('walk', Math.max(0, t), 330, 0.8).dx;
		return <DoverWide t={t} dur={cut} cam={addCam(camPath(t / cut, [[0, {x: -20, y: 10, z: 0}], [1, {x: 10, y: 0, z: 0.12}]]), {...drift(t, 0.4), x: dx * 0.6})} />; }
	const u = t - cut;
	return <AbsoluteFill>
		<DoverStand t={u} cam={addCam(camPath(cl(u / (dur - cut + 1)), [[0, {x: 0, y: 20, z: 0}], [1, {x: 30, y: -30, z: 0.32}]]), drift(u, 0.4))} />
		<Photo k="dover" t={t} t0={cut + 2 * beat} hold={dur - cut - 2 * beat - 0.2} cx={1320} cy={420} w={420} rot={3} caption="2026 · 多佛" />
	</AbsoluteFill>;
};

export const ACT3: Record<string, SceneDef> = {
	siberia: {C: Siberia},
	gobi: {C: Gobi},
	border: {C: Border},
	sea: {C: Sea},
	noswim: {C: NoSwim},
	caspian: {C: Caspian},
	boat: {C: Boat},
	caspianShore: {C: CaspShore, tin: 'dissolve', ov: 0.45},
	bosphorus: {C: Bosphorus},
	channel: {C: Channel},
	dover: {C: Dover},
};
