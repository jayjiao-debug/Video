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
