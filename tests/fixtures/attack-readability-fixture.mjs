import {createState,startRun,generateRoom,enemyBeat,tick,act,walkable,dangerTiles} from '../../dist/core.js';
import {createBoss,rabbitChildren,sporeSummons} from '../../dist/bosses.js';
import {roomSize} from '../../dist/cavern.js';
import {beatTime} from '../../dist/score.js';
import {initAbyss,initFrenzy,musicFloor} from '../../dist/frenzy.js';

export const SCENARIOS=[
 ['slime','Gosma · cuspida e poça',null,0],['bat','Morcego · investida em linha',null,1],['golem','Guardião · salto e impacto',null,2],['elite','Titã · cruz de impacto',null,2],['mixed','Criaturas · ataques simultâneos',null,0],['abyss','Abismo · criaturas e poderes ativos',null,0],
 ['geode','Rei Geodo · cristal gigante',0,0],['pulse','Rei Geodo · empurrão sem dano',0,2],['roots','Matriarca Raiz · raízes cruzadas',1,0],['fossil-left','Titã Fóssil · lado esquerdo',2,0],['fossil-right','Titã Fóssil · lado direito',2,1],['mystic-safe','Místico · entre no selo seguro',3,0],['mystic-runes','Místico · ruptura rúnica',3,1],['spore','Micelial · espiral horária',4,0],['spore-reverse','Micelial · espiral anti-horária',4,16],['mole','Rei das Tocas · emergir',5,0],['mole-ring','Rei das Tocas · fique no centro',5,1],['carrot','Barão Cenoura · alvo travado',6,0]
].map(([id,title,bossIndex,variant])=>({id,title,bossIndex,variant}));
export function makeAttackFixture({id='bat',biome=0,outcome='stay'}={}){
 const spec=SCENARIOS.find(s=>s.id===id);if(!spec)throw Error('Unknown scenario');
 const state=createState(41031);state.core=900;startRun(state);const r=state.run;r.floor=spec.bossIndex==null?biome*5+2:(spec.bossIndex+1)*5;generateRoom(state);
 if(id==='abyss'){initAbyss(r);if(!r.frenzy)initFrenzy(r);r.frenzy.buffs={lightning:256,magnet:256,fire:256,shield:256};r.cards={laser:1,ember:1,ricochet:1};r.room.visible=Array(r.room.cols*r.room.rows).fill(1);}
 r.room.cleared=false;r.room.quota=99999;r.room.hazards=[];r.room.visible?.fill(1);r.room.explored?.fill(1);r.events=[];
 const startBeat=8;let actors;
 if(spec.bossIndex!=null){
  const boss=createBoss(r.floor,r.room.nextId++);boss.cycle=spec.variant;
  if(id==='mole-ring')boss.hp=Math.floor(boss.maxHp/2);
  r.room.enemies=[boss];rabbitChildren(r.room,boss);sporeSummons(r.room,boss);
  r.player={x:8,y:10};if(id==='pulse')r.player={x:10,y:8};if(id==='carrot')r.player={x:5,y:7};
  actors=[boss];
 }else{
  const size=roomSize(r.room),candidates=[];r.room.enemies=[];
  for(let y=4;y<size.rows-4;y++)for(let x=4;x<size.cols-6;x++){let clear=true;for(let dy=-2;dy<=2;dy++)for(let dx=-3;dx<=4;dx++)if(!walkable(r.room,x+dx,y+dy))clear=false;if(clear)candidates.push({x,y});}
  const target=candidates.sort((a,b)=>Math.hypot(a.x-r.player.x,a.y-r.player.y)-Math.hypot(b.x-r.player.x,b.y-r.player.y))[0];if(!target)throw Error('No native open encounter area');r.player={...target};
  // A controlled encounter in a real generated cave: expose bodies and floor,
  // retaining the generated room and all resources outside the comparison lane.
  r.room.nodes=r.room.nodes.filter(n=>Math.abs(n.x-target.x)>6||Math.abs(n.y-target.y)>3);
  const add=(kind,dx,dy,elite=false)=>{const hp=12+Math.floor(r.floor*2.2)+(kind===2?10:0),n={id:r.room.nextId++,type:'enemy',kind,x:target.x+dx,y:target.y+dy,hp,maxHp:hp,windup:null,stunUntil:-1,elite};r.room.enemies.push(n);return n;};
  actors=['mixed','abyss'].includes(id)?[add(0,-1,0),add(1,4,0),add(2,0,-2)]:[add(spec.variant,id==='bat'?4:-1,0,id==='elite')];
 }
 r.beat=startBeat;r.enemyBeat=startBeat-1;r.acted=startBeat;r.missed=-1;r.events=[];enemyBeat(state,startBeat);
 if(actors.some(n=>!n.windup))throw Error('Native planner did not announce attack: '+id);
 const due=Math.min(...actors.map(n=>n.windup.beat)),lastDue=Math.max(...actors.map(n=>n.windup.beat)),warnings=actors.map(n=>({id:n.id,source:{x:n.x,y:n.y},windup:structuredClone(n.windup),tiles:structuredClone(dangerTiles(n.windup))}));
 const firstEvents=r.events.slice();r.events=[];
 const clockFloor=musicFloor(r);return {state,spec,biome:spec.bossIndex??biome,clockFloor,outcome,startBeat,due,lastDue,warnings,firstEvents,baseTime:beatTime(clockFloor,startBeat),endTime:beatTime(clockFloor,lastDue+1)+.28,nextBeat:startBeat+1,commands:[],packets:[]};
}
export function resolveFixtureBeat(f,b){
 const r=f.state.run;r.events=[];
 if(f.outcome==='dodge'&&b===f.due){
  const tiles=new Set(r.room.enemies.filter(n=>n.windup).flatMap(n=>dangerTiles(n.windup)).map(p=>p.x+','+p.y)),steps=[[-1,0],[1,0],[0,-1],[0,1]],choices=steps.map(([dx,dy])=>{let p={...r.player};for(let i=0;i<3;i++)if(walkable(r.room,p.x+dx,p.y+dy))p={x:p.x+dx,y:p.y+dy};return {dx,dy,safe:!tiles.has(p.x+','+p.y)};});
  const choice=choices.find(c=>c.safe)||choices[0],action={type:'dodge',dx:choice.dx,dy:choice.dy},result=act(f.state,action,b);f.commands.push({beat:b,action,result});
 }else if(f.outcome==='guard'&&b===f.due){const result=act(f.state,{type:'item',item:'ward'},b);f.commands.push({beat:b,action:{type:'item',item:'ward'},result});}
 tick(f.state,b);const events=r.events.slice();r.events=[];f.packets.push({beat:b,eventTypes:events.map(e=>e.type),player:{...r.player}});return events;
}
