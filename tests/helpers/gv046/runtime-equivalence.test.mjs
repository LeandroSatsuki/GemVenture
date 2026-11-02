import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as Factory from './miner.candidate.mjs';
import {createState} from '../../../dist/core.js';
test('reviewable two-file runtime patch has no synthetic geology hook and matches default factory exactly',async()=>{
 let source=await readFile(new URL('../../../dist/miner.js',import.meta.url),'utf8');
 assert.equal(source.includes('tileOverride'),false);
 source=source.replace("'./materials.js'",JSON.stringify(new URL('../../../dist/materials.js',import.meta.url).href));
 source=source.replace("'./miner-contact.js'",JSON.stringify(new URL('../../../dist/miner-contact.js',import.meta.url).href));
 const Runtime=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const a=createState(713),b=createState(713);a.miner=Runtime.createMiner(713);b.miner=Factory.createMiner(713);
 Runtime.setMinerEnabled(a,true,1700000000000);Factory.setMinerEnabled(b,true,1700000000000);
 for(const delta of [500,997,1000,2000,5000,60000,3600000]){
  const now=1700000000000+delta;assert.deepEqual(Runtime.settleMiner(a,now),Factory.settleMiner(b,now));assert.deepEqual(a.miner,b.miner);assert.deepEqual(a.materials,b.materials);
 }
});
