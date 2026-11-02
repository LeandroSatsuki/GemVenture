import {REFUGE_PLAYER_VIEWS,REFUGE_PLAYER_FRAME,REFUGE_PLAYER_ROOT,REFUGE_PLAYER_EMBEDDED} from './refuge-player-manifest.js';
import {createAlphaPlane,transformedAlphaContains} from './refuge-picking.js';
const sprites=new Map(),failed=new Set();let loading=null;
export function refugePlayerStatus(){return {ready:sprites.size===4,loaded:sprites.size,expected:4,failed:[...failed],cachePixels:[...sprites.values()].reduce((n,s)=>n+s.image.width*s.image.height,0)};}
export function loadRefugePlayer(){
 if(loading)return loading;if(typeof Image==='undefined'||typeof document==='undefined')return Promise.resolve(refugePlayerStatus());let next=0;
 const load=spec=>new Promise(resolve=>{const image=new Image();image.onload=()=>{try{if(image.naturalWidth!==160||image.naturalHeight!==192)throw Error('Registered frame size mismatch');const canvas=document.createElement('canvas');canvas.width=160;canvas.height=192;const c=canvas.getContext('2d');c.drawImage(image,0,0);const plane=createAlphaPlane(c.getImageData(0,0,160,192).data,160,192);sprites.set(spec.id,{image:canvas,plane});}catch{failed.add(spec.id);}resolve();};image.onerror=()=>{failed.add(spec.id);resolve();};image.src=REFUGE_PLAYER_EMBEDDED[spec.id]||REFUGE_PLAYER_ROOT+spec.file;});
 loading=Promise.all(Array.from({length:2},async()=>{while(next<REFUGE_PLAYER_VIEWS.length)await load(REFUGE_PLAYER_VIEWS[next++]);})).then(refugePlayerStatus);return loading;
}
export function refugePlayerTransform(x,y,scale=1){const f=REFUGE_PLAYER_FRAME;return [scale/f.density,0,0,scale/f.density,x-f.groundAnchor[0]*scale,y-f.groundAnchor[1]*scale];}
export function drawRefugePlayer(c,x,y,view='front-left',scale=1){const s=sprites.get(view);if(sprites.size!==4||!s)return false;const f=REFUGE_PLAYER_FRAME;c.drawImage(s.image,x-f.groundAnchor[0]*scale,y-f.groundAnchor[1]*scale,f.width*scale,f.height*scale);return true;}
export function refugePlayerContains(x,y,px,py,view='front-left',scale=1){const s=sprites.get(view);return sprites.size===4&&!!s&&transformedAlphaContains(s.plane,refugePlayerTransform(x,y,scale),px,py);}
