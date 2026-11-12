// The OPENING SHOT of the Hongmen film in the preview harness: Liu Bang on the privy (sets/privy.ts), the change to
// the block-jawed face and the "shh, look at my jawline" gesture (privyOpening).
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/opening.ts out.png --size 540x960 --opts '{"font":"/home/user/jayjiao-debug/video/public/bt/sans700.ttf","t":1.1,"variant":"B"}'
//   frames in one page load:  ... opening.ts outdir --pick 0,2,4,...   (frame i = film frame i, 30 a second)
// Options:
//   t        seconds into the shot (a still; default: the frame f / 30);  f = the frame (default 0);  ts = a list of
//            seconds: frame i of --pick shows ts[i]
//   variant  "A" (the plain plank seat) | "B" (the round commode with its lid; the default)
//   cam      a name of PRIVY.cams ("hero", "front", "wide") or { pos, look, fov } or { yaw, pitch, dist, fov, lookY, lookX }
//   close    a number: the film's LAST shot instead (privyClosing): frame f of a closing shot `close` frames long
//   who      0 | 1: force that figure (0 = Liu Bang himself, 1 = the block jaw) whatever the frame
//   expr     force an expression;  noPop: true = no head pop / camera punch at the change
//   dbg      true = prints the head's, hands' and seat's places
//   light    fields laid over PRIVY_CAST_LIGHT (to try a figure light);  noset: true = only the floor (to tell what
//            is the figure's own shading and what comes from the set);  ao / ink: false (the harness's own)
//   hide     true = no figure: what stands behind and under the robe (the commode's whole shape)
//   bench    false = the robe is NOT told the seat (acc/garb.ts setSeat(rig, null)): the old column of cloth to the
//            floor, for comparison. (The privy figures are born with the seat: acc/liu_dage.ts. Variant A's seat is
//            given here.)
//   rise     0..1 = the stand-up test of the seated robe: the rig's seat rises from the commode to standing height
//            and moves `riseFwd` (default 0.36 m) forward, so that at 1 he stands in front of the commode; the robe
//            still knows the real commode. A row of these must show no step. A list: frame i of --pick shows rise[i].
//   jaw      [a, c] = try another cut of the block-jawed figure's jaw (Look.head.jaw);  false = no cut (the plain block)
//   shots    a list: frame i of --pick is drawn with shots[i] laid over the options: { t | f, cam, close, who, expr,
//            rise, hide } (several cameras, times and tests in ONE page load: renders are queued machine-wide). The
//            figures' light follows each frame's camera (privyCastLight), as a shot would set it.
// Prints one QA line per frame: reach / clear / seat / head of the figure that shows (rig.qa).
import * as THREE from "three";
import { preview, type Cam } from "./sheet_common";
import { RigCast } from "../../group/kit/rig3d";
import type { Expr } from "../../group/kit/toon";
import { addPerson } from "../people";
import { setSeat } from "../acc/garb";
import { LIU_PRIVY, LIU_DAGE } from "../acc/liu_dage";
import { buildPrivy, privyOpening, privyClosing, privyCam, PRIVY, PRIVY_FACING, PRIVY_FILL, PRIVY_AO, PRIVY_BG, privyCastLight, type PrivyVariant } from "../sets/privy";

