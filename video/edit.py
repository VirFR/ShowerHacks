import subprocess, json, os
F=os.environ.get('FFMPEG','ffmpeg')
os.makedirs('segs', exist_ok=True)
# (name, source, start, end, speed, badge)
SEG = [
 ('01','m_intro',0,None,1,False),
 ('02','m_goal',0,None,1,False),
 ('03','02_welcome',0,None,1.45,False),
 ('04','04_boosters',0,None,1.3,False),
 ('05','06_item',0,None,1.1,False),
 ('06','m_circle',0,None,1,False),
 ('07','08_deck',0,None,1.35,False),
 ('08','m_points',0,None,1,False),
 ('09','m_gauntlet',0,5.5,1,False),
 ('10','10_battle',0,26.5,1.25,False),
 ('11','10_battle',26.5,50.5,3.0,True),
 ('12','10_battle',50.5,None,1.05,False),
 ('13','m_rewards',0,None,1,False),
 ('14','14_crafting',0,None,1.15,False),
 ('15','15_recipes',0,None,1.1,False),
 ('16','17_leaderboard',0,None,1,False),
 ('17','m_outro',0,None,1,False),
]
def dur(p):
    out = subprocess.run([F,'-i',p],capture_output=True,text=True).stderr
    d = out.split('Duration: ')[1].split(',')[0]; h,m,s = d.split(':'); return int(h)*3600+int(m)*60+float(s)
durs=[]
for name,src,a,b,sp,badge in SEG:
    out=f'segs/{name}.mp4'
    args=[F,'-y','-loglevel','error','-ss',str(a)]
    if b: args+=['-to',str(b)]
    args+=['-i',f'clips/{src}.mp4']
    vf=f'setpts=PTS/{sp},fps=30,format=yuv420p'
    if badge:
        args+=['-i','ff_badge.png']
        fc=f'[0:v]{vf}[v];[v][1:v]overlay=0:0,format=yuv420p[o]'
        args+=['-filter_complex',fc,'-map','[o]']
    else:
        args+=['-vf',vf]
    args+=['-an','-c:v','libx264','-preset','medium','-crf','17',out]
    subprocess.run(args,check=True)
    durs.append(dur(out)); print(name, src, round(durs[-1],2))
json.dump(durs, open('segs/durs.json','w'))
print('sum', sum(durs))
