/* 《身体里住着两个人》 v3 key frames for the new everyday metaphors:
   ① accounts on a phone  ③ a video out of sync  ⑥ you can't tickle yourself / the "me" tag  ⑦ misheard lyrics  ⑧ broken vs out of balance.
   Each scene sits far from the others; build*() returns { g, cam }. Everything code-drawn. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { M, add, canvasTex, rng } from './Sets3D';
import { shellMat } from './Know3D';
import { glowSprite } from './Set';
import { floorTex } from './PuppetTest';
import { SANS, SERIF, GOLD } from './lib';

/* a floating text sign: big title + optional subtitle, crisp, unlit */
export const sign = (title: string, sub: string, col: string, w: number, h = w * 0.3, size = 120) => {
  const cw = 1600, ch = Math.round((cw * h) / w); const { g: c, tex } = canvasTex(cw, ch);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `900 ${size}px ${SANS}`; c.fillStyle = col; c.shadowColor = 'rgba(0,0,0,.8)'; c.shadowBlur = 18; c.fillText(title, cw / 2, sub ? ch * 0.36 : ch / 2);
  if (sub) { c.font = `700 ${Math.round(size * 0.72)}px ${SANS}`; c.fillStyle = '#e9e1d2'; c.fillText(sub, cw / 2, ch * 0.76); }
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false }));
};
const room = (g: THREE.Group, floor = '#3a3129', wall = '#211d1a') => {
  const ft = floorTex(); ft.repeat.set(3, 3); add(g, new THREE.PlaneGeometry(14, 14).rotateX(-Math.PI / 2), M({ map: ft, color: floor, roughness: 0.6 }), 0, 0, 0, false);
  const wl = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 7, 64, 1, true, Math.PI * 0.55, Math.PI * 0.9), M({ color: wall, roughness: 0.95, side: THREE.BackSide })); wl.position.set(0, 3.5, 1); wl.receiveShadow = true; g.add(wl);
};
const lights = (g: THREE.Group, target: THREE.Vector3, warm = '#ffe2bf') => {
  g.add(new THREE.HemisphereLight('#8a9bb0', '#141110', 0.5));
  const key = new THREE.SpotLight(warm, 70, 0, 0.6, 0.6, 2); key.position.set(target.x + 1.4, target.y + 2.4, target.z + 2.2); key.target.position.copy(target); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0005; g.add(key, key.target);
  const rim = new THREE.SpotLight('#8fb2d6', 40, 0, 0.7, 0.7, 2); rim.position.set(target.x - 1.8, target.y + 2, target.z - 1.6); rim.target.position.copy(target); g.add(rim, rim.target);
};

