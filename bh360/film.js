/* 《掉进黑洞》 360° compositor. Everything on screen is a pure function of the film time T.
   The ray-traced black-hole plate (equirect, scripts/bh.py) is the background; 小J, props, dust and HUD are real 3D
   objects around the viewer (camera at the origin, front = −Z = the black hole, +X = right, +Y = up).
   Output 1 (top canvas): the 4K equirect frame — the objects are rendered into a cube map and re-projected over the plate.
   Output 2 (bottom canvas): a flat 1080p "director" view for checking on a phone (a virtual camera that follows the action).
   window.renderAt(T) draws both; the driver screenshots them. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/RoundedBoxGeometry.js';

const Q = new URLSearchParams(location.search);
const EQW = +(Q.get('w') || 3840), EQH = EQW / 2, FW = 1920, FH = 1080, CUBE = +(Q.get('cube') || 2048), PLATES = Q.get('plates') || 'plates';
document.documentElement.style.setProperty('--eqh', EQH + 'px');
const SCHED = await (await fetch('sched.json')).json();
const VOICE = (await (await fetch('voice.json')).json()).lines;
await Promise.all(['600 40px "Cormorant Garamond"', 'italic 500 40px "Cormorant Garamond"', '700 40px JMono'].map((f) => document.fonts.load(f)));

/* ------------------------------------------------------------------ helpers */
const GOLD = '#f1c56d', INK = '#f3ede2', BLUE = '#8fb8ff', DIM = 'rgba(243,237,226,0.62)';
const SANS = '"Noto Sans CJK SC","Noto Sans SC",sans-serif', SERIF = '"Noto Serif CJK SC","Noto Serif SC",serif', MONO = 'JMono,monospace', LAT = '"Cormorant Garamond",Georgia,serif';
const TITLE = 8.473, BEAT = 60 / 117.94, FPS = SCHED.fps;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const prog = (t, a, z) => clamp((t - a) / (z - a));
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const backOut = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const D = Math.PI / 180;
const dir = (yaw, pitch) => new THREE.Vector3(Math.cos(pitch * D) * Math.sin(yaw * D), Math.sin(pitch * D), -Math.cos(pitch * D) * Math.cos(yaw * D));
const at = (yaw, pitch, dist) => dir(yaw, pitch).multiplyScalar(dist);
const rAt = (t) => { const i = clamp(t * FPS, 0, SCHED.r.length - 1.001), i0 = Math.floor(i), f = i - i0; return SCHED.r[i0] * (1 - f) + SCHED.r[i0 + 1] * f; };
const ORIGIN = new THREE.Vector3();
const HOLE = new THREE.Vector3(0, 0, -60);
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };

/** additive glow that leaves the alpha alone (so the plate under it is not darkened in the equirect composite) */
const setAdd = (m) => { m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = THREE.SrcAlphaFactor; m.blendDst = THREE.OneFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor; };
/** a plane carrying a 2D canvas; world width w (height from the canvas aspect) */
function canvasPlane(cw, ch, w, { additive = false, side = THREE.FrontSide } = {}) {
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, side });
  if (additive) setAdd(mat);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, (w * ch) / cw), mat);
  m.userData = { c, g, tex, key: null };
  return m;
}
/** redraw a canvas plane only when its state key changes */
const draw = (m, key, fn) => { if (m.userData.key === key) return; m.userData.key = key; const { g, c } = m.userData; g.clearRect(0, 0, c.width, c.height); fn(g, c.width, c.height); m.userData.tex.needsUpdate = true; };
const face = (m, pos) => { m.position.copy(pos); m.lookAt(ORIGIN); };

/* ------------------------------------------------------------------ scene, lights */
const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const diskLight = new THREE.DirectionalLight('#ffc98a', 2.2); diskLight.position.set(0, -2, -10); scene.add(diskLight); // the disk: warm rim from the front, below
const fill = new THREE.DirectionalLight('#fff3df', 1.7); fill.position.set(-0.6, 1.0, 0.2); scene.add(fill, fill.target); // from the viewer's side, up-left
const cool = new THREE.DirectionalLight('#8fb8ff', 0.9); cool.position.set(0, 4, 6); scene.add(cool);

