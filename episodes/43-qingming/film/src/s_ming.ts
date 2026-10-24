// Scenes 18–21 (明). 18: the back lane of 陆完's house at night: torchlight gathers at the front gate, he hands you to a friend
// at the back, the friend's door closes on your light. 19: the doorway enfilade (moon gate, vase gate, hall door), the
// oxblood box passed hand to hand, the 严 hall, the doors shut and sealed with two plain strips in an X. 20: the X becomes
// a sealed crate on a cart crossing the 明 crest at dusk (进③); night falls in the same shot; the eunuch walks out of the
// palace side with you under his arm (出③); his body passes the lens. 21: the painting's bare end, a fast track left along
// the tail to 冯保's columns, which light one per beat.
import * as THREE from 'three';
import {Stage, Live, bar, BEAT, W, H, D, clamp01, smooth, easeInOut, easeOut, easeIn, lerp, mkCanvas, canvasTex, gradCanvas, svgDoc, svgToCanvas, hash} from './core';
import {addScene, Frame} from './film';
import {Crest, deck} from './crest';
import {SIL, roof, hall, skyline} from './draw';
import {Cast, drawRoll, glowBlob, rig, drawCarriedRoll, drawFig, Contact} from './actors';
import {LOOKS, FigOpts, walkFor, gaitStride, stepFor, armsFrom, underArm, underArmRoll, fkPose, LookQ, P, toScreen as figToScreen} from './figures';
import {paintSection, paintSeal} from './silk';
import {camPath, solveCam, scr, BLEED_PT, Cam, careful, CAREFUL, softRoll} from './s_yuan';

const b = bar;
type Key = [number, number, number, number];
const BAR4 = 4 * BEAT;
const keep = (st: Stage, ms: THREE.ShaderMaterial[], r: number, g: number, bl: number) => { const k = new Set(ms); for (const m of st.mats) if (!k.has(m)) m.uniforms.uTint.value.setRGB(r, g, bl); };
/** a two-handed carry in front of the chest (roll centre 0.16h ahead, 0.66h up, length 0.24h) */
/** a roll carried in the hands, cradled against the chest (centre 0.11h ahead, 0.64h up, length 0.22h) */
const carry2 = (x: number, gr: number, h: number, flip: boolean) => { const sg = flip ? -1 : 1, rc: P = [x + sg * 0.11 * h, gr - 0.64 * h], hl = 0.11 * h; return {rc, e0: [rc[0] - hl, rc[1] + 3] as P, e1: [rc[0] + hl, rc[1] - 3] as P}; };
/** hands just under both ends (near hand L at the front end) */
const twoHands = (e0: P, e1: P, flip: boolean, name = 'roll'): Contact[] => { const f: P = flip ? e0 : e1, bk: P = flip ? e1 : e0, sg = flip ? 1 : -1;
	return [{side: 'L', target: [f[0] + sg * 8, f[1] + 9], name: `${name} front end`}, {side: 'R', target: [bk[0] - sg * 8, bk[1] + 9], name: `${name} back end`}]; };