/* a posable mannequin: shoulder and elbow pivots, so an arm can reach */
export const posable = (shell: THREE.Material = shellMat()) => {
  const root = new THREE.Group(); const torso = new THREE.Group(); torso.position.y = 1.0; root.add(torso);
  const prof = [[0.0, -0.12], [0.13, -0.12], [0.135, -0.02], [0.125, 0.08], [0.145, 0.2], [0.17, 0.3], [0.178, 0.38], [0.165, 0.43], [0.12, 0.465], [0.055, 0.485], [0.0, 0.49]].map(([r, y]) => new THREE.Vector2(r, y));
  const tg = new THREE.LatheGeometry(prof, 48); tg.scale(1, 1, 0.6); const tm = new THREE.Mesh(tg, shell); tm.castShadow = true; torso.add(tm);
  const hips = new THREE.Mesh(new THREE.SphereGeometry(0.135, 24, 16), shell); hips.scale.set(1, 0.7, 0.66); hips.position.y = -0.12; torso.add(hips);
  const arms: { sh: THREE.Group; el: THREE.Group; hand: THREE.Object3D }[] = [];
  for (const sx of [-1, 1]) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.058, 24, 16), shell); ball.position.set(sx * 0.17, 0.405, 0); torso.add(ball);
    const sh = new THREE.Group(); sh.position.set(sx * 0.2, 0.39, 0); torso.add(sh);
    const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.24, 8, 16), shell); up.position.y = -0.155; up.castShadow = true; sh.add(up);
    const el = new THREE.Group(); el.position.y = -0.31; sh.add(el); el.add(new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 12), shell));
    const fo = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.22, 8, 16), shell); fo.position.y = -0.14; fo.castShadow = true; el.add(fo);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), shell); hand.scale.set(0.75, 1.25, 0.5); hand.position.y = -0.3; el.add(hand);
    arms.push({ sh, el, hand });
    for (const [y, r, h] of [[-0.42, 0.06, 0.36], [-0.82, 0.045, 0.36]] as const) { const lg = new THREE.Mesh(new THREE.CapsuleGeometry(r, h, 8, 16), shell); lg.position.set(sx * 0.075, y, 0); lg.castShadow = true; torso.add(lg); }
  }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.046, 0.1, 24), shell); neck.position.y = 0.52; torso.add(neck);
  const head = new THREE.Group(); head.position.y = 0.565; torso.add(head);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.1, 40, 30), shell); hd.scale.set(0.76, 1.14, 0.88); hd.position.y = 0.1; hd.castShadow = true; head.add(hd);
  return { root, torso, head, arms };
};
const feather = () => { const { g: c, tex } = canvasTex(128, 512); c.strokeStyle = '#d9cfbf'; c.lineWidth = 4; c.beginPath(); c.moveTo(64, 500); c.quadraticCurveTo(70, 250, 60, 10); c.stroke();
  for (let i = 0; i < 90; i++) { const y = 30 + i * 5; const wv = Math.sin((y / 512) * Math.PI) * 52; c.strokeStyle = `rgba(250,246,238,${0.7 + 0.3 * Math.random()})`; c.lineWidth = 2; c.beginPath(); c.moveTo(64, y); c.lineTo(64 - wv, y - 14); c.moveTo(64, y); c.lineTo(64 + wv * 0.8, y - 12); c.stroke(); }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.38), new THREE.MeshStandardMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, roughness: 0.9 })); return m; };

