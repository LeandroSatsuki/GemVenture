import {BIOME_ART} from './palette.js';
export const EXPEDITION_SUPPORT=Object.freeze({points:Object.freeze([[32,144],[304,114],[504,144],[232,174]].map(Object.freeze)),thickness:4,contactMargin:2});
// Only the backdrop changes. Approved nested SVGs/images and the airborne bat group stay exact.
export function composeExpeditionScene(original,biome,composition='panel'){
 if(!['panel','support'].includes(composition))throw new TypeError('Unknown expedition composition');
 const end=original.indexOf('>')+1,start=original.indexOf('<svg x="',end);if(!start||start<end||!original.endsWith('</svg>'))throw new Error('Expedition scene contract changed');
 const b=BIOME_ART[biome];if(!b)throw new RangeError('Unknown expedition biome');
 let backdrop='<rect width="560" height="180" rx="12" fill="'+b.floor+'"/>';
 if(composition==='support'){
  const [left,back,right,front]=EXPEDITION_SUPPORT.points,t=EXPEDITION_SUPPORT.thickness,pt=p=>p.join(' '),down=p=>[p[0],p[1]+t];
  backdrop+='<g stroke="'+b.edge+'" stroke-width="1.5" stroke-linejoin="round"><path d="M'+pt(left)+'L'+pt(front)+'L'+pt(down(front))+'L'+pt(down(left))+'Z" fill="'+b.shade+'"/><path d="M'+pt(front)+'L'+pt(right)+'L'+pt(down(right))+'L'+pt(down(front))+'Z" fill="'+b.shade+'"/><path d="M'+pt(left)+'L'+pt(back)+'L'+pt(right)+'L'+pt(front)+'Z" fill="'+b.rock+'"/></g>';
 }
 return original.slice(0,end)+backdrop+original.slice(start);
}