/* ------------------------------------------------------------------ 小J (port of src/Bot3D.tsx) */
const faceCache = {};
function faceTex(e) {
  if (faceCache[e]) return faceCache[e];
  const c = document.createElement('canvas'); c.width = 512; c.height = 400; const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 400); grd.addColorStop(0, '#1a2034'); grd.addColorStop(1, '#070910');
  rr(g, 0, 0, 512, 400, 120); g.fillStyle = grd; g.fill();
  const col = e === 'red' ? '#ff6f55' : '#ffd27a';
  g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.shadowColor = col; g.shadowBlur = 26;
  const eye = (cx, kind) => {
    const cy = 190;
    switch (kind) {
      case 'blink': g.lineWidth = 22; g.beginPath(); g.moveTo(cx - 40, cy + 10); g.quadraticCurveTo(cx, cy + 26, cx + 40, cy + 10); g.stroke(); break;
      case 'happy': g.lineWidth = 24; g.beginPath(); g.moveTo(cx - 42, cy + 18); g.quadraticCurveTo(cx, cy - 46, cx + 42, cy + 18); g.stroke(); break;
      case 'squint': { g.lineWidth = 22; g.beginPath(); const s = cx < 256 ? 1 : -1; g.moveTo(cx - 34 * s, cy - 30); g.lineTo(cx + 30 * s, cy); g.lineTo(cx - 34 * s, cy + 30); g.stroke(); break; }
      case 'surprised': g.lineWidth = 20; g.beginPath(); g.arc(cx, cy, 44, 0, Math.PI * 2); g.stroke(); break;
      default: {
        const h = kind === 'worried' ? 92 : 112, w = 78, top = cy - h / 2 + (kind === 'worried' ? 14 : 0);
        rr(g, cx - w / 2, top, w, h, 39); g.fill();
        g.shadowBlur = 0; g.fillStyle = '#fffaf0';
        g.beginPath(); g.arc(cx + 14, top + 28, 13, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.arc(cx - 12, top + h - 30, 6, 0, Math.PI * 2); g.fill();
        g.fillStyle = col; g.shadowBlur = 26;
        if (kind === 'worried') { g.lineWidth = 16; g.beginPath(); const s = cx < 256 ? 1 : -1; g.moveTo(cx - 40 * s, top - 30); g.lineTo(cx + 34 * s, top - 14); g.stroke(); }
      }
    }
  };
  const L = e === 'wink' || e === 'red' ? 'open' : e, R = e === 'wink' ? 'happy' : e === 'red' ? 'open' : e;
  eye(170, L); eye(342, R);
  g.shadowBlur = 0; g.lineWidth = 14; g.strokeStyle = col;
  if (e === 'happy' || e === 'wink' || e === 'normal' || e === 'blink') { g.beginPath(); g.moveTo(232, 292); g.quadraticCurveTo(256, 316, 280, 292); g.stroke(); }
  if (e === 'surprised') { g.beginPath(); g.arc(256, 300, 14, 0, Math.PI * 2); g.fillStyle = col; g.fill(); }
  if (e === 'worried') { g.beginPath(); g.moveTo(236, 306); g.quadraticCurveTo(256, 290, 276, 306); g.stroke(); }
  g.fillStyle = 'rgba(255,140,120,0.35)';
  g.beginPath(); g.ellipse(112, 278, 40, 18, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(400, 278, 40, 18, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.07)'; rr(g, 40, 22, 230, 46, 23); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return (faceCache[e] = t);
}
function makeBot() {
  const G = new THREE.Group(), inner = new THREE.Group(); G.add(inner);
  const ivory = new THREE.MeshPhysicalMaterial({ color: '#f4eee3', roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const gold = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.85, roughness: 0.28, emissive: '#3a2608' });
  const dark = new THREE.MeshStandardMaterial({ color: '#2a2d38', roughness: 0.5 });
  const bulbM = new THREE.MeshStandardMaterial({ color: '#ffcf6a', emissive: '#e8a530', emissiveIntensity: 1.1, roughness: 0.3 });
  inner.add(new THREE.Mesh(new RoundedBoxGeometry(1, 0.94, 0.9, 8, 0.22), ivory));
  const w = 0.7, h = 0.56, r = 0.13, sh = new THREE.Shape();
  sh.moveTo(-w / 2 + r, -h / 2); sh.lineTo(w / 2 - r, -h / 2); sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); sh.lineTo(w / 2, h / 2 - r);
  sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); sh.lineTo(-w / 2 + r, h / 2); sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); sh.lineTo(-w / 2, -h / 2 + r); sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const bez = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 4, curveSegments: 16 }), gold);
  bez.position.set(0, 0.03, 0.43); inner.add(bez);
  const faceM = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.516), new THREE.MeshBasicMaterial({ map: faceTex('normal'), transparent: true, toneMapped: false }));
  faceM.position.set(0, 0.03, 0.4665); inner.add(faceM);
  { // back: the gold J
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.strokeStyle = GOLD; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 84, 0, Math.PI * 2); g.stroke();
    g.fillStyle = GOLD; g.font = 'italic bold 150px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('J', 122, 136);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false }));
    b.position.set(0, 0, -0.452); b.rotation.y = Math.PI; inner.add(b);
  }
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 40), gold); e.position.set(0.505 * s, 0.05, 0); e.rotation.z = Math.PI / 2; inner.add(e); }
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.26, 16), dark); ant.position.set(0.16, 0.6, 0); inner.add(ant);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.085, 32, 24), bulbM); bulb.position.set(0.16, 0.77, 0); inner.add(bulb);
  const hands = [-1, 1].map((s) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.07, 8, 20), ivory); m.userData.s = s; inner.add(m); return m; });
  const thr = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.08, 32), dark); thr.position.set(0, -0.52, 0); inner.add(thr);
  const gc = document.createElement('canvas'); gc.width = gc.height = 128; { const g = gc.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(160,210,255,0.7)'); gr.addColorStop(1, 'rgba(60,120,220,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
  const sm = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, toneMapped: false }); setAdd(sm);
  const flame = new THREE.Sprite(sm); inner.add(flame);
  return { G, inner, faceM, bulb, hands, flame };
}
const bot = makeBot(); scene.add(bot.G);
const BOT_SCALE = 0.46;
function poseBot(s) {
  bot.G.position.copy(s.pos);
  bot.G.lookAt(ORIGIN); const q0 = bot.G.quaternion.clone();
  if (s.look && s.lookK > 0) { bot.G.lookAt(s.look); bot.G.quaternion.copy(q0.slerp(bot.G.quaternion, s.lookK)); }
  bot.inner.rotation.set(s.tilt * 0.3, 0, s.tilt);
  bot.inner.scale.set(BOT_SCALE, BOT_SCALE * s.stretch, BOT_SCALE);
  bot.inner.position.y = s.bob;
  for (const m of bot.hands) { const hh = m.userData.s < 0 ? s.hl : s.hr, sg = m.userData.s; m.position.set(0.7 * sg, -0.12 + 0.36 * hh, 0.06); m.rotation.set(0, 0, -0.5 * sg * hh); }
  bot.faceM.material.map = faceTex(s.e); bot.faceM.scale.set(1 + 0.03 * s.talk, 1 - 0.07 * s.talk, 1);
  bot.bulb.scale.setScalar(1 + 0.35 * s.talk);
  bot.flame.position.set(0, -0.6 - 0.08 * s.flame, 0.05); bot.flame.scale.set(0.42 * (0.6 + 0.4 * s.flame), 0.42 * s.flame, 1);
}

