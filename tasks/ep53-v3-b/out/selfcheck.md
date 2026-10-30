# ep53 v3 TakeB3 (20.821 → 38.935): self-check

Started at 08:36 UTC and finished at about 09:07 UTC. All renders were made under /tmp only. Nothing was committed.

## Files (all in `episodes/37-qiqing/remotion/src/qq53/`)
- `take53b3.tsx`: the stub body is replaced. `TakeB3` draws `DigB3` before 32.1 s and `Chamber53B3` from 32.1 s.
- `cam53b3.ts` (new): one camera `camB3(t)` for the whole range. It also holds the chamber clock `tau(t)` (v3 film time → v2 TakeC chamber time), the sword pose `swordAt3`, the plan camera `planK3`/`planPos3`, the coffin constants `CYC`/`OUT3`/`INN3`/`SWP3`, and **`depthB3(t)` / `DEPTH_B3` for the overlay's depth tag**.
- `tomb53b3.tsx` (new): a copy of `tomb53.tsx` (v2 TakeB) running on the v3 camera. The dig's clocks are shorter, the crew stands 0.45 m nearer the rim, and the pole numerals are 44 px.
- `chamber53b3.tsx` (new): a copy of `scene53c.Chamber53` driven by `tau`, with the continuity fixes. It exports `Occupant53`, `Sheath53`, `Coffin53`, `Lid53`, `Digger53`, `Knife53`/`KNIFE3` and `RX/RY/WH` for the second chamber.
- `knife53x.tsx`: `BronzeKnife53` is rewritten. Its props are unchanged (`M`, `o`, `id`).

No file outside my own was edited. `tomb53`, `scene53c`, `parts53c`, `shaft53c` and `cam53c` are untouched. `npx tsc --noEmit` gives no new errors; the only 2 errors are the existing qq45/qq46 file-name casing errors.

## Items

