import React, {createContext, useContext, useId, useLayoutEffect, useRef} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {AbsoluteFill, delayRender, continueRender} from 'remotion';
import {Karl, KarlProps as RigProps, Attire as RigAttire, Action as RigAction, karlTravel, KARL_CYCLE} from './karl3';

/* ep59 v3 · the 2.5D parallax kit (environments).
   A scene is a stack of depth layers drawn far → near inside one <Stage>. Every layer is authored in screen px as it looks
   at rest (camera at CAM0) and carries a depth D (in "focus units": the figure stands at D = atm.focus; sky = Infinity).
   The camera {x, y, z, zoom, roll} moves each layer by its depth:
     truck  x  (px the focus plane slides; a layer at depth D slides x·focus/D)
     crane  y  (same, vertically)
     dolly  z  (depth units forward; a layer at D scales D/(D−z): near layers grow faster = a true push-in)
     zoom      (lens: everything scales alike), roll (deg)
   Haze: inside a layer, useFog()(colour) mixes a colour toward the haze colour by 1 − e^(−density·D) (more with distance).
   Depth of field: a layer's blur = aperture·|focus/D − 1| px (rendered once per layer, clipped to the screen); override with blur.
   The figure goes in ONE place: <FigureSlot …/> (a stand-in Walker now; swap the body of `Figure` for the new <Karl …/>). */

export const W = 1920, H = 1080, FPS = 30;
export const GOLD = '#FFC24A';
export type P = [number, number];

/* ---------------- math ---------------- */
export const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
export const eio = (u: number) => { const x = cl(u); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
export const wrap = (v: number, a: number, b: number) => { const r = b - a; return a + ((((v - a) % r) + r) % r); };
export const f1 = (v: number) => v.toFixed(1);
/** smooth 1D value noise in [-1, 1] */
export const noise1 = (x: number, s = 0) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(rnd(i, s) * 2 - 1, rnd(i + 1, s) * 2 - 1, u); };

/* ---------------- colour ---------------- */
const hex = (c: string): [number, number, number] => { let v = c.replace('#', ''); if (v.length === 3) v = v.split('').map((x) => x + x).join(''); return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]; };
export const mix = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b), u = cl(k); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], u)).toString(16).padStart(2, '0')).join(''); };

