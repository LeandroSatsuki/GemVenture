import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

// Read-only inventory. Findings require review; this tool never deletes files.
const root=process.argv[2]?path.resolve(process.argv[2]):fileURLToPath(new URL('../',import.meta.url));
const dist=path.join(root,'dist');
async function walk(dir){
 const rows=[];
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const name=path.join(dir,entry.name);
  if(entry.isSymbolicLink())continue;
  if(entry.isDirectory())rows.push(...await walk(name));else if(entry.isFile())rows.push(name);
 }
 return rows;
}
const files=await walk(dist),sources=new Map();
for(const file of files){
 const relative=path.relative(dist,file).split(path.sep).join('/');
 if(/^(?:assets|asset-reference)\//.test(relative)||!/\.(?:js|css|html)$/.test(file))continue;
 sources.set(relative,await readFile(file,'utf8'));
}
const media=files.filter(file=>file.startsWith(path.join(dist,'assets')+path.sep)&&/\.(?:png|jpe?g|webp|gif|svg|avif|woff2?|ttf|otf|wav|ogg|mp3|mp4|webm)$/i.test(file));
const dynamic=new Set();
// The gate consumer constructs its hero/nav srcset in three resolutions.
const gate=sources.get('abyss-gate-art.js')||'';
if(gate.includes('assets/abyss-gate-r2/gate-')&&gate.includes("image('hero'")&&gate.includes("image('nav'")){
 for(const role of ['hero','nav'])for(const scale of [1,2,4])dynamic.add(`assets/abyss-gate-r2/gate-${role}-${scale}x-v01.png`);
}
// The village loader adds .png to the keys of its current fallback registry.
const village=sources.get('flow-village.js')||'';
if(village.includes("VILLAGE_ART_ROOT+file+'.png'")){
 const map=village.match(/FLOW_ART=Object\.freeze\(\{([^}]+)\}/)?.[1]||'';
 for(const match of map.matchAll(/:\s*'([^']+)'/g))dynamic.add(`assets/village-hept32/${match[1]}.png`);
}
// Terrain downloads are generated from the actual authoring material registry.
const terrain=sources.get('terrain-studio.js')||'';
if(terrain.includes("assets/terrain-kit-v1/'+material.id+suffix")){
 const {TERRAIN_MATERIALS}=await import(pathToFileURL(path.join(dist,'terrain-kit.js')).href);
 for(const {id} of TERRAIN_MATERIALS){
  dynamic.add(`assets/terrain-kit-v1/${id}-template.png`);
  // Editable sources belong to the same maintained template download bundle.
  dynamic.add(`assets/terrain-kit-v1/${id}-template.svg`);
 }
 dynamic.add('assets/terrain-kit-v1/guia-encaixes.png');
 dynamic.add('assets/terrain-kit-v1/mascaras.png');
}
// Current atlases/cosmetics assemble frame filenames from an explicit family
// root. Keep the family conservatively, including its editable source files.
// This is a liveness audit, never permission to remove individual family files.
const sourceText=[...sources.values()].join('\n'),families=new Set();
for(const file of media){const relative=path.relative(dist,file).split(path.sep).join('/'),family=relative.split('/').slice(0,2).join('/');if(sourceText.includes(family))families.add(family);}
let testText='';try{for(const file of await walk(path.join(root,'tests')))if(/\.(?:mjs|js)$/.test(file))testText+='\n'+await readFile(file,'utf8');}catch{}
const findings=[],missing=new Set(),testOnly=[];let bytes=0,matched=0;
for(const file of media){
 const relative=path.relative(dist,file).split(path.sep).join('/'),base=path.basename(file);
 const family=relative.split('/').slice(0,2).join('/'),runtime=dynamic.has(relative)||families.has(family)||sourceText.includes(relative)||sourceText.includes('/'+base)||sourceText.includes("'"+base+"'")||sourceText.includes('"'+base+'"'),regression=!runtime&&(testText.includes(relative)||testText.includes(family+'/'));
 const referenced=runtime||regression;if(regression)testOnly.push(relative);
 bytes+=(await stat(file)).size;
 if(referenced)matched++;else findings.push(relative);
}
// Check concrete src/href and CSS URLs, avoiding provenance and proposed URLs.
for(const [owner,code]of sources)for(const match of code.matchAll(/(?:\b(?:src|href)\s*=\s*["']|url\(\s*["']?)(\.?\/?assets\/[^\s"'<>\)]+)["'\)]/g)){
 const url=match[1].split(/[?#]/)[0];if(url.includes('${')||!/\.[a-z0-9]{2,5}$/i.test(url))continue;
 const target=path.resolve(dist,path.dirname(owner),url);
 if(!files.includes(target))missing.add(owner+': '+url);
}
for(const url of dynamic)if(!files.includes(path.join(dist,...url.split('/'))))missing.add('dynamic registry: '+url);
console.log(JSON.stringify({mediaFiles:media.length,megabytes:+(bytes/1048576).toFixed(2),referenced:matched,dynamicFamilies:families.size,testOnly,policy:'Conservative family roots, not a proof of per-file use; regression-only art is retained but not necessarily shipped.',unreferenced:findings,missing:[...missing],status:findings.length||missing.size?'review':'ok'},null,2));
if(findings.length||missing.size)process.exitCode=1;
