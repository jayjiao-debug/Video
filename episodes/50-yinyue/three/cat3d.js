// Coded 3D clay cat drummer (Three.js). window.renderAt(t) poses everything from hits.json and renders one frame.
// Motion rules: every stroke has a wind-up before the hit, contact exactly on the sound, and a small rebound after;
// the head nods on the beat, the body squashes on the kick, ears flick on the snare, the tail sways over two beats,
// cymbals wobble after a hit, drum heads pulse.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const S = await (await fetch('./hits.json')).json();
const W = 1920, H = 1080;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, W / H, .1, 100);
const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .55;
scene.fog = new THREE.Fog('#EFE2F2', 9, 22);

// ---------- textures ----------
const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
scene.background = canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#E9DEFF'); gr.addColorStop(.6, '#F6E3EE'); gr.addColorStop(1, '#FFE6D6'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const bump = canvasTex(512, 512, (g, w, h) => { const d = g.createImageData(w, h); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 60; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); });
bump.colorSpace = THREE.NoColorSpace; bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.repeat.set(3, 3);
// tabby fur: orange with darker bands; forehead stripes at the front (u = .25)
const furBody = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#F5A043'; g.fillRect(0, 0, w, h);
	g.fillStyle = '#D9772B'; for (let i = 0; i < 6; i++) { const y = 90 + i * 62; g.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y + Math.sin(x / 70 + i) * 10; x === 0 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.lineWidth = 20; g.strokeStyle = '#D9772B'; g.stroke(); }
	g.fillStyle = '#F5A043'; g.fillRect(w * .12, 0, w * .26, h); });   // keep the front (belly side) clean
const furHead = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#F5A043'; g.fillRect(0, 0, w, h); g.strokeStyle = '#D9772B'; g.lineCap = 'round';
	g.lineWidth = 22; for (const dx of [-38, 0, 38]) { g.beginPath(); g.moveTo(w * .25 + dx, 40); g.lineTo(w * .25 + dx * .7, 150); g.stroke(); }
	g.lineWidth = 16; for (const [x, s] of [[w * .25 + 205, 1], [w * .25 - 205, -1]]) for (const y of [215, 255]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 60, y + 4); g.stroke(); }
	for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(w * .62 + i * 50, 60); g.lineTo(w * .62 + i * 50 + 10, 200); g.lineWidth = 24; g.stroke(); } });
const clay = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .72, metalness: 0, bumpMap: bump, bumpScale: .6, ...extra });
const M = { fur: clay('#ffffff', { map: furBody }), head: clay('#ffffff', { map: furHead }), furPlain: clay('#F2A045'), white: clay('#FFF7EE'), pink: clay('#FF9DB0'), dark: clay('#27222e', { roughness: .35 }),
	eyeHi: new THREE.MeshBasicMaterial({ color: '#ffffff' }), blush: new THREE.MeshStandardMaterial({ color: '#FF8FA6', transparent: true, opacity: .55, roughness: 1 }),
	red: clay('#E8545C'), redHead: clay('#FFF4EA'), wood: clay('#D9A066', { roughness: .55 }), metal: new THREE.MeshStandardMaterial({ color: '#E9C46A', metalness: .85, roughness: .28 }),
	chrome: new THREE.MeshStandardMaterial({ color: '#cfd5df', metalness: .9, roughness: .25 }), floor: clay('#EFE2F2', { bumpScale: .2 }) };
const mesh = (geo, mat, cast = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; return m; };
const sph = (r, mat, sx = 1, sy = 1, sz = 1) => { const m = mesh(new THREE.SphereGeometry(r, 64, 48), mat); m.scale.set(sx, sy, sz); return m; };

// ---------- lights & floor ----------
scene.add(new THREE.HemisphereLight('#ffffff', '#cdb8ea', 1.1));
const key = new THREE.DirectionalLight('#fff4e6', 2.6); key.position.set(-3.5, 6, 5); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -4; key.shadow.camera.right = 4; key.shadow.camera.top = 4; key.shadow.camera.bottom = -4; key.shadow.radius = 8; key.shadow.bias = -.0005; scene.add(key);
const rim = new THREE.DirectionalLight('#ffc4dc', 1.4); rim.position.set(3, 4, -4); scene.add(rim);
const fill = new THREE.DirectionalLight('#d8e4ff', .6); fill.position.set(4, 2, 4); scene.add(fill);
const floor = mesh(new THREE.CircleGeometry(40, 96), M.floor, false); floor.rotation.x = -Math.PI / 2; scene.add(floor);

