# pick.py VIDEO OUT.png t1,t2,...  [cols] [width]  -> labelled grid of single frames at given times
import subprocess, sys
from PIL import Image, ImageDraw, ImageFont
V,OUT,TS=sys.argv[1],sys.argv[2],[float(x) for x in sys.argv[3].split(',')]
C=int(sys.argv[4]) if len(sys.argv)>4 else 4; W=int(sys.argv[5]) if len(sys.argv)>5 else 480; H=W*9//16
font=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',20)
rows=(len(TS)+C-1)//C
sheet=Image.new('RGB',(C*W,rows*(H+28)),'#111'); d=ImageDraw.Draw(sheet)
for k,t in enumerate(TS):
    f=int(round(t*30))
    raw=subprocess.run(['ffmpeg','-v','error','-ss',f'{f/30+0.001:.4f}','-i',V,'-frames:v','1','-vf',f'scale={W}:{H}','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
    im=Image.frombytes('RGB',(W,H),raw[:W*H*3])
    x,y=(k%C)*W,(k//C)*(H+28); sheet.paste(im,(x,y)); d.text((x+6,y+H+2),f'f{f}  {f/30:.3f}s',font=font,fill='#f6cf78')
sheet.save(OUT)
