# ep63 法老的诅咒 · handoff (2026-11-07)

Start here in a new chat. The owner's direction: 3D story films built from Synty assets that stand out on Douyin and can
still be made often. ep63 is the pilot.

## Where things are
- Production bible (Claude Doc, owner comments there): https://claude.ai/artifact/1c6zGkqyMX4Ypgr7FgW8C2
  - the 15-field scene brief, story map v2 (~4:10, 10 beats, 「诅咒档案」 case-file device), hook briefs 0A–0E,
    hook asset check, 5 open decisions.
- Storyboard canvas (first opening, 8 shots, superseded by the hook): https://claude.ai/artifact/HctpLsBdTgkWkyZfPi1CTU
- Repo files: facts.md (F1–F40, all sourced), script_v2.md (long linear version, lines reused), hook_v1.md (the 14 s
  hook, timings), storyboard_opening.md, godot/ (board.gd = all scenes; README = how to run), tools/hook_sfx.py.

## Status
- Owner approved the process: no 3D build until the scene's brief is approved; every beat raises a new question
  (Douyin 2 s / 5 s swipe rule); readability rule: dark is fine, the subject always has its own key light.
- Waiting on the owner: approve story map v2; then write briefs for beats 1–9 in the bible (one section per beat),
  each with an asset check. Also open: voice picks, a pack with 1920s suits, music source, 巨量算数 check.
- Never publish anything with Synty assets until Synty's written OK on AI-assisted production.

## Rendering on Modal (works, ~3 min round trip for 8 shots)
- Branch `modal-farm`, folder `gd63/`: push `job.json` (`{"id","entry":"gd63/render.py","shots":[[name,frames,"shot=… t0=…"],…]}`)
  plus gd63/project/board.gd; results on `modal-output` under out/<id>/.
- Synty files never go public in the clear: the 66 MB asset subset sits as ciphertext in the Modal Volume `juno-synty`
  (`/assets.tar.sealed`), unlocked inside each GPU container with the private key in the Volume `juno-vault`.
  To change the asset set: tar the assets folder, seal it to gd63/modal_pub.pem (seal() in render.py), push it as
  gd63/vault/assets.tar.sealed, run one job, then remove it from the branch tip.
- Outputs come back sealed to the workspace key gd63/ws_pub.pem. Its private half lived only in the old session's
  container (/root/.juno/ws_rsa.pem): a new session must make a new RSA-4096 pair, keep the private key outside the
  repo, and push the new public key as gd63/ws_pub.pem before the first render.
- Godot on the T4: Vulkan on the NVIDIA driver under Xvfb; swap-chain errors in the log are harmless. 4x MSAA.

## Local (workspace) notes
- Godot 4.5.1 from GitHub releases; software Vulkan needs `mesa-vulkan-drivers` and
  `VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/lvp_icd.json`; ~2 s/frame on the 2-core box.
- Synty packs come from the owner's uploads (they are not in a new chat; ask for them only if a new pack or prop is
  needed). Build an assets folder with `episodes/37-qiqing/remotion/scripts/synty_pub.py` (SYNTY_SRC per pack).
- /dev/shm is wiped on container restarts.

## Voices (voice-farm branch, ElevenLabs, native Mandarin only)
- Placeholders in use: narrator Martin Li `WuLq5z7nEcrhppO0ZQJw`, Weigall Qiao Feng `ZJsn5HnrE3eUbep2ia8D`.
- Other candidates from ep63-vo-test-02: Carnarvon Vincent `WkcRFJo38X9XEP8kGExm`, Carter Xinghe Jiang
  `lt7GBaCoAHWbT7JSZ5Xs`, Corelli Helen Sun `Iqi0ix5WGtiSXX9VDZB4`.