/* ------------------------------------------------------------------ voice: typed bubbles in sync with the babble */
const talkAt = (T) => {
  let v = 0;
  for (const l of VOICE) { if (T < l.t - 0.1 || T > l.typed + 0.2) continue; for (let i = 0; i < l.reveal.length; i++) {
    if ('，。、？！…“”'.includes(l.text[i])) continue; const d = T - l.reveal[i]; if (d >= 0 && d < 0.09) v = Math.max(v, Math.sin((Math.PI * d) / 0.09)); } }
  return v;
};
const shown = (l, T) => { let n = 0; while (n < l.reveal.length && T >= l.reveal[n]) n++; return n; };
const BPX = 0.0019; // metres per bubble canvas pixel (at 2.5 m: 64 px type ≈ 2.8°)
const bubbles = VOICE.map((l) => {
  const g0 = document.createElement('canvas').getContext('2d'); g0.font = `700 64px ${SANS}`;
  const tw = Math.ceil(g0.measureText(l.text).width), cw = tw + 2 * 40 + 60, ch = 64 + 2 * 30 + 60;
  const m = canvasPlane(cw, ch, cw * BPX); m.userData.tw = tw; scene.add(m); m.visible = false; return m;
});
function poseBubble(T, botYaw, botPitch, side) {
  VOICE.forEach((l, i) => {
    const m = bubbles[i];
    const k = easeOut(prog(T, l.t - 0.12, l.t + 0.1)) * (1 - prog(T, l.end, l.end + 0.12));
    m.visible = k > 0.002; if (!m.visible) return;
    const n = shown(l, T);
    draw(m, `${n}|${side}`, (g, W, H) => {
      const x0 = side > 0 ? 60 : 0, y0 = 0, w = W - 60, h = H - 60;
      g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 30;
      rr(g, x0 + 3, y0 + 3, w - 6, h - 6, 40); g.fillStyle = 'rgba(12,14,24,0.92)'; g.fill(); g.restore();
      g.lineWidth = 4; g.strokeStyle = GOLD; rr(g, x0 + 3, y0 + 3, w - 6, h - 6, 40); g.stroke();
      // tail towards 小J (lower left when the bubble is on his right)
      g.beginPath(); if (side > 0) { g.moveTo(x0 + 40, h - 30); g.lineTo(6, H - 8); g.lineTo(x0 + 92, h - 4); } else { g.moveTo(x0 + w - 40, h - 30); g.lineTo(W - 6, H - 8); g.lineTo(x0 + w - 92, h - 4); }
      g.closePath(); g.fillStyle = 'rgba(12,14,24,0.92)'; g.fill(); g.stroke();
      g.fillStyle = 'rgba(12,14,24,1)'; g.fillRect(side > 0 ? x0 + 44 : x0 + w - 88, h - 9, 44, 8);
      g.font = `700 64px ${SANS}`; g.fillStyle = INK; g.textBaseline = 'middle'; g.fillText(l.text.slice(0, n), x0 + 40, y0 + h / 2 + 2);
    });
    const dist = 2.5, wdeg = (m.geometry.parameters.width / dist) / D;
    const pos = at(botYaw + side * (wdeg / 2 + 5.5), botPitch + 5.5, dist);
    face(m, pos);
    const s = lerp(0.85, 1, backOut(clamp(k))); m.scale.setScalar(s); m.material.opacity = k;
  });
}

