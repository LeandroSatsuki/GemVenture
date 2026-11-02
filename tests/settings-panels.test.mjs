import {UI_PERCENT} from '../dist/ui-display.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createBossHelpPreferences,BOSS_HELP_STORAGE_KEY} from '../dist/boss-help-preferences.js';
import {bindSettingsPanels} from '../dist/settings-panels.js';
import {VIDEO_CONTROLS,VIDEO_DEFAULTS,VIDEO_STORAGE_KEY,createVideoPreferences} from '../dist/video-preferences.js';

function fixture(){
 const markup=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),nodes=[];
 class Node extends EventTarget{
  constructor(attrs){super();this.attrs=attrs;this.id=attrs.id;this.dataset={};this.value=attrs.value??'';this.hidden='hidden' in attrs;for(const [key,value] of Object.entries(attrs))if(key.startsWith('data-'))this.dataset[key.slice(5).replace(/-([a-z])/g,(_,a)=>a.toUpperCase())]=value;}
  setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k]??null;}focus(){focused=this;}
 }
 let focused,changes=0;
 for(const tag of markup.matchAll(/<(?:input|button|section|output)\b([^>]+)>/g)){
  const attrs={};for(const a of tag[1].matchAll(/([\w-]+)="([^"]*)"|(hidden|checked)(?=\s|$)/g))attrs[a[1]??a[3]]=a[2]??'';if(attrs.id?.startsWith('settings')||attrs['data-video-layer'])nodes.push(new Node(attrs));
 }
 const matching=selector=>selector.startsWith('#')?nodes.filter(n=>n.id===selector.slice(1)):nodes.filter(n=>{const match=selector.match(/^\[([^=\]]+)(?:="([^"]+)")?\]$/);return match&&(match[1] in n.attrs)&&(match[2]===undefined||n.attrs[match[1]]===match[2]);});
 const settings={querySelector:s=>matching(s)[0],querySelectorAll:matching};
 const saved=new Map([['gemventure-save-v2','player-save-unchanged']]),writes=[];
 const video=createVideoPreferences({storage:{getItem:k=>saved.get(k),setItem:(k,v)=>{writes.push(k);saved.set(k,v);}}});
 const help=createBossHelpPreferences({storage:{getItem:k=>saved.get(k),setItem:(k,v)=>{writes.push(k);saved.set(k,v);}}});
 const audio={enabled:false,musicVolume:.37,sfxVolume:.82};let unlocks=0;
 const services={audio:{controller:{set:patch=>Object.assign(audio,patch),unlock:async()=>{unlocks++;}}}};
 const binding=bindSettingsPanels(settings,{services,video,help,onChange:()=>changes++});
 const node=id=>settings.querySelector('#'+id),event=(id,type)=>node(id).dispatchEvent(new Event(type));
 return {binding,video,help,node,event,settings,audio,writes,saved,get changes(){return changes;},get focused(){return focused;},get unlocks(){return unlocks;}};
}
test('settings consume every canonical light range and isolate video reset from audio and the game save',()=>{
 const f=fixture();f.binding.open();
 for(const c of VIDEO_CONTROLS){const input=f.settings.querySelector('[data-video-key="'+c.key+'"]');for(const name of ['min','max','step'])assert.equal(Number(input.getAttribute(name)),c[name]);assert.equal(Number(input.value),VIDEO_DEFAULTS[c.key]);}
 f.node('settingsNeon').value='0';f.event('settingsNeon','input');assert.equal(f.video.getState().neon_cristais_pct,0);
 const layer=f.settings.querySelector('[data-video-layer="nevoa"]');layer.checked=false;layer.dispatchEvent(new Event('change'));assert.deepEqual(f.video.getState().camadas,{braseiros:true,cristais:true,nevoa:false});
 f.node('settingsUiScale').value='150';f.event('settingsVideoReset','click');assert.deepEqual(f.video.getState(),VIDEO_DEFAULTS);assert.equal(f.node('settingsUiScale').value,'150');assert.deepEqual(f.audio,{enabled:false,musicVolume:.37,sfxVolume:.82});
 assert(f.writes.every(k=>k===VIDEO_STORAGE_KEY));assert.equal(f.saved.get('gemventure-save-v2'),'player-save-unchanged');
 f.event('settingsAudioReset','click');assert.deepEqual(f.audio,{enabled:true,musicVolume:1,sfxVolume:1});assert.equal(f.unlocks,1);assert.deepEqual(f.video.getState(),VIDEO_DEFAULTS);
});
test('video subscription follows open/close/dispose; repeated opens never duplicate updates',()=>{
 const f=fixture();f.binding.open();f.binding.open();const before=f.changes;f.video.set({escuridao_pct:0});assert.equal(f.changes,before+1);assert.equal(f.node('settingsDarkValue').textContent,'0%');
 f.binding.close();f.video.set({escuridao_pct:40});assert.equal(f.changes,before+1);f.binding.open();assert.equal(f.node('settingsDarkValue').textContent,'40%');
 f.binding.dispose();const revision=f.video.getRevision();f.node('settingsDark').value='90';f.event('settingsDark','input');assert.equal(f.video.getRevision(),revision);f.video.set({escuridao_pct:20});assert.equal(f.node('settingsDarkValue').textContent,'40%');
});
test('tabs keep values, expose only the selected panel/reset and support keyboard navigation',()=>{
 const f=fixture();f.binding.open();f.event('settingsAudioTab','click');assert.equal(f.node('settingsAudioPanel').hidden,false);assert.equal(f.node('settingsVideoPanel').hidden,true);assert.equal(f.node('settingsVideoReset').hidden,true);assert.equal(f.node('settingsAudioReset').hidden,false);
 const key=new Event('keydown',{cancelable:true});key.key='End';f.node('settingsAudioTab').dispatchEvent(key);assert.equal(f.binding.focusTarget().id,'settingsInterfaceTab');assert.equal(f.focused.id,'settingsInterfaceTab');assert.equal(f.node('settingsInterfacePanel').hidden,false);assert.equal(f.node('settingsUiReset').hidden,false);assert.equal(f.node('settingsUiScale').value,String(UI_PERCENT.default));
 assert.equal(f.node('settingsAudioTab').getAttribute('tabindex'),'-1');f.binding.close();f.binding.open();assert.equal(f.binding.focusTarget().id,'settingsInterfaceTab');
});

test('help choice persists immediately and light/audio resets never change it',()=>{
 const f=fixture();f.binding.open();assert.equal(f.node('settingsBossHelp').checked,false);
 f.node('settingsBossHelp').checked=true;f.event('settingsBossHelp','change');assert.equal(f.help.getState().enabled,true);assert.equal(JSON.parse(f.saved.get(BOSS_HELP_STORAGE_KEY)).enabled,true);
 f.event('settingsVideoReset','click');f.event('settingsAudioReset','click');assert.equal(f.help.getState().enabled,true);assert.equal(f.saved.get('gemventure-save-v2'),'player-save-unchanged');
});
test('help subscriptions follow settings lifecycle and disposal removes its input binding',()=>{
 const f=fixture();f.binding.open();f.binding.open();const before=f.changes;f.help.setEnabled(true);assert.equal(f.changes,before+1);assert.equal(f.node('settingsBossHelp').checked,true);
 f.binding.close();f.help.setEnabled(false);assert.equal(f.changes,before+1);f.binding.open();assert.equal(f.node('settingsBossHelp').checked,false);
 f.binding.dispose();f.node('settingsBossHelp').checked=true;f.event('settingsBossHelp','change');assert.equal(f.help.getState().enabled,false);
});
