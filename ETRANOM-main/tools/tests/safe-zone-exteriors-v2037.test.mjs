import test from 'node:test';
import assert from 'node:assert/strict';
import {SAFE_ZONE_EXTERIOR_CATALOG_V2037 as catalog,SAFE_ZONE_EXTERIOR_IDS_V2037 as ids,SAFE_ZONE_EXTERIOR_AUDIT_V2037 as audit} from '../../systems/safe-zone/exterior-catalog-v2037.js';
import {SAFE_ZONE_INTERIOR_IDS_V2035 as interiors} from '../../systems/safe-zone/interior-catalog-v2035.js';

test('all 27 safe-zone structures have exterior identities and matching interior records',()=>{
 assert.equal(ids.length,27); assert.equal(new Set(ids).size,27);
 assert.deepEqual([...ids].sort(),[...interiors].sort());
});
test('safe-zone exterior count is 12 city + 5 per village',()=>{
 assert.deepEqual(audit.byZone,{'شهر خاکستر':12,'کشتزار':5,'ریشه‌چوب':5,'سنگ‌آهن':5});
});
test('every building has complete architectural specification',()=>{
 for(const [id,d] of Object.entries(catalog)) for(const key of ['zone','name','silhouette','roof','materials','signature','exteriorProps','atmosphere']) assert.ok(d[key]?.trim(),`${id}:${key}`);
});
test('building silhouettes and signature landmarks are individually authored',()=>{
 assert.equal(audit.uniqueSilhouettes,27);
 assert.equal(audit.uniqueSignatures,27);
});
test('catalog remains presentation-only and does not introduce gameplay capabilities',()=>{
 const source=JSON.stringify(catalog);
 for(const forbidden of ['quest','combat','damage','inventory','reward','spawn']) assert.equal(source.includes(forbidden),false,forbidden);
});
