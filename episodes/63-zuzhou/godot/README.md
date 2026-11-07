# ep63 · Godot test (Synty POLYGON Ancient Egypt)

Godot 4.5.1, Forward+ renderer, built entirely at runtime from the Synty **Source Files** (FBXDocument) — no editor import.
The Synty files are NOT in the repo (licence + public repo).

## What main.gd does
- Loads each FBX once (FBXDocument), duplicates it per use; materials from Synty's material list (`matmap.json` from
  `scripts/synty_pub.py`): atlas albedo + normal map + emissive map (emission colour black: Godot's ADD op = colour + texture).
- Characters: one copy of Characters.fbx per figure, only its body + attachments visible; static crowns hung on the Head bone.
- Animations: Synty's animation packs are authored on `PolygonSyntyCharacter.fbx` (same T-pose, different bone axes), so
  each rotation key is retargeted: `q_c = GRc(parent)^-1 · GRr(parent) · q_a · GRr(bone)^-1 · GRc(bone)` (global rests).
- Environment: SDFGI, SSAO, SSIL, glow, volumetric fog, depth of field; CPUParticles fire and dust
  (`billboard_keep_scale = true`, or particles ignore their size).
- Shots: `shot=temple` (the night temple from the three.js test), `shot=ante` (Carter's first look into the antechamber).

## Run (cloud box, no GPU)
```
apt-get install -y mesa-vulkan-drivers          # software Vulkan (lavapipe)
# Godot_v4.5.1-stable_linux.x86_64 from the godotengine GitHub releases
# assets: SYNTY_SRC=<unzipped Egypt SourceFiles> SYNTY_PUB=<project>/assets python3 -I scripts/synty_pub.py <prefabs> tex:<extra textures>
#         + assets/anim/<A_POLY_IDL_*.fbx, PolygonSyntyCharacter.fbx> ; touch assets/.gdignore
export VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/lvp_icd.json
xvfb-run -a -s "-screen 0 1440x1080x24" ./Godot --path <project> --rendering-driver vulkan \
  --write-movie out/f.png --fixed-fps 30 --quit-after 126 --resolution 1440x1080 -- shot=temple t0=0
```
Speed on the 2-core cloud box: ~1.1 s/frame (temple), ~2.1 s/frame (antechamber). On the Mac mini: near real time.

## Storyboard previs: board.gd (法老的诅咒 opening, S1–S8)
`board.tscn` + `board.gd` build the eight opening shots from six packs (Egypt, Horror Mansion, Dogs, City Characters,
Explorer Kit, Arid Desert; one assets folder, `synty_pub.py` run once per pack with `SYNTY_SRC` pointing at each).
Run with the scene as the first positional argument, user args after `--`:
```
... ./Godot --path <project> res://board.tscn --rendering-driver vulkan --write-movie out/f.png --fixed-fps 30 \
  --quit-after 3 --resolution 1440x1080 -- shot=cairo t0=0
```
Shots: `cairo` (S1; `out=1` = the lights going out, S3), `hotel` (S2), `manor` (S4; `dogt=`), `dog` (S5;
`dogclip=_POLYGON_Dog_Transition_Stand_ToSleep dogt=9 dogry=1.82`), `seal` (S6; `burst=1` = S8), `valley` (S7).
- Older rigs (City Characters, Explorer Kit) name bones differently (`RIG_MAP`) and sit at `Root/Skeleton3D`;
  `anim_for()` maps names, then retargets with the same global-rest formula.
- Dogs: every breed is one mesh in the dog rig; show one and give it `PolygonDog_<Breed>_01.png` (the shared atlas gives
  rainbow colours). Dog clips share the rig, so no retarget.
- Omni lights fall off with the inverse square: a torch of energy 2.5 is black 6 m away. Put lights near what they light.

## Rendering on Modal (T4 GPU), Synty files locked
Branch `modal-farm`, folder `gd63/`: `key_probe.py` made an RSA-4096 key pair inside Modal (private key only in the
Modal Volume `juno-vault`) and probed Godot on the T4 (Vulkan on the NVIDIA driver under Xvfb works: the swap-chain
errors are harmless, the movie writer still saves every frame). `render.py` renders one shot per T4 container.
- Synty files go up only as `gd63/vault/assets.tar.sealed` (AES-256-GCM, key wrapped to Modal's public key); the runner
  copies the ciphertext into the Volume `juno-synty`; each container unlocks it into its own /tmp. Push the sealed file
  again only when the asset set changes, then remove it from the branch tip.
- Each shot's MP4 comes back sealed to the workspace key (`gd63/ws_pub.pem`; private half kept outside the repo), so
  `modal-output` only ever holds ciphertext. If the workspace key is lost, make a new pair and push the new public key.
- `board.gd` reads the assets folder from `GP_ASSETS` (default /dev/shm/gp/assets/). 4x MSAA on Modal.
- Speed (2026-11-07, 1440x1080, 960 frames in 8 parallel shots): 0.3-0.56 s/frame with Synty scenes, about 2.2 min of
  Modal time, ~3 min round trip; the same 32 s takes ~35 min on the 2-core workspace CPU.

## Demo: the duel move (`shot=duel`, 9:16)
Owner's idea (2026-11-07): a 9:16 video that opens as a 16:9 band, over the hero's shoulder; a dolly zoom carries the
camera through his hat into his eyes while the black bars open to full screen. Only the two duelists are sharp.
- Render 1080x1920, 168 frames (job shot `["DUEL",168,"shot=duel t0=0","1080x1920"]`). Hold 0–1.2 s, push 1.2–3.4 s,
  POV to 5.6 s. FOV = 2·atan(k/d) keeps the opponent's size; far DOF tracks the opponent's distance + 1 m.
- At z < 0.42 the hero turns shadows-only, so his long shadow (low sun behind-right) points at the opponent in POV.
- Bars added afterwards (band = 608 px of 1920; bars open 1.4–3.4 s, smoothstep):
  `color=black:s=1080x656[k];[0:v][k]overlay=y='-656*P':eval=frame` and the mirror at `y='H-656+656*P'`,
  with P = smoothstep(clip((t-1.4)/2,0,1)). Sound: tools/duel_sfx.py.
