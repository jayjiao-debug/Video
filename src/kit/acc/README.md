# acc/: the period wardrobe (late Qin / early Han) for the rig's figures

Shared kit (`src/kit/acc/`, KIT.md). Accessories for the rig3d figures of `src/videos/group/kit` (the rig is another
team's: not moved, not edited; see its RIG3D.md, "角色道具"). Each function returns an `Acc`; a figure takes them at
creation: `rc.add(look, { acc: [robe({ col: "#c8322c" }), beard({ kind: "short" })] })`. Hongmen's
`src/videos/hongmen/acc/*.ts` re-export these; `acc/liu_dage.ts` (one character's look) stays in Hongmen.
Base Look for all of them: top "tee", bottom "chinos": the painted garments cover the whole body.

| file | piece | options |
|---|---|---|
| `garb.ts` | `robe` (深衣: wrap robe, crossed collar, sash, a skirt that sits on seats) | `col`, `band`, `sash` and the robe options in `RobeO` |
| | `armour` (the body armour under the war gear) | `col`, `trim` (`ArmourO`) |
| | `cape` | `col`, `lining`, `clasp`, `len`, `trim` |
| | `swordBelt`, `hilt`, `hiltWorld(rig)` | `col`, `chape`, `side`; `grip`, `metal` |
| | `pendant` (jade on a cord), `scroll` (bamboo roll at the belt) | `col`, `cord`, `side`, `az`, `len`, `lean` |
| | `beard`, `whiskers` (older; facehair.ts replaces `beard`) | `col`, `kind`, `len`, `wide` |
| | `setSeat(rig, seat, facing)`, `onSeat(acc, seat)`, `setGround(rig, y)` | tell the skirt about a seat / the ground (else it falls through it) |
| | `trackFace(rc)` | the face-turn tracking the beards and caps need |
| `armour.ts` | `pauldrons` (披膊: three lames per shoulder, turn with the upper arm) | `col`, `trim`, `size`, `lean`, `lead`, `plates`, `lace` |
| | `warBelt`, `lamellar` (札甲), `armGuards`, `warBoots`, `cloak` | `col`, `trim`, `lace`, `boss`, `beast`, `under`, `bracer`, `thick`, `fist`, `lining`, `tie`, `len`, `wide`, `flare` |
| `headwear.ts` | `topknot` (髻 with band and pin; or headband 抹额, cloth 巾) | `TopknotO`: `band`, `pin`, ... |
| | `scholarCap`, `pheasantCap` (鹖冠), `flatCap`, `officerCap` (+ `officerCapGeo` for a cap lying on the ground), `helmet`, `warHelmet`, `mane`, `warCrown` | `col`, `band`, `rim`, `pin`, `strings`, `plume`, `tassel`, `guard`, `tall`, `wide`, `gold`, `size` |
| `facehair.ts` | `beard` (full / short / fork / stubble / goatee / long; the hair lies over the beard) | `col`, `kind`, `len`, `wide`, `lip`, `wild` |
| | `hairOverBeard(rig)` (call once per figure after `rc.add`), `swordBrows` (a warlord's heavy brows) | `col`, `weight`, `down`, `rise`, `len` |
| `held.ts` | `halberd` (戟, upright in one hand; part of the figure) | `hand`, `len`, `col`, `lift`, `head`, `tassel`, `layer` |

Each file's header has the full story (slots, what turns with what, what was rejected). Faces and heads take the soft
white rim light of `src/kit/fx/rim.ts` (facehair.ts uses its head-shader hook).
Check a new costume with the clearance checker: skirts on seats, capes against arms and swords in belts are where
figures clip (`scripts/kit/qa/clearance`, `--seed` shows what it catches).
