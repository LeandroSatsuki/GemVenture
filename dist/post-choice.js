import {POST_ACTION_ICONS} from './post-choice-data.js';
export function resolveChosenPresentation({view}={}){
 if(!view||view.context?.mode==='abyss'||['inactive','pending'].includes(view.status))return null;
 if(view.confirmed!==true)return null;
 if(view.status==='legacy'||view.status==='unavailable')return {status:'missing'};
 if(view.status!=='chosen'||!view.card||typeof view.card.artId!=='string')return null;
 const {id,name,text,role,icon,color,artId}=view.card;
 return {status:'identified',id,name,text,role,icon,color,artId};
}
export function decoratePostChoice(root,presentation){
 const card=resolveChosenPresentation(presentation);if(!root)return false;if(!card){root.classList.remove('gv-post-choice');return false;}
 const doc=root.ownerDocument,chosen=root.querySelector('#chosenCard');if(!chosen)return false;
 const node=(tag,cls,text)=>{const n=doc.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 root.classList.add('gv-post-choice');
 const caption=root.querySelector('.floor-loot-label');if(caption?.textContent.trim()==='NESTE ANDAR')caption.textContent='NESTE ANDAR VOCÊ GANHOU:';
 const subtitle=root.querySelector('#clearSubtitle');if(subtitle){const text=subtitle.textContent,match=text.match(/^(VIDA(?: MANTIDA)?\s*[·:]?\s*)([\d.,]+)(\s*\/\s*[\d.,]+)$/);if(match)subtitle.replaceChildren(doc.createTextNode(match[1]),node('b','post-life-current',match[2]),doc.createTextNode(match[3]));}
 const copy=node('div','post-equipped-copy');copy.append(node('strong','post-equipped-label',card.status==='identified'?'CARTA EQUIPADA!':'CARTA ESCOLHIDA'));
 if(card.status==='identified'){
  const face=node('div','post-chosen-face');face.style.setProperty('--chosen-color',card.color);// Only the trusted approvedLargeCardArt renderer supplies this markup.
  if(typeof presentation.renderCardArt==='function'){face.innerHTML=presentation.renderCardArt(card.artId);const image=face.querySelector('img');if(image)image.classList.add('post-chosen-art');}
  copy.append(node('h3','',card.name),node('p','',card.text));
  // Host-computed current build effect, never a reconstructed choice delta.
  if(typeof presentation.currentEffectText==='string'&&presentation.currentEffectText.trim()){
   const effect=node('div','post-chosen-detail');
   effect.append(node('strong','post-effect-label','EFEITO ATUAL'),node('span','post-effect-text',presentation.currentEffectText.trim()));copy.append(effect);
  }
  const stage=node('div','post-card-stage');stage.append(face);
  chosen.replaceChildren(stage,copy);
 }else{copy.append(node('p','post-missing-identity','DETALHES INDISPONÍVEIS'));chosen.replaceChildren(copy);}
 chosen.dataset.identityStatus=card.status;
 for(const[id,label,sub]of [['descend','DESCER','IR PARA O PRÓXIMO ANDAR'],['safeReturn','VOLTAR À BASE','ENCERRAR A EXPEDIÇÃO']]){
  const button=root.querySelector('#'+id);if(!button)continue;
  const image=node('img','post-action-icon '+id);image.src=POST_ACTION_ICONS[id];image.alt='';image.setAttribute('aria-hidden','true');
  const text=node('span','post-action-copy');text.append(node('strong','',label),node('small','',sub));button.replaceChildren(image,text);
 }
 return true;
}
