# Sourced by the kit's shell tools: finds the repo and the film's kit.json.
#   kit_film_args "$@"  -> sets KIT_REPO, KIT_CONFIG (absolute path of the film's kit.json) and KIT_ARGS (the remaining
#                         arguments), from --film <name> (src/videos/<name>/kit.json) or --config <path>
#   kit_cfg <key.path> [default]  -> one value of the config ("" / the default when it is missing; lists space-joined)
KIT_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
kit_film_args() {
  KIT_CONFIG=""; KIT_ARGS=()
  while [ $# -gt 0 ]; do
    case "$1" in
      --film) KIT_CONFIG="$KIT_REPO/src/videos/$2/kit.json"; shift 2;;
      --film=*) KIT_CONFIG="$KIT_REPO/src/videos/${1#--film=}/kit.json"; shift;;
      --config) KIT_CONFIG="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"; shift 2;;
      --config=*) c="${1#--config=}"; KIT_CONFIG="$(cd "$(dirname "$c")" && pwd)/$(basename "$c")"; shift;;
      *) KIT_ARGS+=("$1"); shift;;
    esac
  done
  [ -n "$KIT_CONFIG" ] || { echo "say which film: --film <name> (src/videos/<name>/kit.json) or --config <kit.json>" >&2; return 2; }
  [ -f "$KIT_CONFIG" ] || { echo "no film config at $KIT_CONFIG (KIT.md: starting a new film)" >&2; return 2; }
  export KIT_CONFIG
}
kit_cfg() {
  python3 -c 'import json,sys
v=json.load(open(sys.argv[1]))
for k in sys.argv[2].split("."):
    v=v.get(k) if isinstance(v,dict) else None
if v is None: v=sys.argv[3] if len(sys.argv)>3 else ""
print(" ".join(map(str,v)) if isinstance(v,list) else v)' "$KIT_CONFIG" "$@"
}