/* ------------------------------------------------------------------ props */
// title card (front) and the dark veil behind it
const title = canvasPlane(2400, 1100, 8.6); face(title, at(0, 4, 7.2)); scene.add(title);
const veil = canvasPlane(256, 256, 22); face(veil, at(0, 2, 7.8)); scene.add(veil);
draw(veil, 'v', (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(3,4,8,0.72)'); gr.addColorStop(0.55, 'rgba(3,4,8,0.55)'); gr.addColorStop(1, 'rgba(3,4,8,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
function poseTitle(T) {
  const k = prog(T, TITLE - 0.05, TITLE + 0.2) * (1 - prog(T, 11.15, 11.65));
  title.visible = veil.visible = k > 0; if (!k) return;
  veil.material.opacity = easeOut(k); title.material.opacity = 1 - prog(T, 11.15, 11.65);
  const pour = TITLE + 0.3 + 2 * BEAT, chars = [...'《掉进黑洞》'];
  const q = (x) => Math.round(x * 40) / 40;
  const ks = chars.map((c, i) => { const a = TITLE + (i === 0 || i === 5 ? 0 : ((i - 1) * BEAT) / 2); return q(prog(T, a, a + 0.1)); });
  const po = T > pour, f = (a, b) => q(easeOut(prog(T, a, b)));
  draw(title, `${ks.join(',')}|${po}|${f(TITLE, TITLE + 0.3)}|${f(pour, pour + 0.3)}|${f(pour + 0.2, pour + 0.5)}|${f(pour + 0.3, pour + 0.6)}`, (g, W) => {
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.globalAlpha = f(TITLE, TITLE + 0.3); g.font = `600 60px ${LAT}`; g.letterSpacing = '19px'; g.fillStyle = GOLD; g.fillText('SCHWARZSCHILD · A FALL · 360°', W / 2, 170); g.letterSpacing = '0px';
    g.font = `900 300px ${SERIF}`;
    const widths = chars.map((c) => g.measureText(c).width), tot = widths.reduce((a, b) => a + b, 0); let x = W / 2 - tot / 2;
    chars.forEach((c, i) => {
      const kk = ks[i], cx = x + widths[i] / 2; x += widths[i]; if (!kk) return;
      g.save(); g.globalAlpha = kk; g.translate(cx, 500); const sc = 1 + 0.3 * (1 - easeOut(kk)); g.scale(sc, sc);
      if (po) { g.shadowColor = 'rgba(241,197,109,0.6)'; g.shadowBlur = 60; const gr = g.createLinearGradient(0, -260, 0, 40); gr.addColorStop(0, '#fbe3a6'); gr.addColorStop(0.55, GOLD); gr.addColorStop(1, '#c8913a'); g.fillStyle = gr; } else g.fillStyle = INK;
      g.fillText(c, 0, 0); g.restore();
    });
    g.globalAlpha = f(pour, pour + 0.3); g.font = `700 84px ${SANS}`; g.fillStyle = INK; g.fillText('如果你掉进黑洞，会看到什么？', W / 2, 700);
    g.globalAlpha = f(pour + 0.2, pour + 0.5); g.font = `italic 500 62px ${LAT}`; g.fillStyle = 'rgba(243,237,226,0.62)'; g.fillText('What would you see if you fell into a black hole?', W / 2, 820);
    g.globalAlpha = f(pour + 0.3, pour + 0.6); g.font = `700 44px ${MONO}`; g.letterSpacing = '16px'; g.fillStyle = 'rgba(241,197,109,0.75)'; g.fillText('— VIBE知识大赏 —', W / 2, 950); g.letterSpacing = '0px';
    g.globalAlpha = 1;
  });
}
// corner mark (360 only; the flat view has its own HTML mark) and the "turn around" hint
const mark = canvasPlane(1100, 120, 1.55); face(mark, at(52, 27, 5.5)); mark.layers.set(1); scene.add(mark);
draw(mark, 'm', (g) => { g.font = `40px ${SANS}`; g.textBaseline = 'middle'; g.letterSpacing = '12px'; g.fillStyle = GOLD; g.fillText('◆', 10, 60); g.fillStyle = 'rgba(243,237,226,0.85)'; g.fillText('Juno · VIBE知识大赏', 70, 60); });
const hint = canvasPlane(1000, 300, 1.4); face(hint, at(0, -11, 4.6)); hint.layers.set(1); scene.add(hint);
draw(hint, 'h', (g, W, H) => {
  g.strokeStyle = GOLD; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.arc(170, 150, 90, -0.2 * Math.PI, 1.15 * Math.PI); g.stroke();
  g.fillStyle = GOLD; g.beginPath(); const ax = 170 + 90 * Math.cos(1.15 * Math.PI), ay = 150 + 90 * Math.sin(1.15 * Math.PI); g.moveTo(ax - 34, ay - 6); g.lineTo(ax + 26, ay - 26); g.lineTo(ax + 12, ay + 36); g.fill();
  g.font = `700 110px ${SANS}`; g.textBaseline = 'middle'; g.fillStyle = INK; g.fillText('回头看', 320, 156);
});
// NASA, as a constellation behind you (plain star dots and faint lines; not the agency's logo)
const NASA = canvasPlane(2400, 1000, 31.9, { additive: true }); face(NASA, at(180, 22, 30)); scene.add(NASA);
const NL = { N: [[[0, 1], [0, 0], [1, 1], [1, 0]]], A: [[[0, 1], [0.5, 0], [1, 1]], [[0.25, 0.56], [0.75, 0.56]]], S: [[[0.95, 0.12], [0.5, 0], [0.05, 0.18], [0.25, 0.47], [0.78, 0.55], [0.95, 0.82], [0.5, 1], [0.05, 0.88]]] };
function poseNASA(T) {
  const a = prog(T, 12.5, 12.9); NASA.visible = a > 0; if (!a) return;
  const LW = 430, LH = 640, GAP = 150, X0 = (2400 - (4 * LW + 3 * GAP)) / 2, Y0 = 180;
  const strokes = []; [...'NASA'].forEach((ch, k) => NL[ch].forEach((s) => strokes.push(s.map(([u, v]) => [X0 + k * (LW + GAP) + u * LW, Y0 + v * LH]))));
  const lineK = Math.round(easeInOut(prog(T, 12.9, 14.8)) * 60) / 60, tw = Math.round(T * 6) / 6;
  draw(NASA, `${Math.round(a * 20)}|${lineK}|${tw}`, (g) => {
    g.globalAlpha = a; g.lineCap = 'round';
    // lines draw on in order
    const total = strokes.reduce((s, p) => s + p.length - 1, 0); let budget = lineK * total;
    g.strokeStyle = 'rgba(241,197,109,0.42)'; g.lineWidth = 5;
    for (const p of strokes) for (let i = 1; i < p.length && budget > 0; i++, budget--) {
      const f = Math.min(1, budget); g.beginPath(); g.moveTo(p[i - 1][0], p[i - 1][1]); g.lineTo(lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f)); g.stroke();
    }
    let n = 0;
    for (const p of strokes) for (const [x, y] of p) {
      n++; const tw2 = 0.8 + 0.2 * Math.sin(tw * 3 + n * 1.7), r = (n % 3 ? 9 : 14) * tw2;
      const gr = g.createRadialGradient(x, y, 0, x, y, r * 4); gr.addColorStop(0, 'rgba(255,246,220,1)'); gr.addColorStop(0.25, 'rgba(255,230,170,0.55)'); gr.addColorStop(1, 'rgba(241,197,109,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 4, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  });
}
// the horizon, to scale: a dashed ring on the black hole + a magnified callout with 17 suns across it
const ring = canvasPlane(512, 512, 1, { additive: true }); scene.add(ring);
draw(ring, 'r', (g) => { g.strokeStyle = GOLD; g.lineWidth = 7; g.setLineDash([18, 14]); g.beginPath(); g.arc(256, 256, 200, 0, Math.PI * 2); g.stroke(); });
const callout = canvasPlane(1200, 1040, 1.5); face(callout, at(22, 13, 4.2)); scene.add(callout);
const tubes = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8, 1, true), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, toneMapped: false, depthWrite: false })); scene.add(m); return m; });
const placeTube = (m, a, b, rad) => { const mid = a.clone().add(b).multiplyScalar(0.5), len = a.distanceTo(b); m.position.copy(mid); m.scale.set(rad, len, rad); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); };
/** angular radius of the black shadow and of the horizon itself for a camera falling in from rest at infinity */
function shadowDeg(r) {
  const sa = Math.min(1, (3 * Math.sqrt(3) * Math.sqrt(1 - 2 / r)) / r), cs = Math.sqrt(1 - sa * sa), v = Math.sqrt(2 / r);
  return Math.acos((cs + v) / (1 + v * cs)) / D;
}
function poseSuns(T) {
  const k = easeOut(prog(T, 16.9, 17.35)) * (1 - prog(T, 20.6, 21.0));
  ring.visible = callout.visible = k > 0; tubes.forEach((m) => (m.visible = k > 0)); if (!k) return;
  const r = rAt(T), beta = (shadowDeg(r) / 2.598) * D, dist = 12, R = dist * Math.tan(beta);
  ring.scale.setScalar((R * 512) / 200); face(ring, new THREE.Vector3(0, 0, -dist)); ring.material.opacity = k;
  callout.material.opacity = k; callout.scale.setScalar(lerp(0.9, 1, backOut(k)));
  const n = Math.round(clamp((T - 17.3) / 1.3) * 17 * 4) / 4;
  draw(callout, `${n}`, (g, W, H) => {
    rr(g, 6, 6, W - 12, H - 12, 48); g.fillStyle = 'rgba(8,10,18,0.9)'; g.fill(); g.lineWidth = 5; g.strokeStyle = 'rgba(241,197,109,0.85)'; g.stroke();
    const cx = W / 2, cy = 470, Rr = 360;
    g.fillStyle = '#000'; g.beginPath(); g.arc(cx, cy, Rr, 0, Math.PI * 2); g.fill();
    g.setLineDash([22, 16]); g.lineWidth = 6; g.strokeStyle = GOLD; g.beginPath(); g.arc(cx, cy, Rr, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    const d = (2 * Rr) / 17;
    for (let i = 0; i < 17; i++) {
      const s = clamp(n - i); if (!s) continue; const x = cx - Rr + d * (i + 0.5);
      const gr = g.createRadialGradient(x, cy, 0, x, cy, (d / 2) * 1.25); gr.addColorStop(0, '#fff7d6'); gr.addColorStop(0.6, '#ffc24a'); gr.addColorStop(1, 'rgba(255,138,26,0)');
      g.globalAlpha = s; g.fillStyle = gr; g.beginPath(); g.arc(x, cy, (d / 2) * 1.25 * (0.6 + 0.4 * s), 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    }
    g.textAlign = 'center'; g.font = `700 40px ${SANS}`; g.fillStyle = 'rgba(241,197,109,0.9)'; g.fillText('视界', cx, cy - Rr + 70);
    g.font = `700 60px ${SANS}`; g.fillStyle = INK; g.fillText('视界直径 ≈ 17 个太阳', cx, 935);
    g.font = `36px ${SANS}`; g.fillStyle = DIM; g.fillText('（黑影更大：光在边上被掰弯了）', cx, 995);
  });
  // two leader lines from the ring on the black hole to the callout
  const cp = callout.position, wv = new THREE.Vector3(), q = callout.quaternion;
  const left = new THREE.Vector3(-0.75 * callout.scale.x, 0, 0).applyQuaternion(q).add(cp);
  const a1 = new THREE.Vector3(R * 0.7, R * 0.7, -dist), a2 = new THREE.Vector3(R * 0.7, -R * 0.7, -dist);
  const up = new THREE.Vector3(0, 0.52 * callout.scale.x, 0).applyQuaternion(q);
  placeTube(tubes[0], a1, left.clone().add(up.clone().multiplyScalar(0.55)), 0.006 * 1.2);
  placeTube(tubes[1], a2, left.clone().sub(up.clone().multiplyScalar(0.25)), 0.006 * 1.2);
  tubes.forEach((m) => (m.material.opacity = 0.75 * k)); void wv;
}
// 1915: Schwarzschild's letter from the front drifts past you
const letter = canvasPlane(900, 600, 0.8, { side: THREE.DoubleSide }); letter.material.color.set('#fff3e2'); scene.add(letter);
draw(letter, 'l', (g, W, H) => {
  g.fillStyle = '#efe6d2'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(120,90,50,0.35)'; g.lineWidth = 4; g.strokeRect(14, 14, W - 28, H - 28);
  g.fillStyle = '#3a2f22'; g.font = `700 46px ${SERIF}`; g.fillText('前线来信', 50, 92);
  g.font = `600 34px ${LAT}`; g.fillStyle = '#5a4630'; g.fillText('22. XII. 1915', 50, 140);
  g.strokeStyle = 'rgba(60,45,30,0.55)'; g.lineWidth = 3;
  for (let j = 0; j < 4; j++) { g.beginPath(); const y = 205 + j * 44; g.moveTo(50, y); for (let x = 50; x < 820 - (j === 3 ? 260 : 0); x += 12) g.lineTo(x, y + 6 * Math.sin(x * 0.11 + j * 2) * Math.sin(x * 0.023 + j)); g.stroke(); }
  g.fillStyle = '#2b2219'; g.font = `600 40px ${LAT}`; g.fillText('ds² = (1 − rₛ/r) c²dt² − dr²/(1 − rₛ/r) − r²dΩ²', 50, 430);
  g.font = `italic 500 50px ${LAT}`; g.fillText('K. Schwarzschild', 470, 540);
  g.save(); g.translate(760, 100); g.rotate(-0.12); g.strokeStyle = 'rgba(168,50,42,0.8)'; g.lineWidth = 5; g.strokeRect(-60, -48, 120, 96); g.fillStyle = 'rgba(168,50,42,0.85)'; g.font = `600 34px ${LAT}`; g.textAlign = 'center'; g.fillText('1915', 0, 12); g.restore();
});
const LETTER_PATH = new THREE.CatmullRomCurve3([at(24, 9, 16), at(34, 7, 8), at(48, 3, 3.6), at(78, 0, 1.7), at(125, -4, 3.4), at(155, -6, 8)]);
function poseLetter(T) {
  const u = prog(T, 21.3, 28.2); letter.visible = u > 0 && u < 1; if (!letter.visible) return;
  const p = LETTER_PATH.getPoint(easeInOut(u) * 0.15 + u * 0.85);
  face(letter, p); letter.rotateZ(0.25 * Math.sin(T * 0.9)); letter.rotateX(0.35 * Math.sin(T * 0.7 + 1)); letter.rotateY(0.3 * Math.sin(T * 0.5));
  letter.material.opacity = prog(T, 21.3, 21.8);
}
// same mass, same orbit: a small panel with two systems ticking at the same rate
const inset = canvasPlane(1400, 800, 1.55); face(inset, at(32, 6, 3.8)); scene.add(inset);
function poseInset(T) {
  const k = easeOut(prog(T, 27.0, 27.4)); inset.visible = k > 0; if (!k) return;
  inset.material.opacity = k; inset.scale.setScalar(lerp(0.9, 1, backOut(k)));
  const ang = Math.round((T - 27) * 1.6 * 60) / 60;
  draw(inset, `${ang}`, (g, W, H) => {
    rr(g, 6, 6, W - 12, H - 12, 44); g.fillStyle = 'rgba(8,10,18,0.9)'; g.fill(); g.lineWidth = 5; g.strokeStyle = 'rgba(143,184,255,0.8)'; g.stroke();
    g.textAlign = 'center'; g.font = `700 50px ${SANS}`; g.fillStyle = INK; g.fillText('把太阳换成同样重的黑洞', W / 2, 92);
    for (const [cx, kind] of [[370, 'sun'], [1030, 'bh']]) {
      const cy = 400, R = 200;
      g.setLineDash([12, 12]); g.strokeStyle = 'rgba(243,237,226,0.4)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      if (kind === 'sun') { const gr = g.createRadialGradient(cx, cy, 0, cx, cy, 60); gr.addColorStop(0, '#fff7d6'); gr.addColorStop(0.55, '#ffc24a'); gr.addColorStop(1, 'rgba(255,138,26,0)'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, 60, 0, Math.PI * 2); g.fill(); }
      else { g.fillStyle = '#000'; g.beginPath(); g.arc(cx, cy, 16, 0, Math.PI * 2); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 22, 0, Math.PI * 2); g.stroke(); }
      const ex = cx + R * Math.cos(-ang), ey = cy + R * Math.sin(-ang);
      const ge = g.createRadialGradient(ex - 5, ey - 5, 2, ex, ey, 20); ge.addColorStop(0, '#bfe0ff'); ge.addColorStop(1, '#2d6fd6'); g.fillStyle = ge; g.beginPath(); g.arc(ex, ey, 18, 0, Math.PI * 2); g.fill();
      g.font = `36px ${SANS}`; g.fillStyle = DIM; g.fillText(kind === 'sun' ? '太阳' : '同样重的黑洞', cx, 660);
    }
    g.font = `700 52px ${SANS}`; g.fillStyle = GOLD; g.fillText('地球的轨道：一模一样', W / 2, 745);
  });
}
// the floor gauge: look down and the numbers of the fall tick in real physics
const hud = canvasPlane(1024, 1024, 2.9); hud.rotation.x = -Math.PI / 2; hud.position.set(0, -1.55, -0.15); scene.add(hud);
function poseHUD(T) {
  const k = easeOut(prog(T, 9.6, 10.4)); hud.visible = k > 0; if (!k) return; hud.material.opacity = 0.85 * k;
  const r = rAt(T), v = Math.sqrt(2 / r), dt = 1 / (1 - 2 / r);
  draw(hud, `${(r / 2).toFixed(1)}|${(v * 100).toFixed(1)}|${dt.toFixed(2)}`, (g, W) => {
    g.strokeStyle = 'rgba(143,184,255,0.75)'; g.lineWidth = 6; g.beginPath(); g.arc(W / 2, W / 2, 470, 0, Math.PI * 2); g.stroke();
    g.setLineDash([14, 12]); g.lineWidth = 3; g.beginPath(); g.arc(W / 2, W / 2, 430, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2, r0 = i % 6 ? 452 : 440; g.beginPath(); g.moveTo(W / 2 + r0 * Math.cos(a), W / 2 + r0 * Math.sin(a)); g.lineTo(W / 2 + 470 * Math.cos(a), W / 2 + 470 * Math.sin(a)); g.stroke(); }
    g.textAlign = 'center';
    const row = (y, k1, val, unit) => { g.font = `700 40px ${SANS}`; g.fillStyle = DIM; g.fillText(k1, W / 2, y - 62); g.font = `700 92px ${MONO}`; g.fillStyle = INK; const tw = g.measureText(val).width; g.fillText(val, W / 2 - 40, y + 20); g.font = `700 46px ${SANS}`; g.fillStyle = GOLD; g.textAlign = 'left'; g.fillText(unit, W / 2 - 40 + tw / 2 + 14, y + 16); g.textAlign = 'center'; };
    row(300, '距离', (r / 2).toFixed(1), '倍半径');
    row(520, '速度', (v * 100).toFixed(1) + '%', '光速');
    row(740, '你的 1 秒 = 外面', dt.toFixed(2), '秒');
  });
}
// dust streaming past: the parallax that sells the fall (front → behind, a little faster every second)
const NDUST = 800, ZMIN = -42, ZMAX = 9;
const dust = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 5, 1, true).rotateX(Math.PI / 2), (() => { const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, toneMapped: false, depthWrite: false }); setAdd(m); return m; })(), NDUST);
const DUST = []; { let s = 12345; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  while (DUST.length < NDUST) { const x = (rnd() * 2 - 1) * 9, y = (rnd() * 2 - 1) * 7; if (Math.hypot(x, y) < 1.5) continue; DUST.push({ x, y, z: ZMIN + rnd() * (ZMAX - ZMIN), b: 0.35 + 0.65 * rnd() * rnd() }); } }
dust.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(dust);
const dm = new THREE.Matrix4(), dq = new THREE.Quaternion(), dc = new THREE.Color(), dpos = new THREE.Vector3(), dsc = new THREE.Vector3();
function poseDust(T) {
  const travel = 1.3 * T + 0.022 * T * T, speed = 1.3 + 0.044 * T, len = 0.1 + 0.05 * speed;
  DUST.forEach((p, i) => {
    let z = p.z + travel; z = ZMIN + ((((z - ZMIN) % (ZMAX - ZMIN)) + (ZMAX - ZMIN)) % (ZMAX - ZMIN));
    const d = Math.hypot(p.x, p.y, z), fade = prog(z, ZMIN, ZMIN + 8) * (1 - prog(z, ZMAX - 3, ZMAX)) * clamp(1 - d / 34);
    dpos.set(p.x, p.y, z); dsc.set(0.0055 * (0.6 + p.b), 0.0055 * (0.6 + p.b), len); dm.compose(dpos, dq, dsc); dust.setMatrixAt(i, dm);
    const a = fade * p.b * 0.9; dc.setRGB(1.0 * a, 0.86 * a, 0.66 * a); dust.setColorAt(i, dc);
  });
  dust.instanceMatrix.needsUpdate = true; dust.instanceColor.needsUpdate = true;
}