preview({ w: 540, h: 960 }, (c) => {
  const o = c.opts, variant: PrivyVariant = o.variant === "A" ? "A" : "B";
  const M = c.mats(PRIVY_FILL), set = buildPrivy(M, { variant });
  c.scene.add(set.group);
  console.log(`QA: privy ${variant} ${set.tris} triangles`);
  if (o.noset) set.group.traverse((m) => { if ((m as THREE.Mesh).isMesh && m.name !== "privy.floor") m.visible = false; });
  const camOf = (camOpt: any): Cam => (typeof camOpt === "string" ? (PRIVY.cams[camOpt] ?? PRIVY.cams.hero)
    : camOpt && camOpt.pos ? camOpt
    : camOpt ? privyCam(camOpt.yaw ?? -14, camOpt.pitch ?? 7, camOpt.dist ?? 4, camOpt.fov ?? 31, camOpt.lookY ?? 0.69, camOpt.lookX ?? 0)
    : PRIVY.cams.hero);
  const baseCam = camOf(o.cam), shots: Record<string, any>[] | null = Array.isArray(o.shots) ? o.shots : null;
  const rc = new RigCast(c.scene, { light: { ...privyCastLight(baseCam), ...(o.light ?? {}) } as never });
  const dageP = o.jaw === undefined ? LIU_DAGE : { ...LIU_DAGE, name: "liuDageTry", look: { ...LIU_DAGE.look, head: { ...LIU_DAGE.look.head!, jaw: (o.jaw || undefined) as [number, number] | undefined } } };
  const figs = [addPerson(rc, LIU_PRIVY), addPerson(rc, dageP)];
  if (o.bench === false) figs.forEach((r) => setSeat(r, null));
  else if (variant === "A") figs.forEach((r) => setSeat(r, PRIVY.seat.A, PRIVY_FACING));
  const frameOf = (i: number) => {
    const q: Record<string, any> = shots ? { ...o, ...(shots[i] ?? {}) } : o, cam0 = shots && shots[i] && shots[i].cam !== undefined ? camOf(shots[i].cam) : baseCam;
    const f = q.t !== undefined ? q.t * 30 : q.f !== undefined && shots ? q.f : Array.isArray(q.ts) ? q.ts[i] * 30 : i;
    const P = q.close !== undefined ? privyClosing(f, q.close, { variant, cam: cam0 }) : privyOpening(f, { variant, cam: cam0 });
    if (q.noPop && P.who === 1) { P.cam = cam0; if (P.state.head) P.state.head = { ...P.state.head, scale: 1 }; }
    if (q.who !== undefined) P.who = q.who ? 1 : 0;
    if (q.expr) P.state.expr = q.expr as Expr;
    if (q.rise !== undefined) {
      // the stand-up test: the seat goes up to standing height and forward, the hands hang
      const k: number = Array.isArray(q.rise) ? q.rise[i] : q.rise, seat = PRIVY.seat[variant], top = seat.top.clone();
      top.y += (figs[P.who].dim.hipY - 0.028 - top.y) * k; top.z += (q.riseFwd ?? 0.36) * k;
      P.state.seat = { top, back: seat.back, front: seat.front };
      P.state.hands = [null, null]; P.state.pose = { kind: "idle", t: P.t }; P.state.twist = 0; P.state.head = undefined;
    }
    return { P, hide: !!q.hide, cam0 };
  };
  delete o.cam;                                                    // the harness would take it as a raw camera
  return {
    ao: PRIVY_AO, bg: PRIVY_BG,
    cam: (i) => frameOf(i).P.cam,
    frame: (i) => {
      const { P, hide, cam0 } = frameOf(i);
      if (shots) { const L = { ...privyCastLight(cam0), ...(o.light ?? {}), ...((shots[i] ?? {}).light ?? {}) }; (rc as any).light = L; rc.U.uKey.value.set(...(L.key as [number, number, number])).normalize(); }
      figs.forEach((r, k) => r.set({ ...P.state, visible: !hide && k === P.who }));
      set.animate(P.t);
      rc.update(c.camera, c.h);
      const r = figs[P.who], q = r.qa;
      console.log(`QA: f ${i} t ${P.t.toFixed(3)} who ${P.who} ${P.state.expr} amount ${(P.state.pose?.amount ?? 1).toFixed(2)} jaw ${(P.state.pose?.jaw ?? 0).toFixed(2)} | reach ${q.reach.toFixed(3)} clear ${q.clear.toFixed(3)} seat ${q.seat.toFixed(3)} head ${q.head.toFixed(3)} held ${q.held.toFixed(3)}`);
      for (const v of r.accRules()) if (i === (o.f ?? 0)) console.log(`QA: RULE ${v.acc}: ${v.rule}: ${v.msg}`);
      if (o.dbg) {
        const B = new THREE.Vector3().setFromMatrixPosition(r.group.children[0].matrixWorld), h = [r.handWorld(0), r.handWorld(1)];
        const tubes: THREE.BufferGeometry[] = [];
        for (const ch of r.group.children) { const g = (ch as THREE.Mesh).geometry as THREE.BufferGeometry | undefined; if (g && g.attributes && g.attributes.tangent3 && !tubes.includes(g)) tubes.push(g); }
        const legPts = tubes.slice(2, 4).map((g) => { const A = g.attributes.position.array as Float32Array, n = A.length / 42, pt = (k: number) => { let x = 0, y = 0, z = 0; for (let j = 0; j < 14; j++) { x += A[(k * 14 + j) * 3]; y += A[(k * 14 + j) * 3 + 1]; z += A[(k * 14 + j) * 3 + 2]; } return [x / 14 + 60, y / 14, z / 14].map((v) => v.toFixed(3)).join(","); }; return [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4), n - 1].map(pt).join(" ; "); });
        console.log(`QA: LEGS ${legPts.join(" | ")}`);
        console.log(`QA: DIM ${JSON.stringify(r.dim, (_k, v) => (typeof v === "number" ? +v.toFixed(3) : v)).slice(0, 230)}`);
        console.log(`QA: DBG body bottom ${B.toArray().map((v) => v.toFixed(3))} hands ${h.map((v) => v.toArray().map((x) => x.toFixed(3)).join(",")).join(" | ")} feet ${[0, 1].map((k) => r.footWorld(k).toArray().map((x) => x.toFixed(3)).join(",")).join(" | ")} dim ${JSON.stringify(r.dim, (_k, v) => (typeof v === "number" ? +v.toFixed(3) : v))}`);
      }
    },
  };
});
