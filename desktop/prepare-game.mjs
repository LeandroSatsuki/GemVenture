import fs from'node:fs/promises';import path from'node:path';import{pathToFileURL}from'node:url';
const here=import.meta.dirname,root=path.resolve(process.env.GEMVENTURE_GAME_ROOT||path.join(here,'..')),game=path.join(here,'game');
const{planRelease}=await import(pathToFileURL(path.join(root,'tools/build-release.mjs')));
if(await fs.stat(game).catch(()=>null))throw Error('O diretório game já foi preparado. Use uma árvore de build nova para evitar misturar versões.');
const plan=planRelease(root);await fs.mkdir(game,{recursive:true});
for(const file of plan.files){const to=path.resolve(game,file);if(!to.startsWith(game+path.sep))throw Error('Invalid release path');await fs.mkdir(path.dirname(to),{recursive:true});await fs.copyFile(path.join(root,'dist',file),to);}
for(const file of['CREDITS.md','LICENSE'])await fs.copyFile(path.join(root,file),path.join(game,file));
await fs.writeFile(path.join(game,'desktop-build.json'),JSON.stringify({version:JSON.parse(await fs.readFile(here+'/package.json')).version,files:plan.files.length,bytes:plan.bytes,source:root,at:new Date().toISOString(),artRecompressed:false,gameplayRewritten:false},null,2));
console.log(JSON.stringify({game,files:plan.files.length,bytes:plan.bytes}));