/* ================================================================== ① two phones */
export const buildPhones = (X: number) => {
  const g = new THREE.Group(); g.position.x = X; room(g);
  add(g, new THREE.BoxGeometry(2.4, 0.05, 1.1), M({ color: '#2b1d14', roughness: 0.4 }), 0, 0.75, 0);
  const screen = (draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) => { const { g: c, tex } = canvasTex(540, 1120); draw(c, 540, 1120); return new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }); };
  const phone = (x: number, mat: THREE.Material) => { const ph = new THREE.Group(); ph.position.set(x, 0.775 + 0.23, -0.05); ph.rotation.x = -0.22; g.add(ph);
    add(ph, new RoundedBoxGeometry(0.24, 0.5, 0.016, 4, 0.03), M({ color: '#111214', roughness: 0.25, metalness: 0.4 }), 0, 0, 0);
    add(ph, new THREE.PlaneGeometry(0.222, 0.464), mat, 0, 0, 0.0085, false);
    add(g, new THREE.BoxGeometry(0.12, 0.05, 0.06), M({ color: '#1a1a1a', roughness: 0.5 }), x, 0.8, 0.02); return ph; };
  phone(-0.42, screen((c, w, h) => { const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#1d2a3c'); bg.addColorStop(1, '#0e131c'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = `700 52px ${SANS}`; c.fillText('选择账号', w / 2, 170);
    [['A', '#7fb2ff', 380], ['B', '#f29a8a', 640], ['C', '#8fdcb0', 900]].forEach(([s, col, y]) => { c.fillStyle = col as string; c.beginPath(); c.arc(w / 2 - 120, y as number, 70, 0, 7); c.fill(); c.fillStyle = '#0e131c'; c.font = `900 72px ${SANS}`; c.fillText(s as string, w / 2 - 120, (y as number) + 26); c.fillStyle = '#fff'; c.font = `700 48px ${SANS}`; c.textAlign = 'left'; c.fillText(`账号 ${s}`, w / 2 - 20, (y as number) + 18); c.textAlign = 'center'; });
    c.fillStyle = 'rgba(255,255,255,.6)'; c.font = `500 36px ${SANS}`; c.fillText('轮流登录', w / 2, 1050); }));
  phone(0.42, screen((c, w, h) => { const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#2c2218'); bg.addColorStop(1, '#120e0a'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = `700 48px ${SANS}`; c.fillText('只有一个账号', w / 2, 150);
    const apps: [string, string, string][] = [['相机', '看见', '#7fb2ff'], ['麦克风', '听见', '#6fd6c2'], ['备忘录', '思考', '#f2c46d'], ['音乐', '感受', '#f29a8a']];
    apps.forEach(([a, b, col], i) => { const x = i % 2 ? w * 0.72 : w * 0.28, y = 360 + Math.floor(i / 2) * 330; c.fillStyle = col; c.beginPath(); c.roundRect(x - 90, y - 90, 180, 180, 40); c.fill();
      c.fillStyle = '#120e0a'; c.font = `900 48px ${SANS}`; c.fillText(b, x, y + 16); c.fillStyle = '#fff'; c.font = `600 36px ${SANS}`; c.fillText(a, x, y + 140);
      c.strokeStyle = '#ff5a3c'; c.lineWidth = 8; c.beginPath(); c.arc(x + 80, y - 80, 26, 0.3 + i, 4.2 + i); c.stroke(); });
    c.fillStyle = '#ff7a5a'; c.font = `700 40px ${SANS}`; c.fillText('各自卡顿 · 不同步', w / 2, 1050); }));
  const s1 = sign('多重人格', '好几个账号轮流登录', '#9cc3ff', 0.78); s1.position.set(-0.42, 1.48, -0.05); g.add(s1);
  const s1b = sign('（分离性身份障碍）', '', '#c9d4e2', 0.62, 0.1, 100); s1b.position.set(-0.42, 1.35, -0.05); g.add(s1b);
  const s2 = sign('精神分裂症', '一个账号，功能不同步', GOLD, 0.78); s2.position.set(0.42, 1.48, -0.05); g.add(s2);
  const ne = sign('≠', '', '#ff6a4a', 0.3, 0.3, 900); ne.position.set(0, 0.95, 0.0); g.add(ne);
  lights(g, new THREE.Vector3(0, 0.95, 0));
  return { g, cam: [X + 0.0, 1.2, 1.45, X + 0.0, 1.14, -0.05, 38] };
};

