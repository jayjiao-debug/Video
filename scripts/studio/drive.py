"""Google Drive hand-over: copy a delivery into the Google Drive for desktop folder on the Mac and read back its link.

Drive for desktop syncs everything under ~/Library/CloudStorage/GoogleDrive-<account>/My Drive. The studio copies a
finished delivery into its channel's folder,  My Drive/<channel>/<film>/<version>/,  and waits for Drive to give the files their Drive
ids (an extended attribute Drive for desktop sets once a file is uploaded), then writes the links into delivery.json.
The links open for the Drive's own account (phone, laptop); sharing them wider is a separate, deliberate step.

    studio drive status                     where the Drive folder is, and whether it is reachable
    studio drive push newton --version v7   copy an existing delivery into Drive (deliver does this by itself)
    studio drive link <file or folder>      print the Drive link of something inside the Drive folder

Channels are kept apart by the film's language: Chinese films (抖音, Juno) go in My Drive/Juno/, English films
(YouTube, TinyEurekaFilms) in My Drive/TinyEurekaFilms/. A film config can override with
"drive": {"zh": "Juno", "en": "TinyEurekaFilms"}. STUDIO_DRIVE=<folder> puts films straight in that folder;
STUDIO_DRIVE=off keeps films local only.
Python 3.9 compatible.
"""
import glob, os, shutil, subprocess, sys, time

HOME = os.path.expanduser("~")
CHANNELS = {"zh": "Juno", "en": "TinyEurekaFilms"}   # language -> channel folder in My Drive
ID_ATTRS = ("com.google.drivefs.item-id#S", "com.google.drivefs.item-id")
MYDRIVE_NAMES = ("My Drive", "我的云端硬盘", "我的雲端硬碟")


def my_drive():
    for acct in sorted(glob.glob(os.path.join(HOME, "Library", "CloudStorage", "GoogleDrive-*"))):
        for n in MYDRIVE_NAMES:
            if os.path.isdir(os.path.join(acct, n)):
                return os.path.join(acct, n)
    return None


def channel_of(lang, channels=None):
    ch = dict(CHANNELS); ch.update(channels or {})
    return ch.get(lang) or ch["zh"]   # Juno is the default channel


def root(lang="zh", channels=None):
    """the channel folder a film in this language goes into, or None when there is no Drive (or STUDIO_DRIVE=off)"""
    env = os.environ.get("STUDIO_DRIVE")
    if env:
        return None if env.lower() in ("off", "no", "0", "none") else os.path.expanduser(env)
    md = my_drive()
    return os.path.join(md, channel_of(lang, channels)) if md else None


def item_id(path):
    """the Drive id of a file or folder inside the Drive folder, or None while it is still uploading"""
    if sys.platform != "darwin":
        return None
    for attr in ID_ATTRS:
        r = subprocess.run(["xattr", "-p", attr, path], capture_output=True, text=True)
        v = r.stdout.strip()
        if r.returncode == 0 and v and not v.startswith("local"):
            return v
    return None


def link_of(path, iid=None):
    iid = iid or item_id(path)
    if not iid:
        return None
    if os.path.isdir(path):
        return f"https://drive.google.com/drive/folders/{iid}"
    return f"https://drive.google.com/file/d/{iid}/view"


def wait_links(paths, timeout=900, every=10, log=print):
    """wait until Drive has uploaded each path (it has an id); returns {path: link or None}"""
    out = {p: None for p in paths}
    t0 = time.time()
    while True:
        for p in paths:
            if not out[p]:
                out[p] = link_of(p)
        left = [p for p in paths if not out[p]]
        if not left or time.time() - t0 > timeout:
            break
        if int(time.time() - t0) % 60 < every:
            log(f"Drive: still uploading {len(left)} of {len(paths)} ({int(time.time() - t0)} s)")
        time.sleep(every)
    return out


def _copy(src, dst):
    """copy under a temporary name and rename, so Drive never uploads a half-written file"""
    tmp = dst + ".part"
    shutil.copyfile(src, tmp)
    os.replace(tmp, dst)


def push(local_dir, film, tag, lang="zh", channels=None, timeout=None, log=print):
    """copy a delivery folder into its channel's Drive folder; returns Drive paths and links (None while uploading)"""
    r = root(lang, channels)
    if not r:
        return None
    if timeout is None:
        timeout = int(os.environ.get("STUDIO_DRIVE_WAIT", "900"))
    dest = os.path.join(r, film, tag)
    os.makedirs(dest, exist_ok=True)
    for dp, dn, fn in os.walk(local_dir):
        rel = os.path.relpath(dp, local_dir)
        os.makedirs(os.path.join(dest, rel), exist_ok=True)
        for f in fn:
            if f == ".DS_Store": continue
            _copy(os.path.join(dp, f), os.path.normpath(os.path.join(dest, rel, f)))
    vm = os.path.join(os.path.dirname(local_dir), "versions.md")
    if os.path.exists(vm):
        _copy(vm, os.path.join(r, film, "versions.md"))
    log(f"Drive: copied to {dest}; waiting for the upload (up to {timeout // 60} min)")
    base = f"{film}_{tag}"
    want = [p for p in (dest, os.path.join(dest, f"{base}_hd.mp4"), os.path.join(dest, f"{base}_phone.mp4")) if os.path.exists(p)]
    links = wait_links(want, timeout=timeout, log=log)
    res = {"channel": os.path.basename(r), "drive_path": dest, "folder": links.get(dest),
           "hd": links.get(os.path.join(dest, f"{base}_hd.mp4")), "phone": links.get(os.path.join(dest, f"{base}_phone.mp4"))}
    if all(links.values()):
        log(f"Drive: uploaded. Folder {res['folder']}")
    else:
        log("Drive: not every file has finished uploading yet; it carries on in the background. "
            f"Get the links later with: studio drive link \"{dest}\"")
    return res


def status():
    r = root("zh")
    print(f"My Drive      {os.path.dirname(r) if r else 'not found (is Google Drive for desktop installed and signed in?)'}")
    if not r:
        return 1
    parent = os.path.dirname(r)
    print(f"reachable     {'yes' if os.path.isdir(parent) else 'NO'}")
    for lang in ("zh", "en"):
        c = root(lang)
        print(f"{lang} films     {c}: " + ((link_of(c) or "not uploaded yet") if os.path.isdir(c) else "made on the first delivery"))
    try:
        u = shutil.disk_usage(parent)
        print(f"space         {u.free / 1e9:.0f} GB free of {u.total / 1e9:.0f} GB (as Drive reports it)")
    except OSError:
        pass
    running = subprocess.run(["pgrep", "-f", "Google Drive"], capture_output=True).returncode == 0
    print(f"Drive app     {'running' if running else 'NOT running (open Google Drive)'}")
    return 0


def main(argv):
    if not argv or argv[0] in ("status", "-h", "--help"):
        if argv and argv[0] in ("-h", "--help"):
            print(__doc__); return 0
        return status()
    if argv[0] == "link":
        rc = 0
        for p in argv[1:]:
            l = link_of(os.path.abspath(p))
            print(f"{l or 'not uploaded yet'}  {p}")
            rc |= 0 if l else 1
        return rc
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
