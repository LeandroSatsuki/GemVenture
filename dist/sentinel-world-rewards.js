// Display-only copy. Credit remains owned by core/cave-miniboss.
export function worldSentinelEvents(events,run){
 const m=run?.room?.miniboss,win=events.find(e=>e.type==='minibossDefeated'&&e.id===m?.enemyId),origin=events.find(e=>e.type==='proc'&&e.id==='miniboss-reward');
 if(!win||!m.rewardClaimed||m.state!=='defeated'||!origin||!Number.isFinite(origin.x)||!Number.isFinite(origin.y)||win.coins!==m.reward.coins||win.crystals!==m.reward.crystals)return events;
 const kill=events.find(e=>e.type==='kill'&&(e.id===win.id||e.minion?.id===win.id)),ordinary=Number.isSafeInteger(kill?.value)&&kill.value>0?kill.value:0,bonus=events.find(e=>e.type==='loot'&&e.heavy&&e.x===origin.x&&e.y===origin.y&&e.value===win.crystals);
 const items=events.filter(e=>e.type==='item'&&e.x===origin.x&&e.y===origin.y&&['blast','tonic','ward'].includes(e.item)&&Number.isSafeInteger(e.amount)&&e.amount>0);
 return events.map(e=>e===win?{...e,x:origin.x,y:origin.y,visualReward:{coins:win.coins+ordinary,crystals:win.crystals,kind:m.reward.kind,items:items.map(e=>({item:e.item,amount:e.amount}))}}:e===kill||e===bonus||items.includes(e)?{...e,sentinelRewardCovered:true}:e);
}
const images=new Map();
export function prepareSentinelRewardArt(){if(typeof Image==='undefined')return;for(const id of ['coin',0,1,2,3,'blast','tonic','ward'])if(!images.has(id)){const image=new Image();image.onload=()=>{};image.onerror=()=>{};image.src=typeof id==='string'?'assets/hud-v5/'+id+'.png':'assets/refuge-night-v3/gem-'+id+'.png';images.set(id,image);}}
export function drawSentinelRewardLabel(c,label){
 if(label.rewardIcon===undefined)return false;const image=images.get(label.rewardIcon),glyph=label.rewardIcon==='coin'?'●':'◇';c.font="600 18px Fredoka, 'Trebuchet MS', sans-serif";c.textAlign='left';const width=c.measureText(label.text).width,total=width+26,x=-total/2;
 if(image?.complete&&image.naturalWidth>0)c.drawImage(image,x,-18,20,22);else{c.fillStyle=label.color;c.fillText(glyph,x,-1);}c.lineWidth=3;c.strokeStyle='#020816';c.strokeText(label.text,x+26,0);c.fillStyle=label.color;c.fillText(label.text,x+26,0);return true;
}