/* ------------------------------------------------------------------ 小J's blocking for the 30 s opening */
const A0 = [-20, -15, 2.3], A1 = [-31, -20, 2.3], A2 = [-150, -5, 2.4], A3 = [-15, -16, 2.3];
const mixA = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const BLINKS = [9.8, 14.1, 19.9, 26.6, 29.2];
function botState(T) {
  const [L1, L2, L3, L4, L5, L6, L7] = VOICE;
  let p = A0, tilt = Math.sin(T * 2 * Math.PI * 0.4) * 0.03, hl = 0, hr = 0, e = 'normal', flame = 1, look = null, lookK = 0, side = 1;
  const fly = easeOut(prog(T, 0, 0.95));
  p = mixA([-75, 6, 3.4], A0, fly); p[0] = lerp(-75, A0[0], backOut(fly)); tilt += -0.25 * (1 - fly); flame += 1.2 * (1 - fly);
  // title: scoot down-left and look up at it
  const tk = easeInOut(prog(T, TITLE - 0.25, TITLE + 0.35)); p = mixA(p, A1, tk);
  // fly round the left to behind you, and back again
  const f1 = easeInOut(prog(T, 10.9, 12.25)), f2 = easeInOut(prog(T, 15.45, 16.95));
  if (f1 > 0) { p = mixA(A1, A2, f1); const s = Math.sin(Math.PI * f1); tilt += 0.35 * s; flame += 1.4 * s; p[1] += 6 * s; }
  if (f2 > 0) { p = mixA(A2, A3, f2); const s = Math.sin(Math.PI * f2); tilt -= 0.35 * s; flame += 1.4 * s; p[1] += 6 * s; }
  if (T < L1.t) e = fly < 0.7 ? 'surprised' : 'happy';
  else if (T < L2.t - 0.1) { hr = 0.75 + 0.25 * Math.sin((T - L1.t) * 2 * Math.PI * 2.2) * (T < L1.t + 1.2 ? 1 : 0); e = T > L1.reveal[L1.text.indexOf('小')] ? 'wink' : 'normal'; }
  else if (T < L3.t - 0.1) { const k = easeInOut(prog(T, L2.t - 0.1, L2.t + 0.4)); look = HOLE; lookK = 0.4 * k; hr = 0.8 * k; tilt += 0.06 * k; e = T > L2.reveal[L2.text.indexOf('4')] ? 'surprised' : 'normal'; }
  else if (T < TITLE - 0.1) {
    const k = easeInOut(prog(T, L3.t - 0.1, L3.t + 0.35)); look = HOLE; lookK = 0.4 * (1 - k); hr = lerp(0.8, 0, k);
    const sT = L3.reveal[L3.text.indexOf('…')]; e = T < sT ? 'happy' : 'squint';
    const sh = easeOut(prog(T, sT, sT + 0.3)); hl = 0.45 * sh; hr += 0.45 * sh; tilt += 0.1 * sh;
  } else if (T < 10.9) { look = at(0, 30, 7); lookK = 0.3 * tk; e = 'happy'; hl = hr = 0.3 * (1 - prog(T, TITLE + 0.2, TITLE + 0.8)); }
  else if (T < 15.45) { e = f1 < 1 ? 'happy' : 'happy'; if (T > L4.t + 0.2) { hr = 0.95 * easeOut(prog(T, L4.t + 0.2, L4.t + 0.6)); look = at(180, 30, 10); lookK = 0.2; } }
  else if (T < 21.4) { e = 'happy'; const k = easeOut(prog(T, L5.t, L5.t + 0.4)) * (1 - easeInOut(prog(T, L5.end - 0.2, L5.end + 0.3))); hl = hr = 0.75 * k; look = callout.position; lookK = 0.3 * k; }
  else if (T < 27.0) { const k = easeInOut(prog(T, 21.5, 22.1)) * (1 - easeInOut(prog(T, 26.3, 26.9))); look = letter.position; lookK = 0.5 * k; e = T < L6.t + 0.6 ? 'surprised' : 'normal'; hr = 0.6 * k; }
  else { e = 'squint'; const sh = prog(T, L7.t + 0.05, L7.t + 1.1); tilt += 0.09 * Math.sin(sh * Math.PI * 6) * Math.sin(Math.PI * sh); hr = 0.5 * Math.sin(Math.PI * prog(T, L7.t, L7.t + 1.4)); look = inset.position; lookK = 0.25 * prog(T, 28.6, 29.2); }
  if ((e === 'normal' || e === 'happy') && BLINKS.some((b) => T >= b && T < b + 0.12)) e = 'blink';
  const talk = talkAt(T);
  if (T > 11.6 && T < 16.2) side = -1;
  return { yaw: p[0], pitch: p[1], dist: p[2], pos: at(p[0], p[1], p[2]), tilt, hl, hr, e, flame, look, lookK, side, talk, stretch: 1, bob: 0.025 * Math.sin(T * 2 * Math.PI * 0.55) };
}