/* ================================================================== ③ a video whose four tracks drift apart */
export const buildTracks = (X: number) => {
  const g = new THREE.Group(); g.position.x = X; room(g, '#2a2420', '#151311');
  add(g, new THREE.BoxGeometry(2.4, 0.05, 1.0), M({ color: '#2b1d14', roughness: 0.4 }), 0, 0.75, 0.1);
  const mon = new THREE.Group(); mon.position.set(0, 1.25, -0.15); g.add(mon);
  add(mon, new RoundedBoxGeometry(1.36, 0.8, 0.04, 4, 0.015), M({ color: '#0d0d0f', roughness: 0.3, metalness: 0.3 }), 0, 0, 0);
  add(g, new THREE.BoxGeometry(0.06, 0.4, 0.06), M({ color: '#1a1a1c', metalness: 0.6, roughness: 0.4 }), 0, 0.95, -0.17); add(g, new THREE.BoxGeometry(0.4, 0.02, 0.25), M({ color: '#1a1a1c', metalness: 0.6, roughness: 0.4 }), 0, 0.785, -0.12);
  const { g: c, tex } = canvasTex(2048, 1170); const W2 = 2048, H2 = 1170;
  c.fillStyle = '#16181c'; c.fillRect(0, 0, W2, H2);
  /* the preview: a clapperboard snapping shut — the classic sync mark */
  c.fillStyle = '#0a0b0d'; c.fillRect(560, 40, 928, 520); const cx = 1024, cy = 330;
  c.save(); c.translate(cx - 220, cy - 40); c.fillStyle = '#e9e1d2'; c.fillRect(0, 0, 440, 230); c.fillStyle = '#16181c'; c.font = `900 56px ${SANS}`; c.textAlign = 'center'; c.fillText('第 1 场 · 第 1 条', 220, 140);
  c.save(); c.translate(0, -6); c.rotate(-0.05); for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#e9e1d2' : '#16181c'; c.fillRect(i * 74, -56, 74, 56); } c.restore(); c.restore();
  c.fillStyle = '#ffde7a'; c.font = `900 72px ${SANS}`; c.textAlign = 'center'; c.fillText('啪！', cx + 330, cy - 120);
  /* four tracks, each labelled with the part of the mind it stands for */
  const tracks: [string, string, string, number][] = [['画面', '看见', '#7fb2ff', 0], ['声音', '听见', '#6fd6c2', 230], ['字幕', '思考', '#f2c46d', -170], ['配乐', '感受', '#f29a8a', 120]];
  const PH = 1024; // playhead x
  tracks.forEach(([a, b, col, off], i) => { const y = 620 + i * 132; c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(0, y, W2, 112);
    c.textAlign = 'left'; c.fillStyle = col; c.font = `900 60px ${SANS}`; c.fillText(b, 30, y + 74); c.fillStyle = 'rgba(233,225,210,.7)'; c.font = `600 38px ${SANS}`; c.fillText(a, 180, y + 72);
    const x0 = 330 + off, x1 = 1860 + off; c.fillStyle = col; c.globalAlpha = 0.85; c.beginPath(); c.roundRect(Math.max(320, x0), y + 10, Math.min(W2, x1) - Math.max(320, x0), 92, 14); c.fill(); c.globalAlpha = 1;
    /* the sync mark on each track: where that track thinks the clap is */
    const mx = PH + off; c.fillStyle = '#16181c'; c.fillRect(mx - 6, y + 10, 12, 92);
    if (i === 1) { c.strokeStyle = '#16181c'; c.lineWidth = 4; c.beginPath(); for (let x = Math.max(320, x0); x < Math.min(W2, x1); x += 6) { const d = Math.abs(x - mx); const a2 = d < 40 ? 40 : 8 + 6 * Math.sin(x * 0.3); c.lineTo(x, y + 56 + Math.sin(x * 1.7) * a2); } c.stroke(); }
    if (i === 2) { c.fillStyle = '#16181c'; c.font = `700 40px ${SANS}`; c.fillText('“啪”', mx + 16, y + 70); } });
  c.fillStyle = '#ff3b30'; c.fillRect(PH - 4, 600, 8, 560); c.beginPath(); c.moveTo(PH - 22, 600); c.lineTo(PH + 22, 600); c.lineTo(PH, 630); c.fill();
  add(mon, new THREE.PlaneGeometry(1.32, 0.755), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), 0, 0, 0.021, false);
  const s = sign('本该一起播放的四条轨道，各播各的', '', '#f3ede2', 1.3, 0.12, 88); s.position.set(0, 1.72, -0.15); g.add(s);
  lights(g, new THREE.Vector3(0, 1.1, 0));
  const glow = new THREE.PointLight('#9fb8d8', 1.2, 2, 2); glow.position.set(0, 1.25, 0.4); g.add(glow);
  return { g, cam: [X + 0.25, 1.4, 1.95, X + 0.0, 1.38, -0.15, 34] };
};

