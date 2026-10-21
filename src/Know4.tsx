/* 《身体里住着两个人》 v3: the remaining explanation scenes in the same plain style —
   ① two case folders with ≠, ⑥ voices only one of two people hears, ⑩ one in three fully recovers. Everything code-drawn. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { M, add, canvasTex, herm, Key, beam } from './Sets3D';
import { posable, sign } from './Know2';
import { floorTex } from './PuppetTest';
import { ramp, eio, eo, SANS, GOLD } from './lib';

const at = (X: number, keys: Key[]): Key[] => keys.map(([t, a, b, c, d, e, f, fov]) => [t, a + X, b, c, d + X, e, f, fov]);
const room = (g: THREE.Group, floor = '#3a3129', wall = '#1c1916') => {
  const ft = floorTex(); ft.repeat.set(3, 3); add(g, new THREE.PlaneGeometry(14, 14).rotateX(-Math.PI / 2), M({ map: ft, color: floor, roughness: 0.6 }), 0, 0, 0, false);
  const wl = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 7, 64, 1, true, Math.PI * 0.55, Math.PI * 0.9), M({ color: wall, roughness: 0.95, side: THREE.BackSide })); wl.position.set(0, 3.5, 1); wl.receiveShadow = true; g.add(wl);
};

/* ================================================================== ① two case folders: 分离性身份障碍 ≠ 精神分裂症 */
export const FOLD_X = 700;
export const buildFolders = (o: { t0: number; t1: number }) => {
  const g = new THREE.Group(); g.position.x = FOLD_X; room(g, '#2a221c', '#161311');
  add(g, new THREE.BoxGeometry(2.6, 0.05, 1.4), M({ color: '#2e2017', roughness: 0.38 }), 0, 0.75, 0);
  const folder = (x: number, rot: number, title: string, sub: string, en: string, col: string, people: number) => {
    const f = new THREE.Group(); f.position.set(x, 0.79, 0.05); f.rotation.y = rot; g.add(f);
    const { g: c, tex } = canvasTex(1024, 1300); const b = c.createLinearGradient(0, 0, 0, 1300); b.addColorStop(0, '#d9b97f'); b.addColorStop(1, '#c4a066'); c.fillStyle = b; c.fillRect(0, 0, 1024, 1300);
    c.fillStyle = 'rgba(90,60,25,.25)'; for (let i = 0; i < 300; i++) c.fillRect(Math.random() * 1024, Math.random() * 1300, 2, 2);
    c.fillStyle = '#f4ecdc'; c.fillRect(110, 140, 804, 420); c.strokeStyle = '#7a5a2c'; c.lineWidth = 6; c.strokeRect(110, 140, 804, 420);
    c.textAlign = 'center'; c.fillStyle = '#2a1d0c'; c.font = `900 96px ${SANS}`; c.fillText(title, 512, 290); c.font = `600 54px ${SANS}`; c.fillStyle = '#5a4020'; c.fillText(sub, 512, 380); c.font = `600 44px ${SANS}`; c.fillText(en, 512, 480);
    /* what it means, in pictures: several different people, or one person */
    for (let k = 0; k < people; k++) { const px = 512 + (k - (people - 1) / 2) * 190; const cc = people > 1 ? ['#5b7fb8', '#b8665b', '#6aa080'][k] : col; c.fillStyle = cc; c.beginPath(); c.arc(px, 760, 62, 0, 7); c.fill(); c.beginPath(); c.roundRect(px - 80, 840, 160, 240, 60); c.fill(); }
    c.font = `800 60px ${SANS}`; c.fillStyle = '#2a1d0c'; c.fillText(people > 1 ? '好几个“人”轮流出现' : '一个人，几种功能失调', 512, 1200);
    const tm = M({ map: tex, roughness: 0.85 });
    const body = add(f, new THREE.BoxGeometry(0.62, 0.012, 0.79), [M({ color: '#c8a46a' }), M({ color: '#c8a46a' }), tm, M({ color: '#b8945a' }), M({ color: '#c8a46a' }), M({ color: '#c8a46a' })] as unknown as THREE.Material, 0, 0, 0);
    body.geometry.rotateY(0); void body;
    const tab = add(f, new THREE.BoxGeometry(0.2, 0.012, 0.06), M({ color: col, roughness: 0.7 }), -0.12, 0, -0.42);  void tab;
    return f;
  };
  folder(-0.55, 0.1, '分离性身份障碍', '（俗称“多重人格”）', 'Dissociative Identity Disorder', '#7fb2ff', 3);
  folder(0.55, -0.1, '精神分裂症', '另一种病', 'Schizophrenia', '#f2c46d', 1);
  const ne = sign('≠', '', '#ff5a3c', 0.42, 0.42, 900); ne.position.set(0, 0.86, 0.05); ne.rotation.x = -Math.PI / 2 + 0.25; g.add(ne);
  g.add(new THREE.HemisphereLight('#6d7a8a', '#120e0b', 0.25));
  const lamp = new THREE.SpotLight('#ffe2b8', 0, 0, 0.62, 0.55, 2); lamp.position.set(0.2, 2.4, 0.5); lamp.target.position.set(0, 0.78, 0.05); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -0.0004; g.add(lamp, lamp.target);
  /* the lamp itself, top of frame */
  const shade = add(g, new THREE.ConeGeometry(0.16, 0.18, 32, 1, true), M({ color: '#1d2a22', roughness: 0.4, metalness: 0.5, side: THREE.DoubleSide }), 0.2, 2.42, 0.5, false); void shade;
  const keys = at(FOLD_X, [[o.t0, 0.0, 2.35, 1.25, 0.0, 0.78, 0.05, 40], [o.t1, 0.0, 2.0, 0.95, 0.0, 0.78, 0.0, 38]]);
  const update = (t: number) => { const k = ramp(t, o.t0, 0.06) * (1 - 0.3 * Math.max(0, Math.sin((t - o.t0) * 40)) * Math.exp(-(t - o.t0) * 8)); lamp.intensity = 70 * k;
    (ne.material as THREE.MeshBasicMaterial).opacity = ramp(t, o.t0 + 1.0, 0.3); ne.scale.setScalar(1 + 0.25 * (1 - eo(ramp(t, o.t0 + 1.0, 0.3)))); return herm(keys, t); };
  return { g, update };
};

