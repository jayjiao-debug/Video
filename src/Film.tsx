/* 《倒挂飞车》: one continuous take that follows one car through the whole test site.
   0–10.5   hook: up the wall, hanging upside down, off the end, a kickflip, a soft landing
   10.5     title (over the landing, no cut)
   15–18.4  rewind back up to the ceiling
   21–28.8  quiet: time stops, x-ray: the fans, the air, 40 t vs 2 t, 5 %
   28.8–44  off the end again, slowed: the tanks, the nozzles, action/reaction, the roll on 39.0, the brake on 41.8
   44–67    the jump over a row of parked vehicles (54.2 up, 66.8 down)
   69–82    quiet: parked at the hangar, three versions, 2028 on the wall (77.5)
   82–90    end card over the car driving off
   Everything is drawn in code; the car and vehicles are original and unbranded. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grain, Bars, Subs, Canvas, glowDot, clamp, lerp, eo, eio, pr, hit } from './kit';
import {
  sky, mesas, mast, ground, rig, car, plume, arrow, ribbon, vehicle, hangar, withCam, toScreen, poseOnTrack, freePose, carToWorld, carDir,
  R, RW, S_TOP, S_END, DECK_END, GOLD, CYAN, RED, WARM, type Cam, type Pose,
} from './world';
import { LINES, HIT, FIN, FILM_FRAMES, B } from './time';
import { JUNO } from './brand/identity';
export { FILM_FRAMES };

type G = CanvasRenderingContext2D;
const MASTS = [2700, -1200, -3600, -6200, -9000, -11800];
const HANGAR: [number, number] = [-13200, -10600];
const VEH: [number, 'sedan' | 'suv' | 'pickup' | 'truck'][] = [[-6550, 'sedan'], [-7100, 'suv'], [-7700, 'pickup'], [-8400, 'truck']];
const PARK = -10300;
const smooth3 = (u: number) => { u = clamp(u); return u * u * (3 - 2 * u); };
const pw = (T: number, pts: [number, number][]) => {   // piecewise-linear map
  if (T <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (T <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], (T - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]));
  return pts[pts.length - 1][1];
};
const bump = (T: number, a: number, z: number, f = 0.25) => Math.min(eo(T, a, f), 1 - pr(T, z - f, f));

/* ================================================================ the car's state at film time T */
type State = { p: Pose; sy: number; spin: number; under: number; side: number; rear: number; down: number; streak: number; ground: boolean };
const V = 937, S0 = 450, T_DECK = (S_END - S0) / V;          // 7.0 s: leaves the deck in the hook
const flight = (u: number, a0 = 0) => {
  const x = DECK_END - 2300 * (1 - Math.pow(1 - clamp(u), 1.6)), y = lerp(-2 * R + RW, -RW, smooth3(u));
  return freePose(x, y, Math.PI + 0.06 * Math.sin(Math.PI * u) + a0);
};
const LANDX = DECK_END - 2300;
const hookState = (t: number): State => {
  if (t < T_DECK) { const s = S0 + V * t; return { p: poseOnTrack(s), sy: 1, spin: s / RW, under: s > 900 ? 1 : 0.5, side: 0, rear: 0, down: 0, streak: 1, ground: false }; }
  const tf = T_DECK + 3.54;
  if (t < tf) {
    const u = (t - T_DECK) / 3.54;
    return { p: flight(u), sy: Math.cos(Math.PI * eio(t, 7.6, 1.3)), spin: S_END / RW + (t - T_DECK) * 6, under: 0, side: bump(t, 7.5, 8.9, 0.2), rear: 0, down: bump(t, 9.0, 10.5, 0.25), streak: 0.4, ground: false };
  }
  return { p: freePose(LANDX, -RW, Math.PI), sy: -1, spin: S_END / RW + 21, under: 0, side: 0, rear: 0, down: 0, streak: 0, ground: true };
};
const T_CEIL = (S_TOP + 800 - S0) / V;   // 5.40 s into the hook: the spot on the ceiling we rewind to
const stateAt = (T: number): State => {
  if (T < 15.0) return hookState(T);
  if (T < HIT.CEIL) return hookState(lerp(10.54, T_CEIL, eio(T, 15.0, HIT.CEIL - 15.0)));
  if (T < HIT.BACK) return { ...hookState(T_CEIL), streak: 0, under: 1 };
  if (T < 30.6) { const s = S_TOP + 800 + 1500 * Math.pow(pr(T, HIT.BACK, 1.8), 1.6); return { p: poseOnTrack(s), sy: 1, spin: s / RW, under: 1, side: 0, rear: 0, down: 0, streak: 0.5, ground: false }; }
  if (T < HIT.LAND) {
    const u = pw(T, [[30.6, 0], [HIT.ROLL, 0.36], [HIT.BRAKE, 0.62], [HIT.LAND, 1]]);
    return { p: flight(u), sy: Math.cos(Math.PI * eio(T, HIT.ROLL - 0.65, 1.3)), spin: S_END / RW + (T - 30.6) * 1.5, under: 0, side: bump(T, HIT.ROLL - 0.8, HIT.ROLL + 0.8, 0.2), rear: bump(T, 35.1, 37.6, 0.3), down: bump(T, HIT.BRAKE, HIT.LAND - 0.1, 0.25), streak: 0, ground: false };
  }
  const sp0 = S_END / RW + 21;
  if (T < 50.0) return { p: freePose(LANDX, -RW, Math.PI), sy: -1, spin: sp0, under: 0, side: 0, rear: 0, down: 0, streak: 0, ground: true };
  if (T < HIT.JUMP) { const x = LANDX - 1500 * Math.pow(pr(T, 50.0, HIT.JUMP - 50.0), 2); return { p: freePose(x, -RW, Math.PI), sy: -1, spin: sp0 + (LANDX - x) / RW, under: 0, side: 0, rear: 0, down: 0, streak: 0.3, ground: true }; }
  const X0 = LANDX - 1500;
  if (T < HIT.LAND2) {
    const u = pw(T, [[HIT.JUMP, 0], [56.5, 0.33], [61.5, 0.6], [HIT.LAND2, 1]]);
    const x = X0 - 3200 * u, y = -RW - 1000 * Math.pow(Math.sin(Math.PI * u), 0.85);
    return { p: freePose(x, y, Math.PI + 0.07 * Math.cos(Math.PI * u)), sy: -1, spin: sp0 + 1500 / RW + u * 20, under: 0, side: 0, rear: 0, down: Math.max(bump(T, HIT.JUMP, 55.8, 0.15), 0.45 * bump(T, 55.6, HIT.DESC + 0.2, 0.4), bump(T, HIT.DESC, HIT.LAND2 - 0.1, 0.3)), streak: 0, ground: false };
  }
  const X1 = X0 - 3200;
  if (T < HIT.END + 0.6) { const x = lerp(X1, PARK, eo(T, HIT.LAND2, 3.4)); return { p: freePose(x, -RW, Math.PI), sy: -1, spin: sp0 + (LANDX - x) / RW, under: 0, side: 0, rear: 0, down: 0, streak: 0, ground: true }; }
  const x = PARK - 2600 * Math.pow(pr(T, HIT.END + 0.6, 6), 1.8);
  return { p: freePose(x, -RW, Math.PI), sy: -1, spin: sp0 + (LANDX - x) / RW, under: 0, side: 0, rear: 0, down: 0, streak: 0.2, ground: true };
};

