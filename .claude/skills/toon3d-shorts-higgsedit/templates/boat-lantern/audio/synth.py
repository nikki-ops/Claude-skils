import numpy as np, wave
SR=44100; T=41.8; N=int(SR*T)
rng=np.random.default_rng(7)
def env(n,a=0.005,d=0.3):
    t=np.arange(n)/SR; return np.minimum(1,t/a)*np.exp(-t/d)
def add(buf,t0,sig,g=1.0):
    i=int(t0*SR); j=min(len(buf),i+len(sig));
    if i<len(buf): buf[i:j]+=sig[:j-i]*g
def mtof(m): return 440*2**((m-69)/12)
def pluck(f,dur=0.35):
    n=int(SR*dur); L=max(2,int(SR/f)); buf=rng.uniform(-1,1,L); out=np.zeros(n)
    for i in range(n):
        out[i]=buf[i%L]; buf[i%L]=0.5*(buf[i%L]+buf[(i+1)%L])*0.996
    return out*env(n,0.002,dur*0.5)
def mallet(f,dur=0.5):
    n=int(SR*dur); t=np.arange(n)/SR
    s=np.sin(2*np.pi*f*t)+0.35*np.sin(2*np.pi*f*4*t)*np.exp(-t*20)+0.15*np.sin(2*np.pi*f*10*t)*np.exp(-t*40)
    return s*env(n,0.002,0.18)
def bell(f,dur=1.2):
    n=int(SR*dur); t=np.arange(n)/SR
    s=sum(a*np.sin(2*np.pi*f*r*t)*np.exp(-t*k) for a,r,k in [(1,1,3),(0.5,2.76,5),(0.3,5.4,8),(0.2,8.9,12)])
    return s*env(n,0.001,0.6)
def noise(n): return rng.standard_normal(n)
def bp(x,lo,hi):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X[(f<lo)|(f>hi)]=0; return np.fft.irfft(X,len(x))
# ---------- music ----------
mus=np.zeros(N); beat=60/151
bass=[38,38,45,38, 41,41,45,40, 38,38,45,38, 43,43,45,37]   # D minor walk
mel=[62,None,65,None,69,None,67,65, 64,None,61,None,62,None,None,None, 62,None,65,None,69,None,70,69, 67,None,64,None,61,None,62,None]
pl={}
def P(m,d): 
    k=(m,d)
    if k not in pl: pl[k]=pluck(mtof(m),d)
    return pl[k]
nb=int(T/beat)+1
for i in range(nb):
    t=i*beat
    add(mus,t,P(bass[i%16],0.4),0.55)
    for h in (0,1):
        idx=(i*2+h)%len(mel); m=mel[idx]
        if m and i>=4: add(mus,t+h*beat/2,mallet(mtof(m),0.4),0.22)
    if i%8==0: add(mus,t+beat*0.5,bell(mtof(81),1.0),0.05)
# dynamics: thinner under explanation, louder at action
def gain_at(t):
    if 8.7<=t<15.3: return 0.55
    if 28.1<=t<32.2: return 1.25
    if 38.9<=t: return 1.2
    return 1.0
g=np.array([gain_at(i/SR) for i in range(0,N,441)]); g=np.repeat(g,441)[:N]
mus*=g
# ---------- sfx ----------
sfx=np.zeros(N)
def whoosh(t0,d=0.3,g=0.35):
    n=int(SR*d); x=noise(n); tt=np.linspace(0,1,n)
    y=np.zeros(n); seg=8
    for k in range(seg):
        a=k*n//seg; b=(k+1)*n//seg; c=300+3000*(k/seg); y[a:b]=bp(x[a:b],c*0.6,c*1.6)
    add(sfx,t0-0.05,y*np.sin(np.pi*tt)**2,g)
# smash
n=int(SR*0.5); add(sfx,0.92,bp(noise(n),1500,9000)*env(n,0.001,0.08),0.9)
for k in range(28):
    f=rng.uniform(2500,7000); d=rng.uniform(0.05,0.25); n=int(SR*d); t=np.arange(n)/SR
    add(sfx,0.92+rng.uniform(0,0.55),np.sin(2*np.pi*f*t)*env(n,0.001,d*0.3),0.12)
