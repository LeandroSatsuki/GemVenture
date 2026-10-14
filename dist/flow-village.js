import {P,PALETTE} from './palette.js';
import {softenPolygon} from './scene-art.js';

// Individual HEPT32 assets are generated from the user's village reference.
// The reference is a composition guide; it is never used as a scene bitmap.
export const FLOW_ART=Object.freeze({forge:'forge',tree:'echo-tree',lift:'lift',well:'well',roulette:'roulette',zag:'zag',miner:'miner',grove:'tree',bush:'bush',board:'missions',shrine:'reliquary',gramophone:'gramophone',miningMachine:'mining-machine-v2'});
export const VILLAGE_ART_ROOT='assets/village-hept32/';
export const FLOW_PROPS=Object.freeze([
 ['forge',151,194,117],['tree',343,180,130],['lift',540,194,98],
 ['miningMachine',205,339,62],['gramophone',452,195,75],['well',124,310,87],['board',284,317,90],
 ['roulette',434,320,75],['zag',476,323,42],['shrine',541,319,65],
 ['grove',76,146,48],['grove',608,187,58],['grove',459,114,40],
 ['bush',48,176,33],['bush',73,291,28],['bush',214,269,26],
 ['bush',236,164,26],['bush',645,202,30],['bush',613,290,35],['bush',236,88,20]
 ,['campfire',343,226,24],['crystalDecor',42,234,15],['crystalDecor',620,258,15],
 ['mushroomDecor',65,312,13],['mushroomDecor',249,117,13],['mushroomDecor',616,153,13],['mushroomDecor',493,326,13],
 ['crateDecor',83,205,20],['crateDecor',106,213,14],['crateDecor',598,228,20],['crateDecor',620,237,14]
].map(Object.freeze));
export function flowImageUrl(type){const s=sprites.get(type);if(s){s.url??=s.image.toDataURL('image/png');return s.url;}return VILLAGE_ART_ROOT+FLOW_ART[type]+'.png';}
export function flowMarkup(type,label=type){return '<img class="flow-art" src="'+flowImageUrl(type)+'" alt="'+label+'">';}

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
function cleanSpeckles(data,width,height){
 const packed=(a,i)=>(a[i]<<16)|(a[i+1]<<8)|a[i+2],ink=parseInt(P.ink.slice(1),16);
 const neighbors=new Uint32Array(8);
 for(let pass=0;pass<2;pass++){const before=new Uint8ClampedArray(data);
  for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){const at=(y*width+x)*4,current=packed(before,at);if(before[at+3]<200||current===ink)continue;let length=0,same=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const i=((y+dy)*width+x+dx)*4;if(before[i+3]>200){const value=packed(before,i);neighbors[length++]=value;if(value===current)same++;}}
   if(same>=4)continue;let best=0,count=0;for(let a=0;a<length;a++){let n=0;for(let b=0;b<length;b++)if(neighbors[b]===neighbors[a])n++;if(n>count){count=n;best=neighbors[a];}}
   if(count<5||best===ink)continue;const r=best>>16,g=(best>>8)&255,b=best&255;if((r-before[at])**2+(g-before[at+1])**2+(b-before[at+2])**2>14000)continue;data[at]=r;data[at+1]=g;data[at+2]=b;
  }
 }
}
function smoothMaterials(data,width,height){
 const before=new Uint8ClampedArray(data);
 for(let y=2;y<height-2;y++)for(let x=2;x<width-2;x++){const at=(y*width+x)*4,r=before[at],g=before[at+1],b=before[at+2];if(before[at+3]<230||r<60&&g<60&&b<75)continue;let sr=0,sg=0,sb=0,count=0;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const i=((y+dy)*width+x+dx)*4;if(before[i+3]<230)continue;const dr=before[i]-r,dg=before[i+1]-g,db=before[i+2]-b;if(dr*dr+dg*dg+db*db>3500)continue;sr+=before[i];sg+=before[i+1];sb+=before[i+2];count++;}
  if(count){data[at]=Math.round(sr/count);data[at+1]=Math.round(sg/count);data[at+2]=Math.round(sb/count);}
 }
}
function flattenSurfaces(data,width,height,type){
 const pairs={miningMachine:[[P.gray,P.slate],[P.steel,P.slate],[P.orange,P.red],[P.clay,P.wood],[P.cyan,P.blue]],forge:[[P.steel,P.slate],[P.sand,P.ochre],[P.orange,P.red],[P.yellow,P.gold]],tree:[[P.green,P.forest],[P.clay,P.wood],[P.cyan,P.blue]],lift:[[P.clay,P.wood],[P.yellow,P.gold]],well:[[P.steel,P.slate],[P.cyan,P.blue]],board:[[P.clay,P.wood],[P.orange,P.red],[P.sand,P.ochre],[P.yellow,P.gold]],shrine:[[P.yellow,P.gold],[P.steel,P.slate],[P.blue,P.deepBlue]],gramophone:[[P.clay,P.wood],[P.yellow,P.gold]],roulette:[[P.clay,P.wood],[P.yellow,P.gold],[P.pink,P.rose]],zag:[[P.lime,P.green],[P.plum,P.aubergine],[P.pink,P.rose]],miner:[[P.yellow,P.gold],[P.sand,P.ochre],[P.blue,P.deepBlue],[P.red,P.maroon]],grove:[[P.green,P.forest],[P.clay,P.wood]],bush:[[P.green,P.forest],[P.pink,P.rose]]}[type]||[];
 const rgb=PALETTE.map(h=>parseInt(h.slice(1),16)),indices=new Map(rgb.map((v,i)=>[v,i])),alternate=new Uint8Array(32);alternate.fill(255);for(const [a,b]of pairs){const ai=PALETTE.indexOf(a),bi=PALETTE.indexOf(b);alternate[ai]=bi;alternate[bi]=ai;}
 const pixels=new Uint8Array(width*height);
 for(let pass=0;pass<2;pass++){for(let i=0;i<pixels.length;i++){const at=i*4;pixels[i]=data[at+3]<200?255:indices.get((data[at]<<16)|(data[at+1]<<8)|data[at+2])??255;}
  for(let y=3;y<height-3;y++)for(let x=3;x<width-3;x++){const pos=y*width+x,current=pixels[pos];if(current===255||alternate[current]===255)continue;const other=alternate[current];let a=0,b=0;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const v=pixels[(y+dy)*width+x+dx];if(v===current)a++;else if(v===other)b++;}if(a+b<26||b<a+8)continue;const color=rgb[other],at=pos*4;data[at]=color>>16;data[at+1]=(color>>8)&255;data[at+2]=color&255;}
 }
}

