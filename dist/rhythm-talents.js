// Additional passives are opt-in purchases, never applied to an old save automatically.
export function applyRhythmTalents(s){
 const r=s.run;if(!r||r.combo<=0)return [];
 const effects=[],beat=Math.max(r.beat,r.acted);
 if(s.unlocked.includes('prism-shelter')&&r.combo%12===0){r.guardUntil=Math.max(r.guardUntil??-1,beat+2);effects.push({type:'proc',id:'prism-shelter',name:'CASCA DE PRISMA',color:'#2fbfcd'});}
 if(s.unlocked.includes('breath-encore')&&r.combo%16===0){r.rhythm=Math.min(100,r.rhythm+8);effects.push({type:'proc',id:'breath-encore',name:'BIS DE FÔLEGO',color:'#a2e66f'});}
 r.events.push(...effects);return effects;
}
