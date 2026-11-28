// THE PROPS of 采访月老的一天: loose things a shot puts somewhere for a frame (every prop is hidden at the start of
// every frame; a shot puts the ones it shows). Built once with the props kit (src/kit/props/kit.ts): NOINK parts with
// their own hull outline.
//   spool       a spool of red thread
import * as THREE from "three";
import type { Mats } from "../bt/pbr";
import { makeKit, Part, box, ball, V, paint, FONT, NOINK } from "../../kit/props/kit";
import { buildPopBooks } from "./popbook";

export const RED = "#d8362a";

export type PropName = "spool" | "book" | "bookShut" | "phone" | "xmPhone" | "laptop" | "bag" | "file" | "slip" | "bowl" | "moon" | "drawer" | "caseDrawer" | "hole" | "stack" | "wing" | "egg" | "cloud" | "cloudBank" | "tangle";
export type PutO = { yaw?: number; pitch?: number; roll?: number; scale?: number };
export type Prop = { group: THREE.Group; put(at: THREE.Vector3 | [number, number, number], o?: PutO): Prop };

export const buildProps = (M: Mats) => {
  const K = makeKit(M);
  const group = new THREE.Group(); group.name = "props";
  const made = new Map<string, Prop>();
  const flat = (c: string, rough = 0.85) => K.flat(c, { rough });
  const tex = (w: number, h: number, fn: (g: CanvasRenderingContext2D, w: number, h: number) => void) => K.flat("#ffffff", { map: paint(w, h, fn), rough: 0.95 });
  // v6: a soft contact shadow under a prop that always stands on something (named "*.contact": the checkers skip it)
  const contactMat = new THREE.MeshBasicMaterial({ map: paint(64, 64, (cg, w, h) => { cg.clearRect(0, 0, w, h); const gr = cg.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(30,24,22,0.62)"); gr.addColorStop(0.5, "rgba(30,24,22,0.4)"); gr.addColorStop(1, "rgba(30,24,22,0)"); cg.fillStyle = gr; cg.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const contact = (g: THREE.Group, name: string, rx: number, rz: number, x = 0, z = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * rx, 2 * rz).rotateX(-Math.PI / 2).translate(x, 0.0008, z), contactMat);
    m.name = `${name}.contact`; m.layers.set(NOINK); m.renderOrder = 2; m.castShadow = false; m.receiveShadow = false; g.add(m);
  };
  const BUILD: Record<PropName, () => THREE.Group> = {
    spool: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#c9a063", 0.7), new THREE.CylinderGeometry(0.05, 0.05, 0.012, 16).translate(0, 0.006, 0), 0.004);
      P.add(flat(RED, 0.8), new THREE.CylinderGeometry(0.036, 0.036, 0.07, 16).translate(0, 0.047, 0), 0.004);
      P.add(flat("#c9a063", 0.7), new THREE.CylinderGeometry(0.05, 0.05, 0.012, 16).translate(0, 0.088, 0), 0.004);
      return P.into(g, "spool");
    },
    // 姻缘簿, open: two cream pages on a blue cloth cover, held flat (pages up, spine along z)
    book: () => {
      const g = new THREE.Group(), P = new Part(K);
      const page = tex(256, 320, (cg, w, h) => {
        cg.fillStyle = "#f4ead0"; cg.fillRect(0, 0, w, h); cg.strokeStyle = "rgba(170,50,40,0.55)"; cg.lineWidth = 2;
        for (let x = 0.14; x < 0.95; x += 0.145) { cg.beginPath(); cg.moveTo(w * x, h * 0.06); cg.lineTo(w * x, h * 0.94); cg.stroke(); }
        cg.fillStyle = "rgba(40,34,30,0.8)"; for (let c = 0; c < 6; c++) for (let r = 0; r < 9; r++) if ((c * 7 + r * 3) % 5) cg.fillRect(w * (0.165 + c * 0.145), h * (0.09 + r * 0.094), w * 0.085, h * 0.06);
        cg.fillStyle = "rgba(200,40,30,0.85)"; cg.beginPath(); cg.arc(w * 0.78, h * 0.86, w * 0.07, 0, 7); cg.fill();
      });
      P.add(flat("#3d5a8a", 0.9), box(0.36, 0.012, 0.25, 0, 0.006, 0), 0.005);
      for (const sx of [-1, 1]) P.add(page, box(0.165, 0.014, 0.23, sx * 0.086, 0.019, 0), 0.003);
      return P.into(g, "book");
    },
    // the same book shut (carried under his arm, on the step)
    bookShut: () => {
      const g = new THREE.Group(), P = new Part(K);
      const cover = tex(128, 180, (cg, w, h) => {
        cg.fillStyle = "#3d5a8a"; cg.fillRect(0, 0, w, h); cg.fillStyle = "#f4ead0"; cg.fillRect(w * 0.3, h * 0.12, w * 0.4, h * 0.6);
        cg.fillStyle = "#2a2622"; cg.font = `900 ${h * 0.16}px ${FONT}`; cg.textAlign = "center"; cg.textBaseline = "middle";
        [..."姻缘簿"].forEach((c, i) => cg.fillText(c, w * 0.5, h * (0.22 + i * 0.19)));
        cg.strokeStyle = "#f0c04a"; cg.lineWidth = 3; for (const y of [0.2, 0.4, 0.6, 0.8]) { cg.beginPath(); cg.moveTo(0, h * y); cg.lineTo(w * 0.08, h * y); cg.stroke(); }
      });
      P.add(cover, box(0.19, 0.034, 0.26, 0, 0.017, 0), 0.005);
      P.add(flat("#f4ead0", 0.95), box(0.184, 0.024, 0.254, 0.004, 0.017, 0), 0);
      return P.into(g, "bookShut");
    },
    // a phone lying screen up (lit): a dating app card
    phone: () => {
      const g = new THREE.Group(), P = new Part(K);
      const scr = new THREE.MeshBasicMaterial({ map: paint(128, 256, (cg, w, h) => {
        cg.fillStyle = "#fdf4f6"; cg.fillRect(0, 0, w, h); cg.fillStyle = "#ff6f91"; cg.fillRect(0, 0, w, h * 0.1);
        cg.fillStyle = "#cfd8e6"; cg.fillRect(w * 0.1, h * 0.16, w * 0.8, h * 0.52); cg.fillStyle = "#8fa3bf"; cg.beginPath(); cg.arc(w * 0.5, h * 0.36, w * 0.17, 0, 7); cg.fill(); cg.fillRect(w * 0.24, h * 0.5, w * 0.52, h * 0.18);
        cg.fillStyle = "#ff5a6e"; cg.beginPath(); cg.arc(w * 0.7, h * 0.84, w * 0.11, 0, 7); cg.fill(); cg.fillStyle = "#b9c2cf"; cg.beginPath(); cg.arc(w * 0.3, h * 0.84, w * 0.11, 0, 7); cg.fill();
      }) });
      P.add(flat("#22242c", 0.4), box(0.075, 0.009, 0.15, 0, 0.0045, 0), 0.004);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.138).rotateX(-Math.PI / 2).translate(0, 0.0096, 0), scr); m.layers.set(NOINK); m.name = "phone.screen";
      P.into(g, "phone"); g.add(m); return g;
    },
    // 林小满's phone (scene E): a rose-pink case with a white heart sticker and a camera bump on the back (what the lens
    // sees while she holds it), a black bezel and a dating app's profile card on the screen. Local frame: lying screen
    // up (+y), the screen's top toward -z, its right (as she reads it) toward +x; 0.072 x 0.0095 x 0.148.
    xmPhone: () => {
      const g = new THREE.Group(), P = new Part(K), PW = 0.072, PT = 0.0095, PL = 0.148;
      P.add(flat("#e9789a", 0.55), box(PW, PT, PL, 0, 0, 0), 0.004);
      P.add(flat("#2a2730", 0.4), box(0.026, 0.003, 0.026, 0.017, -PT / 2 - 0.0015, -PL / 2 + 0.02), 0.002);
      P.into(g, "xmPhone");
      const back = new THREE.MeshBasicMaterial({ map: paint(128, 256, (cg, w, h) => {
        cg.fillStyle = "#e9789a"; cg.fillRect(0, 0, w, h);
        cg.fillStyle = "rgba(255,255,255,0.16)"; cg.fillRect(w * 0.06, 0, w * 0.08, h);
        // the sticker: a white heart with a red outline, a little tilted
        cg.save(); cg.translate(w * 0.52, h * 0.58); cg.rotate(-0.25); cg.scale(w * 0.0062, w * 0.0062);
        cg.beginPath(); cg.moveTo(0, 12); cg.bezierCurveTo(-26, -6, -14, -26, 0, -12); cg.bezierCurveTo(14, -26, 26, -6, 0, 12); cg.closePath();
        cg.fillStyle = "#ffffff"; cg.fill(); cg.lineWidth = 3; cg.strokeStyle = "#c8332b"; cg.stroke(); cg.restore();
      }) });
      const bm = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.004, PL - 0.004).rotateX(Math.PI / 2).rotateY(Math.PI).translate(0, -PT / 2 - 0.0004, 0), back);
      bm.layers.set(NOINK); bm.name = "xmPhone.back"; g.add(bm);
      const bez = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.004, PL - 0.004).rotateX(-Math.PI / 2).translate(0, PT / 2 + 0.0003, 0), new THREE.MeshBasicMaterial({ color: "#1d1c22" }));
      bez.layers.set(NOINK); bez.name = "xmPhone.bezel"; g.add(bez);
      const scr = new THREE.MeshBasicMaterial({ map: paint(128, 256, (cg, w, h) => {
        cg.fillStyle = "#fff6f8"; cg.fillRect(0, 0, w, h);
        cg.fillStyle = "#ff6f91"; cg.fillRect(0, 0, w, h * 0.09);
        cg.fillStyle = "#ffffff"; cg.font = `900 ${Math.round(h * 0.05)}px ${FONT}`; cg.textAlign = "center"; cg.textBaseline = "middle"; cg.fillText("缘来", w / 2, h * 0.047);
        // the card: a photo (sky, a round head with glasses, shoulders), the name, two tags
        cg.fillStyle = "#ffffff"; cg.fillRect(w * 0.07, h * 0.13, w * 0.86, h * 0.66);
        cg.fillStyle = "#bcd3ec"; cg.fillRect(w * 0.1, h * 0.145, w * 0.8, h * 0.42);
        cg.fillStyle = "#4a5a78"; cg.beginPath(); cg.ellipse(w * 0.5, h * 0.6, w * 0.3, h * 0.1, 0, Math.PI, 0); cg.fill();
        cg.fillStyle = "#f6efe6"; cg.beginPath(); cg.arc(w * 0.5, h * 0.38, w * 0.16, 0, Math.PI * 2); cg.fill();
        cg.strokeStyle = "#2a2730"; cg.lineWidth = 2.5; cg.stroke();
        cg.fillStyle = "#2a2730"; cg.beginPath(); cg.arc(w * 0.5, h * 0.36, w * 0.165, Math.PI * 1.05, Math.PI * 1.95); cg.fill();
        cg.lineWidth = 2; for (const s of [-1, 1]) { cg.beginPath(); cg.arc(w * (0.5 + s * 0.065), h * 0.39, w * 0.045, 0, Math.PI * 2); cg.stroke(); }
        cg.fillStyle = "#2a2730"; cg.font = `900 ${Math.round(h * 0.052)}px ${FONT}`; cg.textAlign = "left"; cg.fillText("阿哲 · 31", w * 0.12, h * 0.63);
        cg.fillStyle = "#ffd5df"; cg.fillRect(w * 0.12, h * 0.67, w * 0.3, h * 0.045); cg.fillRect(w * 0.46, h * 0.67, w * 0.36, h * 0.045);
        cg.fillStyle = "#c2455f"; cg.font = `700 ${Math.round(h * 0.03)}px ${FONT}`; cg.fillText("健身", w * 0.15, h * 0.693); cg.fillText("爱旅行", w * 0.49, h * 0.693);
        // the two buttons: a grey cross, a pink heart
        cg.fillStyle = "#e6e2e6"; cg.beginPath(); cg.arc(w * 0.3, h * 0.88, w * 0.1, 0, Math.PI * 2); cg.fill();
        cg.strokeStyle = "#8a8590"; cg.lineWidth = 4; cg.beginPath(); cg.moveTo(w * 0.26, h * 0.86); cg.lineTo(w * 0.34, h * 0.9); cg.moveTo(w * 0.34, h * 0.86); cg.lineTo(w * 0.26, h * 0.9); cg.stroke();
        cg.fillStyle = "#ff5a7e"; cg.beginPath(); cg.arc(w * 0.7, h * 0.88, w * 0.1, 0, Math.PI * 2); cg.fill();
      }) });
      const sm = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.009, PL - 0.012).rotateX(-Math.PI / 2).translate(0, PT / 2 + 0.0006, 0), scr);
      sm.layers.set(NOINK); sm.name = "xmPhone.screen"; g.add(sm);
      return g;
    },
    // a laptop, open (lid toward +z leaning back): put with yaw so the lid's back faces the camera or the screen faces its user
    laptop: () => {
      // the lid is its own group ("laptop.lid", hinged along the base's far edge): rotation.x -PI/2 = shut, -0.3 = the
      // half-open lid of scene E (her face shows over it), +0.25 = open and leaning back
      const g = new THREE.Group(), P = new Part(K), lid = new THREE.Group(), Q = new Part(K);
      P.add(flat("#b9bec8", 0.4), box(0.3, 0.014, 0.2, 0, 0.007, 0), 0.005);
      P.into(g, "laptop");
      lid.name = "laptop.lid"; lid.position.set(0, 0.014, 0.1); lid.rotation.x = -0.3;
      Q.add(flat("#aeb4c0", 0.4), box(0.3, 0.2, 0.01, 0, 0.1, 0.005), 0.005);
      Q.into(lid, "laptop.lidface");
      // the screen: a dark editor, a few lines of code, one of them underlined in red (the bug)
      const code = paint(256, 160, (cg, w, h) => {
        cg.fillStyle = "#1c2230"; cg.fillRect(0, 0, w, h); cg.fillStyle = "#2a3246"; cg.fillRect(0, 0, w, h * 0.1); cg.fillRect(0, 0, w * 0.1, h);
        const cols = ["#7fd4ff", "#f2c14e", "#b6e37a", "#e8e8f0", "#f08ab0"];
        for (let r = 0; r < 9; r++) { let x = w * (0.14 + 0.05 * ((r * 3) % 3)); for (let k = 0; k < 2 + ((r * 5) % 3); k++) { const len = w * (0.08 + 0.07 * ((r * 7 + k * 3) % 4)); cg.fillStyle = cols[(r + k * 2) % 5]; cg.fillRect(x, h * (0.16 + r * 0.09), len, h * 0.04); x += len + w * 0.03; } }
        cg.fillStyle = "#ff4a4a"; cg.fillRect(w * 0.19, h * 0.565, w * 0.42, h * 0.02);
      });
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.17).rotateY(Math.PI).translate(0, 0.1, -0.001), new THREE.MeshBasicMaterial({ map: code })); scr.layers.set(NOINK); scr.name = "laptop.screen";
      lid.add(scr); g.add(lid); contact(g, "laptop", 0.18, 0.125); return g;
    },
    // a takeaway bag: brown paper, twisted handles, a receipt stapled on
    bag: () => {
      const g = new THREE.Group(), P = new Part(K);
      const paper = tex(128, 128, (cg, w, h) => { cg.fillStyle = "#c79a62"; cg.fillRect(0, 0, w, h); cg.fillStyle = "#f6f2e6"; cg.fillRect(w * 0.3, h * 0.22, w * 0.4, h * 0.5); cg.fillStyle = "#3a3632"; for (let i = 0; i < 6; i++) cg.fillRect(w * 0.35, h * (0.28 + i * 0.07), w * (0.18 + 0.1 * ((i * 3) % 2)), h * 0.025); cg.fillStyle = "#e0453a"; cg.fillRect(w * 0.3, h * 0.78, w * 0.4, h * 0.08); });
      P.add(paper, box(0.2, 0.22, 0.12, 0, 0.11, 0), 0.006);
      for (const sz of [-1, 1]) P.add(flat("#a67c48", 0.9), new THREE.TorusGeometry(0.045, 0.006, 6, 14, Math.PI).translate(0, 0.22, sz * 0.035), 0.003);
      return P.into(g, "bag");
    },
    // a case file: a cream paper folder tied with red thread, a label strip (the name is drawn by the HUD, not here)
    file: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#e9dcb8", 0.95), box(0.2, 0.26, 0.022, 0, 0.13, 0), 0.005);
      P.add(flat("#f8f1dc", 0.95), box(0.06, 0.18, 0.004, -0.05, 0.14, 0.013), 0);
      P.add(flat(RED, 0.8), box(0.204, 0.012, 0.026, 0, 0.09, 0), 0); P.add(flat(RED, 0.8), box(0.012, 0.264, 0.026, 0.04, 0.13, 0), 0);
      return P.into(g, "file");
    },
    // an incense prayer slip: a red paper strip with gold characters (求姻缘)
    slip: () => {
      const g = new THREE.Group(), P = new Part(K);
      const t = tex(96, 256, (cg, w, h) => { cg.fillStyle = "#c8281e"; cg.fillRect(0, 0, w, h); cg.strokeStyle = "#f0c04a"; cg.lineWidth = 4; cg.strokeRect(6, 6, w - 12, h - 12); cg.fillStyle = "#f6d46a"; cg.font = `900 ${h * 0.2}px ${FONT}`; cg.textAlign = "center"; cg.textBaseline = "middle"; [..."求姻缘"].forEach((c, i) => cg.fillText(c, w / 2, h * (0.22 + i * 0.28))); });
      P.add(t, box(0.11, 0.3, 0.004, 0, 0.15, 0), 0.004);
      return P.into(g, "slip");
    },
    // the full moon that rises behind him on his card: a pale gold disc with soft craters and a ring of red thread
    // (unlit, facing +z; radius 0.62 m)
    moon: () => {
      const g = new THREE.Group();
      const t = paint(512, 512, (cg, w, h) => {
        cg.clearRect(0, 0, w, h);
        const gr = cg.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.5); gr.addColorStop(0, "rgba(246,208,110,0.55)"); gr.addColorStop(1, "rgba(246,208,110,0)");
        cg.fillStyle = gr; cg.fillRect(0, 0, w, h);
        cg.fillStyle = "#fbeab4"; cg.beginPath(); cg.arc(w / 2, h / 2, w * 0.36, 0, 7); cg.fill();
        cg.fillStyle = "rgba(226,178,84,0.32)"; for (const [x, y, r] of [[0.38, 0.38, 0.07], [0.6, 0.52, 0.09], [0.46, 0.66, 0.05], [0.64, 0.34, 0.04], [0.33, 0.56, 0.035]]) { cg.beginPath(); cg.arc(w * x, h * y, w * r, 0, 7); cg.fill(); }
        cg.strokeStyle = "#e8b84e"; cg.lineWidth = 7; cg.beginPath(); cg.arc(w / 2, h / 2, w * 0.36, 0, 7); cg.stroke();
        cg.strokeStyle = "#9a1c14"; cg.lineWidth = 11; cg.beginPath(); cg.arc(w / 2, h / 2, w * 0.415, 0, 7); cg.stroke();
        cg.strokeStyle = "#e2463a"; cg.lineWidth = 6; cg.beginPath(); cg.arc(w / 2, h / 2, w * 0.415, 0, 7); cg.stroke();
        cg.fillStyle = "#e2463a"; cg.strokeStyle = "#9a1c14"; cg.lineWidth = 3; cg.beginPath(); cg.arc(w / 2, h * 0.085, w * 0.022, 0, 7); cg.fill(); cg.stroke();
      });
      const cg0 = new THREE.CircleGeometry(0.735, 56), uv = cg0.attributes.uv, ps = cg0.attributes.position;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, ps.getX(i) / 1.72 + 0.5, ps.getY(i) / 1.72 + 0.5);
      const m = new THREE.Mesh(cg0, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
      m.layers.set(NOINK); m.name = "moon.card"; m.renderOrder = 2; g.add(m); return g;
    },
    // A DRAWER of the case-file cabinet, pulled out: +x = out of the wall, the origin = the middle of its front face.
    // Put it over a cell of the cabinet (sets/office.ts CAB: 0.25 wide, 0.26 tall) at (cabinetX + out, the cell's middle, its z).
    drawer: () => {
      const g = new THREE.Group(), P = new Part(K), wood = flat("#5e3c26", 0.75), dark = flat("#3a2216", 0.8);
      P.add(wood, box(0.018, 0.236, 0.232, -0.009, 0, 0), 0.004);                                   // the front
      P.add(dark, box(0.34, 0.012, 0.22, -0.188, -0.106, 0), 0.003);                                // the bottom
      for (const sz of [-1, 1]) P.add(dark, box(0.34, 0.2, 0.012, -0.188, -0.012, sz * 0.108), 0.003);
      P.add(flat("#eadcb8", 0.95), box(0.003, 0.058, 0.12, 0.0015, 0.066, 0), 0);                   // the label
      P.add(flat("#b08a44", 0.45), ball(V(0.014, -0.031, 0), 0.014), 0.003);                        // the pull
      // the files standing in it (their tops show over the sides), thread tied round each
      for (let k = 0; k < 4; k++) {
        const x = -0.06 - k * 0.062, tilt = new THREE.Matrix4().makeRotationZ(0.1 - 0.05 * k).setPosition(x, 0.0, 0);
        P.add(flat(k % 2 ? "#e9dcb8" : "#dccba0", 0.95), box(0.02, 0.23, 0.19, 0, 0.02, 0), 0.003, tilt);
        P.add(flat(RED, 0.8), box(0.024, 0.012, 0.194, 0, 0.06, 0), 0, tilt);
      }
      return P.into(g, "drawer");
    },
    // THE THICK FILE (许仙 × 白娘子: a thousand years of approvals): a bale of folders tied twice with red thread, lying flat
    // a case drawer of scene C (v6): the same drawer with room at the front for its case book (popbook.ts, standing
    // on its bottom edge, cover to the front, 4 to 6 cm behind the front) and two thin files at the back
    caseDrawer: () => {
      const g = new THREE.Group(), P = new Part(K), wood = flat("#5e3c26", 0.75), dark = flat("#3a2216", 0.8);
      P.add(wood, box(0.018, 0.236, 0.232, -0.009, 0, 0), 0.004);
      P.add(dark, box(0.34, 0.012, 0.22, -0.188, -0.106, 0), 0.003);
      for (const sz of [-1, 1]) P.add(dark, box(0.34, 0.2, 0.012, -0.188, -0.012, sz * 0.108), 0.003);
      P.add(dark, box(0.012, 0.2, 0.22, -0.352, -0.012, 0), 0.003);                                 // the back
      P.add(flat("#eadcb8", 0.95), box(0.003, 0.058, 0.12, 0.0015, 0.066, 0), 0);
      P.add(flat("#b08a44", 0.45), ball(V(0.014, -0.031, 0), 0.014), 0.003);
      for (let k = 0; k < 2; k++) {
        const x = -0.25 - k * 0.05, tilt = new THREE.Matrix4().makeRotationZ(0.06 - 0.05 * k).setPosition(x, 0.0, 0);
        P.add(flat(k % 2 ? "#e9dcb8" : "#dccba0", 0.95), box(0.02, 0.21, 0.19, 0, 0.01, 0), 0.003, tilt);
        P.add(flat(RED, 0.8), box(0.024, 0.012, 0.194, 0, 0.05, 0), 0, tilt);
      }
      return P.into(g, "caseDrawer");
    },
    // the dark opening a pulled-out case drawer leaves in the cabinet's painted face (put at the face, x = cabinetX)
    hole: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#1a0e08", 0.95), box(0.004, 0.226, 0.222, 0.002, 0, 0), 0);
      return P.into(g, "hole");
    },
    stack: () => {
      const g = new THREE.Group(), P = new Part(K);
      let y = 0;
      for (let k = 0; k < 9; k++) {
        const hgt = 0.022 + 0.006 * ((k * 5) % 3), m = new THREE.Matrix4().makeRotationY(0.07 * (((k * 7) % 5) - 2)).setPosition(0.006 * (((k * 3) % 5) - 2), y + hgt / 2, 0);
        P.add(flat(k % 3 === 1 ? "#dccba0" : k % 3 === 2 ? "#f1e6c6" : "#e9dcb8", 0.95), new THREE.BoxGeometry(0.21, hgt, 0.27), 0.003, m);
        y += hgt;
      }
      for (const z of [-0.07, 0.07]) P.add(flat(RED, 0.8), box(0.226, y + 0.012, 0.014, 0, y / 2, z), 0);
      P.add(flat(RED, 0.8), box(0.014, y + 0.014, 0.286, 0.03, y / 2, 0), 0);
      P.add(flat("#f8f1dc", 0.95), box(0.07, 0.003, 0.15, -0.05, y + 0.0015, 0), 0);
      return P.into(g, "stack");
    },
    // one WING of a paper butterfly (梁祝): a flat paper wing (cream, a red edge, the same on both sides), hinged on its
    // local z axis at x = 0 and reaching out along +x. Two of them, the second with yaw + PI, flap by their roll.
    wing: () => {
      const g = new THREE.Group();
      const t = paint(128, 160, (cg, w, h) => {
        cg.clearRect(0, 0, w, h);
        const path = () => { cg.beginPath(); cg.moveTo(2, h * 0.52); cg.quadraticCurveTo(w * 0.2, h * 0.02, w * 0.92, h * 0.06); cg.quadraticCurveTo(w * 1.02, h * 0.36, w * 0.66, h * 0.5); cg.quadraticCurveTo(w * 0.98, h * 0.62, w * 0.74, h * 0.95); cg.quadraticCurveTo(w * 0.3, h * 1.0, 2, h * 0.6); cg.closePath(); };
        path(); cg.fillStyle = "#f6c544"; cg.fill(); cg.lineWidth = 10; cg.strokeStyle = "#b02a20"; cg.stroke();
        cg.fillStyle = "#c8382c"; cg.beginPath(); cg.arc(w * 0.62, h * 0.26, w * 0.09, 0, 7); cg.fill(); cg.beginPath(); cg.arc(w * 0.56, h * 0.76, w * 0.07, 0, 7); cg.fill();
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.094).rotateX(-Math.PI / 2).translate(0.0375, 0, 0), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }));
      m.layers.set(NOINK); m.name = "wing.face"; g.add(m); return g;
    },
    // a small auspicious cloud (the mother's vision kneels in it, in the incense smoke): soft white puffs
    cloud: () => {
      const g = new THREE.Group(), P = new Part(K), m = flat("#f6f1ea", 0.95);
      for (const [x, y, z, r] of [[0, 0, 0, 0.1], [-0.11, -0.012, 0.01, 0.075], [0.11, -0.01, -0.01, 0.08], [-0.05, 0.02, 0.07, 0.07], [0.06, 0.015, 0.075, 0.066], [-0.17, -0.03, 0, 0.05], [0.18, -0.03, 0.01, 0.052], [0.0, 0.03, -0.06, 0.07]] as [number, number, number, number][])
        P.add(m, ball(V(x, y, z), r, [1, 0.72, 1]), 0.0035);
      return P.into(g, "cloud");
    },
    // THE MOTHER'S CLOUD BANK (scene D, v6b): the incense smoke gathers into a soft auspicious cloud and she kneels in it, seen
    // from the waist up (v5's little cloud under her feet showed her legs: Jay's note at f2800). Made for her at 0.42 of her
    // size; put it with scale k/0.42 for a vision of size k. A ring of puffs round an empty middle (her legs are in the middle
    // and touch nothing), highest at the front (its top 0.25, just over the top of her legs at 0.23), a wider lower ring, a
    // lilac underside. Flat unlit colours with the ink outline, like a drawn 祥云 (lit spheres read as a heap of grey balls).
    // About 0.46 wide. Origin: her feet; it faces +z (turn it to the camera); a pale gold glow behind her.
    cloudBank: () => {
      const g = new THREE.Group(), P = new Part(K);
      const top = new THREE.MeshBasicMaterial({ color: "#fdfcff" }), mid = new THREE.MeshBasicMaterial({ color: "#efebf8" }), low = new THREE.MeshBasicMaterial({ color: "#d9d2ef" });
      const ring: [number, number, number, number, THREE.Material][] = [];   // angle (degrees, 0 = front), ring radius, y, puff radius, colour
      for (const a of [-40, 0, 40]) ring.push([a, 0.17, 0.175, 0.095, top]);           // the front rim (inside edge 0.075 out: room for her to bow)
      for (const a of [-80, 80]) ring.push([a, 0.14, 0.15, 0.085, top]);               // its ends
      for (const a of [-130, 130, 180]) ring.push([a, 0.13, 0.15, 0.08, mid]);         // the back
      for (const a of [-60, 0, 60]) ring.push([a, 0.17, 0.06, 0.085, mid]);            // the lower ring
      for (const a of [-120, 120, 180]) ring.push([a, 0.15, 0.06, 0.08, mid]);
      for (const a of [-30, 30, 150, -150]) ring.push([a, 0.1, -0.01, 0.065, low]);    // the lilac underside
      for (const [a, rr, y, r, mat] of ring) { const t = (a * Math.PI) / 180; P.add(mat, ball(V(rr * Math.sin(t), y, rr * Math.cos(t)), r, [1, 0.8, 1]), 0.0035); }
      // the middle, filled up to her (inside edge 0.075 from her axis; her body is 0.063 wide at this size, her legs 0.03 out)
      for (let i = 0; i < 6; i++) { const t = (i / 6) * Math.PI * 2 + 0.3; P.add(mid, ball(V(0.115 * Math.sin(t), 0.1, 0.115 * Math.cos(t)), 0.04, [1, 0.9, 1]), 0.002); }
      P.into(g, "cloudBank", { cast: false });
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95).translate(0, 0.4, -0.2), new THREE.MeshBasicMaterial({
        map: paint(128, 128, (cg, w, h) => { const gr = cg.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(255,226,150,0.6)"); gr.addColorStop(0.5, "rgba(255,214,140,0.25)"); gr.addColorStop(1, "rgba(255,210,140,0)"); cg.fillStyle = gr; cg.fillRect(0, 0, w, h); }),
        transparent: true, depthWrite: false }));
      glow.layers.set(NOINK); glow.name = "cloudBank.glow"; glow.renderOrder = 4; glow.castShadow = false; glow.receiveShadow = false; g.add(glow);
      return g;
    },
    // HIS THREAD, IN A HOPELESS KNOT (what he picks off her lens): a fist-sized ball of red loops, two loose ends
    tangle: () => {
      const g = new THREE.Group(), P = new Part(K), m = flat(RED, 0.8);
      for (const [p, q, r, rx, ry] of [[2, 3, 0.04, 0, 0], [3, 2, 0.036, 1.2, 0.5], [3, 4, 0.044, 0.4, 2.1], [2, 5, 0.03, 2.0, 1.1]] as [number, number, number, number, number][])
        P.add(m, new THREE.TorusKnotGeometry(r, 0.0055, 72, 5, p, q).applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, 0))).translate(0, 0.055, 0), 0.0018);
      for (const [a, b] of [[V(0.03, 0.05, 0.02), V(0.11, 0.004, 0.05)], [V(-0.03, 0.06, -0.01), V(-0.1, 0.004, -0.06)]] as [THREE.Vector3, THREE.Vector3][]) {
        const c = new THREE.QuadraticBezierCurve3(a, a.clone().lerp(b, 0.5).add(V(0, 0.05, 0)), b);
        P.add(m, new THREE.TubeGeometry(c, 10, 0.0055, 5), 0.0018);
      }
      return P.into(g, "tangle");
    },
    // a braised egg (the rider's extra): a small brown egg
    egg: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#a8743c", 0.6), ball(V(0, 0.022, 0), 0.022, [1, 1.25, 1]), 0.003);
      return P.into(g, "egg");
    },
    // a bowl of noodles with an egg on top
    // a noodle bowl (scene F, v6: Jay's note "props untextured"): white porcelain with a blue 回纹 band under the rim
    // and a blue foot line; beef noodles in a golden broth (noodles, beef, scallions, half an egg); bamboo chopsticks
    // resting across the rim; a contact shadow
    bowl: () => {
      const g = new THREE.Group(), P = new Part(K);
      const side = K.flat("#ffffff", { map: paint(512, 64, (cg, w, h) => {
        cg.fillStyle = "#f6f4ee"; cg.fillRect(0, 0, w, h);
        cg.fillStyle = "#2f5aa8"; cg.fillRect(0, 4, w, 3); cg.fillRect(0, 26, w, 2); cg.fillRect(0, h - 9, w, 3); cg.fillRect(0, h - 4, w, 2);
        // the meander (回纹): a square spiral every 32 px between the two lines
        cg.strokeStyle = "#2f5aa8"; cg.lineWidth = 2.4; cg.lineJoin = "miter";
        for (let x = 0; x < w; x += 32) { cg.beginPath(); cg.moveTo(x + 2, 23); cg.lineTo(x + 2, 10); cg.lineTo(x + 26, 10); cg.lineTo(x + 26, 21); cg.lineTo(x + 9, 21); cg.lineTo(x + 9, 15); cg.lineTo(x + 19, 15); cg.stroke(); }
      }), rough: 0.35 });
      P.add(side, new THREE.CylinderGeometry(0.075, 0.045, 0.06, 32).translate(0, 0.03, 0), 0.005);
      const broth = K.flat("#ffffff", { map: paint(128, 128, (cg, w, h) => {
        cg.fillStyle = "#d9a24e"; cg.fillRect(0, 0, w, h);
        const r = (n: number) => { const x = Math.sin(n * 91.7 + 12.3) * 43758.5; return x - Math.floor(x); };
        // the noodles: pale wavy strands
        cg.strokeStyle = "#f4e2a8"; cg.lineWidth = 3.2; cg.lineCap = "round";
        for (let i = 0; i < 26; i++) { const y0 = 14 + r(i) * 100, ph = r(i + 40) * 6; cg.beginPath(); for (let x = 6; x <= 122; x += 6) { const y = y0 + 5 * Math.sin(x * 0.12 + ph); if (x === 6) cg.moveTo(x, y); else cg.lineTo(x, y); } cg.stroke(); }
        // two slices of beef
        cg.fillStyle = "#7a4a32"; for (const [x, y, a] of [[44, 50, 0.4], [70, 40, -0.3]]) { cg.save(); cg.translate(x, y); cg.rotate(a); cg.beginPath(); cg.ellipse(0, 0, 17, 10, 0, 0, Math.PI * 2); cg.fill(); cg.strokeStyle = "#5a3424"; cg.lineWidth = 1.5; cg.stroke(); cg.restore(); }
        // scallions: small green rings
        cg.strokeStyle = "#5aa04a"; cg.lineWidth = 2.4; for (let i = 0; i < 16; i++) { cg.beginPath(); cg.arc(20 + r(i + 80) * 88, 20 + r(i + 120) * 88, 2.6, 0, Math.PI * 2); cg.stroke(); }
        // a ring of oil on the broth's edge
        cg.strokeStyle = "rgba(160,96,30,0.6)"; cg.lineWidth = 6; cg.beginPath(); cg.arc(w / 2, h / 2, w / 2 - 3, 0, Math.PI * 2); cg.stroke();
      }), rough: 0.4 });
      P.add(broth, new THREE.CircleGeometry(0.069, 32).rotateX(-Math.PI / 2).translate(0, 0.0605, 0), 0);
      P.add(flat("#fff8e8", 0.6), ball(V(0.024, 0.0625, 0.018), 0.022, [1, 0.32, 1]), 0); P.add(flat("#f2a93b", 0.6), ball(V(0.024, 0.0685, 0.018), 0.011, [1, 0.45, 1]), 0);
      // the chopsticks: across the rim, toward the eater's right
      const mBam = flat("#d8b57a", 0.6);
      for (const [dz, a] of [[-0.03, 0.04], [-0.018, 0.0]] as const) P.add(mBam, box(0.235, 0.0055, 0.0055, 0.035, 0.0635, dz).rotateY(a), 0.0015);
      P.into(g, "bowl");
      contact(g, "bowl", 0.085, 0.085);
      return g;
    },
  };
  const prop = (name: PropName, key = ""): Prop => {
    const k = `${name}|${key}`;
    let p = made.get(k);
    if (!p) {
      const g = BUILD[name](); g.name = `prop.${k}`; g.visible = false; group.add(g);
      p = { group: g, put(at, o = {}) {
        const v = Array.isArray(at) ? new THREE.Vector3(...at) : at;
        g.position.copy(v); g.rotation.set(o.pitch ?? 0, o.yaw ?? 0, o.roll ?? 0, "YXZ"); g.scale.setScalar(o.scale ?? 1); g.visible = true; return p!;
      } };
      made.set(k, p);
    }
    return p;
  };
  // ---- THE RED THREADS (v6, owner's notes 1 and 21 on v5: "too 3D", "give them a more fitting style like our other
  // props"): drawn exactly like every other prop: a braided cord in the film's red with a lighter twist painted along it
  // (a canvas texture, mip-mapped, its stripes a fixed 2.2 cm apart whatever the thread's length), lit by the place like
  // the props, and the kit's black back-face hull round it, so it reads as a drawn cord with an ink outline from any side.
  // No glow sleeve: a thread is a thing, not a light. Rebuilt each frame it is shown.
  type Th = { core: THREE.Mesh; hull: THREE.Mesh };
  const threads = new Map<string, Th>();
  const twist = (col: string) => paint(64, 16, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    // two lighter strands winding round the cord: diagonal bands across the texture (u along the cord, v round it)
    g.fillStyle = "rgba(255,190,170,0.42)";
    for (const o of [0, 32]) { g.beginPath(); g.moveTo(o, 0); g.lineTo(o + 14, 0); g.lineTo(o + 14 - 16, h); g.lineTo(o - 16, h); g.closePath(); g.fill(); g.beginPath(); g.moveTo(o + 64, 0); g.lineTo(o + 78, 0); g.lineTo(o + 62, h); g.lineTo(o + 48, h); g.closePath(); g.fill(); }
    g.fillStyle = "rgba(60,8,6,0.35)";
    for (const o of [18, 50]) { g.beginPath(); g.moveTo(o, 0); g.lineTo(o + 4, 0); g.lineTo(o - 12, h); g.lineTo(o - 16, h); g.closePath(); g.fill(); }
  });
  const CORE: Record<string, THREE.Material> = {};
  const coreMat = (col: string) => { const t = twist(col); t.wrapS = t.wrapT = THREE.RepeatWrapping; return K.flat("#ffffff", { map: t, rough: 0.8 }); };
  const PERIOD = 0.022, INK = 0.0034;
  /** a thread through `pts` (world): r = radius (default 0.0065), col (default the film's red), cut 0..1 = draw only
   *  that share from the start, closed = a loop. (glow is accepted and ignored: v6 threads do not glow.) */
  const thread = (key: string, pts: THREE.Vector3[], o: { r?: number; glow?: number; col?: string; cut?: number; closed?: boolean } = {}) => {
    let t = threads.get(key);
    if (!t) {
      const core = new THREE.Mesh(new THREE.BufferGeometry(), coreMat(RED)), hull = new THREE.Mesh(new THREE.BufferGeometry(), K.ink);
      for (const m of [core, hull]) { m.layers.set(NOINK); m.frustumCulled = false; m.castShadow = m.receiveShadow = false; group.add(m); }
      core.name = `thread.${key}`; hull.name = `thread.${key}.ink`;
      t = { core, hull }; threads.set(key, t);
    }
    if (pts.length < 2) return;
    const col = o.col ?? RED; t.core.material = (CORE[col] ??= coreMat(col));
    const curve = new THREE.CatmullRomCurve3(pts, !!o.closed, "catmullrom", 0.5), L = curve.getLength(), n = Math.max(12, Math.min(220, Math.ceil(L / 0.012))), r = Math.max(0.006, o.r ?? 0.0065);
    t.core.geometry.dispose(); t.hull.geometry.dispose();
    const cg = new THREE.TubeGeometry(curve, n, r, 8, !!o.closed), uv = cg.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setX(i, (uv.getX(i) * L) / PERIOD);
    t.core.geometry = cg; t.hull.geometry = new THREE.TubeGeometry(curve, n, r + INK, 8, !!o.closed);
    if (o.cut !== undefined && o.cut < 1) { const c = Math.max(0, Math.floor(n * o.cut)) * 8 * 6; t.core.geometry.setDrawRange(0, c); t.hull.geometry.setDrawRange(0, c); }
    t.core.visible = true; t.hull.visible = true;
  };
  /** points of a thread hanging from a to b with `sag` metres of droop in the middle, n inner points; wob = a small sway */
  const hang = (a: THREE.Vector3, b: THREE.Vector3, sag = 0.15, n = 5, wob = 0) => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i <= n + 1; i++) { const u = i / (n + 1), p = a.clone().lerp(b, u); p.y -= sag * 4 * u * (1 - u); if (wob) p.x += wob * Math.sin(u * Math.PI) ; out.push(p); }
    return out;
  };
  // THE CASE BOOKS (popbook.ts): w.props.book(kind).put(at, o).set({ open, g, t })
  const books = buildPopBooks(K, group);
  return { group, prop, thread, hang, book: books.book, begin() { for (const p of made.values()) p.group.visible = false; for (const t of threads.values()) { t.core.visible = false; t.hull.visible = false; } books.begin(); } };
};
export type Props = ReturnType<typeof buildProps>;
