import {P} from './palette.js';
import {drawAsset} from './art-kit.js';
import {loadApprovedArt} from './approved-art.js';
import {drawLobbyPlayer} from './player-appearance.js';
import {paintLobbyPet} from './lobby-pets.js';
import {petsServiceView} from './pets-service.js';

export const LOBBY_FRAME=Object.freeze({width:1672,height:941});
export const LOBBY_LIGHTS=Object.freeze([[470,221,100],[1545,254,115],[1350,326,85],[476,420,55],[1110,590,50],[1271,615,75],[290,761,100],[42,567,90]]);
// Isolated tree from the user-approved first concept; no scenery click target.
export const TREE_ASSET=Object.freeze({url:'assets/refuge-night-v3/echo-tree.png',width:1248,height:1248,source:'approved first lobby reference, isolated reconstruction'});
export const LOBBY_SCENE_EMBEDDED=Object.freeze({});
let treeImage=null,treeLayers=null;
// Only detached leaves from the approved raster move; connected crown/trunk stay intact.
const FLOATING_LEAVES=[[112,348,86,98],[1057,371,90,91],[1024,485,106,127],[1090,608,104,120],[219,636,111,128],[307,783,50,52],[795,788,70,76]];
function prepareTreeLayers(){
 const base=document.createElement('canvas');base.width=base.height=1248;const b=base.getContext('2d');b.drawImage(treeImage,0,0);
 const leaves=FLOATING_LEAVES.map(([x,y,w,h])=>{const part=document.createElement('canvas');part.width=w;part.height=h;part.getContext('2d').drawImage(treeImage,x,y,w,h,0,0,w,h);b.clearRect(x,y,w,h);return {part,x,y,w,h};});
 return {base,leaves};
}
export function paintEchoTree(c,time=0,reduced=false){
 if(!treeImage){treeImage=new Image();treeImage.src=LOBBY_SCENE_EMBEDDED[TREE_ASSET.url]||TREE_ASSET.url;}
 if(!treeImage.complete||!treeImage.naturalWidth)return false;
 const bob=reduced?0:Math.sin(time*.55)*3;
 treeLayers??=prepareTreeLayers();c.save();c.filter='blur(1.5px)';c.translate(600,20+bob);c.scale(620/1248,600/1248);c.drawImage(treeLayers.base,0,0);
 for(let i=0;i<treeLayers.leaves.length;i++){const p=treeLayers.leaves[i],float=reduced?0:Math.sin(time*(.65+i*.09)+i*2.3)*7;c.drawImage(p.part,p.x,p.y+float);}c.restore();return true;
}
function light(c,x,y,r,alpha,color=P.gold){const gradient=c.createRadialGradient(x,y,2,x,y,r);gradient.addColorStop(0,color);gradient.addColorStop(1,'transparent');c.save();c.globalAlpha=alpha;c.globalCompositeOperation='screen';c.fillStyle=gradient;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
export class RefugeLobbyScene{
 constructor(){this.time=0;this.background=new Image();this.background.src=LOBBY_SCENE_EMBEDDED['assets/refuge-night-v1/forest.png']||'assets/refuge-night-v1/forest.png';this.plate=null;this.lastSize='';void loadApprovedArt();}
 prepare(){if(this.plate||!this.background.complete||!this.background.naturalWidth)return;this.plate=document.createElement('canvas');this.plate.width=1672;this.plate.height=941;const c=this.plate.getContext('2d');c.drawImage(this.background,0,0,1672,941);c.save();c.beginPath();c.rect(0,0,1672,670);c.clip();c.filter='blur(3.5px)';c.drawImage(this.background,-3,-3,1678,947);c.restore();}
 draw(c,profile,width,height,dt,{paused=false,reduced=false}={}){
  this.prepare();if(!paused&&!reduced&&!document.hidden)this.time+=Math.max(0,Math.min(dt,.05));const t=this.time;
  const k=Math.max(width/1672,height/941),ox=(width-1672*k)/2,oy=(height-941*k)/2;c.save();c.translate(ox,oy);c.scale(k,k);c.fillStyle=P.ink;c.fillRect(0,0,1672,941);if(this.plate)c.drawImage(this.plate,0,0);
  for(let i=0;i<LOBBY_LIGHTS.length;i++){const [x,y,r]=LOBBY_LIGHTS[i];light(c,x,y,r,.13+(reduced?0:Math.sin(t*.9+i*1.9)*.025));}
  // Sparse seeded fireflies. Bounded paths stay behind actors and navigation.
  for(let i=0;i<22;i++){const x=490+(i*139%710)+Math.sin(t*.23+i*1.7)*24,y=245+(i*89%385)+Math.sin(t*.31+i*2.1)*17,a=.23+(Math.sin(t*.8+i*2)+1)*.2;light(c,x,y,10,a*.4,i%3?P.cyan:P.lemon);c.globalAlpha=a;c.fillStyle=i%3?P.cyan:P.lemon;c.beginPath();c.arc(x,y,1.6,0,Math.PI*2);c.fill();c.globalAlpha=1;}
  paintEchoTree(c,t,reduced);
  const shadow=(x,y,rx,ry)=>{c.save();c.globalAlpha=.25;c.fillStyle=P.ink;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();c.restore();};shadow(790,725,57,12);
  drawLobbyPlayer(c,profile,790,725,230,t,{reduced:reduced||document.body.classList.contains('refuge-introduction')});
  const active=petsServiceView(profile).activePet;
  if(active)paintLobbyPet(c,active,948,722,195,t,reduced);
  // Low-amplitude lake glints, isolated from the stone platform.
  c.save();c.globalAlpha=.12;c.strokeStyle=P.cyan;c.lineWidth=2;for(let i=0;i<5;i++){const x=710+i*47+Math.sin(t*.4+i)*8,y=884+(i%3)*16;c.beginPath();c.moveTo(x,y);c.lineTo(x+26+Math.sin(t*.7+i)*6,y);c.stroke();}c.restore();c.restore();
 }
}
