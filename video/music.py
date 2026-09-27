import numpy as np, json, wave
SR=44100
info=json.load(open('cuts.json')); T=info['total']; cuts=info['cuts']
N=int(SR*(T+0.5)); L=np.zeros(N); R=np.zeros(N)
BPM=124; B=60/BPM; S16=B/4
rng=np.random.default_rng(7)
def add(sig,t,pan=0.0,g=1.0):
    i=int(t*SR); 
    if i>=N: return
    s=sig[:N-i]*g; L[i:i+len(s)]+=s*(1-max(0,pan)); R[i:i+len(s)]+=s*(1+min(0,pan))
def env(n,a=0.002,d=0.1):
    t=np.arange(n)/SR; e=np.minimum(1,t/a)*np.exp(-t/d); return e
def kick():
    n=int(.35*SR); t=np.arange(n)/SR; f=45+110*np.exp(-t*28); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t*9)*1.0 + 0.3*np.sin(ph)*np.exp(-t*40)
def snare():
    n=int(.25*SR); t=np.arange(n)/SR; nz=rng.standard_normal(n)
    nz=np.convolve(nz,[1,-0.6],'same')
    return (nz*np.exp(-t*18)*0.45 + np.sin(2*np.pi*190*t)*np.exp(-t*25)*0.5)
def hat(open_=False):
    n=int((.18 if open_ else .05)*SR); t=np.arange(n)/SR; nz=rng.standard_normal(n); nz=np.diff(np.concatenate([[0],nz]))
    return nz*np.exp(-t*(14 if open_ else 70))*0.18
def sq(f,n,duty=0.5):
    t=np.arange(n)/SR; return np.where((t*f)%1<duty,1.0,-1.0)
def tri(f,n):
    t=np.arange(n)/SR; return 2*np.abs(2*((t*f)%1)-1)-1
def note(m): return 440*2**((m-69)/12)
# chords Am F C G  (roots midi)
prog=[(57,[57,60,64]),(53,[53,57,60]),(48,[52,55,60]),(55,[55,59,62])]
start=cuts[0]-B*0  # groove starts at first cut (drop)
bar=4*B
nbars=int((T-start)/bar)+2
end_t=T-0.6
# --- intro riser + arpeggio teaser
n=int(start*SR); t=np.arange(n)/SR
riser=rng.standard_normal(n)*(t/start)**2*0.12
add(riser,0,0,1)
for k in range(int(start/S16)):
    tt=k*S16; m=[69,72,76,81][k%4]
    nn=int(S16*SR*0.9); s=sq(note(m),nn,0.25)*env(nn,0.002,0.06)*0.10*(0.4+0.6*tt/start)
    add(s,tt,0.3 if k%2 else -0.3)
# --- groove
lead=[76,74,72,74, 76,79,76,74, 72,72,74,76, 74,72,71,72]
for b in range(nbars):
    bt=start+b*bar
    if bt>end_t: break
    root,ch=prog[b%4]
    section = (b//8)%3  # vary density
    for beat in range(4):
        t0=bt+beat*B
        if t0>end_t: break
        add(kick(),t0,0,0.9)
        if beat in (1,3): add(snare(),t0,0,0.8)
        for e in range(2):
            add(hat(e==1 and beat==3),t0+e*B/2,0.25,1)
        if section>0:
            add(hat(),t0+B/4,-0.25,0.6); add(hat(),t0+3*B/4,-0.25,0.6)
        # bass 8ths w/ octave
        for e in range(2):
            m=root-12+(12 if e==1 else 0); nn=int(B/2*SR*0.95)
            s=(sq(note(m),nn,0.5)*0.5+tri(note(m),nn))*env(nn,0.003,0.18)*0.16
            # sidechain feel
            add(s,t0+e*B/2,0,1)
        # arpeggio 16ths
        for e in range(4):
            k=beat*4+e; m=ch[k%3]+12+(12 if k%8>=6 else 0); nn=int(S16*SR*0.9)
            s=sq(note(m),nn,0.25)*env(nn,0.002,0.07)*0.075
            add(s,t0+e*S16,0.35 if k%2 else -0.35)
    # lead every other 2 bars in section 1/2
    if section>=1 and b%2==0:
        for k,m in enumerate(lead):
            tt=bt+k*B/2
            if tt>end_t: break
            nn=int(B/2*SR*0.9); s=(sq(note(m),nn,0.5)*0.5+tri(note(m)*1.003,nn)*0.5)*env(nn,0.01,0.25)*0.06
            add(s,tt,0.1)
    # pad
    nn=int(bar*SR); pad=sum(tri(note(m),nn) for m in ch)/3*0.035
    pad*=np.minimum(1,np.arange(nn)/(0.05*SR))*np.minimum(1,(nn-np.arange(nn))/(0.2*SR))
    if bt+bar<end_t: add(pad,bt,0,1)
# --- whooshes on cuts
def whoosh(dur=0.45):
    n=int(dur*SR); t=np.arange(n)/SR; nz=rng.standard_normal(n)
    # sweep via moving average of varying width
    out=np.zeros(n); acc=0
    a=np.linspace(0.02,0.5,n)
    for i in range(n): acc=acc+(nz[i]-acc)*a[i]; out[i]=acc
    e=np.sin(np.pi*np.minimum(1,t/dur))**2
    return out*e*0.35
w=whoosh()
for c in cuts[1:]:
    if c>0: add(w,c-0.3,0,1)
# final hit
fh=kick()*1.2; add(fh,end_t,0,1)
n=int(1.2*SR); t=np.arange(n)/SR
add(sum(np.sin(2*np.pi*note(m)*t) for m in [57,64,69,72])/4*np.exp(-t*2.5)*0.3, end_t,0,1)
# master: gentle comp + fade
mix=np.stack([L,R],1)
mix=np.tanh(mix*1.3)/np.tanh(1.3)
fade=np.ones(N); fo=int(0.6*SR); fade[-fo:]=np.linspace(1,0,fo)
mix*=fade[:,None]; mix/=np.max(np.abs(mix))*1.12
pcm=(mix*32767).astype('<i2')
with wave.open('music.wav','wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
print('ok',N/SR)
