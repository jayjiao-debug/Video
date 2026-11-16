# 《石中剑》 film bible (ArthurFilm)

A ~60 s vertical short (1080 x 1920, 30 fps) for Douyin / YouTube Shorts. Narrated in fast Mandarin (5.5 字/s, no
pauses), one story, non-stop action, in the style of the reference channel: simple hand-drawn 3D figures (kit rig3d),
plain sets with ink outlines, expressive faces, everything literal.

## The story (Malory, Le Morte d'Arthur, Book I ch. 5-7; all beats are checked against the text)

1. A great square stone stands in a churchyard in London, an anvil on it, a sword stuck through the anvil. Gold
   letters: whoever pulls the sword out is the rightful king of England. Every lord tries. Nobody can move it.
   Guards (knights) are posted at the stone.
2. New Year's Day: a tournament outside. Young Kay, a new knight, finds he left his sword at the lodging. He sends
   his younger foster brother Arthur (a boy, his squire) to fetch it.
3. Arthur runs to the lodging: locked, everyone is at the tournament. He remembers the sword in the churchyard,
   runs there. The guards have gone to watch the jousting too. He grabs the hilt and pulls it out lightly, with no
   idea what it means, and runs it to Kay.
4. Kay knows the sword at once, takes it to their father Ector and claims: "so I must be king". Ector does not
   believe him and makes him swear how he got it. Kay admits: Arthur brought it.
5. Back at the stone. Ector: put it back and pull it again. Ector tries: stuck. Kay pulls with all his might: stuck.
   Arthur: out it comes. Ector and Kay bow to him (the rig cannot kneel: they bow their heads).
6. The lords are furious: ruled by a boy of no high blood? They make him do it again, and again: a few days later,
   in February, in spring, in early summer. Every time only Arthur can pull it. SIX pulls in all.
7. At last the common people shout: we will have Arthur as our king, and whoever is against it, we kill him. The
   lords give in. Arthur is crowned.

No religious imagery anywhere (no crosses, no clergy, no bible): the church is just an old stone building.
No horses. No blood. No modern objects.

## The world: one strip along x, the camera always on the +z side looking toward -z

Metres, y up, ground y = 0. Three zones side by side, so the camera can travel or whip-pan between them:

```
 z=-9  ........ tents (z -6) .........|......... church facade (z = -9) .........|...... house facade (z = -3.2) .....
        FIELD  x -34 .. -11           |  YARD  x -9.5 .. 9.5, the stone at (0,0,0) |  HOUSE  x 11 .. 23, door at x = 17
 z=+3.5 ======================= the path (z 2.5 .. 4.5) runs through all three zones ==============================
        cameras: z = +2 .. +10, y 1.1 .. 1.6, looking toward -z (yaw within about +-50 degrees of -z)
```

- YARD: the stone at the origin. Behind it (z = -9) the church's west front: a tall plain stone wall, x -8 .. 8, at
  least 13 m high (it must fill the frame behind the stone from a camera at (0, 1.3, 5), fov 50), an arched portal
  with closed wooden doors at x = 0 (3 m wide, 4.2 m high), a round window above it, two buttresses, a string
  course. No cross, no statues. Low stone walls (1.3 m) at x = -9.5 and x = 9.5 from z = -9 to z = 1.5, ending in
  gate piers; south of z = 1.5 the yard is open to the path. Two or three bare trees and a few old grave-less stone
  slabs / a stone bench near the side walls for depth (nothing within 3.2 m of the stone). Yard ground: grass / snow
  with a paved circle (radius 2.6 m) round the stone.
- The STONE (props.ts, not part of the set): block 1.5 (x) x 0.36 (y) x 1.0 (z), top flat (figures stand on it).
  Anvil centred on it. The sword stands in the anvil, blade flat toward the camera (the guard spans x).
- FIELD (west): the edge of a tournament ground. Striped tents and pavilions along z = -6 (x -30 .. -13), pennants
  on poles, a wooden tilt fence along z = -2.5 (x -32 .. -12), a rack of lances and shields, straw bales, bunting.
  Beyond the tents a hint of more tents / a wooded skyline. Kay's mark: (-18, 0, 2.6).
- HOUSE (east): a timber-framed two-storey lodging, facade at z = -3.2, x 12.5 .. 21.5, about 7 m high with a
  steep roof; the door at x = 17 (1.1 x 2.0 m, heavy oak, iron bands, a ring handle and a big iron padlock so
  "locked" reads at once), shuttered windows (closed), a lantern, a barrel and a bench by the wall. Arthur's mark in
  front of the door: (17, 0, -2.3). Neighbouring facades / a wall close the gaps at x 11 .. 12.5 and beyond 21.5.
- The path (z 2.5 .. 4.5): packed earth / cobbles, runs through all three zones. Between the zones the low yard wall
  piers and a few trees; nothing blocks a camera that travels along z = +6 .. +9 from x = -20 to x = +18.
- Sky: a NOINK dome (gradient), a few clouds; a far skyline (roofs / trees silhouettes) behind the walls so no
  horizon gap shows. Winter light: the sun low, from the camera's upper left front (toward the sun about
  (-0.5, 0.55, 0.67)), so faces toward the camera are lit and shadows fall away to the right back.
- Seasons, `setSeason(k)`: 0 = deep winter (snow on the ground, on wall tops, on the roofs, on the stone's rim;
  bare trees; the look of beats 1-5 and the first re-test), 1 = late winter (thawing: patches of snow, wet dark
  earth, grey sky), 2 = spring (fresh green grass, blossom on the trees, clear sky), 3 = early summer (deep green,
  full leaves, warm light). `animate(t)`: pennants and bunting wave, falling snow in season 0 (a pure function of t).

