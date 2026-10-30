All four items are built and the film renders from start to finish. The one thing I couldn't deliver is the sword-size target for the display: the sword is still about 38–44 % of the frame width in the hall views, not the requested ≥ 45 % (about 60 % at the title). Getting there means moving the camera closer, and the camera lines aren't mine to edit.

I checked every requested time at full or half size against v2 stills rendered from the unchanged repo state. I also compared consecutive frames around each change: no new one-frame jumps, and the f285 title slam still lands. The full log is in `tasks/ep53-case/out/selfcheck.md`.

**1 · Display (展台) — done, except the sword size.**
- **What it is:** a new `display53k.tsx` lectern case, 760 × 520 mm, with a dark plinth whose top slopes 22° toward the viewer. The sword lies on two small clear rests, and the 11-ring pommel mirror sits small beside the hilt.
- **The glass:** a low 115 mm glass hood with thin bright edges and one reflection streak. It fades out if the camera comes within about 30 cm, so the camera never cuts through glass.
- **Same case at both ends:** it replaces the old box in the start hall (`Museum` in `take53.tsx`) and the end hall (`CaseW` in `scene53d.tsx`). The old glass pane the end camera used to pass through is gone, so `GlassPass` now only adds a soft streak when the camera is near the hood. The walls, labels, rope, visitors and the sword drawing are untouched.
- **Title:** etched on the hood's top glass just behind the blade, with the f285 slam unchanged. It is about 71 % of its v2 width (≈ 880 px instead of ≈ 1240 px), which is as wide as the hood allows from the current camera distance.
- **Sword size:** measured at 41 % at 9.6 s, 38 % at 11 s, 44 % at 13 s, 38 % at 15 s and 39–49 % at 96–100 s. I made the plinth narrow on purpose so the camera can come closer and the whole hood still fits in frame. A test composition, `DISPLAY53K` (`demo53k.tsx`), shows this: it moves the film's own cameras in to 60 % at the title and 48 % in the hall, and the hood stays in frame at 9.6, 11, 13 s and in the end shots. At 15–16 s the plinth corner touches the bottom edge unless the framing is raised.
- **For whoever owns the camera:** the pommel distance needs to be about 0.67× the current one during the title (≈ 1010 mm instead of 1505) and about 0.85–0.9× in the hall views. At the end (95.8–99.8 s) it needs about 0.82×. With that, the title on the glass also returns to roughly its v2 size.
- **Not done:** the sword lies level on the rests rather than tilting with the plinth, because the sword drawing can't be rolled and belongs to the other engineer. If they add a roll, the angle to use is 22° (`DTILT` in `display53k.tsx`).

**2 · Cleaver (菜刀) — done.** The new drawing is in `cleaver53k.tsx`:
- **Shape:** a broad rectangular Chinese cleaver, 20.5 × 9.6 cm, with a slightly curved edge, flat spine and small hanging hole. It has a steel neck, a metal ferrule, and a short round wooden handle with two rivets.
- **Surface:** brushed steel with a polished edge band, small rust spots that bloom as before, and water beads. It is cooler and darker than v2, so the bronze stays the brightest thing.
- **Placement:** it keeps the same footprint and edge line, so the opening glide still lands on the sword. It is used at frame 0 and at the end, and in the key frames (`kfA53.tsx`).
- **Bug fixed:** the first version drew a huge grey shape at 0.5–1 s as the camera passed over the handle; I fixed that.

**3 · Tomb occupant — done.** In `scene53c.tsx`:
- **The drawing:** the dashed ovals are replaced by a simplified skeleton lying face-up, in pale bone-cream line art at low contrast. It has skull and jaw outlines only, spine, curved ribs, pelvis, and the long bones of arms and legs. Ochre soil stains sit under it and soft dark decayed cloth lies over it.
- **Sword position:** the sword stays on the occupant's left (facts A9), and the 「墓主人」 caption is kept.
- **Also fixed:** in v2 the occupant disappeared from about 40 s, once the camera dropped below the coffin rim. It now also shows under the hands at 41–44 s, dimming and going softly out of focus while the sword is lifted.

**4 · Element tiles — done.** `ElementTile53` is in `elements53k.tsx`:
- **Contents:** a rounded tile with a thin gold rule, atomic number, a 112 px symbol at the default 260 px size, and the Chinese and English names.
- **Props:** position, size, and three states: normal, highlighted, and a "question" state for 铬. The question state has a dashed border and a 「?」 badge and is never struck through.
- **Test:** the test composition `ELEMENTS53` (`elemtest53k.tsx`) shows all four tiles at 260 px and 170 px, and I checked it at full size. At 170 px the English name is only about 16 px, so use 210 px or more if it must read on a phone.

**Files:**
- **New:** `display53k.tsx`, `demo53k.tsx`, `cleaver53k.tsx`, `elements53k.tsx`, `elemtest53k.tsx`
- **Edited:** `take53.tsx` (only the case lines, the case glass and the title position; camera and hook untouched), `scene53d.tsx`, `end53d.tsx`, `kfA53.tsx`, `scene53c.tsx`
- `hall53d.tsx` needed no change.

No exports were removed or renamed, and all renders stayed under /tmp.
