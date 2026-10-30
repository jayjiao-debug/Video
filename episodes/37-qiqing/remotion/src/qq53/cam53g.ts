import {spline, sstep} from './cam53';
import {seg, cl} from '../qq50/kit50';
import {Cam, lookAt, proj, V3} from './parts53';
import {camAt} from './paper53c';
import {aCenter} from './cam53c';
/* ep53 v3 · TakeG camera (51.954 → 92.709), pure functions of film t. ONE move: it starts as the paper test's face-on camera at
   v2 56.482 (paper53c.camAt: 76 px/cm on the blade, the axis on y 639, the screen centre over a = 21.1 cm), keeps the inscription
   glide's speed (0.83 cm/s toward the tip), drops low and tilts toward the tip (the blade recedes to the left), glides along the
   blade one story scene per line, pushes in for G6, then rises and slides back to the very same face-on view by 92.709.
   World = paper53c's world at 56.482: the blade's front face is the plane y = 0, a (cm from the pommel end) along +x (screen left),
   w (cm across) along +z (screen up). */
export const T0F = 1559 / 30, T1F = 2781 / 30;      // the first and the last frame of TakeG (frames 1559 and 2781)
export const C0: Cam = camAt(56.482);
export const A_C0 = aCenter(56.482);                 // 21.1
const W_C0 = 1.3, D0 = -C0.p[1], F0 = C0.f;
/** paper53c's world (cm): blade point (a, w) → V3 */
export const worldG = (a: number, w: number): V3 => [C0.p[0] + (a - A_C0), 0, C0.p[2] - W_C0 + w];
/** the line starts (MUSIC_NOTES_v3 rows 11–18) */
export const GS = [51.954, 57.048, 61.577, 67.237, 71.766, 77.426, 81.388, 87.049, 92.709];
/* the glide along a: a slow, nearly constant drift toward the tip (fix4: 0.34 cm/s ≈ 2 px a frame once low), carried on from the
   inscription glide's 0.83 cm/s; it slows to 0.2 cm/s on the seat (G5 + G6, so the push-in stays on him), then the return
   (an eased slide back to a = 21.1, zero speed at 92.7) takes over from 85.4 */
const vA = (t: number) => { const base = 0.34 + 0.49 * (1 - sstep(seg(t, T0F, 53.5))), slow = sstep(seg(t, 72.0, 73.2)) * (1 - sstep(seg(t, 80.4, 81.6)));
	return base * (1 - slow) + 0.2 * slow; };
const DT = 1 / 300, NA = Math.ceil((T1F - T0F) / DT) + 2, AINT = new Float64Array(NA);
for (let i = 1; i < NA; i++) AINT[i] = AINT[i - 1] + 0.5 * (vA(T0F + (i - 1) * DT) + vA(T0F + i * DT)) * DT;
const aGlide = (t: number) => { const x = cl((t - T0F) / DT, 0, NA - 1.001), i = Math.floor(x); return A_C0 + AINT[i] + (AINT[i + 1] - AINT[i]) * (x - i); };
const R0 = 85.4;
const aT = (t: number) => { const u = sstep(seg(t, R0, T1F)); return aGlide(t) * (1 - u) + A_C0 * u; };
/** where scene i sits on the blade (a, cm from the pommel end): under the camera at the middle of its line; G5 and G6 share the
    seat (the middle of the slow stretch); G7 is centred a little before its hit; G8 clears where G7 was */
export const GA = [aGlide(55.2), aGlide((GS[1] + GS[2]) / 2), aGlide((GS[2] + GS[3]) / 2), aGlide((GS[3] + GS[4]) / 2), aGlide(76.6), aGlide(76.6), aGlide(84.0), aGlide(84.0)];
/* height (w at the screen's centre line), distance, tilt toward the tip, lens: face-on at both ends; low and tilted in between;
   G6 pushes in on the seat; the return rises a little higher than the hand-off view, then settles onto it */
