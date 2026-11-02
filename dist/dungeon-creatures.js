import {CREATURE_CLIPS} from './dungeon-creature-data.js';
import {currentCreatureArt} from './current-creature-art.js';
const banks=new Map(),actions={slime:'hop',bat:'fly',golem:'roll'};
export function prepareDungeonCreatures(biome){
 if(typeof Image==='undefined')return Promise.resolve([]);
 if(banks.has(biome))return banks.get(biome).ready;
 const bank={images:new Map(),ready:null};banks.set(biome,bank);
 if(banks.size>2)banks.delete(banks.keys().next().value);
 bank.ready=Promise.all(Object.keys(actions).flatMap(type=>['idle',actions[type]].map(clip=>new Promise(resolve=>{const key=type+'-'+biome+'-'+clip,image=new Image();image.onload=()=>{bank.images.set(key,image);resolve(true);};image.onerror=()=>resolve(false);image.src='./assets/dungeon-actors-v1/'+key+'.png';}))));return bank.ready;
}
export function drawDungeonCreature(c,type,x,y,width,{biome=0,direction='down',time=0,moving=false,progress=null,soft=false}={}){
 if(!actions[type])return false;void prepareDungeonCreatures(biome);
 const clip=!soft&&(moving||type==='bat')?actions[type]:'idle',key=type+'-'+biome+'-'+clip,image=banks.get(biome)?.images.get(key),spec=CREATURE_CLIPS[key];if(!image||!spec)return false;
 const index=soft?0:progress!=null&&clip!=='idle'?Math.min(spec.count-1,Math.floor(Math.max(0,progress)*spec.count)):Math.floor(Math.max(0,time)/spec.seconds*spec.count)%spec.count,row={down:0,left:1,up:2,right:3}[direction]??0;
 const bounds=currentCreatureArt(type,biome).bounds,display=width*256/bounds.width;
 c.save();c.imageSmoothingEnabled=true;c.drawImage(image,index*128,row*128,128,128,x-display/2,y-display*.75,display,display);c.restore();return true;
}
export const dungeonCreatureStatus=()=>({biomes:[...banks.keys()],ready:[...banks.values()].reduce((n,b)=>n+b.images.size,0),limit:2});
