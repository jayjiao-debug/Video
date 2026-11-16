# sets/: the outdoor kit (and which Hongmen sets other films can borrow)

`okit.ts` (shared kit; Hongmen's `src/videos/hongmen/sets/okit.ts` re-exports it): what every outdoor place is built
from. Palette `PAL` (the kit's default palette), colour helpers (`hex`, `css`, `mix`, `toHex`), canvas painting
(`paint`, `blotch`, `poly`, `shape`, `soft`, `mottle`), painted textures (`clothTex`, `logsTex`, `planksTex`,
`bannerTex`), merged static geometry (`Batch`, `boxG`, `boxR`, `limb`, `facesG`, `hipRoofG`, `extrudeXY`, `faceBox`),
the sky (`skyDome`, `skyAt`), far painted cards (`farCard`), the ground (`groundG`, `groundTex`), lights (`lightRig`),
animated cloth and fire (`makeBanner`, `makeFlame`, `glowCard`, `fireBasketG`) and `flatOf(M)` materials.
It imports `bt/pbr`, `vasa/ink` and `arthur/sets/yard_paint` (read only, as the house rule allows).

Rules learned on Hongmen's outdoor places (hm_notes/w_outdoor.md): one merged Batch per material (draw calls), far
things are painted cards not geometry, nothing on the ground thinner than the ink can hold still, light boxes fixed per
place (a moving shadow box shimmers: see `src/kit/fx/README.md`).

## Sets that stay in Hongmen (borrow them by import)

`src/videos/hongmen/sets/`: `tent.ts` (the command tent: banquet seats, tables, lamps), `outdoor.ts` (the camps, the
gate, the hill, the night roads), `privy.ts` (the privy), `night.ts`, `card.ts` (the sand-table board of lines 3-4) and
`index.ts`. They read Hongmen's layout, story and lang, so they are not in the kit; another film imports them the
way Hongmen imports Arthur's `sets/yard`. Notes: `/home/user/hm_notes/w_tent.md`, `w_outdoor.md`.