/* ================================================================ camera: a follow cam whose framing eases between keys */
type K = { t: number; s: number; ox: number; oy: number; r?: number; d?: number };
const KEYS: K[] = [
  { t: 0, s: 0.62, ox: -320, oy: 40, r: -0.05 },
  { t: 4.3, s: 0.6, ox: 0, oy: 230, r: 0, d: 3.2 },
  { t: 8.2, s: 0.6, ox: -150, oy: 120, d: 2.5 },
  { t: 10.6, s: 0.6, ox: -150, oy: -300, d: 2.2 },
  { t: 14.8, s: 0.64, ox: -150, oy: -320, d: 4 },
  { t: 16.4, s: 0.6, ox: 0, oy: 150, d: 1.4 },
  { t: 19.2, s: 0.74, ox: 40, oy: 200, d: 1.6 },
  { t: 22.4, s: 1.12, ox: 60, oy: 100, d: 1.8 },
  { t: 30.2, s: 0.8, ox: -200, oy: 200, d: 1.6 },
  { t: 33.0, s: 0.9, ox: -60, oy: 90, d: 2.4 },
  { t: 41.0, s: 0.8, ox: -60, oy: 40, d: 2 },
  { t: 45.4, s: 0.66, ox: -150, oy: -280, d: 1.4 },
  { t: 48.0, s: 0.42, ox: -1400, oy: -600, d: 2.2 },
  { t: 53.0, s: 0.5, ox: -700, oy: -420, d: 2.6 },
  { t: 57.0, s: 0.56, ox: -260, oy: 240, d: 2.6 },
  { t: 63.0, s: 0.56, ox: -260, oy: 60, d: 2 },
  { t: 67.4, s: 0.6, ox: -500, oy: -380, d: 2 },
  { t: 70.4, s: 0.62, ox: -700, oy: -500, d: 2.4 },
  { t: 77.5, s: 0.6, ox: -820, oy: -560, d: 1.2 },
];
const camFrame = (T: number) => {
  // i = the latest key whose move has started; ease from the key before it
  let i = 0; while (i < KEYS.length - 1 && T >= KEYS[i + 1].t - (KEYS[i + 1].d ?? 1.5)) i++;
  if (i === 0) return KEYS[0];
  const a = KEYS[i - 1], b = KEYS[i], d = b.d ?? 1.5, q = eio(T, b.t - d, d);
  return { t: T, s: lerp(a.s, b.s, q), ox: lerp(a.ox, b.ox, q), oy: lerp(a.oy, b.oy, q), r: lerp(a.r ?? 0, b.r ?? 0, q) };
};
const camAt = (T: number): Cam => {
  let x = 0, y = 0, n = 0;
  for (let k = 0; k <= 4; k++) { const t = T - k * 0.04; const st = stateAt(Math.max(0, t)); const w = k === 0 ? 3 : 1 - k / 6; x += st.p.x * w; y += st.p.y * w; n += w; }
  const f = camFrame(T);
  return { x: x / n + f.ox, y: y / n + f.oy, s: f.s, r: f.r ?? 0 };
};

