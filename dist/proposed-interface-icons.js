// GV-019 / isolated proposal. New symbols are NOT approved catalogue v3.
import {approvedEntityIcon,approvedIconCoverage,approvedCardArt} from './approved-interface-icons.js';
export const PROPOSED_SYMBOLS_STATUS='awaiting-human-validation';
export const PROPOSED_CONTEXTS=Object.freeze({
  "astral/scholar": "xp",
  "astral/embers": "burn",
  "founder/echo": "random-card",
  "mission/points": "score",
  "boost/fire": "burn"
});
const symbols=Object.freeze({
  "xp": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M7 13Q18 8 29 14H35Q46 8 57 13V51Q45 46 35 53H29Q19 46 7 51Z M12 17Q21 14 29 20V46Q21 42 12 45Z M52 17Q43 14 35 20V46Q43 42 52 45Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "burn": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M32 6C33 18 49 20 53 34C57 48 46 58 33 58C19 58 9 49 10 38C11 29 17 26 20 19C24 24 25 28 24 32C31 26 35 19 32 6Z M33 33C33 39 26 42 26 47C26 52 29 54 34 54C39 54 43 50 42 45C41 41 37 37 33 33Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "random-card": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M14 7H38Q43 7 43 12V14H37V13H15V42H17V48H14Q9 48 9 43V12Q9 7 14 7Z\" fill=\"currentColor\"/><path d=\"M24 18H51Q56 18 56 23V53Q56 58 51 58H24Q19 58 19 53V23Q19 18 24 18Z M25 24V52H50V24Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/><path d=\"M31 32C31 24 45 25 45 32C45 37 38 36 38 41\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"4.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"38\" cy=\"47\" r=\"2.4\" fill=\"currentColor\"/></svg>",
  "score": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M19 14H10V20Q10 29 22 31M45 14H54V20Q54 29 42 31\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M19 8H45V24C45 33 39 39 32 39C25 39 19 33 19 24Z\" fill=\"currentColor\"/><rect x=\"29\" y=\"37\" width=\"6\" height=\"17\" rx=\"1\" fill=\"currentColor\"/><rect x=\"18\" y=\"52\" width=\"28\" height=\"6\" rx=\"2\" fill=\"currentColor\"/></svg>"
});
export function createProposedInterfaceResolver({burnRepresentation}={}){
 if(!['monochrome','approved-color'].includes(burnRepresentation))throw new TypeError('Explicitly choose monochrome or approved-color for burnRepresentation');
 const render=(domain,id)=>{
  const current=approvedIconCoverage(domain,id);if(current.source)return approvedEntityIcon(domain,id);
  const symbol=PROPOSED_CONTEXTS[domain+'/'+id];if(!symbol)throw new RangeError('Unresolved context: '+domain+'/'+id);
  if(symbol==='burn'&&burnRepresentation==='approved-color')return approvedCardArt('ember').replace('<svg ','<svg data-proposed-context="'+domain+'/'+id+'" ');
  return symbols[symbol].replace('<svg ','<svg class="glyph proposed-interface-symbol" aria-hidden="true" focusable="false" data-proposed-source="'+symbol+'" data-proposed-context="'+domain+'/'+id+'" ');
 };
 return Object.freeze({glyph:render,astral:id=>render('astral',id),founder:id=>render('founder',id),mission:id=>render('mission',id),boost:id=>render('boost',id),burnRepresentation,status:PROPOSED_SYMBOLS_STATUS});
}
