from pathlib import Path
from PIL import Image
from collections import Counter
import json

ROOT = Path(__file__).resolve().parents[2] / 'assets' / 'characters' / 'v2055'
DIRECTIONS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']
STATES = {'idle': (6, 768), 'walk': (8, 1024), 'run': (8, 1024), 'interact': (8, 1024)}
result = {
    'specializations': 0, 'strips_checked': 0, 'missing': [], 'wrong_dimensions': [],
    'walk_two_cycle_normalized': [], 'run_two_cycle_normalized': [],
    'native_timing_preserved': Counter()
}
for folder in sorted(p for p in ROOT.iterdir() if p.is_dir()):
    result['specializations'] += 1
    for state, (frame_count, width) in STATES.items():
        for direction in DIRECTIONS:
            path = folder / f'{state}_{direction}.png'
            result['strips_checked'] += 1
            if not path.exists():
                result['missing'].append(str(path.relative_to(ROOT)))
                continue
            with Image.open(path) as image:
                if image.size != (width, 160):
                    result['wrong_dimensions'].append({'path': str(path.relative_to(ROOT)), 'size': image.size})
                    continue
                rgba = image.convert('RGBA')
                frames = [rgba.crop((i * 128, 0, (i + 1) * 128, 160)).tobytes() for i in range(frame_count)]
            if state in ('walk', 'run') and frame_count == 8 and frames[:4] == frames[4:]:
                result[f'{state}_two_cycle_normalized'].append(f'{folder.name}/{direction}')
            else:
                result['native_timing_preserved'][state] += 1
result['native_timing_preserved'] = dict(result['native_timing_preserved'])
result['walk_two_cycle_count'] = len(result['walk_two_cycle_normalized'])
result['run_two_cycle_count'] = len(result['run_two_cycle_normalized'])
result['complete'] = (
    result['specializations'] == 40 and result['strips_checked'] == 1280
    and not result['missing'] and not result['wrong_dimensions']
    and result['walk_two_cycle_count'] == 248 and result['run_two_cycle_count'] == 248
)
print(json.dumps(result, ensure_ascii=False, indent=2))
if not result['complete']:
    raise SystemExit(1)
