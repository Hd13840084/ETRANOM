#!/usr/bin/env python3
"""Pixel-level QA for ETRANOM's 40-specialization multi-frame atlases."""
from pathlib import Path
from PIL import Image, ImageChops
import json, sys
ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / 'assets/characters/v2055'
MANIFEST = ROOT / 'assets/characters/v2055-atlas-manifest.json'
manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
errors, warnings = [], []
checked = 0
unique_frame_total = 0
frame_total = 0
empty_frames = 0
identical_adjacent = 0
for item in manifest.get('assets', []):
    path = ROOT / item['path']
    if not path.is_file():
        errors.append(f"missing:{item['path']}")
        continue
    try:
        im = Image.open(path).convert('RGBA')
    except Exception as exc:
        errors.append(f"unreadable:{item['path']}:{exc}")
        continue
    fw, fh, count = item['frameWidth'], item['frameHeight'], item['frameCount']
    if im.size != (fw * count, fh):
        errors.append(f"dimensions:{item['path']}:{im.size}")
        continue
    frames=[]
    for i in range(count):
        frame=im.crop((i*fw,0,(i+1)*fw,fh))
        alpha=frame.getchannel('A')
        if alpha.getbbox() is None:
            empty_frames += 1
            errors.append(f"empty_frame:{item['path']}:{i}")
        frames.append(frame)
    sigs=[f.tobytes() for f in frames]
    unique=len(set(sigs))
    unique_frame_total += unique
    frame_total += count
    if unique < 2:
        warnings.append(f"static_strip:{item['path']}")
    for i in range(1,count):
        if sigs[i] == sigs[i-1]:
            identical_adjacent += 1
    checked += 1
expected = manifest.get('assetCount', 0)
if checked != expected:
    errors.append(f"asset_count:{checked}/{expected}")
report = {
 'version':'2057.0.0', 'assetsExpected':expected, 'assetsChecked':checked,
 'framesChecked':frame_total, 'uniqueFramesAcrossStrips':unique_frame_total,
 'emptyFrames':empty_frames, 'identicalAdjacentFramePairs':identical_adjacent,
 'errors':errors, 'warnings':warnings,
 'artStatus':'procedural_prototype_not_final_hand_authored_art',
 'complete':not errors
}
out = ROOT / 'V2057_CHARACTER_ATLAS_QA.json'
out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
sys.exit(1 if errors else 0)
