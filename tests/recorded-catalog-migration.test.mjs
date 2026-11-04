import test from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';
import {createState,restoreState,startRun} from '../dist/core.js';
import {MUSIC_ALBUMS,ALBUM_TIERS,editionById} from '../dist/music-albums.js';
import {buyAlbum} from '../dist/album-collection.js';
import {RECORDED_BEATMAPS} from '../dist/recorded-beatmaps.js';
const retired=['GV059-L05-03','GV059-L04-13','GV059-L05-06','GV059-L04-11','GV059-L04-10','GV059-L05-04'];
test('legacy purchases refund removed albums and edition price reductions exactly once',()=>{
 const s=createState(7);s.stars=8;s.records.albumOwned=['dos88-horizon','dos88-prepareto-fight','dos88-smooth-sailing','eric-digital-native','dos88-main-objective','dos88-race-to-mars','dos88-city-stomper'];s.records.albumActive='GV059-L05-04';
 const restored=restoreState(JSON.stringify(s));assert.ok(restored);assert.equal(restored.stars,34);assert.deepEqual(restored.records.albumOwned,['dos88-main-objective','dos88-race-to-mars','dos88-city-stomper']);assert.equal(restored.records.albumActive,undefined);assert.equal(restored.records.active,'pulse');assert.equal(restored.records.albumCatalogVersion,1);assert.equal(restoreState(JSON.stringify(restored)).stars,34);
});
test('retired edition on a retained album selects its remaining edition and new purchases never receive a historical refund',()=>{
 const old=createState(7);old.stars=0;old.records.albumOwned=['dos88-main-objective'];old.records.albumActive='GV059-L04-13';const migrated=restoreState(JSON.stringify(old));assert.equal(migrated.records.albumActive,'GV059-L05-08');assert.equal(migrated.stars,2);
 const fresh=createState(8);fresh.stars=10;assert.ok(buyAlbum(fresh,'dos88-main-objective'));assert.equal(fresh.stars,7);assert.equal(restoreState(JSON.stringify(fresh)).stars,7);
});
test('saved expedition using retired audio survives with all resources, health and combo; no death or loss',()=>{
 const s=createState(9);startRun(s);s.records.albumOwned=['eric-digital-native'];s.records.albumActive='GV059-L05-04';s.run.albumEdition='GV059-L05-04';s.run.elapsed=2.8;s.run.beat=6;s.run.acted=6;s.run.combo=6;s.run.bag=43;s.run.materials[0]=8;
 const restored=restoreState(JSON.stringify(s));assert.ok(restored);assert.ok(restored.run);assert.equal(restored.run.albumEdition,undefined);assert.equal(restored.run.bag,43);assert.equal(restored.run.materials[0],8);assert.equal(restored.run.health,s.run.health);assert.equal(restored.run.rhythm,s.run.rhythm);assert.equal(restored.run.combo,6);assert.equal(restored.deaths,s.deaths);assert.equal(restored.stars,s.stars+6);
});
test('unknown, duplicated or unowned retired IDs remain invalid saves',()=>{
 for(const owned of [['unknown'],['dos88-horizon','dos88-horizon'],[]]){const s=createState(3);s.records.albumOwned=owned;s.records.albumActive='GV059-L05-03';assert.equal(restoreState(JSON.stringify(s)),null);}
});
test('only three tiers remain and retained demand never has sub-250ms action pairs',async()=>{
 assert.deepEqual(Object.values(ALBUM_TIERS),['Fácil','Médio','Difícil']);for(const id of retired){assert.equal(editionById(id),undefined);assert.equal(RECORDED_BEATMAPS[id],undefined);}
 for(const a of MUSIC_ALBUMS)for(const e of a.editions){const m=JSON.parse(await readFile(new URL('../dist/'+e.mapUrl,import.meta.url)));const times=m.events.map(x=>x.time),gaps=times.map((t,i)=>(times[i+1]??m.duration+times[0])-t);assert.ok(Math.min(...gaps)>=.25-1e-8,e.id);if(e.tier==='Facil'){assert.ok(Math.min(...gaps)>=.55);assert.ok(e.actionsPerMinute<=100);}if(e.tier==='Medio'){assert.ok(Math.min(...gaps)>=.33-1e-8);assert.ok(e.actionsPerMinute<=135);}assert.ok(e.actionsPerMinute<=150);}
});
