#!/usr/bin/env python3
"""Strict acceptance validator for final, human-authored ETRANOM character atlases."""
from pathlib import Path
from PIL import Image
import json, sys
ROOT=Path(__file__).resolve().parents[1]
M=json.loads((ROOT/'assets/characters/v2055-atlas-manifest.json').read_text(encoding='utf-8'))
D=json.loads((ROOT/'assets/characters/v2058-art-direction-manifest.json').read_text(encoding='utf-8'))
errors=[]; warnings=[]; checked=frames=empty=duplicates=0
if len(D.get('specializations',[]))!=40: errors.append('design_briefs_not_40')
for a in M.get('assets',[]):
 p=ROOT/a['path']
 if not p.is_file(): errors.append('missing:'+a['path']); continue
 try: im=Image.open(p).convert('RGBA')
 except Exception as ex: errors.append(f'unreadable:{a["path"]}:{ex}'); continue
 fw,fh,n=a['frameWidth'],a['frameHeight'],a['frameCount']
 if im.size!=(fw*n,fh): errors.append('dimensions:'+a['path']); continue
 sig=[]
 for i in range(n):
  f=im.crop((i*fw,0,(i+1)*fw,fh)); frames+=1
  if f.getchannel('A').getbbox() is None: empty+=1; errors.append(f'empty:{a["path"]}:{i}')
  sig.append(f.tobytes())
 if len(set(sig))<n: duplicates+=1; warnings.append('duplicate_frames:'+a['path'])
 checked+=1
# Existing procedural files are explicitly not accepted as final authored art.
report={'version':'2058.0.0','designBriefs':len(D.get('specializations',[])),'atlasesExpected':1280,'atlasesChecked':checked,'framesChecked':frames,'emptyFrames':empty,'stripsWithDuplicateFrames':duplicates,'warnings':warnings,'errors':errors,'artworkStatus':'prototype_only_until_human_authorship_and_review','finalArtAccepted':False}
(ROOT/'V2058_CHARACTER_ART_ACCEPTANCE.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
sys.exit(1 if errors else 0)
