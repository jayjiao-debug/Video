// ep38 film entry: loads assets, builds the worlds, exposes window.renderAt(t) for the frame grabber.
import * as THREE from 'three';
import {loadAssets, makeLand, makeSea, Army, Puffs, GroundSquares, Tracers} from './engine';
import {TIMELINE, bar, type Ctx} from './timeline';
import {makeArena, makeCity} from './arena';

const hud = document.getElementById('hud')!, split = document.getElementById('split') as HTMLCanvasElement;
/** 孙子 written in light across the field: a ground decal whose characters appear one by one */
const sunziText = (scene: THREE.Scene) => {
	const cv = document.createElement('canvas'); cv.width = 4096; cv.height = 1024; const g = cv.getContext('2d')!; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
	const m = new THREE.Mesh(new THREE.PlaneGeometry(760, 190), new THREE.MeshBasicMaterial({map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}));
	m.rotation.x = -Math.PI / 2; m.rotation.z = Math.PI; m.position.set(0, 0.3, 170); m.visible = false; scene.add(m);
	const lines = ['我专为一，敌分为十，', '是以十攻其一也'];
	let last = -1;
	m.userData.reveal = (k: number) => {
		const n = Math.round(k * 17); if (n === last) return; last = n; g.clearRect(0, 0, cv.width, cv.height);
		g.font = '900 300px "Noto Serif CJK SC", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
		let left = n; lines.forEach((ln, i) => { const shown = ln.slice(0, Math.max(0, left)); left -= ln.length; g.shadowColor = 'rgba(255,190,90,0.9)'; g.shadowBlur = 60; g.fillStyle = i === 1 ? '#ffd27a' : '#fff1cf';
			const full = g.measureText(ln).width; g.textAlign = 'left'; g.fillText(shown, 2048 - full / 2, 300 + i * 420); });
		tex.needsUpdate = true;
	};
	return m;
};
(async () => {
	const a = await loadAssets();
	const land = makeLand(a), sea = makeSea(a); const [arena, city] = await Promise.all([makeArena(a.sky, a.env), makeCity(a.sky, a.env)]);
	const rings = [0, 1, 2].map(() => { const r = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.5, 48), new THREE.MeshBasicMaterial({color: '#ff6a5a', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide})); r.rotation.x = -Math.PI / 2; r.visible = false; land.scene.add(r); return r; });
	const ctx: Ctx = {
		a, land, sea, army: new Army(a, land.scene, 2100), arena, city, cityPts: (() => { const p = new Puffs(city.scene, 300, true); (p.pts.material as any).depthTest = false; return p; })(),
		smoke: new Puffs(land.scene, 14000, false), flash: new Puffs(land.scene, 2500, true), squares: new GroundSquares(land.scene, 16), tracers: new Tracers(land.scene, 2600), rings, text: sunziText(land.scene),
		seaSmoke: new Puffs(sea.scene, 16000, false, 30), seaFlash: new Puffs(sea.scene, 6000, true), hud, split,
	};
	const XF = 0.5, xfAt = [bar(31), bar(46)]; // dissolves where a held camera would otherwise swap the scene in one frame
	const sg = split.getContext('2d')!;
	(window as any).renderAt = (t: number) => {
		const i = TIMELINE.findIndex((s) => t >= s.a && t < s.b); const shot = TIMELINE[i < 0 ? TIMELINE.length - 1 : i];
		hud.innerHTML = ''; split.style.display = 'none';
		const u = t - shot.a; const xf = i > 0 && u < XF && xfAt.some((x) => Math.abs(x - shot.a) < 0.01);
		if (xf) { const prev = TIMELINE[i - 1]; prev.draw(ctx, prev.b - prev.a - 1 / 30, prev.b - 1 / 30); sg.clearRect(0, 0, 1920, 1080); sg.drawImage(document.getElementById('c') as HTMLCanvasElement, 0, 0); hud.innerHTML = ''; }
		shot.draw(ctx, u, t);
		if (xf) { const k = u / XF; split.style.display = 'block'; split.style.opacity = String(1 - k * k * (3 - 2 * k)); }
	};
	(window as any).DURATION = TIMELINE[TIMELINE.length - 1].b; (window as any).CTX = ctx;
	await document.fonts.load('900 300px "Noto Serif CJK SC"').catch(() => null);
	(window as any).READY = true;
})().catch((e) => { console.error('BOOT', e?.message || e, e?.stack); });