/* ================================================================ drawing helpers */
const label = (g: G, s: string, x: number, y: number, size = 34, col = '243,237,226', align: CanvasTextAlign = 'left', weight = 700, font = 'Noto Sans CJK SC', a = 1) => {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.font = `${weight} ${size}px "${font}"`; g.textAlign = align; g.textBaseline = 'middle';
  g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.65)'; g.strokeText(s, x, y); g.fillStyle = `rgb(${col})`; g.fillText(s, x, y); g.restore();
};
const leader = (g: G, a: [number, number], b: [number, number], col = GOLD, al = 1) => {
  if (al <= 0) return;
  g.save(); g.globalAlpha *= al; g.strokeStyle = `rgba(${col},.85)`; g.lineWidth = 2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  g.fillStyle = `rgb(${col})`; g.beginPath(); g.arc(a[0], a[1], 5, 0, 7); g.fill(); g.restore();
};
const stage = (g: G, T: number, cam: Cam, freeze: number) => {
  const groundY = 540 + (0 - cam.y) * cam.s, horizon = 540 + (0 - cam.y) * cam.s * 0.22 - 40;
  g.save();
  g.save(); g.translate(960, 540); g.rotate(cam.r ?? 0); g.translate(-960, -540);
  sky(g, 1920, 1080, horizon); mesas(g, 1920, horizon, cam.x);
  const df = g.createLinearGradient(0, horizon, 0, Math.max(horizon + 10, groundY)); df.addColorStop(0, '#2a1e30'); df.addColorStop(1, '#17131d');
  g.fillStyle = df; g.fillRect(-300, horizon, 2520, Math.max(0, groundY - horizon) + 4);
  g.restore();
  withCam(g, cam, () => {
    MASTS.forEach((x, i) => mast(g, x, 2100 + 250 * (i % 2), [x + (i % 2 ? -900 : 900), -200], 1));
    hangar(g, HANGAR[0], HANGAR[1], 1500);
    rig(g, T);
    ground(g, -18000, 6000, MASTS);
    VEH.forEach(([x, k]) => vehicle(g, x, k));
  });
  // time stopped: drain the colour and dim the set (composite ops; canvas filters are far too slow headless)
  if (freeze > 0) { g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = `rgba(128,128,128,${0.6 * freeze})`; g.fillRect(0, 0, 1920, 1080); g.globalCompositeOperation = 'source-over'; g.fillStyle = `rgba(6,8,16,${0.3 * freeze})`; g.fillRect(0, 0, 1920, 1080); g.restore(); }
  g.save(); g.globalCompositeOperation = 'lighter';
  const hz = g.createLinearGradient(0, groundY - 380 * cam.s, 0, groundY + 40); hz.addColorStop(0, 'rgba(255,170,110,0)'); hz.addColorStop(0.8, 'rgba(255,170,110,.10)'); hz.addColorStop(1, 'rgba(255,170,110,0)');
  g.fillStyle = hz; g.fillRect(0, groundY - 380 * cam.s, 1920, 420 * cam.s + 40);
  g.restore();
  g.restore();
};
/** dust thrown up where the car lands */
const dust = (g: G, x: number, t0: number, T: number, power = 1) => {
  const age = T - t0; if (age < 0 || age > 3.2) return;
  for (let i = 0; i < 22; i++) {
    const side = i % 2 ? 1 : -1, sp = 300 + 500 * ((i * 37) % 11) / 11, d = sp * (1 - Math.exp(-age * 1.6));
    const px = x + side * (80 + d), py = -10 - 30 * ((i * 13) % 7) / 7 - 60 * (1 - Math.exp(-age)) * ((i * 7) % 5) / 5;
    const r = 40 + 120 * (1 - Math.exp(-age * 1.2)) * (0.6 + 0.4 * ((i * 5) % 3) / 3), al = 0.32 * power * (1 - age / 3.2);
    const gr = g.createRadialGradient(px, py, 0, px, py, r); gr.addColorStop(0, `rgba(190,165,150,${al})`); gr.addColorStop(1, 'rgba(190,165,150,0)');
    g.fillStyle = gr; g.fillRect(px - r, py - r, 2 * r, 2 * r);
  }
};
const streaks = (g: G, p: Pose, k: number) => {
  if (k <= 0) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  const c = Math.cos(p.a), s = Math.sin(p.a);
  for (let i = 0; i < 9; i++) {
    const off = (i / 8 - 0.5) * 220, back = 380 + 60 * (i % 3), L = 700 * (0.5 + 0.5 * ((i * 37) % 7) / 7);
    const x0 = p.x - c * back - s * off, y0 = p.y - s * back + c * off;
    const lg = g.createLinearGradient(x0, y0, x0 - c * L, y0 - s * L); lg.addColorStop(0, `rgba(${WARM},${0.5 * k})`); lg.addColorStop(1, `rgba(${WARM},0)`);
    g.strokeStyle = lg; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 - c * L, y0 - s * L); g.stroke();
  }
  g.restore();
};
/** the car seen from the nose (for the roll), screen space */
const frontView = (g: G, cx: number, cy: number, ang: number, jet: number, T: number) => {
  g.save(); g.translate(cx, cy); g.scale(0.78, 0.78); g.rotate(ang);
  g.fillStyle = '#262a34'; g.strokeStyle = `rgba(${CYAN},.95)`; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-170, 34); g.lineTo(-178, 0); g.quadraticCurveTo(-170, -26, -110, -34); g.quadraticCurveTo(-70, -40, -56, -44);
  g.quadraticCurveTo(-36, -92, 0, -94); g.quadraticCurveTo(36, -92, 56, -44); g.quadraticCurveTo(70, -40, 110, -34); g.quadraticCurveTo(170, -26, 178, 0); g.lineTo(170, 34); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#0f1626'; g.beginPath(); g.moveTo(-46, -46); g.quadraticCurveTo(0, -90, 46, -46); g.closePath(); g.fill();
  g.fillStyle = '#08080b'; g.beginPath(); (g as any).roundRect(-176, 22, 46, 44, 8); g.fill(); g.beginPath(); (g as any).roundRect(130, 22, 46, 44, 8); g.fill();
  g.fillStyle = 'rgba(220,240,255,.9)'; g.fillRect(-150, -8, 60, 6); g.fillRect(90, -8, 60, 6);
  if (jet > 0) plume(g, 182, -40, -0.35, 220, jet, T, 3, 0.5);
  g.restore();
};

