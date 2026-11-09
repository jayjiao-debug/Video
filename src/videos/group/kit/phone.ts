// Phone screen for 《你的朋友，有几个也把你当朋友？》 lines 17-19: an ORIGINAL chat app drawn on a 2D canvas, so the same
// drawing is the texture on the 3D phone in the dorm and the full-screen close-up (overlay.tsx <PhoneScreen>).
// Owner rule: it must not look like WeChat. So: deep indigo ground, no green anywhere, rounded CARD rows (not ruled
// rows), a left-aligned big title with filter chips, a floating coral compose button, gold sent bubbles and pale
// lavender received bubbles with one tight corner (no triangle tails), round avatars with the film's white round
// heads, a short conversation top-aligned under the header. No typing indicator, no read ticks, no brand.
//
// ===================================================================================================================
// API
// ===================================================================================================================
//  loadOverlayFonts(): Promise<void>     loads Noto Sans SC Bold (public/bt/sans700.ttf) as "FrSans" (weight 700).
//                                        Await it once before the first drawPhoneScreen (canvas text needs the face).
//  FONT_STACK                            CSS font-family list used by every overlay ("FrSans", fallbacks).
//
//  drawPhoneScreen(ctx, w, h, state)     draws the whole screen into ctx at 0,0 .. w,h (clears first). Pure: the
//                                        picture is a function of `state` only. Layout is in iPhone-like points
//                                        (390 pt wide, k = w / 390); h sets how tall the screen is (h / k pt).
//                                        Recommended texture: 780 x 1688 (19.5:9, k = 2) or 1000 x 2164 for the close-up.
//  phoneStateAt(t, cue?, over?)          PhoneState at t frames after the phone sequence starts (springs, pure).
//      cue (frames, relative): { tap, open, video, ask, reply, glow }   default PHONE_CUE
//        tap   finger tap on the picked contact row (ripple 12 f)      open  chat slides in over the list
//        video the sent video message pops in                           ask   the bubble 你给我打几分？ pops in
//        reply the friend's "5" pops in (default: never)                glow  gold glow ring on the "5"
//      over: any PhoneState fields to force (thumb, clock, viewBottom, contacts, pick ...).
//  PhoneState fields (all optional when passed to drawPhoneScreen; DEFAULT_PHONE fills the rest):
//      clock "21:36" · contacts CONTACTS · pick 1 (row index of the friend) · tap 0..1 · slide 0 list .. 1 chat
//      video / ask / reply: arrival progress 0 (absent) .. 1 (in place; spring values may overshoot) · glow 0..1
//      thumb: CanvasImageSource | null (the sent video's poster: frame 0 of the film; null draws a stand-in) ·
//      duration "1:16" · askText · replyText · viewBottom: pt below which messages may not go (the list scrolls up
//      like a real chat when they would; default = just above the input bar).
//  PHONE_W_PT = 390                      logical width in points.
//
//  Example (3D texture, built once, redrawn only when the state changes):
//    await loadOverlayFonts();
//    const cv = document.createElement("canvas"); cv.width = 780; cv.height = 1688;
//    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
//    // per frame:
//    drawPhoneScreen(cv.getContext("2d")!, 780, 1688, phoneStateAt(f - 1905, { tap: 20, open: 28, video: 120, ask: 150 }, { thumb: posterImg }));
//    tex.needsUpdate = true;
import { spring, staticFile } from "remotion";

export const OVERLAY_FONT = "FrSans";
export const FONT_STACK = `${OVERLAY_FONT}, "Noto Sans SC", "Noto Sans CJK SC", "WenQuanYi Zen Hei", sans-serif`;
let fontP: Promise<void> | null = null;
let fontOk = false;
export const overlayFontReady = () => fontOk;
export function loadOverlayFonts(): Promise<void> {
  if (!fontP) {
    fontP = (async () => {
      if (typeof document === "undefined") return;
      const ff = new FontFace(OVERLAY_FONT, `url(${staticFile("bt/sans700.ttf")})`, { weight: "700" });
      await ff.load();
      (document.fonts as any).add(ff);
      fontOk = true;
    })();
  }
  return fontP;
}

