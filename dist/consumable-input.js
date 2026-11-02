// A physical event may reach more than one adapter. Never turn it into two uses.
// No timer/cooldown: distinct presses and clicks remain independent.
const accepted=new WeakSet();
export function acceptConsumableInput(input){
 if(input==null)return true;
 if(typeof input!=='object'||input.repeat||accepted.has(input))return false;
 accepted.add(input);return true;
}
export function bindConsumableButton(button,activate){
 button.onclick=event=>{if(!button.disabled)activate(event);};
 // Own native Enter/Space activation so a held key cannot synthesize clicks.
 button.onkeydown=event=>{
  if(!['Enter','Space'].includes(event.code))return;
  event.preventDefault();event.stopPropagation();
  if(!event.repeat&&!button.disabled)activate(event);
 };
 button.onkeyup=event=>{if(['Enter','Space'].includes(event.code)){event.preventDefault();event.stopPropagation();}};
}
