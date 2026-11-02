import {bossArenaSize} from './boss-arena-space.js';
import {GEODE_BODY} from './geode-body.js';
import {FAN,fanTiles,inRear,wavePillars,combatLook,aimAtPlayer,facing} from './geode-fan.js';
import {SLAM} from './geode-slam-contract.js';
// Coroa Fraturada TESTE09, selected for fresh official Geode encounters. All scheduling is expressed in music beats.
export const CROWN_VERSION=2;
export const CROWN_RULES=Object.freeze({cue:2,window:4,plates:3,exposure:4,recover:2});
// This first encounter never requires the miner to disappear behind the large body.
export const CROWN_SIDES=Object.freeze(['W','E','S']);
const vectors={S:{x:0,y:1},W:{x:-1,y:0},N:{x:0,y:-1},E:{x:1,y:0}},clockwise=['N','E','S','W'];
export const crownActive=b=>b?.boss===true&&b.bossIndex===0&&b.crown?.version===CROWN_VERSION;
export function crownFlank(b,p){const dx=p.x-b.x,dy=p.y-b.y;if(Math.abs(dx)+Math.abs(dy)!==GEODE_BODY.reach||dx!==0&&dy!==0)return null;return dx<0?'W':dx>0?'E':dy>0?'S':'N';}
export function crownApproach(b,player,preferred=null){const dx=player.x-b.x,dy=player.y-b.y,side=vectors[preferred]?preferred:Math.abs(dx)>=Math.abs(dy)?dx<0?'W':'E':dy<0?'N':'S',v=vectors[side];return b.hp>0?{x:b.x+v.x*GEODE_BODY.reach,y:b.y+v.y*GEODE_BODY.reach}:null;}
function lockPillar(run,b,beat){const w=b.windup;if(!w?.crown||w.aimLocked||w.sampleBeat===beat||beat<w.startedBeat)return;w.sampleBeat=beat;const c=b.crown,target=aimAtPlayer(b,run.player);if(target){if(c.look!==target.look){c.previousLook=c.look;c.look=target.look;c.turnAt=beat;}w.waveLook=target.look;w.aim=target.aim;}w.aim??=facing(w.waveLook);w.x=b.x;w.y=b.y;w.tiles=fanTiles(run.room,{x:b.x,y:b.y,aim:w.aim},w.waveLook);w.pillarLocked=true;if(beat>=w.beat-1)w.aimLocked=true;}
function announce(b,beat){const c=b.crown;c.previousFront=c.front;c.previousLook=c.look||'S';c.stage='cue';c.started=beat;c.until=beat+CROWN_RULES.cue;c.side=CROWN_SIDES[(c.broken+c.cycle+(b.phase===2?1:0))%CROWN_SIDES.length];c.front=clockwise[(clockwise.indexOf(c.side)+1)%4];c.look=c.look||'S';c.serial++;b.exposedUntil=-1;b.recoverUntil=beat;
 const v=vectors[c.front];b.windup={x:b.x+v.x*GEODE_BODY.reach,y:b.y+v.y*GEODE_BODY.reach,tiles:[{x:b.x+v.x*GEODE_BODY.reach,y:b.y+v.y*GEODE_BODY.reach}],startedBeat:beat,beat:c.until,crown:true,kind:'boss',radius:0,waveLook:c.look,crownWave:true,attack:'ONDA DE QUARTZO',hint:'A ONDA AVANÇA · FLANQUEIE',damage:b.phase===2?20:18};
}
export function enableGeodeCrown(b,beat=4){if(b?.bossIndex!==0||!b.boss)throw RangeError('Geode only');b.crown={version:CROWN_VERSION,waves:[],lastHazardBeat:-1,rearEnteredBeat:-1,rearRequestedBeat:-1,rearLastBeat:-1,stage:'cue',started:beat,until:beat+2,side:'W',front:'S',look:'S',previousLook:'S',broken:0,cycle:0,lastHit:-1,hitAt:-1,guardAt:-1,serial:0};announce(b,beat);return b;}
export function advanceCrown(b,beat){if(!crownActive(b)||b.hp<=0||beat<b.crown.started)return[];const out=[],c=b.crown;b.phase=b.hp<=b.maxHp/2?2:1;
 for(let i=0;beat>=c.until&&i<128;i++){const at=c.until;
  if(c.stage==='cue'){const w=b.windup;if(w?.crown){c.guardAt=at;c.slam={at,look:c.look||'S',x:w.x,y:w.y,serial:c.serial};c.waves=[...(c.waves||[]).filter(wave=>wave.at+FAN.outer-FAN.inner>at),{at,look:c.slam.look,aim:{...(w.aim||facing(w.waveLook))},x:b.x,y:b.y,serial:c.serial}].slice(-2);out.push({type:'geodeCrownSlam',beat:at,targetX:w.x,targetY:w.y,look:c.slam.look,serial:c.serial});}c.stage='fracture';c.started=at;c.until=at+CROWN_RULES.window;out.push({type:'geodeCrownReady',beat:at,side:c.side});}
  else if(c.stage==='fracture'){announce(b,at);out.push({type:'geodeCrownCue',beat:at,side:c.side,serial:c.serial});}
  else if(c.stage==='open'){c.stage='recover';c.started=at;c.until=at+CROWN_RULES.recover;b.exposedUntil=-1;b.windup=null;out.push({type:'geodeCrownClose',beat:at});}
  else{c.broken=0;c.cycle++;b.cycle=c.cycle;announce(b,at);out.push({type:'geodeCrownCue',beat:at,side:c.side,serial:c.serial});}
 }
 return out;
}
function publish(s,b,e){const r=s.run;if(!r)return;r.events.push({...e,version:1,sourceId:b.id,x:b.x,y:b.y,id:'crown:'+JSON.stringify([r.room.seed,b.id,e.type,e.beat,e.serial??b.crown.serial,e.ring??null])});}
export function crownAdvanceRun(s,beat){if(!s.run||s.run.room.cleared)return;for(const b of s.run.room.enemies)if(crownActive(b)){lockPillar(s.run,b,beat);for(const e of advanceCrown(b,beat))publish(s,b,e);lockPillar(s.run,b,beat);b.crown.waves=b.crown.waves.filter(w=>beat<w.at+FAN.outer-FAN.inner);b.geodePillars=wavePillars(s.run.room,b,beat);}}
// True means the armor interaction handled the primary hit. No loot or direct HP damage.
export function crownPrimary(s,b,beat,visual){if(!crownActive(b)||!visual)return false;const c=b.crown;if(inRear(b,s.run.player,combatLook(b,beat))){c.rearRequestedBeat=beat;visual.outcome='blocked';visual.damage=0;publish(s,b,{type:'geodeCrownBlock',beat,side:'N'});return true;}if(c.stage==='open'&&beat>=c.started&&beat<c.until)return false;
 visual.outcome='blocked';visual.damage=0;
 if(c.stage!=='fracture'||beat<c.started||beat>=c.until||c.lastHit===beat||crownFlank(b,s.run.player)!==c.side){publish(s,b,{type:'geodeCrownBlock',beat,side:c.side});return true;}
 c.lastHit=beat;c.hitAt=beat;c.hitLook=c.look||'S';c.broken++;visual.outcome='crown-fracture';
 publish(s,b,{type:'geodeCrownFracture',beat,side:c.side,broken:c.broken,look:c.look,plateIndex:c.broken-1});
 if(c.broken===CROWN_RULES.plates){c.stage='open';c.started=beat+1;c.until=c.started+CROWN_RULES.exposure;b.exposedUntil=c.until-1;b.recoverUntil=c.until;b.windup=null;publish(s,b,{type:'geodeCrownOpen',beat,from:c.started,until:c.until});}
 else{announce(b,beat+1);publish(s,b,{type:'geodeCrownCue',beat:beat+1,side:c.side,serial:c.serial});}
 return true;
}
export function crownAllowsDamage(b,beat){return !crownActive(b)||b.crown.stage==='open'&&beat>=b.crown.started&&beat<b.crown.until;}
export function crownCaption(b,beat){const c=b.crown;if(!c)return null;const names={W:'ESQUERDA',E:'DIREITA',S:'FRENTE',N:'ATRÁS'};return c.stage==='open'&&beat>=c.started?'COROA FRATURADA · ATAQUE!':c.stage==='recover'?'A COROA VAI SE FECHAR':`FISSURA · ${names[c.side]} · ${c.broken}/3`;}
export function validCrown(b){if(b.crown===undefined)return true;const c=b.crown,arena=bossArenaSize(b);if(!crownActive(b)||!['cue','fracture','open','recover'].includes(c.stage)||!vectors[c.side]||!vectors[c.front])return false;
 if([c.look,c.previousLook,c.hitLook].some(look=>look!==undefined&&!['S','SW','W','SE','E'].includes(look)))return false;
 if(!Array.isArray(c.waves)||c.waves.length>2||c.waves.some(w=>!Number.isSafeInteger(w.at)||w.at<4||!['SE','S','SW'].includes(w.look)||w.x!==b.x||w.y!==b.y||!Number.isSafeInteger(w.serial)||!validAim(w.aim)))return false;
 if(!['lastHazardBeat','rearEnteredBeat','rearRequestedBeat','rearLastBeat'].every(k=>Number.isSafeInteger(c[k])&&c[k]>=-1))return false;
 if(!vectors[c.previousFront]||!['started','until','broken','cycle','lastHit','hitAt','guardAt','serial'].every(k=>Number.isSafeInteger(c[k]))||c.started<4||c.until<=c.started||c.broken<0||c.broken>3||c.cycle<0||c.serial<1||c.lastHit< -1||c.hitAt< -1||c.guardAt< -1)return false;
 if(c.stage==='open'&&(c.broken!==3||c.until-c.started!==4||b.exposedUntil!==c.until-1))return false;
 if(c.stage==='fracture'&&c.until-c.started!==4||c.stage==='cue'&&c.until-c.started!==2||c.stage==='recover'&&c.until-c.started!==2)return false;
 if(c.slam&&(!Number.isSafeInteger(c.slam.at)||c.slam.at<4||!['SE','S','SW'].includes(c.slam.look)||!Number.isInteger(c.slam.x)||!Number.isInteger(c.slam.y)))return false;
 if(b.geodePillars&&(!Array.isArray(b.geodePillars)||b.geodePillars.length>180||b.geodePillars.some(p=>!Number.isSafeInteger(p.born)||Math.abs(p.until-p.born-FAN.crestLife)>1e-8||p.crownWave!==true||p.crownPillar!==true||!Number.isInteger(p.x)||!Number.isInteger(p.y)||p.x<1||p.x>=arena.cols-1||p.y<1||p.y>=arena.rows-1)))return false;
 const w=b.windup;if(w&&(!w.crown||w.kind!=='boss'||!Array.isArray(w.tiles)||w.tiles.length<1||w.tiles.length>100||w.beat!==w.startedBeat+2||w.damage!==18&&w.damage!==20||w.crownWave!==true||w.aim!==undefined&&!validAim(w.aim)||!['SE','S','SW'].includes(w.waveLook)||w.pillarLocked&&w.tiles.some(p=>!Number.isInteger(p.x)||!Number.isInteger(p.y)||!Number.isInteger(p.ring)||p.ring<0||p.ring>=FAN.outer-FAN.inner)||w.x<1||w.x>=arena.cols-1||w.y<1||w.y>=arena.rows-1))return false;return true;
}


