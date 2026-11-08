#!/bin/bash
# Fetch the WebXR generic hand (W3C Software and Document License) and three.js r160 into this folder (not committed),
# then serve it: python3 -m http.server 8765 --bind 127.0.0.1  (hand.html needs http for ES modules).
set -e
cd "$(dirname "$0")"
[ -f right.glb ] || { git clone -q --depth 1 --filter=blob:none --sparse https://github.com/immersive-web/webxr-input-profiles /tmp/wip_hands && (cd /tmp/wip_hands && git sparse-checkout set packages/assets/profiles/generic-hand) && cp /tmp/wip_hands/packages/assets/profiles/generic-hand/*.glb .; }
[ -d node_modules/three ] || { npm init -y >/dev/null; npm i three@0.160.0 --silent; }
ln -sfn /dev/shm/shz01/film/assets assets
echo ready
