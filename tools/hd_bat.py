#!/usr/bin/env python3
"""Write the owner's preferred HD hand-off: a Windows .bat that downloads the master's parts from a public
deliver-<id> branch (no GitHub login, no SMS), joins them and checks the MD5.

Owner, 2026-10-21: "i cannot receive SMS atm, can you give me a bat file to assemble here on laptop,
actually that would be my priority pick from now on". Use this instead of (or before) the Actions-artifact link.

usage: hd_bat.py <deliver-branch> <parts-dir> <out-name.mp4> <md5> <bat-path>
  e.g. hd_bat.py deliver-sisyphus parts Sisyphus_v3.1_HD.mp4 c69a36... out/get_Sisyphus_v3.1_HD.bat
The parts must already be pushed to <deliver-branch> under <parts-dir>/master.mp4.partNN (split -b 45M -d).
Keep the output name and everything in the .bat ASCII: cmd mangles non-ASCII text in .bat files.
"""
import sys
from pathlib import Path

REPO = 'jayjiao-debug/Video'


def main():
    branch, parts_dir, out_name, md5, bat = sys.argv[1:6]
    assert out_name.isascii(), 'keep the output file name ASCII (cmd mangles non-ASCII in .bat files)'
    # part names from the branch's parts list are passed implicitly: count them from the local split
    local = sorted(Path(parts_dir).glob('master.mp4.part*'))
    names = [p.name[-2:] for p in local] or ['00']
    base = f'https://raw.githubusercontent.com/{REPO}/{branch}/{parts_dir}'
    parts = ' '.join(names)
    join = ' + '.join(f'"master.mp4.part{n}"' for n in names)
    dels = ' '.join(f'"master.mp4.part{n}"' for n in names)
    text = f'''@echo off
setlocal
rem HD master: download {len(names)} parts from GitHub (no login), join, verify. Needs Windows 10 or newer.
cd /d "%~dp0"
set "BASE={base}"
set "OUT={out_name}"
set "MD5={md5}"

echo Downloading {len(names)} parts...
for %%P in ({parts}) do (
  echo   part %%P
  curl.exe -L --fail --retry 3 --progress-bar -o "master.mp4.part%%P" "%BASE%/master.mp4.part%%P"
  if errorlevel 1 goto :fail
)

echo Joining...
copy /b {join} "%OUT%" >nul
if errorlevel 1 goto :fail

echo Checking the file is identical to the master...
certutil -hashfile "%OUT%" MD5 | findstr /i /c:"%MD5%" >nul
if errorlevel 1 goto :badmd5

del {dels}
echo.
echo Done: %CD%\\%OUT%
echo Upload this file to Douyin.
pause
exit /b 0

:badmd5
echo.
echo The joined file does not match the master (MD5 mismatch). Run this file again.
pause
exit /b 1

:fail
echo.
echo A download or the join failed. Check your connection and run this file again.
pause
exit /b 1
'''
    assert text.isascii()
    Path(bat).write_bytes(text.replace('\n', '\r\n').encode('ascii'))
    print(bat)


if __name__ == '__main__':
    main()
