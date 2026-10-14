import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {FLOW_ART} from './dist/flow-village.js';
// Portable local deliverable; it neither deploys nor changes the hosted Site.
const root=new URL('./',import.meta.url);
const names=['talents','astral','progression-effects','balance','palette','pickaxe-style','zag','campaign','cave-layout','cave-ceiling','cavern','creatures','materials','miner','village','pillars','bosses','score','cards','abyss-cards','rewards','records','missions','stars','gear','forge','frenzy','descent-progress','core','effects','pack-art','scene-art','boss-art','creature-art','art-kit','flow-village','world','art-studio'];
const flowImages=Object.fromEntries(await Promise.all(Object.values(FLOW_ART).map(async file=>[file,'data:image/png;base64,'+(await readFile(new URL('dist/assets/village-hept32/'+file+'.png',root))).toString('base64')])));
const sources=new Map(await Promise.all(names.map(async name=>{let source=await readFile(new URL('dist/'+name+'.js',root),'utf8');if(name==='flow-village')source=source.replace("image.src=VILLAGE_ART_ROOT+file+'.png'",'image.src='+JSON.stringify(flowImages)+'[file]');return ['./'+name+'.js',source];})));
const declared=new Map([...sources].map(([id,source])=>[id,[...source.matchAll(/export (?:const|let|function|class) (\w+)/g)].map(m=>m[1])]));
const reexports=/export\s*\{([^}]+)\}\s*from\s*(['"])([^'"]+)\2\s*;/g;
const bindings=text=>text.split(',').map(s=>s.trim().split(/\s+as\s+/));
const symbols=new Map([...sources].map(([id,source])=>[id,[...declared.get(id),...[...source.matchAll(reexports)].flatMap(m=>bindings(m[1]).map(([symbol,alias])=>alias||symbol))]]));
const factories=[];
for(const name of names){
 const source=sources.get('./'+name+'.js'),exported=declared.get('./'+name+'.js');
 // These modules contain only named relative imports and exports.
 const body=source.replace(/import\s*\{([^}]+)\}\s*from\s*(['"])([^'"]+)\2\s*;/g,(_,bindings,quote,id)=>{const names=bindings.split(',').map(s=>s.trim().split(/\s+as\s+/));for(const [symbol]of names)if(!symbols.get(id)?.includes(symbol))throw new Error('Missing portable export '+id+':'+symbol);return 'const {'+names.map(([symbol,alias])=>symbol+(alias?':'+alias:'')).join(',')+'}=require('+JSON.stringify(id)+');';})
  .replace(reexports,(_,list,quote,id)=>{const names=bindings(list);for(const [symbol]of names)if(!symbols.get(id)?.includes(symbol))throw new Error('Missing portable re-export '+id+':'+symbol);return 'Object.assign(exports,{'+names.map(([symbol,alias])=>JSON.stringify(alias||symbol)+':require('+JSON.stringify(id)+')['+JSON.stringify(symbol)+']').join(',')+'});';})
  .replace(/\bexport (?=(?:const|let|function|class) )/g,'');
 factories.push(JSON.stringify('./'+name+'.js')+':(exports,require)=>{\n"use strict";\n'+body+'\nObject.assign(exports,{'+exported.join(',')+'});\n}');
}
let html=await readFile(new URL('dist/art-studio.html',root),'utf8');
const css=await readFile(new URL('dist/art-studio.css',root),'utf8'),icon=await readFile(new URL('dist/icon.svg',root),'utf8');
const iconUrl='data:image/svg+xml;base64,'+Buffer.from(icon).toString('base64');
const code='(()=>{const factories={'+factories.join(',\n')+'};const cache={};function require(id){if(cache[id])return cache[id];const exports={};cache[id]=exports;factories[id](exports,require);return exports;}require("./art-studio.js");})();';
html=html.replace('<link rel="stylesheet" href="art-studio.css">','<style>'+css+'</style>')
 .replaceAll('href="icon.svg"','href="'+iconUrl+'"').replaceAll('src="icon.svg"','src="'+iconUrl+'"')
 .replaceAll('href="./"','href="https://gemventure.preferenza-0013.chatgpt.site/"')
 .replace('<script type="module" src="art-studio.js"></script>','<script>'+code.replaceAll('</script','<\\/script')+'</script>');
if(process.argv.includes('--stdout'))process.stdout.write(html);
else{const output=new URL('atelie-gemventure.html',root);await writeFile(output,html,'utf8');console.log(fileURLToPath(output));}
