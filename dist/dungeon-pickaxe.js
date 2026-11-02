import {PICKAXE_ART} from './pickaxe-art-manifest.js';
// One model for held tool and forge preview. X: grip to head; Y: tool-up socket.
export const PICKAXE_PROFILE=Object.freeze({butt:-3,head:21,length:26,handleWidth:3.4});
export const PICKAXE_METALS=Object.freeze([
 ['#c4ccc7','#8394a6','#374252'],['#f7bf6f','#ed9353','#913f39'],
 ['#c4ccc7','#2fbfcd','#245473'],['#f27f72','#ce2029','#591d35'],
 ['#ffd95a','#f3ad20','#9c3824'],['#a2e66f','#5dae27','#005a41'],
 ['#2fbfcd','#287cb8','#222347'],['#db5ebe','#7a38c9','#3f2966'],
 ['#ffffe0','#ffd95a','#e97c07'],['#ffffe0','#2fbfcd','#5037ab']
]);
export function dungeonPickaxeFaces(tier=0){
 const t=Math.max(0,Math.min(9,Math.trunc(tier)||0)),metal=PICKAXE_METALS[t],faces=[];
 const add=(points,fill,stroke=false)=>faces.push({points,fill,stroke});
 add([[-3,-1.8],[21,-1.8],[23,0],[21,2],[-3,2]],'#9c3824',true);
 add([[-3,-1.8],[21,-1.8],[22,-.6],[-3,-.6]],'#f7bf6f');
 for(const x of [1,4,7])add([[x,-1.8],[x+1,-1.8],[x+1,2],[x,2]],'#591d35');
 const head=[[18,-13],[21,-14],[25,-8],[26,-2],[25,4],[22,10],[17,15],[20,8],[21,3],[21,-3],[20,-8]];
 add(head.map(([x,y])=>[x+1.5,y+1.5]),metal[2],true);add(head,metal[1],true);
 add([[18,-13],[21,-14],[25,-8],[26,-2],[24,-2],[23,-7]],metal[0]);
 add([[24,4],[22,10],[17,15],[20,8],[21,3]],metal[0]);
 add([[19,-3],[25,-3],[25,3],[19,3]],metal[2],true);
 add([[19,-3],[25,-3],[24,-1],[19,-1]],metal[0]);
 add([[21,-1],[23,-1],[23,1],[21,1]],t>=2?metal[0]:'#8394a6');
 return faces;
}
const approvedImages=new Map();
export function approvedPickaxeImage(tier=0){const id=Math.max(0,Math.min(9,Math.trunc(tier)||0)),art=PICKAXE_ART[id],url=art.roles.forge.file;if(typeof Image==='undefined')return null;let im=approvedImages.get(url);if(!im){im=new Image();im.src=url;approvedImages.set(url,im);}return im.complete&&im.naturalWidth?im:null;}
export function paintDungeonPickaxe(c,{x,y,angle=0,tier=0,scale=1,basis=null}){
 const image=approvedPickaxeImage(tier);if(!image)return;
 c.save();c.translate(x,y);if(basis)c.transform(...basis,0,0);else c.rotate(angle);c.scale(scale,scale);
 // Approved CP2 family: butt=(89,211), head=(133,99). Normalize only
 // the authored handle to local +X; the approved world/socket basis is unchanged.
 const dx=44,dy=-112,length=Math.hypot(dx,dy),k=24/length;
 c.rotate(-Math.atan2(dy,dx));c.scale(k,k);c.drawImage(image,-89,-211);c.restore();
}
export function dungeonPickaxeSvg(tier=0){const art=PICKAXE_ART[Math.max(0,Math.min(9,Math.trunc(tier)||0))];return '<image href="'+art.roles.forge.file+'" x="0" y="0" width="100" height="110" preserveAspectRatio="xMidYMid meet"/>';}

export function loadDungeonPickaxes(){return Promise.all(PICKAXE_ART.map((_,i)=>{approvedPickaxeImage(i);const im=approvedImages.get(PICKAXE_ART[i].roles.forge.file);return im.decode();}));}
