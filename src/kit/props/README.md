# props/: the prop kit and the period props

Shared kit (`src/kit/props/`, KIT.md). Built for Hongmen (late Qin); Hongmen's `src/videos/hongmen/props/{kit,things,horse}.ts`
re-export these. The film-specific part stays in the film: Hongmen's `props/index.ts` is its registry (`PropName`,
`PROP_INFO`, `PROP_GRIP`, `PROP_DIMS`, `put()` with grips). A new film writes its own small registry and calls these
builders (Phase 2 of the kit: pull the generic put / grip machinery out of Hongmen's index.ts).

| file | what |
|---|---|
| `kit.ts` | the prop kit: palette `C` (the kit's default palette), `paint` / `bandTex` (canvas textures), `makeKit(M)` (materials from bt/pbr: lit by the place), `Part` (meshes merged per material + ONE ink hull, layer NOINK), geometry `turned`, `limb`, `ball`, `box`, `prism`, `ringSeg`, `roundLoop`, `sheet`, `hullGeo` |
| `things.ts` | every small prop: `sword`, `shield`, `pigLeg`, `legSlice`, `jade` (玦), `bi` (璧), `yudou` (玉斗), `shards`, `tray`, `cup` (卮), `earCup` (耳杯), `ladle`, `wineJar` (樽), `ding` (鼎), `dish`, `note` (bamboo slips), `torch` (flame, animated), `flag` (cloth ripples with t), `banner` (army banner, sways), `cap`; size tables `SWORD`, `SHIELD_D`, `PIG`, `JADE_D`, `BI`, `CUP`, `WINE`, `DING`, `TORCH`, `BANNER`, `CAP` |
| `horse.ts` | a toon horse in the figures' style: four coats (`Coat`), gaits (`horseGait`: stand / walk / gallop, a pure function of t), the rider's seat (`horseSeat`), `HORSE` sizes |
| `sizes.ts` | sizes the builders share with a film's layout (`TRAY`, `FLAG`); no imports, so a layout may import it |

Each builder fills a THREE.Group: `sword(K, g, gripColour)`; one that moves by itself returns a `Hook`
(`({ t, pose }) => void`) that the film calls from `put()` every frame.

## The rules (each one comes from a rejected picture)

- **A prop never goes through the ink pass.** Every prop mesh is on layer NOINK and carries its own outline: a black
  back-face hull pushed out along welded normals (`Part.add(mat, geo, ink)`), as the rig draws its figures. Thin rims
  through the screen-space ink sparkle when the camera moves; a hull is geometry and cannot pop.
- The hull makes every part at least 2 x ink wider: nothing is thinner than 1.2 cm.
- Concave insides (a cup's bowl) get no hull; the outside profile does.
- Small pattern is PAINT (canvas textures with mip maps), never geometry.
- Parts of one prop overlap by a centimetre (hidden) or stand clearly apart; no two faces nearer than 2 cm facing the
  same way.
- Colours: nothing darker than `#2b2630` (the ink stays the darkest thing), nothing brighter than `#f4f1ea`.
- Hands of the rig are balls 4.6 cm across: a grip goes through the ball's middle. Sizes are in metres.
- Run the clearance checker (`scripts/kit/qa/clearance`) and the shimmer test (`scripts/kit/qa/shimmer`) on a new prop
  in use before a render.

The full catalogue with sizes, origins, axes and grips of every Hongmen prop: `/home/user/hm_notes/w_props.md`.