// ---------- drum kit ----------
const kit = new THREE.Group(); scene.add(kit);
const kick = new THREE.Group(); kick.position.set(0, .62, 1.05); kit.add(kick);
const kShell = mesh(new THREE.CylinderGeometry(.6, .6, .5, 64), M.red); kShell.rotation.x = Math.PI / 2; kick.add(kShell);
const kHead = mesh(new THREE.CylinderGeometry(.53, .53, .52, 64), M.redHead); kHead.rotation.x = Math.PI / 2; kick.add(kHead);
const kLogo = mesh(new THREE.CircleGeometry(.2, 48), M.red, false); kLogo.position.z = .265; kick.add(kLogo);
for (const s of [-1, 1]) { const ft = mesh(new THREE.CylinderGeometry(.03, .03, .5, 12), M.chrome); ft.position.set(s * .5, -.42, .1); ft.rotation.z = s * .5; kick.add(ft); }
const snare = new THREE.Group(); snare.position.set(-.8, 1.06, .62); snare.rotation.set(.25, 0, .12); kit.add(snare);
snare.add(mesh(new THREE.CylinderGeometry(.32, .32, .16, 48), M.red)); const sHead = mesh(new THREE.CylinderGeometry(.3, .3, .17, 48), M.redHead); sHead.scale.y = .98; snare.add(sHead);
const sStand = mesh(new THREE.CylinderGeometry(.025, .025, 1.05, 12), M.chrome); sStand.position.set(-.8, .52, .62); kit.add(sStand);
const hat = new THREE.Group(); hat.position.set(.95, 1.22, .6); kit.add(hat);
const hatBot = mesh(new THREE.CylinderGeometry(.34, .02, .05, 48), M.metal); hatBot.rotation.x = Math.PI; hat.add(hatBot);
const hatTop = mesh(new THREE.CylinderGeometry(.02, .34, .05, 48), M.metal); hatTop.position.y = .055; hat.add(hatTop);
const hStand = mesh(new THREE.CylinderGeometry(.025, .025, 1.22, 12), M.chrome); hStand.position.set(.95, .61, .6); kit.add(hStand);
const crash = new THREE.Group(); crash.position.set(-1.25, 2.05, .25); crash.rotation.set(.35, 0, .25); kit.add(crash);
crash.add(mesh(new THREE.CylinderGeometry(.03, .48, .05, 48), M.metal));
const cStand = mesh(new THREE.CylinderGeometry(.025, .025, 2.0, 12), M.chrome); cStand.position.set(-1.3, 1.0, .2); kit.add(cStand);

// ---------- the cat ----------
const cat = new THREE.Group(); scene.add(cat);
const body = new THREE.Group(); body.position.set(0, .95, 0); cat.add(body);
const torso = sph(.6, M.fur, 1, 1.08, .92); body.add(torso);
const belly = sph(.42, M.white, 1, 1.1, .6); belly.position.set(0, -.05, .36); body.add(belly);
const head = new THREE.Group(); head.position.set(0, .95, .05); body.add(head);
const skull = sph(.66, M.head, 1.12, .98, 1); head.add(skull);
const ears = [];
for (const s of [-1, 1]) { const ear = new THREE.Group(); ear.position.set(s * .44, .48, -.02); ear.rotation.z = -s * .38; head.add(ear);
	const outer = mesh(new THREE.ConeGeometry(.22, .4, 32), M.furPlain); outer.position.y = .14; ear.add(outer);
	const inner = mesh(new THREE.ConeGeometry(.14, .28, 32), M.pink); inner.position.set(0, .11, .07); ear.add(inner); ears.push(ear); }
