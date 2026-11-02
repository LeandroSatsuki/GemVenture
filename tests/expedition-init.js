// Isolated visual fixture, served only by tests/visual-server.mjs on port 4174.
import {beatTime,trackForFloor} from '/score.js';
import {createState,startRun,act,generateRoom,enemyBeat,finishRun,pathTo,enterCamp,tick} from '/core.js';
import {missionOffers,acceptMission,missionList} from '/missions.js';
import {offerAbyssCards} from '/abyss-cards.js';
let state=createState(712);state.level=5;state.bank=300;state.essence=4;state.seals=5;state.experience={level:8,xp:100,points:12};state.stars=40;
state.unlocked=['force','ear','stun'];state.equipped=[...state.unlocked];startRun(state);
state.run.cards={popcorn:2,ember:1,elastic:1};state.run.room.charge=state.run.room.quota;
for(let beat=0;beat<state.run.room.goal;beat++)act(state,{type:'move',x:beat%2?3:2,y:11},beat);
state.run.cardOffer=['popcorn','ice','ricochet'];state.run.events=[];
state.run.loot={crystals:[{count:5,gems:25},{count:3,gems:48},{count:2,gems:70},{count:2,gems:14}],rocks:{count:4,gems:12},enemies:{count:3,gems:12},essence:1};state.run.bag=181;
if(new URLSearchParams(location.search).has('cards')){state.run.cardOffer=['candy','popcorn','shell'];state.run.cards.candy=1;state.run.health=32;}
if(new URLSearchParams(location.search).has('stars')){state.stars=12;state.run.score.points=25919;state.run.score.earned=2;state.run.combo=20;state.run.room.cleared=false;state.run.room.charge=0;state.run.room.rocks=[];state.run.room.enemies=[];state.run.acted=-1;state.run.room.nodes=[{id:999,type:'crystal',kind:0,x:4,y:11,hp:100,maxHp:100,value:10,born:0,burn:{start:-1,until:5,damage:1}}];}
if(new URLSearchParams(location.search).has('mission')){state.mission={id:'qa-delivery',template:'miner',tier:'gold',goal:27,progress:26,remaining:90,duration:360,status:'active'};state.run.room.nodes[0].hp=1;}
if(new URLSearchParams(location.search).has('skills')){state.run=null;state.bank=3000;state.essence=30;state.unlocked=['ear','dash','force','breath','stun'];state.equipped=[...state.unlocked];state.skillRanks={dash:1,force:2};state.lastResult=null;}
if(new URLSearchParams(location.search).has('forge')){state.run=null;state.bank=5800;state.best=10;state.materials=[240,120,95,180];state.lastResult=null;state.forge.invested.anvil=300;}
if(new URLSearchParams(location.search).has('armorset')){state.run=null;state.lastResult=null;state.best=35;state.bank=250000;state.materials=[5000,5000,5000,5000];state.forge.levels.armor=41;state.forge.gear.items.helmet.traits[0]={id:'steady',kind:0,rank:3};state.forge.gear.items.pickaxe.traits[0]={id:'force',kind:1,rank:2};state.forge.gear.items.backpack.traits[0]={id:'yield',kind:3,rank:2};}
if(new URLSearchParams(location.search).has('boss')){state.run.floor=Number(new URLSearchParams(location.search).get('boss'))||20;state.best=state.run.floor;if(state.run.floor>30)state.seals=6;generateRoom(state);state.run.beat=4;state.run.acted=4;state.run.enemyBeat=-1;enemyBeat(state,4);state.run.elapsed=beatTime(state.run.floor,4);state.run.clockBpm=trackForFloor(state.run.floor).bpm;state.run.events=[];}
if(new URLSearchParams(location.search).has('rabbit')){state.run.floor=35;state.best=35;state.seals=6;generateRoom(state);const r=state.run,b=r.room.enemies.find(e=>e.boss),pose=new URLSearchParams(location.search).get('rabbit');r.player={x:9,y:10};r.guardUntil=100;r.beat=4;r.acted=4;r.enemyBeat=-1;enemyBeat(state,4);if(pose==='open'){for(const child of r.room.enemies.filter(e=>e.rabbitChild!==undefined)){child.stunned=true;child.stunUntil=16;}b.windup=null;b.exposedUntil=16;b.stunUntil=16;b.rabbitWindowUntil=16;r.beat=7;r.acted=7;}r.elapsed=beatTime(35,pose==='open'?7.5:4.5);r.musicClock=2;r.events=[];r.combo=18;}
if(new URLSearchParams(location.search).get('boss')==='25'){state.run.acted=5;tick(state,5);enemyBeat(state,6);state.run.elapsed=beatTime(25,6);}
if(new URLSearchParams(location.search).has('explore')){state.run.floor=Number(new URLSearchParams(location.search).get('explore'))||1;generateRoom(state);}
if(new URLSearchParams(location.search).has('return')){state.run.materials=[25,48,70,14];state.run.bag=24;finishRun(state,'return');}
if(new URLSearchParams(location.search).has('vitals')){state.run.health=64;state.run.rhythm=38;}
if(new URLSearchParams(location.search).has('travel')){const route=pathTo(state.run.room,state.run.player,{x:21,y:15});for(let i=0;i<route.length;i++)act(state,{type:'move',...route[i]},i+5);state.run.elapsed=0;state.run.beat=-1;state.run.acted=-1;state.run.enemyBeat=-1;}
if(new URLSearchParams(location.search).has('music')){state.run.elapsed=beatTime(state.run.floor,28);state.run.musicClock=2;state.run.beat=27;state.run.enemyBeat=27;state.run.acted=27;}
if(new URLSearchParams(location.search).has('journey')){state.run.score.points=5000;state.run.score.earned=2;state.run.room.scoreSpent=1200;state.run.items={blast:3,tonic:2,ward:2};state.run.elapsed=0;state.run.musicClock=2;}
if(new URLSearchParams(location.search).has('camp')){state.run.floor=10;state.best=10;generateRoom(state);state.run.room.bossDefeated=true;state.run.room.enemies=[];state.run.room.cleared=true;state.run.cardChosen=true;state.run.health=40;state.run.materials=[60,60,60,60];enterCamp(state);}
if(new URLSearchParams(location.search).has('recovery')){state.run.recovery={active:true,reserve:'health'};state.run.health=30;state.run.combo=28;state.run.revived=true;state.unlocked=['ear','breath','dash','guard','revive','force'];state.equipped=['ear','breath','revive','force'];}
if(new URLSearchParams(location.search).has('abyss')){state.run=null;state.descent.bosses=[5,10,15,20];state.descent.gate=[1500,1200,1000,800];startRun(state,'abyss');const r=state.run;for(let b=0;b<=28;b++){r.acted=b;r.guardUntil=b+8;r.health=100;r.rhythm=100;tick(state,b);}r.health=84;r.rhythm=92;r.combo=42;r.abyss.checkpoint={section:3,until:52,used:false};r.frenzy.buffs={giant:44,lightning:44,fire:44,magnet:44};r.materials=[50,80,30,20];r.bag=200;r.score.points=12600;r.score.earned=2;r.elapsed=beatTime(16,28.2);r.musicClock=2;r.items={blast:4,tonic:3,ward:2};}
if(new URLSearchParams(location.search).has('village')){state.run=null;state.lastResult=null;}
if(new URLSearchParams(location.search).has('delivery')){state.run=null;state.lastResult=null;state.mission={id:'qa-delivery',template:'miner',tier:'gold',goal:27,progress:27,remaining:90,duration:360,status:'ready'};}
if(new URLSearchParams(location.search).has('complete')){state.run.room.cleared=true;state.run.cardChosen=false;state.run.cardOffer=['candy','popcorn','shell'];state.run.events=[];}
if(new URLSearchParams(location.search).has('gate')){state.run=null;state.lastResult=null;state.best=20;state.materials=[1600,1400,1200,1000];state.descent={version:1,bosses:[5,10,15,20],stops:[1,6],gate:new URLSearchParams(location.search).get('gate')==='ready'?[1400,1200,1000,800]:[450,300,300,200]};}
if(new URLSearchParams(location.search).has('approach')){state.run.floor=4;state.best=4;generateRoom(state);}
if(new URLSearchParams(location.search).has('vein')){const r=state.run;r.room.cleared=false;r.room.charge=0;r.room.rocks=[];r.room.enemies=[];r.player={x:3,y:11};r.room.nodes=[{id:999,type:'crystal',kind:2,x:4,y:11,hp:26,maxHp:26,value:105,born:0,rare:true,rareUntil:48}];r.frenzy.quest={kind:'vein',name:'VEIO RARO',target:999,goal:1,progress:0,until:48,done:false};r.acted=-1;r.beat=-1;r.missed=-1;r.events=[];act(state,{type:'hit',id:999},0);r.elapsed=0;}
if(new URLSearchParams(location.search).has('abyssrecord'))state.abyssBest=1275;
if(new URLSearchParams(location.search).has('pickaxe')){state.run=null;state.lastResult=null;state.level=Number(new URLSearchParams(location.search).get('pickaxe'))||1;state.bank=1e8;state.materials=[1e8,1e8,1e8,1e8];}
if(new URLSearchParams(location.search).has('zag')){state.run=null;state.lastResult=null;state.zag.passes=6;state.zag.dice=3;state.zag.hand=[2,4,6];state.zag.fragments=9;state.zag.tools={jump:1,magnet:1,invert:1};state.zag.position=8;state.zag.sigils=[0,2];state.zag.gears=1;state.zag.bonusDice=2;state.zag.satchel=[45,20,10,0];state.materials=[450,260,180,90];}
if(new URLSearchParams(location.search).has('hud')){state.run.room.cleared=false;state.run.health=64;state.run.combo=36;state.run.novaSpent=1;state.unlocked.push('fury');state.equipped=['fury'];state.run.score.points=Math.round(state.run.score.target*.78);state.run.score.earned=4;state.run.room.scoreSpent=1500;state.run.events=[];state.run.items={blast:3,tonic:2,ward:2};}
if(new URLSearchParams(location.search).has('lift')){state.run=null;state.lastResult=null;state.best=25;state.seals=4;state.descent.records={1:{points:3000,clears:8},5:{points:2140,clears:2},11:{points:4100,clears:1}};}
if(new URLSearchParams(location.search).has('soak')){
 const {World}=await import('/world.js'),{beatPhase}=await import('/score.js');
 const frames=[],draws=[],gaps=[],errors=[];let measured=false,started=0,previous=0,lastAction=-1,liveState;
 const report=document.createElement('output');report.id='soakReport';report.style.cssText='position:fixed;top:0;left:0;z-index:99999;background:#180d2f;color:white;max-width:80%;font:12px monospace;white-space:pre-wrap';document.body.append(report);
 addEventListener('error',e=>errors.push(e.message));
 const raf=requestAnimationFrame.bind(window),original=World.prototype.draw,originalCave=World.prototype.cave;let caveBuilds=0;
 World.prototype.cave=function(...args){caveBuilds++;return originalCave.apply(this,args);};
 const stall=document.createElement('button');stall.id='simulateStall';stall.textContent='TESTAR TRAVADA';stall.style.cssText='position:fixed;top:25px;left:0;z-index:99999';stall.onclick=()=>{const end=performance.now()+650;while(performance.now()<end){}};document.body.append(stall);
 const stats=a=>{const sorted=[...a].sort((a,b)=>a-b);return{mean:+(a.reduce((x,y)=>x+y,0)/Math.max(1,a.length)).toFixed(2),p95:+(sorted[Math.floor(sorted.length*.95)]||0).toFixed(2),max:+Math.max(0,...a).toFixed(2)};};
 window.requestAnimationFrame=callback=>raf(now=>{const t=performance.now();callback(now);if(measured){frames.push(performance.now()-t);if(previous)gaps.push(now-previous);previous=now;}});
 World.prototype.draw=function(s,time,dt,...args){liveState=s;const r=s.run,paused=args[2];if(r&&!paused){if(!started){started=performance.now();measured=true;}r.health=100;r.rhythm=100;const phase=beatPhase(16,time),beat=Math.round(phase);if(Math.abs(phase-beat)<.08&&beat>lastAction){lastAction=beat;const code=beat%5===0?'Space':r.player.y<13?'KeyS':r.player.x>27?'KeyA':r.player.x<13?'KeyD':beat%16<8?'KeyD':'KeyA';document.getElementById('world').dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true}));}}
 if(r)r.guardUntil=r.beat+10;
 const t=performance.now();original.call(this,s,time,dt,...args);if(measured)draws.push(performance.now()-t);
 };
 setInterval(()=>{report.textContent=JSON.stringify({seconds:started?Math.round((performance.now()-started)/1000):0,frames:frames.length,cpu:stats(frames),draw:stats(draws),gaps:stats(gaps),errors,caveBuilds,depth:liveState?.run?.abyss?.rows*5,entities:liveState?.run?[liveState.run.room.rocks.length,liveState.run.room.nodes.length,liveState.run.room.enemies.length]:null});},1000);
}
if(new URLSearchParams(location.search).has('powers')){state.run.frenzy.buffs={[new URLSearchParams(location.search).get('powers')]:80};state.run.guardUntil=-1;state.run.abyss.checkpoint=null;state.run.frenzy.quest=null;}
if(new URLSearchParams(location.search).has('vision')){const vision=Number(new URLSearchParams(location.search).get('vision'))||0;if(vision)state.run.cards.lantern=vision;else delete state.run.cards.lantern;state.run.room.rocks=state.run.room.rocks.filter(n=>Math.hypot(n.x-state.run.player.x,n.y-state.run.player.y)>4);}
if(new URLSearchParams(location.search).has('wish')){state.run=null;state.lastResult=null;state.seed=323;state.village.well=10;state.bank=10000;state.materials=[2000,2000,2000,2000];}
if(new URLSearchParams(location.search).has('talents')){state.run=null;state.lastResult=null;state.stars=140;state.experience={level:40,xp:0,points:40};const {buyTalent}=await import('/talents.js');const {SKILLS}=await import('/core.js');state.unlocked=['ear','force','fortune'];state.equipped=['ear','force'];for(const id of ['web-0-0','web-0-1','web-0-2','web-1-2'])for(let i=0;i<3;i++)buyTalent(state,id,SKILLS);state.experience.points=40;}
if(new URLSearchParams(location.search).has('mole')){
 const pose=new URLSearchParams(location.search).get('mole');state.run.floor=30;state.best=30;state.seals=5;generateRoom(state);
 const r=state.run,b=r.room.enemies.find(e=>e.boss);r.player={x:10,y:10};r.beat=4;r.acted=4;r.enemyBeat=-1;
 if(pose==='ring'){b.hp=400;b.cycle=1;}
 enemyBeat(state,4);r.beat=5;r.acted=5;
 if(pose==='surface'){r.player={x:13,y:10};r.acted=7;tick(state,7);}
 r.elapsed=beatTime(30,pose==='surface'?7.65:5.5);r.musicClock=2;r.events=[];r.cardOffer=[];r.combo=16;
}
if(new URLSearchParams(location.search).has('geode')){
 const pose=new URLSearchParams(location.search).get('geode');state.run.floor=5;state.best=5;generateRoom(state);
 const r=state.run;r.player={x:10,y:9};r.combo=16;r.rhythm=75;r.beat=4;r.acted=4;r.enemyBeat=-1;enemyBeat(state,4);
 if(pose!=='warning'){if(pose==='dodge')r.player={x:14,y:9};r.acted=7;tick(state,7);}
 r.elapsed=beatTime(5,pose==='warning'?5.4:7.5);r.musicClock=2;r.cardOffer=[];
}
if(new URLSearchParams(location.search).has('missionboard')){state.run=null;state.lastResult=null;state.best=30;state.seals=5;state.village.missions=Math.min(150,Math.max(1,Number(new URLSearchParams(location.search).get('missionboard'))||1));state.bank=2000000;state.materials=[100000,100000,100000,100000];}
if(new URLSearchParams(location.search).has('missionroster')){state.run=null;state.lastResult=null;state.village.missions=150;state.best=30;state.seals=5;for(let i=0;i<3;i++)acceptMission(state,missionOffers(state)[0].id);missionList(state).forEach((m,i)=>{m.progress=i===0?m.goal:Math.floor(m.goal*.3);if(i===0)m.status='ready';});}
if(new URLSearchParams(location.search).has('inputcheck')){const {prepareInputCheck}=await import('/input-check.js');prepareInputCheck(state,new URLSearchParams(location.search).get('inputcheck')||'floors');}
if(new URLSearchParams(location.search).has('abysscards')){state.run=null;state.descent.bosses=[5,10,15,20];state.descent.gate=[1500,1200,1000,800];startRun(state,'abyss');const r=state.run;r.abyss.section=2;r.beat=96;r.acted=96;r.enemyBeat=96;r.frenzy.lastBeat=96;r.combo=34;r.health=70;r.guardUntil=200;r.elapsed=beatTime(16,96.5);r.musicClock=2;offerAbyssCards(state);r.events=[];}
if(new URLSearchParams(location.search).has('observer')&&state.run){const r=state.run,h=r.room.hedgehog;r.player={x:h.x,y:h.y+2};r.room.rocks=r.room.rocks.filter(n=>Math.hypot(n.x-r.player.x,n.y-r.player.y)>2);r.room.nodes=r.room.nodes.filter(n=>Math.hypot(n.x-r.player.x,n.y-r.player.y)>1);r.room.enemies=[];r.elapsed=0;r.beat=-1;r.acted=-1;r.enemyBeat=-1;r.events=[];}
if(new URLSearchParams(location.search).has('miner')){state=createState(712);state.bank=800;state.materials=[90,60,75,45];state.miner.fragments=[8100,6400,4100,2700];state.miner.gravel=4500;state.miner.combo=39;state.miner.steps=6;state.miner.enabled=true;state.miner.lastAt=Date.now();}
if(new URLSearchParams(location.search).has('minerdemo')){Object.assign(state.miner,{level:10,side:2,bombs:2,gravel:6450,combo:42,enabled:false,overdrive:5000});}
if(new URLSearchParams(location.search).has('uiforge')){state=createState(712);state.level=5;state.bank=275;state.materials=[9,11,17,7];}
if(new URLSearchParams(location.search).has('newbie')){state=createState(712);startRun(state);}
if(new URLSearchParams(location.search).has('minerperf')){
 const {MinerGame}=await import('/miner-view.js'),draw=MinerGame.prototype.draw,samples=[];let peakParticles=0,measured=0;
 const meter=document.createElement('output');meter.id='minerPerf';meter.style.cssText='position:fixed;bottom:2px;left:2px;font:12px monospace;color:white;z-index:10000;background:#180d2f';document.body.append(meter);
 MinerGame.prototype.draw=function(...args){const at=performance.now();draw.apply(this,args);samples.push(performance.now()-at);if(samples.length>900)samples.shift();peakParticles=Math.max(peakParticles,this.particles.length);if(++measured%30===0){const sorted=[...samples].sort((a,b)=>a-b);meter.textContent=JSON.stringify({frames:samples.length,p50:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],peakParticles,rows:13,tiles:91});}};
}
if(new URLSearchParams(location.search).has('approved')){
 const index=Math.max(0,Math.min(6,Number(new URLSearchParams(location.search).get('approved'))||0));
 state=createState(712);state.seals=6;state.best=35;startRun(state);state.run.floor=index*5+(new URLSearchParams(location.search).has('boss')?5:1);generateRoom(state);
 state.run.cardOffer=[];state.run.events=[];state.run.beat=4;state.run.acted=4;state.run.enemyBeat=4;state.run.elapsed=beatTime(state.run.floor,4.4);state.run.musicClock=2;
 if(new URLSearchParams(location.search).has('reveal')){delete state.run.room.explored;delete state.run.room.visible;}
}
if(new URLSearchParams(location.search).has('hedgehogcheck')){state=createState(712);startRun(state);const {prepareHedgehogCheck}=await import('/hedgehog-check.js');prepareHedgehogCheck(state);}
localStorage.setItem('gemventure-save-v2',JSON.stringify(state));
await import('/run.js');
if(new URLSearchParams(location.search).has('approved')){const {loadApprovedArt}=await import('/approved-art.js');const status=await loadApprovedArt();const report=document.createElement('output');report.id='approvedArtQA';report.style.cssText='position:fixed;bottom:2px;left:2px;z-index:10000;color:#e8ff75;background:#180d2f;font:11px monospace';report.textContent='QA · ARTES '+status.ready+'/'+status.total+' · ERROS '+status.failed.length+(new URLSearchParams(location.search).has('reveal')?' · CENA REVELADA':'');document.body.append(report);}
if(new URLSearchParams(location.search).has('watchcards')){const dialog=document.getElementById('abyssCardDialog');let opened=0;new MutationObserver(()=>{if(dialog.open){opened=performance.now();return;}if(!opened)return;const seconds=(performance.now()-opened)/1000;opened=0;document.getElementById('pause').click();const result=document.createElement('p');result.id='abyssChoiceQA';result.style.cssText='position:fixed;bottom:10px;left:10px;z-index:9999;background:#180d2f;color:#e8ff75;padding:14px;font-size:20px';result.textContent='ESCOLHA '+seconds.toFixed(2)+'s · COMBO '+document.getElementById('combo').textContent+' · FÔLEGO '+document.getElementById('breathLabel').textContent;document.body.append(result);}).observe(dialog,{attributes:true,attributeFilter:['open']});}
if(new URLSearchParams(location.search).has('freeze')){const style=document.createElement('style');style.textContent='#pauseCover{display:none!important}.immersive-run #controlDeck{visibility:visible!important}';document.head.append(style);document.getElementById(new URLSearchParams(location.search).has('journey')?'scoreHud':'breathHud').scrollIntoView({block:'start'});}