/* ------------------------------------------------------------------ the director's flat camera */
const camKeys = [[0, -2, -4], [8.3, -2, -4], [8.6, 0, 0], [10.9, 0, 0], [12.4, -170, 8], [15.45, -174, 8], [16.95, -4, -3], [21.3, 2, -4], [24.2, 26, -3], [25.5, 58, -2], [27.3, 8, -4], [30, 8, -4]];
function camAt(T) {
  let i = 0; while (i < camKeys.length - 2 && T > camKeys[i + 1][0]) i++;
  const [t0, y0, p0] = camKeys[i], [t1, y1, p1] = camKeys[i + 1], k = easeInOut(prog(T, t0, t1));
  return [lerp(y0, y1, k), lerp(p0, p1, k)];
}

/* ------------------------------------------------------------------ renderers */
const plateTex = new THREE.Texture(); plateTex.colorSpace = THREE.NoColorSpace; plateTex.minFilter = THREE.LinearFilter; plateTex.generateMipmaps = false;
// equirect: objects → cube map (transparent) → re-projected over the plate
const rEq = new THREE.WebGLRenderer({ canvas: document.getElementById('eq'), antialias: false, preserveDrawingBuffer: true, alpha: false });
rEq.setPixelRatio(1); rEq.setSize(EQW, EQH, false); rEq.toneMapping = THREE.NoToneMapping;
const cubeRT = new THREE.WebGLCubeRenderTarget(CUBE, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
const cubeCam = new THREE.CubeCamera(0.05, 400, cubeRT); scene.add(cubeCam);
cubeCam.children.forEach((c) => { c.layers.enable(1); });
const eqScene = new THREE.Scene(), eqCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
eqScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
  uniforms: { cube: { value: cubeRT.texture }, plate: { value: plateTex } }, depthTest: false, depthWrite: false,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
  fragmentShader: `uniform samplerCube cube; uniform sampler2D plate; varying vec2 vUv;
    vec3 toSRGB(vec3 c){ c = max(c, 0.); return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c)); }
    void main(){ float lon = (vUv.x - .5) * 6.2831853, lat = (vUv.y - .5) * 3.1415927;
      vec3 d = vec3(cos(lat) * sin(lon), sin(lat), -cos(lat) * cos(lon));
      vec4 o = textureCube(cube, d); vec3 p = texture2D(plate, vUv).rgb;
      gl_FragColor = vec4(p * (1. - clamp(o.a, 0., 1.)) + toSRGB(o.rgb), 1.); }`,
})));
// flat: the plate on a big sphere (sampled by direction, same mapping) + the same objects, with MSAA
const rFl = new THREE.WebGLRenderer({ canvas: document.getElementById('flat'), antialias: true, preserveDrawingBuffer: true });
rFl.setPixelRatio(1); rFl.setSize(FW, FH, false); rFl.toneMapping = THREE.NoToneMapping;
const flatCam = new THREE.PerspectiveCamera(62, FW / FH, 0.05, 2000); flatCam.rotation.order = 'YXZ'; flatCam.layers.enable(2);
const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 96, 48), new THREE.ShaderMaterial({
  uniforms: { plate: { value: plateTex } }, side: THREE.BackSide, depthWrite: false,
  vertexShader: 'varying vec3 vW; void main(){ vW = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
  fragmentShader: `uniform sampler2D plate; varying vec3 vW;
    void main(){ vec3 d = normalize(vW); float lon = atan(d.x, -d.z), lat = asin(clamp(d.y, -1., 1.));
      gl_FragColor = vec4(texture2D(plate, vec2(lon / 6.2831853 + .5, lat / 3.1415927 + .5)).rgb, 1.); }`,
}));
sky.layers.set(2); sky.renderOrder = -10; scene.add(sky);
const markEl = document.getElementById('mark');

