#!/bin/bash
# Moved to the shared kit: scripts/kit/qa/clearance (README.md there). Same options as before.
exec bash "$(dirname "$0")/../../../kit/qa/clearance/run.sh" --film hongmen "$@"
