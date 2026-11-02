// Separate QA origin: seeded previews never overwrite the player's 4173/4174 saves.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url)),tests=fileURLToPath(new URL('./',import.meta.url));
const port=Number(process.argv[2])||4175;
const routes=new Set(['approved-services-fixture.html','expedition-init.js','input-check.js','hedgehog-check.js','cave-gallery.html','fx-preview.html','minion-effects-preview.html','movement-preview.html','music-review.html']);
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost'),name=decodeURIComponent(url.pathname).slice(1)||'index.html';
  const preview=name==='expedition-preview.html';
  const folder=routes.has(name)?tests:root,file=path.resolve(folder,preview?'index.html':name);
  if(!file.startsWith(folder)){res.writeHead(403);res.end();return;}
  let body=await readFile(file);
  if(preview)body=body.toString().replace('src="run.js"','src="/expedition-init.js"');
  res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'})[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
  res.end(body);
 }catch{res.writeHead(404);res.end();}
}).listen(port,'127.0.0.1',()=>console.log(`UI review: http://127.0.0.1:${port}/expedition-preview.html?village`));