export const PHONE_W_PT = 390;

export type Contact = { name: string; preview: string; time: string; unread?: number; bg: string; hair?: string; shirt: string; group?: boolean };
/** generic campus contacts (no real people, no brands). Row 1 is the friend you would rate 5. */
export const CONTACTS: Contact[] = [
  { name: "室友老周", preview: "明早八点的课，别迟到", time: "21:12", unread: 2, bg: "#6c7cff", hair: "#3a2a20", shirt: "#ff8a65" },
  { name: "阿乐", preview: "哈哈哈哈哈哈哈", time: "20:47", bg: "#ff9d5c", hair: "#2b2b33", shirt: "#3f51b5" },
  { name: "小组作业", preview: "PPT 我改完了，大家看看", time: "19:30", unread: 5, bg: "#b388ff", shirt: "#ffd54f", group: true },
  { name: "林同学", preview: "笔记发你了", time: "18:05", bg: "#4fc3f7", hair: "#5a3b24", shirt: "#e57373" },
  { name: "饭搭子", preview: "明天食堂二楼？", time: "昨天", bg: "#f06292", hair: "#1f1f26", shirt: "#ffffff" },
  { name: "健身搭子", preview: "今天练腿，六点楼下见", time: "昨天", bg: "#ffb74d", shirt: "#5c6bc0" },
  { name: "表姐", preview: "降温了，多穿点", time: "周日", bg: "#7986cb", hair: "#3b2a22", shirt: "#ef9a9a" },
  { name: "社团群", preview: "周五排练改到七点", time: "周六", bg: "#ff8a80", shirt: "#90caf9", group: true },
];

export type PhoneState = {
  clock: string;
  contacts: Contact[];
  pick: number;
  tap: number;
  slide: number;
  video: number;
  ask: number;
  reply: number;
  glow: number;
  thumb: CanvasImageSource | null;
  duration: string;
  askText: string;
  replyText: string;
  viewBottom?: number;
};
export const DEFAULT_PHONE: PhoneState = {
  clock: "21:36", contacts: CONTACTS, pick: 1, tap: 0, slide: 0, video: 0, ask: 0, reply: 0, glow: 0, thumb: null,
  duration: "1:16", askText: "你给我打几分？", replyText: "5",
};

export type PhoneCue = { tap?: number; open?: number; video?: number; ask?: number; reply?: number; glow?: number };
export const PHONE_CUE: Required<PhoneCue> = { tap: 10, open: 18, video: 36, ask: 58, reply: 1e9, glow: 1e9 };
const S_UI = { damping: 18, stiffness: 170, mass: 0.8 };
const S_POP = { damping: 11, stiffness: 220, mass: 0.7 };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const sAt = (t: number, at: number, cfg: { damping: number; stiffness: number; mass: number }) =>
  t < at ? 0 : spring({ frame: t - at, fps: 30, config: cfg });

export function phoneStateAt(t: number, cue: PhoneCue = {}, over: Partial<PhoneState> = {}): PhoneState {
  const c = { ...PHONE_CUE, ...cue };
  return {
    ...DEFAULT_PHONE,
    tap: t >= c.tap ? clamp01((t - c.tap) / 12) : 0,
    slide: clamp01(sAt(t, c.open, S_UI)),
    video: sAt(t, c.video, S_POP),
    ask: sAt(t, c.ask, S_POP),
    reply: sAt(t, c.reply, S_POP),
    glow: t >= c.glow ? clamp01((t - c.glow) / 10) : 0,
    ...over,
  };
}

// ------------------------------------------------------------------------------------------------ palette
const P = {
  bg0: "#131838", bg1: "#0c1029", card: "#1a2047", cardHi: "#252d5e", head: "#161c42", text: "#f4f1ff", sub: "#8f97c4",
  faint: "#6c75a6", coral: "#ff6b5a", gold0: "#ffd970", gold1: "#ffb13b", goldText: "#2a1c00", recv: "#eceeff",
  recvText: "#161a36", chip: "#1f2654", ink: "#0b0d18",
};
const F = (pt: number) => `700 ${pt}px ${FONT_STACK}`;