// ================================================================================================ 18 · MING-LANE, night
const G18 = 905, H18 = 380;
const lkLu = LOOKS.mingScholar, lkFriend: LookQ = {head: 'fangjin', dress: 'robe', sleeves: 'narrow', beard: 'short', build: 0.98};
const lkTorch = LOOKS.mingOfficial;
const DOOR = {x0: 1480, x1: 1600, y0: 470, y1: G18};      // the friend's door (opening)
const GATE = {x0: 762, x1: 872};                            // 陆完's back gate
const STR18 = CAREFUL * H18;
const HANDX = 1235, FRX = 1385;                             // where 陆完 stops for the hand-over; where the friend waits
let lane: Stage, cast18: Cast, roll18: Live, glow18: Live, door18: Live, torch18: Live, torchFigs: Cast;
const luX = (t: number) => Math.min(HANDX, 820 + ((t - b(29.25)) / (2 * BEAT)) * STR18);
const fr18 = (t: number) => {
	// the friend: waits facing left; holds the roll from b30.0; turns at b30.2 and steps into his door (quicker steps)
	if (t < b(30.2)) return {x: FRX, flip: true, walk: false, u: 0};
	const u = (t - b(30.2)) / (1.5 * BEAT); return {x: FRX + u * STR18, flip: false, walk: true, u};
};
const scene18Cast = (t: number) => {
	const lx = luX(t), lw = lx < HANDX - 0.5, ul = (t - b(29.25)) / (2 * BEAT);
	const F = fr18(t), handT = b(30.0), give = smooth(clamp01((t - handT + 0.12) / 0.12));
	const luC = carry2(lx, G18, H18, false);
	// the roll: in 陆完's hands → both men's hands (b29.95 → b30.12) → the friend's chest
	let rc = luC.rc, e0 = luC.e0, e1 = luC.e1;
	const fc = carry2(F.x, G18, H18, F.flip);
	if (t >= b(29.95)) { const k = smooth(clamp01((t - b(29.95)) / (b(30.12) - b(29.95)))); const mid = luC.rc; rc = F.walk ? fc.rc : [lerp(mid[0], fc.rc[0], k), lerp(mid[1], fc.rc[1], k)]; e0 = [rc[0] - 0.11 * H18, rc[1] + 3]; e1 = [rc[0] + 0.11 * H18, rc[1] - 3]; }
	const luContacts: Contact[] = t < b(30.12) ? [{side: 'L', target: [e0[0] + 26, e0[1] + 9], name: 'roll'}, {side: 'R', target: [e0[0] + 8, e0[1] + 9], name: 'roll end'}] : [];
	const lu = rig({x: lx, ground: G18, h: H18, pose: lw ? careful(ul) : fkPose({hip: 0.655, lean: 5, neck: 4, lt: 2, lk: 2, rt: -3, rk: 3, la: 4, le: 18, ra: 6, re: 22}), look: lkLu}, luContacts, () => G18, 'lu-wan');
	let frC: Contact[] = [];
	if (t >= b(30.0) && t < b(30.12)) frC = [{side: 'L', target: [e1[0] - 22, e1[1] + 9], name: 'roll'}, {side: 'R', target: [e1[0] - 6, e1[1] + 9], name: 'roll end'}];
	else if (t >= b(30.12)) frC = twoHands(e0, e1, F.flip);
	const fpose = F.walk ? careful(F.u * H18 / (H18 - 6) + 0.1) : fkPose({hip: 0.655, lean: 6 + 4 * give, neck: 4, lt: 2, lk: 2, rt: -3, rk: 3, la: 4, le: 16, ra: 6, re: 20});
	const fr = rig({x: F.x, ground: G18, h: H18 - 6, pose: fpose, look: lkFriend, flip: F.flip}, frC, () => G18, 'friend');
	return {lu, fr, rc, e0, e1};
};
const doorK = (t: number) => smooth(clamp01((t - b(30.42)) / (b(30.52) - b(30.42))));
const K18: Key[] = [[b(29.25), 960, -150, 1.0], [b(29.85), 990, 560, 1.0], [b(30.75), 1070, 572, 1.06], [b(31.2), 1540, 690, 1.75]];
export const d18 = (t: number): Frame => {
	const st = lane, [cx, cy, zm] = camPath(t, K18); st.setCam(cx, cy, zm);
	const fk = `${Math.round(t * 30)}`, c = scene18Cast(t);
	const clipX = DOOR.x1 - 2;            // whoever goes through the friend's door passes behind its right jamb
	cast18.L.drawW(fk, (g) => { drawFig(g, c.lu); g.save(); g.beginPath(); g.rect(-2000, -2000, clipX + 2000, 6000); g.clip(); drawFig(g, c.fr); g.restore(); });
	const inside = clamp01((c.rc[0] - DOOR.x0 - 20) / 50);
	roll18.drawW(fk, (g) => { g.save(); g.beginPath(); g.rect(-2000, -2000, clipX + 2000, 6000); g.clip(); glowBlob(g, c.rc, 120, 80, 0.4); softRoll(g, c.e0, c.e1, 11);
		drawFig(g, {...c.fr, part: 'L'}); if (t < b(30.12)) drawFig(g, {...c.lu, part: 'L'}); g.restore(); });
	// the friend's door: your light inside, the leaves swing shut, a sliver under the door until b30.75
	const dk = doorK(t), sliver = t < b(30.5) ? 1 : 1 - smooth(clamp01((t - b(30.5)) / (b(30.75) - b(30.5))));
	door18.drawW(`${fk}:${dk.toFixed(3)}`, (g) => {
		const lw = (DOOR.x1 - DOOR.x0) / 2, w = lerp(7, lw, dk);
		for (const [hx, s] of [[DOOR.x0, 1], [DOOR.x1, -1]] as [number, number][]) { const x0 = s > 0 ? hx : hx - w; g.fillStyle = '#1e1712'; g.fillRect(x0, DOOR.y0 + 2, w, DOOR.y1 - DOOR.y0 - 6);
			g.fillStyle = 'rgba(0,0,0,0.35)'; for (let i = 1; i < 4; i++) g.fillRect(x0 + (w * i) / 4, DOOR.y0 + 4, 1.4, DOOR.y1 - DOOR.y0 - 10); }
	});
	glow18.drawW(`${fk}`, (g) => {
		const lit = inside * (t < b(30.52) ? 1 : sliver);
		if (dk < 1 && lit > 0) { const gap = (DOOR.x1 - DOOR.x0) * (1 - dk); g.save(); g.beginPath(); g.rect((DOOR.x0 + DOOR.x1) / 2 - gap / 2, DOOR.y0, gap, DOOR.y1 - DOOR.y0); g.clip();
			const gr = g.createLinearGradient(0, DOOR.y0, 0, DOOR.y1); gr.addColorStop(0, `rgba(255,200,130,${(0.18 * lit).toFixed(3)})`); gr.addColorStop(1, `rgba(255,210,140,${(0.55 * lit).toFixed(3)})`); g.fillStyle = gr; g.fillRect(DOOR.x0, DOOR.y0, DOOR.x1 - DOOR.x0, DOOR.y1 - DOOR.y0); g.restore(); }
		if (dk > 0.6 && sliver > 0) { g.fillStyle = `rgba(255,214,150,${(0.95 * sliver * inside).toFixed(3)})`; g.fillRect(DOOR.x0 + 3, DOOR.y1 - 5, DOOR.x1 - DOOR.x0 - 6, 3.5); glowBlob(g, [(DOOR.x0 + DOOR.x1) / 2, DOOR.y1 - 3], 80, 16, 0.5 * sliver * inside); }
	});
	// torches at the front gate (left): flicker
	const fl = (i: number) => 0.85 + 0.15 * Math.sin(t * 13 + i * 2.1) * Math.sin(t * 7.3 + i);
	torch18.drawW(`${Math.round(t * 15)}`, (g) => { for (const [x, y, r, i] of TORCH_GLOW) glowBlob(g, [x, y], r, r * 0.7, 0.34 * fl(i), '255,170,90'); for (const f of TORCHES) { const [x, y] = f; g.fillStyle = `rgba(255,${190 + 30 * fl(x)},110,0.95)`; g.beginPath(); g.ellipse(x, y - 9, 6, 12 * fl(x), 0, 0, Math.PI * 2); g.fill(); glowBlob(g, [x, y - 8], 26, 30, 0.7 * fl(x), '255,190,110'); } });
	st.heroAt(c.rc[0], c.rc[1], -150, 560);
	return {st, grade: {vig: 0.36, vigCol: '#0b1013', exposure: 1}, bloom: 1};
};
const TORCH_GLOW: [number, number, number, number][] = [[150, 560, 260, 0], [330, 600, 200, 1], [40, 640, 220, 2]];
let TORCHES: P[] = [];
const buildLane = async () => {
	const st = new Stage('mingLane'); lane = st;
	st.add('sky', canvasTex(gradCanvas([[0, '#1F2E38'], [0.45, '#2E404B'], [0.78, '#45565D'], [1, '#4a524a']])), 960, 200, 9000, 2600, -6000);
	// the city beyond (roofs, fogged toward the night horizon)
	const far = svgDoc(`${skyline(-1600, 3600, 600, 50, 150, 71, '#233037')}`, 5200, 900, '', -1600, 0);
	st.add('far', canvasTex(await svgToCanvas(far, 5200, 900, 0.5)), 1000, 450, 5200, 900, -2600, {fog: ['#45565D', 0.35]});
	// torchlight at the front gate (left): glow behind the roofs, officials with torches in the side street
	torch18 = new Live(st, 'torch', 600, 600, 1600, 900, -1250, {emissive: 1.25}, 0.6);
	torchFigs = new Cast(st, 'torchFigs', 400, 650, 1000, 600, -1000, {rim: 0.8}, 1);
	{ const figs: FigOpts[] = []; TORCHES = [];
		for (const [x, fl, hh] of [[110, false, 150], [205, true, 156], [300, false, 146]] as [number, boolean, number][]) {
			const g0 = 800, hand: P = [x + (fl ? -1 : 1) * 0.17 * hh, g0 - 0.62 * hh];
			const f = rig({x, ground: g0, h: hh, pose: fkPose({hip: 0.655, lean: 2, neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: 2, le: 8, ra: 20, re: 60}), look: lkTorch, flip: fl}, [{side: 'R', target: hand, name: 'torch pole'}], () => g0, `torch-official-${x}`);
			figs.push(f); TORCHES.push([hand[0], hand[1] - 0.42 * hh]);
		}
		torchFigs.draw('t', figs, (g) => { g.strokeStyle = SIL; g.lineWidth = 4; for (const [x, y] of TORCHES) { g.beginPath(); g.moveTo(x, y + 0.42 * 150 + 22); g.lineTo(x, y); g.stroke(); } });
	}
	// roofs of 陆完's house (left) and the friend's (right), catching the torchlight on the left
	const roofs = svgDoc(`${hall(560, 470, 760, 300, 1, '#1a1c1e')}${roof(160, 330, 520, 110, 0.4, '#1d1f20')}${hall(1900, 470, 900, 300, 1, '#1a1c1e')}${roof(1300, 360, 420, 90, 0.4, '#1d1f20')}`, 3200, 900, '', -400, 0);
	st.add('roofs', canvasTex(await svgToCanvas(roofs, 3200, 900, 0.6)), 1200, 450, 3200, 900, -700, {rim: 0.5, rimPx: 4, fog: ['#3a4850', 0.15]});
	// the walls: 陆完's back wall with its back gate (left), the friend's house with his door (right); whitewash at night
	const wallTop = 430, cop = (x0: number, x1: number) => `<rect x="${x0 - 14}" y="${wallTop - 26}" width="${x1 - x0 + 28}" height="22" fill="#1c1d1e"/><rect x="${x0 - 6}" y="${wallTop - 8}" width="${x1 - x0 + 12}" height="10" fill="#2a2c2c"/>`;
	const walls = svgDoc(`<path fill-rule="evenodd" fill="#596168" d="M340,${wallTop} L1180,${wallTop} L1180,${G18} L340,${G18} Z M${GATE.x0},${G18} L${GATE.x0},470 L${GATE.x1},470 L${GATE.x1},${G18} Z"/>${cop(340, 1180)}
		<rect x="${GATE.x0 - 14}" y="452" width="${GATE.x1 - GATE.x0 + 28}" height="20" fill="#1c1d1e"/>${roof((GATE.x0 + GATE.x1) / 2, 405, GATE.x1 - GATE.x0 + 70, 48, 0.4, '#1c1d1e')}
		<path fill-rule="evenodd" fill="#5a6168" d="M1270,${wallTop} L2700,${wallTop} L2700,${G18} L1270,${G18} Z M${DOOR.x0},${G18} L${DOOR.x0},${DOOR.y0} L${DOOR.x1},${DOOR.y0} L${DOOR.x1},${G18} Z"/>${cop(1270, 2700)}
		<rect x="${DOOR.x0 - 12}" y="${DOOR.y0 - 16}" width="${DOOR.x1 - DOOR.x0 + 24}" height="18" fill="#1c1d1e"/>${roof((DOOR.x0 + DOOR.x1) / 2, DOOR.y0 - 62, DOOR.x1 - DOOR.x0 + 90, 50, 0.4, '#1c1d1e')}
		<rect x="${GATE.x0}" y="470" width="${GATE.x1 - GATE.x0}" height="${G18 - 470}" fill="#141516"/><rect x="${GATE.x0}" y="470" width="8" height="${G18 - 470}" fill="#1e1712"/><rect x="${GATE.x1 - 8}" y="470" width="8" height="${G18 - 470}" fill="#1e1712"/>
		<rect x="${DOOR.x0}" y="${DOOR.y0}" width="${DOOR.x1 - DOOR.x0}" height="${G18 - DOOR.y0}" fill="#121314"/>
		<rect x="1180" y="${wallTop + 40}" width="90" height="${G18 - wallTop - 40}" fill="#2a3034"/>`, 3600, 1000, '', -600, 0);
	st.add('walls', canvasTex(await svgToCanvas(walls, 3600, 1000, 0.7)), 1200, 500, 3600, 1000, -320, {rim: 0.55, rimPx: 4});
	glow18 = new Live(st, 'doorGlow', (DOOR.x0 + DOOR.x1) / 2, 700, 400, 500, -315, {emissive: 1.1}, 1);
	door18 = new Live(st, 'doorLeaves', (DOOR.x0 + DOOR.x1) / 2, 700, 300, 500, -140, {rim: 0.4}, 1.5);
	st.add('lane', canvasTex(gradCanvas([[0, '#2c3134'], [0.25, '#24282a'], [1, '#141618']])), 1200, G18 + 400, 4400, 800, -330);
	cast18 = new Cast(st, 'cast18', 1100, 640, 2400, 900, -150);
	roll18 = new Live(st, 'roll18', 1100, 640, 2400, 900, -148, {emissive: 0.6}, 1);
};

