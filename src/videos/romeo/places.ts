// THE PLACES of 采访罗密欧与朱丽叶 and where things stand in each: the contract between the set builders, the props and
// the shots. Every place is built round its own island (x = ISLAND[place], floors at y = 0 unless said, the camera
// side is +z, the back of the place is -z). All positions below are LOCAL to the island (add ISLAND[place] to x).
// A set builder may move a spot by up to 0.3 m if the set needs it, and then changes it HERE (the shots read it).
// Units: metres. The reporter's eye (the camera) is about 1.5 m above whatever she stands on.
export type Place = "grove" | "hall" | "balcony" | "cell" | "street" | "bedroom" | "mantua" | "tomb";
export const PLACES: Place[] = ["grove", "hall", "balcony", "cell", "street", "bedroom", "mantua", "tomb"];
/** where each place's island sits on x (one scene holds every place; only one is shown at a time) */
export const ISLAND: Record<Place, number> = { grove: 0, hall: 120, balcony: 240, cell: 360, street: 480, bedroom: 600, mantua: 720, tomb: 840 };

export type V3 = [number, number, number];
/** a named spot: where a figure stands (feet), facing = yaw in radians (0 = toward +z, the camera side) */
export type Spot = { at: V3; facing: number; note: string };
/** a camera spot: where the reporter stands and what she looks at */
export type CamSpot = { pos: V3; look: V3; fov: number; note: string };