// Resolve after the player's one action for this beat, never in a render callback.
export function crownResolveHazards(s,beat,contact){const r=s.run;if(!r||r.room.cleared||beat<4)return;
 for(const b of r.room.enemies){if(!crownActive(b)||b.hp<=0)continue;const c=b.crown;if(beat<=c.lastHazardBeat)continue;c.lastHazardBeat=beat;
  const rear=inRear(b,r.player,combatLook(b,beat));if(!rear)c.rearEnteredBeat=-1;else{
   if(c.rearEnteredBeat<0)c.rearEnteredBeat=beat;
   if(c.rearLastBeat!==beat&&(c.rearRequestedBeat===beat||beat>c.rearEnteredBeat)){
    c.rearLastBeat=beat;const from={...r.player};const result=contact(b,FAN.rearDamage,beat,true);
    publish(s,b,{type:'geodeCrownRearPulse',beat,look:combatLook(b,beat),from,blocked:!!result?.blocked});
    if(!s.run||r.recovery?.active)return;
   }
  }
  for(const w of c.waves||[]){const ring=beat-w.at;if(ring>=0&&ring<FAN.outer-FAN.inner)publish(s,b,{type:'geodeCrownWaveStep',beat,ring,look:w.look,serial:w.serial});}
  // One damage application per beat, even if two crests intersect a tile.
  const wave=(c.waves||[]).find(w=>fanTiles(r.room,w,w.look).some(p=>p.x===r.player.x&&p.y===r.player.y&&w.at+p.ring*FAN.step===beat));
  if(wave&&c.rearLastBeat!==beat){contact(b,b.phase===2?20:18,beat,false);publish(s,b,{type:'geodeCrownWaveHit',beat,look:wave.look});if(!s.run||r.recovery?.active)return;}
 }
}

function validAim(a){return a&&Number.isFinite(a.x)&&Number.isFinite(a.y)&&a.y>=0&&Math.abs(Math.hypot(a.x,a.y)-1)<1e-7;}

