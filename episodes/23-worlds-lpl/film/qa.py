import subprocess,numpy as np,sys,json
f=sys.argv[1]
p=subprocess.run(['ffmpeg','-v','error','-i',f,'-vf','scale=96:54,format=gray','-f','rawvideo','-'],capture_output=True)
a=np.frombuffer(p.stdout,np.uint8).reshape(-1,54,96).astype(float);m=a.mean((1,2));n=len(m)
d=np.diff(m);flick=[(i,round(d[i-1],1),round(d[i],1)) for i in range(1,len(d)) if abs(d[i-1])>6 and abs(d[i])>6 and np.sign(d[i-1])!=np.sign(d[i])]
black=[i for i in range(n) if m[i]<12];white=[i for i in range(n) if m[i]>235]
jumps=[(i/30,round(d[i],1)) for i in range(len(d)) if abs(d[i])>18]
print(json.dumps({'frames':n,'mean_luma':round(m.mean(),1),'min':round(m.min(),1),'flicker':flick[:10],'n_flicker':len(flick),'black':len(black),'white':len(white),'jumps':jumps[:15]}))