| # | Item | State | What I checked |
|---|---|---|---|
| 1 | Start continues TakeA at 20.821 | done | The dive and morph are tomb53's, unchanged. Mean grey difference, frames 623→626: 14.6 / **12.3** (the switch) / 14.1. The fast ring zoom does this on both sides, so the switch frame is not an outlier. |
| 2 | Faster tempo (owner note on 0:25–0:36) | done | S4: the fall to the dig, reaching it by 24.2. D1: the camera falls and tilts the whole time (it never hovers) and enters the shaft mouth at 29.45. D2: descent at **2.2–2.46 m/s** from 29.3 to 31.7 (measured on the camera), braking into the roof by 33.83. Bands seen: 五花土 → 青灰泥 (≈31.0–31.8) → 白膏泥 (≈32) → 椁 roof. D3 (roof → top-down) takes 2.83 s; v2 took 2.83 s plus 7.4 s of descent. From the dive to the open coffin: 15.8 s, against 18.1 s in v2. |
| 3 | Hits ON their frames | done | Roof: first opened frame **f1015** (33.833). Lid ①: f1032 (34.400). Lid ②: f1066 (35.533). Top-down: f1100 (36.667). These come from `TAU_OFF = 2.2708` = one bar plus 0.2 frame. The roof is the only per-frame spike: 5.45 on 1014→1015, a planned hit. |
| 4 | End = v2 TakeC(43.463) | done | `tau` has slope 1 and lands on 43.463 at 38.935. Frames 1166→1170: 1.06 / 0.99 / **1.55** (the switch) / 1.14. The +0.5 on the switch frame is the draw's own glint on DA(17) (`hold`/`flash` from T_DRAW), a planned hit. |
| 5 | Motion continuity | done | Quarter-scale video, 20.5–39.3 s. No isolated spikes apart from the planned hits. Peaks are smooth ramps: 7.8 in the dig tilt (27.5 s), 6.6 in the lid lifts and 7.0 in the plan push (37.0). v2's own peaks were 7.8 and 7.5. The **≤ 3 rule is exceeded during camera moves**, at the same level as v2. The renderer switch at 32.1: 1.99 / 1.88 / 1.64. I fixed two jumps found along the way: the snow and lamp clocks, and the roof's dark ring. |
| 6 | Sword beside the body, on the occupant's LEFT | done | It rests at y = −0.30 m, the guard is level with the pelvis (x' 0.06), and it is about 3 cm clear of the forearm. **Side:** the occupant lies supine with the head at screen right, so their left is the **screen-bottom / near side**. The storyboard says the same ("head to the right, so the occupant's LEFT is the near side"). The continuity note says "screen top = left", which is wrong: v2 had the sword on the occupant's right. The skeleton is placed exactly as in scene53c (OY −0.07), so after 38.935 TakeC's blurred skeleton matches. |
| 7 | Tag 「剑在墓主人左侧」 | done | Shared `Tag`, 56 px, cream, with a short leader to the sheath. It follows the sheath, kept inside the safe area. Visible 36.5–37.5. |
| 8 | Bronze knife (铜削) | done | `BronzeKnife53`: ring pommel, ribbed handle, gently curved single-edged blade 26 cm long. Dull olive-brown bronze, darker than any part of the sword. It lies between the shins and the sword (x' 0.40–0.66, y −0.228) and is blurred with the floor when the sword is lifted. |
| 9 | Sheath | done | Black lacquer with 2 red pin-lines. Soil spots cut from 9 to 7, radius halved, colour `#4A3826`, opacity 45 %. They wash off on v2's clock, so the sheath is clean at the hand-off. |
| 10 | Coffins | done | Centred on body plus sword (CYC −0.055). Outer 2.12 × 0.94 m, inner 1.80 × 0.71 m: wider than scene53c's 0.84 / 0.60 so the sword fits on the left. Lacquer `#1A110D`, red only as the thin inset line. Outer interior `#2A1D14`. Inner walls desaturated to `#3A2418`. The inner floor stays scene53c's (`#46201A` × 0.55) because it is in frame at the hand-off. The coffin walls are out of frame at the hand-off, so the change is invisible there (checked). |
| 11 | Lid lifters | done | `Digger53`: the same rig in the lacquer-brown people style of the draw's hands (`#2B1A12`, warm rim). |
| 12 | Tags ①外棺 ②内棺 | done | Shared `Tag`, 56 px, gold. Each sits under its coffin's near rim (screen right), over the empty floor, not over the subject. They fade as their lid or rim leaves the frame: ① 34.44–35.45, ② 35.59–36.51. The rule keeping them out of the subtitle box (x < 1150, y < 280) is built in. v2's 28 px 「墓主人」 label is removed because 28 px is not an allowed size. |
| 13 | Hands lift and rinse | done, ≈0.8 s later than the brief | Gloves arrive 37.45–37.66, lift 37.62–38.14, rinse 37.71–38.45, the draw starts 38.32. I kept the sword at rest beside the body for about 0.8 s after the 36.67 settle so the key fact and its tag can be read. |

## For the other engineers
- **Overlay (master53v3), depth tag:** the picture is built for `depthB3(t)` = 0 until 29.9 s, then 2.4 m/s: 8.8 (the 椁 roof) at 33.57 and 10.8 (the floor) at 34.4. The camera itself goes down about 2.4 m/s from 29.45 and stops 1.45 m above the roof at 33.83.
- **TakeD3 (the second chamber), reference values:** sword rest `SWP3.rest` = {xp −0.04, y −0.30, z 0.06}, chamber metres, x' mirrored (screen right = −x'). Coffins `CYC`, `OUT3`, `INN3`. Skeleton `Occupant53` (OY −0.07). Knife `Knife53`/`KNIFE3`. Sheath `Sheath53`. Lids `Lid53`. People `Digger53`. Hilt at screen right, as in the draw.
- Not touched: v2 `world53d` (the old second chamber). It still uses the old sizes and side.