/* ================================================================== ⑥a you can't tickle yourself */
export const buildTickle = (X: number) => {
  const g = new THREE.Group(); g.position.x = X; room(g);
  /* left: tickling yourself — the right hand reaches across to the left ribs */
  const a = posable(); a.root.position.set(-0.75, 0, 0); a.root.rotation.y = 0.15; g.add(a.root);
  { const R = a.arms[1]; R.sh.rotation.set(-0.55, 0, -0.35); R.el.rotation.set(-1.0, 0, -0.9); const f = feather(); f.position.set(0, -0.36, 0.04); f.rotation.set(0.2, 0, 1.7); R.el.add(f); }
  /* right: someone else tickles */
  const b = posable(); b.root.position.set(0.55, 0, 0); b.root.rotation.y = -0.2; g.add(b.root);
  const c2 = posable(); c2.root.position.set(1.05, 0, -0.15); c2.root.rotation.y = -1.2; g.add(c2.root);
  { const R = c2.arms[0]; R.sh.rotation.set(-1.25, 0, 0.1); R.el.rotation.set(-0.35, 0, 0); const f = feather(); f.position.set(0, -0.36, 0.0); f.rotation.set(-0.3, 0, -0.4); R.el.add(f); }
  const s1 = sign('自己挠自己', '不痒', '#9cc3ff', 1.3); s1.position.set(-0.75, 2.0, 0); g.add(s1);
  const s2 = sign('别人挠你', '痒！', '#ffbf69', 1.3); s2.position.set(0.75, 2.05, 0); g.add(s2);
  const s3 = sign('因为大脑提前知道：这是“我”自己在动', '', '#f3ede2', 1.8, 0.13, 100); s3.position.set(0, 0.62, 1.1); s3.rotation.x = 0; g.add(s3);
  lights(g, new THREE.Vector3(0, 1.2, 0));
  return { g, cam: [X + 0.0, 1.5, 3.7, X + 0.0, 1.32, 0, 40] };
};

/* ================================================================== ⑥b the "me" tag falls off a thought */
export const buildTag = (X: number) => {
  const g = new THREE.Group(); g.position.x = X; room(g, '#2c2620', '#171412');
  const m = posable(); m.root.rotation.y = 0.4; g.add(m.root);
  /* the thought: rings of sound inside the head, and the brass tag that says 我, now falling */
  const head = new THREE.Vector3(); m.root.updateMatrixWorld(true); m.head.getWorldPosition(head); head.sub(g.position); head.y += 0.1;
  for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.08 + i * 0.07, 0.006, 8, 48, Math.PI * 0.9), new THREE.MeshBasicMaterial({ color: '#7fd0ff', transparent: true, opacity: 0.9 - i * 0.2, toneMapped: false }));
    r.position.copy(head).add(new THREE.Vector3(-0.32, 0.02, 0.1)); r.rotation.set(0, 0.5, Math.PI * 0.55); g.add(r); }
  const tagTex = canvasTex(256, 160); { const c = tagTex.g; const b = c.createLinearGradient(0, 0, 256, 160); b.addColorStop(0, '#8a6a34'); b.addColorStop(0.5, '#d4b06a'); b.addColorStop(1, '#7a5c2c'); c.fillStyle = b; c.beginPath(); c.roundRect(4, 4, 248, 152, 24); c.fill(); c.fillStyle = '#2a1d0c'; c.font = `900 110px ${SANS}`; c.textAlign = 'center'; c.fillText('我', 150, 120); c.fillStyle = '#16120c'; c.beginPath(); c.arc(40, 80, 14, 0, 7); c.fill(); }
  const tag = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.125, 0.008, 2, 0.015), [M({ color: '#a8874a', metalness: 0.9, roughness: 0.3 }), M({ color: '#a8874a', metalness: 0.9, roughness: 0.3 }), M({ color: '#a8874a', metalness: 0.9, roughness: 0.3 }), M({ color: '#a8874a', metalness: 0.9, roughness: 0.3 }), M({ map: tagTex.tex, metalness: 0.7, roughness: 0.35 }), M({ color: '#a8874a', metalness: 0.9, roughness: 0.3 })]);
  tag.position.copy(head).add(new THREE.Vector3(0.3, -0.25, 0.3)); tag.rotation.set(0.1, -0.2, -0.5); g.add(tag);
  const str = new THREE.Line(new THREE.BufferGeometry().setFromPoints([head.clone().add(new THREE.Vector3(0.05, 0.0, 0.08)), tag.position.clone().add(new THREE.Vector3(-0.04, 0.02, 0))]), new THREE.LineDashedMaterial({ color: '#c9b48a', dashSize: 0.01, gapSize: 0.008 })); str.computeLineDistances(); g.add(str);
  const s1 = sign('自己心里的念头', '本来贴着“我”的标签', '#9cc3ff', 0.9); s1.position.set(-0.75, 1.95, 0); g.add(s1);
  const s2 = sign('标签掉了', '听起来就像别人在说话', '#ffbf69', 0.9); s2.position.set(0.8, 1.95, 0); g.add(s2);
  lights(g, new THREE.Vector3(0, 1.5, 0));
  const blue = new THREE.PointLight('#7fd0ff', 0.8, 1.2, 2); blue.position.copy(head).add(new THREE.Vector3(-0.3, 0, 0.2)); g.add(blue);
  return { g, cam: [X + 0.1, 1.72, 2.25, X + 0.0, 1.6, 0, 36] };
};

