// ep38 v2 style frames for the three new example scenes (not part of the film): view(0) game 5v3, view(1) ants, view(2) business map
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
import {clone as skClone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {renderer, camera, draw, setGrade, toScreen, A, W, H} from './engine';

const hud = document.getElementById('hud')!;
const gl = new GLTFLoader();
const tex = async (f: string, srgb: boolean, rep: number) => { const t = await new THREE.TextureLoader().loadAsync(A(f)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const fit = (o: THREE.Object3D, size: number, along: 'y' | 'xz' = 'y') => { o.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(o); const s = bb.getSize(new THREE.Vector3()); const k = size / (along === 'y' ? s.y : Math.max(s.x, s.z)); o.scale.multiplyScalar(k); o.updateMatrixWorld(true); const bb2 = new THREE.Box3().setFromObject(o); const c = bb2.getCenter(new THREE.Vector3()); o.position.x -= c.x; o.position.z -= c.z; o.position.y -= bb2.min.y; return o; };
const label = (x: number, y: number, html: string, size = 44) => hud.insertAdjacentHTML('beforeend', `<div class="lbl" style="left:${x}px;top:${y}px;transform:translate(-50%,-50%);font-size:${size}px">${html}</div>`);
const hp = (p: {x: number; y: number}, k: number, col: string) => hud.insertAdjacentHTML('beforeend', `<div style="position:absolute;left:${p.x - 46}px;top:${p.y}px;width:92px;height:11px;background:rgba(10,10,14,.75);border:2px solid rgba(0,0,0,.8);border-radius:3px"><div style="width:${k * 100}%;height:100%;background:${col};box-shadow:0 0 8px ${col}"></div></div>`);

(async () => {
	const sky = await new RGBELoader().loadAsync(A('v2/polyhaven/kloofendal_48d_partly_cloudy_puresky_2k.hdr')); sky.mapping = THREE.EquirectangularReflectionMapping;
	const env = new THREE.PMREMGenerator(renderer).fromEquirectangular(sky).texture;
	renderer.shadowMap.enabled = true;

	// ---------------- A: game arena, 5 v 3
	const sA = new THREE.Scene(); sA.background = sky; sA.environment = env; sA.environmentIntensity = 0.6; sA.backgroundIntensity = 0.7; sA.fog = new THREE.Fog('#2a2430', 30, 90);
	const [cd, cn, cr] = await Promise.all([tex('v2/polyhaven/cobblestone_floor_07/textures/cobblestone_floor_07_diff_2k.jpg', true, 10), tex('v2/polyhaven/cobblestone_floor_07/textures/cobblestone_floor_07_nor_gl_2k.jpg', false, 10), tex('v2/polyhaven/cobblestone_floor_07/textures/cobblestone_floor_07_rough_2k.jpg', false, 10)]);
	cd.repeat.set(4, 4); cn.repeat.set(4, 4); cr.repeat.set(4, 4);
	const plaza = new THREE.Mesh(new THREE.CircleGeometry(10, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({map: cd, normalMap: cn, roughnessMap: cr, color: '#a89c90'})); plaza.position.y = 0.02; plaza.receiveShadow = true; sA.add(plaza);
	const [gd, gn] = await Promise.all([tex('ground_diff.jpg', true, 18), tex('ground_nor.jpg', false, 18)]);
	const grass = new THREE.Mesh(new THREE.CircleGeometry(80, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({map: gd, normalMap: gn, color: '#9fae7a'})); grass.receiveShadow = true; sA.add(grass);
	const rim = new THREE.Mesh(new THREE.TorusGeometry(10, 0.35, 10, 96).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({color: '#7d7468', roughness: 0.9})); rim.position.y = 0.1; rim.receiveShadow = rim.castShadow = true; sA.add(rim);
	const RA = (() => { let s = 3; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
	for (let i = 0; i < 26; i++) { const a = RA() * Math.PI * 2, d = 16 + RA() * 18, h = 3 + RA() * 4; const t = new THREE.Mesh(new THREE.IcosahedronGeometry(h * 0.45, 1), new THREE.MeshStandardMaterial({color: new THREE.Color().setHSL(0.27 + RA() * 0.05, 0.35, 0.22 + RA() * 0.08), roughness: 1, flatShading: true})); t.position.set(Math.cos(a) * d, h * 0.75, Math.sin(a) * d); t.castShadow = true; sA.add(t);
		const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, h * 0.6, 6), new THREE.MeshStandardMaterial({color: '#4a3424'})); tr.position.set(t.position.x, h * 0.3, t.position.z); sA.add(tr); }
	const sunA = new THREE.DirectionalLight('#ffd9b0', 3.2); sunA.position.set(-10, 18, -8); sunA.castShadow = true; sunA.shadow.mapSize.set(2048, 2048); Object.assign(sunA.shadow.camera, {left: -20, right: 20, top: 20, bottom: -20}); sA.add(sunA, new THREE.HemisphereLight('#c8d4ff', '#3a2a20', 0.5));
	const names = ['Knight', 'Barbarian', 'Mage', 'Rogue', 'Rogue_Hooded'];
	const chars = await Promise.all(names.map((n) => gl.loadAsync(A(`v2/kaykit/${n}.glb`))));
	const heroes: {o: THREE.Object3D; side: number; hp: number}[] = [];
	const place = (k: number, side: number, x: number, z: number, clip: string, t: number, hpK: number) => {
		const g = chars[k]; const o = skClone(g.scene); fit(o, 1.8); const wrap = new THREE.Group(); wrap.add(o); wrap.position.set(x, 0, z); wrap.rotation.y = side ? -Math.PI / 2 : Math.PI / 2; sA.add(wrap);
		o.traverse((m: any) => { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
		const mixer = new THREE.AnimationMixer(o); const c = g.animations.find((a) => a.name === clip) ?? g.animations[0]; mixer.clipAction(c).play(); mixer.setTime(t);
		const ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.95, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({color: side ? '#ff4a3a' : '#3a8bff', transparent: true, opacity: 0.9, toneMapped: false})); ring.position.set(x, 0.03, z); sA.add(ring);
		heroes.push({o: wrap, side, hp: hpK});
	};
	[[0, -4, -3, '1H_Melee_Attack_Chop', 0.4, 0.9], [1, -4.5, 0, '2H_Melee_Attack_Slice', 0.5, 0.7], [2, -7, -1.5, 'Spellcast_Shoot', 0.5, 1], [3, -6.5, 2.5, '1H_Ranged_Shoot', 0.3, 0.8], [4, -4, 3, 'Dualwield_Melee_Attack_Stab', 0.4, 0.95]].forEach(([k, x, z, c, t, h]) => place(k as number, 0, x as number, z as number, c as string, t as number, h as number));
	[[0, 2.5, -1.5, 'Block_Hit', 0.3, 0.35], [1, 2.8, 1.5, 'Hit_A', 0.2, 0.2], [2, 5.5, 0.2, 'Spellcast_Shoot', 0.4, 0.5]].forEach(([k, x, z, c, t, h]) => place(k as number, 1, x as number, z as number, c as string, t as number, h as number));
	const bolts = new THREE.Group(); sA.add(bolts);
	const bolt = (a: number[], b: number[], col: string) => { const p = new THREE.Vector3(...a).lerp(new THREE.Vector3(...b), 0.7); const s = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshBasicMaterial({color: new THREE.Color(col).multiplyScalar(4), toneMapped: false})); s.position.copy(p); bolts.add(s);
		const l = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, p.distanceTo(new THREE.Vector3(...a)), 8), new THREE.MeshBasicMaterial({color: new THREE.Color(col).multiplyScalar(2.5), transparent: true, opacity: 0.6, toneMapped: false})); l.position.copy(p.clone().add(new THREE.Vector3(...a)).multiplyScalar(0.5)); l.lookAt(p); l.rotateX(Math.PI / 2); bolts.add(l); };
	bolt([-7, 1.4, -1.5], [2.8, 1.2, 1.5], '#6ab0ff'); bolt([-6.5, 1.3, 2.5], [2.5, 1.2, -1.5], '#9fd0ff'); bolt([5.5, 1.4, 0.2], [-4.5, 1.2, 0], '#ff7a5a');

	// ---------------- B: ants on the forest floor (world ×100: 1 unit = 1 cm)
	const sB = new THREE.Scene(); sB.background = new THREE.Color('#1a1510'); sB.environment = env; sB.environmentIntensity = 0.5; sB.fog = new THREE.Fog('#2a2016', 60, 260);
	const [ff, antR, antB] = await Promise.all([gl.loadAsync(A('v2/models/forest_floor.glb')), gl.loadAsync(A('v2/models/ant_rig.glb')), gl.loadAsync(A('v2/models/ant_black.glb'))]);
	const ground = fit(ff.scene, 220, 'xz'); ground.traverse((m: any) => { if (m.isMesh) m.receiveShadow = true; }); sB.add(ground);
	const gb = new THREE.Box3().setFromObject(ground); const gy = (x: number, z: number) => { const r = new THREE.Raycaster(new THREE.Vector3(x, 200, z), new THREE.Vector3(0, -1, 0)); const h = r.intersectObject(ground, true)[0]; return h ? h.point.y : gb.min.y + (gb.max.y - gb.min.y) * 0.5; };
	const sunB = new THREE.DirectionalLight('#ffd2a0', 3.4); sunB.position.set(-60, 90, -40); sunB.castShadow = true; sunB.shadow.mapSize.set(2048, 2048); Object.assign(sunB.shadow.camera, {left: -80, right: 80, top: 80, bottom: -80, far: 400}); sB.add(sunB, new THREE.HemisphereLight('#c0d0ff', '#2a1a10', 0.4));
	const R = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
	const antTpl = fit(skClone(antR.scene), 1.4, 'xz'), antTplB = fit(antB.scene.clone(), 1.5, 'xz');
	const mkAnt = (side: number, x: number, z: number, ry: number) => { const src = side ? antTplB : antTpl; const o = side ? src.clone() : skClone(src); const w = new THREE.Group(); w.add(o); w.position.set(x, gy(x, z) + 0.05, z); w.rotation.y = ry; sB.add(w);
		o.traverse((m: any) => { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
		if (!side && antR.animations[0]) { const mx = new THREE.AnimationMixer(o); mx.clipAction(antR.animations[0]).play(); mx.setTime(R() * antR.animations[0].duration); } };
	for (let i = 0; i < 90; i++) { const x = -12 - R() * 40 + (R() - 0.5) * 6, z = (R() - 0.5) * 70; mkAnt(0, x, z, Math.PI / 2 + (R() - 0.5) * 0.8); }
	for (let i = 0; i < 45; i++) { const x = 6 + R() * 30, z = (R() - 0.5) * 60; mkAnt(1, x, z, -Math.PI / 2 + (R() - 0.5) * 0.8); }
	for (let i = 0; i < 26; i++) { const z = (R() - 0.5) * 50; mkAnt(0, -4 + R() * 3, z, Math.PI / 2 + (R() - 0.5) * 1.6); mkAnt(1, -1 + R() * 3, z + (R() - 0.5) * 2, -Math.PI / 2 + (R() - 0.5) * 1.6); }

	// ---------------- C: a city from above, one district lit
	const sC = new THREE.Scene(); sC.background = sky; sC.environment = env; sC.environmentIntensity = 0.7; sC.backgroundIntensity = 0.5; sC.fog = new THREE.Fog('#241c22', 750, 1500); sC.background = new THREE.Color('#241c22'); const under = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({color: '#2a2228', roughness: 1})); under.position.y = 2; sC.add(under);
	const os = await gl.loadAsync(A('v2/models/osaka.glb')); const city = fit(os.scene, 1200, 'xz'); sC.add(city);
	const sunC = new THREE.DirectionalLight('#ffcf9a', 2.4); sunC.position.set(-400, 300, -300); sC.add(sunC, new THREE.HemisphereLight('#d8e0ff', '#40302a', 0.5));
	const dome = (x: number, z: number, r: number, col: string, a: number) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 160, 48, 1, true), new THREE.MeshBasicMaterial({color: new THREE.Color(col).multiplyScalar(1.6), transparent: true, opacity: a, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false})); m.position.set(x, 80, z); sC.add(m);
		const d = new THREE.Mesh(new THREE.CircleGeometry(r, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({color: new THREE.Color(col).multiplyScalar(1.4), transparent: true, opacity: a * 0.8, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false})); d.position.set(x, 30, z); sC.add(d); };
	dome(-120, 60, 110, '#3a8bff', 0.32);
	[[260, -200], [330, 150], [120, 330], [-330, -260], [40, -380], [400, -20]].forEach(([x, z]) => dome(x, z, 34, '#ff4a3a', 0.28));

	(window as any).view = (v: number) => {
		hud.innerHTML = '';
		if (v === 0) { camera.position.set(-0.5, 6.2, 11.5); camera.up.set(0, 1, 0); camera.lookAt(-0.5, 0.9, -0.2); camera.fov = 40; camera.updateProjectionMatrix(); setGrade({vig: 0.45, warm: 0.04, bloom: 0.6, exposure: 0.8}); draw(sA);
			heroes.forEach((h) => { const p = toScreen([h.o.position.x, 2.45, h.o.position.z]); hp(p, h.hp, h.side ? '#ff5a47' : '#4aa0ff'); });
			label(W / 2, 110, '<span style="color:#8fb6ff">5</span> 打 <span style="color:#ff8a7a">3</span>', 96); }
		if (v === 1) { camera.position.set(-38, 9, -40); camera.up.set(0, 1, 0); camera.lookAt(-4, 1, 2); camera.fov = 34; camera.updateProjectionMatrix(); setGrade({vig: 0.55, warm: 0.06, bloom: 0.45, exposure: 0.75}); draw(sB); }
		if (v === 2) { camera.position.set(-520, 820, -600); camera.up.set(0, 1, 0); camera.lookAt(-80, 0, 30); camera.fov = 36; camera.updateProjectionMatrix(); setGrade({vig: 0.6, warm: 0.12, bloom: 0.7, exposure: 0.62}); draw(sC);
			const p = toScreen([-120, 170, 60]); label(p.x, p.y - 30, '只打这一片', 56); }
	};
	(window as any).READY = true;
})().catch((e) => console.error('BOOT', e?.message || e, e?.stack));