export const STAGE = {
  // ---------------------------------------------------------------- scene 1: Sunday dawn, the sycamore grove west of town
  grove: {
    when: "dawn, low warm sun from the left (east), mist between the trunks, dew",
    spots: {
      romeoTree: { at: [0.0, 0, -0.55], facing: Math.PI, note: "Romeo hugging the big sycamore (the trunk's front face at z -0.85, radius ~0.35), his back half to the camera; he turns his head to the lens" } as Spot,
      romeoTalk: { at: [0.15, 0, -0.35], facing: 0.25, note: "Romeo turned to the lens, the trunk behind his left shoulder, pushing the letter at her" } as Spot,
    },
    cams: {
      open: { pos: [0.55, 1.45, 1.6], look: [0.0, 1.05, -0.6], fov: 46, note: "frame 0: medium close on Romeo at the tree; crumpled poems on the ground in frame" } as CamSpot,
      wide: { pos: [1.5, 1.4, 3.8], look: [-0.3, 1.55, -2.0], fov: 50, note: "set view (the beauty angle): the big sycamore and Romeo in the dawn grove, mist between the trunks, the sun's glow at the left" } as CamSpot,
    },
    dressing: "the big sycamore (hug height trunk), other trunks fading into mist, a path, ~12 crumpled paper balls and loose pages on the grass round the tree, ferns. Nothing saturated blue.",
  },
  // ---------------------------------------------------------------- scene 2: Sunday night, the Capulets' feast hall
  hall: {
    when: "night, warm torch and candle light, the middle of the hall brighter (the dance floor), the walls darker",
    spots: {
      romeoWall: { at: [-1.6, 0, -0.9], facing: 0.9, note: "Romeo in a half mask against the left wall by a pillar, looking right across the hall" } as Spot,
      julietTiptoe: { at: [2.2, 0, -3.2], facing: -0.9, note: "Juliet by the right-hand pillar / foot of the stairs across the hall, on tiptoe, looking left back at him" } as Spot,
      dancers: { at: [0.3, 0, -2.2], facing: 0, note: "the dance floor between them (2-4 background dancers are added by the shots, not the set)" } as Spot,
    },
    cams: {
      romeo: { pos: [-0.3, 1.5, 0.6], look: [-1.5, 1.2, -0.9], fov: 44, note: "his interview: him by the wall, the hall opening to the right of frame" } as CamSpot,
      juliet: { pos: [1.1, 1.5, -1.6], look: [2.2, 1.15, -3.2], fov: 44, note: "her interview across the same hall: mirrored, she looks left" } as CamSpot,
      across: { pos: [-0.3, 1.5, 0.6], look: [2.2, 1.2, -3.2], fov: 32, note: "the tilt along his look: Juliet small across the hall, past the dancers" } as CamSpot,
      wide: { pos: [0.9, 1.65, 2.0], look: [0.3, 1.5, -4.5], fov: 50, note: "(set view) the hall from the door end: the dance floor, the arcades, the chandelier, the high table" } as CamSpot,
    },
    dressing: "a long stone hall, two rows of pillars, wall torches and a candle chandelier, a long table with food at the back, tapestries in muted Capulet red and gold (darker than Juliet's dress), a stair on the right, masks on a side table.",
  },
  // ---------------------------------------------------------------- scene 3: Sunday late night, Juliet's balcony over the orchard
  balcony: {
    when: "late night, a big moon low behind the balcony (upper left of a vertical frame), cool blue moonlight, warm light from her room behind her",
    spots: {
      julietRail: { at: [0.0, 2.6, -1.0], facing: 0, note: "Juliet on the balcony floor (y 2.6), hands on the rail (rail top at y 3.25, 0.65 m over her floor so that she shows from the waist up; the rail's front at z -0.55)" } as Spot,
      romeoBelow: { at: [0.35, 0, 0.35], facing: Math.PI * 0.85, note: "Romeo crouched in the bushes right under the balcony, a little in front of it, glancing up" } as Spot,
      romeoRun: { at: [2.6, 0, 1.2], facing: -1.2, note: "where he runs to: the orchard wall on the right" } as Spot,
    },
    cams: {
      juliet: { pos: [0.6, 3.85, 0.55], look: [0.0, 3.6, -1.0], fov: 42, note: "HER interview: the camera up on the balcony level beside her, moon behind her" } as CamSpot,
      romeo: { pos: [0.9, 1.2, 1.9], look: [0.35, 0.75, 0.35], fov: 44, note: "HIS interview: crouched in the dark orchard, leaves in the foreground" } as CamSpot,
      reveal: { pos: [0.5, 1.6, 5.4], look: [0.1, 2.0, -0.4], fov: 48, note: "the split screen widens into ONE picture: Juliet at the rail in the top part of the 9:16 frame, Romeo in the bushes in the bottom part, the balcony's edge between them" } as CamSpot,
      wide: { pos: [2.0, 1.5, 7.2], look: [0.3, 2.4, -1.5], fov: 50, note: "set view: the house, the balcony and the moon over the dark orchard, the orchard wall at the right" } as CamSpot,
    },
    dressing: "the Capulet house wall (warm stone, ivy), the balcony (stone floor slab, balustrade, a lit doorway behind her), an orchard: fruit trees, bushes he can crouch in, the orchard wall on the right, grass. The moon: a big pale disc.",
  },
  // ---------------------------------------------------------------- scenes 4 and 6a: Friar Laurence's cell (Monday afternoon, Tuesday)
  cell: {
    when: "day: a sun beam from a small high window, a bright open doorway on the left; Tuesday's visit is greyer",
    spots: {
      friarBench: { at: [0.7, 0, -1.5], facing: -0.5, note: "the Friar in front of his herb bench (the bench is BEHIND him along the back wall: top y 0.86, its front edge at z -1.85; shelves of bottles over it), sorting herbs and small bottles" } as Spot,
      door: { at: [-2.05, 0, -0.85], facing: 1.2, note: "just inside the doorway (left wall x -2.3, the opening z -1.6 .. -0.6, 1.6 m to the arch's spring): Romeo bursts in, Juliet sprints in, the young friar leaves" } as Spot,
      romeoBetween: { at: [-0.1, 0, -0.75], facing: 0.3, note: "Romeo shuffles to stand between the Friar and the lens" } as Spot,
      wedding: { at: [0.1, 0, -1.25], facing: Math.PI, note: "the couple side by side facing the Friar (who turns round to them), hands clasped" } as Spot,
      desk: { at: [1.5, 0, -0.6], facing: -1.4, note: "a small writing desk / lectern for the letter (scene 6): quill, ink, wax" } as Spot,
    },
    cams: {
      bench: { pos: [-0.3, 1.5, 1.1], look: [0.6, 1.1, -1.4], fov: 46, note: "the Friar at work, the doorway at frame left" } as CamSpot,
      wide: { pos: [0.8, 1.5, 2.6], look: [-0.3, 1.0, -1.15], fov: 52, note: "stepped back wide: three small figures in the doorway light (the sun comes in low from the left, through the doorway and the high window over the bed)" } as CamSpot,
    },
    dressing: "a small whitewashed stone cell: herb bench with rows of small glass bottles and jars, bunches of drying herbs from a beam, a mortar, a basket, a stool, a bell rope by the door (the bell is outside), a narrow bed, a writing desk. NO cross, NO altar, NO religious picture anywhere.",
  },
  // ---------------------------------------------------------------- scene 5: Monday dusk, a Verona street (and scene 7's boarded window)
  street: {
    when: "dusk, low orange sun down the street, long shadows, the sky going purple; empty",
    spots: {
      romeoBack: { at: [0.0, 0, -1.4], facing: Math.PI, note: "Romeo standing with his back to us in the middle of the street" } as Spot,
      sword: { at: [0.25, 0, -1.1], facing: 0.4, note: "a sword lying on the stones at his feet" } as Spot,
      cap: { at: [-0.5, 0, -1.6], facing: 0, note: "a red cap lying on the stones" } as Spot,
      exit: { at: [-2.8, 0, -3.5], facing: Math.PI * 0.8, note: "where he runs off (a side alley on the left)" } as Spot,
      boarded: { at: [2.3, 0, -0.2], facing: -Math.PI / 2, note: "a house front on the right (its face at x 2.3) with a ground-floor window (sill 0.90, head 1.75, 0.5 wide, 0.34 deep) that can be boarded shut (param 'boards' 0..1: planks appear one by one from the top down); scene 7 looks at it straight on. A letter stands on its inner sill at [2.47, 0.9, -0.2]" } as Spot,
    },
    cams: {
      back: { pos: [0.2, 1.5, 1.6], look: [0.0, 1.0, -1.5], fov: 46, note: "the turn: Romeo's back, the sword and the cap on the stones" } as CamSpot,
      window: { pos: [0.3, 1.5, -0.2], look: [2.0, 1.3, -0.2], fov: 40, note: "scene 7's match cut: the window straight on (set.param light \"day\")" } as CamSpot,
      wide: { pos: [1.7, 1.9, 4.2], look: [-1.0, 1.25, -5.0], fov: 50, note: "for showing the set: Romeo on the stones, the alley under its arch on the left, the street running to the piazza and the low sun" } as CamSpot,
    },
    dressing: "paved street between plain Verona houses (warm stucco, arches, shutters, a balcony or two), an alley on the left, a well or a fountain basin further back, nothing red except the cap. No blood, no body.",
  },
  // ---------------------------------------------------------------- scene 6b: Tuesday night, Juliet's room
  bedroom: {
    when: "night, one candle on a chest, cool moonlight through a window",
    spots: {
      julietBed: { at: [0.0, 0, -1.0], facing: 0, note: "Juliet sitting on the edge of her bed (seat height 0.42) facing the lens, the bottle in her right hand" } as Spot,
    },
    cams: {
      toast: { pos: [0.25, 1.4, 0.75], look: [0.0, 1.0, -1.0], fov: 44, note: "she raises the bottle to the lens like a toast" } as CamSpot,
      room: { pos: [-1.3, 1.55, 1.4], look: [0.8, 1.05, -1.7], fov: 50, note: "(set view) the room: the canopy bed, the candle on the chest, the moonlit window" } as CamSpot,
    },
    dressing: "a bed with a canopy and curtains (muted wine red and cream, darker than her dress), a window with moonlight, a chest with the candle, a small rug, a door. Quiet and warm.",
  },
  // ---------------------------------------------------------------- scene 7: Wednesday noon, a bare street in Mantua
  mantua: {
    when: "flat white noon light, almost no shadow, dusty and bleached: the opposite of Verona's warmth",
    spots: {
      romeoFar: { at: [0.0, 0, -4.0], facing: 0, note: "Romeo small in the middle of the bare street, seen from a little above" } as Spot,
      romeoLens: { at: [0.0, 0, -0.6], facing: 0, note: "he walks up to the lens and stops" } as Spot,
      rider: { at: [-1.0, 0, -9.0], facing: Math.PI, note: "where a rider leaves at the far end (the shots add the horse)" } as Spot,
    },
    cams: {
      above: { pos: [0.6, 2.6, 1.8], look: [0.0, 0.9, -4.0], fov: 40, note: "from a little above: Romeo small on the empty street" } as CamSpot,
      close: { pos: [0.0, 1.5, 0.9], look: [0.0, 1.35, -0.6], fov: 40, note: "he walks up to the lens; the camera holds still" } as CamSpot,
    },
    dressing: "a long straight dusty street, low pale houses with few windows, a town gate at the far end, a dead tree, a well. Nothing warm, nothing red.",
  },
  // ---------------------------------------------------------------- scenes 8 and 9: Thursday before dawn, the Capulet vault
  tomb: {
    when: "deep night, two wall torches, warm pools of light in black stone; the quiet scene",
    spots: {
      bier: { at: [0.0, 0, -1.2], facing: 0, note: "the stone bier (top at y 0.62, 2.0 long along x, 0.8 deep): Juliet lies on it near its front edge (z -1.05), head at x +0.68 toward Romeo, hands folded" } as Spot,
      romeoKneel: { at: [1.3, 0, -1.0], facing: -Math.PI / 2, note: "Romeo kneeling at the bier's head end (right), facing along it to her face: both faces to the lens (v2, 22 Nov: at the front side he hid her face and the lens saw only her feet)" } as Spot,
      shardFloor: { at: [0.95, 0.02, 1.05], facing: 0, note: "where the thrown camera lands: on the floor in front of the bier's head end, tilted, looking up at the two of them" } as Spot,
    },
    cams: {
      push: { pos: [0.7, 1.45, 1.9], look: [1.03, 0.74, -1.02], fov: 50, note: "the one slow push of the quiet scene (fov 50 -> 42): her face and his across the bier's head end, the stair and its glowing door behind them; from 3 m so that both heads (R 0.24) stay inside the phone frame (v4 stills: from 2.4 m they sat on its edges)" } as CamSpot,
      floor: { pos: [0.95, 0.12, 1.05], look: [1.1, 0.82, -0.92], fov: 64, roll: 0.14, note: "scene 9: the camera on the floor in front of the bier's head end, tilted, looking up at the two of them through the shard (v5: from 2 m, so the pair stays inside the phone frame)" } as CamSpot & { roll: number },
      set: { pos: [1.9, 1.4, 2.7], look: [-0.15, 1.05, -2.0], fov: 54, note: "set view (the beauty angle): the vault, the bier under its cloth, the torch and the Capulet arms on the back wall, the stair to the door" } as CamSpot,
    },
    dressing: "a low vaulted stone crypt, arches, niches, the Capulet arms (a plain heraldic shield, NO crosses anywhere), two torches in iron brackets, steps up to a door at the back, dust. The bier is a plain stone slab on a base with a pale cloth.",
  },
} as const;