// ================================================================================================ 19 · MING-HALL enfilade, the 严 hall, the seals
const ZW1 = 1200, ZW2 = 800, ZW3 = 300, ZHALL = -300;        // moon gate, vase gate, hall door, hall
const MOON = {x: 960, y: 560, r: 330}, VASE_Y0 = 455, VASE_Y1 = 755, HD = {x0: 900, x1: 1020, y0: 545, y1: 725};
const lkF1: LookQ = {head: 'fangjin', dress: 'robe', sleeves: 'wide', beard: 'short'}, lkF2: LookQ = {head: 'bun', dress: 'tunic'}, lkF3: LookQ = {head: 'bun', dress: 'robe', sleeves: 'narrow'};
const lkOff = LOOKS.mingOfficial;
let hallSt: Stage, c1: Cast, c2: Cast, c3: Cast, box1: Live, box2: Live, box3: Live, leaves19: Live, strips19: Live, lamps19: Live, offs: Cast;
/** the camera distance d (= D / zoom) per beat: through the moon gate, through the vase gate, at the hall door, back out */
const K19: Key[] = [[b(31) - 0.2, 960, 560, D / 1760], [b(31), 960, 562, D / 1590], [b(31.33), 960, 585, D / 1185], [b(31.5), 960, 600, D / 1150], [b(31.83), 960, 625, D / 785], [b(32), 960, 636, D / 742], [b(32.4), 960, 640, D / 690], [b(32.55), 960, 640, D / 690], [b(33), 960, 640, D / 1000]];
/** the box: oxblood lacquer, your light at its seam */
const drawBox = (g: CanvasRenderingContext2D, c: P, w: number, h: number) => {
	g.fillStyle = '#6A2E24'; g.beginPath(); g.roundRect(c[0] - w / 2, c[1] - h / 2, w, h, w * 0.06); g.fill();
	g.fillStyle = '#4e2019'; g.fillRect(c[0] - w / 2, c[1] - h / 2, w, h * 0.12);
	g.fillStyle = '#FFE2A8'; g.fillRect(c[0] - w / 2 + 2, c[1] - h * 0.18, w - 4, Math.max(1.2, h * 0.05));
};
const boxGlow = (g: CanvasRenderingContext2D, c: P, w: number, h: number, a = 0.5) => { glowBlob(g, [c[0], c[1] - h * 0.16], w * 0.9, h * 0.45, a); };
/** a figure carrying the box at the chest, both hands on it, walking right across a doorway */
const boxCarrier = (x: number, gr: number, h: number, look: LookQ, u: number, who: string) => {
	const bw = 0.22 * h, bh = 0.14 * h, bc: P = [x + 0.15 * h, gr - 0.62 * h];
	const f = rig({x, ground: gr, h, pose: careful(u), look}, [{side: 'L', target: [bc[0] + bw / 2 - 2, bc[1] + 1], name: 'box front'}, {side: 'R', target: [bc[0] - bw * 0.15, bc[1] + bh / 2 - 1], name: 'box bottom'}], () => gr, who);
	return {f, bc, bw, bh};
};
const STR19 = (look: LookQ, h: number) => CAREFUL * h;
export const d19 = (t: number): Frame => {
	const st = hallSt, [cx, cy, zm] = camPath(t, K19); st.setCam(cx, cy, zm);
	const fk = `${Math.round(t * 30)}`;
	// doorway 1 (moon gate): b30.8 → b31.4
	{ const h = 300, u = (t - (b(31) - 0.4)) / (2 * BEAT), x = 790 + u * STR19(lkF1, h), r = boxCarrier(x, MOON.y + MOON.r, h, lkF1, u, 'box-carrier-1');
		c1.draw(fk, [r.f]); box1.drawW(fk, (g) => { boxGlow(g, r.bc, r.bw, r.bh); drawBox(g, r.bc, r.bw, r.bh); drawFig(g, {...r.f, part: 'L'}); }); }
	// doorway 2 (vase gate): b31.2 → b31.9
	{ const h = 168, u = (t - b(31.2)) / (2 * BEAT), x = 880 + u * STR19(lkF2, h), r = boxCarrier(x, VASE_Y1, h, lkF2, u, 'box-carrier-2');
		c2.draw(fk, [r.f]); box2.drawW(fk, (g) => { boxGlow(g, r.bc, r.bw, r.bh); drawBox(g, r.bc, r.bw, r.bh); drawFig(g, {...r.f, part: 'L'}); }); }
	// the hall (beyond the door): a servant sets the box on the table among the treasures, then steps back
	{ const h = 120, gx = 938, gy = 700, top = 640, bc: P = [968, top - 7], set = smooth(clamp01((t - b(31.7)) / 0.3)), back = smooth(clamp01((t - b(32.08)) / 0.25));
		const bcNow: P = [bc[0], lerp(bc[1] - 14, bc[1], set)], bw = 30, bh = 16;
		const pose = fkPose({hip: 0.645, hipX: -0.05, lean: lerp(46, 6, back), neck: 4, lt: 6, lk: 4, rt: 2, rk: 2, la: 20, le: 30, ra: 20, re: 30});
		const hands: Contact[] = back < 0.2 ? [{side: 'L', target: [bcNow[0] + bw / 2 - 1, bcNow[1]], name: 'box side'}, {side: 'R', target: [bcNow[0] - bw / 2 + 2, bcNow[1] + 2], name: 'box side'}] : [];
		const f = rig({x: gx - 18 * back, ground: gy, h, pose, look: lkF3}, hands, () => gy, 'box-servant-3');
		c3.draw(fk, [f]); box3.drawW(fk, (g) => { boxGlow(g, bcNow, bw * 1.6, bh * 2.2, 0.55); drawBox(g, bcNow, bw, bh); if (back < 0.2) drawFig(g, {...f, part: 'L'}); }); }
	// the hall doors swing shut (b32.0 → b32.25); two officials flank them and slap the strips on at b32.5
	const shut = smooth(clamp01((t - b(32.02)) / (b(32.25) - b(32.02)))), slap = t >= b(32.5) ? 1 : 0, raise = smooth(clamp01((t - b(32.27)) / (b(32.47) - b(32.27))));
	leaves19.drawW(`${shut.toFixed(3)}`, (g) => { const lw = (HD.x1 - HD.x0) / 2, w = lerp(5, lw, shut); for (const [hx, s] of [[HD.x0, 1], [HD.x1, -1]] as [number, number][]) { const x0 = s > 0 ? hx : hx - w;
		g.fillStyle = '#2a1d16'; g.fillRect(x0, HD.y0 + 1, w, HD.y1 - HD.y0 - 2); g.fillStyle = 'rgba(0,0,0,0.3)'; for (let i = 1; i < 3; i++) g.fillRect(x0 + (w * i) / 3, HD.y0 + 2, 0.8, HD.y1 - HD.y0 - 4);
		g.fillStyle = 'rgba(214,170,110,0.5)'; g.beginPath(); g.arc(x0 + (s > 0 ? w - 7 : 7), (HD.y0 + HD.y1) / 2, 2.6 * (w / lw), 0, Math.PI * 2); g.fill(); } });
	const X = stripX(), shake = slap && t < b(32.5) + 0.07 ? (Math.round((t - b(32.5)) * 60) % 2 ? 1.2 : -1.2) : 0;
	strips19.drawW(`${slap}:${shake}:${raise.toFixed(2)}`, (g) => {
		if (slap) { const sc = 1 + 0.06 * Math.exp(-(t - b(32.5)) * 30); g.save(); g.translate(X.c[0] + shake, X.c[1]); g.scale(sc, sc); g.translate(-X.c[0], -X.c[1]);
			for (const [a, c] of [[X.a0, X.a1], [X.b0, X.b1]] as [P, P][]) { g.strokeStyle = '#E4DCC6'; g.lineWidth = 9; g.lineCap = 'butt'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.stroke(); g.strokeStyle = 'rgba(120,110,90,0.35)'; g.lineWidth = 1; g.stroke(); }
			g.restore(); }
	});
	const o1h: P = slap ? [X.a0[0] + 4, X.a0[1] + 3] : [lerp(952, X.a0[0] + 4, raise), lerp(630, X.a0[1] + 3, raise)];
	const o2h: P = slap ? [X.b0[0] - 4, X.b0[1] + 3] : [lerp(968, X.b0[0] - 4, raise), lerp(630, X.b0[1] + 3, raise)];
	const base = fkPose({hip: 0.655, lean: 4, neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: 3, le: 10, ra: 4, re: 14});
	const su = 0.5 * clamp01((t - b(32.02)) / (b(32.25) - b(32.02))), stepping = su > 0 && su < 0.5;
	const o1x = 876 + su * CAREFUL * 132, o2x = 1044 - su * CAREFUL * 134, lwN = lerp(5, (HD.x1 - HD.x0) / 2, shut);
	const c1: Contact[] = t >= b(32.27) ? [{side: 'L', target: o1h, name: slap ? 'hand on the strip' : 'strip'}] : stepping ? [{side: 'L', target: [HD.x0 + lwN - 3, 630], name: 'hand on the door leaf'}] : [];
	const c2: Contact[] = t >= b(32.27) ? [{side: 'L', target: o2h, name: slap ? 'hand on the strip' : 'strip'}] : stepping ? [{side: 'L', target: [HD.x1 - lwN + 3, 630], name: 'hand on the door leaf'}] : [];
	// after the slap they turn and step back to the jambs, clear of the X
	const sb = 0.5 * clamp01((t - b(32.62)) / 0.24), away = t >= b(32.62), stepB = sb > 0 && sb < 0.5;
	const O1 = away ? rig({x: o1x - sb * CAREFUL * 132, ground: HD.y1, h: 132, pose: stepB ? careful(sb) : base, look: lkOff, flip: true}, [], () => HD.y1, 'seal-official-1')
		: rig({x: o1x, ground: HD.y1, h: 132, pose: stepping ? careful(su) : base, look: lkOff}, c1, () => HD.y1, 'seal-official-1');
	const O2 = away ? rig({x: o2x + sb * CAREFUL * 134, ground: HD.y1, h: 134, pose: stepB ? careful(sb + 0.28) : base, look: lkOff}, [], () => HD.y1, 'seal-official-2')
		: rig({x: o2x, ground: HD.y1, h: 134, pose: stepping ? careful(su + 0.28) : base, look: lkOff, flip: true}, c2, () => HD.y1, 'seal-official-2');
	offs.draw(`${fk}`, t >= b(31.9) ? [O1, O2] : [], (g) => { if (!slap && raise > 0) for (const hnd of [o1h, o2h]) { g.fillStyle = '#E4DCC6'; g.fillRect(hnd[0] - 4, hnd[1], 8, 26 * raise); } });
	lamps19.drawW('l', (g) => { for (const [x, y, r] of LAMPS19) { glowBlob(g, [x, y], r * 2.6, r * 2.6, 0.45, '255,184,104'); g.fillStyle = '#FFC98A'; g.beginPath(); g.ellipse(x, y, r * 0.55, r * 0.75, 0, 0, Math.PI * 2); g.fill(); } });
	st.heroAt(960, 650, ZW3, 900);
	return {st, grade: {vig: 0.4, vigCol: '#120c09', exposure: 1}, bloom: 1};
};
const LAMPS19: [number, number, number][] = [[858, 548, 7], [1062, 548, 7]];
/** the X of plain strips on the shut hall doors (frame px at the door's depth) */
const stripX = () => ({a0: [912, 600] as P, a1: [1010, 712] as P, b0: [1008, 600] as P, b1: [910, 712] as P, c: [960, 656] as P, w: 100});
const buildHall = async () => {
	const st = new Stage('mingHall'); hallSt = st;
	const wallG = (id: string, cx: number, cy: number) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6b5a49"/><stop offset="0.45" stop-color="#4A3F36"/><stop offset="1" stop-color="#2e2722"/></radialGradient>`;
	// the hall interior (beyond the door): back wall, shelves of treasures, the table, lamps
	const hallSvg = svgDoc(`<rect x="-600" y="-200" width="3100" height="1400" fill="url(#hw)"/>
		<rect x="-600" y="700" width="3100" height="500" fill="#2b231d"/>
		${[[880, 640, 18, 34], [906, 650, 12, 24], [1030, 636, 16, 40], [1052, 648, 10, 28], [860, 600, 50, 6], [1014, 598, 60, 6]].map(([x, y, w, h]) => `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="#1a1411" rx="3"/>`).join('')}
		<ellipse cx="890" cy="560" rx="11" ry="16" fill="#1a1411"/><ellipse cx="1040" cy="556" rx="13" ry="18" fill="#1a1411"/><rect x="884" y="574" width="12" height="8" fill="#1a1411"/>
		<path d="M940,566 L992,566 L986,586 L946,586 Z" fill="#1a1411"/><rect x="930" y="640" width="80" height="6" fill="#20170f"/><rect x="936" y="646" width="5" height="54" fill="#1a1411"/><rect x="999" y="646" width="5" height="54" fill="#1a1411"/>
		<circle cx="905" cy="520" r="5" fill="#FFC98A"/><circle cx="1015" cy="520" r="5" fill="#FFC98A"/>`, 3100, 1400, `${wallG('hw', 960, 560)}`, -600, -200);
	st.add('hall', canvasTex(await svgToCanvas(hallSvg, 3100, 1400, 1.4)), 950, 500, 3100, 1400, ZHALL, {rim: 0.5, rimPx: 3});
	c3 = new Cast(st, 'servant3', 960, 640, 600, 400, ZHALL + 4, {}, 3); box3 = new Live(st, 'box3', 960, 640, 600, 400, ZHALL + 5, {emissive: 0.5}, 3);
	// the hall door wall (z 300): door opening, lintel and eave, lamps either side, the threshold; leaves + strips are live
	const w3 = svgDoc(`<path fill-rule="evenodd" fill="url(#w3)" d="M-700,-300 L2600,-300 L2600,1400 L-700,1400 Z M${HD.x0},${HD.y0} L${HD.x1},${HD.y0} L${HD.x1},${HD.y1} L${HD.x0},${HD.y1} Z"/>
		<rect x="${HD.x0 - 10}" y="${HD.y0 - 12}" width="${HD.x1 - HD.x0 + 20}" height="12" fill="#1c1510"/>${roof(960, HD.y0 - 58, 230, 40, 0.4, '#1c1510')}
		<rect x="-700" y="${HD.y1}" width="3300" height="700" fill="#2e2620"/><rect x="${HD.x0 - 16}" y="${HD.y1 - 4}" width="${HD.x1 - HD.x0 + 32}" height="8" fill="#1c1510"/>
		<rect x="${HD.x0 - 8}" y="${HD.y0}" width="8" height="${HD.y1 - HD.y0}" fill="#1c1510"/><rect x="${HD.x1}" y="${HD.y0}" width="8" height="${HD.y1 - HD.y0}" fill="#1c1510"/>`, 3300, 1700, `${wallG('w3', 960, 640)}`, -700, -300);
	st.add('w3', canvasTex(await svgToCanvas(w3, 3300, 1700, 1.2)), 950, 550, 3300, 1700, ZW3, {rim: 0.4, rimPx: 3});
	leaves19 = new Live(st, 'leaves', 960, 640, 300, 260, ZW3 + 1, {rim: 0.4}, 4);
	strips19 = new Live(st, 'strips', 960, 640, 300, 260, ZW3 + 2, {}, 4);
	offs = new Cast(st, 'officials', 960, 640, 500, 300, ZW3 + 3, {rim: 0.55}, 4);
	lamps19 = new Live(st, 'lamps', 960, 600, 400, 200, ZW3 + 1.5, {emissive: 1.2}, 3);
	// the vase gate wall (z 800)
	const vase = (cx: number) => { const y0 = VASE_Y0, y1 = VASE_Y1; return `M${cx - 30},${y1} C${cx - 64},${y1 - 40} ${cx - 92},${y1 - 120} ${cx - 86},${y0 + 150} C${cx - 80},${y0 + 90} ${cx - 34},${y0 + 82} ${cx - 34},${y0 + 46} L${cx - 40},${y0} L${cx + 40},${y0} L${cx + 34},${y0 + 46} C${cx + 34},${y0 + 82} ${cx + 80},${y0 + 90} ${cx + 86},${y0 + 150} C${cx + 92},${y1 - 120} ${cx + 64},${y1 - 40} ${cx + 30},${y1} Z`; };
	const w2 = svgDoc(`<path fill-rule="evenodd" fill="url(#w2)" d="M-800,-400 L2700,-400 L2700,1500 L-800,1500 Z ${vase(960)}"/><path d="${vase(960)}" fill="none" stroke="#1c1510" stroke-width="7"/>
		<rect x="-800" y="${VASE_Y1}" width="3500" height="800" fill="#30271f"/><rect x="900" y="${VASE_Y1 - 3}" width="120" height="7" fill="#1c1510"/>`, 3500, 1900, `${wallG('w2', 960, 620)}`, -800, -400);
	st.add('w2', canvasTex(await svgToCanvas(w2, 3500, 1900, 0.9)), 950, 550, 3500, 1900, ZW2, {rim: 0.4, rimPx: 3});
	c2 = new Cast(st, 'carrier2', 960, 640, 800, 500, ZW2 + 3, {}, 2); box2 = new Live(st, 'box2', 960, 640, 800, 500, ZW2 + 4, {emissive: 0.5}, 2);
	// the moon gate wall (z 1200)
	const w1 = svgDoc(`<path fill-rule="evenodd" fill="url(#w1)" d="M-900,-500 L2800,-500 L2800,1600 L-900,1600 Z M${MOON.x},${MOON.y} m-${MOON.r},0 a${MOON.r},${MOON.r} 0 1,0 ${2 * MOON.r},0 a${MOON.r},${MOON.r} 0 1,0 -${2 * MOON.r},0 Z"/>
		<circle cx="${MOON.x}" cy="${MOON.y}" r="${MOON.r + 6}" fill="none" stroke="#1c1510" stroke-width="16"/><rect x="${MOON.x - 150}" y="${MOON.y + MOON.r - 8}" width="300" height="14" fill="#1c1510"/>
		<rect x="-900" y="${MOON.y + MOON.r + 4}" width="3700" height="800" fill="#2c241e"/>`, 3700, 2100, `${wallG('w1', 960, 560)}`, -900, -500);
	st.add('w1', canvasTex(await svgToCanvas(w1, 3700, 2100, 0.7)), 950, 550, 3700, 2100, ZW1, {rim: 0.4, rimPx: 3});
	c1 = new Cast(st, 'carrier1', 960, 640, 1400, 900, ZW1 + 3, {}, 1); box1 = new Live(st, 'box1', 960, 640, 1400, 900, ZW1 + 4, {emissive: 0.5}, 1);
};

