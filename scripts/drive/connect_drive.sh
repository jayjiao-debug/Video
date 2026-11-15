#!/bin/bash
# One-time Google Drive sign-in for the render/delivery workflows. Run it on a computer with a browser (the Mac mini):
#   bash <(curl -fsSL https://raw.githubusercontent.com/jayjiao-debug/Video/claude/original-short-film-nhwy85/scripts/drive/connect_drive.sh)
# It installs rclone if needed, opens Google's sign-in page, and puts the resulting token into the repo secret
# RCLONE_DRIVE_TOKEN with the GitHub CLI. Without the GitHub CLI it copies the token to the clipboard and opens the
# page where you paste it. The token never goes into a file, the repo or a chat.
# Scope drive.file: rclone can only see and change the files and folders it creates itself, nothing else in your Drive.
set -euo pipefail
REPO=jayjiao-debug/Video
SECRET=RCLONE_DRIVE_TOKEN
BLOB=eyJzY29wZSI6ImRyaXZlLmZpbGUifQ     # base64 of {"scope":"drive.file"}

if ! command -v rclone >/dev/null; then
  echo "Installing rclone..."
  if command -v brew >/dev/null; then brew install rclone
  else curl -fsSL https://rclone.org/install.sh | sudo bash; fi
fi

echo
echo "A Google sign-in page opens in your browser. Pick the Google account whose Drive should hold the films,"
echo "then click Allow. Come back here when the page says Success."
echo
out=$(rclone authorize drive "$BLOB")
tok=$(printf '%s\n' "$out" | sed -n '/--->/,/<---/p' | sed '1d;$d' | tr -d '\r\n')
[ -n "$tok" ] || { echo "Sign-in did not finish. Run the command again."; exit 1; }

if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  printf '%s' "$tok" | gh secret set "$SECRET" -R "$REPO"
  echo
  echo "Done. Saved as the secret $SECRET in $REPO. The next delivery uploads to Google Drive."
else
  printf '%s' "$tok" | pbcopy 2>/dev/null || printf '%s' "$tok" | xclip -selection clipboard 2>/dev/null || {
    echo "Could not copy to the clipboard. Install the GitHub CLI (brew install gh; gh auth login) and run this again."; exit 1; }
  url="https://github.com/$REPO/settings/secrets/actions/new"
  echo
  echo "The token is on your clipboard. On the page that opens now:"
  echo "  Name:   $SECRET"
  echo "  Secret: paste (Cmd+V), then click Add secret"
  open "$url" 2>/dev/null || xdg-open "$url" 2>/dev/null || echo "Open $url"
fi
