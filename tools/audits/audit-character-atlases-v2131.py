from pathlib import Path
from PIL import Image
import json
ROOT = Path(__file__).resolve().parents[2] / 'assets' / 'characters' / 'v2055'
DIRECTIONS = ['south','south-east','east','north-east','north','north-west','west','south-west']
STATES = {'idle': (6, 768), 'walk': (8, 1024), 'run': (8, 1024), 'interact': (8, 1024)}
result = {'specializations': 0, 'strips': 0, 'missing': [], 'wrong_dimensions': [], 'fully_static': [], 'unique_frame_distribution': {}}
for folder in sorted(p for p in ROOT.iterdir() if p.is_dir()):
    result['specializations'] += 1
    for state, (frames, width) in STATES.items():
        for direction in DIRECTIONS:
            path = folder / f'{state}_{direction}.png'
            result['strips'] += 1
            if not path.exists():
                result['missing'].append(str(path.relative_to(ROOT)))
                continue
            with Image.open(path) as image:
                if image.size != (width, 160):
                    result['wrong_dimensions'].append({'path': str(path.relative_to(ROOT)), 'size': image.size})
                    continue
                rgba = image.convert('RGBA')
                hashes = set()
                for frame in range(frames):
                    tile = rgba.crop((frame * 128, 0, (frame + 1) * 128, 160))
                    hashes.add(tile.tobytes())
                unique = len(hashes)
                result['unique_frame_distribution'][str(unique)] = result['unique_frame_distribution'].get(str(unique), 0) + 1
                if unique == 1:
                    result['fully_static'].append(str(path.relative_to(ROOT)))
print(json.dumps(result, ensure_ascii=False, indent=2))