const sprites=new Map();let loading=null;
export function villageArtReady(){return sprites.size===Object.keys(FLOW_ART).length;}
export function loadVillageArt(){
 if(loading||typeof Image==='undefined')return loading;
 loading=Promise.all(Object.entries(FLOW_ART).map(([type,file])=>new Promise(resolve=>{
  const image=new Image();image.onload=()=>{
   // Read alpha once to get a ground anchor, then reuse the original pixels.
   const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
   const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);
   const {data}=c.getImageData(0,0,canvas.width,canvas.height);let left=canvas.width,right=0,top=canvas.height,bottom=0;
   for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]>24){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
   if(right>left&&bottom>top){
    const width=right-left+1,height=bottom-top+1,k=Math.min(1,512/Math.max(width,height)),small=document.createElement('canvas');
    small.width=Math.ceil(width*k);small.height=Math.ceil(height*k);
    const sc=small.getContext('2d');sc.drawImage(image,left,top,width,height,0,0,small.width,small.height);
    const pixels=sc.getImageData(0,0,small.width,small.height);smoothMaterials(pixels.data,small.width,small.height);mapVillageColors(pixels.data,type);cleanSpeckles(pixels.data,small.width,small.height);flattenSurfaces(pixels.data,small.width,small.height,type);sc.putImageData(pixels,0,0);
    sprites.set(type,{image:small,left:0,top:0,width:small.width,height:small.height});
   }
   canvas.width=canvas.height=1;
   resolve();
  };image.onerror=resolve;image.src=VILLAGE_ART_ROOT+file+'.png';
 })));return loading;
}
export function flowSprite(c,type,x,y,width,hot=false){
 const s=sprites.get(type);if(!s)return false;const height=width*s.height/s.width;
 let image=s.image;
 if(hot&&type==='miningMachine'){
  if(!s.hot){const canvas=document.createElement('canvas');canvas.width=s.width;canvas.height=s.height;const ctx=canvas.getContext('2d');ctx.drawImage(s.image,0,0);const pixels=ctx.getImageData(0,0,s.width,s.height),colors=new Map([[P.gray,P.orange],[P.steel,P.orange],[P.slate,P.red]].map(([a,b])=>[parseInt(a.slice(1),16),parseInt(b.slice(1),16)]));for(let i=0;i<pixels.data.length;i+=4){const d=pixels.data,key=(d[i]<<16)|(d[i+1]<<8)|d[i+2],color=colors.get(key);if(color!==undefined){d[i]=color>>16;d[i+1]=(color>>8)&255;d[i+2]=color&255;}}ctx.putImageData(pixels,0,0);s.hot=canvas;}image=s.hot;
 }
 c.drawImage(image,s.left,s.top,s.width,s.height,x-width/2,y-height,width,height);return true;
}
function slice(c,type,x,y,width,from,to,dy=0,turn=0){
 const s=sprites.get(type);if(!s)return;const height=width*s.height/s.width;
 c.save();c.translate(x,y-height*.24);c.rotate(turn);c.translate(-x,-y+height*.24+dy);
 c.beginPath();c.rect(x-width*.52,y-height+height*from,width*1.04,height*(to-from)+.5);c.clip();flowSprite(c,type,x,y,width);c.restore();
}
function block(c,x,y,w,h,base,shade){
 const d=w*.24,shape=points=>'M '+points.map(p=>p.join(' ')).join(' L ')+' Z';
 c.fillStyle=base;c.strokeStyle=P.ink;c.lineWidth=1.4;c.lineJoin='round';const outline=new Path2D(softenPolygon(shape([[x,y-h-d],[x+w/2,y-h],[x+w/2,y],[x,y+d],[x-w/2,y],[x-w/2,y-h]]),1.2));c.fill(outline);
 c.fillStyle=shade;c.fill(new Path2D(softenPolygon(shape([[x,y-h+d],[x+w/2,y-h],[x+w/2,y],[x,y+d]]),1)));c.stroke(outline);
}
function miniature(c,type,x,y,w,time,reduced){
 if(type==='crateDecor'){block(c,x,y-w*.2,w,w*.45,P.ochre,P.clay);return true;}
 if(type==='mushroomDecor'){block(c,x,y-w*.15,w*.34,w*.48,P.sand,P.ochre);block(c,x,y-w*.64,w,w*.3,P.red,P.maroon);return true;}
 if(type==='crystalDecor'){block(c,x,y-w*.2,w,w*.7,P.cyan,P.blue);return true;}
 if(type==='campfire'){block(c,x-4,y,19,5,P.clay,P.wood);block(c,x+4,y-1,19,5,P.clay,P.wood);c.save();c.translate(x,y-2);const pulse=reduced?1:1+Math.sin(time*2.3)*.045;c.scale(pulse,pulse);c.fillStyle=P.orange;c.strokeStyle=P.ink;c.lineWidth=1.5;c.beginPath();c.moveTo(-11,0);c.lineTo(-11,-12);c.quadraticCurveTo(-11,-16,-6,-18);c.lineTo(-6,-23);c.quadraticCurveTo(-6,-28,-2,-27);c.lineTo(3,-23);c.lineTo(5,-14);c.lineTo(8,-18);c.quadraticCurveTo(12,-15,12,-7);c.lineTo(12,0);c.closePath();c.fill();c.stroke();block(c,1,-1,9,15,P.yellow,P.gold);c.restore();return true;}
 return false;
}
export function flowIdle(c,type,x,y,width,time,reduced=false,highlight=false){
 if(miniature(c,type,x,y,width,time,reduced))return;
 const s=sprites.get(type);if(!s)return;
 if(highlight){c.save();c.globalAlpha=.18;c.fillStyle=P.cyan;c.beginPath();c.ellipse(x,y+2,width*.55,width*.16,0,0,Math.PI*2);c.fill();c.restore();}
 if(type!=='bush'){c.save();c.globalAlpha=.18;c.fillStyle=P.ink;c.beginPath();c.ellipse(x,y+1,width*.33,width*.1,0,0,Math.PI*2);c.fill();c.restore();}
 if(reduced)return void flowSprite(c,type,x,y,width);
 if(type==='tree'||type==='grove'){slice(c,type,x,y,width,.72,1);slice(c,type,x,y,width,0,.725,0,Math.sin(time*.65)*.007);}
 else if(type==='well'){slice(c,type,x,y,width,.25,1);slice(c,type,x,y,width,0,.252,Math.sin(time*1.1)*1.8);}
 else if(type==='zag'){flowSprite(c,type,x,y+Math.sin(time*1.3)*.6,width);}
 else if(type==='miningMachine'){flowSprite(c,type,x,y+Math.sin(time*2)*.5,width);}
 else{flowSprite(c,type,x,y,width);}
 if(type==='well'||type==='shrine'){
  c.save();c.fillStyle=type==='well'?P.cyan:P.lemon;
  for(let i=0;i<3;i++){const u=(time*.12+i/3)%1;c.globalAlpha=Math.sin(u*Math.PI)*.5;c.fillRect(x+(i-1)*width*.19,y-width*(.22+u*.5),1.7,1.7);}c.restore();
 }
}