// ================================================================================================ 20 · 明 crest: the sealed crate in (进③), night, the eunuch out (出③)
let c20: Crest, cast20: Cast, cart20: Live, near20: Live, roll20: Live, nightSky20: any, jl20: Live, mine20: THREE.ShaderMaterial[] = [];
const H20 = 560, lkCarter: LookQ = {head: 'bun', dress: 'tunic'}, lkEunuch = LOOKS.mingEunuch;
const g20 = (x: number) => (x < -740 || x > 2660 ? 1380 : deck(x));
const STRC = CAREFUL * (H20 - 10), STRO = CAREFUL * (H20 + 8), STRE = CAREFUL * H20;
const CART = {bed: 200, wheel: 92, len: 380, cw: 250, ch: 200, shaft: 300};
const cartX = (t: number) => -900 - ((t - b(33)) / (1.6 * BEAT)) * STRC;            // the crate's centre x (walks left, brisk)
const crateX = (x: number) => ({c: [x, 1380 - CART.bed - CART.ch / 2] as P, w: CART.cw * 0.62});   // the X on the crate's face
const CR_B: Cam = [-100, 760, 0.62];
let CAM20_0: Cam = [-900, 1100, 1.4];
const eunX = (t: number) => -1720 + ((t - b(34)) / (2 * BEAT)) * STRE;
const eunuch20 = (t: number) => { const u = (t - b(34)) / (2 * BEAT), x = eunX(t); let p = careful(u); p = armsFrom(p, underArm(p), 'R');
	return rig({x, ground: g20(x), h: H20, pose: p, look: lkEunuch}, [], g20, 'eunuch20'); };