/* ---------------- paths ---------------- */
/** Catmull-Rom spline through the points (closed or open) */
export const spline = (pts: P[], closed = true) => { const n = pts.length, g = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
	let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
	for (let i = 0; i < (closed ? n : n - 1); i++) { const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
		d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)},${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)},${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])},${f1(p2[1])}`; }
	return d + (closed ? ' Z' : ''); };
export const poly = (pts: P[]) => 'M' + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L') + ' Z';
/** a skyline / ridge from x0 to x1 around y, closed down to `bottom`; `fn(x)` gives the height offset (px, up = +) */
export const ridge = (x0: number, x1: number, fn: (x: number) => number, bottom = H + 600, step = 12) => {
	let d = `M${f1(x0)},${f1(bottom)}`; for (let x = x0; x <= x1 + 0.1; x += step) d += ` L${f1(x)},${f1(-fn(x))}`; return d + ` L${f1(x1)},${f1(bottom)} Z`; };
/** fractal ridge height: octaves of value noise (wavelength wl px, amplitude amp) */
export const fbm = (x: number, wl: number, amp: number, seed: number, oct = 4, rough = 0.5) => { let v = 0, a = amp, w = wl; for (let o = 0; o < oct; o++) { v += noise1(x / w, seed + o * 17) * a; a *= rough; w *= 0.5; } return v; };
/** a tapered stroke (filled) along points with width w0 → w1 */
export const taper = (pts: P[], w0: number, w1: number) => {
	const L: P[] = [], R: P[] = [];
	for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / (pts.length - 1)) / 2;
		L.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]); R.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]); }
	return spline([...L, ...R.reverse()], true); };
/** points of a quadratic curve a → b bending through control c */
export const qpts = (a: P, c: P, b: P, n = 10): P[] => Array.from({length: n + 1}, (_, i) => { const u = i / n, v = 1 - u; return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]]; });

/* ---------------- camera ---------------- */
export type Cam = {x: number; y: number; zoom: number; roll: number; z?: number};
export const CAM0: Cam = {x: 0, y: 0, zoom: 1, roll: 0, z: 0};
/** keyframed camera, eased in-out between keys: keys = [t, partial cam][] */
export const camPath = (t: number, keys: [number, Partial<Cam>][]): Cam => {
	const full = keys.map(([k, c]) => [k, {...CAM0, ...c}] as [number, Cam]);
	if (t <= full[0][0]) return full[0][1];
	for (let i = 0; i < full.length - 1; i++) { const [ta, a] = full[i], [tb, b] = full[i + 1];
		if (t <= tb) { const u = eio((t - ta) / (tb - ta)); return {x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z ?? 0, b.z ?? 0, u), zoom: lerp(a.zoom, b.zoom, u), roll: lerp(a.roll, b.roll, u)}; } }
	return full[full.length - 1][1]; };
/** a hand-held drift to add on top of a move (px / deg; slow, never shaky) */
export const drift = (t: number, amp = 1, seed = 3): Partial<Cam> => ({x: noise1(t * 0.35, seed) * 6 * amp, y: noise1(t * 0.3, seed + 5) * 3.5 * amp, roll: noise1(t * 0.25, seed + 9) * 0.12 * amp});
export const addCam = (a: Cam, b: Partial<Cam>): Cam => ({x: a.x + (b.x ?? 0), y: a.y + (b.y ?? 0), z: (a.z ?? 0) + (b.z ?? 0), zoom: a.zoom * (b.zoom ?? 1), roll: a.roll + (b.roll ?? 0)});

/** depth of the sky (no parallax) */
export const INF = 1e5;
const den = (cam: Cam, D: number) => Math.max(0.04, D - (cam.z ?? 0));
/** the screen transform of a layer at depth D */
export const layerTransform = (cam: Cam, D: number, focus: number, pp: P = [W / 2, H / 2]) => {
	const inf = D >= INF, d = den(cam, D), s = inf ? 1 : D / d, sx = inf ? 0 : -cam.x * focus / d, sy = inf ? 0 : -cam.y * focus / d;
	return `translate(${W / 2},${H / 2}) rotate(${cam.roll.toFixed(3)}) scale(${cam.zoom.toFixed(4)}) translate(${f1(sx + pp[0] - W / 2)},${f1(sy + pp[1] - H / 2)}) scale(${s.toFixed(4)}) translate(${f1(-pp[0])},${f1(-pp[1])})`; };
/** where a rest-position point at depth D lands on screen, and its scale */
export const project = (cam: Cam, D: number, focus: number, p: P, pp: P = [W / 2, H / 2]): {p: P; s: number} => {
	const inf = D >= INF, d = den(cam, D), s = inf ? 1 : D / d, sx = inf ? 0 : -cam.x * focus / d, sy = inf ? 0 : -cam.y * focus / d;
	const x = (p[0] - pp[0]) * s + pp[0] - W / 2 + sx, y = (p[1] - pp[1]) * s + pp[1] - H / 2 + sy, a = cam.roll * Math.PI / 180, c = Math.cos(a), n = Math.sin(a);
	return {p: [W / 2 + cam.zoom * (x * c - y * n), H / 2 + cam.zoom * (x * n + y * c)], s: s * cam.zoom}; };

/* ---------------- debug switches (profiling: set from the test entry's input props) ---------------- */
export const DBG = {noBlur: false, noGrain: false, noParticles: false, noVignette: false, blurMin: 1.4, lowMode: 'canvas', lowK: 0, noCast: false, noCamels: false};

/* ---------------- stage / atmosphere ---------------- */
export type Atm = {
	/** haze colour and density (per focus unit of depth): haze(D) = 1 − e^(−density·D) */
	haze: string; density: number;
	/** depth of the figure plane (the camera is focused there) and the DOF strength (px of blur at infinity) */
	focus: number; aperture: number;
	/** the rim-light colour handed to the figure, and the light direction (deg, 0 = from screen right, 90 = from above) */
	rim: string; lightDir: number;
	grain: number; vignette: number;
	/** the principal point (where the view axis meets the screen: the road's vanishing point); dolly scales about it */
	pp: P;
};
const ATM0: Atm = {haze: '#8a9aa6', density: 0.05, focus: 4, aperture: 3, rim: '#ffd9a8', lightDir: 120, grain: 0.07, vignette: 0.5, pp: [W / 2, H / 2]};
type StageV = {cam: Cam; t: number; atm: Atm};
const StageCtx = createContext<StageV>({cam: CAM0, t: 0, atm: ATM0});
const LayerCtx = createContext<{D: number; k: number}>({D: 1, k: 0});
export const useStage = () => useContext(StageCtx);
export const useLayer = () => useContext(LayerCtx);
export const hazeK = (atm: Atm, D: number) => (D >= INF ? 1 : 1 - Math.exp(-atm.density * D));
export const coc = (atm: Atm, D: number) => atm.aperture * Math.abs(atm.focus / Math.min(D, INF) - 1);
/** colour → hazed for the current layer (extra pushes it further toward the haze) */
export const useFog = () => { const {atm} = useStage(), {k} = useLayer(); return (c: string, extra = 0, haze?: string) => mix(c, haze ?? atm.haze, cl(k + extra)); };
/** project rest-position points at any depth through the stage camera (for things spanning depths: wires, tracks, roads) */
export const useProject = () => { const {cam, atm} = useStage(); return (D: number, p: P) => project(cam, D, atm.focus, p, atm.pp); };
/** a ground plane (horizon hz, screen y = hz + K/D at rest): maps a rest-screen point on the ground to its projected point */
export const useGround = (hz: number, K: number) => { const pr = useProject(); return (p: P): P => pr(K / Math.max(0.02, p[1] - hz), p).p; };
/** a street / deck world in metres: at depth D one metre is S/D px; X = lateral offset from the vanishing point, Y = height.
    wpt gives the rest-screen point; useWorld projects it through the camera (for shapes spanning depth: façades, rails). */
export type World = {hz: number; vpx: number; S: number; camH: number};
export const wpt = (w: World, X: number, Y: number, D: number): P => [w.vpx + X * w.S / D, w.hz + (w.camH - Y) * w.S / D];
export const useWorld = (w: World) => { const pr = useProject(); return (X: number, Y: number, D: number): P => pr(D, wpt(w, X, Y, D)).p; };
/** a ground decal: rest-screen polygons on the ground plane, re-projected point by point (true perspective parallax) */
export const GroundShape: React.FC<{hz: number; K: number; polys: P[][]; fill: string; o?: number; smooth?: boolean}> = ({hz, K, polys, fill, o, smooth = true}) => {
	const g = useGround(hz, K); return <g fill={fill} opacity={o}>{polys.map((pl, i) => <path key={i} d={smooth ? spline(pl.map(g), true) : poly(pl.map(g))} />)}</g>; };
/** a unique, url-safe id */
export const useUid = (p = 'k') => p + useId().replace(/[^a-zA-Z0-9]/g, '');

/** the film-grain tile: signed noise (light and dark specks on transparent), generated once */
const GRAIN_URL: Record<string, string> = {};
const grainUrl = (amt: number) => {
	const key = amt.toFixed(3); if (GRAIN_URL[key] || typeof document === 'undefined') return GRAIN_URL[key] ?? '';
	const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); if (!g) return '';
	const im = g.createImageData(256, 256); let s = 987654321;
	for (let i = 0; i < 256 * 256; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; const a = (s % 1000) / 1000; s = (s * 1103515245 + 12345) & 0x7fffffff; const b = (s % 1000) / 1000;
		const v = (a + b - 1); const on = v > 0 ? 255 : 0; im.data[i * 4] = on; im.data[i * 4 + 1] = on; im.data[i * 4 + 2] = on; im.data[i * 4 + 3] = Math.round(Math.abs(v) * 255 * amt); }
	g.putImageData(im, 0, 0); GRAIN_URL[key] = c.toDataURL('image/png'); return GRAIN_URL[key]; };

type LayerProps = {D: number; blur?: number; o?: number; children: React.ReactNode};
/** the blur a layer gets: its own `blur`, else depth of field (none for the sky) */
const layerBlur = (atm: Atm, p: LayerProps) => (DBG.noBlur ? 0 : p.blur ?? (p.D >= INF ? 0 : coc(atm, p.D)));
/** a blurred layer is drawn in its own SVG at ½ or ¼ resolution with a CSS blur, then scaled back up (blur once, cheaply).
    The SVG overscans the frame by a margin so the blur never pulls transparency in from the edges. */
const LowRes: React.FC<{b: number; children: React.ReactNode}> = ({b, children}) => {
	const k = DBG.lowK || (b >= 7 ? 4 : b >= 1.5 ? 2 : 1), m = Math.ceil(b * 3 / k) * k, id = useUid('lr');
	if (DBG.lowMode === 'canvas') return <CanvasLayer b={b} k={k} m={m}>{children}</CanvasLayer>;
	const css = DBG.lowMode === 'css', svgf = DBG.lowMode === 'svg';
	return <svg width={(W + 2 * m) / k} height={(H + 2 * m) / k} viewBox={`${-m} ${-m} ${W + 2 * m} ${H + 2 * m}`}
		style={{position: 'absolute', left: -m, top: -m, transform: `scale(${k})`, transformOrigin: `${0}px ${0}px`, filter: css ? `blur(${(b / k).toFixed(2)}px)` : undefined}}>
		{svgf && <defs><filter id={id} filterUnits="userSpaceOnUse" x={-m} y={-m} width={W + 2 * m} height={H + 2 * m}><feGaussianBlur stdDeviation={b.toFixed(2)} /></filter></defs>}
		<g filter={svgf ? `url(#${id})` : undefined}>{children}</g></svg>; };
/** the blurred layer as a real low-res raster: its SVG markup → an image drawn at 1/k size into a canvas with a canvas blur,
    then the canvas is scaled back up (bilinear). Chrome rasterizes the vector at 1/k² of the pixels, and blurs that. */
const CanvasLayer: React.FC<{b: number; k: number; m: number; children: React.ReactNode}> = ({b, k, m, children}) => {
	const st = useStage(), ref = useRef<HTMLCanvasElement>(null), cw = Math.round((W + 2 * m) / k), ch = Math.round((H + 2 * m) / k);
	const markup = renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" width={cw} height={ch} viewBox={`${-m} ${-m} ${W + 2 * m} ${H + 2 * m}`}><StageCtx.Provider value={st}>{children}</StageCtx.Provider></svg>);
	useLayoutEffect(() => {
		const h = delayRender('blur layer'), img = new Image();
		img.onload = () => { const c = ref.current, g = c?.getContext('2d'); if (c && g) { g.clearRect(0, 0, cw, ch); g.filter = `blur(${(b / k).toFixed(2)}px)`; g.drawImage(img, 0, 0, cw, ch); } continueRender(h); };
		img.onerror = () => continueRender(h);
		img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
	}, [markup, b, k, cw, ch]);
	return <canvas ref={ref} width={cw} height={ch} style={{position: 'absolute', left: -m, top: -m, width: W + 2 * m, height: H + 2 * m}} />; };
const flatten = (ch: React.ReactNode): React.ReactNode[] => React.Children.toArray(ch).flatMap((c) => (React.isValidElement(c) && c.type === React.Fragment ? flatten((c.props as {children?: React.ReactNode}).children) : [c]));

/** the root of a scene. Its direct children are drawn far → near; runs of sharp children share one full-res SVG, every blurred
    <Layer> gets its own low-res SVG. Then the grade (optional SVG overlay), the vignette and the grain. */
export const Stage: React.FC<{t: number; cam?: Cam; atm?: Partial<Atm>; bg?: string; children: React.ReactNode; grade?: React.ReactNode}> = ({t, cam = CAM0, atm = {}, bg = '#0b0c0f', children, grade}) => {
	const A = {...ATM0, ...atm}, gu = A.grain > 0 && !DBG.noGrain ? grainUrl(A.grain) : '';
	const gx = Math.floor(rnd(Math.floor(t * 30), 7) * 256), gy = Math.floor(rnd(Math.floor(t * 30), 8) * 256);
	const segs: {b: number; items: React.ReactNode[]}[] = [];
	for (const c of flatten(children)) {
		const b = React.isValidElement(c) && c.type === Layer ? layerBlur(A, c.props as LayerProps) : 0, blurred = b >= DBG.blurMin;
		if (blurred) segs.push({b, items: [c]}); else if (segs.length && segs[segs.length - 1].b === 0) segs[segs.length - 1].items.push(c); else segs.push({b: 0, items: [c]});
	}
	const full = (key: string | number, kids: React.ReactNode) => <svg key={key} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>{kids}</svg>;
	const fin = <>{grade}
		{A.vignette > 0 && !DBG.noVignette && <g><defs><radialGradient id="vig3" cx="0.5" cy="0.52" r="0.72"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="0.8" stopColor="#000" stopOpacity={A.vignette * 0.45} /><stop offset="1" stopColor="#000" stopOpacity={A.vignette} /></radialGradient></defs>
			<rect width={W} height={H} fill="url(#vig3)" /></g>}</>;
	const lastSharp = segs.length > 0 && segs[segs.length - 1].b === 0;
	return <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
		<StageCtx.Provider value={{cam, t, atm: A}}>
			{segs.map((sg, i) => (sg.b > 0 ? <LowRes key={i} b={sg.b}>{sg.items}</LowRes> : full(i, i === segs.length - 1 ? <>{sg.items}{fin}</> : sg.items)))}
		</StageCtx.Provider>
		{!lastSharp && full('fin', fin)}
		{gu && <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${gu})`, backgroundPosition: `${gx}px ${gy}px`, pointerEvents: 'none'}} />}
	</AbsoluteFill>;
};

/** one depth layer (a direct child of <Stage>). blur: px (default = depth of field); the Stage renders a blurred layer at low res. */
export const Layer: React.FC<LayerProps> = ({D, o, children}) => {
	const {cam, atm} = useStage(), k = hazeK(atm, D);
	return <LayerCtx.Provider value={{D, k}}><g opacity={o} transform={layerTransform(cam, D, atm.focus, atm.pp)}>{children}</g></LayerCtx.Provider>;
};

/** many sub-shapes as separate <path>s (one combined path would punch holes where opposite-wound shapes overlap) */
export const Shape: React.FC<{d: string; fill?: string; o?: number; transform?: string}> = ({d, fill, o, transform}) =>
	<g fill={fill} opacity={o} transform={transform}>{d.split(/(?=M)/).map((s, i) => (s.trim() ? <path key={i} d={s} /> : null))}</g>;
/** a set of shapes filled with a colour hazed for its layer */
export const FPath: React.FC<{d: string; c: string; extra?: number; o?: number; transform?: string}> = ({d, c, extra = 0, o, transform}) => { const fog = useFog(); return <Shape d={d} fill={fog(c, extra)} o={o} transform={transform} />; };

/* ---------------- sky and light ---------------- */
/** a vertical sky gradient (screen space, covers the overscan) */
export const SkyGrad: React.FC<{stops: [number, string][]; y0?: number; y1?: number}> = ({stops, y0 = -200, y1 = H + 200}) => { const id = useUid('sky');
	return <><defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={y0} x2="0" y2={y1}>{stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}</linearGradient></defs>
		<rect x={-1200} y={-1200} width={W + 2400} height={H + 2400} fill={`url(#${id})`} /></>; };
/** a soft radial glow (sky glow, sun bloom, lamp halo). stops: [offset, opacity] pairs (default: a soft falloff) */
export const Glow: React.FC<{x: number; y: number; r: number; ry?: number; c: string; o?: number; falloff?: [number, number][]}> = ({x, y, r, ry, c, o = 1, falloff = [[0, 1], [0.2, 0.55], [0.5, 0.18], [1, 0]]}) => { const id = useUid('g');
	return <><defs><radialGradient id={id}>{falloff.map(([of, a], i) => <stop key={i} offset={of} stopColor={c} stopOpacity={a} />)}</radialGradient></defs>
		<ellipse cx={x} cy={y} rx={r} ry={ry ?? r} fill={`url(#${id})`} opacity={o} /></>; };
/** the sun / moon: disc + bloom; options for an ice halo (22° ring), sun dogs and a sun pillar */
export const Sun: React.FC<{x: number; y: number; r: number; c?: string; core?: string; bloom?: number; bloomO?: number; halo?: number; dogs?: boolean; pillar?: number}> = ({x, y, r, c = '#ffd9a0', core = '#fffaf0', bloom = 8, bloomO = 0.7, halo, dogs, pillar}) => <g>
	<Glow x={x} y={y} r={r * bloom * 2.2} c={c} o={bloomO * 0.5} falloff={[[0, 0.9], [0.15, 0.4], [0.45, 0.12], [1, 0]]} />
	<Glow x={x} y={y} r={r * bloom} c={c} o={bloomO} />
	{pillar && <Glow x={x} y={y + pillar * 0.1} r={r * 1.3} ry={pillar} c={c} o={0.45} falloff={[[0, 1], [0.4, 0.4], [1, 0]]} />}
	{halo && <HaloRing x={x} y={y} R={halo} c={c} />}
	{halo && dogs && [-1, 1].map((s) => <g key={s}><Glow x={x + s * halo * 1.04} y={y + 4} r={r * 1.2} ry={r * 2.0} c="#fff1d6" o={0.75} falloff={[[0, 1], [0.35, 0.5], [1, 0]]} />
		<Glow x={x + s * halo * 1.04 + s * r * 0.5} y={y + 4} r={r * 0.6} ry={r * 1.4} c="#ffb880" o={0.35} falloff={[[0, 1], [1, 0]]} /></g>)}
	<Glow x={x} y={y} r={r * 1.9} c={core} o={0.95} falloff={[[0, 1], [0.5, 0.9], [0.62, 0.35], [1, 0]]} />
	<circle cx={x} cy={y} r={r} fill={core} />
</g>;
/** the 22° ice-crystal halo: a faint ring, reddish on its inner edge */
export const HaloRing: React.FC<{x: number; y: number; R: number; c: string}> = ({x, y, R, c}) => { const id = useUid('hr'), w = R * 0.16;
	return <><defs><radialGradient id={id} gradientUnits="userSpaceOnUse" cx={x} cy={y} r={R + w}>
		<stop offset={(R - w) / (R + w)} stopColor={c} stopOpacity="0" /><stop offset={(R - w * 0.3) / (R + w)} stopColor="#ffb08a" stopOpacity="0.32" /><stop offset={R / (R + w)} stopColor="#fff4e2" stopOpacity="0.4" />
		<stop offset={(R + w * 0.45) / (R + w)} stopColor="#d8e4f4" stopOpacity="0.16" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient></defs>
		<circle cx={x} cy={y} r={R + w} fill={`url(#${id})`} /></>; };
/** light shafts: parallel beams from the top edge points (x, y0) at `angle` (deg from vertical, + leans right), each {x, w, o, len}.
    Soft edges without a filter: each beam is 4 nested quads (wide + faint → narrow), fading along its length. */
export const Shafts: React.FC<{beams: {x: number; w: number; o: number; len?: number; spread?: number}[]; y0: number; angle: number; c: string; len?: number; t?: number}> = ({beams, y0, angle, c, len = 900, t = 0}) => {
	const id = useUid('sh'), a = angle * Math.PI / 180, dx = Math.sin(a), dy = Math.cos(a);
	return <g>{beams.map((b, i) => { const L = b.len ?? len, sp = b.spread ?? 0.25, ax = b.x, ay = y0, ex = ax + dx * L, ey = ay + dy * L, nx = dy, ny = -dx;
		const breathe = 0.8 + 0.2 * Math.sin(t * (0.5 + rnd(i, 3) * 0.6) + i * 2.1);
		return <g key={i}><defs><linearGradient id={`${id}${i}`} gradientUnits="userSpaceOnUse" x1={ax} y1={ay} x2={ex} y2={ey}><stop offset="0" stopColor={c} stopOpacity="1" /><stop offset="0.4" stopColor={c} stopOpacity="0.6" /><stop offset="0.8" stopColor={c} stopOpacity="0.15" /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient></defs>
			<g opacity={b.o * breathe} fill={`url(#${id}${i})`}>{[1.6, 1.0, 0.62, 0.3].map((f, j) => { const w0 = b.w * f / 2, w1 = b.w * (1 + sp) * f / 2;
				return <path key={j} d={poly([[ax + nx * w0, ay + ny * w0], [ex + nx * w1, ey + ny * w1], [ex - nx * w1, ey - ny * w1], [ax - nx * w0, ay - ny * w0]])} opacity={0.28} />; })}</g></g>; })}</g>; };
/** a horizontal fog band (layer space): soft top and bottom, densest at y */
export const FogBand: React.FC<{y: number; h: number; o: number; c?: string; x0?: number; x1?: number}> = ({y, h, o, c, x0 = -1400, x1 = W + 1400}) => { const id = useUid('fb'), {atm} = useStage(), col = c ?? atm.haze;
	return <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity="0" /><stop offset="0.5" stopColor={col} stopOpacity={o} /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient></defs>
		<rect x={x0} y={y - h / 2} width={x1 - x0} height={h} fill={`url(#${id})`} /></>; };
/** fog pooled at the foot of a layer: transparent at y0 → o at y1 (and below) */
export const FogFoot: React.FC<{y0: number; y1: number; o: number; c?: string; down?: number}> = ({y0, y1, o, c, down = 0}) => { const id = useUid('ff'), {atm} = useStage(), col = c ?? atm.haze;
	return <><defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={y0} x2="0" y2={y1}><stop offset="0" stopColor={col} stopOpacity="0" /><stop offset="1" stopColor={col} stopOpacity={o} /></linearGradient></defs>
		<rect x={-1400} y={y0} width={W + 2800} height={y1 - y0 + down} fill={`url(#${id})`} /></>; };
/** drifting mist sheets (layer space): long soft ellipses that wrap horizontally */
export const Mist: React.FC<{n: number; seed: number; y0: number; y1: number; t: number; speed?: number; o?: number; c?: string; w?: [number, number]; h?: [number, number]}> = ({n, seed, y0, y1, t, speed = 12, o = 0.35, c, w = [500, 1300], h = [40, 120]}) => {
	const id = useUid('mi'), {atm} = useStage(), col = c ?? atm.haze;
	return <g><defs><radialGradient id={id}><stop offset="0" stopColor={col} stopOpacity="1" /><stop offset="0.5" stopColor={col} stopOpacity="0.55" /><stop offset="1" stopColor={col} stopOpacity="0" /></radialGradient></defs>
		{Array.from({length: n}, (_, i) => { const ww = lerp(w[0], w[1], rnd(i, seed)), hh = lerp(h[0], h[1], rnd(i, seed + 1)), x = wrap(rnd(i, seed + 2) * (W + 1600) + t * speed * (0.6 + rnd(i, seed + 3) * 0.8), -800, W + 800), y = lerp(y0, y1, rnd(i, seed + 4));
			return <ellipse key={i} cx={x} cy={y} rx={ww / 2} ry={hh / 2} fill={`url(#${id})`} opacity={o * (0.5 + 0.5 * rnd(i, seed + 5)) * (0.75 + 0.25 * Math.sin(t * 0.4 + i))} />; })}</g>; };

/* ---------------- particles in depth ---------------- */
export type PKind = 'snow' | 'spindrift' | 'dust' | 'rain' | 'spray' | 'firefly' | 'diamond' | 'sand';
/** particles spread over depths [D0, D1] (log-uniform) inside a rest-screen box; projected through the camera per particle,
    re-wrapped into the box (so a camera move never empties the frame); near / far ones drawn as soft bokeh discs by their DOF (gradients, no filters). */
export const Particles: React.FC<{kind: PKind; n: number; seed: number; D: [number, number]; box?: [number, number, number, number]; c?: string; o?: number; size?: number; wind?: number; fall?: number}> = ({kind, n, seed, D, box = [-60, -60, W + 60, H + 60], c = '#ffffff', o = 0.8, size = 1, wind = 0, fall = 0}) => {
	const {cam, atm, t} = useStage(), id = useUid('pt'), [bx0, by0, bx1, by1] = box, bw = bx1 - bx0, bh = by1 - by0;
	if (DBG.noParticles) return null;
	const els: React.ReactNode[] = [];
	const gid = `${id}g`;
	for (let i = 0; i < n; i++) {
		const r = rnd(i, seed), d = D[0] * Math.pow(D[1] / D[0], r), par = atm.focus / d;   // nearer = bigger and faster
		let x = bx0 + rnd(i, seed + 1) * bw, y = by0 + rnd(i, seed + 2) * bh, sz = size * par, op = o, el: React.ReactNode = null;
		const ph = rnd(i, seed + 3) * 100;
		const mv = (vx: number, vy: number) => { x += vx * t * par; y += vy * t * par; };
		switch (kind) {
			case 'snow': mv(wind + Math.sin(t * 0.8 + ph) * 14, 38 + fall + rnd(i, seed + 4) * 30); x += Math.sin(t * 1.3 + ph) * 10 * par; break;
			case 'spindrift': mv(wind || -520, 0); y += Math.sin(t * 2 + ph) * 6 * par; break;
			case 'dust': mv(wind + Math.sin(t * 0.3 + ph) * 6, -4 + Math.cos(t * 0.25 + ph) * 5); break;
			case 'rain': mv(wind + 120, 1500 + fall); break;
			case 'sand': mv(wind || 260, Math.sin(t * 3 + ph) * 12); break;
			case 'spray': mv(wind, -30); break;
			default: mv(wind + Math.sin(t * 0.5 + ph) * 18, Math.cos(t * 0.4 + ph) * 12); break;
		}
		const q = project(cam, d, atm.focus, [wrap(x, bx0, bx1), wrap(y, by0, by1)], atm.pp);
		const sx = wrap(q.p[0], bx0, bx1), sy = kind === 'spindrift' || kind === 'sand' || kind === 'spray' ? q.p[1] : wrap(q.p[1], by0, by1);
		sz *= q.s;
		const fade = 1 - 0.6 * hazeK(atm, d), bl = DBG.noBlur ? 0 : Math.min(16, coc(atm, d)), soft = bl >= 1, sf = soft ? `url(#${id}s)` : undefined;
		/** a dot of radius r: crisp, or a soft bokeh disc grown by the blur (dimmer as it grows) */
		const dot = (cx: number, cy: number, r: number) => { if (!soft) return <circle cx={f1(cx)} cy={f1(cy)} r={r.toFixed(2)} />; const R = r + bl * 1.3; op *= Math.min(1, Math.pow((r + 0.6) / R, 0.9) * 1.6); return <circle cx={f1(cx)} cy={f1(cy)} r={R.toFixed(2)} fill={sf} />; };
		const streak = (cx: number, cy: number, rx: number, ry: number) => { const R = soft ? ry + bl * 1.2 : ry; if (soft) op *= Math.min(1, (ry + 0.6) / R * 1.5); return <ellipse cx={f1(cx)} cy={f1(cy)} rx={f1(rx + (soft ? bl : 0))} ry={R.toFixed(2)} fill={soft ? sf : undefined} />; };
		switch (kind) {
			case 'snow': op *= fade * (0.55 + 0.45 * rnd(i, seed + 5)); el = dot(sx, sy, Math.max(0.6, 2.2 * sz)); break;
			case 'dust': op *= fade * (0.3 + 0.7 * Math.pow(Math.sin(t * 0.9 + ph) * 0.5 + 0.5, 2)); el = dot(sx, sy, Math.max(0.5, 1.5 * sz)); break;
			case 'spindrift': { const L = (90 + rnd(i, seed + 6) * 220) * par * Math.min(1, size); op *= fade * (0.25 + 0.6 * rnd(i, seed + 7)) * (0.6 + 0.4 * Math.sin(t * 3 + ph)); el = streak(sx, sy, L / 2, Math.max(0.6, 1.6 * sz)); break; }
			case 'sand': { const L = (30 + rnd(i, seed + 6) * 70) * par; op *= fade * (0.2 + 0.6 * rnd(i, seed + 7)); el = streak(sx, sy, L / 2, Math.max(0.5, 1.1 * sz)); break; }
			case 'rain': { const L = 26 * par; op *= fade * (0.3 + 0.5 * rnd(i, seed + 5)) / (1 + bl * 0.4); el = <line x1={f1(sx)} y1={f1(sy)} x2={f1(sx - L * 0.08)} y2={f1(sy - L)} strokeWidth={(Math.max(0.6, 1.2 * sz) + bl * 0.8).toFixed(2)} stroke="currentColor" strokeLinecap="round" />; break; }
			case 'spray': { const life = (t * 0.7 + rnd(i, seed + 8)) % 1, dy = -life * 60 * par + life * life * 110 * par; op *= fade * (1 - life); el = dot(sx + (rnd(i, seed + 9) - 0.5) * life * 80 * par, sy + dy, Math.max(0.6, 2 * sz * (1 - life * 0.5))); break; }
			case 'diamond': { const tw = Math.pow(Math.max(0, Math.sin(t * (1.5 + rnd(i, seed + 5) * 2.5) + ph)), 6), s = Math.max(1, 3.4 * sz) * (0.4 + tw);
				op *= fade * (0.15 + 0.85 * tw);
				el = soft ? dot(sx, sy, s * 0.4) : <path d={`M${f1(sx - s)},${f1(sy)} L${f1(sx)},${f1(sy - s * 0.18)} L${f1(sx + s)},${f1(sy)} L${f1(sx)},${f1(sy + s * 0.18)} Z M${f1(sx)},${f1(sy - s)} L${f1(sx + s * 0.18)},${f1(sy)} L${f1(sx)},${f1(sy + s)} L${f1(sx - s * 0.18)},${f1(sy)} Z`} />; break; }
			case 'firefly': { const blink = Math.pow(Math.max(0, Math.sin(t * (0.7 + rnd(i, seed + 5) * 0.9) + ph)), 3), r0 = Math.max(1, 2.4 * sz);
				op *= fade * (0.1 + 0.9 * blink); el = <g><circle cx={f1(sx)} cy={f1(sy)} r={f1(r0 * 7 + bl)} fill={`url(#${gid})`} />{soft ? <circle cx={f1(sx)} cy={f1(sy)} r={(r0 + bl).toFixed(2)} fill={sf} /> : <circle cx={f1(sx)} cy={f1(sy)} r={r0.toFixed(2)} />}</g>; break; }
		}
		els.push(<g key={i} opacity={cl(op).toFixed(3)}>{el}</g>);
	}
	return <g fill={c} color={c}>
		<defs><radialGradient id={`${id}s`}><stop offset="0" stopColor={c} stopOpacity="1" /><stop offset="0.55" stopColor={c} stopOpacity="0.75" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient>
			{kind === 'firefly' && <radialGradient id={gid}><stop offset="0" stopColor={c} stopOpacity="0.55" /><stop offset="0.3" stopColor={c} stopOpacity="0.16" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient>}</defs>
		{els}
	</g>;
};

/* ---------------- the figure slot ---------------- */
/** Karl's attire / action / props are the rig's own (karl3.tsx): attire start1998 | jungle | ice | siberia | gobi | swim | home2026,
    action walk | pushCart | haulSled | wade | swim | float | stand | lookUp | leadCamel | hug. Use karlTravel(action, t, h) for x and phase. */
export type Attire = RigAttire;
export type Action = RigAction;
export type KarlProps = RigProps;
export {karlTravel, KARL_CYCLE};

/** ===== THE SWAP POINT =====  every Karl in every set is drawn here (the stand-in Walker was replaced by the karl3 rig). */
const Figure: React.FC<KarlProps> = (p) => <Karl {...p} />;

/** a long cast shadow of anything (camels, carts…): its silhouette flooded with c, skewed onto the ground about the line y */
export const CastShadow: React.FC<{y: number; k: number; skew: number; o?: number; c?: string; blur?: number; children: React.ReactNode}> = ({y, k, skew, o = 0.5, c = '#000', blur = 1.5, children}) => { const id = useUid('cs');
	return <g><defs><filter id={id} filterUnits="userSpaceOnUse" x={-600} y={y - 500} width={W + 1200} height={1000}><feFlood floodColor={c} /><feComposite in2="SourceAlpha" operator="in" /><feGaussianBlur stdDeviation={blur} /></filter></defs>
		<g filter={`url(#${id})`} opacity={o}><g transform={`matrix(1,0,${skew.toFixed(3)},${(-k).toFixed(3)},${f1(-skew * y)},${f1((1 + k) * y)})`}>{children}</g></g></g>; };

/** where Karl stands. (x, y) = feet at rest, h = body height px at rest, depth = its layer depth (default: the focus plane).
    rim / lightDir default to the stage's light. Options: a cast shadow (k = length, + toward the camera; skew = sideways lean per px
    of height), a reflection about the water line wy, breath vapour (cold scenes), a soft contact shadow. */
export const FigureSlot: React.FC<Omit<KarlProps, 'attire' | 'action' | 'phase'> & Partial<KarlProps> & {
	depth?: number; shadow?: {k: number; skew: number; o?: number; c?: string; blur?: number}; reflect?: {wy: number; o?: number; c?: string}; breath?: boolean; contact?: number; under?: React.ReactNode; over?: React.ReactNode}> = (props) => {
	const {cam, atm, t} = useStage(), uid = useUid('fs');
	const {depth, shadow, reflect, breath, contact, under, over, ...rest} = props;
	const D = depth ?? atm.focus;
	const p: KarlProps = {attire: 'jungle', action: 'walk', phase: 0, facing: 1, rim: atm.rim, lightDir: atm.lightDir, t, ...rest};
	const {x, y, h} = p, sh = shadow, b = coc(atm, D), facing = p.facing ?? 1;
	const body = <Figure {...p} />;
	return <LayerCtx.Provider value={{D, k: hazeK(atm, D)}}><g filter={b >= 0.8 ? `url(#${uid}dof)` : undefined}>
		<defs>
			{b >= 0.8 && <filter id={`${uid}dof`} filterUnits="userSpaceOnUse" x={-200} y={-200} width={W + 400} height={H + 400}><feGaussianBlur stdDeviation={b.toFixed(2)} /></filter>}
			{sh && <filter id={`${uid}sh`} filterUnits="userSpaceOnUse" x={f1(x - Math.max(4, Math.abs(sh.skew) * 1.3 + 1.5) * h)} y={f1(y - h * 0.6)} width={f1(Math.max(8, Math.abs(sh.skew) * 2.6 + 3) * h)} height={f1(h * (1.2 + sh.k * 1.4))}><feFlood floodColor={sh.c ?? '#000'} /><feComposite in2="SourceAlpha" operator="in" /><feGaussianBlur stdDeviation={sh.blur ?? 1.5} /></filter>}
			{reflect && <linearGradient id={`${uid}rf`} gradientUnits="userSpaceOnUse" x1="0" y1={reflect.wy} x2="0" y2={reflect.wy + (reflect.wy - (y - h))}><stop offset="0" stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>}
			{reflect && <mask id={`${uid}rm`} maskUnits="userSpaceOnUse" x={x - h * 4} y={reflect.wy} width={h * 8} height={h * 2.2}><rect x={x - h * 4} y={reflect.wy} width={h * 8} height={h * 2.2} fill={`url(#${uid}rf)`} /></mask>}
			{breath && <radialGradient id={`${uid}br`}><stop offset="0" stopColor="#ffffff" stopOpacity="1" /><stop offset="0.55" stopColor="#f6f7fa" stopOpacity="0.5" /><stop offset="1" stopColor="#f4f6fa" stopOpacity="0" /></radialGradient>}
		</defs>
		<g transform={layerTransform(cam, D, atm.focus, atm.pp)}>
			{contact !== undefined && <ellipse cx={x} cy={y + h * 0.004} rx={h * 0.2} ry={h * 0.022} fill="#000" opacity={contact} />}
			{sh && <g filter={`url(#${uid}sh)`} opacity={sh.o ?? 0.5}><g transform={`matrix(1,0,${sh.skew.toFixed(3)},${(-sh.k).toFixed(3)},${f1(-sh.skew * y)},${f1((1 + sh.k) * y)})`}>{body}</g></g>}
			{reflect && <g mask={`url(#${uid}rm)`} opacity={reflect.o ?? 0.45}><g transform={`translate(0,${f1(2 * reflect.wy)}) scale(1,-1)`}>{body}</g></g>}
			{under}
			{body}
			{breath && Array.from({length: 5}, (_, i) => { const u = ((t / 2.4 + i / 5) % 1), hx = x + facing * h * (0.08 + u * 0.26), hy = y - h * (0.87 + u * 0.07), r = h * (0.03 + u * 0.1);
				return <ellipse key={i} cx={hx} cy={hy} rx={r * 1.5} ry={r} fill={`url(#${uid}br)`} opacity={(Math.pow(Math.sin(u * Math.PI), 0.7) * 0.85 * (1 - u * 0.5)).toFixed(3)} />; })}
			{over}
		</g></g></LayerCtx.Provider>;
};
