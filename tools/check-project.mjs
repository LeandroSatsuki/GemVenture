import {readdir,readFile,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url)),errors=[];
async function files(dir){const rows=[];for(const e of await readdir(path.join(root,dir),{withFileTypes:true})){const f=path.posix.join(dir,e.name);if(e.isDirectory())rows.push(...await files(f));else rows.push(f);}return rows;}
async function exists(file,owner){try{await access(file);}catch{errors.push(owner+': missing '+path.relative(root,file));}}
const dirs=['dist','tests','tools','skills'];let scripts=0,refs=0;
for(const folder of dirs)for(const name of await files(folder)){
 if(!/\.(js|mjs)$/.test(name))continue;scripts++;
 const checked=spawnSync(process.execPath,['--check',path.join(root,name)],{encoding:'utf8'});if(checked.status!==0)errors.push(name+': invalid syntax');
 if(!name.startsWith('dist/'))continue;
 const code=await readFile(path.join(root,name),'utf8');
 for(const match of code.matchAll(/(?:from\s*|import\s*\()(['"])(\.\.?\/[^'"]+)\1/g)){await exists(path.resolve(root,path.dirname(name),match[2]),name);refs++;}
}
for(const name of (await files('dist')).filter(f=>f.endsWith('.html'))){
 const html=await readFile(path.join(root,name),'utf8');
 for(const m of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){
  const url=m[1];if(/^(?:https?:|data:|mailto:|#|\/\/)/.test(url)||url.includes('${'))continue;
  const file=url.split(/[?#]/)[0];if(!file)continue;
  await exists(path.resolve(root,path.dirname(name),file),name);refs++;
 }
}
const readme=await readFile(path.join(root,'README.md'),'utf8');
for(const m of readme.matchAll(/(?:\]\(|(?:src|href)=["'])([^\s)"']+)/g)){
 const url=m[1];if(/^(?:https?:|#)/.test(url))continue;await exists(path.resolve(root,url), 'README.md');refs++;
}
if(errors.length){for(const e of errors)console.error(e);process.exitCode=1;}else console.log(JSON.stringify({scripts,localReferences:refs,status:'ok'}));
