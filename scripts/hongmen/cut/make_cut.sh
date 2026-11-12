#!/bin/bash
# Moved to the shared kit: scripts/kit/cut (README.md there). Same options as before.
exec bash "$(dirname "$0")/../../kit/cut/make_cut.sh" --film hongmen "$@"
