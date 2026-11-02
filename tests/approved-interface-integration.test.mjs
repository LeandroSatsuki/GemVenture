import test from 'node:test';import assert from 'node:assert/strict';
import {createState,SKILLS} from '../dist/core.js';import {talentNetwork} from '../dist/talents.js';import {TalentView} from '../dist/talent-view.js';
import {APPROVED_INTERFACE_COVERAGE,approvedEntityIcon,approvedCardArt,approvedGearSlotGlyph,approvedZagDie} from '../dist/approved-interface-icons.js';
import {approvedInterfaceIcons as icons,GV019_INTERFACE_POLICY} from '../dist/approved-interface-entry.js';
test('all 109 icon contexts resolve, preserving 104 approved bindings and monochrome extensions',()=>{
 let unchanged=0,extended=0;for(const [context,row]of Object.entries(APPROVED_INTERFACE_COVERAGE)){const slash=context.indexOf('/'),domain=context.slice(0,slash),id=context.slice(slash+1),actual=icons.glyph(domain,id);if(row.source){assert.equal(actual,approvedEntityIcon(domain,id));unchanged++;}else{assert.match(actual,/currentColor/);extended++;}}
 assert.equal(unchanged,104);assert.equal(extended,5);assert.equal(GV019_INTERFACE_POLICY.burnRepresentation,'monochrome');
 assert.match(icons.astral('embers'),/data-proposed-source="burn"/);assert.match(icons.boost('fire'),/data-proposed-source="burn"/);
 assert.doesNotMatch(approvedCardArt('ember'),/currentColor/,'approved colored card retains its own art');assert.throws(()=>icons.glyph('unknown','unknown'),RangeError);
});
test('root and every approved talent panel render without changing state',()=>{
 const s=createState(712),before=JSON.stringify(s),detail={innerHTML:''},totals={innerHTML:''},view=new TalentView();view.state=s;view.root={querySelectorAll:()=>[],querySelector:selector=>selector==='#webDetail'?detail:selector==='#webTotals'?totals:null};
 const nodes=talentNetwork(SKILLS).nodes;assert.equal(nodes.length,226);
 for(const n of nodes){view.selected=n.id;assert.doesNotThrow(()=>view.detail(),n.id);assert.match(detail.innerHTML,/data-approved-source=/);}
 view.selected='root';view.detail();assert.match(detail.innerHTML,/ESCOLHA UM NÓ VIZINHO/);assert.equal(JSON.stringify(s),before);
});
test('eight equipment slots and six die faces use explicit approved IDs',()=>{
 for(const id of ['pickaxe','helmet','chest','pants','boots','necklace','ring','backpack'])assert.match(approvedGearSlotGlyph(id),new RegExp('data-approved-source="icones/'+id+'"'));
 for(let face=1;face<=6;face++)assert.match(approvedZagDie(face),new RegExp('data-approved-source="zag/die-'+face+'"'));assert.throws(()=>approvedZagDie(0),RangeError);
});
