import {writeFile,mkdir} from 'node:fs/promises';
import {generateAsset,assetToSvg} from '../dist/art-kit.js';
import {bossMeshV2} from '../dist/dungeon-bosses-v2.js';
const root=new URL('../dist/assets/dungeon-refinement-v2/',import.meta.url);await mkdir(root,{recursive:true});
for(const type of ['rock','crystal','lantern','lift'])await writeFile(new URL(type+'.svg',root),assetToSvg(generateAsset(type,{biome:0,seed:41001})));
for(let i=1;i<=5;i++){
 const faces=bossMeshV2(i,{soft:true});
 const paths=faces.map(f=>'<path d="'+f.points.map(([x,y,z],j)=>(j?'L':'M')+(60+x+y/11).toFixed(2)+','+(95+y*8/11-z).toFixed(2)).join(' ')+'Z" fill="'+f.fill+'" stroke="'+f.fill+'" stroke-width=".2"/>').join('');
 await writeFile(new URL('boss-'+i+'.svg',root),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110">'+paths+'</svg>');
}