async function loadPlate(i) {
  const img = new Image(); img.src = `${PLATES}/f${String(i).padStart(5, '0')}.jpg`; await img.decode();
  plateTex.image = img; plateTex.needsUpdate = true;
}
function update(T) {
  poseTitle(T); poseNASA(T); poseSuns(T); poseLetter(T); poseInset(T); poseHUD(T); poseDust(T);
  const s = botState(T); poseBot(s); poseBubble(T, s.yaw, s.pitch, s.side);
  const titleOn = prog(T, TITLE - 0.15, TITLE) * (1 - prog(T, 11.3, 11.8));
  mark.material.opacity = 0.55 * (1 - titleOn); markEl.style.opacity = 0.55 * (1 - titleOn);
  const hk = prog(T, 11.0, 11.4) * (1 - prog(T, 14.8, 15.3)); hint.visible = hk > 0; hint.material.opacity = hk * (0.75 + 0.25 * Math.sin(T * 6));
  const rr0 = rAt(T); diskLight.intensity = 2.2 * Math.sqrt(36 / rr0);
  fill.target.position.copy(s.pos).multiplyScalar(2); fill.position.set(-0.6, 1.0, 0.2);
  const [cy, cp] = camAt(T); flatCam.rotation.set(cp * D, -cy * D, 0);
}
window.renderAt = async (T) => {
  await loadPlate(Math.round(T * FPS));
  update(T);
  rEq.setClearColor(0x000000, 0); cubeCam.update(rEq, scene); rEq.render(eqScene, eqCam);
  rFl.setClearColor(0x000000, 1); rFl.render(scene, flatCam);
  return true;
};
window.READY = true;