const eunRoll = (f: FigOpts): P => { const [a, c] = underArmRoll(f.pose, 'R', 0.29), p0 = figToScreen(f, a), p1 = figToScreen(f, c); return [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2]; };
const cam20 = (t: number): Cam => {
	const k0 = easeInOut(clamp01((t - b(33)) / (b(33.5) - b(33))));
	let cam: Cam = [lerp(CAM20_0[0], CR_B[0], k0), lerp(CAM20_0[1], CR_B[1], k0), Math.exp(lerp(Math.log(CAM20_0[2]), Math.log(CR_B[2]), k0))];
	if (t > b(34.5)) {   // CR-C: track the eunuch, his glow on the lock point (960, 580)
		const r = eunRoll(eunuch20(t)), tr: Cam = [r[0], r[1] - 40, 1.0], k = easeInOut(clamp01((t - b(34.5)) / (b(35.25) - b(34.5))));
		cam = [lerp(cam[0], tr[0], k), lerp(cam[1], tr[1], k), Math.exp(lerp(Math.log(cam[2]), Math.log(tr[2]), k))];
		const lens = easeIn(clamp01((t - b(35.3)) / (b(35.5) + 0.3 - b(35.3))));   // he passes the lens: push into his body
		if (lens > 0) cam = [lerp(cam[0], r[0] - 30, lens), lerp(cam[1], r[1] + 60, lens), cam[2] * (1 + 2.2 * lens)];
	}
	return cam;
};
const night20 = (t: number) => smooth(clamp01((t - b(33.75)) / (b(34) - b(33.75))));
export const d20 = (t: number): Frame => {
	const st = c20.st, cam = cam20(t); st.setCam(cam[0], cam[1], cam[2]);
	const fk = `${Math.round(t * 30)}`, nk = night20(t);
	// the cart: crate with the X, a carter between the shafts, an official behind
	const xc = cartX(t), uc = (t - b(33)) / (1.6 * BEAT), bedY = 1380 - CART.bed, front = xc - CART.len / 2;
	const shaftEnd: P = [front - CART.shaft, 1380 - 0.53 * H20], carterX = shaftEnd[0] - 0.06 * H20;
	const carter = rig({x: carterX, ground: 1380, h: H20 - 10, pose: careful(uc), look: lkCarter, flip: true}, [{side: 'L', target: [shaftEnd[0], shaftEnd[1] + 4], name: 'near shaft'}, {side: 'R', target: [shaftEnd[0] + 4, shaftEnd[1] + 2], name: 'far shaft'}], () => 1380, 'carter20');
	const ox = xc + CART.len / 2 + 150, uo = (t - b(33)) / (1.6 * BEAT) * (STRC / STRO);
	const off = rig({x: ox, ground: 1380, h: H20 + 8, pose: careful(uo + 0.28), look: lkOff, flip: true}, [], () => 1380, 'cart-official20');
	const eun = t >= b(34) - 0.05 ? eunuch20(t) : null;
	cast20.draw(fk, eun ? [carter, off, eun] : [carter, off]);
	cart20.drawW(fk, (g) => drawCart(g, xc, bedY, shaftEnd, uc));
	near20.drawW(fk, (g) => { g.strokeStyle = '#1b130e'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(front + 10, bedY + 18); g.lineTo(shaftEnd[0], shaftEnd[1] + 6); g.stroke(); drawFig(g, {...carter, part: 'L'}); });
	let hero: P = [xc, bedY - CART.ch / 2];
	roll20.drawW(fk, (g) => { glowBlob(g, [xc, bedY - CART.ch / 2], CART.cw * 0.7, 40, 0.18 * (1 - nk)); if (eun) { const r = eunRoll(eun); hero = r; glowBlob(g, r, 120, 80, 0.4); drawCarriedRoll(g, eun, 'eunuch20-carry', 'R', 0.29, 13, 1); } });
	if (eun) hero = eunRoll(eun);
	// lanterns: lit for the official entry; out one group per beat from the palace side (b34 → b34.75)
	c20.setLanterns((i, x) => { const grp = Math.min(3, Math.max(0, Math.floor((x + 1400) / 1100))); return t < b(34 + 0.25 * grp) ? 1 : 0; });
	c20.setBoat(1500 - (t - b(33)) * 20, lerp(10, 60, clamp01((t - b(33)) / 2))); c20.setStreak(hero[0], eun ? 0.5 * nk : 0, t);
	// dusk → night in the same shot: the night sky over the dusk one, the world dims, the 角楼's windows light
	nightSky20.mat.uniforms.uOpacity.value = nk; c20.st.get('sunglow').mat.uniforms.uOpacity.value = 1 - nk;
	keep(st, mine20, lerp(1, 0.6, nk), lerp(1, 0.66, nk), lerp(1, 0.78, nk));
	const far = c20.st.get('far').mat.uniforms.uFog.value; far.set(lerp(0.79, 0.33, nk), lerp(0.64, 0.38, nk), lerp(0.48, 0.37, nk), lerp(0.32, 0.4, nk));
	jl20.draw(`${nk.toFixed(2)}`, (g) => { if (nk <= 0) return; drawJiaolouWindows(g, nk); });
	st.heroAt(hero[0], hero[1], 22, eun ? 560 : 420);
	return {st, grade: {vig: lerp(0.3, 0.42, nk), vigCol: '#0e1013', exposure: 1}, bloom: 1};
};
const drawCart = (g: CanvasRenderingContext2D, xc: number, bedY: number, shaftEnd: P, u: number) => {
	const L = CART.len, x0 = xc - L / 2;
	g.strokeStyle = '#18110c'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0 + 14, bedY + 10); g.lineTo(shaftEnd[0] + 8, shaftEnd[1]); g.stroke();   // far shaft
	g.fillStyle = '#1d150f'; g.fillRect(x0, bedY, L, 22); g.fillRect(x0 + 10, bedY + 22, 10, 40); g.fillRect(x0 + L - 20, bedY + 22, 10, 40);
	// the crate: dark wood, its face toward us, the two plain strips crossed in an X (the match from scene 19)
	const cx0 = xc - CART.cw / 2, cy0 = bedY - CART.ch; g.fillStyle = '#2c2119'; g.fillRect(cx0, cy0, CART.cw, CART.ch);
	g.fillStyle = 'rgba(0,0,0,0.35)'; for (let i = 1; i < 4; i++) g.fillRect(cx0, cy0 + (CART.ch * i) / 4, CART.cw, 2); g.fillStyle = '#20170f'; g.fillRect(cx0 - 4, cy0 - 8, CART.cw + 8, 10);
	const X = crateX(xc), hw = X.w / 2, hh = hw * 1.14;
	g.strokeStyle = '#E4DCC6'; g.lineWidth = 9; g.lineCap = 'butt'; for (const s of [1, -1]) { g.beginPath(); g.moveTo(X.c[0] - hw * s, X.c[1] - hh); g.lineTo(X.c[0] + hw * s, X.c[1] + hh); g.stroke(); }
	// the wheel turns as it rolls (spokes)
	const wc: P = [xc, 1380 - CART.wheel], ang = -(u * STRC) / CART.wheel;
	g.strokeStyle = '#15100C'; g.lineWidth = 9; g.beginPath(); g.arc(wc[0], wc[1], CART.wheel - 5, 0, Math.PI * 2); g.stroke();
	g.lineWidth = 5; for (let i = 0; i < 8; i++) { const a = ang + (i * Math.PI) / 4; g.beginPath(); g.moveTo(wc[0], wc[1]); g.lineTo(wc[0] + Math.cos(a) * (CART.wheel - 8), wc[1] + Math.sin(a) * (CART.wheel - 8)); g.stroke(); }
	g.fillStyle = '#15100C'; g.beginPath(); g.arc(wc[0], wc[1], 12, 0, Math.PI * 2); g.fill();
};
const drawJiaolouWindows = (g: CanvasRenderingContext2D, k: number) => {
	// on the 角楼 (draw.ts jiaolou at −420, base 860, s 1.3): its base storey and the first roof storey; frame px at depth
	for (let i = 0; i < 7; i++) { const x = -585 + i * 52, y = 800; g.fillStyle = `rgba(255,184,104,${(0.75 * k).toFixed(3)})`; g.fillRect(x, y, 16, 26); }
	for (let i = 0; i < 4; i++) { const x = -530 + i * 62, y = 680; g.fillStyle = `rgba(255,184,104,${(0.6 * k).toFixed(3)})`; g.fillRect(x, y, 12, 16); }
};

