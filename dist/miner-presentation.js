import {MINER_LAYOUT,minerReceiptTarget} from './miner-layout-contract.js';
import {drawCachedEnsemble} from './miner-cabin-art.js';
import {drawPreparedDrill} from './miner-drill-art.js';
import {P} from './palette.js';
const root='assets/miner-ui-v1/',images=new Map(),failed=new Set();let loading=null;
const specs=[['back','cabin-back-v01.png',1240,224],['floor','cabin-floor-v01.png',1240,224],['front','cabin-front-v01.png',1240,224],['chain0','chain-left-v01.png',24,1228],['chain1','chain-right-v01.png',24,1228],['lower','crew-lower-cache-2x-v01.png',128,152],['upper','crew-upper-cache-2x-v01.png',128,152],['drill','drill-pilot-cache-2x-v01.png',200,220],['rider','miner-seated-cache-4x-v01.png',224,240]];
export function minerPresentationStatus(){return {ready:images.size===specs.length,loaded:images.size,expected:specs.length,failed:[...failed]};}
export function loadMinerPresentation(){
 if(loading)return loading;if(typeof Image==='undefined')return Promise.resolve(minerPresentationStatus());let next=0;
 const load=([id,file,w,h])=>new Promise(resolve=>{const image=new Image();image.onload=()=>{if(image.naturalWidth===w&&image.naturalHeight===h)images.set(id,image);else failed.add(id);resolve();};image.onerror=()=>{failed.add(id);resolve();};image.src=root+file;});
 loading=Promise.all(Array.from({length:2},async()=>{while(next<specs.length)await load(specs[next++]);})).then(minerPresentationStatus);return loading;
}
export function drawMinerDrill(c,x,y){const image=images.get('drill');if(!image)return false;drawPreparedDrill(c,{image,tip:[50,97],width:100,height:110},x,y);const rider=images.get('rider');if(rider)c.drawImage(rider,x-3.2538931446064012-28,y-42.26494097867401-46,56,60);return true;}
export function drawMinerFrame(c,clock,reduced){
 // The mine scrolls behind the fixed cabin; only the receipt footer is opaque.
 c.fillStyle=P.ink;c.fillRect(0,MINER_LAYOUT.receiptStrip.y,700,MINER_LAYOUT.receiptStrip.height);
 if(['back','floor','front','chain0','chain1','lower','upper'].every(id=>images.has(id)))drawCachedEnsemble(c,{back:images.get('back'),floor:images.get('floor'),front:images.get('front'),chains:[images.get('chain0'),images.get('chain1')],crew:{lower:images.get('lower'),upper:images.get('upper')}},MINER_LAYOUT,clock,{reduced});
 for(const card of MINER_LAYOUT.receiptCards){c.fillStyle=P.coal;c.fillRect(card.x,card.y,card.width,card.height);c.strokeStyle=P.slate;c.lineWidth=2;c.strokeRect(card.x,card.y,card.width,card.height);}
}
export function receiptTargetForFrame(kind,canvas){
 if(!canvas?.getBoundingClientRect||typeof window==='undefined')return null;
 const canvasRect=canvas.getBoundingClientRect();let clip={left:0,top:0,right:window.innerWidth,bottom:window.innerHeight};
 // Only clipping/scrolling ancestors restrict visibility. Do not confuse the
 // dialog's offscreen content with a destination visible in the viewport.
 for(let node=canvas.parentElement;node;node=node.parentElement){const style=window.getComputedStyle(node);if([style.overflow,style.overflowX,style.overflowY].some(v=>/auto|scroll|hidden|clip/.test(v))){const r=node.getBoundingClientRect();clip={left:Math.max(clip.left,r.left+node.clientLeft),top:Math.max(clip.top,r.top+node.clientTop),right:Math.min(clip.right,r.left+node.clientLeft+node.clientWidth),bottom:Math.min(clip.bottom,r.top+node.clientTop+node.clientHeight)};}}
 return minerReceiptTarget(kind,{canvasRect,visibleRect:clip});
}