const muzzle = []; for (const s of [-1, 1]) { const m = sph(.15, M.white, 1.15, .9, .7); m.position.set(s * .12, -.2, .58); head.add(m); muzzle.push(m); }
const nose = sph(.055, M.pink, 1.3, .9, .8); nose.position.set(0, -.1, .7); head.add(nose);
const eyes = []; for (const s of [-1, 1]) { const e = new THREE.Group(); e.position.set(s * .27, .04, .6); head.add(e);
	const ball = sph(.1, M.dark, 1, 1.15, .6); e.add(ball); const hi = sph(.032, M.eyeHi); hi.position.set(-.03, .045, .05); e.add(hi); const hi2 = sph(.014, M.eyeHi); hi2.position.set(.035, -.03, .055); e.add(hi2); eyes.push(e); }
for (const s of [-1, 1]) { const b = mesh(new THREE.CircleGeometry(.11, 32), M.blush, false); b.position.set(s * .44, -.15, .55); b.rotation.y = s * .55; head.add(b); }
for (const s of [-1, 1]) for (const k of [0, 1]) { const w = mesh(new THREE.CylinderGeometry(.006, .006, .38, 6), M.white, false); w.position.set(s * .46, -.2 + k * .07, .5); w.rotation.z = Math.PI / 2 + s * (k ? -.12 : .1); head.add(w); }
// headband
const band = mesh(new THREE.TorusGeometry(.7, .04, 16, 96), M.red); band.rotation.x = Math.PI / 2 - .3; band.position.y = .26; band.scale.set(1.1, 1, 1); head.add(band);
const knot = sph(.09, M.red); knot.position.set(.72, .3, -.08); head.add(knot);
const tail = mesh(new THREE.BufferGeometry(), M.furPlain); cat.add(tail);
// arms (capsule from shoulder to paw), paws, sticks
const armOf = (mat) => { const a = mesh(new THREE.CapsuleGeometry(.11, 1, 12, 24), mat); cat.add(a); return a; };
const R = { arm: armOf(M.furPlain), paw: sph(.15, M.furPlain), stick: mesh(new THREE.CylinderGeometry(.022, .016, .62, 16), M.wood), tip: sph(.028, M.wood) };
const L = { arm: armOf(M.furPlain), paw: sph(.15, M.furPlain), stick: mesh(new THREE.CylinderGeometry(.022, .016, .62, 16), M.wood), tip: sph(.028, M.wood) };
for (const A of [R, L]) { cat.add(A.paw); cat.add(A.stick); cat.add(A.tip); }
for (const s of [-1, 1]) { const f = sph(.17, M.furPlain, 1, .7, 1.3); f.position.set(s * .32, .12, .45); cat.add(f); }   // feet peeking under the kick

// ---------- motion helpers ----------
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const times = (i) => S.hits.filter((h) => h.i === i).map((h) => h.t);
const T = { kick: times('kick'), snare: times('snare'), hat: times('hat'), crash: times('crash') };
const prevNext = (arr, t) => { let p = -1e9, n = 1e9; for (const x of arr) { if (x <= t + 1e-6) p = Math.max(p, x); else { n = Math.min(n, x); } } return [p, n]; };
const env = (arr, t, d) => { const [p] = prevNext(arr, t); return p < -1e8 ? 0 : Math.exp(-(t - p) / d); };
// stroke height: 0 at contact; wind-up just before each hit, small rebound after, low hover in between
function stroke(arr, t, up) {
	const [p, n] = prevNext(arr, t), d1 = t - p, d2 = n - t, I = n - p, Aw = Math.min(.15, I * .45);
	const rest = (p < -1e8 ? .35 : .35 * sstep(0, .22, d1)) * up + (p < -1e8 ? 0 : .3 * up * Math.sin(Math.PI * clamp(d1 / .13)));
	if (n > 1e8) return rest;
	const wind = up * (1 - Math.pow(1 - clamp(d2 / Aw), 3)), wgt = 1 - sstep(Aw, Aw + .18, d2);
	return rest + (wind - rest) * wgt;
}
const wobble = (arr, t, amp, d = .45, f = 9) => { const [p] = prevNext(arr, t); if (p < -1e8) return 0; const k = t - p; return amp * Math.exp(-k / d) * Math.sin(k * f * 2 * Math.PI); };
function placeArm(A, shoulder, paw, hitPoint, h) {
	const p = paw.clone().add(V(0, .3 * h, -.08 * h));
	A.paw.position.copy(p);
	const dir = shoulder.clone().sub(p), len = dir.length(); A.arm.position.copy(p.clone().add(dir.clone().multiplyScalar(.5)));
	A.arm.scale.set(1, (len - .1) / 1.22, 1); A.arm.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
	const down = hitPoint.clone().sub(paw).normalize(), upDir = V(down.x * .3, 1.2, -.2).normalize();
	const sd = down.clone().multiplyScalar(1 - h).add(upDir.clone().multiplyScalar(h)).normalize();
	A.stick.position.copy(p.clone().add(sd.clone().multiplyScalar(.27))); A.stick.quaternion.setFromUnitVectors(V(0, 1, 0), sd);
	A.tip.position.copy(p.clone().add(sd.clone().multiplyScalar(.58)));
}

