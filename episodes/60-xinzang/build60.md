# ep60 《死后称心脏》 · build brief for the act builders

You are building part of a 160.6 s, 4:3 (1440 × 1080, 30 fps) subtitle-only Douyin film in Remotion. The owner liked the look of
the 4:3 kit (stills in `$S/eg60/kit/KIT-*.png`, contact sheet `$S/eg60/kit/kit_sheet.jpg`) and the "Egyptian" sound. Now every
shot of the script has to be built, alive and colourful, like the @烬序 reference: **a new picture every 2–4 s, constant motion, saturated
mood colours, gods drawn after the real papyri, vertical name labels.**

`S=/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad` · repo `/home/claude/video` · Remotion project
`episodes/37-qiqing/remotion` · code `src/qq60/`.

## Read first
1. `episodes/60-xinzang/script.md`: the **Shot list** rows for your shots (picture · camera · action · mood; SFX column = the sound
   events your picture must deliver), "Cast and labels", the mood colours. Facts are fixed: do not change any subtitle.
2. `src/qq60/story60.ts` (the clock: a/b seconds per shot) and `src/qq60/EP60.tsx` (the master; ShotDef/ShotProps contract).
3. The kit: `frame60.tsx` (Stage60, camPath, toScreen, GRADES, Glow/Flame/Dust/Embers/Smoke/Shaft/Stars), `sets60.tsx` (TombSet,
   EmbalmSet, DuatSet, HallSet, ReedsSet, ScarabSet, AmmitSet, MarketSet, OsirisSet), `scene43.tsx` (Weighing43, LedIn43, Ennead),
   `scene60.tsx` (stateAt: the scale motion), `rig60.tsx` (God, CAST, POSES, Ammit, wristTo/holdAt/reach), `cast60.tsx` (CAST2, ANI,
   walkPose, leadPair, judgePose, Fig, Shabti …), `props60.tsx`, `props60b.tsx`, `geo60.ts`, `kit60.tsx` (how each kit still is called).

## Contract
- Your file `src/qq60/act60<x>.tsx` exports `ACT60<X>: Record<number, ShotDef>` keyed by shot number. Put big pieces in your own helper
  files `src/qq60/act60<x>_*.tsx`.
- `ShotDef = {C, tin?: 'cut' | 'dissolve' | 'own', ov?: number}`; `C` gets `{t, dur, n}`: t = seconds since the shot's start.
  t < 0 while the shot transitions in (dissolve/own), t > dur while the NEXT shot transitions in over it: keep drawing sensibly there.
- **Do not pass `sub` or `stamp` to Stage60**: the master draws the bands, the subtitle line, the stamp (shots 5, 51, 53) and the seal once.
  Name labels: pass `tags` to Stage60 (world coords; Stage60 converts them through the camera and hides any right of the safe edge).
- **Do not edit shared files** (frame60, geo60, rig60, cast60, props60, props60b, sets60, scene43, scene60, wall60, EP60, story60, kit60,
  root60, the other builders' act files). The sets take only `{t, sub, stamp}` and have a fixed camera: for your own framing/action, copy
  the set into your helper file and change the copy (camera keys, figure poses, timings). If a shared-file bug blocks you, report it.

## Every shot
- **Its own framing + a camera move + one clear action beat** that matches its line (the script's picture column). Two shots on the same
  set must not look like the same still: change the framing (wide / mid / close), the angle of the move, the light.
- Camera ≤ ~25 px per frame on screen; no whip pans (they strobe on phones). Use push/pull/drift, match moves, dissolves.
- **Alive**: flicker, dust, embers, glows, cloth/feather sway, breathing; something moves every frame. Colourful: the mood grade per
  script (papyrus / lapis / blood / reeds …), gold on lapis for the gods, saturated not muddy.
- **Sound events**: the SFX column says what the audience hears (a clang, four jar clunks, a "boing", the gong on the title…). Make each
  event a clear visible moment at an exact time and **list it** (see Sync table). Hits the script puts on the beat: keep them where the
  script puts them; the music specialist will place sounds at your times.
- Transitions: default `cut`. Use `dissolve` (ov 0.3–0.5) between moods/places and `own` for match moves the script asks for
  (shot 2 "match on the arc", etc.). Keep cuts on the shot boundaries from story60 (they are the music's grid).
- Logic (a checker will look): hands hold their props, feet on the ground, plausible scale (the scale in shot 3 is "three storeys"),
  observers look at what they observe, papyrus text fits the papyrus, name tags sit beside the right figure.
- Safety: no anatomy, no gore (the brain is a grey cartoon puff; the bite cuts on contact), no bordered maps, no real photos; museum
  objects redrawn in our style. Nothing important right of x = 1266 (Douyin buttons) or in the bands (y < 40, y > 932).
- Known kit weaknesses to fix in your copies where they appear: the mask face is small in the wide embalm shot; the scarab is a top view
  (fine as an object, but give it presence: gold, glow, a turn); the judges' faces are hidden at phone size (go closer); Ammit's shadow
  reads like a dinosaur (show her clearly: croc head, lion mane, hippo hindquarters, crouched); the recline pose is rough; the paper wear
  grows with zoom (lower `wear`/`stain` when cam.z > 1.3).

## Resources (shared machine: 2 CPU cores, 3 builders + the producer, ~3 GB disk)
- Render **stills only** (JPG), batched in one run (one bundle per run):
  `cd episodes/37-qiqing/remotion && TMPDIR=/dev/shm/<you> ENTRY=qq60/EP60 CID=EP60PIC JPG=1 REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell node scripts/frame.mjs stills /dev/shm/<you>/out 11.2 12.5 13.9`
  (film seconds). `SCALE=0.5` for quick looks. Draft quality: not available through frame.mjs input props, so keep the scene light.
- A motion check, if you really need one: ≤ 3 s, 0.5 scale, in /dev/shm, then delete it. Never render the whole act as video.
- Full-quality frame time ≤ ~1.5 s (one process). Avoid per-frame SVG filters beyond what Stage60 already does; reuse kit elements.
- Typecheck: `npx tsc --noEmit -p . 2>&1 | grep qq60`. Clean up /dev/shm/<you> when done.

## Deliver
1. Code committed and pushed: only your files (`git add src/qq60/act60<x>*.tsx episodes/60-xinzang/sync60_<x>.md`), then
   `git pull --no-rebase --no-edit` and `git push`. Never commit images, video or audio (the repo is public). End the commit message with:
   ```
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   Claude-Session: https://claude.ai/code/session_01C8LPkwnEu6qcFveZs3Kp2N
   ```
2. **Sync table** `episodes/60-xinzang/sync60_<x>.md`: per shot, its transition (tin/ov) and every sound event as film seconds
   (e.g. `6 · jar 1 lands 15.10 · jar 2 15.55 · …`).
3. A contact sheet `$S/eg60/<x>/sheet.jpg`: for each shot, frames at 20 %, 60 % and 95 % of its length (0.5 scale, labelled with the
   shot number). Look at it yourself before reporting.
4. Report (short): shots built, transitions, anything you could not do or that looks weak, the sheet path.
