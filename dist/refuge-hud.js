import {MATERIALS} from './materials.js';
import {collectedGemSvg} from './collected-gems.js';
const exact=new Intl.NumberFormat('pt-BR'),compact=new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:1});
const renderedWallets=new WeakMap();

export function resourceWalletMarkup(materials,idPrefix='material-'){
 return MATERIALS.map((m,i)=>{
  const amount=materials[i]??0,abbreviated=amount>=10000,label=exact.format(amount);
  return '<div class="resource-balance" tabindex="0" role="group" style="--mineral:'+m.color+'" aria-label="'+m.name+': '+label+'"><span class="resource-icon" aria-hidden="true">'+collectedGemSvg(i)+'</span><b id="'+idPrefix+i+'">'+(abbreviated?compact.format(amount):label)+'</b><span class="resource-name" aria-hidden="true">'+m.name+'</span><span class="resource-tooltip" aria-hidden="true">'+m.name+(abbreviated?'<small>'+label+'</small>':'')+'</span></div>';
 }).join('');
}
export function updateResourceWallet(element,materials){
 const key=materials.join('|');if(renderedWallets.get(element)===key)return false;
 if(element.id==='materialWallet')element.classList.add('gv-r2');
 const focused=typeof document==='undefined'?-1:[...element.children].indexOf(document.activeElement);
 element.innerHTML=resourceWalletMarkup(materials);renderedWallets.set(element,key);
 if(focused>=0)element.children[focused]?.focus({preventScroll:true});return true;
}
