export function createResumeView(doc){
 const cover=doc.createElement('div');cover.className='resume-countdown';cover.hidden=true;cover.setAttribute('role','status');cover.setAttribute('aria-label','Retomando a expedição');cover.innerHTML='<strong></strong>';
 const badge=doc.createElement('div');badge.className='resume-rhythm';badge.hidden=true;badge.setAttribute('role','progressbar');badge.setAttribute('aria-label','Proteção de ritmo na retomada');badge.setAttribute('aria-valuemin','0');badge.setAttribute('aria-valuemax','100');badge.innerHTML='<span aria-hidden="true">♬</span><i><b></b></i>';
 doc.getElementById('stage').append(cover,badge);let number=0;
 return {render(value,remaining=0){const anchor=doc.querySelector("#hud5Root .combo");if(anchor&&badge.parentElement!==anchor)anchor.append(badge);cover.hidden=!value;badge.hidden=!!value||remaining<=0;if(number!==value){number=value;cover.querySelector('strong').textContent=value||'';}badge.querySelector('b').style.width=Math.max(0,Math.min(1,remaining))*100+'%';badge.setAttribute('aria-valuenow',String(Math.round(remaining*100)));},dispose(){cover.remove();badge.remove();}};
}
