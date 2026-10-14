// UI-only protection: never uses the expedition clock or changes saved rewards.
export class ChoiceGuard{
 constructor(){this.held=new Set();this.active=false;this.until=0;this.last=0;}
 lock(now,delay=1000){this.active=true;this.until=now+delay;this.last=now;}
 press(id,now){this.held.add(id);if(this.active)this.last=now;}
 release(id,now){this.held.delete(id);if(this.active)this.last=now;}
 ready(now){if(!this.active)return true;if(now>=this.until&&now-this.last>=400&&!this.held.size){this.active=false;return true;}return false;}
 reset(){this.held.clear();this.active=false;}
}