window.renderAt = (t) => {
	const ph = (t - S.t0) / S.beat;           // beats since the first downbeat
	// groove: the head nods just after each beat; the body sways over two beats; squash on the kick
	const nod = t > S.t0 - .3 ? .11 * (.5 + .5 * Math.cos(2 * Math.PI * (ph - .08))) : 0;
	const kEnv = env(T.kick, t, .12), sEnv = env(T.snare, t, .1);
	body.scale.set(1 + .025 * kEnv, 1 - .045 * kEnv, 1 + .025 * kEnv);
	body.position.y = .95 - .03 * kEnv;
	body.rotation.z = t > S.t0 ? .045 * Math.sin(Math.PI * ph) : 0;
	body.rotation.x = .05 * sEnv;
	head.rotation.x = nod - .04; head.rotation.z = -.5 * body.rotation.z;
	ears.forEach((e, i) => { e.rotation.x = .22 * sEnv * Math.sin(t * 40) * Math.exp(0); e.rotation.z = (i ? -1 : 1) * (.38 + .1 * sEnv); });
	// eyes: blink now and then; squeeze on the final crash
	const blink = [2.1, 5.3, 8.4].some((b) => Math.abs(t - b) < .07) ? .12 : 1, squeeze = env(T.crash, t, .5) > .2 ? .25 : 1;
	eyes.forEach((e) => e.scale.y = Math.min(blink, squeeze));
	// arms: left paw (viewer's right) on the hats, right paw (viewer's left) on the snare; crash with the right paw at the end
	const crashH = stroke(T.crash, t, 1.2), useCrash = t > S.t0 + 15.5 * S.beat;
	placeArm(L, V(.5, 1.22, .3), V(.74, 1.42, .52), V(.9, 1.28, .6), stroke(T.hat, t, .55));
	if (useCrash) placeArm(R, V(-.5, 1.22, .3), V(-.95, 1.95, .35), V(-1.2, 2.1, .25), crashH);
	else placeArm(R, V(-.5, 1.22, .3), V(-.6, 1.32, .55), V(-.8, 1.14, .66), stroke(T.snare, t, 1));
	// instruments react
	hatTop.position.y = .055 + .01 * env(T.hat, t, .05); hat.rotation.z = wobble(T.hat, t, .04, .12, 7);
	sHead.scale.set(1 + .03 * sEnv, .98, 1 + .03 * sEnv); snare.position.y = 1.06 - .015 * sEnv;
	kHead.scale.set(1 + .035 * kEnv, 1, 1 + .035 * kEnv); kick.position.z = 1.05 + .02 * kEnv;
	crash.rotation.x = .35 + wobble(T.crash, t, .25, .7, 3.2); crash.rotation.z = .25 + wobble(T.crash, t, .12, .7, 2.4);
	// tail: a chain that follows a sway with lag along its length
	{ const pts = []; for (let i = 0; i < 10; i++) { const k = i / 9, sw = .35 * Math.sin(Math.PI * ph * .5 - k * 1.6) * k; pts.push(V(.45 + k * .5 + sw * .2, .5 + k * .95 - k * k * .25, -.4 - k * .18 + sw * .25)); }
		tail.geometry.dispose(); tail.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .085, 16, false); }

	// camera: a slow push-in
	const ct = clamp(t / S.dur);
	camera.position.set(-.35 + .5 * ct, 1.85, 6.9 - .9 * ct); camera.lookAt(0, 1.32, .3);
	renderer.render(scene, camera);
	return true;
};
window.READY = true;
