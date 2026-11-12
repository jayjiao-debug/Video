#!/bin/bash
# THE CUT of the Hongmen film on this machine (no farm): /home/user/hm_work/final/hongmen_cut.mp4
#   540 x 960, 30 fps, every frame of the film, H.264 yuv420p crf 18 +faststart, with the sound mix.
# Read scripts/hongmen/cut/README.md (or /home/user/hm_notes/x_cut.md) for what it does and how it looks.
#
#   bash scripts/hongmen/cut/make_cut.sh --bg                    the whole film, in the background (resumes; safe to
#                                                                start while segments still change: run it again later
#                                                                and only what changed is rendered again)
#   tail -f /home/user/hm_work/final/log/cut.log                 its progress;  /home/user/hm_work/final/log/cut.done = finished (holds the exit code)
#   bash scripts/hongmen/cut/make_cut.sh --status                what is current / stale / missing, nothing rendered
#   bash scripts/hongmen/cut/make_cut.sh --bg --from 0 --to 117  a range -> hongmen_cut_0-117.mp4 (with its piece of the sound)
#   ... --force                                                  render the range again whatever the manifest says
#   ... --only ov                                                only the overlay layer (also: pic | compose | sound | mux, comma separated)
#   ... --only compose,sound,mux                                 no rendering: lay the layers together, rebuild the mix, mux
#                                                                (may run BESIDE a render run; with --bg its files are
#                                                                log/compose.log, compose.done, compose.pid)
#   ... --only sound,mux                                         only the sound: rebuild the mix and mux it onto the silent picture
#   ... --size 1080x1920                                         the picture rendered at film size and averaged down (the
#                                                                film's own sampling; about 4x the time: 6 s a frame)
#   ... --freeze                                                 FIRST copy the sources (src/, scripts/hongmen/) to
#                                                                /home/user/hm_work/final/snap and render from that copy:
#                                                                one consistent state of the film, however long the
#                                                                render takes and whoever saves a file meanwhile
#   ... --frozen                                                 go on from the copy that is there (resume; no new copy)
#   ... --jobs 3                                                 picture chunks waiting in the render queue at a time (default 2)
#   ... --priority                                               picture chunks enter the queue with cost 0 (the director's call)
#   bash scripts/hongmen/cut/make_cut.sh --stop                  stop a background run (the frames made so far are kept)
# Without --bg it runs in the foreground (shell commands here are cut off after ~120 s: use --bg for anything real).
# Every render goes through the machine's lock in jobs of at most about 90 s (the picture through
# /home/user/hm_tools/still.sh, the overlays through /home/user/hm_tools/q.sh: both the machine-wide render queue), so
# other people's stills get in between. Set HM_RENDER_COST (tenths of a second, e.g. 0) to move the cut's jobs forward.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
FINAL="${HM_CUT_DIR:-/home/user/hm_work/final}"
export NODE_PATH="${NODE_PATH:-/opt/node22/lib/node_modules}"
export PYTHONDONTWRITEBYTECODE=1      # no __pycache__ in the repo
mkdir -p "$FINAL/log"
LOG="$FINAL/log/cut.log"; DONE="$FINAL/log/cut.done"; PIDF="$FINAL/log/cut.pid"
SNAP="$FINAL/snap"
bg=0; args=(); freeze=""
for a in "$@"; do
  case "$a" in
    --bg) bg=1;;
    --freeze) freeze=new;;
    --frozen) freeze=keep;;
    --stop)
      if [ -f "$PIDF" ] && kill -0 -- "-$(cat "$PIDF")" 2>/dev/null; then
        pid=$(cat "$PIDF"); kill -TERM -- "-$pid" 2>/dev/null      # the run is its own process group: the driver and its render job
        echo "stopped (process group $pid); frames made so far are kept"
      else echo "no background run"; fi
      exit 0;;
    *) args+=("$a");;
  esac
done
# ---- the frozen copy: the same scripts run from $SNAP, where "the repo" is the copy (node_modules and public are links)
if [ -n "$freeze" ]; then
  case "$HERE" in "$SNAP"/*) echo "this is the frozen copy's own script: run the repo's make_cut.sh"; exit 2;; esac
  REPO="$(cd "$HERE/../../.." && pwd)"
  if [ "$freeze" = new ]; then
    mkdir -p "$FINAL/build"; touch "$FINAL/build/cut.lock"
    flock -n "$FINAL/build/cut.lock" true || { echo "a cut is running: stop it first (make_cut.sh --stop), or go on with --frozen"; exit 3; }
    ok=0
    for try in 1 2 3 4 5 6 7 8; do
      rm -rf "$SNAP.new"; mkdir -p "$SNAP.new/scripts"
      cp -a "$REPO/src" "$SNAP.new/src"; cp -a "$REPO/scripts/hongmen" "$SNAP.new/scripts/hongmen"
      cp "$REPO/package.json" "$REPO/tsconfig.json" "$SNAP.new/"
      ln -s "$REPO/node_modules" "$SNAP.new/node_modules"; ln -s "$REPO/public" "$SNAP.new/public"
      date -u +%FT%TZ > "$SNAP.new/FROZEN_AT"; echo "$REPO" > "$SNAP.new/FROZEN_FROM"
      out=$(cd "$SNAP.new" && HM_CUT_REPO="$SNAP.new" node "$HERE/deps.mjs" "$FINAL/build/deps_freeze.json" 2>&1)
      if echo "$out" | grep -q "cannot be built\|deps.mjs failed\|? frames"; then
        echo "freeze: the sources do not build right now (somebody is mid-edit); again in 15 s"; echo "$out" | grep "cannot be built" | head -2; sleep 15
      else ok=1; break; fi
    done
    [ $ok = 1 ] || { echo "freeze: the sources did not build in 8 tries; nothing frozen"; rm -rf "$SNAP.new"; exit 1; }
    rm -rf "$SNAP.old"; [ -d "$SNAP" ] && mv "$SNAP" "$SNAP.old"; mv "$SNAP.new" "$SNAP"; rm -rf "$SNAP.old"
    echo "frozen: $SNAP = the sources as of $(cat "$SNAP/FROZEN_AT")  ($out)"
  fi
  [ -f "$SNAP/FROZEN_AT" ] || { echo "no frozen copy at $SNAP: use --freeze"; exit 2; }
  export HM_CUT_REPO="$SNAP"       # the film is read from the copy; the driver (this folder) is always the live one
fi
# a run that renders nothing (--only without pic and ov: a clip of a range, the sound again) may go beside a render
# run: it gets its own log, pid and done files, so that it never touches the render run's
render=1; prev=""
for a in "${args[@]:-}"; do
  if [ "$prev" = "--only" ]; then case ",$a," in *,pic,*|*,ov,*) ;; *) render=0;; esac; fi
  prev="$a"
done
if [ $render = 0 ]; then LOG="$FINAL/log/compose.log"; DONE="$FINAL/log/compose.done"; PIDF="$FINAL/log/compose.pid"; fi
if [ $bg = 1 ]; then
  rm -f "$DONE"
  echo "==== $(date -u +%FT%TZ) make_cut.sh ${args[*]:-}" >> "$LOG"
  setsid nohup bash -c 'python3 "$0" "$@"; echo $? > "'"$DONE"'"' "$HERE/cut.py" "${args[@]}" >> "$LOG" 2>&1 < /dev/null &
  echo $! > "$PIDF"
  echo "started in the background (process group $!)"
  echo "progress:  tail -f $LOG"
  echo "finished:  $DONE appears (it holds the exit code; 0 = the mp4 is written)"
  exit 0
fi
exec python3 "$HERE/cut.py" "${args[@]}"
