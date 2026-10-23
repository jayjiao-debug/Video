// ground shader check page (not part of the film)
import {loadAssets, makeLand, camera, renderer} from './engine';
(async () => { const a = await loadAssets(); const land = makeLand(a); land.scene.traverse((o: any) => { if (o.isInstancedMesh) o.visible = false; }); land.sun.castShadow = false;
	camera.position.set(-140, 640, -620); camera.lookAt(-130, 0, -20); camera.updateProjectionMatrix();
	const gl = renderer.getContext(); renderer.render(land.scene, camera); console.log('GLERR', gl.getError());
	(window as any).READY = true; })().catch((e) => console.error('BOOT', e?.message || e));
