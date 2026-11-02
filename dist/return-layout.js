// Presentation only. ReturnScreen remains the owner of pagination and actions.
export const RETURN_ART=Object.freeze({
  "return-dungeon-scene": "assets/return-art/return-dungeon-scene-v01.png",
  "return-summary-medal": "assets/return-art/return-summary-medal-v01.png",
  "return-next-arrow": "assets/return-art/return-next-arrow-v01.png"
}); // Preview release; see contracts/ART-RECEIPT.json.
const fmt=n=>new Intl.NumberFormat('pt-BR').format(Math.max(0,Math.floor(Number(n)||0)));
export function decorateReturn(dialog,result,page,total){
 const doc=dialog.ownerDocument,heading=dialog.querySelector('.return-heading'),grid=dialog.querySelector('.reward-grid'),bottom=dialog.querySelector('.return-bottom'),button=dialog.querySelector('#rewardOK');
 const make=(tag,cls,text)=>{const n=doc.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const art=(id,label)=>{const n=make('span','return-art-slot '+id);n.dataset.artSlot=id;if(RETURN_ART[id]){const img=make('img','');img.src=RETURN_ART[id];img.alt='';n.append(img);n.setAttribute('aria-hidden','true');}else{n.classList.add('art-pending');n.append(make('small','',label+' · arte em produção'));}return n;};
 dialog.classList.add('gv-return-loot');dialog.setAttribute('aria-labelledby','returnLootTitle');
 const title=heading.querySelector('h2');title.id='returnLootTitle';
 const header=make('div','return-header');heading.replaceWith(header);header.append(heading,art('return-dungeon-scene','Cena da dungeon'));
 const saved=heading.querySelector('p');saved.replaceChildren(make('b','saved-value',fmt(result.kept)+' salvas'),doc.createTextNode(' · '),make('b','lost-value',fmt(result.lost)+' perdidas'));
 const secured=heading.querySelector('.secured-summary');if(secured)secured.textContent=secured.textContent.replace(/^↑\s*/, '');
 grid.style.setProperty('--return-card-count',String(Math.max(1,Math.min(4,total-page*4))));
 if(total===0)grid.append(make('p','return-empty','Nenhum saque nesta descida.'));
 const summary=bottom.querySelector(':scope > span');summary.classList.add('return-summary');summary.replaceChildren();
 const primary=make('span','return-sequence');primary.append(doc.createTextNode('SEQUÊNCIA '),make('b','',fmt(result.peak)+'×'),doc.createTextNode(' · '+(page+1)+'/'+Math.max(1,Math.ceil(total/4))));
 summary.append(primary,make('small','',fmt(result.earnedStars)+' estrelas guardadas · '+fmt(result.score)+' pontos'));
 bottom.prepend(art('return-summary-medal','Medalha'));
 const more=(page+1)*4<total;button.textContent=more?'PRÓXIMOS':'GUARDAR TUDO';
 if(more&&RETURN_ART['return-next-arrow'])button.append(art('return-next-arrow','Seta'));
 button.dataset.arrowStatus=more?(RETURN_ART['return-next-arrow']?'released':'pending-art'):'not-applicable';
 // Resource identity comes from the active collected-material catalog.
}