/* ================================================================== ⑥ the voice only one of two people hears */
export const VOICE_X = 760;
export const buildVoices = (o: { t0: number; real: number; t1: number }) => {
  const g = new THREE.Group(); g.position.x = VOICE_X; room(g, '#2a2420', '#14171b');
  const bench = M({ color: '#2b1d14', roughness: 0.45 }); add(g, new THREE.BoxGeometry(1.5, 0.06, 0.45), bench, 0, 0.46, 0); for (const x of [-0.65, 0.65]) add(g, new THREE.BoxGeometry(0.06, 0.44, 0.4), bench, x, 0.22, 0);
  const a = posable(), b = posable(); a.root.position.set(-0.36, 0, 0.02); b.root.position.set(0.36, 0, 0.02); g.add(a.root, b.root);
  /* seated: lower the torso onto the bench and bend the legs forward */
  for (const m of [a, b]) { m.torso.position.y = 0.6; m.torso.children.forEach((ch) => { if (ch instanceof THREE.Mesh && ch.position.y < -0.3) { const lower = ch.position.y < -0.6; ch.rotation.x = lower ? 0 : Math.PI / 2; ch.position.z = lower ? 0.36 : 0.2; ch.position.y = lower ? -0.42 : -0.12; } });
    m.arms.forEach((ar) => { ar.sh.rotation.x = -0.35; ar.el.rotation.x = -0.6; }); }
  a.head.rotation.set(0.08, 0.25, 0.08);
  const head = new THREE.Vector3(); a.root.updateMatrixWorld(true); a.head.getWorldPosition(head); head.sub(g.position); head.y += 0.1;
  /* rings of sound around his head only */
  const rings = Array.from({ length: 5 }, (_, i) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.006, 8, 64), new THREE.MeshBasicMaterial({ color: '#8fd0ff', transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); r.position.copy(head); r.rotation.y = Math.PI / 2 + 0.3; g.add(r); return { r, i }; });
  const sA = sign('他听到了', '有人在说话', '#8fd0ff', 1.0); sA.position.set(-0.5, 1.78, 0.1); g.add(sA);
  const sB = sign('旁边的人', '什么也没听到', '#c9c2b6', 1.0); sB.position.set(0.55, 1.78, 0.1); g.add(sB);
  const sR = sign('对他来说，和真的声音一样', '', '#f3ede2', 1.5, 0.12, 100); sR.position.set(0, 0.95, 0.75); g.add(sR);
  g.add(new THREE.HemisphereLight('#7a8ba0', '#131110', 0.4));
  const key = new THREE.SpotLight('#ffe2bf', 60, 0, 0.6, 0.6, 2); key.position.set(1.2, 2.6, 2.0); key.target.position.set(0, 0.9, 0); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); g.add(key, key.target);
  const blue = new THREE.PointLight('#8fd0ff', 0, 1.4, 2); blue.position.copy(head).add(new THREE.Vector3(0, 0, 0.3)); g.add(blue);
  const keys = at(VOICE_X, [[o.t0, 0.0, 1.45, 3.3, 0.0, 1.3, 0, 38], [o.real, -0.1, 1.42, 2.8, -0.05, 1.32, 0, 36], [o.t1, -0.2, 1.4, 2.5, -0.15, 1.33, 0, 34]]);
  const update = (t: number) => {
    const on = ramp(t, o.t0 + 0.6, 0.6); const real = ramp(t, o.real, 0.8);
    rings.forEach(({ r, i }) => { const ph = ((t - o.t0) * 0.7 + i / 5) % 1; r.scale.setScalar(0.8 + ph * 3.2); (r.material as THREE.MeshBasicMaterial).opacity = on * (1 - ph) * (0.55 + 0.4 * real); (r.material as THREE.MeshBasicMaterial).color.set('#8fd0ff').lerp(new THREE.Color('#ffffff'), real * 0.4); });
    blue.intensity = 1.2 * on; (sA.material as THREE.MeshBasicMaterial).opacity = ramp(t, o.t0 + 0.8, 0.4); (sB.material as THREE.MeshBasicMaterial).opacity = ramp(t, o.t0 + 1.6, 0.4); (sR.material as THREE.MeshBasicMaterial).opacity = 0; void real;
    a.torso.position.y = 0.6 + 0.002 * Math.sin(t * 1.4); b.torso.position.y = 0.6 + 0.002 * Math.sin(t * 1.3 + 1);
    return herm(keys, t);
  };
  return { g, update };
};

