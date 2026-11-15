// Preview harness of the Newton film: Wanbi's (src/videos/wanbi/preview/common.ts), re-exported unchanged (WP1). One page
// renders one still or a run of frames through a post chain close to the film's (N8AO -> InkPass -> NEUTRAL tone
// mapping; the film adds lens blur, bloom and the grade). Render ONLY through the queue:
//   bash scripts/kit/queue/still.sh src/videos/newton/preview/<entry>.ts /home/user/newton_work/film/<lane>/out.png --size 540x960 [--opts '<json>']
//   bash scripts/kit/queue/still.sh src/videos/newton/preview/<entry>.ts /home/user/newton_work/film/<lane>/ --pick 0,15,30 --size 540x960
// Options and the entry shape: see the Wanbi file's header.
export { preview, type V3, type Cam, type AO, type Ctx, type Built } from "../../wanbi/preview/common";
