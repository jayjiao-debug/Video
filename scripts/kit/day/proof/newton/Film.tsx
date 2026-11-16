// PROOF ONLY: the Newton film through the kit's film shell (makeDayFilm) and the kit's World and sets. The shots, the
// HUD and the film's own layers are Newton's. render_compare.sh renders frames of this and of NewtonFilm and compares.
import React from "react";
import { AbsoluteFill } from "remotion";
import { IP } from "../../../kit/film/env";
import { makeDayFilm } from "../../../kit/day/film";
import { W, H, SEGMENTS, huds, lineNo, type Pose } from "../story";
import { Caption, FactCard, PhoneMask, VlogHud } from "../hud";
import { MS_FX, MsCard, MsFx, MsProof, MsTitle, msAny, msScreen, msStillFrame } from "../hud/ms";
import { MsKnock } from "../hud/ms/knock";
import { FREEZE, msFrozen, msHold, washAt } from "../freeze";
import { msWash, msWashBg } from "../wash";
import { cutHeld, cutLead, cutState } from "../cutout";
import { Whisper, whisperCapAt } from "../hud/whisper";
import { PowerOff } from "../hud/poweroff";
import { SEG as SEG_A } from "../shots/segA";
import { SEG as SEG_B } from "../shots/segB";
import { SEG as SEG_C } from "../shots/segC";
import { SEG as SEG_D } from "../shots/segD";
import { SEG as SEG_E } from "../shots/segE";
import { SEG as SEG_F } from "../shots/segF";
import { SEG as SEG_G } from "../shots/segG";
import { makeWorldKit } from "./world";

const CAP_TEST = (() => {
  const c = IP.cap as { zh?: unknown; en?: unknown; who?: unknown } | undefined;
  return c && typeof c.zh === "string" ? { zh: c.zh, en: typeof c.en === "string" ? c.en : "", who: (c.who === "nt" || c.who === "hm" ? c.who : "ji") as "ji" | "nt" | "hm" } : null;
})();
type Wd = ReturnType<typeof makeWorldKit>;
const box = (n: React.ReactNode) => <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>{n}</AbsoluteFill>;

export const NewtonKitProof = makeDayFilm<Wd, Pose, ReturnType<typeof msScreen> | null>({
  name: "newton", W, H, timeline: SEGMENTS,
  segments: [SEG_A, SEG_B, SEG_C, SEG_D, SEG_E, SEG_F, SEG_G] as never,
  makeWorld: makeWorldKit, lineNo, hold: msHold, stillFrame: msStillFrame,
  afterPose: (w, f, P) => {
    const wash = washAt(f), lead = wash ? cutLead(w as never) : null;
    msWash(w as never, wash, lead ? cutHeld(w as never, lead) : undefined);
    return wash ? { ...P, post: { ...P.post, bg: msWashBg(P.post?.bg ?? w.look().bg, wash) } } : P;
  },
  iso: (w, f) => cutState(w as never, f),
  prepare: (c) => (c.world && c.P && c.showHud && msAny(c.f) ? msScreen(c.world as never, c.P, c.f, msHold(c.f)) : null),
  layers: {
    under: (c) => <>
      {c.P ? <Whisper f={c.f} words={false} edges={!c.noov} /> : null}
      {c.showHud ? box(<MsCard f={c.f} ctx={c.x} />) : null}
    </>,
    hud: (c) => <>
      <VlogHud f={c.h} rec={c.P!.rec} cards={c.P!.cards} lit={msFrozen(c.f) ? Math.min(1, (c.f - FREEZE.at) / 4) : 0} />
      {huds().map((x) => <React.Fragment key={x.name}>{x.draw(c.h, c.P!)}</React.Fragment>)}
      {c.P!.cards !== false ? <FactCard f={c.h} /> : null}
    </>,
    over: (c) => (c.showHud ? box(<><MsTitle f={c.f} ctx={c.x} /><MsFx f={c.f} ctx={c.x} /><MsKnock f={c.f} /></>) : null),
    subtitles: (c) => {
      const frozen = msFrozen(c.f);
      return <>
        {c.P && !frozen ? <Whisper f={c.f} words={c.P.captions !== false && !c.nocap && !CAP_TEST} edges={false} /> : null}
        {c.P && !frozen && c.P.captions !== false && !c.nocap && (CAP_TEST || !whisperCapAt(c.f)) ? <Caption f={c.f} cap={CAP_TEST ?? undefined} /> : null}
      </>;
    },
    extra: () => (MS_FX.proof !== null ? <MsProof t={MS_FX.proof} /> : null),
    mask: () => <PhoneMask />,
    wrap: (f, body) => <PowerOff f={f}>{body}</PowerOff>,
  },
});
