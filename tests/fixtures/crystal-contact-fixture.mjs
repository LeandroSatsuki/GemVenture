import {createState,startRun,generateRoom,act,power} from '../../dist/core.js';
import {isFloor} from '../../dist/cave-layout.js';
import {beatTime} from '../../dist/score.js';

export function makeFixture({biome=0,kind=0,mode='sequence'}={}){
 const state=createState(41001);startRun(state);const r=state.run;
 r.floor=biome*5+2;generateRoom(state);r.cards={muscle:1};r.room.quota=99999;
 r.room.cleared=false;r.room.enemies=[];r.room.hazards=[];
 r.room.visible?.fill(1);r.room.explored?.fill(1);
 const free=(x,y)=>isFloor(r.room,x,y)&&![...r.room.nodes,...r.room.rocks].some(n=>n.hp>0&&n.x===x&&n.y===y);
 let neighbor;
 const nodes=r.room.nodes.filter(n=>n.kind===kind&&!n.rare&&!n.explosive).sort((a,b)=>Math.hypot(a.x-r.player.x,a.y-r.player.y)-Math.hypot(b.x-r.player.x,b.y-r.player.y));
 const ore=nodes.find(n=>{if(free(n.x-1,n.y)){neighbor=[n.x-1,n.y];return true;}return false;})||nodes.find(n=>{
  neighbor=[[n.x-1,n.y],[n.x,n.y-1],[n.x+1,n.y],[n.x,n.y+1]].find(([x,y])=>free(x,y));return neighbor;
 });
 if(!ore)throw Error('Cristal acessível não encontrado para o material escolhido.');
 r.cards.muscle=Math.min(15,Math.max(1,Math.ceil(ore.maxHp/4)-1));
 r.player={x:neighbor[0],y:neighbor[1]};r.events=[];
 // Inspect the real hit count; do not invent damage or force the last HP to zero.
 const trial=JSON.parse(JSON.stringify(state)),trialOre=trial.run.room.nodes.find(n=>n.id===ore.id);let total=0;
 while(trialOre.hp>0&&total<40){const result=act(trial,{type:'hit',id:ore.id},8+total);if(!result.ok)throw Error('Acerto de preparação rejeitado.');total++;}
 if(trialOre.hp>0||total<2)throw Error('Sequência de mineração inválida.');
 if(mode==='break')for(let i=0;i<total-1;i++)act(state,{type:'hit',id:ore.id},i);
 r.events=[];
 return {state,ore,totalHits:total,plannedHits:mode==='sequence'?total:1,initialHP:ore.hp,maxHP:ore.maxHp,power:power(state),baseTime:beatTime(r.floor,8)-.35};
}
export function applyFixtureHit(fixture,index){
 const r=fixture.state.run;r.events=[];
 const result=act(fixture.state,{type:'hit',id:fixture.ore.id},8+index);
 if(!result.ok||!r.events.some(e=>e.type==='hit'&&e.mineral?.id===fixture.ore.id))throw Error('Evento real de impacto não confirmado.');
 const packet=r.events;r.events=[];return packet;
}
