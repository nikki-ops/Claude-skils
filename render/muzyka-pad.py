# Мягкая тёмная подложка без ударных (своя музыка, синтез numpy). python3 render/muzyka-pad.py out.wav [сек]
import numpy as np, wave, sys
SR=44100; dur=float(sys.argv[2]) if len(sys.argv)>2 else 34; N=int(SR*dur); t=np.arange(N)/SR
hz=lambda m:440*2**((m-69)/12)
prog=[45,41,48,43]; bar=60/100*8   # Am F C G, по 4,8 с
mix=np.zeros(N)
for i in range(int(dur/bar)+1):
    s=int(i*bar*SR); e=min(N,int((i+1.4)*bar*SR))
    if s>=N: break
    tt=np.arange(e-s)/SR; r=prog[i%4]
    env=np.minimum(1,tt/1.5)*np.minimum(1,(e-s-np.arange(e-s))/SR/1.5)
    ch=[r,r+(4 if i%4 in(1,2,3) else 3),r+7,r+12]
    for n in ch:
        for det in(-.15,.15):
            mix[s:e]+=np.sin(2*np.pi*hz(n)*(1+det/100)*tt+np.sin(2*np.pi*.2*tt)*.6)*env*.05
    mix[s:e]+=np.sin(2*np.pi*hz(r-12)*tt)*env*.08   # низкий гул
k=np.ones(400)/400; mix=np.convolve(mix,k,'same')    # мягкий фильтр
mix*=1+.6*np.clip((t-dur+8)/8,0,1)                   # нарастание к финалу
mix*=np.minimum(1,t/2)*np.minimum(1,(dur-t)/1.5)
mix=mix/np.max(np.abs(mix))*.8
st=np.stack([mix,np.roll(mix,int(SR*.02))],1)
with wave.open(sys.argv[1],'w') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype('<i2').tobytes())
