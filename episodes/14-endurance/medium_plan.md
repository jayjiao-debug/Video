# 坚忍号 — 逐场景媒介判断（3D / 2.5D / 2D）

Owner (2026-10-06 21:40): "这种3D的视频最核心的就是模型，光源，还有流畅程度。《应该没事吧》有些地方用模型呈现非常的差所以用了3D，有些地方可以用2.5D、2D，不是一定要限制3D，你可以自由判断。"

**Rule used here:** a shot is 3D only if (a) we have a real model that holds up at that camera distance, (b) the light can do the work (silhouette, one hard source, fog), and (c) the camera move is the point of the shot. Otherwise 2.5D (real-textured layers/cards in a 3D space with a moving camera) or 2D. Never 3D people: figures are always 2D silhouette cards (no faces, no hands). Never procedural terrain as the hero (owner: "太丑").

| Film time | Scene | Medium | Why | Model / asset | Light |
|---|---|---|---|---|---|
| 0–6.6 | S1 海底，光柱在字母 E 上，跟光上升 | **3D** | Darkness hides geometry; one beam = cinematic for free. The camera rise is the hook. | Our own stern: hull planks from the CC-BY sailing-ship model (cyc3w) or a simple built stern + our own ENDURANCE lettering & star (never the FMHT-derived wreck scan). Marine-snow particles. | One warm spotlight, black water, exp fog |
| 6.6–21.1 | S2 冰中的船：高空缓推 → 标题 → 环绕 → 船身被压 | **3D** (hero set-piece ①) | The orbit around the trapped ship is the film's big shot. | Ship: cyc3w CC-BY 3-master (strip square sails off main/mizzen). Ice: Oceanic Floes CC-BY (baked to normal/height) + instanced "ice floes" CC-BY; pressure ridges = shards near the hull only, low-contrast. | **Low dusk sun behind the ship** → silhouette + rim light; Poly Haven dusk sky HDRI; heavy distance fog hides the ice field's edges |
| 21.1–24.6 | 金币扔、照片留 | **2.5D** | 3D hands/close props look cheap. | Snow-hole plate (Poly Haven snow texture), coin + photo as real-photo cut-outs dropping with parallax; a glove edge, no hand. | Same dusk key colour, so it reads as a push-in from S2 |
| 24.6–30.8 | 夜·帐篷 → 书页引文 | **2.5D** | A real paper page in 3D space with a slow dolly + lamp-light sweep looks rich and costs little. | Tent = 2D glowing silhouette card on the S2 ice at night; book = paper-texture plane, the quote writes itself in ink. | Warm tent/lantern light vs blue night |
| 30.8–63.6 | 书页 → 地图 → 实验柱 → 沿航线 | **2.5D** | One continuous "chart on a table" surface tilted in 3D: page becomes the chart (match shape). Full 3D landmasses look like a game. | Aged-paper nautical chart texture (no borders, place labels only), ink route line drawing, boats as small brass/wood tokens, bars as ink columns drawn on the same paper. | Lamp pool that travels with the camera; paper grain |
| 33.7–36.6 | 冰上远望沉船（插入） | **2.5D** | A silhouette layer shot is stronger than a far 3D model. | Foreground: row of 2D figure silhouettes on an ice ridge; mid: ship silhouette card sinking behind the horizon; back: dusk sky. 3 parallax layers. | Backlit dusk only |
| 63.6–75.4 | 凯尔德号贴浪 → 炉火灯塔 → 巨浪 | **3D** (hero set-piece ②) | Real museum scan of the boat + a good ocean shader = the best-looking 3D in the film. Low camera skimming the swell is pure 运镜. | James Caird — The Watt Institution CC-BY scan (decimated). Ocean: three.js Water shader + waternormals (MIT). 6 figures = 2D cards. Giant wave: **test first**; fallback = camera tilts up into a dark wall + foam card (2.5D). | Overcast grey day → dusk with stove glow (point light) → near-dark under the wave |
| 75.4–81.8 | 浪白 → 雪 → 翻雪山 → 甩回象岛 | **2.5D** | Back on the chart; the white of the wave becomes the white of the chart's snow. | Chart + contour lines + small station-smoke card. | Lamp pool |
| 81.8–91.2 | 象岛海滩·倒扣的船屋·空荡海平线·刻痕"今天" | **2.5D with one 3D prop** | The upturned-boat hut is historically two boats flipped over: reuse the Caird scan upside-down as the hut (3D prop). Everything else = layers. | Caird scan ×2 flipped; beach/rock plates; 2D silhouettes; the tally plank as a real wood-texture card. | Cold flat overcast; one warm crack of stove light under the hut |
| 91.2–97.4 | 海平线上救援船 · 28/28 | **2.5D** | A small ship on the horizon reads as a silhouette; a 3D tug would add nothing. | Yelcho silhouette card + smoke; figures wave (2D). | Same overcast, slight break of light on the drop |
| 97.4–106.4 | 回到海图 → 下潜 → 光照出 ENDURANCE | **2.5D → 3D** (set-piece ③, bookend of S1) | Chart pin → dive is a 2.5D move into the paper; then the same 3D stern as S1. | Same as S1 | Same beam as S1, now sweeping the full name |
| 106.4–110 | Juno end card | 2D | Series rule | | |

**Totals:** 3 true 3D set-pieces (stern, ship-in-ice, Caird at sea), everything in between 2.5D on one chart surface or silhouette layers, 2D figures throughout.

## Flow (流畅) rules for the build
- One camera language: slow, eased, always moving; cuts only where a shape/colour carries over (page→chart, wave white→snow, notch→horizon, pin→water).
- Transitions between 3D and 2.5D happen *inside a move* (fly into the paper, dive through the pin), never as a crossfade.
- Each 3D set-piece gets a ~15 s moving test with the real model and final light **before** the rest is built (gate 2).

## Assets to fetch (asset farm)
- Download: James Caird (Watt Institution, CC-BY), Sailing ship (cyc3w, CC-BY), ice floes (James Dadema, CC-BY), Oceanic Floes (CATholic, CC-BY).
- Search (thumbnails for the producer/owner to choose): barquentine / polar ship, steam tug, iceberg, sea ice, rock beach.
- Poly Haven (CC0): dusk sky HDRI, snow texture, wood planks, paper.

## Lookdev findings (2026-10-06 22:20, real models + real light, assets endurance-01..03 on asset-output)
- **James Caird (Watt Institution, CC-BY): hero quality.** Name readable on the hull. Needs: sink ~2 m so the museum cradle is under water; overcast sky, dark water. The giant-wave test already reads (wave = displaced ocean mesh) → keep 3D.
- **No true Endurance model exists under CC-BY.** Searched ~100 results (barque, schooner, polar ship, RRS Discovery, Fram, Shackleton…).
  - cyc3w "Sailing ship": reads as a pirate galleon (high stern castle, sails set) → reject.
  - gogiart "Merchant Schooner" (CC-BY, 503k faces): best wooden hull and texture, but 2 masts; Endurance had 3 (barquentine) + a funnel. Usable only as a dusk silhouette after kitbash (add 3rd mast, furl sails, add funnel).
  - Schmauß "Endurance Ship Wreck discovered" (CC-BY): it *is* the Endurance wreck, but reconstructed from FMHT footage (© FMHT) → director advised against. Too dark in first light test.
- **Owner decision needed:** (A) kitbashed schooner as a 3D silhouette, (B) ship-in-ice as 2.5D painted silhouette layers (3D kept for Caird + seabed), (C) use the Schmauß wreck scan for the seabed with credit, accepting the risk.
