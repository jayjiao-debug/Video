// THE SCENES of 采访蒙娜丽莎的一天 as stills, through the film's own World (world.ts) and scene data (scenes.ts): the
// stage in each scene's room with its light, she in her picture, the side cast where the script puts them.
//   bash scripts/kit/queue/still.sh src/videos/mona/preview/scenes.ts <abs out.png> --size 540x960 --opts '{"scene":"s3"}'
//   bash scripts/kit/queue/still.sh src/videos/mona/preview/scenes.ts <abs out dir>/ --pick 0,1,2 --size 540x960 --opts '{"pages":[{"scene":"s1"},{"scene":"s2"},{"scene":"s3"}]}'
// Options: scene (a SCENES key); any field of a scene over it (room, mount, state, cracks, glass, crowd, stone, cake,
// soup, night, torch [x, y, r, k], plate [a, b], gone, expr, hands, who [names], shot, gaze, camPose { pos, look, fov });
// t (seconds: the flames, the dust); pages (one option object per frame).
import { preview } from "../../wanbi/preview/common";
import { World } from "../world";
import { SCENES, poseScene, sceneBg, type Scene } from "../scenes";

preview({ w: 540, h: 960 }, (c) => {
  const o = c.opts;
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const pages: Record<string, unknown>[] = Array.isArray(o.pages) && o.pages.length ? o.pages : [{}];
  const page = (i: number): Scene & { t?: number } => { const pg = { ...o, ...pages[((i % pages.length) + pages.length) % pages.length] } as Record<string, unknown>; const sc = SCENES[String(pg.scene ?? "s7")]; if (!sc) throw new Error(`scenes: no scene called ${pg.scene}`); return { ...sc, ...pg } as Scene; };
  return {
    cam: null,
    bg: (i: number) => sceneBg(page(i)),
    ao: () => w.look().ao,
    frame: (fi: number, t: number) => {
      const Pg = page(fi), tt = typeof Pg.t === "number" ? Pg.t : t;
      w.beginFrame(Math.round(tt * 30));
      const cam = poseScene(w, Pg, tt);
      w.setCamera(cam); w.update();
      w.endFrame({ camera: cam, clock: tt });
    },
  };
});
