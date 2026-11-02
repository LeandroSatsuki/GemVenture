import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {build} from 'esbuild';

// Run after build:release. Never overwrite a release or change the source.
const [sourceArg,outputArg]=process.argv.slice(2);
if(!sourceArg||!outputArg)throw Error('Usage: node tools/build-itch.mjs SOURCE_RELEASE NEW_OUTPUT');
const base=path.resolve(sourceArg),out=path.resolve(outputArg);
if(out===base||out.startsWith(base+path.sep))throw Error('Output must be outside the source release');
const manifest=JSON.parse(await fs.readFile(path.join(base,'release-manifest.json'),'utf8'));
const all=manifest.files.map(f=>f.file),cssRefs=new Set(),texts=[];
for(const file of all.filter(f=>/\.(js|html|css)$/.test(f))){
 const text=await fs.readFile(path.join(base,file),'utf8');texts.push(text);
 if(file.endsWith('.css'))for(const m of text.matchAll(/url\(\s*['"]?([^\s'")]+)['"]?\s*\)/g))if(!/^(data:|https?:|#)/.test(m[1]))cssRefs.add(path.posix.normalize(path.posix.join(path.posix.dirname(file),m[1])));
}
const literals=[...texts.join('\n').matchAll(/['"`]([^'"`\n]*assets\/[^'"`\n]*)['"`]/g)].map(m=>m[1]);
const literalSet=new Set(literals.map(s=>s.replace(/^\.\//,'')));
const eligible=manifest.files.filter(f=>{
 if(!f.file.endsWith('.png')||f.bytes>=100000||cssRefs.has(f.file)||!literalSet.has(f.file))return false;
 const dir=path.posix.dirname(f.file);
 return !literals.some(s=>(s===dir||s.startsWith(dir+'/'))&&!/\.(png|webp|svg|ttf|json)(?:[?#].*)?$/.test(s));
}).sort((a,b)=>a.bytes-b.bytes||a.file.localeCompare(b.file));
const selected=eligible.slice(0,260),encoded=new Map();
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const f of selected){const bytes=await fs.readFile(path.join(base,f.file));encoded.set(f.file,'data:image/png;base64,'+bytes.toString('base64'));}
function inline(text){return text.replace(/(['"`])(\.\/)?(assets\/[A-Za-z0-9_./-]+\.png)\1/g,(match,quote,relative,name)=>encoded.has(name)?quote+encoded.get(name)+quote:match);}
await fs.mkdir(out,{recursive:false});
for(const f of all){if(f.endsWith('.js')||encoded.has(f))continue;await fs.mkdir(path.dirname(path.join(out,f)),{recursive:true});const bytes=await fs.readFile(path.join(base,f));await fs.writeFile(path.join(out,f),f==='index.html'?inline(bytes.toString()):bytes);}
for(const f of ['CREDITS.md','LICENSE'])await fs.copyFile(path.join(base,f),path.join(out,f));
const index=await fs.readFile(path.join(base,'index.html'),'utf8');
const entryPoints=new Set(['menu-entry.js','campaign-cave-raster-worker.js']);
for(const match of index.matchAll(/(?:from\s*|src=)['"]\.\/?([^'"]+\.js)['"]/g))entryPoints.add(match[1]);
// Keep chunks beside the original modules: runtime CSS uses import.meta.url.
const result=await build({absWorkingDir:base,entryPoints:[...entryPoints],outdir:out,bundle:true,splitting:true,format:'esm',platform:'browser',target:'es2022',minify:false,keepNames:true,treeShaking:false,legalComments:'inline',entryNames:'[name]',chunkNames:'[name]-[hash]',metafile:true,plugins:[{name:'lossless-static-png-transport',setup(api){api.onLoad({filter:/\.js$/},async a=>({contents:inline(await fs.readFile(a.path,'utf8')),loader:'js'}));}}]});
async function walk(dir,rel=''){let files=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const f=rel?rel+'/'+e.name:e.name;if(e.isDirectory())files.push(...await walk(path.join(dir,e.name),f));else files.push(f);}return files;}
const output=await walk(out);if(output.length>1000)throw Error('Itch file cap exceeded: '+output.length);
let preserved=0;for(const f of output){if(f.endsWith('.js')||f==='index.html')continue;const [a,b]=await Promise.all([fs.readFile(path.join(base,f)),fs.readFile(path.join(out,f))]);if(!a.equals(b))throw Error('Preserved bytes differ: '+f);preserved++;}
for(const [file,uri]of encoded)if(hash(Buffer.from(uri.split(',')[1],'base64'))!==hash(await fs.readFile(path.join(base,file))))throw Error('Lossless encoding mismatch: '+file);
const receipt={source:base,output:out,files:output.length,entryPoints:[...entryPoints],sourceModules:Object.keys(result.metafile.inputs).length,encodedImages:selected.map(f=>f.file),byteIdenticalFiles:preserved,minified:false,treeShaking:false,gameplayChanged:false,artRecompressed:false};
await fs.writeFile(out+'.packaging.json',JSON.stringify(receipt,null,2));
console.log(JSON.stringify(receipt,null,2));