/* ================================================================== ⑦ the same noise, heard as three different things */
export const buildLyrics = (X: number) => {
  const g = new THREE.Group(); g.position.x = X; room(g, '#2a2420', '#14171b');
  /* a speaker on a stand, giving out one grey noise */
  add(g, new THREE.CylinderGeometry(0.03, 0.05, 1.0, 16), M({ color: '#1a1a1c', metalness: 0.6, roughness: 0.4 }), 0, 0.5, -1.6);
  const spk = add(g, new RoundedBoxGeometry(0.42, 0.56, 0.3, 4, 0.03), M({ color: '#1e1b18', roughness: 0.5 }), 0, 1.3, -1.6); void spk;
  const cone = (y: number, r: number) => { add(g, new THREE.CylinderGeometry(r, r * 0.4, 0.04, 40).rotateX(Math.PI / 2), M({ color: '#2c2a28', roughness: 0.7 }), 0, y, -1.44); add(g, new THREE.TorusGeometry(r, 0.01, 8, 40), M({ color: '#8a8580', metalness: 0.8, roughness: 0.3 }), 0, y, -1.445); };
  cone(1.42, 0.13); cone(1.17, 0.07);
  const noise = canvasTex(1024, 240); { const c = noise.g; const r = rng(3); c.strokeStyle = 'rgba(220,220,220,.9)'; c.lineWidth = 5; c.beginPath(); for (let x = 0; x < 1024; x += 4) { const y = 120 + (r() - 0.5) * 180 * Math.sin((x / 1024) * Math.PI); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  const nz = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.28), new THREE.MeshBasicMaterial({ map: noise.tex, transparent: true, toneMapped: false, depthWrite: false })); nz.position.set(0, 2.3, -1.6); g.add(nz);
  const ns = sign('同一段听不清的声音', '', '#e8e8e8', 1.8, 0.18, 110); ns.position.set(0, 2.62, -1.6); g.add(ns);
  /* three listeners from the three cities, each hearing it as something familiar */
  const L: [number, string, string, string][] = [[-1.0, '加州', '“我要伤害你”', '#ff5a3c'], [0, '金奈', '“记得按时吃饭”', '#ffbf69'], [1.0, '阿克拉', '“你会好起来的”', '#8fdcb0']];
  L.forEach(([x, city, quote, col]) => { const m = posable(); m.root.position.set(x * 1.15, 0, 0.4); m.root.rotation.y = Math.PI - Math.atan2(x, 2.0) * 0.8; g.add(m.root);
    const { g: c, tex } = canvasTex(900, 420); c.fillStyle = 'rgba(12,14,18,.9)'; c.beginPath(); c.roundRect(10, 10, 880, 330, 40); c.fill(); c.strokeStyle = col; c.lineWidth = 8; c.beginPath(); c.roundRect(10, 10, 880, 330, 40); c.stroke();
    c.fillStyle = 'rgba(12,14,18,.9)'; c.beginPath(); c.moveTo(400, 338); c.lineTo(450, 410); c.lineTo(500, 338); c.fill(); c.textAlign = 'center'; c.fillStyle = col; c.font = `900 80px ${SANS}`; c.fillText(city + '的人听成', 450, 120); c.fillStyle = '#f3ede2'; c.font = `900 88px ${SANS}`; c.fillText(quote, 450, 260);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.38), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false })); b.position.set(x * 1.15, 1.98, 0.5); g.add(b); });
  lights(g, new THREE.Vector3(0, 1.2, -0.4));
  return { g, cam: [X + 0.0, 2.3, 3.6, X + 0.0, 1.55, -0.6, 42] };
};

