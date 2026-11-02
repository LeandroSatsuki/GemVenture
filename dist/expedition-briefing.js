import {topicById} from './learning-path.js';

// Preparation is voluntary and may explain basic systems before their first use.
// Detailed lessons keep their own availability and remain in the library.
const basics=['movement','breath','combo','items','cards','camp','return','discoveries'];
export const isExpeditionTopic=id=>id==='expedition'||topicById(id)?.group==='Caverna';
export function expeditionBriefing(profile,mode='floors'){
 const ids=[...basics];
 if(profile.best>=2)ids.push('sentinel');
 if(profile.best>=5)ids.push('boss');
 if(mode==='abyss')ids.push('orbs','abyss');
 return ids.map(id=>{const t=topicById(id);return {topic:id,title:t.name,text:t.steps.map(s=>s.text).join(' '),image:t.image};});
}