type C2 = CanvasRenderingContext2D;
const rr = (g: C2, x: number, y: number, w: number, h: number, r: number | number[]) => {
  g.beginPath();
  (g as any).roundRect(x, y, w, h, r);
};

/** round avatar: coloured disc, bean shoulders in a shirt colour, the film's white round head with dot eyes */
export function drawAvatar(g: C2, cx: number, cy: number, r: number, c: Pick<Contact, "bg" | "hair" | "shirt" | "group">) {
  g.save();
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = c.bg; g.fill();
  g.clip();
  const heads = c.group ? [[-0.36, 0.1, 0.72], [0.36, 0.1, 0.72], [0, 0.18, 0.86]] : [[0, 0.12, 1]];
  for (const [ox, oy, s] of heads) {
    const hx = cx + ox * r, hy = cy + oy * r, hr = r * 0.6 * s;
    g.beginPath(); g.ellipse(hx, hy + hr * 1.75, hr * 1.25, hr * 0.85, 0, 0, Math.PI * 2); g.fillStyle = c.shirt; g.fill();
    g.lineWidth = Math.max(1, r * 0.06); g.strokeStyle = "rgba(20,18,30,0.85)"; g.stroke();
    g.beginPath(); g.arc(hx, hy, hr, 0, Math.PI * 2); g.fillStyle = "#ffffff"; g.fill(); g.stroke();
    if (c.hair && !c.group) {
      g.beginPath(); g.arc(hx, hy, hr, Math.PI * 1.08, Math.PI * 1.92); g.quadraticCurveTo(hx + hr * 0.2, hy - hr * 0.45, hx - hr * 0.94, hy - hr * 0.3);
      g.closePath(); g.fillStyle = c.hair; g.fill();
    }
    g.fillStyle = "#1a1820";
    for (const ex of [-0.34, 0.34]) { g.beginPath(); g.arc(hx + ex * hr, hy + hr * 0.08, hr * 0.1, 0, Math.PI * 2); g.fill(); }
    g.beginPath(); g.arc(hx, hy + hr * 0.3, hr * 0.28, Math.PI * 0.2, Math.PI * 0.8); g.lineWidth = hr * 0.09; g.strokeStyle = "#1a1820"; g.stroke();
  }
  g.restore();
}