/* ================================================================== ⑩ three people; on the hit one of them glows gold: at least 1 in 3 fully recover */
export const REC_X = 820;
export const buildRecovery = (o: { t0: number; hit: number; t1: number }) => {
  const g = new THREE.Group(); g.position.x = REC_X; room(g, '#30281f', '#1b1714');
  const goldM = new THREE.MeshPhysicalMaterial({ color: '#f1c56d', metalness: 0.9, roughness: 0.25, emissive: '#7a5414', emissiveIntensity: 0 });
  const ivory = new THREE.MeshPhysicalMaterial({ color: '#d8d2c8', roughness: 0.3, clearcoat: 0.7 });
  const people = [-0.75, 0, 0.75].map((x, i) => { const m = posable(i === 0 ? goldM : ivory); m.root.position.set(x, 0, 0); m.root.rotation.y = -x * 0.2; g.add(m.root); return m; });
  const spots = [-0.75, 0, 0.75].map((x) => { const s = new THREE.SpotLight('#ffe2b8', 0, 0, 0.16, 0.4, 2); s.position.set(x, 5, 0.6); s.target.position.set(x, 0, 0); s.castShadow = true; s.shadow.mapSize.set(1024, 1024); g.add(s, s.target); const b = beam('#ffd9a6', 5, 0.16, 0.05); b.mesh.position.set(x, 2.5, 0.3); g.add(b.mesh); return { s, b }; });
  const s1 = sign('至少 1/3', '能完全康复', GOLD, 1.2); s1.position.set(0, 2.22, 0); g.add(s1);
  const s2 = sign('世界卫生组织 WHO', '', '#c9c2b6', 1.0, 0.1, 100); s2.position.set(0, 1.99, 0); g.add(s2);
  g.add(new THREE.HemisphereLight('#8a96a6', '#141110', 0.3));
  const keys = at(REC_X, [[o.t0, 0.0, 1.8, 4.8, 0.0, 1.5, 0, 38], [o.t1, 0.0, 1.7, 4.2, 0.0, 1.55, 0, 36]]);
  const update = (t: number) => {
    const hit = eio(ramp(t, o.hit, 0.6));
    spots.forEach(({ s, b }, i) => { const on = ramp(t, o.t0 + 0.2 + i * 0.25, 0.1); s.intensity = (i === 0 ? 120 + 260 * hit : 120) * on; b.mat.uniforms.uI.value = (i === 0 ? 0.6 + 0.6 * hit : 0.5) * on; });
    goldM.emissiveIntensity = 0.9 * hit; goldM.color.set('#d8d2c8').lerp(new THREE.Color('#f1c56d'), hit); goldM.metalness = 0.9 * hit; goldM.roughness = 0.3 - 0.05 * hit;
    (s1.material as THREE.MeshBasicMaterial).opacity = ramp(t, o.hit + 0.1, 0.4); (s2.material as THREE.MeshBasicMaterial).opacity = ramp(t, o.hit + 0.4, 0.4);
    people.forEach((m, i) => { m.torso.position.y = 1.0 + 0.002 * Math.sin(t * 1.4 + i); });
    return herm(keys, t);
  };
  return { g, update };
};
void RoundedBoxGeometry;
