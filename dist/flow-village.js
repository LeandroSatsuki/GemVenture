import {loadStatueFamily,statueFamilyReady,statueFamilyBounds,drawStatueFamily,statueFamilyContains} from './statue-family.js';
import {loadRefugePlayer,refugePlayerStatus,refugePlayerContains} from './refuge-player.js';
import {refugeLiftAssets} from './refuge-lift-assets.js';
import {paintGramophoneNotes} from './refuge-idles.js';
import {paintForgeFire} from './refuge-presentation.js';
import {P,PALETTE} from './palette.js';
import {REFUGE_PROPS,paintRefugeTerrain} from './refuge-scene.js';
import {loadRefugeArt,drawRefugeArt,drawRefugeArtMask,refugeArtUrl,refugeArtBounds,refugeArtReady,refugeArtContains} from './refuge-art.js';
import {createAlphaPlane,createAlphaMask,createSilhouetteRenderer,transformedAlphaContains,pickRefugePart} from './refuge-picking.js';
import {REFUGE_PICK_PARTS} from './refuge-scene.js';

// Individual HEPT32 assets are generated from the user's village reference.
// The reference is a composition guide; it is never used as a scene bitmap.
export const FLOW_ART=Object.freeze({forge:'forge',tree:'echo-tree',lift:'lift',well:'well',roulette:'roulette',zag:'zag',miner:'miner',grove:'tree',bush:'bush',board:'missions',shrine:'reliquary',gramophone:'gramophone',miningMachine:'mining-machine-v2'});
export const VILLAGE_ART_ROOT='assets/village-hept32/';
export const FLOW_PROPS=REFUGE_PROPS;
export function flowImageUrl(type){const updated=refugeArtUrl(type);if(updated)return updated;const s=sprites.get(type);if(s){s.url??=s.image.toDataURL('image/png');return s.url;}return VILLAGE_ART_ROOT+FLOW_ART[type]+'.png';}
export function flowMarkup(type,label=type){return '<img class="flow-art" src="'+flowImageUrl(type)+'" alt="'+label+'">';}


// Dialog portraits use only current compositions, never flowImageUrl's legacy fallback.
export function prepareCurrentFlowArt(){return loadRefugeArt();}
export function currentFlowImageUrl(type){return refugeArtUrl(type);}
const escapeStructureText=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function currentFlowMarkup(type,label=type){
 if(!['well','gramophone','zag'].includes(type))throw new Error('Unsupported current portrait '+type);
 const size=type==='well'?'width:75%;height:270px':type==='gramophone'?'width:100%;height:84px':'width:100%;max-width:64px;height:64px';
 return '<div class="current-structure-slot" data-current-structure="'+type+'" data-structure-label="'+escapeStructureText(label)+'" data-structure-state="loading" aria-busy="true" role="img" aria-label="'+escapeStructureText(label)+'" style="'+size+';display:grid;place-items:center;flex-shrink:0;position:relative;z-index:1;overflow:hidden"><small style="font:12px/1.3 var(--body, sans-serif);text-align:center;color:#c5cddb;max-width:100%;overflow-wrap:anywhere">Carregando arte…</small></div>';
}

