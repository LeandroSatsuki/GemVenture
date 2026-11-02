import {bossArenaSize,bossArenaCenter,validBossArenaSize} from './boss-arena-space.js';
import {rabbitMechanicActive,rabbitPlayerAttack,rabbitAimedTiles,refreshRabbitMutiny,validRabbitMechanic} from './rabbit-mechanic.js';
import {FLOORS_PER_BIOME,TOTAL_FLOORS,biomeIndex} from './campaign.js';
import {P} from './palette.js';
import {isFloor} from './cave-layout.js';
export const BOSSES=[
 {name:'REI GEODO',title:'TRONO DE CRISTAL',hp:140,color:P.cyan,attack:'CRISTAL GIGANTE',hint:'SAIA DA MARCA',damage:30},
 {name:'MATRIARCA RAIZ',title:'SANTUÁRIO DAS RAÍZES',hp:240,color:P.lime,attack:'SEIVA E CIPÓ',hint:'CORTE O OVO · ESTIQUE O CIPÓ',damage:36},
 {name:'TITÃ FÓSSIL',title:'OSSUÁRIO ANCESTRAL',hp:380,color:P.sand,attack:'FALHA SÍSMICA',hint:'MUDE DE LADO',damage:42},
 {name:'BOSS MÍSTICO',title:'ALTAR DO ÚLTIMO PULSO',hp:560,color:P.pink,attack:'ECLIPSE ARCANO',hint:'ENTRE NO SELO AZUL',damage:48},
 {name:'SOBERANO MICELIAL',title:'REDOMOINHO DE ESPOROS',hp:720,color:P.pink,attack:'ESPIRAL DE PEDRA',hint:'SIGA O GIRO · QUEBRE OS NÚCLEOS',damage:36},
 {name:'REI DAS TOCAS',title:'CÂMARA DO ESCAVADOR',hp:960,color:P.yellow,attack:'EMERGIR!',hint:'SAIA DO CÍRCULO',damage:42},
 {name:'BARÃO CENOURA',title:'TOCA DA COLHEITA',hp:1080,color:P.orange,attack:'CENOURA GIGANTE',hint:'SAIA DA LINHA',damage:48}
];
export const isBossFloor=floor=>floor>=FLOORS_PER_BIOME&&floor<=TOTAL_FLOORS&&floor%FLOORS_PER_BIOME===0;
export const bossForFloor=floor=>isBossFloor(floor)?BOSSES[biomeIndex(floor)]:null;
export const livingBoss=room=>room.enemies.find(e=>e.boss&&e.hp>0);
export function createBoss(floor,id){const index=biomeIndex(floor),d=BOSSES[index];return{id,type:'enemy',kind:2,boss:true,bossIndex:index,x:10,y:index===5?9:index===4||index===6?7:6,hp:d.hp,maxHp:d.hp,windup:null,stunUntil:-1,cycle:0,exposedUntil:index===5?3:-1,recoverUntil:3,phase:1,...(index===6?{rabbitWindowUntil:-1,rabbitMechanic:2}: {})};}
const tilesWhere=(predicate,arena={cols:21,rows:15})=>{const tiles=[];for(let y=1;y<arena.rows-1;y++)for(let x=1;x<arena.cols-1;x++)if(predicate(x,y))tiles.push({x,y});return tiles;};
export function planBossAttack(boss,player,beat){const w=buildBossAttack(boss,player,beat);if(boss.arenaSize)w.arenaSize={...boss.arenaSize};return w;}
function buildBossAttack(boss,player,beat){
 const arena=bossArenaSize(boss),area=predicate=>tilesWhere(predicate,arena),center=bossArenaCenter(boss);
 const d=BOSSES[boss.bossIndex],index=boss.bossIndex,cycle=boss.cycle||0;
 let tiles,hint=d.hint,attack=d.attack,safe=null;
 if(index===5){
  // Lock the target at the warning, never chase the player during the dodge.
  const ring=boss.phase===2&&cycle%2===1;
  const target={x:Math.max(2,Math.min(arena.cols-3,player.x)),y:Math.max(3,Math.min(arena.rows-3,player.y))};
  return {...target,from:{x:boss.x,y:boss.y},startedBeat:beat,burrow:true,pattern:ring?'ring':'burst',tiles:moleTiles(target,ring,arena),safe:ring?target:null,beat:beat+3,radius:0,kind:'boss',attack:ring?'ONDA DE TERRA':'EMERGIR!',hint:ring?'FIQUE NO CENTRO AZUL':'SAIA DO CÍRCULO',damage:Math.round(d.damage*(boss.phase===2?1.2:1))};
 }
 if(index===6){
  if(rabbitMechanicActive(boss))return rabbitPlayerAttack(boss,player,beat,Math.round(d.damage*(boss.phase===2?1.2:1)));
  // Snapshot the direction on the first warning beat; the carrot never tracks a dodging player.
  const dx=player.x-boss.x,dy=player.y-boss.y,direction=Math.abs(dx)>=Math.abs(dy)?(dx>=0?'right':'left'):(dy>=0?'down':'up');
  return {x:boss.x,y:boss.y,direction,tiles:carrotTiles(boss,direction),beat:beat+3,radius:0,kind:'boss',attack:'CENOURA GIGANTE',hint:'SAIA DA LINHA',damage:Math.round(d.damage*(boss.phase===2?1.2:1))};
 }
 if(index===0){
  if((boss.cycle||0)%3===2)return {x:boss.x,y:boss.y,startedBeat:beat,geode:true,geodePulse:true,pulseRadius:3,knockback:2,rhythmDamage:0,tiles:geodePulseTiles(boss),safe:null,beat:beat+3,radius:0,kind:'boss',attack:'PULSO SÍSMICO',hint:'AFASTE-SE',damage:0};
  return {x:player.x,y:player.y,startedBeat:beat,geode:true,knockback:3,rhythmDamage:10,tiles:geodeTiles(player,arena),safe:null,beat:beat+3,radius:0,kind:'boss',attack:d.attack,hint:d.hint,damage:Math.round(d.damage*(boss.phase===2?1.2:1))};
 }
 if(index===1)tiles=area((x,y)=>Math.abs(x-player.x)<=1||Math.abs(y-player.y)<=1);
 if(index===2){const left=cycle%2===0;tiles=area(x=>left?x<=center.x:x>=center.x);hint=left?'VÁ PARA A DIREITA':'VÁ PARA A ESQUERDA';}
 if(index===3){
  if(cycle%2===0){safe=[{x:5,y:5},{x:15,y:9},{x:15,y:5},{x:5,y:9}].map(p=>({x:p.x+(arena.cols-21)/2,y:p.y+(arena.rows-15)/2})).sort((a,b)=>(Math.abs(a.x-player.x)+Math.abs(a.y-player.y))-(Math.abs(b.x-player.x)+Math.abs(b.y-player.y)))[0];tiles=area((x,y)=>Math.abs(x-safe.x)>2||Math.abs(y-safe.y)>2);}
  else{tiles=area((x,y)=>x===player.x||y===player.y||Math.abs(x-boss.x)+Math.abs(y-boss.y)<=2);hint='FUJA DAS RUNAS';attack='RUPTURA RÚNICA';}
 }
 // Three full pulses for reading early encounters; later encounters use two.
 if(index===4){const direction=Math.floor(cycle/16)%2?-1:1,angle=(boss.spiralAngle||0)+direction*(boss.phase===2?Math.PI/6:Math.PI/8);boss.spiralAngle=angle;boss.spiralDirection=direction;tiles=spiralTiles(angle,boss.arenaSize);attack=direction===1?'GIRO HORÁRIO ↻':'GIRO ANTI-HORÁRIO ↶';hint=cycle%16>=12?'VAI INVERTER '+(direction===1?'↶':'↻'):'SIGA O GIRO · QUEBRE OS NÚCLEOS';}
 const warning=index===4?1:index<2?3:2;
 return {x:player.x,y:player.y,tiles,safe,beat:beat+warning,radius:0,kind:'boss',attack,hint,damage:Math.round(d.damage*(boss.phase===2?1.2:1))};
}
export function bossStep(boss,player,beat){
 if(boss.hp<=0||(rabbitMechanicActive(boss)&&boss.rabbitMutiny&&!boss.rabbitMutiny.impactApplied)||boss.windup||beat<=(boss.recoverUntil??3)||beat<=(boss.stunUntil??-1))return null;
 boss.phase=boss.hp<=boss.maxHp/2?2:1;
 boss.windup=planBossAttack(boss,player,beat);
 return boss.windup;
}
export function finishBossAttack(boss,beat){if(boss.bossIndex===0&&boss.windup&&!boss.windup.geodePulse){const w=boss.windup;boss.geodePillars=[...(boss.geodePillars||[]).filter(p=>p.until>=beat),{x:w.x,y:w.y,born:beat,until:beat+2}].slice(-2);}if(boss.bossIndex===4){boss.spiralTiles=boss.windup?.tiles||[];boss.windup=null;boss.cycle++;boss.exposedUntil=-1;boss.recoverUntil=beat;return;}if(boss.bossIndex===6){boss.windup=null;boss.cycle++;boss.exposedUntil=-1;boss.recoverUntil=beat+1;return;}if(boss.bossIndex===5&&boss.windup){boss.x=boss.windup.x;boss.y=boss.windup.y;boss.emergedAt=beat;}boss.windup=null;boss.cycle=(boss.cycle||0)+1;boss.exposedUntil=beat+4;boss.recoverUntil=beat+4;}
export function bossDamage(boss,damage,beat){
 if(boss.bossIndex===4||boss.bossIndex===5&&boss.windup||boss.bossIndex===6&&beat>boss.exposedUntil)return 0;
 // The shared per-pulse ceiling also covers explosions, burn and stacked procs.
 if(boss.damageBeat!==beat){boss.damageBeat=beat;boss.damageTaken=0;}
 const exposed=beat<=boss.exposedUntil,cap=Math.ceil(boss.maxHp/12),remaining=Math.max(0,cap-(boss.damageTaken||0));
 const value=Math.min(remaining,Math.max(1,Math.round(damage*(exposed?(boss.bossIndex===6?2.3:1):.2))));
 boss.damageTaken=(boss.damageTaken||0)+value;return value;
}

