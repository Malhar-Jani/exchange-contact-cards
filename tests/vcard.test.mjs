import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyCard, makeVCard, foldLine, readPresets} from '../src/vcard.mjs';
test('vCard contains structured name and only populated contact properties', () => {
 const card=makeVCard({...emptyCard,firstName:'Malhar',lastName:'Jani',phone:'+919876543210'});
 assert.match(card,/N:Jani;Malhar;;;/); assert.match(card,/FN:Malhar Jani/); assert.match(card,/TEL;TYPE=CELL:\+919876543210/); assert.ok(!card.includes('EMAIL')); assert.ok(card.endsWith('END:VCARD\r\n'));
});
test('escapes delimiter and newline injection into extra properties', () => {
 const card=makeVCard({...emptyCard,firstName:'A;B,C',note:'hello\r\nTEL:evil\\end'});
 assert.ok(card.includes('FN:A\\;B\\,C')); assert.ok(card.includes('NOTE:hello\\nTEL:evil\\\\end')); assert.equal(card.split('\r\n').filter(x=>x.startsWith('TEL')).length,0);
});
test('folds unicode by octet count and unfolds losslessly', () => {
 const original='NOTE:'+ 'હેલો 🌍'.repeat(45); const folded=foldLine(original);
 for(const line of folded.split('\r\n')) assert.ok(new TextEncoder().encode(line).length<=75);
 assert.equal(folded.replace(/\r\n /g,''),original);
});
test('recovers from malformed storage and excludes invalid presets', () => {
 assert.deepEqual(readPresets('{oops'),[]); assert.deepEqual(readPresets('{}'),[]);
 const presets=readPresets(JSON.stringify([null,{id:'1',label:'Event',card:{firstName:'Jo',phone:123}}]));
 assert.equal(presets.length,1); assert.equal(presets[0].card.firstName,'Jo'); assert.equal(presets[0].card.phone,'');
});
