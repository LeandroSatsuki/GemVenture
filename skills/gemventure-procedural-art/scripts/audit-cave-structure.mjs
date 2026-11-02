// Read-only diagnostics of the real floor generator. No browser, save or RNG mutation.
// node <script> <checkout> <output-directory> [seeds-per-biome=100]
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const [checkoutArg,outArg,countArg='100']=process.argv.slice(2);
if(!checkoutArg||!outArg)throw Error('Usage: audit-cave-structure.mjs <checkout> <output-directory> [seeds-per-biome=100]');
const count=Number(countArg);
if(!Number.isSafeInteger(count)||count<1||count>1000)throw Error('Seeds per biome must be 1..1000');
const checkout=resolve(checkoutArg),out=resolve(outArg);
const E=await import(pathToFileURL(join(checkout,'dist/core.js')));
const {BIOME_COUNT,FLOORS_PER_BIOME}=await import(pathToFileURL(join(checkout,'dist/campaign.js')));
const {validateLayout}=await import(pathToFileURL(join(checkout,'dist/cave-layout.js')));
const {ENVIRONMENTS}=await import(pathToFileURL(join(checkout,'dist/cavern.js')));
const round=n=>Math.round(n*100)/100;
const adjacent=(i,cols,rows)=>[[i%cols+1,Math.floor(i/cols)],[i%cols-1,Math.floor(i/cols)],[i%cols,Math.floor(i/cols)+1],[i%cols,Math.floor(i/cols)-1]].filter(([x,y])=>x>=0&&y>=0&&x<cols&&y<rows).map(([x,y])=>y*cols+x);
function flood(mask,cols,rows,start){
 const dist=new Int32Array(mask.length).fill(-1);if(!mask[start])return dist;
 const q=[start];dist[start]=0;
 for(let p=0;p<q.length;p++)for(const j of adjacent(q[p],cols,rows))if(mask[j]&&dist[j]<0){dist[j]=dist[q[p]]+1;q.push(j);}
 return dist;
}
function clearance(mask,cols,rows){
 const d=new Int32Array(mask.length).fill(-1),q=[];
 mask.forEach((v,i)=>{if(!v){d[i]=0;q.push(i);}});
 for(let p=0;p<q.length;p++)for(const j of adjacent(q[p],cols,rows))if(d[j]<0){d[j]=d[q[p]]+1;q.push(j);}
 return d;
}
function coreComponents(mask,dist,cols,rows){
 const remaining=new Set(mask.flatMap((v,i)=>v&&dist[i]>=4?[i]:[]));let components=0;
 while(remaining.size){components++;const q=[remaining.values().next().value];remaining.delete(q[0]);for(let p=0;p<q.length;p++)for(const j of adjacent(q[p],cols,rows))if(remaining.delete(j))q.push(j);}
 return components;
}
function inspect(seed,floor){
 const s=E.createState(seed);s.seals=BIOME_COUNT-1;if(!E.startRun(s))throw Error('Could not start fixture');s.run.floor=floor;E.generateRoom(s);
 const r=s.run.room,{cols,rows,floorMask:mask}=r,start=s.run.player.y*cols+s.run.player.x,end=r.exit.y*cols+r.exit.x;
 const bare=flood(mask,cols,rows,start),free=mask.slice();
 for(const rock of r.rocks)if(rock.hp==null||rock.hp>0)free[rock.y*cols+rock.x]=0;
 const populated=flood(free,cols,rows,start),d=clearance(mask,cols,rows),area=mask.reduce((a,b)=>a+b,0);
 const unreachableCrystalApproaches=r.nodes.filter(n=>!adjacent(n.y*cols+n.x,cols,rows).some(i=>populated[i]>=0)).length;
 const result={seed,floor,cols,rows,layoutValid:validateLayout(r),declaredChambers:r.layout.rooms.length,openTiles:area,openPercent:round(area/((cols-2)*(rows-2))*100),protectedPercent:round(new Set(r.layout.protectedTiles).size/area*100),rockCount:r.rocks.length,crystalCount:r.nodes.length,bareExitDistance:bare[end],populatedExitDistance:populated[end],reachableFreeTiles:[...populated].filter(v=>v>=0).length,totalFreeTiles:free.reduce((a,b)=>a+b,0),unreachableCrystalApproaches,broadCoreComponentsAtL1Clearance4:coreComponents(mask,d,cols,rows),maskHash:createHash('sha256').update(JSON.stringify(mask)).digest('hex')};
 return {result,sample:{...result,mask,protectedTiles:r.layout.protectedTiles,rocks:r.rocks.map(n=>({x:n.x,y:n.y})),nodes:r.nodes.map(n=>({x:n.x,y:n.y})),player:s.run.player,exit:r.exit}};
}
const metric=values=>({min:Math.min(...values),mean:round(values.reduce((a,b)=>a+b,0)/values.length),max:Math.max(...values)});
const rows=[],biomes=[],samples=[];
for(let b=0;b<BIOME_COUNT;b++){
 const batch=[];
 for(let i=0;i<count;i++){const {result,sample}=inspect(i+1,b*FLOORS_PER_BIOME+1);rows.push(result);batch.push(result);if(i===0)samples.push(sample);}
 biomes.push({biome:b,name:ENVIRONMENTS[b].name,floor:b*FLOORS_PER_BIOME+1,cases:count,uniqueMasks:new Set(batch.map(r=>r.maskHash)).size,...Object.fromEntries(['openPercent','protectedPercent','rockCount','bareExitDistance','populatedExitDistance','broadCoreComponentsAtL1Clearance4'].map(k=>[k,metric(batch.map(r=>r[k]))])),invalidLayouts:batch.filter(r=>!r.layoutValid).length,unreachableExits:batch.filter(r=>r.populatedExitDistance<0).length,unreachableCrystalApproaches:batch.reduce((n,r)=>n+r.unreachableCrystalApproaches,0)});
}
for(const seed of [712,41001])for(const floor of [1,11,21])samples.push(inspect(seed,floor).sample);
const bosses=Array.from({length:BIOME_COUNT},(_,b)=>inspect(712,(b+1)*FLOORS_PER_BIOME).result);
const files=['dist/core.js','dist/cave-layout.js','dist/cavern.js','dist/campaign.js'];
const sourceSha256=Object.fromEntries(await Promise.all(files.map(async f=>[f,createHash('sha256').update(await readFile(join(checkout,f))).digest('hex')])));
const summary={schemaVersion:1,scope:'Architecture and initial population, in-memory real generator; no simulated combat, visibility review or human approval',seedRange:[1,count],sourceSha256,cases:rows.length,biomes,bosses,definitions:{openPercent:'Open cells / interior rectangular cells',protectedPercent:'Distinct protected floor cells / all open cells',broadCoreComponentsAtL1Clearance4:'Connected components of floor cells at Manhattan wall distance >=4; diagnostic only, NOT a room count',bareExitDistance:'Four-neighbor shortest route in cells before rocks',populatedExitDistance:'Four-neighbor shortest route in cells with living rocks blocking; -1 means unreachable',unreachableCrystalApproaches:'Nodes with no reachable adjacent free tile; initial state only',limits:'No proof of dodge safety, terrain travel cost, pace, input, occlusion, performance or artistic quality. Boss sample is one seed per biome; common-floor sample uses first floor of each biome.'}};
await mkdir(out,{recursive:true});
await writeFile(join(out,'structure-summary.json'),JSON.stringify(summary,null,2)+'\n');
await writeFile(join(out,'structure-cases.json'),JSON.stringify(rows,null,2)+'\n');
await writeFile(join(out,'topology-samples.json'),JSON.stringify(samples,null,2)+'\n');
const chosen=samples.filter(r=>[712,41001].includes(r.seed));
const panels=chosen.map((r,i)=>{const ox=24+(i%3)*360,oy=95+Math.floor(i/3)*300,cell=7.5;let shapes='';r.mask.forEach((v,j)=>{if(v)shapes+=`<rect x="${ox+j%r.cols*cell}" y="${oy+Math.floor(j/r.cols)*cell}" width="${cell}" height="${cell}" fill="${r.protectedTiles.includes(j)?'#265b64':'#747d8d'}"/>`;});for(const n of r.rocks)shapes+=`<circle cx="${ox+(n.x+.5)*cell}" cy="${oy+(n.y+.5)*cell}" r="2.1" fill="#252a38"/>`;for(const n of r.nodes)shapes+=`<circle cx="${ox+(n.x+.5)*cell}" cy="${oy+(n.y+.5)*cell}" r="1.8" fill="#ca7cbd"/>`;for(const [n,color]of [[r.player,'#ffd95a'],[r.exit,'#fffbe3']])shapes+=`<rect x="${ox+n.x*cell}" y="${oy+n.y*cell}" width="${cell}" height="${cell}" fill="${color}"/>`;return `<text x="${ox}" y="${oy-22}">Seed ${r.seed} · andar ${r.floor}</text><text x="${ox}" y="${oy+252}" font-size="12">${r.openPercent}% aberto · ${r.protectedPercent}% protegido</text>${shapes}`;}).join('');
await writeFile(join(out,'topology-baseline.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="700" viewBox="0 0 1100 700"><rect width="1100" height="700" fill="#151926"/><g font-family="sans-serif" fill="#ebece4"><text x="24" y="27" font-size="20">GemVenture · diagnóstico da topologia atual</text><text x="24" y="49" font-size="13">Planta lógica, sem perspectiva: ciano = piso protegido; rosa = cristal; amarelo = entrada; branco = saída.</text>${panels}<text x="24" y="687" font-size="12">Gerador real em memória. Este diagrama não é arte candidata nem revisão visual de gameplay.</text></g></svg>`);
console.log(JSON.stringify({cases:rows.length,bossCases:bosses.length,biomeCount:biomes.length,invalidLayouts:rows.filter(r=>!r.layoutValid).length,unreachableExits:rows.filter(r=>r.populatedExitDistance<0).length,unreachableCrystalApproaches:rows.reduce((n,r)=>n+r.unreachableCrystalApproaches,0),exitDistances:[...new Set(rows.map(r=>r.populatedExitDistance))],out},null,2));