// ================================================================================================ 21 · the tail: bare end → 冯保's columns
let tail: Stage, lit21: Live, feng: HTMLCanvasElement, fengPlane: any;
const SK = 1080 / 1536;                                   // section px → world px (the silk's height fills the frame at zoom 1)
const FW21 = 2700;                                        // 冯保's sheet (with a later hand's columns on its left), sheet px
const XE = 0, XC = -4096 * SK, XF = XC - FW21 * SK;       // the end section, the colophon section, 冯保's sheet (left edges)
const FCOLS = [2460, 2160, 1860, 1560];                   // 冯保's four columns (sheet px), right → left (read order)
const fengW = (sx: number) => XF + sx * SK;
const CAM21_A: Cam = [600, 700, 1.3];                     // the bare lower-left corner of the painting's end (Z1's callback)
const CAM21_B: Cam = [(fengW(FCOLS[0]) + fengW(FCOLS[3])) / 2 - 330 + 50, 560, 1.0];
const cam21 = (t: number): Cam => {
	const k = easeInOut(clamp01((t - b(35.75)) / (b(36) - b(35.75)))), dip = Math.sin(Math.PI * k);
	const x = lerp(CAM21_A[0], CAM21_B[0], k), y = lerp(CAM21_A[1], CAM21_B[1], k), z = Math.exp(lerp(Math.log(CAM21_A[2]), Math.log(CAM21_B[2]), k)) * (1 - 0.5 * dip);
	const drift = t > b(36) ? (t - b(36)) * 10 : 0, settle = t < b(35.75) ? (t - b(35.5) + 0.335) * 6 : 0;
	return [x - drift - settle, y, z * (1 + 0.01 * clamp01((t - b(36)) / 1.2))];
};
export const d21 = (t: number): Frame => {
	const st = tail, c = cam21(t); st.setCam(c[0], c[1], c[2]);
	const lit = FCOLS.map((_, i) => smooth(clamp01((t - b(36 + 0.25 * i)) / 0.14)));
	lit21.draw(lit.map((v) => v.toFixed(2)).join(','), (g) => { g.scale(SK, SK);
		for (let i = 0; i < 4; i++) { if (lit[i] <= 0) continue; g.globalAlpha = lit[i]; g.drawImage(pools21[i], FCOLS[i] - POOL.w / 2, POOL.y0); }
		g.globalAlpha = 1;
	});
	st.heroAt(c[0], 540, 0, 1200);
	return {st, grade: {vig: 0.48, vigCol: '#1a120c', corners: 1, exposure: 1}, bloom: 0.7};
};
/** each lit column: the sheet's own pixels under a soft vertical pool of lamplight (drawn brighter than the dimmed sheet) */
const POOL = {w: 300, y0: 130, h: 1280};
let pools21: HTMLCanvasElement[] = [];
const makePools = (sheet: HTMLCanvasElement) => FCOLS.map((x) => {
	const c = mkCanvas(POOL.w, POOL.h), g = c.getContext('2d')!; g.drawImage(sheet, x - POOL.w / 2, POOL.y0, POOL.w, POOL.h, 0, 0, POOL.w, POOL.h);
	g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,214,150,0.10)'; g.fillRect(0, 0, POOL.w, POOL.h);
	g.globalCompositeOperation = 'destination-in'; g.save(); g.translate(POOL.w / 2, POOL.h / 2); g.scale(1, POOL.h / POOL.w);
	const gr = g.createRadialGradient(0, 0, 0, 0, 0, POOL.w / 2); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, POOL.w / 2, 0, Math.PI * 2); g.fill(); g.restore();
	return c;
});
const fengSheet = (col: HTMLCanvasElement) => {
	const c = mkCanvas(FW21, 1536), g = c.getContext('2d')!;
	for (let y = 0; y < 1536; y += 176) for (let x = 0; x < FW21; x += 1300) g.drawImage(col, 0, 0, 1330, 180, x, y, 1330, 180);   // the paper (from the colophon painter's margins)
	g.fillStyle = 'rgba(42,31,23,0.08)'; g.fillRect(FW21 - 4, 0, 4, 1536); g.fillStyle = 'rgba(42,31,23,0.45)'; g.fillRect(FW21 - 2, 0, 1.4, 1536);
	g.fillStyle = 'rgba(42,31,23,0.08)'; g.fillRect(900, 0, 5, 1536); g.fillStyle = 'rgba(42,31,23,0.4)'; g.fillRect(902, 0, 1.2, 1536);       // the next sheet's join
	g.drawImage(col, 1330, 0, 800, 1536, 60, 0, 800, 1536);                                                       // a later hand (small script), left of 冯保
	// four columns in a large running hand (illegible stand-ins: the painter's own cells), right → left
	const src = [1240, 1088, 936, 784], n = [8, 7, 6, 8];
	FCOLS.forEach((x, i) => { for (let k = 0; k < n[i]; k++) { const y = 240 + k * 128; g.drawImage(col, src[i] - 70, y - 66, 140, 132, x - 70, y - 66, 140, 132); } });
	const seal = paintSeal('', {size: 200, style: 'bai', seed: 578, fade: 0.25});
	g.globalAlpha = 0.85; g.drawImage(seal, FCOLS[3] - 170 - 60, 1180, 120, 120); g.globalAlpha = 1;
	return c;
};
const buildTail = async () => {
	const st = new Stage('tail'); tail = st;
	st.add('table', canvasTex(gradCanvas([[0, '#1c140e'], [0.5, '#2a1f17'], [1, '#1c140e']])), 0, 540, 30000, 4000, -400);
	const end = paintSection('end', {width: 4096, height: 1536, mode: 'mono', seed: 43});
	const col = paintSection('colophon', {width: 4096, height: 1536, mode: 'mono', seed: 43});
	feng = fengSheet(col); pools21 = makePools(feng);
	const dim = '#b3a690';                                   // the tail in lamplit shade; 冯保's columns get the pools of light
	st.add('end', canvasTex(end), XE + 2048 * SK, 540, 4096 * SK, 1080, 0, {emissive: 0.08, tint: dim});
	st.add('col', canvasTex(col), XC + 2048 * SK, 540, 4096 * SK, 1080, 0, {emissive: 0.08, tint: dim});
	fengPlane = st.add('feng', canvasTex(feng), XF + FW21 / 2 * SK, 540, FW21 * SK, 1080, 0, {emissive: 0.08, tint: dim});
	lit21 = new Live(st, 'lit', XF + FW21 / 2 * SK, 540, FW21 * SK, 1080, 0.5, {emissive: 0.16}, 1 / SK * 0.6, 3);
	lit21.L.mesh.renderOrder = 5;
};

