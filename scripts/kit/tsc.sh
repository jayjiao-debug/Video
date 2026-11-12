#!/bin/bash
# Type-check a film and the shared kit:
#   bash scripts/kit/tsc.sh --film hongmen                      (the entries listed under "tsc" in the film's kit.json)
#   bash scripts/kit/tsc.sh --film hongmen src/videos/hongmen/shots/segA.ts [more files]
#   bash scripts/kit/tsc.sh --kit                               (only src/kit: every file in it)
# Prints only the errors that are in the film's folder or in src/kit (errors from group/kit, bt, vasa and n8ao are
# known and ignored). The root tsconfig.json only includes src/videos/vasa, so a bare `npx tsc` does not see the films.
HERE="$(cd "$(dirname "$0")" && pwd)"
. "$HERE/lib/film.sh"
cd "$KIT_REPO"
if [ "$1" = "--kit" ]; then
  shift; dir=src/kit; files=$(find src/kit -name '*.ts' -o -name '*.tsx'); set -- $files "$@"
else
  kit_film_args "$@" || exit 2
  dir=$(kit_cfg dir)
  set -- "${KIT_ARGS[@]}"
  if [ $# -eq 0 ]; then for e in $(kit_cfg tsc); do set -- "$@" "$dir/$e"; done; fi
  [ $# -gt 0 ] || set -- $(ls "$dir"/*.ts "$dir"/*.tsx 2>/dev/null)
fi
pat="$dir/\|src/kit/"
out=$(timeout 300 npx tsc --noEmit --ignoreConfig --skipLibCheck --jsx react-jsx --target es2020 --moduleResolution bundler --module esnext --strict --esModuleInterop "$@" 2>&1)
echo "$out" | grep "$pat" | grep -v "n8ao" | head -80
n=$(echo "$out" | grep "$pat" | grep -vc "n8ao")
where="$dir"; [ "$dir" = src/kit ] || where="$dir and src/kit"
echo "tsc done: $n error line(s) in $where (0 = clean)"
[ "$n" -eq 0 ]