/** stand-in poster for the sent video when no image is passed: you, mid-floor, ten gold ropes, warm lamp light */
export function drawThumbStandIn(g: C2, x: number, y: number, w: number, h: number) {
  g.save();
  g.beginPath(); g.rect(x, y, w, h); g.clip();
  const bg = g.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, "#3a2f5c"); bg.addColorStop(0.5, "#a77c58"); bg.addColorStop(1, "#e7c08a");
  g.fillStyle = bg; g.fillRect(x, y, w, h);
  g.fillStyle = "rgba(255,226,160,0.3)"; g.beginPath(); g.ellipse(x + w * 0.5, y + h * 0.3, w * 0.7, h * 0.25, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = "rgba(60,40,30,0.35)"; g.fillRect(x, y + h * 0.84, w, h * 0.16);
  const cx = x + w * 0.5, cy = y + h * 0.72, hr = w * 0.11;
  for (let i = 0; i < 10; i++) {
    const ang = Math.PI * (1.05 + (i / 9) * 0.9) + (i % 2 ? 0.05 : -0.05);
    const ex = cx + Math.cos(ang) * w * 0.95, ey = cy - hr * 0.3 + Math.sin(ang) * h * 0.75;
    const sx = cx + (i < 5 ? -1 : 1) * hr * 0.9, sy = cy + hr * 0.9;
    g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo((sx + ex) / 2, (sy + ey) / 2 + h * 0.03, ex, ey);
    g.lineWidth = w * 0.024; g.strokeStyle = "#5a3a08"; g.stroke();
    g.lineWidth = w * 0.014; g.strokeStyle = "#f0b631"; g.stroke();
  }
  g.lineWidth = w * 0.014; g.strokeStyle = "#1a1820";
  g.beginPath(); g.ellipse(cx, cy + hr * 1.7, hr * 0.95, hr * 1.25, 0, 0, Math.PI * 2); g.fillStyle = "#3f51b5"; g.fill(); g.stroke();
  g.beginPath(); g.arc(cx, cy - hr * 0.1, hr, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill(); g.stroke();
  g.fillStyle = "#1a1820";
  for (const ex of [-0.33, 0.33]) { g.beginPath(); g.arc(cx + ex * hr, cy - hr * 0.05, hr * 0.1, 0, Math.PI * 2); g.fill(); }
  g.restore();
}

const srcSize = (im: CanvasImageSource): [number, number] => {
  const a = im as any;
  return [a.naturalWidth || a.videoWidth || a.displayWidth || a.width || 1, a.naturalHeight || a.videoHeight || a.displayHeight || a.height || 1];
};

const ellipsize = (g: C2, s: string, maxW: number) => {
  if (g.measureText(s).width <= maxW) return s;
  let t = s;
  while (t.length > 1 && g.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
};

function drawStatus(g: C2, clock: string) {
  g.fillStyle = P.text; g.font = F(15); g.textBaseline = "alphabetic"; g.textAlign = "left";
  g.fillText(clock, 28, 31);
  g.beginPath(); g.arc(195, 22, 5.5, 0, Math.PI * 2); g.fillStyle = "#05060c"; g.fill();
  // signal bars
  g.fillStyle = P.text;
  for (let i = 0; i < 4; i++) { rr(g, 290 + i * 5.5, 29 - (4 + i * 2.6), 3.6, 4 + i * 2.6, 1); g.fill(); }
  // wifi-ish arcs
  g.strokeStyle = P.text; g.lineCap = "round"; g.lineWidth = 2;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(323, 30, 3 + i * 3.6, Math.PI * 1.25, Math.PI * 1.75); g.stroke(); }
  // battery
  g.lineWidth = 1.4; g.strokeStyle = "rgba(244,241,255,0.7)"; rr(g, 342, 20, 25, 12, 3.5); g.stroke();
  g.fillStyle = P.text; rr(g, 344.2, 22.2, 15, 7.6, 2); g.fill();
  rr(g, 368, 24, 2, 4, 1); g.fill();
}

function drawContacts(g: C2, H: number, s: PhoneState) {
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, P.bg0); bg.addColorStop(1, P.bg1);
  g.fillStyle = bg; g.fillRect(0, 0, PHONE_W_PT, H);
  g.textAlign = "left"; g.textBaseline = "alphabetic";
  g.fillStyle = P.text; g.font = F(31); g.fillText("聊天", 20, 94);
  // search button + my avatar
  g.beginPath(); g.arc(306, 84, 19, 0, Math.PI * 2); g.fillStyle = P.chip; g.fill();
  g.strokeStyle = "#dfe3ff"; g.lineWidth = 2.4; g.lineCap = "round";
  g.beginPath(); g.arc(303.5, 81.5, 6.5, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(308.5, 86.5); g.lineTo(313, 91); g.stroke();
  drawAvatar(g, 352, 84, 19, { bg: "#ffc53d", hair: "#2a2320", shirt: "#e65a4a" });
  // filter chips
  const chips: [string, boolean][] = [["全部", true], ["未读 2", false], ["群聊", false], ["好友", false]];
  let cx = 20;
  g.font = F(14);
  for (const [t, on] of chips) {
    const w = g.measureText(t).width + 26;
    rr(g, cx, 112, w, 30, 15); g.fillStyle = on ? "#ffc53d" : P.chip; g.fill();
    g.fillStyle = on ? P.goldText : "#c5cbef"; g.fillText(t, cx + 13, 132);
    cx += w + 8;
  }
  // rows
  const y0 = 156, rowH = 74, gap = 8;
  s.contacts.forEach((c, i) => {
    const y = y0 + i * (rowH + gap);
    if (y > H - 10) return;
    const picked = i === s.pick && s.tap > 0;
    g.save();
    rr(g, 12, y, 366, rowH, 20); g.fillStyle = picked ? P.cardHi : P.card; g.fill();
    if (picked) {
      g.clip();
      const t = s.tap;
      g.beginPath(); g.arc(200, y + rowH / 2, 20 + 300 * t, 0, Math.PI * 2); g.fillStyle = `rgba(255,255,255,${0.22 * (1 - t)})`; g.fill();
    }
    g.restore();
    if (picked) { rr(g, 12, y, 366, rowH, 20); g.strokeStyle = `rgba(255,197,61,${Math.min(1, s.tap * 3)})`; g.lineWidth = 2.5; g.stroke(); }
    drawAvatar(g, 50, y + rowH / 2, 25, c);
    g.textAlign = "left";
    g.fillStyle = P.text; g.font = F(17); g.fillText(c.name, 88, y + 31);
    g.fillStyle = P.sub; g.font = F(14); g.fillText(ellipsize(g, c.preview, 222), 88, y + 55);
    g.textAlign = "right"; g.fillStyle = "#7f88b6"; g.font = F(12); g.fillText(c.time, 364, y + 28);
    if (c.unread) {
      g.beginPath(); g.arc(353, y + 50, 10.5, 0, Math.PI * 2); g.fillStyle = P.coral; g.fill();
      g.textAlign = "center"; g.fillStyle = "#fff"; g.font = F(12); g.fillText(String(c.unread), 353, y + 54.5);
    }
  });
  // floating compose button
  g.save();
  g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 14; g.shadowOffsetY = 5;
  g.beginPath(); g.arc(342, H - 66, 28, 0, Math.PI * 2); g.fillStyle = P.coral; g.fill();
  g.restore();
  g.strokeStyle = "#fff"; g.lineWidth = 3.2; g.lineCap = "round";
  g.beginPath(); g.moveTo(342, H - 77); g.lineTo(342, H - 55); g.moveTo(331, H - 66); g.lineTo(353, H - 66); g.stroke();
}

function drawChat(g: C2, H: number, s: PhoneState) {
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#10153a"); bg.addColorStop(1, "#151b45");
  g.fillStyle = bg; g.fillRect(0, 0, PHONE_W_PT, H);
  // faint dot pattern
  g.fillStyle = "rgba(255,255,255,0.035)";
  for (let yy = 118; yy < H; yy += 26) for (let xx = 13 + ((yy / 26) % 2) * 13; xx < PHONE_W_PT; xx += 26) { g.fillRect(xx, yy, 2, 2); }
  const inputTop = H - 34 - 48;
  const viewBottom = Math.min(s.viewBottom ?? inputTop - 10, inputTop - 10);
  const friend = s.contacts[s.pick] ?? CONTACTS[1];

  // ---- message stack (top-aligned, scrolls up if it would pass viewBottom)
  type Item = { h: number; p: number; draw: (y: number) => void };
  const items: Item[] = [];
  const dateH = 34;
  items.push({ h: dateH, p: 1, draw: (y) => {
    g.font = F(12); const t = `今天 ${s.clock}`; const w = g.measureText(t).width + 22;
    rr(g, 195 - w / 2, y + 2, w, 22, 11); g.fillStyle = "rgba(255,255,255,0.08)"; g.fill();
    g.fillStyle = P.sub; g.textAlign = "center"; g.fillText(t, 195, y + 17.5);
  } });
  if (s.video > 0) {
    const vw = 116, vh = 206;
    items.push({ h: vh + 12, p: s.video, draw: (y) => {
      const p = s.video, x0 = 376 - vw;
      g.save();
      g.globalAlpha = clamp01(p * 2.2);
      g.translate(376, y + vh); g.scale(0.55 + 0.45 * p, 0.55 + 0.45 * p); g.translate(-376, -(y + vh));
      g.translate(0, (1 - Math.min(1, p)) * 30);
      g.save();
      rr(g, x0, y, vw, vh, 16); g.clip();
      if (s.thumb) {
        const [iw, ih] = srcSize(s.thumb); const sc = Math.max(vw / iw, vh / ih);
        g.drawImage(s.thumb, x0 + (vw - iw * sc) / 2, y + (vh - ih * sc) / 2, iw * sc, ih * sc);
      } else drawThumbStandIn(g, x0, y, vw, vh);
      const sh = g.createLinearGradient(0, y + vh * 0.6, 0, y + vh);
      sh.addColorStop(0, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,0.55)");
      g.fillStyle = sh; g.fillRect(x0, y, vw, vh);
      g.restore();
      rr(g, x0, y, vw, vh, 16); g.strokeStyle = "#ffc53d"; g.lineWidth = 2.5; g.stroke();
      const pcx = x0 + vw / 2, pcy = y + vh / 2;
      g.beginPath(); g.arc(pcx, pcy, 21, 0, Math.PI * 2); g.fillStyle = "rgba(10,12,28,0.55)"; g.fill();
      g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 2; g.stroke();
      g.beginPath(); g.moveTo(pcx - 6, pcy - 9); g.lineTo(pcx + 10, pcy); g.lineTo(pcx - 6, pcy + 9); g.closePath(); g.fillStyle = "#fff"; g.fill();
      g.font = F(11); const dw = g.measureText(s.duration).width + 12;
      rr(g, x0 + 8, y + vh - 26, dw, 18, 9); g.fillStyle = "rgba(0,0,0,0.55)"; g.fill();
      g.fillStyle = "#fff"; g.textAlign = "left"; g.fillText(s.duration, x0 + 14, y + vh - 13);
      g.restore();
    } });
  }
  if (s.ask > 0) {
    const bh = 48;
    items.push({ h: bh + 14, p: s.ask, draw: (y) => {
      const p = s.ask;
      g.font = F(19); const w = g.measureText(s.askText).width + 34 - (/[，。？！：；、]$/.test(s.askText) ? 19 * 0.42 : 0), x0 = 376 - w;
      g.save();
      g.globalAlpha = clamp01(p * 2.2);
      g.translate(376, y + bh); g.scale(0.5 + 0.5 * p, 0.5 + 0.5 * p); g.translate(-376, -(y + bh));
      g.translate(0, (1 - Math.min(1, p)) * 24);
      const gr = g.createLinearGradient(0, y, 0, y + bh); gr.addColorStop(0, P.gold0); gr.addColorStop(1, P.gold1);
      rr(g, x0, y, w, bh, [24, 24, 7, 24]); g.fillStyle = gr; g.fill();
      g.fillStyle = P.goldText; g.textAlign = "left"; g.fillText(s.askText, x0 + 17, y + 31.5);
      g.restore();
    } });
  }
  if (s.reply > 0) {
    const bh = 58;
    items.push({ h: bh + 14, p: s.reply, draw: (y) => {
      const p = s.reply;
      g.font = F(30); const w = Math.max(58, g.measureText(s.replyText).width + 36), x0 = 58;
      g.save();
      g.globalAlpha = clamp01(p * 2.2);
      drawAvatar(g, 31, y + bh - 17, 17, friend);
      g.translate(x0, y + bh); g.scale(0.4 + 0.6 * p, 0.4 + 0.6 * p); g.translate(-x0, -(y + bh));
      if (s.glow > 0) {
        g.save(); g.shadowColor = `rgba(255,190,60,${0.9 * s.glow})`; g.shadowBlur = 26 * s.glow;
        rr(g, x0, y, w, bh, [26, 26, 26, 7]); g.fillStyle = P.recv; g.fill(); g.restore();
        rr(g, x0 - 3, y - 3, w + 6, bh + 6, [29, 29, 29, 9]); g.strokeStyle = `rgba(255,197,61,${s.glow})`; g.lineWidth = 3; g.stroke();
      }
      rr(g, x0, y, w, bh, [26, 26, 26, 7]); g.fillStyle = P.recv; g.fill();
      g.fillStyle = P.recvText; g.textAlign = "center"; g.fillText(s.replyText, x0 + w / 2, y + 40);
      g.restore();
    } });
  }
  const top = 116;
  const GAP = 14; // trailing gap of the last item does not count against viewBottom
  const total = items.reduce((a, it) => a + it.h * Math.min(1, it.p), 0) - GAP * Math.min(1, items[items.length - 1].p);
  const scroll = Math.max(0, top + total - viewBottom);
  g.save();
  g.beginPath(); g.rect(0, 104, PHONE_W_PT, inputTop - 104); g.clip();
  let y = top - scroll;
  for (const it of items) { it.draw(y); y += it.h * Math.min(1, it.p); }
  g.restore();

  // ---- header
  g.fillStyle = P.head; g.fillRect(0, 0, PHONE_W_PT, 104);
  g.fillStyle = "rgba(255,255,255,0.06)"; g.fillRect(0, 103, PHONE_W_PT, 1);
  g.strokeStyle = "#e6e9ff"; g.lineWidth = 2.8; g.lineCap = "round"; g.lineJoin = "round";
  g.beginPath(); g.moveTo(25, 63); g.lineTo(15, 74); g.lineTo(25, 85); g.stroke();
  drawAvatar(g, 58, 74, 19, friend);
  g.fillStyle = P.text; g.font = F(18); g.textAlign = "left"; g.fillText(friend.name, 86, 81);
  g.fillStyle = "#c7ccef";
  for (const dx of [-8, 0, 8]) { g.beginPath(); g.arc(360 + dx, 74, 2.3, 0, Math.PI * 2); g.fill(); }

  // ---- input bar
  const cy = inputTop + 24;
  g.fillStyle = "rgba(10,13,34,0.9)"; g.fillRect(0, inputTop - 8, PHONE_W_PT, H - inputTop + 8);
  g.beginPath(); g.arc(36, cy, 21, 0, Math.PI * 2); g.fillStyle = P.chip; g.fill();
  g.strokeStyle = "#c5cbef"; g.lineWidth = 2.4;
  g.beginPath(); g.moveTo(36, cy - 8); g.lineTo(36, cy + 8); g.moveTo(28, cy); g.lineTo(44, cy); g.stroke();
  rr(g, 66, inputTop + 1, 250, 46, 23); g.fillStyle = "#1c2350"; g.fill();
  g.fillStyle = P.faint; g.font = F(15); g.textAlign = "left"; g.fillText("发消息…", 84, cy + 5.5);
  g.beginPath(); g.arc(346, cy, 23, 0, Math.PI * 2); g.fillStyle = "#ffc53d"; g.fill();
  g.strokeStyle = P.goldText; g.lineWidth = 2.8;
  g.beginPath(); g.moveTo(346, cy + 9); g.lineTo(346, cy - 8); g.moveTo(338.5, cy - 1); g.lineTo(346, cy - 9); g.lineTo(353.5, cy - 1); g.stroke();
}

export function drawPhoneScreen(ctx: CanvasRenderingContext2D, w: number, h: number, state: Partial<PhoneState> = {}) {
  const s: PhoneState = { ...DEFAULT_PHONE, ...state };
  const k = w / PHONE_W_PT, H = h / k;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.scale(k, k);
  const slide = clamp01(s.slide);
  if (slide < 0.999) {
    ctx.save(); ctx.translate(-slide * 110, 0); drawContacts(ctx, H, s); ctx.restore();
    if (slide > 0) { ctx.fillStyle = `rgba(0,0,0,${0.45 * slide})`; ctx.fillRect(0, 0, PHONE_W_PT, H); }
  }
  if (slide > 0.001) {
    ctx.save();
    ctx.translate((1 - slide) * PHONE_W_PT, 0);
    if (slide < 1) { ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(-14, 0, 14, H); }
    ctx.beginPath(); ctx.rect(0, 0, PHONE_W_PT, H); ctx.clip();
    drawChat(ctx, H, s);
    ctx.restore();
  }
  drawStatus(ctx, s.clock);
  ctx.fillStyle = "rgba(244,241,255,0.75)"; rr(ctx, 195 - 67, H - 9, 134, 5, 2.5); ctx.fill();
  ctx.restore();
}
