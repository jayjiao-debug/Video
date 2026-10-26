# mega-farm
Uploads finished masters to MEGA from GitHub Actions. Push a new request.json (new `id` each time):
`branch` + `parts_dir` (a delivery branch with master.mp4.partNN) or `file`, the target `name`, an optional `md5`, and the MEGA folder `dest`.
Needs two repo secrets, set by the owner: MEGA_EMAIL and MEGA_PASSWORD. Results: branch mega-output, out/<id>/run.txt.
Note: rclone cannot log in to a MEGA account with two-factor login turned on.
