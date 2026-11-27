#!/usr/bin/env python3
"""V2132 audit for all map portraits and directional/state character strips."""
from pathlib import Path
from PIL import Image, ImageChops
import json
ROOT = Path(__file__).resolve().parents[2]
roster_path = ROOT / 'systems/characters/character-identity-roster-v2047.js'
text = roster_path.read_text(encoding='utf-8')
# Canonical IDs are the first quoted field in each roster tuple.
import re
ids = re.findall(r"^\s*\['([a-z0-9_]+)',\s*'", text, re.M)
ids = list(dict.fromkeys(ids))
directions = ['south','south-east','east','north-east','north','north-west','west','south-west']
states = {'idle': (6,768,160), 'walk': (8,1024,160), 'run': (8,1024,160), 'interact': (8,1024,160)}
report = {'specializations': len(ids), 'map_portraits': 0, 'strips_checked': 0, 'missing': [], 'wrong_dimensions': [], 'empty_frames': [], 'unique_frame_counts': {}, 'frame_foot_anchor_spread': {}}
for sid in ids:
    portrait = ROOT / 'assets/characters/v2067-map-art' / f'{sid}.png'
    if portrait.is_file(): report['map_portraits'] += 1
    else: report['missing'].append(str(portrait.relative_to(ROOT)))
    bottom_values=[]
    for state,(frames,ew,eh) in states.items():
      for direction in directions:
        path=ROOT/'assets/characters/v2055'/sid/f'{state}_{direction}.png'
        if not path.is_file():
          report['missing'].append(str(path.relative_to(ROOT))); continue
        report['strips_checked'] += 1
        try:
          im=Image.open(path).convert('RGBA')
        except Exception as exc:
          report['wrong_dimensions'].append({'path':str(path.relative_to(ROOT)),'error':str(exc)}); continue
        if im.size != (ew,eh): report['wrong_dimensions'].append({'path':str(path.relative_to(ROOT)),'actual':im.size,'expected':(ew,eh)})
        frame_hashes=set(); bottoms=[]
        for i in range(frames):
          frame=im.crop((i*128,0,(i+1)*128,160))
          alpha=frame.getchannel('A'); bbox=alpha.getbbox()
          if bbox is None: report['empty_frames'].append(f'{sid}/{state}/{direction}/{i}')
          else: bottoms.append(bbox[3])
          frame_hashes.add(frame.tobytes())
        count=len(frame_hashes)
        report['unique_frame_counts'][str(count)] = report['unique_frame_counts'].get(str(count),0)+1
        if bottoms: bottom_values.extend(bottoms)
    if bottom_values:
      report['frame_foot_anchor_spread'][sid] = max(bottom_values)-min(bottom_values)
report['complete'] = len(ids)==40 and report['map_portraits']==40 and report['strips_checked']==1280 and not report['missing'] and not report['wrong_dimensions'] and not report['empty_frames']
out=ROOT/'V2132_CHARACTER_RENDER_AUDIT.json'
out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
if not report['complete']: raise SystemExit(1)