export function paintFlowVillage(c){
 const top='M28 158L68 134L68 118L154 96L213 109L277 109L307 97L389 105L436 97L493 111L518 96L578 114L610 136L642 142L655 170L682 185L682 220L662 234L662 282L637 297L637 327L595 351L570 351L550 364L467 364L445 351L411 351L379 363L339 355L305 363L248 351L220 342L166 362L119 344L66 326L47 306L26 306L26 261L11 247L11 216L27 199L27 177Z';
 const ground=new Path2D(softenPolygon(top,4));
 c.save();c.translate(0,26);c.fillStyle=P.wood;c.fill(ground);c.strokeStyle=P.ink;c.lineWidth=3;c.stroke(ground);c.restore();
 c.save();c.translate(0,9);c.fillStyle=P.deepTeal;c.fill(ground);c.restore();
 c.fillStyle=P.forest;c.fill(ground);c.strokeStyle=P.ink;c.lineWidth=3;c.stroke(ground);
 c.save();c.clip(ground);c.lineJoin='round';c.lineCap='round';c.beginPath();
 c.moveTo(151,194);c.lineTo(151,225);c.lineTo(540,225);c.lineTo(540,194);
 c.moveTo(124,310);c.lineTo(124,247);c.quadraticCurveTo(124,225,151,225);
 c.moveTo(284,317);c.lineTo(284,225);c.moveTo(343,180);c.lineTo(343,225);
 c.moveTo(541,319);c.lineTo(541,225);c.moveTo(434,320);c.lineTo(434,225);
 c.moveTo(205,339);c.lineTo(205,225);c.moveTo(452,195);c.lineTo(452,225);c.lineWidth=34;c.strokeStyle=P.clay;c.stroke();c.lineWidth=26;c.strokeStyle=P.ochre;c.stroke();
 c.fillStyle=P.clay;c.beginPath();c.ellipse(343,226,39,23,0,0,Math.PI*2);c.fill();
 c.fillStyle=P.ochre;c.beginPath();c.ellipse(343,223,34,20,0,0,Math.PI*2);c.fill();c.restore();
}
