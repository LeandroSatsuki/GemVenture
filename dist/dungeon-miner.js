import {MINER_CLIPS} from './dungeon-miner-data.js';
const images=new Map(),loading=new Map();
export const DUNGEON_MINER_ATLAS=Object.freeze({revision:7,cell:256,columns:8,root:'./assets/miner-cave-tool-v7/',clips:Object.freeze(['idle','run','mine'])});
export function loadDungeonMiner(key='hardhat-blue'){if(!/^(hardhat|duck)-(blue|pink)$/.test(key))key='hardhat-blue';if(!loading.has(key))loading.set(key,Promise.all(DUNGEON_MINER_ATLAS.clips.map(clip=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{const count=MINER_CLIPS[clip].count,cols=Math.min(DUNGEON_MINER_ATLAS.columns,count),rows=Math.ceil(count/cols);if(image.naturalWidth!==cols*DUNGEON_MINER_ATLAS.cell||image.naturalHeight!==rows*4*DUNGEON_MINER_ATLAS.cell){reject(Error('Miner atlas size '+key+'/'+clip));return;}images.set(key+'/'+clip,image);resolve();};image.onerror=()=>reject(Error('Miner '+key+'/'+clip));image.src=DUNGEON_MINER_ATLAS.root+key+'/cave-'+clip+'.png';}))));return loading.get(key);}
export const dungeonMinerReady=(key='hardhat-blue')=>DUNGEON_MINER_ATLAS.clips.every(clip=>images.has(key+'/'+clip));
export function dungeonMinerSourceRect(f){const cell=DUNGEON_MINER_ATLAS.cell,cols=Math.min(DUNGEON_MINER_ATLAS.columns,f.spec.count),rows=Math.ceil(f.spec.count/cols),row=['S','W','N','E'].indexOf(f.direction);return [(f.index%cols)*cell,(row*rows+Math.floor(f.index/cols))*cell,cell,cell];}
// Follow the authored grip/axis rather than a screen-space angle per direction.
// The broad metal face is camera-readable (a 2.5D prop); projecting tool-up as
// the blade width collapsed front/back views into a line. Keep foreshortening
// on the handle, with a minimum readable length, and a perpendicular blade.
export function dungeonToolBasis(sockets,active=false,direction=null){
 const grip=sockets[4],axis=sockets[5],up=sockets[6],a=[(axis[0]-grip[0])/24,(axis[1]-grip[1])/24],u=[(up[0]-grip[0])/8,(up[1]-grip[1])/8];
 // Facing down, the rest blend cancels the projected vertical component and
 // turns the tool sideways. Use the authored forward axis in that view only.
 const v=active||direction==='S'?a:[a[0]*.4+u[0]*.9165,a[1]*.4+u[1]*.9165],length=Math.hypot(...v)||1,scale=Math.max(.55,length)*.65;
 // Preserve the authored blade side as well as the grip-to-head axis. A fixed
 // perpendicular mirrored S/E, making the short back of the head face the strike.
 const side=(-v[1]*u[0]+v[0]*u[1])<0?-1:1;
 return [v[0]/length*scale,v[1]/length*scale,-v[1]/length*.65*side,v[0]/length*.65*side];
}
export function dungeonMinerFrame(p){const clip=p.active?'mine':p.walking?'run':'idle',spec=MINER_CLIPS[clip],direction={down:'S',left:'W',up:'N',right:'E'}[p.direction]||'S';const phase=p.active?p.actionProgress:p.motionTime/spec.seconds;const index=p.active?Math.min(spec.count-1,Math.floor(Math.max(0,phase)*spec.count)):Math.floor(Math.max(0,phase||0)*spec.count)%spec.count;return {clip,spec,direction,index,sockets:spec.sockets[direction+'_'+index]};}
// Same cave projection and ground anchor as the approved authoring sheets.
// A 128px logical cell draws at 64 runtime units (the world canvas renders at 2×).
export function drawDungeonMiner(c,x,y,p,layer,tool,shadow=true){
 const key=p.outfitKey||'hardhat-blue';if(!dungeonMinerReady(key)){void loadDungeonMiner(key).catch(()=>{});return false;}const f=dungeonMinerFrame(p),image=images.get(key+'/'+f.clip),row=['S','W','N','E'].indexOf(f.direction),scale=.5;
 const source=dungeonMinerSourceRect(f),body=()=>c.drawImage(image,...source,x-32,y-48,64,64);
 const grip=f.sockets[4],axis=f.sockets[5],dx=axis[0]-grip[0],dy=axis[1]-grip[1];
 const drawTool=()=>tool({x:x+(grip[0]-64)*scale,y:y+(grip[1]-96)*scale,angle:Math.atan2(dy,dx),basis:dungeonToolBasis(f.sockets,p.active,f.direction),direction:p.direction});
 c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 if(layer!=='front'){
  if(shadow){c.globalAlpha*=.22;c.fillStyle='#161928';c.beginPath();c.ellipse(x+2,y+1,10,3,0,0,Math.PI*2);c.fill();c.globalAlpha/=.22;}
  if(p.direction==='up')drawTool();body();
 }
 if(layer!=='body'&&p.direction!=='up'){
  drawTool();
  // Restore the actual mitten pixels at both registered sockets over the handle.
  c.save();c.beginPath();for(const h of [f.sockets[2],f.sockets[3]])c.ellipse(x+(h[0]-64)*scale,y+(h[1]-96)*scale,2.3,2.4,0,0,Math.PI*2);c.clip();body();c.restore();
 }
 c.restore();return true;
}
