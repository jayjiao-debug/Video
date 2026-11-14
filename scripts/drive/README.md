# drive/: finished films go to Google Drive, not into GitHub storage

A finished master (~95 MB) and its phone cut (~23 MB) used to stay on a `deliver-<id>` branch and in an Actions
artifact. Now the delivery workflow also copies them to Google Drive with rclone, checks the md5 of every file
against Drive, and deletes the `deliver-<id>` branch, so the video no longer sits in the repo. The artifact link stays
as the fallback (30 days).

    Google Drive / My Drive / Video Maker films / <id> / <NAME>_高清原片.mp4, <NAME>_手机版.mp4

## One-time sign-in (the owner, on a computer with a browser)

    bash <(curl -fsSL https://raw.githubusercontent.com/jayjiao-debug/Video/claude/original-short-film-nhwy85/scripts/drive/connect_drive.sh)

It installs rclone if needed, opens Google's sign-in page (pick the account, click Allow), and saves the token as the
repo secret `RCLONE_DRIVE_TOKEN` with the GitHub CLI. Without the GitHub CLI it copies the token to the clipboard and
opens the repo's "New secret" page. Never paste the token into a chat, an issue or a file.

The token has the `drive.file` scope: rclone can only see and change what it created (the `Video Maker films`
folder), nothing else in the Drive. To revoke it: Google account > Security > Third-party connections > rclone. To
switch accounts, run the script again (it overwrites the secret).

## How a delivery uses it

`.github/workflows/drive-upload.yml` is a reusable workflow. A `deliver-<id>` branch's workflow uploads its files as
artifacts, then calls it (see the github-hd-delivery skill for the full file):

```yaml
permissions:
  contents: write
jobs:
  package: { ... upload-artifact: <NAME>_高清原片, <NAME>_手机版 ... }
  drive:
    needs: package
    uses: jayjiao-debug/Video/.github/workflows/drive-upload.yml@claude/original-short-film-nhwy85
    with: { artifacts: "<NAME>_*", folder: "<id>", delete_branch: true }
    secrets: inherit
```

The run summary lists the Drive links. If the secret is missing, the drive job passes with a warning and nothing is
deleted, so the artifact link still works. If the md5 check fails, the job fails and the branch is kept.

Farm runs (`render-output-<film>`) are unchanged: they hold the silent picture, which is force-pushed over each time,
and the finished film is muxed locally and delivered as above.