## Cast (kit rig3d figures: 1.45 m tall, head a third of the height, arms only 0.40 m long, shoulders 0.98 m up)

| Role | Look | Reads as |
|---|---|---|
| ARTHUR | a boy: plain belted tunic in bright blue, a short red neck scarf, messy brown hair, no hat. Slightly smaller than the others if the rig allows it | the nobody / the hero |
| KAY | his older foster brother, a brand-new knight: open-faced steel helmet (or mail coif), a surcoat in red with a yellow chevron over mail, an EMPTY scabbard at the belt; smug | the cheat |
| ECTOR | their father: grey hair, grey beard and moustache, a dark green cloak with a fur collar | the honest father |
| LORDS x8 | big wide bodies (Look.width 1.25-1.4), rich capes (purple, crimson, gold, black), gold coronets or plumed hats, moustaches / beards, each one different | power, anger |
| GUARDS x4 | identical knights: kettle helmets, blue-grey surcoats, a spear upright in one hand | the guard at the stone |
| COMMONS x16 | townsfolk: hoods, linen caps, straw hats, aprons, earthy colours (ochre, brown, dull green, rust), thin | the crowd that decides |
| (finale) ARTHUR crowned | the same Arthur + a king's crown (bigger than the lords' coronets) + a red cape | the king |

Rules of the rig that drive every design (kit/RIG3D.md has the detail):
- nothing 3D in front of the face (helmets are open-faced, beards and moustaches are DRAWN on the face);
- a figure's own hands are never drawn in front of its own head; arms are short (a hand reaches about 0.40 m from
  the shoulder);
- poses: idle, walk (rigWalk), wave, point, haul, hold, cheer; hands can be pinned to world points; no sit / kneel /
  lie yet;
- faces turn at most 12 degrees from the camera, bodies at most 45; do not leave a figure's facing between 115 and
  170 degrees from the camera (use turn = 1 for a true back view);
- everything deterministic: no Math.random / Date; seeded only.

## The sword and the pull (props.ts)

- Sword: total 0.86 m. Blade 0.62 x 0.05 (steel, a fuller line, a bright edge), cross-guard 0.24 wide (gold),
  grip 0.12 (dark leather with gold wire), round pommel (gold). It must read as THE sword in a 100 px tall
  silhouette: bright blade, gold hilt.
- Stuck: the blade goes 0.26 m down through the anvil (0.20 high) into the stone; anvil top at y 0.56, guard at
  y 0.92, grip centre y 0.98, pommel top about y 1.07.
- A puller stands ON the stone (feet y 0.36), beside the anvil (side-on, at x = +-0.26 facing the sword) or behind
  it facing the camera (z = -0.24), hands on the grip. Lords fail with the haul pose (leaning back, straining), the
  sword does not move. Arthur pulls it up and out with one hand.
- Out of the stone the sword is a free prop: the segment places it at a hand every frame.

## Files and owners

| File | Owner |
|---|---|
| `src/videos/arthur/BIBLE.md`, `story.ts`, `world.ts`, `Film.tsx`, `captions.ts`, `preview/common.ts`, `preview/film.ts` | the engine (read-only for builders) |
| `src/videos/arthur/sets/yard.ts` (+ `sets/yard_*.ts`, `preview/yard_*.ts`) | the set builder |
| `src/videos/arthur/props.ts` (+ `preview/props_*.ts`) | the props builder |
| `src/videos/arthur/acc/*.ts`, `src/videos/arthur/people.ts` (+ `preview/people_*.ts`) | the costume builder |
| `src/videos/arthur/shots/seg*.ts` | the segment builders |
| everything under `src/videos/group/`, `src/videos/vasa/`, `src/videos/bt/` | READ-ONLY for everyone: import from it, never edit it (copy a helper into your own file if you need it changed) |

## Looking at your work

Stills only (never clips), through `src/videos/arthur/preview/common.ts` (read its header):

```
cd /home/user/film
node scripts/rig3d/render.mjs src/videos/arthur/preview/<your_entry>.ts /tmp/<you>/a.png --size 540x960 --opts '{"cam":{"pos":[0,1.3,5],"look":[0,0.9,0],"fov":50}}'
```

About 5-10 s a still on this machine (software GL). Look at every still you make (Read the PNG). Check from the
film's real camera positions (eye level, on the +z side), in portrait, at 540 x 960 and one at 1080 x 1920.
Type check: `npx tsc --noEmit -p scripts/rig3d/tsconfig.rig.json` covers only the files that config lists; for your
own files run `npx tsc --noEmit --skipLibCheck --jsx react-jsx --target es2020 --moduleResolution bundler --module esnext --strict <your files>` and ignore
errors that come from files outside `src/videos/arthur/` (n8ao's TS7016 is known).

## House rules for the picture

- Nothing important in the caption band (y 62-78 % of the frame) or below y 84 %.
- No flicker: no per-frame noise, no z-fighting (two surfaces within a few mm of each other), no hairline geometry
  that breaks into dots (thin things are thick enough to hold 2 px at 1080 x 1920 from 8 m, or painted on a texture).
- No clipping (穿模): nothing passes through anything; figures stand ON surfaces.
- Text in the picture is Chinese, in the loaded font only (`FONT_STACK` from group/kit/overlay), never Latin.
- Colours: clear and saturated enough to read on a phone in daylight; snow is a light blue-white, never grey mud.
- Performance: the whole world builds in a few seconds on SwiftShader; keep the set under about 80k triangles and
  textures at 2048 px or less; merge static meshes per material.
