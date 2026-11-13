# 《采访秦始皇的一天》 (QinFilm): bible, storyboard and build plan

A first-person vlog. **The camera IS the interviewer** (小记者, a young woman, never seen, only heard). She follows
秦始皇 through one "day" stitched from real 史记 events. Funny, then dead serious, then funny, ending sad. Chinese first
(Douyin), English later. 1080 x 1920, 30 fps, about 2:40. Owner: Jay. Script source of truth:
`/mnt/project-files/next-video/qinshihuang/script_v4_lines.md` (lines) and `script_v2.md` (camera/picture notes);
the bible of characters/props/camera: `/mnt/project-files/next-video/qinshihuang/bible_v1.md`. Read all three.

The engine is a COPY of the Wanbi film (`src/videos/wanbi/`, newest, imports the shared kit `src/kit/`). Read
`KIT.md`, `src/videos/wanbi/story.ts` (HOW TO BUILD A SEGMENT), `src/videos/wanbi/world.ts`, `src/videos/wanbi/BUILD_PLAN.md`
section 2 before writing code. Same rules: pure `pose(w, f)`, every frame from timing lookups, `L(zh, en)` strings.

## Hard rules (Jay's)
- Never edit `src/kit`, `src/videos/group/kit` (the rig), `vasa/ bt/ arthur/ hongmen/ wanbi/`, `scripts/kit`,
  `scripts/rig3d`, `scripts/arthur`, `scripts/hongmen`, `scripts/wanbi`. IMPORT from them; copy a file into `qin/`
  when it needs changes. Wanbi is pinned at commit 3e64199 (this branch's base), so importing its hall/people is stable.
- No media in the repo (public). Outputs only under `/home/user/qin_work/`. No keys anywhere.
- Never touch `render.json` / `blender.json` on this branch.
- Renders only through the queue (`scripts/kit/queue/`), 540 x 960, few frames, one at a time.
- After every change: `bash scripts/kit/tsc.sh --film qin` clean; before any render of a changed shot:
  `bash scripts/kit/qa/clearance/run.sh --film qin [--seg X]` clean (no 穿模).
- Picture rules: no clipping; no flashing black lines, black frames or colour blocks; figures not over-exposed under
  the set light; subtitles have NO background box; characters keep moving (never a frozen figure for long).
- Our figures never turn their face to profile (FACE_MAX 12°): "turning away" = body turn / back view (`turn: 1`),
  face slides, head tilt, gaze.

## 1. Places (`type Place`)
| place | what | source |
|---|---|---|
| `corridor` | covered palace walkway, red pillars every 2.4 m, lattice walls, hanging lanterns, identical bays, a T-junction; dawn light | NEW `sets/corridor.ts` (modular: one bay repeated) |
| `hall` | the Qin hall: throne dais, red pillars, gold screen, ding, carpet. Add a low desk with slip towers and a steelyard scale in front of the dais | IMPORT `wanbi/sets/hall.ts` (+ `wanbi/layout/hall.ts` marks); desk/scale are props |
| `terrace` | 梁山宫 terrace: stone parapet at waist height, two pillars, roof edge above; far below a road through fields where a line of tiny carriages travels (many on day 1, few on day 2) | NEW `sets/terrace.ts` with `src/kit/sets/okit.ts` |
| `table` | flashback tableaux on a sand table in a small dark room (like Hongmen's `card`): sea + boat + giant fish; 泰山 + tree in rain; 湘山 + storm + boat, the mountain goes bare and red | NEW `sets/table.ts` (borrow ideas/code from `hongmen/sets/card.ts`) |
| `night` | a path by a pond (兰池) at night: moon, reeds, a rock to hide behind, a few lanterns | NEW `sets/night.ts` with okit |
| `road` | summer road at 沙丘: heat, dry grass, a closed ornate carriage (辒凉车) with curtains, officials queueing, baskets of salted fish on the carriages | NEW `sets/road.ts` with okit |
| `museum` | today: pit of terracotta warriors in rows, dim museum light, a railing in the foreground | NEW `sets/museum.ts` |

## 2. Cast (`people.ts`; copy Wanbi's structure; import Wanbi's Persons where they fit)
- `EMPEROR` 秦始皇: Wanbi's `QIN_WANG` body (scale 1.08) re-dressed: black robe with thin red trim (not black on black),
  Wanbi's `mianCrown()` (acc/crown.ts), long sword in a scabbard at the hip, a beard. Mid-40s.
- `EMPEROR_BLUSH`: the same with a skin-only blush drawn on the face (an `Acc` with a `face` function in the
  "cheek" slot: two soft pink ellipses, see rig3d.ts lines 795-799 for how the rig's own blush is drawn). Swap
  EMPEROR <-> EMPEROR_BLUSH on a blink (Wanbi `swapTo`). Two strengths are enough (`_BLUSH1` 0.45, `_BLUSH2` 0.9).
- `EMPEROR_HOOD`: night disguise: plain dark hood (kit headwear) with the crown's bead strings poking out at the front.
- `XUFU` 徐福: 方士, smooth salesman, tall hat, sea chart. `BOSHI` 博士: old scholar, white beard, cap.
  `HUANGUAN` 宦官 (voice only from inside the carriage; one figure visible at the curtain is enough).
- `GUARD` x4 (armour + halberd, kit armour), `ATTENDANT` x5 (kneel), `OFFICIAL` x4 (queue with slips), `BANDIT` x3.
- `TERRACOTTA`: a clay-coloured armoured figure (all-clay palette, neutral face) for the museum rows. 大哥 hides once
  among them (the rig's DAGE look recoloured clay, `expr: "hush"`, `pose: {kind: "shh"}`): small, at the edge.
- Expressions: only what `RIG_EXPRS` in rig3d.ts has (check the list: neutral, smug, nervous, shock, stern, huff,
  grin, smile_closed, relief, hush, happy ...). Map: startled = shock; rage = huff/stern + head shake; tsundere pleased =
  smile_closed (it has its own blush) or stern + EMPEROR_BLUSH; cold menace = stern, no blush, eyes slit if available.
- Mouths move only while that character speaks (`speak(quote(who, n), f, id)`).

## 3. Props (`props/`; Wanbi's registry shape; kit `src/kit/props/things.ts` first)
long sword + scabbard (blade 1.3 m: the draw gag), slip bundle (instanced), steelyard scale (beam tilts on a
`tilt` param), low desk, brush, repeating crossbow, sea chart, giant cartoon fish, tiny boat, tree + official's hat
(五大夫), carriages (tiny, for the terrace road; and the big 辒凉车), baskets of salted fish (whole dried fish) with a few flies, halberds,
bandit knives, railing, lanterns. Each prop that is held is pinned to `r.handWorld(i)` after `w.update()`.

## 4. The camera: her eyes (`qin/cam.ts`, NEW, generic so later "a day with..." films reuse it)
- Eye height 1.55 m (she is short; he is 1.08 scale, so he looks down into the lens). Vlog-wide lens: fov about
  62-66° vertical on 9:16 (about 26 mm equivalent).
- `povCam(f, keys, o)`: the camera from keyframes (position, look-at, fov) with easing, PLUS a deterministic handheld
  layer: breathing sway (0.25 Hz, amplitude by `calm|excited|scared`), walking bob synced to her steps (2.2 steps/s),
  tremble (8-12 Hz, scared). All noise from `hash()`, never Math.random. Returns a CamPose.
- Moves (functions on top): `punchIn` (fov -20% in 4-6 frames, ease-out), `whip` (fast yaw with motion blur via
  the film's post if available, else a 3-frame smear overlay), `follow` (behind/beside a walking figure), `dip`
  (camera sinks 0.6 m and pitches down, strain shake), `duck` (drops to 1.0 m behind a foreground object), `aside`
  (swing to a near wall, hold, swing back), `creep` (slow steady push, sway almost 0), `lean` (he steps into the lens:
  his head fills 60% of the width), `handCover` (his palm covers the lens -> black, used as a cut), `lower` (droops to
  0.6 m, horizon tilts 8°).
- Rules: never inside geometry; his eyes in the upper third; keep faces out of the caption band (y 1190-1498);
  every shot one or two long takes; cuts hide in whips, black frames and the hand-over-lens.

## 5. HUD (`hud/`; copy Wanbi's base/caption code, draw no caption box)
- Vlog UI: red REC dot + `REC` (top-left, y 230), the 时辰 timestamp card (`卯时 05:00`, `辰时 08:00`, `巳时 10:00`,
  `午时 12:00`, `未时 14:00`, `戌时 20:00`, last day: `公元前210年 七月`), a battery icon top-right that drains
  through the day (100% -> 8%). The REC dot is gone on the museum shot.
- Fact cards: a clean rounded paper card in the upper-middle (y 300-560), small source line under it
  (「史记·秦始皇本纪」), slide-in/out 8 frames. Text from section 7, `L(zh, en)`.
- Title card after line A14: 「采访秦始皇的一天」 big, centred, 1.6 s.
- Subtitles: every spoken line, in the caption band, white with a dark outline, no box; the speaker's lines in
  slightly different colours (小记者 warm white, 秦始皇 pale gold, others white). Max 14 full-width chars a row.

## 6. Timing
`scripts/qin/gen_timing.py` (copy of `scripts/wanbi/gen_timing.py`, adapted: every line is a quote of its
speaker; segments = the scenes A-G) reads `/home/user/qin_work/voice/voice_timing.json` and writes
`src/videos/qin/voice.ts` + `captions.ts`. The timing json is written by `scripts/qin/voice/assemble.py` from the
voice farm's dialogue clips, with the action pauses of section 7 laid in. The film length = the voice track's frames.

## 7. Storyboard (scene = segment; "pre" = silent beat before the line, seconds, for the action)
### A · 卯时 · corridor (hook)
1. f0: POV creeping down the corridor (follow-forward, scared sway). Caption on frame 0 (A01). Fact card after A01:
   「史记：咸阳附近二百七十座宫殿，廊道相连。说出他在哪，死罪。」
2. A02: stop behind a pillar (duck/peek, pillar edge in the left foreground). 6 m ahead: EMPEROR, back to us
   (`turn: 1`), stretching.
3. pre 1.0 before A03: he glances over his shoulder, turns back away; beat; A03 "谁！": snap round to face the lens,
   `shock`, punch-in.
4. A04 (pre 0.3): the sword gag: hand to the hilt at his left hip, pulls: stuck (two tugs, body jerks, 0.5 s each),
   third pull swings it up over his shoulder and out; the tip ends 0.4 m from the lens (camera tremble).
5. A05-A06: tip close to the lens; she offers help; "住口" with a jab.
6. A07-A10: tremble; he steps closer; on A10 the blade lowers.
7. A11: slow push on his face. A12 (pre 0.5): swap to EMPEROR_BLUSH, he looks away (gaze aside, head tilt, body
   turns 30°), straightens the crown. A13: turns and walks off; camera scrambles to follow (fast bob). A14 + title card.
### B · 辰时 · hall desk
1. Follow him into the hall; he sits at the desk (pose `write`, seat with desk), slip towers around, scale beside.
2. B02: punch-in on the scale as he thumps a bundle on; the beam wobbles (damped).
   Fact card after B04: 「史记：每天批完一石竹简（约30公斤）才休息。」 with the source line 「据当时方士所说」.
3. B05-B06: DIP (she lifts a bundle): camera sinks and strains. B07 "呵" with `smug`.
4. B08: camera rises, breathing. B09 (pre 0.6): smile_closed / BLUSH1, eyes away.
5. Cutaway (pre 1.0 before C01, 1.2 s): he nods off over the slips, jerks awake, glares at the lens.
### C · 巳时 · hall, immortals
1. C01-C03: he LEANS into the lens for "找神仙" (whisper look: gaze to lens, head forward).
2. C04: whip pan to the door: XUFU slides in and kneels (chart in hand). C05-C06 two-shot. C07 "拿弩来": he stands.
3. Flashback on the `table` (pre 0.5, hold 2.2 s): a strip of COAST (beach, rocks, sea), the tiny emperor on the shore
   with a repeating crossbow, a giant fish breaching offshore, one bolt, pop. NOT a boat: 史记 says he waited along the
   coast (之罘) and shot it from there (fact-checked). Fact card:
   「史记：他亲自带着连弩沿海守候，在之罘射死了一条大鱼。」
4. C08: ASIDE: the camera swings to the hall wall, close; she whispers. C09: whip back: he is right there, close
   (lean). C10: flustered.
### D · 午时 · terrace (SERIOUS)
1. Follow him onto the terrace, wide; wind. Far below the long line of carriages. D01-D02 `stern`.
2. Card 「第二天」 (pre 0.8): same view, few carriages. D03 creep.
3. D04: he turns very slowly; music out; `stern`. Pan across ATTENDANTS kneeling (pre 0.4); one GUARD stares into the
   lens. Fact card (pre 0.6, hold 2.4 s): 「史记：没有人承认。那天在他身边的人，全部被处死。」
4. D05: he LEANS into the lens; 2 s stare. D06: tremble. Then black (0.6 s).
### E · 未时 · flashback trip
1. E01: back in the hall, bright, `smug`, he unrolls the sand table (cut to `table`).
2. 泰山: rain, he shelters under a tree; E02; the official's hat pops onto the tree. E03-E04.
3. 湘山: storm, the boat tilts, the camera tilts with it. E05-E06 (BOSHI). E07 `huff` + head shake.
4. The mountain goes bare and red (1.2 s). Fact card: 「史记：三千刑徒砍光整座山的树，只剩一片红土。」
5. E08: ASIDE to the wall.
### F · 戌时 · night
1. F01: he swaps crown for hood (EMPEROR_HOOD), bead strings showing. 4 GUARDS. F02-F03.
2. F04 she giggles; F05 "嘘！" he shoves the beads in (BLUSH1).
3. F06 (pre 0.5): BANDITS leap out; DUCK behind the rock, fast tremble; clash off-screen (1.5 s). Fact card:
   「史记：兰池遇盗。武士杀了强盗，之后关中封锁搜查二十天。」
4. F07-F09: he straightens his robe, glances at the lens, BLUSH1. HAND OVER LENS -> black.
### G · the last day + museum
1. Timestamp 「公元前210年 七月 沙丘」. Heat shimmer; battery 8%. CREEP to the closed carriage. G01.
2. G02-G03: OFFICIALS queue, pass bundles through the curtain; the thin voice answers.
2b. G04 now says 「丞相瞒住了消息，百官每天照样往车里递奏章」 (fact-checked: only 李斯, 胡亥, 赵高 and a few eunuchs knew;
   the officials did not). So the OFFICIALS hand in slips calmly, unaware; the eunuch's thin hand takes them.
3. G05 「他们就往车上装了咸鱼，盖住味道」: two attendants lift baskets of salted fish (dried whole fish, NOT abalone) onto
   the carriages (the big carriage's rear rack and the next carriage); flies. No separate cart rolling in.
   G06: LOWER (the camera droops, horizon tilts).
4. G07: cut to `museum`: the FIRST perfectly still frame (no sway), no REC dot. Rows of TERRACOTTA facing the lens.
5. G08 (pre 1.2): his voice off-screen. G09 (pre 0.6). Hold 1.5 s, fade to black.

## 8. Files (one owner per file)
`story.ts, voice.ts, captions.ts, beats.ts, lang.ts, world.ts, sets/index.ts, Film.tsx, kit.json, kit.world.ts,
preview/*` (WP1 skeleton) · `sets/{corridor,terrace,table,night,road,museum}.ts` (WP2 sets) · `people.ts, acc/*,
props/*` (WP3 cast & props) · `cam.ts` (WP3) · `hud/*` (WP4) · `shots/common.ts` (WP1 copy, then shared, additive
only) · `shots/segA..segG.ts` (WP5, one agent per segment) · `scripts/qin/*` (timing, voice, sound, cut, farm).
`src/Root.tsx` gets the `<Composition id="QinFilm">` lines (WP1).
