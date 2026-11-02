import {collectedGemSvg} from './collected-gems.js';
// UI projection only: the catalog owns eligibility and the existing art modules own icons.
const color=value=>/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(String(value??''))?value:'#b9c9e3';
export function presentRewardCatalog(catalog,{approvedConsumableGlyph,approvedCardArt,glyph,approvedInterfaceIcons}={}){
  if(!catalog||!Array.isArray(catalog.entries))return catalog;
  const entries=catalog.entries.map(entry=>{
    const a=entry.asset??{};
    let artHtml='';
    if(a.kind==='existing-module-art'){
      if(a.module==='collected-gems.js'&&a.export==='collectedGemSvg')artHtml=collectedGemSvg(...(a.args??[]));
      else if(a.module==='approved-interface-icons.js'&&a.export==='approvedConsumableGlyph')artHtml=approvedConsumableGlyph?.(...(a.args??[]))??'';
      else if(a.module==='approved-interface-icons.js'&&a.export==='approvedCardArt')artHtml=approvedCardArt?.(...(a.args??[]))??'';
      else if(a.module==='ui-art.js'&&a.export==='glyph'){
        const kind=a.args?.[0];
        artHtml=['coin','star'].includes(kind)?`<svg viewBox="0 0 128 128" aria-hidden="true"><image href="assets/refuge-night-v3/${kind}.png" width="128" height="128"/></svg>`:glyph?.(...(a.args??[]))??'';
      }
      else if(a.module==='approved-interface-entry.js'&&a.export==='approvedInterfaceIcons'&&a.method==='astral')artHtml=approvedInterfaceIcons?.astral?.(...(a.args??[]))??'';
    }else if(a.kind==='existing-css-art'&&a.selector==='.record-cover'){
      artHtml=`<span class="record-cover" style="--record:${color(a.color)}" aria-hidden="true"><i></i><b>♫</b></span>`;
    }
    return {...entry,artHtml};
  });
  return {...catalog,entries};
}

// Call after each host liftPresentationModel build, including floor/profile changes.
export function attachSelectedFloorRewards(state,vm,selectedDungeonRewards,artSources){
  const catalog=presentRewardCatalog(selectedDungeonRewards(state,vm.selectedFloor,{scope:'floor',context:'next-attempt'}),artSources);
  return {...vm,selected:{...vm.selected,rewards:{...vm.selected?.rewards,catalog}}};
}
