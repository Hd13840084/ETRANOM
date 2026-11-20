import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../../game.js', import.meta.url),'utf8');
assert.match(source,/استفاده نامحدود؛ بدون سهمیه روزانه/,'camp UI must advertise unlimited use');
assert.match(source,/if\(a!=='camp-rest'&&state\.safeActivityDays\[m\.id\]===day\)/,'daily lock must not apply to camp rest');
assert.match(source,/if\(a!=='camp-rest'\)state\.safeActivityDays\[m\.id\]=day/,'camp rest must not consume daily activity quota');
assert.ok(source.includes("if(a!=='camp-rest'&&state.safeActivityDays[m.id]===day)"), 'camp rest must bypass daily lock');
assert.ok(source.includes("if(a!=='camp-rest')state.safeActivityDays[m.id]=day;let line=''"), 'camp rest must not consume daily quota');
console.log('PASS camp-rest-unlimited-v97');
