I fixed the face rigs of all nine non-human heads and added the `FACECHECK61` check composition. The commit failed because this runner has no git identity set, so the changes are staged but not committed; I didn't make up an author.

**What was wrong.** Each animal head was one solid shape with parts stuck on top. When a jaw opened, a thin sliver of jaw swung away from the muzzle. Teeth and eyes were drawn over the head outline, and the background showed through the mouth. Cat and Set ears turned as a rigid block, so the ear root popped out of the head and the inner-ear colour slid off. Ammit's mouth didn't fill to the snout tips, and some teeth hung outside it.

**What changed:**
- **New layered heads** in `qq61/heads61.tsx`, one structure shared by lioness, cat, Set animal, jackal, ibis and falcon. Back to front:
  - far ear, then throat skin that connects to the lower jaw;
  - the mouth interior, recomputed every frame so it fills any opening angle, with the tongue and each jaw's own teeth only visible inside it;
  - the lower jaw as a separate piece turning on an anatomical hinge (behind the mouth corner for the mammals, under the eye for the birds);
  - the skull, whose cheek or ruff hides the hinge;
  - everything on the face, kept inside the head outline;
  - ears that bend from the root instead of turning as a block, so the root stays planted.
  - Eyes are Egyptian almonds with a kohl line and no big white, and the lids close along the eye shape.
- **Per head:**
  - **Lioness:** wide flat nose, cheek ruff, round ears. A roar opens 50° with both sets of fangs and the tongue, wrinkles the nose bridge, lowers the brow and tips the head back. Her sun disc now sits behind the head with the ears in front.
  - **Cat:** small triangle nose, whiskers on the muzzle pads, slit pupils. She can now open her jaw too.
  - **Falcon (Horus, Ra):** hooked beak with a dark cere and a single clean stripe from the eye down the cheek; the lower beak meets the upper at the corner. Ra's disc also moved behind the head.
  - **Jackal, ibis, Set animal:** rebuilt the same way, opening 44°, 40° and 42°. Set's sneer is now a snout wrinkle, a lifted lip and a slightly open mouth.
  - **Ammit:** a copy of the ep60 version in `qq61/ammit61.tsx` with the mouth and teeth fixed and new eyelid, brow and gaze states. ep60 still uses the original.
- **`rig60.tsx`:** only gained one optional setting, `headArt`, that swaps in a new head. Without it, ep60 draws exactly as before.
- **ep61 film shots change:** Anubis, Thoth, Horus and Ra now use the new heads in ep61, so every animal-head shot looks different. Shots 4 (Tefnut) and 19 (Sekhmet) were switched from the old `open={1}` to `roar={1}` so they get the full roar.
- **Lioness height:** with the disc raised onto the top of the head, Tefnut and Sekhmet now measure about 22.6 squares, up from 21.7. The Ra sheet I re-rendered still reads 23.0.

**Checks:**
- **ep60 unchanged:** EP60PIC frames 1500, 2500 and 4300 are pixel-identical before and after. The ep60 texture files aren't in the repo, so I rendered both versions with the same placeholder images and deleted them afterwards.
- **Faces reviewed:** I went through several rounds of all nine `FACECHECK61` frames and fixed what showed up; the last round was clean. I also looked at the animal sheets in `SHEETS61`, two moments per animal character in `RIGTEST61` (signature pose and expressions) and the film board shots with these heads.
- **Not done:** I didn't render the whole `RIGTEST61` as a video.
- **Ibis beak:** it opens 40° because the brief asked for 40–60°, but on such a long beak that looks exaggerated. If it's too much, lower its `maxA` in `heads61.tsx`.
- **Type check:** clean for the ep60/ep61 code; other folders in the repo already had errors.

The designbook has a new face-rig section (§3.1: layers, hinges, angles, species features, states), a rewritten expression table and change notes. The full write-up in Chinese, with the render commands, is in `tasks/ep61-facerig/result.md`.

**Render commands.** Run them from `episodes/37-qiqing/remotion` after `npm ci`; the helper script is `tasks/ep61-facerig/out/rf.mjs`, and files are named by frame number.
```
node ../../../tasks/ep61-facerig/out/rf.mjs qq61/sheets61 FACECHECK61 /tmp/fc fc 0 1 2 3 4 5 6 7 8
node ../../../tasks/ep61-facerig/out/rf.mjs qq60/EP60 EP60PIC /tmp/ep60 ep 1500 2500 4300
```

Files (code and markdown only, no images):
- New in `episodes/37-qiqing/remotion/src/qq61/`: `heads61.tsx`, `ammit61.tsx`, `facecheck61.tsx`
- Changed in `qq61/`: `cast61.tsx`, `sheetkit61.tsx`, `sheets61.tsx`, `chars61.tsx`, `shots61.tsx`
- Also changed: `src/qq60/rig60.tsx`, `episodes/61-zhongshen/designbook.md`
- Task files: `tasks/ep61-facerig/out/rf.mjs`, `tasks/ep61-facerig/result.md`
