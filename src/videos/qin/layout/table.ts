// THE TABLE (place "table", island x 300): the flashback tableaux on a sand table in a small dark room (PLAN 1, 7C, 7E;
// like Hongmen's card set): the COAST (beach, rocks, the sea, the giant fish; the tiny emperor shoots it from the
// shore: 史记 says he waited along the coast, NOT in a boat); 泰山 in the rain with the tree that is made 五大夫; 湘山 in
// the storm (the forest, the shrine, a boat that tilts), the mountain goes bare and red. NUMBERS ONLY. Owner: WP2.
// The table's top is at `table.top`; tableau marks are world points ON the tableau (y = the ground there).
import { ISLAND, V, eyeCam, type Stand, type Cam } from "./base";

export const BX = ISLAND.table;
const TOP = 0.86;
export const TABLE_SET = {
  /** the dark room's floor and walls */ room: { x0: BX - 3, x1: BX + 3, z0: -3, z1: 3.5, h: 3 },
  /** the sand table: x / z extents and its top (the tableau stands on it); the rim stands `rim` m proud */ table: { x0: BX - 1.1, x1: BX + 1.1, z0: -1.0, z1: 0.6, top: TOP, rim: 0.05 },
  /** the lamp over the table (its bowl's middle) */ lamp: V(BX, 2.05, -0.2),
  /** the sea's level on the coast and xiangshan boards (a little under the top: the beach rises out of it) */ water: TOP + 0.012,
};
export const TABLE = {
  /** the middle of the table's top (the tableau's origin) */ top: V(BX, TOP, -0.2),
  /** COAST: where the tiny emperor stands on the shore with his crossbow (sand level), facing the fish */ shore: V(BX - 0.42, TOP + 0.03, 0.12),
  /** COAST: the giant fish breaching (its belly's middle at the waterline) */ fish: V(BX + 0.3, TOP + 0.012, -0.55),
  /** 泰山: the tree's foot on its ledge, and where the tiny emperor shelters under it */ tree: V(BX - 0.26, TOP + 0.113, 0.06), shelter: V(BX - 0.14, TOP + 0.057, 0.13),
  /** 湘山: the shrine on the summit, the boat on the lake */ shrine: V(BX - 0.06, TOP + 0.248, -0.4), boat: V(BX + 0.38, TOP + 0.012, 0.2),
  /** where HE stands behind the table (he unrolls / presents it) */ behind: V(BX, 0, -1.7),
};
/** NAMED CAMERAS: her eyes over the table, a closer look, the miniature's own eye level, him across the table */
export const TABLE_CAMS: Record<"over" | "close" | "mini" | "across", Cam> = {
  /** her eyes 0.65 m in front of the table, looking down onto the tableau (about 24 deg) */
  over: eyeCam(BX + 0.3, 1.25, [BX, TOP, -0.35]),
  /** leaning in: the tableau fills the frame */
  close: { pos: [BX + 0.15, 1.3, 0.85], look: [BX, TOP + 0.05, -0.4], fov: 52 },
  /** down at the miniature's eye level (the fish / the storm as if real) */
  mini: { pos: [BX - 0.2, TOP + 0.14, 0.62], look: [BX + 0.15, TOP + 0.12, -0.6], fov: 44 },
  /** across the table at him */
  across: eyeCam(BX + 0.25, 1.45, [BX, 1.35, -1.7]),
};
/** her eyes 0.65 m in front of the table, looking down onto the tableau (about 24 deg), the EMPEROR behind it */
export const TABLE_STAND: Stand = { cam: eyeCam(BX + 0.3, 1.25, [BX, TOP, -0.35]), emperor: V(BX, 0, -1.7), facing: 0 };