// ================================================================================================ boot + scenes
export const bootMing = async () => {
	c20 = new Crest('ming-dusk', {sky: 'dusk', era: '明', lanterns: true, boat: true, bankCrowd: true});
	await Promise.all([buildLane(), buildHall(), buildTail(), c20.ready]);
	{
		const st = c20.st;
		nightSky20 = st.add('nightSky', canvasTex(gradCanvas([[0, '#1F2E38'], [0.3, '#26363f'], [0.46, '#2E404B'], [0.62, '#45565D'], [0.7, '#5A5A4C'], [1, '#3A3E3A']])), 960, 700, 9000, 3600, -8990, {opacity: 0});
		jl20 = new Live(st, 'jlWin', -420, 760, 600, 260, -2590, {emissive: 1.3}, 1);
		cart20 = new Live(st, 'cart20', 0, 1100, 5000, 1000, 18, {rim: 0.6, rimPx: 5}, 1);
		cast20 = new Cast(st, 'cast20', 0, 1100, 5000, 1400, 20);
		near20 = new Live(st, 'near20', 0, 1100, 5000, 1000, 21, {rim: 0.6, rimPx: 5}, 1);
		roll20 = new Live(st, 'roll20', 0, 1100, 5000, 1400, 22, {emissive: 0.55}, 0.8);
		mine20 = [nightSky20.mat, jl20.L.mat, roll20.L.mat, c20.streak.L.mat, c20.glowLive.L.mat];
		// the match: the X on the crate at b33 lands where the hall doors' X ended scene 19
		hallSt.setCam(...(camPath(b(33), K19) as [number, number, number]));
		const X = stripX(), xa = scr(hallSt, X.a0[0], X.a0[1], ZW3 + 2), xb = scr(hallSt, X.a1[0], X.a1[1], ZW3 + 2), xm = scr(hallSt, X.c[0], X.c[1], ZW3 + 2);
		const cx0 = crateX(cartX(b(33))), wScreen = xb.x - xa.x, k = wScreen / cx0.w;
		CAM20_0 = solveCam(cx0.c[0], cx0.c[1], 0, xm.x, xm.y, k);
	}
};
addScene({id: '18', a: b(29.25), z: b(31) - 0.2, in: {mode: 3, a: b(29.25), z: b(29.5), pt: BLEED_PT}, draw: d18});
addScene({id: '19', a: b(31) - 0.2, z: b(33), in: {mode: 6, a: b(31) - 0.2, z: b(31) + 0.2, dir: [-1, 0], band: 0.3}, draw: d19});
addScene({id: '20', a: b(33), z: b(35.5) - 0.335, draw: d20});
addScene({id: '21', a: b(35.5) - 0.335, z: b(37.25), in: {mode: 6, a: b(35.5) - 0.335, z: b(35.5) + 0.335, dir: [1, 0], band: 1.0}, draw: d21});
