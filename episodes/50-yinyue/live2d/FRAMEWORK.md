# 喵喵乐队 framework (catband) — design, v0.1 (2026-10-26)

A reusable system for making music videos with a cast of 2D kittens (Live2D-style, code-driven). Each episode is
data: a score, a cast with personalities and outfits, a stage, and a timeline. The engine turns that data into frames
and sound. Everything is deterministic: the same data always gives the same video, so any fix is one re-render.

## Layers

### 1. Characters (`cast/<name>/`)
- **Base art, one template for everyone.** Sitting, front view, a mochi body with **no front legs**, two small feet,
  tail on the right, white background, flat cel shading with dark-brown outlines. Same prompt skeleton and seed for
  every cat; only the coat, eyes and markings change. This keeps every cat rig-compatible.
- **Arms are never in the art.** The rig always draws them (style D: thick at the shoulder, tapering to a round paw,
  no elbow). Any small arm nubs in the art are trimmed at cut time. Result: four limbs (two arms, two feet), never six.
- **Auto cut** (`cutcat.py`): head / body / tail layers, a plain-fur neck band, and landmarks (neck line, head
  ellipse, eyes, nose, mouth, cheeks, shoulders). Output `character.json`. A debug sheet shows the cut for checking.
- **Personality** (`personality.json`), which drives the motion, not just the look:
  | field | what it changes |
  |---|---|
  | `energy` 0–1 | size of nods, bounces, squash |
  | `groove` nod / sway / bounce / headbang | the main body motion on the beat |
  | `feel` −30…+30 ms | plays slightly ahead (eager) or behind (laid-back) the beat |
  | `blink`, `gaze` | blink rate; glances at bandmates or the camera |
  | `expressions` | default face and what it does on accents (wink, grin, eyes closed, tongue out) |
  | `habits` | idle quirks between phrases (ear flick, tail swish, stick twirl, adjusting glasses) |
  | `signature` | one move saved for big moments (drum fill flail, diva head toss, cool head tilt) |

### 2. Rig runtime (`rig/`)
- Meshes: head (fine grid), body, tail; springs (head lags body, ears, tail, cheeks).
- Face controls, all in the mesh or drawn on top, so they work on any fur colour:
  eyes open → closed (eye region squashed), happy `^ ^`, wink; mouth closed / `o` / `aah` / grin;
  **cheek puff** (cheek regions inflated, for wind instruments); blush pulse.
- Arms: two-point IK target per paw (shoulder fixed on the body, paw goes where the instrument needs it).
- Rules: draw order fixed (tail → body → clothes → head → hats → arms → instrument → paws → effects); paws never
  enter the face (pushed to the edge); the shoulder join is always hidden.

### 3. Wardrobe (`wardrobe/`)
- **Head items** (hats, glasses, headphones, crowns) are drawn in head space, so they follow every head move.
- **Neck items** (bow ties, scarves, chains, collars) are anchored to the neck line.
- **Body items** (suits, jackets, hoodies, dresses) are vector shapes defined in body space and passed through the same
  deformation as the fur, so they bend and squash with the body. A suit = jacket panels + lapels + shirt V + buttons.
- **Sleeves**: when a body item has sleeves, the arm is drawn in the sleeve colour with a cuff before the paw.
- Genre sets bundle items: rock (leather jacket, sunglasses), jazz (suit, bow tie, fedora), hip-hop (cap, chain,
  hoodie), classical (tailcoat), 国风 (opera headdress, robe).

### 4. Instruments (`instruments/<name>.js`)
Each instrument is a plugin with three parts: how it looks (back and front layers), where the paws go, and what the
face and body do. Families:
- **Strike**: drums, keys, xylophone, 板鼓 — wind-up, contact on the note, rebound.
- **Pluck / strum**: bass, guitar, ukulele, 琵琶 — one paw frets (slides to the note), the other plucks or strums.
- **Blow**: sax, clarinet, trumpet, flute, 笛子 — the instrument is attached at the mouth landmark, so it moves with
  the head; **cheeks puff** with each note's breath; paws sit on the keys and press for each note; eyes squint;
  the body leans back on long notes and dips at phrase ends. Sax hangs down in front of the chest; flute goes
  sideways from the mouth; trumpet points forward and up on loud notes.
- **Bow**: violin, cello, 二胡 — bow arm travels with note length, the other paw fingers.
- **Voice**: mic, mouth shapes on each sung note, gestures follow pitch.
- **DJ / pads**: scratching, pad taps.

### 5. Music (`music/`)
- One score format (JSON events: instrument, time, length, note, velocity), written in code or imported from MIDI.
- Audio rendered from **real recorded samples** per instrument (public-domain / CC0 libraries); synth only as a
  fallback. Same events drive the animation, so every hit lands on its frame.

### 6. Stage (`stages/`)
Genre sets drawn in code (backdrop, floor, props, lights that react to each instrument), plus camera moves
(push in on a soloist, wide shot for the full band).

### 7. Show timeline (`shows/<episode>.json`)
Scenes in order: who is on stage, what they play, stage and outfits, camera, captions and teaching overlays
(beat grid, BPM, the shape of a rhythm). An episode = a timeline + a score.

### 8. Tools
- Live preview page with a time slider and a cast/outfit switcher, for tuning by eye.
- Batch renderer (Canvas2D, ~0.2 s per frame for four cats), audio mux, loudness.
- Checks: paw-in-face detector, part-separation detector (gaps at the neck/ears), contact sheets.

## Roadmap
1. **Cast v1**: four armless base cats + personality profiles + character sheets.
2. **Rig v2**: expressions (happy, wink, grin, cheek puff), arm-nub trimming, personality-driven motion.
3. **Wardrobe v1**: head / neck / body items; a suit and a hat set on all four cats.
4. **Instruments v1**: drums, keys, bass (done in rough), + sax (cheek puff), flute, guitar.
5. **Music v1**: real-sample instruments, MIDI import.
6. **Show v1**: timeline + teaching overlays → episode 1.
