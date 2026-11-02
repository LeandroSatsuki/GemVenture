import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const source=process.argv[2]||'E:/assets GemVenture/production/approved-art-v1/manifest.json';
const manifest=JSON.parse(await readFile(source,'utf8')),rows=[];
const alphaAudit=JSON.parse(await readFile(path.join(root,'docs/art/approved-alpha-audit.json'),'utf8'));
const folder=path.join(root,'dist/assets/approved-art');await mkdir(folder,{recursive:true});
for(const entry of manifest.entries){
 // Local, independently measured alpha/hash evidence is required, including
 // the mole file whose historical name contains "previa". No trust in a label.
 const alpha=alphaAudit.entries.find(a=>a.id===entry.id);
 if(!alpha||alpha.sha256!==entry.sha256||alpha.zeroAlpha<=0)throw new Error('Missing independent alpha proof: '+entry.id);
 if(!['ready','approved-transparent-source'].includes(entry.status))continue;
 const [x,y,right,bottom]=entry.bbox,[width,height]=entry.size;
 if(!/^[\w-]+\.png$/.test(entry.file)||![x,y,right,bottom,width,height,...entry.anchor].every(Number.isFinite)||right<=x||bottom<=y||x<0||y<0||right>width||bottom>height)throw new Error('Invalid approved art metadata: '+entry.id);
 const bytes=await readFile(entry.source),sha256=createHash('sha256').update(bytes).digest('hex');
 if(sha256!==entry.sha256||bytes.readUInt32BE(16)!==width||bytes.readUInt32BE(20)!==height)throw new Error('Source changed: '+entry.id);
 await copyFile(entry.source,path.join(folder,entry.file));
 rows.push({id:entry.id,type:entry.type,biome:entry.biome,variant:entry.variant,file:entry.file,width,height,bounds:{x,y,width:right-x,height:bottom-y},anchor:{x:entry.anchor[0],y:entry.anchor[1]},fit:{width:100,height:96},sha256,source:entry.source});
}
if(rows.length<77||rows.length>80)throw new Error('Unexpected approved asset count: '+rows.length);
const js="// Approved source pixels are copied byte-for-byte; metadata anchors the original artwork.\nexport const APPROVED_ART_ROOT='assets/approved-art/';\nexport const APPROVED_EMBEDDED=Object.freeze({});\nexport const APPROVED_ART=Object.freeze("+JSON.stringify(rows,null,1)+'.map(spec=>Object.freeze({...spec,bounds:Object.freeze(spec.bounds),anchor:Object.freeze(spec.anchor),fit:Object.freeze(spec.fit)})));\n';
await writeFile(path.join(root,'dist/approved-art-manifest.js'),js);
await writeFile(path.join(folder,'manifest.json'),JSON.stringify({version:1,sourceManifest:source,entries:rows},null,2)+'\n');
console.log(JSON.stringify({copied:rows.length,sourcePixels:'unchanged',pending:manifest.entries.filter(e=>!rows.some(r=>r.id===e.id)).map(e=>e.id)}));
