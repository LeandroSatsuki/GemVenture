// Transparent layout gaps pass through. A genuinely overflowing viewport still
// owns its scrollbar; child rows keep native wheel and keyboard behavior.
export function mountHudHitRegions(root){
 const win=root.ownerDocument.defaultView,regions=[...root.querySelectorAll('.hud5-details,.hud5-buffs,.hud5-cards')];
 let pending=0,disposed=false;const observed=new Set();
 const resize=win.ResizeObserver?new win.ResizeObserver(schedule):null;
 function measure(){
  pending=0;if(disposed)return;
  for(const region of regions){
   for(const node of [region,...region.children])if(resize&&!observed.has(node)){resize.observe(node);observed.add(node);}
   const scrollable=String(region.clientHeight>0&&region.scrollHeight>region.clientHeight+1);
   if(region.dataset.hudScrollable!==scrollable)region.dataset.hudScrollable=scrollable;
  }
  for(const node of [...observed])if(!regions.includes(node)&&!regions.some(r=>r.contains(node))){resize.unobserve(node);observed.delete(node);}
 }
 function schedule(){if(!disposed&&!pending)pending=win.requestAnimationFrame(measure);}
 const structure=win.MutationObserver?new win.MutationObserver(schedule):null;
 for(const region of regions)structure?.observe(region,{childList:true,subtree:true});
 measure();return {dispose(){disposed=true;if(pending)win.cancelAnimationFrame(pending);resize?.disconnect();structure?.disconnect();for(const r of regions)delete r.dataset.hudScrollable;observed.clear();}};
}
