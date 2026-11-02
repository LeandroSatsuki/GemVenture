export const HUD_LAYOUT_KEY='gemventure-hud-layout-v1';
export const HUD_WIDGETS=Object.freeze([
 ['life','Vida','.vital'],['breath','Fôlego','.breath'],['combo','Combo','.combo'],['location','Andar e pausa','.location'],['mission','Missão','.mission'],['stars','Pontos e estrelas','.score'],['pulse','Pulso da música','.rail'],['items','Itens 1 · 2 · 3','.items'],['cargo','Mochila e retorno','.cargo'],['objective','Objetivo e avisos','.hud5-critical'],['buffs','Poderes ativos','#boostHud'],['cards','Cartas','.hud5-cards'],['orbs','Orbs','.run-orb-tray'],['boss','Vida do boss','#bossHud'],['sentinel','Sentinela','.cave-miniboss-status,.cave-miniboss-warning']
].map(([id,name,selector])=>Object.freeze({id,name,selector})));
export const HUD_SCALE=Object.freeze({min:.65,max:1.75,step:.05});
const known=new Set(HUD_WIDGETS.map(w=>w.id)),record=o=>o&&typeof o==='object'&&!Array.isArray(o),number=n=>typeof n==='number'&&Number.isFinite(n),clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export function normalizeHudLayout(input){
 const result={};if(!record(input))return result;
 for(const [id,value] of Object.entries(input)){if(!known.has(id)||!record(value))continue;
  const entry={scale:number(value.scale)?Math.round(clamp(value.scale,.65,1.75)*100)/100:1,hidden:value.hidden===true};
  if(number(value.x)&&number(value.y)){entry.x=clamp(value.x,0,1);entry.y=clamp(value.y,0,1);}
  if(entry.scale!==1||entry.hidden||entry.x!==undefined)result[id]=entry;
 }return result;
}
export function hudPlacement({width,height,baseWidth,baseHeight,centerX,centerY,entry={}}){
 const scale=Math.min(entry.scale||1,Math.max(.01,(width-12)/Math.max(1,baseWidth)),Math.max(.01,(height-12)/Math.max(1,baseHeight)));
 const halfW=baseWidth*scale/2,halfH=baseHeight*scale/2;
 const cx=entry.x===undefined?centerX:clamp(entry.x*width,halfW+6,width-halfW-6),cy=entry.y===undefined?centerY:clamp(entry.y*height,halfH+6,height-halfH-6);
 return {scale,dx:entry.x===undefined?0:cx-centerX,dy:entry.y===undefined?0:cy-centerY,cx,cy};
}
export function createHudLayoutPreferences({storage=null}={}){
 let current={},presets=[],persisted=!!storage,serial=0;const listeners=new Set();
 try{const saved=JSON.parse(storage?.getItem(HUD_LAYOUT_KEY)??'null');if(saved?.version===1){current=normalizeHudLayout(saved.current);const seen=new Set();presets=(Array.isArray(saved.presets)?saved.presets:[]).slice(0,8).filter(p=>record(p)&&typeof p.id==='string'&&!seen.has(p.id)&&seen.add(p.id)).map(p=>({id:p.id.slice(0,64),name:String(p.name||'Meu HUD').trim().slice(0,32),widgets:normalizeHudLayout(p.widgets)}));}}catch{persisted=false;}
 const snapshot=()=>structuredClone({current,presets,persisted});
 function commit(){try{storage?.setItem(HUD_LAYOUT_KEY,JSON.stringify({version:1,current,presets}));persisted=!!storage;}catch{persisted=false;}for(const fn of listeners)fn(snapshot());return snapshot();}
 return {getState:snapshot,getStatus:()=>({persisted}),subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
  apply(layout){current=normalizeHudLayout(layout);return commit();},
  savePreset(name,layout,id=null){name=String(name??'').trim().slice(0,32);if(!name)return {ok:false,reason:'name'};const found=presets.find(p=>p.id===id);if(!found&&presets.length>=8)return {ok:false,reason:'limit'};const target=found||{id:'hud-'+Date.now().toString(36)+'-'+(++serial)};Object.assign(target,{name,widgets:normalizeHudLayout(layout)});if(!found)presets.push(target);commit();return {ok:true,id:target.id,persisted};},
  deletePreset(id){const index=presets.findIndex(p=>p.id===id);if(index<0)return false;presets.splice(index,1);commit();return true;}
 };
}
let singleton;
export function getHudLayoutPreferences(){if(!singleton){let storage=null;try{storage=globalThis.localStorage??null;}catch{}singleton=createHudLayoutPreferences({storage});}return singleton;}
