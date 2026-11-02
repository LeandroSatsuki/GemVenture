import test from 'node:test';
import assert from 'node:assert/strict';
import {buttonSoundRole,eventButton,IMPORTANT_UI_BUTTONS,DOMAIN_UI_BUTTONS,OWNED_UI_BUTTONS} from '../dist/ui-button-sound-map.js';
import {Music} from '../dist/audio.js';
import {attachAudioMix} from '../dist/audio-mix.js';
import {homeAudioContext} from './fixtures/home-audio.mjs';

const button=(group,extra={})=>({tagName:'BUTTON',disabled:false,closest:()=>null,getAttribute:()=>null,matches:s=>s===group,...extra});
test('ordinary navigation stays light; critical commands and domain outcomes keep separate roles',()=>{
 assert.equal(buttonSoundRole(button('')),'click');
 assert.equal(buttonSoundRole(button(IMPORTANT_UI_BUTTONS)),'primary');
 assert.equal(buttonSoundRole(button(DOMAIN_UI_BUTTONS)),'domain');
 assert.equal(buttonSoundRole(button(OWNED_UI_BUTTONS)),'owned');
 assert.equal(buttonSoundRole(button('',{disabled:true})),'silent');
 assert.equal(buttonSoundRole(button('',{getAttribute:()=> 'true'})),'silent');
});
test('shadow paths retain button identity and preserve the Tree sound owner',()=>{
 const b=button(''),host={dataset:{service:'tree'}},event={target:{},composedPath:()=>[{},b,{},host]};
 assert.equal(eventButton(event),b);assert.equal(buttonSoundRole(b,event),'owned');
 assert.equal(eventButton({target:{closest:()=>b}}),b);
});
test('ascent is finite, uses the existing SFX bus, respects mute, and leaves the beat clock intact',()=>{
 const music=new Music();music.ctx=homeAudioContext(1);music.enabled=true;music.master=music.ctx.createGain();
 const mixer=attachAudioMix(music);mixer.apply({enabled:true,sfxVolume:1,musicVolume:0});music.step=99;music.track=2;
 assert.equal(music.sfx('ascend'),true);assert.equal(music.effectVoices.size,3);assert.equal(music.voices.size,0);
 for(const voice of music.effectVoices){assert.equal(voice.connections[0].connections[0],music.sfxBus);assert.ok(voice.endAt<1.5);}
 assert.equal(music.step,99);assert.equal(music.track,2);music.ctx.advance(2);assert.equal(music.effectVoices.size,0);
 music.enabled=false;assert.equal(music.sfx('ascend'),false);
});