/* ================================================================== ⑧ broken vs out of balance */
export const buildBalance = (X: number) => {
  const g = new THREE.Group(); g.position.x = X; room(g);
  const ped = M({ color: '#141210', roughness: 0.45 });
  for (const x of [-0.75, 0.75]) add(g, new THREE.BoxGeometry(0.6, 0.9, 0.5), ped, x, 0.45, 0);
  /* left: a white bowl in two halves — what "分裂" sounds like */
  const pts: THREE.Vector2[] = []; for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI * 0.5; pts.push(new THREE.Vector2(0.02 + Math.sin(a) * 0.17, (1 - Math.cos(a)) * 0.13)); }
  const china = M({ color: '#eceae4', roughness: 0.18, side: THREE.DoubleSide });
  for (const [s, ang] of [[-1, 0.25], [1, -0.18]] as const) { const half = new THREE.Mesh(new THREE.LatheGeometry(pts, 32, s < 0 ? 0 : Math.PI, Math.PI), china); half.position.set(-0.75 + s * 0.09, 0.9 + 0.005, 0); half.rotation.set(0, 0, ang); half.castShadow = true; g.add(half); }
  /* right: a balance, tipped a little — what "失调" sounds like: out of balance, can be set right */
  const brass = M({ color: '#c9a35c', metalness: 0.95, roughness: 0.3 });
  add(g, new THREE.CylinderGeometry(0.1, 0.12, 0.03, 32), brass, 0.75, 0.915, 0); add(g, new THREE.CylinderGeometry(0.012, 0.012, 0.5, 16), brass, 0.75, 1.17, 0);
  const beam = new THREE.Group(); beam.position.set(0.75, 1.42, 0); beam.rotation.z = -0.16; g.add(beam);
  add(beam, new THREE.BoxGeometry(0.56, 0.012, 0.02), brass, 0, 0, 0);
  for (const s of [-1, 1]) { const y = 0; const pan = new THREE.Group(); pan.position.set(s * 0.27, y, 0); beam.add(pan); pan.rotation.z = 0.16;
    for (const a of [0, 2.1, 4.2]) add(pan, new THREE.CylinderGeometry(0.0015, 0.0015, 0.2, 4), brass, Math.cos(a) * 0.05, -0.1, Math.sin(a) * 0.05);
    add(pan, new THREE.CylinderGeometry(0.075, 0.06, 0.012, 32), brass, 0, -0.2, 0); }
  const s1 = sign('“分裂”', '听起来像碎了、修不好', '#ff8a6a', 0.95); s1.position.set(-0.75, 1.78, 0); g.add(s1);
  const s2 = sign('“失调”', '像内分泌失调：可以调回来', GOLD, 0.95); s2.position.set(0.75, 1.78, 0); g.add(s2);
  const s3 = sign('所以日本、韩国、台湾，把名字改成了“失调”', '', '#f3ede2', 1.9, 0.13, 100); s3.position.set(0, 0.32, 0.5); s3.rotation.x = -0.45; g.add(s3);
  lights(g, new THREE.Vector3(0, 1.2, 0));
  return { g, cam: [X + 0.0, 1.45, 2.45, X + 0.0, 1.32, 0, 36] };
};

export const KEY_SCENES = [buildPhones, buildTracks, buildTickle, buildTag, buildLyrics, buildBalance];
void SERIF; void glowSprite;
