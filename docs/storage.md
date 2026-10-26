# Storage (owner, 2026-10-26)
- **Long-term home for finished masters: MEGA** (owner's account; secrets MEGA_EMAIL / MEGA_PASSWORD in the repo's Actions secrets, never in files or chat).
- **How to upload:** push a request.json to the `mega-farm` branch:
  `{"id": "<new id>", "branch": "deliver-<slug>", "parts_dir": "parts", "name": "<片名>_vN_HD.mp4", "md5": "...", "dest": "VIBE知识大赏/epNN <短名>"}`
  The runner joins the parts, checks the md5 and uploads with rclone. The report is at mega-output:out/<id>/run.txt.
- **Workspace = scratch.** After the owner confirms a film is final and it is on MEGA, delete its renders and frames; keep only code and scripts in git.
- **Uploaded so far:** ep45 圆明园兽首回来了几个_v2_HD.mp4 (74.8 MB, md5 99f09668…) → VIBE知识大赏/ep45 圆明园兽首.
