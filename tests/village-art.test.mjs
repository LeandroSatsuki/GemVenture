import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FLOW_ART,FLOW_PROPS,FLOW_SWATCHES,VILLAGE_ART_ROOT,mapVillageColors} from '../dist/flow-village.js';
import {HOTSPOTS} from '../dist/world.js';

test('every village family ships as an individual RGBA image, not a reference scene',async()=>{
 assert.equal(Object.keys(FLOW_ART).length,13);
 for(const name of Object.values(FLOW_ART)){const bytes=await readFile(new URL('../dist/'+VILLAGE_ART_ROOT+name+'.png',import.meta.url));assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(bytes[25],6,name+' must preserve alpha');assert.ok(bytes.readUInt32BE(16)>0&&bytes.readUInt32BE(20)>0);}
});
test('village material normalization preserves alpha and limits each family to its agreed HEPT32 swatches',()=>{
 for(const [type,swatches]of Object.entries(FLOW_SWATCHES)){const allowed=new Set(swatches.map(h=>parseInt(h.slice(1),16))),data=new Uint8ClampedArray(4000),alpha=[];
  for(let i=0;i<data.length;i+=4){data[i]=(i*31)%256;data[i+1]=(i*17+45)%256;data[i+2]=(i*19+120)%256;data[i+3]=(i/4)%256;alpha.push(data[i+3]);}
  mapVillageColors(data,type);for(let i=0;i<data.length;i+=4){assert.equal(data[i+3],alpha[i/4]);if(data[i+3])assert.ok(allowed.has((data[i]<<16)|(data[i+1]<<8)|data[i+2]),type);}
  const first=new Uint8ClampedArray(data);mapVillageColors(data,type);assert.deepEqual(data,first,'palette normalization is stable');
 }
});
test('each visible station and Zag are anchored inside their matching clickable building',()=>{
 const art={forge:'forge',tree:'tree',lift:'lift',well:'well',missions:'board',stars:'shrine',zag:'roulette',records:'gramophone',miner:'miningMachine'};
 for(const h of HOTSPOTS){const p=FLOW_PROPS.find(p=>p[0]===art[h.id]);assert.ok(Math.abs(p[1]*2-h.x)<=h.w/2,h.id);assert.ok(p[2]*2>=h.y-h.h/2&&p[2]*2<=h.y+h.h/2,h.id);}
 const zag=FLOW_PROPS.find(p=>p[0]==='zag'),target=HOTSPOTS.find(h=>h.id==='zag');assert.ok(Math.abs(zag[1]*2-target.x)<=target.w/2);
});
