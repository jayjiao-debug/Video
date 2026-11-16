#!/bin/bash
# Moved to the shared kit: scripts/kit/tsc.sh (now also reports errors in src/kit). Same arguments as before.
exec bash "$(dirname "$0")/../kit/tsc.sh" --film hongmen "$@"
