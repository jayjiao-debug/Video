// THE SKULL ON THE APOTHECARY'S BOTTLE (v5, 23 Nov 2026, the owner on the v4 cut: "Draw a skull label on the potion").
// One painter for the bottle in Romeo's hand (acc/held2.ts darkBottleHeld) and the one that lies on the vault's floor
// (props/things.ts darkBottle), so the two are the same bottle.
//   skullMark(c, cx, cy, h, o)   a skull over crossed bones in ink, centred on (cx, cy), h px high; o.sx stretches it
//                                across (a label round a bottle is wider in the map than on the glass)
//   bottleLabel(c, W, H, v0, v1) the bottle's whole paint on a W x H map (u round the bottle, v up its profile): the
//                                plum glass with its highlights, a paper label from v0 to v1 with a red rule top and
//                                bottom, and the skull in the middle of the map (u 0.5). Returns nothing.
// The skull is ONE mark on the label, as on a real bottle; the label is kept toward the lens (world.ts turns the part
// named LABEL_SPIN about the bottle's own axis every frame: the glass is round, so nothing else is seen to turn).
type G2 = CanvasRenderingContext2D;
export const LABEL_SPIN = "rjLabelSpin";
/** the azimuth (rad about the bottle's axis, from +z toward +x) of the middle of the map: where the skull is */
export const LABEL_AT = Math.PI;
export const BOTTLE = { glass: "#4a3246", glassHi: "#9a7a94", glassLo: "#33212f", paper: "#eadfc2", paperLo: "#d2c29c", ink: "#2a1a18", red: "#a3232b" } as const;

export const skullMark = (c: G2, cx: number, cy: number, h: number, o: { sx?: number; ink?: string; paper?: string } = {}) => {
  const ink = o.ink ?? BOTTLE.ink, paper = o.paper ?? BOTTLE.paper, u = h / 100;
  c.save(); c.translate(cx, cy); c.scale(u * (o.sx ?? 1), u);
  // the crossed bones, behind the jaw: two bars with a pair of knobs at each end
  c.strokeStyle = ink; c.fillStyle = ink; c.lineCap = "round"; c.lineWidth = 10;
  for (const d of [-1, 1]) {
    c.beginPath(); c.moveTo(-34 * d, 12); c.lineTo(34 * d, 42); c.stroke();
    for (const [x, y] of [[-34 * d, 12], [34 * d, 42]] as const) for (const k of [-1, 1]) { c.beginPath(); c.arc(x + k * 3.6 * d, y - k * 4.6, 6.2, 0, Math.PI * 2); c.fill(); }
  }
  // the skull: a round cranium, a narrower jaw
  c.beginPath(); c.arc(0, -14, 30, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.moveTo(-18, 2); c.lineTo(18, 2); c.lineTo(16, 26); c.quadraticCurveTo(0, 34, -16, 26); c.closePath(); c.fill();
  // the eye holes, the nose, the gaps between the teeth
  c.fillStyle = paper;
  for (const d of [-1, 1]) { c.beginPath(); c.ellipse(12.5 * d, -11, 8.6, 10, -0.18 * d, 0, Math.PI * 2); c.fill(); }
  c.beginPath(); c.moveTo(0, 0); c.lineTo(-4.8, 9.5); c.lineTo(4.8, 9.5); c.closePath(); c.fill();
  c.strokeStyle = paper; c.lineWidth = 2.8; c.lineCap = "butt";
  for (const x of [-7.5, 0, 7.5]) { c.beginPath(); c.moveTo(x, 17); c.lineTo(x, 30); c.stroke(); }
  c.restore();
};

export const bottleLabel = (c: G2, W: number, H: number, v0: number, v1: number, o: { sx?: number } = {}) => {
  const y = (v: number) => H * (1 - v), top = y(v1), bot = y(v0), lh = bot - top;
  c.fillStyle = BOTTLE.glass; c.fillRect(0, 0, W, H);
  // the glass: a soft dark side and two long highlights (one each side of the label's middle: one always shows)
  for (const u of [0.31, 0.69]) { c.fillStyle = BOTTLE.glassHi; c.globalAlpha = 0.85; c.fillRect(W * u - W * 0.012, H * 0.08, W * 0.024, H * 0.84); }
  c.globalAlpha = 1;
  // the paper label: three quarters of the way round, its ends at the back (u 0 / 1), a red rule along each edge
  const x0 = W * 0.14, x1 = W * 0.86;
  c.fillStyle = BOTTLE.paper; c.fillRect(x0, top, x1 - x0, lh);
  c.fillStyle = BOTTLE.paperLo; c.fillRect(x0, top, W * 0.012, lh); c.fillRect(x1 - W * 0.012, top, W * 0.012, lh);
  c.fillStyle = BOTTLE.red; c.fillRect(x0, top + lh * 0.045, x1 - x0, lh * 0.05); c.fillRect(x0, bot - lh * 0.095, x1 - x0, lh * 0.05);
  skullMark(c, W / 2, top + lh * 0.5 + lh * 0.01, lh * 0.74, { sx: o.sx });
};
