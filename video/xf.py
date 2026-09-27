import json, subprocess, os
F=os.environ.get('FFMPEG','ffmpeg')
d=json.load(open('segs/durs.json')); n=len(d)
TR=['circleopen','slideleft','zoomin','smoothleft','fadewhite','slideup','circleopen','wipeleft','zoomin','fade','fade','slideleft','circleopen','smoothup','slideleft','fadewhite']
TD=[0.35,0.3,0.3,0.3,0.3,0.3,0.3,0.3,0.3,0.12,0.12,0.3,0.3,0.3,0.3,0.4]
args=[F,'-y','-loglevel','error']
for i in range(n): args+=['-i',f'segs/{i+1:02d}.mp4']
fc=[]; prev='[0:v]'; t=d[0]; cuts=[]
for i in range(1,n):
    off=t-TD[i-1]
    out=f'[x{i}]' if i<n-1 else '[vout]'
    fc.append(f'{prev}[{i}:v]xfade=transition={TR[i-1]}:duration={TD[i-1]}:offset={off:.3f}{out}')
    cuts.append(round(off+TD[i-1]/2,3)); prev=out; t=off+d[i]
args+=['-filter_complex',';'.join(fc),'-map','[vout]','-c:v','libx264','-preset','slow','-crf','22','-pix_fmt','yuv420p','video_noaudio.mp4']
subprocess.run(args,check=True)
json.dump({'total':t,'cuts':cuts,'types':TR},open('cuts.json','w')); print('total',t); print(cuts)
