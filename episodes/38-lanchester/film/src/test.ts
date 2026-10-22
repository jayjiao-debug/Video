// pose check page: every soldier pose, hi and lo, from three sides (not part of the film)
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {renderer, camera, soldierPoses, POSE_NAMES, MUZZLE, A} from './engine';
(async () => {
	const gl = new GLTFLoader(); const [hi, lo] = await Promise.all([gl.loadAsync(A('soldier.glb')), gl.loadAsync(A('soldier_lo.glb'))]);
	const H = soldierPoses(hi.scene), L = soldierPoses(lo.scene);
	const scene = new THREE.Scene(); scene.background = new THREE.Color('#8a9aa8');
	scene.add(new THREE.HemisphereLight('#ffffff', '#555544', 2.2)); const d = new THREE.DirectionalLight('#fff', 2.5); d.position.set(3, 6, 5); scene.add(d);
	const g = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({color: '#6a6a50'})); g.rotateX(-Math.PI / 2); scene.add(g);
	const lane = (x: number) => { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 3), new THREE.MeshBasicMaterial({color: '#222'})); w.rotateX(-Math.PI / 2); w.position.set(x, 0.01, 1.5); scene.add(w); }; [0, 2.6, 5.2, 7.8].forEach(lane);
	POSE_NAMES.forEach((p, i) => { for (const [k, set] of [[0, H], [1, L]] as const) for (const part of set[p]) { const m = new THREE.Mesh(part.geo, part.mat); m.position.set(i * 2.6, 0, k * 4); scene.add(m); } });
	// muzzle markers
	const mk = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshBasicMaterial({color: 'red'})); mk.position.set(2.6, MUZZLE.y, MUZZLE.fwd); scene.add(mk);
	(window as any).view = (v: number, i: number, k = 0) => {
		const cx = i * 2.6, cz = k * 4; const views = [[3.2, 1.5, 0.6], [-2.2, 1.7, 2.6], [0.3, 1.6, 3.6], [-0.4, 1.9, -2.6]]; const p = views[v];
		camera.position.set(cx + p[0], p[1], cz + p[2]); camera.up.set(0, 1, 0); camera.lookAt(cx, 1.15, cz + 0.55); camera.fov = 42; camera.updateProjectionMatrix();
		renderer.toneMappingExposure = 1; renderer.render(scene, camera);
	};
	console.log('MUZZLE', JSON.stringify(MUZZLE));
	(window as any).READY = true;
})().catch((e) => console.error('BOOT', e?.message || e, e?.stack));
