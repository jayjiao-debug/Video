#!/bin/bash
# Type-check Arthur film files: bash scripts/arthur/tsc.sh src/videos/arthur/shots/segA.ts [more files]
# Prints only the errors that are in src/videos/arthur (errors from the kits / n8ao are known and ignored).
cd "$(dirname "$0")/../.."
timeout 240 npx tsc --noEmit --ignoreConfig --skipLibCheck --jsx react-jsx --target es2020 --moduleResolution bundler --module esnext --strict --esModuleInterop "$@" 2>&1 | grep "src/videos/arthur" | grep -v "n8ao" | head -60
echo "tsc done (no lines above = clean)"