export const moleTiles=(target,ring=false,arena=target.arenaSize)=>tilesWhere((x,y)=>{const d=Math.max(Math.abs(x-target.x),Math.abs(y-target.y));return ring?d>=2&&d<=4:Math.abs(x-target.x)+Math.abs(y-target.y)<=2;},arena);
export const geodeTiles=(target,arena=target.arenaSize)=>tilesWhere((x,y)=>Math.abs(x-target.x)+Math.abs(y-target.y)<=2,arena);
export const geodePulseTiles=(origin,arena=origin.arenaSize)=>tilesWhere((x,y)=>Math.abs(x-origin.x)+Math.abs(y-origin.y)<=3,arena);
export function geodeKnockback(room,player,target,boss,steps=3){
 // Push away from the spike; on its center, push away from the summoner.
 let dx=player.x-target.x,dy=player.y-target.y;
 if(!dx&&!dy){dx=player.x-boss.x;dy=player.y-boss.y;}
 const direction=Math.abs(dx)>=Math.abs(dy)&&dx?{x:Math.sign(dx),y:0}:{x:0,y:Math.sign(dy)||1};
 const path=[];let p={...player};
 for(let i=0;i<Math.min(3,Math.max(0,steps));i++){
  const next={x:p.x+direction.x,y:p.y+direction.y};
  if(!isFloor(room,next.x,next.y)||room.rocks.some(n=>(n.hp==null||n.hp>0)&&n.x===next.x&&n.y===next.y)||room.enemies.some(n=>n.hp>0&&n.x===next.x&&n.y===next.y))break;
  path.push(next);p=next;
 }return {path,to:p,dx:direction.x,dy:direction.y};
}
export function validGeodeBoss(b){
 if(b.bossIndex!==0)return true;
 if(!validBossArenaSize(b))return false;const arena=bossArenaSize(b);
 const point=p=>p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<arena.cols-1&&p.y>=1&&p.y<arena.rows-1;
 if(b.geodePillars!==undefined&&(!Array.isArray(b.geodePillars)||b.geodePillars.length>2||b.geodePillars.some(p=>!point(p)||!Number.isInteger(p.born)||p.born<0||p.until!==p.born+2)))return false;
 const w=b.windup;
 if(w?.geodePulse!==undefined)return w.geodePulse===true&&w.geode===true&&point(w)&&w.x===b.x&&w.y===b.y&&(b.cycle||0)%3===2&&w.pulseRadius===3&&w.knockback===2&&w.rhythmDamage===0&&w.damage===0&&w.radius===0&&w.safe===null&&w.kind==='boss'&&Number.isSafeInteger(w.startedBeat)&&w.startedBeat>=4&&w.beat===w.startedBeat+3&&w.attack==='PULSO SÍSMICO'&&JSON.stringify(w.tiles)===JSON.stringify(geodePulseTiles(w,b.arenaSize));
 if(!w||w.geode===undefined)return true; // Preserve legacy telegraphs already underway.
 return w.geode===true&&point(w)&&w.knockback===3&&w.rhythmDamage===10&&Number.isInteger(w.startedBeat)&&w.startedBeat>=4&&w.beat===w.startedBeat+3&&w.attack==='CRISTAL GIGANTE'&&JSON.stringify(w.tiles)===JSON.stringify(geodeTiles(w,b.arenaSize));
}
export const RABBIT_HOLES=Object.freeze([{x:5,y:6},{x:15,y:6},{x:10,y:11}]);
export function carrotTiles(boss,direction){return tilesWhere((x,y)=>direction==='right'?x>boss.x&&Math.abs(y-boss.y)<=1:direction==='left'?x<boss.x&&Math.abs(y-boss.y)<=1:direction==='down'?y>boss.y&&Math.abs(x-boss.x)<=1:y<boss.y&&Math.abs(x-boss.x)<=1,boss.arenaSize);}
export const rabbitHoles=boss=>{const c=bossArenaCenter(boss);return RABBIT_HOLES.map(p=>({x:p.x+c.x-10,y:p.y+c.y-7}));};
export function rabbitChildren(room,boss){if(boss?.bossIndex!==6||boss.hp<=0||room.enemies.some(e=>e.rabbitChild!==undefined&&e.parentBoss===boss.id))return;rabbitHoles(boss).forEach(({x,y},rabbitChild)=>room.enemies.push({id:room.nextId++,type:'enemy',kind:0,parentBoss:boss.id,rabbitChild,x,y,hp:1,maxHp:1,stunned:false,stunUntil:-1,windup:null}));}
export function hitRabbitChild(room,child,beat){const boss=room.enemies.find(e=>e.id===child.parentBoss&&e.bossIndex===6&&e.hp>0);if(rabbitMechanicActive(boss))return {hit:false,opened:false,blocked:true};if(!boss||child.stunned)return {hit:false,opened:false};child.stunned=true;child.stunUntil=beat+20;const siblings=room.enemies.filter(e=>e.parentBoss===boss.id&&e.rabbitChild!==undefined);const opened=siblings.length===3&&siblings.every(e=>e.stunned);if(opened){boss.windup=null;boss.rabbitWindowUntil=beat+10;boss.exposedUntil=boss.rabbitWindowUntil;boss.stunUntil=boss.rabbitWindowUntil;boss.recoverUntil=boss.rabbitWindowUntil;siblings.forEach(e=>e.stunUntil=boss.rabbitWindowUntil);}return {hit:true,opened};}
export function refreshRabbitChildren(room,boss,beat){if(rabbitMechanicActive(boss))return refreshRabbitMutiny(room,boss,beat);if(boss?.bossIndex!==6||boss.hp<=0)return;if(boss.rabbitWindowUntil>=0){if(beat<=boss.rabbitWindowUntil)return;boss.rabbitWindowUntil=-1;boss.exposedUntil=-1;for(const child of room.enemies)if(child.parentBoss===boss.id){child.stunned=false;child.stunUntil=-1;}return;}for(const child of room.enemies)if(child.parentBoss===boss.id&&child.stunned&&beat>child.stunUntil){child.stunned=false;child.stunUntil=-1;}}
export function validRabbitBoss(b,room){if(b.bossIndex!==6)return true;if(!validRabbitMechanic(b,room,BOSSES[6].damage))return false;const center=bossArenaCenter(b),holes=rabbitHoles(b);if(!validBossArenaSize(b)||b.x!==center.x||b.y!==center.y||!Number.isInteger(b.rabbitWindowUntil)||b.rabbitWindowUntil< -1)return false;const children=room.enemies.filter(e=>e.parentBoss===b.id);if(children.length!==3||children.some((e,i)=>e.rabbitChild!==i||e.x!==holes[i].x||e.y!==holes[i].y||e.hp!==1||e.maxHp!==1||typeof e.stunned!=='boolean'||!Number.isInteger(e.stunUntil)))return false;const w=b.windup;return !w||(['left','right','up','down'].includes(w.direction)&&w.beat>=0&&w.attack==='CENOURA GIGANTE'&&JSON.stringify(w.tiles)===JSON.stringify(rabbitMechanicActive(b)?rabbitAimedTiles(w,w.direction,b.arenaSize):carrotTiles(b,w.direction)));}
// Saves retain the exact telegraph, target and recovery window, including mid-burrow.
export function validMoleBoss(b){
 if(!validBossArenaSize(b))return false;const arena=bossArenaSize(b);
 const point=p=>p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<arena.cols-1&&p.y>=1&&p.y<arena.rows-1;
 if(!point(b)||![1,2].includes(b.phase)||!Number.isInteger(b.recoverUntil)||!Number.isInteger(b.exposedUntil)||b.emergedAt!==undefined&&(!Number.isInteger(b.emergedAt)||b.emergedAt<0))return false;
 const w=b.windup;if(!w)return b.recoverUntil===b.exposedUntil;
 if(!point(w)||!point(w.from)||w.from.x!==b.x||w.from.y!==b.y||!w.burrow||!['burst','ring'].includes(w.pattern)||!Number.isInteger(w.startedBeat)||w.startedBeat<4||w.beat!==w.startedBeat+3||w.kind!=='boss')return false;
 const ring=b.phase===2&&b.cycle%2===1,tiles=moleTiles(w,ring,b.arenaSize);
 return w.pattern===(ring?'ring':'burst')&&w.damage===Math.round(BOSSES[5].damage*(b.phase===2?1.2:1))&&JSON.stringify(w.tiles)===JSON.stringify(tiles)&&(ring?w.safe?.x===w.x&&w.safe?.y===w.y:w.safe===null);
}

// A curved arm advances at most three cells per sweep; the four-cell base move can follow it.
export function spiralTiles(angle,arenaSize){
 const center=bossArenaCenter({arenaSize}),tiles=[],seen=new Set();
 for(let radius=1.8;radius<=6.1;radius+=.28){const theta=angle+radius*.38,x=Math.round(center.x+Math.cos(theta)*radius),y=Math.round(center.y+Math.sin(theta)*radius),id=x+','+y;if(!seen.has(id)){seen.add(id);tiles.push({x,y});}}
 return tiles;
}
export function sporeSummons(room,boss){
 if(boss?.bossIndex!==4||boss.hp<=0||room.enemies.some(e=>e.summon===boss.id&&e.hp>0))return;
 // Keep every attackable nucleus below the top HUD, on the spiral's outer route.
 const center=bossArenaCenter(boss);for(const [a,b]of [[5,7],[7,11],[15,7],[13,11]]){const x=a+center.x-10,y=b+center.y-7;room.enemies.push({id:room.nextId++,type:'enemy',kind:2,summon:boss.id,x,y,hp:36,maxHp:36,windup:null,stunUntil:-1});}
}