/* fix4 (review #6, #10): the glide runs 15 % lower (19 → 16.2 cm) and looks a little lower (w −0.15 → −0.42: the vignettes stand
   on the lower half, heads under the ridge); G8 stays close (the blade ≥ 45 % of the frame height until 91.5, the lobe on
   「还亮着」 89.8), then rises into the hand-off view */
const DG = 16.2, WG0 = -0.42;
const wT = spline([[T0F, W_C0, 0], [52.1, W_C0], [56.2, WG0, 0], [GS[5] + 0.1, WG0, 0], [GS[5] + 2.5, -0.6, 0], [GS[6] - 1.0, -0.6, 0], [GS[6] + 1.5, WG0, 0], [86.9, WG0, 0], [89.6, 0.12], [91.4, 0.6], [T1F, W_C0, 0]]);
const lnD = spline([[T0F, Math.log(D0), 0], [52.1, Math.log(D0)], [56.2, Math.log(DG), 0], [84.6, Math.log(DG), 0], [87.6, Math.log(23.5)], [89.6, Math.log(25)], [91.4, Math.log(27)], [T1F, Math.log(D0), 0]]);
const thT = spline([[T0F, 0, 0], [52.1, 0], [56.2, 0.36, 0], [85.6, 0.36, 0], [90.5, 0.05], [T1F, 0, 0]]);
const lnF = spline([[T0F, Math.log(F0), 0], [52.1, Math.log(F0)], [56.2, Math.log(2900), 0], [GS[5] + 0.1, Math.log(2900), 0], [GS[5] + 2.5, Math.log(3400), 0], [GS[6] - 1.0, Math.log(3400), 0], [GS[6] + 1.5, Math.log(2900), 0], [84.6, Math.log(2900), 0], [87.6, Math.log(2600)], [89.6, Math.log(2520)], [T1F, Math.log(F0), 0]]);
/** the camera's parameters at t: a, w at the screen centre; distance d (cm) from the face; tilt th (rad) toward the tip; lens f */
export const glideAt = (t: number) => { const u = Math.min(Math.max(t, T0F), T1F);
	return {a: aT(u), w: wT(u), d: Math.exp(lnD(u)), th: thT(u), f: Math.exp(lnF(u))}; };
export const camG = (t: number): Cam => { const g = glideAt(t), tg = worldG(g.a, g.w);
	if (t <= T0F || t >= T1F) return C0;
	return lookAt([tg[0] - g.d * Math.sin(g.th), -g.d * Math.cos(g.th), tg[2]], tg, g.f, 960, 540, 0); };
/** blade (a, w) → screen at t */
export const mapG = (t: number) => { const c = camG(t); return (a: number, w: number): [number, number] => { const p = proj(c, worldG(a, w)); return [p[0], p[1]]; }; };
/** how lit scene i is at t (0 = plain bronze): it comes up as its line starts. fix4: the scenes now sit closer along the blade,
    so the change is sequential, not a dissolve (no double exposure): the old one goes out over the last 0.45 s of its line, the
    new one comes up from 0.05 s after the line start */
const kIn = (t: number, s: number) => sstep(seg(t, s + 0.05, s + 0.85)), kOut = (t: number, e: number) => 1 - sstep(seg(t, e - 0.45, e + 0.25));
export const vigK = (i: number, t: number) => { const s = GS[i], e = GS[i + 1];
	if (i === 0) return 0.95 * sstep(seg(t, 52.2, 53.6)) * kOut(t, e);
	if (i === 4) return kIn(t, s) * kOut(t, GS[6]);   // G5 + G6: the same seat
	if (i === 5) return sstep(seg(t, GS[5] + 0.3, GS[5] + 2.6));   // G6's memory layer (会稽 behind him): the k of the memory only
	if (i === 6) return kIn(t, s) * (1 - sstep(seg(t, GS[7] + 0.2, 89.4)));
	if (i === 7) return 0;
	return kIn(t, s) * kOut(t, e); };
