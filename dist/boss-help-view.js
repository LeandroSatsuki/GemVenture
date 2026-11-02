import {crownActive,crownCaption} from './geode-crown.js';
import {mysticActive,mysticCaption} from './mystic-mechanic.js';
import {rootActive,rootCaption} from './matriarch-mechanic.js';
import {micelialActive,micelialReverseWarning} from './micelial-mechanic.js';

// Read current mechanics only. No scheduling, combat writes, queues or extra clock.
export function bossHelpCaption(boss,run,phase,{enabled=false,attackCaption=null}={}){
 if(!enabled||!boss?.boss||boss.hp<=0||!run||run.room.cleared||run.rest?.active||run.recovery?.active)return null;
 if(crownActive(boss))return crownCaption(boss,phase);
 if(mysticActive(boss))return ['rest','shatter'].includes(boss.mirage.state)?null:mysticCaption(boss,phase);
 if(rootActive(boss))return rootCaption(boss,phase);
 if(micelialActive(boss))return micelialReverseWarning(phase)?'O giro vai mudar':'Quebre núcleos para abrir passagem';
 if(boss.windup)return attackCaption||boss.windup.hint||'Desvie da marca';
 if(Math.floor(phase)<=boss.exposedUntil)return 'Ataque agora!';
 if(boss.bossIndex===6)return boss.rabbitMechanic===2?'Atraia a cenoura e desvie':'Atordoe os três filhotes';
 if(boss.bossIndex===4)return 'Siga o giro · quebre os núcleos';
 return null;
}
// A hint must not reveal which copy is real during the Mystic encounter.
export function bossHelpAnchor(boss,room){return mysticActive(boss)?{x:Math.floor(room.cols/2),y:Math.floor(room.rows/2)}:{x:boss.x,y:boss.y};}
export function bubbleLines(c,text,maxWidth){
 const lines=[];let line='';
 for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>maxWidth){lines.push(line);line=word;}else line=next;}
 if(line)lines.push(line);return lines;
}
export function bossBubblePlacement({x,y,width,height,bounds,avoid=[]}){
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const candidates=[[x+38,y-height/2],[x-width-38,y-height/2],[x-width/2,y-height-38],[x-width/2,y+38]];
 for(const [cx,cy] of candidates){
  const left=clamp(cx,bounds.left+8,bounds.right-width-8),top=clamp(cy,bounds.top+8,bounds.bottom-height-8);
  if(!avoid.some(r=>left+width+5>r.left&&left-5<r.right&&top+height+5>r.top&&top-5<r.bottom))return {left,top};
 }
 return null; // Explanations yield to the HUD; never queue an obsolete hint.
}
export function bossHelpObstacles(doc,canvas,{camera,scale,offsetX,offsetY}){
 if(!doc||!(scale>0))return [];
 const frame=canvas.getBoundingClientRect(),factor=2*scale;
 const selectors='#hud5Root .top,#hud5Root .combo,#hud5Root .location,#hud5Root .mission,#hud5Root .score,#hud5Root .items,#hud5Root .rail,#hud5Root .cargo,#bossHud,#hud5Root #objective,#hud5Root #message,#hud5Root #toast,#hud5Root #depthLift,#hud5Root #targetTip,#hud5Root .card-chip,#hud5Root .boost-node,#hud5Root #procFeed';
 return [...doc.querySelectorAll(selectors)].filter(el=>!el.closest?.('[data-hud-layout-hidden="true"]')).map(el=>el.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0).map(r=>({left:(r.left-frame.left-offsetX)/factor+camera.x/2,right:(r.right-frame.left-offsetX)/factor+camera.x/2,top:(r.top-frame.top-offsetY)/factor+camera.y/2,bottom:(r.bottom-frame.top-offsetY)/factor+camera.y/2}));
}
export function paintBossHelpBubble(c,{x,y,text,bounds,avoid=[]}){
 if(!text)return;
 c.save();try{
  c.font="600 10px 'GVExpBody','Nunito','Trebuchet MS',sans-serif";
  const width=Math.min(172,Math.max(80,bounds.right-bounds.left-16)),lines=bubbleLines(c,text,width-20),height=lines.length*13+18;
  const placement=bossBubblePlacement({x,y,width,height,bounds,avoid});if(!placement)return;
  const {left,top}=placement;
  c.fillStyle='#020816';c.beginPath();c.roundRect(left,top+3,width,height,7);c.fill();
  c.fillStyle='#102a52';c.strokeStyle='#26538c';c.lineWidth=1.5;c.beginPath();c.roundRect(left,top,width,height,7);c.fill();c.stroke();
  const tx=Math.max(left+8,Math.min(left+width-8,x)),ty=Math.max(top+8,Math.min(top+height-8,y));
  c.beginPath();
  if(y<top||y>top+height){const edge=y<top?top:top+height;c.moveTo(tx-5,edge);c.lineTo(tx,edge+(y<top?-9:9));c.lineTo(tx+5,edge);}
  else{const edge=x<left?left:left+width;c.moveTo(edge,ty-5);c.lineTo(edge+(x<left?-9:9),ty+3);c.lineTo(edge,ty+5);}
  c.fill();c.stroke();
  c.fillStyle='#edf4ff';c.textAlign='left';c.textBaseline='top';for(let i=0;i<lines.length;i++)c.fillText(lines[i],left+10,top+9+i*13);
 }finally{c.restore();}
}
