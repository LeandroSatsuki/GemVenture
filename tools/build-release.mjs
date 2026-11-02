import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';

const gameRoot=fileURLToPath(new URL('../',import.meta.url));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function walk(root,dir=root){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{if(e.isSymbolicLink())throw Error('Release cannot include symbolic links');const f=path.join(dir,e.name);return e.isDirectory()?walk(root,f):[path.relative(root,f).split(path.sep).join('/')];});}
export function planRelease(root=gameRoot){
 const dist=path.join(root,'dist'),all=walk(dist),known=new Set(all),source=new Map(all.filter(f=>/\.(html|css|js)$/.test(f)&&!f.startsWith('assets/')).map(f=>[f,fs.readFileSync(path.join(dist,f),'utf8')]));
 const selected=new Set(['index.html','icon.svg']),queue=['index.html'];
 // CSS may be inserted at runtime by a service. Include every maintained sheet,
 // then follow its local URLs; never infer dead code from import syntax alone.
 for(const f of source.keys())if(f.endsWith('.css')){selected.add(f);queue.push(f);}
 function add(owner,url){if(/^(?:https?:|data:|#|\/\/)/.test(url))return;const clean=url.split(/[?#]/)[0];if(!clean||clean.includes('${'))return;const f=path.posix.normalize(clean.startsWith('/')?clean.slice(1):path.posix.join(path.posix.dirname(owner),clean));if(known.has(f)&&!selected.has(f)){selected.add(f);if(source.has(f))queue.push(f);}}
 for(let i=0;i<queue.length;i++){const owner=queue[i],s=source.get(owner)||'';
  for(const m of s.matchAll(/(?:from\s*|import\s*\()(['"])(\.\.?\/[^'"]+\.js)\1/g))add(owner,m[2]);
  // Module workers are URL entries rather than imports in the main graph.
  for(const m of s.matchAll(/new\s+URL\(\s*['"](\.?\/?[A-Za-z0-9_./-]+\.js)['"]/g))add(owner,m[1]);
  for(const m of s.matchAll(/['"](\.?\/?[A-Za-z0-9_./-]+\.(?:css|json|svg))['"]/g))add(owner,m[1]);
  if(owner.endsWith('.html'))for(const m of s.matchAll(/(?:src|href)=["']([^"']+)["']/g))if(!/^(?:art-studio|music-lab|terrain-studio|vfx-gallery|asset-catalog|balance-report|village-preview)\.html/.test(m[1]))add(owner,m[1]);
  if(owner.endsWith('.css'))for(const m of s.matchAll(/url\(\s*['"]?([^\s'"\)]+)['"]?\s*\)/g))add(owner,m[1]);
 }
 // Atlas/frame names and audio URLs are assembled from data. Retain the entire
 // referenced family, including its manifests/licenses and every cosmetic.
 const text=[...selected].map(f=>source.get(f)||'').join('\n'),families=new Set();
 for(const f of all)if(f.startsWith('assets/')){const family=f.split('/').slice(0,2).join('/');if(text.includes(family))families.add(family);}
 for(const f of all)if([...families].some(g=>f===g||f.startsWith(g+'/')))selected.add(f);
 const files=[...selected].filter(f=>known.has(f)&&!f.startsWith('qa-')).sort();
 return{files,families:[...families].sort(),excluded:all.filter(f=>!files.includes(f)),bytes:files.reduce((n,f)=>n+fs.statSync(path.join(dist,f)).size,0),distBytes:all.reduce((n,f)=>n+fs.statSync(path.join(dist,f)).size,0)};
}
export function buildRelease({root=gameRoot,out}={}){
 const parent=path.resolve(root,'../releases');out=path.resolve(out||path.join(parent,'GemVenture-web-'+new Date().toISOString().replace(/[:.]/g,'-')));
 if(!out.startsWith(parent+path.sep))throw Error('Release output must stay inside '+parent);
 if(fs.existsSync(out))throw Error('Use a fresh release directory; existing builds are never deleted');
 const plan=planRelease(root),rows=[];fs.mkdirSync(out,{recursive:true});
 for(const file of plan.files){const target=path.resolve(out,file);if(!target.startsWith(out+path.sep))throw Error('Unsafe release path');fs.mkdirSync(path.dirname(target),{recursive:true});let body=fs.readFileSync(path.join(root,'dist',file));
  if(file==='index.html')body=Buffer.from(body.toString('utf8').replace(/<a href="(?:art-studio|music-lab)\.html"[^>]*>[\s\S]*?<\/a>\s*·?\s*/g,''));
  fs.writeFileSync(target,body);rows.push({file,bytes:body.length,sha256:hash(body)});
 }
 for(const file of ['CREDITS.md','LICENSE']){fs.copyFileSync(path.join(root,file),path.join(out,file));}
 const receipt={at:new Date().toISOString(),entry:'index.html',method:'Conservative native import closure, maintained CSS, full referenced dynamic asset families. No minification, art recompression or gameplay rewriting.',files:rows,bytes:rows.reduce((n,r)=>n+r.bytes,0),families:plan.families,excluded:plan.excluded,developmentFilesShipped:false,steamworksIntegrated:false};
 fs.writeFileSync(path.join(out,'release-manifest.json'),JSON.stringify(receipt,null,2));return{out,files:rows.length,bytes:receipt.bytes,excluded:plan.excluded.length,distBytes:plan.distBytes};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(buildRelease({out:process.argv[2]}),null,2));
