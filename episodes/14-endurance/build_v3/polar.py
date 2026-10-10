import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
im=Image.open('tex/bm21600.jpg');W,H=im.size
r0=int((90+26)/180*H);src=np.asarray(im.crop((0,r0,W,H)));print(src.shape)
LON0=-45.0;X0,X1,Y0,Y1=-0.32,0.32,-0.08,0.44;OW=4096;OH=int(OW*(Y1-Y0)/(X1-X0))
xs=np.linspace(X0,X1,OW);ys=np.linspace(Y1,Y0,OH);X,Y=np.meshgrid(xs,ys)
r=np.hypot(X,Y);c=2*np.degrees(np.arctan(r));lat=-(90-c);lon=LON0+np.degrees(np.arctan2(X,Y))
lon=(lon+180)%360-180
u=((lon+180)/360*W).astype(np.int64)%W;v=((90-lat)/180*H).astype(np.int64)-r0;v=np.clip(v,0,src.shape[0]-1)
out=src[v,u];Image.fromarray(out).save('tex/ant_polar.jpg',quality=92);print(OW,OH)
Image.fromarray(out).resize((1024,int(1024*OH/OW))).save('ant_small.jpg')