/* ================================================================ the film */
const GLYPHS = '车底约4平方米外面空气推力吨只有2高压瓶个喷口升10600反方向一侧往下刹从头看抓地倍特斯拉称未经实测定金5万美元单双座仅邀请不能上路会飞多久公布倒带慢放定格加进器风扇把的抽走示意−–·×¼‖◀';
const TITLE = '倒挂飞车';
export const Film: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const [h] = useState(() => delayRender('film', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all([...FONT_LOADS, '900 40px "Noto Serif CJK SC"', '900 40px "Noto Sans CJK SC"'].map((x) => document.fonts.load(x, GLYPHS).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const titleO = T < HIT.TITLE - 0.05 ? 0 : 1 - pr(T, 14.3, 0.5);
  const endO = eo(T, HIT.END, 0.7);
  const markO = (1 - (T >= HIT.TITLE - 0.3 && T < 14.8 ? 1 : 0)) * (1 - endO);
  const freeze = bump(T, HIT.QUIET, HIT.BACK, 0.7);
  const rewind = bump(T, 15.0, HIT.CEIL, 0.2);
  const slow = Math.max(bump(T, 30.6, HIT.LAND, 0.4), bump(T, 56.5, 61.5, 0.4));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          <Canvas dep={f} draw={(g) => {
            const st = stateAt(T), cam = camAt(T), p = st.p, sy = st.sy;
            stage(g, T, cam, freeze);
            const toS = (x: number, y: number) => toScreen(cam, x, y);
            withCam(g, cam, () => {
              // landing dust and the contact shadow
              dust(g, LANDX, 10.54, T); dust(g, LANDX, HIT.LAND, T); dust(g, LANDX - 4700, HIT.LAND2, T, 0.8);
              if (st.ground) { g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.ellipse(p.x, 4, 400, 14, 0, 0, 7); g.fill(); }
              else if (p.y > -1400) { const k = clamp(1 - (-p.y) / 1400); g.fillStyle = `rgba(0,0,0,${0.4 * k})`; g.beginPath(); g.ellipse(p.x, 4, 400 * (0.6 + 0.4 * k), 12, 0, 0, 7); g.fill(); }
              // rewind ghosts: where the car is coming back from
              if (rewind > 0 && T < HIT.CEIL) {
                const ht = lerp(10.54, T_CEIL, eio(T, 15.0, HIT.CEIL - 15.0));
                for (let i = 3; i >= 1; i--) { const gs = hookState(Math.min(10.54, ht + i * 0.07)); g.save(); g.globalAlpha = 0.1 * rewind * (1 - i / 4); car(g, gs.p, { sy: gs.sy, rim: 0 }); g.restore(); }
              }
              streaks(g, p, st.streak * (1 - freeze));
              // jets that sit behind the body
              if (st.down > 0) for (const lx of [300, 120, -140, -300]) plume(g, ...carToWorld(p, sy, lx, 44), carDir(p, sy, Math.PI / 2), 640, st.down, T, lx);
              if (st.rear > 0) plume(g, ...carToWorld(p, sy, -382, -30), carDir(p, sy, Math.PI), 620, st.rear, T, 9);
              // the x-ray: on in the freeze, half on while the tanks and nozzles are explained
              const xr = Math.max(freeze, 0.55 * bump(T, 29.1, 37.8, 0.4));
              car(g, p, { sy, spin: st.spin, rim: 1, under: st.under * (1 - freeze), xray: xr, fans: freeze, tanks: Math.max(0.25 * freeze, bump(T, 29.1, 37.8, 0.4)), nozzles: bump(T, 31.6, 37.8, 0.4), T });
              if (st.side > 0) plume(g, ...carToWorld(p, sy, 20, 0), Math.PI / 2 + 0.35, 520, st.side, T, 7, 0);
              // freeze: the air pulled out from under the car, flowing (dashes move), and the push of the outside air
              if (freeze > 0) {
                for (let i = 0; i < 8; i++) {
                  const lx0 = 330 - i * 88, fx = lx0 > -20 ? 110 : -150, pts: [number, number][] = [];
                  for (let k = 0; k <= 30; k++) {
                    const q = k / 30; let lx: number, ly: number;
                    if (q < 0.35) { const u = q / 0.35; lx = lerp(lx0, fx, u); ly = lerp(52, 38, u * u); }
                    else if (q < 0.7) { const u = (q - 0.35) / 0.35; lx = lerp(fx, -380, u); ly = lerp(38, 22, u); }
                    else { const u = (q - 0.7) / 0.3; lx = -380 - 260 * u; ly = 22 - 6 * u + (i - 3.5) * 9 * u; }
                    pts.push(carToWorld(p, 1, lx, ly));
                  }
                  g.save(); g.setLineDash([26, 18]); g.lineDashOffset = -T * 160; ribbon(g, pts, CYAN, 2.5, 0.8 * freeze, 0); g.restore();
                }
                for (let i = 0; i < 6; i++) {
                  const a = eo(T, 21.4 + i * 0.07, 0.4) * freeze, lx = [-330, -220, -110, 110, 220, 330][i], [x, y] = carToWorld(p, 1, lx, -330 - 30 * (1 - a));
                  if (a > 0) arrow(g, x, y, -Math.PI / 2, 150, 26, `rgba(${GOLD},.92)`, a);
                }
                const wa = eo(T, 24.1, 0.4) * freeze;   // the car's weight: a small arrow down
                if (wa > 0) { const [x, y] = carToWorld(p, 1, -20, -150); arrow(g, x, y, Math.PI / 2, 110, 18, 'rgba(243,237,226,.9)', wa); }
              }
              // action and reaction: gas out of the tail, the car pushed the other way
              const nr = bump(T, 35.4, 37.8, 0.3);
              if (nr > 0) { const [x, y] = carToWorld(p, sy, 380, 0); arrow(g, x + 30 * Math.cos(carDir(p, sy, 0)), y, carDir(p, sy, 0), 220, 30, `rgba(${GOLD},.95)`, nr); }
              // the brake: jets down, the car held up
              const br = bump(T, HIT.BRAKE + 0.2, HIT.LAND - 0.2, 0.3);
              if (br > 0) for (const lx of [-200, 200]) { const [x, y] = carToWorld(p, sy, lx, 330); arrow(g, x, y + 0, -Math.PI / 2, 150, 24, `rgba(${GOLD},.9)`, br); }
              // the jump: thrust vs grip, as Tesla states it
              const cmp = bump(T, 57.0, 62.6, 0.4);
              if (cmp > 0) { const bx = p.x + 640, by = p.y + 360; arrow(g, bx, by, -Math.PI / 2, 90, 30, 'rgba(243,237,226,.92)', cmp); arrow(g, bx + 220, by, -Math.PI / 2, 90 + 310 * eo(T, 57.4, 0.7), 30, `rgba(${GOLD},.95)`, cmp); }
              // the hangar wall: 2028 lands on the hit
              const y8 = eo(T, HIT.Y2028, 0.35);
              if (T > HIT.Y2028) {
                g.save(); g.globalCompositeOperation = 'lighter';
                const r = g.createRadialGradient(-11900, -900, 0, -11900, -900, 1000); r.addColorStop(0, `rgba(255,214,150,${0.3 * y8 + 0.25 * hit(T, HIT.Y2028, 0.4)})`); r.addColorStop(1, 'rgba(255,200,130,0)'); g.fillStyle = r; g.fillRect(-13000, -2000, 2200, 2000);
                g.restore();
                g.save(); g.translate(-11900, -900); g.scale(lerp(1.18, 1, y8), lerp(1.18, 1, y8)); g.globalAlpha = y8 * (1 - endO * 0.95);
                g.font = '900 520px "Noto Serif CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'middle';
                const tg = g.createLinearGradient(0, -250, 0, 250); tg.addColorStop(0, '#fff3cf'); tg.addColorStop(0.5, '#f0c873'); tg.addColorStop(1, '#b07c32'); g.fillStyle = tg; g.fillText('2028', 0, 0); g.restore();
              }
            });
            // ---------------------------------------------------------------- labels that live on the picture (screen space)
            if (freeze > 0) {
              const [ux, uy] = toS(...carToWorld(p, 1, 0, 60));
              const ka = eo(T, 21.6, 0.4) * freeze;
              if (ka > 0) { g.save(); g.globalAlpha = ka; g.strokeStyle = `rgba(${CYAN},.9)`; g.lineWidth = 2; const [a1, a2] = [toS(...carToWorld(p, 1, 340, 70)), toS(...carToWorld(p, 1, -380, 70))]; g.beginPath(); g.moveTo(a1[0], a1[1] - 14); g.lineTo(a1[0], a1[1] - 26); g.lineTo(a2[0], a2[1] - 26); g.lineTo(a2[0], a2[1] - 14); g.stroke(); g.restore(); label(g, '车底约4平方米', ux - 60, uy - 52, 28, CYAN, 'center', 700, 'Noto Sans CJK SC', ka); }
              const [ex, ey] = toS(...carToWorld(p, 1, -520, 16));
              const fa = eo(T, 21.2, 0.4) * freeze;
              leader(g, [ex, ey], [ex + 30, ey + 70], CYAN, fa); label(g, '风扇把车底的空气抽走', ex - 150, ey + 98, 30, CYAN, 'left', 700, 'Noto Sans CJK SC', fa);
              label(g, '外面的空气：约40吨的推力', 1200, 868, 38, GOLD, 'left', 700, 'Noto Sans CJK SC', eo(T, 21.6, 0.4) * freeze);
              label(g, '车只有约2吨', 1200, 914, 32, '243,237,226', 'left', 700, 'Noto Sans CJK SC', eo(T, 24.2, 0.4) * freeze);
              const ga = eo(T, 26.3, 0.5) * freeze;
              if (ga > 0) {
                const gx = 110, gy = 800;
                g.save(); g.globalAlpha = ga; g.fillStyle = 'rgba(8,10,18,.72)'; g.beginPath(); (g as any).roundRect(gx - 30, gy - 290, 330, 340, 16); g.fill();
                const bar = (x: number, v: number, col: string, t: string) => { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x, gy - 220, 70, 220); g.fillStyle = col; g.fillRect(x, gy - 220 * v, 70, 220 * v); label(g, t, x + 35, gy + 30, 28, '243,237,226', 'center'); };
                bar(gx + 20, 1, `rgba(${GOLD},.95)`, '外面'); bar(gx + 180, 1 - 0.05 * eo(T, 26.8, 0.8), `rgba(${CYAN},.95)`, '车底');
                g.strokeStyle = `rgb(${RED})`; g.lineWidth = 3; g.beginPath(); g.moveTo(gx + 170, gy - 220); g.lineTo(gx + 260, gy - 220); g.stroke();
                label(g, '−5%', gx + 215, gy - 250, 34, RED, 'center', 900, 'JunoMono');
                label(g, '空气（示意）', gx + 70, gy - 262, 22, '200,200,210', 'center');
                g.restore();
              }
            }
            // tanks and nozzles
            const ta = bump(T, 29.3, 31.5, 0.3);
            if (ta > 0) { const [x, y] = toS(...carToWorld(p, sy, 250, -10)); leader(g, [x, y], [x + 70, y + 150], GOLD, ta); label(g, '高压气瓶（示意）', x + 80, y + 172, 30, GOLD, 'left', 700, 'Noto Sans CJK SC', ta); }
            const na = bump(T, 31.8, 34.9, 0.3);
            if (na > 0) { const [x, y] = toS(...carToWorld(p, sy, 300, -34)); leader(g, [x, y], [x + 60, y + 170], CYAN, na); label(g, '喷口 ×10', x + 70, y + 192, 32, CYAN, 'left', 700, 'Noto Sans CJK SC', na); }
            const nr = bump(T, 35.4, 37.8, 0.3);
            if (nr > 0) { const [x, y] = toS(...carToWorld(p, sy, -650, -30)); label(g, '气 →', x, y - 70, 32, CYAN, 'center', 700, 'Noto Sans CJK SC', nr); const [x2, y2] = toS(...carToWorld(p, sy, 560, 0)); label(g, '← 车', x2, y2 - 70, 32, GOLD, 'center', 700, 'Noto Sans CJK SC', nr); }
            // the roll, seen from the nose
            const ia = bump(T, HIT.ROLL - 1.2, HIT.ROLL + 2.2, 0.35);
            if (ia > 0) {
              const ix = 1360, iy = 190, iw = 440, ih = 320;
              g.save(); g.globalAlpha = ia; g.fillStyle = 'rgba(8,10,18,.8)'; g.strokeStyle = `rgba(${CYAN},.6)`; g.lineWidth = 2; g.beginPath(); (g as any).roundRect(ix, iy, iw, ih, 16); g.fill(); g.stroke();
              label(g, '从车头看', ix + 24, iy + 34, 26, CYAN);
              const ang = Math.PI * (1 - eio(T, HIT.ROLL - 0.65, 1.3));
              frontView(g, ix + iw / 2, iy + ih / 2 + 30, ang, st.side, T);
              g.strokeStyle = `rgba(${GOLD},.95)`; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(ix + iw / 2, iy + ih / 2 + 30, 120, -2.75, -1.75); g.stroke();
              arrow(g, ix + iw / 2 + 120 * Math.cos(-2.75), iy + ih / 2 + 30 + 120 * Math.sin(-2.75), -2.75 - Math.PI / 2, 44, 16, `rgba(${GOLD},.95)`);
              g.restore();
            }
            const cmp = bump(T, 57.0, 62.6, 0.4);
            if (cmp > 0) { const [bx, by] = toS(p.x + 640, p.y + 360); label(g, '抓地力', bx, by + 28, 26, '243,237,226', 'center', 700, 'Noto Sans CJK SC', cmp); label(g, '喷气推力', bx + 123, by + 28, 26, GOLD, 'center', 700, 'Noto Sans CJK SC', cmp); label(g, '4–5倍', bx + 180, by - 210, 40, GOLD, 'left', 900, 'JunoMono', cmp * eo(T, 57.9, 0.3)); label(g, '特斯拉称，未经实测', bx + 180, by - 168, 22, '200,200,210', 'left', 700, 'Noto Sans CJK SC', cmp * eo(T, 60.2, 0.3)); }
            // three versions, standing on the apron in the quiet
            const ca = bump(T, 69.7, HIT.END + 0.3, 0.4);
            if (ca > 0) {
              const cards: [string, string[], string][] = [['Performance', ['定金 5万美元'], '双座'], ['Thrust', ['加推进器'], '双座'], ['Rocket · 会飞', ['单座 · 仅邀请', '{不能上路}'], '']];
              cards.forEach(([a, b, c], i) => {
                const k = eo(T, 69.75 + i * 0.12, 0.4) * ca, x = 1060 + i * 280, y = 250 + (1 - k) * 20;
                const hl = (i === 2 && T > 71.8) || (i === 0 && T > 79.7);
                g.save(); g.globalAlpha = k * (T > 71.8 && !hl ? 0.6 : 1); g.fillStyle = i === 2 ? 'rgba(40,18,16,.85)' : 'rgba(10,12,20,.8)'; g.strokeStyle = i === 2 ? `rgba(${RED},.9)` : `rgba(${GOLD},${hl ? 1 : 0.7})`; g.lineWidth = hl ? 3 : 2;
                g.beginPath(); (g as any).roundRect(x, y, 260, 190, 14); g.fill(); g.stroke();
                label(g, a, x + 130, y + 42, 34, i === 2 ? RED : GOLD, 'center', 700, 'Cormorant Garamond');
                b.forEach((t, j) => label(g, t.replace(/[{}]/g, ''), x + 130, y + 92 + j * 34, 26, t.startsWith('{') ? RED : '243,237,226', 'center'));
                if (c) label(g, c, x + 130, y + 150, 24, '200,200,210', 'center');
                g.restore();
              });
              label(g, '飞多高、飞多久：未公布', 1060, 490, 34, RED, 'left', 700, 'Noto Sans CJK SC', eo(T, 74.8, 0.4) * ca);
            }
            // vignette; title and end card sit on a dimmed (not black) frame
            const v = g.createRadialGradient(960, 540, 420, 960, 540, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, 1920, 1080);
            const dim = Math.max(0.5 * titleO, 0.72 * endO);
            if (dim > 0) { g.fillStyle = `rgba(4,4,8,${dim})`; g.fillRect(0, 0, 1920, 1080); }
          }} />
          <Grain T={T} />
          <Bars />
          {/* time indicators */}
          {rewind > 0 && <Ind s="◀◀  倒带" o={rewind} />}
          {freeze > 0 && <Ind s="‖  定格" o={freeze} />}
          {slow > 0 && <Ind s="慢放 ×¼" o={slow} />}
          {/* title card, over the landing */}
          {titleO > 0 && (
            <>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', opacity: titleO * eo(T, HIT.TITLE + 0.3, 0.4), fontFamily: F.lat, fontWeight: 600, fontSize: 28, letterSpacing: '0.3em', color: C.gold }}>ROADSTER · McGREGOR, TEXAS · 2026.10.15</div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 284, textAlign: 'center', opacity: titleO, fontFamily: F.serif, fontWeight: 900, fontSize: 150, lineHeight: '190px', whiteSpace: 'nowrap' }}>
                {['《', ...TITLE, '》'].map((c, i) => {
                  const t0 = i === 0 || i === TITLE.length + 1 ? HIT.TITLE : HIT.TITLE + (i - 1) * B / 2, k = eo(T, t0, 0.22);
                  return <span key={i} style={{ display: 'inline-block', opacity: T < t0 ? 0 : k, transform: `scale(${lerp(1.4, 1, k)})`, background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 52%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 30px rgba(0,0,0,.9))' }}>{c}</span>;
                })}
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', opacity: titleO * eo(T, HIT.TITLE + 1.0, 0.4), fontFamily: F.serif, fontWeight: 700, fontSize: 50, color: C.cream, textShadow: '0 4px 20px rgba(0,0,0,.9)' }}>一辆车，凭什么倒挂、还能飞？</div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 574, textAlign: 'center', opacity: 0.9 * titleO * eo(T, HIT.TITLE + 1.3, 0.4), fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 34, color: 'rgba(239,232,218,.9)' }}>Hold on. Let go.</div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 636, textAlign: 'center', opacity: titleO * eo(T, HIT.TITLE + 1.6, 0.4), fontFamily: F.sans, fontWeight: 500, fontSize: 30, letterSpacing: '0.3em', color: C.gold }}>— {JUNO.series} —</div>
            </>
          )}
          {/* end card, over the car driving off */}
          {endO > 0 && (
            <>
              <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: endO }}>
                <defs><linearGradient id="gec" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3cf" /><stop offset=".5" stopColor="#f0c873" /><stop offset="1" stopColor="#b07c32" /></linearGradient></defs>
                <circle cx={960} cy={232} r={46} fill="none" stroke={C.gold} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - eio(T, HIT.END, 0.8)} transform="rotate(-90 960 232)" />
                <text x={960} y={252} textAnchor="middle" style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 64 }} fill={C.gold} opacity={eo(T, HIT.END + 0.3, 0.4)}>J</text>
                <text x={960} y={306} textAnchor="middle" style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.5em' }} fill={C.gold} opacity={0.85 * eo(T, HIT.END + 0.5, 0.4)}>JUNO</text>
                <text x={960} y={440} textAnchor="middle" opacity={eo(T, HIT.END, 0.3)} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 104 }} fill="url(#gec)">《倒挂飞车》</text>
                {/* motif: the outside air pushing up, three gold arrows */}
                {[-60, 0, 60].map((dx, i) => <path key={i} opacity={eo(T, HIT.END + 0.6 + i * 0.08, 0.4)} transform={`translate(${960 + dx} 520)`} d="M -9 22 L -9 -2 L -20 -2 L 0 -24 L 20 -2 L 9 -2 L 9 22 Z" fill={C.gold} />)}
                <text x={960} y={640} textAnchor="middle" opacity={eo(T, HIT.END + 1.0, 0.4)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 50, letterSpacing: '0.06em' }} fill={C.cream}>三个版本，你选哪个？</text>
              </svg>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center', opacity: endO * eo(T, HIT.END + 1.3, 0.4) }}>
                <div style={{ padding: '10px 36px', borderRadius: 40, border: `1.5px solid ${C.gold}`, fontFamily: F.sans, fontWeight: 500, fontSize: 30, letterSpacing: '0.2em', color: C.gold }}>{JUNO.follow}</div>
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', opacity: endO * eo(T, HIT.END + 1.6, 0.4), fontFamily: F.sans, fontSize: 26, color: 'rgba(239,232,218,.88)', lineHeight: '38px' }}>
                <div>资料：TechCrunch · Fox Business · Electrek（2026年10月15日）</div>
                <div>画面为示意，车辆为原创造型</div>
              </div>
            </>
          )}
          <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9 * markO, fontFamily: F.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,.6)' }}><span style={{ color: '#e3b765' }}>◆ </span>{JUNO.mark}</div>
          <Subs T={T} lines={LINES as any} />
          <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: 0 * pr(T, FIN - 0.3, 0.3) }} />
        </>
      )}
    </AbsoluteFill>
  );
};
const Ind: React.FC<{ s: string; o: number }> = ({ s, o }) => (
  <div style={{ position: 'absolute', left: 64, top: 150, opacity: o, fontFamily: F.sans, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', color: 'rgba(243,237,226,.85)', padding: '6px 16px', borderRadius: 6, background: 'rgba(8,6,5,.55)' }}>{s}</div>
);
void glowDot;
