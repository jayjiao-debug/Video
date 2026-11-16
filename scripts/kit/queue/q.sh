#!/bin/bash
# The machine-wide render queue (scripts/kit/queue/README.md). Usage: q.sh <cost in tenths of a second> <command...>
# Jobs are served by CLASS, then SHORTEST FIRST inside a class (every second of waiting takes 0.2 s off a job's cost).
#   kind "cut"  = the film cut's chunks (command mentions film_cut or cut_overlay, or HM_RENDER_KIND=cut)
#   kind "low"  = measurements and big sheets that can wait (path under /flick/, or a stated cost of 60 s and more)
#   kind "norm" = everything else (animators, set, prop and overlay builders)
# The director's policy file /tmp/hm_render.policy holds one word:
#   "anim-first" (default): norm, then cut, then low        "cut-first": cut, then norm, then low
# The job that is first takes /tmp/hm_render.lock with a blocking flock and runs the command.
cost="$1"; shift
[[ "$cost" =~ ^[0-9]+$ ]] || cost=300
kind=norm
case "$*" in *film_cut*|*cut_overlay*|*ovonly*) kind=cut;; */flick/*) kind=low;; esac
[ "$kind" = norm ] && (( cost >= 600 )) && kind=low
[ -n "$HM_RENDER_KIND" ] && kind=$HM_RENDER_KIND
[ -n "$HM_RENDER_COST" ] && cost=$HM_RENDER_COST
Q=/tmp/hm_render.q; mkdir -p "$Q"
me="$Q/$$"; t0=$(date +%s); echo "$cost $t0 $kind" > "$me"
trap 'rm -f "$me"' EXIT
while :; do
  now=$(date +%s); best=""; bestv=99999999; bestc=9
  pol=$(cat /tmp/hm_render.policy 2>/dev/null)
  for f in "$Q"/*; do
    pid="${f##*/}"
    [ -d "/proc/$pid" ] || { rm -f "$f"; continue; }
    read -r c t k < "$f" 2>/dev/null || continue
    [[ "$c" =~ ^[0-9]+$ && "$t" =~ ^[0-9]+$ ]] || continue
    case "$k" in cut) [ "$pol" = cut-first ] && cl=0 || cl=1;; low) cl=2;; *) [ "$pol" = cut-first ] && cl=1 || cl=0;; esac
    v=$(( c - (now - t) * 2 ))
    if (( cl < bestc )) || { (( cl == bestc )) && (( v < bestv )); } || { (( cl == bestc )) && (( v == bestv )) && (( pid < best )); }; then bestc=$cl; bestv=$v; best=$pid; fi
  done
  if [ "$best" = "$$" ]; then
    flock /tmp/hm_render.lock "$@"
    exit $?
  fi
  sleep 0.7
done
