import {readFile,mkdir,copyFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {APPROVED_ART} from '../dist/approved-art-manifest.js';

const source=path.resolve(process.argv[2]||'E:/assets GemVenture/production/minion-effects-v1');
const destination=new URL('../dist/assets/minion-vfx/',import.meta.url);
const manifest=JSON.parse(await readFile(path.join(source,'manifest.json'),'utf8'));
const hashes=JSON.parse(await readFile(path.join(source,'SHA256.json'),'utf8'));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const spec of manifest.effects){
 const body=APPROVED_ART.find(a=>a.file===spec.sourceAsset);
 if(!body||body.sha256!==spec.sourceSha256)throw new Error('Unmatched approved source: '+spec.id);
}
const files=[...new Set(manifest.effects.flatMap(e=>[e.normalFile,e.softFile]))];
if(files.length!==48||manifest.effects.length!==42)throw new Error('Incomplete minion effects delivery');
for(const file of files){
 const bytes=await readFile(path.join(source,file)),proof=hashes.find(h=>h.path.replaceAll('\\','/')===file);
 if(!proof||digest(bytes)!==proof.sha256.toLowerCase())throw new Error('Hash mismatch: '+file);
 if(bytes.readUInt32BE(16)!==384||bytes.readUInt32BE(20)!==288)throw new Error('Wrong atlas dimensions: '+file);
}
await mkdir(new URL('atlas/',destination),{recursive:true});
for(const file of files)await copyFile(path.join(source,file),new URL(file,destination));
await copyFile(path.join(source,'minion-effects-player.js'),new URL('../dist/minion-effects-player.js',import.meta.url));
await writeFile(new URL('manifest.json',destination),JSON.stringify(manifest,null,2)+'\n');
await writeFile(new URL('SHA256.json',destination),JSON.stringify(hashes.filter(h=>files.includes(h.path.replaceAll('\\','/'))),null,2)+'\n');
const sourceCode='// Imported from the dedicated VFX production; original PNGs are unchanged.\n'+
 'export const MINION_EFFECTS=Object.freeze('+JSON.stringify(manifest.effects)+');\n'+
 'export const MINION_DEATH_BUNDLES=Object.freeze('+JSON.stringify(manifest.deathBundles)+');\n'+
 'export const MINION_VFX_EMBEDDED=Object.freeze({});\n';
await writeFile(new URL('../dist/minion-vfx-manifest.js',import.meta.url),sourceCode);
console.log(JSON.stringify({effects:manifest.effects.length,atlases:files.length,status:'verified and imported'}));