export const FLOW_SWATCHES=Object.freeze({
 miningMachine:[P.ink,P.gray,P.steel,P.slate,P.clay,P.wood,P.cyan,P.blue,P.orange,P.red],
 forge:[P.ink,P.sand,P.ochre,P.orange,P.red,P.steel,P.slate,P.yellow,P.gold],
 tree:[P.ink,P.green,P.forest,P.clay,P.wood,P.cyan,P.blue],
 lift:[P.ink,P.clay,P.wood,P.gold,P.yellow],
 well:[P.ink,P.steel,P.slate,P.cyan,P.blue],
 board:[P.ink,P.clay,P.wood,P.orange,P.red,P.sand,P.ochre,P.yellow,P.gold,P.pink],
 shrine:[P.ink,P.yellow,P.gold,P.blue,P.deepBlue,P.steel,P.slate],
 gramophone:[P.ink,P.clay,P.wood,P.yellow,P.gold,P.slate,P.pink,P.rose],
 roulette:[P.ink,P.yellow,P.gold,P.red,P.green,P.blue,P.cyan,P.pink,P.rose,P.clay,P.wood],
 zag:[P.ink,P.lime,P.green,P.plum,P.aubergine,P.pink,P.rose,P.yellow,P.gold],
 miner:[P.ink,P.yellow,P.gold,P.sand,P.ochre,P.blue,P.deepBlue,P.red,P.maroon,P.steel,P.slate],
 grove:[P.ink,P.green,P.forest,P.clay,P.wood],bush:[P.ink,P.green,P.forest,P.pink,P.rose]
});
const colorTables=new Map();
export function mapVillageColors(data,type='all'){
 let table=colorTables.get(type);if(!table){const colors=(FLOW_SWATCHES[type]||PALETTE).map(hex=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]),exact=new Map(colors.map((v,i)=>[(v[0]<<16)|(v[1]<<8)|v[2],i])),lut=new Uint8Array(32768);
  for(let key=0;key<32768;key++){const r=(key>>10)*8+4,g=((key>>5)&31)*8+4,b=(key&31)*8+4;let best=0,distance=Infinity;for(let i=0;i<colors.length;i++){const v=colors[i],d=(v[0]-r)**2+(v[1]-g)**2+(v[2]-b)**2;if(d<distance){best=i;distance=d;}}lut[key]=best;}
  table={colors,exact,lut};colorTables.set(type,table);
 }
 const {colors,exact,lut}=table;
 for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;const key=(data[i]<<16)|(data[i+1]<<8)|data[i+2],index=exact.get(key)??lut[((data[i]>>3)<<10)|((data[i+1]>>3)<<5)|(data[i+2]>>3)],v=colors[index];data[i]=v[0];data[i+1]=v[1];data[i+2]=v[2];}return data;
}
// Runtime keeps approved pixels intact. mapVillageColors remains an opt-in legacy utility.
const sprites=new Map();let loading=null;
export function villageArtReady(){return sprites.size===Object.keys(FLOW_ART).length;}
export function loadVillageArt(){
 if(loading||typeof Image==='undefined')return loading;
 loading=Promise.all([loadStatueFamily(),loadRefugeArt(),loadRefugePlayer(),refugeLiftAssets.load(),...Object.entries(FLOW_ART).map(([type,file])=>new Promise(resolve=>{
  const image=new Image();image.onload=()=>{
   // Read alpha once to get a ground anchor, then reuse the original pixels.
   const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
   const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);
   const {data}=c.getImageData(0,0,canvas.width,canvas.height);let left=canvas.width,right=0,top=canvas.height,bottom=0;
   for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]>128){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
   if(right>left&&bottom>top){
    const width=right-left+1,height=bottom-top+1,k=Math.min(1,512/Math.max(width,height)),small=document.createElement('canvas');
    small.width=Math.ceil(width*k);small.height=Math.ceil(height*k);
    const sc=small.getContext('2d');sc.drawImage(image,left,top,width,height,0,0,small.width,small.height);
    const plane=createAlphaPlane(sc.getImageData(0,0,small.width,small.height).data,small.width,small.height);
    sprites.set(type,{image:small,left:0,top:0,width:small.width,height:small.height,plane,mask:createAlphaMask(plane,()=>document.createElement('canvas'))});
   }
   canvas.width=canvas.height=1;
   resolve();
  };image.onerror=resolve;image.src=VILLAGE_ART_ROOT+file+'.png';
 }))]);return loading;
}
export function flowSprite(c,type,x,y,width,hot=false){
 const s=sprites.get(type);if(!s)return false;const height=width*s.height/s.width;
 let image=s.image;
 if(hot&&type==='miningMachine'){
  if(!s.hot){const canvas=document.createElement('canvas');canvas.width=s.width;canvas.height=s.height;const ctx=canvas.getContext('2d');ctx.drawImage(s.image,0,0);const pixels=ctx.getImageData(0,0,s.width,s.height),colors=new Map([[P.gray,P.orange],[P.steel,P.orange],[P.slate,P.red]].map(([a,b])=>[parseInt(a.slice(1),16),parseInt(b.slice(1),16)]));for(let i=0;i<pixels.data.length;i+=4){const d=pixels.data,key=(d[i]<<16)|(d[i+1]<<8)|d[i+2],color=colors.get(key);if(color!==undefined){d[i]=color>>16;d[i+1]=(color>>8)&255;d[i+2]=color&255;}}ctx.putImageData(pixels,0,0);s.hot=canvas;}image=s.hot;
 }
 c.drawImage(image,s.left,s.top,s.width,s.height,x-width/2,y-height,width,height);return true;
}
const silhouette=createSilhouetteRenderer({makeCanvas:()=>typeof document==='undefined'?null:document.createElement('canvas')});
export function flowBounds(type,width){
 if(type==='statueCopper')return statueFamilyBounds(width);
 const native=refugeArtBounds(type);if(native&&refugeArtReady(type)){const s=width/native.width;return {left:native.left*s-3,top:native.top*s-3,right:native.right*s+3,bottom:native.bottom*s+3};}
 const s=sprites.get(type);return s?{left:-width/2,top:-width*s.height/s.width,right:width/2,bottom:0}:null;
}
export function flowContains(type,x,y,width,px,py,time=0,reduced=false,interaction={}){
 if(type==='statueCopper'&&(statueFamilyReady(interaction.statueTier)||(interaction.statueTier??0)>0))return statueFamilyContains(interaction.statueTier,x,y,width,px,py);
 if(type==='miner'&&interaction.player?.view&&refugePlayerStatus().ready)return refugePlayerContains(x,y,px,py,interaction.player.view);
 if(refugeArtReady(type))return refugeArtContains(type,x,y,width,px,py,time,reduced,interaction);
 const s=sprites.get(type);if(!s)return false;const scale=width/s.width;
 return transformedAlphaContains(s.plane,[scale,0,0,scale,x-width/2,y-s.height*scale],px,py);
}
export function pickFlowVillage(x,y,time=0,reduced=false,interaction={}){
 const parts=interaction.player?[...REFUGE_PICK_PARTS,{...interaction.player,id:null,type:'miner'}].sort((a,b)=>a.depth-b.depth):REFUGE_PICK_PARTS;
 const picked=pickRefugePart(parts,x,y,(p,x,y)=>flowContains(p.type,p.x,p.y,p.width,x,y,time,reduced,interaction));return picked?.id?picked:null;
}
export function flowOutlineInfo(){return silhouette.info();}
function flowMask(c,type,x,y,width,time,reduced,interaction){
 if(type==='statueCopper'&&(statueFamilyReady(interaction.statueTier)||(interaction.statueTier??0)>0)){drawStatueFamily(c,interaction.statueTier,x,y,width,{mask:true});return;}
 if(type==='lift'&&refugeArtReady(type)){const store=interaction.liftAssets||refugeLiftAssets;if(store.paintMask){store.paintMask(c,(ctx,p)=>drawRefugeArtMask(ctx,'lift',p.x,p.y,p.width,0,true),{x,y,width,time,reduced:interaction.reducedMotion??reduced,soft:interaction.soft??false,poseOverride:interaction.motionR2?.lift});return;}}
 if(drawRefugeArtMask(c,type,x,y,width,time,reduced,interaction))return;const s=sprites.get(type);if(s)c.drawImage(s.mask,x-width/2,y-width*s.height/s.width,width,width*s.height/s.width);
}
export function flowIdle(c,type,x,y,width,time,reduced=false,highlight=false,interaction={}){
 if(highlight&&(type!=='lift'||(interaction.liftAssets||refugeLiftAssets).maskStatus?.().canOutline!==false)&&silhouette.paint(c,type,flowBounds(type,width),ctx=>paintFlowIdle(ctx,type,0,0,width,time,reduced,interaction),{x,y,color:P.yellow,lineWidth:type==='shrine'?1.25:2,maskPainter:ctx=>flowMask(ctx,type,0,0,width,time,reduced,interaction)}))return;
 paintFlowIdle(c,type,x,y,width,time,reduced,interaction);
}
function paintFlowIdle(c,type,x,y,width,time,reduced=false,interaction={}){
 if(type==='statueCopper'&&interaction.statuePromotion?.draw(c,{x,y,width}))return;
 if(type==='statueCopper'&&(statueFamilyReady(interaction.statueTier)||(interaction.statueTier??0)>0)){drawStatueFamily(c,interaction.statueTier,x,y,width);return;}
 if(type==='lift'&&refugeArtReady(type)){const store=interaction.liftAssets||refugeLiftAssets;store.paint(c,(ctx,p)=>drawRefugeArt(ctx,'lift',p.x,p.y,p.width,0,true),{x,y,width,time,reduced:interaction.reducedMotion??reduced,soft:interaction.soft??false,poseOverride:interaction.motionR2?.lift});return;}
 if(drawRefugeArt(c,type,x,y,width,time,reduced,interaction)){if(type==='gramophone')interaction.gramophoneNoteCount=paintGramophoneNotes(c,{x,y,width,time,playing:interaction.gramophonePlaying===true,reduced:interaction.reducedMotion??reduced,soft:interaction.soft??false,colors:P,notesOverride:interaction.motionR2?.notes});return;}
 const s=sprites.get(type);if(!s)return;
 if(reduced)return void flowSprite(c,type,x,y,width);
 flowSprite(c,type,x,y,width);
 if(type==='forge')paintForgeFire(c,{x,y,width,time,reduced,boost:interaction.motionR2?.forgeBoost??0,r2:!!interaction.motionR2});
 if(type==='well'||type==='shrine'){
  c.save();c.fillStyle=type==='well'?P.cyan:P.lemon;
  for(let i=0;i<3;i++){const u=(time*.12+i/3)%1;c.globalAlpha=Math.sin(u*Math.PI)*.5;c.fillRect(x+(i-1)*width*.19,y-width*(.22+u*.5),1.7,1.7);}c.restore();
 }
}

export function paintFlowVillage(c){paintRefugeTerrain(c);}
