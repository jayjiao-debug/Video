# film/: the film contract, input props, the language switch

| file | what |
|---|---|
| `contract.ts` | types only: `FilmStory` (what story.ts exports), `Segment`, `KitWorld` (what the tools drive), `FilmHooks` (a film's `kit.world.ts`). Films fit by shape; nothing to inherit |
| `env.ts` | the input props read ONCE and guarded (`IP`, `ipNum`, `ipFlag`): `getInputProps()` throws outside Remotion, which killed preview entries at import time. Import `IP` from here, never call `getInputProps()` yourself. The props the engine knows are listed in its header (`lang`, `nocap`, `nohud`, `noov`, `cover`, `zoom`/`sx`/`sy`/`ov`, `nopost`, `slate`, `ovonly`, ...) |
| `lang.ts` | `LANG`, `EN`, `L(zh, en)`: `--props='{"lang":"en"}'` renders a film's English version. A film's own `lang.ts` re-exports these and keeps its layout constants and shared strings (Hongmen: `TAG_X`, `STAMP_CW`, `TXT`) |

## The film contract (what every shared tool assumes)

- `story.ts` exports `FPS`, `W`, `H`, `TOTAL` and `SEGMENTS: {id, from, to}[]` (inclusive frames covering 0..TOTAL-1).
- Each segment file (`shots/segX.ts`) exports `SEG: { id, from, to, enter?, exit?, pose(w, f) }`.
- `world.ts` has a World with `root`, `camera`, `rc.figures`, `project()`, `update()`, `beginFrame(f)`, `endFrame(P)`;
  `set.group`, `props.group`, `place` and `prop(name).put(...)` when it has them. Per frame the film (and every tool)
  runs `w.beginFrame(f); P = SEG.pose(w, f); w.endFrame(P)`.
- Hongmen and Arthur both fit this already.

## A film's two config files (in `src/videos/<film>/`)

`kit.json` (plain JSON: read by the cut, deps.mjs, the clearance checker, tsc.sh, new_farm.sh):

```json
{ "film": "hongmen", "composition": "HongmenFilm", "dir": "src/videos/hongmen", "story": "story.ts", "hooks": "kit.world.ts",
  "entries": { "pic": "preview/film_cut.ts", "picCore": "preview/film_cut_core", "overlay": "Film.tsx", "segFile": "shots/seg{SEG}" },
  "tsc": ["Film.tsx", "preview/film.ts"], "domOnly": ["hud/"], "chainSha": "scripts/hongmen/cut/chain.sha", "langs": ["zh", "en"],
  "work": "/home/user/hm_work", "qa": { "clearanceOut": "/home/user/hm_work/qa/clearance" },
  "cut": { "dir": "/home/user/hm_work/final", "name": "hongmen_cut", "freeze": ["src", "scripts/hongmen", "scripts/kit"] },
  "sound": { "build": "scripts/hongmen/sound/build.sh", "mux": "scripts/kit/sound/mux.sh", "clips": "/home/user/hm_work/sound/clips" } }
```

Only `film`, `dir` and `hooks` are needed by the clearance checker; `composition`, `entries`, `cut` and `sound` by the
cut; `tsc` by tsc.sh. Frame count and segments are never stored here: they come from story.ts.

`kit.world.ts` (code hooks; Hongmen's is the example):

```ts
import type { FilmHooks } from "../../kit/film/contract";
const hooks: FilmHooks<World> = { film: "x", W, H, makeWorld: (cv, cam) => new World(cv, cam), segments: [SA, SB, SC],
  shotAt: (f) => shotAt(f).id /* optional */, rigNames /* optional */, seeds /* optional */ };
export default hooks;
```
