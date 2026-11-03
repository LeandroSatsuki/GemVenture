const path=require('node:path');
function assetPath(root,requestUrl){
 const url=new URL(requestUrl);if(url.protocol!=='gemventure:'||url.hostname!=='game'||url.username||url.password)throw Error('Invalid game origin');
 const clean=decodeURIComponent(url.pathname);if(clean.includes('\0')||clean.includes('\\')||clean.split('/').includes('..'))throw Error('Invalid asset path');
 const file=path.resolve(root,'.'+(clean==='/'?'/index.html':clean)),relative=path.relative(root,file);if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Asset outside game');return file;
}
module.exports={assetPath};
