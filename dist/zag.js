import {nextLevelXP} from './pillars.js';
// Results are persisted before animation. The board uses only earned game resources.
export const ZAG_MINING_GOAL=60,ZAG_SPIN_MS=2200,ZAG_STEP_MS=340;
export const ZAG_WHEEL=Object.freeze([
 {dice:3,name:'3 DADOS'}, {dice:2,kind:1,amount:35,name:'DADOS + RUBIS'},
 {dice:4,name:'4 DADOS'}, {dice:2,kind:3,amount:35,name:'DADOS + ESMERALDAS'},
 {dice:6,name:'6 DADOS!'}, {dice:2,kind:2,amount:35,name:'DADOS + TOPÁZIOS'},
 {dice:3,name:'3 DADOS'}, {dice:2,kind:0,amount:50,name:'DADOS + QUARTZO'}
]);
export const ZAG_BIOMES=['Grutas de Cristal','Floresta Subterrânea','Galeria dos Fósseis','Coração de Magma','Caverna dos Cogumelos'];
export const ZAG_TOOLS={jump:{name:'SALTO +2',hint:'Avance duas casas extras.'},magnet:{name:'ÍMÃ',hint:'Troque seu destino pelo prêmio duas casas à frente.'},invert:{name:'INVERTER',hint:'Vire o dado: 1 ↔ 6, 2 ↔ 5, 3 ↔ 4.'}};
const integer=(n,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
const resources=a=>Array.isArray(a)&&a.length===4&&a.every(n=>integer(n));
const add=(a,b)=>Math.min(Number.MAX_SAFE_INTEGER,a+b);
export const ZAG_ROUTES=['safe','craft','greed'];
const routes=ZAG_ROUTES;
export const ZAG_MODULES={treasure:{name:'BAÚ',hint:'+10% cristais no tabuleiro'},protection:{name:'ESCUDO',hint:'−20% perdas no tabuleiro'},precision:{name:'DADO',hint:'+1 ajuste por mão'}};
export const ZAG_SIGILS=['SOL','LUA','RAIZ'];
export const createZag=()=>({version:4,bonusDice:0,sigils:[],gears:0,collections:0,modules:{treasure:0,protection:0,precision:0},adjustments:0,passes:0,mined:0,rounds:0,position:0,dice:0,hand:[],route:'safe',lastRoute:'safe',jump:0,swap:null,fragments:0,tools:{jump:0,magnet:0,invert:0},investment:[0,0,0,0],satchel:[0,0,0,0],guard:0,luck:0,active:null,result:null,history:[]});
const resultTypes=['spin','crystal','cache','trap','dice','guard','luck','camp','bank','audit','xp','rune','parts'];
const validResult=r=>r&&integer(r.id)&&resultTypes.includes(r.type)&&integer(r.position)&&integer(r.dice)&&resources(r.gained)&&resources(r.lost)&&resources(r.banked)&&typeof r.blocked==='boolean'&&(r.xp===undefined||integer(r.xp))&&(r.interest===undefined||resources(r.interest))&&(r.fee===undefined||resources(r.fee))&&(r.parts===undefined||integer(r.parts))&&(r.sigil===undefined||integer(r.sigil,2))&&(r.collection===undefined||typeof r.collection==='boolean');
export function restoreZag(raw){
 if(raw===undefined)return createZag();
 if(!raw||!integer(raw.passes)||!integer(raw.mined,raw.version===4?ZAG_MINING_GOAL-1:11)||!integer(raw.rounds))return null;
 if(raw.version===1){
  const a=raw.active;if(a&&(!integer(a.kind,3)||![25,100,250,500].includes(a.stake)||!integer(a.startedAt)||!Number.isFinite(a.crash)||a.crash<1.2||a.crash>50))return null;
  const z={...createZag(),passes:add(raw.passes,a?1:0),mined:Math.floor(raw.mined*ZAG_MINING_GOAL/12),rounds:raw.rounds};
  if(a)z.legacyRefund={kind:a.kind,amount:a.stake};return z;
 }
 if(![2,3,4].includes(raw.version)||!integer(raw.position,Number.MAX_SAFE_INTEGER-20)||!integer(raw.dice)||!resources(raw.satchel)||!integer(raw.guard,1)||!integer(raw.luck,3)||!Array.isArray(raw.history)||raw.history.length>6||raw.history.some(r=>!validResult(r))||(raw.result&&!validResult(raw.result)))return null;
 const z={...createZag(),...structuredClone(raw),lastRoute:raw.lastRoute??raw.route??'safe',version:4};
 if(raw.version<4)z.mined=Math.floor(raw.mined*ZAG_MINING_GOAL/12);
 if(!integer(z.bonusDice,2)||!integer(z.gears)||!integer(z.collections)||!integer(z.adjustments,3)||!Array.isArray(z.sigils)||z.sigils.length>2||new Set(z.sigils).size!==z.sigils.length||z.sigils.some(n=>!integer(n,2))||!z.modules||Object.keys(ZAG_MODULES).some(k=>!integer(z.modules[k],3)))return null;
 if(raw.version===2&&z.active?.type==='move')z.active.route='safe';
 if(!Array.isArray(z.hand)||z.hand.length>3||z.hand.some(n=>!integer(n,6)||n<1)||!routes.includes(z.route)||!routes.includes(z.lastRoute)||![0,2].includes(z.jump)||!integer(z.fragments)||!z.tools||Object.keys(ZAG_TOOLS).some(k=>!integer(z.tools[k]))||!resources(z.investment)||z.investment.some(n=>n>10000))return null;
 if(z.swap&&(!integer(z.swap.a)||z.swap.b<=z.position||z.swap.b!==z.swap.a+2||!routes.includes(z.swap.route)))return null;
 const a=z.active;if(a&&(!['spin','move'].includes(a.type)||!integer(a.id)||a.id!==z.rounds||!integer(a.startedAt)||!integer(a.from)||a.from!==z.position||(a.type==='spin'?!integer(a.prize,7):!integer(a.steps,8)||a.steps<1||!routes.includes(a.route)||(a.fromRoute!==undefined&&!routes.includes(a.fromRoute)))))return null;
 return z;
}
export function recordZagCrystal(s,target){
 if(s.run?.mode!=='abyss'||target.type!=='crystal'||target.hp>0||target.zagCounted)return false;
 target.zagCounted=true;s.zag??=createZag();s.zag.mined++;
 if(s.zag.mined<ZAG_MINING_GOAL)return false;s.zag.mined=0;s.zag.passes=add(s.zag.passes,1);s.zag.fragments=add(s.zag.fragments,1);
 s.run.zagPasses=(s.run.zagPasses||0)+1;
 s.run.events.push({type:'proc',id:'zag-pass',name:'+1 PASSE · +1 FRAGMENTO',color:'#e8ff75',x:target.x,y:target.y});return true;
}
function hash(seed,n){let x=(seed^Math.imul(n,2654435761)^Math.floor(n/4294967296))>>>0;x=Math.imul(x^x>>>16,2246822507);x=Math.imul(x^x>>>13,3266489909);return(x^x>>>16)>>>0;}
export function zagTile(seed,position,route='safe'){
 const biome=Math.floor(position/12)%5,tier=Math.min(10,Math.floor(position/60)),h=hash(seed,position);
 if(position===0)return {type:'start',name:'PARTIDA',biome,amount:0,kind:0};
 if(position%12===0)return {type:'camp',name:'COFRE',biome,amount:30+tier*4,kind:0};
 const table=route==='greed'?['cache','trap','xp','audit','rune','rune','cache','rune','luck','dice']:route==='craft'?['parts','guard','parts','luck','parts','guard','crystal','parts','dice','parts']:['crystal','crystal','cache','guard','dice','crystal','guard','luck','xp','crystal'];
 const type=table[h%10],factor=route==='greed'?3:1;
 return {type,sigil:(h>>>16)%3,name:{rune:ZAG_SIGILS[(h>>>16)%3],parts:'FRAGMENTOS',crystal:'CRISTAIS',cache:route==='greed'?'JACKPOT':'TESOURO',trap:'DESABAMENTO',audit:'AUDITORIA',xp:'EXPERIÊNCIA',dice:'+1 DADO',guard:'ESCUDO',luck:'SAQUE ×2'}[type],biome,kind:(h>>>8)%4,amount:(type==='xp'?50:type==='cache'?24:35)*factor+tier*5};
}
export function zagBoardTile(s,position,route=s.zag.route){
 const w=s.zag.swap;return zagTile(s.seed,w&&w.route===route?(position===w.a?w.b:position===w.b?w.a:position):position,route);
}
const canAct=s=>!s.run&&s.zag&&!s.zag.active&&s.zag.position<Number.MAX_SAFE_INTEGER-30&&s.zag.rounds<Number.MAX_SAFE_INTEGER;
export function spinZag(s,now=Date.now(),random=Math.random){
 if(!canAct(s)||s.zag.passes<1||!integer(now))return false;const roll=random();if(!Number.isFinite(roll)||roll<0||roll>=1)return false;
 const z=s.zag;z.passes--;z.rounds++;z.active={type:'spin',id:z.rounds,startedAt:now,from:z.position,prize:Math.floor(roll*8)};z.result=null;return true;
}
export function dealZag(s,random=Math.random){
 if(!canAct(s)||s.zag.hand.length||s.zag.dice<1)return false;const count=Math.min(3,s.zag.dice),values=Array.from({length:count},()=>random());
 if(values.some(n=>!Number.isFinite(n)||n<0||n>=1))return false;s.zag.dice-=count;s.zag.hand=values.map(n=>1+Math.floor(n*6));s.zag.adjustments=s.zag.modules.precision;s.zag.result=null;return true;
}
export function chooseZagRoute(s,route){if(!canAct(s)||!routes.includes(route))return false;s.zag.route=route;return true;}
export function zagDestination(s,index){
 const z=s.zag;if(!integer(index,2)||!z.hand[index])return null;const steps=z.hand[index]+z.jump,position=z.position+steps;return {steps,position,...zagBoardTile(s,position)};
}
export function moveZag(s,index,now=Date.now()){
 if(!canAct(s)||!integer(now))return false;const dest=zagDestination(s,index);if(!dest)return false;
 const z=s.zag;z.hand.splice(index,1);z.rounds++;z.active={type:'move',id:z.rounds,startedAt:now,from:z.position,steps:dest.steps,route:z.route,fromRoute:z.lastRoute};z.jump=0;z.result=null;return true;
}
export function craftZagTool(s,id){if(!canAct(s)||!Object.hasOwn(ZAG_TOOLS,id)||s.zag.fragments<3)return false;s.zag.fragments-=3;s.zag.tools[id]=add(s.zag.tools[id],1);return true;}
export function useZagTool(s,id,index){
 if(!canAct(s)||!Object.hasOwn(ZAG_TOOLS,id)||s.zag.tools[id]<1)return false;const dest=zagDestination(s,index);if(!dest)return false;const z=s.zag;
 if(id==='jump'){if(z.jump)return false;z.jump=2;}
 if(id==='invert')z.hand[index]=7-z.hand[index];
 if(id==='magnet'){
  if(z.swap||dest.position%12===0||(dest.position+2)%12===0)return false;
  const source=zagTile(s.seed,dest.position+2,z.route);if(!['crystal','cache','xp','guard','luck','dice','parts','rune'].includes(source.type))return false;
  z.swap={a:dest.position,b:dest.position+2,route:z.route};
 }
 z.tools[id]--;return true;
}
export function investZag(s,kind,amount,withdraw=false){
 const z=s.zag;if(!canAct(s)||!integer(kind,3)||![25,100,250].includes(amount))return false;
 if(withdraw){if(z.investment[kind]<amount||s.materials[kind]>Number.MAX_SAFE_INTEGER-amount)return false;z.investment[kind]-=amount;s.materials[kind]+=amount;}
 else{if(!z.position||z.position%12!==0||s.materials[kind]<amount||z.investment[kind]+amount>10000)return false;s.materials[kind]-=amount;z.investment[kind]+=amount;}
 return true;
}
export function withdrawZag(s){if(!canAct(s)||!s.zag.investment.some(Boolean))return false;s.zag.investment.forEach((n,i)=>{const paid=Math.min(n,Number.MAX_SAFE_INTEGER-s.materials[i]);s.materials[i]+=paid;s.zag.investment[i]-=paid;});return true;}
export function zagRoundState(s,now=Date.now()){
 const a=s.zag?.active;if(!a)return null;
 const age=Math.max(0,now-a.startedAt),duration=a.type==='spin'?ZAG_SPIN_MS:350+a.steps*ZAG_STEP_MS;
 return {...a,age,duration,progress:Math.min(1,age/duration),seconds:age/1000,phase:age>=duration?'done':a.type,step:a.type==='move'?Math.min(a.steps,Math.max(0,Math.floor((age-350)/ZAG_STEP_MS))):0};
}
const blankResult=(z,type)=>({id:z.rounds,type,position:z.position,dice:0,gained:[0,0,0,0],lost:[0,0,0,0],banked:[0,0,0,0],blocked:false,xp:0,interest:[0,0,0,0],fee:[0,0,0,0]});
function deposit(s,result){s.zag.satchel.forEach((n,i)=>{const paid=Math.min(n,Number.MAX_SAFE_INTEGER-s.materials[i]);s.materials[i]+=paid;result.banked[i]+=paid;s.zag.satchel[i]-=paid;});}
function grant(z,result,kind,amount){const value=Math.min(Math.floor(amount*(1+z.modules.treasure*.1)),Number.MAX_SAFE_INTEGER-z.satchel[kind]);z.satchel[kind]+=value;result.gained[kind]+=value;}
function remember(z,result){z.result=result;z.history=[structuredClone(result),...z.history].slice(0,6);return result;}
export function bankZag(s){const z=s.zag;if(!canAct(s)||!z.satchel.some(Boolean))return false;const result=blankResult(z,'bank');deposit(s,result);return remember(z,result);}
export function settleZag(s,now=Date.now(),immediate=false){
 if(!integer(now)||s.run)return null;const a=zagRoundState(s,now);if(!a||(!immediate&&a.phase!=='done'))return null;
 const z=s.zag,tile=a.type==='move'?zagBoardTile(s,a.from+a.steps,a.route):null,result=blankResult(z,a.type==='spin'?'spin':tile.type);
 if(a.type==='spin'){
  const prize=ZAG_WHEEL[a.prize];z.bonusDice=2;z.dice=add(z.dice,prize.dice);result.dice=prize.dice;if(prize.amount)grant(z,result,prize.kind,prize.amount);
 }else{
  z.position+=a.steps;z.lastRoute=a.route;result.position=z.position;
  for(let p=a.from+1;p<=z.position;p++)if(p%12===0){
   const camp=zagTile(s.seed,p);for(let i=0;i<4;i++){grant(z,result,i,camp.amount);const interest=Math.min(10000-z.investment[i],Math.floor(z.investment[i]*.05));z.investment[i]+=interest;result.interest[i]+=interest;}deposit(s,result);
  }
  if(['crystal','cache'].includes(tile.type)){const factor=z.luck>0?2:1;if(z.luck>0)z.luck--;if(tile.type==='cache')for(let i=0;i<4;i++)grant(z,result,i,tile.amount*factor);else grant(z,result,tile.kind,tile.amount*factor);}
  if(['trap','audit'].includes(tile.type)){if(z.guard){z.guard=0;result.blocked=true;}else if(tile.type==='trap')z.satchel.forEach((n,i)=>{const loss=Math.ceil(n*.25*(1-z.modules.protection*.2));z.satchel[i]-=loss;result.lost[i]=loss;});else z.investment.forEach((n,i)=>{const loss=Math.ceil(n*.1*(1-z.modules.protection*.2));z.investment[i]-=loss;result.fee[i]=loss;});}
  if(tile.type==='dice'){if(z.bonusDice>0){z.bonusDice--;z.dice=add(z.dice,1);result.dice=1;}else{z.fragments=add(z.fragments,1);result.parts=1;}}
  if(tile.type==='parts'){z.fragments=add(z.fragments,1);result.parts=1;}
  if(tile.type==='rune'){
   // A visible toll buys a permanent collection piece. Guard blocks the toll, never the reward.
   if(z.guard){z.guard=0;result.blocked=true;}else z.satchel.forEach((n,i)=>{const loss=Math.ceil(n*.1*(1-z.modules.protection*.2));z.satchel[i]-=loss;result.lost[i]=loss;});
   result.sigil=tile.sigil;if(z.sigils.includes(tile.sigil)){z.fragments=add(z.fragments,2);result.parts=2;}else z.sigils.push(tile.sigil);
   if(z.sigils.length===3){z.sigils=[];z.gears=add(z.gears,1);z.collections=add(z.collections,1);result.collection=true;}
  }
  if(tile.type==='guard')z.guard=1;
  if(tile.type==='luck')z.luck=Math.min(3,z.luck+1);
  if(tile.type==='xp'){result.xp=tile.amount;s.experience.xp+=tile.amount;while(s.experience.xp>=nextLevelXP(s.experience.level)){s.experience.xp-=nextLevelXP(s.experience.level);s.experience.level++;s.experience.points++;}}
  if(z.swap&&z.position>=z.swap.b)z.swap=null;
 }
 z.active=null;return remember(z,result);
}

// Board-only improvements; no automatic spending of village savings or rare tools.
export function upgradeZagModule(s,id){if(!canAct(s)||!Object.hasOwn(ZAG_MODULES,id)||s.zag.gears<1||s.zag.modules[id]>=3)return false;s.zag.gears--;s.zag.modules[id]++;if(id==='precision'&&s.zag.hand.length)s.zag.adjustments++;return true;}
export function adjustZagDie(s,index,delta){if(!canAct(s)||![-1,1].includes(delta)||!integer(index,2)||!s.zag.hand[index]||s.zag.adjustments<1)return false;const n=s.zag.hand[index]+delta;if(n<1||n>6)return false;s.zag.hand[index]=n;s.zag.adjustments--;return true;}
function destinationValue(s,t,position){
 const z=s.zag,total=a=>a.reduce((x,y)=>x+y,0),crossed=Math.floor(position/12)>Math.floor(z.position/12),bag=crossed?0:total(z.satchel),luck=z.luck?2:1,defense=1-z.modules.protection*.2;
 const mineral=(1+z.modules.treasure*.1)*luck;
 let value={crystal:t.amount*mineral,cache:t.amount*4*mineral,xp:t.amount*.45,guard:z.guard?2:35+Math.min(40,bag*.1),luck:45,dice:z.bonusDice?100:18,parts:30,camp:0,trap:z.guard?-10:-bag*.25*defense,audit:z.guard?-10:-total(z.investment)*.1*defense,rune:(z.sigils.includes(t.sigil)?36:z.sigils.length===2?200:100)-(z.guard?10:bag*.1*defense)}[t.type]||0;
 if(crossed)value+=120+total(z.investment)*.05+bag*.08;
 return value;
}
export function planZagTurn(s){
 if(!canAct(s))return null;const z=s.zag;
 if(!z.hand.length)return z.dice?{type:'deal'}:z.passes?{type:'spin'}:z.satchel.some(Boolean)?{type:'bank'}:null;
 let best=null;
 for(let index=0;index<z.hand.length;index++)for(const route of routes)for(const delta of z.adjustments?[-1,0,1]:[0]){
  const face=z.hand[index]+delta;if(face<1||face>6)continue;
  const position=z.position+face+z.jump,tile=zagBoardTile(s,position,route);
  const value=destinationValue(s,tile,position)-Math.abs(delta)*8;
  if(!best||value>best.value)best={type:'move',index,route,delta,value,position,name:tile.name};
 }
 return best;
}
export function autoZagStep(s,now=Date.now(),random=Math.random){
 const plan=planZagTurn(s);if(!plan)return false;
 if(plan.type==='deal')return dealZag(s,random);
 if(plan.type==='spin')return spinZag(s,now,random);
 if(plan.type==='bank')return !!bankZag(s);
 if(!integer(now))return false;chooseZagRoute(s,plan.route);if(plan.delta)adjustZagDie(s,plan.index,plan.delta);return moveZag(s,plan.index,now);
}

export function redeemZagGear(s){if(!canAct(s)||s.zag.gears<1)return false;s.zag.gears--;for(const id of Object.keys(ZAG_TOOLS))s.zag.tools[id]=add(s.zag.tools[id],1);return true;}
