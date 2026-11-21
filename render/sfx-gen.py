# Свои SFX (синтез numpy): python3 render/sfx-gen.py папка
import numpy as np, wave, sys, os
SR=44100; out=sys.argv[1]; rng=np.random.default_rng(7)
def save(n,x):
    x=x/np.max(np.abs(x))*.9; st=np.stack([x,x],1)
    with wave.open(os.path.join(out,n+'.wav'),'w') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype('<i2').tobytes())
T=lambda d:np.arange(int(SR*d))/SR
lp=lambda x,k:np.convolve(x,np.ones(k)/k,'same')
t=T(1.2); save('boom', np.sin(2*np.pi*(40+120*np.exp(-t*18))*t)*np.exp(-t*3.5)+lp(rng.standard_normal(len(t)),30)*np.exp(-t*8)*.6)
t=T(1.6); f=650+250*np.sin(2*np.pi*1.8*t); save('siren', np.sin(2*np.pi*np.cumsum(f)/SR)*np.minimum(1,t/.1)*np.minimum(1,(1.6-t)/.3)*.6)
t=T(1.4); save('wall', lp(rng.standard_normal(len(t)),60)*np.minimum(1,t/.9)*np.minimum(1,(1.4-t)/.2)+np.sin(2*np.pi*55*t)*.4*np.minimum(1,t/.9)*np.exp(-np.maximum(0,t-1.1)*12))
t=T(.6); save('flag', lp(rng.standard_normal(len(t)),8)*(.5+.5*np.sign(np.sin(2*np.pi*14*t)))*np.exp(-t*4))
t=T(1.0); save('shield', sum(np.sin(2*np.pi*fq*t)*np.exp(-t*k) for fq,k in[(880,4),(1320,6),(2210,9)])+lp(rng.standard_normal(len(t)),4)*np.exp(-t*60)*.5)
t=T(1.5); hits=np.zeros(len(t))
for i,tt in enumerate(np.linspace(0,1.3,26)): s=int(tt*SR); n=int(SR*.06); hits[s:s+n]+=lp(rng.standard_normal(n),6)*np.exp(-np.arange(n)/SR*60)*(.4+.6*i/26)
save('drumroll', hits)
