import numpy as np, wave, sys
SR=44100
def note(f,d,typ='saw',a=.005,r=.15):
    t=np.arange(int(SR*d))/SR
    if typ=='saw': w=2*(t*f-np.floor(.5+t*f))
    elif typ=='sq': w=np.sign(np.sin(2*np.pi*f*t))*.6
    else: w=np.sin(2*np.pi*f*t)
    env=np.minimum(1,t/a)*np.exp(-t/max(r,1e-3)); return w*env
def lp(x,k=6):
    y=np.copy(x)
    for _ in range(k): y=np.convolve(y,np.ones(5)/5,'same')
    return y
def add(mix,ss,x):
    N=len(mix)
    if ss>=N: return
    ee=min(N,ss+len(x)); mix[ss:ee]+=x[:ee-ss]
def track(name,bpm,prog,dur,mood):
    beat=60/bpm; N=int(SR*dur); mix=np.zeros(N)
    hz=lambda m:440*2**((m-69)/12)
    bar=4*beat; t=0.0; i=0
    while t<dur:
        root=prog[i%len(prog)]; chord=[root, root+(3 if mood=='minor' and i%len(prog)!=2 else 4), root+7]
        s=int(t*SR)
        # pad
        pad=sum(lp(note(hz(n+12),bar,'saw',a=.4,r=bar*2))*.06 for n in chord)
        add(mix,s,pad)
        for b in range(4):
            bt=t+b*beat; bs=int(bt*SR)
            if bt>=dur: break
            # bass on beats, octave on offbeat
            for k,(off,o) in enumerate([(0,0),(.5,12)]):
                x=lp(note(hz(root-12+o),beat*.45,'sq',r=.18),3)*.22; ss=bs+int(off*beat*SR); add(mix,ss,x)
            # kick
            kt=np.arange(int(SR*.25))/SR; kick=np.sin(2*np.pi*(50+90*np.exp(-kt*30))*kt)*np.exp(-kt*12)*.5
            add(mix,bs,kick)
            # hat on offbeat
            hs=bs+int(beat*.5*SR); h=np.random.default_rng(b+i).standard_normal(int(SR*.05))*np.exp(-np.arange(int(SR*.05))/SR*80)*.05
            add(mix,hs,np.diff(np.concatenate([[0],h])))
            # arp 16ths
            for q in range(4):
                n=chord[(b*4+q)%3]+24; x=note(hz(n),beat*.22,'sin',r=.08)*.07; ss=bs+int(q*beat/4*SR); add(mix,ss,x)
        t+=bar; i+=1
    f=np.minimum(1,np.arange(N)/(SR*.5))*np.minimum(1,(N-np.arange(N))/(SR*1.5))
    mix=mix*f; mix=mix/np.max(np.abs(mix))*.8
    st=np.stack([mix,np.roll(mix,int(SR*.012))],1)
    with wave.open(name,'w') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype('<i2').tobytes())
track('trevoga-100bpm.wav',100,[57,53,48,55],34,'minor')   # тёмно-бодрый: Am F C G
track('rost-96bpm.wav',96,[60,55,57,53],34,'major')         # светлый: C G Am F