n=int(SR*0.3); add(sfx,0.92,np.sin(2*np.pi*90*np.arange(n)/SR)*env(n,0.001,0.06),0.6)
for t0 in (1.48,10.80,25.36,28.16,32.10,36.56): whoosh(t0)
# sea ambience
def amb(t0,t1,lo,hi,g,mod=0.25):
    n=int(SR*(t1-t0)); x=bp(noise(n),lo,hi); tt=np.arange(n)/SR
    e=(0.6+mod*np.sin(2*np.pi*0.3*tt+rng.uniform(0,6)))*np.minimum(1,np.minimum(tt,(t1-t0)-tt)/0.15)
    add(sfx,t0,x*e,g)
for a,b in [(1.48,3.42),(8.70,10.80),(18.95,23.0)]: amb(a,b,150,1800,0.05)
for a,b in [(15.95,18.74),(25.36,26.86)]: amb(a,b,100,900,0.06); amb(a,b,1500,5000,0.015)
amb(28.16,32.10,80,1200,0.12,0.5); amb(28.16,32.10,2000,6000,0.03,0.5)
# crowd laugh (pulsed formant noise) and room murmur
def laugh(t0,t1,g):
    n=int(SR*(t1-t0)); tt=np.arange(n)/SR; x=bp(noise(n),400,1400)
    pulse=np.clip(np.sin(2*np.pi*5.2*tt+np.sin(2*np.pi*0.7*tt)),0,1)**2
    x2=bp(noise(n),500,1800); pulse2=np.clip(np.sin(2*np.pi*4.3*tt+1.3),0,1)**2
    e=np.minimum(1,np.minimum(tt,(t1-t0)-tt)/0.2)
    add(sfx,t0,(x*pulse+x2*pulse2)*e,g)
laugh(3.45,6.0,0.10)
for a,b in [(6.06,8.70),(23.22,25.36),(32.10,36.56),(38.90,41.8)]: amb(a,b,200,900,0.025,0.4)
laugh(23.3,25.3,0.05)
# radio static
def static(t0,t1,g):
    n=int(SR*(t1-t0)); x=bp(noise(n),900,3500); tt=np.arange(n)/SR
    cr=(rng.random(n)<0.0015).astype(float); cr=np.convolve(cr,np.exp(-np.arange(200)/30),'same')
    e=np.minimum(1,np.minimum(tt,(t1-t0)-tt)/0.05)*(0.6+0.4*np.sin(2*np.pi*7*tt)**2)
    add(sfx,t0,(x*e+cr*3*e),g)
static(11.35,13.05,0.07); static(37.1,38.85,0.09)
# flash shimmer + clunk
n=int(SR*0.9); t=np.arange(n)/SR; sh=sum(np.sin(2*np.pi*(2000+k*700)*(t+0.3*t*t))*np.sin(2*np.pi*(9+k)*t)**2 for k in range(5))
add(sfx,26.80,sh*env(n,0.05,0.5),0.06)
n=int(SR*0.25); add(sfx,26.74,np.sin(2*np.pi*70*np.arange(n)/SR)*env(n,0.001,0.05),0.5)
# splash at capsize, finish bell, cash slide + thud, money avalanche
n=int(SR*0.7); add(sfx,28.95,bp(noise(n),200,4000)*env(n,0.01,0.25),0.35)
add(sfx,31.40,bell(mtof(84),1.4),0.18)
n=int(SR*0.8); tt=np.arange(n)/SR; add(sfx,32.55,bp(noise(n),2000,7000)*np.sin(np.pi*tt/0.8),0.08)
n=int(SR*0.3); add(sfx,33.40,np.sin(2*np.pi*110*np.arange(n)/SR)*env(n,0.001,0.06),0.45)
n=int(SR*1.4); tt=np.arange(n)/SR; fl=bp(noise(n),1500,8000)*(0.5+0.5*np.sin(2*np.pi*18*tt)**2)
add(sfx,40.35,fl*np.minimum(1,tt/0.1),0.12)
for k in range(30):
    f=rng.uniform(3000,6500); d=0.12; n=int(SR*d); t=np.arange(n)/SR
    add(sfx,40.4+rng.uniform(0,1.3),np.sin(2*np.pi*f*t)*env(n,0.001,0.04),0.08)
def write(name,x):
    x=np.clip(x,-1,1); w=wave.open(name,'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype(np.int16).tobytes()); w.close()
write('music.wav',mus/np.max(np.abs(mus))*0.6); write('sfx.wav',sfx/max(1,np.max(np.abs(sfx)))*0.9)
print('ok')
