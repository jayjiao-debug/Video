import subprocess, sys, numpy as np
from PIL import Image, ImageDraw
V='/tmp/claude-0/-home-claude/7db4c2b1-160e-5062-86b7-9eb552e585fb/scratchpad/out45/ep45_film_v1.mp4'
def strip(name, times, cols=6):
    ims=[]
    for t in times:
        p=f'fr/{t:.3f}.png'
        subprocess.run(['ffmpeg','-loglevel','error','-y','-ss',str(t),'-i',V,'-frames:v','1','-vf','scale=480:-1',p])
        im=Image.open(p).convert('RGB'); d=ImageDraw.Draw(im); d.rectangle([0,0,90,22],fill=(0,0,0)); d.text((4,4),f'{t:.2f}',fill=(255,255,0)); ims.append(im)
    w,h=ims[0].size; rows=(len(ims)+cols-1)//cols
    S=Image.new('RGB',(w*cols,h*rows))
    for i,im in enumerate(ims): S.paste(im,((i%cols)*w,(i//cols)*h))
    S.save(f'/home/claude/video/episodes/45-mashou/review/v1/music_strip_{name}.png')
strip('title',[16.9,17.4,17.55,17.65,17.75,17.85,17.95,18.05,18.10,18.13,18.2,18.4])
strip('pause',[104.8,105.25,105.35,105.6,106.0,106.5,106.9,107.2,108.5,110.3,110.45,112.0])
strip('drop',[113.2,114.6,114.75,115.5,115.9,116.0,116.07,116.15,116.3,116.6,117.5,118.9])
strip('coda',[123.5,124.8,125.05,125.12,125.3,126,135.6,136.1,136.8,137.5,137.8,138.4])
strip('final',[144.6,146.2,146.7,146.8,146.85,146.95,147.2,148.5,150.7,150.85,152.5,154.0])
strip('misc',[41.6,41.75,41.9,63.9,64.0,64.2,88.8,88.9,89.1,75.2,75.35,79.3])
