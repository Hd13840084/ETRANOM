#!/usr/bin/env bash
set -euo pipefail
node --check game.js
node --check systems/online/world-presence.js
node --check systems/online/presence.js
node --check systems/party/party.js
node --check systems/party/party-combat.js
node --check systems/party/party-ui.js
python3 - <<'PY'
from pathlib import Path
s=Path('index.html').read_text()
start=s.index('<script type="module">')+len('<script type="module">')
end=s.index('</script>', start)
Path('/tmp/etranom-index-module.mjs').write_text(s[start:end])
PY
node --check /tmp/etranom-index-module.mjs
printf 'ETRANOM local syntax checks passed.\n'
