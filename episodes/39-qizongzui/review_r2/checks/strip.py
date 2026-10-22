# consecutive-frame strip: strip.py VIDEO OUT.png START_FRAME COUNT [cols]
import subprocess, sys
from PIL import Image, ImageDraw, ImageFont
V,OUT,S,N=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]); C=int(sys.argv[5]) if len(sys.argv)>5 else 4
W,H=480,270
font=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',20)
cmd=['ffmpeg','-v','error','-ss',f'{max(0,S/30-1):.3f}','-i',V,'-ss',f'{S/30-max(0,S/30-1):.4f}','-frames:v',str(N),'-vf',f'scale={W}:{H}','-f','rawvideo','-pix_fmt','rgb24','-']
raw=subprocess.run(cmd,capture_output=True).stdout
rows=(N+C-1)//C
sheet=Image.new('RGB',(C*W,rows*(H+28)),'#111'); d=ImageDraw.Draw(sheet)
for k in range(N):
    b=raw[k*W*H*3:(k+1)*W*H*3]
    if len(b)<W*H*3: break
    im=Image.frombytes('RGB',(W,H),b)
    x,y=(k%C)*W,(k//C)*(H+28)
    sheet.paste(im,(x,y)); d.text((x+6,y+H+2),f'f{S+k}  {(S+k)/30:.3f}s',font=font,fill='#f6cf78')
sheet.save(OUT)
