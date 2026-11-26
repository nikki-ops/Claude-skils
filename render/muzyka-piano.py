# Тихая спокойная музыка (своя, синтез numpy): мягкое «пианино»/музыкальная шкатулка, без гула и ударных.
#   python3 render/muzyka-piano.py out.wav 20.9
import numpy as np, wave, sys
SR=44100;DUR=float(sys.argv[2]);N=int(SR*DUR);mix=np.zeros(N)
hz=lambda m:440*2**((m-69)/12)
def note(m,t0,v=.25,dec=2.2):
    n=int(SR*3.5);t=np.arange(n)/SR;f=hz(m)
    w=(np.sin(2*np.pi*f*t)+.35*np.sin(2*np.pi*2*f*t)*np.exp(-t*3)+.12*np.sin(2*np.pi*3*f*t)*np.exp(-t*6))*np.exp(-t/dec)*np.minimum(1,t/.006)*v
    s=int(t0*SR);e=min(N,s+n)
    if s<N: mix[s:e]+=w[:e-s]
B=60/72  # 72 BPM
# 0–6.7: спокойный минор (Am–F), блэкаут 6.7–13.3: редкие ноты, 13.3 окно: одна светлая нота, 16.9: мажор (C–G–Am–F) светлее
t=0;ch=[[57,60,64,69],[53,57,60,65]]
while t<6.6:
    c=ch[int(t/(4*B))%2]
    for k,m in enumerate([c[0],c[2],c[1],c[3],c[2],c[1]]):
        if t+k*B*.66<6.6: note(m+12,t+k*B*.66,.18)
    note(c[0]-12,t,.16,3);t+=4*B
for t0,m in [(7.4,76),(9.2,72),(11.0,69)]: note(m,t0,.12,2.8)
note(81,13.3,.22,3.2);note(76,13.9,.14,3)
t=16.9;maj=[[60,64,67,72],[55,59,62,67],[57,60,64,69],[53,57,60,65]];i=0
while t<DUR-.4:
    c=maj[i%4]
    for k,m in enumerate([c[0],c[1],c[2],c[3],c[2],c[1]]):
        if t+k*B*.5<DUR-.3: note(m+12,t+k*B*.5,.2)
    note(c[0]-12,t,.18,3);t+=3*B;i+=1
# лёгкое эхо вместо реверба
out=mix.copy()
for d,g in[(.23,.32),(.41,.2),(.67,.12)]:
    k=int(d*SR);out[k:]+=mix[:-k]*g
out*=np.minimum(1,np.arange(N)/(SR*.6))*np.minimum(1,(N-np.arange(N))/(SR*.6))
out=out/np.max(np.abs(out))*.8;st=np.stack([out,np.roll(out,int(SR*.015))],1)
with wave.open(sys.argv[1],'w') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype('<i2').tobytes())
