import test from 'node:test';
import assert from 'node:assert/strict';
import {bossHeaderBounds,updateBossPresentation} from '../dist/boss-hud.js';
import {createBoss} from '../dist/bosses.js';
import {BIOME_ART} from '../dist/palette.js';
import {paintBossHealth} from '../dist/canvas-health-ui.js';

test('boss header uses the free upper band without covering combo or location',()=>{
 for(const width of [853,1280,1532]){
  const combo={right:324,bottom:82},location={left:width-205,bottom:67};
  const v=bossHeaderBounds(width,{combo,location,vital:{right:202,bottom:60},breath:{bottom:120}});
  assert.equal(v.y,12);assert.ok(v.x>=combo.right+12);assert.ok(v.x+v.width<=location.left-12);assert.ok(v.width<=480);
 }
});
test('compact header falls below the controls rather than shrinking their targets',()=>{
 const v=bossHeaderBounds(640,{combo:{right:350,bottom:121},location:{left:8,bottom:125},vital:{right:316,bottom:56},breath:{bottom:56}});
 assert.equal(v.y,137);assert.equal(v.width,480);assert.ok(v.x>=12&&v.x+v.width<=628);
});
test('fallback band leaves the vertical star column clear at amplified UI scale',()=>{
 const v=bossHeaderBounds(640,{combo:{right:350,bottom:121},location:{left:8,bottom:125},score:{left:546}});
 assert.ok(v.x>=12);assert.ok(v.x+v.width<=534);assert.equal(v.width,480);assert.equal(v.y,137);
});
function fixture(boss){
 const values=new Map(),style=new Map(),props=new Map(),bar={setAttribute:(k,v)=>values.set(k,v)};
 const hud={hidden:false,style:{setProperty:(k,v)=>style.set(k,v)},offsetHeight:108,querySelector:()=>bar};
 const rects={'.combo':{left:228,right:324,top:12,bottom:84},'.location':{left:700,right:841,top:12,bottom:67},'.vital':{left:12,right:202,top:12,bottom:60},'.breath':{left:12,right:202,top:67,bottom:115},'.mission':{left:529,right:719,top:82,bottom:156}};
 const root={hidden:false,clientWidth:853,getBoundingClientRect:()=>({left:0,top:0,width:1280}),style:{setProperty:(k,v)=>props.set(k,v),getPropertyValue:k=>props.get(k)||''},querySelector:s=>s==='#bossHud'?hud:rects[s]?{hidden:false,getBoundingClientRect:()=>{const r=rects[s],scale=1280/853,off=s==='.mission'?parseFloat(props.get('--boss-mission-offset'))||0:0;return {width:(r.right-r.left)*scale,left:r.left*scale,right:r.right*scale,top:(r.top+off)*scale,bottom:(r.bottom+off)*scale};}}:null};
 return {root,hud,values,style,props,run:{room:{enemies:[boss]}}};
}
test('all seven canonical bosses preserve HP and biome accents without mutating combat',()=>{
 for(let i=0;i<7;i++){
  const b=createBoss((i+1)*5,1);b.hp=b.maxHp/2+.2;const f=fixture(b),before=structuredClone(f.run);
  updateBossPresentation(f.root,f.run);
  assert.equal(f.values.get('aria-valuenow'),String(Math.ceil(b.hp)));assert.equal(f.values.get('aria-valuemax'),String(b.maxHp));assert.equal(f.style.get('--boss'),BIOME_ART[i].accent);assert.deepEqual(f.run,before);
 }
});
test('incoming boss yields to the fixed mission without moving it across frames or defeat',()=>{
 const f=fixture(createBoss(5,1));updateBossPresentation(f.root,f.run);const offset=f.props.get('--boss-mission-offset');assert.equal(offset,'0px');assert.equal(f.style.get('--boss-top'),'168px');
 updateBossPresentation(f.root,f.run);assert.equal(f.props.get('--boss-mission-offset'),offset);
 f.run.room.enemies[0].hp=0;updateBossPresentation(f.root,f.run);assert.equal(f.props.get('--boss-mission-offset'),'0px');
});
test('hidden boss panel releases mission space',()=>{
 const f=fixture(createBoss(5,1));updateBossPresentation(f.root,f.run);f.hud.hidden=true;updateBossPresentation(f.root,f.run);assert.equal(f.props.get('--boss-mission-offset'),'0px');
});
test('world painter can omit duplicate HP and name while preserving attack warning',()=>{
 const texts=[],rects=[];const c=new Proxy({save(){},restore(){},fillText:(v)=>texts.push(v),fillRect:(...v)=>rects.push(v)},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const data={x:20,top:30,ratio:.5,color:'#35d6f2',name:'REI GEODO',alert:'SAIA DA MARCA'};
 paintBossHealth(c,{...data,showVitals:false});assert.deepEqual(texts,['SAIA DA MARCA']);assert.equal(rects.length,0);
 texts.length=0;paintBossHealth(c,data);assert.deepEqual(texts,['REI GEODO','SAIA DA MARCA']);assert.equal(rects.length,2);
});
